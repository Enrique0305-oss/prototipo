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
            if (!Schema::hasColumn('formato_operacional_detalles', 'conteo_insectos')) {
                $table->json('conteo_insectos')->nullable()->after('senales_presencia_auditiva');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('formato_operacional_detalles')) {
            return;
        }

        Schema::table('formato_operacional_detalles', function (Blueprint $table) {
            if (Schema::hasColumn('formato_operacional_detalles', 'conteo_insectos')) {
                $table->dropColumn('conteo_insectos');
            }
        });
    }
};
