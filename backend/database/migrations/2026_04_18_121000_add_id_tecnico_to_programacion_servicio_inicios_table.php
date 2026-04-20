<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('programacion_servicio_inicios')) {
            return;
        }

        Schema::table('programacion_servicio_inicios', function (Blueprint $table) {
            if (!Schema::hasColumn('programacion_servicio_inicios', 'id_tecnico')) {
                $table->unsignedInteger('id_tecnico')->nullable()->after('id_usuario');
                $table->index('id_tecnico', 'idx_prog_serv_inicios_tecnico');
            }
        });

        // Backfill: vincular inicios existentes (id_usuario=personal.id) con tecnicos.id cuando exista relación.
        DB::statement(
            "UPDATE programacion_servicio_inicios psi
             INNER JOIN tecnicos t ON t.id_personal = psi.id_usuario
             SET psi.id_tecnico = t.id
             WHERE psi.id_tecnico IS NULL"
        );
    }

    public function down(): void
    {
        if (!Schema::hasTable('programacion_servicio_inicios') || !Schema::hasColumn('programacion_servicio_inicios', 'id_tecnico')) {
            return;
        }

        Schema::table('programacion_servicio_inicios', function (Blueprint $table) {
            $table->dropIndex('idx_prog_serv_inicios_tecnico');
            $table->dropColumn('id_tecnico');
        });
    }
};
