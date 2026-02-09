<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenProducto extends Model
{
    protected $table = 'orden_producto';
    
    public $timestamps = false;
    
    protected $fillable = [
        'numero_orden',
        'id_cotizacion',
        'id_cliente',
        'fecha_envio',
        'total',
        'emitido_por'
    ];

    protected $casts = [
        'fecha_envio' => 'date',
        'total' => 'decimal:2',
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function cotizacion()
    {
        return $this->belongsTo(Cotizacion::class, 'id_cotizacion');
    }

    public function emisor()
    {
        return $this->belongsTo(Personal::class, 'emitido_por');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleOrdenProducto::class, 'id_orden_producto');
    }
    
    // Relación con Proyecciones
    public function proyecciones()
    {
        return $this->hasMany(Proyeccion::class, 'id_orden_producto');
    }
    // Generar número de orden
    public static function generarNumero()
    {
        $anio = date('Y');
        $ultimo = self::whereYear('fecha_envio', $anio)
                     ->orderBy('id', 'desc')
                     ->first();
        
        $numero = $ultimo ? intval(substr($ultimo->numero_orden, -3)) + 1 : 1;
        
        return "OP-{$anio}-" . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}
