<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lote extends Model
{
    protected $table = 'lotes';
    
    public $timestamps = false;
    
    protected $fillable = [
        'id_producto',
        'numero_lote',
        'fecha_vencimiento',
        'cantidad',
        'cantidad_disponible',
        'estado',
        'observacion',
        'fecha_ingreso',
    ];

    protected $casts = [
        'fecha_vencimiento' => 'date',
        'cantidad' => 'integer',
        'cantidad_disponible' => 'integer',
        'fecha_ingreso' => 'datetime',
    ];

    // Relaciones
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Activo');
    }

    public function scopeVencidos($query)
    {
        return $query->where('estado', 'Vencido');
    }

    public function scopeConStock($query)
    {
        return $query->where('cantidad_disponible', '>', 0);
    }

    public function scopeProximosVencer($query)
    {
        return $query->where('estado', 'Activo')
            ->whereDate('fecha_vencimiento', '<=', now()->addDays(30))
            ->where('cantidad_disponible', '>', 0);
    }
}
