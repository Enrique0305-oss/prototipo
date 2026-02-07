<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionServicio extends Model
{
    protected $table = 'programacion_servicio';
    
    protected $fillable = [
        'id_orden_servicio',
        'id_orden_capacitacion',
        'id_servicio',
        'id_tecnico_asignado',
        'id_supervisor',
        'id_vehiculo',
        'fecha_programada',
        'hora_inicio',
        'hora_fin',
        'duracion_real',
        'local_sede',
        'direccion_completa',
        'coordenadas',
        'estado_ejecucion',
        'fecha_ejecucion_real',
        'certificado_generado',
        'ruta_pdf_certificado',
        'ruta_pdf_agenda',
        'fotos_evidencia',
        'firma_cliente',
        'calificacion_cliente',
        'observaciones',
        'creado_por',
        'modificado_por'
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'hora_inicio' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
        'fecha_ejecucion_real' => 'datetime',
        'duracion_real' => 'integer',
        'certificado_generado' => 'boolean',
        'calificacion_cliente' => 'integer',
        'fecha_creacion' => 'datetime',
        'fecha_modificacion' => 'datetime',
    ];

    const CREATED_AT = 'fecha_creacion';
    const UPDATED_AT = 'fecha_modificacion';

    // Relaciones
    public function ordenServicio()
    {
        return $this->belongsTo(OrdenServicio::class, 'id_orden_servicio');
    }

    public function ordenCapacitacion()
    {
        return $this->belongsTo(OrdenCapacitacionAuditoria::class, 'id_orden_capacitacion');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico_asignado');
    }

    public function supervisor()
    {
        return $this->belongsTo(Personal::class, 'id_supervisor');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
    }

    public function creador()
    {
        return $this->belongsTo(Personal::class, 'creado_por');
    }

    // Scopes
    public function scopeProgramados($query)
    {
        return $query->where('estado_ejecucion', 'Programado');
    }

    public function scopeEjecutados($query)
    {
        return $query->where('estado_ejecucion', 'Realizado');
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha_programada', $fecha);
    }
}
