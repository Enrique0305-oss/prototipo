import { confirmarAccion, mostrarToast } from '../../../shared/toast';
import {
  salidasProductosService,
  type OrdenProductoSalida,
  type OrdenProductoSalidaDetalle,
} from './salidas-productos.service';
import './salidas-productos.css';

let pendientes: OrdenProductoSalida[] = [];
let historial: OrdenProductoSalida[] = [];
let vistaActual: 'pendientes' | 'historial' = 'pendientes';
let filtroFechaDesde = '';
let filtroFechaHasta = '';

export function renderSalidasProductos(): string {
  return `
    <div style="padding:24px">
      <div class="prov-page-header">
        <div>
          <div class="prov-breadcrumb">Salidas de Productos</div>
          <div class="sp-subtitle">Confirma salida de ordenes de producto desde almacen y registra en Kardex</div>
        </div>
      </div>

      <div class="sp-tabs">
        <button class="sp-tab active" data-tab="pendientes">Pendientes de salida</button>
        <button class="sp-tab" data-tab="historial">Historial de salidas</button>
      </div>

      <div class="prov-filters-bar">
        <div class="prov-search-box" style="max-width:180px;flex:unset;">
          <input type="date" id="sp-prod-fecha-desde" class="prov-search-input" value="${filtroFechaDesde}">
        </div>
        <div class="prov-search-box" style="max-width:180px;flex:unset;">
          <input type="date" id="sp-prod-fecha-hasta" class="prov-search-input" value="${filtroFechaHasta}">
        </div>
        <button class="prov-btn-primary" id="sp-prod-btn-filtrar">Buscar</button>
        <button class="prov-btn-secondary" id="sp-prod-btn-limpiar">Limpiar</button>
      </div>

      <div id="sp-prod-content">
        <div class="sp-loading">Cargando...</div>
      </div>

      <div class="prov-modal" id="sp-prod-modal" style="display:none;">
        <div class="prov-modal-overlay" id="sp-prod-modal-overlay"></div>
        <div class="prov-modal-content prov-modal-lg">
          <div class="prov-modal-header">
            <h2>Confirmar salida de productos</h2>
            <button class="prov-modal-close" id="sp-prod-modal-close">&times;</button>
          </div>
          <div class="prov-modal-body" id="sp-prod-modal-body"></div>
        </div>
      </div>
    </div>
  `;
}

export async function initSalidasProductos() {
  await cargarPendientes();
  enlazarEventosBase();
}

function enlazarEventosBase() {
  document.querySelectorAll('.sp-tab').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const tab = (e.currentTarget as HTMLElement).dataset.tab as 'pendientes' | 'historial';
      if (!tab) return;

      vistaActual = tab;
      document.querySelectorAll('.sp-tab').forEach((x) => x.classList.remove('active'));
      (e.currentTarget as HTMLElement).classList.add('active');

      if (tab === 'pendientes') {
        await cargarPendientes();
      } else {
        await cargarHistorial();
      }
    });
  });

  document.getElementById('sp-prod-btn-filtrar')?.addEventListener('click', async () => {
    filtroFechaDesde = (document.getElementById('sp-prod-fecha-desde') as HTMLInputElement)?.value || '';
    filtroFechaHasta = (document.getElementById('sp-prod-fecha-hasta') as HTMLInputElement)?.value || '';

    if (vistaActual === 'pendientes') {
      await cargarPendientes();
    } else {
      await cargarHistorial();
    }
  });

  document.getElementById('sp-prod-btn-limpiar')?.addEventListener('click', async () => {
    filtroFechaDesde = '';
    filtroFechaHasta = '';
    const inputDesde = document.getElementById('sp-prod-fecha-desde') as HTMLInputElement;
    const inputHasta = document.getElementById('sp-prod-fecha-hasta') as HTMLInputElement;
    if (inputDesde) inputDesde.value = '';
    if (inputHasta) inputHasta.value = '';

    if (vistaActual === 'pendientes') {
      await cargarPendientes();
    } else {
      await cargarHistorial();
    }
  });
}

async function cargarPendientes() {
  const container = document.getElementById('sp-prod-content');
  if (!container) return;

  container.innerHTML = '<div class="sp-loading">Cargando pendientes...</div>';

  try {
    const params: any = {};
    if (filtroFechaDesde) params.fecha_desde = filtroFechaDesde;
    if (filtroFechaHasta) params.fecha_hasta = filtroFechaHasta;

    const res = await salidasProductosService.getPendientes(params);
    pendientes = res.data || [];

    if (!pendientes.length) {
      container.innerHTML = '<div class="sp-empty">No hay ordenes de producto pendientes de salida</div>';
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>ORDEN</th>
              <th>FECHA</th>
              <th>CLIENTE</th>
              <th>PRODUCTOS</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            ${pendientes.map((op) => {
              const cliente = op.cliente?.nombre_empresa || '—';
              const productos = op.detalles?.reduce((acc, d) => acc + (d.cantidad || 0), 0) || 0;
              return `
                <tr>
                  <td><strong>${op.numero_orden}</strong></td>
                  <td>${formatearFecha(op.fecha_envio)}</td>
                  <td>${cliente}</td>
                  <td>${productos}</td>
                  <td>
                    <button class="prov-btn-icon-sm" data-op-confirmar="${op.id}" title="Confirmar salida" style="color:#16a34a;border-color:#bbf7d0;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    enlazarEventosPendientes();
  } catch (error: any) {
    console.error('Error cargando pendientes de salidas de productos:', error);
    container.innerHTML = '<div class="sp-error">No se pudo cargar la informacion</div>';
  }
}

async function cargarHistorial() {
  const container = document.getElementById('sp-prod-content');
  if (!container) return;

  container.innerHTML = '<div class="sp-loading">Cargando historial...</div>';

  try {
    const params: any = {};
    if (filtroFechaDesde) params.fecha_desde = filtroFechaDesde;
    if (filtroFechaHasta) params.fecha_hasta = filtroFechaHasta;

    const res = await salidasProductosService.getHistorial(params);
    historial = res.data || [];

    if (!historial.length) {
      container.innerHTML = '<div class="sp-empty">No hay salidas confirmadas en el rango seleccionado</div>';
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>ORDEN</th>
              <th>FECHA ORDEN</th>
              <th>CLIENTE</th>
              <th>DETALLES</th>
              <th>SALIDA</th>
            </tr>
          </thead>
          <tbody>
            ${historial.map((op) => {
              const cliente = op.cliente?.nombre_empresa || '—';
              const productos = op.detalles?.reduce((acc, d) => acc + (d.cantidad || 0), 0) || 0;
              const fechaSalida = op.salidas_kardex?.[0]?.fecha_movimiento || '';
              return `
                <tr>
                  <td><strong>${op.numero_orden}</strong></td>
                  <td>${formatearFecha(op.fecha_envio)}</td>
                  <td>${cliente}</td>
                  <td>${productos} producto(s)</td>
                  <td>${fechaSalida ? formatearFechaHora(fechaSalida) : '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error: any) {
    console.error('Error cargando historial de salidas de productos:', error);
    container.innerHTML = '<div class="sp-error">No se pudo cargar el historial</div>';
  }
}

function enlazarEventosPendientes() {
  document.querySelectorAll('[data-op-confirmar]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).dataset.opConfirmar || '0', 10);
      if (!id) return;
      await abrirModalConfirmacion(id);
    });
  });
}

async function abrirModalConfirmacion(idOrdenProducto: number) {
  const modal = document.getElementById('sp-prod-modal');
  const body = document.getElementById('sp-prod-modal-body');
  if (!modal || !body) return;

  modal.style.display = 'flex';
  body.innerHTML = '<div class="sp-loading">Cargando detalle...</div>';

  try {
    const res = await salidasProductosService.getDetalle(idOrdenProducto);
    const orden = res.data;
    if (!orden) {
      body.innerHTML = '<div class="sp-error">No se encontro la orden</div>';
      return;
    }

    if ((orden.salidas_kardex || []).length > 0) {
      body.innerHTML = `
        <div class="sp-empty">La salida de esta orden ya fue confirmada.</div>
        <div class="prov-modal-footer">
          <button class="prov-btn-secondary" id="sp-prod-cerrar-ya-confirmada">Cerrar</button>
        </div>
      `;
      document.getElementById('sp-prod-cerrar-ya-confirmada')?.addEventListener('click', cerrarModal);
      enlazarEventosCerrarModal();
      return;
    }

    body.innerHTML = `
      <div class="sp-info-grid">
        <div class="sp-info-item"><strong>Orden:</strong> ${orden.numero_orden}</div>
        <div class="sp-info-item"><strong>Fecha envio:</strong> ${formatearFecha(orden.fecha_envio)}</div>
        <div class="sp-info-item"><strong>Cliente:</strong> ${orden.cliente?.nombre_empresa || '—'}</div>
      </div>

      <div class="sp-materiales-title">Productos a confirmar</div>
      <div class="sp-materiales-table">
        <table class="prov-detail-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad orden</th>
              <th>Disponible</th>
              <th>Cantidad salida</th>
            </tr>
          </thead>
          <tbody>
            ${(orden.detalles || []).map((det: OrdenProductoSalidaDetalle) => {
              const disponible = det.producto?.inventario?.cantidad_disponible || 0;
              const ok = disponible >= det.cantidad;
              return `
                <tr>
                  <td>${det.producto?.descripcion || 'Producto'}</td>
                  <td>${det.cantidad}</td>
                  <td style="color:${ok ? '#16a34a' : '#ef4444'};font-weight:600;">${disponible}</td>
                  <td>
                    <input
                      type="number"
                      class="prov-input-sm sp-prod-cantidad"
                      data-id-producto="${det.id_producto}"
                      value="${det.cantidad}"
                      min="1"
                      max="${det.cantidad}"
                      style="width:90px;"
                    >
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="sp-obs-group">
        <label>Observacion (opcional)</label>
        <textarea id="sp-prod-observacion" class="prov-input" rows="2" placeholder="Ejemplo: salida parcial por coordinacion de despacho"></textarea>
      </div>

      <div class="prov-modal-footer">
        <button class="prov-btn-secondary" id="sp-prod-btn-cancelar">Cancelar</button>
        <button class="prov-btn-success" id="sp-prod-btn-confirmar" data-id-orden="${orden.id}">
          Confirmar salida
        </button>
      </div>
    `;

    enlazarEventosCerrarModal();
    document.getElementById('sp-prod-btn-cancelar')?.addEventListener('click', cerrarModal);
    document.getElementById('sp-prod-btn-confirmar')?.addEventListener('click', confirmarSalidaOrden);
  } catch (error: any) {
    console.error('Error cargando detalle de orden de producto:', error);
    body.innerHTML = '<div class="sp-error">No se pudo cargar el detalle de la orden</div>';
    enlazarEventosCerrarModal();
  }
}

function enlazarEventosCerrarModal() {
  document.getElementById('sp-prod-modal-close')?.addEventListener('click', cerrarModal);
  document.getElementById('sp-prod-modal-overlay')?.addEventListener('click', cerrarModal);
}

function cerrarModal() {
  const modal = document.getElementById('sp-prod-modal');
  if (modal) modal.style.display = 'none';
}

async function confirmarSalidaOrden(e: Event) {
  const btn = e.currentTarget as HTMLButtonElement;
  const idOrden = parseInt(btn.dataset.idOrden || '0', 10);
  if (!idOrden) return;

  const detalles = Array.from(document.querySelectorAll('.sp-prod-cantidad') as NodeListOf<HTMLInputElement>).map((input) => ({
    id_producto: parseInt(input.dataset.idProducto || '0', 10),
    cantidad_entregada: parseInt(input.value || '0', 10),
  }));

  if (detalles.some((d) => !d.id_producto || d.cantidad_entregada <= 0)) {
    mostrarToast('warning', 'Validacion', 'Las cantidades de salida deben ser mayores a 0');
    return;
  }

  const ok = await confirmarAccion({
    titulo: 'Confirmar salida',
    mensaje: 'Se registrara la salida en Kardex y se descontara stock. Esta accion no registra devoluciones.',
    tipo: 'warning',
    textoConfirmar: 'Si, confirmar',
  });

  if (!ok) return;

  const observacion = (document.getElementById('sp-prod-observacion') as HTMLTextAreaElement)?.value || '';

  btn.disabled = true;
  btn.textContent = 'Procesando...';

  try {
    await salidasProductosService.confirmarSalida({
      id_orden_producto: idOrden,
      detalles,
      observacion,
    });

    mostrarToast('success', 'Salida confirmada', 'La salida fue registrada en Kardex');
    cerrarModal();

    if (vistaActual === 'pendientes') {
      await cargarPendientes();
    } else {
      await cargarHistorial();
    }
  } catch (error: any) {
    console.error('Error confirmando salida de orden producto:', error);
    const msg = error?.response?.data?.message || 'No se pudo confirmar la salida';
    mostrarToast('error', 'Error', msg);
    btn.disabled = false;
    btn.textContent = 'Confirmar salida';
  }
}

function formatearFecha(fecha: string): string {
  if (!fecha) return '—';

  // Intenta parsear ISO completo (ej: 2026-04-08T05:00:00.000000Z)
  const dt = new Date(fecha);
  if (!Number.isNaN(dt.getTime())) {
    const dia = `${dt.getDate()}`.padStart(2, '0');
    const mes = `${dt.getMonth() + 1}`.padStart(2, '0');
    const anio = dt.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Fallback para formato YYYY-MM-DD
  const base = fecha.slice(0, 10);
  const partes = base.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearFechaHora(valor: string): string {
  if (!valor) return '—';
  const dt = new Date(valor);
  if (Number.isNaN(dt.getTime())) return valor;
  const dia = `${dt.getDate()}`.padStart(2, '0');
  const mes = `${dt.getMonth() + 1}`.padStart(2, '0');
  const anio = dt.getFullYear();
  const hh = `${dt.getHours()}`.padStart(2, '0');
  const mm = `${dt.getMinutes()}`.padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hh}:${mm}`;
}
