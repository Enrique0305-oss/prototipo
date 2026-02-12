<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cotizacion', function (Blueprint $table) {
            $table->boolean('incluye_igv')->default(true)->after('tipo_cotizacion');
            $table->text('observaciones')->nullable()->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('cotizacion', function (Blueprint $table) {
            $table->dropColumn(['incluye_igv', 'observaciones']);
        });
    }
};
