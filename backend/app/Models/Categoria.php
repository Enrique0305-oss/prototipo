<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table = 'categoria';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'estado'
    ];

    // Relaciones
    public function productos()
    {
        return $this->hasMany(Producto::class, 'id_categoria');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Activo');
    }
}
