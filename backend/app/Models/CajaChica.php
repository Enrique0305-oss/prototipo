<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CajaChica extends Model
{
    use HasFactory;

    protected $fillable = [
        'fecha',
        'tipo_movimiento',
        'solicitante',
        'area',
        'proveedor',
        'documento',
        'concepto',
        'tipo_dinero',
        'numero_operacion',
        'subtotal',
        'ingreso',
        'egreso',
        'saldo_actual',
        'registrado_por',
    ];

    public function detalles()
    {
        return $this->hasMany(CajaChicaDetalle::class, 'caja_chica_id');
    }

    public function historiales()
    {
        return $this->hasMany(CajaChicaHistorial::class, 'caja_chica_id');
    }
}
