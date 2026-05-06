<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('formatos_operacionales')) {
            Schema::create('formatos_operacionales', function (Blueprint $table) {
                $table->id();
                $table->string('codigo_documento', 30)->default('FO-OP-002');
                $table->string('version', 10)->default('01');
                $table->unsignedBigInteger('id_programacion_servicio')->index();
                $table->unsignedInteger('id_grupo_programacion')->nullable()->index();
                $table->unsignedBigInteger('id_usuario_creador')->nullable();
                $table->enum('estado', ['borrador', 'completada'])->default('borrador')->index();
                $table->string('cliente')->nullable();
                $table->string('direccion')->nullable();
                $table->date('fecha')->nullable();
                $table->time('hora_llegada')->nullable();
                $table->time('hora_inicio')->nullable();
                $table->time('hora_final')->nullable();
                $table->text('observaciones')->nullable();
                $table->timestamps();
                $table->timestamp('fecha_finalizacion')->nullable();
            });
        }

        if (Schema::hasTable('formatos_operacionales')) {
            DB::statement("SET @fk_name := (SELECT kcu.CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE kcu WHERE kcu.TABLE_SCHEMA = DATABASE() AND kcu.TABLE_NAME = 'formatos_operacionales' AND kcu.COLUMN_NAME = 'id_programacion_servicio' AND kcu.REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1)");
            DB::statement("SET @drop_fk_sql := IF(@fk_name IS NULL, 'SELECT 1', CONCAT('ALTER TABLE formatos_operacionales DROP FOREIGN KEY `', @fk_name, '`'))");
            DB::statement('PREPARE stmt FROM @drop_fk_sql');
            DB::statement('EXECUTE stmt');
            DB::statement('DEALLOCATE PREPARE stmt');

            DB::statement("SET @fk_name := (SELECT kcu.CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE kcu WHERE kcu.TABLE_SCHEMA = DATABASE() AND kcu.TABLE_NAME = 'formatos_operacionales' AND kcu.COLUMN_NAME = 'id_grupo_programacion' AND kcu.REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1)");
            DB::statement("SET @drop_fk_sql := IF(@fk_name IS NULL, 'SELECT 1', CONCAT('ALTER TABLE formatos_operacionales DROP FOREIGN KEY `', @fk_name, '`'))");
            DB::statement('PREPARE stmt FROM @drop_fk_sql');
            DB::statement('EXECUTE stmt');
            DB::statement('DEALLOCATE PREPARE stmt');

            DB::statement('ALTER TABLE formatos_operacionales MODIFY id_programacion_servicio BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE formatos_operacionales MODIFY id_grupo_programacion INT UNSIGNED NULL');
            DB::statement('ALTER TABLE formatos_operacionales MODIFY id_usuario_creador BIGINT UNSIGNED NULL');

            try {
                DB::statement('ALTER TABLE formatos_operacionales ADD CONSTRAINT formatos_operacionales_id_programacion_servicio_foreign FOREIGN KEY (id_programacion_servicio) REFERENCES programacion_servicio(id) ON DELETE CASCADE');
            } catch (\Throwable $e) {
            }

            try {
                DB::statement('ALTER TABLE formatos_operacionales ADD CONSTRAINT formatos_operacionales_id_grupo_programacion_foreign FOREIGN KEY (id_grupo_programacion) REFERENCES programacion_servicio_grupos(id) ON DELETE SET NULL');
            } catch (\Throwable $e) {
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('formatos_operacionales');
    }
};