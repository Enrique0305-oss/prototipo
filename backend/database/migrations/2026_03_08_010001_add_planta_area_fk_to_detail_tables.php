<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // cotizacion_detalle
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta')->nullable()->after('id_cotizacion');
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable()->after('id_cliente_planta');
            $table->foreign('id_cliente_planta')->references('id')->on('cliente_planta')->onDelete('set null');
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->onDelete('set null');
        });

        // detalle_orden_servicio
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta')->nullable()->after('id_orden_servicio');
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable()->after('id_cliente_planta');
            $table->foreign('id_cliente_planta')->references('id')->on('cliente_planta')->onDelete('set null');
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->onDelete('set null');
        });

        // programacion_servicio
        Schema::table('programacion_servicio', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta')->nullable()->after('id_orden_capacitacion');
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable()->after('id_cliente_planta');
            $table->foreign('id_cliente_planta')->references('id')->on('cliente_planta')->onDelete('set null');
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->dropForeign(['id_cliente_planta']);
            $table->dropForeign(['id_cliente_planta_area']);
            $table->dropColumn(['id_cliente_planta', 'id_cliente_planta_area']);
        });
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->dropForeign(['id_cliente_planta']);
            $table->dropForeign(['id_cliente_planta_area']);
            $table->dropColumn(['id_cliente_planta', 'id_cliente_planta_area']);
        });
        Schema::table('programacion_servicio', function (Blueprint $table) {
            $table->dropForeign(['id_cliente_planta']);
            $table->dropForeign(['id_cliente_planta_area']);
            $table->dropColumn(['id_cliente_planta', 'id_cliente_planta_area']);
        });
    }
};
