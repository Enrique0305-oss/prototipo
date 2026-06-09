<?php
/*
 * Created At: 2026-05-12T01:51:00Z
 * File Path: backend/app/Models/InformeTecnico.php
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InformeTecnico extends Model
{
    use SoftDeletes;

    protected $table = 'informes_tecnicos';

    protected $fillable = [
        'correlativo',
        'id_cliente',
        'id_usuario_creador',
        'mes_actividad',
        'fecha_emision',
        'elaborado_por',
        'actividad',
        'ubicacion',
        'hoja_tipo',
        'conclusiones',
        'visitas',
        'evidencias',
        'insumos',
        'estado',
        'estilo'
    ];

    protected $casts = [
        'visitas' => 'json',
        'evidencias' => 'json',
        'insumos' => 'json',
        'fecha_emision' => 'date'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->correlativo) {
                $lastRecord = static::whereNotNull('correlativo')
                    ->where('correlativo', 'LIKE', 'IT-OP-%')
                    ->orderBy('id', 'desc')
                    ->first();

                $lastNumber = 0;
                if ($lastRecord && preg_match('/IT-OP-(\d+)/', $lastRecord->correlativo, $matches)) {
                    $lastNumber = (int) $matches[1];
                }

                $model->correlativo = 'IT-OP-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function usuarioCreador()
    {
        return $this->belongsTo(Personal::class, 'id_usuario_creador');
    }
}
