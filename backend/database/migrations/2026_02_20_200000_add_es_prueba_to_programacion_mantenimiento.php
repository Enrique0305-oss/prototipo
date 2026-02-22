<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programacion_mantenimiento', function (Blueprint $table) {
            $table->boolean('es_prueba')->default(false)->after('observaciones');
        });

        // Cambiar fecha de date a datetime para soportar pruebas con minutos
        Schema::table('mantenimiento', function (Blueprint $table) {
            $table->dateTime('fecha')->change();
        });
    }

    public function down(): void
    {
        Schema::table('programacion_mantenimiento', function (Blueprint $table) {
            $table->dropColumn('es_prueba');
        });

        Schema::table('mantenimiento', function (Blueprint $table) {
            $table->date('fecha')->change();
        });
    }
};
