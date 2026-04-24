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
  
  // Agrupación
  es_grupo?: boolean;
  grupo_id?: number;
  ids_programacion?: number[];
  servicios?: string[];
}

export interface InsumoProgamacion {
  id: number;
  id_programacion: number;
  id_producto: number;
  id_lote?: number | null;
  cantidad_asignada: number;
  cantidad_utilizada?: number;
  estado: 'Asignado' | 'Entregado' | 'Utilizado' | 'Devuelto';
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

export interface RegistrarDevolucionPayload {
  ids_programacion: number[];
  insumos: {
    id_producto: number;
    cantidad_devuelta: number;
  }[];
  observacion?: string;
}

export interface ConfirmarSalidaPayload {
  ids_programacion: number[];
  insumos: {
    id_producto: number;
    id_lote: number;
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
    return apiClient.get<{ success: boolean; data: ProgramacionPendiente[] }>('/almacen/salidas-programacion/pendientes', params);
  },

  // Ver detalle de una programación con sus insumos
  getDetalle: async (id: number, esGrupo: boolean = false) => {
    return apiClient.get<{ success: boolean; data: ProgramacionPendiente }>(`/almacen/salidas-programacion/${id}`, { es_grupo: esGrupo ? '1' : '0' });
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
    return apiClient.get<{ success: boolean; data: ProgramacionPendiente[] }>('/almacen/salidas-programacion/historial', params);
  },

  // Ver detalle para devolución de materiales entregados
  getDetalleDevolucion: async (id: number, esGrupo: boolean = false) => {
    return apiClient.get<{ success: boolean; data: ProgramacionPendiente }>(`/almacen/salidas-programacion/${id}/devolucion`, { es_grupo: esGrupo ? '1' : '0' });
  },

  // Registrar devolución al almacén
  registrarDevolucion: async (data: RegistrarDevolucionPayload) => {
    return apiClient.post<{ success: boolean; message: string }>('/almacen/salidas-programacion/devolver', data);
  },

  // Descargar acta PDF de entrega de materiales
  downloadActaEntrega: async (idProgramacion: number, esGrupo: boolean = false) => {
    const filename = `Acta_Entrega_${esGrupo ? 'Grupo' : 'Programacion'}_${idProgramacion}.pdf`;
    return apiClient.downloadFile(`/almacen/salidas-programacion/${idProgramacion}/pdf-entrega?es_grupo=${esGrupo ? '1' : '0'}`, filename);
  },
};
