<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('programacion_servicio_grupos')) {
            Schema::create('programacion_servicio_grupos', function (Blueprint $table) {
                $table->increments('id');
                $table->date('fecha_programada');
                $table->time('hora_inicio');
                $table->time('hora_fin');
                $table->unsignedBigInteger('id_cliente');
                $table->unsignedBigInteger('id_cliente_planta')->nullable();
                $table->json('tecnicos_ids')->nullable();
                $table->unsignedInteger('cantidad_programaciones')->default(0);
                $table->text('observaciones')->nullable();
                $table->unsignedBigInteger('creado_por')->nullable();
                $table->unsignedBigInteger('modificado_por')->nullable();
                $table->timestamps();

                $table->index(['fecha_programada', 'hora_inicio'], 'idx_prog_serv_grupo_fecha_hora');
                $table->index(['id_cliente', 'id_cliente_planta'], 'idx_prog_serv_grupo_cliente_planta');
            });
        }

        if (Schema::hasTable('programacion_servicio_grupos')) {
            DB::statement('ALTER TABLE programacion_servicio_grupos MODIFY id_cliente BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE programacion_servicio_grupos MODIFY id_cliente_planta BIGINT UNSIGNED NULL');
            DB::statement('ALTER TABLE programacion_servicio_grupos MODIFY creado_por BIGINT UNSIGNED NULL');
            DB::statement('ALTER TABLE programacion_servicio_grupos MODIFY modificado_por BIGINT UNSIGNED NULL');

            try {
                DB::statement('ALTER TABLE programacion_servicio_grupos ADD CONSTRAINT programacion_servicio_grupos_id_cliente_foreign FOREIGN KEY (id_cliente) REFERENCES cliente(id) ON DELETE CASCADE');
            } catch (\Throwable $e) {
            }

            try {
                DB::statement('ALTER TABLE programacion_servicio_grupos ADD CONSTRAINT programacion_servicio_grupos_id_cliente_planta_foreign FOREIGN KEY (id_cliente_planta) REFERENCES cliente_planta(id) ON DELETE SET NULL');
            } catch (\Throwable $e) {
            }

            try {
                DB::statement('ALTER TABLE programacion_servicio_grupos ADD CONSTRAINT programacion_servicio_grupos_creado_por_foreign FOREIGN KEY (creado_por) REFERENCES personal(id) ON DELETE SET NULL');
            } catch (\Throwable $e) {
            }

            try {
                DB::statement('ALTER TABLE programacion_servicio_grupos ADD CONSTRAINT programacion_servicio_grupos_modificado_por_foreign FOREIGN KEY (modificado_por) REFERENCES personal(id) ON DELETE SET NULL');
            } catch (\Throwable $e) {
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('programacion_servicio_grupos');
    }
};