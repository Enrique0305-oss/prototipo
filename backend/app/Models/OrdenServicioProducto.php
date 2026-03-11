<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenServicioProducto extends Model
{
    protected $table = 'orden_servicio_producto';
    public $timestamps = false;

    protected $fillable = [
        'id_orden_servicio',
        'id_servicio',
        'id_cliente_planta',
        'id_cliente_planta_area',
        'id_producto',
        'cantidad',
        'observacion',
    ];

    protected $casts = [
        'cantidad' => 'decimal:2',
    ];

    public function ordenServicio()
    {
        return $this->belongsTo(OrdenServicio::class, 'id_orden_servicio');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }

    public function planta()
    {
        return $this->belongsTo(ClientePlanta::class, 'id_cliente_planta');
    }

    public function area()
    {
        return $this->belongsTo(ClientePlantaArea::class, 'id_cliente_planta_area');
    }
}
