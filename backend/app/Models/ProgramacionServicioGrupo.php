<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionServicioGrupo extends Model
{
    protected $table = 'programacion_servicio_grupos';

    protected $fillable = [
        'fecha_programada',
        'hora_inicio',
        'hora_fin',
        'id_cliente',
        'id_cliente_planta',
        'tecnicos_ids',
        'cantidad_programaciones',
        'observaciones',
        'creado_por',
        'modificado_por',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'tecnicos_ids' => 'array',
        'cantidad_programaciones' => 'integer',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function planta()
    {
        return $this->belongsTo(ClientePlanta::class, 'id_cliente_planta');
    }

    public function creador()
    {
        return $this->belongsTo(Personal::class, 'creado_por');
    }

    public function modificador()
    {
        return $this->belongsTo(Personal::class, 'modificado_por');
    }

    public function programaciones()
    {
        return $this->hasMany(ProgramacionServicio::class, 'id_grupo_programacion');
    }
}