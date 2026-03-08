<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agregar columna id_exponente a la tabla pivot
        Schema::table('orden_capacitacion_ponentes', function (Blueprint $table) {
            $table->unsignedBigInteger('id_exponente')->nullable()->after('id_ponente');

            $table->foreign('id_exponente')
                  ->references('id')
                  ->on('exponentes')
                  ->onDelete('cascade');
        });

        // Agregar id_exponente a la tabla principal (ponente principal)
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->unsignedBigInteger('id_exponente')->nullable()->after('id_ponente');

            $table->foreign('id_exponente')
                  ->references('id')
                  ->on('exponentes')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('orden_capacitacion_ponentes', function (Blueprint $table) {
            $table->dropForeign(['id_exponente']);
            $table->dropColumn('id_exponente');
        });

        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->dropForeign(['id_exponente']);
            $table->dropColumn('id_exponente');
        });
    }
};
