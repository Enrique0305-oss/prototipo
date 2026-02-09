<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActividadMantenimiento extends Model
{
    protected $table = 'actividades_mantenieminto'; // Nota: tabla tiene typo en BD
    
    public $timestamps = false;
    
    protected $fillable = [
        'categoria',
        'estado'
    ];

    // Relaciones
    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'id_actmanten');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Activo');
    }
}
