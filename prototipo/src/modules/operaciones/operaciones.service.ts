// Servicio para el módulo de Operaciones
import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type {
  OperacionServicio,
  Tecnico,
  DisponibilidadTecnico,
  EquipoOperacion,
  InsumoOperacion,
  AsignacionInsumo,
  RegistroEjecucion,
  IncidenciaOperacion,
  InspeccionCalidad,
  MetricaTecnico,
  RendimientoOperaciones,
  FiltroOperaciones,
  FiltroTecnicos,
  EstadisticasOperaciones
} from './operaciones.types';

class OperacionesService {
  // === OPERACIONES DE SERVICIO ===
  
  async getOperaciones(filtros?: FiltroOperaciones): Promise<OperacionServicio[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockOperaciones();
  }

  async getOperacion(id: number): Promise<OperacionServicio> {
    return apiClient.get<OperacionServicio>(`${API_ENDPOINTS.operaciones}/${id}`);
  }

  async crearOperacion(data: Partial<OperacionServicio>): Promise<OperacionServicio> {
    return apiClient.post<OperacionServicio>(API_ENDPOINTS.operaciones, data);
  }

  async actualizarOperacion(id: number, data: Partial<OperacionServicio>): Promise<OperacionServicio> {
    return apiClient.patch<OperacionServicio>(`${API_ENDPOINTS.operaciones}/${id}`, data);
  }

  async asignarTecnico(idOperacion: number, idTecnico: number): Promise<OperacionServicio> {
    return apiClient.patch<OperacionServicio>(`${API_ENDPOINTS.operaciones}/${idOperacion}/asignar-tecnico`, { id_tecnico: idTecnico });
  }

  async iniciarOperacion(id: number): Promise<OperacionServicio> {
    return apiClient.patch<OperacionServicio>(`${API_ENDPOINTS.operaciones}/${id}/iniciar`, {});
  }

  async completarOperacion(id: number, data: Partial<RegistroEjecucion>): Promise<OperacionServicio> {
    return apiClient.patch<OperacionServicio>(`${API_ENDPOINTS.operaciones}/${id}/completar`, data);
  }

  // tecnicos
  
  async getTecnicos(filtros?: FiltroTecnicos): Promise<Tecnico[]> {
    return getMockTecnicos();
  }

  async getTecnico(id: number): Promise<Tecnico> {
    return apiClient.get<Tecnico>(`${API_ENDPOINTS.tecnicos}/${id}`);
  }

  async crearTecnico(data: Partial<Tecnico>): Promise<Tecnico> {
    return apiClient.post<Tecnico>(API_ENDPOINTS.tecnicos, data);
  }

  async actualizarTecnico(id: number, data: Partial<Tecnico>): Promise<Tecnico> {
    return apiClient.patch<Tecnico>(`${API_ENDPOINTS.tecnicos}/${id}`, data);
  }

  async getDisponibilidadTecnico(idTecnico: number, fecha: string): Promise<DisponibilidadTecnico[]> {
    return apiClient.get<DisponibilidadTecnico[]>(`${API_ENDPOINTS.tecnicos}/${idTecnico}/disponibilidad`, { fecha });
  }

  async getMetricasTecnico(idTecnico: number, periodo: string): Promise<MetricaTecnico> {
    return apiClient.get<MetricaTecnico>(`${API_ENDPOINTS.tecnicos}/${idTecnico}/metricas`, { periodo });
  }

  // equipos
  
  async getEquipos(): Promise<EquipoOperacion[]> {
    return getMockEquipos();
  }

  async getEquipo(id: number): Promise<EquipoOperacion> {
    return apiClient.get<EquipoOperacion>(`${API_ENDPOINTS.operaciones}/equipos/${id}`);
  }

  async asignarEquipo(idEquipo: number, idTecnico: number): Promise<EquipoOperacion> {
    return apiClient.patch<EquipoOperacion>(`${API_ENDPOINTS.operaciones}/equipos/${idEquipo}/asignar`, { id_tecnico: idTecnico });
  }

  // insumos
  
  async getInsumos(): Promise<InsumoOperacion[]> {
    return getMockInsumos();
  }

  async getInsumo(id: number): Promise<InsumoOperacion> {
    return apiClient.get<InsumoOperacion>(`${API_ENDPOINTS.operaciones}/insumos/${id}`);
  }

  async asignarInsumos(idOperacion: number, data: Partial<AsignacionInsumo>[]): Promise<AsignacionInsumo[]> {
    return apiClient.post<AsignacionInsumo[]>(`${API_ENDPOINTS.operaciones}/${idOperacion}/insumos`, data);
  }

  async getInsumosAsignados(idOperacion: number): Promise<AsignacionInsumo[]> {
    return apiClient.get<AsignacionInsumo[]>(`${API_ENDPOINTS.operaciones}/${idOperacion}/insumos`);
  }

  // ejecución
  
  async getRegistroEjecucion(idOperacion: number): Promise<RegistroEjecucion> {
    return apiClient.get<RegistroEjecucion>(`${API_ENDPOINTS.operaciones}/${idOperacion}/ejecucion`);
  }

  async guardarRegistroEjecucion(idOperacion: number, data: Partial<RegistroEjecucion>): Promise<RegistroEjecucion> {
    return apiClient.post<RegistroEjecucion>(`${API_ENDPOINTS.operaciones}/${idOperacion}/ejecucion`, data);
  }

  // incidencias
  
  async getIncidencias(idOperacion?: number): Promise<IncidenciaOperacion[]> {
    return apiClient.get<IncidenciaOperacion[]>(API_ENDPOINTS.operaciones + '/incidencias', { id_operacion: idOperacion });
  }

  async registrarIncidencia(data: Partial<IncidenciaOperacion>): Promise<IncidenciaOperacion> {
    return apiClient.post<IncidenciaOperacion>(API_ENDPOINTS.operaciones + '/incidencias', data);
  }

  async resolverIncidencia(id: number, solucion: string): Promise<IncidenciaOperacion> {
    return apiClient.patch<IncidenciaOperacion>(`${API_ENDPOINTS.operaciones}/incidencias/${id}/resolver`, { solucion });
  }

  // control de calidad
  
  async getInspecciones(idOperacion?: number): Promise<InspeccionCalidad[]> {
    return apiClient.get<InspeccionCalidad[]>(API_ENDPOINTS.operaciones + '/inspecciones', { id_operacion: idOperacion });
  }

  async registrarInspeccion(data: Partial<InspeccionCalidad>): Promise<InspeccionCalidad> {
    return apiClient.post<InspeccionCalidad>(API_ENDPOINTS.operaciones + '/inspecciones', data);
  }

  // estadísticas y reportes
  
  async getEstadisticas(): Promise<EstadisticasOperaciones> {
    return {
      total_programadas_hoy: 18,
      total_en_ejecucion: 6,
      total_completadas_hoy: 12,
      total_canceladas: 2,
      tecnicos_disponibles: 8,
      tecnicos_ocupados: 6,
      tasa_completitud: 85.7,
      tiempo_promedio_servicio: 135
    };
  }

  async getRendimiento(fechaInicio: string, fechaFin: string): Promise<RendimientoOperaciones[]> {
    return apiClient.get<RendimientoOperaciones[]>(API_ENDPOINTS.operaciones + '/rendimiento', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  // exportación
  
  async exportarOperaciones(fechaInicio: string, fechaFin: string, formato: 'Excel' | 'PDF'): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.operaciones}/exportar?inicio=${fechaInicio}&fin=${fechaFin}&formato=${formato}`,
      `Operaciones_${fechaInicio}_${fechaFin}.${formato === 'Excel' ? 'xlsx' : 'pdf'}`
    );
  }
}

// Mock Data
function getMockOperaciones(): OperacionServicio[] {
  return [
    {
      id: 1,
      id_orden: 89,
      orden_numero: 'OS-2025-089',
      id_cliente: 1,
      cliente_nombre: 'Logística Transandina',
      tipo_servicio: 'Fumigación',
      direccion: 'Av. Industrial 245, Callao',
      distrito: 'Callao',
      fecha_programada: '2025-02-10',
      hora_inicio_programada: '09:00',
      hora_fin_programada: '11:30',
      id_tecnico_asignado: 1,
      tecnico_nombre: 'Juan Pérez',
      id_vehiculo_asignado: 1,
      vehiculo_placa: 'ABC-123',
      estado: 'Programada',
      duracion_estimada: 150
    }
  ];
}

function getMockTecnicos(): Tecnico[] {
  return [
    {
      id: 1,
      dni: '45678901',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez López',
      nombre_completo: 'Juan Carlos Pérez López',
      telefono: '987654321',
      email: 'juan.perez@empresa.com',
      especialidad: ['Fumigación', 'Desratización'],
      certificaciones: ['Manejo de Plaguicidas', 'Primeros Auxilios'],
      nivel_experiencia: 'Senior',
      estado: 'Disponible',
      fecha_ingreso: '2020-03-15',
      servicios_completados: 450,
      calificacion_promedio: 4.8
    }
  ];
}

function getMockEquipos(): EquipoOperacion[] {
  return [
    {
      id: 1,
      codigo: 'FUM-001',
      nombre: 'Fumigadora Eléctrica ULV',
      tipo: 'Fumigadora',
      marca: 'Swissmex',
      modelo: 'ULV-2020',
      estado: 'Disponible',
      ubicacion_actual: 'Almacén Principal',
      fecha_ultimo_mantenimiento: '2025-01-15',
      fecha_proximo_mantenimiento: '2025-03-15'
    }
  ];
}

function getMockInsumos(): InsumoOperacion[] {
  return [
    {
      id: 1,
      codigo: 'QUI-001',
      nombre: 'Cipermetrina 25% EC',
      categoria: 'Químico',
      unidad_medida: 'Litros',
      stock_actual: 45,
      stock_minimo: 20,
      estado: 'Disponible'
    }
  ];
}

export const operacionesService = new OperacionesService();
