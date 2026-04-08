<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tecnicos', function (Blueprint $table) {
            if (!Schema::hasColumn('tecnicos', 'id_exponente_vinculado')) {
                $table->unsignedBigInteger('id_exponente_vinculado')->nullable()->after('estado');
                $table->unique('id_exponente_vinculado', 'uq_tecnicos_exponente_vinculado');
            }
        });

        Schema::table('exponentes', function (Blueprint $table) {
            if (!Schema::hasColumn('exponentes', 'id_tecnico_vinculado')) {
                $table->unsignedBigInteger('id_tecnico_vinculado')->nullable()->after('estado');
                $table->unique('id_tecnico_vinculado', 'uq_exponentes_tecnico_vinculado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tecnicos', function (Blueprint $table) {
            if (Schema::hasColumn('tecnicos', 'id_exponente_vinculado')) {
                $table->dropUnique('uq_tecnicos_exponente_vinculado');
                $table->dropColumn('id_exponente_vinculado');
            }
        });

        Schema::table('exponentes', function (Blueprint $table) {
            if (Schema::hasColumn('exponentes', 'id_tecnico_vinculado')) {
                $table->dropUnique('uq_exponentes_tecnico_vinculado');
                $table->dropColumn('id_tecnico_vinculado');
            }
        });
    }
};
