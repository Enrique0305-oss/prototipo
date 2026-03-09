<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrhh_asistencia', function (Blueprint $table) {
            $table->time('hora_inicio_almuerzo')->nullable()->after('hora_salida');
            $table->time('hora_fin_almuerzo')->nullable()->after('hora_inicio_almuerzo');
            $table->integer('exceso_almuerzo_minutos')->default(0)->after('hora_fin_almuerzo');
        });
    }

    public function down(): void
    {
        Schema::table('rrhh_asistencia', function (Blueprint $table) {
            $table->dropColumn(['hora_inicio_almuerzo', 'hora_fin_almuerzo', 'exceso_almuerzo_minutos']);
        });
    }
};
