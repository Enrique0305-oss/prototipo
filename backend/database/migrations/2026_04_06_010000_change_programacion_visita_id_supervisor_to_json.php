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
        DB::statement('ALTER TABLE programacion_visita MODIFY id_supervisor JSON NULL');
        DB::statement('UPDATE programacion_visita SET id_supervisor = JSON_ARRAY(id_supervisor) WHERE id_supervisor IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE programacion_visita SET id_supervisor = CASE WHEN JSON_TYPE(id_supervisor) = 'ARRAY' THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(id_supervisor, '$[0]')) AS UNSIGNED) ELSE NULL END");
        DB::statement('ALTER TABLE programacion_visita MODIFY id_supervisor INT NULL');
    }
};
