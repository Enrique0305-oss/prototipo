import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  OrdenServicio,
  OrdenServicioFilters,
  PaginationParams,
} from '../core/api/types';

export const ordenServicioService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<any>>('/ordenes-servicio/estadisticas/resumen');
  },

  getSiguienteNumero: async () => {
    return apiClient.get<ApiResponse<any>>('/ordenes-servicio/siguiente-numero');
  },

  getAll: async (filters?: OrdenServicioFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<OrdenServicio[]>>('/ordenes-servicio', filters);
  },

  getCotizacionesDisponibles: async () => {
    return apiClient.get<ApiResponse<any[]>>('/ordenes-servicio/cotizaciones-disponibles');
  },

  getDesdeCotizacion: async (cotizacionId: number) => {
    return apiClient.get<ApiResponse<any>>(`/ordenes-servicio/desde-cotizacion/${cotizacionId}`);
  },

  getPersonal: async () => {
    return apiClient.get<ApiResponse<any[]>>('/personal');
  },

  create: async (data: {
    id_cotizacion: number;
    fecha_aceptacion: string;
    fecha_tentativa?: string;
    emitido_por: number;
    codigo_doc?: string;
    version?: string;
    incluye_igv?: boolean;
    detalles: {
      id_servicio: number;
      local?: string;
      frecuencia?: string;
      precio: number;
    }[];
    productos?: {
      id_producto: number;
      cantidad: number;
      observacion?: string;
    }[];
    equipos?: {
      id_equipo: number;
      observacion?: string;
    }[];
  }) => {
    return apiClient.post<ApiResponse<OrdenServicio>>('/ordenes-servicio', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<OrdenServicio>>(`/ordenes-servicio/${id}`);
  },

  update: async (id: number, data: any) => {
    return apiClient.post<ApiResponse<OrdenServicio>>(`/ordenes-servicio/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/ordenes-servicio/${id}`);
  },
};
