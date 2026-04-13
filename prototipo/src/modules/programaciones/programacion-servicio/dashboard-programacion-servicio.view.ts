import { Chart, registerables } from 'chart.js';
import { programacionServicioService as programacionService } from './programacion-servicio.service';
import type { Programacion, Tecnico } from './programacion-servicio.types';

Chart.register(...registerables);

type ProgramacionDashboard = Programacion & {
  tipo_programacion?: 'servicio' | 'capacitacion' | 'asesoria' | 'visita' | 'fabricacion' | 'otros';
};

let dashboardMonth = new Date();
let programacionesServicioData: ProgramacionDashboard[] = [];
let tecnicosData: Tecnico[] = [];
const chartInstances: Chart[] = [];
let isLoading = false;

function shiftDashboardMonth(delta: number): void {
  // Anclar al día 1 evita saltos (ej. 31 -> febrero) por overflow de Date.setMonth.
  dashboardMonth = new Date(dashboardMonth.getFullYear(), dashboardMonth.getMonth(), 1);
  dashboardMonth.setMonth(dashboardMonth.getMonth() + delta);
  dashboardMonth = new Date(dashboardMonth.getFullYear(), dashboardMonth.getMonth(), 1);
}

function destroyCharts(): void {
  while (chartInstances.length > 0) {
    chartInstances.pop()?.destroy();
  }
}

function createOrReplaceChart(canvasId: string, config: any): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const existing = chartInstances.find((chart) => chart.canvas === canvas);
  if (existing) {
    existing.destroy();
    chartInstances.splice(chartInstances.indexOf(existing), 1);
  }

  const chart = new Chart(ctx, config);
  chartInstances.push(chart);
}

function extractList<T = any>(response: any): T[] {
  const raw = response?.data ?? response;
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  return [];
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

function monthParams() {
  return {
    mes: dashboardMonth.getMonth() + 1,
    anio: dashboardMonth.getFullYear(),
  };
}

function getNombreTecnico(programacion: ProgramacionDashboard): string {
  if (programacion.tecnico?.nombre) {
    return `${programacion.tecnico.nombre} ${programacion.tecnico.apellidos || ''}`.trim();
  }

  const tecnico = tecnicosData.find((t) => t.id === programacion.id_tecnico_asignado);
  if (tecnico) return `${tecnico.nombre} ${tecnico.apellidos}`.trim();

  return `Técnico #${programacion.id_tecnico_asignado}`;
}

function getDataServiciosOnly(programaciones: ProgramacionDashboard[]): ProgramacionDashboard[] {
  return programaciones.filter((p) => {
    const tipo = (p.tipo_programacion || 'servicio').toLowerCase();
    return tipo === 'servicio';
  });
}

function navigateToProgramacionServicio(): void {
  const navigator = (window as any).navigateToModule as
    | ((menuName: string, submenuName?: string, options?: { collapseSidebar?: boolean }) => void)
    | undefined;

  if (navigator) {
    navigator('Programaciones', 'Programación Servicio', { collapseSidebar: true });
    return;
  }

  const menuBtn = document.querySelector('[data-menu="Programaciones"]') as HTMLButtonElement | null;
  menuBtn?.click();
  setTimeout(() => {
    const subBtn = document.querySelector('[data-submenu="Programación Servicio"]') as HTMLButtonElement | null;
    subBtn?.click();
  }, 120);
}

function renderServiciosPendientesBanner(odsDisponibles: any[]): void {
  const banner = document.getElementById('prog-serv-alerta-servicios-banner');
  if (!banner) return;

  const totalOrdenes = odsDisponibles.length;
  const totalServicios = odsDisponibles.reduce((acc, orden) => {
    const detalles = Array.isArray(orden?.detalles) ? orden.detalles.length : 0;
    return acc + detalles;
  }, 0);

  if (totalServicios <= 0) {
    banner.innerHTML = '';
    return;
  }

  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;margin-bottom:8px;background:linear-gradient(135deg,#eff6ff 0%,#bae6fd 100%);border:1px solid #0284c7;border-left:5px solid #0369a1;border-radius:10px;box-shadow:0 2px 8px rgba(3,105,161,.15);animation:bannerSlideIn .4s ease-out;">
      <div style="flex-shrink:0;width:44px;height:44px;background:#0369a1;border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:15px;color:#0c4a6e;margin-bottom:2px;">Servicios pendientes por programar</div>
        <div style="font-size:13px;color:#075985;">Tienes <strong>${totalServicios}</strong> servicio${totalServicios > 1 ? 's' : ''} pendientes en <strong>${totalOrdenes}</strong> orden${totalOrdenes > 1 ? 'es' : ''}.</div>
      </div>
      <button id="prog-btn-ir-programacion-servicio" style="flex-shrink:0;padding:8px 18px;background:#0369a1;color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;transition:background .2s;white-space:nowrap;">Ir a Programación →</button>
    </div>
  `;

  document.getElementById('prog-btn-ir-programacion-servicio')?.addEventListener('click', () => {
    navigateToProgramacionServicio();
  });
}

function renderFabricacionPendienteBanner(ordenesDisponibles: any[]): void {
  const banner = document.getElementById('prog-serv-alerta-fabricacion-banner');
  if (!banner) return;

  const totalPendientes = ordenesDisponibles.length;
  if (totalPendientes <= 0) {
    banner.innerHTML = '';
    return;
  }

  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;margin-bottom:8px;background:linear-gradient(135deg,#f5f3ff 0%,#ddd6fe 100%);border:1px solid #7c3aed;border-left:5px solid #5b21b6;border-radius:10px;box-shadow:0 2px 8px rgba(91,33,182,.18);animation:bannerSlideIn .4s ease-out;">
      <div style="flex-shrink:0;width:44px;height:44px;background:#5b21b6;border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 9h6"></path><path d="M9 15h6"></path></svg>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:15px;color:#4c1d95;margin-bottom:2px;">Fabricación pendiente por programar</div>
        <div style="font-size:13px;color:#5b21b6;">Tienes <strong>${totalPendientes}</strong> orden${totalPendientes > 1 ? 'es' : ''} de fabricación pendientes de programación.</div>
      </div>
      <button id="prog-btn-ir-programacion-fabricacion" style="flex-shrink:0;padding:8px 18px;background:#5b21b6;color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;transition:background .2s;white-space:nowrap;">Ir a Programación →</button>
    </div>
  `;

  document.getElementById('prog-btn-ir-programacion-fabricacion')?.addEventListener('click', () => {
    navigateToProgramacionServicio();
  });
}

function normalizarFechaISO(valor: string | undefined | null): string | null {
  if (!valor) return null;
  const raw = String(valor).trim();
  if (!raw) return null;

  // yyyy-mm-dd o yyyy-mm-dd ...
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // dd/mm/yyyy
  const latMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (latMatch) {
    return `${latMatch[3]}-${latMatch[2]}-${latMatch[1]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatearFechaCorta(rawIso: string): string {
  const [, m, d] = rawIso.split('-');
  return `${d}/${m}`;
}

function renderMetrics(data: ProgramacionDashboard[]): void {
  const estados = {
    Programado: data.filter((p) => p.estado_ejecucion === 'Programado').length,
    Confirmado: data.filter((p) => p.estado_ejecucion === 'Confirmado').length,
    'En Camino': data.filter((p) => p.estado_ejecucion === 'En Camino').length,
    'En Ejecución': data.filter((p) => p.estado_ejecucion === 'En Ejecución').length,
    Realizado: data.filter((p) => p.estado_ejecucion === 'Realizado').length,
    Reprogramado: data.filter((p) => p.estado_ejecucion === 'Reprogramado').length,
    Cancelado: data.filter((p) => p.estado_ejecucion === 'Cancelado').length,
  };

  const realizados = estados.Confirmado + estados.Realizado;

  const total = data.length;
  const pendientes = estados.Programado + estados['En Camino'] + estados['En Ejecución'] + estados.Reprogramado;
  const cumplimiento = total > 0 ? Math.round((realizados / total) * 100) : 0;
  const tasaCancelacion = total > 0 ? Math.round((estados.Cancelado / total) * 100) : 0;

  const set = (id: string, value: string | number) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  };

  set('prog-serv-dash-total', total);
  set('prog-serv-dash-realizados', realizados);
  set('prog-serv-dash-cancelados', estados.Cancelado);
  set('prog-serv-dash-pendientes', pendientes);
  set('prog-serv-dash-cumplimiento', `${cumplimiento}%`);
  set('prog-serv-dash-tasa-cancelacion', `${tasaCancelacion}%`);
}

function renderCharts(data: ProgramacionDashboard[]): void {
  destroyCharts();

  const estadosChart = {
    Programado: data.filter((p) => p.estado_ejecucion === 'Programado').length,
    Realizado: data.filter((p) => p.estado_ejecucion === 'Confirmado' || p.estado_ejecucion === 'Realizado').length,
    'En Camino': data.filter((p) => p.estado_ejecucion === 'En Camino').length,
    'En Ejecución': data.filter((p) => p.estado_ejecucion === 'En Ejecución').length,
    Reprogramado: data.filter((p) => p.estado_ejecucion === 'Reprogramado').length,
    Cancelado: data.filter((p) => p.estado_ejecucion === 'Cancelado').length,
  };

  const estadosLabels = ['Programado', 'Realizado', 'En Camino', 'En Ejecución', 'Reprogramado', 'Cancelado'];
  const estadosValues = estadosLabels.map((estado) => (estadosChart as any)[estado] || 0);
  // Colores alineados con tarjetas semanales de programación
  const estadosColors = ['#3B82F6', '#10B981', '#06B6D4', '#F59E0B', '#EAB308', '#EF4444'];

  createOrReplaceChart('prog-serv-dash-chart-estados', {
    type: 'doughnut',
    data: {
      labels: estadosLabels,
      datasets: [{
        data: estadosValues,
        backgroundColor: estadosColors,
        borderColor: ['#2563EB', '#059669', '#0891B2', '#D97706', '#CA8A04', '#DC2626'],
        borderWidth: 3,
        borderAlign: 'center',
        spacing: 2,
        offset: [4, 4, 4, 4, 4, 4],
        hoverOffset: 7,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
          },
        },
      },
    },
  });

  const groupedByDate = new Map<string, { realizados: number; cancelados: number }>();
  data.forEach((p) => {
    const key = normalizarFechaISO(p.fecha_programada);
    if (!key) return;
    if (!groupedByDate.has(key)) groupedByDate.set(key, { realizados: 0, cancelados: 0 });
    const bucket = groupedByDate.get(key)!;
    if (p.estado_ejecucion === 'Realizado' || p.estado_ejecucion === 'Confirmado') bucket.realizados += 1;
    if (p.estado_ejecucion === 'Cancelado') bucket.cancelados += 1;
  });

  const fechas = Array.from(groupedByDate.keys()).sort((a, b) => a.localeCompare(b));
  const labelsFecha = fechas.map((f) => formatearFechaCorta(f));

  createOrReplaceChart('prog-serv-dash-chart-tendencia', {
    type: 'bar',
    data: {
      labels: labelsFecha,
      datasets: [
        {
          label: 'Realizados',
          data: fechas.map((f) => groupedByDate.get(f)?.realizados || 0),
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Cancelados',
          data: fechas.map((f) => groupedByDate.get(f)?.cancelados || 0),
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
        x: { grid: { display: false } },
      },
    },
  });

  const realizadosPorTecnico = new Map<string, number>();
  data.filter((p) => p.estado_ejecucion === 'Realizado' || p.estado_ejecucion === 'Confirmado').forEach((p) => {
    const tecnico = getNombreTecnico(p);
    realizadosPorTecnico.set(tecnico, (realizadosPorTecnico.get(tecnico) || 0) + 1);
  });

  const topTecnicos = Array.from(realizadosPorTecnico.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  createOrReplaceChart('prog-serv-dash-chart-tecnicos', {
    type: 'bar',
    data: {
      labels: topTecnicos.map((t) => t[0]),
      datasets: [{
        label: 'Realizados',
        data: topTecnicos.map((t) => t[1]),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 2,
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
        y: { grid: { display: false } },
      },
    },
  });
}

async function refreshDashboard(): Promise<void> {
  if (isLoading) return;
  isLoading = true;

  const root = document.getElementById('prog-serv-dashboard-root');
  if (root) root.setAttribute('data-loading', 'true');

  try {
    const [programacionesRes, tecnicosRes, odsRes, fabricacionRes] = await Promise.all([
      programacionService.getAll(monthParams() as any),
      programacionService.getTecnicos(),
      programacionService.getODSDisponibles(),
      programacionService.getOrdenesFabricacionDisponibles(),
    ]);

    programacionesServicioData = getDataServiciosOnly(extractList<ProgramacionDashboard>(programacionesRes));
    tecnicosData = extractList<Tecnico>(tecnicosRes);
    const odsDisponibles = extractList<any>(odsRes);
    const fabricacionDisponibles = extractList<any>(fabricacionRes);

    renderMetrics(programacionesServicioData);
    renderCharts(programacionesServicioData);
    renderServiciosPendientesBanner(odsDisponibles);
    renderFabricacionPendienteBanner(fabricacionDisponibles);

    const periodLabel = document.getElementById('prog-serv-dash-period-label');
    if (periodLabel) periodLabel.textContent = formatMonthLabel(dashboardMonth);
  } catch (error) {
    console.error('Error cargando dashboard de programación servicio:', error);
  } finally {
    isLoading = false;
    if (root) root.setAttribute('data-loading', 'false');
  }
}

export function renderDashboardProgramacionServicio(): string {
  return `
    <div id="prog-serv-dashboard-root" style="display:flex;flex-direction:column;gap:14px;">
      <div class="prog-page-header">
        <div>
          <div class="prog-breadcrumb">Dashboard Programación Servicio</div>
          <p style="margin:6px 0 0;color:#64748b;font-size:13px;">Vista independiente para control operativo de programación de servicios.</p>
        </div>
        <div class="prog-actions" style="display:flex;gap:8px;align-items:center;">
          <button class="prog-btn-icon" id="prog-serv-dash-prev" title="Mes anterior"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
          <span id="prog-serv-dash-period-label" style="min-width:150px;text-align:center;font-weight:600;color:#1e293b;">${formatMonthLabel(dashboardMonth)}</span>
          <button class="prog-btn-icon" id="prog-serv-dash-next" title="Mes siguiente"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          <button class="prog-btn-secondary" id="prog-serv-dash-today">Mes actual</button>
          <button class="prog-btn-secondary" id="prog-serv-dash-refresh">Actualizar</button>
        </div>
      </div>

      <div id="prog-serv-alerta-servicios-banner"></div>
      <div id="prog-serv-alerta-fabricacion-banner"></div>

      <section style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px 18px;box-shadow:0 8px 24px rgba(15,23,42,.05);">
        <div class="stats-row" style="margin:0 0 18px;">
          <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Total Programaciones</div><div class="stat-box-value" id="prog-serv-dash-total">0</div></div></div>
          <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Realizado (Confirmado + Realizado)</div><div class="stat-box-value" id="prog-serv-dash-realizados">0</div></div></div>
          <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Cancelados</div><div class="stat-box-value" id="prog-serv-dash-cancelados">0</div></div></div>
          <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Pendientes</div><div class="stat-box-value" id="prog-serv-dash-pendientes">0</div></div></div>
          <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Cumplimiento</div><div class="stat-box-value" id="prog-serv-dash-cumplimiento">0%</div></div></div>
          <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Tasa Cancelación</div><div class="stat-box-value" id="prog-serv-dash-tasa-cancelacion">0%</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px;">
          <section style="grid-column:span 4;border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#fff;">
            <h4 style="margin:0 0 4px;font-size:15px;color:#0f172a;">Distribución por estado</h4>
            <p style="margin:0 0 10px;color:#64748b;font-size:12px;">Fotografía rápida de ejecución.</p>
            <div style="height:240px;"><canvas id="prog-serv-dash-chart-estados"></canvas></div>
          </section>
          <section style="grid-column:span 5;border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#fff;">
            <h4 style="margin:0 0 4px;font-size:15px;color:#0f172a;">Tendencia diaria</h4>
            <p style="margin:0 0 10px;color:#64748b;font-size:12px;">Realizados y cancelados por fecha.</p>
            <div style="height:240px;"><canvas id="prog-serv-dash-chart-tendencia"></canvas></div>
          </section>
          <section style="grid-column:span 3;border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#fff;">
            <h4 style="margin:0 0 4px;font-size:15px;color:#0f172a;">Top técnicos</h4>
            <p style="margin:0 0 10px;color:#64748b;font-size:12px;">Mayor cantidad de realizados.</p>
            <div style="height:240px;"><canvas id="prog-serv-dash-chart-tecnicos"></canvas></div>
          </section>
        </div>
      </section>
    </div>
  `;
}

export function initDashboardProgramacionServicioEvents(): void {
  const prevBtn = document.getElementById('prog-serv-dash-prev') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('prog-serv-dash-next') as HTMLButtonElement | null;
  const todayBtn = document.getElementById('prog-serv-dash-today') as HTMLButtonElement | null;
  const refreshBtn = document.getElementById('prog-serv-dash-refresh') as HTMLButtonElement | null;

  if (prevBtn) prevBtn.onclick = () => {
    shiftDashboardMonth(-1);
    void refreshDashboard();
  };

  if (nextBtn) nextBtn.onclick = () => {
    shiftDashboardMonth(1);
    void refreshDashboard();
  };

  if (todayBtn) todayBtn.onclick = () => {
    const now = new Date();
    dashboardMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    void refreshDashboard();
  };

  if (refreshBtn) refreshBtn.onclick = () => {
    void refreshDashboard();
  };

  void refreshDashboard();
}
