<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('programacion_servicio_inicios')) {
            return;
        }

        Schema::create('programacion_servicio_inicios', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('id_programacion');
            $table->integer('id_usuario');
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->integer('duracion_segundos')->nullable();
            $table->timestamps();

            $table->index('id_programacion', 'idx_prog_serv_inicios_programacion');
            $table->index('id_usuario', 'idx_prog_serv_inicios_usuario');
            $table->index(['id_programacion', 'id_usuario'], 'idx_prog_serv_inicios_prog_usuario');
            $table->index('fecha_inicio', 'idx_prog_serv_inicios_fecha_inicio');

            $table->foreign('id_programacion', 'fk_prog_serv_inicios_programacion')
                ->references('id')
                ->on('programacion_servicio')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('programacion_servicio_inicios')) {
            return;
        }

        Schema::table('programacion_servicio_inicios', function (Blueprint $table) {
            $table->dropForeign('fk_prog_serv_inicios_programacion');
        });

        Schema::dropIfExists('programacion_servicio_inicios');
    }
};
