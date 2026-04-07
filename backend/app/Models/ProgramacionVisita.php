<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionVisita extends Model
{
    protected $table = 'programacion_visita';

    protected $appends = [
        'personal_administrativo',
    ];

    protected $fillable = [
        'id_cliente',
        'tipo_visita',
        'id_tecnico_asignado',
        'tecnicos_ids',
        'id_supervisor',
        'id_vehiculo',
        'id_cliente_planta',
        'id_cliente_planta_area',
        'fecha_programada',
        'hora_inicio',
        'hora_fin',
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
        'tecnicos_ids' => 'array',
        'id_cliente_planta_area' => 'array',
        'id_supervisor' => 'array',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico_asignado');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
    }

    public function planta()
    {
        return $this->belongsTo(ClientePlanta::class, 'id_cliente_planta');
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
}
