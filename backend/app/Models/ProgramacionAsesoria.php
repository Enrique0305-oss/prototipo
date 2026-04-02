<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionAsesoria extends Model
{
    protected $table = 'programacion_asesoria';

    protected $fillable = [
        'id_orden_asesoria',
        'id_supervisor',
        'id_vehiculo',
        'id_cliente_planta',
        'id_cliente_planta_area',
        'fecha_programada',
        'hora_inicio',
        'hora_fin',
        'local_sede',
        'direccion_completa',
        'modalidad_visita',
        'estado_ejecucion',
        'observaciones',
        'creado_por',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'hora_inicio' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
    ];

    public function ordenAsesoria()
    {
        return $this->belongsTo(OrdenAsesoria::class, 'id_orden_asesoria');
    }

    public function supervisor()
    {
        return $this->belongsTo(Personal::class, 'id_supervisor');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
    }

    public function planta()
    {
        return $this->belongsTo(ClientePlanta::class, 'id_cliente_planta');
    }

    public function area()
    {
        return $this->belongsTo(ClientePlantaArea::class, 'id_cliente_planta_area');
    }

    public function exponentes()
    {
        return $this->belongsToMany(
            Exponente::class,
            'programacion_asesoria_exponentes',
            'id_programacion_asesoria',
            'id_exponente'
        )->withTimestamps();
    }
}
