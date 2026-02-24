// Programaciones View — conectado a API real
import './programaciones.css';
import { programacionService } from './programaciones.service';
import { mostrarToast, confirmarAccion } from '../../shared/toast';
import type {
  Programacion,
  Tecnico,
  Vehiculo,
  ODSDisponible,
  EstadisticasProgramacion,
  EstadoEjecucion,
  VistaProgramacion,
  SugerenciaSiguiente,
} from './programaciones.types';

// ═══════════ Estado global ═══════════

let programacionesData: Programacion[] = [];
let tecnicosData: Tecnico[] = [];
let vehiculosData: Vehiculo[] = [];
let odsDisponibles: ODSDisponible[] = [];
let personalData: { id: number; nombre: string; apellidos: string }[] = [];
let estadisticas: EstadisticasProgramacion = {
  programados: 0, confirmados: 0, en_ejecucion: 0,
  completados: 0, reprogramados: 0, cancelados: 0, total: 0,
};

let vistaActual: VistaProgramacion = 'mensual';
let fechaActual = new Date();
let filtroEstados: EstadoEjecucion[] = ['Programado', 'Confirmado', 'En Camino', 'En Ejecución'];
let filtroTecnico: number | null = null;

// ═══════════ Render principal ═══════════

export function renderProgramaciones(): string {
  return `
    <div class="prog-page-header">
      <div class="prog-breadcrumb">Programación de Servicios</div>
      <div class="prog-actions">
        <select class="prog-view-selector" id="viewSelector">
          <option value="diaria" ${vistaActual === 'diaria' ? 'selected' : ''}>Vista Diaria</option>
          <option value="semanal" ${vistaActual === 'semanal' ? 'selected' : ''}>Vista Semanal</option>
          <option value="mensual" ${vistaActual === 'mensual' ? 'selected' : ''}>Vista Mensual</option>
        </select>
        <button class="prog-btn-primary" id="btnNuevaProgramacion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Programación
        </button>
      </div>
    </div>

    <div class="prog-layout">
      <div class="prog-sidebar" id="progSidebar">
        <p style="padding:16px;color:#999;">Cargando...</p>
      </div>
      <div class="prog-calendar-main" id="progCalendar">
        <p style="padding:24px;color:#999;">Cargando calendario...</p>
      </div>
    </div>

    <!-- Modales -->
    <div class="prog-modal" id="modalDetalleProgramacion" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2>Detalle de Programación</h2>
          <button class="prog-modal-close" id="closeModalDetalle">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalDetalleBody"></div>
      </div>
    </div>
    <div class="prog-modal" id="modalNuevaProgramacion" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2 id="tituloModalNueva">Nueva Programación de Servicio</h2>
          <button class="prog-modal-close" id="closeModalNueva">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalNuevaBody"></div>
      </div>
    </div>
    <div class="prog-modal" id="modalSugerencia" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content" style="max-width:520px;">
        <div class="prog-modal-header">
          <h2>Sugerencia de Siguiente Programación</h2>
          <button class="prog-modal-close" id="closeModalSugerencia">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalSugerenciaBody"></div>
      </div>
    </div>
  `;
}

// ═══════════ Inicialización ═══════════

export async function initProgramacionesEvents(): Promise<void> {
  await cargarDatosIniciales();

  renderSidebar();
  renderCalendario();

  document.getElementById('btnNuevaProgramacion')?.addEventListener('click', abrirModalNueva);
  document.getElementById('viewSelector')?.addEventListener('change', (e) => {
    vistaActual = (e.target as HTMLSelectElement).value as VistaProgramacion;
    renderCalendario();
  });

  document.getElementById('closeModalDetalle')?.addEventListener('click', () => cerrarModal('modalDetalleProgramacion'));
  document.getElementById('closeModalNueva')?.addEventListener('click', () => cerrarModal('modalNuevaProgramacion'));
  document.getElementById('closeModalSugerencia')?.addEventListener('click', () => cerrarModal('modalSugerencia'));
  document.querySelectorAll('.prog-modal-overlay').forEach(el => {
    el.addEventListener('click', () => {
      cerrarModal('modalDetalleProgramacion');
      cerrarModal('modalNuevaProgramacion');
      cerrarModal('modalSugerencia');
    });
  });
}

async function cargarDatosIniciales() {
  try {
    const [progRes, tecRes, vehRes, perRes, estRes] = await Promise.all([
      programacionService.getAll({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getTecnicos(),
      programacionService.getVehiculos(),
      programacionService.getPersonal(),
      programacionService.getEstadisticas(fechaActual.getMonth() + 1, fechaActual.getFullYear()),
    ]);
    programacionesData = (progRes.data || []).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
    }));
    tecnicosData = (tecRes.data || []).filter((t: Tecnico) => t.estado === 'Activo');
    vehiculosData = (vehRes.data || []).filter((v: Vehiculo) => v.estado === 'Activo');
    personalData = perRes.data || [];
    if (estRes.data) estadisticas = estRes.data;
  } catch (err) {
    console.error('Error cargando datos programaciones:', err);
  }
}

async function recargarProgramaciones() {
  try {
    const [progRes, estRes] = await Promise.all([
      programacionService.getAll({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getEstadisticas(fechaActual.getMonth() + 1, fechaActual.getFullYear()),
    ]);
    programacionesData = (progRes.data || []).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
    }));
    if (estRes.data) estadisticas = estRes.data;
  } catch (err) {
    console.error('Error recargando programaciones:', err);
  }
  renderSidebar();
  renderCalendario();
}

// ═══════════ Sidebar ═══════════

function renderSidebar() {
  const sidebar = document.getElementById('progSidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="prog-filter-section">
      <h3 class="prog-section-title">FILTROS</h3>
      <div class="prog-filter-group">
        <label class="prog-filter-label">Estado</label>
        <div class="prog-checkbox-group" id="filtroEstadosGroup">
          ${(['Programado', 'Confirmado', 'En Camino', 'En Ejecución', 'Realizado', 'Reprogramado', 'Cancelado'] as EstadoEjecucion[]).map(e => `
            <label class="prog-checkbox-item">
              <input type="checkbox" value="${e}" ${filtroEstados.includes(e) ? 'checked' : ''}> ${e}
            </label>
          `).join('')}
        </div>
      </div>
      <div class="prog-filter-group">
        <label class="prog-filter-label">Técnico</label>
        <select class="prog-filter-select" id="filtroTecnicoSelect">
          <option value="">Todos</option>
          ${tecnicosData.map(t => `<option value="${t.id}" ${filtroTecnico === t.id ? 'selected' : ''}>${t.nombre} ${t.apellidos}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="prog-stats">
      <div class="prog-stat-item"><div class="prog-stat-value">${estadisticas.programados}</div><div class="prog-stat-label">Programados</div></div>
      <div class="prog-stat-item"><div class="prog-stat-value">${estadisticas.completados}</div><div class="prog-stat-label">Completados</div></div>
      <div class="prog-stat-item"><div class="prog-stat-value">${estadisticas.total}</div><div class="prog-stat-label">Total</div></div>
    </div>

    <div class="prog-tech-section">
      <h3 class="prog-section-title">TÉCNICOS</h3>
      ${tecnicosData.map(t => {
        const hoy = programacionesData.filter(p => {
          if (p.fecha_programada !== todayStr()) return false;
          if (p.id_tecnico_asignado === t.id) return true;
          return p.tecnicos?.some(pt => pt.id === t.id) || false;
        }).length;
        return `
        <div class="prog-tech-item">
          <div class="prog-tech-avatar">${t.nombre[0]}${t.apellidos?.[0] || ''}</div>
          <div class="prog-tech-info">
            <div class="prog-tech-name">${t.nombre} ${t.apellidos}</div>
            <div class="prog-tech-status ${hoy === 0 ? 'available' : hoy < 3 ? 'busy' : 'full'}">${hoy === 0 ? 'Disponible' : `${hoy} servicio(s) hoy`}</div>
            ${t.autorizado_conducir ? '<div class="prog-tech-badge">Autorizado conducir</div>' : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;

  sidebar.querySelector('#filtroEstadosGroup')?.addEventListener('change', () => {
    const checks = sidebar.querySelectorAll('#filtroEstadosGroup input[type="checkbox"]:checked') as NodeListOf<HTMLInputElement>;
    filtroEstados = Array.from(checks).map(c => c.value as EstadoEjecucion);
    renderCalendario();
  });
  sidebar.querySelector('#filtroTecnicoSelect')?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    filtroTecnico = val ? parseInt(val) : null;
    renderCalendario();
  });
}

// ═══════════ Calendario ═══════════

function renderCalendario() {
  const container = document.getElementById('progCalendar');
  if (!container) return;

  if (vistaActual === 'mensual') container.innerHTML = renderVistaMensual();
  else if (vistaActual === 'semanal') container.innerHTML = renderVistaSemanal();
  else container.innerHTML = renderVistaDiaria();

  enlazarEventosCalendario();
}

function getProgramacionesFiltradas(): Programacion[] {
  let lista = programacionesData;
  if (filtroEstados.length > 0) lista = lista.filter(p => filtroEstados.includes(p.estado_ejecucion));
  if (filtroTecnico) lista = lista.filter(p => p.id_tecnico_asignado === filtroTecnico);
  return lista;
}

function renderVistaMensual(): string {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekDay = (firstDay.getDay() + 6) % 7; // Lunes = 0
  const daysInMonth = lastDay.getDate();
  const todayS = todayStr();
  const programaciones = getProgramacionesFiltradas();

  let diasHTML = '';
  const prevMonthLast = new Date(year, month, 0).getDate();
  for (let i = startWeekDay - 1; i >= 0; i--) {
    diasHTML += `<div class="prog-calendar-day other-month"><span class="prog-day-number">${prevMonthLast - i}</span></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayS;
    const servicios = programaciones.filter(p => p.fecha_programada === dateStr);
    diasHTML += `
      <div class="prog-calendar-day ${isToday ? 'highlighted' : ''}">
        <span class="prog-day-number">${d}</span>
        ${servicios.slice(0, 3).map(s => `
          <div class="prog-event ${getColorByState(s.estado_ejecucion)}" data-prog-id="${s.id}">
            <div class="prog-event-title">${s.servicio?.nombre || 'Servicio'}</div>
            <div class="prog-event-time">${fmtH(s.hora_inicio)}${s.hora_fin ? ' - ' + fmtH(s.hora_fin) : ''}</div>
          </div>
        `).join('')}
        ${servicios.length > 3 ? `<div class="prog-event-more">+${servicios.length - 3} más</div>` : ''}
      </div>`;
  }
  const totalCells = startWeekDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    diasHTML += `<div class="prog-calendar-day other-month"><span class="prog-day-number">${i}</span></div>`;
  }

  return `
    <div class="prog-calendar-header">
      <h2>${monthNames[month]} ${year}</h2>
      <div class="prog-calendar-nav">
        <button class="prog-btn-icon" id="btnPrev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        <button class="prog-btn-secondary" id="btnHoy">Hoy</button>
        <button class="prog-btn-icon" id="btnNext"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
      </div>
    </div>
    <div class="prog-calendar-grid">
      <div class="prog-calendar-weekdays">
        <div class="prog-weekday">LUN</div><div class="prog-weekday">MAR</div><div class="prog-weekday">MIÉ</div>
        <div class="prog-weekday">JUE</div><div class="prog-weekday">VIE</div><div class="prog-weekday">SÁB</div><div class="prog-weekday">DOM</div>
      </div>
      <div class="prog-calendar-days">${diasHTML}</div>
    </div>`;
}

function renderVistaSemanal(): string {
  const lunes = getLunesDeSemana(fechaActual);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(d.getDate() + i);
    return d;
  });
  const diasLabel = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const programaciones = getProgramacionesFiltradas();
  const todayS = todayStr();
  const rangoTxt = `${dias[0].toLocaleDateString('es-PE')} - ${dias[6].toLocaleDateString('es-PE')}`;

  return `
    <div class="prog-calendar-header">
      <h2>Semana: ${rangoTxt}</h2>
      <div class="prog-calendar-nav">
        <button class="prog-btn-icon" id="btnPrev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        <button class="prog-btn-secondary" id="btnHoy">Hoy</button>
        <button class="prog-btn-icon" id="btnNext"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
      </div>
    </div>
    <div class="prog-week-view">
      <div class="prog-week-timeline">
        <div class="prog-week-days">
          ${dias.map((d, i) => {
            const dateStr = fmtDate(d);
            const isToday = dateStr === todayS;
            const servicios = programaciones.filter(p => p.fecha_programada === dateStr);
            return `
            <div class="prog-week-day-column ${isToday ? 'today' : ''}">
              <div class="prog-week-day-header">${diasLabel[i]} ${d.getDate()}</div>
              <div class="prog-week-day-slots">
                ${servicios.map(s => {
                  const color = getColorByState(s.estado_ejecucion);
                  return `
                  <div class="prog-week-card prog-week-card-${color}" data-prog-id="${s.id}">
                    <div class="prog-week-card-title">${s.servicio?.nombre || 'Servicio'}</div>
                    <div class="prog-week-card-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${fmtH(s.hora_inicio)}${s.hora_fin ? ' - ' + fmtH(s.hora_fin) : ''}</div>
                    <div class="prog-week-card-tech"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${s.tecnicos && s.tecnicos.length > 0 ? s.tecnicos.map(t => t.nombre).join(', ') : (s.tecnico ? s.tecnico.nombre : '—')}</div>
                    <span class="prog-week-card-badge">${s.estado_ejecucion}</span>
                  </div>`;
                }).join('')}
                ${servicios.length === 0 ? '<div class="prog-week-empty">Sin programaciones</div>' : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

function renderVistaDiaria(): string {
  const dateStr = fmtDate(fechaActual);
  const programaciones = getProgramacionesFiltradas().filter(p => p.fecha_programada === dateStr);
  const fechaLabel = fechaActual.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div class="prog-calendar-header">
      <h2>${fechaLabel}</h2>
      <div class="prog-calendar-nav">
        <button class="prog-btn-icon" id="btnPrev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        <button class="prog-btn-secondary" id="btnHoy">Hoy</button>
        <button class="prog-btn-icon" id="btnNext"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
      </div>
    </div>
    <div class="prog-day-view">
      <div class="prog-day-timeline">
        <div class="prog-day-services">
          ${programaciones.length > 0 ? programaciones.map(s => `
            <div class="prog-day-service-card" data-prog-id="${s.id}">
              <div class="prog-day-service-time">
                <div class="prog-time-badge">${fmtH(s.hora_inicio)}</div>
                <div class="prog-time-line"></div>
                <div class="prog-time-badge">${fmtH(s.hora_fin || '')}</div>
              </div>
              <div class="prog-day-service-content">
                <div class="prog-day-service-header">
                  <h3>${s.servicio?.nombre || 'Servicio'}</h3>
                  <span class="prog-status-badge ${s.estado_ejecucion}">${s.estado_ejecucion}</span>
                </div>
                <div class="prog-day-service-details">
                  <div><strong>Cliente:</strong> ${clienteNombre(s)}</div>
                  <div><strong>Técnico:</strong> ${s.tecnicos && s.tecnicos.length > 0 ? s.tecnicos.map(t => t.nombre + ' ' + t.apellidos).join(', ') : (s.tecnico ? s.tecnico.nombre + ' ' + s.tecnico.apellidos : 'Sin asignar')}</div>
                  <div><strong>Local:</strong> ${s.local_sede || '—'}</div>
                  ${s.vehiculo ? `<div><strong>Vehículo:</strong> ${s.vehiculo.placa} - ${s.vehiculo.marca} ${s.vehiculo.modelo}</div>` : ''}
                </div>
              </div>
            </div>
          `).join('') : '<div class="prog-no-services">No hay servicios programados para este día</div>'}
        </div>
      </div>
    </div>`;
}

function enlazarEventosCalendario() {
  document.getElementById('btnPrev')?.addEventListener('click', () => {
    if (vistaActual === 'mensual') fechaActual.setMonth(fechaActual.getMonth() - 1);
    else if (vistaActual === 'semanal') fechaActual.setDate(fechaActual.getDate() - 7);
    else fechaActual.setDate(fechaActual.getDate() - 1);
    recargarProgramaciones();
  });
  document.getElementById('btnNext')?.addEventListener('click', () => {
    if (vistaActual === 'mensual') fechaActual.setMonth(fechaActual.getMonth() + 1);
    else if (vistaActual === 'semanal') fechaActual.setDate(fechaActual.getDate() + 7);
    else fechaActual.setDate(fechaActual.getDate() + 1);
    recargarProgramaciones();
  });
  document.getElementById('btnHoy')?.addEventListener('click', () => {
    fechaActual = new Date();
    recargarProgramaciones();
  });

  document.querySelectorAll('[data-prog-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((el as HTMLElement).dataset.progId || '0');
      if (id) abrirModalDetalle(id);
    });
  });
}

// ═══════════ Modal Detalle ═══════════

async function abrirModalDetalle(id: number) {
  const modal = document.getElementById('modalDetalleProgramacion');
  const body = document.getElementById('modalDetalleBody');
  if (!modal || !body) return;

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const res = await programacionService.getById(id);
    const p = res.data;
    if (!p) { body.innerHTML = '<p style="padding:24px;">No encontrado</p>'; return; }

    body.innerHTML = `
      <div class="prog-detalle-grid" id="detalleView">
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Información del Servicio</h3>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Servicio:</div><div class="prog-detalle-value">${p.servicio?.nombre || '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">ODS:</div><div class="prog-detalle-value">${p.orden_servicio?.numero_orden || '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Estado:</div><div class="prog-detalle-value"><span class="prog-status-badge ${p.estado_ejecucion}">${p.estado_ejecucion}</span></div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${new Date(p.fecha_programada + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Horario:</div><div class="prog-detalle-value">${fmtH(p.hora_inicio)} - ${fmtH(p.hora_fin || '')}</div></div>
        </div>
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Cliente y Ubicación</h3>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Cliente:</div><div class="prog-detalle-value">${clienteNombre(p)}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Local:</div><div class="prog-detalle-value">${p.local_sede || '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Dirección:</div><div class="prog-detalle-value">${p.direccion_completa || '—'}</div></div>
        </div>
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Recursos Asignados</h3>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Técnico(s):</div><div class="prog-detalle-value">${
            p.tecnicos && p.tecnicos.length > 0
              ? p.tecnicos.map(t => `<span style="display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;padding:2px 10px;border-radius:6px;margin:2px 4px 2px 0;font-size:13px;">${t.nombre} ${t.apellidos}${t.pivot?.rol === 'Principal' ? ' <span style="font-size:10px;background:#dcfce7;color:#16a34a;padding:0 5px;border-radius:3px;font-weight:600;">Principal</span>' : ''}</span>`).join('')
              : (p.tecnico ? p.tecnico.nombre + ' ' + p.tecnico.apellidos : '—')
          }</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Supervisor:</div><div class="prog-detalle-value">${p.supervisor ? p.supervisor.nombre + ' ' + p.supervisor.apellidos : '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Vehículo:</div><div class="prog-detalle-value">${p.vehiculo ? p.vehiculo.placa + ' - ' + p.vehiculo.marca + ' ' + p.vehiculo.modelo : '—'}</div></div>
        </div>
        ${p.insumos && p.insumos.length > 0 ? `
        <div class="prog-detalle-section prog-detalle-section-full">
          <h3 class="prog-detalle-section-title">Insumos / Productos</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;">Producto</th><th style="padding:8px;">Cant. Asignada</th><th style="padding:8px;">Cant. Utilizada</th><th style="padding:8px;">Estado</th></tr></thead>
            <tbody>${p.insumos.map(ins => `
              <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">${ins.producto?.descripcion || '—'}</td><td style="padding:8px;text-align:center;">${ins.cantidad_asignada}</td><td style="padding:8px;text-align:center;">${ins.cantidad_utilizada ?? '—'}</td><td style="padding:8px;text-align:center;">${ins.estado}</td></tr>
            `).join('')}</tbody>
          </table>
        </div>` : ''}
        ${p.observaciones ? `<div class="prog-detalle-section prog-detalle-section-full"><h3 class="prog-detalle-section-title">Observaciones</h3><div class="prog-detalle-observaciones">${p.observaciones}</div></div>` : ''}
        <div class="prog-modal-footer">
          <button type="button" class="prog-btn-danger" id="btnEliminarProg">Eliminar</button>
          ${!['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-warning" id="btnCancelarProg">Cancelar Servicio</button>` : ''}
          ${!['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-primary" id="btnEditarProg">Editar</button>` : ''}
          ${!['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-primary" style="background:#10b981;" id="btnCompletarProg">Marcar Realizado</button>` : ''}
        </div>
      </div>`;

    body.querySelector('#btnEliminarProg')?.addEventListener('click', () => eliminarProg(p.id));
    body.querySelector('#btnCancelarProg')?.addEventListener('click', () => cancelarProg(p.id));
    body.querySelector('#btnEditarProg')?.addEventListener('click', () => abrirEdicion(p));
    body.querySelector('#btnCompletarProg')?.addEventListener('click', () => completarProg(p.id));
  } catch (err) {
    body.innerHTML = '<p style="padding:24px;color:red;">Error al cargar detalle</p>';
    console.error(err);
  }
}

async function eliminarProg(id: number) {
  const ok = await confirmarAccion({ titulo: 'Eliminar Programación', mensaje: '¿Está seguro de eliminar esta programación? Esta acción no se puede deshacer.', tipo: 'error', textoConfirmar: 'Eliminar' });
  if (!ok) return;
  try {
    await programacionService.delete(id);
    cerrarModal('modalDetalleProgramacion');
    await recargarProgramaciones();
    mostrarToast('success', 'Eliminada', 'La programación fue eliminada correctamente');
  } catch (err) { mostrarToast('error', 'Error', 'No se pudo eliminar la programación'); console.error(err); }
}

async function cancelarProg(id: number) {
  const ok = await confirmarAccion({ titulo: 'Cancelar Programación', mensaje: '¿Está seguro de cancelar esta programación?', tipo: 'warning', textoConfirmar: 'Sí, cancelar' });
  if (!ok) return;
  try {
    await programacionService.update(id, { estado_ejecucion: 'Cancelado' });
    cerrarModal('modalDetalleProgramacion');
    await recargarProgramaciones();
    mostrarToast('success', 'Cancelada', 'La programación fue cancelada');
  } catch (err) { mostrarToast('error', 'Error', 'No se pudo cancelar la programación'); console.error(err); }
}

async function completarProg(id: number) {
  const ok = await confirmarAccion({ titulo: 'Marcar como Realizado', mensaje: '¿Confirma que el servicio fue realizado exitosamente?', tipo: 'success', textoConfirmar: 'Sí, realizado' });
  if (!ok) return;
  try {
    const res = await programacionService.completar(id);
    cerrarModal('modalDetalleProgramacion');
    await recargarProgramaciones();
    mostrarToast('success', 'Completada', 'La programación fue marcada como realizada');
    if (res.sugerencia_siguiente) mostrarModalSugerencia(res.sugerencia_siguiente);
  } catch (err) { mostrarToast('error', 'Error', 'No se pudo completar la programación'); console.error(err); }
}

// ═══════════ Modal Sugerencia ═══════════

function mostrarModalSugerencia(sug: SugerenciaSiguiente) {
  const modal = document.getElementById('modalSugerencia');
  const body = document.getElementById('modalSugerenciaBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="padding:8px 0;">
      <p style="margin-bottom:16px;">Este servicio tiene frecuencia <strong>${sug.frecuencia}</strong>. Se sugiere programar la siguiente visita:</p>
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="margin-bottom:8px;"><strong>Fecha sugerida:</strong> ${new Date(sug.fecha_sugerida + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div style="margin-bottom:8px;"><strong>Horario:</strong> ${fmtH(sug.hora_inicio || '')} - ${fmtH(sug.hora_fin || '')}</div>
        <div><strong>Local:</strong> ${sug.local_sede || '—'}</div>
      </div>
      <div class="prog-modal-footer" style="justify-content:flex-end;gap:8px;">
        <button type="button" class="prog-btn-secondary" id="btnDescartarSug">Descartar</button>
        <button type="button" class="prog-btn-primary" id="btnAceptarSug">Crear Programación</button>
      </div>
    </div>`;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  body.querySelector('#btnDescartarSug')?.addEventListener('click', () => cerrarModal('modalSugerencia'));
  body.querySelector('#btnAceptarSug')?.addEventListener('click', async () => {
    try {
      await programacionService.create({
        id_orden_servicio: sug.id_orden_servicio,
        id_servicio: sug.id_servicio,
        id_tecnico_asignado: sug.id_tecnico_asignado,
        id_supervisor: sug.id_supervisor || null,
        id_vehiculo: sug.id_vehiculo || null,
        tecnicos_ids: sug.tecnicos_ids || [sug.id_tecnico_asignado],
        fecha_programada: sug.fecha_sugerida,
        hora_inicio: sug.hora_inicio || '08:00',
        hora_fin: sug.hora_fin || '12:00',
        local_sede: sug.local_sede || '',
        direccion_completa: sug.direccion_completa || '',
      });
      cerrarModal('modalSugerencia');
      await recargarProgramaciones();
      mostrarToast('success', 'Programación Creada', 'La siguiente programación fue creada exitosamente');
    } catch (err) { mostrarToast('error', 'Error', 'No se pudo crear la siguiente programación'); console.error(err); }
  });
}

// ═══════════ Modal Edición ═══════════

function abrirEdicion(p: Programacion) {
  const body = document.getElementById('modalDetalleBody');
  if (!body) return;

  body.innerHTML = `
    <form id="formEditarProg" class="prog-form">
      <div class="prog-form-grid">
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Información</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Estado</label>
            <select class="prog-form-control" name="estado_ejecucion">
              ${(['Programado', 'Confirmado', 'En Camino', 'En Ejecución'] as string[]).map(e => `<option value="${e}" ${p.estado_ejecucion === e ? 'selected' : ''}>${e}</option>`).join('')}
            </select>
          </div>
          <div class="prog-form-row">
            <div class="prog-form-group"><label class="prog-form-label">Fecha</label><input type="date" class="prog-form-control" name="fecha_programada" value="${p.fecha_programada}"></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Inicio</label><input type="time" class="prog-form-control" name="hora_inicio" value="${fmtH(p.hora_inicio)}"></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="${fmtH(p.hora_fin || '')}"></div>
          </div>
        </div>
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Recursos</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Técnicos Asignados <span style="font-weight:400;font-size:12px;color:#888;">(primero = principal)</span></label>
            <div class="prog-tecnicos-list" id="editTecnicosCheckboxes" style="max-height:180px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">
              ${tecnicosData.map(t => {
                const isAssigned = p.tecnicos?.some(pt => pt.id === t.id) || t.id === p.id_tecnico_asignado;
                const isPrincipal = t.id === p.id_tecnico_asignado;
                return `
                <label class="prog-tecnico-check" style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:13px;">
                  <input type="checkbox" name="tecnicos_ids" value="${t.id}" ${isAssigned ? 'checked' : ''} style="accent-color:#4f7cff;">
                  <span style="font-weight:500;">${t.nombre} ${t.apellidos}</span>
                  ${t.autorizado_conducir ? '<span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:4px;">Conductor</span>' : ''}
                  <span class="prog-principal-badge" style="${isPrincipal ? '' : 'display:none;'}margin-left:auto;font-size:11px;background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:4px;font-weight:600;">Principal</span>
                </label>`;
              }).join('')}
            </div>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Supervisor</label>
            <select class="prog-form-control" name="id_supervisor">
              <option value="">Sin supervisor</option>
              ${personalData.map(pe => `<option value="${pe.id}" ${pe.id === p.id_supervisor ? 'selected' : ''}>${pe.nombre} ${pe.apellidos}</option>`).join('')}
            </select>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Vehículo</label>
            <select class="prog-form-control" name="id_vehiculo">
              <option value="">Sin vehículo</option>
              ${vehiculosData.map(v => `<option value="${v.id}" ${v.id === p.id_vehiculo ? 'selected' : ''}>${v.placa} - ${v.marca} ${v.modelo}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="prog-form-section prog-form-section-full">
          <h3 class="prog-form-section-title">Ubicación</h3>
          <div class="prog-form-row">
            <div class="prog-form-group"><label class="prog-form-label">Local/Sede</label><input type="text" class="prog-form-control" name="local_sede" value="${p.local_sede || ''}"></div>
            <div class="prog-form-group"><label class="prog-form-label">Dirección</label><input type="text" class="prog-form-control" name="direccion_completa" value="${p.direccion_completa || ''}"></div>
          </div>
          <div class="prog-form-group"><label class="prog-form-label">Observaciones</label><textarea class="prog-form-control" name="observaciones" rows="2">${p.observaciones || ''}</textarea></div>
        </div>
      </div>
      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnVolverDetalle">Cancelar</button>
        <button type="submit" class="prog-btn-primary">Guardar Cambios</button>
      </div>
    </form>`;

  body.querySelector('#btnVolverDetalle')?.addEventListener('click', () => abrirModalDetalle(p.id));

  // Lógica de badge "Principal" para edición
  setupPrincipalBadge(body.querySelector('#editTecnicosCheckboxes') as HTMLElement);

  body.querySelector('#formEditarProg')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => { if (k !== 'tecnicos_ids') data[k] = v || null; });

    // Recoger técnicos
    const checkedTecs = Array.from(body.querySelectorAll('#editTecnicosCheckboxes input[name="tecnicos_ids"]:checked')) as HTMLInputElement[];
    if (checkedTecs.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }
    const tecnicosIds = checkedTecs.map(c => parseInt(c.value));
    data.id_tecnico_asignado = tecnicosIds[0];
    data.tecnicos_ids = tecnicosIds;

    try {
      await programacionService.update(p.id, data);
      cerrarModal('modalDetalleProgramacion');
      await recargarProgramaciones();
      mostrarToast('success', 'Actualizada', 'La programación fue actualizada correctamente');
    } catch (err) { mostrarToast('error', 'Error', 'No se pudieron guardar los cambios'); console.error(err); }
  });
}

// ═══════════ Modal Nueva Programación ═══════════

async function abrirModalNueva() {
  const modal = document.getElementById('modalNuevaProgramacion');
  const body = document.getElementById('modalNuevaBody');
  if (!modal || !body) return;

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando ODS disponibles...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const res = await programacionService.getODSDisponibles();
    odsDisponibles = res.data || [];
  } catch (err) { console.error('Error cargando ODS:', err); odsDisponibles = []; }

  renderFormNueva(body);
}

function renderFormNueva(body: HTMLElement) {
  body.innerHTML = `
    <form id="formNuevaProg" class="prog-form">
      <div class="prog-form-grid">

        <!-- ODS -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Orden de Servicio</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">ODS Aprobada <span class="prog-required">*</span></label>
            <select class="prog-form-control" name="id_orden_servicio" id="selectODS" required>
              <option value="">Seleccionar orden...</option>
              ${odsDisponibles.map(o => `<option value="${o.id}">${o.numero_orden} — ${o.cliente}</option>`).join('')}
            </select>
          </div>
          <div id="detallesODS"></div>
          <div class="prog-form-group" id="grupoServicio" style="display:none;">
            <label class="prog-form-label">Servicio <span class="prog-required">*</span></label>
            <select class="prog-form-control" name="id_servicio" id="selectServicio" required>
              <option value="">Seleccionar servicio...</option>
            </select>
          </div>
          <div id="infoFrecuencia" style="display:none;margin-top:8px;padding:10px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:13px;"></div>
        </div>

        <!-- Modo -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Tipo de Programación</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Modo</label>
            <div style="display:flex;gap:12px;margin-top:4px;">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="radio" name="modo" value="individual" checked> Individual</label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="radio" name="modo" value="anual"> Año Completo</label>
            </div>
          </div>
          <div id="seccionIndividual">
            <div class="prog-form-row">
              <div class="prog-form-group"><label class="prog-form-label">Fecha <span class="prog-required">*</span></label><input type="date" class="prog-form-control" name="fecha_programada" required></div>
              <div class="prog-form-group"><label class="prog-form-label">Hora Inicio <span class="prog-required">*</span></label><input type="time" class="prog-form-control" name="hora_inicio" value="08:00" required></div>
              <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="12:00"></div>
            </div>
          </div>
          <div id="seccionAnual" style="display:none;">
            <div class="prog-form-row">
              <div class="prog-form-group"><label class="prog-form-label">Fecha Inicio <span class="prog-required">*</span></label><input type="date" class="prog-form-control" name="fecha_inicio_anual" id="fechaInicioAnual"></div>
              <div class="prog-form-group"><label class="prog-form-label">Hora Inicio</label><input type="time" class="prog-form-control" name="hora_inicio_anual" value="08:00"></div>
              <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin_anual" value="12:00"></div>
            </div>
            <button type="button" class="prog-btn-secondary" id="btnPreviewAnual" style="margin-top:8px;">Vista Previa de Fechas</button>
            <div id="previewAnualResult" style="margin-top:12px;"></div>
          </div>
        </div>

        <!-- Recursos -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Asignación de Recursos</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Técnicos <span class="prog-required">*</span> <span style="font-weight:400;font-size:12px;color:#888;">(el primero marcado será el principal)</span></label>
            <div class="prog-tecnicos-list" id="tecnicosCheckboxes" style="max-height:180px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">
              ${tecnicosData.map(t => `
                <label class="prog-tecnico-check" style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:13px;transition:background .15s;">
                  <input type="checkbox" name="tecnicos_ids" value="${t.id}" style="accent-color:#4f7cff;">
                  <span style="font-weight:500;">${t.nombre} ${t.apellidos}</span>
                  ${t.autorizado_conducir ? '<span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:4px;">Conductor</span>' : ''}
                  <span class="prog-principal-badge" style="display:none;margin-left:auto;font-size:11px;background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:4px;font-weight:600;">Principal</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Supervisor</label>
            <select class="prog-form-control" name="id_supervisor">
              <option value="">Sin supervisor</option>
              ${personalData.map(pe => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('')}
            </select>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Vehículo</label>
            <select class="prog-form-control" name="id_vehiculo">
              <option value="">Sin vehículo</option>
              ${vehiculosData.map(v => `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Ubicación -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Ubicación</h3>
          <div class="prog-form-group"><label class="prog-form-label">Local/Sede</label><input type="text" class="prog-form-control" name="local_sede" id="inputLocalSede" placeholder="Ej: Planta Principal"></div>
          <div class="prog-form-group"><label class="prog-form-label">Dirección Completa</label><textarea class="prog-form-control" name="direccion_completa" id="inputDireccion" rows="2" placeholder="Dirección completa"></textarea></div>
          <div class="prog-form-group"><label class="prog-form-label">Observaciones</label><textarea class="prog-form-control" name="observaciones" rows="2"></textarea></div>
        </div>
      </div>

      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnCancelarNueva">Cancelar</button>
        <button type="submit" class="prog-btn-primary" id="btnSubmitNueva">Crear Programación</button>
      </div>
    </form>`;

  // ── Eventos formulario ──
  const selectODS = body.querySelector('#selectODS') as HTMLSelectElement;
  const selectServicio = body.querySelector('#selectServicio') as HTMLSelectElement;

  // Lógica de badge "Principal" para técnicos
  setupPrincipalBadge(body.querySelector('#tecnicosCheckboxes') as HTMLElement);

  selectODS?.addEventListener('change', () => {
    const odsId = parseInt(selectODS.value);
    const ods = odsDisponibles.find(o => o.id === odsId);
    const grupoServicio = body.querySelector('#grupoServicio') as HTMLElement;
    const detallesDiv = body.querySelector('#detallesODS') as HTMLElement;

    if (ods && ods.detalles.length > 0) {
      selectServicio.innerHTML = '<option value="">Seleccionar servicio...</option>' +
        ods.detalles.map(d => `<option value="${d.id_servicio}" data-frecuencia="${d.frecuencia || ''}" data-local="${d.local || ''}">${d.servicio_nombre}${d.frecuencia ? ' (' + d.frecuencia + ')' : ''}</option>`).join('');
      grupoServicio.style.display = 'block';
      detallesDiv.innerHTML = `<div style="margin-top:8px;padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;">
        <strong>Cliente:</strong> ${ods.cliente} &nbsp;|&nbsp; <strong>Servicios:</strong> ${ods.detalles.length}
      </div>`;
    } else {
      grupoServicio.style.display = 'none';
      detallesDiv.innerHTML = '';
    }
    (body.querySelector('#infoFrecuencia') as HTMLElement).style.display = 'none';
  });

  selectServicio?.addEventListener('change', () => {
    const opt = selectServicio.selectedOptions[0];
    const frecuencia = opt?.dataset.frecuencia || '';
    const local = opt?.dataset.local || '';
    const infoDiv = body.querySelector('#infoFrecuencia') as HTMLElement;

    if (frecuencia) {
      infoDiv.innerHTML = `Frecuencia: <strong>${frecuencia}</strong>. ${frecuencia.toLowerCase() !== 'única' ? 'Puedes usar "Año Completo" para programar todas las fechas automáticamente.' : ''}`;
      infoDiv.style.display = 'block';
    } else { infoDiv.style.display = 'none'; }

    if (local) (body.querySelector('#inputLocalSede') as HTMLInputElement).value = local;
  });

  body.querySelectorAll('input[name="modo"]').forEach(r => r.addEventListener('change', () => {
    const modo = (body.querySelector('input[name="modo"]:checked') as HTMLInputElement).value;
    (body.querySelector('#seccionIndividual') as HTMLElement).style.display = modo === 'individual' ? 'block' : 'none';
    (body.querySelector('#seccionAnual') as HTMLElement).style.display = modo === 'anual' ? 'block' : 'none';
    (body.querySelector('#btnSubmitNueva') as HTMLElement).textContent = modo === 'anual' ? 'Crear Programación Anual' : 'Crear Programación';
    // Toggle required según modo visible para evitar error de validación en campos ocultos
    const indFields = body.querySelectorAll('#seccionIndividual input[name="fecha_programada"], #seccionIndividual input[name="hora_inicio"]');
    indFields.forEach(el => { if (modo === 'individual') el.setAttribute('required', ''); else el.removeAttribute('required'); });
    const anualFields = body.querySelectorAll('#seccionAnual input[required], #seccionAnual select[required]');
    anualFields.forEach(el => { if (modo === 'anual') el.setAttribute('required', ''); else el.removeAttribute('required'); });
  }));

  // Preview Anual
  body.querySelector('#btnPreviewAnual')?.addEventListener('click', async () => {
    const idServicio = parseInt(selectServicio.value);
    const opt = selectServicio.selectedOptions[0];
    const frecuencia = opt?.dataset.frecuencia || '';
    const fechaInicio = (body.querySelector('#fechaInicioAnual') as HTMLInputElement).value;
    const resultDiv = body.querySelector('#previewAnualResult') as HTMLElement;

    if (!idServicio || !frecuencia || !fechaInicio) {
      resultDiv.innerHTML = '<p style="color:#ef4444;">Seleccione servicio con frecuencia y fecha de inicio</p>';
      return;
    }
    resultDiv.innerHTML = '<p style="color:#999;">Calculando fechas...</p>';

    try {
      const res = await programacionService.previewAnual({ id_servicio: idServicio, frecuencia, fecha_inicio: fechaInicio });
      const preview = res.data;
      if (!preview) { resultDiv.innerHTML = '<p>Sin datos</p>'; return; }
      resultDiv.innerHTML = `
        <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="padding:12px 16px;background:#f9fafb;font-weight:600;font-size:13px;">Se crearán <strong>${preview.total_programaciones}</strong> programaciones</div>
          <div style="max-height:200px;overflow-y:auto;padding:8px 16px;">
            ${preview.fechas.map((f: string, i: number) => `
              <div style="padding:4px 0;font-size:13px;border-bottom:1px solid #f3f4f6;">
                ${i + 1}. ${new Date(f + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            `).join('')}
          </div>
          ${preview.stock && preview.stock.length > 0 ? `
          <div style="padding:12px 16px;background:#fffbeb;border-top:1px solid #fde68a;">
            <div style="font-weight:600;font-size:13px;margin-bottom:6px;">Validación de Stock</div>
            <table style="width:100%;font-size:12px;border-collapse:collapse;">
              <tr style="background:#fef3c7;"><th style="padding:4px 8px;text-align:left;">Producto</th><th style="padding:4px 8px;">Necesario</th><th style="padding:4px 8px;">Disponible</th><th style="padding:4px 8px;">Estado</th></tr>
              ${preview.stock.map(s => `
                <tr><td style="padding:4px 8px;">${s.producto}</td><td style="padding:4px 8px;text-align:center;">${s.total_necesario}</td><td style="padding:4px 8px;text-align:center;">${s.stock_disponible}</td><td style="padding:4px 8px;text-align:center;">${s.suficiente ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" style="vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" style="vertical-align:middle;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Insuficiente'}</td></tr>
              `).join('')}
            </table>
          </div>` : ''}
        </div>`;
    } catch (err) { resultDiv.innerHTML = '<p style="color:#ef4444;">Error al previsualizar</p>'; console.error(err); }
  });

  // Submit
  body.querySelector('#formNuevaProg')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const modo = (body.querySelector('input[name="modo"]:checked') as HTMLInputElement).value;
    if (modo === 'anual') await submitAnual(body);
    else await submitIndividual(body);
  });

  body.querySelector('#btnCancelarNueva')?.addEventListener('click', () => cerrarModal('modalNuevaProgramacion'));
}

async function submitIndividual(body: HTMLElement) {
  const fd = new FormData(body.querySelector('#formNuevaProg') as HTMLFormElement);
  const data: Record<string, any> = {};
  fd.forEach((v, k) => { if (!k.includes('anual') && k !== 'modo' && k !== 'tecnicos_ids') data[k] = v || null; });

  // Recoger técnicos seleccionados
  const checkedTecs = Array.from(body.querySelectorAll('input[name="tecnicos_ids"]:checked')) as HTMLInputElement[];
  if (checkedTecs.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }
  const tecnicosIds = checkedTecs.map(c => parseInt(c.value));
  data.id_tecnico_asignado = tecnicosIds[0]; // Primero = principal
  data.tecnicos_ids = tecnicosIds;

  try {
    await programacionService.create(data);
    cerrarModal('modalNuevaProgramacion');
    await recargarProgramaciones();
    mostrarToast('success', 'Programación Creada', 'La programación fue registrada exitosamente');
  } catch (err: any) {
    mostrarToast('error', 'Error', err?.response?.data?.message || 'No se pudo crear la programación');
    console.error(err);
  }
}

async function submitAnual(body: HTMLElement) {
  const selectODS = body.querySelector('#selectODS') as HTMLSelectElement;
  const selectServicio = body.querySelector('#selectServicio') as HTMLSelectElement;
  const opt = selectServicio.selectedOptions[0];
  const frecuencia = opt?.dataset.frecuencia || '';
  const fechaInicio = (body.querySelector('[name="fecha_inicio_anual"]') as HTMLInputElement).value;
  const horaInicio = (body.querySelector('[name="hora_inicio_anual"]') as HTMLInputElement).value;
  const horaFin = (body.querySelector('[name="hora_fin_anual"]') as HTMLInputElement).value;

  if (!frecuencia || !fechaInicio) { mostrarToast('warning', 'Datos incompletos', 'Seleccione un servicio con frecuencia y fecha de inicio'); return; }

  // Recoger técnicos seleccionados
  const checkedTecs = Array.from(body.querySelectorAll('input[name="tecnicos_ids"]:checked')) as HTMLInputElement[];
  if (checkedTecs.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }
  const tecnicosIds = checkedTecs.map(c => parseInt(c.value));

  const ok = await confirmarAccion({ titulo: 'Programación Anual', mensaje: `Se crearán todas las programaciones del año para frecuencia <strong>"${frecuencia}"</strong>. ¿Desea continuar?`, tipo: 'warning', textoConfirmar: 'Sí, crear todas' });
  if (!ok) return;

  const fd = new FormData(body.querySelector('#formNuevaProg') as HTMLFormElement);
  const data: Record<string, any> = {
    id_orden_servicio: selectODS.value,
    id_servicio: selectServicio.value,
    id_tecnico_asignado: tecnicosIds[0],
    tecnicos_ids: tecnicosIds,
    id_supervisor: fd.get('id_supervisor') || null,
    id_vehiculo: fd.get('id_vehiculo') || null,
    frecuencia,
    fecha_inicio: fechaInicio,
    hora_inicio: horaInicio || '08:00',
    hora_fin: horaFin || '12:00',
    local_sede: fd.get('local_sede') || '',
    direccion_completa: fd.get('direccion_completa') || '',
    observaciones: fd.get('observaciones') || '',
  };

  try {
    const res = await programacionService.createAnual(data);
    cerrarModal('modalNuevaProgramacion');
    await recargarProgramaciones();
    const total = res.total_programaciones || (res.data ? res.data.length : 0);
    mostrarToast('success', 'Programación Anual Creada', `Se crearon ${total} programaciones exitosamente`);
  } catch (err: any) {
    mostrarToast('error', 'Error', err?.response?.data?.message || 'No se pudo crear la programación anual');
    console.error(err);
  }
}

// ═══════════ Utilidades ═══════════

function cerrarModal(id: string) {
  const modal = document.getElementById(id);
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

function getColorByState(estado: string): string {
  const c: Record<string, string> = {
    'Programado': 'blue', 'Confirmado': 'green', 'En Camino': 'cyan',
    'En Ejecución': 'orange', 'Realizado': 'purple', 'Reprogramado': 'yellow', 'Cancelado': 'gray',
  };
  return c[estado] || 'blue';
}

function clienteNombre(p: Programacion): string {
  const c = p.orden_servicio?.cliente;
  return c ? (c.nombre_empresa || c.persona_contacto || '—') : '—';
}

function fmtH(h: string): string { return h ? h.substring(0, 5) : ''; }

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr(): string { return fmtDate(new Date()); }

/** Normaliza fecha ISO/datetime a "YYYY-MM-DD" */
function normalizarFecha(f: string): string {
  if (!f) return f;
  return f.substring(0, 10); // "2026-02-25T00:00:00.000000Z" → "2026-02-25"
}

/** Normaliza hora datetime a "HH:mm" */
function normalizarHora(h: string): string {
  if (!h) return h;
  // "2026-01-01T08:00:00.000000Z" → "08:00" | "08:00:00" → "08:00" | "08:00" → "08:00"
  if (h.includes('T')) h = h.split('T')[1];
  return h.substring(0, 5);
}

function getLunesDeSemana(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  return r;
}

/**
 * Configura la lógica de badge "Principal" en un contenedor de checkboxes de técnicos.
 * El primer checkbox marcado se muestra como Principal. Al desmarcar/marcar se recalcula.
 */
function setupPrincipalBadge(container: HTMLElement | null) {
  if (!container) return;

  const updateBadges = () => {
    const checks = Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    let firstChecked = true;
    checks.forEach(cb => {
      const badge = cb.closest('label')?.querySelector('.prog-principal-badge') as HTMLElement;
      if (!badge) return;
      if (cb.checked && firstChecked) {
        badge.style.display = '';
        firstChecked = false;
      } else {
        badge.style.display = 'none';
      }
    });
  };

  container.addEventListener('change', updateBadges);
  updateBadges(); // estado inicial
}
