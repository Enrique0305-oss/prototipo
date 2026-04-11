import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration, ChartType } from 'chart.js';
import { cotizacionService } from '../../services/cotizacionService';
import { clienteService } from '../../services/clienteService';
import { ordenServicioService } from '../../services/ordenServicioService';
import { ordenProductoService } from '../../services/ordenProductoService';
import { ordenCapacitacionService } from '../../services/ordenCapacitacionService';
import { ordenAsesoriaService } from '../../services/ordenAsesoriaService';
import { apiClient } from '../../core/api/api.client';
import type { Cliente, Cotizacion } from '../../core/api/types';

Chart.register(...registerables);

type ComercialDashboardData = {
  cotizaciones: Cotizacion[];
  estadisticasCotizaciones: {
    total: number;
    pendientes: number;
    aceptadas: number;
    rechazadas: number;
    valor_total: number;
    valor_pendiente: number;
  };
  clientes: { total: number; activos: number; contactados: number; rechazados: number };
  ordenesServicio: ComercialOrden[];
  ordenesProducto: ComercialOrden[];
  ordenesCapacitacion: ComercialOrden[];
  ordenesAsesoria: ComercialOrden[];
  estadisticasOrdenes: {
    total: number;
    totalValor: number;
    porTipo: Array<{ tipo: string; total: number }>;
  };
};

type ResumenCliente = {
  nombre: string;
  total: number;
  totalValor: number;
};

type ComercialOrden = {
  numero?: string;
  cliente_nombre?: string;
  fecha?: string;
  tipo?: string;
  total?: number;
  estado?: string;
  tipoOrden?: string;
};

type ComercialOrdenApi = Record<string, any>;

type ComercialDashboardSourceData = {
  cotizaciones: Cotizacion[];
  clientes: Cliente[];
  ordenesServicio: ComercialOrden[];
  ordenesProducto: ComercialOrden[];
  ordenesCapacitacion: ComercialOrden[];
  ordenesAsesoria: ComercialOrden[];
};

type ComercialDateRangePreset = 'all' | 'today' | '7d' | '30d' | 'month' | 'custom';

type ComercialDateRange = {
  preset: ComercialDateRangePreset;
  fechaDesde: string;
  fechaHasta: string;
};

const chartInstances: Chart[] = [];
let isLoading = false;
let dashboardSource: ComercialDashboardSourceData | null = null;
let dashboardRange: ComercialDateRange = getDefaultDashboardRange();
const COMERCIAL_DASHBOARD_CACHE_KEY = 'qsci_dashboard_comercial_cache';
const COMERCIAL_DASHBOARD_CACHE_TTL_MS = 60 * 1000;

type ComercialDashboardCacheEntry = {
  timestamp: number;
  source: ComercialDashboardSourceData;
};

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toLocalDateInput(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function fromLocalDateInput(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDefaultDashboardRange(): ComercialDateRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    preset: 'month',
    fechaDesde: toLocalDateInput(start),
    fechaHasta: toLocalDateInput(today),
  };
}

function getRangeForPreset(preset: ComercialDateRangePreset): ComercialDateRange {
  const today = new Date();

  if (preset === 'today') {
    const current = toLocalDateInput(today);
    return { preset, fechaDesde: current, fechaHasta: current };
  }

  if (preset === '7d') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { preset, fechaDesde: toLocalDateInput(start), fechaHasta: toLocalDateInput(today) };
  }

  if (preset === '30d') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    return { preset, fechaDesde: toLocalDateInput(start), fechaHasta: toLocalDateInput(today) };
  }

  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { preset: 'month', fechaDesde: toLocalDateInput(start), fechaHasta: toLocalDateInput(today) };
}

function normalizeRange(range: ComercialDateRange): ComercialDateRange {
  if (range.preset === 'all') {
    return { preset: 'all', fechaDesde: '', fechaHasta: '' };
  }

  const start = fromLocalDateInput(range.fechaDesde);
  const end = fromLocalDateInput(range.fechaHasta);

  if (!start || !end) {
    return getDefaultDashboardRange();
  }

  if (start > end) {
    return {
      preset: 'custom',
      fechaDesde: toLocalDateInput(end),
      fechaHasta: toLocalDateInput(start),
    };
  }

  return {
    preset: range.preset,
    fechaDesde: toLocalDateInput(start),
    fechaHasta: toLocalDateInput(end),
  };
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

function unwrapArray<T>(response: any): T[] {
  if (Array.isArray(response)) return response as T[];
  if (Array.isArray(response?.data)) return response.data as T[];
  if (Array.isArray(response?.data?.data)) return response.data.data as T[];
  return [];
}

function normalizeOrden(orden: ComercialOrdenApi, tipoOrden: string): ComercialOrden {
  const cliente = orden?.cliente;
  return {
    numero: orden?.numero || orden?.numero_orden || orden?.num_ordenserv || orden?.num_ordenprod || orden?.num_ordencapaud || orden?.correlativo || orden?.codigo || '—',
    cliente_nombre: orden?.cliente_nombre || cliente?.nombre_empresa || cliente?.nombre || cliente?.razon_social || '—',
    fecha: orden?.fecha_emision || orden?.fecha_orden || orden?.fecha_aceptacion || orden?.fecha_envio || orden?.fecha_servicio || orden?.fecha || orden?.created_at || '',
    tipo: orden?.tipo || tipoOrden,
    total: toNumber(orden?.total ?? orden?.total_costo ?? orden?.costo ?? orden?.monto ?? orden?.subtotal),
    estado: orden?.estado || orden?.estado_orden || '—',
    tipoOrden,
  };
}

function getCotizacionesPorTipo(cotizaciones: Cotizacion[]) {
  const counts = new Map<string, number>();
  cotizaciones.forEach((cotizacion) => {
    const tipo = cotizacion.tipo || 'Sin tipo';
    counts.set(tipo, (counts.get(tipo) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([tipo, total]) => ({ tipo, total }));
}

function getResumenClientesPorCotizacion(cotizaciones: Cotizacion[]): ResumenCliente[] {
  const map = new Map<string, ResumenCliente>();

  cotizaciones.forEach((cotizacion) => {
    const nombre = cotizacion.cliente_nombre || 'Sin cliente';
    const actual = map.get(nombre) || { nombre, total: 0, totalValor: 0 };
    actual.total += 1;
    actual.totalValor += toNumber(cotizacion.total);
    map.set(nombre, actual);
  });

  return Array.from(map.values())
    .sort((a, b) => b.totalValor - a.totalValor)
    .slice(0, 5);
}

async function renderCotizacionesPendientesBanner(): Promise<void> {
  try {
    const res = await apiClient.get<{ success: boolean; data: { total: number; producto: number; servicio: number; capacitacion: number } }>('/cotizaciones/alerta-sin-orden');
    const raw = (res as any).data || res;
    const data = raw.data || raw;
    const total = toNumber(data.total);
    const producto = toNumber(data.producto);
    const servicio = toNumber(data.servicio);
    const capacitacion = toNumber(data.capacitacion);

    const banner = document.getElementById('comercial-cotizaciones-pendientes-banner');
    if (!banner) return;

    if (total === 0) {
      banner.innerHTML = '';
      return;
    }

    const partes: string[] = [];
    if (servicio > 0) partes.push(`<strong>${servicio}</strong> de Servicio`);
    if (producto > 0) partes.push(`<strong>${producto}</strong> de Producto`);
    if (capacitacion > 0) partes.push(`<strong>${capacitacion}</strong> de Capacitación`);

    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;margin-bottom:20px;background:linear-gradient(135deg,#ecfdf5 0%,#a7f3d0 100%);border:1px solid #10b981;border-left:5px solid #059669;border-radius:10px;box-shadow:0 2px 8px rgba(5,150,105,.15);animation:bannerSlideIn .4s ease-out;">
        <div style="flex-shrink:0;width:44px;height:44px;background:#059669;border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="12" y1="12" x2="12" y2="18"></line></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:15px;color:#065f46;margin-bottom:2px;">Cotizaciones aceptadas pendientes</div>
          <div style="font-size:13px;color:#047857;">Tienes <strong>${total}</strong> cotización${total > 1 ? 'es' : ''} aceptada${total > 1 ? 's' : ''} sin orden generada: ${partes.join(', ')}.</div>
        </div>
        <button id="comercial-btn-ir-cotizaciones-pendientes" style="flex-shrink:0;padding:8px 18px;background:#059669;color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;transition:background .2s;white-space:nowrap;">Ir a Cotizaciones →</button>
      </div>
    `;

    document.getElementById('comercial-btn-ir-cotizaciones-pendientes')?.addEventListener('click', () => {
      const menuButton = document.querySelector('[data-menu="Comercial"]') as HTMLButtonElement | null;
      menuButton?.click();
      setTimeout(() => {
        const cotizacionesButton = document.querySelector('[data-submenu="Cotizaciones"]') as HTMLButtonElement | null;
        cotizacionesButton?.click();
      }, 0);
    });
  } catch (error) {
    console.error('Error cargando alerta de cotizaciones pendientes:', error);
  }
}

function getUltimasOrdenes(ordenesServicio: ComercialOrden[], ordenesProducto: ComercialOrden[], ordenesCapacitacion: ComercialOrden[], ordenesAsesoria: ComercialOrden[]) {
  return [
    ...ordenesServicio.map((orden) => ({ ...orden, tipoOrden: 'Servicio' })),
    ...ordenesProducto.map((orden) => ({ ...orden, tipoOrden: 'Producto' })),
    ...ordenesCapacitacion.map((orden) => ({ ...orden, tipoOrden: 'Capacitación' })),
    ...ordenesAsesoria.map((orden) => ({ ...orden, tipoOrden: 'Asesoría' })),
  ]
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
    .slice(0, 8);
}

function getOrdenesPorTipo(ordenesServicio: ComercialOrden[], ordenesProducto: ComercialOrden[], ordenesCapacitacion: ComercialOrden[], ordenesAsesoria: ComercialOrden[]) {
  return [
    { tipo: 'Servicio', total: ordenesServicio.length },
    { tipo: 'Producto', total: ordenesProducto.length },
    { tipo: 'Capacitación', total: ordenesCapacitacion.length },
    { tipo: 'Asesoría', total: ordenesAsesoria.length },
  ];
}

function getOrderDate(orden: ComercialOrden): string {
  return orden.fecha || '';
}

function getClienteFecha(cliente: Cliente): string {
  return cliente.fecha_registro || '';
}

function getClienteEstadoNormalizado(estado: string | undefined): 'Contactado' | 'Acepta' | 'No acepta' {
  const value = (estado || '').trim().toLowerCase();

  if (value.includes('no') && value.includes('acepta')) return 'No acepta';
  if (value.includes('rechaz')) return 'No acepta';
  if (value.includes('acepta')) return 'Acepta';
  if (value.includes('program')) return 'Contactado';
  if (value.includes('contact')) return 'Contactado';

  return 'Contactado';
}

function getClienteFechaNormalizada(cliente: Cliente): string {
  const fechaBruta = cliente.fecha_registro || (cliente as any).created_at || '';
  const fecha = new Date(fechaBruta);
  if (Number.isNaN(fecha.getTime())) return '';
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

function readComercialDashboardCache(): ComercialDashboardSourceData | null {
  try {
    const raw = sessionStorage.getItem(COMERCIAL_DASHBOARD_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ComercialDashboardCacheEntry;
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > COMERCIAL_DASHBOARD_CACHE_TTL_MS) {
      sessionStorage.removeItem(COMERCIAL_DASHBOARD_CACHE_KEY);
      return null;
    }

    return parsed.source;
  } catch {
    return null;
  }
}

function saveComercialDashboardCache(source: ComercialDashboardSourceData): void {
  try {
    const entry: ComercialDashboardCacheEntry = {
      timestamp: Date.now(),
      source,
    };
    sessionStorage.setItem(COMERCIAL_DASHBOARD_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore cache failures
  }
}

function getClientesPotencialesPorMes(clientes: Cliente[], range: ComercialDateRange) {
  const normalizado = normalizeRange(range);
  const filtrados = filterByRange(clientes, getClienteFecha, normalizado);
  const grouped = new Map<string, { Contactado: number; Acepta: number; 'No acepta': number }>();

  filtrados.forEach((cliente) => {
    const monthKey = getClienteFechaNormalizada(cliente);
    if (!monthKey) return;

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, { Contactado: 0, Acepta: 0, 'No acepta': 0 });
    }

    const bucket = grouped.get(monthKey)!;
    const estado = getClienteEstadoNormalizado(cliente.estado);
    bucket[estado] += 1;
  });

  const labels = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b)).map((key) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  });

  const keysSorted = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

  return {
    labels,
    contactado: keysSorted.map((key) => grouped.get(key)?.Contactado || 0),
    acepta: keysSorted.map((key) => grouped.get(key)?.Acepta || 0),
    noAcepta: keysSorted.map((key) => grouped.get(key)?.['No acepta'] || 0),
  };
}

function isDateInRange(value: string | undefined, range: ComercialDateRange): boolean {
  if (range.preset === 'all') return true;
  if (!value) return false;
  const date = new Date(value);
  const start = fromLocalDateInput(range.fechaDesde);
  const end = fromLocalDateInput(range.fechaHasta);
  if (!start || !end || Number.isNaN(date.getTime())) return false;
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return normalized >= start && normalized <= end;
}

function filterByRange<T>(items: T[], extractor: (item: T) => string, range: ComercialDateRange): T[] {
  if (range.preset === 'all') return items;
  return items.filter((item) => isDateInRange(extractor(item), range));
}

function computeCotizacionesStats(cotizaciones: Cotizacion[]) {
  const pendientes = cotizaciones.filter((cotizacion) => cotizacion.estado === 'Pendiente').length;
  const aceptadas = cotizaciones.filter((cotizacion) => cotizacion.estado === 'Aceptada').length;
  const rechazadas = cotizaciones.filter((cotizacion) => cotizacion.estado === 'Rechazada').length;
  const valorTotal = cotizaciones.reduce((acc, cotizacion) => acc + toNumber(cotizacion.total), 0);
  const valorPendiente = cotizaciones
    .filter((cotizacion) => cotizacion.estado === 'Pendiente')
    .reduce((acc, cotizacion) => acc + toNumber(cotizacion.total), 0);

  return {
    total: cotizaciones.length,
    pendientes,
    aceptadas,
    rechazadas,
    valor_total: valorTotal,
    valor_pendiente: valorPendiente,
  };
}

function computeClientesStats(clientes: Cliente[]) {
  const activos = clientes.filter((cliente) => cliente.estado === 'Acepta').length;
  const contactados = clientes.filter((cliente) => cliente.estado === 'Contactado').length;
  const rechazados = clientes.filter((cliente) => cliente.estado === 'No acepta').length;

  return {
    total: clientes.length,
    activos,
    contactados,
    rechazados,
  };
}

function computeOrdenesStats(ordenesServicio: ComercialOrden[], ordenesProducto: ComercialOrden[], ordenesCapacitacion: ComercialOrden[], ordenesAsesoria: ComercialOrden[]) {
  const todos = [...ordenesServicio, ...ordenesProducto, ...ordenesCapacitacion, ...ordenesAsesoria];
  const totalValor = todos.reduce((acc, orden) => acc + toNumber(orden.total), 0);

  return {
    total: todos.length,
    totalValor,
    porTipo: getOrdenesPorTipo(ordenesServicio, ordenesProducto, ordenesCapacitacion, ordenesAsesoria),
  };
}

function buildDashboardData(source: ComercialDashboardSourceData, range: ComercialDateRange): ComercialDashboardData {
  const normalizedRange = normalizeRange(range);
  const cotizaciones = filterByRange(source.cotizaciones, (cotizacion) => cotizacion.fecha_emision, normalizedRange);
  const clientes = filterByRange(source.clientes, getClienteFecha, normalizedRange);
  const ordenesServicio = filterByRange(source.ordenesServicio, getOrderDate, normalizedRange);
  const ordenesProducto = filterByRange(source.ordenesProducto, getOrderDate, normalizedRange);
  const ordenesCapacitacion = filterByRange(source.ordenesCapacitacion, getOrderDate, normalizedRange);
  const ordenesAsesoria = filterByRange(source.ordenesAsesoria, getOrderDate, normalizedRange);

  return {
    cotizaciones,
    estadisticasCotizaciones: computeCotizacionesStats(cotizaciones),
    clientes: computeClientesStats(clientes),
    ordenesServicio,
    ordenesProducto,
    ordenesCapacitacion,
    ordenesAsesoria,
    estadisticasOrdenes: computeOrdenesStats(ordenesServicio, ordenesProducto, ordenesCapacitacion, ordenesAsesoria),
  };
}

function getTendenciaCotizaciones(cotizaciones: Cotizacion[]) {
  const now = new Date();
  const labels: string[] = [];
  const total: number[] = [];
  const aceptadas: number[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    labels.push(date.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }));
    const porMes = cotizaciones.filter((cotizacion) => {
      const cotizacionDate = new Date(cotizacion.fecha_emision);
      if (Number.isNaN(cotizacionDate.getTime())) return false;
      const cotKey = `${cotizacionDate.getFullYear()}-${String(cotizacionDate.getMonth() + 1).padStart(2, '0')}`;
      return cotKey === key;
    });
    total.push(porMes.length);
    aceptadas.push(porMes.filter((cotizacion) => cotizacion.estado === 'Aceptada').length);
  }

  return { labels, total, aceptadas };
}

function safeLoad<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return promise.catch((error) => {
    console.error('Error cargando dashboard comercial:', error);
    return fallback;
  });
}

async function loadDashboardData(): Promise<ComercialDashboardData> {
  const cached = readComercialDashboardCache();
  if (cached) {
    dashboardSource = cached;
    return buildDashboardData(cached, dashboardRange);
  }

  const [cotizacionesRes, clientesRes, ordServRes, ordProdRes, ordCapRes, ordAsesRes] = await Promise.all([
    safeLoad(cotizacionService.getAll(), { success: true, data: [] } as any),
    safeLoad(clienteService.getAll({ per_page: 500 } as any), { success: true, data: [] } as any),
    safeLoad(ordenServicioService.getAll(), { success: true, data: [] } as any),
    safeLoad(ordenProductoService.getAll(), { success: true, data: [] } as any),
    safeLoad(ordenCapacitacionService.getAll(), { success: true, data: [] } as any),
    safeLoad(ordenAsesoriaService.getAll(), { success: true, data: [] } as any),
  ]);

  const source: ComercialDashboardSourceData = {
    cotizaciones: unwrapArray<Cotizacion>(cotizacionesRes),
    clientes: unwrapArray<Cliente>(clientesRes),
    ordenesServicio: unwrapArray<ComercialOrdenApi>(ordServRes).map((orden) => normalizeOrden(orden, 'Servicio')),
    ordenesProducto: unwrapArray<ComercialOrdenApi>(ordProdRes).map((orden) => normalizeOrden(orden, 'Producto')),
    ordenesCapacitacion: unwrapArray<ComercialOrdenApi>(ordCapRes).map((orden) => normalizeOrden(orden, 'Capacitación')),
    ordenesAsesoria: unwrapArray<ComercialOrdenApi>(ordAsesRes).map((orden) => normalizeOrden(orden, 'Asesoría')),
  };

  dashboardSource = source;
  saveComercialDashboardCache(source);
  return buildDashboardData(source, dashboardRange);
}

function updateStat(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderMetrics(data: ComercialDashboardData): void {
  const cotizaciones = data.estadisticasCotizaciones;
  updateStat('comercial-stat-total-cotizaciones', new Intl.NumberFormat('es-PE').format(cotizaciones.total || 0));
  updateStat('comercial-stat-pendientes', new Intl.NumberFormat('es-PE').format(cotizaciones.pendientes || 0));
  updateStat('comercial-stat-aceptadas', new Intl.NumberFormat('es-PE').format(cotizaciones.aceptadas || 0));
  updateStat('comercial-stat-valor-cotizado', formatCurrency(toNumber(cotizaciones.valor_total)));
  updateStat('comercial-stat-clientes', new Intl.NumberFormat('es-PE').format(data.clientes.total || 0));
  updateStat('comercial-stat-ordenes', new Intl.NumberFormat('es-PE').format(data.estadisticasOrdenes.total || 0));
  const tasa = cotizaciones.total > 0 ? Math.round(((cotizaciones.aceptadas || 0) / cotizaciones.total) * 100) : 0;
  updateStat('comercial-stat-tasa', `${tasa}%`);
  updateStat('comercial-stat-valor-ordenes', formatCurrency(toNumber(data.estadisticasOrdenes.totalValor)));
  updateStat('comercial-stat-clientes-activos', new Intl.NumberFormat('es-PE').format(data.clientes.activos || 0));
  updateStat('comercial-stat-contactados', new Intl.NumberFormat('es-PE').format(data.clientes.contactados || 0));
}

function renderCharts(data: ComercialDashboardData): void {
  destroyCharts();

  const tendencia = getTendenciaCotizaciones(data.cotizaciones);
  const porTipo = getCotizacionesPorTipo(data.cotizaciones);
  const porCliente = getResumenClientesPorCotizacion(data.cotizaciones);
  const ordenesPorTipo = data.estadisticasOrdenes.porTipo;
  const prospectosPorMes = getClientesPotencialesPorMes(dashboardSource?.clientes || [], dashboardRange);

  createOrReplaceChart('comercial-chart-estados', {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Aceptadas', 'Rechazadas'],
      datasets: [{
        data: [data.estadisticasCotizaciones.pendientes, data.estadisticasCotizaciones.aceptadas, data.estadisticasCotizaciones.rechazadas],
        backgroundColor: ['#FEE685', '#7BF1A8', '#FFA2A2'],
        borderColor: ['#f59e0b', '#16a34a', '#dc2626'],
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

  createOrReplaceChart('comercial-chart-tendencia', {
    type: 'line',
    data: {
      labels: tendencia.labels,
      datasets: [
        {
          label: 'Cotizaciones',
          data: tendencia.total,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
        {
          label: 'Aceptadas',
          data: tendencia.aceptadas,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
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

  createOrReplaceChart('comercial-chart-tipos', {
    type: 'bar',
    data: {
      labels: porTipo.map((item) => item.tipo),
      datasets: [{
        label: 'Cotizaciones',
        data: porTipo.map((item) => item.total),
        backgroundColor: ['#A684FF', '#53EAFD', '#F4A8FF', '#8EC5FF'],
        borderColor: ['#7c3aed', '#0891b2', '#db2777', '#2563eb'],
        borderWidth: 2,
        borderRadius: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } }, x: { grid: { display: false } } },
    },
  });

  createOrReplaceChart('comercial-chart-clientes', {
    type: 'bar',
    data: {
      labels: porCliente.map((item) => item.nombre),
      datasets: [{
        label: 'Valor cotizado',
        data: porCliente.map((item) => item.totalValor),
        backgroundColor: '#0f766e',
        borderColor: '#0f5f58',
        borderWidth: 2,
        borderRadius: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, grid: { color: '#e2e8f0' } }, y: { grid: { display: false } } },
    },
  });

  createOrReplaceChart('comercial-chart-ordenes', {
    type: 'doughnut',
    data: {
      labels: ordenesPorTipo.map((item) => item.tipo),
      datasets: [{
        data: ordenesPorTipo.map((item) => item.total),
        backgroundColor: ['#8EC5FF', '#A684FF', '#53EAFD', '#F4A8FF'],
        borderColor: ['#2563eb', '#7c3aed', '#0891b2', '#db2777'],
        borderWidth: 3,
        borderAlign: 'center',
        spacing: 2,
        offset: [4, 4, 4, 4],
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

  createOrReplaceChart('comercial-chart-prospectos', {
    type: 'bar',
    data: {
      labels: prospectosPorMes.labels,
      datasets: [
        {
          label: 'Contactado',
          data: prospectosPorMes.contactado,
          backgroundColor: '#8EC5FF',
          borderColor: '#2563eb',
          borderWidth: 2,
          borderRadius: 8,
          stack: 'prospectos',
        },
        {
          label: 'Acepta',
          data: prospectosPorMes.acepta,
          backgroundColor: '#7BF1A8',
          borderColor: '#16a34a',
          borderWidth: 2,
          borderRadius: 8,
          stack: 'prospectos',
        },
        {
          label: 'No acepta',
          data: prospectosPorMes.noAcepta,
          backgroundColor: '#FEE685',
          borderColor: '#f59e0b',
          borderWidth: 2,
          borderRadius: 8,
          stack: 'prospectos',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
      },
    },
  });
}

function renderLists(data: ComercialDashboardData): void {
  const cotizacionesBody = document.getElementById('comercial-cotizaciones-body');
  const ordenesBody = document.getElementById('comercial-ordenes-body');
  const alertasBody = document.getElementById('comercial-alertas-body');

  if (cotizacionesBody) {
    const recientes = [...data.cotizaciones].sort((a, b) => (b.fecha_emision || '').localeCompare(a.fecha_emision || '')).slice(0, 6);
    cotizacionesBody.innerHTML = recientes.length > 0
      ? recientes.map((cotizacion) => `
        <tr>
          <td>${cotizacion.numero || '—'}</td>
          <td>${cotizacion.cliente_nombre || '—'}</td>
          <td>${formatDate(cotizacion.fecha_emision)}</td>
          <td>${cotizacion.tipo || '—'}</td>
          <td>${formatCurrency(toNumber(cotizacion.total))}</td>
          <td><span class="status-indicator ${cotizacion.estado === 'Aceptada' ? 'success' : cotizacion.estado === 'Rechazada' ? 'danger' : 'warning'}">${cotizacion.estado || '—'}</span></td>
        </tr>
      `).join('')
      : '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">No hay cotizaciones registradas.</td></tr>';
  }

  if (ordenesBody) {
    const recientes = getUltimasOrdenes(data.ordenesServicio, data.ordenesProducto, data.ordenesCapacitacion, data.ordenesAsesoria);
    ordenesBody.innerHTML = recientes.length > 0
      ? recientes.map((orden) => `
        <tr>
          <td>${orden.numero || '—'}</td>
          <td>${orden.cliente_nombre || '—'}</td>
          <td>${orden.tipoOrden || orden.tipo || '—'}</td>
          <td>${formatDate(orden.fecha)}</td>
          <td>${formatCurrency(toNumber(orden.total))}</td>
          <td><span class="status-indicator ${(orden.estado || '').toLowerCase().includes('complet') || (orden.estado || '').toLowerCase().includes('entreg') || (orden.estado || '').toLowerCase().includes('aprob') || (orden.estado || '').toLowerCase().includes('acept') ? 'success' : (orden.estado || '').toLowerCase().includes('cancel') || (orden.estado || '').toLowerCase().includes('rechaz') || (orden.estado || '').toLowerCase().includes('anulad') ? 'danger' : 'warning'}">${orden.estado || '—'}</span></td>
        </tr>
      `).join('')
      : '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">No hay órdenes registradas.</td></tr>';
  }

  if (alertasBody) {
    const alertas: string[] = [];
    if (data.estadisticasCotizaciones.pendientes > 0) {
      alertas.push(`${data.estadisticasCotizaciones.pendientes} cotizaciones siguen pendientes de seguimiento.`);
    }
    if (data.estadisticasCotizaciones.rechazadas > 0) {
      alertas.push(`${data.estadisticasCotizaciones.rechazadas} cotizaciones fueron rechazadas en el periodo.`);
    }
    if (data.estadisticasOrdenes.total === 0) {
      alertas.push('Aún no hay órdenes registradas para este periodo comercial.');
    }
    if (data.clientes.contactados > 0) {
      alertas.push(`${data.clientes.contactados} clientes permanecen en estado contactado.`);
    }

    alertasBody.innerHTML = alertas.length > 0
      ? alertas.map((alerta) => `<li>${alerta}</li>`).join('')
      : '<li>Sin alertas críticas por ahora.</li>';
  }
}

function syncRangeControls(): void {
  const desde = document.getElementById('comercial-fecha-desde') as HTMLInputElement | null;
  const hasta = document.getElementById('comercial-fecha-hasta') as HTMLInputElement | null;
  if (desde) desde.value = dashboardRange.preset === 'all' ? '' : dashboardRange.fechaDesde;
  if (hasta) hasta.value = dashboardRange.preset === 'all' ? '' : dashboardRange.fechaHasta;

  document.querySelectorAll('[data-range-preset]').forEach((button) => {
    const target = button as HTMLButtonElement;
    target.dataset.active = target.dataset.rangePreset === dashboardRange.preset ? 'true' : 'false';
  });
}

function applyDashboardRange(range: ComercialDateRange): void {
  dashboardRange = normalizeRange(range);
  syncRangeControls();

  if (!dashboardSource) return;
  const data = buildDashboardData(dashboardSource, dashboardRange);
  renderMetrics(data);
  renderCharts(data);
  renderLists(data);
}

async function refreshDashboard(): Promise<void> {
  if (isLoading) return;
  isLoading = true;
  const root = document.getElementById('comercial-dashboard-root');
  if (root) root.dataset.loading = 'true';

  try {
    const data = await loadDashboardData();
    renderMetrics(data);
    renderCharts(data);
    renderLists(data);
    syncRangeControls();
    await renderCotizacionesPendientesBanner();
  } finally {
    isLoading = false;
    if (root) root.dataset.loading = 'false';
  }
}

export function renderComercialDashboard() {
  return `
    <div id="comercial-dashboard-root" class="comercial-dashboard-shell">
      <div class="page-header-with-breadcrumb">
        <div>
          <h1 style="margin:6px 0 0; font-size:28px; color:#0f172a;">Dashboard del Área Comercial</h1>
          <p style="margin:6px 0 0; color:#64748b;">Los KPI, gráficas y tablas se recalculan según el rango de fechas activo.</p>
        </div>
        <div class="page-actions">
          <button class="btn-secondary" id="comercial-btn-refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 11a8 8 0 1 0-2.34 5.66"></path><polyline points="20 3 20 11 12 11"></polyline></svg>
            Actualizar
          </button>
          <button class="btn-secondary" id="comercial-btn-go-cotizaciones">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Ir a Cotizaciones
          </button>
        </div>
      </div>

      <div id="comercial-cotizaciones-pendientes-banner"></div>

      <section style="margin-bottom: 20px; background:#fff; border:1px solid #e5e7eb; border-radius:18px; padding:16px 20px; box-shadow:0 8px 30px rgba(15,23,42,.05);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap;">
          <div>
            <h3 style="margin:0; font-size:18px; font-weight:700; color:#0f172a;">Filtro por fechas</h3>
            <p style="margin:4px 0 0; color:#64748b; font-size:13px;">Ajusta el rango para ver actividad comercial relevante por periodo.</p>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button class="btn-secondary" type="button" data-range-preset="today" style="padding:8px 14px;">Hoy</button>
            <button class="btn-secondary" type="button" data-range-preset="7d" style="padding:8px 14px;">7 días</button>
            <button class="btn-secondary" type="button" data-range-preset="30d" style="padding:8px 14px;">30 días</button>
            <button class="btn-secondary" type="button" data-range-preset="month" style="padding:8px 14px;">Mes actual</button>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap:12px; margin-top:16px; align-items:end;">
          <div style="grid-column:span 3; min-width:0;">
            <label style="display:block; margin-bottom:6px; color:#334155; font-size:13px; font-weight:600;">Desde</label>
            <input type="date" id="comercial-fecha-desde" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:10px; padding:0 12px; font-size:14px; color:#0f172a; background:#fff;">
          </div>
          <div style="grid-column:span 3; min-width:0;">
            <label style="display:block; margin-bottom:6px; color:#334155; font-size:13px; font-weight:600;">Hasta</label>
            <input type="date" id="comercial-fecha-hasta" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:10px; padding:0 12px; font-size:14px; color:#0f172a; background:#fff;">
          </div>
          <div style="grid-column:span 6; display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn-primary" type="button" id="comercial-btn-aplicar-rango" style="height:40px;">Aplicar rango</button>
            <button class="btn-secondary" type="button" id="comercial-btn-limpiar-rango" style="height:40px;">Limpiar</button>
          </div>
        </div>
      </section>

      <div class="stats-row" style="margin-bottom: 24px;">
        <div class="stat-box"><div class="stat-box-icon blue"></div><div class="stat-box-content"><div class="stat-box-label">Cotizaciones</div><div class="stat-box-value" id="comercial-stat-total-cotizaciones">0</div></div></div>
        <div class="stat-box"><div class="stat-box-icon orange"></div><div class="stat-box-content"><div class="stat-box-label">Pendientes</div><div class="stat-box-value" id="comercial-stat-pendientes">0</div></div></div>
        <div class="stat-box"><div class="stat-box-icon green"></div><div class="stat-box-content"><div class="stat-box-label">Aceptadas</div><div class="stat-box-value" id="comercial-stat-aceptadas">0</div></div></div>
        <div class="stat-box"><div class="stat-box-icon blue"></div><div class="stat-box-content"><div class="stat-box-label">Valor Cotizado</div><div class="stat-box-value" id="comercial-stat-valor-cotizado">S/ 0.00</div></div></div>
        <div class="stat-box"><div class="stat-box-icon green"></div><div class="stat-box-content"><div class="stat-box-label">Clientes</div><div class="stat-box-value" id="comercial-stat-clientes">0</div></div></div>
        <div class="stat-box"><div class="stat-box-icon"></div><div class="stat-box-content"><div class="stat-box-label">Órdenes</div><div class="stat-box-value" id="comercial-stat-ordenes">0</div></div></div>
      </div>

      <div class="stats-row" style="margin-bottom: 24px;">
        <div class="stat-box"><div class="stat-box-icon orange"></div><div class="stat-box-content"><div class="stat-box-label">Tasa de Cierre</div><div class="stat-box-value" id="comercial-stat-tasa">0%</div></div></div>
        <div class="stat-box"><div class="stat-box-icon blue"></div><div class="stat-box-content"><div class="stat-box-label">Valor Órdenes</div><div class="stat-box-value" id="comercial-stat-valor-ordenes">S/ 0.00</div></div></div>
        <div class="stat-box"><div class="stat-box-icon green"></div><div class="stat-box-content"><div class="stat-box-label">Clientes Activos</div><div class="stat-box-value" id="comercial-stat-clientes-activos">0</div></div></div>
        <div class="stat-box"><div class="stat-box-icon"></div><div class="stat-box-content"><div class="stat-box-label">Contactados</div><div class="stat-box-value" id="comercial-stat-contactados">0</div></div></div>
      </div>

      <div class="dashboard-grid" style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px;align-items:start;">
        <section style="grid-column:span 5;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Estado de cotizaciones</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Pendientes, aceptadas y rechazadas.</p></div></div><div style="height:280px;"><canvas id="comercial-chart-estados"></canvas></div></section>
        <section style="grid-column:span 7;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Tendencia comercial</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Cotizaciones emitidas vs aceptadas por mes.</p></div></div><div style="height:280px;"><canvas id="comercial-chart-tendencia"></canvas></div></section>
        <section style="grid-column:span 6;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Cotizaciones por tipo</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Servicio, producto, capacitación y asesoría.</p></div></div><div style="height:280px;"><canvas id="comercial-chart-tipos"></canvas></div></section>
        <section style="grid-column:span 6;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Top clientes</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Clientes con mayor valor cotizado.</p></div></div><div style="height:280px;"><canvas id="comercial-chart-clientes"></canvas></div></section>
        <section style="grid-column:span 5;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Órdenes por tipo</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Servicio, producto, capacitación y asesoría.</p></div></div><div style="height:280px;"><canvas id="comercial-chart-ordenes"></canvas></div></section>
        <section style="grid-column:span 7;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Clientes potenciales por mes</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Distribución mensual por estados contactado, acepta y no acepta.</p></div></div><div style="height:320px;"><canvas id="comercial-chart-prospectos"></canvas></div></section>
        <section style="grid-column:span 7;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Cotizaciones recientes</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Últimos registros comerciales emitidos.</p></div></div><div class="table-container"><table class="data-table"><thead><tr><th>NÚMERO</th><th>CLIENTE</th><th>FECHA</th><th>TIPO</th><th>TOTAL</th><th>ESTADO</th></tr></thead><tbody id="comercial-cotizaciones-body"><tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">Cargando cotizaciones...</td></tr></tbody></table></div></section>
        <section style="grid-column:span 5;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Alertas comerciales</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Puntos que requieren seguimiento.</p></div></div><ul id="comercial-alertas-body" style="margin:0;padding-left:18px;color:#334155;display:flex;flex-direction:column;gap:10px;line-height:1.45;"><li>Cargando alertas...</li></ul></section>
        <section style="grid-column:span 12;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Órdenes recientes</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Actividad de servicio, producto, capacitación y asesoría.</p></div></div><div class="table-container"><table class="data-table"><thead><tr><th>NÚMERO</th><th>CLIENTE</th><th>TIPO</th><th>FECHA</th><th>TOTAL</th><th>ESTADO</th></tr></thead><tbody id="comercial-ordenes-body"><tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">Cargando órdenes...</td></tr></tbody></table></div></section>
      </div>
    </div>
  `;
}

export function initComercialDashboardEvents() {
  syncRangeControls();

  document.getElementById('comercial-btn-refresh')?.addEventListener('click', () => {
    void refreshDashboard();
  });

  document.querySelectorAll('[data-range-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = (button as HTMLButtonElement).dataset.rangePreset as ComercialDateRangePreset | undefined;
      if (!preset) return;
      dashboardRange = getRangeForPreset(preset);
      applyDashboardRange(dashboardRange);
    });
  });

  document.getElementById('comercial-btn-aplicar-rango')?.addEventListener('click', () => {
    const fechaDesde = (document.getElementById('comercial-fecha-desde') as HTMLInputElement | null)?.value || dashboardRange.fechaDesde;
    const fechaHasta = (document.getElementById('comercial-fecha-hasta') as HTMLInputElement | null)?.value || dashboardRange.fechaHasta;
    applyDashboardRange({ preset: 'custom', fechaDesde, fechaHasta });
  });

  document.getElementById('comercial-btn-limpiar-rango')?.addEventListener('click', () => {
    dashboardRange = { preset: 'all', fechaDesde: '', fechaHasta: '' };
    applyDashboardRange(dashboardRange);
  });

  document.getElementById('comercial-fecha-desde')?.addEventListener('change', () => {
    dashboardRange = {
      ...dashboardRange,
      preset: 'custom',
      fechaDesde: (document.getElementById('comercial-fecha-desde') as HTMLInputElement | null)?.value || dashboardRange.fechaDesde,
    };
    syncRangeControls();
  });

  document.getElementById('comercial-fecha-hasta')?.addEventListener('change', () => {
    dashboardRange = {
      ...dashboardRange,
      preset: 'custom',
      fechaHasta: (document.getElementById('comercial-fecha-hasta') as HTMLInputElement | null)?.value || dashboardRange.fechaHasta,
    };
    syncRangeControls();
  });

  document.getElementById('comercial-btn-go-cotizaciones')?.addEventListener('click', () => {
    const menuButton = document.querySelector('[data-menu="Comercial"]') as HTMLButtonElement | null;
    menuButton?.click();
    setTimeout(() => {
      const cotizacionesButton = document.querySelector('[data-submenu="Cotizaciones"]') as HTMLButtonElement | null;
      cotizacionesButton?.click();
    }, 0);
  });

  void refreshDashboard();
}