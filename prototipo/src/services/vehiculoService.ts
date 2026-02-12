import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Vehiculo,
  VehiculoFilters,
  PaginationParams,
  EstadisticasVehiculos,
} from '../core/api/types';

export const vehiculoService = {
  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<EstadisticasVehiculos>>('/vehiculos/estadisticas/resumen');
  },

  getAll: async (filters?: VehiculoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Vehiculo[]>>('/vehiculos', filters);
  },

  create: async (data: {
    placa: string;
    marca: string;
    modelo: string;
    anio: number;
    capacidad_carga: number;
    observaciones?: string;
  }) => {
    return apiClient.post<ApiResponse<Vehiculo>>('/vehiculos', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Vehiculo>>(`/vehiculos/${id}`);
  },

  update: async (id: number, data: Partial<Vehiculo>) => {
    return apiClient.post<ApiResponse<Vehiculo>>(`/vehiculos/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/vehiculos/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<Vehiculo>>(`/vehiculos/${id}/reactivar`);
  },
};
