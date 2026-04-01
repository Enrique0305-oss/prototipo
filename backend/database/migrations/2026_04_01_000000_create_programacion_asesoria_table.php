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
        Schema::create('programacion_asesoria', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('id_orden_asesoria');
            $table->integer('id_supervisor')->nullable();
            $table->integer('id_vehiculo')->nullable();
            $table->unsignedBigInteger('id_cliente_planta')->nullable();
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable();
            $table->date('fecha_programada');
            $table->time('hora_inicio');
            $table->time('hora_fin')->nullable();
            $table->string('local_sede', 150)->nullable();
            $table->string('direccion_completa', 255)->nullable();
            $table->enum('estado_ejecucion', ['Programado', 'Confirmado', 'En Camino', 'En Ejecucion', 'Realizado', 'Reprogramado', 'Cancelado'])
                ->default('Programado');
            $table->text('observaciones')->nullable();
            $table->integer('creado_por')->nullable();
            $table->timestamps();

            $table->index(['id_orden_asesoria', 'fecha_programada'], 'idx_prog_asesoria_orden_fecha');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programacion_asesoria');
    }
};
