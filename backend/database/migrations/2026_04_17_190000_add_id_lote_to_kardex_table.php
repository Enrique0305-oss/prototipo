<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kardex', function (Blueprint $table) {
            $table->unsignedBigInteger('id_lote')->nullable()->after('id_producto');
            $table->foreign('id_lote')->references('id')->on('lotes')->nullOnDelete();
            $table->index('id_lote');
        });
    }

    public function down(): void
    {
        Schema::table('kardex', function (Blueprint $table) {
            $table->dropForeign(['id_lote']);
            $table->dropIndex(['id_lote']);
            $table->dropColumn('id_lote');
        });
    }
};
