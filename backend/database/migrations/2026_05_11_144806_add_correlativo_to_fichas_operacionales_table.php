<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fichas_operacionales', function (Blueprint $table) {
            $table->string('correlativo')->nullable()->after('id_usuario_creador')->index();
        });

        // Poblar registros existentes
        $fichas = DB::table('fichas_operacionales')->orderBy('id')->get();
        foreach ($fichas as $index => $ficha) {
            $nuevoCorrelativo = 'FO-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT);
            DB::table('fichas_operacionales')
                ->where('id', $ficha->id)
                ->update(['correlativo' => $nuevoCorrelativo]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fichas_operacionales', function (Blueprint $table) {
            $table->dropColumn('correlativo');
        });
    }
};
