<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventario_ajustes', function (Blueprint $table) {
            $table->id();
            $table->integer('id_producto');
            $table->integer('stock_anterior');
            $table->integer('stock_nuevo');
            $table->integer('diferencia');
            $table->enum('tipo_ajuste', ['Entrada', 'Salida']);
            $table->string('motivo', 120);
            $table->text('observacion')->nullable();
            $table->integer('id_usuario')->nullable();
            $table->timestamp('fecha_ajuste')->useCurrent();
            $table->unsignedBigInteger('id_kardex')->nullable();

            $table->index(['id_producto', 'fecha_ajuste']);
            $table->index('id_usuario');
            $table->index('tipo_ajuste');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventario_ajustes');
    }
};
