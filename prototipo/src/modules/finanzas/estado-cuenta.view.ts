import * as ExcelJS from 'exceljs';
import { finanzasService } from './finanzas.service';
import { mostrarToast } from '../../shared/toast';
import { authService } from '../auth/auth.service';

let movimientos: any[] = [];
let currentFilteredMovimientos: any[] = [];
let saldoActual: number = 0;
let isLoading = false;
let currentCuenta: 'Multi' | 'CIM' = 'Multi';

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
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

function renderTabs() {
  const tabsContainer = document.getElementById('estado-cuenta-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = `
      <div style="display:flex;gap:16px;border-bottom:2px solid #e2e8f0;margin-bottom:24px;">
        <button class="ec-tab ${currentCuenta === 'Multi' ? 'active' : ''}" data-cuenta="Multi" style="padding:12px 24px;border:none;background:none;font-size:15px;font-weight:700;color:${currentCuenta === 'Multi' ? '#2563eb' : '#64748b'};border-bottom:2px solid ${currentCuenta === 'Multi' ? '#2563eb' : 'transparent'};margin-bottom:-2px;cursor:pointer;">
          Cuenta MULTI
        </button>
        <button class="ec-tab ${currentCuenta === 'CIM' ? 'active' : ''}" data-cuenta="CIM" style="padding:12px 24px;border:none;background:none;font-size:15px;font-weight:700;color:${currentCuenta === 'CIM' ? '#2563eb' : '#64748b'};border-bottom:2px solid ${currentCuenta === 'CIM' ? '#2563eb' : 'transparent'};margin-bottom:-2px;cursor:pointer;">
          Cuenta CIM
        </button>
      </div>
    `;

    document.querySelectorAll('.ec-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        currentCuenta = (e.currentTarget as HTMLButtonElement).dataset.cuenta as 'Multi' | 'CIM';
        renderTabs();
        loadData();
      });
    });
  }
}

function renderTable(): void {
  const tbody = document.getElementById('estado-cuenta-body');
  const monthFilter = document.getElementById('ec-month-filter') as HTMLSelectElement;
  if (!tbody) return;

  if (isLoading) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">Cargando movimientos...</td></tr>';
    return;
  }

  if (movimientos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">No hay movimientos registrados.</td></tr>';
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
        if (mov.tipo_movimiento === 'Ingreso' || mov.tipo_movimiento === 'Saldo inicial') saldoAnterior += Number(mov.monto || 0);
        if (mov.tipo_movimiento === 'Egreso') saldoAnterior -= Number(mov.monto || 0);
      }
    });

    filteredMovimientos = movimientos.filter(mov => mov.fecha.substring(0, 7) === selectedMonth);
  } else {
    saldoAnterior = 0;
  }

  currentFilteredMovimientos = filteredMovimientos;

  filteredMovimientos.forEach(mov => {
    if(mov.tipo_movimiento === 'Ingreso' || mov.tipo_movimiento === 'Saldo inicial') totalIngreso += Number(mov.monto || 0);
    if(mov.tipo_movimiento === 'Egreso') totalEgreso += Number(mov.monto || 0);
  });

  const saldoFinal = saldoAnterior + totalIngreso - totalEgreso;

  const elAnterior = document.getElementById('ec-summary-anterior');
  const elIngreso = document.getElementById('ec-summary-ingreso');
  const elGasto = document.getElementById('ec-summary-gasto');
  const elFinal = document.getElementById('ec-summary-final');

  if(elAnterior) elAnterior.textContent = formatCurrency(saldoAnterior);
  if(elIngreso) elIngreso.textContent = formatCurrency(totalIngreso);
  if(elGasto) elGasto.textContent = formatCurrency(totalEgreso);
  if(elFinal) elFinal.textContent = formatCurrency(saldoFinal);

  if (filteredMovimientos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">No hay movimientos en el mes seleccionado.</td></tr>';
  } else {
    tbody.innerHTML = filteredMovimientos.map(mov => {
      const isIngreso = mov.tipo_movimiento === 'Ingreso' || mov.tipo_movimiento === 'Saldo inicial';
      let badgeStyle = 'background:#f1f5f9;color:#475569;';
      if(mov.tipo_movimiento === 'Ingreso') badgeStyle = 'background:#ecfdf5;color:#059669;';
      if(mov.tipo_movimiento === 'Egreso') badgeStyle = 'background:#fef2f2;color:#dc2626;';
      if(mov.tipo_movimiento === 'Saldo inicial') badgeStyle = 'background:#eff6ff;color:#2563eb;';

      return `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:12px 16px;white-space:nowrap;">${formatDate(mov.fecha)}</td>
        <td style="padding:12px 16px;">
          <span style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600;${badgeStyle}">
            ${mov.tipo_movimiento}
          </span>
        </td>
        <td style="padding:12px 16px;color:#64748b;font-size:12px;">${mov.registrado_por || '—'}</td>
        <td style="padding:12px 16px;">${mov.descripcion || '—'}</td>
        <td style="padding:12px 16px;">${mov.detalle || '—'}</td>
        <td style="padding:12px 16px;">${mov.factura_doc || '—'}</td>
        <td style="padding:12px 16px;color:#dc2626;font-weight:500;">${!isIngreso ? formatCurrency(mov.monto) : '—'}</td>
        <td style="padding:12px 16px;color:#059669;font-weight:500;">${isIngreso ? formatCurrency(mov.monto) : '—'}</td>
        <td style="padding:12px 16px;font-weight:700;color:#0f172a;background:#f8fafc;">${formatCurrency(mov.saldo_actual)}</td>
      </tr>
      `;
    }).join('');
  }

  const saldoTotalElement = document.getElementById('estado-cuenta-saldo-total');
  if (saldoTotalElement) {
    saldoTotalElement.textContent = formatCurrency(saldoActual);
  }
}

async function loadData(): Promise<void> {
  isLoading = true;
  renderTable();
  try {
    const response = await finanzasService.getEstadoCuenta(currentCuenta);
    if (response && response.success) {
      movimientos = response.data;
      saldoActual = response.saldo_actual;
      
      const monthFilter = document.getElementById('ec-month-filter') as HTMLSelectElement;
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
    }
  } catch (error) {
    mostrarToast('error', 'Error', 'Error al cargar los movimientos del estado de cuenta');
  } finally {
    isLoading = false;
    renderTable();
  }
}

function renderModal(): string {
  return `
    <div id="modal-estado-cuenta" class="modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);z-index:9999;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:12px;width:100%;max-width:600px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);display:flex;flex-direction:column;max-height:90vh;">
        <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <h2 style="margin:0;font-size:18px;color:#0f172a;">Nuevo Movimiento - <span id="modal-cuenta-title">MULTI</span></h2>
          <button id="btn-cerrar-modal-ec" style="background:none;border:none;color:#64748b;cursor:pointer;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding:24px;overflow-y:auto;">
          <form id="form-estado-cuenta" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
              <label style="flex:1;cursor:pointer;padding:12px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;">
                <input type="radio" name="tipo_movimiento" value="Ingreso" checked style="accent-color:#059669;transform:scale(1.2);">
                <span style="font-weight:600;color:#059669;">Ingreso</span>
              </label>
              <label style="flex:1;cursor:pointer;padding:12px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;">
                <input type="radio" name="tipo_movimiento" value="Egreso" style="accent-color:#dc2626;transform:scale(1.2);">
                <span style="font-weight:600;color:#dc2626;">Egreso</span>
              </label>
              <label style="flex:1;cursor:pointer;padding:12px;border:2px solid #e2e8f0;border-radius:8px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;">
                <input type="radio" name="tipo_movimiento" value="Saldo inicial" style="accent-color:#2563eb;transform:scale(1.2);">
                <span style="font-weight:600;color:#2563eb;">Saldo Inicial</span>
              </label>
            </div>
            
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Fecha *
              <input type="date" name="fecha" required style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;" value="${getLocalDateString()}">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Monto (S/) *
              <input type="number" step="0.01" name="monto" required placeholder="0.00" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Descripción / Cliente / Proveedor *
              <input type="text" name="descripcion" required placeholder="Ej: Pago de Cliente X" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Detalle / Concepto
              <input type="text" name="detalle" placeholder="Ej: Mantenimiento anual" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#334155;">
              Factura / Doc
              <input type="text" name="factura_doc" placeholder="Ej: E001-2138" style="padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-family:inherit;">
            </label>
          </form>
        </div>
        <div style="padding:20px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:12px;background:#f8fafc;border-radius:0 0 12px 12px;">
          <button type="button" id="btn-cancelar-modal-ec" style="padding:10px 20px;border:1px solid #cbd5e1;background:#fff;border-radius:8px;color:#334155;font-weight:600;cursor:pointer;">Cancelar</button>
          <button type="button" id="btn-guardar-movimiento-ec" style="padding:10px 20px;border:none;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;cursor:pointer;">Guardar Movimiento</button>
        </div>
      </div>
    </div>
  `;
}

export function renderEstadoCuenta() {
  return `
    <div style="padding:24px;max-width:100%;margin:0 auto;font-family:Inter,sans-serif;">
      
      <div id="estado-cuenta-tabs"></div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
        <div>
          <h1 style="margin:0;font-size:24px;color:#0f172a;display:flex;align-items:center;gap:10px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Estado de Cuenta Bancario
          </h1>
          <p style="margin:4px 0 0;color:#64748b;font-size:14px;">Registro y control de movimientos bancarios.</p>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="text-align:right;background:#f1f5f9;padding:8px 16px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:12px;color:#64748b;font-weight:600;">SALDO ACTUAL</div>
            <div id="estado-cuenta-saldo-total" style="font-size:20px;font-weight:800;color:#0f172a;">S/ 0.00</div>
          </div>
          <button id="btn-exportar-ec-excel" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:#10b981;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.2);transition:background 0.2s;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Exportar Excel
          </button>
          <button id="btn-nuevo-movimiento-ec" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nuevo Movimiento
          </button>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;background:#fff;padding:16px;border-radius:12px;border:1px solid #e2e8f0;flex-wrap:wrap;gap:16px;">
        <div style="display:flex;gap:24px;flex-wrap:wrap;">
          <div>
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">SALDO ANTERIOR</div>
            <div id="ec-summary-anterior" style="font-size:18px;font-weight:700;color:#0f172a;">S/ 0.00</div>
          </div>
          <div>
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">TOTAL INGRESO</div>
            <div id="ec-summary-ingreso" style="font-size:18px;font-weight:700;color:#059669;">S/ 0.00</div>
          </div>
          <div>
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">TOTAL GASTO</div>
            <div id="ec-summary-gasto" style="font-size:18px;font-weight:700;color:#dc2626;">S/ 0.00</div>
          </div>
          <div style="padding-left:24px;border-left:2px solid #e2e8f0;">
            <div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.5px;">SALDO FINAL (MES)</div>
            <div id="ec-summary-final" style="font-size:18px;font-weight:800;color:#0f172a;background:#f1f5f9;padding:2px 8px;border-radius:4px;margin-left:-8px;">S/ 0.00</div>
          </div>
        </div>
        <div>
          <select id="ec-month-filter" style="padding:10px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;font-weight:600;min-width:180px;cursor:pointer;">
            <option value="todos">Todos los meses</option>
          </select>
        </div>
      </div>

      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);overflow:hidden;">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:1000px;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:left;">
                <th style="padding:14px 16px;color:#475569;font-weight:600;">FECHA</th>
                <th style="padding:14px 16px;color:#475569;font-weight:600;">MOVIMIENTO</th>
                <th style="padding:14px 16px;color:#475569;font-weight:600;">REGISTRADO POR</th>
                <th style="padding:14px 16px;color:#475569;font-weight:600;width:25%;">DESCRIPCIÓN / CLIENTE / PROVEEDOR</th>
                <th style="padding:14px 16px;color:#475569;font-weight:600;">DETALLE / CONCEPTO</th>
                <th style="padding:14px 16px;color:#475569;font-weight:600;">FACTURA / DOC</th>
                <th style="padding:14px 16px;color:#475569;font-weight:600;">EGRESO</th>
                <th style="padding:14px 16px;color:#475569;font-weight:600;">INGRESO</th>
                <th style="padding:14px 16px;color:#0f172a;font-weight:700;">SALDO</th>
              </tr>
            </thead>
            <tbody id="estado-cuenta-body">
              <tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">Cargando movimientos...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    ${renderModal()}
  `;
}

export function initEstadoCuentaEvents() {
  currentCuenta = 'Multi';
  renderTabs();
  
  const monthFilter = document.getElementById('ec-month-filter');
  monthFilter?.addEventListener('change', () => {
    renderTable();
  });

  loadData();

  const btnNuevo = document.getElementById('btn-nuevo-movimiento-ec');
  const modal = document.getElementById('modal-estado-cuenta');
  const btnCerrar = document.getElementById('btn-cerrar-modal-ec');
  const btnCancelar = document.getElementById('btn-cancelar-modal-ec');
  const btnGuardar = document.getElementById('btn-guardar-movimiento-ec');
  const form = document.getElementById('form-estado-cuenta') as HTMLFormElement;
  const title = document.getElementById('modal-cuenta-title');

  function closeModal() {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    const fechaInput = form?.querySelector('input[name="fecha"]') as HTMLInputElement;
    if (fechaInput) fechaInput.value = getLocalDateString();
  }

  btnNuevo?.addEventListener('click', () => {
    if (modal) modal.style.display = 'flex';
    if (title) title.textContent = currentCuenta;
    const fechaInput = form?.querySelector('input[name="fecha"]') as HTMLInputElement;
    if (fechaInput) fechaInput.value = getLocalDateString();
  });

  btnCerrar?.addEventListener('click', closeModal);
  btnCancelar?.addEventListener('click', closeModal);

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
    
    const data = {
      cuenta: currentCuenta,
      tipo_movimiento: formData.get('tipo_movimiento') as string,
      fecha: formData.get('fecha') as string,
      monto: Number(formData.get('monto')),
      descripcion: formData.get('descripcion') as string,
      detalle: formData.get('detalle') as string,
      factura_doc: formData.get('factura_doc') as string,
      registrado_por: currentUser?.nombre || 'Desconocido',
    };

    try {
      btnGuardar.textContent = 'Guardando...';
      btnGuardar.setAttribute('disabled', 'true');
      
      const response = await finanzasService.registrarEstadoCuenta(data);
      if (response) {
        mostrarToast('success', 'Éxito', 'Movimiento registrado con éxito');
        closeModal();
        loadData();
      }
    } catch (error) {
      console.error('Error guardando movimiento:', error);
      mostrarToast('error', 'Error', 'Error al registrar el movimiento');
    } finally {
      btnGuardar.textContent = 'Guardar Movimiento';
      btnGuardar.removeAttribute('disabled');
    }
  });

  const btnExportar = document.getElementById('btn-exportar-ec-excel');
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

      const sheet = workbook.addWorksheet(`Estado de Cuenta ${currentCuenta}`);
      
      const monthFilter = document.getElementById('ec-month-filter') as HTMLSelectElement;
      const selectedMonth = monthFilter && monthFilter.value !== 'todos' ? monthFilter.value : 'Todos los meses';
      
      sheet.addRow([`ESTADO DE CUENTA BANCARIO - ${currentCuenta.toUpperCase()}`]);
      sheet.mergeCells(1, 1, 1, 9);
      const titulo = sheet.getRow(1);
      titulo.height = 24;
      titulo.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
      titulo.alignment = { horizontal: 'center', vertical: 'middle' };
      titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563eb' } };

      sheet.addRow(['Mes', selectedMonth]);
      sheet.addRow(['Total de registros', currentFilteredMovimientos.length]);
      sheet.addRow([]);

      const encabezado = sheet.addRow([
        'FECHA', 'MOVIMIENTO', 'REGISTRADO POR', 'DESCRIPCIÓN / CLIENTE / PROVEEDOR', 'DETALLE / CONCEPTO', 'FACTURA / DOC', 'EGRESO', 'INGRESO', 'SALDO'
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

      currentFilteredMovimientos.forEach(mov => {
        const isIngreso = mov.tipo_movimiento === 'Ingreso' || mov.tipo_movimiento === 'Saldo inicial';
        const row = sheet.addRow([
          formatDate(mov.fecha),
          mov.tipo_movimiento,
          mov.registrado_por || '---',
          mov.descripcion || '---',
          mov.detalle || '---',
          mov.factura_doc || '---',
          !isIngreso ? Number(mov.monto) : '',
          isIngreso ? Number(mov.monto) : '',
          Number(mov.saldo_actual)
        ]);
        
        row.eachCell((cell, colNumber) => {
          cell.border = {
              top: { style: 'thin', color: { argb: 'D1D5DB' } },
              left: { style: 'thin', color: { argb: 'D1D5DB' } },
              bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
              right: { style: 'thin', color: { argb: 'D1D5DB' } },
          };
          cell.alignment = { vertical: 'middle', wrapText: true };
          if (colNumber >= 7) {
            cell.numFmt = '"S/ "#,##0.00';
          }
        });
      });

      sheet.getColumn(1).width = 12;
      sheet.getColumn(2).width = 16;
      sheet.getColumn(3).width = 20;
      sheet.getColumn(4).width = 40;
      sheet.getColumn(5).width = 30;
      sheet.getColumn(6).width = 20;
      sheet.getColumn(7).width = 14;
      sheet.getColumn(8).width = 14;
      sheet.getColumn(9).width = 16;
      sheet.views = [{ state: 'frozen', ySplit: 5 }];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `Estado_Cuenta_${currentCuenta}_${selectedMonth === 'Todos los meses' ? 'Todos' : selectedMonth}.xlsx`;
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
}
