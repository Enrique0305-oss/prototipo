<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programacion_servicio', function (Blueprint $table) {
            if (!Schema::hasColumn('programacion_servicio', 'id_grupo_programacion')) {
                $table->unsignedInteger('id_grupo_programacion')->nullable()->after('id_vehiculo');
                $table->index('id_grupo_programacion', 'idx_prog_serv_id_grupo_programacion');
                $table->foreign('id_grupo_programacion')
                    ->references('id')
                    ->on('programacion_servicio_grupos')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('programacion_servicio', function (Blueprint $table) {
            if (Schema::hasColumn('programacion_servicio', 'id_grupo_programacion')) {
                $table->dropForeign(['id_grupo_programacion']);
                $table->dropIndex('idx_prog_serv_id_grupo_programacion');
                $table->dropColumn('id_grupo_programacion');
            }
        });
    }
};