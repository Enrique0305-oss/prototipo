<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Para cotizacion_detalle - drop foreign key de forma segura
        try {
            DB::statement('ALTER TABLE `cotizacion_detalle` DROP FOREIGN KEY `cotizacion_detalle_id_cliente_planta_area_foreign`');
        } catch (\Exception $e) {
            // Foreign key puede no existir, ignorar
        }
        
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->dropColumn('id_cliente_planta_area');
            $table->json('id_cliente_planta_area')->nullable()->after('id_cliente_planta');
        });

        // Para detalle_orden_servicio
        try {
            DB::statement('ALTER TABLE `detalle_orden_servicio` DROP FOREIGN KEY `detalle_orden_servicio_id_cliente_planta_area_foreign`');
        } catch (\Exception $e) {
            // Foreign key puede no existir, ignorar
        }
        
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->dropColumn('id_cliente_planta_area');
            $table->json('id_cliente_planta_area')->nullable()->after('id_cliente_planta');
        });

        // Para programacion_servicio
        try {
            DB::statement('ALTER TABLE `programacion_servicio` DROP FOREIGN KEY `programacion_servicio_id_cliente_planta_area_foreign`');
        } catch (\Exception $e) {
            // Foreign key puede no existir, ignorar
        }
        
        Schema::table('programacion_servicio', function (Blueprint $table) {
            $table->dropColumn('id_cliente_planta_area');
            $table->json('id_cliente_planta_area')->nullable()->after('id_cliente_planta');
        });
    }

    public function down(): void
    {
        // Para cotizacion_detalle
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->dropColumn('id_cliente_planta_area');
        });
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable();
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->onDelete('set null');
        });

        // Para detalle_orden_servicio
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->dropColumn('id_cliente_planta_area');
        });
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable();
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->onDelete('set null');
        });

        // Para programacion_servicio
        Schema::table('programacion_servicio', function (Blueprint $table) {
            $table->dropColumn('id_cliente_planta_area');
        });
        Schema::table('programacion_servicio', function (Blueprint $table) {
            $table->unsignedBigInteger('id_cliente_planta_area')->nullable();
            $table->foreign('id_cliente_planta_area')->references('id')->on('cliente_planta_area')->onDelete('set null');
        });
    }
};
