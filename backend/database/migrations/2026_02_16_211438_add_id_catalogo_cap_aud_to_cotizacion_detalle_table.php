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
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->unsignedBigInteger('id_catalogo_cap_aud')->nullable()->after('id_producto');
            $table->foreign('id_catalogo_cap_aud')->references('id')->on('catalogo_capacitacion_auditoria')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->dropForeign(['id_catalogo_cap_aud']);
            $table->dropColumn('id_catalogo_cap_aud');
        });
    }
};
