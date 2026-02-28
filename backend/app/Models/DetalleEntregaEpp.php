<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleEntregaEpp extends Model
{
    protected $table = 'detalle_entrega_epp';

    public $timestamps = false;

    protected $fillable = [
        'id_entrega_epp',
        'id_producto',
        'cantidad',
        'observacion',
        'condicion_devolucion',
        'observacion_devolucion',
    ];

    protected $casts = [
        'cantidad' => 'integer',
    ];

    // Relaciones
    public function entregaEpp()
    {
        return $this->belongsTo(EntregaEpp::class, 'id_entrega_epp');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }
}
