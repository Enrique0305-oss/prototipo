<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal', function (Blueprint $table) {
            $table->string('estado', 20)->default('Activo')->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('personal', function (Blueprint $table) {
            $table->dropColumn('estado');
        });
    }
};
