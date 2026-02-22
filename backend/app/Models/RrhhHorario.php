<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RrhhHorario extends Model
{
    protected $table = 'rrhh_horarios';

    public $timestamps = false;

    protected $fillable = [
        'id_personal',
        'id_tecnico',
        'dia_semana',
        'hora_entrada_esperada',
        'hora_salida_esperada',
        'tolerancia_minutos',
        'activo',
        'es_descanso',
    ];

    protected $casts = [
        'tolerancia_minutos' => 'integer',
        'activo' => 'boolean',
        'es_descanso' => 'boolean',
    ];

    // Relaciones
    public function personal()
    {
        return $this->belongsTo(Personal::class, 'id_personal');
    }
}
