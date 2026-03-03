<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proyeccion extends Model
{
    use HasFactory;

    protected $table = 'proyecciones';

    // Desactivamos timestamps si no los agregaste en el script SQL
    public $timestamps = false;

    protected $fillable = [
        'actividad',
        'id_multicim',
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
        'fecha_ejecucion'
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
}