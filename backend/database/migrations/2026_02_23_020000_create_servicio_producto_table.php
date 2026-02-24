<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicio_producto', function (Blueprint $table) {
            $table->id();
            $table->integer('id_servicio');
            $table->integer('id_producto');
            $table->decimal('cantidad_default', 10, 2)->default(1);
            $table->string('observacion', 255)->nullable();

            $table->foreign('id_servicio')->references('id')->on('servicios')->cascadeOnDelete();
            $table->foreign('id_producto')->references('id')->on('productos')->cascadeOnDelete();
            $table->unique(['id_servicio', 'id_producto']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicio_producto');
    }
};
