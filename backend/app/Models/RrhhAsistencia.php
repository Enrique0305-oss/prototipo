<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RrhhAsistencia extends Model
{
    protected $table = 'rrhh_asistencia';

    public $timestamps = false;

    protected $fillable = [
        'id_personal',
        'id_tecnico',
        'id_programacion',
        'fecha',
        'tipo_registro',
        'hora_entrada',
        'hora_salida',
        'hora_inicio_almuerzo',
        'hora_fin_almuerzo',
        'exceso_almuerzo_minutos',
        'hora_esperada_entrada',
        'hora_esperada_salida',
        'gps_entrada',
        'gps_salida',
        'distancia_cliente_metros',
        'dentro_rango_50m',
        'foto_entrada',
        'foto_salida',
        'fotos_servicio',
        'horas_trabajadas',
        'tardanza_minutos',
        'tiempo_extra_minutos',
        'horas_extra_asignadas',
        'hora_inicio_extra',
        'estado',
        'observaciones',
        'justificacion',
        'registrado_via',
        'fecha_creacion',
        'modificado_por',
        'fecha_modificacion',
    ];

    protected $casts = [
        'fecha' => 'date',
        'horas_trabajadas' => 'decimal:2',
        'tardanza_minutos' => 'integer',
        'tiempo_extra_minutos' => 'integer',
        'horas_extra_asignadas' => 'boolean',
        'exceso_almuerzo_minutos' => 'integer',
        'dentro_rango_50m' => 'boolean',
    ];

    // Relaciones
    public function personal()
    {
        return $this->belongsTo(Personal::class, 'id_personal');
    }
}
