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
        Schema::table('programacion_visita', function (Blueprint $table) {
            $table->dateTime('fecha_inicio_real')->nullable()->after('hora_fin');
            $table->dateTime('fecha_fin_real')->nullable()->after('fecha_inicio_real');
        });

        Schema::table('programacion_fabricacion', function (Blueprint $table) {
            $table->dateTime('fecha_inicio_real')->nullable()->after('hora_fin');
            $table->dateTime('fecha_fin_real')->nullable()->after('fecha_inicio_real');
        });

        Schema::table('programacion_otros', function (Blueprint $table) {
            $table->dateTime('fecha_inicio_real')->nullable()->after('hora_fin');
            $table->dateTime('fecha_fin_real')->nullable()->after('fecha_inicio_real');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programacion_visita', function (Blueprint $table) {
            $table->dropColumn(['fecha_inicio_real', 'fecha_fin_real']);
        });

        Schema::table('programacion_fabricacion', function (Blueprint $table) {
            $table->dropColumn(['fecha_inicio_real', 'fecha_fin_real']);
        });

        Schema::table('programacion_otros', function (Blueprint $table) {
            $table->dropColumn(['fecha_inicio_real', 'fecha_fin_real']);
        });
    }
};
