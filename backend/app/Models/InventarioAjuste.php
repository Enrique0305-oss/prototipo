<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventarioAjuste extends Model
{
    protected $table = 'inventario_ajustes';

    public $timestamps = false;

    protected $fillable = [
        'id_producto',
        'id_lote',
        'stock_anterior',
        'stock_nuevo',
        'diferencia',
        'tipo_ajuste',
        'motivo',
        'observacion',
        'id_usuario',
        'fecha_ajuste',
        'id_kardex',
    ];

    protected $casts = [
        'stock_anterior' => 'integer',
        'stock_nuevo' => 'integer',
        'diferencia' => 'integer',
        'fecha_ajuste' => 'datetime',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    public function lote()
    {
        return $this->belongsTo(Lote::class, 'id_lote');
    }

    public function usuario()
    {
        return $this->belongsTo(Personal::class, 'id_usuario');
    }

    public function kardex()
    {
        return $this->belongsTo(Kardex::class, 'id_kardex');
    }
}
