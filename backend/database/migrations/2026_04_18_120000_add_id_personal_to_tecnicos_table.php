<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tecnicos')) {
            return;
        }

        Schema::table('tecnicos', function (Blueprint $table) {
            if (!Schema::hasColumn('tecnicos', 'id_personal')) {
                $table->unsignedInteger('id_personal')->nullable()->after('correo');
                $table->unique('id_personal', 'uq_tecnicos_id_personal');
                $table->index('id_personal', 'idx_tecnicos_id_personal');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tecnicos') || !Schema::hasColumn('tecnicos', 'id_personal')) {
            return;
        }

        Schema::table('tecnicos', function (Blueprint $table) {
            $table->dropIndex('idx_tecnicos_id_personal');
            $table->dropUnique('uq_tecnicos_id_personal');
            $table->dropColumn('id_personal');
        });
    }
};
