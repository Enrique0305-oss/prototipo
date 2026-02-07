// Servicio para el módulo de Facturación y Cobranza
import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type {
  Factura,
  DetalleFactura,
  Cobranza,
  RegistroPago,
  GestionCobranza,
  ProyeccionCobranza,
  OrdenProyectada,
  NotaCredito,
  FiltroFacturas,
  FiltroCobranza,
  EstadisticasFacturacion,
  EstadisticasCobranza,
  ResumenCliente
} from './facturacion.types';

class FacturacionService {
  // === FACTURAS ===
  
  async getFacturas(filtros?: FiltroFacturas): Promise<Factura[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockFacturas();
  }

  async getFactura(id: number): Promise<Factura> {
    return apiClient.get<Factura>(`${API_ENDPOINTS.facturacion}/${id}`);
  }

  async crearFactura(data: Partial<Factura>): Promise<Factura> {
    return apiClient.post<Factura>(API_ENDPOINTS.facturacion, data);
  }

  async actualizarFactura(id: number, data: Partial<Factura>): Promise<Factura> {
    return apiClient.patch<Factura>(`${API_ENDPOINTS.facturacion}/${id}`, data);
  }

  async anularFactura(id: number, motivo: string): Promise<Factura> {
    return apiClient.patch<Factura>(`${API_ENDPOINTS.facturacion}/${id}/anular`, { motivo });
  }

  async getDetalleFactura(idFactura: number): Promise<DetalleFactura[]> {
    return apiClient.get<DetalleFactura[]>(`${API_ENDPOINTS.facturacion}/${idFactura}/detalle`);
  }

  async enviarSunat(id: number): Promise<Factura> {
    return apiClient.post<Factura>(`${API_ENDPOINTS.facturacion}/${id}/sunat`, {});
  }

  async descargarPDF(id: number): Promise<void> {
    return apiClient.downloadFile(`${API_ENDPOINTS.facturacion}/${id}/pdf`, `factura_${id}.pdf`);
  }

  async descargarXML(id: number): Promise<void> {
    return apiClient.downloadFile(`${API_ENDPOINTS.facturacion}/${id}/xml`, `factura_${id}.xml`);
  }

  // === COBRANZA ===
  
  async getCobranzas(filtros?: FiltroCobranza): Promise<Cobranza[]> {
    return getMockCobranzas();
  }

  async getCobranza(id: number): Promise<Cobranza> {
    return apiClient.get<Cobranza>(`${API_ENDPOINTS.cobranza}/${id}`);
  }

  async registrarPago(data: Partial<RegistroPago>): Promise<RegistroPago> {
    return apiClient.post<RegistroPago>(API_ENDPOINTS.cobranza + '/pagos', data);
  }

  async getHistorialPagos(idFactura: number): Promise<RegistroPago[]> {
    return apiClient.get<RegistroPago[]>(`${API_ENDPOINTS.facturacion}/${idFactura}/pagos`);
  }

  async registrarGestion(data: Partial<GestionCobranza>): Promise<GestionCobranza> {
    return apiClient.post<GestionCobranza>(API_ENDPOINTS.cobranza + '/gestiones', data);
  }

  async getHistorialGestiones(idCobranza: number): Promise<GestionCobranza[]> {
    return apiClient.get<GestionCobranza[]>(`${API_ENDPOINTS.cobranza}/${idCobranza}/gestiones`);
  }

  // === PROYECCIONES ===
  
  async getOrdenesProyectadas(): Promise<OrdenProyectada[]> {
    return getMockOrdenesProyectadas();
  }

  async getProyeccionCobranza(fechaInicio: string, fechaFin: string): Promise<ProyeccionCobranza[]> {
    return apiClient.get<ProyeccionCobranza[]>(API_ENDPOINTS.cobranza + '/proyeccion', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  // === NOTAS DE CRÉDITO/DÉBITO ===
  
  async crearNotaCredito(data: Partial<NotaCredito>): Promise<NotaCredito> {
    return apiClient.post<NotaCredito>(API_ENDPOINTS.facturacion + '/notas-credito', data);
  }

  async getNotasCredito(idFactura?: number): Promise<NotaCredito[]> {
    return apiClient.get<NotaCredito[]>(API_ENDPOINTS.facturacion + '/notas-credito', { id_factura: idFactura });
  }

  // === ESTADÍSTICAS ===
  
  async getEstadisticasFacturacion(): Promise<EstadisticasFacturacion> {
    return {
      total_emitidas_mes: 45,
      monto_facturado_mes: 125000,
      facturas_pendientes: 18,
      monto_pendiente: 32450,
      facturas_cobradas: 27,
      monto_cobrado: 92550,
      tasa_cobranza: 74.1
    };
  }

  async getEstadisticasCobranza(): Promise<EstadisticasCobranza> {
    return {
      total_por_cobrar: 32450,
      vencidas: 5,
      monto_vencido: 8500,
      proximas_vencer: 8,
      monto_proximo_vencer: 12800,
      promedio_dias_cobranza: 22,
      efectividad_cobranza: 78.5
    };
  }

  async getResumenClientes(): Promise<ResumenCliente[]> {
    return apiClient.get<ResumenCliente[]>(API_ENDPOINTS.cobranza + '/resumen-clientes');
  }

  // === EXPORTACIÓN ===
  
  async exportarFacturas(fechaInicio: string, fechaFin: string, formato: 'Excel' | 'PDF'): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.facturacion}/exportar?inicio=${fechaInicio}&fin=${fechaFin}&formato=${formato}`,
      `Facturas_${fechaInicio}_${fechaFin}.${formato === 'Excel' ? 'xlsx' : 'pdf'}`
    );
  }

  async exportarCobranza(fechaInicio: string, fechaFin: string, formato: 'Excel' | 'PDF'): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.cobranza}/exportar?inicio=${fechaInicio}&fin=${fechaFin}&formato=${formato}`,
      `Cobranza_${fechaInicio}_${fechaFin}.${formato === 'Excel' ? 'xlsx' : 'pdf'}`
    );
  }
}

// Mock Data
function getMockFacturas(): Factura[] {
  return [
    {
      id: 245,
      serie: 'F001',
      correlativo: '00245',
      numero_completo: 'F001-00245',
      tipo_comprobante: 'Factura',
      id_cliente: 1,
      cliente_ruc: '20456789012',
      cliente_razon_social: 'Logística Transandina',
      cliente_direccion: 'Av. Industrial 245, Callao',
      fecha_emision: '2025-01-10',
      fecha_vencimiento: '2025-01-25',
      moneda: 'PEN',
      forma_pago: 'Crédito 15 días',
      id_orden: 89,
      orden_numero: 'OS-2025-089',
      subtotal: 2372.88,
      igv: 427.12,
      total: 2800.00,
      estado: 'Emitida',
      estado_cobranza: 'Pendiente',
      id_usuario_emisor: 1,
      usuario_emisor_nombre: 'Admin Sistema'
    }
  ];
}

function getMockCobranzas(): Cobranza[] {
  return [
    {
      id: 1,
      id_factura: 245,
      factura_numero: 'F001-00245',
      id_cliente: 1,
      cliente_nombre: 'Logística Transandina',
      monto_total: 2800.00,
      monto_cobrado: 0,
      monto_pendiente: 2800.00,
      fecha_emision: '2025-01-10',
      fecha_vencimiento: '2025-01-25',
      forma_pago: 'Crédito 15 días',
      dias_vencidos: 0,
      estado: 'Pendiente',
      id_responsable: 2,
      responsable_nombre: 'Carlos Ventas'
    }
  ];
}

function getMockOrdenesProyectadas(): OrdenProyectada[] {
  return [
    {
      id_orden: 95,
      orden_numero: 'OS-2025-095',
      cliente_nombre: 'Almacenes del Norte',
      tipo: 'Servicio',
      monto: 1800.00,
      fecha_estimada_facturacion: '2025-02-15',
      estado: 'Pendiente'
    }
  ];
}

export const facturacionService = new FacturacionService();
