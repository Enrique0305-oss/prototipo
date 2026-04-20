<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalle_entrada_devolucion_fabricacion', function (Blueprint $table) {
            $table->unsignedBigInteger('id_lote')->nullable()->after('id_producto');
            $table->foreign('id_lote')->references('id')->on('lotes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('detalle_entrada_devolucion_fabricacion', function (Blueprint $table) {
            $table->dropForeign(['id_lote']);
            $table->dropColumn('id_lote');
        });
    }
};
