import { capacitacionCotizacionAdapter } from './capacitacion';
import { productoCotizacionAdapter } from './producto';
import { servicioCotizacionAdapter } from './servicio';
import type { CotizacionTipoAdapter, TipoCotizacion } from './types';

const ADAPTERS: Record<TipoCotizacion, CotizacionTipoAdapter> = {
  Servicio: servicioCotizacionAdapter,
  Producto: productoCotizacionAdapter,
  Capacitacion: capacitacionCotizacionAdapter,
  Asesoria: capacitacionCotizacionAdapter,
  Auditoria: capacitacionCotizacionAdapter,
};

export function getCotizacionTipoAdapter(tipo: string): CotizacionTipoAdapter | null {
  if (tipo === 'Servicio' || tipo === 'Producto' || tipo === 'Capacitacion' || tipo === 'Asesoria' || tipo === 'Auditoria') {
    return ADAPTERS[tipo];
  }
  return null;
}

export const TAB_TO_TIPO: Record<string, TipoCotizacion> = {
  servicio: 'Servicio',
  producto: 'Producto',
  capacitacion: 'Capacitacion',
  asesoria: 'Asesoria',
  auditoria: 'Auditoria',
};
