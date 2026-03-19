<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipo', function (Blueprint $table) {
            $table->string('imagen', 500)->nullable()->after('contacto');
        });
    }

    public function down(): void
    {
        Schema::table('equipo', function (Blueprint $table) {
            $table->dropColumn('imagen');
        });
    }
};
