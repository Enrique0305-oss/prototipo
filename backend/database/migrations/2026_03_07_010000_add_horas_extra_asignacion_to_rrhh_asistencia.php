<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrhh_asistencia', function (Blueprint $table) {
            $table->boolean('horas_extra_asignadas')->default(false)->after('tiempo_extra_minutos');
            $table->time('hora_inicio_extra')->nullable()->after('horas_extra_asignadas');
        });
    }

    public function down(): void
    {
        Schema::table('rrhh_asistencia', function (Blueprint $table) {
            $table->dropColumn(['horas_extra_asignadas', 'hora_inicio_extra']);
        });
    }
};
