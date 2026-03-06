<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_ordenes_compra', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_orden_compra');
            $table->integer('id_producto');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 12, 4);  // Precio que envía el proveedor
            $table->decimal('subtotal', 12, 4);         // cantidad * precio_unitario
            $table->string('observacion', 300)->nullable();
            $table->timestamps();

            $table->foreign('id_orden_compra')->references('id')->on('ordenes_compra')->onDelete('cascade');
            $table->foreign('id_producto')->references('id')->on('productos')->onDelete('restrict');

            $table->index('id_orden_compra');
            $table->index('id_producto');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ordenes_compra');
    }
};
