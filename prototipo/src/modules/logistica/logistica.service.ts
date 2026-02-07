// Servicio para el módulo de Logística
import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type {
  Cliente,
  Ruta,
  PuntoRuta,
  Vehiculo,
  Conductor,
  SeguimientoRuta,
  FiltroClientes,
  FiltroRutas,
  FiltroVehiculos,
  EstadisticasLogistica,
  EstadisticasRuta
} from './logistica.types';

class LogisticaService {
  // === CLIENTES ===
  
  async getClientes(filtros?: FiltroClientes): Promise<Cliente[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockClientes();
  }

  async getCliente(id: number): Promise<Cliente> {
    return apiClient.get<Cliente>(`${API_ENDPOINTS.logistica.clientes}/${id}`);
  }

  async crearCliente(data: Partial<Cliente>): Promise<Cliente> {
    return apiClient.post<Cliente>(API_ENDPOINTS.logistica.clientes, data);
  }

  async actualizarCliente(id: number, data: Partial<Cliente>): Promise<Cliente> {
    return apiClient.patch<Cliente>(`${API_ENDPOINTS.logistica.clientes}/${id}`, data);
  }

  // rutas
  
  async getRutas(filtros?: FiltroRutas): Promise<Ruta[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockRutas();
  }

  async getRuta(id: number): Promise<Ruta> {
    return apiClient.get<Ruta>(`${API_ENDPOINTS.logistica.rutas}/${id}`);
  }

  async crearRuta(data: Partial<Ruta>): Promise<Ruta> {
    return apiClient.post<Ruta>(API_ENDPOINTS.logistica.rutas, data);
  }

  async actualizarRuta(id: number, data: Partial<Ruta>): Promise<Ruta> {
    return apiClient.patch<Ruta>(`${API_ENDPOINTS.logistica.rutas}/${id}`, data);
  }

  async getPuntosRuta(idRuta: number): Promise<PuntoRuta[]> {
    return apiClient.get<PuntoRuta[]>(`${API_ENDPOINTS.logistica.rutas}/${idRuta}/puntos`);
  }

  async optimizarRuta(idRuta: number): Promise<PuntoRuta[]> {
    return apiClient.post<PuntoRuta[]>(`${API_ENDPOINTS.logistica.rutas}/${idRuta}/optimizar`, {});
  }

  async getEstadisticasRuta(idRuta: number): Promise<EstadisticasRuta> {
    return {
      tiempo_total: 240,
      distancia_total: 45.5,
      puntos_completados: 8,
      puntos_totales: 12,
      eficiencia: 85.5
    };
  }

  // vehículos
  
  async getVehiculos(filtros?: FiltroVehiculos): Promise<Vehiculo[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockVehiculos();
  }

  async getVehiculo(id: number): Promise<Vehiculo> {
    return apiClient.get<Vehiculo>(`${API_ENDPOINTS.logistica.vehiculos}/${id}`);
  }

  async crearVehiculo(data: Partial<Vehiculo>): Promise<Vehiculo> {
    return apiClient.post<Vehiculo>(API_ENDPOINTS.logistica.vehiculos, data);
  }

  async actualizarVehiculo(id: number, data: Partial<Vehiculo>): Promise<Vehiculo> {
    return apiClient.patch<Vehiculo>(`${API_ENDPOINTS.logistica.vehiculos}/${id}`, data);
  }

  // conductores
  
  async getConductores(): Promise<Conductor[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockConductores();
  }

  async getConductor(id: number): Promise<Conductor> {
    return apiClient.get<Conductor>(`${API_ENDPOINTS.logistica.conductores}/${id}`);
  }

  async crearConductor(data: Partial<Conductor>): Promise<Conductor> {
    return apiClient.post<Conductor>(API_ENDPOINTS.logistica.conductores, data);
  }

  async actualizarConductor(id: number, data: Partial<Conductor>): Promise<Conductor> {
    return apiClient.patch<Conductor>(`${API_ENDPOINTS.logistica.conductores}/${id}`, data);
  }

  // seguimiento
  
  async getSeguimientoRuta(idRuta: number): Promise<SeguimientoRuta[]> {
    return apiClient.get<SeguimientoRuta[]>(`${API_ENDPOINTS.logistica.rutas}/${idRuta}/seguimiento`);
  }

  async registrarPosicion(idRuta: number, data: Partial<SeguimientoRuta>): Promise<SeguimientoRuta> {
    return apiClient.post<SeguimientoRuta>(`${API_ENDPOINTS.logistica.rutas}/${idRuta}/seguimiento`, data);
  }

  // estadísticas
  
  async getEstadisticas(): Promise<EstadisticasLogistica> {
    return {
      total_clientes: 156,
      clientes_activos: 142,
      rutas_del_dia: 8,
      vehiculos_disponibles: 12,
      km_totales_mes: 2450
    };
  }
}

// Mock Data
function getMockClientes(): Cliente[] {
  return [
    {
      id: 1,
      razon_social: 'Logística Transandina',
      ruc: '20456789012',
      tipo: 'Industrial',
      direccion: 'Av. Industrial 245',
      distrito: 'Callao',
      telefono: '(01) 420-8500',
      contacto_nombre: 'Carlos Mendoza',
      contacto_cargo: 'Gerente',
      estado: 'Activo',
      frecuencia_servicio: 'Mensual',
      fecha_registro: '2023-06-15',
      total_servicios: 12,
      facturacion_total: 33600
    }
  ];
}

function getMockRutas(): Ruta[] {
  return [
    {
      id: 1,
      codigo: 'RUTA-001',
      nombre: 'Ruta Norte - Lunes',
      descripcion: 'Clientes zona norte de Lima',
      id_vehiculo: 1,
      vehiculo_placa: 'ABC-123',
      id_conductor: 1,
      conductor_nombre: 'Juan Pérez',
      fecha_programada: '2025-02-10',
      hora_inicio: '08:00',
      hora_fin_estimada: '17:00',
      estado: 'Activa',
      total_clientes: 12,
      clientes_completados: 5,
      kilometros_estimados: 45.5
    }
  ];
}

function getMockVehiculos(): Vehiculo[] {
  return [
    {
      id: 1,
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Hilux',
      anio: 2022,
      tipo: 'Camioneta',
      capacidad_carga: 1000,
      estado: 'Disponible',
      kilometraje: 45000,
      fecha_proximo_mantenimiento: '2025-03-15',
      fecha_soat: '2025-08-20',
      fecha_revision_tecnica: '2025-06-10'
    }
  ];
}

function getMockConductores(): Conductor[] {
  return [
    {
      id: 1,
      dni: '45678901',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez López',
      licencia_categoria: 'A-IIa',
      licencia_vencimiento: '2026-12-31',
      telefono: '987654321',
      email: 'juan.perez@empresa.com',
      estado: 'Activo',
      fecha_ingreso: '2023-01-15'
    }
  ];
}

export const logisticaService = new LogisticaService();
