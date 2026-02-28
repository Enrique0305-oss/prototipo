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
        Schema::create('entrega_epp', function (Blueprint $table) {
            $table->id();
            $table->string('numero_entrega', 20)->unique();
            $table->integer('id_tecnico');
            $table->date('fecha_entrega');
            $table->date('fecha_devolucion')->nullable();
            $table->enum('estado', ['Entregado', 'Devuelto'])->default('Entregado');
            $table->integer('registrado_por');
            $table->integer('devuelto_por')->nullable();
            $table->text('observaciones')->nullable();
            $table->text('motivo_devolucion')->nullable();
            $table->timestamps();

            $table->foreign('id_tecnico')->references('id')->on('tecnicos')->onDelete('cascade');
            $table->foreign('registrado_por')->references('id')->on('personal')->onDelete('cascade');
            $table->foreign('devuelto_por')->references('id')->on('personal')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrega_epp');
    }
};
