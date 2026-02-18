import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Servicio,
  ServicioFilters,
  PaginationParams,
} from '../core/api/types';

export const servicioService = {

  getAll: async (filters?: ServicioFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Servicio[]>>('/servicios', filters);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Servicio>>(`/servicios/${id}`);
  },

  create: async (data: {
    nombre: string;
    descripcion: string;
    estado?: 'activo' | 'inactivo';
    duracion_estimada?: number;
    requiere_movilidad?: boolean;
    requiere_certificado?: boolean;
    plantilla_certificado?: string;
  }) => {
    return apiClient.post<ApiResponse<Servicio>>('/servicios', data);
  },

  update: async (id: number, data: Partial<Servicio>) => {
    return apiClient.post<ApiResponse<Servicio>>(`/servicios/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/servicios/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<Servicio>>(`/servicios/${id}/reactivar`, {});
  },

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<{
      total: number;
      activos: number;
      inactivos: number;
      con_movilidad: number;
      con_certificado: number;
    }>>('/servicios/estadisticas/resumen');
  },
};
