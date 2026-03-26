import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Cotizacion,
  CotizacionFilters,
  PaginationParams,
  EstadisticasCotizaciones,
} from '../core/api/types';

type CotizacionPayload = {
  id_cliente: number;
  id_multicim: number;
  tipo_cotizacion: string;
  fecha_emision?: string;
  incluye_igv?: boolean;
  observaciones?: string;
  propuesta_tecnica?: string;
  receta_servicio?: any[] | null;
  exponentes_ids?: number[] | null;
  beneficios_servicio?: Array<{
    id_catalogo_cap_aud?: number | null;
    nombre_beneficio: string;
    modalidad_sugerida?: string | null;
    horas_capacitacion?: number | null;
    precio_referencial?: number | null;
    observacion?: string | null;
  }> | null;
  detalles: Array<{
    id_servicio?: number | null;
    id_producto?: number | null;
    id_catalogo_cap_aud?: number | null;
    descripcion_manual?: string | null;
    cantidad: number;
    precio_unitario: number;
    frecuencia_sugerida?: string | null;
    modalidad_sugerida?: string | null;
    op_tecnicos?: string | null;
    supervisor?: string | null;
    medida_tanque?: string | null;
    fosfina_producto?: string | null;
    fosfina_cantidad?: string | null;
    id_cliente_planta?: number | null;
    id_cliente_planta_area?: number | null;
    horas_capacitacion?: number | null;
    num_participantes?: number | null;
    fecha_servicio?: string | null;
  }>;
};

export const cotizacionService = {

  getAll: async (filters?: CotizacionFilters & PaginationParams) => {
    return apiClient.get<ApiResponse<Cotizacion[]>>('/cotizaciones', filters);
  },

  getEstadisticas: async () => {
    return apiClient.get<ApiResponse<EstadisticasCotizaciones>>('/cotizaciones/estadisticas/resumen');
  },

  create: async (data: CotizacionPayload) => {
    return apiClient.post<ApiResponse<Cotizacion>>('/cotizaciones', data);
  },

  update: async (id: number, data: CotizacionPayload) => {
    return apiClient.put<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`, data);
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`);
  },

  cambiarEstado: async (id: number, estado: 'Pendiente' | 'Aceptada' | 'Rechazada') => {
    return apiClient.patch<ApiResponse<Cotizacion>>(`/cotizaciones/${id}/estado`, { estado });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/cotizaciones/${id}`);
  },

  downloadPDF: async (id: number, filename?: string) => {
    const defaultFilename = filename || `cotizacion_${id}.pdf`;
    return apiClient.downloadFile(`/cotizaciones/${id}/pdf`, defaultFilename);
  },

  updateReceta: async (id: number, receta_servicio: any[]) => {
    return apiClient.patch<ApiResponse<Cotizacion>>(`/cotizaciones/${id}/receta`, { receta_servicio });
  },
};
