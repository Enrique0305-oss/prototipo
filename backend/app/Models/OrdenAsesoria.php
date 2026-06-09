<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenAsesoria extends Model
{
    protected $table = 'orden_asesoria';

    public $timestamps = false;

    protected $fillable = [
        'numero_orden',
        'id_cotizacion',
        'id_cliente',
        'id_servicio',
        'id_exponente',
        'id_cliente_planta',
        'id_cliente_planta_area',
        'fecha_servicio',
        'fecha_aceptacion',
        'hora_servicio',
        'modalidad',
        'num_participantes',
        'num_certificados',
        'subtotal',
        'igv',
        'incluye_igv',
        'costo',
        'estado',
        'emitido_por',
        'observaciones',
    ];

    protected $casts = [
        'fecha_servicio' => 'date',
        'fecha_aceptacion' => 'date',
        'hora_servicio' => 'datetime:H:i',
        'num_participantes' => 'integer',
        'num_certificados' => 'integer',
        'subtotal' => 'decimal:2',
        'igv' => 'decimal:2',
        'incluye_igv' => 'boolean',
        'costo' => 'decimal:2',
    ];

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

    public function emisor()
    {
        return $this->belongsTo(Personal::class, 'emitido_por');
    }

    public function exponente()
    {
        return $this->belongsTo(Exponente::class, 'id_exponente');
    }

    public function exponentes()
    {
        return $this->belongsToMany(Exponente::class, 'orden_asesoria_exponentes', 'id_orden_asesoria', 'id_exponente');
    }

    public function proyecciones()
    {
        return $this->hasMany(Proyeccion::class, 'id_referencia')->where('tipo_orden', 'asesoria');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleOrdenAsesoria::class, 'id_orden_asesoria');
    }

    public static function generarNumero()
    {
        $anio = date('Y');
        $ultimo = self::whereYear('fecha_servicio', $anio)
            ->orderBy('id', 'desc')
            ->first();

        $numero = $ultimo ? intval(substr($ultimo->numero_orden, -3)) + 1 : 1;

        return "OA-{$anio}-" . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}
