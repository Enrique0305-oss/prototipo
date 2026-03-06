<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordenes_compra', function (Blueprint $table) {
            $table->id();
            // Numeración interna auto-generada
            $table->string('numero_orden_compra', 30)->unique()->nullable();
            // Referencia del proveedor
            $table->string('numero_cotizacion_proveedor', 60)->nullable(); // Ej: "1014-04 MARZO 2026"
            $table->string('numero_factura', 60)->nullable();              // Ej: "E001-1383"
            $table->unsignedBigInteger('id_proveedor');
            $table->date('fecha_compra');
            $table->date('fecha_recepcion')->nullable();
            $table->enum('tipo_moneda', ['PEN', 'USD'])->default('PEN');
            $table->decimal('tipo_cambio', 8, 4)->nullable();              // Solo si USD
            $table->boolean('tiene_igv')->default(true);
            $table->decimal('subtotal', 12, 4)->default(0);
            $table->decimal('igv', 12, 4)->default(0);
            $table->decimal('total', 12, 4)->default(0);
            $table->enum('estado', ['Pendiente', 'Recibido', 'Anulado'])->default('Pendiente');
            $table->integer('id_usuario')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->foreign('id_proveedor')->references('id')->on('proveedores')->onDelete('restrict');
            $table->foreign('id_usuario')->references('id')->on('personal')->onDelete('set null');

            $table->index(['estado', 'fecha_compra']);
            $table->index('id_proveedor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordenes_compra');
    }
};
