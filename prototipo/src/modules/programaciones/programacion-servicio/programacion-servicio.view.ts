// Programación de Servicio View — conectado a API real
import '../programaciones.css';
import './programacion-servicio.css';
import { programacionServicioService as programacionService } from './programacion-servicio.service';
import { mostrarToast, confirmarAccion } from '../../../shared/toast';
import { clienteService } from '../../../services/clienteService';
import type {
  Programacion,
  Tecnico,
  Vehiculo,
  ODSDisponible,
  EstadisticasProgramacion,
  EstadoEjecucion,
  VistaProgramacion,
  SugerenciaSiguiente,
  ResumenPendientesRecursos,
} from './programacion-servicio.types';

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
let clientesAceptados: any[] = [];
let plantasClienteVisita: any[] = [];
let ordenesFabricacionDisponiblesData: any[] = [];
let resumenPendientesRecursos: ResumenPendientesRecursos = {
  vencidas: 0,
  proximos_7_dias: 0,
  proximos_2_dias: 0,
  total_pendientes: 0,
  items: [],
};

type GrupoProgramacionManual = {
  id: string;
  ids: number[];
  createdAt: number;
};

type ItemCalendario = {
  kind: 'single' | 'group';
  ids: number[];
  groupId?: string;
  programaciones: Programacion[];
  principal: Programacion;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  clienteLabel: string;
  plantaLabel: string;
  tecnicosLabel: string;
  actividadesLabel: string;
  estadoLabel: string;
};

const LOCAL_KEY_GRUPOS_MANUALES = 'prog-servicio-grupos-manuales-v1';
const GAP_MAX_MINUTOS_AGRUPACION = 5;
let gruposProgramacionManual: GrupoProgramacionManual[] = [];
let modoSeleccionAgrupacion = false;
let idsSeleccionAgrupacion = new Set<number>();

function renderResumenPendientesRecursos(): string {
  const total = Number(resumenPendientesRecursos.total_pendientes || 0);
  const p7 = Number(resumenPendientesRecursos.proximos_7_dias || 0);
  const p2 = Number(resumenPendientesRecursos.proximos_2_dias || 0);
  const vencidas = Number(resumenPendientesRecursos.vencidas || 0);

  if (total <= 0) {
    return '';
  }

  const nivel = p2 > 0 || vencidas > 0
    ? { bg: '#fef2f2', bd: '#fecaca', tx: '#991b1b', title: 'Pendientes críticos de recursos' }
    : { bg: '#eff6ff', bd: '#bfdbfe', tx: '#1e3a8a', title: 'Pendientes de asignación de recursos' };

  return `
    <div style="margin:0 0 10px;padding:10px 12px;border:1px solid ${nivel.bd};background:${nivel.bg};border-radius:10px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
      <div>
        <div style="font-weight:700;font-size:13px;color:${nivel.tx};">${nivel.title}</div>
        <div style="font-size:12px;color:#334155;margin-top:2px;">Tienes <strong>${total}</strong> servicios sin recursos completos.</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <span style="font-size:12px;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;">7 días: <strong>${p7}</strong></span>
        <span style="font-size:12px;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;">2 días: <strong>${p2}</strong></span>
        <span style="font-size:12px;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;">Vencidas: <strong>${vencidas}</strong></span>
      </div>
    </div>`;
}

function actualizarResumenPendientesUI() {
  const wrap = document.getElementById('progResumenPendientesWrap');
  if (!wrap) return;
  wrap.innerHTML = renderResumenPendientesRecursos();
}

function extractList<T = any>(response: any): T[] {
  const raw = response?.data ?? response;
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

type ProgramacionExtendida = Programacion & {
  tipo_programacion?: 'servicio' | 'capacitacion' | 'asesoria' | 'visita' | 'fabricacion' | 'otros';
  orden_capacitacion?: any;
  orden_asesoria?: any;
  cliente?: any;
  tipo_visita?: string;
  id_orden_fabricacion?: number;
  orden_fabricacion?: any;
  motivo_fabricacion?: string;
  motivo?: string;
  ubicacion_manual?: string;
  productos_fabricacion?: number[];
  receta_fabricacion?: any[];
  exponentes?: any[];
  modalidad?: string;
  modalidad_visita?: string;
  meses_implementacion?: number | null;
  frecuencia_visita?: any;
  dias_por_mes_calculado?: Record<string, { presencial: number[]; virtual: number[] }>;
  resumen_por_mes?: Array<{ mes: number; presencial: number; virtual: number; frecuencia: string }>;
  fecha_fin_programacion?: string | null;
};

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

function getAreaOptionsProgMultiple(idPlanta: number | null, selectedIds: number[] = []): string {
  let opts = '';
  if (!idPlanta) return opts;
  const planta = plantasClienteDataProg.find((p: any) => p.id == idPlanta);
  if (!planta) return opts;
  const areas = planta.areas_activas || planta.areas || [];
  const selectedSet = new Set(selectedIds.map(Number));

  areas.forEach((a: any) => {
    if (a.estado && a.estado !== 'Activo') return;
    const sel = selectedSet.has(Number(a.id)) ? 'selected' : '';
    opts += `<option value="${a.id}" ${sel}>${a.nombre}</option>`;
  });

  return opts;
}

function getAreaIdsFromEditForm(container: HTMLElement): number[] {
  const multi = container.querySelector('#editAreaSelect') as HTMLSelectElement | null;
  if (!multi) return [];
  return Array.from(multi.selectedOptions)
    .map((opt) => parseInt(opt.value || '0', 10))
    .filter((id) => id > 0);
}

function actualizarResumenAreasEdicion(container: HTMLElement) {
  const multi = container.querySelector('#editAreaSelect') as HTMLSelectElement | null;
  const resumen = container.querySelector('#editAreaSummary') as HTMLElement | null;
  const toggle = container.querySelector('#editAreaToggle') as HTMLButtonElement | null;
  if (!multi || !resumen || !toggle) return;

  const ids = getAreaIdsFromEditForm(container);
  if (ids.length === 0) {
    resumen.textContent = 'Sin áreas seleccionadas';
    resumen.style.color = '#94a3b8';
    toggle.textContent = 'Seleccionar áreas';
    return;
  }

  const labels = Array.from(multi.selectedOptions)
    .map((opt) => (opt.text || '').trim())
    .filter(Boolean);

  toggle.textContent = `${ids.length} área(s)`;
  resumen.style.color = '#334155';

  const chips = labels.slice(0, 2)
    .map((nombre) => `<span style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">${nombre}</span>`)
    .join('');

  if (labels.length > 2) {
    resumen.innerHTML = chips + `<span style="font-size:11px;color:#64748b;">+${labels.length - 2} más</span>`;
  } else {
    resumen.innerHTML = chips;
  }
}

function renderAreaPickerOptionsEdicion(container: HTMLElement) {
  const multi = container.querySelector('#editAreaSelect') as HTMLSelectElement | null;
  const wrap = container.querySelector('#editAreaOptions') as HTMLElement | null;
  if (!multi || !wrap) return;

  if (multi.options.length === 0) {
    wrap.innerHTML = '<div style="padding:6px 0;color:#94a3b8;font-size:12px;">Primero seleccione una planta</div>';
    return;
  }

  wrap.innerHTML = Array.from(multi.options)
    .map((opt, index) => {
      return `<label style="display:flex;align-items:center;gap:7px;padding:4px 0;font-size:13px;color:#334155;cursor:pointer;">
        <input type="checkbox" class="edit-area-check" data-index="${index}" ${opt.selected ? 'checked' : ''}>
        <span>${opt.text}</span>
      </label>`;
    })
    .join('');

  wrap.querySelectorAll('.edit-area-check').forEach((el) => {
    el.addEventListener('change', (e) => {
      e.stopPropagation();
      const idx = Number((e.currentTarget as HTMLInputElement).dataset.index || '-1');
      if (idx < 0 || !multi.options[idx]) return;
      multi.options[idx].selected = (e.currentTarget as HTMLInputElement).checked;
      actualizarResumenAreasEdicion(container);
    });
  });
}

function bindAreaMultiInteractionsEdicion(container: HTMLElement) {
  const panel = container.querySelector('#editAreaPanel') as HTMLElement | null;
  const toggle = container.querySelector('#editAreaToggle') as HTMLButtonElement | null;
  const btnAll = container.querySelector('#editAreaSelectAll') as HTMLButtonElement | null;
  const btnClear = container.querySelector('#editAreaClearAll') as HTMLButtonElement | null;
  const multi = container.querySelector('#editAreaSelect') as HTMLSelectElement | null;

  if (!panel || !toggle || !multi) return;

  toggle.onclick = (e) => {
    e.preventDefault();
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };

  btnAll?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = true; });
    renderAreaPickerOptionsEdicion(container);
    actualizarResumenAreasEdicion(container);
  });

  btnClear?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = false; });
    renderAreaPickerOptionsEdicion(container);
    actualizarResumenAreasEdicion(container);
  });

  document.addEventListener('click', (ev) => {
    if (!panel.contains(ev.target as Node) && !toggle.contains(ev.target as Node)) {
      panel.style.display = 'none';
    }
  });
}

function getAreaIdsFromVisitaForm(container: HTMLElement): number[] {
  const multi = container.querySelector('#areasSelectVisita') as HTMLSelectElement | null;
  if (!multi) return [];
  return Array.from(multi.selectedOptions)
    .map((opt) => parseInt(opt.value || '0', 10))
    .filter((id) => id > 0);
}

function actualizarResumenAreasVisita(container: HTMLElement) {
  const multi = container.querySelector('#areasSelectVisita') as HTMLSelectElement | null;
  const resumen = container.querySelector('#visitaAreaSummary') as HTMLElement | null;
  const toggle = container.querySelector('#visitaAreaToggle') as HTMLButtonElement | null;
  if (!multi || !resumen || !toggle) return;

  const ids = getAreaIdsFromVisitaForm(container);
  if (ids.length === 0) {
    resumen.textContent = 'Sin areas seleccionadas';
    resumen.style.color = '#94a3b8';
    toggle.textContent = 'Seleccionar areas';
    return;
  }

  const labels = Array.from(multi.selectedOptions)
    .map((opt) => (opt.text || '').trim())
    .filter(Boolean);

  toggle.textContent = `${ids.length} area(s)`;
  resumen.style.color = '#334155';

  const chips = labels.slice(0, 2)
    .map((nombre) => `<span style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">${nombre}</span>`)
    .join('');

  if (labels.length > 2) {
    resumen.innerHTML = chips + `<span style="font-size:11px;color:#64748b;">+${labels.length - 2} mas</span>`;
  } else {
    resumen.innerHTML = chips;
  }
}

function renderAreaPickerOptionsVisita(container: HTMLElement) {
  const multi = container.querySelector('#areasSelectVisita') as HTMLSelectElement | null;
  const wrap = container.querySelector('#visitaAreaOptions') as HTMLElement | null;
  if (!multi || !wrap) return;

  if (multi.options.length === 0) {
    wrap.innerHTML = '<div style="padding:6px 0;color:#94a3b8;font-size:12px;">Primero seleccione una planta</div>';
    return;
  }

  wrap.innerHTML = Array.from(multi.options)
    .map((opt, index) => {
      return `<label style="display:flex;align-items:center;gap:7px;padding:4px 0;font-size:13px;color:#334155;cursor:pointer;">
        <input type="checkbox" class="visita-area-check" data-index="${index}" ${opt.selected ? 'checked' : ''}>
        <span>${opt.text}</span>
      </label>`;
    })
    .join('');

  wrap.querySelectorAll('.visita-area-check').forEach((el) => {
    el.addEventListener('change', (e) => {
      e.stopPropagation();
      const idx = Number((e.currentTarget as HTMLInputElement).dataset.index || '-1');
      if (idx < 0 || !multi.options[idx]) return;
      multi.options[idx].selected = (e.currentTarget as HTMLInputElement).checked;
      actualizarResumenAreasVisita(container);
    });
  });
}

function bindAreaMultiInteractionsVisita(container: HTMLElement) {
  const panel = container.querySelector('#visitaAreaPanel') as HTMLElement | null;
  const toggle = container.querySelector('#visitaAreaToggle') as HTMLButtonElement | null;
  const btnAll = container.querySelector('#visitaAreaSelectAll') as HTMLButtonElement | null;
  const btnClear = container.querySelector('#visitaAreaClearAll') as HTMLButtonElement | null;
  const multi = container.querySelector('#areasSelectVisita') as HTMLSelectElement | null;

  if (!panel || !toggle || !multi) return;

  toggle.onclick = (e) => {
    e.preventDefault();
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };

  btnAll?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = true; });
    renderAreaPickerOptionsVisita(container);
    actualizarResumenAreasVisita(container);
  });

  btnClear?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = false; });
    renderAreaPickerOptionsVisita(container);
    actualizarResumenAreasVisita(container);
  });

  document.addEventListener('click', (ev) => {
    if (!panel.contains(ev.target as Node) && !toggle.contains(ev.target as Node)) {
      panel.style.display = 'none';
    }
  });
}

function getPersonalIdsFromVisitaForm(container: HTMLElement): number[] {
  const multi = container.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement | null;
  if (!multi) return [];
  return Array.from(multi.selectedOptions)
    .map((opt) => parseInt(opt.value || '0', 10))
    .filter((id) => id > 0);
}

function actualizarResumenPersonalVisita(container: HTMLElement) {
  const multi = container.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement | null;
  const resumen = container.querySelector('#personalAdministrativoSummary') as HTMLElement | null;
  const toggle = container.querySelector('#personalAdministrativoToggle') as HTMLButtonElement | null;
  if (!multi || !resumen || !toggle) return;

  const ids = getPersonalIdsFromVisitaForm(container);
  if (ids.length === 0) {
    resumen.textContent = 'Sin personal seleccionado';
    resumen.style.color = '#94a3b8';
    toggle.textContent = 'Seleccionar personal';
    return;
  }

  const labels = Array.from(multi.selectedOptions)
    .map((opt) => (opt.text || '').trim())
    .filter(Boolean);

  toggle.textContent = `${ids.length} persona(s)`;
  resumen.style.color = '#334155';

  const chips = labels.slice(0, 2)
    .map((nombre) => `<span style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">${nombre}</span>`)
    .join('');

  if (labels.length > 2) {
    resumen.innerHTML = chips + `<span style="font-size:11px;color:#64748b;">+${labels.length - 2} más</span>`;
  } else {
    resumen.innerHTML = chips;
  }
}

function renderPersonalPickerOptionsVisita(container: HTMLElement) {
  const multi = container.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement | null;
  const wrap = container.querySelector('#personalAdministrativoOptions') as HTMLElement | null;
  if (!multi || !wrap) return;

  if (multi.options.length === 0) {
    wrap.innerHTML = '<div style="padding:6px 0;color:#94a3b8;font-size:12px;">No hay personal disponible</div>';
    return;
  }

  wrap.innerHTML = Array.from(multi.options)
    .map((opt, index) => {
      return `<label style="display:flex;align-items:center;gap:7px;padding:4px 0;font-size:13px;color:#334155;cursor:pointer;">
        <input type="checkbox" class="personal-admin-check" data-index="${index}" ${opt.selected ? 'checked' : ''}>
        <span>${opt.text}</span>
      </label>`;
    })
    .join('');

  wrap.querySelectorAll('.personal-admin-check').forEach((el) => {
    el.addEventListener('change', (e) => {
      e.stopPropagation();
      const idx = Number((e.currentTarget as HTMLInputElement).dataset.index || '-1');
      if (idx < 0 || !multi.options[idx]) return;
      multi.options[idx].selected = (e.currentTarget as HTMLInputElement).checked;
      actualizarResumenPersonalVisita(container);
    });
  });
}

function bindPersonalMultiInteractionsVisita(container: HTMLElement) {
  const panel = container.querySelector('#personalAdministrativoPanel') as HTMLElement | null;
  const toggle = container.querySelector('#personalAdministrativoToggle') as HTMLButtonElement | null;
  const btnAll = container.querySelector('#personalAdministrativoSelectAll') as HTMLButtonElement | null;
  const btnClear = container.querySelector('#personalAdministrativoClearAll') as HTMLButtonElement | null;
  const multi = container.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement | null;

  if (!panel || !toggle || !multi) return;

  toggle.onclick = (e) => {
    e.preventDefault();
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };

  btnAll?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = true; });
    renderPersonalPickerOptionsVisita(container);
    actualizarResumenPersonalVisita(container);
  });

  btnClear?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = false; });
    renderPersonalPickerOptionsVisita(container);
    actualizarResumenPersonalVisita(container);
  });

  document.addEventListener('click', (ev) => {
    if (!panel.contains(ev.target as Node) && !toggle.contains(ev.target as Node)) {
      panel.style.display = 'none';
    }
  });
}

function getPersonalIdsFromServicioForm(container: HTMLElement): number[] {
  const multi = container.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement | null;
  if (!multi) return [];
  return Array.from(multi.selectedOptions)
    .map((opt) => parseInt(opt.value || '0', 10))
    .filter((id) => id > 0);
}

function actualizarResumenPersonalServicio(container: HTMLElement) {
  const multi = container.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement | null;
  const resumen = container.querySelector('#personalAdministrativoSummaryServicio') as HTMLElement | null;
  const toggle = container.querySelector('#personalAdministrativoToggleServicio') as HTMLButtonElement | null;
  if (!multi || !resumen || !toggle) return;

  const ids = getPersonalIdsFromServicioForm(container);
  if (ids.length === 0) {
    resumen.textContent = 'Sin personal seleccionado';
    resumen.style.color = '#94a3b8';
    toggle.textContent = 'Seleccionar personal';
    return;
  }

  const labels = Array.from(multi.selectedOptions)
    .map((opt) => (opt.text || '').trim())
    .filter(Boolean);

  toggle.textContent = `${ids.length} persona(s)`;
  resumen.style.color = '#334155';

  const chips = labels.slice(0, 2)
    .map((nombre) => `<span style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">${nombre}</span>`)
    .join('');

  if (labels.length > 2) {
    resumen.innerHTML = chips + `<span style="font-size:11px;color:#64748b;">+${labels.length - 2} más</span>`;
  } else {
    resumen.innerHTML = chips;
  }
}

function renderPersonalPickerOptionsServicio(container: HTMLElement) {
  const multi = container.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement | null;
  const wrap = container.querySelector('#personalAdministrativoOptionsServicio') as HTMLElement | null;
  if (!multi || !wrap) return;

  if (multi.options.length === 0) {
    wrap.innerHTML = '<div style="padding:6px 0;color:#94a3b8;font-size:12px;">No hay personal disponible</div>';
    return;
  }

  wrap.innerHTML = Array.from(multi.options)
    .map((opt, index) => `
      <label style="display:flex;align-items:center;gap:7px;padding:4px 0;font-size:13px;color:#334155;cursor:pointer;">
        <input type="checkbox" class="personal-admin-check-servicio" data-index="${index}" ${opt.selected ? 'checked' : ''}>
        <span>${opt.text}</span>
      </label>`)
    .join('');

  wrap.querySelectorAll('.personal-admin-check-servicio').forEach((el) => {
    el.addEventListener('change', (e) => {
      e.stopPropagation();
      const idx = Number((e.currentTarget as HTMLInputElement).dataset.index || '-1');
      if (idx < 0 || !multi.options[idx]) return;
      multi.options[idx].selected = (e.currentTarget as HTMLInputElement).checked;
      actualizarResumenPersonalServicio(container);
    });
  });
}

function bindPersonalMultiInteractionsServicio(container: HTMLElement) {
  const panel = container.querySelector('#personalAdministrativoPanelServicio') as HTMLElement | null;
  const toggle = container.querySelector('#personalAdministrativoToggleServicio') as HTMLButtonElement | null;
  const btnAll = container.querySelector('#personalAdministrativoSelectAllServicio') as HTMLButtonElement | null;
  const btnClear = container.querySelector('#personalAdministrativoClearAllServicio') as HTMLButtonElement | null;
  const multi = container.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement | null;

  if (!panel || !toggle || !multi) return;

  toggle.onclick = (e) => {
    e.preventDefault();
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };

  btnAll?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = true; });
    renderPersonalPickerOptionsServicio(container);
    actualizarResumenPersonalServicio(container);
  });

  btnClear?.addEventListener('click', (e) => {
    e.preventDefault();
    Array.from(multi.options).forEach((opt) => { opt.selected = false; });
    renderPersonalPickerOptionsServicio(container);
    actualizarResumenPersonalServicio(container);
  });

  document.addEventListener('click', (ev) => {
    if (!panel.contains(ev.target as Node) && !toggle.contains(ev.target as Node)) {
      panel.style.display = 'none';
    }
  });
}

function normalizeAreaIds(input: any): number[] {
  if (input === null || input === undefined || input === '') return [];

  if (Array.isArray(input)) {
    return input
      .flatMap((v: any) => {
        if (v === null || v === undefined || v === '') return [];
        if (typeof v === 'number') return [v];
        if (typeof v === 'string') {
          const n = Number(v.trim());
          return Number.isFinite(n) ? [n] : [];
        }
        if (typeof v === 'object') {
          const candidates = [
            v.id,
            v.id_area,
            v.id_cliente_planta_area,
            v.value,
          ];
          return candidates
            .map((x) => Number(x))
            .filter((n) => Number.isFinite(n));
        }
        return [];
      })
      .filter((v) => Number.isFinite(v) && v > 0);
  }

  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? [input] : [];
  }

  if (typeof input === 'object') {
    const candidates = [
      (input as any).id,
      (input as any).id_area,
      (input as any).id_cliente_planta_area,
      (input as any).value,
    ];
    return candidates
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0);
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

function normalizePersonalIds(input: any): number[] {
  if (input === null || input === undefined || input === '') return [];

  if (Array.isArray(input)) {
    return input
      .map((v: any) => Number(v?.id ?? v))
      .filter((n: number) => Number.isFinite(n) && n > 0);
  }

  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? [input] : [];
  }

  if (typeof input === 'object') {
    const n = Number((input as any).id ?? (input as any).value);
    return Number.isFinite(n) && n > 0 ? [n] : [];
  }

  if (typeof input === 'string') {
    const raw = input.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return normalizePersonalIds(parsed);
    } catch {
      // continuar con parsing simple
    }

    if (raw.includes(',')) {
      return raw
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);
    }

    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? [n] : [];
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

function getPlantaLatitud(idPlanta: number | null): number | null {
  if (!idPlanta) return null;
  const planta = plantasClienteDataProg.find((p: any) => p.id == idPlanta);
  if (!planta || planta.latitud === undefined || planta.latitud === null || planta.latitud === '') return null;
  const valor = Number(planta.latitud);
  return Number.isFinite(valor) ? valor : null;
}

function getPlantaLongitud(idPlanta: number | null): number | null {
  if (!idPlanta) return null;
  const planta = plantasClienteDataProg.find((p: any) => p.id == idPlanta);
  if (!planta || planta.longitud === undefined || planta.longitud === null || planta.longitud === '') return null;
  const valor = Number(planta.longitud);
  return Number.isFinite(valor) ? valor : null;
}

// ═══════════ Render principal ═══════════

export function renderProgramacionServicio(): string {
  const titulo = 'Programación de Servicios';
  const mostrarBtnNuevaServicio = true;
  const mostrarBtnCapAse = false;

  return `
    <div class="prog-page-header">
      <div class="prog-breadcrumb">${titulo}</div>
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
        ${mostrarBtnCapAse ? `<button class="prog-btn-secondary" id="btnProgramarCapacitacion" title="Programar Capacitación">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          Programar Capacitación
        </button>` : ''}
        ${mostrarBtnCapAse ? `<button class="prog-btn-secondary" id="btnProgramarAsesoria" title="Programar Asesoría">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Programar Asesoría
        </button>` : ''}
        ${mostrarBtnNuevaServicio ? `<button class="prog-btn-primary" id="btnNuevaProgramacion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Programación
        </button>` : ''}
      </div>
    </div>

    <div id="progResumenPendientesWrap">${renderResumenPendientesRecursos()}</div>

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
    <!-- Modal SELECTOR Tipo de Programación -->
    <div class="prog-modal" id="modalSelectorTipoProgramacion" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content" style="width:320px;max-width:90%;">
        <div class="prog-modal-header">
          <h2>Tipo de Programación</h2>
          <button class="prog-modal-close" id="closeSelectorTipo">&times;</button>
        </div>
        <div class="prog-modal-body" style="padding:24px;text-align:center;display:flex;flex-direction:column;gap:16px;">
          <button id="btnSelectorServicio" class="prog-btn-primary" style="width:100%;padding:16px;font-size:15px;font-weight:500;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;display:inline;"><path d="M6 9l6 4 6-4M9 13h6M9 17h6M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z"></path></svg>
            Programación de Servicio
          </button>
          <button id="btnSelectorVisita" class="prog-btn-secondary" style="width:100%;padding:16px;font-size:15px;font-weight:500;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;display:inline;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M16 11a4 4 0 11-8 0 4 4 0 018 0zM23 20.5v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path></svg>
            Programación por Visita
          </button>
          <button id="btnSelectorFabricacion" class="prog-btn-secondary" style="width:100%;padding:16px;font-size:15px;font-weight:500;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;display:inline;"><path d="M14.7 6.3l3 3-8.49 8.49-3.53.5.5-3.53L14.7 6.3z"></path><path d="M16 3l5 5"></path><path d="M3 21h18"></path></svg>
            Programación por Fabricación
          </button>
          <button id="btnSelectorOtros" class="prog-btn-secondary" style="width:100%;padding:16px;font-size:15px;font-weight:500;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;display:inline;"><path d="M12 5v14"></path><path d="M5 12h14"></path><circle cx="12" cy="12" r="9"></circle></svg>
            Programación de Otros
          </button>
        </div>
      </div>
    </div>
    <!-- Modal Programación por VISITA -->
    <div class="prog-modal" id="modalNuevaProgramacionVisita" style="display:none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2 id="tituloModalNuevaVisita">Nueva Programación por Visita</h2>
          <button class="prog-modal-close" id="closeModalNuevaVisita">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalNuevaVisitaBody"></div>
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

export async function initProgramacionServicioEvents(): Promise<void> {
  await cargarDatosIniciales();

  renderSidebar();
  renderCalendario();
  bindToggleFiltrosProg();
  applyEstadoFiltrosProg();

  document.getElementById('btnNuevaProgramacion')?.addEventListener('click', abrirModalSelectorTipo);
  document.getElementById('btnSelectorServicio')?.addEventListener('click', () => {
    cerrarModal('modalSelectorTipoProgramacion');
    abrirModalNueva();
  });
  document.getElementById('btnSelectorVisita')?.addEventListener('click', () => {
    cerrarModal('modalSelectorTipoProgramacion');
    abrirModalNuevaVisita();
  });
  document.getElementById('btnSelectorFabricacion')?.addEventListener('click', () => {
    cerrarModal('modalSelectorTipoProgramacion');
    abrirModalNuevaFabricacion();
  });
  document.getElementById('btnSelectorOtros')?.addEventListener('click', () => {
    cerrarModal('modalSelectorTipoProgramacion');
    abrirModalNuevaOtros();
  });
  document.getElementById('closeSelectorTipo')?.addEventListener('click', () => cerrarModal('modalSelectorTipoProgramacion'));
  document.getElementById('viewSelector')?.addEventListener('change', (e) => {
    vistaActual = (e.target as HTMLSelectElement).value as VistaProgramacion;
    renderCalendario();
  });

  document.getElementById('btnExportarPDF')?.addEventListener('click', exportarPDF);

  document.getElementById('closeModalDetalle')?.addEventListener('click', () => cerrarModal('modalDetalleProgramacion'));
  document.getElementById('closeModalNueva')?.addEventListener('click', () => cerrarModal('modalNuevaProgramacion'));
  document.getElementById('closeModalNuevaVisita')?.addEventListener('click', () => cerrarModal('modalNuevaProgramacionVisita'));
  document.getElementById('closeModalSugerencia')?.addEventListener('click', () => cerrarModal('modalSugerencia'));
  document.querySelectorAll('.prog-modal-overlay').forEach(el => {
    el.addEventListener('click', () => {
      cerrarModal('modalSelectorTipoProgramacion');
      cerrarModal('modalDetalleProgramacion');
      cerrarModal('modalNuevaProgramacion');
      cerrarModal('modalNuevaProgramacionVisita');
      cerrarModal('modalSugerencia');
    });
  });

}

async function cargarDatosIniciales() {
  try {
    const [tecRes, vehRes, perRes] = await Promise.all([
      programacionService.getTecnicos(),
      programacionService.getVehiculos(),
      programacionService.getPersonal(),
    ]);

    const filtrosBase = {
      mes: fechaActual.getMonth() + 1,
      anio: fechaActual.getFullYear(),
    };

    const [resServicio, resVisita, resFabricacion, resOtros, resumenPendientesRes] = await Promise.all([
      programacionService.getAll(filtrosBase),
      programacionService.getAllProgramacionVisita(filtrosBase),
      programacionService.getAllProgramacionFabricacion(filtrosBase),
      programacionService.getAllProgramacionOtros(filtrosBase),
      programacionService.getResumenPendientesRecursos(),
    ]);

    const programacionesServicio = resServicio.data || [];
    const programacionesVisita = resVisita.data || [];
    const programacionesFabricacion = resFabricacion.data || [];
    const programacionesOtros = resOtros.data || [];

    const servicioMapeado = (programacionesServicio as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'servicio',
    })) as ProgramacionExtendida[];

    const visitaMapeado = (programacionesVisita as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'visita',
    })) as ProgramacionExtendida[];

    const fabricacionMapeado = (programacionesFabricacion as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'fabricacion',
    })) as ProgramacionExtendida[];

    const otrosMapeado = (programacionesOtros as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'otros',
    })) as ProgramacionExtendida[];

    programacionesData = [...servicioMapeado, ...visitaMapeado, ...fabricacionMapeado, ...otrosMapeado] as Programacion[];
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

    const estRes = await programacionService.getEstadisticas(fechaActual.getMonth() + 1, fechaActual.getFullYear());
    if (estRes.data) estadisticas = estRes.data;
    if (resumenPendientesRes?.data) resumenPendientesRecursos = resumenPendientesRes.data;

    await cargarGruposProgramacion(filtrosBase);
  } catch (err) {
    console.error('Error cargando datos programaciones:', err);
  }
}

async function recargarProgramaciones() {
  try {
    const filtrosBase = {
      mes: fechaActual.getMonth() + 1,
      anio: fechaActual.getFullYear(),
    };

    const [resServicio, resVisita, resFabricacion, resOtros, resumenPendientesRes] = await Promise.all([
      programacionService.getAll(filtrosBase),
      programacionService.getAllProgramacionVisita(filtrosBase),
      programacionService.getAllProgramacionFabricacion(filtrosBase),
      programacionService.getAllProgramacionOtros(filtrosBase),
      programacionService.getResumenPendientesRecursos(),
    ]);

    const programacionesServicio = resServicio.data || [];
    const programacionesVisita = resVisita.data || [];
    const programacionesFabricacion = resFabricacion.data || [];
    const programacionesOtros = resOtros.data || [];

    const servicioMapeado = (programacionesServicio as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'servicio',
    })) as ProgramacionExtendida[];

    const visitaMapeado = (programacionesVisita as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'visita',
    })) as ProgramacionExtendida[];

    const fabricacionMapeado = (programacionesFabricacion as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'fabricacion',
    })) as ProgramacionExtendida[];

    const otrosMapeado = (programacionesOtros as any[]).map(p => ({
      ...p,
      fecha_programada: normalizarFecha(p.fecha_programada),
      hora_inicio: normalizarHora(p.hora_inicio),
      hora_fin: p.hora_fin ? normalizarHora(p.hora_fin) : p.hora_fin,
      tipo_programacion: 'otros',
    })) as ProgramacionExtendida[];

    programacionesData = [...servicioMapeado, ...visitaMapeado, ...fabricacionMapeado, ...otrosMapeado] as Programacion[];
    depurarGruposProgramacion();

    const estRes = await programacionService.getEstadisticas(fechaActual.getMonth() + 1, fechaActual.getFullYear());
    if (estRes.data) estadisticas = estRes.data;
    if (resumenPendientesRes?.data) resumenPendientesRecursos = resumenPendientesRes.data;

    await cargarGruposProgramacion(filtrosBase);
  } catch (err) {
    console.error('Error recargando programaciones:', err);
  }
  actualizarResumenPendientesUI();
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
        || px.orden_asesoria?.cliente?.id === filtroCliente
        || px.cliente?.id === filtroCliente;
    });
  }

  const toMinutes = (hora: string | null | undefined): number => {
    if (!hora) return 0;
    const hhmm = String(hora).slice(0, 5);
    const [h, m] = hhmm.split(':').map(Number);
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  };

  return [...lista].sort((a, b) => {
    const fechaA = String(a.fecha_programada || '');
    const fechaB = String(b.fecha_programada || '');
    if (fechaA !== fechaB) return fechaA.localeCompare(fechaB);

    return toMinutes(a.hora_inicio) - toMinutes(b.hora_inicio);
  });
}

function nombreActividad(p: Programacion): string {
  const px = p as ProgramacionExtendida;
  if (px.tipo_programacion === 'capacitacion') {
    return px.orden_capacitacion?.servicio?.nombre || p.servicio?.nombre || 'Capacitación';
  }
  if (px.tipo_programacion === 'asesoria') {
    return px.orden_asesoria?.servicio?.nombre || p.servicio?.nombre || 'Asesoría';
  }
  if (px.tipo_programacion === 'visita') {
    return px.tipo_visita || 'Visita';
  }
  if (px.tipo_programacion === 'fabricacion') {
    return 'Fabricación';
  }
  if (px.tipo_programacion === 'otros') {
    return px.motivo || 'Otros';
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
  if (tipo === 'visita') {
    return '<span style="background:#ecfccb;color:#3f6212;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Visita</span>';
  }
  if (tipo === 'fabricacion') {
    return '<span style="background:#e0e7ff;color:#3730a3;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Fabricación</span>';
  }
  if (tipo === 'otros') {
    return '<span style="background:#f3e8ff;color:#6b21a8;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Otros</span>';
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

function badgePendienteRecursos(p: Programacion): string {
  if (!(p as any).requiere_asignacion_recursos) {
    return '';
  }

  return '<span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px;">Pendiente recursos</span>';
}

function estiloTarjetaPendienteMensual(p: Programacion): string {
  if (!(p as any).requiere_asignacion_recursos) {
    return '';
  }

  return 'style="background:linear-gradient(135deg,#93c5fd,#60a5fa);box-shadow:0 2px 6px rgba(59,130,246,0.2);"';
}

function estiloTarjetaPendienteSemanal(p: Programacion): string {
  if (!(p as any).requiere_asignacion_recursos) {
    return '';
  }

  return 'style="border-left-color:#60a5fa;background:#dbeafe;"';
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

async function cargarGruposProgramacion(filtros: Record<string, any>) {
  try {
    const res = await programacionService.getGrupos(filtros);
    const raw = res.data || res;
    const grupos = Array.isArray(raw) ? raw : (raw as any).data || [];

    gruposProgramacionManual = grupos
      .map((g: any) => ({
        id: String(g?.id || ''),
        ids: Array.isArray(g?.programaciones) ? g.programaciones.map((p: any) => Number(p?.id)).filter((n: number) => Number.isFinite(n) && n > 0) : [],
        createdAt: Date.now(),
      }))
      .filter((g: GrupoProgramacionManual) => g.id && g.ids.length >= 2);
  } catch {
    gruposProgramacionManual = [];
  }

  const idsSeleccionDepurada = Array.from(idsSeleccionAgrupacion).filter((id) => programacionesData.some((p) => p.id === id));
  idsSeleccionAgrupacion = new Set(idsSeleccionDepurada);
}

function limpiarSeleccionAgrupacion() {
  idsSeleccionAgrupacion = new Set<number>();
}

function obtenerProgramacionPorId(id: number): Programacion | null {
  const found = programacionesData.find((p) => p.id === id);
  return found || null;
}

function obtenerClienteIdProgramacion(p: Programacion): number | null {
  const px = p as ProgramacionExtendida;
  const id = Number(
    p.orden_servicio?.cliente?.id
    || px.orden_capacitacion?.cliente?.id
    || px.orden_asesoria?.cliente?.id
    || px.cliente?.id
    || 0,
  );
  return id > 0 ? id : null;
}

function obtenerPlantaIdProgramacion(p: Programacion): number | null {
  const id = Number(p.id_cliente_planta || p.planta?.id || 0);
  return id > 0 ? id : null;
}

function obtenerTecnicosIdsProgramacion(p: Programacion): number[] {
  const ids = (p.tecnicos && p.tecnicos.length > 0)
    ? p.tecnicos.map((t: any) => Number(t.id))
    : [Number(p.id_tecnico_asignado || p.tecnico?.id || 0)];

  return Array.from(new Set(ids.filter((n) => Number.isFinite(n) && n > 0))).sort((a, b) => a - b);
}

function firmaTecnicosProgramacion(p: Programacion): string {
  return obtenerTecnicosIdsProgramacion(p).join('-');
}

function parseHoraToMin(hora: string | null | undefined): number {
  if (!hora) return 0;
  const hhmm = normalizarHora(String(hora));
  const [h, m] = hhmm.split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function esProgramacionAgrupable(p: Programacion): boolean {
  const tipo = ((p as ProgramacionExtendida).tipo_programacion || 'servicio').toLowerCase();
  if (tipo !== 'servicio') return false;
  if (p.estado_ejecucion === 'Cancelado' || p.estado_ejecucion === 'Realizado') return false;
  return true;
}

function encontrarGrupoPorProgramacion(idProgramacion: number): GrupoProgramacionManual | null {
  return gruposProgramacionManual.find((g) => g.ids.includes(idProgramacion)) || null;
}

function depurarGruposProgramacion() {
  const idsVigentes = new Set(programacionesData.map((p) => p.id));

  gruposProgramacionManual = gruposProgramacionManual
    .map((g) => ({
      ...g,
      ids: g.ids.filter((id) => idsVigentes.has(id)),
    }))
    .filter((g) => g.ids.length >= 2)
    .filter((g) => {
      const programas = g.ids
        .map((id) => obtenerProgramacionPorId(id))
        .filter((p): p is Programacion => !!p);
      if (programas.length < 2) return false;
      const fechas = new Set(programas.map((p) => normalizarFecha(p.fecha_programada || '')));
      return fechas.size === 1;
    });

  const seleccionDepurada = Array.from(idsSeleccionAgrupacion).filter((id) => idsVigentes.has(id));
  idsSeleccionAgrupacion = new Set(seleccionDepurada);
}

function obtenerLabelTecnicos(p: Programacion): string {
  if (p.tecnicos && p.tecnicos.length > 0) {
    return p.tecnicos.map((t: any) => `${t.nombre} ${t.apellidos || ''}`.trim()).join(', ');
  }
  if (p.tecnico) {
    return `${p.tecnico.nombre} ${p.tecnico.apellidos || ''}`.trim();
  }
  return 'Sin asignar';
}

function construirItemCalendarioSingle(p: Programacion): ItemCalendario {
  return {
    kind: 'single',
    ids: [p.id],
    programaciones: [p],
    principal: p,
    fecha: normalizarFecha(p.fecha_programada || ''),
    horaInicio: normalizarHora(p.hora_inicio || ''),
    horaFin: normalizarHora(p.hora_fin || ''),
    clienteLabel: clienteNombre(p),
    plantaLabel: p.planta?.nombre || p.local_sede || '—',
    tecnicosLabel: obtenerLabelTecnicos(p),
    actividadesLabel: nombreActividad(p),
    estadoLabel: p.estado_ejecucion,
  };
}

function construirItemCalendarioGrupo(group: GrupoProgramacionManual, programaciones: Programacion[]): ItemCalendario {
  const ordenadas = [...programaciones].sort((a, b) => parseHoraToMin(a.hora_inicio) - parseHoraToMin(b.hora_inicio));
  const principal = ordenadas[0];
  const finMayor = ordenadas.reduce((max, p) => Math.max(max, parseHoraToMin(p.hora_fin || p.hora_inicio || '00:00')), 0);
  const hhFin = `${String(Math.floor(finMayor / 60)).padStart(2, '0')}:${String(finMayor % 60).padStart(2, '0')}`;

  const nombresServicios = Array.from(new Set(ordenadas.map((p) => nombreActividad(p)).filter(Boolean))).join(' + ');

  return {
    kind: 'group',
    ids: ordenadas.map((p) => p.id),
    groupId: group.id,
    programaciones: ordenadas,
    principal,
    fecha: normalizarFecha(principal.fecha_programada || ''),
    horaInicio: normalizarHora(principal.hora_inicio || ''),
    horaFin: hhFin,
    clienteLabel: clienteNombre(principal),
    plantaLabel: principal.planta?.nombre || principal.local_sede || '—',
    tecnicosLabel: obtenerLabelTecnicos(principal),
    actividadesLabel: nombresServicios || 'Servicios agrupados',
    estadoLabel: ordenadas.some((p) => p.estado_ejecucion === 'En Ejecución')
      ? 'En Ejecución'
      : ordenadas.some((p) => p.estado_ejecucion === 'En Camino')
      ? 'En Camino'
      : principal.estado_ejecucion,
  };
}

function obtenerItemsCalendarioPorFecha(fechaIso: string, programacionesDelDia: Programacion[]): ItemCalendario[] {
  const usados = new Set<number>();
  const items: ItemCalendario[] = [];
  const porId = new Map(programacionesDelDia.map((p) => [p.id, p]));

  gruposProgramacionManual.forEach((g) => {
    const programacionesGrupo = g.ids
      .map((id) => porId.get(id))
      .filter((p): p is Programacion => !!p)
      .filter((p) => normalizarFecha(p.fecha_programada || '') === fechaIso);

    if (programacionesGrupo.length < 2) return;

    programacionesGrupo.forEach((p) => usados.add(p.id));
    items.push(construirItemCalendarioGrupo(g, programacionesGrupo));
  });

  programacionesDelDia.forEach((p) => {
    if (usados.has(p.id)) return;
    items.push(construirItemCalendarioSingle(p));
  });

  return items.sort((a, b) => parseHoraToMin(a.horaInicio) - parseHoraToMin(b.horaInicio));
}

function renderControlesAgrupacionCalendario(): string {
  const seleccionCount = idsSeleccionAgrupacion.size;
  const btnSeleccionLabel = modoSeleccionAgrupacion ? 'Salir de selección' : 'Seleccionar servicios para agrupar';

  return `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <button class="prog-btn-secondary" id="btnToggleSeleccionAgrupacion">${btnSeleccionLabel}</button>
      ${modoSeleccionAgrupacion ? `
        <span style="font-size:12px;color:#475569;">Seleccionados: <strong>${seleccionCount}</strong></span>
        <button class="prog-btn-primary" id="btnConfirmarAgrupacion" ${seleccionCount >= 2 ? '' : 'disabled'}>Agrupar</button>
        <button class="prog-btn-secondary" id="btnCancelarSeleccionAgrupacion">Limpiar</button>
      ` : ''}
    </div>
  `;
}

function renderSelectorAgrupacionProgramacion(p: Programacion): string {
  if (!modoSeleccionAgrupacion) return '';
  if (!esProgramacionAgrupable(p)) return '';

  const checked = idsSeleccionAgrupacion.has(p.id) ? 'checked' : '';
  return `
    <input type="checkbox" class="prog-agrupacion-check" data-prog-id="${p.id}" ${checked} style="cursor:pointer;">
  `;
}

function renderAccionDesagrupar(item: ItemCalendario): string {
  if (item.kind !== 'group' || !item.groupId) return '';
  return `<button type="button" class="prog-btn-desagrupar" data-group-id="${item.groupId}" style="font-size:11px;padding:2px 8px;border:1px solid #fecaca;background:#fff1f2;color:#b91c1c;border-radius:999px;cursor:pointer;">Desagrupar</button>`;
}

function validarSeleccionAgrupacion(programacionesSel: Programacion[]): { ok: boolean; mensaje?: string } {
  if (programacionesSel.length < 2) {
    return { ok: false, mensaje: 'Seleccione al menos 2 servicios para agrupar' };
  }

  const noAgrupables = programacionesSel.filter((p) => !esProgramacionAgrupable(p));
  if (noAgrupables.length > 0) {
    return { ok: false, mensaje: 'Solo se pueden agrupar programaciones de tipo servicio en estado activo' };
  }

  const yaAgrupadas = programacionesSel.filter((p) => !!encontrarGrupoPorProgramacion(p.id));
  if (yaAgrupadas.length > 0) {
    return { ok: false, mensaje: 'Hay servicios seleccionados que ya están dentro de un grupo. Desagrúpelos primero.' };
  }

  const fechas = new Set(programacionesSel.map((p) => normalizarFecha(p.fecha_programada || '')));
  if (fechas.size !== 1) {
    return { ok: false, mensaje: 'Solo puede agrupar servicios de la misma fecha' };
  }

  const clientes = new Set(programacionesSel.map((p) => obtenerClienteIdProgramacion(p) || 0));
  if (clientes.size !== 1 || clientes.has(0)) {
    return { ok: false, mensaje: 'Para agrupar, todos deben tener el mismo cliente' };
  }

  const plantas = new Set(programacionesSel.map((p) => obtenerPlantaIdProgramacion(p) || 0));
  if (plantas.size !== 1 || plantas.has(0)) {
    return { ok: false, mensaje: 'Para agrupar, todos deben tener la misma planta' };
  }

  const firmasTecnicos = new Set(programacionesSel.map((p) => firmaTecnicosProgramacion(p)));
  if (firmasTecnicos.size !== 1 || firmasTecnicos.has('')) {
    return { ok: false, mensaje: 'Para agrupar, todos deben coincidir en técnicos' };
  }

  const ordenadas = [...programacionesSel].sort((a, b) => parseHoraToMin(a.hora_inicio) - parseHoraToMin(b.hora_inicio));
  for (let i = 1; i < ordenadas.length; i++) {
    const prev = ordenadas[i - 1];
    const cur = ordenadas[i];
    const prevFin = parseHoraToMin(prev.hora_fin || prev.hora_inicio || '00:00');
    const curIni = parseHoraToMin(cur.hora_inicio || '00:00');
    if (curIni - prevFin > GAP_MAX_MINUTOS_AGRUPACION) {
      return { ok: false, mensaje: 'Los servicios deben ser consecutivos por hora para poder agruparse' };
    }
  }

  return { ok: true };
}

async function confirmarAgrupacionSeleccionada() {
  const programacionesSel = Array.from(idsSeleccionAgrupacion)
    .map((id) => obtenerProgramacionPorId(id))
    .filter((p): p is Programacion => !!p);

  const validacion = validarSeleccionAgrupacion(programacionesSel);
  if (!validacion.ok) {
    mostrarToast('warning', 'No se puede agrupar', validacion.mensaje || 'Validación no superada');
    return;
  }

  const ordenadas = [...programacionesSel].sort((a, b) => parseHoraToMin(a.hora_inicio) - parseHoraToMin(b.hora_inicio));
  try {
    await programacionService.crearGrupo({
      ids_programacion: ordenadas.map((p) => p.id),
    });
    modoSeleccionAgrupacion = false;
    limpiarSeleccionAgrupacion();
    await recargarProgramaciones();

    const inicio = fmtH(ordenadas[0].hora_inicio || '');
    const finMayor = ordenadas.reduce((max, p) => Math.max(max, parseHoraToMin(p.hora_fin || p.hora_inicio || '00:00')), 0);
    const finTxt = `${String(Math.floor(finMayor / 60)).padStart(2, '0')}:${String(finMayor % 60).padStart(2, '0')}`;
    mostrarToast('success', 'Servicios agrupados', `Se creó un bloque de ${inicio} a ${finTxt}`);
  } catch (err: any) {
    const msg = err?.data?.message || err?.response?.data?.message || 'No se pudo agrupar los servicios';
    mostrarToast('error', 'Error', msg);
  }
}

async function desagruparServicios(groupId: string) {
  try {
    await programacionService.desagruparGrupo(Number(groupId));
    await recargarProgramaciones();
    mostrarToast('success', 'Grupo desagrupado', 'Los servicios volvieron a mostrarse por separado');
  } catch (err: any) {
    const msg = err?.data?.message || err?.response?.data?.message || 'No se pudo desagrupar';
    mostrarToast('error', 'Error', msg);
  }
}

function toggleSeleccionProgramacion(idProgramacion: number) {
  if (!modoSeleccionAgrupacion) return;
  if (idsSeleccionAgrupacion.has(idProgramacion)) {
    idsSeleccionAgrupacion.delete(idProgramacion);
  } else {
    idsSeleccionAgrupacion.add(idProgramacion);
  }
  renderCalendario();
}

function activarModoSeleccionAgrupacion() {
  modoSeleccionAgrupacion = true;
  limpiarSeleccionAgrupacion();
  renderCalendario();
}

function desactivarModoSeleccionAgrupacion() {
  modoSeleccionAgrupacion = false;
  limpiarSeleccionAgrupacion();
  renderCalendario();
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
    const items = obtenerItemsCalendarioPorFecha(dateStr, servicios);
    diasHTML += `
      <div class="prog-calendar-day ${isToday ? 'highlighted' : ''}">
        <span class="prog-day-number">${d}</span>
        ${items.slice(0, 3).map((item) => `
          <div class="prog-event ${getColorByState(item.estadoLabel)}" ${estiloTarjetaPendienteMensual(item.principal)} ${item.kind === 'single' ? `data-prog-id="${item.principal.id}" data-prog-tipo="${(item.principal as ProgramacionExtendida).tipo_programacion || 'servicio'}"` : `data-prog-group-id="${item.groupId || ''}"`}>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
              <div class="prog-event-title">${item.clienteLabel}</div>
              ${item.kind === 'single' ? renderSelectorAgrupacionProgramacion(item.principal) : renderAccionDesagrupar(item)}
            </div>
            <div class="prog-event-subtitle" style="font-size:11px;opacity:0.9;margin-top:2px;">${item.actividadesLabel}${item.kind === 'group' ? ` <span style="display:inline-block;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:700;">${item.ids.length} servicios</span>` : ` ${badgeTipoProgramacion(item.principal)} ${(item.principal as ProgramacionExtendida).tipo_programacion === 'asesoria' ? badgeModalidadVisita(item.principal) : badgeModalidadProgramacion(item.principal)} ${badgePendienteRecursos(item.principal)}`}</div>
            <div class="prog-event-time">${fmtH(item.horaInicio)}${item.horaFin ? ' - ' + fmtH(item.horaFin) : ''}</div>
          </div>
        `).join('')}
        ${items.length > 3 ? `<div class="prog-event-more">+${items.length - 3} más</div>` : ''}
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
      ${renderControlesAgrupacionCalendario()}
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
      ${renderControlesAgrupacionCalendario()}
    </div>
    <div class="prog-week-view">
      <div class="prog-week-timeline">
        <div class="prog-week-days">
          ${dias.map((d, i) => {
            const dateStr = fmtDate(d);
            const isToday = dateStr === todayS;
            const servicios = programaciones.filter(p => p.fecha_programada === dateStr);
            const items = obtenerItemsCalendarioPorFecha(dateStr, servicios);
            return `
            <div class="prog-week-day-column ${isToday ? 'today' : ''}">
              <div class="prog-week-day-header">${diasLabel[i]} ${d.getDate()}</div>
              <div class="prog-week-day-slots">
                ${items.map((item) => {
                  const color = getColorByState(item.estadoLabel);
                  return `
                  <div class="prog-week-card prog-week-card-${color}" ${estiloTarjetaPendienteSemanal(item.principal)} ${item.kind === 'single' ? `data-prog-id="${item.principal.id}" data-prog-tipo="${(item.principal as ProgramacionExtendida).tipo_programacion || 'servicio'}"` : `data-prog-group-id="${item.groupId || ''}"`}>
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                      <div class="prog-week-card-title">${item.clienteLabel}</div>
                      ${item.kind === 'single' ? renderSelectorAgrupacionProgramacion(item.principal) : renderAccionDesagrupar(item)}
                    </div>
                    <div class="prog-week-card-subtitle" style="font-size:11px;opacity:0.85;margin:2px 0;font-weight:500;">${item.actividadesLabel}${item.kind === 'group' ? ` <span style="display:inline-block;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:700;">${item.ids.length} servicios</span>` : ` ${badgeTipoProgramacion(item.principal)} ${(item.principal as ProgramacionExtendida).tipo_programacion === 'asesoria' ? badgeModalidadVisita(item.principal) : badgeModalidadProgramacion(item.principal)} ${badgePendienteRecursos(item.principal)}`}</div>
                    <div class="prog-week-card-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${fmtH(item.horaInicio)}${item.horaFin ? ' - ' + fmtH(item.horaFin) : ''}</div>
                    <div class="prog-week-card-tech"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${item.tecnicosLabel}</div>
                    <span class="prog-week-card-badge">${item.estadoLabel}</span>
                  </div>`;
                }).join('')}
                ${items.length === 0 ? '<div class="prog-week-empty">Sin programaciones</div>' : ''}
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
  const items = obtenerItemsCalendarioPorFecha(dateStr, programaciones);
  const fechaLabel = fechaActual.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div class="prog-calendar-header">
      <h2>${fechaLabel}</h2>
      <div class="prog-calendar-nav">
        <button class="prog-btn-icon" id="btnPrev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        <button class="prog-btn-secondary" id="btnHoy">Hoy</button>
        <button class="prog-btn-icon" id="btnNext"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
      </div>
      ${renderControlesAgrupacionCalendario()}
    </div>
    <div class="prog-day-view">
      <div class="prog-day-timeline">
        <div class="prog-day-services">
          ${items.length > 0 ? items.map((item) => `
            <div class="prog-day-service-card" ${item.kind === 'single' ? `data-prog-id="${item.principal.id}" data-prog-tipo="${(item.principal as ProgramacionExtendida).tipo_programacion || 'servicio'}"` : `data-prog-group-id="${item.groupId || ''}"`}>
              <div class="prog-day-service-time">
                <div class="prog-time-badge">${fmtH(item.horaInicio)}</div>
                <div class="prog-time-line"></div>
                <div class="prog-time-badge">${fmtH(item.horaFin || '')}</div>
              </div>
              <div class="prog-day-service-content">
                <div class="prog-day-service-header">
                  <h3>${item.clienteLabel}</h3>
                  <span class="prog-status-badge ${item.estadoLabel}">${item.estadoLabel}</span>
                </div>
                <div style="display:flex;justify-content:flex-end;margin:4px 0 6px;">${item.kind === 'single' ? renderSelectorAgrupacionProgramacion(item.principal) : renderAccionDesagrupar(item)}</div>
                <div class="prog-day-service-details">
                  <div><strong>Actividad:</strong> ${item.actividadesLabel}${item.kind === 'group' ? ` <span style="display:inline-block;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:700;">${item.ids.length} servicios</span>` : ` ${badgeTipoProgramacion(item.principal)} ${(item.principal as ProgramacionExtendida).tipo_programacion === 'asesoria' ? badgeModalidadVisita(item.principal) : badgeModalidadProgramacion(item.principal)} ${badgePendienteRecursos(item.principal)}`}</div>
                  <div><strong>Técnico:</strong> ${item.tecnicosLabel}</div>
                  <div><strong>Local:</strong> ${item.plantaLabel}</div>
                  ${item.principal.vehiculo ? `<div><strong>Vehículo:</strong> ${item.principal.vehiculo.placa} - ${item.principal.vehiculo.marca} ${item.principal.vehiculo.modelo}</div>` : ''}
                </div>
              </div>
            </div>
          `).join('') : '<div class="prog-no-services">No hay programaciones para este día</div>'}
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

  document.getElementById('btnToggleSeleccionAgrupacion')?.addEventListener('click', () => {
    if (modoSeleccionAgrupacion) {
      desactivarModoSeleccionAgrupacion();
      return;
    }
    activarModoSeleccionAgrupacion();
  });

  document.getElementById('btnCancelarSeleccionAgrupacion')?.addEventListener('click', () => {
    limpiarSeleccionAgrupacion();
    renderCalendario();
  });

  document.getElementById('btnConfirmarAgrupacion')?.addEventListener('click', () => {
    confirmarAgrupacionSeleccionada();
  });

  document.querySelectorAll('.prog-agrupacion-check').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    el.addEventListener('change', (e) => {
      e.stopPropagation();
      const id = Number((e.currentTarget as HTMLInputElement).dataset.progId || 0);
      if (!id) return;
      toggleSeleccionProgramacion(id);
    });
  });

  document.querySelectorAll('.prog-btn-desagrupar').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const groupId = String((e.currentTarget as HTMLElement).dataset.groupId || '');
      if (!groupId) return;
      desagruparServicios(groupId);
    });
  });

  document.querySelectorAll('[data-prog-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt((el as HTMLElement).dataset.progId || '0');
      const tipo = ((el as HTMLElement).dataset.progTipo || 'servicio') as 'servicio' | 'capacitacion' | 'asesoria' | 'visita' | 'fabricacion' | 'otros';
      if (modoSeleccionAgrupacion && id) {
        toggleSeleccionProgramacion(id);
        return;
      }
      if (id) abrirModalDetalle(id, tipo);
    });
  });

  document.querySelectorAll('[data-prog-group-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const groupId = String((el as HTMLElement).dataset.progGroupId || '');
      if (!groupId) return;
      abrirModalDetalleGrupo(groupId);
    });
  });
}

// ═══════════ Modal Detalle ═══════════

function abrirModalDetalleGrupo(groupId: string) {
  const modal = document.getElementById('modalDetalleProgramacion');
  const body = document.getElementById('modalDetalleBody');
  if (!modal || !body) return;

  const grupo = gruposProgramacionManual.find((g) => String(g.id) === String(groupId));
  if (!grupo || !Array.isArray(grupo.ids) || grupo.ids.length === 0) {
    mostrarToast('warning', 'Sin detalle', 'No se encontró el detalle del grupo seleccionado');
    return;
  }

  const items = grupo.ids
    .map((id) => programacionesData.find((p) => p.id === id))
    .filter((p): p is Programacion => !!p)
    .sort((a, b) => parseHoraToMin(a.hora_inicio) - parseHoraToMin(b.hora_inicio));

  if (items.length === 0) {
    mostrarToast('warning', 'Sin detalle', 'No se encontró el detalle del grupo seleccionado');
    return;
  }

  const principal = items[0];
  const horaInicio = fmtH(principal.hora_inicio || '');
  const finMayor = items.reduce((max, p) => Math.max(max, parseHoraToMin(p.hora_fin || p.hora_inicio || '00:00')), 0);
  const horaFin = `${String(Math.floor(finMayor / 60)).padStart(2, '0')}:${String(finMayor % 60).padStart(2, '0')}`;
  const clavesPersonal = items.map((p) => obtenerClavePersonalAdministrativo(p));
  const personalCoincide = new Set(clavesPersonal).size === 1;

  body.innerHTML = `
    <div class="prog-detalle-grid">
      <div class="prog-detalle-section prog-detalle-section-full">
        <h3 class="prog-detalle-section-title">Detalle de Servicios Agrupados</h3>
        <div class="prog-detalle-row"><div class="prog-detalle-label">Cliente:</div><div class="prog-detalle-value">${clienteNombre(principal)}</div></div>
        <div class="prog-detalle-row"><div class="prog-detalle-label">Planta:</div><div class="prog-detalle-value">${principal.planta ? principal.planta.nombre : (principal.local_sede || '—')}</div></div>
        <div class="prog-detalle-row"><div class="prog-detalle-label">Técnicos:</div><div class="prog-detalle-value">${obtenerLabelTecnicos(principal)}</div></div>
        ${personalCoincide ? `<div class="prog-detalle-row"><div class="prog-detalle-label">Personal administrativo:</div><div class="prog-detalle-value">${getPersonalAdministrativoLabel(principal)}</div></div>` : ''}
        <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${fmtFechaDetalle(principal.fecha_programada)}</div></div>
        <div class="prog-detalle-row"><div class="prog-detalle-label">Rango agrupado:</div><div class="prog-detalle-value">${horaInicio} - ${horaFin}</div></div>
      </div>
      <div class="prog-detalle-section prog-detalle-section-full">
        <h3 class="prog-detalle-section-title">Servicios incluidos (${items.length})</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Servicio</th>
              <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Horario</th>
              ${!personalCoincide ? '<th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Personal administrativo</th>' : ''}
              <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0;">Estado</th>
              <th style="padding:8px 10px;text-align:center;border:1px solid #e2e8f0;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((p) => `
              <tr>
                <td style="padding:8px 10px;border:1px solid #e2e8f0;">${nombreActividad(p)}</td>
                <td style="padding:8px 10px;border:1px solid #e2e8f0;">${fmtH(p.hora_inicio)} - ${fmtH(p.hora_fin || '')}</td>
                ${!personalCoincide ? `<td style="padding:8px 10px;border:1px solid #e2e8f0;">${getPersonalAdministrativoLabel(p)}</td>` : ''}
                <td style="padding:8px 10px;border:1px solid #e2e8f0;"><span class="prog-status-badge ${p.estado_ejecucion}">${p.estado_ejecucion}</span></td>
                <td style="padding:8px 10px;text-align:center;border:1px solid #e2e8f0;"><button type="button" class="prog-btn-secondary btn-ver-detalle-servicio-grupo" data-prog-id="${p.id}" style="font-size:12px;padding:4px 10px;">Ver detalle</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="prog-modal-footer"><button type="button" class="prog-btn-secondary" id="btnCerrarDetalleGrupo">Cerrar</button></div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  body.querySelector('#btnCerrarDetalleGrupo')?.addEventListener('click', () => cerrarModal('modalDetalleProgramacion'));
  body.querySelectorAll('.btn-ver-detalle-servicio-grupo').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      const id = Number((ev.currentTarget as HTMLElement).dataset.progId || 0);
      if (!id) return;
      abrirModalDetalle(id, 'servicio');
    });
  });
}

async function abrirModalDetalle(id: number, tipo: 'servicio' | 'capacitacion' | 'asesoria' | 'visita' | 'fabricacion' | 'otros' = 'servicio') {
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
      : tipo === 'fabricacion'
      ? await programacionService.getProgramacionFabricacionById(id)
      : tipo === 'otros'
      ? await programacionService.getProgramacionOtrosById(id)
      : tipo === 'visita'
      ? await programacionService.getProgramacionVisitaById(id)
      : await programacionService.getById(id);
    const p = res.data;
    if (!p) { body.innerHTML = '<p style="padding:24px;">No encontrado</p>'; return; }

    const clienteIdDetalle = Number(
      p?.orden_servicio?.cliente?.id
      || p?.orden_capacitacion?.cliente?.id
      || p?.ordenAsesoria?.cliente?.id
      || p?.orden_asesoria?.cliente?.id
      || (p as any)?.cliente?.id
      || (p as any)?.id_cliente
      || 0,
    );
    if (clienteIdDetalle > 0) {
      await cargarPlantasClienteProg(clienteIdDetalle);
    }

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
            <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${fmtFechaDetalle(p.fecha_programada)}</div></div>
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
          ${p.observaciones ? `<div class="prog-detalle-section"><h3 class="prog-detalle-section-title">Observaciones</h3><div class="prog-detalle-observaciones">${p.observaciones}</div></div>` : ''}
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
      const areaAsesoria = getAreasSeleccionadasLabel(p);
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
            <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${fmtFechaDetalle(p.fecha_programada)}</div></div>
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

    if (tipo === 'visita' || tipo === 'fabricacion' || tipo === 'otros') {
      const esFabricacion = (p as any).tipo_programacion === 'fabricacion' || tipo === 'fabricacion';
      const esOtros = (p as any).tipo_programacion === 'otros' || tipo === 'otros';
      const recetaFabricacion = Array.isArray((p as any).receta_fabricacion) ? (p as any).receta_fabricacion : [];
      body.innerHTML = `
        <div class="prog-detalle-grid">
          <div class="prog-detalle-section">
            <h3 class="prog-detalle-section-title">${esFabricacion ? 'Programación por Fabricación' : (esOtros ? 'Programación de Otros' : 'Programación de Visita')}</h3>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Tipo:</div><div class="prog-detalle-value"><span style="${esFabricacion ? 'background:#e0e7ff;color:#3730a3;' : (esOtros ? 'background:#f3e8ff;color:#6b21a8;' : 'background:#ecfccb;color:#3f6212;')}padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">${esFabricacion ? 'Fabricación' : (esOtros ? 'Otros' : 'Visita')}</span></div></div>
            ${esFabricacion ? `<div class="prog-detalle-row"><div class="prog-detalle-label">Orden:</div><div class="prog-detalle-value">${(p as any).orden_fabricacion?.codigo || ('#' + ((p as any).id_orden_fabricacion || '')) || '—'}</div></div>` : ''}
            ${esFabricacion
              ? `<div class="prog-detalle-row"><div class="prog-detalle-label">Motivo:</div><div class="prog-detalle-value">${(p as any).motivo_fabricacion || '—'}</div></div>`
              : (esOtros
                ? `<div class="prog-detalle-row"><div class="prog-detalle-label">Motivo:</div><div class="prog-detalle-value">${(p as any).motivo || '—'}</div></div>`
                : `<div class="prog-detalle-row"><div class="prog-detalle-label">Tipo de visita:</div><div class="prog-detalle-value">${(p as any).tipo_visita || '—'}</div></div>`) }
            <div class="prog-detalle-row"><div class="prog-detalle-label">Estado:</div><div class="prog-detalle-value"><span class="prog-status-badge ${p.estado_ejecucion}">${p.estado_ejecucion}</span></div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${fmtFechaDetalle(p.fecha_programada)}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Horario:</div><div class="prog-detalle-value">${fmtH(normalizarHora(p.hora_inicio))} - ${fmtH(normalizarHora(p.hora_fin || ''))}</div></div>
          </div>
          <div class="prog-detalle-section">
            <h3 class="prog-detalle-section-title">${esFabricacion ? 'Resumen de Fabricación' : (esOtros ? 'Ubicación' : 'Cliente y Ubicación')}</h3>
            ${esFabricacion ? `
              <div class="prog-detalle-row"><div class="prog-detalle-label">Productos:</div><div class="prog-detalle-value">${recetaFabricacion.map((item: any) => item?.descripcion).filter(Boolean).join(', ') || '—'}</div></div>
            ` : (esOtros ? `
              <div class="prog-detalle-row"><div class="prog-detalle-label">Ubicación manual:</div><div class="prog-detalle-value">${(p as any).ubicacion_manual || '—'}</div></div>
            ` : `
              <div class="prog-detalle-row"><div class="prog-detalle-label">Cliente:</div><div class="prog-detalle-value">${(p as any).cliente?.nombre_empresa || (p as any).cliente?.persona_contacto || '—'}</div></div>
              <div class="prog-detalle-row"><div class="prog-detalle-label">Planta:</div><div class="prog-detalle-value">${p.planta ? p.planta.nombre : (p.local_sede || '—')}</div></div>
              <div class="prog-detalle-row"><div class="prog-detalle-label">Área:</div><div class="prog-detalle-value">${getAreasSeleccionadasLabel(p)}</div></div>
              <div class="prog-detalle-row"><div class="prog-detalle-label">Dirección:</div><div class="prog-detalle-value">${p.planta ? (p.planta.direccion || '—') : (p.direccion_completa || '—')}</div></div>
            `)}
          </div>
          <div class="prog-detalle-section">
            <h3 class="prog-detalle-section-title">Recursos Asignados</h3>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Técnico principal:</div><div class="prog-detalle-value">${p.tecnico ? `${p.tecnico.nombre} ${p.tecnico.apellidos}` : '—'}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Personal Administrativo:</div><div class="prog-detalle-value">${getPersonalAdministrativoLabel(p)}</div></div>
            <div class="prog-detalle-row"><div class="prog-detalle-label">Vehículo:</div><div class="prog-detalle-value">${p.vehiculo ? `${p.vehiculo.placa} - ${p.vehiculo.marca} ${p.vehiculo.modelo}` : '—'}</div></div>
          </div>
          ${esFabricacion ? `
            <div class="prog-detalle-section prog-detalle-section-full">
              <h3 class="prog-detalle-section-title">Receta de Productos</h3>
              ${recetaFabricacion.length > 0 ? recetaFabricacion.map((prod: any) => `
                <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:10px;background:#f8fafc;">
                  <div style="font-weight:700;color:#1e293b;margin-bottom:8px;">${prod?.descripcion || 'Producto'}</div>
                  ${(Array.isArray(prod?.receta) && prod.receta.length > 0)
                    ? `<ul style="margin:0;padding-left:18px;color:#334155;font-size:13px;display:grid;gap:6px;">
                        ${prod.receta.map((r: any) => `<li><strong>${r?.insumo?.descripcion || 'Insumo'}</strong>: ${Number(r?.cantidad || 0)} ${r?.unidad || r?.insumo?.unidad || ''}</li>`).join('')}
                      </ul>`
                    : '<div style="font-size:12px;color:#64748b;">No tiene receta configurada.</div>'}
                </div>
              `).join('') : '<div style="font-size:12px;color:#64748b;">Sin receta asociada.</div>'}
            </div>
          ` : ''}
          ${p.observaciones ? `<div class="prog-detalle-section prog-detalle-section-full"><h3 class="prog-detalle-section-title">Observaciones</h3><div class="prog-detalle-observaciones">${p.observaciones}</div></div>` : ''}
          <div class="prog-modal-footer">
            <button type="button" class="prog-btn-danger" id="btnEliminarVisita">Eliminar</button>
            ${!['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-warning" id="btnCancelarVisita">Cancelar Programación</button>` : ''}
            ${!esFabricacion && !['Realizado', 'Cancelado'].includes(p.estado_ejecucion) ? `<button type="button" class="prog-btn-primary" id="btnEditarVisita">Editar</button>` : ''}
            <button type="button" class="prog-btn-secondary" id="btnCerrarDetalleVisita">Cerrar</button>
          </div>
        </div>`;

      body.querySelector('#btnCerrarDetalleVisita')?.addEventListener('click', () => cerrarModal('modalDetalleProgramacion'));
      body.querySelector('#btnEliminarVisita')?.addEventListener('click', () => eliminarVisita(p.id));
      body.querySelector('#btnCancelarVisita')?.addEventListener('click', () => cancelarVisita(p.id));
      body.querySelector('#btnEditarVisita')?.addEventListener('click', () => {
        if (esOtros) {
          abrirEdicionOtros({ ...(p as any), tipo_programacion: 'otros' } as Programacion);
          return;
        }
        abrirEdicion({ ...(p as any), tipo_programacion: 'visita' } as Programacion);
      });
      return;
    }

    body.innerHTML = `
      <div class="prog-detalle-grid" id="detalleView">
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Información del Servicio</h3>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Servicio:</div><div class="prog-detalle-value">${p.servicio?.nombre || '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">ODS:</div><div class="prog-detalle-value">${p.orden_servicio?.numero_orden || '—'}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Estado:</div><div class="prog-detalle-value"><span class="prog-status-badge ${p.estado_ejecucion}">${p.estado_ejecucion}</span></div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Fecha:</div><div class="prog-detalle-value">${fmtFechaDetalle(p.fecha_programada)}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Horario:</div><div class="prog-detalle-value">${fmtH(p.hora_inicio)} - ${fmtH(p.hora_fin || '')}</div></div>
        </div>
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Cliente y Ubicación</h3>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Cliente:</div><div class="prog-detalle-value">${clienteNombre(p)}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Planta:</div><div class="prog-detalle-value">${p.planta ? p.planta.nombre : (p.local_sede || '—')}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Área:</div><div class="prog-detalle-value">${getAreasSeleccionadasLabel(p)}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Dirección:</div><div class="prog-detalle-value">${p.planta ? (p.planta.direccion || '—') : (p.direccion_completa || '—')}</div></div>
        </div>
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Recursos Asignados</h3>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Técnico(s):</div><div class="prog-detalle-value">${
            p.tecnicos && p.tecnicos.length > 0
              ? p.tecnicos.map((t: any) => `<span style="display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;padding:2px 10px;border-radius:6px;margin:2px 4px 2px 0;font-size:13px;">${t.nombre} ${t.apellidos}${t.pivot?.rol === 'Principal' ? ' <span style="font-size:10px;background:#dcfce7;color:#16a34a;padding:0 5px;border-radius:3px;font-weight:600;">Principal</span>' : ''}</span>`).join('')
              : (p.tecnico ? p.tecnico.nombre + ' ' + p.tecnico.apellidos : '—')
          }</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Personal Administrativo:</div><div class="prog-detalle-value">${getPersonalAdministrativoLabel(p)}</div></div>
          <div class="prog-detalle-row"><div class="prog-detalle-label">Vehículo:</div><div class="prog-detalle-value">${p.vehiculo ? p.vehiculo.placa + ' - ' + p.vehiculo.marca + ' ' + p.vehiculo.modelo : '—'}</div></div>
        </div>
        <div class="prog-detalle-section">
          <h3 class="prog-detalle-section-title">Observaciones</h3>
          <div class="prog-detalle-observaciones">${(p.observaciones && String(p.observaciones).trim()) ? p.observaciones : 'Sin observaciones'}</div>
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

async function eliminarVisita(id: number) {
  const ok = await confirmarAccion({ titulo: 'Eliminar Visita', mensaje: '¿Está seguro de eliminar esta visita? Esta acción no se puede deshacer.', tipo: 'error', textoConfirmar: 'Eliminar' });
  if (!ok) return;
  try {
    const prog = programacionesData.find((x) => x.id === id) as ProgramacionExtendida | undefined;
    if (prog?.tipo_programacion === 'fabricacion') {
      await programacionService.deleteProgramacionFabricacion(id);
    } else if (prog?.tipo_programacion === 'otros') {
      await programacionService.deleteProgramacionOtros(id);
    } else {
      await programacionService.deleteProgramacionVisita(id);
    }
    cerrarModal('modalDetalleProgramacion');
    await recargarProgramaciones();
    mostrarToast('success', 'Eliminada', 'La visita fue eliminada correctamente');
  } catch (err) { mostrarToast('error', 'Error', 'No se pudo eliminar la visita'); console.error(err); }
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

async function cancelarVisita(id: number) {
  const ok = await confirmarAccion({ titulo: 'Cancelar Visita', mensaje: '¿Está seguro de cancelar esta visita?', tipo: 'warning', textoConfirmar: 'Sí, cancelar' });
  if (!ok) return;
  try {
    const prog = programacionesData.find((x) => x.id === id) as ProgramacionExtendida | undefined;
    if (prog?.tipo_programacion === 'fabricacion') {
      await programacionService.updateProgramacionFabricacion(id, { estado_ejecucion: 'Cancelado' });
    } else if (prog?.tipo_programacion === 'otros') {
      await programacionService.updateProgramacionOtros(id, { estado_ejecucion: 'Cancelado' });
    } else {
      await programacionService.updateProgramacionVisita(id, { estado_ejecucion: 'Cancelado' });
    }
    cerrarModal('modalDetalleProgramacion');
    await recargarProgramaciones();
    mostrarToast('success', 'Cancelada', 'La visita fue cancelada');
  } catch (err) { mostrarToast('error', 'Error', 'No se pudo cancelar la visita'); console.error(err); }
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
        id_supervisor: Array.isArray(sug.id_supervisor) ? sug.id_supervisor : (sug.id_supervisor ? [sug.id_supervisor] : null),
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
  const isVisita = px.tipo_programacion === 'visita' || !!(px as any).id_cliente;
  const isAsesoria = px.tipo_programacion === 'asesoria' || !!px.orden_asesoria || !!(px as any).ordenAsesoria;
  const isPendienteRecursos = !!(p as any).requiere_asignacion_recursos;
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
  const areaIdsEdicion = normalizeAreaIds(idAreaEdicion);
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
              : `<div class="prog-form-group"><label class="prog-form-label">Fecha</label><input type="date" class="prog-form-control" name="fecha_programada" value="${normalizarFecha(p.fecha_programada || '')}"></div>`}
            <div class="prog-form-group"><label class="prog-form-label">Hora Inicio</label><input type="time" class="prog-form-control" name="hora_inicio" value="${isPendienteRecursos ? '' : fmtH(p.hora_inicio)}"></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="${isPendienteRecursos ? '' : fmtH(p.hora_fin || '')}"></div>
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
                    const isAssigned = !isPendienteRecursos && (p.tecnicos?.some(pt => pt.id === t.id) || t.id === p.id_tecnico_asignado);
                    const isPrincipal = !isPendienteRecursos && t.id === p.id_tecnico_asignado;
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
            <label class="prog-form-label">Personal Administrativo <span style="font-weight:400;font-size:12px;color:#888;">(puedes seleccionar uno o varios)</span></label>
            <select class="prog-form-control" id="personalAdministrativoSelectServicio" name="id_supervisor" multiple style="display:none;"></select>
            <button type="button" id="personalAdministrativoToggleServicio" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
              <span>Seleccionar personal</span>
              <span style="font-size:12px;">▼</span>
            </button>
            <div id="personalAdministrativoSummaryServicio" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin personal seleccionado</div>
            <div id="personalAdministrativoPanelServicio" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                <button type="button" id="personalAdministrativoSelectAllServicio" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todos</button>
                <button type="button" id="personalAdministrativoClearAllServicio" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
              </div>
              <div id="personalAdministrativoOptionsServicio"></div>
            </div>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Vehículo</label>
            <select class="prog-form-control" name="id_vehiculo">
              <option value="">Sin vehículo</option>
              ${vehiculosData.map(v => `<option value="${v.id}" ${!isPendienteRecursos && v.id === p.id_vehiculo ? 'selected' : ''}>${v.placa} - ${v.marca} ${v.modelo}</option>`).join('')}
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
              <div class="prog-form-group">
                <label class="prog-form-label">Área</label>
                <select class="prog-form-control" name="id_cliente_planta_area" id="editAreaSelect" multiple style="display:none;">${getAreaOptionsProgMultiple(idPlantaEdicion || null, areaIdsEdicion)}</select>
                <button type="button" id="editAreaToggle" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
                  <span>Seleccionar áreas</span>
                  <span style="font-size:12px;">▼</span>
                </button>
                <div id="editAreaSummary" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin áreas seleccionadas</div>
                <div id="editAreaPanel" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
                  <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                    <button type="button" id="editAreaSelectAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todas</button>
                    <button type="button" id="editAreaClearAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
                  </div>
                  <div id="editAreaOptions"></div>
                </div>
                <small style="display:block;margin-top:6px;color:#64748b;font-size:11px;">Puede seleccionar una o más áreas</small>
              </div>
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

  body.querySelector('#btnVolverDetalle')?.addEventListener('click', () => abrirModalDetalle(p.id, isAsesoria ? 'asesoria' : (isVisita ? 'visita' : (px.tipo_programacion === 'capacitacion' ? 'capacitacion' : 'servicio'))));

  // Lógica de badge "Principal" para edición
  if (!isAsesoria) {
    setupPrincipalBadge(body.querySelector('#editTecnicosCheckboxes') as HTMLElement);
    const personalAdministrativoSelectEdit = body.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement;
    if (personalAdministrativoSelectEdit) {
      personalAdministrativoSelectEdit.innerHTML = personalData.map(pe => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('');
      const personalAsignado = isPendienteRecursos
        ? []
        : Array.isArray((p as any).personal_administrativo)
        ? (p as any).personal_administrativo.map((item: any) => Number(item.id)).filter((id: number) => id > 0)
        : normalizePersonalIds((p as any).id_supervisor);
      Array.from(personalAdministrativoSelectEdit.options).forEach((opt) => {
        opt.selected = personalAsignado.includes(Number(opt.value));
      });
    }
    renderPersonalPickerOptionsServicio(body);
    actualizarResumenPersonalServicio(body);
    bindPersonalMultiInteractionsServicio(body);
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
    renderAreaPickerOptionsEdicion(body);
    actualizarResumenAreasEdicion(body);
    bindAreaMultiInteractionsEdicion(body);

    body.querySelector('#editPlantaSelect')?.addEventListener('change', (e) => {
      const idPlanta = parseInt((e.target as HTMLSelectElement).value) || null;
      const areaSel = body.querySelector('#editAreaSelect') as HTMLSelectElement;
      if (areaSel) {
        areaSel.innerHTML = getAreaOptionsProgMultiple(idPlanta, []);
        renderAreaPickerOptionsEdicion(body);
        actualizarResumenAreasEdicion(body);
      }
    });
  }

  body.querySelector('#formEditarProg')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => {
      if (k !== 'tecnicos_ids' && k !== 'exponentes_ids' && k !== 'id_supervisor') data[k] = v || null;
    });

    // Derivar local_sede y direccion_completa de planta si se seleccionó
    const idPlantaSel = parseInt(fd.get('id_cliente_planta') as string) || idPlantaEdicion || null;
    const idAreaSel = normalizeAreaIds(fd.getAll('id_cliente_planta_area'));
    data.id_cliente_planta = idPlantaSel;
    data.id_cliente_planta_area = idAreaSel.length > 0 ? idAreaSel : null;
    data.local_sede = getPlantaNombre(idPlantaSel) || '';
    data.direccion_completa = getPlantaDireccion(idPlantaSel) || '';
    data.latitud = getPlantaLatitud(idPlantaSel);
    data.longitud = getPlantaLongitud(idPlantaSel);

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
      const { tecnicosIds, idTecnicoPrincipal } = getTecnicosSeleccionadosConPrincipal(
        body.querySelector('#editTecnicosCheckboxes') as HTMLElement | null,
      );
      if (!isVisita && tecnicosIds.length === 0) {
        mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico');
        return;
      }
      data.id_tecnico_asignado = idTecnicoPrincipal;
      data.tecnicos_ids = tecnicosIds.length > 0 ? tecnicosIds : null;
      const personalAdministrativoEdit = body.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement;
      data.id_supervisor = personalAdministrativoEdit && personalAdministrativoEdit.selectedOptions.length > 0
        ? Array.from(personalAdministrativoEdit.selectedOptions).map(o => parseInt(o.value))
        : null;
    }

    try {
      if (isAsesoria) {
        await programacionService.updateProgramacionAsesoria(p.id, data);
      } else if (isVisita) {
        await programacionService.updateProgramacionVisita(p.id, data);
      } else {
        await programacionService.update(p.id, data);
      }
      cerrarModal('modalDetalleProgramacion');
      await recargarProgramaciones();
      mostrarToast('success', 'Actualizada', 'La programación fue actualizada correctamente');
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const message = err?.data?.message || err?.response?.data?.message || 'No se pudieron guardar los cambios';
      const tieneConflicto = !!(err?.data?.conflicto || err?.response?.data?.conflicto);

      if (status === 422 || tieneConflicto) {
        mostrarToast('warning', 'Conflicto de Horarios', message);
      } else {
        mostrarToast('error', 'Error', message);
      }

      console.error(err);
    }
  });
}

// ═══════════ Modal Selector Tipo de Programación ═══════════

function abrirModalSelectorTipo() {
  const modal = document.getElementById('modalSelectorTipoProgramacion');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

async function abrirEdicionOtros(p: Programacion) {
  const body = document.getElementById('modalDetalleBody');
  if (!body) return;

  const px = p as ProgramacionExtendida;
  const tecnicosAsignados = Array.from(new Set<number>([
    Number(p.id_tecnico_asignado || 0),
    ...normalizeAreaIds((px as any).tecnicos_ids as any),
  ].filter((id) => id > 0)));

  body.innerHTML = `
    <form id="formEditarOtros" class="prog-form">
      <div class="prog-form-grid">
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Información</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Estado</label>
            <select class="prog-form-control" name="estado_ejecucion">
              ${(['Programado', 'Confirmado', 'En Camino', 'En Ejecución'] as string[]).map(e => `<option value="${e}" ${p.estado_ejecucion === e ? 'selected' : ''}>${e}</option>`).join('')}
            </select>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Motivo <span class="prog-required">*</span></label>
            <textarea class="prog-form-control" name="motivo" rows="2" required>${(px as any).motivo || ''}</textarea>
          </div>
          <div class="prog-form-row">
            <div class="prog-form-group"><label class="prog-form-label">Fecha</label><input type="date" class="prog-form-control" name="fecha_programada" value="${normalizarFecha(p.fecha_programada || '')}"></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Inicio</label><input type="time" class="prog-form-control" name="hora_inicio" value="${fmtH(p.hora_inicio)}"></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="${fmtH(p.hora_fin || '')}"></div>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Ubicación Manual <span class="prog-required">*</span></label>
            <input type="text" class="prog-form-control" name="ubicacion_manual" value="${(px as any).ubicacion_manual || ''}" required>
          </div>
        </div>

        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Recursos</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Técnicos Asignados <span style="font-weight:400;font-size:12px;color:#888;">(primero = principal)</span></label>
            <div class="prog-tecnicos-list" id="editTecnicosCheckboxes" style="max-height:180px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">
              ${tecnicosData.map(t => {
                const isAssigned = tecnicosAsignados.includes(Number(t.id));
                const isPrincipal = Number(t.id) === Number(p.id_tecnico_asignado || 0);
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
            <label class="prog-form-label">Personal Administrativo <span style="font-weight:400;font-size:12px;color:#888;">(puedes seleccionar uno o varios)</span></label>
            <select class="prog-form-control" id="personalAdministrativoSelectServicio" name="id_supervisor" multiple style="display:none;"></select>
            <button type="button" id="personalAdministrativoToggleServicio" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
              <span>Seleccionar personal</span>
              <span style="font-size:12px;">▼</span>
            </button>
            <div id="personalAdministrativoSummaryServicio" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin personal seleccionado</div>
            <div id="personalAdministrativoPanelServicio" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                <button type="button" id="personalAdministrativoSelectAllServicio" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todos</button>
                <button type="button" id="personalAdministrativoClearAllServicio" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
              </div>
              <div id="personalAdministrativoOptionsServicio"></div>
            </div>
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
          <h3 class="prog-form-section-title">Observaciones</h3>
          <div class="prog-form-group"><textarea class="prog-form-control" name="observaciones" rows="2">${p.observaciones || ''}</textarea></div>
        </div>
      </div>
      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnVolverDetalleOtros">Cancelar</button>
        <button type="submit" class="prog-btn-primary">Guardar Cambios</button>
      </div>
    </form>`;

  body.querySelector('#btnVolverDetalleOtros')?.addEventListener('click', () => abrirModalDetalle(p.id, 'otros'));

  setupPrincipalBadge(body.querySelector('#editTecnicosCheckboxes') as HTMLElement);
  const personalAdministrativoSelectEdit = body.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement;
  if (personalAdministrativoSelectEdit) {
    personalAdministrativoSelectEdit.innerHTML = personalData.map(pe => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('');
    const personalAsignado = Array.isArray((p as any).personal_administrativo)
      ? (p as any).personal_administrativo.map((item: any) => Number(item.id)).filter((id: number) => id > 0)
      : normalizePersonalIds((p as any).id_supervisor);
    Array.from(personalAdministrativoSelectEdit.options).forEach((opt) => {
      opt.selected = personalAsignado.includes(Number(opt.value));
    });
  }
  renderPersonalPickerOptionsServicio(body);
  actualizarResumenPersonalServicio(body);
  bindPersonalMultiInteractionsServicio(body);

  body.querySelector('#formEditarOtros')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const { tecnicosIds, idTecnicoPrincipal } = getTecnicosSeleccionadosConPrincipal(
      body.querySelector('#editTecnicosCheckboxes') as HTMLElement | null,
    );

    const personalAdministrativoEdit = body.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement;
    const data: Record<string, any> = {
      estado_ejecucion: fd.get('estado_ejecucion') || null,
      motivo: String(fd.get('motivo') || '').trim(),
      fecha_programada: fd.get('fecha_programada') || null,
      hora_inicio: fd.get('hora_inicio') || null,
      hora_fin: fd.get('hora_fin') || null,
      ubicacion_manual: String(fd.get('ubicacion_manual') || '').trim(),
      id_vehiculo: fd.get('id_vehiculo') || null,
      observaciones: fd.get('observaciones') || null,
      id_tecnico_asignado: idTecnicoPrincipal,
      tecnicos_ids: tecnicosIds.length > 0 ? tecnicosIds : null,
      id_supervisor: personalAdministrativoEdit && personalAdministrativoEdit.selectedOptions.length > 0
        ? Array.from(personalAdministrativoEdit.selectedOptions).map(o => parseInt(o.value)).filter((id) => id > 0)
        : null,
    };

    if (!data.motivo) {
      mostrarToast('warning', 'Campo requerido', 'Debe ingresar el motivo');
      return;
    }

    if (!data.ubicacion_manual) {
      mostrarToast('warning', 'Campo requerido', 'Debe ingresar la ubicación manual');
      return;
    }

    try {
      await programacionService.updateProgramacionOtros(p.id, data);
      cerrarModal('modalDetalleProgramacion');
      await recargarProgramaciones();
      mostrarToast('success', 'Actualizada', 'La programación de otros fue actualizada correctamente');
    } catch (err) {
      mostrarToast('error', 'Error', 'No se pudieron guardar los cambios');
      console.error(err);
    }
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
            <div style="margin-top:8px;padding:10px 12px;border:1px solid #bfdbfe;background:#eff6ff;border-radius:8px;display:grid;gap:8px;">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:#1e3a8a;font-size:13px;font-weight:600;">
                <input type="checkbox" id="checkAplicarRecursosMesActual" checked style="accent-color:#2563eb;">
                Aplicar recursos al mes de la fecha de inicio
              </label>
              <div style="font-size:12px;color:#334155;">La primera fecha siempre se crea con recursos. Las fechas siguientes quedarán pendientes y se completan al editar cada servicio.</div>
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
            <label class="prog-form-label">Personal Administrativo <span style="font-weight:400;font-size:12px;color:#888;">(puedes seleccionar uno o varios)</span></label>
            <select class="prog-form-control" id="personalAdministrativoSelectServicio" name="id_supervisor" multiple style="display:none;"></select>
            <button type="button" id="personalAdministrativoToggleServicio" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
              <span>Seleccionar personal</span>
              <span style="font-size:12px;">▼</span>
            </button>
            <div id="personalAdministrativoSummaryServicio" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin personal seleccionado</div>
            <div id="personalAdministrativoPanelServicio" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                <button type="button" id="personalAdministrativoSelectAllServicio" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todos</button>
                <button type="button" id="personalAdministrativoClearAllServicio" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
              </div>
              <div id="personalAdministrativoOptionsServicio"></div>
            </div>
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
  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement;

  // Lógica de badge "Principal" para técnicos
  setupPrincipalBadge(body.querySelector('#tecnicosCheckboxes') as HTMLElement);
  if (personalAdministrativoSelect) {
    personalAdministrativoSelect.innerHTML = personalData.map(pe => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('');
  }
  renderPersonalPickerOptionsServicio(body);
  actualizarResumenPersonalServicio(body);
  bindPersonalMultiInteractionsServicio(body);

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
    if ((prog as any).requiere_asignacion_recursos) continue;
    
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
  data.latitud = getPlantaLatitud(idPlantaSel);
  data.longitud = getPlantaLongitud(idPlantaSel);

  // Recoger técnicos seleccionados
  const { tecnicosIds, idTecnicoPrincipal } = getTecnicosSeleccionadosConPrincipal(
    body.querySelector('#tecnicosCheckboxes') as HTMLElement | null,
  );
  if (tecnicosIds.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }
  data.id_tecnico_asignado = idTecnicoPrincipal;
  data.tecnicos_ids = tecnicosIds;

  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement;
  data.id_supervisor = personalAdministrativoSelect && personalAdministrativoSelect.selectedOptions.length > 0
    ? Array.from(personalAdministrativoSelect.selectedOptions).map(o => parseInt(o.value))
    : null;

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
    mostrarErrorProgramacion(message);
    console.error('Error creando programación individual:', err?.data || err);
  }
}

// ═══════════ Modal Nueva Programación por Visita ═══════════

async function abrirModalNuevaVisita() {
  const modal = document.getElementById('modalNuevaProgramacionVisita');
  const body = document.getElementById('modalNuevaVisitaBody');
  const titulo = document.getElementById('tituloModalNuevaVisita');
  if (!modal || !body) return;

  if (titulo) titulo.textContent = 'Nueva Programación por Visita';

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando clientes...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    // Cargar clientes aceptados
    const res = await clienteService.getAll({ estado: 'Acepta' });
    clientesAceptados = extractList(res);
  } catch (err) { 
    console.error('Error cargando clientes:', err); 
    clientesAceptados = []; 
  }

  renderFormVisita(body);
}

async function abrirModalNuevaFabricacion() {
  const modal = document.getElementById('modalNuevaProgramacionVisita');
  const body = document.getElementById('modalNuevaVisitaBody');
  const titulo = document.getElementById('tituloModalNuevaVisita');
  if (!modal || !body) return;

  if (titulo) titulo.textContent = 'Nueva Programación por Fabricación';

  body.innerHTML = '<p style="padding:24px;color:#999;">Cargando ordenes de fabricacion disponibles...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    const res = await programacionService.getOrdenesFabricacionDisponibles();
    ordenesFabricacionDisponiblesData = extractList<any>(res);
  } catch (err) {
    console.error('Error cargando ordenes de fabricacion:', err);
    ordenesFabricacionDisponiblesData = [];
  }

  renderFormFabricacion(body);
}

async function abrirModalNuevaOtros() {
  const modal = document.getElementById('modalNuevaProgramacionVisita');
  const body = document.getElementById('modalNuevaVisitaBody');
  const titulo = document.getElementById('tituloModalNuevaVisita');
  if (!modal || !body) return;

  if (titulo) titulo.textContent = 'Nueva Programación de Otros';

  body.innerHTML = '<p style="padding:24px;color:#999;">Preparando formulario...</p>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  renderFormOtros(body);
}

function renderFormOtros(body: HTMLElement) {
  body.innerHTML = `
    <form id="formNuevaOtros" class="prog-form">
      <div class="prog-form-grid">
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Datos Generales</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Motivo <span class="prog-required">*</span></label>
            <textarea class="prog-form-control" name="motivo" rows="2" required placeholder="Describe el motivo de esta programación"></textarea>
          </div>
          <div class="prog-form-row">
            <div class="prog-form-group"><label class="prog-form-label">Fecha <span class="prog-required">*</span></label><input type="date" class="prog-form-control" name="fecha_programada" required></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Inicio <span class="prog-required">*</span></label><input type="time" class="prog-form-control" name="hora_inicio" value="08:00" required></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="12:00"></div>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Ubicación Manual <span class="prog-required">*</span></label>
            <input type="text" class="prog-form-control" name="ubicacion_manual" required placeholder="Ej. Almacén central, Oficina principal, etc.">
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Observaciones</label>
            <textarea class="prog-form-control" name="observaciones" rows="2"></textarea>
          </div>
        </div>

        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Asignación de Recursos</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Técnicos <span style="font-weight:400;font-size:12px;color:#888;">(opcional, el primero marcado será el principal)</span></label>
            <div class="prog-tecnicos-list" id="tecnicosCheckboxesVisita" style="max-height:180px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">
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
            <label class="prog-form-label">Personal Administrativo <span style="font-weight:400;font-size:12px;color:#888;">(puedes seleccionar uno o varios)</span></label>
            <select class="prog-form-control" id="personalAdministrativoSelectVisita" name="id_supervisor" multiple style="display:none;"></select>
            <button type="button" id="personalAdministrativoToggle" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
              <span>Seleccionar personal</span>
              <span style="font-size:12px;">▼</span>
            </button>
            <div id="personalAdministrativoSummary" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin personal seleccionado</div>
            <div id="personalAdministrativoPanel" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                <button type="button" id="personalAdministrativoSelectAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todos</button>
                <button type="button" id="personalAdministrativoClearAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
              </div>
              <div id="personalAdministrativoOptions"></div>
            </div>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Vehículo</label>
            <select class="prog-form-control" name="id_vehiculo">
              <option value="">Sin vehículo</option>
              ${vehiculosData.map(v => `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnCancelarOtros">Cancelar</button>
        <button type="submit" class="prog-btn-primary" id="btnSubmitOtros">Crear Programación</button>
      </div>
    </form>`;

  setupPrincipalBadge(body.querySelector('#tecnicosCheckboxesVisita') as HTMLElement);

  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement;
  if (personalAdministrativoSelect) {
    personalAdministrativoSelect.innerHTML = personalData.map(pe => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('');
  }
  renderPersonalPickerOptionsVisita(body);
  actualizarResumenPersonalVisita(body);
  bindPersonalMultiInteractionsVisita(body);

  body.querySelector('#btnCancelarOtros')?.addEventListener('click', () => cerrarModal('modalNuevaProgramacionVisita'));
  body.querySelector('#formNuevaOtros')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitOtrosIndividual(body);
  });
}

function renderFormFabricacion(body: HTMLElement) {
  body.innerHTML = `
    <form id="formNuevaFabricacion" class="prog-form">
      <div class="prog-form-grid">
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Datos de Fabricación</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Orden de Fabricación <span class="prog-required">*</span></label>
            <select class="prog-form-control" id="selectOrdenFabricacion" name="id_orden_fabricacion" required>
              <option value="">Seleccionar orden...</option>
              ${ordenesFabricacionDisponiblesData.map((of) => `<option value="${of.id}">${of.codigo} - ${of.motivo || 'Sin motivo'}</option>`).join('')}
            </select>
            <small style="display:block;margin-top:6px;color:#64748b;font-size:11px;">Solo se muestran ordenes confirmadas y aun no programadas.</small>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Motivo de la Orden</label>
            <input type="text" class="prog-form-control" id="ofMotivoReadonly" readonly placeholder="Se autocompleta al seleccionar la orden">
          </div>
          <div class="prog-form-row">
            <div class="prog-form-group"><label class="prog-form-label">Fecha <span class="prog-required">*</span></label><input type="date" class="prog-form-control" name="fecha_programada" required></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Inicio <span class="prog-required">*</span></label><input type="time" class="prog-form-control" name="hora_inicio" value="08:00" required></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="12:00"></div>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Observaciones</label>
            <textarea class="prog-form-control" name="observaciones" rows="2"></textarea>
          </div>
        </div>

        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Asignación de Recursos</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Técnicos <span style="font-weight:400;font-size:12px;color:#888;">(el primero marcado será el principal)</span></label>
            <div class="prog-tecnicos-list" id="tecnicosCheckboxesVisita" style="max-height:180px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">
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
            <label class="prog-form-label">Personal Administrativo <span style="font-weight:400;font-size:12px;color:#888;">(opcional)</span></label>
            <select class="prog-form-control" id="personalAdministrativoSelectVisita" name="id_supervisor" multiple style="display:none;"></select>
            <button type="button" id="personalAdministrativoToggle" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
              <span>Seleccionar personal</span>
              <span style="font-size:12px;">▼</span>
            </button>
            <div id="personalAdministrativoSummary" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin personal seleccionado</div>
            <div id="personalAdministrativoPanel" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                <button type="button" id="personalAdministrativoSelectAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todos</button>
                <button type="button" id="personalAdministrativoClearAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
              </div>
              <div id="personalAdministrativoOptions"></div>
            </div>
          </div>
        </div>

        <div class="prog-form-section prog-form-section-full">
          <h3 class="prog-form-section-title">Productos e Insumos de la Orden</h3>
          <div style="padding:10px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;font-size:12px;color:#3730a3;margin-bottom:10px;">
            Al seleccionar una orden, se cargan automaticamente los productos, cantidades a fabricar e insumos requeridos.
          </div>
          <div id="fabricacionOrdenResumen" style="display:grid;gap:12px;max-height:330px;overflow:auto;padding-right:4px;">
            <div style="font-size:13px;color:#64748b;">Seleccione una orden para visualizar su detalle.</div>
          </div>
        </div>
      </div>

      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnCancelarFabricacion">Cancelar</button>
        <button type="submit" class="prog-btn-primary" id="btnSubmitFabricacion">Crear Programación</button>
      </div>
    </form>
  `;

  setupPrincipalBadge(body.querySelector('#tecnicosCheckboxesVisita') as HTMLElement);

  if (ordenesFabricacionDisponiblesData.length === 0) {
    mostrarToast('warning', 'Sin ordenes disponibles', 'No hay ordenes de fabricacion confirmadas pendientes de programar');
  }

  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement;
  if (personalAdministrativoSelect) {
    personalAdministrativoSelect.innerHTML = personalData.map(pe => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('');
  }
  renderPersonalPickerOptionsVisita(body);
  actualizarResumenPersonalVisita(body);
  bindPersonalMultiInteractionsVisita(body);

  body.querySelector('#selectOrdenFabricacion')?.addEventListener('change', (e) => {
    const id = Number((e.target as HTMLSelectElement).value || 0);
    renderResumenOrdenFabricacion(body, id);
  });

  body.querySelector('#btnCancelarFabricacion')?.addEventListener('click', () => cerrarModal('modalNuevaProgramacionVisita'));
  body.querySelector('#formNuevaFabricacion')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitFabricacionIndividual(body);
  });
}

function renderResumenOrdenFabricacion(body: HTMLElement, idOrden: number) {
  const box = body.querySelector('#fabricacionOrdenResumen') as HTMLElement | null;
  const inputMotivo = body.querySelector('#ofMotivoReadonly') as HTMLInputElement | null;
  if (!box) return;

  const orden = ordenesFabricacionDisponiblesData.find((of) => Number(of.id) === Number(idOrden));
  if (!orden) {
    if (inputMotivo) inputMotivo.value = '';
    box.innerHTML = '<div style="font-size:13px;color:#64748b;">Seleccione una orden para visualizar su detalle.</div>';
    return;
  }

  if (inputMotivo) inputMotivo.value = orden.motivo || '';

  const detalles = Array.isArray(orden.detalles) ? orden.detalles : [];
  if (detalles.length === 0) {
    box.innerHTML = '<div style="font-size:13px;color:#64748b;">La orden no tiene detalles registrados.</div>';
    return;
  }

  box.innerHTML = detalles.map((det: any) => `
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#fff;">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
        <div style="font-size:14px;font-weight:700;color:#1e293b;">${det?.producto?.descripcion || 'Producto'}</div>
        <div style="font-size:12px;color:#1e3a8a;background:#dbeafe;padding:2px 8px;border-radius:999px;">Cantidad: ${Number(det?.cantidad || 0)}</div>
      </div>
      <div style="margin-top:8px;display:grid;gap:6px;">
        ${Array.isArray(det?.insumos_requeridos) && det.insumos_requeridos.length > 0
          ? det.insumos_requeridos.map((r: any) => `<div style="font-size:12px;color:#334155;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:7px;padding:6px 8px;"><strong>${r?.descripcion || 'Insumo'}</strong>: ${Number(r?.cantidad_requerida || 0)} ${r?.unidad || ''}</div>`).join('')
          : '<div style="font-size:12px;color:#64748b;">Sin insumos calculados</div>'}
      </div>
    </div>
  `).join('');
}

function renderFormVisita(body: HTMLElement) {
  body.innerHTML = `
    <form id="formNuevaVisita" class="prog-form">
      <div class="prog-form-grid">

        <!-- Cliente -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Cliente</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Cliente <span class="prog-required">*</span></label>
            <select class="prog-form-control" name="id_cliente" id="selectClienteVisita" required>
              <option value="">Seleccionar cliente...</option>
              ${clientesAceptados.map(c => `<option value="${c.id}">${c.nombre_empresa || c.persona_contacto}</option>`).join('')}
            </select>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Tipo de visita <span class="prog-required">*</span></label>
            <select class="prog-form-control" name="tipo_visita" id="selectTipoVisita" required>
              <option value="">Seleccionar tipo...</option>
              <option value="Visita Técnica">Visita Técnica</option>
              <option value="Inspección General">Inspección General</option>
              <option value="Retiro de Roedor">Retiro de Roedor</option>
              <option value="Inspección por Roedores">Inspección por Roedores</option>
              <option value="Inspección por Insectos Voladores">Inspección por Insectos Voladores</option>
              <option value="Inspección por Insectos Rastreros">Inspección por Insectos Rastreros</option>
              <option value="Inspección: Evaluación de Riesgos">Inspección: Evaluación de Riesgos</option>
            </select>
          </div>
          <div style="margin-top:-6px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#475569;">
            Aparte considerar programaciones de: Fabricación de láminas para trampas de luz, Armado de trampas de luz y Reparación de trampa de luz.
          </div>
        </div>

        <!-- Tipo de Visita -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Tipo de Programación</h3>
          <div style="margin-top:-6px;margin-bottom:10px;padding:8px 10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:12px;color:#1e3a8a;">
            Esta programación es única (no aplica modalidad de año completo).
          </div>
          <div class="prog-form-row">
            <div class="prog-form-group"><label class="prog-form-label">Fecha <span class="prog-required">*</span></label><input type="date" class="prog-form-control" name="fecha_programada" required></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Inicio <span class="prog-required">*</span></label><input type="time" class="prog-form-control" name="hora_inicio" value="08:00" required></div>
            <div class="prog-form-group"><label class="prog-form-label">Hora Fin</label><input type="time" class="prog-form-control" name="hora_fin" value="12:00"></div>
          </div>
        </div>

        <!-- Recursos -->
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Asignación de Recursos</h3>
          <div class="prog-form-group">
            <label class="prog-form-label">Técnicos <span style="font-weight:400;font-size:12px;color:#888;">(opcional, el primero marcado será el principal)</span></label>
            <div class="prog-tecnicos-list" id="tecnicosCheckboxesVisita" style="max-height:180px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">
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
            <label class="prog-form-label">Personal Administrativo <span style="font-weight:400;font-size:12px;color:#888;">(puedes seleccionar uno o varios)</span></label>
            <select class="prog-form-control" id="personalAdministrativoSelectVisita" name="id_supervisor" multiple style="display:none;"></select>
            <button type="button" id="personalAdministrativoToggle" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
              <span>Seleccionar personal</span>
              <span style="font-size:12px;">▼</span>
            </button>
            <div id="personalAdministrativoSummary" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin personal seleccionado</div>
            <div id="personalAdministrativoPanel" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                <button type="button" id="personalAdministrativoSelectAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todos</button>
                <button type="button" id="personalAdministrativoClearAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
              </div>
              <div id="personalAdministrativoOptions"></div>
            </div>
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
          <div class="prog-form-group">
            <label class="prog-form-label">Planta</label>
            <select class="prog-form-control" name="id_cliente_planta" id="plantaSelectVisita">
              <option value="">-- Planta --</option>
            </select>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Áreas <span style="font-weight:400;font-size:12px;color:#888;">(puedes seleccionar una o más)</span></label>
            <select class="prog-form-control" id="areasSelectVisita" name="id_cliente_planta_area" multiple style="display:none;"></select>
            <button type="button" id="visitaAreaToggle" class="prog-form-control" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-align:left;">
              <span>Seleccionar areas</span>
              <span style="font-size:12px;">▼</span>
            </button>
            <div id="visitaAreaSummary" style="margin-top:6px;font-size:12px;color:#94a3b8;">Sin areas seleccionadas</div>
            <div id="visitaAreaPanel" style="display:none;position:relative;margin-top:6px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;max-height:220px;overflow:auto;">
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">
                <button type="button" id="visitaAreaSelectAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Todas</button>
                <button type="button" id="visitaAreaClearAll" class="prog-btn-secondary" style="font-size:11px;padding:3px 8px;">Limpiar</button>
              </div>
              <div id="visitaAreaOptions"></div>
            </div>
            <small style="display:block;margin-top:6px;color:#64748b;font-size:11px;">Puede seleccionar una o mas areas</small>
          </div>
          <div class="prog-form-group">
            <label class="prog-form-label">Observaciones</label>
            <textarea class="prog-form-control" name="observaciones" rows="2"></textarea>
          </div>
        </div>
      </div>

      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnCancelarVisita">Cancelar</button>
        <button type="submit" class="prog-btn-primary" id="btnSubmitVisita">Crear Programación</button>
      </div>
    </form>`;

  // ── Lógica de formulario ──
  const selectCliente = body.querySelector('#selectClienteVisita') as HTMLSelectElement;
  const plantaSelect = body.querySelector('#plantaSelectVisita') as HTMLSelectElement;
  const areasSelect = body.querySelector('#areasSelectVisita') as HTMLSelectElement;
  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement;

  // Setup badge para técnicos
  setupPrincipalBadge(body.querySelector('#tecnicosCheckboxesVisita') as HTMLElement);
  renderAreaPickerOptionsVisita(body);
  actualizarResumenAreasVisita(body);
  bindAreaMultiInteractionsVisita(body);
  if (personalAdministrativoSelect) {
    personalAdministrativoSelect.innerHTML = personalData.map(pe => `<option value="${pe.id}">${pe.nombre} ${pe.apellidos}</option>`).join('');
  }
  renderPersonalPickerOptionsVisita(body);
  actualizarResumenPersonalVisita(body);
  bindPersonalMultiInteractionsVisita(body);

  // Cuando se selecciona cliente, cargar sus plantas
  selectCliente?.addEventListener('change', async () => {
    const clienteId = parseInt(selectCliente.value);
    if (clienteId) {
      await cargarPlantasClienteVisita(clienteId);
      plantaSelect.innerHTML = '<option value="">-- Planta --</option>' +
        plantasClienteVisita.map(p => {
          if (p.estado !== 'Activo') return '';
          return `<option value="${p.id}">${p.nombre}</option>`;
        }).join('');
      areasSelect.innerHTML = '';
      renderAreaPickerOptionsVisita(body);
      actualizarResumenAreasVisita(body);
    } else {
      plantaSelect.innerHTML = '<option value="">-- Planta --</option>';
      areasSelect.innerHTML = '';
      renderAreaPickerOptionsVisita(body);
      actualizarResumenAreasVisita(body);
    }
  });

  // Cuando se selecciona planta, cargar sus áreas
  plantaSelect?.addEventListener('change', () => {
    const plantaId = parseInt(plantaSelect.value);
    if (plantaId) {
      const planta = plantasClienteVisita.find(p => p.id === plantaId);
      const areas = (planta?.areas_activas || planta?.areas || []).filter((a: any) => a.estado === 'Activo');
      areasSelect.innerHTML = areas.map((a: any) => 
        `<option value="${a.id}">${a.nombre}</option>`
      ).join('');
      renderAreaPickerOptionsVisita(body);
      actualizarResumenAreasVisita(body);
    } else {
      areasSelect.innerHTML = '';
      renderAreaPickerOptionsVisita(body);
      actualizarResumenAreasVisita(body);
    }
  });

  // Botones
  body.querySelector('#btnCancelarVisita')?.addEventListener('click', () => cerrarModal('modalNuevaProgramacionVisita'));
  body.querySelector('#formNuevaVisita')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitVisitaIndividual(body);
  });
}

async function cargarPlantasClienteVisita(idCliente: number) {
  try {
    const res = await clienteService.getPlantas(idCliente);
    const raw = res.data || res;
    plantasClienteVisita = (raw as any).data || raw;
  } catch {
    plantasClienteVisita = [];
  }
}

async function submitVisitaIndividual(body: HTMLElement) {
  const fd = new FormData(body.querySelector('#formNuevaVisita') as HTMLFormElement);
  
  const data: Record<string, any> = {
    id_cliente: fd.get('id_cliente'),
    tipo_visita: fd.get('tipo_visita'),
  };

  if (!data.tipo_visita) {
    mostrarToast('warning', 'Campo requerido', 'Debe seleccionar el tipo de visita');
    return;
  }

  // Recoger técnicos seleccionados
  const { tecnicosIds, idTecnicoPrincipal } = getTecnicosSeleccionadosConPrincipal(
    body.querySelector('#tecnicosCheckboxesVisita') as HTMLElement | null,
  );
  data.id_tecnico_asignado = idTecnicoPrincipal;
  data.tecnicos_ids = tecnicosIds.length > 0 ? tecnicosIds : null;

  // Recoger áreas seleccionadas
  const areasSelect = body.querySelector('#areasSelectVisita') as HTMLSelectElement;
  if (areasSelect && areasSelect.selectedOptions.length > 0) {
    data.id_cliente_planta_area = Array.from(areasSelect.selectedOptions).map(o => parseInt(o.value));
  }

  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement;
  if (personalAdministrativoSelect && personalAdministrativoSelect.selectedOptions.length > 0) {
    data.id_supervisor = Array.from(personalAdministrativoSelect.selectedOptions).map(o => parseInt(o.value));
  }

  // Recoger datos comunes
  data.id_cliente_planta = fd.get('id_cliente_planta') || null;
  data.id_vehiculo = fd.get('id_vehiculo') || null;
  data.observaciones = fd.get('observaciones') || '';

  data.fecha_programada = fd.get('fecha_programada');
  data.hora_inicio = fd.get('hora_inicio') || '08:00';
  data.hora_fin = fd.get('hora_fin') || '12:00';

  // Validar conflictos de horarios en la vista actual
  const validacion = verificarConflictosHorarios(tecnicosIds, data.fecha_programada, data.hora_inicio, data.hora_fin);
  if (validacion.hayConflicto) {
    mostrarToast('warning', 'Conflicto de Horarios', validacion.conflictoDetalle);
    return;
  }

  try {
    await programacionService.createVisita(data);
    cerrarModal('modalNuevaProgramacionVisita');
    await recargarProgramaciones();
    mostrarToast('success', 'Visita Programada', 'La programación de visita fue registrada exitosamente');
  } catch (err: any) {
    let message = err?.data?.message || err?.response?.data?.message || err?.message || 'No se pudo crear la programación';
    const errors = err?.data?.errors || err?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const detalles = Object.entries(errors)
        .map(([campo, msgs]: [string, any]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      if (detalles) message = `${message}. ${detalles}`;
    }
    mostrarErrorProgramacion(message);
    console.error('Error creando visita:', err?.data || err);
  }
}

async function submitFabricacionIndividual(body: HTMLElement) {
  const form = body.querySelector('#formNuevaFabricacion') as HTMLFormElement | null;
  if (!form) return;

  const fd = new FormData(form);
  const idOrdenFabricacion = parseInt(String(fd.get('id_orden_fabricacion') || '0'), 10);
  if (!idOrdenFabricacion) {
    mostrarToast('warning', 'Campo requerido', 'Debe seleccionar una orden de fabricacion');
    return;
  }

  const { tecnicosIds, idTecnicoPrincipal } = getTecnicosSeleccionadosConPrincipal(
    body.querySelector('#tecnicosCheckboxesVisita') as HTMLElement | null,
  );
  if (tecnicosIds.length === 0) {
    mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico');
    return;
  }

  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement;

  const data: Record<string, any> = {
    tipo_programacion: 'fabricacion',
    id_orden_fabricacion: idOrdenFabricacion,
    id_tecnico_asignado: idTecnicoPrincipal,
    tecnicos_ids: tecnicosIds,
    id_supervisor: personalAdministrativoSelect && personalAdministrativoSelect.selectedOptions.length > 0
      ? Array.from(personalAdministrativoSelect.selectedOptions).map((o) => parseInt(o.value, 10)).filter((id) => id > 0)
      : null,
    fecha_programada: fd.get('fecha_programada'),
    hora_inicio: fd.get('hora_inicio') || '08:00',
    hora_fin: fd.get('hora_fin') || '12:00',
    observaciones: fd.get('observaciones') || '',
  };

  const validacion = verificarConflictosHorarios(tecnicosIds, data.fecha_programada, data.hora_inicio, data.hora_fin);
  if (validacion.hayConflicto) {
    mostrarToast('warning', 'Conflicto de Horarios', validacion.conflictoDetalle);
    return;
  }

  try {
    await programacionService.createFabricacion(data);
    cerrarModal('modalNuevaProgramacionVisita');
    await recargarProgramaciones();
    mostrarToast('success', 'Fabricación Programada', 'La programación por fabricación fue registrada exitosamente');
  } catch (err: any) {
    let message = err?.data?.message || err?.response?.data?.message || err?.message || 'No se pudo crear la programación de fabricación';
    const errors = err?.data?.errors || err?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const detalles = Object.entries(errors)
        .map(([campo, msgs]: [string, any]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      if (detalles) message = `${message}. ${detalles}`;
    }
    mostrarErrorProgramacion(message);
    console.error('Error creando fabricación:', err?.data || err);
  }
}

async function submitOtrosIndividual(body: HTMLElement) {
  const form = body.querySelector('#formNuevaOtros') as HTMLFormElement | null;
  if (!form) return;

  const fd = new FormData(form);
  const motivo = String(fd.get('motivo') || '').trim();
  const ubicacionManual = String(fd.get('ubicacion_manual') || '').trim();

  if (!motivo) {
    mostrarToast('warning', 'Campo requerido', 'Debe ingresar el motivo');
    return;
  }

  if (!ubicacionManual) {
    mostrarToast('warning', 'Campo requerido', 'Debe ingresar la ubicación manual');
    return;
  }

  const { tecnicosIds, idTecnicoPrincipal } = getTecnicosSeleccionadosConPrincipal(
    body.querySelector('#tecnicosCheckboxesVisita') as HTMLElement | null,
  );

  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectVisita') as HTMLSelectElement;

  const data: Record<string, any> = {
    tipo_programacion: 'otros',
    motivo,
    id_tecnico_asignado: idTecnicoPrincipal,
    tecnicos_ids: tecnicosIds.length > 0 ? tecnicosIds : null,
    id_supervisor: personalAdministrativoSelect && personalAdministrativoSelect.selectedOptions.length > 0
      ? Array.from(personalAdministrativoSelect.selectedOptions).map((o) => parseInt(o.value, 10)).filter((id) => id > 0)
      : null,
    id_vehiculo: fd.get('id_vehiculo') || null,
    fecha_programada: fd.get('fecha_programada'),
    hora_inicio: fd.get('hora_inicio') || '08:00',
    hora_fin: fd.get('hora_fin') || '12:00',
    ubicacion_manual: ubicacionManual,
    observaciones: fd.get('observaciones') || '',
  };

  const validacion = verificarConflictosHorarios(tecnicosIds, String(data.fecha_programada || ''), String(data.hora_inicio || ''), String(data.hora_fin || ''));
  if (validacion.hayConflicto) {
    mostrarToast('warning', 'Conflicto de Horarios', validacion.conflictoDetalle);
    return;
  }

  try {
    await programacionService.createOtros(data);
    cerrarModal('modalNuevaProgramacionVisita');
    await recargarProgramaciones();
    mostrarToast('success', 'Programación Creada', 'La programación de otros fue registrada exitosamente');
  } catch (err: any) {
    let message = err?.data?.message || err?.response?.data?.message || err?.message || 'No se pudo crear la programación de otros';
    const errors = err?.data?.errors || err?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const detalles = Object.entries(errors)
        .map(([campo, msgs]: [string, any]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      if (detalles) message = `${message}. ${detalles}`;
    }
    mostrarErrorProgramacion(message);
    console.error('Error creando programación de otros:', err?.data || err);
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
  const aplicarRecursosMesActual = !!(body.querySelector('#checkAplicarRecursosMesActual') as HTMLInputElement | null)?.checked;

  if (!frecuencia || !fechaInicio) { mostrarToast('warning', 'Datos incompletos', 'Seleccione un servicio con frecuencia y fecha de inicio'); return; }
  if (esFrecuenciaUnica(frecuencia)) {
    mostrarToast('warning', 'Frecuencia no válida', 'Para frecuencia Única no aplica Programación Anual. Use modo Individual.');
    return;
  }

  // Recoger técnicos seleccionados
  const { tecnicosIds, idTecnicoPrincipal } = getTecnicosSeleccionadosConPrincipal(
    body.querySelector('#tecnicosCheckboxes') as HTMLElement | null,
  );
  if (tecnicosIds.length === 0) { mostrarToast('warning', 'Campo requerido', 'Debe seleccionar al menos un técnico'); return; }

  const ok = await confirmarAccion({ titulo: 'Programación Anual', mensaje: `Se crearán todas las programaciones del año para frecuencia <strong>"${frecuencia}"</strong>. ¿Desea continuar?`, tipo: 'warning', textoConfirmar: 'Sí, crear todas' });
  if (!ok) return;

  const fd = new FormData(body.querySelector('#formNuevaProg') as HTMLFormElement);
  const idPlantaSel = parseInt(fd.get('id_cliente_planta') as string) || null;
  const data: Record<string, any> = {
    id_orden_servicio: selectODS.value,
    id_servicio: selectServicio.value,
    id_tecnico_asignado: idTecnicoPrincipal,
    tecnicos_ids: tecnicosIds,
    id_vehiculo: fd.get('id_vehiculo') || null,
    frecuencia: frecuenciaBackend,
    fecha_inicio: fechaInicio,
    hora_inicio: horaInicio || '08:00',
    hora_fin: horaFin || '12:00',
    aplicar_recursos_mes_actual: aplicarRecursosMesActual,
    id_cliente_planta: idPlantaSel,
    id_cliente_planta_area: resolveAreaIdNuevaProgramacion(idPlantaSel),
    local_sede: getPlantaNombre(idPlantaSel) || '',
    direccion_completa: getPlantaDireccion(idPlantaSel) || '',
    latitud: getPlantaLatitud(idPlantaSel),
    longitud: getPlantaLongitud(idPlantaSel),
    observaciones: fd.get('observaciones') || '',
  };

  const personalAdministrativoSelect = body.querySelector('#personalAdministrativoSelectServicio') as HTMLSelectElement;
  data.id_supervisor = personalAdministrativoSelect && personalAdministrativoSelect.selectedOptions.length > 0
    ? Array.from(personalAdministrativoSelect.selectedOptions).map(o => parseInt(o.value))
    : null;

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
    const pendientes = Number((res as any).pendientes_recursos || 0);
    const mensaje = pendientes > 0
      ? `Se crearon ${total} programaciones. ${pendientes} quedaron pendientes de recursos (resumen visible en pantalla).`
      : `Se crearon ${total} programaciones exitosamente`;
    mostrarToast('success', 'Programación Anual Creada', mensaje);
  } catch (err: any) {
    let message = err?.data?.message || err?.response?.data?.message || 'No se pudo crear la programación anual';
    const errors = err?.data?.errors || err?.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const detalles = Object.entries(errors)
        .map(([campo, msgs]: [string, any]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      if (detalles) message = `${message}. ${detalles}`;
    }
    mostrarErrorProgramacion(message);
    console.error(err);
  }
}

// ═══════════ Utilidades ═══════════

function cerrarModal(id: string) {
  const modal = document.getElementById(id);
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

function esConflictoAgendaMensaje(message: string): boolean {
  return (message || '').toLowerCase().includes('conflicto de agenda');
}

function mostrarErrorProgramacion(message: string) {
  if (esConflictoAgendaMensaje(message)) {
    mostrarToast('warning', 'Advertencia', message, 10000);
    return;
  }

  mostrarToast('error', 'Error', message);
}

function getColorByState(estado: string): string {
  const c: Record<string, string> = {
    'Programado': 'blue',
    'Confirmado': 'green',
    'Realizado': 'green',
    'Cancelado': 'red',
    'En Camino': 'cyan',
    'En Ejecución': 'orange',
    'Reprogramado': 'yellow',
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
  if (px.tipo_programacion === 'fabricacion') {
    return 'PRODUCTOS';
  }
  if (px.tipo_programacion === 'otros') {
    return 'OTROS';
  }
  const c = p.orden_servicio?.cliente || px.orden_capacitacion?.cliente || px.orden_asesoria?.cliente || px.cliente;
  return c ? (c.nombre_empresa || c.persona_contacto || '—') : '—';
}

function fmtFechaDetalle(fecha: string): string {
  const base = normalizarFecha(fecha || '');
  if (!base) return '—';
  const parsed = new Date(`${base}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getAreasSeleccionadasLabel(p: Programacion): string {
  const px = p as ProgramacionExtendida & {
    areas?: Array<any>;
    areas_seleccionadas?: Array<any>;
    cliente_planta_areas?: Array<any>;
    id_cliente_planta_area?: number | number[] | string | null;
    orden_servicio?: any;
  };

  const nombres = new Set<string>();

  if (p.area?.nombre) {
    nombres.add(String(p.area.nombre));
  }

  const colecciones = [px.areas, px.areas_seleccionadas, px.cliente_planta_areas].filter(Array.isArray) as Array<Array<any>>;
  colecciones.forEach((lista) => {
    lista.forEach((item: any) => {
      if (!item) return;
      if (typeof item === 'string') {
        if (item.trim()) nombres.add(item.trim());
        return;
      }
      if (item.nombre && String(item.nombre).trim()) {
        nombres.add(String(item.nombre).trim());
      }
    });
  });

  const ids = normalizeAreaIds(px.id_cliente_planta_area);

  const idsDetalle = normalizeAreaIds(
    px.orden_servicio?.detalles
      ?.find((d: any) => Number(d?.id_servicio) === Number(p.id_servicio))
      ?.id_cliente_planta_area,
  );

  const idsFinales = Array.from(new Set([...ids, ...idsDetalle]));
  if (idsFinales.length > 0) {
    const nombresPorIds = getAreaNombresPorIds(p.id_cliente_planta || null, idsFinales);
    nombresPorIds.forEach((n) => nombres.add(n));
  }

  if (nombres.size === 0) return '—';
  return Array.from(nombres).join(', ');
}

function getPersonalAdministrativoLabel(p: Programacion): string {
  const info = getPersonalAdministrativoInfo(p);
  if (info.nombres.length === 0) return '—';

  return info.nombres.map((nombre) => {
    return `<span style="display:inline-block;background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">${nombre}</span>`;
  }).join('');
}

function getPersonalAdministrativoInfo(p: Programacion): { ids: number[]; nombres: string[] } {
  const px = p as any;
  const idsSet = new Set<number>();
  const nombresSet = new Set<string>();

  const personal = Array.isArray(px.personal_administrativo) ? px.personal_administrativo : [];
  personal.forEach((item: any) => {
    const id = Number(item?.id);
    if (Number.isFinite(id) && id > 0) idsSet.add(id);
    const nombre = `${item?.nombre || ''} ${item?.apellidos || ''}`.trim();
    if (nombre) nombresSet.add(nombre);
  });

  if (px.supervisor) {
    const idSup = Number(px.supervisor.id);
    if (Number.isFinite(idSup) && idSup > 0) idsSet.add(idSup);
    const nombreSup = `${px.supervisor?.nombre || ''} ${px.supervisor?.apellidos || ''}`.trim();
    if (nombreSup) nombresSet.add(nombreSup);
  }

  normalizePersonalIds(px.id_supervisor).forEach((id) => idsSet.add(id));

  if (nombresSet.size === 0 && idsSet.size > 0) {
    Array.from(idsSet).forEach((id) => {
      const encontrado = personalData.find((pe) => Number(pe.id) === Number(id));
      if (!encontrado) return;
      const nombre = `${encontrado.nombre || ''} ${encontrado.apellidos || ''}`.trim();
      if (nombre) nombresSet.add(nombre);
    });
  }

  return {
    ids: Array.from(idsSet).sort((a, b) => a - b),
    nombres: Array.from(nombresSet).sort((a, b) => a.localeCompare(b)),
  };
}

function obtenerClavePersonalAdministrativo(p: Programacion): string {
  const info = getPersonalAdministrativoInfo(p);
  if (info.ids.length > 0) return `ids:${info.ids.join(',')}`;
  if (info.nombres.length > 0) {
    const nombresNormalizados = info.nombres
      .map((n) => n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return `nom:${nombresNormalizados.join('|')}`;
  }
  return '__sin_personal__';
}

function getClientesUnicos(): { id: number; nombre: string }[] {
  const clientesMap = new Map<number, string>();
  programacionesData.forEach(p => {
    const px = p as ProgramacionExtendida;
    const cliente = p.orden_servicio?.cliente || px.orden_capacitacion?.cliente || px.orden_asesoria?.cliente || px.cliente;
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

function getTecnicosSeleccionadosConPrincipal(container: HTMLElement | null): { tecnicosIds: number[]; idTecnicoPrincipal: number | null } {
  if (!container) return { tecnicosIds: [], idTecnicoPrincipal: null };

  const checks = Array.from(container.querySelectorAll('input[name="tecnicos_ids"][type="checkbox"]')) as HTMLInputElement[];
  const seleccionados = checks
    .filter((cb) => cb.checked)
    .map((cb) => parseInt(cb.value, 10))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (seleccionados.length === 0) {
    delete container.dataset.principalTecnicoId;
    return { tecnicosIds: [], idTecnicoPrincipal: null };
  }

  const principalGuardado = parseInt(container.dataset.principalTecnicoId || '', 10);
  const principalValido = Number.isFinite(principalGuardado) && seleccionados.includes(principalGuardado)
    ? principalGuardado
    : seleccionados[0];

  container.dataset.principalTecnicoId = String(principalValido);
  const tecnicosIds = [principalValido, ...seleccionados.filter((id) => id !== principalValido)];
  return { tecnicosIds, idTecnicoPrincipal: principalValido };
}

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

  const updateBadges = (preferredPrincipalId?: number | null) => {
    const checks = Array.from(container.querySelectorAll('input[name="tecnicos_ids"][type="checkbox"]')) as HTMLInputElement[];
    const checked = checks.filter((cb) => cb.checked);
    const checkedIds = checked.map((cb) => parseInt(cb.value, 10)).filter((id) => Number.isFinite(id) && id > 0);

    let principalId: number | null = null;
    const principalGuardado = parseInt(container.dataset.principalTecnicoId || '', 10);

    if (checkedIds.length === 0) {
      delete container.dataset.principalTecnicoId;
    } else if (Number.isFinite(principalGuardado) && checkedIds.includes(principalGuardado)) {
      principalId = principalGuardado;
    } else if (preferredPrincipalId && checkedIds.includes(preferredPrincipalId)) {
      principalId = preferredPrincipalId;
    } else {
      principalId = checkedIds[0];
    }

    if (principalId) container.dataset.principalTecnicoId = String(principalId);

    checks.forEach(cb => {
      const badge = cb.closest('label')?.querySelector('.prog-principal-badge') as HTMLElement;
      if (!badge) return;
      const id = parseInt(cb.value, 10);
      if (cb.checked && principalId !== null && id === principalId) {
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    });
  };

  container.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement | null;
    const preferred = target && target.matches('input[name="tecnicos_ids"][type="checkbox"]') && target.checked
      ? parseInt(target.value, 10)
      : null;
    updateBadges(Number.isFinite(preferred as number) ? preferred : null);
  });
  updateBadges(); // estado inicial
}
