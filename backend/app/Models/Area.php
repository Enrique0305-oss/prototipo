<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $table = 'area';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'estado'
    ];

    // Relaciones
    public function personal()
    {
        return $this->hasMany(Personal::class, 'id_area');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Activo');
    }
}
