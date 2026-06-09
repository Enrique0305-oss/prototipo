<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FichaOperacional extends Model
{
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->correlativo) {
                $lastRecord = static::whereNotNull('correlativo')
                    ->where('correlativo', 'LIKE', 'FO-%')
                    ->orderBy('id', 'desc')
                    ->first();
                
                $lastNumber = 0;
                if ($lastRecord && preg_match('/FO-(\d+)/', $lastRecord->correlativo, $matches)) {
                    $lastNumber = (int) $matches[1];
                }
                
                $model->correlativo = 'FO-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    protected $table = 'fichas_operacionales';

    protected $fillable = [
        'correlativo',
        'id_programacion_servicio',
        'id_grupo_programacion',
        'id_usuario_creador',
        'estado',
        'cliente',
        'direccion',
        'fecha',
        'hora_llegada',
        'hora_inicio',
        'hora_final',
        'giro',
        'diagnostico',
        'condicion_sanitaria',
        'actividades_realizadas',
        'equipos',
        'insumos_utilizados',
        'areas_tratadas',
        'acciones_correctivas',
        'recomendaciones',
        'firmas',
        'observaciones',
        'fecha_finalizacion',
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora_llegada' => 'datetime:H:i',
        'hora_inicio' => 'datetime:H:i',
        'hora_final' => 'datetime:H:i',
        'actividades_realizadas' => 'array',
        'equipos' => 'array',
        'insumos_utilizados' => 'array',
        'areas_tratadas' => 'array',
        'firmas' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'fecha_finalizacion' => 'datetime',
    ];

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    // Relaciones
    public function programacionServicio()
    {
        return $this->belongsTo(ProgramacionServicio::class, 'id_programacion_servicio');
    }

    public function programacionServicioGrupo()
    {
        return $this->belongsTo(ProgramacionServicioGrupo::class, 'id_grupo_programacion');
    }

    public function usuarioCreador()
    {
        return $this->belongsTo(Personal::class, 'id_usuario_creador');
    }

    // Métodos helper
    public function esBorrador(): bool
    {
        return $this->estado === 'borrador';
    }

    public function esCompletada(): bool
    {
        return $this->estado === 'completada';
    }

    public function marcarCompletada(): void
    {
        $this->estado = 'completada';
        $this->fecha_finalizacion = now();
        $this->save();
    }
}
