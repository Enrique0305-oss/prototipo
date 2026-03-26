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
        if (Schema::hasTable('cotizacion_beneficio')) {
            Schema::drop('cotizacion_beneficio');
        }

        Schema::create('cotizacion_beneficio', function (Blueprint $table) {
            $table->id();
            $table->integer('id_cotizacion');
            $table->unsignedBigInteger('id_catalogo_cap_aud')->nullable();
            $table->string('nombre_beneficio', 255);
            $table->string('modalidad_sugerida', 80)->nullable();
            $table->decimal('horas_capacitacion', 8, 2)->nullable();
            $table->decimal('precio_referencial', 10, 2)->default(0);
            $table->string('observacion', 255)->nullable();
            $table->unsignedInteger('orden')->default(1);

            $table->foreign('id_cotizacion')->references('id')->on('cotizacion')->onDelete('cascade');
            $table->foreign('id_catalogo_cap_aud')->references('id')->on('catalogo_capacitacion_auditoria')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cotizacion_beneficio');
    }
};
