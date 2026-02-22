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
        if ($ahora->lt($horaSalidaEsperada)) {
            $minutosRestantes = (int) $ahora->diffInMinutes($horaSalidaEsperada);
            return response()->json([
                'success' => false,
                'message' => "Aún faltan {$minutosRestantes} minutos para tu hora de salida ({$horaSalidaEsperada->format('H:i')})"
            ], 422);
        }

        // Calcular horas trabajadas
        $horaEntrada = Carbon::parse($hoy . ' ' . $asistencia->hora_entrada);
        $horasTrabajadas = round($horaEntrada->diffInMinutes($ahora) / 60, 2);

        // Calcular tiempo extra (si marcó después de hora_esperada_salida)
        $tiempoExtraMinutos = 0;
        if ($ahora->gt($horaSalidaEsperada)) {
            $tiempoExtraMinutos = (int) $horaSalidaEsperada->diffInMinutes($ahora);
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
        if ($tiempoExtraMinutos > 0) {
            $hExtra = floor($tiempoExtraMinutos / 60);
            $mExtra = $tiempoExtraMinutos % 60;
            $textoExtra = $hExtra > 0 ? "{$hExtra}h {$mExtra}m" : "{$mExtra} minutos";
            $mensaje .= " - Tiempo extra: {$textoExtra}";
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
}
