<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    
    public $timestamps = false;
    
    protected $fillable = [
        'sku',
        'descripcion',
        'id_categoria',
        'fecha_vencim',
        'ubicacion',
        'n_lote',
        'unidad',
        'precio_unitario',
        'estado',
        'imagen'
    ];

    protected $casts = [
        'fecha_vencim' => 'date',
        'precio_unitario' => 'decimal:2',
    ];

    // Relaciones
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
    }

    public function inventario()
    {
        return $this->hasOne(Inventario::class, 'id_productos');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Activo');
    }

    public function scopeConStock($query)
    {
        return $query->whereHas('inventario', function($q) {
            $q->where('cantidad_disponible', '>', 0);
        });
    }
}
