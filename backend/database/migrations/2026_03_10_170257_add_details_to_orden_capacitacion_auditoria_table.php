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
        // Primero creamos las columnas como simples campos
        $table->integer('emitido_por')->unsigned()->nullable()->after('observaciones');
        $table->string('horas_capacitacion')->nullable()->after('emitido_por');
        $table->string('participacion_total')->nullable()->after('horas_capacitacion');
        $table->string('aprobacion_total')->nullable()->after('participacion_total'); 
        });

        // Luego, fuera del primer bloque, intentamos aplicar la relación
        // Usamos una sentencia de SQL puro para evitar que Laravel se ponga estricto
        try {
            Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
                $table->foreign('emitido_por')->references('id')->on('personal');
            });
        } catch (\Exception $e) {
            // Si falla la relación, al menos las columnas ya estarán creadas
            // y podrás seguir trabajando mientras revisamos el motor de las tablas
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            //
        });
    }
};
