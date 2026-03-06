import { apiClient } from '../../../core/api/api.client';

export interface Proveedor {
  id: number;
  razon_social: string;
  ruc?: string | null;
  nombre_comercial?: string | null;
  contacto_nombre?: string | null;
  contacto_telefono?: string | null;
  contacto_email?: string | null;
  direccion?: string | null;
  banco?: string | null;
  numero_cuenta?: string | null;
  cci?: string | null;
  estado: 'Activo' | 'Inactivo';
  observaciones?: string | null;
  created_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const proveedorService = {

  getAll: (params?: { search?: string; estado?: string }) =>
    apiClient.get<ApiResponse<Proveedor[]>>('/proveedores', params as any),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Proveedor>>(`/proveedores/${id}`),

  create: (data: Partial<Proveedor>) =>
    apiClient.post<ApiResponse<Proveedor>>('/proveedores', data),

  update: (id: number, data: Partial<Proveedor>) =>
    apiClient.post<ApiResponse<Proveedor>>(`/proveedores/${id}`, { ...data, _method: 'PUT' }),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/proveedores/${id}`),
};
