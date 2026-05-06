// Comercial - Ordenes de Servicio (Conectado al Backend)
import './ordenes-servicio.css';
import { ordenServicioService } from '../../../services/ordenServicioService';
import { servicioService } from '../../../services/servicioService';
import { productoService } from '../../../services/productoService';
import { equipoService } from '../../../services/equipoService';
import { authService } from '../../auth/auth.service';
import { mostrarToast } from '../../../shared/toast';
import { clienteService } from '../../../services/clienteService';

let odsListData: any[] = [];
let cotizacionesDisponibles: any[] = [];
let serviciosDisponibles: any[] = [];
let incluyeIgv = true;
let contadorLineasSrv = 0;
let productosDisponiblesODS: any[] = [];
let equiposDisponiblesODS: any[] = [];
let odsProductoRows: { id_servicio?: number; id_equipo?: number | null; equipo_descripcion?: string; id_producto: number; cantidad: number; observacion: string; stock?: number; id_cliente_planta?: number | null; id_cliente_planta_area?: number | null }[] = [];
let odsEquipoRows: { id_equipo: number; observacion: string; equipo_descripcion?: string; id_servicio?: number; id_cliente_planta?: number | null; id_cliente_planta_area?: number | null }[] = [];
let plantasClienteDataODS: any[] = [];

const DIAS_SEMANA_ODS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function normalizeAreaIds(value: any): number[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? [parsed] : [];
}

function normalizarDiaNombreODS(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function construirFrecuenciaDiasHtmlODS(lineaId: string): string {
  const checks = DIAS_SEMANA_ODS.map((dia) => {
    return '<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#475569;">'
      + '<input type="checkbox" class="frecuencia-dia-checkbox-ods" value="' + dia + '"> '
      + dia.substring(0, 3)
      + '</label>';
  }).join('');

  return '<div class="frecuencia-dias-wrap-ods" data-linea="' + lineaId + '" style="display:none;margin-top:6px;padding:6px;border:1px dashed #cbd5e1;border-radius:6px;background:#f8fafc;">'
    + '<div style="font-size:11px;color:#64748b;margin-bottom:4px;">Seleccione días</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:8px;">' + checks + '</div>'
    + '</div>';
}

function limpiarFrecuenciaDiasODS(fila: HTMLElement) {
  fila.querySelectorAll('.frecuencia-dia-checkbox-ods').forEach((el) => {
    (el as HTMLInputElement).checked = false;
  });
}

function actualizarUIFrecuenciaDiasODS(fila: HTMLElement) {
  const frecuenciaSelect = fila.querySelector('.frecuencia-select') as HTMLSelectElement | null;
  const wrap = fila.querySelector('.frecuencia-dias-wrap-ods') as HTMLElement | null;
  if (!frecuenciaSelect || !wrap) return;

  const mostrar = frecuenciaSelect.value === 'Días de la semana';
  wrap.style.display = mostrar ? 'block' : 'none';
  if (!mostrar) limpiarFrecuenciaDiasODS(fila);
}

function extraerDiasDesdeTextoODS(raw: string): string[] {
  const found: string[] = [];
  const normalizedRaw = normalizarDiaNombreODS(raw || '');

  DIAS_SEMANA_ODS.forEach((dia) => {
    const normDia = normalizarDiaNombreODS(dia);
    if (new RegExp('\\b' + normDia + '\\b', 'i').test(normalizedRaw)) {
      found.push(dia);
    }
  });

  return found;
}

function esFrecuenciaDiasSemanaODS(texto: string): boolean {
  const t = (texto || '').trim();
  if (!t) return false;
  if (/dias?\s+de\s+la\s+semana/i.test(t)) return true;
  if (/a\s+la\s+semana/i.test(t)) return true;
  return extraerDiasDesdeTextoODS(t).length > 0;
}

function frecuenciaBaseParaSelectODS(frecuenciaTexto: string): string {
  if (!frecuenciaTexto) return '';
  if (esFrecuenciaDiasSemanaODS(frecuenciaTexto)) return 'Días de la semana';
  return frecuenciaTexto;
}

function setFrecuenciaDiasDesdeTextoODS(fila: HTMLElement, frecuenciaTexto: string) {
  if (!frecuenciaTexto) return;

  const frecuenciaSelect = fila.querySelector('.frecuencia-select') as HTMLSelectElement | null;
  if (!frecuenciaSelect) return;

  frecuenciaSelect.value = frecuenciaBaseParaSelectODS(frecuenciaTexto);
  actualizarUIFrecuenciaDiasODS(fila);

  if (frecuenciaSelect.value !== 'Días de la semana') return;

  const texto = frecuenciaTexto.trim();
  const diasDetectados = extraerDiasDesdeTextoODS(texto);
  const diasEnTexto = (() => {
    const m = texto.match(/\(([^)]+)\)/);
    if (m?.[1]) return m[1].split(',').map((d) => d.trim()).filter(Boolean);

    if (diasDetectados.length > 0) return diasDetectados;

    const split = texto.split(':');
    if (split[1]) return split[1].split(',').map((d) => d.trim()).filter(Boolean);

    const splitGuion = texto.split('-');
    if (splitGuion[1]) return splitGuion[1].split(',').map((d) => d.trim()).filter(Boolean);

    return [];
  })();

  const diasNorm = new Set(diasEnTexto.map(normalizarDiaNombreODS));
  fila.querySelectorAll('.frecuencia-dia-checkbox-ods').forEach((el) => {
    const chk = el as HTMLInputElement;
    chk.checked = diasNorm.has(normalizarDiaNombreODS(chk.value));
  });
}

function frecuenciaDesdeFilaODS(fila: HTMLElement): string | null {
  const frecuenciaSelect = fila.querySelector('.frecuencia-select') as HTMLSelectElement | null;
  if (!frecuenciaSelect || !frecuenciaSelect.value) return null;

  if (frecuenciaSelect.value !== 'Días de la semana') {
    return frecuenciaSelect.value;
  }

  const dias = Array.from(fila.querySelectorAll('.frecuencia-dia-checkbox-ods'))
    .filter((el) => (el as HTMLInputElement).checked)
    .map((el) => (el as HTMLInputElement).value);

  if (dias.length === 0) {
    return '__INVALID__';
  }

  const textoDias = dias.join(', ');
  const etiquetaDias = dias.length === 1 ? 'día' : 'días';
  return dias.length + ' ' + etiquetaDias + ' a la semana (' + textoDias + ')';
}

function getAreaOptionsMultiODS(idPlanta: number | null, selectedIds: number[] = []): string {
  if (!idPlanta) return '';
  const planta = plantasClienteDataODS.find((p: any) => p.id == idPlanta);
  if (!planta) return '';
  const selectedSet = new Set(selectedIds);
  const areas = planta.areas_activas || planta.areas || [];
  return areas
    .filter((a: any) => !a.estado || a.estado === 'Activo')
    .map((a: any) => {
      const sel = selectedSet.has(Number(a.id)) ? 'selected' : '';
      return '<option value="' + a.id + '" ' + sel + '>' + a.nombre + '</option>';
    })
    .join('');
}

function getAreaIdsFromODSRow(row: Element): number[] {
  const multi = row.querySelector('.area-select-multi') as HTMLSelectElement | null;
  if (!multi) {
    const single = row.querySelector('.area-select') as HTMLSelectElement | null;
    const id = parseInt(single?.value || '0', 10);
    return id > 0 ? [id] : [];
  }
  return Array.from(multi.selectedOptions)
    .map((opt) => parseInt(opt.value || '0', 10))
    .filter((id) => id > 0);
}

function actualizarResumenAreasODSRow(fila: HTMLElement) {
  const multi = fila.querySelector('.area-select-multi') as HTMLSelectElement | null;
  const resumen = fila.querySelector('.area-multi-summary-ods') as HTMLElement | null;
  const toggle = fila.querySelector('.area-picker-toggle-ods') as HTMLButtonElement | null;
  const single = fila.querySelector('.area-select') as HTMLSelectElement | null;
  if (!resumen || !single) return;

  const ids = multi
    ? Array.from(multi.selectedOptions)
        .map((opt) => parseInt(opt.value || '0', 10))
        .filter((id) => id > 0)
    : [];

  single.value = ids[0] ? String(ids[0]) : '';

  if (ids.length === 0) {
    resumen.textContent = 'Sin áreas seleccionadas';
    resumen.style.color = '#94a3b8';
    if (toggle) toggle.textContent = 'Seleccionar áreas';
    return;
  }

  if (toggle) toggle.textContent = ids.length + ' área(s)';
  resumen.style.color = '#334155';

  const labels = multi
    ? Array.from(multi.selectedOptions).map((opt) => (opt.text || '').trim()).filter(Boolean)
    : [];

  const chips = labels.slice(0, 2).map((nombre) => {
    return '<span style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">' + nombre + '</span>';
  }).join('');

  if (labels.length > 2) {
    resumen.innerHTML = chips + '<span style="font-size:11px;color:#64748b;">+' + (labels.length - 2) + ' más</span>';
  } else {
    resumen.innerHTML = chips;
  }
}

function renderAreaPickerOptionsODS(fila: HTMLElement) {
  const multi = fila.querySelector('.area-select-multi') as HTMLSelectElement | null;
  const wrap = fila.querySelector('.area-picker-options-ods') as HTMLElement | null;
  if (!multi || !wrap) return;

  if (multi.options.length === 0) {
    wrap.innerHTML = '<div style="padding:6px 0;color:#94a3b8;font-size:12px;">Primero seleccione una planta</div>';
    return;
  }

  wrap.innerHTML = Array.from(multi.options).map((opt, index) => {
    return '<label style="display:flex;align-items:center;gap:7px;padding:4px 0;font-size:13px;color:#334155;cursor:pointer;">'
      + '<input type="checkbox" class="area-picker-check-ods" data-index="' + index + '" ' + (opt.selected ? 'checked' : '') + '>'
      + '<span>' + opt.text + '</span>'
      + '</label>';
  }).join('');

  wrap.querySelectorAll('.area-picker-check-ods').forEach((el) => {
    el.addEventListener('change', (e) => {
      e.stopPropagation();
      const idx = Number((e.currentTarget as HTMLInputElement).dataset.index || '-1');
      if (idx < 0 || !multi.options[idx]) return;
      multi.options[idx].selected = (e.currentTarget as HTMLInputElement).checked;
      actualizarResumenAreasODSRow(fila);
    });
  });
}

function bindAreaMultiInteractionsODS(fila: HTMLElement) {
  const multi = fila.querySelector('.area-select-multi') as HTMLSelectElement | null;
  const panel = fila.querySelector('.area-picker-panel-ods') as HTMLElement | null;
  const toggle = fila.querySelector('.area-picker-toggle-ods') as HTMLButtonElement | null;
  const btnAll = fila.querySelector('.area-select-all-ods') as HTMLButtonElement | null;
  const btnClear = fila.querySelector('.area-clear-all-ods') as HTMLButtonElement | null;

  if (!multi || !panel || !toggle) return;

  if (!(toggle as any)._boundOdsMulti) {
    toggle.addEventListener('click', () => {
      const show = panel.style.display === 'none' || !panel.style.display;
      panel.style.display = show ? 'block' : 'none';
      if (show) renderAreaPickerOptionsODS(fila);
    });
    document.addEventListener('click', (e) => {
      if (!fila.contains(e.target as Node)) panel.style.display = 'none';
    });
    (toggle as any)._boundOdsMulti = true;
  }

  if (btnAll && !(btnAll as any)._boundOdsMulti) {
    btnAll.addEventListener('click', () => {
      Array.from(multi.options).forEach((opt) => { opt.selected = true; });
      renderAreaPickerOptionsODS(fila);
      actualizarResumenAreasODSRow(fila);
    });
    (btnAll as any)._boundOdsMulti = true;
  }

  if (btnClear && !(btnClear as any)._boundOdsMulti) {
    btnClear.addEventListener('click', () => {
      Array.from(multi.options).forEach((opt) => { opt.selected = false; });
      renderAreaPickerOptionsODS(fila);
      actualizarResumenAreasODSRow(fila);
    });
    (btnClear as any)._boundOdsMulti = true;
  }

  renderAreaPickerOptionsODS(fila);
  actualizarResumenAreasODSRow(fila);
}

export function renderComercialOrdenesServicio() {
  return `
  <div class="os-form-container">

    <!-- HEADER -->
    <div class="page-header">
      <h1>Ordenes de Servicio</h1>
      <div class="header-actions">
        <button class="btn-primary" id="btn-nueva-ods">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Orden de Servicio
        </button>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-row" id="ods-stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Ordenes</div>
          <div class="stat-box-value" id="stat-total-ordenes">-</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Valor Total</div>
          <div class="stat-box-value" id="stat-valor-total">-</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ordenes este Mes</div>
          <div class="stat-box-value" id="stat-ordenes-mes">-</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Valor este Mes</div>
          <div class="stat-box-value" id="stat-valor-mes">-</div>
        </div>
      </div>
    </div>

    <!-- LISTA DE ORDENES -->
    <div id="lista-ordenes-servicio">
      <div class="search-filter-bar">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" id="ods-search" placeholder="Buscar orden de servicio..." class="search-input">
        </div>
        <input type="date" class="filter-select" id="ods-filter-desde" title="Desde">
        <input type="date" class="filter-select" id="ods-filter-hasta" title="Hasta">
        <button class="btn-filter" id="ods-btn-filtrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filtrar
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>N Orden</th>
              <th>Cliente</th>
              <th>Cotizacion</th>
              <th>Fecha Aceptacion</th>
              <th>Fecha Tentativa</th>
              <th>Total Costo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="ods-tabla-body">
            <tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL NUEVA/EDITAR ODS -->
    <div class="modal-overlay" id="modal-ods" style="display:none;">
      <div class="modal-container" style="max-width:780px;max-height:90vh;overflow-y:auto;">
        <div class="modal-header">
          <h2 id="modal-ods-titulo">Nueva Orden de Servicio</h2>
          <button class="modal-close" id="modal-ods-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="ods-edit-id">

          <!-- Informacion General -->
          <div class="os-section">
            <h3 class="os-section-title">Informacion General</h3>
            <div class="os-grid">
              <div class="os-field">
                <label>N° Orden</label>
                <input type="text" id="ods-numero-orden" class="os-input" readonly placeholder="Cargando..." style="background:#f1f5f9;font-weight:600;">
              </div>
              <div class="os-field">
                <label>Cotizacion Referencia <span style="color:#ef4444">*</span></label>
                <select id="ods-cotizacion-ref" class="os-input">
                  <option value="">Cargando cotizaciones...</option>
                </select>
              </div>
              <div class="os-field">
                <label>Version</label>
                <input type="text" id="ods-version" class="os-input" value="01">
              </div>
              <div class="os-field">
                <label>Cliente</label>
                <input type="text" id="ods-cliente-nombre" class="os-input" readonly placeholder="Se auto-completa al elegir cotizacion">
                <input type="hidden" id="ods-cliente-id">
              </div>
              <div class="os-field">
                <label>RUC</label>
                <input type="text" id="ods-cliente-ruc" class="os-input" readonly>
              </div>
              <div class="os-field">
                <label>Fecha de Aceptacion <span style="color:#ef4444">*</span></label>
                <input type="date" id="ods-fecha-aceptacion" class="os-input" disabled>
              </div>
              <div class="os-field">
                <label>Fecha Tentativa</label>
                <input type="date" id="ods-fecha-tentativa" class="os-input">
              </div>
              <div class="os-field">
                <label>Emitido por <span style="color:#ef4444">*</span></label>
                <input type="text" id="ods-emitido-por-nombre" class="os-input" readonly style="background:#f1f5f9;font-weight:600;">
                <input type="hidden" id="ods-emitido-por">
              </div>
              <div class="os-field">
                <label>IGV (18%)</label>
                <select id="ods-igv" class="os-input">
                  <option value="1" selected>Si - Con IGV (18%)</option>
                  <option value="0">No - Sin IGV</option>
                </select>
              </div>
              <div class="oc-field" style="grid-column: 1 / -1;">
                  <label class="oc-label">Observaciones</label>
                  <textarea id="oc-observaciones" class="oc-input" rows="3" placeholder="Observaciones adicionales..."></textarea>
              </div>
            </div>
          </div>

          <!-- Info cotizacion -->
          <div id="ods-cotizacion-info" style="display:none;margin-bottom:20px;">
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;display:flex;align-items:center;gap:12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
              <div>
                <strong id="ods-cot-info-numero" style="color:#0284c7;"></strong>
                <span id="ods-cot-info-detalle" style="color:#475569;margin-left:8px;"></span>
              </div>
            </div>
          </div>

          <!-- Detalle de Servicios -->
          <div class="os-section">
            <div class="os-section-header">
              <h3 class="os-section-title">Detalle de Servicios</h3>
              <button type="button" class="btn-secondary" id="btn-agregar-linea-servicio">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Servicio
              </button>
            </div>
            <div class="os-table-wrapper">
              <table class="os-table">
                <thead>
                  <tr>
                    <th style="width:22%;">Servicio</th>
                    <th style="width:18%;">Planta</th>
                    <th style="width:18%;">Área</th>
                    <th style="width:16%;">Frecuencia</th>
                    <th style="width:16%;">Precio</th>
                    <th style="width:10%;"></th>
                  </tr>
                </thead>
                <tbody id="ods-detalle-body"></tbody>
              </table>
            </div>
          </div>

          <!-- Productos / Materiales -->
          <div class="os-section">
            <div class="os-section-header">
              <h3 class="os-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                Productos / Materiales
              </h3>
              <div class="os-section-header-actions">
                <button type="button" class="btn-secondary" id="btn-agregar-equipo-ods" style="font-size:12px;padding:4px 10px;" title="Agregar equipo por servicio/planta/área">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Agregar Equipo
                </button>
                <button type="button" class="btn-secondary" id="btn-agregar-producto-ods" style="font-size:12px;padding:4px 10px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Agregar Producto
                </button>
              </div>
            </div>
            <div class="os-table-wrapper">
              <table class="os-table ods-productos-table">
                <thead>
                  <tr>
                    <th style="width:42%;">Producto</th>
                    <th style="width:14%;text-align:center;">Cantidad</th>
                    <th style="width:30%;">Observación</th>
                    <th style="width:14%;" class="ods-acciones-head">&nbsp;</th>
                  </tr>
                </thead>
                <tbody id="ods-productos-body"></tbody>
              </table>
            </div>
            <div id="ods-productos-empty" style="text-align:center;padding:12px;color:#94a3b8;font-size:13px;">
              Sin productos. Use "Agregar Equipo" o "Agregar Producto".
            </div>
          </div>

          <!-- Total -->
          <div class="os-total-container">
            <div class="os-total-row">
              <span class="os-total-label">Subtotal:</span>
              <span class="os-total-value" id="ods-subtotal">S/ 0.00</span>
            </div>
            <div class="os-total-row" id="ods-igv-row">
              <span class="os-total-label">IGV (18%):</span>
              <span class="os-total-value" id="ods-igv-monto">S/ 0.00</span>
            </div>
            <div class="os-total-row os-total-final">
              <span class="os-total-label">Total Costo:</span>
              <span class="os-total-value" id="ods-total-costo">S/ 0.00</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" id="modal-ods-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-ods-guardar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Guardar Orden
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminacion -->
    <div class="modal-overlay" id="modal-ods-eliminar" style="display:none;">
      <div class="modal-container" style="max-width:420px;">
        <div class="modal-header">
          <h2>Confirmar Eliminacion</h2>
          <button class="modal-close" id="modal-ods-eliminar-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <p>Estas seguro de que deseas eliminar la orden <strong id="ods-eliminar-numero"></strong>?</p>
          <p style="color:#64748b;font-size:0.9em;">Se eliminaran todos los detalles asociados. Esta accion no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-ods-eliminar-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-ods-eliminar-confirmar" style="background:#ef4444;">Eliminar</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="modal-ods-agregar-equipo" style="display:none;">
      <div class="modal-container" style="max-width:520px;">
        <div class="modal-header">
          <h2>Agregar Equipo</h2>
          <button class="modal-close" id="modal-ods-agregar-equipo-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <div class="os-field" style="margin-bottom:12px;">
            <label>Bloque Servicio / Planta / Área <span style="color:#ef4444">*</span></label>
            <select id="ods-agregar-equipo-grupo" class="os-input"></select>
          </div>
          <div class="os-field" style="margin-bottom:8px;">
            <label>Equipo <span style="color:#ef4444">*</span></label>
            <select id="ods-agregar-equipo-id" class="os-input"></select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-ods-agregar-equipo-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-ods-agregar-equipo-confirmar">Agregar</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="modal-ods-agregar-producto" style="display:none;">
      <div class="modal-container" style="max-width:520px;">
        <div class="modal-header">
          <h2>Agregar Producto</h2>
          <button class="modal-close" id="modal-ods-agregar-producto-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <div class="os-field" style="margin-bottom:12px;">
            <label>Bloque Servicio / Planta / Área <span style="color:#ef4444">*</span></label>
            <select id="ods-agregar-producto-grupo" class="os-input"></select>
          </div>
          <div class="os-field" style="margin-bottom:12px;">
            <label>Producto <span style="color:#ef4444">*</span></label>
            <select id="ods-agregar-producto-id" class="os-input"></select>
          </div>
          <div class="os-field" style="margin-bottom:12px;">
            <label>Cantidad</label>
            <input id="ods-agregar-producto-cantidad" class="os-input" type="number" min="0.01" step="0.01" value="1">
          </div>
          <div class="os-field" style="margin-bottom:0;">
            <label>Observación</label>
            <input id="ods-agregar-producto-observacion" class="os-input" type="text" maxlength="200" placeholder="Opcional">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-ods-agregar-producto-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-ods-agregar-producto-confirmar">Agregar</button>
        </div>
      </div>
    </div>

  </div>
  `;
}

// =============================
// FUNCIONES
// =============================

async function cargarEstadisticasODS() {
  try {
    const res = await ordenServicioService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;

    const el = (id: string) => document.getElementById(id);
    if (el('stat-total-ordenes')) el('stat-total-ordenes')!.textContent = String(stats.total_ordenes ?? 0);
    if (el('stat-valor-total')) el('stat-valor-total')!.textContent = 'S/ ' + Number(stats.total_valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
    if (el('stat-ordenes-mes')) el('stat-ordenes-mes')!.textContent = String(stats.ordenes_mes_actual ?? 0);
    if (el('stat-valor-mes')) el('stat-valor-mes')!.textContent = 'S/ ' + Number(stats.valor_mes_actual ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
  } catch (e) {
    console.error('Error cargando estadisticas ODS:', e);
  }
}

async function cargarOrdenesServicio() {
  const tbody = document.getElementById('ods-tabla-body');
  if (!tbody) return;

  try {
    const params: any = {};
    const search = (document.getElementById('ods-search') as HTMLInputElement)?.value?.trim();
    const desde = (document.getElementById('ods-filter-desde') as HTMLInputElement)?.value;
    const hasta = (document.getElementById('ods-filter-hasta') as HTMLInputElement)?.value;
    if (search) params.search = search;
    if (desde) params.fecha_desde = desde;
    if (hasta) params.fecha_hasta = hasta;

    const res = await ordenServicioService.getAll(params);
    const raw = res.data || res;
    odsListData = Array.isArray(raw) ? raw : (raw as any).data || [];

    if (odsListData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">No se encontraron ordenes de servicio</td></tr>';
      return;
    }

    const formatFecha = (f: string | null | undefined): string => {
      if (!f) return '-';
      const [y, m, d] = f.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    };

    tbody.innerHTML = odsListData.map(o => {
      const fechaAcep = formatFecha(o.fecha_aceptacion);
      const fechaTent = formatFecha(o.fecha_tentativa);
      const total = Number(o.total_costo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
      const cotNum = o.cotizacion?.numero_cotizacion || o.cotizacion_numero || '-';
      return '<tr>' +
        '<td><strong>' + (o.numero_orden || '') + '</strong></td>' +
        '<td>' + (o.cliente?.nombre_empresa || '-') + '</td>' +
        '<td>' + cotNum + '</td>' +
        '<td>' + fechaAcep + '</td>' +
        '<td>' + fechaTent + '</td>' +
        '<td><strong>S/ ' + total + '</strong></td>' +
        '<td><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;' + (o.estado === 'Aprobado' ? 'background:#dcfce7;color:#166534;' : o.estado === 'Rechazado' ? 'background:#fee2e2;color:#991b1b;' : o.estado === 'Programado' ? 'background:#f0f9ff;color:#0369a1;border:1px solid #bae6fd;' : 'background:#fef3c7;color:#92400e;') + '">' + (o.estado || 'Aprobado') + '</span></td>' +
        '<td>' +
          '<div style="display:flex; gap:6px;">' +
            // BOTÓN VER (Solo lectura)
            '<button class="btn-icon btn-ver-ods" data-id="' + o.id + '" title="Ver Detalle">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
            '</button>' +
            // BOTÓN DESCARGAR PDF
            '<button class="btn-icon btn-pdf-ods" data-id="' + o.id + '" data-numero="' + (o.numero_orden || '') + '" title="Descargar PDF" style="color:#7c3aed;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>' +
            '</button>' +
            // BOTÓN EDITAR (El que ya tenías)
            '<button class="btn-icon btn-editar-ods" data-id="' + o.id + '" title="Editar" style="color: #0284c7;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
            '</button>' +
            // BOTÓN ELIMINAR
            '<button class="btn-icon btn-eliminar-ods" data-id="' + o.id + '" data-numero="' + (o.numero_orden || '') + '" title="Eliminar" style="color:#ef4444;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
            '</button>' +
          '</div>' +
        '</td>'
      '</tr>';
    }).join('');

    bindAccionesTabla();
  } catch (e) {
    console.error('Error cargando ordenes:', e);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar ordenes</td></tr>';
  }
}

function bindAccionesTabla() {
  document.querySelectorAll('.btn-ver-ods').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarODS(id, true); // true = Solo lectura
    });
  });

  document.querySelectorAll('.btn-editar-ods').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarODS(id, false); // false = Editable
    });
  });
  document.querySelectorAll('.btn-eliminar-ods').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const numero = (btn as HTMLElement).dataset.numero || '';
      abrirModalEliminarODS(id, numero);
    });
  });

  document.querySelectorAll('.btn-pdf-ods').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const numero = (btn as HTMLElement).dataset.numero || '';
      try {
        mostrarToast('success', 'PDF', 'Generando PDF...');
        await ordenServicioService.downloadPDF(id);
        mostrarToast('success', 'PDF', 'PDF descargado: ' + numero);
      } catch (e) {
        console.error('Error descargando PDF:', e);
        mostrarToast('error', 'Error', 'Error al generar el PDF');
      }
    });
  });
}

async function cargarDropdownCotizaciones() {
  const select = document.getElementById('ods-cotizacion-ref') as HTMLSelectElement;
  if (!select) return;
  try {
    const res = await ordenServicioService.getCotizacionesDisponibles();
    const raw = res.data || res;
    cotizacionesDisponibles = Array.isArray(raw) ? raw : (raw as any).data || [];

    select.innerHTML = '<option value="">Seleccione una cotizacion...</option>' +
      cotizacionesDisponibles.map(c =>
        '<option value="' + c.id + '">' + c.numero_cotizacion + ' - ' + (c.cliente?.nombre_empresa || '') + ' (S/ ' + Number(c.total).toFixed(2) + ')</option>'
      ).join('');
  } catch (e) {
    console.error('Error cargando cotizaciones:', e);
    select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

async function cargarServiciosDisponibles() {
  try {
    const res = await servicioService.getAll({ estado: 'activo', per_page: 100 });
    const raw = res.data || res;
    serviciosDisponibles = Array.isArray(raw) ? raw : (raw as any).data || [];
  } catch (e) {
    console.error('Error cargando servicios:', e);
    serviciosDisponibles = [];
  }
}

async function cargarDatosCotizacion(cotizacionId: number) {
  try {
    const res = await ordenServicioService.getDesdeCotizacion(cotizacionId);
    const raw = res.data || res;
    const data = (raw as any).data || raw;

    // Auto-llenar cliente
    (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = data.cliente?.nombre_empresa || '';
    (document.getElementById('ods-cliente-id') as HTMLInputElement).value = String(data.cliente?.id || '');
    (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = data.cliente?.ruc || '';

    // Info cotizacion
    const infoDiv = document.getElementById('ods-cotizacion-info') as HTMLElement;
    infoDiv.style.display = 'block';
    (document.getElementById('ods-cot-info-numero') as HTMLElement).textContent = data.cotizacion?.numero_cotizacion || '';
    (document.getElementById('ods-cot-info-detalle') as HTMLElement).textContent =
      '| Emitida: ' + (data.cotizacion?.fecha_emision || '') + ' | Total: S/ ' + Number(data.total || 0).toFixed(2);

    // Auto-llenar fecha de aceptación desde estado de cotización
    const fechaAceptacion = String(data.cotizacion?.fecha_aceptacion || data.cotizacion?.fecha_emision || '').split('T')[0];
    const fechaAcepInput = document.getElementById('ods-fecha-aceptacion') as HTMLInputElement;
    fechaAcepInput.value = fechaAceptacion;
    fechaAcepInput.disabled = true;

    // Auto-setear IGV desde cotizacion
    incluyeIgv = data.incluye_igv !== false;
    const igvSelect = document.getElementById('ods-igv') as HTMLSelectElement;
    if (igvSelect) igvSelect.value = incluyeIgv ? '1' : '0';
    const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';

    // Auto-llenar detalles
    const detalles = data.detalles || [];
    const tbody = document.getElementById('ods-detalle-body') as HTMLElement;
    tbody.innerHTML = '';
    contadorLineasSrv = 0;

    // Cargar plantas del cliente antes de crear las filas
    const idCliente = data.cliente?.id;
    if (idCliente) await cargarPlantasClienteODS(idCliente);

    detalles.forEach((d: any) => {
      agregarLineaConDatos(
        d.id_servicio,
        d.servicio_nombre || '',
        d.frecuencia || '',
        Number(d.precio || 0),
        d.id_cliente_planta || null,
        normalizeAreaIds(d.id_cliente_planta_area)
      );
    });

    // Auto-llenar productos y equipos derivados de la cotización
    odsProductoRows = Array.isArray(data.productos)
      ? data.productos.map((p: any) => ({
          id_producto: Number(p.id_producto || 0),
          cantidad: Number(p.cantidad || 0),
          observacion: p.observacion || '',
          id_servicio: p.id_servicio || 0,
          id_cliente_planta: p.id_cliente_planta || null,
          id_cliente_planta_area: p.id_cliente_planta_area || null,
          id_equipo: p.id_equipo || null,
          equipo_descripcion: p.equipo_descripcion || '',
        }))
      : [];

    odsEquipoRows = Array.isArray(data.equipos)
      ? data.equipos.map((e: any) => ({
          id_equipo: Number(e.id_equipo || 0),
          observacion: e.observacion || '',
          equipo_descripcion: e.equipo_descripcion || '',
          id_servicio: e.id_servicio || 0,
          id_cliente_planta: e.id_cliente_planta || null,
          id_cliente_planta_area: e.id_cliente_planta_area || null,
        }))
      : [];

    renderProductosODS();
    renderEquiposODS();

    calcularTotalCosto();

  } catch (e) {
    console.error('Error cargando datos de cotizacion:', e);
    mostrarToast('error', 'Error', 'No se pudieron cargar los datos de la cotizacion');
  }
}

function buildServicioSelectOptions(selectedId: number | null): string {
  let opts = '<option value="">Seleccione servicio...</option>';
  serviciosDisponibles.forEach(s => {
    const sel = (selectedId && s.id === selectedId) ? 'selected' : '';
    opts += '<option value="' + s.id + '" ' + sel + '>' + s.nombre + '</option>';
  });
  return opts;
}

async function cargarPlantasClienteODS(idCliente: number) {
  try {
    const res = await clienteService.getPlantas(idCliente);
    const raw = res.data || res;
    plantasClienteDataODS = (raw as any).data || raw;
  } catch {
    plantasClienteDataODS = [];
  }
  // Actualizar selects existentes
  document.querySelectorAll('#ods-detalle-body .planta-select').forEach(sel => {
    const s = sel as HTMLSelectElement;
    const cur = s.value;
    s.innerHTML = getPlantaOptionsODS();
    if (cur) s.value = cur;
  });
}

function getPlantaOptionsODS(selectedId?: number | null): string {
  let opts = '<option value="">-- Planta --</option>';
  plantasClienteDataODS.forEach((p: any) => {
    if (p.estado !== 'Activo') return;
    const sel = selectedId && p.id == selectedId ? 'selected' : '';
    opts += '<option value="' + p.id + '" ' + sel + '>' + p.nombre + '</option>';
  });
  return opts;
}

function getAreaOptionsODS(idPlanta: number | null, selectedId?: number | null): string {
  let opts = '<option value="">-- Área --</option>';
  if (!idPlanta) return opts;
  const planta = plantasClienteDataODS.find((p: any) => p.id == idPlanta);
  if (!planta) return opts;
  const areas = planta.areas_activas || planta.areas || [];
  areas.forEach((a: any) => {
    if (a.estado && a.estado !== 'Activo') return;
    const sel = selectedId && a.id == selectedId ? 'selected' : '';
    opts += '<option value="' + a.id + '" ' + sel + '>' + a.nombre + '</option>';
  });
  return opts;
}

function agregarLineaConDatos(idServicio: number | null, nombre: string, frecuencia: string, precio: number, idPlanta?: number | null, idAreas: number[] = []) {
  const tbody = document.getElementById('ods-detalle-body');
  if (!tbody) return;

  contadorLineasSrv++;
  const lineaId = 'linea-srv-' + contadorLineasSrv;

  const frecOpts = ['', 'Única', 'Días de la semana', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Semestral', 'Anual'];
  const frecuenciaBase = frecuenciaBaseParaSelectODS(frecuencia);
  const frecSelect = frecOpts.map(f => {
    const label = f || 'A SOLICITUD DEL CLIENTE';
    const optionValue = f || 'A SOLICITUD DEL CLIENTE'; // Usar el mismo valor que se guardará
    const normalizedBase = frecuenciaBase ? frecuenciaBase.toLowerCase() : '';
    const normalizedOpt = optionValue.toLowerCase();
    const sel = (normalizedBase === normalizedOpt) ? 'selected' : '';
    return '<option value="' + optionValue + '" ' + sel + '>' + label + '</option>';
  }).join('');

  // Si el servicio viene de cotizacion y no esta en la lista, agregarlo temporalmente
  let servicioOpts = buildServicioSelectOptions(idServicio);
  if (idServicio && !serviciosDisponibles.find(s => s.id === idServicio) && nombre) {
    servicioOpts += '<option value="' + idServicio + '" selected>' + nombre + '</option>';
  }

  const html =
    '<tr id="' + lineaId + '" data-id-servicio="' + (idServicio || '') + '">' +
      '<td>' +
        '<select class="os-input os-input-sm servicio-select">' + servicioOpts + '</select>' +
        '<input type="hidden" class="servicio-id-hidden" value="' + (idServicio || '') + '">' +
      '</td>' +
      '<td>' +
        '<select class="os-input os-input-sm planta-select">' + getPlantaOptionsODS(idPlanta) + '</select>' +
      '</td>' +
      '<td>' +
        '<div class="area-multi-wrapper-ods" style="display:flex;flex-direction:column;gap:5px;">' +
          '<select class="area-select os-input os-input-sm" style="display:none;">' + getAreaOptionsODS(idPlanta || null, idAreas[0] || null) + '</select>' +
          '<select class="area-select-multi" multiple style="display:none;">' + getAreaOptionsMultiODS(idPlanta || null, idAreas) + '</select>' +
          '<button type="button" class="area-picker-toggle-ods os-input os-input-sm" style="text-align:left;display:flex;justify-content:space-between;align-items:center;background:#fff;">Seleccionar áreas <span style="color:#64748b;">▾</span></button>' +
          '<div class="area-picker-panel-ods" style="display:none;position:static;background:#fff;border:1px solid #dbe3ef;border-radius:10px;padding:8px;box-shadow:0 4px 10px rgba(0,0,0,0.06);">' +
            '<div class="area-picker-options-ods" style="max-height:150px;overflow:auto;padding-right:4px;"></div>' +
            '<div style="display:flex;gap:6px;margin-top:8px;">' +
              '<button type="button" class="area-select-all-ods" style="padding:2px 8px;border:1px solid #cbd5e1;background:#fff;border-radius:999px;font-size:11px;color:#475569;cursor:pointer;">Todas</button>' +
              '<button type="button" class="area-clear-all-ods" style="padding:2px 8px;border:1px solid #cbd5e1;background:#fff;border-radius:999px;font-size:11px;color:#475569;cursor:pointer;">Limpiar</button>' +
            '</div>' +
          '</div>' +
          '<small class="area-multi-summary-ods" style="display:block;font-size:11px;">Sin áreas seleccionadas</small>' +
        '</div>' +
      '</td>' +
      '<td>' +
        '<select class="os-input os-input-sm frecuencia-select">' + frecSelect + '</select>' +
        construirFrecuenciaDiasHtmlODS(lineaId) +
      '</td>' +
      '<td>' +
        '<input type="number" class="os-input os-input-sm precio-input" value="' + precio.toFixed(2) + '" min="0" step="0.01">' +
      '</td>' +
      '<td>' +
        '<button type="button" class="btn-icon btn-eliminar-linea" data-linea="' + lineaId + '" title="Eliminar" style="color:#ef4444;">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<polyline points="3 6 5 6 21 6"></polyline>' +
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
          '</svg>' +
        '</button>' +
      '</td>' +
    '</tr>';

  tbody.insertAdjacentHTML('beforeend', html);
  const fila = document.getElementById(lineaId) as HTMLElement | null;
  if (fila) {
    bindAreaMultiInteractionsODS(fila);
    setFrecuenciaDiasDesdeTextoODS(fila, frecuencia || '');
  }
  bindLineasServicios();
}

function agregarLineaVacia() {
  agregarLineaConDatos(null, '', '', 0);
  // Focus en el select de servicio
  const lastRow = document.getElementById('linea-srv-' + contadorLineasSrv);
  if (lastRow) {
    const select = lastRow.querySelector('.servicio-select') as HTMLSelectElement;
    if (select) select.focus();
  }
}

function bindLineasServicios() {
  // Eliminar listeners previos clonando
  document.querySelectorAll('.btn-eliminar-linea').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.btn-eliminar-linea').forEach(btn => {
    btn.addEventListener('click', () => {
      const lineaId = (btn as HTMLElement).dataset.linea;
      if (lineaId) {
        document.getElementById(lineaId)?.remove();
        calcularTotalCosto();
      }
    });
  });
  document.querySelectorAll('.precio-input').forEach(input => {
    (input as HTMLElement).removeEventListener('input', calcularTotalCosto);
    (input as HTMLElement).addEventListener('input', calcularTotalCosto);
  });
  // Sincronizar select servicio con hidden
  document.querySelectorAll('.servicio-select').forEach(sel => {
    (sel as HTMLElement).removeEventListener('change', syncServicioHidden);
    (sel as HTMLElement).addEventListener('change', syncServicioHidden);
  });
  // Cascada planta → área
  document.querySelectorAll('#ods-detalle-body .planta-select').forEach(sel => {
    const s = sel as HTMLSelectElement;
    s.replaceWith(s.cloneNode(true));
  });
  document.querySelectorAll('#ods-detalle-body .planta-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const tr = (e.target as HTMLElement).closest('tr');
      if (!tr) return;
      const idPlanta = parseInt((e.target as HTMLSelectElement).value) || null;
      const areaSel = tr.querySelector('.area-select') as HTMLSelectElement;
      const areaMulti = tr.querySelector('.area-select-multi') as HTMLSelectElement;
      if (areaSel) areaSel.innerHTML = getAreaOptionsODS(idPlanta);
      if (areaMulti) {
        areaMulti.innerHTML = getAreaOptionsMultiODS(idPlanta);
        bindAreaMultiInteractionsODS(tr as HTMLElement);
      }
    });
  });

  // Frecuencia días de semana por línea
  document.querySelectorAll('#ods-detalle-body .frecuencia-select').forEach(sel => {
    const s = sel as HTMLSelectElement;
    s.replaceWith(s.cloneNode(true));
  });
  document.querySelectorAll('#ods-detalle-body .frecuencia-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const tr = (e.target as HTMLElement).closest('tr');
      if (!tr) return;
      actualizarUIFrecuenciaDiasODS(tr as HTMLElement);
    });
  });
}

function syncServicioHidden(e: Event) {
  const select = e.target as HTMLSelectElement;
  const tr = select.closest('tr');
  if (tr) {
    const hidden = tr.querySelector('.servicio-id-hidden') as HTMLInputElement;
    if (hidden) hidden.value = select.value;
    tr.setAttribute('data-id-servicio', select.value);
  }
}

function calcularTotalCosto() {
  const lineas = document.querySelectorAll('#ods-detalle-body tr');
  let subtotal = 0;
  lineas.forEach(linea => {
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    subtotal += precio;
  });
  const igv = incluyeIgv ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
  const total = subtotal + igv;

  const elSub = document.getElementById('ods-subtotal');
  const elIgv = document.getElementById('ods-igv-monto');
  const elTotal = document.getElementById('ods-total-costo');
  if (elSub) elSub.textContent = 'S/ ' + subtotal.toFixed(2);
  if (elIgv) elIgv.textContent = 'S/ ' + igv.toFixed(2);
  if (elTotal) elTotal.textContent = 'S/ ' + total.toFixed(2);
}

// ===== PRODUCTOS / MATERIALES ODS =====

async function cargarProductosDisponiblesODS() {
  if (productosDisponiblesODS.length > 0) return;
  try {
    const res = await productoService.getAll({ estado: 'Activo', per_page: 500 });
    const raw = res.data || res;
    productosDisponiblesODS = Array.isArray(raw) ? raw : (raw as any).data || [];
  } catch (e) {
    console.error('Error cargando productos ODS:', e);
    productosDisponiblesODS = [];
  }
}

async function cargarEquiposDisponiblesODS() {
  if (equiposDisponiblesODS.length > 0) return;
  try {
    const res = await equipoService.getAll({ estado: 'Activo', per_page: 500 });
    const raw = res.data || res;
    equiposDisponiblesODS = Array.isArray(raw) ? raw : (raw as any).data || [];
  } catch (e) {
    console.error('Error cargando equipos ODS:', e);
    equiposDisponiblesODS = [];
  }
}

function buildProductoSelectOpts(selectedId: number): string {
  let opts = '<option value="">Seleccione producto...</option>';
  productosDisponiblesODS.forEach(p => {
    const sel = p.id === selectedId ? 'selected' : '';
    opts += `<option value="${p.id}" ${sel}>${p.descripcion}${p.unidad ? ' (' + p.unidad + ')' : ''}</option>`;
  });
  return opts;
}

function getEquipoName(idEquipo?: number | null): string {
  if (!idEquipo) return '';
  const equipo = equiposDisponiblesODS.find((eq: any) => eq.id === idEquipo);
  return equipo?.descripcion || `Equipo #${idEquipo}`;
}

function getServiceName(idServicio?: number): string {
  if (!idServicio) return '';
  const srv = serviciosDisponibles.find(s => s.id === idServicio);
  if (srv) return srv.nombre;
  // Buscar en las filas del detalle
  const rows = document.querySelectorAll('#ods-detalle-body tr');
  for (const row of rows) {
    const hidden = row.querySelector('.servicio-id-hidden') as HTMLInputElement;
    const select = row.querySelector('.servicio-select') as HTMLSelectElement;
    if (hidden && Number(hidden.value) === idServicio && select) {
      return select.options[select.selectedIndex]?.text || `Servicio #${idServicio}`;
    }
  }
  return `Servicio #${idServicio}`;
}

function getPlantaName(idPlanta?: number | null): string {
  if (!idPlanta) return '';
  const planta = plantasClienteDataODS.find((p: any) => p.id == idPlanta);
  return planta?.nombre || `Planta #${idPlanta}`;
}

function getAreaName(idPlanta?: number | null, idArea?: number | null): string {
  if (!idArea || !idPlanta) return '';
  const planta = plantasClienteDataODS.find((p: any) => p.id == idPlanta);
  if (!planta) return `Área #${idArea}`;
  const areas = planta.areas_activas || planta.areas || [];
  const area = areas.find((a: any) => a.id == idArea);
  return area?.nombre || `Área #${idArea}`;
}

function getGroupLabel(idServicio?: number, idPlanta?: number | null, idArea?: number | null): string {
  let label = getServiceName(idServicio);
  const plantaNombre = getPlantaName(idPlanta);
  const areaNombre = getAreaName(idPlanta, idArea);
  if (plantaNombre) label += ` → ${plantaNombre}`;
  if (areaNombre) label += ` → ${areaNombre}`;
  return label;
}

function getGroupKey(r: { id_servicio?: number; id_cliente_planta?: number | null; id_cliente_planta_area?: number | null }): string {
  return `${r.id_servicio || 0}-${r.id_cliente_planta || 0}-${r.id_cliente_planta_area || 0}`;
}

function getODSGroupKey(r: { id_servicio?: number; id_cliente_planta?: number | null; id_cliente_planta_area?: number | null; id_equipo?: number | null }): string {
  return `${r.id_servicio || 0}-${r.id_cliente_planta || 0}-${r.id_cliente_planta_area || 0}-${r.id_equipo || 0}`;
}

function getODSGroupLabel(row: { id_servicio?: number; id_cliente_planta?: number | null; id_cliente_planta_area?: number | null; id_equipo?: number | null; equipo_descripcion?: string }): string {
  const servicioNombre = getServiceName(row.id_servicio);
  const plantaNombre = getPlantaName(row.id_cliente_planta);
  const areaNombre = getAreaName(row.id_cliente_planta, row.id_cliente_planta_area);
  const equipoNombre = row.equipo_descripcion || getEquipoName(row.id_equipo) || 'Sin equipo';
  const partes = [servicioNombre];
  if (plantaNombre) partes.push(plantaNombre);
  if (areaNombre) partes.push(areaNombre);
  partes.push(equipoNombre);
  return partes.join(' → ');
}

function parseGroupKey(groupKey: string): { idServicio: number; idPlanta: number | null; idArea: number | null } {
  const [idServicioRaw, idPlantaRaw, idAreaRaw] = groupKey.split('-').map(v => Number(v || 0));
  return {
    idServicio: idServicioRaw || 0,
    idPlanta: idPlantaRaw || null,
    idArea: idAreaRaw || null,
  };
}

function parseODSGroupKey(groupKey: string): { idServicio: number; idPlanta: number | null; idArea: number | null; idEquipo: number | null } {
  const [idServicioRaw, idPlantaRaw, idAreaRaw, idEquipoRaw] = groupKey.split('-').map(v => Number(v || 0));
  return {
    idServicio: idServicioRaw || 0,
    idPlanta: idPlantaRaw || null,
    idArea: idAreaRaw || null,
    idEquipo: idEquipoRaw || null,
  };
}

async function abrirModalAgregarEquipoODS() {
  const modal = document.getElementById('modal-ods-agregar-equipo') as HTMLElement;
  const selGrupo = document.getElementById('ods-agregar-equipo-grupo') as HTMLSelectElement;
  const selEquipo = document.getElementById('ods-agregar-equipo-id') as HTMLSelectElement;
  if (!modal || !selGrupo || !selEquipo) return;

  const groups = getGroupOrderFromDetalleODS();
  if (groups.length === 0) {
    mostrarToast('error', 'Sin servicios', 'Primero agregue una línea de servicio con planta/área');
    return;
  }

  await cargarEquiposDisponiblesODS();

  selGrupo.innerHTML = groups.map((key) => {
    const p = parseGroupKey(key);
    return `<option value="${key}">${getGroupLabel(p.idServicio, p.idPlanta, p.idArea)}</option>`;
  }).join('');

  selEquipo.innerHTML = '<option value="">Seleccione equipo...</option>' + equiposDisponiblesODS.map((eq: any) => {
    return `<option value="${eq.id}">${eq.descripcion}</option>`;
  }).join('');

  modal.style.display = 'flex';
}

function cerrarModalAgregarEquipoODS() {
  const modal = document.getElementById('modal-ods-agregar-equipo') as HTMLElement;
  if (modal) modal.style.display = 'none';
}

async function confirmarAgregarEquipoODS() {
  const selGrupo = document.getElementById('ods-agregar-equipo-grupo') as HTMLSelectElement;
  const selEquipo = document.getElementById('ods-agregar-equipo-id') as HTMLSelectElement;
  if (!selGrupo || !selEquipo) return;

  const groupKey = selGrupo.value;
  const idEquipo = Number(selEquipo.value || 0);
  if (!groupKey) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un bloque de servicio');
    return;
  }
  if (!idEquipo) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un equipo');
    return;
  }

  const { idServicio, idPlanta, idArea } = parseGroupKey(groupKey);
  const equipoDesc = getEquipoName(idEquipo);

  const existeEquipo = odsEquipoRows.some((r) =>
    r.id_equipo === idEquipo &&
    (r.id_servicio || 0) === idServicio &&
    (r.id_cliente_planta || 0) === (idPlanta || 0) &&
    (r.id_cliente_planta_area || 0) === (idArea || 0)
  );

  if (!existeEquipo) {
    odsEquipoRows.push({
      id_equipo: idEquipo,
      observacion: '',
      equipo_descripcion: equipoDesc,
      id_servicio: idServicio,
      id_cliente_planta: idPlanta,
      id_cliente_planta_area: idArea,
    });
  }

  renderProductosODS();
  cerrarModalAgregarEquipoODS();
  mostrarToast('success', 'Equipo agregado', 'Seleccione productos manualmente para este bloque');
}

function getGroupOrderFromDetalleODS(): string[] {
  const order: string[] = [];
  const lineas = document.querySelectorAll('#ods-detalle-body tr');
  lineas.forEach((linea) => {
    const idServicio = Number((linea.querySelector('.servicio-id-hidden') as HTMLInputElement)?.value || 0);
    if (!idServicio) return;
    const idPlanta = parseInt((linea.querySelector('.planta-select') as HTMLSelectElement)?.value || '0') || 0;
    const areasSeleccionadas = getAreaIdsFromODSRow(linea);
    const areas = areasSeleccionadas.length > 0 ? areasSeleccionadas : [0];
    areas.forEach((idArea) => {
      const key = `${idServicio}-${idPlanta}-${idArea || 0}`;
      if (!order.includes(key)) order.push(key);
    });
  });
  return order;
}

async function abrirModalAgregarProductoODS() {
  const modal = document.getElementById('modal-ods-agregar-producto') as HTMLElement;
  const selGrupo = document.getElementById('ods-agregar-producto-grupo') as HTMLSelectElement;
  const selProducto = document.getElementById('ods-agregar-producto-id') as HTMLSelectElement;
  const inputCantidad = document.getElementById('ods-agregar-producto-cantidad') as HTMLInputElement;
  const inputObs = document.getElementById('ods-agregar-producto-observacion') as HTMLInputElement;
  if (!modal || !selGrupo || !selProducto || !inputCantidad || !inputObs) return;

  const groups = getGroupOrderFromDetalleODS();
  if (groups.length === 0) {
    mostrarToast('error', 'Sin servicios', 'Primero agregue una línea de servicio con planta/área');
    return;
  }

  await cargarProductosDisponiblesODS();

  selGrupo.innerHTML = groups.map((key) => {
    const p = parseGroupKey(key);
    return `<option value="${key}">${getGroupLabel(p.idServicio, p.idPlanta, p.idArea)}</option>`;
  }).join('');

  selProducto.innerHTML = '<option value="">Seleccione producto...</option>' + productosDisponiblesODS.map((p: any) => {
    return `<option value="${p.id}">${p.descripcion}${p.unidad ? ' (' + p.unidad + ')' : ''}</option>`;
  }).join('');

  inputCantidad.value = '1';
  inputObs.value = '';
  modal.style.display = 'flex';
}

function cerrarModalAgregarProductoODS() {
  const modal = document.getElementById('modal-ods-agregar-producto') as HTMLElement;
  if (modal) modal.style.display = 'none';
}

function confirmarAgregarProductoODS() {
  const selGrupo = document.getElementById('ods-agregar-producto-grupo') as HTMLSelectElement;
  const selProducto = document.getElementById('ods-agregar-producto-id') as HTMLSelectElement;
  const inputCantidad = document.getElementById('ods-agregar-producto-cantidad') as HTMLInputElement;
  const inputObs = document.getElementById('ods-agregar-producto-observacion') as HTMLInputElement;
  if (!selGrupo || !selProducto || !inputCantidad || !inputObs) return;

  const groupKey = selGrupo.value;
  const idProducto = Number(selProducto.value || 0);
  const cantidad = Number(inputCantidad.value || 0);
  const observacion = (inputObs.value || '').trim();

  if (!groupKey) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un bloque de servicio');
    return;
  }
  if (!idProducto) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un producto');
    return;
  }
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    mostrarToast('error', 'Dato requerido', 'Ingrese una cantidad válida');
    return;
  }

  const { idServicio, idPlanta, idArea } = parseGroupKey(groupKey);
  odsProductoRows.push({
    id_producto: idProducto,
    cantidad,
    observacion,
    id_servicio: idServicio,
    id_cliente_planta: idPlanta,
    id_cliente_planta_area: idArea,
    id_equipo: null,
    equipo_descripcion: '',
  });

  renderProductosODS();
  cerrarModalAgregarProductoODS();
  mostrarToast('success', 'Producto agregado', 'Producto agregado al bloque seleccionado');
}

function renderProductosODS() {
  const tbody = document.getElementById('ods-productos-body');
  const emptyEl = document.getElementById('ods-productos-empty');
  if (!tbody) return;

  if (odsProductoRows.length === 0 && odsEquipoRows.length === 0) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  // Agrupar por servicio+planta+area+equipo (INCLUYENDO EQUIPO)
  const groupOrder: string[] = [];
  odsProductoRows.forEach(r => {
    const key = getODSGroupKey(r);
    if (!groupOrder.includes(key)) groupOrder.push(key);
  });
  odsEquipoRows.forEach(r => {
    const key = getODSGroupKey({
      id_servicio: r.id_servicio,
      id_cliente_planta: r.id_cliente_planta,
      id_cliente_planta_area: r.id_cliente_planta_area,
      id_equipo: r.id_equipo,
    });
    if (!groupOrder.includes(key)) groupOrder.push(key);
  });

  let html = '';
  groupOrder.forEach(groupKey => {
    const rows = odsProductoRows.filter(r => getODSGroupKey(r) === groupKey);
    const fromEquipo = odsEquipoRows.find((e) => getODSGroupKey({
      id_servicio: e.id_servicio,
      id_cliente_planta: e.id_cliente_planta,
      id_cliente_planta_area: e.id_cliente_planta_area,
      id_equipo: e.id_equipo,
    }) === groupKey);
    const first = rows[0] || {
      id_servicio: fromEquipo?.id_servicio,
      id_cliente_planta: fromEquipo?.id_cliente_planta,
      id_cliente_planta_area: fromEquipo?.id_cliente_planta_area,
      id_equipo: fromEquipo?.id_equipo,
      equipo_descripcion: fromEquipo?.equipo_descripcion,
    };
    const groupLabel = getODSGroupLabel(first);

    // Header azul con botón de eliminar grupo
    html += `<tr class="ods-equipo-header">
      <td colspan="3" class="ods-equipo-header-label">
        <div class="ods-equipo-header-main">
          <span class="ods-equipo-header-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            ${groupLabel}
          </span>
          <button type="button" class="btn-secondary btn-agregar-producto-grupo" data-group-key="${groupKey}" style="font-size:11px;padding:2px 8px;line-height:1.3;">+ Añadir producto</button>
        </div>
      </td>
      <td class="ods-equipo-header-actions">
        <button type="button" class="btn-eliminar-ods-grupo" data-group-key="${groupKey}" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;" title="Eliminar equipo y sus productos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    </tr>`;

    if (rows.length === 0) {
      html += `<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-size:12px;padding:8px;">Sin productos para este equipo. Use "Añadir producto".</td></tr>`;
      return;
    }

    // Filas de productos
    rows.forEach(r => {
      const idx = odsProductoRows.indexOf(r);
      html += `<tr data-prod-idx="${idx}">
        <td><select class="os-input os-input-sm ods-prod-select" data-idx="${idx}">${buildProductoSelectOpts(r.id_producto)}</select></td>
        <td style="text-align:center;"><input type="number" class="os-input os-input-sm ods-prod-cant" data-idx="${idx}" value="${r.cantidad}" min="0.01" step="0.01" style="width:80px;text-align:center;"></td>
        <td class="ods-prod-obs-cell"><input type="text" class="os-input os-input-sm ods-prod-obs" data-idx="${idx}" value="${r.observacion || ''}" placeholder="Opcional" maxlength="200"></td>
        <td class="ods-prod-action-cell"><button type="button" class="btn-icon ods-prod-remove" data-idx="${idx}" style="color:#ef4444;" title="Eliminar producto"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;
  bindProductosODSEvents();
}

function bindProductosODSEvents() {
  document.querySelectorAll('.btn-agregar-producto-grupo').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const groupKey = (e.currentTarget as HTMLElement).dataset.groupKey || '';
      if (!groupKey) return;
      const g = parseODSGroupKey(groupKey);
      await cargarProductosDisponiblesODS();
      agregarProductoODS(0, 1, '', g.idServicio, g.idPlanta, g.idArea, g.idEquipo);
    });
  });

  // Eliminar grupo completo (cascada)
  document.querySelectorAll('.btn-eliminar-ods-grupo').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const groupKey = (e.currentTarget as HTMLElement).dataset.groupKey || '';
      if (!groupKey) return;
      const groupToDelete = odsProductoRows.find(r => getODSGroupKey(r) === groupKey);
      const parsed = parseODSGroupKey(groupKey);
      odsProductoRows = odsProductoRows.filter(r => getODSGroupKey(r) !== groupKey);
      const idEquipo = groupToDelete?.id_equipo || parsed.idEquipo;
      odsEquipoRows = odsEquipoRows.filter((r) => !(
        r.id_equipo === idEquipo &&
        (r.id_servicio || 0) === (groupToDelete?.id_servicio || parsed.idServicio || 0) &&
        (r.id_cliente_planta || 0) === (groupToDelete?.id_cliente_planta || parsed.idPlanta || 0) &&
        (r.id_cliente_planta_area || 0) === (groupToDelete?.id_cliente_planta_area || parsed.idArea || 0)
      ));
      renderProductosODS();
      renderEquiposODS();
      mostrarToast('success', 'Equipo eliminado', 'Se eliminó el equipo y sus productos');
    });
  });

  // Cambiar producto
  document.querySelectorAll('.ods-prod-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = Number((e.target as HTMLSelectElement).dataset.idx);
      odsProductoRows[idx].id_producto = Number((e.target as HTMLSelectElement).value);
      // Actualizar stock display
    });
  });

  // Cambiar cantidad
  document.querySelectorAll('.ods-prod-cant').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx);
      odsProductoRows[idx].cantidad = parseFloat((e.target as HTMLInputElement).value) || 0;
      // Actualizar color de stock
    });
  });

  // Cambiar observación
  document.querySelectorAll('.ods-prod-obs').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx);
      odsProductoRows[idx].observacion = (e.target as HTMLInputElement).value;
    });
  });

  // Eliminar producto individual
  document.querySelectorAll('.ods-prod-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.idx);
      odsProductoRows.splice(idx, 1);
      renderProductosODS();
    });
  });
}

function agregarProductoODS(
  idProducto = 0,
  cantidad = 1,
  observacion = '',
  idServicio: number = 0,
  idPlanta: number | null = null,
  idArea: number | null = null,
  idEquipo: number | null = null,
) {
  odsProductoRows.push({
    id_producto: idProducto,
    cantidad,
    observacion,
    id_servicio: idServicio || undefined,
    id_cliente_planta: idPlanta,
    id_cliente_planta_area: idArea,
    id_equipo: idEquipo,
    equipo_descripcion: getEquipoName(idEquipo),
  });
  renderProductosODS();
}

// ===== EQUIPOS ODS =====

function buildEquipoSelectOpts(selectedId: number): string {
  let opts = '<option value="">Seleccione equipo...</option>';
  equiposDisponiblesODS.forEach(eq => {
    const sel = eq.id === selectedId ? 'selected' : '';
    opts += `<option value="${eq.id}" ${sel}>${eq.descripcion} - ${eq.marca || ''} ${eq.modelo || ''}</option>`;
  });
  return opts;
}

function renderEquiposODS() {
  const tbody = document.getElementById('ods-equipos-body');
  const emptyEl = document.getElementById('ods-equipos-empty');
  if (!tbody) return;

  if (odsEquipoRows.length === 0) {
    const groupsFromDetalle = getGroupOrderFromDetalleODS();
    if (groupsFromDetalle.length === 0) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
  }
  if (emptyEl) emptyEl.style.display = 'none';

  // Agrupar por servicio+planta+area
  const groupOrder = getGroupOrderFromDetalleODS();
  odsEquipoRows.forEach(r => {
    const key = getGroupKey(r);
    if (!groupOrder.includes(key)) groupOrder.push(key);
  });

  let html = '';
  groupOrder.forEach(groupKey => {
    const rows = odsEquipoRows.filter(r => getGroupKey(r) === groupKey);
    const parsed = parseGroupKey(groupKey);
    const first = rows[0];
    const srvId = first?.id_servicio || parsed.idServicio || 0;
    const idPlanta = first?.id_cliente_planta ?? parsed.idPlanta;
    const idArea = first?.id_cliente_planta_area ?? parsed.idArea;
    const hasGroup = srvId > 0 || !!idPlanta;

    if (hasGroup) {
      const groupLabel = getGroupLabel(srvId, idPlanta, idArea);
      html += `<tr class="ods-srv-header"><td colspan="3" style="background:#eef2ff;padding:6px 10px;font-size:12px;font-weight:600;color:#4338ca;border-bottom:2px solid #c7d2fe;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            ${groupLabel}
          </span>
          <button type="button" class="btn-secondary ods-equipo-add-group" data-group-key="${groupKey}" style="font-size:11px;padding:2px 8px;line-height:1.3;">
            + Añadir equipo
          </button>
        </div>
      </td></tr>`;
    } else if (groupOrder.length > 1) {
      html += `<tr class="ods-srv-header"><td colspan="3" style="background:#f8fafc;padding:6px 10px;font-size:12px;font-weight:600;color:#64748b;border-bottom:2px solid #e2e8f0;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        Generales</td></tr>`;
    }
    if (rows.length === 0) {
      html += `<tr><td colspan="3" style="text-align:center;color:#94a3b8;font-size:12px;padding:8px;">Sin equipos para este bloque</td></tr>`;
      return;
    }
    rows.forEach(r => {
      const idx = odsEquipoRows.indexOf(r);
      html += `<tr data-equipo-idx="${idx}">
        <td><select class="os-input os-input-sm ods-equipo-select" data-idx="${idx}">${buildEquipoSelectOpts(r.id_equipo)}</select></td>
        <td><input type="text" class="os-input os-input-sm ods-equipo-obs" data-idx="${idx}" value="${r.observacion || ''}" placeholder="Opcional" maxlength="200"></td>
        <td style="text-align:center;"><button type="button" class="btn-icon ods-equipo-remove" data-idx="${idx}" style="color:#ef4444;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;
  bindEquiposODSEvents();
}

function bindEquiposODSEvents() {
  document.querySelectorAll('.ods-equipo-add-group').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const groupKey = (e.currentTarget as HTMLElement).dataset.groupKey || '0-0-0';
      const group = parseGroupKey(groupKey);
      await cargarEquiposDisponiblesODS();
      agregarEquipoODS(0, '', group.idServicio, group.idPlanta, group.idArea);
    });
  });
  document.querySelectorAll('.ods-equipo-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = Number((e.target as HTMLSelectElement).dataset.idx);
      const nuevoIdEquipo = Number((e.target as HTMLSelectElement).value);
      const row = odsEquipoRows[idx];
      const oldIdEquipo = row?.id_equipo || 0;
      if (!row) return;

      odsProductoRows.forEach((p) => {
        if (
          (p.id_equipo || 0) === oldIdEquipo &&
          (p.id_servicio || 0) === (row.id_servicio || 0) &&
          (p.id_cliente_planta || 0) === (row.id_cliente_planta || 0) &&
          (p.id_cliente_planta_area || 0) === (row.id_cliente_planta_area || 0)
        ) {
          p.id_equipo = nuevoIdEquipo || null;
          p.equipo_descripcion = getEquipoName(nuevoIdEquipo);
        }
      });

      row.id_equipo = nuevoIdEquipo;
      row.equipo_descripcion = getEquipoName(nuevoIdEquipo);
      renderProductosODS();
    });
  });
  document.querySelectorAll('.ods-equipo-obs').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx);
      odsEquipoRows[idx].observacion = (e.target as HTMLInputElement).value;
    });
  });
  document.querySelectorAll('.ods-equipo-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.idx);
      const equipo = odsEquipoRows[idx];
      odsEquipoRows.splice(idx, 1);
      if (equipo) {
        odsProductoRows = odsProductoRows.filter((p) => !(
          (p.id_equipo || 0) === (equipo.id_equipo || 0) &&
          (p.id_servicio || 0) === (equipo.id_servicio || 0) &&
          (p.id_cliente_planta || 0) === (equipo.id_cliente_planta || 0) &&
          (p.id_cliente_planta_area || 0) === (equipo.id_cliente_planta_area || 0)
        ));
      }
      renderProductosODS();
      renderEquiposODS();
    });
  });
}

function agregarEquipoODS(
  idEquipo = 0,
  observacion = '',
  idServicio: number = 0,
  idPlanta: number | null = null,
  idArea: number | null = null,
) {
  odsEquipoRows.push({
    id_equipo: idEquipo,
    observacion,
    equipo_descripcion: getEquipoName(idEquipo),
    id_servicio: idServicio || undefined,
    id_cliente_planta: idPlanta,
    id_cliente_planta_area: idArea,
  });
  renderEquiposODS();
}

function limpiarFormODS() {
  (document.getElementById('ods-edit-id') as HTMLInputElement).value = '';
  (document.getElementById('ods-numero-orden') as HTMLInputElement).value = '';
  (document.getElementById('ods-version') as HTMLInputElement).value = '01';
  (document.getElementById('ods-cotizacion-ref') as HTMLSelectElement).value = '';
  (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = '';
  (document.getElementById('ods-cliente-id') as HTMLInputElement).value = '';
  (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = '';
  (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).value = '';
  (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).disabled = true;
  (document.getElementById('ods-fecha-tentativa') as HTMLInputElement).value = '';
  // Auto-llenar emitido por con usuario logueado
  const currentUser = authService.getUser();
  (document.getElementById('ods-emitido-por') as HTMLInputElement).value = currentUser ? String(currentUser.id) : '';
  (document.getElementById('ods-emitido-por-nombre') as HTMLInputElement).value = currentUser ? currentUser.nombre + (currentUser.apellido ? ' ' + currentUser.apellido : '') : '';
  (document.getElementById('ods-igv') as HTMLSelectElement).value = '1';
  incluyeIgv = true;
  const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
  if (igvRow) igvRow.style.display = 'flex';
  (document.getElementById('oc-observaciones') as HTMLTextAreaElement).value = '';
  (document.getElementById('ods-cotizacion-info') as HTMLElement).style.display = 'none';
  (document.getElementById('ods-detalle-body') as HTMLElement).innerHTML = '';
  (document.getElementById('ods-subtotal') as HTMLElement).textContent = 'S/ 0.00';
  (document.getElementById('ods-igv-monto') as HTMLElement).textContent = 'S/ 0.00';
  (document.getElementById('ods-total-costo') as HTMLElement).textContent = 'S/ 0.00';
  contadorLineasSrv = 0;
  // Limpiar productos y equipos
  odsProductoRows = [];
  odsEquipoRows = [];
  renderProductosODS();
  renderEquiposODS();
}

async function abrirModalNuevaODS() {
  limpiarFormODS();
  (document.getElementById('modal-ods-titulo') as HTMLElement).textContent = 'Nueva Orden de Servicio';
  const cotSelect = document.getElementById('ods-cotizacion-ref') as HTMLSelectElement;
  cotSelect.disabled = false;

  // Cargar siguiente número de orden (correlativo)
  try {
    const numRes = await ordenServicioService.getSiguienteNumero();
    const numRaw = numRes.data || numRes;
    const numData = (numRaw as any).data || numRaw;
    (document.getElementById('ods-numero-orden') as HTMLInputElement).value = numData.numero_orden || '';
  } catch (e) {
    console.error('Error obteniendo siguiente número:', e);
    (document.getElementById('ods-numero-orden') as HTMLInputElement).value = 'Error';
  }

  await Promise.all([cargarDropdownCotizaciones(), cargarServiciosDisponibles(), cargarProductosDisponiblesODS(), cargarEquiposDisponiblesODS()]);
  (document.getElementById('modal-ods') as HTMLElement).style.display = 'flex';
}

async function abrirModalEditarODS(id: number, soloLectura: boolean = false) {
  try {
    const res = await ordenServicioService.getById(id);
    const raw = res.data || res;
    const orden = (raw as any).data || raw;

    // 1. Limpiamos y cargamos catálogos
    limpiarFormODS();
    await Promise.all([cargarDropdownCotizaciones(), cargarServiciosDisponibles(), cargarProductosDisponiblesODS(), cargarEquiposDisponiblesODS()]);

    // 2. Título y IDs básicos
    (document.getElementById('modal-ods-titulo') as HTMLElement).textContent = soloLectura ? 'Consultar Orden de Servicio' : 'Editar Orden de Servicio';
    (document.getElementById('ods-edit-id') as HTMLInputElement).value = String(orden.id);
    (document.getElementById('ods-numero-orden') as HTMLInputElement).value = orden.numero_orden || '';
    (document.getElementById('ods-version') as HTMLInputElement).value = orden.version || '01';

    // 3. Llenado de Cotización y Cliente (Mantenemos tu lógica)
    const cotSelect = document.getElementById('ods-cotizacion-ref') as HTMLSelectElement;
    if (orden.id_cotizacion) {
      const cotNum = orden.cotizacion?.numero_cotizacion || ('COT-' + orden.id_cotizacion);
      const existing = Array.from(cotSelect.options).find(o => o.value === String(orden.id_cotizacion));
      if (!existing) {
        cotSelect.insertAdjacentHTML('beforeend', '<option value="' + orden.id_cotizacion + '">' + cotNum + '</option>');
      }
      cotSelect.value = String(orden.id_cotizacion);
      cotSelect.disabled = true; // Siempre readonly en edición/ver
    }

    (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = orden.cliente?.nombre_empresa || '';
    (document.getElementById('ods-cliente-id') as HTMLInputElement).value = String(orden.cliente?.id || orden.id_cliente || '');
    (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = orden.cliente?.ruc || '';

    // 4. Fechas y Personal
    (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).value = orden.fecha_aceptacion?.split('T')[0] || '';
    (document.getElementById('ods-fecha-tentativa') as HTMLInputElement).value = orden.fecha_tentativa?.split('T')[0] || '';

    // Emitido por: mostrar nombre del emisor original, pero el ID se mantiene del usuario logueado
    const currentUserEdit = authService.getUser();
    const emisorNombre = orden.emisor?.nombre ? (orden.emisor.nombre + ' ' + (orden.emisor.apellidos || '')) : (currentUserEdit ? currentUserEdit.nombre + (currentUserEdit.apellido ? ' ' + currentUserEdit.apellido : '') : '');
    (document.getElementById('ods-emitido-por-nombre') as HTMLInputElement).value = emisorNombre;
    (document.getElementById('ods-emitido-por') as HTMLInputElement).value = String(orden.emitido_por || '');

    // 5. IGV
    incluyeIgv = orden.incluye_igv !== false;
    (document.getElementById('ods-igv') as HTMLSelectElement).value = incluyeIgv ? '1' : '0';
    const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';

    (document.getElementById('oc-observaciones') as HTMLTextAreaElement).value = orden.observaciones || '';

    // 6. Detalles (Agregamos las líneas)
    // Cargar plantas del cliente antes de crear las filas
    const idClienteEdit = orden.cliente?.id || orden.id_cliente;
    if (idClienteEdit) await cargarPlantasClienteODS(idClienteEdit);

    const detalles = orden.detalles || [];
    detalles.forEach((d: any) => {
      agregarLineaConDatos(
        d.id_servicio,
        d.servicio?.nombre || ('Servicio #' + d.id_servicio),
        d.frecuencia || '',
        Number(d.precio || 0),
        d.id_cliente_planta || null,
        normalizeAreaIds(d.id_cliente_planta_area)
      );
    });

    // 7. Productos asignados
    const productos = orden.productos || [];
    odsProductoRows = productos.map((p: any) => ({
      id_producto: p.id_producto,
      cantidad: Number(p.cantidad),
      observacion: p.observacion || '',
      id_servicio: p.id_servicio || 0,
      id_cliente_planta: p.id_cliente_planta || null,
      id_cliente_planta_area: p.id_cliente_planta_area || null,
      id_equipo: p.id_equipo || null,
      equipo_descripcion: p.equipo?.descripcion || '',
    }));
    renderProductosODS();

    // 8. Equipos asignados
    const equipos = orden.equipos || [];
    odsEquipoRows = equipos.map((e: any) => ({
      id_equipo: e.id_equipo,
      observacion: e.observacion || '',
      equipo_descripcion: e.equipo?.descripcion || '',
      id_servicio: e.id_servicio || 0,
      id_cliente_planta: e.id_cliente_planta || null,
      id_cliente_planta_area: e.id_cliente_planta_area || null,
    }));
    renderEquiposODS();

    // ==========================================
    // NUEVA LÓGICA DE BLOQUEO (SOLO LECTURA)
    // ==========================================
    
    // Bloquear todos los inputs y selects del modal
    const inputs = document.querySelectorAll('#modal-ods .os-input, #modal-ods select, #modal-ods input');
    inputs.forEach(input => {
      const el = input as HTMLInputElement;
      // Si es soloLectura, bloqueamos. Si es Editar, habilitamos (excepto cotización que ya es disabled arriba)
      if (el.id !== 'ods-cotizacion-ref' && el.id !== 'ods-numero-orden' && el.id !== 'ods-cliente-nombre' && el.id !== 'ods-cliente-ruc') {
          el.disabled = soloLectura;
      }
    });

    const btnGuardar = document.getElementById('modal-ods-guardar') as HTMLElement;
    const btnCancelar = document.getElementById('modal-ods-cancelar') as HTMLElement;
    const btnAgregarSrv = document.getElementById('btn-agregar-linea-servicio') as HTMLElement;
    const btnAgregarProd = document.getElementById('btn-agregar-producto-ods') as HTMLElement;
    const btnAgregarEquipo = document.getElementById('btn-agregar-equipo-ods') as HTMLElement;

    if (soloLectura) {
      btnGuardar.style.display = 'none';           // Quitamos botón Guardar
      btnCancelar.textContent = 'Salir';           // Cambiamos Cancelar por Salir
      if (btnAgregarSrv) btnAgregarSrv.style.display = 'none'; // Quitamos botón agregar servicio
      if (btnAgregarProd) btnAgregarProd.style.display = 'none';
      if (btnAgregarEquipo) btnAgregarEquipo.style.display = 'none';
      
      // Bloquear botones de eliminar líneas de la tabla
      setTimeout(() => {
          document.querySelectorAll('.btn-eliminar-linea').forEach(b => (b as HTMLElement).style.display = 'none');
          document.querySelectorAll('.ods-prod-remove').forEach(b => (b as HTMLElement).style.display = 'none');
          document.querySelectorAll('.ods-equipo-remove').forEach(b => (b as HTMLElement).style.display = 'none');
      }, 150);
    } else {
      btnGuardar.style.display = 'flex';           // Mostramos Guardar
      btnGuardar.textContent = 'Actualizar Orden'; // Texto de edición
      btnCancelar.textContent = 'Cancelar';
      if (btnAgregarSrv) btnAgregarSrv.style.display = 'flex';
      if (btnAgregarProd) btnAgregarProd.style.display = 'flex';
      if (btnAgregarEquipo) btnAgregarEquipo.style.display = 'flex';
    }

    calcularTotalCosto();
    (document.getElementById('modal-ods') as HTMLElement).style.display = 'flex';

  } catch (e) {
    console.error('Error cargando ODS:', e);
    mostrarToast('error', 'Error', 'No se pudo cargar la orden de servicio');
  }
}

let odsEliminarId = 0;

function abrirModalEliminarODS(id: number, numero: string) {
  odsEliminarId = id;
  (document.getElementById('ods-eliminar-numero') as HTMLElement).textContent = numero;
  (document.getElementById('modal-ods-eliminar') as HTMLElement).style.display = 'flex';
}

async function guardarODS() {
  const editId = (document.getElementById('ods-edit-id') as HTMLInputElement).value;
  const idCotizacion = (document.getElementById('ods-cotizacion-ref') as HTMLSelectElement).value;
  const fechaAceptacion = (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).value;
  const fechaTentativa = (document.getElementById('ods-fecha-tentativa') as HTMLInputElement).value;
  const emitidoPor = (document.getElementById('ods-emitido-por') as HTMLInputElement).value;
  const version = (document.getElementById('ods-version') as HTMLInputElement).value;
  const observaciones = (document.getElementById('oc-observaciones') as HTMLTextAreaElement).value?.trim();

  if (!idCotizacion) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar una cotizacion de referencia');
    return;
  }
  if (!emitidoPor) {
    mostrarToast('error', 'Campo requerido', 'Debe seleccionar quien emite la orden');
    return;
  }

  const lineas = document.querySelectorAll('#ods-detalle-body tr');
  if (lineas.length === 0) {
    mostrarToast('error', 'Sin servicios', 'Debe agregar al menos un servicio');
    return;
  }

  const detalles: any[] = [];
  let valid = true;
  let frecuenciaDiasInvalida = false;
  lineas.forEach(linea => {
    const selectSrv = linea.querySelector('.servicio-select') as HTMLSelectElement;
    const idServicio = selectSrv?.value || (linea.querySelector('.servicio-id-hidden') as HTMLInputElement)?.value;
    const idPlanta = parseInt((linea.querySelector('.planta-select') as HTMLSelectElement)?.value) || null;
    const areaIds = getAreaIdsFromODSRow(linea);
    const frecuencia = frecuenciaDesdeFilaODS(linea as HTMLElement);
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');

    if (!idServicio) valid = false;
    if (frecuencia === '__INVALID__') frecuenciaDiasInvalida = true;

    detalles.push({
      id_servicio: Number(idServicio),
      id_cliente_planta: idPlanta,
      id_cliente_planta_area: areaIds.length > 0 ? areaIds : null,
      frecuencia: (frecuencia && frecuencia !== '__INVALID__') ? frecuencia : null,
      precio,
    });
  });

  if (!valid) {
    mostrarToast('error', 'Error', 'Todos los servicios deben tener un servicio asignado');
    return;
  }

  if (frecuenciaDiasInvalida) {
    mostrarToast('error', 'Frecuencia incompleta', 'Si selecciona "Días de la semana", debe marcar al menos un día.');
    return;
  }

  const payload: any = {
    id_cotizacion: Number(idCotizacion),
    fecha_aceptacion: fechaAceptacion || null,
    fecha_tentativa: fechaTentativa || null,
    emitido_por: Number(emitidoPor),
    version: version || null,
    incluye_igv: incluyeIgv,
    observaciones: observaciones || null,
    detalles,
    productos: odsProductoRows
      .filter(r => r.id_producto > 0 && r.cantidad > 0)
      .map(r => ({
        id_producto: r.id_producto,
        cantidad: r.cantidad,
        observacion: r.observacion || null,
        id_servicio: r.id_servicio || null,
        id_cliente_planta: r.id_cliente_planta || null,
        id_cliente_planta_area: (normalizeAreaIds(r.id_cliente_planta_area)[0] || null),
        id_equipo: r.id_equipo || null,
      })),
    equipos: odsEquipoRows
      .filter(r => r.id_equipo > 0)
      .map(r => ({
        id_equipo: r.id_equipo,
        observacion: r.observacion || null,
        id_servicio: r.id_servicio || null,
        id_cliente_planta: r.id_cliente_planta || null,
        id_cliente_planta_area: (normalizeAreaIds(r.id_cliente_planta_area)[0] || null),
      })),
  };
  console.log('ODS Payload:', JSON.stringify(payload, null, 2));

  try {
    if (editId) {
      await ordenServicioService.update(Number(editId), payload);
      mostrarToast('success', 'Orden Actualizada', 'La orden de servicio se actualizo correctamente');
    } else {
      const response = await ordenServicioService.create(payload);
      mostrarToast('success', 'Orden Creada', 'La orden de servicio se creo correctamente');

      // Generar PDF automáticamente
      const nuevaId = (response.data as any)?.id;
      if (nuevaId) {
        mostrarToast('success', 'PDF', 'Generando PDF de la orden de servicio...');
        try {
          await ordenServicioService.downloadPDF(nuevaId);
        } catch (pdfErr) {
          console.error('Error generando PDF:', pdfErr);
        }
      }
    }
    (document.getElementById('modal-ods') as HTMLElement).style.display = 'none';
    await Promise.all([cargarOrdenesServicio(), cargarEstadisticasODS()]);
  } catch (e: any) {
    console.error('Error guardando ODS:', e);
    console.error('Error data:', JSON.stringify(e?.data || e?.response?.data || {}));
    const errors = e?.data?.errors || e?.response?.data?.errors;
    if (errors) {
      const msgs = Object.values(errors).flat().join(', ');
      mostrarToast('error', 'Validación', msgs);
    } else {
      const msg = e?.data?.message || e?.message || 'No se pudo guardar la orden';
      mostrarToast('error', 'Error', msg);
    }
  }
}

async function eliminarODS() {
  if (!odsEliminarId) return;
  try {
    await ordenServicioService.delete(odsEliminarId);
    mostrarToast('success', 'Orden Eliminada', 'La orden fue eliminada correctamente');
    (document.getElementById('modal-ods-eliminar') as HTMLElement).style.display = 'none';
    odsEliminarId = 0;
    await Promise.all([cargarOrdenesServicio(), cargarEstadisticasODS()]);
  } catch (e) {
    mostrarToast('error', 'Error', 'No se pudo eliminar la orden');
  }
}

// =============================
// INIT EVENTS
// =============================
export function initOrdenesServicioEvents() {
  // Boton nueva ODS
  document.getElementById('btn-nueva-ods')?.addEventListener('click', abrirModalNuevaODS);

  // Filtrar
  document.getElementById('ods-btn-filtrar')?.addEventListener('click', cargarOrdenesServicio);

  // Search con debounce
  const searchInput = document.getElementById('ods-search') as HTMLInputElement;
  if (searchInput) {
    let timeout: any;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(cargarOrdenesServicio, 400);
    });
  }

  // Modal ODS cerrar/cancelar
  const modal = document.getElementById('modal-ods') as HTMLElement;
  document.getElementById('modal-ods-cerrar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
  document.getElementById('modal-ods-cancelar')?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });

  // Guardar
  document.getElementById('modal-ods-guardar')?.addEventListener('click', guardarODS);

  // Cotizacion change -> auto-fill
  document.getElementById('ods-cotizacion-ref')?.addEventListener('change', async () => {
    const val = (document.getElementById('ods-cotizacion-ref') as HTMLSelectElement).value;
    if (val) {
      await cargarDatosCotizacion(Number(val));
    } else {
      (document.getElementById('ods-cliente-nombre') as HTMLInputElement).value = '';
      (document.getElementById('ods-cliente-id') as HTMLInputElement).value = '';
      (document.getElementById('ods-cliente-ruc') as HTMLInputElement).value = '';
      (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).value = '';
      (document.getElementById('ods-fecha-aceptacion') as HTMLInputElement).disabled = true;
      (document.getElementById('ods-cotizacion-info') as HTMLElement).style.display = 'none';
      (document.getElementById('ods-detalle-body') as HTMLElement).innerHTML = '';
      odsProductoRows = [];
      odsEquipoRows = [];
      renderProductosODS();
      renderEquiposODS();
      calcularTotalCosto();
    }
  });

  // IGV change -> recalcular
  document.getElementById('ods-igv')?.addEventListener('change', (e) => {
    incluyeIgv = (e.target as HTMLSelectElement).value === '1';
    const igvRow = document.getElementById('ods-igv-row') as HTMLElement;
    if (igvRow) igvRow.style.display = incluyeIgv ? 'flex' : 'none';
    calcularTotalCosto();
  });

  // Agregar linea servicio manual
  document.getElementById('btn-agregar-linea-servicio')?.addEventListener('click', agregarLineaVacia);

  // Productos ODS
  document.getElementById('btn-agregar-producto-ods')?.addEventListener('click', abrirModalAgregarProductoODS);
  document.getElementById('btn-agregar-equipo-ods')?.addEventListener('click', abrirModalAgregarEquipoODS);

  // Modal agregar equipo
  const modalAddEq = document.getElementById('modal-ods-agregar-equipo') as HTMLElement;
  document.getElementById('modal-ods-agregar-equipo-cerrar')?.addEventListener('click', () => { if (modalAddEq) modalAddEq.style.display = 'none'; });
  document.getElementById('modal-ods-agregar-equipo-cancelar')?.addEventListener('click', () => { if (modalAddEq) modalAddEq.style.display = 'none'; });
  document.getElementById('modal-ods-agregar-equipo-confirmar')?.addEventListener('click', confirmarAgregarEquipoODS);

  const modalAddProd = document.getElementById('modal-ods-agregar-producto') as HTMLElement;
  document.getElementById('modal-ods-agregar-producto-cerrar')?.addEventListener('click', () => { if (modalAddProd) modalAddProd.style.display = 'none'; });
  document.getElementById('modal-ods-agregar-producto-cancelar')?.addEventListener('click', () => { if (modalAddProd) modalAddProd.style.display = 'none'; });
  document.getElementById('modal-ods-agregar-producto-confirmar')?.addEventListener('click', confirmarAgregarProductoODS);

  // Modal eliminar
  const modalElim = document.getElementById('modal-ods-eliminar') as HTMLElement;
  document.getElementById('modal-ods-eliminar-cerrar')?.addEventListener('click', () => { if (modalElim) modalElim.style.display = 'none'; });
  document.getElementById('modal-ods-eliminar-cancelar')?.addEventListener('click', () => { if (modalElim) modalElim.style.display = 'none'; });
  document.getElementById('modal-ods-eliminar-confirmar')?.addEventListener('click', eliminarODS);

  // Cargar datos iniciales
  cargarEstadisticasODS();
  cargarOrdenesServicio();
}
