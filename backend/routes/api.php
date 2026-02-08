<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ClienteController;
use App\Http\Controllers\API\CotizacionController;
use App\Http\Controllers\API\OrdenServicioController;
use App\Http\Controllers\API\OrdenCapacitacionAuditoriaController;
use App\Http\Controllers\API\OrdenProductoController;
use App\Http\Controllers\API\ProductoController;
use App\Http\Controllers\API\CategoriaController;

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

    // para las órdenes de servicio :v
    Route::get('/ordenes-servicio/cotizaciones-disponibles', [OrdenServicioController::class, 'cotizacionesDisponibles']);
    Route::get('/ordenes-servicio/desde-cotizacion/{id}', [OrdenServicioController::class, 'desdeCotizacion']);
    Route::get('/ordenes-servicio', [OrdenServicioController::class, 'index']);
    Route::get('/ordenes-servicio/{id}', [OrdenServicioController::class, 'show']);
    Route::post('/ordenes-servicio', [OrdenServicioController::class, 'store']);
    Route::put('/ordenes-servicio/{id}', [OrdenServicioController::class, 'update']);
    Route::delete('/ordenes-servicio/{id}', [OrdenServicioController::class, 'destroy']);
    Route::get('/ordenes-servicio/estadisticas/resumen', [OrdenServicioController::class, 'estadisticas']);

    // para las órdenes de capacitación/auditoría :v
    Route::get('/ordenes-capacitacion-auditoria/cotizaciones-disponibles', [OrdenCapacitacionAuditoriaController::class, 'cotizacionesDisponibles']);
    Route::get('/ordenes-capacitacion-auditoria/desde-cotizacion/{id}', [OrdenCapacitacionAuditoriaController::class, 'desdeCotizacion']);
    Route::get('/ordenes-capacitacion-auditoria', [OrdenCapacitacionAuditoriaController::class, 'index']);
    Route::get('/ordenes-capacitacion-auditoria/{id}', [OrdenCapacitacionAuditoriaController::class, 'show']);
    Route::post('/ordenes-capacitacion-auditoria', [OrdenCapacitacionAuditoriaController::class, 'store']);
    Route::put('/ordenes-capacitacion-auditoria/{id}', [OrdenCapacitacionAuditoriaController::class, 'update']);
    Route::delete('/ordenes-capacitacion-auditoria/{id}', [OrdenCapacitacionAuditoriaController::class, 'destroy']);
    Route::get('/ordenes-capacitacion-auditoria/estadisticas/resumen', [OrdenCapacitacionAuditoriaController::class, 'estadisticas']);

    // para los productos :v
    Route::get('/productos/estadisticas/resumen', [ProductoController::class, 'estadisticas']);
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::get('/productos/{id}', [ProductoController::class, 'show']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{id}', [ProductoController::class, 'update']);
    Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);
    Route::patch('/productos/{id}/reactivar', [ProductoController::class, 'reactivar']);

    // para las categorías :v
    Route::get('/categorias/estadisticas/resumen', [CategoriaController::class, 'estadisticas']);
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);
    Route::patch('/categorias/{id}/reactivar', [CategoriaController::class, 'reactivar']);

});
