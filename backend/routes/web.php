<?php

use Illuminate\Support\Facades\Route;
use App\Models\Cotizacion;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/cotizacion/test/{id}', function($id) {
    $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio'])->find($id);

    if (!$cotizacion) {
        return "No se encontró la cotización con ID: $id";
    }

    return view('CotizacionPDF', compact('cotizacion'));
});
