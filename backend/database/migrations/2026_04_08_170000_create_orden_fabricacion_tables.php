<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orden_fabricacion', function (Blueprint $table) {
            $table->increments('id');
            $table->string('codigo', 30)->unique();
            $table->date('fecha_orden');
            $table->string('motivo', 255)->nullable();
            $table->enum('estado', ['Borrador', 'Confirmada', 'Programada', 'Fabricada', 'Anulada'])->default('Confirmada');
            $table->json('resumen_insumos')->nullable();
            $table->text('observaciones')->nullable();
            $table->integer('creado_por')->nullable();
            $table->timestamps();

            $table->index(['fecha_orden', 'estado'], 'idx_of_fecha_estado');
        });

        Schema::create('detalle_orden_fabricacion', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_orden_fabricacion');
            $table->integer('id_producto_final');
            $table->decimal('cantidad', 12, 3);
            $table->json('receta_snapshot')->nullable();
            $table->json('insumos_requeridos')->nullable();

            $table->foreign('id_orden_fabricacion', 'fk_det_of_orden')
                ->references('id')->on('orden_fabricacion')
                ->onDelete('cascade');
            $table->foreign('id_producto_final', 'fk_det_of_producto')
                ->references('id')->on('productos')
                ->onDelete('restrict');

            $table->index('id_orden_fabricacion', 'idx_det_of_orden');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_orden_fabricacion', function (Blueprint $table) {
            $table->dropForeign('fk_det_of_orden');
            $table->dropForeign('fk_det_of_producto');
        });

        Schema::dropIfExists('detalle_orden_fabricacion');
        Schema::dropIfExists('orden_fabricacion');
    }
};
