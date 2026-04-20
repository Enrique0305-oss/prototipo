// Comercial - Órdenes de Auditoría (independiente)
import '../ordenes-asesoria/ordenes-asesoria.css';
import { ordenAuditoriaService } from '../../../services/ordenAuditoriaService';
import { exponenteService, type Exponente } from '../../../services/exponenteService';
import { mostrarToast } from '../../../shared/toast';
import { getApiErrorDebugInfo } from '../../../core/api/api.client';

let ordenesData: any[] = [];
let cotizacionesDisponibles: any[] = [];
let exponentesData: Exponente[] = [];
let selectedExponentes: { id: number; nombre: string }[] = [];

function logApiError(contexto: string, error: unknown) {
  console.error(contexto, getApiErrorDebugInfo(error));
}

function formatearFecha(valor: any): string {
  if (!valor) return '-';
  const texto = String(valor).trim();
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return texto.split('T')[0] || '-';
}

function renderTagsExponentes() {
  const cont = document.getElementById('oa-exponentes-tags');
  if (!cont) return;
  if (selectedExponentes.length === 0) {
    cont.innerHTML = '<span style="color:#94a3b8;font-size:13px;">Ningún exponente seleccionado</span>';
    return;
  }

  cont.innerHTML = selectedExponentes.map((e) =>
    `<span style="display:inline-flex;align-items:center;gap:4px;background:#eef2ff;color:#4338ca;border-radius:6px;padding:4px 10px;font-size:13px;font-weight:500;">
      ${e.nombre}
      <button type="button" class="oa-remove-exp" data-id="${e.id}" style="background:none;border:none;cursor:pointer;color:#4338ca;font-size:16px;line-height:1;padding:0 2px;font-weight:700;">&times;</button>
    </span>`
  ).join('');

  cont.querySelectorAll('.oa-remove-exp').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      selectedExponentes = selectedExponentes.filter((e) => e.id !== id);
      renderTagsExponentes();
      actualizarSelectorExponentes();
    });
  });
}

function actualizarSelectorExponentes() {
  const select = document.getElementById('oa-exponente-selector') as HTMLSelectElement | null;
  if (!select) return;
  const selectedIds = selectedExponentes.map((e) => e.id);
  const disponibles = exponentesData.filter((e) => !selectedIds.includes(e.id));
  select.innerHTML = '<option value="">+ Agregar exponente...</option>' + disponibles.map((e) =>
    `<option value="${e.id}">${e.nombre} ${e.apellidos || ''} — ${e.especialidad || ''}</option>`
  ).join('');
}

function calcularDesglose() {
  const costo = Number((document.getElementById('oa-costo') as HTMLInputElement)?.value || 0);
  const incluyeIgv = (document.getElementById('oa-igv') as HTMLSelectElement)?.value !== '0';
  const subtotal = costo;
  const igv = incluyeIgv ? subtotal * 0.18 : 0;
  const total = subtotal + igv;
  const el = (id: string, val: string) => { const node = document.getElementById(id); if (node) node.textContent = val; };
  el('oa-display-subtotal', `S/ ${subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
  el('oa-display-igv', `S/ ${igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
  el('oa-display-total', `S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
}

function limpiarFormulario() {
  (document.getElementById('oa-edit-id') as HTMLInputElement).value = '';
  (document.getElementById('oa-numero-orden') as HTMLInputElement).value = '';
  (document.getElementById('oa-cotizacion-ref') as HTMLSelectElement).value = '';
  (document.getElementById('oa-cliente-nombre') as HTMLInputElement).value = '';
  (document.getElementById('oa-cliente-id') as HTMLInputElement).value = '';
  (document.getElementById('oa-cliente-ruc') as HTMLInputElement).value = '';
  (document.getElementById('oa-servicio-nombre') as HTMLInputElement).value = '';
  (document.getElementById('oa-servicio-id') as HTMLInputElement).value = '';
  (document.getElementById('oa-fecha-servicio') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
  (document.getElementById('oa-fecha-aceptacion') as HTMLInputElement).value = '';
  (document.getElementById('oa-hora-servicio') as HTMLInputElement).value = '';
  (document.getElementById('oa-hora-fin') as HTMLInputElement).value = '';
  (document.getElementById('oa-modalidad') as HTMLSelectElement).value = 'Presencial';
  (document.getElementById('oa-duracion-dias') as HTMLInputElement).value = '1';
  (document.getElementById('oa-igv') as HTMLSelectElement).value = '1';
  (document.getElementById('oa-costo') as HTMLInputElement).value = '0.00';
  (document.getElementById('oa-observaciones') as HTMLTextAreaElement).value = '';
  selectedExponentes = [];
  renderTagsExponentes();
  actualizarSelectorExponentes();
  calcularDesglose();
}

async function cargarEstadisticas() {
  try {
    const res = await ordenAuditoriaService.getEstadisticas();
    const raw = (res as any).data || res;
    const stats = (raw as any).data || raw;
    const set = (id: string, val: any) => { const el = document.getElementById(id); if (el) el.textContent = String(val ?? 0); };
    set('oa-stat-total', stats.total_ordenes ?? 0);
    set('oa-stat-valor', `S/ ${Number(stats.total_valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    set('oa-stat-mes', stats.ordenes_mes_actual ?? 0);
  } catch (error) {
    logApiError('Error cargando estadísticas auditoría:', error);
  }
}

async function cargarCotizaciones() {
  const select = document.getElementById('oa-cotizacion-ref') as HTMLSelectElement | null;
  if (!select) return;
  try {
    const res = await ordenAuditoriaService.getCotizacionesDisponibles();
    const raw = (res as any).data || res;
    cotizacionesDisponibles = Array.isArray((raw as any).data || raw) ? ((raw as any).data || raw) : [];
    select.innerHTML = '<option value="">Seleccione una cotización...</option>' + cotizacionesDisponibles.map((c) =>
      `<option value="${c.id}">${c.numero_cotizacion} - ${c.cliente?.nombre_empresa || c.cliente_nombre || ''} (S/ ${Number(c.total || 0).toFixed(2)})</option>`
    ).join('');
  } catch (error) {
    logApiError('Error cargando cotizaciones auditoría:', error);
    select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

async function cargarExponentes() {
  try {
    const res = await exponenteService.getAll({ estado: 'Activo' });
    const raw = (res as any).data || res;
    exponentesData = Array.isArray((raw as any).data || raw) ? ((raw as any).data || raw) : [];
    actualizarSelectorExponentes();
  } catch (error) {
    logApiError('Error cargando exponentes:', error);
  }
}

async function cargarOrdenes() {
  const tbody = document.getElementById('oa-tabla-body');
  if (!tbody) return;
  try {
    const params: any = {};
    const search = (document.getElementById('oa-search') as HTMLInputElement)?.value?.trim();
    const modalidad = (document.getElementById('oa-filter-modalidad') as HTMLSelectElement)?.value;
    const desde = (document.getElementById('oa-filter-desde') as HTMLInputElement)?.value;
    const hasta = (document.getElementById('oa-filter-hasta') as HTMLInputElement)?.value;
    if (search) params.search = search;
    if (modalidad) params.modalidad = modalidad;
    if (desde) params.fecha_desde = desde;
    if (hasta) params.fecha_hasta = hasta;

    const res = await ordenAuditoriaService.getAll(params);
    const raw = (res as any).data || res;
    ordenesData = Array.isArray((raw as any).data || raw) ? ((raw as any).data || raw) : [];

    if (ordenesData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#64748b;">No se encontraron órdenes de auditoría</td></tr>';
      return;
    }

    tbody.innerHTML = ordenesData.map((o) => {
      const costo = Number(o.costo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      const horario = o.hora_servicio ? `${String(o.hora_servicio).slice(0, 5)}${o.hora_fin_auditoria ? ` a ${String(o.hora_fin_auditoria).slice(0, 5)}` : ''}` : (o.hora_fin_auditoria ? `— a ${String(o.hora_fin_auditoria).slice(0, 5)}` : '-');
      const tipoExp = o.exponentes && o.exponentes.length > 0 ? o.exponentes.map((e: any) => e.nombre).join(', ') : '-';
      return `
        <tr>
          <td><strong>${o.numero_orden || ''}</strong></td>
          <td>${o.cliente?.nombre_empresa || '-'}</td>
          <td>${o.cotizacion?.numero_cotizacion || '-'}</td>
          <td><div>${formatearFecha(o.fecha_servicio)}</div><small style="color:#64748b;">${o.hora_servicio ? String(o.hora_servicio).slice(0, 5) : '--'} a ${o.hora_fin_auditoria ? String(o.hora_fin_auditoria).slice(0, 5) : '--'}</small></td>
          <td><span class="oc-badge oc-badge-cyan">${o.modalidad || '-'}</span></td>
          <td style="text-align:center;">${o.duracion_dias ?? '-'}</td>
          <td style="text-align:center;">${horario}</td>
          <td><strong>S/ ${costo}</strong></td>
          <td><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#dcfce7;color:#166534;">${o.estado || 'Aprobado'}</span></td>
          <td>
            <div class="oc-action-buttons">
              <button class="oc-btn-icon oa-btn-edit" data-id="${o.id}" title="Ver/Editar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="oc-btn-icon oa-btn-pdf" data-id="${o.id}" data-numero="${o.numero_orden || ''}" title="Descargar PDF" style="color:#7c3aed;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>
              </button>
              <button class="oc-btn-icon oa-btn-del" data-id="${o.id}" title="Eliminar" style="color:#ef4444;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.oa-btn-edit').forEach((btn) => btn.addEventListener('click', () => abrirEditar(Number((btn as HTMLElement).dataset.id))));
    document.querySelectorAll('.oa-btn-pdf').forEach((btn) => btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const numero = (btn as HTMLElement).dataset.numero || '';
      try {
        await ordenAuditoriaService.downloadPDF(id);
        mostrarToast('success', 'PDF', 'PDF descargado: ' + numero);
      } catch (error) {
        console.error(error);
        mostrarToast('error', 'PDF', 'Error al generar el PDF');
      }
    }));
    document.querySelectorAll('.oa-btn-del').forEach((btn) => btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      if (!confirm('¿Eliminar esta orden de auditoría?')) return;
      try {
        await ordenAuditoriaService.delete(id);
        mostrarToast('success', 'Eliminada', 'Orden de auditoría eliminada');
        await cargarOrdenes();
        await cargarEstadisticas();
      } catch (error: any) {
        console.error(error);
        mostrarToast('error', 'Error', error?.data?.message || 'No se pudo eliminar');
      }
    }));
  } catch (error) {
    logApiError('Error cargando órdenes de auditoría:', error);
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar órdenes</td></tr>';
  }
}

async function cargarDesdeCotizacion(cotizacionId: number) {
  const res = await ordenAuditoriaService.getDesdeCotizacion(cotizacionId);
  const raw = (res as any).data || res;
  const data = (raw as any).data || raw;

  (document.getElementById('oa-cliente-nombre') as HTMLInputElement).value = data.cliente?.nombre_empresa || '';
  (document.getElementById('oa-cliente-id') as HTMLInputElement).value = String(data.cliente?.id || '');
  (document.getElementById('oa-cliente-ruc') as HTMLInputElement).value = data.cliente?.ruc || '';
  (document.getElementById('oa-servicio-nombre') as HTMLInputElement).value = data.servicio?.nombre || '';
  (document.getElementById('oa-servicio-id') as HTMLInputElement).value = String(data.servicio?.id_servicio || data.servicio?.id || '');
  (document.getElementById('oa-fecha-aceptacion') as HTMLInputElement).value = data.cotizacion?.fecha_aceptacion || data.cotizacion?.fecha_emision || '';
  (document.getElementById('oa-fecha-servicio') as HTMLInputElement).value = data.detalles?.[0]?.fecha_servicio || new Date().toISOString().split('T')[0];
  (document.getElementById('oa-duracion-dias') as HTMLInputElement).value = String(data.duracion_dias || data.detalles?.[0]?.meses_implementacion || 1);
  (document.getElementById('oa-hora-servicio') as HTMLInputElement).value = data.hora_servicio || data.horario_auditoria?.inicio || '';
  (document.getElementById('oa-hora-fin') as HTMLInputElement).value = data.hora_fin_auditoria || data.horario_auditoria?.fin || '';
  (document.getElementById('oa-costo') as HTMLInputElement).value = Number(data.costo_total || 0).toFixed(2);
  const detalle = data.servicio?.modalidad_sugerida;
  if (detalle) {
    const modalidad = (detalle === 'Hibrido' ? 'Híbrido' : detalle === 'Asincrona' ? 'Asíncrona' : detalle);
    (document.getElementById('oa-modalidad') as HTMLSelectElement).value = modalidad;
  }

  selectedExponentes = Array.isArray(data.exponentes)
    ? data.exponentes.map((e: any) => ({ id: Number(e.id), nombre: `${e.nombre} ${e.apellidos || ''}`.trim() }))
    : [];
  renderTagsExponentes();
  actualizarSelectorExponentes();

  const detallesInfo = document.getElementById('oa-detalles-info');
  if (detallesInfo) {
    detallesInfo.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><strong>Duración:</strong> ${data.duracion_dias || 1} día(s)</div>
        <div><strong>Horario:</strong> ${(data.hora_servicio || data.horario_auditoria?.inicio || '--')} a ${(data.hora_fin_auditoria || data.horario_auditoria?.fin || '--')}</div>
      </div>
    `;
    detallesInfo.style.display = 'block';
  }
}

function abrirNueva() {
  limpiarFormulario();
  const userRaw = sessionStorage.getItem('qsci_user');
  if (userRaw) {
    const user = JSON.parse(userRaw);
    const emitidoPorInput = document.getElementById('oa-emitido-por') as HTMLInputElement | null;
    if (emitidoPorInput) {
      emitidoPorInput.value = `${user.nombre || ''} ${user.apellido || ''}`.trim();
    }
    const idUsuarioInput = document.getElementById('oa-id-usuario') as HTMLInputElement | null;
    if (idUsuarioInput) {
      idUsuarioInput.value = String(user.id || '');
    }
  }
  (document.getElementById('oa-modal-title') as HTMLElement).textContent = 'Nueva Orden de Auditoría';
  const modal = document.getElementById('oa-modal') as HTMLElement;
  modal.style.display = 'flex';
}

async function abrirEditar(id: number) {
  try {
    limpiarFormulario();
    await Promise.all([cargarCotizaciones(), cargarExponentes()]);
    const res = await ordenAuditoriaService.getById(id);
    const raw = (res as any).data || res;
    const orden = (raw as any).data || raw;
    (document.getElementById('oa-modal-title') as HTMLElement).textContent = 'Ver / Editar Orden de Auditoría';
    (document.getElementById('oa-edit-id') as HTMLInputElement).value = String(orden.id);
    (document.getElementById('oa-numero-orden') as HTMLInputElement).value = orden.numero_orden || '';
    (document.getElementById('oa-cotizacion-ref') as HTMLSelectElement).value = String(orden.id_cotizacion || '');
    (document.getElementById('oa-cotizacion-ref') as HTMLSelectElement).disabled = true;
    (document.getElementById('oa-cliente-nombre') as HTMLInputElement).value = orden.cliente?.nombre_empresa || '';
    (document.getElementById('oa-cliente-id') as HTMLInputElement).value = String(orden.id_cliente || '');
    (document.getElementById('oa-cliente-ruc') as HTMLInputElement).value = orden.cliente?.ruc || '';
    (document.getElementById('oa-servicio-nombre') as HTMLInputElement).value = orden.servicio?.nombre || '';
    (document.getElementById('oa-servicio-id') as HTMLInputElement).value = String(orden.id_servicio || '');
    (document.getElementById('oa-fecha-servicio') as HTMLInputElement).value = (orden.fecha_servicio || '').split('T')[0] || '';
    (document.getElementById('oa-fecha-aceptacion') as HTMLInputElement).value = (orden.fecha_aceptacion || '').split('T')[0] || '';
    (document.getElementById('oa-hora-servicio') as HTMLInputElement).value = orden.hora_servicio || '';
    (document.getElementById('oa-hora-fin') as HTMLInputElement).value = orden.hora_fin_auditoria || '';
    (document.getElementById('oa-modalidad') as HTMLSelectElement).value = orden.modalidad || 'Presencial';
    (document.getElementById('oa-duracion-dias') as HTMLInputElement).value = String(orden.duracion_dias || 1);
    (document.getElementById('oa-costo') as HTMLInputElement).value = Number(orden.subtotal || orden.costo || 0).toFixed(2);
    (document.getElementById('oa-igv') as HTMLSelectElement).value = orden.incluye_igv ? '1' : '0';
    (document.getElementById('oa-observaciones') as HTMLTextAreaElement).value = orden.observaciones || '';
    selectedExponentes = Array.isArray(orden.exponentes) ? orden.exponentes.map((e: any) => ({ id: e.id, nombre: `${e.nombre} ${e.apellidos || ''}`.trim() })) : [];
    renderTagsExponentes();
    actualizarSelectorExponentes();
    calcularDesglose();
    (document.getElementById('oa-modal') as HTMLElement).style.display = 'flex';
  } catch (error: any) {
    logApiError('Error al cargar orden de auditoría:', error);
    mostrarToast('error', 'Error', error?.data?.message || 'No se pudo cargar la orden');
  }
}

async function guardar() {
  const editId = Number((document.getElementById('oa-edit-id') as HTMLInputElement).value || 0);
  const payload = {
    id_cotizacion: Number((document.getElementById('oa-cotizacion-ref') as HTMLSelectElement).value || 0),
    id_servicio: (document.getElementById('oa-servicio-id') as HTMLInputElement).value ? Number((document.getElementById('oa-servicio-id') as HTMLInputElement).value) : null,
    exponentes: selectedExponentes.map((e) => e.id),
    fecha_servicio: (document.getElementById('oa-fecha-servicio') as HTMLInputElement).value,
    fecha_aceptacion: (document.getElementById('oa-fecha-aceptacion') as HTMLInputElement).value || null,
    hora_servicio: (document.getElementById('oa-hora-servicio') as HTMLInputElement).value || null,
    hora_fin_auditoria: (document.getElementById('oa-hora-fin') as HTMLInputElement).value || null,
    modalidad: (document.getElementById('oa-modalidad') as HTMLSelectElement).value,
    duracion_dias: Number((document.getElementById('oa-duracion-dias') as HTMLInputElement).value || 1),
    costo: Number((document.getElementById('oa-costo') as HTMLInputElement).value || 0),
    incluye_igv: (document.getElementById('oa-igv') as HTMLSelectElement).value !== '0',
    observaciones: (document.getElementById('oa-observaciones') as HTMLTextAreaElement).value.trim() || null,
  };

  if (!payload.id_cotizacion || !payload.fecha_servicio || !payload.modalidad) {
    mostrarToast('warning', 'Campos obligatorios', 'Seleccione una cotización y complete los datos requeridos');
    return;
  }

  try {
    if (editId) {
      await ordenAuditoriaService.update(editId, payload);
      mostrarToast('success', 'Actualizada', 'Orden de auditoría actualizada');
    } else {
      await ordenAuditoriaService.create(payload);
      mostrarToast('success', 'Creada', 'Orden de auditoría creada');
    }
    (document.getElementById('oa-modal') as HTMLElement).style.display = 'none';
    await cargarOrdenes();
    await cargarEstadisticas();
  } catch (error: any) {
    logApiError('Error al guardar orden de auditoría:', error);
    mostrarToast('error', 'Error', error?.data?.message || 'No se pudo guardar la orden');
  }
}

function bindEvents() {
  document.getElementById('oa-btn-nueva')?.addEventListener('click', abrirNueva);
  document.getElementById('oa-modal-close')?.addEventListener('click', () => ((document.getElementById('oa-modal') as HTMLElement).style.display = 'none'));
  document.getElementById('oa-modal-cancel')?.addEventListener('click', () => ((document.getElementById('oa-modal') as HTMLElement).style.display = 'none'));
  document.getElementById('oa-save')?.addEventListener('click', guardar);
  document.getElementById('oa-cotizacion-ref')?.addEventListener('change', async (e) => {
    const cotizacionId = Number((e.target as HTMLSelectElement).value || 0);
    if (!cotizacionId) return;
    try {
      await cargarDesdeCotizacion(cotizacionId);
    } catch (error: any) {
      mostrarToast('error', 'Error', error?.data?.message || 'No se pudo cargar la cotización');
    }
  });
  document.getElementById('oa-exponente-selector')?.addEventListener('change', async (e) => {
    const value = (e.target as HTMLSelectElement).value;
    if (!value) return;
    const id = Number(value);
    const exp = exponentesData.find((x) => x.id === id);
    if (exp && !selectedExponentes.find((x) => x.id === id)) {
      selectedExponentes.push({ id, nombre: `${exp.nombre} ${exp.apellidos || ''}`.trim() });
      renderTagsExponentes();
      actualizarSelectorExponentes();
    }
    (e.target as HTMLSelectElement).value = '';
  });
  ['oa-search', 'oa-filter-modalidad', 'oa-filter-desde', 'oa-filter-hasta'].forEach((id) => document.getElementById(id)?.addEventListener('input', () => cargarOrdenes()));
  document.getElementById('oa-filter-btn')?.addEventListener('click', cargarOrdenes);
  document.getElementById('oa-costo')?.addEventListener('input', calcularDesglose);
  document.getElementById('oa-igv')?.addEventListener('change', calcularDesglose);
}

export function renderComercialOrdenesAuditoria() {
  return `
  <div class="oc-main-container">
    <div class="oc-header">
      <div class="oc-header-top">
        <h1 class="oc-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          Órdenes de Auditoría
        </h1>
        <button class="oc-btn-primary" id="oa-btn-nueva">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Orden de Auditoría
        </button>
      </div>
      <div class="oc-stats-grid">
        <div class="oc-stat-card"><div class="oc-stat-icon oc-stat-blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></div><div class="oc-stat-info"><span class="oc-stat-label">Total Órdenes</span><span class="oc-stat-value" id="oa-stat-total">-</span></div></div>
        <div class="oc-stat-card"><div class="oc-stat-icon oc-stat-green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div><div class="oc-stat-info"><span class="oc-stat-label">Valor Total</span><span class="oc-stat-value" id="oa-stat-valor">-</span></div></div>
        <div class="oc-stat-card"><div class="oc-stat-icon oc-stat-success"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div><div class="oc-stat-info"><span class="oc-stat-label">Órdenes este Mes</span><span class="oc-stat-value" id="oa-stat-mes">-</span></div></div>
      </div>
    </div>
    <div class="oc-filters-bar">
      <div class="oc-search-box"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg><input type="text" id="oa-search" placeholder="Buscar orden de auditoría..." class="oc-search-input"></div>
      <div class="oc-filter-group"><select class="oc-filter-select" id="oa-filter-modalidad"><option value="">Todas las modalidades</option><option value="Presencial">Presencial</option><option value="Virtual">Virtual</option><option value="Híbrido">Híbrido</option></select><input type="date" class="oc-filter-select" id="oa-filter-desde"><input type="date" class="oc-filter-select" id="oa-filter-hasta"><button class="oc-btn-secondary" id="oa-filter-btn">Filtrar</button></div>
    </div>
    <div class="oc-table-container">
      <table class="oc-table"><thead><tr><th>N° Orden</th><th>Cliente</th><th>Cotización</th><th>Fecha Auditoría</th><th>Modalidad</th><th>Días</th><th>Horas</th><th>Costo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="oa-tabla-body"><tr><td colspan="10" style="text-align:center;padding:40px;color:#64748b;">Cargando...</td></tr></tbody></table>
    </div>
    <div class="oc-form-overlay" id="oa-modal" style="display:none;">
      <div class="oc-form-card" style="max-width:950px;">
        <div class="oc-form-header">
          <h2 class="oc-form-title" id="oa-modal-title">Nueva Orden de Auditoría</h2>
          <button class="oc-btn-close" id="oa-modal-close">×</button>
        </div>
        <div class="oc-form-content">
          <input type="hidden" id="oa-edit-id">
          <input type="hidden" id="oa-id-usuario">
          <div class="oc-section"><h3 class="oc-section-title">Información General</h3><div class="oc-grid"><div class="oc-field"><label class="oc-label">N° Orden</label><input type="text" id="oa-numero-orden" class="oc-input" readonly></div><div class="oc-field"><label class="oc-label">Cotización Referencia <span class="oc-required">*</span></label><select id="oa-cotizacion-ref" class="oc-input"><option value="">Seleccione una cotización...</option></select></div><div class="oc-field"><label class="oc-label">Cliente</label><input type="text" id="oa-cliente-nombre" class="oc-input" readonly><input type="hidden" id="oa-cliente-id"></div><div class="oc-field"><label class="oc-label">RUC</label><input type="text" id="oa-cliente-ruc" class="oc-input" readonly></div></div></div>
          <div class="oc-section"><h3 class="oc-section-title">Datos de la Auditoría</h3><div class="oc-grid"><div class="oc-field"><label class="oc-label">Servicio / Auditoría</label><input type="text" id="oa-servicio-nombre" class="oc-input" readonly><input type="hidden" id="oa-servicio-id"></div><div class="oc-field"><label class="oc-label">Fecha de Auditoría <span class="oc-required">*</span></label><input type="date" id="oa-fecha-servicio" class="oc-input"></div><div class="oc-field"><label class="oc-label">Fecha de Aceptación</label><input type="date" id="oa-fecha-aceptacion" class="oc-input" disabled></div><div class="oc-field"><label class="oc-label">Hora inicio</label><input type="time" id="oa-hora-servicio" class="oc-input"></div><div class="oc-field"><label class="oc-label">Hora fin</label><input type="time" id="oa-hora-fin" class="oc-input"></div><div class="oc-field"><label class="oc-label">Modalidad <span class="oc-required">*</span></label><select id="oa-modalidad" class="oc-input"><option value="Presencial">Presencial</option><option value="Virtual">Virtual</option><option value="Híbrido">Híbrido</option><option value="Asíncrona">Asíncrona</option></select></div><div class="oc-field"><label class="oc-label">Duración (días)</label><input type="number" id="oa-duracion-dias" class="oc-input" min="1" value="1"></div><div class="oc-field" style="grid-column: 1 / -1;"><label class="oc-label">Exponente(s)</label><div id="oa-exponentes-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;"></div><select id="oa-exponente-selector" class="oc-input"><option value="">+ Agregar exponente...</option></select></div></div></div>
          <div id="oa-detalles-info" style="display:none;margin-bottom:20px;"></div>
          <div class="oc-section"><h3 class="oc-section-title">Costos</h3><div class="oc-grid"><div class="oc-field"><label class="oc-label">IGV (18%)</label><select id="oa-igv" class="oc-input"><option value="1" selected>Sí - Con IGV</option><option value="0">No - Sin IGV</option></select></div><div class="oc-field"><label class="oc-label">Subtotal <span class="oc-required">*</span></label><input type="number" id="oa-costo" class="oc-input" min="0" step="0.01" value="0.00"></div></div><div id="oa-desglose-costos" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-top:8px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="color:#64748b;font-size:13px;">Subtotal:</span><span style="font-weight:500;color:#1e293b;" id="oa-display-subtotal">S/ 0.00</span></div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="color:#64748b;font-size:13px;">IGV (18%):</span><span style="font-weight:500;color:#1e293b;" id="oa-display-igv">S/ 0.00</span></div><div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;padding-top:8px;"><span style="font-weight:600;color:#0f172a;font-size:14px;">Total:</span><span style="font-weight:700;color:#0f172a;font-size:16px;" id="oa-display-total">S/ 0.00</span></div><div class="oc-field" style="grid-column: 1 / -1;"><label class="oc-label">Observaciones</label><textarea id="oa-observaciones" class="oc-input" rows="3" placeholder="Observaciones adicionales..."></textarea></div></div></div>
        </div>
        <div class="oc-form-actions" style="padding:20px 28px;"><button type="button" class="oc-btn-cancel" id="oa-modal-cancel">Cancelar</button><button type="button" class="oc-btn-submit" id="oa-save">Guardar Orden</button></div>
      </div>
    </div>
  </div>`;
}

export function initOrdenesAuditoriaEvents() {
  bindEvents();
  void Promise.all([cargarEstadisticas(), cargarOrdenes(), cargarCotizaciones(), cargarExponentes()]);
}