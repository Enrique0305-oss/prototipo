// Comercial - Cotizaciones (Conectado al Backend)
import { cotizacionService } from '../../../services/cotizacionService';
import { clienteService } from '../../../services/clienteService';
import { productoService } from '../../../services/productoService';
import { servicioService } from '../../../services/servicioService';
import { catalogoCapAudService } from '../../../services/catalogoCapAudService';
import { mostrarToast } from '../../../shared/toast';
import type { Cotizacion, EstadisticasCotizaciones } from '../../../core/api/types';
import { getCotizacionTipoAdapter, TAB_TO_TIPO } from './tipos';

// --- INICIO DE CARGA DE QUILL ---
// Cargamos Quill de forma segura y permitimos inicializarlo cuando el script esté listo.
let quillLoadPromise: Promise<void> | null = null;
function ensureQuillLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).Quill) return Promise.resolve();
  if (quillLoadPromise) return quillLoadPromise;

  quillLoadPromise = new Promise<void>((resolve) => {
    if (document.getElementById('quill-script')) {
      const existingScript = document.getElementById('quill-script') as HTMLScriptElement;
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => resolve());
      return;
    }

    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css';
    link.rel = 'stylesheet';
    link.id = 'quill-assets';

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js';
    script.id = 'quill-script';

    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => resolve());

    document.head.appendChild(link);
    document.head.appendChild(script);
  });

  return quillLoadPromise;
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
let tabActivo = 'historial';
const tabsInicializados: Record<string, boolean> = { servicio: false, producto: false, capacitacion: false };
let quillKeydownController: AbortController | null = null;
let formularioLoadController: AbortController | null = null;  // Para evitar condiciones de carrera

type RecetaServicioRow = {
  id_servicio: number;
  id_equipo: number | null;
  equipo_descripcion: string;
  id_producto: number;
  cantidad: number;
  observacion: string;
  id_cliente_planta: number | null;
  id_cliente_planta_area: number | null;
};

let recetaServicioRows: RecetaServicioRow[] = [];

//  RENDER PRINCIPAL 
export function renderComercialCotizaciones(): string {
  return `
    <div class="page-header">
      <h1>Órdenes de Cotización</h1>
    </div>

    <!-- Navegación por tabs -->
    <div class="cotiz-tabs-nav" style="display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:24px;">
      <button class="cotiz-tab active" data-tab="historial" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid #2563eb;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:600;color:#2563eb;transition:color .15s;">Historial General</button>
      <button class="cotiz-tab" data-tab="servicio" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:color .15s;">Servicio</button>
      <button class="cotiz-tab" data-tab="producto" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:color .15s;">Producto</button>
      <button class="cotiz-tab" data-tab="capacitacion" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:color .15s;">Capacitación</button>
    </div>

    <!-- Panel: Historial General -->
    <div id="cotiz-panel-historial">
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

    <!-- Panel: Servicio -->
    <div id="cotiz-panel-servicio" style="display:none;">
      <div id="cotiz-form-servicio"></div>
    </div>

    <!-- Panel: Producto -->
    <div id="cotiz-panel-producto" style="display:none;">
      <div id="cotiz-form-producto"></div>
    </div>

    <!-- Panel: Capacitación -->
    <div id="cotiz-panel-capacitacion" style="display:none;">
      <div id="cotiz-form-capacitacion"></div>
    </div>
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
async function abrirFormularioCotizacion(tipoFijo?: string) {
  console.log('[FORM] ====== INICIO abrirFormularioCotizacion para tipo:', tipoFijo);
  
  // Verificar si esta carga fue cancelada
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA al inicio para tipo:', tipoFijo);
    return;
  }

  const panelMap: Record<string, string> = {
    Servicio: 'cotiz-form-servicio',
    Producto: 'cotiz-form-producto',
    Capacitacion: 'cotiz-form-capacitacion'
  };
  const panelEl = tipoFijo ? document.getElementById(panelMap[tipoFijo] || '') : null;
  if (!panelEl) return;

  // Destruir instancia de Quill anterior si existe
  if (quillInstance) {
    try {
      quillInstance.disable();
      quillInstance = null;
    } catch (e) {
      console.warn('Error al destruir Quill anterior:', e);
      quillInstance = null;
    }
  }

  // Limpiar event listeners antiguos del Quill
  if (quillKeydownController) {
    try {
      (quillKeydownController as AbortController).abort();
    } catch (e) {
      console.warn('Error al limpiar keydown controller:', e);
    }
    quillKeydownController = null;
  }

  // Remover styles antiguo del cliente combo (para evitar conflictos)
  const oldClienteComboStyles = document.getElementById('cliente-combo-styles');
  if (oldClienteComboStyles) {
    oldClienteComboStyles.remove();
  }

  panelEl.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;font-size:14px;">Cargando formulario...</div>';

  // Cargar clientes aceptados y servicios/productos
  let clientesOptions = '';
  let clientesDivs = '';
  let serviciosData: any[] = [];
  let productosData: any[] = [];
  let catalogoCapAudData: any[] = [];
  let numeroCotizacion = estadisticasData ? (estadisticasData as any).siguiente_numero || '' : '';

  try {
    console.log('[FORM] 📥 Iniciando carga de datos para tipo:', tipoFijo);
    const [clientesRes, serviciosRes, productosRes, catalogoRes] = await Promise.all([
      clienteService.getAll({ estado: 'Acepta' } as any),
      servicioService.getAll({ estado: 'activo', per_page: 100 }),
      productoService.getAll({ estado: 'Activo', per_page: 100 } as any),
      catalogoCapAudService.getAll({ estado: 'activo' })
    ]);

    console.log('[FORM] ✅ Datos cargados - Clientes:', clientesRes.data?.length, 'Servicios:', serviciosRes.data?.length, 'Productos:', productosRes.data?.length);

    const clientes = Array.isArray(clientesRes.data) ? clientesRes.data : (clientesRes as any).data || [];
    console.log('[FORM] 👥 Clientes procesados:', clientes.length);
    
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
    console.error('[FORM] ❌ Error cargando datos:', error);
  }

  // Guardar en window para acceso desde las líneas
  (window as any).__serviciosData = serviciosData;
  (window as any).__productosData = productosData;
  (window as any).__catalogoCapAudData = catalogoCapAudData;

  // Verificar nuevamente si fue cancelada después de cargar datos
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA después de cargar datos para tipo:', tipoFijo);
    return;
  }

  console.log('[FORM] ✅ Pasó validación post-datos, continuando...');

  const hoy = new Date().toISOString().split('T')[0];
  incluyeIgv = true;
  contadorLineas = 0;

  // Sección especial para técnicos/supervisor SOLO para Servicio
  const seccionLimpiezaCisternas = tipoFijo === 'Servicio' ? `
    <div id="seccion-limpieza-cisternas" style="display:none;margin-bottom:24px;padding:16px 20px;background:#f1f5f9;border-radius:8px;">
      <div style="font-weight:600;margin-bottom:10px;color:#2563eb;">Datos de Operarios para LIMPIEZA DE CISTERNAS Y RESERVORIOS</div>
      <div style="display:flex;gap:24px;align-items:center;">
        <div>
          <label for="input-op-tecnicos" style="font-size:13px;font-weight:500;">Operarios Técnicos</label>
          <input type="number" min="0" id="input-op-tecnicos" class="input" style="width:80px;margin-left:8px;" value="0">
        </div>
        <div>
          <label for="input-supervisor" style="font-size:13px;font-weight:500;">Supervisor</label>
          <input type="number" min="0" id="input-supervisor" class="input" style="width:80px;margin-left:8px;" value="0">
        </div>
      </div>
    </div>
  ` : '';

  panelEl.innerHTML = `
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
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Tipo de Cotización</label>
              ${tipoFijo ? `
                <input type="text" class="form-control" value="${tipoFijo === 'Capacitacion' ? 'Capacitacion' : tipoFijo}" readonly style="background:#f1f5f9;color:#1e293b;font-weight:600;width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;cursor:not-allowed;">
                <input type="hidden" id="cot-tipo" value="${tipoFijo}">
              ` : `
                <select id="cot-tipo" class="form-control" required style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
                  <option value="">Seleccione tipo...</option>
                  <option value="Servicio">Servicio</option>
                  <option value="Producto">Producto</option>
                  <option value="Capacitacion">Capacitacion</option>
                </select>
              `}
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
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Propuesta Técnica (Objetivos)</h3>
                <button type="button" id="btn-toggle-propuesta" style="font-size: 12px; padding: 5px 10px; cursor: pointer; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px;">
                    Mostrar/Ocultar Editor
                </button>
            </div>

            <div id="table-controls" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom: 10px;">
              <button type="button" class="btn-secondary" id="btn-insert-table-5x5" style="padding:6px 10px;">Insertar tabla 5×5</button>
              <button type="button" class="btn-secondary" id="btn-add-row" style="padding:6px 10px;">Agregar fila</button>
              <button type="button" class="btn-secondary" id="btn-del-row" style="padding:6px 10px;">Eliminar fila</button>
              <button type="button" class="btn-secondary" id="btn-add-col" style="padding:6px 10px;">Agregar columna</button>
              <button type="button" class="btn-secondary" id="btn-del-col" style="padding:6px 10px;">Eliminar columna</button>
            </div>

            <div id="editor-wrapper" style="display: none;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Use el editor para dar formato a los objetivos y actividades tal cual aparecerán en el PDF.</p>
                <div id="editor-propuesta" style="height: 600px; background: #fff;"></div>
            </div>
        </div>

        <div class="form-section" style="margin-bottom: 24px;">
          ${seccionLimpiezaCisternas}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Detalle de Cotización</h3>
            <button type="button" class="btn-secondary" id="btn-agregar-linea" ${tipoFijo ? '' : 'disabled'} style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:${tipoFijo ? 'pointer' : 'not-allowed'};opacity:${tipoFijo ? '1' : '0.6'};font-size:13px;font-weight:600;color:#475569;">
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
                  ${tipoFijo === 'Capacitacion' ? '<th style="width: 8%;">Horas</th><th style="width: 8%;">Participantes</th><th style="width: 10%;">Fecha Servicio</th>' : ''}
                  <!-- Eliminado: técnicos/supervisor de capacitación -->
                  <th style="width: 9%;">Subtotal</th>
                  <th style="width: 3%;"></th>
                </tr>
              </thead>
              <tbody id="detalle-cotizacion-body"></tbody>
            </table>
          </div>
        </div>

        ${tipoFijo === 'Servicio' ? `
        <div class="form-section" style="margin-bottom: 24px; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;">
            <h3 style="font-size: 15px; font-weight: 700; color: #334155; margin: 0;">Receta de Servicio (Equipos y Productos)</h3>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn-secondary" id="btn-cargar-receta-servicio" style="padding:6px 10px;font-size:12px;">
                Cargar Receta
              </button>
              <button type="button" class="btn-secondary" id="btn-agregar-prod-receta-servicio" style="padding:6px 10px;font-size:12px;">
                Agregar Producto
              </button>
            </div>
          </div>
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Cargue la receta según los servicios seleccionados y ajuste productos según criterio del cliente.</div>
          <div class="table-container" style="max-height:320px;overflow:auto;">
            <table class="data-table" style="min-width: 900px;">
              <thead>
                <tr>
                  <th style="width:26%;">Servicio / Planta / Área / Equipo</th>
                  <th style="width:32%;">Producto</th>
                  <th style="width:10%;text-align:center;">Cantidad</th>
                  <th style="width:24%;">Observación</th>
                  <th style="width:8%;"></th>
                </tr>
              </thead>
              <tbody id="receta-servicio-body"></tbody>
            </table>
          </div>
          <div id="receta-servicio-empty" style="text-align:center;padding:10px;color:#94a3b8;font-size:12px;">Sin productos de receta. Use "Cargar Receta" o "Agregar Producto".</div>
        </div>
        ` : ''}

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

  console.log('[FORM] 🎨 HTML renderizado, inserting en panel...');
  
  // Verificar si fue cancelada antes de renderizar
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA antes de renderizar para tipo:', tipoFijo);
    return;
  }

  console.log('[FORM] � DOM renderizado, inicializando componentes...');

  // Verificar inmediatamente que el elemento cot-tipo existe
  const cotTipoElAfterInsert = panelEl.querySelector('#cot-tipo') as HTMLSelectElement;
  console.log('[FORM] 🔍 Verificando cot-tipo DESPUÉS de insertar HTML - Encontrado:', !!cotTipoElAfterInsert, 'Valor:', cotTipoElAfterInsert?.value, 'Tipo esperado:', tipoFijo);

  // --- CONFIGURACIÓN DEL EDITOR (PEGA AQUÍ) ---
  await ensureQuillLoaded();
  // Aseguramos que el DOM ya haya renderizado el HTML generado.
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  console.log('[FORM] 📋 DOM renderizado, inicializando componentes...');

  // Verificar si fue cancelada después de renderizar
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA después de renderizar para tipo:', tipoFijo);
    return;
  }

  const container = panelEl.querySelector('#editor-propuesta') as HTMLElement;
  if (container && (window as any).Quill) {
    const isCursorInsideTable = () => {
      const sel = document.getSelection();
      if (!sel || !sel.anchorNode) return false;

      let node: Node | null = sel.anchorNode;
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === 'TD') return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    try {
      quillInstance = new (window as any).Quill(container, {
        theme: 'snow',
        placeholder: 'Escriba objetivos, actividades y temario aquí...',
        modules: {
          table: {
            Selection: true,
            operationMenu: {
              items: {
                insertLineBefore: { text: 'Insertar fila antes' },
                insertLineAfter: { text: 'Insertar fila después' },
                insertColumnBefore: { text: 'Insertar columna antes' },
                insertColumnAfter: { text: 'Insertar columna después' },
                deleteLine: { text: 'Eliminar fila' },
                deleteColumn: { text: 'Eliminar columna' },
                unmergeCells: { text: 'Deshacer combinación' }
              },
              color: {
                colors: ['#2563eb', '#ef4444', '#10b981'],
                text: 'Fondo de celda'
              }
            }
          },
          toolbar: [
            [{'header': [1, 2, 3, false]}],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            // La tabla se maneja con los botones personalizados de la UI
            ['clean']
          ],
        }
      });

      const tableModule = quillInstance.getModule('table');
      const runTableAction = (action: () => void) => {
        if (!tableModule) {
          mostrarToast('warning', 'Tablas', 'El módulo de tablas no está disponible');
          return;
        }
        try {
          action();
        } catch (error) {
          console.error('Error en acción de tabla:', error);
        }
      };

      const findParentCell = (node: Node | null): HTMLElement | null => {
        while (node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName === 'TD') return el;
          }
          node = node.parentNode;
        }
        return null;
      };

      const moveSelectionToNextCell = () => {
        const sel = document.getSelection();
        if (!sel || !sel.anchorNode) return;

        const currentCell = findParentCell(sel.anchorNode);
        if (!currentCell) return;
        const currentRow = currentCell.parentElement;
        if (!currentRow) return;

        let nextCell = currentCell.nextElementSibling as HTMLElement | null;
        if (!nextCell) {
          const nextRow = currentRow.nextElementSibling as HTMLElement | null;
          if (!nextRow) return;
          nextCell = nextRow.querySelector('td');
        }
        if (!nextCell) return;

        try {
          const blot = (window as any).Quill.find(nextCell);
          if (!blot) return;
          const index = quillInstance.getIndex(blot);
          quillInstance.setSelection(index, 0, 'silent');
        } catch (e) {
          // Fallback: no hacemos nada
        }
      };

      // Limpiar y crear nuevo AbortController
      if (quillKeydownController) {
        try {
          (quillKeydownController as AbortController).abort();
        } catch (e) {
          console.warn('Error aborting previous controller:', e);
        }
      }
      quillKeydownController = new AbortController();
      document.addEventListener('keydown', (evt: KeyboardEvent) => {
        if (evt.key !== 'Enter') return;
        if (!isCursorInsideTable()) return;

        evt.preventDefault();
        evt.stopImmediatePropagation();

        if (evt.shiftKey) {
          const range = quillInstance.getSelection(true);
          if (!range) return;
          quillInstance.insertText(range.index, '\n', 'user');
          quillInstance.setSelection(range.index + 1, 0, 'silent');
        } else {
        moveSelectionToNextCell();
      }
    }, { capture: true, signal: quillKeydownController.signal });

      panelEl.querySelector('#btn-insert-table-5x5')?.addEventListener('click', () => {
        runTableAction(() => tableModule.insertTable(5, 5));
      });
      panelEl.querySelector('#btn-add-row')?.addEventListener('click', () => {
        runTableAction(() => tableModule.insertRowBelow());
      });
      panelEl.querySelector('#btn-del-row')?.addEventListener('click', () => {
        runTableAction(() => tableModule.deleteRow());
      });
      panelEl.querySelector('#btn-add-col')?.addEventListener('click', () => {
        runTableAction(() => tableModule.insertColumnRight());
      });
      panelEl.querySelector('#btn-del-col')?.addEventListener('click', () => {
        runTableAction(() => tableModule.deleteColumn());
      });
    } catch (error) {
      console.error('Error inicializando Quill:', error);
      // Continuar con el formulario aunque Quill falle
      quillInstance = null;
    }
  }

  const multicimSelect = panelEl.querySelector('#cot-multicim') as HTMLSelectElement;
  console.log('[FORM] 🎯 Multicim select encontrado:', !!multicimSelect, 'tabActivo:', tabActivo);
  multicimSelect?.addEventListener('change', (e) => {
      console.log('[FORM] 📨 Cambio en método de pago - tabActivo:', tabActivo, 'valor:', (e.target as HTMLSelectElement).value);
      const val = (e.target as HTMLSelectElement).value;
      const label = val === '1' ? 'CIM' : 'MULTITASKING';
      if(val) {
        console.log('[FORM] ✅ Mostrando toast para:', label);
        mostrarToast('success', 'Empresa Seleccionada', `Esta cotización se emitirá a nombre de ${label}`);
      }
  });
  const btnToggle = panelEl.querySelector('#btn-toggle-propuesta') as HTMLElement;
  const wrapper = panelEl.querySelector('#editor-wrapper') as HTMLElement;
  if (btnToggle && wrapper) {
    btnToggle.onclick = () => {
      const isHidden = wrapper.style.display === 'none';
      wrapper.style.display = isHidden ? 'block' : 'none';
      btnToggle.textContent = isHidden ? 'Ocultar Editor' : 'Mostrar/Ocultar Editor';
    };
  }
  // --- FIN CONFIGURACIÓN EDITOR ---

  // Eventos del formulario
  panelEl.querySelector('#btn-cancelar-cotiz')?.addEventListener('click', () => {
    if (tipoFijo) {
      abrirFormularioCotizacion(tipoFijo);
    } else {
      cerrarFormulario();
    }
  });

  panelEl.querySelector('#cot-igv')?.addEventListener('change', (e) => {
    incluyeIgv = (e.target as HTMLSelectElement).value === '1';
    const igvRow = panelEl.querySelector('#igv-row') as HTMLElement;
    if (igvRow) {
      igvRow.style.display = incluyeIgv ? 'flex' : 'none';
    }
    calcularTotales();
  });

  // ===== Inicializar combobox buscable de clientes =====
  console.log('[FORM] 🔧 Buscando elementos del cliente combo DENTRO del panel...');
  const clienteSearchInput = panelEl.querySelector('#cot-cliente-search') as HTMLInputElement;
  const clienteDropdown = panelEl.querySelector('#cliente-dropdown') as HTMLElement;
  const clienteHidden = panelEl.querySelector('#cot-cliente') as HTMLInputElement;

  console.log('[FORM] Cliente combo - search input:', !!clienteSearchInput, 'dropdown:', !!clienteDropdown, 'hidden:', !!clienteHidden, 'dentro de panel:', panelEl.id);

  if (clienteSearchInput && clienteDropdown) {
    console.log('[FORM] ✅ Cliente combo encontrado, configurando listeners...');
    const dropdownEl = clienteDropdown;

    // Mostrar dropdown al enfocar
    clienteSearchInput.addEventListener('focus', () => {
      console.log('[FORM] 👁️ Focus en cliente search - tabActivo:', tabActivo);
      dropdownEl.style.display = 'block';
      filtrarClientes();
    });

    // Filtrar al escribir
    clienteSearchInput.addEventListener('input', () => {
      console.log('[FORM] ✏️ Escribiendo en cliente search');
      filtrarClientes();
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      const combo = panelEl.querySelector('#cliente-combo') as HTMLElement;
      if (combo && !combo.contains(e.target as Node)) {
        dropdownEl.style.display = 'none';
      }
    });

    function filtrarClientes() {
      const term = clienteSearchInput.value.toLowerCase();
      const opciones = dropdownEl.querySelectorAll('.cliente-option');
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
      let noResult = dropdownEl.querySelector('.no-result') as HTMLElement | null;
      if (visible === 0) {
        if (!noResult) {
          dropdownEl.insertAdjacentHTML('beforeend', '<div class="no-result" style="padding:10px 12px;color:#94a3b8;font-size:13px;text-align:center;">No se encontraron clientes</div>');
        }
      } else if (noResult) {
        noResult.remove();
      }
    }

    // Delegación de eventos para seleccionar cliente
    dropdownEl.addEventListener('click', (e) => {
      const opt = (e.target as HTMLElement).closest('.cliente-option') as HTMLElement;
      if (opt) {
        const val = opt.dataset.value || '';
        const text = opt.textContent?.trim() || '';
        clienteHidden.value = val;
        clienteSearchInput.value = text;
        dropdownEl.style.display = 'none';
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
  } else {
    console.error('[FORM] ❌ Cliente combo NO encontrado! - search:', !!clienteSearchInput, 'dropdown:', !!clienteDropdown, 'hidden:', !!clienteHidden);
  }

  panelEl.querySelector('#cot-tipo')?.addEventListener('change', () => {
    console.log('[FORM] ⚠️ CHANGE de tipo cotización - Nuevo valor:', (panelEl.querySelector('#cot-tipo') as HTMLSelectElement)?.value);
    const tbody = panelEl.querySelector('#detalle-cotizacion-body') as HTMLElement;
    if (tbody) tbody.innerHTML = '';
    contadorLineas = 0;
    calcularTotales();

    const btnAgregar = document.getElementById('btn-agregar-linea') as HTMLButtonElement;
    const tipo = (document.getElementById('cot-tipo') as HTMLSelectElement)?.value;
    if (btnAgregar) {
      const enabled = Boolean(tipo);
      btnAgregar.disabled = !enabled;
      btnAgregar.style.cursor = enabled ? 'pointer' : 'not-allowed';
      btnAgregar.style.opacity = enabled ? '1' : '0.6';
    }
  });

  panelEl.querySelector('#btn-agregar-linea')?.addEventListener('click', () => {
    console.log('[FORM] 📍 Click en agregar línea - tabActivo:', tabActivo, 'panel:', panelEl.id);
    const tipo = (panelEl.querySelector('#cot-tipo') as HTMLSelectElement)?.value;
    agregarLineaDetalle(tipo);
  });

  if (tipoFijo === 'Servicio') {
    recetaServicioRows = [];
    renderRecetaServicio(panelEl);

    panelEl.querySelector('#btn-cargar-receta-servicio')?.addEventListener('click', () => {
      void cargarRecetaServicioDesdeDetalle(panelEl);
    });

    panelEl.querySelector('#btn-agregar-prod-receta-servicio')?.addEventListener('click', () => {
      const grupos = getServiceLineGroups(panelEl);
      const grupo = grupos[0] || { idServicio: 0, idPlanta: null, idArea: null, servicioNombre: 'General', plantaNombre: '', areaNombre: '' };
      recetaServicioRows.push({
        id_servicio: grupo.idServicio,
        id_equipo: null,
        equipo_descripcion: '',
        id_producto: 0,
        cantidad: 1,
        observacion: '',
        id_cliente_planta: grupo.idPlanta,
        id_cliente_planta_area: grupo.idArea,
      });
      renderRecetaServicio(panelEl);
    });

    // Función para mostrar/ocultar sección de limpieza de cisternas
    const actualizarSeccionLimpiezaCisternas = () => {
      const seccion = panelEl.querySelector('#seccion-limpieza-cisternas') as HTMLElement;
      if (!seccion) return;

      const tbody = panelEl.querySelector('#detalle-cotizacion-body') as HTMLElement;
      if (!tbody) return;

      const filas = tbody.querySelectorAll('tr');
      let tieneLimpiezaCisternas = false;

      filas.forEach(fila => {
        const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement;
        if (itemSelect) {
          const selectedOption = itemSelect.options[itemSelect.selectedIndex];
          const servicioNombre = selectedOption?.textContent?.trim() || '';
          if (servicioNombre.toUpperCase().includes('LIMPIEZA DE CISTERNAS Y RESERVORIOS') ||
              servicioNombre.toUpperCase().includes('LIMPIEZA DE CISTERNAS') ||
              servicioNombre.toUpperCase().includes('LIMPIEZA DE RESERVORIOS')) {
            tieneLimpiezaCisternas = true;
          }
        }
      }); 

      seccion.style.display = tieneLimpiezaCisternas ? 'block' : 'none';
    };

    // Event listener para cambios en el detalle
    panelEl.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('item-select')) {
        actualizarSeccionLimpiezaCisternas();
      }
    });

    // También verificar cuando se agrega una nueva línea
    panelEl.querySelector('#btn-agregar-linea')?.addEventListener('click', () => {
      setTimeout(actualizarSeccionLimpiezaCisternas, 100); // Pequeño delay para que se renderice la nueva fila
    });

    // Verificar cuando se elimina una línea
    panelEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-eliminar-linea')) {
        setTimeout(actualizarSeccionLimpiezaCisternas, 100);
      }
    });
  }



  const form = panelEl.querySelector('#form-cotizacion') as HTMLFormElement;
  console.log('[FORM] 📝 Form encontrado:', !!form);
  form?.addEventListener('submit', async (e) => {
    console.log('[FORM] 💾 Submit del formulario');
    e.preventDefault();
    await guardarCotizacion(tipoFijo);
  });

  console.log('[FORM] ✅ ====== FIN abrirFormularioCotizacion - TODO INICIALIZADO CORRECTAMENTE para tipo:', tipoFijo);
}

function cerrarFormulario() {
  ['servicio', 'producto', 'capacitacion'].forEach(p => {
    const panel = document.getElementById(`cotiz-panel-${p}`);
    if (panel) panel.style.display = 'none';
  });
  const historialPanel = document.getElementById('cotiz-panel-historial');
  if (historialPanel) historialPanel.style.display = 'block';
  document.querySelectorAll('.cotiz-tab').forEach(t => {
    const el = t as HTMLElement;
    const isActive = el.dataset.tab === 'historial';
    el.style.borderBottomColor = isActive ? '#2563eb' : 'transparent';
    el.style.color = isActive ? '#2563eb' : '#64748b';
    el.style.fontWeight = isActive ? '600' : '500';
  });
  tabActivo = 'historial';
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

function getActivePanelElement(): HTMLElement | null {
  // Buscar el panel que está visiblemente mostrado (display !== 'none')
  const panels = document.querySelectorAll('[id^="cotiz-panel-"]');
  for (const panel of panels) {
    const el = panel as HTMLElement;
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.display !== 'none') {
      console.log('[UTIL] ✅ Panel activo encontrado:', el.id, 'display:', computedStyle.display);
      return el;
    }
  }
  
  // Fallback: usar tabActivo
  console.log('[UTIL] ⚠️ No se encontró panel visible, usando tabActivo:', tabActivo);
  return document.getElementById(`cotiz-panel-${tabActivo}`) as HTMLElement | null;
}

function agregarLineaDetalle(tipo?: string) {
  console.log('[LINE] Iniciando agregarLineaDetalle...');
  
  // Encontrar el panel activo (el que está visible)
  const panelActivoElement = getActivePanelElement();
    
  if (!panelActivoElement) {
    console.log('[LINE] ❌ No se encontró panel activo');
    return;
  }
  
  const tbody = panelActivoElement.querySelector('#detalle-cotizacion-body');

  console.log('[LINE] tbody encontrado:', !!tbody, 'dentro de panel:', panelActivoElement.id);
  console.log('[LINE] ⚠️ CRÍTICO - tipo:', tipo);

  if (!tipo) {
    console.log('[LINE] ❌ Tipo no seleccionado');
    mostrarToast('warning', 'Atención', 'Seleccione el tipo de cotización primero');
    return;
  }

  contadorLineas++;
  const lineaId = `linea-${contadorLineas}`;
  console.log('[LINE] ✅ Agregando línea:', lineaId);

  const servicios = (window as any).__serviciosData || [];
  const productos = (window as any).__productosData || [];
  const catalogoCapAud = (window as any).__catalogoCapAudData || [];

  console.log('[LINE] Datos globales - Servicios:', servicios.length, 'Productos:', productos.length, 'Catálogo:', catalogoCapAud.length);

  const tipoAdapter = getCotizacionTipoAdapter(tipo);
  if (!tipoAdapter) {
    console.log('[LINE] ❌ Adapter no encontrado para tipo:', tipo);
    mostrarToast('warning', 'Atención', 'Tipo de cotización no soportado');
    return;
  }

  const opcionesItem = tipoAdapter.buildItemOptions({
    servicios,
    productos,
    catalogoCapAud,
  });

  const inputStyle = 'width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;';
  const selectStyle = inputStyle;
  const {
    disabledCantidad,
    disabledCantidadStyle,
    disabledFrecuencia,
    disabledFrecuenciaStyle,
    disabledModalidad,
    disabledModalidadStyle,
  } = tipoAdapter.getDisabledFieldsState();

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
        <input type="number" class="cantidad-input" value="1" min="1" style="${inputStyle}${disabledCantidadStyle}" ${disabledCantidad}>
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
      ${tipo === 'Capacitacion' ? `
      <td>
        <input type="number" class="horas-input" value="0" min="0" step="0.5" style="${inputStyle}">
      </td>
      <td>
        <input type="number" class="participantes-input" value="1" min="1" style="${inputStyle}">
      </td>
      <td>
        <input type="date" class="fecha-servicio-input" style="${inputStyle}">
      </td>
      ` : ''}
      <!-- Eliminado: técnicos/supervisor de capacitación -->
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
      // Lógica para mostrar/ocultar sección limpieza cisternas
      const panelEl = getActivePanelElement();
      if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
        actualizarSeccionLimpiezaCisternas(panelEl);
      }
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
      // Lógica para mostrar/ocultar sección limpieza cisternas
      const panelEl = getActivePanelElement();
      if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
        actualizarSeccionLimpiezaCisternas(panelEl);
      }
    });
    // Lógica para mostrar/ocultar sección limpieza cisternas al agregar línea
    const panelEl = getActivePanelElement();
    if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
      actualizarSeccionLimpiezaCisternas(panelEl);
    }
  }
}

// Función para mostrar/ocultar la sección de limpieza de cisternas
function actualizarSeccionLimpiezaCisternas(panelEl: HTMLElement) {
  const seccion = panelEl.querySelector('#seccion-limpieza-cisternas') as HTMLElement;
  if (!seccion) return;
  const tbody = panelEl.querySelector('#detalle-cotizacion-body') as HTMLElement;
  if (!tbody) return;
  const filas = tbody.querySelectorAll('tr');
  let tieneLimpiezaCisternas = false;
  filas.forEach(fila => {
    const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement;
    if (itemSelect) {
      const selectedOption = itemSelect.options[itemSelect.selectedIndex];
      const servicioNombre = selectedOption?.textContent?.trim() || '';
      if (
        servicioNombre.toUpperCase().includes('LIMPIEZA DE CISTERNAS Y RESERVORIOS') ||
        servicioNombre.toUpperCase().includes('LIMPIEZA DE CISTERNAS') ||
        servicioNombre.toUpperCase().includes('LIMPIEZA DE RESERVORIOS')
      ) {
        tieneLimpiezaCisternas = true;
      }
    }
  });
  seccion.style.display = tieneLimpiezaCisternas ? 'block' : 'none';
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
  // Encontrar el panel activo
  const panelActivoElement = getActivePanelElement();
  if (!panelActivoElement) return;
  
  const lineas = panelActivoElement.querySelectorAll('#detalle-cotizacion-body tr');
  let subtotalGeneral = 0;

  lineas.forEach(linea => {
    const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    subtotalGeneral += cantidad * precio;
  });

  const igv = incluyeIgv ? subtotalGeneral * 0.18 : 0;
  const total = subtotalGeneral + igv;

  const subtotalEl = panelActivoElement.querySelector('#subtotal-value');
  const igvEl = panelActivoElement.querySelector('#igv-value');
  const totalEl = panelActivoElement.querySelector('#total-value');

  if (subtotalEl) subtotalEl.textContent = `S/ ${subtotalGeneral.toFixed(2)}`;
  if (igvEl) igvEl.textContent = `S/ ${igv.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

function buildProductoOptionsReceta(selectedId: number): string {
  const productos = (window as any).__productosData || [];
  let opts = '<option value="">Seleccione producto...</option>';
  productos.forEach((p: any) => {
    const sel = p.id === selectedId ? 'selected' : '';
    opts += `<option value="${p.id}" ${sel}>${p.descripcion}${p.unidad ? ` (${p.unidad})` : ''}</option>`;
  });
  return opts;
}

function getServiceLineGroups(panelEl: HTMLElement): Array<{ idServicio: number; idPlanta: number | null; idArea: number | null; servicioNombre: string; plantaNombre: string; areaNombre: string }> {
  const groups: Array<{ idServicio: number; idPlanta: number | null; idArea: number | null; servicioNombre: string; plantaNombre: string; areaNombre: string }> = [];
  const seen = new Set<string>();
  const rows = panelEl.querySelectorAll('#detalle-cotizacion-body tr');
  rows.forEach((row) => {
    const itemSel = row.querySelector('.item-select') as HTMLSelectElement;
    const value = itemSel?.value || '';
    if (!value.startsWith('s-')) return;
    const idServicio = parseInt(value.replace('s-', ''), 10) || 0;
    if (!idServicio) return;

    const plantaSel = row.querySelector('.planta-input') as HTMLSelectElement;
    const areaSel = row.querySelector('.area-input') as HTMLSelectElement;
    const idPlanta = parseInt(plantaSel?.value || '0', 10) || null;
    const idArea = parseInt(areaSel?.value || '0', 10) || null;
    const servicioNombre = itemSel.options[itemSel.selectedIndex]?.text || `Servicio #${idServicio}`;
    const plantaNombre = (plantaSel && plantaSel.selectedIndex > 0) ? (plantaSel.options[plantaSel.selectedIndex]?.text || '') : '';
    const areaNombre = (areaSel && areaSel.selectedIndex > 0) ? (areaSel.options[areaSel.selectedIndex]?.text || '') : '';

    const key = `${idServicio}-${idPlanta || 0}-${idArea || 0}`;
    if (seen.has(key)) return;
    seen.add(key);
    groups.push({ idServicio, idPlanta, idArea, servicioNombre, plantaNombre, areaNombre });
  });
  return groups;
}

function getRecetaGroupKey(row: RecetaServicioRow): string {
  return `${row.id_servicio}-${row.id_cliente_planta || 0}-${row.id_cliente_planta_area || 0}-${row.id_equipo || 0}`;
}

function getRecetaGroupLabel(row: RecetaServicioRow, panelEl: HTMLElement): string {
  const groups = getServiceLineGroups(panelEl);
  const g = groups.find((x) => x.idServicio === row.id_servicio && (x.idPlanta || 0) === (row.id_cliente_planta || 0) && (x.idArea || 0) === (row.id_cliente_planta_area || 0));
  const partes = [g?.servicioNombre || `Servicio #${row.id_servicio}`];
  if (g?.plantaNombre) partes.push(g.plantaNombre);
  if (g?.areaNombre) partes.push(g.areaNombre);
  if (row.equipo_descripcion) partes.push(row.equipo_descripcion);
  return partes.join(' -> ');
}

function renderRecetaServicio(panelEl: HTMLElement) {
  const tbody = panelEl.querySelector('#receta-servicio-body') as HTMLElement;
  const empty = panelEl.querySelector('#receta-servicio-empty') as HTMLElement;
  if (!tbody || !empty) return;

  if (recetaServicioRows.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const groupsOrder: string[] = [];
  recetaServicioRows.forEach((r) => {
    const key = getRecetaGroupKey(r);
    if (!groupsOrder.includes(key)) groupsOrder.push(key);
  });

  let html = '';
  groupsOrder.forEach((groupKey) => {
    const rows = recetaServicioRows.filter((r) => getRecetaGroupKey(r) === groupKey);
    const first = rows[0];
    html += `<tr>
      <td colspan="4" style="background:#eef2ff;color:#4338ca;font-weight:600;font-size:12px;padding:6px 10px;">${getRecetaGroupLabel(first, panelEl)}</td>
      <td style="background:#eef2ff;text-align:right;padding:6px 10px;">
        <button type="button" class="btn-eliminar-receta-grupo" data-group-key="${groupKey}" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;" title="Eliminar equipo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    </tr>`;
    rows.forEach((r) => {
      const idx = recetaServicioRows.indexOf(r);
      html += `<tr>
        <td style="font-size:12px;color:#64748b;">${r.equipo_descripcion || 'Sin equipo'}</td>
        <td><select class="receta-prod-select" data-idx="${idx}" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;">${buildProductoOptionsReceta(r.id_producto)}</select></td>
        <td style="text-align:center;"><input type="number" min="0.01" step="0.01" class="receta-cantidad-input" data-idx="${idx}" value="${r.cantidad}" style="width:90px;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;text-align:center;"></td>
        <td><input type="text" class="receta-obs-input" data-idx="${idx}" value="${r.observacion || ''}" maxlength="255" placeholder="Opcional" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;"></td>
        <td style="text-align:center;"><button type="button" class="btn-eliminar-receta" data-idx="${idx}" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;" title="Eliminar producto"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;

  panelEl.querySelectorAll('.receta-prod-select').forEach((el) => {
    el.addEventListener('change', (e) => {
      const idx = Number((e.target as HTMLSelectElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows[idx].id_producto = Number((e.target as HTMLSelectElement).value || 0);
    });
  });

  panelEl.querySelectorAll('.receta-cantidad-input').forEach((el) => {
    el.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows[idx].cantidad = parseFloat((e.target as HTMLInputElement).value) || 0;
    });
  });

  panelEl.querySelectorAll('.receta-obs-input').forEach((el) => {
    el.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows[idx].observacion = (e.target as HTMLInputElement).value || '';
    });
  });

  panelEl.querySelectorAll('.btn-eliminar-receta').forEach((el) => {
    el.addEventListener('click', (e) => {
      const idx = Number((e.currentTarget as HTMLButtonElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows.splice(idx, 1);
      renderRecetaServicio(panelEl);
    });
  });

  panelEl.querySelectorAll('.btn-eliminar-receta-grupo').forEach((el) => {
    el.addEventListener('click', (e) => {
      const groupKey = (e.currentTarget as HTMLButtonElement).dataset.groupKey || '';
      if (!groupKey) return;
      recetaServicioRows = recetaServicioRows.filter((r) => getRecetaGroupKey(r) !== groupKey);
      renderRecetaServicio(panelEl);
      mostrarToast('success', 'Equipo eliminado', 'Se eliminó el equipo y sus productos');
    });
  });
}

async function cargarRecetaServicioDesdeDetalle(panelEl: HTMLElement) {
  const groups = getServiceLineGroups(panelEl);
  if (groups.length === 0) {
    mostrarToast('warning', 'Sin servicios', 'Agregue al menos una línea de servicio antes de cargar la receta');
    return;
  }

  const nuevasFilas: RecetaServicioRow[] = [];
  const cargados = new Set<string>();
  for (const g of groups) {
    const key = `${g.idServicio}-${g.idPlanta || 0}-${g.idArea || 0}`;
    if (cargados.has(key)) continue;
    cargados.add(key);
    try {
      const res = await servicioService.getProductos(g.idServicio);
      const raw = res.data || res;
      const items: any[] = Array.isArray(raw) ? raw : (raw as any).data || [];
      items.forEach((item: any) => {
        const existente = nuevasFilas.find((r) =>
          r.id_servicio === g.idServicio
          && (r.id_cliente_planta || 0) === (g.idPlanta || 0)
          && (r.id_cliente_planta_area || 0) === (g.idArea || 0)
          && (r.id_equipo || 0) === (item.id_equipo || 0)
          && r.id_producto === item.id_producto,
        );

        if (existente) {
          existente.cantidad += Number(item.cantidad_default || 0);
        } else {
          nuevasFilas.push({
            id_servicio: g.idServicio,
            id_equipo: item.id_equipo || null,
            equipo_descripcion: item.equipo_descripcion || '',
            id_producto: Number(item.id_producto || 0),
            cantidad: Number(item.cantidad_default || 0),
            observacion: item.observacion || '',
            id_cliente_planta: g.idPlanta,
            id_cliente_planta_area: g.idArea,
          });
        }
      });
    } catch (error) {
      console.error('Error cargando receta de servicio:', error);
    }
  }

  recetaServicioRows = nuevasFilas;
  renderRecetaServicio(panelEl);

  if (recetaServicioRows.length > 0) {
    mostrarToast('success', 'Receta cargada', `Se cargaron ${recetaServicioRows.length} producto(s) desde la receta de servicios`);
  } else {
    mostrarToast('warning', 'Sin receta', 'Los servicios seleccionados no tienen productos en su receta');
  }
}

async function guardarCotizacion(tipoFijo?: string) {
  // Encontrar el panel activo
  const panelActivoElement = getActivePanelElement();
  
  if (!panelActivoElement) {
    console.log('[SAVE] ❌ No se encontró panel activo');
    mostrarToast('error', 'Error', 'No se encontró el formulario activo');
    return;
  }
  
  const multicimId = parseInt((panelActivoElement.querySelector('#cot-multicim') as HTMLSelectElement)?.value || '0');
  const clienteId = parseInt((panelActivoElement.querySelector('#cot-cliente') as HTMLInputElement)?.value || '0');
  const tipoCotizacion = (panelActivoElement.querySelector('#cot-tipo') as HTMLSelectElement)?.value;
  const observaciones = (panelActivoElement.querySelector('#cot-observaciones') as HTMLInputElement)?.value?.trim();  
  const propuestaHtml = quillInstance ? quillInstance.root.innerHTML : '';

  console.log('[SAVE] Panel encontrado:', panelActivoElement.id, 'multicimId:', multicimId, 'clienteId:', clienteId, 'tipo:', tipoCotizacion);

  if (!multicimId || !clienteId || !tipoCotizacion) {
    mostrarToast('warning', 'Campos obligatorios', 'Seleccione la empresa emisora, el cliente y el tipo de cotización');
    return;
  }

  if (!clienteId || !tipoCotizacion) {
    mostrarToast('warning', 'Campos obligatorios', 'Seleccione cliente y tipo de cotización');
    return;
  }

  const lineas = panelActivoElement.querySelectorAll('#detalle-cotizacion-body tr');
  if (lineas.length === 0) {
    mostrarToast('warning', 'Sin detalles', 'Agregue al menos una línea de detalle');
    return;
  }

  const tipoAdapter = getCotizacionTipoAdapter(tipoCotizacion);
  if (!tipoAdapter) {
    mostrarToast('warning', 'Tipo no válido', 'No se reconoce el tipo de cotización seleccionado');
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
    const opTecnicos = (linea.querySelector('.op-tecnicos-input') as HTMLInputElement | null)?.value?.trim() || null;
    const supervisor = (linea.querySelector('.supervisor-input') as HTMLInputElement | null)?.value?.trim() || null;
    const plantaVal = parseInt((linea.querySelector('.planta-input') as HTMLSelectElement)?.value || '0') || null;
    const areaVal = parseInt((linea.querySelector('.area-input') as HTMLSelectElement)?.value || '0') || null;
    const horasCapacitacion = tipoCotizacion === 'Capacitacion' ? parseFloat((linea.querySelector('.horas-input') as HTMLInputElement)?.value || '0') : null;
    const numParticipantes = tipoCotizacion === 'Capacitacion' ? parseInt((linea.querySelector('.participantes-input') as HTMLInputElement)?.value || '1') : null;
    const fechaServicio = tipoCotizacion === 'Capacitacion' ? (linea.querySelector('.fecha-servicio-input') as HTMLInputElement)?.value || null : null;

    const {
      id_servicio,
      id_producto,
      id_catalogo_cap_aud,
    } = tipoAdapter.parseSelectedItem(itemValue);

    detalles.push({
      id_servicio,
      id_producto,
      id_catalogo_cap_aud,
      cantidad,
      precio_unitario: precio,
      frecuencia_sugerida: frecuencia,
      modalidad_sugerida: modalidad,
      op_tecnicos: opTecnicos,
      supervisor,
      id_cliente_planta: plantaVal,
      id_cliente_planta_area: areaVal,
      horas_capacitacion: horasCapacitacion,
      num_participantes: numParticipantes,
      fecha_servicio: fechaServicio,
    });
  });

  const data = {
    id_multicim: multicimId,
    id_cliente: clienteId,
    tipo_cotizacion: tipoCotizacion,
    incluye_igv: incluyeIgv,
    observaciones: observaciones || undefined,
    propuesta_tecnica: propuestaHtml,
    receta_servicio: tipoCotizacion === 'Servicio' && recetaServicioRows.length > 0 ? recetaServicioRows : null,
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

        // Guardar receta de servicio si tipo es Servicio y hay receta
        if (tipoCotizacion === 'Servicio' && recetaServicioRows.length > 0) {
          try {
            await cotizacionService.updateReceta(nuevaId, recetaServicioRows);
            mostrarToast('success', 'Receta guardada', 'La receta de servicio fue almacenada correctamente');
          } catch (e) {
            console.error('Error guardando receta:', e);
            mostrarToast('warning', 'Aviso', 'La cotización se guardó pero la receta no pudo almacenarse');
          }
        }
      }

      await cargarCotizaciones();
      await cargarEstadisticas();
      
      // 🔄 Resetear flag del tipo actual para permitir recargar si hay cambios
      if (tipoFijo && TAB_TO_TIPO) {
        Object.keys(TAB_TO_TIPO).forEach((key) => {
          if ((TAB_TO_TIPO as any)[key] === tipoFijo) {
            tabsInicializados[key] = false; // Permitir recargar
          }
        });
      }
      
      if (tipoFijo) {
        await abrirFormularioCotizacion(tipoFijo);
      } else {
        cerrarFormulario();
      }
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

  // Reset estado de tabs al inicializar
  tabActivo = 'historial';
  tabsInicializados.servicio = false;
  tabsInicializados.producto = false;
  tabsInicializados.capacitacion = false;

  // Navegación por tabs
  document.querySelectorAll('.cotiz-tab').forEach(tab => {
    tab.addEventListener('click', async (e) => {
      const nuevoTab = (e.currentTarget as HTMLElement).dataset.tab || 'historial';
      console.log('[TABS] Click en tab:', nuevoTab, 'tabActivo anterior:', tabActivo);
      
      if (nuevoTab === tabActivo) {
        console.log('[TABS] Tab ya activo, ignorando click');
        return;
      }
      
      // Si regresa a Historial, resetear todos los flags para permitir recargar desde cero
      if (nuevoTab === 'historial') {
        tabsInicializados.servicio = false;
        tabsInicializados.producto = false;
        tabsInicializados.capacitacion = false;
        console.log('[TABS] 🔄 Regresando a Historial - Flags resetados');
      }
      
      //  Cancelar cargas anteriores si aún estaban en progreso
      if (formularioLoadController) {
        try {
          console.log('[TABS] Abortando carga anterior del tipo:', tabActivo);
          (formularioLoadController as AbortController).abort();
        } catch (err) {
          console.warn('[TABS] Error al abortar carga anterior:', err);
        }
      }
      formularioLoadController = new AbortController();
      console.log('[TABS] Nuevo AbortController creado para:', nuevoTab);
      
      tabActivo = nuevoTab;

      // Actualizar estilos de tabs
      document.querySelectorAll('.cotiz-tab').forEach(t => {
        const el = t as HTMLElement;
        const isActive = el.dataset.tab === nuevoTab;
        el.style.borderBottomColor = isActive ? '#2563eb' : 'transparent';
        el.style.color = isActive ? '#2563eb' : '#64748b';
        el.style.fontWeight = isActive ? '600' : '500';
      });

      // Mostrar/ocultar paneles
      ['historial', 'servicio', 'producto', 'capacitacion'].forEach(p => {
        const panel = document.getElementById(`cotiz-panel-${p}`);
        if (panel) panel.style.display = 'none';
      });
      const panelActivo = document.getElementById(`cotiz-panel-${nuevoTab}`);
      if (panelActivo) panelActivo.style.display = 'block';

      // Cargar formulario en tabs de tipo (solo la primera vez)
      if (nuevoTab !== 'historial' && !tabsInicializados[nuevoTab]) {
        try {
          await abrirFormularioCotizacion(TAB_TO_TIPO[nuevoTab]);
          // ✅ Solo marcar como inicializado si se completa SIN ERRORES
          tabsInicializados[nuevoTab] = true;
        } catch (error) {
          console.error('[TABS] Error al cargar formulario de', nuevoTab, ':', error);
          mostrarToast('error', 'Error', `No se pudo cargar el formulario de ${nuevoTab}`);
          // NO marcar como inicializado si hay error, permitir reintentar
        }
      }
    });
  });

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
