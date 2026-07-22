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
        Schema::table('formato_operacional_detalles', function (Blueprint $table) {
            $table->boolean('oculto_en_falsa')->default(false)->after('conteo_estadio_falsa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formato_operacional_detalles', function (Blueprint $table) {
            $table->dropColumn('oculto_en_falsa');
        });
    }
};
