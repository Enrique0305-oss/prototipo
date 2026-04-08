<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleOrdenFabricacion extends Model
{
    protected $table = 'detalle_orden_fabricacion';

    public $timestamps = false;

    protected $fillable = [
        'id_orden_fabricacion',
        'id_producto_final',
        'cantidad',
        'receta_snapshot',
        'insumos_requeridos',
    ];

    protected $casts = [
        'cantidad' => 'float',
        'receta_snapshot' => 'array',
        'insumos_requeridos' => 'array',
    ];

    public function orden()
    {
        return $this->belongsTo(OrdenFabricacion::class, 'id_orden_fabricacion');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto_final');
    }
}
