import { mostrarToast, confirmarAccion } from '../../../shared/toast';
import { productoService } from '../../../services/productoService';
import type { Producto } from '../../../core/api/types';
import {
  ordenesFabricacionService,
  type OrdenFabricacion,
  type ProgramacionFabricacionSalida,
  type ProgramacionFabricacionEntradaDevolucion,
} from './ordenes-fabricacion.service';
import './ordenes-fabricacion.css';

let ordenesData: OrdenFabricacion[] = [];
let productosFabricables: Producto[] = [];
let filtroEstado = '';
let filtroTexto = '';
let vistaActual: 'ordenes' | 'salidas' | 'cierre' = 'ordenes';
let modoModal: 'crear' | 'editar' = 'crear';
let ordenEditId: number | null = null;
let salidasProgramacionData: ProgramacionFabricacionSalida[] = [];
let cierreProgramacionData: ProgramacionFabricacionEntradaDevolucion[] = [];

function extractList<T = any>(response: any): T[] {
  const raw = response?.data ?? response;
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

export function renderOrdenesFabricacion(): string {
  return `
    <div style="padding:24px;">
      <div class="prov-page-header">
        <div>
          <div class="prov-breadcrumb">Almacen / Ordenes de Fabricacion</div>
          <div class="sp-subtitle">Registra productos a fabricar y calcula automaticamente los insumos requeridos por receta.</div>
        </div>
        <button class="prov-btn-primary" id="btnNuevaOrdenFabricacion">Nueva Orden</button>
      </div>

      <div class="sp-tabs">
        <button class="sp-tab active" data-tab="ordenes">Ordenes</button>
        <button class="sp-tab" data-tab="salidas">Salidas de programación</button>
        <button class="sp-tab" data-tab="cierre">Entrada / devolución de productos</button>
      </div>

      <div class="prov-filters-bar" style="margin-top:12px;">
        <div class="prov-search-box" style="max-width:280px;">
          <input class="prov-search-input" id="ofFiltroTexto" placeholder="Buscar por codigo o motivo" value="${filtroTexto}">
        </div>
        <select class="prov-filter-select" id="ofFiltroEstado" style="max-width:220px;">
          <option value="">Todos los estados</option>
          <option value="Confirmada" ${filtroEstado === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
          <option value="Programada" ${filtroEstado === 'Programada' ? 'selected' : ''}>Programada</option>
          <option value="Fabricada" ${filtroEstado === 'Fabricada' ? 'selected' : ''}>Fabricada</option>
          <option value="Anulada" ${filtroEstado === 'Anulada' ? 'selected' : ''}>Anulada</option>
        </select>
        <button class="prov-btn-secondary" id="btnFiltrarOF">Buscar</button>
      </div>

      <div id="ordenesFabricacionContent" style="margin-top:14px;">
        <div class="sp-loading">Cargando ordenes...</div>
      </div>

      <div id="salidasFabricacionContent" style="margin-top:14px; display:none;">
        <div class="sp-loading">Cargando salidas...</div>
      </div>

      <div id="cierreFabricacionContent" style="margin-top:14px; display:none;">
        <div class="sp-loading">Cargando cierres...</div>
      </div>

      <div class="prov-modal" id="modalOrdenFabricacion" style="display:none;">
        <div class="prov-modal-overlay" id="modalOrdenFabricacionOverlay"></div>
        <div class="prov-modal-content prov-modal-lg">
          <div class="prov-modal-header">
            <h2 id="tituloModalOrdenFabricacion">Nueva Orden de Fabricacion</h2>
            <button class="prov-modal-close" id="cerrarModalOrdenFabricacion">&times;</button>
          </div>
          <div class="prov-modal-body" id="modalOrdenFabricacionBody"></div>
        </div>
      </div>

      <div class="prov-modal" id="modalSalidaFabricacion" style="display:none;">
        <div class="prov-modal-overlay" id="modalSalidaFabricacionOverlay"></div>
        <div class="prov-modal-content prov-modal-lg">
          <div class="prov-modal-header">
            <h2 id="tituloModalSalidaFabricacion">Confirmar salida de programacion</h2>
            <button class="prov-modal-close" id="cerrarModalSalidaFabricacion">&times;</button>
          </div>
          <div class="prov-modal-body" id="modalSalidaFabricacionBody"></div>
        </div>
      </div>

      <div class="prov-modal" id="modalCierreFabricacion" style="display:none;">
        <div class="prov-modal-overlay" id="modalCierreFabricacionOverlay"></div>
        <div class="prov-modal-content prov-modal-lg">
          <div class="prov-modal-header">
            <h2 id="tituloModalCierreFabricacion">Entrada / devolución de productos</h2>
            <button class="prov-modal-close" id="cerrarModalCierreFabricacion">&times;</button>
          </div>
          <div class="prov-modal-body" id="modalCierreFabricacionBody"></div>
        </div>
      </div>
    </div>
  `;
}

export async function initOrdenesFabricacion() {
  await Promise.all([cargarProductosFabricables(), cargarOrdenes()]);
  bindBaseEvents();
  await cargarSalidasProgramacion();
  await cargarCierresFabricacion();
}

async function cargarProductosFabricables() {
  try {
    const res = await productoService.getFabricablesConReceta();
    productosFabricables = extractList<Producto>(res).filter((p) => !!p?.es_fabricable);
  } catch (error) {
    console.error('Error cargando productos fabricables:', error);
    productosFabricables = [];
  }
}

async function cargarOrdenes() {
  const container = document.getElementById('ordenesFabricacionContent');
  if (!container) return;
  container.innerHTML = '<div class="sp-loading">Cargando ordenes...</div>';

  try {
    const res = await ordenesFabricacionService.getAll({
      estado: filtroEstado || undefined,
      search: filtroTexto || undefined,
    });
    ordenesData = res.data || [];

    if (!ordenesData.length) {
      container.innerHTML = '<div class="sp-empty">No hay ordenes de fabricacion registradas.</div>';
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>CODIGO</th>
              <th>FECHA</th>
              <th>MOTIVO</th>
              <th>PRODUCTOS</th>
              <th>INSUMOS</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            ${ordenesData.map((of) => {
              const totalProductos = (of.detalles || []).reduce((acc, d) => acc + Number(d.cantidad || 0), 0);
              const totalInsumos = (of.resumen_insumos || []).length;
              const isBloqueada = (of.programaciones_count || 0) > 0;
              return `
                <tr>
                  <td><strong>${of.codigo}</strong></td>
                  <td>${fmtFecha(of.fecha_orden)}</td>
                  <td>${of.motivo || '—'}</td>
                  <td>${totalProductos}</td>
                  <td>${totalInsumos}</td>
                  <td><span class="status-indicator ${estadoClass(of.estado)}">${of.estado}</span></td>
                  <td>
                    <div class="of-actions-group">
                      <button class="of-icon-btn of-icon-btn-blue" data-of-detalle="${of.id}" title="Detalle" aria-label="Detalle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button class="of-icon-btn of-icon-btn-amber" data-of-editar="${of.id}" ${isBloqueada ? 'disabled' : ''} title="Editar" aria-label="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                      </button>
                      <button class="of-icon-btn of-icon-btn-red" data-of-eliminar="${of.id}" ${isBloqueada ? 'disabled' : ''} title="Eliminar" aria-label="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
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

    bindTableEvents();
  } catch (error) {
    console.error('Error cargando ordenes de fabricacion:', error);
    container.innerHTML = '<div class="sp-error">No se pudo cargar la lista de ordenes.</div>';
  }
}

async function cargarSalidasProgramacion() {
  const container = document.getElementById('salidasFabricacionContent');
  if (!container) return;
  container.innerHTML = '<div class="sp-loading">Cargando salidas...</div>';

  try {
    const res = await ordenesFabricacionService.getPendientesSalidaProgramacion();
    salidasProgramacionData = res.data || [];

    if (!salidasProgramacionData.length) {
      container.innerHTML = '<div class="sp-empty">No hay programaciones de fabricacion pendientes de salida.</div>';
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>ORDEN</th>
              <th>PROGRAMACION</th>
              <th>TECNICO</th>
              <th>INSUMOS</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            ${salidasProgramacionData.map((prog) => {
              const tecnico = prog.tecnico ? `${prog.tecnico.nombre || ''} ${prog.tecnico.apellido || ''}`.trim() : '—';
              return `
                <tr>
                  <td><strong>${prog.codigo_orden || `OF-${prog.id_orden_fabricacion || ''}`}</strong><br><span class="muted">${prog.motivo_orden || '—'}</span></td>
                  <td>${fmtFecha(prog.fecha_programada)}<br><span class="muted">${fmtHora(prog.hora_inicio)}${prog.hora_fin ? ` - ${fmtHora(prog.hora_fin)}` : ''}</span></td>
                  <td>${tecnico}</td>
                  <td>${prog.insumos.length}</td>
                  <td>${prog.salida_confirmada ? `<span class="status-indicator success">Confirmada${prog.fecha_salida ? `<br><span class="muted">${fmtFechaHora(String(prog.fecha_salida))}</span>` : ''}</span>` : '<span class="status-indicator warning">Pendiente</span>'}</td>
                  <td>
                    <div class="of-actions-group">
                      <button class="of-icon-btn of-icon-btn-blue" data-salida-detalle="${prog.id}" title="Ver detalle" aria-label="Ver detalle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button class="of-icon-btn of-icon-btn-green" data-salida-confirmar="${prog.id}" ${prog.salida_confirmada ? 'disabled' : ''} title="Confirmar salida" aria-label="Confirmar salida">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
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

    bindSalidasEvents();
  } catch (error: any) {
    console.error('Error cargando salidas de fabricacion:', error);
    container.innerHTML = '<div class="sp-error">No se pudo cargar la lista de salidas.</div>';
  }
}

async function cargarCierresFabricacion() {
  const container = document.getElementById('cierreFabricacionContent');
  if (!container) return;
  container.innerHTML = '<div class="sp-loading">Cargando cierres...</div>';

  try {
    const res = await ordenesFabricacionService.getPendientesEntradaDevolucion();
    cierreProgramacionData = res.data || [];

    if (!cierreProgramacionData.length) {
      container.innerHTML = '<div class="sp-empty">No hay programaciones pendientes de entrada/devolucion.</div>';
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>ORDEN</th>
              <th>PROGRAMACION</th>
              <th>TECNICO</th>
              <th>PRODUCTOS</th>
              <th>INSUMOS</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            ${cierreProgramacionData.map((prog) => {
              const tecnico = prog.tecnico ? `${prog.tecnico.nombre || ''} ${prog.tecnico.apellido || ''}`.trim() : '—';
              return `
                <tr>
                  <td><strong>${prog.codigo_orden || `OF-${prog.id_orden_fabricacion || ''}`}</strong><br><span class="muted">${prog.motivo_orden || '—'}</span></td>
                  <td>${fmtFecha(prog.fecha_programada)}<br><span class="muted">${fmtHora(prog.hora_inicio)}${prog.hora_fin ? ` - ${fmtHora(prog.hora_fin)}` : ''}</span></td>
                  <td>${tecnico}</td>
                  <td>${prog.productos_esperados.length}</td>
                  <td>${prog.insumos_sugeridos.length}</td>
                  <td>
                    <div class="of-actions-group">
                      <button class="of-icon-btn of-icon-btn-blue" data-cierre-detalle="${prog.id}" title="Registrar cierre" aria-label="Registrar cierre">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"></path><path d="M5 12h14"></path><path d="M7 6l5-4 5 4"></path></svg>
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

    bindCierresEvents();
  } catch (error) {
    console.error('Error cargando cierres de fabricacion:', error);
    container.innerHTML = '<div class="sp-error">No se pudo cargar la lista de cierres.</div>';
  }
}

function bindBaseEvents() {
  document.getElementById('btnNuevaOrdenFabricacion')?.addEventListener('click', () => abrirModalCrear());

  document.querySelectorAll('.sp-tab').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const tab = (e.currentTarget as HTMLElement).dataset.tab as 'ordenes' | 'salidas' | 'cierre';
      if (!tab) return;

      vistaActual = tab;
      document.querySelectorAll('.sp-tab').forEach((x) => x.classList.remove('active'));
      (e.currentTarget as HTMLElement).classList.add('active');

      const ordenesContainer = document.getElementById('ordenesFabricacionContent');
      const salidasContainer = document.getElementById('salidasFabricacionContent');
      const cierreContainer = document.getElementById('cierreFabricacionContent');
      if (tab === 'ordenes') {
        if (ordenesContainer) ordenesContainer.style.display = '';
        if (salidasContainer) salidasContainer.style.display = 'none';
        if (cierreContainer) cierreContainer.style.display = 'none';
        await cargarOrdenes();
      } else if (tab === 'salidas') {
        if (ordenesContainer) ordenesContainer.style.display = 'none';
        if (salidasContainer) salidasContainer.style.display = '';
        if (cierreContainer) cierreContainer.style.display = 'none';
        await cargarSalidasProgramacion();
      } else {
        if (ordenesContainer) ordenesContainer.style.display = 'none';
        if (salidasContainer) salidasContainer.style.display = 'none';
        if (cierreContainer) cierreContainer.style.display = '';
        await cargarCierresFabricacion();
      }
    });
  });

  document.getElementById('btnFiltrarOF')?.addEventListener('click', async () => {
    filtroTexto = ((document.getElementById('ofFiltroTexto') as HTMLInputElement)?.value || '').trim();
    filtroEstado = ((document.getElementById('ofFiltroEstado') as HTMLSelectElement)?.value || '').trim();
    if (vistaActual === 'ordenes') {
      await cargarOrdenes();
    } else if (vistaActual === 'salidas') {
      await cargarSalidasProgramacion();
    } else {
      await cargarCierresFabricacion();
    }
  });

  document.getElementById('cerrarModalOrdenFabricacion')?.addEventListener('click', cerrarModal);
  document.getElementById('modalOrdenFabricacionOverlay')?.addEventListener('click', cerrarModal);
  document.getElementById('cerrarModalSalidaFabricacion')?.addEventListener('click', cerrarModalSalida);
  document.getElementById('modalSalidaFabricacionOverlay')?.addEventListener('click', cerrarModalSalida);
  document.getElementById('cerrarModalCierreFabricacion')?.addEventListener('click', cerrarModalCierre);
  document.getElementById('modalCierreFabricacionOverlay')?.addEventListener('click', cerrarModalCierre);
}

function bindTableEvents() {
  document.querySelectorAll('[data-of-detalle]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).getAttribute('data-of-detalle'));
      if (!id) return;
      await abrirModalDetalle(id);
    });
  });

  document.querySelectorAll('[data-of-editar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).getAttribute('data-of-editar'));
      if (!id) return;
      if ((btn as HTMLButtonElement).disabled) return;
      await abrirModalEditar(id);
    });
  });

  document.querySelectorAll('[data-of-eliminar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).getAttribute('data-of-eliminar'));
      if (!id) return;
      if ((btn as HTMLButtonElement).disabled) return;
      await eliminarOrden(id);
    });
  });
}

function abrirModalCrear() {
  modoModal = 'crear';
  ordenEditId = null;

  const body = document.getElementById('modalOrdenFabricacionBody');
  const titulo = document.getElementById('tituloModalOrdenFabricacion');
  const modal = document.getElementById('modalOrdenFabricacion');
  if (!body || !titulo || !modal) return;

  titulo.textContent = 'Nueva Orden de Fabricacion';
  body.innerHTML = renderFormHtml();
  modal.style.display = 'flex';
  bindFormEvents();
}

async function abrirModalEditar(id: number) {
  const body = document.getElementById('modalOrdenFabricacionBody');
  const titulo = document.getElementById('tituloModalOrdenFabricacion');
  const modal = document.getElementById('modalOrdenFabricacion');
  if (!body || !titulo || !modal) return;

  body.innerHTML = '<div class="sp-loading">Cargando orden...</div>';
  modal.style.display = 'flex';

  try {
    const res = await ordenesFabricacionService.getById(id);
    const of = res.data;

    modoModal = 'editar';
    ordenEditId = id;

    titulo.textContent = `Editar ${of.codigo}`;
    body.innerHTML = renderFormHtml(of);
    bindFormEvents();
  } catch (error) {
    console.error('Error cargando orden para editar:', error);
    mostrarToast('error', 'Error', 'No se pudo cargar la orden seleccionada');
    cerrarModal();
  }
}

async function abrirModalDetalle(id: number) {
  const body = document.getElementById('modalOrdenFabricacionBody');
  const titulo = document.getElementById('tituloModalOrdenFabricacion');
  const modal = document.getElementById('modalOrdenFabricacion');
  if (!body || !titulo || !modal) return;

  body.innerHTML = '<div class="sp-loading">Cargando detalle...</div>';
  modal.style.display = 'flex';

  try {
    const res = await ordenesFabricacionService.getById(id);
    const of = res.data;

    titulo.textContent = `Detalle ${of.codigo}`;
    body.innerHTML = `
      <div class="of-section of-section-tight">
        <div class="of-grid of-grid-header">
          <div><strong>Fecha:</strong> ${fmtFecha(of.fecha_orden)}</div>
          <div><strong>Estado:</strong> ${of.estado}</div>
          <div class="of-grid-full"><strong>Motivo:</strong> ${of.motivo || '—'}</div>
          <div class="of-grid-full"><strong>Observaciones:</strong> ${of.observaciones || '—'}</div>
        </div>
      </div>

      <div class="of-tab-panel active" id="ofPanelDetalle">
        <div class="of-section of-section-tight">
          <h4 class="of-section-title">Productos a fabricar</h4>
          <div class="table-container">
            <table class="op-table of-detalles-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Insumos requeridos</th>
              </tr>
            </thead>
            <tbody>
              ${(of.detalles || []).map((d) => `
                <tr>
                  <td>${d.producto?.descripcion || 'Producto'}</td>
                  <td>${Number(d.cantidad || 0)}</td>
                  <td>
                    ${(d.insumos_requeridos || []).length > 0
                      ? `<ul style="margin:0;padding-left:18px;display:grid;gap:4px;">
                          ${(d.insumos_requeridos || []).map((i) => `<li>${i.descripcion}: ${Number(i.cantidad_requerida || 0)} ${i.unidad || ''}</li>`).join('')}
                        </ul>`
                      : '<span style="color:#64748b;">Sin insumos</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div class="prov-modal-footer">
        <button class="prov-btn-secondary" id="btnCerrarDetalleOF">Cerrar</button>
      </div>
    `;

    document.getElementById('btnCerrarDetalleOF')?.addEventListener('click', cerrarModal);
  } catch (error) {
    console.error('Error cargando detalle de OF:', error);
    mostrarToast('error', 'Error', 'No se pudo cargar el detalle de la orden');
    cerrarModal();
  }
}

function renderFormHtml(of?: OrdenFabricacion): string {
  const detalles = of?.detalles && of.detalles.length > 0 ? of.detalles : [{ id_producto_final: 0, cantidad: 1 } as any];

  return `
    <form id="formOrdenFabricacion" class="of-form">
      <section class="of-section">
        <h4 class="of-section-title">Datos generales</h4>
        <div class="of-grid">
          <div>
            <label class="prov-label">Fecha de orden *</label>
            <input type="date" id="ofFechaOrden" class="prov-input" value="${(of?.fecha_orden || '').slice(0, 10) || hoyISO()}" required>
          </div>
          <div>
            <label class="prov-label">Estado</label>
            <select id="ofEstado" class="prov-input">
              <option value="Confirmada" ${(of?.estado || 'Confirmada') === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
              <option value="Borrador" ${(of?.estado || '') === 'Borrador' ? 'selected' : ''}>Borrador</option>
            </select>
          </div>
          <div class="of-grid-full">
            <label class="prov-label">Motivo</label>
            <input type="text" id="ofMotivo" class="prov-input" maxlength="255" value="${of?.motivo || ''}" placeholder="Ej: reposicion de stock para pedidos de la semana">
          </div>
          <div class="of-grid-full">
            <label class="prov-label">Observaciones</label>
            <textarea id="ofObservaciones" class="prov-input" rows="2" placeholder="Observaciones adicionales">${of?.observaciones || ''}</textarea>
          </div>
        </div>
      </section>

      <section class="of-section">
        <div class="of-section-head">
          <h4 class="of-section-title">Productos a fabricar</h4>
          <button type="button" class="prov-btn-secondary" id="btnAgregarDetalleOF">+ Agregar producto</button>
        </div>
        <div id="ofDetallesContainer" class="of-detalles-container">
          ${detalles.map((d, idx) => renderDetalleRow(idx, Number(d.id_producto_final || 0), Number(d.cantidad || 0))).join('')}
        </div>
      </section>

      <section class="of-section">
        <div class="of-grid">
          <div class="of-grid-full">
          <label class="prov-label">Resumen de insumos (estimado)</label>
          <div class="of-resumen-box" id="ofResumenInsumos">Seleccione productos y cantidades para visualizar el resumen.</div>
          </div>
        </div>
      </section>

      <div class="prov-modal-footer" style="margin-top:14px;">
        <button type="button" class="prov-btn-secondary" id="btnCancelarOF">Cancelar</button>
        <button type="submit" class="prov-btn-primary">${modoModal === 'crear' ? 'Crear Orden' : 'Guardar Cambios'}</button>
      </div>
    </form>
  `;
}

function renderDetalleRow(idx: number, selectedProductoId: number, cantidad: number): string {
  return `
    <div class="of-detalle-row" data-row="${idx}">
      <div>
        <label class="prov-label">Producto *</label>
        <select class="prov-input of-producto-select" required>
          <option value="">Seleccionar producto</option>
          ${productosFabricables.map((p) => `<option value="${p.id}" ${selectedProductoId === p.id ? 'selected' : ''}>${p.descripcion}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="prov-label">Cantidad *</label>
        <input type="number" class="prov-input of-cantidad-input" min="0.001" step="0.001" required value="${cantidad > 0 ? cantidad : 1}">
      </div>
      <button type="button" class="prov-btn-icon-sm of-btn-delete-row" title="Quitar">&times;</button>
    </div>
  `;
}

function bindFormEvents() {
  const form = document.getElementById('formOrdenFabricacion') as HTMLFormElement | null;
  if (!form) return;

  document.getElementById('btnCancelarOF')?.addEventListener('click', cerrarModal);

  document.getElementById('btnAgregarDetalleOF')?.addEventListener('click', () => {
    const container = document.getElementById('ofDetallesContainer');
    if (!container) return;
    const index = container.querySelectorAll('.of-detalle-row').length;
    container.insertAdjacentHTML('beforeend', renderDetalleRow(index, 0, 1));
    bindDetalleRowEvents();
    renderResumenInsumos();
  });

  bindDetalleRowEvents();
  renderResumenInsumos();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitForm();
  });
}

function bindDetalleRowEvents() {
  document.querySelectorAll('.of-btn-delete-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rows = document.querySelectorAll('.of-detalle-row');
      if (rows.length <= 1) {
        mostrarToast('warning', 'Atencion', 'Debe registrar al menos un producto');
        return;
      }
      (btn as HTMLElement).closest('.of-detalle-row')?.remove();
      renderResumenInsumos();
    });
  });

  document.querySelectorAll('.of-producto-select, .of-cantidad-input').forEach((el) => {
    el.addEventListener('change', renderResumenInsumos);
    el.addEventListener('input', renderResumenInsumos);
  });
}

function renderResumenInsumos() {
  const box = document.getElementById('ofResumenInsumos');
  if (!box) return;

  const detalles = leerDetallesFormulario();
  if (!detalles.length) {
    box.innerHTML = 'Seleccione productos y cantidades para visualizar el resumen.';
    return;
  }

  const resumen: Record<number, { descripcion: string; cantidad: number; unidad?: string | null }> = {};

  detalles.forEach((d) => {
    const producto = productosFabricables.find((p) => p.id === d.id_producto_final);
    const receta = Array.isArray(producto?.receta) ? producto!.receta! : [];

    receta.forEach((item: any) => {
      const idInsumo = Number(item?.id_producto_insumo || item?.insumo?.id || 0);
      if (!idInsumo) return;
      const cantidadRequerida = Number(item?.cantidad || 0) * Number(d.cantidad || 0);
      if (!resumen[idInsumo]) {
        resumen[idInsumo] = {
          descripcion: item?.insumo?.descripcion || 'Insumo',
          cantidad: 0,
          unidad: item?.unidad || item?.insumo?.unidad || null,
        };
      }
      resumen[idInsumo].cantidad += cantidadRequerida;
    });
  });

  const lista = Object.values(resumen);
  if (!lista.length) {
    box.innerHTML = 'Los productos seleccionados no tienen receta configurada.';
    return;
  }

  box.innerHTML = `<ul style="margin:0;padding-left:18px;display:grid;gap:6px;">${lista
    .map((i) => `<li><strong>${i.descripcion}</strong>: ${Number(i.cantidad).toFixed(3)} ${i.unidad || ''}</li>`)
    .join('')}</ul>`;
}

function leerDetallesFormulario(): Array<{ id_producto_final: number; cantidad: number }> {
  const rows = Array.from(document.querySelectorAll('.of-detalle-row')) as HTMLElement[];
  return rows
    .map((row) => {
      const productoId = Number((row.querySelector('.of-producto-select') as HTMLSelectElement)?.value || 0);
      const cantidad = Number((row.querySelector('.of-cantidad-input') as HTMLInputElement)?.value || 0);
      return { id_producto_final: productoId, cantidad };
    })
    .filter((d) => d.id_producto_final > 0 && d.cantidad > 0);
}

async function submitForm() {
  const fechaOrden = (document.getElementById('ofFechaOrden') as HTMLInputElement)?.value;
  const estado = (document.getElementById('ofEstado') as HTMLSelectElement)?.value as 'Borrador' | 'Confirmada';
  const motivo = (document.getElementById('ofMotivo') as HTMLInputElement)?.value?.trim();
  const observaciones = (document.getElementById('ofObservaciones') as HTMLTextAreaElement)?.value?.trim();
  const detalles = leerDetallesFormulario();

  if (!fechaOrden) {
    mostrarToast('warning', 'Campo requerido', 'Debe ingresar la fecha de la orden');
    return;
  }

  if (detalles.length === 0) {
    mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un producto fabricable');
    return;
  }

  const payload = {
    fecha_orden: fechaOrden,
    motivo: motivo || undefined,
    estado,
    observaciones: observaciones || undefined,
    detalles,
  };

  try {
    if (modoModal === 'crear') {
      await ordenesFabricacionService.create(payload);
      mostrarToast('success', 'Orden creada', 'La orden de fabricacion se registro correctamente');
    } else if (ordenEditId) {
      await ordenesFabricacionService.update(ordenEditId, payload);
      mostrarToast('success', 'Orden actualizada', 'Los cambios se guardaron correctamente');
    }

    cerrarModal();
    await cargarOrdenes();
  } catch (error: any) {
    console.error('Error guardando orden:', error);
    const mensaje = error?.data?.message || error?.response?.data?.message || 'No se pudo guardar la orden';
    mostrarToast('error', 'Error', mensaje);
  }
}

async function eliminarOrden(id: number) {
  const ok = await confirmarAccion({
    titulo: 'Eliminar orden',
    mensaje: 'Esta accion eliminara la orden de fabricacion. Desea continuar?',
    tipo: 'warning',
    textoConfirmar: 'Eliminar',
  });
  if (!ok) return;

  try {
    await ordenesFabricacionService.remove(id);
    mostrarToast('success', 'Orden eliminada', 'La orden fue eliminada exitosamente');
    await cargarOrdenes();
  } catch (error: any) {
    console.error('Error eliminando orden:', error);
    const mensaje = error?.data?.message || error?.response?.data?.message || 'No se pudo eliminar la orden';
    mostrarToast('error', 'Error', mensaje);
  }
}

function cerrarModal() {
  const modal = document.getElementById('modalOrdenFabricacion');
  if (modal) modal.style.display = 'none';
}

function cerrarModalSalida() {
  const modal = document.getElementById('modalSalidaFabricacion');
  if (modal) modal.style.display = 'none';
}

function cerrarModalCierre() {
  const modal = document.getElementById('modalCierreFabricacion');
  if (modal) modal.style.display = 'none';
}

function estadoClass(estado: string): string {
  if (estado === 'Confirmada') return 'success';
  if (estado === 'Programada') return 'warning';
  if (estado === 'Fabricada') return 'success';
  if (estado === 'Anulada') return 'danger';
  return 'neutral';
}

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtFecha(fecha: string): string {
  if (!fecha) return '—';
  const dt = new Date(fecha);
  if (Number.isNaN(dt.getTime())) return fecha;
  return dt.toLocaleDateString('es-PE');
}

function fmtHora(hora?: string | null): string {
  if (!hora) return '—';
  if (/^\d{2}:\d{2}/.test(hora)) return hora.slice(0, 5);
  const dt = new Date(hora);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
  return hora;
}

function fmtFechaHora(fechaHora: string): string {
  if (!fechaHora) return '—';
  const dt = new Date(fechaHora);
  if (Number.isNaN(dt.getTime())) return fechaHora;
  return `${dt.toLocaleDateString('es-PE')} ${dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
}

async function bindSalidasEvents() {
  document.querySelectorAll('[data-salida-detalle]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const idProgramacion = Number((e.currentTarget as HTMLElement).getAttribute('data-salida-detalle'));
      if (!idProgramacion) return;
      await abrirModalSalidaProgramacion(idProgramacion);
    });
  });

  document.querySelectorAll('[data-salida-confirmar]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const idProgramacion = Number((e.currentTarget as HTMLElement).getAttribute('data-salida-confirmar'));
      if (!idProgramacion) return;
      await abrirModalSalidaProgramacion(idProgramacion);
    });
  });
}

function bindCierresEvents() {
  document.querySelectorAll('[data-cierre-detalle]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const idProgramacion = Number((e.currentTarget as HTMLElement).getAttribute('data-cierre-detalle'));
      if (!idProgramacion) return;
      await abrirModalCierreFabricacion(idProgramacion);
    });
  });
}

async function abrirModalCierreFabricacion(idProgramacion: number) {
  const modal = document.getElementById('modalCierreFabricacion');
  const body = document.getElementById('modalCierreFabricacionBody');
  const titulo = document.getElementById('tituloModalCierreFabricacion');
  if (!modal || !body || !titulo) return;

  modal.style.display = 'flex';
  body.innerHTML = '<div class="sp-loading">Cargando programacion...</div>';

  try {
    const prog = cierreProgramacionData.find((p) => p.id === idProgramacion);
    if (!prog) {
      body.innerHTML = '<div class="sp-error">No se encontró la programación seleccionada.</div>';
      return;
    }

    titulo.textContent = `Cierre de ${prog.codigo_orden || `programación #${prog.id}`}`;
    body.innerHTML = `
      <div class="of-section of-section-tight">
        <div class="of-grid of-grid-header">
          <div><strong>Orden:</strong> ${prog.codigo_orden || '—'}</div>
          <div><strong>Fecha programada:</strong> ${fmtFecha(prog.fecha_programada)}</div>
          <div><strong>Técnico:</strong> ${prog.tecnico ? `${prog.tecnico.nombre || ''} ${prog.tecnico.apellido || ''}`.trim() : '—'}</div>
          <div class="of-grid-full"><strong>Motivo:</strong> ${prog.motivo_orden || '—'}</div>
        </div>
      </div>

      <form id="formCierreFabricacion" class="of-form">
        <section class="of-section of-section-tight">
          <h4 class="of-section-title">Productos terminados</h4>
          <div class="of-detalles-container">
            ${prog.productos_esperados.map((producto) => `
              <div class="of-detalle-row">
                <div>
                  <label class="prov-label">Producto</label>
                  <input class="prov-input" value="${producto.descripcion}" disabled>
                </div>
                <div>
                  <label class="prov-label">Cantidad producida *</label>
                  <input type="number" class="prov-input cierre-producto-cantidad" data-id-producto-final="${producto.id_producto_final}" min="0.001" step="0.001" value="${Number(producto.cantidad_esperada || 0)}">
                </div>
                <div>
                  <label class="prov-label">Esperada</label>
                  <input class="prov-input" value="${Number(producto.cantidad_esperada || 0)}" disabled>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="of-section of-section-tight">
          <div class="of-grid">
            <div class="of-grid-full">
              <label class="prov-label">Motivo si existe diferencia</label>
              <textarea class="prov-input" id="cierreMotivoDiferencia" rows="2" placeholder="Requerido si la cantidad producida no coincide"></textarea>
            </div>
            <div class="of-grid-full">
              <label class="prov-label"><input type="checkbox" id="cierreTieneSobranteMP"> Tiene sobrante de materia prima</label>
            </div>
          </div>
        </section>

        <section class="of-section of-section-tight" id="cierreDevolucionesSection" style="display:none;">
          <div class="of-section-head">
            <h4 class="of-section-title">Devolución de materia prima</h4>
          </div>
          <div class="of-detalles-container">
            ${prog.insumos_sugeridos.map((insumo) => `
              <div class="of-detalle-row">
                <div>
                  <label class="prov-label">Insumo</label>
                  <input class="prov-input" value="${insumo.descripcion}" disabled>
                </div>
                <div>
                  <label class="prov-label">Cantidad devuelta</label>
                  <input type="number" class="prov-input cierre-devolucion-cantidad" data-id-producto="${insumo.id_producto}" min="0" step="0.001" value="0">
                </div>
                <div>
                  <label class="prov-label">Sugerida</label>
                  <input class="prov-input" value="${Number(insumo.cantidad_requerida || 0)} ${insumo.unidad || ''}" disabled>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="of-section of-section-tight">
          <label class="prov-label">Observaciones</label>
          <textarea class="prov-input" id="cierreObservaciones" rows="2"></textarea>
        </section>

        <div class="prov-modal-footer">
          <button type="button" class="prov-btn-secondary" id="btnCancelarCierreFab">Cancelar</button>
          <button type="submit" class="prov-btn-primary" id="btnGuardarCierreFab" data-id-programacion="${prog.id}">Registrar cierre</button>
        </div>
      </form>
    `;

    document.getElementById('btnCancelarCierreFab')?.addEventListener('click', cerrarModalCierre);
    document.getElementById('cierreTieneSobranteMP')?.addEventListener('change', toggleDevolucionesSection);
    document.getElementById('formCierreFabricacion')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await registrarCierreFabricacion(idProgramacion);
    });
  } catch (error: any) {
    console.error('Error abriendo cierre de fabricacion:', error);
    const msg = error?.data?.message || error?.response?.data?.message || 'No se pudo cargar la programación';
    body.innerHTML = `<div class="sp-error">${msg}</div>`;
  }
}

function toggleDevolucionesSection() {
  const section = document.getElementById('cierreDevolucionesSection');
  const checkbox = document.getElementById('cierreTieneSobranteMP') as HTMLInputElement | null;
  if (!section || !checkbox) return;
  section.style.display = checkbox.checked ? '' : 'none';
}

async function registrarCierreFabricacion(idProgramacion: number) {
  const productos = Array.from(document.querySelectorAll('.cierre-producto-cantidad'))
    .map((input) => {
      const element = input as HTMLInputElement;
      return {
        id_producto_final: Number(element.dataset.idProductoFinal || 0),
        cantidad_producida: Number(element.value || 0),
      };
    })
    .filter((item) => item.id_producto_final > 0 && item.cantidad_producida > 0);

  if (!productos.length) {
    mostrarToast('warning', 'Validacion', 'Debe registrar al menos un producto terminado');
    return;
  }

  const tieneSobrante = (document.getElementById('cierreTieneSobranteMP') as HTMLInputElement | null)?.checked || false;
  const devoluciones = tieneSobrante
    ? Array.from(document.querySelectorAll('.cierre-devolucion-cantidad'))
        .map((input) => {
          const element = input as HTMLInputElement;
          return {
            id_producto: Number(element.dataset.idProducto || 0),
            cantidad_devuelta: Number(element.value || 0),
          };
        })
        .filter((item) => item.id_producto > 0 && item.cantidad_devuelta > 0)
    : [];

  const motivoDiferencia = ((document.getElementById('cierreMotivoDiferencia') as HTMLTextAreaElement | null)?.value || '').trim();
  const observaciones = ((document.getElementById('cierreObservaciones') as HTMLTextAreaElement | null)?.value || '').trim();
  const programacion = cierreProgramacionData.find((p) => p.id === idProgramacion);
  const expectedMap = new Map(programacion?.productos_esperados?.map((item) => [item.id_producto_final, Number(item.cantidad_esperada || 0)]) || []);
  const mismatch = productos.some((item) => Number(item.cantidad_producida || 0).toFixed(3) !== Number(expectedMap.get(item.id_producto_final) || 0).toFixed(3));

  if (mismatch && !motivoDiferencia) {
    mostrarToast('warning', 'Validacion', 'Debe indicar un motivo si la cantidad producida no coincide');
    return;
  }

  if (tieneSobrante && !devoluciones.length) {
    mostrarToast('warning', 'Validacion', 'Debe registrar al menos una devolucion cuando marca sobrante');
    return;
  }

  const ok = await confirmarAccion({
    titulo: 'Registrar cierre',
    mensaje: 'Se registrara la entrada del producto terminado y las devoluciones necesarias en Kardex.',
    tipo: 'warning',
    textoConfirmar: 'Registrar',
  });
  if (!ok) return;

  try {
    await ordenesFabricacionService.registrarEntradaDevolucion({
      id_programacion_fabricacion: idProgramacion,
      productos,
      motivo_diferencia: motivoDiferencia || undefined,
      tiene_sobrante_materia_prima: tieneSobrante,
      observaciones: observaciones || undefined,
      devoluciones,
    });

    mostrarToast('success', 'Cierre registrado', 'La entrada y la devolucion fueron registradas correctamente.');
    cerrarModalCierre();
    await cargarCierresFabricacion();
    await cargarOrdenes();
  } catch (error: any) {
    console.error('Error registrando cierre de fabricacion:', error);
    const msg = error?.data?.message || error?.response?.data?.message || 'No se pudo registrar el cierre';
    mostrarToast('error', 'Error', msg);
  }
}

async function abrirModalSalidaProgramacion(idProgramacion: number) {
  const modal = document.getElementById('modalSalidaFabricacion');
  const body = document.getElementById('modalSalidaFabricacionBody');
  const titulo = document.getElementById('tituloModalSalidaFabricacion');
  if (!modal || !body || !titulo) return;

  modal.style.display = 'flex';
  body.innerHTML = '<div class="sp-loading">Cargando programación...</div>';

  try {
    const prog = salidasProgramacionData.find((p) => p.id === idProgramacion);
    if (!prog) {
      body.innerHTML = '<div class="sp-error">No se encontró la programación seleccionada.</div>';
      return;
    }

    titulo.textContent = `Salida de ${prog.codigo_orden || `programación #${prog.id}`}`;
    body.innerHTML = `
      <div class="of-section of-section-tight">
        <div class="of-grid of-grid-header">
          <div><strong>Orden:</strong> ${prog.codigo_orden || '—'}</div>
          <div><strong>Fecha programada:</strong> ${fmtFecha(prog.fecha_programada)}</div>
          <div><strong>Técnico:</strong> ${prog.tecnico ? `${prog.tecnico.nombre || ''} ${prog.tecnico.apellido || ''}`.trim() : '—'}</div>
          <div class="of-grid-full"><strong>Motivo:</strong> ${prog.motivo_orden || '—'}</div>
        </div>
      </div>

      <div class="of-section of-section-tight">
        <h4 class="of-section-title">Insumos a entregar</h4>
        <div class="table-container">
          <table class="op-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Requerido</th>
                <th>Stock</th>
                <th>Salida</th>
              </tr>
            </thead>
            <tbody>
              ${prog.insumos.map((i) => `
                <tr>
                  <td>${i.descripcion}</td>
                  <td>${i.cantidad_sugerida_salida} ${i.unidad || ''}</td>
                  <td>${i.stock_disponible}</td>
                  <td>
                    <input type="number" class="prov-input of-salida-cantidad" data-id-producto="${i.id_producto}" min="1" step="1" value="${i.cantidad_sugerida_salida}" style="width:110px;">
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="of-section of-section-tight">
        <label class="prov-label">Observación</label>
        <textarea class="prov-input" id="ofSalidaObservacion" rows="2" placeholder="Observaciones de almacén"></textarea>
      </div>

      <div class="prov-modal-footer">
        <button type="button" class="prov-btn-secondary" id="btnCancelarSalidaFab">Cancelar</button>
        <button type="button" class="prov-btn-primary" id="btnConfirmarSalidaFab" data-id-programacion="${prog.id}" ${prog.salida_confirmada ? 'disabled' : ''}>
          ${prog.salida_confirmada ? 'Ya confirmada' : 'Confirmar salida'}
        </button>
      </div>
    `;

    document.getElementById('btnCancelarSalidaFab')?.addEventListener('click', cerrarModalSalida);
    document.getElementById('btnConfirmarSalidaFab')?.addEventListener('click', confirmarSalidaProgramacionFabricacion);
  } catch (error: any) {
    console.error('Error abriendo salida de programación de fabricación:', error);
    const msg = error?.data?.message || error?.response?.data?.message || 'No se pudo cargar la programación';
    body.innerHTML = `<div class="sp-error">${msg}</div>`;
  }
}

async function confirmarSalidaProgramacionFabricacion(e: Event) {
  const btn = e.currentTarget as HTMLButtonElement;
  const idProgramacion = Number(btn.dataset.idProgramacion || 0);
  if (!idProgramacion) return;

  const prog = salidasProgramacionData.find((p) => p.id === idProgramacion);
  if (!prog) return;

  const insumos = prog.insumos.map((insumo) => {
    const input = document.querySelector(`.of-salida-cantidad[data-id-producto="${insumo.id_producto}"]`) as HTMLInputElement | null;
    const cantidad = Number(input?.value || insumo.cantidad_sugerida_salida);
    return {
      id_producto: insumo.id_producto,
      cantidad_entregada: cantidad,
    };
  });

  if (insumos.some((i) => i.cantidad_entregada <= 0)) {
    mostrarToast('warning', 'Validacion', 'Las cantidades de salida deben ser mayores a 0');
    return;
  }

  const tieneStockInsuficiente = insumos.some((item) => {
    const insumo = prog.insumos.find((i) => i.id_producto === item.id_producto);
    return !!insumo && item.cantidad_entregada > insumo.stock_disponible;
  });

  if (tieneStockInsuficiente) {
    mostrarToast('warning', 'Stock insuficiente', 'Uno o mas insumos no tienen stock suficiente.');
    return;
  }

  const ok = await confirmarAccion({
    titulo: 'Confirmar salida',
    mensaje: 'Se registrara la salida en Kardex y se descontara stock automaticamente.',
    tipo: 'warning',
    textoConfirmar: 'Confirmar salida',
  });
  if (!ok) return;

  try {
    await ordenesFabricacionService.confirmarSalidaProgramacion({
      id_programacion: idProgramacion,
      insumos,
      observacion: (document.getElementById('ofSalidaObservacion') as HTMLTextAreaElement)?.value?.trim() || undefined,
    });

    mostrarToast('success', 'Salida confirmada', 'La salida se registró correctamente y el stock fue descontado.');
    cerrarModalSalida();
    await cargarSalidasProgramacion();
  } catch (error: any) {
    console.error('Error confirmando salida de fabricación:', error);
    const msg = error?.data?.message || error?.response?.data?.message || 'No se pudo confirmar la salida';
    mostrarToast('error', 'Error', msg);
  }
}
