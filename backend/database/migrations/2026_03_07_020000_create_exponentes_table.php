<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exponentes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('apellidos', 100);
            $table->string('especialidad', 200)->nullable();
            $table->string('profesion', 200)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('institucion', 200)->nullable();
            $table->text('notas')->nullable();
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exponentes');
    }
};
