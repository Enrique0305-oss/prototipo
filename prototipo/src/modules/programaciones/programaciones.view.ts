// Programaciones View — conectado a API real
import './programaciones.css';
import { programacionService } from './programaciones.service';
import { mostrarToast, confirmarAccion } from '../../shared/toast';
import { clienteService } from '../../services/clienteService';
import { renderModalProgramarCapacitacion, abrirModalProgramarCapacitacion } from './programacion-capacitacion';
import { renderModalProgramarAsesoria, abrirModalProgramarAsesoria } from './programacion-asesoria';
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
let filtroCliente: number | null = null;
let filtrosVisibles = false;
let plantasClienteDataProg: any[] = [];
let areaIdsServicioSeleccionado: number[] = [];
let plantaIdServicioSeleccionado: number | null = null;

function extractList<T = any>(response: any): T[] {
  const raw = response?.data ?? response;
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

type ProgramacionExtendida = Programacion & {
  tipo_programacion?: 'servicio' | 'capacitacion' | 'asesoria';
  orden_capacitacion?: any;
  orden_asesoria?: any;
  exponentes?: any[];
  modalidad?: string;
  modalidad_visita?: string;
  meses_implementacion?: number | null;
  frecuencia_visita?: any;
  dias_por_mes_calculado?: Record<string, { presencial: number[]; virtual: number[] }>;
  resumen_por_mes?: Array<{ mes: number; presencial: number; virtual: number; frecuencia: string }>;
  fecha_fin_programacion?: string | null;
};

function mapCapacitacionToProgramacion(cap: any): ProgramacionExtendida {
  return {
    id: cap.id,
    id_orden_servicio: 0,
    id_servicio: cap.orden_capacitacion?.id_servicio || 0,
    id_tecnico_asignado: 0,
    id_supervisor: cap.id_supervisor,
    id_vehiculo: cap.id_vehiculo,
    fecha_programada: normalizarFecha(cap.fecha_programada),
    hora_inicio: normalizarHora(cap.hora_inicio),
    hora_fin: cap.hora_fin ? normalizarHora(cap.hora_fin) : cap.hora_fin,
    local_sede: cap.local_sede,
    direccion_completa: cap.direccion_completa,
    id_cliente_planta: cap.id_cliente_planta,
    id_cliente_planta_area: cap.id_cliente_planta_area,
    estado_ejecucion: cap.estado_ejecucion,
    observaciones: cap.observaciones,
    servicio: cap.orden_capacitacion?.servicio,
    supervisor: cap.supervisor,
    vehiculo: cap.vehiculo,
    planta: cap.planta,
    area: cap.area,
    orden_capacitacion: cap.orden_capacitacion,
    exponentes: cap.exponentes || [],
    tipo_programacion: 'capacitacion',
  } as ProgramacionExtendida;
}

function mapAsesoriaToProgramacion(ase: any): ProgramacionExtendida {
  return {
    id: ase.id,
    id_orden_servicio: 0,
    id_servicio: ase.ordenAsesoria?.id_servicio || ase.orden_asesoria?.id_servicio || 0,
    id_tecnico_asignado: 0,
    id_supervisor: ase.id_supervisor,
    id_vehiculo: ase.id_vehiculo,
    fecha_programada: normalizarFecha(ase.fecha_programada),
    hora_inicio: normalizarHora(ase.hora_inicio),
    hora_fin: ase.hora_fin ? normalizarHora(ase.hora_fin) : ase.hora_fin,
    local_sede: ase.local_sede,
    direccion_completa: ase.direccion_completa,
    id_cliente_planta: ase.id_cliente_planta,
    id_cliente_planta_area: ase.id_cliente_planta_area,
    estado_ejecucion: ase.estado_ejecucion,
    observaciones: ase.observaciones,
    servicio: ase.ordenAsesoria?.servicio || ase.orden_asesoria?.servicio,
    supervisor: ase.supervisor,
    vehiculo: ase.vehiculo,
    planta: ase.planta,
    area: ase.area,
    orden_asesoria: ase.ordenAsesoria || ase.orden_asesoria,
    exponentes: ase.exponentes || [],
    modalidad: ase.modalidad || ase.ordenAsesoria?.modalidad || ase.orden_asesoria?.modalidad,
    modalidad_visita: ase.modalidad_visita || ase.modalidadVisita || ase.modalidad_visita,
    meses_implementacion: ase.meses_implementacion ?? ase.ordenAsesoria?.meses_implementacion ?? ase.orden_asesoria?.meses_implementacion ?? null,
    frecuencia_visita: ase.frecuencia_visita ?? ase.ordenAsesoria?.frecuencia_visita ?? ase.orden_asesoria?.frecuencia_visita ?? null,
    tipo_programacion: 'asesoria',
  } as ProgramacionExtendida;
}

async function cargarPlantasClienteProg(idCliente: number) {
  try {
    const res = await clienteService.getPlantas(idCliente);
    const raw = res.data || res;
    plantasClienteDataProg = (raw as any).data || raw;
  } catch {
    plantasClienteDataProg = [];
  }
}

function getPlantaOptionsProg(selectedId?: number | null): string {
  let opts = '<option value="">-- Planta --</option>';
  plantasClienteDataProg.forEach((p: any) => {
    if (p.estado !== 'Activo') return;
    const sel = selectedId && p.id == selectedId ? 'selected' : '';
    opts += `<option value="${p.id}" ${sel}>${p.nombre}</option>`;
  });
  return opts;
}

function getAreaOptionsProg(idPlanta: number | null, selectedId?: number | null): string {
  return getAreaOptionsProgFiltrado(idPlanta, selectedId, null);
}

function getAreaOptionsProgFiltrado(
  idPlanta: number | null,
  selectedId?: number | null,
  allowedAreaIds?: number[] | null,
): string {
  let opts = '<option value="">-- Área --</option>';
  if (!idPlanta) return opts;
  const planta = plantasClienteDataProg.find((p: any) => p.id == idPlanta);
  if (!planta) return opts;
  const areas = planta.areas_activas || planta.areas || [];
  const allowSet = allowedAreaIds && allowedAreaIds.length > 0 ? new Set(allowedAreaIds.map(Number)) : null;
  areas.forEach((a: any) => {
    if (a.estado && a.estado !== 'Activo') return;
    if (allowSet && !allowSet.has(Number(a.id))) return;
    const sel = selectedId && a.id == selectedId ? 'selected' : '';
    opts += `<option value="${a.id}" ${sel}>${a.nombre}</option>`;
  });
  return opts;
}

function normalizeAreaIds(input: any): number[] {
  if (input === null || input === undefined || input === '') return [];

  if (Array.isArray(input)) {
    return input.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0);
  }

  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? [input] : [];
  }

  if (typeof input === 'string') {
    const raw = input.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0);
      }
      if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0) {
        return [parsed];
      }
    } catch {
      // continuar con parsing por comas
    }

    if (raw.includes(',')) {
      return raw
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isFinite(v) && v > 0);
    }

    const asNumber = Number(raw);
    return Number.isFinite(asNumber) && asNumber > 0 ? [asNumber] : [];
  }

  return [];
}

function getAreaNombresPorIds(idPlanta: number | null, areaIds: number[]): string[] {
  if (!idPlanta || areaIds.length === 0) return [];
  const planta = plantasClienteDataProg.find((p: any) => p.id == idPlanta);
  if (!planta) return [];
  const areas = planta.areas_activas || planta.areas || [];
  const wanted = new Set(areaIds.map(Number));
  return areas
    .filter((a: any) => wanted.has(Number(a.id)))
    .map((a: any) => a.nombre)
    .filter(Boolean);
}

function renderAreaChipsLikeODS(labels: string[]): string {
  if (labels.length === 0) return 'Sin áreas seleccionadas';

  const chips = labels
    .slice(0, 2)
    .map((nombre) =>
      '<span style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">' + nombre + '</span>'
    )
    .join('');

  if (labels.length > 2) {
    return chips + '<span style="font-size:11px;color:#64748b;">+' + (labels.length - 2) + ' más</span>';
  }

  return chips;
}

function esFrecuenciaUnica(frecuencia: string): boolean {
  return (frecuencia || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase() === 'unica';
}

function normalizarTextoFrecuencia(frecuencia: string): string {
  return (frecuencia || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function esFrecuenciaDiasSemana(frecuencia: string): boolean {
  const txt = normalizarTextoFrecuencia(frecuencia);
  if (!txt) return false;
  if (txt === 'dias de la semana') return true;
  if (/dias?\s+a\s+la\s+semana/.test(txt)) return true;
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  return dias.some((d) => new RegExp('\\b' + d + '\\b', 'i').test(txt));
}

function frecuenciaParaBackend(frecuencia: string): string {
  if (esFrecuenciaDiasSemana(frecuencia)) return 'Días de la semana';
  return frecuencia;
}

function extraerDiasDesdeFrecuencia(frecuencia: string): string[] {
  const texto = frecuencia || '';
  const diasBase = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const fromParens = texto.match(/\(([^)]+)\)/);
  const source = fromParens?.[1] || texto;
  const sourceNorm = normalizarTextoFrecuencia(source);

  return diasBase.filter((dia) => {
    const diaNorm = normalizarTextoFrecuencia(dia);
    return new RegExp('\\b' + diaNorm + '\\b', 'i').test(sourceNorm);
  });
}

function setDiasSemanaChecks(body: HTMLElement, dias: string[]) {
  const diasNorm = new Set(dias.map((d) => normalizarTextoFrecuencia(d)));
  body.querySelectorAll('.dia-semana-check').forEach((el) => {
    const chk = el as HTMLInputElement;
    chk.checked = diasNorm.has(normalizarTextoFrecuencia(chk.value));
  });
}

function resolveAreaIdNuevaProgramacion(idPlantaSel: number | null): number | null {
  if (!idPlantaSel || !plantaIdServicioSeleccionado) return null;
  if (idPlantaSel !== plantaIdServicioSeleccionado) return null;
  return areaIdsServicioSeleccionado[0] || null;
}

function getPlantaDireccion(idPlanta: number | null): string {
  if (!idPlanta) return '';
  const planta = plantasClienteDataProg.find((p: any) => p.id == idPlanta);
  return planta ? (planta.direccion || '') : '';
}

function getPlantaNombre(idPlanta: number | null): string {
  if (!idPlanta) return '';
  const planta = plantasClienteDataProg.find((p: any) => p.id == idPlanta);
  return planta ? (planta.nombre || '') : '';
}

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
        <button class="prog-btn-secondary" id="btnExportarPDF" title="Exportar a PDF">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>
          Exportar PDF
        </button>
        <button class="prog-btn-secondary" id="btnProgramarCapacitacion" title="Programar Capacitación">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          Programar Capacitación
        </button>
        <button class="prog-btn-secondary" id="btnProgramarAsesoria" title="Programar Asesoría">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Programar Asesoría
        </button>
        <button class="prog-btn-primary" id="btnNuevaProgramacion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Programación
        </button>
      </div>
    </div>

    <div class="prog-layout" style="display:flex;flex-direction:column;gap:10px;">
      <div id="progFiltrosWrap" style="width:100%;">
        <div class="prog-sidebar" id="progSidebar" style="width:100%;max-width:none;">
          <p style="padding:16px;color:#999;">Cargando...</p>
        </div>
      </div>
      <div style="display:flex;justify-content:center;align-items:center;padding:4px 0 10px;">
        <button
          id="btnToggleFiltrosProg"
          type="button"
          title="Mostrar/Ocultar filtros"
          style="width:34px;height:34px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;color:#334155;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 6px rgba(15,23,42,0.08);"
        >
          <span id="iconToggleFiltrosProg" style="font-size:14px;font-weight:700;line-height:1;">▲</span>
        </button>
      </div>
      <div class="prog-calendar-main" id="progCalendar" style="width:100%;">
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

    <!-- Modal Programar Capacitación -->
    ${renderModalProgramarCapacitacion()}

    <!-- Modal Programar Asesoría -->
    ${renderModalProgramarAsesoria()}
  `;
}

// ═══════════ Inicialización ═══════════

export async function initProgramacionesEvents(): Promise<void> {
  await cargarDatosIniciales();

  renderSidebar();
  renderCalendario();
  bindToggleFiltrosProg();
  applyEstadoFiltrosProg();

  document.getElementById('btnNuevaProgramacion')?.addEventListener('click', abrirModalNueva);
  document.getElementById('btnProgramarCapacitacion')?.addEventListener('click', () => {
    abrirModalProgramarCapacitacion(tecnicosData, personalData, vehiculosData);
  });
  document.getElementById('btnProgramarAsesoria')?.addEventListener('click', () => {
    abrirModalProgramarAsesoria(personalData, vehiculosData);
  });
  document.getElementById('viewSelector')?.addEventListener('change', (e) => {
    vistaActual = (e.target as HTMLSelectElement).value as VistaProgramacion;
    renderCalendario();
  });

  document.getElementById('btnExportarPDF')?.addEventListener('click', exportarPDF);

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

  // Escuchar evento de capacitación programada para recargar
  window.addEventListener('capacitacionProgramada', async () => {
    await recargarProgramaciones();
  });

  // Escuchar evento de asesoría programada para recargar
  window.addEventListener('asesoriaProgramada', async () => {
    await recargarProgramaciones();
  });
}

async function cargarDatosIniciales() {
  try {
    const [progRes, progCapRes, progAseRes, tecRes, vehRes, perRes, estRes] = await Promise.all([
      programacionService.getAll({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getAllProgramacionCapacitacion({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getAllProgramacionAsesoria({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getTecnicos(),
      programacionService.getVehiculos(),
      programacionService.getPersonal(),
      programacionService.getEstadisticas(fechaActual.getMonth() + 1, fechaActual.getFullYear()),
    ]);
    const programacionesServicio = (progRes.data || []).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'servicio',
    })) as ProgramacionExtendida[];
    const programacionesCapacitacion = (progCapRes.data || []).map(mapCapacitacionToProgramacion);
    const programacionesAsesoria = (progAseRes.data || []).map(mapAsesoriaToProgramacion);
    programacionesData = [...programacionesServicio, ...programacionesCapacitacion, ...programacionesAsesoria] as Programacion[];
    const tecnicosRaw = extractList<Tecnico>(tecRes);
    const vehiculosRaw = extractList<Vehiculo>(vehRes);

    tecnicosData = tecnicosRaw
      .filter((t: any) => (t?.estado || '').toLowerCase() === 'activo')
      .map((t: any) => ({
        ...t,
        id: Number(t.id ?? t.id_tecnico ?? 0),
        apellidos: t.apellidos ?? t.apellido ?? '',
      }))
      .filter((t: Tecnico) => t.id > 0);

    vehiculosData = vehiculosRaw
      .filter((v: any) => (v?.estado || '') !== 'Fuera de Servicio')
      .map((v: any) => ({
        ...v,
        id: Number(v.id ?? v.id_vehiculo ?? 0),
      }))
      .filter((v: Vehiculo) => v.id > 0);
    personalData = perRes.data || [];
    if (estRes.data) estadisticas = estRes.data;
  } catch (err) {
    console.error('Error cargando datos programaciones:', err);
  }
}

async function recargarProgramaciones() {
  try {
    const [progRes, progCapRes, progAseRes, estRes] = await Promise.all([
      programacionService.getAll({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getAllProgramacionCapacitacion({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getAllProgramacionAsesoria({
        mes: fechaActual.getMonth() + 1,
        anio: fechaActual.getFullYear(),
      }),
      programacionService.getEstadisticas(fechaActual.getMonth() + 1, fechaActual.getFullYear()),
    ]);
    const programacionesServicio = (progRes.data || []).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'servicio',
    })) as ProgramacionExtendida[];
    const programacionesCapacitacion = (progCapRes.data || []).map(mapCapacitacionToProgramacion);
    const programacionesAsesoria = (progAseRes.data || []).map(mapAsesoriaToProgramacion);
    programacionesData = [...programacionesServicio, ...programacionesCapacitacion, ...programacionesAsesoria] as Programacion[];
    if (estRes.data) estadisticas = estRes.data;
  } catch (err) {
    console.error('Error recargando programaciones:', err);
  }
  renderSidebar();
  renderCalendario();
  bindToggleFiltrosProg();
  applyEstadoFiltrosProg();
}

function applyEstadoFiltrosProg() {
  const filtrosWrap = document.getElementById('progFiltrosWrap') as HTMLElement | null;
  const icon = document.getElementById('iconToggleFiltrosProg') as HTMLElement | null;
  if (!filtrosWrap || !icon) return;

  filtrosWrap.style.display = filtrosVisibles ? '' : 'none';
  icon.textContent = filtrosVisibles ? '▲' : '▼';
}

function bindToggleFiltrosProg() {
  const btn = document.getElementById('btnToggleFiltrosProg') as HTMLButtonElement | null;
  if (!btn) return;

  btn.onclick = () => {
    filtrosVisibles = !filtrosVisibles;
    applyEstadoFiltrosProg();
  };
}

// ═══════════ Sidebar ═══════════

function renderSidebar() {
  const sidebar = document.getElementById('progSidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="prog-filter-section">
      <h3 class="prog-section-title">FILTROS</h3>
      <div style="display:grid;grid-template-columns:minmax(320px,1.3fr) minmax(220px,1fr) minmax(220px,1fr);gap:12px;align-items:end;">
      <div class="prog-filter-group" style="margin-bottom:0;">
        <label class="prog-filter-label">Estado</label>
        <div class="prog-checkbox-group" id="filtroEstadosGroup" style="display:grid;grid-template-columns:repeat(3,minmax(120px,1fr));gap:4px 10px;">
          ${(['Programado', 'Confirmado', 'En Camino', 'En Ejecución', 'Realizado', 'Reprogramado', 'Cancelado'] as EstadoEjecucion[]).map(e => `
            <label class="prog-checkbox-item">
              <input type="checkbox" value="${e}" ${filtroEstados.includes(e) ? 'checked' : ''}> ${e}
            </label>
          `).join('')}
        </div>
      </div>
      <div class="prog-filter-group" style="margin-bottom:0;">
        <label class="prog-filter-label">Técnico</label>
        <select class="prog-filter-select" id="filtroTecnicoSelect">
          <option value="">Todos</option>
          ${tecnicosData.map(t => `<option value="${t.id}" ${filtroTecnico === t.id ? 'selected' : ''}>${t.nombre} ${t.apellidos}</option>`).join('')}
        </select>
      </div>
      <div class="prog-filter-group" style="margin-bottom:0;">
        <label class="prog-filter-label">Cliente</label>
        <select class="prog-filter-select" id="filtroClienteSelect">
          <option value="">Todos</option>
          ${getClientesUnicos().map(c => `<option value="${c.id}" ${filtroCliente === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
        </select>
      </div>
      </div>
    </div>

    <div class="prog-stats">
      <div class="prog-stat-item"><div class="prog-stat-value">${estadisticas.programados}</div><div class="prog-stat-label">Programados</div></div>
      <div class="prog-stat-item"><div class="prog-stat-value">${estadisticas.completados}</div><div class="prog-stat-label">Completados</div></div>
      <div class="prog-stat-item"><div class="prog-stat-value">${estadisticas.total}</div><div class="prog-stat-label">Total</div></div>
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
  sidebar.querySelector('#filtroClienteSelect')?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    filtroCliente = val ? parseInt(val) : null;
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
  if (filtroCliente) {
    lista = lista.filter(p => {
      const px = p as ProgramacionExtendida;
      return p.orden_servicio?.cliente?.id === filtroCliente
        || px.orden_capacitacion?.cliente?.id === filtroCliente
        || px.orden_asesoria?.cliente?.id === filtroCliente;
    });
  }
  return lista;
}

function nombreActividad(p: Programacion): string {
  const px = p as ProgramacionExtendida;
  if (px.tipo_programacion === 'capacitacion') {
    return px.orden_capacitacion?.servicio?.nombre || p.servicio?.nombre || 'Capacitación';
  }
  if (px.tipo_programacion === 'asesoria') {
    return px.orden_asesoria?.servicio?.nombre || p.servicio?.nombre || 'Asesoría';
  }
  return p.servicio?.nombre || 'Servicio';
}

function badgeTipoProgramacion(p: Programacion): string {
  const tipo = (p as ProgramacionExtendida).tipo_programacion;
  if (tipo === 'capacitacion') {
    return '<span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Capacitación</span>';
  }
  if (tipo === 'asesoria') {
    return '<span style="background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Asesoría</span>';
  }
  return '';
}

function renderAccionesDetalle(p: Programacion): string {
  return `
    <div class="prog-modal-footer">
      <button type="button" class="prog-btn-danger" id="btnEliminarProg">Eliminar</button>
      ${!['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-warning" id="btnCancelarProg">Cancelar Programación</button>` : ''}
      ${!['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-primary" id="btnEditarProg">Editar</button>` : ''}
      ${!['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-primary" style="background:#10b981;" id="btnCompletarProg">Marcar Realizado</button>` : ''}
    </div>`;
}

function badgeModalidadVisita(p: Programacion): string {
  const px = p as ProgramacionExtendida;
  const raw = String(px.modalidad_visita || '').trim().toLowerCase();
  if (!raw) return '<span style="background:#e5e7eb;color:#475569;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Sin modalidad</span>';
  if (raw.startsWith('pres')) {
    return '<span style="background:#dcfce7;color:#166534;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Presencial</span>';
  }
  if (raw.startsWith('vir')) {
    return '<span style="background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Virtual</span>';
  }
  return `<span style="background:#e5e7eb;color:#475569;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">${px.modalidad_visita}</span>`;
}

function badgeModalidadProgramacion(p: Programacion): string {
  const px = p as ProgramacionExtendida;
  const raw = (px as any).modalidad || (px as any).orden_asesoria?.modalidad || (px as any).ordenAsesoria?.modalidad || '';
  const modalidad = String(raw).trim();
  if (!modalidad) return '';
  const texto = modalidad.toLowerCase().includes('hibr') ? 'Híbrido'
    : modalidad.toLowerCase().includes('pres') ? 'Presencial'
    : modalidad.toLowerCase().includes('virt') ? 'Virtual'
    : modalidad;
  return `<span style="background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">${texto}</span>`;
}

function normalizarFrecuenciaVisitaDetalle(frecuenciaVisita: any): Array<{ mes: string; presencial: number; virtual: number; frecuencia: string }> {
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
      presencial: Number(item?.presencial ?? item?.p ?? 0),
      virtual: Number(item?.virtual ?? item?.v ?? 0),
      frecuencia: String(item?.frecuencia ?? item?.frecuencia_visita ?? item?.f ?? '-'),
    }));
  }

  if (typeof data === 'object') {
    return Object.entries(data).map(([mesKey, val]: [string, any]) => {
      const matchMes = String(mesKey).match(/\d+/);
      const mesLabel = matchMes ? `Mes ${matchMes[0]}` : String(mesKey).toUpperCase();
      return {
        mes: mesLabel,
        presencial: Number(val?.p ?? val?.presencial ?? 0),
        virtual: Number(val?.v ?? val?.virtual ?? 0),
        frecuencia: String(val?.f ?? val?.frecuencia ?? '-'),
      };
    });
  }

  return [];
}

function nombreDiaCorto(day: number): string {
  const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  return dias[day] || '-';
}

function normalizarDiasPorMesDetalle(diasPorMes: any): Record<string, { presencial: number[]; virtual: number[] }> {
  if (!diasPorMes) return {};

  let data = diasPorMes;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return {};
    }
  }

  if (typeof data !== 'object' || Array.isArray(data)) return {};

  const salida: Record<string, { presencial: number[]; virtual: number[] }> = {};
  Object.entries(data).forEach(([mes, val]: [string, any]) => {
    const key = String(mes);
    salida[key] = {
      presencial: Array.isArray(val?.presencial) ? val.presencial.map((n: any) => Number(n)).filter((n: number) => n >= 0 && n <= 6) : [],
      virtual: Array.isArray(val?.virtual) ? val.virtual.map((n: any) => Number(n)).filter((n: number) => n >= 0 && n <= 6) : [],
    };
  });

  return salida;
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
          <div class="prog-event ${getColorByState(s.estado_ejecucion)}" data-prog-id="${s.id}" data-prog-tipo="${(s as ProgramacionExtendida).tipo_programacion || 'servicio'}">
            <div class="prog-event-title">${clienteNombre(s)}</div>
            <div class="prog-event-subtitle" style="font-size:11px;opacity:0.9;margin-top:2px;">${nombreActividad(s)} ${badgeTipoProgramacion(s)} ${(s as ProgramacionExtendida).tipo_programacion === 'asesoria' ? badgeModalidadVisita(s) : badgeModalidadProgramacion(s)}</div>
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
                  <div class="prog-week-card prog-week-card-${color}" data-prog-id="${s.id}" data-prog-tipo="${(s as ProgramacionExtendida).tipo_programacion || 'servicio'}">
                    <div class="prog-week-card-title">${clienteNombre(s)}</div>
                    <div class="prog-week-card-subtitle" style="font-size:11px;opacity:0.85;margin:2px 0;font-weight:500;">${nombreActividad(s)} ${badgeTipoProgramacion(s)} ${(s as ProgramacionExtendida).tipo_programacion === 'asesoria' ? badgeModalidadVisita(s) : badgeModalidadProgramacion(s)}</div>
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
            <div class="prog-day-service-card" data-prog-id="${s.id}" data-prog-tipo="${(s as ProgramacionExtendida).tipo_programacion || 'servicio'}">
              <div class="prog-day-service-time">
                <div class="prog-time-badge">${fmtH(s.hora_inicio)}</div>
                <div class="prog-time-line"></div>
                <div class="prog-time-badge">${fmtH(s.hora_fin || '')}</div>
              </div>
              <div class="prog-day-service-content">
                <div class="prog-day-service-header">
                  <h3>${clienteNombre(s)}</h3>
                  <span class="prog-status-badge ${s.estado_ejecucion}">${s.estado_ejecucion}</span>
                </div>
                <div class="prog-day-service-details">
                  <div><strong>Actividad:</strong> ${nombreActividad(s)} ${badgeTipoProgramacion(s)} ${(s as ProgramacionExtendida).tipo_programacion === 'asesoria' ? badgeModalidadVisita(s) : badgeModalidadProgramacion(s)}</div>
                  <div><strong>Técnico:</strong> ${s.tecnicos && s.tecnicos.length > 0 ? s.tecnicos.map(t => t.nombre + ' ' + t.apellidos).join(', ') : (s.tecnico ? s.tecnico.nombre + ' ' + s.tecnico.apellidos : 'Sin asignar')}</div>
                  <div><strong>Local:</strong> ${s.planta ? s.planta.nombre : (s.local_sede || '—')}</div>
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
      const tipo = ((el as HTMLElement).dataset.progTipo || 'servicio') as 'servicio' | 'capacitacion' | 'asesoria';
      if (id) abrirModalDetalle(id, tipo);
    });
  });
}

// ═══════════ Modal Detalle ═══════════

async function abrirModalDetalle(id: number, tipo: 'servicio' | 'capacitacion' | 'asesoria' = 'servicio') {
  const modal = document.getElementById('modalDetalleProgramacion');
  const body = document.getElementById('modalDetalleBody');
  if (!modal || !body) return;

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const res = tipo === 'capacitacion'
      ? await programacionService.getProgramacionCapacitacionById(id)
      : tipo === 'asesoria'
      ? await programacionService.getProgramacionAsesoriaById(id)
      : await programacionService.getById(id);
    const p = res.data;
    if (!p) { body.innerHTML = '<p style="padding:24px;">No encontrado</p>'; return; }

    if (tipo === 'capacitacion') {
      const exps = (p.exponentes || []).map((e: any) => `${e.nombre} ${e.apellidos}`).join(', ');
      body.innerHTML = `
        <div class="prog-detalle-grid">
          <div class="prog-detalle-section">
            <h3 class="prog-detalle-section-title">Programación de Capacitación</h3>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Tipo:</div><div class="prog-detalle-value"><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">Capacitación</span></div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Orden:</div><div class="prog-detalle-value">${p.orden_capacitacion?.numero_orden || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Capacitación:</div><div class="prog-detalle-value">${p.capacitacion_nombre || p.orden_capacitacion?.servicio?.nombre || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Estado:</div><div class="prog-detalle-value"><span class="prog-status-badge ${p.estado_ejecucion}">${p.estado_ejecucion}</span></div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${new Date(normalizarFecha(p.fecha_programada) + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Horario:</div><div class="prog-detalle-value">${fmtH(normalizarHora(p.hora_inicio))} - ${fmtH(normalizarHora(p.hora_fin || ''))}</div></div>
          </div>
          <div class="prog-detalle-section">
            <h3 class="prog-detalle-section-title">Cliente y Recursos</h3>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Cliente:</div><div class="prog-detalle-value">${p.orden_capacitacion?.cliente?.nombre_empresa || p.orden_capacitacion?.cliente?.persona_contacto || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Exponentes:</div><div class="prog-detalle-value">${exps || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Asistente administrativo:</div><div class="prog-detalle-value">${p.supervisor ? p.supervisor.nombre + ' ' + p.supervisor.apellidos : '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Vehículo:</div><div class="prog-detalle-value">${p.vehiculo ? p.vehiculo.placa + ' - ' + p.vehiculo.marca + ' ' + p.vehiculo.modelo : '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Local:</div><div class="prog-detalle-value">${p.planta ? p.planta.nombre : (p.local_sede || '—')}</div></div>
          </div>
          ${p.observaciones ? `<div class="prog-detalle-section prog-detalle-section-full"><h3 class="prog-detalle-section-title">Observaciones</h3><div class="prog-detalle-observaciones">${p.observaciones}</div></div>` : ''}
          ${renderAccionesDetalle(p)}
          <div class="prog-modal-footer"><button type="button" class="prog-btn-secondary" id="btnCerrarDetalleCap">Cerrar</button></div>
        </div>`;
      body.querySelector('#btnCerrarDetalleCap')?.addEventListener('click', () => cerrarModal('modalDetalleProgramacion'));
      body.querySelector('#btnEliminarProg')?.addEventListener('click', () => eliminarProg(p.id));
      body.querySelector('#btnCancelarProg')?.addEventListener('click', () => cancelarProg(p.id));
      body.querySelector('#btnEditarProg')?.addEventListener('click', () => abrirEdicion(p));
      body.querySelector('#btnCompletarProg')?.addEventListener('click', () => completarProg(p.id));
      return;
    }

    if (tipo === 'asesoria') {
      const mesesImplementacion = Number((p as ProgramacionExtendida).meses_implementacion || 0);
      const filasFrecuencia = normalizarFrecuenciaVisitaDetalle((p as ProgramacionExtendida).frecuencia_visita);
      const diasPorMes = normalizarDiasPorMesDetalle((p as ProgramacionExtendida).dias_por_mes_calculado);
      const resumenPorMesRaw = (p as ProgramacionExtendida).resumen_por_mes;
      const resumenPorMes: Array<{ mes: number; presencial: number; virtual: number; frecuencia: string }> = Array.isArray(resumenPorMesRaw) ? resumenPorMesRaw : [];
      const totalPresencial = resumenPorMes.reduce((acc, it) => acc + Number(it.presencial || 0), 0);
      const totalVirtual = resumenPorMes.reduce((acc, it) => acc + Number(it.virtual || 0), 0);
      const fechaInicioLabel = new Date(normalizarFecha(p.fecha_programada) + 'T00:00:00').toLocaleDateString('es-PE');
      const fechaFinLabel = (p as ProgramacionExtendida).fecha_fin_programacion
        ? new Date(normalizarFecha((p as ProgramacionExtendida).fecha_fin_programacion || '') + 'T00:00:00').toLocaleDateString('es-PE')
        : '—';
      const modalidadVisitaRaw = String((p as ProgramacionExtendida).modalidad_visita || '').trim().toLowerCase();
      const esPresencial = modalidadVisitaRaw.startsWith('pres');
      const esVirtual = modalidadVisitaRaw.startsWith('vir');
      const plantaAsesoria = p.planta ? p.planta.nombre : '—';
      const areaAsesoria = p.area ? p.area.nombre : '—';
      const expsProg = (p.exponentes || []).map((e: any) => `${e.nombre} ${e.apellidos}`.trim()).filter((x: string) => !!x);
      const expsOrden = ((p.ordenAsesoria?.exponentes || p.orden_asesoria?.exponentes || []) as any[])
        .map((e: any) => `${e.nombre} ${e.apellidos}`.trim())
        .filter((x: string) => !!x);
      const exps = (expsProg.length > 0 ? expsProg : expsOrden).join(', ');
      body.innerHTML = `
        <div class="prog-detalle-grid">
          <div class="prog-detalle-section">
            <h3 class="prog-detalle-section-title">Programación de Asesoría</h3>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Tipo:</div><div class="prog-detalle-value"><span style="background:#dbeafe;color:#0369a1;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">Asesoría</span></div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Orden:</div><div class="prog-detalle-value">${p.ordenAsesoria?.numero_orden || p.orden_asesoria?.numero_orden || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Asesoría:</div><div class="prog-detalle-value">${p.asesoria_nombre || p.ordenAsesoria?.servicio?.nombre || p.orden_asesoria?.servicio?.nombre || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Modalidad de visita:</div><div class="prog-detalle-value">${badgeModalidadVisita(p)}</div></div>
            ${esPresencial ? `
              <div class="prog-detalle-row"><div class="prog-detalle-label">Planta:</div><div class="prog-detalle-value">${plantaAsesoria}</div></div>
              <div class="prog-detalle-row"><div class="prog-detalle-label">Área:</div><div class="prog-detalle-value">${areaAsesoria}</div></div>
            ` : esVirtual ? `
              <div class="prog-detalle-row"><div class="prog-detalle-label"> </div><div class="prog-detalle-value" style="color:#1d4ed8;font-weight:700;">Reunión virtual</div></div>
            ` : ''}
            <div class="prog-detalle-row"><div class="prog-detalle-label">Tiempo de implementación:</div><div class="prog-detalle-value">${mesesImplementacion > 0 ? `${mesesImplementacion} ${mesesImplementacion === 1 ? 'mes' : 'meses'}` : '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Estado:</div><div class="prog-detalle-value"><span class="prog-status-badge ${p.estado_ejecucion}">${p.estado_ejecucion}</span></div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${new Date(normalizarFecha(p.fecha_programada) + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Horario:</div><div class="prog-detalle-value">${fmtH(normalizarHora(p.hora_inicio))} - ${fmtH(normalizarHora(p.hora_fin || ''))}</div></div>
          </div>
          <div class="prog-detalle-section">
            <h3 class="prog-detalle-section-title">Cliente y Recursos</h3>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Cliente:</div><div class="prog-detalle-value">${p.ordenAsesoria?.cliente?.nombre_empresa || p.ordenAsesoria?.cliente?.persona_contacto || p.orden_asesoria?.cliente?.nombre_empresa || p.orden_asesoria?.cliente?.persona_contacto || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Asesores:</div><div class="prog-detalle-value">${exps || '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Asistente administrativo:</div><div class="prog-detalle-value">${p.supervisor ? p.supervisor.nombre + ' ' + p.supervisor.apellidos : '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Vehículo:</div><div class="prog-detalle-value">${p.vehiculo ? p.vehiculo.placa + ' - ' + p.vehiculo.marca + ' ' + p.vehiculo.modelo : '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Local:</div><div class="prog-detalle-value">${p.planta ? p.planta.nombre : (p.local_sede || '—')}</div></div>
          </div>
          <div class="prog-detalle-section prog-detalle-section-full">
            <h3 class="prog-detalle-section-title">Frecuencia por Visita</h3>
            ${filasFrecuencia.length > 0 ? `
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Mes</th>
                    <th style="padding:8px 10px;text-align:center;border:1px solid #e2e8f0;">P</th>
                    <th style="padding:8px 10px;text-align:center;border:1px solid #e2e8f0;">V</th>
                    <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasFrecuencia.map((fila) => `
                    <tr>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;">${fila.mes}</td>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;">${fila.presencial}</td>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;">${fila.virtual}</td>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;">${fila.frecuencia}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<div style="color:#64748b;font-size:12px;">Sin frecuencia registrada</div>'}
          </div>
          <div class="prog-detalle-section prog-detalle-section-full">
            <h3 class="prog-detalle-section-title">Días por Mes para Asesorías (Presenciales y Virtuales)</h3>
            ${Object.keys(diasPorMes).length > 0 ? `
              <div style="display:grid;gap:10px;">
                ${Object.entries(diasPorMes).map(([mes, dias]: [string, any]) => `
                  <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#f8fafc;">
                    <div style="font-weight:700;color:#334155;margin-bottom:8px;">Mes ${mes}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                      <div>
                        <div style="font-size:12px;color:#475569;font-weight:700;margin-bottom:6px;">Presenciales</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                          ${(dias.presencial || []).length > 0
                            ? (dias.presencial || []).map((d: number) => `<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">${nombreDiaCorto(d)}</span>`).join('')
                            : '<span style="color:#94a3b8;font-size:12px;">Sin días</span>'}
                        </div>
                      </div>
                      <div>
                        <div style="font-size:12px;color:#475569;font-weight:700;margin-bottom:6px;">Virtuales</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                          ${(dias.virtual || []).length > 0
                            ? (dias.virtual || []).map((d: number) => `<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">${nombreDiaCorto(d)}</span>`).join('')
                            : '<span style="color:#94a3b8;font-size:12px;">Sin días</span>'}
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<div style="color:#64748b;font-size:12px;">Sin días registrados por mes</div>'}
          </div>
          <div class="prog-detalle-section prog-detalle-section-full">
            <h3 class="prog-detalle-section-title">Resumen de Programación</h3>
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
              <div style="font-size:13px;color:#334155;font-weight:700;">Fecha fin de implementación: <span style="color:#0f766e;">${fechaFinLabel}</span></div>
              <div style="font-size:12px;color:#475569;">Total planificado: ${totalPresencial} asesorías presenciales y ${totalVirtual} asesorías virtuales. Vigencia del ${fechaInicioLabel} al ${fechaFinLabel}.</div>
            </div>
            ${resumenPorMes.length > 0 ? `
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Mes</th>
                    <th style="padding:8px 10px;text-align:center;border:1px solid #e2e8f0;">Total P</th>
                    <th style="padding:8px 10px;text-align:center;border:1px solid #e2e8f0;">Total V</th>
                    <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  ${resumenPorMes.map((r: any) => `
                    <tr>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;">Mes ${r.mes}</td>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;">${Number(r.presencial || 0)}</td>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;">${Number(r.virtual || 0)}</td>
                      <td style="padding:8px 10px;border:1px solid #e2e8f0;">${r.frecuencia || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<div style="color:#64748b;font-size:12px;">Sin resumen disponible</div>'}
          </div>
          ${p.observaciones ? `<div class="prog-detalle-section prog-detalle-section-full"><h3 class="prog-detalle-section-title">Observaciones</h3><div class="prog-detalle-observaciones">${p.observaciones}</div></div>` : ''}
          ${renderAccionesDetalle(p)}
          <div class="prog-modal-footer"><button type="button" class="prog-btn-secondary" id="btnCerrarDetalleAse">Cerrar</button></div>
        </div>`;
      body.querySelector('#btnCerrarDetalleAse')?.addEventListener('click', () => cerrarModal('modalDetalleProgramacion'));
      body.querySelector('#btnEliminarProg')?.addEventListener('click', () => eliminarProg(p.id));
      body.querySelector('#btnCancelarProg')?.addEventListener('click', () => cancelarProg(p.id));
      body.querySelector('#btnEditarProg')?.addEventListener('click', () => abrirEdicion({ ...(p as any), tipo_programacion: 'asesoria' } as Programacion));
      body.querySelector('#btnCompletarProg')?.addEventListener('click', () => completarProg(p.id));
      return;
    }

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
          <div class="prog-detalle-row"><div class="prog-detalle-label">Planta:</div><div class="prog-detalle-value">${p.planta ? p.planta.nombre : (p.local_sede || '—')}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Área:</div><div class="prog-detalle-value">${p.area ? p.area.nombre : '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Dirección:</div><div class="prog-detalle-value">${p.planta ? (p.planta.direccion || '—') : (p.direccion_completa || '—')}</div></div>
        </div>
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Recursos Asignados</h3>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Técnico(s):</div><div class="prog-detalle-value">${
            p.tecnicos && p.tecnicos.length > 0
              ? p.tecnicos.map((t: any) => `<span style="display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;padding:2px 10px;border-radius:6px;margin:2px 4px 2px 0;font-size:13px;">${t.nombre} ${t.apellidos}${t.pivot?.rol === 'Principal' ? ' <span style="font-size:10px;background:#dcfce7;color:#16a34a;padding:0 5px;border-radius:3px;font-weight:600;">Principal</span>' : ''}</span>`).join('')
              : (p.tecnico ? p.tecnico.nombre + ' ' + p.tecnico.apellidos : '—')
          }</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Asistente administrativo:</div><div class="prog-detalle-value">${p.supervisor ? p.supervisor.nombre + ' ' + p.supervisor.apellidos : '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Vehículo:</div><div class="prog-detalle-value">${p.vehiculo ? p.vehiculo.placa + ' - ' + p.vehiculo.marca + ' ' + p.vehiculo.modelo : '—'}</div></div>
        </div>
        ${p.insumos && p.insumos.length > 0 ? `
        <div class="prog-detalle-section prog-detalle-section-full">
          <h3 class="prog-detalle-section-title">Insumos / Productos</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;">Producto</th><th style="padding:8px;">Cant. Asignada</th><th style="padding:8px;">Cant. Utilizada</th><th style="padding:8px;">Estado</th></tr></thead>
            <tbody>${p.insumos.map((ins: any) => `
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
        id_cliente_planta: sug.id_cliente_planta || null,
        id_cliente_planta_area: sug.id_cliente_planta_area || null,
      });
      cerrarModal('modalSugerencia');
      await recargarProgramaciones();
      mostrarToast('success', 'Programación Creada', 'La siguiente programación fue creada exitosamente');
    } catch (err) { mostrarToast('error', 'Error', 'No se pudo crear la siguiente programación'); console.error(err); }
  });
}

// ═══════════ Modal Edición ═══════════

async function abrirEdicion(p: Programacion) {
  const body = document.getElementById('modalDetalleBody');
  if (!body) return;

  const px = p as ProgramacionExtendida;
  const isAsesoria = px.tipo_programacion === 'asesoria' || !!px.orden_asesoria || !!(px as any).ordenAsesoria;
  const ordenAsesoria = (px as any).ordenAsesoria || px.orden_asesoria || {};

  const fechaActual = normalizarFecha(p.fecha_programada || '');
  const [anioActual, mesActual, diaActual] = fechaActual.split('-').map((x) => parseInt(x || '0'));

  const expsAsignados = (px.exponentes || []).map((e: any) => Number(e.id)).filter((n) => !Number.isNaN(n));
  const expsOrden = (((px as any).ordenAsesoria?.exponentes || px.orden_asesoria?.exponentes || []) as any[])
    .map((e: any) => ({ id: Number(e.id), nombre: e.nombre, apellidos: e.apellidos }))
    .filter((e: any) => !Number.isNaN(e.id));
  const expsActuales = (px.exponentes || [])
    .map((e: any) => ({ id: Number(e.id), nombre: e.nombre, apellidos: e.apellidos }))
    .filter((e: any) => !Number.isNaN(e.id));
  const expsMap = new Map<number, any>();
  [...expsOrden, ...expsActuales].forEach((e: any) => expsMap.set(Number(e.id), e));
  if (isAsesoria) {
    try {
      const resExponentes = await programacionService.getAllExponentes();
      const catalogo = extractList<any>(resExponentes)
        .map((e: any) => ({ id: Number(e.id), nombre: e.nombre, apellidos: e.apellidos }))
        .filter((e: any) => !Number.isNaN(e.id));
      catalogo.forEach((e: any) => expsMap.set(Number(e.id), e));
    } catch (err) {
      console.warn('No se pudo cargar el catálogo completo de exponentes para edición:', err);
    }
  }

  const expsOpciones = Array.from(expsMap.values()).sort((a: any, b: any) => {
    const na = `${a?.nombre || ''} ${a?.apellidos || ''}`.trim().toLowerCase();
    const nb = `${b?.nombre || ''} ${b?.apellidos || ''}`.trim().toLowerCase();
    return na.localeCompare(nb);
  });
  let exponentesSeleccionadosEdicion = [...expsAsignados];

  const idPlantaEdicion = p.id_cliente_planta
    ?? ordenAsesoria?.id_cliente_planta
    ?? (px as any).id_cliente_planta
    ?? null;
  const idAreaEdicion = p.id_cliente_planta_area
    ?? ordenAsesoria?.id_cliente_planta_area
    ?? (px as any).id_cliente_planta_area
    ?? null;
  const modalidadVisitaEdicion = String((px as any).modalidad_visita || (px as any).modalidadVisita || px.modalidad || ordenAsesoria?.modalidad || '').trim().toLowerCase();
  const esVirtualEdicion = modalidadVisitaEdicion.startsWith('vir');

  // Cargar plantas del cliente
  const idCliente = (p as any).orden_servicio?.id_cliente || ordenAsesoria?.id_cliente || (p as any).id_cliente;
  if (idCliente) await cargarPlantasClienteProg(idCliente);

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
            ${isAsesoria
              ? `<div class="prog-form-group">
                  <label class="prog-form-label">Día de programación</label>
                  <input type="number" min="1" max="31" class="prog-form-control" name="dia_programada" value="${diaActual || 1}">
                  <small style="display:block;margin-top:6px;color:#64748b;font-size:11px;">Mes fijo: ${mesActual ? String(mesActual).padStart(2, '0') : '--'}/${anioActual || '----'}</small>
                </div>`
              : `<div class="prog-form-group"><label class="prog-form-label">Fecha</label><input type="date" class="prog-form-control" name="fecha_programada" value="${p.fecha_programada}"></div>`}
            <div class="prog-form-group"><label class="prog-form-label">Hora Inicio</label><input type="time" class="prog-form-control" name="hora_inicio" value="${fmtH(p.hora_inicio)}"></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="${fmtH(p.hora_fin || '')}"></div>
          </div>
        </div>
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Recursos</h3>
          ${isAsesoria
            ? `<div class="prog-form-group">
                <label class="prog-form-label">Exponentes/Ponentes a Asignar <span class="prog-required">*</span></label>
                <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#fafafa;">
                  <div id="editExponentesSeleccionados" style="display:flex;flex-wrap:wrap;gap:8px;min-height:34px;margin-bottom:10px;"></div>
                  <select class="prog-form-control" id="editSelectAgregarExponente">
                    <option value="">+ Agregar exponente...</option>
                  </select>
                </div>
              </div>`
            : `<div class="prog-form-group">
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
              </div>`}
          <div class="prog-form-group">
            <label class="prog-form-label">Asistente administrativo</label>
            <select class="prog-form-control" name="id_supervisor">
              <option value="">Sin asistente administrativo</option>
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
          <h3 class="prog-form-section-title">${esVirtualEdicion ? 'Observación' : 'Ubicación'}</h3>
          ${esVirtualEdicion ? `
            <div class="prog-form-group">
              <label class="prog-form-label">Observaciones</label>
              <textarea class="prog-form-control" name="observaciones" rows="4">${p.observaciones || ''}</textarea>
            </div>
          ` : `
            <div class="prog-form-row">
              <div class="prog-form-group"><label class="prog-form-label">Planta</label><select class="prog-form-control" name="id_cliente_planta" id="editPlantaSelect">${getPlantaOptionsProg(idPlantaEdicion)}</select></div>
              <div class="prog-form-group"><label class="prog-form-label">Área</label><select class="prog-form-control" name="id_cliente_planta_area" id="editAreaSelect">${getAreaOptionsProg(idPlantaEdicion || null, idAreaEdicion)}</select></div>
            </div>
            <div class="prog-form-group"><label class="prog-form-label">Observaciones</label><textarea class="prog-form-control" name="observaciones" rows="2">${p.observaciones || ''}</textarea></div>
          `}
        </div>
      </div>
      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnVolverDetalle">Cancelar</button>
        <button type="submit" class="prog-btn-primary">Guardar Cambios</button>
      </div>
    </form>`;

  body.querySelector('#btnVolverDetalle')?.addEventListener('click', () => abrirModalDetalle(p.id, isAsesoria ? 'asesoria' : (px.tipo_programacion === 'capacitacion' ? 'capacitacion' : 'servicio')));

  // Lógica de badge "Principal" para edición
  if (!isAsesoria) {
    setupPrincipalBadge(body.querySelector('#editTecnicosCheckboxes') as HTMLElement);
  }

  if (isAsesoria) {
    const contenedorExps = body.querySelector('#editExponentesSeleccionados') as HTMLElement | null;
    const selectAgregarExps = body.querySelector('#editSelectAgregarExponente') as HTMLSelectElement | null;

    const nombreExponente = (e: any) => `${(e?.nombre || '').trim()} ${(e?.apellidos || '').trim()}`.trim() || 'Exponente';

    const renderExponentesEdicion = () => {
      if (!contenedorExps || !selectAgregarExps) return;

      const seleccionados = expsOpciones.filter((e: any) => exponentesSeleccionadosEdicion.includes(Number(e.id)));
      if (seleccionados.length === 0) {
        contenedorExps.innerHTML = '<p style="margin:0;color:#999;font-size:12px;">No hay exponentes seleccionados</p>';
      } else {
        contenedorExps.innerHTML = seleccionados.map((e: any) => `
          <span style="display:inline-flex;align-items:center;gap:6px;background:#fef3c7;color:#92400e;border-radius:8px;padding:6px 10px;font-weight:600;font-size:13px;">
            ${nombreExponente(e)}
            <button type="button" data-remove-exponente-edit="${e.id}" style="border:none;background:transparent;cursor:pointer;color:#92400e;font-size:14px;line-height:1;padding:0;">×</button>
          </span>
        `).join('');
      }

      const idsSet = new Set(exponentesSeleccionadosEdicion);
      selectAgregarExps.innerHTML = `
        <option value="">+ Agregar exponente...</option>
        ${expsOpciones
          .filter((e: any) => !idsSet.has(Number(e.id)))
          .map((e: any) => `<option value="${e.id}">${nombreExponente(e)}</option>`)
          .join('')}
      `;

      contenedorExps.querySelectorAll('[data-remove-exponente-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = Number((btn as HTMLElement).getAttribute('data-remove-exponente-edit'));
          exponentesSeleccionadosEdicion = exponentesSeleccionadosEdicion.filter((x) => x !== id);
          renderExponentesEdicion();
        });
      });
    };

    selectAgregarExps?.addEventListener('change', () => {
      const id = Number(selectAgregarExps.value);
      if (!id) return;
      if (!exponentesSeleccionadosEdicion.includes(id)) {
        exponentesSeleccionadosEdicion.push(id);
      }
      selectAgregarExps.value = '';
      renderExponentesEdicion();
    });

    renderExponentesEdicion();
  }

  // Cascada planta → área en edición (solo presencial)
  if (!esVirtualEdicion) {
    body.querySelector('#editPlantaSelect')?.addEventListener('change', (e) => {
      const idPlanta = parseInt((e.target as HTMLSelectElement).value) || null;
      const areaSel = body.querySelector('#editAreaSelect') as HTMLSelectElement;
      if (areaSel) areaSel.innerHTML = getAreaOptionsProg(idPlanta);
    });
  }

  body.querySelector('#formEditarProg')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => {
      if (k !== 'tecnicos_ids' && k !== 'exponentes_ids') data[k] = v || null;
    });

    // Derivar local_sede y direccion_completa de planta si se seleccionó
    const idPlantaSel = parseInt(fd.get('id_cliente_planta') as string) || idPlantaEdicion || null;
    const idAreaSel = parseInt(fd.get('id_cliente_planta_area') as string) || idAreaEdicion || null;
    data.id_cliente_planta = idPlantaSel;
    data.id_cliente_planta_area = idAreaSel;
    data.local_sede = getPlantaNombre(idPlantaSel) || '';
    data.direccion_completa = getPlantaDireccion(idPlantaSel) || '';

    if (isAsesoria) {
      // En asesoría solo se edita el día, preservando mes y año actuales.
      const diaIngresado = parseInt((fd.get('dia_programada') as string) || `${diaActual || 1}`, 10);
      const baseDate = new Date(anioActual, (mesActual || 1) - 1, 1);
      const ultimoDia = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
      const diaFinal = Math.max(1, Math.min(Number.isNaN(diaIngresado) ? (diaActual || 1) : diaIngresado, ultimoDia));
      const fechaFinal = `${anioActual}-${String(mesActual).padStart(2, '0')}-${String(diaFinal).padStart(2, '0')}`;
      data.fecha_programada = fechaFinal;
      data.exponentes = exponentesSeleccionadosEdicion;
    } else {
      // Recoger técnicos para programación de servicios
      const checkedTecs = Array.from(body.querySelectorAll('#editTecnicosCheckboxes input[name="tecnicos_ids"]:checked')) as HTMLInputElement[];
      if (checkedTecs.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }
      const tecnicosIds = checkedTecs.map(c => parseInt(c.value));
      data.id_tecnico_asignado = tecnicosIds[0];
      data.tecnicos_ids = tecnicosIds;
    }

    try {
      if (isAsesoria) {
        await programacionService.updateProgramacionAsesoria(p.id, data);
      } else {
        await programacionService.update(p.id, data);
      }
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
          <div id="diasSemanaGroup" style="display:none;margin-top:12px;">
            <label class="prog-form-label">Seleccionar Días <span class="prog-required">*</span></label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#fafafa;">
              <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#fff;" title="Lunes">
                <input type="checkbox" class="dia-semana-check" value="Lunes" style="accent-color:#4f7cff;cursor:pointer;">
                <span style="font-weight:500;font-size:13px;">Lunes</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#fff;" title="Martes">
                <input type="checkbox" class="dia-semana-check" value="Martes" style="accent-color:#4f7cff;cursor:pointer;">
                <span style="font-weight:500;font-size:13px;">Martes</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#fff;" title="Miércoles">
                <input type="checkbox" class="dia-semana-check" value="Miércoles" style="accent-color:#4f7cff;cursor:pointer;">
                <span style="font-weight:500;font-size:13px;">Miércoles</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#fff;" title="Jueves">
                <input type="checkbox" class="dia-semana-check" value="Jueves" style="accent-color:#4f7cff;cursor:pointer;">
                <span style="font-weight:500;font-size:13px;">Jueves</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#fff;" title="Viernes">
                <input type="checkbox" class="dia-semana-check" value="Viernes" style="accent-color:#4f7cff;cursor:pointer;">
                <span style="font-weight:500;font-size:13px;">Viernes</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#fff;" title="Sábado">
                <input type="checkbox" class="dia-semana-check" value="Sábado" style="accent-color:#4f7cff;cursor:pointer;">
                <span style="font-weight:500;font-size:13px;">Sábado</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#fff;" title="Domingo">
                <input type="checkbox" class="dia-semana-check" value="Domingo" style="accent-color:#4f7cff;cursor:pointer;">
                <span style="font-weight:500;font-size:13px;">Domingo</span>
              </label>
            </div>
          </div>
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
            <label class="prog-form-label">Asistente administrativo</label>
            <select class="prog-form-control" name="id_supervisor">
              <option value="">Sin asistente administrativo</option>
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
          <div class="prog-form-group"><label class="prog-form-label">Planta</label><select class="prog-form-control" name="id_cliente_planta" id="newPlantaSelect"><option value="">-- Planta --</option></select></div>
          <div id="infoAreasServicio" style="display:none;margin-top:-4px;margin-bottom:8px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#475569;"></div>
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
  const infoAreasServicio = body.querySelector('#infoAreasServicio') as HTMLElement;

  // Lógica de badge "Principal" para técnicos
  setupPrincipalBadge(body.querySelector('#tecnicosCheckboxes') as HTMLElement);

  selectODS?.addEventListener('change', async () => {
    areaIdsServicioSeleccionado = [];
    plantaIdServicioSeleccionado = null;
    if (infoAreasServicio) infoAreasServicio.style.display = 'none';

    const odsId = parseInt(selectODS.value);
    const ods = odsDisponibles.find(o => o.id === odsId);
    const grupoServicio = body.querySelector('#grupoServicio') as HTMLElement;
    const detallesDiv = body.querySelector('#detallesODS') as HTMLElement;

    if (ods && ods.detalles.length > 0) {
      selectServicio.innerHTML = '<option value="">Seleccionar servicio...</option>' +
        ods.detalles.map(d => {
          const areaData = Array.isArray((d as any).id_cliente_planta_area)
            ? (d as any).id_cliente_planta_area.join(',')
            : ((d as any).id_cliente_planta_area || '');
          return `<option value="${d.id_servicio}" data-frecuencia="${d.frecuencia || ''}" data-local="${d.local || ''}" data-id-planta="${d.id_cliente_planta || ''}" data-id-area="${areaData}">${d.servicio_nombre}${d.frecuencia ? ' (' + d.frecuencia + ')' : ''}</option>`;
        }).join('');
      grupoServicio.style.display = 'block';
      detallesDiv.innerHTML = `<div style="margin-top:8px;padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;">
        <strong>Cliente:</strong> ${ods.cliente} &nbsp;|&nbsp; <strong>Servicios:</strong> ${ods.detalles.length}
      </div>`;
      // Cargar plantas del cliente de esta ODS
      if (ods.id_cliente) {
        await cargarPlantasClienteProg(ods.id_cliente);
        const plantaSel = body.querySelector('#newPlantaSelect') as HTMLSelectElement;
        if (plantaSel) plantaSel.innerHTML = getPlantaOptionsProg();
      }
    } else {
      grupoServicio.style.display = 'none';
      detallesDiv.innerHTML = '';
    }
    (body.querySelector('#infoFrecuencia') as HTMLElement).style.display = 'none';
  });

  selectServicio?.addEventListener('change', () => {
    const opt = selectServicio.selectedOptions[0];
    const frecuencia = opt?.dataset.frecuencia || '';
    const infoDiv = body.querySelector('#infoFrecuencia') as HTMLElement;
    const diasGroup = body.querySelector('#diasSemanaGroup') as HTMLElement;
    const radioIndividual = body.querySelector('input[name="modo"][value="individual"]') as HTMLInputElement | null;
    const radioAnual = body.querySelector('input[name="modo"][value="anual"]') as HTMLInputElement | null;

    // Mostrar/ocultar selección de días según frecuencia
    const frecuenciaEsDiasSemana = esFrecuenciaDiasSemana(frecuencia);
    if (frecuenciaEsDiasSemana) {
      diasGroup.style.display = 'block';
      infoDiv.innerHTML = `Frecuencia: <strong>${frecuencia}</strong>. Puedes editar los días específicos de la semana.`;
      infoDiv.style.display = 'block';
      setDiasSemanaChecks(body, extraerDiasDesdeFrecuencia(frecuencia));
    } else {
      diasGroup.style.display = 'none';
      setDiasSemanaChecks(body, []);
      if (frecuencia) {
        infoDiv.innerHTML = `Frecuencia: <strong>${frecuencia}</strong>. ${frecuencia.toLowerCase() !== 'única' ? 'Puedes usar "Año Completo" para programar todas las fechas automáticamente.' : ''}`;
        infoDiv.style.display = 'block';
      } else { 
        infoDiv.style.display = 'none'; 
      }
    }

    // Regla de negocio: si la frecuencia es única, no permitir programación anual.
    if (radioAnual) {
      const bloquearAnual = esFrecuenciaUnica(frecuencia);
      radioAnual.disabled = bloquearAnual;
      if (bloquearAnual) {
        radioAnual.checked = false;
        if (radioIndividual) radioIndividual.checked = true;
        (body.querySelector('#seccionIndividual') as HTMLElement).style.display = 'block';
        (body.querySelector('#seccionAnual') as HTMLElement).style.display = 'none';
        const submitBtn = body.querySelector('#btnSubmitNueva') as HTMLElement | null;
        if (submitBtn) submitBtn.textContent = 'Crear Programación';
      }
    }

    // Auto-seleccionar planta/area del detalle del servicio
    const idPlantaDet = parseInt(opt?.dataset.idPlanta || '') || null;
    const areasDet = normalizeAreaIds(opt?.dataset.idArea || '');
    areaIdsServicioSeleccionado = areasDet;
    plantaIdServicioSeleccionado = idPlantaDet;

    if (infoAreasServicio) {
      const nombres = getAreaNombresPorIds(idPlantaDet, areasDet);
      if (nombres.length > 0) {
        infoAreasServicio.style.display = '';
        infoAreasServicio.innerHTML = '<div style="font-size:12px;color:#64748b;margin-bottom:4px;">Áreas del servicio</div>' +
          '<div>' + renderAreaChipsLikeODS(nombres) + '</div>';
      } else {
        infoAreasServicio.style.display = 'none';
      }
    }

    const plantaSel = body.querySelector('#newPlantaSelect') as HTMLSelectElement;
    if (plantaSel) {
      plantaSel.innerHTML = getPlantaOptionsProg(idPlantaDet);
    }
  });

  // Si cambian la planta, se mantiene la visualización de áreas del servicio solo cuando coincide con su planta original.
  body.querySelector('#newPlantaSelect')?.addEventListener('change', (e) => {
    const idPlanta = parseInt((e.target as HTMLSelectElement).value) || null;
    if (infoAreasServicio) {
      const mostrar = !!(idPlanta && plantaIdServicioSeleccionado && idPlanta === plantaIdServicioSeleccionado && areaIdsServicioSeleccionado.length > 0);
      if (!mostrar) {
        infoAreasServicio.style.display = 'none';
      } else {
        const nombres = getAreaNombresPorIds(idPlanta, areaIdsServicioSeleccionado);
        if (nombres.length > 0) {
          infoAreasServicio.style.display = '';
          infoAreasServicio.innerHTML = '<div style="font-size:12px;color:#64748b;margin-bottom:4px;">Áreas del servicio</div>' +
            '<div>' + renderAreaChipsLikeODS(nombres) + '</div>';
        } else {
          infoAreasServicio.style.display = 'none';
        }
      }
    }
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
    const frecuenciaBackend = frecuenciaParaBackend(frecuencia);
    const fechaInicio = (body.querySelector('#fechaInicioAnual') as HTMLInputElement).value;
    const resultDiv = body.querySelector('#previewAnualResult') as HTMLElement;

    if (!idServicio || !frecuencia || !fechaInicio) {
      resultDiv.innerHTML = '<p style="color:#ef4444;">Seleccione servicio con frecuencia y fecha de inicio</p>';
      return;
    }

    // Si la frecuencia es "días de la semana", validar y capturar días
    let diasSemana: string | null = null;
    const diasGroup = body.querySelector('#diasSemanaGroup') as HTMLElement;
    if (diasGroup && diasGroup.style.display !== 'none') {
      const checkboxes = diasGroup.querySelectorAll('input[type="checkbox"]:checked') as NodeListOf<HTMLInputElement>;
      if (checkboxes.length === 0) {
        mostrarToast('warning', 'Advertencia', 'Seleccione al menos un día de la semana');
        return;
      }
      const dias = Array.from(checkboxes).map(cb => cb.value);
      diasSemana = dias.join(',');
    }

    resultDiv.innerHTML = '<p style="color:#999;">Calculando fechas...</p>';

    try {
      const payload: any = { id_servicio: idServicio, frecuencia: frecuenciaBackend, fecha_inicio: fechaInicio };
      if (diasSemana) payload.dias_semana = diasSemana;
      
      const res = await programacionService.previewAnual(payload);
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

/**
 * Verifica si hay conflicto de horarios para un técnico en una fecha específica
 */
function verificarConflictosHorarios(tecnicosIds: number[], fechaProgramada: string, horaInicio: string, horaFin: string): { hayConflicto: boolean; conflictoDetalle: string } {
  // Convertir hora a minutos desde medianoche para comparación
  const horaAMinutos = (hora: string | undefined | null): number => {
    if (!hora) return 0;
    const [h, m] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  
  const inicioNuevo = horaAMinutos(horaInicio);
  const finNuevo = horaAMinutos(horaFin);
  
  // Buscar conflictos en programaciones existentes
  for (const prog of programacionesData) {
    // Ignorar programaciones canceladas
    if (prog.estado_ejecucion === 'Cancelado') continue;
    
    // Verificar si el técnico es el mismo
    const tieneAlMismo = tecnicosIds.includes(prog.id_tecnico_asignado) || 
                         (Array.isArray((prog as any).tecnicos_ids) && 
                          (prog as any).tecnicos_ids.some((t: number) => tecnicosIds.includes(t)));
    
    if (!tieneAlMismo) continue;
    
    // Verificar si la fecha es la misma
    if (prog.fecha_programada !== fechaProgramada) continue;
    
    // Verificar si hay conflicto de horarios
    const inicioExistente = horaAMinutos(prog.hora_inicio);
    const finExistente = horaAMinutos(prog.hora_fin);
    
    // Hay conflicto si los rangos se solapan
    // DOS horarios NO se solapan si: uno termina antes o al mismo tiempo que el otro comienza
    const noHaySolapamiento = finNuevo <= inicioExistente || inicioNuevo >= finExistente;
    
    if (!noHaySolapamiento) {
      // Extraer nombre del técnico asignado
      const tecnicoInfo = tecnicosData.find(t => t.id === prog.id_tecnico_asignado);
      const nombreTecnico = tecnicoInfo ? `${tecnicoInfo.nombre || ''} ${tecnicoInfo.apellidos || ''}`.trim() : `Técnico #${prog.id_tecnico_asignado}`;
      
      return {
        hayConflicto: true,
        conflictoDetalle: `El técnico "${nombreTecnico}" ya tiene un servicio programado el ${new Date(prog.fecha_programada + 'T00:00:00').toLocaleDateString('es-PE')} de ${prog.hora_inicio} a ${prog.hora_fin}. Por favor, selecciona otro técnico u otro horario.`
      };
    }
  }
  
  return { hayConflicto: false, conflictoDetalle: '' };
}

async function submitIndividual(body: HTMLElement) {
  const fd = new FormData(body.querySelector('#formNuevaProg') as HTMLFormElement);
  const data: Record<string, any> = {};
  fd.forEach((v, k) => { if (!k.includes('anual') && k !== 'modo' && k !== 'tecnicos_ids') data[k] = v || null; });

  // Derivar local_sede y direccion_completa de planta
  const idPlantaSel = parseInt(fd.get('id_cliente_planta') as string) || null;
  data.id_cliente_planta = idPlantaSel;
  data.id_cliente_planta_area = resolveAreaIdNuevaProgramacion(idPlantaSel);
  data.local_sede = getPlantaNombre(idPlantaSel) || '';
  data.direccion_completa = getPlantaDireccion(idPlantaSel) || '';

  // Recoger técnicos seleccionados
  const checkedTecs = Array.from(body.querySelectorAll('input[name="tecnicos_ids"]:checked')) as HTMLInputElement[];
  if (checkedTecs.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }
  const tecnicosIds = checkedTecs.map(c => parseInt(c.value));
  data.id_tecnico_asignado = tecnicosIds[0]; // Primero = principal
  data.tecnicos_ids = tecnicosIds;

  // Recoger días de semana si está visible
  const diasGroup = body.querySelector('#diasSemanaGroup') as HTMLElement;
  if (diasGroup && diasGroup.style.display !== 'none') {
    const checkedDias = Array.from(body.querySelectorAll('.dia-semana-check:checked')) as HTMLInputElement[];
    if (checkedDias.length === 0) {
      mostrarToast('warning', 'Días requeridos', 'Debe seleccionar al menos un día de la semana');
      return;
    }
    data.dias_semana = checkedDias.map(d => d.value).join(',');
  }

  // ✅ VALIDAR CONFLICTOS DE HORARIOS ANTES DE GUARDAR
  const validacion = verificarConflictosHorarios(tecnicosIds, data.fecha_programada, data.hora_inicio, data.hora_fin);
  if (validacion.hayConflicto) {
    mostrarToast('warning', 'Conflicto de Horarios', validacion.conflictoDetalle);
    return;
  }

  try {
    await programacionService.create(data);
    cerrarModal('modalNuevaProgramacion');
    await recargarProgramaciones();
    mostrarToast('success', 'Programación Creada', 'La programación fue registrada exitosamente');
  } catch (err: any) {
    let message = err?.data?.message || err?.response?.data?.message || err?.message || 'No se pudo crear la programación';
    const errors = err?.data?.errors || err?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const detalles = Object.entries(errors)
        .map(([campo, msgs]: [string, any]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      if (detalles) message = `${message}. ${detalles}`;
    }
    mostrarToast('error', 'Error', message);
    console.error('Error creando programación individual:', err?.data || err);
  }
}

async function submitAnual(body: HTMLElement) {
  const selectODS = body.querySelector('#selectODS') as HTMLSelectElement;
  const selectServicio = body.querySelector('#selectServicio') as HTMLSelectElement;
  const opt = selectServicio.selectedOptions[0];
  const frecuencia = opt?.dataset.frecuencia || '';
  const frecuenciaBackend = frecuenciaParaBackend(frecuencia);
  const fechaInicio = (body.querySelector('[name="fecha_inicio_anual"]') as HTMLInputElement).value;
  const horaInicio = (body.querySelector('[name="hora_inicio_anual"]') as HTMLInputElement).value;
  const horaFin = (body.querySelector('[name="hora_fin_anual"]') as HTMLInputElement).value;

  if (!frecuencia || !fechaInicio) { mostrarToast('warning', 'Datos incompletos', 'Seleccione un servicio con frecuencia y fecha de inicio'); return; }
  if (esFrecuenciaUnica(frecuencia)) {
    mostrarToast('warning', 'Frecuencia no válida', 'Para frecuencia Única no aplica Programación Anual. Use modo Individual.');
    return;
  }

  // Recoger técnicos seleccionados
  const checkedTecs = Array.from(body.querySelectorAll('input[name="tecnicos_ids"]:checked')) as HTMLInputElement[];
  if (checkedTecs.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }
  const tecnicosIds = checkedTecs.map(c => parseInt(c.value));

  const ok = await confirmarAccion({ titulo: 'Programación Anual', mensaje: `Se crearán todas las programaciones del año para frecuencia <strong>"${frecuencia}"</strong>. ¿Desea continuar?`, tipo: 'warning', textoConfirmar: 'Sí, crear todas' });
  if (!ok) return;

  const fd = new FormData(body.querySelector('#formNuevaProg') as HTMLFormElement);
  const idPlantaSel = parseInt(fd.get('id_cliente_planta') as string) || null;
  const data: Record<string, any> = {
    id_orden_servicio: selectODS.value,
    id_servicio: selectServicio.value,
    id_tecnico_asignado: tecnicosIds[0],
    tecnicos_ids: tecnicosIds,
    id_supervisor: fd.get('id_supervisor') || null,
    id_vehiculo: fd.get('id_vehiculo') || null,
    frecuencia: frecuenciaBackend,
    fecha_inicio: fechaInicio,
    hora_inicio: horaInicio || '08:00',
    hora_fin: horaFin || '12:00',
    id_cliente_planta: idPlantaSel,
    id_cliente_planta_area: resolveAreaIdNuevaProgramacion(idPlantaSel),
    local_sede: getPlantaNombre(idPlantaSel) || '',
    direccion_completa: getPlantaDireccion(idPlantaSel) || '',
    observaciones: fd.get('observaciones') || '',
  };

  // Recoger días de semana si está visible
  const diasGroup = body.querySelector('#diasSemanaGroup') as HTMLElement;
  if (diasGroup && diasGroup.style.display !== 'none') {
    const checkedDias = Array.from(body.querySelectorAll('.dia-semana-check:checked')) as HTMLInputElement[];
    if (checkedDias.length === 0) {
      mostrarToast('warning', 'Días requeridos', 'Debe seleccionar al menos un día de la semana');
      return;
    }
    data.dias_semana = checkedDias.map(d => d.value).join(',');
  }

  try {
    const res = await programacionService.createAnual(data);
    cerrarModal('modalNuevaProgramacion');
    await recargarProgramaciones();
    const total = res.total_programaciones || (res.data ? res.data.length : 0);
    mostrarToast('success', 'Programación Anual Creada', `Se crearon ${total} programaciones exitosamente`);
  } catch (err: any) {
    let message = err?.data?.message || err?.response?.data?.message || 'No se pudo crear la programación anual';
    const errors = err?.data?.errors || err?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const detalles = Object.entries(errors)
        .map(([campo, msgs]: [string, any]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      if (detalles) message = `${message}. ${detalles}`;
    }
    mostrarToast('error', 'Error', message);
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

// ═══════════ Exportar PDF ═══════════

async function exportarPDF() {
  const btn = document.getElementById('btnExportarPDF') as HTMLButtonElement | null;
  if (btn) { btn.disabled = true; btn.textContent = 'Generando…'; }

  try {
    const params: Record<string, any> = { vista: vistaActual };

    if (vistaActual === 'mensual') {
      params.mes = fechaActual.getMonth() + 1;
      params.anio = fechaActual.getFullYear();
    } else if (vistaActual === 'semanal') {
      const lunes = getLunesDeSemana(fechaActual);
      params.fecha_inicio = fmtDate(lunes);
    } else {
      params.fecha = fmtDate(fechaActual);
    }

    // Pasar filtros activos
    if (filtroTecnico) params.id_tecnico = filtroTecnico;
    if (filtroEstados.length > 0) params.estado = filtroEstados.join(',');

    await programacionService.downloadPDF(params as any);
    mostrarToast('success', 'PDF generado', 'El archivo se descargó correctamente');
  } catch (err: any) {
    console.error('Error exportando PDF:', err);
    mostrarToast('error', 'Error', 'No se pudo generar el PDF');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg> Exportar PDF`;
    }
  }
}

function clienteNombre(p: Programacion): string {
  const px = p as ProgramacionExtendida;
  const c = p.orden_servicio?.cliente || px.orden_capacitacion?.cliente || px.orden_asesoria?.cliente;
  return c ? (c.nombre_empresa || c.persona_contacto || '—') : '—';
}

function getClientesUnicos(): { id: number; nombre: string }[] {
  const clientesMap = new Map<number, string>();
  programacionesData.forEach(p => {
    const px = p as ProgramacionExtendida;
    const cliente = p.orden_servicio?.cliente || px.orden_capacitacion?.cliente || px.orden_asesoria?.cliente;
    if (cliente && cliente.id) {
      const nombre = cliente.nombre_empresa || cliente.persona_contacto || '—';
      clientesMap.set(cliente.id, nombre);
    }
  });
  return Array.from(clientesMap.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
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
