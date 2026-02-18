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
        Schema::create('catalogo_capacitacion_auditoria', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['Capacitación', 'Auditoría']);
            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->decimal('precio_referencial', 10, 2)->nullable();
            $table->integer('duracion_horas')->nullable();
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_capacitacion_auditoria');
    }
};
