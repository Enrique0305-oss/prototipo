<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rrhh_horarios', function (Blueprint $table) {
            $table->boolean('es_descanso')->default(false)->after('activo')
                  ->comment('Si es true, es día de descanso (no se marca asistencia)');
        });
    }

    public function down(): void
    {
        Schema::table('rrhh_horarios', function (Blueprint $table) {
            $table->dropColumn('es_descanso');
        });
    }
};
