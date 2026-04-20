<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Lote;

class DetalleOrdenCompra extends Model
{
    protected $table = 'detalle_ordenes_compra';

    protected $fillable = [
        'id_orden_compra',
        'id_producto',
        'id_lote',
        'cantidad',
        'precio_unitario',
        'subtotal',
        'observacion',
    ];

    protected $casts = [
        'cantidad'       => 'integer',
        'precio_unitario'=> 'float',
        'subtotal'       => 'float',
    ];

    public function ordenCompra()
    {
        return $this->belongsTo(OrdenCompra::class, 'id_orden_compra');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    public function lote()
    {
        return $this->belongsTo(Lote::class, 'id_lote');
    }
}
