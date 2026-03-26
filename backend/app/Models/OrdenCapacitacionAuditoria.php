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
        'id_exponente',
        'fecha_servicio',
        'fecha_aceptacion',
        'hora_servicio',
        'modalidad',
        'num_participantes',
        'num_certificados',
        'costo',
        'subtotal',
        'igv',
        'incluye_igv',
        'estado',
        'emitido_por',
        'horas_capacitacion',
        'observaciones',
    ];

    protected $casts = [
        'fecha_servicio' => 'date',
        'fecha_aceptacion' => 'date',
        'hora_servicio' => 'datetime:H:i',
        'num_participantes' => 'integer',
        'num_certificados' => 'integer',
        'costo' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'igv' => 'decimal:2',
        'incluye_igv' => 'boolean',
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function emisor()
    {
        return $this->belongsTo(Personal::class, 'emitido_por');
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

    /**
     * Exponente principal (de tabla exponentes)
     */
    public function exponente()
    {
        return $this->belongsTo(Exponente::class, 'id_exponente');
    }

    /**
     * Relación many-to-many con Exponentes
     */
    public function exponentes()
    {
        return $this->belongsToMany(Exponente::class, 'orden_capacitacion_ponentes', 'id_orden_capacitacion', 'id_exponente');
    }

    // Relación con Proyecciones
    public function proyecciones()
    {
        return $this->hasMany(Proyeccion::class, 'id_orden_capacitacion_auditoria');
    }

    //Relacion para su detalle de materiales y equipos

    public function materiales()
    {
        return $this->hasMany(DetalleOrdenCapacitacionMaterial::class, 'id_orden_capacitacion');
    }

    public function equipos()
    {
        return $this->hasMany(DetalleOrdenCapacitacionEquipo::class, 'id_orden_capacitacion');
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
