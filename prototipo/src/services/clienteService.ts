import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Cliente,
  ClienteFilters,
  PaginationParams,
} from '../core/api/types';

export const clienteService = {

  getAll: async (filters?: ClienteFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Cliente[]>>('/clientes', filters);
  },

  create: async (data: Omit<Cliente, 'id_cliente' | 'created_at' | 'updated_at'>) => {
    return apiClient.post<ApiResponse<Cliente>>('/clientes', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}`);
  },

  update: async (id: number, data: Partial<Cliente>) => {
    return apiClient.post<ApiResponse<Cliente>>(`/clientes/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/clientes/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<Cliente>>(`/clientes/${id}/reactivar`);
  },
};
