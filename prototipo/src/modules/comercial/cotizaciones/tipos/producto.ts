import type { CotizacionTipoAdapter, CotizacionTipoData, DisabledFieldsState, DetalleItemIds } from './types';

function getDisabledFieldsState(): DisabledFieldsState {
  return {
    disabledCantidad: '',
    disabledCantidadStyle: '',
    disabledFrecuencia: 'disabled',
    disabledFrecuenciaStyle: 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;',
    disabledModalidad: 'disabled',
    disabledModalidadStyle: 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;',
  };
}

function buildItemOptions(data: CotizacionTipoData): string {
  let options = '<option value="">Seleccione...</option>';
  data.productos.forEach((p: any) => {
    const nombre = p.descripcion || 'Producto';
    const precio = p.precio_unitario || 0;
    options += `<option value="p-${p.id}" data-precio="${precio}">${nombre}</option>`;
  });
  return options;
}

function parseSelectedItem(value: string): DetalleItemIds {
  return {
    id_servicio: null,
    id_producto: value.startsWith('p-') ? parseInt(value.replace('p-', ''), 10) : null,
    id_catalogo_cap_aud: null,
  };
}

export const productoCotizacionAdapter: CotizacionTipoAdapter = {
  tipo: 'Producto',
  buildItemOptions,
  getDisabledFieldsState,
  parseSelectedItem,
};
