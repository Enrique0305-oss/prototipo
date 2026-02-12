
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface FilterParams {
  buscar?: string;
  estado?: string;
  orden?: 'asc' | 'desc';
}

//Clientes

export interface Cliente {
  id: number;
  nombre_empresa: string;
  ruc: string;
  rubro: string;
  direccion?: string;
  persona_contacto?: string;
  telefono_contacto?: string;
  origen?: 'Referido' | 'Web' | 'Llamada' | 'Visita' | 'Redes sociales' | 'Otro';
  fecha_registro?: string;
  estado: 'Acepta' | 'No acepta' | 'Contactado';
  cotizaciones?: any[];
  ordenes_servicio?: any[];
}

export interface ClienteFilters extends FilterParams {
  ruc?: string;
  origen?: string;
}

// Cotizaciones

export interface Cotizacion {
  id: number;
  numero: string;
  numero_cotizacion?: string;
  id_cliente: number;
  cliente_nombre?: string;
  fecha_emision: string;
  tipo: string;
  tipo_cotizacion?: string;
  incluye_igv: boolean;
  subtotal: number;
  igv: number;
  total: number;
  estado: 'Pendiente' | 'Aceptada' | 'Rechazada';
  observaciones?: string | null;
  creador?: string;
  cliente?: Cliente;
  detalles?: DetalleCotizacion[];
}

export interface DetalleCotizacion {
  id: number;
  id_cotizacion: number;
  id_servicio?: number | null;
  id_producto?: number | null;
  descripcion_manual?: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
  frecuencia_sugerida?: string | null;
  modalidad_sugerida?: string | null;
  servicio?: any;
  producto?: any;
}

export interface CotizacionFilters extends FilterParams {
  estado?: 'Pendiente' | 'Aceptada' | 'Rechazada';
  tipo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface EstadisticasCotizaciones {
  total: number;
  pendientes: number;
  aceptadas: number;
  rechazadas: number;
  valor_total: number;
  valor_pendiente: number;
}

// Órdenes de Servicio

export interface OrdenServicio {
  id_ordenserv: number;
  num_ordenserv: string;
  id_cotizacion: number;
  id_programacion?: number;
  fecha_orden: string;
  fecha_ejecucion?: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  cotizacion?: Cotizacion;
}

export interface OrdenServicioFilters extends FilterParams {
  estado?: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  fecha_desde?: string;
  fecha_hasta?: string;
  id_cotizacion?: number;
}

// Órdenes de Producto

export interface OrdenProducto {
  id_ordenprod: number;
  num_ordenprod: string;
  id_cliente: number;
  fecha_orden: string;
  fecha_entrega?: string;
  estado: 'Pendiente' | 'En Preparación' | 'Enviado' | 'Entregado' | 'Cancelado';
  total: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
  detalles?: DetalleOrdenProducto[];
}

export interface DetalleOrdenProducto {
  id_detalle_ordenprod: number;
  id_ordenprod: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface OrdenProductoFilters extends FilterParams {
  estado?: 'Pendiente' | 'En Preparación' | 'Enviado' | 'Entregado' | 'Cancelado';
  fecha_desde?: string;
  fecha_hasta?: string;
  id_cliente?: number;
}

// Órdenes de Capacitación/Auditoría

export interface OrdenCapacitacion {
  id_ordencapaud: number;
  num_ordencapaud: string;
  id_cotizacion: number;
  fecha_orden: string;
  fecha_programada?: string;
  tipo: 'Capacitación' | 'Auditoría';
  estado: 'Pendiente' | 'Programado' | 'Completado' | 'Cancelado';
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  cotizacion?: Cotizacion;
}

export interface OrdenCapacitacionFilters extends FilterParams {
  estado?: 'Pendiente' | 'Programado' | 'Completado' | 'Cancelado';
  tipo?: 'Capacitación' | 'Auditoría';
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Productos

export interface Producto {
  id: number;
  sku?: string; // Auto-generado
  descripcion: string;
  id_categoria?: number;
  fecha_vencim?: string;
  ubicacion: string;
  n_lote: string;
  unidad?: string; // Ej: "Litros", "Unidades", "Kg"
  precio_unitario?: number;
  estado: 'Activo' | 'Inactivo';
  categoria?: Categoria;
  inventario?: {
    cantidad_disponible: number;
    cantidad_minima: number;
    cantidad_maxima: number;
  };
}

export interface ProductoFilters extends FilterParams {
  id_categoria?: number;
  stock_disponible?: boolean; // true para filtrar productos con stock disponible
  proximos_vencer?: boolean; // true para productos próximos a vencer (30 días)
}

export interface EstadisticasProductos {
  total_productos: number;
  productos_activos: number;
  productos_inactivos: number;
  con_stock: number;
  sin_stock: number;
  proximos_vencer_30dias: number;
  vencidos: number;
  por_categoria: Array<{
    categoria: string;
    total: number;
  }>;
}

// Categorías

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Inactivo';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  productos_count?: number;
}

export interface CategoriaFilters extends FilterParams {
  // Hereda buscar, estado, orden de FilterParams
}

// Equipos

export interface Equipo {
  id_equipo: number;
  codigo_equipo?: string;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Inactivo';
  fecha_adquisicion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EquipoFilters extends FilterParams {
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Vehículos

export interface Vehiculo {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidad_carga: number;
  estado: 'Disponible' | 'En Uso' | 'Mantenimiento' | 'Fuera de Servicio';
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehiculoFilters extends FilterParams {
  marca?: string;
  anio_desde?: number;
  anio_hasta?: number;
}

export interface EstadisticasVehiculos {
  total_vehiculos: number;
  por_estado: Array<{
    estado: string;
    cantidad: number;
  }>;
  capacidad_total_carga: number;
  por_marca: Array<{
    marca: string;
    cantidad: number;
  }>;
  por_anio: Array<{
    anio: number;
    cantidad: number;
  }>;
  anio_promedio: number;
}

// Técnicos

export interface Tecnico {
  id_tecnico: number;
  nombre: string;
  apellido: string;
  dni: string;
  especialidad?: string;
  telefono?: string;
  email?: string;
  carga_maxima_semanal: number; // en horas
  autorizado_conducir: boolean;
  estado: 'Activo' | 'Inactivo' | 'Licencia';
  created_at?: string;
  updated_at?: string;
}

export interface TecnicoFilters extends FilterParams {
  especialidad?: string;
  autorizado_conducir?: boolean;
}

export interface EstadisticasTecnicos {
  total_tecnicos: number;
  por_estado: Array<{
    estado: string;
    cantidad: number;
  }>;
  top_asignados: Array<{
    id_tecnico: number;
    nombre: string;
    apellido: string;
    total_asignaciones: number;
  }>;
  por_especialidad: Array<{
    especialidad: string;
    cantidad: number;
  }>;
  autorizados_conducir: number;
}

// Áreas

export interface Area {
  id_area: number;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Inactivo';
  created_at?: string;
  updated_at?: string;
}

export interface AreaFilters extends FilterParams {
  // Hereda buscar, estado, orden de FilterParams
}

// Mantenimientos

export interface Mantenimiento {
  id_manten: number;
  id_equipo: number;
  id_actmanten: number;
  fecha: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  equipo?: Equipo;
  actividad?: ActividadMantenimiento;
}

export interface MantenimientoFilters extends FilterParams {
  id_equipo?: number;
  id_actividad?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  mes?: number; // 1-12
  anio?: number;
}

export interface EstadisticasMantenimientos {
  total_mantenimientos: number;
  por_equipo: Array<{
    id_equipo: number;
    nombre_equipo: string;
    total_mantenimientos: number;
  }>;
  por_actividad: Array<{
    id_actmanten: number;
    categoria: string;
    total_mantenimientos: number;
  }>;
  por_mes: Array<{
    mes: string;
    cantidad: number;
  }>;
  proximos_programados: Array<{
    id_equipo: number;
    nombre_equipo: string;
    ultimo_mantenimiento: string;
    dias_desde_ultimo: number;
  }>;
}

export interface HistorialEquipo {
  equipo: Equipo;
  data: Mantenimiento[];
}

// Actividades de Mantenimiento

export interface ActividadMantenimiento {
  id_actmanten: number;
  categoria: 'Programado' | 'Entregado' | 'Garantia';
  estado: 'Activo' | 'Desactivo';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ActividadMantenimientoFilters extends FilterParams {
  categoria?: 'Programado' | 'Entregado' | 'Garantia';
}

// Multicim

export interface Multicim {
  id_multicim: number;
  descripcion?: string;
  monto: number;
  fecha: string;
  estado: 'Activo' | 'Inactivo';
  created_at?: string;
  updated_at?: string;
}

export interface MulticimFilters extends FilterParams {
  fecha_desde?: string;
  fecha_hasta?: string;
}
