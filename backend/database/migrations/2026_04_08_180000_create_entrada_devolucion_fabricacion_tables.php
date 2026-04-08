<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('detalle_entrada_devolucion_fabricacion');
        Schema::dropIfExists('entrada_devolucion_fabricacion');
        Schema::enableForeignKeyConstraints();

        Schema::create('entrada_devolucion_fabricacion', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_orden_fabricacion');
            $table->unsignedInteger('id_programacion_fabricacion');
            $table->decimal('cantidad_esperada_total', 12, 3)->default(0);
            $table->decimal('cantidad_producida_total', 12, 3)->default(0);
            $table->text('motivo_diferencia')->nullable();
            $table->boolean('tiene_sobrante_materia_prima')->default(false);
            $table->text('observaciones')->nullable();
            $table->integer('creado_por')->nullable();
            $table->timestamps();

            $table->foreign('id_orden_fabricacion', 'fk_efd_orden')
                ->references('id')->on('orden_fabricacion')
                ->onDelete('cascade');
            $table->foreign('id_programacion_fabricacion', 'fk_efd_programacion')
                ->references('id')->on('programacion_fabricacion')
                ->onDelete('cascade');
            $table->unique('id_programacion_fabricacion', 'uq_efd_prog');

            $table->index('id_orden_fabricacion', 'idx_efd_orden');
        });

        Schema::create('detalle_entrada_devolucion_fabricacion', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_entrada_devolucion_fabricacion');
            $table->enum('tipo', ['EntradaProducto', 'DevolucionInsumo']);
            $table->integer('id_producto');
            $table->decimal('cantidad', 12, 3);
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->foreign('id_entrada_devolucion_fabricacion', 'fk_det_efd_header')
                ->references('id')->on('entrada_devolucion_fabricacion')
                ->onDelete('cascade');
            $table->foreign('id_producto', 'fk_det_efd_producto')
                ->references('id')->on('productos')
                ->onDelete('restrict');

            $table->index('id_entrada_devolucion_fabricacion', 'idx_det_efd_header');
            $table->index(['tipo', 'id_producto'], 'idx_det_efd_tipo_producto');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_entrada_devolucion_fabricacion', function (Blueprint $table) {
            $table->dropForeign('fk_det_efd_header');
            $table->dropForeign('fk_det_efd_producto');
        });

        Schema::table('entrada_devolucion_fabricacion', function (Blueprint $table) {
            $table->dropForeign('fk_efd_orden');
            $table->dropForeign('fk_efd_programacion');
        });

        Schema::dropIfExists('detalle_entrada_devolucion_fabricacion');
        Schema::dropIfExists('entrada_devolucion_fabricacion');
    }
};
