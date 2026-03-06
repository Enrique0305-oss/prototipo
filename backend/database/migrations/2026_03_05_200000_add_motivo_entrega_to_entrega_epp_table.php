<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('entrega_epp', function (Blueprint $table) {
            $table->enum('motivo_entrega', [
                'Primera Asignación',
                'Reemplazo por Daño',
                'Reemplazo por Desgaste',
                'Reemplazo por Pérdida',
                'Reposición Periódica',
                'Solicitud del Técnico',
            ])->default('Primera Asignación')->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('entrega_epp', function (Blueprint $table) {
            $table->dropColumn('motivo_entrega');
        });
    }
};
