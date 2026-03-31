import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  OrdenCapacitacion,
  OrdenCapacitacionFilters,
  PaginationParams,
} from '../core/api/types';

export const ordenAsesoriaService = {
  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<any>>('/ordenes-asesoria/estadisticas/resumen');
  },

  getAll: async (filters?: OrdenCapacitacionFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<OrdenCapacitacion[]>>('/ordenes-asesoria', filters);
  },

  getCotizacionesDisponibles: async () => {
    return apiClient.get<ApiResponse<any[]>>('/ordenes-asesoria/cotizaciones-disponibles');
  },

  getDesdeCotizacion: async (cotizacionId: number) => {
    return apiClient.get<ApiResponse<any>>(`/ordenes-asesoria/desde-cotizacion/${cotizacionId}`);
  },

  getExponentes: async () => {
    return apiClient.get<ApiResponse<any[]>>('/exponentes', { estado: 'Activo' });
  },

  create: async (data: any) => {
    return apiClient.post<ApiResponse<OrdenCapacitacion>>('/ordenes-asesoria', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<OrdenCapacitacion>>(`/ordenes-asesoria/${id}`);
  },

  update: async (id: number, data: any) => {
    return apiClient.post<ApiResponse<OrdenCapacitacion>>(`/ordenes-asesoria/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/ordenes-asesoria/${id}`);
  },

  downloadPDF: async (id: number) => {
    return apiClient.downloadFile(`/ordenes-asesoria/${id}/pdf`, `orden_asesoria_${id}.pdf`);
  },
};
