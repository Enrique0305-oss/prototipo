<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ClienteController;
use App\Http\Controllers\API\CotizacionController;
use App\Http\Controllers\API\OrdenServicioController;
use App\Http\Controllers\API\OrdenCapacitacionAuditoriaController;
use App\Http\Controllers\API\OrdenProductoController;
use App\Http\Controllers\API\EquipoController;
use App\Http\Controllers\API\ProductoController;
use App\Http\Controllers\API\CategoriaController;
use App\Http\Controllers\API\VehiculoController;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\TecnicoController;
use App\Http\Controllers\API\MantenimientoController;
use App\Http\Controllers\API\ActividadMantenimientoController;
use App\Http\Controllers\API\MulticimController;
use App\Http\Controllers\API\ProyeccionesController;

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
    Route::get('/cotizaciones/estadisticas/resumen', [CotizacionController::class, 'estadisticas']);
    Route::get('/cotizaciones/{id}', [CotizacionController::class, 'show']);
    Route::post('/cotizaciones', [CotizacionController::class, 'store']);
    Route::patch('/cotizaciones/{id}/estado', [CotizacionController::class, 'updateEstado']);
    Route::delete('/cotizaciones/{id}', [CotizacionController::class, 'destroy']);
    Route::get('/cotizaciones/{id}/pdf', [CotizacionController::class, 'generarPDF']);

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

    // para los equipos :v
    Route::get('/equipos', [EquipoController::class, 'index']);
    Route::get('/equipos/{id}', [EquipoController::class, 'show']);
    Route::post('/equipos', [EquipoController::class, 'store']);
    Route::put('/equipos/{id}', [EquipoController::class, 'update']);
    Route::delete('/equipos/{id}', [EquipoController::class, 'destroy']);

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

    // para los vehículos :v
    Route::get('/vehiculos/estadisticas/resumen', [VehiculoController::class, 'estadisticas']);
    Route::get('/vehiculos', [VehiculoController::class, 'index']);
    Route::get('/vehiculos/{id}', [VehiculoController::class, 'show']);
    Route::post('/vehiculos', [VehiculoController::class, 'store']);
    Route::put('/vehiculos/{id}', [VehiculoController::class, 'update']);
    Route::delete('/vehiculos/{id}', [VehiculoController::class, 'destroy']);
    Route::patch('/vehiculos/{id}/reactivar', [VehiculoController::class, 'reactivar']);

        // para las áreas :v
    Route::get('/areas', [AreaController::class, 'index']);
    Route::get('/areas/{id}', [AreaController::class, 'show']);
    Route::post('/areas', [AreaController::class, 'store']);
    Route::put('/areas/{id}', [AreaController::class, 'update']);
    Route::delete('/areas/{id}', [AreaController::class, 'destroy']);

    // para los técnicos :v
    Route::get('/tecnicos/estadisticas/resumen', [TecnicoController::class, 'estadisticas']);
    Route::get('/tecnicos', [TecnicoController::class, 'index']);
    Route::get('/tecnicos/{id}', [TecnicoController::class, 'show']);
    Route::post('/tecnicos', [TecnicoController::class, 'store']);
    Route::put('/tecnicos/{id}', [TecnicoController::class, 'update']);
    Route::delete('/tecnicos/{id}', [TecnicoController::class, 'destroy']);
    Route::patch('/tecnicos/{id}/reactivar', [TecnicoController::class, 'reactivar']);
    Route::patch('/tecnicos/{id}/licencia', [TecnicoController::class, 'ponerEnLicencia']);

    // para los mantenimientos :v
    Route::get('/mantenimientos/estadisticas/resumen', [MantenimientoController::class, 'estadisticas']);
    Route::get('/mantenimientos/equipo/{id_equipo}/historial', [MantenimientoController::class, 'historialEquipo']);
    Route::get('/mantenimientos', [MantenimientoController::class, 'index']);
    Route::get('/mantenimientos/{id}', [MantenimientoController::class, 'show']);
    Route::post('/mantenimientos', [MantenimientoController::class, 'store']);
    Route::put('/mantenimientos/{id}', [MantenimientoController::class, 'update']);
    Route::delete('/mantenimientos/{id}', [MantenimientoController::class, 'destroy']);

    // para las actividades de mantenimiento :v
    Route::get('/actividades-mantenimiento', [ActividadMantenimientoController::class, 'index']);
    Route::get('/actividades-mantenimiento/{id}', [ActividadMantenimientoController::class, 'show']);
    Route::post('/actividades-mantenimiento', [ActividadMantenimientoController::class, 'store']);
    Route::put('/actividades-mantenimiento/{id}', [ActividadMantenimientoController::class, 'update']);
    Route::delete('/actividades-mantenimiento/{id}', [ActividadMantenimientoController::class, 'destroy']);
    Route::patch('/actividades-mantenimiento/{id}/reactivar', [ActividadMantenimientoController::class, 'reactivar']);  

    // para multi :v
    Route::get('/multicim', [MulticimController::class, 'index']);
    Route::get('multicim/{id}', [MulticimController::class, 'show']);
    Route::post('/multicim', [MulticimController::class, 'store']);
    Route::put('/multicim/{id}', [MulticimController::class, 'update']);
    Route::delete('/multicim/{id}', [MulticimController::class, 'destroy']);

    // para las proyecciones :v
    Route::get('proyecciones', [ProyeccionesController::class, 'index']);
    Route::post('proyecciones', [ProyeccionesController::class, 'store']);
    Route::get('proyecciones/buscar-orden/{tipo}/{id}', [ProyeccionesController::class, 'obtenerDatosOrden']);

    // Listados auxiliares para formularios
    Route::get('/servicios', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Servicio::select('id', 'nombre', 'descripcion', 'estado')->where('estado', 'Activo')->get()
        ]);
    });
});
