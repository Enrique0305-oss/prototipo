<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenServicioEquipo extends Model
{
    protected $table = 'orden_servicio_equipo';
    public $timestamps = false;

    protected $fillable = [
        'id_orden_servicio',
        'id_servicio',
        'id_equipo',
        'observacion',
    ];

    public function ordenServicio()
    {
        return $this->belongsTo(OrdenServicio::class, 'id_orden_servicio');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'id_equipo');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }
}
