<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacionInsumo extends Model
{
    protected $table = 'programacion_insumos';

    public $timestamps = false;

    protected $fillable = [
        'id_programacion',
        'id_producto',
        'id_lote',
        'cantidad_asignada',
        'cantidad_utilizada',
        'estado',
    ];

    protected $casts = [
        'cantidad_asignada' => 'integer',
        'cantidad_utilizada' => 'integer',
    ];

    // Relaciones
    public function programacion()
    {
        return $this->belongsTo(ProgramacionServicio::class, 'id_programacion');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    public function lote()
    {
        return $this->belongsTo(Lote::class, 'id_lote');
    }
}
