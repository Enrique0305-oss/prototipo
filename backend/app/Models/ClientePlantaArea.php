<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientePlantaArea extends Model
{
    protected $table = 'cliente_planta_area';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente_planta',
        'nombre',
        'descripcion',
        'estado',
    ];

    public function planta()
    {
        return $this->belongsTo(ClientePlanta::class, 'id_cliente_planta');
    }
}
