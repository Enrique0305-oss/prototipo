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
        'id_cliente_planta',
        'id_cliente_planta_area',
        'descripcion_manual',
        'cantidad',
        'precio_unitario',
        'frecuencia_sugerida',
        'modalidad_sugerida',
        'op_tecnicos',
        'supervisor',
        'horas_capacitacion',
        'num_participantes',
        'fecha_servicio',
        'medida_tanque',
        'fosfina_producto',
        'fosfina_cantidad'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
        'horas_capacitacion' => 'decimal:2',
        'num_participantes' => 'integer',
        'fecha_servicio' => 'date',
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

    public function planta()
    {
        return $this->belongsTo(ClientePlanta::class, 'id_cliente_planta');
    }

    public function area()
    {
        return $this->belongsTo(ClientePlantaArea::class, 'id_cliente_planta_area');
    }

    // Accessor para calcular subtotal
    public function getSubtotalAttribute()
    {
        return $this->cantidad * $this->precio_unitario;
    }
}
