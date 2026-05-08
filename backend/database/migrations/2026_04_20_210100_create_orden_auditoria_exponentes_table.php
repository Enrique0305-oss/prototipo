<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('orden_auditoria_exponentes')) {
            Schema::create('orden_auditoria_exponentes', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('id_orden_auditoria');
                $table->unsignedInteger('id_exponente');
                $table->unique(['id_orden_auditoria', 'id_exponente'], 'uq_orden_auditoria_exponente');
            });
        }

        try {
            if (Schema::hasTable('orden_auditoria_exponentes')) {
                Schema::table('orden_auditoria_exponentes', function (Blueprint $table) {
                    $table->foreign('id_orden_auditoria', 'fk_orden_auditoria_exp_orden')
                        ->references('id')->on('orden_auditoria')
                        ->onDelete('cascade');
                    $table->foreign('id_exponente', 'fk_orden_auditoria_exp_exponente')
                        ->references('id')->on('exponentes')
                        ->onDelete('cascade');
                });
            }
        } catch (\Exception $e) {
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('orden_auditoria_exponentes');
    }
};