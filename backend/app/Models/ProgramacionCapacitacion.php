<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramacionCapacitacion extends Model
{
    protected $table = 'programacion_capacitacion';

    protected $fillable = [
        'id_orden_capacitacion',
        'id_supervisor',
        'id_vehiculo',
        'id_tecnico_conductor',
        'id_cliente_planta',
        'id_cliente_planta_area',
        'fecha_programada',
        'hora_inicio',
        'hora_fin',
        'motivo',
        'motivo_otro',
        'local_sede',
        'direccion_completa',
        'estado_ejecucion',
        'observaciones',
        'creado_por',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'hora_inicio' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
    ];

    public function ordenCapacitacion()
    {
        return $this->belongsTo(OrdenCapacitacionAuditoria::class, 'id_orden_capacitacion');
    }

    public function supervisor()
    {
        return $this->belongsTo(Personal::class, 'id_supervisor');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
    }

    public function tecnicoConductor(): BelongsTo
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico_conductor');
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
            'programacion_capacitacion_exponentes',
            'id_programacion_capacitacion',
            'id_exponente'
        )->withTimestamps();
    }
}
