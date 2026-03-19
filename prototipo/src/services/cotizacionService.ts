import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Cotizacion,
  CotizacionFilters,
  PaginationParams,
  EstadisticasCotizaciones,
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
    tipo_cotizacion: string;
    incluye_igv?: boolean;
    observaciones?: string;
    detalles: Array<{
      id_servicio?: number | null;
      id_producto?: number | null;
      descripcion_manual?: string | null;
      cantidad: number;
      precio_unitario: number;
      frecuencia_sugerida?: string | null;
      modalidad_sugerida?: string | null;
    }>;
  }) => {
    return apiClient.post<ApiResponse<Cotizacion>>('/cotizaciones', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`);
  },

  cambiarEstado: async (id: number, estado: 'Pendiente' | 'Aceptada' | 'Rechazada') => {
    return apiClient.patch<ApiResponse<Cotizacion>>(`/cotizaciones/${id}/estado`, { estado });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/cotizaciones/${id}`);
  },

  downloadPDF: async (id: number, filename?: string) => {
    const defaultFilename = filename || `cotizacion_${id}.pdf`;
    return apiClient.downloadFile(`/cotizaciones/${id}/pdf`, defaultFilename);
  },

  updateReceta: async (id: number, receta_servicio: any[]) => {
    return apiClient.patch<ApiResponse<Cotizacion>>(`/cotizaciones/${id}/receta`, { receta_servicio });
  },
};
