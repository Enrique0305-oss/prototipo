<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orden_servicio_equipo', function (Blueprint $table) {
            $table->id();
            $table->integer('id_orden_servicio');
            $table->integer('id_equipo');
            $table->string('observacion', 255)->nullable();

            $table->foreign('id_orden_servicio')->references('id')->on('orden_servicio')->cascadeOnDelete();
            $table->foreign('id_equipo')->references('id')->on('equipo')->cascadeOnDelete();
            $table->unique(['id_orden_servicio', 'id_equipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orden_servicio_equipo');
    }
};
