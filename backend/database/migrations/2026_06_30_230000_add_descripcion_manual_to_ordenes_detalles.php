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
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->unsignedBigInteger('id_servicio')->nullable()->change();
            $table->string('descripcion_manual')->nullable()->after('id_servicio');
        });

        Schema::table('detalle_orden_producto', function (Blueprint $table) {
            $table->unsignedBigInteger('id_producto')->nullable()->change();
            $table->string('descripcion_manual')->nullable()->after('id_producto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->dropColumn('descripcion_manual');
        });

        Schema::table('detalle_orden_producto', function (Blueprint $table) {
            $table->dropColumn('descripcion_manual');
        });
    }
};
