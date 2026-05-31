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
        Schema::table('programacion_visita', function (Blueprint $table) {
            $table->json('fotos_evidencia')->nullable()->after('observaciones');
        });
        Schema::table('programacion_fabricacion', function (Blueprint $table) {
            $table->json('fotos_evidencia')->nullable()->after('observaciones');
        });
        Schema::table('programacion_otros', function (Blueprint $table) {
            $table->json('fotos_evidencia')->nullable()->after('observaciones');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programaciones_secundarias', function (Blueprint $table) {
            //
        });
    }
};
