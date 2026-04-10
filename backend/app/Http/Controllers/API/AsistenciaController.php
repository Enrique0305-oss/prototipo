<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RrhhAsistencia;
use App\Models\RrhhHorario;
use App\Models\Personal;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AsistenciaController extends Controller
{
    /**
     * Mapa de días de la semana Carbon → BD
     */
    private function getDiaSemana(): string
    {
        $dias = [
            'Monday'    => 'Lunes',
            'Tuesday'   => 'Martes',
            'Wednesday' => 'Miércoles',
            'Thursday'  => 'Jueves',
            'Friday'    => 'Viernes',
            'Saturday'  => 'Sábado',
            'Sunday'    => 'Domingo',
        ];
        return $dias[Carbon::now()->format('l')] ?? 'Lunes';
    }

    public function miEstado(Request $request)
    {
        $idPersonal = $request->user()?->id ?? $request->query('id_personal', 1);
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();
        $diaSemana = $this->getDiaSemana();

        // Obtener personal
        $personal = Personal::with('area')->find($idPersonal);
        if (!$personal) {
            return response()->json(['success' => false, 'message' => 'Personal no encontrado'], 404);
        }

        // Obtener horario del día
        $horario = RrhhHorario::where('id_personal', $idPersonal)
            ->where('dia_semana', $diaSemana)
            ->where('activo', true)
            ->first();

        // Si no tiene horario, retornar sin datos
        if (!$horario) {
            return response()->json([
                'success' => true,
                'data' => [
                    'personal' => [
                        'id' => $personal->id,
                        'nombre' => $personal->nombre . ' ' . $personal->apellidos,
                        'area' => $personal->area ? $personal->area->nombre : 'Sin área',
                        'codigo' => 'EMP-' . str_pad($personal->id, 3, '0', STR_PAD_LEFT),
                    ],
                    'horario' => null,
                    'es_descanso' => false,
                    'asistencia_hoy' => null,
                    'semana' => [],
                    'estadisticas' => null,
                    'servidor_hora' => $ahora->format('H:i:s'),
                    'servidor_fecha' => $ahora->toDateString(),
                ]
            ]);
        }

        // Si es día de descanso
        if ($horario->es_descanso) {
            return response()->json([
                'success' => true,
                'data' => [
                    'personal' => [
                        'id' => $personal->id,
                        'nombre' => $personal->nombre . ' ' . $personal->apellidos,
                        'area' => $personal->area ? $personal->area->nombre : 'Sin área',
                        'codigo' => 'EMP-' . str_pad($personal->id, 3, '0', STR_PAD_LEFT),
                    ],
                    'horario' => null,
                    'es_descanso' => true,
                    'asistencia_hoy' => null,
                    'semana' => [],
                    'estadisticas' => null,
                    'servidor_hora' => $ahora->format('H:i:s'),
                    'servidor_fecha' => $ahora->toDateString(),
                ]
            ]);
        }

        // Obtener asistencia de hoy
        $asistenciaHoy = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('fecha', $hoy)
            ->where('tipo_registro', 'Oficina')
            ->first();

        // Calcular el estado del botón de salida
        $horaSalidaEsperada = Carbon::parse($hoy . ' ' . $horario->hora_salida_esperada);
        $puedeMarcarSalida = $ahora->gte($horaSalidaEsperada);

        // Obtener asistencias de la semana (lunes a hoy)
        $inicioSemana = $ahora->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
        $semana = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('tipo_registro', 'Oficina')
            ->whereBetween('fecha', [$inicioSemana, $hoy])
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function ($a) use ($hoy) {
                $fecha = Carbon::parse($a->fecha);
                $diasEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                $diaNombre = $diasEs[$fecha->dayOfWeek] ?? '';
                $esHoy = $fecha->format('Y-m-d') === $hoy;
                
                return [
                    'dia' => $esHoy ? "Hoy - {$diaNombre}" : $diaNombre,
                    'fecha' => $fecha->format('d/m/Y'),
                    'entrada' => $a->hora_entrada ? Carbon::parse($a->hora_entrada)->format('H:i') : '--:--',
                    'salida' => $a->hora_salida ? Carbon::parse($a->hora_salida)->format('H:i') : '--:--',
                    'horas' => $a->horas_trabajadas ? number_format($a->horas_trabajadas, 2) . ' hrs' : '-- hrs',
                    'estado' => $a->estado,
                    'tardanza_minutos' => $a->tardanza_minutos,
                    'tiempo_extra_minutos' => $a->tiempo_extra_minutos,
                    'es_hoy' => $esHoy,
                ];
            });

        // Estadísticas de la semana
        $totalHoras = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('tipo_registro', 'Oficina')
            ->whereBetween('fecha', [$inicioSemana, $hoy])
            ->whereNotNull('horas_trabajadas')
            ->sum('horas_trabajadas');

        $diasTrabajados = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('tipo_registro', 'Oficina')
            ->whereBetween('fecha', [$inicioSemana, $hoy])
            ->whereNotNull('hora_entrada')
            ->count();

        $tardanzas = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('tipo_registro', 'Oficina')
            ->whereBetween('fecha', [$inicioSemana, $hoy])
            ->where('estado', 'Tardanza')
            ->count();

        $totalExtraMin = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('tipo_registro', 'Oficina')
            ->whereBetween('fecha', [$inicioSemana, $hoy])
            ->sum('tiempo_extra_minutos');

        $puntualidad = $diasTrabajados > 0 
            ? round((($diasTrabajados - $tardanzas) / $diasTrabajados) * 100) 
            : 100;

        return response()->json([
            'success' => true,
            'data' => [
                'personal' => [
                    'id' => $personal->id,
                    'nombre' => $personal->nombre . ' ' . $personal->apellidos,
                    'area' => $personal->area ? $personal->area->nombre : 'Sin área',
                    'codigo' => 'EMP-' . str_pad($personal->id, 3, '0', STR_PAD_LEFT),
                ],
                'horario' => [
                    'entrada' => Carbon::parse($horario->hora_entrada_esperada)->format('H:i'),
                    'salida' => Carbon::parse($horario->hora_salida_esperada)->format('H:i'),
                    'tolerancia' => $horario->tolerancia_minutos,
                ],
                'asistencia_hoy' => $asistenciaHoy ? [
                    'id' => $asistenciaHoy->id,
                    'entrada' => $asistenciaHoy->hora_entrada ? Carbon::parse($asistenciaHoy->hora_entrada)->format('H:i') : null,
                    'salida' => $asistenciaHoy->hora_salida ? Carbon::parse($asistenciaHoy->hora_salida)->format('H:i') : null,
                    'horas_trabajadas' => $asistenciaHoy->horas_trabajadas,
                    'tardanza_minutos' => $asistenciaHoy->tardanza_minutos,
                    'tiempo_extra_minutos' => $asistenciaHoy->tiempo_extra_minutos,
                    'estado' => $asistenciaHoy->estado,
                    'hora_entrada_raw' => $asistenciaHoy->hora_entrada, // Para el contador JS
                    'hora_inicio_almuerzo' => $asistenciaHoy->hora_inicio_almuerzo ? Carbon::parse($asistenciaHoy->hora_inicio_almuerzo)->format('H:i') : null,
                    'hora_fin_almuerzo' => $asistenciaHoy->hora_fin_almuerzo ? Carbon::parse($asistenciaHoy->hora_fin_almuerzo)->format('H:i') : null,
                    'hora_inicio_almuerzo_raw' => $asistenciaHoy->hora_inicio_almuerzo,
                    'exceso_almuerzo_minutos' => $asistenciaHoy->exceso_almuerzo_minutos,
                    'horas_extra_asignadas' => (bool) $asistenciaHoy->horas_extra_asignadas,
                    'hora_inicio_extra' => $asistenciaHoy->hora_inicio_extra ? Carbon::parse($asistenciaHoy->hora_inicio_extra)->format('H:i') : null,
                    'hora_inicio_extra_raw' => $asistenciaHoy->hora_inicio_extra,
                ] : null,
                'puede_marcar_salida' => $puedeMarcarSalida,
                'semana' => $semana,
                'estadisticas' => [
                    'total_horas' => round($totalHoras, 2),
                    'dias_trabajados' => $diasTrabajados,
                    'tardanzas' => $tardanzas,
                    'puntualidad' => $puntualidad,
                    'tiempo_extra_minutos' => (int) $totalExtraMin,
                ],
                'servidor_hora' => $ahora->format('H:i:s'),
                'servidor_fecha' => $ahora->toDateString(),
            ]
        ]);
    }

    /**
     * POST /asistencia/marcar-entrada
     */
    public function marcarEntrada(Request $request)
    {
        $idPersonal = $request->user()?->id ?? $request->input('id_personal', 1);
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();
        $diaSemana = $this->getDiaSemana();

        // Verificar que no haya marcado entrada hoy
        $existente = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('fecha', $hoy)
            ->where('tipo_registro', 'Oficina')
            ->first();

        if ($existente) {
            return response()->json([
                'success' => false,
                'message' => 'Ya registraste tu entrada hoy'
            ], 422);
        }

        // Obtener horario
        $horario = RrhhHorario::where('id_personal', $idPersonal)
            ->where('dia_semana', $diaSemana)
            ->where('activo', true)
            ->first();

        if (!$horario) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes horario asignado para hoy'
            ], 422);
        }

        // Bloquear si es día de descanso
        if ($horario->es_descanso) {
            return response()->json([
                'success' => false,
                'message' => 'Hoy es tu día de descanso, no puedes marcar entrada'
            ], 422);
        }

        // Calcular tardanza
        $horaEntradaEsperada = Carbon::parse($hoy . ' ' . $horario->hora_entrada_esperada);
        $limiteTolerancia = $horaEntradaEsperada->copy()->addMinutes($horario->tolerancia_minutos);
        
        $tardanzaMinutos = 0;
        $estado = 'Puntual';

        if ($ahora->gt($limiteTolerancia)) {
            $tardanzaMinutos = (int) $ahora->diffInMinutes($horaEntradaEsperada);
            $estado = 'Tardanza';
        }

        // Crear registro
        $asistencia = RrhhAsistencia::create([
            'id_personal' => $idPersonal,
            'fecha' => $hoy,
            'tipo_registro' => 'Oficina',
            'hora_entrada' => $ahora->format('H:i:s'),
            'hora_esperada_entrada' => $horario->hora_entrada_esperada,
            'hora_esperada_salida' => $horario->hora_salida_esperada,
            'tardanza_minutos' => $tardanzaMinutos,
            'estado' => $estado,
            'registrado_via' => 'Web',
            'fecha_creacion' => $ahora,
        ]);

        return response()->json([
            'success' => true,
            'message' => $estado === 'Puntual' 
                ? "Entrada registrada a las {$ahora->format('H:i')} - ¡Puntual!" 
                : "Entrada registrada a las {$ahora->format('H:i')} - Tardanza de {$tardanzaMinutos} minutos",
            'data' => [
                'id' => $asistencia->id,
                'hora_entrada' => $ahora->format('H:i'),
                'hora_entrada_raw' => $ahora->format('H:i:s'),
                'tardanza_minutos' => $tardanzaMinutos,
                'estado' => $estado,
            ]
        ]);
    }

    /**
     * POST /asistencia/marcar-salida
     */
    public function marcarSalida(Request $request)
    {
        $idPersonal = $request->user()?->id ?? $request->input('id_personal', 1);
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();

        // Buscar asistencia de hoy
        $asistencia = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('fecha', $hoy)
            ->where('tipo_registro', 'Oficina')
            ->first();

        if (!$asistencia) {
            return response()->json([
                'success' => false,
                'message' => 'No has marcado entrada hoy'
            ], 422);
        }

        if ($asistencia->hora_salida) {
            return response()->json([
                'success' => false,
                'message' => 'Ya registraste tu salida hoy'
            ], 422);
        }

        // Verificar que sea hora de salir
        $horaSalidaEsperada = Carbon::parse($hoy . ' ' . $asistencia->hora_esperada_salida);

        // Calcular horas trabajadas
        $horaEntrada = Carbon::parse($hoy . ' ' . $asistencia->hora_entrada);
        $horasTrabajadas = round($horaEntrada->diffInMinutes($ahora) / 60, 2);

        // Descontar exceso de almuerzo si aplica
        if ($asistencia->exceso_almuerzo_minutos > 0) {
            $horasTrabajadas = round($horasTrabajadas - ($asistencia->exceso_almuerzo_minutos / 60), 2);
        }

        // Calcular tiempo extra si RRHH asignó horas extra
        $tiempoExtraMinutos = 0;
        if ($asistencia->horas_extra_asignadas && $asistencia->hora_inicio_extra) {
            $horaInicioExtra = Carbon::parse($hoy . ' ' . $asistencia->hora_inicio_extra);
            if ($ahora->gt($horaInicioExtra)) {
                $tiempoExtraMinutos = (int) $horaInicioExtra->diffInMinutes($ahora);
            }
        }

        // El estado se mantiene como venía (Puntual o Tardanza) a menos que estaba Incompleto
        $estado = $asistencia->estado;
        if ($estado === 'Incompleto') {
            $estado = 'Puntual';
        }

        $asistencia->update([
            'hora_salida' => $ahora->format('H:i:s'),
            'horas_trabajadas' => $horasTrabajadas,
            'tiempo_extra_minutos' => $tiempoExtraMinutos,
            'estado' => $estado,
            'fecha_modificacion' => $ahora,
        ]);

        $mensaje = "Salida registrada a las {$ahora->format('H:i')}";
        $mensaje .= " - Total: {$horasTrabajadas} hrs";
        if ($tiempoExtraMinutos > 0) {
            $hE = floor($tiempoExtraMinutos / 60);
            $mE = $tiempoExtraMinutos % 60;
            $mensaje .= $hE > 0 ? " | Horas extra: {$hE}h {$mE}m" : " | Horas extra: {$mE} min";
        }

        return response()->json([
            'success' => true,
            'message' => $mensaje,
            'data' => [
                'hora_salida' => $ahora->format('H:i'),
                'horas_trabajadas' => $horasTrabajadas,
                'tiempo_extra_minutos' => $tiempoExtraMinutos,
                'estado' => $estado,
            ]
        ]);
    }

    /**
     * GET /asistencia/lista?fecha=YYYY-MM-DD
     * Para RRHH: lista de asistencias de todos los empleados en una fecha
     */
    public function listaAdmin(Request $request)
    {
        $fecha = $request->query('fecha', Carbon::now()->toDateString());
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();

        $asistencias = RrhhAsistencia::with(['personal.area'])
            ->where('fecha', $fecha)
            ->where('tipo_registro', 'Oficina')
            ->orderBy('hora_entrada')
            ->get();

        $registros = $asistencias
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'id_personal' => $a->id_personal,
                    'nombre' => $a->personal ? $a->personal->nombre . ' ' . $a->personal->apellidos : 'Desconocido',
                    'fecha' => Carbon::parse($a->fecha)->format('Y-m-d'),
                    'area' => $a->personal && $a->personal->area ? $a->personal->area->nombre : 'Sin área',
                    'entrada' => $a->hora_entrada ? Carbon::parse($a->hora_entrada)->format('H:i') : null,
                    'salida' => $a->hora_salida ? Carbon::parse($a->hora_salida)->format('H:i') : null,
                    'horas_trabajadas' => $a->horas_trabajadas,
                    'tardanza_minutos' => $a->tardanza_minutos,
                    'tiempo_extra_minutos' => $a->tiempo_extra_minutos,
                    'horas_extra_asignadas' => (bool) $a->horas_extra_asignadas,
                    'hora_inicio_extra' => $a->hora_inicio_extra ? Carbon::parse($a->hora_inicio_extra)->format('H:i') : null,
                    'estado' => $a->estado,
                    'observaciones' => $a->observaciones,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $registros,
            'fecha' => $fecha,
        ]);
    }

    /**
     * GET /asistencia/reporte-dashboard?mes=YYYY-MM&area=NombreArea
     * Dashboard RRHH con datos reales para KPIs, tablas y graficos.
     */
    public function reporteDashboard(Request $request)
    {
        $mes = (string) $request->query('mes', Carbon::now()->format('Y-m'));
        $areaFiltro = trim((string) $request->query('area', ''));

        if (!preg_match('/^\d{4}-\d{2}$/', $mes)) {
            return response()->json([
                'success' => false,
                'message' => 'El parámetro mes debe tener formato YYYY-MM'
            ], 422);
        }

        [$anio, $mesNumero] = array_map('intval', explode('-', $mes));
        $inicioMes = Carbon::createFromDate($anio, $mesNumero, 1)->startOfMonth();
        $finMes = $inicioMes->copy()->endOfMonth();

        $query = RrhhAsistencia::with(['personal.area'])
            ->where('tipo_registro', 'Oficina')
            ->whereBetween('fecha', [$inicioMes->toDateString(), $finMes->toDateString()]);

        if ($areaFiltro !== '' && mb_strtolower($areaFiltro) !== 'todos') {
            $query->whereHas('personal.area', function ($q) use ($areaFiltro) {
                $q->where('nombre', $areaFiltro);
            });
        }

        $asistencias = $query->get();

        $totalRegistros = $asistencias->count();
        $registrosConEntrada = $asistencias->filter(fn($a) => !empty($a->hora_entrada));
        $totalConEntrada = $registrosConEntrada->count();

        $totalHoras = round((float) $registrosConEntrada->sum(fn($a) => (float) ($a->horas_trabajadas ?? 0)), 2);
        $totalTardanzaMin = (int) $asistencias->sum(fn($a) => (int) ($a->tardanza_minutos ?? 0));
        $totalTardanzas = $asistencias->filter(fn($a) => ((int) ($a->tardanza_minutos ?? 0)) > 0)->count();
        $totalAusencias = $asistencias->filter(fn($a) => ($a->estado ?? '') === 'Falta')->count();
        $totalExtraMin = (int) $asistencias->sum(fn($a) => (int) ($a->tiempo_extra_minutos ?? 0));

        $totalAlmuerzoMin = 0;
        $totalExcesoAlmuerzoMin = 0;
        $totalTardanzaInicioAlmuerzoMin = 0;
        $registrosConAlmuerzo = 0;

        foreach ($asistencias as $a) {
            $totalExcesoAlmuerzoMin += (int) ($a->exceso_almuerzo_minutos ?? 0);

            if (!empty($a->hora_inicio_almuerzo) && !empty($a->hora_fin_almuerzo)) {
                $inicioAlmuerzo = Carbon::parse($a->fecha->toDateString() . ' ' . $a->hora_inicio_almuerzo);
                $finAlmuerzo = Carbon::parse($a->fecha->toDateString() . ' ' . $a->hora_fin_almuerzo);
                if ($finAlmuerzo->gt($inicioAlmuerzo)) {
                    $totalAlmuerzoMin += (int) $inicioAlmuerzo->diffInMinutes($finAlmuerzo);
                }
                $registrosConAlmuerzo++;
            }

            if (!empty($a->hora_inicio_almuerzo) && !empty($a->hora_esperada_entrada) && !empty($a->hora_esperada_salida)) {
                $fecha = $a->fecha->toDateString();
                $esperadaEntrada = Carbon::parse($fecha . ' ' . $a->hora_esperada_entrada);
                $esperadaSalida = Carbon::parse($fecha . ' ' . $a->hora_esperada_salida);
                $inicioEsperadoAlmuerzo = $esperadaEntrada->copy()->addMinutes((int) floor($esperadaEntrada->diffInMinutes($esperadaSalida) / 2));
                $inicioRealAlmuerzo = Carbon::parse($fecha . ' ' . $a->hora_inicio_almuerzo);
                if ($inicioRealAlmuerzo->gt($inicioEsperadoAlmuerzo)) {
                    $totalTardanzaInicioAlmuerzoMin += (int) $inicioEsperadoAlmuerzo->diffInMinutes($inicioRealAlmuerzo);
                }
            }
        }

        $asistenciaPromedio = $totalRegistros > 0
            ? round(($totalConEntrada / $totalRegistros) * 100, 1)
            : 0.0;

        $jornadaPromedio = $totalConEntrada > 0
            ? round($totalHoras / $totalConEntrada, 2)
            : 0.0;

        $horasEfectivas = max(0, round($totalHoras - ($totalTardanzaMin / 60), 2));
        $promedioAlmuerzoMin = $registrosConAlmuerzo > 0
            ? round($totalAlmuerzoMin / $registrosConAlmuerzo, 1)
            : 0.0;

        $porArea = $asistencias
            ->groupBy(function ($a) {
                return $a->personal && $a->personal->area
                    ? $a->personal->area->nombre
                    : 'Sin área';
            })
            ->map(function ($items, $area) {
                $registros = $items->count();
                $conEntrada = $items->filter(fn($a) => !empty($a->hora_entrada));
                $horas = round((float) $conEntrada->sum(fn($a) => (float) ($a->horas_trabajadas ?? 0)), 2);
                $tardanzaMin = (int) $items->sum(fn($a) => (int) ($a->tardanza_minutos ?? 0));
                $tardanzas = $items->filter(fn($a) => ((int) ($a->tardanza_minutos ?? 0)) > 0)->count();
                $asistencia = $registros > 0 ? round(($conEntrada->count() / $registros) * 100, 1) : 0.0;

                return [
                    'area' => $area,
                    'horas' => $horas,
                    'asistencia' => $asistencia,
                    'tardanza_minutos' => $tardanzaMin,
                    'tardanzas' => $tardanzas,
                ];
            })
            ->sortByDesc('horas')
            ->values();

        $topEmpleados = $asistencias
            ->groupBy('id_personal')
            ->map(function ($items) {
                $primero = $items->first();
                $nombre = $primero && $primero->personal
                    ? trim(($primero->personal->nombre ?? '') . ' ' . ($primero->personal->apellidos ?? ''))
                    : 'Desconocido';
                $area = $primero && $primero->personal && $primero->personal->area
                    ? $primero->personal->area->nombre
                    : 'Sin área';

                $registros = $items->count();
                $conEntrada = $items->filter(fn($a) => !empty($a->hora_entrada));
                $presentes = $conEntrada->count();
                $tardanzas = $items->filter(fn($a) => ((int) ($a->tardanza_minutos ?? 0)) > 0)->count();

                $asistencia = $registros > 0 ? round(($presentes / $registros) * 100, 1) : 0.0;
                $puntualidad = $presentes > 0 ? round((($presentes - $tardanzas) / $presentes) * 100, 1) : 0.0;

                return [
                    'id_personal' => (int) $primero->id_personal,
                    'empleado' => $nombre,
                    'area' => $area,
                    'asistencia' => $asistencia,
                    'puntualidad' => $puntualidad,
                ];
            })
            ->sortByDesc(function ($e) {
                return ($e['asistencia'] * 1000) + $e['puntualidad'];
            })
            ->take(6)
            ->values();

        $semanasMes = [];
        $totalSemanas = (int) ceil($finMes->day / 7);
        for ($i = 1; $i <= $totalSemanas; $i++) {
            $semanasMes[$i] = [
                'etiqueta' => 'S' . $i,
                'horas' => 0.0,
                'tardanza_minutos' => 0,
            ];
        }

        foreach ($asistencias as $a) {
            $dia = Carbon::parse($a->fecha)->day;
            $indiceSemana = (int) floor(($dia - 1) / 7) + 1;
            if (!isset($semanasMes[$indiceSemana])) {
                continue;
            }

            $semanasMes[$indiceSemana]['horas'] += (float) ($a->horas_trabajadas ?? 0);
            $semanasMes[$indiceSemana]['tardanza_minutos'] += (int) ($a->tardanza_minutos ?? 0);
        }

        $historicoSemanas = array_values(array_map(function ($s) {
            return [
                'etiqueta' => $s['etiqueta'],
                'horas' => round((float) $s['horas'], 2),
                'tardanza_minutos' => (int) $s['tardanza_minutos'],
            ];
        }, $semanasMes));

        $almuerzoSemanas = [];
        for ($i = 1; $i <= $totalSemanas; $i++) {
            $almuerzoSemanas[$i] = [
                'etiqueta' => 'S' . $i,
                'almuerzo_minutos' => 0,
                'exceso_almuerzo_minutos' => 0,
                'tardanza_inicio_almuerzo_minutos' => 0,
            ];
        }

        foreach ($asistencias as $a) {
            $dia = Carbon::parse($a->fecha)->day;
            $indiceSemana = (int) floor(($dia - 1) / 7) + 1;
            if (!isset($almuerzoSemanas[$indiceSemana])) {
                continue;
            }

            if (!empty($a->hora_inicio_almuerzo) && !empty($a->hora_fin_almuerzo)) {
                $inicioAlmuerzo = Carbon::parse($a->fecha->toDateString() . ' ' . $a->hora_inicio_almuerzo);
                $finAlmuerzo = Carbon::parse($a->fecha->toDateString() . ' ' . $a->hora_fin_almuerzo);
                if ($finAlmuerzo->gt($inicioAlmuerzo)) {
                    $almuerzoSemanas[$indiceSemana]['almuerzo_minutos'] += (int) $inicioAlmuerzo->diffInMinutes($finAlmuerzo);
                }
            }

            $almuerzoSemanas[$indiceSemana]['exceso_almuerzo_minutos'] += (int) ($a->exceso_almuerzo_minutos ?? 0);

            if (!empty($a->hora_inicio_almuerzo) && !empty($a->hora_esperada_entrada) && !empty($a->hora_esperada_salida)) {
                $fecha = $a->fecha->toDateString();
                $esperadaEntrada = Carbon::parse($fecha . ' ' . $a->hora_esperada_entrada);
                $esperadaSalida = Carbon::parse($fecha . ' ' . $a->hora_esperada_salida);
                $inicioEsperadoAlmuerzo = $esperadaEntrada->copy()->addMinutes((int) floor($esperadaEntrada->diffInMinutes($esperadaSalida) / 2));
                $inicioRealAlmuerzo = Carbon::parse($fecha . ' ' . $a->hora_inicio_almuerzo);
                if ($inicioRealAlmuerzo->gt($inicioEsperadoAlmuerzo)) {
                    $almuerzoSemanas[$indiceSemana]['tardanza_inicio_almuerzo_minutos'] += (int) $inicioEsperadoAlmuerzo->diffInMinutes($inicioRealAlmuerzo);
                }
            }
        }

        $historicoAlmuerzoSemanas = array_values($almuerzoSemanas);

        $historicoDias = [];
        $historicoAlmuerzoDias = [];
        for ($d = 1; $d <= $finMes->day; $d++) {
            $key = str_pad((string) $d, 2, '0', STR_PAD_LEFT);
            $historicoDias[$key] = [
                'etiqueta' => $key,
                'horas' => 0.0,
                'tardanza_minutos' => 0,
            ];
            $historicoAlmuerzoDias[$key] = [
                'etiqueta' => $key,
                'almuerzo_minutos' => 0,
                'exceso_almuerzo_minutos' => 0,
                'tardanza_inicio_almuerzo_minutos' => 0,
            ];
        }

        foreach ($asistencias as $a) {
            $diaNum = Carbon::parse($a->fecha)->day;
            $key = str_pad((string) $diaNum, 2, '0', STR_PAD_LEFT);
            if (!isset($historicoDias[$key])) {
                continue;
            }

            $historicoDias[$key]['horas'] += (float) ($a->horas_trabajadas ?? 0);
            $historicoDias[$key]['tardanza_minutos'] += (int) ($a->tardanza_minutos ?? 0);

            if (!empty($a->hora_inicio_almuerzo) && !empty($a->hora_fin_almuerzo)) {
                $inicioAlmuerzo = Carbon::parse($a->fecha->toDateString() . ' ' . $a->hora_inicio_almuerzo);
                $finAlmuerzo = Carbon::parse($a->fecha->toDateString() . ' ' . $a->hora_fin_almuerzo);
                if ($finAlmuerzo->gt($inicioAlmuerzo)) {
                    $historicoAlmuerzoDias[$key]['almuerzo_minutos'] += (int) $inicioAlmuerzo->diffInMinutes($finAlmuerzo);
                }
            }

            $historicoAlmuerzoDias[$key]['exceso_almuerzo_minutos'] += (int) ($a->exceso_almuerzo_minutos ?? 0);

            if (!empty($a->hora_inicio_almuerzo) && !empty($a->hora_esperada_entrada) && !empty($a->hora_esperada_salida)) {
                $fecha = $a->fecha->toDateString();
                $esperadaEntrada = Carbon::parse($fecha . ' ' . $a->hora_esperada_entrada);
                $esperadaSalida = Carbon::parse($fecha . ' ' . $a->hora_esperada_salida);
                $inicioEsperadoAlmuerzo = $esperadaEntrada->copy()->addMinutes((int) floor($esperadaEntrada->diffInMinutes($esperadaSalida) / 2));
                $inicioRealAlmuerzo = Carbon::parse($fecha . ' ' . $a->hora_inicio_almuerzo);
                if ($inicioRealAlmuerzo->gt($inicioEsperadoAlmuerzo)) {
                    $historicoAlmuerzoDias[$key]['tardanza_inicio_almuerzo_minutos'] += (int) $inicioEsperadoAlmuerzo->diffInMinutes($inicioRealAlmuerzo);
                }
            }
        }

        $historicoDias = array_values(array_map(function ($d) {
            return [
                'etiqueta' => $d['etiqueta'],
                'horas' => round((float) $d['horas'], 2),
                'tardanza_minutos' => (int) $d['tardanza_minutos'],
            ];
        }, $historicoDias));

        $historicoAlmuerzoDias = array_values($historicoAlmuerzoDias);

        $estadosDistribucion = $asistencias
            ->groupBy(function ($a) {
                return (string) ($a->estado ?? 'Sin estado');
            })
            ->map(function ($items, $estado) {
                return [
                    'estado' => $estado,
                    'total' => $items->count(),
                ];
            })
            ->values();

        $alertas = [];
        if ($totalTardanzas > 0) {
            $alertas[] = [
                'tipo' => 'warning',
                'titulo' => 'Seguimiento de tardanzas',
                'detalle' => "Se registraron {$totalTardanzas} tardanzas en {$mes}."
            ];
        }
        if ($totalAusencias > 0) {
            $alertas[] = [
                'tipo' => 'danger',
                'titulo' => 'Ausencias detectadas',
                'detalle' => "Se reportaron {$totalAusencias} ausencias en el periodo."
            ];
        }
        if ($asistenciaPromedio >= 95) {
            $alertas[] = [
                'tipo' => 'success',
                'titulo' => 'Buen nivel de asistencia',
                'detalle' => "La asistencia promedio mensual es {$asistenciaPromedio}%."
            ];
        }
        if (empty($alertas)) {
            $alertas[] = [
                'tipo' => 'info',
                'titulo' => 'Sin alertas críticas',
                'detalle' => 'No se identificaron desviaciones relevantes para este periodo.'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'filtros' => [
                    'mes' => $mes,
                    'area' => $areaFiltro === '' ? 'Todos' : $areaFiltro,
                ],
                'kpis' => [
                    'horas_trabajadas_totales' => $totalHoras,
                    'horas_efectivas' => $horasEfectivas,
                    'tiempo_total_tardanza_minutos' => $totalTardanzaMin,
                    'tiempo_total_almuerzo_minutos' => (int) $totalAlmuerzoMin,
                    'promedio_almuerzo_minutos' => $promedioAlmuerzoMin,
                    'tiempo_exceso_almuerzo_minutos' => (int) $totalExcesoAlmuerzoMin,
                    'tardanza_inicio_almuerzo_minutos' => (int) $totalTardanzaInicioAlmuerzoMin,
                    'asistencia_promedio' => $asistenciaPromedio,
                    'tardanzas_mes' => $totalTardanzas,
                    'ausencias_mes' => $totalAusencias,
                    'tiempo_extra_total_minutos' => $totalExtraMin,
                    'jornada_promedio_horas' => $jornadaPromedio,
                ],
                'por_area' => $porArea,
                'top_empleados' => $topEmpleados,
                'historico_semanas' => $historicoSemanas,
                'historico_almuerzo_semanas' => $historicoAlmuerzoSemanas,
                'historico_dias' => $historicoDias,
                'historico_almuerzo_dias' => $historicoAlmuerzoDias,
                'distribucion_estados' => $estadosDistribucion,
                'alertas' => $alertas,
                'areas_disponibles' => $porArea->pluck('area')->values(),
            ],
        ]);
    }

    /**
     * PUT /asistencia/{id}/horas-extra
     * Para RRHH: asignar horas extra a un empleado que está en curso (ANTES de marcar salida).
     * Si asignar=true, activa las horas extra con hora_inicio_extra.
     * Si asignar=false, cancela la asignación.
     */
    public function asignarHorasExtra(Request $request, $id)
    {
        $request->validate([
            'asignar' => 'required|boolean',
            'hora_inicio_extra' => 'nullable|date_format:H:i',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $asistencia = RrhhAsistencia::find($id);

        if (!$asistencia) {
            return response()->json([
                'success' => false,
                'message' => 'Registro de asistencia no encontrado'
            ], 404);
        }

        if ($asistencia->hora_salida) {
            return response()->json([
                'success' => false,
                'message' => 'El empleado ya marcó su salida, no se puede modificar'
            ], 422);
        }

        if (!$asistencia->hora_entrada) {
            return response()->json([
                'success' => false,
                'message' => 'El empleado aún no ha marcado entrada'
            ], 422);
        }

        $asignar = $request->boolean('asignar');

        if ($asignar) {
            // Por defecto: hora de salida esperada del empleado
            $horaInicioExtra = $request->input('hora_inicio_extra')
                ?? ($asistencia->hora_esperada_salida ? Carbon::parse($asistencia->hora_esperada_salida)->format('H:i') : Carbon::now()->format('H:i'));

            $asistencia->update([
                'horas_extra_asignadas' => true,
                'hora_inicio_extra' => $horaInicioExtra,
                'observaciones' => $request->input('observaciones') ?? $asistencia->observaciones,
                'modificado_por' => $request->user()?->id,
                'fecha_modificacion' => Carbon::now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Horas extra asignadas desde las {$horaInicioExtra}",
                'data' => [
                    'horas_extra_asignadas' => true,
                    'hora_inicio_extra' => $horaInicioExtra,
                ]
            ]);
        } else {
            $asistencia->update([
                'horas_extra_asignadas' => false,
                'hora_inicio_extra' => null,
                'tiempo_extra_minutos' => 0,
                'observaciones' => $request->input('observaciones') ?? $asistencia->observaciones,
                'modificado_por' => $request->user()?->id,
                'fecha_modificacion' => Carbon::now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Asignación de horas extra cancelada',
                'data' => [
                    'horas_extra_asignadas' => false,
                ]
            ]);
        }
    }

    public function marcarInicioAlmuerzo(Request $request)
    {
        $idPersonal = $request->user()?->id ?? $request->input('id_personal', 1);
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();

        $asistencia = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('fecha', $hoy)
            ->where('tipo_registro', 'Oficina')
            ->first();

        if (!$asistencia) {
            return response()->json([
                'success' => false,
                'message' => 'No has marcado entrada hoy'
            ], 422);
        }

        if ($asistencia->hora_inicio_almuerzo) {
            return response()->json([
                'success' => false,
                'message' => 'Ya registraste tu inicio de almuerzo hoy'
            ], 422);
        }

        if ($asistencia->hora_salida) {
            return response()->json([
                'success' => false,
                'message' => 'Ya registraste tu salida hoy'
            ], 422);
        }

        $asistencia->update([
            'hora_inicio_almuerzo' => $ahora->format('H:i:s'),
            'fecha_modificacion' => $ahora,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Inicio de almuerzo registrado a las {$ahora->format('H:i')}",
            'data' => [
                'hora_inicio_almuerzo' => $ahora->format('H:i'),
                'hora_inicio_almuerzo_raw' => $ahora->format('H:i:s'),
            ]
        ]);
    }

    /**
     * POST /asistencia/marcar-fin-almuerzo
     */
    public function marcarFinAlmuerzo(Request $request)
    {
        $idPersonal = $request->user()?->id ?? $request->input('id_personal', 1);
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();

        $asistencia = RrhhAsistencia::where('id_personal', $idPersonal)
            ->where('fecha', $hoy)
            ->where('tipo_registro', 'Oficina')
            ->first();

        if (!$asistencia) {
            return response()->json([
                'success' => false,
                'message' => 'No has marcado entrada hoy'
            ], 422);
        }

        if (!$asistencia->hora_inicio_almuerzo) {
            return response()->json([
                'success' => false,
                'message' => 'No has marcado inicio de almuerzo'
            ], 422);
        }

        if ($asistencia->hora_fin_almuerzo) {
            return response()->json([
                'success' => false,
                'message' => 'Ya registraste tu regreso de almuerzo hoy'
            ], 422);
        }

        // Calcular duración del almuerzo y exceso (45 min permitidos)
        $inicioAlmuerzo = Carbon::parse($hoy . ' ' . $asistencia->hora_inicio_almuerzo);
        $duracionMinutos = (int) $inicioAlmuerzo->diffInMinutes($ahora);
        $excesoMinutos = max(0, $duracionMinutos - 45);

        $asistencia->update([
            'hora_fin_almuerzo' => $ahora->format('H:i:s'),
            'exceso_almuerzo_minutos' => $excesoMinutos,
            'fecha_modificacion' => $ahora,
        ]);

        $mensaje = "Regreso de almuerzo registrado a las {$ahora->format('H:i')} - Duración: {$duracionMinutos} min";
        if ($excesoMinutos > 0) {
            $mensaje .= " (exceso: {$excesoMinutos} min)";
        }

        return response()->json([
            'success' => true,
            'message' => $mensaje,
            'data' => [
                'hora_fin_almuerzo' => $ahora->format('H:i'),
                'duracion_minutos' => $duracionMinutos,
                'exceso_almuerzo_minutos' => $excesoMinutos,
            ]
        ]);
    }
}
