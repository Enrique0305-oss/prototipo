<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear tabla padre programacion_mantenimiento
        Schema::create('programacion_mantenimiento', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('id_equipo');
            $table->integer('id_actmanten');
            $table->integer('anio');
            $table->integer('frecuencia_meses')->comment('Cada cuántos meses: 1,2,3,4,6,12');
            $table->date('fecha_inicio');
            $table->integer('total_programados')->default(0);
            $table->string('observaciones', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_equipo')->references('id')->on('equipo');
            $table->foreign('id_actmanten')->references('id')->on('actividades_mantenieminto');
        });

        // 2. Agregar columnas a mantenimiento
        Schema::table('mantenimiento', function (Blueprint $table) {
            $table->unsignedInteger('id_programacion')->nullable()->after('id');
            $table->enum('estado', ['Pendiente', 'Realizado', 'Vencido'])->default('Pendiente')->after('observaciones');

            $table->foreign('id_programacion')->references('id')->on('programacion_mantenimiento')->onDelete('cascade');
        });

        // 3. Marcar mantenimientos existentes (pasados) como Realizado
        \DB::table('mantenimiento')
            ->whereNull('id_programacion')
            ->where('fecha', '<=', now()->toDateString())
            ->update(['estado' => 'Realizado']);
    }

    public function down(): void
    {
        Schema::table('mantenimiento', function (Blueprint $table) {
            $table->dropForeign(['id_programacion']);
            $table->dropColumn(['id_programacion', 'estado']);
        });

        Schema::dropIfExists('programacion_mantenimiento');
    }
};
