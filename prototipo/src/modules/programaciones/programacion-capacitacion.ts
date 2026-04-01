/**
 * Módulo para programación de capacitaciones
 * Integración completa: formulario, validación y API call
 */
import { programacionService } from './programaciones.service';
import { mostrarToast } from '../../shared/toast';

let capacitacionesDisponibles: any[] = [];
let personalData: any[] = [];
let vehiculosData: any[] = [];
let exponentesDisponiblesActual: any[] = [];
let exponentesSeleccionadosIds: number[] = [];
let exponentesCatalogo: any[] = [];

function nombreExponente(e: any): string {
  return `${e?.nombre || ''} ${e?.apellidos || ''}`.trim() || 'Exponente';
}

function formatearFechaParaInput(fecha: string): string {
  if (!fecha) return '';
  const soloFecha = fecha.match(/^(\d{4}-\d{2}-\d{2})/);
  if (soloFecha) return soloFecha[1];

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return '';

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function renderExponentesSeleccionados() {
  const contenedor = document.getElementById('exponentesSeleccionados');
  const selectAgregar = document.getElementById('selectAgregarExponente') as HTMLSelectElement | null;
  if (!contenedor || !selectAgregar) return;

  const seleccionados = exponentesDisponiblesActual.filter(e => exponentesSeleccionadosIds.includes(Number(e.id)));
  if (seleccionados.length === 0) {
    contenedor.innerHTML = '<p style="margin:0;color:#999;font-size:12px;">No hay exponentes seleccionados</p>';
  } else {
    contenedor.innerHTML = seleccionados.map((e: any) => `
      <span style="display:inline-flex;align-items:center;gap:6px;background:#fef3c7;color:#92400e;border-radius:8px;padding:6px 10px;font-weight:600;font-size:13px;">
        ${nombreExponente(e)}
        <button type="button" data-remove-exponente="${e.id}" style="border:none;background:transparent;cursor:pointer;color:#92400e;font-size:14px;line-height:1;padding:0;">×</button>
      </span>
    `).join('');
  }

  const idsSet = new Set(exponentesSeleccionadosIds);
  selectAgregar.innerHTML = `
    <option value="">+ Agregar exponente...</option>
    ${exponentesDisponiblesActual
      .filter(e => !idsSet.has(Number(e.id)))
      .map((e: any) => `<option value="${e.id}">${nombreExponente(e)}</option>`)
      .join('')}
  `;

  contenedor.querySelectorAll('[data-remove-exponente]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).getAttribute('data-remove-exponente'));
      exponentesSeleccionadosIds = exponentesSeleccionadosIds.filter(x => x !== id);
      renderExponentesSeleccionados();
    });
  });

  selectAgregar.onchange = () => {
    const id = Number(selectAgregar.value);
    if (!id) return;
    if (!exponentesSeleccionadosIds.includes(id)) {
      exponentesSeleccionadosIds.push(id);
    }
    selectAgregar.value = '';
    renderExponentesSeleccionados();
  };
}

export function renderModalProgramarCapacitacion(): string {
  return `
    <div class="prog-modal" id="modalProgramarCapacitacion" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2>Programar Orden de Capacitación</h2>
          <button class="prog-modal-close" id="closeModalCapacitacion">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalCapacitacionBody"></div>
      </div>
    </div>
  `;
}

export async function abrirModalProgramarCapacitacion(_tecnicos: any[], personal: any[], vehiculos: any[]) {
  personalData = personal;
  vehiculosData = vehiculos;

  const modal = document.getElementById('modalProgramarCapacitacion');
  const body = document.getElementById('modalCapacitacionBody');
  if (!modal || !body) return;

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando capacitaciones disponibles...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const [resCaps, resExponentes] = await Promise.all([
      programacionService.getCapacitacionesDisponibles(),
      programacionService.getExponentes(),
    ]);
    capacitacionesDisponibles = resCaps.data || [];
    exponentesCatalogo = resExponentes.data || [];
    
    if (capacitacionesDisponibles.length === 0) {
      body.innerHTML = '<p style="padding:24px;color:#dc2626;text-align:center;">No hay órdenes de capacitación aprobadas disponibles para programar.</p>';
      return;
    }
  } catch (err) {
    console.error('Error cargando capacitaciones:', err);
    mostrarToast('error', 'Error', 'No se pudieron cargar las capacitaciones disponibles');
    modal.style.display = 'none';
    return;
  }

  renderFormCapacitacion(body);
  bindEventosCapacitacion();
}

function renderFormCapacitacion(body: HTMLElement) {
  body.innerHTML = `
    <form id="formCapacitacionProg" class="prog-form">
      <div class="prog-form-grid">

        <!-- Orden de Capacitación -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Orden de Capacitación</h3>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Seleccionar Capacitación <span class="prog-required">*</span></label>
            <select class="prog-form-control" id="selectCapacitacion" required>
              <option value="">-- Seleccionar capacitación --</option>
              ${capacitacionesDisponibles.map(cap => `
                <option value="${cap.id}">
                  ${cap.numero_orden} — ${cap.cliente} (${cap.modalidad})
                </option>
              `).join('')}
            </select>
          </div>

          <div id="detallesCapacitacion" style="display:none;margin-top:12px;padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:13px;line-height:1.6;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;">
              <div>
                <strong style="color:#0369a1;">Capacitación:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detCapServicio"></span></div>
              </div>
              <div>
                <strong style="color:#0369a1;">Modalidad:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detCapModalidad" style="background:#cffafe;padding:2px 8px;border-radius:4px;font-weight:500;"></span></div>
              </div>
              <div>
                <strong style="color:#0369a1;">Participantes:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detCapParticipantes"></span></div>
              </div>
              <div>
                <strong style="color:#0369a1;">Certificados:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detCapCertificados"></span></div>
              </div>
              <div>
                <strong style="color:#0369a1;">Horas de Capacitación:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detCapHoras"></span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Asignación de Recursos (con Exponentes) -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Asignación de Recursos</h3>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Exponentes/Ponentes a Asignar <span class="prog-required">*</span></label>
            <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#fafafa;">
              <div id="exponentesSeleccionados" style="display:flex;flex-wrap:wrap;gap:8px;min-height:34px;margin-bottom:10px;">
                <p style="margin:0;color:#999;font-size:12px;">Selecciona una capacitación primero</p>
              </div>
              <select class="prog-form-control" id="selectAgregarExponente">
                <option value="">+ Agregar exponente...</option>
              </select>
            </div>
          </div>

          <div class="prog-form-group">
            <label class="prog-form-label">Asistente Administrativo</label>
            <select class="prog-form-control" id="supervisor">
              <option value="">-- Seleccionar asistente administrativo --</option>
              ${personalData.map(p => `
                <option value="${p.id}">
                  ${p.nombre} ${p.apellidos}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="prog-form-group">
            <label class="prog-form-label">Vehículo (Transporte)</label>
            <select class="prog-form-control" id="vehiculo">
              <option value="">-- Seleccionar vehículo --</option>
              ${vehiculosData.map(v => `
                <option value="${v.id}">
                  ${v.placa} — ${v.modelo}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Fechas y Horarios -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Fechas y Horarios</h3>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Fecha de Programación <span class="prog-required">*</span></label>
            <input type="date" class="prog-form-control" id="fechaProgramada" required>
            <small style="color:#666;font-size:12px;margin-top:4px;">Se pre-llena con la fecha de la orden de capacitación</small>
          </div>

          <div class="prog-form-row">
            <div class="prog-form-group">
              <label class="prog-form-label">Hora Inicio <span class="prog-required">*</span></label>
              <input type="time" class="prog-form-control" id="horaInicio" required>
              <small style="color:#666;font-size:12px;margin-top:4px;">Se pre-llena con la hora de la orden</small>
            </div>
            <div class="prog-form-group">
              <label class="prog-form-label">Hora Fin</label>
              <input type="time" class="prog-form-control" id="horaFin">
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Observaciones</h3>

          <div class="prog-form-group" style="margin-bottom:10px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;">
              <div>
                <label class="prog-form-label" style="font-size:12px;color:#64748b;margin-bottom:4px;">Planta</label>
                <div id="obsPlantaLabel" style="font-size:14px;font-weight:600;color:#1e293b;">Sin selección</div>
              </div>
              <div>
                <label class="prog-form-label" style="font-size:12px;color:#64748b;margin-bottom:4px;">Área</label>
                <div id="obsAreaLabel" style="display:flex;flex-wrap:wrap;gap:6px;min-height:24px;align-items:center;color:#1e293b;font-weight:600;">Sin selección</div>
              </div>
            </div>
          </div>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Notas Adicionales</label>
            <textarea class="prog-form-control" id="observaciones" style="min-height:80px;resize:vertical;"></textarea>
          </div>
        </div>

      </div>

      <div class="prog-modal-footer" style="border-top:1px solid #e2e8f0;padding:16px;display:flex;gap:8px;justify-content:flex-end;">
        <button type="button" class="prog-btn-secondary" id="btnCancelarCapacitacion">Cancelar</button>
        <button type="submit" class="prog-btn-primary" id="btnGuardarCapacitacion">Programar Capacitación</button>
      </div>
    </form>
  `;
}

function bindEventosCapacitacion() {
  const selectCap = document.getElementById('selectCapacitacion') as HTMLSelectElement;
  const detalles = document.getElementById('detallesCapacitacion');
  const form = document.getElementById('formCapacitacionProg') as HTMLFormElement;
  const btnCancel = document.getElementById('btnCancelarCapacitacion');
  const modal = document.getElementById('modalProgramarCapacitacion');

  // Cargar detalles de capacitación seleccionada
  if (selectCap) {
    selectCap.addEventListener('change', (e) => {
      const capId = (e.target as HTMLSelectElement).value;
      if (!capId) {
        detalles!.style.display = 'none';
        const obsPlanta = document.getElementById('obsPlantaLabel');
        const obsArea = document.getElementById('obsAreaLabel');
        if (obsPlanta) obsPlanta.textContent = 'Sin selección';
        if (obsArea) obsArea.textContent = 'Sin selección';
        exponentesDisponiblesActual = [];
        exponentesSeleccionadosIds = [];
        const contenedor = document.getElementById('exponentesSeleccionados');
        if (contenedor) {
          contenedor.innerHTML = '<p style="margin:0;color:#999;font-size:12px;">Selecciona una capacitación primero</p>';
        }
        const selectAgregar = document.getElementById('selectAgregarExponente') as HTMLSelectElement | null;
        if (selectAgregar) {
          selectAgregar.innerHTML = '<option value="">+ Agregar exponente...</option>';
        }
        return;
      }

      const capacitacion = capacitacionesDisponibles.find(c => c.id == capId);
      if (capacitacion && detalles) {
        // Llenar información general
        document.getElementById('detCapServicio')!.textContent = capacitacion.capacitacion_nombre || capacitacion.servicio || 'Sin capacitación';
        document.getElementById('detCapModalidad')!.textContent = capacitacion.modalidad || 'Sin especificar';
        document.getElementById('detCapParticipantes')!.textContent = `${capacitacion.num_participantes || 0} personas`;
        document.getElementById('detCapCertificados')!.textContent = `${capacitacion.num_certificados || 0} certificados`;
        document.getElementById('detCapHoras')!.textContent = `${capacitacion.horas_capacitacion || 0} horas`;

        const obsPlanta = document.getElementById('obsPlantaLabel');
        const obsArea = document.getElementById('obsAreaLabel');
        if (obsPlanta) {
          obsPlanta.textContent = capacitacion.planta_nombre || 'Sin planta';
        }
        if (obsArea) {
          const areas = Array.isArray(capacitacion.areas_nombres)
            ? capacitacion.areas_nombres.map((a: any) => String(a || '').trim()).filter((a: string) => !!a)
            : [];

          if (areas.length > 0) {
            obsArea.innerHTML = areas
              .map((area: string) => `<span style="display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;background:#e2e8f0;color:#334155;font-size:12px;font-weight:600;">${area}</span>`)
              .join('');
          } else {
            obsArea.textContent = 'Sin área';
          }
        }
        
        detalles.style.display = 'block';

        // Cargar chips con exponentes de la orden, permitiendo agregar otros del catálogo
        const exponentesOrden = Array.isArray(capacitacion.exponentes) ? capacitacion.exponentes : [];
        const mapaExponentes = new Map<number, any>();
        exponentesCatalogo.forEach((e: any) => mapaExponentes.set(Number(e.id), e));
        exponentesOrden.forEach((e: any) => mapaExponentes.set(Number(e.id), e));
        exponentesDisponiblesActual = Array.from(mapaExponentes.values());
        exponentesSeleccionadosIds = exponentesOrden.map((e: any) => Number(e.id));
        renderExponentesSeleccionados();

        // ═══ PRE-LLENAR FECHAS Y HORAS ═══
        const fechaInput = document.getElementById('fechaProgramada') as HTMLInputElement;
        const horaInput = document.getElementById('horaInicio') as HTMLInputElement;
        const horaFinInput = document.getElementById('horaFin') as HTMLInputElement;
        
        if (fechaInput && capacitacion.fecha_servicio) {
          fechaInput.value = formatearFechaParaInput(String(capacitacion.fecha_servicio));
        }
        
        if (horaInput && capacitacion.hora_servicio) {
          // Extraer HH:MM de diferentes formatos posibles
          const horaStr = String(capacitacion.hora_servicio);
          const horaMatch = horaStr.match(/(\d{1,2}):(\d{2})/);
          if (horaMatch) {
            horaInput.value = `${horaMatch[1].padStart(2, '0')}:${horaMatch[2]}`;
          }
        }

        if (horaFinInput) {
          horaFinInput.value = '';
        }
      }
    });
  }

  // Cancelar
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }

  // Guardar
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await guardarCapacitacionProgramada(form);
    });
  }

  // Cerrar con X
  const btnClose = document.getElementById('closeModalCapacitacion');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }
}

async function guardarCapacitacionProgramada(form: HTMLFormElement) {
  const selectCap = form.querySelector('#selectCapacitacion') as HTMLSelectElement;
  const fechaProgramada = form.querySelector('#fechaProgramada') as HTMLInputElement;
  const horaInicio = form.querySelector('#horaInicio') as HTMLInputElement;
  const horaFin = form.querySelector('#horaFin') as HTMLInputElement;
  const supervisor = form.querySelector('#supervisor') as HTMLSelectElement;
  const vehiculo = form.querySelector('#vehiculo') as HTMLSelectElement;
  const observaciones = form.querySelector('#observaciones') as HTMLTextAreaElement;

  // Validar campos obligatorios
  if (!selectCap.value || !fechaProgramada.value || !horaInicio.value) {
    mostrarToast('warning', 'Campos requeridos', 'Complete capacitación, fecha y hora de inicio');
    return;
  }

  if (exponentesSeleccionadosIds.length === 0) {
    mostrarToast('warning', 'Exponentes requeridos', 'Seleccione al menos un exponente');
    return;
  }

  const capacity = capacitacionesDisponibles.find(c => c.id == selectCap.value);
  if (!capacity) {
    mostrarToast('error', 'Capacitación inválida', 'No se encontró la orden seleccionada');
    return;
  }

  // Preparar payload
  const payload = {
    id_orden_capacitacion: parseInt(selectCap.value),
    fecha_programada: fechaProgramada.value,
    hora_inicio: horaInicio.value,
    hora_fin: horaFin?.value || undefined,
    id_supervisor: supervisor?.value ? parseInt(supervisor.value) : undefined,
    id_vehiculo: vehiculo?.value ? parseInt(vehiculo.value) : undefined,
    observaciones: observaciones.value || '',
    exponentes_ids: exponentesSeleccionadosIds,
  };

  try {
    // Mostrar indicador de carga
    const btnSubmit = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }

    const result = await programacionService.programarCapacitacion(payload);

    if (result.success) {
      // Toast éxito
      mostrarToast('success', 'Éxito', '✓ Capacitación programada correctamente');
      
      // Cerrar modal
      const modal = document.getElementById('modalProgramarCapacitacion');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = 'auto';

      // Limpiar formulario
      form.reset();

      // Emitir evento para recargar
      window.dispatchEvent(new Event('capacitacionProgramada'));
    } else {
      mostrarToast('error', 'Error', result.message || 'No se pudo guardar');
    }
  } catch (error: any) {
    const mensaje = error?.data?.message || error?.response?.data?.message || error?.message || 'Error al guardar';
    mostrarToast('error', 'Error', mensaje);
    console.error('Error programar capacitación:', error);
  } finally {
    const btnSubmit = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = 'Programar Capacitación';
    }
  }
}
