import type { DashboardData } from './dashboard.types';

export class DashboardService {
  private baseURL = 'http://127.0.0.1:8000/api'; // Cambiar según tu backend

  async getDashboardData(): Promise<DashboardData> {
    // TODO: Implementar cuando el backend esté listo
    // Por ahora, retorna datos de ejemplo
    return this.getMockData();
  }

  private getMockData(): DashboardData {
    return {
      stats: {
        inventario: {
          total: 1284,
          cambio: 12,
          unidad: 'unidades'
        },
        servicios: {
          total: 42,
          urgentes: 1,
          periodo: 'hoy'
        },
        ingresos: {
          total: 84250,
          cambio: 8.4,
          moneda: 'USD'
        }
      },
      actividades_recientes: [
        {
          id: 1,
          cliente: 'Logística Norte S.A.',
          servicio: 'Fumigación de Almacén',
          estado: 'COMPLETADO',
          fecha: 'Hace 2 hrs',
          tecnico: 'Juan Pérez'
        },
        {
          id: 2,
          cliente: 'Residencial Las Lomas',
          servicio: 'Control de Plagas Jardín',
          estado: 'EN PROCESO',
          fecha: 'Hace 4 hrs',
          tecnico: 'María García'
        },
        {
          id: 3,
          cliente: 'Súper Todo Express',
          servicio: 'Inspección Sanitaria',
          estado: 'PENDIENTE',
          fecha: 'Hoy, 09:00 AM',
          tecnico: 'Carlos Ruiz'
        }
      ],
      servicios_proximos: [
        {
          id: 1,
          fecha: new Date(2026, 10, 24),
          cliente: 'Almacén Central FedEx',
          tipo_servicio: 'Mantenimiento Mensual'
        },
        {
          id: 2,
          fecha: new Date(2026, 10, 25),
          cliente: 'Hotel Continental',
          tipo_servicio: 'Inspección de Cocinas'
        }
      ],
      estado_sistema: {
        capacidad_almacen: 78,
        rendimiento_operativo: 92
      }
    };
  }

  async actualizarServicio(id: number, nuevoEstado: string): Promise<void> {
    // TODO: Implementar
    console.log(`Servicio ${id} actualizado a: ${nuevoEstado}`);
  }
}

// Exportar instancia singleton
export const dashboardService = new DashboardService();
