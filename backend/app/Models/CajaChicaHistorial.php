<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CajaChicaHistorial extends Model
{
    protected $fillable = [
        'caja_chica_id',
        'usuario_id',
        'valores_anteriores',
        'valores_nuevos',
    ];

    protected $casts = [
        'valores_anteriores' => 'array',
        'valores_nuevos' => 'array',
    ];

    public function cajaChica()
    {
        return $this->belongsTo(CajaChica::class);
    }

    public function usuario()
    {
        return $this->belongsTo(Personal::class, 'usuario_id');
    }
}
