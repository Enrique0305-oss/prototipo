<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntregaEpp extends Model
{
    protected $table = 'entrega_epp';

    protected $fillable = [
        'numero_entrega',
        'id_tecnico',
        'fecha_entrega',
        'fecha_devolucion',
        'estado',
        'registrado_por',
        'devuelto_por',
        'observaciones',
        'motivo_devolucion',
    ];

    protected $casts = [
        'fecha_entrega' => 'date',
        'fecha_devolucion' => 'date',
    ];

    // Relaciones
    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class, 'id_tecnico');
    }

    public function registrador()
    {
        return $this->belongsTo(Personal::class, 'registrado_por');
    }

    public function devolvedor()
    {
        return $this->belongsTo(Personal::class, 'devuelto_por');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleEntregaEpp::class, 'id_entrega_epp');
    }

    // Generar número de entrega
    public static function generarNumero(): string
    {
        $anio = date('Y');
        $ultimo = self::where('numero_entrega', 'like', "EPP-{$anio}-%")
                     ->orderBy('id', 'desc')
                     ->first();

        $numero = $ultimo ? intval(substr($ultimo->numero_entrega, -3)) + 1 : 1;
        return "EPP-{$anio}-" . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }
}
