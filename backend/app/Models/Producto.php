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
        'ubicacion',
        'unidad',
        'precio_unitario',
        'estado',
        'imagen',
        'ingre_activo',
        'plag_objetivo',
        'presentacion',
        'es_fabricable',
    ];

    protected $casts = [
        'precio_unitario' => 'decimal:2',
        'es_fabricable' => 'boolean',
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

    public function recetaDetalles()
    {
        return $this->hasMany(ProductoRecetaDetalle::class, 'id_producto_final');
    }

    public function lotes()
    {
        return $this->hasMany(Lote::class, 'id_producto');
    }

    // Métodos
    public function getStockTotalAttribute()
    {
        return $this->lotes()
            ->where('estado', 'Activo')
            ->sum('cantidad_disponible');
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
