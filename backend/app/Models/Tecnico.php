<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'estado',
        'id_personal',
        'id_exponente_vinculado',
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

    public function exponenteVinculado(): BelongsTo
    {
        return $this->belongsTo(Exponente::class, 'id_exponente_vinculado');
    }

    public function personal(): BelongsTo
    {
        return $this->belongsTo(Personal::class, 'id_personal');
    }
}
