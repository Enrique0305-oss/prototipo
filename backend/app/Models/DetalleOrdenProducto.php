<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleOrdenProducto extends Model
{
    protected $table = 'detalle_orden_producto';
    
    public $timestamps = false;
    
    protected $fillable = [
        'id_orden_producto',
        'id_producto',
        'id_lote',
        'cantidad',
        'precio_unitario',
        'subtotal'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // Relaciones
    public function ordenProducto()
    {
        return $this->belongsTo(OrdenProducto::class, 'id_orden_producto');
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
