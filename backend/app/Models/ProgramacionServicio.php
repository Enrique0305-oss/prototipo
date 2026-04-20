<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionServicio extends Model
{
    protected $table = 'programacion_servicio';

    protected $appends = [
        'personal_administrativo',
    ];
    
    protected $fillable = [
        'id_orden_servicio',
        'id_orden_capacitacion',
        'id_servicio',
        'id_tecnico_asignado',
        'id_supervisor',
        'id_vehiculo',
        'id_grupo_programacion',
        'fecha_programada',
        'dias_semana',
        'hora_inicio',
        'hora_fin',
        'duracion_real',
        'id_cliente_planta',
        'id_cliente_planta_area',
        'local_sede',
        'direccion_completa',
        'latitud',
        'longitud',
        'estado_ejecucion',
        'requiere_asignacion_recursos',
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
        'requiere_asignacion_recursos' => 'boolean',
        'fecha_creacion' => 'datetime',
        'fecha_modificacion' => 'datetime',
        'id_supervisor' => 'array',
        'fotos_evidencia' => 'array',
        'latitud' => 'float',
        'longitud' => 'float',
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

    public function planta()
    {
        return $this->belongsTo(ClientePlanta::class, 'id_cliente_planta');
    }

    public function area()
    {
        return $this->belongsTo(ClientePlantaArea::class, 'id_cliente_planta_area');
    }

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico_asignado');
    }

    /**
     * Relación muchos a muchos con técnicos (tabla pivot programacion_tecnicos)
     */
    public function tecnicos()
    {
        return $this->belongsToMany(Tecnico::class, 'programacion_tecnicos', 'id_programacion', 'id_tecnico')
                    ->withPivot('rol')
                    ->withTimestamps('created_at', 'updated_at');
    }

    /**
     * Relación directa a registros de la tabla pivot
     */
    public function tecnicosAsignados()
    {
        return $this->hasMany(ProgramacionTecnico::class, 'id_programacion');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
    }

    public function grupoProgramacion()
    {
        return $this->belongsTo(ProgramacionServicioGrupo::class, 'id_grupo_programacion');
    }

    public function creador()
    {
        return $this->belongsTo(Personal::class, 'creado_por');
    }

    public function getPersonalAdministrativoAttribute(): array
    {
        $ids = $this->normalizePersonalIds($this->attributes['id_supervisor'] ?? null);
        if (empty($ids)) {
            return [];
        }

        return Personal::query()
            ->whereIn('id', $ids)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'apellidos'])
            ->map(fn (Personal $personal) => [
                'id' => $personal->id,
                'nombre' => $personal->nombre,
                'apellidos' => $personal->apellidos,
            ])
            ->all();
    }

    private function normalizePersonalIds(mixed $value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            }
        }

        if (is_int($value) || (is_string($value) && ctype_digit($value))) {
            return [(int) $value];
        }

        if (!is_array($value)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map('intval', $value), fn (int $id) => $id > 0)));
    }

    public function insumos()
    {
        return $this->hasMany(ProgramacionInsumo::class, 'id_programacion');
    }

    /**
     * Relación muchos a muchos con exponentes (tabla pivot programacion_exponentes)
     */
    public function exponentes()
    {
        return $this->belongsToMany(Exponente::class, 'programacion_exponentes', 'id_programacion', 'id_exponente')
                    ->withTimestamps();
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
