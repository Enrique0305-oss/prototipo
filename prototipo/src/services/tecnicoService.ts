import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Tecnico,
  TecnicoFilters,
  PaginationParams,
  EstadisticasTecnicos,
} from '../core/api/types';


export const tecnicoService = {
 
  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<EstadisticasTecnicos>>('/tecnicos/estadisticas/resumen');
  },

  getAll: async (filters?: TecnicoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Tecnico[]>>('/tecnicos', filters);
  },

  create: async (data: {
    nombre: string;
    apellido: string;
    dni: string;
    especialidad?: string;
    telefono?: string;
    email?: string;
    carga_maxima_semanal: number;
    autorizado_conducir: boolean;
  }) => {
    return apiClient.post<ApiResponse<Tecnico>>('/tecnicos', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Tecnico>>(`/tecnicos/${id}`);
  },

  update: async (id: number, data: Partial<Tecnico>) => {
    return apiClient.post<ApiResponse<Tecnico>>(`/tecnicos/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/tecnicos/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<Tecnico>>(`/tecnicos/${id}/reactivar`);
  },

  ponerEnLicencia: async (id: number) => {
    return apiClient.patch<ApiResponse<Tecnico>>(`/tecnicos/${id}/licencia`);
  },
};
