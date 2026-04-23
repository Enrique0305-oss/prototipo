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
        // Si la tabla ya existe, eliminarla y recrearla correctamente
        if (Schema::hasTable('fichas_operacionales')) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            Schema::drop('fichas_operacionales');
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
            
        Schema::create('fichas_operacionales', function (Blueprint $table) {
            $table->id();
            
            // Relaciones - sin constraints, se agregan después
            $table->integer('id_programacion_servicio')->index();
            $table->integer('id_grupo_programacion')->nullable()->index();
            $table->integer('id_usuario_creador')->nullable();
            // Estado del formulario
            $table->enum('estado', ['borrador', 'completada'])->default('borrador')->index();
            
            // Datos del cliente y ubicación
            $table->string('cliente')->nullable();
            $table->string('direccion')->nullable();
            $table->date('fecha')->nullable();
            $table->time('hora_llegada')->nullable();
            $table->time('hora_inicio')->nullable();
            $table->time('hora_final')->nullable();
            
            // Detalles del servicio
            $table->string('giro')->nullable();
            $table->text('diagnostico')->nullable();
            $table->text('condicion_sanitaria')->nullable();
            
            // Datos técnicos (JSON)
            $table->json('actividades_realizadas')->nullable();
            $table->json('equipos')->nullable();
            $table->json('insumos_utilizados')->nullable();
            $table->json('areas_tratadas')->nullable();
            
            // Acciones post-servicio
            $table->text('acciones_correctivas')->nullable();
            $table->text('recomendaciones')->nullable();
            $table->json('firmas')->nullable();
            $table->text('observaciones')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->timestamp('fecha_finalizacion')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fichas_operacionales');
    }
};
