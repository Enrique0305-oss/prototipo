<?php 

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenCapacitacionAuditoria;
use App\Models\Cotizacion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrdenCapacitacionAuditoriaController extends Controller
{
    /**
     * Listar todas las órdenes de capacitación/auditoría
     */
    public function index(Request $request): JsonResponse
    {
        $query = OrdenCapacitacionAuditoria::with(['cliente', 'ponente', 'ponentes', 'cotizacion', 'servicio']);

        // Filtro por búsqueda
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('numero_orden', 'like', '%' . $request->search . '%')
                  ->orWhereHas('cliente', function($q) use ($request) {
                      $q->where('nombre_empresa', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Filtro por modalidad
        if ($request->has('modalidad')) {
            $query->where('modalidad', $request->modalidad);
        }

        // Filtro por fecha
        if ($request->has('fecha_desde')) {
            $query->where('fecha_servicio', '>=', $request->fecha_desde);
        }
        if ($request->has('fecha_hasta')) {
            $query->where('fecha_servicio', '<=', $request->fecha_hasta);
        }

        $ordenes = $query->orderBy('fecha_servicio', 'desc')->get();

        // Formatear respuesta
        $data = $ordenes->map(function($orden) {
            return [
                'id' => $orden->id,
                'numero_orden' => $orden->numero_orden,
                'fecha_servicio' => $orden->fecha_servicio->format('Y-m-d'),
                'hora_servicio' => $orden->hora_servicio ? $orden->hora_servicio->format('H:i') : null,
                'modalidad' => $orden->modalidad,
                'num_participantes' => $orden->num_participantes,
                'num_certificados' => $orden->num_certificados,
                'costo' => $orden->costo,
                'subtotal' => $orden->subtotal,
                'igv' => $orden->igv,
                'incluye_igv' => (bool) $orden->incluye_igv,
                'estado' => $orden->estado,
                'cliente' => [
                    'id' => $orden->cliente->id,
                    'nombre_empresa' => $orden->cliente->nombre_empresa,
                    'ruc' => $orden->cliente->ruc,
                ],
                'ponente' => $orden->ponente ? $orden->ponente->nombre : null,
                'ponentes' => $orden->ponentes->map(fn($p) => [
                    'id' => $p->id,
                    'nombre' => $p->nombre . ' ' . ($p->apellidos ?? ''),
                ]),
                'servicio' => $orden->servicio ? $orden->servicio->nombre : null,
                'cotizacion_numero' => $orden->cotizacion ? $orden->cotizacion->numero_cotizacion : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Listar cotizaciones tipo "Capacitacion" disponibles
     */
    public function cotizacionesDisponibles(): JsonResponse
    {
        $cotizaciones = Cotizacion::with(['cliente', 'creador'])
            ->where('tipo_cotizacion', 'Capacitacion')
            ->where('estado', 'Aceptada')
            ->whereDoesntHave('ordenCapacitacionAuditoria') // Solo las que no tienen orden aún
            ->orderBy('fecha_emision', 'desc')
            ->get();

        $data = $cotizaciones->map(function($cot) {
            return [
                'id' => $cot->id,
                'numero_cotizacion' => $cot->numero_cotizacion,
                'fecha_emision' => $cot->fecha_emision->format('Y-m-d'),
                'cliente' => [
                    'id' => $cot->cliente->id,
                    'nombre_empresa' => $cot->cliente->nombre_empresa,
                    'ruc' => $cot->cliente->ruc,
                ],
                'total' => $cot->total,
                'subtotal' => $cot->subtotal,
                'igv' => $cot->igv,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Obtener datos de una cotización para crear orden
     */
    public function desdeCotizacion($cotizacionId): JsonResponse
    {
        $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio', 'detalles.catalogoCapAud'])
            ->find($cotizacionId);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        if ($cotizacion->tipo_cotizacion !== 'Capacitacion') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización no es de tipo Capacitacion'
            ], 400);
        }

        if ($cotizacion->estado !== 'Aceptada') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización debe estar Aceptada'
            ], 400);
        }

        // Verificar si ya tiene orden
        if ($cotizacion->ordenCapacitacionAuditoria) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotización ya tiene una orden de capacitación/auditoría creada',
                'orden_existente' => $cotizacion->ordenCapacitacionAuditoria->numero_orden
            ], 400);
        }

        // Obtener el primer servicio/catalogo
        $primerDetalle = $cotizacion->detalles->first();

        // Mapear todos los detalles de la cotización
        $detalles = $cotizacion->detalles->map(function($d) {
            return [
                'id_servicio' => $d->id_servicio,
                'id_catalogo_cap_aud' => $d->id_catalogo_cap_aud,
                'nombre' => $d->catalogoCapAud ? $d->catalogoCapAud->nombre : ($d->servicio ? $d->servicio->nombre : ($d->descripcion_manual ?? 'Sin nombre')),
                'tipo' => $d->catalogoCapAud ? $d->catalogoCapAud->tipo : null,
                'descripcion' => $d->descripcion_manual ?? ($d->catalogoCapAud ? $d->catalogoCapAud->descripcion : null),
                'cantidad' => $d->cantidad,
                'precio_unitario' => $d->precio_unitario,
                'modalidad_sugerida' => $d->modalidad_sugerida,
                'duracion_horas' => $d->catalogoCapAud ? $d->catalogoCapAud->duracion_horas : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'cotizacion' => [
                    'id' => $cotizacion->id,
                    'numero_cotizacion' => $cotizacion->numero_cotizacion,
                    'fecha_emision' => $cotizacion->fecha_emision->format('Y-m-d'),
                    'incluye_igv' => (bool) $cotizacion->incluye_igv,
                    'subtotal' => (float) $cotizacion->subtotal,
                    'igv' => (float) $cotizacion->igv,
                    'total' => (float) $cotizacion->total,
                ],
                'cliente' => [
                    'id' => $cotizacion->cliente->id,
                    'nombre_empresa' => $cotizacion->cliente->nombre_empresa,
                    'ruc' => $cotizacion->cliente->ruc,
                    'direccion' => $cotizacion->cliente->direccion,
                ],
                'costo_total' => (float) $cotizacion->total,
                'detalles' => $detalles,
                'servicio' => $primerDetalle ? [
                    'id' => $primerDetalle->id_servicio ?? $primerDetalle->id_catalogo_cap_aud,
                    'nombre' => $primerDetalle->catalogoCapAud ? $primerDetalle->catalogoCapAud->nombre : ($primerDetalle->servicio ? $primerDetalle->servicio->nombre : null),
                    'modalidad_sugerida' => $primerDetalle->modalidad_sugerida,
                ] : null,
            ]
        ]);
    }


    /**
     * Crear una nueva orden de capacitación/auditoría
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cotizacion' => 'required|exists:cotizacion,id',
            'id_servicio' => 'nullable|exists:servicios,id',
            'id_ponente' => 'nullable|exists:personal,id',
            'ponentes' => 'required|array|min:1',
            'ponentes.*' => 'exists:personal,id',
            'fecha_servicio' => 'required|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'modalidad' => 'required|in:Presencial,Virtual,Híbrido',
            'num_participantes' => 'required|integer|min:1',
            'num_certificados' => 'nullable|integer|min:0',
            'costo' => 'required|numeric|min:0',
            'incluye_igv' => 'nullable|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
        ]);

        // Calcular subtotal e IGV
        $costoIngresado = $validated['costo'];
        $incluyeIgv = $validated['incluye_igv'] ?? true;
        if ($incluyeIgv) {
            $subtotal = $costoIngresado;
            $igv = round($subtotal * 0.18, 2);
            $total = $subtotal + $igv;
        } else {
            $subtotal = $costoIngresado;
            $igv = 0;
            $total = $subtotal;
        }

        // Verificar que la cotización sea tipo Capacitacion
        $cotizacion = Cotizacion::find($validated['id_cotizacion']);
        
        if ($cotizacion->tipo_cotizacion !== 'Capacitacion') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización debe ser de tipo Capacitacion'
            ], 400);
        }

        // Verificar que no tenga ya una orden
        if ($cotizacion->ordenCapacitacionAuditoria) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotización ya tiene una orden de capacitación/auditoría'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Crear orden de capacitación/auditoría
            $ponenteIds = $validated['ponentes'];
            $orden = OrdenCapacitacionAuditoria::create([
                'numero_orden' => OrdenCapacitacionAuditoria::generarNumero(),
                'id_cotizacion' => $validated['id_cotizacion'],
                'id_cliente' => $cotizacion->id_cliente,
                'id_servicio' => $validated['id_servicio'] ?? null,
                'id_ponente' => $ponenteIds[0],
                'fecha_servicio' => $validated['fecha_servicio'],
                'hora_servicio' => $validated['hora_servicio'] ?? null,
                'modalidad' => $validated['modalidad'],
                'num_participantes' => $validated['num_participantes'],
                'num_certificados' => $validated['num_certificados'] ?? 0,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'incluye_igv' => $incluyeIgv,
                'costo' => $total,
                'estado' => 'Aprobado',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            // Sincronizar ponentes en tabla pivot
            $orden->ponentes()->sync($ponenteIds);

            DB::commit();

            // Cargar relaciones para respuesta
            $orden->load(['cliente', 'ponente', 'ponentes', 'servicio', 'cotizacion']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de capacitación/auditoría creada exitosamente',
                'data' => $orden
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden de capacitación/auditoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una orden específica
     */
    public function show($id): JsonResponse
    {
        $orden = OrdenCapacitacionAuditoria::with([
            'cliente', 
            'ponente',
            'ponentes',
            'cotizacion',
            'servicio'
        ])->find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de capacitación/auditoría no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $orden
        ]);
    }

    /**
     * Actualizar una orden de capacitación/auditoría
     */
    public function update(Request $request, $id): JsonResponse
    {
        $orden = OrdenCapacitacionAuditoria::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de capacitación/auditoría no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'id_servicio' => 'nullable|exists:servicios,id',
            'id_ponente' => 'nullable|exists:personal,id',
            'ponentes' => 'sometimes|array|min:1',
            'ponentes.*' => 'exists:personal,id',
            'fecha_servicio' => 'sometimes|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'modalidad' => 'sometimes|in:Presencial,Virtual,Híbrido',
            'num_participantes' => 'sometimes|integer|min:1',
            'num_certificados' => 'nullable|integer|min:0',
            'costo' => 'sometimes|numeric|min:0',
            'incluye_igv' => 'nullable|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
        ]);

        // Recalcular IGV si se envía costo o incluye_igv
        if (isset($validated['costo']) || isset($validated['incluye_igv'])) {
            $costoIngresado = $validated['costo'] ?? $orden->subtotal;
            $incluyeIgv = $validated['incluye_igv'] ?? $orden->incluye_igv;
            if ($incluyeIgv) {
                $validated['subtotal'] = $costoIngresado;
                $validated['igv'] = round($costoIngresado * 0.18, 2);
                $validated['costo'] = $costoIngresado + $validated['igv'];
            } else {
                $validated['subtotal'] = $costoIngresado;
                $validated['igv'] = 0;
                $validated['costo'] = $costoIngresado;
            }
            $validated['incluye_igv'] = $incluyeIgv;
        }

        try {
            // Si se envían ponentes, sincronizar pivot y actualizar id_ponente principal
            if (isset($validated['ponentes'])) {
                $ponenteIds = $validated['ponentes'];
                $orden->ponentes()->sync($ponenteIds);
                $validated['id_ponente'] = $ponenteIds[0];
                unset($validated['ponentes']);
            }

            $orden->update($validated);
            $orden->load(['cliente', 'ponente', 'ponentes', 'servicio', 'cotizacion']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de capacitación/auditoría actualizada exitosamente',
                'data' => $orden
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la orden de capacitación/auditoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una orden de capacitación/auditoría
     */
    public function destroy($id): JsonResponse
    {
        $orden = OrdenCapacitacionAuditoria::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de capacitación/auditoría no encontrada'
            ], 404);
        }

        try {
            $orden->delete();

            return response()->json([
                'success' => true,
                'message' => 'Orden de capacitación/auditoría eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la orden de capacitación/auditoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de órdenes de capacitación/auditoría
     */
    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total_ordenes' => OrdenCapacitacionAuditoria::count(),
            'total_valor' => OrdenCapacitacionAuditoria::sum('costo'),
            'total_participantes' => OrdenCapacitacionAuditoria::sum('num_participantes'),
            'total_certificados' => OrdenCapacitacionAuditoria::sum('num_certificados'),
            'ordenes_mes_actual' => OrdenCapacitacionAuditoria::whereMonth('fecha_servicio', date('m'))
                                                              ->whereYear('fecha_servicio', date('Y'))
                                                              ->count(),
            'valor_mes_actual' => OrdenCapacitacionAuditoria::whereMonth('fecha_servicio', date('m'))
                                                            ->whereYear('fecha_servicio', date('Y'))
                                                            ->sum('costo'),
            'siguiente_numero' => OrdenCapacitacionAuditoria::generarNumero(),
            'por_modalidad' => OrdenCapacitacionAuditoria::select('modalidad', DB::raw('count(*) as total'))
                                                         ->groupBy('modalidad')
                                                         ->get(),
            'por_estado' => OrdenCapacitacionAuditoria::select('estado', DB::raw('count(*) as total'))
                                                          ->groupBy('estado')
                                                          ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    // FUncion para generar pdf de la orden de capacitación/auditoría

    public function descargarPdf($id)
    {
        $orden = OrdenCapacitacionAuditoria::with([
            'cliente', 
            'ponente', 
            'ponentes', 
            'cotizacion', 
            'servicio'
        ])->findOrFail($id);

        $orden->servicio_nombre = $orden->servicio ? $orden->servicio->nombre : 'SERVICIO NO ESPECIFICADO';

        $pdf = Pdf::loadView('OrdenCapacitacionAudiPDF', compact('orden'));
        
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream("Orden_Capacitacion_{$orden->numero_orden}.pdf");
    }
}
