import { apiClient } from '../../../core/api/api.client';

export interface ProgramacionPendiente {
  id: number;
  fecha_programada: string;
  hora_inicio: string;
  hora_fin?: string;
  estado_ejecucion: string;
  local_sede?: string;
  direccion_completa?: string;
  orden_servicio?: {
    numero_orden: string;
    cliente?: {
      nombre_empresa?: string;
      persona_contacto?: string;
    };
  };
  servicio?: {
    nombre: string;
  };
  tecnico?: {
    nombre: string;
    apellidos: string;
  };
  insumos?: InsumoProgamacion[];
}

export interface InsumoProgamacion {
  id: number;
  id_programacion: number;
  id_producto: number;
  cantidad_asignada: number;
  cantidad_utilizada?: number;
  estado: 'Asignado' | 'Entregado' | 'Utilizado';
  producto?: {
    id: number;
    descripcion: string;
    unidad_medida?: string;
    inventario?: {
      cantidad_disponible: number;
    };
  };
}

export interface ConfirmarSalidaPayload {
  id_programacion: number;
  insumos: {
    id_producto: number;
    cantidad_entregada: number;
  }[];
  observacion?: string;
}

export const salidasProgramacionService = {
  // Listar programaciones pendientes de entrega de materiales
  getPendientes: async (params?: { 
    fecha_desde?: string; 
    fecha_hasta?: string;
    estado?: string;
  }) => {
    return apiClient.get<{ success: boolean; data: ProgramacionPendiente[] }>('/almacen/salidas-programacion/pendientes', { params });
  },

  // Ver detalle de una programación con sus insumos
  getDetalle: async (id: number) => {
    return apiClient.get<{ success: boolean; data: ProgramacionPendiente }>(`/almacen/salidas-programacion/${id}`);
  },

  // Confirmar salida de materiales para una programación
  confirmarSalida: async (data: ConfirmarSalidaPayload) => {
    return apiClient.post<{ success: boolean; message: string }>('/almacen/salidas-programacion/confirmar', data);
  },

  // Listar historial de salidas confirmadas
  getHistorial: async (params?: {
    fecha_desde?: string;
    fecha_hasta?: string;
  }) => {
    return apiClient.get<{ success: boolean; data: ProgramacionPendiente[] }>('/almacen/salidas-programacion/historial', { params });
  },
};
