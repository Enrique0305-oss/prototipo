<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CajaChicaDetalle extends Model
{
    use HasFactory;

    protected $fillable = [
        'caja_chica_id',
        'concepto',
        'monto',
    ];

    public function cajaChica()
    {
        return $this->belongsTo(CajaChica::class);
    }
}
