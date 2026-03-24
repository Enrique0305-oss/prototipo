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
            $table->decimal('horas_capacitacion', 4, 2)->nullable();
            $table->integer('num_participantes')->nullable();
            $table->date('fecha_servicio')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->dropColumn(['horas_capacitacion', 'num_participantes', 'fecha_servicio']);
        });
    }
};
