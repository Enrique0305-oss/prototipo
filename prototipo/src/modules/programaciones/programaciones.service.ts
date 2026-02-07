import type { Programacion, Tecnico, FiltroProgramacion, EstadisticasProgramacion } from './programaciones.types';

export class ProgramacionesService {
  private baseURL = 'http://localhost:3000/api';

  /**
   * Obtiene todas las programaciones con filtros opcionales
   */
  async getProgramaciones(filtros?: FiltroProgramacion): Promise<Programacion[]> {
    // TODO: Implementar cuando el backend esté listo
    return this.getMockProgramaciones();
  }
  async getProgramacionesPorFecha(fecha: Date): Promise<Programacion[]> {
    // TODO: Implementar
    return this.getMockProgramaciones();
  }

  async getTecnicos(): Promise<Tecnico[]> {
    // TODO: Implementar
    return this.getMockTecnicos();
  }

  async crearProgramacion(data: Partial<Programacion>): Promise<Programacion> {
    // TODO: Implementar
    console.log('Creando programación:', data);
    return data as Programacion;
  }
  async actualizarProgramacion(id: number, data: Partial<Programacion>): Promise<Programacion> {
    // TODO: Implementar
    console.log(`Actualizando programación ${id}:`, data);
    return data as Programacion;
  }
  async getEstadisticas(): Promise<EstadisticasProgramacion> {
    // TODO: Implementar
    return {
      programados: 15,
      confirmados: 8,
      en_ejecucion: 3,
      completados: 42,
      reprogramados: 2,
      cancelados: 1
    };
  }

  async exportarAgenda(fecha_inicio: Date, fecha_fin: Date): Promise<Blob> {
    // TODO: Implementar
    console.log('Exportando agenda del', fecha_inicio, 'al', fecha_fin);
    return new Blob(['PDF pendiente'], { type: 'application/pdf' });
  }


  private getMockProgramaciones(): Programacion[] {
    return [
      {
        id: 1,
        id_servicio: 1,
        servicio_nombre: 'Fumigación Industrial',
        id_cliente: 1,
        cliente_nombre: 'Industrias ABC S.A.C.',
        id_tecnico_asignado: 1,
        tecnico_nombre: 'Juan Ramírez',
        fecha_programada: '2025-01-06',
        hora_inicio: '09:00',
        hora_fin: '13:00',
        local_sede: 'Planta Principal - Lima',
        direccion_completa: 'Av. Industrial 123, Callao',
        estado_ejecucion: 'Programado',
        requiere_movilidad: true,
        id_vehiculo: 1,
        vehiculo_placa: 'ABC-123',
        observaciones: 'Cliente requiere certificado ISO',
      },
      {
        id: 2,
        id_servicio: 2,
        servicio_nombre: 'Mantenimiento',
        id_cliente: 2,
        cliente_nombre: 'Restaurant El Sabor',
        id_tecnico_asignado: 2,
        tecnico_nombre: 'María Soto',
        fecha_programada: '2025-01-07',
        hora_inicio: '14:00',
        hora_fin: '16:00',
        local_sede: 'Local Miraflores',
        direccion_completa: 'Av. Larco 456, Miraflores',
        estado_ejecucion: 'Confirmado',
        requiere_movilidad: false,
        observaciones: '',
      },
    ];
  }

  private getMockTecnicos(): Tecnico[] {
    return [
      { id: 1, nombre: 'Juan Ramírez', estado: 'Activo', servicios_hoy: 2, autorizado_conducir: true },
      { id: 2, nombre: 'María Soto', estado: 'Activo', servicios_hoy: 3, autorizado_conducir: false },
      { id: 3, nombre: 'Pedro López', estado: 'Activo', servicios_hoy: 0, autorizado_conducir: true },
    ];
  }
}

// Exportar instancia singleton
export const programacionesService = new ProgramacionesService();
