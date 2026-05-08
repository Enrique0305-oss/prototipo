<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\Exponente;
use App\Models\OrdenAuditoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrdenAuditoriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OrdenAuditoria::with(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'emisor']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('numero_orden', 'like', '%'.$search.'%')
                    ->orWhereHas('cliente', fn ($cq) => $cq->where('nombre_empresa', 'like', '%'.$search.'%'));
            });
        }

        if ($request->filled('modalidad')) {
            $query->where('modalidad', $request->modalidad);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_servicio', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_servicio', '<=', $request->fecha_hasta);
        }

        $ordenes = $query->orderByDesc('fecha_servicio')->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'data' => $ordenes->map(function ($orden) {
                return [
                    'id' => $orden->id,
                    'numero_orden' => $orden->numero_orden,
                    'fecha_servicio' => optional($orden->fecha_servicio)->format('Y-m-d'),
                    'fecha_aceptacion' => optional($orden->fecha_aceptacion)->format('Y-m-d'),
                    'hora_servicio' => $orden->hora_servicio ? $orden->hora_servicio->format('H:i') : null,
                    'hora_fin_auditoria' => $orden->hora_fin_auditoria ? $orden->hora_fin_auditoria->format('H:i') : null,
                    'modalidad' => $orden->modalidad,
                    'duracion_dias' => $orden->duracion_dias,
                    'subtotal' => $orden->subtotal,
                    'igv' => $orden->igv,
                    'incluye_igv' => (bool) $orden->incluye_igv,
                    'costo' => $orden->costo,
                    'estado' => $orden->estado,
                    'observaciones' => $orden->observaciones,
                    'cliente' => $orden->cliente ? [
                        'id' => $orden->cliente->id,
                        'nombre_empresa' => $orden->cliente->nombre_empresa,
                        'ruc' => $orden->cliente->ruc,
                    ] : null,
                    'cotizacion' => $orden->cotizacion ? [
                        'id' => $orden->cotizacion->id,
                        'numero_cotizacion' => $orden->cotizacion->numero_cotizacion,
                    ] : null,
                    'servicio' => $orden->servicio ? [
                        'id' => $orden->servicio->id,
                        'nombre' => $orden->servicio->nombre,
                    ] : null,
                    'exponentes' => $orden->exponentes->map(fn ($e) => [
                        'id' => $e->id,
                        'nombre' => trim(($e->nombre ?? '').' '.($e->apellidos ?? '')),
                        'apellidos' => $e->apellidos,
                        'especialidad' => $e->especialidad,
                    ])->values(),
                ];
            }),
        ]);
    }

    public function cotizacionesDisponibles(): JsonResponse
    {
        try {
            $ordenesTable = (new OrdenAuditoria())->getTable();

            $cotizaciones = Cotizacion::with(['cliente'])
                ->where('tipo_cotizacion', 'Auditoria')
                ->where('estado', 'Aceptada')
                ->whereNotExists(function ($query) use ($ordenesTable) {
                    $query->select(DB::raw(1))
                        ->from($ordenesTable . ' as oa')
                        ->whereColumn('oa.id_cotizacion', 'cotizacion.id');
                })
                ->orderByDesc('fecha_emision')
                ->get();

            return response()->json(['success' => true, 'data' => $cotizaciones->map(fn ($cot) => [
                'id' => $cot->id,
                'numero_cotizacion' => $this->safeText($cot->numero_cotizacion),
                'fecha_emision' => optional($cot->fecha_emision)->format('Y-m-d'),
                'cliente' => $cot->cliente ? [
                    'id' => $cot->cliente->id,
                    'nombre_empresa' => $this->safeText($cot->cliente->nombre_empresa),
                    'ruc' => $this->safeText($cot->cliente->ruc),
                    'direccion' => $this->safeText($cot->cliente->direccion),
                ] : null,
                'subtotal' => $cot->subtotal,
                'igv' => $cot->igv,
                'total' => $cot->total,
            ])]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar cotizaciones disponibles para auditoría',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function desdeCotizacion($cotizacionId): JsonResponse
    {
        $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio', 'detalles.catalogoCapAud'])->find($cotizacionId);

        if (!$cotizacion) {
            return response()->json(['success' => false, 'message' => 'Cotización no encontrada'], 404);
        }

        if ($cotizacion->tipo_cotizacion !== 'Auditoria') {
            return response()->json(['success' => false, 'message' => 'La cotización no es de tipo Auditoria'], 400);
        }

        if ($cotizacion->estado !== 'Aceptada') {
            return response()->json(['success' => false, 'message' => 'La cotización debe estar Aceptada'], 400);
        }

        if ($cotizacion->ordenAuditoria) {
            return response()->json(['success' => false, 'message' => 'Esta cotización ya tiene una orden de auditoría creada', 'orden_existente' => $cotizacion->ordenAuditoria->numero_orden], 400);
        }

        $detalle = $cotizacion->detalles->first();
        $exponentesIds = array_values(array_filter((array) ($cotizacion->exponentes_ids ?? []), fn ($id) => !empty($id)));
        $exponentes = empty($exponentesIds) ? collect([]) : Exponente::whereIn('id', $exponentesIds)->get();

        $horarioAuditoria = $detalle?->horario_auditoria;
        $horaInicioAuditoria = is_array($horarioAuditoria) ? ($horarioAuditoria['inicio'] ?? $horarioAuditoria['hora_inicio'] ?? null) : null;
        $horaFinAuditoria = is_array($horarioAuditoria) ? ($horarioAuditoria['fin'] ?? $horarioAuditoria['hora_fin'] ?? null) : null;

        return response()->json(['success' => true, 'data' => [
            'cotizacion' => [
                'id' => $cotizacion->id,
                'numero_cotizacion' => $cotizacion->numero_cotizacion,
                'fecha_emision' => optional($cotizacion->fecha_emision)->format('Y-m-d'),
                'fecha_aceptacion' => $cotizacion->fecha_estado_cotizacion ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d') : null,
                'incluye_igv' => (bool) $cotizacion->incluye_igv,
                'subtotal' => (float) $cotizacion->subtotal,
                'igv' => (float) $cotizacion->igv,
                'total' => (float) $cotizacion->total,
                'exponentes_ids' => $exponentesIds,
            ],
            'cliente' => [
                'id' => $cotizacion->cliente->id,
                'nombre_empresa' => $cotizacion->cliente->nombre_empresa,
                'ruc' => $cotizacion->cliente->ruc,
                'direccion' => $cotizacion->cliente->direccion,
            ],
            'costo_total' => (float) $cotizacion->total,
            'duracion_dias' => $detalle?->meses_implementacion ?? 1,
            'hora_servicio' => $horaInicioAuditoria,
            'hora_fin_auditoria' => $horaFinAuditoria,
            'horario_auditoria' => [
                'inicio' => $horaInicioAuditoria,
                'fin' => $horaFinAuditoria,
            ],
            'detalles' => $cotizacion->detalles->map(fn ($d) => [
                'id_servicio' => $d->id_servicio,
                'id_catalogo_cap_aud' => $d->id_catalogo_cap_aud,
                'nombre' => $d->catalogoCapAud ? $d->catalogoCapAud->nombre : ($d->servicio ? $d->servicio->nombre : ($d->descripcion_manual ?? 'Sin nombre')),
                'descripcion' => $d->descripcion_manual,
                'modalidad_sugerida' => $d->modalidad_sugerida,
                'fecha_servicio' => optional($d->fecha_servicio)->format('Y-m-d'),
                'meses_implementacion' => $d->meses_implementacion,
                'frecuencia_visita' => $d->frecuencia_visita,
                'horario_auditoria' => $d->horario_auditoria,
            ]),
            'exponentes' => $exponentes->map(fn ($e) => [
                'id' => $e->id,
                'nombre' => $e->nombre,
                'apellidos' => $e->apellidos,
                'especialidad' => $e->especialidad,
                'profesion' => $e->profesion,
            ])->values(),
            'servicio' => $detalle ? [
                'id' => $detalle->id_servicio,
                'id_servicio' => $detalle->id_servicio,
                'id_catalogo_cap_aud' => $detalle->id_catalogo_cap_aud,
                'nombre' => $detalle->catalogoCapAud ? $detalle->catalogoCapAud->nombre : ($detalle->servicio ? $detalle->servicio->nombre : ($detalle->descripcion_manual ?? null)),
                'modalidad_sugerida' => $detalle->modalidad_sugerida,
                'meses_implementacion' => $detalle->meses_implementacion,
                'frecuencia_visita' => $detalle->frecuencia_visita,
                'horario_auditoria' => $detalle->horario_auditoria,
            ] : null,
        ]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cotizacion' => 'required|exists:cotizacion,id',
            'id_servicio' => 'nullable|exists:servicios,id',
            'exponentes' => 'nullable|array',
            'exponentes.*' => 'exists:exponentes,id',
            'fecha_servicio' => 'required|date',
            'fecha_aceptacion' => 'nullable|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'hora_fin_auditoria' => 'nullable|date_format:H:i',
            'modalidad' => 'required|in:Presencial,Virtual,Híbrido,Hibrido,Asíncrona,Asincrona',
            'duracion_dias' => 'required|integer|min:1',
            'costo' => 'required|numeric|min:0',
            'incluye_igv' => 'nullable|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
        ]);

        $cotizacion = Cotizacion::find($validated['id_cotizacion']);

        if ($cotizacion->tipo_cotizacion !== 'Auditoria') {
            return response()->json(['success' => false, 'message' => 'La cotización debe ser de tipo Auditoria'], 400);
        }

        if ($cotizacion->ordenAuditoria) {
            return response()->json(['success' => false, 'message' => 'Esta cotización ya tiene una orden'], 400);
        }

        $incluyeIgv = $validated['incluye_igv'] ?? true;
        $costoIngresado = $validated['costo'];
        $subtotal = $costoIngresado;
        $igv = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
        $total = $subtotal + $igv;

        $validated['fecha_aceptacion'] = $cotizacion->fecha_estado_cotizacion
            ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d')
            : ($validated['fecha_aceptacion'] ?? $cotizacion->fecha_emision->format('Y-m-d'));

        try {
            DB::beginTransaction();

            $expIds = $validated['exponentes'] ?? [];
            $orden = OrdenAuditoria::create([
                'numero_orden' => OrdenAuditoria::generarNumero(),
                'id_cotizacion' => $validated['id_cotizacion'],
                'id_cliente' => $cotizacion->id_cliente,
                'id_servicio' => $validated['id_servicio'] ?? null,
                'id_exponente' => !empty($expIds) ? $expIds[0] : null,
                'fecha_servicio' => $validated['fecha_servicio'],
                'fecha_aceptacion' => $validated['fecha_aceptacion'] ?? null,
                'hora_servicio' => $validated['hora_servicio'] ?? null,
                'hora_fin_auditoria' => $validated['hora_fin_auditoria'] ?? null,
                'modalidad' => $validated['modalidad'],
                'duracion_dias' => $validated['duracion_dias'],
                'subtotal' => $subtotal,
                'igv' => $igv,
                'incluye_igv' => $incluyeIgv,
                'costo' => $total,
                'emitido_por' => Auth::id(),
                'estado' => $validated['estado'] ?? 'Aprobado',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            if (!empty($expIds)) {
                $orden->exponentes()->sync($expIds);
            }

            DB::commit();

            $orden->load(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'emisor']);

            // Crear proyección automática para auditoría
            \Log::info('Llamando a crearProyeccionAutomaticaAuditoria después de DB::commit', ['orden_id' => $orden->id]);
            ProyeccionesController::crearProyeccionAutomaticaAuditoria($orden);

            return response()->json(['success' => true, 'message' => 'Orden de auditoría creada exitosamente', 'data' => $orden], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al crear la orden', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $orden = OrdenAuditoria::with(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'emisor'])->find($id);

        if (!$orden) {
            return response()->json(['success' => false, 'message' => 'Orden de auditoría no encontrada'], 404);
        }

        return response()->json(['success' => true, 'data' => $orden]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $orden = OrdenAuditoria::find($id);

        if (!$orden) {
            return response()->json(['success' => false, 'message' => 'Orden de auditoría no encontrada'], 404);
        }

        $validated = $request->validate([
            'id_servicio' => 'nullable|exists:servicios,id',
            'exponentes' => 'sometimes|array',
            'exponentes.*' => 'exists:exponentes,id',
            'fecha_servicio' => 'sometimes|date',
            'fecha_aceptacion' => 'nullable|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'hora_fin_auditoria' => 'nullable|date_format:H:i',
            'modalidad' => 'sometimes|in:Presencial,Virtual,Híbrido,Hibrido,Asíncrona,Asincrona',
            'duracion_dias' => 'sometimes|integer|min:1',
            'costo' => 'sometimes|numeric|min:0',
            'incluye_igv' => 'nullable|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
        ]);

        if (isset($validated['costo']) || isset($validated['incluye_igv'])) {
            $costoIngresado = $validated['costo'] ?? $orden->subtotal;
            $incluyeIgv = $validated['incluye_igv'] ?? $orden->incluye_igv;
            $validated['subtotal'] = $costoIngresado;
            $validated['igv'] = $incluyeIgv ? round($costoIngresado * 0.18, 2) : 0;
            $validated['costo'] = $costoIngresado + $validated['igv'];
            $validated['incluye_igv'] = $incluyeIgv;
        }

        try {
            DB::beginTransaction();

            if (isset($validated['exponentes'])) {
                $expIds = $validated['exponentes'];
                $orden->exponentes()->sync($expIds);
                $validated['id_exponente'] = !empty($expIds) ? $expIds[0] : null;
                unset($validated['exponentes']);
            }

            $orden->update($validated);
            DB::commit();

            $orden->load(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'emisor']);

            // Actualizar proyección si existe
            \Log::info('Actualizando proyección de auditoría', ['orden_id' => $orden->id]);
            $proyeccion = \App\Models\Proyeccion::where('tipo_orden', 'auditoria')
                ->where('id_referencia', $orden->id)
                ->first();
            if ($proyeccion) {
                \Log::info('Proyección encontrada, actualizando', ['proyeccion_id' => $proyeccion->id]);
                ProyeccionesController::actualizarProyeccionAuditoria($proyeccion, $orden);
            } else {
                \Log::info('No se encontró proyección, creando nueva', ['orden_id' => $orden->id]);
                ProyeccionesController::crearProyeccionAutomaticaAuditoria($orden);
            }

            return response()->json(['success' => true, 'message' => 'Orden de auditoría actualizada exitosamente', 'data' => $orden]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al actualizar la orden', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        $orden = OrdenAuditoria::find($id);

        if (!$orden) {
            return response()->json(['success' => false, 'message' => 'Orden de auditoría no encontrada'], 404);
        }

        $orden->delete();
        return response()->json(['success' => true, 'message' => 'Orden de auditoría eliminada exitosamente']);
    }

    public function estadisticas(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => [
            'total_ordenes' => OrdenAuditoria::count(),
            'total_valor' => OrdenAuditoria::sum('costo'),
            'ordenes_mes_actual' => OrdenAuditoria::whereMonth('fecha_servicio', date('m'))->whereYear('fecha_servicio', date('Y'))->count(),
            'valor_mes_actual' => OrdenAuditoria::whereMonth('fecha_servicio', date('m'))->whereYear('fecha_servicio', date('Y'))->sum('costo'),
            'siguiente_numero' => OrdenAuditoria::generarNumero(),
            'por_modalidad' => OrdenAuditoria::select('modalidad', DB::raw('count(*) as total'))->groupBy('modalidad')->get(),
            'por_estado' => OrdenAuditoria::select('estado', DB::raw('count(*) as total'))->groupBy('estado')->get(),
        ]]);
    }

    public function descargarPdf($id)
    {
        $orden = OrdenAuditoria::with(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'emisor'])->findOrFail($id);
        $pdf = Pdf::loadView('OrdenAuditoriaPDF', compact('orden'))->setPaper('a4', 'portrait');

        return $pdf->stream('Orden_Auditoria_' . $orden->numero_orden . '.pdf');
    }

    private function safeText($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $text = (string) $value;

        if (preg_match('//u', $text)) {
            return $text;
        }

        $fixed = @iconv('UTF-8', 'UTF-8//IGNORE', $text);

        return $fixed === false ? utf8_encode($text) : $fixed;
    }
}