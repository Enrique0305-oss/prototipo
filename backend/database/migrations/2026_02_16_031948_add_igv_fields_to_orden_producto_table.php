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
        Schema::table('orden_producto', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->nullable()->after('total');
            $table->decimal('igv', 10, 2)->nullable()->after('subtotal');
            $table->boolean('incluye_igv')->default(true)->after('igv');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orden_producto', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'igv', 'incluye_igv']);
        });
    }
};
