import * as ExcelJS from 'exceljs';
import { finanzasService } from './finanzas.service';
import { personalService } from '../../services/personalService';
import { authService } from '../auth/auth.service';
import type { MovimientoCajaChica } from './finanzas.types';
import { mostrarToast } from '../../shared/toast';

let movimientos: MovimientoCajaChica[] = [];
let currentFilteredMovimientos: MovimientoCajaChica[] = [];
let saldoActual: number = 0;
let isLoading = false;

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

    filteredMovimientos = movimientos.filter(mov => mov.fecha.substring(0, 7) === selectedMonth);
  } else {
    saldoAnterior = 0; // If all months, initial balance is 0 conceptually
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
    tbody.innerHTML = filteredMovimientos.map(mov => `
      <tr style="border-bottom:1px solid #f1f5f9;">
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
        <td style="padding:12px 16px;">${mov.concepto}</td>
        <td style="padding:12px 16px;">${mov.documento || '—'} / ${mov.proveedor || '—'}</td>
        <td style="padding:12px 16px;">${mov.numero_operacion || '—'}</td>
        <td style="padding:12px 16px;color:#dc2626;font-weight:500;">${mov.tipo_movimiento === 'Egreso' ? formatCurrency(mov.egreso) : '—'}</td>
        <td style="padding:12px 16px;color:#059669;font-weight:500;">${mov.tipo_movimiento === 'Ingreso' ? formatCurrency(mov.ingreso) : '—'}</td>
        <td style="padding:12px 16px;font-weight:700;color:#0f172a;background:#f8fafc;">${formatCurrency(mov.saldo_actual)}</td>
      </tr>
    `).join('');
  }

  const saldoTotalElement = document.getElementById('caja-chica-saldo-total');
  if (saldoTotalElement) {
    saldoTotalElement.textContent = formatCurrency(saldoActual);
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
    <div id="modal-caja-chica" class="modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);z-index:9999;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:12px;width:100%;max-width:600px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);display:flex;flex-direction:column;max-height:90vh;">
        <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <h2 style="margin:0;font-size:18px;color:#0f172a;">Nuevo Movimiento - Caja Chica</h2>
          <button id="btn-cerrar-modal" style="background:none;border:none;color:#64748b;cursor:pointer;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding:24px;overflow-y:auto;">
          <form id="form-caja-chica" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
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
          </form>
        </div>
        <div style="padding:20px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:12px;background:#f8fafc;border-radius:0 0 12px 12px;">
          <button type="button" id="btn-cancelar-modal" style="padding:10px 20px;border:1px solid #cbd5e1;background:#fff;border-radius:8px;color:#334155;font-weight:600;cursor:pointer;">Cancelar</button>
          <button type="button" id="btn-guardar-movimiento" style="padding:10px 20px;border:none;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;cursor:pointer;">Guardar Movimiento</button>
        </div>
      </div>
    </div>
  `;
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
          <button id="btn-exportar-cc-excel" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:#10b981;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.2);transition:background 0.2s;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Exportar Excel
          </button>
          <button id="btn-nuevo-movimiento" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);">
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
        <div>
          <select id="cc-month-filter" style="padding:10px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font-family:inherit;font-weight:600;min-width:180px;cursor:pointer;">
            <option value="todos">Todos los meses</option>
          </select>
        </div>
      </div>

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
    ${renderModal()}
  `;
}

export function initCajaChicaEvents() {
  let personalList: any[] = [];
  
  const monthFilter = document.getElementById('cc-month-filter');
  monthFilter?.addEventListener('change', () => {
    renderTable();
  });

  loadData();

  const btnNuevo = document.getElementById('btn-nuevo-movimiento');
  const modal = document.getElementById('modal-caja-chica');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const btnCancelar = document.getElementById('btn-cancelar-modal');
  const btnGuardar = document.getElementById('btn-guardar-movimiento');
  const form = document.getElementById('form-caja-chica') as HTMLFormElement;

  function closeModal() {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    
    // Restaurar fecha a hoy
    const fechaInput = form?.querySelector('input[name="fecha"]') as HTMLInputElement;
    if (fechaInput) {
      fechaInput.value = getLocalDateString();
    }
  }

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

  btnNuevo?.addEventListener('click', () => {
    if (modal) modal.style.display = 'flex';
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
    
    const data = {
      tipo_movimiento: formData.get('tipo_movimiento') as string,
      fecha: formData.get('fecha') as string,
      subtotal: Number(formData.get('subtotal')),
      concepto: formData.get('concepto') as string,
      solicitante: formData.get('solicitante') as string,
      area: formData.get('area') as string,
      proveedor: formData.get('proveedor') as string,
      documento: formData.get('documento') as string,
      tipo_dinero: formData.get('tipo_dinero') as string,
      numero_operacion: formData.get('numero_operacion') as string,
      registrado_por: currentUser?.nombre || 'Desconocido',
    };

    try {
      btnGuardar.textContent = 'Guardando...';
      btnGuardar.setAttribute('disabled', 'true');
      
      const response = await finanzasService.registrarMovimientoCajaChica(data as any);
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
        });
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
}
