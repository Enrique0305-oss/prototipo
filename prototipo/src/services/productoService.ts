import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Producto,
  ProductoFilters,
  PaginationParams,
  EstadisticasProductos,
} from '../core/api/types';

export const productoService = {

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<EstadisticasProductos>>('/productos/estadisticas/resumen');
  },

  getAll: async (filters?: ProductoFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Producto[]>>('/productos', filters);
  },

  create: async (data: {
    descripcion: string;
    id_categoria: number;
    n_lote: string;
    ubicacion: string;
    unidad?: string;
    precio_unitario?: number;
    fecha_vencim?: string;
    estado?: 'Activo' | 'Inactivo';
  }) => {
    return apiClient.post<ApiResponse<Producto>>('/productos', data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Producto>>(`/productos/${id}`);
  },

  update: async (id: number, data: Partial<Producto>) => {
    return apiClient.post<ApiResponse<Producto>>(`/productos/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/productos/${id}`);
  },

  reactivar: async (id: number) => {
    return apiClient.patch<ApiResponse<Producto>>(`/productos/${id}/reactivar`);
  },

  subirImagen: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('imagen', file);
    return apiClient.postFormData<ApiResponse<{ imagen: string; imagen_url: string }>>(`/productos/${id}/imagen`, formData);
  },

  eliminarImagen: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/productos/${id}/imagen`);
  },
};
