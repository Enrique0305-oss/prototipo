import { apiClient } from '../../core/api/api.client';
import type {
  Programacion,
  Tecnico,
  Vehiculo,
  ODSDisponible,
  FiltroProgramacion,
  EstadisticasProgramacion,
  PreviewAnual,
  SugerenciaSiguiente,
} from './programaciones.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  alertas_stock?: any[];
  total_programaciones?: number;
  fechas?: string[];
  sugerencia_siguiente?: SugerenciaSiguiente | null;
  total?: number;
}

export const programacionService = {

  // ─── Programaciones CRUD ─────────────────────

  getAll: async (filtros?: FiltroProgramacion) => {
    return apiClient.get<ApiResponse<Programacion[]>>('/programacion-servicio', filtros as any);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Programacion>>(`/programacion-servicio/${id}`);
  },

  create: async (data: Record<string, any>) => {
    return apiClient.post<ApiResponse<Programacion>>('/programacion-servicio', data);
  },

  update: async (id: number, data: Record<string, any>) => {
    return apiClient.post<ApiResponse<Programacion>>(`/programacion-servicio/${id}`, { ...data, _method: 'PUT' });
  },

  completar: async (id: number, data?: Record<string, any>) => {
    return apiClient.post<ApiResponse<Programacion> & { sugerencia_siguiente?: SugerenciaSiguiente }>(
      `/programacion-servicio/${id}/completar`,
      { ...data, _method: 'PATCH' }
    );
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/programacion-servicio/${id}`);
  },

  // ─── Programación Anual ──────────────────────

  previewAnual: async (data: { id_servicio: number; frecuencia: string; fecha_inicio: string }) => {
    return apiClient.post<ApiResponse<PreviewAnual>>('/programacion-servicio/preview-anual', data);
  },

  createAnual: async (data: Record<string, any>) => {
    return apiClient.post<ApiResponse<Programacion[]>>('/programacion-servicio/anual', data);
  },

  // ─── Auxiliares ──────────────────────────────

  getODSDisponibles: async () => {
    return apiClient.get<ApiResponse<ODSDisponible[]>>('/programacion-servicio/ods-disponibles');
  },

  getEstadisticas: async (mes?: number, anio?: number) => {
    const params: any = {};
    if (mes) params.mes = mes;
    if (anio) params.anio = anio;
    return apiClient.get<ApiResponse<EstadisticasProgramacion>>('/programacion-servicio/estadisticas/resumen', params);
  },

  getTecnicos: async () => {
    return apiClient.get<{ success: boolean; data: Tecnico[] }>('/tecnicos');
  },

  getVehiculos: async () => {
    return apiClient.get<{ success: boolean; data: Vehiculo[] }>('/vehiculos');
  },

  getPersonal: async () => {
    return apiClient.get<{ success: boolean; data: { id: number; nombre: string; apellidos: string }[] }>('/personal');
  },

  downloadPDF: async (params: {
    vista: 'mensual' | 'semanal' | 'diaria';
    mes?: number;
    anio?: number;
    fecha_inicio?: string;
    fecha?: string;
    id_tecnico?: number;
    estado?: string;
  }) => {
    const query = new URLSearchParams();
    query.set('vista', params.vista);
    if (params.mes) query.set('mes', String(params.mes));
    if (params.anio) query.set('anio', String(params.anio));
    if (params.fecha_inicio) query.set('fecha_inicio', params.fecha_inicio);
    if (params.fecha) query.set('fecha', params.fecha);
    if (params.id_tecnico) query.set('id_tecnico', String(params.id_tecnico));
    if (params.estado) query.set('estado', params.estado);

    const filename = `Programacion_${params.vista}_${new Date().toISOString().slice(0, 10)}.pdf`;
    return apiClient.downloadFile(`/programacion-servicio/pdf?${query.toString()}`, filename);
  },
};
