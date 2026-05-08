<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Multicim;

class CotizacionController extends Controller
{
    private function normalizarMedidaTanque(array $detalle): array
    {
        $medidas = $detalle['medida_tanque'] ?? null;

        if (is_string($medidas)) {
            $medidas = [$medidas];
        }

        if (!is_array($medidas)) {
            $medidas = [];
        }

        $medidas = array_values(array_filter(array_map(function ($valor) {
            return trim((string) $valor);
        }, $medidas), function ($valor) {
            return $valor !== '';
        }));

        if (empty($medidas)) {
            $medidaUnica = trim((string)($detalle['medida_tanque'] ?? ''));
            if ($medidaUnica !== '') {
                $medidas = [$medidaUnica];
            }
        }

        return $medidas;
    }

    /**
     * Listar todas las cotizaciones
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cotizacion::with(['cliente', 'creador', 'empresa']);

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('tipo')) {
            $query->porTipo($request->tipo);
        }

        if ($request->has('search')) {
            $query->buscar($request->search);
        }

        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha_emision', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha_emision', '<=', $request->fecha_hasta);
        }

        // Ordenar
        $query->orderBy('fecha_emision', 'desc');

        $cotizaciones = $query->get();

        // Formatear respuesta
        $data = $cotizaciones->map(function($cot) {
            return [
                'id' => $cot->id,
                'numero' => $cot->numero_cotizacion,
                'empresa_emisora' => $cot->empresa->alias_empresa ?? 'N/A',
                'id_cliente' => $cot->id_cliente,
                'cliente_nombre' => $cot->cliente->nombre_empresa ?? 'N/A',
                'fecha_emision' => $cot->fecha_emision->format('Y-m-d'),
                'tipo' => $cot->tipo_cotizacion,
                'subtotal' => (float) $cot->subtotal,
                'igv' => (float) $cot->igv,
                'total' => (float) $cot->total,
                'incluye_igv' => (bool) $cot->incluye_igv,
                'observaciones' => $cot->observaciones,
                'estado' => $cot->estado,
                'creador' => $cot->creador->nombre_completo ?? 'N/A'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Obtener una cotización específica
     */
    public function show($id): JsonResponse
    {
        $cotizacion = Cotizacion::with(['cliente', 'creador', 'detalles.servicio', 'detalles.producto', 'detalles.catalogoCapAud', 'detalles.planta', 'beneficios.catalogoCapAud'])
                                ->find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cotizacion
        ]);
    }

    /**
     * Crear una nueva cotización
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cliente' => 'required|exists:cliente,id',
            'id_multicim' => 'required|exists:multicim,id',
            'tipo_cotizacion' => 'required|in:Servicio,Producto,Capacitacion,Asesoria,Auditoria',
            'incluye_igv' => 'sometimes|boolean',
            'observaciones' => 'nullable|string',
            'propuesta_tecnica' => 'nullable|string',
            'objetivos_asesoria' => 'nullable|string',
            'receta_servicio' => 'nullable|array',
            'exponentes_ids' => 'nullable|array',
            'exponentes_ids.*' => 'integer|exists:exponentes,id',
            'beneficios_servicio' => 'nullable|array',
            'beneficios_servicio.*.id_catalogo_cap_aud' => 'nullable|integer|exists:catalogo_capacitacion_auditoria,id',
            'beneficios_servicio.*.nombre_beneficio' => 'required_with:beneficios_servicio|string|max:255',
            'beneficios_servicio.*.modalidad_sugerida' => 'nullable|string|max:80',
            'beneficios_servicio.*.horas_capacitacion' => 'nullable|numeric|min:0',
            'beneficios_servicio.*.precio_referencial' => 'nullable|numeric|min:0',
            'beneficios_servicio.*.observacion' => 'nullable|string|max:255',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_servicio' => 'nullable|exists:servicios,id',
            'detalles.*.id_producto' => 'nullable|exists:productos,id',
            'detalles.*.id_catalogo_cap_aud' => 'nullable|exists:catalogo_capacitacion_auditoria,id',
            'detalles.*.descripcion_manual' => 'nullable|string',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.frecuencia_sugerida' => 'nullable|string',
            'detalles.*.modalidad_sugerida' => 'nullable|string',
            'detalles.*.op_tecnicos' => 'nullable|string|max:255',
            'detalles.*.supervisor' => 'nullable|string|max:255',
            'detalles.*.medida_tanque' => 'nullable',
            'detalles.*.fosfina_producto' => 'nullable|string|max:255',
            'detalles.*.fosfina_cantidad' => 'nullable|string|max:50',
            'detalles.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'detalles.*.id_cliente_planta_area' => 'nullable|array',
            'detalles.*.id_cliente_planta_area.*' => 'integer|exists:cliente_planta_area,id',
            'detalles.*.horas_capacitacion' => 'nullable|numeric|min:0',
            'detalles.*.num_participantes' => 'nullable|integer|min:1',
            'detalles.*.fecha_servicio' => 'nullable|date',
            'detalles.*.meses_implementacion' => 'nullable|integer|min:1',
            'detalles.*.frecuencia_visita' => 'nullable|array',
            'detalles.*.horario_auditoria' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            // Calcular totales
            $subtotal = 0;
            foreach ($validated['detalles'] as $detalle) {
                $subtotal += $detalle['cantidad'] * $detalle['precio_unitario'];
            }

            $incluyeIgv = $validated['incluye_igv'] ?? true;
            $igv = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
            $total = $subtotal + $igv;

            // Observación automática si no incluye IGV
            $observaciones = $validated['observaciones'] ?? null;
            if (!$incluyeIgv && empty($observaciones)) {
                $observaciones = 'Esta cotización no incluye IGV.';
            } elseif (!$incluyeIgv && $observaciones) {
                $observaciones = $observaciones . ' | Nota: Esta cotización no incluye IGV.';
            }

            // Crear cotización
            $cotizacion = Cotizacion::create([
                'numero_cotizacion' => Cotizacion::generarNumero(),
                'id_cliente' => $validated['id_cliente'],
                'id_multicim' => $validated['id_multicim'],
                'fecha_emision' => now(),
                'id_personal_creador' => $request->user()?->id ?? 1,
                'estado' => 'Pendiente',
                'tipo_cotizacion' => $validated['tipo_cotizacion'],
                'incluye_igv' => $incluyeIgv,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'observaciones' => $observaciones,
                'propuesta_tecnica' => $validated['propuesta_tecnica'] ?? null,
                'objetivos_asesoria' => $validated['objetivos_asesoria'] ?? null,
                'receta_servicio' => $validated['receta_servicio'] ?? null,
                'exponentes_ids' => $validated['exponentes_ids'] ?? null,
            ]);

            // Crear detalles
            foreach ($validated['detalles'] as $detalle) {
                CotizacionDetalle::create([
                    'id_cotizacion' => $cotizacion->id,
                    'es_servicio_extra' => $detalle['es_servicio_extra'] ?? false,
                    'id_servicio' => $detalle['id_servicio'] ?? null,
                    'id_producto' => $detalle['id_producto'] ?? null,
                    'id_catalogo_cap_aud' => $detalle['id_catalogo_cap_aud'] ?? null,
                    'descripcion_manual' => $detalle['descripcion_manual'] ?? null,
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'frecuencia_sugerida' => $detalle['frecuencia_sugerida'] ?? null,
                    'modalidad_sugerida' => $detalle['modalidad_sugerida'] ?? null,
                    'op_tecnicos' => $detalle['op_tecnicos'] ?? null,
                    'supervisor' => $detalle['supervisor'] ?? null,
                    'medida_tanque' => $this->normalizarMedidaTanque($detalle) ?: null,
                    'fosfina_producto' => $detalle['fosfina_producto'] ?? null,
                    'fosfina_cantidad' => $detalle['fosfina_cantidad'] ?? null,
                    'id_cliente_planta' => $detalle['id_cliente_planta'] ?? null,
                    'id_cliente_planta_area' => $detalle['id_cliente_planta_area'] ?? null,
                    'horas_capacitacion' => $detalle['horas_capacitacion'] ?? null,
                    'num_participantes' => $detalle['num_participantes'] ?? null,
                    'fecha_servicio' => $detalle['fecha_servicio'] ?? null,
                    'meses_implementacion' => $detalle['meses_implementacion'] ?? null,
                    'frecuencia_visita' => $detalle['frecuencia_visita'] ?? null,
                    'horario_auditoria' => $detalle['horario_auditoria'] ?? null,
                ]);
            }

            if (($validated['tipo_cotizacion'] ?? '') === 'Servicio') {
                $beneficios = $validated['beneficios_servicio'] ?? [];
                foreach ($beneficios as $i => $beneficio) {
                    $cotizacion->beneficios()->create([
                        'id_catalogo_cap_aud' => $beneficio['id_catalogo_cap_aud'] ?? null,
                        'nombre_beneficio' => $beneficio['nombre_beneficio'],
                        'modalidad_sugerida' => $beneficio['modalidad_sugerida'] ?? null,
                        'horas_capacitacion' => $beneficio['horas_capacitacion'] ?? null,
                        'precio_referencial' => $beneficio['precio_referencial'] ?? 0,
                        'observacion' => $beneficio['observacion'] ?? null,
                        'orden' => $i + 1,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cotización creada exitosamente',
                'data' => $cotizacion->load('detalles', 'empresa')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la cotización: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una cotización existente
     */
    public function update(Request $request, $id): JsonResponse
    {
        $cotizacion = Cotizacion::find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'id_cliente' => 'required|exists:cliente,id',
            'id_multicim' => 'required|exists:multicim,id',
            'tipo_cotizacion' => 'required|in:Servicio,Producto,Capacitacion,Asesoria,Auditoria',
            'fecha_emision' => 'nullable|date',
            'incluye_igv' => 'sometimes|boolean',
            'observaciones' => 'nullable|string',
            'propuesta_tecnica' => 'nullable|string',
            'objetivos_asesoria' => 'nullable|string',
            'receta_servicio' => 'nullable|array',
            'exponentes_ids' => 'nullable|array',
            'exponentes_ids.*' => 'integer|exists:exponentes,id',
            'beneficios_servicio' => 'nullable|array',
            'beneficios_servicio.*.id_catalogo_cap_aud' => 'nullable|integer|exists:catalogo_capacitacion_auditoria,id',
            'beneficios_servicio.*.nombre_beneficio' => 'required_with:beneficios_servicio|string|max:255',
            'beneficios_servicio.*.modalidad_sugerida' => 'nullable|string|max:80',
            'beneficios_servicio.*.horas_capacitacion' => 'nullable|numeric|min:0',
            'beneficios_servicio.*.precio_referencial' => 'nullable|numeric|min:0',
            'beneficios_servicio.*.observacion' => 'nullable|string|max:255',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_servicio' => 'nullable|exists:servicios,id',
            'detalles.*.id_producto' => 'nullable|exists:productos,id',
            'detalles.*.id_catalogo_cap_aud' => 'nullable|exists:catalogo_capacitacion_auditoria,id',
            'detalles.*.descripcion_manual' => 'nullable|string',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.frecuencia_sugerida' => 'nullable|string',
            'detalles.*.modalidad_sugerida' => 'nullable|string',
            'detalles.*.op_tecnicos' => 'nullable|string|max:255',
            'detalles.*.supervisor' => 'nullable|string|max:255',
            'detalles.*.medida_tanque' => 'nullable',
            'detalles.*.fosfina_producto' => 'nullable|string|max:255',
            'detalles.*.fosfina_cantidad' => 'nullable|string|max:50',
            'detalles.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'detalles.*.id_cliente_planta_area' => 'nullable|array',
            'detalles.*.id_cliente_planta_area.*' => 'integer|exists:cliente_planta_area,id',
            'detalles.*.horas_capacitacion' => 'nullable|numeric|min:0',
            'detalles.*.num_participantes' => 'nullable|integer|min:1',
            'detalles.*.fecha_servicio' => 'nullable|date',
            'detalles.*.meses_implementacion' => 'nullable|integer|min:1',
            'detalles.*.frecuencia_visita' => 'nullable|array',
            'detalles.*.horario_auditoria' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            // Recalcular totales desde los detalles enviados
            $subtotal = 0;
            foreach ($validated['detalles'] as $detalle) {
                $subtotal += $detalle['cantidad'] * $detalle['precio_unitario'];
            }

            $incluyeIgv = $validated['incluye_igv'] ?? true;
            $igv = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
            $total = $subtotal + $igv;

            // Observación automática si no incluye IGV
            $observaciones = $validated['observaciones'] ?? null;
            if (!$incluyeIgv && empty($observaciones)) {
                $observaciones = 'Esta cotización no incluye IGV.';
            } elseif (!$incluyeIgv && $observaciones) {
                $observaciones = $observaciones . ' | Nota: Esta cotización no incluye IGV.';
            }

            // Actualizar cabecera
            $cotizacion->update([
                'id_cliente' => $validated['id_cliente'],
                'id_multicim' => $validated['id_multicim'],
                'fecha_emision' => $validated['fecha_emision'] ?? $cotizacion->fecha_emision,
                'tipo_cotizacion' => $validated['tipo_cotizacion'],
                'incluye_igv' => $incluyeIgv,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'observaciones' => $observaciones,
                'propuesta_tecnica' => $validated['propuesta_tecnica'] ?? null,
                'objetivos_asesoria' => $validated['objetivos_asesoria'] ?? null,
                'receta_servicio' => $validated['receta_servicio'] ?? null,
                'exponentes_ids' => $validated['exponentes_ids'] ?? null,
            ]);

            // Reemplazar detalles
            $cotizacion->detalles()->delete();
            foreach ($validated['detalles'] as $detalle) {
                CotizacionDetalle::create([
                    'id_cotizacion' => $cotizacion->id,
                    'id_servicio' => $detalle['id_servicio'] ?? null,
                    'id_producto' => $detalle['id_producto'] ?? null,
                    'id_catalogo_cap_aud' => $detalle['id_catalogo_cap_aud'] ?? null,
                    'descripcion_manual' => $detalle['descripcion_manual'] ?? null,
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'frecuencia_sugerida' => $detalle['frecuencia_sugerida'] ?? null,
                    'modalidad_sugerida' => $detalle['modalidad_sugerida'] ?? null,
                    'op_tecnicos' => $detalle['op_tecnicos'] ?? null,
                    'supervisor' => $detalle['supervisor'] ?? null,
                    'medida_tanque' => $this->normalizarMedidaTanque($detalle) ?: null,
                    'fosfina_producto' => $detalle['fosfina_producto'] ?? null,
                    'fosfina_cantidad' => $detalle['fosfina_cantidad'] ?? null,
                    'id_cliente_planta' => $detalle['id_cliente_planta'] ?? null,
                    'id_cliente_planta_area' => $detalle['id_cliente_planta_area'] ?? null,
                    'horas_capacitacion' => $detalle['horas_capacitacion'] ?? null,
                    'num_participantes' => $detalle['num_participantes'] ?? null,
                    'fecha_servicio' => $detalle['fecha_servicio'] ?? null,
                    'meses_implementacion' => $detalle['meses_implementacion'] ?? null,
                    'frecuencia_visita' => $detalle['frecuencia_visita'] ?? null,
                    'horario_auditoria' => $detalle['horario_auditoria'] ?? null,
                ]);
            }

            $cotizacion->beneficios()->delete();
            if (($validated['tipo_cotizacion'] ?? '') === 'Servicio') {
                $beneficios = $validated['beneficios_servicio'] ?? [];
                foreach ($beneficios as $i => $beneficio) {
                    $cotizacion->beneficios()->create([
                        'id_catalogo_cap_aud' => $beneficio['id_catalogo_cap_aud'] ?? null,
                        'nombre_beneficio' => $beneficio['nombre_beneficio'],
                        'modalidad_sugerida' => $beneficio['modalidad_sugerida'] ?? null,
                        'horas_capacitacion' => $beneficio['horas_capacitacion'] ?? null,
                        'precio_referencial' => $beneficio['precio_referencial'] ?? 0,
                        'observacion' => $beneficio['observacion'] ?? null,
                        'orden' => $i + 1,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cotización actualizada exitosamente',
                'data' => $cotizacion->load('detalles', 'empresa')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la cotización: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar estado de cotización
     */
    public function updateEstado(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'estado' => 'required|in:Pendiente,Aceptada,Rechazada'
        ]);

        $cotizacion = Cotizacion::find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        $nuevoEstado = $validated['estado'];
        $fechaEstado = in_array($nuevoEstado, ['Aceptada', 'Rechazada'], true) ? now() : null;

        $cotizacion->update([
            'estado' => $nuevoEstado,
            'fecha_estado_cotizacion' => $fechaEstado,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'data' => $cotizacion
        ]);
    }

    /**
     * Obtener estadísticas de cotizaciones
     */
    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total' => Cotizacion::count(),
            'pendientes' => Cotizacion::pendientes()->count(),
            'aceptadas' => Cotizacion::aceptadas()->count(),
            'rechazadas' => Cotizacion::rechazadas()->count(),
            'valor_total' => (float) Cotizacion::sum('total'),
            'valor_pendiente' => (float) Cotizacion::pendientes()->sum('total'),
            'siguiente_numero' => Cotizacion::generarNumero(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Eliminar cotización
     */
    public function destroy($id): JsonResponse
    {
        $cotizacion = Cotizacion::find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        // Solo se pueden eliminar cotizaciones pendientes
        if ($cotizacion->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden eliminar cotizaciones en estado Pendiente'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $cotizacion->detalles()->delete();
            $cotizacion->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cotización eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la cotización'
            ], 500);
        }
    }

    /**
     * Alerta de cotizaciones aceptadas sin orden generada
     */
    public function alertaCotizacionesSinOrden(): JsonResponse
    {
        $producto = Cotizacion::where('estado', 'Aceptada')
            ->where('tipo_cotizacion', 'Producto')
            ->whereDoesntHave('ordenProducto')
            ->count();

        $servicio = Cotizacion::where('estado', 'Aceptada')
            ->where('tipo_cotizacion', 'Servicio')
            ->whereDoesntHave('ordenServicio')
            ->count();

        $capacitacion = Cotizacion::where('estado', 'Aceptada')
            ->where('tipo_cotizacion', 'Capacitacion')
            ->whereDoesntHave('ordenCapacitacionAuditoria')
            ->count();

        $auditoria = Cotizacion::where('estado', 'Aceptada')
            ->where('tipo_cotizacion', 'Auditoria')
            ->whereDoesntHave('ordenAuditoria')
            ->count();

        $total = $producto + $servicio + $capacitacion + $auditoria;

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'producto' => $producto,
                'servicio' => $servicio,
                'capacitacion' => $capacitacion,
                'auditoria' => $auditoria,
            ]
        ]);
    }

    /**
     * Generar PDF de cotización
     */
    public function generarPDF($id, Request $request)
    {
        $cotizacion = Cotizacion::with([
            'cliente', 
            'cliente.plantas',
            'cliente.plantas.areas',
            'empresa', 
            'detalles.servicio', 
            'detalles.producto', 
            'detalles.catalogoCapAud', 
            'creador.cargo',
            'beneficios.catalogoCapAud'
        ])->find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        // Obtener solo gerente comercial activo del área de Gerencia.
        // Si hay más de uno, prioriza el registro más reciente.
        $gerenteComercial = \App\Models\Personal::where('estado', 'Activo')->whereHas('cargo', function($q) {
            $q->where('nombre', 'Gerente Comercial');
        })->whereHas('area', function($q) {
            $q->where('nombre', 'Gerencia');
        })->with(['cargo', 'area'])->orderByDesc('id')->first();

        $exponentes = collect();
        if (!empty($cotizacion->exponentes_ids)) {
            $exponentes = \App\Models\Exponente::whereIn('id', $cotizacion->exponentes_ids)->get();
        }

        $pdfView = match ($cotizacion->tipo_cotizacion) {
            'Servicio' => 'cotizaciones.pdf.servicio',
            'Producto' => 'cotizaciones.pdf.producto',
            'Capacitacion' => 'cotizaciones.pdf.capacitacion',
            'Asesoria' => 'cotizaciones.pdf.asesoria',
            'Auditoria' => 'cotizaciones.pdf.auditoria',
            default => 'CotizacionPDF',
        };

        try {
            if (!view()->exists($pdfView)) {
                return response()->json([
                    'success' => false,
                    'message' => "Vista PDF no encontrada: {$pdfView}"
                ], 500);
            }

            $pdf = Pdf::loadView($pdfView, compact('cotizacion', 'exponentes', 'gerenteComercial'))
                    ->setPaper('a4', 'portrait');

            // Si se pasa parámetro descargar=true, descarga automáticamente
            // Si no, muestra en navegador
            if ($request->get('descargar') === 'true') {
                return $pdf->download('cotizacion-' . $cotizacion->numero_cotizacion . '.pdf');
            }

            return $pdf->stream('cotizacion-' . $cotizacion->numero_cotizacion . '.pdf');
        } catch (\Throwable $e) {
            Log::error('Error generando PDF de cotizacion', [
                'cotizacion_id' => $id,
                'tipo_cotizacion' => $cotizacion->tipo_cotizacion ?? null,
                'pdf_view' => $pdfView,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'No se pudo generar el PDF de la cotización',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar receta de servicio en una cotización
     */
    public function updateReceta(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'receta_servicio' => 'required|array'
        ]);

        $cotizacion = Cotizacion::find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        $cotizacion->update([
            'receta_servicio' => $validated['receta_servicio']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receta de servicio actualizada exitosamente',
            'data' => $cotizacion
        ]);
    }
}
