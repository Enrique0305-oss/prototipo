<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kardex', function (Blueprint $table) {
            $table->id();
            $table->integer('id_producto');
            $table->enum('tipo_movimiento', ['Entrada', 'Salida']);
            $table->integer('cantidad');
            $table->integer('stock_anterior');
            $table->integer('stock_posterior');
            $table->string('motivo', 100); // 'Orden Producto', 'Ajuste Manual', 'Compra', 'Devolución', etc.
            $table->string('referencia', 100)->nullable(); // ej: 'OP-2026-001'
            $table->unsignedBigInteger('id_referencia')->nullable(); // ID de la orden u otro documento
            $table->integer('id_usuario')->nullable(); // Quién realizó el movimiento
            $table->text('observacion')->nullable();
            $table->timestamp('fecha_movimiento')->useCurrent();

            $table->foreign('id_producto')->references('id')->on('productos')->onDelete('cascade');
            $table->foreign('id_usuario')->references('id')->on('personal')->onDelete('set null');

            $table->index(['id_producto', 'fecha_movimiento']);
            $table->index('tipo_movimiento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kardex');
    }
};
