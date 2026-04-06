<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mantenimiento_vehiculo', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_programacion')->nullable();
            $table->integer('id_vehiculo');
            $table->string('motivo', 255);
            $table->enum('tipo_mantenimiento', ['Preventivo', 'Correctivo']);
            $table->dateTime('fecha_programada');
            $table->dateTime('fecha_realizado')->nullable();
            $table->integer('kilometraje')->nullable();
            $table->string('observaciones', 255)->nullable();
            $table->enum('estado', ['Programado', 'Realizado', 'Vencido', 'Cancelado'])->default('Programado');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('id_programacion')->references('id')->on('programacion_mantenimiento_vehiculo')->onDelete('cascade');
            $table->foreign('id_vehiculo')->references('id')->on('vehiculos');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mantenimiento_vehiculo');
    }
};
