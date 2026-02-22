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
};
