<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenServicio;
use App\Models\DetalleOrdenServicio;
use App\Models\OrdenServicioProducto;
use App\Models\OrdenServicioEquipo;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use App\Models\Proyeccion;
use App\Models\ProgramacionServicio;
use App\Models\ProgramacionInsumo;
use App\Models\Kardex;
use App\Models\ServicioProducto;
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
                'descripcion_manual' => $detalle->descripcion_manual,
                'servicio_nombre' => $detalle->servicio ? $detalle->servicio->nombre : ($detalle->descripcion_manual ?? null),
                'frecuencia' => $detalle->frecuencia_sugerida,
                'precio' => $detalle->precio_unitario,
                'id_cliente_planta' => $detalle->id_cliente_planta,
                'id_cliente_planta_area' => $detalle->id_cliente_planta_area,
                'fosfina_producto' => $detalle->fosfina_producto ?? null,
                'fosfina_cantidad' => $detalle->fosfina_cantidad ?? null,
                'medida_tanque' => $detalle->medida_tanque ?? null,
            ];
        });

        $recetaServicio = collect($cotizacion->receta_servicio ?? []);
        if ($recetaServicio->isEmpty()) {
            $recetaServicio = $cotizacion->detalles->flatMap(function ($detalle) {
                $recetas = $detalle->servicio?->productosReceta ?? collect();

                return $recetas->map(function ($receta) use ($detalle) {
                    return [
                        'id_servicio' => $detalle->id_servicio,
                        'id_equipo' => $receta->id_equipo,
                        'equipo_descripcion' => $receta->equipo?->descripcion ?? '',
                        'id_producto' => $receta->id_producto,
                        'cantidad' => $receta->cantidad_default,
                        'observacion' => $receta->observacion,
                        'id_cliente_planta' => $detalle->id_cliente_planta,
                        'id_cliente_planta_area' => $detalle->id_cliente_planta_area,
                    ];
                });
            });
        }

        $productos = [];
        $equipos = [];
        $productosIndex = [];
        $equiposIndex = [];

        foreach ($recetaServicio as $row) {
            $idServicio = (int) ($row['id_servicio'] ?? 0);
            $idPlanta = $row['id_cliente_planta'] ?? null;
            $idArea = $row['id_cliente_planta_area'] ?? null;
            $idEquipo = $row['id_equipo'] ?? null;
            $idProducto = (int) ($row['id_producto'] ?? 0);

            if (!$idServicio || !$idProducto) {
                continue;
            }

            $areaKey = is_array($idArea) ? json_encode($idArea) : ($idArea ?? 0);
            $productoKey = implode('|', [
                $idServicio,
                $idPlanta ?? 0,
                $areaKey,
                $idEquipo ?? 0,
                $idProducto,
            ]);

            if (!isset($productosIndex[$productoKey])) {
                $productosIndex[$productoKey] = true;
                $productos[] = [
                    'id_producto' => $idProducto,
                    'cantidad' => (float) ($row['cantidad'] ?? 1),
                    'observacion' => (string) ($row['observacion'] ?? ''),
                    'id_servicio' => $idServicio,
                    'id_cliente_planta' => $idPlanta,
                    'id_cliente_planta_area' => is_array($idArea) ? ($idArea[0] ?? null) : $idArea,
                    'id_equipo' => $idEquipo ?: null,
                    'equipo_descripcion' => (string) ($row['equipo_descripcion'] ?? ''),
                ];
            }

            if (!$idEquipo) {
                continue;
            }

            $equipoKey = implode('|', [
                $idServicio,
                $idPlanta ?? 0,
                $areaKey,
                $idEquipo,
            ]);

            if (!isset($equiposIndex[$equipoKey])) {
                $equiposIndex[$equipoKey] = true;
                $equipos[] = [
                    'id_equipo' => $idEquipo,
                    'observacion' => (string) ($row['observacion'] ?? ''),
                    'equipo_descripcion' => (string) ($row['equipo_descripcion'] ?? ''),
                    'id_servicio' => $idServicio,
                    'id_cliente_planta' => $idPlanta,
                    'id_cliente_planta_area' => is_array($idArea) ? ($idArea[0] ?? null) : $idArea,
                ];
            }
        }

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
                'productos' => $productos,
                'equipos' => $equipos,
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
            'detalles.*.id_servicio' => 'nullable|exists:servicios,id',
            'detalles.*.descripcion_manual' => 'nullable|string',
            'detalles.*.local' => 'nullable|string|max:255',
            'detalles.*.frecuencia' => 'nullable|string|max:100',
            'detalles.*.precio' => 'required|numeric|min:0',
            'detalles.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'detalles.*.id_cliente_planta_area' => 'nullable|array',
            'detalles.*.id_cliente_planta_area.*' => 'integer|exists:cliente_planta_area,id',
            'detalles.*.fosfina_producto' => 'nullable|string|max:255',
            'detalles.*.fosfina_cantidad' => 'nullable|string|max:50',
            'detalles.*.medida_tanque' => 'nullable',
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
                    'id_servicio' => $detalle['id_servicio'] ?? null,
                    'descripcion_manual' => $detalle['descripcion_manual'] ?? null,
                    'local' => $detalle['local'] ?? null,
                    'frecuencia' => $detalle['frecuencia'] ?? null,
                    'precio' => $detalle['precio'],
                    'id_cliente_planta' => $detalle['id_cliente_planta'] ?? null,
                    'id_cliente_planta_area' => $detalle['id_cliente_planta_area'] ?? null,
                    'fosfina_producto' => $detalle['fosfina_producto'] ?? null,
                    'fosfina_cantidad' => $detalle['fosfina_cantidad'] ?? null,
                    'medida_tanque' => $detalle['medida_tanque'] ?? null,
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
            $orden->load(['cliente', 'emisor', 'detalles.servicio', 'detalles.planta', 'cotizacion', 'productos.producto', 'productos.servicio', 'productos.planta', 'productos.area', 'productos.equipo', 'equipos.equipo', 'equipos.servicio', 'equipos.planta', 'equipos.area']);

            // Crear automáticamente proyección para orden de servicio
            ProyeccionesController::crearProyeccionAutomaticaServicio($orden);

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
            'detalles.*.id_cliente_planta_area' => 'nullable|array',
            'detalles.*.id_cliente_planta_area.*' => 'integer|exists:cliente_planta_area,id',
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

            $bloqueado = in_array($orden->estado, ['Programado', 'Parcial', 'Completado']);

            if ($bloqueado) {
                // Si está bloqueada, por seguridad ignoramos cualquier intento de cambiar servicios, fechas u observaciones.
                unset($validated['fecha_aceptacion']);
                unset($validated['fecha_tentativa']);
                unset($validated['observaciones']);
                unset($validated['detalles']);
                unset($validated['incluye_igv']);
                // El estado solo podría cambiar si explícitamente se permite (ej. pasar a completado por otro flujo)
                // Pero desde el frontend de edición, no debería cambiar.
            }

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
            if (isset($validated['observaciones'])) {
                $orden->observaciones = $validated['observaciones'];
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
                        'fosfina_producto' => $detalle['fosfina_producto'] ?? null,
                        'fosfina_cantidad' => $detalle['fosfina_cantidad'] ?? null,
                        'medida_tanque' => $detalle['medida_tanque'] ?? null,
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

            // Sincronización automática de Programaciones Futuras
            $idUsuario = $request->user()?->id;

            $programacionesPendientes = ProgramacionServicio::with('insumos')
                ->where('id_orden_servicio', $orden->id)
                ->whereIn('estado_ejecucion', ['Programado', 'Reprogramado', 'Cancelado'])
                ->get();

            $viejosServicios = $programacionesPendientes->pluck('id_servicio')->unique();
            $nuevosServicios = collect($validated['detalles'] ?? [])->pluck('id_servicio')->unique();

            foreach ($programacionesPendientes as $prog) {
                // Recuperar si fue cancelado accidentalmente por el bug anterior
                if ($prog->estado_ejecucion === 'Cancelado' && str_contains($prog->observaciones ?? '', 'Cancelado automáticamente por eliminación de servicio en la OS original')) {
                    $prog->estado_ejecucion = 'Programado';
                    $prog->observaciones = str_replace("\nCancelado automáticamente por eliminación de servicio en la OS original.", "", $prog->observaciones);
                }

                // Mapeo inteligente de servicios
                if (!$nuevosServicios->contains($prog->id_servicio)) {
                    if ($nuevosServicios->count() === 1) {
                        // Si ahora solo hay un servicio en la OS, asumimos que todas las programaciones pasan a este nuevo servicio.
                        $prog->id_servicio = $nuevosServicios->first();
                        $prog->save();
                    } else {
                        // Si hay múltiples servicios nuevos y no sabemos a cuál mapear, intentamos mapear por Planta/Área
                        $detalleCoincidente = collect($validated['detalles'] ?? [])->first(function($det) use ($prog) {
                            return ($det['id_cliente_planta'] ?? null) == $prog->id_cliente_planta 
                                && ($det['id_cliente_planta_area'] ?? null) == $prog->id_cliente_planta_area;
                        });
                        
                        if ($detalleCoincidente) {
                            $prog->id_servicio = $detalleCoincidente['id_servicio'];
                            $prog->save();
                        } else {
                            // Si ni siquiera coinciden la planta/área, no lo cancelamos, simplemente lo dejamos con el servicio anterior
                            // o lo asignamos al primer servicio disponible para evitar que desaparezca.
                            $prog->id_servicio = $nuevosServicios->first() ?? $prog->id_servicio;
                            $prog->save();
                        }
                    }
                }

                // Resincronizar insumos si no se canceló
                if ($prog->estado_ejecucion !== 'Cancelado') {
                    foreach ($prog->insumos as $insumo) {
                        if ($insumo->estado === 'Utilizado') {
                            Kardex::registrarMovimiento([
                                'id_producto' => $insumo->id_producto,
                                'tipo_movimiento' => 'Entrada',
                                'cantidad' => $insumo->cantidad_asignada,
                                'motivo' => 'Devolución Edición OS',
                                'referencia' => "PROG-{$prog->id}",
                                'id_referencia' => $prog->id,
                                'id_usuario' => $idUsuario,
                                'observacion' => "Devolución automática por edición de Orden de Servicio #{$orden->numero_orden}",
                            ]);
                        }
                    }

                    $prog->insumos()->delete();

                    $insumosOrden = OrdenServicioProducto::query()
                        ->where('id_orden_servicio', $orden->id)
                        ->where(function($q) use ($prog) {
                            $q->where('id_servicio', $prog->id_servicio)
                              ->orWhereNull('id_servicio');
                        })
                        ->get();

                    // RESILIENCIA AL FRONTEND: Si el frontend envió el detalle con un id_servicio antiguo (ej. 3) 
                    // pero los productos con el nuevo id_servicio (ej. 13), la consulta anterior devolverá 0.
                    // En ese caso, buscamos los insumos de esta orden que coincidan por Planta y Área.
                    if ($insumosOrden->isEmpty() && $prog->id_cliente_planta) {
                        $insumosOrden = OrdenServicioProducto::query()
                            ->where('id_orden_servicio', $orden->id)
                            ->where('id_cliente_planta', $prog->id_cliente_planta)
                            ->get()
                            ->filter(function($item) use ($prog) {
                                $progAreas = is_string($prog->id_cliente_planta_area) ? json_decode($prog->id_cliente_planta_area, true) : $prog->id_cliente_planta_area;
                                $itemArea = $item->id_cliente_planta_area;
                                if (empty($progAreas) || empty($itemArea)) return true; // Si alguno no tiene área, lo asumimos general de la planta
                                return is_array($progAreas) && in_array($itemArea, $progAreas);
                            })->values();

                        // Si los encontramos por Planta/Área, auto-corregimos el id_servicio de la Programación
                        // para que coincida con la realidad de los productos.
                        if ($insumosOrden->isNotEmpty()) {
                            $realIdServicio = $insumosOrden->first()->id_servicio;
                            if ($realIdServicio) {
                                $prog->id_servicio = $realIdServicio;
                                $prog->save();
                            }
                        }
                    }

                    $insumosOrden = collect($insumosOrden)
                        ->groupBy('id_producto')
                        ->map(fn ($rows, $idProducto) => [
                            'id_producto' => (int) $idProducto,
                            'cantidad' => (int) round((float) $rows->sum('cantidad')),
                        ])
                        ->filter(fn ($item) => $item['cantidad'] > 0)
                        ->values();

                    if ($insumosOrden->isEmpty()) {
                        $insumosOrden = ServicioProducto::where('id_servicio', $prog->id_servicio)
                            ->get()
                            ->map(fn ($item) => [
                                'id_producto' => (int) $item->id_producto,
                                'cantidad' => (int) round((float) $item->cantidad_default),
                            ])
                            ->filter(fn ($item) => $item['cantidad'] > 0)
                            ->values();
                    }

                    foreach ($insumosOrden as $item) {
                        ProgramacionInsumo::create([
                            'id_programacion' => $prog->id,
                            'id_producto' => $item['id_producto'],
                            'cantidad_asignada' => $item['cantidad'],
                            'estado' => 'Asignado',
                        ]);
                    }
                } elseif ($prog->estado_ejecucion === 'Cancelado') {
                    // Si se canceló, devolver todo
                    foreach ($prog->insumos as $insumo) {
                        if ($insumo->estado === 'Utilizado') {
                            Kardex::registrarMovimiento([
                                'id_producto' => $insumo->id_producto,
                                'tipo_movimiento' => 'Entrada',
                                'cantidad' => $insumo->cantidad_asignada,
                                'motivo' => 'Devolución Cancelación OS',
                                'referencia' => "PROG-{$prog->id}",
                                'id_referencia' => $prog->id,
                                'id_usuario' => $idUsuario,
                                'observacion' => "Cancelación automática por edición de Orden de Servicio",
                            ]);
                        }
                    }
                    $prog->insumos()->delete();
                }
            }

            DB::commit();

            $orden->load(['cliente', 'emisor', 'detalles.servicio', 'detalles.planta', 'cotizacion', 'productos.producto', 'productos.servicio', 'productos.planta', 'productos.area', 'productos.equipo', 'equipos.equipo', 'equipos.servicio', 'equipos.planta', 'equipos.area']);

            // Actualizar automáticamente proyección para orden de servicio
            ProyeccionesController::actualizarProyeccionServicio($orden);

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
            'detalles.servicio', 'detalles.planta', 
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
