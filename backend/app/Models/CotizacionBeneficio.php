<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CotizacionBeneficio extends Model
{
    protected $table = 'cotizacion_beneficio';

    public $timestamps = false;

    protected $fillable = [
        'id_cotizacion',
        'id_catalogo_cap_aud',
        'nombre_beneficio',
        'modalidad_sugerida',
        'horas_capacitacion',
        'precio_referencial',
        'observacion',
        'orden',
    ];

    protected $casts = [
        'horas_capacitacion' => 'decimal:2',
        'precio_referencial' => 'decimal:2',
        'orden' => 'integer',
    ];

    public function cotizacion()
    {
        return $this->belongsTo(Cotizacion::class, 'id_cotizacion');
    }

    public function catalogoCapAud()
    {
        return $this->belongsTo(CatalogoCapacitacionAuditoria::class, 'id_catalogo_cap_aud');
    }
}
