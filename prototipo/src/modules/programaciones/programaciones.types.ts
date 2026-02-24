export type EstadoEjecucion = 
  | 'Programado' 
  | 'Confirmado' 
  | 'En Camino' 
  | 'En Ejecución' 
  | 'Realizado' 
  | 'Reprogramado' 
  | 'Cancelado';

export type VistaProgramacion = 'diaria' | 'semanal' | 'mensual';

export interface Programacion {
  id: number;
  id_orden_servicio: number;
  id_servicio: number;
  id_tecnico_asignado: number;
  id_supervisor?: number;
  id_vehiculo?: number;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin?: string;
  duracion_real?: number;
  local_sede?: string;
  direccion_completa?: string;
  coordenadas?: string;
  estado_ejecucion: EstadoEjecucion;
  fecha_ejecucion_real?: string;
  observaciones?: string;
  creado_por?: number;
  // Relations
  orden_servicio?: {
    id: number;
    numero_orden: string;
    estado: string;
    cliente?: { id: number; nombre_empresa?: string; persona_contacto?: string };
  };
  servicio?: { id: number; nombre: string };
  tecnico?: { id: number; nombre: string; apellidos: string };
  tecnicos?: { id: number; nombre: string; apellidos: string; pivot?: { rol: string } }[];
  supervisor?: { id: number; nombre: string; apellidos: string };
  vehiculo?: { id: number; placa: string; modelo: string; marca: string };
  insumos?: ProgramacionInsumo[];
}

export interface ProgramacionInsumo {
  id: number;
  id_programacion: number;
  id_producto: number;
  cantidad_asignada: number;
  cantidad_utilizada?: number;
  estado: 'Asignado' | 'Entregado' | 'Utilizado' | 'Devuelto';
  producto?: { id: number; descripcion: string; sku: string };
}

export interface Tecnico {
  id: number;
  nombre: string;
  apellidos: string;
  especialidad?: string;
  estado: string;
  autorizado_conducir: boolean;
  carga_maxima_semanal?: number;
}

export interface Vehiculo {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  anio?: number;
  estado: string;
}

export interface ODSDisponible {
  id: number;
  numero_orden: string;
  cliente: string;
  estado: string;
  fecha_tentativa?: string;
  detalles: ODSDetalle[];
}

export interface ODSDetalle {
  id: number;
  id_servicio: number;
  servicio_nombre: string;
  local?: string;
  frecuencia?: string;
  precio: number;
}

export interface PreviewAnual {
  fechas: string[];
  total_programaciones: number;
  stock: StockDetalle[];
}

export interface StockDetalle {
  id_producto: number;
  producto: string;
  cantidad_por_vez: number;
  total_necesario: number;
  stock_disponible: number;
  suficiente: boolean;
}

export interface SugerenciaSiguiente {
  frecuencia: string;
  fecha_sugerida: string;
  id_orden_servicio: number;
  id_servicio: number;
  id_tecnico_asignado: number;
  tecnicos_ids?: number[];
  id_supervisor?: number;
  id_vehiculo?: number;
  hora_inicio?: string;
  hora_fin?: string;
  local_sede?: string;
  direccion_completa?: string;
}

export interface FiltroProgramacion {
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  mes?: number;
  anio?: number;
  id_tecnico?: number;
  estado?: EstadoEjecucion;
  id_orden_servicio?: number;
  id_servicio?: number;
}

export interface EstadisticasProgramacion {
  programados: number;
  confirmados: number;
  en_ejecucion: number;
  completados: number;
  reprogramados: number;
  cancelados: number;
  total: number;
}
