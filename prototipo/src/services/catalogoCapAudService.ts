import { apiClient } from '../core/api/api.client';
import type { ApiResponse, PaginationParams } from '../core/api/types';

export interface CatalogoCapAud {
  id: number;
  tipo: 'Capacitación' | 'Auditoría';
  nombre: string;
  descripcion: string | null;
  precio_referencial: number | null;
  duracion_horas: number | null;
  estado: 'activo' | 'inactivo';
}

export interface CatalogoCapAudFilters {
  tipo?: string;
  search?: string;
  estado?: string;
}

export const catalogoCapAudService = {

  getAll: async (filters?: CatalogoCapAudFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<CatalogoCapAud[]>>('/catalogo-capacitacion-auditoria', filters);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<CatalogoCapAud>>(`/catalogo-capacitacion-auditoria/${id}`);
  },

  create: async (data: {
    tipo: 'Capacitación' | 'Auditoría';
    nombre: string;
    descripcion?: string;
    precio_referencial?: number;
    duracion_horas?: number;
    estado?: 'activo' | 'inactivo';
  }) => {
    return apiClient.post<ApiResponse<CatalogoCapAud>>('/catalogo-capacitacion-auditoria', data);
  },

  update: async (id: number, data: Partial<CatalogoCapAud>) => {
    return apiClient.post<ApiResponse<CatalogoCapAud>>(`/catalogo-capacitacion-auditoria/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/catalogo-capacitacion-auditoria/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<CatalogoCapAud>>(`/catalogo-capacitacion-auditoria/${id}/reactivar`, {});
  },

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<{
      total: number;
      activos: number;
      inactivos: number;
      capacitaciones: number;
      auditorias: number;
    }>>('/catalogo-capacitacion-auditoria/estadisticas/resumen');
  },
};
