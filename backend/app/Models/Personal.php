<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Personal extends Model
{
    use HasApiTokens;
    
    protected $table = 'personal';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'apellidos',
        'celular',
        'correo',
        'id_area',
        'usuario',
        'password'
    ];

    protected $hidden = [
        'password'
    ];

    // Relaciones
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area');
    }

    public function cotizacionesCreadas()
    {
        return $this->hasMany(Cotizacion::class, 'id_personal_creador');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellidos}";
    }
}
