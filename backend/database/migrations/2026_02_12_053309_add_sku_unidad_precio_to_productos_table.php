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
        Schema::table('productos', function (Blueprint $table) {
            $table->string('sku', 50)->nullable()->unique()->after('id');
            $table->string('unidad', 20)->nullable()->after('ubicacion');
            $table->decimal('precio_unitario', 10, 2)->nullable()->after('unidad');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['sku', 'unidad', 'precio_unitario']);
        });
    }
};
