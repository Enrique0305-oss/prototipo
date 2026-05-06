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
            if (!Schema::hasColumn('formato_operacional_detalles', 'estado_lamina_verdadera')) {
                $table->string('estado_lamina_verdadera', 10)->nullable()->after('estado_lamina');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'estado_lamina_auditiva')) {
                $table->string('estado_lamina_auditiva', 10)->nullable()->after('estado_lamina_verdadera');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('formato_operacional_detalles')) {
            return;
        }

        Schema::table('formato_operacional_detalles', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('formato_operacional_detalles', 'estado_lamina_verdadera')) {
                $columns[] = 'estado_lamina_verdadera';
            }
            if (Schema::hasColumn('formato_operacional_detalles', 'estado_lamina_auditiva')) {
                $columns[] = 'estado_lamina_auditiva';
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
