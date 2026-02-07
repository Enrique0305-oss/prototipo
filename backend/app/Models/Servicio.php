<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    protected $table = 'servicios';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
        'duracion_estimada',
        'requiere_movilidad',
        'requiere_certificado',
        'plantilla_certificado'
    ];

    protected $casts = [
        'requiere_movilidad' => 'boolean',
        'requiere_certificado' => 'boolean',
    ];

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }
}
