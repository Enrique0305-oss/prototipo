<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenCapacitacionAuditoria;
use App\Models\ProgramacionCapacitacion;
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
            'exponentes',
            'supervisor',
            'vehiculo',
            'planta',
            'area',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $programacion,
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
            ])
            ->where('estado', 'Aprobado')
            ->when(!empty($idsYaProgramadas), function ($q) use ($idsYaProgramadas) {
                $q->whereNotIn('id', $idsYaProgramadas);
            })
            ->orderByDesc('id')
            ->get()
            ->map(function ($o) {
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
                    'servicio' => $o->servicio->nombre ?? 'Sin servicio',
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
            $ordenCap = OrdenCapacitacionAuditoria::with('cliente')->findOrFail($validated['id_orden_capacitacion']);

            $yaProgramada = ProgramacionCapacitacion::where('id_orden_capacitacion', $ordenCap->id)
                ->whereNotIn('estado_ejecucion', ['Cancelado'])
                ->exists();

            if ($yaProgramada) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta orden de capacitación ya está programada',
                ], 422);
            }

            $programacion = ProgramacionCapacitacion::create([
                'id_orden_capacitacion' => $validated['id_orden_capacitacion'],
                'id_supervisor' => $validated['id_supervisor'] ?? null,
                'id_vehiculo' => $validated['id_vehiculo'] ?? null,
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
