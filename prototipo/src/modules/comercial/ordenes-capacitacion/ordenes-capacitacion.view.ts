// Comercial - Ordenes de Capacitación y Auditoría (Conectado al Backend)
import './ordenes-capacitacion.css';
import { ordenCapacitacionService } from '../../../services/ordenCapacitacionService';
import { mostrarToast } from '../../../shared/toast';

let ocListData: any[] = [];
let cotizacionesDisponibles: any[] = [];
let personalData: any[] = [];
let selectedPonentes: { id: number; nombre: string }[] = [];
let ocIncluyeIgv = true;

export function renderComercialOrdenesCapacitacion() {
  return `
  <div class="oc-main-container">

    <!-- HEADER -->
    <div class="oc-header">
      <div class="oc-header-top">
        <h1 class="oc-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          Órdenes de Capacitación y Auditoría
        </h1>
        <button class="oc-btn-primary" id="btn-nueva-oc">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Orden de Capacitación
        </button>
      </div>

      <!-- STATS -->
      <div class="oc-stats-grid">
        <div class="oc-stat-card">
          <div class="oc-stat-icon oc-stat-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div class="oc-stat-info">
            <span class="oc-stat-label">Total Órdenes</span>
            <span class="oc-stat-value" id="stat-oc-total">-</span>
          </div>
        </div>
        <div class="oc-stat-card">
          <div class="oc-stat-icon oc-stat-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="oc-stat-info">
            <span class="oc-stat-label">Valor Total</span>
            <span class="oc-stat-value" id="stat-oc-valor">-</span>
          </div>
        </div>
        <div class="oc-stat-card">
          <div class="oc-stat-icon oc-stat-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="oc-stat-info">
            <span class="oc-stat-label">Participantes</span>
            <span class="oc-stat-value" id="stat-oc-participantes">-</span>
          </div>
        </div>
        <div class="oc-stat-card">
          <div class="oc-stat-icon oc-stat-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="oc-stat-info">
            <span class="oc-stat-label">Órdenes este Mes</span>
            <span class="oc-stat-value" id="stat-oc-mes">-</span>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="oc-filters-bar">
      <div class="oc-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" id="oc-search" placeholder="Buscar por número de orden, cliente..." class="oc-search-input">
      </div>
      <div class="oc-filter-group">
        <select class="oc-filter-select" id="oc-filter-modalidad">
          <option value="">Todas las modalidades</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
          <option value="Híbrido">Híbrido</option>
        </select>
        <input type="date" class="oc-filter-select" id="oc-filter-desde" title="Desde">
        <input type="date" class="oc-filter-select" id="oc-filter-hasta" title="Hasta">
        <button class="oc-btn-secondary" id="oc-btn-filtrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filtrar
        </button>
      </div>
    </div>

    <!-- TABLA -->
    <div class="oc-table-container">
      <table class="oc-table">
        <thead>
          <tr>
            <th>N° Orden</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Ponente(s)</th>
            <th>Fecha/Hora</th>
            <th>Modalidad</th>
            <th>Participantes</th>
            <th>Costo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="oc-tabla-body">
          <tr><td colspan="10" style="text-align:center;padding:40px;color:#64748b;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL NUEVA/EDITAR OC -->
    <div class="oc-form-overlay" id="modal-oc" style="display:none;">
      <div class="oc-form-card" style="max-width:850px;">
        <div class="oc-form-header">
          <h2 class="oc-form-title" id="modal-oc-titulo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Nueva Orden de Capacitación
          </h2>
          <button class="oc-btn-close" id="modal-oc-cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="oc-form-content">
          <input type="hidden" id="oc-edit-id">

          <!-- Información General -->
          <div class="oc-section">
            <h3 class="oc-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Información General
            </h3>
            <div class="oc-grid">
              <div class="oc-field">
                <label class="oc-label">N° Orden</label>
                <input type="text" id="oc-numero-orden" class="oc-input" readonly placeholder="Auto-generado">
              </div>
              <div class="oc-field">
                <label class="oc-label">Cotización Referencia <span class="oc-required">*</span></label>
                <select id="oc-cotizacion-ref" class="oc-input">
                  <option value="">Cargando cotizaciones...</option>
                </select>
              </div>
              <div class="oc-field">
                <label class="oc-label">Cliente</label>
                <input type="text" id="oc-cliente-nombre" class="oc-input" readonly placeholder="Se auto-completa al elegir cotización">
                <input type="hidden" id="oc-cliente-id">
              </div>
              <div class="oc-field">
                <label class="oc-label">RUC</label>
                <input type="text" id="oc-cliente-ruc" class="oc-input" readonly>
              </div>
            </div>
          </div>

          <!-- Info cotización -->
          <div id="oc-cotizacion-info" style="display:none;margin-bottom:20px;">
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
              <div>
                <strong id="oc-cot-info-numero" style="color:#0284c7;"></strong>
                <span id="oc-cot-info-detalle" style="color:#475569;margin-left:8px;"></span>
              </div>
            </div>
          </div>

          <!-- Detalles de la cotización -->
          <div id="oc-detalles-cotizacion" style="display:none;margin-bottom:20px;">
            <h4 style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:10px;">Detalle de la Cotización</h4>
            <div id="oc-detalles-lista" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;"></div>
          </div>

          <!-- Datos del servicio -->
          <div class="oc-section">
            <h3 class="oc-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Datos del Servicio
            </h3>
            <div class="oc-grid">
              <div class="oc-field">
                <label class="oc-label">Servicio / Capacitación</label>
                <input type="text" id="oc-servicio-nombre" class="oc-input" readonly placeholder="Se auto-completa desde cotización">
                <input type="hidden" id="oc-servicio-id">
              </div>
              <div class="oc-field" style="grid-column: 1 / -1;">
                <label class="oc-label">Ponente(s) / Expositor(es) <span class="oc-required">*</span></label>
                <div id="oc-ponentes-container" style="border:1px solid #d1d5db;border-radius:8px;padding:8px;min-height:44px;background:#fff;">
                  <div id="oc-ponentes-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;"></div>
                  <select id="oc-ponente-selector" class="oc-input" style="border:none;padding:4px 0;margin:0;box-shadow:none;">
                    <option value="">+ Agregar ponente...</option>
                  </select>
                </div>
              </div>
              <div class="oc-field">
                <label class="oc-label">Fecha del Servicio <span class="oc-required">*</span></label>
                <input type="date" id="oc-fecha-servicio" class="oc-input">
              </div>
              <div class="oc-field">
                <label class="oc-label">Hora del Servicio</label>
                <input type="time" id="oc-hora-servicio" class="oc-input">
              </div>
              <div class="oc-field">
                <label class="oc-label">Modalidad <span class="oc-required">*</span></label>
                <select id="oc-modalidad" class="oc-input">
                  <option value="">Seleccione...</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div class="oc-field">
                <label class="oc-label">N° Participantes <span class="oc-required">*</span></label>
                <input type="number" id="oc-num-participantes" class="oc-input" min="1" value="1">
              </div>
              <div class="oc-field">
                <label class="oc-label">N° Certificados</label>
                <input type="number" id="oc-num-certificados" class="oc-input" min="0" value="0">
              </div>
              <div class="oc-field">
                <label class="oc-label">IGV (18%)</label>
                <select id="oc-igv" class="oc-input">
                  <option value="1" selected>Sí - Con IGV (18%)</option>
                  <option value="0">No - Sin IGV</option>
                </select>
              </div>
              <div class="oc-field">
                <label class="oc-label">Subtotal <span class="oc-required">*</span></label>
                <input type="number" id="oc-costo" class="oc-input" min="0" step="0.01" value="0.00">
              </div>
            </div>
            <!-- Desglose de costos -->
            <div id="oc-desglose-costos" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-top:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="color:#64748b;font-size:13px;">Subtotal:</span>
                <span style="font-weight:500;color:#1e293b;" id="oc-display-subtotal">S/ 0.00</span>
              </div>
              <div id="oc-igv-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="color:#64748b;font-size:13px;">IGV (18%):</span>
                <span style="font-weight:500;color:#1e293b;" id="oc-display-igv">S/ 0.00</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;padding-top:8px;">
                <span style="font-weight:600;color:#0f172a;font-size:14px;">Total:</span>
                <span style="font-weight:700;color:#0f172a;font-size:16px;" id="oc-display-total">S/ 0.00</span>
              </div>
              <div class="oc-field" style="grid-column: 1 / -1;">
                <label class="oc-label">Observaciones</label>
                <textarea id="oc-observaciones" class="oc-input" rows="3" placeholder="Observaciones adicionales..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="oc-form-actions" style="padding:20px 28px;">
          <button type="button" class="oc-btn-cancel" id="modal-oc-cancelar">Cancelar</button>
          <button type="button" class="oc-btn-submit" id="modal-oc-guardar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  `;
}

// =============================
// FUNCIONES
// =============================

async function cargarEstadisticasOC() {
  try {
    const res = await ordenCapacitacionService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;

    const el = (id: string) => document.getElementById(id);
    if (el('stat-oc-total')) el('stat-oc-total')!.textContent = String(stats.total_ordenes ?? 0);
    if (el('stat-oc-valor')) el('stat-oc-valor')!.textContent = 'S/ ' + Number(stats.total_valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
    if (el('stat-oc-participantes')) el('stat-oc-participantes')!.textContent = String(stats.total_participantes ?? 0);
    if (el('stat-oc-mes')) el('stat-oc-mes')!.textContent = String(stats.ordenes_mes_actual ?? 0);
  } catch (e) {
    console.error('Error cargando estadísticas OC:', e);
  }
}

async function cargarOrdenesCapacitacion() {
  const tbody = document.getElementById('oc-tabla-body');
  if (!tbody) return;

  try {
    const params: any = {};
    const search = (document.getElementById('oc-search') as HTMLInputElement)?.value?.trim();
    const modalidad = (document.getElementById('oc-filter-modalidad') as HTMLSelectElement)?.value;
    const desde = (document.getElementById('oc-filter-desde') as HTMLInputElement)?.value;
    const hasta = (document.getElementById('oc-filter-hasta') as HTMLInputElement)?.value;
    if (search) params.search = search;
    if (modalidad) params.modalidad = modalidad;
    if (desde) params.fecha_desde = desde;
    if (hasta) params.fecha_hasta = hasta;

    const res = await ordenCapacitacionService.getAll(params);
    const raw = res.data || res;
    ocListData = Array.isArray(raw) ? raw : (raw as any).data || [];

    if (ocListData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#64748b;">No se encontraron órdenes de capacitación</td></tr>';
      return;
    }

    const formatFecha = (f: string | null | undefined): string => {
      if (!f) return '-';
      const [y, m, d] = f.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    };

    const getBadgeClass = (estado: string): string => {
      switch (estado) {
        case 'Aprobado': return 'oc-badge-success';
        case 'Pendiente': return 'oc-badge-warning';
        case 'Rechazado': return 'oc-badge-danger';
        default: return 'oc-badge-info';
      }
    };

    const getModalidadBadge = (mod: string): string => {
      switch (mod) {
        case 'Presencial': return 'oc-badge-info';
        case 'Virtual': return 'oc-badge-purple';
        case 'Híbrido': return 'oc-badge-cyan';
        default: return 'oc-badge-info';
      }
    };

    tbody.innerHTML = ocListData.map(o => {
      const fecha = formatFecha(o.fecha_servicio);
      const hora = o.hora_servicio || '';
      const costoTotal = Number(o.costo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      const tieneIgv = o.incluye_igv !== undefined ? o.incluye_igv : true;
      const subtotalStr = Number(o.subtotal || o.costo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      const igvStr = Number(o.igv || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      const costoTooltip = tieneIgv
        ? 'Subtotal: S/ ' + subtotalStr + '\nIGV: S/ ' + igvStr + '\nTotal: S/ ' + costoTotal
        : 'Sin IGV';
      const ponentesStr = o.ponentes && o.ponentes.length > 0
        ? o.ponentes.map((p: any) => p.nombre).join(', ')
        : (o.ponente || '-');
      return '<tr>' +
        '<td><strong>' + (o.numero_orden || '') + '</strong></td>' +
        '<td>' + (o.cliente?.nombre_empresa || '-') + '</td>' +
        '<td>' + (o.servicio || '-') + '</td>' +
        '<td style="max-width:180px;"><small>' + ponentesStr + '</small></td>' +
        '<td><div>' + fecha + '</div><small style="color:#64748b;">' + hora + '</small></td>' +
        '<td><span class="oc-badge ' + getModalidadBadge(o.modalidad) + '">' + (o.modalidad || '-') + '</span></td>' +
        '<td style="text-align:center;">' + (o.num_participantes || 0) + '</td>' +
        '<td title="' + costoTooltip + '"><strong>S/ ' + costoTotal + '</strong>' + (tieneIgv ? '<br><small style="color:#64748b;">inc. IGV</small>' : '<br><small style="color:#94a3b8;">sin IGV</small>') + '</td>' +
        '<td><span class="oc-badge ' + getBadgeClass(o.estado) + '">' + (o.estado || 'Aprobado') + '</span></td>' +
        '<td>' +
          '<div class="oc-action-buttons">' +
            '<button class="oc-btn-icon btn-ver-oc" data-id="' + o.id + '" title="Ver/Editar">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>' +
                '<circle cx="12" cy="12" r="3"></circle>' +
              '</svg>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    bindAccionesTablaOC();
  } catch (e) {
    console.error('Error cargando órdenes:', e);
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar órdenes</td></tr>';
  }
}

function bindAccionesTablaOC() {
  document.querySelectorAll('.btn-ver-oc').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarOC(id);
    });
  });
}

async function cargarDropdownCotizaciones() {
  const select = document.getElementById('oc-cotizacion-ref') as HTMLSelectElement;
  if (!select) return;
  try {
    const res = await ordenCapacitacionService.getCotizacionesDisponibles();
    const raw = res.data || res;
    cotizacionesDisponibles = Array.isArray(raw) ? raw : (raw as any).data || [];

    select.innerHTML = '<option value="">Seleccione una cotización...</option>' +
      cotizacionesDisponibles.map(c =>
        '<option value="' + c.id + '">' + c.numero_cotizacion + ' - ' + (c.cliente?.nombre_empresa || '') + ' (S/ ' + Number(c.total).toFixed(2) + ')</option>'
      ).join('');
  } catch (e) {
    console.error('Error cargando cotizaciones:', e);
    select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

async function cargarDropdownPersonal() {
  const select = document.getElementById('oc-ponente-selector') as HTMLSelectElement;
  if (!select) return;
  try {
    const res = await ordenCapacitacionService.getPersonal();
    const raw = res.data || res;
    personalData = Array.isArray(raw) ? raw : (raw as any).data || [];

    actualizarSelectorPonentes();
  } catch (e) {
    console.error('Error cargando personal:', e);
    if (select) select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

function actualizarSelectorPonentes() {
  const select = document.getElementById('oc-ponente-selector') as HTMLSelectElement;
  if (!select) return;
  const selectedIds = selectedPonentes.map(p => p.id);
  const disponibles = personalData.filter(p => !selectedIds.includes(p.id));
  select.innerHTML = '<option value="">+ Agregar ponente...</option>' +
    disponibles.map(p =>
      '<option value="' + p.id + '">' + p.nombre + ' ' + (p.apellidos || '') + '</option>'
    ).join('');
}

function renderPonenteTags() {
  const container = document.getElementById('oc-ponentes-tags') as HTMLElement;
  if (!container) return;
  if (selectedPonentes.length === 0) {
    container.innerHTML = '<span style="color:#94a3b8;font-size:13px;">Ningún ponente seleccionado</span>';
    return;
  }
  container.innerHTML = selectedPonentes.map(p =>
    '<span style="display:inline-flex;align-items:center;gap:4px;background:#e0f2fe;color:#0369a1;border-radius:6px;padding:4px 10px;font-size:13px;font-weight:500;">' +
      p.nombre +
      ' <button type="button" class="btn-remove-ponente" data-id="' + p.id + '" style="background:none;border:none;cursor:pointer;color:#0369a1;font-size:16px;line-height:1;padding:0 2px;font-weight:700;">&times;</button>' +
    '</span>'
  ).join('');

  // Bind remove buttons
  container.querySelectorAll('.btn-remove-ponente').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      selectedPonentes = selectedPonentes.filter(p => p.id !== id);
      renderPonenteTags();
      actualizarSelectorPonentes();
    });
  });
}

async function cargarDatosCotizacion(cotizacionId: number) {
  try {
    const res = await ordenCapacitacionService.getDesdeCotizacion(cotizacionId);
    const raw = res.data || res;
    const data = (raw as any).data || raw;

    // Auto-llenar cliente
    (document.getElementById('oc-cliente-nombre') as HTMLInputElement).value = data.cliente?.nombre_empresa || '';
    (document.getElementById('oc-cliente-id') as HTMLInputElement).value = String(data.cliente?.id || '');
    (document.getElementById('oc-cliente-ruc') as HTMLInputElement).value = data.cliente?.ruc || '';

    // Info cotización
    const infoDiv = document.getElementById('oc-cotizacion-info') as HTMLElement;
    infoDiv.style.display = 'block';
    (document.getElementById('oc-cot-info-numero') as HTMLElement).textContent = data.cotizacion?.numero_cotizacion || '';
    (document.getElementById('oc-cot-info-detalle') as HTMLElement).textContent =
      '| Emitida: ' + (data.cotizacion?.fecha_emision || '') + ' | Total: S/ ' + Number(data.costo_total || 0).toFixed(2);

    // Mostrar detalles de la cotización
    const detalles = data.detalles || [];
    const detallesDiv = document.getElementById('oc-detalles-cotizacion') as HTMLElement;
    const detallesLista = document.getElementById('oc-detalles-lista') as HTMLElement;

    if (detalles.length > 0) {
      detallesDiv.style.display = 'block';
      detallesLista.innerHTML =
        '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
          '<thead>' +
            '<tr style="background:#e2e8f0;">' +
              '<th style="padding:8px 12px;text-align:left;font-weight:600;color:#475569;">Servicio/Capacitación</th>' +
              '<th style="padding:8px 12px;text-align:left;font-weight:600;color:#475569;">Tipo</th>' +
              '<th style="padding:8px 12px;text-align:center;font-weight:600;color:#475569;">Cant.</th>' +
              '<th style="padding:8px 12px;text-align:right;font-weight:600;color:#475569;">Precio Unit.</th>' +
              '<th style="padding:8px 12px;text-align:right;font-weight:600;color:#475569;">Subtotal</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            detalles.map((d: any) => {
              const badgeClass = d.tipo === 'Capacitación' ? 'oc-badge-info' : 'oc-badge-purple';
              return '<tr style="border-bottom:1px solid #e2e8f0;">' +
                '<td style="padding:8px 12px;">' + (d.nombre || '-') + '</td>' +
                '<td style="padding:8px 12px;"><span class="oc-badge ' + badgeClass + '">' + (d.tipo || '-') + '</span></td>' +
                '<td style="padding:8px 12px;text-align:center;">' + (d.cantidad || 1) + '</td>' +
                '<td style="padding:8px 12px;text-align:right;">S/ ' + Number(d.precio_unitario || 0).toFixed(2) + '</td>' +
                '<td style="padding:8px 12px;text-align:right;font-weight:600;">S/ ' + (Number(d.cantidad || 1) * Number(d.precio_unitario || 0)).toFixed(2) + '</td>' +
              '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>';
    } else {
      detallesDiv.style.display = 'none';
    }

    // Auto-llenar servicio
    if (data.servicio) {
      (document.getElementById('oc-servicio-nombre') as HTMLInputElement).value = data.servicio.nombre || '';
      (document.getElementById('oc-servicio-id') as HTMLInputElement).value = String(data.servicio.id || '');
    }

    // Auto-llenar modalidad sugerida
    if (data.servicio?.modalidad_sugerida) {
      const modalidadSelect = document.getElementById('oc-modalidad') as HTMLSelectElement;
      const modalidadMap: any = { 'Presencial': 'Presencial', 'Virtual': 'Virtual', 'Hibrido': 'Híbrido', 'Híbrido': 'Híbrido' };
      const mapped = modalidadMap[data.servicio.modalidad_sugerida] || data.servicio.modalidad_sugerida;
      // DB enum uses 'Híbrido'
      if (modalidadSelect) modalidadSelect.value = mapped;
    }

    // Auto-llenar costo
    (document.getElementById('oc-costo') as HTMLInputElement).value = Number(data.costo_total || 0).toFixed(2);
    calcularDesgloseOC();

  } catch (e: any) {
    console.error('Error cargando datos de cotización:', e);
    const msg = e?.data?.message || 'No se pudieron cargar los datos de la cotización';
    mostrarToast('error', 'Error', msg);
  }
}

function limpiarFormOC() {
  (document.getElementById('oc-edit-id') as HTMLInputElement).value = '';
  (document.getElementById('oc-numero-orden') as HTMLInputElement).value = '';
  (document.getElementById('oc-cotizacion-ref') as HTMLSelectElement).value = '';
  (document.getElementById('oc-cliente-nombre') as HTMLInputElement).value = '';
  (document.getElementById('oc-cliente-id') as HTMLInputElement).value = '';
  (document.getElementById('oc-cliente-ruc') as HTMLInputElement).value = '';
  (document.getElementById('oc-cotizacion-info') as HTMLElement).style.display = 'none';
  (document.getElementById('oc-detalles-cotizacion') as HTMLElement).style.display = 'none';
  (document.getElementById('oc-servicio-nombre') as HTMLInputElement).value = '';
  (document.getElementById('oc-servicio-id') as HTMLInputElement).value = '';
  selectedPonentes = [];
  renderPonenteTags();
  actualizarSelectorPonentes();
  (document.getElementById('oc-fecha-servicio') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
  (document.getElementById('oc-hora-servicio') as HTMLInputElement).value = '';
  (document.getElementById('oc-modalidad') as HTMLSelectElement).value = '';
  (document.getElementById('oc-num-participantes') as HTMLInputElement).value = '1';
  (document.getElementById('oc-num-certificados') as HTMLInputElement).value = '0';
  (document.getElementById('oc-igv') as HTMLSelectElement).value = '1';
  ocIncluyeIgv = true;
  (document.getElementById('oc-costo') as HTMLInputElement).value = '0.00';
  calcularDesgloseOC();
  (document.getElementById('oc-observaciones') as HTMLTextAreaElement).value = '';
}

async function abrirModalNuevaOC() {
  limpiarFormOC();
  (document.getElementById('modal-oc-titulo') as HTMLElement).innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> Nueva Orden de Capacitación';
  const cotSelect = document.getElementById('oc-cotizacion-ref') as HTMLSelectElement;
  cotSelect.disabled = false;
  await Promise.all([cargarDropdownCotizaciones(), cargarDropdownPersonal()]);

  // Cargar siguiente número de orden
  try {
    const res = await ordenCapacitacionService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;
    if (stats.siguiente_numero) {
      (document.getElementById('oc-numero-orden') as HTMLInputElement).value = stats.siguiente_numero;
    }
  } catch (e) {
    console.error('Error obteniendo siguiente número:', e);
  }

  (document.getElementById('modal-oc') as HTMLElement).style.display = 'flex';
}

async function abrirModalEditarOC(id: number) {
  try {
    const res = await ordenCapacitacionService.getById(id);
    const raw = res.data || res;
    const orden = (raw as any).data || raw;

    limpiarFormOC();
    await Promise.all([cargarDropdownCotizaciones(), cargarDropdownPersonal()]);

    (document.getElementById('modal-oc-titulo') as HTMLElement).innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> Ver / Editar Orden';
    (document.getElementById('oc-edit-id') as HTMLInputElement).value = String(orden.id);
    (document.getElementById('oc-numero-orden') as HTMLInputElement).value = orden.numero_orden || '';

    // Cotización (readonly en edición)
    const cotSelect = document.getElementById('oc-cotizacion-ref') as HTMLSelectElement;
    if (orden.id_cotizacion) {
      const cotNum = orden.cotizacion?.numero_cotizacion || ('COT-' + orden.id_cotizacion);
      const existing = Array.from(cotSelect.options).find(o => o.value === String(orden.id_cotizacion));
      if (!existing) {
        cotSelect.insertAdjacentHTML('beforeend', '<option value="' + orden.id_cotizacion + '">' + cotNum + '</option>');
      }
      cotSelect.value = String(orden.id_cotizacion);
      cotSelect.disabled = true;
    }

    // Cliente
    (document.getElementById('oc-cliente-nombre') as HTMLInputElement).value = orden.cliente?.nombre_empresa || '';
    (document.getElementById('oc-cliente-id') as HTMLInputElement).value = String(orden.cliente?.id || orden.id_cliente || '');
    (document.getElementById('oc-cliente-ruc') as HTMLInputElement).value = orden.cliente?.ruc || '';

    // Servicio
    (document.getElementById('oc-servicio-nombre') as HTMLInputElement).value = orden.servicio?.nombre || '';
    (document.getElementById('oc-servicio-id') as HTMLInputElement).value = String(orden.id_servicio || '');

    // Datos del servicio
    (document.getElementById('oc-fecha-servicio') as HTMLInputElement).value = orden.fecha_servicio?.split('T')[0] || '';
    (document.getElementById('oc-hora-servicio') as HTMLInputElement).value = orden.hora_servicio || '';

    // Ponentes (multi-select)
    setTimeout(() => {
      if (orden.ponentes && Array.isArray(orden.ponentes) && orden.ponentes.length > 0) {
        selectedPonentes = orden.ponentes.map((p: any) => ({
          id: p.id,
          nombre: p.nombre || (p.nombre + ' ' + (p.apellidos || ''))
        }));
      } else if (orden.id_ponente) {
        // Fallback: usar id_ponente individual
        const found = personalData.find(p => p.id === orden.id_ponente);
        if (found) {
          selectedPonentes = [{ id: found.id, nombre: found.nombre + ' ' + (found.apellidos || '') }];
        }
      }
      renderPonenteTags();
      actualizarSelectorPonentes();
    }, 100);

    // Modalidad & rest
    (document.getElementById('oc-modalidad') as HTMLSelectElement).value = orden.modalidad || '';
    (document.getElementById('oc-num-participantes') as HTMLInputElement).value = String(orden.num_participantes || 1);
    (document.getElementById('oc-num-certificados') as HTMLInputElement).value = String(orden.num_certificados || 0);
    // IGV
    const igvVal = orden.incluye_igv !== undefined ? orden.incluye_igv : true;
    (document.getElementById('oc-igv') as HTMLSelectElement).value = igvVal ? '1' : '0';
    ocIncluyeIgv = !!igvVal;
    (document.getElementById('oc-costo') as HTMLInputElement).value = Number(orden.subtotal || orden.costo || 0).toFixed(2);
    calcularDesgloseOC();
    (document.getElementById('oc-observaciones') as HTMLTextAreaElement).value = orden.observaciones || '';

    (document.getElementById('modal-oc') as HTMLElement).style.display = 'flex';
  } catch (e) {
    console.error('Error cargando OC:', e);
    mostrarToast('error', 'Error', 'No se pudo cargar la orden');
  }
}

async function guardarOC() {
  const editId = (document.getElementById('oc-edit-id') as HTMLInputElement).value;
  const idCotizacion = (document.getElementById('oc-cotizacion-ref') as HTMLSelectElement).value;
  const idServicio = (document.getElementById('oc-servicio-id') as HTMLInputElement).value;
  const ponenteIds = selectedPonentes.map(p => p.id);
  const fechaServicio = (document.getElementById('oc-fecha-servicio') as HTMLInputElement).value;
  const horaServicio = (document.getElementById('oc-hora-servicio') as HTMLInputElement).value;
  const modalidad = (document.getElementById('oc-modalidad') as HTMLSelectElement).value;
  const numParticipantes = (document.getElementById('oc-num-participantes') as HTMLInputElement).value;
  const numCertificados = (document.getElementById('oc-num-certificados') as HTMLInputElement).value;
  const costo = (document.getElementById('oc-costo') as HTMLInputElement).value;
  const observaciones = (document.getElementById('oc-observaciones') as HTMLTextAreaElement).value?.trim();

  if (!idCotizacion) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar una cotización de referencia');
    return;
  }
  if (!fechaServicio) {
    mostrarToast('error', 'Campo requerido', 'La fecha del servicio es obligatoria');
    return;
  }
  if (ponenteIds.length === 0) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar al menos un ponente');
    return;
  }
  if (!modalidad) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar la modalidad');
    return;
  }
  if (!numParticipantes || parseInt(numParticipantes) < 1) {
    mostrarToast('error', 'Campo requerido', 'El número de participantes debe ser al menos 1');
    return;
  }

  const payload: any = {
    id_cotizacion: Number(idCotizacion),
    id_servicio: idServicio ? Number(idServicio) : null,
    ponentes: ponenteIds,
    fecha_servicio: fechaServicio,
    hora_servicio: horaServicio || null,
    modalidad,
    num_participantes: parseInt(numParticipantes),
    num_certificados: parseInt(numCertificados) || 0,
    costo: parseFloat(costo) || 0,
    incluye_igv: ocIncluyeIgv,
    observaciones: observaciones || null,
  };

  try {
    if (editId) {
      await ordenCapacitacionService.update(Number(editId), payload);
      mostrarToast('success', 'Orden Actualizada', 'La orden se actualizó correctamente');
    } else {
      await ordenCapacitacionService.create(payload);
      mostrarToast('success', 'Orden Creada', 'La orden de capacitación se creó correctamente');
    }
    (document.getElementById('modal-oc') as HTMLElement).style.display = 'none';
    await Promise.all([cargarOrdenesCapacitacion(), cargarEstadisticasOC()]);
  } catch (e: any) {
    console.error('Error guardando OC:', e);
    const msg = e?.data?.message || e?.message || 'No se pudo guardar la orden';
    mostrarToast('error', 'Error', msg);
  }
}

// =============================
// CALCULO IGV
// =============================
function calcularDesgloseOC() {
  const costoInput = document.getElementById('oc-costo') as HTMLInputElement;
  const subtotal = parseFloat(costoInput?.value || '0');
  const igv = ocIncluyeIgv ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
  const total = subtotal + igv;

  const fmt = (n: number) => n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const elSub = document.getElementById('oc-display-subtotal');
  const elIgv = document.getElementById('oc-display-igv');
  const elTotal = document.getElementById('oc-display-total');
  const igvRow = document.getElementById('oc-igv-row');

  if (elSub) elSub.textContent = 'S/ ' + fmt(subtotal);
  if (elIgv) elIgv.textContent = 'S/ ' + fmt(igv);
  if (elTotal) elTotal.textContent = 'S/ ' + fmt(total);
  if (igvRow) igvRow.style.display = ocIncluyeIgv ? 'flex' : 'none';
}

// =============================
// INIT EVENTS
// =============================
export function initOrdenesCapacitacionEvents() {
  // Botón nueva OC
  document.getElementById('btn-nueva-oc')?.addEventListener('click', abrirModalNuevaOC);

  // Filtrar
  document.getElementById('oc-btn-filtrar')?.addEventListener('click', cargarOrdenesCapacitacion);

  // Search con debounce
  const searchInput = document.getElementById('oc-search') as HTMLInputElement;
  if (searchInput) {
    let timeout: any;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(cargarOrdenesCapacitacion, 400);
    });
  }

  // Modal OC cerrar/cancelar
  const modal = document.getElementById('modal-oc') as HTMLElement;
  document.getElementById('modal-oc-cerrar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
  document.getElementById('modal-oc-cancelar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });

  // Guardar
  document.getElementById('modal-oc-guardar')?.addEventListener('click', guardarOC);

  // Toggle IGV
  document.getElementById('oc-igv')?.addEventListener('change', (e) => {
    ocIncluyeIgv = (e.target as HTMLSelectElement).value === '1';
    calcularDesgloseOC();
  });

  // Recalcular al cambiar costo
  document.getElementById('oc-costo')?.addEventListener('input', () => calcularDesgloseOC());

  // Ponente multi-select: agregar al elegir del dropdown
  document.getElementById('oc-ponente-selector')?.addEventListener('change', () => {
    const select = document.getElementById('oc-ponente-selector') as HTMLSelectElement;
    const val = select.value;
    if (!val) return;
    const id = Number(val);
    if (selectedPonentes.some(p => p.id === id)) return;
    const persona = personalData.find(p => p.id === id);
    if (persona) {
      selectedPonentes.push({ id: persona.id, nombre: persona.nombre + ' ' + (persona.apellidos || '') });
      renderPonenteTags();
      actualizarSelectorPonentes();
    }
    select.value = '';
  });

  // Cotización change -> auto-fill
  document.getElementById('oc-cotizacion-ref')?.addEventListener('change', async () => {
    const val = (document.getElementById('oc-cotizacion-ref') as HTMLSelectElement).value;
    if (val) {
      await cargarDatosCotizacion(Number(val));
    } else {
      (document.getElementById('oc-cliente-nombre') as HTMLInputElement).value = '';
      (document.getElementById('oc-cliente-id') as HTMLInputElement).value = '';
      (document.getElementById('oc-cliente-ruc') as HTMLInputElement).value = '';
      (document.getElementById('oc-cotizacion-info') as HTMLElement).style.display = 'none';
      (document.getElementById('oc-detalles-cotizacion') as HTMLElement).style.display = 'none';
      (document.getElementById('oc-servicio-nombre') as HTMLInputElement).value = '';
      (document.getElementById('oc-servicio-id') as HTMLInputElement).value = '';
      (document.getElementById('oc-costo') as HTMLInputElement).value = '0.00';
      calcularDesgloseOC();
    }
  });

  // Cargar datos iniciales
  cargarEstadisticasOC();
  cargarOrdenesCapacitacion();
}
