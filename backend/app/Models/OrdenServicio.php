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
        'subtotal',
        'igv',
        'incluye_igv',
        'emitido_por',
        'estado',
        'observaciones'
    ];

    protected $casts = [
        'fecha_aceptacion' => 'date',
        'fecha_tentativa' => 'date',
        'total_costo' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'igv' => 'decimal:2',
        'incluye_igv' => 'boolean',
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

    // Relación con Proyecciones
    public function proyecciones()
    {
        return $this->hasMany(Proyeccion::class, 'id_orden_servicio');
    }

    public function productos()
    {
        return $this->hasMany(OrdenServicioProducto::class, 'id_orden_servicio');
    }

    public function equipos()
    {
        return $this->hasMany(OrdenServicioEquipo::class, 'id_orden_servicio');
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

    /**
     * Verifica si cada detalle de la ODS está completamente programado 
     * según su frecuencia y la cantidad de programaciones registradas.
     * Luego actualiza el estado de la ODS a Aprobado, Parcial o Programado.
     */
    public function actualizarEstadoProgramacion()
    {
        $detalles = $this->detalles; // Requiere la relación 'detalles' cargada o se carga bajo demanda
        $completos = 0;

        foreach ($detalles as $det) {
            $count = ProgramacionServicio::where('id_orden_servicio', $this->id)
                ->where('id_servicio', $det->id_servicio)
                ->where('id_cliente_planta', $det->id_cliente_planta)
                // Omitir las canceladas para el conteo, si aplica. Por ahora contamos todas las no canceladas
                ->where('estado_ejecucion', '!=', 'Cancelado')
                ->count();
            
            $frec = mb_strtolower(trim($det->frecuencia ?? ''));
            $expected = 1;
            
            if (str_contains($frec, 'semanal')) $expected = 52;
            elseif (str_contains($frec, 'quincenal')) $expected = 24;
            elseif (str_contains($frec, 'mensual')) $expected = 12;
            elseif (str_contains($frec, 'bimestral')) $expected = 6;
            elseif (str_contains($frec, 'trimestral')) $expected = 4;
            elseif (str_contains($frec, 'semestral')) $expected = 2;
            elseif (str_contains($frec, 'anual') || str_contains($frec, 'única') || str_contains($frec, 'unica')) $expected = 1;
            else $expected = 1;

            if ($count >= $expected) {
                $completos++;
            } elseif ($count > 1 && !in_array($frec, ['única', 'unica', 'anual'])) {
                // Si tiene más de 1 y es recurrente, consideramos que hicieron una programación masiva/anual
                $completos++;
            }
        }

        $totalDetalles = $detalles->count();

        if ($totalDetalles === 0) {
            return;
        }

        if ($completos === 0) {
            $this->estado = 'Aprobado';
        } elseif ($completos >= $totalDetalles) {
            $this->estado = 'Programado';
        } else {
            $this->estado = 'Parcial';
        }

        $this->save();
    }
}
