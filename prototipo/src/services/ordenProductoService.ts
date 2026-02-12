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

  create: async (data: {
    id_cliente: number;
    fecha_orden: string;
    fecha_entrega?: string;
    observaciones?: string;
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

  update: async (id: number, data: Partial<OrdenProducto>) => {
    return apiClient.post<ApiResponse<OrdenProducto>>(`/ordenes-producto/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  cambiarEstado: async (
    id: number,
    estado: 'Pendiente' | 'En Preparación' | 'Enviado' | 'Entregado' | 'Cancelado'
  ) => {
    return apiClient.patch<ApiResponse<OrdenProducto>>(`/ordenes-producto/${id}/estado`, {
      estado,
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/ordenes-producto/${id}`);
  },

  registrarEnvio: async (id: number, fecha_envio: string) => {
    return apiClient.patch<ApiResponse<OrdenProducto>>(
      `/ordenes-producto/${id}/registrar-envio`,
      { fecha_envio }
    );
  },
};
