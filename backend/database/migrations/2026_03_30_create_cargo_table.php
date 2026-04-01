<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('cargo')) {
            Schema::create('cargo', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('id_area')->nullable();
                $table->string('nombre')->unique();
                $table->text('descripcion')->nullable();
                $table->enum('estado', ['activo', 'inactivo'])->default('activo');
                $table->timestamps();

                $table->foreign('id_area')->references('id')->on('area')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cargo');
    }
};
