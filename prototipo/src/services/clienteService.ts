import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Cliente,
  ClienteFilters,
  PaginationParams,
} from '../core/api/types';

export const clienteService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<any>>('/clientes/estadisticas/resumen');
  },

  getAll: async (filters?: ClienteFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Cliente[]>>('/clientes', filters);
  },

  create: async (data: {
    nombre_empresa: string;
    ruc: string;
    rubro: string;
    direccion?: string;
    persona_contacto?: string;
    telefono_contacto?: string;
    origen?: string;
    fecha_registro?: string;
    estado?: string;
  }) => {
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
};
