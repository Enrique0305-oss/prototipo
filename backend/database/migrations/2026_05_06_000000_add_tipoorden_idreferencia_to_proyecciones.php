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
        Schema::table('proyecciones', function (Blueprint $table) {
            if (!Schema::hasColumn('proyecciones', 'tipo_orden')) {
                $table->string('tipo_orden', 50)->nullable()->after('id_multicim');
            }
            if (!Schema::hasColumn('proyecciones', 'id_referencia')) {
                $table->integer('id_referencia')->nullable()->after('tipo_orden');
            }
            if (!Schema::hasColumn('proyecciones', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
            if (!Schema::hasColumn('proyecciones', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proyecciones', function (Blueprint $table) {
            if (Schema::hasColumn('proyecciones', 'tipo_orden')) {
                $table->dropColumn('tipo_orden');
            }
            if (Schema::hasColumn('proyecciones', 'id_referencia')) {
                $table->dropColumn('id_referencia');
            }
            if (Schema::hasColumn('proyecciones', 'created_at')) {
                $table->dropColumn('created_at');
            }
            if (Schema::hasColumn('proyecciones', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }
};
