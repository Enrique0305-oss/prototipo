// Comercial - Aprobación de Cotizaciones (con tabs por tipo)
import './aprobacion-cotizaciones.css';
import { cotizacionService } from '../../../services/cotizacionService';
import { mostrarToast } from '../../../shared/toast';

let allCotizaciones: any[] = [];
let activeTab = 'Todas';
const COTIZACION_EDIT_SESSION_KEY = 'cotizacion_edit_id';

const TIPOS_TAB = [
  { key: 'Todas', label: 'Todas', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>' },
  { key: 'Servicio', label: 'Servicios', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>' },
  { key: 'Producto', label: 'Productos', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>' },
  { key: 'Capacitacion', label: 'Capacitaciones', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>' },
];

export function renderAprobacionCotizaciones() {
  return `
  <div class="aprob-main-container">

    <!-- HEADER -->
    <div class="aprob-header">
      <div class="aprob-header-top">
        <h1 class="aprob-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Aprobación de Cotizaciones
        </h1>
      </div>

      <!-- STATS -->
      <div class="aprob-stats-grid">
        <div class="aprob-stat-card">
          <div class="aprob-stat-icon pending">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="aprob-stat-info">
            <span class="aprob-stat-label">Pendientes</span>
            <span class="aprob-stat-value" id="stat-aprob-pendientes">-</span>
          </div>
        </div>
        <div class="aprob-stat-card">
          <div class="aprob-stat-icon approved">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="aprob-stat-info">
            <span class="aprob-stat-label">Aceptadas</span>
            <span class="aprob-stat-value" id="stat-aprob-aceptadas">-</span>
          </div>
        </div>
        <div class="aprob-stat-card">
          <div class="aprob-stat-icon rejected">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="aprob-stat-info">
            <span class="aprob-stat-label">Rechazadas</span>
            <span class="aprob-stat-value" id="stat-aprob-rechazadas">-</span>
          </div>
        </div>
        <div class="aprob-stat-card">
          <div class="aprob-stat-icon total">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="aprob-stat-info">
            <span class="aprob-stat-label">Valor Pendiente</span>
            <span class="aprob-stat-value" id="stat-aprob-valor">-</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div class="aprob-tabs" id="aprob-tabs">
      ${TIPOS_TAB.map(t =>
        '<button class="aprob-tab' + (t.key === activeTab ? ' active' : '') + '" data-tab="' + t.key + '">' +
          t.icon + ' ' + t.label +
          ' <span class="tab-count" id="tab-count-' + t.key + '">0</span>' +
        '</button>'
      ).join('')}
    </div>

    <!-- FILTERS -->
    <div class="aprob-filters">
      <div class="aprob-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" id="aprob-search" class="aprob-search-input" placeholder="Buscar por N° cotización, cliente...">
      </div>
      <select class="aprob-filter-select" id="aprob-filter-estado">
        <option value="">Todos los estados</option>
        <option value="Pendiente" selected>Pendiente</option>
        <option value="Aceptada">Aceptada</option>
        <option value="Rechazada">Rechazada</option>
      </select>
    </div>

    <!-- TABLE -->
    <div class="aprob-table-container">
      <table class="aprob-table">
        <thead>
          <tr>
            <th>N° Cotización</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Fecha Emisión</th>
            <th>Subtotal</th>
            <th>IGV</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="aprob-tabla-body">
          <tr><td colspan="9" style="text-align:center;padding:40px;color:#64748b;">Cargando cotizaciones...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- DETAIL MODAL -->
    <div class="aprob-modal-overlay" id="aprob-modal-detalle">
      <div class="aprob-modal-card">
        <div class="aprob-modal-header">
          <h2 class="aprob-modal-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span id="aprob-modal-numero">Detalle Cotización</span>
          </h2>
          <button class="aprob-modal-close" id="aprob-modal-cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="aprob-modal-body" id="aprob-modal-body">
          <!-- Se llena dinámicamente -->
        </div>
        <div class="aprob-modal-footer" id="aprob-modal-footer">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>

    <!-- CONFIRM DIALOG -->
    <div class="aprob-confirm-overlay" id="aprob-confirm-dialog">
      <div class="aprob-confirm-card">
        <div class="aprob-confirm-icon" id="aprob-confirm-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="aprob-confirm-svg"></svg>
        </div>
        <div class="aprob-confirm-title" id="aprob-confirm-title"></div>
        <div class="aprob-confirm-text" id="aprob-confirm-text"></div>
        <div class="aprob-confirm-actions">
          <button class="aprob-confirm-cancel" id="aprob-confirm-cancelar">Cancelar</button>
          <button class="aprob-confirm-ok" id="aprob-confirm-ok"></button>
        </div>
      </div>
    </div>

  </div>
  `;
}

// ========================================
// STATE & HELPERS
// ========================================

function getFilteredCotizaciones(): any[] {
  const search = (document.getElementById('aprob-search') as HTMLInputElement)?.value?.trim().toLowerCase() || '';
  const estadoFilter = (document.getElementById('aprob-filter-estado') as HTMLSelectElement)?.value || '';

  const filtered = allCotizaciones.filter(c => {
    // Tab filter
    if (activeTab !== 'Todas' && c.tipo !== activeTab) return false;
    // Estado filter
    if (estadoFilter && c.estado !== estadoFilter) return false;
    // Search
    if (search) {
      const haystack = [c.numero, c.cliente_nombre].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  // Ordenar de más reciente a más antiguo.
  // 1) fecha_emision desc
  // 2) id desc (desempate cuando comparten la misma fecha)
  return filtered.sort((a, b) => {
    const fa = Date.parse(a?.fecha_emision || '') || 0;
    const fb = Date.parse(b?.fecha_emision || '') || 0;
    if (fb !== fa) return fb - fa;

    const ida = Number(a?.id || 0);
    const idb = Number(b?.id || 0);
    return idb - ida;
  });
}

function formatFecha(f: string | null | undefined): string {
  if (!f) return '-';
  const [y, m, d] = f.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

function getBadgeEstado(estado: string): string {
  const iconPendiente = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
  const iconAceptada = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  const iconRechazada = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  switch (estado) {
    case 'Pendiente': return '<span class="aprob-badge aprob-badge-warning">' + iconPendiente + ' Pendiente</span>';
    case 'Aceptada': return '<span class="aprob-badge aprob-badge-success">' + iconAceptada + ' Aceptada</span>';
    case 'Rechazada': return '<span class="aprob-badge aprob-badge-danger">' + iconRechazada + ' Rechazada</span>';
    default: return '<span class="aprob-badge aprob-badge-info">' + estado + '</span>';
  }
}

function getBadgeTipo(tipo: string): string {
  switch (tipo) {
    case 'Servicio': return '<span class="aprob-badge aprob-badge-info">Servicio</span>';
    case 'Producto': return '<span class="aprob-badge aprob-badge-purple">Producto</span>';
    case 'Capacitacion': return '<span class="aprob-badge aprob-badge-cyan">Capacitación</span>';
    default: return '<span class="aprob-badge aprob-badge-info">' + tipo + '</span>';
  }
}


// LOAD DATA

async function cargarCotizaciones() {
  try {
    const res = await cotizacionService.getAll();
    const raw = res.data || res;
    allCotizaciones = Array.isArray(raw) ? raw : (raw as any).data || [];
    actualizarStats();
    actualizarTabCounts();
    renderTabla();
  } catch (e) {
    console.error('Error cargando cotizaciones:', e);
    const tbody = document.getElementById('aprob-tabla-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar cotizaciones</td></tr>';
  }
}

function actualizarStats() {
  const pendientes = allCotizaciones.filter(c => c.estado === 'Pendiente');
  const aceptadas = allCotizaciones.filter(c => c.estado === 'Aceptada');
  const rechazadas = allCotizaciones.filter(c => c.estado === 'Rechazada');
  const valorPendiente = pendientes.reduce((sum: number, c: any) => sum + Number(c.total || 0), 0);

  const el = (id: string) => document.getElementById(id);
  if (el('stat-aprob-pendientes')) el('stat-aprob-pendientes')!.textContent = String(pendientes.length);
  if (el('stat-aprob-aceptadas')) el('stat-aprob-aceptadas')!.textContent = String(aceptadas.length);
  if (el('stat-aprob-rechazadas')) el('stat-aprob-rechazadas')!.textContent = String(rechazadas.length);
  if (el('stat-aprob-valor')) el('stat-aprob-valor')!.textContent = 'S/ ' + valorPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 });
}

function actualizarTabCounts() {
  const estadoFilter = (document.getElementById('aprob-filter-estado') as HTMLSelectElement)?.value || '';

  TIPOS_TAB.forEach(t => {
    const countEl = document.getElementById('tab-count-' + t.key);
    if (!countEl) return;
    let filtered = allCotizaciones;
    if (t.key !== 'Todas') filtered = filtered.filter(c => c.tipo === t.key);
    if (estadoFilter) filtered = filtered.filter(c => c.estado === estadoFilter);
    countEl.textContent = String(filtered.length);
  });
}

// ========================================
// RENDER TABLE
// ========================================

function renderTabla() {
  const tbody = document.getElementById('aprob-tabla-body');
  if (!tbody) return;

  const data = getFilteredCotizaciones();

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#64748b;">No se encontraron cotizaciones con estos filtros</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => {
    const isPendiente = c.estado === 'Pendiente';
    return '<tr>' +
      '<td><strong>' + (c.numero || '-') + '</strong></td>' +
      '<td>' + (c.cliente_nombre || '-') + '</td>' +
      '<td>' + getBadgeTipo(c.tipo) + '</td>' +
      '<td>' + formatFecha(c.fecha_emision) + '</td>' +
      '<td style="text-align:right;">S/ ' + Number(c.subtotal || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</td>' +
      '<td style="text-align:right;">S/ ' + Number(c.igv || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</td>' +
      '<td style="text-align:right;"><strong>S/ ' + Number(c.total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</strong></td>' +
      '<td>' + getBadgeEstado(c.estado) + '</td>' +
      '<td>' +
        '<div class="aprob-actions">' +
          (isPendiente
            ? '<button class="aprob-btn-approve btn-aprobar" data-id="' + c.id + '" title="Aceptar">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
                ' Aceptar' +
              '</button>' +
              '<button class="aprob-btn-reject btn-rechazar" data-id="' + c.id + '" title="Rechazar">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
                ' Rechazar' +
              '</button>'
            : '') +
          '<button class="aprob-btn-pdf btn-descargar-pdf" data-id="' + c.id + '" data-num="' + (c.numero || '') + '" title="Descargar PDF">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
            ' PDF' +
          '</button>' +
          '<button class="aprob-btn-edit btn-editar-cotiz" data-id="' + c.id + '" title="Editar cotización">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>' +
          '</button>' +
          '<button class="aprob-btn-view btn-ver-detalle" data-id="' + c.id + '" title="Ver detalle">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
          '</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');

  bindAccionesTabla();
}

// ========================================
// TABLE ACTIONS
// ========================================

function bindAccionesTabla() {
  // Aprobar
  document.querySelectorAll('.btn-aprobar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const cot = allCotizaciones.find(c => c.id === id);
      mostrarConfirmacion('Aceptada', id, cot?.numero || '');
    });
  });

  // Rechazar
  document.querySelectorAll('.btn-rechazar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const cot = allCotizaciones.find(c => c.id === id);
      mostrarConfirmacion('Rechazada', id, cot?.numero || '');
    });
  });

  // PDF
  document.querySelectorAll('.btn-descargar-pdf').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const num = (btn as HTMLElement).dataset.num || '';
      await descargarPDF(id, num);
    });
  });

  // Ver detalle
  document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirDetalle(id);
    });
  });

  // Editar cotización
  document.querySelectorAll('.btn-editar-cotiz').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      if (!id) return;
      irAEdicionCotizacion(id);
    });
  });
}

function irAEdicionCotizacion(id: number) {
  sessionStorage.setItem(COTIZACION_EDIT_SESSION_KEY, String(id));

  const abrirSubmenuCotizaciones = () => {
    const subCotizaciones = document.querySelector('.submenu-item[data-submenu="Cotizaciones"]') as HTMLButtonElement | null;
    if (!subCotizaciones) return false;
    subCotizaciones.click();
    return true;
  };

  if (abrirSubmenuCotizaciones()) {
    return;
  }

  const comercialBtn = document.querySelector('.nav-item[data-menu="Comercial"]') as HTMLButtonElement | null;
  if (!comercialBtn) {
    mostrarToast('warning', 'Navegación', 'No se pudo abrir el módulo de Cotizaciones');
    return;
  }

  comercialBtn.click();

  let intentos = 0;
  const timer = setInterval(() => {
    intentos += 1;
    if (abrirSubmenuCotizaciones()) {
      clearInterval(timer);
      return;
    }

    if (intentos >= 20) {
      clearInterval(timer);
      mostrarToast('warning', 'Navegación', 'No se encontró el acceso a Cotizaciones');
    }
  }, 100);
}

// ========================================
// CONFIRM DIALOG
// ========================================

let pendingAction: { estado: string; id: number } | null = null;

function mostrarConfirmacion(estado: string, id: number, numCot: string) {
  const dialog = document.getElementById('aprob-confirm-dialog') as HTMLElement;
  const iconEl = document.getElementById('aprob-confirm-icon') as HTMLElement;
  const svgEl = document.getElementById('aprob-confirm-svg') as unknown as SVGElement;
  const titleEl = document.getElementById('aprob-confirm-title') as HTMLElement;
  const textEl = document.getElementById('aprob-confirm-text') as HTMLElement;
  const okBtn = document.getElementById('aprob-confirm-ok') as HTMLButtonElement;

  pendingAction = { estado, id };

  if (estado === 'Aceptada') {
    iconEl.className = 'aprob-confirm-icon approve';
    svgEl.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
    titleEl.textContent = '¿Aceptar cotización?';
    textEl.innerHTML = 'Está a punto de <strong>aceptar</strong> la cotización <strong>' + numCot + '</strong>. Una vez aceptada, se podrá crear la orden correspondiente.';
    okBtn.className = 'aprob-confirm-ok approve';
    okBtn.textContent = 'Sí, Aceptar';
  } else {
    iconEl.className = 'aprob-confirm-icon reject';
    svgEl.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
    titleEl.textContent = '¿Rechazar cotización?';
    textEl.innerHTML = 'Está a punto de <strong>rechazar</strong> la cotización <strong>' + numCot + '</strong>. Esta acción puede revertirse cambiando el estado posteriormente.';
    okBtn.className = 'aprob-confirm-ok reject';
    okBtn.textContent = 'Sí, Rechazar';
  }

  dialog.style.display = 'flex';
}

async function ejecutarCambioEstado() {
  if (!pendingAction) return;
  const { estado, id } = pendingAction;
  const dialog = document.getElementById('aprob-confirm-dialog') as HTMLElement;

  try {
    await cotizacionService.cambiarEstado(id, estado as 'Aceptada' | 'Rechazada');
    dialog.style.display = 'none';
    pendingAction = null;
    mostrarToast('success', estado === 'Aceptada' ? 'Cotización Aceptada' : 'Cotización Rechazada',
      estado === 'Aceptada' ? 'La cotización fue aceptada exitosamente' : 'La cotización fue rechazada');
    await cargarCotizaciones();
  } catch (e: any) {
    console.error('Error cambiando estado:', e);
    const msg = e?.data?.message || e?.message || 'No se pudo cambiar el estado';
    mostrarToast('error', 'Error', msg);
    dialog.style.display = 'none';
    pendingAction = null;
  }
}

// ========================================
// PDF DOWNLOAD
// ========================================

async function descargarPDF(id: number, numCot: string) {
  try {
    const filename = numCot ? numCot.replace(/\s/g, '_') + '.pdf' : 'cotizacion_' + id + '.pdf';
    await cotizacionService.downloadPDF(id, filename);
    mostrarToast('success', 'PDF Descargado', 'Se descargó el PDF correctamente');
  } catch (e: any) {
    console.error('Error descargando PDF:', e);
    mostrarToast('error', 'Error', 'No se pudo descargar el PDF');
  }
}

// ========================================
// DETAIL MODAL
// ========================================

async function abrirDetalle(id: number) {
  const modal = document.getElementById('aprob-modal-detalle') as HTMLElement;
  const bodyEl = document.getElementById('aprob-modal-body') as HTMLElement;
  const footerEl = document.getElementById('aprob-modal-footer') as HTMLElement;
  const numEl = document.getElementById('aprob-modal-numero') as HTMLElement;

  bodyEl.innerHTML = '<div style="text-align:center;padding:40px;color:#64748b;">Cargando...</div>';
  footerEl.innerHTML = '';
  modal.style.display = 'flex';

  try {
    const res = await cotizacionService.getById(id);
    const raw = res.data || res;
    const cot = (raw as any).data || raw;

    numEl.textContent = cot.numero_cotizacion || 'Detalle Cotización';

    // Body
    const detalles = cot.detalles || [];
    bodyEl.innerHTML =
      '<div class="aprob-detail-grid">' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">N° Cotización</span><span class="aprob-detail-value">' + (cot.numero_cotizacion || '-') + '</span></div>' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">Estado</span><span class="aprob-detail-value">' + getBadgeEstado(cot.estado) + '</span></div>' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">Cliente</span><span class="aprob-detail-value">' + (cot.cliente?.nombre_empresa || '-') + '</span></div>' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">RUC</span><span class="aprob-detail-value">' + (cot.cliente?.ruc || '-') + '</span></div>' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">Tipo</span><span class="aprob-detail-value">' + getBadgeTipo(cot.tipo_cotizacion) + '</span></div>' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">Fecha Emisión</span><span class="aprob-detail-value">' + formatFecha(cot.fecha_emision) + '</span></div>' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">Creado por</span><span class="aprob-detail-value">' + (cot.creador ? (cot.creador.nombre + ' ' + (cot.creador.apellidos || '')) : '-') + '</span></div>' +
        '<div class="aprob-detail-item"><span class="aprob-detail-label">Incluye IGV</span><span class="aprob-detail-value">' + (cot.incluye_igv ? 'Sí (18%)' : 'No') + '</span></div>' +
      '</div>' +
      (cot.observaciones ? '<div style="margin-bottom:16px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;"><strong style="font-size:12px;color:#64748b;">OBSERVACIONES</strong><p style="margin:4px 0 0;font-size:13px;color:#334155;">' + cot.observaciones + '</p></div>' : '') +
      '<h4 style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:10px;">Detalle de Ítems (' + detalles.length + ')</h4>' +
      (detalles.length > 0
        ? '<table class="aprob-detail-table"><thead><tr>' +
            '<th>Descripción</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th>' +
          '</tr></thead><tbody>' +
          detalles.map((d: any) => {
            const nombre = d.catalogo_cap_aud?.nombre || d.servicio?.nombre || d.producto?.nombre || d.descripcion_manual || '-';
            const sub = (Number(d.cantidad || 1) * Number(d.precio_unitario || 0));
            return '<tr>' +
              '<td>' + nombre + '</td>' +
              '<td style="text-align:center;">' + (d.cantidad || 1) + '</td>' +
              '<td style="text-align:right;">S/ ' + Number(d.precio_unitario || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</td>' +
              '<td style="text-align:right;font-weight:600;">S/ ' + sub.toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</td>' +
            '</tr>';
          }).join('') +
          '<tr style="background:#f1f5f9;font-weight:600;">' +
            '<td colspan="3" style="text-align:right;padding:10px 14px;">Subtotal</td>' +
            '<td style="text-align:right;padding:10px 14px;">S/ ' + Number(cot.subtotal || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</td>' +
          '</tr>' +
          '<tr style="background:#f1f5f9;">' +
            '<td colspan="3" style="text-align:right;padding:10px 14px;font-weight:600;">IGV (18%)</td>' +
            '<td style="text-align:right;padding:10px 14px;font-weight:600;">S/ ' + Number(cot.igv || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</td>' +
          '</tr>' +
          '<tr style="background:#e0e7ff;">' +
            '<td colspan="3" style="text-align:right;padding:10px 14px;font-weight:700;font-size:14px;">TOTAL</td>' +
            '<td style="text-align:right;padding:10px 14px;font-weight:700;font-size:14px;color:#4f46e5;">S/ ' + Number(cot.total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</td>' +
          '</tr>' +
          '</tbody></table>'
        : '<p style="color:#64748b;font-size:13px;">No hay ítems registrados.</p>');

    // Footer with actions
    const isPendiente = cot.estado === 'Pendiente';
    footerEl.innerHTML =
      '<button class="aprob-btn-pdf" id="modal-btn-pdf" data-id="' + cot.id + '" data-num="' + (cot.numero_cotizacion || '') + '">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
        ' Descargar PDF' +
      '</button>' +
      (isPendiente
        ? '<button class="aprob-btn-reject" id="modal-btn-rechazar" data-id="' + cot.id + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
            ' Rechazar' +
          '</button>' +
          '<button class="aprob-btn-approve" id="modal-btn-aprobar" data-id="' + cot.id + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
            ' Aceptar' +
          '</button>'
        : '');

    // Bind modal actions
    document.getElementById('modal-btn-pdf')?.addEventListener('click', async () => {
      await descargarPDF(cot.id, cot.numero_cotizacion || '');
    });
    document.getElementById('modal-btn-aprobar')?.addEventListener('click', () => {
      modal.style.display = 'none';
      mostrarConfirmacion('Aceptada', cot.id, cot.numero_cotizacion || '');
    });
    document.getElementById('modal-btn-rechazar')?.addEventListener('click', () => {
      modal.style.display = 'none';
      mostrarConfirmacion('Rechazada', cot.id, cot.numero_cotizacion || '');
    });

  } catch (e: any) {
    console.error('Error cargando detalle:', e);
    bodyEl.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Error al cargar el detalle</div>';
  }
}

// ========================================
// INIT EVENTS
// ========================================

export function initAprobacionCotizacionesEvents() {
  // Tab clicks
  document.querySelectorAll('.aprob-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = (tab as HTMLElement).dataset.tab || 'Todas';
      document.querySelectorAll('.aprob-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTabla();
      actualizarTabCounts();
    });
  });

  // Search debounce
  const searchInput = document.getElementById('aprob-search') as HTMLInputElement;
  if (searchInput) {
    let timeout: any;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => renderTabla(), 300);
    });
  }

  // Estado filter
  document.getElementById('aprob-filter-estado')?.addEventListener('change', () => {
    actualizarTabCounts();
    renderTabla();
  });

  // Close modal
  document.getElementById('aprob-modal-cerrar')?.addEventListener('click', () => {
    (document.getElementById('aprob-modal-detalle') as HTMLElement).style.display = 'none';
  });
  document.getElementById('aprob-modal-detalle')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'aprob-modal-detalle') {
      (document.getElementById('aprob-modal-detalle') as HTMLElement).style.display = 'none';
    }
  });

  // Confirm dialog
  document.getElementById('aprob-confirm-cancelar')?.addEventListener('click', () => {
    (document.getElementById('aprob-confirm-dialog') as HTMLElement).style.display = 'none';
    pendingAction = null;
  });
  document.getElementById('aprob-confirm-ok')?.addEventListener('click', ejecutarCambioEstado);

  // Load data
  cargarCotizaciones();
}
