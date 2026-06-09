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
        Schema::create('caja_chicas', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->enum('tipo_movimiento', ['Ingreso', 'Egreso']);
            $table->string('solicitante')->nullable();
            $table->string('area')->nullable();
            $table->string('proveedor')->nullable();
            $table->string('documento')->nullable();
            $table->string('concepto');
            $table->string('tipo_dinero')->nullable();
            $table->string('numero_operacion')->nullable();
            $table->decimal('subtotal', 10, 2)->nullable();
            $table->decimal('ingreso', 10, 2)->default(0);
            $table->decimal('egreso', 10, 2)->default(0);
            $table->decimal('saldo_actual', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caja_chicas');
    }
};
