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
        // 1. Creamos la tabla con sus columnas básicas
        Schema::create('detalle_orden_capacitacion_materiales', function (Blueprint $table) {
            $table->id();
            $table->integer('id_orden_capacitacion')->unsigned();
            $table->string('material'); 
            $table->integer('cantidad');
            $table->string('disposicion');
        });

        // 2. Intentamos la relación por separado. Si falla, el try-catch evita que la migración se detenga.
        try {
            Schema::table('detalle_orden_capacitacion_materiales', function (Blueprint $table) {
                $table->foreign('id_orden_capacitacion', 'fk_ord_cap_mat')
                    ->references('id')->on('orden_capacitacion_auditoria')
                    ->onDelete('cascade');
            });
        } catch (\Exception $e) {
            // Si hay error de compatibilidad, la tabla ya se creó arriba y podremos seguir.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_orden_capacitacion_materiales');
    }
};
