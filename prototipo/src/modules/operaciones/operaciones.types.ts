// Tipos para el módulo de Operaciones

export type EstadoOperacion = 'Programada' | 'En Ejecución' | 'Completada' | 'Cancelada' | 'Reprogramada';
export type TipoServicio = 'Fumigación' | 'Desinfección' | 'Desratización' | 'Control de Plagas' | 'Sanitización' | 'Otro';
export type EstadoTecnico = 'Disponible' | 'Ocupado' | 'Descanso' | 'Licencia' | 'Inactivo';
export type TipoIncidencia = 'Retraso' | 'Cliente Ausente' | 'Equipo Dañado' | 'Falta Insumo' | 'Clima' | 'Otro';

// Operaciones de Servicio
export interface OperacionServicio {
  id: number;
  id_orden: number;
  orden_numero: string;
  id_cliente: number;
  cliente_nombre: string;
  tipo_servicio: TipoServicio;
  direccion: string;
  distrito?: string;
  fecha_programada: string;
  hora_inicio_programada: string;
  hora_fin_programada: string;
  fecha_ejecucion?: string;
  hora_inicio_real?: string;
  hora_fin_real?: string;
  id_tecnico_asignado?: number;
  tecnico_nombre?: string;
  id_vehiculo_asignado?: number;
  vehiculo_placa?: string;
  estado: EstadoOperacion;
  duracion_estimada: number; // minutos
  duracion_real?: number; // minutos
  observaciones?: string;
}

// Técnicos
export interface Tecnico {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  nombre_completo?: string;
  telefono: string;
  email?: string;
  especialidad: string[];
  certificaciones?: string[];
  nivel_experiencia: 'Junior' | 'Semi-Senior' | 'Senior';
  estado: EstadoTecnico;
  fecha_ingreso: string;
  servicios_completados?: number;
  calificacion_promedio?: number;
}

export interface DisponibilidadTecnico {
  id_tecnico: number;
  tecnico_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'Disponible' | 'Ocupado' | 'Reservado';
  id_operacion_asignada?: number;
}

// Equipamiento y Recursos
export interface EquipoOperacion {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'Fumigadora' | 'Nebulizadora' | 'Pulverizadora' | 'Trampa' | 'Detector' | 'EPP' | 'Otro';
  marca?: string;
  modelo?: string;
  estado: 'Disponible' | 'En Uso' | 'Mantenimiento' | 'Dañado';
  ubicacion_actual?: string;
  id_tecnico_asignado?: number;
  fecha_ultimo_mantenimiento?: string;
  fecha_proximo_mantenimiento?: string;
}

export interface InsumoOperacion {
  id: number;
  codigo: string;
  nombre: string;
  categoria: 'Químico' | 'Biológico' | 'EPP' | 'Material' | 'Otro';
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  estado: 'Disponible' | 'Bajo Stock' | 'Agotado';
}

export interface AsignacionInsumo {
  id: number;
  id_operacion: number;
  id_insumo: number;
  insumo_nombre: string;
  cantidad_asignada: number;
  cantidad_utilizada?: number;
  unidad_medida: string;
}

// Ejecución del Servicio
export interface RegistroEjecucion {
  id: number;
  id_operacion: number;
  hora_inicio: string;
  hora_fin: string;
  latitud_inicio?: number;
  longitud_inicio?: number;
  latitud_fin?: number;
  longitud_fin?: number;
  observaciones?: string;
  hallazgos?: string;
  recomendaciones?: string;
  firma_cliente?: string; // URL o base64
  nombre_quien_recibe?: string;
  cargo_quien_recibe?: string;
  fotos?: string[]; // URLs
}

export interface IncidenciaOperacion {
  id: number;
  id_operacion: number;
  fecha_hora: string;
  tipo: TipoIncidencia;
  descripcion: string;
  solucion?: string;
  id_reportado_por: number;
  reportado_por_nombre?: string;
  estado: 'Abierta' | 'En Proceso' | 'Resuelta' | 'Cerrada';
}

// Control de Calidad
export interface InspeccionCalidad {
  id: number;
  id_operacion: number;
  fecha: string;
  id_inspector: number;
  inspector_nombre: string;
  puntuacion: number; // 0-100
  aspectos_evaluados: {
    puntualidad: number;
    presentacion: number;
    tecnica: number;
    atencion_cliente: number;
    limpieza: number;
  };
  observaciones?: string;
  acciones_correctivas?: string;
  aprobado: boolean;
}

// Productividad
export interface MetricaTecnico {
  id_tecnico: number;
  tecnico_nombre: string;
  periodo: string; // YYYY-MM
  total_servicios: number;
  servicios_completados: number;
  servicios_cancelados: number;
  horas_trabajadas: number;
  promedio_duracion_servicio: number;
  calificacion_promedio: number;
  incidencias_reportadas: number;
  eficiencia: number; // porcentaje
}

export interface RendimientoOperaciones {
  fecha: string;
  total_programadas: number;
  total_completadas: number;
  total_canceladas: number;
  total_reprogramadas: number;
  tasa_completitud: number; // porcentaje
  tiempo_promedio_servicio: number;
  ingresos_generados: number;
}

// Filtros
export interface FiltroOperaciones {
  busqueda?: string;
  estado?: EstadoOperacion;
  tipo_servicio?: TipoServicio;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_tecnico?: number;
  id_cliente?: number;
  distrito?: string;
}

export interface FiltroTecnicos {
  busqueda?: string;
  estado?: EstadoTecnico;
  especialidad?: string;
  nivel_experiencia?: string;
}

// Estadísticas
export interface EstadisticasOperaciones {
  total_programadas_hoy: number;
  total_en_ejecucion: number;
  total_completadas_hoy: number;
  total_canceladas: number;
  tecnicos_disponibles: number;
  tecnicos_ocupados: number;
  tasa_completitud: number; // porcentaje
  tiempo_promedio_servicio: number; // minutos
}
