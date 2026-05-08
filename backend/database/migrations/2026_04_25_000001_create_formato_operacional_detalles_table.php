<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('formato_operacional_detalles')) {
            Schema::create('formato_operacional_detalles', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('id_formato_operacional')->index();
                $table->enum('tipo_seccion', ['cebo', 'lamina', 'trampa_luz', 'otros'])->default('otros')->index();
                $table->string('codigo_caja', 15);
                $table->integer('orden_caja');
                $table->integer('id_producto')->nullable()->index();
                $table->string('descripcion')->nullable();
                $table->string('ubicacion');
                $table->string('estado_dispositivo', 20)->nullable();
                $table->string('hallazgo', 30)->nullable();
                $table->string('senales_presencia', 30)->nullable();
                $table->string('numero_lote', 60)->nullable();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('formato_operacional_detalles')) {
            DB::statement('ALTER TABLE formato_operacional_detalles MODIFY id_formato_operacional BIGINT UNSIGNED NOT NULL');

            try {
                DB::statement('ALTER TABLE formato_operacional_detalles ADD CONSTRAINT formato_operacional_detalles_id_formato_operacional_foreign FOREIGN KEY (id_formato_operacional) REFERENCES formatos_operacionales(id) ON DELETE CASCADE');
            } catch (\Throwable $e) {
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('formato_operacional_detalles');
    }
};