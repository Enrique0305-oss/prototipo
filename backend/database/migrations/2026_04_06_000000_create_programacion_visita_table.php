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
        Schema::create('programacion_visita', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('id_cliente');
            $table->string('tipo_visita', 120);
            $table->integer('id_tecnico_asignado');
            $table->json('tecnicos_ids')->nullable();
            $table->integer('id_supervisor')->nullable();
            $table->integer('id_vehiculo')->nullable();
            $table->unsignedBigInteger('id_cliente_planta')->nullable();
            $table->json('id_cliente_planta_area')->nullable();
            $table->date('fecha_programada');
            $table->time('hora_inicio');
            $table->time('hora_fin')->nullable();
            $table->string('local_sede', 150)->nullable();
            $table->string('direccion_completa', 255)->nullable();
            $table->enum('estado_ejecucion', ['Programado', 'Confirmado', 'En Camino', 'En Ejecución', 'Realizado', 'Reprogramado', 'Cancelado'])
                ->default('Programado');
            $table->text('observaciones')->nullable();
            $table->integer('creado_por')->nullable();
            $table->timestamps();

            $table->index(['id_cliente', 'fecha_programada'], 'idx_prog_visita_cliente_fecha');
            $table->index('id_tecnico_asignado', 'idx_prog_visita_tecnico');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programacion_visita');
    }
};
