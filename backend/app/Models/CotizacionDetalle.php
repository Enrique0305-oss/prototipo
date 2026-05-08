<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CotizacionDetalle extends Model
{
    protected $table = 'cotizacion_detalle';
    
    public $timestamps = false;

    protected $fillable = [
        'id_cotizacion',
        'es_servicio_extra',
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
        'fosfina_cantidad',
        'meses_implementacion',
        'frecuencia_visita',
        'horario_auditoria'
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
        'horas_capacitacion' => 'integer',
        'num_participantes' => 'integer',
        'fecha_servicio' => 'date',
        'medida_tanque' => 'array',
        'meses_implementacion' => 'integer',
        'frecuencia_visita' => 'array',
        'horario_auditoria' => 'array',
        'id_cliente_planta_area' => 'array',
        'es_servicio_extra' => 'boolean',
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

    /**
     * Obtener todas las áreas del detalle (cuando hay múltiples)
     */
    public function areas()
    {
        $areaIds = $this->id_cliente_planta_area ?? [];
        if (empty($areaIds)) {
            return collect();
        }
        return ClientePlantaArea::whereIn('id', $areaIds)->get();
    }

    // Accessor para calcular subtotal
    public function getSubtotalAttribute()
    {
        return $this->cantidad * $this->precio_unitario;
    }
}
