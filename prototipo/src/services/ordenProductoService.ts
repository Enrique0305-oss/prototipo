import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  OrdenProducto,
  OrdenProductoFilters,
  PaginationParams,
} from '../core/api/types';

export const ordenProductoService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<any>>('/ordenes-producto/estadisticas/resumen');
  },

  getAll: async (filters?: OrdenProductoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<OrdenProducto[]>>('/ordenes-producto', filters);
  },

  getCotizacionesDisponibles: async () => {
    return apiClient.get<ApiResponse<any[]>>('/ordenes-producto/cotizaciones-disponibles');
  },

  getDesdeCotizacion: async (cotizacionId: number) => {
    return apiClient.get<ApiResponse<any>>(`/ordenes-producto/desde-cotizacion/${cotizacionId}`);
  },

  getPersonal: async () => {
    return apiClient.get<ApiResponse<any[]>>('/personal');
  },

  create: async (data: {
    id_cotizacion: number;
    fecha_envio: string;
    emitido_por: number;
    incluye_igv?: boolean;
    detalles: Array<{
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
    }>;
  }) => {
    return apiClient.post<ApiResponse<OrdenProducto>>('/ordenes-producto', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<OrdenProducto>>(`/ordenes-producto/${id}`);
  },

  update: async (id: number, data: any) => {
    return apiClient.post<ApiResponse<OrdenProducto>>(`/ordenes-producto/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/ordenes-producto/${id}`);
  },

  getPDFUrl: (id: number, descargar: boolean = false) => {
    const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    return `${base}/ordenes-producto/${id}/pdf${descargar ? '?descargar=true' : ''}`;
  },

  downloadPDF: async (id: number, filename?: string) => {
    const defaultFilename = filename || `orden_producto_${id}.pdf`;
    return apiClient.downloadFile(`/ordenes-producto/${id}/pdf?descargar=true`, defaultFilename);
  },
};
