import { apiClient } from '../core/api/api.client';

export interface KardexMovimiento {
  id: number;
  id_producto: number;
  producto: string;
  tipo_movimiento: 'Entrada' | 'Salida';
  cantidad: number;
  stock_anterior: number;
  stock_posterior: number;
  motivo: string;
  referencia: string;
  id_referencia: number | null;
  usuario: string;
  observacion: string | null;
  fecha_movimiento: string;
}

export interface KardexEstadisticas {
  total_movimientos: number;
  entradas_mes: number;
  salidas_mes: number;
  movimientos_hoy: number;
  productos_con_movimiento_mes: number;
}

export interface KardexFiltros {
  id_producto?: number;
  tipo_movimiento?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  motivo?: string;
}

export const kardexService = {
  getAll: async (filtros?: KardexFiltros) => {
    return apiClient.get<{ success: boolean; data: KardexMovimiento[] }>('/kardex', filtros as any);
  },

  getByProducto: async (idProducto: number) => {
    return apiClient.get<{ success: boolean; data: KardexMovimiento[] }>(`/kardex/producto/${idProducto}`);
  },

  getEstadisticas: async () => {
    return apiClient.get<{ success: boolean; data: KardexEstadisticas }>('/kardex/estadisticas/resumen');
  },

  registrar: async (data: {
    id_producto: number;
    tipo_movimiento: 'Entrada' | 'Salida';
    cantidad: number;
    motivo: string;
    observacion?: string;
  }) => {
    return apiClient.post<{ success: boolean; message: string; data: KardexMovimiento }>('/kardex', data);
  },
};
