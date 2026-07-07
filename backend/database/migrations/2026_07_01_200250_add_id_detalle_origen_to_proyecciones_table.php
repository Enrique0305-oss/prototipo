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
            $table->unsignedBigInteger('id_detalle_origen')->nullable()->after('id_referencia')->comment('ID del detalle de la orden que generó esta proyección parcial (si aplica)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proyecciones', function (Blueprint $table) {
            $table->dropColumn('id_detalle_origen');
        });
    }
};
