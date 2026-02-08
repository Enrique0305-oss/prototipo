<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenProducto;
use App\Models\DetalleOrdenProducto;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrdenProductoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OrdenProducto::with(['cliente', 'emisor', 'cotizacion']);

        // Filtro por número de orden
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
            $query->where('fecha_envio', '>=', $request->fecha_desde);
        }
        if ($request->has('fecha_hasta')) {
            $query->where('fecha_envio', '<=', $request->fecha_hasta);
        }

        $ordenes = $query->orderBy('fecha_envio', 'desc')->get();

        // Formatear respuesta
        $data = $ordenes->map(function($orden) {
            return [
                'id' => $orden->id,
                'numero_orden' => $orden->numero_orden,
                'fecha_envio' => $orden->fecha_envio->format('Y-m-d'),
                'total' => $orden->total,
                'cliente' => [
                    'id' => $orden->cliente->id,
                    'nombre_empresa' => $orden->cliente->nombre_empresa,
                    'ruc' => $orden->cliente->ruc,
                ],
                'emisor' => $orden->emisor ? $orden->emisor->nombre : null,
                'cotizacion_numero' => $orden->cotizacion ? $orden->cotizacion->numero_cotizacion : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function cotizacionesDisponibles(): JsonResponse
    {
        $cotizaciones = Cotizacion::with(['cliente', 'creador'])
            ->where('tipo_cotizacion', 'Producto')
            ->where('estado', 'Aceptada')
            ->whereDoesntHave('ordenProducto') // Solo las que no tienen orden aún
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

    
     // Obtener datos de una cotización para crear orden de producto
     
    public function desdeCotizacion($cotizacionId): JsonResponse
    {
        $cotizacion = Cotizacion::with(['cliente', 'detalles.producto'])
            ->find($cotizacionId);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        if ($cotizacion->tipo_cotizacion !== 'Producto') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización no es de tipo Producto'
            ], 400);
        }

        if ($cotizacion->estado !== 'Aceptada') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización debe estar Aceptada'
            ], 400);
        }

        // Verificar si ya tiene orden
        if ($cotizacion->ordenProducto) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotización ya tiene una orden de producto creada',
                'orden_existente' => $cotizacion->ordenProducto->numero_orden
            ], 400);
        }

        // Preparar datos para la orden
        $detalles = $cotizacion->detalles->map(function($detalle) {
            return [
                'id_producto' => $detalle->id_producto,
                'producto_nombre' => $detalle->producto ? $detalle->producto->nombre : null,
                'cantidad' => $detalle->cantidad,
                'precio_unitario' => $detalle->precio_unitario,
                'subtotal' => $detalle->subtotal,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'cotizacion' => [
                    'id' => $cotizacion->id,
                    'numero_cotizacion' => $cotizacion->numero_cotizacion,
                    'fecha_emision' => $cotizacion->fecha_emision->format('Y-m-d'),
                ],
                'cliente' => [
                    'id' => $cotizacion->cliente->id,
                    'nombre_empresa' => $cotizacion->cliente->nombre_empresa,
                    'ruc' => $cotizacion->cliente->ruc,
                    'direccion' => $cotizacion->cliente->direccion,
                ],
                'total' => $cotizacion->total,
                'detalles' => $detalles,
            ]
        ]);
    }

    // Crear una nueva orden de producto 
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cotizacion' => 'required|exists:cotizacion,id',
            'fecha_envio' => 'required|date',
            'emitido_por' => 'required|exists:personal,id',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto' => 'required|exists:productos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        $cotizacion = Cotizacion::find($validated['id_cotizacion']);
        
        if ($cotizacion->tipo_cotizacion !== 'Producto') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización debe ser de tipo Producto'
            ], 400);
        }

        // Verificar que no tenga ya una orden
        if ($cotizacion->ordenProducto) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotización ya tiene una orden de producto'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Calcular total
            $total = 0;
            foreach ($validated['detalles'] as $detalle) {
                $subtotal = $detalle['cantidad'] * $detalle['precio_unitario'];
                $total += $subtotal;
            }

            // Crear orden de producto
            $orden = OrdenProducto::create([
                'numero_orden' => OrdenProducto::generarNumero(),
                'id_cotizacion' => $validated['id_cotizacion'],
                'id_cliente' => $cotizacion->id_cliente,
                'fecha_envio' => $validated['fecha_envio'],
                'total' => $total,
                'emitido_por' => $validated['emitido_por'],
            ]);

            // Crear detalles
            foreach ($validated['detalles'] as $detalle) {
                $subtotal = $detalle['cantidad'] * $detalle['precio_unitario'];
                
                DetalleOrdenProducto::create([
                    'id_orden_producto' => $orden->id,
                    'id_producto' => $detalle['id_producto'],
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'subtotal' => $subtotal,
                ]);
            }

            DB::commit();

            // Cargar relaciones para respuesta
            $orden->load(['cliente', 'emisor', 'detalles.producto', 'cotizacion']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de producto creada exitosamente',
                'data' => $orden
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden de producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //Obtener una orden en especifico
    public function show($id): JsonResponse
    {
        $orden = OrdenProducto::with([
            'cliente', 
            'emisor', 
            'cotizacion',
            'detalles.producto'
        ])->find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de producto no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $orden
        ]);
    }

    // Actualizar una orden de producto
    public function update(Request $request, $id): JsonResponse
    {
        $orden = OrdenProducto::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de producto no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'fecha_envio' => 'sometimes|date',
            'detalles' => 'sometimes|array|min:1',
            'detalles.*.id_producto' => 'required_with:detalles|exists:productos,id',
            'detalles.*.cantidad' => 'required_with:detalles|integer|min:1',
            'detalles.*.precio_unitario' => 'required_with:detalles|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Actualizar fecha si viene
            if (isset($validated['fecha_envio'])) {
                $orden->fecha_envio = $validated['fecha_envio'];
            }

            // Si se actualizan detalles
            if (isset($validated['detalles'])) {
                $orden->detalles()->delete();

                // Crear nuevos detalles y calcular total
                $total = 0;
                foreach ($validated['detalles'] as $detalle) {
                    $subtotal = $detalle['cantidad'] * $detalle['precio_unitario'];
                    $total += $subtotal;
                    
                    DetalleOrdenProducto::create([
                        'id_orden_producto' => $orden->id,
                        'id_producto' => $detalle['id_producto'],
                        'cantidad' => $detalle['cantidad'],
                        'precio_unitario' => $detalle['precio_unitario'],
                        'subtotal' => $subtotal,
                    ]);
                }

                $orden->total = $total;
            }

            $orden->save();

            DB::commit();

            $orden->load(['cliente', 'emisor', 'detalles.producto', 'cotizacion']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de producto actualizada exitosamente',
                'data' => $orden
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la orden de producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar una orden de producto
    public function destroy($id): JsonResponse
    {
        $orden = OrdenProducto::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de producto no encontrada'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Eliminar detalles
            $orden->detalles()->delete();
            
            // Eliminar orden
            $orden->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Orden de producto eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la orden de producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Obtener estadísticas de órdenes de producto
    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total_ordenes' => OrdenProducto::count(),
            'total_valor' => OrdenProducto::sum('total'),
            'ordenes_mes_actual' => OrdenProducto::whereMonth('fecha_envio', date('m'))
                                                 ->whereYear('fecha_envio', date('Y'))
                                                 ->count(),
            'valor_mes_actual' => OrdenProducto::whereMonth('fecha_envio', date('m'))
                                              ->whereYear('fecha_envio', date('Y'))
                                              ->sum('total'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
