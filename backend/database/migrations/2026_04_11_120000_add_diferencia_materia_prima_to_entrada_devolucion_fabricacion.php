<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('entrada_devolucion_fabricacion', function (Blueprint $table) {
            if (!Schema::hasColumn('entrada_devolucion_fabricacion', 'tiene_diferencia_materia_prima')) {
                $table->boolean('tiene_diferencia_materia_prima')
                    ->default(false)
                    ->after('tiene_sobrante_materia_prima');
            }
        });

        $driver = DB::connection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE detalle_entrada_devolucion_fabricacion MODIFY COLUMN tipo ENUM('EntradaProducto','DevolucionInsumo','ConsumoDiferenciaInsumo')");
        }
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE detalle_entrada_devolucion_fabricacion MODIFY COLUMN tipo ENUM('EntradaProducto','DevolucionInsumo')");
        }

        Schema::table('entrada_devolucion_fabricacion', function (Blueprint $table) {
            if (Schema::hasColumn('entrada_devolucion_fabricacion', 'tiene_diferencia_materia_prima')) {
                $table->dropColumn('tiene_diferencia_materia_prima');
            }
        });
    }
};
