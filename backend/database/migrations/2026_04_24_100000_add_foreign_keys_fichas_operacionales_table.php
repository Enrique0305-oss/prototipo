<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar foreign key constraint
        Schema::table('fichas_operacionales', function (Blueprint $table) {
            $table->foreign('id_programacion_servicio')
                ->references('id')
                ->on('programacion_servicio')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fichas_operacionales', function (Blueprint $table) {
            $table->dropForeign(['id_programacion_servicio']);
        });
    }
};
