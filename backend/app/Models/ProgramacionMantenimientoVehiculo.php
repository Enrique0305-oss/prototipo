<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionMantenimientoVehiculo extends Model
{
    protected $table = 'programacion_mantenimiento_vehiculo';

    public $timestamps = false;

    protected $fillable = [
        'id_vehiculo',
        'motivo',
        'anio',
        'frecuencia_meses',
        'fecha_inicio',
        'total_programados',
        'observaciones',
    ];

    protected $casts = [
        'anio' => 'integer',
        'frecuencia_meses' => 'integer',
        'total_programados' => 'integer',
        'fecha_inicio' => 'date',
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
    }

    public function mantenimientos()
    {
        return $this->hasMany(MantenimientoVehiculo::class, 'id_programacion');
    }
}
