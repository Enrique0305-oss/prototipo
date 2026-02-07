<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenServicio extends Model
{
    protected $table = 'orden_servicio';
    
    public $timestamps = false;
    
    protected $fillable = [
        'numero_orden',
        'codigo_doc',
        'version',
        'id_cotizacion',
        'id_cliente',
        'fecha_aceptacion',
        'fecha_tentativa',
        'total_costo',
        'emitido_por'
    ];

    protected $casts = [
        'fecha_aceptacion' => 'date',
        'fecha_tentativa' => 'date',
        'total_costo' => 'decimal:2',
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
        return $this->hasMany(DetalleOrdenServicio::class, 'id_orden_servicio');
    }

    public function programaciones()
    {
        return $this->hasMany(ProgramacionServicio::class, 'id_orden_servicio');
    }

    // Generar número de orden
    public static function generarNumero()
    {
        $anio = date('Y');
        $ultimo = self::whereYear('fecha_aceptacion', $anio)
                     ->orderBy('id', 'desc')
                     ->first();
        
        $numero = $ultimo ? intval(substr($ultimo->numero_orden, -3)) + 1 : 1;
        
        return "OS-{$anio}-" . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}
