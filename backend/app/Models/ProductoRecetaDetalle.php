<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoRecetaDetalle extends Model
{
    protected $table = 'producto_receta_detalle';

    public $timestamps = false;

    protected $fillable = [
        'id_producto_final',
        'id_producto_insumo',
        'cantidad',
        'unidad',
        'observacion',
    ];

    protected $casts = [
        'cantidad' => 'decimal:3',
    ];

    public function productoFinal()
    {
        return $this->belongsTo(Producto::class, 'id_producto_final');
    }

    public function insumo()
    {
        return $this->belongsTo(Producto::class, 'id_producto_insumo');
    }
}
