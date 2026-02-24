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
        Schema::create('programacion_tecnicos', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('id_programacion');
            $table->integer('id_tecnico');
            $table->enum('rol', ['Principal', 'Apoyo'])->default('Apoyo');
            $table->timestamps();

            $table->foreign('id_programacion')
                  ->references('id')->on('programacion_servicio')
                  ->onDelete('cascade');
            $table->foreign('id_tecnico')
                  ->references('id')->on('tecnicos')
                  ->onDelete('cascade');

            $table->unique(['id_programacion', 'id_tecnico']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programacion_tecnicos');
    }
};
