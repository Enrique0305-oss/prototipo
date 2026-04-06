<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionMantenimiento;
use App\Models\Mantenimiento;
use App\Models\ActividadMantenimiento;
use App\Models\Equipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProgramacionMantenimientoController extends Controller
{
    /**
     * Auto-marcar Pendientes vencidos antes de devolver datos
     */
    private function autoVencerMantenimientos(): void
    {
        $hoy = Carbon::today();

        // Marcar como vencidos los mantenimientos cuya fecha pasó
        Mantenimiento::where('estado', 'Pendiente')
            ->whereDate('fecha', '<', $hoy)
            ->update(['estado' => 'Vencido']);
    }

    /**
     * Listar todas las programaciones
     */
    public function index(Request $request): JsonResponse
    {
        // Auto-vencer mantenimientos cuya fecha ya pasó
        $this->autoVencerMantenimientos();

        $query = ProgramacionMantenimiento::with(['equipo', 'actividad', 'mantenimientos']);

        if ($request->has('anio')) {
            $query->where('anio', $request->anio);
        }

        if ($request->has('id_equipo')) {
            $query->where('id_equipo', $request->id_equipo);
        }

        $programaciones = $query->orderBy('created_at', 'desc')->get();

        $data = $programaciones->map(function ($prog) {
            $mantenimientos = $prog->mantenimientos->sortBy('fecha');
            $realizados = $mantenimientos->where('estado', 'Realizado')->count();
            $pendientes = $mantenimientos->where('estado', 'Pendiente')->count();
            $vencidos = $mantenimientos->where('estado', 'Vencido')->count();

            $ahora = Carbon::now();

            return [
                'id' => $prog->id,
                'equipo' => $prog->equipo ? [
                    'id' => $prog->equipo->id,
                    'descripcion' => $prog->equipo->descripcion,
                    'marca' => $prog->equipo->marca,
                    'modelo' => $prog->equipo->modelo,
                ] : null,
                'motivo' => $prog->motivo,
                'actividad' => $prog->actividad ? [
                    'id' => $prog->actividad->id,
                    'categoria' => $prog->actividad->categoria,
                    'motivo' => $prog->actividad->motivo,
                    'tipo_mantenimiento' => $prog->actividad->tipo_mantenimiento,
                    'tipo_equipo' => $prog->actividad->tipo_equipo,
                    'frecuencia_sugerida' => $prog->actividad->frecuencia_sugerida,
                ] : null,
                'anio' => $prog->anio,
                'modo_programacion' => $prog->modo_programacion ?? 'Anual',
                'frecuencia_meses' => $prog->frecuencia_meses,
                'fecha_inicio' => $prog->fecha_inicio->format('Y-m-d H:i:s'),
                'total_programados' => $prog->total_programados,
                'observaciones' => $prog->observaciones,
                'created_at' => $prog->created_at,
                'realizados' => $realizados,
                'pendientes' => $pendientes,
                'vencidos' => $vencidos,
                'mantenimientos' => $mantenimientos->map(function ($m) use ($ahora, $prog) {
                    $fecha = $m->fecha;
                    $fechaComparacion = $fecha->copy()->endOfDay();
                    $diffMinutos = $ahora->diffInMinutes($fechaComparacion, false);

                    // Alerta si faltan <= 3 días
                    $umbralAlerta = 3 * 24 * 60;
                    $proximidad = 'normal';

                    if ($m->estado === 'Pendiente') {
                        if ($diffMinutos <= 0) {
                            $proximidad = 'vencido';
                        } elseif ($diffMinutos <= $umbralAlerta) {
                            $proximidad = 'proximo';
                        }
                    }

                    return [
                        'id' => $m->id,
                        'fecha' => $m->fecha->format('Y-m-d H:i:s'),
                        'estado' => $m->estado,
                        'observaciones' => $m->observaciones,
                        'proximidad' => $proximidad,
                    ];
                })->values(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Ver detalle de una programación
     */
    public function show($id): JsonResponse
    {
        $this->autoVencerMantenimientos();

        $prog = ProgramacionMantenimiento::with(['equipo', 'actividad', 'mantenimientos'])->find($id);

        if (!$prog) {
            return response()->json([
                'success' => false,
                'message' => 'Programación no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $prog,
        ]);
    }

    /**
     * Crear programación anual y generar mantenimientos
     */
    public function store(Request $request): JsonResponse
    {
        $modoProgramacion = $request->input('modo_programacion', 'Anual');

        $rules = [
            'id_equipo' => 'required|integer|exists:equipo,id',
            'motivo' => 'required|string|max:255',
            'tipo_mantenimiento' => 'nullable|in:Preventivo,Correctivo',
            'anio' => 'required|integer|min:2024|max:2050',
            'modo_programacion' => 'nullable|in:Anual,Unica',
            'fecha_inicio' => 'required|date',
            'observaciones' => 'nullable|string|max:255',
            'frecuencia_meses' => 'required|integer|in:0,1,2,3,4,6,12',
        ];

        $validated = $request->validate($rules, [
            'id_equipo.required' => 'El equipo es obligatorio',
            'id_equipo.exists' => 'El equipo seleccionado no existe',
            'motivo.required' => 'El motivo es obligatorio',
            'anio.required' => 'El año es obligatorio',
            'frecuencia_meses.required' => 'La frecuencia es obligatoria',
            'frecuencia_meses.in' => 'La frecuencia debe ser Unica (0), 1, 2, 3, 4, 6 o 12 meses',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria',
        ]);

        $motivoTexto = trim((string) ($validated['motivo'] ?? ''));
        $tipoMantenimiento = $validated['tipo_mantenimiento'] ?? 'Preventivo';

        // Compatibilidad: usar o crear una actividad para mantener la integridad referencial.
        $actividad = ActividadMantenimiento::query()
            ->whereRaw('LOWER(TRIM(motivo)) = ?', [strtolower($motivoTexto)])
            ->where('tipo_mantenimiento', $tipoMantenimiento)
            ->first();

        if (!$actividad) {
            $actividad = ActividadMantenimiento::create([
                'categoria' => 'Programado',
                'motivo' => $motivoTexto,
                'tipo_mantenimiento' => $tipoMantenimiento,
                'tipo_equipo' => 'GENERAL',
                'frecuencia_sugerida' => null,
                'estado' => 'Activo',
            ]);
        }

        $validated['id_actmanten'] = $actividad->id;

        if (($actividad->tipo_mantenimiento ?? null) === 'Correctivo') {
            $modoProgramacion = 'Unica';
            $validated['frecuencia_meses'] = 0;
        }

        if ((($validated['frecuencia_meses'] ?? null) === 0)) {
            $modoProgramacion = 'Unica';
        }

        // Verificar duplicado
        if ($modoProgramacion !== 'Unica') {
            $existe = ProgramacionMantenimiento::where('id_equipo', $validated['id_equipo'])
                ->whereRaw('LOWER(TRIM(motivo)) = ?', [strtolower($motivoTexto)])
                ->where('anio', $validated['anio'])
                ->exists();

            if ($existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una programación para este equipo, motivo y año.'
                ], 422);
            }
        }

        // Generar fechas de mantenimiento
        $fechaInicio = Carbon::parse($validated['fecha_inicio']);
        $frecuencia = $validated['frecuencia_meses'];

        $fechas = [];
        $currentDate = $fechaInicio->copy();

        if ($modoProgramacion === 'Unica' || $frecuencia === 0) {
            $fechas[] = $currentDate->format('Y-m-d H:i:s');
        } else {
            // Modo normal: generar hasta fin de año
            $finAnio = Carbon::create($validated['anio'], 12, 31, 23, 59, 59);
            while ($currentDate->lte($finAnio)) {
                $fechas[] = $currentDate->format('Y-m-d H:i:s');
                $currentDate->addMonths($frecuencia);
            }
        }

        if (empty($fechas)) {
            return response()->json([
                'success' => false,
                'message' => 'No se generaron fechas con los parámetros proporcionados.'
            ], 422);
        }

        // Crear la programación
        $programacion = ProgramacionMantenimiento::create([
            'id_equipo' => $validated['id_equipo'],
            'id_actmanten' => $validated['id_actmanten'],
            'motivo' => $motivoTexto,
            'anio' => $validated['anio'],
            'modo_programacion' => $modoProgramacion,
            'frecuencia_meses' => $frecuencia,
            'fecha_inicio' => $validated['fecha_inicio'],
            'total_programados' => count($fechas),
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        // Crear los registros de mantenimiento
        $ahora = Carbon::now();
        foreach ($fechas as $fecha) {
            $fechaCarbon = Carbon::parse($fecha);
            $fechaComparacion = $fechaCarbon->copy()->endOfDay();
            $estado = $fechaComparacion->lt($ahora) ? 'Vencido' : 'Pendiente';

            Mantenimiento::create([
                'id_programacion' => $programacion->id,
                'id_equipo' => $validated['id_equipo'],
                'id_actmanten' => $validated['id_actmanten'],
                'fecha' => $fecha,
                'observaciones' => '',
                'estado' => $estado,
            ]);
        }

        $programacion->load(['equipo', 'actividad', 'mantenimientos']);

        $unidad = ($frecuencia === 0 || $modoProgramacion === 'Unica') ? 'evento unico' : 'mes(es)';
        return response()->json([
            'success' => true,
            'message' => "Programación creada con {$programacion->total_programados} mantenimientos ({$unidad}).",
            'data' => $programacion,
        ], 201);
    }

    /**
     * Previsualizar fechas sin crear (para el frontend)
     */
    public function preview(Request $request): JsonResponse
    {
        $modoProgramacion = $request->input('modo_programacion', 'Anual');

        $validated = $request->validate([
            'anio' => 'required|integer',
            'frecuencia_meses' => 'required|integer|min:0',
            'fecha_inicio' => 'required|date',
            'modo_programacion' => 'nullable|in:Anual,Unica',
        ]);

        $fechaInicio = Carbon::parse($validated['fecha_inicio']);
        $frecuencia = $validated['frecuencia_meses'];

        $fechas = [];
        $currentDate = $fechaInicio->copy();
        $ahora = Carbon::now();

        if ($modoProgramacion === 'Unica' || $frecuencia === 0) {
            $f = $currentDate->format('Y-m-d H:i:s');
            $fechaComparacion = $currentDate->copy()->endOfDay();
            $fechas[] = [
                'fecha' => $f,
                'estado' => $fechaComparacion->lt($ahora) ? 'Vencido' : 'Pendiente',
                'mes' => 'Unica',
            ];
        } else {
            $finAnio = Carbon::create($validated['anio'], 12, 31, 23, 59, 59);
            while ($currentDate->lte($finAnio)) {
                $f = $currentDate->format('Y-m-d H:i:s');
                $fechaComparacion = $currentDate->copy()->endOfDay();
                $fechas[] = [
                    'fecha' => $f,
                    'estado' => $fechaComparacion->lt($ahora) ? 'Vencido' : 'Pendiente',
                    'mes' => ucfirst($currentDate->locale('es')->translatedFormat('F')),
                ];
                $currentDate->addMonths($frecuencia);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $fechas,
            'total' => count($fechas),
        ]);
    }

    /**
     * Eliminar una programación y sus mantenimientos asociados
     */
    public function destroy($id): JsonResponse
    {
        $prog = ProgramacionMantenimiento::find($id);

        if (!$prog) {
            return response()->json([
                'success' => false,
                'message' => 'Programación no encontrada'
            ], 404);
        }

        $prog->delete();

        return response()->json([
            'success' => true,
            'message' => 'Programación y mantenimientos asociados eliminados correctamente.'
        ]);
    }

    /**
     * Marcar un mantenimiento individual como Realizado
     */
    public function marcarRealizado(Request $request, $id): JsonResponse
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        $observaciones = $request->input('observaciones', $mantenimiento->observaciones);

        $mantenimiento->update([
            'estado' => 'Realizado',
            'observaciones' => $observaciones,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento marcado como realizado.',
            'data' => $mantenimiento,
        ]);
    }

    /**
     * Alertas de mantenimientos próximos/vencidos para el Dashboard
     */
    public function alertas(): JsonResponse
    {
        $this->autoVencerMantenimientos();

        $ahora = Carbon::now();

        // Mantenimientos pendientes próximos (dentro de 7 días) - modo normal
        $proximosNormal = Mantenimiento::with(['equipo', 'programacion'])
            ->where('estado', 'Pendiente')
            ->where('fecha', '>', $ahora)
            ->where('fecha', '<=', $ahora->copy()->addDays(7))
            ->orderBy('fecha')
            ->limit(5)
            ->get();

        $proximos = $proximosNormal->sortBy('fecha');

        // Mantenimientos vencidos no realizados (solo contar + el más reciente)
        $totalVencidosCount = Mantenimiento::where('estado', 'Vencido')->count();
        $vencidos = Mantenimiento::with(['equipo', 'programacion'])
            ->where('estado', 'Vencido')
            ->orderBy('fecha', 'desc')
            ->limit(1)
            ->get();

        // Totales reales para el resumen
        $totalProximos = $proximos->count();
        $totalVencidos = $totalVencidosCount;

        $alertas = [];

        // Solo el próximo más cercano (1)
        $proximoMasCercano = $proximos->first();
        if ($proximoMasCercano) {
            $diff = (int) ceil($proximoMasCercano->fecha->copy()->startOfDay()->diffInDays($ahora));
            $tiempoTexto = $diff <= 0 ? 'hoy' : ($diff === 1 ? 'mañana' : "en {$diff} días");

            $alertas[] = [
                'tipo' => 'proximo',
                'id' => $proximoMasCercano->id,
                'equipo' => $proximoMasCercano->equipo ? $proximoMasCercano->equipo->descripcion : 'Equipo',
                'fecha' => $proximoMasCercano->fecha->format('Y-m-d H:i:s'),
                'tiempo_texto' => $tiempoTexto,
            ];
        }

        // Solo el vencido más reciente (1)
        $vencidoMasReciente = $vencidos->first();
        if ($vencidoMasReciente) {
            $diff = (int) ceil($ahora->copy()->startOfDay()->diffInDays($vencidoMasReciente->fecha));
            $tiempoTexto = $diff <= 0 ? 'hoy' : ($diff === 1 ? 'ayer' : "hace {$diff} días");

            $alertas[] = [
                'tipo' => 'vencido',
                'id' => $vencidoMasReciente->id,
                'equipo' => $vencidoMasReciente->equipo ? $vencidoMasReciente->equipo->descripcion : 'Equipo',
                'fecha' => $vencidoMasReciente->fecha->format('Y-m-d H:i:s'),
                'tiempo_texto' => $tiempoTexto,
            ];
        }

        return response()->json([
            'success' => true,
            'proximos' => $totalProximos,
            'vencidos' => $totalVencidos,
            'total_alertas' => $totalProximos + $totalVencidos,
            'alertas' => $alertas,
        ]);
    }
}
