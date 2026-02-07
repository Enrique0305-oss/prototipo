<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tecnico extends Model
{
    protected $table = 'tecnicos';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'apellidos',
        'dni',
        'celular',
        'correo',
        'especialidad',
        'autorizado_conducir',
        'carga_maxima_semanal',
        'estado'
    ];

    protected $casts = [
        'autorizado_conducir' => 'boolean',
        'carga_maxima_semanal' => 'integer',
    ];

    // Relaciones
    public function programaciones()
    {
        return $this->hasMany(ProgramacionServicio::class, 'id_tecnico_asignado');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellidos}";
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Activo');
    }

    public function scopeAutorizadosConducir($query)
    {
        return $query->where('autorizado_conducir', true);
    }
}
