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

  // ── Plantas ──────────────────────────────────
  getPlantas: async (idCliente: number) => {
    return apiClient.get<ApiResponse<any[]>>(`/clientes/${idCliente}/plantas`);
  },
  createPlanta: async (idCliente: number, data: any) => {
    return apiClient.post<ApiResponse<any>>(`/clientes/${idCliente}/plantas`, data);
  },
  updatePlanta: async (idCliente: number, idPlanta: number, data: any) => {
    return apiClient.post<ApiResponse<any>>(`/clientes/${idCliente}/plantas/${idPlanta}`, { ...data, _method: 'PUT' });
  },
  deletePlanta: async (idCliente: number, idPlanta: number) => {
    return apiClient.delete<ApiResponse<null>>(`/clientes/${idCliente}/plantas/${idPlanta}`);
  },

  // ── Áreas de planta ──────────────────────────
  getAreas: async (idCliente: number, idPlanta: number) => {
    return apiClient.get<ApiResponse<any[]>>(`/clientes/${idCliente}/plantas/${idPlanta}/areas`);
  },
  createArea: async (idCliente: number, idPlanta: number, data: any) => {
    return apiClient.post<ApiResponse<any>>(`/clientes/${idCliente}/plantas/${idPlanta}/areas`, data);
  },
  updateArea: async (idCliente: number, idPlanta: number, idArea: number, data: any) => {
    return apiClient.post<ApiResponse<any>>(`/clientes/${idCliente}/plantas/${idPlanta}/areas/${idArea}`, { ...data, _method: 'PUT' });
  },
  deleteArea: async (idCliente: number, idPlanta: number, idArea: number) => {
    return apiClient.delete<ApiResponse<null>>(`/clientes/${idCliente}/plantas/${idPlanta}/areas/${idArea}`);
  },
};
