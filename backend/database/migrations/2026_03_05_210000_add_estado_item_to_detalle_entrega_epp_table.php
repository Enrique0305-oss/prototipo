<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalle_entrega_epp', function (Blueprint $table) {
            // Estado del ítem individual
            $table->enum('estado_item', ['Activo', 'Devuelto', 'Reemplazado'])
                  ->default('Activo')
                  ->after('observacion_devolucion');

            // Referencia a qué entrega lo reemplazó (solo cuando estado_item = 'Reemplazado')
            $table->unsignedBigInteger('id_entrega_reemplazo')
                  ->nullable()
                  ->after('estado_item');

            $table->foreign('id_entrega_reemplazo')
                  ->references('id')->on('entrega_epp')
                  ->onDelete('set null');
        });

        // Marcar como Activo todos los registros existentes que estén en entregas en estado Entregado
        DB::statement("
            UPDATE detalle_entrega_epp d
            JOIN entrega_epp e ON d.id_entrega_epp = e.id
            SET d.estado_item = 'Activo'
            WHERE e.estado = 'Entregado'
        ");

        // Marcar como Devuelto todos los registros existentes que estén en entregas Devueltas
        DB::statement("
            UPDATE detalle_entrega_epp d
            JOIN entrega_epp e ON d.id_entrega_epp = e.id
            SET d.estado_item = 'Devuelto'
            WHERE e.estado = 'Devuelto'
        ");
    }

    public function down(): void
    {
        Schema::table('detalle_entrega_epp', function (Blueprint $table) {
            $table->dropForeign(['id_entrega_reemplazo']);
            $table->dropColumn(['estado_item', 'id_entrega_reemplazo']);
        });
    }
};
