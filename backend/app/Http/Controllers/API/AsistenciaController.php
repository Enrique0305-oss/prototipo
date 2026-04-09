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

    /**
     * Cierra automáticamente una asistencia abierta cuando ya llegó la hora de salida asignada.
     */
    private function cerrarAsistenciaAutomaticaSiCorresponde(RrhhAsistencia $asistencia, Carbon $momentoReferencia): void
    {
        if ($asistencia->hora_salida || !$asistencia->hora_entrada || !$asistencia->hora_esperada_salida) {
            return;
        }

        $fechaAsistencia = Carbon::parse($asistencia->fecha)->toDateString();
        $horaSalidaProgramada = Carbon::parse($fechaAsistencia . ' ' . $asistencia->hora_esperada_salida);

        if ($momentoReferencia->lt($horaSalidaProgramada)) {
            return;
        }

        $horaEntrada = Carbon::parse($fechaAsistencia . ' ' . $asistencia->hora_entrada);
        $minutosTrabajados = $horaSalidaProgramada->gt($horaEntrada)
            ? $horaEntrada->diffInMinutes($horaSalidaProgramada)
            : 0;

        $horasTrabajadas = round($minutosTrabajados / 60, 2);

        if ($asistencia->exceso_almuerzo_minutos > 0) {
            $horasTrabajadas = max(0, round($horasTrabajadas - ($asistencia->exceso_almuerzo_minutos / 60), 2));
        }

        $tiempoExtraMinutos = 0;
        if ($asistencia->horas_extra_asignadas && $asistencia->hora_inicio_extra) {
            $horaInicioExtra = Carbon::parse($fechaAsistencia . ' ' . $asistencia->hora_inicio_extra);
            if ($horaSalidaProgramada->gt($horaInicioExtra)) {
                $tiempoExtraMinutos = (int) $horaInicioExtra->diffInMinutes($horaSalidaProgramada);
            }
        }

        $estado = $asistencia->estado;
        if ($estado === 'Incompleto') {
            $estado = 'Puntual';
        }

        $asistencia->update([
            'hora_salida' => $horaSalidaProgramada->format('H:i:s'),
            'horas_trabajadas' => $horasTrabajadas,
            'tiempo_extra_minutos' => $tiempoExtraMinutos,
            'estado' => $estado,
            'fecha_modificacion' => $momentoReferencia,
        ]);
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

        // Auto-cierre si la asistencia sigue abierta y ya llegó su hora de salida programada.
        if ($asistenciaHoy) {
            $this->cerrarAsistenciaAutomaticaSiCorresponde($asistenciaHoy, $ahora);
            $asistenciaHoy->refresh();
        }

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

        if ($fecha === $hoy) {
            foreach ($asistencias as $asistencia) {
                $this->cerrarAsistenciaAutomaticaSiCorresponde($asistencia, $ahora);
                $asistencia->refresh();
            }
        }

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
