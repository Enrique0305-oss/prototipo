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
        Schema::create('programacion_asesoria_exponentes', function (Blueprint $table) {
            $table->id();
            $table->integer('id_programacion_asesoria');
            $table->unsignedBigInteger('id_exponente');
            $table->timestamps();

            $table->unique(['id_programacion_asesoria', 'id_exponente'], 'uq_prog_ase_exponente');
            $table->index('id_programacion_asesoria', 'idx_prog_ase_exp_prog');
            $table->index('id_exponente', 'idx_prog_ase_exp_exp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programacion_asesoria_exponentes');
    }
};
