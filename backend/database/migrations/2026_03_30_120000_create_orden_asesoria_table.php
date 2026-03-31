<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orden_asesoria', function (Blueprint $table) {
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
            $table->unsignedInteger('num_participantes')->default(1);
            $table->unsignedInteger('num_certificados')->default(0);
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

        try {
            Schema::table('orden_asesoria', function (Blueprint $table) {
                $table->foreign('id_cotizacion', 'fk_orden_asesoria_cotizacion')
                    ->references('id')->on('cotizacion')
                    ->onDelete('cascade');
                $table->foreign('id_cliente', 'fk_orden_asesoria_cliente')
                    ->references('id')->on('clientes')
                    ->onDelete('restrict');
                $table->foreign('id_servicio', 'fk_orden_asesoria_servicio')
                    ->references('id')->on('servicios')
                    ->nullOnDelete();
                $table->foreign('id_exponente', 'fk_orden_asesoria_exponente')
                    ->references('id')->on('exponentes')
                    ->nullOnDelete();
                $table->foreign('emitido_por', 'fk_orden_asesoria_emitido_por')
                    ->references('id')->on('personal')
                    ->nullOnDelete();
            });
        } catch (\Exception $e) {
            // Permitir continuar si hay diferencias de engine/collation
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('orden_asesoria');
    }
};
