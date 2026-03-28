export type TipoCotizacion = 'Servicio' | 'Producto' | 'Capacitacion' | 'Asesoria';

export interface DetalleItemIds {
  id_servicio: number | null;
  id_producto: number | null;
  id_catalogo_cap_aud: number | null;
}

export interface DisabledFieldsState {
  disabledCantidad: string;
  disabledCantidadStyle: string;
  disabledFrecuencia: string;
  disabledFrecuenciaStyle: string;
  disabledModalidad: string;
  disabledModalidadStyle: string;
}

export interface CotizacionTipoData {
  servicios: any[];
  productos: any[];
  catalogoCapAud: any[];
  tipoCapAudFiltro?: string;
}

export interface CotizacionTipoAdapter {
  tipo: TipoCotizacion;
  buildItemOptions(data: CotizacionTipoData): string;
  getDisabledFieldsState(): DisabledFieldsState;
  parseSelectedItem(value: string): DetalleItemIds;
}
