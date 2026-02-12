import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  OrdenServicio,
  OrdenServicioFilters,
  PaginationParams,
} from '../core/api/types';

export const ordenServicioService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<any>>('/ordenes-servicio/estadisticas/resumen');
  },

  getAll: async (filters?: OrdenServicioFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<OrdenServicio[]>>('/ordenes-servicio', filters);
  },

  create: async (data: {
    id_cotizacion: number;
    fecha_orden: string;
    fecha_ejecucion?: string;
    id_programacion?: number;
    observaciones?: string;
  }) => {
    return apiClient.post<ApiResponse<OrdenServicio>>('/ordenes-servicio', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<OrdenServicio>>(`/ordenes-servicio/${id}`);
  },

  update: async (id: number, data: Partial<OrdenServicio>) => {
    return apiClient.post<ApiResponse<OrdenServicio>>(`/ordenes-servicio/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  cambiarEstado: async (
    id: number,
    estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado'
  ) => {
    return apiClient.patch<ApiResponse<OrdenServicio>>(`/ordenes-servicio/${id}/estado`, {
      estado,
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/ordenes-servicio/${id}`);
  },

  vincularProgramacion: async (id: number, id_programacion: number) => {
    return apiClient.patch<ApiResponse<OrdenServicio>>(
      `/ordenes-servicio/${id}/vincular-programacion`,
      { id_programacion }
    );
  },
};
