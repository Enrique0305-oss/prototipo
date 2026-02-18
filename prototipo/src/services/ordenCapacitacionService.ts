import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  OrdenCapacitacion,
  OrdenCapacitacionFilters,
  PaginationParams,
} from '../core/api/types';

export const ordenCapacitacionService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<any>>('/ordenes-capacitacion-auditoria/estadisticas/resumen');
  },

  getAll: async (filters?: OrdenCapacitacionFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<OrdenCapacitacion[]>>('/ordenes-capacitacion-auditoria', filters);
  },

  getCotizacionesDisponibles: async () => {
    return apiClient.get<ApiResponse<any[]>>('/ordenes-capacitacion-auditoria/cotizaciones-disponibles');
  },

  getDesdeCotizacion: async (cotizacionId: number) => {
    return apiClient.get<ApiResponse<any>>(`/ordenes-capacitacion-auditoria/desde-cotizacion/${cotizacionId}`);
  },

  getPersonal: async () => {
    return apiClient.get<ApiResponse<any[]>>('/personal');
  },

  create: async (data: any) => {
    return apiClient.post<ApiResponse<OrdenCapacitacion>>('/ordenes-capacitacion-auditoria', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<OrdenCapacitacion>>(`/ordenes-capacitacion-auditoria/${id}`);
  },

  update: async (id: number, data: any) => {
    return apiClient.post<ApiResponse<OrdenCapacitacion>>(`/ordenes-capacitacion-auditoria/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/ordenes-capacitacion-auditoria/${id}`);
  },
};
