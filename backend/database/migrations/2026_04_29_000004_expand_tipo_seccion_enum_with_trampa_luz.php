<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('formato_operacional_detalles')) {
            return;
        }

        DB::statement("ALTER TABLE formato_operacional_detalles MODIFY tipo_seccion ENUM('cebo','lamina','trampa_luz','otros') NOT NULL DEFAULT 'otros'");
    }

    public function down(): void
    {
        if (!Schema::hasTable('formato_operacional_detalles')) {
            return;
        }

        // Evita error al quitar el valor del ENUM en rollback.
        DB::statement("UPDATE formato_operacional_detalles SET tipo_seccion = 'otros' WHERE tipo_seccion = 'trampa_luz'");
        DB::statement("ALTER TABLE formato_operacional_detalles MODIFY tipo_seccion ENUM('cebo','lamina','otros') NOT NULL DEFAULT 'otros'");
    }
};
