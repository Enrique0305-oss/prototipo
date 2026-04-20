<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lotes', function (Blueprint $table) {
            $table->id();
            $table->integer('id_producto');
            $table->string('numero_lote', 50);
            $table->date('fecha_vencimiento');
            $table->integer('cantidad');
            $table->integer('cantidad_disponible');
            $table->enum('estado', ['Activo', 'Vencido', 'Descartado'])->default('Activo');
            $table->text('observacion')->nullable();
            $table->timestamp('fecha_ingreso')->useCurrent();

            $table->foreign('id_producto')->references('id')->on('productos')->onDelete('cascade');
            $table->unique(['id_producto', 'numero_lote']);
            $table->index('fecha_vencimiento');
            $table->index('estado');
            $table->index(['id_producto', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lotes');
    }
};
