<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programacion_asesoria', function (Blueprint $table) {
            $table->string('modalidad_visita', 20)->nullable()->after('direccion_completa');
        });
    }

    public function down(): void
    {
        Schema::table('programacion_asesoria', function (Blueprint $table) {
            $table->dropColumn('modalidad_visita');
        });
    }
};