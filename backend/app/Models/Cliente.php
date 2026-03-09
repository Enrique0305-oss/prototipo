<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'cliente';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre_empresa',
        'ruc',
        'rubro',
        'direccion',
        'persona_contacto',
        'telefono_contacto',
        'origen',
        'fecha_registro',
        'estado'
    ];

    protected $casts = [
        'fecha_registro' => 'date',
    ];

    // Relaciones
    public function cotizaciones()
    {
        return $this->hasMany(Cotizacion::class, 'id_cliente');
    }

    public function ordenesServicio()
    {
        return $this->hasMany(OrdenServicio::class, 'id_cliente');
    }

    public function ordenesProducto()
    {
        return $this->hasMany(OrdenProducto::class, 'id_cliente');
    }

    public function ordenesCapacitacion()
    {
        return $this->hasMany(OrdenCapacitacionAuditoria::class, 'id_cliente');
    }

    public function plantas()
    {
        return $this->hasMany(ClientePlanta::class, 'id_cliente');
    }

    public function plantasActivas()
    {
        return $this->hasMany(ClientePlanta::class, 'id_cliente')->where('estado', 'Activo');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'Acepta');
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function($q) use ($termino) {
            $q->where('nombre_empresa', 'LIKE', "%{$termino}%")
              ->orWhere('ruc', 'LIKE', "%{$termino}%")
              ->orWhere('rubro', 'LIKE', "%{$termino}%")
              ->orWhere('persona_contacto', 'LIKE', "%{$termino}%");
        });
    }
}
