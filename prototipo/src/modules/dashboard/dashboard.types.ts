export interface DashboardStats {
  inventario: {
    total: number;
    cambio: number;
    unidad: string;
  };
  servicios: {
    total: number;
    urgentes: number;
    periodo: string;
  };
  ingresos: {
    total: number;
    cambio: number;
    moneda: string;
  };
}

export interface ActividadReciente {
  id: number;
  cliente: string;
  servicio: string;
  estado: 'COMPLETADO' | 'EN PROCESO' | 'PENDIENTE' | 'CANCELADO';
  fecha: string;
  tecnico: string;
  icono?: string;
}

export interface ServicioProximo {
  id: number;
  fecha: Date;
  cliente: string;
  tipo_servicio: string;
}

export interface EstadoSistema {
  capacidad_almacen: number;
  rendimiento_operativo: number;
}

export interface DashboardData {
  stats: DashboardStats;
  actividades_recientes: ActividadReciente[];
  servicios_proximos: ServicioProximo[];
  estado_sistema: EstadoSistema;
}
