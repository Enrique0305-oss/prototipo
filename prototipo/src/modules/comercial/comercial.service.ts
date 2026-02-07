// Servicio para el módulo Comercial
import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type {
  Cotizacion,
  Orden,
  OrdenServicio,
  OrdenProducto,
  OrdenCapacitacion,
  Prospecto,
  Conversion,
  FiltroCotizaciones,
  FiltroOrdenes,
  FiltroProspectos,
  EstadisticasCotizaciones,
  EstadisticasOrdenes,
  EstadisticasProspectos,
  SeguimientoProspecto
} from './comercial.types';

class ComercialService {
  // === COTIZACIONES ===
  
  async getCotizaciones(filtros?: FiltroCotizaciones): Promise<Cotizacion[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockCotizaciones();
  }

  async getCotizacion(id: number): Promise<Cotizacion> {
    return apiClient.get<Cotizacion>(`${API_ENDPOINTS.cotizaciones}/${id}`);
  }

  async crearCotizacion(data: Partial<Cotizacion>): Promise<Cotizacion> {
    return apiClient.post<Cotizacion>(API_ENDPOINTS.cotizaciones, data);
  }

  async actualizarCotizacion(id: number, data: Partial<Cotizacion>): Promise<Cotizacion> {
    return apiClient.patch<Cotizacion>(`${API_ENDPOINTS.cotizaciones}/${id}`, data);
  }

  async getEstadisticasCotizaciones(): Promise<EstadisticasCotizaciones> {
    return {
      total: 45,
      pendientes: 12,
      aceptadas: 28,
      rechazadas: 5,
      valor_total: 125000
    };
  }

  // === ÓRDENES ===
  
  async getOrdenes(filtros?: FiltroOrdenes): Promise<Orden[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockOrdenes();
  }

  async getOrden(id: number): Promise<Orden> {
    return apiClient.get<Orden>(`${API_ENDPOINTS.ordenes}/${id}`);
  }

  async crearOrden(data: Partial<Orden>): Promise<Orden> {
    return apiClient.post<Orden>(API_ENDPOINTS.ordenes, data);
  }

  async actualizarOrden(id: number, data: Partial<Orden>): Promise<Orden> {
    return apiClient.patch<Orden>(`${API_ENDPOINTS.ordenes}/${id}`, data);
  }

  // === ÓRDENES ESPECÍFICAS ===
  
  async getOrdenesServicio(filtros?: FiltroOrdenes): Promise<OrdenServicio[]> {
    return apiClient.get<OrdenServicio[]>(`${API_ENDPOINTS.ordenes}/servicio`, filtros);
  }

  async getOrdenesProducto(filtros?: FiltroOrdenes): Promise<OrdenProducto[]> {
    return apiClient.get<OrdenProducto[]>(`${API_ENDPOINTS.ordenes}/producto`, filtros);
  }

  async getOrdenesCapacitacion(filtros?: FiltroOrdenes): Promise<OrdenCapacitacion[]> {
    return apiClient.get<OrdenCapacitacion[]>(`${API_ENDPOINTS.ordenes}/capacitacion`, filtros);
  }

  async getEstadisticasOrdenes(): Promise<EstadisticasOrdenes> {
    return {
      total: 156,
      pendientes: 23,
      en_proceso: 45,
      completadas: 88,
      valor_total: 285000
    };
  }

  // === PROSPECTOS ===
  
  async getProspectos(filtros?: FiltroProspectos): Promise<Prospecto[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockProspectos();
  }

  async getProspecto(id: number): Promise<Prospecto> {
    return apiClient.get<Prospecto>(`${API_ENDPOINTS.prospectos}/${id}`);
  }

  async crearProspecto(data: Partial<Prospecto>): Promise<Prospecto> {
    return apiClient.post<Prospecto>(API_ENDPOINTS.prospectos, data);
  }

  async actualizarProspecto(id: number, data: Partial<Prospecto>): Promise<Prospecto> {
    return apiClient.patch<Prospecto>(`${API_ENDPOINTS.prospectos}/${id}`, data);
  }

  async registrarSeguimiento(idProspecto: number, data: Partial<SeguimientoProspecto>): Promise<SeguimientoProspecto> {
    return apiClient.post<SeguimientoProspecto>(`${API_ENDPOINTS.prospectos}/${idProspecto}/seguimiento`, data);
  }

  async getHistorialSeguimiento(idProspecto: number): Promise<SeguimientoProspecto[]> {
    return apiClient.get<SeguimientoProspecto[]>(`${API_ENDPOINTS.prospectos}/${idProspecto}/seguimiento`);
  }

  async getEstadisticasProspectos(): Promise<EstadisticasProspectos> {
    return {
      total: 89,
      nuevos: 15,
      contactados: 32,
      calificados: 28,
      tasa_conversion: 35.5
    };
  }

  // === CONVERSIONES ===
  
  async getConversiones(): Promise<Conversion[]> {
    return getMockConversiones();
  }

  async registrarConversion(data: Partial<Conversion>): Promise<Conversion> {
    return apiClient.post<Conversion>(API_ENDPOINTS.conversiones, data);
  }
}

// Mock Data
function getMockCotizaciones(): Cotizacion[] {
  return [
    {
      id: 1,
      numero: 'COT-2024-001',
      id_cliente: 1,
      cliente_nombre: 'Empresa ABC S.A.C.',
      fecha_emision: '2024-01-15',
      tipo: 'Servicio',
      subtotal: 3813.56,
      igv: 686.44,
      total: 4500.00,
      estado: 'Pendiente'
    }
  ];
}

function getMockOrdenes(): Orden[] {
  return [
    {
      id: 1,
      numero: 'OS-2025-001',
      tipo: 'Servicio',
      id_cliente: 1,
      cliente_nombre: 'Empresa ABC S.A.C.',
      fecha_emision: '2025-01-10',
      fecha_servicio: '2025-01-15',
      subtotal: 2372.88,
      igv: 427.12,
      total: 2800.00,
      estado: 'En Proceso',
      id_tecnico_asignado: 1,
      tecnico_nombre: 'Juan Pérez'
    }
  ];
}

function getMockProspectos(): Prospecto[] {
  return [
    {
      id: 1,
      nombre: 'María González',
      empresa: 'Restaurante El Buen Sabor',
      cargo: 'Gerente',
      telefono: '987654321',
      email: 'maria@buensabor.com',
      sector: 'Alimenticio',
      origen: 'Web',
      estado: 'Calificado',
      prioridad: 'Alta',
      fecha_creacion: '2025-01-05',
      fecha_ultimo_contacto: '2025-01-12'
    }
  ];
}

function getMockConversiones(): Conversion[] {
  return [
    {
      id: 1,
      id_prospecto: 1,
      prospecto_nombre: 'María González',
      fecha_conversion: '2025-01-15',
      id_cotizacion: 1,
      cotizacion_numero: 'COT-2024-001',
      valor_conversion: 4500.00,
      estado: 'Convertido',
      dias_conversion: 10
    }
  ];
}

export const comercialService = new ComercialService();
