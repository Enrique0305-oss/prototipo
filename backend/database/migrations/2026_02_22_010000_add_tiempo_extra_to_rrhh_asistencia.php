<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrhh_asistencia', function (Blueprint $table) {
            $table->integer('tiempo_extra_minutos')->default(0)->after('tardanza_minutos');
        });
    }

    public function down(): void
    {
        Schema::table('rrhh_asistencia', function (Blueprint $table) {
            $table->dropColumn('tiempo_extra_minutos');
        });
    }
};
