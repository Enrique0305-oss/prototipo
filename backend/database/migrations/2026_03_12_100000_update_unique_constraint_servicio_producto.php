<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Primero crear el nuevo índice (cubre id_servicio e id_producto para los FK)
        DB::statement('ALTER TABLE servicio_producto ADD UNIQUE sp_servicio_producto_equipo_unique (id_servicio, id_producto, id_equipo)');
        // Ahora se puede eliminar el viejo porque el FK ya tiene otro índice que lo respalda
        DB::statement('ALTER TABLE servicio_producto DROP INDEX servicio_producto_id_servicio_id_producto_unique');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE servicio_producto ADD UNIQUE servicio_producto_id_servicio_id_producto_unique (id_servicio, id_producto)');
        DB::statement('ALTER TABLE servicio_producto DROP INDEX sp_servicio_producto_equipo_unique');
    }
};
