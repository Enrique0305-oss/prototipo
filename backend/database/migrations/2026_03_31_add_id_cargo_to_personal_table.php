<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal', function (Blueprint $table) {
            // Agregar columna id_cargo si no existe
            if (!Schema::hasColumn('personal', 'id_cargo')) {
                $table->unsignedBigInteger('id_cargo')->nullable()->after('estado');
                $table->foreign('id_cargo')->references('id')->on('cargo')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('personal', function (Blueprint $table) {
            if (Schema::hasColumn('personal', 'id_cargo')) {
                $table->dropForeign(['id_cargo']);
                $table->dropColumn('id_cargo');
            }
        });
    }
};
