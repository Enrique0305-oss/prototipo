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
        Schema::table('orden_servicio', function (Blueprint $table) {
            $table->renameColumn('aprobacion', 'estado');
        });
        Schema::table('orden_producto', function (Blueprint $table) {
            $table->renameColumn('aprobacion', 'estado');
        });
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->renameColumn('aprobacion', 'estado');
        });
    }

    public function down(): void
    {
        Schema::table('orden_servicio', function (Blueprint $table) {
            $table->renameColumn('estado', 'aprobacion');
        });
        Schema::table('orden_producto', function (Blueprint $table) {
            $table->renameColumn('estado', 'aprobacion');
        });
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->renameColumn('estado', 'aprobacion');
        });
    }
};
