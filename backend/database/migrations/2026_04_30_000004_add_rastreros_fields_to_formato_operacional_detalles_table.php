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
            if (!Schema::hasColumn('formato_operacional_detalles', 'estado_lamina')) {
                $table->string('estado_lamina', 10)->nullable()->after('conteo_insectos');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'estadio')) {
                $table->string('estadio', 20)->nullable()->after('estado_lamina');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'conteo_estadio')) {
                $table->json('conteo_estadio')->nullable()->after('estadio');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'conteo_estadio_verdadera')) {
                $table->unsignedInteger('conteo_estadio_verdadera')->nullable()->after('conteo_estadio');
            }
            if (!Schema::hasColumn('formato_operacional_detalles', 'conteo_estadio_falsa')) {
                $table->unsignedInteger('conteo_estadio_falsa')->nullable()->after('conteo_estadio_verdadera');
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

            foreach (['estado_lamina', 'estadio', 'conteo_estadio', 'conteo_estadio_verdadera', 'conteo_estadio_falsa'] as $column) {
                if (Schema::hasColumn('formato_operacional_detalles', $column)) {
                    $columns[] = $column;
                }
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};