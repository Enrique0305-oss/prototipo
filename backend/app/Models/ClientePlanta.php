<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientePlanta extends Model
{
    protected $table = 'cliente_planta';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente',
        'nombre',
        'direccion',
        'distrito',
        'provincia',
        'departamento',
        'referencia',
        'coordenadas',
        'latitud',
        'longitud',
        'contacto_nombre',
        'contacto_telefono',
        'estado',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function areas()
    {
        return $this->hasMany(ClientePlantaArea::class, 'id_cliente_planta');
    }

    public function areasActivas()
    {
        return $this->hasMany(ClientePlantaArea::class, 'id_cliente_planta')->where('estado', 'Activo');
    }
}
