<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenCompra extends Model
{
    protected $table = 'ordenes_compra';

    protected $fillable = [
        'numero_orden_compra',
        'numero_cotizacion_proveedor',
        'numero_factura',
        'id_proveedor',
        'fecha_compra',
        'fecha_recepcion',
        'tipo_moneda',
        'tipo_cambio',
        'tiene_igv',
        'subtotal',
        'igv',
        'total',
        'estado',
        'id_usuario',
        'observaciones',
    ];

    protected $casts = [
        'fecha_compra'    => 'date',
        'fecha_recepcion' => 'date',
        'tiene_igv'       => 'boolean',
        'subtotal'        => 'float',
        'igv'             => 'float',
        'total'           => 'float',
        'tipo_cambio'     => 'float',
        'created_at'      => 'datetime',
        'updated_at'      => 'datetime',
    ];

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleOrdenCompra::class, 'id_orden_compra');
    }

    public function usuario()
    {
        return $this->belongsTo(Personal::class, 'id_usuario');
    }
}
