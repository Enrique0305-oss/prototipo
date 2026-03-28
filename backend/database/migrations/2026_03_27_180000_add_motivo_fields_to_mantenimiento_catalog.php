<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('actividades_mantenieminto', function (Blueprint $table) {
            if (!Schema::hasColumn('actividades_mantenieminto', 'motivo')) {
                $table->string('motivo', 255)->nullable()->after('categoria');
            }
            if (!Schema::hasColumn('actividades_mantenieminto', 'tipo_mantenimiento')) {
                $table->enum('tipo_mantenimiento', ['Preventivo', 'Correctivo'])->nullable()->after('motivo');
            }
            if (!Schema::hasColumn('actividades_mantenieminto', 'tipo_equipo')) {
                $table->string('tipo_equipo', 80)->nullable()->after('tipo_mantenimiento');
            }
            if (!Schema::hasColumn('actividades_mantenieminto', 'frecuencia_sugerida')) {
                $table->string('frecuencia_sugerida', 40)->nullable()->after('tipo_equipo');
            }
        });

        Schema::table('programacion_mantenimiento', function (Blueprint $table) {
            if (!Schema::hasColumn('programacion_mantenimiento', 'modo_programacion')) {
                $table->enum('modo_programacion', ['Anual', 'Unica'])->default('Anual')->after('anio');
            }
        });

        // Compatibilidad con datos antiguos
        DB::table('actividades_mantenieminto')
            ->whereNull('motivo')
            ->update([
                'motivo' => DB::raw('categoria'),
                'tipo_mantenimiento' => 'Preventivo',
                'frecuencia_sugerida' => 'Mensual',
            ]);

        $motivos = [
            // Preventivos - Motoaspersoras
            ['motivo' => 'Limpiar filtro de aire', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Semanal'],
            ['motivo' => 'Ajustar tornillos', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Semanal'],
            ['motivo' => 'Revisar estado de bujia', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Semanal'],
            ['motivo' => 'Lubricar partes moviles', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Semanal'],
            ['motivo' => 'Revisar carburador', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Cambiar bujia si es necesario', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Revisar empaques y sellos', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Verificar presion de salida', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'MOTOASPERSORA', 'frecuencia_sugerida' => 'Mensual'],

            // Preventivos - Termo nebulizador
            ['motivo' => 'Descarbonizar camara de combustion', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'TERMO NEBULIZADOR', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Revisar lineas de producto', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'TERMO NEBULIZADOR', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Verificar empaques', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'TERMO NEBULIZADOR', 'frecuencia_sugerida' => 'Mensual'],

            // Preventivos - Aspersora manual
            ['motivo' => 'Lubricar bomba', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'ASPERSORA MANUAL', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Revisar empaques', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'ASPERSORA MANUAL', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Revisar piston', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'ASPERSORA MANUAL', 'frecuencia_sugerida' => 'Mensual'],

            // Preventivos - ULV
            ['motivo' => 'Calibracion de caudal', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'ULV', 'frecuencia_sugerida' => 'Mensual'],
            ['motivo' => 'Revision del sistema de atomizacion', 'tipo_mantenimiento' => 'Preventivo', 'tipo_equipo' => 'ULV', 'frecuencia_sugerida' => 'Mensual'],

            // Correctivos generales
            ['motivo' => 'Diagnostico de fallas mecanicas o electricas', 'tipo_mantenimiento' => 'Correctivo', 'tipo_equipo' => 'GENERAL', 'frecuencia_sugerida' => 'Unica'],
            ['motivo' => 'Reparacion o reemplazo de piezas danadas', 'tipo_mantenimiento' => 'Correctivo', 'tipo_equipo' => 'GENERAL', 'frecuencia_sugerida' => 'Unica'],
            ['motivo' => 'Limpieza interna de residuos quimicos', 'tipo_mantenimiento' => 'Correctivo', 'tipo_equipo' => 'GENERAL', 'frecuencia_sugerida' => 'Unica'],
            ['motivo' => 'Ajuste y calibracion del equipo', 'tipo_mantenimiento' => 'Correctivo', 'tipo_equipo' => 'GENERAL', 'frecuencia_sugerida' => 'Unica'],
            ['motivo' => 'Pruebas de funcionamiento post reparacion', 'tipo_mantenimiento' => 'Correctivo', 'tipo_equipo' => 'GENERAL', 'frecuencia_sugerida' => 'Unica'],
        ];

        foreach ($motivos as $item) {
            DB::table('actividades_mantenieminto')->updateOrInsert(
                [
                    'motivo' => $item['motivo'],
                    'tipo_mantenimiento' => $item['tipo_mantenimiento'],
                    'tipo_equipo' => $item['tipo_equipo'],
                ],
                [
                    'categoria' => 'Programado',
                    'estado' => 'Activo',
                    'frecuencia_sugerida' => $item['frecuencia_sugerida'],
                ]
            );
        }
    }

    public function down(): void
    {
        Schema::table('programacion_mantenimiento', function (Blueprint $table) {
            if (Schema::hasColumn('programacion_mantenimiento', 'modo_programacion')) {
                $table->dropColumn('modo_programacion');
            }
        });

        Schema::table('actividades_mantenieminto', function (Blueprint $table) {
            $columns = ['motivo', 'tipo_mantenimiento', 'tipo_equipo', 'frecuencia_sugerida'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('actividades_mantenieminto', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
