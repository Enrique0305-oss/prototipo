<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->dropForeign('orden_capacitacion_auditoria_id_exponente_foreign');
        });

        \Illuminate\Support\Facades\DB::statement('ALTER TABLE orden_capacitacion_auditoria MODIFY id_ponente INT NULL');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE orden_capacitacion_auditoria MODIFY id_exponente INT NULL');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE orden_capacitacion_ponentes MODIFY id_ponente INT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE orden_capacitacion_auditoria MODIFY id_ponente INT NOT NULL');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE orden_capacitacion_auditoria MODIFY id_exponente INT NOT NULL');
    }
};
