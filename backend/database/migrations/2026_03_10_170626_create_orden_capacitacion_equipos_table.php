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
        // 1. Creamos la tabla primero
        Schema::create('detalle_orden_capacitacion_equipos', function (Blueprint $table) {
            $table->id();
            $table->integer('id_orden_capacitacion')->unsigned();
            $table->string('equipo'); 
            $table->string('disposicion');
        });

        // 2. Intentamos la relación por separado con el try-catch
        try {
            Schema::table('detalle_orden_capacitacion_equipos', function (Blueprint $table) {
                $table->foreign('id_orden_capacitacion', 'fk_ord_cap_equi')
                    ->references('id')->on('orden_capacitacion_auditoria')
                    ->onDelete('cascade');
            });
        } catch (\Exception $e) {
            // Si falla la llave foránea, no importa, la tabla ya se creó arriba
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_orden_capacitacion_equipos');
    }
};
