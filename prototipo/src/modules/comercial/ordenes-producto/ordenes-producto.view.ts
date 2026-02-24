// Comercial - Ordenes de Producto (Conectado al Backend)
import './ordenes-producto.css';
import { ordenProductoService } from '../../../services/ordenProductoService';
import { productoService } from '../../../services/productoService';
import { mostrarToast } from '../../../shared/toast';

let opListData: any[] = [];
let cotizacionesDisponibles: any[] = [];
let personalData: any[] = [];
let productosDisponibles: any[] = [];
let incluyeIgv = true;
let contadorLineasProd = 0;

export function renderComercialOrdenesProducto() {
  return `
  <div class="op-main-container">

    <!-- HEADER -->
    <div class="op-header">
      <div class="op-header-top">
        <h1 class="op-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <path d="M16 8h5l3 3v5h-2m-4 0H2"></path>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          Ordenes de Producto
        </h1>
        <button class="op-btn-primary" id="btn-nueva-op">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Orden de Producto
        </button>
      </div>

      <!-- STATS -->
      <div class="op-stats-grid">
        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div class="op-stat-info">
            <span class="op-stat-label">Total Ordenes</span>
            <span class="op-stat-value" id="stat-op-total">-</span>
          </div>
        </div>
        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="op-stat-info">
            <span class="op-stat-label">Valor Total</span>
            <span class="op-stat-value" id="stat-op-valor">-</span>
          </div>
        </div>
        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="op-stat-info">
            <span class="op-stat-label">Ordenes este Mes</span>
            <span class="op-stat-value" id="stat-op-mes">-</span>
          </div>
        </div>
        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="op-stat-info">
            <span class="op-stat-label">Valor este Mes</span>
            <span class="op-stat-value" id="stat-op-valor-mes">-</span>
          </div>
        </div>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="op-filters-bar">
      <div class="op-search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" id="op-search" placeholder="Buscar orden de producto..." class="op-search-input">
      </div>
      <div class="op-filter-group">
        <input type="date" class="op-filter-select" id="op-filter-desde" title="Desde">
        <input type="date" class="op-filter-select" id="op-filter-hasta" title="Hasta">
        <button class="op-btn-secondary" id="op-btn-filtrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filtrar
        </button>
      </div>
    </div>

    <!-- TABLA -->
    <div class="op-table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>N Orden</th>
            <th>Cliente</th>
            <th>Cotizacion</th>
            <th>Fecha Envio</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="op-tabla-body">
          <tr><td colspan="7" style="text-align:center;padding:40px;color:#64748b;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL NUEVA/EDITAR OP -->
    <div class="op-form-overlay" id="modal-op" style="display:none;">
      <div class="op-form-card" style="max-width:850px;">
        <div class="op-form-header">
          <h2 class="op-form-title" id="modal-op-titulo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <path d="M16 8h5l3 3v5h-2m-4 0H2"></path>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Nueva Orden de Producto
          </h2>
          <button class="op-btn-close" id="modal-op-cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="op-form-content">
          <input type="hidden" id="op-edit-id">

          <!-- Informacion General -->
          <div class="op-section">
            <h3 class="op-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Informacion General
            </h3>
            <div class="op-grid">
              <div class="op-field">
                <label class="op-label">N Orden</label>
                <input type="text" id="op-numero-orden" class="op-input" readonly placeholder="Auto-generado">
              </div>
              <div class="op-field">
                <label class="op-label">Cotizacion Referencia <span class="op-required">*</span></label>
                <select id="op-cotizacion-ref" class="op-input">
                  <option value="">Cargando cotizaciones...</option>
                </select>
              </div>
              <div class="op-field">
                <label class="op-label">Cliente</label>
                <input type="text" id="op-cliente-nombre" class="op-input" readonly placeholder="Se auto-completa al elegir cotizacion">
                <input type="hidden" id="op-cliente-id">
              </div>
              <div class="op-field">
                <label class="op-label">RUC</label>
                <input type="text" id="op-cliente-ruc" class="op-input" readonly>
              </div>
              <div class="op-field">
                <label class="op-label">Fecha de Envio <span class="op-required">*</span></label>
                <input type="date" id="op-fecha-envio" class="op-input">
              </div>
              <div class="op-field">
                <label class="op-label">Emitido por <span class="op-required">*</span></label>
                <select id="op-emitido-por" class="op-input">
                  </select>
              </div>
              <div class="op-field">
                <label class="op-label">IGV (18%)</label>
                <select id="op-igv" class="op-input">
                  <option value="1" selected>Si - Con IGV (18%)</option>
                  <option value="0">No - Sin IGV</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Info cotizacion -->
          <div id="op-cotizacion-info" style="display:none;margin-bottom:20px;">
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
              <div>
                <strong id="op-cot-info-numero" style="color:#0284c7;"></strong>
                <span id="op-cot-info-detalle" style="color:#475569;margin-left:8px;"></span>
              </div>
            </div>
          </div>

          <!-- Detalle de Productos -->
          <div class="op-section">
            <div class="op-section-header">
              <h3 class="op-section-title" style="margin-bottom:0;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Detalle de Productos
              </h3>
              <button type="button" class="op-btn-secondary" id="btn-agregar-linea-producto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Producto
              </button>
            </div>
            <div class="op-table-wrapper">
              <table class="op-table">
                <thead>
                  <tr>
                    <th style="width:32%;">Producto</th>
                    <th style="width:15%;">Cantidad</th>
                    <th style="width:18%;">Precio Unit.</th>
                    <th style="width:18%;">Subtotal</th>
                    <th style="width:10%;"></th>
                  </tr>
                </thead>
                <tbody id="op-detalle-body"></tbody>
              </table>
            </div>
          </div>

          <!-- Total -->
          <div class="op-total-container">
            <div class="op-total-row" style="border:none;padding:8px 0;">
              <span class="op-total-label" style="font-size:14px;font-weight:500;color:#475569;">Subtotal:</span>
              <span class="op-total-value" id="op-subtotal" style="font-size:16px;color:#475569;">S/ 0.00</span>
            </div>
            <div class="op-total-row" id="op-igv-row" style="border:none;padding:8px 0;">
              <span class="op-total-label" style="font-size:14px;font-weight:500;color:#475569;">IGV (18%):</span>
              <span class="op-total-value" id="op-igv-monto" style="font-size:16px;color:#475569;">S/ 0.00</span>
            </div>
            <div class="op-total-row">
              <span class="op-total-label">Total:</span>
              <span class="op-total-value" id="op-total-costo">S/ 0.00</span>
            </div>
          </div>
        </div>

        <div class="op-form-actions" style="padding:20px 28px;">
          <button type="button" class="op-btn-cancel" id="modal-op-cancelar">Cancelar</button>
          <button type="button" class="op-btn-submit" id="modal-op-guardar">
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

async function cargarEstadisticasOP() {
  try {
    const res = await ordenProductoService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;

    const el = (id: string) => document.getElementById(id);
    if (el('stat-op-total')) el('stat-op-total')!.textContent = String(stats.total_ordenes ?? 0);
    if (el('stat-op-valor')) el('stat-op-valor')!.textContent = 'S/ ' + Number(stats.total_valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
    if (el('stat-op-mes')) el('stat-op-mes')!.textContent = String(stats.ordenes_mes_actual ?? 0);
    if (el('stat-op-valor-mes')) el('stat-op-valor-mes')!.textContent = 'S/ ' + Number(stats.valor_mes_actual ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
  } catch (e) {
    console.error('Error cargando estadisticas OP:', e);
  }
}

function obtenerUsuarioLogueado() {
  const sesion = localStorage.getItem('auth') || localStorage.getItem('user');
  if (sesion) {
    return JSON.parse(sesion); 
  }
  return null;
}

async function cargarOrdenesProducto() {
  const tbody = document.getElementById('op-tabla-body');
  if (!tbody) return;

  try {
    const params: any = {};
    const search = (document.getElementById('op-search') as HTMLInputElement)?.value?.trim();
    const desde = (document.getElementById('op-filter-desde') as HTMLInputElement)?.value;
    const hasta = (document.getElementById('op-filter-hasta') as HTMLInputElement)?.value;
    if (search) params.search = search;
    if (desde) params.fecha_desde = desde;
    if (hasta) params.fecha_hasta = hasta;

    const res = await ordenProductoService.getAll(params);
    const raw = res.data || res;
    opListData = Array.isArray(raw) ? raw : (raw as any).data || [];

    if (opListData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#64748b;">No se encontraron ordenes de producto</td></tr>';
      return;
    }

    const formatFecha = (f: string | null | undefined): string => {
      if (!f) return '-';
      const [y, m, d] = f.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    };

    tbody.innerHTML = opListData.map(o => {
      const fechaEnvio = formatFecha(o.fecha_envio);
      const total = Number(o.total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      const cotNum = o.cotizacion?.numero_cotizacion || o.cotizacion_numero || '-';
      return '<tr>' +
        '<td><strong>' + (o.numero_orden || '') + '</strong></td>' +
        '<td>' + (o.cliente?.nombre_empresa || '-') + '</td>' +
        '<td>' + cotNum + '</td>' +
        '<td>' + fechaEnvio + '</td>' +
        '<td><strong>S/ ' + total + '</strong></td>' +
        '<td><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;' + (o.estado === 'Aprobado' ? 'background:#dcfce7;color:#166534;' : o.estado === 'Rechazado' ? 'background:#fee2e2;color:#991b1b;' : 'background:#fef3c7;color:#92400e;') + '">' + (o.estado || 'Aprobado') + '</span></td>' +
        '<td>' +
          '<div class="op-action-buttons" style="display:flex; gap:8px;">' +
            // BOTÓN VER (Ojito)
            '<button class="op-btn-icon btn-ver-op" data-id="' + o.id + '" title="Ver Detalle" style="color: #64748b;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
            '</button>' +
            
            // BOTÓN EDITAR (Lápiz Azul) - ¡ESTE ES EL QUE FALTA!
            '<button class="op-btn-icon btn-editar-op" data-id="' + o.id + '" title="Editar" style="color: #0284c7;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
            '</button>' +
            
            // BOTÓN PDF
            '<button class="op-btn-icon btn-download-pdf-op" data-id="' + o.id + '" title="Descargar PDF" style="color:#2c4a7c;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    bindAccionesTablaOP();
  } catch (e) {
    console.error('Error cargando ordenes:', e);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar ordenes</td></tr>';
  }
}

function bindAccionesTablaOP() {
  // VER
  document.querySelectorAll('.btn-ver-op').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarOP(id, true); // <--- TRUE para bloquear
    });
  });

  // EDITAR
  document.querySelectorAll('.btn-editar-op').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarOP(id, false); // <--- FALSE para editar
    });
  });

  //PDF
  document.querySelectorAll('.btn-download-pdf-op').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      try {
        await ordenProductoService.downloadPDF(id);
      } catch (e) {
        console.error('Error descargando PDF:', e);
      }
    });
  });
}

async function cargarDropdownCotizaciones() {
  const select = document.getElementById('op-cotizacion-ref') as HTMLSelectElement;
  if (!select) return;
  try {
    const res = await ordenProductoService.getCotizacionesDisponibles();
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
  const select = document.getElementById('op-emitido-por') as HTMLSelectElement;
  if (!select) return;
  try {
    const res = await ordenProductoService.getPersonal();
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

async function cargarProductosDisponibles() {
  try {
    const res = await productoService.getAll({ estado: 'Activo', per_page: 100 } as any);
    const raw = res.data || res;
    productosDisponibles = Array.isArray(raw) ? raw : (raw as any).data || [];
  } catch (e) {
    console.error('Error cargando productos:', e);
    productosDisponibles = [];
  }
}

async function cargarDatosCotizacion(cotizacionId: number) {
  try {
    const res = await ordenProductoService.getDesdeCotizacion(cotizacionId);
    const raw = res.data || res;
    const data = (raw as any).data || raw;

    // Auto-llenar cliente
    (document.getElementById('op-cliente-nombre') as HTMLInputElement).value = data.cliente?.nombre_empresa || '';
    (document.getElementById('op-cliente-id') as HTMLInputElement).value = String(data.cliente?.id || '');
    (document.getElementById('op-cliente-ruc') as HTMLInputElement).value = data.cliente?.ruc || '';

    // Info cotizacion
    const infoDiv = document.getElementById('op-cotizacion-info') as HTMLElement;
    infoDiv.style.display = 'block';
    (document.getElementById('op-cot-info-numero') as HTMLElement).textContent = data.cotizacion?.numero_cotizacion || '';
    (document.getElementById('op-cot-info-detalle') as HTMLElement).textContent =
      '| Emitida: ' + (data.cotizacion?.fecha_emision || '') + ' | Total: S/ ' + Number(data.total || 0).toFixed(2);

    // Auto-setear IGV desde cotizacion
    incluyeIgv = data.incluye_igv !== false;
    const igvSelect = document.getElementById('op-igv') as HTMLSelectElement;
    if (igvSelect) igvSelect.value = incluyeIgv ? '1' : '0';
    const igvRow = document.getElementById('op-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';

    // Auto-llenar detalles
    const detalles = data.detalles || [];
    const tbody = document.getElementById('op-detalle-body') as HTMLElement;
    tbody.innerHTML = '';
    contadorLineasProd = 0;

    detalles.forEach((d: any) => {
      agregarLineaConDatos(d.id_producto, d.producto_nombre || '', Number(d.cantidad || 1), Number(d.precio_unitario || 0));
    });

    calcularTotalCosto();
  } catch (e) {
    console.error('Error cargando datos de cotizacion:', e);
    mostrarToast('error', 'Error', 'No se pudieron cargar los datos de la cotizacion');
  }
}

function buildProductoSelectOptions(selectedId: number | null): string {
  let opts = '<option value="">Seleccione producto...</option>';
  productosDisponibles.forEach(p => {
    const sel = (selectedId && p.id === selectedId) ? 'selected' : '';
    const precio = p.precio_unitario ? ` (S/ ${Number(p.precio_unitario).toFixed(2)})` : '';
    opts += '<option value="' + p.id + '" data-precio="' + (p.precio_unitario || 0) + '" ' + sel + '>' + (p.descripcion || 'Producto') + precio + '</option>';
  });
  return opts;
}

function agregarLineaConDatos(idProducto: number | null, nombre: string, cantidad: number, precioUnitario: number) {
  const tbody = document.getElementById('op-detalle-body');
  if (!tbody) return;

  contadorLineasProd++;
  const lineaId = 'linea-prod-' + contadorLineasProd;

  // Build options, add fallback if product from cotización not in active list
  let productoOpts = buildProductoSelectOptions(idProducto);
  if (idProducto && !productosDisponibles.find(p => p.id === idProducto) && nombre) {
    productoOpts += '<option value="' + idProducto + '" selected>' + nombre + '</option>';
  }

  const subtotal = cantidad * precioUnitario;

  const html =
    '<tr id="' + lineaId + '" data-id-producto="' + (idProducto || '') + '">' +
      '<td>' +
        '<select class="op-input op-input-sm producto-select">' + productoOpts + '</select>' +
        '<input type="hidden" class="producto-id-hidden" value="' + (idProducto || '') + '">' +
      '</td>' +
      '<td>' +
        '<input type="number" class="op-input op-input-sm cantidad-input" value="' + cantidad + '" min="1">' +
      '</td>' +
      '<td>' +
        '<input type="number" class="op-input op-input-sm precio-input" value="' + precioUnitario.toFixed(2) + '" min="0" step="0.01">' +
      '</td>' +
      '<td>' +
        '<strong class="op-subtotal subtotal-linea">S/ ' + subtotal.toFixed(2) + '</strong>' +
      '</td>' +
      '<td>' +
        '<button type="button" class="op-btn-remove btn-eliminar-linea" data-linea="' + lineaId + '" title="Eliminar">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<polyline points="3 6 5 6 21 6"></polyline>' +
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
          '</svg>' +
        '</button>' +
      '</td>' +
    '</tr>';

  tbody.insertAdjacentHTML('beforeend', html);
  bindLineasProductos();
}

function agregarLineaVacia() {
  agregarLineaConDatos(null, '', 1, 0);
  const lastRow = document.getElementById('linea-prod-' + contadorLineasProd);
  if (lastRow) {
    const select = lastRow.querySelector('.producto-select') as HTMLSelectElement;
    if (select) select.focus();
  }
}

function bindLineasProductos() {
  // Eliminar listeners previos clonando
  document.querySelectorAll('#op-detalle-body .btn-eliminar-linea').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('#op-detalle-body .btn-eliminar-linea').forEach(btn => {
    btn.addEventListener('click', () => {
      const lineaId = (btn as HTMLElement).dataset.linea;
      if (lineaId) {
        document.getElementById(lineaId)?.remove();
        calcularTotalCosto();
      }
    });
  });

  // Producto select -> auto-fill price + sync hidden
  document.querySelectorAll('#op-detalle-body .producto-select').forEach(sel => {
    const select = sel as HTMLSelectElement;
    select.removeEventListener('change', handleProductoChange);
    select.addEventListener('change', handleProductoChange);
  });

  // Cantidad change -> recalcular
  document.querySelectorAll('#op-detalle-body .cantidad-input').forEach(input => {
    (input as HTMLElement).removeEventListener('input', handleCantidadPrecioChange);
    (input as HTMLElement).addEventListener('input', handleCantidadPrecioChange);
  });

  // Precio change -> recalcular
  document.querySelectorAll('#op-detalle-body .precio-input').forEach(input => {
    (input as HTMLElement).removeEventListener('input', handleCantidadPrecioChange);
    (input as HTMLElement).addEventListener('input', handleCantidadPrecioChange);
  });
}

function handleProductoChange(e: Event) {
  const select = e.target as HTMLSelectElement;
  const tr = select.closest('tr');
  if (!tr) return;

  // Sync hidden
  const hidden = tr.querySelector('.producto-id-hidden') as HTMLInputElement;
  if (hidden) hidden.value = select.value;
  tr.setAttribute('data-id-producto', select.value);

  // Auto-fill price from data attribute
  const option = select.options[select.selectedIndex];
  const precio = option?.getAttribute('data-precio');
  if (precio) {
    const precioInput = tr.querySelector('.precio-input') as HTMLInputElement;
    if (precioInput) precioInput.value = Number(precio).toFixed(2);
  }

  recalcularLinea(tr);
  calcularTotalCosto();
}

function handleCantidadPrecioChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const tr = input.closest('tr');
  if (tr) {
    recalcularLinea(tr);
    calcularTotalCosto();
  }
}

function recalcularLinea(tr: Element) {
  const cantidad = parseFloat((tr.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
  const precio = parseFloat((tr.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
  const subtotal = cantidad * precio;
  const subtotalEl = tr.querySelector('.subtotal-linea');
  if (subtotalEl) subtotalEl.textContent = 'S/ ' + subtotal.toFixed(2);
}

function calcularTotalCosto() {
  const lineas = document.querySelectorAll('#op-detalle-body tr');
  let subtotal = 0;
  lineas.forEach(linea => {
    const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    subtotal += cantidad * precio;
  });
  const igv = incluyeIgv ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
  const total = subtotal + igv;

  const elSub = document.getElementById('op-subtotal');
  const elIgv = document.getElementById('op-igv-monto');
  const elTotal = document.getElementById('op-total-costo');
  if (elSub) elSub.textContent = 'S/ ' + subtotal.toFixed(2);
  if (elIgv) elIgv.textContent = 'S/ ' + igv.toFixed(2);
  if (elTotal) elTotal.textContent = 'S/ ' + total.toFixed(2);
}

function limpiarFormOP() {
  // 1. Limpieza de valores (Inputs y IDs)
  (document.getElementById('op-edit-id') as HTMLInputElement).value = '';
  (document.getElementById('op-numero-orden') as HTMLInputElement).value = '';
  (document.getElementById('op-cotizacion-ref') as HTMLSelectElement).value = '';
  (document.getElementById('op-cliente-nombre') as HTMLInputElement).value = '';
  (document.getElementById('op-cliente-id') as HTMLInputElement).value = '';
  (document.getElementById('op-cliente-ruc') as HTMLInputElement).value = '';
  (document.getElementById('op-fecha-envio') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
  (document.getElementById('op-emitido-por') as HTMLSelectElement).value = '';
  (document.getElementById('op-igv') as HTMLSelectElement).value = '1';

  // 2. Reset de estados lógicos y visuales de totales
  incluyeIgv = true;
  const igvRow = document.getElementById('op-igv-row');
  if (igvRow) igvRow.style.display = 'flex';
  
  (document.getElementById('op-cotizacion-info') as HTMLElement).style.display = 'none';
  (document.getElementById('op-detalle-body') as HTMLElement).innerHTML = '';
  (document.getElementById('op-subtotal') as HTMLElement).textContent = 'S/ 0.00';
  (document.getElementById('op-igv-monto') as HTMLElement).textContent = 'S/ 0.00';
  (document.getElementById('op-total-costo') as HTMLElement).textContent = 'S/ 0.00';
  contadorLineasProd = 0;

  // 3. DESBLOQUEO GENERAL (Esto habilita todo, incluyendo el "Emitido por")
  const inputs = document.querySelectorAll('#modal-op .op-input, #modal-op select, #modal-op input');
  inputs.forEach(i => {
    const el = i as HTMLInputElement;
    el.disabled = false;
    el.style.backgroundColor = ''; // Quitamos el gris de bloqueo
    el.style.cursor = '';          // Quitamos el cursor de "prohibido"
  });

  // 4. Restaurar botones de acción
  const btnGuardar = document.getElementById('modal-op-guardar');
  const btnCancelar = document.getElementById('modal-op-cancelar');
  const btnAgregarProd = document.getElementById('btn-agregar-linea-producto');

  if (btnGuardar) btnGuardar.style.display = 'flex';
  if (btnCancelar) btnCancelar.textContent = 'Cancelar';
  if (btnAgregarProd) btnAgregarProd.style.display = 'flex';
}

async function abrirModalNuevaOP() {
  limpiarFormOP();

  // 1. datos de la session storage
  const userRaw = sessionStorage.getItem('qsci_user'); 
  const userSession = JSON.parse(userRaw || '{}');
  
  // traer datos
  const userId = userSession.id;
  const nombreCompleto = `${userSession.nombre || ''} ${userSession.apellido || ''}`.trim();

  (document.getElementById('modal-op-titulo') as HTMLElement).innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5l3 3v5h-2m-4 0H2"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> Nueva Orden de Producto';
  
  const cotSelect = document.getElementById('op-cotizacion-ref') as HTMLSelectElement;
  cotSelect.disabled = false;

  await Promise.all([
    cargarDropdownCotizaciones(), 
    cargarProductosDisponibles()
  ]);

  // 3. uaurio logueado en "Emitido por" (con bloqueo)
  const selectEmitido = document.getElementById('op-emitido-por') as HTMLSelectElement;
  if (selectEmitido && userId) {
    
    selectEmitido.innerHTML = `<option value="${userId}" selected>${nombreCompleto}</option>`;
    
    selectEmitido.disabled = true;
    selectEmitido.style.backgroundColor = '#f1f5f9'; 
    selectEmitido.style.appearance = 'none';      
    selectEmitido.style.webkitAppearance = 'none'; // Para Chrome/Edge
    selectEmitido.style.cursor = 'not-allowed';
  }

  // 4. CARGAR CORRELATIVO
  try {
    const res = await ordenProductoService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;
    if (stats.siguiente_numero) {
      (document.getElementById('op-numero-orden') as HTMLInputElement).value = stats.siguiente_numero;
    }
  } catch (e) {
    console.error('Error obteniendo siguiente numero:', e);
  }

  (document.getElementById('modal-op') as HTMLElement).style.display = 'flex';
}

async function abrirModalEditarOP(id: number, soloLectura: boolean = false) {
  try {
    const res = await ordenProductoService.getById(id);
    const raw = res.data || res;
    const orden = (raw as any).data || raw;

    limpiarFormOP();
    await Promise.all([cargarDropdownCotizaciones(), cargarDropdownPersonal(), cargarProductosDisponibles()]);

    // 1. Título dinámico e Icono
    const tituloEl = document.getElementById('modal-op-titulo') as HTMLElement;
    tituloEl.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="3" width="15" height="13"></rect>
        <path d="M16 8h5l3 3v5h-2m-4 0H2"></path>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg> ${soloLectura ? 'Consultar Orden de Producto' : 'Editar Orden de Producto'}`;

    (document.getElementById('op-edit-id') as HTMLInputElement).value = String(orden.id);
    (document.getElementById('op-numero-orden') as HTMLInputElement).value = orden.numero_orden || '';

    // 2. Cotización (Readonly siempre en edición/ver)
    const cotSelect = document.getElementById('op-cotizacion-ref') as HTMLSelectElement;
    if (orden.id_cotizacion) {
      const cotNum = orden.cotizacion?.numero_cotizacion || ('COT-' + orden.id_cotizacion);
      const existing = Array.from(cotSelect.options).find(o => o.value === String(orden.id_cotizacion));
      if (!existing) {
        cotSelect.insertAdjacentHTML('beforeend', '<option value="' + orden.id_cotizacion + '">' + cotNum + '</option>');
      }
      cotSelect.value = String(orden.id_cotizacion);
      cotSelect.disabled = true; 
    }

    // 3. Llenado de Cliente y Datos
    (document.getElementById('op-cliente-nombre') as HTMLInputElement).value = orden.cliente?.nombre_empresa || '';
    (document.getElementById('op-cliente-id') as HTMLInputElement).value = String(orden.cliente?.id || orden.id_cliente || '');
    (document.getElementById('op-cliente-ruc') as HTMLInputElement).value = orden.cliente?.ruc || '';
    (document.getElementById('op-fecha-envio') as HTMLInputElement).value = orden.fecha_envio?.split('T')[0] || '';

    setTimeout(() => {
      (document.getElementById('op-emitido-por') as HTMLSelectElement).value = String(orden.emitido_por || '');
    }, 100);

    // 4. IGV
    incluyeIgv = orden.incluye_igv !== false;
    (document.getElementById('op-igv') as HTMLSelectElement).value = incluyeIgv ? '1' : '0';
    const igvRow = document.getElementById('op-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';

    // 5. Detalles de Productos
    const detalles = orden.detalles || [];
    detalles.forEach((d: any) => {
      agregarLineaConDatos(
        d.id_producto,
        d.producto?.descripcion || ('Producto #' + d.id_producto),
        Number(d.cantidad || 1),
        Number(d.precio_unitario || 0)
      );
    });

    // ==========================================
    // LÓGICA DE BLOQUEO (MODO CONSULTA)
    // ==========================================
    const inputs = document.querySelectorAll('#modal-op .op-input, #modal-op select, #modal-op input:not([type="hidden"])');
    inputs.forEach(input => {
        const el = input as HTMLInputElement;
        // Si es solo lectura, bloqueamos todo. Si es editar, habilitamos excepto los que ya eran readonly
        if (el.id !== 'op-numero-orden' && el.id !== 'op-cliente-nombre' && el.id !== 'op-cliente-ruc' && el.id !== 'op-cotizacion-ref') {
            el.disabled = soloLectura;
        }
    });

    const btnGuardar = document.getElementById('modal-op-guardar') as HTMLElement;
    const btnCancelar = document.getElementById('modal-op-cancelar') as HTMLElement;
    const btnAgregarProd = document.getElementById('btn-agregar-linea-producto') as HTMLElement;

    if (soloLectura) {
      btnGuardar.style.display = 'none';
      btnCancelar.textContent = 'Salir';
      if (btnAgregarProd) btnAgregarProd.style.display = 'none';
      // Escondemos tachitos de basura en las líneas
      setTimeout(() => {
        document.querySelectorAll('.btn-eliminar-linea').forEach(b => (b as HTMLElement).style.display = 'none');
      }, 150);
    } else {
      btnGuardar.style.display = 'flex';
      btnGuardar.textContent = 'Actualizar Orden';
      btnCancelar.textContent = 'Cancelar';
      if (btnAgregarProd) btnAgregarProd.style.display = 'flex';
    }

    calcularTotalCosto();
    (document.getElementById('modal-op') as HTMLElement).style.display = 'flex';
  } catch (e) {
    console.error('Error cargando OP:', e);
    mostrarToast('error', 'Error', 'No se pudo cargar la orden de producto');
  }
}


async function guardarOP() {
  const editId = (document.getElementById('op-edit-id') as HTMLInputElement).value;
  const idCotizacion = (document.getElementById('op-cotizacion-ref') as HTMLSelectElement).value;
  const fechaEnvio = (document.getElementById('op-fecha-envio') as HTMLInputElement).value;
  const emitidoPor = (document.getElementById('op-emitido-por') as HTMLSelectElement).value;

  if (!idCotizacion) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar una cotizacion de referencia');
    return;
  }
  if (!fechaEnvio) {
    mostrarToast('error', 'Campo requerido', 'La fecha de envio es obligatoria');
    return;
  }
  if (!emitidoPor) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar quien emite la orden');
    return;
  }

  const lineas = document.querySelectorAll('#op-detalle-body tr');
  if (lineas.length === 0) {
    mostrarToast('error', 'Sin productos', 'Debe agregar al menos un producto');
    return;
  }

  const detalles: any[] = [];
  let valid = true;
  lineas.forEach(linea => {
    const selectProd = linea.querySelector('.producto-select') as HTMLSelectElement;
    const idProducto = selectProd?.value || (linea.querySelector('.producto-id-hidden') as HTMLInputElement)?.value;
    const cantidad = parseInt((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
    const precioUnitario = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');

    if (!idProducto) valid = false;

    detalles.push({
      id_producto: Number(idProducto),
      cantidad,
      precio_unitario: precioUnitario,
    });
  });

  if (!valid) {
    mostrarToast('error', 'Error', 'Todos los productos deben tener un producto asignado');
    return;
  }

  const payload: any = {
    id_cotizacion: Number(idCotizacion),
    fecha_envio: fechaEnvio,
    emitido_por: Number(emitidoPor),
    incluye_igv: incluyeIgv,
    detalles,
  };

  try {
    let nuevaOrdenId: number | null = null;
    if (editId) {
      await ordenProductoService.update(Number(editId), payload);
      mostrarToast('success', 'Orden Actualizada', 'La orden de producto se actualizo correctamente');
    } else {
      const res = await ordenProductoService.create(payload);
      const created = (res as any)?.data?.data || (res as any)?.data || res;
      nuevaOrdenId = created?.id || null;
      mostrarToast('success', 'Orden Creada', 'La orden de producto se creo correctamente');
    }
    (document.getElementById('modal-op') as HTMLElement).style.display = 'none';
    await Promise.all([cargarOrdenesProducto(), cargarEstadisticasOP()]);
    // Descargar PDF automaticamente al crear nueva orden
    if (nuevaOrdenId) {
      try {
        await ordenProductoService.downloadPDF(nuevaOrdenId);
      } catch (e) {
        console.error('Error descargando PDF:', e);
      }
    }
  } catch (e: any) {
    console.error('Error guardando OP:', e);
    const msg = e?.data?.message || e?.message || 'No se pudo guardar la orden';
    mostrarToast('error', 'Error', msg);
  }
}



// =============================
// INIT EVENTS
// =============================
export function initOrdenesProductoEvents() {
  // Boton nueva OP
  document.getElementById('btn-nueva-op')?.addEventListener('click', abrirModalNuevaOP);

  // Filtrar
  document.getElementById('op-btn-filtrar')?.addEventListener('click', cargarOrdenesProducto);

  // Search con debounce
  const searchInput = document.getElementById('op-search') as HTMLInputElement;
  if (searchInput) {
    let timeout: any;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(cargarOrdenesProducto, 400);
    });
  }

  // Modal OP cerrar/cancelar
  const modal = document.getElementById('modal-op') as HTMLElement;
  document.getElementById('modal-op-cerrar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
  document.getElementById('modal-op-cancelar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });

  // Guardar
  document.getElementById('modal-op-guardar')?.addEventListener('click', guardarOP);

  // Cotizacion change -> auto-fill
  document.getElementById('op-cotizacion-ref')?.addEventListener('change', async () => {
    const val = (document.getElementById('op-cotizacion-ref') as HTMLSelectElement).value;
    if (val) {
      await cargarDatosCotizacion(Number(val));
    } else {
      (document.getElementById('op-cliente-nombre') as HTMLInputElement).value = '';
      (document.getElementById('op-cliente-id') as HTMLInputElement).value = '';
      (document.getElementById('op-cliente-ruc') as HTMLInputElement).value = '';
      (document.getElementById('op-cotizacion-info') as HTMLElement).style.display = 'none';
      (document.getElementById('op-detalle-body') as HTMLElement).innerHTML = '';
      calcularTotalCosto();
    }
  });

  // IGV change -> recalcular
  document.getElementById('op-igv')?.addEventListener('change', (e) => {
    incluyeIgv = (e.target as HTMLSelectElement).value === '1';
    const igvRow = document.getElementById('op-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';
    calcularTotalCosto();
  });

  // Agregar linea producto manual
  document.getElementById('btn-agregar-linea-producto')?.addEventListener('click', agregarLineaVacia);

  // Cargar datos iniciales
  cargarEstadisticasOP();
  cargarOrdenesProducto();
}
