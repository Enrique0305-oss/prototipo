<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proyeccion;
use App\Models\OrdenServicio;
use App\Models\OrdenProducto;
use App\Models\OrdenCapacitacionAuditoria;
use App\Models\Multicim;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ProyeccionesController extends Controller
{
/**
     * PASO 1: Buscar datos para el Modal (Autocompletado Multitabla)
     * GET /api/v1/proyecciones/buscar-orden/{tipo}/{id}
     */
    public function obtenerDatosOrden($tipo, $id): JsonResponse
    {
        $orden = null;
        $dataRespuesta = [];

        switch ($tipo) {
            case 'servicio':
                // Cargamos la orden con sus detalles y la relación servicio de cada detalle
                $orden = OrdenServicio::with(['cliente', 'detalles.servicio', 'cotizacion.detalles'])->find($id);
                
                if ($orden) {
                    $montoOriginal = $orden->total_costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $totalFinal = $montoOriginal - $montoDetrax;

                    // --- SERVICIOS DETALLADOS CON FRECUENCIAS (AGRUPADOS POR SERVICIO ÚNICO) ---
                    $serviciosDetallados = [];
                    $serviciosUnicos = [];
                    
                    foreach ($orden->detalles as $det) {
                        $nombreServicio = $det->servicio ? $det->servicio->nombre : 'Servicio';
                        $frecuencia = $det->frecuencia ?? 'S/N';
                        $clave = $nombreServicio . '|' . $frecuencia; // Clave única
                        
                        // Solo agregar si no existe esta combinación
                        if (!isset($serviciosUnicos[$clave])) {
                            $serviciosUnicos[$clave] = true;
                            $serviciosDetallados[] = [
                                'nombre' => $nombreServicio,
                                'frecuencia' => $frecuencia
                            ];
                        }
                    }

                    // --- PARA VISUALIZACIÓN EN TEXTO (ANTIGUO FORMATO) ---
                    $serviciosArray = $orden->detalles->map(function($det) {
                        return $det->servicio ? $det->servicio->nombre : 'Servicio';
                    })->unique()->toArray();
                    $servicioNombre = implode(', ', $serviciosArray);

                    // --- PARA MÚLTIPLES FRECUENCIAS ---
                    $frecuenciasArray = $orden->detalles->map(function($det) {
                        return $det->frecuencia ?? 'S/N';
                    })->unique()->toArray();
                    $frecuenciaTexto = implode(', ', $frecuenciasArray);

                    // Si por alguna razón no hay servicios en detalles, intentamos con la descripción de la cotización
                    if (empty($servicioNombre)) {
                        $servicioNombre = $orden->cotizacion->detalles->first()->descripcion_manual ?? 'Servicio de Inspección';
                    }
                    // -----------------------------------------

                    $empresa = Multicim::find($orden->emitido_por);

                    $dataRespuesta = [
                        'id_referencia'   => $orden->id,
                        'numero_orden'    => $orden->numero_orden,
                        'actividad'       => '',
                        'alias_empresa'   => $empresa->alias_empresa ?? 'MULTI',
                        'nombre_cliente'  => $orden->cliente->nombre_empresa ?? 'S/N',
                        'servicio'        => $servicioNombre, // Esto llenará tu input de "Servicio"
                        'frecuencia'      => $frecuenciaTexto, // Esto llenará tu input de "Frecuencia"
                        'servicios_detallados' => $serviciosDetallados, // Array para la tabla
                        'subtotal'        => round($montoOriginal / 1.18, 2),
                        'igv'             => round($montoOriginal - ($montoOriginal / 1.18), 2),
                        'precio_total_os' => round($montoOriginal, 2),
                        'monto_detrax'    => round($montoDetrax, 2),
                        'total_final'     => round($totalFinal, 2),
                    ];
                }
                break;
            case 'producto':
                $orden = OrdenProducto::with(['cliente'])->find($id);
                if ($orden) {
                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_comercial ?? 'S/N',
                        'monto_detrax'  => 0,
                        'total_final'   => $orden->total,
                        'servicio'      => 'Orden de Producto',
                        'frecuencia'    => 'Única',
                        'servicios_detallados' => [
                            [
                                'nombre' => 'Orden de Producto',
                                'frecuencia' => 'Única'
                            ]
                        ],
                        'actividad'     => "Venta de Producto - " . ($orden->cliente->nombre_comercial ?? '')
                    ];
                }
                break;

            case 'capacitacion':
                $orden = OrdenCapacitacionAuditoria::with(['cliente'])->find($id);
                if ($orden) {
                    $montoOriginal = $orden->costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_comercial ?? 'S/N',
                        'monto_detrax'  => round($montoDetrax, 2),
                        'total_final'   => round($montoOriginal - $montoDetrax, 2),
                        'servicio'      => 'Orden de Capacitación',
                        'frecuencia'    => 'Única',
                        'servicios_detallados' => [
                            [
                                'nombre' => 'Orden de Capacitación',
                                'frecuencia' => 'Única'
                            ]
                        ],
                        'actividad'     => "Capacitación - " . ($orden->cliente->nombre_comercial ?? '')
                    ];
                }
                break;
        }

        if (!$orden) {
            return response()->json(['success' => false, 'message' => 'Orden no encontrada'], 404);
        }

        return response()->json(['success' => true, 'data' => $dataRespuesta]);
    }

    /**
     * PASO 2: Guardar la Proyección
     * POST /api/v1/proyecciones
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_multicim'   => 'required|exists:multicim,id',
            'tipo_orden'    => 'required|in:servicio,producto,capacitacion',
            'id_referencia' => 'required|integer',
            'actividad'     => 'nullable|string',
            'monto_detrax'  => 'required|numeric',
            'total_final'   => 'required|numeric',
            'n_factura'     => 'nullable|string',
            'fecha_factura' => 'nullable|date',
            'dias_credito'  => 'nullable|integer',
            'dia_vencer'    => 'nullable|integer',
            'fecha_vcto'    => 'nullable|date',
            'fecha_pago'    => 'nullable|date',
            'fecha_ejecucion' => 'nullable|date', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Lógica de fechas (igual que la tienes)...
        $fechaVcto = null;
        $diaVencer = null;
        
        if ($request->filled('fecha_factura')) {
            $fechaFactura = Carbon::parse($request->fecha_factura);
            $dias = $request->dias_credito ?? 0;
            $fechaVcto = $fechaFactura->copy()->addDays($dias);
            $diaVencer = (int) Carbon::now()->startOfDay()->diffInDays($fechaVcto, false);
        }

        // Si se envía fecha_vcto directamente, usarla
        if ($request->filled('fecha_vcto')) {
            $fechaVcto = $request->fecha_vcto;
        }

        // Si se envía dia_vencer directamente, usarlo
        if ($request->filled('dia_vencer')) {
            $diaVencer = $request->dia_vencer;
        }

        // SOLO CAMPOS QUE EXISTEN EN TU IMAGEN DE BD
        $data = [
            'actividad'     => $request->actividad,
            'id_multicim'   => $request->id_multicim,
            'n_factura'     => $request->n_factura,
            'monto_detrax'  => $request->monto_detrax,
            'total_final'   => $request->total_final,
            'fecha_factura' => $request->fecha_factura,
            'dias_credito'  => $request->dias_credito,
            'fecha_pago'    => $request->fecha_pago,
            'fecha_vcto'    => $fechaVcto ? (is_string($fechaVcto) ? $fechaVcto : $fechaVcto->format('Y-m-d')) : null,
            'dia_vencer'    => $diaVencer,
            'fecha_ejecucion' => $request->fecha_ejecucion
        ];

        // Asignación de ID según tipo
        if ($request->tipo_orden === 'servicio') $data['id_orden_servicio'] = $request->id_referencia;
        if ($request->tipo_orden === 'producto') $data['id_orden_producto'] = $request->id_referencia;
        if ($request->tipo_orden === 'capacitacion') $data['id_orden_capacitacion_auditoria'] = $request->id_referencia;

        $proyeccion = Proyeccion::create($data);
        return response()->json(['success' => true, 'data' => $proyeccion]);
    }

    /**
     * Listar todas las Proyecciones (Para la tabla principal)
     */
    public function index(): JsonResponse
    {
        $proyecciones = Proyeccion::with([
            'multicimEmisora', 
            'ordenServicio.cliente', 
            'ordenServicio.detalles.servicio',
            'ordenProducto.cliente', 
            'ordenCapacitacion.cliente'
        ])
        ->orderBy('fecha_vcto', 'asc')
        ->get()
        ->map(function($p) {
            $detallesRelacionados = [];
            $serviciosUnicos = [];

            if ($p->ordenServicio && $p->ordenServicio->detalles) {
                foreach ($p->ordenServicio->detalles as $det) {
                    $nombreServicio = $det->servicio ? $det->servicio->nombre : 'Servicio';
                    $frecuencia = $det->frecuencia ?? 'S/N';
                    $clave = $nombreServicio . '|' . $frecuencia;
                    
                    // Solo agregar si no existe esta combinación
                    if (!isset($serviciosUnicos[$clave])) {
                        $serviciosUnicos[$clave] = true;
                        $detallesRelacionados[] = [
                            'nombre' => $nombreServicio,
                            'frecuencia' => $frecuencia
                        ];
                    }
                }
            }

            // Enviamos el array de objetos directamente
            $p->servicios_detallados = $detallesRelacionados;
            
            return $p;
        });
        
        return response()->json(['success' => true, 'data' => $proyecciones]);
    }

    /**
     * Obtener una Proyección específica
     * GET /api/v1/proyecciones/{id}
     */
    public function show($id): JsonResponse
    {
        $proyeccion = Proyeccion::with([
            'multicimEmisora', 
            'ordenServicio.cliente', 
            'ordenServicio.detalles.servicio',
            'ordenProducto.cliente', 
            'ordenCapacitacion.cliente'
        ])->find($id);

        if (!$proyeccion) {
            return response()->json(['success' => false, 'message' => 'Proyección no encontrada'], 404);
        }

        // Construir servicios_detallados si es orden de servicio (agrupados por servicio único)
        $detallesRelacionados = [];
        $serviciosUnicos = [];
        
        if ($proyeccion->ordenServicio && $proyeccion->ordenServicio->detalles) {
            foreach ($proyeccion->ordenServicio->detalles as $det) {
                $nombreServicio = $det->servicio ? $det->servicio->nombre : 'Servicio';
                $frecuencia = $det->frecuencia ?? 'S/N';
                $clave = $nombreServicio . '|' . $frecuencia;
                
                // Solo agregar si no existe esta combinación
                if (!isset($serviciosUnicos[$clave])) {
                    $serviciosUnicos[$clave] = true;
                    $detallesRelacionados[] = [
                        'nombre' => $nombreServicio,
                        'frecuencia' => $frecuencia
                    ];
                }
            }
        }
        $proyeccion->servicios_detallados = $detallesRelacionados;

        return response()->json(['success' => true, 'data' => $proyeccion]);
    }

    /**
     * Actualizar una Proyección
     * PUT /api/v1/proyecciones/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $proyeccion = Proyeccion::find($id);

        if (!$proyeccion) {
            return response()->json(['success' => false, 'message' => 'Proyección no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_multicim'     => 'nullable|integer|exists:multicim,id',
            'actividad'       => 'nullable|string',
            'n_factura'       => 'nullable|string',
            'fecha_factura'   => 'nullable|date',
            'dias_credito'    => 'nullable|integer',
            'dia_vencer'      => 'nullable|integer',
            'fecha_vcto'      => 'nullable|date',
            'fecha_pago'      => 'nullable|date',
            'fecha_ejecucion' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Recalcular fechas si es necesario
        $fechaVcto = $request->filled('fecha_vcto') ? $request->fecha_vcto : $proyeccion->fecha_vcto;
        $diaVencer = $request->filled('dia_vencer') ? $request->dia_vencer : $proyeccion->dia_vencer;

        if ($request->filled('fecha_factura')) {
            $fechaFactura = Carbon::parse($request->fecha_factura);
            $dias = $request->dias_credito ?? $proyeccion->dias_credito ?? 0;
            $fechaVcto = $fechaFactura->copy()->addDays($dias);
            $diaVencer = (int) Carbon::now()->startOfDay()->diffInDays($fechaVcto, false);
        }

        $data = [
            'id_multicim'     => $request->id_multicim ?? $proyeccion->id_multicim,
            'actividad'       => $request->actividad ?? $proyeccion->actividad,
            'n_factura'       => $request->n_factura ?? $proyeccion->n_factura,
            'fecha_factura'   => $request->fecha_factura ?? $proyeccion->fecha_factura,
            'dias_credito'    => $request->dias_credito ?? $proyeccion->dias_credito,
            'dia_vencer'      => $diaVencer,
            'fecha_vcto'      => $fechaVcto,
            'fecha_pago'      => $request->fecha_pago ?? $proyeccion->fecha_pago,
            'fecha_ejecucion' => $request->fecha_ejecucion ?? $proyeccion->fecha_ejecucion,
        ];
        
        \Log::info('Actualizando proyección', ['id' => $id, 'request_id_multicim' => $request->id_multicim, 'data_id_multicim' => $data['id_multicim']]);

        $proyeccion->update($data);
        
        // Recargar la proyección con las relaciones actualizadas
        $proyeccion = $proyeccion->fresh(['multicimEmisora']);

        return response()->json(['success' => true, 'data' => $proyeccion]);
    }

    /**
     * Eliminar una Proyección
     * DELETE /api/v1/proyecciones/{id}
     */
    public function destroy($id): JsonResponse
    {
        $proyeccion = Proyeccion::find($id);

        if (!$proyeccion) {
            return response()->json(['success' => false, 'message' => 'Proyección no encontrada'], 404);
        }

        $proyeccion->delete();

        return response()->json(['success' => true, 'message' => 'Proyección eliminada correctamente']);
    }

    /**
     * Obtener órdenes pendientes de registrar (sin proyección)
     * Solo para productos y capacitaciones (servicios se crean automáticamente)
     * GET /api/v1/proyecciones/pendientes
     */
    public function obtenerOrdenesPendientes(): JsonResponse
    {
        try {
            $pendientes = [
                'productos' => [],
                'capacitaciones' => [],
                'total' => 0
            ];

            // Órdenes de producto sin proyección
            $ordenesProducto = OrdenProducto::with('cliente')
                ->whereNotIn('id', function($query) {
                    $query->select('id_referencia')
                        ->from('proyecciones')
                        ->where('tipo_orden', 'producto');
                })
                ->where('estado', '!=', 'cancelada')
                ->get();

            foreach ($ordenesProducto as $op) {
                $pendientes['productos'][] = [
                    'id' => $op->id,
                    'cliente' => $op->cliente ? $op->cliente->nombre_empresa : '---',
                    'total_costo' => $op->total_costo,
                    'fecha_creacion' => $op->fecha_inicio ?? $op->created_at
                ];
            }

            // Órdenes de capacitación sin proyección
            $ordenesCapacitacion = OrdenCapacitacionAuditoria::with('cliente')
                ->whereNotIn('id', function($query) {
                    $query->select('id_referencia')
                        ->from('proyecciones')
                        ->where('tipo_orden', 'capacitacion');
                })
                ->where('estado', '!=', 'cancelada')
                ->get();

            foreach ($ordenesCapacitacion as $oc) {
                $pendientes['capacitaciones'][] = [
                    'id' => $oc->id,
                    'cliente' => $oc->cliente ? $oc->cliente->nombre_empresa : '---',
                    'total_costo' => $oc->total_costo,
                    'fecha_creacion' => $oc->fecha_inicio ?? $oc->created_at
                ];
            }

            $pendientes['total'] = count($pendientes['productos']) + 
                                   count($pendientes['capacitaciones']);

            return response()->json([
                'success' => true,
                'data' => $pendientes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener órdenes pendientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear automáticamente una proyección para una orden de servicio
     * Llamado desde OrdenServicioController en create/update
     */
    public static function crearProyeccionAutomaticaServicio($ordenServicio, $multicimId = null)
    {
        try {
            // Verificar si ya existe proyección para esta orden
            $proyeccionExistente = Proyeccion::where('tipo_orden', 'servicio')
                ->where('id_referencia', $ordenServicio->id)
                ->first();

            if ($proyeccionExistente) {
                // Si existe, actualizar datos relevantes
                return self::actualizarProyeccionServicio($proyeccionExistente, $ordenServicio);
            }

            // Obtener primera empresa multicim si no se proporciona
            if (!$multicimId) {
                $primerMulticim = Multicim::first();
                $multicimId = $primerMulticim ? $primerMulticim->id : 1;
            }

            // Crear nueva proyección
            $proyeccion = Proyeccion::create([
                'id_multicim' => $multicimId,
                'tipo_orden' => 'servicio',
                'id_referencia' => $ordenServicio->id,
                'actividad' => null, // Se completa al editar
                'n_factura' => null,
                'dias_credito' => null,
                'fecha_factura' => null,
                'fecha_pago' => null,
                'fecha_ejecucion' => $ordenServicio->fecha_tentativa,
                'fecha_vcto' => null,
                'dia_vencer' => null,
                'monto_detrax' => ($ordenServicio->total_costo > 700) ? ($ordenServicio->total_costo * 0.12) : 0,
                'total_final' => $ordenServicio->total_costo - (($ordenServicio->total_costo > 700) ? ($ordenServicio->total_costo * 0.12) : 0),
            ]);

            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error creando proyección automática: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Actualizar una proyección existente de servicio
     */
    public static function actualizarProyeccionServicio($proyeccion, $ordenServicio)
    {
        try {
            $proyeccion->update([
                'fecha_ejecucion' => $ordenServicio->fecha_tentativa,
                'monto_detrax' => ($ordenServicio->total_costo > 700) ? ($ordenServicio->total_costo * 0.12) : 0,
                'total_final' => $ordenServicio->total_costo - (($ordenServicio->total_costo > 700) ? ($ordenServicio->total_costo * 0.12) : 0),
            ]);

            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error actualizando proyección: ' . $e->getMessage());
            return null;
        }
    }
}