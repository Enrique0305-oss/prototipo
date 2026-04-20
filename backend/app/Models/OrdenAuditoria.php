<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class OrdenAuditoria extends Model
{
    protected $table = 'orden_auditoria';

    protected static ?string $resolvedTable = null;

    protected static ?string $resolvedPivotTable = null;

    public $timestamps = false;

    protected $fillable = [
        'numero_orden',
        'id_cotizacion',
        'id_cliente',
        'id_servicio',
        'id_exponente',
        'fecha_servicio',
        'fecha_aceptacion',
        'hora_servicio',
        'hora_fin_auditoria',
        'modalidad',
        'duracion_dias',
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
        'hora_fin_auditoria' => 'datetime:H:i',
        'duracion_dias' => 'integer',
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
        return $this->belongsToMany(Exponente::class, self::resolvePivotTable(), 'id_orden_auditoria', 'id_exponente');
    }

    public function getTable()
    {
        return self::resolveMainTable();
    }

    protected static function resolveMainTable(): string
    {
        if (self::$resolvedTable !== null) {
            return self::$resolvedTable;
        }

        $candidates = ['orden_auditoria', 'ordenes_auditoria'];

        foreach ($candidates as $table) {
            if (Schema::hasTable($table)) {
                self::$resolvedTable = $table;

                return self::$resolvedTable;
            }
        }

        self::$resolvedTable = 'orden_auditoria';

        return self::$resolvedTable;
    }

    protected static function resolvePivotTable(): string
    {
        if (self::$resolvedPivotTable !== null) {
            return self::$resolvedPivotTable;
        }

        $candidates = ['orden_auditoria_exponentes', 'ordenes_auditoria_exponentes'];

        foreach ($candidates as $table) {
            if (Schema::hasTable($table)) {
                self::$resolvedPivotTable = $table;

                return self::$resolvedPivotTable;
            }
        }

        self::$resolvedPivotTable = 'orden_auditoria_exponentes';

        return self::$resolvedPivotTable;
    }

    public static function generarNumero()
    {
        $anio = date('Y');
        $ultimo = self::whereYear('fecha_servicio', $anio)->orderByDesc('id')->first();
        $numero = $ultimo ? intval(substr($ultimo->numero_orden, -3)) + 1 : 1;

        return 'OAU-' . $anio . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}