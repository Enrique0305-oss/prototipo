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
  id_servicio: number;
  servicio_nombre: string;
  id_cliente: number;
  cliente_nombre: string;
  id_tecnico_asignado: number;
  tecnico_nombre: string;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin: string;
  local_sede: string;
  direccion_completa: string;
  estado_ejecucion: EstadoEjecucion;
  requiere_movilidad: boolean;
  id_vehiculo?: number;
  vehiculo_placa?: string;
  observaciones?: string;
}

export interface Tecnico {
  id: number;
  nombre: string;
  estado: 'Activo' | 'Inactivo' | 'Licencia';
  servicios_hoy: number;
  autorizado_conducir: boolean;
}

export interface FiltroProgramacion {
  servicio?: string;
  estado?: EstadoEjecucion;
  tecnico?: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
}

export interface EstadisticasProgramacion {
  programados: number;
  confirmados: number;
  en_ejecucion: number;
  completados: number;
  reprogramados: number;
  cancelados: number;
}
