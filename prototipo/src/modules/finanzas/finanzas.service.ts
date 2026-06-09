// Servicio para el módulo de Finanzas
import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type {
  MovimientoCaja,
  CajaChica,
  MovimientoCajaChica,
  CuentaPorCobrar,
  PagoCuenta,
  CuentaPorPagar,
  Presupuesto,
  BalanceMensual,
  FlujoCaja,
  FiltroMovimientos,
  FiltroCuentasCobrar,
  FiltroCuentasPagar,
  EstadisticasFinanzas,
  EstadisticasCajaChica
} from './finanzas.types';

class FinanzasService {
  // === MOVIMIENTOS DE CAJA ===
  
  async getMovimientos(filtros?: FiltroMovimientos): Promise<MovimientoCaja[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockMovimientos();
  }

  async getMovimiento(id: number): Promise<MovimientoCaja> {
    return apiClient.get<MovimientoCaja>(`${API_ENDPOINTS.finanzas.movimientos}/${id}`);
  }

  async registrarIngreso(data: Partial<MovimientoCaja>): Promise<MovimientoCaja> {
    return apiClient.post<MovimientoCaja>(`${API_ENDPOINTS.finanzas.movimientos}/ingreso`, data);
  }

  async registrarEgreso(data: Partial<MovimientoCaja>): Promise<MovimientoCaja> {
    return apiClient.post<MovimientoCaja>(`${API_ENDPOINTS.finanzas.movimientos}/egreso`, data);
  }

  // caja chica
  
  async getCajasChicas(): Promise<CajaChica[]> {
    return getMockCajasChicas();
  }

  async getCajaChica(id: number): Promise<CajaChica> {
    return apiClient.get<CajaChica>(`${API_ENDPOINTS.finanzas.cajaChica}/${id}`);
  }

  async abrirCajaChica(data: Partial<CajaChica>): Promise<CajaChica> {
    return apiClient.post<CajaChica>(API_ENDPOINTS.finanzas.cajaChica, data);
  }

  async cerrarCajaChica(id: number): Promise<CajaChica> {
    return apiClient.patch<CajaChica>(`${API_ENDPOINTS.finanzas.cajaChica}/${id}/cerrar`, {});
  }

  async getMovimientosCajaChica(): Promise<{ success: boolean; data: MovimientoCajaChica[]; saldo_actual: number }> {
    return apiClient.get<{ success: boolean; data: MovimientoCajaChica[]; saldo_actual: number }>(API_ENDPOINTS.finanzas.cajaChica);
  }

  async registrarMovimientoCajaChica(data: Partial<MovimientoCajaChica>): Promise<MovimientoCajaChica> {
    const response = await apiClient.post<{ success: boolean; data: MovimientoCajaChica }>(API_ENDPOINTS.finanzas.cajaChica, data);
    return response.data;
  }

  // estado cuenta
  
  async getEstadoCuenta(cuenta: 'Multi' | 'CIM'): Promise<{ success: boolean; data: any[]; saldo_actual: number }> {
    return apiClient.get<{ success: boolean; data: any[]; saldo_actual: number }>(`/estado-cuenta?cuenta=${cuenta}`);
  }

  async registrarEstadoCuenta(data: any): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any }>('/estado-cuenta', data);
    return response.data;
  }

  async getEstadisticasCajaChica(): Promise<EstadisticasCajaChica> {
    return {
      total_cajas_abiertas: 3,
      monto_total_disponible: 4500,
      total_movimientos_mes: 45
    };
  }

  // cuentas por cobrar
  
  async getCuentasPorCobrar(filtros?: FiltroCuentasCobrar): Promise<CuentaPorCobrar[]> {
    return getMockCuentasPorCobrar();
  }

  async getCuentaPorCobrar(id: number): Promise<CuentaPorCobrar> {
    return apiClient.get<CuentaPorCobrar>(`${API_ENDPOINTS.finanzas.cuentasCobrar}/${id}`);
  }

  async registrarPagoCuenta(idCuenta: number, data: Partial<PagoCuenta>): Promise<PagoCuenta> {
    return apiClient.post<PagoCuenta>(`${API_ENDPOINTS.finanzas.cuentasCobrar}/${idCuenta}/pagos`, data);
  }

  async getHistorialPagos(idCuenta: number): Promise<PagoCuenta[]> {
    return apiClient.get<PagoCuenta[]>(`${API_ENDPOINTS.finanzas.cuentasCobrar}/${idCuenta}/pagos`);
  }

  // cuentas por pagar
  
  async getCuentasPorPagar(filtros?: FiltroCuentasPagar): Promise<CuentaPorPagar[]> {
    return getMockCuentasPorPagar();
  }

  async getCuentaPorPagar(id: number): Promise<CuentaPorPagar> {
    return apiClient.get<CuentaPorPagar>(`${API_ENDPOINTS.finanzas.cuentasPagar}/${id}`);
  }

  async registrarPagoPagar(idCuenta: number, data: Partial<PagoCuenta>): Promise<PagoCuenta> {
    return apiClient.post<PagoCuenta>(`${API_ENDPOINTS.finanzas.cuentasPagar}/${idCuenta}/pagos`, data);
  }

  // presupuesto
  
  async getPresupuestos(anio: number, mes?: number): Promise<Presupuesto[]> {
    return apiClient.get<Presupuesto[]>(API_ENDPOINTS.finanzas.presupuesto, { anio, mes });
  }

  async actualizarPresupuesto(id: number, data: Partial<Presupuesto>): Promise<Presupuesto> {
    return apiClient.patch<Presupuesto>(`${API_ENDPOINTS.finanzas.presupuesto}/${id}`, data);
  }

  // reportes y balance
  
  async getBalanceMensual(anio: number, mes?: number): Promise<BalanceMensual[]> {
    return apiClient.get<BalanceMensual[]>(API_ENDPOINTS.finanzas.balance, { anio, mes });
  }

  async getFlujoCaja(fechaInicio: string, fechaFin: string): Promise<FlujoCaja[]> {
    return apiClient.get<FlujoCaja[]>(API_ENDPOINTS.finanzas.flujoCaja, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
  }

  async getEstadisticas(): Promise<EstadisticasFinanzas> {
    return {
      ingresos_mes: 84250,
      egresos_mes: 52180,
      saldo_neto: 32070,
      variacion_ingresos: 12,
      variacion_egresos: 8,
      cuentas_por_cobrar_total: 32450,
      cuentas_por_pagar_total: 18500,
      liquidez: 1.75
    };
  }

  // exportación
  
  async exportarMovimientos(fechaInicio: string, fechaFin: string, formato: 'Excel' | 'PDF'): Promise<void> {
    return apiClient.downloadFile(
      `${API_ENDPOINTS.finanzas.movimientos}/exportar?inicio=${fechaInicio}&fin=${fechaFin}&formato=${formato}`,
      `Movimientos_${fechaInicio}_${fechaFin}.${formato === 'Excel' ? 'xlsx' : 'pdf'}`
    );
  }
}

// Mock Data
function getMockMovimientos(): MovimientoCaja[] {
  return [
    {
      id: 1,
      fecha: '2025-02-05 10:30',
      tipo: 'Ingreso',
      categoria: 'Servicios',
      descripcion: 'Pago Factura F001-00245',
      monto: 2800.00,
      metodo_pago: 'Transferencia',
      numero_comprobante: 'F001-00245',
      numero_operacion: 'TRF-123456',
      id_factura_relacionada: 245,
      estado: 'Aprobado',
      id_usuario_registro: 1,
      usuario_nombre: 'Admin Sistema'
    }
  ];
}

function getMockCajasChicas(): CajaChica[] {
  return [
    {
      id: 1,
      codigo: 'CC-001',
      responsable: 'María López',
      fecha_apertura: '2025-02-01',
      monto_inicial: 2000.00,
      monto_actual: 1350.00,
      total_ingresos: 500.00,
      total_egresos: 1150.00,
      estado: 'Abierta'
    }
  ];
}

function getMockCuentasPorCobrar(): CuentaPorCobrar[] {
  return [
    {
      id: 1,
      id_factura: 245,
      numero_factura: 'F001-00245',
      id_cliente: 1,
      cliente_nombre: 'Logística Transandina',
      fecha_emision: '2025-01-10',
      fecha_vencimiento: '2025-01-25',
      monto_total: 2800.00,
      monto_pagado: 0,
      monto_pendiente: 2800.00,
      estado: 'Pendiente',
      dias_vencidos: 0
    }
  ];
}

function getMockCuentasPorPagar(): CuentaPorPagar[] {
  return [
    {
      id: 1,
      numero_documento: 'F001-5678',
      id_proveedor: 1,
      proveedor_nombre: 'QuímicaPeru S.A.C.',
      concepto: 'Compra Cipermetrina',
      fecha_emision: '2025-01-15',
      fecha_vencimiento: '2025-02-14',
      monto_total: 1500.00,
      monto_pagado: 0,
      monto_pendiente: 1500.00,
      estado: 'Pendiente',
      dias_vencidos: 0
    }
  ];
}

export const finanzasService = new FinanzasService();
