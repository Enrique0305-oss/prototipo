<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('formato_operacional_detalles')) {
            return;
        }

        Schema::table('formato_operacional_detalles', function (Blueprint $table) {
            if (!Schema::hasColumn('formato_operacional_detalles', 'estado_dispositivo_verdadera')) {
                $table->string('estado_dispositivo_verdadera', 20)->nullable()->after('estado_dispositivo');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'estado_dispositivo_auditiva')) {
                $table->string('estado_dispositivo_auditiva', 20)->nullable()->after('estado_dispositivo_verdadera');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'hallazgo_verdadera')) {
                $table->string('hallazgo_verdadera', 30)->nullable()->after('hallazgo');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'hallazgo_auditiva')) {
                $table->string('hallazgo_auditiva', 30)->nullable()->after('hallazgo_verdadera');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'senales_presencia_verdadera')) {
                $table->string('senales_presencia_verdadera', 30)->nullable()->after('senales_presencia');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'senales_presencia_auditiva')) {
                $table->string('senales_presencia_auditiva', 30)->nullable()->after('senales_presencia_verdadera');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('formato_operacional_detalles')) {
            return;
        }

        Schema::table('formato_operacional_detalles', function (Blueprint $table) {
            $dropColumns = [];

            foreach ([
                'estado_dispositivo_verdadera',
                'estado_dispositivo_auditiva',
                'hallazgo_verdadera',
                'hallazgo_auditiva',
                'senales_presencia_verdadera',
                'senales_presencia_auditiva',
            ] as $column) {
                if (Schema::hasColumn('formato_operacional_detalles', $column)) {
                    $dropColumns[] = $column;
                }
            }

            if (!empty($dropColumns)) {
                $table->dropColumn($dropColumns);
            }
        });
    }
};
