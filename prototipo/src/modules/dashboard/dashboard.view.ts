import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration, ChartType } from 'chart.js';
import type { DashboardData } from './dashboard.types';
import { productoService } from '../../services/productoService';
import { mantenimientoService } from '../../services/mantenimientoService';
import { almacenService } from '../almacen/almacen.service';
import { cotizacionService } from '../../services/cotizacionService';
import { ordenServicioService } from '../../services/ordenServicioService';
import { ordenProductoService } from '../../services/ordenProductoService';
import { ordenCapacitacionService } from '../../services/ordenCapacitacionService';
import { ordenAsesoriaService } from '../../services/ordenAsesoriaService';
import { apiClient } from '../../core/api/api.client';

Chart.register(...registerables);

type DashboardMainData = {
  almacen: {
    stockTotal: number;
    valorTotal: number;
    bajoStock: number;
    movimientosHoy: number;
    equiposVencidos: number;
    mantenimientosProximos: number;
  };
  comercial: {
    cotizacionesTotales: number;
    cotizacionesPendientes: number;
    cotizacionesAceptadas: number;
    valorCotizado: number;
    ordenesTotales: number;
    ordenesSinGenerar: number;
  };
  equipos: {
    alDia: number;
    proximo: number;
    vencido: number;
    total: number;
  };
  ordenesPorTipo: {
    servicio: number;
    producto: number;
    capacitacion: number;
    asesoria: number;
  };
};

const dashboardState: DashboardMainData = {
  almacen: {
    stockTotal: 0,
    valorTotal: 0,
    bajoStock: 0,
    movimientosHoy: 0,
    equiposVencidos: 0,
    mantenimientosProximos: 0,
  },
  comercial: {
    cotizacionesTotales: 0,
    cotizacionesPendientes: 0,
    cotizacionesAceptadas: 0,
    valorCotizado: 0,
    ordenesTotales: 0,
    ordenesSinGenerar: 0,
  },
  equipos: {
    alDia: 0,
    proximo: 0,
    vencido: 0,
    total: 0,
  },
  ordenesPorTipo: {
    servicio: 0,
    producto: 0,
    capacitacion: 0,
    asesoria: 0,
  },
};

let dashboardLoading = false;
const chartInstances: Chart[] = [];

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-PE').format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function destroyCharts(): void {
  while (chartInstances.length > 0) {
    chartInstances.pop()?.destroy();
  }
}

function createOrReplaceChart(canvasId: string, config: ChartConfiguration<ChartType, number[], string>): void {
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

function getNumberFromResponse(response: any, keys: string[]): number {
  const source = (response as any)?.data?.data || (response as any)?.data || response;
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'number' || typeof value === 'string') {
      return toNumber(value);
    }
  }
  return 0;
}

function getMainKpiValue(id: string, fallback: string): string {
  const el = document.getElementById(id);
  return el?.textContent?.trim() || fallback;
}

async function safeLoad<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('Error cargando dashboard principal:', error);
    return fallback;
  }
}

async function loadDashboardData(): Promise<DashboardMainData> {
  const [estadInventario, alertasMantenimiento, estadoEquipos, estadCotizaciones, movimientos, ordServRes, ordProdRes, ordCapRes, ordAsesRes, alertasSinOrden] = await Promise.all([
    safeLoad(almacenService.getEstadisticasInventario(), { stock_total: 0, valor_total: 0, productos_bajo_stock: 0, categorias: 0 } as any),
    safeLoad(mantenimientoService.getAlertasMantenimiento(), { total_alertas: 0, proximos: 0, vencidos: 0 } as any),
    safeLoad(almacenService.getEstadoEquiposOperativo(), { total_equipos: 0, al_dia: 0, proximo: 0, vencido: 0, pendientes: 0, realizados: 0 } as any),
    safeLoad(cotizacionService.getEstadisticas(), { total: 0, pendientes: 0, aceptadas: 0, rechazadas: 0, valor_total: 0, valor_pendiente: 0 } as any),
    safeLoad(almacenService.getMovimientos({}), [] as any[]),
    safeLoad(ordenServicioService.getAll(), { data: [] } as any),
    safeLoad(ordenProductoService.getAll(), { data: [] } as any),
    safeLoad(ordenCapacitacionService.getAll(), { data: [] } as any),
    safeLoad(ordenAsesoriaService.getAll(), { data: [] } as any),
    safeLoad(apiClient.get<{ success: boolean; data: { total: number } }>('/cotizaciones/alerta-sin-orden'), { data: { total: 0 } } as any),
  ]);

  const rawProductos = (estadInventario as any)?.data || estadInventario || {};
  const rawMantenimiento = (alertasMantenimiento as any)?.data || alertasMantenimiento || {};
  const rawEquipos = (estadoEquipos as any)?.data || estadoEquipos || {};
  const rawCotizaciones = (estadCotizaciones as any)?.data || estadCotizaciones || {};
  const rawSinOrden = (alertasSinOrden as any)?.data?.data || (alertasSinOrden as any)?.data || alertasSinOrden || {};

  const ordenesPorTipo = {
    servicio: Array.isArray((ordServRes as any)?.data?.data || (ordServRes as any)?.data || ordServRes) ? ((ordServRes as any)?.data?.data || (ordServRes as any)?.data || ordServRes).length : 0,
    producto: Array.isArray((ordProdRes as any)?.data?.data || (ordProdRes as any)?.data || ordProdRes) ? ((ordProdRes as any)?.data?.data || (ordProdRes as any)?.data || ordProdRes).length : 0,
    capacitacion: Array.isArray((ordCapRes as any)?.data?.data || (ordCapRes as any)?.data || ordCapRes) ? ((ordCapRes as any)?.data?.data || (ordCapRes as any)?.data || ordCapRes).length : 0,
    asesoria: Array.isArray((ordAsesRes as any)?.data?.data || (ordAsesRes as any)?.data || ordAsesRes) ? ((ordAsesRes as any)?.data?.data || (ordAsesRes as any)?.data || ordAsesRes).length : 0,
  };

  const ordenesTotales = [ordServRes, ordProdRes, ordCapRes, ordAsesRes].reduce((sum, response) => {
    const data = (response as any)?.data?.data || (response as any)?.data || response;
    return sum + (Array.isArray(data) ? data.length : 0);
  }, 0);

  const movimientosHoy = Array.isArray(movimientos)
    ? movimientos.filter((movimiento) => String((movimiento as any)?.fecha || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).length
    : 0;

  return {
    almacen: {
      stockTotal: toNumber(rawProductos.stock_total),
      valorTotal: toNumber(rawProductos.valor_total),
      bajoStock: toNumber(rawProductos.productos_bajo_stock),
      movimientosHoy,
      equiposVencidos: toNumber(rawMantenimiento.vencidos),
      mantenimientosProximos: toNumber(rawMantenimiento.proximos),
    },
    comercial: {
      cotizacionesTotales: toNumber(rawCotizaciones.total),
      cotizacionesPendientes: toNumber(rawCotizaciones.pendientes),
      cotizacionesAceptadas: toNumber(rawCotizaciones.aceptadas),
      valorCotizado: toNumber(rawCotizaciones.valor_total),
      ordenesTotales,
      ordenesSinGenerar: toNumber(rawSinOrden.total),
    },
    equipos: {
      alDia: toNumber(rawEquipos.al_dia),
      proximo: toNumber(rawEquipos.proximo),
      vencido: toNumber(rawEquipos.vencido),
      total: toNumber(rawEquipos.total_equipos),
    },
    ordenesPorTipo,
  };
}

function updateDashboardKPIs(): void {
  const current = dashboardState;
  const mappings: Array<[string, string]> = [
    ['dashboard-almacen-stock-total', formatNumber(current.almacen.stockTotal)],
    ['dashboard-almacen-valor-total', formatCurrency(current.almacen.valorTotal)],
    ['dashboard-almacen-bajo-stock', formatNumber(current.almacen.bajoStock)],
    ['dashboard-almacen-vencidos', formatNumber(current.almacen.equiposVencidos)],
    ['dashboard-almacen-proximos', formatNumber(current.almacen.mantenimientosProximos)],
    ['dashboard-almacen-movimientos-hoy', formatNumber(current.almacen.movimientosHoy)],
    ['dashboard-comercial-cotizaciones', formatNumber(current.comercial.cotizacionesTotales)],
    ['dashboard-comercial-pendientes', formatNumber(current.comercial.cotizacionesPendientes)],
    ['dashboard-comercial-aceptadas', formatNumber(current.comercial.cotizacionesAceptadas)],
    ['dashboard-comercial-valor-cotizado', formatCurrency(current.comercial.valorCotizado)],
    ['dashboard-comercial-ordenes', formatNumber(current.comercial.ordenesTotales)],
    ['dashboard-comercial-sin-orden', formatNumber(current.comercial.ordenesSinGenerar)],
  ];

  mappings.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function renderDashboardCharts(): void {
  destroyCharts();

  createOrReplaceChart('dashboard-chart-comercial', {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Aceptadas', 'Sin orden'],
      datasets: [{
        data: [dashboardState.comercial.cotizacionesPendientes, dashboardState.comercial.cotizacionesAceptadas, dashboardState.comercial.ordenesSinGenerar],
        backgroundColor: ['#f59e0b', '#16a34a', '#dc2626'],
        borderColor: ['#d97706', '#15803d', '#b91c1c'],
        borderWidth: 3,
        borderAlign: 'center',
        spacing: 2,
        offset: [4, 4, 4],
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

  createOrReplaceChart('dashboard-chart-ordenes', {
    type: 'bar',
    data: {
      labels: ['Servicio', 'Producto', 'Capacitación', 'Asesoría'],
      datasets: [{
        label: 'Órdenes',
        data: [dashboardState.ordenesPorTipo.servicio, dashboardState.ordenesPorTipo.producto, dashboardState.ordenesPorTipo.capacitacion, dashboardState.ordenesPorTipo.asesoria],
        backgroundColor: ['#1d4ed8', '#16a34a', '#f59e0b', '#7c3aed'],
        borderColor: ['#1e40af', '#15803d', '#b45309', '#6d28d9'],
        borderWidth: 2,
        borderRadius: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
        x: { grid: { display: false } },
      },
    },
  });

  createOrReplaceChart('dashboard-chart-equipos', {
    type: 'doughnut',
    data: {
      labels: ['Al día', 'Próximo', 'Vencido'],
      datasets: [{
        data: [dashboardState.equipos.alDia, dashboardState.equipos.proximo, dashboardState.equipos.vencido],
        backgroundColor: ['#16a34a', '#f59e0b', '#dc2626'],
        borderColor: ['#15803d', '#d97706', '#b91c1c'],
        borderWidth: 3,
        borderAlign: 'center',
        spacing: 2,
        offset: [4, 4, 4],
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
}

async function refreshDashboard(): Promise<void> {
  if (dashboardLoading) return;
  dashboardLoading = true;
  const root = document.getElementById('main-dashboard-root');
  if (root) root.dataset.loading = 'true';

  try {
    const data = await loadDashboardData();
    dashboardState.almacen = data.almacen;
    dashboardState.comercial = data.comercial;
    dashboardState.equipos = data.equipos;
    dashboardState.ordenesPorTipo = data.ordenesPorTipo;
    updateDashboardKPIs();
    renderDashboardCharts();
  } finally {
    dashboardLoading = false;
    if (root) root.dataset.loading = 'false';
  }
}

export function renderDashboard(data?: DashboardData) {
  return `
    <div id="main-dashboard-root">
    <!-- Banner de alerta de stock bajo (se llena dinámicamente) -->
    <div id="stock-bajo-banner"></div>

    <!-- Banner de alerta de mantenimientos próximos/vencidos -->
    <div id="mantenimiento-alerta-banner"></div>

    <!-- Banner de alerta de cotizaciones aceptadas sin orden -->
    <div id="cotizaciones-sin-orden-banner"></div>

    <div class="page-header">
      <h1>Panel de Control Multidisciplinario</h1>
      <p>Resumen general de operaciones y gestión de QSCI Group.</p>
    </div>

    <div class="dashboard-dual-grid" style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:18px;margin-top:20px;">
      <section style="grid-column:span 12;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px 20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
          <div>
            <h2 style="margin:0;font-size:20px;font-weight:800;color:#0f172a;">Almacén</h2>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Indicadores operativos del inventario y mantenimiento.</p>
          </div>
          <span class="stat-box-note">Solo áreas activas</span>
        </div>
        <div class="stats-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;">
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"></path><path d="M12 3v18"></path></svg></span><span class="stat-change positive">Actual</span></div><div class="stat-label">Stock total</div><div class="stat-value" id="dashboard-almacen-stock-total">0 <span class="stat-unit">unidades</span></div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span><span class="stat-change positive">Actual</span></div><div class="stat-label">Valor inventario</div><div class="stat-value" id="dashboard-almacen-valor-total">S/ 0.00</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span><span class="stat-change urgent">Atención</span></div><div class="stat-label">Bajo stock</div><div class="stat-value" id="dashboard-almacen-bajo-stock">0</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect></svg></span><span class="stat-change urgent">Mantenimiento</span></div><div class="stat-label">Vencidos</div><div class="stat-value" id="dashboard-almacen-vencidos">0</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg></span><span class="stat-change">Seguimiento</span></div><div class="stat-label">Próximos</div><div class="stat-value" id="dashboard-almacen-proximos">0</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg></span><span class="stat-change">Hoy</span></div><div class="stat-label">Movimientos</div><div class="stat-value" id="dashboard-almacen-movimientos-hoy">0</div></div>
        </div>
      </section>

      <section style="grid-column:span 12;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px 20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
          <div>
            <h2 style="margin:0;font-size:20px;font-weight:800;color:#0f172a;">Comercial</h2>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Seguimiento de cotizaciones y órdenes activas.</p>
          </div>
          <span class="stat-box-note">Facturación comercial</span>
        </div>
        <div class="stats-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;">
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></span><span class="stat-change urgent">Seguimiento</span></div><div class="stat-label">Cotizaciones totales</div><div class="stat-value" id="dashboard-comercial-cotizaciones">0</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg></span><span class="stat-change urgent">Pendiente</span></div><div class="stat-label">Cotizaciones pendientes</div><div class="stat-value" id="dashboard-comercial-pendientes">0</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span><span class="stat-change positive">Valor</span></div><div class="stat-label">Valor cotizado</div><div class="stat-value" id="dashboard-comercial-valor-cotizado">S/ 0.00</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></span><span class="stat-change">Órdenes</span></div><div class="stat-label">Órdenes generadas</div><div class="stat-value" id="dashboard-comercial-ordenes">0</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></span><span class="stat-change positive">Aceptadas</span></div><div class="stat-label">Cotizaciones aceptadas</div><div class="stat-value" id="dashboard-comercial-aceptadas">0</div></div>
          <div class="stat-card"><div class="stat-header"><span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></span><span class="stat-change urgent">Sin orden</span></div><div class="stat-label">Aceptadas sin orden</div><div class="stat-value" id="dashboard-comercial-sin-orden">0</div></div>
        </div>
      </section>

      <section style="grid-column:span 4;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px 20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
          <div>
            <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Estado comercial</h3>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Pendientes, aceptadas y sin orden.</p>
          </div>
        </div>
        <div style="height:260px;"><canvas id="dashboard-chart-comercial"></canvas></div>
      </section>

      <section style="grid-column:span 4;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px 20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
          <div>
            <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Órdenes por tipo</h3>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Servicio, producto, capacitación y asesoría.</p>
          </div>
        </div>
        <div style="height:260px;"><canvas id="dashboard-chart-ordenes"></canvas></div>
      </section>

      <section style="grid-column:span 4;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px 20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
          <div>
            <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Estado de equipos</h3>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Lectura operativa para gerencia de almacén.</p>
          </div>
        </div>
        <div style="height:260px;"><canvas id="dashboard-chart-equipos"></canvas></div>
      </section>
    </div>
  `;
}

/**
 * Carga las estadísticas de productos y muestra un banner de alerta
 * si hay productos con stock por debajo del stock de seguridad.
 */
export async function cargarAlertaStockBajo() {
  try {
    const res = await productoService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;
    const stockBajo = stats.stock_bajo || 0;

    const banner = document.getElementById('stock-bajo-banner');
    if (!banner) return;

    if (stockBajo > 0) {
      banner.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-left: 5px solid #d97706;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
          animation: bannerSlideIn 0.4s ease-out;
        ">
          <div style="
            flex-shrink: 0;
            width: 44px;
            height: 44px;
            background: #d97706;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 15px; color: #92400e; margin-bottom: 2px;">
              ⚠ Alerta de Stock Bajo
            </div>
            <div style="font-size: 13px; color: #78350f;">
              Tienes <strong>${stockBajo} producto${stockBajo > 1 ? 's' : ''}</strong> con stock por debajo del nivel de seguridad. Revisa el inventario para reabastecer a tiempo.
            </div>
          </div>
          <button id="btn-ir-inventario" style="
            flex-shrink: 0;
            padding: 8px 18px;
            background: #d97706;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
            white-space: nowrap;
          " onmouseover="this.style.background='#b45309'" onmouseout="this.style.background='#d97706'">
            Ir a Inventario →
          </button>
          <button id="btn-cerrar-banner-stock" style="
            flex-shrink: 0;
            background: none;
            border: none;
            cursor: pointer;
            color: #92400e;
            font-size: 20px;
            line-height: 1;
            padding: 4px;
            opacity: 0.6;
            transition: opacity 0.2s;
          " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Cerrar alerta">
            &times;
          </button>
        </div>
      `;

      // Botón cerrar banner
      document.getElementById('btn-cerrar-banner-stock')?.addEventListener('click', () => {
        if (banner) banner.innerHTML = '';
      });

      // Botón ir a inventario - dispara click en menú Almacén > Inventario
      document.getElementById('btn-ir-inventario')?.addEventListener('click', () => {
        // Buscar el botón de Almacén en el sidebar y simular navegación
        const almacenBtn = document.querySelector('[data-menu="Almacén"]') as HTMLButtonElement;
        if (almacenBtn) almacenBtn.click();
        setTimeout(() => {
          const inventarioBtn = document.querySelector('[data-submenu="Inventario"]') as HTMLButtonElement;
          if (inventarioBtn) inventarioBtn.click();
        }, 100);
      });
    }
  } catch (e) {
    console.error('Error cargando alerta de stock bajo:', e);
  }
}

/**
 * Carga alertas de mantenimientos próximos y vencidos y muestra un banner en el dashboard.
 */
export async function cargarAlertaMantenimiento() {
  try {
    const resp = await mantenimientoService.getAlertasMantenimiento();
    const data = (resp as any).data || resp;

    const totalAlertas = data.total_alertas || 0;
    const proximos = data.proximos || 0;
    const vencidos = data.vencidos || 0;
    const alertas: Array<{
      tipo: 'proximo' | 'vencido';
      equipo: string;
      fecha: string;
      tiempo_texto: string;
      es_prueba: boolean;
    }> = data.alertas || [];

    const banner = document.getElementById('mantenimiento-alerta-banner');
    if (!banner) return;

    if (totalAlertas === 0) {
      banner.innerHTML = '';
      return;
    }

    // Separar alertas
    const listaProximos = alertas.filter(a => a.tipo === 'proximo');
    const listaVencidos = alertas.filter(a => a.tipo === 'vencido');

    // Color: si hay vencidos → rojo, solo próximos → azul/naranja
    const hayVencidos = vencidos > 0;
    const colorPrimario = hayVencidos ? '#dc2626' : '#2563eb';
    const colorFondo = hayVencidos
      ? 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'
      : 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)';
    const colorBorde = hayVencidos ? '#dc2626' : '#2563eb';
    const colorTexto = hayVencidos ? '#991b1b' : '#1e40af';
    const colorTextoSub = hayVencidos ? '#b91c1c' : '#1d4ed8';

    // Generar items de detalle (máximo 5)
    const itemsHTML = alertas.slice(0, 5).map(a => {
      const iconColor = a.tipo === 'vencido' ? '#dc2626' : '#f59e0b';
      const icon = a.tipo === 'vencido'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
      const badgeColor = a.tipo === 'vencido' ? 'background:#fee2e2; color:#991b1b;' : 'background:#fef3c7; color:#92400e;';
      const pruebaBadge = a.es_prueba ? '<span style="font-size:9px; padding:1px 4px; border-radius:4px; background:#e0e7ff; color:#3730a3; margin-left:4px;">TEST</span>' : '';

      return `
        <div style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:rgba(255,255,255,0.6); border-radius:6px; font-size:12px;">
          <span style="color:${iconColor}; flex-shrink:0;">${icon}</span>
          <strong style="color:#1e293b;">${a.equipo}</strong>${pruebaBadge}
          <span style="color:#64748b;">—</span>
          <span style="padding:2px 6px; border-radius:4px; font-size:11px; ${badgeColor}">${a.tipo === 'vencido' ? 'Vencido' : 'Próximo'}</span>
          <span style="color:#64748b; font-size:11px; margin-left:auto;">${a.tiempo_texto}</span>
        </div>
      `;
    }).join('');

    const masAlertas = totalAlertas > 2 ? `<div style="font-size:11px; color:${colorTextoSub}; text-align:center; margin-top:4px; font-style:italic;">...y ${totalAlertas - alertas.length} más en Programación Anual</div>` : '';

    // Texto resumen
    const partes: string[] = [];
    if (proximos > 0) partes.push(`<strong>${proximos}</strong> próximo${proximos > 1 ? 's' : ''}`);
    if (vencidos > 0) partes.push(`<strong>${vencidos}</strong> vencido${vencidos > 1 ? 's' : ''}`);
    const resumenTexto = `Tienes ${partes.join(' y ')} mantenimiento${totalAlertas > 1 ? 's' : ''} que requieren atención.`;

    banner.innerHTML = `
      <div style="
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 20px;
        margin-bottom: 20px;
        background: ${colorFondo};
        border: 1px solid ${colorBorde};
        border-left: 5px solid ${colorPrimario};
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        animation: bannerSlideIn 0.4s ease-out;
      ">
        <div style="
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          background: ${colorPrimario};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 15px; color: ${colorTexto}; margin-bottom: 4px;">
            ${hayVencidos ? 'Mantenimientos Vencidos' : 'Mantenimientos Próximos'}
          </div>
          <div style="font-size: 13px; color: ${colorTextoSub}; margin-bottom: 8px;">
            ${resumenTexto}
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${itemsHTML}
            ${masAlertas}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
          <button id="btn-ir-mantenimiento" style="
            padding: 8px 18px;
            background: ${colorPrimario};
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
            white-space: nowrap;
          " onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
            Ir a Mantenimiento →
          </button>
          <button id="btn-cerrar-banner-mant" style="
            flex-shrink: 0;
            background: none;
            border: none;
            cursor: pointer;
            color: ${colorTexto};
            font-size: 20px;
            line-height: 1;
            padding: 4px;
            opacity: 0.6;
            transition: opacity 0.2s;
          " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Cerrar alerta">
            &times;
          </button>
        </div>
      </div>
    `;

    // Botón cerrar
    document.getElementById('btn-cerrar-banner-mant')?.addEventListener('click', () => {
      if (banner) banner.innerHTML = '';
    });

    // Botón ir a mantenimiento
    document.getElementById('btn-ir-mantenimiento')?.addEventListener('click', () => {
      const almacenBtn = document.querySelector('[data-menu="Almacén"]') as HTMLButtonElement;
      if (almacenBtn) almacenBtn.click();
      setTimeout(() => {
        const mantBtn = document.querySelector('[data-submenu="Mantenimiento"]') as HTMLButtonElement;
        if (mantBtn) mantBtn.click();
        // Auto-click en tab programación anual
        setTimeout(() => {
          const progTab = document.querySelector('[data-tab="programacion-anual"]') as HTMLButtonElement;
          if (progTab) progTab.click();
        }, 200);
      }, 100);
    });
  } catch (e) {
    console.error('Error cargando alerta de mantenimientos:', e);
  }
}

/**
 * Carga alerta de cotizaciones aceptadas que aún no tienen orden generada.
 */
export async function cargarAlertaCotizacionesSinOrden() {
  try {
    const res = await apiClient.get<{ success: boolean; data: { total: number; producto: number; servicio: number; capacitacion: number } }>('/cotizaciones/alerta-sin-orden');
    const raw = (res as any).data || res;
    const data = raw.data || raw;

    const total: number = data.total || 0;
    const producto: number = data.producto || 0;
    const servicio: number = data.servicio || 0;
    const capacitacion: number = data.capacitacion || 0;

    const banner = document.getElementById('cotizaciones-sin-orden-banner');
    if (!banner) return;

    if (total === 0) {
      banner.innerHTML = '';
      return;
    }

    // Generar detalle por tipo
    const detalles: string[] = [];
    if (producto > 0) detalles.push(`<strong>${producto}</strong> de Producto`);
    if (servicio > 0) detalles.push(`<strong>${servicio}</strong> de Servicio`);
    if (capacitacion > 0) detalles.push(`<strong>${capacitacion}</strong> de Capacitación`);
    const detalleTexto = detalles.join(', ');

    banner.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 20px;
        margin-bottom: 20px;
        background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
        border: 1px solid #10b981;
        border-left: 5px solid #059669;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
        animation: bannerSlideIn 0.4s ease-out;
      ">
        <div style="
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          background: #059669;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
            <line x1="12" y1="12" x2="12" y2="18"></line>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 15px; color: #065f46; margin-bottom: 2px;">
             Cotizaciones Aceptadas Pendientes
          </div>
          <div style="font-size: 13px; color: #047857;">
            Tienes <strong>${total}</strong> cotización${total > 1 ? 'es' : ''} aceptada${total > 1 ? 's' : ''} sin orden generada: ${detalleTexto}.
          </div>
        </div>
        <button id="btn-ir-cotizaciones" style="
          flex-shrink: 0;
          padding: 8px 18px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        " onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
          Ir a Cotizaciones →
        </button>
        <button id="btn-cerrar-banner-cotizaciones" style="
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: #065f46;
          font-size: 20px;
          line-height: 1;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Cerrar alerta">
          &times;
        </button>
      </div>
    `;

    // Botón cerrar banner
    document.getElementById('btn-cerrar-banner-cotizaciones')?.addEventListener('click', () => {
      if (banner) banner.innerHTML = '';
    });

    // Botón ir a cotizaciones
    document.getElementById('btn-ir-cotizaciones')?.addEventListener('click', () => {
      const comercialBtn = document.querySelector('[data-menu="Comercial"]') as HTMLButtonElement;
      if (comercialBtn) comercialBtn.click();
      setTimeout(() => {
        const cotBtn = document.querySelector('[data-submenu="Cotizaciones"]') as HTMLButtonElement;
        if (cotBtn) cotBtn.click();
      }, 100);
    });
  } catch (e) {
    console.error('Error cargando alerta de cotizaciones sin orden:', e);
  }
}

export function initDashboardEvents() {
  void refreshDashboard();
  void cargarAlertaStockBajo();
  void cargarAlertaMantenimiento();
  void cargarAlertaCotizacionesSinOrden();
}
