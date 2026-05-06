import { apiClient } from '../../../core/api/api.client';
import type { Proveedor } from '../proveedores/proveedores.service';

export interface DetalleOrdenCompra {
  id?: number;
  id_orden_compra?: number;
  id_producto: number;
  id_lote?: number | null;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
  observacion?: string | null;
  producto?: {
    id: number;
    descripcion: string;
    sku?: string;
    categoria?: { nombre: string };
  };
  lote?: {
    id: number;
    numero_lote: string;
  } | null;
}

export interface OrdenCompra {
  id: number;
  numero_orden_compra?: string;
  numero_cotizacion_proveedor?: string | null;
  numero_factura?: string | null;
  id_proveedor: number;
  fecha_compra: string;
  fecha_recepcion?: string | null;
  tipo_moneda: 'PEN' | 'USD';
  tipo_cambio?: number | null;
  tiene_igv: boolean;
  subtotal: number;
  costo_envio?: number;
  igv: number;
  total: number;
  estado: 'Pendiente' | 'Recibido' | 'Anulado';
  observaciones?: string | null;
  detalles_count?: number;
  proveedor?: Proveedor;
  detalles?: DetalleOrdenCompra[];
}

export interface EstadisticasCompras {
  total: number;
  pendientes: number;
  recibidas: number;
  anuladas: number;
  total_mes: number;
  ordenes_mes: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const ordenCompraService = {

  getAll: (params?: { estado?: string; id_proveedor?: number; fecha_desde?: string; fecha_hasta?: string; search?: string }) =>
    apiClient.get<ApiResponse<OrdenCompra[]>>('/ordenes-compra', params as any),

  getById: (id: number) =>
    apiClient.get<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}`),

  create: (data: Record<string, any>) =>
    apiClient.post<ApiResponse<OrdenCompra>>('/ordenes-compra', data),

  update: (id: number, data: Record<string, any>) =>
    apiClient.post<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}`, { ...data, _method: 'PUT' }),

  recibir: (id: number, fechaRecepcion?: string) =>
    apiClient.post<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}/recibir`, {
      _method: 'PATCH',
      fecha_recepcion: fechaRecepcion,
    }),

  anular: (id: number) =>
    apiClient.post<ApiResponse<null>>(`/ordenes-compra/${id}/anular`, { _method: 'PATCH' }),

  getEstadisticas: () =>
    apiClient.get<ApiResponse<EstadisticasCompras>>('/ordenes-compra/estadisticas/resumen'),
};
