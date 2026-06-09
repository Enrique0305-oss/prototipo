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
        Schema::create('informes_tecnicos', function (Blueprint $table) {
            $table->id(); // bigint(20) UNSIGNED
            $table->string('correlativo', 20)->unique()->nullable();
            $table->integer('id_cliente')->index(); // int(11) para coincidir con tabla cliente
            $table->integer('id_usuario_creador')->index(); // int(11) para coincidir con tabla personal
            $table->string('mes_actividad', 20);
            $table->date('fecha_emision');
            $table->string('elaborado_por', 255)->nullable();
            $table->text('actividad')->nullable();
            $table->string('ubicacion', 255)->nullable();
            $table->enum('hoja_tipo', ['verdadera', 'falsa'])->default('verdadera');
            $table->json('visitas')->nullable(); 
            $table->json('evidencias')->nullable();
            $table->json('insumos')->nullable();
            $table->enum('estado', ['pendiente', 'emitido', 'anulado'])->default('pendiente');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_cliente')->references('id')->on('cliente')->onDelete('cascade');
            $table->foreign('id_usuario_creador')->references('id')->on('personal')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('informes_tecnicos');
    }
};
