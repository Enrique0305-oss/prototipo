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
                $orden = OrdenProducto::with(['cliente', 'cotizacion', 'detalles.producto'])->find($id);
                if ($orden) {
                    $multicimId = $orden->cotizacion ? $orden->cotizacion->id_multicim : null;
                    if (!$multicimId) {
                        $primerMulticim = Multicim::first();
                        $multicimId = $primerMulticim ? $primerMulticim->id : 1;
                    }

                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'id_multicim'   => $multicimId,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_empresa ?? $orden->cliente->nombre_comercial ?? 'S/N',
                        'subtotal'      => $orden->subtotal,
                        'igv'           => $orden->igv,
                        'precio_total_os'=> $orden->total,
                        'monto_detrax'  => 0,
                        'total_final'   => $orden->total,
                        'servicio'      => 'Orden de Producto',
                        'frecuencia'    => 'Única',
                        'servicios_detallados' => $orden->detalles->map(fn($d) => [
                            'nombre' => $d->producto->descripcion ?? 'Producto',
                            'frecuencia' => 'Cant: ' . $d->cantidad
                        ]),
                        'actividad'     => null
                    ];
                }
                break;

            case 'capacitacion':
                $orden = OrdenCapacitacionAuditoria::with(['cliente', 'cotizacion'])->find($id);
                if ($orden) {
                    $montoOriginal = $orden->costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $multicimId = $orden->cotizacion ? $orden->cotizacion->id_multicim : null;
                    if (!$multicimId) {
                        $primerMulticim = Multicim::first();
                        $multicimId = $primerMulticim ? $primerMulticim->id : 1;
                    }

                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'id_multicim'   => $multicimId,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_empresa ?? $orden->cliente->nombre_comercial ?? 'S/N',
                        'subtotal'      => $orden->subtotal,
                        'igv'           => $orden->igv,
                        'precio_total_os'=> $orden->costo,
                        'monto_detrax'  => round($montoDetrax, 2),
                        'total_final'   => round($montoOriginal - $montoDetrax, 2),
                        'servicio'      => 'Orden de Capacitación',
                        'frecuencia'    => 'Única',
                        'servicios_detallados' => [
                            [
                                'nombre' => 'Servicio de Capacitación',
                                'frecuencia' => $orden->modalidad
                            ]
                        ],
                        'actividad'     => "Capacitación - " . $orden->numero_orden
                    ];
                }
                break;

            case 'auditoria':
                $orden = \App\Models\OrdenAuditoria::with(['cliente', 'cotizacion', 'servicio'])->find($id);
                if ($orden) {
                    $montoOriginal = $orden->costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $multicimId = $orden->cotizacion ? $orden->cotizacion->id_multicim : null;
                    if (!$multicimId) {
                        $primerMulticim = Multicim::first();
                        $multicimId = $primerMulticim ? $primerMulticim->id : 1;
                    }

                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'id_multicim'   => $multicimId,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_empresa ?? $orden->cliente->nombre_comercial ?? 'S/N',
                        'subtotal'      => $orden->subtotal,
                        'igv'           => $orden->igv,
                        'precio_total_os'=> $orden->costo,
                        'monto_detrax'  => round($montoDetrax, 2),
                        'total_final'   => round($montoOriginal - $montoDetrax, 2),
                        'servicio'      => 'Orden de Auditoría',
                        'frecuencia'    => 'Única',
                        'servicios_detallados' => [
                            [
                                'nombre' => $orden->servicio->nombre ?? 'Servicio de Auditoría',
                                'frecuencia' => $orden->modalidad
                            ]
                        ],
                        'actividad'     => "Auditoría - " . $orden->numero_orden
                    ];
                }
                break;

            case 'asesoria':
                $orden = \App\Models\OrdenAsesoria::with(['cliente', 'cotizacion', 'servicio'])->find($id);
                if ($orden) {
                    $montoOriginal = $orden->costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $multicimId = $orden->cotizacion ? $orden->cotizacion->id_multicim : null;
                    if (!$multicimId) {
                        $primerMulticim = Multicim::first();
                        $multicimId = $primerMulticim ? $primerMulticim->id : 1;
                    }

                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'id_multicim'   => $multicimId,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_empresa ?? $orden->cliente->nombre_comercial ?? 'S/N',
                        'subtotal'      => $orden->subtotal,
                        'igv'           => $orden->igv,
                        'precio_total_os'=> $orden->costo,
                        'monto_detrax'  => round($montoDetrax, 2),
                        'total_final'   => round($montoOriginal - $montoDetrax, 2),
                        'servicio'      => 'Orden de Asesoría',
                        'frecuencia'    => 'Única',
                        'servicios_detallados' => [
                            [
                                'nombre' => $orden->servicio->nombre ?? 'Servicio de Asesoría',
                                'frecuencia' => $orden->modalidad
                            ]
                        ],
                        'actividad'     => "Asesoría - " . $orden->numero_orden
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
            'tipo_orden'    => 'required|in:servicio,producto,capacitacion,asesoria,auditoria',
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
        
        $data['tipo_orden'] = $request->tipo_orden;
        $data['id_referencia'] = $request->id_referencia;

        $proyeccion = Proyeccion::create($data);
        return response()->json(['success' => true, 'data' => $proyeccion]);
    }

    /**
     * Listar todas las Proyecciones (Para la tabla principal)
     * GET /api/v1/proyecciones?mes=5&anio=2026&id_multicim=1
     */
    public function index(Request $request): JsonResponse
    {
        $mes = $request->query('mes', Carbon::now()->month);
        $anio = $request->query('anio', Carbon::now()->year);
        $idMulticim = $request->query('id_multicim'); // Nuevo filtro opcional
        
        $inicioMes = Carbon::createFromDate($anio, $mes, 1)->startOfMonth();
        $finMes = Carbon::createFromDate($anio, $mes, 1)->endOfMonth();

        $query = Proyeccion::with([
            'multicimEmisora', 
            'ordenServicio.cliente', 
            'ordenServicio.detalles.servicio',
            'ordenProducto.cliente', 
            'ordenProducto.detalles.producto',
            'ordenCapacitacion.cliente',
            'ordenCapacitacion.servicio',
            'ordenCapacitacion.cotizacion.detalles.catalogoCapAud',
            'ordenCapacitacion.cotizacion.detalles.servicio',
            'ordenAuditoria.cliente',
            'ordenAuditoria.servicio',
            'ordenAuditoria.cotizacion.detalles.catalogoCapAud',
            'ordenAuditoria.cotizacion.detalles.servicio',
            'ordenAsesoria.cliente',
            'ordenAsesoria.servicio',
            'ordenAsesoria.cotizacion.detalles.catalogoCapAud',
            'ordenAsesoria.cotizacion.detalles.servicio'
        ])
        ->whereBetween('fecha_ejecucion', [$inicioMes, $finMes]);

        // Agregar filtro por empresa si se proporciona
        if ($idMulticim) {
            $query->where('id_multicim', $idMulticim);
        }

        $proyecciones = $query->orderBy('fecha_ejecucion', 'asc')
        ->get()
        ->map(function($p) {
            if (empty($p->servicios_detallados)) {
                $detallesRelacionados = [];
                if ($p->ordenServicio && $p->ordenServicio->detalles) {
                    $serviciosUnicos = [];
                    foreach ($p->ordenServicio->detalles as $det) {
                        $nombreServicio = $det->servicio ? $det->servicio->nombre : 'Servicio';
                        $frecuencia = $det->frecuencia ?? 'S/N';
                        $clave = $nombreServicio . '|' . $frecuencia;
                        if (!isset($serviciosUnicos[$clave])) {
                            $serviciosUnicos[$clave] = true;
                            $detallesRelacionados[] = ['nombre' => $nombreServicio, 'frecuencia' => $frecuencia];
                        }
                    }
                } elseif ($p->ordenProducto && $p->ordenProducto->detalles) {
                    $detallesRelacionados = $p->ordenProducto->detalles->map(fn($d) => [
                        'nombre' => $d->producto->descripcion ?? 'Producto',
                        'frecuencia' => 'Cant: ' . $d->cantidad
                    ]);
                    $p->ordenProducto->precio_total_os = $p->ordenProducto->total;
                } elseif ($p->ordenCapacitacion) {
                    $det = $p->ordenCapacitacion->cotizacion ? $p->ordenCapacitacion->cotizacion->detalles->first() : null;
                    $nombre = $det ? ($det->catalogoCapAud->nombre ?? $det->servicio->nombre ?? $det->descripcion_manual ?? 'Capacitación') : ($p->ordenCapacitacion->servicio->nombre ?? 'Capacitación');
                    $detallesRelacionados = [['nombre' => $nombre, 'frecuencia' => $p->ordenCapacitacion->modalidad ?? 'Única']];
                    $p->ordenCapacitacion->precio_total_os = $p->ordenCapacitacion->costo;
                } elseif ($p->ordenAuditoria) {
                    $det = $p->ordenAuditoria->cotizacion ? $p->ordenAuditoria->cotizacion->detalles->first() : null;
                    $nombre = $det ? ($det->catalogoCapAud->nombre ?? $det->servicio->nombre ?? $det->descripcion_manual ?? 'Auditoría') : ($p->ordenAuditoria->servicio->nombre ?? 'Auditoría');
                    $detallesRelacionados = [['nombre' => $nombre, 'frecuencia' => $p->ordenAuditoria->modalidad ?? 'Única']];
                    $p->ordenAuditoria->precio_total_os = $p->ordenAuditoria->costo;
                } elseif ($p->ordenAsesoria) {
                    $det = $p->ordenAsesoria->cotizacion ? $p->ordenAsesoria->cotizacion->detalles->first() : null;
                    $nombre = $det ? ($det->catalogoCapAud->nombre ?? $det->servicio->nombre ?? $det->descripcion_manual ?? 'Asesoría') : ($p->ordenAsesoria->servicio->nombre ?? 'Asesoría');
                    $detallesRelacionados = [['nombre' => $nombre, 'frecuencia' => $p->ordenAsesoria->modalidad ?? 'Única']];
                    $p->ordenAsesoria->precio_total_os = $p->ordenAsesoria->costo;
                }
                $p->servicios_detallados = $detallesRelacionados;
            }
            
            return $p;
        });
        
        return response()->json(['success' => true, 'data' => $proyecciones, 'mes' => $mes, 'anio' => $anio, 'id_multicim' => $idMulticim]);
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
            'ordenProducto.detalles.producto',
            'ordenCapacitacion.cliente',
            'ordenCapacitacion.servicio',
            'ordenCapacitacion.cotizacion.detalles.catalogoCapAud',
            'ordenCapacitacion.cotizacion.detalles.servicio',
            'ordenAuditoria.cliente',
            'ordenAuditoria.servicio',
            'ordenAuditoria.cotizacion.detalles.catalogoCapAud',
            'ordenAuditoria.cotizacion.detalles.servicio',
            'ordenAsesoria.cliente',
            'ordenAsesoria.servicio',
            'ordenAsesoria.cotizacion.detalles.catalogoCapAud',
            'ordenAsesoria.cotizacion.detalles.servicio'
        ])->find($id);

        if (!$proyeccion) {
            return response()->json(['success' => false, 'message' => 'Proyección no encontrada'], 404);
        }

        if (empty($proyeccion->servicios_detallados)) {
            $detallesRelacionados = [];
            if ($proyeccion->ordenServicio && $proyeccion->ordenServicio->detalles) {
                $serviciosUnicos = [];
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
            } elseif ($proyeccion->ordenProducto && $proyeccion->ordenProducto->detalles) {
                $detallesRelacionados = $proyeccion->ordenProducto->detalles->map(fn($d) => [
                    'nombre' => $d->producto->descripcion ?? 'Producto',
                    'frecuencia' => 'Cant: ' . $d->cantidad
                ]);
                $proyeccion->ordenProducto->precio_total_os = $proyeccion->ordenProducto->total;
            } elseif ($proyeccion->ordenCapacitacion) {
                $det = $proyeccion->ordenCapacitacion->cotizacion ? $proyeccion->ordenCapacitacion->cotizacion->detalles->first() : null;
                $nombre = $det ? ($det->catalogoCapAud->nombre ?? $det->servicio->nombre ?? $det->descripcion_manual ?? 'Capacitación') : ($proyeccion->ordenCapacitacion->servicio->nombre ?? 'Capacitación');
                $detallesRelacionados = [['nombre' => $nombre, 'frecuencia' => $proyeccion->ordenCapacitacion->modalidad ?? 'Única']];
                $proyeccion->ordenCapacitacion->precio_total_os = $proyeccion->ordenCapacitacion->costo;
            } elseif ($proyeccion->ordenAuditoria) {
                $det = $proyeccion->ordenAuditoria->cotizacion ? $proyeccion->ordenAuditoria->cotizacion->detalles->first() : null;
                $nombre = $det ? ($det->catalogoCapAud->nombre ?? $det->servicio->nombre ?? $det->descripcion_manual ?? 'Auditoría') : ($proyeccion->ordenAuditoria->servicio->nombre ?? 'Auditoría');
                $detallesRelacionados = [['nombre' => $nombre, 'frecuencia' => $proyeccion->ordenAuditoria->modalidad ?? 'Única']];
                $proyeccion->ordenAuditoria->precio_total_os = $proyeccion->ordenAuditoria->costo;
            } elseif ($proyeccion->ordenAsesoria) {
                $det = $proyeccion->ordenAsesoria->cotizacion ? $proyeccion->ordenAsesoria->cotizacion->detalles->first() : null;
                $nombre = $det ? ($det->catalogoCapAud->nombre ?? $det->servicio->nombre ?? $det->descripcion_manual ?? 'Asesoría') : ($proyeccion->ordenAsesoria->servicio->nombre ?? 'Asesoría');
                $detallesRelacionados = [['nombre' => $nombre, 'frecuencia' => $proyeccion->ordenAsesoria->modalidad ?? 'Única']];
                $proyeccion->ordenAsesoria->precio_total_os = $proyeccion->ordenAsesoria->costo;
            }
            $proyeccion->servicios_detallados = $detallesRelacionados;
        }

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
            'estado'          => 'nullable|string|in:Sin Factura,Pendiente de pago,Pagado,Anulado',
            'base_imponible'  => 'nullable|numeric',
            'igv'             => 'nullable|numeric',
            'porcentaje_detraccion' => 'nullable|numeric',
            'fecha_pago_detraccion' => 'nullable|date',
            'cotizacion_oc'   => 'nullable|string',
            'observaciones'   => 'nullable|string',
            'registrado_por'  => 'nullable|string',
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
            'base_imponible'  => $request->base_imponible ?? $proyeccion->base_imponible,
            'igv'             => $request->igv ?? $proyeccion->igv,
            'porcentaje_detraccion' => $request->porcentaje_detraccion ?? $proyeccion->porcentaje_detraccion,
            'fecha_pago_detraccion' => $request->fecha_pago_detraccion ?? $proyeccion->fecha_pago_detraccion,
            'cotizacion_oc'   => $request->cotizacion_oc ?? $proyeccion->cotizacion_oc,
            'observaciones'   => $request->observaciones ?? $proyeccion->observaciones,
        ];

        if ($request->filled('estado') && $request->estado !== $proyeccion->estado) {
            $data['estado'] = $request->estado;
            $data['fecha_cambio_estado'] = now();
            if ($request->filled('registrado_por')) {
                $data['registrado_por'] = $request->registrado_por;
            } else if (auth()->check()) {
                $data['registrado_por'] = auth()->user()->nombre ?? auth()->user()->name;
            }
        }
        
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
                'auditorias' => [],
                'asesorias' => [],
                'total' => 0
            ];

            // Órdenes de producto sin proyección
            $ordenesProducto = OrdenProducto::with('cliente')
                ->whereDoesntHave('proyecciones')
                ->where('estado', '!=', 'cancelada')
                ->get();

            foreach ($ordenesProducto as $op) {
                $pendientes['productos'][] = [
                    'id' => $op->id,
                    'cliente' => $op->cliente ? $op->cliente->nombre_empresa : '---',
                    'total_costo' => $op->total_costo ?? $op->total,
                    'fecha_creacion' => $op->fecha_envio ?? $op->created_at
                ];
            }

            // Órdenes de capacitación sin proyección
            $ordenesCapacitacion = OrdenCapacitacionAuditoria::with('cliente')
                ->whereDoesntHave('proyecciones')
                ->where('estado', '!=', 'cancelada')
                ->get();

            foreach ($ordenesCapacitacion as $oc) {
                $pendientes['capacitaciones'][] = [
                    'id' => $oc->id,
                    'cliente' => $oc->cliente ? $oc->cliente->nombre_empresa : '---',
                    'total_costo' => $oc->total_costo ?? $oc->costo,
                    'fecha_creacion' => $oc->fecha_servicio ?? $oc->created_at
                ];
            }

            // Órdenes de auditoría sin proyección
            $ordenesAuditoria = \App\Models\OrdenAuditoria::with('cliente')
                ->whereDoesntHave('proyecciones')
                ->where('estado', '!=', 'cancelada')
                ->get();

            foreach ($ordenesAuditoria as $oa) {
                $pendientes['auditorias'][] = [
                    'id' => $oa->id,
                    'cliente' => $oa->cliente ? $oa->cliente->nombre_empresa : '---',
                    'total_costo' => $oa->costo,
                    'fecha_creacion' => $oa->fecha_servicio ?? $oa->created_at
                ];
            }

            // Órdenes de asesoría sin proyección
            $ordenesAsesoria = \App\Models\OrdenAsesoria::with('cliente')
                ->whereDoesntHave('proyecciones')
                ->where('estado', '!=', 'cancelada')
                ->get();

            foreach ($ordenesAsesoria as $oas) {
                $pendientes['asesorias'][] = [
                    'id' => $oas->id,
                    'cliente' => $oas->cliente ? $oas->cliente->nombre_empresa : '---',
                    'total_costo' => $oas->costo,
                    'fecha_creacion' => $oas->fecha_servicio ?? $oas->created_at
                ];
            }

            $pendientes['total'] = count($pendientes['productos']) + 
                                   count($pendientes['capacitaciones']) +
                                   count($pendientes['auditorias']) +
                                   count($pendientes['asesorias']);

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
     * Duplicar masivamente proyecciones al mes siguiente
     * POST /api/v1/proyecciones/duplicar
     */
    public function duplicarMasivo(Request $request): JsonResponse
    {
        try {
            $ids = $request->input('ids', []);
            if (empty($ids) || !is_array($ids)) {
                return response()->json(['success' => false, 'message' => 'No se enviaron IDs válidos'], 400);
            }

            $proyecciones = Proyeccion::whereIn('id', $ids)->get();
            $duplicadas = 0;
            $bloqueadas = 0;

            foreach ($proyecciones as $proy) {
                // Calcular fecha del próximo mes
                $fechaEjecucion = $proy->fecha_ejecucion ? Carbon::parse($proy->fecha_ejecucion) : Carbon::now();
                $siguienteMes = $fechaEjecucion->copy()->addMonth();

                // Validar si ya existe una proyección para este servicio en el siguiente mes
                $inicioSiguienteMes = $siguienteMes->copy()->startOfMonth();
                $finSiguienteMes = $siguienteMes->copy()->endOfMonth();

                $existe = Proyeccion::where('tipo_orden', $proy->tipo_orden)
                    ->where('id_referencia', $proy->id_referencia)
                    ->whereBetween('fecha_ejecucion', [$inicioSiguienteMes, $finSiguienteMes])
                    ->exists();

                if ($existe) {
                    $bloqueadas++;
                    continue;
                }

                // Clonar la proyección
                $nuevaProyeccion = $proy->replicate();
                
                // Limpiar campos de facturación y pagos
                $nuevaProyeccion->n_factura = null;
                $nuevaProyeccion->fecha_factura = null;
                $nuevaProyeccion->fecha_pago = null;
                $nuevaProyeccion->fecha_vcto = null;
                $nuevaProyeccion->fecha_pago_detraccion = null;
                
                // Establecer estado
                $nuevaProyeccion->estado = 'Sin Factura';
                $nuevaProyeccion->fecha_ejecucion = $siguienteMes;
                $nuevaProyeccion->fecha_cambio_estado = Carbon::now();
                
                $nuevaProyeccion->save();
                $duplicadas++;
            }

            return response()->json([
                'success' => true,
                'message' => "Se duplicaron {$duplicadas} proyecciones. " . ($bloqueadas > 0 ? "Se bloquearon {$bloqueadas} por ya existir en el mes destino." : "")
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en duplicarMasivo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al duplicar proyecciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener lista de empresas (Multicim)
     * GET /api/v1/empresas
     */
    public function obtenerEmpresas(): JsonResponse
    {
        try {
            $empresas = Multicim::select('id', 'alias_empresa')->get();
            return response()->json(['success' => true, 'data' => $empresas]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener empresas: ' . $e->getMessage()
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
            \Log::info('Iniciando creación automática de proyección de servicio', ['orden_id' => $ordenServicio->id]);
            
            // Verificar si ya existe proyección para esta orden
            $proyeccionExistente = Proyeccion::where('id_orden_servicio', $ordenServicio->id)
                ->first();

            if ($proyeccionExistente) {
                \Log::info('Proyección de servicio ya existe, actualizando', ['proyeccion_id' => $proyeccionExistente->id]);
                // Si existe, actualizar datos relevantes
                return self::actualizarProyeccionServicio($proyeccionExistente, $ordenServicio);
            }

            // Obtener primera empresa multicim si no se proporciona
            if (!$multicimId) {
                $multicimId = $ordenServicio->id_multicim ?? ($ordenServicio->cotizacion ? $ordenServicio->cotizacion->id_multicim : null);
                if (!$multicimId) {
                    $primerMulticim = Multicim::first();
                    $multicimId = $primerMulticim ? $primerMulticim->id : 1;
                }
            }

            \Log::info('Creando nueva proyección de servicio', [
                'monto' => $ordenServicio->total_costo,
                'multicim' => $multicimId
            ]);

            $serviciosDetallados = [];
            $serviciosUnicos = [];
            foreach ($ordenServicio->detalles as $det) {
                $nombreServicio = $det->servicio ? $det->servicio->nombre : 'Servicio';
                $frecuencia = $det->frecuencia ?? 'S/N';
                $clave = $nombreServicio . '|' . $frecuencia;
                if (!isset($serviciosUnicos[$clave])) {
                    $serviciosUnicos[$clave] = true;
                    $serviciosDetallados[] = [
                        'nombre' => $nombreServicio,
                        'frecuencia' => $frecuencia
                    ];
                }
            }

            // Crear nueva proyección
            $proyeccion = Proyeccion::create([
                'tipo_orden' => 'servicio',
                'id_referencia' => $ordenServicio->id,
                'id_multicim' => $multicimId,
                'id_orden_servicio' => $ordenServicio->id,
                'actividad' => null,
                'servicios_detallados' => $serviciosDetallados,
                'n_factura' => null,
                'dias_credito' => null,
                'fecha_factura' => null,
                'fecha_pago' => null,
                'fecha_ejecucion' => $ordenServicio->fecha_tentativa ?? $ordenServicio->fecha_aceptacion ?? now(),
                'fecha_vcto' => null,
                'dia_vencer' => null,
                'monto_detrax' => ($ordenServicio->total_costo > 700) ? ($ordenServicio->total_costo * 0.12) : 0,
                'total_final' => $ordenServicio->total_costo - (($ordenServicio->total_costo > 700) ? ($ordenServicio->total_costo * 0.12) : 0),
            ]);

            \Log::info('Proyección de servicio creada exitosamente', ['proyeccion_id' => $proyeccion->id]);
            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error creando proyección automática de servicio: ' . $e->getMessage(), [
                'exception' => $e,
                'orden_id' => $ordenServicio->id ?? 'unknown'
            ]);
            return null;
        }
    }

    /**
     * Actualizar una proyección existente de servicio
     */
    public static function actualizarProyeccionServicio($proyeccion, $ordenServicio)
    {
        try {
            $serviciosDetallados = [];
            $serviciosUnicos = [];
            foreach ($ordenServicio->detalles as $det) {
                $nombreServicio = $det->servicio ? $det->servicio->nombre : 'Servicio';
                $frecuencia = $det->frecuencia ?? 'S/N';
                $clave = $nombreServicio . '|' . $frecuencia;
                if (!isset($serviciosUnicos[$clave])) {
                    $serviciosUnicos[$clave] = true;
                    $serviciosDetallados[] = [
                        'nombre' => $nombreServicio,
                        'frecuencia' => $frecuencia
                    ];
                }
            }

            $monto = $ordenServicio->total_costo;
            $proyeccion->update([
                'fecha_ejecucion' => $ordenServicio->fecha_tentativa ?? $ordenServicio->fecha_aceptacion ?? now(),
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
                'actividad' => $proyeccion->actividad,
                'servicios_detallados' => $serviciosDetallados,
            ]);

            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error actualizando proyección: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Crear automáticamente una proyección de auditoría
     */
    public static function crearProyeccionAutomaticaAuditoria($ordenAuditoria)
    {
        try {
            \Log::info('Iniciando creación automática de proyección de auditoría', ['orden_id' => $ordenAuditoria->id]);
            
            $multicimId = $ordenAuditoria->id_multicim ?? ($ordenAuditoria->cotizacion ? $ordenAuditoria->cotizacion->id_multicim : null);
            if (!$multicimId) {
                $primerMulticim = Multicim::first();
                $multicimId = $primerMulticim ? $primerMulticim->id : 1;
            }
            
            \Log::info('Multicim ID para proyección', ['id' => $multicimId]);

            // Verificar por tipo + referencia para no depender de FK de capacitación
            $existente = Proyeccion::where('tipo_orden', 'auditoria')
                ->where('id_referencia', $ordenAuditoria->id)
                ->first();
            
            if ($existente) {
                \Log::info('Proyección de auditoría ya existe', ['proyeccion_id' => $existente->id]);
                return $existente;
            }

            // Crear nueva proyección
            $monto = $ordenAuditoria->subtotal ?? $ordenAuditoria->costo ?? 0;
            \Log::info('Datos para crear proyección', [
                'monto' => $monto,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'fecha_ejecucion' => $ordenAuditoria->fecha_servicio
            ]);
            
            $serviciosDetallados = [
                [
                    'nombre' => $ordenAuditoria->servicio->nombre ?? 'Servicio de Auditoría',
                    'frecuencia' => $ordenAuditoria->modalidad ?? 'Única'
                ]
            ];

            $proyeccion = Proyeccion::create([
                'tipo_orden' => 'auditoria',
                'id_referencia' => $ordenAuditoria->id,
                'id_multicim' => $multicimId,
                'actividad' => null,
                'servicios_detallados' => $serviciosDetallados,
                'n_factura' => null,
                'dias_credito' => null,
                'fecha_factura' => null,
                'fecha_pago' => null,
                'fecha_ejecucion' => $ordenAuditoria->fecha_servicio,
                'fecha_vcto' => null,
                'dia_vencer' => null,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
                'id_orden_auditoria' => $ordenAuditoria->id,
            ]);
            
            \Log::info('Proyección de auditoría creada exitosamente', ['proyeccion_id' => $proyeccion->id]);
            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error creando proyección automática de auditoría: ' . $e->getMessage(), [
                'exception' => $e,
                'orden_id' => $ordenAuditoria->id ?? 'unknown'
            ]);
            return null;
        }
    }

    /**
     * Crear automáticamente una proyección de capacitación/asesoría
     */
    public static function crearProyeccionAutomaticaCapacitacion($ordenCapacitacion)
    {
        try {
            \Log::info('Iniciando creación automática de proyección de capacitación', ['orden_id' => $ordenCapacitacion->id]);
            
            $multicimId = $ordenCapacitacion->id_multicim ?? ($ordenCapacitacion->cotizacion ? $ordenCapacitacion->id_multicim : null);
            if (!$multicimId) {
                $primerMulticim = Multicim::first();
                $multicimId = $primerMulticim ? $primerMulticim->id : 1;
            }
            
            \Log::info('Multicim ID para proyección de capacitación', ['id' => $multicimId]);

            // Verificar que no exista una proyección para esta orden
            $existente = Proyeccion::where('id_orden_capacitacion_auditoria', $ordenCapacitacion->id)
                ->first();
            
            if ($existente) {
                \Log::info('Proyección de capacitación ya existe', ['proyeccion_id' => $existente->id]);
                return $existente;
            }

            // Crear nueva proyección
            $monto = $ordenCapacitacion->subtotal ?? $ordenCapacitacion->costo ?? 0;
            \Log::info('Datos para crear proyección de capacitación', [
                'monto' => $monto,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'fecha_ejecucion' => $ordenCapacitacion->fecha_servicio
            ]);
            
            $ordenCapacitacion->loadMissing('cotizacion');
            $tipoCotizacion = strtolower((string) optional($ordenCapacitacion->cotizacion)->tipo_cotizacion);
            $tipoOrden = in_array($tipoCotizacion, ['asesoria', 'asesoría'], true) ? 'asesoria' : 'capacitacion';

            $labelActividad = ($tipoOrden === 'asesoria') ? 'Asesoría' : 'Capacitación';
            
            $serviciosDetallados = [
                [
                    'nombre' => "Servicio de $labelActividad",
                    'frecuencia' => $ordenCapacitacion->modalidad ?? 'Única'
                ]
            ];

            $proyeccion = Proyeccion::create([
                'tipo_orden' => $tipoOrden,
                'id_referencia' => $ordenCapacitacion->id,
                'id_multicim' => $multicimId,
                'id_orden_capacitacion_auditoria' => $ordenCapacitacion->id,
                'actividad' => null,
                'servicios_detallados' => $serviciosDetallados,
                'n_factura' => null,
                'dias_credito' => null,
                'fecha_factura' => null,
                'fecha_pago' => null,
                'fecha_ejecucion' => $ordenCapacitacion->fecha_servicio,
                'fecha_vcto' => null,
                'dia_vencer' => null,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
            ]);
            
            \Log::info('Proyección de capacitación creada exitosamente', ['proyeccion_id' => $proyeccion->id]);
            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error creando proyección automática de capacitación: ' . $e->getMessage(), [
                'exception' => $e,
                'orden_id' => $ordenCapacitacion->id ?? 'unknown'
            ]);
            return null;
        }
    }

    /**
     * Actualizar proyección de auditoría
     */
    public static function actualizarProyeccionAuditoria($proyeccion, $ordenAuditoria)
    {
        try {
            if (!$proyeccion) {
                return null;
            }

            $serviciosDetallados = [
                [
                    'nombre' => $ordenAuditoria->servicio->nombre ?? 'Servicio de Auditoría',
                    'frecuencia' => $ordenAuditoria->modalidad ?? 'Única'
                ]
            ];

            $monto = $ordenAuditoria->subtotal ?? $ordenAuditoria->costo ?? 0;
            $proyeccion->update([
                'tipo_orden' => 'auditoria',
                'id_referencia' => $ordenAuditoria->id,
                'fecha_ejecucion' => $ordenAuditoria->fecha_servicio,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
                'actividad' => $proyeccion->actividad,
                'servicios_detallados' => $serviciosDetallados,
            ]);

            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error actualizando proyección de auditoría: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Actualizar proyección de capacitación
     */
    public static function actualizarProyeccionCapacitacion($proyeccion, $ordenCapacitacion)
    {
        try {
            if (!$proyeccion) {
                return null;
            }

            $ordenCapacitacion->loadMissing('cotizacion');
            $tipoCotizacion = strtolower((string) optional($ordenCapacitacion->cotizacion)->tipo_cotizacion);
            $tipoOrden = in_array($tipoCotizacion, ['asesoria', 'asesoría'], true) ? 'asesoria' : 'capacitacion';

            $labelActividad = ($tipoOrden === 'asesoria') ? 'Asesoría' : 'Capacitación';
            $serviciosDetallados = [
                [
                    'nombre' => "Servicio de $labelActividad",
                    'frecuencia' => $ordenCapacitacion->modalidad ?? 'Única'
                ]
            ];

            $monto = $ordenCapacitacion->subtotal ?? $ordenCapacitacion->costo ?? 0;
            $proyeccion->update([
                'tipo_orden' => $tipoOrden,
                'id_referencia' => $ordenCapacitacion->id,
                'fecha_ejecucion' => $ordenCapacitacion->fecha_servicio,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
                'id_orden_capacitacion_auditoria' => $ordenCapacitacion->id,
                'actividad' => $proyeccion->actividad,
                'servicios_detallados' => $serviciosDetallados,
            ]);

            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error actualizando proyección de capacitación: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Crear automáticamente una proyección de asesoría
     */
    public static function crearProyeccionAutomaticaAsesoria($ordenAsesoria)
    {
        try {
            \Log::info('Iniciando creación automática de proyección de asesoría', ['orden_id' => $ordenAsesoria->id]);

            $multicimId = $ordenAsesoria->id_multicim ?? ($ordenAsesoria->cotizacion ? $ordenAsesoria->cotizacion->id_multicim : null);
            if (!$multicimId) {
                $primerMulticim = Multicim::first();
                $multicimId = $primerMulticim ? $primerMulticim->id : 1;
            }

            $existente = Proyeccion::where('tipo_orden', 'asesoria')
                ->where('id_referencia', $ordenAsesoria->id)
                ->first();

            if ($existente) {
                \Log::info('Proyección de asesoría ya existe', ['proyeccion_id' => $existente->id]);
                return $existente;
            }

            $monto = $ordenAsesoria->subtotal ?? $ordenAsesoria->costo ?? 0;

            $serviciosDetallados = [
                [
                    'nombre' => $ordenAsesoria->servicio->nombre ?? 'Servicio de Asesoría',
                    'frecuencia' => $ordenAsesoria->modalidad ?? 'Única'
                ]
            ];

            $proyeccion = Proyeccion::create([
                'tipo_orden' => 'asesoria',
                'id_referencia' => $ordenAsesoria->id,
                'id_multicim' => $multicimId,
                'actividad' => null,
                'servicios_detallados' => $serviciosDetallados,
                'n_factura' => null,
                'dias_credito' => null,
                'fecha_factura' => null,
                'fecha_pago' => null,
                'fecha_ejecucion' => $ordenAsesoria->fecha_servicio,
                'fecha_vcto' => null,
                'dia_vencer' => null,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
            ]);

            \Log::info('Proyección de asesoría creada exitosamente', ['proyeccion_id' => $proyeccion->id]);
            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error creando proyección automática de asesoría: ' . $e->getMessage(), [
                'exception' => $e,
                'orden_id' => $ordenAsesoria->id ?? 'unknown',
            ]);
            return null;
        }
    }

    /**
     * Actualizar proyección de asesoría
     */
    public static function actualizarProyeccionAsesoria($proyeccion, $ordenAsesoria)
    {
        try {
            if (!$proyeccion) {
                return null;
            }

            $serviciosDetallados = [
                [
                    'nombre' => $ordenAsesoria->servicio->nombre ?? 'Servicio de Asesoría',
                    'frecuencia' => $ordenAsesoria->modalidad ?? 'Única'
                ]
            ];

            $monto = $ordenAsesoria->subtotal ?? $ordenAsesoria->costo ?? 0;
            $proyeccion->update([
                'tipo_orden' => 'asesoria',
                'id_referencia' => $ordenAsesoria->id,
                'fecha_ejecucion' => $ordenAsesoria->fecha_servicio,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
                'actividad' => $proyeccion->actividad,
                'servicios_detallados' => $serviciosDetallados,
            ]);

            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error actualizando proyección de asesoría: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Crear automáticamente una proyección de producto
     */
    public static function crearProyeccionAutomaticaProducto($ordenProducto)
    {
        try {
            \Log::info('Iniciando creación automática de proyección de producto', ['orden_id' => $ordenProducto->id]);
            
            $multicimId = $ordenProducto->id_multicim ?? ($ordenProducto->cotizacion ? $ordenProducto->cotizacion->id_multicim : null);
            if (!$multicimId) {
                $primerMulticim = Multicim::first();
                $multicimId = $primerMulticim ? $primerMulticim->id : 1;
            }
            
            \Log::info('Multicim ID para proyección de producto', ['id' => $multicimId]);

            // Verificar que no exista una proyección para esta orden
            $existente = Proyeccion::where('id_orden_producto', $ordenProducto->id)
                ->first();
            
            if ($existente) {
                \Log::info('Proyección de producto ya existe', ['proyeccion_id' => $existente->id]);
                return $existente;
            }

            // Crear nueva proyección
            $monto = $ordenProducto->total ?? 0;
            \Log::info('Datos para crear proyección de producto', [
                'monto' => $monto,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'fecha_ejecucion' => $ordenProducto->fecha_envio
            ]);
            
            $proyeccion = Proyeccion::create([
                'tipo_orden' => 'producto',
                'id_referencia' => $ordenProducto->id,
                'id_multicim' => $multicimId,
                'id_orden_producto' => $ordenProducto->id,
                'actividad' => null,
                'servicios_detallados' => $ordenProducto->detalles->map(fn($d) => [
                    'nombre' => $d->producto->descripcion ?? 'Producto',
                    'frecuencia' => 'Cant: ' . $d->cantidad
                ]),
                'n_factura' => null,
                'dias_credito' => null,
                'fecha_factura' => null,
                'fecha_pago' => null,
                'fecha_ejecucion' => $ordenProducto->fecha_envio,
                'fecha_vcto' => null,
                'dia_vencer' => null,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
            ]);
            
            \Log::info('Proyección de producto creada exitosamente', ['proyeccion_id' => $proyeccion->id]);
            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error creando proyección automática de producto: ' . $e->getMessage(), [
                'exception' => $e,
                'orden_id' => $ordenProducto->id ?? 'unknown'
            ]);
            return null;
        }
    }

    /**
     * Actualizar proyección de producto
     */
    public static function actualizarProyeccionProducto($proyeccion, $ordenProducto)
    {
        try {
            $monto = $ordenProducto->total ?? 0;
            $proyeccion->update([
                'fecha_ejecucion' => $ordenProducto->fecha_envio,
                'monto_detrax' => ($monto > 700) ? ($monto * 0.12) : 0,
                'total_final' => $monto - (($monto > 700) ? ($monto * 0.12) : 0),
                'id_orden_producto' => $ordenProducto->id,
                'actividad' => $proyeccion->actividad,
                'servicios_detallados' => $ordenProducto->detalles->map(fn($d) => [
                    'nombre' => $d->producto->descripcion ?? 'Producto',
                    'frecuencia' => 'Cant: ' . $d->cantidad
                ]),
            ]);

            return $proyeccion;
        } catch (\Exception $e) {
            \Log::error('Error actualizando proyección de producto: ' . $e->getMessage());
            return null;
        }
    }
}