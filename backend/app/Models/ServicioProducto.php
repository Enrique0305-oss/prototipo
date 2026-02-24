<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicioProducto extends Model
{
    protected $table = 'servicio_producto';
    public $timestamps = false;

    protected $fillable = [
        'id_servicio',
        'id_producto',
        'cantidad_default',
        'observacion',
    ];

    protected $casts = [
        'cantidad_default' => 'decimal:2',
    ];

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }
}
