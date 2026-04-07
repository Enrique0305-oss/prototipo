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
        // MySQL no permite índices directos sobre columnas JSON.
        // Eliminamos FK/índices existentes en id_supervisor antes de modificar el tipo.
        DB::statement("SET @fk_name := (SELECT kcu.CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE kcu WHERE kcu.TABLE_SCHEMA = DATABASE() AND kcu.TABLE_NAME = 'programacion_servicio' AND kcu.COLUMN_NAME = 'id_supervisor' AND kcu.REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1)");
        DB::statement("SET @drop_fk_sql := IF(@fk_name IS NULL, 'SELECT 1', CONCAT('ALTER TABLE programacion_servicio DROP FOREIGN KEY `', @fk_name, '`'))");
        DB::statement('PREPARE drop_fk_stmt FROM @drop_fk_sql');
        DB::statement('EXECUTE drop_fk_stmt');
        DB::statement('DEALLOCATE PREPARE drop_fk_stmt');

        DB::statement("SET @drop_idx_sql := (SELECT IFNULL(CONCAT('ALTER TABLE programacion_servicio ', GROUP_CONCAT(CONCAT('DROP INDEX `', s.INDEX_NAME, '`') SEPARATOR ', ')), 'SELECT 1') FROM (SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'programacion_servicio' AND COLUMN_NAME = 'id_supervisor' AND INDEX_NAME <> 'PRIMARY') s)");
        DB::statement('PREPARE drop_idx_stmt FROM @drop_idx_sql');
        DB::statement('EXECUTE drop_idx_stmt');
        DB::statement('DEALLOCATE PREPARE drop_idx_stmt');

        DB::statement('ALTER TABLE programacion_servicio MODIFY id_supervisor JSON NULL');
        DB::statement('UPDATE programacion_servicio SET id_supervisor = JSON_ARRAY(id_supervisor) WHERE id_supervisor IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE programacion_servicio SET id_supervisor = CASE WHEN JSON_TYPE(id_supervisor) = 'ARRAY' THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(id_supervisor, '$[0]')) AS UNSIGNED) ELSE NULL END");
        DB::statement('ALTER TABLE programacion_servicio MODIFY id_supervisor INT NULL');
    }
};
