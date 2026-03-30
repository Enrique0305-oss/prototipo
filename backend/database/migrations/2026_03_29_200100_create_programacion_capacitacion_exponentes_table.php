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
        Schema::create('programacion_capacitacion_exponentes', function (Blueprint $table) {
            $table->id();
            $table->integer('id_programacion_capacitacion');
            $table->unsignedBigInteger('id_exponente');
            $table->timestamps();

            $table->unique(['id_programacion_capacitacion', 'id_exponente'], 'uq_prog_cap_exponente');
            $table->index('id_programacion_capacitacion', 'idx_prog_cap_exp_prog');
            $table->index('id_exponente', 'idx_prog_cap_exp_exp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programacion_capacitacion_exponentes');
    }
};
