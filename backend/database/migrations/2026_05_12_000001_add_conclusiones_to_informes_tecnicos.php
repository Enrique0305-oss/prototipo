<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('informes_tecnicos')) {
            Schema::table('informes_tecnicos', function (Blueprint $table) {
                if (!Schema::hasColumn('informes_tecnicos', 'conclusiones')) {
                    $table->text('conclusiones')->nullable()->after('hoja_tipo');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('informes_tecnicos')) {
            Schema::table('informes_tecnicos', function (Blueprint $table) {
                if (Schema::hasColumn('informes_tecnicos', 'conclusiones')) {
                    $table->dropColumn('conclusiones');
                }
            });
        }
    }
};
