<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionServicio;
use App\Models\ProgramacionInsumo;
use App\Models\ProgramacionTecnico;
use App\Models\OrdenServicio;
use App\Models\DetalleOrdenServicio;
use App\Models\ServicioProducto;
use App\Models\Kardex;
use App\Models\Tecnico;
use App\Models\Vehiculo;
use App\Models\Servicio;
use App\Models\OrdenCapacitacionAuditoria;
use App\Models\ProgramacionVisita;
use App\Models\ProgramacionFabricacion;
use App\Models\ProgramacionOtro;
use App\Services\ScheduleConflictService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ProgramacionServicioController extends Controller
{
    private function normalizePersonalIds(mixed $value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            }
        }

        if (is_int($value) || (is_string($value) && ctype_digit($value))) {
            return [(int) $value];
        }

        if (!is_array($value)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map('intval', $value), fn (int $id) => $id > 0)));
    }

    /**
     * Listar programaciones con filtros
     */
    public function index(Request $request)
    {
        $query = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'tecnicos',
            'vehiculo',
            'insumos.producto',
            'planta',
            'area',
        ]);

        // Filtro por fecha exacta
        if ($request->filled('fecha')) {
            $query->whereDate('fecha_programada', $request->fecha);
        }

        // Filtro por rango de fechas
        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha_programada', [$request->fecha_inicio, $request->fecha_fin]);
        }

        // Filtro por mes/año
        if ($request->filled('mes') && $request->filled('anio')) {
            $query->whereMonth('fecha_programada', $request->mes)
                  ->whereYear('fecha_programada', $request->anio);
        } elseif ($request->filled('anio')) {
            $query->whereYear('fecha_programada', $request->anio);
        }

        // Filtro por técnico (busca en principal o en la tabla pivot)
        if ($request->filled('id_tecnico')) {
            $idTec = $request->id_tecnico;
            $query->where(function ($q) use ($idTec) {
                $q->where('id_tecnico_asignado', $idTec)
                  ->orWhereHas('tecnicos', fn($q2) => $q2->where('tecnicos.id', $idTec));
            });
        }

        // Filtro por estado
        if ($request->filled('estado')) {
            $query->where('estado_ejecucion', $request->estado);
        }

        // Filtro por orden de servicio
        if ($request->filled('id_orden_servicio')) {
            $query->where('id_orden_servicio', $request->id_orden_servicio);
        }

        // Filtro por servicio
        if ($request->filled('id_servicio')) {
            $query->where('id_servicio', $request->id_servicio);
        }

        $programaciones = $query->orderBy('fecha_programada', 'asc')
                                ->orderBy('hora_inicio', 'asc')
                                ->get();

        return response()->json([
            'success' => true,
            'data' => $programaciones,
        ]);
    }

    /**
     * Ver detalle de una programación
     */
    public function show($id)
    {
        $prog = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'ordenServicio.detalles.servicio',
            'servicio',
            'tecnico',
            'tecnicos',
            'vehiculo',
            'insumos.producto',
            'creador',
            'planta',
            'area',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $prog,
        ]);
    }

    /**
     * Crear programación individual
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_orden_servicio' => 'required|integer|exists:orden_servicio,id',
            'id_servicio'       => 'required|integer|exists:servicios,id',
            'id_tecnico_asignado' => 'required|integer|exists:tecnicos,id',
            'tecnicos_ids'      => 'nullable|array',
            'tecnicos_ids.*'    => 'integer|exists:tecnicos,id',
            'id_supervisor'     => 'nullable|array',
            'id_supervisor.*'   => 'integer|exists:personal,id',
            'id_vehiculo'       => 'nullable|integer|exists:vehiculos,id',
            'fecha_programada'  => 'required|date',
            'hora_inicio'       => 'required',
            'hora_fin'          => 'nullable',
            'local_sede'        => 'nullable|string|max:150',
            'direccion_completa'=> 'nullable|string|max:255',
            'coordenadas'       => 'nullable|string|max:50',
            'id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable',
            'observaciones'     => 'nullable|string',
            'dias_semana'       => 'nullable|string|max:100',
        ]);

        DB::beginTransaction();
        try {
            $idUsuario = $request->user()?->id;

            $tecnicosAsignados = $this->normalizeTecnicosIds($validated['id_tecnico_asignado'] ?? null, $validated['tecnicos_ids'] ?? []);
            if (!empty($tecnicosAsignados)) {
                $conflicto = ScheduleConflictService::validarTecnicos(
                    $tecnicosAsignados,
                    $validated['fecha_programada'],
                    $validated['hora_inicio'] ?? null,
                    $validated['hora_fin'] ?? null
                );

                if ($conflicto) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => $conflicto['mensaje'],
                        'conflicto' => $conflicto,
                    ], 422);
                }
            }

            // Crear la programación
            $areaIdsJson = $this->normalizeAreaIdsForJson($validated['id_cliente_planta_area'] ?? null);

            $prog = ProgramacionServicio::create([
                'id_orden_servicio'  => $validated['id_orden_servicio'],
                'id_servicio'        => $validated['id_servicio'],
                'id_tecnico_asignado'=> $validated['id_tecnico_asignado'],
                'id_supervisor'      => !empty($validated['id_supervisor']) ? $this->normalizePersonalIds($validated['id_supervisor']) : null,
                'id_vehiculo'        => $validated['id_vehiculo'] ?? null,
                'fecha_programada'   => $validated['fecha_programada'],
                'hora_inicio'        => $validated['hora_inicio'],
                'hora_fin'           => $validated['hora_fin'] ?? null,
                'local_sede'         => $validated['local_sede'] ?? null,
                'direccion_completa' => $validated['direccion_completa'] ?? null,
                'coordenadas'        => $validated['coordenadas'] ?? null,
                'id_cliente_planta'  => $validated['id_cliente_planta'] ?? null,
                'id_cliente_planta_area' => $areaIdsJson,
                'estado_ejecucion'   => 'Programado',
                'observaciones'      => $validated['observaciones'] ?? null,
                'dias_semana'        => $validated['dias_semana'] ?? null,
                'creado_por'         => $idUsuario,
            ]);

            // Sincronizar técnicos en la tabla pivot
            $this->syncTecnicos($prog, $validated['id_tecnico_asignado'], $validated['tecnicos_ids'] ?? []);

            // Asignar insumos desde la receta del servicio
            $this->asignarInsumosDesdeReceta($prog, $idUsuario);

            // Cambiar estado de la ODS a "Programado" si estaba "Aprobado"
            $orden = OrdenServicio::find($validated['id_orden_servicio']);
            if ($orden && $orden->estado === 'Aprobado') {
                $orden->estado = 'Programado';
                $orden->save();
            }

            DB::commit();

            $prog->load([
                'ordenServicio.cliente',
                'servicio',
                'tecnico',
                'tecnicos',
                'vehiculo',
                'insumos.producto',
                'planta',
                'area',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Programación creada exitosamente',
                'data' => $prog,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear programación: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Programación anual — crear N programaciones según frecuencia
     */
    public function storeAnual(Request $request)
    {
        $validated = $request->validate([
            'id_orden_servicio'   => 'required|integer|exists:orden_servicio,id',
            'id_servicio'         => 'required|integer|exists:servicios,id',
            'frecuencia'          => 'required|string',
            'id_tecnico_asignado' => 'required|integer|exists:tecnicos,id',
            'tecnicos_ids'        => 'nullable|array',
            'tecnicos_ids.*'      => 'integer|exists:tecnicos,id',
            'id_supervisor'       => 'nullable|array',
            'id_supervisor.*'     => 'integer|exists:personal,id',
            'id_vehiculo'         => 'nullable|integer|exists:vehiculos,id',
            'fecha_inicio'        => 'required|date',
            'hora_inicio'         => 'required',
            'hora_fin'            => 'nullable',
            'local_sede'          => 'nullable|string|max:150',
            'direccion_completa'  => 'nullable|string|max:255',
            'coordenadas'         => 'nullable|string|max:50',
            'id_cliente_planta'   => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable',
            'observaciones'       => 'nullable|string',
            'dias_semana'         => 'nullable|string|max:100',
        ]);

        // Calcular fechas
        $fechas = $this->calcularFechasPorFrecuencia(
            $validated['frecuencia'],
            $validated['fecha_inicio'],
            $validated['dias_semana'] ?? null
        );

        if (empty($fechas)) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudieron calcular fechas para la frecuencia indicada.',
            ], 422);
        }

        // Ya no se valida stock en este punto.
        // El descuento y control de stock se gestiona en Salidas de Programación.

        DB::beginTransaction();
        try {
            $idUsuario = $request->user()?->id;
            $creadas = [];

            $areaIdsJson = $this->normalizeAreaIdsForJson($validated['id_cliente_planta_area'] ?? null);

            foreach ($fechas as $fecha) {
                $tecnicosAsignados = $this->normalizeTecnicosIds($validated['id_tecnico_asignado'] ?? null, $validated['tecnicos_ids'] ?? []);
                if (!empty($tecnicosAsignados)) {
                    $conflicto = ScheduleConflictService::validarTecnicos(
                        $tecnicosAsignados,
                        $fecha,
                        $validated['hora_inicio'] ?? null,
                        $validated['hora_fin'] ?? null
                    );

                    if ($conflicto) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => $conflicto['mensaje'],
                            'conflicto' => $conflicto,
                        ], 422);
                    }
                }

                $prog = ProgramacionServicio::create([
                    'id_orden_servicio'  => $validated['id_orden_servicio'],
                    'id_servicio'        => $validated['id_servicio'],
                    'id_tecnico_asignado'=> $validated['id_tecnico_asignado'],
                    'id_supervisor'      => !empty($validated['id_supervisor']) ? $this->normalizePersonalIds($validated['id_supervisor']) : null,
                    'id_vehiculo'        => $validated['id_vehiculo'] ?? null,
                    'fecha_programada'   => $fecha,
                    'hora_inicio'        => $validated['hora_inicio'],
                    'hora_fin'           => $validated['hora_fin'] ?? null,
                    'local_sede'         => $validated['local_sede'] ?? null,
                    'direccion_completa' => $validated['direccion_completa'] ?? null,
                    'coordenadas'        => $validated['coordenadas'] ?? null,
                    'id_cliente_planta'  => $validated['id_cliente_planta'] ?? null,
                    'id_cliente_planta_area' => $areaIdsJson,
                    'estado_ejecucion'   => 'Programado',
                    'observaciones'      => $validated['observaciones'] ?? null,
                    'dias_semana'        => $validated['dias_semana'] ?? null,
                    'creado_por'         => $idUsuario,
                ]);

                $this->syncTecnicos($prog, $validated['id_tecnico_asignado'], $validated['tecnicos_ids'] ?? []);
                $this->asignarInsumosDesdeReceta($prog, $idUsuario);
                $creadas[] = $prog;
            }

            // Cambiar estado de la ODS
            $orden = OrdenServicio::find($validated['id_orden_servicio']);
            if ($orden && $orden->estado === 'Aprobado') {
                $orden->estado = 'Programado';
                $orden->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($creadas) . ' programaciones creadas exitosamente',
                'data' => $creadas,
                'total' => count($creadas),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear programaciones: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview de fechas para programación anual (sin persistir)
     */
    public function previewAnual(Request $request)
    {
        $validated = $request->validate([
            'id_servicio' => 'required|integer|exists:servicios,id',
            'frecuencia'  => 'required|string',
            'fecha_inicio'=> 'required|date',
            'dias_semana' => 'nullable|string|max:100',
        ]);

        $fechas = $this->calcularFechasPorFrecuencia(
            $validated['frecuencia'],
            $validated['fecha_inicio'],
            $validated['dias_semana'] ?? null
        );

        // Calcular necesidad de stock
        $receta = ServicioProducto::with('producto.inventario')
            ->where('id_servicio', $validated['id_servicio'])->get();

        $detalleStock = $receta->map(function ($item) use ($fechas) {
            $disponible = $item->producto->inventario->cantidad_disponible ?? 0;
            $porVez = $item->cantidad_default;
            $total = $porVez * count($fechas);
            return [
                'id_producto' => $item->id_producto,
                'producto' => $item->producto->descripcion ?? "#{$item->id_producto}",
                'cantidad_por_vez' => $porVez,
                'total_necesario' => $total,
                'stock_disponible' => $disponible,
                'suficiente' => $disponible >= $total,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'fechas' => $fechas,
                'total_programaciones' => count($fechas),
                'stock' => $detalleStock,
            ],
        ]);
    }

    /**
     * Actualizar una programación (reprogramar, cambiar técnico, etc.)
     */
    public function update(Request $request, $id)
    {
        $prog = ProgramacionServicio::findOrFail($id);

        $validated = $request->validate([
            'id_tecnico_asignado' => 'sometimes|integer|exists:tecnicos,id',
            'tecnicos_ids'        => 'nullable|array',
            'tecnicos_ids.*'      => 'integer|exists:tecnicos,id',
            'id_supervisor'       => 'nullable|array',
            'id_supervisor.*'     => 'integer|exists:personal,id',
            'id_vehiculo'         => 'nullable|integer',
            'fecha_programada'    => 'sometimes|date',
            'hora_inicio'         => 'sometimes',
            'hora_fin'            => 'nullable',
            'local_sede'          => 'nullable|string|max:150',
            'direccion_completa'  => 'nullable|string|max:255',
            'coordenadas'         => 'nullable|string|max:50',
            'id_cliente_planta'   => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable',
            'estado_ejecucion'    => 'sometimes|in:Programado,Confirmado,En Camino,En Ejecución,Realizado,Reprogramado,Cancelado',
            'observaciones'       => 'nullable|string',
        ]);

        // Extraer tecnicos_ids antes del update masivo
        $tecnicosIds = $validated['tecnicos_ids'] ?? null;
        unset($validated['tecnicos_ids']);

        $requiereValidacionConflicto =
            array_key_exists('id_tecnico_asignado', $validated)
            || $tecnicosIds !== null
            || array_key_exists('fecha_programada', $validated)
            || array_key_exists('hora_inicio', $validated)
            || array_key_exists('hora_fin', $validated);

        $principal = $validated['id_tecnico_asignado'] ?? $prog->id_tecnico_asignado;
        $listaTecnicos = $tecnicosIds !== null
            ? $tecnicosIds
            : $prog->tecnicos()->pluck('tecnicos.id')->map(fn ($id) => (int) $id)->all();

        $tecnicosFinales = $this->normalizeTecnicosIds($principal, $listaTecnicos);
        if ($requiereValidacionConflicto && !empty($tecnicosFinales)) {
            $conflicto = ScheduleConflictService::validarTecnicos(
                $tecnicosFinales,
                (string) ($validated['fecha_programada'] ?? $prog->fecha_programada),
                $validated['hora_inicio'] ?? $prog->hora_inicio,
                array_key_exists('hora_fin', $validated) ? ($validated['hora_fin'] ?? null) : $prog->hora_fin,
                ['programacion_servicio' => (int) $prog->id]
            );

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => $conflicto['mensaje'],
                    'conflicto' => $conflicto,
                ], 422);
            }
        }

        if (array_key_exists('id_cliente_planta_area', $validated)) {
            $validated['id_cliente_planta_area'] = $this->normalizeAreaIdsForJson($validated['id_cliente_planta_area']);
        }

        $validated['modificado_por'] = $request->user()?->id;
        $prog->update($validated);

        // Sincronizar técnicos si se envió tecnicos_ids
        if ($tecnicosIds !== null) {
            $principal = $validated['id_tecnico_asignado'] ?? $prog->id_tecnico_asignado;
            $this->syncTecnicos($prog, $principal, $tecnicosIds);
        }

        $prog->load([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'tecnicos',
            'vehiculo',
            'insumos.producto',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Programación actualizada',
            'data' => $prog,
        ]);
    }

    /**
     * Marcar una programación como "Realizado" y sugerir siguiente
     */
    public function completar(Request $request, $id)
    {
        $prog = ProgramacionServicio::with(['ordenServicio.detalles', 'insumos', 'tecnicos'])
            ->findOrFail($id);

        DB::beginTransaction();
        try {
            $prog->update([
                'estado_ejecucion' => 'Realizado',
                'fecha_ejecucion_real' => now(),
                'duracion_real' => $request->input('duracion_real'),
                'observaciones' => $request->input('observaciones', $prog->observaciones),
                'modificado_por' => $request->user()?->id,
            ]);

            // Actualizar insumos a "Utilizado"
            $prog->insumos()->update(['estado' => 'Utilizado']);

            // Verificar si TODAS las programaciones de la ODS están Realizadas
            $orden = $prog->ordenServicio;
            if ($orden) {
                $pendientes = ProgramacionServicio::where('id_orden_servicio', $orden->id)
                    ->whereNotIn('estado_ejecucion', ['Realizado', 'Cancelado'])
                    ->count();

                if ($pendientes === 0) {
                    $orden->estado = 'Completado';
                    $orden->save();
                }
            }

            // Buscar frecuencia del detalle para sugerir siguiente
            $sugerencia = null;
            if ($orden) {
                $detalle = DetalleOrdenServicio::where('id_orden_servicio', $orden->id)
                    ->where('id_servicio', $prog->id_servicio)
                    ->first();

                if ($detalle && $detalle->frecuencia && $detalle->frecuencia !== 'Única') {
                    $siguienteFecha = $this->calcularSiguienteFecha(
                        $prog->fecha_programada,
                        $detalle->frecuencia
                    );

                    $sugerencia = [
                        'frecuencia' => $detalle->frecuencia,
                        'fecha_sugerida' => $siguienteFecha,
                        'id_orden_servicio' => $orden->id,
                        'id_servicio' => $prog->id_servicio,
                        'id_tecnico_asignado' => $prog->id_tecnico_asignado,
                        'tecnicos_ids' => $prog->tecnicos->pluck('id')->toArray(),
                        'id_supervisor' => $prog->id_supervisor,
                        'id_vehiculo' => $prog->id_vehiculo,
                        'hora_inicio' => $prog->hora_inicio ? Carbon::parse($prog->hora_inicio)->format('H:i') : null,
                        'hora_fin' => $prog->hora_fin ? Carbon::parse($prog->hora_fin)->format('H:i') : null,
                        'local_sede' => $prog->local_sede,
                        'direccion_completa' => $prog->direccion_completa,
                        'id_cliente_planta' => $prog->id_cliente_planta,
                        'id_cliente_planta_area' => $prog->id_cliente_planta_area,
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Programación marcada como Realizado',
                'data' => $prog->fresh()->load('ordenServicio.cliente', 'servicio', 'tecnico', 'tecnicos'),
                'sugerencia_siguiente' => $sugerencia,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al completar: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar programación (y devolver insumos al inventario)
     */
    public function destroy(Request $request, $id)
    {
        $prog = ProgramacionServicio::with('insumos')->findOrFail($id);

        DB::beginTransaction();
        try {
            $idUsuario = $request->user()?->id;

            // Devolver insumos al inventario
            foreach ($prog->insumos as $insumo) {
                if ($insumo->estado !== 'Utilizado') {
                    Kardex::registrarMovimiento([
                        'id_producto' => $insumo->id_producto,
                        'tipo_movimiento' => 'Entrada',
                        'cantidad' => $insumo->cantidad_asignada,
                        'motivo' => 'Devolución Programación',
                        'referencia' => "PROG-{$prog->id}",
                        'id_referencia' => $prog->id,
                        'id_usuario' => $idUsuario,
                        'observacion' => "Devolución por eliminación de programación #{$prog->id}",
                    ]);
                }
            }

            // Eliminar insumos y luego la programación
            $prog->insumos()->delete();
            $prog->delete();

            // Si la ODS ya no tiene programaciones activas, volver a Aprobado
            if ($prog->id_orden_servicio) {
                $restantes = ProgramacionServicio::where('id_orden_servicio', $prog->id_orden_servicio)
                    ->whereNotIn('estado_ejecucion', ['Cancelado'])
                    ->count();

                if ($restantes === 0) {
                    OrdenServicio::where('id', $prog->id_orden_servicio)
                        ->update(['estado' => 'Aprobado']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Programación eliminada e insumos devueltos al inventario',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar ODS disponibles para programar (estado = Aprobado o Programado)
     */
    public function getODSDisponibles()
    {
        $ordenes = OrdenServicio::with(['cliente', 'detalles.servicio'])
            ->whereIn('estado', ['Aprobado', 'Programado'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($orden) {
                return [
                    'id' => $orden->id,
                    'numero_orden' => $orden->numero_orden,
                    'cliente' => $orden->cliente->nombre_empresa ?? $orden->cliente->persona_contacto ?? 'Sin cliente',
                    'id_cliente' => $orden->id_cliente,
                    'estado' => $orden->estado,
                    'fecha_tentativa' => $orden->fecha_tentativa,
                    'detalles' => $orden->detalles->map(function ($det) {
                        return [
                            'id' => $det->id,
                            'id_servicio' => $det->id_servicio,
                            'servicio_nombre' => $det->servicio->nombre ?? '',
                            'local' => $det->local,
                            'frecuencia' => $det->frecuencia,
                            'precio' => $det->precio,
                            'id_cliente_planta' => $det->id_cliente_planta,
                            'id_cliente_planta_area' => $det->id_cliente_planta_area,
                        ];
                    }),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ordenes,
        ]);
    }

    /**
     * Listar órdenes de capacitación disponibles para programar (estado = Aprobado)
     */
    public function getCapacitacionesDisponibles()
    {
        $ordenes = OrdenCapacitacionAuditoria::with(['cliente', 'servicio', 'exponentes', 'cotizacion'])
            ->where('estado', 'Aprobado')
            ->whereDoesntHave('programaciones', function ($q) {
                $q->whereNotIn('estado_ejecucion', ['Cancelado']);
            })
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($orden) {
                return [
                    'id' => $orden->id,
                    'numero_orden' => $orden->numero_orden,
                    'cliente' => $orden->cliente->nombre_empresa ?? $orden->cliente->persona_contacto ?? 'Sin cliente',
                    'id_cliente' => $orden->id_cliente,
                    'estado' => $orden->estado,
                    'fecha_servicio' => $orden->fecha_servicio,
                    'hora_servicio' => $orden->hora_servicio,
                    'modalidad' => $orden->modalidad,
                    'num_participantes' => $orden->num_participantes,
                    'num_certificados' => $orden->num_certificados ?? 0,
                    'horas_capacitacion' => $orden->horas_capacitacion ?? 0,
                    'servicio' => $orden->servicio?->nombre ?? 'Sin servicio',
                    'exponentes' => $orden->exponentes->map(fn($e) => [
                        'id' => $e->id,
                        'nombre' => $e->nombre,
                        'apellidos' => $e->apellidos,
                    ]),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $ordenes,
        ]);
    }

    /**
     * Programar una orden de capacitación
     */
    public function programarCapacitacion(Request $request)
    {
        $validated = $request->validate([
            'id_orden_capacitacion' => 'required|integer|exists:orden_capacitacion_auditoria,id',
            'id_tecnico_asignado'   => 'required|integer|exists:tecnicos,id',
            'tecnicos_ids'          => 'nullable|array',
            'tecnicos_ids.*'        => 'integer|exists:tecnicos,id',
            'id_supervisor'         => 'nullable|array',
            'id_supervisor.*'       => 'integer|exists:personal,id',
            'id_vehiculo'           => 'nullable|integer|exists:vehiculos,id',
            'fecha_programada'      => 'required|date',
            'hora_inicio'           => 'required',
            'hora_fin'              => 'nullable',
            'id_cliente_planta'     => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area'=> 'nullable',
            'exponentes_ids'        => 'nullable|array',
            'exponentes_ids.*'      => 'integer|exists:exponentes,id',
            'observaciones'         => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $idUsuario = $request->user()?->id;
            $ordenCap = OrdenCapacitacionAuditoria::findOrFail($validated['id_orden_capacitacion']);
            $idServicio = $ordenCap->id_servicio;

            $tecnicosAsignados = $this->normalizeTecnicosIds($validated['id_tecnico_asignado'] ?? null, $validated['tecnicos_ids'] ?? []);
            if (!empty($tecnicosAsignados)) {
                $conflictoTecnicos = ScheduleConflictService::validarTecnicos(
                    $tecnicosAsignados,
                    $validated['fecha_programada'],
                    $validated['hora_inicio'] ?? null,
                    $validated['hora_fin'] ?? null
                );

                if ($conflictoTecnicos) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => $conflictoTecnicos['mensaje'],
                        'conflicto' => $conflictoTecnicos,
                    ], 422);
                }
            }

            if (!empty($validated['exponentes_ids'])) {
                $conflictoExponentes = ScheduleConflictService::validarExponentes(
                    $validated['exponentes_ids'],
                    $validated['fecha_programada'],
                    $validated['hora_inicio'] ?? null,
                    $validated['hora_fin'] ?? null
                );

                if ($conflictoExponentes) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => $conflictoExponentes['mensaje'],
                        'conflicto' => $conflictoExponentes,
                    ], 422);
                }
            }

            if (empty($idServicio)) {
                $idServicio = Servicio::where('estado', 'activo')->value('id');
            }

            if (empty($idServicio)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró un servicio activo para asociar la programación de capacitación. Configure un servicio en el catálogo.',
                ], 422);
            }

            // Validar que no esté ya programada
            $yaProgamada = ProgramacionServicio::where('id_orden_capacitacion', $ordenCap->id)
                ->whereNotIn('estado_ejecucion', ['Cancelado'])
                ->exists();

            if ($yaProgamada) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta capacitación ya está programada',
                ], 422);
            }

            $areaIdsJson = $this->normalizeAreaIdsForJson($validated['id_cliente_planta_area'] ?? null);

            // Crear programación
            $prog = ProgramacionServicio::create([
                'id_orden_capacitacion' => $validated['id_orden_capacitacion'],
                'id_servicio'           => $idServicio,
                'id_tecnico_asignado'   => $validated['id_tecnico_asignado'],
                'id_supervisor'         => !empty($validated['id_supervisor']) ? $this->normalizePersonalIds($validated['id_supervisor']) : null,
                'id_vehiculo'           => $validated['id_vehiculo'] ?? null,
                'fecha_programada'      => $validated['fecha_programada'],
                'hora_inicio'           => $validated['hora_inicio'],
                'hora_fin'              => $validated['hora_fin'] ?? null,
                'local_sede'            => 'Aula/Sede de Capacitación',
                'direccion_completa'    => $ordenCap->cliente?->direccion,
                'id_cliente_planta'     => $validated['id_cliente_planta'] ?? null,
                'id_cliente_planta_area'=> $areaIdsJson,
                'estado_ejecucion'      => 'Programado',
                'observaciones'         => $validated['observaciones'] ?? null,
                'creado_por'            => $idUsuario,
            ]);

            // Sincronizar técnicos
            $this->syncTecnicos($prog, $validated['id_tecnico_asignado'], $validated['tecnicos_ids'] ?? []);

            // Sincronizar exponentes solo si existe tabla pivot
            if (!empty($validated['exponentes_ids']) && Schema::hasTable('programacion_exponentes')) {
                $prog->exponentes()->sync($validated['exponentes_ids']);
            }

            // Cambiar estado de la OCA a "Programado"
            $ordenCap->estado = 'Programado';
            $ordenCap->save();

            DB::commit();

            $prog->load([
                'ordenCapacitacion.cliente',
                'ordenCapacitacion.exponentes',
                'exponentes',
                'servicio',
                'tecnico',
                'tecnicos',
                'vehiculo',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Capacitación programada exitosamente',
                'data' => $prog,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al programar capacitación: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Estadísticas del módulo
     */
    public function estadisticas(Request $request)
    {
        $mes = $request->input('mes', now()->month);
        $anio = $request->input('anio', now()->year);

        $base = ProgramacionServicio::whereMonth('fecha_programada', $mes)
            ->whereYear('fecha_programada', $anio);

        $stats = [
            'programados' => (clone $base)->where('estado_ejecucion', 'Programado')->count(),
            'confirmados' => (clone $base)->where('estado_ejecucion', 'Confirmado')->count(),
            'en_ejecucion' => (clone $base)->whereIn('estado_ejecucion', ['En Camino', 'En Ejecución'])->count(),
            'completados' => (clone $base)->where('estado_ejecucion', 'Realizado')->count(),
            'reprogramados' => (clone $base)->where('estado_ejecucion', 'Reprogramado')->count(),
            'cancelados' => (clone $base)->where('estado_ejecucion', 'Cancelado')->count(),
            'total' => (clone $base)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    // ─── Helpers privados ────────────────────────────────────

    /**
     * Asignar insumos desde la receta del servicio + Kardex Salida
     */
    private function asignarInsumosDesdeReceta(ProgramacionServicio $prog, ?int $idUsuario): void
    {
        $receta = ServicioProducto::where('id_servicio', $prog->id_servicio)->get();

        foreach ($receta as $item) {
            ProgramacionInsumo::create([
                'id_programacion' => $prog->id,
                'id_producto' => $item->id_producto,
                'cantidad_asignada' => $item->cantidad_default,
                'estado' => 'Asignado', // Asignado teóricamente, pendiente de entrega por almacén
            ]);

            // NOTA: El stock NO se descuenta aquí automáticamente.
            // Almacén debe confirmar la salida física de materiales,
            // y en ese momento se registrará en Kardex y descontará del stock.
            // Ver función de confirmación de salida en módulo de almacén.
        }
    }

    /**
     * Calcular fechas por frecuencia desde fecha_inicio hasta fin de año
     */
    private function calcularFechasPorFrecuencia(string $frecuencia, string $fechaInicio, ?string $diasSemana = null): array
    {
        $inicio = Carbon::parse($fechaInicio);
        $finAnio = Carbon::create($inicio->year, 12, 31);
        $fechas = [];
        $current = $inicio->copy();

        // Caso especial: Días de la semana
        if ($this->esFrecuenciaDiasSemana($frecuencia) && $diasSemana) {
            // Mapeo de nombres de días a números de Carbon (1=Lunes, 7=Domingo)
            $mapaDias = [
                'lunes' => Carbon::MONDAY,
                'martes' => Carbon::TUESDAY,
                'miércoles' => Carbon::WEDNESDAY,
                'miercoles' => Carbon::WEDNESDAY,
                'jueves' => Carbon::THURSDAY,
                'viernes' => Carbon::FRIDAY,
                'sábado' => Carbon::SATURDAY,
                'sabado' => Carbon::SATURDAY,
                'domingo' => Carbon::SUNDAY,
            ];

            // Convertir CSV a array y normalizar
            $diasSeleccionados = array_map('trim', explode(',', $diasSemana));
            $diasNumeros = [];
            
            foreach ($diasSeleccionados as $dia) {
                $diaLower = strtolower($dia);
                if (isset($mapaDias[$diaLower])) {
                    $diasNumeros[] = $mapaDias[$diaLower];
                }
            }

            if (empty($diasNumeros)) {
                return $fechas;
            }

            // Iterar día por día y agregar los que coincidan
            while ($current->lte($finAnio)) {
                if (in_array($current->dayOfWeek, $diasNumeros)) {
                    $fechas[] = $current->format('Y-m-d');
                }
                $current->addDay();
            }

            return $fechas;
        }

        // Lógica original para otras frecuencias
        while ($current->lte($finAnio)) {
            $fechas[] = $current->format('Y-m-d');

            switch (strtolower($frecuencia)) {
                case 'semanal':
                    $current->addWeek();
                    break;
                case 'quincenal':
                    $current->addDays(15);
                    break;
                case 'mensual':
                    $current->addMonth();
                    break;
                case 'bimestral':
                    $current->addMonths(2);
                    break;
                case 'trimestral':
                    $current->addMonths(3);
                    break;
                case 'semestral':
                    $current->addMonths(6);
                    break;
                case 'anual':
                    $current->addYear();
                    break;
                case 'única':
                case 'unica':
                    // Solo una vez
                    return $fechas;
                default:
                    return $fechas;
            }
        }

        return $fechas;
    }

    /**
     * Detecta si la frecuencia representa programación por días de la semana
     * incluso cuando llega como texto extendido (ej: "2 días a la semana (...)").
     */
    private function esFrecuenciaDiasSemana(string $frecuencia): bool
    {
        $txt = mb_strtolower(trim($frecuencia), 'UTF-8');

        if ($txt === 'días de la semana' || $txt === 'dias de la semana') {
            return true;
        }

        if (str_contains($txt, 'dias a la semana') || str_contains($txt, 'días a la semana')) {
            return true;
        }

        return false;
    }

    /**
     * Calcular siguiente fecha según frecuencia
     */
    private function calcularSiguienteFecha($fechaBase, string $frecuencia): string
    {
        $fecha = Carbon::parse($fechaBase);

        switch (strtolower($frecuencia)) {
            case 'semanal':
                return $fecha->addWeek()->format('Y-m-d');
            case 'quincenal':
                return $fecha->addDays(15)->format('Y-m-d');
            case 'mensual':
                return $fecha->addMonth()->format('Y-m-d');
            case 'bimestral':
                return $fecha->addMonths(2)->format('Y-m-d');
            case 'trimestral':
                return $fecha->addMonths(3)->format('Y-m-d');
            case 'semestral':
                return $fecha->addMonths(6)->format('Y-m-d');
            case 'anual':
                return $fecha->addYear()->format('Y-m-d');
            default:
                return $fecha->addMonth()->format('Y-m-d');
        }
    }

    /**
     * Generar PDF de programaciones (mensual / semanal / diaria)
     */
    public function generarPDF(Request $request)
    {
        $vista = $request->input('vista', 'mensual'); // mensual | semanal | diaria

        $queryServicios = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'tecnicos',
            'vehiculo',
            'insumos.producto',
        ]);

        $queryVisitas = ProgramacionVisita::with([
            'cliente',
            'tecnico',
            'vehiculo',
        ]);

        $queryFabricaciones = ProgramacionFabricacion::with([
            'tecnico',
            'ordenFabricacion',
        ]);

        $queryOtros = ProgramacionOtro::with([
            'tecnico',
            'vehiculo',
        ]);

        $orientation = 'landscape';
        $titulo = '';
        $fechaInicio = null;
        $mes = null;
        $anio = null;

        $monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        if ($vista === 'mensual') {
            $mes = $request->input('mes', now()->month);
            $anio = $request->input('anio', now()->year);
            $queryServicios->whereMonth('fecha_programada', $mes)
                ->whereYear('fecha_programada', $anio);
            $queryVisitas->whereMonth('fecha_programada', $mes)
                ->whereYear('fecha_programada', $anio);
            $queryFabricaciones->whereMonth('fecha_programada', $mes)
                ->whereYear('fecha_programada', $anio);
            $queryOtros->whereMonth('fecha_programada', $mes)
                ->whereYear('fecha_programada', $anio);
            $titulo = $monthNames[$mes - 1] . ' ' . $anio;
        } elseif ($vista === 'semanal') {
            // Se pasa fecha_inicio (lunes de la semana)
            $fechaInicio = $request->input('fecha_inicio', now()->startOfWeek()->format('Y-m-d'));
            $fechaFin = Carbon::parse($fechaInicio)->addDays(6)->format('Y-m-d');
            $queryServicios->whereBetween('fecha_programada', [$fechaInicio, $fechaFin]);
            $queryVisitas->whereBetween('fecha_programada', [$fechaInicio, $fechaFin]);
            $queryFabricaciones->whereBetween('fecha_programada', [$fechaInicio, $fechaFin]);
            $queryOtros->whereBetween('fecha_programada', [$fechaInicio, $fechaFin]);
            $titulo = 'Semana del ' . Carbon::parse($fechaInicio)->format('d/m/Y') . ' al ' . Carbon::parse($fechaFin)->format('d/m/Y');
        } elseif ($vista === 'diaria') {
            $fecha = $request->input('fecha', now()->format('Y-m-d'));
            $queryServicios->whereDate('fecha_programada', $fecha);
            $queryVisitas->whereDate('fecha_programada', $fecha);
            $queryFabricaciones->whereDate('fecha_programada', $fecha);
            $queryOtros->whereDate('fecha_programada', $fecha);
            $titulo = Carbon::parse($fecha)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY');
            $orientation = 'landscape';
        }

        // Filtro opcional: técnico
        if ($request->filled('id_tecnico')) {
            $idTec = $request->id_tecnico;
            $queryServicios->where(function ($q) use ($idTec) {
                $q->where('id_tecnico_asignado', $idTec)
                  ->orWhereHas('tecnicos', fn($q2) => $q2->where('tecnicos.id', $idTec));
            });

            $queryVisitas->where(function ($q) use ($idTec) {
                $q->where('id_tecnico_asignado', $idTec)
                    ->orWhereJsonContains('tecnicos_ids', (int) $idTec);
            });

            $queryFabricaciones->where(function ($q) use ($idTec) {
                $q->where('id_tecnico_asignado', $idTec)
                    ->orWhereJsonContains('tecnicos_ids', (int) $idTec);
            });

            $queryOtros->where(function ($q) use ($idTec) {
                $q->where('id_tecnico_asignado', $idTec)
                    ->orWhereJsonContains('tecnicos_ids', (int) $idTec);
            });
        }

        // Filtro opcional: estado
        if ($request->filled('estado')) {
            $estados = explode(',', $request->estado);
            $queryServicios->whereIn('estado_ejecucion', $estados);
            $queryVisitas->whereIn('estado_ejecucion', $estados);
            $queryFabricaciones->whereIn('estado_ejecucion', $estados);
            $queryOtros->whereIn('estado_ejecucion', $estados);
        }

        $programacionesServicios = $queryServicios->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        $programacionesVisitas = $queryVisitas->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        $programacionesFabricacion = $queryFabricaciones->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        $programacionesOtros = $queryOtros->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        // Enriquecer visitas para que el blade reutilice la misma estructura de programación de servicio.
        $tecnicoIdsVisitas = $programacionesVisitas
            ->flatMap(function ($visita) {
                $ids = collect($visita->tecnicos_ids ?? [])->map(fn($id) => (int) $id)->filter(fn($id) => $id > 0);
                if (!empty($visita->id_tecnico_asignado)) {
                    $ids->push((int) $visita->id_tecnico_asignado);
                }
                return $ids;
            })
            ->concat(
                $programacionesFabricacion->flatMap(function ($fabricacion) {
                    $ids = collect($fabricacion->tecnicos_ids ?? [])->map(fn($id) => (int) $id)->filter(fn($id) => $id > 0);
                    if (!empty($fabricacion->id_tecnico_asignado)) {
                        $ids->push((int) $fabricacion->id_tecnico_asignado);
                    }
                    return $ids;
                })
            )
            ->concat(
                $programacionesOtros->flatMap(function ($otro) {
                    $ids = collect($otro->tecnicos_ids ?? [])->map(fn($id) => (int) $id)->filter(fn($id) => $id > 0);
                    if (!empty($otro->id_tecnico_asignado)) {
                        $ids->push((int) $otro->id_tecnico_asignado);
                    }
                    return $ids;
                })
            )
            ->unique()
            ->values();

        $tecnicosMap = $tecnicoIdsVisitas->isNotEmpty()
            ? Tecnico::query()->whereIn('id', $tecnicoIdsVisitas)->get()->keyBy('id')
            : collect();

        $visitasCompatibles = $programacionesVisitas->map(function ($visita) use ($tecnicosMap) {
            $ids = collect($visita->tecnicos_ids ?? [])->map(fn($id) => (int) $id)->filter(fn($id) => $id > 0);
            if (!empty($visita->id_tecnico_asignado)) {
                $ids->push((int) $visita->id_tecnico_asignado);
            }
            $ids = $ids->unique()->values();

            $tecnicos = $ids
                ->map(fn($id) => $tecnicosMap->get($id))
                ->filter()
                ->values();

            $visita->setRelation('tecnicos', $tecnicos);
            $visita->setRelation('insumos', collect());
            $visita->setRelation('ordenServicio', (object) [
                'cliente' => (object) [
                    'nombre_empresa' => $visita->cliente?->nombre_empresa,
                    'persona_contacto' => $visita->cliente?->persona_contacto,
                ],
            ]);
            $visita->setRelation('servicio', (object) [
                'nombre' => $visita->tipo_visita ?: 'Visita',
            ]);

            return $visita;
        });

        $fabricacionesCompatibles = $programacionesFabricacion->map(function ($fabricacion) use ($tecnicosMap) {
            $ids = collect($fabricacion->tecnicos_ids ?? [])->map(fn($id) => (int) $id)->filter(fn($id) => $id > 0);
            if (!empty($fabricacion->id_tecnico_asignado)) {
                $ids->push((int) $fabricacion->id_tecnico_asignado);
            }
            $ids = $ids->unique()->values();

            $tecnicos = $ids
                ->map(fn($id) => $tecnicosMap->get($id))
                ->filter()
                ->values();

            $fabricacion->setRelation('tecnicos', $tecnicos);
            $fabricacion->setRelation('insumos', collect());
            $fabricacion->setRelation('ordenServicio', (object) [
                'cliente' => (object) [
                    'nombre_empresa' => 'PRODUCTOS',
                    'persona_contacto' => null,
                ],
            ]);
            $fabricacion->setRelation('servicio', (object) [
                'nombre' => 'Fabricacion',
            ]);
            $fabricacion->local_sede = $fabricacion->local_sede ?? null;
            $fabricacion->direccion_completa = $fabricacion->direccion_completa ?? null;

            return $fabricacion;
        });

        $otrosCompatibles = $programacionesOtros->map(function ($otro) use ($tecnicosMap) {
            $ids = collect($otro->tecnicos_ids ?? [])->map(fn($id) => (int) $id)->filter(fn($id) => $id > 0);
            if (!empty($otro->id_tecnico_asignado)) {
                $ids->push((int) $otro->id_tecnico_asignado);
            }
            $ids = $ids->unique()->values();

            $tecnicos = $ids
                ->map(fn($id) => $tecnicosMap->get($id))
                ->filter()
                ->values();

            $otro->setRelation('tecnicos', $tecnicos);
            $otro->setRelation('insumos', collect());
            $otro->setRelation('ordenServicio', (object) [
                'cliente' => (object) [
                    'nombre_empresa' => 'OTROS',
                    'persona_contacto' => null,
                ],
            ]);
            $otro->setRelation('servicio', (object) [
                'nombre' => 'Otros',
            ]);
            $otro->local_sede = $otro->ubicacion_manual ?? null;
            $otro->direccion_completa = $otro->ubicacion_manual ?? null;

            return $otro;
        });

        $programaciones = $programacionesServicios
            ->concat($visitasCompatibles)
            ->concat($fabricacionesCompatibles)
            ->concat($otrosCompatibles)
            ->sort(function ($a, $b) {
                $fechaA = Carbon::parse($a->fecha_programada)->format('Y-m-d');
                $fechaB = Carbon::parse($b->fecha_programada)->format('Y-m-d');
                if ($fechaA !== $fechaB) {
                    return $fechaA <=> $fechaB;
                }

                $horaA = Carbon::parse($a->hora_inicio)->format('H:i:s');
                $horaB = Carbon::parse($b->hora_inicio)->format('H:i:s');
                return $horaA <=> $horaB;
            })
            ->values();

        // Contadores por estado
        $contadores = $programaciones->groupBy('estado_ejecucion')->map->count()->toArray();
        $total = $programaciones->count();

        $pdf = Pdf::loadView('ProgramacionPDF', [
            'programaciones' => $programaciones,
            'vista'          => $vista,
            'titulo'         => $titulo,
            'contadores'     => $contadores,
            'total'          => $total,
            'mes'            => $mes,
            'anio'           => $anio,
            'fechaInicio'    => $fechaInicio,
        ])->setPaper('A4', $orientation);

        $filename = 'Programacion_' . ucfirst($vista) . '_' . now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Sincronizar técnicos en la tabla pivot.
     * El principal se marca con rol "Principal", los demás como "Apoyo".
     */
    private function syncTecnicos(ProgramacionServicio $prog, int $principalId, array $tecnicosIds): void
    {
        // Asegurar que el principal esté incluido
        $allIds = collect($tecnicosIds)->push($principalId)->unique()->values();

        $syncData = [];
        foreach ($allIds as $tecId) {
            $syncData[$tecId] = ['rol' => $tecId == $principalId ? 'Principal' : 'Apoyo'];
        }

        $prog->tecnicos()->sync($syncData);
    }

    private function normalizeTecnicosIds(?int $principalId, array $tecnicosIds): array
    {
        $ids = $tecnicosIds;
        if (!empty($principalId)) {
            $ids[] = $principalId;
        }

        return array_values(array_unique(array_filter(array_map('intval', $ids), fn (int $id) => $id > 0)));
    }

    /**
     * Normaliza id_cliente_planta_area para persistir en columna JSON.
     * Acepta entero, string numérico, JSON string o array.
     */
    private function normalizeAreaIdsForJson($raw): ?string
    {
        if ($raw === null || $raw === '') {
            return null;
        }

        if (is_int($raw) || is_float($raw) || (is_string($raw) && is_numeric($raw))) {
            $raw = [(int) $raw];
        } elseif (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $raw = $decoded;
            } else {
                return null;
            }
        }

        if (!is_array($raw)) {
            return null;
        }

        $ids = collect($raw)
            ->filter(fn($v) => is_numeric($v) && (int) $v > 0)
            ->map(fn($v) => (int) $v)
            ->unique()
            ->values()
            ->all();

        return empty($ids) ? null : json_encode($ids);
    }
}
