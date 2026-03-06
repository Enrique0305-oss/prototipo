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
        Schema::table('programacion_servicio', function (Blueprint $table) {
            $table->string('dias_semana', 100)->nullable()->after('fecha_programada')
                  ->comment('Días de la semana específicos cuando frecuencia es "Días de la semana" (CSV: Lunes,Martes,etc.)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programacion_servicio', function (Blueprint $table) {
            $table->dropColumn('dias_semana');
        });
    }
};
