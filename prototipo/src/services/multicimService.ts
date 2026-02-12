import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Multicim,
  MulticimFilters,
  PaginationParams,
} from '../core/api/types';


export const multicimService = {
  getAll: async (filters?: MulticimFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Multicim[]>>('/multicim', filters);
  },

  create: async (data: {
    descripcion?: string;
    monto: number;
    fecha: string;
  }) => {
    return apiClient.post<ApiResponse<Multicim>>('/multicim', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Multicim>>(`/multicim/${id}`);
  },

  update: async (id: number, data: Partial<Multicim>) => {
    return apiClient.post<ApiResponse<Multicim>>(`/multicim/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/multicim/${id}`);
  },
};
