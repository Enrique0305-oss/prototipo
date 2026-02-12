import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Cotizacion,
  CotizacionFilters,
  PaginationParams,
  EstadisticasCotizaciones,
  DetalleCotizacion,
} from '../core/api/types';

export const cotizacionService = {

  getAll: async (filters?: CotizacionFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Cotizacion[]>>('/cotizaciones', filters);
  },

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<EstadisticasCotizaciones>>('/cotizaciones/estadisticas/resumen');
  },

  create: async (data: {
    id_cliente: number;
    fecha: string;
    tipo_servicio: string;
    descripcion?: string;
    observaciones?: string;
    detalles: Array<{
      descripcion: string;
      cantidad: number;
      precio_unitario: number;
    }>;
  }) => {
    return apiClient.post<ApiResponse<Cotizacion>>('/cotizaciones', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`);
  },

  update: async (id: number, data: Partial<Cotizacion>) => {
    return apiClient.post<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  cambiarEstado: async (id: number, estado: 'Pendiente' | 'Aceptado' | 'Rechazado') => {
    return apiClient.patch<ApiResponse<Cotizacion>>(`/cotizaciones/${id}/estado`, { estado });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/cotizaciones/${id}`);
  },

  downloadPDF: async (id: number, filename?: string) => {
    const defaultFilename = filename || `cotizacion_${id}.pdf`;
    return apiClient.downloadFile(`/cotizaciones/${id}/pdf`, defaultFilename);
  },
};
