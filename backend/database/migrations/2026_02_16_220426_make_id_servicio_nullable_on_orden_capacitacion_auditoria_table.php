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
            $table->integer('id_servicio')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->integer('id_servicio')->nullable(false)->change();
        });
    }
};
