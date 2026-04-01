<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenAsesoria;
use App\Models\ProgramacionAsesoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramacionAsesoriaController extends Controller
{
    public function index(Request $request)
    {
        $query = ProgramacionAsesoria::with([
            'ordenAsesoria.cliente',
            'ordenAsesoria.servicio',
            'ordenAsesoria.exponentes',
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
        $programacion = ProgramacionAsesoria::with([
            'ordenAsesoria.cliente',
            'ordenAsesoria.servicio',
            'ordenAsesoria.cotizacion.detalles.catalogoCapAud',
            'ordenAsesoria.cotizacion.detalles.servicio',
            'ordenAsesoria.exponentes',
            'supervisor',
            'vehiculo',
            'planta',
            'area',
        ])->findOrFail($id);

        // Calcular asesoria_nombre
        $detalle = $programacion->ordenAsesoria?->cotizacion?->detalles?->first();
        $asesoria_nombre = $detalle?->catalogoCapAud?->nombre
            ?? $detalle?->servicio?->nombre
            ?? $programacion->ordenAsesoria?->servicio?->nombre
            ?? 'Sin asesoría';

        $data = $programacion->toArray();
        $data['asesoria_nombre'] = $asesoria_nombre;

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function getAsesoriasDisponibles()
    {
        $idsYaProgramadas = ProgramacionAsesoria::whereNotIn('estado_ejecucion', ['Cancelado'])
            ->pluck('id_orden_asesoria')
            ->filter()
            ->toArray();

        $ordenes = OrdenAsesoria::with([
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
                $detalles = $o->cotizacion?->detalles;
                $detalle = $detalles?->first(function ($d) {
                    return !is_null($d->meses_implementacion) || !empty($d->frecuencia_visita);
                }) ?? $detalles?->first();
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
                    'asesoria_nombre' => $detalle?->catalogoCapAud?->nombre
                        ?? $detalle?->servicio?->nombre
                        ?? $o->servicio->nombre
                        ?? 'Sin asesoría',
                    'servicio' => $o->servicio->nombre ?? 'Sin servicio',
                    'planta_nombre' => $planta?->nombre,
                    'areas_nombres' => $areasNombres,
                    'exponentes' => $o->exponentes->toArray(),
                    'meses_implementacion' => $detalle?->meses_implementacion,
                    'frecuencia_visita' => $detalle?->frecuencia_visita,
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
            'id_orden_asesoria' => 'required|integer|exists:orden_asesoria,id',
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
            'exponentes' => 'nullable|array',
            'exponentes.*' => 'integer|exists:exponentes,id',
        ]);

        DB::beginTransaction();
        try {
            $ordenAsesoria = OrdenAsesoria::with('cliente')->findOrFail($validated['id_orden_asesoria']);

            $yaProgramada = ProgramacionAsesoria::where('id_orden_asesoria', $ordenAsesoria->id)
                ->whereNotIn('estado_ejecucion', ['Cancelado'])
                ->exists();

            if ($yaProgramada) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta orden de asesoría ya está programada',
                ], 422);
            }

            $programacion = ProgramacionAsesoria::create([
                'id_orden_asesoria' => $validated['id_orden_asesoria'],
                'id_supervisor' => $validated['id_supervisor'] ?? null,
                'id_vehiculo' => $validated['id_vehiculo'] ?? null,
                'id_cliente_planta' => $validated['id_cliente_planta'] ?? null,
                'id_cliente_planta_area' => $validated['id_cliente_planta_area'] ?? null,
                'fecha_programada' => $validated['fecha_programada'],
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fin' => $validated['hora_fin'] ?? null,
                'local_sede' => $validated['local_sede'] ?? 'Lugar de Asesoría',
                'direccion_completa' => $validated['direccion_completa'] ?? ($ordenAsesoria->cliente?->direccion ?? null),
                'estado_ejecucion' => 'Programado',
                'observaciones' => $validated['observaciones'] ?? null,
                'creado_por' => $request->user()?->id,
            ]);

            // Sincronizar exponentes
            if (!empty($validated['exponentes'])) {
                $programacion->exponentes()->sync($validated['exponentes']);
            }

            $ordenAsesoria->estado = 'Programado';
            $ordenAsesoria->save();

            DB::commit();

            $programacion->load([
                'ordenAsesoria.cliente',
                'ordenAsesoria.servicio',
                'ordenAsesoria.exponentes',
                'supervisor',
                'vehiculo',
                'planta',
                'area',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Asesoría programada exitosamente',
                'data' => $programacion,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al programar asesoría: ' . $e->getMessage(),
            ], 500);
        }
    }
}
