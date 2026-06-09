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
        Schema::create('estado_cuenta', function (Blueprint $table) {
            $table->id();
            $table->enum('cuenta', ['Multi', 'CIM']);
            $table->date('fecha');
            $table->enum('tipo_movimiento', ['Ingreso', 'Egreso', 'Saldo inicial']);
            $table->string('descripcion')->nullable(); // Cliente y/o proveedor
            $table->string('detalle')->nullable();     // Concepto
            $table->string('factura_doc')->nullable();
            $table->decimal('monto', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('estado_cuenta');
    }
};
