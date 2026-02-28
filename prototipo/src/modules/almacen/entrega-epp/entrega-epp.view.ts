import { entregaEppService, type EntregaEpp, type EntregaEppEstadisticas, type ProductoEpp, type EntregaEppFiltros } from '../../../services/entregaEppService';
import { tecnicoService } from '../../../services/tecnicoService';
import { mostrarToast } from '../../../shared/toast';
import { apiClient } from '../../../core/api/api.client';

// Estado global del módulo
let entregasData: EntregaEpp[] = [];
let estadisticasData: EntregaEppEstadisticas | null = null;
let productosEppData: ProductoEpp[] = [];
let tecnicosData: any[] = [];
let currentFilters: EntregaEppFiltros = {};
let detallesTemp: { id_producto: number; cantidad: number; observacion: string; descripcion: string; stock: number }[] = [];

// ─── RENDER PRINCIPAL ───
export function renderEntregaEpp() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Almacén / Entrega EPP</div>
      <div class="page-actions">
        <button class="btn-primary" id="btn-nueva-entrega-epp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Entrega
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row" id="epp-stats" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Entregas</div>
          <div class="stat-box-value" id="stat-total">—</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Entregas Activas</div>
          <div class="stat-box-value" id="stat-activas">—</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Devoluciones (Mes)</div>
          <div class="stat-box-value" id="stat-devoluciones">—</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Técnicos con EPP</div>
          <div class="stat-box-value" id="stat-tecnicos">—</div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="op-filters-bar">
      <div class="op-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" id="epp-search" placeholder="Buscar por técnico o N° entrega..." class="op-search-input">
      </div>

      <div class="op-filter-group">
        <select class="op-filter-select" id="epp-estado-filter">
          <option value="">Todos los estados</option>
          <option value="Entregado">Entregado</option>
          <option value="Devuelto">Devuelto</option>
        </select>

        <input type="date" id="epp-fecha-desde" class="op-filter-select" title="Fecha desde">
        <input type="date" id="epp-fecha-hasta" class="op-filter-select" title="Fecha hasta">

        <button class="btn-primary" id="btn-buscar-epp" style="padding: 8px 16px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          Buscar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>N° ENTREGA</th>
            <th>TÉCNICO</th>
            <th>FECHA ENTREGA</th>
            <th>EQUIPOS</th>
            <th>ESTADO</th>
            <th>REGISTRADO POR</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="epp-table-body">
          <tr>
            <td colspan="7" style="text-align: center; padding: 40px;">
              <div class="loading-text">Cargando entregas EPP...</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal nueva entrega -->
    <div class="op-form-overlay" id="modal-entrega-epp" style="display:none;">
      <div class="op-form-card" style="max-width:1050px;">
        <div class="op-form-header">
          <h2 class="op-form-title" id="modal-epp-titulo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Nueva Entrega de EPP
          </h2>
          <button class="op-btn-close" id="btn-cerrar-modal-epp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="op-form-content" id="modal-epp-body">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>

    <!-- Modal detalle -->
    <div class="op-form-overlay" id="modal-detalle-epp" style="display:none;">
      <div class="op-form-card" style="max-width:900px;">
        <div class="op-form-header">
          <h2 class="op-form-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Detalle de Entrega EPP
          </h2>
          <button class="op-btn-close" id="btn-cerrar-detalle-epp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="op-form-content" id="modal-detalle-body">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>

    <!-- Modal devolución -->
    <div class="op-form-overlay" id="modal-devolucion-epp" style="display:none;">
      <div class="op-form-card" style="max-width:900px;">
        <div class="op-form-header">
          <h2 class="op-form-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            Registrar Devolución
          </h2>
          <button class="op-btn-close" id="btn-cerrar-devolucion-epp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="op-form-content" id="modal-devolucion-body">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>
  `;
}

// ─── CARGAR DATOS ───
async function cargarEstadisticas() {
  try {
    const response = await entregaEppService.getEstadisticas();
    if (response.success && response.data) {
      estadisticasData = response.data;
      actualizarEstadisticas();
    }
  } catch (error) {
    console.error('Error cargando estadísticas EPP:', error);
  }
}

function actualizarEstadisticas() {
  if (!estadisticasData) return;
  const el = (id: string) => document.getElementById(id);
  const s = estadisticasData;
  if (el('stat-total')) el('stat-total')!.textContent = String(s.total_entregas);
  if (el('stat-activas')) el('stat-activas')!.textContent = String(s.entregas_activas);
  if (el('stat-devoluciones')) el('stat-devoluciones')!.textContent = String(s.devoluciones_mes ?? 0);
  if (el('stat-tecnicos')) el('stat-tecnicos')!.textContent = String(s.tecnicos_con_epp);
}

async function cargarEntregas() {
  try {
    const response = await entregaEppService.getAll(currentFilters);
    if (response.success) {
      entregasData = response.data;
      renderTabla();
    }
  } catch (error) {
    console.error('Error cargando entregas EPP:', error);
    const tbody = document.getElementById('epp-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#c00;">Error al cargar datos</td></tr>';
  }
}

function renderTabla() {
  const tbody = document.getElementById('epp-table-body');
  if (!tbody) return;

  if (entregasData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#888;">No se encontraron entregas EPP</td></tr>';
    return;
  }

  tbody.innerHTML = entregasData.map(e => {
    const tecNombre = e.tecnico ? `${e.tecnico.nombre} ${e.tecnico.apellidos}` : '—';
    const registrador = e.registrador ? `${(e.registrador as any).nombre} ${(e.registrador as any).apellidos || ''}`.trim() : '—';
    const fechaEntrega = e.fecha_entrega ? new Date(e.fecha_entrega).toLocaleDateString('es-PE') : '—';
    const numEquipos = e.detalles ? e.detalles.length : 0;
    const badgeClass = e.estado === 'Entregado' ? 'orange' : 'green';

    return `
      <tr>
        <td><strong>${e.numero_entrega}</strong></td>
        <td>
          <div class="equipment-info">
            <div>
              <div class="equipment-name">${tecNombre}</div>
              <div class="equipment-id">DNI: ${e.tecnico?.dni || '—'}</div>
            </div>
          </div>
        </td>
        <td>${fechaEntrega}</td>
        <td style="text-align:center;">${numEquipos} item(s)</td>
        <td><span class="badge ${badgeClass}">${e.estado}</span></td>
        <td>${registrador}</td>
        <td>
          <div style="display:flex;gap:4px;">
            <button class="op-btn-icon btn-ver-epp" data-id="${e.id}" title="Ver detalle" style="color:#2563eb;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="op-btn-icon btn-pdf-epp" data-id="${e.id}" title="Descargar PDF" style="color:#2c4a7c;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </button>
            ${e.estado === 'Entregado' ? `
              <button class="op-btn-icon btn-devolver-epp" data-id="${e.id}" title="Registrar devolución" style="color:#16a34a;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  bindTableEvents();
}

function bindTableEvents() {
  // Ver detalle
  document.querySelectorAll('.btn-ver-epp').forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      const id = parseInt((ev.currentTarget as HTMLElement).dataset.id || '0');
      if (id) await abrirDetalle(id);
    });
  });

  // Descargar PDF
  document.querySelectorAll('.btn-pdf-epp').forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      const id = parseInt((ev.currentTarget as HTMLElement).dataset.id || '0');
      if (id) {
        try {
          await apiClient.downloadFile(`/entrega-epp/${id}/pdf?download=1`, `constancia-epp-${id}.pdf`);
        } catch (e) {
          console.error('Error descargando PDF:', e);
          mostrarToast('error', 'Error', 'Error al descargar PDF');
        }
      }
    });
  });

  // Devolver
  document.querySelectorAll('.btn-devolver-epp').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = parseInt((ev.currentTarget as HTMLElement).dataset.id || '0');
      if (id) abrirModalDevolucion(id);
    });
  });
}

// ─── MODAL NUEVA ENTREGA ───
async function abrirModalNuevaEntrega() {
  detallesTemp = [];

  // Cargar técnicos y productos EPP en paralelo
  try {
    const [tecRes, prodRes] = await Promise.all([
      tecnicoService.getAll(),
      entregaEppService.getProductosEpp()
    ]);
    tecnicosData = (tecRes as any).data || [];
    productosEppData = prodRes.data || [];
  } catch (e) {
    console.error('Error cargando datos para modal:', e);
    mostrarToast('error', 'Error', 'Error cargando datos');
    return;
  }

  const modal = document.getElementById('modal-entrega-epp');
  const body = document.getElementById('modal-epp-body');
  if (!modal || !body) return;

  const tecnicoOptions = tecnicosData
    .filter((t: any) => t.estado === 'Activo')
    .map((t: any) => `<option value="${t.id}">${t.nombre} ${t.apellidos} — DNI: ${t.dni || 'S/D'}</option>`)
    .join('');

  const productoOptions = productosEppData
    .map(p => `<option value="${p.id}" data-stock="${p.stock_disponible}">${p.descripcion} (Stock: ${p.stock_disponible})</option>`)
    .join('');

  body.innerHTML = `
    <form id="form-entrega-epp">
      <!-- Sección: Información General -->
      <div class="op-section">
        <h3 class="op-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Información General
        </h3>
        <div class="op-grid">
          <div class="op-field">
            <label class="op-label">Técnico <span class="op-required">*</span></label>
            <select class="op-input" id="epp-tecnico" required>
              <option value="">Seleccionar técnico...</option>
              ${tecnicoOptions}
            </select>
          </div>
          <div class="op-field">
            <label class="op-label">Fecha de Entrega <span class="op-required">*</span></label>
            <input type="date" class="op-input" id="epp-fecha" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="op-field" style="grid-column: 1 / -1;">
            <label class="op-label">Observaciones <span class="op-optional">(opcional)</span></label>
            <textarea class="op-input" id="epp-observaciones" rows="2" placeholder="Observaciones generales..." style="resize:vertical;"></textarea>
          </div>
        </div>
      </div>

      <!-- Sección: Equipos EPP -->
      <div class="op-section">
        <div class="op-section-header">
          <h3 class="op-section-title" style="margin-bottom:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Equipos EPP a Entregar
          </h3>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:16px;align-items:flex-end;">
          <div class="op-field" style="flex:3;">
            <label class="op-label">Producto EPP</label>
            <select class="op-input" id="epp-producto-select">
              <option value="">Seleccionar equipo...</option>
              ${productoOptions}
            </select>
          </div>
          <div class="op-field" style="flex:1;">
            <label class="op-label">Cantidad</label>
            <input type="number" class="op-input" id="epp-producto-cantidad" min="1" value="1">
          </div>
          <div class="op-field" style="flex:2;">
            <label class="op-label">Observación</label>
            <input type="text" class="op-input" id="epp-producto-obs" placeholder="Opcional">
          </div>
          <button type="button" class="op-btn-secondary" id="btn-agregar-item-epp" style="padding:10px 16px;white-space:nowrap;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Agregar
          </button>
        </div>

        <div class="op-table-wrapper">
          <table class="op-table">
            <thead>
              <tr>
                <th style="width:45%;">Equipo</th>
                <th style="width:15%;">Cantidad</th>
                <th style="width:25%;">Observación</th>
                <th style="width:15%;"></th>
              </tr>
            </thead>
            <tbody id="items-epp-body">
              <tr id="items-epp-empty">
                <td colspan="4" style="text-align:center;color:#94a3b8;padding:24px;">No se han agregado equipos aún</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="op-form-actions" style="padding:20px 0 0;">
        <button type="button" class="op-btn-cancel" id="btn-cancelar-epp">Cancelar</button>
        <button type="submit" class="op-btn-submit" id="btn-guardar-epp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          Registrar Entrega
        </button>
      </div>
    </form>
  `;

  modal.style.display = 'flex';
  bindModalNuevaEntregaEvents();
}

function bindModalNuevaEntregaEvents() {
  // Cerrar
  document.getElementById('btn-cerrar-modal-epp')?.addEventListener('click', cerrarModales);
  document.getElementById('btn-cancelar-epp')?.addEventListener('click', cerrarModales);

  // Agregar item
  document.getElementById('btn-agregar-item-epp')?.addEventListener('click', agregarItemEpp);

  // Submit
  document.getElementById('form-entrega-epp')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await guardarEntrega();
  });

  // Cerrar al hacer clic en overlay
  document.getElementById('modal-entrega-epp')?.addEventListener('click', (ev) => {
    if ((ev.target as HTMLElement).classList.contains('op-form-overlay')) cerrarModales();
  });
}

function agregarItemEpp() {
  const selectProd = document.getElementById('epp-producto-select') as HTMLSelectElement;
  const inputCant = document.getElementById('epp-producto-cantidad') as HTMLInputElement;
  const inputObs = document.getElementById('epp-producto-obs') as HTMLInputElement;

  const idProducto = parseInt(selectProd.value);
  const cantidad = parseInt(inputCant.value);
  const observacion = inputObs.value.trim();

  if (!idProducto) { mostrarToast('error', 'Validación', 'Seleccione un producto EPP'); return; }
  if (!cantidad || cantidad < 1) { mostrarToast('error', 'Validación', 'La cantidad debe ser al menos 1'); return; }

  // Buscar producto para datos
  const prod = productosEppData.find(p => p.id === idProducto);
  if (!prod) return;

  // Verificar stock
  if (cantidad > prod.stock_disponible) {
    mostrarToast('error', 'Stock', `Stock insuficiente. Disponible: ${prod.stock_disponible}`);
    return;
  }

  // Verificar duplicado
  if (detallesTemp.find(d => d.id_producto === idProducto)) {
    mostrarToast('error', 'Duplicado', 'Este producto ya fue agregado');
    return;
  }

  detallesTemp.push({ id_producto: idProducto, cantidad, observacion, descripcion: prod.descripcion, stock: prod.stock_disponible });
  renderItemsEpp();

  // Limpiar
  selectProd.value = '';
  inputCant.value = '1';
  inputObs.value = '';
}

function renderItemsEpp() {
  const tbody = document.getElementById('items-epp-body');
  if (!tbody) return;

  if (detallesTemp.length === 0) {
    tbody.innerHTML = '<tr id="items-epp-empty"><td colspan="4" style="text-align:center;color:#94a3b8;padding:24px;">No se han agregado equipos aún</td></tr>';
    return;
  }

  tbody.innerHTML = detallesTemp.map((d, i) => `
    <tr>
      <td style="font-weight:500;">${d.descripcion}</td>
      <td style="text-align:center;">${d.cantidad}</td>
      <td style="color:#64748b;">${d.observacion || '—'}</td>
      <td style="text-align:center;">
        <button type="button" class="op-btn-remove btn-remove-item-epp" data-index="${i}" title="Quitar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </td>
    </tr>
  `).join('');

  // Bind remove buttons
  tbody.querySelectorAll('.btn-remove-item-epp').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const idx = parseInt((ev.currentTarget as HTMLElement).dataset.index || '0');
      detallesTemp.splice(idx, 1);
      renderItemsEpp();
    });
  });
}

async function guardarEntrega() {
  const tecnicoId = parseInt((document.getElementById('epp-tecnico') as HTMLSelectElement).value);
  const fecha = (document.getElementById('epp-fecha') as HTMLInputElement).value;
  const observaciones = (document.getElementById('epp-observaciones') as HTMLTextAreaElement).value.trim();

  if (!tecnicoId) { mostrarToast('error', 'Validación', 'Seleccione un técnico'); return; }
  if (!fecha) { mostrarToast('error', 'Validación', 'Seleccione la fecha de entrega'); return; }
  if (detallesTemp.length === 0) { mostrarToast('error', 'Validación', 'Agregue al menos un equipo EPP'); return; }

  const btnGuardar = document.getElementById('btn-guardar-epp') as HTMLButtonElement;
  if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = 'Guardando...'; }

  try {
    const response = await entregaEppService.create({
      id_tecnico: tecnicoId,
      fecha_entrega: fecha,
      observaciones: observaciones || undefined,
      detalles: detallesTemp.map(d => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        observacion: d.observacion || undefined,
      })),
    });

    if (response.success) {
      mostrarToast('success', 'Éxito', response.message || 'Entrega registrada correctamente');
      cerrarModales();
      cargarEntregas();
      cargarEstadisticas();

      // Descargar PDF automáticamente
      try {
        const nuevaEntrega = response.data;
        await apiClient.downloadFile(`/entrega-epp/${nuevaEntrega.id}/pdf?download=1`, `constancia-epp-${nuevaEntrega.numero_entrega}.pdf`);
      } catch (e) {
        console.error('Error descargando PDF:', e);
      }
    }
  } catch (error: any) {
    console.error('Error creando entrega EPP:', error);
    const msg = error?.data?.message || error?.message || 'Error al registrar la entrega';
    mostrarToast('error', 'Error', msg);
  } finally {
    if (btnGuardar) { btnGuardar.disabled = false; btnGuardar.textContent = 'Registrar Entrega'; }
  }
}

// ─── MODAL DETALLE ───
async function abrirDetalle(id: number) {
  try {
    const response = await entregaEppService.getById(id);
    if (!response.success) return;

    const e = response.data;
    const tecNombre = e.tecnico ? `${e.tecnico.nombre} ${e.tecnico.apellidos}` : '—';
    const registrador = e.registrador ? `${e.registrador.nombre} ${e.registrador.apellidos}` : '—';
    const fechaEntrega = e.fecha_entrega ? new Date(e.fecha_entrega).toLocaleDateString('es-PE') : '—';
    const fechaDevol = e.fecha_devolucion ? new Date(e.fecha_devolucion).toLocaleDateString('es-PE') : '—';

    const modal = document.getElementById('modal-detalle-epp');
    const body = document.getElementById('modal-detalle-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <!-- Sección: Datos de la entrega -->
      <div class="op-section">
        <h3 class="op-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Información de la Entrega
        </h3>
        <div class="op-grid">
          <div class="op-field">
            <label class="op-label">N° Entrega</label>
            <input class="op-input" readonly value="${e.numero_entrega}">
          </div>
          <div class="op-field">
            <label class="op-label">Estado</label>
            <div style="padding:11px 14px;"><span class="badge ${e.estado === 'Entregado' ? 'orange' : 'green'}" style="font-size:13px;padding:6px 14px;">${e.estado}</span></div>
          </div>
          <div class="op-field">
            <label class="op-label">Técnico</label>
            <input class="op-input" readonly value="${tecNombre}">
          </div>
          <div class="op-field">
            <label class="op-label">DNI</label>
            <input class="op-input" readonly value="${e.tecnico?.dni || '—'}">
          </div>
          <div class="op-field">
            <label class="op-label">Fecha Entrega</label>
            <input class="op-input" readonly value="${fechaEntrega}">
          </div>
          <div class="op-field">
            <label class="op-label">Registrado por</label>
            <input class="op-input" readonly value="${registrador}">
          </div>
          ${e.estado === 'Devuelto' ? `
            <div class="op-field">
              <label class="op-label">Fecha Devolución</label>
              <input class="op-input" readonly value="${fechaDevol}">
            </div>
            <div class="op-field">
              <label class="op-label">Devuelto por</label>
              <input class="op-input" readonly value="${e.devolvedor ? `${e.devolvedor.nombre} ${e.devolvedor.apellidos}` : '—'}">
            </div>
          ` : ''}
        </div>
      </div>

      ${e.observaciones ? `
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
          <div><strong style="color:#0284c7;">Observaciones:</strong> <span style="color:#475569;">${e.observaciones}</span></div>
        </div>
      ` : ''}
      ${e.motivo_devolucion ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          <div><strong style="color:#16a34a;">Motivo devolución:</strong> <span style="color:#475569;">${e.motivo_devolucion}</span></div>
        </div>
      ` : ''}

      <!-- Sección: Equipos -->
      <div class="op-section">
        <h3 class="op-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Equipos Entregados
        </h3>
        <div class="op-table-wrapper">
          <table class="op-table">
            <thead>
              <tr>
                <th style="width:5%;">#</th>
                <th style="width:${e.estado === 'Devuelto' ? '28%' : '47%'};">Equipo</th>
                <th style="width:8%;">Cant.</th>
                <th style="width:${e.estado === 'Devuelto' ? '17%' : '30%'};">Observación</th>
                ${e.estado === 'Devuelto' ? `
                  <th style="width:14%;">Condición</th>
                  <th style="width:28%;">Obs. Devolución</th>
                ` : ''}
              </tr>
            </thead>
            <tbody>
              ${(e.detalles || []).map((d: any, i: number) => `
                <tr>
                  <td style="text-align:center;">${i + 1}</td>
                  <td style="font-weight:500;">${d.producto?.descripcion || '—'}</td>
                  <td style="text-align:center;">${d.cantidad}</td>
                  <td style="color:#64748b;">${d.observacion || '—'}</td>
                  ${e.estado === 'Devuelto' ? `
                    <td style="text-align:center;">
                      <span style="padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;
                        ${d.condicion_devolucion === 'Malo' ? 'background:#fee2e2;color:#dc2626;' :
                          d.condicion_devolucion === 'Regular' ? 'background:#fef3c7;color:#d97706;' :
                          d.condicion_devolucion === 'No devuelto' ? 'background:#f1f5f9;color:#64748b;' :
                          'background:#dcfce7;color:#16a34a;'}">
                        ${d.condicion_devolucion || '—'}
                      </span>
                    </td>
                    <td style="color:#64748b;font-size:12px;">${d.observacion_devolucion || '—'}</td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="op-form-actions" style="padding:20px 0 0;">
        <button class="op-btn-cancel" id="btn-pdf-detalle-epp" data-id="${e.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Descargar PDF
        </button>
        ${e.estado === 'Entregado' ? `
          <button class="op-btn-submit" id="btn-devolver-detalle-epp" data-id="${e.id}" style="background:#16a34a;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            Registrar Devolución
          </button>
        ` : ''}
      </div>
    `;

    modal.style.display = 'flex';

    // Eventos del detalle
    document.getElementById('btn-cerrar-detalle-epp')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (ev) => { if ((ev.target as HTMLElement).classList.contains('op-form-overlay')) modal.style.display = 'none'; });
    document.getElementById('btn-pdf-detalle-epp')?.addEventListener('click', async () => {
      try {
        await apiClient.downloadFile(`/entrega-epp/${e.id}/pdf?download=1`, `constancia-epp-${e.numero_entrega}.pdf`);
      } catch (err) {
        mostrarToast('error', 'Error', 'Error al descargar PDF');
      }
    });

    document.getElementById('btn-devolver-detalle-epp')?.addEventListener('click', () => {
      modal.style.display = 'none';
      abrirModalDevolucion(e.id);
    });

  } catch (error) {
    console.error('Error cargando detalle:', error);
    mostrarToast('error', 'Error', 'Error al cargar el detalle');
  }
}

// ─── MODAL DEVOLUCIÓN ───
async function abrirModalDevolucion(id: number) {
  const modal = document.getElementById('modal-devolucion-epp');
  const body = document.getElementById('modal-devolucion-body');
  if (!modal || !body) return;

  // Cargar datos de la entrega para mostrar los equipos
  body.innerHTML = '<div style="text-align:center;padding:40px;"><div class="loading-text">Cargando datos...</div></div>';
  modal.style.display = 'flex';

  try {
    const response = await entregaEppService.getById(id);
    if (!response.success || !response.data) {
      mostrarToast('error', 'Error', 'No se pudo cargar la entrega');
      modal.style.display = 'none';
      return;
    }

    const entrega = response.data;
    const tecNombre = entrega.tecnico ? `${entrega.tecnico.nombre} ${entrega.tecnico.apellidos}` : '—';

    body.innerHTML = `
      <form id="form-devolucion-epp">
        <!-- Info de la entrega -->
        <div class="op-section">
          <h3 class="op-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Información de la Entrega
          </h3>
          <div class="op-grid">
            <div class="op-field">
              <label class="op-label">N° Entrega</label>
              <input class="op-input" readonly value="${entrega.numero_entrega}">
            </div>
            <div class="op-field">
              <label class="op-label">Técnico</label>
              <input class="op-input" readonly value="${tecNombre}">
            </div>
            <div class="op-field">
              <label class="op-label">Fecha Entrega</label>
              <input class="op-input" readonly value="${new Date(entrega.fecha_entrega).toLocaleDateString('es-PE')}">
            </div>
          </div>
        </div>

        <!-- Estado de equipos -->
        <div class="op-section">
          <h3 class="op-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Estado de Equipos al Devolver
          </h3>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
            <span style="color:#475569;font-size:13px;">Indique la condición en que se devuelve cada equipo. Los equipos serán reingresados al inventario.</span>
          </div>
          <div class="op-table-wrapper">
            <table class="op-table">
              <thead>
                <tr>
                  <th style="width:5%;">#</th>
                  <th style="width:30%;">Equipo</th>
                  <th style="width:8%;">Cant.</th>
                  <th style="width:22%;">Condición</th>
                  <th style="width:35%;">Observación de devolución</th>
                </tr>
              </thead>
              <tbody>
                ${(entrega.detalles || []).map((d: any, i: number) => `
                  <tr>
                    <td style="text-align:center;">${i + 1}</td>
                    <td style="font-weight:500;">${d.producto?.descripcion || '—'}</td>
                    <td style="text-align:center;">${d.cantidad}</td>
                    <td>
                      <select class="op-input epp-condicion-select" data-detalle-id="${d.id}" style="padding:8px 10px;font-size:12px;">
                        <option value="Bueno" selected>Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Malo">Malo</option>
                        <option value="No devuelto">No devuelto</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" class="op-input epp-obs-devolucion" data-detalle-id="${d.id}" placeholder="Opcional..." style="padding:8px 10px;font-size:12px;">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Motivo general -->
        <div class="op-section">
          <div class="op-field">
            <label class="op-label">Motivo general de devolución <span class="op-optional">(opcional)</span></label>
            <textarea class="op-input" id="epp-motivo-devolucion" rows="2" placeholder="Ej: Fin de contrato, cambio de equipo, etc." style="resize:vertical;"></textarea>
          </div>
        </div>

        <div class="op-form-actions" style="padding:20px 0 0;">
          <button type="button" class="op-btn-cancel" id="btn-cancelar-devolucion">Cancelar</button>
          <button type="submit" class="op-btn-submit" id="btn-confirmar-devolucion" style="background:#16a34a;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Confirmar Devolución
          </button>
        </div>
      </form>
    `;

    // Eventos
    document.getElementById('btn-cerrar-devolucion-epp')?.addEventListener('click', () => { modal.style.display = 'none'; });
    document.getElementById('btn-cancelar-devolucion')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (ev) => { if ((ev.target as HTMLElement).classList.contains('op-form-overlay')) modal.style.display = 'none'; });

    document.getElementById('form-devolucion-epp')?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const motivo = (document.getElementById('epp-motivo-devolucion') as HTMLTextAreaElement).value.trim();

      // Recopilar condición y observaciones de cada equipo
      const detallesDevolucion: { id: number; condicion_devolucion: string; observacion_devolucion?: string }[] = [];
      document.querySelectorAll('.epp-condicion-select').forEach((sel) => {
        const select = sel as HTMLSelectElement;
        const detalleId = parseInt(select.dataset.detalleId || '0');
        const obsInput = document.querySelector(`.epp-obs-devolucion[data-detalle-id="${detalleId}"]`) as HTMLInputElement;
        detallesDevolucion.push({
          id: detalleId,
          condicion_devolucion: select.value,
          observacion_devolucion: obsInput?.value.trim() || undefined,
        });
      });

      const btnConfirmar = document.getElementById('btn-confirmar-devolucion') as HTMLButtonElement;
      if (btnConfirmar) { btnConfirmar.disabled = true; btnConfirmar.textContent = 'Procesando...'; }

      try {
        const response = await entregaEppService.devolver(id, {
          motivo_devolucion: motivo || undefined,
          detalles: detallesDevolucion,
        });
        if (response.success) {
          mostrarToast('success', 'Éxito', response.message || 'Devolución registrada correctamente');
          modal.style.display = 'none';
          cargarEntregas();
          cargarEstadisticas();
        }
      } catch (error: any) {
        console.error('Error registrando devolución:', error);
        mostrarToast('error', 'Error', error?.data?.message || 'Error al registrar la devolución');
      } finally {
        if (btnConfirmar) { btnConfirmar.disabled = false; btnConfirmar.textContent = 'Confirmar Devolución'; }
      }
    });

  } catch (error) {
    console.error('Error cargando entrega para devolución:', error);
    mostrarToast('error', 'Error', 'Error al cargar datos de la entrega');
    modal.style.display = 'none';
  }
}

// ─── CERRAR MODALES ───
function cerrarModales() {
  ['modal-entrega-epp', 'modal-detalle-epp', 'modal-devolucion-epp'].forEach(id => {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
  });
}

// ─── INIT EVENTS ───
export function initEntregaEppEvents() {
  cargarEstadisticas();
  cargarEntregas();

  // Botón nueva entrega
  document.getElementById('btn-nueva-entrega-epp')?.addEventListener('click', abrirModalNuevaEntrega);

  // Búsqueda
  const searchInput = document.getElementById('epp-search') as HTMLInputElement;
  if (searchInput) {
    let searchTimeout: number;
    searchInput.addEventListener('input', (ev) => {
      clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        currentFilters.buscar = (ev.target as HTMLInputElement).value;
        cargarEntregas();
      }, 500);
    });
  }

  // Filtro estado
  document.getElementById('epp-estado-filter')?.addEventListener('change', (ev) => {
    currentFilters.estado = (ev.target as HTMLSelectElement).value;
    cargarEntregas();
  });

  // Botón buscar (fechas)
  document.getElementById('btn-buscar-epp')?.addEventListener('click', () => {
    currentFilters.fecha_desde = (document.getElementById('epp-fecha-desde') as HTMLInputElement).value;
    currentFilters.fecha_hasta = (document.getElementById('epp-fecha-hasta') as HTMLInputElement).value;
    cargarEntregas();
  });
}
