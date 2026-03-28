import type { CotizacionTipoAdapter, CotizacionTipoData, DisabledFieldsState, DetalleItemIds } from './types';

function getDisabledFieldsState(): DisabledFieldsState {
  return {
    disabledCantidad: '',
    disabledCantidadStyle: '',
    disabledFrecuencia: '',
    disabledFrecuenciaStyle: '',
    disabledModalidad: '',
    disabledModalidadStyle: '',
  };
}

function buildItemOptions(data: CotizacionTipoData): string {
  let options = '<option value="">Seleccione...</option>';
  const filtrados = data.tipoCapAudFiltro 
    ? data.catalogoCapAud.filter((c: any) => c.tipo === data.tipoCapAudFiltro)
    : data.catalogoCapAud;
  
  filtrados.forEach((c: any) => {
    const desc = (c.descripcion || '').replace(/"/g, '&quot;');
    const precio = c.precio_referencial || 0;
    const duracion = c.duracion_horas ? ` (${c.duracion_horas}hrs)` : '';
    options += `<option value="c-${c.id}" data-descripcion="${desc}" data-precio="${precio}">[${c.tipo}] ${c.nombre}${duracion}</option>`;
  });
  return options;
}

function parseSelectedItem(value: string): DetalleItemIds {
  return {
    id_servicio: null,
    id_producto: null,
    id_catalogo_cap_aud: value.startsWith('c-') ? parseInt(value.replace('c-', ''), 10) : null,
  };
}

export const capacitacionCotizacionAdapter: CotizacionTipoAdapter = {
  tipo: 'Capacitacion',
  buildItemOptions,
  getDisabledFieldsState,
  parseSelectedItem,
};
