<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mantenimiento extends Model
{
    protected $table = 'mantenimiento';
    
    public $timestamps = false;
    
    protected $fillable = [
        'id_equipo',
        'id_actmanten',
        'fecha',
        'observaciones'
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'id_equipo');
    }

    public function actividad()
    {
        return $this->belongsTo(ActividadMantenimiento::class, 'id_actmanten');
    }
}
