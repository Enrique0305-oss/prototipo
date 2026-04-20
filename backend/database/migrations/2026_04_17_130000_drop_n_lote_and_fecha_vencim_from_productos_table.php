<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            if (Schema::hasColumn('productos', 'n_lote')) {
                $table->dropColumn('n_lote');
            }

            if (Schema::hasColumn('productos', 'fecha_vencim')) {
                $table->dropColumn('fecha_vencim');
            }
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            if (!Schema::hasColumn('productos', 'n_lote')) {
                $table->string('n_lote', 50)->nullable()->after('ubicacion');
            }

            if (!Schema::hasColumn('productos', 'fecha_vencim')) {
                $table->date('fecha_vencim')->nullable()->after('id_categoria');
            }
        });
    }
};
