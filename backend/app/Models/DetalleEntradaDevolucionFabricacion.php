<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleEntradaDevolucionFabricacion extends Model
{
    protected $table = 'detalle_entrada_devolucion_fabricacion';

    protected $fillable = [
        'id_entrada_devolucion_fabricacion',
        'tipo',
        'id_producto',
        'cantidad',
        'observacion',
    ];

    protected $casts = [
        'cantidad' => 'decimal:3',
    ];

    public const TIPO_ENTRADA_PRODUCTO = 'EntradaProducto';
    public const TIPO_DEVOLUCION_INSUMO = 'DevolucionInsumo';
    public const TIPO_CONSUMO_DIFERENCIA_INSUMO = 'ConsumoDiferenciaInsumo';

    public function entradaDevolucionFabricacion()
    {
        return $this->belongsTo(EntradaDevolucionFabricacion::class, 'id_entrada_devolucion_fabricacion');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }
}
