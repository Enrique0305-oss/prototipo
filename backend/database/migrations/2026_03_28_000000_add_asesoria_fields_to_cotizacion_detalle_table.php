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
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->integer('meses_implementacion')->nullable();
            $table->json('frecuencia_visita')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->dropColumn(['meses_implementacion', 'frecuencia_visita']);
        });
    }
};
