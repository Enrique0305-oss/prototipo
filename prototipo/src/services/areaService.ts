import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Area,
  AreaFilters,
  PaginationParams,
} from '../core/api/types';


export const areaService = {

  getAll: async (filters?: AreaFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Area[]>>('/areas', filters);
  },

  create: async (data: {
    nombre: string;
    descripcion?: string;
  }) => {
    return apiClient.post<ApiResponse<Area>>('/areas', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Area>>(`/areas/${id}`);
  },

  update: async (id: number, data: Partial<Area>) => {
    return apiClient.post<ApiResponse<Area>>(`/areas/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/areas/${id}`);
  },
};
