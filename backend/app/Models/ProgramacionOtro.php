<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionOtro extends Model
{
    protected $table = 'programacion_otros';

    protected $appends = [
        'personal_administrativo',
    ];

    protected $fillable = [
        'motivo',
        'id_tecnico_asignado',
        'tecnicos_ids',
        'id_supervisor',
        'id_vehiculo',
        'fecha_programada',
        'hora_inicio',
        'hora_fin',
        'ubicacion_manual',
        'estado_ejecucion',
        'observaciones',
        'creado_por',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'hora_inicio' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
        'tecnicos_ids' => 'array',
        'id_supervisor' => 'array',
    ];

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico_asignado');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo');
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
