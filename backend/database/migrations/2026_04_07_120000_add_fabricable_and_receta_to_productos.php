<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->boolean('es_fabricable')->default(false)->after('presentacion');
        });

        Schema::create('producto_receta_detalle', function (Blueprint $table) {
            $table->id();
            $table->integer('id_producto_final');
            $table->integer('id_producto_insumo');
            $table->decimal('cantidad', 10, 3);
            $table->string('unidad', 20)->nullable();
            $table->string('observacion', 255)->nullable();

            $table->foreign('id_producto_final')->references('id')->on('productos')->cascadeOnDelete();
            $table->foreign('id_producto_insumo')->references('id')->on('productos')->cascadeOnDelete();
            $table->unique(['id_producto_final', 'id_producto_insumo'], 'ux_producto_receta_final_insumo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_receta_detalle');

        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('es_fabricable');
        });
    }
};
