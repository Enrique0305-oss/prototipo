<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalle_entrega_epp', function (Blueprint $table) {
            $table->string('condicion_devolucion')->nullable()->after('observacion');
            $table->string('observacion_devolucion')->nullable()->after('condicion_devolucion');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_entrega_epp', function (Blueprint $table) {
            $table->dropColumn(['condicion_devolucion', 'observacion_devolucion']);
        });
    }
};
