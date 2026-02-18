<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CotizacionDetalle extends Model
{
    protected $table = 'cotizacion_detalle';
    
    public $timestamps = false;

    protected $fillable = [
        'id_cotizacion',
        'id_servicio',
        'id_producto',
        'id_catalogo_cap_aud',
        'descripcion_manual',
        'cantidad',
        'precio_unitario',
        'frecuencia_sugerida',
        'modalidad_sugerida'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
    ];

    // Relaciones
    public function cotizacion()
    {
        return $this->belongsTo(Cotizacion::class, 'id_cotizacion');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    public function catalogoCapAud()
    {
        return $this->belongsTo(CatalogoCapacitacionAuditoria::class, 'id_catalogo_cap_aud');
    }

    // Accessor para calcular subtotal
    public function getSubtotalAttribute()
    {
        return $this->cantidad * $this->precio_unitario;
    }
}
