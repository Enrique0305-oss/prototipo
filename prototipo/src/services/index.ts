// Exportacion centralizada de todos los servicios :v

// Servicios Comerciales
export { clienteService } from './clienteService';
export { cotizacionService } from './cotizacionService';
export { ordenServicioService } from './ordenServicioService';
export { ordenProductoService } from './ordenProductoService';
export { ordenCapacitacionService } from './ordenCapacitacionService';

// Servicios Almacén
export { productoService } from './productoService';
export { categoriaService } from './categoriaService';
export { equipoService } from './equipoService';
export { inventarioAjusteService } from './inventarioAjusteService';

// Servicios Recursos Humanos y Logística
export { vehiculoService } from './vehiculoService';
export { tecnicoService } from './tecnicoService';
export { informeTecnicoService } from './informeTecnicoService';
export { areaService } from './areaService';
export { cargoService } from './cargoService';
export { rrhhService } from './rrhhService';

// Servicios Operaciones
export { mantenimientoService } from './mantenimientoService';
export { actividadMantenimientoService } from './actividadMantenimientoService';

// Servicios Logística
export { servicioService } from './servicioService';

// Servicios Finanzas
export { multicimService } from './multicimService';

// Exportar tipos
export * from '../core/api/types';
