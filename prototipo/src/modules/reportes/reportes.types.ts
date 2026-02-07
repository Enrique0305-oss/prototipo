// Tipos para el módulo de Reportes

export type TipoReporte = 
  | 'Servicios'
  | 'Ventas'
  | 'Finanzas'
  | 'RRHH'
  | 'Inventario'
  | 'Clientes'
  | 'Operaciones'
  | 'Comercial';

export type FormatoExportacion = 'PDF' | 'Excel' | 'CSV';
export type PeriodoReporte = 'Hoy' | 'Ayer' | 'Semana Actual' | 'Mes Actual' | 'Mes Anterior' | 'Trimestre' | 'Año Actual' | 'Personalizado';
export type EstadoReporte = 'Generando' | 'Completado' | 'Error';

// Definición de Reportes
export interface DefinicionReporte {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoReporte;
  icono: string;
  parametros_requeridos: ParametroReporte[];
  formatos_disponibles: FormatoExportacion[];
}

export interface ParametroReporte {
  nombre: string;
  tipo: 'fecha' | 'rango_fechas' | 'select' | 'multiselect' | 'numero' | 'texto';
  etiqueta: string;
  requerido: boolean;
  opciones?: { valor: string; etiqueta: string }[];
  valor_defecto?: any;
}

// Solicitud de Reporte
export interface SolicitudReporte {
  id: number;
  id_reporte: string;
  nombre_reporte: string;
  parametros: Record<string, any>;
  periodo?: PeriodoReporte;
  fecha_inicio?: string;
  fecha_fin?: string;
  formato: FormatoExportacion;
  estado: EstadoReporte;
  fecha_solicitud: string;
  fecha_generacion?: string;
  id_usuario_solicita: number;
  usuario_nombre?: string;
  url_descarga?: string;
  error_mensaje?: string;
}

// Reportes Predefinidos

// Reporte de Servicios
export interface ReporteServicios {
  periodo: string;
  total_servicios: number;
  servicios_completados: number;
  servicios_cancelados: number;
  tasa_completitud: number;
  servicios_por_tipo: {
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }[];
  servicios_por_distrito: {
    distrito: string;
    cantidad: number;
  }[];
  top_clientes: {
    cliente: string;
    total_servicios: number;
    facturacion: number;
  }[];
}

// Reporte de Ventas
export interface ReporteVentas {
  periodo: string;
  total_ventas: number;
  total_cotizaciones: number;
  total_ordenes: number;
  conversion_rate: number;
  ventas_por_tipo: {
    tipo: string;
    cantidad: number;
    monto: number;
  }[];
  ventas_por_mes: {
    mes: string;
    monto: number;
    cantidad: number;
  }[];
  top_vendedores: {
    vendedor: string;
    total_ventas: number;
    monto_total: number;
  }[];
}

// Reporte Financiero
export interface ReporteFinanciero {
  periodo: string;
  total_ingresos: number;
  total_egresos: number;
  utilidad_neta: number;
  margen_utilidad: number;
  ingresos_por_categoria: {
    categoria: string;
    monto: number;
    porcentaje: number;
  }[];
  egresos_por_categoria: {
    categoria: string;
    monto: number;
    porcentaje: number;
  }[];
  flujo_caja_mensual: {
    mes: string;
    ingresos: number;
    egresos: number;
    saldo: number;
  }[];
}

// Reporte de Recursos Humanos
export interface ReporteRRHH {
  periodo: string;
  total_empleados: number;
  total_asistencias: number;
  total_tardanzas: number;
  total_faltas: number;
  tasa_asistencia: number;
  asistencias_por_empleado: {
    empleado: string;
    dias_trabajados: number;
    horas_totales: number;
    tardanzas: number;
    faltas: number;
  }[];
  horas_extras_totales: number;
  costo_planilla: number;
}

// Reporte de Inventario
export interface ReporteInventario {
  fecha: string;
  total_productos: number;
  valor_total_inventario: number;
  productos_bajo_stock: number;
  movimientos_mes: {
    entradas: number;
    salidas: number;
    neto: number;
  };
  productos_mas_usados: {
    producto: string;
    cantidad_utilizada: number;
    valor: number;
  }[];
  rotacion_inventario: number;
}

// Reporte de Clientes
export interface ReporteClientes {
  periodo: string;
  total_clientes: number;
  clientes_nuevos: number;
  clientes_activos: number;
  clientes_inactivos: number;
  tasa_retencion: number;
  clientes_por_sector: {
    sector: string;
    cantidad: number;
    porcentaje: number;
  }[];
  top_clientes_facturacion: {
    cliente: string;
    total_facturado: number;
    total_servicios: number;
  }[];
  lifetime_value_promedio: number;
}

// Reporte de Operaciones
export interface ReporteOperaciones {
  periodo: string;
  total_operaciones: number;
  operaciones_completadas: number;
  tasa_exito: number;
  tiempo_promedio_servicio: number;
  tecnicos_activos: number;
  productividad_por_tecnico: {
    tecnico: string;
    servicios_completados: number;
    horas_trabajadas: number;
    eficiencia: number;
  }[];
  incidencias_totales: number;
  incidencias_por_tipo: {
    tipo: string;
    cantidad: number;
  }[];
}

// Dashboard de Reportes
export interface EstadisticasReportes {
  reportes_generados_mes: number;
  reportes_pendientes: number;
  formatos_mas_usados: {
    formato: FormatoExportacion;
    cantidad: number;
  }[];
  tipos_mas_solicitados: {
    tipo: TipoReporte;
    cantidad: number;
  }[];
}

// Programa de Reportes
export interface ReporteProgramado {
  id: number;
  id_reporte: string;
  nombre: string;
  parametros: Record<string, any>;
  formato: FormatoExportacion;
  frecuencia: 'Diaria' | 'Semanal' | 'Quincenal' | 'Mensual';
  dia_ejecucion?: number; // 1-31 para mensual, 1-7 para semanal
  hora_ejecucion: string;
  activo: boolean;
  destinatarios_email: string[];
  ultima_ejecucion?: string;
  proxima_ejecucion: string;
}

// Filtros
export interface FiltroHistorialReportes {
  tipo?: TipoReporte;
  estado?: EstadoReporte;
  fecha_inicio?: string;
  fecha_fin?: string;
  usuario?: number;
  busqueda?: string;
}
