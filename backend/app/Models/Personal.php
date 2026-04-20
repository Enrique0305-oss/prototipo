<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Personal extends Authenticatable
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
        'id_cargo',
        'usuario',
        'password',
        'estado'
    ];

    protected $hidden = [
        'password'
    ];

    /**
     * Sanctum necesita saber qué campo es el "email" / username
     */
    public function getAuthIdentifierName()
    {
        return 'id';
    }

    /**
     * Retorna el password hasheado para auth
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    // Relaciones
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area');
    }

    public function cargo()
    {
        return $this->belongsTo(Cargo::class, 'id_cargo');
    }

    public function cotizacionesCreadas()
    {
        return $this->hasMany(Cotizacion::class, 'id_personal_creador');
    }

    public function tecnico()
    {
        return $this->hasOne(Tecnico::class, 'id_personal');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellidos}";
    }
}
