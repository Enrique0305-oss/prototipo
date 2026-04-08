<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenFabricacion extends Model
{
    protected $table = 'orden_fabricacion';

    protected $fillable = [
        'codigo',
        'fecha_orden',
        'motivo',
        'estado',
        'resumen_insumos',
        'observaciones',
        'creado_por',
    ];

    protected $casts = [
        'fecha_orden' => 'date',
        'resumen_insumos' => 'array',
    ];

    public function detalles()
    {
        return $this->hasMany(DetalleOrdenFabricacion::class, 'id_orden_fabricacion');
    }

    public function programaciones()
    {
        return $this->hasMany(ProgramacionFabricacion::class, 'id_orden_fabricacion');
    }

    public function entradasDevoluciones()
    {
        return $this->hasMany(EntradaDevolucionFabricacion::class, 'id_orden_fabricacion');
    }
}
