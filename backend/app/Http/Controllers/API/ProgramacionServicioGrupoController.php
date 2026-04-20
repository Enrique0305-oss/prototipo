<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionServicio;
use App\Models\ProgramacionServicioGrupo;
use App\Models\Tecnico;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramacionServicioGrupoController extends Controller
{
    private const GAP_MAX_MINUTOS = 5;

    public function index(Request $request)
    {
        $query = ProgramacionServicioGrupo::with([
            'cliente',
            'planta',
            'programaciones.ordenServicio.cliente',
            'programaciones.servicio',
            'programaciones.tecnico',
            'programaciones.tecnicos',
            'programaciones.vehiculo',
            'programaciones.planta',
            'programaciones.area',
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
        } elseif ($request->filled('anio')) {
            $query->whereYear('fecha_programada', $request->anio);
        }

        if ($request->filled('id_cliente')) {
            $query->where('id_cliente', $request->id_cliente);
        }

        if ($request->filled('id_cliente_planta')) {
            $query->where('id_cliente_planta', $request->id_cliente_planta);
        }

        if ($request->filled('id_tecnico')) {
            $query->whereJsonContains('tecnicos_ids', (int) $request->id_tecnico);
        }

        $grupos = $query
            ->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get()
            ->map(fn (ProgramacionServicioGrupo $grupo) => $this->serializeGroup($grupo))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $grupos,
        ]);
    }

    public function show(int $id)
    {
        $grupo = ProgramacionServicioGrupo::with([
            'cliente',
            'planta',
            'programaciones.ordenServicio.cliente',
            'programaciones.servicio',
            'programaciones.tecnico',
            'programaciones.tecnicos',
            'programaciones.vehiculo',
            'programaciones.planta',
            'programaciones.area',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->serializeGroup($grupo),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ids_programacion' => 'required|array|min:2',
            'ids_programacion.*' => 'integer|exists:programacion_servicio,id',
            'observaciones' => 'nullable|string',
        ]);

        $ids = collect($validated['ids_programacion'])
            ->map(fn ($id) => (int) $id)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        if (count($ids) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Seleccione al menos 2 servicios para agrupar.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $programaciones = ProgramacionServicio::with(['ordenServicio.cliente', 'servicio', 'tecnico', 'tecnicos', 'planta', 'area'])
                ->whereIn('id', $ids)
                ->lockForUpdate()
                ->get();

            if ($programaciones->count() !== count($ids)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Uno o más servicios ya no existen.',
                ], 422);
            }

            $validacion = $this->validarProgramacionesAgrupables($programaciones);
            if (!$validacion['ok']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $validacion['message'],
                ], 422);
            }

            $programacionesOrdenadas = $programaciones->sortBy(fn (ProgramacionServicio $prog) => $this->horaToMinutes($prog->hora_inicio))->values();
            $horaInicio = $this->formatTime($programacionesOrdenadas->first()->hora_inicio);
            $horaFin = $this->minutesToTime($programacionesOrdenadas->max(fn (ProgramacionServicio $prog) => $this->horaToMinutes($prog->hora_fin ?: $prog->hora_inicio)));
            $clienteId = $this->clienteId($programacionesOrdenadas->first());
            $plantaId = $this->plantaId($programacionesOrdenadas->first());
            $tecnicosIds = $this->tecnicosIds($programacionesOrdenadas->first());

            $grupo = ProgramacionServicioGrupo::create([
                'fecha_programada' => $programacionesOrdenadas->first()->fecha_programada,
                'hora_inicio' => $horaInicio,
                'hora_fin' => $horaFin,
                'id_cliente' => $clienteId,
                'id_cliente_planta' => $plantaId,
                'tecnicos_ids' => $tecnicosIds,
                'cantidad_programaciones' => $programacionesOrdenadas->count(),
                'observaciones' => $validated['observaciones'] ?? null,
                'creado_por' => $request->user()?->id,
                'modificado_por' => $request->user()?->id,
            ]);

            ProgramacionServicio::whereIn('id', $programacionesOrdenadas->pluck('id')->all())
                ->update([
                    'id_grupo_programacion' => $grupo->id,
                    'modificado_por' => $request->user()?->id,
                ]);

            DB::commit();

            $grupo->load([
                'cliente',
                'planta',
                'programaciones.ordenServicio.cliente',
                'programaciones.servicio',
                'programaciones.tecnico',
                'programaciones.tecnicos',
                'programaciones.vehiculo',
                'programaciones.planta',
                'programaciones.area',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Servicios agrupados correctamente.',
                'data' => $this->serializeGroup($grupo),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al agrupar servicios: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $grupo = ProgramacionServicioGrupo::with('programaciones')->findOrFail($id);

        DB::beginTransaction();
        try {
            ProgramacionServicio::where('id_grupo_programacion', $grupo->id)
                ->update([
                    'id_grupo_programacion' => null,
                    'modificado_por' => $request->user()?->id,
                ]);

            $grupo->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Grupo desagregado correctamente.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al desagrupar servicios: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function validarProgramacionesAgrupables($programaciones): array
    {
        $programaciones = $programaciones->values();

        if ($programaciones->count() < 2) {
            return ['ok' => false, 'message' => 'Seleccione al menos 2 servicios para agrupar.'];
        }

        $yaAgrupadas = $programaciones->filter(fn (ProgramacionServicio $prog) => !empty($prog->id_grupo_programacion));
        if ($yaAgrupadas->isNotEmpty()) {
            return ['ok' => false, 'message' => 'Uno o más servicios ya pertenecen a un grupo.'];
        }

        $fechas = $programaciones->map(fn (ProgramacionServicio $prog) => (string) $prog->fecha_programada)->unique();
        if ($fechas->count() !== 1) {
            return ['ok' => false, 'message' => 'Solo se pueden agrupar servicios de la misma fecha.'];
        }

        $clientes = $programaciones->map(fn (ProgramacionServicio $prog) => $this->clienteId($prog))->unique();
        if ($clientes->count() !== 1 || $clientes->first() === null) {
            return ['ok' => false, 'message' => 'Para agrupar, todos deben tener el mismo cliente.'];
        }

        $plantas = $programaciones->map(fn (ProgramacionServicio $prog) => $this->plantaId($prog))->unique();
        if ($plantas->count() !== 1 || $plantas->first() === null) {
            return ['ok' => false, 'message' => 'Para agrupar, todos deben tener la misma planta.'];
        }

        $firmasTecnicos = $programaciones->map(fn (ProgramacionServicio $prog) => $this->firmaTecnicos($prog))->unique();
        if ($firmasTecnicos->count() !== 1 || trim((string) $firmasTecnicos->first()) === '') {
            return ['ok' => false, 'message' => 'Para agrupar, todos deben coincidir en técnicos.'];
        }

        $ordenadas = $programaciones->sortBy(fn (ProgramacionServicio $prog) => $this->horaToMinutes($prog->hora_inicio))->values();
        for ($i = 1; $i < $ordenadas->count(); $i++) {
            $prev = $ordenadas[$i - 1];
            $current = $ordenadas[$i];
            $gap = $this->horaToMinutes($current->hora_inicio) - $this->horaToMinutes($prev->hora_fin ?: $prev->hora_inicio);

            if ($gap < 0 || $gap > self::GAP_MAX_MINUTOS) {
                return ['ok' => false, 'message' => 'Los servicios deben ser consecutivos por hora para poder agruparse.'];
            }
        }

        return ['ok' => true];
    }

    private function clienteId(ProgramacionServicio $prog): ?int
    {
        $id = (int) ($prog->ordenServicio?->cliente?->id ?? 0);
        return $id > 0 ? $id : null;
    }

    private function plantaId(ProgramacionServicio $prog): ?int
    {
        $id = (int) ($prog->id_cliente_planta ?? 0);
        return $id > 0 ? $id : null;
    }

    private function tecnicosIds(ProgramacionServicio $prog): array
    {
        $ids = $prog->tecnicos?->pluck('id')->map(fn ($id) => (int) $id)->all() ?? [];
        if (empty($ids) && !empty($prog->id_tecnico_asignado)) {
            $ids = [(int) $prog->id_tecnico_asignado];
        }

        return collect($ids)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    private function firmaTecnicos(ProgramacionServicio $prog): string
    {
        return implode('-', $this->tecnicosIds($prog));
    }

    private function normalizeTimeInput(mixed $hora): ?string
    {
        if ($hora === null || $hora === '') {
            return null;
        }

        if ($hora instanceof \DateTimeInterface) {
            return $hora->format('H:i:s');
        }

        $texto = trim((string) $hora);
        if ($texto === '') {
            return null;
        }

        if (preg_match('/\b(\d{1,2}:\d{2})(?::\d{2})?\b/', $texto, $matches)) {
            return strlen($matches[1]) === 5 ? $matches[1] . ':00' : $matches[0];
        }

        if (str_contains($texto, 'T')) {
            $texto = explode('T', $texto)[1] ?? $texto;
        } elseif (str_contains($texto, ' ')) {
            $partes = preg_split('/\s+/', $texto);
            $texto = end($partes) ?: $texto;
        }

        try {
            return Carbon::parse($texto)->format('H:i:s');
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function horaToMinutes(mixed $hora): int
    {
        $normalizada = $this->normalizeTimeInput($hora);
        if (empty($normalizada)) {
            return 0;
        }

        [$h, $m] = array_pad(explode(':', substr($normalizada, 0, 5)), 2, 0);
        return ((int) $h) * 60 + ((int) $m);
    }

    private function formatTime(mixed $hora): string
    {
        $normalizada = $this->normalizeTimeInput($hora);
        if (empty($normalizada)) {
            return '00:00:00';
        }

        return $normalizada;
    }

    private function minutesToTime(int $minutes): string
    {
        $hours = intdiv(max($minutes, 0), 60);
        $mins = max($minutes, 0) % 60;
        return sprintf('%02d:%02d:00', $hours, $mins);
    }

    private function serializeGroup(ProgramacionServicioGrupo $grupo): array
    {
        $tecnicosIds = collect($grupo->tecnicos_ids ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter(fn (int $id) => $id > 0)
            ->values()
            ->all();

        $tecnicos = empty($tecnicosIds)
            ? []
            : Tecnico::query()
                ->whereIn('id', $tecnicosIds)
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'apellidos'])
                ->map(fn (Tecnico $tec) => [
                    'id' => $tec->id,
                    'nombre' => $tec->nombre,
                    'apellidos' => $tec->apellidos,
                ])
                ->all();

        $programaciones = $grupo->programaciones
            ->sortBy(fn (ProgramacionServicio $prog) => $this->horaToMinutes($prog->hora_inicio))
            ->values();

        $clienteNombre = $grupo->cliente?->nombre_empresa ?? $grupo->cliente?->persona_contacto ?? '—';
        $plantaNombre = $grupo->planta?->nombre ?? '—';

        return [
            'id' => $grupo->id,
            'fecha_programada' => optional($grupo->fecha_programada)->format('Y-m-d') ?? (string) $grupo->fecha_programada,
            'hora_inicio' => $this->formatTime($grupo->hora_inicio),
            'hora_fin' => $this->formatTime($grupo->hora_fin),
            'id_cliente' => $grupo->id_cliente,
            'cliente' => [
                'id' => $grupo->cliente?->id,
                'nombre_empresa' => $clienteNombre,
                'persona_contacto' => $grupo->cliente?->persona_contacto,
            ],
            'id_cliente_planta' => $grupo->id_cliente_planta,
            'planta' => $grupo->planta ? [
                'id' => $grupo->planta->id,
                'nombre' => $plantaNombre,
                'direccion' => $grupo->planta->direccion,
            ] : null,
            'tecnicos_ids' => $tecnicosIds,
            'tecnicos' => $tecnicos,
            'cantidad_programaciones' => (int) $grupo->cantidad_programaciones,
            'observaciones' => $grupo->observaciones,
            'programaciones' => $programaciones->map(function (ProgramacionServicio $prog) {
                return [
                    'id' => $prog->id,
                    'id_grupo_programacion' => $prog->id_grupo_programacion,
                    'id_orden_servicio' => $prog->id_orden_servicio,
                    'id_servicio' => $prog->id_servicio,
                    'fecha_programada' => optional($prog->fecha_programada)->format('Y-m-d') ?? (string) $prog->fecha_programada,
                    'hora_inicio' => $this->formatTime($prog->hora_inicio),
                    'hora_fin' => $this->formatTime($prog->hora_fin),
                    'estado_ejecucion' => $prog->estado_ejecucion,
                    'id_tecnico_asignado' => $prog->id_tecnico_asignado,
                    'tecnicos' => $prog->tecnicos?->map(fn ($tec) => [
                        'id' => $tec->id,
                        'nombre' => $tec->nombre,
                        'apellidos' => $tec->apellidos,
                        'pivot' => [
                            'rol' => $tec->pivot?->rol,
                        ],
                    ])->values()->all() ?? [],
                    'cliente' => [
                        'id' => $prog->ordenServicio?->cliente?->id,
                        'nombre_empresa' => $prog->ordenServicio?->cliente?->nombre_empresa,
                        'persona_contacto' => $prog->ordenServicio?->cliente?->persona_contacto,
                    ],
                    'servicio' => $prog->servicio ? [
                        'id' => $prog->servicio->id,
                        'nombre' => $prog->servicio->nombre,
                    ] : null,
                    'tecnico' => $prog->tecnico ? [
                        'id' => $prog->tecnico->id,
                        'nombre' => $prog->tecnico->nombre,
                        'apellidos' => $prog->tecnico->apellidos,
                    ] : null,
                    'planta' => $prog->planta ? [
                        'id' => $prog->planta->id,
                        'nombre' => $prog->planta->nombre,
                        'direccion' => $prog->planta->direccion,
                    ] : null,
                    'area' => $prog->area ? [
                        'id' => $prog->area->id,
                        'nombre' => $prog->area->nombre,
                    ] : null,
                ];
            })->all(),
            'created_at' => $grupo->created_at?->toIso8601String(),
            'updated_at' => $grupo->updated_at?->toIso8601String(),
        ];
    }
}