<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleOrdenAsesoria extends Model
{
    protected $table = 'detalle_orden_asesoria';

    public $timestamps = false;

    protected $fillable = [
        'id_orden_asesoria',
        'item',
        'descripcion',
    ];

    public function orden()
    {
        return $this->belongsTo(OrdenAsesoria::class, 'id_orden_asesoria');
    }
}
