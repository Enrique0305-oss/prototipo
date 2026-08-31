import * as ExcelJS from 'exceljs';
import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration, ChartType } from 'chart.js';
import { finanzasService } from './finanzas.service';
import { personalService } from '../../services/personalService';
import { authService } from '../auth/auth.service';
import type { MovimientoCajaChica } from './finanzas.types';
import { mostrarToast } from '../../shared/toast';

Chart.register(...registerables);

let movimientos: MovimientoCajaChica[] = [];
let currentFilteredMovimientos: MovimientoCajaChica[] = [];
let saldoActual: number = 0;
let isLoading = false;
let chartInstances: Chart[] = [];
let currentTab: 'registros' | 'dashboard' = 'registros';

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  // Añadimos T00:00:00 para evitar desfasaje de zona horaria si la fecha es yyyy-mm-dd
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
}

function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderTable(): void {
  const tbody = document.getElementById('caja-chica-body');
  const monthFilter = document.getElementById('cc-month-filter') as HTMLSelectElement;
  const tipoFilter = document.getElementById('cc-tipo-filter') as HTMLSelectElement;
  const solicitanteFilter = document.getElementById('cc-solicitante-filter') as HTMLSelectElement;
  const searchFilter = document.getElementById('cc-search-filter') as HTMLInputElement;

  if (!tbody) return;

  if (isLoading) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:24px;color:#64748b;">Cargando movimientos...</td></tr>';
    return;
  }

  if (movimientos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:24px;color:#64748b;">No hay movimientos registrados en Caja Chica.</td></tr>';
    return;
  }

  let filteredMovimientos = movimientos;
  let saldoAnterior = 0;
  let totalIngreso = 0;
  let totalEgreso = 0;

  if (monthFilter && monthFilter.value !== 'todos') {
    const selectedMonth = monthFilter.value;
    
    movimientos.forEach(mov => {
      if (mov.fecha < selectedMonth + '-01') {
        saldoAnterior += (mov.tipo_movimiento === 'Ingreso' ? Number(mov.ingreso || 0) : -Number(mov.egreso || 0));
      }
    });

    filteredMovimientos = filteredMovimientos.filter(mov => mov.fecha.substring(0, 7) === selectedMonth);
  } else {
    saldoAnterior = 0; // If all months, initial balance is 0 conceptually
  }

  if (tipoFilter && tipoFilter.value !== 'todos') {
    filteredMovimientos = filteredMovimientos.filter(mov => mov.tipo_movimiento === tipoFilter.value);
  }

  if (solicitanteFilter && solicitanteFilter.value !== 'todos') {
    filteredMovimientos = filteredMovimientos.filter(mov => mov.solicitante === solicitanteFilter.value);
  }

  if (searchFilter && searchFilter.value.trim() !== '') {
    const searchTerm = searchFilter.value.trim().toLowerCase();
    filteredMovimientos = filteredMovimientos.filter(mov => {
      const matchConcepto = mov.concepto?.toLowerCase().includes(searchTerm);
      const matchDetalles = mov.detalles && mov.detalles.some(det => det.concepto?.toLowerCase().includes(searchTerm));
      return matchConcepto || matchDetalles;
    });
  }

  currentFilteredMovimientos = filteredMovimientos;

  filteredMovimientos.forEach(mov => {
    if(mov.tipo_movimiento === 'Ingreso') totalIngreso += Number(mov.ingreso || 0);
    if(mov.tipo_movimiento === 'Egreso') totalEgreso += Number(mov.egreso || 0);
  });

  const saldoFinal = saldoAnterior + totalIngreso - totalEgreso;

  const elAnterior = document.getElementById('cc-summary-anterior');
  const elIngreso = document.getElementById('cc-summary-ingreso');
  const elGasto = document.getElementById('cc-summary-gasto');
  const elFinal = document.getElementById('cc-summary-final');

  if(elAnterior) elAnterior.textContent = formatCurrency(saldoAnterior);
  if(elIngreso) elIngreso.textContent = formatCurrency(totalIngreso);
  if(elGasto) elGasto.textContent = formatCurrency(totalEgreso);
  if(elFinal) elFinal.textContent = formatCurrency(saldoFinal);

  if (filteredMovimientos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:24px;color:#64748b;">No hay movimientos en el mes seleccionado.</td></tr>';
  } else {
    tbody.innerHTML = filteredMovimientos.map(mov => {
      let rows = `
      <tr id="caja-row-${mov.id}" style="border-bottom:1px solid #f1f5f9; ${mov.detalles && mov.detalles.length > 0 ? 'background:#f8fafc;' : ''}; transition: background-color 1s ease;">
        <td style="padding:12px 16px;">${formatDate(mov.fecha)}</td>
        <td style="padding:12px 16px;">
          <span style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600;${
            mov.tipo_movimiento === 'Ingreso' ? 'background:#ecfdf5;color:#059669;' : 'background:#fef2f2;color:#dc2626;'
          }">
            ${mov.tipo_movimiento}
          </span>
        </td>
        <td style="padding:12px 16px;color:#64748b;font-size:12px;">${mov.registrado_por || '—'}</td>
        <td style="padding:12px 16px;">${mov.solicitante || '—'}</td>
        <td style="padding:12px 16px;">${mov.area || '—'}</td>
        <td style="padding:12px 16px;font-weight:600;">${mov.concepto}</td>
        <td style="padding:12px 16px;">${mov.documento || '—'} / ${mov.proveedor || '—'}</td>
        <td style="padding:12px 16px;">${mov.numero_operacion || '—'}</td>
        <td style="padding:12px 16px;color:#dc2626;font-weight:500;">${mov.tipo_movimiento === 'Egreso' ? formatCurrency(mov.egreso) : '—'}</td>
        <td style="padding:12px 16px;color:#059669;font-weight:500;">${mov.tipo_movimiento === 'Ingreso' ? formatCurrency(mov.ingreso) : '—'}</td>
        <td style="padding:12px 16px;font-weight:700;color:#0f172a;background:#f8fafc;">${formatCurrency(mov.saldo_actual)}</td>
        <td style="padding:12px 16px;text-align:right;">
          <div style="display:flex;gap:4px;justify-content:flex-end;">
            <button type="button" class="btn-historial-caja" data-id="${mov.id}" title="Ver Historial" style="background:none;border:none;color:#64748b;cursor:pointer;padding:4px;" onmouseover="this.style.color='#f59e0b'" onmouseout="this.style.color='#64748b'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
            <button type="button" class="btn-editar-caja" data-id="${mov.id}" title="Editar" style="background:none;border:none;color:#64748b;cursor:pointer;padding:4px;" onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='#64748b'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
      
      if (mov.detalles && mov.detalles.length > 0) {
        mov.detalles.forEach(det => {
          rows += `
          <tr style="border-bottom:1px dashed #e2e8f0;background:#fff;">
            <td colspan="5"></td>
            <td style="padding:8px 16px;font-size:12px;color:#475569;display:flex;align-items:center;gap:6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              ${det.concepto}
            </td>
            <td colspan="2"></td>
            <td style="padding:8px 16px;font-size:12px;color:#dc2626;">${mov.tipo_movimiento === 'Egreso' ? formatCurrency(det.monto) : '—'}</td>
            <td style="padding:8px 16px;font-size:12px;color:#059669;">${mov.tipo_movimiento === 'Ingreso' ? formatCurrency(det.monto) : '—'}</td>
            <td></td>
          </tr>`;
        });
      }
      return rows;
    }).join('');

    // Attach listeners for edit and delete
    document.querySelectorAll('.btn-editar-caja').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const id = target.getAttribute('data-id');
        if (id) (window as any).abrirModalEdicionCaja(Number(id));
      });
    });

    document.querySelectorAll('.btn-historial-caja').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLElement;
        const id = target.getAttribute('data-id');
        if (id) await (window as any).abrirModalHistorialCaja(Number(id));
      });
    });
  }

  const saldoTotalElement = document.getElementById('caja-chica-saldo-total');
  if (saldoTotalElement) {
    saldoTotalElement.textContent = formatCurrency(saldoActual);
  }

  // Actualizar dashboard dinámicamente si los filtros cambian
  if (currentTab === 'dashboard') {
    renderDashboard();
  }
}

async function loadData(): Promise<void> {
  isLoading = true;
  renderTable();
  try {
    const response = await finanzasService.getMovimientosCajaChica();
    if (response && response.success) {
      movimientos = response.data;
      saldoActual = response.saldo_actual;
      
      const monthFilter = document.getElementById('cc-month-filter') as HTMLSelectElement;
      if (monthFilter) {
        const uniqueMonths = Array.from(new Set(movimientos.map(m => m.fecha.substring(0, 7)))).sort().reverse();
        const currentVal = monthFilter.value;
        monthFilter.innerHTML = '<option value="todos">Todos los meses</option>' + uniqueMonths.map(m => {
          const [year, month] = m.split('-');
          const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('es-PE', { month: 'long', year: 'numeric' });
          return `<option value="${m}">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</option>`;
        }).join('');
        if (currentVal && currentVal !== 'todos' && uniqueMonths.includes(currentVal)) {
          monthFilter.value = currentVal;
        } else if (uniqueMonths.length > 0) {
          monthFilter.value = uniqueMonths[0]; // Seleccionar último mes por defecto
        }
      }

      const solicitanteFilter = document.getElementById('cc-solicitante-filter') as HTMLSelectElement;
      if (solicitanteFilter) {
        const uniqueSolicitantes = Array.from(new Set(movimientos.map(m => m.solicitante).filter(s => s && s.trim() !== ''))).sort();
        const currentSol = solicitanteFilter.value;
        solicitanteFilter.innerHTML = '<option value="todos">Todos los solicitantes</option>' + uniqueSolicitantes.map(s => {
          return `<option value="${s}">${s}</option>`;
        }).join('');
        if (currentSol && currentSol !== 'todos' && uniqueSolicitantes.includes(currentSol)) {
          solicitanteFilter.value = currentSol;
        }
      }
    }
  } catch (error) {
    mostrarToast('error', 'Error', 'Error al cargar los movimientos');
  } finally {
    isLoading = false;
    renderTable();
  }
}

function renderModal(): string {
  return `
    <!-- MODAL PRINCIPAL -->
    <div id="modal-caja-chica" class="modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);z-index:9999;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:12px;width:100%;max-width:600px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);display:flex;flex-direction:column;max-height:90vh;">
        <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <h2 id="modal-caja-chica-title" style="margin:0;font-size:18px;color:#0f172a;">Nuevo Movimiento - Caja Chica</h2>
          <button id="btn-cerrar-modal" style="background:none;border:none;color:#64748b;cursor:pointer;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding:24px;overflow-y:auto;">
          <form id="form-caja-chica" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <input type="hidden" name="id" id="caja-chica-id">
            <div style="grid-column:1/-1;display:flex;gap:16px;">
              <label style="flex:1;cursor:pointer;padding:12px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;">
                <input type="radio" name="tipo_movimiento" value="Egreso" checked style="accent-color:#dc2626;transform:scale(1.2);">
                <span style="font-weight:600;color:#dc2626;">Gasto (Egreso)</span>
              </label>
              <label style="flex:1;cursor:pointer;padding:12px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;">
                <input type="radio" name="tipo_movimiento" value="Ingreso" style="accent-color:#059669;transform:scale(1.2);">
                <span style="font-weight:600;color:#059669;">Recarga (Ingreso)</span>
              </label>
            </div>
            
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Fecha *
              <input type="date" name="fecha" required style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;" value="${getLocalDateString()}">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Monto (S/) *
              <input type="number" step="0.01" name="subtotal" required placeholder="0.00" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Concepto / Detalle *
              <input type="text" name="concepto" required placeholder="Ej: Taxi, Peaje, Compra de Útiles..." style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Solicitante
              <select name="solicitante" id="caja-chica-solicitante" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;">
                <option value="">¿Quién lo hizo?</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Área
              <select name="area" id="caja-chica-area" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;">
                <option value="">-- Seleccionar --</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Proveedor / Destino
              <input type="text" name="proveedor" placeholder="Nombre de tienda/taxi" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Documento / Medio
              <input type="text" name="documento" placeholder="Ej: Yape, Boleta 123" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Tipo de Dinero
              <input type="text" name="tipo_dinero" placeholder="Ej: Efectivo, Yape (Opcional)" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              N° de Operación
              <input type="text" name="numero_operacion" placeholder="Si aplica" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>

            <div style="grid-column:1/-1;margin-top:8px;border-top:1px dashed #cbd5e1;padding-top:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-size:14px;font-weight:700;color:#0f172a;">Detalle de Gastos (Opcional)</span>
                <button type="button" id="btn-add-detalle" style="padding:6px 12px;background:#e2e8f0;color:#334155;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Agregar Ítem
                </button>
              </div>
              <div id="detalles-container" style="display:flex;flex-direction:column;gap:8px;">
                <!-- Filas dinámicas irán aquí -->
              </div>
            </div>
          </form>
        </div>
        <div style="padding:20px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:12px;background:#f8fafc;border-radius:0 0 12px 12px;">
          <button type="button" id="btn-cancelar-modal" style="padding:10px 20px;border:1px solid #cbd5e1;background:#fff;border-radius:8px;color:#334155;font-weight:600;cursor:pointer;">Cancelar</button>
          <button type="button" id="btn-guardar-movimiento" style="padding:10px 20px;border:none;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;cursor:pointer;">Guardar Movimiento</button>
        </div>
      </div>
    </div>

    <!-- MODAL HISTORIAL -->
    <div id="modal-historial-caja" class="modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);z-index:10000;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:12px;width:100%;max-width:550px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);display:flex;flex-direction:column;max-height:90vh;">
        <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h2 style="margin:0;font-size:18px;color:#0f172a;display:flex;align-items:center;gap:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Historial de Cambios
            </h2>
          </div>
          <button id="btn-cerrar-historial" style="background:none;border:none;color:#64748b;cursor:pointer;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding:24px;overflow-y:auto;background:#f8fafc;" id="historial-caja-body">
          <div style="text-align:center;color:#64748b;">Cargando...</div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;">
          <button id="btn-cerrar-historial-2" style="padding:10px 20px;border:1px solid #cbd5e1;background:#fff;border-radius:8px;color:#334155;font-weight:600;cursor:pointer;">Cerrar</button>
        </div>
      </div>
    </div>
  `;
}
function destroyCharts(): void {
  while (chartInstances.length > 0) {
    chartInstances.pop()?.destroy();
  }
}

function createOrReplaceChart(canvasId: string, config: ChartConfiguration<ChartType, number[], string>): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
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

function renderDashboard(): void {
  const container = document.getElementById('cc-dashboard-view');
  if (!container || container.style.display === 'none') return;

  destroyCharts();

  if (currentFilteredMovimientos.length === 0) {
    return;
  }

  // Calculate Dashboard Data
  let totalIngresos = 0;
  let totalEgresos = 0;
  let totalOperaciones = currentFilteredMovimientos.length;
  
  const gastosPorArea: Record<string, number> = {};
  const gastosPorSolicitante: Record<string, number> = {};
  
  // Data for trend line (group by date)
  const daysInMonth = Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0'));
  const tendenciaIngresos: Record<string, number> = {};
  const tendenciaEgresos: Record<string, number> = {};
  
  daysInMonth.forEach(d => {
    tendenciaIngresos[d] = 0;
    tendenciaEgresos[d] = 0;
  });

  currentFilteredMovimientos.forEach(mov => {
    const isIngreso = mov.tipo_movimiento === 'Ingreso';
    const amount = isIngreso ? Number(mov.ingreso || 0) : Number(mov.egreso || 0);
    
    if (isIngreso) totalIngresos += amount;
    else totalEgresos += amount;

    // By area (only expenses)
    if (!isIngreso) {
      const area = mov.area || 'Sin Área';
      gastosPorArea[area] = (gastosPorArea[area] || 0) + amount;
      
      const solicitante = mov.solicitante || 'Sin Solicitante';
      gastosPorSolicitante[solicitante] = (gastosPorSolicitante[solicitante] || 0) + amount;
    }

    // Trend
    if (mov.fecha) {
      const day = mov.fecha.substring(8, 10);
      if (tendenciaIngresos[day] !== undefined) {
        if (isIngreso) tendenciaIngresos[day] += amount;
        else tendenciaEgresos[day] += amount;
      }
    }
  });

  // Render KPIs
  const elOperaciones = document.getElementById('cc-kpi-operaciones');
  const elIngresos = document.getElementById('cc-kpi-ingresos');
  const elEgresos = document.getElementById('cc-kpi-egresos');
  
  if(elOperaciones) elOperaciones.textContent = String(totalOperaciones);
  if(elIngresos) elIngresos.textContent = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totalIngresos);
  if(elEgresos) elEgresos.textContent = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totalEgresos);

  // 1. Tendencia Chart
  createOrReplaceChart('cc-chart-tendencia', {
    type: 'bar',
    data: {
      labels: daysInMonth,
      datasets: [
        {
          label: 'Egresos',
          data: daysInMonth.map(d => tendenciaEgresos[d]),
          backgroundColor: '#ef4444',
          borderRadius: 4
        },
        {
          label: 'Ingresos / Reposiciones',
          data: daysInMonth.map(d => tendenciaIngresos[d]),
          backgroundColor: '#10b981',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // 2. Area Chart
  const areaLabels = Object.keys(gastosPorArea);
  const areaData = Object.values(gastosPorArea);
  createOrReplaceChart('cc-chart-area', {
    type: 'doughnut',
    data: {
      labels: areaLabels,
      datasets: [{
        data: areaData,
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right' } }
    }
  });

  // 3. Solicitante Chart
  const solicitanteEntries = Object.entries(gastosPorSolicitante).sort((a, b) => b[1] - a[1]).slice(0, 10);
  createOrReplaceChart('cc-chart-solicitante', {
    type: 'bar',
    data: {
      labels: solicitanteEntries.map(e => e[0]),
      datasets: [{
        label: 'Gastos por Solicitante',
        data: solicitanteEntries.map(e => e[1]),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

export function renderCajaChica() {
  return `
    <div style="padding:24px;max-width:100%;margin:0 auto;font-family:Inter,sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
        <div>
          <h1 style="margin:0;font-size:24px;color:#0f172a;display:flex;align-items:center;gap:10px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 12h.01"></path><path d="M17 12h.01"></path><path d="M7 12h.01"></path></svg>
            Control de Caja Chica
          </h1>
          <p style="margin:4px 0 0;color:#64748b;font-size:14px;">Registro manual de egresos menores e ingresos de reposición.</p>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="text-align:right;background:#f1f5f9;padding:8px 16px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:12px;color:#64748b;font-weight:600;">SALDO ACTUAL</div>
            <div id="caja-chica-saldo-total" style="font-size:20px;font-weight:800;color:#0f172a;">S/ 0.00</div>
          </div>
          <div style="display:flex;align-items:center;background:#f1f5f9;border-radius:8px;padding:4px;border:1px solid #e2e8f0;height:40px;box-sizing:border-box;">
            <button id="tab-cc-registros" style="height:100%;padding:0 16px;background:#fff;color:#0f172a;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;align-items:center;gap:6px;transition:all 0.2s;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              Ver Datos
            </button>
            <button id="tab-cc-dashboard" style="height:100%;padding:0 16px;background:transparent;color:#64748b;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.2s;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Ver Estadística
            </button>
          </div>
          <button id="btn-exportar-cc-excel" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:#10b981;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.2);transition:background 0.2s;height:40px;box-sizing:border-box;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Exportar Excel
          </button>
          <button id="btn-nuevo-movimiento" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);height:40px;box-sizing:border-box;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nuevo Movimiento
          </button>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;background:#fff;padding:16px;border-radius:12px;border:1px solid #e2e8f0;flex-wrap:wrap;gap:16px;">
        <div style="display:flex;gap:24px;flex-wrap:wrap;">
          <div>
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">SALDO ANTERIOR</div>
            <div id="cc-summary-anterior" style="font-size:18px;font-weight:700;color:#0f172a;">S/ 0.00</div>
          </div>
          <div>
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">TOTAL INGRESO</div>
            <div id="cc-summary-ingreso" style="font-size:18px;font-weight:700;color:#059669;">S/ 0.00</div>
          </div>
          <div>
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">TOTAL GASTO</div>
            <div id="cc-summary-gasto" style="font-size:18px;font-weight:700;color:#dc2626;">S/ 0.00</div>
          </div>
          <div style="padding-left:24px;border-left:2px solid #e2e8f0;">
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">SALDO FINAL (MES)</div>
            <div id="cc-summary-final" style="font-size:18px;font-weight:800;color:#0f172a;background:#f1f5f9;padding:2px 8px;border-radius:4px;margin-left:-8px;">S/ 0.00</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <input type="text" id="cc-search-filter" placeholder="Buscar concepto o detalle..." style="padding:10px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;min-width:220px;font-size:13px;">
          
          <select id="cc-tipo-filter" style="padding:10px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;font-size:13px;cursor:pointer;">
            <option value="todos">Todos los tipos</option>
            <option value="Ingreso">Ingreso</option>
            <option value="Egreso">Egreso</option>
          </select>

          <select id="cc-solicitante-filter" style="padding:10px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;font-size:13px;cursor:pointer;">
            <option value="todos">Todos los solicitantes</option>
          </select>

          <select id="cc-month-filter" style="padding:10px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;font-weight:600;min-width:160px;cursor:pointer;">
            <option value="todos">Todos los meses</option>
          </select>
        </div>
      </div>

      <div id="cc-table-view">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:1000px;">
              <thead>
                <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:left;">
                  <th style="padding:14px 16px;color:#475569;font-weight:600;white-space:nowrap;">FECHA</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">MOVIMIENTO</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">REGISTRADO POR</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">SOLICITANTE</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">ÁREA</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;width:25%;">CONCEPTO</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">DOC. / PROVEEDOR</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">N° OPERACIÓN</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">EGRESO</th>
                  <th style="padding:14px 16px;color:#475569;font-weight:600;">INGRESO</th>
                  <th style="padding:14px 16px;color:#0f172a;font-weight:700;">SALDO</th>
                </tr>
              </thead>
              <tbody id="caja-chica-body">
                <tr><td colspan="11" style="text-align:center;padding:24px;color:#64748b;">Cargando movimientos...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="cc-dashboard-view" style="display:none;flex-direction:column;gap:24px;">
        <!-- KPIs -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:13px;color:#64748b;font-weight:600;margin-bottom:8px;">TOTAL INGRESOS</div>
            <div id="cc-kpi-ingresos" style="font-size:24px;font-weight:800;color:#10b981;">S/ 0.00</div>
          </div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:13px;color:#64748b;font-weight:600;margin-bottom:8px;">TOTAL EGRESOS</div>
            <div id="cc-kpi-egresos" style="font-size:24px;font-weight:800;color:#ef4444;">S/ 0.00</div>
          </div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:13px;color:#64748b;font-weight:600;margin-bottom:8px;">N° OPERACIONES</div>
            <div id="cc-kpi-operaciones" style="font-size:24px;font-weight:800;color:#0f172a;">0</div>
          </div>
        </div>

        <!-- Gráficos Principales -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <h3 style="margin:0 0 16px 0;font-size:16px;color:#0f172a;">Flujo Diario (Mes Actual)</h3>
            <div style="height:300px;"><canvas id="cc-chart-tendencia"></canvas></div>
          </div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <h3 style="margin:0 0 16px 0;font-size:16px;color:#0f172a;">Gastos por Área</h3>
            <div style="height:300px;"><canvas id="cc-chart-area"></canvas></div>
          </div>
        </div>

        <!-- Ranking -->
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <h3 style="margin:0 0 16px 0;font-size:16px;color:#0f172a;">Top Solicitantes (Gastos)</h3>
          <div style="height:300px;"><canvas id="cc-chart-solicitante"></canvas></div>
        </div>
      </div>

    </div>
    ${renderModal()}
  `;
}

export function initCajaChicaEvents() {
  let personalList: any[] = [];
  
  const monthFilter = document.getElementById('cc-month-filter');
  const tipoFilter = document.getElementById('cc-tipo-filter');
  const solicitanteFilter = document.getElementById('cc-solicitante-filter');
  const searchFilter = document.getElementById('cc-search-filter');

  monthFilter?.addEventListener('change', () => renderTable());
  tipoFilter?.addEventListener('change', () => renderTable());
  solicitanteFilter?.addEventListener('change', () => renderTable());
  searchFilter?.addEventListener('input', () => renderTable());

  const tabRegistros = document.getElementById('tab-cc-registros');
  const tabDashboard = document.getElementById('tab-cc-dashboard');
  const viewRegistros = document.getElementById('cc-table-view');
  const viewDashboard = document.getElementById('cc-dashboard-view');

  const setActiveTab = (tab: 'registros' | 'dashboard') => {
    currentTab = tab;
    if (tab === 'registros') {
      tabRegistros!.style.background = '#fff';
      tabRegistros!.style.color = '#0f172a';
      tabRegistros!.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      tabDashboard!.style.background = 'transparent';
      tabDashboard!.style.color = '#64748b';
      tabDashboard!.style.boxShadow = 'none';
      viewRegistros!.style.display = 'block';
      viewDashboard!.style.display = 'none';
    } else {
      tabDashboard!.style.background = '#fff';
      tabDashboard!.style.color = '#0f172a';
      tabDashboard!.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      tabRegistros!.style.background = 'transparent';
      tabRegistros!.style.color = '#64748b';
      tabRegistros!.style.boxShadow = 'none';
      viewRegistros!.style.display = 'none';
      viewDashboard!.style.display = 'flex';
      renderDashboard(); // Render charts when tab becomes visible
    }
  };

  tabRegistros?.addEventListener('click', () => setActiveTab('registros'));
  tabDashboard?.addEventListener('click', () => setActiveTab('dashboard'));

  loadData();

  const btnNuevo = document.getElementById('btn-nuevo-movimiento');
  const modal = document.getElementById('modal-caja-chica');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const btnCancelar = document.getElementById('btn-cancelar-modal');
  const btnGuardar = document.getElementById('btn-guardar-movimiento');
  const form = document.getElementById('form-caja-chica') as HTMLFormElement;

  const selectSolicitante = document.getElementById('caja-chica-solicitante') as HTMLSelectElement;
  const selectArea = document.getElementById('caja-chica-area') as HTMLSelectElement;

  async function loadPersonal() {
    try {
      const response = await personalService.getUsuarios();
      if (response && response.data) {
        personalList = response.data;
        if (selectSolicitante) {
          selectSolicitante.innerHTML = '<option value="">¿Quién lo hizo?</option>' + 
            personalList.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
        }
      }

      const respAreas = await personalService.getAreasLista();
      if (respAreas && respAreas.data) {
        if (selectArea) {
          selectArea.innerHTML = '<option value="">-- Seleccionar --</option>' + 
            respAreas.data.map((a: any) => `<option value="${a.nombre}">${a.nombre}</option>`).join('');
        }
      }
    } catch (error) {
      console.error('Error cargando personal/areas', error);
    }
  }

  loadPersonal();

  selectSolicitante?.addEventListener('change', (e) => {
    const nombre = (e.target as HTMLSelectElement).value;
    const persona = personalList.find(p => p.nombre === nombre);
    if (persona && persona.area) {
      const areaName = persona.area.nombre || persona.area;
      if (selectArea) {
        for(let i=0; i<selectArea.options.length; i++) {
          if(selectArea.options[i].value.toLowerCase() === String(areaName).toLowerCase()) {
            selectArea.selectedIndex = i;
            break;
          }
        }
      }
    }
  });

  const btnAddDetalle = document.getElementById('btn-add-detalle');
  const detallesContainer = document.getElementById('detalles-container');
  let detalleIndex = 0;

  btnAddDetalle?.addEventListener('click', () => {
    if (!detallesContainer) return;
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.innerHTML = `
      <input type="text" name="detalle_concepto_${detalleIndex}" placeholder="Concepto (ej. Taxi)" required style="flex:2;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-family:inherit;font-size:13px;">
      <input type="number" step="0.01" name="detalle_monto_${detalleIndex}" placeholder="Monto" required style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-family:inherit;font-size:13px;">
      <button type="button" class="btn-remove-detalle" style="padding:8px;background:#fee2e2;color:#ef4444;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;
    detallesContainer.appendChild(row);
    row.querySelector('.btn-remove-detalle')?.addEventListener('click', () => {
      row.remove();
    });
    detalleIndex++;
  });

  function closeModal() {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    if (detallesContainer) detallesContainer.innerHTML = '';
    detalleIndex = 0;
  }

  btnNuevo?.addEventListener('click', () => {
    if (modal) modal.style.display = 'flex';
    (document.getElementById('caja-chica-id') as HTMLInputElement).value = '';
    (document.getElementById('modal-caja-chica-title') as HTMLElement).textContent = 'Nuevo Movimiento - Caja Chica';
    
    if (form) form.reset();
    if (detallesContainer) detallesContainer.innerHTML = '';
    detalleIndex = 0;
    
    const fechaInput = form?.querySelector('input[name="fecha"]') as HTMLInputElement;
    if (fechaInput) {
      fechaInput.value = getLocalDateString();
    }
  });

  btnCerrar?.addEventListener('click', closeModal);
  btnCancelar?.addEventListener('click', closeModal);

  // Cerrar al hacer clic fuera
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  btnGuardar?.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const currentUser = authService.getUser();
    
    const detalles: { concepto: string, monto: number }[] = [];
    if (detallesContainer) {
      const rows = detallesContainer.querySelectorAll('div');
      rows.forEach(row => {
        const inputConcepto = row.querySelector('input[type="text"]') as HTMLInputElement;
        const inputMonto = row.querySelector('input[type="number"]') as HTMLInputElement;
        if (inputConcepto && inputMonto && inputConcepto.value.trim() !== '') {
          detalles.push({
            concepto: inputConcepto.value.trim(),
            monto: Number(inputMonto.value)
          });
        }
      });
    }

    const subtotal = Number(formData.get('subtotal'));

    if (detalles.length > 0) {
      const sumaDetalles = detalles.reduce((acc, curr) => acc + curr.monto, 0);
      // Validamos con una tolerancia muy pequeña para evitar errores de precisión de decimales
      if (Math.abs(sumaDetalles - subtotal) > 0.01) {
        mostrarToast('warning', 'Validación', `La suma de los detalles (S/ ${sumaDetalles.toFixed(2)}) no coincide con el Monto general (S/ ${subtotal.toFixed(2)}). Por favor verifica.`);
        return;
      }
    }

    const data = {
      tipo_movimiento: formData.get('tipo_movimiento') as string,
      fecha: formData.get('fecha') as string,
      subtotal: subtotal,
      concepto: formData.get('concepto') as string,
      solicitante: formData.get('solicitante') as string,
      area: formData.get('area') as string,
      proveedor: formData.get('proveedor') as string,
      documento: formData.get('documento') as string,
      tipo_dinero: formData.get('tipo_dinero') as string,
      numero_operacion: formData.get('numero_operacion') as string,
      registrado_por: currentUser?.nombre || 'Desconocido',
      detalles: detalles
    };

    try {
      btnGuardar.textContent = 'Guardando...';
      btnGuardar.setAttribute('disabled', 'true');
      
      const id = formData.get('id') as string;
      if (id) {
        // Update
        const isEgreso = data.tipo_movimiento === 'Egreso';
        const putData = {
           tipo_movimiento: data.tipo_movimiento,
           fecha: data.fecha,
           solicitante: data.solicitante || null,
           area: data.area || null,
           concepto: data.concepto,
           proveedor: data.proveedor || null,
           documento: data.documento || null,
           tipo_dinero: data.tipo_dinero || null,
           numero_operacion: data.numero_operacion || null,
           ingreso: !isEgreso ? data.subtotal : null,
           egreso: isEgreso ? data.subtotal : null,
           detalles: data.detalles
        };
        const response = await fetch(`${import.meta.env.VITE_API_URL}/caja-chica/${id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify(putData)
        });
        const resData = await response.json();
        if (response.ok && resData.success) {
          mostrarToast('success', 'Éxito', resData.message || 'Registro actualizado');
          closeModal();
          loadData();
        } else {
          mostrarToast('error', 'Error', resData.message || 'Error al actualizar');
        }
      } else {
        // Create
        const response = await finanzasService.registrarMovimientoCajaChica(data as any);
        if (response) {
          mostrarToast('success', 'Éxito', 'Movimiento registrado con éxito');
          closeModal();
          loadData();
        }
      }
    } catch (error) {
      console.error('Error guardando movimiento:', error);
      mostrarToast('error', 'Error', 'Error al registrar el movimiento');
    } finally {
      btnGuardar.textContent = 'Guardar Movimiento';
      btnGuardar.removeAttribute('disabled');
    }
  });

  const btnExportar = document.getElementById('btn-exportar-cc-excel');
  btnExportar?.addEventListener('click', async () => {
    if (currentFilteredMovimientos.length === 0) {
      mostrarToast('warning', 'Sin datos', 'No hay movimientos para exportar en el mes seleccionado.');
      return;
    }

    try {
      btnExportar.textContent = 'Exportando...';
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'QSCI Group';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Caja Chica');
      
      const monthFilter = document.getElementById('cc-month-filter') as HTMLSelectElement;
      const selectedMonth = monthFilter && monthFilter.value !== 'todos' ? monthFilter.value : 'Todos los meses';
      
      sheet.addRow(['REPORTE DE CAJA CHICA']);
      sheet.mergeCells(1, 1, 1, 11);
      const titulo = sheet.getRow(1);
      titulo.height = 24;
      titulo.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
      titulo.alignment = { horizontal: 'center', vertical: 'middle' };
      titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10b981' } };

      sheet.addRow(['Mes', selectedMonth]);
      sheet.addRow(['Total de registros', currentFilteredMovimientos.length]);
      sheet.addRow([]);

      const encabezado = sheet.addRow([
        'FECHA', 'MOVIMIENTO', 'REGISTRADO POR', 'SOLICITANTE', 'ÁREA', 'CONCEPTO', 'DOC. / PROVEEDOR', 'N° OPERACIÓN', 'EGRESO', 'INGRESO', 'SALDO'
      ]);
      
      encabezado.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0f172a' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: 'CBD5E1' } },
            left: { style: 'thin', color: { argb: 'CBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
            right: { style: 'thin', color: { argb: 'CBD5E1' } },
        };
      });

      currentFilteredMovimientos.forEach(m => {
        const row = sheet.addRow([
          formatDate(m.fecha),
          m.tipo_movimiento,
          m.registrado_por || '---',
          m.solicitante || '---',
          m.area || '---',
          m.concepto || '---',
          `${m.documento || ''} / ${m.proveedor || ''}`,
          m.numero_operacion || '---',
          m.tipo_movimiento === 'Egreso' ? Number(m.egreso) : '',
          m.tipo_movimiento === 'Ingreso' ? Number(m.ingreso) : '',
          Number(m.saldo_actual)
        ]);
        
        row.eachCell((cell, colNumber) => {
          cell.border = {
              top: { style: 'thin', color: { argb: 'D1D5DB' } },
              left: { style: 'thin', color: { argb: 'D1D5DB' } },
              bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
              right: { style: 'thin', color: { argb: 'D1D5DB' } },
          };
          cell.alignment = { vertical: 'middle', wrapText: true };
          if (colNumber >= 9) {
            cell.numFmt = '"S/ "#,##0.00';
          }
          if (m.detalles && m.detalles.length > 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
          }
        });

        if (m.detalles && m.detalles.length > 0) {
          m.detalles.forEach(det => {
            const detRow = sheet.addRow([
              '', '', '', '', '',
              `↳ ${det.concepto}`,
              '', '',
              m.tipo_movimiento === 'Egreso' ? Number(det.monto) : '',
              m.tipo_movimiento === 'Ingreso' ? Number(det.monto) : '',
              ''
            ]);
            detRow.eachCell((cell, colNumber) => {
              cell.border = {
                  top: { style: 'dashed', color: { argb: 'E2E8F0' } },
                  bottom: { style: 'dashed', color: { argb: 'E2E8F0' } },
              };
              cell.alignment = { vertical: 'middle', wrapText: true };
              if (colNumber >= 9 && typeof cell.value === 'number') {
                cell.numFmt = '"S/ "#,##0.00';
                if (m.tipo_movimiento === 'Egreso') cell.font = { color: { argb: 'DC2626' } };
                if (m.tipo_movimiento === 'Ingreso') cell.font = { color: { argb: '059669' } };
              }
              if (colNumber === 6) {
                cell.font = { color: { argb: '475569' }, italic: true };
              }
            });
          });
        }
      });

      sheet.getColumn(1).width = 12;
      sheet.getColumn(2).width = 14;
      sheet.getColumn(3).width = 20;
      sheet.getColumn(4).width = 20;
      sheet.getColumn(5).width = 18;
      sheet.getColumn(6).width = 30;
      sheet.getColumn(7).width = 25;
      sheet.getColumn(8).width = 16;
      sheet.getColumn(9).width = 14;
      sheet.getColumn(10).width = 14;
      sheet.getColumn(11).width = 16;
      sheet.views = [{ state: 'frozen', ySplit: 5 }];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `Caja_Chica_${selectedMonth === 'Todos los meses' ? 'Todos' : selectedMonth}.xlsx`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al exportar a Excel:', e);
      mostrarToast('error', 'Error', 'Ocurrió un error al generar el Excel.');
    } finally {
      btnExportar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Exportar Excel';
    }
  });

  (window as any).abrirModalEdicionCaja = (id: number) => {
    const mov = movimientos.find(m => m.id === id);
    if (!mov || !modal || !form) return;

    (document.getElementById('caja-chica-id') as HTMLInputElement).value = String(mov.id);
    (document.getElementById('modal-caja-chica-title') as HTMLElement).textContent = 'Editar Movimiento - Caja Chica';
    
    // Set radios
    const radIngreso = form.querySelector('input[name="tipo_movimiento"][value="Ingreso"]') as HTMLInputElement;
    const radEgreso = form.querySelector('input[name="tipo_movimiento"][value="Egreso"]') as HTMLInputElement;
    if (mov.tipo_movimiento === 'Ingreso' && radIngreso) radIngreso.checked = true;
    if (mov.tipo_movimiento === 'Egreso' && radEgreso) radEgreso.checked = true;

    // Set other fields
    (form.querySelector('input[name="fecha"]') as HTMLInputElement).value = mov.fecha ? mov.fecha.substring(0, 10) : '';
    (form.querySelector('input[name="subtotal"]') as HTMLInputElement).value = mov.tipo_movimiento === 'Ingreso' ? String(Number(mov.ingreso)) : String(Number(mov.egreso));
    (form.querySelector('input[name="concepto"]') as HTMLInputElement).value = mov.concepto || '';
    
    // Set selects (they might need a tiny timeout if personalList isn't loaded, but it should be by now)
    const selSolicitante = form.querySelector('select[name="solicitante"]') as HTMLSelectElement;
    const selArea = form.querySelector('select[name="area"]') as HTMLSelectElement;
    if (selSolicitante) selSolicitante.value = mov.solicitante || '';
    if (selArea) {
      // It might not have the option if it wasn't triggered by change, but they are loaded in loadPersonal()
      selArea.value = mov.area || '';
    }

    (form.querySelector('input[name="proveedor"]') as HTMLInputElement).value = mov.proveedor || '';
    (form.querySelector('input[name="documento"]') as HTMLInputElement).value = mov.documento || '';
    (form.querySelector('input[name="tipo_dinero"]') as HTMLInputElement).value = mov.tipo_dinero || '';
    (form.querySelector('input[name="numero_operacion"]') as HTMLInputElement).value = mov.numero_operacion || '';

    if (detallesContainer) detallesContainer.innerHTML = '';
    detalleIndex = 0;
    if (mov.detalles && mov.detalles.length > 0) {
      mov.detalles.forEach(d => {
        // Trigger click on btnAddDetalle instead of repeating logic
        btnAddDetalle?.click();
        const inputsConcepto = detallesContainer?.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>;
        const inputsMonto = detallesContainer?.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>;
        if (inputsConcepto && inputsMonto) {
          inputsConcepto[inputsConcepto.length - 1].value = d.concepto;
          inputsMonto[inputsMonto.length - 1].value = String(Number(d.monto));
        }
      });
    }

    modal.style.display = 'flex';
  };

  (window as any).abrirModalHistorialCaja = async (id: number) => {
    const modalHistorial = document.getElementById('modal-historial-caja');
    const historialBody = document.getElementById('historial-caja-body');
    if (!modalHistorial || !historialBody) return;

    historialBody.innerHTML = '<div style="text-align:center;color:#64748b;padding:20px;">Cargando...</div>';
    modalHistorial.style.display = 'flex';

    try {
      const token = authService.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/caja-chica/${id}/historial`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        historialBody.innerHTML = result.data.map((h: any) => {
          const valsAnt = typeof h.valores_anteriores === 'string' ? JSON.parse(h.valores_anteriores) : h.valores_anteriores;
          const valsNue = typeof h.valores_nuevos === 'string' ? JSON.parse(h.valores_nuevos) : h.valores_nuevos;
          
          return `
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">
                <span style="font-weight:600;color:#0f172a;font-size:13px;">${h.usuario ? h.usuario.nombre : 'Usuario desconocido'}</span>
                <span style="font-size:11px;color:#94a3b8;">${new Date(h.created_at).toLocaleString()}</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;">
                <div style="background:#fef2f2;padding:12px;border-radius:6px;border:1px solid #fca5a5;">
                  <div style="color:#dc2626;font-weight:700;margin-bottom:6px;text-transform:uppercase;font-size:10px;">Valores Anteriores</div>
                  <div style="color:#475569;line-height:1.5;">
                    <div><b>Tipo:</b> ${valsAnt?.tipo_movimiento || '—'}</div>
                    <div><b>Concepto:</b> ${valsAnt?.concepto || '—'}</div>
                    <div><b>Monto:</b> S/ ${Number(valsAnt?.ingreso) > 0 ? valsAnt?.ingreso : valsAnt?.egreso || '0.00'}</div>
                    <div><b>Solicitante:</b> ${valsAnt?.solicitante || '—'}</div>
                    <div><b>Área:</b> ${valsAnt?.area || '—'}</div>
                  </div>
                </div>
                <div style="background:#ecfdf5;padding:12px;border-radius:6px;border:1px solid #6ee7b7;">
                  <div style="color:#059669;font-weight:700;margin-bottom:6px;text-transform:uppercase;font-size:10px;">Valores Nuevos</div>
                  <div style="color:#475569;line-height:1.5;">
                    <div><b>Tipo:</b> ${valsNue?.tipo_movimiento || '—'}</div>
                    <div><b>Concepto:</b> ${valsNue?.concepto || '—'}</div>
                    <div><b>Monto:</b> S/ ${Number(valsNue?.ingreso) > 0 ? valsNue?.ingreso : valsNue?.egreso || '0.00'}</div>
                    <div><b>Solicitante:</b> ${valsNue?.solicitante || '—'}</div>
                    <div><b>Área:</b> ${valsNue?.area || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        historialBody.innerHTML = '<div style="text-align:center;color:#64748b;padding:20px;">No hay historial de cambios para este registro.</div>';
      }
    } catch (error) {
      console.error(error);
      historialBody.innerHTML = '<div style="text-align:center;color:#dc2626;padding:20px;">Error al cargar el historial.</div>';
    }
  };

  document.getElementById('btn-cerrar-historial')?.addEventListener('click', () => {
    const m = document.getElementById('modal-historial-caja');
    if (m) m.style.display = 'none';
  });
  document.getElementById('btn-cerrar-historial-2')?.addEventListener('click', () => {
    const m = document.getElementById('modal-historial-caja');
    if (m) m.style.display = 'none';
  });
  document.getElementById('modal-historial-caja')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-historial-caja')) {
      (document.getElementById('modal-historial-caja') as HTMLElement).style.display = 'none';
    }
  });

}
