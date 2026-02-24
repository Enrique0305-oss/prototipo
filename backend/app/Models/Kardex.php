<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kardex extends Model
{
    protected $table = 'kardex';
    
    public $timestamps = false;
    
    protected $fillable = [
        'id_producto',
        'tipo_movimiento',
        'cantidad',
        'stock_anterior',
        'stock_posterior',
        'motivo',
        'referencia',
        'id_referencia',
        'id_usuario',
        'observacion',
        'fecha_movimiento',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'stock_anterior' => 'integer',
        'stock_posterior' => 'integer',
        'fecha_movimiento' => 'datetime',
    ];

    // Relaciones
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    public function usuario()
    {
        return $this->belongsTo(Personal::class, 'id_usuario');
    }

    // Scopes
    public function scopeEntradas($query)
    {
        return $query->where('tipo_movimiento', 'Entrada');
    }

    public function scopeSalidas($query)
    {
        return $query->where('tipo_movimiento', 'Salida');
    }

    public function scopeDeProducto($query, int $idProducto)
    {
        return $query->where('id_producto', $idProducto);
    }

    /**
     * Registrar un movimiento de kardex y actualizar inventario
     */
    public static function registrarMovimiento(array $data): self
    {
        $inventario = Inventario::where('id_productos', $data['id_producto'])->first();
        $stockAnterior = $inventario ? $inventario->cantidad_disponible : 0;

        if ($data['tipo_movimiento'] === 'Salida') {
            $stockPosterior = $stockAnterior - $data['cantidad'];
        } else {
            $stockPosterior = $stockAnterior + $data['cantidad'];
        }

        // Crear registro de kardex
        $kardex = self::create([
            'id_producto' => $data['id_producto'],
            'tipo_movimiento' => $data['tipo_movimiento'],
            'cantidad' => $data['cantidad'],
            'stock_anterior' => $stockAnterior,
            'stock_posterior' => $stockPosterior,
            'motivo' => $data['motivo'],
            'referencia' => $data['referencia'] ?? null,
            'id_referencia' => $data['id_referencia'] ?? null,
            'id_usuario' => $data['id_usuario'] ?? null,
            'observacion' => $data['observacion'] ?? null,
        ]);

        // Actualizar inventario
        if ($inventario) {
            $inventario->cantidad_disponible = $stockPosterior;
            $inventario->save();
        }

        return $kardex;
    }
}
