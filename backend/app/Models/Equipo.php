<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    protected $table = 'equipo';
    
    public $timestamps = false;
    
    protected $fillable = [
        'descripcion',
        'marca',
        'modelo',
        'serie',
        'encargado',
        'responsable',
        'contacto',
        'estado'
    ];

    // Relaciones
    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'id_equipo');
    }

    public function programacionesServicio()
    {
        return $this->hasMany(ProgramacionServicio::class, 'id_vehiculo');
    }

    public function programacionesMantenimiento()
    {
        return $this->hasMany(ProgramacionMantenimiento::class, 'id_equipo');
    }

    public function ordenesServicio()
    {
        return $this->hasMany(OrdenServicioEquipo::class, 'id_equipo');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Activo');
    }
}