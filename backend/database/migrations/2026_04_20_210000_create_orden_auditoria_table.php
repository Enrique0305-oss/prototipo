<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('orden_auditoria')) {
            Schema::create('orden_auditoria', function (Blueprint $table) {
                $table->id();
                $table->string('numero_orden', 30)->unique();
                $table->unsignedInteger('id_cotizacion')->unique();
                $table->unsignedInteger('id_cliente');
                $table->unsignedInteger('id_servicio')->nullable();
                $table->unsignedInteger('id_exponente')->nullable();
                $table->date('fecha_servicio');
                $table->date('fecha_aceptacion')->nullable();
                $table->time('hora_servicio')->nullable();
                $table->enum('modalidad', ['Presencial', 'Virtual', 'Híbrido', 'Asíncrona']);
                $table->unsignedInteger('duracion_dias')->default(1);
                $table->decimal('subtotal', 12, 2)->default(0);
                $table->decimal('igv', 12, 2)->default(0);
                $table->boolean('incluye_igv')->default(true);
                $table->decimal('costo', 12, 2)->default(0);
                $table->string('estado', 20)->default('Aprobado');
                $table->unsignedInteger('emitido_por')->nullable();
                $table->text('observaciones')->nullable();

                $table->index('id_cliente');
                $table->index('id_servicio');
                $table->index('estado');
                $table->index('fecha_servicio');
            });
        }

        try {
            if (Schema::hasTable('orden_auditoria')) {
                Schema::table('orden_auditoria', function (Blueprint $table) {
                    $table->foreign('id_cotizacion', 'fk_orden_auditoria_cotizacion')
                        ->references('id')->on('cotizacion')
                        ->onDelete('cascade');
                    $table->foreign('id_cliente', 'fk_orden_auditoria_cliente')
                        ->references('id')->on('cliente')
                        ->onDelete('restrict');
                    $table->foreign('id_servicio', 'fk_orden_auditoria_servicio')
                        ->references('id')->on('servicios')
                        ->nullOnDelete();
                    $table->foreign('id_exponente', 'fk_orden_auditoria_exponente')
                        ->references('id')->on('exponentes')
                        ->nullOnDelete();
                    $table->foreign('emitido_por', 'fk_orden_auditoria_emitido_por')
                        ->references('id')->on('personal')
                        ->nullOnDelete();
                });
            }
        } catch (\Exception $e) {
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('orden_auditoria');
    }
};