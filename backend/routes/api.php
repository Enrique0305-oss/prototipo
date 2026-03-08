<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
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
use App\Http\Controllers\API\ServicioController;
use App\Http\Controllers\API\CatalogoCapacitacionAuditoriaController;
use App\Http\Controllers\API\ProgramacionMantenimientoController;
use App\Http\Controllers\API\AsistenciaController;
use App\Http\Controllers\API\HorarioController;
use App\Http\Controllers\API\KardexController;
use App\Http\Controllers\API\ServicioProductoController;
use App\Http\Controllers\API\ProgramacionServicioController;
use App\Http\Controllers\API\EntregaEppController;
use App\Http\Controllers\API\ProveedorController;
use App\Http\Controllers\API\SalidaProgramacionController;
use App\Http\Controllers\API\OrdenCompraController;

// Rutas PÚBLICAS (sin autenticación)
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
});

// Rutas PROTEGIDAS (requieren token Sanctum)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/clientes', [ClienteController::class, 'index']);
    Route::get('/clientes/{id}', [ClienteController::class, 'show']);
    Route::post('/clientes', [ClienteController::class, 'store']);
    Route::put('/clientes/{id}', [ClienteController::class, 'update']);
    Route::delete('/clientes/{id}', [ClienteController::class, 'destroy']);
    Route::get('/clientes/estadisticas/resumen', [ClienteController::class, 'estadisticas']);

    // para las cotizaciones :v
    Route::get('/cotizaciones', [CotizacionController::class, 'index']);
    Route::get('/cotizaciones/estadisticas/resumen', [CotizacionController::class, 'estadisticas']);
    Route::get('/cotizaciones/alerta-sin-orden', [CotizacionController::class, 'alertaCotizacionesSinOrden']);
    Route::get('/cotizaciones/{id}', [CotizacionController::class, 'show']);
    Route::post('/cotizaciones', [CotizacionController::class, 'store']);
    Route::patch('/cotizaciones/{id}/estado', [CotizacionController::class, 'updateEstado']);
    Route::delete('/cotizaciones/{id}', [CotizacionController::class, 'destroy']);
    Route::get('/cotizaciones/{id}/pdf', [CotizacionController::class, 'generarPDF']);

    // para las ordenes de producto :v
    Route::get('/ordenes-producto/estadisticas/resumen', [OrdenProductoController::class, 'estadisticas']);
    Route::get('/ordenes-producto/cotizaciones-disponibles', [OrdenProductoController::class, 'cotizacionesDisponibles']);
    Route::get('/ordenes-producto/desde-cotizacion/{id}', [OrdenProductoController::class, 'desdeCotizacion']);
    Route::get('/ordenes-producto', [OrdenProductoController::class, 'index']);
    Route::get('/ordenes-producto/{id}/pdf', [OrdenProductoController::class, 'generarPDF']);
    Route::get('/ordenes-producto/{id}', [OrdenProductoController::class, 'show']);
    Route::post('/ordenes-producto', [OrdenProductoController::class, 'store']);
    Route::put('/ordenes-producto/{id}', [OrdenProductoController::class, 'update']);
    Route::delete('/ordenes-producto/{id}', [OrdenProductoController::class, 'destroy']);

    // para las órdenes de servicio :v
    Route::get('/ordenes-servicio/estadisticas/resumen', [OrdenServicioController::class, 'estadisticas']);
    Route::get('/ordenes-servicio/cotizaciones-disponibles', [OrdenServicioController::class, 'cotizacionesDisponibles']);
    Route::get('/ordenes-servicio/siguiente-numero', [OrdenServicioController::class, 'siguienteNumero']);
    Route::get('/ordenes-servicio/desde-cotizacion/{id}', [OrdenServicioController::class, 'desdeCotizacion']);
    Route::get('/ordenes-servicio', [OrdenServicioController::class, 'index']);
    Route::get('/ordenes-servicio/{id}', [OrdenServicioController::class, 'show']);
    Route::post('/ordenes-servicio', [OrdenServicioController::class, 'store']);
    Route::put('/ordenes-servicio/{id}', [OrdenServicioController::class, 'update']);
    Route::delete('/ordenes-servicio/{id}', [OrdenServicioController::class, 'destroy']);

    // Receta de productos por servicio
    Route::get('/servicios/{idServicio}/productos', [ServicioProductoController::class, 'index']);
    Route::post('/servicios/{idServicio}/productos', [ServicioProductoController::class, 'store']);
    Route::put('/servicios/{idServicio}/productos/{id}', [ServicioProductoController::class, 'update']);
    Route::delete('/servicios/{idServicio}/productos/{id}', [ServicioProductoController::class, 'destroy']);
    Route::post('/servicios/{idServicio}/productos/sync', [ServicioProductoController::class, 'sync']);

    // para las órdenes de capacitación/auditoría :v
    Route::get('/ordenes-capacitacion-auditoria/estadisticas/resumen', [OrdenCapacitacionAuditoriaController::class, 'estadisticas']);
    Route::get('/ordenes-capacitacion-auditoria/cotizaciones-disponibles', [OrdenCapacitacionAuditoriaController::class, 'cotizacionesDisponibles']);
    Route::get('/ordenes-capacitacion-auditoria/desde-cotizacion/{id}', [OrdenCapacitacionAuditoriaController::class, 'desdeCotizacion']);
    Route::get('/ordenes-capacitacion-auditoria', [OrdenCapacitacionAuditoriaController::class, 'index']);
    Route::get('/ordenes-capacitacion-auditoria/{id}', [OrdenCapacitacionAuditoriaController::class, 'show']);
    Route::post('/ordenes-capacitacion-auditoria', [OrdenCapacitacionAuditoriaController::class, 'store']);
    Route::put('/ordenes-capacitacion-auditoria/{id}', [OrdenCapacitacionAuditoriaController::class, 'update']);
    Route::delete('/ordenes-capacitacion-auditoria/{id}', [OrdenCapacitacionAuditoriaController::class, 'destroy']);

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
    Route::post('/productos/{id}/imagen', [ProductoController::class, 'subirImagen']);
    Route::delete('/productos/{id}/imagen', [ProductoController::class, 'eliminarImagen']);

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

    // para la programacion anual de mantenimientos
    Route::get('/programacion-mantenimiento', [ProgramacionMantenimientoController::class, 'index']);
    Route::get('/programacion-mantenimiento/alertas', [ProgramacionMantenimientoController::class, 'alertas']);
    Route::get('/programacion-mantenimiento/{id}', [ProgramacionMantenimientoController::class, 'show']);
    Route::post('/programacion-mantenimiento', [ProgramacionMantenimientoController::class, 'store']);
    Route::post('/programacion-mantenimiento/preview', [ProgramacionMantenimientoController::class, 'preview']);
    Route::delete('/programacion-mantenimiento/{id}', [ProgramacionMantenimientoController::class, 'destroy']);
    Route::patch('/mantenimientos/{id}/marcar-realizado', [ProgramacionMantenimientoController::class, 'marcarRealizado']);

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

    // Para los servicios :v
    Route::get('/servicios/estadisticas/resumen', [ServicioController::class, 'estadisticas']);
    Route::get('/servicios', [ServicioController::class, 'index']);
    Route::get('/servicios/{id}', [ServicioController::class, 'show']);
    Route::post('/servicios', [ServicioController::class, 'store']);
    Route::put('/servicios/{id}', [ServicioController::class, 'update']);
    Route::delete('/servicios/{id}', [ServicioController::class, 'destroy']);
    Route::patch('/servicios/{id}/reactivar', [ServicioController::class, 'reactivar']);

    // Catálogo de capacitaciones y auditorías
    Route::get('/catalogo-capacitacion-auditoria/estadisticas/resumen', [CatalogoCapacitacionAuditoriaController::class, 'estadisticas']);
    Route::get('/catalogo-capacitacion-auditoria', [CatalogoCapacitacionAuditoriaController::class, 'index']);
    Route::get('/catalogo-capacitacion-auditoria/{id}', [CatalogoCapacitacionAuditoriaController::class, 'show']);
    Route::post('/catalogo-capacitacion-auditoria', [CatalogoCapacitacionAuditoriaController::class, 'store']);
    Route::put('/catalogo-capacitacion-auditoria/{id}', [CatalogoCapacitacionAuditoriaController::class, 'update']);
    Route::delete('/catalogo-capacitacion-auditoria/{id}', [CatalogoCapacitacionAuditoriaController::class, 'destroy']);
    Route::patch('/catalogo-capacitacion-auditoria/{id}/reactivar', [CatalogoCapacitacionAuditoriaController::class, 'reactivar']);

    // Listado auxiliar de personal
    Route::get('/personal', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Personal::select('id', 'nombre', 'apellidos')->get()
        ]);
    });

    // Asistencia RRHH
    Route::get('/asistencia/mi-estado', [AsistenciaController::class, 'miEstado']);
    Route::get('/asistencia/lista', [AsistenciaController::class, 'listaAdmin']);
    Route::post('/asistencia/marcar-entrada', [AsistenciaController::class, 'marcarEntrada']);
    Route::post('/asistencia/marcar-salida', [AsistenciaController::class, 'marcarSalida']);
    Route::post('/asistencia/marcar-inicio-almuerzo', [AsistenciaController::class, 'marcarInicioAlmuerzo']);
    Route::post('/asistencia/marcar-fin-almuerzo', [AsistenciaController::class, 'marcarFinAlmuerzo']);
    Route::put('/asistencia/{id}/horas-extra', [AsistenciaController::class, 'asignarHorasExtra']);

    // Horarios RRHH
    Route::get('/horarios', [HorarioController::class, 'index']);
    Route::get('/horarios/{id}', [HorarioController::class, 'show']);
    Route::post('/horarios/{id}', [HorarioController::class, 'store']);
    Route::post('/horarios/{id}/copiar-de/{idOrigen}', [HorarioController::class, 'copiarHorario']);

    // Kardex - movimientos de inventario
    Route::get('/kardex/estadisticas/resumen', [KardexController::class, 'estadisticas']);
    Route::get('/kardex/producto/{idProducto}', [KardexController::class, 'porProducto']);
    Route::get('/kardex', [KardexController::class, 'index']);
    Route::post('/kardex', [KardexController::class, 'store']);

    // Programación de Servicios
    Route::get('/programacion-servicio/estadisticas/resumen', [ProgramacionServicioController::class, 'estadisticas']);
    Route::get('/programacion-servicio/ods-disponibles', [ProgramacionServicioController::class, 'getODSDisponibles']);
    Route::post('/programacion-servicio/preview-anual', [ProgramacionServicioController::class, 'previewAnual']);
    Route::post('/programacion-servicio/anual', [ProgramacionServicioController::class, 'storeAnual']);
    Route::get('/programacion-servicio/pdf', [ProgramacionServicioController::class, 'generarPDF']);
    Route::get('/programacion-servicio', [ProgramacionServicioController::class, 'index']);
    Route::get('/programacion-servicio/{id}', [ProgramacionServicioController::class, 'show']);
    Route::post('/programacion-servicio', [ProgramacionServicioController::class, 'store']);
    Route::put('/programacion-servicio/{id}', [ProgramacionServicioController::class, 'update']);
    Route::patch('/programacion-servicio/{id}/completar', [ProgramacionServicioController::class, 'completar']);
    Route::delete('/programacion-servicio/{id}', [ProgramacionServicioController::class, 'destroy']);

    // Almacén - Salidas por Programación
    Route::get('/almacen/salidas-programacion/pendientes', [SalidaProgramacionController::class, 'getPendientes']);
    Route::get('/almacen/salidas-programacion/historial', [SalidaProgramacionController::class, 'getHistorial']);
    Route::get('/almacen/salidas-programacion/{id}', [SalidaProgramacionController::class, 'getDetalle']);
    Route::post('/almacen/salidas-programacion/confirmar', [SalidaProgramacionController::class, 'confirmarSalida']);

    // Proveedores
    Route::get('/proveedores', [ProveedorController::class, 'index']);
    Route::post('/proveedores', [ProveedorController::class, 'store']);
    Route::get('/proveedores/{id}', [ProveedorController::class, 'show']);
    Route::put('/proveedores/{id}', [ProveedorController::class, 'update']);
    Route::delete('/proveedores/{id}', [ProveedorController::class, 'destroy']);

    // Órdenes de Compra
    Route::get('/ordenes-compra/estadisticas/resumen', [OrdenCompraController::class, 'estadisticas']);
    Route::get('/ordenes-compra', [OrdenCompraController::class, 'index']);
    Route::post('/ordenes-compra', [OrdenCompraController::class, 'store']);
    Route::get('/ordenes-compra/{id}', [OrdenCompraController::class, 'show']);
    Route::put('/ordenes-compra/{id}', [OrdenCompraController::class, 'update']);
    Route::patch('/ordenes-compra/{id}/recibir', [OrdenCompraController::class, 'recibir']);
    Route::patch('/ordenes-compra/{id}/anular', [OrdenCompraController::class, 'anular']);

    // Entrega EPP - equipos de protección personal
    Route::get('/entrega-epp/estadisticas/resumen', [EntregaEppController::class, 'estadisticas']);
    Route::get('/entrega-epp/estado-tecnicos', [EntregaEppController::class, 'estadoTecnicos']);
    Route::get('/entrega-epp/productos-epp', [EntregaEppController::class, 'productosEpp']);
    Route::get('/entrega-epp', [EntregaEppController::class, 'index']);
    Route::post('/entrega-epp', [EntregaEppController::class, 'store']);
    Route::get('/entrega-epp/{id}', [EntregaEppController::class, 'show']);
    Route::patch('/entrega-epp/{id}/devolver', [EntregaEppController::class, 'devolver']);
    Route::get('/entrega-epp/{id}/pdf', [EntregaEppController::class, 'generarPDF']);
});
