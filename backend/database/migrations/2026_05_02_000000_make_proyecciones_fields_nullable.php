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
        Schema::table('proyecciones', function (Blueprint $table) {
            // Hacer que estos campos sean nullable
            $table->string('actividad', 100)->nullable()->change();
            $table->string('n_factura', 100)->nullable()->change();
            $table->integer('dias_credito')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proyecciones', function (Blueprint $table) {
            // Revertir a NOT NULL si es necesario
            $table->string('actividad', 100)->nullable(false)->change();
            $table->string('n_factura', 100)->nullable(false)->change();
            $table->integer('dias_credito')->nullable(false)->change();
        });
    }
};
