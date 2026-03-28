<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cotizacion extends Model
{
    protected $table = 'cotizacion';
    
    public $timestamps = false;
    
    protected $fillable = [
        'numero_cotizacion',
        'id_cliente',
        'id_multicim',
        'fecha_emision',
        'id_personal_creador',
        'estado',
        'tipo_cotizacion',
        'incluye_igv',
        'subtotal',
        'igv',
        'total',
        'observaciones',
        'propuesta_tecnica',
        'receta_servicio',
        'exponentes_ids',
        'objetivos_asesoria'
    ];

    protected $casts = [
        'fecha_emision' => 'date',
        'incluye_igv' => 'boolean',
        'subtotal' => 'decimal:2',
        'igv' => 'decimal:2',
        'total' => 'decimal:2',
        'receta_servicio' => 'array',
        'exponentes_ids' => 'array'
    ];

    // Relaciones
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function empresa() 
    {
        return $this->belongsTo(Multicim::class, 'id_multicim');
    }

    public function creador()
    {
        return $this->belongsTo(Personal::class, 'id_personal_creador');
    }

    public function detalles()
    {
        return $this->hasMany(CotizacionDetalle::class, 'id_cotizacion');
    }

    public function beneficios()
    {
        return $this->hasMany(CotizacionBeneficio::class, 'id_cotizacion')->orderBy('orden');
    }

    public function ordenServicio()
    {
        return $this->hasOne(OrdenServicio::class, 'id_cotizacion');
    }

    public function ordenProducto()
    {
        return $this->hasOne(OrdenProducto::class, 'id_cotizacion');
    }

    public function ordenCapacitacionAuditoria()
    {
        return $this->hasOne(OrdenCapacitacionAuditoria::class, 'id_cotizacion');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'Pendiente');
    }

    public function scopeAceptadas($query)
    {
        return $query->where('estado', 'Aceptada');
    }

    public function scopeRechazadas($query)
    {
        return $query->where('estado', 'Rechazada');
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_cotizacion', $tipo);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function($q) use ($termino) {
            $q->where('numero_cotizacion', 'LIKE', "%{$termino}%")
              ->orWhereHas('cliente', function($q2) use ($termino) {
                  $q2->where('nombre_empresa', 'LIKE', "%{$termino}%");
              });
        });
    }

    // Generar número de cotización automático
    public static function generarNumero()
    {
        $anio = date('Y');
        $ultimo = self::whereYear('fecha_emision', $anio)
                     ->orderBy('id', 'desc')
                     ->first();
        
        $numero = $ultimo ? intval(substr($ultimo->numero_cotizacion, -3)) + 1 : 1;
        
        return "COT-{$anio}-" . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}
