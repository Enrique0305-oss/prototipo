<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ClienteController;
use App\Http\Controllers\API\CotizacionController;

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

});
