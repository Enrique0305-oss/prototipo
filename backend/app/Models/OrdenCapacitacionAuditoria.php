<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenCapacitacionAuditoria extends Model
{
    protected $table = 'orden_capacitacion_auditoria';
    
    public $timestamps = false;
    
    protected $fillable = [
        'numero_orden',
        'id_cotizacion',
        'id_cliente',
        'id_servicio',
        'id_ponente',
        'fecha_servicio',
        'hora_servicio',
        'modalidad',
        'num_participantes',
        'num_certificados',
        'costo',
        'estado',
        'observaciones'
    ];

    protected $casts = [
        'fecha_servicio' => 'date',
        'hora_servicio' => 'datetime:H:i',
        'num_participantes' => 'integer',
        'num_certificados' => 'integer',
        'costo' => 'decimal:2',
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

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }

    public function ponente()
    {
        return $this->belongsTo(Personal::class, 'id_ponente');
    }

    /**
     * Relación many-to-many con Personal (múltiples ponentes)
     */
    public function ponentes()
    {
        return $this->belongsToMany(Personal::class, 'orden_capacitacion_ponentes', 'id_orden_capacitacion', 'id_ponente');
    }

    // Relación con Proyecciones
    public function proyecciones()
    {
        return $this->hasMany(Proyeccion::class, 'id_orden_capacitacion_auditoria');
    }

    // Generar número de orden
    public static function generarNumero()
    {
        $anio = date('Y');
        $ultimo = self::whereYear('fecha_servicio', $anio)
                     ->orderBy('id', 'desc')
                     ->first();
        
        $numero = $ultimo ? intval(substr($ultimo->numero_orden, -3)) + 1 : 1;
        
        return "OC-{$anio}-" . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}
