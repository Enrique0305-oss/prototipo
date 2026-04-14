<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programacion_servicio', function (Blueprint $table) {
            if (!Schema::hasColumn('programacion_servicio', 'requiere_asignacion_recursos')) {
                $table->boolean('requiere_asignacion_recursos')
                    ->default(false)
                    ->after('estado_ejecucion');
                $table->index('requiere_asignacion_recursos', 'idx_prog_serv_requiere_recursos');
            }
        });
    }

    public function down(): void
    {
        Schema::table('programacion_servicio', function (Blueprint $table) {
            if (Schema::hasColumn('programacion_servicio', 'requiere_asignacion_recursos')) {
                $table->dropIndex('idx_prog_serv_requiere_recursos');
                $table->dropColumn('requiere_asignacion_recursos');
            }
        });
    }
};
