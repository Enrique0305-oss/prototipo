<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenCapacitacionAuditoria;
use App\Models\ProgramacionCapacitacion;
use App\Services\ScheduleConflictService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramacionCapacitacionController extends Controller
{
    public function index(Request $request)
    {
        $query = ProgramacionCapacitacion::with([
            'ordenCapacitacion.cliente',
            'ordenCapacitacion.servicio',
            'exponentes',
            'supervisor',
            'vehiculo',
            'tecnicoConductor',
            'planta',
            'area',
        ]);

        if ($request->filled('fecha')) {
            $query->whereDate('fecha_programada', $request->fecha);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha_programada', [$request->fecha_inicio, $request->fecha_fin]);
        }

        if ($request->filled('mes') && $request->filled('anio')) {
            $query->whereMonth('fecha_programada', $request->mes)
                  ->whereYear('fecha_programada', $request->anio);
        }

        $data = $query->orderBy('fecha_programada')->orderBy('hora_inicio')->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function show($id)
    {
        $programacion = ProgramacionCapacitacion::with([
            'ordenCapacitacion.cliente',
            'ordenCapacitacion.servicio',
            'ordenCapacitacion.cotizacion.detalles.catalogoCapAud',
            'ordenCapacitacion.cotizacion.detalles.servicio',
            'exponentes',
            'supervisor',
            'vehiculo',
            'tecnicoConductor',
            'planta',
            'area',
        ])->findOrFail($id);

        // Calcular capacitacion_nombre
        $detalle = $programacion->ordenCapacitacion?->cotizacion?->detalles?->first();
        $capacitacion_nombre = $detalle?->catalogoCapAud?->nombre
            ?? $detalle?->servicio?->nombre
            ?? $programacion->ordenCapacitacion?->servicio?->nombre
            ?? 'Sin capacitación';

        $data = $programacion->toArray();
        $data['capacitacion_nombre'] = $capacitacion_nombre;

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function getCapacitacionesDisponibles()
    {
        $idsYaProgramadas = ProgramacionCapacitacion::whereNotIn('estado_ejecucion', ['Cancelado'])
            ->pluck('id_orden_capacitacion')
            ->filter()
            ->toArray();

        $ordenes = OrdenCapacitacionAuditoria::with([
                'cliente:id,nombre_empresa,persona_contacto',
                'servicio:id,nombre',
                'exponentes:id,nombre,apellidos,especialidad,profesion',
            'cotizacion.detalles.planta.areas',
            'cotizacion.detalles.catalogoCapAud',
            'cotizacion.detalles.servicio',
            ])
            ->where('estado', 'Aprobado')
            ->when(!empty($idsYaProgramadas), function ($q) use ($idsYaProgramadas) {
                $q->whereNotIn('id', $idsYaProgramadas);
            })
            ->orderByDesc('id')
            ->get()
            ->map(function ($o) {
                $detalle = $o->cotizacion?->detalles?->first();
                $planta = $detalle?->planta;

                $areaIds = $detalle?->id_cliente_planta_area ?? [];
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
                    'id' => $o->id,
                    'numero_orden' => $o->numero_orden,
                    'cliente' => $o->cliente->nombre_empresa ?? $o->cliente->persona_contacto ?? 'N/A',
                    'estado' => $o->estado,
                    'fecha_servicio' => optional($o->fecha_servicio)->format('Y-m-d') ?? $o->fecha_servicio,
                    'hora_servicio' => $o->hora_servicio,
                    'modalidad' => $o->modalidad,
                    'num_participantes' => $o->num_participantes,
                    'num_certificados' => $o->num_certificados,
                    'horas_capacitacion' => $o->horas_capacitacion,
                    'capacitacion_nombre' => $detalle?->catalogoCapAud?->nombre
                        ?? $detalle?->servicio?->nombre
                        ?? $o->servicio->nombre
                        ?? 'Sin capacitación',
                    'servicio' => $o->servicio->nombre ?? 'Sin servicio',
                    'planta_nombre' => $planta?->nombre,
                    'areas_nombres' => $areasNombres,
                    'exponentes' => $o->exponentes->values(),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $ordenes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_orden_capacitacion' => 'required|integer|exists:orden_capacitacion_auditoria,id',
            'id_supervisor' => 'nullable|integer|exists:personal,id',
            'id_vehiculo' => 'nullable|integer|exists:vehiculos,id',
            'id_tecnico_conductor' => 'nullable|integer|exists:tecnicos,id',
            'motivo' => 'required|string|in:Operativa,Calidad,Otros',
            'motivo_otro' => 'nullable|string|max:255|required_if:motivo,Otros',
            'id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
            'fecha_programada' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fin' => 'nullable',
            'local_sede' => 'nullable|string|max:150',
            'direccion_completa' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
            'exponentes_ids' => 'required|array|min:1',
            'exponentes_ids.*' => 'integer|exists:exponentes,id',
        ]);

        DB::beginTransaction();
        try {
            $conflicto = ScheduleConflictService::validarExponentes(
                $validated['exponentes_ids'] ?? [],
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

            $ordenCap = OrdenCapacitacionAuditoria::with('cliente')->findOrFail($validated['id_orden_capacitacion']);

            $jornadaDuplicada = ProgramacionCapacitacion::where('id_orden_capacitacion', $ordenCap->id)
                ->whereDate('fecha_programada', $validated['fecha_programada'])
                ->where('hora_inicio', $validated['hora_inicio'])
                ->whereNotIn('estado_ejecucion', ['Cancelado'])
                ->exists();

            if ($jornadaDuplicada) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una jornada registrada para esta orden en la misma fecha y hora de inicio',
                ], 422);
            }

            $programacion = ProgramacionCapacitacion::create([
                'id_orden_capacitacion' => $validated['id_orden_capacitacion'],
                'id_supervisor' => $validated['id_supervisor'] ?? null,
                'id_vehiculo' => $validated['id_vehiculo'] ?? null,
                'id_tecnico_conductor' => $validated['id_tecnico_conductor'] ?? null,
                'motivo' => $validated['motivo'],
                'motivo_otro' => $validated['motivo'] === 'Otros' ? ($validated['motivo_otro'] ?? null) : null,
                'id_cliente_planta' => $validated['id_cliente_planta'] ?? null,
                'id_cliente_planta_area' => $validated['id_cliente_planta_area'] ?? null,
                'fecha_programada' => $validated['fecha_programada'],
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fin' => $validated['hora_fin'] ?? null,
                'local_sede' => $validated['local_sede'] ?? 'Aula/Sede de Capacitación',
                'direccion_completa' => $validated['direccion_completa'] ?? ($ordenCap->cliente?->direccion ?? null),
                'estado_ejecucion' => 'Programado',
                'observaciones' => $validated['observaciones'] ?? null,
                'creado_por' => $request->user()?->id,
            ]);

            $programacion->exponentes()->sync($validated['exponentes_ids']);

            $ordenCap->estado = 'Programado';
            $ordenCap->save();

            DB::commit();

            $programacion->load([
                'ordenCapacitacion.cliente',
                'ordenCapacitacion.servicio',
                'exponentes',
                'supervisor',
                'vehiculo',
                'tecnicoConductor',
                'planta',
                'area',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Capacitación programada exitosamente',
                'data' => $programacion,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al programar capacitación: ' . $e->getMessage(),
            ], 500);
        }
    }
}
