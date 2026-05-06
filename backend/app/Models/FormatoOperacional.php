<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormatoOperacional extends Model
{
    protected $table = 'formatos_operacionales';

    protected $fillable = [
        'codigo_documento',
        'version',
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
        'observaciones',
        'fecha_finalizacion',
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora_llegada' => 'datetime:H:i',
        'hora_inicio' => 'datetime:H:i',
        'hora_final' => 'datetime:H:i',
        'fecha_finalizacion' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

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

    public function detalles()
    {
        return $this->hasMany(FormatoOperacionalDetalle::class, 'id_formato_operacional')->orderBy('orden_caja');
    }

    public function esBorrador(): bool
    {
        return $this->estado === 'borrador';
    }

    public function esCompletado(): bool
    {
        return $this->estado === 'completada';
    }

    public function marcarCompletado(): void
    {
        $this->estado = 'completada';
        $this->fecha_finalizacion = now();
        $this->save();
    }
}