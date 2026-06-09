<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoCuenta extends Model
{
    use HasFactory;

    protected $table = 'estado_cuenta';

    protected $fillable = [
        'cuenta',
        'fecha',
        'tipo_movimiento',
        'descripcion',
        'detalle',
        'factura_doc',
        'monto',
        'registrado_por',
    ];
}
