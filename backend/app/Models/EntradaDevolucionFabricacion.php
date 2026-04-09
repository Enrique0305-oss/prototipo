<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntradaDevolucionFabricacion extends Model
{
    protected $table = 'entrada_devolucion_fabricacion';

    protected $fillable = [
        'id_orden_fabricacion',
        'id_programacion_fabricacion',
        'cantidad_esperada_total',
        'cantidad_producida_total',
        'motivo_diferencia',
        'tiene_sobrante_materia_prima',
        'observaciones',
        'creado_por',
        'estado',
        'fecha_realizado',
    ];

    protected $casts = [
        'cantidad_esperada_total' => 'decimal:3',
        'cantidad_producida_total' => 'decimal:3',
        'tiene_sobrante_materia_prima' => 'boolean',
        'fecha_realizado' => 'datetime',
    ];

    public function ordenFabricacion()
    {
        return $this->belongsTo(OrdenFabricacion::class, 'id_orden_fabricacion');
    }

    public function programacionFabricacion()
    {
        return $this->belongsTo(ProgramacionFabricacion::class, 'id_programacion_fabricacion');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleEntradaDevolucionFabricacion::class, 'id_entrada_devolucion_fabricacion');
    }
}
