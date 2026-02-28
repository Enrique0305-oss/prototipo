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
        Schema::create('detalle_entrega_epp', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_entrega_epp');
            $table->integer('id_producto');
            $table->integer('cantidad')->default(1);
            $table->string('observacion')->nullable();

            $table->foreign('id_entrega_epp')->references('id')->on('entrega_epp')->onDelete('cascade');
            $table->foreign('id_producto')->references('id')->on('productos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_entrega_epp');
    }
};
