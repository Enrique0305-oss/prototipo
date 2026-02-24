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
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->boolean('incluye_igv')->default(true)->after('costo');
            $table->decimal('subtotal', 10, 2)->nullable()->after('costo');
            $table->decimal('igv', 10, 2)->nullable()->after('subtotal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orden_capacitacion_auditoria', function (Blueprint $table) {
            $table->dropColumn(['incluye_igv', 'subtotal', 'igv']);
        });
    }
};
