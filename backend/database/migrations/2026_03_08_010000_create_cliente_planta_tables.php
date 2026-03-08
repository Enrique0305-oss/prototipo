<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_planta', function (Blueprint $table) {
            $table->id();
            $table->integer('id_cliente');
            $table->string('nombre', 150);           // "Planta Lima Norte", "Sede Central"
            $table->string('direccion', 255)->nullable();
            $table->string('distrito', 100)->nullable();
            $table->string('provincia', 100)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->string('referencia', 255)->nullable();
            $table->string('coordenadas', 80)->nullable();
            $table->string('contacto_nombre', 100)->nullable();
            $table->string('contacto_telefono', 20)->nullable();
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo');

            $table->foreign('id_cliente')->references('id')->on('cliente')->onDelete('cascade');
        });

        Schema::create('cliente_planta_area', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_cliente_planta');
            $table->string('nombre', 150);           // "Cocina", "Almacén", "Oficinas"
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo');

            $table->foreign('id_cliente_planta')->references('id')->on('cliente_planta')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_planta_area');
        Schema::dropIfExists('cliente_planta');
    }
};
