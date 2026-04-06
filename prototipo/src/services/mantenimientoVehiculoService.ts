import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  CalendarioMantenimientoVehiculo,
  EstadisticasMantenimientoVehiculo,
  MantenimientoVehiculo,
  MantenimientoVehiculoFilters,
  PaginationParams,
} from '../core/api/types';

export const mantenimientoVehiculoService = {
  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<EstadisticasMantenimientoVehiculo>>('/mantenimiento-vehiculo/estadisticas/resumen');
  },

  getCalendario: async (filters?: Pick<MantenimientoVehiculoFilters, 'id_vehiculo' | 'estado' | 'buscar'> & { mes: number; anio: number }) => {
    return apiClient.get<ApiResponse<CalendarioMantenimientoVehiculo>>('/mantenimiento-vehiculo/calendario', filters);
  },

  getAll: async (filters?: MantenimientoVehiculoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<MantenimientoVehiculo[]>>('/mantenimiento-vehiculo', filters);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<MantenimientoVehiculo>>(`/mantenimiento-vehiculo/${id}`);
  },

  create: async (data: {
    id_vehiculo: number;
    motivo: string;
    tipo_mantenimiento: 'Preventivo' | 'Correctivo';
    fecha_programada: string;
    kilometraje?: number;
    observaciones?: string;
  }) => {
    return apiClient.post<ApiResponse<MantenimientoVehiculo>>('/mantenimiento-vehiculo', data);
  },

  update: async (id: number, data: Partial<MantenimientoVehiculo>) => {
    return apiClient.post<ApiResponse<MantenimientoVehiculo>>(`/mantenimiento-vehiculo/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  destroy: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/mantenimiento-vehiculo/${id}`);
  },

  marcarRealizado: async (id: number, observaciones?: string) => {
    return apiClient.patch<ApiResponse<MantenimientoVehiculo>>(`/mantenimiento-vehiculo/${id}/marcar-realizado`, {
      observaciones,
    });
  },

  getHistorialVehiculo: async (idVehiculo: number) => {
    return apiClient.get<ApiResponse<MantenimientoVehiculo[]>>(`/mantenimiento-vehiculo/vehiculo/${idVehiculo}/historial`);
  },
};
