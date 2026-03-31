<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_orden_asesoria', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_orden_asesoria');
            $table->string('item', 255)->nullable();
            $table->text('descripcion')->nullable();

            $table->index('id_orden_asesoria');
        });

        try {
            Schema::table('detalle_orden_asesoria', function (Blueprint $table) {
                $table->foreign('id_orden_asesoria', 'fk_detalle_orden_asesoria_orden')
                    ->references('id')->on('orden_asesoria')
                    ->onDelete('cascade');
            });
        } catch (\Exception $e) {
            // Permitir continuar si hay diferencias de engine/collation
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_orden_asesoria');
    }
};
