<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            // Eliminar constraint antiguo (orden + servicio + equipo)
            $table->dropUnique('ose_orden_servicio_equipo_unique');

            // Nuevo constraint que permite mismo equipo en diferentes plantas/áreas
            $table->unique(
                ['id_orden_servicio', 'id_servicio', 'id_equipo', 'id_cliente_planta', 'id_cliente_planta_area'],
                'ose_orden_equipo_planta_area_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->dropUnique('ose_orden_equipo_planta_area_unique');
            $table->unique(
                ['id_orden_servicio', 'id_servicio', 'id_equipo'],
                'ose_orden_servicio_equipo_unique'
            );
        });
    }
};
