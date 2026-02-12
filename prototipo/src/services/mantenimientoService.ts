import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Mantenimiento,
  MantenimientoFilters,
  PaginationParams,
  EstadisticasMantenimientos,
  HistorialEquipo,
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
};
