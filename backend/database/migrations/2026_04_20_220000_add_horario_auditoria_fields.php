<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // SQL equivalente:
    // ALTER TABLE cotizacion_detalle ADD COLUMN horario_auditoria JSON NULL AFTER frecuencia_visita;
    // ALTER TABLE orden_auditoria ADD COLUMN hora_fin_auditoria TIME NULL AFTER hora_servicio;
    // ALTER TABLE orden_auditoria DROP COLUMN horas_totales;
    public function up(): void
    {
        if (!Schema::hasColumn('cotizacion_detalle', 'horario_auditoria')) {
            Schema::table('cotizacion_detalle', function (Blueprint $table) {
                $table->json('horario_auditoria')->nullable()->after('frecuencia_visita');
            });
        }

        if (!Schema::hasColumn('orden_auditoria', 'hora_fin_auditoria')) {
            Schema::table('orden_auditoria', function (Blueprint $table) {
                $table->time('hora_fin_auditoria')->nullable()->after('hora_servicio');
            });
        }

        if (Schema::hasColumn('orden_auditoria', 'horas_totales')) {
            Schema::table('orden_auditoria', function (Blueprint $table) {
                $table->dropColumn('horas_totales');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('cotizacion_detalle', 'horario_auditoria')) {
            Schema::table('cotizacion_detalle', function (Blueprint $table) {
                $table->dropColumn('horario_auditoria');
            });
        }

        if (Schema::hasColumn('orden_auditoria', 'hora_fin_auditoria')) {
            Schema::table('orden_auditoria', function (Blueprint $table) {
                $table->dropColumn('hora_fin_auditoria');
            });
        }

        if (!Schema::hasColumn('orden_auditoria', 'horas_totales')) {
            Schema::table('orden_auditoria', function (Blueprint $table) {
                $table->decimal('horas_totales', 12, 2)->default(0)->after('duracion_dias');
            });
        }
    }
};