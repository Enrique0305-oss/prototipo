<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormatoOperacionalDetalle extends Model
{
    protected $table = 'formato_operacional_detalles';

    protected $fillable = [
        'id_formato_operacional',
        'tipo_seccion',
        'codigo_caja',
        'orden_caja',
        'id_producto',
        'descripcion',
        'ubicacion',
        'estado_dispositivo',
        'estado_dispositivo_verdadera',
        'estado_dispositivo_auditiva',
        'hallazgo',
        'hallazgo_verdadera',
        'hallazgo_auditiva',
        'senales_presencia',
        'senales_presencia_verdadera',
        'senales_presencia_auditiva',
        'conteo_insectos',
        'estado_lamina',
        'estado_lamina_verdadera',
        'estado_lamina_auditiva',
        'estadio',
        'conteo_estadio',
        'conteo_estadio_verdadera',
        'conteo_estadio_falsa',
        'numero_lote',
        'oculto_en_falsa',
    ];

    protected $casts = [
        'orden_caja' => 'integer',
        'id_producto' => 'integer',
        'conteo_insectos' => 'array',
        'conteo_estadio' => 'array',
        'conteo_estadio_verdadera' => 'integer',
        'conteo_estadio_falsa' => 'integer',
        'oculto_en_falsa' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function formatoOperacional()
    {
        return $this->belongsTo(FormatoOperacional::class, 'id_formato_operacional');
    }
}