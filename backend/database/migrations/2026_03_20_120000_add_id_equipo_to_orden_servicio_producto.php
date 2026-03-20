<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('orden_servicio_producto', 'id_equipo')) {
            Schema::table('orden_servicio_producto', function (Blueprint $table) {
                $table->integer('id_equipo')->nullable()->after('id_cliente_planta_area');
            });
        }

        // Si quedó creada como bigint unsigned en un intento fallido, la ajustamos a int.
        DB::statement('ALTER TABLE orden_servicio_producto MODIFY COLUMN id_equipo INT NULL');

        $fkExists = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->whereRaw('TABLE_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', 'orden_servicio_producto')
            ->where('COLUMN_NAME', 'id_equipo')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->exists();

        if (!$fkExists) {
            Schema::table('orden_servicio_producto', function (Blueprint $table) {
                $table->foreign('id_equipo')->references('id')->on('equipo')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        $fkExists = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->whereRaw('TABLE_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', 'orden_servicio_producto')
            ->where('COLUMN_NAME', 'id_equipo')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->exists();

        if ($fkExists) {
            Schema::table('orden_servicio_producto', function (Blueprint $table) {
                $table->dropForeign(['id_equipo']);
            });
        }

        if (Schema::hasColumn('orden_servicio_producto', 'id_equipo')) {
            Schema::table('orden_servicio_producto', function (Blueprint $table) {
                $table->dropColumn('id_equipo');
            });
        }
    }
};
