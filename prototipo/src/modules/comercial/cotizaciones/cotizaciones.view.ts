// Comercial - Cotizaciones (Conectado al Backend)
import { cotizacionService } from '../../../services/cotizacionService';
import { clienteService } from '../../../services/clienteService';
import { productoService } from '../../../services/productoService';
import { servicioService } from '../../../services/servicioService';
import { catalogoCapAudService } from '../../../services/catalogoCapAudService';
import { mostrarToast } from '../../../shared/toast';
import type { Cotizacion, EstadisticasCotizaciones } from '../../../core/api/types';

// --- INICIO DE CARGA DE QUILL ---
if (typeof window !== 'undefined' && !document.getElementById('quill-assets')) {
    const link = document.createElement('link');
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    link.rel = 'stylesheet';
    link.id = 'quill-assets';
    const script = document.createElement('script');
    script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
    document.head.appendChild(link);
    document.head.appendChild(script);
}

let quillInstance: any = null; // Usaremos esta variable para manejar el editor
// --- FIN DE CARGA DE QUILL ---

//  STATE 
let cotizacionesData: Cotizacion[] = [];
let estadisticasData: EstadisticasCotizaciones | null = null;
let filtros = { search: '', tipo: '' };
let contadorLineas = 0;
let incluyeIgv = true;
let plantasClienteData: any[] = [];
let paginaActual = 1;
const itemsPorPagina = 15;

//  RENDER PRINCIPAL 
export function renderComercialCotizaciones(): string {
  return `
    <div class="page-header">
      <h1>Órdenes de Cotización</h1>
      <div class="header-actions">
        <button class="btn-primary" id="btn-nueva-cotizacion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Cotización
        </button>
      </div>
    </div>

    <!-- Lista de cotizaciones -->
    <div id="lista-cotizaciones">
      <div class="stats-row" style="margin-bottom: 24px;" id="cotizaciones-stats">
        <div class="stat-box">
          <div class="stat-box-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">TOTAL COTIZACIONES</div>
            <div class="stat-box-value" id="stat-total">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">PENDIENTES</div>
            <div class="stat-box-value" id="stat-pendientes">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">ACEPTADAS</div>
            <div class="stat-box-value" id="stat-aceptadas">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon red"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">RECHAZADAS</div>
            <div class="stat-box-value" id="stat-rechazadas">0</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="op-filters-bar">
        <div class="op-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input type="text" placeholder="Buscar cotización o cliente..." class="op-search-input" id="cotiz-search">
        </div>
        <div class="op-filter-group">
          <select class="op-filter-select" id="cotiz-filter-tipo">
            <option value="">Todos los tipos</option>
            <option value="Servicio">Servicio</option>
            <option value="Producto">Producto</option>
            <option value="Capacitacion">Capacitación</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° COTIZACIÓN</th>
              <th>CLIENTE</th>
              <th>FECHA EMISIÓN</th>
              <th>TIPO</th>
              <th>IGV</th>
              <th>TOTAL</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody id="cotizaciones-tbody">
            <tr><td colspan="7" style="text-align:center;padding:40px;color:#64748b;">Cargando cotizaciones...</td></tr>
          </tbody>
        </table>
      </div>

      <div id="cotizaciones-pagination" class="pagination">
        <span class="pagination-info"></span>
        <div class="pagination-controls" id="cotiz-pagination-controls" style="display:flex;gap:8px;align-items:center;">
          <!-- Se llenará dinámicamente -->
        </div>
      </div>
    </div>

    <!-- Formulario de nueva cotización (oculto) -->
    <div id="formulario-cotizacion" style="display: none;"></div>
  `;
}

//  CARGAR DATOS 
async function cargarEstadisticas() {
  try {
    const response = await cotizacionService.getEstadisticas();
    estadisticasData = response.data || response;
    renderizarEstadisticas();
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

function renderizarEstadisticas() {
  if (!estadisticasData) return;
  const s = estadisticasData;
  const el = (id: string, val: any) => { const e = document.getElementById(id); if (e) e.textContent = String(val); };
  el('stat-total', s.total);
  el('stat-pendientes', s.pendientes);
  el('stat-aceptadas', s.aceptadas);
  el('stat-rechazadas', s.rechazadas);
}

async function cargarCotizaciones() {
  try {
    const params: any = { estado: 'Aceptada' };
    if (filtros.search) params.search = filtros.search;
    if (filtros.tipo) params.tipo = filtros.tipo;

    const response = await cotizacionService.getAll(params);
    const data = response.data || response;
    cotizacionesData = Array.isArray(data) ? data : (data as any).data || [];
    paginaActual = 1; // Resetear a primera página al cargar nuevos datos
    renderizarTabla();
  } catch (error) {
    console.error('Error cargando cotizaciones:', error);
    const tbody = document.getElementById('cotizaciones-tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar cotizaciones</td></tr>';
  }
}

function renderizarTabla() {
  const tbody = document.getElementById('cotizaciones-tbody');
  if (!tbody) return;

  if (cotizacionesData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#64748b;">No se encontraron cotizaciones</td></tr>';
    renderizarPaginacion();
    return;
  }

  // Calcular índices para paginación
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const cotizacionesPagina = cotizacionesData.slice(inicio, fin);

  tbody.innerHTML = cotizacionesPagina.map(cot => {
    const numero = cot.numero || cot.numero_cotizacion || '—';
    const cliente = cot.cliente_nombre || (cot.cliente as any)?.nombre_empresa || '—';
    const fecha = cot.fecha_emision ? new Date(cot.fecha_emision).toLocaleDateString('es-PE') : '—';
    const tipo = cot.tipo || cot.tipo_cotizacion || '—';
    const total = typeof cot.total === 'number' ? `S/ ${cot.total.toFixed(2)}` : '—';
    const tieneIgv = cot.incluye_igv !== false;

    const tipoBadge: Record<string, string> = {
      'Servicio': 'badge-blue',
      'Producto': 'badge-purple',
      'Capacitacion': 'badge-orange'
    };

    return `
      <tr>
        <td><strong>${numero}</strong></td>
        <td>${cliente}</td>
        <td>${fecha}</td>
        <td><span class="badge ${tipoBadge[tipo] || 'badge-blue'}">${tipo}</span></td>
        <td>${tieneIgv ? '<span style="color:#16a34a;font-weight:600;">Sí</span>' : '<span style="color:#94a3b8;">No</span>'}</td>
        <td><strong>${total}</strong></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-icon edit" data-action="pdf-cotiz" data-id="${cot.id}" title="Descargar PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderizarPaginacion();
}

function renderizarPaginacion() {
  const totalPaginas = Math.ceil(cotizacionesData.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina + 1;
  const fin = Math.min(inicio + itemsPorPagina - 1, cotizacionesData.length);

  // Info de paginación
  const pag = document.querySelector('#cotizaciones-pagination .pagination-info');
  if (pag) {
    pag.textContent = cotizacionesData.length > 0 
      ? `Mostrando ${inicio}-${fin} de ${cotizacionesData.length} cotizaciones`
      : 'No hay cotizaciones';
  }

  // Controles de paginación
  const controls = document.getElementById('cotiz-pagination-controls');
  if (!controls) return;

  if (totalPaginas <= 1) {
    controls.innerHTML = '';
    return;
  }

  let html = `
    <button class="pagination-btn" id="cotiz-pag-prev" ${paginaActual === 1 ? 'disabled' : ''} style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
  `;

  // Números de página
  const rango = 2; // Cuántas páginas mostrar a cada lado de la actual
  let inicio_pag = Math.max(1, paginaActual - rango);
  let fin_pag = Math.min(totalPaginas, paginaActual + rango);

  if (inicio_pag > 1) {
    html += `<button class="pagination-btn" data-page="1" style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">1</button>`;
    if (inicio_pag > 2) html += `<span style="padding:0 4px;color:#94a3b8;">...</span>`;
  }

  for (let i = inicio_pag; i <= fin_pag; i++) {
    const activo = i === paginaActual;
    html += `<button class="pagination-btn" data-page="${i}" style="padding:6px 12px;border:1px solid ${activo ? '#3b82f6' : '#e2e8f0'};background:${activo ? '#3b82f6' : '#fff'};color:${activo ? '#fff' : '#1e293b'};border-radius:6px;cursor:pointer;font-weight:${activo ? '600' : '400'};">${i}</button>`;
  }

  if (fin_pag < totalPaginas) {
    if (fin_pag < totalPaginas - 1) html += `<span style="padding:0 4px;color:#94a3b8;">...</span>`;
    html += `<button class="pagination-btn" data-page="${totalPaginas}" style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">${totalPaginas}</button>`;
  }

  html += `
    <button class="pagination-btn" id="cotiz-pag-next" ${paginaActual === totalPaginas ? 'disabled' : ''} style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;

  controls.innerHTML = html;

  // Event listeners
  document.getElementById('cotiz-pag-prev')?.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderizarTabla();
    }
  });

  document.getElementById('cotiz-pag-next')?.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderizarTabla();
    }
  });

  controls.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt((e.target as HTMLElement).dataset.page || '1');
      paginaActual = page;
      renderizarTabla();
    });
  });
}

//  FORMULARIO NUEVA COTIZACIÓN 
async function abrirFormularioCotizacion() {
  const lista = document.getElementById('lista-cotizaciones');
  const formulario = document.getElementById('formulario-cotizacion');
  if (!lista || !formulario) return;

  // Cargar clientes aceptados y servicios/productos
  let clientesOptions = '';
  let clientesDivs = '';
  let serviciosData: any[] = [];
  let productosData: any[] = [];
  let catalogoCapAudData: any[] = [];
  let numeroCotizacion = estadisticasData ? (estadisticasData as any).siguiente_numero || '' : '';

  try {
    const [clientesRes, serviciosRes, productosRes, catalogoRes] = await Promise.all([
      clienteService.getAll({ estado: 'Acepta' } as any),
      servicioService.getAll({ estado: 'activo', per_page: 100 }),
      productoService.getAll({ estado: 'Activo', per_page: 100 } as any),
      catalogoCapAudService.getAll({ estado: 'activo' })
    ]);

    const clientes = Array.isArray(clientesRes.data) ? clientesRes.data : (clientesRes as any).data || [];
    clientes.forEach((c: any) => {
      clientesOptions += `<option value="${c.id}">${c.nombre_empresa} - ${c.ruc}</option>`;
      clientesDivs += `<div class="cliente-option" data-value="${c.id}">${c.nombre_empresa} - ${c.ruc}</div>`;
    });

    serviciosData = Array.isArray(serviciosRes.data) ? serviciosRes.data : [];
    productosData = Array.isArray(productosRes.data) ? productosRes.data : [];
    catalogoCapAudData = Array.isArray(catalogoRes.data) ? catalogoRes.data : [];

    // Si no se tenía el número, obtenerlo de estadísticas
    if (!numeroCotizacion) {
      const statsRes = await cotizacionService.getEstadisticas();
      const stats = statsRes.data || statsRes;
      numeroCotizacion = (stats as any).siguiente_numero || '';
    }
  } catch (error) {
    console.error('Error cargando datos para formulario:', error);
  }

  // Guardar en window para acceso desde las líneas
  (window as any).__serviciosData = serviciosData;
  (window as any).__productosData = productosData;
  (window as any).__catalogoCapAudData = catalogoCapAudData;

  const hoy = new Date().toISOString().split('T')[0];
  incluyeIgv = true;
  contadorLineas = 0;

  formulario.innerHTML = `
    <div class="page-header">
      <h1>
        <button class="btn-back" id="btn-volver-lista" style="background:none;border:none;cursor:pointer;margin-right:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        Nueva Orden de Cotización
      </h1>
    </div>

    <div class="form-card" style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <form id="form-cotizacion">
        <div class="form-section" style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">Información General</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">N° Cotización</label>
              <input type="text" class="form-control" value="${numeroCotizacion || 'Generando...'}" readonly style="background: #f1f5f9; color: #1e293b; font-weight: 600; width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
            </div>
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Fecha de Emisión</label>
              <input type="date" id="cot-fecha" class="form-control" value="${hoy}" readonly style="background: #f1f5f9; width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
            </div>
            <div class="form-group" style="position:relative;">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Cliente </label>
              <input type="hidden" id="cot-cliente" value="" />
              <div id="cliente-combo" style="position:relative;">
                <input type="text" id="cot-cliente-search" class="form-control" placeholder="Buscar cliente por nombre o RUC..." autocomplete="off"
                  style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; padding-right:36px;" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
                <div id="cliente-dropdown" style="display:none;position:absolute;z-index:999;top:100%;left:0;right:0;max-height:220px;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                  ${clientesDivs}
                </div>
              </div>
            </div>
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Tipo de Cotización </label>
              <select id="cot-tipo" class="form-control" required style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
                <option value="">Seleccione tipo...</option>
                <option value="Servicio">Servicio</option>
                <option value="Producto">Producto</option>
                <option value="Capacitacion">Capacitación</option>
              </select>
            </div>
            <div style="grid-column: span 1; display: flex; gap: 12px;">
              <div style="flex: 1;">
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">¿Incluye IGV?</label>
                  <select id="cot-igv" class="form-control" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
                    <option value="1" selected>Sí (18%)</option>
                    <option value="0">No IGV</option>
                  </select>
              </div>
              <div style="flex: 1;">
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Condiciones de Pago</label>
                  <select id="cot-multicim" class="form-control" required style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
                    <option value="">Seleccione...</option>
                    <option value="1">CIM</option>
                    <option value="2">MULTI</option>
                  </select>
              </div>
            </div>
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Observaciones</label>
              <input type="text" id="cot-observaciones" class="form-control" placeholder="Observaciones adicionales..." style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
            </div>
          </div>
        </div>

        <div class="propuesta-tecnica-container" style="margin-bottom: 25px; background: #fff; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Propuesta Técnica (Objetivos y Actividades)</h3>
                <button type="button" id="btn-toggle-propuesta" style="font-size: 12px; padding: 5px 10px; cursor: pointer; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px;">
                    Mostrar/Ocultar Editor
                </button>
            </div>

            <div id="editor-wrapper" style="display: none;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Use el editor para dar formato a los objetivos y actividades tal cual aparecerán en el PDF.</p>
                <div id="editor-propuesta" style="height: 300px; background: #fff;"></div>
            </div>
        </div>

        <div class="form-section" style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Detalle de Cotización</h3>
            <button type="button" class="btn-secondary" id="btn-agregar-linea" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:#475569;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Agregar Línea
            </button>
          </div>
          <div class="table-container">
            <table class="data-table" id="tabla-detalle-cotizacion">
              <thead>
                <tr>
                  <th style="width: 20%;">Servicio/Producto</th>
                  <th style="width: 14%;">Planta</th>
                  <th style="width: 14%;">Área</th>
                  <th style="width: 8%;">Cantidad</th>
                  <th style="width: 11%;">Precio Unit.</th>
                  <th style="width: 11%;">Frecuencia</th>
                  <th style="width: 10%;">Modalidad</th>
                  <th style="width: 9%;">Subtotal</th>
                  <th style="width: 3%;"></th>
                </tr>
              </thead>
              <tbody id="detalle-cotizacion-body"></tbody>
            </table>
          </div>
        </div>

        <div class="form-section" style="margin-bottom: 24px;">
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; width: 280px;">
              <span style="font-size: 14px; color: #64748b;">Subtotal:</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b;" id="subtotal-value">S/ 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; width: 280px;" id="igv-row">
              <span style="font-size: 14px; color: #64748b;">IGV (18%):</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b;" id="igv-value">S/ 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; width: 280px; padding-top: 8px; border-top: 2px solid #cbd5e1;">
              <span style="font-size: 16px; font-weight: 700; color: #1e293b;">Total:</span>
              <span style="font-size: 16px; font-weight: 700; color: #16a34a;" id="total-value">S/ 0.00</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <button type="button" class="btn-secondary" id="btn-cancelar-cotiz" style="padding:10px 24px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
          <button type="submit" class="btn-primary" id="btn-guardar-cotiz" style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Guardar Cotización
          </button>
        </div>
      </form>
    </div>
  `;

  lista.style.display = 'none';
  formulario.style.display = 'block';

  // --- CONFIGURACIÓN DEL EDITOR (PEGA AQUÍ) ---
  setTimeout(() => {
    const container = document.getElementById('editor-propuesta');
    if (container && (window as any).Quill) {
      quillInstance = new (window as any).Quill('#editor-propuesta', {
        theme: 'snow',
        placeholder: 'Escriba objetivos, actividades y temario aquí...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['clean']
          ]
        }
      });
    }

    const multicimSelect = document.getElementById('cot-multicim');
    multicimSelect?.addEventListener('change', (e) => {
        const val = (e.target as HTMLSelectElement).value;
        const label = val === '1' ? 'CIM' : 'MULTITASKING';
        if(val) mostrarToast('success', 'Empresa Seleccionada', `Esta cotización se emitirá a nombre de ${label}`);
    });
    const btnToggle = document.getElementById('btn-toggle-propuesta');
    const wrapper = document.getElementById('editor-wrapper');
    if (btnToggle && wrapper) {
      btnToggle.onclick = () => {
        const isHidden = wrapper.style.display === 'none';
        wrapper.style.display = isHidden ? 'block' : 'none';
        btnToggle.textContent = isHidden ? 'Ocultar Editor' : 'Mostrar/Ocultar Editor';
      };
    }
  }, 150); // El pequeño delay asegura que el HTML ya exista en el DOM
  // --- FIN CONFIGURACIÓN EDITOR ---

  // Eventos del formulario
  document.getElementById('btn-volver-lista')?.addEventListener('click', cerrarFormulario);
  document.getElementById('btn-cancelar-cotiz')?.addEventListener('click', cerrarFormulario);

  document.getElementById('cot-igv')?.addEventListener('change', (e) => {
    incluyeIgv = (e.target as HTMLSelectElement).value === '1';
    const igvRow = document.getElementById('igv-row');
    if (igvRow) {
      igvRow.style.display = incluyeIgv ? 'flex' : 'none';
    }
    calcularTotales();
  });

  // ===== Inicializar combobox buscable de clientes =====
  const clienteSearchInput = document.getElementById('cot-cliente-search') as HTMLInputElement;
  const clienteDropdown = document.getElementById('cliente-dropdown');
  const clienteHidden = document.getElementById('cot-cliente') as HTMLInputElement;

  if (clienteSearchInput && clienteDropdown) {
    // Mostrar dropdown al enfocar
    clienteSearchInput.addEventListener('focus', () => {
      clienteDropdown.style.display = 'block';
      filtrarClientes();
    });

    // Filtrar al escribir
    clienteSearchInput.addEventListener('input', () => {
      filtrarClientes();
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      const combo = document.getElementById('cliente-combo');
      if (combo && !combo.contains(e.target as Node)) {
        clienteDropdown.style.display = 'none';
      }
    });

    function filtrarClientes() {
      const term = clienteSearchInput.value.toLowerCase();
      const opciones = clienteDropdown.querySelectorAll('.cliente-option');
      let visible = 0;
      opciones.forEach((opt: any) => {
        const texto = opt.textContent.toLowerCase();
        if (texto.includes(term)) {
          opt.style.display = 'block';
          visible++;
        } else {
          opt.style.display = 'none';
        }
      });
      // Mostrar mensaje si no hay resultados
      let noResult = clienteDropdown.querySelector('.no-result');
      if (visible === 0) {
        if (!noResult) {
          clienteDropdown.insertAdjacentHTML('beforeend', '<div class="no-result" style="padding:10px 12px;color:#94a3b8;font-size:13px;text-align:center;">No se encontraron clientes</div>');
        }
      } else if (noResult) {
        noResult.remove();
      }
    }

    // Delegación de eventos para seleccionar cliente
    clienteDropdown.addEventListener('click', (e) => {
      const opt = (e.target as HTMLElement).closest('.cliente-option') as HTMLElement;
      if (opt) {
        const val = opt.dataset.value || '';
        const text = opt.textContent?.trim() || '';
        clienteHidden.value = val;
        clienteSearchInput.value = text;
        clienteDropdown.style.display = 'none';
        // Cargar plantas del cliente seleccionado
        cargarPlantasCliente(parseInt(val));
      }
    });

    // Estilo hover para opciones (inyectado una vez)
    if (!document.getElementById('cliente-combo-styles')) {
      const style = document.createElement('style');
      style.id = 'cliente-combo-styles';
      style.textContent = `.cliente-option{padding:10px 12px;cursor:pointer;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9;transition:background .15s}.cliente-option:hover{background:#f0f7ff;color:#2563eb}.cliente-option:last-child{border-bottom:none}`;
      document.head.appendChild(style);
    }
  }

  document.getElementById('cot-tipo')?.addEventListener('change', () => {
    const tbody = document.getElementById('detalle-cotizacion-body');
    if (tbody) tbody.innerHTML = '';
    contadorLineas = 0;
    calcularTotales();
  });

  document.getElementById('btn-agregar-linea')?.addEventListener('click', () => agregarLineaDetalle());



  const form = document.getElementById('form-cotizacion') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarCotizacion();
  });
}

function cerrarFormulario() {
  const lista = document.getElementById('lista-cotizaciones');
  const formulario = document.getElementById('formulario-cotizacion');
  if (lista) lista.style.display = 'block';
  if (formulario) { formulario.style.display = 'none'; formulario.innerHTML = ''; }
}

async function cargarPlantasCliente(idCliente: number) {
  try {
    const resp = await clienteService.getPlantas(idCliente);
    plantasClienteData = resp.success ? (resp.data || []) : [];
  } catch { plantasClienteData = []; }
  // Actualizar selects de planta en filas existentes
  document.querySelectorAll('#detalle-cotizacion-body .planta-input').forEach(sel => {
    const select = sel as HTMLSelectElement;
    select.innerHTML = getPlantaOptions();
    select.value = '';
  });
  document.querySelectorAll('#detalle-cotizacion-body .area-input').forEach(sel => {
    (sel as HTMLSelectElement).innerHTML = '<option value="">— Sin área —</option>';
  });
}

function getPlantaOptions(): string {
  return '<option value="">— Sin planta —</option>' + plantasClienteData
    .filter((p: any) => p.estado === 'Activo')
    .map((p: any) => `<option value="${p.id}">${p.nombre}</option>`).join('');
}

function getAreaOptions(idPlanta: number): string {
  const planta = plantasClienteData.find((p: any) => p.id === idPlanta);
  const areas = (planta?.areas_activas || planta?.areas || []).filter((a: any) => a.estado === 'Activo');
  return '<option value="">— Sin área —</option>' + areas
    .map((a: any) => `<option value="${a.id}">${a.nombre}</option>`).join('');
}

function agregarLineaDetalle() {
  const tbody = document.getElementById('detalle-cotizacion-body');
  const tipoSelect = document.getElementById('cot-tipo') as HTMLSelectElement;
  const tipo = tipoSelect?.value;

  if (!tipo) {
    mostrarToast('warning', 'Atención', 'Seleccione el tipo de cotización primero');
    return;
  }

  contadorLineas++;
  const lineaId = `linea-${contadorLineas}`;

  const servicios = (window as any).__serviciosData || [];
  const productos = (window as any).__productosData || [];
  const catalogoCapAud = (window as any).__catalogoCapAudData || [];

  let opcionesItem = '<option value="">Seleccione...</option>';
  if (tipo === 'Servicio') {
    servicios.forEach((s: any) => {
      const desc = (s.descripcion || '').replace(/"/g, '&quot;');
      opcionesItem += `<option value="s-${s.id}" data-descripcion="${desc}">${s.nombre}</option>`;
    });
  } else if (tipo === 'Capacitacion') {
    catalogoCapAud.forEach((c: any) => {
      const desc = (c.descripcion || '').replace(/"/g, '&quot;');
      const precio = c.precio_referencial || 0;
      const duracion = c.duracion_horas ? ` (${c.duracion_horas}hrs)` : '';
      opcionesItem += `<option value="c-${c.id}" data-descripcion="${desc}" data-precio="${precio}">[${c.tipo}] ${c.nombre}${duracion}</option>`;
    });
  } else if (tipo === 'Producto') {
    productos.forEach((p: any) => {
      const nombre = p.descripcion || 'Producto';
      const precio = p.precio_unitario || 0;
      opcionesItem += `<option value="p-${p.id}" data-precio="${precio}">${nombre}</option>`;
    });
  }

  const inputStyle = 'width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;';
  const selectStyle = inputStyle;
  const esProducto = tipo === 'Producto';
  const esServicio = tipo === 'Servicio';
  // Frecuencia: se bloquea solo en Producto
  const disabledFrecuencia = esProducto ? 'disabled' : '';
  const disabledFrecuenciaStyle = esProducto ? 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;' : '';
  // Modalidad: se bloquea en Producto y en Servicio (solo aplica para Capacitación)
  const disabledModalidad = (esProducto || esServicio) ? 'disabled' : '';
  const disabledModalidadStyle = (esProducto || esServicio) ? 'background:#f1f5f9;color:#94a3b8;cursor:not-allowed;' : '';

  const nuevaLinea = `
    <tr id="${lineaId}">
      <td>
        <select class="item-select" style="${selectStyle}" required>
          ${opcionesItem}
        </select>
      </td>
      <td>
        <select class="planta-input" style="${selectStyle}">
          ${getPlantaOptions()}
        </select>
      </td>
      <td>
        <select class="area-input" style="${selectStyle}">
          <option value="">— Sin área —</option>
        </select>
      </td>
      <td>
        <input type="number" class="cantidad-input" value="1" min="1" style="${inputStyle}">
      </td>
      <td>
        <input type="number" class="precio-input" value="0.00" min="0" step="0.01" style="${inputStyle}">
      </td>
      <td>
        <select class="frecuencia-input" style="${selectStyle}${disabledFrecuenciaStyle}" ${disabledFrecuencia}>
          <option value="">—</option>
          <option value="Única">Única</option>
          <option value="Días de la semana">Días de la semana</option>
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
          <option value="Trimestral">Trimestral</option>
          <option value="Semestral">Semestral</option>
          <option value="Anual">Anual</option>
        </select>
      </td>
      <td>
        <select class="modalidad-input" style="${selectStyle}${disabledModalidadStyle}" ${disabledModalidad}>
          <option value="">—</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
          <option value="Hibrido">Híbrido</option>
        </select>
      </td>
      <td>
        <strong class="subtotal-linea" style="font-size:13px;">S/ 0.00</strong>
      </td>
      <td>
        <button type="button" class="btn-eliminar-linea" data-linea="${lineaId}" title="Eliminar" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    </tr>
  `;

  if (tbody) {
    tbody.insertAdjacentHTML('beforeend', nuevaLinea);

    const fila = document.getElementById(lineaId)!;

    // Auto-llenar precio al seleccionar item
    const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement;
    itemSelect?.addEventListener('change', () => {
      const opt = itemSelect.options[itemSelect.selectedIndex];
      const precio = opt?.dataset?.precio;
      if (precio) {
        const precioInput = fila.querySelector('.precio-input') as HTMLInputElement;
        if (precioInput) precioInput.value = precio;
      }
      calcularSubtotalLinea(lineaId);
    });

    // Cascading: planta → áreas dentro de la fila
    const plantaSelect = fila.querySelector('.planta-input') as HTMLSelectElement;
    plantaSelect?.addEventListener('change', () => {
      const areaSelect = fila.querySelector('.area-input') as HTMLSelectElement;
      const pid = parseInt(plantaSelect.value || '0');
      if (areaSelect) areaSelect.innerHTML = pid ? getAreaOptions(pid) : '<option value="">— Sin área —</option>';
    });

    fila.querySelector('.cantidad-input')?.addEventListener('input', () => calcularSubtotalLinea(lineaId));
    fila.querySelector('.precio-input')?.addEventListener('input', () => calcularSubtotalLinea(lineaId));
    fila.querySelector('.btn-eliminar-linea')?.addEventListener('click', () => {
      fila.remove();
      calcularTotales();
    });
  }
}

function calcularSubtotalLinea(lineaId: string) {
  const linea = document.getElementById(lineaId);
  if (!linea) return;
  const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
  const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
  const subtotal = cantidad * precio;
  const el = linea.querySelector('.subtotal-linea');
  if (el) el.textContent = `S/ ${subtotal.toFixed(2)}`;
  calcularTotales();
}

function calcularTotales() {
  const lineas = document.querySelectorAll('#detalle-cotizacion-body tr');
  let subtotalGeneral = 0;

  lineas.forEach(linea => {
    const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    subtotalGeneral += cantidad * precio;
  });

  const igv = incluyeIgv ? subtotalGeneral * 0.18 : 0;
  const total = subtotalGeneral + igv;

  const subtotalEl = document.getElementById('subtotal-value');
  const igvEl = document.getElementById('igv-value');
  const totalEl = document.getElementById('total-value');

  if (subtotalEl) subtotalEl.textContent = `S/ ${subtotalGeneral.toFixed(2)}`;
  if (igvEl) igvEl.textContent = `S/ ${igv.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

async function guardarCotizacion() {
  const multicimId = parseInt((document.getElementById('cot-multicim') as HTMLSelectElement)?.value || '0');
  const clienteId = parseInt((document.getElementById('cot-cliente') as HTMLInputElement)?.value || '0');
  const tipoCotizacion = (document.getElementById('cot-tipo') as HTMLSelectElement)?.value;
  const observaciones = (document.getElementById('cot-observaciones') as HTMLInputElement)?.value?.trim();  
  const propuestaHtml = quillInstance ? quillInstance.root.innerHTML : '';

  if (!multicimId || !clienteId || !tipoCotizacion) {
    mostrarToast('warning', 'Campos obligatorios', 'Seleccione la empresa emisora, el cliente y el tipo de cotización');
    return;
  }

  if (!clienteId || !tipoCotizacion) {
    mostrarToast('warning', 'Campos obligatorios', 'Seleccione cliente y tipo de cotización');
    return;
  }

  const lineas = document.querySelectorAll('#detalle-cotizacion-body tr');
  if (lineas.length === 0) {
    mostrarToast('warning', 'Sin detalles', 'Agregue al menos una línea de detalle');
    return;
  }

  const detalles: any[] = [];
  lineas.forEach(linea => {
    const itemSelect = linea.querySelector('.item-select') as HTMLSelectElement;
    const itemValue = itemSelect?.value || '';
    const cantidad = parseInt((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '1');
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    const frecuencia = (linea.querySelector('.frecuencia-input') as HTMLSelectElement)?.value || null;
    const modalidad = (linea.querySelector('.modalidad-input') as HTMLSelectElement)?.value || null;
    const plantaVal = parseInt((linea.querySelector('.planta-input') as HTMLSelectElement)?.value || '0') || null;
    const areaVal = parseInt((linea.querySelector('.area-input') as HTMLSelectElement)?.value || '0') || null;

    let id_servicio: number | null = null;
    let id_producto: number | null = null;
    let id_catalogo_cap_aud: number | null = null;

    if (itemValue.startsWith('s-')) {
      id_servicio = parseInt(itemValue.replace('s-', ''));
    } else if (itemValue.startsWith('p-')) {
      id_producto = parseInt(itemValue.replace('p-', ''));
    } else if (itemValue.startsWith('c-')) {
      id_catalogo_cap_aud = parseInt(itemValue.replace('c-', ''));
    }

    detalles.push({
      id_servicio,
      id_producto,
      id_catalogo_cap_aud,
      cantidad,
      precio_unitario: precio,
      frecuencia_sugerida: frecuencia,
      modalidad_sugerida: modalidad,
      id_cliente_planta: plantaVal,
      id_cliente_planta_area: areaVal,
    });
  });

  const data = {
    id_multicim: multicimId,
    id_cliente: clienteId,
    tipo_cotizacion: tipoCotizacion,
    incluye_igv: incluyeIgv,
    observaciones: observaciones || undefined,
    propuesta_tecnica: propuestaHtml,
    detalles
  };

  const submitBtn = document.getElementById('btn-guardar-cotiz') as HTMLButtonElement;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Guardando...'; }

  try {
    const response = await cotizacionService.create(data);
    if (response.success !== false) {
      mostrarToast('success', 'Cotización creada', 'La cotización fue registrada exitosamente');

      // Generar PDF automáticamente
      const nuevaId = response.data?.id;
      if (nuevaId) {
        mostrarToast('success', 'PDF', 'Generando PDF de la cotización...');
        try {
          await cotizacionService.downloadPDF(nuevaId);
        } catch (e) {
          console.error('Error generando PDF:', e);
        }
      }

      cerrarFormulario();
      await cargarCotizaciones();
      await cargarEstadisticas();
    }
  } catch (error: any) {
    let msg = 'Error al crear la cotización';
    if (error.data?.errors) {
      msg = Object.entries(error.data.errors).map(([f, m]: [string, any]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n');
    } else if (error.data?.message) {
      msg = error.data.message;
    }
    mostrarToast('error', 'Error', msg);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Guardar Cotización`;
    }
  }
}

//  ACCIONES: PDF 
async function descargarPDF(id: number) {
  try {
    mostrarToast('success', 'Descargando', 'Generando PDF...');
    await cotizacionService.downloadPDF(id);
  } catch (error) {
    mostrarToast('error', 'Error', 'No se pudo descargar el PDF');
  }
}

// Toast: usa componente compartido importado arriba

//  INIT EVENTS 
export function initCotizacionesEvents() {
  // Cargar datos iniciales
  cargarEstadisticas();
  cargarCotizaciones();

  // Botón nueva cotización
  document.getElementById('btn-nueva-cotizacion')?.addEventListener('click', () => abrirFormularioCotizacion());

  // Búsqueda con debounce
  let debounce: ReturnType<typeof setTimeout>;
  const searchInput = document.getElementById('cotiz-search') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        filtros.search = searchInput.value.trim();
        cargarCotizaciones();
      }, 400);
    });
  }

  // Filtro de tipo
  document.getElementById('cotiz-filter-tipo')?.addEventListener('change', (e) => {
    filtros.tipo = (e.target as HTMLSelectElement).value;
    cargarCotizaciones();
  });

  // Delegación de clicks en tabla para acciones
  document.getElementById('cotizaciones-tbody')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id || '0');
    if (!id) return;

    switch (action) {
      case 'pdf-cotiz': descargarPDF(id); break;
    }
  });
}
