<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programacion_mantenimiento_vehiculo', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('id_vehiculo');
            $table->string('motivo', 255);
            $table->integer('anio');
            $table->integer('frecuencia_meses')->comment('Cada cuántos meses: 1,2,3,4,6,12');
            $table->date('fecha_inicio');
            $table->integer('total_programados')->default(0);
            $table->string('observaciones', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_vehiculo')->references('id')->on('vehiculos');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programacion_mantenimiento_vehiculo');
    }
};
