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

  create: async (data: {
    id_cotizacion: number;
    fecha_orden: string;
    fecha_programada?: string;
    tipo: 'Capacitación' | 'Auditoría';
    observaciones?: string;
  }) => {
    return apiClient.post<ApiResponse<OrdenCapacitacion>>('/ordenes-capacitacion-auditoria', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<OrdenCapacitacion>>(`/ordenes-capacitacion-auditoria/${id}`);
  },

  update: async (id: number, data: Partial<OrdenCapacitacion>) => {
    return apiClient.post<ApiResponse<OrdenCapacitacion>>(`/ordenes-capacitacion-auditoria/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  cambiarEstado: async (
    id: number,
    estado: 'Pendiente' | 'Programado' | 'Completado' | 'Cancelado'
  ) => {
    return apiClient.patch<ApiResponse<OrdenCapacitacion>>(
      `/ordenes-capacitacion-auditoria/${id}/estado`,
      { estado }
    );
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/ordenes-capacitacion-auditoria/${id}`);
  },

  programarFecha: async (id: number, fecha_programada: string) => {
    return apiClient.patch<ApiResponse<OrdenCapacitacion>>(
      `/ordenes-capacitacion-auditoria/${id}/programar`,
      { fecha_programada }
    );
  },
};
