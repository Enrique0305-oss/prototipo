<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MantenimientoVehiculo;
use App\Models\ProgramacionMantenimientoVehiculo;
use App\Models\Vehiculo;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MantenimientoVehiculoController extends Controller
{
    private function baseQuery(Request $request)
    {
        $query = MantenimientoVehiculo::with(['vehiculo', 'programacion']);

        if ($request->filled('id_vehiculo')) {
            $query->where('id_vehiculo', $request->integer('id_vehiculo'));
        }

        if ($request->filled('estado') && $request->estado !== 'todos') {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_programada', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_programada', '<=', $request->fecha_hasta);
        }

        if ($request->filled('mes')) {
            $query->whereMonth('fecha_programada', $request->integer('mes'));
        }

        if ($request->filled('anio')) {
            $query->whereYear('fecha_programada', $request->integer('anio'));
        }

        if ($request->filled('buscar')) {
            $buscar = trim((string) $request->buscar);
            $query->where(function ($subQuery) use ($buscar) {
                $subQuery->where('motivo', 'like', "%{$buscar}%")
                    ->orWhere('observaciones', 'like', "%{$buscar}%")
                    ->orWhereHas('vehiculo', function ($vehiculoQuery) use ($buscar) {
                        $vehiculoQuery->where('placa', 'like', "%{$buscar}%")
                            ->orWhere('marca', 'like', "%{$buscar}%")
                            ->orWhere('modelo', 'like', "%{$buscar}%");
                    });
            });
        }

        $orden = $request->get('orden', 'recientes');
        $query->orderBy('fecha_programada', $orden === 'antiguos' ? 'asc' : 'desc');

        return $query;
    }

    private function transform(MantenimientoVehiculo $mantenimiento): array
    {
        return [
            'id' => $mantenimiento->id,
            'id_programacion' => $mantenimiento->id_programacion,
            'id_vehiculo' => $mantenimiento->id_vehiculo,
            'motivo' => $mantenimiento->motivo,
            'tipo_mantenimiento' => $mantenimiento->tipo_mantenimiento,
            'fecha_programada' => $mantenimiento->fecha_programada?->format('Y-m-d H:i:s'),
            'fecha_realizado' => $mantenimiento->fecha_realizado?->format('Y-m-d H:i:s'),
            'kilometraje' => $mantenimiento->kilometraje,
            'observaciones' => $mantenimiento->observaciones,
            'estado' => $mantenimiento->estado,
            'vehiculo' => $mantenimiento->vehiculo ? [
                'id_vehiculo' => $mantenimiento->vehiculo->id,
                'placa' => $mantenimiento->vehiculo->placa,
                'marca' => $mantenimiento->vehiculo->marca,
                'modelo' => $mantenimiento->vehiculo->modelo,
                'anio' => $mantenimiento->vehiculo->anio,
                'estado' => $mantenimiento->vehiculo->estado,
            ] : null,
            'programacion' => $mantenimiento->programacion ? [
                'id' => $mantenimiento->programacion->id,
                'anio' => $mantenimiento->programacion->anio,
                'frecuencia_meses' => $mantenimiento->programacion->frecuencia_meses,
                'fecha_inicio' => $mantenimiento->programacion->fecha_inicio?->format('Y-m-d'),
                'total_programados' => $mantenimiento->programacion->total_programados,
            ] : null,
            'created_at' => $mantenimiento->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $mantenimiento->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $mantenimientos = $this->baseQuery($request)->get();

        return response()->json([
            'success' => true,
            'data' => $mantenimientos->map(fn ($mantenimiento) => $this->transform($mantenimiento)),
            'total' => $mantenimientos->count(),
        ]);
    }

    public function show($id): JsonResponse
    {
        $mantenimiento = MantenimientoVehiculo::with(['vehiculo', 'programacion'])->find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento de vehículo no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->transform($mantenimiento),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_vehiculo' => 'required|integer|exists:vehiculos,id',
            'motivo' => 'required|string|max:255',
            'tipo_mantenimiento' => 'required|in:Preventivo,Correctivo,Limpieza',
            'fecha_programada' => 'required|date',
            'frecuencia_meses' => 'nullable|integer|min:1|max:60',
            'kilometraje' => 'nullable|integer|min:0',
            'observaciones' => 'nullable|string|max:255',
        ], [
            'id_vehiculo.required' => 'El vehículo es obligatorio',
            'id_vehiculo.exists' => 'El vehículo seleccionado no existe',
            'motivo.required' => 'El motivo es obligatorio',
            'tipo_mantenimiento.required' => 'El tipo de mantenimiento es obligatorio',
            'fecha_programada.required' => 'La fecha programada es obligatoria',
        ]);

        $vehiculo = Vehiculo::findOrFail($validated['id_vehiculo']);
        $fechaProgramada = Carbon::parse($validated['fecha_programada']);
        $frecuenciaMeses = $validated['tipo_mantenimiento'] === 'Limpieza'
            ? (int) ($validated['frecuencia_meses'] ?? 6)
            : 0;

        $mantenimiento = DB::transaction(function () use ($validated, $fechaProgramada, $frecuenciaMeses) {
            $programacion = ProgramacionMantenimientoVehiculo::create([
                'id_vehiculo' => $validated['id_vehiculo'],
                'motivo' => $validated['motivo'],
                'anio' => (int) $fechaProgramada->year,
                'frecuencia_meses' => $frecuenciaMeses,
                'fecha_inicio' => $fechaProgramada->toDateString(),
                'total_programados' => 1,
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            return MantenimientoVehiculo::create([
                'id_programacion' => $programacion->id,
                'id_vehiculo' => $validated['id_vehiculo'],
                'motivo' => $validated['motivo'],
                'tipo_mantenimiento' => $validated['tipo_mantenimiento'],
                'fecha_programada' => $fechaProgramada->toDateTimeString(),
                'fecha_realizado' => null,
                'kilometraje' => $validated['kilometraje'] ?? null,
                'observaciones' => $validated['observaciones'] ?? null,
                'estado' => $fechaProgramada->isPast() ? 'Vencido' : 'Programado',
            ]);
        });

        $mantenimiento->load(['vehiculo', 'programacion']);

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento de vehículo registrado exitosamente',
            'data' => $this->transform($mantenimiento),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $mantenimiento = MantenimientoVehiculo::with('programacion')->find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento de vehículo no encontrado',
            ], 404);
        }

        $validated = $request->validate([
            'id_vehiculo' => 'sometimes|integer|exists:vehiculos,id',
            'motivo' => 'sometimes|string|max:255',
            'tipo_mantenimiento' => 'sometimes|in:Preventivo,Correctivo,Limpieza',
            'fecha_programada' => 'sometimes|date',
            'frecuencia_meses' => 'sometimes|nullable|integer|min:1|max:60',
            'kilometraje' => 'sometimes|nullable|integer|min:0',
            'observaciones' => 'sometimes|nullable|string|max:255',
            'estado' => 'sometimes|in:Programado,Realizado,Vencido,Cancelado',
        ]);

        if ($request->has('id_vehiculo')) {
            $mantenimiento->id_vehiculo = $validated['id_vehiculo'];
        }

        if ($request->has('motivo')) {
            $mantenimiento->motivo = $validated['motivo'];
        }

        if ($request->has('tipo_mantenimiento')) {
            $mantenimiento->tipo_mantenimiento = $validated['tipo_mantenimiento'];
        }

        $tipoMantenimientoActual = $request->has('tipo_mantenimiento')
            ? $validated['tipo_mantenimiento']
            : $mantenimiento->tipo_mantenimiento;

        if ($mantenimiento->programacion) {
            if ($tipoMantenimientoActual === 'Limpieza') {
                if ($request->has('frecuencia_meses')) {
                    $mantenimiento->programacion->frecuencia_meses = (int) $validated['frecuencia_meses'];
                } elseif ((int) $mantenimiento->programacion->frecuencia_meses <= 0) {
                    $mantenimiento->programacion->frecuencia_meses = 6;
                }
            } elseif ($request->has('tipo_mantenimiento') || $request->has('frecuencia_meses')) {
                $mantenimiento->programacion->frecuencia_meses = 0;
            }
        }

        if ($request->has('fecha_programada')) {
            $mantenimiento->fecha_programada = Carbon::parse($validated['fecha_programada']);
            if ($mantenimiento->programacion) {
                $mantenimiento->programacion->anio = (int) Carbon::parse($validated['fecha_programada'])->year;
                $mantenimiento->programacion->fecha_inicio = Carbon::parse($validated['fecha_programada'])->toDateString();
                $mantenimiento->programacion->save();
            }
        }

        if ($request->has('kilometraje')) {
            $mantenimiento->kilometraje = $validated['kilometraje'];
        }

        if ($request->has('observaciones')) {
            $mantenimiento->observaciones = $validated['observaciones'];
            if ($mantenimiento->programacion) {
                $mantenimiento->programacion->observaciones = $validated['observaciones'];
                $mantenimiento->programacion->save();
            }
        } elseif ($mantenimiento->programacion && ($request->has('tipo_mantenimiento') || $request->has('frecuencia_meses'))) {
            $mantenimiento->programacion->save();
        }

        if ($request->has('estado')) {
            $mantenimiento->estado = $validated['estado'];
        }

        $mantenimiento->save();
        $mantenimiento->load(['vehiculo', 'programacion']);

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento de vehículo actualizado exitosamente',
            'data' => $this->transform($mantenimiento),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $mantenimiento = MantenimientoVehiculo::find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento de vehículo no encontrado',
            ], 404);
        }

        DB::transaction(function () use ($mantenimiento) {
            $idProgramacion = $mantenimiento->id_programacion;
            $mantenimiento->delete();

            if ($idProgramacion) {
                ProgramacionMantenimientoVehiculo::where('id', $idProgramacion)->delete();
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento de vehículo eliminado exitosamente',
        ]);
    }

    public function marcarRealizado(Request $request, $id): JsonResponse
    {
        $mantenimiento = MantenimientoVehiculo::with('vehiculo')->find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento de vehículo no encontrado',
            ], 404);
        }

        $validated = $request->validate([
            'observaciones' => 'nullable|string|max:255',
        ]);

        $mantenimiento->estado = 'Realizado';
        $mantenimiento->fecha_realizado = Carbon::now();
        if ($request->has('observaciones')) {
            $mantenimiento->observaciones = $validated['observaciones'];
        }
        $mantenimiento->save();
        $mantenimiento->load(['vehiculo', 'programacion']);

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento marcado como realizado',
            'data' => $this->transform($mantenimiento),
        ]);
    }

    public function estadisticas(): JsonResponse
    {
        $total = MantenimientoVehiculo::count();
        $programados = MantenimientoVehiculo::where('estado', 'Programado')->count();
        $realizados = MantenimientoVehiculo::where('estado', 'Realizado')->count();
        $vencidos = MantenimientoVehiculo::where('estado', 'Vencido')->count();

        $ultimo = MantenimientoVehiculo::with('vehiculo')->orderBy('fecha_programada', 'desc')->first();
        $proximos = MantenimientoVehiculo::with('vehiculo')
            ->where('estado', 'Programado')
            ->whereDate('fecha_programada', '>=', now()->toDateString())
            ->orderBy('fecha_programada')
            ->limit(5)
            ->get();

        $porVehiculo = MantenimientoVehiculo::selectRaw('id_vehiculo, COUNT(*) as total')
            ->groupBy('id_vehiculo')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $vehiculo = Vehiculo::find($item->id_vehiculo);
                return [
                    'vehiculo' => $vehiculo ? ($vehiculo->placa . ' - ' . $vehiculo->marca . ' ' . $vehiculo->modelo) : 'N/A',
                    'total' => $item->total,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'programados' => $programados,
                'realizados' => $realizados,
                'vencidos' => $vencidos,
                'ultimo_mantenimiento' => $ultimo ? $this->transform($ultimo) : null,
                'proximos_programados' => $proximos->map(fn ($mantenimiento) => $this->transform($mantenimiento)),
                'por_vehiculo' => $porVehiculo,
            ],
        ]);
    }

    public function calendario(Request $request): JsonResponse
    {
        $anio = $request->integer('anio', now()->year);
        $mes = $request->integer('mes', now()->month);
        $inicio = Carbon::create($anio, $mes, 1)->startOfDay();
        $fin = Carbon::create($anio, $mes, 1)->endOfMonth()->endOfDay();

        $mantenimientos = $this->baseQuery($request)
            ->whereBetween('fecha_programada', [$inicio, $fin])
            ->get();

        $diasAgrupados = $mantenimientos->groupBy(function (MantenimientoVehiculo $mantenimiento) {
            return Carbon::parse($mantenimiento->fecha_programada)->day;
        });

        $totalDias = Carbon::create($anio, $mes, 1)->daysInMonth;

        $dias = collect(range(1, $totalDias))->map(function (int $dia) use ($anio, $mes, $diasAgrupados) {
            $items = $diasAgrupados->get($dia, collect())->values();

            return [
                'dia' => $dia,
                'fecha' => Carbon::create($anio, $mes, $dia)->toDateString(),
                'total' => $items->count(),
                'programados' => $items->where('estado', 'Programado')->count(),
                'realizados' => $items->where('estado', 'Realizado')->count(),
                'vencidos' => $items->where('estado', 'Vencido')->count(),
                'cancelados' => $items->where('estado', 'Cancelado')->count(),
                'items' => $items->map(fn ($mantenimiento) => $this->transform($mantenimiento)),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'anio' => $anio,
                'mes' => $mes,
                'total_dias' => $totalDias,
                'resumen' => [
                    'total' => $mantenimientos->count(),
                    'programados' => $mantenimientos->where('estado', 'Programado')->count(),
                    'realizados' => $mantenimientos->where('estado', 'Realizado')->count(),
                    'vencidos' => $mantenimientos->where('estado', 'Vencido')->count(),
                    'cancelados' => $mantenimientos->where('estado', 'Cancelado')->count(),
                ],
                'dias' => $dias,
            ],
        ]);
    }

    public function historialVehiculo($idVehiculo): JsonResponse
    {
        $vehiculo = Vehiculo::find($idVehiculo);

        if (!$vehiculo) {
            return response()->json([
                'success' => false,
                'message' => 'Vehículo no encontrado',
            ], 404);
        }

        $mantenimientos = MantenimientoVehiculo::with(['vehiculo', 'programacion'])
            ->where('id_vehiculo', $idVehiculo)
            ->where('estado', 'Realizado')
            ->orderBy('fecha_programada', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'vehiculo' => [
                'id_vehiculo' => $vehiculo->id,
                'placa' => $vehiculo->placa,
                'marca' => $vehiculo->marca,
                'modelo' => $vehiculo->modelo,
            ],
            'data' => $mantenimientos->map(fn ($mantenimiento) => $this->transform($mantenimiento)),
            'total' => $mantenimientos->count(),
        ]);
    }
}
