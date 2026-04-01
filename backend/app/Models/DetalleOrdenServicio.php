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
        'id_cliente_planta',
        'id_cliente_planta_area',
        'local',
        'frecuencia',
        'precio'
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'id_cliente_planta_area' => 'array',
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
}
