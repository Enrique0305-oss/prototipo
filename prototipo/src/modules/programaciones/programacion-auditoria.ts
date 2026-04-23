import { ordenAuditoriaService } from '../../services/ordenAuditoriaService';
import { mostrarToast } from '../../shared/toast';

const STORAGE_KEY = 'programaciones_auditoria_locales';

let auditoriasDisponibles: any[] = [];
let personalData: { id: number; nombre: string; apellidos: string }[] = [];
let tecnicosConductoresData: any[] = [];
let exponentesSeleccionadosIds: number[] = [];
let exponentesCatalogo: any[] = [];
let orderSeleccionada: any = null;

function normalizarFechaParaInput(fecha: any): string {
  if (!fecha) return '';
  const texto = String(fecha).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) return texto.slice(0, 10);
  const parsed = new Date(texto);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizarHoraParaInput(hora: any): string {
  if (!hora) return '';
  const texto = String(hora).trim();
  if (texto.includes('T')) {
    const partes = texto.split('T');
    return partes[1]?.slice(0, 5) || '';
  }
  return texto.slice(0, 5);
}

function nombreExponente(e: any): string {
  return `${e?.nombre || ''} ${e?.apellidos || ''}`.trim() || 'Exponente';
}

function leerProgramacionesLocales(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarProgramacionesLocales(items: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function guardarProgramacionLocal(item: any) {
  const actuales = leerProgramacionesLocales();
  actuales.unshift(item);
  guardarProgramacionesLocales(actuales);
}

function renderChipsExponentes(exponentes: any[]): string {
  if (!exponentes.length) return '<span style="color:#94a3b8;font-size:12px;">Sin exponentes registrados</span>';
  return exponentes.map((e) => `<span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:999px;padding:3px 8px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${nombreExponente(e)}</span>`).join('');
}

function obtenerOpcionesExponentesAuditoria(order: any): any[] {
  const mapa = new Map<number, any>();
  const deOrden = Array.isArray(order?.exponentes) ? order.exponentes : [];

  exponentesCatalogo.forEach((e: any) => {
    const id = Number(e?.id);
    if (id > 0) mapa.set(id, e);
  });

  deOrden.forEach((e: any) => {
    const id = Number(e?.id);
    if (id > 0) mapa.set(id, e);
  });

  return Array.from(mapa.values());
}

function renderExponentesEditableAuditoria(order: any) {
  const contenedor = document.getElementById('auditoriaExponentesVista');
  const selectAgregar = document.getElementById('auditoriaAgregarExponente') as HTMLSelectElement | null;
  if (!contenedor || !selectAgregar) return;

  const opciones = obtenerOpcionesExponentesAuditoria(order);
  const seleccionados = opciones.filter((e: any) => exponentesSeleccionadosIds.includes(Number(e.id)));

  if (seleccionados.length === 0) {
    contenedor.innerHTML = '<span style="color:#94a3b8;font-size:12px;">No hay exponentes seleccionados</span>';
  } else {
    contenedor.innerHTML = seleccionados.map((e: any) => `
      <span style="display:inline-flex;align-items:center;gap:6px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:999px;padding:3px 8px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">
        ${nombreExponente(e)}
        <button type="button" data-remove-exponente="${e.id}" style="border:none;background:transparent;cursor:pointer;color:#92400e;font-size:14px;line-height:1;padding:0;">×</button>
      </span>
    `).join('');
  }

  const idsSet = new Set(exponentesSeleccionadosIds);
  selectAgregar.innerHTML = `
    <option value="">+ Agregar exponente...</option>
    ${opciones
      .filter((e: any) => !idsSet.has(Number(e.id)))
      .map((e: any) => `<option value="${e.id}">${nombreExponente(e)}</option>`)
      .join('')}
  `;

  contenedor.querySelectorAll('[data-remove-exponente]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).getAttribute('data-remove-exponente'));
      exponentesSeleccionadosIds = exponentesSeleccionadosIds.filter((x) => x !== id);
      renderExponentesEditableAuditoria(order);
    });
  });

  selectAgregar.onchange = () => {
    const id = Number(selectAgregar.value);
    if (!id) return;
    if (!exponentesSeleccionadosIds.includes(id)) {
      exponentesSeleccionadosIds.push(id);
    }
    selectAgregar.value = '';
    renderExponentesEditableAuditoria(order);
  };
}

function sumarDias(fecha: string, dias: number): string {
  const base = normalizarFechaParaInput(fecha);
  if (!base) return '';
  const d = new Date(`${base}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDuracionDias(order: any): number {
  const raw = Number(order?.duracion_dias ?? 1);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

function renderFilasDiasProgramacion(totalDias: number, fechaBase: string, horaBase: string): string {
  return Array.from({ length: totalDias }, (_, index) => {
    const dia = index + 1;
    const fecha = sumarDias(fechaBase, index);
    return `
      <div class="aud-dia-row" data-dia="${dia}" style="display:grid;grid-template-columns:90px 1fr 1fr 1fr;gap:10px;align-items:end;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;">
        <div style="font-size:13px;font-weight:700;color:#334155;">Día ${dia}</div>
        <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#334155;">
          <span>Fecha</span>
          <input type="date" class="prog-form-control auditoria-dia-fecha" value="${fecha}">
        </label>
        <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#334155;">
          <span>Hora inicio</span>
          <input type="time" class="prog-form-control auditoria-dia-hora-inicio" value="${horaBase}">
        </label>
        <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#334155;">
          <span>Hora fin</span>
          <input type="time" class="prog-form-control auditoria-dia-hora-fin" value="">
        </label>
      </div>
    `;
  }).join('');
}

function renderPlanDiasAuditoria(order: any) {
  const container = document.getElementById('auditoriaDiasPlanContainer');
  const inputDias = document.getElementById('auditoriaDuracionDias') as HTMLInputElement | null;
  const fechaBaseInput = document.getElementById('auditoriaFechaProgramada') as HTMLInputElement | null;
  const horaBaseInput = document.getElementById('auditoriaHoraInicioBase') as HTMLInputElement | null;
  if (!container || !inputDias || !fechaBaseInput || !horaBaseInput) return;

  const totalDias = Math.max(1, Number(inputDias.value || getDuracionDias(order)));
  const fechaBase = fechaBaseInput.value || normalizarFechaParaInput(order?.fecha_servicio);
  const horaBase = horaBaseInput.value || normalizarHoraParaInput(order?.hora_servicio);

  inputDias.value = String(totalDias);
  container.innerHTML = renderFilasDiasProgramacion(totalDias, fechaBase, horaBase);
}

function renderProgramacionDetalle(order: any): string {
  const cliente = order?.cliente || {};
  const servicio = order?.servicio || {};
  const exponentes = Array.isArray(order?.exponentes) ? order.exponentes : [];

  return `
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
      <div style="grid-column:1 / -1;padding:14px;border:1px solid #bae6fd;border-radius:10px;background:#f0f9ff;">
        <div style="font-size:13px;font-weight:700;color:#334155;margin-bottom:10px;">Orden de Auditoría</div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;font-size:13px;">
          <div><strong>N° Orden:</strong> ${order?.numero_orden || '—'}</div>
          <div><strong>Cotización:</strong> ${order?.cotizacion?.numero_cotizacion || '—'}</div>
          <div><strong>Cliente:</strong> ${cliente.nombre_empresa || '—'}</div>
          <div><strong>RUC:</strong> ${cliente.ruc || '—'}</div>
          <div><strong>Servicio:</strong> ${servicio.nombre || '—'}</div>
          <div><strong>Modalidad:</strong> ${order?.modalidad || '—'}</div>
          <div><strong>Fecha de auditoría:</strong> ${normalizarFechaParaInput(order?.fecha_servicio) || '—'}</div>
          <div><strong>Hora de auditoría:</strong> ${normalizarHoraParaInput(order?.hora_servicio) || '—'}</div>
          <div><strong>Duración:</strong> ${order?.duracion_dias ?? '—'} día(s)</div>
          <div><strong>Horas totales:</strong> ${Number(order?.horas_totales ?? 0).toFixed(2)}</div>
          <div><strong>Costo:</strong> S/ ${Number(order?.costo ?? 0).toFixed(2)}</div>
          <div><strong>IGV:</strong> ${order?.incluye_igv ? 'Sí' : 'No'}</div>
        </div>
      </div>
      <div style="grid-column:1 / -1;padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
        <div style="font-size:13px;font-weight:700;color:#334155;margin-bottom:8px;">Exponentes</div>
        <div id="auditoriaExponentesVista" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px;">${renderChipsExponentes(exponentes)}</div>
        <div style="margin-top:8px;">
          <select class="prog-form-control" id="auditoriaAgregarExponente">
            <option value="">+ Agregar exponente...</option>
          </select>
        </div>
      </div>
      <div style="grid-column:1 / -1;padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
        <div style="font-size:13px;font-weight:700;color:#334155;margin-bottom:8px;">Programación</div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#334155;">
            <span>Fecha base de programación</span>
            <input type="date" class="prog-form-control" id="auditoriaFechaProgramada" required value="${normalizarFechaParaInput(order?.fecha_servicio)}">
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#334155;">
            <span>Hora base de inicio</span>
            <input type="time" class="prog-form-control" id="auditoriaHoraInicioBase" required value="${normalizarHoraParaInput(order?.hora_servicio)}">
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#334155;">
            <span>Tiempo de implementación (días)</span>
            <input type="number" min="1" step="1" class="prog-form-control" id="auditoriaDuracionDias" value="${getDuracionDias(order)}">
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#334155;">
            <span>Estado</span>
            <select class="prog-form-control" id="auditoriaEstado">
              <option value="Programado" selected>Programado</option>
              <option value="Confirmado">Confirmado</option>
              <option value="En Camino">En Camino</option>
              <option value="En Ejecución">En Ejecución</option>
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#334155;">
            <span>Asistente administrativo</span>
            <select class="prog-form-control" id="auditoriaSupervisor">
              <option value="">-- Seleccionar asistente administrativo --</option>
              ${personalData.map((p) => `<option value="${p.id}">${p.nombre} ${p.apellidos}</option>`).join('')}
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#334155;">
            <span>Técnico que conduce</span>
            <select class="prog-form-control" id="auditoriaTecnicoConductor">
              <option value="">-- Seleccionar técnico conductor --</option>
              ${tecnicosConductoresData.map((t) => `<option value="${t.id}">${t.nombre} ${t.apellidos || ''}</option>`).join('')}
            </select>
          </label>
        </div>
        <div style="margin-top:12px;">
          <div style="font-size:13px;font-weight:700;color:#334155;margin-bottom:8px;">Detalle por día de auditoría</div>
          <div id="auditoriaDiasPlanContainer" style="display:flex;flex-direction:column;gap:8px;">
            ${renderFilasDiasProgramacion(getDuracionDias(order), normalizarFechaParaInput(order?.fecha_servicio), normalizarHoraParaInput(order?.hora_servicio))}
          </div>
        </div>
      </div>
      <div style="grid-column:1 / -1;padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
        <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#334155;">
          <span>Observaciones</span>
          <textarea class="prog-form-control" id="auditoriaObservaciones" style="min-height:90px;resize:vertical;"></textarea>
        </label>
      </div>
    </div>
  `;
}

function renderFormularioAuditoria(): string {
  return `
    <form id="formAuditoriaProg" class="prog-form">
      <div class="prog-form-grid">
        <div class="prog-form-section prog-form-section-full">
          <h3 class="prog-form-section-title">Orden de Auditoría</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Seleccionar Orden <span class="prog-required">*</span></label>
            <select class="prog-form-control" id="selectAuditoria" required>
              <option value="">-- Seleccionar orden de auditoría --</option>
              ${auditoriasDisponibles.map((orden) => `
                <option value="${orden.id}">${orden.numero_orden} — ${orden.cliente?.nombre_empresa || orden.cliente || 'Sin cliente'} (${orden.modalidad || 'Sin modalidad'})</option>
              `).join('')}
            </select>
          </div>
          <div id="auditoriaDetalleOrden" style="margin-top:12px;padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">Seleccione una orden de auditoría</p>
          </div>
        </div>
      </div>
      <div class="prog-modal-footer" style="border-top:1px solid #e2e8f0;padding:16px;display:flex;gap:8px;justify-content:flex-end;">
        <button type="button" class="prog-btn-secondary" id="btnCancelarAuditoria">Cancelar</button>
        <button type="submit" class="prog-btn-primary" id="btnGuardarAuditoria">Programar Auditoría</button>
      </div>
    </form>
  `;
}

function bindAuditoriaModalEvents() {
  const selectOrden = document.getElementById('selectAuditoria') as HTMLSelectElement | null;
  const contenedorDetalle = document.getElementById('auditoriaDetalleOrden');
  const form = document.getElementById('formAuditoriaProg') as HTMLFormElement | null;
  const modal = document.getElementById('modalProgramarAuditoria');
  const btnCancelar = document.getElementById('btnCancelarAuditoria');

  if (!selectOrden || !contenedorDetalle || !form || !modal) return;

  selectOrden.addEventListener('change', () => {
    const id = Number(selectOrden.value || 0);
    orderSeleccionada = auditoriasDisponibles.find((item) => Number(item.id) === id) || null;
    if (!orderSeleccionada) {
      contenedorDetalle.innerHTML = '<p style="margin:0;color:#94a3b8;font-size:12px;">Seleccione una orden de auditoría</p>';
      return;
    }

    contenedorDetalle.innerHTML = renderProgramacionDetalle(orderSeleccionada);
    renderPlanDiasAuditoria(orderSeleccionada);

    const inputDias = document.getElementById('auditoriaDuracionDias') as HTMLInputElement | null;
    const fechaBaseInput = document.getElementById('auditoriaFechaProgramada') as HTMLInputElement | null;
    const horaBaseInput = document.getElementById('auditoriaHoraInicioBase') as HTMLInputElement | null;

    inputDias?.addEventListener('input', () => renderPlanDiasAuditoria(orderSeleccionada));
    fechaBaseInput?.addEventListener('change', () => renderPlanDiasAuditoria(orderSeleccionada));
    horaBaseInput?.addEventListener('change', () => renderPlanDiasAuditoria(orderSeleccionada));

    if (orderSeleccionada.exponentes?.length) {
      exponentesSeleccionadosIds = orderSeleccionada.exponentes.map((e: any) => Number(e.id)).filter((n: number) => Number.isFinite(n) && n > 0);
    } else {
      exponentesSeleccionadosIds = [];
    }

    renderExponentesEditableAuditoria(orderSeleccionada);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!orderSeleccionada) {
      mostrarToast('warning', 'Seleccione una orden', 'Primero elija una orden de auditoría');
      return;
    }

    const fechaProgramada = (document.getElementById('auditoriaFechaProgramada') as HTMLInputElement | null)?.value || '';
    const horaInicioBase = (document.getElementById('auditoriaHoraInicioBase') as HTMLInputElement | null)?.value || '';
    const estado = (document.getElementById('auditoriaEstado') as HTMLSelectElement | null)?.value || 'Programado';
    const idSupervisor = (document.getElementById('auditoriaSupervisor') as HTMLSelectElement | null)?.value;
    const idTecnicoConductor = (document.getElementById('auditoriaTecnicoConductor') as HTMLSelectElement | null)?.value;
    const observaciones = (document.getElementById('auditoriaObservaciones') as HTMLTextAreaElement | null)?.value?.trim() || '';
    const diasRows = Array.from(document.querySelectorAll('#auditoriaDiasPlanContainer .aud-dia-row'));

    if (!fechaProgramada || !horaInicioBase) {
      mostrarToast('warning', 'Campos obligatorios', 'Complete fecha y hora de programación');
      return;
    }

    if (diasRows.length === 0) {
      mostrarToast('warning', 'Sin días configurados', 'Debe definir al menos un día de auditoría');
      return;
    }

    if (exponentesSeleccionadosIds.length === 0) {
      mostrarToast('warning', 'Exponentes requeridos', 'Seleccione al menos un exponente para la auditoría');
      return;
    }

    const jornadas = diasRows.map((row, idx) => {
      const fecha = (row.querySelector('.auditoria-dia-fecha') as HTMLInputElement | null)?.value || '';
      const horaInicio = (row.querySelector('.auditoria-dia-hora-inicio') as HTMLInputElement | null)?.value || '';
      const horaFin = (row.querySelector('.auditoria-dia-hora-fin') as HTMLInputElement | null)?.value || '';
      return {
        dia: idx + 1,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin || undefined,
      };
    });

    if (jornadas.some((j) => !j.fecha || !j.hora_inicio)) {
      mostrarToast('warning', 'Campos obligatorios', 'Complete fecha y hora de inicio en cada día de auditoría');
      return;
    }

    const exponentesSeleccionados = obtenerOpcionesExponentesAuditoria(orderSeleccionada)
      .filter((e: any) => exponentesSeleccionadosIds.includes(Number(e.id)));

    const programaciones = jornadas.map((jornada, idx) => ({
      id: -(Date.now() + idx + 1),
      id_orden_servicio: 0,
      id_servicio: Number(orderSeleccionada.id_servicio || orderSeleccionada.servicio?.id || 0),
      id_tecnico_asignado: 0,
      id_supervisor: idSupervisor ? Number(idSupervisor) : undefined,
      id_tecnico_conductor: idTecnicoConductor ? Number(idTecnicoConductor) : undefined,
      fecha_programada: jornada.fecha,
      hora_inicio: jornada.hora_inicio,
      hora_fin: jornada.hora_fin,
      local_sede: orderSeleccionada.cliente?.nombre_empresa || '',
      direccion_completa: orderSeleccionada.cliente?.direccion || '',
      id_cliente_planta: null,
      id_cliente_planta_area: null,
      estado_ejecucion: estado,
      observaciones,
      servicio: orderSeleccionada.servicio || { id: Number(orderSeleccionada.id_servicio || 0), nombre: orderSeleccionada.servicio?.nombre || 'Auditoría' },
      supervisor: idSupervisor ? personalData.find((p) => Number(p.id) === Number(idSupervisor)) : undefined,
      tecnico_conductor: idTecnicoConductor ? tecnicosConductoresData.find((t) => Number(t.id) === Number(idTecnicoConductor)) : undefined,
      orden_auditoria: orderSeleccionada,
      exponentes: exponentesSeleccionados,
      exponentes_ids: exponentesSeleccionadosIds,
      tipo_programacion: 'auditoria',
      modalidad: orderSeleccionada.modalidad || 'Presencial',
      auditoria_dia: jornada.dia,
      auditoria_total_dias: jornadas.length,
      auditoria_plan_dias: jornadas,
      auditoria_fecha_base: fechaProgramada,
      auditoria_hora_base: horaInicioBase,
    }));

    programaciones.forEach((item) => guardarProgramacionLocal(item));
    window.dispatchEvent(new CustomEvent('auditoriaProgramada', { detail: { total: programaciones.length, items: programaciones } }));
    modal.style.display = 'none';
    document.body.style.overflow = '';
    mostrarToast('success', 'Programada', `La auditoría fue agregada al calendario (${programaciones.length} día(s))`);
  });

  btnCancelar?.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  });

  document.querySelectorAll('#modalProgramarAuditoria .prog-modal-overlay, #closeModalAuditoria').forEach((el) => {
    el.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    });
  });
}

export function renderModalProgramarAuditoria(): string {
  return `
    <div class="prog-modal" id="modalProgramarAuditoria" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2>Programar Orden de Auditoría</h2>
          <button class="prog-modal-close" id="closeModalAuditoria">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalAuditoriaBody"></div>
      </div>
    </div>
  `;
}

export async function abrirModalProgramarAuditoria(personal: any[], tecnicos: any[]) {
  personalData = personal;
  tecnicosConductoresData = Array.isArray(tecnicos)
    ? tecnicos.filter((t: any) => !!t?.autorizado_conducir)
    : [];

  const modal = document.getElementById('modalProgramarAuditoria');
  const body = document.getElementById('modalAuditoriaBody');
  if (!modal || !body) return;

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando auditorías disponibles...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const [resOrdenes, resExponentes] = await Promise.all([
      ordenAuditoriaService.getAll({ estado: 'Aprobado' }),
      ordenAuditoriaService.getExponentes(),
    ]);

    const rawOrdenes = (resOrdenes as any).data || resOrdenes;
    auditoriasDisponibles = Array.isArray((rawOrdenes as any).data || rawOrdenes) ? ((rawOrdenes as any).data || rawOrdenes) : [];

    const rawExponentes = (resExponentes as any).data || resExponentes;
    exponentesCatalogo = Array.isArray((rawExponentes as any).data || rawExponentes) ? ((rawExponentes as any).data || rawExponentes) : [];

    if (auditoriasDisponibles.length === 0) {
      body.innerHTML = '<p style="padding:24px;color:#dc2626;text-align:center;">No hay órdenes de auditoría aprobadas disponibles para programar.</p>';
      return;
    }
  } catch (error) {
    console.error('Error cargando auditorías:', error);
    mostrarToast('error', 'Error', 'No se pudieron cargar las órdenes de auditoría disponibles');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    return;
  }

  body.innerHTML = renderFormularioAuditoria();
  bindAuditoriaModalEvents();
}

export function cargarProgramacionesAuditoriaLocales(): any[] {
  return leerProgramacionesLocales();
}

export function actualizarProgramacionAuditoriaLocal(id: number, cambios: Record<string, any>): boolean {
  const actuales = leerProgramacionesLocales();
  const idx = actuales.findIndex((item: any) => Number(item?.id) === Number(id));
  if (idx < 0) return false;

  actuales[idx] = {
    ...actuales[idx],
    ...cambios,
  };

  guardarProgramacionesLocales(actuales);
  return true;
}
