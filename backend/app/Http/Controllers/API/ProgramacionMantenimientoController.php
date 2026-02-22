<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionMantenimiento;
use App\Models\Mantenimiento;
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
        $ahora = Carbon::now();

        Mantenimiento::where('estado', 'Pendiente')
            ->where('fecha', '<', $ahora)
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
                'actividad' => $prog->actividad ? [
                    'id' => $prog->actividad->id,
                    'categoria' => $prog->actividad->categoria,
                ] : null,
                'anio' => $prog->anio,
                'frecuencia_meses' => $prog->frecuencia_meses,
                'fecha_inicio' => $prog->fecha_inicio->format('Y-m-d H:i:s'),
                'total_programados' => $prog->total_programados,
                'observaciones' => $prog->observaciones,
                'es_prueba' => (bool) $prog->es_prueba,
                'created_at' => $prog->created_at,
                'realizados' => $realizados,
                'pendientes' => $pendientes,
                'vencidos' => $vencidos,
                'mantenimientos' => $mantenimientos->map(function ($m) use ($ahora, $prog) {
                    $fecha = $m->fecha;
                    $diffMinutos = $ahora->diffInMinutes($fecha, false);

                    // Para modo prueba: alerta si faltan <= 1 minuto
                    // Para modo normal: alerta si faltan <= 3 días
                    $umbralAlerta = $prog->es_prueba ? 1 : (3 * 24 * 60);
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
     * Soporta modo prueba (es_prueba=true) donde frecuencia es en minutos
     */
    public function store(Request $request): JsonResponse
    {
        $esPrueba = $request->boolean('es_prueba', false);

        $rules = [
            'id_equipo' => 'required|integer|exists:equipo,id',
            'id_actmanten' => 'required|integer|exists:actividades_mantenieminto,id',
            'anio' => 'required|integer|min:2024|max:2050',
            'fecha_inicio' => 'required|date',
            'observaciones' => 'nullable|string|max:255',
            'es_prueba' => 'nullable|boolean',
        ];

        if ($esPrueba) {
            $rules['frecuencia_meses'] = 'required|integer|min:1|max:60';
        } else {
            $rules['frecuencia_meses'] = 'required|integer|in:1,2,3,4,6,12';
        }

        $validated = $request->validate($rules, [
            'id_equipo.required' => 'El equipo es obligatorio',
            'id_equipo.exists' => 'El equipo seleccionado no existe',
            'id_actmanten.required' => 'La actividad es obligatoria',
            'id_actmanten.exists' => 'La actividad seleccionada no existe',
            'anio.required' => 'El año es obligatorio',
            'frecuencia_meses.required' => 'La frecuencia es obligatoria',
            'frecuencia_meses.in' => 'La frecuencia debe ser 1, 2, 3, 4, 6 o 12 meses',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria',
        ]);

        // Verificar duplicado (solo en modo normal)
        if (!$esPrueba) {
            $existe = ProgramacionMantenimiento::where('id_equipo', $validated['id_equipo'])
                ->where('id_actmanten', $validated['id_actmanten'])
                ->where('anio', $validated['anio'])
                ->where('es_prueba', false)
                ->exists();

            if ($existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una programación para este equipo, actividad y año.'
                ], 422);
            }
        }

        // Generar fechas de mantenimiento
        $fechaInicio = Carbon::parse($validated['fecha_inicio']);
        $frecuencia = $validated['frecuencia_meses'];

        $fechas = [];
        $currentDate = $fechaInicio->copy();

        if ($esPrueba) {
            // Modo prueba: generar N mantenimientos espaciados por X minutos
            // Máximo 10 para no saturar
            $cantidad = min(intval(request('cantidad', 5)), 10);
            for ($i = 0; $i < $cantidad; $i++) {
                $fechas[] = $currentDate->format('Y-m-d H:i:s');
                $currentDate->addMinutes($frecuencia);
            }
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
            'anio' => $validated['anio'],
            'frecuencia_meses' => $frecuencia,
            'fecha_inicio' => $validated['fecha_inicio'],
            'total_programados' => count($fechas),
            'observaciones' => $validated['observaciones'] ?? null,
            'es_prueba' => $esPrueba,
        ]);

        // Crear los registros de mantenimiento
        $ahora = Carbon::now();
        foreach ($fechas as $fecha) {
            $fechaCarbon = Carbon::parse($fecha);
            $estado = $fechaCarbon->lt($ahora) ? 'Vencido' : 'Pendiente';

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

        $unidad = $esPrueba ? 'minuto(s)' : 'mes(es)';
        return response()->json([
            'success' => true,
            'message' => "Programación creada con {$programacion->total_programados} mantenimientos (cada {$frecuencia} {$unidad}).",
            'data' => $programacion,
        ], 201);
    }

    /**
     * Previsualizar fechas sin crear (para el frontend)
     */
    public function preview(Request $request): JsonResponse
    {
        $esPrueba = $request->boolean('es_prueba', false);

        $validated = $request->validate([
            'anio' => 'required|integer',
            'frecuencia_meses' => 'required|integer|min:1',
            'fecha_inicio' => 'required|date',
            'es_prueba' => 'nullable|boolean',
            'cantidad' => 'nullable|integer|min:1|max:10',
        ]);

        $fechaInicio = Carbon::parse($validated['fecha_inicio']);
        $frecuencia = $validated['frecuencia_meses'];

        $fechas = [];
        $currentDate = $fechaInicio->copy();
        $ahora = Carbon::now();

        if ($esPrueba) {
            $cantidad = min($validated['cantidad'] ?? 5, 10);
            for ($i = 0; $i < $cantidad; $i++) {
                $f = $currentDate->format('Y-m-d H:i:s');
                $fechas[] = [
                    'fecha' => $f,
                    'estado' => $currentDate->lt($ahora) ? 'Vencido' : 'Pendiente',
                    'mes' => $currentDate->format('H:i'),
                ];
                $currentDate->addMinutes($frecuencia);
            }
        } else {
            $finAnio = Carbon::create($validated['anio'], 12, 31, 23, 59, 59);
            while ($currentDate->lte($finAnio)) {
                $f = $currentDate->format('Y-m-d H:i:s');
                $fechas[] = [
                    'fecha' => $f,
                    'estado' => $currentDate->lt($ahora) ? 'Vencido' : 'Pendiente',
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
            ->whereHas('programacion', function ($q) {
                $q->where('es_prueba', false);
            })
            ->orderBy('fecha')
            ->limit(5)
            ->get();

        // Mantenimientos pendientes próximos - modo prueba (dentro de 2 minutos)
        $proximosPrueba = Mantenimiento::with(['equipo', 'programacion'])
            ->where('estado', 'Pendiente')
            ->where('fecha', '>', $ahora)
            ->where('fecha', '<=', $ahora->copy()->addMinutes(2))
            ->whereHas('programacion', function ($q) {
                $q->where('es_prueba', true);
            })
            ->orderBy('fecha')
            ->limit(5)
            ->get();

        $proximos = $proximosNormal->merge($proximosPrueba)->sortBy('fecha');

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
            $diff = (int) round(abs($ahora->diffInMinutes($proximoMasCercano->fecha, false)));
            $esPrueba = $proximoMasCercano->programacion && $proximoMasCercano->programacion->es_prueba;

            if ($esPrueba) {
                $tiempoTexto = $diff <= 1 ? 'en menos de 1 minuto' : "en {$diff} minutos";
            } else {
                $dias = (int) ceil($diff / 1440);
                $tiempoTexto = $dias <= 1 ? 'mañana' : "en {$dias} días";
            }

            $alertas[] = [
                'tipo' => 'proximo',
                'id' => $proximoMasCercano->id,
                'equipo' => $proximoMasCercano->equipo ? $proximoMasCercano->equipo->descripcion : 'Equipo',
                'fecha' => $proximoMasCercano->fecha->format('Y-m-d H:i:s'),
                'tiempo_texto' => $tiempoTexto,
                'es_prueba' => $esPrueba,
            ];
        }

        // Solo el vencido más reciente (1)
        $vencidoMasReciente = $vencidos->first();
        if ($vencidoMasReciente) {
            $diff = (int) round(abs($ahora->diffInMinutes($vencidoMasReciente->fecha)));
            $esPrueba = $vencidoMasReciente->programacion && $vencidoMasReciente->programacion->es_prueba;

            if ($esPrueba) {
                $tiempoTexto = $diff <= 1 ? 'hace menos de 1 min' : "hace {$diff} min";
            } else {
                $dias = (int) ceil($diff / 1440);
                $tiempoTexto = $dias <= 1 ? 'hace 1 día' : "hace {$dias} días";
            }

            $alertas[] = [
                'tipo' => 'vencido',
                'id' => $vencidoMasReciente->id,
                'equipo' => $vencidoMasReciente->equipo ? $vencidoMasReciente->equipo->descripcion : 'Equipo',
                'fecha' => $vencidoMasReciente->fecha->format('Y-m-d H:i:s'),
                'tiempo_texto' => $tiempoTexto,
                'es_prueba' => $esPrueba,
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
