<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenProducto;
use App\Models\DetalleOrdenProducto;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use App\Models\Multicim;
use App\Models\Inventario;
use App\Models\Kardex;
use App\Models\Producto;
use App\Models\Lote;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

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
                'estado' => $orden->estado ?? 'Aprobado',
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
                'incluye_igv' => (bool) $cot->incluye_igv,
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
                'producto_nombre' => $detalle->producto ? $detalle->producto->descripcion : null,
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

    // Crear una nueva orden de producto 
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cotizacion' => 'required|exists:cotizacion,id',
            'fecha_envio' => 'required|date',
            'fecha_aceptacion' => 'nullable|date',
            'emitido_por' => 'required|exists:personal,id',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto' => 'required|exists:productos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'incluye_igv' => 'sometimes|boolean',
            'observaciones' => 'nullable|string',
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

            // Calcular subtotal, IGV y total
            $subtotalCalc = 0;
            foreach ($validated['detalles'] as $detalle) {
                $subtotalCalc += $detalle['cantidad'] * $detalle['precio_unitario'];
            }

            $incluyeIgv = $validated['incluye_igv'] ?? true;
            $igvCalc = $incluyeIgv ? round($subtotalCalc * 0.18, 2) : 0;
            $total = $subtotalCalc + $igvCalc;
            $fechaAceptacion = $cotizacion->fecha_estado_cotizacion
                ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d')
                : ($validated['fecha_aceptacion'] ?? null);

            // Crear orden de producto
            $orden = OrdenProducto::create([
                'numero_orden' => OrdenProducto::generarNumero(),
                'id_cotizacion' => $validated['id_cotizacion'],
                'id_cliente' => $cotizacion->id_cliente,
                'fecha_envio' => $validated['fecha_envio'],
                'fecha_aceptacion' => $fechaAceptacion,
                'subtotal' => $subtotalCalc,
                'igv' => $igvCalc,
                'incluye_igv' => $incluyeIgv,
                'total' => $total,
                'emitido_por' => $validated['emitido_por'],
                'estado' => 'Aprobado',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            // Crear detalles (sin descontar stock automático)
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

            // Crear proyección automática para producto
            \Log::info('Llamando a crearProyeccionAutomaticaProducto después de DB::commit', ['orden_id' => $orden->id]);
            ProyeccionesController::crearProyeccionAutomaticaProducto($orden);

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
            'fecha_aceptacion' => 'nullable|date',
            'incluye_igv' => 'sometimes|boolean',
            'detalles' => 'sometimes|array|min:1',
            'detalles.*.id_producto' => 'required_with:detalles|exists:productos,id',
            'detalles.*.cantidad' => 'required_with:detalles|integer|min:1',
            'detalles.*.precio_unitario' => 'required_with:detalles|numeric|min:0',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Actualizar estado si viene
            if (isset($validated['estado'])) {
                $orden->estado = $validated['estado'];
            }

            // Actualizar fecha si viene
            if (isset($validated['fecha_envio'])) {
                $orden->fecha_envio = $validated['fecha_envio'];
            }

            // Actualizar fecha de aceptación
            if (array_key_exists('fecha_aceptacion', $validated)) {
                $orden->fecha_aceptacion = $validated['fecha_aceptacion'];
            }

            // Actualizar IGV toggle
            if (isset($validated['incluye_igv'])) {
                $orden->incluye_igv = $validated['incluye_igv'];
            }

            // Si se actualizan detalles
            if (isset($validated['detalles'])) {
                // Reemplazar detalles, sin tocar stock (se confirma desde Almacén)
                $orden->detalles()->delete();

                // Crear nuevos detalles
                $subtotalCalc = 0;
                foreach ($validated['detalles'] as $detalle) {
                    $subtotal = $detalle['cantidad'] * $detalle['precio_unitario'];
                    $subtotalCalc += $subtotal;
                    
                    DetalleOrdenProducto::create([
                        'id_orden_producto' => $orden->id,
                        'id_producto' => $detalle['id_producto'],
                        'cantidad' => $detalle['cantidad'],
                        'precio_unitario' => $detalle['precio_unitario'],
                        'subtotal' => $subtotal,
                    ]);
                }

                $incluyeIgv = $orden->incluye_igv;
                $igvCalc = $incluyeIgv ? round($subtotalCalc * 0.18, 2) : 0;
                $orden->subtotal = $subtotalCalc;
                $orden->igv = $igvCalc;
                $orden->total = $subtotalCalc + $igvCalc;
            } elseif (isset($validated['incluye_igv'])) {
                // Solo cambió IGV, recalcular desde subtotal existente
                $subtotalCalc = (float) $orden->subtotal;
                $igvCalc = $orden->incluye_igv ? round($subtotalCalc * 0.18, 2) : 0;
                $orden->igv = $igvCalc;
                $orden->total = $subtotalCalc + $igvCalc;
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
            'siguiente_numero' => OrdenProducto::generarNumero(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Almacén - Salidas de productos pendientes por confirmar
     */
    public function salidasPendientes(Request $request): JsonResponse
    {
        $query = OrdenProducto::with([
            'cliente',
            'emisor',
            'detalles.producto.inventario',
            'detalles.lote',
        ])
        ->whereDoesntHave('salidasKardex')
        ->orderBy('fecha_envio', 'desc');

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_envio', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_envio', '<=', $request->fecha_hasta);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Almacén - Historial de salidas de órdenes de producto confirmadas
     */
    public function salidasHistorial(Request $request): JsonResponse
    {
        $query = OrdenProducto::with([
            'cliente',
            'emisor',
            'detalles.producto',
            'detalles.lote',
            'salidasKardex',
        ])
        ->whereHas('salidasKardex')
        ->orderBy('fecha_envio', 'desc');

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_envio', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_envio', '<=', $request->fecha_hasta);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Almacén - Detalle de orden de producto para confirmar salida
     */
    public function salidaDetalle(int $id): JsonResponse
    {
        $orden = OrdenProducto::with([
            'cliente',
            'emisor',
            'detalles.producto.inventario',
            'detalles.lote',
            'salidasKardex',
        ])->find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de producto no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $orden,
        ]);
    }

    /**
     * Almacén - Confirmar salida de productos de una orden de producto
     * Solo registra SALIDA en Kardex (sin devoluciones automáticas)
     */
    public function confirmarSalida(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_orden_producto' => 'required|integer|exists:orden_producto,id',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto' => 'required|integer|exists:productos,id',
            'detalles.*.id_lote' => 'required|integer|exists:lotes,id',
            'detalles.*.cantidad_entregada' => 'required|integer|min:1',
            'observacion' => 'nullable|string|max:500',
        ]);

        $idOrden = (int) $validated['id_orden_producto'];
        $detallesSalida = $validated['detalles'];
        $observacion = $validated['observacion'] ?? '';
        $idUsuario = $request->user()?->id;

        DB::beginTransaction();
        try {
            $orden = OrdenProducto::with('detalles')->findOrFail($idOrden);

            if ($orden->salidasKardex()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'La salida de esta orden ya fue confirmada',
                ], 422);
            }

            $detallesOrden = $orden->detalles->keyBy('id_producto');
            if ($detallesOrden->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'La orden no tiene productos para entregar',
                ], 422);
            }

            foreach ($detallesSalida as $item) {
                $idProducto = (int) $item['id_producto'];
                $idLote = (int) $item['id_lote'];
                $cantidadEntregada = (int) $item['cantidad_entregada'];

                $detalleOrden = $detallesOrden->get($idProducto);
                if (!$detalleOrden) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} no pertenece a la orden",
                    ], 422);
                }

                if ($cantidadEntregada > (int) $detalleOrden->cantidad) {
                    return response()->json([
                        'success' => false,
                        'message' => "La cantidad entregada del producto #{$idProducto} excede la cantidad de la orden",
                    ], 422);
                }

                $lote = Lote::where('id', $idLote)
                    ->where('id_producto', $idProducto)
                    ->lockForUpdate()
                    ->first();

                if (!$lote) {
                    return response()->json([
                        'success' => false,
                        'message' => "El lote seleccionado no es válido para el producto #{$idProducto}",
                    ], 422);
                }

                if ((int) $lote->cantidad_disponible < $cantidadEntregada) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente en lote {$lote->numero_lote} para producto #{$idProducto}",
                    ], 422);
                }

                $inventario = Inventario::where('id_productos', $idProducto)->first();
                $disponible = $inventario ? (int) $inventario->cantidad_disponible : 0;
                if ($disponible < $cantidadEntregada) {
                    $producto = Producto::find($idProducto);
                    $nombre = $producto?->descripcion ?? "#{$idProducto}";
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente para {$nombre}. Disponible {$disponible}, solicitado {$cantidadEntregada}",
                    ], 422);
                }
            }

            foreach ($detallesSalida as $item) {
                $idProducto = (int) $item['id_producto'];
                $idLote = (int) $item['id_lote'];
                $cantidadEntregada = (int) $item['cantidad_entregada'];

                $lote = Lote::where('id', $idLote)
                    ->where('id_producto', $idProducto)
                    ->lockForUpdate()
                    ->first();

                if ($lote) {
                    $lote->cantidad_disponible = max(0, (int) $lote->cantidad_disponible - $cantidadEntregada);
                    $lote->cantidad = max(0, (int) $lote->cantidad - $cantidadEntregada);
                    $lote->save();
                }

                $detalleOrden = $detallesOrden->get($idProducto);
                if ($detalleOrden) {
                    $detalleOrden->id_lote = $idLote;
                    $detalleOrden->save();
                }

                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'id_lote' => $idLote,
                    'tipo_movimiento' => 'Salida',
                    'cantidad' => $cantidadEntregada,
                    'motivo' => 'Orden Producto',
                    'referencia' => $orden->numero_orden,
                    'id_referencia' => $orden->id,
                    'id_usuario' => $idUsuario,
                    'observacion' => trim("Salida confirmada por almacén. {$observacion}"),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salida confirmada correctamente y registrada en Kardex',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al confirmar salida de productos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generar PDF de orden de producto
     */
    public function generarPDF($id, Request $request)
    {
        $orden = OrdenProducto::with(['cliente', 'cotizacion', 'emisor', 'detalles.producto'])
                              ->find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de producto no encontrada'
            ], 404);
        }

        // Siempre Multitasking (id:2) para productos
        $multicim = Multicim::find(2);

        if (!$multicim) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró la información de pago (Multicim)'
            ], 500);
        }

        $pdf = Pdf::loadView('OrdenProductoPDF', compact('orden', 'multicim'))
                  ->setPaper('a4', 'portrait');

        if ($request->get('descargar') === 'true') {
            return $pdf->download('orden-producto-' . $orden->numero_orden . '.pdf');
        }

        return $pdf->stream('orden-producto-' . $orden->numero_orden . '.pdf');
    }
}
