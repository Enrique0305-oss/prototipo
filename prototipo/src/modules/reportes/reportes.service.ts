// Servicio para el módulo de Reportes
import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type {
  DefinicionReporte,
  SolicitudReporte,
  ReporteServicios,
  ReporteVentas,
  ReporteFinanciero,
  ReporteRRHH,
  ReporteInventario,
  ReporteClientes,
  ReporteOperaciones,
  EstadisticasReportes,
  ReporteProgramado,
  FiltroHistorialReportes,
  FormatoExportacion
} from './reportes.types';

class ReportesService {
  // definiciones de reportes
  
  async getDefinicionesReportes(): Promise<DefinicionReporte[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockDefinicionesReportes();
  }

  async getDefinicionReporte(id: string): Promise<DefinicionReporte> {
    return apiClient.get<DefinicionReporte>(`${API_ENDPOINTS.reportes}/definiciones/${id}`);
  }

  // generación de reportes
  
  async generarReporte(
    idReporte: string,
    parametros: Record<string, any>,
    formato: FormatoExportacion
  ): Promise<SolicitudReporte> {
    return apiClient.post<SolicitudReporte>(API_ENDPOINTS.reportes + '/generar', {
      id_reporte: idReporte,
      parametros,
      formato
    });
  }

  async getHistorialReportes(filtros?: FiltroHistorialReportes): Promise<SolicitudReporte[]> {
    return getMockHistorialReportes();
  }

  async getSolicitudReporte(id: number): Promise<SolicitudReporte> {
    return apiClient.get<SolicitudReporte>(`${API_ENDPOINTS.reportes}/solicitudes/${id}`);
  }

  async descargarReporte(id: number): Promise<void> {
    const solicitud = await this.getSolicitudReporte(id);
    if (solicitud.url_descarga) {
      window.open(solicitud.url_descarga, '_blank');
    }
  }

  // reportes específicos
  
  async getReporteServicios(fechaInicio: string, fechaFin: string): Promise<ReporteServicios> {
    return apiClient.get<ReporteServicios>(API_ENDPOINTS.reportes + '/servicios', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  async getReporteVentas(fechaInicio: string, fechaFin: string): Promise<ReporteVentas> {
    return apiClient.get<ReporteVentas>(API_ENDPOINTS.reportes + '/ventas', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  async getReporteFinanciero(fechaInicio: string, fechaFin: string): Promise<ReporteFinanciero> {
    return apiClient.get<ReporteFinanciero>(API_ENDPOINTS.reportes + '/financiero', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  async getReporteRRHH(mes: number, anio: number): Promise<ReporteRRHH> {
    return apiClient.get<ReporteRRHH>(API_ENDPOINTS.reportes + '/rrhh', { mes, anio });
  }

  async getReporteInventario(fecha: string): Promise<ReporteInventario> {
    return apiClient.get<ReporteInventario>(API_ENDPOINTS.reportes + '/inventario', { fecha });
  }

  async getReporteClientes(fechaInicio: string, fechaFin: string): Promise<ReporteClientes> {
    return apiClient.get<ReporteClientes>(API_ENDPOINTS.reportes + '/clientes', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  async getReporteOperaciones(fechaInicio: string, fechaFin: string): Promise<ReporteOperaciones> {
    return apiClient.get<ReporteOperaciones>(API_ENDPOINTS.reportes + '/operaciones', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

  // reportes programados
  
  async getReportesProgramados(): Promise<ReporteProgramado[]> {
    return apiClient.get<ReporteProgramado[]>(API_ENDPOINTS.reportes + '/programados');
  }

  async crearReporteProgramado(data: Partial<ReporteProgramado>): Promise<ReporteProgramado> {
    return apiClient.post<ReporteProgramado>(API_ENDPOINTS.reportes + '/programados', data);
  }

  async actualizarReporteProgramado(id: number, data: Partial<ReporteProgramado>): Promise<ReporteProgramado> {
    return apiClient.patch<ReporteProgramado>(`${API_ENDPOINTS.reportes}/programados/${id}`, data);
  }

  async eliminarReporteProgramado(id: number): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.reportes}/programados/${id}`);
  }

  async activarReporteProgramado(id: number): Promise<ReporteProgramado> {
    return apiClient.patch<ReporteProgramado>(`${API_ENDPOINTS.reportes}/programados/${id}/activar`, {});
  }

  async desactivarReporteProgramado(id: number): Promise<ReporteProgramado> {
    return apiClient.patch<ReporteProgramado>(`${API_ENDPOINTS.reportes}/programados/${id}/desactivar`, {});
  }

  // estadísticas
  
  async getEstadisticas(): Promise<EstadisticasReportes> {
    return {
      reportes_generados_mes: 45,
      reportes_pendientes: 3,
      formatos_mas_usados: [
        { formato: 'PDF', cantidad: 28 },
        { formato: 'Excel', cantidad: 17 }
      ],
      tipos_mas_solicitados: [
        { tipo: 'Servicios', cantidad: 15 },
        { tipo: 'Ventas', cantidad: 12 },
        { tipo: 'Finanzas', cantidad: 8 }
      ]
    };
  }

  // exportación directa
  
  async exportarServiciosPDF(fechaInicio: string, fechaFin: string): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.reportes}/servicios/pdf?inicio=${fechaInicio}&fin=${fechaFin}`,
      `Reporte_Servicios_${fechaInicio}_${fechaFin}.pdf`
    );
  }

  async exportarServiciosExcel(fechaInicio: string, fechaFin: string): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.reportes}/servicios/excel?inicio=${fechaInicio}&fin=${fechaFin}`,
      `Reporte_Servicios_${fechaInicio}_${fechaFin}.xlsx`
    );
  }

  async exportarVentasPDF(fechaInicio: string, fechaFin: string): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.reportes}/ventas/pdf?inicio=${fechaInicio}&fin=${fechaFin}`,
      `Reporte_Ventas_${fechaInicio}_${fechaFin}.pdf`
    );
  }

  async exportarVentasExcel(fechaInicio: string, fechaFin: string): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.reportes}/ventas/excel?inicio=${fechaInicio}&fin=${fechaFin}`,
      `Reporte_Ventas_${fechaInicio}_${fechaFin}.xlsx`
    );
  }
}

// mock data
function getMockDefinicionesReportes(): DefinicionReporte[] {
  return [
    {
      id: 'servicios',
      nombre: 'Reporte de Servicios',
      descripcion: 'Detalle de todos los servicios realizados en un periodo',
      tipo: 'Servicios',
      icono: 'service',
      parametros_requeridos: [
        {
          nombre: 'fecha_inicio',
          tipo: 'fecha',
          etiqueta: 'Fecha Inicio',
          requerido: true
        },
        {
          nombre: 'fecha_fin',
          tipo: 'fecha',
          etiqueta: 'Fecha Fin',
          requerido: true
        }
      ],
      formatos_disponibles: ['PDF', 'Excel', 'CSV']
    },
    {
      id: 'ventas',
      nombre: 'Reporte de Ventas',
      descripcion: 'Análisis de ventas, cotizaciones y conversiones',
      tipo: 'Ventas',
      icono: 'chart-line',
      parametros_requeridos: [
        {
          nombre: 'periodo',
          tipo: 'select',
          etiqueta: 'Periodo',
          requerido: true,
          opciones: [
            { valor: 'mes_actual', etiqueta: 'Mes Actual' },
            { valor: 'mes_anterior', etiqueta: 'Mes Anterior' },
            { valor: 'trimestre', etiqueta: 'Trimestre' },
            { valor: 'personalizado', etiqueta: 'Personalizado' }
          ]
        }
      ],
      formatos_disponibles: ['PDF', 'Excel']
    },
    {
      id: 'financiero',
      nombre: 'Reporte Financiero',
      descripcion: 'Balance, ingresos, egresos y flujo de caja',
      tipo: 'Finanzas',
      icono: 'dollar-sign',
      parametros_requeridos: [
        {
          nombre: 'mes',
          tipo: 'numero',
          etiqueta: 'Mes',
          requerido: true
        },
        {
          nombre: 'anio',
          tipo: 'numero',
          etiqueta: 'Año',
          requerido: true
        }
      ],
      formatos_disponibles: ['PDF', 'Excel']
    }
  ];
}

function getMockHistorialReportes(): SolicitudReporte[] {
  return [
    {
      id: 1,
      id_reporte: 'servicios',
      nombre_reporte: 'Reporte de Servicios',
      parametros: {
        fecha_inicio: '2025-01-01',
        fecha_fin: '2025-01-31'
      },
      periodo: 'Mes Actual',
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-01-31',
      formato: 'PDF',
      estado: 'Completado',
      fecha_solicitud: '2025-02-05 10:30',
      fecha_generacion: '2025-02-05 10:32',
      id_usuario_solicita: 1,
      usuario_nombre: 'Admin Sistema',
      url_descarga: '/reportes/servicios_enero_2025.pdf'
    }
  ];
}

export const reportesService = new ReportesService();
