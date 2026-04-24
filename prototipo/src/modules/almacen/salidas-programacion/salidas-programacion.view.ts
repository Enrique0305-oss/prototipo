import { salidasProgramacionService, type ProgramacionPendiente, type InsumoProgamacion } from './salidas-programacion.service';
import { mostrarToast, confirmarAccion } from '../../../shared/toast';
import { ApiError } from '../../../core/api/api.client';
import { loteService } from '../../../services/loteService';
import type { Lote } from '../../../core/api/types';
import './salidas-programacion.css';

let programacionesPendientes: ProgramacionPendiente[] = [];
let historialData: ProgramacionPendiente[] = [];
let filtroFechaDesde = '';
let filtroFechaHasta = '';
let vistaSeccActual: 'pendientes' | 'historial' = 'pendientes';
let paginaActual = 1;
const ITEMS_POR_PAGINA = 20;

// ═══════════ Render principal ═══════════

export function renderSalidasProgramacion(): string {
  return `
    <div style="padding:24px">
      <div class="prov-page-header">
        <div>
          <div class="prov-breadcrumb">Salidas por Programación</div>
          <div class="sp-subtitle">Confirma la entrega de materiales para los servicios programados</div>
        </div>
      </div>

      <div class="sp-tabs">
        <button class="sp-tab active" data-tab="pendientes">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          Pendientes de Entrega
        </button>
        <button class="sp-tab" data-tab="historial">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Historial
        </button>
      </div>

      <div class="prov-filters-bar">
        <div class="prov-search-box" style="max-width:180px;flex:unset;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <input type="date" id="filtroFechaDesde" class="prov-search-input" value="${filtroFechaDesde}">
        </div>
        <div class="prov-search-box" style="max-width:180px;flex:unset;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <input type="date" id="filtroFechaHasta" class="prov-search-input" value="${filtroFechaHasta}">
        </div>
        <button class="prov-btn-primary" id="btnFiltrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Buscar
        </button>
        <button class="prov-btn-secondary" id="btnLimpiarFiltros">Limpiar</button>
      </div>

      <div id="contenidoSalidasProg">
        <div class="sp-loading">Cargando...</div>
      </div>

      <div id="spPaginacion" class="sp-pagination" style="display:none;">
        <span class="sp-pagination-info" id="spPagInfo"></span>
        <div class="sp-pagination-controls" id="spPagControls"></div>
      </div>

      <!-- Modal Confirmar Salida -->
      <div class="prov-modal" id="modalConfirmarSalida" style="display:none;">
        <div class="prov-modal-overlay" id="spModalOverlay"></div>
        <div class="prov-modal-content prov-modal-lg">
          <div class="prov-modal-header">
            <h2>Confirmar Salida de Materiales</h2>
            <button class="prov-modal-close" id="btnCerrarModalSalida">&times;</button>
          </div>
          <div class="prov-modal-body" id="modalConfirmarSalidaBody">
            <!-- Contenido dinámico -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initSalidasProgramacion() {
  const hoy = new Date();
  filtroFechaDesde = hoy.toISOString().split('T')[0];
  const dentroSiete = new Date();
  dentroSiete.setDate(dentroSiete.getDate() + 7);
  filtroFechaHasta = dentroSiete.toISOString().split('T')[0];

  const inputDesde = document.getElementById('filtroFechaDesde') as HTMLInputElement;
  const inputHasta = document.getElementById('filtroFechaHasta') as HTMLInputElement;
  if (inputDesde) inputDesde.value = filtroFechaDesde;
  if (inputHasta) inputHasta.value = filtroFechaHasta;

  await cargarPendientes();
  enlazarEventos();
}

function enlazarEventos() {
  // Tabs
  document.querySelectorAll('.sp-tab').forEach(tab => {
    tab.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.sp-tab') as HTMLElement;
      const tabName = btn?.dataset.tab as 'pendientes' | 'historial';
      if (!tabName) return;

      document.querySelectorAll('.sp-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      vistaSeccActual = tabName;

      if (tabName === 'pendientes') await cargarPendientes();
      else await cargarHistorial();
    });
  });

  // Filtros
  document.getElementById('btnFiltrar')?.addEventListener('click', async () => {
    const inputDesde = document.getElementById('filtroFechaDesde') as HTMLInputElement;
    const inputHasta = document.getElementById('filtroFechaHasta') as HTMLInputElement;
    filtroFechaDesde = inputDesde?.value || '';
    filtroFechaHasta = inputHasta?.value || '';

    if (vistaSeccActual === 'pendientes') await cargarPendientes();
    else await cargarHistorial();
  });

  document.getElementById('btnLimpiarFiltros')?.addEventListener('click', async () => {
    filtroFechaDesde = '';
    filtroFechaHasta = '';
    const inputDesde = document.getElementById('filtroFechaDesde') as HTMLInputElement;
    const inputHasta = document.getElementById('filtroFechaHasta') as HTMLInputElement;
    if (inputDesde) inputDesde.value = '';
    if (inputHasta) inputHasta.value = '';

    if (vistaSeccActual === 'pendientes') await cargarPendientes();
    else await cargarHistorial();
  });
}

// ═══════════ Cargar datos ═══════════

async function cargarPendientes() {
  const contenedor = document.getElementById('contenidoSalidasProg');
  if (!contenedor) return;

  contenedor.innerHTML = '<div class="sp-loading">Cargando programaciones...</div>';

  try {
    const params: any = {};
    if (filtroFechaDesde) params.fecha_desde = filtroFechaDesde;
    if (filtroFechaHasta) params.fecha_hasta = filtroFechaHasta;

    const res = await salidasProgramacionService.getPendientes(params);
    programacionesPendientes = res.data || [];
    paginaActual = 1;

    if (programacionesPendientes.length === 0) {
      contenedor.innerHTML = `
        <div class="sp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <polyline points="9 14 12 17 16 11"></polyline>
          </svg>
          No hay programaciones pendientes de entrega de materiales
        </div>`;
      ocultarPaginacion();
      return;
    }

    contenedor.innerHTML = renderTablaPendientes();
    renderPaginacion(programacionesPendientes.length);
    enlazarEventosPendientes();
  } catch (error) {
    console.error('Error cargando pendientes:', error);
    const mensaje = obtenerMensajeError(error, 'Error al cargar datos');
    contenedor.innerHTML = `<div class="sp-error">${mensaje}</div>`;
    mostrarToast('error', 'Error', mensaje);
    ocultarPaginacion();
  }
}

async function cargarHistorial() {
  const contenedor = document.getElementById('contenidoSalidasProg');
  if (!contenedor) return;

  contenedor.innerHTML = '<div class="sp-loading">Cargando historial...</div>';

  try {
    const params: any = {};
    if (filtroFechaDesde) params.fecha_desde = filtroFechaDesde;
    if (filtroFechaHasta) params.fecha_hasta = filtroFechaHasta;

    const res = await salidasProgramacionService.getHistorial(params);
    historialData = res.data || [];
    paginaActual = 1;

    if (historialData.length === 0) {
      contenedor.innerHTML = `
        <div class="sp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          No hay salidas confirmadas en el rango seleccionado
        </div>`;
      ocultarPaginacion();
      return;
    }

    contenedor.innerHTML = renderTablaHistorial();
    renderPaginacion(historialData.length);
    enlazarEventosHistorial();
  } catch (error) {
    console.error('Error cargando historial:', error);
    const mensaje = obtenerMensajeError(error, 'Error al cargar historial');
    contenedor.innerHTML = `<div class="sp-error">${mensaje}</div>`;
    mostrarToast('error', 'Error', mensaje);
    ocultarPaginacion();
  }
}

// ═══════════ Render tablas ═══════════

function renderTablaPendientes(): string {
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const pagina = programacionesPendientes.slice(inicio, fin);

  return `
    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>FECHA PROGRAMADA</th>
            <th>CLIENTE</th>
            <th>SERVICIO</th>
            <th>TÉCNICO</th>
            <th>MATERIALES</th>
            <th>ESTADO STOCK</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          ${pagina.map(p => {
            const cliente = p.orden_servicio?.cliente?.nombre_empresa || p.orden_servicio?.cliente?.persona_contacto || '—';
            const servicio = p.servicio?.nombre || 'Servicio';
            const tecnico = p.tecnico ? `${p.tecnico.nombre} ${p.tecnico.apellidos}` : '—';
            const materialesCount = p.insumos?.length || 0;
            const stockCompleto = verificarStockCompleto(p.insumos || []);

            return `
              <tr>
                <td>${formatFecha(p.fecha_programada)}${p.hora_inicio ? ' ' + p.hora_inicio.substring(0, 5) : ''}</td>
                <td><strong>${cliente}</strong></td>
                <td>${servicio}</td>
                <td>${tecnico}</td>
                <td>${materialesCount} producto(s)</td>
                <td>
                  <span class="prov-badge ${stockCompleto ? 'prov-badge-activo' : 'prov-badge-pendiente'}">
                    ${stockCompleto ? 'Stock OK' : 'Insuficiente'}
                  </span>
                </td>
                <td>
                  <div class="sp-actions-cell">
                    <button class="prov-btn-icon-sm" data-prog-id="${p.id}" data-prog-es-grupo="${p.es_grupo ? 'true' : 'false'}" title="Confirmar Entrega" style="color:#16a34a;border-color:#bbf7d0;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderTablaHistorial(): string {
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const pagina = historialData.slice(inicio, fin);

  return `
    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>FECHA PROGRAMADA</th>
            <th>CLIENTE</th>
            <th>SERVICIO</th>
            <th>TÉCNICO</th>
            <th>MATERIALES</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          ${pagina.map(p => {
            const cliente = p.orden_servicio?.cliente?.nombre_empresa || p.orden_servicio?.cliente?.persona_contacto || '—';
            const servicio = p.servicio?.nombre || 'Servicio';
            const tecnico = p.tecnico ? `${p.tecnico.nombre} ${p.tecnico.apellidos}` : '—';
            const materialesCount = p.insumos?.length || 0;
            const todoDevuelto = (p.insumos || []).every(i => (i.cantidad_utilizada || 0) === 0);
            const estadoTexto = todoDevuelto ? 'Devuelto' : 'Entregado';
            const claseEstado = todoDevuelto ? 'prov-badge-pendiente' : 'prov-badge-recibido';

            return `
              <tr>
                <td>${formatFecha(p.fecha_programada)}${p.hora_inicio ? ' ' + p.hora_inicio.substring(0, 5) : ''}</td>
                <td><strong>${cliente}</strong></td>
                <td>${servicio}</td>
                <td>${tecnico}</td>
                <td>${materialesCount} producto(s)</td>
                <td><span class="prov-badge ${claseEstado}">${estadoTexto}</span></td>
                <td>
                  <div class="sp-actions-cell">
                    <button class="prov-btn-icon-sm sp-btn-pdf-entrega" data-prog-id-pdf="${p.id}" data-prog-es-grupo="${p.es_grupo ? 'true' : 'false'}" title="Descargar Acta de Entrega" style="color:#7c3aed;border-color:#ddd6fe;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>
                    </button>
                    ${todoDevuelto ? '' : `
                    <button class="prov-btn-icon-sm sp-btn-devolucion" data-prog-id-devol="${p.id}" data-prog-es-grupo="${p.es_grupo ? 'true' : 'false'}" title="Registrar Devolución" style="color:#0ea5e9;border-color:#bae6fd;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                      </svg>
                    </button>
                    `}
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ═══════════ Paginación ═══════════

function renderPaginacion(totalItems: number) {
  const contenedor = document.getElementById('spPaginacion');
  const info = document.getElementById('spPagInfo');
  const controls = document.getElementById('spPagControls');
  if (!contenedor || !info || !controls) return;

  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);

  if (totalItems <= ITEMS_POR_PAGINA) {
    contenedor.style.display = 'none';
    return;
  }

  contenedor.style.display = 'flex';

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA + 1;
  const fin = Math.min(inicio + ITEMS_POR_PAGINA - 1, totalItems);
  info.textContent = `Mostrando ${inicio}-${fin} de ${totalItems}`;

  let html = `
    <button class="sp-pag-btn" id="spPagPrev" ${paginaActual === 1 ? 'disabled' : ''}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
  `;

  const rango = 2;
  let inicioPag = Math.max(1, paginaActual - rango);
  let finPag = Math.min(totalPaginas, paginaActual + rango);

  if (inicioPag > 1) {
    html += `<button class="sp-pag-btn" data-page="1">1</button>`;
    if (inicioPag > 2) html += `<span class="sp-pag-dots">...</span>`;
  }

  for (let i = inicioPag; i <= finPag; i++) {
    html += `<button class="sp-pag-btn ${i === paginaActual ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (finPag < totalPaginas) {
    if (finPag < totalPaginas - 1) html += `<span class="sp-pag-dots">...</span>`;
    html += `<button class="sp-pag-btn" data-page="${totalPaginas}">${totalPaginas}</button>`;
  }

  html += `
    <button class="sp-pag-btn" id="spPagNext" ${paginaActual === totalPaginas ? 'disabled' : ''}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;

  controls.innerHTML = html;

  // Event listeners
  document.getElementById('spPagPrev')?.addEventListener('click', () => {
    if (paginaActual > 1) { paginaActual--; rerenderTablaActual(); }
  });
  document.getElementById('spPagNext')?.addEventListener('click', () => {
    if (paginaActual < totalPaginas) { paginaActual++; rerenderTablaActual(); }
  });
  controls.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      paginaActual = parseInt((e.target as HTMLElement).dataset.page || '1');
      rerenderTablaActual();
    });
  });
}

function rerenderTablaActual() {
  const contenedor = document.getElementById('contenidoSalidasProg');
  if (!contenedor) return;

  if (vistaSeccActual === 'pendientes') {
    contenedor.innerHTML = renderTablaPendientes();
    renderPaginacion(programacionesPendientes.length);
    enlazarEventosPendientes();
  } else {
    contenedor.innerHTML = renderTablaHistorial();
    renderPaginacion(historialData.length);
    enlazarEventosHistorial();
  }
}

function ocultarPaginacion() {
  const el = document.getElementById('spPaginacion');
  if (el) el.style.display = 'none';
}

// ═══════════ Modal Confirmar Salida ═══════════

function enlazarEventosPendientes() {
  document.querySelectorAll('[data-prog-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const id = parseInt(target.dataset.progId || '0');
      const esGrupo = target.dataset.progEsGrupo === 'true';
      if (id) await abrirModalConfirmar(id, esGrupo);
    });
  });
}

function enlazarEventosHistorial() {
  document.querySelectorAll('[data-prog-id-pdf]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const id = parseInt(target.dataset.progIdPdf || '0');
      const esGrupo = target.dataset.progEsGrupo === 'true';
      if (!id) return;
      try {
        await salidasProgramacionService.downloadActaEntrega(id, esGrupo);
      } catch (err) {
        console.error('Error descargando acta:', err);
        mostrarToast('error', 'Error', 'No se pudo descargar el acta de entrega');
      }
    });
  });

  document.querySelectorAll('[data-prog-id-devol]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const id = parseInt(target.dataset.progIdDevol || '0');
      const esGrupo = target.dataset.progEsGrupo === 'true';
      if (id) await abrirModalDevolucion(id, esGrupo);
    });
  });
}

async function abrirModalConfirmar(idProgramacion: number, esGrupo: boolean = false) {
  const modal = document.getElementById('modalConfirmarSalida');
  const body = document.getElementById('modalConfirmarSalidaBody');
  const title = document.querySelector('#modalConfirmarSalida .prov-modal-header h2') as HTMLElement;
  if (!modal || !body) return;

  if (title) title.textContent = esGrupo ? 'Confirmar Salida de Materiales (Grupo)' : 'Confirmar Salida de Materiales';

  body.innerHTML = '<div class="sp-loading">Cargando detalles...</div>';
  modal.style.display = 'flex';

  try {
    const res = await salidasProgramacionService.getDetalle(idProgramacion, esGrupo);
    const prog = res.data;
    if (!prog) {
      body.innerHTML = '<div class="sp-error">No se encontró la programación</div>';
      return;
    }

    const cliente = prog.orden_servicio?.cliente?.nombre_empresa || prog.orden_servicio?.cliente?.persona_contacto || '—';
    const servicio = prog.servicio?.nombre || 'Servicio';
    const tecnico = prog.tecnico ? `${prog.tecnico.nombre} ${prog.tecnico.apellidos}` : '—';

    body.innerHTML = `
      <div class="sp-info-grid">
        <div class="sp-info-item"><strong>Cliente: </strong><span>${cliente}</span></div>
        <div class="sp-info-item"><strong>Servicio: </strong><span>${servicio}</span></div>
        <div class="sp-info-item"><strong>Fecha: </strong><span>${formatFecha(prog.fecha_programada)}${prog.hora_inicio ? ' ' + prog.hora_inicio.substring(0, 5) : ''}</span></div>
        <div class="sp-info-item"><strong>Técnico: </strong><span>${tecnico}</span></div>
      </div>

      <div class="sp-materiales-title">Materiales a Entregar</div>
      <div class="sp-materiales-table">
        <table class="prov-detail-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Asignado</th>
              <th>Disponible</th>
              <th>Lote</th>
              <th>Entregar</th>
            </tr>
          </thead>
          <tbody id="insumosConfirmarBody">
            ${(prog.insumos || []).map((ins: InsumoProgamacion, idx: number) => {
              const disponible = ins.producto?.inventario?.cantidad_disponible || 0;
              const asignado = ins.cantidad_asignada;
              const suficiente = disponible >= asignado;

              return `
                <tr>
                  <td>
                    ${ins.producto?.descripcion || 'Producto'}
                    ${!suficiente ? '<div class="sp-stock-warn">⚠ Stock insuficiente</div>' : ''}
                  </td>
                  <td>${asignado} ${ins.producto?.unidad_medida || ''}</td>
                  <td style="color:${suficiente ? '#16a34a' : '#ef4444'};font-weight:600;">${disponible}</td>
                  <td>
                    <select
                      class="prov-input-sm lote-entregar"
                      data-idx="${idx}"
                      data-id-producto="${ins.id_producto}"
                      data-cantidad-asignada="${asignado}"
                      style="min-width:150px;"
                    >
                      <option value="">Cargando lotes...</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      class="prov-input-sm cantidad-entregar" 
                      data-idx="${idx}"
                      data-id-producto="${ins.id_producto}"
                      value="0" 
                      min="0" 
                      max="0"
                      disabled
                      style="width:80px;"
                    >
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="sp-obs-group">
        <label>Observación (Opcional)</label>
        <textarea id="observacionSalida" class="prov-input" rows="2" placeholder="Observaciones sobre la entrega..."></textarea>
      </div>

      <div class="prov-modal-footer">
        <button class="prov-btn-secondary" id="btnCancelarConfirmacion">Cancelar</button>
        <button class="prov-btn-success" id="btnConfirmarEntrega" data-prog-id="${idProgramacion}" data-prog-ids='${JSON.stringify(prog.ids_programacion || [prog.id])}' data-es-grupo="${esGrupo}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Confirmar Entrega
        </button>
      </div>
    `;

    document.getElementById('btnCancelarConfirmacion')?.addEventListener('click', cerrarModalConfirmar);
    document.getElementById('btnCerrarModalSalida')?.addEventListener('click', cerrarModalConfirmar);
    document.getElementById('spModalOverlay')?.addEventListener('click', cerrarModalConfirmar);
    document.getElementById('btnConfirmarEntrega')?.addEventListener('click', confirmarEntrega);

    await inicializarSelectoresLoteEntrega(prog.insumos || []);

  } catch (error) {
    console.error('Error cargando detalle:', error);
    body.innerHTML = '<div class="sp-error">Error al cargar detalles</div>';
  }
}

async function inicializarSelectoresLoteEntrega(insumos: InsumoProgamacion[]) {
  for (let idx = 0; idx < insumos.length; idx++) {
    const ins = insumos[idx];
    const selectLote = document.querySelector<HTMLSelectElement>(`.lote-entregar[data-idx="${idx}"]`);
    const inputCantidad = document.querySelector<HTMLInputElement>(`.cantidad-entregar[data-idx="${idx}"]`);

    if (!selectLote || !inputCantidad) continue;

    try {
      const res = await loteService.getByProducto(ins.id_producto);
      const lotesActivos = (res.data || []).filter((l: Lote) => l.estado === 'Activo' && Number(l.cantidad_disponible ?? 0) > 0);

      if (!lotesActivos.length) {
        selectLote.innerHTML = '<option value="">Sin lotes disponibles</option>';
        selectLote.disabled = true;
        inputCantidad.value = '0';
        inputCantidad.max = '0';
        inputCantidad.disabled = true;
        continue;
      }

      selectLote.disabled = false;
      selectLote.innerHTML = '<option value="">Seleccionar lote...</option>' +
        lotesActivos.map((l) => `<option value="${l.id}">${l.numero_lote}</option>`).join('');

      const aplicarLoteSeleccionado = () => {
        const idLote = Number(selectLote.value || '0');
        const lote = lotesActivos.find((l) => l.id === idLote);
        if (!lote) {
          inputCantidad.value = '0';
          inputCantidad.max = '0';
          inputCantidad.disabled = true;
          return;
        }

        const asignado = Number(selectLote.dataset.cantidadAsignada || '0');
        const disponibleLote = Number(lote.cantidad_disponible ?? 0);
        const maxEntregar = Math.max(0, Math.min(asignado, disponibleLote));
        inputCantidad.max = String(maxEntregar);
        inputCantidad.value = String(maxEntregar);
        inputCantidad.disabled = false;
      };

      selectLote.addEventListener('change', aplicarLoteSeleccionado);
      selectLote.value = String(lotesActivos[0].id);
      aplicarLoteSeleccionado();
    } catch (err) {
      selectLote.innerHTML = '<option value="">Error al cargar lotes</option>';
      selectLote.disabled = true;
      inputCantidad.value = '0';
      inputCantidad.max = '0';
      inputCantidad.disabled = true;
    }
  }
}

async function abrirModalDevolucion(idProgramacion: number, esGrupo: boolean = false) {
  const modal = document.getElementById('modalConfirmarSalida');
  const body = document.getElementById('modalConfirmarSalidaBody');
  const title = document.querySelector('#modalConfirmarSalida .prov-modal-header h2') as HTMLElement;
  if (!modal || !body) return;

  if (title) title.textContent = esGrupo ? 'Registrar Devolución de Materiales (Grupo)' : 'Registrar Devolución de Materiales';
  body.innerHTML = '<div class="sp-loading">Cargando detalle de entrega...</div>';
  modal.style.display = 'flex';

  try {
    const res = await salidasProgramacionService.getDetalleDevolucion(idProgramacion, esGrupo);
    const prog = res.data;
    if (!prog) {
      body.innerHTML = '<div class="sp-error">No se encontró la programación</div>';
      return;
    }

    const cliente = prog.orden_servicio?.cliente?.nombre_empresa || prog.orden_servicio?.cliente?.persona_contacto || '—';
    const servicio = prog.servicio?.nombre || 'Servicio';
    const tecnico = prog.tecnico ? `${prog.tecnico.nombre} ${prog.tecnico.apellidos}` : '—';

    const insumosConSaldo = (prog.insumos || []).filter(i => (i.cantidad_utilizada || 0) > 0);
    if (insumosConSaldo.length === 0) {
      body.innerHTML = `
        <div class="sp-empty" style="padding:20px 0;">No hay materiales entregados pendientes de devolución.</div>
        <div class="prov-modal-footer">
          <button class="prov-btn-secondary" id="btnCancelarConfirmacion">Cerrar</button>
        </div>
      `;
      document.getElementById('btnCancelarConfirmacion')?.addEventListener('click', cerrarModalConfirmar);
      return;
    }

    body.innerHTML = `
      <div class="sp-info-grid">
        <div class="sp-info-item"><strong>Cliente: </strong><span>${cliente}</span></div>
        <div class="sp-info-item"><strong>Servicio: </strong><span>${servicio}</span></div>
        <div class="sp-info-item"><strong>Fecha: </strong><span>${formatFecha(prog.fecha_programada)}${prog.hora_inicio ? ' ' + prog.hora_inicio.substring(0, 5) : ''}</span></div>
        <div class="sp-info-item"><strong>Técnico: </strong><span>${tecnico}</span></div>
      </div>

      <div class="sp-materiales-title">Materiales a Devolver</div>
      <div class="sp-materiales-table">
        <table class="prov-detail-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Entregado</th>
              <th>Devolver</th>
            </tr>
          </thead>
          <tbody>
            ${insumosConSaldo.map((ins: InsumoProgamacion, idx: number) => {
              const entregado = ins.cantidad_utilizada || 0;
              return `
                <tr>
                  <td>${ins.producto?.descripcion || 'Producto'}</td>
                  <td>${entregado} ${ins.producto?.unidad_medida || ''}</td>
                  <td>
                    <input
                      type="number"
                      class="prov-input-sm cantidad-devolver"
                      data-idx="${idx}"
                      data-id-producto="${ins.id_producto}"
                      value="0"
                      min="0"
                      max="${entregado}"
                      style="width:80px;"
                    >
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="sp-obs-group">
        <label>Observación (Opcional)</label>
        <textarea id="observacionDevolucion" class="prov-input" rows="2" placeholder="Observaciones sobre la devolución..."></textarea>
      </div>

      <div class="prov-modal-footer">
        <button class="prov-btn-secondary" id="btnCancelarConfirmacion">Cancelar</button>
        <button class="prov-btn-success" id="btnRegistrarDevolucion" data-prog-ids='${JSON.stringify(prog.ids_programacion || [prog.id])}'>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 14 4 9 9 4"></polyline>
            <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
          </svg>
          Registrar Devolución
        </button>
      </div>
    `;

    document.getElementById('btnCancelarConfirmacion')?.addEventListener('click', cerrarModalConfirmar);
    document.getElementById('btnCerrarModalSalida')?.addEventListener('click', cerrarModalConfirmar);
    document.getElementById('spModalOverlay')?.addEventListener('click', cerrarModalConfirmar);
    document.getElementById('btnRegistrarDevolucion')?.addEventListener('click', registrarDevolucion);
  } catch (error) {
    console.error('Error cargando detalle devolución:', error);
    body.innerHTML = '<div class="sp-error">Error al cargar detalles de devolución</div>';
  }
}

function cerrarModalConfirmar() {
  const modal = document.getElementById('modalConfirmarSalida');
  if (modal) modal.style.display = 'none';
}

async function confirmarEntrega(e: Event) {
  const btn = e.currentTarget as HTMLButtonElement;
  const idsProgStr = btn.dataset.progIds || '[]';
  const idsProg: number[] = JSON.parse(idsProgStr);
  const esGrupo = btn.dataset.esGrupo === 'true';

  if (!idsProg.length) return;

  const inputsCantidad = document.querySelectorAll('.cantidad-entregar') as NodeListOf<HTMLInputElement>;
  const insumos = Array.from(inputsCantidad).map(input => {
    const idx = input.dataset.idx || '0';
    const selectLote = document.querySelector<HTMLSelectElement>(`.lote-entregar[data-idx="${idx}"]`);
    return {
      id_producto: parseInt(input.dataset.idProducto || '0'),
      id_lote: parseInt(selectLote?.value || '0'),
      cantidad_entregada: parseInt(input.value || '0'),
    };
  });

  const observacion = (document.getElementById('observacionSalida') as HTMLTextAreaElement)?.value || '';

  if (insumos.every(i => i.cantidad_entregada === 0)) {
    mostrarToast('warning', 'Advertencia', 'Debe entregar al menos un producto');
    return;
  }

  const insumoSinLote = insumos.find(i => i.cantidad_entregada > 0 && !i.id_lote);
  if (insumoSinLote) {
    mostrarToast('warning', 'Lote requerido', 'Seleccione el lote para cada producto entregado');
    return;
  }

  const ok = await confirmarAccion({
    titulo: 'Confirmar Entrega',
    mensaje: '¿Confirmar la salida de estos materiales? Se descontará del stock y se registrará en Kardex.',
    tipo: 'warning',
    textoConfirmar: 'Sí, Confirmar',
  });

  if (!ok) return;

  btn.disabled = true;
  btn.textContent = 'Procesando...';

  const idOriginal = parseInt(btn.dataset.progId || '0');

  try {
    const res = await salidasProgramacionService.confirmarSalida({
      ids_programacion: idsProg,
      insumos,
      observacion,
    });

    mostrarToast('success', 'Entrega Confirmada', 'Los materiales se han entregado y registrado en Kardex');
    try {
      if (idOriginal) {
        await salidasProgramacionService.downloadActaEntrega(idOriginal, esGrupo);
      }
    } catch (pdfErr) {
      console.error('No se pudo descargar el PDF de entrega:', pdfErr);
      mostrarToast('warning', 'PDF', 'La entrega se confirmó, pero no se pudo descargar el acta');
    }
    cerrarModalConfirmar();
    await cargarPendientes();
  } catch (error: any) {
    console.error('Error confirmando salida:', error);
    mostrarToast('error', 'Error', obtenerMensajeError(error, 'No se pudo confirmar la salida'));
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Confirmar Entrega';
  }
}

async function registrarDevolucion(e: Event) {
  const btn = e.currentTarget as HTMLButtonElement;
  const idsProgStr = btn.dataset.progIds || '[]';
  const idsProg: number[] = JSON.parse(idsProgStr);

  if (!idsProg.length) return;

  const inputsCantidad = document.querySelectorAll('.cantidad-devolver') as NodeListOf<HTMLInputElement>;
  const insumos = Array.from(inputsCantidad).map(input => ({
    id_producto: parseInt(input.dataset.idProducto || '0'),
    cantidad_devuelta: parseInt(input.value || '0'),
  }));

  const observacion = (document.getElementById('observacionDevolucion') as HTMLTextAreaElement)?.value || '';

  if (insumos.every(i => i.cantidad_devuelta === 0)) {
    mostrarToast('warning', 'Advertencia', 'Debe registrar devolución en al menos un producto');
    return;
  }

  const ok = await confirmarAccion({
    titulo: 'Registrar Devolución',
    mensaje: '¿Confirmar la devolución de estos materiales? Se repondrá stock y se registrará en Kardex.',
    tipo: 'warning',
    textoConfirmar: 'Sí, Registrar',
  });

  if (!ok) return;

  btn.disabled = true;
  btn.textContent = 'Procesando...';

  try {
    await salidasProgramacionService.registrarDevolucion({
      ids_programacion: idsProg,
      insumos,
      observacion,
    });

    mostrarToast('success', 'Devolución Registrada', 'La devolución fue registrada y el stock actualizado');
    cerrarModalConfirmar();
    await cargarHistorial();
  } catch (error: any) {
    console.error('Error registrando devolución:', error);
    mostrarToast('error', 'Error', obtenerMensajeError(error, 'No se pudo registrar la devolución'));
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg> Registrar Devolución';
  }
}

// ═══════════ Utilidades ═══════════

function verificarStockCompleto(insumos: InsumoProgamacion[]): boolean {
  return insumos.every(i => {
    const disponible = i.producto?.inventario?.cantidad_disponible || 0;
    return disponible >= i.cantidad_asignada;
  });
}

function formatFecha(fecha: string): string {
  if (!fecha) return '—';
  const parts = fecha.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mesIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${meses[mesIdx] || m} ${y}`;
  }
  return fecha;
}

function obtenerMensajeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const errorsMap = error.data?.errors as Record<string, string[]> | undefined;
    const primerError = errorsMap ? Object.values(errorsMap)[0]?.[0] : undefined;

    return (
      error.data?.message ||
      (Array.isArray(error.data?.errors)
        ? error.data.errors.join(', ')
        : primerError) ||
      fallback
    );
  }

  return fallback;
}
