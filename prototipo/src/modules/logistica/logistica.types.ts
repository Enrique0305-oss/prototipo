// Tipos para el módulo de Logística

export type EstadoCliente = 'Activo' | 'Inactivo' | 'Suspendido';
export type TipoCliente = 'Industrial' | 'Comercial' | 'Residencial' | 'Alimenticio' | 'Educativo' | 'Salud';
export type FrecuenciaServicio = 'Diario' | 'Semanal' | 'Quincenal' | 'Mensual' | 'Bimensual' | 'Trimestral' | 'Eventual';
export type EstadoRuta = 'Activa' | 'Pausada' | 'Completada' | 'Cancelada';
export type EstadoVehiculo = 'Disponible' | 'En Ruta' | 'Mantenimiento' | 'Fuera de Servicio';

// Clientes
export interface Cliente {
  id: number;
  razon_social: string;
  ruc?: string;
  tipo: TipoCliente;
  direccion: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
  contacto_nombre?: string;
  contacto_cargo?: string;
  estado: EstadoCliente;
  frecuencia_servicio?: FrecuenciaServicio;
  fecha_registro: string;
  total_servicios?: number;
  facturacion_total?: number;
}

// Rutas
export interface Ruta {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  id_vehiculo?: number;
  vehiculo_placa?: string;
  id_conductor?: number;
  conductor_nombre?: string;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin_estimada: string;
  estado: EstadoRuta;
  total_clientes: number;
  clientes_completados?: number;
  kilometros_estimados?: number;
}

export interface PuntoRuta {
  id: number;
  id_ruta: number;
  orden: number;
  id_cliente: number;
  cliente_nombre: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  hora_estimada: string;
  hora_llegada?: string;
  hora_salida?: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido';
  observaciones?: string;
}

// Vehículos
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  tipo: 'Camioneta' | 'Camión' | 'Furgón' | 'Moto' | 'Auto';
  capacidad_carga?: number; // en kg
  estado: EstadoVehiculo;
  kilometraje?: number;
  fecha_proximo_mantenimiento?: string;
  fecha_soat?: string;
  fecha_revision_tecnica?: string;
}

// Conductores
export interface Conductor {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  licencia_categoria: string;
  licencia_vencimiento: string;
  telefono: string;
  email?: string;
  estado: 'Activo' | 'Inactivo' | 'Vacaciones' | 'Licencia';
  fecha_ingreso: string;
}

// Seguimiento
export interface SeguimientoRuta {
  id: number;
  id_ruta: number;
  timestamp: string;
  latitud: number;
  longitud: number;
  velocidad?: number;
  id_punto_actual?: number;
}

// Filtros
export interface FiltroClientes {
  busqueda?: string;
  tipo?: TipoCliente;
  estado?: EstadoCliente;
  distrito?: string;
  frecuencia?: FrecuenciaServicio;
}

export interface FiltroRutas {
  busqueda?: string;
  estado?: EstadoRuta;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_vehiculo?: number;
  id_conductor?: number;
}

export interface FiltroVehiculos {
  busqueda?: string;
  estado?: EstadoVehiculo;
  tipo?: string;
}

// Estadísticas
export interface EstadisticasLogistica {
  total_clientes: number;
  clientes_activos: number;
  rutas_del_dia: number;
  vehiculos_disponibles: number;
  km_totales_mes?: number;
}

export interface EstadisticasRuta {
  tiempo_total: number; // minutos
  distancia_total: number; // km
  puntos_completados: number;
  puntos_totales: number;
  eficiencia: number; // porcentaje
}
