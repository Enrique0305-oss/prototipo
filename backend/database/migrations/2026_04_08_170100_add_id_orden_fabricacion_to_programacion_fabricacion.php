<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programacion_fabricacion', function (Blueprint $table) {
            $table->unsignedInteger('id_orden_fabricacion')->nullable()->after('id');
            $table->foreign('id_orden_fabricacion', 'fk_prog_fabricacion_of')
                ->references('id')->on('orden_fabricacion')
                ->onDelete('set null');
            $table->index('id_orden_fabricacion', 'idx_prog_fabricacion_of');
        });
    }

    public function down(): void
    {
        Schema::table('programacion_fabricacion', function (Blueprint $table) {
            $table->dropForeign('fk_prog_fabricacion_of');
            $table->dropIndex('idx_prog_fabricacion_of');
            $table->dropColumn('id_orden_fabricacion');
        });
    }
};
