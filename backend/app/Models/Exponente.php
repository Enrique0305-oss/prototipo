<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exponente extends Model
{
    protected $table = 'exponentes';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellidos',
        'especialidad',
        'profesion',
        'telefono',
        'email',
        'institucion',
        'notas',
        'estado',
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
}
