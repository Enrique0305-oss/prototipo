import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Categoria,
  CategoriaFilters,
  PaginationParams,
} from '../core/api/types';

export const categoriaService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<any>>('/categorias/estadisticas/resumen');
  },

  getAll: async (filters?: CategoriaFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Categoria[]>>('/categorias', filters);
  },

  create: async (data: {
    nombre: string;
    descripcion?: string;
  }) => {
    return apiClient.post<ApiResponse<Categoria>>('/categorias', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Categoria>>(`/categorias/${id}`);
  },

  update: async (id: number, data: Partial<Categoria>) => {
    return apiClient.post<ApiResponse<Categoria>>(`/categorias/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/categorias/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<Categoria>>(`/categorias/${id}/reactivar`);
  },
};
