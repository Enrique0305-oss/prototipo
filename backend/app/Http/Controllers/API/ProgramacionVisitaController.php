<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ClientePlanta;
use App\Models\ProgramacionVisita;
use App\Services\ScheduleConflictService;
use Illuminate\Http\Request;

class ProgramacionVisitaController extends Controller
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
        $query = ProgramacionVisita::with(['cliente', 'tecnico', 'vehiculo', 'planta']);

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

        if ($request->filled('id_cliente')) {
            $query->where('id_cliente', $request->id_cliente);
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
        $programacion = ProgramacionVisita::with(['cliente', 'tecnico', 'vehiculo', 'planta'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $programacion,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_cliente' => 'required|integer|exists:cliente,id',
            'tipo_visita' => 'required|string|max:120',
            'id_tecnico_asignado' => 'nullable|integer|exists:tecnicos,id',
            'tecnicos_ids' => 'nullable|array',
            'tecnicos_ids.*' => 'integer|exists:tecnicos,id',
            'id_supervisor' => 'nullable|array',
            'id_supervisor.*' => 'integer|exists:personal,id',
            'id_vehiculo' => 'nullable|integer|exists:vehiculos,id',
            'id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable|array',
            'id_cliente_planta_area.*' => 'integer|exists:cliente_planta_area,id',
            'fecha_programada' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fin' => 'nullable',
            'observaciones' => 'nullable|string',
        ]);

        $idUsuario = $request->user()?->id;
        $planta = null;

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

        if (!empty($validated['id_cliente_planta'])) {
            $planta = ClientePlanta::find($validated['id_cliente_planta']);
        }

        $programacion = ProgramacionVisita::create([
            'id_cliente' => $validated['id_cliente'],
            'tipo_visita' => $validated['tipo_visita'],
            'id_tecnico_asignado' => $validated['id_tecnico_asignado'] ?? null,
            'tecnicos_ids' => !empty($validated['tecnicos_ids']) ? array_values(array_unique(array_map('intval', $validated['tecnicos_ids']))) : null,
            'id_supervisor' => !empty($validated['id_supervisor']) ? array_values(array_unique(array_map('intval', $validated['id_supervisor']))) : null,
            'id_vehiculo' => $validated['id_vehiculo'] ?? null,
            'id_cliente_planta' => $validated['id_cliente_planta'] ?? null,
            'id_cliente_planta_area' => !empty($validated['id_cliente_planta_area']) ? array_values(array_unique(array_map('intval', $validated['id_cliente_planta_area']))) : null,
            'fecha_programada' => $validated['fecha_programada'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin' => $validated['hora_fin'] ?? null,
            'local_sede' => $planta?->nombre,
            'direccion_completa' => $planta?->direccion,
            'estado_ejecucion' => 'Programado',
            'observaciones' => $validated['observaciones'] ?? null,
            'creado_por' => $idUsuario,
        ]);

        $programacion->load(['cliente', 'tecnico', 'vehiculo', 'planta']);

        return response()->json([
            'success' => true,
            'message' => 'Programación de visita creada exitosamente',
            'data' => $programacion,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $programacion = ProgramacionVisita::findOrFail($id);

        $validated = $request->validate([
            'tipo_visita' => 'sometimes|required|string|max:120',
            'id_tecnico_asignado' => 'sometimes|nullable|integer|exists:tecnicos,id',
            'tecnicos_ids' => 'nullable|array',
            'tecnicos_ids.*' => 'integer|exists:tecnicos,id',
            'id_supervisor' => 'nullable|array',
            'id_supervisor.*' => 'integer|exists:personal,id',
            'id_vehiculo' => 'nullable|integer|exists:vehiculos,id',
            'id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable|array',
            'id_cliente_planta_area.*' => 'integer|exists:cliente_planta_area,id',
            'fecha_programada' => 'sometimes|required|date',
            'hora_inicio' => 'sometimes|required',
            'hora_fin' => 'nullable',
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

        if (array_key_exists('id_cliente_planta_area', $validated)) {
            $validated['id_cliente_planta_area'] = !empty($validated['id_cliente_planta_area'])
                ? array_values(array_unique(array_map('intval', $validated['id_cliente_planta_area'])))
                : null;
        }

        if (array_key_exists('id_cliente_planta', $validated)) {
            $planta = !empty($validated['id_cliente_planta'])
                ? ClientePlanta::find($validated['id_cliente_planta'])
                : null;
            $validated['local_sede'] = $planta?->nombre;
            $validated['direccion_completa'] = $planta?->direccion;
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
            || array_key_exists('hora_fin', $validated);

        if ($requiereValidacionConflicto && !empty($tecnicosFinales)) {
            $conflicto = ScheduleConflictService::validarTecnicos(
                $tecnicosFinales,
                (string) ($validated['fecha_programada'] ?? $programacion->fecha_programada),
                $validated['hora_inicio'] ?? $programacion->hora_inicio,
                array_key_exists('hora_fin', $validated) ? ($validated['hora_fin'] ?? null) : $programacion->hora_fin,
                ['programacion_visita' => (int) $programacion->id]
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
        $programacion->load(['cliente', 'tecnico', 'vehiculo', 'planta']);

        return response()->json([
            'success' => true,
            'message' => 'Programación de visita actualizada exitosamente',
            'data' => $programacion,
        ]);
    }

    public function destroy($id)
    {
        $programacion = ProgramacionVisita::findOrFail($id);
        $programacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Programación de visita eliminada exitosamente',
        ]);
    }

    public function iniciar($id)
    {
        $programacion = ProgramacionVisita::findOrFail($id);
        
        if (!$programacion->fecha_inicio_real) {
            $programacion->update([
                'estado_ejecucion' => 'En Ejecución',
                'fecha_inicio_real' => now(),
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Programación de visita iniciada',
            'data' => [
                'started_at' => $programacion->fecha_inicio_real,
            ],
        ]);
    }

    public function completar(Request $request, $id)
    {
        $programacion = ProgramacionVisita::findOrFail($id);

        $validated = $request->validate([
            'observaciones' => 'nullable|string',
            'fecha_inicio_real' => 'nullable|date',
            'fecha_fin_real' => 'nullable|date',
            'duracion_real' => 'nullable|integer',
        ]);

        $fechaFin = $validated['fecha_fin_real'] ?? now();
        $fechaInicio = $validated['fecha_inicio_real'] ?? null;

        if (!$fechaInicio && !empty($validated['duracion_real'])) {
            $fechaInicio = \Carbon\Carbon::parse($fechaFin)->subMinutes($validated['duracion_real']);
        }

        $fotosEvidencia = (is_string($programacion->fotos_evidencia) ? json_decode($programacion->fotos_evidencia, true) : $programacion->fotos_evidencia) ?? [];
        if (!is_array($fotosEvidencia)) $fotosEvidencia = [];
        
        $metadatosFotos = $this->normalizarMetaFotosEvidencia($request->input('fotos_evidencia_meta'));
        $fotosSubidas = $this->guardarFotosEvidencia($request, $programacion, $metadatosFotos);
        
        if (!empty($fotosSubidas)) {
            $fotosEvidencia = array_values(array_merge($fotosEvidencia, $fotosSubidas));
        }

        $programacion->update([
            'estado_ejecucion' => 'Realizado',
            'fecha_inicio_real' => $fechaInicio,
            'fecha_fin_real' => $fechaFin,
            'observaciones' => $validated['observaciones'] ?? $programacion->observaciones,
            'fotos_evidencia' => $fotosEvidencia,
        ]);

        $programacion->load(['cliente', 'tecnico', 'vehiculo', 'planta']);

        return response()->json([
            'success' => true,
            'message' => 'Programación de visita completada exitosamente',
            'data' => $programacion,
        ]);
    }

    private function guardarFotosEvidencia(Request $request, ProgramacionVisita $prog, array $metadatos = []): array
    {
        if (!$request->hasFile('fotos_evidencia')) {
            return [];
        }

        $archivos = $request->file('fotos_evidencia');
        if (!is_array($archivos)) {
            $archivos = [$archivos];
        }

        $rutaBase = "programacion-visita/evidencias/{$prog->id}";
        $rutas = [];

        foreach ($archivos as $indice => $archivo) {
            if (!$archivo || !$archivo->isValid()) {
                continue;
            }

            $extension = strtolower($archivo->getClientOriginalExtension() ?: 'jpg');
            $nombre = now()->format('Ymd_His') . '_' . \Illuminate\Support\Str::uuid()->toString() . '.' . $extension;
            $ruta = $archivo->storeAs($rutaBase, $nombre, 'public');
            $metadato = $metadatos[$indice] ?? [];
            $rutas[] = [
                'path' => $ruta,
                'service_id' => isset($metadato['service_id']) ? (int) $metadato['service_id'] : null,
                'service_title' => isset($metadato['service_title']) ? trim((string) $metadato['service_title']) : null,
                'description' => isset($metadato['description']) ? trim((string) $metadato['description']) : null,
            ];
        }

        return $rutas;
    }

    private function normalizarMetaFotosEvidencia(mixed $value): array
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

        if (!is_array($value)) {
            return [];
        }

        return array_values($value);
    }
}
