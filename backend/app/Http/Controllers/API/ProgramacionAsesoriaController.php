<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenAsesoria;
use App\Models\ProgramacionAsesoria;
use App\Services\ScheduleConflictService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramacionAsesoriaController extends Controller
{
    private function normalizarFrecuenciaVisita($frecuenciaVisita): array
    {
        if (empty($frecuenciaVisita)) {
            return [];
        }

        if (is_string($frecuenciaVisita)) {
            $decoded = json_decode($frecuenciaVisita, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
            return [];
        }

        return is_array($frecuenciaVisita) ? $frecuenciaVisita : [];
    }

    private function normalizarDiasPorMes($diasPorMes): array
    {
        if (empty($diasPorMes)) {
            return [];
        }

        if (is_string($diasPorMes)) {
            $decoded = json_decode($diasPorMes, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $diasPorMes = $decoded;
            } else {
                return [];
            }
        }

        if (!is_array($diasPorMes)) {
            return [];
        }

        $salida = [];
        foreach ($diasPorMes as $mes => $config) {
            $mesNum = (int) preg_replace('/\D+/', '', (string) $mes);
            if ($mesNum <= 0 || !is_array($config)) {
                continue;
            }

            $salida[$mesNum] = [
                'presencial' => array_values(array_filter(array_map('intval', $config['presencial'] ?? []), fn ($n) => $n >= 0 && $n <= 6)),
                'virtual' => array_values(array_filter(array_map('intval', $config['virtual'] ?? []), fn ($n) => $n >= 0 && $n <= 6)),
            ];
        }

        ksort($salida);
        return $salida;
    }

    private function multiplicadorFrecuencia(?string $frecuencia): int
    {
        $freq = mb_strtolower(trim((string) $frecuencia), 'UTF-8');

        return match (true) {
            str_contains($freq, 'seman') => 4,
            str_contains($freq, 'quincen') => 2,
            str_contains($freq, '1 vez') => 1,
            str_contains($freq, 'una vez') => 1,
            str_contains($freq, 'mensual') => 1,
            default => 1,
        };
    }

    private function fechasPorDiasEntre(Carbon $inicio, Carbon $fin, array $diasSemana): array
    {
        $diasSemana = array_values(array_unique(array_map('intval', $diasSemana)));
        if (empty($diasSemana)) {
            return [];
        }

        $fechas = [];
        $cursor = $inicio->copy();
        while ($cursor->lte($fin)) {
            if (in_array((int) $cursor->dayOfWeek, $diasSemana, true)) {
                $fechas[] = $cursor->format('Y-m-d');
            }
            $cursor->addDay();
        }

        return $fechas;
    }

    private function tomarPrimerasFechas(array $candidatas, int $cantidad): array
    {
        if ($cantidad <= 0 || empty($candidatas)) {
            return [];
        }

        return array_slice($candidatas, 0, $cantidad);
    }

    private function construirFechasProgramacionAsesoria(Carbon $fechaInicio, int $mesesImplementacion, array $frecuenciaVisita, array $diasPorMes): array
    {
        $fechas = [];
        $fechaFinGlobal = $fechaInicio->copy()->addMonthsNoOverflow($mesesImplementacion);

        for ($mes = 1; $mes <= $mesesImplementacion; $mes++) {
            $frecuenciaMes = $frecuenciaVisita[$mes - 1]
                ?? $frecuenciaVisita[$mes]
                ?? $frecuenciaVisita['m' . $mes]
                ?? $frecuenciaVisita['mes_' . $mes]
                ?? $frecuenciaVisita['Mes ' . $mes]
                ?? $frecuenciaVisita['mes ' . $mes]
                ?? null;
            if (!$frecuenciaMes || !is_array($frecuenciaMes)) {
                continue;
            }

            if ($mes === 1) {
                $inicioMes = $fechaInicio->copy();
                $finMes = $mes === $mesesImplementacion
                    ? $fechaFinGlobal->copy()
                    : $fechaInicio->copy()->endOfMonth();
            } else {
                $inicioMes = $fechaInicio->copy()->addMonthsNoOverflow($mes - 1)->startOfMonth();
                $finMes = $mes === $mesesImplementacion
                    ? $fechaFinGlobal->copy()
                    : $inicioMes->copy()->endOfMonth();
            }

            $diasMes = $diasPorMes[$mes] ?? ['presencial' => [], 'virtual' => []];
                    $presencialBase = count($diasMes['presencial'] ?? []);
                    $virtualBase = count($diasMes['virtual'] ?? []);
                    $multiplicador = $this->multiplicadorFrecuencia((string) ($frecuenciaMes['f'] ?? $frecuenciaMes['frecuencia'] ?? ''));

                    $totalPresencial = $presencialBase * $multiplicador;
                    $totalVirtual = $virtualBase * $multiplicador;

            $candidatasPresencial = $this->fechasPorDiasEntre($inicioMes, $finMes, $diasMes['presencial'] ?? []);
            $candidatasVirtual = $this->fechasPorDiasEntre($inicioMes, $finMes, $diasMes['virtual'] ?? []);

            if ($totalPresencial > 0 && empty($candidatasPresencial)) {
                throw new \RuntimeException("No hay días presenciales seleccionados para el mes {$mes}.");
            }

            if ($totalVirtual > 0 && empty($candidatasVirtual)) {
                throw new \RuntimeException("No hay días virtuales seleccionados para el mes {$mes}.");
            }

            foreach ($this->tomarPrimerasFechas($candidatasPresencial, $totalPresencial) as $fecha) {
                $fechas[] = ['fecha' => $fecha, 'tipo' => 'presencial', 'mes' => $mes];
            }

            foreach ($this->tomarPrimerasFechas($candidatasVirtual, $totalVirtual) as $fecha) {
                $fechas[] = ['fecha' => $fecha, 'tipo' => 'virtual', 'mes' => $mes];
            }
        }

        usort($fechas, function ($a, $b) {
            $cmp = strcmp($a['fecha'], $b['fecha']);
            if ($cmp !== 0) {
                return $cmp;
            }
            return strcmp($a['tipo'], $b['tipo']);
        });

        return $fechas;
    }

    private function construirRangosPorMes(Carbon $fechaInicio, int $mesesImplementacion): array
    {
        $rangos = [];
        $fechaFinGlobal = $fechaInicio->copy()->addMonthsNoOverflow($mesesImplementacion);

        for ($mes = 1; $mes <= $mesesImplementacion; $mes++) {
            if ($mes === 1) {
                $inicioMes = $fechaInicio->copy();
                $finMes = $mes === $mesesImplementacion
                    ? $fechaFinGlobal->copy()
                    : $fechaInicio->copy()->endOfMonth();
            } else {
                $inicioMes = $fechaInicio->copy()->addMonthsNoOverflow($mes - 1)->startOfMonth();
                $finMes = $mes === $mesesImplementacion
                    ? $fechaFinGlobal->copy()
                    : $inicioMes->copy()->endOfMonth();
            }

            $rangos[$mes] = ['inicio' => $inicioMes, 'fin' => $finMes];
        }

        return ['rangos' => $rangos, 'fecha_fin_global' => $fechaFinGlobal];
    }

    private function calcularDiasYResumenPorMes($programaciones, Carbon $fechaInicio, int $mesesImplementacion, array $frecuenciaVisita): array
    {
        if ($mesesImplementacion <= 0) {
            return [
                'dias_por_mes' => [],
                'resumen_por_mes' => [],
                'fecha_fin_programacion' => null,
            ];
        }

        $estructura = $this->construirRangosPorMes($fechaInicio, $mesesImplementacion);
        $rangos = $estructura['rangos'];
        $fechaFinGlobal = $estructura['fecha_fin_global'];

        $diasPorMes = [];
        $resumenPorMes = [];

        for ($mes = 1; $mes <= $mesesImplementacion; $mes++) {
            $freqMes = $frecuenciaVisita[$mes - 1]
                ?? $frecuenciaVisita[$mes]
                ?? $frecuenciaVisita['m' . $mes]
                ?? $frecuenciaVisita['mes_' . $mes]
                ?? $frecuenciaVisita['Mes ' . $mes]
                ?? $frecuenciaVisita['mes ' . $mes]
                ?? [];

            $resumenPorMes[] = [
                'mes' => $mes,
                'presencial' => 0,
                'virtual' => 0,
                'frecuencia' => (string) ($freqMes['f'] ?? $freqMes['frecuencia'] ?? '-'),
            ];

            $diasPorMes[$mes] = [
                'presencial' => [],
                'virtual' => [],
            ];
        }

        foreach ($programaciones as $prog) {
            $fecha = Carbon::parse($prog->fecha_programada)->startOfDay();
            $mesEncontrado = null;

            foreach ($rangos as $mes => $rango) {
                if ($fecha->betweenIncluded($rango['inicio'], $rango['fin'])) {
                    $mesEncontrado = $mes;
                    break;
                }
            }

            if (!$mesEncontrado) {
                continue;
            }

            $tipo = mb_strtolower(trim((string) ($prog->modalidad_visita ?? '')), 'UTF-8');
            $dow = (int) $fecha->dayOfWeek;

            if (str_starts_with($tipo, 'pres')) {
                if (!in_array($dow, $diasPorMes[$mesEncontrado]['presencial'], true)) {
                    $diasPorMes[$mesEncontrado]['presencial'][] = $dow;
                }
                $resumenPorMes[$mesEncontrado - 1]['presencial']++;
            } elseif (str_starts_with($tipo, 'vir')) {
                if (!in_array($dow, $diasPorMes[$mesEncontrado]['virtual'], true)) {
                    $diasPorMes[$mesEncontrado]['virtual'][] = $dow;
                }
                $resumenPorMes[$mesEncontrado - 1]['virtual']++;
            }
        }

        foreach ($diasPorMes as $mes => $dias) {
            sort($diasPorMes[$mes]['presencial']);
            sort($diasPorMes[$mes]['virtual']);
        }

        return [
            'dias_por_mes' => $diasPorMes,
            'resumen_por_mes' => $resumenPorMes,
            'fecha_fin_programacion' => $fechaFinGlobal->format('Y-m-d'),
        ];
    }

    public function index(Request $request)
    {
        $query = ProgramacionAsesoria::with([
            'ordenAsesoria.cliente',
            'ordenAsesoria.servicio',
            'ordenAsesoria.exponentes',
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
        $programacion = ProgramacionAsesoria::with([
            'ordenAsesoria.cliente',
            'ordenAsesoria.servicio',
            'ordenAsesoria.cotizacion.detalles.catalogoCapAud',
            'ordenAsesoria.cotizacion.detalles.servicio',
            'ordenAsesoria.exponentes',
            'exponentes',
            'supervisor',
            'vehiculo',
            'planta',
            'area',
        ])->findOrFail($id);

        // Calcular asesoria_nombre y plan de implementación
        $detalle = $programacion->ordenAsesoria?->cotizacion?->detalles?->first(function ($d) {
            return !is_null($d->meses_implementacion) || !empty($d->frecuencia_visita);
        }) ?? $programacion->ordenAsesoria?->cotizacion?->detalles?->first();

        $asesoria_nombre = $detalle?->catalogoCapAud?->nombre
            ?? $detalle?->servicio?->nombre
            ?? $programacion->ordenAsesoria?->servicio?->nombre
            ?? 'Sin asesoría';

        $mesesImplementacion = (int) ($detalle?->meses_implementacion ?? 0);
        $frecuenciaVisita = $this->normalizarFrecuenciaVisita($detalle?->frecuencia_visita);

        $programacionesRelacionadas = ProgramacionAsesoria::where('id_orden_asesoria', $programacion->id_orden_asesoria)
            ->whereNotIn('estado_ejecucion', ['Cancelado'])
            ->get(['fecha_programada', 'modalidad_visita']);

        $fechaInicioPlan = ProgramacionAsesoria::where('id_orden_asesoria', $programacion->id_orden_asesoria)
            ->whereNotIn('estado_ejecucion', ['Cancelado'])
            ->min('fecha_programada');

        $fechaInicio = Carbon::parse($fechaInicioPlan ?: $programacion->fecha_programada)->startOfDay();
        $resumenPlan = $this->calcularDiasYResumenPorMes($programacionesRelacionadas, $fechaInicio, $mesesImplementacion, $frecuenciaVisita);

        $data = $programacion->toArray();
        $data['asesoria_nombre'] = $asesoria_nombre;
        $data['meses_implementacion'] = $mesesImplementacion;
        $data['frecuencia_visita'] = $frecuenciaVisita;
        $data['dias_por_mes_calculado'] = $resumenPlan['dias_por_mes'];
        $data['resumen_por_mes'] = $resumenPlan['resumen_por_mes'];
        $data['fecha_fin_programacion'] = $resumenPlan['fecha_fin_programacion'];

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
                $areaIdsOrden = $o->id_cliente_planta_area ?? null;
                if (!is_array($areaIdsOrden)) {
                    $areaIdsOrden = empty($areaIdsOrden) ? [] : [$areaIdsOrden];
                }

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
                    'id_cliente_planta' => $o->id_cliente_planta ?? $detalle?->id_cliente_planta ?? null,
                    'id_cliente_planta_area' => !empty($areaIdsOrden)
                        ? (int) $areaIdsOrden[0]
                        : (!empty($areaIds) ? (int) $areaIds[0] : null),
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
            'dias_por_mes' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            $ordenAsesoria = OrdenAsesoria::with([
                'cliente',
                'servicio',
                'exponentes',
                'cotizacion.detalles.catalogoCapAud',
                'cotizacion.detalles.servicio',
            ])->findOrFail($validated['id_orden_asesoria']);

            $detalle = $ordenAsesoria->cotizacion?->detalles?->first(function ($d) {
                return !is_null($d->meses_implementacion) || !empty($d->frecuencia_visita);
            }) ?? $ordenAsesoria->cotizacion?->detalles?->first();

            $mesesImplementacion = (int) ($detalle?->meses_implementacion ?? 0);
            $frecuenciaVisita = $this->normalizarFrecuenciaVisita($detalle?->frecuencia_visita);
            $diasPorMes = $this->normalizarDiasPorMes($validated['dias_por_mes'] ?? []);
            $fechaInicio = Carbon::parse($validated['fecha_programada']);

            $yaProgramada = ProgramacionAsesoria::where('id_orden_asesoria', $ordenAsesoria->id)
                ->whereNotIn('estado_ejecucion', ['Cancelado'])
                ->exists();

            if ($yaProgramada) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta orden de asesoría ya está programada',
                ], 422);
            }

            $fechasProgramacion = [];

            if ($mesesImplementacion > 0 && !empty($frecuenciaVisita) && !empty($diasPorMes)) {
                $fechasProgramacion = $this->construirFechasProgramacionAsesoria(
                    $fechaInicio,
                    $mesesImplementacion,
                    $frecuenciaVisita,
                    $diasPorMes
                );
            }

            if (empty($fechasProgramacion)) {
                $fechasProgramacion = [[
                    'fecha' => $fechaInicio->format('Y-m-d'),
                    'tipo' => 'presencial',
                    'mes' => 1,
                ]];
            }

            $programacionesCreadas = [];
            $exponentesAsignados = $validated['exponentes'] ?? [];

            foreach ($fechasProgramacion as $indice => $infoFecha) {
                if (!empty($exponentesAsignados)) {
                    $conflicto = ScheduleConflictService::validarExponentes(
                        $exponentesAsignados,
                        $infoFecha['fecha'] ?? $validated['fecha_programada'],
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

                $programacion = ProgramacionAsesoria::create([
                    'id_orden_asesoria' => $validated['id_orden_asesoria'],
                    'id_supervisor' => $validated['id_supervisor'] ?? null,
                    'id_vehiculo' => $validated['id_vehiculo'] ?? null,
                    'id_cliente_planta' => $validated['id_cliente_planta'] ?? null,
                    'id_cliente_planta_area' => $validated['id_cliente_planta_area'] ?? null,
                    'fecha_programada' => $infoFecha['fecha'] ?? $validated['fecha_programada'],
                    'hora_inicio' => $validated['hora_inicio'],
                    'hora_fin' => $validated['hora_fin'] ?? null,
                    'local_sede' => $validated['local_sede'] ?? 'Lugar de Asesoría',
                    'direccion_completa' => $validated['direccion_completa'] ?? ($ordenAsesoria->cliente?->direccion ?? null),
                    'modalidad_visita' => isset($infoFecha['tipo']) ? ucfirst((string) $infoFecha['tipo']) : null,
                    'estado_ejecucion' => 'Programado',
                    'observaciones' => $validated['observaciones'] ?? null,
                    'creado_por' => $request->user()?->id,
                ]);

                if (!empty($validated['exponentes'])) {
                    $programacion->exponentes()->sync($validated['exponentes']);
                }

                $programacionesCreadas[] = $programacion;
            }

            $ordenAsesoria->estado = 'Programado';
            $ordenAsesoria->save();

            DB::commit();

            collect($programacionesCreadas)->each(function ($programacion) {
                $programacion->load([
                    'ordenAsesoria.cliente',
                    'ordenAsesoria.servicio',
                    'ordenAsesoria.exponentes',
                    'supervisor',
                    'vehiculo',
                    'planta',
                    'area',
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => count($programacionesCreadas) . ' asesorías programadas exitosamente',
                'data' => $programacionesCreadas,
                'total' => count($programacionesCreadas),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al programar asesoría: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'id_supervisor' => 'nullable|integer|exists:personal,id',
            'id_vehiculo' => 'nullable|integer|exists:vehiculos,id',
            'id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
            'fecha_programada' => 'nullable|date',
            'hora_inicio' => 'nullable',
            'hora_fin' => 'nullable',
            'local_sede' => 'nullable|string|max:150',
            'direccion_completa' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
            'estado_ejecucion' => 'nullable|in:Programado,Confirmado,En Camino,En Ejecucion,En Ejecución,Realizado,Reprogramado,Cancelado',
            'exponentes' => 'nullable|array',
            'exponentes.*' => 'integer|exists:exponentes,id',
        ]);

        DB::beginTransaction();
        try {
            $programacion = ProgramacionAsesoria::with(['ordenAsesoria.cliente', 'exponentes'])->findOrFail($id);

            $exponentesFinales = array_key_exists('exponentes', $validated)
                ? ($validated['exponentes'] ?? [])
                : $programacion->exponentes->pluck('id')->map(fn ($v) => (int) $v)->all();

            $payload = [
                'id_supervisor' => $validated['id_supervisor'] ?? null,
                'id_vehiculo' => $validated['id_vehiculo'] ?? null,
                'id_cliente_planta' => $validated['id_cliente_planta'] ?? null,
                'id_cliente_planta_area' => $validated['id_cliente_planta_area'] ?? null,
                'hora_inicio' => $validated['hora_inicio'] ?? $programacion->hora_inicio,
                'hora_fin' => array_key_exists('hora_fin', $validated) ? ($validated['hora_fin'] ?: null) : $programacion->hora_fin,
                'local_sede' => $validated['local_sede'] ?? $programacion->local_sede,
                'direccion_completa' => $validated['direccion_completa'] ?? $programacion->direccion_completa,
                'observaciones' => $validated['observaciones'] ?? $programacion->observaciones,
                'estado_ejecucion' => $validated['estado_ejecucion'] ?? $programacion->estado_ejecucion,
            ];

            if (($payload['estado_ejecucion'] ?? null) === 'En Ejecución') {
                $payload['estado_ejecucion'] = 'En Ejecucion';
            }

            // Para asesorías, al editar fecha solo se permite cambiar el día preservando mes y año.
            if (!empty($validated['fecha_programada'])) {
                $fechaActual = Carbon::parse($programacion->fecha_programada);
                $fechaNueva = Carbon::parse($validated['fecha_programada']);
                $ultimoDiaMes = $fechaActual->copy()->endOfMonth()->day;
                $dia = min((int) $fechaNueva->day, (int) $ultimoDiaMes);

                $payload['fecha_programada'] = Carbon::create(
                    $fechaActual->year,
                    $fechaActual->month,
                    $dia,
                    0,
                    0,
                    0,
                    $fechaActual->timezone
                )->format('Y-m-d');
            }

            if (!empty($exponentesFinales)) {
                $conflicto = ScheduleConflictService::validarExponentes(
                    $exponentesFinales,
                    (string) ($payload['fecha_programada'] ?? $programacion->fecha_programada),
                    $payload['hora_inicio'] ?? $programacion->hora_inicio,
                    array_key_exists('hora_fin', $payload) ? ($payload['hora_fin'] ?? null) : $programacion->hora_fin,
                    ['programacion_asesoria' => (int) $programacion->id]
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

            $programacion->update($payload);

            if (array_key_exists('exponentes', $validated)) {
                $programacion->exponentes()->sync($validated['exponentes'] ?? []);
            }

            DB::commit();

            $programacion->load([
                'ordenAsesoria.cliente',
                'ordenAsesoria.servicio',
                'ordenAsesoria.exponentes',
                'supervisor',
                'vehiculo',
                'planta',
                'area',
                'exponentes',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Programación de asesoría actualizada correctamente',
                'data' => $programacion,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar asesoría: ' . $e->getMessage(),
            ], 500);
        }
    }
}
