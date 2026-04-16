<?php

use App\Models\Area;
use App\Models\Personal;
use App\Models\RrhhAsistencia;
use Carbon\Carbon;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
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

Artisan::command('usuario:crear-it-prueba {--nombre=IT} {--apellidos=Demo} {--usuario=it.demo} {--correo=it.demo@qsci.com} {--celular=999999999} {--password=Password123!} {--force}', function () {
    $area = Area::whereRaw('LOWER(nombre) = ?', ['it'])->first();

    if (!$area) {
        $area = Area::create([
            'nombre' => 'IT',
            'estado' => 'Activo',
        ]);
    }

    if ($area->estado !== 'Activo') {
        $area->update(['estado' => 'Activo']);
    }

    $usuario = trim((string) $this->option('usuario'));
    $correo = trim((string) $this->option('correo'));
    $nombre = trim((string) $this->option('nombre'));
    $apellidos = trim((string) $this->option('apellidos'));
    $celular = trim((string) $this->option('celular'));
    $password = (string) $this->option('password');

    $personal = Personal::where('usuario', $usuario)
        ->orWhere('correo', $correo)
        ->first();

    $data = [
        'nombre' => $nombre,
        'apellidos' => $apellidos,
        'celular' => $celular,
        'correo' => $correo,
        'id_area' => $area->id,
        'id_cargo' => null,
        'usuario' => $usuario,
        'password' => Hash::make($password),
        'estado' => 'Activo',
    ];

    if ($personal) {
        if (!$this->option('force')) {
            $this->warn("Ya existe un usuario con usuario/correo coincidente: {$personal->usuario} / {$personal->correo}");
            $this->line('Usa --force para actualizarlo.');
            return;
        }

        $personal->update($data);
        $this->info("Usuario IT actualizado: {$personal->nombre} {$personal->apellidos}");
        $this->line("ID: {$personal->id}");
        $this->line("Área: {$area->nombre}");
        return;
    }

    $personal = Personal::create($data);

    $this->info("Usuario IT creado: {$personal->nombre} {$personal->apellidos}");
    $this->line("ID: {$personal->id}");
    $this->line("Usuario: {$personal->usuario}");
    $this->line("Correo: {$personal->correo}");
    $this->line("Área: {$area->nombre}");
})->purpose('Crea o actualiza un usuario de prueba en el área IT');

Schedule::command('asistencia:auto-cerrar')->everyMinute()->withoutOverlapping();
