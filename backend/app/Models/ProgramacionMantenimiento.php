<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionMantenimiento extends Model
{
    protected $table = 'programacion_mantenimiento';
    
    public $timestamps = false;
    
    protected $fillable = [
        'id_equipo',
        'id_actmanten',
        'anio',
        'frecuencia_meses',
        'fecha_inicio',
        'total_programados',
        'observaciones',
        'es_prueba',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'anio' => 'integer',
        'frecuencia_meses' => 'integer',
        'total_programados' => 'integer',
        'es_prueba' => 'boolean',
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'id_equipo');
    }

    public function actividad()
    {
        return $this->belongsTo(ActividadMantenimiento::class, 'id_actmanten');
    }

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'id_programacion');
    }
}
