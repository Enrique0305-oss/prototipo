// Comercial - Ordenes de Servicio (Conectado al Backend)
import './ordenes-servicio.css';
import { ordenServicioService } from '../../../services/ordenServicioService';
import { servicioService } from '../../../services/servicioService';
import { mostrarToast } from '../../../shared/toast';

let odsListData: any[] = [];
let cotizacionesDisponibles: any[] = [];
let personalData: any[] = [];
let serviciosDisponibles: any[] = [];
let incluyeIgv = true;
let contadorLineasSrv = 0;

export function renderComercialOrdenesServicio() {
  return `
  <div class="os-form-container">

    <!-- HEADER -->
    <div class="page-header">
      <h1>Ordenes de Servicio</h1>
      <div class="header-actions">
        <button class="btn-primary" id="btn-nueva-ods">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Orden de Servicio
        </button>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-row" id="ods-stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Ordenes</div>
          <div class="stat-box-value" id="stat-total-ordenes">-</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Valor Total</div>
          <div class="stat-box-value" id="stat-valor-total">-</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ordenes este Mes</div>
          <div class="stat-box-value" id="stat-ordenes-mes">-</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Valor este Mes</div>
          <div class="stat-box-value" id="stat-valor-mes">-</div>
        </div>
      </div>
    </div>

    <!-- LISTA DE ORDENES -->
    <div id="lista-ordenes-servicio">
      <div class="search-filter-bar">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" id="ods-search" placeholder="Buscar orden de servicio..." class="search-input">
        </div>
        <input type="date" class="filter-select" id="ods-filter-desde" title="Desde">
        <input type="date" class="filter-select" id="ods-filter-hasta" title="Hasta">
        <button class="btn-filter" id="ods-btn-filtrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filtrar
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>N Orden</th>
              <th>Cliente</th>
              <th>Cotizacion</th>
              <th>Fecha Aceptacion</th>
              <th>Fecha Tentativa</th>
              <th>Total Costo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="ods-tabla-body">
            <tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL NUEVA/EDITAR ODS -->
    <div class="modal-overlay" id="modal-ods" style="display:none;">
      <div class="modal-container" style="max-width:780px;max-height:90vh;overflow-y:auto;">
        <div class="modal-header">
          <h2 id="modal-ods-titulo">Nueva Orden de Servicio</h2>
          <button class="modal-close" id="modal-ods-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="ods-edit-id">

          <!-- Informacion General -->
          <div class="os-section">
            <h3 class="os-section-title">Informacion General</h3>
            <div class="os-grid">
              <div class="os-field">
                <label>N° Orden</label>
                <input type="text" id="ods-numero-orden" class="os-input" readonly placeholder="Cargando..." style="background:#f1f5f9;font-weight:600;">
              </div>
              <div class="os-field">
                <label>Cotizacion Referencia <span style="color:#ef4444">*</span></label>
                <select id="ods-cotizacion-ref" class="os-input">
                  <option value="">Cargando cotizaciones...</option>
                </select>
              </div>
              <div class="os-field">
                <label>Version</label>
                <input type="text" id="ods-version" class="os-input" value="01">
              </div>
              <div class="os-field">
                <label>Cliente</label>
                <input type="text" id="ods-cliente-nombre" class="os-input" readonly placeholder="Se auto-completa al elegir cotizacion">
                <input type="hidden" id="ods-cliente-id">
              </div>
              <div class="os-field">
                <label>RUC</label>
                <input type="text" id="ods-cliente-ruc" class="os-input" readonly>
              </div>
              <div class="os-field">
                <label>Fecha de Aceptacion <span style="color:#ef4444">*</span></label>
                <input type="date" id="ods-fecha-aceptacion" class="os-input">
              </div>
              <div class="os-field">
                <label>Fecha Tentativa</label>
                <input type="date" id="ods-fecha-tentativa" class="os-input">
              </div>
              <div class="os-field">
                <label>Emitido por <span style="color:#ef4444">*</span></label>
                <select id="ods-emitido-por" class="os-input">
                  <option value="">Cargando personal...</option>
                </select>
              </div>
              <div class="os-field">
                <label>IGV (18%)</label>
                <select id="ods-igv" class="os-input">
                  <option value="1" selected>Si - Con IGV (18%)</option>
                  <option value="0">No - Sin IGV</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Info cotizacion -->
          <div id="ods-cotizacion-info" style="display:none;margin-bottom:20px;">
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
              <div>
                <strong id="ods-cot-info-numero" style="color:#0284c7;"></strong>
                <span id="ods-cot-info-detalle" style="color:#475569;margin-left:8px;"></span>
              </div>
            </div>
          </div>

          <!-- Detalle de Servicios -->
          <div class="os-section">
            <div class="os-section-header">
              <h3 class="os-section-title">Detalle de Servicios</h3>
              <button type="button" class="btn-secondary" id="btn-agregar-linea-servicio">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Servicio
              </button>
            </div>
            <div class="os-table-wrapper">
              <table class="os-table">
                <thead>
                  <tr>
                    <th style="width:28%;">Servicio</th>
                    <th style="width:22%;">Local / Ubicacion</th>
                    <th style="width:20%;">Frecuencia</th>
                    <th style="width:18%;">Precio</th>
                    <th style="width:12%;"></th>
                  </tr>
                </thead>
                <tbody id="ods-detalle-body"></tbody>
              </table>
            </div>
          </div>

          <!-- Total -->
          <div class="os-total-container">
            <div class="os-total-row">
              <span class="os-total-label">Subtotal:</span>
              <span class="os-total-value" id="ods-subtotal">S/ 0.00</span>
            </div>
            <div class="os-total-row" id="ods-igv-row">
              <span class="os-total-label">IGV (18%):</span>
              <span class="os-total-value" id="ods-igv-monto">S/ 0.00</span>
            </div>
            <div class="os-total-row os-total-final">
              <span class="os-total-label">Total Costo:</span>
              <span class="os-total-value" id="ods-total-costo">S/ 0.00</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" id="modal-ods-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-ods-guardar">
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

    <!-- Modal Confirmar Eliminacion -->
    <div class="modal-overlay" id="modal-ods-eliminar" style="display:none;">
      <div class="modal-container" style="max-width:420px;">
        <div class="modal-header">
          <h2>Confirmar Eliminacion</h2>
          <button class="modal-close" id="modal-ods-eliminar-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <p>Estas seguro de que deseas eliminar la orden <strong id="ods-eliminar-numero"></strong>?</p>
          <p style="color:#64748b;font-size:0.9em;">Se eliminaran todos los detalles asociados. Esta accion no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-ods-eliminar-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-ods-eliminar-confirmar" style="background:#ef4444;">Eliminar</button>
        </div>
      </div>
    </div>

  </div>
  `;
}

// =============================
// FUNCIONES
// =============================

async function cargarEstadisticasODS() {
  try {
    const res = await ordenServicioService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;

    const el = (id: string) => document.getElementById(id);
    if (el('stat-total-ordenes')) el('stat-total-ordenes')!.textContent = String(stats.total_ordenes ?? 0);
    if (el('stat-valor-total')) el('stat-valor-total')!.textContent = 'S/ ' + Number(stats.total_valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
    if (el('stat-ordenes-mes')) el('stat-ordenes-mes')!.textContent = String(stats.ordenes_mes_actual ?? 0);
    if (el('stat-valor-mes')) el('stat-valor-mes')!.textContent = 'S/ ' + Number(stats.valor_mes_actual ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
  } catch (e) {
    console.error('Error cargando estadisticas ODS:', e);
  }
}

async function cargarOrdenesServicio() {
  const tbody = document.getElementById('ods-tabla-body');
  if (!tbody) return;

  try {
    const params: any = {};
    const search = (document.getElementById('ods-search') as HTMLInputElement)?.value?.trim();
    const desde = (document.getElementById('ods-filter-desde') as HTMLInputElement)?.value;
    const hasta = (document.getElementById('ods-filter-hasta') as HTMLInputElement)?.value;
    if (search) params.search = search;
    if (desde) params.fecha_desde = desde;
    if (hasta) params.fecha_hasta = hasta;

    const res = await ordenServicioService.getAll(params);
    const raw = res.data || res;
    odsListData = Array.isArray(raw) ? raw : (raw as any).data || [];

    if (odsListData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">No se encontraron ordenes de servicio</td></tr>';
      return;
    }

    const formatFecha = (f: string | null | undefined): string => {
      if (!f) return '-';
      const [y, m, d] = f.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    };

    tbody.innerHTML = odsListData.map(o => {
      const fechaAcep = formatFecha(o.fecha_aceptacion);
      const fechaTent = formatFecha(o.fecha_tentativa);
      const total = Number(o.total_costo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      const cotNum = o.cotizacion?.numero_cotizacion || o.cotizacion_numero || '-';
      return '<tr>' +
        '<td><strong>' + (o.numero_orden || '') + '</strong></td>' +
        '<td>' + (o.cliente?.nombre_empresa || '-') + '</td>' +
        '<td>' + cotNum + '</td>' +
        '<td>' + fechaAcep + '</td>' +
        '<td>' + fechaTent + '</td>' +
        '<td><strong>S/ ' + total + '</strong></td>' +
        '<td><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;' + (o.estado === 'Aprobado' ? 'background:#dcfce7;color:#166534;' : o.estado === 'Rechazado' ? 'background:#fee2e2;color:#991b1b;' : 'background:#fef3c7;color:#92400e;') + '">' + (o.estado || 'Aprobado') + '</span></td>' +
        '<td>' +
          '<div style="display:flex; gap:6px;">' +
            // BOTÓN VER (Solo lectura)
            '<button class="btn-icon btn-ver-ods" data-id="' + o.id + '" title="Ver Detalle">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
            '</button>' +
            // BOTÓN EDITAR (El que ya tenías)
            '<button class="btn-icon btn-editar-ods" data-id="' + o.id + '" title="Editar" style="color: #0284c7;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
            '</button>' +
            // BOTÓN ELIMINAR
            '<button class="btn-icon btn-eliminar-ods" data-id="' + o.id + '" data-numero="' + (o.numero_orden || '') + '" title="Eliminar" style="color:#ef4444;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
            '</button>' +
          '</div>' +
        '</td>'
      '</tr>';
    }).join('');

    bindAccionesTabla();
  } catch (e) {
    console.error('Error cargando ordenes:', e);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar ordenes</td></tr>';
  }
}

function bindAccionesTabla() {
  document.querySelectorAll('.btn-ver-ods').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarODS(id, true); // true = Solo lectura
    });
  });

  document.querySelectorAll('.btn-editar-ods').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarODS(id, false); // false = Editable
    });
  });
  document.querySelectorAll('.btn-eliminar-ods').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const numero = (btn as HTMLElement).dataset.numero || '';
      abrirModalEliminarODS(id, numero);
    });
  });
}

async function cargarDropdownCotizaciones() {
  const select = document.getElementById('ods-cotizacion-ref') as HTMLSelectElement;
  if (!select) return;
  try {
    const res = await ordenServicioService.getCotizacionesDisponibles();
    const raw = res.data || res;
    cotizacionesDisponibles = Array.isArray(raw) ? raw : (raw as any).data || [];

    select.innerHTML = '<option value="">Seleccione una cotizacion...</option>' +
      cotizacionesDisponibles.map(c =>
        '<option value="' + c.id + '">' + c.numero_cotizacion + ' - ' + (c.cliente?.nombre_empresa || '') + ' (S/ ' + Number(c.total).toFixed(2) + ')</option>'
      ).join('');
  } catch (e) {
    console.error('Error cargando cotizaciones:', e);
    select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

async function cargarDropdownPersonal() {
  const select = document.getElementById('ods-emitido-por') as HTMLSelectElement;
  if (!select) return;
  try {
    const res = await ordenServicioService.getPersonal();
    const raw = res.data || res;
    personalData = Array.isArray(raw) ? raw : (raw as any).data || [];

    select.innerHTML = '<option value="">Seleccione personal...</option>' +
      personalData.map(p =>
        '<option value="' + p.id + '">' + p.nombre + ' ' + (p.apellidos || '') + '</option>'
      ).join('');
  } catch (e) {
    console.error('Error cargando personal:', e);
    select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

async function cargarServiciosDisponibles() {
  try {
    const res = await servicioService.getAll({ estado: 'activo', per_page: 100 });
    const raw = res.data || res;
    serviciosDisponibles = Array.isArray(raw) ? raw : (raw as any).data || [];
  } catch (e) {
    console.error('Error cargando servicios:', e);
    serviciosDisponibles = [];
  }
}

async function cargarDatosCotizacion(cotizacionId: number) {
  try {
    const res = await ordenServicioService.getDesdeCotizacion(cotizacionId);
    const raw = res.data || res;
    const data = (raw as any).data || raw;

    // Auto-llenar cliente
    (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = data.cliente?.nombre_empresa || '';
    (document.getElementById('ods-cliente-id') as HTMLInputElement).value = String(data.cliente?.id || '');
    (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = data.cliente?.ruc || '';

    // Info cotizacion
    const infoDiv = document.getElementById('ods-cotizacion-info') as HTMLElement;
    infoDiv.style.display = 'block';
    (document.getElementById('ods-cot-info-numero') as HTMLElement).textContent = data.cotizacion?.numero_cotizacion || '';
    (document.getElementById('ods-cot-info-detalle') as HTMLElement).textContent =
      '| Emitida: ' + (data.cotizacion?.fecha_emision || '') + ' | Total: S/ ' + Number(data.total || 0).toFixed(2);

    // Auto-setear IGV desde cotizacion
    incluyeIgv = data.incluye_igv !== false;
    const igvSelect = document.getElementById('ods-igv') as HTMLSelectElement;
    if (igvSelect) igvSelect.value = incluyeIgv ? '1' : '0';
    const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';

    // Auto-llenar detalles
    const detalles = data.detalles || [];
    const tbody = document.getElementById('ods-detalle-body') as HTMLElement;
    tbody.innerHTML = '';
    contadorLineasSrv = 0;

    detalles.forEach((d: any) => {
      agregarLineaConDatos(d.id_servicio, d.servicio_nombre || '', d.frecuencia || '', Number(d.precio || 0));
    });

    calcularTotalCosto();
  } catch (e) {
    console.error('Error cargando datos de cotizacion:', e);
    mostrarToast('error', 'Error', 'No se pudieron cargar los datos de la cotizacion');
  }
}

function buildServicioSelectOptions(selectedId: number | null): string {
  let opts = '<option value="">Seleccione servicio...</option>';
  serviciosDisponibles.forEach(s => {
    const sel = (selectedId && s.id === selectedId) ? 'selected' : '';
    opts += '<option value="' + s.id + '" ' + sel + '>' + s.nombre + '</option>';
  });
  return opts;
}

function agregarLineaConDatos(idServicio: number | null, nombre: string, frecuencia: string, precio: number) {
  const tbody = document.getElementById('ods-detalle-body');
  if (!tbody) return;

  contadorLineasSrv++;
  const lineaId = 'linea-srv-' + contadorLineasSrv;

  const frecOpts = ['', 'Unica', 'Semanal', 'Quincenal', 'Mensual', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'];
  const frecSelect = frecOpts.map(f => {
    const label = f || 'A SOLICITUD DEL CLIENTE';
    const sel = (f && frecuencia && f.toLowerCase() === frecuencia.toLowerCase()) ? 'selected' : (!f && !frecuencia ? 'selected' : '');
    return '<option value="' + f + '" ' + sel + '>' + label + '</option>';
  }).join('');

  // Si el servicio viene de cotizacion y no esta en la lista, agregarlo temporalmente
  let servicioOpts = buildServicioSelectOptions(idServicio);
  if (idServicio && !serviciosDisponibles.find(s => s.id === idServicio) && nombre) {
    servicioOpts += '<option value="' + idServicio + '" selected>' + nombre + '</option>';
  }

  const html =
    '<tr id="' + lineaId + '" data-id-servicio="' + (idServicio || '') + '">' +
      '<td>' +
        '<select class="os-input os-input-sm servicio-select">' + servicioOpts + '</select>' +
        '<input type="hidden" class="servicio-id-hidden" value="' + (idServicio || '') + '">' +
      '</td>' +
      '<td>' +
        '<input type="text" class="os-input os-input-sm local-input" placeholder="Ej: Oficina Central..." value="">' +
      '</td>' +
      '<td>' +
        '<select class="os-input os-input-sm frecuencia-select">' + frecSelect + '</select>' +
      '</td>' +
      '<td>' +
        '<input type="number" class="os-input os-input-sm precio-input" value="' + precio.toFixed(2) + '" min="0" step="0.01">' +
      '</td>' +
      '<td>' +
        '<button type="button" class="btn-icon btn-eliminar-linea" data-linea="' + lineaId + '" title="Eliminar" style="color:#ef4444;">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<polyline points="3 6 5 6 21 6"></polyline>' +
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
          '</svg>' +
        '</button>' +
      '</td>' +
    '</tr>';

  tbody.insertAdjacentHTML('beforeend', html);
  bindLineasServicios();
}

function agregarLineaVacia() {
  agregarLineaConDatos(null, '', '', 0);
  // Focus en el select de servicio
  const lastRow = document.getElementById('linea-srv-' + contadorLineasSrv);
  if (lastRow) {
    const select = lastRow.querySelector('.servicio-select') as HTMLSelectElement;
    if (select) select.focus();
  }
}

function bindLineasServicios() {
  // Eliminar listeners previos clonando
  document.querySelectorAll('.btn-eliminar-linea').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.btn-eliminar-linea').forEach(btn => {
    btn.addEventListener('click', () => {
      const lineaId = (btn as HTMLElement).dataset.linea;
      if (lineaId) {
        document.getElementById(lineaId)?.remove();
        calcularTotalCosto();
      }
    });
  });
  document.querySelectorAll('.precio-input').forEach(input => {
    (input as HTMLElement).removeEventListener('input', calcularTotalCosto);
    (input as HTMLElement).addEventListener('input', calcularTotalCosto);
  });
  // Sincronizar select servicio con hidden
  document.querySelectorAll('.servicio-select').forEach(sel => {
    (sel as HTMLElement).removeEventListener('change', syncServicioHidden);
    (sel as HTMLElement).addEventListener('change', syncServicioHidden);
  });
}

function syncServicioHidden(e: Event) {
  const select = e.target as HTMLSelectElement;
  const tr = select.closest('tr');
  if (tr) {
    const hidden = tr.querySelector('.servicio-id-hidden') as HTMLInputElement;
    if (hidden) hidden.value = select.value;
    tr.setAttribute('data-id-servicio', select.value);
  }
}

function calcularTotalCosto() {
  const lineas = document.querySelectorAll('#ods-detalle-body tr');
  let subtotal = 0;
  lineas.forEach(linea => {
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    subtotal += precio;
  });
  const igv = incluyeIgv ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
  const total = subtotal + igv;

  const elSub = document.getElementById('ods-subtotal');
  const elIgv = document.getElementById('ods-igv-monto');
  const elTotal = document.getElementById('ods-total-costo');
  if (elSub) elSub.textContent = 'S/ ' + subtotal.toFixed(2);
  if (elIgv) elIgv.textContent = 'S/ ' + igv.toFixed(2);
  if (elTotal) elTotal.textContent = 'S/ ' + total.toFixed(2);
}

function limpiarFormODS() {
  (document.getElementById('ods-edit-id') as HTMLInputElement).value = '';
  (document.getElementById('ods-numero-orden') as HTMLInputElement).value = '';
  (document.getElementById('ods-version') as HTMLInputElement).value = '01';
  (document.getElementById('ods-cotizacion-ref') as HTMLSelectElement).value = '';
  (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = '';
  (document.getElementById('ods-cliente-id') as HTMLInputElement).value = '';
  (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = '';
  (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
  (document.getElementById('ods-fecha-tentativa') as HTMLInputElement).value = '';
  (document.getElementById('ods-emitido-por') as HTMLSelectElement).value = '';
  (document.getElementById('ods-igv') as HTMLSelectElement).value = '1';
  incluyeIgv = true;
  const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
  if (igvRow) igvRow.style.display = 'flex';
  (document.getElementById('ods-cotizacion-info') as HTMLElement).style.display = 'none';
  (document.getElementById('ods-detalle-body') as HTMLElement).innerHTML = '';
  (document.getElementById('ods-subtotal') as HTMLElement).textContent = 'S/ 0.00';
  (document.getElementById('ods-igv-monto') as HTMLElement).textContent = 'S/ 0.00';
  (document.getElementById('ods-total-costo') as HTMLElement).textContent = 'S/ 0.00';
  contadorLineasSrv = 0;
}

async function abrirModalNuevaODS() {
  limpiarFormODS();
  (document.getElementById('modal-ods-titulo') as HTMLElement).textContent = 'Nueva Orden de Servicio';
  const cotSelect = document.getElementById('ods-cotizacion-ref') as HTMLSelectElement;
  cotSelect.disabled = false;

  // Cargar siguiente número de orden (correlativo)
  try {
    const numRes = await ordenServicioService.getSiguienteNumero();
    const numRaw = numRes.data || numRes;
    const numData = (numRaw as any).data || numRaw;
    (document.getElementById('ods-numero-orden') as HTMLInputElement).value = numData.numero_orden || '';
  } catch (e) {
    console.error('Error obteniendo siguiente número:', e);
    (document.getElementById('ods-numero-orden') as HTMLInputElement).value = 'Error';
  }

  await Promise.all([cargarDropdownCotizaciones(), cargarDropdownPersonal(), cargarServiciosDisponibles()]);
  (document.getElementById('modal-ods') as HTMLElement).style.display = 'flex';
}

async function abrirModalEditarODS(id: number, soloLectura: boolean = false) {
  try {
    const res = await ordenServicioService.getById(id);
    const raw = res.data || res;
    const orden = (raw as any).data || raw;

    // 1. Limpiamos y cargamos catálogos
    limpiarFormODS();
    await Promise.all([cargarDropdownCotizaciones(), cargarDropdownPersonal(), cargarServiciosDisponibles()]);

    // 2. Título y IDs básicos
    (document.getElementById('modal-ods-titulo') as HTMLElement).textContent = soloLectura ? 'Consultar Orden de Servicio' : 'Editar Orden de Servicio';
    (document.getElementById('ods-edit-id') as HTMLInputElement).value = String(orden.id);
    (document.getElementById('ods-numero-orden') as HTMLInputElement).value = orden.numero_orden || '';
    (document.getElementById('ods-version') as HTMLInputElement).value = orden.version || '01';

    // 3. Llenado de Cotización y Cliente (Mantenemos tu lógica)
    const cotSelect = document.getElementById('ods-cotizacion-ref') as HTMLSelectElement;
    if (orden.id_cotizacion) {
      const cotNum = orden.cotizacion?.numero_cotizacion || ('COT-' + orden.id_cotizacion);
      const existing = Array.from(cotSelect.options).find(o => o.value === String(orden.id_cotizacion));
      if (!existing) {
        cotSelect.insertAdjacentHTML('beforeend', '<option value="' + orden.id_cotizacion + '">' + cotNum + '</option>');
      }
      cotSelect.value = String(orden.id_cotizacion);
      cotSelect.disabled = true; // Siempre readonly en edición/ver
    }

    (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = orden.cliente?.nombre_empresa || '';
    (document.getElementById('ods-cliente-id') as HTMLInputElement).value = String(orden.cliente?.id || orden.id_cliente || '');
    (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = orden.cliente?.ruc || '';

    // 4. Fechas y Personal
    (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).value = orden.fecha_aceptacion?.split('T')[0] || '';
    (document.getElementById('ods-fecha-tentativa') as HTMLInputElement).value = orden.fecha_tentativa?.split('T')[0] || '';

    setTimeout(() => {
      (document.getElementById('ods-emitido-por') as HTMLSelectElement).value = String(orden.emitido_por || '');
    }, 100);

    // 5. IGV
    incluyeIgv = orden.incluye_igv !== false;
    (document.getElementById('ods-igv') as HTMLSelectElement).value = incluyeIgv ? '1' : '0';
    const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';

    // 6. Detalles (Agregamos las líneas)
    const detalles = orden.detalles || [];
    detalles.forEach((d: any) => {
      agregarLineaConDatos(
        d.id_servicio,
        d.servicio?.nombre || ('Servicio #' + d.id_servicio),
        d.frecuencia || '',
        Number(d.precio || 0)
      );
      const lastRow = document.getElementById('linea-srv-' + contadorLineasSrv);
      if (lastRow) {
        (lastRow.querySelector('.local-input') as HTMLInputElement).value = d.local || '';
      }
    });

    // ==========================================
    // NUEVA LÓGICA DE BLOQUEO (SOLO LECTURA)
    // ==========================================
    
    // Bloquear todos los inputs y selects del modal
    const inputs = document.querySelectorAll('#modal-ods .os-input, #modal-ods select, #modal-ods input');
    inputs.forEach(input => {
      const el = input as HTMLInputElement;
      // Si es soloLectura, bloqueamos. Si es Editar, habilitamos (excepto cotización que ya es disabled arriba)
      if (el.id !== 'ods-cotizacion-ref' && el.id !== 'ods-numero-orden' && el.id !== 'ods-cliente-nombre' && el.id !== 'ods-cliente-ruc') {
          el.disabled = soloLectura;
      }
    });

    const btnGuardar = document.getElementById('modal-ods-guardar') as HTMLElement;
    const btnCancelar = document.getElementById('modal-ods-cancelar') as HTMLElement;
    const btnAgregarSrv = document.getElementById('btn-agregar-linea-servicio') as HTMLElement;

    if (soloLectura) {
      btnGuardar.style.display = 'none';           // Quitamos botón Guardar
      btnCancelar.textContent = 'Salir';           // Cambiamos Cancelar por Salir
      if (btnAgregarSrv) btnAgregarSrv.style.display = 'none'; // Quitamos botón agregar servicio
      
      // Bloquear botones de eliminar líneas de la tabla
      setTimeout(() => {
          document.querySelectorAll('.btn-eliminar-linea').forEach(b => (b as HTMLElement).style.display = 'none');
      }, 150);
    } else {
      btnGuardar.style.display = 'flex';           // Mostramos Guardar
      btnGuardar.textContent = 'Actualizar Orden'; // Texto de edición
      btnCancelar.textContent = 'Cancelar';
      if (btnAgregarSrv) btnAgregarSrv.style.display = 'flex';
    }

    calcularTotalCosto();
    (document.getElementById('modal-ods') as HTMLElement).style.display = 'flex';

  } catch (e) {
    console.error('Error cargando ODS:', e);
    mostrarToast('error', 'Error', 'No se pudo cargar la orden de servicio');
  }
}

let odsEliminarId = 0;

function abrirModalEliminarODS(id: number, numero: string) {
  odsEliminarId = id;
  (document.getElementById('ods-eliminar-numero') as HTMLElement).textContent = numero;
  (document.getElementById('modal-ods-eliminar') as HTMLElement).style.display = 'flex';
}

async function guardarODS() {
  const editId = (document.getElementById('ods-edit-id') as HTMLInputElement).value;
  const idCotizacion = (document.getElementById('ods-cotizacion-ref') as HTMLSelectElement).value;
  const fechaAceptacion = (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).value;
  const fechaTentativa = (document.getElementById('ods-fecha-tentativa') as HTMLInputElement).value;
  const emitidoPor = (document.getElementById('ods-emitido-por') as HTMLSelectElement).value;
  const version = (document.getElementById('ods-version') as HTMLInputElement).value;

  if (!idCotizacion) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar una cotizacion de referencia');
    return;
  }
  if (!fechaAceptacion) {
    mostrarToast('error', 'Campo requerido', 'La fecha de aceptacion es obligatoria');
    return;
  }
  if (!emitidoPor) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar quien emite la orden');
    return;
  }

  const lineas = document.querySelectorAll('#ods-detalle-body tr');
  if (lineas.length === 0) {
    mostrarToast('error', 'Sin servicios', 'Debe agregar al menos un servicio');
    return;
  }

  const detalles: any[] = [];
  let valid = true;
  lineas.forEach(linea => {
    const selectSrv = linea.querySelector('.servicio-select') as HTMLSelectElement;
    const idServicio = selectSrv?.value || (linea.querySelector('.servicio-id-hidden') as HTMLInputElement)?.value;
    const local = (linea.querySelector('.local-input') as HTMLInputElement)?.value || '';
    const frecuencia = (linea.querySelector('.frecuencia-select') as HTMLSelectElement)?.value || '';
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');

    if (!idServicio) valid = false;

    detalles.push({
      id_servicio: Number(idServicio),
      local: local || null,
      frecuencia: frecuencia || null,
      precio,
    });
  });

  if (!valid) {
    mostrarToast('error', 'Error', 'Todos los servicios deben tener un servicio asignado');
    return;
  }

  const payload: any = {
    id_cotizacion: Number(idCotizacion),
    fecha_aceptacion: fechaAceptacion,
    fecha_tentativa: fechaTentativa || null,
    emitido_por: Number(emitidoPor),
    version: version || null,
    incluye_igv: incluyeIgv,
    detalles,
  };

  try {
    if (editId) {
      await ordenServicioService.update(Number(editId), payload);
      mostrarToast('success', 'Orden Actualizada', 'La orden de servicio se actualizo correctamente');
    } else {
      await ordenServicioService.create(payload);
      mostrarToast('success', 'Orden Creada', 'La orden de servicio se creo correctamente');
    }
    (document.getElementById('modal-ods') as HTMLElement).style.display = 'none';
    await Promise.all([cargarOrdenesServicio(), cargarEstadisticasODS()]);
  } catch (e: any) {
    console.error('Error guardando ODS:', e);
    const msg = e?.data?.message || e?.message || 'No se pudo guardar la orden';
    mostrarToast('error', 'Error', msg);
  }
}

async function eliminarODS() {
  if (!odsEliminarId) return;
  try {
    await ordenServicioService.delete(odsEliminarId);
    mostrarToast('success', 'Orden Eliminada', 'La orden fue eliminada correctamente');
    (document.getElementById('modal-ods-eliminar') as HTMLElement).style.display = 'none';
    odsEliminarId = 0;
    await Promise.all([cargarOrdenesServicio(), cargarEstadisticasODS()]);
  } catch (e) {
    mostrarToast('error', 'Error', 'No se pudo eliminar la orden');
  }
}

// =============================
// INIT EVENTS
// =============================
export function initOrdenesServicioEvents() {
  // Boton nueva ODS
  document.getElementById('btn-nueva-ods')?.addEventListener('click', abrirModalNuevaODS);

  // Filtrar
  document.getElementById('ods-btn-filtrar')?.addEventListener('click', cargarOrdenesServicio);

  // Search con debounce
  const searchInput = document.getElementById('ods-search') as HTMLInputElement;
  if (searchInput) {
    let timeout: any;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(cargarOrdenesServicio, 400);
    });
  }

  // Modal ODS cerrar/cancelar
  const modal = document.getElementById('modal-ods') as HTMLElement;
  document.getElementById('modal-ods-cerrar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
  document.getElementById('modal-ods-cancelar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });

  // Guardar
  document.getElementById('modal-ods-guardar')?.addEventListener('click', guardarODS);

  // Cotizacion change -> auto-fill
  document.getElementById('ods-cotizacion-ref')?.addEventListener('change', async () => {
    const val = (document.getElementById('ods-cotizacion-ref') as HTMLSelectElement).value;
    if (val) {
      await cargarDatosCotizacion(Number(val));
    } else {
      (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = '';
      (document.getElementById('ods-cliente-id') as HTMLInputElement).value = '';
      (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = '';
      (document.getElementById('ods-cotizacion-info') as HTMLElement).style.display = 'none';
      (document.getElementById('ods-detalle-body') as HTMLElement).innerHTML = '';
      calcularTotalCosto();
    }
  });

  // IGV change -> recalcular
  document.getElementById('ods-igv')?.addEventListener('change', (e) => {
    incluyeIgv = (e.target as HTMLSelectElement).value === '1';
    const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';
    calcularTotalCosto();
  });

  // Agregar linea servicio manual
  document.getElementById('btn-agregar-linea-servicio')?.addEventListener('click', agregarLineaVacia);

  // Modal eliminar
  const modalElim = document.getElementById('modal-ods-eliminar') as HTMLElement;
  document.getElementById('modal-ods-eliminar-cerrar')?.addEventListener('click', () => { if (modalElim) modalElim.style.display = 'none'; });
  document.getElementById('modal-ods-eliminar-cancelar')?.addEventListener('click', () => { if (modalElim) modalElim.style.display = 'none'; });
  document.getElementById('modal-ods-eliminar-confirmar')?.addEventListener('click', eliminarODS);

  // Cargar datos iniciales
  cargarEstadisticasODS();
  cargarOrdenesServicio();
}
