<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programacion_capacitacion', function (Blueprint $table) {
            if (!Schema::hasColumn('programacion_capacitacion', 'motivo')) {
                $table->string('motivo', 30)->nullable()->after('id_tecnico_conductor');
            }
            if (!Schema::hasColumn('programacion_capacitacion', 'motivo_otro')) {
                $table->string('motivo_otro', 255)->nullable()->after('motivo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('programacion_capacitacion', function (Blueprint $table) {
            if (Schema::hasColumn('programacion_capacitacion', 'motivo_otro')) {
                $table->dropColumn('motivo_otro');
            }
            if (Schema::hasColumn('programacion_capacitacion', 'motivo')) {
                $table->dropColumn('motivo');
            }
        });
    }
};
