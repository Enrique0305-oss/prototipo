// Almacén - Órdenes de Compra View
import './compras.css';
import { ordenCompraService, type OrdenCompra } from './compras.service';
import { proveedorService, type Proveedor } from '../proveedores/proveedores.service';
import { productoService } from '../../../services/productoService';
import { mostrarToast, confirmarAccion } from '../../../shared/toast';
import type { Producto } from '../../../core/api/types';

// ─── Estado del módulo ────────────────────────────────────────────────────────
let ocData: OrdenCompra[] = [];
let proveedoresData: Proveedor[] = [];
let productosData: Producto[] = [];
let ocFilters = { search: '', estado: '', id_proveedor: '' };
let filaDetCount = 0; // contador de filas en form nueva OC

// ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────────
export function renderAlmacenCompras(): string {
  return `
<div style="padding:24px">
  <!-- Header -->
  <div class="prov-page-header">
    <div>
      <div class="prov-breadcrumb">Órdenes de Compra</div>
      <div style="font-size:13px;color:#64748b;margin-top:3px;">Registro de compras a proveedores e integración con Kardex</div>
    </div>
    <div class="prov-actions">
      <button class="prov-btn-secondary" id="oc-btn-refresh">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Actualizar
      </button>
      <button class="prov-btn-primary" id="oc-btn-nueva">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nueva Orden
      </button>
    </div>
  </div>

  <!-- Stats -->
  <div class="prov-stats-bar" id="oc-stats">
    <div class="prov-stat-card">
      <div class="prov-stat-value" id="oc-stat-total">–</div>
      <div class="prov-stat-label">Total Órdenes</div>
    </div>
    <div class="prov-stat-card">
      <div class="prov-stat-value" style="color:#b45309" id="oc-stat-pendientes">–</div>
      <div class="prov-stat-label">Pendientes</div>
    </div>
    <div class="prov-stat-card">
      <div class="prov-stat-value" style="color:#15803d" id="oc-stat-recibidas">–</div>
      <div class="prov-stat-label">Recibidas</div>
    </div>
    <div class="prov-stat-card">
      <div class="prov-stat-value" id="oc-stat-mes">–</div>
      <div class="prov-stat-label">Órdenes este mes</div>
      <div class="prov-stat-sub" id="oc-stat-total-mes"></div>
    </div>
  </div>

  <!-- Filters -->
  <div class="prov-filters-bar">
    <div class="prov-search-box" style="max-width:300px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>
      </svg>
      <input type="text" id="oc-search" placeholder="Buscar por N° OC, cotización, factura..." class="prov-search-input">
    </div>
    <select class="prov-filter-select" id="oc-filter-estado">
      <option value="">Todos los estados</option>
      <option value="Pendiente">Pendiente</option>
      <option value="Recibido">Recibido</option>
      <option value="Anulado">Anulado</option>
    </select>
    <select class="prov-filter-select" id="oc-filter-proveedor">
      <option value="">Todos los proveedores</option>
    </select>
    <input type="date" class="prov-filter-select" id="oc-filter-desde" title="Desde">
    <input type="date" class="prov-filter-select" id="oc-filter-hasta" title="Hasta">
  </div>

  <!-- Tabla -->
  <div class="table-container">
    <table class="op-table">
      <thead>
        <tr>
          <th>N° OC</th>
          <th>N° COTIZ. PROV.</th>
          <th>N° FACTURA</th>
          <th>PROVEEDOR</th>
          <th>FECHA</th>
          <th>ITEMS</th>
          <th>TOTAL</th>
          <th>ESTADO</th>
          <th>ACCIONES</th>
        </tr>
      </thead>
      <tbody id="oc-tbody">
        <tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8">Cargando...</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- MODAL: Nueva/Editar Orden de Compra -->
<div class="prov-modal" id="oc-modal-form" style="display:none">
  <div class="prov-modal-overlay" id="oc-modal-form-overlay"></div>
  <div class="prov-modal-content prov-modal-lg">
    <div class="prov-modal-header">
      <h2 id="oc-modal-form-title">Nueva Orden de Compra</h2>
      <button class="prov-modal-close" id="oc-modal-form-close">×</button>
    </div>
    <div class="prov-modal-body">
      <!-- Sección: Datos generales -->
      <div class="prov-form-section-title">Datos Generales</div>
      <div class="prov-form-row">
        <div class="prov-form-group prov-col-2">
          <label>Proveedor *</label>
          <select class="prov-input" id="oc-form-proveedor" required>
            <option value="">Seleccionar proveedor...</option>
          </select>
        </div>
        <div class="prov-form-group">
          <label>Fecha de Compra *</label>
          <input type="date" class="prov-input" id="oc-form-fecha">
        </div>
      </div>
      <div class="prov-form-row">
        <div class="prov-form-group">
          <label>N° Cotización Proveedor</label>
          <input type="text" class="prov-input" id="oc-form-cotizacion" placeholder="Ej: COT-1014">
        </div>
        <div class="prov-form-group">
          <label>N° Factura</label>
          <input type="text" class="prov-input" id="oc-form-factura" placeholder="Ej: E001-1383">
        </div>
      </div>
      <div class="prov-form-row">
        <div class="prov-form-group">
          <label>Moneda *</label>
          <select class="prov-input" id="oc-form-moneda">
            <option value="PEN">PEN - Soles</option>
            <option value="USD">USD - Dólares</option>
          </select>
        </div>
        <div class="prov-form-group" id="oc-tipo-cambio-wrap" style="display:none">
          <label>Tipo de Cambio (USD→PEN)</label>
          <input type="number" class="prov-input" id="oc-form-tipo-cambio" step="0.01" min="1" value="3.75" placeholder="3.75">
        </div>
        <div class="prov-form-group" style="justify-content:flex-end;padding-top:18px">
          <label style="display:flex;gap:8px;align-items:center;cursor:pointer">
            <input type="checkbox" id="oc-form-igv" checked style="width:16px;height:16px">
            Incluye IGV (18%)
          </label>
        </div>
      </div>
      <div class="prov-form-group" style="margin-bottom:12px">
        <label>Observaciones</label>
        <textarea class="prov-input" id="oc-form-obs" rows="2" placeholder="Notas internas..."></textarea>
      </div>

      <!-- Sección: Detalle de productos -->
      <div class="prov-form-section-title" style="margin-top:12px">Detalle de Productos</div>
      <div style="overflow-x:auto">
        <table class="prov-detail-table" id="oc-detalle-table">
          <thead>
            <tr>
              <th style="min-width:240px">PRODUCTO</th>
              <th style="min-width:90px">CANTIDAD</th>
              <th style="min-width:120px">PRECIO UNIT.</th>
              <th style="min-width:100px">SUBTOTAL</th>
              <th style="width:40px"></th>
            </tr>
          </thead>
          <tbody id="oc-detalle-tbody">
          </tbody>
        </table>
      </div>
      <button type="button" class="prov-btn-secondary" id="oc-btn-add-row" style="margin-top:10px;font-size:12px">
        + Agregar producto
      </button>

      <!-- Totales -->
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <table style="font-size:13px;border-collapse:collapse;min-width:260px">
          <tr>
            <td style="padding:4px 12px;color:#64748b">Subtotal:</td>
            <td style="padding:4px 12px;text-align:right;font-weight:600" id="oc-form-subtotal">S/ 0.00</td>
          </tr>
          <tr id="oc-igv-row">
            <td style="padding:4px 12px;color:#64748b">IGV (18%):</td>
            <td style="padding:4px 12px;text-align:right;font-weight:600" id="oc-form-igv-val">S/ 0.00</td>
          </tr>
          <tr style="border-top:2px solid #e2e8f0">
            <td style="padding:6px 12px;font-weight:700">TOTAL:</td>
            <td style="padding:6px 12px;text-align:right;font-weight:700;font-size:16px;color:#1e3a5f" id="oc-form-total">S/ 0.00</td>
          </tr>
        </table>
      </div>

      <div class="prov-modal-footer">
        <button class="prov-btn-secondary" id="oc-modal-cancel">Cancelar</button>
        <button class="prov-btn-primary" id="oc-modal-save">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Guardar Orden
        </button>
      </div>
    </div>
  </div>
</div>

<!-- MODAL: Detalle de Orden de Compra -->
<div class="prov-modal" id="oc-modal-detalle" style="display:none">
  <div class="prov-modal-overlay" id="oc-modal-detalle-overlay"></div>
  <div class="prov-modal-content prov-modal-lg">
    <div class="prov-modal-header">
      <h2 id="oc-detalle-title">Detalle de Orden</h2>
      <button class="prov-modal-close" id="oc-detalle-close">×</button>
    </div>
    <div class="prov-modal-body" id="oc-detalle-body">
    </div>
  </div>
</div>
`;
}

// ─── INIT EVENTOS ─────────────────────────────────────────────────────────────
export async function initComprasEvents(): Promise<void> {
  // Cargar catálogos en paralelo
  await Promise.all([cargarEstadisticas(), cargarOrdenes(), cargarCatalogos()]);

  // Navegación / filtros
  document.getElementById('oc-btn-refresh')?.addEventListener('click', async () => {
    await Promise.all([cargarEstadisticas(), cargarOrdenes()]);
  });
  document.getElementById('oc-search')?.addEventListener('input', (e) => {
    ocFilters.search = (e.target as HTMLInputElement).value;
    renderTabla();
  });
  document.getElementById('oc-filter-estado')?.addEventListener('change', (e) => {
    ocFilters.estado = (e.target as HTMLSelectElement).value;
    renderTabla();
  });
  document.getElementById('oc-filter-proveedor')?.addEventListener('change', (e) => {
    ocFilters.id_proveedor = (e.target as HTMLSelectElement).value;
    renderTabla();
  });

  // Botón nueva orden
  document.getElementById('oc-btn-nueva')?.addEventListener('click', () => abrirModalForm());

  // Cerrar modal form
  document.getElementById('oc-modal-form-close')?.addEventListener('click', cerrarModalForm);
  document.getElementById('oc-modal-form-overlay')?.addEventListener('click', cerrarModalForm);
  document.getElementById('oc-modal-cancel')?.addEventListener('click', cerrarModalForm);

  // Save
  document.getElementById('oc-modal-save')?.addEventListener('click', guardarOrden);

  // Modal detalle
  document.getElementById('oc-detalle-close')?.addEventListener('click', () => {
    (document.getElementById('oc-modal-detalle') as HTMLElement).style.display = 'none';
  });
  document.getElementById('oc-modal-detalle-overlay')?.addEventListener('click', () => {
    (document.getElementById('oc-modal-detalle') as HTMLElement).style.display = 'none';
  });

  // Moneda toggle
  document.getElementById('oc-form-moneda')?.addEventListener('change', (e) => {
    const v = (e.target as HTMLSelectElement).value;
    const wrap = document.getElementById('oc-tipo-cambio-wrap')!;
    wrap.style.display = v === 'USD' ? '' : 'none';
    actualizarTotales();
  });

  // IGV toggle
  document.getElementById('oc-form-igv')?.addEventListener('change', actualizarTotales);

  // Agregar fila
  document.getElementById('oc-btn-add-row')?.addEventListener('click', () => agregarFila());

  // Filtros de fecha en tiempo real
  document.getElementById('oc-filter-desde')?.addEventListener('change', async () => {
    await cargarOrdenes();
  });
  document.getElementById('oc-filter-hasta')?.addEventListener('change', async () => {
    await cargarOrdenes();
  });
}

// ─── CARGA DE DATOS ───────────────────────────────────────────────────────────
async function cargarEstadisticas() {
  try {
    const res = await ordenCompraService.getEstadisticas();
    if (res.success) {
      const e = res.data;
      const sym = 'S/';
      setText('oc-stat-total', String(e.total));
      setText('oc-stat-pendientes', String(e.pendientes));
      setText('oc-stat-recibidas', String(e.recibidas));
      setText('oc-stat-mes', String(e.ordenes_mes));
      setText('oc-stat-total-mes', `${sym} ${num(e.total_mes)}`);
    }
  } catch { /* silencioso */ }
}

async function cargarOrdenes() {
  const desde = (document.getElementById('oc-filter-desde') as HTMLInputElement | null)?.value;
  const hasta = (document.getElementById('oc-filter-hasta') as HTMLInputElement | null)?.value;
  try {
    const res = await ordenCompraService.getAll({
      fecha_desde: desde || undefined,
      fecha_hasta: hasta || undefined,
    });
    if (res.success) {
      ocData = res.data;
      renderTabla();
    }
  } catch (e) {
    console.error('Error cargando órdenes:', e);
  }
}

async function cargarCatalogos() {
  const [rProv, rProd] = await Promise.all([
    proveedorService.getAll({ estado: 'Activo' }),
    productoService.getAll({ estado: 'Activo' } as any),
  ]);
  if (rProv.success) {
    proveedoresData = rProv.data;
    poblarSelectProveedores();
  }
  if (rProd.success) {
    productosData = rProd.data;
  }
}

function poblarSelectProveedores() {
  // filtro select
  const sel = document.getElementById('oc-filter-proveedor') as HTMLSelectElement | null;
  if (sel) {
    const current = sel.value;
    sel.innerHTML = '<option value="">Todos los proveedores</option>';
    proveedoresData.forEach(p => {
      const o = document.createElement('option');
      o.value = String(p.id);
      o.textContent = p.razon_social;
      sel.appendChild(o);
    });
    sel.value = current;
  }
  // form select
  const selForm = document.getElementById('oc-form-proveedor') as HTMLSelectElement | null;
  if (selForm) {
    const current = selForm.value;
    selForm.innerHTML = '<option value="">Seleccionar proveedor...</option>';
    proveedoresData.forEach(p => {
      const o = document.createElement('option');
      o.value = String(p.id);
      o.textContent = `${p.razon_social}${p.ruc ? ' – ' + p.ruc : ''}`;
      selForm.appendChild(o);
    });
    selForm.value = current;
  }
}

// ─── RENDER TABLA ─────────────────────────────────────────────────────────────
function renderTabla() {
  const tbody = document.getElementById('oc-tbody');
  if (!tbody) return;

  let filtered = [...ocData];
  const q = ocFilters.search.toLowerCase().trim();
  if (q) {
    filtered = filtered.filter(o =>
      (o.numero_orden_compra || '').toLowerCase().includes(q) ||
      (o.numero_cotizacion_proveedor || '').toLowerCase().includes(q) ||
      (o.numero_factura || '').toLowerCase().includes(q) ||
      (o.proveedor?.razon_social || '').toLowerCase().includes(q)
    );
  }
  if (ocFilters.estado) {
    filtered = filtered.filter(o => o.estado === ocFilters.estado);
  }
  if (ocFilters.id_proveedor) {
    filtered = filtered.filter(o => String(o.id_proveedor) === ocFilters.id_proveedor);
  }

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8">
      No se encontraron órdenes de compra
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const monedaSym = o.tipo_moneda === 'USD' ? '$' : 'S/';
    const badgeClass = o.estado === 'Recibido' ? 'prov-badge-recibido'
      : o.estado === 'Anulado' ? 'prov-badge-anulado' : 'prov-badge-pendiente';
    const puedeRecibir = o.estado === 'Pendiente';
    const puedeAnular = o.estado === 'Pendiente';
    return `<tr>
      <td style="font-weight:600;color:#1e3a5f">${o.numero_orden_compra || '–'}</td>
      <td>${o.numero_cotizacion_proveedor || '–'}</td>
      <td>${o.numero_factura || '–'}</td>
      <td>${o.proveedor?.razon_social || '–'}</td>
      <td>${o.fecha_compra ? o.fecha_compra.substring(0,10) : '–'}</td>
      <td style="text-align:center">${o.detalles_count ?? '–'}</td>
      <td style="font-weight:600">${monedaSym} ${num(o.total)}</td>
      <td><span class="prov-badge ${badgeClass}">${o.estado}</span></td>
      <td>
        <div class="prov-actions-cell">
          <button class="prov-btn-icon-sm oc-btn-ver" data-id="${o.id}" title="Ver detalle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          ${puedeRecibir ? `<button class="prov-btn-icon-sm oc-btn-recibir" data-id="${o.id}" title="Marcar como Recibido" style="background:#dcfce7;border-color:#bbf7d0;color:#15803d">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>` : ''}
          ${puedeAnular ? `<button class="prov-btn-icon-sm prov-btn-danger-sm oc-btn-anular" data-id="${o.id}" title="Anular">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');

  bindTableActions();
}

function bindTableActions() {
  // Ver
  document.querySelectorAll<HTMLButtonElement>('.oc-btn-ver').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      abrirDetalle(id);
    });
  });
  // Recibir
  document.querySelectorAll<HTMLButtonElement>('.oc-btn-recibir').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      recibirOrden(id);
    });
  });
  // Anular
  document.querySelectorAll<HTMLButtonElement>('.oc-btn-anular').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      anularOrden(id);
    });
  });
}

// ─── MODAL FORM ───────────────────────────────────────────────────────────────
let editingOcId: number | null = null;

function abrirModalForm(oc?: OrdenCompra) {
  editingOcId = oc ? oc.id : null;
  const modal = document.getElementById('oc-modal-form') as HTMLElement;
  const title = document.getElementById('oc-modal-form-title')!;
  title.textContent = oc ? `Editar Orden ${oc.numero_orden_compra}` : 'Nueva Orden de Compra';

  // Reset form
  (document.getElementById('oc-form-proveedor') as HTMLSelectElement).value = oc ? String(oc.id_proveedor) : '';
  (document.getElementById('oc-form-fecha') as HTMLInputElement).value = oc ? oc.fecha_compra.substring(0,10) : hoy();
  (document.getElementById('oc-form-cotizacion') as HTMLInputElement).value = oc?.numero_cotizacion_proveedor || '';
  (document.getElementById('oc-form-factura') as HTMLInputElement).value = oc?.numero_factura || '';
  (document.getElementById('oc-form-moneda') as HTMLSelectElement).value = oc ? oc.tipo_moneda : 'PEN';
  (document.getElementById('oc-form-tipo-cambio') as HTMLInputElement).value = oc?.tipo_cambio ? String(oc.tipo_cambio) : '3.75';
  (document.getElementById('oc-form-igv') as HTMLInputElement).checked = oc ? oc.tiene_igv : true;
  (document.getElementById('oc-form-obs') as HTMLTextAreaElement).value = oc?.observaciones || '';

  const tipoCambioWrap = document.getElementById('oc-tipo-cambio-wrap')!;
  tipoCambioWrap.style.display = (!oc || oc.tipo_moneda === 'USD') ? '' : 'none';
  if (oc?.tipo_moneda !== 'USD') tipoCambioWrap.style.display = 'none';

  // Llenar select proveedores
  const selProv = document.getElementById('oc-form-proveedor') as HTMLSelectElement;
  selProv.innerHTML = '<option value="">Seleccionar proveedor...</option>';
  proveedoresData.forEach(p => {
    const o = document.createElement('option');
    o.value = String(p.id);
    o.textContent = `${p.razon_social}${p.ruc ? ' – ' + p.ruc : ''}`;
    selProv.appendChild(o);
  });
  if (oc) selProv.value = String(oc.id_proveedor);

  // Filas de detalle
  filaDetCount = 0;
  const tbody = document.getElementById('oc-detalle-tbody')!;
  tbody.innerHTML = '';
  if (oc?.detalles?.length) {
    oc.detalles.forEach(d => agregarFila(d.id_producto, d.cantidad, d.precio_unitario));
  } else {
    agregarFila();
  }

  actualizarTotales();
  modal.style.display = 'flex';
}

function cerrarModalForm() {
  (document.getElementById('oc-modal-form') as HTMLElement).style.display = 'none';
  editingOcId = null;
}

function agregarFila(idProducto?: number, cantidad?: number, precio?: number) {
  const tbody = document.getElementById('oc-detalle-tbody')!;
  const idx = ++filaDetCount;
  const optionsProd = productosData.map(p =>
    `<option value="${p.id}" ${idProducto === p.id ? 'selected' : ''}>${p.descripcion}${p.sku ? ' [' + p.sku + ']' : ''}</option>`
  ).join('');

  const tr = document.createElement('tr');
  tr.dataset.rowIdx = String(idx);
  tr.innerHTML = `
    <td>
      <select class="prov-input-sm oc-det-producto" data-row="${idx}">
        <option value="">Seleccionar...</option>
        ${optionsProd}
      </select>
    </td>
    <td>
      <input type="number" class="prov-input-sm oc-det-cantidad" data-row="${idx}" min="1" value="${cantidad ?? 1}" step="1">
    </td>
    <td>
      <input type="number" class="prov-input-sm oc-det-precio" data-row="${idx}" min="0" step="0.01" value="${precio ?? ''}">
    </td>
    <td class="oc-det-subtotal-cell" data-row="${idx}">0.00</td>
    <td>
      <button type="button" class="prov-btn-icon-sm prov-btn-danger-sm oc-det-remove" data-row="${idx}" title="Quitar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
  bindFilaEvents(tr, idx);
  calcularSubtotalFila(idx);
}

function bindFilaEvents(tr: HTMLTableRowElement, idx: number) {
  tr.querySelector<HTMLInputElement>('.oc-det-cantidad')?.addEventListener('input', () => {
    calcularSubtotalFila(idx);
    actualizarTotales();
  });
  tr.querySelector<HTMLInputElement>('.oc-det-precio')?.addEventListener('input', () => {
    calcularSubtotalFila(idx);
    actualizarTotales();
  });
  tr.querySelector<HTMLButtonElement>('.oc-det-remove')?.addEventListener('click', () => {
    tr.remove();
    actualizarTotales();
  });
}

function calcularSubtotalFila(idx: number) {
  const cant = parseFloat((document.querySelector<HTMLInputElement>(`.oc-det-cantidad[data-row="${idx}"]`)?.value) || '0');
  const precio = parseFloat((document.querySelector<HTMLInputElement>(`.oc-det-precio[data-row="${idx}"]`)?.value) || '0');
  const sub = cant * precio;
  const cell = document.querySelector<HTMLTableCellElement>(`.oc-det-subtotal-cell[data-row="${idx}"]`);
  if (cell) cell.textContent = num(sub);
}

function actualizarTotales() {
  const cantidades = Array.from(document.querySelectorAll<HTMLInputElement>('.oc-det-cantidad'));
  const precios = Array.from(document.querySelectorAll<HTMLInputElement>('.oc-det-precio'));
  let subtotal = 0;
  cantidades.forEach((c, i) => {
    const cant = parseFloat(c.value || '0');
    const prec = parseFloat(precios[i]?.value || '0');
    subtotal += cant * prec;
  });

  const tieneIgv = (document.getElementById('oc-form-igv') as HTMLInputElement)?.checked;
  const moneda = (document.getElementById('oc-form-moneda') as HTMLSelectElement)?.value || 'PEN';
  const sym = moneda === 'USD' ? '$' : 'S/';
  const igv = tieneIgv ? subtotal * 0.18 : 0;
  const total = subtotal + igv;

  setText('oc-form-subtotal', `${sym} ${num(subtotal)}`);
  setText('oc-form-igv-val', `${sym} ${num(igv)}`);
  setText('oc-form-total', `${sym} ${num(total)}`);

  const igvRow = document.getElementById('oc-igv-row');
  if (igvRow) igvRow.style.display = tieneIgv ? '' : 'none';
}

// ─── GUARDAR ──────────────────────────────────────────────────────────────────
async function guardarOrden() {
  const idProv = parseInt((document.getElementById('oc-form-proveedor') as HTMLSelectElement).value);
  const fecha = (document.getElementById('oc-form-fecha') as HTMLInputElement).value;
  if (!idProv) { mostrarToast('warning', 'Campo requerido', 'Seleccione un proveedor'); return; }
  if (!fecha) { mostrarToast('warning', 'Campo requerido', 'Ingrese la fecha de compra'); return; }

  // Recopilar detalles
  const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>('#oc-detalle-tbody tr'));
  const detalles: Array<{id_producto: number; cantidad: number; precio_unitario: number}> = [];
  for (const row of rows) {
    const idx = row.dataset.rowIdx!;
    const idProd = parseInt((document.querySelector<HTMLSelectElement>(`.oc-det-producto[data-row="${idx}"]`)?.value) || '0');
    const cant = parseFloat((document.querySelector<HTMLInputElement>(`.oc-det-cantidad[data-row="${idx}"]`)?.value) || '0');
    const precio = parseFloat((document.querySelector<HTMLInputElement>(`.oc-det-precio[data-row="${idx}"]`)?.value) || '0');
    if (!idProd) { mostrarToast('warning', 'Detalle incompleto', 'Seleccione un producto en cada fila'); return; }
    if (cant <= 0) { mostrarToast('warning', 'Cantidad inválida', 'La cantidad debe ser mayor a 0'); return; }
    if (precio <= 0) { mostrarToast('warning', 'Precio inválido', 'El precio debe ser mayor a 0'); return; }
    detalles.push({ id_producto: idProd, cantidad: cant, precio_unitario: precio });
  }
  if (!detalles.length) { mostrarToast('warning', 'Sin productos', 'Agregue al menos un producto'); return; }

  const moneda = (document.getElementById('oc-form-moneda') as HTMLSelectElement).value;
  const payload: Record<string, any> = {
    id_proveedor: idProv,
    fecha_compra: fecha,
    numero_cotizacion_proveedor: (document.getElementById('oc-form-cotizacion') as HTMLInputElement).value || null,
    numero_factura: (document.getElementById('oc-form-factura') as HTMLInputElement).value || null,
    tipo_moneda: moneda,
    tipo_cambio: moneda === 'USD' ? parseFloat((document.getElementById('oc-form-tipo-cambio') as HTMLInputElement).value) : null,
    tiene_igv: (document.getElementById('oc-form-igv') as HTMLInputElement).checked,
    observaciones: (document.getElementById('oc-form-obs') as HTMLTextAreaElement).value || null,
    detalles,
  };

  const btn = document.getElementById('oc-modal-save') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    let res;
    if (editingOcId) {
      res = await ordenCompraService.update(editingOcId, payload);
    } else {
      res = await ordenCompraService.create(payload);
    }
    if (res.success) {
      mostrarToast('success', editingOcId ? 'Orden Actualizada' : 'Orden Creada',
        `Se ${editingOcId ? 'actualizó' : 'registró'} la orden ${res.data?.numero_orden_compra || ''} exitosamente`);
      cerrarModalForm();
      await Promise.all([cargarEstadisticas(), cargarOrdenes()]);
    }
  } catch (e: any) {
    console.error(e);
    const msg = e?.data?.message || 'No se pudo guardar la orden';
    mostrarToast('error', 'Error', msg);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar Orden';
  }
}

// ─── RECIBIR ORDEN ────────────────────────────────────────────────────────────
async function recibirOrden(id: number) {
  const oc = ocData.find(o => o.id === id);
  const ok = await confirmarAccion({
    titulo: 'Recibir Orden',
    mensaje: `¿Confirma la recepción de la orden <strong>${oc?.numero_orden_compra || ''}</strong>? Se actualizará el inventario (Kardex) con los productos de esta orden.`,
    tipo: 'success',
    textoConfirmar: 'Sí, recibir',
  });
  if (!ok) return;
  try {
    const res = await ordenCompraService.recibir(id, hoy());
    if (res.success) {
      mostrarToast('success', 'Orden Recibida', 'La orden fue marcada como recibida y el Kardex fue actualizado');
      await Promise.all([cargarEstadisticas(), cargarOrdenes()]);
    }
  } catch (e: any) {
    const msg = e?.data?.message || 'No se pudo recibir la orden';
    mostrarToast('error', 'Error', msg);
  }
}

// ─── ANULAR ORDEN ─────────────────────────────────────────────────────────────
async function anularOrden(id: number) {
  const oc = ocData.find(o => o.id === id);
  const ok = await confirmarAccion({
    titulo: 'Anular Orden',
    mensaje: `¿Está seguro de anular la orden <strong>${oc?.numero_orden_compra || ''}</strong>? Esta acción no se puede deshacer.`,
    tipo: 'warning',
    textoConfirmar: 'Sí, anular',
  });
  if (!ok) return;
  try {
    const res = await ordenCompraService.anular(id);
    if (res.success) {
      mostrarToast('success', 'Orden Anulada', 'La orden fue anulada correctamente');
      await Promise.all([cargarEstadisticas(), cargarOrdenes()]);
    }
  } catch (e: any) {
    const msg = e?.data?.message || 'No se pudo anular la orden';
    mostrarToast('error', 'Error', msg);
  }
}

// ─── DETALLE MODAL ────────────────────────────────────────────────────────────
async function abrirDetalle(id: number) {
  const modal = document.getElementById('oc-modal-detalle') as HTMLElement;
  const body = document.getElementById('oc-detalle-body')!;
  const title = document.getElementById('oc-detalle-title')!;
  body.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8">Cargando...</div>';
  modal.style.display = 'flex';

  try {
    const res = await ordenCompraService.getById(id);
    if (!res.success) { body.innerHTML = '<p>Error al cargar detalle</p>'; return; }
    const o = res.data;
    title.textContent = `Orden ${o.numero_orden_compra || '–'}`;
    const sym = o.tipo_moneda === 'USD' ? '$' : 'S/';
    const badgeClass = o.estado === 'Recibido' ? 'prov-badge-recibido'
      : o.estado === 'Anulado' ? 'prov-badge-anulado' : 'prov-badge-pendiente';

    body.innerHTML = `
      <div class="prov-detalle-grid">
        <div class="prov-detalle-section">
          <div class="prov-detalle-section-title">Información General</div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">N° OC:</span><span class="prov-detalle-value">${o.numero_orden_compra || '–'}</span></div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">N° Cotiz. Prov:</span><span class="prov-detalle-value">${o.numero_cotizacion_proveedor || '–'}</span></div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">N° Factura:</span><span class="prov-detalle-value">${o.numero_factura || '–'}</span></div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">Estado:</span><span class="prov-detalle-value"><span class="prov-badge ${badgeClass}">${o.estado}</span></span></div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">Fecha Compra:</span><span class="prov-detalle-value">${o.fecha_compra ? o.fecha_compra.substring(0,10) : '–'}</span></div>
          ${o.fecha_recepcion ? `<div class="prov-detalle-row"><span class="prov-detalle-label">Fecha Recepción:</span><span class="prov-detalle-value">${o.fecha_recepcion.substring(0,10)}</span></div>` : ''}
        </div>
        <div class="prov-detalle-section">
          <div class="prov-detalle-section-title">Proveedor</div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">Razón Social:</span><span class="prov-detalle-value">${o.proveedor?.razon_social || '–'}</span></div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">RUC:</span><span class="prov-detalle-value">${o.proveedor?.ruc || '–'}</span></div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">Contacto:</span><span class="prov-detalle-value">${o.proveedor?.contacto_nombre || '–'}</span></div>
          <div class="prov-detalle-row"><span class="prov-detalle-label">Teléfono:</span><span class="prov-detalle-value">${o.proveedor?.contacto_telefono || '–'}</span></div>
        </div>
        <div class="prov-detalle-section full">
          <div class="prov-detalle-section-title">Productos</div>
          <table class="prov-detail-table">
            <thead>
              <tr>
                <th>PRODUCTO</th><th>CANT.</th><th>PRECIO UNIT.</th><th>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${(o.detalles || []).map(d => `
                <tr>
                  <td>${d.producto?.descripcion || `Prod. #${d.id_producto}`}</td>
                  <td>${d.cantidad}</td>
                  <td>${sym} ${num(d.precio_unitario)}</td>
                  <td>${sym} ${num(d.subtotal ?? d.cantidad * d.precio_unitario)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align:right">Subtotal:</td>
                <td>${sym} ${num(o.subtotal)}</td>
              </tr>
              ${o.tiene_igv ? `<tr><td colspan="3" style="text-align:right">IGV (18%):</td><td>${sym} ${num(o.igv)}</td></tr>` : ''}
              <tr>
                <td colspan="3" style="text-align:right;font-size:15px">TOTAL:</td>
                <td style="font-size:15px;color:#1e3a5f">${sym} ${num(o.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${o.observaciones ? `<div class="prov-detalle-section full">
          <div class="prov-detalle-section-title">Observaciones</div>
          <p style="font-size:13px;color:#374151;margin:0">${o.observaciones}</p>
        </div>` : ''}
      </div>
      <div class="prov-modal-footer" style="margin-top:20px">
        ${o.estado === 'Pendiente' ? `
          <button class="prov-btn-danger" id="oc-detalle-anular" data-id="${o.id}">Anular</button>
          <button class="prov-btn-success" id="oc-detalle-recibir" data-id="${o.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Marcar como Recibido
          </button>
        ` : ''}
        <button class="prov-btn-secondary" id="oc-detalle-cerrar-btn">Cerrar</button>
      </div>
    `;

    // Bind acciones del modal detalle
    document.getElementById('oc-detalle-cerrar-btn')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    document.getElementById('oc-detalle-recibir')?.addEventListener('click', async () => {
      modal.style.display = 'none';
      await recibirOrden(o.id);
    });
    document.getElementById('oc-detalle-anular')?.addEventListener('click', async () => {
      modal.style.display = 'none';
      await anularOrden(o.id);
    });

  } catch (e) {
    console.error(e);
    body.innerHTML = '<p style="color:#dc2626;text-align:center;padding:20px">Error al cargar el detalle</p>';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function num(v: number | null | undefined): string {
  return (v ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function setText(id: string, val: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function hoy(): string {
  return new Date().toISOString().substring(0, 10);
}
