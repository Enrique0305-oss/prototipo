// Comercial - Cotizaciones (Conectado al Backend)
import { cotizacionService } from '../../../services/cotizacionService';
import { clienteService } from '../../../services/clienteService';
import { productoService } from '../../../services/productoService';
import { servicioService } from '../../../services/servicioService';
import { equipoService } from '../../../services/equipoService';
import { catalogoCapAudService } from '../../../services/catalogoCapAudService';
import { exponenteService, type Exponente } from '../../../services/exponenteService';
import { mostrarToast } from '../../../shared/toast';
import type { Cotizacion, EstadisticasCotizaciones } from '../../../core/api/types';
import { getCotizacionTipoAdapter, TAB_TO_TIPO } from './tipos';

// --- INICIO DE CARGA DE QUILL ---
// Cargamos Quill de forma segura y permitimos inicializarlo cuando el script esté listo.
let quillLoadPromise: Promise<void> | null = null;
function ensureQuillLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).Quill) return Promise.resolve();
  if (quillLoadPromise) return quillLoadPromise;

  quillLoadPromise = new Promise<void>((resolve) => {
    if (document.getElementById('quill-script')) {
      const existingScript = document.getElementById('quill-script') as HTMLScriptElement;
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => resolve());
      return;
    }

    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css';
    link.rel = 'stylesheet';
    link.id = 'quill-assets';

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js';
    script.id = 'quill-script';

    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => resolve());

    document.head.appendChild(link);
    document.head.appendChild(script);
  });

  return quillLoadPromise;
}

let quillInstance: any = null; // Usaremos esta variable para manejar el editor
// --- FIN DE CARGA DE QUILL ---

//  STATE 
let cotizacionesData: Cotizacion[] = [];
let estadisticasData: EstadisticasCotizaciones | null = null;
let filtros = { search: '', tipo: '', estado: '' };
let contadorLineas = 0;
let incluyeIgv = true;
let plantasClienteData: any[] = [];
let paginaActual = 1;
const itemsPorPagina = 15;
let tabActivo = 'historial';
const tabsInicializados: Record<string, boolean> = { servicio: false, producto: false, capacitacion: false, asesoria: false };
let quillKeydownController: AbortController | null = null;
let formularioLoadController: AbortController | null = null;  // Para evitar condiciones de carrera
let cotizacionEditandoId: number | null = null;
let cotizacionEditandoTipo: string | null = null;
let cotizacionEditandoNumero = '';
const COTIZACION_EDIT_SESSION_KEY = 'cotizacion_edit_id';

type RecetaServicioRow = {
  id_servicio: number;
  id_equipo: number | null;
  equipo_descripcion: string;
  id_producto: number;
  cantidad: number;
  observacion: string;
  id_cliente_planta: number | null;
  id_cliente_planta_area: number | null;
};

let recetaServicioRows: RecetaServicioRow[] = [];
type BeneficioServicioRow = {
  id_catalogo_cap_aud: number | null;
  nombre_beneficio: string;
  modalidad_sugerida: string | null;
  horas_capacitacion: number | null;
  precio_referencial: number;
  observacion: string;
};
let beneficiosServicioRows: BeneficioServicioRow[] = [];
let exponentesData: Exponente[] = [];
let selectedExponentesCotizacion: { id: number; nombre: string }[] = [];
let equiposDisponiblesReceta: any[] = [];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

type MedidaTanqueArea = {
  areaId: number | null;
  areaNombre: string;
  medida: string;
};

function escapeHtml(texto: string): string {
  return (texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function esServicioLimpiezaConMedida(nombreServicio: string): boolean {
  const servicioUpper = (nombreServicio || '').toUpperCase();
  return (
    servicioUpper.includes('LIMPIEZA DE CISTERNAS Y RESERVORIOS')
    || servicioUpper.includes('LIMPIEZA DE CISTERNAS')
    || servicioUpper.includes('LIMPIEZA DE RESERVORIOS')
    || servicioUpper.includes('LIMPIEZA DE TRAMPA DE GRASA')
  );
}

function esServicioFosfina(nombreServicio: string): boolean {
  return (nombreServicio || '').toUpperCase().includes('FOSFINA');
}

function getMedidasTanqueIniciales(detalle: any): string[] {
  const medidasRaw = Array.isArray(detalle?.medida_tanque)
    ? detalle.medida_tanque
    : (detalle?.medida_tanque ? [detalle.medida_tanque] : []);

  const medidas = medidasRaw
    .map((valor: any) => String(valor || '').trim())
    .filter((valor: string) => valor.length > 0);

  if (medidas.length > 0) {
    return medidas;
  }

  const medidaUnica = String(detalle?.medida_tanque || '').trim();
  return medidaUnica ? [medidaUnica] : [];
}

function getServicioEspecialLimpiezaSeleccionado(panelEl: HTMLElement): {
  fila: HTMLElement;
  areas: MedidaTanqueArea[];
} | null {
  const filas = panelEl.querySelectorAll('#detalle-cotizacion-body tr');

  for (const fila of filas) {
    const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement | null;
    const servicioNombre = itemSelect?.options[itemSelect.selectedIndex]?.textContent?.trim() || '';
    if (!esServicioLimpiezaConMedida(servicioNombre)) {
      continue;
    }

    const areaMulti = fila.querySelector('.area-input-multi') as HTMLSelectElement | null;
    const areaSingle = fila.querySelector('.area-input') as HTMLSelectElement | null;

    if (areaMulti) {
      const areas = Array.from(areaMulti.selectedOptions).map((opt) => ({
        areaId: parseInt(opt.value || '0', 10) || null,
        areaNombre: opt.textContent?.trim() || '',
        medida: '',
      })).filter((area) => area.areaNombre !== '' || area.areaId !== null);

      return { fila: fila as HTMLElement, areas };
    }

    if (areaSingle) {
      const areaId = parseInt(areaSingle.value || '0', 10) || null;
      const areaNombre = areaSingle.selectedIndex > 0 ? (areaSingle.options[areaSingle.selectedIndex]?.textContent?.trim() || '') : '';

      return {
        fila: fila as HTMLElement,
        areas: areaNombre || areaId
          ? [{ areaId, areaNombre, medida: '' }]
          : [],
      };
    }

    return { fila: fila as HTMLElement, areas: [] };
  }

  return null;
}

function leerMedidasTanqueDesdeSeccion(panelEl: HTMLElement): string[] {
  const contenedor = panelEl.querySelector('#contenedor-medidas-tanque') as HTMLElement | null;
  if (!contenedor) return [];

  return Array.from(contenedor.querySelectorAll('.medida-tanque-input'))
    .map((input) => (input as HTMLInputElement).value.trim())
    .filter((valor) => valor.length > 0);
}

function renderMedidasTanqueInputs(panelEl: HTMLElement) {
  const seccion = panelEl.querySelector('#seccion-limpieza-cisternas') as HTMLElement | null;
  const contenedor = panelEl.querySelector('#contenedor-medidas-tanque') as HTMLElement | null;
  if (!seccion || !contenedor) return;

  const servicio = getServicioEspecialLimpiezaSeleccionado(panelEl);
  if (!servicio || servicio.areas.length === 0) {
    contenedor.innerHTML = '<small style="color:#64748b;">Seleccione una o más áreas para ingresar las medidas de los tanques.</small>';
    return;
  }

  const medidasPrevias = new Map<string, string>();
  contenedor.querySelectorAll('.medida-tanque-input').forEach((input) => {
    const el = input as HTMLInputElement;
    const key = el.dataset.areaKey || '';
    if (key) {
      medidasPrevias.set(key, el.value.trim());
    }
  });

  const medidasIniciales = Array.isArray((seccion as any)._medidasTanqueIniciales)
    ? (seccion as any)._medidasTanqueIniciales as string[]
    : [];

  contenedor.innerHTML = servicio.areas.map((area, index) => {
    const key = String(area.areaId ?? index);
    const valorPrevio = medidasPrevias.get(key) ?? medidasIniciales[index] ?? '';
    return `
      <div style="display:grid;grid-template-columns:minmax(180px,1fr) minmax(220px,1.2fr);gap:10px;align-items:center;margin-bottom:8px;">
        <label style="font-size:13px;font-weight:600;color:#334155;">${escapeHtml(area.areaNombre || `Área ${index + 1}`)}</label>
        <input type="text" class="input medida-tanque-input" data-area-key="${escapeHtml(key)}" data-area-id="${area.areaId ?? ''}" data-area-nombre="${escapeHtml(area.areaNombre)}" style="width:100%;" placeholder="" value="${escapeHtml(valorPrevio)}">
      </div>
    `;
  }).join('');
}

function normalizarDiaNombre(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function construirFrecuenciaDiasHtml(lineaId: string): string {
  const checks = DIAS_SEMANA.map(dia => {
    return `<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#475569;"><input type="checkbox" class="frecuencia-dia-checkbox" value="${dia}"> ${dia.substring(0, 3)}</label>`;
  }).join('');

  return `<div class="frecuencia-dias-wrap" data-linea="${lineaId}" style="display:none;margin-top:6px;padding:6px;border:1px dashed #cbd5e1;border-radius:6px;background:#f8fafc;">
    <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Seleccione días</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">${checks}</div>
  </div>`;
}

function limpiarFrecuenciaDias(fila: HTMLElement) {
  fila.querySelectorAll('.frecuencia-dia-checkbox').forEach((el) => {
    (el as HTMLInputElement).checked = false;
  });
}

function actualizarUIFrecuenciaDias(fila: HTMLElement) {
  const frecuenciaSelect = fila.querySelector('.frecuencia-input') as HTMLSelectElement | null;
  const wrap = fila.querySelector('.frecuencia-dias-wrap') as HTMLElement | null;
  if (!frecuenciaSelect || !wrap) return;

  const mostrar = frecuenciaSelect.value === 'Días de la semana';
  wrap.style.display = mostrar ? 'block' : 'none';
  if (!mostrar) {
    limpiarFrecuenciaDias(fila);
  }
}

function frecuenciaSugeridaDesdeFila(fila: HTMLElement): string | null {
  const frecuenciaSelect = fila.querySelector('.frecuencia-input') as HTMLSelectElement | null;
  if (!frecuenciaSelect || !frecuenciaSelect.value) return null;

  if (frecuenciaSelect.value !== 'Días de la semana') {
    return frecuenciaSelect.value;
  }

  const dias = Array.from(fila.querySelectorAll('.frecuencia-dia-checkbox'))
    .filter((el) => (el as HTMLInputElement).checked)
    .map((el) => (el as HTMLInputElement).value);

  if (dias.length === 0) {
    return '__INVALID__';
  }

  const textoDias = dias.join(', ');
  const etiquetaDias = dias.length === 1 ? 'día' : 'días';
  return `${dias.length} ${etiquetaDias} a la semana (${textoDias})`;
}

function setFrecuenciaDiasDesdeTexto(fila: HTMLElement, frecuenciaTexto: string) {
  if (!frecuenciaTexto) return;

  const frecuenciaSelect = fila.querySelector('.frecuencia-input') as HTMLSelectElement | null;
  if (!frecuenciaSelect) return;

  const texto = frecuenciaTexto.trim();

  const extraerDiasDesdeTexto = (raw: string): string[] => {
    const found: string[] = [];
    const normalizedRaw = normalizarDiaNombre(raw);

    DIAS_SEMANA.forEach((dia) => {
      const normDia = normalizarDiaNombre(dia);
      if (new RegExp(`\\b${normDia}\\b`, 'i').test(normalizedRaw)) {
        found.push(dia);
      }
    });

    return found;
  };

  const diasDetectadosEnTexto = extraerDiasDesdeTexto(texto);
  const esDiasSemana = diasDetectadosEnTexto.length > 0 || /semana/i.test(texto);
  if (esDiasSemana) {
    frecuenciaSelect.value = 'Días de la semana';
  } else {
    frecuenciaSelect.value = texto;
  }

  actualizarUIFrecuenciaDias(fila);
  if (!esDiasSemana) return;

  const diasEnTexto = (() => {
    const m = texto.match(/\(([^)]+)\)/);
    if (m?.[1]) return m[1].split(',').map(d => d.trim()).filter(Boolean);

    if (diasDetectadosEnTexto.length > 0) {
      return diasDetectadosEnTexto;
    }

    const split = texto.split(':');
    if (split[1]) return split[1].split(',').map(d => d.trim()).filter(Boolean);

    const splitGuion = texto.split('-');
    if (splitGuion[1]) return splitGuion[1].split(',').map(d => d.trim()).filter(Boolean);

    return [];
  })();

  const diasNorm = new Set(diasEnTexto.map(normalizarDiaNombre));
  fila.querySelectorAll('.frecuencia-dia-checkbox').forEach((el) => {
    const chk = el as HTMLInputElement;
    chk.checked = diasNorm.has(normalizarDiaNombre(chk.value));
  });
}

function renderExponenteTagsCotizacion(panelEl: HTMLElement) {
  const container = panelEl.querySelector('#cot-exponentes-tags') as HTMLElement | null;
  if (!container) return;

  if (selectedExponentesCotizacion.length === 0) {
    container.innerHTML = '<span style="color:#94a3b8;font-size:13px;">Ningún exponente seleccionado</span>';
    return;
  }

  container.innerHTML = selectedExponentesCotizacion.map((e) => {
    return '<span style="display:inline-flex;align-items:center;gap:4px;background:#fef3c7;color:#92400e;border-radius:6px;padding:4px 10px;font-size:13px;font-weight:500;">'
      + e.nombre
      + ' <button type="button" class="btn-remove-exponente-cotiz" data-id="' + e.id + '" style="background:none;border:none;cursor:pointer;color:#92400e;font-size:16px;line-height:1;padding:0 2px;font-weight:700;">&times;</button>'
      + '</span>';
  }).join('');

  container.querySelectorAll('.btn-remove-exponente-cotiz').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id || '0');
      selectedExponentesCotizacion = selectedExponentesCotizacion.filter((e) => e.id !== id);
      renderExponenteTagsCotizacion(panelEl);
      actualizarSelectorExponentesCotizacion(panelEl);
    });
  });
}

function actualizarSelectorExponentesCotizacion(panelEl: HTMLElement) {
  const select = panelEl.querySelector('#cot-exponente-selector') as HTMLSelectElement | null;
  if (!select) return;

  selectedExponentesCotizacion = selectedExponentesCotizacion.map((tag) => {
    const full = exponentesData.find((e) => e.id === tag.id);
    if (!full) return tag;
    const nombre = [full.nombre, full.apellidos].filter(Boolean).join(' ').trim();
    return { ...tag, nombre: nombre || tag.nombre };
  });

  const selectedIds = selectedExponentesCotizacion.map((e) => e.id);
  const disponibles = exponentesData.filter((e) => !selectedIds.includes(e.id));

  select.innerHTML = '<option value="">+ Agregar exponente...</option>'
    + disponibles.map((e) => {
      const nombre = [e.nombre, e.apellidos].filter(Boolean).join(' ').trim();
      return '<option value="' + e.id + '">' + nombre + ' — ' + (e.especialidad || '') + '</option>';
    }).join('');
}

async function cargarDropdownExponentesCotizacion(panelEl: HTMLElement) {
  const select = panelEl.querySelector('#cot-exponente-selector') as HTMLSelectElement | null;
  if (!select) return;

  try {
    const res = await exponenteService.getAll({ estado: 'Activo' });
    const raw = (res as any).data || res;
    exponentesData = Array.isArray(raw) ? raw : (raw as any).data || [];
    actualizarSelectorExponentesCotizacion(panelEl);
  } catch (e) {
    console.error('Error cargando exponentes en cotización:', e);
    select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

function formatearFrecuenciaVisita(frecuenciaVis: any): string {
  if (!frecuenciaVis || typeof frecuenciaVis !== 'object') return '—';
  
  const meses: string[] = [];
  Object.keys(frecuenciaVis).forEach((mesKey: string) => {
    const p = frecuenciaVis[mesKey]?.p || 0;
    const v = frecuenciaVis[mesKey]?.v || 0;
    const f = String(frecuenciaVis[mesKey]?.f || '').trim();
    meses.push(`${mesKey.toUpperCase()}: ${p} Presencial, ${v} Virtual${f ? `, ${f}` : ''}`);
  });
  
  return meses.length > 0 ? meses.join(' | ') : '—';
}

function obtenerInfoImplementacionAsesor(cotizacion: any): { meses: number | null; frecuencia: string } {
  const meses = cotizacion.detalles?.[0]?.meses_implementacion || null;
  const frecuencia = cotizacion.detalles?.[0]?.frecuencia_visita || null;
  const frecuenciaFormato = frecuencia ? formatearFrecuenciaVisita(frecuencia) : '—';
  return { meses, frecuencia: frecuenciaFormato };
}

function generarTablaFrecuenciaVisita(panelEl: HTMLElement) {
  const mesesInput = panelEl.querySelector('#cot-cap-fecha-servicio') as HTMLInputElement | null;
  const container = panelEl.querySelector('#cot-frecuencia-visita-container') as HTMLElement | null;
  if (!mesesInput || !container) return;

  const meses = Math.max(1, parseInt(mesesInput.value || '1', 10));
  
  let html = `<div style="display:grid;grid-template-columns:100px 60px 60px 150px;gap:8px;align-items:center;font-size:12px;">
    <div style="font-weight:600;color:#475569;">Mes</div>
    <div style="text-align:center;font-weight:600;color:#475569;">Presencial (P)</div>
    <div style="text-align:center;font-weight:600;color:#475569;">Virtual (V)</div>
    <div style="text-align:center;font-weight:600;color:#475569;">Frecuencia</div>
  </div>`;
  
  for (let i = 1; i <= meses; i++) {
    html += `<div style="display:grid;grid-template-columns:100px 60px 60px 150px;gap:8px;margin-top:8px;align-items:center;">
      <div style="font-weight:500;color:#1e293b;">Mes ${i}</div>
      <input type="number" id="cot-asesor-freq-m${i}-p" class="form-control" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:13px;text-align:center;">
      <input type="number" id="cot-asesor-freq-m${i}-v" class="form-control" value="0" min="0" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:13px;text-align:center;">
      <select id="cot-asesor-freq-m${i}-f" class="form-control" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:13px;">
        <option value="">Seleccione...</option>
        <option value="1 vez al mes">1 vez al mes</option>
        <option value="semanal">semanal</option>
        <option value="quincenal">quincenal</option>
        <option value="A solicitud">A solicitud</option>
      </select>
    </div>`;
  }
  
  container.innerHTML = html;
}

function initSelectorExponentesCotizacion(panelEl: HTMLElement) {
  const select = panelEl.querySelector('#cot-exponente-selector') as HTMLSelectElement | null;
  if (!select) return;

  select.addEventListener('change', () => {
    const id = Number(select.value || '0');
    if (!id) return;

    const exponente = exponentesData.find((e) => e.id === id);
    if (!exponente) return;

    const nombre = [exponente.nombre, exponente.apellidos].filter(Boolean).join(' ').trim();
    if (!selectedExponentesCotizacion.some((e) => e.id === id)) {
      selectedExponentesCotizacion.push({ id, nombre });
    }

    select.value = '';
    renderExponenteTagsCotizacion(panelEl);
    actualizarSelectorExponentesCotizacion(panelEl);
  });
}

function aplicarDatosCapacitacionGlobalALinea(fila: HTMLElement, panelEl: HTMLElement) {
  void fila;
  void panelEl;
}

function aplicarDatosCapacitacionGlobalATodasLasLineas(panelEl: HTMLElement) {
  panelEl.querySelectorAll('#detalle-cotizacion-body tr').forEach((linea) => {
    aplicarDatosCapacitacionGlobalALinea(linea as HTMLElement, panelEl);
  });
}

function getCatalogoCapacitacionOptions(selectedId: number | null): string {
  const catalogo = (window as any).__catalogoCapAudData || [];
  const rows = catalogo.filter((c: any) => String(c?.tipo || '').toLowerCase().includes('capacit'));
  let opts = '<option value="">Seleccione capacitación...</option>';
  rows.forEach((c: any) => {
    const sel = Number(c.id) === Number(selectedId || 0) ? 'selected' : '';
    opts += `<option value="${c.id}" ${sel} data-nombre="${String(c.nombre || '').replace(/"/g, '&quot;')}" data-horas="${Number(c.duracion_horas || 0)}">${c.nombre}</option>`;
  });
  return opts;
}

function renderBeneficiosServicio(panelEl: HTMLElement) {
  const wrap = panelEl.querySelector('#beneficios-servicio-wrap') as HTMLElement | null;
  const tbody = panelEl.querySelector('#beneficios-servicio-body') as HTMLElement | null;
  const empty = panelEl.querySelector('#beneficios-servicio-empty') as HTMLElement | null;
  const chk = panelEl.querySelector('#chk-beneficios-servicio') as HTMLInputElement | null;
  if (!wrap || !tbody || !empty || !chk) return;

  wrap.style.display = chk.checked ? 'block' : 'none';
  if (!chk.checked) return;

  if (beneficiosServicioRows.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = beneficiosServicioRows.map((b, idx) => {
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #eef2f7;">${b.nombre_beneficio || '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f7;">${b.modalidad_sugerida || '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f7;text-align:center;">${b.horas_capacitacion ?? '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f7;">GRATIS</td>
      <td style="padding:8px;border-bottom:1px solid #eef2f7;text-align:center;">
        <button type="button" class="btn-del-beneficio" data-idx="${idx}" style="background:none;border:none;cursor:pointer;color:#ef4444;">✕</button>
      </td>
    </tr>`;
  }).join('');

  wrap.querySelectorAll('.btn-del-beneficio').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = Number((e.currentTarget as HTMLButtonElement).dataset.idx || '-1');
      if (idx < 0 || !beneficiosServicioRows[idx]) return;
      beneficiosServicioRows.splice(idx, 1);
      renderBeneficiosServicio(panelEl);
    });
  });
}

function abrirModalBeneficioServicio(panelEl: HTMLElement) {
  let overlay = document.getElementById('cotiz-beneficios-modal-overlay') as HTMLElement | null;
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'cotiz-beneficios-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:12000;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:680px;max-width:95vw;max-height:90vh;overflow:auto;padding:18px;box-shadow:0 20px 50px rgba(0,0,0,.2);">
      <h3 style="margin:0 0 12px;font-size:18px;color:#1e293b;">Agregar beneficio de capacitación</h3>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;align-items:end;">
        <div>
          <label style="display:block;font-size:12px;color:#475569;margin-bottom:4px;">Capacitación</label>
          <select id="benef-cat" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">${getCatalogoCapacitacionOptions(null)}</select>
        </div>
        <div>
          <label style="display:block;font-size:12px;color:#475569;margin-bottom:4px;">Modalidad</label>
          <select id="benef-mod" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;">
            <option value="">Seleccione...</option>
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Asíncrona">Asíncrona</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;color:#475569;margin-bottom:4px;">Horas</label>
          <input id="benef-hrs" type="number" min="0" step="0.5" value="0" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;" />
        </div>
      </div>
      <div style="margin-top:10px;">
        <label style="display:block;font-size:12px;color:#475569;margin-bottom:4px;">Observación</label>
        <input id="benef-obs" type="text" maxlength="255" placeholder="Opcional" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;" />
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;">
        <button id="benef-cancel" type="button" style="padding:8px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#475569;">Cancelar</button>
        <button id="benef-add" type="button" style="padding:8px 14px;border:none;border-radius:8px;background:#2563eb;color:#fff;">Agregar beneficio</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const sel = overlay.querySelector('#benef-cat') as HTMLSelectElement;
  const hrs = overlay.querySelector('#benef-hrs') as HTMLInputElement;
  sel?.addEventListener('change', () => {
    const opt = sel.options[sel.selectedIndex];
    const horas = Number(opt?.dataset?.horas || 0);
    if (horas > 0) hrs.value = String(horas);
  });

  overlay.querySelector('#benef-cancel')?.addEventListener('click', () => overlay?.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay?.remove(); });
  overlay.querySelector('#benef-add')?.addEventListener('click', () => {
    const id = Number((overlay?.querySelector('#benef-cat') as HTMLSelectElement).value || '0');
    const opt = (overlay?.querySelector('#benef-cat') as HTMLSelectElement).selectedOptions[0];
    const nombre = String(opt?.dataset?.nombre || opt?.text || '').trim();
    if (!id || !nombre) {
      mostrarToast('warning', 'Dato requerido', 'Seleccione una capacitación para el beneficio');
      return;
    }
    beneficiosServicioRows.push({
      id_catalogo_cap_aud: id,
      nombre_beneficio: nombre,
      modalidad_sugerida: (overlay?.querySelector('#benef-mod') as HTMLSelectElement).value || null,
      horas_capacitacion: parseFloat((overlay?.querySelector('#benef-hrs') as HTMLInputElement).value || '0') || 0,
      precio_referencial: 0,
      observacion: (overlay?.querySelector('#benef-obs') as HTMLInputElement).value || '',
    });
    renderBeneficiosServicio(panelEl);
    overlay?.remove();
  });
}

function getGuardarButtonHtml(esEdicion: boolean): string {
  if (esEdicion) {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg> Actualizar Cotización';
  }

  return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Guardar Cotización';
}

function resetEditarCotizacionState() {
  cotizacionEditandoId = null;
  cotizacionEditandoTipo = null;
  cotizacionEditandoNumero = '';
}

//  RENDER PRINCIPAL 
export function renderComercialCotizaciones(): string {
  return `
    <div class="page-header">
      <h1>Órdenes de Cotización</h1>
    </div>

    <!-- Navegación por tabs -->
    <div class="cotiz-tabs-nav" style="display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:24px;">
      <button class="cotiz-tab active" data-tab="historial" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid #2563eb;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:600;color:#2563eb;transition:color .15s;">Historial General</button>
      <button class="cotiz-tab" data-tab="servicio" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:color .15s;">Servicio</button>
      <button class="cotiz-tab" data-tab="producto" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:color .15s;">Producto</button>
      <button class="cotiz-tab" data-tab="capacitacion" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:color .15s;">Capacitación</button>
      <button class="cotiz-tab" data-tab="asesoria" style="padding:10px 24px;background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;font-size:14px;font-weight:500;color:#64748b;transition:color .15s;">Asesoría</button>
    </div>

    <!-- Panel: Historial General -->
    <div id="cotiz-panel-historial">
      <div class="stats-row" style="margin-bottom: 24px;" id="cotizaciones-stats">
        <div class="stat-box">
          <div class="stat-box-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">TOTAL COTIZACIONES</div>
            <div class="stat-box-value" id="stat-total">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">PENDIENTES</div>
            <div class="stat-box-value" id="stat-pendientes">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">ACEPTADAS</div>
            <div class="stat-box-value" id="stat-aceptadas">0</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon red"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>
          <div class="stat-box-content">
            <div class="stat-box-label">RECHAZADAS</div>
            <div class="stat-box-value" id="stat-rechazadas">0</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="op-filters-bar">
        <div class="op-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input type="text" placeholder="Buscar cotización o cliente..." class="op-search-input" id="cotiz-search">
        </div>
        <div class="op-filter-group">
          <select class="op-filter-select" id="cotiz-filter-tipo">
            <option value="">Todos los tipos</option>
            <option value="Servicio">Servicio</option>
            <option value="Producto">Producto</option>
            <option value="Capacitacion">Capacitación</option>
            <option value="Asesoria">Asesoría</option>
          </select>
          <select class="op-filter-select" id="cotiz-filter-estado">
            <option value="">Todos los estados</option>
            <option value="Aceptada">Aceptada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° COTIZACIÓN</th>
              <th>CLIENTE</th>
              <th>FECHA EMISIÓN</th>
              <th>TIPO</th>
              <th>ESTADO</th>
              <th>IMPLEMENTACIÓN</th>
              <th>TOTAL</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody id="cotizaciones-tbody">
            <tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">Cargando cotizaciones...</td></tr>
          </tbody>
        </table>
      </div>

      <div id="cotizaciones-pagination" class="pagination">
        <span class="pagination-info"></span>
        <div class="pagination-controls" id="cotiz-pagination-controls" style="display:flex;gap:8px;align-items:center;">
          <!-- Se llenará dinámicamente -->
        </div>
      </div>
    </div>

    <!-- Panel: Servicio -->
    <div id="cotiz-panel-servicio" style="display:none;">
      <div id="cotiz-form-servicio"></div>
    </div>

    <!-- Panel: Producto -->
    <div id="cotiz-panel-producto" style="display:none;">
      <div id="cotiz-form-producto"></div>
    </div>

    <!-- Panel: Capacitación -->
    <div id="cotiz-panel-capacitacion" style="display:none;">
      <div id="cotiz-form-capacitacion"></div>
    </div>

    <!-- Panel: Asesoría -->
    <div id="cotiz-panel-asesoria" style="display:none;">
      <div id="cotiz-form-asesoria"></div>
    </div>
  `;
}

//  CARGAR DATOS 
async function cargarEstadisticas() {
  try {
    const response = await cotizacionService.getEstadisticas();
    estadisticasData = response.data || response;
    renderizarEstadisticas();
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

function renderizarEstadisticas() {
  if (!estadisticasData) return;
  const s = estadisticasData;
  const el = (id: string, val: any) => { const e = document.getElementById(id); if (e) e.textContent = String(val); };
  el('stat-total', s.total);
  el('stat-pendientes', s.pendientes);
  el('stat-aceptadas', s.aceptadas);
  el('stat-rechazadas', s.rechazadas);
}

async function cargarCotizaciones() {
  try {
    const params: any = {};
    if (filtros.search) params.search = filtros.search;
    if (filtros.tipo) params.tipo = filtros.tipo;
    if (filtros.estado) params.estado = filtros.estado;

    const response = await cotizacionService.getAll(params);
    const data = response.data || response;
    cotizacionesData = Array.isArray(data) ? data : (data as any).data || [];
    cotizacionesData.sort((a: any, b: any) => {
      const fa = Date.parse(String(a?.fecha_emision || '')) || 0;
      const fb = Date.parse(String(b?.fecha_emision || '')) || 0;
      if (fb !== fa) return fb - fa;
      return Number(b?.id || 0) - Number(a?.id || 0);
    });
    paginaActual = 1; // Resetear a primera página al cargar nuevos datos
    renderizarTabla();
  } catch (error) {
    console.error('Error cargando cotizaciones:', error);
    const tbody = document.getElementById('cotizaciones-tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#ef4444;">Error al cargar cotizaciones</td></tr>';
  }
}

function renderizarTabla() {
  const tbody = document.getElementById('cotizaciones-tbody');
  if (!tbody) return;

  if (cotizacionesData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">No se encontraron cotizaciones</td></tr>';
    renderizarPaginacion();
    return;
  }

  // Calcular índices para paginación
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const cotizacionesPagina = cotizacionesData.slice(inicio, fin);

  tbody.innerHTML = cotizacionesPagina.map(cot => {
    const numero = cot.numero || cot.numero_cotizacion || '—';
    const cliente = cot.cliente_nombre || (cot.cliente as any)?.nombre_empresa || '—';
    const fecha = cot.fecha_emision ? new Date(cot.fecha_emision).toLocaleDateString('es-PE') : '—';
    const tipoRaw = cot.tipo || cot.tipo_cotizacion || '—';
    const tipoNorm = String(tipoRaw)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const total = typeof cot.total === 'number' ? `S/ ${cot.total.toFixed(2)}` : '—';
    const estado = cot.estado || '—';

    let tipoBadgeClass = 'info';
    let tipoLabel = String(tipoRaw || '—');
    if (tipoNorm.includes('serv')) {
      tipoBadgeClass = 'info';
      tipoLabel = 'Servicio';
    } else if (tipoNorm.includes('prod')) {
      tipoBadgeClass = 'purple';
      tipoLabel = 'Producto';
    } else if (tipoNorm.includes('capacit')) {
      tipoBadgeClass = 'cyan';
      tipoLabel = 'Capacitación';
    } else if (tipoNorm.includes('asesor')) {
      tipoBadgeClass = 'blue';
      tipoLabel = 'Asesoría';
    }

    const estadoBadge: Record<string, string> = {
      'Aceptada': 'badge-green',
      'Pendiente': 'badge-warning',
      'Rechazada': 'red',
    };

    // Obtener información de implementación para Asesoría
    const esAsesoria = tipoNorm.includes('asesor');
    const infoImpl = esAsesoria ? obtenerInfoImplementacionAsesor(cot) : { meses: null, frecuencia: '—' };
    const implementacionHtml = esAsesoria && infoImpl.meses 
      ? `<div style="font-size:11px;color:#64748b;">
           ${infoImpl.meses} mes${infoImpl.meses !== 1 ? 'es' : ''}<br/>
           <span style="color:#94a3b8;font-size:10px;">${infoImpl.frecuencia}</span>
         </div>`
      : '';

    return `
      <tr>
        <td><strong>${numero}</strong></td>
        <td>${cliente}</td>
        <td>${fecha}</td>
        <td><span class="badge ${tipoBadgeClass}">${tipoLabel}</span></td>
        <td><span class="badge ${estadoBadge[estado] || 'badge-warning'}">${estado}</span></td>
        <td>${implementacionHtml || `<strong>${total}</strong>`}</td>
        <td><strong>${total}</strong></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-icon edit" data-action="edit-cotiz" data-id="${cot.id}" title="Editar cotización">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </button>
            <button class="action-btn-icon" style="color:#0ea5e9;" data-action="pdf-cotiz" data-id="${cot.id}" title="Descargar PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderizarPaginacion();
}

function renderizarPaginacion() {
  const totalPaginas = Math.ceil(cotizacionesData.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina + 1;
  const fin = Math.min(inicio + itemsPorPagina - 1, cotizacionesData.length);

  // Info de paginación
  const pag = document.querySelector('#cotizaciones-pagination .pagination-info');
  if (pag) {
    pag.textContent = cotizacionesData.length > 0 
      ? `Mostrando ${inicio}-${fin} de ${cotizacionesData.length} cotizaciones`
      : 'No hay cotizaciones';
  }

  // Controles de paginación
  const controls = document.getElementById('cotiz-pagination-controls');
  if (!controls) return;

  if (totalPaginas <= 1) {
    controls.innerHTML = '';
    return;
  }

  let html = `
    <button class="pagination-btn" id="cotiz-pag-prev" ${paginaActual === 1 ? 'disabled' : ''} style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
  `;

  // Números de página
  const rango = 2; // Cuántas páginas mostrar a cada lado de la actual
  let inicio_pag = Math.max(1, paginaActual - rango);
  let fin_pag = Math.min(totalPaginas, paginaActual + rango);

  if (inicio_pag > 1) {
    html += `<button class="pagination-btn" data-page="1" style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">1</button>`;
    if (inicio_pag > 2) html += `<span style="padding:0 4px;color:#94a3b8;">...</span>`;
  }

  for (let i = inicio_pag; i <= fin_pag; i++) {
    const activo = i === paginaActual;
    html += `<button class="pagination-btn" data-page="${i}" style="padding:6px 12px;border:1px solid ${activo ? '#3b82f6' : '#e2e8f0'};background:${activo ? '#3b82f6' : '#fff'};color:${activo ? '#fff' : '#1e293b'};border-radius:6px;cursor:pointer;font-weight:${activo ? '600' : '400'};">${i}</button>`;
  }

  if (fin_pag < totalPaginas) {
    if (fin_pag < totalPaginas - 1) html += `<span style="padding:0 4px;color:#94a3b8;">...</span>`;
    html += `<button class="pagination-btn" data-page="${totalPaginas}" style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">${totalPaginas}</button>`;
  }

  html += `
    <button class="pagination-btn" id="cotiz-pag-next" ${paginaActual === totalPaginas ? 'disabled' : ''} style="padding:6px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:6px;cursor:pointer;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;

  controls.innerHTML = html;

  // Event listeners
  document.getElementById('cotiz-pag-prev')?.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderizarTabla();
    }
  });

  document.getElementById('cotiz-pag-next')?.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderizarTabla();
    }
  });

  controls.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt((e.target as HTMLElement).dataset.page || '1');
      paginaActual = page;
      renderizarTabla();
    });
  });
}

//  FORMULARIO NUEVA COTIZACIÓN 
async function abrirFormularioCotizacion(tipoFijo?: string) {
  console.log('[FORM] ====== INICIO abrirFormularioCotizacion para tipo:', tipoFijo);
  
  // Verificar si esta carga fue cancelada
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA al inicio para tipo:', tipoFijo);
    return;
  }

  const panelMap: Record<string, string> = {
    Servicio: 'cotiz-form-servicio',
    Producto: 'cotiz-form-producto',
    Capacitacion: 'cotiz-form-capacitacion',
    Asesoria: 'cotiz-form-asesoria'
  };
  const panelEl = tipoFijo ? document.getElementById(panelMap[tipoFijo] || '') : null;
  if (!panelEl) return;

  // Destruir instancia de Quill anterior si existe
  if (quillInstance) {
    try {
      quillInstance.disable();
      quillInstance = null;
    } catch (e) {
      console.warn('Error al destruir Quill anterior:', e);
      quillInstance = null;
    }
  }

  // Limpiar event listeners antiguos del Quill
  if (quillKeydownController) {
    try {
      (quillKeydownController as AbortController).abort();
    } catch (e) {
      console.warn('Error al limpiar keydown controller:', e);
    }
    quillKeydownController = null;
  }

  // Remover styles antiguo del cliente combo (para evitar conflictos)
  const oldClienteComboStyles = document.getElementById('cliente-combo-styles');
  if (oldClienteComboStyles) {
    oldClienteComboStyles.remove();
  }

  panelEl.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;font-size:14px;">Cargando formulario...</div>';

  // Cargar clientes aceptados y servicios/productos
  let clientesOptions = '';
  let clientesDivs = '';
  let serviciosData: any[] = [];
  let productosData: any[] = [];
  let catalogoCapAudData: any[] = [];
  let numeroCotizacion = estadisticasData ? (estadisticasData as any).siguiente_numero || '' : '';

  try {
    console.log('[FORM] 📥 Iniciando carga de datos para tipo:', tipoFijo);
    const [clientesRes, serviciosRes, productosRes, catalogoRes] = await Promise.all([
      clienteService.getAll({ estado: 'Acepta' } as any),
      servicioService.getAll({ estado: 'activo', per_page: 100 }),
      productoService.getAll({ estado: 'Activo', per_page: 100 } as any),
      catalogoCapAudService.getAll({ estado: 'activo' })
    ]);

    console.log('[FORM] ✅ Datos cargados - Clientes:', clientesRes.data?.length, 'Servicios:', serviciosRes.data?.length, 'Productos:', productosRes.data?.length);

    const clientes = Array.isArray(clientesRes.data) ? clientesRes.data : (clientesRes as any).data || [];
    console.log('[FORM] 👥 Clientes procesados:', clientes.length);
    
    clientes.forEach((c: any) => {
      clientesOptions += `<option value="${c.id}">${c.nombre_empresa} - ${c.ruc}</option>`;
      clientesDivs += `<div class="cliente-option" data-value="${c.id}">${c.nombre_empresa} - ${c.ruc}</div>`;
    });

    serviciosData = Array.isArray(serviciosRes.data) ? serviciosRes.data : [];
    productosData = Array.isArray(productosRes.data) ? productosRes.data : [];
    catalogoCapAudData = Array.isArray(catalogoRes.data) ? catalogoRes.data : [];

    // Si no se tenía el número, obtenerlo de estadísticas
    if (!numeroCotizacion) {
      const statsRes = await cotizacionService.getEstadisticas();
      const stats = statsRes.data || statsRes;
      numeroCotizacion = (stats as any).siguiente_numero || '';
    }
  } catch (error) {
    console.error('[FORM] ❌ Error cargando datos:', error);
  }

  // Guardar en window para acceso desde las líneas
  (window as any).__serviciosData = serviciosData;
  (window as any).__productosData = productosData;
  (window as any).__catalogoCapAudData = catalogoCapAudData;

  // Verificar nuevamente si fue cancelada después de cargar datos
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA después de cargar datos para tipo:', tipoFijo);
    return;
  }

  console.log('[FORM] ✅ Pasó validación post-datos, continuando...');

  const hoy = new Date().toISOString().split('T')[0];
  incluyeIgv = true;
  contadorLineas = 0;
  const esModoEdicion = cotizacionEditandoId !== null;

  // Sección especial para técnicos/supervisor SOLO para Servicio
  const seccionLimpiezaCisternas = tipoFijo === 'Servicio' ? `
    <div id="seccion-limpieza-cisternas" style="display:none;margin-bottom:24px;padding:16px 20px;background:#f1f5f9;border-radius:8px;">
      <div style="font-weight:600;margin-bottom:10px;color:#2563eb;">Datos de Operación para Servicios Especiales</div>
      <div id="bloque-limpieza-cisternas" style="display:none;gap:24px;align-items:center;margin-bottom:12px;">
        <div>
          <label for="input-op-tecnicos" style="font-size:13px;font-weight:500;">Operarios Técnicos</label>
          <input type="number" min="0" id="input-op-tecnicos" class="input" style="width:80px;margin-left:8px;" value="0">
        </div>
        <div>
          <label for="input-supervisor" style="font-size:13px;font-weight:500;">Supervisor</label>
          <input type="number" min="0" id="input-supervisor" class="input" style="width:80px;margin-left:8px;" value="0">
        </div>
        <div style="min-width:320px;">
          <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Medidas por área</label>
          <div id="contenedor-medidas-tanque" style="display:grid;gap:8px;"></div>
        </div>
      </div>

      <div id="bloque-fosfina" style="display:none;padding-top:10px;border-top:1px dashed #cbd5e1;">
        <div style="font-size:13px;font-weight:600;color:#334155;margin-bottom:10px;">Datos para DESINSECTACIÓN QUÍMICA CON FOSFINA</div>
        <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
          <div>
            <label for="input-producto-fosfina" style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Producto</label>
            <input type="text" id="input-producto-fosfina" class="input" style="width:280px;" placeholder="Escriba producto" value="">
          </div>
          <div>
            <label for="input-cantidad-fosfina" style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Cantidad</label>
            <input type="text" id="input-cantidad-fosfina" class="input" style="width:120px;" placeholder="Ej: 1" value="">
          </div>
          <div>
            <label for="input-medida-tanque-fosfina" style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Volumen</label>
            <input type="text" id="input-medida-tanque-fosfina" class="input" style="width:200px;" placeholder="Ej: 10" value="">
          </div>
        </div>
      </div>
    </div>
  ` : '';

  const seccionExponentesCapacitacion = tipoFijo === 'Capacitacion' ? `
    <div class="form-section" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
        <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Asignar Exponente(s)</h3>
      </div>
      <div style="display:grid;grid-template-columns:minmax(320px,2fr) repeat(3,minmax(140px,1fr));gap:12px;align-items:end;">
        <div class="form-group">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Exponente(s) <span style="color:#ef4444">*</span></label>
          <div id="cot-exponentes-container" style="border:1px solid #d1d5db;border-radius:8px;padding:8px;min-height:44px;background:#fff;">
            <div id="cot-exponentes-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;"></div>
            <select id="cot-exponente-selector" class="form-control" style="border:none;padding:4px 0;margin:0;box-shadow:none;width:100%;">
              <option value="">+ Agregar exponente...</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Fecha Servicio</label>
          <input type="date" id="cot-cap-fecha-servicio" class="form-control" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
        </div>
        <div class="form-group">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Horas Capacitación</label>
          <input type="number" id="cot-cap-horas" class="form-control" value="0" min="0" step="0.5" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
        </div>
        <div class="form-group">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Participantes</label>
          <input type="number" id="cot-cap-participantes" class="form-control" value="1" min="1" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
        </div>
      </div>
    </div>
  ` : tipoFijo === 'Asesoria' ? `
    <div class="form-section" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
        <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Asignar Exponente(s)</h3>
      </div>
      <div style="display:grid;grid-template-columns:minmax(320px,2fr) minmax(140px,0.7fr) minmax(340px,1.3fr);gap:12px;align-items:end;">
        <div class="form-group">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Exponente(s) <span style="color:#ef4444">*</span></label>
          <div id="cot-exponentes-container" style="border:1px solid #d1d5db;border-radius:8px;padding:8px;min-height:44px;background:#fff;">
            <div id="cot-exponentes-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;"></div>
            <select id="cot-exponente-selector" class="form-control" style="border:none;padding:4px 0;margin:0;box-shadow:none;width:100%;">
              <option value="">+ Agregar exponente...</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Tiempo de Implementación (Meses)</label>
          <input type="number" id="cot-cap-fecha-servicio" class="form-control" value="1" min="1" step="1" style="max-width:180px; width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
        </div>
        <div class="form-group">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Frecuencia por Visita</label>
          <div id="cot-frecuencia-visita-container" style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#fff;"></div>
        </div>
      </div>
    </div>
  ` : '';

  const seccionObjetivosAsesoria = (tipoFijo === 'Asesoria' || tipoFijo === 'Capacitacion') ? `
    <div class="form-section" style="margin-bottom: 24px; background: #fff; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="margin-bottom: 12px;">
        <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">${tipoFijo === 'Capacitacion' ? 'Objetivos de la Capacitación' : 'Objetivos de la Asesoría'}</label>
        <textarea id="cot-objetivos-asesoria" class="form-control" placeholder="${tipoFijo === 'Capacitacion' ? 'Ingrese los objetivos de la capacitación...' : 'Ingrese los objetivos de la asesoría...'}" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; font-family:Arial, sans-serif; min-height:100px; resize:vertical;"></textarea>
      </div>
    </div>
  ` : '';

  panelEl.innerHTML = `
    <div class="form-card" style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <form id="form-cotizacion">
        <div class="form-section" style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">Información General</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">N° Cotización</label>
              <input type="text" id="cot-numero" class="form-control" value="${numeroCotizacion || 'Generando...'}" readonly style="background: #f1f5f9; color: #1e293b; font-weight: 600; width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
            </div>
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Fecha de Emisión</label>
              <input type="date" id="cot-fecha" class="form-control" value="${hoy}" readonly style="background: #f1f5f9; width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
            </div>
            <div class="form-group" style="position:relative;">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Cliente </label>
              <input type="hidden" id="cot-cliente" value="" />
              <div id="cliente-combo" style="position:relative;">
                <input type="text" id="cot-cliente-search" class="form-control" placeholder="Buscar cliente por nombre o RUC..." autocomplete="off"
                  style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; padding-right:36px;" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
                <div id="cliente-dropdown" style="display:none;position:absolute;z-index:999;top:100%;left:0;right:0;max-height:220px;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                  ${clientesDivs}
                </div>
              </div>
            </div>
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Tipo de Cotización</label>
              ${tipoFijo ? `
                <input type="text" class="form-control" value="${tipoFijo === 'Capacitacion' ? 'Capacitacion' : (tipoFijo === 'Asesoria' ? 'Asesoria' : tipoFijo)}" readonly style="background:#f1f5f9;color:#1e293b;font-weight:600;width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;cursor:not-allowed;">
                <input type="hidden" id="cot-tipo" value="${tipoFijo}">
              ` : `
                <select id="cot-tipo" class="form-control" required style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
                  <option value="">Seleccione tipo...</option>
                  <option value="Servicio">Servicio</option>
                  <option value="Producto">Producto</option>
                  <option value="Capacitacion">Capacitacion</option>
                  <option value="Asesoria">Asesoria</option>
                </select>
              `}
            </div>
            <div style="grid-column: span 1; display: flex; gap: 12px;">
              <div style="flex: 1;">
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">¿Incluye IGV?</label>
                  <select id="cot-igv" class="form-control" style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
                    <option value="1" selected>Sí (18%)</option>
                    <option value="0">No IGV</option>
                  </select>
              </div>
              <div style="flex: 1;">
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Condiciones de Pago</label>
                  <select id="cot-multicim" class="form-control" required style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
                    <option value="">Seleccione...</option>
                    <option value="1">CIM</option>
                    <option value="2">MULTI</option>
                  </select>
              </div>
            </div>
            <div class="form-group">
              <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Observaciones</label>
              <input type="text" id="cot-observaciones" class="form-control" placeholder="Observaciones adicionales..." style="width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px;">
            </div>
          </div>
        </div>

        ${seccionObjetivosAsesoria}

        ${seccionExponentesCapacitacion}

        ${tipoFijo === 'Asesoria' ? `
        <div class="propuesta-tecnica-container" style="margin-bottom: 25px; background: #fff; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Propuesta Técnica</h3>
                <button type="button" id="btn-toggle-propuesta" style="font-size: 12px; padding: 5px 10px; cursor: pointer; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px;">
                    Mostrar/Ocultar Editor
                </button>
            </div>

            <div id="table-controls" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom: 10px;">
              <button type="button" class="btn-secondary" id="btn-insert-table-5x5" style="padding:6px 10px;">Insertar tabla 5×5</button>
              <button type="button" class="btn-secondary" id="btn-add-row" style="padding:6px 10px;">Agregar fila</button>
              <button type="button" class="btn-secondary" id="btn-del-row" style="padding:6px 10px;">Eliminar fila</button>
              <button type="button" class="btn-secondary" id="btn-add-col" style="padding:6px 10px;">Agregar columna</button>
              <button type="button" class="btn-secondary" id="btn-del-col" style="padding:6px 10px;">Eliminar columna</button>
            </div>

            <div id="editor-wrapper" style="display: block;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Use el editor para dar formato a los objetivos y actividades tal cual aparecerán en el PDF.</p>
                <div id="editor-propuesta" style="height: 700px; background: #fff;"></div>
            </div>
        </div>
          ` : ''}

        <div class="form-section" style="margin-bottom: 24px;">
          ${seccionLimpiezaCisternas}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">Detalle de Cotización</h3>
            <button type="button" class="btn-secondary" id="btn-agregar-linea" ${tipoFijo ? '' : 'disabled'} style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:${tipoFijo ? 'pointer' : 'not-allowed'};opacity:${tipoFijo ? '1' : '0.6'};font-size:13px;font-weight:600;color:#475569;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Agregar Línea
            </button>
          </div>
          <div class="table-container">
            <table class="data-table" id="tabla-detalle-cotizacion">
              <thead>
                <tr>
                  <th style="width: 20%;">Servicio/Producto</th>
                  <th style="width: 14%;">Planta</th>
                  <th style="width: 14%;">Área</th>
                  ${tipoFijo === 'Servicio' || tipoFijo === 'Asesoria' || tipoFijo === 'Capacitacion' ? '' : '<th style="width: 8%;">Cantidad</th>'}
                  <th style="width: 11%;">${tipoFijo === 'Asesoria' || tipoFijo === 'Capacitacion' || tipoFijo === 'Servicio' ? 'Precio' : 'Precio Unit.'}</th>
                  ${tipoFijo === 'Asesoria' || tipoFijo === 'Producto' ? '' : '<th style="width: 11%;">Frecuencia</th>'}
                  ${tipoFijo === 'Servicio' || tipoFijo === 'Producto' ? '' : '<th style="width: 10%;">Modalidad</th>'}
                  <!-- Eliminado: técnicos/supervisor de capacitación -->
                  <th style="width: 9%;">Subtotal</th>
                  <th style="width: 3%;"></th>
                </tr>
              </thead>
              <tbody id="detalle-cotizacion-body"></tbody>
            </table>
          </div>
        </div>

        ${tipoFijo === 'Servicio' ? `
        <div class="form-section" style="margin-bottom: 24px; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;">
            <h3 style="font-size: 15px; font-weight: 700; color: #334155; margin: 0;">Receta de Servicio (Equipos y Productos)</h3>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn-secondary" id="btn-agregar-equipo-receta-servicio" style="padding:6px 10px;font-size:12px;" title="Agregar equipo por servicio/planta/área">
                Agregar Equipo
              </button>
              <button type="button" class="btn-secondary" id="btn-agregar-prod-receta-servicio" style="padding:6px 10px;font-size:12px;">
                Agregar Producto
              </button>
            </div>
          </div>
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Cargue la receta según los servicios seleccionados y ajuste productos según criterio del cliente.</div>
          <div class="table-container" style="max-height:620px;overflow:auto;">
            <table class="data-table" style="min-width: 900px;">
              <thead>
                <tr>
                  <th style="width:26%;">Servicio / Planta / Área / Equipo</th>
                  <th style="width:32%;">Producto</th>
                  <th style="width:10%;text-align:center;">Cantidad</th>
                  <th style="width:24%;">Observación</th>
                  <th style="width:8%;"></th>
                </tr>
              </thead>
              <tbody id="receta-servicio-body"></tbody>
            </table>
          </div>
          <div id="receta-servicio-empty" style="text-align:center;padding:10px;color:#94a3b8;font-size:12px;">Sin productos de receta. Use "Agregar Equipo" o "Agregar Producto".</div>

          <div id="modal-cot-receta-equipo" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:10000;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:12px;width:min(520px,92vw);box-shadow:0 20px 40px rgba(15,23,42,.25);overflow:hidden;">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #e2e8f0;">
                <h4 style="margin:0;font-size:16px;color:#0f172a;">Agregar Equipo</h4>
                <button type="button" id="modal-cot-receta-equipo-cerrar" style="background:none;border:none;font-size:20px;line-height:1;color:#64748b;cursor:pointer;">&times;</button>
              </div>
              <div style="padding:16px;display:grid;gap:12px;">
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Bloque Servicio / Planta / Área <span style="color:#ef4444">*</span></label>
                  <select id="cot-receta-equipo-grupo" class="form-control" style="width:100%;padding:9px 10px;border:1px solid #e2e8f0;border-radius:8px;"></select>
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Equipo <span style="color:#ef4444">*</span></label>
                  <select id="cot-receta-equipo-id" class="form-control" style="width:100%;padding:9px 10px;border:1px solid #e2e8f0;border-radius:8px;"></select>
                </div>
                <p style="font-size:12px;color:#64748b;margin:0;">Se creará el grupo del equipo y podrá añadir los productos manualmente.</p>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;background:#f8fafc;">
                <button type="button" id="modal-cot-receta-equipo-cancelar" class="btn-secondary" style="padding:6px 10px;font-size:12px;">Cancelar</button>
                <button type="button" id="modal-cot-receta-equipo-confirmar" class="btn-primary" style="padding:6px 10px;font-size:12px;">Agregar</button>
              </div>
            </div>
          </div>

          <div id="modal-cot-receta-producto" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:10000;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:12px;width:min(520px,92vw);box-shadow:0 20px 40px rgba(15,23,42,.25);overflow:hidden;">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #e2e8f0;">
                <h4 style="margin:0;font-size:16px;color:#0f172a;">Agregar Producto</h4>
                <button type="button" id="modal-cot-receta-producto-cerrar" style="background:none;border:none;font-size:20px;line-height:1;color:#64748b;cursor:pointer;">&times;</button>
              </div>
              <div style="padding:16px;display:grid;gap:12px;">
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Bloque Servicio / Planta / Área <span style="color:#ef4444">*</span></label>
                  <select id="cot-receta-producto-grupo" class="form-control" style="width:100%;padding:9px 10px;border:1px solid #e2e8f0;border-radius:8px;"></select>
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Producto (Categoría DISPOSITIVOS) <span style="color:#ef4444">*</span></label>
                  <select id="cot-receta-producto-id" class="form-control" style="width:100%;padding:9px 10px;border:1px solid #e2e8f0;border-radius:8px;"></select>
                </div>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;background:#f8fafc;">
                <button type="button" id="modal-cot-receta-producto-cancelar" class="btn-secondary" style="padding:6px 10px;font-size:12px;">Cancelar</button>
                <button type="button" id="modal-cot-receta-producto-confirmar" class="btn-primary" style="padding:6px 10px;font-size:12px;">Agregar</button>
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        ${tipoFijo === 'Servicio' ? `
        <div class="form-section" style="margin-bottom:24px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#334155;font-weight:600;cursor:pointer;">
              <input type="checkbox" id="chk-beneficios-servicio" style="width:16px;height:16px;">
              Incluir beneficios (capacitaciones gratis)
            </label>
            <button type="button" id="btn-gestionar-beneficios" class="btn-secondary" style="padding:6px 10px;font-size:12px;display:none;">Gestionar beneficios</button>
          </div>
          <div id="beneficios-servicio-wrap" style="display:none;margin-top:10px;">
            <div class="table-container" style="max-height:260px;overflow:auto;">
              <table class="data-table" style="min-width:700px;">
                <thead>
                  <tr>
                    <th>Capacitación</th>
                    <th>Modalidad</th>
                    <th style="text-align:center;">Tiempo</th>
                    <th>Precio</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="beneficios-servicio-body"></tbody>
              </table>
            </div>
            <div id="beneficios-servicio-empty" style="text-align:center;padding:10px;color:#94a3b8;font-size:12px;">Sin beneficios registrados.</div>
          </div>
        </div>
        ` : ''}

        <div class="form-section" style="margin-bottom: 24px;">
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; width: 280px;">
              <span style="font-size: 14px; color: #64748b;">Subtotal:</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b;" id="subtotal-value">S/ 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; width: 280px;" id="igv-row">
              <span style="font-size: 14px; color: #64748b;">IGV (18%):</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b;" id="igv-value">S/ 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; width: 280px; padding-top: 8px; border-top: 2px solid #cbd5e1;">
              <span style="font-size: 16px; font-weight: 700; color: #1e293b;">Total:</span>
              <span style="font-size: 16px; font-weight: 700; color: #16a34a;" id="total-value">S/ 0.00</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <button type="button" class="btn-secondary" id="btn-cancelar-cotiz" style="padding:10px 24px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
          <button type="submit" class="btn-primary" id="btn-guardar-cotiz" style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
            ${getGuardarButtonHtml(esModoEdicion)}
          </button>
        </div>
      </form>
    </div>
  `;

  console.log('[FORM] 🎨 HTML renderizado, inserting en panel...');
  
  // Verificar si fue cancelada antes de renderizar
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA antes de renderizar para tipo:', tipoFijo);
    return;
  }

  console.log('[FORM] � DOM renderizado, inicializando componentes...');

  // Verificar inmediatamente que el elemento cot-tipo existe
  const cotTipoElAfterInsert = panelEl.querySelector('#cot-tipo') as HTMLSelectElement;
  console.log('[FORM] 🔍 Verificando cot-tipo DESPUÉS de insertar HTML - Encontrado:', !!cotTipoElAfterInsert, 'Valor:', cotTipoElAfterInsert?.value, 'Tipo esperado:', tipoFijo);

  // --- CONFIGURACIÓN DEL EDITOR (PEGA AQUÍ) ---
  await ensureQuillLoaded();
  // Aseguramos que el DOM ya haya renderizado el HTML generado.
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  console.log('[FORM] 📋 DOM renderizado, inicializando componentes...');

  // Verificar si fue cancelada después de renderizar
  if (formularioLoadController?.signal.aborted) {
    console.log('[FORM] ❌ CANCELADA después de renderizar para tipo:', tipoFijo);
    return;
  }

  const container = panelEl.querySelector('#editor-propuesta') as HTMLElement;
  if (container && (window as any).Quill) {
    const isCursorInsideTable = () => {
      const sel = document.getSelection();
      if (!sel || !sel.anchorNode) return false;

      let node: Node | null = sel.anchorNode;
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === 'TD') return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    try {
      quillInstance = new (window as any).Quill(container, {
        theme: 'snow',
        placeholder: 'Escriba objetivos, actividades y temario aquí...',
        modules: {
          table: {
            Selection: true,
            operationMenu: {
              items: {
                insertLineBefore: { text: 'Insertar fila antes' },
                insertLineAfter: { text: 'Insertar fila después' },
                insertColumnBefore: { text: 'Insertar columna antes' },
                insertColumnAfter: { text: 'Insertar columna después' },
                deleteLine: { text: 'Eliminar fila' },
                deleteColumn: { text: 'Eliminar columna' },
                unmergeCells: { text: 'Deshacer combinación' }
              },
              color: {
                colors: ['#2563eb', '#ef4444', '#10b981'],
                text: 'Fondo de celda'
              }
            }
          },
          toolbar: [
            [{'header': [1, 2, 3, false]}],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            // La tabla se maneja con los botones personalizados de la UI
            ['clean']
          ],
        }
      });

      console.log('[QUILL] ✅ Quill inicializado correctamente:', !!quillInstance);
      
      // Dar foco al editor para permitir escribir
      setTimeout(() => {
        quillInstance?.focus?.();
      }, 100);

      const tableModule = quillInstance.getModule('table');
      const runTableAction = (action: () => void) => {
        if (!tableModule) {
          mostrarToast('warning', 'Tablas', 'El módulo de tablas no está disponible');
          return;
        }
        try {
          action();
        } catch (error) {
          console.error('Error en acción de tabla:', error);
        }
      };

      const findParentCell = (node: Node | null): HTMLElement | null => {
        while (node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName === 'TD') return el;
          }
          node = node.parentNode;
        }
        return null;
      };

      const moveSelectionToNextCell = () => {
        const sel = document.getSelection();
        if (!sel || !sel.anchorNode) return;

        const currentCell = findParentCell(sel.anchorNode);
        if (!currentCell) return;
        const currentRow = currentCell.parentElement;
        if (!currentRow) return;

        let nextCell = currentCell.nextElementSibling as HTMLElement | null;
        if (!nextCell) {
          const nextRow = currentRow.nextElementSibling as HTMLElement | null;
          if (!nextRow) return;
          nextCell = nextRow.querySelector('td');
        }
        if (!nextCell) return;

        try {
          const blot = (window as any).Quill.find(nextCell);
          if (!blot) return;
          const index = quillInstance.getIndex(blot);
          quillInstance.setSelection(index, 0, 'silent');
        } catch (e) {
          // Fallback: no hacemos nada
        }
      };

      // Limpiar y crear nuevo AbortController
      if (quillKeydownController) {
        try {
          (quillKeydownController as AbortController).abort();
        } catch (e) {
          console.warn('Error aborting previous controller:', e);
        }
      }
      quillKeydownController = new AbortController();
      document.addEventListener('keydown', (evt: KeyboardEvent) => {
        if (evt.key !== 'Enter') return;
        if (!isCursorInsideTable()) return;

        evt.preventDefault();
        evt.stopImmediatePropagation();

        if (evt.shiftKey) {
          const range = quillInstance.getSelection(true);
          if (!range) return;
          quillInstance.insertText(range.index, '\n', 'user');
          quillInstance.setSelection(range.index + 1, 0, 'silent');
        } else {
        moveSelectionToNextCell();
      }
    }, { capture: true, signal: quillKeydownController.signal });

      panelEl.querySelector('#btn-insert-table-5x5')?.addEventListener('click', () => {
        quillInstance?.focus?.();
        runTableAction(() => tableModule.insertTable(5, 5));
      });
      panelEl.querySelector('#btn-add-row')?.addEventListener('click', () => {
        quillInstance?.focus?.();
        runTableAction(() => tableModule.insertRowBelow());
      });
      panelEl.querySelector('#btn-del-row')?.addEventListener('click', () => {
        quillInstance?.focus?.();
        runTableAction(() => tableModule.deleteRow());
      });
      panelEl.querySelector('#btn-add-col')?.addEventListener('click', () => {
        quillInstance?.focus?.();
        runTableAction(() => tableModule.insertColumnRight());
      });
      panelEl.querySelector('#btn-del-col')?.addEventListener('click', () => {
        quillInstance?.focus?.();
        runTableAction(() => tableModule.deleteColumn());
      });
    } catch (error) {
      console.error('Error inicializando Quill:', error);
      // Continuar con el formulario aunque Quill falle
      quillInstance = null;
    }
  }

  const multicimSelect = panelEl.querySelector('#cot-multicim') as HTMLSelectElement;
  console.log('[FORM] 🎯 Multicim select encontrado:', !!multicimSelect, 'tabActivo:', tabActivo);
  multicimSelect?.addEventListener('change', (e) => {
      console.log('[FORM] 📨 Cambio en método de pago - tabActivo:', tabActivo, 'valor:', (e.target as HTMLSelectElement).value);
      const val = (e.target as HTMLSelectElement).value;
      const label = val === '1' ? 'CIM' : 'MULTITASKING';
      if(val) {
        console.log('[FORM] ✅ Mostrando toast para:', label);
        mostrarToast('success', 'Empresa Seleccionada', `Esta cotización se emitirá a nombre de ${label}`);
      }
  });
  const btnToggle = panelEl.querySelector('#btn-toggle-propuesta') as HTMLElement;
  const wrapper = panelEl.querySelector('#editor-wrapper') as HTMLElement;
  if (btnToggle && wrapper) {
    let isExpanded = true; // Estado inicial: expandido
    btnToggle.textContent = 'Minimizar Editor';
    btnToggle.onclick = () => {
      isExpanded = !isExpanded;
      wrapper.style.display = isExpanded ? 'block' : 'none';
      btnToggle.textContent = isExpanded ? 'Minimizar Editor' : 'Mostrar Editor';
      // Forzar que Quill se reajuste cuando se muestra
      if (isExpanded && quillInstance) {
        setTimeout(() => {
          (quillInstance as any)?.focus?.();
        }, 100);
      }
    };
  }
  // --- FIN CONFIGURACIÓN EDITOR ---

  // Eventos del formulario
  panelEl.querySelector('#btn-cancelar-cotiz')?.addEventListener('click', () => {
    if (cotizacionEditandoId) {
      resetEditarCotizacionState();
      cerrarFormulario();
      return;
    }

    if (tipoFijo) {
      abrirFormularioCotizacion(tipoFijo);
    } else {
      cerrarFormulario();
    }
  });

  panelEl.querySelector('#cot-igv')?.addEventListener('change', (e) => {
    incluyeIgv = (e.target as HTMLSelectElement).value === '1';
    const igvRow = panelEl.querySelector('#igv-row') as HTMLElement;
    if (igvRow) {
      igvRow.style.display = incluyeIgv ? 'flex' : 'none';
    }
    calcularTotales();
  });

  // ===== Inicializar combobox buscable de clientes =====
  console.log('[FORM] 🔧 Buscando elementos del cliente combo DENTRO del panel...');
  const clienteSearchInput = panelEl.querySelector('#cot-cliente-search') as HTMLInputElement;
  const clienteDropdown = panelEl.querySelector('#cliente-dropdown') as HTMLElement;
  const clienteHidden = panelEl.querySelector('#cot-cliente') as HTMLInputElement;

  console.log('[FORM] Cliente combo - search input:', !!clienteSearchInput, 'dropdown:', !!clienteDropdown, 'hidden:', !!clienteHidden, 'dentro de panel:', panelEl.id);

  if (clienteSearchInput && clienteDropdown) {
    console.log('[FORM] ✅ Cliente combo encontrado, configurando listeners...');
    const dropdownEl = clienteDropdown;

    // Mostrar dropdown al enfocar
    clienteSearchInput.addEventListener('focus', () => {
      console.log('[FORM] 👁️ Focus en cliente search - tabActivo:', tabActivo);
      dropdownEl.style.display = 'block';
      filtrarClientes();
    });

    // Filtrar al escribir
    clienteSearchInput.addEventListener('input', () => {
      console.log('[FORM] ✏️ Escribiendo en cliente search');
      filtrarClientes();
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      const combo = panelEl.querySelector('#cliente-combo') as HTMLElement;
      if (combo && !combo.contains(e.target as Node)) {
        dropdownEl.style.display = 'none';
      }
    });

    function filtrarClientes() {
      const term = clienteSearchInput.value.toLowerCase();
      const opciones = dropdownEl.querySelectorAll('.cliente-option');
      let visible = 0;
      opciones.forEach((opt: any) => {
        const texto = opt.textContent.toLowerCase();
        if (texto.includes(term)) {
          opt.style.display = 'block';
          visible++;
        } else {
          opt.style.display = 'none';
        }
      });
      // Mostrar mensaje si no hay resultados
      let noResult = dropdownEl.querySelector('.no-result') as HTMLElement | null;
      if (visible === 0) {
        if (!noResult) {
          dropdownEl.insertAdjacentHTML('beforeend', '<div class="no-result" style="padding:10px 12px;color:#94a3b8;font-size:13px;text-align:center;">No se encontraron clientes</div>');
        }
      } else if (noResult) {
        noResult.remove();
      }
    }

    // Delegación de eventos para seleccionar cliente
    dropdownEl.addEventListener('click', (e) => {
      const opt = (e.target as HTMLElement).closest('.cliente-option') as HTMLElement;
      if (opt) {
        const val = opt.dataset.value || '';
        const text = opt.textContent?.trim() || '';
        clienteHidden.value = val;
        clienteSearchInput.value = text;
        dropdownEl.style.display = 'none';
        // Cargar plantas del cliente seleccionado
        cargarPlantasCliente(parseInt(val));
      }
    });

    // Estilo hover para opciones (inyectado una vez)
    if (!document.getElementById('cliente-combo-styles')) {
      const style = document.createElement('style');
      style.id = 'cliente-combo-styles';
      style.textContent = `.cliente-option{padding:10px 12px;cursor:pointer;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9;transition:background .15s}.cliente-option:hover{background:#f0f7ff;color:#2563eb}.cliente-option:last-child{border-bottom:none}`;
      document.head.appendChild(style);
    }
  } else {
    console.error('[FORM] ❌ Cliente combo NO encontrado! - search:', !!clienteSearchInput, 'dropdown:', !!clienteDropdown, 'hidden:', !!clienteHidden);
  }

  panelEl.querySelector('#cot-tipo')?.addEventListener('change', () => {
    console.log('[FORM] ⚠️ CHANGE de tipo cotización - Nuevo valor:', (panelEl.querySelector('#cot-tipo') as HTMLSelectElement)?.value);
    const tbody = panelEl.querySelector('#detalle-cotizacion-body') as HTMLElement;
    if (tbody) tbody.innerHTML = '';
    contadorLineas = 0;
    calcularTotales();

    const btnAgregar = document.getElementById('btn-agregar-linea') as HTMLButtonElement;
    const tipo = (document.getElementById('cot-tipo') as HTMLSelectElement)?.value;
    if (btnAgregar) {
      const enabled = Boolean(tipo);
      btnAgregar.disabled = !enabled;
      btnAgregar.style.cursor = enabled ? 'pointer' : 'not-allowed';
      btnAgregar.style.opacity = enabled ? '1' : '0.6';
    }
  });

  panelEl.querySelector('#btn-agregar-linea')?.addEventListener('click', () => {
    console.log('[FORM] 📍 Click en agregar línea - tabActivo:', tabActivo, 'panel:', panelEl.id);
    const tipo = (panelEl.querySelector('#cot-tipo') as HTMLSelectElement)?.value;
    agregarLineaDetalle(tipo);
  });

  if (tipoFijo === 'Capacitacion' || tipoFijo === 'Asesoria') {
    selectedExponentesCotizacion = [];
    renderExponenteTagsCotizacion(panelEl);
    await cargarDropdownExponentesCotizacion(panelEl);
    initSelectorExponentesCotizacion(panelEl);

    if (tipoFijo === 'Asesoria') {
      generarTablaFrecuenciaVisita(panelEl);
    }

    panelEl.querySelector('#cot-cap-fecha-servicio')?.addEventListener('change', () => {
      if (tipoFijo === 'Asesoria') {
        generarTablaFrecuenciaVisita(panelEl);
      }
      aplicarDatosCapacitacionGlobalATodasLasLineas(panelEl);
    });
    panelEl.querySelector('#cot-cap-fecha-servicio')?.addEventListener('input', () => {
      if (tipoFijo === 'Asesoria') {
        generarTablaFrecuenciaVisita(panelEl);
      }
    });
    panelEl.querySelector('#cot-cap-horas')?.addEventListener('input', () => {
      aplicarDatosCapacitacionGlobalATodasLasLineas(panelEl);
    });
    panelEl.querySelector('#cot-cap-participantes')?.addEventListener('input', () => {
      aplicarDatosCapacitacionGlobalATodasLasLineas(panelEl);
    });
  }

  if (tipoFijo === 'Servicio') {
    recetaServicioRows = [];
    beneficiosServicioRows = [];
    renderRecetaServicio(panelEl);
    renderBeneficiosServicio(panelEl);

    const chkBenef = panelEl.querySelector('#chk-beneficios-servicio') as HTMLInputElement | null;
    const btnGestBenef = panelEl.querySelector('#btn-gestionar-beneficios') as HTMLButtonElement | null;
    chkBenef?.addEventListener('change', () => {
      if (btnGestBenef) btnGestBenef.style.display = chkBenef.checked ? 'inline-flex' : 'none';
      renderBeneficiosServicio(panelEl);
    });
    btnGestBenef?.addEventListener('click', () => abrirModalBeneficioServicio(panelEl));

    panelEl.querySelector('#btn-agregar-equipo-receta-servicio')?.addEventListener('click', () => {
      void abrirModalAgregarEquipoReceta(panelEl);
    });

    panelEl.querySelector('#modal-cot-receta-equipo-cerrar')?.addEventListener('click', () => {
      cerrarModalAgregarEquipoReceta(panelEl);
    });
    panelEl.querySelector('#modal-cot-receta-equipo-cancelar')?.addEventListener('click', () => {
      cerrarModalAgregarEquipoReceta(panelEl);
    });
    panelEl.querySelector('#modal-cot-receta-equipo-confirmar')?.addEventListener('click', () => {
      void confirmarAgregarEquipoReceta(panelEl);
    });

    panelEl.querySelector('#btn-agregar-prod-receta-servicio')?.addEventListener('click', () => {
      abrirModalAgregarProductoReceta(panelEl);
    });

    panelEl.querySelector('#modal-cot-receta-producto-cerrar')?.addEventListener('click', () => {
      cerrarModalAgregarProductoReceta(panelEl);
    });
    panelEl.querySelector('#modal-cot-receta-producto-cancelar')?.addEventListener('click', () => {
      cerrarModalAgregarProductoReceta(panelEl);
    });
    panelEl.querySelector('#modal-cot-receta-producto-confirmar')?.addEventListener('click', () => {
      confirmarAgregarProductoReceta(panelEl);
    });

    // Función para mostrar/ocultar sección de servicios especiales
    const actualizarSeccionLimpiezaCisternas = () => {
      const seccion = panelEl.querySelector('#seccion-limpieza-cisternas') as HTMLElement;
      if (!seccion) return;

      const bloqueLimpieza = panelEl.querySelector('#bloque-limpieza-cisternas') as HTMLElement | null;
      const bloqueFosfina = panelEl.querySelector('#bloque-fosfina') as HTMLElement | null;

      const tbody = panelEl.querySelector('#detalle-cotizacion-body') as HTMLElement;
      if (!tbody) return;

      const filas = tbody.querySelectorAll('tr');
      let tieneLimpiezaCisternas = false;
      let tieneFosfina = false;

      filas.forEach(fila => {
        const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement;
        if (itemSelect) {
          const selectedOption = itemSelect.options[itemSelect.selectedIndex];
          const servicioNombre = selectedOption?.textContent?.trim() || '';
          if (esServicioLimpiezaConMedida(servicioNombre)) {
            tieneLimpiezaCisternas = true;
          }
          if (esServicioFosfina(servicioNombre)) {
            tieneFosfina = true;
          }
        }
      }); 

      seccion.style.display = (tieneLimpiezaCisternas || tieneFosfina) ? 'block' : 'none';
      if (bloqueLimpieza) bloqueLimpieza.style.display = tieneLimpiezaCisternas ? 'flex' : 'none';
      if (bloqueFosfina) bloqueFosfina.style.display = tieneFosfina ? 'block' : 'none';
    };

    // Event listener para cambios en el detalle
    panelEl.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('item-select')) {
        actualizarSeccionLimpiezaCisternas();
      }
    });

    // También verificar cuando se agrega una nueva línea
    panelEl.querySelector('#btn-agregar-linea')?.addEventListener('click', () => {
      setTimeout(actualizarSeccionLimpiezaCisternas, 100); // Pequeño delay para que se renderice la nueva fila
    });

    // Verificar cuando se elimina una línea
    panelEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-eliminar-linea')) {
        setTimeout(actualizarSeccionLimpiezaCisternas, 100);
      }
    });
  }



  const form = panelEl.querySelector('#form-cotizacion') as HTMLFormElement;
  console.log('[FORM] 📝 Form encontrado:', !!form);
  form?.addEventListener('submit', async (e) => {
    console.log('[FORM] 💾 Submit del formulario');
    e.preventDefault();
    await guardarCotizacion(tipoFijo);
  });

  console.log('[FORM] ✅ ====== FIN abrirFormularioCotizacion - TODO INICIALIZADO CORRECTAMENTE para tipo:', tipoFijo);
}

function cerrarFormulario() {
  resetEditarCotizacionState();
  selectedExponentesCotizacion = [];
  contadorLineas = 0;
  recetaServicioRows = [];
  incluyeIgv = true;

  // Forzar recarga limpia de formularios cuando se vuelva a ingresar.
  tabsInicializados.servicio = false;
  tabsInicializados.producto = false;
  tabsInicializados.capacitacion = false;
  tabsInicializados.asesoria = false;

  ['servicio', 'producto', 'capacitacion', 'asesoria'].forEach(p => {
    const formContainer = document.getElementById(`cotiz-form-${p}`);
    if (formContainer) formContainer.innerHTML = '';
  });

  ['servicio', 'producto', 'capacitacion', 'asesoria'].forEach(p => {
    const panel = document.getElementById(`cotiz-panel-${p}`);
    if (panel) panel.style.display = 'none';
  });
  const historialPanel = document.getElementById('cotiz-panel-historial');
  if (historialPanel) historialPanel.style.display = 'block';
  document.querySelectorAll('.cotiz-tab').forEach(t => {
    const el = t as HTMLElement;
    const isActive = el.dataset.tab === 'historial';
    el.style.borderBottomColor = isActive ? '#2563eb' : 'transparent';
    el.style.color = isActive ? '#2563eb' : '#64748b';
    el.style.fontWeight = isActive ? '600' : '500';
  });
  tabActivo = 'historial';
}

async function cargarPlantasCliente(idCliente: number) {
  try {
    const resp = await clienteService.getPlantas(idCliente);
    plantasClienteData = resp.success ? (resp.data || []) : [];
  } catch { plantasClienteData = []; }
  // Actualizar selects de planta en filas existentes
  document.querySelectorAll('#detalle-cotizacion-body .planta-input').forEach(sel => {
    const select = sel as HTMLSelectElement;
    select.innerHTML = getPlantaOptions();
    select.value = '';
  });
  document.querySelectorAll('#detalle-cotizacion-body .area-input').forEach(sel => {
    (sel as HTMLSelectElement).innerHTML = '<option value="">— Sin área —</option>';
  });
  document.querySelectorAll('#detalle-cotizacion-body .area-input-multi').forEach(sel => {
    (sel as HTMLSelectElement).innerHTML = '';
  });
  document.querySelectorAll('#detalle-cotizacion-body tr').forEach((row) => {
    bindAreaMultiInteractions(row as HTMLElement);
  });
}

function getPlantaOptions(): string {
  return '<option value="">— Sin planta —</option>' + plantasClienteData
    .filter((p: any) => p.estado === 'Activo')
    .map((p: any) => `<option value="${p.id}">${p.nombre}</option>`).join('');
}

function getAreaOptions(idPlanta: number, includePlaceholder = true): string {
  const planta = plantasClienteData.find((p: any) => p.id === idPlanta);
  const areas = (planta?.areas_activas || planta?.areas || []).filter((a: any) => a.estado === 'Activo');
  const base = includePlaceholder ? '<option value="">— Sin área —</option>' : '';
  return base + areas
    .map((a: any) => `<option value="${a.id}">${a.nombre}</option>`).join('');
}

function getAreaIdsFromRow(row: Element, tipoCotizacion: string): number[] {
  if (tipoCotizacion === 'Servicio') {
    const multi = row.querySelector('.area-input-multi') as HTMLSelectElement | null;
    if (!multi) return [];
    return Array.from(multi.selectedOptions)
      .map((opt) => parseInt(opt.value || '0', 10))
      .filter((id) => id > 0);
  }

  const single = row.querySelector('.area-input') as HTMLSelectElement | null;
  const id = parseInt(single?.value || '0', 10);
  return id > 0 ? [id] : [];
}

function actualizarResumenAreasFila(fila: HTMLElement) {
  const multi = fila.querySelector('.area-input-multi') as HTMLSelectElement | null;
  const resumen = fila.querySelector('.area-multi-summary') as HTMLElement | null;
  const toggle = fila.querySelector('.area-picker-toggle') as HTMLButtonElement | null;
  if (!multi || !resumen) return;

  const seleccionadas = Array.from(multi.selectedOptions)
    .map(opt => opt.text.trim())
    .filter(Boolean);

  if (seleccionadas.length === 0) {
    resumen.innerHTML = 'Sin áreas seleccionadas';
    resumen.style.color = '#94a3b8';
    if (toggle) toggle.textContent = 'Seleccionar áreas';
    const panelEl = fila.closest('[id^="cotiz-panel-"]') as HTMLElement | null;
    if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
      actualizarSeccionLimpiezaCisternas(panelEl);
    }
    return;
  }

  resumen.style.color = '#334155';
  if (toggle) toggle.textContent = `${seleccionadas.length} área(s)`;

  const chips = seleccionadas.slice(0, 3).map((nombre) => {
    return `<span style="display:inline-block;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:2px 8px;font-size:11px;margin:2px 4px 2px 0;">${nombre}</span>`;
  }).join('');

  if (seleccionadas.length > 3) {
    resumen.innerHTML = `${chips}<span style="font-size:11px;color:#64748b;">+${seleccionadas.length - 3} más</span>`;
    const panelEl = fila.closest('[id^="cotiz-panel-"]') as HTMLElement | null;
    if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
      actualizarSeccionLimpiezaCisternas(panelEl);
    }
    return;
  }

  resumen.innerHTML = chips;
  const panelEl = fila.closest('[id^="cotiz-panel-"]') as HTMLElement | null;
  if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
    actualizarSeccionLimpiezaCisternas(panelEl);
  }
}

function renderAreaPickerOptions(fila: HTMLElement) {
  const multi = fila.querySelector('.area-input-multi') as HTMLSelectElement | null;
  const optionsWrap = fila.querySelector('.area-picker-options') as HTMLElement | null;
  if (!multi || !optionsWrap) return;

  if (multi.options.length === 0) {
    optionsWrap.innerHTML = '<div style="padding:6px 0;color:#94a3b8;font-size:12px;">Primero seleccione una planta</div>';
    return;
  }

  optionsWrap.innerHTML = Array.from(multi.options).map((opt, index) => {
    return `<label style="display:flex;align-items:center;gap:7px;padding:4px 0;font-size:13px;color:#334155;cursor:pointer;">
      <input type="checkbox" class="area-picker-check" data-index="${index}" ${opt.selected ? 'checked' : ''}>
      <span>${opt.text}</span>
    </label>`;
  }).join('');

  optionsWrap.querySelectorAll('.area-picker-check').forEach((el) => {
    el.addEventListener('change', (e) => {
      e.stopPropagation();
      const idx = Number((e.currentTarget as HTMLInputElement).dataset.index || '-1');
      if (idx < 0 || !multi.options[idx]) return;
      multi.options[idx].selected = (e.currentTarget as HTMLInputElement).checked;
      const t = (fila as any)._areaCloseTimer as number | undefined;
      if (t) {
        clearTimeout(t);
        (fila as any)._areaCloseTimer = undefined;
      }
      actualizarResumenAreasFila(fila);
    });
  });
}

function bindAreaMultiInteractions(fila: HTMLElement) {
  const multi = fila.querySelector('.area-input-multi') as HTMLSelectElement | null;
  if (!multi) return;

  if (!(multi as any)._areaMultiBound) {
    multi.addEventListener('change', () => actualizarResumenAreasFila(fila));
    (multi as any)._areaMultiBound = true;
  }

  const panel = fila.querySelector('.area-picker-panel') as HTMLElement | null;
  const toggle = fila.querySelector('.area-picker-toggle') as HTMLButtonElement | null;
  const wrapper = fila.querySelector('.area-multi-wrapper') as HTMLElement | null;

  const openPanel = () => {
    if (!panel) return;
    panel.style.display = 'block';
    renderAreaPickerOptions(fila);
  };

  const closePanel = () => {
    if (!panel) return;
    panel.style.display = 'none';
  };

  const clearCloseTimer = () => {
    const t = (fila as any)._areaCloseTimer as number | undefined;
    if (t) {
      clearTimeout(t);
      (fila as any)._areaCloseTimer = undefined;
    }
  };

  const scheduleClosePanel = () => {
    clearCloseTimer();
    (fila as any)._areaCloseTimer = setTimeout(() => {
      closePanel();
    }, 550);
  };

  if (toggle && panel && !(toggle as any)._areaMultiBound) {
    toggle.addEventListener('click', () => {
      const show = panel.style.display === 'none' || !panel.style.display;
      if (show) {
        openPanel();
      } else {
        closePanel();
      }
    });

    document.addEventListener('click', (e) => {
      if (!fila.contains(e.target as Node)) closePanel();
    });

    (toggle as any)._areaMultiBound = true;
  }

  if (wrapper && !(wrapper as any)._areaHoverBound) {
    wrapper.addEventListener('mouseenter', () => {
      clearCloseTimer();
      openPanel();
    });

    wrapper.addEventListener('mouseleave', () => {
      scheduleClosePanel();
    });

    (wrapper as any)._areaHoverBound = true;
  }

  const btnAll = fila.querySelector('.area-select-all') as HTMLButtonElement | null;
  if (btnAll && !(btnAll as any)._areaMultiBound) {
    btnAll.addEventListener('click', () => {
      Array.from(multi.options).forEach((opt) => { opt.selected = true; });
      renderAreaPickerOptions(fila);
      actualizarResumenAreasFila(fila);
    });
    (btnAll as any)._areaMultiBound = true;
  }

  const btnClear = fila.querySelector('.area-clear-all') as HTMLButtonElement | null;
  if (btnClear && !(btnClear as any)._areaMultiBound) {
    btnClear.addEventListener('click', () => {
      Array.from(multi.options).forEach((opt) => { opt.selected = false; });
      renderAreaPickerOptions(fila);
      actualizarResumenAreasFila(fila);
    });
    (btnClear as any)._areaMultiBound = true;
  }

  renderAreaPickerOptions(fila);
  actualizarResumenAreasFila(fila);
}

function getActivePanelElement(): HTMLElement | null {
  // Buscar el panel que está visiblemente mostrado (display !== 'none')
  const panels = document.querySelectorAll('[id^="cotiz-panel-"]');
  for (const panel of panels) {
    const el = panel as HTMLElement;
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.display !== 'none') {
      console.log('[UTIL] ✅ Panel activo encontrado:', el.id, 'display:', computedStyle.display);
      return el;
    }
  }
  
  // Fallback: usar tabActivo
  console.log('[UTIL] ⚠️ No se encontró panel visible, usando tabActivo:', tabActivo);
  return document.getElementById(`cotiz-panel-${tabActivo}`) as HTMLElement | null;
}

function getTabKeyByTipo(tipo: string): string | null {
  for (const [tabKey, tabTipo] of Object.entries(TAB_TO_TIPO)) {
    if (tabTipo === tipo) return tabKey;
  }
  return null;
}

function getDetalleItemValue(detalle: any): string {
  if (detalle?.id_servicio) return `s-${detalle.id_servicio}`;
  if (detalle?.id_producto) return `p-${detalle.id_producto}`;
  if (detalle?.id_catalogo_cap_aud) return `c-${detalle.id_catalogo_cap_aud}`;
  return '';
}

function activarTabCotizacion(tabKey: string) {
  document.querySelectorAll('.cotiz-tab').forEach(t => {
    const el = t as HTMLElement;
    const isActive = el.dataset.tab === tabKey;
    el.style.borderBottomColor = isActive ? '#2563eb' : 'transparent';
    el.style.color = isActive ? '#2563eb' : '#64748b';
    el.style.fontWeight = isActive ? '600' : '500';
  });

  ['historial', 'servicio', 'producto', 'capacitacion', 'asesoria'].forEach(p => {
    const panel = document.getElementById(`cotiz-panel-${p}`);
    if (panel) panel.style.display = (p === tabKey) ? 'block' : 'none';
  });

  tabActivo = tabKey;
}

async function poblarFormularioEdicion(panelEl: HTMLElement, cotizacion: any) {
  const tipo = cotizacion?.tipo_cotizacion || cotizacion?.tipo;
  const detalles = Array.isArray(cotizacion?.detalles) ? cotizacion.detalles : [];

  const numeroInput = panelEl.querySelector('#cot-numero') as HTMLInputElement | null;
  if (numeroInput) {
    numeroInput.value = cotizacion?.numero_cotizacion || cotizacion?.numero || '';
  }

  const fechaInput = panelEl.querySelector('#cot-fecha') as HTMLInputElement | null;
  if (fechaInput && cotizacion?.fecha_emision) {
    fechaInput.value = String(cotizacion.fecha_emision).split('T')[0];
  }

  const tipoInput = panelEl.querySelector('#cot-tipo') as HTMLInputElement | HTMLSelectElement | null;
  if (tipoInput && tipo) {
    tipoInput.value = tipo;
  }

  const clienteId = Number(cotizacion?.id_cliente || cotizacion?.cliente?.id || 0);
  const clienteNombre = cotizacion?.cliente?.nombre_empresa || cotizacion?.cliente_nombre || '';
  const clienteRuc = cotizacion?.cliente?.ruc || '';
  const clienteLabel = [clienteNombre, clienteRuc].filter(Boolean).join(' - ');

  const clienteHidden = panelEl.querySelector('#cot-cliente') as HTMLInputElement | null;
  const clienteSearch = panelEl.querySelector('#cot-cliente-search') as HTMLInputElement | null;
  if (clienteHidden) clienteHidden.value = clienteId ? String(clienteId) : '';
  if (clienteSearch) clienteSearch.value = clienteLabel;

  if (clienteId) {
    await cargarPlantasCliente(clienteId);
  }

  const multicimSelect = panelEl.querySelector('#cot-multicim') as HTMLSelectElement | null;
  if (multicimSelect && cotizacion?.id_multicim) {
    multicimSelect.value = String(cotizacion.id_multicim);
  }

  const incluye = cotizacion?.incluye_igv !== false;
  incluyeIgv = incluye;
  const igvSelect = panelEl.querySelector('#cot-igv') as HTMLSelectElement | null;
  if (igvSelect) {
    igvSelect.value = incluye ? '1' : '0';
  }

  const igvRow = panelEl.querySelector('#igv-row') as HTMLElement | null;
  if (igvRow) {
    igvRow.style.display = incluye ? 'flex' : 'none';
  }

  const observacionesInput = panelEl.querySelector('#cot-observaciones') as HTMLInputElement | null;
  if (observacionesInput) {
    observacionesInput.value = cotizacion?.observaciones || '';
  }

  if (tipo === 'Capacitacion' || tipo === 'Asesoria') {
    const expRaw = Array.isArray(cotizacion?.exponentes) ? cotizacion.exponentes : [];
    const expIdsRaw = Array.isArray(cotizacion?.exponentes_ids) ? cotizacion.exponentes_ids : [];
    selectedExponentesCotizacion = expRaw
      .map((e: any) => {
        const id = Number(e?.id || 0);
        const nombre = [e?.nombre, e?.apellidos].filter(Boolean).join(' ').trim();
        return id > 0 ? { id, nombre: nombre || `Exponente ${id}` } : null;
      })
      .filter(Boolean) as { id: number; nombre: string }[];

    if (selectedExponentesCotizacion.length === 0 && expIdsRaw.length > 0) {
      selectedExponentesCotizacion = expIdsRaw
        .map((id: any) => Number(id || 0))
        .filter((id: number) => id > 0)
        .map((id: number) => ({ id, nombre: `Exponente ${id}` }));
    }

    renderExponenteTagsCotizacion(panelEl);
    actualizarSelectorExponentesCotizacion(panelEl);
    renderExponenteTagsCotizacion(panelEl);

    if (tipo === 'Capacitacion') {
      const primerDetalleCap = detalles.find((d: any) => d?.id_catalogo_cap_aud || d?.horas_capacitacion || d?.num_participantes || d?.fecha_servicio) || detalles[0];
      const fechaGlobalInput = panelEl.querySelector('#cot-cap-fecha-servicio') as HTMLInputElement | null;
      const horasGlobalInput = panelEl.querySelector('#cot-cap-horas') as HTMLInputElement | null;
      const participantesGlobalInput = panelEl.querySelector('#cot-cap-participantes') as HTMLInputElement | null;

      if (fechaGlobalInput) {
        fechaGlobalInput.value = primerDetalleCap?.fecha_servicio ? String(primerDetalleCap.fecha_servicio).split('T')[0] : '';
      }
      if (horasGlobalInput) {
        horasGlobalInput.value = String(primerDetalleCap?.horas_capacitacion ?? 0);
      }
      if (participantesGlobalInput) {
        participantesGlobalInput.value = String(primerDetalleCap?.num_participantes ?? 1);
      }
    } else if (tipo === 'Asesoria') {
      const primerDetalleAsesor = detalles.find((d: any) => d?.id_catalogo_cap_aud || d?.meses_implementacion) || detalles[0];
      const mesesInput = panelEl.querySelector('#cot-cap-fecha-servicio') as HTMLInputElement | null;
      
      if (mesesInput) {
        mesesInput.value = String(primerDetalleAsesor?.meses_implementacion ?? 1);
      }
      
      // Regenerar tabla de frecuencia con el número correcto de meses
      generarTablaFrecuenciaVisita(panelEl);
      
      // Cargar frecuencia por visita con valores numéricos
      const frecuVis = primerDetalleAsesor?.frecuencia_visita;
      if (frecuVis && typeof frecuVis === 'object') {
        Object.keys(frecuVis).forEach((mesKey: string) => {
          const pInput = document.getElementById(`cot-asesor-freq-${mesKey}-p`) as HTMLInputElement;
          const vInput = document.getElementById(`cot-asesor-freq-${mesKey}-v`) as HTMLInputElement;
          const fInput = document.getElementById(`cot-asesor-freq-${mesKey}-f`) as HTMLSelectElement;
          if (pInput) pInput.value = String(frecuVis[mesKey]?.p ?? 0);
          if (vInput) vInput.value = String(frecuVis[mesKey]?.v ?? 0);
          if (fInput) fInput.value = String(frecuVis[mesKey]?.f ?? '');
        });
      }
    }
  }

  if (quillInstance) {
    quillInstance.root.innerHTML = cotizacion?.propuesta_tecnica || '';
  }

  // Cargar objetivos para Asesoría y Capacitación
  if (tipo === 'Asesoria' || tipo === 'Capacitacion') {
    const textareaObjtivos = panelEl.querySelector('#cot-objetivos-asesoria') as HTMLTextAreaElement | null;
    if (textareaObjtivos) {
      textareaObjtivos.value = cotizacion?.objetivos_asesoria || '';
    }
  }

  const tbody = panelEl.querySelector('#detalle-cotizacion-body') as HTMLElement | null;
  if (!tbody || !tipo) return;

  tbody.innerHTML = '';
  contadorLineas = 0;

  const opTecnicosDetalle = detalles.find((d: any) => d?.op_tecnicos)?.op_tecnicos || '';
  const supervisorDetalle = detalles.find((d: any) => d?.supervisor)?.supervisor || '';
  const detalleFosfina = detalles.find((d: any) => {
    const nombre = String(d?.servicio?.nombre || '').toUpperCase();
    return nombre.includes('FOSFINA');
  });
  const detalleLimpiezaEspecial = detalles.find((d: any) => {
    const nombre = String(d?.servicio?.nombre || '').toUpperCase();
    return esServicioLimpiezaConMedida(nombre);
  });
  const medidasTanqueDetalle = detalleLimpiezaEspecial ? getMedidasTanqueIniciales(detalleLimpiezaEspecial) : [];

  for (const detalle of detalles) {
    agregarLineaDetalle(tipo);
    const fila = tbody.lastElementChild as HTMLElement | null;
    if (!fila) continue;

    const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement | null;
    const itemValue = getDetalleItemValue(detalle);
    if (itemSelect && itemValue) {
      itemSelect.value = itemValue;
      itemSelect.dispatchEvent(new Event('change'));
    }

    const cantidadInput = fila.querySelector('.cantidad-input') as HTMLInputElement | null;
    if (cantidadInput) cantidadInput.value = String(tipo === 'Servicio' ? 1 : (detalle?.cantidad ?? 1));

    const precioInput = fila.querySelector('.precio-input') as HTMLInputElement | null;
    if (precioInput) precioInput.value = String(detalle?.precio_unitario ?? 0);

    const plantaSelect = fila.querySelector('.planta-input') as HTMLSelectElement | null;
    if (plantaSelect) {
      const plantaVal = detalle?.id_cliente_planta ? String(detalle.id_cliente_planta) : '';
      plantaSelect.value = plantaVal;
      plantaSelect.dispatchEvent(new Event('change'));
    }

    const areaSelect = fila.querySelector('.area-input') as HTMLSelectElement | null;
    const areaMultiSelect = fila.querySelector('.area-input-multi') as HTMLSelectElement | null;
    const areaIdsDetalle = Array.isArray(detalle?.id_cliente_planta_area)
      ? detalle.id_cliente_planta_area.map((id: any) => Number(id)).filter((id: number) => id > 0)
      : (detalle?.id_cliente_planta_area ? [Number(detalle.id_cliente_planta_area)] : []);

    if (areaSelect) {
      areaSelect.value = areaIdsDetalle.length > 0 ? String(areaIdsDetalle[0]) : '';
    }

    if (areaMultiSelect && areaIdsDetalle.length > 0) {
      Array.from(areaMultiSelect.options).forEach((opt) => {
        opt.selected = areaIdsDetalle.includes(Number(opt.value));
      });
      renderAreaPickerOptions(fila);
      actualizarResumenAreasFila(fila);
    }

    const frecuenciaSelect = fila.querySelector('.frecuencia-input') as HTMLSelectElement | null;
    if (frecuenciaSelect) {
      setFrecuenciaDiasDesdeTexto(fila, detalle?.frecuencia_sugerida || '');
    }

    const modalidadSelect = fila.querySelector('.modalidad-input') as HTMLSelectElement | null;
    if (modalidadSelect) {
      modalidadSelect.value = detalle?.modalidad_sugerida || '';
    }

    calcularSubtotalLinea(fila.id);
  }

  if (tipo === 'Capacitacion' || tipo === 'Asesoria') {
    aplicarDatosCapacitacionGlobalATodasLasLineas(panelEl);
  }

  if (tipo === 'Servicio') {
    const seccionLimpieza = panelEl.querySelector('#seccion-limpieza-cisternas') as HTMLElement | null;
    if (seccionLimpieza) {
      const opInput = seccionLimpieza.querySelector('#input-op-tecnicos') as HTMLInputElement | null;
      const supInput = seccionLimpieza.querySelector('#input-supervisor') as HTMLInputElement | null;
      const productoFosfinaInput = seccionLimpieza.querySelector('#input-producto-fosfina') as HTMLInputElement | null;
      const cantidadFosfinaInput = seccionLimpieza.querySelector('#input-cantidad-fosfina') as HTMLInputElement | null;
      const medidaFosfinaInput = seccionLimpieza.querySelector('#input-medida-tanque-fosfina') as HTMLInputElement | null;
      if (opInput) opInput.value = String(opTecnicosDetalle || 0);
      if (supInput) supInput.value = String(supervisorDetalle || 0);
      if (productoFosfinaInput) productoFosfinaInput.value = String(detalleFosfina?.fosfina_producto || '');
      if (cantidadFosfinaInput) cantidadFosfinaInput.value = String(detalleFosfina?.fosfina_cantidad || '');
      if (medidaFosfinaInput) medidaFosfinaInput.value = String(detalleFosfina?.medida_tanque || '');
      (seccionLimpieza as any)._medidasTanqueIniciales = medidasTanqueDetalle;
      actualizarSeccionLimpiezaCisternas(panelEl);
    }

    recetaServicioRows = Array.isArray(cotizacion?.receta_servicio)
      ? cotizacion.receta_servicio.map((row: any) => ({
          id_servicio: Number(row?.id_servicio || 0),
          id_equipo: row?.id_equipo ? Number(row.id_equipo) : null,
          equipo_descripcion: row?.equipo_descripcion || '',
          id_producto: Number(row?.id_producto || 0),
          cantidad: Number(row?.cantidad || 0),
          observacion: row?.observacion || '',
          id_cliente_planta: row?.id_cliente_planta ? Number(row.id_cliente_planta) : null,
          id_cliente_planta_area: row?.id_cliente_planta_area ? Number(row.id_cliente_planta_area) : null,
        }))
      : [];

    const beneficiosRaw = Array.isArray(cotizacion?.beneficios) ? cotizacion.beneficios : [];
    beneficiosServicioRows = beneficiosRaw.map((b: any) => ({
      id_catalogo_cap_aud: b?.id_catalogo_cap_aud ? Number(b.id_catalogo_cap_aud) : null,
      nombre_beneficio: b?.nombre_beneficio || b?.catalogo_cap_aud?.nombre || 'Beneficio',
      modalidad_sugerida: b?.modalidad_sugerida || null,
      horas_capacitacion: b?.horas_capacitacion !== null && b?.horas_capacitacion !== undefined ? Number(b.horas_capacitacion) : null,
      precio_referencial: Number(b?.precio_referencial || 0),
      observacion: b?.observacion || '',
    }));

    const chkBenef = panelEl.querySelector('#chk-beneficios-servicio') as HTMLInputElement | null;
    const btnGestBenef = panelEl.querySelector('#btn-gestionar-beneficios') as HTMLButtonElement | null;
    if (chkBenef) chkBenef.checked = beneficiosServicioRows.length > 0;
    if (btnGestBenef) btnGestBenef.style.display = (chkBenef?.checked ? 'inline-flex' : 'none');
    renderBeneficiosServicio(panelEl);

    renderRecetaServicio(panelEl);
    actualizarSeccionLimpiezaCisternas(panelEl);
  }

  calcularTotales();

  const submitBtn = panelEl.querySelector('#btn-guardar-cotiz') as HTMLButtonElement | null;
  if (submitBtn) {
    submitBtn.innerHTML = getGuardarButtonHtml(true);
  }
}

function agregarLineaDetalle(tipo?: string) {
  console.log('[LINE] Iniciando agregarLineaDetalle...');
  
  // Encontrar el panel activo (el que está visible)
  const panelActivoElement = getActivePanelElement();
    
  if (!panelActivoElement) {
    console.log('[LINE] ❌ No se encontró panel activo');
    return;
  }
  
  const tbody = panelActivoElement.querySelector('#detalle-cotizacion-body');

  console.log('[LINE] tbody encontrado:', !!tbody, 'dentro de panel:', panelActivoElement.id);
  console.log('[LINE] ⚠️ CRÍTICO - tipo:', tipo);

  if (!tipo) {
    console.log('[LINE] ❌ Tipo no seleccionado');
    mostrarToast('warning', 'Atención', 'Seleccione el tipo de cotización primero');
    return;
  }

  contadorLineas++;
  const lineaId = `linea-${contadorLineas}`;
  console.log('[LINE] ✅ Agregando línea:', lineaId);

  const servicios = (window as any).__serviciosData || [];
  const productos = (window as any).__productosData || [];
  const catalogoCapAud = (window as any).__catalogoCapAudData || [];

  console.log('[LINE] Datos globales - Servicios:', servicios.length, 'Productos:', productos.length, 'Catálogo:', catalogoCapAud.length);

  const tipoAdapter = getCotizacionTipoAdapter(tipo);
  if (!tipoAdapter) {
    console.log('[LINE] ❌ Adapter no encontrado para tipo:', tipo);
    mostrarToast('warning', 'Atención', 'Tipo de cotización no soportado');
    return;
  }

  const opcionesItem = tipoAdapter.buildItemOptions({
    servicios,
    productos,
    catalogoCapAud,
    tipoCapAudFiltro: tipo === 'Capacitacion' ? 'Capacitación' : tipo === 'Asesoria' ? 'Asesoría' : undefined,
  });

  const inputStyle = 'width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;';
  const selectStyle = inputStyle;
  const {
    disabledCantidad,
    disabledCantidadStyle,
    disabledFrecuencia,
    disabledFrecuenciaStyle,
    disabledModalidad,
    disabledModalidadStyle,
  } = tipoAdapter.getDisabledFieldsState();

  const nuevaLinea = `
    <tr id="${lineaId}">
      <td>
        <select class="item-select" style="${selectStyle}" required>
          ${opcionesItem}
        </select>
      </td>
      <td>
        <select class="planta-input" style="${selectStyle}">
          ${getPlantaOptions()}
        </select>
      </td>
      <td>
        ${tipo === 'Servicio'
          ? `<div class="area-multi-wrapper" style="display:flex;flex-direction:column;gap:6px;">
               <select class="area-input-multi" multiple style="display:none;">
                 ${''}
               </select>
               <button type="button" class="area-picker-toggle" style="${selectStyle}text-align:left;display:flex;justify-content:space-between;align-items:center;background:#fff;">
                 Seleccionar áreas
                 <span style="color:#64748b;">▾</span>
               </button>
               <div class="area-picker-panel" style="display:none;position:static;background:#fff;border:1px solid #dbe3ef;border-radius:10px;padding:8px;box-shadow:0 4px 10px rgba(0,0,0,0.06);">
                 <div class="area-picker-options" style="max-height:160px;overflow:auto;padding-right:4px;"></div>
                 <div style="display:flex;gap:6px;margin-top:8px;">
                 <button type="button" class="area-select-all" style="padding:2px 8px;border:1px solid #cbd5e1;background:#fff;border-radius:999px;font-size:11px;color:#475569;cursor:pointer;">Todas</button>
                 <button type="button" class="area-clear-all" style="padding:2px 8px;border:1px solid #cbd5e1;background:#fff;border-radius:999px;font-size:11px;color:#475569;cursor:pointer;">Limpiar</button>
               </div>
               </div>
               <small class="area-multi-summary" style="display:block;font-size:11px;">Sin áreas seleccionadas</small>
             </div>`
          : `<select class="area-input" style="${selectStyle}">
               <option value="">— Sin área —</option>
             </select>`}
      </td>
      ${tipo === 'Servicio' || tipo === 'Asesoria' || tipo === 'Capacitacion'
        ? `<td style="display:none;"><input type="hidden" class="cantidad-input" value="1"></td>`
        : `<td><input type="number" class="cantidad-input" value="1" min="1" style="${inputStyle}${disabledCantidadStyle}" ${disabledCantidad}></td>`}
      <td>
        <input type="number" class="precio-input" value="0.00" min="0" step="0.01" style="${inputStyle}">
      </td>
      ${tipo === 'Asesoria' || tipo === 'Producto'
        ? `<td style="display:none;"><input type="hidden" class="frecuencia-input" value=""></td>`
        : `<td>
        <select class="frecuencia-input" style="${selectStyle}${disabledFrecuenciaStyle}" ${disabledFrecuencia}>
          <option value="">—</option>
          <option value="Única">Única</option>
          <option value="Días de la semana">Días de la semana</option>
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
          <option value="A solicitud">A solicitud</option>
          <option value="Trimestral">Trimestral</option>
          <option value="Semestral">Semestral</option>
          <option value="Anual">Anual</option>
        </select>
        ${construirFrecuenciaDiasHtml(lineaId)}
      </td>`}
      ${tipo === 'Servicio' || tipo === 'Producto'
        ? `<td style="display:none;"><input type="hidden" class="modalidad-input" value=""></td>`
        : `<td>
        <select class="modalidad-input" style="${selectStyle}${disabledModalidadStyle}" ${disabledModalidad}>
          <option value="">—</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
          <option value="Hibrido">Híbrido</option>
          <option value="Asíncrona">Asíncrona</option>
        </select>
      </td>`}
      <!-- Eliminado: técnicos/supervisor de capacitación -->
      <td>
        <strong class="subtotal-linea" style="font-size:13px;">S/ 0.00</strong>
      </td>
      <td>
        <button type="button" class="btn-eliminar-linea" data-linea="${lineaId}" title="Eliminar" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    </tr>
  `;

  if (tbody) {
    tbody.insertAdjacentHTML('beforeend', nuevaLinea);

    const fila = document.getElementById(lineaId)!;

    if (tipo === 'Capacitacion' || tipo === 'Asesoria') {
      const panelCap = getActivePanelElement();
      if (panelCap) {
        aplicarDatosCapacitacionGlobalALinea(fila, panelCap);
      }
    }

    // Auto-llenar precio al seleccionar item
    const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement;
    itemSelect?.addEventListener('change', () => {
      const opt = itemSelect.options[itemSelect.selectedIndex];
      const precio = opt?.dataset?.precio;
      if (precio) {
        const precioInput = fila.querySelector('.precio-input') as HTMLInputElement;
        if (precioInput) precioInput.value = precio;
      }
      calcularSubtotalLinea(lineaId);
      // Lógica para mostrar/ocultar sección limpieza cisternas
      const panelEl = getActivePanelElement();
      if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
        actualizarSeccionLimpiezaCisternas(panelEl);
      }
    });

    // Cascading: planta → áreas dentro de la fila
    const plantaSelect = fila.querySelector('.planta-input') as HTMLSelectElement;
    plantaSelect?.addEventListener('change', () => {
      const areaSelect = fila.querySelector('.area-input') as HTMLSelectElement | null;
      const areaMultiSelect = fila.querySelector('.area-input-multi') as HTMLSelectElement | null;
      const pid = parseInt(plantaSelect.value || '0');
      if (areaSelect) areaSelect.innerHTML = pid ? getAreaOptions(pid, true) : '<option value="">— Sin área —</option>';
      if (areaMultiSelect) {
        areaMultiSelect.innerHTML = pid ? getAreaOptions(pid, false) : '';
        bindAreaMultiInteractions(fila);
      }
    });

    bindAreaMultiInteractions(fila);

    const frecuenciaSelect = fila.querySelector('.frecuencia-input') as HTMLSelectElement | null;
    frecuenciaSelect?.addEventListener('change', () => actualizarUIFrecuenciaDias(fila));

    fila.querySelectorAll('.frecuencia-dia-checkbox').forEach((el) => {
      el.addEventListener('change', () => {
        if ((fila.querySelector('.frecuencia-input') as HTMLSelectElement | null)?.value !== 'Días de la semana') {
          (el as HTMLInputElement).checked = false;
        }
      });
    });

    fila.querySelector('.cantidad-input')?.addEventListener('input', () => calcularSubtotalLinea(lineaId));
    fila.querySelector('.precio-input')?.addEventListener('input', () => calcularSubtotalLinea(lineaId));
    fila.querySelector('.btn-eliminar-linea')?.addEventListener('click', () => {
      fila.remove();
      calcularTotales();
      // Lógica para mostrar/ocultar sección limpieza cisternas
      const panelEl = getActivePanelElement();
      if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
        actualizarSeccionLimpiezaCisternas(panelEl);
      }
    });
    // Lógica para mostrar/ocultar sección limpieza cisternas al agregar línea
    const panelEl = getActivePanelElement();
    if (panelEl && panelEl.querySelector('#seccion-limpieza-cisternas')) {
      actualizarSeccionLimpiezaCisternas(panelEl);
    }
  }
}

// Función para mostrar/ocultar la sección de limpieza de cisternas
function actualizarSeccionLimpiezaCisternas(panelEl: HTMLElement) {
  const seccion = panelEl.querySelector('#seccion-limpieza-cisternas') as HTMLElement;
  if (!seccion) return;
  const bloqueLimpieza = panelEl.querySelector('#bloque-limpieza-cisternas') as HTMLElement | null;
  const bloqueFosfina = panelEl.querySelector('#bloque-fosfina') as HTMLElement | null;
  const contenedorMedidas = panelEl.querySelector('#contenedor-medidas-tanque') as HTMLElement | null;
  const tbody = panelEl.querySelector('#detalle-cotizacion-body') as HTMLElement;
  if (!tbody) return;
  const filas = tbody.querySelectorAll('tr');
  let tieneLimpiezaCisternas = false;
  let tieneFosfina = false;
  filas.forEach(fila => {
    const itemSelect = fila.querySelector('.item-select') as HTMLSelectElement;
    if (itemSelect) {
      const selectedOption = itemSelect.options[itemSelect.selectedIndex];
      const servicioNombre = selectedOption?.textContent?.trim() || '';
      if (esServicioLimpiezaConMedida(servicioNombre)) {
        tieneLimpiezaCisternas = true;
      }
      if (esServicioFosfina(servicioNombre)) {
        tieneFosfina = true;
      }
    }
  });
  seccion.style.display = (tieneLimpiezaCisternas || tieneFosfina) ? 'block' : 'none';
  if (bloqueLimpieza) bloqueLimpieza.style.display = tieneLimpiezaCisternas ? 'flex' : 'none';
  if (bloqueFosfina) bloqueFosfina.style.display = tieneFosfina ? 'block' : 'none';
  if (contenedorMedidas) {
    contenedorMedidas.style.display = tieneLimpiezaCisternas ? 'block' : 'none';
    if (tieneLimpiezaCisternas) {
      renderMedidasTanqueInputs(panelEl);
    } else {
      contenedorMedidas.innerHTML = '';
    }
  }
}

function calcularSubtotalLinea(lineaId: string) {
  const linea = document.getElementById(lineaId);
  if (!linea) return;
  const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
  const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
  const subtotal = cantidad * precio;
  const el = linea.querySelector('.subtotal-linea');
  if (el) el.textContent = `S/ ${subtotal.toFixed(2)}`;
  calcularTotales();
}

function calcularTotales() {
  // Encontrar el panel activo
  const panelActivoElement = getActivePanelElement();
  if (!panelActivoElement) return;
  
  const lineas = panelActivoElement.querySelectorAll('#detalle-cotizacion-body tr');
  let subtotalGeneral = 0;

  lineas.forEach(linea => {
    const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    subtotalGeneral += cantidad * precio;
  });

  const igv = incluyeIgv ? subtotalGeneral * 0.18 : 0;
  const total = subtotalGeneral + igv;

  const subtotalEl = panelActivoElement.querySelector('#subtotal-value');
  const igvEl = panelActivoElement.querySelector('#igv-value');
  const totalEl = panelActivoElement.querySelector('#total-value');

  if (subtotalEl) subtotalEl.textContent = `S/ ${subtotalGeneral.toFixed(2)}`;
  if (igvEl) igvEl.textContent = `S/ ${igv.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

function getProductosDispositivosReceta(): any[] {
  return (window as any).__productosData || [];
}

function buildProductoOptionsReceta(selectedId: number): string {
  const productos = getProductosDispositivosReceta();
  let opts = '<option value="">Seleccione producto...</option>';
  productos.forEach((p: any) => {
    const sel = p.id === selectedId ? 'selected' : '';
    opts += `<option value="${p.id}" ${sel}>${p.descripcion}${p.unidad ? ` (${p.unidad})` : ''}</option>`;
  });
  return opts;
}

function getServiceLineGroups(panelEl: HTMLElement): Array<{ idServicio: number; idPlanta: number | null; idArea: number | null; servicioNombre: string; plantaNombre: string; areaNombre: string }> {
  const groups: Array<{ idServicio: number; idPlanta: number | null; idArea: number | null; servicioNombre: string; plantaNombre: string; areaNombre: string }> = [];
  const seen = new Set<string>();
  const rows = panelEl.querySelectorAll('#detalle-cotizacion-body tr');
  rows.forEach((row) => {
    const itemSel = row.querySelector('.item-select') as HTMLSelectElement;
    const value = itemSel?.value || '';
    if (!value.startsWith('s-')) return;
    const idServicio = parseInt(value.replace('s-', ''), 10) || 0;
    if (!idServicio) return;

    const plantaSel = row.querySelector('.planta-input') as HTMLSelectElement;
    const areaSel = row.querySelector('.area-input') as HTMLSelectElement | null;
    const areaMultiSel = row.querySelector('.area-input-multi') as HTMLSelectElement | null;
    const idPlanta = parseInt(plantaSel?.value || '0', 10) || null;
    const servicioNombre = itemSel.options[itemSel.selectedIndex]?.text || `Servicio #${idServicio}`;
    const plantaNombre = (plantaSel && plantaSel.selectedIndex > 0) ? (plantaSel.options[plantaSel.selectedIndex]?.text || '') : '';
    const selectedAreas = areaMultiSel
      ? Array.from(areaMultiSel.selectedOptions).map(opt => ({ idArea: parseInt(opt.value || '0', 10) || null, areaNombre: opt.text || '' }))
      : [{ idArea: parseInt(areaSel?.value || '0', 10) || null, areaNombre: (areaSel && areaSel.selectedIndex > 0) ? (areaSel.options[areaSel.selectedIndex]?.text || '') : '' }];

    const areasParaProcesar = selectedAreas.length > 0 ? selectedAreas : [{ idArea: null, areaNombre: '' }];
    areasParaProcesar.forEach(({ idArea, areaNombre }) => {
      const key = `${idServicio}-${idPlanta || 0}-${idArea || 0}`;
      if (seen.has(key)) return;
      seen.add(key);
      groups.push({ idServicio, idPlanta, idArea, servicioNombre, plantaNombre, areaNombre });
    });
  });
  return groups;
}

function getRecetaGroupKey(row: RecetaServicioRow): string {
  return `${row.id_servicio}-${row.id_cliente_planta || 0}-${row.id_cliente_planta_area || 0}-${row.id_equipo || 0}`;
}

function parseRecetaGroupKey(groupKey: string): { idServicio: number; idPlanta: number | null; idArea: number | null; idEquipo: number | null } {
  const [idServicioRaw, idPlantaRaw, idAreaRaw, idEquipoRaw] = groupKey.split('-').map((v) => Number(v || 0));
  return {
    idServicio: idServicioRaw || 0,
    idPlanta: idPlantaRaw || null,
    idArea: idAreaRaw || null,
    idEquipo: idEquipoRaw || null,
  };
}

async function cargarEquiposDisponiblesReceta() {
  try {
    const res = await equipoService.getAll({ estado: 'Activo' } as any);
    const raw = res.data || res;
    equiposDisponiblesReceta = Array.isArray(raw) ? raw : (raw as any).data || [];
  } catch (e) {
    console.error('Error cargando equipos para receta de servicio:', e);
    equiposDisponiblesReceta = [];
  }
}

function getEquipoNameReceta(idEquipo?: number | null): string {
  if (!idEquipo) return '';
  const equipo = equiposDisponiblesReceta.find((eq: any) => eq.id === idEquipo);
  return equipo?.descripcion || `Equipo #${idEquipo}`;
}

async function abrirModalAgregarEquipoReceta(panelEl: HTMLElement) {
  const modal = panelEl.querySelector('#modal-cot-receta-equipo') as HTMLElement | null;
  const selGrupo = panelEl.querySelector('#cot-receta-equipo-grupo') as HTMLSelectElement | null;
  const selEquipo = panelEl.querySelector('#cot-receta-equipo-id') as HTMLSelectElement | null;
  if (!modal || !selGrupo || !selEquipo) return;

  const groups = getServiceLineGroups(panelEl);
  if (groups.length === 0) {
    mostrarToast('warning', 'Sin servicios', 'Primero agregue una línea de servicio con planta/área');
    return;
  }

  await cargarEquiposDisponiblesReceta();

  selGrupo.innerHTML = groups.map((g) => {
    const key = `${g.idServicio}-${g.idPlanta || 0}-${g.idArea || 0}`;
    const partes = [g.servicioNombre];
    if (g.plantaNombre) partes.push(g.plantaNombre);
    if (g.areaNombre) partes.push(g.areaNombre);
    return `<option value="${key}">${partes.join(' -> ')}</option>`;
  }).join('');

  selEquipo.innerHTML = '<option value="">Seleccione equipo...</option>' + equiposDisponiblesReceta.map((eq: any) => {
    return `<option value="${eq.id}">${eq.descripcion}</option>`;
  }).join('');

  modal.style.display = 'flex';
}

function cerrarModalAgregarEquipoReceta(panelEl: HTMLElement) {
  const modal = panelEl.querySelector('#modal-cot-receta-equipo') as HTMLElement | null;
  if (modal) modal.style.display = 'none';
}

function abrirModalAgregarProductoReceta(panelEl: HTMLElement) {
  const modal = panelEl.querySelector('#modal-cot-receta-producto') as HTMLElement | null;
  const selGrupo = panelEl.querySelector('#cot-receta-producto-grupo') as HTMLSelectElement | null;
  const selProducto = panelEl.querySelector('#cot-receta-producto-id') as HTMLSelectElement | null;
  if (!modal || !selGrupo || !selProducto) return;

  const groups = getServiceLineGroups(panelEl);
  if (groups.length === 0) {
    mostrarToast('warning', 'Sin servicios', 'Primero agregue una línea de servicio con planta/área');
    return;
  }

  const productos = getProductosDispositivosReceta();
  if (productos.length === 0) {
    mostrarToast('warning', 'Sin productos', 'No hay productos activos disponibles');
    return;
  }

  selGrupo.innerHTML = groups.map((g) => {
    const key = `${g.idServicio}-${g.idPlanta || 0}-${g.idArea || 0}`;
    const partes = [g.servicioNombre];
    if (g.plantaNombre) partes.push(g.plantaNombre);
    if (g.areaNombre) partes.push(g.areaNombre);
    return `<option value="${key}">${partes.join(' -> ')}</option>`;
  }).join('');

  selProducto.innerHTML = '<option value="">Seleccione producto...</option>' + productos.map((p: any) => {
    return `<option value="${p.id}">${p.descripcion}${p.unidad ? ` (${p.unidad})` : ''}</option>`;
  }).join('');

  modal.style.display = 'flex';
}

function cerrarModalAgregarProductoReceta(panelEl: HTMLElement) {
  const modal = panelEl.querySelector('#modal-cot-receta-producto') as HTMLElement | null;
  if (modal) modal.style.display = 'none';
}

function confirmarAgregarProductoReceta(panelEl: HTMLElement) {
  const selGrupo = panelEl.querySelector('#cot-receta-producto-grupo') as HTMLSelectElement | null;
  const selProducto = panelEl.querySelector('#cot-receta-producto-id') as HTMLSelectElement | null;
  if (!selGrupo || !selProducto) return;

  const [idServicioRaw, idPlantaRaw, idAreaRaw] = selGrupo.value.split('-').map((v) => Number(v || 0));
  const idServicio = idServicioRaw || 0;
  const idPlanta = idPlantaRaw || null;
  const idArea = idAreaRaw || null;
  const idProducto = Number(selProducto.value || 0);

  if (!idServicio) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un bloque de servicio');
    return;
  }
  if (!idProducto) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un producto');
    return;
  }

  recetaServicioRows.push({
    id_servicio: idServicio,
    id_equipo: null,
    equipo_descripcion: '',
    id_producto: idProducto,
    cantidad: 1,
    observacion: '',
    id_cliente_planta: idPlanta,
    id_cliente_planta_area: idArea,
  });

  renderRecetaServicio(panelEl);
  cerrarModalAgregarProductoReceta(panelEl);
  mostrarToast('success', 'Producto agregado', 'Se agregó el producto al bloque seleccionado');
}

async function confirmarAgregarEquipoReceta(panelEl: HTMLElement) {
  const selGrupo = panelEl.querySelector('#cot-receta-equipo-grupo') as HTMLSelectElement | null;
  const selEquipo = panelEl.querySelector('#cot-receta-equipo-id') as HTMLSelectElement | null;
  if (!selGrupo || !selEquipo) return;

  const [idServicioRaw, idPlantaRaw, idAreaRaw] = selGrupo.value.split('-').map((v) => Number(v || 0));
  const idServicio = idServicioRaw || 0;
  const idPlanta = idPlantaRaw || null;
  const idArea = idAreaRaw || null;
  const idEquipo = Number(selEquipo.value || 0);

  if (!idServicio) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un bloque de servicio');
    return;
  }
  if (!idEquipo) {
    mostrarToast('error', 'Dato requerido', 'Seleccione un equipo');
    return;
  }

  const equipoDesc = getEquipoNameReceta(idEquipo);
  const existeGrupo = recetaServicioRows.some((r) =>
    r.id_servicio === idServicio
    && (r.id_cliente_planta || 0) === (idPlanta || 0)
    && (r.id_cliente_planta_area || 0) === (idArea || 0)
    && (r.id_equipo || 0) === idEquipo,
  );

  if (existeGrupo) {
    mostrarToast('warning', 'Equipo duplicado', 'Ese equipo ya está agregado en el bloque seleccionado');
    return;
  }

  recetaServicioRows.push({
    id_servicio: idServicio,
    id_equipo: idEquipo,
    equipo_descripcion: equipoDesc,
    id_producto: 0,
    cantidad: 1,
    observacion: '',
    id_cliente_planta: idPlanta,
    id_cliente_planta_area: idArea,
  });

  renderRecetaServicio(panelEl);
  cerrarModalAgregarEquipoReceta(panelEl);
  mostrarToast('success', 'Equipo agregado', 'Grupo creado. Ahora agregue los productos manualmente');
}

function getRecetaGroupLabel(row: RecetaServicioRow, panelEl: HTMLElement): string {
  const groups = getServiceLineGroups(panelEl);
  const g = groups.find((x) => x.idServicio === row.id_servicio && (x.idPlanta || 0) === (row.id_cliente_planta || 0) && (x.idArea || 0) === (row.id_cliente_planta_area || 0));
  const partes = [g?.servicioNombre || `Servicio #${row.id_servicio}`];
  if (g?.plantaNombre) partes.push(g.plantaNombre);
  if (g?.areaNombre) partes.push(g.areaNombre);
  if (row.equipo_descripcion) partes.push(row.equipo_descripcion);
  return partes.join(' -> ');
}

function renderRecetaServicio(panelEl: HTMLElement) {
  const tbody = panelEl.querySelector('#receta-servicio-body') as HTMLElement;
  const empty = panelEl.querySelector('#receta-servicio-empty') as HTMLElement;
  if (!tbody || !empty) return;

  if (recetaServicioRows.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const groupsOrder: string[] = [];
  recetaServicioRows.forEach((r) => {
    const key = getRecetaGroupKey(r);
    if (!groupsOrder.includes(key)) groupsOrder.push(key);
  });

  let html = '';
  groupsOrder.forEach((groupKey) => {
    const rows = recetaServicioRows.filter((r) => getRecetaGroupKey(r) === groupKey);
    const first = rows[0];
    html += `<tr>
      <td colspan="3" style="background:#eef2ff;color:#4338ca;font-weight:600;font-size:12px;padding:6px 10px;">${getRecetaGroupLabel(first, panelEl)}</td>
      <td style="background:#eef2ff;text-align:right;padding:6px 10px;">
        <button type="button" class="btn-secondary btn-agregar-producto-receta-grupo" data-group-key="${groupKey}" style="font-size:11px;padding:2px 8px;line-height:1.3;">+ Añadir producto</button>
      </td>
      <td style="background:#eef2ff;text-align:right;padding:6px 10px;">
        <button type="button" class="btn-eliminar-receta-grupo" data-group-key="${groupKey}" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;" title="Eliminar equipo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    </tr>`;
    rows.forEach((r) => {
      const idx = recetaServicioRows.indexOf(r);
      html += `<tr>
        <td style="font-size:12px;color:#64748b;">${r.equipo_descripcion || 'Sin equipo'}</td>
        <td><select class="receta-prod-select" data-idx="${idx}" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;">${buildProductoOptionsReceta(r.id_producto)}</select></td>
        <td style="text-align:center;"><input type="number" min="0.01" step="0.01" class="receta-cantidad-input" data-idx="${idx}" value="${r.cantidad}" style="width:90px;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;text-align:center;"></td>
        <td><input type="text" class="receta-obs-input" data-idx="${idx}" value="${r.observacion || ''}" maxlength="255" placeholder="Opcional" style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;"></td>
        <td style="text-align:center;"><button type="button" class="btn-eliminar-receta" data-idx="${idx}" style="background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;" title="Eliminar producto"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;

  panelEl.querySelectorAll('.receta-prod-select').forEach((el) => {
    el.addEventListener('change', (e) => {
      const idx = Number((e.target as HTMLSelectElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows[idx].id_producto = Number((e.target as HTMLSelectElement).value || 0);
    });
  });

  panelEl.querySelectorAll('.receta-cantidad-input').forEach((el) => {
    el.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows[idx].cantidad = parseFloat((e.target as HTMLInputElement).value) || 0;
    });
  });

  panelEl.querySelectorAll('.receta-obs-input').forEach((el) => {
    el.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows[idx].observacion = (e.target as HTMLInputElement).value || '';
    });
  });

  panelEl.querySelectorAll('.btn-eliminar-receta').forEach((el) => {
    el.addEventListener('click', (e) => {
      const idx = Number((e.currentTarget as HTMLButtonElement).dataset.idx || '-1');
      if (idx < 0 || !recetaServicioRows[idx]) return;
      recetaServicioRows.splice(idx, 1);
      renderRecetaServicio(panelEl);
    });
  });

  panelEl.querySelectorAll('.btn-eliminar-receta-grupo').forEach((el) => {
    el.addEventListener('click', (e) => {
      const groupKey = (e.currentTarget as HTMLButtonElement).dataset.groupKey || '';
      if (!groupKey) return;
      recetaServicioRows = recetaServicioRows.filter((r) => getRecetaGroupKey(r) !== groupKey);
      renderRecetaServicio(panelEl);
      mostrarToast('success', 'Equipo eliminado', 'Se eliminó el equipo y sus productos');
    });
  });

  panelEl.querySelectorAll('.btn-agregar-producto-receta-grupo').forEach((el) => {
    el.addEventListener('click', (e) => {
      const groupKey = (e.currentTarget as HTMLButtonElement).dataset.groupKey || '';
      if (!groupKey) return;
      const parsed = parseRecetaGroupKey(groupKey);
      recetaServicioRows.push({
        id_servicio: parsed.idServicio,
        id_equipo: parsed.idEquipo,
        equipo_descripcion: getEquipoNameReceta(parsed.idEquipo),
        id_producto: 0,
        cantidad: 1,
        observacion: '',
        id_cliente_planta: parsed.idPlanta,
        id_cliente_planta_area: parsed.idArea,
      });
      renderRecetaServicio(panelEl);
    });
  });
}

async function guardarCotizacion(tipoFijo?: string) {
  // Encontrar el panel activo
  const panelActivoElement = getActivePanelElement();
  
  if (!panelActivoElement) {
    console.log('[SAVE] ❌ No se encontró panel activo');
    mostrarToast('error', 'Error', 'No se encontró el formulario activo');
    return;
  }
  
  const multicimId = parseInt((panelActivoElement.querySelector('#cot-multicim') as HTMLSelectElement)?.value || '0');
  const clienteId = parseInt((panelActivoElement.querySelector('#cot-cliente') as HTMLInputElement)?.value || '0');
  const fechaEmision = (panelActivoElement.querySelector('#cot-fecha') as HTMLInputElement)?.value || '';
  const tipoCotizacion = (panelActivoElement.querySelector('#cot-tipo') as HTMLSelectElement)?.value;
  const observaciones = (panelActivoElement.querySelector('#cot-observaciones') as HTMLInputElement)?.value?.trim();
  
  // Capturar propuesta técnica desde Quill
  let propuestaHtml = '';
  if (quillInstance) {
    const editorContent = quillInstance.root.innerHTML;
    propuestaHtml = editorContent.trim();
    console.log('[SAVE] Propuesta técnica capturada:', propuestaHtml.substring(0, 100));
  }
  
  const objetivosAsesoria = (tipoCotizacion === 'Asesoria' || tipoCotizacion === 'Capacitacion')
    ? (panelActivoElement.querySelector('#cot-objetivos-asesoria') as HTMLTextAreaElement)?.value?.trim() || ''
    : null;

  console.log('[SAVE] Panel encontrado:', panelActivoElement.id, 'multicimId:', multicimId, 'clienteId:', clienteId, 'tipo:', tipoCotizacion);

  if (!multicimId || !clienteId || !tipoCotizacion) {
    mostrarToast('warning', 'Campos obligatorios', 'Seleccione la empresa emisora, el cliente y el tipo de cotización');
    return;
  }

  if (!clienteId || !tipoCotizacion) {
    mostrarToast('warning', 'Campos obligatorios', 'Seleccione cliente y tipo de cotización');
    return;
  }

  if (tipoCotizacion === 'Servicio') {
    const chkBenef = panelActivoElement.querySelector('#chk-beneficios-servicio') as HTMLInputElement | null;
    if (chkBenef?.checked && beneficiosServicioRows.length === 0) {
      mostrarToast('warning', 'Beneficios incompletos', 'Activó beneficios, pero aún no agregó ninguna capacitación gratuita.');
      return;
    }
  }

  if ((tipoCotizacion === 'Capacitacion' || tipoCotizacion === 'Asesoria') && selectedExponentesCotizacion.length === 0) {
    mostrarToast('warning', 'Campo obligatorio', 'Seleccione al menos un exponente para la cotización de capacitación');
    return;
  }

  const lineas = panelActivoElement.querySelectorAll('#detalle-cotizacion-body tr');
  if (lineas.length === 0) {
    mostrarToast('warning', 'Sin detalles', 'Agregue al menos una línea de detalle');
    return;
  }

  const tieneFosfinaEnDetalle = Array.from(lineas).some((linea) => {
    const itemSelect = linea.querySelector('.item-select') as HTMLSelectElement | null;
    const servicioNombre = itemSelect?.options[itemSelect.selectedIndex]?.textContent?.trim() || '';
    return esServicioFosfina(servicioNombre);
  });

  const tipoAdapter = getCotizacionTipoAdapter(tipoCotizacion);
  if (!tipoAdapter) {
    mostrarToast('warning', 'Tipo no válido', 'No se reconoce el tipo de cotización seleccionado');
    return;
  }

  const seccionLimpieza = panelActivoElement.querySelector('#seccion-limpieza-cisternas') as HTMLElement | null;
  const seccionLimpiezaVisible = !!seccionLimpieza && seccionLimpieza.style.display !== 'none';
  const opTecnicosGlobal = seccionLimpiezaVisible
    ? ((seccionLimpieza.querySelector('#input-op-tecnicos') as HTMLInputElement | null)?.value?.trim() || null)
    : null;
  const supervisorGlobal = seccionLimpiezaVisible
    ? ((seccionLimpieza.querySelector('#input-supervisor') as HTMLInputElement | null)?.value?.trim() || null)
    : null;
  const medidasTanqueGlobal = seccionLimpiezaVisible
    ? leerMedidasTanqueDesdeSeccion(panelActivoElement)
    : [];
  const medidaTanqueGlobal = medidasTanqueGlobal.length > 0 ? medidasTanqueGlobal[0] : null;
  const productoFosfinaGlobal = seccionLimpiezaVisible
    ? ((seccionLimpieza.querySelector('#input-producto-fosfina') as HTMLInputElement | null)?.value?.trim() || null)
    : null;
  const cantidadFosfinaGlobal = seccionLimpiezaVisible
    ? ((seccionLimpieza.querySelector('#input-cantidad-fosfina') as HTMLInputElement | null)?.value?.trim() || null)
    : null;
  const medidaTanqueFosfinaGlobal = seccionLimpiezaVisible
    ? ((seccionLimpieza.querySelector('#input-medida-tanque-fosfina') as HTMLInputElement | null)?.value?.trim() || null)
    : null;

  if (tieneFosfinaEnDetalle && !productoFosfinaGlobal) {
    mostrarToast('warning', 'Campos obligatorios', 'Para FOSFINA debe ingresar el producto manual.');
    return;
  }

  if (tieneFosfinaEnDetalle && !cantidadFosfinaGlobal) {
    mostrarToast('warning', 'Campos obligatorios', 'Para FOSFINA debe ingresar cantidad.');
    return;
  }

  const esCapacitacion = tipoCotizacion === 'Capacitacion';
  const esAsesoria = tipoCotizacion === 'Asesoria';

  const horasCapacitacionGlobal = esCapacitacion
    ? parseFloat((panelActivoElement.querySelector('#cot-cap-horas') as HTMLInputElement | null)?.value || '0')
    : null;
  const numParticipantesGlobal = esCapacitacion
    ? parseInt((panelActivoElement.querySelector('#cot-cap-participantes') as HTMLInputElement | null)?.value || '1', 10)
    : null;
  const fechaServicioGlobal = esCapacitacion
    ? ((panelActivoElement.querySelector('#cot-cap-fecha-servicio') as HTMLInputElement | null)?.value || null)
    : null;
  const mesesImplementacionGlobal = esAsesoria
    ? parseInt((panelActivoElement.querySelector('#cot-cap-fecha-servicio') as HTMLInputElement | null)?.value || '1', 10)
    : null;
  
  // Capturar frecuencia por visita para Asesoría
  let frecuenciaPorVisitaGlobal: any = null;
  if (esAsesoria && mesesImplementacionGlobal) {
    frecuenciaPorVisitaGlobal = {};
    for (let i = 1; i <= mesesImplementacionGlobal; i++) {
      const pInput = document.getElementById(`cot-asesor-freq-m${i}-p`) as HTMLInputElement;
      const vInput = document.getElementById(`cot-asesor-freq-m${i}-v`) as HTMLInputElement;
      const fInput = document.getElementById(`cot-asesor-freq-m${i}-f`) as HTMLSelectElement;
      frecuenciaPorVisitaGlobal[`m${i}`] = {
        p: parseInt(pInput?.value || '0', 10),
        v: parseInt(vInput?.value || '0', 10),
        f: String(fInput?.value || '').trim(),
      };
    }
  }

  const detalles: any[] = [];
  let frecuenciaDiasInvalida = false;
  lineas.forEach(linea => {
    const itemSelect = linea.querySelector('.item-select') as HTMLSelectElement;
    const itemValue = itemSelect?.value || '';
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    const frecuenciaRaw = frecuenciaSugeridaDesdeFila(linea as HTMLElement);
    if (frecuenciaRaw === '__INVALID__') {
      frecuenciaDiasInvalida = true;
    }
    const frecuencia = frecuenciaRaw && frecuenciaRaw !== '__INVALID__' ? frecuenciaRaw : null;
    const modalidad = (linea.querySelector('.modalidad-input') as HTMLSelectElement)?.value || null;
    const opTecnicos = opTecnicosGlobal;
    const supervisor = supervisorGlobal;
    const servicioNombre = itemSelect?.options[itemSelect.selectedIndex]?.textContent?.trim() || '';
    const esFosfina = esServicioFosfina(servicioNombre);
    const cantidad = tipoCotizacion === 'Servicio'
      ? 1
      : parseInt((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '1');
    const medidaTanque = esFosfina
      ? medidaTanqueFosfinaGlobal
      : (esServicioLimpiezaConMedida(servicioNombre) ? medidaTanqueGlobal : null);
    const medidasTanque = esServicioLimpiezaConMedida(servicioNombre)
      ? medidasTanqueGlobal
      : (esFosfina && medidaTanqueFosfinaGlobal ? [medidaTanqueFosfinaGlobal] : []);
    const plantaVal = parseInt((linea.querySelector('.planta-input') as HTMLSelectElement)?.value || '0') || null;
    const areaIds = getAreaIdsFromRow(linea, tipoCotizacion);
    const horasCapacitacion = esCapacitacion ? horasCapacitacionGlobal : null;
    const numParticipantes = esCapacitacion ? numParticipantesGlobal : null;
    const fechaServicio = esCapacitacion ? fechaServicioGlobal : null;
    const mesesImplementacion = esAsesoria ? mesesImplementacionGlobal : null;
    const frecuenciaVisita = esAsesoria ? frecuenciaPorVisitaGlobal : null;

    const {
      id_servicio,
      id_producto,
      id_catalogo_cap_aud,
    } = tipoAdapter.parseSelectedItem(itemValue);
    const fosfinaProducto = esFosfina ? productoFosfinaGlobal : null;
    const fosfinaCantidad = esFosfina ? cantidadFosfinaGlobal : null;

    // Guardar siempre como array JSON para todos los tipos
    const areasParaGuardar = areaIds.length > 0 ? areaIds : null;
    
    detalles.push({
      id_servicio,
      id_producto,
      id_catalogo_cap_aud,
      cantidad,
      precio_unitario: precio,
      frecuencia_sugerida: frecuencia,
      modalidad_sugerida: modalidad,
      op_tecnicos: opTecnicos,
      supervisor,
      medida_tanque: esServicioLimpiezaConMedida(servicioNombre)
        ? (medidasTanque.length > 0 ? medidasTanque : null)
        : medidaTanque,
      fosfina_producto: fosfinaProducto,
      fosfina_cantidad: fosfinaCantidad,
      id_cliente_planta: plantaVal,
      id_cliente_planta_area: areasParaGuardar,  // Array de IDs o null
      horas_capacitacion: horasCapacitacion,
      num_participantes: numParticipantes,
      fecha_servicio: fechaServicio,
      meses_implementacion: mesesImplementacion,
      frecuencia_visita: frecuenciaVisita,
    });
  });

  if (frecuenciaDiasInvalida) {
    mostrarToast('warning', 'Frecuencia incompleta', 'Si selecciona "Días de la semana", debe marcar al menos un día.');
    return;
  }

  const data = {
    id_multicim: multicimId,
    id_cliente: clienteId,
    tipo_cotizacion: tipoCotizacion,
    fecha_emision: fechaEmision || undefined,
    incluye_igv: incluyeIgv,
    observaciones: observaciones || undefined,
    propuesta_tecnica: propuestaHtml,
    objetivos_asesoria: objetivosAsesoria,
    receta_servicio: tipoCotizacion === 'Servicio' && recetaServicioRows.length > 0 ? recetaServicioRows : null,
    beneficios_servicio: (() => {
      if (tipoCotizacion !== 'Servicio') return null;
      const chkBenef = panelActivoElement.querySelector('#chk-beneficios-servicio') as HTMLInputElement | null;
      if (!chkBenef?.checked) return null;
      return beneficiosServicioRows.map((b) => ({
        id_catalogo_cap_aud: b.id_catalogo_cap_aud,
        nombre_beneficio: b.nombre_beneficio,
        modalidad_sugerida: b.modalidad_sugerida,
        horas_capacitacion: b.horas_capacitacion,
        precio_referencial: 0,
        observacion: b.observacion || null,
      }));
    })(),
    exponentes_ids: (tipoCotizacion === 'Capacitacion' || tipoCotizacion === 'Asesoria')
      ? selectedExponentesCotizacion.map((e) => e.id)
      : null,
    detalles
  };

  const submitBtn = panelActivoElement.querySelector('#btn-guardar-cotiz') as HTMLButtonElement | null;
  const esEdicion = cotizacionEditandoId !== null && cotizacionEditandoTipo === tipoCotizacion;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Guardando...'; }

  try {
    const response = esEdicion
      ? await cotizacionService.update(Number(cotizacionEditandoId), data)
      : await cotizacionService.create(data);

    if (response.success !== false) {
      mostrarToast(
        'success',
        esEdicion ? 'Cotización actualizada' : 'Cotización creada',
        esEdicion
          ? `Se actualizó correctamente ${cotizacionEditandoNumero || `#${cotizacionEditandoId}`}`
          : 'La cotización fue registrada exitosamente',
      );

      if (!esEdicion) {
        // Generar PDF automáticamente al crear
        const nuevaId = response.data?.id;
        if (nuevaId) {
          mostrarToast('success', 'PDF', 'Generando PDF de la cotización...');
          try {
            await cotizacionService.downloadPDF(nuevaId);
          } catch (e) {
            console.error('Error generando PDF:', e);
            const pdfError = e as any;
            const detalle = pdfError?.data?.error || pdfError?.data?.message || 'Revisa logs del backend para más detalle';
            mostrarToast('warning', 'PDF no generado', `La cotización se guardó, pero falló el PDF: ${detalle}`);
          }

          // Guardar receta de servicio si tipo es Servicio y hay receta
          if (tipoCotizacion === 'Servicio' && recetaServicioRows.length > 0) {
            try {
              await cotizacionService.updateReceta(nuevaId, recetaServicioRows);
              mostrarToast('success', 'Receta guardada', 'La receta de servicio fue almacenada correctamente');
            } catch (e) {
              console.error('Error guardando receta:', e);
              mostrarToast('warning', 'Aviso', 'La cotización se guardó pero la receta no pudo almacenarse');
            }
          }
        }
      }

      await cargarCotizaciones();
      await cargarEstadisticas();
      
      // 🔄 Resetear flag del tipo actual para permitir recargar si hay cambios
      if (tipoFijo && TAB_TO_TIPO) {
        Object.keys(TAB_TO_TIPO).forEach((key) => {
          if ((TAB_TO_TIPO as any)[key] === tipoFijo) {
            tabsInicializados[key] = false; // Permitir recargar
          }
        });
      }

      if (esEdicion) {
        resetEditarCotizacionState();
        cerrarFormulario();
      } else if (tipoFijo) {
        await abrirFormularioCotizacion(tipoFijo);
      } else {
        cerrarFormulario();
      }
    }
  } catch (error: any) {
    let msg = esEdicion ? 'Error al actualizar la cotización' : 'Error al crear la cotización';
    if (error.data?.errors) {
      msg = Object.entries(error.data.errors).map(([f, m]: [string, any]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n');
    } else if (error.data?.message) {
      msg = error.data.message;
    }
    mostrarToast('error', 'Error', msg);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = getGuardarButtonHtml(cotizacionEditandoId !== null);
    }
  }
}

//  ACCIONES: PDF 
async function descargarPDF(id: number) {
  try {
    mostrarToast('success', 'Descargando', 'Generando PDF...');
    await cotizacionService.downloadPDF(id);
  } catch (error) {
    mostrarToast('error', 'Error', 'No se pudo descargar el PDF');
  }
}

async function editarCotizacion(id: number) {
  try {
    const res = await cotizacionService.getById(id);
    const cotizacion = (res as any).data || res;
    const tipo = cotizacion?.tipo_cotizacion || cotizacion?.tipo;
    const tabKey = getTabKeyByTipo(tipo);

    if (!tabKey || !tipo) {
      mostrarToast('error', 'Error', 'No se pudo identificar el tipo de cotización para editar');
      return;
    }

    cotizacionEditandoId = id;
    cotizacionEditandoTipo = tipo;
    cotizacionEditandoNumero = cotizacion?.numero_cotizacion || cotizacion?.numero || `#${id}`;

    if (formularioLoadController) {
      try {
        (formularioLoadController as AbortController).abort();
      } catch (err) {
        console.warn('[EDIT] Error al abortar carga anterior:', err);
      }
    }
    formularioLoadController = new AbortController();

    tabsInicializados[tabKey] = false;
    activarTabCotizacion(tabKey);
    await abrirFormularioCotizacion(tipo);
    tabsInicializados[tabKey] = true;

    const panel = document.getElementById(`cotiz-panel-${tabKey}`) as HTMLElement | null;
    if (!panel || !panel.querySelector('#form-cotizacion')) {
      mostrarToast('error', 'Error', 'No se pudo abrir el formulario de edición');
      resetEditarCotizacionState();
      return;
    }

    await poblarFormularioEdicion(panel, cotizacion);
    mostrarToast('success', 'Modo edición', `Editando ${cotizacionEditandoNumero}`);
  } catch (error: any) {
    console.error('Error cargando cotización para edición:', error);
    const msg = error?.data?.message || 'No se pudo cargar la cotización para editar';
    mostrarToast('error', 'Error', msg);
    resetEditarCotizacionState();
  }
}

// Toast: usa componente compartido importado arriba

//  INIT EVENTS 
export function initCotizacionesEvents() {
  // Cargar datos iniciales
  cargarEstadisticas();
  cargarCotizaciones();

  // Reset estado de tabs al inicializar
  tabActivo = 'historial';
  tabsInicializados.servicio = false;
  tabsInicializados.producto = false;
  tabsInicializados.capacitacion = false;
  tabsInicializados.asesoria = false;

  // Navegación por tabs
  document.querySelectorAll('.cotiz-tab').forEach(tab => {
    tab.addEventListener('click', async (e) => {
      const nuevoTab = (e.currentTarget as HTMLElement).dataset.tab || 'historial';
      console.log('[TABS] Click en tab:', nuevoTab, 'tabActivo anterior:', tabActivo);
      
      if (nuevoTab === tabActivo) {
        console.log('[TABS] Tab ya activo, ignorando click');
        return;
      }
      
      // Si regresa a Historial, resetear todos los flags para permitir recargar desde cero
      if (nuevoTab === 'historial') {
        tabsInicializados.servicio = false;
        tabsInicializados.producto = false;
        tabsInicializados.capacitacion = false;
        tabsInicializados.asesoria = false;
        resetEditarCotizacionState();
        console.log('[TABS] 🔄 Regresando a Historial - Flags resetados');
      }
      
      //  Cancelar cargas anteriores si aún estaban en progreso
      if (formularioLoadController) {
        try {
          console.log('[TABS] Abortando carga anterior del tipo:', tabActivo);
          (formularioLoadController as AbortController).abort();
        } catch (err) {
          console.warn('[TABS] Error al abortar carga anterior:', err);
        }
      }
      formularioLoadController = new AbortController();
      console.log('[TABS] Nuevo AbortController creado para:', nuevoTab);
      
      tabActivo = nuevoTab;

      // Actualizar estilos de tabs
      document.querySelectorAll('.cotiz-tab').forEach(t => {
        const el = t as HTMLElement;
        const isActive = el.dataset.tab === nuevoTab;
        el.style.borderBottomColor = isActive ? '#2563eb' : 'transparent';
        el.style.color = isActive ? '#2563eb' : '#64748b';
        el.style.fontWeight = isActive ? '600' : '500';
      });

      // Mostrar/ocultar paneles
      ['historial', 'servicio', 'producto', 'capacitacion', 'asesoria'].forEach(p => {
        const panel = document.getElementById(`cotiz-panel-${p}`);
        if (panel) panel.style.display = 'none';
      });
      const panelActivo = document.getElementById(`cotiz-panel-${nuevoTab}`);
      if (panelActivo) panelActivo.style.display = 'block';

      // Cargar formulario en tabs de tipo (solo la primera vez)
      if (nuevoTab !== 'historial' && !tabsInicializados[nuevoTab]) {
        try {
          await abrirFormularioCotizacion(TAB_TO_TIPO[nuevoTab]);
          // ✅ Solo marcar como inicializado si se completa SIN ERRORES
          tabsInicializados[nuevoTab] = true;
        } catch (error) {
          console.error('[TABS] Error al cargar formulario de', nuevoTab, ':', error);
          mostrarToast('error', 'Error', `No se pudo cargar el formulario de ${nuevoTab}`);
          // NO marcar como inicializado si hay error, permitir reintentar
        }
      }
    });
  });

  // Búsqueda con debounce
  let debounce: ReturnType<typeof setTimeout>;
  const searchInput = document.getElementById('cotiz-search') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        filtros.search = searchInput.value.trim();
        cargarCotizaciones();
      }, 400);
    });
  }

  // Filtro de tipo
  document.getElementById('cotiz-filter-tipo')?.addEventListener('change', (e) => {
    filtros.tipo = (e.target as HTMLSelectElement).value;
    cargarCotizaciones();
  });

  // Filtro de estado
  document.getElementById('cotiz-filter-estado')?.addEventListener('change', (e) => {
    filtros.estado = (e.target as HTMLSelectElement).value;
    cargarCotizaciones();
  });

  // Delegación de clicks en tabla para acciones
  document.getElementById('cotizaciones-tbody')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id || '0');
    if (!id) return;

    switch (action) {
      case 'edit-cotiz': editarCotizacion(id); break;
      case 'pdf-cotiz': descargarPDF(id); break;
    }
  });

  const pendingEditId = parseInt(sessionStorage.getItem(COTIZACION_EDIT_SESSION_KEY) || '0', 10);
  if (pendingEditId > 0) {
    sessionStorage.removeItem(COTIZACION_EDIT_SESSION_KEY);
    setTimeout(() => {
      void editarCotizacion(pendingEditId);
    }, 50);
  }
}
