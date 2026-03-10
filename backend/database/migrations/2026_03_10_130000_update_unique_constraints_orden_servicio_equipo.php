<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add a plain index so the FK doesn't depend on the unique index
        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->index('id_orden_servicio', 'ose_id_orden_servicio_index');
        });

        // Step 2: Drop old unique and add new one that includes id_servicio
        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->dropUnique('orden_servicio_equipo_id_orden_servicio_id_equipo_unique');
            $table->unique(['id_orden_servicio', 'id_servicio', 'id_equipo'], 'ose_orden_servicio_equipo_unique');
        });
    }

    public function down(): void
    {
        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->dropUnique('ose_orden_servicio_equipo_unique');
            $table->unique(['id_orden_servicio', 'id_equipo']);
        });

        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->dropIndex('ose_id_orden_servicio_index');
        });
    }
};
