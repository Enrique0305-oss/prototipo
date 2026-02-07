// Tipos para el módulo de Facturación y Cobranza

export type TipoComprobante = 'Factura' | 'Boleta' | 'Nota de Crédito' | 'Nota de Débito';
export type EstadoFactura = 'Borrador' | 'Emitida' | 'Anulada';
export type EstadoCobranza = 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido' | 'Incobrable';
export type MonedaFactura = 'PEN' | 'USD';
export type FormaPago = 'Contado' | 'Crédito 7 días' | 'Crédito 15 días' | 'Crédito 30 días' | 'Crédito 45 días' | 'Crédito 60 días';

// Facturas
export interface Factura {
  id: number;
  serie: string;
  correlativo: string;
  numero_completo: string; // serie-correlativo
  tipo_comprobante: TipoComprobante;
  id_cliente: number;
  cliente_ruc?: string;
  cliente_razon_social: string;
  cliente_direccion?: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: MonedaFactura;
  tipo_cambio?: number;
  forma_pago: FormaPago;
  id_orden?: number;
  orden_numero?: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: EstadoFactura;
  estado_cobranza: EstadoCobranza;
  fecha_envio_sunat?: string;
  hash_sunat?: string;
  xml_url?: string;
  pdf_url?: string;
  observaciones?: string;
  id_usuario_emisor: number;
  usuario_emisor_nombre?: string;
}

export interface DetalleFactura {
  id: number;
  id_factura: number;
  item: number;
  codigo_producto?: string;
  descripcion: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  igv: number;
  total: number;
}

// Cobranza
export interface Cobranza {
  id: number;
  id_factura: number;
  factura_numero: string;
  id_cliente: number;
  cliente_nombre: string;
  monto_total: number;
  monto_cobrado: number;
  monto_pendiente: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  forma_pago: FormaPago;
  dias_vencidos: number;
  estado: EstadoCobranza;
  id_responsable?: number;
  responsable_nombre?: string;
  ultima_gestion?: string;
  observaciones?: string;
}

export interface RegistroPago {
  id: number;
  id_factura: number;
  fecha_pago: string;
  monto: number;
  metodo_pago: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Tarjeta' | 'Depósito';
  numero_operacion?: string;
  banco?: string;
  cuenta?: string;
  observaciones?: string;
  id_usuario_registro: number;
  usuario_nombre?: string;
  comprobante_url?: string;
}

// Gestión de Cobranza
export interface GestionCobranza {
  id: number;
  id_cobranza: number;
  fecha: string;
  tipo: 'Llamada' | 'Email' | 'Visita' | 'WhatsApp' | 'Carta' | 'Otro';
  descripcion: string;
  resultado: 'Promesa de Pago' | 'Pagó' | 'No Contesta' | 'Rechaza Pagar' | 'Otro';
  fecha_promesa_pago?: string;
  id_usuario: number;
  usuario_nombre?: string;
}

// Proyecciones
export interface ProyeccionCobranza {
  fecha: string;
  monto_proyectado: number;
  facturas_vencer: number;
  cliente_principal?: string;
}

export interface OrdenProyectada {
  id_orden: number;
  orden_numero: string;
  cliente_nombre: string;
  tipo: 'Servicio' | 'Producto' | 'Capacitacion';
  monto: number;
  fecha_estimada_facturacion: string;
  estado: 'Pendiente' | 'Facturado';
}

// Nota de Crédito / Débito
export interface NotaCredito {
  id: number;
  serie: string;
  correlativo: string;
  numero_completo: string;
  id_factura_referencia: number;
  factura_referencia_numero: string;
  motivo: string;
  descripcion: string;
  fecha_emision: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: EstadoFactura;
  xml_url?: string;
  pdf_url?: string;
}

// Filtros
export interface FiltroFacturas {
  busqueda?: string;
  tipo_comprobante?: TipoComprobante;
  estado?: EstadoFactura;
  estado_cobranza?: EstadoCobranza;
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente?: number;
  moneda?: MonedaFactura;
}

export interface FiltroCobranza {
  busqueda?: string;
  estado?: EstadoCobranza;
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente?: number;
  responsable?: number;
  dias_vencidos_min?: number;
  dias_vencidos_max?: number;
}

// Estadísticas
export interface EstadisticasFacturacion {
  total_emitidas_mes: number;
  monto_facturado_mes: number;
  facturas_pendientes: number;
  monto_pendiente: number;
  facturas_cobradas: number;
  monto_cobrado: number;
  tasa_cobranza: number; // porcentaje
}

export interface EstadisticasCobranza {
  total_por_cobrar: number;
  vencidas: number;
  monto_vencido: number;
  proximas_vencer: number;
  monto_proximo_vencer: number;
  promedio_dias_cobranza: number;
  efectividad_cobranza: number; // porcentaje
}

export interface ResumenCliente {
  id_cliente: number;
  cliente_nombre: string;
  total_facturado: number;
  total_cobrado: number;
  total_pendiente: number;
  facturas_vencidas: number;
  dias_promedio_pago: number;
}
