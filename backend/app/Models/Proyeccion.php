<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proyeccion extends Model
{
    use HasFactory;

    protected $table = 'proyecciones';

    // Activamos timestamps (agregados por migración si faltan)
    public $timestamps = true;

    protected $fillable = [
        'actividad',
        'id_multicim',
        'tipo_orden',
        'id_referencia',
        'id_orden_servicio',
        'id_orden_producto',
        'id_orden_capacitacion_auditoria',
        'n_factura',
        'monto_detrax',
        'total_final',
        'fecha_factura',
        'dias_credito',
        'fecha_vcto',
        'dia_vencer',
        'fecha_pago',
        'fecha_ejecucion',
        'estado',
        'fecha_cambio_estado',
        'registrado_por',
        'base_imponible',
        'igv',
        'porcentaje_detraccion',
        'fecha_pago_detraccion',
        'cotizacion_oc',
        'observaciones'
    ];

    // Casts para asegurar que los números y fechas se manejen correctamente
    protected $casts = [
        'monto_detrax' => 'decimal:2',
        'total_final' => 'decimal:2',
        'fecha_ejecucion' => 'date',
        'fecha_factura' => 'date',
        'fecha_vcto' => 'date',
        'fecha_pago' => 'date',
        'dias_credito' => 'integer',
        'dia_vencer' => 'integer',
        'id_referencia' => 'integer',
        'tipo_orden' => 'string',
        'fecha_cambio_estado' => 'datetime',
        'fecha_pago_detraccion' => 'date',
        'base_imponible' => 'decimal:2',
        'igv' => 'decimal:2',
        'porcentaje_detraccion' => 'decimal:2'
    ];

    /*
    Relaciones 
    */

    public function multicimEmisora()
    {
        return $this->belongsTo(Multicim::class, 'id_multicim');
    }

    public function ordenServicio()
    {
        return $this->belongsTo(OrdenServicio::class, 'id_orden_servicio');
    }

    public function ordenProducto()
    {
        return $this->belongsTo(OrdenProducto::class, 'id_orden_producto');
    }

    public function ordenCapacitacion()
    {
        return $this->belongsTo(OrdenCapacitacionAuditoria::class, 'id_orden_capacitacion_auditoria');
    }

    public function ordenAuditoria()
    {
        return $this->belongsTo(OrdenAuditoria::class, 'id_referencia');
    }

    public function ordenAsesoria()
    {
        return $this->belongsTo(OrdenAsesoria::class, 'id_referencia');
    }
}