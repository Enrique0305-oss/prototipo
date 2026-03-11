<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleOrdenCapacitacionEquipo extends Model
{
    protected $table = 'detalle_orden_capacitacion_equipos';

    public $timestamps = false;

    protected $fillable = [
        'id_orden_capacitacion',
        'equipo',
        'disposicion'
    ];

    public function orden()
    {
        return $this->belongsTo(OrdenCapacitacionAuditoria::class, 'id_orden_capacitacion');
    }
}