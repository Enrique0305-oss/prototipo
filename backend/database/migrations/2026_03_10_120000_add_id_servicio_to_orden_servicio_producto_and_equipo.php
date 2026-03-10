<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orden_servicio_producto', function (Blueprint $table) {
            $table->integer('id_servicio')->nullable()->after('id_orden_servicio');
            $table->foreign('id_servicio', 'osp_servicio_fk')->references('id')->on('servicios')->nullOnDelete();
        });

        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->integer('id_servicio')->nullable()->after('id_orden_servicio');
            $table->foreign('id_servicio', 'ose_servicio_fk')->references('id')->on('servicios')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orden_servicio_producto', function (Blueprint $table) {
            $table->dropForeign('osp_servicio_fk');
            $table->dropColumn('id_servicio');
        });

        Schema::table('orden_servicio_equipo', function (Blueprint $table) {
            $table->dropForeign('ose_servicio_fk');
            $table->dropColumn('id_servicio');
        });
    }
};
