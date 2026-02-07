<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    protected $table = 'inventario';
    
    public $timestamps = false;
    
    protected $fillable = [
        'id_productos',
        'cantidad_disponible',
        'stock_seguridad',
        'Tipo',
        'Cantidad_total'
    ];

    protected $casts = [
        'cantidad_disponible' => 'integer',
        'stock_seguridad' => 'integer',
        'Cantidad_total' => 'integer',
    ];

    // Relaciones
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_productos');
    }

    // Scopes
    public function scopeBajoStock($query)
    {
        return $query->whereColumn('cantidad_disponible', '<=', 'stock_seguridad');
    }
}
