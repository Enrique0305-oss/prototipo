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
            if (!Schema::hasColumn('formato_operacional_detalles', 'conteo_estadio')) {
                // Try text if json fails, but let's try json first
                $table->json('conteo_estadio')->nullable()->after('estadio');
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('formato_operacional_detalles', 'conteo_estadio')) {
            Schema::table('formato_operacional_detalles', function (Blueprint $table) {
                $table->dropColumn('conteo_estadio');
            });
        }
    }
};
