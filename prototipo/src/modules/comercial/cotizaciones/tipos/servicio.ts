import type { CotizacionTipoAdapter, CotizacionTipoData, DisabledFieldsState, DetalleItemIds } from './types';

function getDisabledFieldsState(): DisabledFieldsState {
  return {
    disabledCantidad: 'disabled',
    disabledCantidadStyle: 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;',
    disabledFrecuencia: '',
    disabledFrecuenciaStyle: '',
    disabledModalidad: 'disabled',
    disabledModalidadStyle: 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;',
  };
}

function buildItemOptions(data: CotizacionTipoData): string {
  let options = '<option value="">Seleccione...</option>';
  data.servicios.forEach((s: any) => {
    const desc = (s.descripcion || '').replace(/"/g, '&quot;');
    options += `<option value="s-${s.id}" data-descripcion="${desc}">${s.nombre}</option>`;
  });
  return options;
}

function parseSelectedItem(value: string): DetalleItemIds {
  return {
    id_servicio: value.startsWith('s-') ? parseInt(value.replace('s-', ''), 10) : null,
    id_producto: null,
    id_catalogo_cap_aud: null,
  };
}

export const servicioCotizacionAdapter: CotizacionTipoAdapter = {
  tipo: 'Servicio',
  buildItemOptions,
  getDisabledFieldsState,
  parseSelectedItem,
};
