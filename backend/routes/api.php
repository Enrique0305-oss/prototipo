<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ClienteController;
use App\Http\Controllers\API\CotizacionController;
use App\Http\Controllers\API\OrdenProductoController;

// Rutas sin middleware para pruebas
Route::prefix('v1')->group(function () {
    
    // para lo que nos va a dar para pagarnos es decir los clientes :v
    Route::get('/clientes', [ClienteController::class, 'index']);
    Route::get('/clientes/{id}', [ClienteController::class, 'show']);
    Route::post('/clientes', [ClienteController::class, 'store']);
    Route::put('/clientes/{id}', [ClienteController::class, 'update']);
    Route::delete('/clientes/{id}', [ClienteController::class, 'destroy']);
    Route::get('/clientes/estadisticas/resumen', [ClienteController::class, 'estadisticas']);

    // para las cotizaciones :v
    Route::get('/cotizaciones', [CotizacionController::class, 'index']);
    Route::get('/cotizaciones/{id}', [CotizacionController::class, 'show']);
    Route::post('/cotizaciones', [CotizacionController::class, 'store']);
    Route::patch('/cotizaciones/{id}/estado', [CotizacionController::class, 'updateEstado']);
    Route::delete('/cotizaciones/{id}', [CotizacionController::class, 'destroy']);
    Route::get('/cotizaciones/estadisticas/resumen', [CotizacionController::class, 'estadisticas']);

    // para las ordenes de producto :v
    Route::get('/ordenes-producto/cotizaciones-disponibles', [OrdenProductoController::class, 'cotizacionesDisponibles']);
    Route::get('/ordenes-producto/desde-cotizacion/{id}', [OrdenProductoController::class, 'desdeCotizacion']);
    Route::get('/ordenes-producto', [OrdenProductoController::class, 'index']);
    Route::get('/ordenes-producto/{id}', [OrdenProductoController::class, 'show']);
    Route::post('/ordenes-producto', [OrdenProductoController::class, 'store']);
    Route::put('/ordenes-producto/{id}', [OrdenProductoController::class, 'update']);
    Route::delete('/ordenes-producto/{id}', [OrdenProductoController::class, 'destroy']);
    Route::get('/ordenes-producto/estadisticas/resumen', [OrdenProductoController::class, 'estadisticas']);

});
