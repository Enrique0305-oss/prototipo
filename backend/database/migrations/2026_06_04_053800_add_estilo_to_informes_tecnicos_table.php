<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('informes_tecnicos', function (Blueprint $table) {
            $table->string('estilo')->nullable()->default('detallado')->after('hoja_tipo');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('informes_tecnicos', function (Blueprint $table) {
            $table->dropColumn('estilo');
        });
    }
};
