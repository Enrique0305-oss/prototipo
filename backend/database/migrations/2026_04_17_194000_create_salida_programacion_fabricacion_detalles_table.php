<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('salida_prog_fab_detalles')) {
            Schema::create('salida_prog_fab_detalles', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('id_programacion_fabricacion');
                $table->integer('id_producto');
                $table->integer('cantidad_entregada');
                $table->unsignedBigInteger('id_lote')->nullable();
                $table->timestamps();

                $table->index(['id_programacion_fabricacion', 'id_producto'], 'idx_salida_prog_fab_detalles_prog_prod');
                $table->index('id_lote', 'idx_salida_prog_fab_detalles_lote');
            });
        }

        // Compatibilidad con intentos fallidos previos: normaliza tipos y agrega llaves en pasos separados.
        DB::statement('ALTER TABLE salida_prog_fab_detalles MODIFY id_programacion_fabricacion INT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE salida_prog_fab_detalles MODIFY id_producto INT NOT NULL');
        DB::statement('ALTER TABLE salida_prog_fab_detalles MODIFY id_lote BIGINT UNSIGNED NULL');

        try {
            DB::statement('ALTER TABLE salida_prog_fab_detalles ADD INDEX idx_salida_prog_fab_detalles_prog_prod (id_programacion_fabricacion, id_producto)');
        } catch (\Throwable $e) {
        }

        try {
            DB::statement('ALTER TABLE salida_prog_fab_detalles ADD INDEX idx_salida_prog_fab_detalles_lote (id_lote)');
        } catch (\Throwable $e) {
        }

        try {
            DB::statement('ALTER TABLE salida_prog_fab_detalles ADD CONSTRAINT fk_salida_prog_fab_detalles_prog_fab FOREIGN KEY (id_programacion_fabricacion) REFERENCES programacion_fabricacion(id) ON DELETE CASCADE');
        } catch (\Throwable $e) {
        }

        try {
            DB::statement('ALTER TABLE salida_prog_fab_detalles ADD CONSTRAINT fk_salida_prog_fab_detalles_prod FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE');
        } catch (\Throwable $e) {
        }

        try {
            DB::statement('ALTER TABLE salida_prog_fab_detalles ADD CONSTRAINT fk_salida_prog_fab_detalles_lote FOREIGN KEY (id_lote) REFERENCES lotes(id) ON DELETE SET NULL');
        } catch (\Throwable $e) {
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('salida_prog_fab_detalles');
    }
};
