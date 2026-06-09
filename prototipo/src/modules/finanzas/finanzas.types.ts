// Tipos para el módulo de Finanzas

export type TipoMovimiento = 'Ingreso' | 'Egreso';
export type CategoriaIngreso = 'Servicios' | 'Productos' | 'Capacitaciones' | 'Otros';
export type CategoriaEgreso = 
  | 'Planilla' 
  | 'Compras' 
  | 'Servicios Básicos' 
  | 'Alquiler' 
  | 'Mantenimiento'
  | 'Combustible'
  | 'Marketing'
  | 'Impuestos'
  | 'Otros';
export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Depósito' | 'Cheque';
export type EstadoMovimiento = 'Registrado' | 'Verificado' | 'Aprobado' | 'Rechazado';

// Movimientos de Caja
export interface MovimientoCaja {
  id: number;
  fecha: string;
  tipo: TipoMovimiento;
  categoria: CategoriaIngreso | CategoriaEgreso;
  descripcion: string;
  monto: number;
  metodo_pago: MetodoPago;
  numero_comprobante?: string;
  numero_operacion?: string;
  id_orden_relacionada?: number;
  id_factura_relacionada?: number;
  estado: EstadoMovimiento;
  id_usuario_registro: number;
  usuario_nombre?: string;
  observaciones?: string;
}

// Caja Chica
export interface CajaChica {
  id: number;
  codigo: string;
  responsable: string;
  fecha_apertura: string;
  monto_inicial: number;
  monto_actual: number;
  total_ingresos?: number;
  total_egresos?: number;
  estado: 'Abierta' | 'Cerrada';
  fecha_cierre?: string;
}

export interface MovimientoCajaChica {
  id: number;
  fecha: string;
  tipo_movimiento: 'Ingreso' | 'Egreso';
  solicitante?: string;
  area?: string;
  proveedor?: string;
  documento?: string;
  concepto: string;
  tipo_dinero?: string;
  numero_operacion?: string;
  subtotal?: number;
  ingreso: number;
  egreso: number;
  saldo_actual: number;
  registrado_por?: string;
}

// Cuentas por Cobrar
export interface CuentaPorCobrar {
  id: number;
  id_factura: number;
  numero_factura: string;
  id_cliente: number;
  cliente_nombre: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
  estado: 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido';
  dias_vencidos?: number;
}

export interface PagoCuenta {
  id: number;
  id_cuenta_por_cobrar: number;
  fecha_pago: string;
  monto: number;
  metodo_pago: MetodoPago;
  numero_operacion?: string;
  observaciones?: string;
}

// Cuentas por Pagar
export interface CuentaPorPagar {
  id: number;
  numero_documento: string;
  id_proveedor: number;
  proveedor_nombre: string;
  concepto: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
  estado: 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido';
  dias_vencidos?: number;
}

// Presupuesto
export interface Presupuesto {
  id: number;
  anio: number;
  mes: number;
  categoria: CategoriaEgreso;
  monto_presupuestado: number;
  monto_ejecutado: number;
  monto_disponible: number;
  porcentaje_ejecucion: number;
}

// Balance y Reportes
export interface BalanceMensual {
  mes: number;
  anio: number;
  total_ingresos: number;
  total_egresos: number;
  saldo_neto: number;
  variacion_porcentual?: number;
}

export interface FlujoCaja {
  fecha: string;
  ingresos: number;
  egresos: number;
  saldo: number;
  saldo_acumulado: number;
}

// Filtros
export interface FiltroMovimientos {
  tipo?: TipoMovimiento;
  categoria?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  metodo_pago?: MetodoPago;
  estado?: EstadoMovimiento;
  busqueda?: string;
}

export interface FiltroCuentasCobrar {
  busqueda?: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente?: number;
}

export interface FiltroCuentasPagar {
  busqueda?: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  proveedor?: number;
}

// Estadísticas
export interface EstadisticasFinanzas {
  ingresos_mes: number;
  egresos_mes: number;
  saldo_neto: number;
  variacion_ingresos: number; // porcentaje
  variacion_egresos: number; // porcentaje
  cuentas_por_cobrar_total: number;
  cuentas_por_pagar_total: number;
  liquidez: number; // ratio
}

export interface EstadisticasCajaChica {
  total_cajas_abiertas: number;
  monto_total_disponible: number;
  total_movimientos_mes: number;
}
