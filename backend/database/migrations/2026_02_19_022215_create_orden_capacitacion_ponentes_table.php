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
        Schema::create('orden_capacitacion_ponentes', function (Blueprint $table) {
            $table->id();
            $table->integer('id_orden_capacitacion');
            $table->integer('id_ponente');

            $table->foreign('id_orden_capacitacion')
                  ->references('id')
                  ->on('orden_capacitacion_auditoria')
                  ->onDelete('cascade');

            $table->foreign('id_ponente')
                  ->references('id')
                  ->on('personal')
                  ->onDelete('cascade');

            $table->unique(['id_orden_capacitacion', 'id_ponente'], 'oc_ponentes_orden_ponente_unique');
        });

        // Migrar datos existentes: copiar id_ponente actual a la tabla pivot
        $ordenes = \DB::table('orden_capacitacion_auditoria')->whereNotNull('id_ponente')->get();
        foreach ($ordenes as $orden) {
            \DB::table('orden_capacitacion_ponentes')->insert([
                'id_orden_capacitacion' => $orden->id,
                'id_ponente' => $orden->id_ponente,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orden_capacitacion_ponentes');
    }
};
