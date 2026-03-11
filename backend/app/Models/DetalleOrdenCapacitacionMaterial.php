<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleOrdenCapacitacionMaterial extends Model
{
    protected $table = 'detalle_orden_capacitacion_materiales';

    public $timestamps = false;

    protected $fillable = [
        'id_orden_capacitacion',
        'material',
        'cantidad',
        'disposicion'
    ];

    public function orden()
    {
        return $this->belongsTo(OrdenCapacitacionAuditoria::class, 'id_orden_capacitacion');
    }
}