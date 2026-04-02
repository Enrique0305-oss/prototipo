/**
 * Módulo para programación de asesorías
 * Integración completa: formulario, validación y API call
 */
import { programacionService } from './programaciones.service';
import { mostrarToast } from '../../shared/toast';

let asesoriasDisponibles: any[] = [];
let personalData: { id: number; nombre: string; apellidos: string }[] = [];
let vehiculosData: any[] = [];
let exponentesDisponiblesActual: any[] = [];
let exponentesSeleccionadosIds: number[] = [];
let frecuenciaFilasActuales: Array<{ mes: string; presencial: string; virtual: string; frecuencia: string }> = [];
let asesoriaSeleccionadaActual: any = null;

function nombreExponente(e: any): string {
  return `${e?.nombre || ''} ${e?.apellidos || ''}`.trim() || 'Exponente';
}

function formatearFechaParaInput(fecha: string): string {
  if (!fecha) return '';
  const partes = fecha.split('-');
  if (partes.length === 3) {
    return `${partes[0]}-${partes[1]}-${partes[2]}`;
  }
  return fecha;
}

function normalizarFilasFrecuencia(frecuenciaVisita: any): Array<{ mes: string; presencial: string; virtual: string; frecuencia: string }> {
  if (!frecuenciaVisita) return [];

  let data = frecuenciaVisita;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }

  if (Array.isArray(data)) {
    return data.map((item: any, index: number) => ({
      mes: String(item?.mes ?? item?.mes_nombre ?? `Mes ${index + 1}`),
      presencial: String(item?.presencial ?? item?.p ?? item?.presenciales ?? '-'),
      virtual: String(item?.virtual ?? item?.v ?? item?.virtuales ?? '-'),
      frecuencia: String(item?.frecuencia ?? item?.frecuencia_visita ?? item?.f ?? '-'),
    }));
  }

  if (typeof data === 'object') {
    return Object.entries(data).map(([mesKey, val]: [string, any]) => {
      const matchMes = String(mesKey).match(/\d+/);
      const mesLabel = matchMes ? `Mes ${matchMes[0]}` : String(mesKey).toUpperCase();
      return {
        mes: mesLabel,
        presencial: String(Number(val?.p ?? val?.presencial ?? 0)),
        virtual: String(Number(val?.v ?? val?.virtual ?? 0)),
        frecuencia: String(val?.f ?? val?.frecuencia ?? '-'),
      };
    });
  }

  return [];
}

function parseISODate(fechaISO: string): Date | null {
  if (!fechaISO) return null;
  const parts = fechaISO.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDateDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function addMonthsSafe(date: Date, months: number): Date {
  const baseDay = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(baseDay, lastDay));
  return result;
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function inicioMesImplementacion(fechaInicio: Date, mes: number): Date {
  if (mes === 1) return new Date(fechaInicio);
  const base = addMonthsSafe(fechaInicio, mes - 1);
  return new Date(base.getFullYear(), base.getMonth(), 1);
}

function finMesImplementacion(fechaInicio: Date, fechaFinGlobal: Date, mes: number, mesesTotales: number): Date {
  if (mes === mesesTotales) return new Date(fechaFinGlobal);
  if (mes === 1) return endOfMonth(fechaInicio);
  return endOfMonth(inicioMesImplementacion(fechaInicio, mes));
}

function extraerMesNumero(mes: string, index: number): number {
  const match = String(mes).match(/\d+/);
  if (match) return Number(match[0]);
  return index + 1;
}

function frecuenciaAMultiplicador(freq: string): number {
  const value = String(freq || '').toLowerCase().trim();
  if (!value) return 1;
  if (value.includes('seman')) return 4;
  if (value.includes('quincen')) return 2;
  if (value.includes('1 vez') || value.includes('una vez') || value.includes('mensual') || value.includes('mes')) return 1;
  return 1;
}

function obtenerDiasSeleccionadosPorMes(tipo: 'presencial' | 'virtual', mes: number): number[] {
  return Array.from(document.querySelectorAll(`input.dia-${tipo}[data-mes="${mes}"]:checked`))
    .map((el) => Number((el as HTMLInputElement).value))
    .filter((n) => !Number.isNaN(n));
}

function renderSelectorDiasPorMes(totalMeses: number) {
  const container = document.getElementById('diasPorMesContainer');
  if (!container) return;

  if (totalMeses <= 0) {
    container.innerHTML = '<div style="padding:10px;color:#64748b;font-size:12px;">Seleccione una asesoría para habilitar días por mes.</div>';
    return;
  }

  const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  container.innerHTML = Array.from({ length: totalMeses }, (_, i) => {
    const mes = i + 1;
    return `
      <div style="border:1px solid #dbe3ea;border-radius:8px;padding:10px;background:#fff;">
        <div style="font-size:13px;font-weight:700;color:#1f2937;margin-bottom:8px;">Mes ${mes}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;">Presenciales</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${dias.map((d, dayIndex) => `
                <label style="display:inline-flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid #d1d5db;border-radius:8px;font-size:11px;color:#334155;cursor:pointer;">
                  <input type="checkbox" class="dia-presencial" data-mes="${mes}" value="${dayIndex}" ${dayIndex === 2 ? 'checked' : ''}>
                  ${d}
                </label>
              `).join('')}
            </div>
          </div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:6px;">Virtuales</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${dias.map((d, dayIndex) => `
                <label style="display:inline-flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid #d1d5db;border-radius:8px;font-size:11px;color:#334155;cursor:pointer;">
                  <input type="checkbox" class="dia-virtual" data-mes="${mes}" value="${dayIndex}" ${dayIndex === 3 ? 'checked' : ''}>
                  ${d}
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function obtenerDiasPorMesSeleccionados(): Record<string, { presencial: number[]; virtual: number[] }> {
  const resultado: Record<string, { presencial: number[]; virtual: number[] }> = {};
  const meses = new Set<number>();

  document.querySelectorAll('input.dia-presencial[data-mes], input.dia-virtual[data-mes]').forEach((el) => {
    const mes = Number((el as HTMLInputElement).dataset.mes || 0);
    if (mes > 0) meses.add(mes);
  });

  meses.forEach((mes) => {
    resultado[String(mes)] = {
      presencial: Array.from(document.querySelectorAll(`input.dia-presencial[data-mes="${mes}"]:checked`))
        .map((el) => Number((el as HTMLInputElement).value))
        .filter((n) => !Number.isNaN(n)),
      virtual: Array.from(document.querySelectorAll(`input.dia-virtual[data-mes="${mes}"]:checked`))
        .map((el) => Number((el as HTMLInputElement).value))
        .filter((n) => !Number.isNaN(n)),
    };
  });

  return resultado;
}

function obtenerFechasPorDias(inicio: Date, fin: Date, diasSemana: number[]): Date[] {
  if (diasSemana.length === 0) return [];
  const setDias = new Set(diasSemana);
  const fechas: Date[] = [];
  const cursor = new Date(inicio);
  while (cursor <= fin) {
    if (setDias.has(cursor.getDay())) {
      fechas.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return fechas;
}

function asignarFechasVisitas(candidatas: Date[], total: number): Date[] {
  if (total <= 0 || candidatas.length === 0) return [];
  const salida: Date[] = [];
  for (let i = 0; i < total; i += 1) {
    salida.push(new Date(candidatas[i % candidatas.length]));
  }
  return salida;
}

function actualizarTablaFrecuenciaPorVisita() {
  const tiempoFrecuenciaRows = document.getElementById('tiempoFrecuenciaRows');
  if (!tiempoFrecuenciaRows || frecuenciaFilasActuales.length === 0) return;

  // Actualizar cada fila con los días seleccionados
  frecuenciaFilasActuales.forEach((fila, index) => {
    const mesN = extraerMesNumero(fila.mes, index);
    const diasPresenciales = obtenerDiasSeleccionadosPorMes('presencial', mesN).length;
    const diasVirtuales = obtenerDiasSeleccionadosPorMes('virtual', mesN).length;

    fila.presencial = String(diasPresenciales);
    fila.virtual = String(diasVirtuales);
    
    // Actualizar la fila en la tabla
    const filas = tiempoFrecuenciaRows.querySelectorAll('tr');
    if (index < filas.length) {
      const celdas = filas[index].querySelectorAll('td');
      if (celdas.length >= 4) {
        celdas[1].textContent = String(diasPresenciales);
        celdas[2].textContent = String(diasVirtuales);
      }
    }
  });

  renderAgendaAutomatica();
}

function renderAgendaAutomatica() {
  const fechaProgramada = document.getElementById('fechaProgramada') as HTMLInputElement | null;
  const fechaFinLabel = document.getElementById('fechaFinProgramacion');
  const resumenAgenda = document.getElementById('resumenAgenda');
  const agendaPreviewBody = document.getElementById('agendaPreviewBody');
  if (!fechaProgramada || !fechaFinLabel || !resumenAgenda || !agendaPreviewBody) return;

  const fechaInicio = parseISODate(fechaProgramada.value);
  const mesesRaw = document.getElementById('tiempoMesesLabel')?.textContent || '';
  const meses = Number((mesesRaw.match(/\d+/) || [0])[0]);

  if (!fechaInicio || meses <= 0 || frecuenciaFilasActuales.length === 0) {
    fechaFinLabel.textContent = '—';
    resumenAgenda.textContent = 'Seleccione fecha y asesoría para calcular la agenda.';
    agendaPreviewBody.innerHTML = '<tr><td colspan="6" style="padding:12px;color:#64748b;">Sin agenda calculada</td></tr>';
    return;
  }

  const fechaFin = addMonthsSafe(fechaInicio, meses);
  fechaFinLabel.textContent = formatDateDisplay(fechaFin);

  const filasPorMes = new Map<number, { presencial: number; virtual: number; frecuencia: string }>();
  frecuenciaFilasActuales.forEach((f, index) => {
    const mesN = extraerMesNumero(f.mes, index);
    filasPorMes.set(mesN, {
      presencial: Number(f.presencial) || 0,
      virtual: Number(f.virtual) || 0,
      frecuencia: String(f.frecuencia || ''),
    });
  });

  let totalPresencial = 0;
  let totalVirtual = 0;
  const rows: string[] = [];

  for (let mes = 1; mes <= meses; mes += 1) {
    const dataMes = filasPorMes.get(mes) || { presencial: 0, virtual: 0, frecuencia: 'Mensual' };
    const multiplicador = frecuenciaAMultiplicador(dataMes.frecuencia);
    const totalMesPresencial = dataMes.presencial * multiplicador;
    const totalMesVirtual = dataMes.virtual * multiplicador;

    totalPresencial += totalMesPresencial;
    totalVirtual += totalMesVirtual;

    const inicioMes = inicioMesImplementacion(fechaInicio, mes);
    const finMes = finMesImplementacion(fechaInicio, fechaFin, mes, meses);

    const diasPresencialMes = obtenerDiasSeleccionadosPorMes('presencial', mes);
    const diasVirtualMes = obtenerDiasSeleccionadosPorMes('virtual', mes);

    const fechasPres = asignarFechasVisitas(obtenerFechasPorDias(inicioMes, finMes, diasPresencialMes), totalMesPresencial);
    const fechasVirt = asignarFechasVisitas(obtenerFechasPorDias(inicioMes, finMes, diasVirtualMes), totalMesVirtual);

    const primeraPres = fechasPres.length > 0 ? formatDateDisplay(fechasPres[0]) : '-';
    const primeraVirt = fechasVirt.length > 0 ? formatDateDisplay(fechasVirt[0]) : '-';

    rows.push(`
      <tr style="font-size:12px;color:#334155;">
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;">Mes ${mes}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;text-align:center;">${totalMesPresencial}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;text-align:center;">${totalMesVirtual}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;">${dataMes.frecuencia || '-'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;">${primeraPres}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;">${primeraVirt}</td>
      </tr>
    `);
  }

  resumenAgenda.textContent = `Total planificado: ${totalPresencial} asesorías presenciales y ${totalVirtual} asesorías virtuales. Vigencia del ${formatDateDisplay(fechaInicio)} al ${formatDateDisplay(fechaFin)}.`;
  agendaPreviewBody.innerHTML = rows.join('');
}

export function renderModalProgramarAsesoria(): string {
  return `
    <div class="prog-modal" id="modalProgramarAsesoria" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2>Programar Orden de Asesoría</h2>
          <button class="prog-modal-close" id="closeModalAsesoria">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalAsesoriaBody"></div>
      </div>
    </div>
  `;
}

export async function abrirModalProgramarAsesoria(_personal: any[], vehiculos: any[]) {
  personalData = _personal;
  vehiculosData = vehiculos;

  const modal = document.getElementById('modalProgramarAsesoria');
  const body = document.getElementById('modalAsesoriaBody');
  if (!modal || !body) return;

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando asesorías disponibles...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const resAsesorias = await programacionService.getAsesoriasDisponibles();
    const resExponentes = await programacionService.getAllExponentes();
    
    asesoriasDisponibles = resAsesorias.data || [];
    exponentesDisponiblesActual = resExponentes.data || [];
    
    if (asesoriasDisponibles.length === 0) {
      body.innerHTML = '<p style="padding:24px;color:#dc2626;text-align:center;">No hay órdenes de asesoría aprobadas disponibles para programar.</p>';
      return;
    }
  } catch (err) {
    console.error('Error cargando asesorías:', err);
    mostrarToast('error', 'Error', 'No se pudieron cargar las asesorías disponibles');
    modal.style.display = 'none';
    return;
  }

  renderFormAsesoria(body);
  bindEventosAsesoria();
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

function renderFormAsesoria(body: HTMLElement) {
  body.innerHTML = `
    <form id="formAsesoriaProg" class="prog-form">
      <div class="prog-form-grid">

        <!-- Orden de Asesoría -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Orden de Asesoría</h3>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Seleccionar Asesoría <span class="prog-required">*</span></label>
            <select class="prog-form-control" id="selectAsesoria" required>
              <option value="">-- Seleccionar asesoría --</option>
              ${asesoriasDisponibles.map(asesoria => `
                <option value="${asesoria.id}">
                  ${asesoria.numero_orden} — ${asesoria.cliente} (${asesoria.modalidad})
                </option>
              `).join('')}
            </select>
          </div>

          <div id="detallesAsesoria" style="display:none;margin-top:12px;padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:13px;line-height:1.6;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;">
              <div>
                <strong style="color:#0369a1;">Asesoría:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detAseNombre"></span></div>
              </div>
              <div>
                <strong style="color:#0369a1;">Modalidad:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detAseModalidad" style="background:#cffafe;padding:2px 8px;border-radius:4px;font-weight:500;"></span></div>
              </div>
              <div>
                <strong style="color:#0369a1;">Participantes:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detAseParticipantes"></span></div>
              </div>
              <div>
                <strong style="color:#0369a1;">Certificados:</strong>
                <div style="color:#475569;margin-top:2px;"><span id="detAseCertificados"></span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Asignación de Recursos (con Exponentes) -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Asignación de Recursos</h3>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Exponentes/Ponentes a Asignar</label>
            <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#fafafa;">
              <div id="exponentesSeleccionados" style="display:flex;flex-wrap:wrap;gap:8px;min-height:34px;margin-bottom:10px;">
                <p style="margin:0;color:#999;font-size:12px;">Selecciona una asesoría primero</p>
              </div>
              <select class="prog-form-control" id="selectAgregarExponente">
                <option value="">+ Agregar exponente...</option>
              </select>
              <small style="color:#666;font-size:11px;margin-top:6px;display:block;">Los exponentes en la orden se muestran arriba en "Orden de Asesoría"</small>
            </div>
          </div>

          <div class="prog-form-group">
            <label class="prog-form-label">Asistente administrativo</label>
            <select class="prog-form-control" id="supervisor">
              <option value="">-- Seleccionar asistente administrativo --</option>
              ${personalData.map((pe: { id: number; nombre: string; apellidos: string }) => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('')}
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
            <small style="color:#666;font-size:12px;margin-top:4px;">Se pre-llena con la fecha de la orden de asesoría</small>
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

        <!-- Observaciones y Ubicación -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Observaciones y Ubicación</h3>

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

        <!-- Tiempo de Implementación y Frecuencia -->
        <div class="prog-form-section prog-form-section-full">
          <h3 class="prog-form-section-title">Tiempo de Implementación y Frecuencia</h3>
          
          <div class="prog-form-group" style="margin-bottom:10px;">
            <div style="display:grid;grid-template-columns:minmax(220px, 320px) 1fr;gap:14px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;align-items:stretch;">
              <div style="border:1px solid #dbe3ea;border-radius:8px;background:#fff;padding:16px;display:flex;flex-direction:column;justify-content:center;">
                <label class="prog-form-label" style="font-size:16px;color:#334155;margin-bottom:8px;font-weight:700;">Tiempo de implementación:</label>
                <div id="tiempoMesesLabel" style="font-size:40px;line-height:1.1;color:#1f2937;">—</div>
              </div>

              <div>
                <div style="font-size:16px;color:#334155;font-weight:700;margin-bottom:8px;">Frecuencia por visita</div>
                <div style="border:1px solid #dbe3ea;border-radius:8px;overflow:hidden;background:#fff;">
                  <table style="width:100%;border-collapse:collapse;margin:0;">
                    <thead>
                      <tr style="background:#eef2f6;color:#334155;font-size:13px;">
                        <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e2e8f0;">Mes</th>
                        <th style="text-align:center;padding:10px 12px;border-bottom:1px solid #e2e8f0;">Presencial (P)</th>
                        <th style="text-align:center;padding:10px 12px;border-bottom:1px solid #e2e8f0;">Virtual (V)</th>
                        <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e2e8f0;">Frecuencia</th>
                      </tr>
                    </thead>
                    <tbody id="tiempoFrecuenciaRows">
                      <tr>
                        <td colspan="4" style="padding:12px;color:#64748b;font-size:13px;">Sin datos de frecuencia</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="prog-form-group" style="margin-top:12px;">
            <div style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#ffffff;">
              <div style="font-size:13px;font-weight:700;color:#334155;margin-bottom:8px;">Días por mes para asesorías (presenciales y virtuales)</div>
              <div id="diasPorMesContainer" style="display:grid;grid-template-columns:1fr;gap:10px;"></div>
            </div>
          </div>

          <div class="prog-form-group" style="margin-top:12px;">
            <div style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;">
              <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-size:13px;color:#334155;font-weight:700;">Fecha fin de implementación: <span id="fechaFinProgramacion" style="color:#0f766e;">—</span></div>
                <div id="resumenAgenda" style="font-size:12px;color:#475569;">Seleccione fecha y asesoría para calcular la agenda.</div>
              </div>
              <div style="margin-top:10px;border:1px solid #dbe3ea;border-radius:8px;overflow:hidden;background:#fff;">
                <table style="width:100%;border-collapse:collapse;margin:0;">
                  <thead>
                    <tr style="background:#eef2f6;color:#334155;font-size:12px;">
                      <th style="text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;">Mes</th>
                      <th style="text-align:center;padding:8px 10px;border-bottom:1px solid #e2e8f0;">Total P</th>
                      <th style="text-align:center;padding:8px 10px;border-bottom:1px solid #e2e8f0;">Total V</th>
                      <th style="text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;">Frecuencia</th>
                      <th style="text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;">Primer P</th>
                      <th style="text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;">Primer V</th>
                    </tr>
                  </thead>
                  <tbody id="agendaPreviewBody">
                    <tr><td colspan="6" style="padding:12px;color:#64748b;">Sin agenda calculada</td></tr>
                  </tbody>
                </table>
              </div>
              <small style="display:block;margin-top:8px;color:#64748b;font-size:11px;">Cálculo automático: semanal x4, quincenal x2, mensual x1 por cada mes de implementación.</small>
            </div>
          </div>
        </div>

      </div>

      <div class="prog-modal-footer" style="border-top:1px solid #e2e8f0;padding:16px;display:flex;gap:8px;justify-content:flex-end;">
        <button type="button" class="prog-btn-secondary" id="btnCancelarAsesoria">Cancelar</button>
        <button type="submit" class="prog-btn-primary" id="btnGuardarAsesoria">Programar Asesoría</button>
      </div>
    </form>
  `;
}

function bindEventosAsesoria() {
  const selectAsesoria = document.getElementById('selectAsesoria') as HTMLSelectElement;
  const detalles = document.getElementById('detallesAsesoria');
  const form = document.getElementById('formAsesoriaProg') as HTMLFormElement;
  const btnCancel = document.getElementById('btnCancelarAsesoria');
  const modal = document.getElementById('modalProgramarAsesoria');

  renderSelectorDiasPorMes(0);

  // Cargar detalles de asesoría seleccionada
  if (selectAsesoria) {
    selectAsesoria.addEventListener('change', (e) => {
      const aseId = (e.target as HTMLSelectElement).value;
      if (!aseId) {
        detalles!.style.display = 'none';
        asesoriaSeleccionadaActual = null;
        const obsPlanta = document.getElementById('obsPlantaLabel');
        const obsArea = document.getElementById('obsAreaLabel');
        if (obsPlanta) obsPlanta.textContent = 'Sin selección';
        if (obsArea) obsArea.textContent = 'Sin selección';
        
        const tiempoMesesLabel = document.getElementById('tiempoMesesLabel');
        const tiempoFrecuenciaRows = document.getElementById('tiempoFrecuenciaRows');
        if (tiempoMesesLabel) tiempoMesesLabel.textContent = '—';
        frecuenciaFilasActuales = [];
        renderSelectorDiasPorMes(0);
        if (tiempoFrecuenciaRows) {
          tiempoFrecuenciaRows.innerHTML = `
            <tr>
              <td colspan="4" style="padding:12px;color:#64748b;font-size:13px;">Sin datos de frecuencia</td>
            </tr>
          `;
        }
        renderAgendaAutomatica();
        
        exponentesSeleccionadosIds = [];
        const contenedor = document.getElementById('exponentesSeleccionados');
        if (contenedor) {
          contenedor.innerHTML = '<p style="margin:0;color:#999;font-size:12px;">Selecciona una asesoría primero</p>';
        }
        const selectAgregar = document.getElementById('selectAgregarExponente') as HTMLSelectElement | null;
        if (selectAgregar) {
          selectAgregar.innerHTML = '<option value="">+ Agregar exponente...</option>';
        }
        return;
      }

      detalles!.style.display = 'block';

      const asesoria = asesoriasDisponibles.find(a => a.id == aseId);
      if (!asesoria) return;
      asesoriaSeleccionadaActual = asesoria;

      document.getElementById('detAseNombre')!.textContent = asesoria.asesoria_nombre || 'Sin nombre';
      document.getElementById('detAseModalidad')!.textContent = asesoria.modalidad || 'Sin especificar';
      document.getElementById('detAseParticipantes')!.textContent = `${asesoria.num_participantes || 0} personas`;
      document.getElementById('detAseCertificados')!.textContent = `${asesoria.num_certificados || 0} certificados`;

      const obsPlanta = document.getElementById('obsPlantaLabel');
      const obsArea = document.getElementById('obsAreaLabel');
      if (obsPlanta) {
        obsPlanta.textContent = asesoria.planta_nombre || 'Sin planta';
      }
      if (obsArea) {
        const areas = Array.isArray(asesoria.areas_nombres)
          ? asesoria.areas_nombres.join(', ')
          : (asesoria.areas_nombres ? String(asesoria.areas_nombres) : 'Sin área');
        obsArea.innerHTML = areas
          .split(',')
          .map((a: string) => `<span style="background:#dbeafe;color:#0369a1;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:500;">${a.trim()}</span>`)
          .join('');
      }

      const fechaProgramada = document.getElementById('fechaProgramada') as HTMLInputElement;
      if (fechaProgramada && asesoria.fecha_servicio) {
        fechaProgramada.value = formatearFechaParaInput(asesoria.fecha_servicio);
      }

      const horaInput = document.getElementById('horaInicio') as HTMLInputElement;
      if (horaInput && asesoria.hora_servicio) {
        const horaStr = String(asesoria.hora_servicio);
        const horaMatch = horaStr.match(/(\d{1,2}):(\d{2})/);
        if (horaMatch) {
          horaInput.value = `${horaMatch[1].padStart(2, '0')}:${horaMatch[2]}`;
        }
      }

      const horaFinInput = document.getElementById('horaFin') as HTMLInputElement;
      if (horaFinInput) {
        horaFinInput.value = '';
      }

      // Cargar exponentes de la orden
      // Pre-seleccionar automáticamente los exponentes de la orden
      const exponentesOrd = Array.isArray(asesoria.exponentes) ? asesoria.exponentes : [];
      exponentesSeleccionadosIds = exponentesOrd.map((e: any) => Number(e.id));
      renderExponentesSeleccionados();

      // Cargar tiempo de implementación y frecuencia de visitas
      const tiempoMesesLabel = document.getElementById('tiempoMesesLabel');
      const tiempoFrecuenciaRows = document.getElementById('tiempoFrecuenciaRows');
      
      if (tiempoMesesLabel) {
        const meses = asesoria.meses_implementacion;
        tiempoMesesLabel.textContent = meses ? `${meses} ${meses === 1 ? 'mes' : 'meses'}` : 'Sin especificar';
      }
      
      if (tiempoFrecuenciaRows) {
        const filas = normalizarFilasFrecuencia(asesoria.frecuencia_visita);
        frecuenciaFilasActuales = filas;
        if (filas.length === 0) {
          tiempoFrecuenciaRows.innerHTML = `
            <tr>
              <td colspan="4" style="padding:12px;color:#64748b;font-size:13px;">Sin datos de frecuencia</td>
            </tr>
          `;
        } else {
          tiempoFrecuenciaRows.innerHTML = filas
            .map((f) => `
              <tr style="font-size:13px;color:#334155;">
                <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;">${f.mes}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:center;">${f.presencial}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:center;">${f.virtual}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;">${f.frecuencia}</td>
              </tr>
            `)
            .join('');
        }
      }

      const mesesRaw = document.getElementById('tiempoMesesLabel')?.textContent || '';
      const meses = Number((mesesRaw.match(/\d+/) || [0])[0]);
      renderSelectorDiasPorMes(meses);

      actualizarTablaFrecuenciaPorVisita();
      renderAgendaAutomatica();
    });
  }

  const fechaProgramada = document.getElementById('fechaProgramada') as HTMLInputElement | null;
  if (fechaProgramada) {
    fechaProgramada.addEventListener('change', () => renderAgendaAutomatica());
  }

  form?.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target && (target.classList.contains('dia-presencial') || target.classList.contains('dia-virtual'))) {
      actualizarTablaFrecuenciaPorVisita();
      renderAgendaAutomatica();
    }
  });

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
      await guardarAsesoriaProgramada(form);
    });
  }
}

async function guardarAsesoriaProgramada(form: HTMLFormElement) {
  const selectAsesoria = form.querySelector('#selectAsesoria') as HTMLSelectElement;
  const fechaProgramada = form.querySelector('#fechaProgramada') as HTMLInputElement;
  const horaInicio = form.querySelector('#horaInicio') as HTMLInputElement;
  const horaFin = form.querySelector('#horaFin') as HTMLInputElement;
  const supervisor = form.querySelector('#supervisor') as HTMLSelectElement;
  const vehiculo = form.querySelector('#vehiculo') as HTMLSelectElement;
  const observaciones = form.querySelector('#observaciones') as HTMLTextAreaElement;

  // Validar campos obligatorios
  if (!selectAsesoria.value || !fechaProgramada.value || !horaInicio.value) {
    mostrarToast('warning', 'Campos requeridos', 'Complete asesoría, fecha y hora de inicio');
    return;
  }

  const asesoria = asesoriasDisponibles.find(a => a.id == selectAsesoria.value);
  if (!asesoria) {
    mostrarToast('error', 'Asesoría inválida', 'No se encontró la orden seleccionada');
    return;
  }

  // Preparar payload
  const payload = {
    id_orden_asesoria: parseInt(selectAsesoria.value),
    fecha_programada: fechaProgramada.value,
    hora_inicio: horaInicio.value,
    hora_fin: horaFin?.value || undefined,
    id_supervisor: supervisor?.value ? parseInt(supervisor.value) : undefined,
    id_vehiculo: vehiculo?.value ? parseInt(vehiculo.value) : undefined,
    observaciones: observaciones.value || '',
    exponentes: exponentesSeleccionadosIds,
    dias_por_mes: obtenerDiasPorMesSeleccionados(),
    id_cliente_planta: asesoriaSeleccionadaActual?.id_cliente_planta ? Number(asesoriaSeleccionadaActual.id_cliente_planta) : undefined,
    id_cliente_planta_area: asesoriaSeleccionadaActual?.id_cliente_planta_area ? Number(asesoriaSeleccionadaActual.id_cliente_planta_area) : undefined,
  };

  try {
    const btnSubmit = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }

    const result = await programacionService.programarAsesoria(payload);

    if (result.success) {
      mostrarToast('success', 'Éxito', '✓ Asesoría programada correctamente');
      
      const modal = document.getElementById('modalProgramarAsesoria');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = 'auto';

      form.reset();

      window.dispatchEvent(new Event('asesoriaProgramada'));
    } else {
      mostrarToast('error', 'Error', result.message || 'No se pudo programar la asesoría');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('error', 'Error', 'No se pudo guardar la programación');
  }
}
