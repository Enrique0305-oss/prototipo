<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orden_servicio', function (Blueprint $table) {
            $table->string('aprobacion', 100)->default('Aprobado')->after('emitido_por');
        });

        Schema::table('orden_producto', function (Blueprint $table) {
            $table->string('aprobacion', 100)->default('Aprobado')->after('emitido_por');
        });

        // Establecer "Aprobado" para registros existentes
        DB::table('orden_servicio')->whereNull('aprobacion')->orWhere('aprobacion', '')->update(['aprobacion' => 'Aprobado']);
        DB::table('orden_producto')->whereNull('aprobacion')->orWhere('aprobacion', '')->update(['aprobacion' => 'Aprobado']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orden_servicio', function (Blueprint $table) {
            $table->dropColumn('aprobacion');
        });

        Schema::table('orden_producto', function (Blueprint $table) {
            $table->dropColumn('aprobacion');
        });
    }
};
