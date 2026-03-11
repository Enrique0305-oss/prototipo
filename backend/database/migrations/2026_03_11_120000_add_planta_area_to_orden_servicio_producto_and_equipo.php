<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orden_servicio_producto', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta')->nullable()->after('id_servicio');
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable()->after('id_cliente_planta');

            $table->foreign('id_cliente_planta')->references('id')->on('cliente_planta')->nullOnDelete();
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->nullOnDelete();
        });

        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta')->nullable()->after('id_servicio');
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable()->after('id_cliente_planta');

            $table->foreign('id_cliente_planta')->references('id')->on('cliente_planta')->nullOnDelete();
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orden_servicio_producto', function (Blueprint $table) {
            $table->dropForeign(['id_cliente_planta']);
            $table->dropForeign(['id_cliente_planta_area']);
            $table->dropColumn(['id_cliente_planta', 'id_cliente_planta_area']);
        });

        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->dropForeign(['id_cliente_planta']);
            $table->dropForeign(['id_cliente_planta_area']);
            $table->dropColumn(['id_cliente_planta', 'id_cliente_planta_area']);
        });
    }
};
