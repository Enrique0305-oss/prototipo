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
        Schema::create('programacion_otros', function (Blueprint $table) {
            $table->increments('id');
            $table->string('motivo', 255);
            $table->integer('id_tecnico_asignado')->nullable();
            $table->json('tecnicos_ids')->nullable();
            $table->json('id_supervisor')->nullable();
            $table->integer('id_vehiculo')->nullable();
            $table->date('fecha_programada');
            $table->time('hora_inicio');
            $table->time('hora_fin')->nullable();
            $table->string('ubicacion_manual', 255);
            $table->enum('estado_ejecucion', ['Programado', 'Confirmado', 'En Camino', 'En Ejecución', 'Realizado', 'Reprogramado', 'Cancelado'])
                ->default('Programado');
            $table->text('observaciones')->nullable();
            $table->integer('creado_por')->nullable();
            $table->timestamps();

            $table->index(['fecha_programada', 'estado_ejecucion'], 'idx_prog_otros_fecha_estado');
            $table->index('id_tecnico_asignado', 'idx_prog_otros_tecnico');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programacion_otros');
    }
};
