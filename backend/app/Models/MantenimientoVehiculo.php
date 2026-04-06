<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MantenimientoVehiculo extends Model
{
    protected $table = 'mantenimiento_vehiculo';

    protected $fillable = [
        'id_programacion',
        'id_vehiculo',
        'motivo',
        'tipo_mantenimiento',
        'fecha_programada',
        'fecha_realizado',
        'kilometraje',
        'observaciones',
        'estado',
    ];

    protected $casts = [
        'fecha_programada' => 'datetime',
        'fecha_realizado' => 'datetime',
        'kilometraje' => 'integer',
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
    }

    public function programacion()
    {
        return $this->belongsTo(ProgramacionMantenimientoVehiculo::class, 'id_programacion');
    }
}
