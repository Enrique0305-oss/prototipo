<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id();
            $table->string('razon_social', 200);
            $table->string('ruc', 20)->unique()->nullable();
            $table->string('nombre_comercial', 200)->nullable();
            $table->string('contacto_nombre', 150)->nullable();
            $table->string('contacto_telefono', 30)->nullable();
            $table->string('contacto_email', 150)->nullable();
            $table->string('direccion', 300)->nullable();
            $table->string('banco', 100)->nullable();
            $table->string('numero_cuenta', 50)->nullable();
            $table->string('cci', 50)->nullable();
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index('estado');
            $table->index('razon_social');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};
