<?php

use App\Models\RrhhAsistencia;
use Carbon\Carbon;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('asistencia:auto-cerrar', function () {
    $ahora = Carbon::now();
    $hoy = $ahora->toDateString();

    $asistencias = RrhhAsistencia::query()
        ->where('fecha', $hoy)
        ->where('tipo_registro', 'Oficina')
        ->whereNotNull('hora_entrada')
        ->whereNull('hora_salida')
        ->whereNotNull('hora_esperada_salida')
        ->get();

    $cerrados = 0;

    foreach ($asistencias as $asistencia) {
        $fechaAsistencia = Carbon::parse($asistencia->fecha)->toDateString();
        $horaSalidaProgramada = Carbon::parse($fechaAsistencia . ' ' . $asistencia->hora_esperada_salida);

        if ($ahora->lt($horaSalidaProgramada)) {
            continue;
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

        $estado = $asistencia->estado === 'Incompleto' ? 'Puntual' : $asistencia->estado;

        $asistencia->update([
            'hora_salida' => $horaSalidaProgramada->format('H:i:s'),
            'horas_trabajadas' => $horasTrabajadas,
            'tiempo_extra_minutos' => $tiempoExtraMinutos,
            'estado' => $estado,
            'fecha_modificacion' => $ahora,
        ]);

        $cerrados++;
    }

    $this->info("Auto-cierre completado. Registros cerrados: {$cerrados}");
})->purpose('Cierra asistencias abiertas al llegar la hora de salida asignada');

Schedule::command('asistencia:auto-cerrar')->everyMinute()->withoutOverlapping();
