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
        borderColor: estadosColors,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
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
          borderColor: '#10B981',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Cancelados',
          data: fechas.map((f) => groupedByDate.get(f)?.cancelados || 0),
          backgroundColor: '#EF4444',
          borderColor: '#EF4444',
          borderWidth: 1,
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
        borderColor: '#10B981',
        borderWidth: 1,
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
    const [programacionesRes, tecnicosRes] = await Promise.all([
      programacionService.getAll(monthParams() as any),
      programacionService.getTecnicos(),
    ]);

    programacionesServicioData = getDataServiciosOnly(extractList<ProgramacionDashboard>(programacionesRes));
    tecnicosData = extractList<Tecnico>(tecnicosRes);

    renderMetrics(programacionesServicioData);
    renderCharts(programacionesServicioData);

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
