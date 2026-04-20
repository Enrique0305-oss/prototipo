<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalidaProgramacionFabricacionDetalle extends Model
{
    protected $table = 'salida_prog_fab_detalles';

    protected $fillable = [
        'id_programacion_fabricacion',
        'id_producto',
        'cantidad_entregada',
        'id_lote',
    ];

    public function programacionFabricacion()
    {
        return $this->belongsTo(ProgramacionFabricacion::class, 'id_programacion_fabricacion');
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
