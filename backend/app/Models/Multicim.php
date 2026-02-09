<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Multicim extends Model
{
    protected $table = 'multicim';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre_empresa',
        'alias_empresa',
        'ruc',
        'cuenta_bcp',
        'codigo_interbancario_bcp',
        'banco_nacion',
        'codigo_interbancario_nacion'
    ];

    // Relaciones

    public function proyecciones()
    {
        return $this->hasMany(Proyecciones::class, 'id_multicim');
    }
}