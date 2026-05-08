<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('programacion_servicio')) {
            return;
        }

        if (!Schema::hasColumn('programacion_servicio', 'formatos_fichas')) {
            Schema::table('programacion_servicio', function (Blueprint $table) {
                $table->json('formatos_fichas')->nullable()->after('id_cliente_planta_area');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('programacion_servicio')) {
            return;
        }

        if (Schema::hasColumn('programacion_servicio', 'formatos_fichas')) {
            Schema::table('programacion_servicio', function (Blueprint $table) {
                $table->dropColumn('formatos_fichas');
            });
        }
    }
};
