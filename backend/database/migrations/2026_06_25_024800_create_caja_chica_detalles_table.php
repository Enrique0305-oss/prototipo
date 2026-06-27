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
        Schema::create('caja_chica_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_chica_id')->constrained('caja_chicas')->onDelete('cascade');
            $table->string('concepto');
            $table->decimal('monto', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caja_chica_detalles');
    }
};
