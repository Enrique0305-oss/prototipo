<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('programacion_capacitacion', function (Blueprint $table) {
            if (!Schema::hasColumn('programacion_capacitacion', 'id_tecnico_conductor')) {
                $table->unsignedBigInteger('id_tecnico_conductor')->nullable()->after('id_vehiculo');
                $table->index('id_tecnico_conductor', 'idx_prog_cap_tecnico_conductor');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programacion_capacitacion', function (Blueprint $table) {
            if (Schema::hasColumn('programacion_capacitacion', 'id_tecnico_conductor')) {
                $table->dropIndex('idx_prog_cap_tecnico_conductor');
                $table->dropColumn('id_tecnico_conductor');
            }
        });
    }
};
