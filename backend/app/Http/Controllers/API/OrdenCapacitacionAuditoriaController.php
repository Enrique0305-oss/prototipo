<?php 

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenCapacitacionAuditoria;
use App\Models\Cotizacion;
use App\Models\Exponente;
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
        $query = OrdenCapacitacionAuditoria::with(['cliente', 'ponente', 'ponentes', 'exponente', 'exponentes', 'cotizacion', 'servicio']);

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
                'fecha_aceptacion' => $orden->fecha_aceptacion ? $orden->fecha_aceptacion->format('Y-m-d') : null,
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
                'exponentes' => $orden->exponentes->map(fn($e) => [
                    'id' => $e->id,
                    'nombre' => $e->nombre . ' ' . $e->apellidos,
                    'especialidad' => $e->especialidad,
                    'profesion' => $e->profesion,
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
        $cotizaciones = Cotizacion::with(['cliente', 'creador', 'detalles', 'beneficios', 'ordenesCapacitacionAuditoria'])
            ->where(function($query) {
                $query->where('tipo_cotizacion', 'Capacitacion')
                      ->orWhereHas('beneficios');
            })
            ->where('estado', 'Aceptada')
            ->orderBy('fecha_emision', 'desc')
            ->get();

        $cotizaciones = $cotizaciones->filter(function($cot) {
            $ordenes = $cot->ordenesCapacitacionAuditoria;
            if ($cot->tipo_cotizacion === 'Capacitacion') {
                $idsConOrden = $ordenes->pluck('id_cotizacion_detalle')->filter()->toArray();
                if ($ordenes->count() > 0 && empty($idsConOrden)) {
                    // Soporte para órdenes antiguas que no guardaron id_cotizacion_detalle
                    return false; 
                }
                $idsTotales = $cot->detalles->pluck('id')->toArray();
                return count(array_diff($idsTotales, $idsConOrden)) > 0;
            } else {
                $idsConOrden = $ordenes->pluck('id_cotizacion_beneficio')->filter()->toArray();
                $idsTotales = $cot->beneficios->pluck('id')->toArray();
                return count(array_diff($idsTotales, $idsConOrden)) > 0;
            }
        })->values();

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
        $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio', 'detalles.catalogoCapAud', 'detalles.planta.areas', 'beneficios.catalogoCapAud'])
            ->find($cotizacionId);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        if ($cotizacion->tipo_cotizacion !== 'Capacitacion' && $cotizacion->beneficios->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'La cotización no es de tipo Capacitacion ni tiene beneficios registrados.'
            ], 400);
        }

        if ($cotizacion->estado !== 'Aceptada') {
            return response()->json([
                'success' => false,
                'message' => 'La cotización debe estar Aceptada'
            ], 400);
        }

        // Cargar las órdenes que ya existen para esta cotización
        $cotizacion->load('ordenesCapacitacionAuditoria');
        $ordenesExistentes = $cotizacion->ordenesCapacitacionAuditoria;

        $esCapacitacion = $cotizacion->tipo_cotizacion === 'Capacitacion';
        $fuenteDetalles = $esCapacitacion ? $cotizacion->detalles : $cotizacion->beneficios;

        // Obtener el primer servicio/catalogo
        $primerDetalle = $fuenteDetalles->first();
        $exponentesIds = array_values(array_filter((array) ($cotizacion->exponentes_ids ?? []), fn($id) => !empty($id)));
        $exponentesSeleccionados = empty($exponentesIds)
            ? collect([])
            : Exponente::whereIn('id', $exponentesIds)->get();

        // Mapear todos los detalles de la cotización
        $detalles = $fuenteDetalles->map(function($d) use ($esCapacitacion, $ordenesExistentes) {
            if (!$esCapacitacion) {
                // Mapear desde CotizacionBeneficio
                $yaGenerada = $ordenesExistentes->where('id_cotizacion_beneficio', $d->id)->isNotEmpty();
                return [
                    'id_referencia' => $d->id,
                    'is_beneficio' => true,
                    'generada' => $yaGenerada,
                    'id_servicio' => null,
                    'id_catalogo_cap_aud' => $d->id_catalogo_cap_aud,
                    'id_cliente_planta' => null,
                    'id_cliente_planta_area' => [],
                    'planta_nombre' => null,
                    'areas_nombres' => [],
                    'nombre' => $d->catalogoCapAud ? $d->catalogoCapAud->nombre : ($d->nombre_beneficio ?? 'Beneficio'),
                    'tipo' => 'Capacitacion',
                    'descripcion' => $d->nombre_beneficio,
                    'cantidad' => 1,
                    'precio_unitario' => 0,
                    'modalidad_sugerida' => $d->modalidad_sugerida,
                    'duracion_horas' => $d->horas_capacitacion ?? ($d->catalogoCapAud ? $d->catalogoCapAud->duracion_horas : null),
                    'horas_capacitacion' => $d->horas_capacitacion,
                    'num_participantes' => 0,
                    'fecha_servicio' => null,
                ];
            }

            // Soporte para orden antigua sin detalle especificado
            $yaGenerada = $ordenesExistentes->where('id_cotizacion_detalle', $d->id)->isNotEmpty();
            if (!$yaGenerada && $ordenesExistentes->count() > 0 && empty($ordenesExistentes->pluck('id_cotizacion_detalle')->filter()->toArray())) {
                $yaGenerada = true; // Si hay órdenes antiguas sin ID, asumimos que este detalle (probablemente el primero) ya está generado
            }

            $planta = $d->planta ?? null;
            $areaIds = $d->id_cliente_planta_area ?? [];

            if (!is_array($areaIds)) {
                $areaIds = empty($areaIds) ? [] : [$areaIds];
            }

            $areasNombres = collect($areaIds)
                ->map(function ($areaId) use ($planta) {
                    if (!$planta || !$planta->areas) {
                        return null;
                    }
                    $area = $planta->areas->firstWhere('id', $areaId);
                    return $area ? $area->nombre : null;
                })
                ->filter()
                ->values();

            return [
                'id_referencia' => $d->id,
                'is_beneficio' => false,
                'generada' => $yaGenerada,
                'id_servicio' => $d->id_servicio,
                'id_catalogo_cap_aud' => $d->id_catalogo_cap_aud,
                'id_cliente_planta' => $d->id_cliente_planta,
                'id_cliente_planta_area' => $areaIds,
                'planta_nombre' => $planta->nombre ?? null,
                'areas_nombres' => $areasNombres,
                'nombre' => $d->catalogoCapAud ? $d->catalogoCapAud->nombre : ($d->servicio ? $d->servicio->nombre : ($d->descripcion_manual ?? 'Sin nombre')),
                'tipo' => $d->catalogoCapAud ? $d->catalogoCapAud->tipo : null,
                'descripcion' => $d->descripcion_manual ?? ($d->catalogoCapAud ? $d->catalogoCapAud->descripcion : null),
                'cantidad' => $d->cantidad,
                'precio_unitario' => $d->precio_unitario,
                'modalidad_sugerida' => $d->modalidad_sugerida,
                'duracion_horas' => $d->catalogoCapAud ? $d->catalogoCapAud->duracion_horas : null,
                'horas_capacitacion' => $d->horas_capacitacion,
                'num_participantes' => $d->num_participantes,
                'fecha_servicio' => $d->fecha_servicio,
            ];
        });

        // Filtrar solo los que NO han sido generados
        $detallesDisponibles = $detalles->filter(fn($d) => !$d['generada'])->values();
        $primerDetalleDisponible = $detallesDisponibles->first();

        if ($detallesDisponibles->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Todos los cursos/beneficios de esta cotización ya tienen una orden generada.'
            ], 400);
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
                'detalles' => $detallesDisponibles,
                'exponentes' => $exponentesSeleccionados->map(fn($e) => [
                    'id' => $e->id,
                    'nombre' => $e->nombre,
                    'apellidos' => $e->apellidos,
                    'especialidad' => $e->especialidad,
                    'profesion' => $e->profesion,
                ])->values(),
                'cursos_disponibles' => $detallesDisponibles, // Agregamos lista de cursos para el frontend
                'servicio' => $primerDetalleDisponible ? [
                    'id' => $esCapacitacion ? $primerDetalleDisponible['id_servicio'] : null,
                    'id_servicio' => $esCapacitacion ? $primerDetalleDisponible['id_servicio'] : null,
                    'id_catalogo_cap_aud' => $primerDetalleDisponible['id_catalogo_cap_aud'],
                    'nombre' => $primerDetalleDisponible['nombre'],
                    'modalidad_sugerida' => $primerDetalleDisponible['modalidad_sugerida'],
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
            'id_cotizacion_detalle' => 'nullable|exists:cotizacion_detalle,id',
            'id_cotizacion_beneficio' => 'nullable|exists:cotizacion_beneficio,id',
            'is_beneficio' => 'nullable|boolean',
            'id_cliente_planta' => 'nullable|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable|array',
            'id_cliente_planta_area.*' => 'exists:cliente_planta_area,id',
            'id_ponente' => 'nullable|exists:personal,id',
            'ponentes' => 'nullable|array',
            'ponentes.*' => 'exists:personal,id',
            'exponentes' => 'nullable|array',
            'exponentes.*' => 'exists:exponentes,id',
            'fecha_servicio' => 'required|date',
            'fecha_aceptacion' => 'nullable|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'modalidad' => 'required|in:Presencial,Virtual,Híbrido,Hibrido,Asíncrona,Asincrona',
            'num_participantes' => 'required|integer|min:1',
            'num_certificados' => 'nullable|integer|min:0',
            'horas_capacitacion' => 'nullable|string',  
            'materiales'         => 'nullable|array',  
            'equipos'            => 'nullable|array',
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

        $cotizacion = Cotizacion::find($validated['id_cotizacion']);
        
        if ($cotizacion->tipo_cotizacion !== 'Capacitacion' && $cotizacion->beneficios->count() === 0) {
            return response()->json(['success' => false, 'message' => 'La cotización no es de tipo Capacitacion ni tiene beneficios'], 400);
        }

        $isBeneficio = filter_var($validated['is_beneficio'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $idDetalle = $validated['id_cotizacion_detalle'] ?? null;
        $idBeneficio = $validated['id_cotizacion_beneficio'] ?? null;

        // Verificar si ya tiene orden PARA ESTE CURSO ESPECÍFICO
        $cotizacion->load('ordenesCapacitacionAuditoria');
        $ordenesExistentes = $cotizacion->ordenesCapacitacionAuditoria;
        
        if ($isBeneficio && $idBeneficio) {
            if ($ordenesExistentes->where('id_cotizacion_beneficio', $idBeneficio)->isNotEmpty()) {
                return response()->json(['success' => false, 'message' => 'Este beneficio ya tiene una orden generada'], 400);
            }
        } elseif (!$isBeneficio && $idDetalle) {
            if ($ordenesExistentes->where('id_cotizacion_detalle', $idDetalle)->isNotEmpty()) {
                return response()->json(['success' => false, 'message' => 'Este curso ya tiene una orden generada'], 400);
            }
        } elseif ($ordenesExistentes->count() > 0 && !$idDetalle && !$idBeneficio) {
            // Soporte para frontend antiguo o sin datos específicos
            return response()->json(['success' => false, 'message' => 'Ya existe una orden para esta cotización y no se especificó un curso válido.'], 400);
        }

        // Fecha de aceptación desde la cotización (aceptada/rechazada)
        $validated['fecha_aceptacion'] = $cotizacion->fecha_estado_cotizacion
            ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d')
            : ($validated['fecha_aceptacion'] ?? $cotizacion->fecha_emision->format('Y-m-d'));

        // Copiar datos desde el detalle de cotización cuando falte algo
        $detalle = null;
        if ($isBeneficio && $idBeneficio) {
            $detalle = $cotizacion->beneficios->firstWhere('id', $idBeneficio);
        } elseif (!$isBeneficio && $idDetalle) {
            $detalle = $cotizacion->detalles->firstWhere('id', $idDetalle);
        }
        
        if (!$detalle) {
            $detalle = $cotizacion->tipo_cotizacion === 'Capacitacion' ? $cotizacion->detalles->first() : $cotizacion->beneficios->first();
        }
        if ($detalle) {
            if (empty($validated['fecha_servicio'])) {
                $validated['fecha_servicio'] = $detalle->fecha_servicio ?? $cotizacion->fecha_emision->format('Y-m-d');
            }
            $validated['horas_capacitacion'] = $validated['horas_capacitacion'] ?? $detalle->horas_capacitacion;
            $validated['num_participantes'] = $validated['num_participantes'] ?? $detalle->num_participantes;
        }

        try {
            DB::beginTransaction();

            $ponenteIds = $validated['ponentes'] ?? [];
            $exponenteIds = $validated['exponentes'] ?? [];

            // 1. CREAR LA ORDEN PRINCIPAL 
            // Nota: Quitamos 'materiales' y 'equipos' de aquí porque van a sus propias tablas
            $orden = OrdenCapacitacionAuditoria::create([
                'numero_orden' => OrdenCapacitacionAuditoria::generarNumero(),
                'id_cotizacion' => $validated['id_cotizacion'],
                'id_cliente' => $cotizacion->id_cliente,
                'id_servicio' => $validated['id_servicio'] ?? null,
                'id_cotizacion_detalle' => !$isBeneficio ? $idDetalle : null,
                'id_cotizacion_beneficio' => $isBeneficio ? $idBeneficio : null,
                'id_cliente_planta' => $validated['id_cliente_planta'] ?? null,
                'id_cliente_planta_area' => $validated['id_cliente_planta_area'] ?? [],
                'horas_capacitacion' => $validated['horas_capacitacion'] ?? null, 
                'id_ponente' => !empty($ponenteIds) ? $ponenteIds[0] : null,
                'id_exponente' => !empty($exponenteIds) ? $exponenteIds[0] : null,
                'fecha_servicio' => $validated['fecha_servicio'],
                'fecha_aceptacion' => $validated['fecha_aceptacion'] ?? null,
                'hora_servicio' => $validated['hora_servicio'] ?? null,
                'modalidad' => $validated['modalidad'],
                'num_participantes' => $validated['num_participantes'],
                'num_certificados' => $validated['num_certificados'] ?? 0,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'incluye_igv' => $incluyeIgv,
                'costo' => $total,
                'emitido_por' => auth()->id(),
                'estado' => 'Aprobado',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            // 2. GUARDAR LOS MATERIALES (En la tabla detalle_orden_capacitacion_materiales)
            if (!empty($validated['materiales'])) {
                foreach ($validated['materiales'] as $mat) {
                    $orden->materiales()->create([
                        'material'    => $mat['material'],
                        'cantidad'    => $mat['cantidad'],
                        'disposicion' => $mat['disposicion']
                    ]);
                }
            }

            // 3. GUARDAR LOS EQUIPOS (En la tabla detalle_orden_capacitacion_equipos)
            if (!empty($validated['equipos'])) {
                foreach ($validated['equipos'] as $eq) {
                    $orden->equipos()->create([
                        'equipo'      => $eq['equipo'],
                        'disposicion' => $eq['disposicion']
                    ]);
                }
            }

            // Sincronizar ponentes y exponentes (tablas pivot)
            if (!empty($ponenteIds)) { $orden->ponentes()->sync($ponenteIds); }
            if (!empty($exponenteIds)) { $orden->exponentes()->sync($exponenteIds); }

            DB::commit();

            // Crear proyección automática
            \Log::info('Llamando a crearProyeccionAutomaticaCapacitacion después de DB::commit', ['orden_id' => $orden->id]);
            ProyeccionesController::crearProyeccionAutomaticaCapacitacion($orden);

            // IMPORTANTE: Cargamos 'materiales' y 'equipos' en la respuesta
            $orden->load(['cliente', 'ponente', 'ponentes', 'exponente', 'exponentes', 'servicio', 'cotizacion', 'materiales', 'equipos']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de capacitación/auditoría creada exitosamente',
                'data' => $orden
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden',
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
            'exponente',
            'exponentes',
            'cotizacion',
            'servicio',
            'materiales', // Cargar materiales
            'equipos'     // Cargar equipos
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
            'id_cliente_planta' => 'nullable|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable|array',
            'id_cliente_planta_area.*' => 'exists:cliente_planta_area,id',
            'id_ponente' => 'nullable|exists:personal,id',
            'ponentes' => 'sometimes|array',
            'ponentes.*' => 'exists:personal,id',
            'exponentes' => 'sometimes|array',
            'exponentes.*' => 'exists:exponentes,id',
            'fecha_servicio' => 'sometimes|date',
            'fecha_aceptacion' => 'nullable|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'modalidad' => 'sometimes|in:Presencial,Virtual,Híbrido,Hibrido,Asíncrona,Asincrona',
            'num_participantes' => 'sometimes|integer|min:1',
            'num_certificados' => 'nullable|integer|min:0',
            'costo' => 'sometimes|numeric|min:0',
            'incluye_igv' => 'nullable|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
            'horas_capacitacion' => 'nullable|string',
            'materiales'         => 'nullable|array',
            'equipos'            => 'nullable|array',
        ]);

        // Recalcular IGV
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
            DB::beginTransaction();

            // 1. Sincronizar Ponentes
            if (isset($validated['ponentes'])) {
                $ponenteIds = $validated['ponentes'];
                $orden->ponentes()->sync($ponenteIds);
                $validated['id_ponente'] = !empty($ponenteIds) ? $ponenteIds[0] : null;
                unset($validated['ponentes']);
            }

            // 2. Sincronizar Exponentes
            if (isset($validated['exponentes'])) {
                $exponenteIds = $validated['exponentes'];
                $orden->exponentes()->sync($exponenteIds);
                $validated['id_exponente'] = !empty($exponenteIds) ? $exponenteIds[0] : null;
                unset($validated['exponentes']);
            }

            // 3. ACTUALIZAR MATERIALES (Borrar actuales e insertar nuevos)
            if (isset($validated['materiales'])) {
                $orden->materiales()->delete(); // Borramos los detalles viejos
                foreach ($validated['materiales'] as $mat) {
                    $orden->materiales()->create([
                        'material'    => $mat['material'],
                        'cantidad'    => $mat['cantidad'],
                        'disposicion' => $mat['disposicion']
                    ]);
                }
                unset($validated['materiales']); // Quitamos del array principal
            }

            // 4. ACTUALIZAR EQUIPOS (Borrar actuales e insertar nuevos)
            if (isset($validated['equipos'])) {
                $orden->equipos()->delete(); // Borramos los detalles viejos
                foreach ($validated['equipos'] as $eq) {
                    $orden->equipos()->create([
                        'equipo'      => $eq['equipo'],
                        'disposicion' => $eq['disposicion']
                    ]);
                }
                unset($validated['equipos']); // Quitamos del array principal
            }

            // 5. Actualizar la tabla principal
            $orden->update($validated);

            DB::commit();

            // Actualizar proyección automática si existe
            \Log::info('Actualizando proyección de capacitación', ['orden_id' => $orden->id]);
            $proyeccion = \App\Models\Proyeccion::where('id_orden_capacitacion_auditoria', $orden->id)
                ->first();
            
            if ($proyeccion) {
                \Log::info('Proyección encontrada, actualizando', ['proyeccion_id' => $proyeccion->id]);
                ProyeccionesController::actualizarProyeccionCapacitacion($proyeccion, $orden);
            } else {
                \Log::info('No se encontró proyección, creando nueva', ['orden_id' => $orden->id]);
                ProyeccionesController::crearProyeccionAutomaticaCapacitacion($orden);
            }

            // Cargamos todas las relaciones incluyendo las nuevas de detalles
            $orden->load(['cliente', 'ponente', 'ponentes', 'exponente', 'exponentes', 'servicio', 'cotizacion', 'materiales', 'equipos']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de capacitación actualizada exitosamente',
                'data' => $orden
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la orden',
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
            'exponentes',
            'cotizacion.detalles.catalogoCapAud', 
            'cotizacion.detalles.servicio',
            'cotizacion.beneficios.catalogoCapAud',
            'servicio',
            'materiales', // Cargar materiales
            'equipos',     // Cargar equipos
            'emisor'
        ])->findOrFail($id);

        $nombreServicio = null;
        if ($orden->servicio) {
            $nombreServicio = $orden->servicio->nombre;
        } elseif ($orden->id_cotizacion_beneficio) {
            $beneficio = $orden->cotizacion->beneficios->firstWhere('id', $orden->id_cotizacion_beneficio);
            if ($beneficio) {
                $nombreServicio = $beneficio->catalogoCapAud ? $beneficio->catalogoCapAud->nombre : ($beneficio->nombre_beneficio ?? null);
            }
        } elseif ($orden->id_cotizacion_detalle) {
            $detalle = $orden->cotizacion->detalles->firstWhere('id', $orden->id_cotizacion_detalle);
            if ($detalle) {
                $nombreServicio = $detalle->catalogoCapAud ? $detalle->catalogoCapAud->nombre : 
                                  ($detalle->servicio ? $detalle->servicio->nombre : 
                                  ($detalle->descripcion_manual ?? null));
            }
        } 
        
        if (!$nombreServicio && $orden->cotizacion && $orden->cotizacion->detalles->count() > 0) {
            $primerDetalle = $orden->cotizacion->detalles->first();
            $nombreServicio = $primerDetalle->catalogoCapAud ? $primerDetalle->catalogoCapAud->nombre : 
                              ($primerDetalle->servicio ? $primerDetalle->servicio->nombre : 
                              ($primerDetalle->descripcion_manual ?? null));
        }
        
        $orden->servicio_nombre = $nombreServicio ?: 'SERVICIO NO ESPECIFICADO';

        $pdf = Pdf::loadView('OrdenCapacitacionAudiPDF', compact('orden'));
        
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream("Orden_Capacitacion_{$orden->numero_orden}.pdf");
    }
}
