<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Insertar nuevas áreas: Gerencia y Almacén
        DB::table('area')->insert([
            ['id' => 6, 'nombre' => 'Gerencia', 'estado' => 'Activo'],
            ['id' => 7, 'nombre' => 'Almacén', 'estado' => 'Activo'],
        ]);

        // 2) Asignar Admin Sistema al área Gerencia (acceso total)
        DB::table('personal')->where('id', 1)->update(['id_area' => 6]);

        // 3) Asegurar que el password del usuario "prueba" esté hasheado
        $prueba = DB::table('personal')->where('id', 2)->first();
        if ($prueba && !str_starts_with($prueba->password, '$2y$')) {
            DB::table('personal')->where('id', 2)->update([
                'password' => Hash::make($prueba->password),
            ]);
        }
    }

    public function down(): void
    {
        // Revertir: Admin sin área
        DB::table('personal')->where('id', 1)->update(['id_area' => null]);
        // Eliminar áreas nuevas
        DB::table('area')->whereIn('id', [6, 7])->delete();
    }
};
