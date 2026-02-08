<?php

use Illuminate\Support\Facades\Route;
use App\Models\Cotizacion;
use App\Http\Controllers\API\CotizacionController;

Route::get('/', function () {
    return view('welcome');
});

// Ruta para generar PDF de cotización
Route::get('/cotizacion/pdf/{id}', [CotizacionController::class, 'generarPDF']);

// Ruta de prueba (vista HTML)
Route::get('/cotizacion/test/{id}', function($id) {
    $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio', 'detalles.producto', 'creador'])->find($id);

    if (!$cotizacion) {
        return "No se encontró la cotización con ID: $id";
    }

    return view('CotizacionPDF', compact('cotizacion'));
});
