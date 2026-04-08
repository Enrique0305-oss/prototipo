<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Reutiliza la misma columna existente medida_tanque cambiando su tipo a JSON.
        DB::statement('ALTER TABLE `cotizacion_detalle` MODIFY `medida_tanque` JSON NULL');
    }

    public function down(): void
    {
        // Rollback a texto para compatibilidad si se requiere revertir.
        DB::statement('ALTER TABLE `cotizacion_detalle` MODIFY `medida_tanque` VARCHAR(255) NULL');
    }
};
