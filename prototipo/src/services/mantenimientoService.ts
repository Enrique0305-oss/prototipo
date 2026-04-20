import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Mantenimiento,
  MantenimientoFilters,
  PaginationParams,
  EstadisticasMantenimientos,
  HistorialEquipo,
  ProgramacionMantenimiento,
  PreviewFecha,
} from '../core/api/types';


export const mantenimientoService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<EstadisticasMantenimientos>>(
      '/mantenimientos/estadisticas/resumen'
    );
  },

  getHistorialEquipo: async (id_equipo: number) => {
    return apiClient.get<ApiResponse<HistorialEquipo>>(
      `/mantenimientos/equipo/${id_equipo}/historial`
    );
  },

  getAll: async (filters?: MantenimientoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Mantenimiento[]>>('/mantenimientos', filters);
  },

  create: async (data: {
    id_equipo: number;
    id_actmanten: number;
    fecha: string;
    observaciones?: string;
  }) => {
    return apiClient.post<ApiResponse<Mantenimiento>>('/mantenimientos', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Mantenimiento>>(`/mantenimientos/${id}`);
  },

  update: async (id: number, data: Partial<Mantenimiento>) => {
    return apiClient.post<ApiResponse<Mantenimiento>>(`/mantenimientos/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/mantenimientos/${id}`);
  },

  // Programación Anual
  getProgramaciones: async (filters?: { anio?: number; id_equipo?: number }) => {
    return apiClient.get<ApiResponse<ProgramacionMantenimiento[]>>(
      '/programacion-mantenimiento',
      filters
    );
  },

  getProgramacionById: async (id: number) => {
    return apiClient.get<ApiResponse<ProgramacionMantenimiento>>(
      `/programacion-mantenimiento/${id}`
    );
  },

  previewFechas: async (data: {
    anio: number;
    frecuencia_meses: number;
    fecha_inicio: string;
    modo_programacion?: 'Anual' | 'Unica';
    es_prueba?: boolean;
    cantidad?: number;
  }) => {
    return apiClient.post<ApiResponse<PreviewFecha[]> & { total: number }>(
      '/programacion-mantenimiento/preview',
      data
    );
  },

  programarAnual: async (data: {
    id_equipo: number;
    motivo: string;
    tipo_mantenimiento?: 'Preventivo' | 'Correctivo';
    anio: number;
    frecuencia_meses: number;
    fecha_inicio: string;
    modo_programacion?: 'Anual' | 'Unica';
    observaciones?: string;
    es_prueba?: boolean;
    cantidad?: number;
  }) => {
    return apiClient.post<ApiResponse<ProgramacionMantenimiento>>(
      '/programacion-mantenimiento',
      data
    );
  },

  actualizarProgramacion: async (id: number, data: {
    id_equipo: number;
    motivo: string;
    tipo_mantenimiento?: 'Preventivo' | 'Correctivo';
    anio: number;
    frecuencia_meses: number;
    fecha_inicio: string;
    modo_programacion?: 'Anual' | 'Unica';
    observaciones?: string;
  }) => {
    return apiClient.put<ApiResponse<ProgramacionMantenimiento>>(
      `/programacion-mantenimiento/${id}`,
      data
    );
  },

  eliminarProgramacion: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/programacion-mantenimiento/${id}`);
  },

  marcarRealizado: async (id: number, observaciones?: string) => {
    return apiClient.patch<ApiResponse<Mantenimiento>>(
      `/mantenimientos/${id}/marcar-realizado`,
      { observaciones }
    );
  },

  getAlertasMantenimiento: async () => {
    return apiClient.get<{
      success: boolean;
      proximos: number;
      vencidos: number;
      total_alertas: number;
      alertas: Array<{
        tipo: 'proximo' | 'vencido';
        id: number;
        equipo: string;
        fecha: string;
        tiempo_texto: string;
        es_prueba: boolean;
      }>;
    }>('/programacion-mantenimiento/alertas');
  },
};
