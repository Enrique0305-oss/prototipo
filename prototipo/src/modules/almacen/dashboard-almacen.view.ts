import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration, ChartType } from 'chart.js';
import { almacenService } from './almacen.service';
import { mantenimientoService } from '../../services/mantenimientoService';
import type { EstadoEquiposOperativo, EstadisticasInventario, EstadisticasMovimientos, Movimiento, Producto, Proveedor } from './almacen.types';

Chart.register(...registerables);

type DateRangePreset = 'today' | '7d' | '30d' | 'month' | 'custom';

type DashboardRange = {
  preset: DateRangePreset;
  fechaDesde: string;
  fechaHasta: string;
};

type DashboardData = {
  inventario: EstadisticasInventario;
  movimientos: EstadisticasMovimientos;
  productos: Producto[];
  kardex: Movimiento[];
  estadoEquipos: EstadoEquiposOperativo;
  proveedores: Proveedor[];
};

const chartInstances: Chart[] = [];
let dashboardLoading = false;
let dashboardRange: DashboardRange = getDefaultDashboardRange();

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

function getDefaultDashboardRange(): DashboardRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    preset: 'month',
    fechaDesde: toLocalDateInput(start),
    fechaHasta: toLocalDateInput(today),
  };
}

function getRangeForPreset(preset: DateRangePreset): DashboardRange {
  const today = new Date();

  if (preset === 'custom') {
    return dashboardRange;
  }

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

function normalizeRange(range: DashboardRange): DashboardRange {
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

function destroyCharts() {
  while (chartInstances.length > 0) {
    const chart = chartInstances.pop();
    chart?.destroy();
  }
}

function updateStat(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function createOrReplaceChart(
  canvasId: string,
  config: ChartConfiguration<ChartType, number[], string>,
): void {
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

function getMovementCounts(kardex: Movimiento[]) {
  const counts = { Entrada: 0, Salida: 0 };
  kardex.forEach((movement) => {
    if (movement.tipo === 'Entrada') counts.Entrada += 1;
    if (movement.tipo === 'Salida') counts.Salida += 1;
  });
  return counts;
}

function countUniqueProducts(kardex: Movimiento[]): number {
  return new Set(kardex.map((movement) => movement.id_producto).filter((value) => Number.isFinite(value))).size;
}

function getTrendByRange(kardex: Movimiento[], startInput: string, endInput: string) {
  const start = fromLocalDateInput(startInput);
  const end = fromLocalDateInput(endInput);

  if (!start || !end) {
    return { labels: [], counts: [] };
  }

  const days = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);

  if (days <= 31) {
    const labels: string[] = [];
    const counts: number[] = [];

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      const key = toLocalDateInput(date);
      labels.push(date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }));
      counts.push(kardex.filter((movement) => (movement.fecha || '').slice(0, 10) === key).length);
    }

    return { labels, counts };
  }

  const weeks = new Map<string, number>();
  kardex.forEach((movement) => {
    const movementDate = fromLocalDateInput((movement.fecha || '').slice(0, 10));
    if (!movementDate || movementDate < start || movementDate > end) return;
    const weekStart = new Date(movementDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    const key = toLocalDateInput(weekStart);
    weeks.set(key, (weeks.get(key) || 0) + 1);
  });

  const orderedWeeks = Array.from(weeks.entries()).sort(([a], [b]) => a.localeCompare(b));
  return {
    labels: orderedWeeks.map(([week]) => {
      const date = fromLocalDateInput(week);
      return date ? date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : week;
    }),
    counts: orderedWeeks.map(([, total]) => total),
  };
}

function buildMovementSummary(kardex: Movimiento[]): EstadisticasMovimientos {
  const counts = getMovementCounts(kardex);
  const now = toLocalDateInput(new Date());
  const movimientosHoy = kardex.filter((movement) => (movement.fecha || '').slice(0, 10) === now).length;

  return {
    entradas_mes: counts.Entrada,
    salidas_mes: counts.Salida,
    total_movimientos: kardex.length,
    movimientos_hoy: movimientosHoy,
    productos_con_movimiento_mes: countUniqueProducts(kardex),
  };
}

function getCategorySummary(productos: Producto[]) {
  const map = new Map<string, { stock: number; valor: number; items: number }>();

  productos.forEach((producto) => {
    const category = producto.categoria || 'Sin categoría';
    const current = map.get(category) || { stock: 0, valor: 0, items: 0 };
    current.stock += toNumber(producto.stock);
    current.valor += toNumber(producto.valor_total);
    current.items += 1;
    map.set(category, current);
  });

  return Array.from(map.entries())
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 6);
}

function getEquipmentSummary(estadoEquipos: EstadoEquiposOperativo) {
  return [
    { label: 'Al día', value: toNumber(estadoEquipos.al_dia) },
    { label: 'Próximo', value: toNumber(estadoEquipos.proximo) },
    { label: 'Vencido', value: toNumber(estadoEquipos.vencido) },
  ];
}

function getSupplierSummary(proveedores: Proveedor[]) {
  return proveedores
    .map((proveedor) => ({
      label: proveedor.razon_social,
      value: toNumber(proveedor.total_compras),
      last: proveedor.ultima_compra,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function getAlertas(data: DashboardData) {
  const alertas: string[] = [];
  const movimientosHoy = data.movimientos.movimientos_hoy ?? 0;

  if (data.inventario.productos_bajo_stock > 0) {
    alertas.push(`${data.inventario.productos_bajo_stock} productos están bajo stock.`);
  }

  const vencidos = data.estadoEquipos.vencido;
  if (vencidos > 0) {
    alertas.push(`${vencidos} equipos requieren mantenimiento inmediato.`);
  }

  const proximos = data.estadoEquipos.proximo;
  if (proximos > 0) {
    alertas.push(`${proximos} equipos tienen mantenimiento próximo.`);
  }

  if (movimientosHoy > 0) {
    alertas.push(`${movimientosHoy} movimientos se registraron hoy.`);
  }

  return alertas;
}

function renderAlmacenStockBanner(stockBajo: number): void {
  const banner = document.getElementById('almacen-stock-bajo-banner');
  if (!banner) return;

  if (stockBajo <= 0) {
    banner.innerHTML = '';
    return;
  }

  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;margin-bottom:16px;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border:1px solid #f59e0b;border-left:5px solid #d97706;border-radius:10px;box-shadow:0 2px 8px rgba(217,119,6,.15);animation:bannerSlideIn .4s ease-out;">
      <div style="flex-shrink:0;width:44px;height:44px;background:#d97706;border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:15px;color:#92400e;margin-bottom:2px;">Alerta de Stock Bajo</div>
        <div style="font-size:13px;color:#78350f;">Tienes <strong>${stockBajo} producto${stockBajo > 1 ? 's' : ''}</strong> con stock por debajo del nivel de seguridad. Revisa el inventario para reabastecer a tiempo.</div>
      </div>
      <button id="almacen-btn-ir-inventario-banner" style="flex-shrink:0;padding:8px 18px;background:#d97706;color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;transition:background .2s;white-space:nowrap;">Ir a Inventario →</button>
    </div>
  `;

  document.getElementById('almacen-btn-ir-inventario-banner')?.addEventListener('click', () => {
    const almacenBtn = document.querySelector('[data-menu="Almacén"]') as HTMLButtonElement | null;
    almacenBtn?.click();
    setTimeout(() => {
      const inventarioBtn = document.querySelector('[data-submenu="Inventario"]') as HTMLButtonElement | null;
      inventarioBtn?.click();
    }, 100);
  });
}

async function renderAlmacenMantenimientoBanner(): Promise<void> {
  try {
    const resp = await mantenimientoService.getAlertasMantenimiento();
    const data = (resp as any).data || resp;
    const totalAlertas = Number(data.total_alertas || 0);
    const proximos = Number(data.proximos || 0);
    const vencidos = Number(data.vencidos || 0);
    const alertas: Array<{ tipo: 'proximo' | 'vencido'; equipo: string; fecha: string; tiempo_texto: string; es_prueba: boolean; }> = data.alertas || [];

    const banner = document.getElementById('almacen-mantenimiento-banner');
    if (!banner) return;

    if (totalAlertas === 0) {
      banner.innerHTML = '';
      return;
    }

    const hayVencidos = vencidos > 0;
    const colorPrimario = hayVencidos ? '#dc2626' : '#2563eb';
    const colorFondo = hayVencidos ? 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)';
    const colorBorde = hayVencidos ? '#dc2626' : '#2563eb';
    const colorTexto = hayVencidos ? '#991b1b' : '#1e40af';
    const colorTextoSub = hayVencidos ? '#b91c1c' : '#1d4ed8';

    const itemsHTML = alertas.slice(0, 5).map((alerta) => {
      const iconColor = alerta.tipo === 'vencido' ? '#dc2626' : '#f59e0b';
      const icon = alerta.tipo === 'vencido'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
      const badgeColor = alerta.tipo === 'vencido' ? 'background:#fee2e2;color:#991b1b;' : 'background:#fef3c7;color:#92400e;';
      const pruebaBadge = alerta.es_prueba ? '<span style="font-size:9px;padding:1px 4px;border-radius:4px;background:#e0e7ff;color:#3730a3;margin-left:4px;">TEST</span>' : '';

      return `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(255,255,255,.6);border-radius:6px;font-size:12px;">
          <span style="color:${iconColor};flex-shrink:0;">${icon}</span>
          <strong style="color:#1e293b;">${alerta.equipo}</strong>${pruebaBadge}
          <span style="color:#64748b;">—</span>
          <span style="padding:2px 6px;border-radius:4px;font-size:11px;${badgeColor}">${alerta.tipo === 'vencido' ? 'Vencido' : 'Próximo'}</span>
          <span style="color:#64748b;font-size:11px;margin-left:auto;">${alerta.tiempo_texto}</span>
        </div>
      `;
    }).join('');

    const resumenTexto = [];
    if (proximos > 0) resumenTexto.push(`<strong>${proximos}</strong> próximo${proximos > 1 ? 's' : ''}`);
    if (vencidos > 0) resumenTexto.push(`<strong>${vencidos}</strong> vencido${vencidos > 1 ? 's' : ''}`);

    banner.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 20px;margin-bottom:16px;background:${colorFondo};border:1px solid ${colorBorde};border-left:5px solid ${colorPrimario};border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.08);animation:bannerSlideIn .4s ease-out;">
        <div style="flex-shrink:0;width:44px;height:44px;background:${colorPrimario};border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:15px;color:${colorTexto};margin-bottom:4px;">${hayVencidos ? 'Mantenimientos Vencidos' : 'Mantenimientos Próximos'}</div>
          <div style="font-size:13px;color:${colorTextoSub};margin-bottom:8px;">Tienes ${resumenTexto.join(' y ')} mantenimiento${totalAlertas > 1 ? 's' : ''} que requieren atención.</div>
          <div style="display:flex;flex-direction:column;gap:4px;">${itemsHTML}</div>
        </div>
        <button id="almacen-btn-ir-mantenimiento-banner" style="flex-shrink:0;padding:8px 18px;background:${colorPrimario};color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;transition:background .2s;white-space:nowrap;">Ir a Mantenimiento →</button>
      </div>
    `;

    document.getElementById('almacen-btn-ir-mantenimiento-banner')?.addEventListener('click', () => {
      const almacenBtn = document.querySelector('[data-menu="Almacén"]') as HTMLButtonElement | null;
      almacenBtn?.click();
      setTimeout(() => {
        const mantBtn = document.querySelector('[data-submenu="Mantenimiento"]') as HTMLButtonElement | null;
        mantBtn?.click();
        setTimeout(() => {
          const progTab = document.querySelector('[data-tab="programacion-anual"]') as HTMLButtonElement | null;
          progTab?.click();
        }, 200);
      }, 100);
    });
  } catch (error) {
    console.error('Error cargando alerta de mantenimientos en almacén:', error);
  }
}

async function renderAlmacenNotifications(data: DashboardData): Promise<void> {
  renderAlmacenStockBanner(data.inventario.productos_bajo_stock || 0);
  await renderAlmacenMantenimientoBanner();
}

async function safeLoad<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('Error cargando dashboard de almacén:', error);
    return fallback;
  }
}

async function loadDashboardData(range: DashboardRange): Promise<DashboardData> {
  const filtrosMovimiento = {
    fecha_inicio: range.fechaDesde,
    fecha_fin: range.fechaHasta,
  };

  const [inventario, productos, kardex, estadoEquipos, proveedores] = await Promise.all([
    safeLoad(almacenService.getEstadisticasInventario(), {
      stock_total: 0,
      valor_total: 0,
      productos_bajo_stock: 0,
      categorias: 0,
    }),
    safeLoad(almacenService.getProductos({}), [] as Producto[]),
    safeLoad(almacenService.getMovimientos(filtrosMovimiento), [] as Movimiento[]),
    safeLoad(almacenService.getEstadoEquiposOperativo(), {
      total_equipos: 0,
      al_dia: 0,
      proximo: 0,
      vencido: 0,
      pendientes: 0,
      realizados: 0,
    } as EstadoEquiposOperativo),
    safeLoad(almacenService.getProveedores({}), [] as Proveedor[]),
  ]);

  const movimientos = buildMovementSummary(kardex);

  return {
    inventario,
    movimientos,
    productos,
    kardex,
    estadoEquipos,
    proveedores,
  };
}

function renderCharts(data: DashboardData): void {
  destroyCharts();

  const movementCounts = getMovementCounts(data.kardex);
  const weeklyTrend = getTrendByRange(data.kardex, dashboardRange.fechaDesde, dashboardRange.fechaHasta);
  const categorySummary = getCategorySummary(data.productos);
  const equipmentSummary = getEquipmentSummary(data.estadoEquipos);
  const supplierSummary = getSupplierSummary(data.proveedores);

  createOrReplaceChart('almacen-chart-movimientos', {
    type: 'doughnut',
    data: {
      labels: ['Entradas', 'Salidas'],
      datasets: [{
        data: [movementCounts.Entrada, movementCounts.Salida],
        backgroundColor: ['#7BF1A8', '#FFA2A2'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });

  createOrReplaceChart('almacen-chart-tendencia', {
    type: 'line',
    data: {
      labels: weeklyTrend.labels,
      datasets: [{
        label: 'Movimientos',
        data: weeklyTrend.counts,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: '#e2e8f0' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });

  createOrReplaceChart('almacen-chart-categorias', {
    type: 'bar',
    data: {
      labels: categorySummary.map((item) => item.category),
      datasets: [
        {
          label: 'Stock',
          data: categorySummary.map((item) => item.stock),
          backgroundColor: '#16a34a',
          borderRadius: 10,
        },
        {
          label: 'Valor total',
          data: categorySummary.map((item) => item.valor),
          backgroundColor: '#f59e0b',
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });

  createOrReplaceChart('almacen-chart-equipos', {
    type: 'doughnut',
    data: {
      labels: equipmentSummary.map((item) => item.label),
      datasets: [{
        data: equipmentSummary.map((item) => item.value),
        backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });

  createOrReplaceChart('almacen-chart-proveedores', {
    type: 'bar',
    data: {
      labels: supplierSummary.map((item) => item.label),
      datasets: [{
        label: 'Compras',
        data: supplierSummary.map((item) => item.value),
        backgroundColor: '#7c3aed',
        borderRadius: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
        },
        y: {
          grid: { display: false },
        },
      },
    },
  });
}

function renderLists(data: DashboardData): void {
  const movimientosBody = document.getElementById('almacen-recientes-body');
  const productosBody = document.getElementById('almacen-productos-body');
  const proveedoresBody = document.getElementById('almacen-proveedores-body');
  const alertasBody = document.getElementById('almacen-alertas-list');

  if (movimientosBody) {
    const recientes = [...data.kardex]
      .sort((a, b) => (b.fecha.localeCompare(a.fecha) ? 1 : 0))
      .slice(0, 8);

    movimientosBody.innerHTML = recientes.length > 0
      ? recientes.map((movimiento) => `
        <tr>
          <td>${formatDate(movimiento.fecha)}</td>
          <td><span class="status-indicator ${movimiento.tipo === 'Entrada' ? 'success' : 'warning'}">${movimiento.tipo}</span></td>
          <td>
            <div class="equipment-info">
              <div>
                <div class="equipment-name">${movimiento.producto_nombre}</div>
                <div class="equipment-id">SKU: ${movimiento.producto_codigo}</div>
              </div>
            </div>
          </td>
          <td>${movimiento.cantidad} ${movimiento.observaciones || ''}</td>
          <td>${movimiento.responsable}</td>
          <td>${movimiento.destino_origen}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">No hay movimientos registrados.</td></tr>';
  }

  if (productosBody) {
    const topProductos = [...data.productos]
      .sort((a, b) => toNumber(b.stock) - toNumber(a.stock))
      .slice(0, 6);

    productosBody.innerHTML = topProductos.length > 0
      ? topProductos.map((producto) => `
        <tr>
          <td>${producto.nombre}</td>
          <td>${producto.categoria}</td>
          <td>${toNumber(producto.stock)} ${producto.unidad}</td>
          <td>${formatCurrency(toNumber(producto.valor_total))}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" style="text-align:center;padding:24px;color:#64748b;">No hay productos disponibles.</td></tr>';
  }

  if (proveedoresBody) {
    const topProveedores = getSupplierSummary(data.proveedores);

    proveedoresBody.innerHTML = topProveedores.length > 0
      ? topProveedores.map((proveedor) => `
        <tr>
          <td>${proveedor.label}</td>
          <td>${proveedor.value}</td>
          <td>${formatDate(proveedor.last)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="3" style="text-align:center;padding:24px;color:#64748b;">No hay proveedores registrados.</td></tr>';
  }

  if (alertasBody) {
    const alertas = getAlertas(data);
    alertasBody.innerHTML = alertas.length > 0
      ? alertas.map((alerta) => `<li>${alerta}</li>`).join('')
      : '<li>Sin alertas críticas por ahora.</li>';
  }
}

function renderMetrics(data: DashboardData): void {
  updateStat('almacen-stat-stock-total', new Intl.NumberFormat('es-PE').format(data.inventario.stock_total));
  updateStat('almacen-stat-valor-total', formatCurrency(toNumber(data.inventario.valor_total)));
  updateStat('almacen-stat-bajo-stock', new Intl.NumberFormat('es-PE').format(data.inventario.productos_bajo_stock));
  updateStat('almacen-stat-total-movimientos', new Intl.NumberFormat('es-PE').format(data.movimientos.total_movimientos));
  updateStat('almacen-stat-entradas-mes', new Intl.NumberFormat('es-PE').format(data.movimientos.entradas_mes));
  updateStat('almacen-stat-salidas-mes', new Intl.NumberFormat('es-PE').format(data.movimientos.salidas_mes));
  updateStat('almacen-stat-hoy', new Intl.NumberFormat('es-PE').format(data.movimientos.movimientos_hoy || 0));
  updateStat('almacen-stat-categorias', new Intl.NumberFormat('es-PE').format(data.inventario.categorias));
}

async function refreshDashboard(): Promise<void> {
  if (dashboardLoading) return;
  dashboardLoading = true;
  const root = document.getElementById('almacen-dashboard-root');
  if (root) {
    root.dataset.loading = 'true';
  }

  try {
    const data = await loadDashboardData(dashboardRange);
    renderMetrics(data);
    renderCharts(data);
    renderLists(data);
    await renderAlmacenNotifications(data);
    updateDashboardRangeBadge();
  } finally {
    dashboardLoading = false;
    if (root) {
      root.dataset.loading = 'false';
    }
  }
}

function getDashboardRangeLabel(range: DashboardRange): string {
  const desde = formatDate(range.fechaDesde);
  const hasta = formatDate(range.fechaHasta);
  return `${desde} - ${hasta}`;
}

function updateDashboardRangeBadge(): void {
  const label = document.getElementById('almacen-range-label');
  if (label) {
    label.textContent = getDashboardRangeLabel(dashboardRange);
  }

  document.querySelectorAll('[data-range-preset]').forEach((button) => {
    const target = button as HTMLButtonElement;
    const isActive = target.dataset.rangePreset === dashboardRange.preset;
    target.classList.toggle('active', isActive);
    target.style.background = isActive ? '#1d4ed8' : '';
    target.style.color = isActive ? '#ffffff' : '';
    target.style.borderColor = isActive ? '#1d4ed8' : '';
  });

  const desde = document.getElementById('almacen-fecha-desde') as HTMLInputElement | null;
  const hasta = document.getElementById('almacen-fecha-hasta') as HTMLInputElement | null;
  if (desde) desde.value = dashboardRange.fechaDesde;
  if (hasta) hasta.value = dashboardRange.fechaHasta;
}

async function applyDashboardRange(range: DashboardRange): Promise<void> {
  dashboardRange = normalizeRange(range);
  updateDashboardRangeBadge();
  await refreshDashboard();
}

export function renderAlmacenDashboard() {
  return `
    <div id="almacen-dashboard-root" class="almacen-dashboard-shell">
      <div class="page-header-with-breadcrumb">
        <div class="breadcrumb">Dashboard del Área de Almacén</div>
        <div class="page-actions">
          <button class="btn-secondary" id="almacen-btn-refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 11a8 8 0 1 0-2.34 5.66"></path><polyline points="20 3 20 11 12 11"></polyline></svg>
            Actualizar
          </button>
          <button class="btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar
          </button>
        </div>
      </div>

      <div id="almacen-stock-bajo-banner"></div>
      <div id="almacen-mantenimiento-banner"></div>

      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:14px;align-items:center;margin:0 0 18px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
          <button class="btn-secondary" type="button" data-range-preset="today" style="padding:8px 14px;">Hoy</button>
          <button class="btn-secondary" type="button" data-range-preset="7d" style="padding:8px 14px;">7 días</button>
          <button class="btn-secondary" type="button" data-range-preset="30d" style="padding:8px 14px;">30 días</button>
          <button class="btn-secondary" type="button" data-range-preset="month" style="padding:8px 14px;">Mes actual</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;">
          <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#475569;font-weight:600;">
            Desde
            <input id="almacen-fecha-desde" type="date" style="padding:9px 12px;border:1px solid #cbd5e1;border-radius:10px;min-width:150px;">
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#475569;font-weight:600;">
            Hasta
            <input id="almacen-fecha-hasta" type="date" style="padding:9px 12px;border:1px solid #cbd5e1;border-radius:10px;min-width:150px;">
          </label>
          <button class="btn-primary" type="button" id="almacen-btn-aplicar-rango" style="height:40px;">Aplicar</button>
          <button class="btn-secondary" type="button" id="almacen-btn-limpiar-rango" style="height:40px;">Limpiar</button>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;">
        <div style="font-size:13px;color:#64748b;">
          Periodo activo:
          <span id="almacen-range-label" style="font-weight:700;color:#0f172a;">${getDashboardRangeLabel(dashboardRange)}</span>
        </div>
        <div style="font-size:12px;color:#64748b;">Los bloques de inventario y equipos siguen mostrando la foto actual del sistema.</div>
      </div>

      <div class="stats-row" style="margin-bottom: 24px;">
        <div class="stat-box">
          <div class="stat-box-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"></path><path d="M12 3v18"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Stock Total</div>
            <div class="stat-box-value" id="almacen-stat-stock-total">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Valor Inventario</div>
            <div class="stat-box-value" id="almacen-stat-valor-total">S/ 0.00</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Bajo Stock</div>
            <div class="stat-box-value" id="almacen-stat-bajo-stock">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Movimientos</div>
            <div class="stat-box-value" id="almacen-stat-total-movimientos">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Entradas</div>
            <div class="stat-box-value" id="almacen-stat-entradas-mes">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"></path><path d="m5 12 7 7 7-7"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Salidas</div>
            <div class="stat-box-value" id="almacen-stat-salidas-mes">0</div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid" style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px;align-items:start;">
        <section style="grid-column:span 7;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Movimientos de Kardex</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Distribución real de entradas y salidas del almacén.</p>
            </div>
            <span style="padding:6px 10px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;">Actualizado en vivo</span>
          </div>
          <div style="height:280px;">
            <canvas id="almacen-chart-movimientos"></canvas>
          </div>
        </section>

        <section style="grid-column:span 5;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Tendencia del periodo</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Movimiento diario o semanal según el rango seleccionado.</p>
            </div>
          </div>
          <div style="height:280px;">
            <canvas id="almacen-chart-tendencia"></canvas>
          </div>
        </section>

        <section style="grid-column:span 6;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Inventario por categoría</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Stock y valor total por categoría de producto.</p>
            </div>
          </div>
          <div style="height:280px;">
            <canvas id="almacen-chart-categorias"></canvas>
          </div>
        </section>

        <section style="grid-column:span 6;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Estado de equipos</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Resumen del mantenimiento de equipos.</p>
            </div>
            <div class="stat-box-note">Garantías y mantenimientos</div>
          </div>
          <div style="height:280px;">
            <canvas id="almacen-chart-equipos"></canvas>
          </div>
        </section>

        <section style="grid-column:span 7;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Movimientos recientes</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Últimos registros del kardex real.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>FECHA</th>
                  <th>TIPO</th>
                  <th>PRODUCTO</th>
                  <th>CANTIDAD</th>
                  <th>RESPONSABLE</th>
                  <th>DESTINO / ORIGEN</th>
                </tr>
              </thead>
              <tbody id="almacen-recientes-body">
                <tr><td colspan="6" style="text-align:center;padding:24px;color:#64748b;">Cargando movimientos...</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style="grid-column:span 5;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Proveedores con mayor compra</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Relación de proveedores con más actividad.</p>
            </div>
          </div>
          <div style="height:280px;">
            <canvas id="almacen-chart-proveedores"></canvas>
          </div>
        </section>

        <section style="grid-column:span 6;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Productos prioritarios</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Inventario más relevante por stock y valor.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>CATEGORÍA</th>
                  <th>STOCK</th>
                  <th>VALOR</th>
                </tr>
              </thead>
              <tbody id="almacen-productos-body">
                <tr><td colspan="4" style="text-align:center;padding:24px;color:#64748b;">Cargando productos...</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style="grid-column:span 6;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Alertas del área</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Puntos que deberían destacarse al gerente de almacén.</p>
            </div>
          </div>
          <ul id="almacen-alertas-list" style="margin:0;padding-left:18px;color:#334155;display:flex;flex-direction:column;gap:10px;line-height:1.45;">
            <li>Cargando alertas...</li>
          </ul>
        </section>

        <section style="grid-column:span 12;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(15,23,42,.05);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Proveedores destacados</h3>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Última compra y volumen de compras acumuladas.</p>
            </div>
            <div class="stat-box-note">Top 5 proveedores</div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PROVEEDOR</th>
                  <th>TOTAL COMPRAS</th>
                  <th>ÚLTIMA COMPRA</th>
                </tr>
              </thead>
              <tbody id="almacen-proveedores-body">
                <tr><td colspan="3" style="text-align:center;padding:24px;color:#64748b;">Cargando proveedores...</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `;
}

export function initAlmacenDashboardEvents() {
  const refreshButton = document.getElementById('almacen-btn-refresh');
  const applyRangeButton = document.getElementById('almacen-btn-aplicar-rango');
  const clearRangeButton = document.getElementById('almacen-btn-limpiar-rango');

  updateDashboardRangeBadge();

  refreshButton?.addEventListener('click', () => {
    void refreshDashboard();
  });

  document.querySelectorAll('[data-range-preset]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const target = event.currentTarget as HTMLButtonElement;
      const preset = target.dataset.rangePreset as DateRangePreset | undefined;
      if (!preset) return;

      dashboardRange = getRangeForPreset(preset);
      updateDashboardRangeBadge();
      void refreshDashboard();
    });
  });

  applyRangeButton?.addEventListener('click', () => {
    const desde = document.getElementById('almacen-fecha-desde') as HTMLInputElement | null;
    const hasta = document.getElementById('almacen-fecha-hasta') as HTMLInputElement | null;
    if (!desde || !hasta) return;

    void applyDashboardRange({
      preset: 'custom',
      fechaDesde: desde.value,
      fechaHasta: hasta.value,
    });
  });

  clearRangeButton?.addEventListener('click', () => {
    dashboardRange = getDefaultDashboardRange();
    updateDashboardRangeBadge();
    void refreshDashboard();
  });

  const desdeInput = document.getElementById('almacen-fecha-desde') as HTMLInputElement | null;
  const hastaInput = document.getElementById('almacen-fecha-hasta') as HTMLInputElement | null;

  desdeInput?.addEventListener('change', () => {
    dashboardRange = {
      preset: 'custom',
      fechaDesde: desdeInput.value,
      fechaHasta: hastaInput?.value || dashboardRange.fechaHasta,
    };
    updateDashboardRangeBadge();
  });

  hastaInput?.addEventListener('change', () => {
    dashboardRange = {
      preset: 'custom',
      fechaDesde: desdeInput?.value || dashboardRange.fechaDesde,
      fechaHasta: hastaInput.value,
    };
    updateDashboardRangeBadge();
  });

  void refreshDashboard();
}
