<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orden_asesoria_exponentes', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_orden_asesoria');
            $table->unsignedInteger('id_exponente');
            $table->unique(['id_orden_asesoria', 'id_exponente'], 'uq_orden_asesoria_exponente');
        });

        try {
            Schema::table('orden_asesoria_exponentes', function (Blueprint $table) {
                $table->foreign('id_orden_asesoria', 'fk_orden_asesoria_exp_orden')
                    ->references('id')->on('orden_asesoria')
                    ->onDelete('cascade');
                $table->foreign('id_exponente', 'fk_orden_asesoria_exp_exponente')
                    ->references('id')->on('exponentes')
                    ->onDelete('cascade');
            });
        } catch (\Exception $e) {
            // Permitir continuar si hay diferencias de engine/collation
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('orden_asesoria_exponentes');
    }
};
