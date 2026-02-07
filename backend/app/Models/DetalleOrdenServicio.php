<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleOrdenServicio extends Model
{
    protected $table = 'detalle_orden_servicio';
    
    public $timestamps = false;
    
    protected $fillable = [
        'id_orden_servicio',
        'id_servicio',
        'local',
        'frecuencia',
        'precio'
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    // Relaciones
    public function ordenServicio()
    {
        return $this->belongsTo(OrdenServicio::class, 'id_orden_servicio');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }
}
