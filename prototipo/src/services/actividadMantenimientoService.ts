import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  ActividadMantenimiento,
  ActividadMantenimientoFilters,
  PaginationParams,
} from '../core/api/types';


export const actividadMantenimientoService = {

  getAll: async (filters?: ActividadMantenimientoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<ActividadMantenimiento[]>>(
      '/actividades-mantenimiento',
      filters
    );
  },

  create: async (data: {
    motivo: string;
    tipo_mantenimiento: 'Preventivo' | 'Correctivo';
    tipo_equipo?: string;
    frecuencia_sugerida?: string;
    categoria?: 'Programado' | 'Entregado' | 'Garantia';
  }) => {
    return apiClient.post<ApiResponse<ActividadMantenimiento>>(
      '/actividades-mantenimiento',
      data
    );
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<ActividadMantenimiento>>(
      `/actividades-mantenimiento/${id}`
    );
  },

  update: async (id: number, data: Partial<ActividadMantenimiento>) => {
    return apiClient.post<ApiResponse<ActividadMantenimiento>>(
      `/actividades-mantenimiento/${id}`,
      {
        ...data,
        _method: 'PUT',
      }
    );
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/actividades-mantenimiento/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<ActividadMantenimiento>>(
      `/actividades-mantenimiento/${id}/reactivar`
    );
  },
};
