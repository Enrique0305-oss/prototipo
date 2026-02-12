<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cliente', function (Blueprint $table) {
            $table->string('persona_contacto', 100)->nullable()->after('direccion');
            $table->string('telefono_contacto', 20)->nullable()->after('persona_contacto');
            $table->string('origen', 50)->nullable()->after('telefono_contacto');
            $table->date('fecha_registro')->nullable()->after('origen');
        });
    }

    public function down(): void
    {
        Schema::table('cliente', function (Blueprint $table) {
            $table->dropColumn(['persona_contacto', 'telefono_contacto', 'origen', 'fecha_registro']);
        });
    }
};
