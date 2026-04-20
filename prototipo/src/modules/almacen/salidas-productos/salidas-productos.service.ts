import { apiClient } from '../../../core/api/api.client';

export interface OrdenProductoSalidaDetalle {
  id: number;
  id_producto: number;
  id_lote?: number | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  lote?: {
    id: number;
    numero_lote: string;
  };
  producto?: {
    id: number;
    descripcion: string;
    unidad_medida?: string;
    inventario?: {
      cantidad_disponible: number;
    };
  };
}

export interface OrdenProductoSalida {
  id: number;
  numero_orden: string;
  fecha_envio: string;
  estado?: string;
  cliente?: {
    id: number;
    nombre_empresa?: string;
    ruc?: string;
  };
  emisor?: {
    id: number;
    nombre?: string;
    apellidos?: string;
  };
  detalles?: OrdenProductoSalidaDetalle[];
  salidas_kardex?: Array<{
    id: number;
    fecha_movimiento?: string;
    referencia?: string;
  }>;
}

export interface ConfirmarSalidaOrdenProductoPayload {
  id_orden_producto: number;
  detalles: Array<{
    id_producto: number;
    id_lote: number;
    cantidad_entregada: number;
  }>;
  observacion?: string;
}

export const salidasProductosService = {
  getPendientes: async (params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    return apiClient.get<{ success: boolean; data: OrdenProductoSalida[] }>('/almacen/salidas-orden-producto/pendientes', { params });
  },

  getHistorial: async (params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    return apiClient.get<{ success: boolean; data: OrdenProductoSalida[] }>('/almacen/salidas-orden-producto/historial', { params });
  },

  getDetalle: async (idOrdenProducto: number) => {
    return apiClient.get<{ success: boolean; data: OrdenProductoSalida }>(`/almacen/salidas-orden-producto/${idOrdenProducto}`);
  },

  confirmarSalida: async (payload: ConfirmarSalidaOrdenProductoPayload) => {
    return apiClient.post<{ success: boolean; message: string }>('/almacen/salidas-orden-producto/confirmar', payload);
  },
};
