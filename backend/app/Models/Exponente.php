<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Exponente extends Model
{
    protected $table = 'exponentes';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellidos',
        'presentacion',
        'especialidad',
        'profesion',
        'telefono',
        'email',
        'institucion',
        'notas',
        'estado',
        'id_tecnico_vinculado',
    ];

    public function ordenes()
    {
        return $this->belongsToMany(
            OrdenCapacitacionAuditoria::class,
            'orden_capacitacion_ponentes',
            'id_exponente',
            'id_orden_capacitacion'
        );
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim($this->nombre . ' ' . $this->apellidos);
    }

    public function tecnicoVinculado(): BelongsTo
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico_vinculado');
    }
}
