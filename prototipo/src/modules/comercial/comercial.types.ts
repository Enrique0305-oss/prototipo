// Tipos compartidos para el módulo Comercial

export type EstadoCotizacion = 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Expirada';
export type TipoCotizacion = 'Servicio' | 'Producto' | 'Capacitacion';
export type EstadoOrden = 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
export type TipoOrden = 'Servicio' | 'Producto' | 'Capacitacion';
export type EstadoProspecto = 'Nuevo' | 'Contactado' | 'Calificado' | 'Negociación' | 'Perdido';
export type EstadoConversion = 'Pendiente' | 'Convertido' | 'Rechazado';
export type Prioridad = 'Baja' | 'Media' | 'Alta' | 'Urgente';

// Cotizaciones
export interface Cotizacion {
  id: number;
  numero: string;
  id_cliente: number;
  cliente_nombre: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  tipo: TipoCotizacion;
  subtotal: number;
  igv: number;
  total: number;
  estado: EstadoCotizacion;
  observaciones?: string;
}

export interface DetalleCotizacion {
  id: number;
  id_cotizacion: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Órdenes
export interface Orden {
  id: number;
  numero: string;
  tipo: TipoOrden;
  id_cliente: number;
  cliente_nombre: string;
  fecha_emision: string;
  fecha_servicio?: string;
  id_cotizacion?: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: EstadoOrden;
  id_tecnico_asignado?: number;
  tecnico_nombre?: string;
}

export interface DetalleOrden {
  id: number;
  id_orden: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Órdenes de Servicio específicas
export interface OrdenServicio extends Orden {
  tipo_servicio: string;
  direccion_servicio: string;
  fecha_programada: string;
  hora_programada: string;
  duracion_estimada?: number;
  observaciones?: string;
}

// Órdenes de Producto específicas
export interface OrdenProducto extends Orden {
  tipo_entrega: 'Recojo' | 'Delivery';
  direccion_entrega?: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
}

// Órdenes de Capacitación específicas
export interface OrdenCapacitacion extends Orden {
  tema: string;
  modalidad: 'Presencial' | 'Virtual' | 'Híbrida';
  direccion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_horas: number;
  num_participantes: number;
  id_instructor?: number;
  instructor_nombre?: string;
}

// Prospectos
export interface Prospecto {
  id: number;
  nombre: string;
  empresa?: string;
  cargo?: string;
  telefono: string;
  email: string;
  direccion?: string;
  sector?: string;
  origen: string; // De dónde vino el prospecto: Web, Referido, Llamada, etc.
  estado: EstadoProspecto;
  prioridad: Prioridad;
  fecha_creacion: string;
  fecha_ultimo_contacto?: string;
  id_responsable?: number;
  responsable_nombre?: string;
  observaciones?: string;
}

export interface SeguimientoProspecto {
  id: number;
  id_prospecto: number;
  fecha: string;
  tipo: 'Llamada' | 'Email' | 'Reunión' | 'WhatsApp' | 'Otro';
  descripcion: string;
  id_usuario: number;
  usuario_nombre: string;
}

// Conversiones
export interface Conversion {
  id: number;
  id_prospecto: number;
  prospecto_nombre: string;
  fecha_conversion: string;
  id_cotizacion?: number;
  cotizacion_numero?: string;
  id_orden?: number;
  orden_numero?: string;
  valor_conversion: number;
  estado: EstadoConversion;
  dias_conversion: number; // Días desde prospecto hasta conversión
}

// Filtros
export interface FiltroCotizaciones {
  busqueda?: string;
  tipo?: TipoCotizacion;
  estado?: EstadoCotizacion;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface FiltroOrdenes {
  busqueda?: string;
  tipo?: TipoOrden;
  estado?: EstadoOrden;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface FiltroProspectos {
  busqueda?: string;
  estado?: EstadoProspecto;
  prioridad?: Prioridad;
  sector?: string;
  responsable?: number;
}

// Estadísticas
export interface EstadisticasCotizaciones {
  total: number;
  pendientes: number;
  aceptadas: number;
  rechazadas: number;
  valor_total: number;
}

export interface EstadisticasOrdenes {
  total: number;
  pendientes: number;
  en_proceso: number;
  completadas: number;
  valor_total: number;
}

export interface EstadisticasProspectos {
  total: number;
  nuevos: number;
  contactados: number;
  calificados: number;
  tasa_conversion: number;
}
