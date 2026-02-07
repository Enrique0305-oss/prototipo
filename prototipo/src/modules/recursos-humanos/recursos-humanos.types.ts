export type TipoRegistro = 'Oficina' | 'Campo';
export type EstadoAsistencia = 'Puntual' | 'Tardanza' | 'Falta' | 'Fuera de Rango' | 'Incompleto' | 'Justificada';

export interface Asistencia {
  id: number;
  id_personal?: number;
  id_tecnico?: number;
  id_programacion?: number;
  fecha: string;
  tipo_registro: TipoRegistro;
  hora_entrada: string;
  hora_salida?: string;
  horas_trabajadas?: number;
  tardanza_minutos?: number;
  estado: EstadoAsistencia;
  gps_entrada?: string;
  gps_salida?: string;
  foto_entrada?: string;
  foto_salida?: string;
  observaciones?: string;
}

export interface EmpleadoAsistencia {
  id: number;
  nombre: string;
  area: string;
  tipo: TipoRegistro;
  asistencia_hoy?: Asistencia;
}

export interface Horario {
  id: number;
  id_personal?: number;
  id_tecnico?: number;
  dia_semana: string;
  hora_entrada_esperada: string;
  hora_salida_esperada: string;
  tolerancia_minutos: number;
}

export interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  area: string;
  cargo: string;
  celular?: string;
  correo?: string;
  estado: 'Activo' | 'Inactivo';
}

export interface ReporteAsistencia {
  empleado: Empleado;
  mes: number;
  anio: number;
  dias_trabajados: number;
  horas_totales: number;
  tardanzas: number;
  faltas: number;
  puntualidad: number; // Porcentaje
}
