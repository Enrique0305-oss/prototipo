<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenServicio;
use App\Models\DetalleOrdenServicio;
use App\Models\OrdenServicioProducto;
use App\Models\OrdenServicioEquipo;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrdenServicioController extends Controller
{
    /**
     * Listar todas las órdenes de servicio
     */
    public function index(Request $request): JsonResponse
    {
        $query = OrdenServicio::with(['cliente', 'emisor', 'cotizacion']);

        // Filtro por búsqueda
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('numero_orden', 'like', '%' . $request->search . '%')
                  ->orWhereHas('cliente', function($q) use ($request) {
                      $q->where('nombre_empresa', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Filtro por fecha
        if ($request->has('fecha_desde')) {
            $query->where('fecha_aceptacion', '>=', $request->fecha_desde);
        }
        if ($request->has('fecha_hasta')) {
            $query->where('fecha_aceptacion', '<=', $request->fecha_hasta);
        }

        $ordenes = $query->orderBy('fecha_aceptacion', 'desc')->get();

        // Formatear respuesta
        $data = $ordenes->map(function($orden) {
            return [
                'id' => $orden->id,
                'numero_orden' => $orden->numero_orden,
                'fecha_aceptacion' => $orden->fecha_aceptacion->format('Y-m-d'),
                'fecha_tentativa' => $orden->fecha_tentativa ? $orden->fecha_tentativa->format('Y-m-d') : null,
                'total_costo' => $orden->total_costo,
                'cliente' => [
                    'id' => $orden->cliente->id,
                    'nombre_empresa' => $orden->cliente->nombre_empresa,
                    'ruc' => $orden->cliente->ruc,
                ],
                'emisor' => $orden->emisor ? $orden->emisor->nombre : null,
                'cotizacion_numero' => $orden->cotizacion ? $orden->cotizacion->numero_cotizacion : null,
                'estado' => $orden->estado ?? 'Aprobado',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Listar cotizaciones tipo "Servicio" disponibles para crear órdenes
     */
    public function cotizacionesDisponibles(): JsonResponse
    {
        $cotizaciones = Cotizacion::with(['cliente', 'creador'])
            ->where('tipo_cotizacion', 'Servicio')
            ->where('estado', 'Aceptada')
            ->whereDoesntHave('ordenServicio') // Solo las que no tienen orden aún
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
                'incluye_igv' => (bool) $cot->incluye_igv,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Obtener el siguiente número de orden (correlativo)
     */
    public function siguienteNumero(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'numero_orden' => OrdenServicio::generarNumero()
            ]
        ]);
    }

    /**
     * Obtener datos de una cotización para crear orden de servicio
     */
    public function desdeCotizacion($cotizacionId): JsonResponse
    {
        $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio'])
            ->find($cotizacionId);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        if ($cotizacion->tipo_cotizacion !== 'Servicio') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización no es de tipo Servicio'
            ], 400);
        }

        if ($cotizacion->estado !== 'Aceptada') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización debe estar Aceptada'
            ], 400);
        }

        // Verificar si ya tiene orden
        if ($cotizacion->ordenServicio) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotización ya tiene una orden de servicio creada',
                'orden_existente' => $cotizacion->ordenServicio->numero_orden
            ], 400);
        }

        // Preparar datos para la orden
        $detalles = $cotizacion->detalles->map(function($detalle) {
            return [
                'id_servicio' => $detalle->id_servicio,
                'servicio_nombre' => $detalle->servicio ? $detalle->servicio->nombre : null,
                'frecuencia' => $detalle->frecuencia_sugerida,
                'precio' => $detalle->precio_unitario,
                'id_cliente_planta' => $detalle->id_cliente_planta,
                'id_cliente_planta_area' => $detalle->id_cliente_planta_area,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'cotizacion' => [
                    'id' => $cotizacion->id,
                    'numero_cotizacion' => $cotizacion->numero_cotizacion,
                    'fecha_emision' => $cotizacion->fecha_emision->format('Y-m-d'),
                    'fecha_aceptacion' => $cotizacion->fecha_estado_cotizacion
                        ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d')
                        : null,
                ],
                'cliente' => [
                    'id' => $cotizacion->cliente->id,
                    'nombre_empresa' => $cotizacion->cliente->nombre_empresa,
                    'ruc' => $cotizacion->cliente->ruc,
                    'direccion' => $cotizacion->cliente->direccion,
                ],
                'total' => $cotizacion->total,
                'subtotal' => $cotizacion->subtotal,
                'igv' => $cotizacion->igv,
                'incluye_igv' => (bool) $cotizacion->incluye_igv,
                'detalles' => $detalles,
            ]
        ]);
    }


    /**
     * Crear una nueva orden de servicio
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cotizacion' => 'required|exists:cotizacion,id',
            'fecha_aceptacion' => 'nullable|date',
            'fecha_tentativa' => 'nullable|date',
            'emitido_por' => 'required|exists:personal,id',
            'observaciones' => 'nullable|string',
            'codigo_doc' => 'nullable|string|max:20',
            'version' => 'nullable|string|max:10',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_servicio' => 'required|exists:servicios,id',
            'detalles.*.local' => 'nullable|string|max:255',
            'detalles.*.frecuencia' => 'nullable|string|max:100',
            'detalles.*.precio' => 'required|numeric|min:0',
            'detalles.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'detalles.*.id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
            'incluye_igv' => 'sometimes|boolean',
            // Productos y equipos
            'productos' => 'sometimes|array',
            'productos.*.id_producto' => 'required_with:productos|integer|exists:productos,id',
            'productos.*.cantidad' => 'required_with:productos|numeric|min:0.01',
            'productos.*.observacion' => 'nullable|string|max:255',
            'productos.*.id_servicio' => 'nullable|integer|exists:servicios,id',
            'productos.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'productos.*.id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
            'productos.*.id_equipo' => 'nullable|integer|exists:equipo,id',
            'equipos' => 'sometimes|array',
            'equipos.*.id_equipo' => 'required_with:equipos|integer|exists:equipo,id',
            'equipos.*.observacion' => 'nullable|string|max:255',
            'equipos.*.id_servicio' => 'nullable|integer|exists:servicios,id',
            'equipos.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'equipos.*.id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
        ]);

        // Verificar que la cotización sea tipo Servicio
        $cotizacion = Cotizacion::find($validated['id_cotizacion']);
        
        if ($cotizacion->tipo_cotizacion !== 'Servicio') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización debe ser de tipo Servicio'
            ], 400);
        }

        // Verificar que no tenga ya una orden
        if ($cotizacion->ordenServicio) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotización ya tiene una orden de servicio'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Calcular total con IGV
            $subtotal = 0;
            foreach ($validated['detalles'] as $detalle) {
                $subtotal += $detalle['precio'];
            }
            $incluyeIgv = $validated['incluye_igv'] ?? true;
            $igv = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
            $total = $subtotal + $igv;
            $fechaAceptacion = $cotizacion->fecha_estado_cotizacion
                ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d')
                : ($validated['fecha_aceptacion'] ?? $cotizacion->fecha_emision->format('Y-m-d'));

            // Crear orden de servicio
            $orden = OrdenServicio::create([
                'numero_orden' => OrdenServicio::generarNumero(),
                'codigo_doc' => $validated['codigo_doc'] ?? null,
                'version' => $validated['version'] ?? '1.0',
                'id_cotizacion' => $validated['id_cotizacion'],
                'id_cliente' => $cotizacion->id_cliente,
                'fecha_aceptacion' => $fechaAceptacion,
                'fecha_tentativa' => $validated['fecha_tentativa'] ?? null,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'incluye_igv' => $incluyeIgv,
                'total_costo' => $total,
                'emitido_por' => $validated['emitido_por'],
                'estado' => 'Aprobado',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            // Crear detalles de servicios
            foreach ($validated['detalles'] as $detalle) {
                DetalleOrdenServicio::create([
                    'id_orden_servicio' => $orden->id,
                    'id_servicio' => $detalle['id_servicio'],
                    'local' => $detalle['local'] ?? null,
                    'frecuencia' => $detalle['frecuencia'] ?? null,
                    'precio' => $detalle['precio'],
                    'id_cliente_planta' => $detalle['id_cliente_planta'] ?? null,
                    'id_cliente_planta_area' => $detalle['id_cliente_planta_area'] ?? null,
                ]);
            }

            // Registrar productos
            if (!empty($validated['productos'])) {
                foreach ($validated['productos'] as $prod) {
                    OrdenServicioProducto::create([
                        'id_orden_servicio' => $orden->id,
                        'id_servicio' => $prod['id_servicio'] ?? null,
                        'id_cliente_planta' => $prod['id_cliente_planta'] ?? null,
                        'id_cliente_planta_area' => $prod['id_cliente_planta_area'] ?? null,
                        'id_equipo' => $prod['id_equipo'] ?? null,
                        'id_producto' => $prod['id_producto'],
                        'cantidad' => $prod['cantidad'],
                        'observacion' => $prod['observacion'] ?? null,
                    ]);
                }
            }

            // Registrar equipos asignados
            if (!empty($validated['equipos'])) {
                foreach ($validated['equipos'] as $eq) {
                    OrdenServicioEquipo::create([
                        'id_orden_servicio' => $orden->id,
                        'id_servicio' => $eq['id_servicio'] ?? null,
                        'id_cliente_planta' => $eq['id_cliente_planta'] ?? null,
                        'id_cliente_planta_area' => $eq['id_cliente_planta_area'] ?? null,
                        'id_equipo' => $eq['id_equipo'],
                        'observacion' => $eq['observacion'] ?? null,
                    ]);
                }
            }

            DB::commit();

            // Cargar relaciones para respuesta
            $orden->load(['cliente', 'emisor', 'detalles.servicio', 'detalles.planta', 'detalles.area', 'cotizacion', 'productos.producto', 'productos.servicio', 'productos.planta', 'productos.area', 'productos.equipo', 'equipos.equipo', 'equipos.servicio', 'equipos.planta', 'equipos.area']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de servicio creada exitosamente',
                'data' => $orden
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una orden específica
     */
    public function show($id): JsonResponse
    {
        $orden = OrdenServicio::with([
            'cliente', 
            'emisor', 
            'cotizacion',
            'detalles.servicio',
            'detalles.planta',
            'detalles.area',
            'productos.producto',
            'productos.servicio',
            'productos.planta',
            'productos.area',
            'productos.equipo',
            'equipos.equipo',
            'equipos.servicio',
            'equipos.planta',
            'equipos.area'
        ])->find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de servicio no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $orden
        ]);
    }

    /**
     * Actualizar una orden de servicio
     */
    public function update(Request $request, $id): JsonResponse
    {
        $orden = OrdenServicio::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de servicio no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'fecha_aceptacion' => 'sometimes|date',
            'fecha_tentativa' => 'nullable|date',
            'codigo_doc' => 'nullable|string|max:20',
            'version' => 'nullable|string|max:10',
            'detalles' => 'sometimes|array|min:1',
            'detalles.*.id_servicio' => 'required_with:detalles|exists:servicios,id',
            'detalles.*.local' => 'nullable|string|max:255',
            'detalles.*.frecuencia' => 'nullable|string|max:100',
            'detalles.*.precio' => 'required_with:detalles|numeric|min:0',
            'detalles.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'detalles.*.id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
            'incluye_igv' => 'sometimes|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
            // Productos y equipos
            'productos' => 'sometimes|array',
            'productos.*.id_producto' => 'required_with:productos|integer|exists:productos,id',
            'productos.*.cantidad' => 'required_with:productos|numeric|min:0.01',
            'productos.*.observacion' => 'nullable|string|max:255',
            'productos.*.id_servicio' => 'nullable|integer|exists:servicios,id',
            'productos.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'productos.*.id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
            'productos.*.id_equipo' => 'nullable|integer|exists:equipo,id',
            'equipos' => 'sometimes|array',
            'equipos.*.id_equipo' => 'required_with:equipos|integer|exists:equipo,id',
            'equipos.*.observacion' => 'nullable|string|max:255',
            'equipos.*.id_servicio' => 'nullable|integer|exists:servicios,id',
            'equipos.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'equipos.*.id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
        ]);

        try {
            DB::beginTransaction();

            // Actualizar estado si viene
            if (isset($validated['estado'])) {
                $orden->estado = $validated['estado'];
            }

            // Actualizar campos básicos
            if (isset($validated['fecha_aceptacion'])) {
                $orden->fecha_aceptacion = $validated['fecha_aceptacion'];
            }
            if (isset($validated['fecha_tentativa'])) {
                $orden->fecha_tentativa = $validated['fecha_tentativa'];
            }
            if (isset($validated['codigo_doc'])) {
                $orden->codigo_doc = $validated['codigo_doc'];
            }
            if (isset($validated['version'])) {
                $orden->version = $validated['version'];
            }

            // Si se actualizan detalles
            if (isset($validated['detalles'])) {
                // Eliminar detalles antiguos
                $orden->detalles()->delete();

                // Crear nuevos detalles y calcular total con IGV
                $subtotal = 0;
                foreach ($validated['detalles'] as $detalle) {
                    $subtotal += $detalle['precio'];
                    
                    DetalleOrdenServicio::create([
                        'id_orden_servicio' => $orden->id,
                        'id_servicio' => $detalle['id_servicio'],
                        'local' => $detalle['local'] ?? null,
                        'frecuencia' => $detalle['frecuencia'] ?? null,
                        'precio' => $detalle['precio'],
                        'id_cliente_planta' => $detalle['id_cliente_planta'] ?? null,
                        'id_cliente_planta_area' => $detalle['id_cliente_planta_area'] ?? null,
                    ]);
                }

                $incluyeIgv = $validated['incluye_igv'] ?? $orden->incluye_igv ?? true;
                $igv = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
                $orden->subtotal = $subtotal;
                $orden->igv = $igv;
                $orden->incluye_igv = $incluyeIgv;
                $orden->total_costo = $subtotal + $igv;
            } elseif (isset($validated['incluye_igv'])) {
                // Solo cambió el IGV sin cambiar detalles
                $subtotal = $orden->subtotal ?? $orden->total_costo;
                $igv = $validated['incluye_igv'] ? round($subtotal * 0.18, 2) : 0;
                $orden->incluye_igv = $validated['incluye_igv'];
                $orden->igv = $igv;
                $orden->total_costo = $subtotal + $igv;
            }

            // Actualizar productos si se envían
            if (isset($validated['productos'])) {
                // Reemplazar productos anteriores por los nuevos
                $orden->productos()->delete();

                foreach ($validated['productos'] as $prod) {
                    OrdenServicioProducto::create([
                        'id_orden_servicio' => $orden->id,
                        'id_servicio' => $prod['id_servicio'] ?? null,
                        'id_cliente_planta' => $prod['id_cliente_planta'] ?? null,
                        'id_cliente_planta_area' => $prod['id_cliente_planta_area'] ?? null,
                        'id_equipo' => $prod['id_equipo'] ?? null,
                        'id_producto' => $prod['id_producto'],
                        'cantidad' => $prod['cantidad'],
                        'observacion' => $prod['observacion'] ?? null,
                    ]);
                }
            }

            // Actualizar equipos si se envían
            if (isset($validated['equipos'])) {
                $orden->equipos()->delete();
                foreach ($validated['equipos'] as $eq) {
                    OrdenServicioEquipo::create([
                        'id_orden_servicio' => $orden->id,
                        'id_servicio' => $eq['id_servicio'] ?? null,
                        'id_cliente_planta' => $eq['id_cliente_planta'] ?? null,
                        'id_cliente_planta_area' => $eq['id_cliente_planta_area'] ?? null,
                        'id_equipo' => $eq['id_equipo'],
                        'observacion' => $eq['observacion'] ?? null,
                    ]);
                }
            }

            $orden->save();

            DB::commit();

            $orden->load(['cliente', 'emisor', 'detalles.servicio', 'detalles.planta', 'detalles.area', 'cotizacion', 'productos.producto', 'productos.servicio', 'productos.planta', 'productos.area', 'productos.equipo', 'equipos.equipo', 'equipos.servicio', 'equipos.planta', 'equipos.area']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de servicio actualizada exitosamente',
                'data' => $orden
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la orden de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una orden de servicio
     */
    public function destroy($id): JsonResponse
    {
        $orden = OrdenServicio::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de servicio no encontrada'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Eliminar productos, equipos y detalles
            $orden->productos()->delete();
            $orden->equipos()->delete();
            $orden->detalles()->delete();
            
            // Eliminar orden
            $orden->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Orden de servicio eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la orden de servicio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de órdenes de servicio
     */
    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total_ordenes' => OrdenServicio::count(),
            'total_valor' => OrdenServicio::sum('total_costo'),
            'ordenes_mes_actual' => OrdenServicio::whereMonth('fecha_aceptacion', date('m'))
                                                 ->whereYear('fecha_aceptacion', date('Y'))
                                                 ->count(),
            'valor_mes_actual' => OrdenServicio::whereMonth('fecha_aceptacion', date('m'))
                                              ->whereYear('fecha_aceptacion', date('Y'))
                                              ->sum('total_costo'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function generarPDF($id)
    {
        $orden = OrdenServicio::with([
            'cliente', 
            'detalles.servicio', 'detalles.planta', 'detalles.area', 
            'emisor', 'cotizacion', 
            'productos.producto', 'productos.planta', 'productos.area', 'productos.equipo',
            'equipos.equipo', 'equipos.planta', 'equipos.area'
        ])->findOrFail($id);
        
        $multicim = [
            'nombre_empresa' => 'CONTROL DE PLAGAS Y SANEAMIENTO AMBIENTAL',
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('OrdenServicioPDF', compact('orden', 'multicim'));

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Orden_Servicio_'.$orden->numero_orden.'.pdf');
    }
}
