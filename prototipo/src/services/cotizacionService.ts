import { apiClient } from '../core/api/api.client';
import type {
  ApiResponse,
  Cotizacion,
  CotizacionFilters,
  PaginationParams,
  EstadisticasCotizaciones,
} from '../core/api/types';

function sanitizeFilenamePart(value: string): string {
  return (value || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumeroCorto(numeroCotizacion?: string): string {
  const raw = String(numeroCotizacion || '').trim();
  const m = raw.match(/^(?:COT-)?(\d{4})-(\d+)$/i);
  if (!m) return raw;
  const year2 = m[1].slice(-2);
  const correlativo = String(parseInt(m[2], 10) || 0).padStart(3, '0');
  return `${correlativo}-${year2}`;
}

function getServicioNombreParaArchivo(cotizacion: any): string {
  const detalles = Array.isArray(cotizacion?.detalles) ? cotizacion.detalles : [];
  const nombres = Array.from(new Set(
    detalles
      .map((d: any) => String(d?.servicio?.nombre || '').trim())
      .filter((n: string) => n.length > 0)
  )) as string[];

  if (nombres.length === 1) {
    return nombres[0];
  }

  return 'Control de Plagas';
}

function getCapacitacionNombreParaArchivo(cotizacion: any): string {
  const detalles = Array.isArray(cotizacion?.detalles) ? cotizacion.detalles : [];
  const nombres = Array.from(new Set(
    detalles
      .map((d: any) => String(d?.catalogo_cap_aud?.nombre || d?.descripcion_manual || '').trim())
      .filter((n: string) => n.length > 0)
  )) as string[];

  if (nombres.length === 1) {
    return nombres[0];
  }

  return 'Plan de Capacitaciones';
}
function getAsesoriaNombreParaArchivo(cotizacion: any): string {
  const detalles = Array.isArray(cotizacion?.detalles) ? cotizacion.detalles : [];
  const nombres = Array.from(new Set(
    detalles
      .map((d: any) => String(d?.catalogo_cap_aud?.nombre || d?.descripcion_manual || '').trim())
      .filter((n: string) => n.length > 0)
  )) as string[];

  if (nombres.length === 1) {
    return nombres[0];
  }

  return 'Plan de Asesorías';
}

function getAuditoriaNombreParaArchivo(cotizacion: any): string {
  const detalles = Array.isArray(cotizacion?.detalles) ? cotizacion.detalles : [];
  const nombres = Array.from(new Set(
    detalles
      .map((d: any) => String(d?.catalogo_cap_aud?.nombre || d?.descripcion_manual || '').trim())
      .filter((n: string) => n.length > 0)
  )) as string[];

  if (nombres.length === 1) {
    return nombres[0];
  }

  return 'Plan de Auditoria';
}

function getProductoNombreParaArchivo(cotizacion: any): string {
  const detalles = Array.isArray(cotizacion?.detalles) ? cotizacion.detalles : [];
  const nombres = Array.from(new Set(
    detalles
      .map((d: any) => String(d?.producto?.descripcion || d?.descripcion_manual || '').trim())
      .filter((n: string) => n.length > 0)
  )) as string[];

  if (nombres.length === 0) {
    return 'Productos';
  }
  if (nombres.length === 1) {
    return nombres[0];
  }
  if (nombres.length === 2) {
    return `${nombres[0]} y ${nombres[1]}`;
  }

  return 'PRODUCTOS';
}

function buildPdfFilename(cotizacion: any, tipo: string): string {
  const numero = toNumeroCorto(cotizacion?.numero_cotizacion || cotizacion?.numero || '');
  const cliente = String(cotizacion?.cliente?.nombre_empresa || cotizacion?.cliente_nombre || '').trim();
  
  let nombre = '';
  let tipoTexto = 'servicio';
  
  switch (tipo.toLowerCase()) {
    case 'capacitacion':
      nombre = getCapacitacionNombreParaArchivo(cotizacion);
      tipoTexto = 'capacitación';
      break;
    case 'asesoria':
      nombre = getAsesoriaNombreParaArchivo(cotizacion);
      tipoTexto = 'asesoría';
      break;
    case 'auditoria':
      nombre = getAuditoriaNombreParaArchivo(cotizacion);
      tipoTexto = 'auditoria';
      break;
    case 'producto':
      nombre = getProductoNombreParaArchivo(cotizacion);
      tipoTexto = 'producto';
      break;
    case 'servicio':
    default:
      nombre = getServicioNombreParaArchivo(cotizacion);
      tipoTexto = 'servicio';
      break;
  }

  const numeroSafe = sanitizeFilenamePart(numero || String(cotizacion?.id || ''));
  const nombreSafe = sanitizeFilenamePart(nombre || 'Propuesta');
  const clienteSafe = sanitizeFilenamePart(cliente || 'CLIENTE');

  return `Envío de propuesta de ${tipoTexto} N°${numeroSafe} - QSCI Consulting - ${nombreSafe}-${clienteSafe}.pdf`;
}

function buildServicioPdfFilename(cotizacion: any): string {
  return buildPdfFilename(cotizacion, 'servicio');
}

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
    medida_tanque?: string | string[] | null;
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
    let defaultFilename = filename || `cotizacion_${id}.pdf`;

    if (!filename) {
      try {
        const res = await apiClient.get<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`);
        const cotizacion = (res as any)?.data || res;
        const tipo = String(cotizacion?.tipo_cotizacion || cotizacion?.tipo || '').toLowerCase();
        defaultFilename = buildPdfFilename(cotizacion, tipo);
      } catch {
        // Si falla el fetch del detalle, se mantiene el nombre por defecto.
      }
    }

    return apiClient.downloadFile(`/cotizaciones/${id}/pdf`, defaultFilename);
  },

  updateReceta: async (id: number, receta_servicio: any[]) => {
    return apiClient.patch<ApiResponse<Cotizacion>>(`/cotizaciones/${id}/receta`, { receta_servicio });
  },
};
