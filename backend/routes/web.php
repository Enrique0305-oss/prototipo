<?php

use Illuminate\Support\Facades\Route;
use App\Models\Cotizacion;
use App\Http\Controllers\API\CotizacionController;
use App\Models\OrdenServicio;
use App\Http\Controllers\API\OrdenServicioController;

Route::get('/', function () {
    return view('welcome');
});

// Ruta para generar PDF de cotización
Route::get('/cotizacion/pdf/{id}', [CotizacionController::class, 'generarPDF']);
// Ruta para generar el PDF (descarga/stream)
Route::get('/orden-servicio/pdf/{id}', [OrdenServicioController::class, 'generarPDF']);

// Ruta de prueba (vista HTML)
Route::get('/cotizacion/test/{id}', function($id) {
    $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio', 'detalles.producto', 'creador'])->find($id);

    if (!$cotizacion) {
        return "No se encontró la cotización con ID: $id";
    }

    return view('CotizacionPDF', compact('cotizacion'));
});

Route::get('/orden-servicio/test/{id}', function($id) {
    // Usamos 'emisor' que es como está en tu modelo
    $orden = App\Models\OrdenServicio::with([
        'cliente', 
        'detalles.servicio', 
        'emisor', 
        'cotizacion'
    ])->find($id);

    if (!$orden) {
        return "No se encontró la Orden de Servicio con ID: $id";
    }

    return view('OrdenServicioPDF', compact('orden'));
});

// Ruta de prueba específica para ORDEN DE PRODUCTO
Route::get('/orden-producto/test/{id}', function($id) {
    // 1. Intentamos buscar la orden con todas sus relaciones
    $orden = \App\Models\OrdenProducto::with([
        'cliente', 
        'detalles.producto', 
        'emisor', 
        'cotizacion'
    ])->find($id);

    // 2. Si no la encuentra, lanzamos un mensaje más detallado para investigar
    if (!$orden) {
        $existeEnBD = \DB::table('orden_producto')->where('id', $id)->exists();
        if ($existeEnBD) {
            return "La orden ID $id existe, pero hay un error en las relaciones del modelo.";
        }
        return "La orden con ID $id no existe en la tabla orden_producto.";
    }

    return view('OrdenProductoPDF', compact('orden'));
});