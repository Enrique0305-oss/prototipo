<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->string('fosfina_producto', 255)->nullable()->after('frecuencia');
            $table->string('fosfina_cantidad', 50)->nullable()->after('fosfina_producto');
            $table->json('medida_tanque')->nullable()->after('fosfina_cantidad');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_orden_servicio', function (Blueprint $table) {
            $table->dropColumn(['fosfina_producto', 'fosfina_cantidad', 'medida_tanque']);
        });
    }
};
