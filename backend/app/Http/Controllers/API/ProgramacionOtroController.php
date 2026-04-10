<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionOtro;
use App\Services\ScheduleConflictService;
use Illuminate\Http\Request;

class ProgramacionOtroController extends Controller
{
    private function normalizeIds(mixed $value): array
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

    public function index(Request $request)
    {
        $query = ProgramacionOtro::with(['tecnico', 'vehiculo']);

        if ($request->filled('fecha')) {
            $query->whereDate('fecha_programada', $request->fecha);
        }

        if ($request->filled('mes') && $request->filled('anio')) {
            $query->whereMonth('fecha_programada', $request->mes)
                ->whereYear('fecha_programada', $request->anio);
        } elseif ($request->filled('anio')) {
            $query->whereYear('fecha_programada', $request->anio);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha_programada', [$request->fecha_inicio, $request->fecha_fin]);
        }

        if ($request->filled('id_tecnico')) {
            $query->where('id_tecnico_asignado', $request->id_tecnico);
        }

        if ($request->filled('estado')) {
            $query->where('estado_ejecucion', $request->estado);
        }

        $programaciones = $query->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $programaciones,
        ]);
    }

    public function show($id)
    {
        $programacion = ProgramacionOtro::with(['tecnico', 'vehiculo'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $programacion,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|max:255',
            'id_tecnico_asignado' => 'nullable|integer|exists:tecnicos,id',
            'tecnicos_ids' => 'nullable|array',
            'tecnicos_ids.*' => 'integer|exists:tecnicos,id',
            'id_supervisor' => 'nullable|array',
            'id_supervisor.*' => 'integer|exists:personal,id',
            'id_vehiculo' => 'nullable|integer|exists:vehiculos,id',
            'fecha_programada' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fin' => 'nullable',
            'ubicacion_manual' => 'required|string|max:255',
            'observaciones' => 'nullable|string',
        ]);

        $tecnicosAsignados = $this->normalizeIds(array_merge(
            [$validated['id_tecnico_asignado'] ?? null],
            $validated['tecnicos_ids'] ?? []
        ));

        if (!empty($tecnicosAsignados)) {
            $conflicto = ScheduleConflictService::validarTecnicos(
                $tecnicosAsignados,
                $validated['fecha_programada'],
                $validated['hora_inicio'] ?? null,
                $validated['hora_fin'] ?? null
            );

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => $conflicto['mensaje'],
                    'conflicto' => $conflicto,
                ], 422);
            }
        }

        $personalAsignado = $this->normalizeIds($validated['id_supervisor'] ?? []);
        if (!empty($personalAsignado)) {
            $conflicto = ScheduleConflictService::validarPersonal(
                $personalAsignado,
                $validated['fecha_programada'],
                $validated['hora_inicio'] ?? null,
                $validated['hora_fin'] ?? null
            );

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => $conflicto['mensaje'],
                    'conflicto' => $conflicto,
                ], 422);
            }
        }

        $programacion = ProgramacionOtro::create([
            'motivo' => $validated['motivo'],
            'id_tecnico_asignado' => $validated['id_tecnico_asignado'] ?? null,
            'tecnicos_ids' => !empty($validated['tecnicos_ids']) ? array_values(array_unique(array_map('intval', $validated['tecnicos_ids']))) : null,
            'id_supervisor' => !empty($validated['id_supervisor']) ? array_values(array_unique(array_map('intval', $validated['id_supervisor']))) : null,
            'id_vehiculo' => $validated['id_vehiculo'] ?? null,
            'fecha_programada' => $validated['fecha_programada'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin' => $validated['hora_fin'] ?? null,
            'ubicacion_manual' => $validated['ubicacion_manual'],
            'estado_ejecucion' => 'Programado',
            'observaciones' => $validated['observaciones'] ?? null,
            'creado_por' => $request->user()?->id,
        ]);

        $programacion->load(['tecnico', 'vehiculo']);

        return response()->json([
            'success' => true,
            'message' => 'Programación de otros creada exitosamente',
            'data' => $programacion,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $programacion = ProgramacionOtro::findOrFail($id);

        $validated = $request->validate([
            'motivo' => 'sometimes|required|string|max:255',
            'id_tecnico_asignado' => 'sometimes|nullable|integer|exists:tecnicos,id',
            'tecnicos_ids' => 'nullable|array',
            'tecnicos_ids.*' => 'integer|exists:tecnicos,id',
            'id_supervisor' => 'nullable|array',
            'id_supervisor.*' => 'integer|exists:personal,id',
            'id_vehiculo' => 'nullable|integer|exists:vehiculos,id',
            'fecha_programada' => 'sometimes|required|date',
            'hora_inicio' => 'sometimes|required',
            'hora_fin' => 'nullable',
            'ubicacion_manual' => 'sometimes|required|string|max:255',
            'estado_ejecucion' => 'nullable|in:Programado,Confirmado,En Camino,En Ejecución,Realizado,Reprogramado,Cancelado',
            'observaciones' => 'nullable|string',
        ]);

        if (array_key_exists('tecnicos_ids', $validated)) {
            $validated['tecnicos_ids'] = !empty($validated['tecnicos_ids'])
                ? array_values(array_unique(array_map('intval', $validated['tecnicos_ids'])))
                : null;
        }

        if (array_key_exists('id_supervisor', $validated)) {
            $validated['id_supervisor'] = !empty($validated['id_supervisor'])
                ? array_values(array_unique(array_map('intval', $validated['id_supervisor'])))
                : null;
        }

        $tecnicosFinales = $this->normalizeIds(array_merge(
            [array_key_exists('id_tecnico_asignado', $validated) ? ($validated['id_tecnico_asignado'] ?? null) : $programacion->id_tecnico_asignado],
            array_key_exists('tecnicos_ids', $validated) ? ($validated['tecnicos_ids'] ?? []) : ((array) ($programacion->tecnicos_ids ?? []))
        ));

        $requiereValidacionConflicto =
            array_key_exists('id_tecnico_asignado', $validated)
            || array_key_exists('tecnicos_ids', $validated)
            || array_key_exists('fecha_programada', $validated)
            || array_key_exists('hora_inicio', $validated)
            || array_key_exists('hora_fin', $validated)
            || array_key_exists('id_supervisor', $validated);

        if ($requiereValidacionConflicto && !empty($tecnicosFinales)) {
            $conflicto = ScheduleConflictService::validarTecnicos(
                $tecnicosFinales,
                (string) ($validated['fecha_programada'] ?? $programacion->fecha_programada),
                $validated['hora_inicio'] ?? $programacion->hora_inicio,
                array_key_exists('hora_fin', $validated) ? ($validated['hora_fin'] ?? null) : $programacion->hora_fin,
                ['programacion_otros' => (int) $programacion->id]
            );

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => $conflicto['mensaje'],
                    'conflicto' => $conflicto,
                ], 422);
            }
        }

        $personalFinal = $this->normalizeIds(
            array_key_exists('id_supervisor', $validated) ? ($validated['id_supervisor'] ?? []) : ((array) ($programacion->id_supervisor ?? []))
        );

        if ($requiereValidacionConflicto && !empty($personalFinal)) {
            $conflicto = ScheduleConflictService::validarPersonal(
                $personalFinal,
                (string) ($validated['fecha_programada'] ?? $programacion->fecha_programada),
                $validated['hora_inicio'] ?? $programacion->hora_inicio,
                array_key_exists('hora_fin', $validated) ? ($validated['hora_fin'] ?? null) : $programacion->hora_fin,
                ['programacion_otros' => (int) $programacion->id]
            );

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => $conflicto['mensaje'],
                    'conflicto' => $conflicto,
                ], 422);
            }
        }

        $programacion->update($validated);
        $programacion->load(['tecnico', 'vehiculo']);

        return response()->json([
            'success' => true,
            'message' => 'Programación de otros actualizada exitosamente',
            'data' => $programacion,
        ]);
    }

    public function destroy($id)
    {
        $programacion = ProgramacionOtro::findOrFail($id);
        $programacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Programación de otros eliminada exitosamente',
        ]);
    }
}
