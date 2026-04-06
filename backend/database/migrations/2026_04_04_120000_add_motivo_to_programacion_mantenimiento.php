<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programacion_mantenimiento', function (Blueprint $table) {
            if (!Schema::hasColumn('programacion_mantenimiento', 'motivo')) {
                $table->string('motivo', 255)->nullable()->after('id_actmanten');
            }
        });
    }

    public function down(): void
    {
        Schema::table('programacion_mantenimiento', function (Blueprint $table) {
            if (Schema::hasColumn('programacion_mantenimiento', 'motivo')) {
                $table->dropColumn('motivo');
            }
        });
    }
};
