<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('programacion_servicio', 'id_tecnico_asignado')) {
            DB::statement('ALTER TABLE programacion_servicio MODIFY id_tecnico_asignado INT NULL');
        }

        if (Schema::hasColumn('programacion_servicio', 'requiere_asignacion_recursos')) {
            $idsPendientes = DB::table('programacion_servicio')
                ->where('requiere_asignacion_recursos', true)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->filter(fn (int $id) => $id > 0)
                ->values()
                ->all();

            DB::table('programacion_servicio')
                ->whereIn('id', $idsPendientes)
                ->update([
                    'id_tecnico_asignado' => null,
                    'id_supervisor' => null,
                    'id_vehiculo' => null,
                ]);

            if (!empty($idsPendientes)) {
                DB::table('programacion_tecnicos')
                    ->whereIn('id_programacion', $idsPendientes)
                    ->delete();
            }
        }
    }

    public function down(): void
    {
        // Irreversible safely: pending schedules may intentionally keep null technician.
    }
};
