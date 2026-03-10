<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servicio_producto', function (Blueprint $table) {
            $table->integer('id_equipo')->nullable()->after('id_producto');
            $table->foreign('id_equipo')->references('id')->on('equipo')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('servicio_producto', function (Blueprint $table) {
            $table->dropForeign(['id_equipo']);
            $table->dropColumn('id_equipo');
        });
    }
};
