<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatalogoCapacitacionAuditoria extends Model
{
    protected $table = 'catalogo_capacitacion_auditoria';

    public $timestamps = false;

    protected $fillable = [
        'tipo',
        'nombre',
        'descripcion',
        'precio_referencial',
        'duracion_horas',
        'estado',
    ];

    protected $casts = [
        'precio_referencial' => 'decimal:2',
        'duracion_horas' => 'integer',
    ];

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeCapacitaciones($query)
    {
        return $query->where('tipo', 'Capacitación');
    }

    public function scopeAuditorias($query)
    {
        return $query->where('tipo', 'Auditoría');
    }
}
