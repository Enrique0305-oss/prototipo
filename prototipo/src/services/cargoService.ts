import { apiClient } from '../core/api/api.client';
import type { ApiResponse } from '../core/api/types';

export interface Cargo {
  id: number;
  id_area: number | null;
  nombre: string;
  descripcion?: string | null;
  estado: 'activo' | 'inactivo';
  created_at?: string;
  updated_at?: string;
}

export interface CargoFilters {
  id_area?: number;
  estado?: 'activo' | 'inactivo';
  search?: string;
}

export const cargoService = {

  getAll: async (filters?: CargoFilters & { per_page?: number; page?: number }) => {
    return apiClient.get<ApiResponse<Cargo[]>>('/cargos', filters);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Cargo>>(`/cargos/${id}`);
  },

  getByArea: async (idArea: number) => {
    return apiClient.get<ApiResponse<Cargo[]>>(`/areas/${idArea}/cargos`);
  },

  create: async (data: {
    id_area: number | null;
    nombre: string;
    descripcion?: string;
    estado?: 'activo' | 'inactivo';
  }) => {
    return apiClient.post<ApiResponse<Cargo>>('/cargos', data);
  },

  update: async (id: number, data: Partial<Cargo>) => {
    return apiClient.post<ApiResponse<Cargo>>(`/cargos/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/cargos/${id}`);
  },
};
