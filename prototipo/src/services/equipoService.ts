import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Equipo,
  EquipoFilters,
  PaginationParams,
} from '../core/api/types';

export const equipoService = {

  getAll: async (filters?: EquipoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Equipo[]>>('/equipos', filters);
  },

  create: async (data: {
    descripcion: string;
    marca: string;
    modelo: string;
    serie: number;
    encargado: string;
    responsable: string;
    contacto: number;
    estado?: 'Activo' | 'Inactivo';
  }) => {
    return apiClient.post<ApiResponse<Equipo>>('/equipos', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Equipo>>(`/equipos/${id}`);
  },

  update: async (id: number, data: Partial<Equipo>) => {
    return apiClient.post<ApiResponse<Equipo>>(`/equipos/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/equipos/${id}`);
  },
};
