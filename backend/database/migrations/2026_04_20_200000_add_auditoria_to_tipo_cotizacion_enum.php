<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $database = DB::getDatabaseName();
        $column = DB::selectOne(
            "SELECT DATA_TYPE AS data_type
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cotizacion' AND COLUMN_NAME = 'tipo_cotizacion'",
            [$database]
        );

        if (($column->data_type ?? null) === 'enum') {
            DB::statement("ALTER TABLE cotizacion MODIFY tipo_cotizacion ENUM('Servicio','Producto','Capacitacion','Asesoria','Auditoria') NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $database = DB::getDatabaseName();
        $column = DB::selectOne(
            "SELECT DATA_TYPE AS data_type
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cotizacion' AND COLUMN_NAME = 'tipo_cotizacion'",
            [$database]
        );

        if (($column->data_type ?? null) === 'enum') {
            DB::statement("ALTER TABLE cotizacion MODIFY tipo_cotizacion ENUM('Servicio','Producto','Capacitacion','Asesoria') NOT NULL");
        }
    }
};
