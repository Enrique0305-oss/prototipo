<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('entrada_devolucion_fabricacion', function (Blueprint $table) {
            if (!Schema::hasColumn('entrada_devolucion_fabricacion', 'estado')) {
                $table->enum('estado', ['Pendiente', 'Realizado'])
                    ->default('Pendiente')
                    ->after('creado_por');
                $table->index('estado', 'idx_efd_estado');
            }

            if (!Schema::hasColumn('entrada_devolucion_fabricacion', 'fecha_realizado')) {
                $table->timestamp('fecha_realizado')->nullable()->after('estado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('entrada_devolucion_fabricacion', function (Blueprint $table) {
            if (Schema::hasColumn('entrada_devolucion_fabricacion', 'fecha_realizado')) {
                $table->dropColumn('fecha_realizado');
            }

            if (Schema::hasColumn('entrada_devolucion_fabricacion', 'estado')) {
                $table->dropIndex('idx_efd_estado');
                $table->dropColumn('estado');
            }
        });
    }
};