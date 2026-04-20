import { apiClient } from '../core/api/api.client';
import type { ApiResponse, Lote } from '../core/api/types';

export const loteService = {
  getByProducto: async (idProducto: number) => {
    return apiClient.get<ApiResponse<Lote[]>>(`/productos/${idProducto}/lotes`);
  },

  create: async (idProducto: number, data: {
    numero_lote: string;
    fecha_vencimiento: string;
    cantidad: number;
    observacion?: string;
  }) => {
    return apiClient.post<ApiResponse<Lote>>(`/productos/${idProducto}/lotes`, data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Lote>>(`/lotes/${id}`);
  },

  update: async (id: number, data: Partial<Lote>) => {
    return apiClient.put<ApiResponse<Lote>>(`/lotes/${id}`, data);
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/lotes/${id}`);
  },
};
