<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $table = 'vehiculos';
    
    public $timestamps = false;
    
    protected $fillable = [
        'placa',
        'modelo',
        'marca',
        'anio',
        'capacidad_carga',
        'estado'
    ];

    protected $casts = [
        'anio' => 'integer',
        'capacidad_carga' => 'decimal:2',
    ];

    // Relaciones
    public function programaciones()
    {
        return $this->hasMany(ProgramacionServicio::class, 'id_vehiculo');
    }

    // Scopes
    public function scopeDisponibles($query)
    {
        return $query->where('estado', 'Disponible');
    }
}
