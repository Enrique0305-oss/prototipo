import { productoService } from '../../../services/productoService';
import { categoriaService } from '../../../services/categoriaService';
import { mostrarToast } from '../../../shared/toast';
import { kardexService, type KardexMovimiento } from '../../../services/kardexService';
import { inventarioAjusteService, type InventarioAjuste } from '../../../services/inventarioAjusteService';
import type { Producto, EstadisticasProductos, Categoria } from '../../../core/api/types';

// Estado global para el módulo de inventario
let productosData: Producto[] = [];
let estadisticasData: EstadisticasProductos | null = null;
let categoriasData: Categoria[] = [];
let currentFilters = {
  search: '',
  estado: '',
  id_categoria: null as number | null,
};

const UNIDAD_OPTIONS = [
  'Mililitros',
  'Miligramos',
  'Kilogramos',
  'Unidades',
  'Unidad',
  'Par',
  'Cajas',
  'Galones',
  'Gramos',
  'Rodajas',
];

function renderUnidadOptions(selectedValue = ''): string {
  const unidades = selectedValue && !UNIDAD_OPTIONS.includes(selectedValue)
    ? [...UNIDAD_OPTIONS, selectedValue]
    : UNIDAD_OPTIONS;

  return unidades.map((unidad) => {
    const selected = unidad === selectedValue ? 'selected' : '';
    return `<option value="${unidad}" ${selected}>${unidad}</option>`;
  }).join('');
}

// Vista de Productos (Tab 1)
export function renderProductosTab() {
  return `

    <div class="stats-row" id="productos-stats" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Stock Disponible</div>
          <div class="stat-box-value"><span class="loading-text">Cargando...</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Inventario Total</div>
          <div class="stat-box-value"><span class="loading-text">Cargando...</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Stock Bajo</div>
          <div class="stat-box-value"><span class="loading-text">Cargando...</span></div>
        </div>
      </div>
    </div>

    <!-- Filters -->
      <div class="op-filters-bar">
        <div class="op-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" id="productos-search" placeholder="Buscar por nombre, SKU o ID..." class="op-search-input">
        </div>

        <div class="op-filter-group">
          <select class="op-filter-select" id="productos-estado-filter">
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <select class="op-filter-select" id="productos-stock-filter">
            <option value="">Todo el stock</option>
            <option value="con_stock">Con Stock</option>
            <option value="proximos_vencer">Próximos a Vencer</option>
          </select>

          <select class="op-filter-select" id="productos-categoria-filter">
            <option value="">Todas las categorías</option>
          </select>
        </div>
      </div>

    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>PRODUCTO</th>
            <th>CATEGORÍA</th>
            <th>STOCK ACTUAL</th>
            <th>STOCK SEGURIDAD</th>
            <th>UNIDAD</th>
            <th>PRECIO UNIT.</th>
            <th>VALOR TOTAL</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="productos-table-body">
          <tr>
            <td colspan="9" style="text-align: center; padding: 40px;">
              <div class="loading-text">Cargando productos...</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" id="productos-pagination">
      <span class="pagination-info">Cargando...</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn" disabled>Siguiente</button>
      </div>
    </div>
  `;
}

// Vista de Kardex (Tab 2)
export function renderKardexTab() {
  return `
    <div class="stats-row" id="kardex-stats" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Movimientos</div>
          <div class="stat-box-value" id="kardex-total">—</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Entradas (Mes)</div>
          <div class="stat-box-value" id="kardex-entradas">—</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Salidas (Mes)</div>
          <div class="stat-box-value" id="kardex-salidas">—</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Movimientos Hoy</div>
          <div class="stat-box-value" id="kardex-hoy">—</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="op-filters-bar">
      <div class="op-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" id="kardex-search" placeholder="Buscar por producto o motivo..." class="op-search-input">
      </div>

      <div class="op-filter-group">
        <select class="op-filter-select" id="kardex-tipo-filter">
          <option value="">Todos los tipos</option>
          <option value="Entrada">Entradas</option>
          <option value="Salida">Salidas</option>
        </select>

        <input type="date" id="kardex-fecha-desde" class="op-filter-select" title="Fecha desde">
        <input type="date" id="kardex-fecha-hasta" class="op-filter-select" title="Fecha hasta">

        <button class="btn-primary" id="btn-buscar-kardex" style="padding: 8px 16px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          Buscar
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="op-table kardex-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>PRODUCTO</th>
            <th>TIPO</th>
            <th>CANTIDAD</th>
            <th>STOCK ANT.</th>
            <th>STOCK POST.</th>
            <th>MOTIVO</th>
            <th>REFERENCIA</th>
            <th>USUARIO</th>
          </tr>
        </thead>
        <tbody id="kardex-table-body">
          <tr>
            <td colspan="9" style="text-align: center; padding: 40px;">
              <div class="loading-text">Cargando movimientos...</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" id="kardex-pagination">
      <span class="pagination-info" id="kardex-pagination-info">—</span>
    </div>
  `;
}

// Vista de Ajuste de Inventario (Tab 3)
export function renderAjustesInventarioTab() {
  return `
    <div id="ajuste-inv-root" style="display:grid; grid-template-columns:1fr; gap:16px;">
      <div>
        <h3 style="margin:0; font-size:18px; color:#1f2937;">Ajuste de Inventario</h3>
        <p style="margin:4px 0 0; font-size:13px; color:#64748b;">Modifica stock actual y consulta historial auditado de ajustes.</p>
      </div>

      <div style="display:flex; gap:8px; border-bottom:1px solid #e5e7eb; padding-bottom:8px;">
        <button id="btn-tab-ajuste-form" type="button" style="padding:8px 14px; border:1px solid #2563eb; background:#2563eb; color:#fff; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">
          Ajustar Stock
        </button>
        <button id="btn-tab-ajuste-historial" type="button" style="padding:8px 14px; border:1px solid #d1d5db; background:#fff; color:#475569; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">
          Historial de Ajustes
        </button>
      </div>

      <div id="tab-ajuste-form" class="table-container" style="padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px; flex-wrap:wrap;">
          <h3 style="margin:0; font-size:16px; color:#1f2937;">Ajustar Stock Actual</h3>
          <div class="op-search-box" style="max-width:420px; width:100%;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" id="ajuste-inv-search" placeholder="Buscar producto por descripción o SKU..." class="op-search-input">
          </div>
        </div>

        <table class="op-table">
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>CATEGORÍA</th>
              <th>STOCK ACTUAL</th>
              <th>STOCK SEGURIDAD</th>
              <th>ACCIÓN</th>
            </tr>
          </thead>
          <tbody id="ajuste-inv-productos-body">
            <tr>
              <td colspan="5" style="text-align:center; padding:32px; color:#94a3b8;">Cargando productos...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="tab-ajuste-historial" class="table-container" style="padding:20px; display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px; flex-wrap:wrap;">
          <h3 style="margin:0; font-size:16px; color:#1f2937;">Historial de Ajustes</h3>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="date" id="ajuste-inv-fecha-desde" class="op-filter-select" title="Desde">
            <input type="date" id="ajuste-inv-fecha-hasta" class="op-filter-select" title="Hasta">
            <button class="btn-primary" id="btn-filtrar-ajustes" style="padding:8px 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
              Filtrar
            </button>
          </div>
        </div>

        <table class="op-table">
          <thead>
            <tr>
              <th>FECHA</th>
              <th>PRODUCTO</th>
              <th>TIPO</th>
              <th>STOCK ANT.</th>
              <th>STOCK NUEVO</th>
              <th>DIFERENCIA</th>
              <th>MOTIVO</th>
              <th>REFERENCIA</th>
              <th>USUARIO</th>
            </tr>
          </thead>
          <tbody id="ajuste-inv-historial-body">
            <tr>
              <td colspan="9" style="text-align:center; padding:32px; color:#94a3b8;">Cargando historial...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="modal-ajuste-inventario" class="modal-overlay" style="display:none;">
      <div class="modal-container" style="max-width:560px;">
        <div class="modal-header">
          <h2>Ajuste de Inventario</h2>
          <button class="modal-close" id="btn-cerrar-ajuste-inv">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="form-ajuste-inventario" class="modal-body">
          <input type="hidden" id="ajuste-inv-id-producto">
          <div class="form-group">
            <label>Producto</label>
            <input type="text" id="ajuste-inv-producto" class="form-input" readonly>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Stock actual</label>
              <input type="number" id="ajuste-inv-stock-actual" class="form-input" readonly>
            </div>
            <div class="form-group">
              <label>Stock nuevo *</label>
              <input type="number" id="ajuste-inv-stock-nuevo" class="form-input" min="0" required>
            </div>
          </div>
          <div class="form-group">
            <label>Motivo *</label>
            <select id="ajuste-inv-motivo" class="form-input" required>
              <option value="">Seleccionar motivo</option>
              <option value="Conteo físico">Conteo físico</option>
              <option value="Merma">Merma</option>
              <option value="Regularización">Regularización</option>
              <option value="Devolución interna">Devolución interna</option>
              <option value="Corrección administrativa">Corrección administrativa</option>
            </select>
          </div>
          <div class="form-group">
            <label>Observación</label>
            <textarea id="ajuste-inv-observacion" class="form-input" rows="3" placeholder="Detalle del ajuste (opcional)"></textarea>
          </div>
          <div style="padding:10px 12px; border-radius:8px; background:#fff7ed; color:#9a3412; font-size:12px; border:1px solid #fed7aa;">
            Este cambio actualiza stock inmediatamente y quedará registrado en Kardex como Entrada/Salida con referencia Ajuste de Inventario.
          </div>
          <div class="modal-footer" style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="btn-secondary" id="btn-cancelar-ajuste-inv">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Ajuste</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-confirmar-ajuste-inv" class="modal-overlay" style="display:none;">
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h2>Confirmar Ajuste</h2>
          <button class="modal-close" id="btn-cerrar-confirm-ajuste-inv">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p id="confirm-ajuste-inv-mensaje" style="margin:0; font-size:15px; color:#1f2937; line-height:1.5;"></p>
          <div class="modal-footer" style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="btn-secondary" id="btn-cancelar-confirm-ajuste-inv">Cancelar</button>
            <button type="button" class="btn-primary" id="btn-aceptar-confirm-ajuste-inv">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Estado local de Kardex
let kardexData: KardexMovimiento[] = [];
let ajusteInvProductos: Producto[] = [];
let ajusteInvHistorial: InventarioAjuste[] = [];

export async function initKardexEvents() {
  // Cargar estadísticas y movimientos en paralelo
  await Promise.all([
    loadKardexEstadisticas(),
    loadKardexMovimientos(),
  ]);

  // Event listeners para filtros
  const btnBuscar = document.getElementById('btn-buscar-kardex');
  if (btnBuscar) {
    btnBuscar.addEventListener('click', () => loadKardexMovimientos());
  }

  // Enter en campo de búsqueda
  const searchInput = document.getElementById('kardex-search') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loadKardexMovimientos();
    });
  }
}

async function loadKardexEstadisticas() {
  try {
    const res = await kardexService.getEstadisticas();
    if (res.success) {
      const s = res.data;
      const setVal = (id: string, val: string | number) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(val);
      };
      setVal('kardex-total', s.total_movimientos);
      setVal('kardex-entradas', s.entradas_mes);
      setVal('kardex-salidas', s.salidas_mes);
      setVal('kardex-hoy', s.movimientos_hoy);
    }
  } catch (err) {
    console.error('Error cargando estadísticas kardex:', err);
  }
}

async function loadKardexMovimientos() {
  const tbody = document.getElementById('kardex-table-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;"><div class="loading-text">Cargando movimientos...</div></td></tr>`;

  // Recoger filtros
  const search = (document.getElementById('kardex-search') as HTMLInputElement)?.value || '';
  const tipo = (document.getElementById('kardex-tipo-filter') as HTMLSelectElement)?.value || '';
  const fechaDesde = (document.getElementById('kardex-fecha-desde') as HTMLInputElement)?.value || '';
  const fechaHasta = (document.getElementById('kardex-fecha-hasta') as HTMLInputElement)?.value || '';

  const filtros: Record<string, string> = {};
  if (tipo) filtros.tipo_movimiento = tipo;
  if (fechaDesde) filtros.fecha_desde = fechaDesde;
  if (fechaHasta) filtros.fecha_hasta = fechaHasta;
  if (search) filtros.motivo = search;

  try {
    const res = await kardexService.getAll(filtros as any);

    if (res.success) {
      kardexData = res.data;
      renderKardexRows(kardexData);
    }
  } catch (err) {
    console.error('Error cargando kardex:', err);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar movimientos</td></tr>`;
  }
}

function renderKardexRows(movimientos: KardexMovimiento[]) {
  const tbody = document.getElementById('kardex-table-body');
  if (!tbody) return;

  if (movimientos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:#64748b;">No se encontraron movimientos de kardex</td></tr>`;
    const infoEl = document.getElementById('kardex-pagination-info');
    if (infoEl) infoEl.textContent = '0 movimientos';
    return;
  }

  tbody.innerHTML = movimientos.map(mov => {
    const fecha = new Date(mov.fecha_movimiento).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const tipoClass = mov.tipo_movimiento === 'Entrada' ? 'green' : 'orange';
    const cantSign = mov.tipo_movimiento === 'Entrada' ? '+' : '-';
    const cantClass = mov.tipo_movimiento === 'Entrada' ? 'entrada' : 'salida';

    return `
      <tr>
        <td>${fecha}</td>
        <td>${mov.producto}</td>
        <td><span class="badge ${tipoClass}">${mov.tipo_movimiento}</span></td>
        <td class="${cantClass}">${cantSign}${mov.cantidad}</td>
        <td>${mov.stock_anterior}</td>
        <td>${mov.stock_posterior}</td>
        <td>${mov.motivo}</td>
        <td>${mov.referencia || '—'}</td>
        <td>${mov.usuario}</td>
      </tr>
    `;
  }).join('');

  const infoEl = document.getElementById('kardex-pagination-info');
  if (infoEl) infoEl.textContent = `Mostrando ${movimientos.length} movimiento${movimientos.length !== 1 ? 's' : ''}`;
}

export async function initAjustesInventarioEvents() {
  const root = document.getElementById('ajuste-inv-root') as HTMLElement | null;
  if (!root) return;
  if (root.dataset.initialized === '1') return;
  root.dataset.initialized = '1';

  await Promise.all([
    cargarProductosAjusteInventario(),
    cargarHistorialAjustesInventario(),
  ]);

  const tabForm = document.getElementById('tab-ajuste-form') as HTMLElement;
  const tabHistorial = document.getElementById('tab-ajuste-historial') as HTMLElement;
  const btnTabForm = document.getElementById('btn-tab-ajuste-form') as HTMLButtonElement;
  const btnTabHistorial = document.getElementById('btn-tab-ajuste-historial') as HTMLButtonElement;

  const activarTabAjuste = (tab: 'form' | 'historial') => {
    const formActiva = tab === 'form';
    if (tabForm) tabForm.style.display = formActiva ? 'block' : 'none';
    if (tabHistorial) tabHistorial.style.display = formActiva ? 'none' : 'block';

    if (btnTabForm) {
      btnTabForm.style.background = formActiva ? '#2563eb' : '#fff';
      btnTabForm.style.color = formActiva ? '#fff' : '#475569';
      btnTabForm.style.borderColor = formActiva ? '#2563eb' : '#d1d5db';
    }

    if (btnTabHistorial) {
      btnTabHistorial.style.background = !formActiva ? '#2563eb' : '#fff';
      btnTabHistorial.style.color = !formActiva ? '#fff' : '#475569';
      btnTabHistorial.style.borderColor = !formActiva ? '#2563eb' : '#d1d5db';
    }
  };

  btnTabForm?.addEventListener('click', () => activarTabAjuste('form'));
  btnTabHistorial?.addEventListener('click', () => activarTabAjuste('historial'));

  // Estado inicial: formulario de ajuste
  activarTabAjuste('form');

  const searchInput = document.getElementById('ajuste-inv-search') as HTMLInputElement;
  if (searchInput) {
    let searchTimer: number;
    searchInput.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        renderProductosAjusteInventario(searchInput.value.trim());
      }, 300);
    });
  }

  document.getElementById('btn-filtrar-ajustes')?.addEventListener('click', async () => {
    await cargarHistorialAjustesInventario();
  });

  const modal = document.getElementById('modal-ajuste-inventario');
  document.getElementById('btn-cerrar-ajuste-inv')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
  document.getElementById('btn-cancelar-ajuste-inv')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  document.getElementById('form-ajuste-inventario')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idProducto = Number((document.getElementById('ajuste-inv-id-producto') as HTMLInputElement).value);
    const stockActual = Number((document.getElementById('ajuste-inv-stock-actual') as HTMLInputElement).value);
    const stockNuevo = Number((document.getElementById('ajuste-inv-stock-nuevo') as HTMLInputElement).value);
    const motivo = (document.getElementById('ajuste-inv-motivo') as HTMLSelectElement).value;
    const observacion = (document.getElementById('ajuste-inv-observacion') as HTMLTextAreaElement).value.trim();
    const submitBtn = (e.currentTarget as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement | null;

    if (!idProducto || !motivo || Number.isNaN(stockNuevo) || stockNuevo < 0) {
      mostrarToast('warning', 'Atención', 'Complete los campos obligatorios del ajuste');
      return;
    }

    if (stockNuevo === stockActual) {
      mostrarToast('warning', 'Sin cambios', 'El stock nuevo debe ser diferente al stock actual');
      return;
    }

    const tipo = stockNuevo > stockActual ? 'Entrada' : 'Salida';
    const diferencia = Math.abs(stockNuevo - stockActual);
    const confirmar = await confirmarAjusteInventario(tipo, diferencia);
    if (!confirmar) return;

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';
      }

      await inventarioAjusteService.crear({
        id_producto: idProducto,
        stock_nuevo: stockNuevo,
        motivo,
        observacion: observacion || undefined,
      });

      mostrarToast('success', 'Ajuste registrado', 'El stock fue actualizado y auditado correctamente');

      if (modal) modal.style.display = 'none';
      (document.getElementById('form-ajuste-inventario') as HTMLFormElement).reset();

      await Promise.all([
        cargarProductosAjusteInventario(),
        cargarHistorialAjustesInventario(),
      ]);
    } catch (error: any) {
      const message = error?.message || error?.data?.message || 'Error al registrar ajuste de inventario';
      mostrarToast('error', 'Error', String(message));
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Ajuste';
      }
    }
  });
}

function confirmarAjusteInventario(tipo: 'Entrada' | 'Salida', diferencia: number): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = document.getElementById('modal-confirmar-ajuste-inv');
    const mensaje = document.getElementById('confirm-ajuste-inv-mensaje');
    const btnAceptar = document.getElementById('btn-aceptar-confirm-ajuste-inv') as HTMLButtonElement | null;
    const btnCancelar = document.getElementById('btn-cancelar-confirm-ajuste-inv') as HTMLButtonElement | null;
    const btnCerrar = document.getElementById('btn-cerrar-confirm-ajuste-inv') as HTMLButtonElement | null;

    if (!modal || !mensaje || !btnAceptar || !btnCancelar || !btnCerrar) {
      resolve(true);
      return;
    }

    mensaje.textContent = `Se registrará un ajuste de ${tipo} por ${diferencia} unidad(es). ¿Desea continuar?`;
    modal.style.display = 'flex';

    const cerrar = (ok: boolean) => {
      modal.style.display = 'none';
      btnAceptar.onclick = null;
      btnCancelar.onclick = null;
      btnCerrar.onclick = null;
      modal.onclick = null;
      resolve(ok);
    };

    btnAceptar.onclick = () => cerrar(true);
    btnCancelar.onclick = () => cerrar(false);
    btnCerrar.onclick = () => cerrar(false);
    modal.onclick = (e) => {
      if (e.target === modal) cerrar(false);
    };
  });
}

async function cargarProductosAjusteInventario() {
  const tbody = document.getElementById('ajuste-inv-productos-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:28px; color:#94a3b8;">Cargando productos...</td></tr>';

  try {
    const response = await productoService.getAll({ estado: 'Activo' } as any);
    ajusteInvProductos = response?.data || [];
    const search = (document.getElementById('ajuste-inv-search') as HTMLInputElement)?.value || '';
    renderProductosAjusteInventario(search);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:28px; color:#dc2626;">Error al cargar productos</td></tr>';
  }
}

function renderProductosAjusteInventario(searchText = '') {
  const tbody = document.getElementById('ajuste-inv-productos-body');
  if (!tbody) return;

  const term = searchText.trim().toLowerCase();
  const filtrados = !term
    ? ajusteInvProductos
    : ajusteInvProductos.filter((p) => {
        const sku = (p.sku || '').toLowerCase();
        const desc = (p.descripcion || '').toLowerCase();
        return sku.includes(term) || desc.includes(term);
      });

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:28px; color:#64748b;">No se encontraron productos para ajustar</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map((producto) => {
    const stock = producto.inventario?.cantidad_disponible || 0;
    const seguridad = producto.inventario?.stock_seguridad || 0;
    return `
      <tr>
        <td>
          <div style="font-weight:600; color:#1f2937;">${producto.descripcion}</div>
          <div style="font-size:12px; color:#94a3b8;">SKU: ${producto.sku || 'N/A'}</div>
        </td>
        <td>${producto.categoria?.nombre || 'Sin categoría'}</td>
        <td><strong>${stock}</strong></td>
        <td>${seguridad}</td>
        <td>
          <button class="btn-primary btn-abrir-ajuste-inv" data-producto-id="${producto.id}" style="padding:7px 12px; font-size:12px;">
            Ajustar stock
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-abrir-ajuste-inv').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLButtonElement).dataset.productoId);
      abrirModalAjusteInventario(id);
    });
  });
}

function abrirModalAjusteInventario(idProducto: number) {
  const producto = ajusteInvProductos.find((p) => p.id === idProducto);
  if (!producto) {
    mostrarToast('error', 'Error', 'Producto no encontrado');
    return;
  }

  const stockActual = producto.inventario?.cantidad_disponible || 0;

  (document.getElementById('ajuste-inv-id-producto') as HTMLInputElement).value = String(idProducto);
  (document.getElementById('ajuste-inv-producto') as HTMLInputElement).value = producto.descripcion;
  (document.getElementById('ajuste-inv-stock-actual') as HTMLInputElement).value = String(stockActual);
  (document.getElementById('ajuste-inv-stock-nuevo') as HTMLInputElement).value = String(stockActual);
  (document.getElementById('ajuste-inv-motivo') as HTMLSelectElement).value = '';
  (document.getElementById('ajuste-inv-observacion') as HTMLTextAreaElement).value = '';

  const modal = document.getElementById('modal-ajuste-inventario');
  if (modal) modal.style.display = 'flex';
}

async function cargarHistorialAjustesInventario() {
  const tbody = document.getElementById('ajuste-inv-historial-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:28px; color:#94a3b8;">Cargando historial...</td></tr>';

  const fechaDesde = (document.getElementById('ajuste-inv-fecha-desde') as HTMLInputElement)?.value || '';
  const fechaHasta = (document.getElementById('ajuste-inv-fecha-hasta') as HTMLInputElement)?.value || '';

  try {
    const response = await inventarioAjusteService.getAll({
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    });

    ajusteInvHistorial = response?.data || [];
    renderHistorialAjustesInventario();
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:28px; color:#dc2626;">Error al cargar historial</td></tr>';
  }
}

function renderHistorialAjustesInventario() {
  const tbody = document.getElementById('ajuste-inv-historial-body');
  if (!tbody) return;

  if (!ajusteInvHistorial.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:28px; color:#64748b;">No hay ajustes registrados</td></tr>';
    return;
  }

  tbody.innerHTML = ajusteInvHistorial.map((item) => {
    const fecha = new Date(item.fecha_ajuste).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const esEntrada = item.tipo_ajuste === 'Entrada';
    const badge = esEntrada
      ? '<span class="badge green">Entrada</span>'
      : '<span class="badge orange">Salida</span>';
    const diffClass = esEntrada ? 'color:#16a34a;' : 'color:#dc2626;';
    const diffSign = esEntrada ? '+' : '-';

    return `
      <tr>
        <td>${fecha}</td>
        <td>${item.producto}</td>
        <td>${badge}</td>
        <td>${item.stock_anterior}</td>
        <td>${item.stock_nuevo}</td>
        <td style="font-weight:700; ${diffClass}">${diffSign}${Math.abs(item.diferencia)}</td>
        <td>${item.motivo}</td>
        <td>${item.referencia}</td>
        <td>${item.usuario}</td>
      </tr>
    `;
  }).join('');
}

// Vista de Categorías (Tab 3)
let allCategoriasData: any[] = [];

export function renderCategoriasTab() {
  return `
    <div class="page-actions" style="margin-bottom: 24px;">
      <button class="btn-primary" id="btn-agregar-categoria">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Agregar Categoría
      </button>
    </div>

    <div class="categories-grid" id="categorias-grid">
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
        <span class="loading-text">Cargando categorías...</span>
      </div>
    </div>
  `;
}

// Colores de íconos por índice
const categoryColors = ['#16a34a', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
const categoryBgColors = ['#f0fdf4', '#eff6ff', '#faf5ff', '#fffbeb', '#fef2f2', '#ecfeff', '#fdf2f8', '#f7fee7'];

function getCategoryIcon(index: number): string {
  const icons = [
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path></svg>',
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 0 1 9 9v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 9-9z"></path><path d="M8 12h.01M16 12h.01M15 16H9"></path></svg>',
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
  ];
  return icons[index % icons.length];
}

async function cargarCategoriasGrid() {
  try {
    const response = await categoriaService.getAll();
    if (response.success && response.data) {
      allCategoriasData = response.data;
      renderizarCategoriasGrid();
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
    const grid = document.getElementById('categorias-grid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
          Error al cargar las categorías. Intente nuevamente.
        </div>`;
    }
  }
}

function renderizarCategoriasGrid() {
  const grid = document.getElementById('categorias-grid');
  if (!grid) return;

  if (allCategoriasData.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748b;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom: 16px;">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <p style="font-size: 15px; margin-bottom: 8px;">No hay categorías registradas</p>
        <p style="font-size: 13px; color: #94a3b8;">Haz clic en "Agregar Categoría" para crear la primera</p>
      </div>`;
    return;
  }

  grid.innerHTML = allCategoriasData.map((cat, index) => {
    const catId = cat.id_categoria || cat.id;
    const color = categoryColors[index % categoryColors.length];
    const bgColor = categoryBgColors[index % categoryBgColors.length];
    const icon = getCategoryIcon(index);
    const totalProductos = cat.total_productos || cat.productos_count || 0;
    const estadoBadge = cat.estado === 'Activo'
      ? '<span style="font-size: 11px; padding: 2px 8px; border-radius: 20px; background: #f0fdf4; color: #16a34a; font-weight: 500;">Activo</span>'
      : '<span style="font-size: 11px; padding: 2px 8px; border-radius: 20px; background: #fef2f2; color: #dc2626; font-weight: 500;">Inactivo</span>';

    return `
      <div class="category-card" data-categoria-id="${catId}">
        <div class="category-header">
          <div class="category-icon" style="background: ${bgColor}; color: ${color};">
            ${icon}
          </div>
          <div class="category-info">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3>${cat.nombre}</h3>
              ${estadoBadge}
            </div>
            <p>${cat.descripcion || 'Sin descripción'}</p>
          </div>
          <div class="category-card-actions">
            <button class="action-btn-icon edit" data-action="edit-cat" data-cat-id="${catId}" title="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn-icon delete" data-action="delete-cat" data-cat-id="${catId}" title="Eliminar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <div class="category-stats">
          <div class="category-stat">
            <div class="stat-number" style="color: ${color};">${totalProductos}</div>
            <div class="stat-label">PRODUCTOS</div>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn-secondary fullwidth btn-ver-productos" data-cat-id="${catId}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Ver Productos
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Eventos de editar categoría
  document.querySelectorAll('[data-action="edit-cat"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((e.currentTarget as HTMLElement).dataset.catId || '0');
      abrirModalEditarCategoria(id);
    });
  });

  // Eventos de eliminar categoría
  document.querySelectorAll('[data-action="delete-cat"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((e.currentTarget as HTMLElement).dataset.catId || '0');
      confirmarEliminarCategoria(id);
    });
  });

  // Eventos de ver productos (filtra por categoría en tab Productos)
  document.querySelectorAll('.btn-ver-productos').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catId = parseInt((e.currentTarget as HTMLElement).dataset.catId || '0');
      // Cambiar a tab productos con filtro de categoría
      currentFilters.id_categoria = catId;
      const tabBtn = document.querySelector('[data-tab="productos"]') as HTMLButtonElement;
      if (tabBtn) tabBtn.click();
    });
  });
}

// ===== MODAL NUEVA CATEGORÍA =====

function abrirModalNuevaCategoria() {
  const modalAnterior = document.getElementById('modal-nueva-categoria');
  if (modalAnterior) modalAnterior.remove();

  const html = `
    <div id="modal-nueva-categoria" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 480px;">
        <div class="modal-header">
          <h2>Agregar Categoría</h2>
          <button class="modal-close" id="btn-cerrar-nueva-cat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="form-nueva-categoria" class="modal-body">
          <div class="form-group">
            <label for="new-cat-nombre">Nombre *</label>
            <input type="text" id="new-cat-nombre" name="nombre" required maxlength="100"
                   placeholder="Ej: Insecticidas" class="form-input">
          </div>
          <div class="form-group">
            <label for="new-cat-descripcion">Descripción</label>
            <textarea id="new-cat-descripcion" name="descripcion" maxlength="255"
                      placeholder="Descripción de la categoría" class="form-input"
                      rows="3" style="resize: vertical;"></textarea>
          </div>
          <div class="modal-footer" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" id="btn-cancelar-nueva-cat">Cancelar</button>
            <button type="submit" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Crear Categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal-nueva-categoria')!;
  const form = document.getElementById('form-nueva-categoria') as HTMLFormElement;

  document.getElementById('btn-cerrar-nueva-cat')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-nueva-cat')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;

    if (!nombre.trim()) {
      mostrarToast('warning', 'Atención', 'El nombre es requerido');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creando...'; }

    try {
      const response = await categoriaService.create({ nombre: nombre.trim(), descripcion: descripcion?.trim() || undefined });
      if (response.success) {
        modal.remove();
        mostrarToast('success', 'Categoría creada', `"${nombre}" fue creada exitosamente`);
        await cargarCategoriasGrid();
        // Actualizar también la lista de categorías para el dropdown de productos
        await cargarCategorias();
      }
    } catch (error: any) {
      let msg = 'Error al crear la categoría';
      if (error.data?.errors?.nombre) {
        msg = Array.isArray(error.data.errors.nombre) ? error.data.errors.nombre[0] : error.data.errors.nombre;
      } else if (error.data?.message) {
        msg = error.data.message;
      }
      mostrarToast('error', 'Error', msg);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Crear Categoría'; }
    }
  });

  // Focus al campo nombre
  setTimeout(() => document.getElementById('new-cat-nombre')?.focus(), 100);
}

// ===== MODAL EDITAR CATEGORÍA =====

async function abrirModalEditarCategoria(id: number) {
  const cat = allCategoriasData.find(c => (c.id_categoria || c.id) === id);
  if (!cat) {
    mostrarToast('error', 'Error', 'Categoría no encontrada');
    return;
  }

  const modalAnterior = document.getElementById('modal-editar-categoria');
  if (modalAnterior) modalAnterior.remove();

  const html = `
    <div id="modal-editar-categoria" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 480px;">
        <div class="modal-header">
          <h2>Editar Categoría</h2>
          <button class="modal-close" id="btn-cerrar-editar-cat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="form-editar-categoria" class="modal-body" data-cat-id="${id}">
          <div class="form-group">
            <label for="edit-cat-nombre">Nombre *</label>
            <input type="text" id="edit-cat-nombre" name="nombre" required maxlength="100"
                   value="${cat.nombre}" class="form-input">
          </div>
          <div class="form-group">
            <label for="edit-cat-descripcion">Descripción</label>
            <textarea id="edit-cat-descripcion" name="descripcion" maxlength="255"
                      class="form-input" rows="3" style="resize: vertical;">${cat.descripcion || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="edit-cat-estado">Estado</label>
            <select id="edit-cat-estado" name="estado" class="form-input">
              <option value="Activo" ${cat.estado === 'Activo' ? 'selected' : ''}>Activo</option>
              <option value="Inactivo" ${cat.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
          <div class="modal-footer" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" id="btn-cancelar-editar-cat">Cancelar</button>
            <button type="submit" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal-editar-categoria')!;
  const form = document.getElementById('form-editar-categoria') as HTMLFormElement;

  document.getElementById('btn-cerrar-editar-cat')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-editar-cat')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const catId = parseInt(form.dataset.catId || '0');

    const data: any = {
      nombre: (formData.get('nombre') as string).trim(),
      descripcion: (formData.get('descripcion') as string)?.trim() || null,
      estado: formData.get('estado') as string,
    };

    if (!data.nombre) {
      mostrarToast('warning', 'Atención', 'El nombre es requerido');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Guardando...'; }

    try {
      const response = await categoriaService.update(catId, data);
      if (response.success) {
        modal.remove();
        mostrarToast('success', 'Categoría actualizada', `"${data.nombre}" fue actualizada exitosamente`);
        await cargarCategoriasGrid();
        await cargarCategorias();
      }
    } catch (error: any) {
      let msg = 'Error al actualizar la categoría';
      if (error.data?.errors?.nombre) {
        msg = Array.isArray(error.data.errors.nombre) ? error.data.errors.nombre[0] : error.data.errors.nombre;
      } else if (error.data?.message) {
        msg = error.data.message;
      }
      mostrarToast('error', 'Error', msg);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Guardar Cambios'; }
    }
  });
}

// ===== ELIMINAR CATEGORÍA =====

function confirmarEliminarCategoria(id: number) {
  const cat = allCategoriasData.find(c => (c.id_categoria || c.id) === id);
  if (!cat) return;

  const totalProductos = cat.total_productos || cat.productos_count || 0;
  const modalAnterior = document.getElementById('modal-confirmar-eliminar-cat');
  if (modalAnterior) modalAnterior.remove();

  const html = `
    <div id="modal-confirmar-eliminar-cat" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 440px;">
        <div class="modal-header">
          <h2>Eliminar Categoría</h2>
          <button class="modal-close" id="btn-cerrar-eliminar-cat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 32px 24px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <p style="font-size: 15px; color: #334155; margin-bottom: 8px;">¿Estás seguro de eliminar esta categoría?</p>
          <p style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">${cat.nombre}</p>
          ${totalProductos > 0 
            ? `<p style="font-size: 13px; color: #dc2626; margin-top: 12px; background: #fef2f2; padding: 8px 12px; border-radius: 6px;">⚠️ Esta categoría tiene ${totalProductos} producto(s) asociado(s). No se puede eliminar.</p>`
            : `<p style="font-size: 13px; color: #94a3b8; margin-top: 12px;">La categoría será desactivada.</p>`
          }
        </div>
        <div class="modal-footer" style="display: flex; gap: 12px; justify-content: center; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
          <button class="btn-secondary" id="btn-cancelar-eliminar-cat">Cancelar</button>
          ${totalProductos === 0 
            ? `<button class="btn-primary" id="btn-confirmar-eliminar-cat" style="background: #dc2626; border-color: #dc2626;">Eliminar</button>`
            : ''
          }
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal-confirmar-eliminar-cat')!;
  document.getElementById('btn-cerrar-eliminar-cat')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-eliminar-cat')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  const btnConfirmar = document.getElementById('btn-confirmar-eliminar-cat');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async () => {
      const btn = btnConfirmar as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = 'Eliminando...';

      try {
        const response = await categoriaService.delete(id);
        if (response.success) {
          modal.remove();
          mostrarToast('success', 'Categoría eliminada', `"${cat.nombre}" fue desactivada correctamente`);
          await cargarCategoriasGrid();
          await cargarCategorias();
        }
      } catch (error: any) {
        const msg = error.data?.message || 'Error al eliminar la categoría';
        mostrarToast('error', 'Error', msg);
        btn.disabled = false;
        btn.textContent = 'Eliminar';
      }
    });
  }
}

// Inicializar eventos de la pestaña Categorías
export function initCategoriasEvents() {
  cargarCategoriasGrid();

  // Botón agregar categoría
  const btnAgregar = document.getElementById('btn-agregar-categoria');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', abrirModalNuevaCategoria);
  }
}

// Función principal que maneja los tabs
export function renderAlmacenInventario() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Inventario</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar Excel
        </button>
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Exportar PDF
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar Producto
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="productos">Productos</button>
      <button class="tab-btn" data-tab="kardex">Kardex</button>
      <button class="tab-btn" data-tab="categorias">Categorías</button>
    </div>

    <div class="tab-content">
      ${renderProductosTab()}
    </div>
  `;
}
// Funciones para cargar datos dinámicamente

async function cargarEstadisticas() {
  try {
    const response = await productoService.getEstadisticas();
    if (response.success && response.data) {
      estadisticasData = response.data;
      actualizarEstadisticas();
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

function actualizarEstadisticas() {
  const statsContainer = document.getElementById('productos-stats');
  if (!statsContainer || !estadisticasData) return;

  // Calcular total de stock y valor
  const totalStock = productosData.reduce((sum, p) => 
    sum + (p.inventario?.cantidad_disponible || 0), 0
  );
  
  const valorTotal = productosData.reduce((sum, p) => {
    const stock = p.inventario?.cantidad_disponible || 0;
    const precio = Number(p.precio_unitario ?? 0);
    return sum + (stock * precio);
  }, 0);

  // Contar stock bajo: productos cuyo stock actual < stock_seguridad
  const stockBajoCount = productosData.filter(p => {
    const stock = p.inventario?.cantidad_disponible || 0;
    const seguridad = p.inventario?.stock_seguridad || 0;
    return stock < seguridad;
  }).length;

  statsContainer.innerHTML = `
    <div class="stat-box">
      <div class="stat-box-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
      </div>
      <div class="stat-box-content">
        <div class="stat-box-label">Stock Disponible</div>
        <div class="stat-box-value">${totalStock.toLocaleString()} <span class="stat-box-note">unidades</span></div>
      </div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon blue">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
      </div>
      <div class="stat-box-content">
        <div class="stat-box-label">Inventario Total</div>
        <div class="stat-box-value">S/${valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span class="stat-box-note">valorizado</span></div>
      </div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon orange">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      </div>
      <div class="stat-box-content">
        <div class="stat-box-label">Stock Bajo</div>
        <div class="stat-box-value">${stockBajoCount} <span class="stat-box-note">productos</span></div>
      </div>
    </div>
  `;
}

async function cargarProductos() {
  try {
    const filters: any = {};
    
    if (currentFilters.search) {
      filters.search = currentFilters.search;
    }
    
    if (currentFilters.estado) {
      filters.estado = currentFilters.estado;
    }
    
    if (currentFilters.id_categoria) {
      filters.id_categoria = currentFilters.id_categoria;
    }

    const response = await productoService.getAll(filters);
    
    if (response.success && response.data) {
      productosData = response.data;
      renderizarTablaProductos();
      actualizarEstadisticas();
    }
  } catch (error) {
    console.error('Error cargando productos:', error);
    const tbody = document.getElementById('productos-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: #e74c3c;">
            <div>Error al cargar los productos. Por favor, intente nuevamente.</div>
          </td>
        </tr>
      `;
    }
  }
}

function renderizarTablaProductos() {
  const tbody = document.getElementById('productos-table-body');
  if (!tbody) return;

  if (productosData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px;">
          <div style="color: #7f8c8d;">No se encontraron productos</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = productosData.map(producto => {
    const stock = producto.inventario?.cantidad_disponible || 0;
    const stockSeguridad = producto.inventario?.stock_seguridad || 0;
    const precio = Number(producto.precio_unitario ?? 0);
    const valorTotal = stock * precio;

    // Semáforo de estado basado en stock vs stock_seguridad
    let estadoBadge = '';
    const esCritico = stock < stockSeguridad;
    const esPrecaucion = stock === stockSeguridad;
    if (stock > stockSeguridad) {
      estadoBadge = '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#f0fdf4;color:#16a34a;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;display:inline-block;"></span>Óptimo</span>';
    } else if (esPrecaucion) {
      estadoBadge = '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#fffbeb;color:#d97706;"><span style="width:8px;height:8px;border-radius:50%;background:#d97706;display:inline-block;"></span>Precaución</span>';
    } else {
      estadoBadge = '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#fef2f2;color:#dc2626;"><span style="width:8px;height:8px;border-radius:50%;background:#dc2626;display:inline-block;"></span>Crítico</span>';
    }

    // Color de fila: rojo para Crítico, amarillo para Precaución
    const rowBg = esCritico ? 'background-color: #ec6060;' : esPrecaucion ? 'background-color: #fef9c3;' : '';

    return `
      <!-- Sombreado de fila: rojo si Crítico, amarillo si Precaución -->
      <tr style="${rowBg}">
        <td>
          <div class="equipment-info">
            <div class="equipment-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
            </div>
            <div>
              <div class="equipment-name">${producto.descripcion}</div>
              <div class="equipment-id">SKU: ${producto.sku || 'N/A'}</div>
            </div>
          </div>
        </td>
        <td>${producto.categoria?.nombre || 'Sin categoría'}</td>
        <td><strong>${stock}</strong></td>
        <td>${stockSeguridad}</td>
        <td>${producto.unidad || '-'}</td>
        <td>S/${precio.toFixed(2)}</td>
        <td>S/${valorTotal.toFixed(2)}</td>
        <td>${estadoBadge}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-icon edit" data-action="edit" data-producto-id="${producto.id}" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn-icon delete" data-action="delete" data-producto-id="${producto.id}" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Actualizar paginación
  const paginationInfo = document.querySelector('#productos-pagination .pagination-info');
  if (paginationInfo) {
    paginationInfo.textContent = `Mostrando ${productosData.length} producto${productosData.length !== 1 ? 's' : ''}`;
  }

  // Asignar eventos a botones de editar y eliminar
  document.querySelectorAll('.action-btn-icon[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).dataset.productoId || '0');
      abrirModalEditarProducto(id);
    });
  });

  document.querySelectorAll('.action-btn-icon[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).dataset.productoId || '0');
      confirmarEliminarProducto(id);
    });
  });
}

export function initProductosEvents() {
  // Cargar datos iniciales
  cargarEstadisticas();
  cargarCategorias().then(() => {
    renderizarFiltroCategorias();
  });
  cargarProductos();

  // Búsqueda
  const searchInput = document.getElementById('productos-search') as HTMLInputElement;
  if (searchInput) {
    let searchTimeout: number;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        currentFilters.search = (e.target as HTMLInputElement).value;
        cargarProductos();
      }, 500);
    });
  }

  // Filtro de estado
  const estadoFilter = document.getElementById('productos-estado-filter') as HTMLSelectElement;
  if (estadoFilter) {
    estadoFilter.addEventListener('change', (e) => {
      currentFilters.estado = (e.target as HTMLSelectElement).value;
      cargarProductos();
    });
  }

  // Filtro de stock
  const stockFilter = document.getElementById('productos-stock-filter') as HTMLSelectElement;
  if (stockFilter) {
    stockFilter.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      // Estos filtros se pasan como parámetros adicionales
      cargarProductos();
    });
  }

  // Filtro de categoría
  const categoriaFilter = document.getElementById('productos-categoria-filter') as HTMLSelectElement;
  if (categoriaFilter) {
    categoriaFilter.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      currentFilters.id_categoria = value ? parseInt(value) : null;
      cargarProductos();
    });
  }

  // Botón Agregar Producto
  const btnAgregarProducto = document.querySelector('.btn-primary') as HTMLButtonElement;
  if (btnAgregarProducto && btnAgregarProducto.textContent?.includes('Agregar Producto')) {
    btnAgregarProducto.addEventListener('click', abrirModalNuevoProducto);
  }
}

// Modal de Nuevo Producto
function renderModalNuevoProducto(): string {
  console.log('Renderizando modal con categorías:', categoriasData);
  const categoriasOptions = categoriasData.map(cat => {
    // Las categorías vienen con 'id' no 'id_categoria'
    const catId = cat.id_categoria || (cat as any).id;
    console.log('Categoría:', catId, cat.nombre);
    return `<option value="${catId}">${cat.nombre}</option>`;
  }).join('');

  return `
    <div id="modal-nuevo-producto" class="modal-overlay" style="display: none;">
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Agregar Nuevo Producto</h2>
          <button class="modal-close" onclick="cerrarModalNuevoProducto()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form id="form-nuevo-producto" class="modal-body">
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="producto-descripcion">Descripción del Producto *</label>
              <input type="text" id="producto-descripcion" name="descripcion" required 
                     placeholder="Ej: Cipermetrina 25% EC" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-categoria">Categoría *</label>
              <select id="producto-categoria" name="id_categoria" required class="form-input">
                <option value="">Seleccionar categoría</option>
                ${categoriasOptions}
              </select>
            </div>

            <div class="form-group">
              <label for="producto-lote">Número de Lote</label>
              <input type="text" id="producto-lote" name="n_lote"
                     placeholder="Ej: L2026-001" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-ubicacion">Ubicación</label>
              <input type="text" id="producto-ubicacion" name="ubicacion"
                     placeholder="Ej: Almacén A - Estante 3" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-unidad">Unidad</label>
              <select id="producto-unidad" name="unidad" class="form-input">
                <option value="">Seleccionar unidad</option>
                ${renderUnidadOptions()}
              </select>
            </div>

            <div class="form-group">
              <label for="producto-precio">Precio Unitario</label>
              <input type="number" id="producto-precio" name="precio_unitario" 
                     step="0.01" min="0" placeholder="0.00" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-stock-seguridad">Stock de Seguridad *</label>
              <input type="number" id="producto-stock-seguridad" name="stock_seguridad"
                     step="1" min="0" required placeholder="0" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-fecha-vencim">Fecha de Vencimiento</label>
              <input type="date" id="producto-fecha-vencim" name="fecha_vencim" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-estado">Estado</label>
              <select id="producto-estado" name="estado" class="form-input">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div class="form-group">
              <label for="producto-ingre-activo">Ingrediente Activo</label>
             <input type="text" id="producto-ingre-activo" name="ingre_activo"
                     placeholder="Ej: Cipermetrina" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-plag-objetivo">Plaga Objetivo</label>
             <input type="text" id="producto-plag-objetivo" name="plag_objetivo"
                     placeholder="Ej: Moscas" class="form-input">
            </div>

            <div class="form-group">
              <label for="producto-presentacion">Presentación</label>
              <input type="text" id="producto-presentacion" name="presentacion"
                     placeholder="Ej: 250ml" class="form-input">
            </div>
          </div>

          <!-- Campo de imagen -->
          <div style="margin-top: 16px; padding: 16px; border: 2px dashed #cbd5e1; border-radius: 8px; text-align: center; cursor: pointer; transition: border-color 0.2s;" id="zona-imagen-nuevo">
            <input type="file" id="producto-imagen" name="imagen" accept="image/jpeg,image/png,image/webp" style="display: none;">
            <div id="preview-imagen-nuevo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom: 8px;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <div style="font-size: 13px; color: #64748b;">Haz clic para subir una imagen del producto</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">JPG, PNG o WEBP • Máx. 5MB</div>
            </div>
          </div>

          <div class="modal-footer" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" onclick="cerrarModalNuevoProducto()">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function cargarCategorias() {
  try {
    const response = await categoriaService.getAll();
    if (response.success && response.data) {
      categoriasData = response.data;
      console.log('Categorías cargadas:', categoriasData.length, categoriasData);
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
    categoriasData = [];
  }
}

function renderizarFiltroCategorias() {
  const select = document.getElementById('productos-categoria-filter') as HTMLSelectElement;
  if (!select) return;

  const optionsHTML = categoriasData.map(cat => {
    const catId = cat.id_categoria || (cat as any).id;
    return `<option value="${catId}">${cat.nombre}</option>`;
  }).join('');

  select.innerHTML = `<option value="">Todas las categorías</option>${optionsHTML}`;
}

function abrirModalNuevoProducto() {
  // Cargar categorías si aún no se han cargado
  if (categoriasData.length === 0) {
    cargarCategorias().then(() => {
      mostrarModal();
    });
  } else {
    mostrarModal();
  }

  function mostrarModal() {
    // Verificar si el modal ya existe
    let modal = document.getElementById('modal-nuevo-producto');
    
    if (!modal) {
      // Crear el modal
      const modalHTML = renderModalNuevoProducto();
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      modal = document.getElementById('modal-nuevo-producto');
    } else {
      // Actualizar contenido del modal con categorías actualizadas
      const modalContainer = modal.querySelector('.modal-container');
      if (modalContainer) {
        modalContainer.innerHTML = renderModalNuevoProducto().match(/<div class="modal-container"[^>]*>([\s\S]*)<\/div>\s*$/)?.[1] || '';
      }
    }

    // Mostrar modal
    if (modal) {
      modal.style.display = 'flex';
      
      // Event listener para el formulario
      const form = document.getElementById('form-nuevo-producto') as HTMLFormElement;
      if (form) {
        form.addEventListener('submit', handleSubmitNuevoProducto);
      }

      // Zona de imagen: click y preview
      const zonaImagen = document.getElementById('zona-imagen-nuevo');
      const inputImagen = document.getElementById('producto-imagen') as HTMLInputElement;
      if (zonaImagen && inputImagen) {
        zonaImagen.addEventListener('click', (ev) => {
          if ((ev.target as HTMLElement).id === 'btn-quitar-imagen-nuevo') return;
          inputImagen.click();
        });
        inputImagen.addEventListener('change', () => {
          const file = inputImagen.files?.[0];
          const preview = document.getElementById('preview-imagen-nuevo');
          if (file && preview) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              preview.innerHTML = `
                <div style="position: relative; display: inline-block;">
                  <img src="${ev.target?.result}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 6px; object-fit: cover;">
                  <button type="button" id="btn-quitar-imagen-nuevo" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Quitar imagen">&times;</button>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Haz clic para cambiar la imagen</div>
              `;
              document.getElementById('btn-quitar-imagen-nuevo')?.addEventListener('click', (e) => {
                e.stopPropagation();
                inputImagen.value = '';
                preview.innerHTML = `
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom: 8px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <div style="font-size: 13px; color: #64748b;">Haz clic para subir una imagen del producto</div>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">JPG, PNG o WEBP • Máx. 5MB</div>
                `;
              });
            };
            reader.readAsDataURL(file);
          }
        });
      }

      // Cerrar al hacer clic fuera del modal
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cerrarModalNuevoProducto();
        }
      });
    }
  }
}

function cerrarModalNuevoProducto() {
  const modal = document.getElementById('modal-nuevo-producto');
  if (modal) {
    modal.style.display = 'none';
    const form = document.getElementById('form-nuevo-producto') as HTMLFormElement;
    if (form) {
      form.reset();
    }
  }
}

async function handleSubmitNuevoProducto(e: Event) {
  e.preventDefault();
  
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  
  // Validar que la categoría esté seleccionada
  const idCategoriaStr = formData.get('id_categoria') as string;
  if (!idCategoriaStr || idCategoriaStr === '') {
    mostrarToast('warning', 'Campo requerido', 'Por favor selecciona una categoría');
    return;
  }
  
  const data: any = {
    descripcion: formData.get('descripcion') as string,
    id_categoria: Number(idCategoriaStr),
    n_lote: formData.get('n_lote') as string,
    ubicacion: formData.get('ubicacion') as string,
  };

  const stockSeguridad = formData.get('stock_seguridad') as string;
  if (!stockSeguridad || stockSeguridad === '' || Number.isNaN(Number(stockSeguridad))) {
    mostrarToast('warning', 'Campo requerido', 'Por favor ingresa el stock de seguridad');
    return;
  }
  data.stock_seguridad = Number(stockSeguridad);

  // Validar que id_categoria sea un número válido
  if (isNaN(data.id_categoria)) {
    mostrarToast('error', 'Error', 'Categoría inválida');
    return;
  }

  // Campos opcionales
  const unidad = formData.get('unidad') as string;
  if (unidad) data.unidad = unidad;

  const precioUnitario = formData.get('precio_unitario') as string;
  if (precioUnitario) data.precio_unitario = parseFloat(precioUnitario);

  const fechaVencim = formData.get('fecha_vencim') as string;
  if (fechaVencim) data.fecha_vencim = fechaVencim;

  const ingreActivo = (formData.get('ingre_activo') as string)?.trim();
  if (ingreActivo) data.ingre_activo = ingreActivo;

  const plagObjetivo = (formData.get('plag_objetivo') as string)?.trim();
  if (plagObjetivo) data.plag_objetivo = plagObjetivo;

  const presentacion = (formData.get('presentacion') as string)?.trim();
  if (presentacion) data.presentacion = presentacion;

  const estado = formData.get('estado') as string;
  if (estado) data.estado = estado;

  console.log('Datos a enviar:', data);

  try {
    // Deshabilitar botón de submit
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        Guardando...
      `;
    }

    const response = await productoService.create(data);
    
    if (response.success) {
      // Subir imagen si se seleccionó una
      const inputImagen = document.getElementById('producto-imagen') as HTMLInputElement;
      const archivoImagen = inputImagen?.files?.[0];
      if (archivoImagen && response.data?.id) {
        try {
          await productoService.subirImagen(response.data.id, archivoImagen);
        } catch (imgError) {
          console.error('Error subiendo imagen:', imgError);
          mostrarToast('warning', 'Producto creado', 'El producto se creó pero hubo un error al subir la imagen');
        }
      }

      // Cerrar modal
      cerrarModalNuevoProducto();
      
      // Mostrar notificación de éxito
      mostrarToast('success', 'Producto creado', `SKU: ${response.data.sku} — ${response.data.descripcion}`);
      
      // Recargar productos
      await cargarProductos();
      await cargarEstadisticas();
    }
  } catch (error: any) {
    console.error('Error creando producto:', error);
    console.error('Error data:', error.data);
    
    let errorMessage = 'Error al crear el producto. Por favor, intente nuevamente.';
    
    if (error.data?.errors) {
      const errors = Object.entries(error.data.errors).map(([field, messages]: [string, any]) => {
        return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
      });
      errorMessage = errors.join('\n');
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    }
    
    console.log('Mensaje de error:', errorMessage);
    mostrarToast('error', 'Error al crear producto', errorMessage);
    
    // Rehabilitar botón
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Guardar Producto
      `;
    }
  }
}

// Toast: usa componente compartido importado arriba

// ===== MODAL EDITAR PRODUCTO =====

function renderModalEditarProducto(producto: Producto): string {
  const categoriaSeleccionada = Number(producto.id_categoria ?? (producto.categoria as any)?.id ?? 0);
  const categoriasOptions = categoriasData.map(cat => {
    const catId = cat.id_categoria || (cat as any).id;
    const selected = Number(catId) === categoriaSeleccionada ? 'selected' : '';
    return `<option value="${catId}" ${selected}>${cat.nombre}</option>`;
  }).join('');

  const unidadOptions = renderUnidadOptions(producto.unidad || '');

  return `
    <div id="modal-editar-producto" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Editar Producto</h2>
          <button class="modal-close" id="btn-cerrar-editar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form id="form-editar-producto" class="modal-body" data-producto-id="${producto.id}">
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label>SKU</label>
              <input type="text" value="${producto.sku || 'N/A'}" class="form-input" disabled style="background: #f1f5f9; color: #64748b;">
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="edit-descripcion">Descripción del Producto *</label>
              <input type="text" id="edit-descripcion" name="descripcion" required 
                     value="${producto.descripcion}" class="form-input">
            </div>

            <div class="form-group">
              <label for="edit-categoria">Categoría *</label>
              <select id="edit-categoria" name="id_categoria" required class="form-input">
                <option value="">Seleccionar categoría</option>
                ${categoriasOptions}
              </select>
            </div>

            <div class="form-group">
              <label for="edit-lote">Número de Lote</label>
              <input type="text" id="edit-lote" name="n_lote"
                     value="${producto.n_lote}" class="form-input">
            </div>

            <div class="form-group">
              <label for="edit-ubicacion">Ubicación</label>
              <input type="text" id="edit-ubicacion" name="ubicacion"
                     value="${producto.ubicacion}" class="form-input">
            </div>

            <div class="form-group">
              <label for="edit-unidad">Unidad</label>
              <select id="edit-unidad" name="unidad" class="form-input">
                <option value="">Seleccionar unidad</option>
                ${unidadOptions}
              </select>
            </div>

            <div class="form-group">
              <label for="edit-precio">Precio Unitario</label>
              <input type="number" id="edit-precio" name="precio_unitario" 
                     step="0.01" min="0" value="${producto.precio_unitario || ''}" class="form-input">
            </div>

            <div class="form-group">
              <label for="edit-stock-seguridad">Stock de Seguridad *</label>
              <input type="number" id="edit-stock-seguridad" name="stock_seguridad"
                     step="1" min="0" value="${producto.inventario?.stock_seguridad ?? 0}" class="form-input" required>
            </div>

            <div class="form-group">
              <label for="edit-fecha-vencim">Fecha de Vencimiento</label>
              <input type="date" id="edit-fecha-vencim" name="fecha_vencim" 
                     value="${producto.fecha_vencim || ''}" class="form-input">
            </div>

            <div class="form-group">
              <label for="edit-estado">Estado</label>
              <select id="edit-estado" name="estado" class="form-input">
                <option value="Activo" ${producto.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                <option value="Inactivo" ${producto.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>

            <div class="form-group">
              <label for="edit-ingre-activo">Ingrediente Activo</label>
              <input type="text" id="edit-ingre-activo" name="ingre_activo"
                     value="${producto.ingre_activo || ''}" placeholder="Ej: Cipermetrina" class="form-input">
            </div>

            <div class="form-group">
              <label for="edit-plag-objetivo">Plaga Objetivo</label>
              <input type="text" id="edit-plag-objetivo" name="plag_objetivo"
                     value="${producto.plag_objetivo || ''}" placeholder="Ej: Moscas" class="form-input">
            </div>

            <div class="form-group">
              <label for="edit-presentacion">Presentación</label>
              <input type="text" id="edit-presentacion" name="presentacion"
                     value="${producto.presentacion || ''}" placeholder="Ej: 250ml" class="form-input">
            </div>
          </div>

          <!-- Campo de imagen -->
          <div style="margin-top: 16px; padding: 16px; border: 2px dashed #cbd5e1; border-radius: 8px; text-align: center; cursor: pointer; transition: border-color 0.2s;" id="zona-imagen-editar">
            <input type="file" id="edit-imagen" name="imagen" accept="image/jpeg,image/png,image/webp" style="display: none;">
            <div id="preview-imagen-editar">
              ${producto.imagen_url ? `
                <div style="position: relative; display: inline-block;">
                  <img src="${producto.imagen_url}" alt="${producto.descripcion}" style="max-width: 200px; max-height: 150px; border-radius: 6px; object-fit: cover;">
                  <button type="button" id="btn-eliminar-imagen" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Eliminar imagen">&times;</button>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Haz clic para cambiar la imagen</div>
              ` : `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom: 8px;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <div style="font-size: 13px; color: #64748b;">Haz clic para subir una imagen del producto</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">JPG, PNG o WEBP • Máx. 5MB</div>
              `}
            </div>
          </div>

          <div class="modal-footer" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" id="btn-cancelar-editar">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

async function abrirModalEditarProducto(id: number) {
  // Cargar categorías si no están
  if (categoriasData.length === 0) {
    await cargarCategorias();
  }

  // Buscar producto en los datos cargados o traer del API
  let producto = productosData.find(p => p.id === id);
  if (!producto) {
    try {
      const response = await productoService.getById(id);
      if (response.success && response.data) {
        producto = response.data;
      }
    } catch (error) {
      mostrarToast('error', 'Error', 'No se pudo cargar el producto');
      return;
    }
  }

  if (!producto) {
    mostrarToast('error', 'Error', 'Producto no encontrado');
    return;
  }

  // Eliminar modal anterior si existe
  const modalAnterior = document.getElementById('modal-editar-producto');
  if (modalAnterior) modalAnterior.remove();

  document.body.insertAdjacentHTML('beforeend', renderModalEditarProducto(producto));

  const modal = document.getElementById('modal-editar-producto')!;
  const form = document.getElementById('form-editar-producto') as HTMLFormElement;

  // Eventos de cerrar
  document.getElementById('btn-cerrar-editar')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-editar')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  // Zona de imagen: click, preview y eliminar
  const zonaImagenEdit = document.getElementById('zona-imagen-editar');
  const inputImagenEdit = document.getElementById('edit-imagen') as HTMLInputElement;
  if (zonaImagenEdit && inputImagenEdit) {
    zonaImagenEdit.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement;
      if (target.id === 'btn-eliminar-imagen' || target.id === 'btn-quitar-imagen-editar') return;
      inputImagenEdit.click();
    });
    inputImagenEdit.addEventListener('change', () => {
      const file = inputImagenEdit.files?.[0];
      const preview = document.getElementById('preview-imagen-editar');
      if (file && preview) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          preview.innerHTML = `
            <div style="position: relative; display: inline-block;">
              <img src="${ev.target?.result}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 6px; object-fit: cover;">
              <button type="button" id="btn-quitar-imagen-editar" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Quitar imagen">&times;</button>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Haz clic para cambiar la imagen</div>
          `;
          document.getElementById('btn-quitar-imagen-editar')?.addEventListener('click', (e) => {
            e.stopPropagation();
            inputImagenEdit.value = '';
            preview.innerHTML = `
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom: 8px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <div style="font-size: 13px; color: #64748b;">Haz clic para subir una imagen del producto</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">JPG, PNG o WEBP • Máx. 5MB</div>
            `;
          });
        };
        reader.readAsDataURL(file);
      }
    });
    // Botón eliminar imagen existente
    document.getElementById('btn-eliminar-imagen')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const productoId = parseInt(form.dataset.productoId || '0');
      if (!productoId) return;
      try {
        await productoService.eliminarImagen(productoId);
        const preview = document.getElementById('preview-imagen-editar');
        if (preview) {
          preview.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom: 8px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <div style="font-size: 13px; color: #64748b;">Haz clic para subir una imagen del producto</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">JPG, PNG o WEBP • Máx. 5MB</div>
          `;
        }
        mostrarToast('success', 'Imagen eliminada', 'La imagen del producto fue eliminada');
      } catch (err) {
        mostrarToast('error', 'Error', 'No se pudo eliminar la imagen');
      }
    });
  }

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const productoId = parseInt(form.dataset.productoId || '0');

    const data: any = {};
    const descripcion = formData.get('descripcion') as string;
    if (descripcion) data.descripcion = descripcion;

    const idCat = formData.get('id_categoria') as string;
    if (idCat) data.id_categoria = Number(idCat);

    const nLote = formData.get('n_lote') as string;
    if (nLote) data.n_lote = nLote;

    const ubicacion = formData.get('ubicacion') as string;
    if (ubicacion) data.ubicacion = ubicacion;

    const unidad = formData.get('unidad') as string;
    data.unidad = unidad || null;

    const precio = formData.get('precio_unitario') as string;
    data.precio_unitario = precio ? parseFloat(precio) : null;

    const stockSeguridad = formData.get('stock_seguridad') as string;
    data.stock_seguridad = stockSeguridad ? Number(stockSeguridad) : 0;

    const fecha = formData.get('fecha_vencim') as string;
    data.fecha_vencim = fecha || null;

    const ingreActivo = (formData.get('ingre_activo') as string)?.trim();
    data.ingre_activo = ingreActivo || null;

    const plagObjetivo = (formData.get('plag_objetivo') as string)?.trim();
    data.plag_objetivo = plagObjetivo || null;

    const presentacion = (formData.get('presentacion') as string)?.trim();
    data.presentacion = presentacion || null;

    const estado = formData.get('estado') as string;
    if (estado) data.estado = estado;

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Guardando...';
    }

    try {
      const response = await productoService.update(productoId, data);
      if (response.success) {
        // Subir imagen si se seleccionó una nueva
        const imgInput = document.getElementById('edit-imagen') as HTMLInputElement;
        const archivoImg = imgInput?.files?.[0];
        if (archivoImg) {
          try {
            await productoService.subirImagen(productoId, archivoImg);
          } catch (imgError) {
            console.error('Error subiendo imagen:', imgError);
            mostrarToast('warning', 'Producto actualizado', 'Se actualizó pero hubo un error al subir la imagen');
          }
        }

        modal.remove();
        mostrarToast('success', 'Producto actualizado', `${data.descripcion || 'Producto'} se actualizó correctamente`);
        await cargarProductos();
        await cargarEstadisticas();
      }
    } catch (error: any) {
      let msg = 'Error al actualizar el producto';
      if (error.data?.errors) {
        msg = Object.entries(error.data.errors).map(([f, m]: [string, any]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n');
      } else if (error.data?.message) {
        msg = error.data.message;
      }
      mostrarToast('error', 'Error', msg);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Guardar Cambios';
      }
    }
  });
}

// ===== ELIMINAR PRODUCTO =====

function confirmarEliminarProducto(id: number) {
  const producto = productosData.find(p => p.id === id);
  if (!producto) return;

  // Eliminar modal anterior si existe
  const modalAnterior = document.getElementById('modal-confirmar-eliminar');
  if (modalAnterior) modalAnterior.remove();

  const html = `
    <div id="modal-confirmar-eliminar" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 440px;">
        <div class="modal-header">
          <h2>Eliminar Producto</h2>
          <button class="modal-close" id="btn-cerrar-eliminar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 32px 24px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <p style="font-size: 15px; color: #334155; margin-bottom: 8px;">¿Estás seguro de eliminar este producto?</p>
          <p style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">${producto.descripcion}</p>
          <p style="font-size: 13px; color: #64748b;">SKU: ${producto.sku || 'N/A'}</p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 12px;">El producto será desactivado y no se mostrará en el inventario.</p>
        </div>
        <div class="modal-footer" style="display: flex; gap: 12px; justify-content: center; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
          <button class="btn-secondary" id="btn-cancelar-eliminar">Cancelar</button>
          <button class="btn-primary" id="btn-confirmar-eliminar" style="background: #dc2626; border-color: #dc2626;">Eliminar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal-confirmar-eliminar')!;
  document.getElementById('btn-cerrar-eliminar')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  document.getElementById('btn-confirmar-eliminar')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-confirmar-eliminar') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Eliminando...';

    try {
      const response = await productoService.delete(id);
      if (response.success) {
        modal.remove();
        mostrarToast('success', 'Producto eliminado', `${producto.descripcion} fue desactivado correctamente`);
        await cargarProductos();
        await cargarEstadisticas();
      }
    } catch (error: any) {
      const msg = error.data?.message || 'Error al eliminar el producto';
      mostrarToast('error', 'Error', msg);
      btn.disabled = false;
      btn.textContent = 'Eliminar';
    }
  });
}

// Exponer funciones al contexto global para que puedan ser llamadas desde el HTML
(window as any).cerrarModalNuevoProducto = cerrarModalNuevoProducto;
