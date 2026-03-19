import { apiClient } from '../core/api/api.client';

export interface InventarioAjuste {
  id: number;
  id_producto: number;
  producto: string;
  tipo_ajuste: 'Entrada' | 'Salida';
  stock_anterior: number;
  stock_nuevo: number;
  diferencia: number;
  motivo: string;
  referencia: string;
  id_kardex: number | null;
  usuario: string;
  observacion: string | null;
  fecha_ajuste: string;
}

export const inventarioAjusteService = {
  getAll: async (filters?: {
    id_producto?: number;
    id_usuario?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
  }) => {
    return apiClient.get<{ success: boolean; data: InventarioAjuste[] }>('/inventario-ajustes', filters as any);
  },

  crear: async (data: {
    id_producto: number;
    stock_nuevo: number;
    motivo: string;
    observacion?: string;
  }) => {
    return apiClient.post<{ success: boolean; message: string; data: InventarioAjuste }>('/inventario-ajustes', data);
  },
};
