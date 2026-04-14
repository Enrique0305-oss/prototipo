import { apiClient } from '../core/api/api.client';

export interface EntregaEpp {
  id: number;
  numero_entrega: string;
  id_tecnico: number;
  fecha_entrega: string;
  fecha_devolucion: string | null;
  estado: 'Entregado' | 'Devuelto';
  registrado_por: number;
  devuelto_por: number | null;
  observaciones: string | null;
  motivo_entrega: string | null;
  motivo_devolucion: string | null;
  tecnico?: { id: number; nombre: string; apellidos: string; dni: string; especialidad: string };
  registrador?: { id: number; nombre: string; apellidos: string };
  devolvedor?: { id: number; nombre: string; apellidos: string } | null;
  detalles?: DetalleEntregaEpp[];
  created_at?: string;
  updated_at?: string;
}

export interface DetalleEntregaEpp {
  id: number;
  id_entrega_epp: number;
  id_producto: number;
  cantidad: number;
  observacion: string | null;
  condicion_devolucion?: string | null;
  observacion_devolucion?: string | null;
  estado_item?: 'Activo' | 'Devuelto' | 'Reemplazado';
  id_entrega_reemplazo?: number | null;
  producto?: { id: number; descripcion: string; stock_actual: number };
}

export interface ProductoEpp {
  id: number;
  descripcion: string;
  stock_disponible: number;
  unidad_medida: string;
}

export interface EstadoTecnicoEpp {
  tecnico: { id: number; nombre: string; apellidos: string; dni: string };
  items: Array<{
    id_detalle: number;
    producto: { id: number; descripcion: string };
    cantidad: number;
    numero_entrega: string;
    id_entrega: number;
    fecha_entrega: string;
    motivo_entrega: string | null;
  }>;
}

export interface EntregaEppEstadisticas {
  total_entregas: number;
  entregas_activas: number;
  devoluciones_mes: number;
  tecnicos_con_epp: number;
}

export interface EntregaEppFiltros {
  buscar?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export const entregaEppService = {
  getAll: async (filtros?: EntregaEppFiltros) => {
    return apiClient.get<{ success: boolean; data: EntregaEpp[] }>('/entrega-epp', filtros as any);
  },

  getById: async (id: number) => {
    return apiClient.get<{ success: boolean; data: EntregaEpp }>(`/entrega-epp/${id}`);
  },

  create: async (data: {
    id_tecnico: number;
    fecha_entrega: string;
    motivo_entrega?: string;
    observaciones?: string;
    detalles: { id_producto: number; cantidad: number; observacion?: string }[];
  }) => {
    return apiClient.post<{ success: boolean; message: string; data: EntregaEpp }>('/entrega-epp', data);
  },

  devolver: async (id: number, data: {
    motivo_devolucion?: string;
    detalles?: { id: number; condicion_devolucion: string; observacion_devolucion?: string }[];
  }) => {
    return apiClient.patch<{ success: boolean; message: string; data: EntregaEpp }>(`/entrega-epp/${id}/devolver`, data);
  },

  getProductosEpp: async () => {
    return apiClient.get<{ success: boolean; data: ProductoEpp[] }>('/entrega-epp/productos-epp');
  },

  getEstadisticas: async () => {
    return apiClient.get<{ success: boolean; data: EntregaEppEstadisticas }>('/entrega-epp/estadisticas/resumen');
  },

  getEstadoTecnicos: async () => {
    return apiClient.get<{ success: boolean; data: EstadoTecnicoEpp[] }>('/entrega-epp/estado-tecnicos');
  },

  getPdfUrl: (id: number) => {
    return `http://127.0.0.1:8000/api/v1/entrega-epp/${id}/pdf`;
  },
};
