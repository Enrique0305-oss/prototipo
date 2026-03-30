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
        Schema::create('programacion_exponentes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_programacion');
            $table->unsignedBigInteger('id_exponente');
            $table->timestamps();

            // Relaciones
            $table->foreign('id_programacion')
                ->references('id')
                ->on('programacion_servicio')
                ->onDelete('cascade');

            $table->foreign('id_exponente')
                ->references('id')
                ->on('exponentes')
                ->onDelete('cascade');

            // Índices
            $table->unique(['id_programacion', 'id_exponente']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programacion_exponentes');
    }
};
