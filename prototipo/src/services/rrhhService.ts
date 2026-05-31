import { apiClient } from '../core/api/api.client';

export interface MiEstadoResponse {
  success: boolean;
  data: {
    personal: {
      id: number;
      nombre: string;
      area: string;
      codigo: string;
    };
    horario: {
      entrada: string;
      salida: string;
      tolerancia: number;
    } | null;
    es_descanso?: boolean;
    asistencia_hoy: {
      id: number;
      entrada: string | null;
      salida: string | null;
      horas_trabajadas: number | null;
      tardanza_minutos: number;
      tiempo_extra_minutos: number;
      estado: string;
      hora_entrada_raw: string | null;
      hora_inicio_almuerzo: string | null;
      hora_fin_almuerzo: string | null;
      hora_inicio_almuerzo_raw: string | null;
      exceso_almuerzo_minutos: number;
      horas_extra_asignadas: boolean;
      hora_inicio_extra: string | null;
      hora_inicio_extra_raw: string | null;
    } | null;
    puede_marcar_salida: boolean;
    semana: Array<{
      dia: string;
      fecha: string;
      entrada: string;
      salida: string;
      horas: string;
      estado: string;
      tardanza_minutos: number;
      tiempo_extra_minutos: number;
      es_hoy: boolean;
    }>;
    estadisticas: {
      total_horas: number;
      dias_trabajados: number;
      tardanzas: number;
      puntualidad: number;
      tiempo_extra_minutos: number;
    } | null;
    servidor_hora: string;
    servidor_fecha: string;
  };
}

export interface MarcarResponse {
  success: boolean;
  message: string;
  data?: any;
}

// === Asistencia Admin ===

export interface AsistenciaAdminRecord {
  id: number;
  id_personal: number;
  nombre: string;
  area: string;
  fecha: string;
  entrada: string | null;
  salida: string | null;
  horas_trabajadas: number | null;
  tardanza_minutos: number;
  hora_inicio_almuerzo: string | null;
  hora_fin_almuerzo: string | null;
  tiempo_almuerzo_minutos: number | null;
  tiempo_extra_minutos: number;
  horas_extra_asignadas: boolean;
  hora_inicio_extra: string | null;
  estado: string;
  observaciones: string | null;
}

export interface ListaAdminResponse {
  success: boolean;
  data: AsistenciaAdminRecord[];
}

export interface RrhhReporteDashboardResponse {
  success: boolean;
  data: {
    filtros: {
      mes: string;
      area: string;
    };
    kpis: {
      horas_trabajadas_totales: number;
      horas_efectivas: number;
      tiempo_total_tardanza_minutos: number;
      tiempo_total_almuerzo_minutos: number;
      promedio_almuerzo_minutos: number;
      tiempo_exceso_almuerzo_minutos: number;
      tardanza_inicio_almuerzo_minutos: number;
      asistencia_promedio: number;
      tardanzas_mes: number;
      ausencias_mes: number;
      tiempo_extra_total_minutos: number;
      jornada_promedio_horas: number;
    };
    por_area: Array<{
      area: string;
      horas: number;
      asistencia: number;
      tardanza_minutos: number;
      tardanzas: number;
    }>;
    top_empleados: Array<{
      id_personal: number;
      empleado: string;
      area: string;
      asistencia: number;
      puntualidad: number;
    }>;
    historico_semanas: Array<{
      etiqueta: string;
      horas: number;
      tardanza_minutos: number;
    }>;
    historico_dias: Array<{
      etiqueta: string;
      horas: number;
      tardanza_minutos: number;
    }>;
    historico_almuerzo_semanas: Array<{
      etiqueta: string;
      almuerzo_minutos: number;
      exceso_almuerzo_minutos: number;
      tardanza_inicio_almuerzo_minutos: number;
    }>;
    historico_almuerzo_dias: Array<{
      etiqueta: string;
      almuerzo_minutos: number;
      exceso_almuerzo_minutos: number;
      tardanza_inicio_almuerzo_minutos: number;
    }>;
    distribucion_estados: Array<{
      estado: string;
      total: number;
    }>;
    alertas: Array<{
      tipo: 'success' | 'warning' | 'danger' | 'info';
      titulo: string;
      detalle: string;
    }>;
    areas_disponibles: string[];
  };
}

export interface RrhhReporteServiciosTecnicosResponse {
  success: boolean;
  data: {
    filtros: {
      fecha: string;
      area: string;
    };
    resumen: {
      total_servicios: number;
      total_minutos: number;
      total_horas: number;
      promedio_servicio_min: number;
      tecnicos_con_servicios: number;
    };
    por_tecnico: Array<{
      id_tecnico: number;
      tecnico: string;
      area: string;
      servicios: number;
      minutos: number;
      horas: number;
      promedio_servicio_min: number;
      primer_inicio: string | null;
      ultimo_fin: string | null;
      detalles?: Array<{
        servicio: string;
        cliente: string;
        inicio: string | null;
        fin: string | null;
        minutos: number;
      }>;
    }>;
  };
}

// === Horarios ===

export interface EmpleadoHorarioResumen {
  id: number;
  nombre: string;
  correo: string;
  area: string;
  dias_configurados: number;
  dias_laborales: number;
  dias_descanso: number;
  estado: 'Completo' | 'Parcial' | 'Pendiente';
}

export interface DiaHorario {
  id: number | null;
  dia_semana: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  tolerancia: number;
  es_descanso: boolean;
  activo: boolean;
}

export interface HorarioDetalleResponse {
  success: boolean;
  data: {
    personal: { id: number; nombre: string; area: string };
    horarios: DiaHorario[];
  };
}

export interface HorariosListResponse {
  success: boolean;
  data: EmpleadoHorarioResumen[];
}

export const rrhhService = {
  getMiEstado: async (idPersonal: number = 1): Promise<MiEstadoResponse> => {
    return apiClient.get<MiEstadoResponse>('/asistencia/mi-estado', { id_personal: idPersonal });
  },

  marcarEntrada: async (idPersonal: number = 1): Promise<MarcarResponse> => {
    return apiClient.post<MarcarResponse>('/asistencia/marcar-entrada', { id_personal: idPersonal });
  },

  marcarSalida: async (idPersonal: number = 1): Promise<MarcarResponse> => {
    return apiClient.post<MarcarResponse>('/asistencia/marcar-salida', { id_personal: idPersonal });
  },

  marcarInicioAlmuerzo: async (idPersonal: number = 1): Promise<MarcarResponse> => {
    return apiClient.post<MarcarResponse>('/asistencia/marcar-inicio-almuerzo', { id_personal: idPersonal });
  },

  marcarFinAlmuerzo: async (idPersonal: number = 1): Promise<MarcarResponse> => {
    return apiClient.post<MarcarResponse>('/asistencia/marcar-fin-almuerzo', { id_personal: idPersonal });
  },

  // === Horarios ===
  getHorarios: async (): Promise<HorariosListResponse> => {
    return apiClient.get<HorariosListResponse>('/horarios');
  },

  getHorarioPersonal: async (idPersonal: number): Promise<HorarioDetalleResponse> => {
    return apiClient.get<HorarioDetalleResponse>(`/horarios/${idPersonal}`);
  },

  guardarHorario: async (idPersonal: number, dias: Array<{ dia_semana: string; hora_entrada: string | null; hora_salida: string | null; tolerancia: number; es_descanso: boolean }>): Promise<MarcarResponse> => {
    return apiClient.post<MarcarResponse>(`/horarios/${idPersonal}`, { dias });
  },

  copiarHorario: async (idPersonalDestino: number, idPersonalOrigen: number): Promise<MarcarResponse> => {
    return apiClient.post<MarcarResponse>(`/horarios/${idPersonalDestino}/copiar-de/${idPersonalOrigen}`);
  },

  // === Asistencia Admin ===
  getListaAdmin: async (fecha: string): Promise<ListaAdminResponse> => {
    return apiClient.get<ListaAdminResponse>('/asistencia/lista', { fecha });
  },

  getReporteDashboard: async (mes: string, area?: string): Promise<RrhhReporteDashboardResponse> => {
    const params: Record<string, string> = { mes };
    if (area && area.trim() !== '' && area !== 'Todos') {
      params.area = area;
    }
    return apiClient.get<RrhhReporteDashboardResponse>('/asistencia/reporte-dashboard', params);
  },

  getReporteServiciosTecnicos: async (fecha: string, area?: string): Promise<RrhhReporteServiciosTecnicosResponse> => {
    const params: Record<string, string> = { fecha };
    if (area && area.trim() !== '' && area !== 'Todos') {
      params.area = area;
    }
    return apiClient.get<RrhhReporteServiciosTecnicosResponse>('/asistencia/reporte-servicios-tecnicos', params);
  },

  asignarHorasExtra: async (idAsistencia: number, asignar: boolean, horaInicioExtra?: string, observaciones?: string): Promise<MarcarResponse> => {
    return apiClient.put<MarcarResponse>(`/asistencia/${idAsistencia}/horas-extra`, { asignar, hora_inicio_extra: horaInicioExtra, observaciones });
  },
};
