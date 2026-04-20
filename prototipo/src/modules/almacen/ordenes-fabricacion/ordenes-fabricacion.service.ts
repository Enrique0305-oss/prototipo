import { apiClient } from '../../../core/api/api.client';

export interface OrdenFabricacionDetalle {
  id?: number;
  id_producto_final: number;
  cantidad: number;
  producto?: {
    id: number;
    descripcion: string;
    unidad?: string;
  };
  receta_snapshot?: any[];
  insumos_requeridos?: Array<{
    id_producto_insumo: number;
    descripcion: string;
    cantidad_requerida: number;
    unidad?: string | null;
  }>;
}

export interface OrdenFabricacion {
  id: number;
  codigo: string;
  fecha_orden: string;
  motivo?: string | null;
  estado: 'Borrador' | 'Confirmada' | 'Programada' | 'Fabricada' | 'Anulada';
  observaciones?: string | null;
  resumen_insumos?: Array<{
    id_producto_insumo: number;
    descripcion: string;
    cantidad_requerida: number;
    unidad?: string | null;
  }>;
  detalles: OrdenFabricacionDetalle[];
  programaciones_count?: number;
}

export interface ProgramacionFabricacionSalida {
  id: number;
  id_orden_fabricacion?: number;
  codigo_orden?: string;
  motivo_orden?: string | null;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin?: string | null;
  estado_ejecucion: string;
  tecnico?: {
    id: number;
    nombre?: string;
    apellido?: string;
  } | null;
  insumos: Array<{
    id_producto: number;
    descripcion: string;
    unidad?: string | null;
    cantidad_requerida: number;
    cantidad_sugerida_salida: number;
    stock_disponible: number;
  }>;
  salida_confirmada: boolean;
  fecha_salida?: string | null;
}

export interface ProgramacionFabricacionEntradaDevolucion {
  id: number;
  id_entrada_devolucion_fabricacion?: number;
  id_programacion_fabricacion?: number;
  id_orden_fabricacion?: number;
  codigo_orden?: string;
  motivo_orden?: string | null;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin?: string | null;
  estado_ejecucion: string;
  estado: 'Pendiente' | 'Realizado';
  fecha_realizado?: string | null;
  observaciones?: string | null;
  motivo_diferencia?: string | null;
  tiene_diferencia_materia_prima?: boolean;
  tecnico?: {
    id: number;
    nombre?: string;
    apellido?: string;
  } | null;
  salida_confirmada: boolean;
  productos_esperados: Array<{
    id_producto_final: number;
    descripcion: string;
    cantidad_esperada: number;
  }>;
  insumos_sugeridos: Array<{
    id_producto: number;
    descripcion: string;
    unidad?: string | null;
    cantidad_requerida: number;
  }>;
  detalles?: Array<{
    id: number;
    tipo: 'EntradaProducto' | 'DevolucionInsumo' | 'ConsumoDiferenciaInsumo';
    id_producto: number;
    id_lote?: number | null;
    cantidad: number;
    observacion?: string | null;
    producto?: {
      id: number;
      descripcion: string;
      unidad?: string | null;
    } | null;
    lote?: {
      id: number;
      numero_lote: string;
    } | null;
  }>;
  cantidad_esperada_total?: number;
  cantidad_producida_total?: number;
}

export const ordenesFabricacionService = {
  getAll: async (params?: { estado?: string; search?: string; fecha_desde?: string; fecha_hasta?: string }) => {
    return apiClient.get<{ success: boolean; data: OrdenFabricacion[] }>('/almacen/ordenes-fabricacion', params as any);
  },

  getById: async (id: number) => {
    return apiClient.get<{ success: boolean; data: OrdenFabricacion }>(`/almacen/ordenes-fabricacion/${id}`);
  },

  getSalidasProgramacion: async (idOrdenFabricacion: number) => {
    return apiClient.get<{ success: boolean; data: ProgramacionFabricacionSalida[] }>(
      `/almacen/ordenes-fabricacion/${idOrdenFabricacion}/salidas-programacion`
    );
  },

  getPendientesSalidaProgramacion: async (params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    return apiClient.get<{ success: boolean; data: ProgramacionFabricacionSalida[] }>(
      '/almacen/ordenes-fabricacion/salidas-programacion/pendientes',
      params as any
    );
  },

  confirmarSalidaProgramacion: async (payload: {
    id_programacion: number;
    insumos?: Array<{
      id_producto: number;
      id_lote: number;
      cantidad_entregada: number;
    }>;
    observacion?: string;
  }) => {
    return apiClient.post<{ success: boolean; message: string }>('/almacen/ordenes-fabricacion/salidas-programacion/confirmar', payload);
  },

  getPendientesEntradaDevolucion: async (params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    return apiClient.get<{ success: boolean; data: ProgramacionFabricacionEntradaDevolucion[] }>(
      '/almacen/ordenes-fabricacion/entrada-devolucion/pendientes',
      params as any
    );
  },

  registrarEntradaDevolucion: async (payload: {
    id_entrada_devolucion_fabricacion: number;
    productos: Array<{
      id_producto_final: number;
      cantidad_producida: number;
    }>;
    motivo_diferencia?: string;
    tiene_sobrante_materia_prima?: boolean;
    tiene_diferencia_materia_prima?: boolean;
    observaciones?: string;
    devoluciones?: Array<{
      id_producto: number;
      id_lote: number;
      cantidad_devuelta: number;
    }>;
    diferencias_materia_prima?: Array<{
      id_producto: number;
      id_lote: number;
      cantidad_adicional: number;
    }>;
  }) => {
    return apiClient.post<{ success: boolean; message: string; data: { id: number } }>('/almacen/ordenes-fabricacion/entrada-devolucion', payload);
  },

  create: async (payload: {
    fecha_orden: string;
    motivo?: string;
    observaciones?: string;
    estado?: 'Borrador' | 'Confirmada';
    detalles: Array<{
      id_producto_final: number;
      cantidad: number;
    }>;
  }) => {
    return apiClient.post<{ success: boolean; message: string; data: OrdenFabricacion }>('/almacen/ordenes-fabricacion', payload);
  },

  update: async (id: number, payload: {
    fecha_orden?: string;
    motivo?: string;
    observaciones?: string;
    estado?: 'Borrador' | 'Confirmada' | 'Programada' | 'Fabricada' | 'Anulada';
    detalles?: Array<{
      id_producto_final: number;
      cantidad: number;
    }>;
  }) => {
    return apiClient.post<{ success: boolean; message: string; data: OrdenFabricacion }>(`/almacen/ordenes-fabricacion/${id}`, {
      ...payload,
      _method: 'PUT',
    });
  },

  remove: async (id: number) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/almacen/ordenes-fabricacion/${id}`);
  },
};
