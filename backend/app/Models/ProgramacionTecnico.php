<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionTecnico extends Model
{
    protected $table = 'programacion_tecnicos';

    protected $fillable = [
        'id_programacion',
        'id_tecnico',
        'rol',
    ];

    // Relaciones
    public function programacion()
    {
        return $this->belongsTo(ProgramacionServicio::class, 'id_programacion');
    }

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico');
    }
}
