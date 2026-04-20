// Recursos Humanos View
import * as ExcelJS from 'exceljs';
import { Chart, registerables } from 'chart.js';
import { rrhhService, type MiEstadoResponse, type EmpleadoHorarioResumen, type DiaHorario, type AsistenciaAdminRecord, type RrhhReporteDashboardResponse } from '../../services/rrhhService';
import { authService } from '../auth/auth.service';

Chart.register(...registerables);

// Timer global para el contador de horas trabajadas (persiste aunque cierren y abran)
let contadorInterval: ReturnType<typeof setInterval> | null = null;
// Timer para el contador de almuerzo
let almuerzoInterval: ReturnType<typeof setInterval> | null = null;
// Timer para el contador de horas extra
let extraInterval: ReturnType<typeof setInterval> | null = null;

function limpiarTimersAsistencia() {
  if (contadorInterval) { clearInterval(contadorInterval); contadorInterval = null; }
  if (almuerzoInterval) { clearInterval(almuerzoInterval); almuerzoInterval = null; }
  if (extraInterval) { clearInterval(extraInterval); extraInterval = null; }
}

/**
 * Calcula las horas/minutos/segundos desde hora_entrada_raw hasta ahora.
 * Usa la fecha actual del cliente + la hora de entrada del servidor.
 * AsÃ­, si cierran el navegador y vuelven a abrir, el contador sigue correcto.
 */
function calcularTiempoTranscurrido(horaEntradaRaw: string, servidorFecha: string): { horas: number; minutos: number; segundos: number; totalSegundos: number } {
  const entrada = new Date(`${servidorFecha}T${horaEntradaRaw}`);
  const ahora = new Date();
  const diff = Math.max(0, Math.floor((ahora.getTime() - entrada.getTime()) / 1000));
  return {
    horas: Math.floor(diff / 3600),
    minutos: Math.floor((diff % 3600) / 60),
    segundos: diff % 60,
    totalSegundos: diff,
  };
}

function formatContador(h: number, m: number, s: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getIdPersonalActual(): number {
  return authService.getUser()?.id ?? 1;
}

export function tieneAccesoCompletoRecursosHumanos(): boolean {
  const user = authService.getUser();
  const rol = (user?.rol || '').toLowerCase();
  const permisos = Array.isArray(user?.permisos) ? user.permisos : [];

  if (rol.includes('geren') || rol.includes('recursos humanos') || rol.includes('rrhh')) {
    return true;
  }

  if (permisos.includes('*')) {
    return true;
  }

  return ['rrhh-empleados', 'rrhh-tecnicos', 'rrhh-reportes', 'rrhh-horarios'].some((p) => permisos.includes(p));
}

export function getTabsRecursosHumanosPermitidos(): string[] {
  if (tieneAccesoCompletoRecursosHumanos()) {
    return ['asistencia', 'marcar', 'horarios', 'tecnicos', 'reportes'];
  }
  return ['asistencia', 'marcar'];
}

function normalizarFechaISO(fechaRaw: string | null | undefined): string | null {
  if (!fechaRaw) return null;

  const fecha = fechaRaw.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [d, mo, y] = fecha.split('/');
    return `${y}-${mo}-${d}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
    const [d, mo, y] = fecha.split('-');
    return `${y}-${mo}-${d}`;
  }

  if (/^\d{4}\/\d{2}\/\d{2}$/.test(fecha)) {
    return fecha.replace(/\//g, '-');
  }

  const parsed = new Date(fecha);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

function formatearFechaLegible(fechaRaw: string | null | undefined): string {
  const iso = normalizarFechaISO(fechaRaw);
  if (!iso) return fechaRaw || '--';

  const [y, mo, d] = iso.split('-');
  return `${d}/${mo}/${y}`;
}

function fechaISOConOffset(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split('T')[0];
}

function recorrerFechasISO(desde: string, hasta: string): string[] {
  const fechas: string[] = [];
  const fechaInicio = new Date(`${desde}T00:00:00`);
  const fechaFin = new Date(`${hasta}T00:00:00`);

  if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
    return fechas;
  }

  for (let fechaActual = new Date(fechaInicio); fechaActual <= fechaFin; fechaActual.setDate(fechaActual.getDate() + 1)) {
    fechas.push(fechaActual.toISOString().split('T')[0]);
  }

  return fechas;
}

function descargarExcelBuffer(buffer: ArrayBuffer, nombreArchivo: string): void {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

function renderFilaMiAsistenciaSemana(dia: MiEstadoResponse['data']['semana'][number]): string {
  const fecha = formatearFechaLegible(dia.fecha);
  const horas = formatearHorasRegistro(dia.horas);

  return `
    <tr>
      <td>${dia.dia}</td>
      <td>${fecha}</td>
      <td>${dia.entrada || '--:-- --'}</td>
      <td>${dia.salida || '--:-- --'}</td>
      <td>${horas}</td>
      <td><span class="status-indicator ${estadoAsistenciaClase(dia.estado || 'pendiente')}">${dia.estado || 'Pendiente'}</span></td>
    </tr>
  `;
}

export function renderAsistenciaPersonalTab() {
  const hoy = new Date().toISOString().split('T')[0];

  return `
    <div id="asistencia-personal-container">
      <div class="search-filter-bar" style="margin-bottom: 16px;">
        <input type="date" class="op-filter-select" id="asistencia-personal-fecha" value="${hoy}">
        <button class="btn-filter" id="asistencia-personal-btn-cargar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Cargar
        </button>
      </div>
      <div id="asistencia-personal-body">
        <div style="text-align: center; padding: 40px;">
          <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <p style="color: #64748b;">Cargando tu asistencia...</p>
        </div>
      </div>
    </div>
  `;
}

export async function cargarAsistenciaPersonal(fecha?: string) {
  const body = document.getElementById('asistencia-personal-body');
  if (!body) return;

  const fechaInput = document.getElementById('asistencia-personal-fecha') as HTMLInputElement | null;
  const fechaUsar = fecha ?? fechaInput?.value ?? new Date().toISOString().split('T')[0];

  body.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="color: #64748b;">Cargando tus registros...</p>
    </div>
  `;

  document.getElementById('asistencia-personal-btn-cargar')?.addEventListener('click', () => cargarAsistenciaPersonal(), { once: true });

  try {
    const resp = await rrhhService.getMiEstado(getIdPersonalActual());
    if (!resp.success) throw new Error('Error al cargar tu asistencia');

    const { personal, asistencia_hoy, estadisticas, semana } = resp.data;
    const registrosFiltrados = (semana || []).filter((d) => {
      const fechaRegistro = normalizarFechaISO(d.fecha);
      if (!fechaUsar) return true;
      return fechaRegistro === fechaUsar;
    });
    const estadoHoy = asistencia_hoy?.estado || 'Sin registro';
    const horasHoy = asistencia_hoy?.horas_trabajadas != null ? formatearHorasRegistro(asistencia_hoy.horas_trabajadas) : '--';

    body.innerHTML = `
      <div class="stats-row" style="margin-bottom: 24px;">
        <div class="stat-box">
          <div class="stat-box-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Trabajador</div>
            <div class="stat-box-value" style="font-size:16px;">${escapeHtml(personal.nombre)}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Estado Hoy</div>
            <div class="stat-box-value">${estadoHoy}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Horas Hoy</div>
            <div class="stat-box-value">${horasHoy}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Días Trabajados</div>
            <div class="stat-box-value">${estadisticas?.dias_trabajados ?? 0}</div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>DÍA</th>
              <th>FECHA</th>
              <th>ENTRADA</th>
              <th>SALIDA</th>
              <th>HORAS</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            ${registrosFiltrados.length > 0
              ? registrosFiltrados.map((d) => renderFilaMiAsistenciaSemana(d)).join('')
              : `<tr><td colspan="6" style="text-align:center; padding:40px; color:#64748b;">No tienes registros para la fecha seleccionada.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;
  } catch (err: any) {
    body.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 16px; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p style="font-size: 16px; font-weight: 600;">${err.message ?? 'Error al cargar tus datos'}</p>
        <button class="btn-primary" style="margin-top: 16px;" id="asistencia-personal-reintentar">Reintentar</button>
      </div>
    `;
    document.getElementById('asistencia-personal-reintentar')?.addEventListener('click', () => cargarAsistenciaPersonal());
  }
}

// Tab: Asistencia
export function renderAsistenciaTab() {
  const hoy = new Date().toISOString().split('T')[0];
  const quincenaDesde = fechaISOConOffset(-14);
  return `
    <div id="asistencia-admin-container">
      <div class="search-filter-bar" style="margin-bottom: 16px; gap: 12px; flex-wrap: wrap;">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input type="text" placeholder="Buscar trabajador..." class="search-input" id="asistencia-admin-search">
        </div>
        <div style="display:flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <input type="date" class="op-filter-select" id="asistencia-admin-fecha" value="${hoy}">
          <button class="btn-filter" id="asistencia-admin-btn-cargar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Cargar
          </button>
        </div>
        <div style="display:flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-left: auto;">
          <input type="date" class="op-filter-select" id="asistencia-admin-desde" value="${quincenaDesde}">
          <input type="date" class="op-filter-select" id="asistencia-admin-hasta" value="${hoy}">
          <button class="btn-secondary" id="asistencia-admin-btn-exportar" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar Excel
          </button>
        </div>
      </div>
      <div id="asistencia-admin-body">
        <div style="text-align: center; padding: 40px;">
          <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <p style="color: #64748b;">Cargando registros de asistencia...</p>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function estadoAsistenciaClase(estado: string): string {
  switch (estado.toLowerCase()) {
    case 'presente': return 'success';
    case 'tardanza': return 'warning';
    case 'ausente': return 'danger';
    case 'en curso': return 'warning';
    default: return 'success';
  }
}

function minutosAHorasTexto(minutos: number): string {
  if (!Number.isFinite(minutos) || minutos <= 0) return '0 min';
  const minutosNormalizados = Math.round(minutos);
  const h = Math.floor(minutosNormalizados / 60);
  const m = minutosNormalizados % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function horasDecimalATexto(horas: number): string {
  if (!Number.isFinite(horas) || horas <= 0) return '0 min';
  const minutosTotales = Math.round(horas * 60);
  return minutosAHorasTexto(minutosTotales);
}

function formatearHorasRegistro(valor: number | string | null | undefined): string {
  if (valor == null) return '--';

  if (typeof valor === 'number') {
    return horasDecimalATexto(valor);
  }

  const limpio = valor.trim();
  if (!limpio) return '--';

  const numerico = Number(limpio.replace(',', '.').replace(/[^\d.-]/g, ''));
  if (!Number.isNaN(numerico)) {
    return horasDecimalATexto(numerico);
  }

  return limpio;
}

function crearNombreArchivoExcel(prefijo: string, desde: string, hasta: string): string {
  return `${prefijo}_${desde}_a_${hasta}.xlsx`;
}

function aplicarEstiloTituloHoja(sheet: ExcelJS.Worksheet, texto: string, columnas: number, colorHex: string = '1F4E78'): void {
  sheet.addRow([texto]);
  sheet.mergeCells(1, 1, 1, columnas);
  const row = sheet.getRow(1);
  row.height = 24;
  row.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
  row.alignment = { horizontal: 'center', vertical: 'middle' };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHex } };
}

function aplicarEstiloEncabezado(row: ExcelJS.Row, colorHex: string = 'D9EAF7'): void {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: '1F1F1F' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHex } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'B7C9D6' } },
      left: { style: 'thin', color: { argb: 'B7C9D6' } },
      bottom: { style: 'thin', color: { argb: 'B7C9D6' } },
      right: { style: 'thin', color: { argb: 'B7C9D6' } },
    };
  });
}

function aplicarEstadoExcel(celda: ExcelJS.Cell, estado: string): void {
  const normalizado = (estado || '').toLowerCase();
  let fill = 'E2E8F0';
  let font = '1F2937';

  if (normalizado.includes('puntual')) {
    fill = 'DCFCE7';
    font = '166534';
  } else if (normalizado.includes('tardanza')) {
    fill = 'FEF3C7';
    font = '92400E';
  } else if (normalizado.includes('falt') || normalizado.includes('ausent')) {
    fill = 'FEE2E2';
    font = '991B1B';
  } else if (normalizado.includes('curso')) {
    fill = 'DBEAFE';
    font = '1D4ED8';
  }

  celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  celda.font = { bold: true, color: { argb: font } };
  celda.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
}

async function exportarReporteResumenRRHH(): Promise<void> {
  const mesEl = document.getElementById('rrhh-reportes-mes') as HTMLSelectElement | null;
  const areaEl = document.getElementById('rrhh-reportes-area') as HTMLSelectElement | null;
  const vistaEl = document.getElementById('rrhh-reportes-vista') as HTMLSelectElement | null;

  if (!mesEl || !areaEl || !vistaEl) return;

  const resp = await rrhhService.getReporteDashboard(mesEl.value, areaEl.value);
  if (!resp.success) {
    throw new Error('No se pudo generar el Excel del resumen');
  }

  const data = resp.data;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QSCI Group';
  workbook.created = new Date();

  const resumenSheet = workbook.addWorksheet('Resumen');
  aplicarEstiloTituloHoja(resumenSheet, 'REPORTE RRHH - RESUMEN', 2, '2C4A7C');
  resumenSheet.addRow(['Periodo', formatearMes(data.filtros.mes)]);
  resumenSheet.addRow(['Área', data.filtros.area || 'Todos']);
  resumenSheet.addRow(['Vista', vistaEl.value === 'diaria' ? 'Diaria' : 'Semanal']);
  resumenSheet.addRow([]);
  resumenSheet.addRow(['KPI', 'Valor']);
  aplicarEstiloEncabezado(resumenSheet.getRow(6), 'DBEAFE');

  [
    ['Horas trabajadas totales', horasDecimalesATextoLargo(Number(data.kpis.horas_trabajadas_totales) || 0)],
    ['Horas efectivas', horasDecimalesATextoLargo(Number(data.kpis.horas_efectivas) || 0)],
    ['Tardanza total', minutosATextoLargo(Number(data.kpis.tiempo_total_tardanza_minutos) || 0)],
    ['Almuerzo total', minutosATextoLargo(Number(data.kpis.tiempo_total_almuerzo_minutos) || 0)],
    ['Promedio almuerzo', minutosATextoLargo(Number(data.kpis.promedio_almuerzo_minutos) || 0)],
    ['Exceso almuerzo', minutosATextoLargo(Number(data.kpis.tiempo_exceso_almuerzo_minutos) || 0)],
    ['Tardanza inicio almuerzo', minutosATextoLargo(Number(data.kpis.tardanza_inicio_almuerzo_minutos) || 0)],
    ['Asistencia promedio', `${Number(data.kpis.asistencia_promedio).toFixed(1)}%`],
    ['Tardanzas del mes', Number(data.kpis.tardanzas_mes) || 0],
    ['Ausencias del mes', Number(data.kpis.ausencias_mes) || 0],
    ['Tiempo extra total', minutosATextoLargo(Number(data.kpis.tiempo_extra_total_minutos) || 0)],
    ['Jornada promedio', horasDecimalesATextoLargo(Number(data.kpis.jornada_promedio_horas) || 0)],
  ].forEach((fila) => resumenSheet.addRow(fila));

  resumenSheet.getColumn(1).width = 32;
  resumenSheet.getColumn(2).width = 24;

  const porAreaSheet = workbook.addWorksheet('Por área');
  porAreaSheet.addRow(['Área', 'Horas', 'Asistencia', 'Tardanza', 'Tardanzas']);
  aplicarEstiloEncabezado(porAreaSheet.getRow(1), 'DBEAFE');
  data.por_area.forEach((item) => {
    porAreaSheet.addRow([
      item.area,
      horasDecimalesATextoCorto(Number(item.horas) || 0),
      `${Number(item.asistencia).toFixed(1)}%`,
      minutosATexto(Number(item.tardanza_minutos) || 0),
      Number(item.tardanzas) || 0,
    ]);
  });
  porAreaSheet.getColumn(1).width = 28;
  porAreaSheet.getColumn(2).width = 14;
  porAreaSheet.getColumn(3).width = 14;
  porAreaSheet.getColumn(4).width = 16;
  porAreaSheet.getColumn(5).width = 12;

  const topSheet = workbook.addWorksheet('Top empleados');
  topSheet.addRow(['Empleado', 'Área', 'Asistencia', 'Puntualidad']);
  aplicarEstiloEncabezado(topSheet.getRow(1), 'DBEAFE');
  data.top_empleados.forEach((item) => {
    topSheet.addRow([
      item.empleado,
      item.area,
      `${Number(item.asistencia).toFixed(1)}%`,
      nivelPuntualidad(Number(item.puntualidad) || 0).texto,
    ]);
  });
  topSheet.getColumn(1).width = 34;
  topSheet.getColumn(2).width = 24;
  topSheet.getColumn(3).width = 14;
  topSheet.getColumn(4).width = 16;

  const buffer = await workbook.xlsx.writeBuffer();
  descargarExcelBuffer(buffer, crearNombreArchivoExcel('reporte_rrhh_resumen', data.filtros.mes, data.filtros.area || 'todos'));
}

async function exportarAsistenciaQuincenalExcel(): Promise<void> {
  const desdeEl = document.getElementById('asistencia-admin-desde') as HTMLInputElement | null;
  const hastaEl = document.getElementById('asistencia-admin-hasta') as HTMLInputElement | null;

  if (!desdeEl || !hastaEl) return;

  const desde = desdeEl.value;
  const hasta = hastaEl.value;

  if (!desde || !hasta) {
    mostrarNotificacionAsistencia('Debes indicar un rango desde/hasta.', 'error');
    return;
  }

  if (desde > hasta) {
    mostrarNotificacionAsistencia('La fecha Desde no puede ser mayor que Hasta.', 'error');
    return;
  }

  const fechas = recorrerFechasISO(desde, hasta);
  if (fechas.length === 0) {
    mostrarNotificacionAsistencia('El rango de fechas no es válido.', 'error');
    return;
  }

  const registros: Array<AsistenciaAdminRecord & { fecha_reporte: string }> = [];

  for (const fecha of fechas) {
    const resp = await rrhhService.getListaAdmin(fecha);
    if (resp.success) {
      registros.push(...resp.data.map((registro) => ({ ...registro, fecha_reporte: registro.fecha || fecha })));
    }
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QSCI Group';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Reporte asistencia');
  aplicarEstiloTituloHoja(sheet, 'REPORTE DE ASISTENCIA', 9, '2C4A7C');
  sheet.addRow(['Desde', formatearFechaLegible(desde)]);
  sheet.addRow(['Hasta', formatearFechaLegible(hasta)]);
  sheet.addRow(['Total de registros', registros.length]);
  sheet.addRow([]);

  const headerRow = sheet.addRow(['Fecha', 'Trabajador', 'Área', 'Entrada', 'Salida', 'Tardanza', 'Tiempo de almuerzo', 'Horas trabajadas', 'Estado']);
  aplicarEstiloEncabezado(headerRow, 'DBEAFE');

  registros
    .sort((a, b) => `${a.fecha_reporte}-${a.nombre}`.localeCompare(`${b.fecha_reporte}-${b.nombre}`))
    .forEach((registro) => {
      const row = sheet.addRow([
        formatearFechaLegible(registro.fecha_reporte),
        registro.nombre,
        registro.area,
        registro.entrada ?? '--:-- --',
        registro.salida ?? '--:-- --',
        registro.tardanza_minutos > 0 ? minutosAHorasTexto(registro.tardanza_minutos) : '0 min',
        registro.tiempo_almuerzo_minutos != null
          ? minutosAHorasTexto(registro.tiempo_almuerzo_minutos)
          : (registro.hora_inicio_almuerzo && !registro.hora_fin_almuerzo ? 'En curso' : '--'),
        registro.horas_trabajadas != null ? formatearHorasRegistro(registro.horas_trabajadas) : '--',
        registro.estado,
      ]);

      row.eachCell((cell, columnNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } },
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (columnNumber === 9) {
          aplicarEstadoExcel(cell, String(registro.estado));
        }
      });
    });

  sheet.getColumn(1).width = 14;
  sheet.getColumn(2).width = 34;
  sheet.getColumn(3).width = 22;
  sheet.getColumn(4).width = 12;
  sheet.getColumn(5).width = 12;
  sheet.getColumn(6).width = 14;
  sheet.getColumn(7).width = 18;
  sheet.getColumn(8).width = 16;
  sheet.getColumn(9).width = 14;
  sheet.views = [{ state: 'frozen', ySplit: 5 }];

  const buffer = await workbook.xlsx.writeBuffer();
  descargarExcelBuffer(buffer, crearNombreArchivoExcel('reporte_asistencia', desde, hasta));
}

function renderFilaAsistenciaAdmin(r: AsistenciaAdminRecord): string {
  const fechaDisplay = r.fecha ? (() => { const [y, mo, d] = r.fecha.split('-'); return `${d}/${mo}/${y}`; })() : '--';
  const horas = r.horas_trabajadas != null ? formatearHorasRegistro(r.horas_trabajadas) : '--';
  const tardanza = r.tardanza_minutos > 0 ? minutosAHorasTexto(r.tardanza_minutos) : '0 min';
  const almuerzo = r.tiempo_almuerzo_minutos != null
    ? minutosAHorasTexto(r.tiempo_almuerzo_minutos)
    : (r.hora_inicio_almuerzo && !r.hora_fin_almuerzo ? 'En curso' : '--');
  const extraBadge = r.tiempo_extra_minutos > 0
    ? `<br><small style="color:#16a34a; font-weight:600;">+${minutosAHorasTexto(r.tiempo_extra_minutos)} extra</small>`
    : '';

  return `
    <tr>
      <td>
        <div class="equipment-info">
          <div class="equipment-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="equipment-name">${escapeHtml(r.nombre)}</div>
            <div class="equipment-id">ID: ${r.id_personal}</div>
          </div>
        </div>
      </td>
      <td><span class="badge">${escapeHtml(r.area)}</span></td>
      <td>${fechaDisplay}</td>
      <td>${r.entrada ?? '--:-- --'}</td>
      <td>${r.salida ?? '--:-- --'}</td>
      <td>${tardanza}</td>
      <td>${almuerzo}</td>
      <td>${horas}${extraBadge}</td>
      <td><span class="status-indicator ${estadoAsistenciaClase(r.estado)}">${r.estado}</span></td>
    </tr>`;
}

export async function cargarAsistenciaAdmin(fecha?: string) {
  const body = document.getElementById('asistencia-admin-body');
  if (!body) return;

  const fechaInput = document.getElementById('asistencia-admin-fecha') as HTMLInputElement | null;
  const fechaUsar = fecha ?? fechaInput?.value ?? new Date().toISOString().split('T')[0];

  body.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="color: #64748b;">Cargando registros...</p>
    </div>
  `;

  document.getElementById('asistencia-admin-btn-cargar')?.addEventListener('click', () => cargarAsistenciaAdmin(), { once: true });

  const exportarBtn = document.getElementById('asistencia-admin-btn-exportar') as HTMLButtonElement | null;
  if (exportarBtn && !exportarBtn.dataset.bound) {
    exportarBtn.dataset.bound = '1';
    exportarBtn.addEventListener('click', async () => {
      exportarBtn.disabled = true;
      const textoOriginal = exportarBtn.innerHTML;
      exportarBtn.innerHTML = 'Exportando...';
      try {
        await exportarAsistenciaQuincenalExcel();
        mostrarNotificacionAsistencia('Excel quincenal generado correctamente.', 'success');
      } catch (err: any) {
        mostrarNotificacionAsistencia(err?.message || 'Error al exportar Excel', 'error');
      } finally {
        exportarBtn.disabled = false;
        exportarBtn.innerHTML = textoOriginal;
      }
    });
  }

  try {
    const resp = await rrhhService.getListaAdmin(fechaUsar);
    if (!resp.success) throw new Error('Error al cargar datos de asistencia');

    const registros = resp.data;
    const presentes = registros.filter(r => r.entrada && !r.salida).length;
    const completados = registros.filter(r => r.entrada && r.salida).length;
    const tardanzas = registros.filter(r => r.tardanza_minutos > 0).length;
    const ausentes = registros.filter(r => !r.entrada).length;
    const totalExtra = registros.reduce((s, r) => s + r.tiempo_extra_minutos, 0);

    body.innerHTML = `
      <div class="stats-row" style="margin-bottom: 24px;">
        <div class="stat-box">
          <div class="stat-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Total</div>
            <div class="stat-box-value">${registros.length}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Completados</div>
            <div class="stat-box-value">${completados}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">En Curso / Tardanzas</div>
            <div class="stat-box-value">${presentes} / ${tardanzas}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Ausentes</div>
            <div class="stat-box-value">${ausentes}</div>
          </div>
        </div>
        ${totalExtra > 0 ? `
        <div class="stat-box">
          <div class="stat-box-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Horas Extra Total</div>
            <div class="stat-box-value">${minutosAHorasTexto(totalExtra)}</div>
          </div>
        </div>` : ''}
      </div>
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>TRABAJADOR</th>
              <th>ÁREA</th>
              <th>FECHA</th>
              <th>ENTRADA</th>
              <th>SALIDA</th>
              <th>TARDANZA</th>
              <th>TIEMPO ALMUERZO</th>
              <th>HORAS</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody id="asistencia-admin-tbody">
            ${registros.length > 0
              ? registros.map(r => renderFilaAsistenciaAdmin(r)).join('')
              : `<tr><td colspan="9" style="text-align:center; padding:40px; color:#64748b;">No hay registros para esta fecha.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('asistencia-admin-search')?.addEventListener('input', (e) => {
      const q = (e.target as HTMLInputElement).value.toLowerCase();
      document.querySelectorAll<HTMLTableRowElement>('#asistencia-admin-tbody tr').forEach(row => {
        row.style.display = (row.textContent?.toLowerCase() ?? '').includes(q) ? '' : 'none';
      });
    });

  } catch (err: any) {
    body.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 16px; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p style="font-size: 16px; font-weight: 600;">${err.message ?? 'Error al cargar datos'}</p>
        <button class="btn-primary" style="margin-top: 16px;" id="asistencia-admin-reintentar">Reintentar</button>
      </div>
    `;
    document.getElementById('asistencia-admin-reintentar')?.addEventListener('click', () => cargarAsistenciaAdmin());
  }
}

function abrirModalHorasExtra(idAsistencia: number, nombre: string, fecha: string, horaInicioExtra: string | null, horaSalidaEsperada: string | null) {
  const fechaDisplay = fecha ? (() => { const [y, mo, d] = fecha.split('-'); return `${d}/${mo}/${y}`; })() : '--';
  const defaultHora = horaInicioExtra ?? horaSalidaEsperada ?? '17:00';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;';

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 32px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <h2 style="margin: 0 0 4px; color: #1a2332; font-size: 20px;">Asignar Horas Extra</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">${escapeHtml(nombre)} — ${fechaDisplay}</p>
        </div>
        <button id="modal-extra-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
          Hora inicio extra <span style="font-weight: 400; color: #9ca3af;">(desde cuándo se contabiliza)</span>
        </label>
        <input type="time" id="modal-extra-hora" value="${defaultHora}"
          style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; box-sizing: border-box;">
        <p style="margin: 6px 0 0; font-size: 12px; color: #9ca3af;">El tiempo extra se calculará automáticamente al marcar salida.</p>
      </div>
      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
          Observaciones <span style="font-weight: 400; color: #9ca3af;">(opcional)</span>
        </label>
        <textarea id="modal-extra-obs" rows="3" placeholder="Motivo de las horas extra, tarea asignada, etc."
          style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box;"></textarea>
      </div>
      <div id="modal-extra-error" style="display: none; background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px;"></div>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button id="modal-extra-cancel" class="btn-secondary" style="padding: 10px 24px;">Cancelar</button>
        <button id="modal-extra-save" class="btn-primary" style="padding: 10px 24px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Asignar Horas Extra
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#modal-extra-close')?.addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-extra-cancel')?.addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-extra-save')?.addEventListener('click', async () => {
    const horaInicio = (overlay.querySelector('#modal-extra-hora') as HTMLInputElement).value;
    const obs = (overlay.querySelector('#modal-extra-obs') as HTMLTextAreaElement).value.trim();
    const errorDiv = overlay.querySelector('#modal-extra-error') as HTMLElement;
    const saveBtn = overlay.querySelector('#modal-extra-save') as HTMLButtonElement;

    if (!horaInicio) {
      errorDiv.textContent = 'Debe indicar la hora de inicio de horas extra.';
      errorDiv.style.display = 'block';
      return;
    }

    errorDiv.style.display = 'none';
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';

    try {
      const resp = await rrhhService.asignarHorasExtra(idAsistencia, true, horaInicio, obs || undefined);
      if (!resp.success) throw new Error(resp.message ?? 'Error al guardar');
      overlay.remove();
      mostrarNotificacionAsistencia(`Horas extra asignadas desde ${horaInicio}`, 'success');
      const fi = document.getElementById('asistencia-admin-fecha') as HTMLInputElement | null;
      cargarAsistenciaAdmin(fi?.value);
    } catch (err: any) {
      errorDiv.textContent = err.data?.message ?? err.message ?? 'Error al guardar';
      errorDiv.style.display = 'block';
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>Asignar Horas Extra';
    }
  });
}

// Tab: Empleados
export function renderEmpleadosTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar empleado..." class="search-input">
      </div>
      <select class="op-filter-select">
        <option>Todos los Departamentos</option>
        <option>Administrativo</option>
        <option>Campo</option>
        <option>LogÃ­stica</option>
        <option>Ventas</option>
      </select>
      <select class="op-filter-select">
        <option>Todos los Estados</option>
        <option>Activo</option>
        <option>Inactivo</option>
        <option>Vacaciones</option>
      </select>
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>EMPLEADO</th>
            <th>DEPARTAMENTO</th>
            <th>CARGO</th>
            <th>TELÃ‰FONO</th>
            <th>EMAIL</th>
            <th>FECHA INGRESO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Juan RamÃ­rez</div>
                  <div class="equipment-id">ID: EMP-001</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>TÃ©cnico Fumigador</td>
            <td>+51 987 654 321</td>
            <td>juan.ramirez@qsci.com</td>
            <td>15/03/2023</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">MarÃ­a Soto</div>
                  <div class="equipment-id">ID: EMP-002</div>
                </div>
              </div>
            </td>
            <td><span class="badge green">Administrativo</span></td>
            <td>Asistente Administrativa</td>
            <td>+51 912 345 678</td>
            <td>maria.soto@qsci.com</td>
            <td>10/01/2024</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Pedro LÃ³pez</div>
                  <div class="equipment-id">ID: EMP-003</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>TÃ©cnico SanitizaciÃ³n</td>
            <td>+51 998 765 432</td>
            <td>pedro.lopez@qsci.com</td>
            <td>22/06/2023</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Ana Torres</div>
                  <div class="equipment-id">ID: EMP-004</div>
                </div>
              </div>
            </td>
            <td><span class="badge green">Administrativo</span></td>
            <td>Contadora</td>
            <td>+51 945 678 901</td>
            <td>ana.torres@qsci.com</td>
            <td>05/09/2022</td>
            <td><span class="status-indicator warning">Vacaciones</span></td>
            <td><button class="action-btn">â‹®</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Carlos Mendoza</div>
                  <div class="equipment-id">ID: EMP-005</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>Supervisor de Campo</td>
            <td>+51 923 456 789</td>
            <td>carlos.mendoza@qsci.com</td>
            <td>18/11/2021</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">â‹®</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Roberto DÃ­az</div>
                  <div class="equipment-id">ID: EMP-006</div>
                </div>
              </div>
            </td>
            <td><span class="badge blue">LogÃ­stica</span></td>
            <td>Chofer</td>
            <td>+51 956 789 012</td>
            <td>roberto.diaz@qsci.com</td>
            <td>30/04/2024</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">â‹®</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Carmen RÃ­os</div>
                  <div class="equipment-id">ID: EMP-007</div>
                </div>
              </div>
            </td>
            <td><span class="badge orange">Ventas</span></td>
            <td>Ejecutiva Comercial</td>
            <td>+51 978 123 456</td>
            <td>carmen.rios@qsci.com</td>
            <td>12/08/2023</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">â‹®</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats-row" style="margin-top: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Empleados</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Activos</div>
          <div class="stat-box-value">22</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">En Vacaciones</div>
          <div class="stat-box-value">1</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Planilla Mensual</div>
          <div class="stat-box-value">$18,450</div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-7 de 24 empleados</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <button class="pagination-btn">4</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

// Tab: Reportes
const rrhhReportChartInstances: Chart[] = [];

function destruirGraficosRrhh(): void {
  while (rrhhReportChartInstances.length > 0) {
    rrhhReportChartInstances.pop()?.destroy();
  }
}

function crearOGestionarGraficoRrhh(canvasId: string, config: any): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const existente = rrhhReportChartInstances.find((chart) => chart.canvas === canvas);
  if (existente) {
    existente.destroy();
    rrhhReportChartInstances.splice(rrhhReportChartInstances.indexOf(existente), 1);
  }

  rrhhReportChartInstances.push(new Chart(ctx, config));
}

export function renderReportesTab() {
  const hoy = new Date();
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  const opcionesMes: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    opcionesMes.push(`<option value="${value}" ${value === mesActual ? 'selected' : ''}>${label.charAt(0).toUpperCase() + label.slice(1)}</option>`);
  }

  return `
    <style>
      .rrhh-reportes-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }

      .rrhh-reportes-grid-bottom {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 24px;
      }

      @media (max-width: 1100px) {
        .rrhh-reportes-grid-2,
        .rrhh-reportes-grid-bottom {
          grid-template-columns: 1fr;
        }
      }

      .rrhh-chart-grid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }

      .rrhh-chart-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 8px 30px rgba(15, 23, 42, .05);
      }

      .rrhh-span-6 { grid-column: span 6; }
      .rrhh-span-5 { grid-column: span 5; }
      .rrhh-span-7 { grid-column: span 7; }

      @media (max-width: 1200px) {
        .rrhh-span-6,
        .rrhh-span-5,
        .rrhh-span-7 { grid-column: span 12; }
      }

      .rrhh-chart-wrap {
        height: 300px;
      }

      .rrhh-chart-wrap.short {
        height: 260px;
      }
    </style>

    <div class="search-filter-bar" id="rrhh-reportes-filtros">
      <select class="op-filter-select" id="rrhh-reportes-mes">
        ${opcionesMes.join('')}
      </select>
      <select class="op-filter-select" id="rrhh-reportes-vista">
        <option value="semanal" selected>Vista semanal</option>
        <option value="diaria">Vista diaria</option>
      </select>
      <select class="op-filter-select" id="rrhh-reportes-area">
        <option value="Todos">Todas las áreas</option>
      </select>
      <button class="btn-filter" id="rrhh-reportes-btn-aplicar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Aplicar
      </button>
      <button class="btn-secondary" id="rrhh-reportes-btn-exportar" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Exportar Excel
      </button>
    </div>

    <div id="rrhh-reportes-body">
      <div style="text-align:center; padding: 48px 12px; color:#64748b;">
        <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        Cargando dashboard de reportes...
      </div>
    </div>
  `;
}

function minutosATexto(min: number): string {
  if (min <= 0) return '0 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function minutosATextoLargo(min: number): string {
  const total = Math.max(0, Math.round(min));
  if (total === 0) return '0 min';

  const horas = Math.floor(total / 60);
  const minutos = total % 60;

  if (horas === 0) return `${minutos} min`;
  if (minutos === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas} ${horas === 1 ? 'hora' : 'horas'} y ${minutos} min`;
}

function horasDecimalesATextoLargo(horasDecimales: number): string {
  const minutos = Math.round(Math.max(0, horasDecimales) * 60);
  return minutosATextoLargo(minutos);
}

function horasDecimalesATextoCorto(horasDecimales: number): string {
  const minutos = Math.round(Math.max(0, horasDecimales) * 60);
  return minutosATexto(minutos);
}

function nivelPuntualidad(p: number): { clase: string; texto: string } {
  if (p >= 98) return { clase: 'success', texto: 'Excelente' };
  if (p >= 94) return { clase: 'success', texto: 'Muy bueno' };
  if (p >= 88) return { clase: 'warning', texto: 'Regular' };
  return { clase: 'danger', texto: 'Critico' };
}

function formatearMes(mes: string): string {
  const [y, m] = mes.split('-').map((n) => Number(n));
  if (!y || !m) return mes;
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function colorBadgeArea(i: number): string {
  const colors = ['', 'green', 'blue', 'orange'];
  return colors[i % colors.length];
}

export async function cargarReportesRRHH() {
  const body = document.getElementById('rrhh-reportes-body');
  const mesEl = document.getElementById('rrhh-reportes-mes') as HTMLSelectElement | null;
  const vistaEl = document.getElementById('rrhh-reportes-vista') as HTMLSelectElement | null;
  const areaEl = document.getElementById('rrhh-reportes-area') as HTMLSelectElement | null;
  const aplicarBtn = document.getElementById('rrhh-reportes-btn-aplicar') as HTMLButtonElement | null;
  const exportarBtn = document.getElementById('rrhh-reportes-btn-exportar') as HTMLButtonElement | null;

  if (!body || !mesEl || !vistaEl || !areaEl) return;

  destruirGraficosRrhh();

  if (aplicarBtn && !aplicarBtn.dataset.bound) {
    aplicarBtn.dataset.bound = '1';
    aplicarBtn.addEventListener('click', () => cargarReportesRRHH());
  }

  if (!vistaEl.dataset.bound) {
    vistaEl.dataset.bound = '1';
    vistaEl.addEventListener('change', () => cargarReportesRRHH());
  }

  if (exportarBtn && !exportarBtn.dataset.bound) {
    exportarBtn.dataset.bound = '1';
    exportarBtn.addEventListener('click', async () => {
      exportarBtn.disabled = true;
      const textoOriginal = exportarBtn.innerHTML;
      exportarBtn.innerHTML = 'Exportando...';
      try {
        await exportarReporteResumenRRHH();
        mostrarNotificacionAsistencia('Excel del resumen generado correctamente.', 'success');
      } catch (err: any) {
        mostrarNotificacionAsistencia(err?.message || 'Error al exportar resumen RRHH', 'error');
      } finally {
        exportarBtn.disabled = false;
        exportarBtn.innerHTML = textoOriginal;
      }
    });
  }

  body.innerHTML = `
    <div style="text-align:center; padding: 48px 12px; color:#64748b;">
      <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      Consultando datos reales de asistencia...
    </div>
  `;

  try {
    const resp: RrhhReporteDashboardResponse = await rrhhService.getReporteDashboard(mesEl.value, areaEl.value);
    if (!resp.success) throw new Error('No se pudo cargar el dashboard de reportes');

    const data = resp.data;
    const { kpis, por_area, top_empleados, alertas } = data;

    const horasTrabajadasTexto = horasDecimalesATextoLargo(Number(kpis.horas_trabajadas_totales) || 0);
    const horasEfectivasTexto = horasDecimalesATextoLargo(Number(kpis.horas_efectivas) || 0);
    const jornadaPromedioTexto = horasDecimalesATextoLargo(Number(kpis.jornada_promedio_horas) || 0);
    const promedioAlmuerzoTexto = minutosATextoLargo(Number(kpis.promedio_almuerzo_minutos) || 0);

    const areaSeleccionada = areaEl.value;
    const nuevasAreas = ['Todos', ...(data.areas_disponibles || [])];
    const actuales = Array.from(areaEl.options).map((o) => o.value);
    if (JSON.stringify(actuales) !== JSON.stringify(nuevasAreas)) {
      areaEl.innerHTML = nuevasAreas
        .map((a) => `<option value="${escapeHtml(a)}" ${a === areaSeleccionada ? 'selected' : ''}>${escapeHtml(a === 'Todos' ? 'Todas las áreas' : a)}</option>`)
        .join('');
    }

    const filasDept = por_area.length > 0
      ? por_area.map((d, i) => `
        <tr>
          <td><span class="badge ${colorBadgeArea(i)}">${escapeHtml(d.area)}</span></td>
          <td><strong>${horasDecimalesATextoCorto(Number(d.horas) || 0)}</strong></td>
          <td><strong>${Number(d.asistencia).toFixed(1)}%</strong></td>
          <td>${minutosATexto(Number(d.tardanza_minutos) || 0)}</td>
          <td>${Number(d.tardanzas) || 0}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#64748b;">Sin datos para el filtro seleccionado.</td></tr>';

    const filasTop = top_empleados.length > 0
      ? top_empleados.map((e, i) => {
        const nivel = nivelPuntualidad(Number(e.puntualidad) || 0);
        return `
          <tr>
            <td><div class="equipment-name">${escapeHtml(e.empleado)}</div></td>
            <td><span class="badge ${colorBadgeArea(i)}">${escapeHtml(e.area)}</span></td>
            <td><strong>${Number(e.asistencia).toFixed(1)}%</strong></td>
            <td><span class="status-indicator ${nivel.clase}">${nivel.texto}</span></td>
          </tr>
        `;
      }).join('')
      : '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#64748b;">Sin datos para ranking.</td></tr>';

    const alertasHtml = alertas.length > 0
      ? alertas.map((a) => {
        const styles = a.tipo === 'danger'
          ? { border: '#fecaca', bg: '#fef2f2', title: '#b91c1c' }
          : a.tipo === 'warning'
            ? { border: '#fde68a', bg: '#fffbeb', title: '#b45309' }
            : a.tipo === 'success'
              ? { border: '#bbf7d0', bg: '#f0fdf4', title: '#166534' }
              : { border: '#bfdbfe', bg: '#eff6ff', title: '#1d4ed8' };
        return `
          <div style="padding: 12px; border: 1px solid ${styles.border}; background: ${styles.bg}; border-radius: 10px;">
            <div style="font-size: 12px; color: ${styles.title}; font-weight: 700; margin-bottom: 4px;">${escapeHtml(a.titulo)}</div>
            <div style="font-size: 14px; color: #1f2937;">${escapeHtml(a.detalle)}</div>
          </div>
        `;
      }).join('')
      : '<div style="padding: 12px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; color:#64748b;">Sin alertas para este periodo.</div>';

    body.innerHTML = `
      <div class="card" style="margin-bottom: 20px; padding: 18px 20px; border-left: 4px solid #2c4a7c;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
          <div>
            <h3 style="margin: 0; font-size: 18px; color: #1a2332;">KPIs Prioritarios de RRHH</h3>
            <p style="margin: 6px 0 0; color: #64748b; font-size: 13px;">Dashboard alimentado con datos reales de asistencia.</p>
          </div>
          <span style="font-size: 12px; color: #475569; background: #e2e8f0; padding: 6px 10px; border-radius: 999px;">Corte: ${escapeHtml(formatearMes(data.filtros.mes))}</span>
        </div>
      </div>

      <div class="stat-boxes" style="margin-bottom: 16px;">
        <div class="stat-box"><div class="stat-box-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div><div class="stat-box-content"><div class="stat-box-label">Horas Trabajadas Totales</div><div class="stat-box-value">${horasTrabajadasTexto}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"></path><path d="M7 15l4-4 3 3 4-6"></path></svg></div><div class="stat-box-content"><div class="stat-box-label">Horas Efectivas</div><div class="stat-box-value">${horasEfectivasTexto}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 7v6l3 3"></path></svg></div><div class="stat-box-content"><div class="stat-box-label">Tiempo Total de Tardanza</div><div class="stat-box-value">${minutosATexto(Number(kpis.tiempo_total_tardanza_minutos) || 0)}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="stat-box-content"><div class="stat-box-label">Asistencia Promedio</div><div class="stat-box-value">${Number(kpis.asistencia_promedio).toFixed(1)}%</div></div></div>
      </div>

      <div class="stat-boxes" style="margin-bottom: 24px;">
        <div class="stat-box"><div class="stat-box-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="stat-box-content"><div class="stat-box-label">Tardanzas del Mes</div><div class="stat-box-value">${Number(kpis.tardanzas_mes) || 0}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon red"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div><div class="stat-box-content"><div class="stat-box-label">Ausencias del Mes</div><div class="stat-box-value">${Number(kpis.ausencias_mes) || 0}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"></path><path d="M9 9h6v6H9z"></path></svg></div><div class="stat-box-content"><div class="stat-box-label">Tiempo Extra Total</div><div class="stat-box-value">${minutosATexto(Number(kpis.tiempo_extra_total_minutos) || 0)}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18"></path></svg></div><div class="stat-box-content"><div class="stat-box-label">Jornada Promedio</div><div class="stat-box-value">${jornadaPromedioTexto}</div></div></div>
      </div>

      <div class="stat-boxes" style="margin-bottom: 24px;">
        <div class="stat-box"><div class="stat-box-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 7v5"></path><path d="M12 12l3 2"></path></svg></div><div class="stat-box-content"><div class="stat-box-label">Tiempo Almuerzo Total</div><div class="stat-box-value">${minutosATexto(Number(kpis.tiempo_total_almuerzo_minutos) || 0)}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"></path><path d="M12 3v18"></path></svg></div><div class="stat-box-content"><div class="stat-box-label">Promedio Almuerzo</div><div class="stat-box-value">${promedioAlmuerzoTexto}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div><div class="stat-box-content"><div class="stat-box-label">Exceso Almuerzo</div><div class="stat-box-value">${minutosATexto(Number(kpis.tiempo_exceso_almuerzo_minutos) || 0)}</div></div></div>
        <div class="stat-box"><div class="stat-box-icon red"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="stat-box-content"><div class="stat-box-label">Tardanza Inicio Almuerzo</div><div class="stat-box-value">${minutosATexto(Number(kpis.tardanza_inicio_almuerzo_minutos) || 0)}</div></div></div>
      </div>

      <div class="rrhh-reportes-grid-2">
        <div class="card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Horas y Tardanza por Área</h3>
          <div class="table-container"><table class="op-table"><thead><tr><th>ÁREA</th><th>HORAS</th><th>ASISTENCIA</th><th>T. TARDANZA</th><th>TARDANZAS</th></tr></thead><tbody>${filasDept}</tbody></table></div>
        </div>

        <div class="card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Top Empleados del Mes</h3>
          <div class="table-container"><table class="op-table"><thead><tr><th>EMPLEADO</th><th>ÁREA</th><th>ASISTENCIA</th><th>PUNTUALIDAD</th></tr></thead><tbody>${filasTop}</tbody></table></div>
        </div>
      </div>

      <div class="rrhh-chart-grid">
        <section class="rrhh-chart-card rrhh-span-7">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Horas trabajadas vs tardanza (${escapeHtml(vistaEl.value === 'diaria' ? 'diaria' : 'semanal')})</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Azul: tiempo trabajado (${vistaEl.value === 'diaria' ? 'minutos' : 'horas'}) (eje izquierdo). Naranja: tardanza (${vistaEl.value === 'diaria' ? 'minutos' : 'horas'}) (eje derecho).</p></div></div>
          <div class="rrhh-chart-wrap"><canvas id="rrhh-chart-horas-tardanza"></canvas></div>
        </section>

        <section class="rrhh-chart-card rrhh-span-5">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Distribución de estados</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Puntualidad, tardanza, faltas e incompletos del periodo.</p></div></div>
          <div class="rrhh-chart-wrap short"><canvas id="rrhh-chart-estados"></canvas></div>
        </section>

        <section class="rrhh-chart-card rrhh-span-6">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Comportamiento de almuerzo (${escapeHtml(vistaEl.value === 'diaria' ? 'diario' : 'semanal')})</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Celeste: almuerzo total. Naranja y rojo: exceso y tardanza de inicio.</p></div></div>
          <div class="rrhh-chart-wrap"><canvas id="rrhh-chart-almuerzo"></canvas></div>
        </section>

        <section class="rrhh-chart-card rrhh-span-6">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;"><div><h3 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Comparativo por área</h3><p style="margin:4px 0 0;color:#64748b;font-size:13px;">Barras azules: horas trabajadas. Línea naranja: tardanza (${vistaEl.value === 'diaria' ? 'minutos' : 'horas'}).</p></div></div>
          <div class="rrhh-chart-wrap"><canvas id="rrhh-chart-area"></canvas></div>
        </section>
      </div>

      <div class="rrhh-reportes-grid-bottom">
        <div class="card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Alertas de RRHH</h3>
          <div style="display: grid; gap: 10px;">${alertasHtml}</div>
        </div>

        <div class="card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Resumen de corte</h3>
          <div style="padding: 12px; border: 1px solid #dbeafe; background: #eff6ff; border-radius: 10px; color:#1e3a8a; font-size: 13px;">
            Periodo analizado: <strong>${escapeHtml(formatearMes(data.filtros.mes))}</strong><br>
            Área aplicada: <strong>${escapeHtml(data.filtros.area || 'Todos')}</strong><br>
            Datos usados: registros reales de asistencia y almuerzo almacenados en RRHH.
          </div>
        </div>
      </div>
    `;

    renderGraficosReportesRRHH(data, vistaEl.value === 'diaria' ? 'diaria' : 'semanal');
  } catch (err: any) {
    destruirGraficosRrhh();
    body.innerHTML = `
      <div style="text-align:center; padding: 48px 12px; color:#dc2626;">
        <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600;">No se pudo cargar el dashboard de reportes.</p>
        <p style="margin: 0 0 16px; color:#64748b;">${escapeHtml(err?.message || 'Error de conexión con el servidor')}</p>
        <button class="btn-primary" id="rrhh-reportes-reintentar">Reintentar</button>
      </div>
    `;
    document.getElementById('rrhh-reportes-reintentar')?.addEventListener('click', () => cargarReportesRRHH());
  }
}

function renderGraficosReportesRRHH(data: RrhhReporteDashboardResponse['data'], vista: 'semanal' | 'diaria') {
  const historialTrabajo = vista === 'diaria' ? data.historico_dias : data.historico_semanas;
  const labelsSemanas = historialTrabajo.map((s) => s.etiqueta);
  const trabajoSerie = historialTrabajo.map((s) => {
    const horas = Math.max(0, Number(s.horas || 0));
    return vista === 'diaria' ? Math.round(horas * 60) : horas;
  });
  const tardanzaSerie = historialTrabajo.map((s) => {
    const min = Math.max(0, Number(s.tardanza_minutos || 0));
    return vista === 'diaria' ? min : Number((min / 60).toFixed(2));
  });
  const trabajoLabel = vista === 'diaria' ? 'Tiempo trabajado (min)' : 'Horas trabajadas';
  const trabajoAxisTitle = vista === 'diaria' ? 'Tiempo trabajado (minutos)' : 'Horas trabajadas';
  const tardanzaLabel = vista === 'diaria' ? 'Tardanza (min)' : 'Tardanza (h)';
  const tardanzaAxisTitle = vista === 'diaria' ? 'Tardanza (minutos)' : 'Tardanza (horas)';
  const formatoTrabajo = (v: number) => vista === 'diaria'
    ? minutosATextoLargo(v)
    : horasDecimalesATextoLargo(v);
  const formatoTardanza = (v: number) => vista === 'diaria'
    ? minutosATextoLargo(v)
    : `${Number(v).toFixed(2)} h`;

  crearOGestionarGraficoRrhh('rrhh-chart-horas-tardanza', {
    type: 'bar',
    data: {
      labels: labelsSemanas,
      datasets: [
        {
          type: 'bar',
          label: trabajoLabel,
          data: trabajoSerie,
          backgroundColor: '#2c4a7c',
          borderColor: '#1e3a8a',
          borderWidth: 2,
          borderRadius: 10,
        },
        {
          type: 'line',
          label: tardanzaLabel,
          data: tardanzaSerie,
          borderColor: '#d97706',
          backgroundColor: 'rgba(217, 119, 6, .18)',
          tension: 0.35,
          fill: false,
          pointRadius: 3,
          pointBackgroundColor: '#d97706',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const value = Number(ctx.parsed.y ?? 0);
              if (ctx.dataset.label?.includes('Tardanza')) {
                return `${ctx.dataset.label}: ${formatoTardanza(value)}`;
              }
              return `${ctx.dataset.label}: ${formatoTrabajo(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: trabajoAxisTitle },
          ticks: {
            callback: (value: any) => vista === 'diaria' ? `${Math.round(Number(value))}` : Number(value).toFixed(2),
            precision: vista === 'diaria' ? 0 : 2,
            stepSize: vista === 'diaria' ? 1 : undefined,
          },
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: tardanzaAxisTitle },
          ticks: {
            callback: (value: any) => vista === 'diaria' ? `${Math.round(Number(value))}` : Number(value).toFixed(2),
            precision: vista === 'diaria' ? 0 : 2,
            stepSize: vista === 'diaria' ? 1 : undefined,
          },
        },
      },
    },
  });

  const almuerzoSeries = vista === 'diaria'
    ? (data.historico_almuerzo_dias || [])
    : (data.historico_almuerzo_semanas || []);
  const almuerzoTotal = almuerzoSeries.map((s) => Math.max(0, Number(s.almuerzo_minutos || 0)));
  const almuerzoExceso = almuerzoSeries.map((s) => Math.max(0, Number(s.exceso_almuerzo_minutos || 0)));
  const almuerzoTardanza = almuerzoSeries.map((s) => Math.max(0, Number(s.tardanza_inicio_almuerzo_minutos || 0)));

  crearOGestionarGraficoRrhh('rrhh-chart-almuerzo', {
    type: 'line',
    data: {
      labels: almuerzoSeries.map((s) => s.etiqueta),
      datasets: [
        {
          label: 'Almuerzo total (min)',
          data: almuerzoTotal,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, .14)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#0ea5e9',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Exceso almuerzo (min)',
          data: almuerzoExceso,
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, .14)',
          fill: false,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#ea580c',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          yAxisID: 'y1',
        },
        {
          label: 'Tardanza inicio almuerzo (min)',
          data: almuerzoTardanza,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, .1)',
          fill: false,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#dc2626',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const value = Number(ctx.parsed.y ?? 0);
              return `${ctx.dataset.label}: ${minutosATextoLargo(value)}`;
            },
          },
        },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Almuerzo total (min)' } },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Exceso / tardanza (min)' },
        },
      },
    },
  });

  const estados = data.distribucion_estados || [];
  const coloresEstados = estados.map((e) => {
    const estado = String(e.estado || '').toLowerCase();

    if (estado.includes('puntual') || estado.includes('a tiempo') || estado.includes('presente')) {
      return '#16a34a'; // Verde: a tiempo
    }

    if (estado.includes('tardanza') || estado.includes('tarde')) {
      return '#f59e0b'; // Amarillo: tardanza
    }

    if (estado.includes('falta') || estado.includes('ausente') || estado.includes('no marco') || estado.includes('no marc')) {
      return '#dc2626'; // Rojo: falta/no marcó
    }

    if (estado.includes('incompleto')) {
      return '#f97316';
    }

    return '#64748b';
  });

  crearOGestionarGraficoRrhh('rrhh-chart-estados', {
    type: 'doughnut',
    data: {
      labels: estados.map((e) => e.estado),
      datasets: [
        {
          data: estados.map((e) => Number(e.total || 0)),
          backgroundColor: coloresEstados,
          borderColor: coloresEstados,
          borderWidth: 5,
          borderAlign: 'center',
          spacing: 2,
          offset: estados.map(() => 4),
          hoverOffset: 7,
        },
      ],
    },
    options: {
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

  crearOGestionarGraficoRrhh('rrhh-chart-area', {
    type: 'bar',
    data: {
      labels: data.por_area.map((a) => a.area),
      datasets: [
        {
          label: 'Horas trabajadas',
          data: data.por_area.map((a) => Math.max(0, Number(a.horas || 0))),
          backgroundColor: '#1d4ed8',
          borderColor: '#1e40af',
          borderWidth: 2,
          borderRadius: 10,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: tardanzaLabel,
          data: data.por_area.map((a) => {
            const min = Math.max(0, Number(a.tardanza_minutos || 0));
            return vista === 'diaria' ? min : Number((min / 60).toFixed(2));
          }),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, .15)',
          tension: 0.35,
          fill: false,
          pointRadius: 3,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const value = Number(ctx.parsed.y ?? 0);
              if (ctx.dataset.label?.includes('Tardanza')) {
                return `${ctx.dataset.label}: ${formatoTardanza(value)}`;
              }
              return `${ctx.dataset.label}: ${formatoTrabajo(value)}`;
            },
          },
        },
      },
      scales: {
        x: { stacked: false },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Horas trabajadas' },
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: tardanzaAxisTitle },
          ticks: {
            callback: (value: any) => vista === 'diaria' ? `${Math.round(Number(value))}` : Number(value).toFixed(2),
            precision: vista === 'diaria' ? 0 : 2,
            stepSize: vista === 'diaria' ? 1 : undefined,
          },
        },
      },
    },
  });
}

// Tab: Marcar Asistencia (Personal Administrativo) - Conectado al backend
export function renderMarcarAsistenciaTab() {
  // Retorna un placeholder que se llena dinÃ¡micamente con datos del backend
  return `
    <div id="marcar-asistencia-container" style="max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: center; align-items: center; padding: 60px;">
        <div style="text-align: center; color: #64748b;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 12px; animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          <div>Cargando datos de asistencia...</div>
        </div>
      </div>
    </div>
    <style>
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(124, 179, 66, 0.4); }
        50% { box-shadow: 0 0 0 10px rgba(124, 179, 66, 0); }
      }
      .contador-activo { animation: pulseGlow 2s ease-in-out infinite; }
    </style>
  `;
}

/**
 * Carga datos reales del backend y renderiza el contenido del tab Marcar Asistencia
 */
export async function cargarMarcarAsistencia() {
  limpiarTimersAsistencia();
  
  const container = document.getElementById('marcar-asistencia-container');
  if (!container) return;

  try {
    const resp: MiEstadoResponse = await rrhhService.getMiEstado(getIdPersonalActual());
    if (!resp.success) throw new Error('Error al cargar estado');
    
    const { personal, horario, asistencia_hoy, semana, estadisticas, servidor_hora, servidor_fecha } = resp.data;
    const esDescanso = (resp.data as any).es_descanso === true;

    if (!horario && !esDescanso) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" style="margin-bottom: 16px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style="margin: 0 0 8px;">Sin Horario Asignado</h3>
          <p style="color: #64748b;">No tienes horario configurado para hoy. Contacta al administrador.</p>
        </div>
      `;
      return;
    }

    if (esDescanso) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 60px 40px;">
          <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #7CB342 0%, #558B2F 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M20 8v6"></path>
              <path d="M23 11h-6"></path>
            </svg>
          </div>
          <h2 style="margin: 0 0 12px; color: #1a2332; font-size: 24px;">¡Hoy es tu dí­a de descanso!</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 8px;">Disfruta tu día libre, ${personal.nombre.split(' ')[0]}</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">No necesitas marcar asistencia hoy.</p>
        </div>
      `;
      return;
    }

    // AquÃ­ horario estÃ¡ garantizado no-null (los casos null/descanso retornaron antes)
    const horarioSeguro = horario!;

    const fechaActual = new Date().toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const yaMarcoEntrada = asistencia_hoy && asistencia_hoy.entrada;
    const yaMarcoSalida = asistencia_hoy && asistencia_hoy.salida;
    const yaInicioAlmuerzo = asistencia_hoy && asistencia_hoy.hora_inicio_almuerzo;
    const yaFinAlmuerzo = asistencia_hoy && asistencia_hoy.hora_fin_almuerzo;

    // Construir HTML dinÃ¡mico
    container.innerHTML = `
      <!-- Banner de fecha y hora -->
      <div class="card" style="background: linear-gradient(135deg, #2c4a7c 0%, #1e3a5f 100%); color: white; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">
              ${fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)}
            </div>
            <div id="reloj-actual" style="font-size: 32px; font-weight: 700;">
              ${servidor_hora}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Personal Administrativo</div>
            <div style="font-size: 18px; font-weight: 600;">${personal.nombre}</div>
            <div style="font-size: 12px; opacity: 0.8;">${personal.codigo} - ${personal.area}</div>
          </div>
        </div>
      </div>

      <!-- Grid principal -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        
        <!-- Tarjeta Marcar Entrada/Salida -->
        <div class="card" style="text-align: center; padding: 40px;">
          <div style="margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #7CB342 0%, #689F38 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2v20M17 12H7"></path>
              </svg>
            </div>
            <h3 style="font-size: 20px; margin: 0 0 8px 0; color: #1a2332;">Marcar Asistencia</h3>
            <p style="color: #64748b; margin: 0;">Registra tu entrada o salida del día</p>
          </div>

          ${yaMarcoEntrada ? `
            <!-- Ya marcá entrada -->
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #0369a1; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span style="font-weight: 600;">Entrada Registrada</span>
              </div>
              <div style="font-size: 24px; font-weight: 700; color: #0c4a6e;">${asistencia_hoy!.entrada}</div>
              ${asistencia_hoy!.tardanza_minutos > 0 ? `
                <div style="color: #ea580c; font-size: 12px; margin-top: 4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  ${asistencia_hoy!.tardanza_minutos} minutos tarde
                </div>
              ` : ''}
            </div>

            <!-- Contador de horas trabajadas -->
            ${!yaMarcoSalida ? `
              <div id="contador-container" class="contador-activo" style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <div style="font-size: 12px; color: #15803d; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                   Horas Trabajadas
                </div>
                <div id="contador-horas" style="font-size: 36px; font-weight: 800; color: #166534; font-family: monospace; letter-spacing: 2px;">
                  00:00:00
                </div>
                <div style="font-size: 11px; color: #16a34a; margin-top: 4px;">Contando desde las ${asistencia_hoy!.entrada}...</div>
              </div>

              <!-- SecciÃ³n Almuerzo -->
              ${!yaInicioAlmuerzo ? `
                <button class="btn-primary" id="btnInicioAlmuerzo" style="width: 100%; padding: 14px; font-size: 15px; margin-bottom: 12px; background: linear-gradient(135deg, #f59e0b, #d97706);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Iniciar Almuerzo
                </button>
              ` : !yaFinAlmuerzo ? `
                <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 2px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #92400e; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    En Almuerzo
                  </div>
                  <div id="contador-almuerzo" style="font-size: 28px; font-weight: 800; color: #78350f; font-family: monospace; letter-spacing: 2px;">
                    00:00
                  </div>
                  <div style="font-size: 11px; color: #b45309; margin-top: 4px;">Desde las ${asistencia_hoy!.hora_inicio_almuerzo} (45 min permitidos)</div>
                </div>
                <button class="btn-primary" id="btnFinAlmuerzo" style="width: 100%; padding: 14px; font-size: 15px; margin-bottom: 12px; background: linear-gradient(135deg, #059669, #047857);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
                  Regresar de Almuerzo
                </button>
              ` : `
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 6px; color: #15803d; font-size: 13px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>Almuerzo: ${asistencia_hoy!.hora_inicio_almuerzo} - ${asistencia_hoy!.hora_fin_almuerzo}</span>
                    ${asistencia_hoy!.exceso_almuerzo_minutos > 0 ? `<span style="color: #ea580c; font-weight: 600;">(+${asistencia_hoy!.exceso_almuerzo_minutos} min exceso)</span>` : ''}
                  </div>
                </div>
              `}
            ` : ''}

            ${yaMarcoSalida ? `
              <!-- Ya marcÃ³ salida -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #15803d; margin-bottom: 8px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span style="font-weight: 600;">Salida Registrada</span>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: #14532d;">${asistencia_hoy!.salida}</div>
                <div style="font-size: 14px; color: #15803d; margin-top: 8px;">
                  Jornada: <strong>${asistencia_hoy!.horas_trabajadas} hrs</strong>
                  ${asistencia_hoy!.tiempo_extra_minutos > 0 ? ` | Tiempo extra: <strong style="color: #2563eb;">${Math.floor(asistencia_hoy!.tiempo_extra_minutos / 60)}h ${asistencia_hoy!.tiempo_extra_minutos % 60}m</strong>` : ''}
                </div>
              </div>
            ` : `
              <!-- Indicador de Horas Extra Asignadas -->
              ${asistencia_hoy!.horas_extra_asignadas ? `
                <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #93c5fd; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #1e40af; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Horas Extra Asignadas
                  </div>
                  <div id="contador-extra" style="font-size: 28px; font-weight: 800; color: #1e3a8a; font-family: monospace; letter-spacing: 2px;">
                    00:00
                  </div>
                  <div style="font-size: 11px; color: #3b82f6; margin-top: 4px;">
                    Contando desde las ${asistencia_hoy!.hora_inicio_extra ?? ''} — Al marcar salida se calculará automáticamente
                  </div>
                </div>
              ` : ''}

              <!-- Botón Marcar Salida -->
              <div id="btn-salida-wrapper">
                <button class="btn-primary" id="btnMarcarSalida" style="width: 100%; padding: 16px; font-size: 16px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Marcar Salida
                </button>
              </div>
            `}
          ` : `
            <!-- No ha marcado entrada -->
            <button class="btn-primary" id="btnMarcarEntrada" style="width: 100%; padding: 16px; font-size: 16px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Marcar Entrada
            </button>
          `}
        </div>

        <!-- Tarjeta Horario -->
        <div class="card">
          <h3 style="font-size: 18px; margin: 0 0 20px 0; color: #1a2332; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c4a7c" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Tu Horario de Hoy
          </h3>
          
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
              <div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Entrada Esperada</div>
                <div style="font-size: 24px; font-weight: 700; color: #1a2332;">${horarioSeguro.entrada}</div>
              </div>
              <div style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7CB342" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
              <div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Salida Esperada</div>
                <div style="font-size: 24px; font-weight: 700; color: #1a2332;">${horarioSeguro.salida}</div>
              </div>
              <div style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c4a7c" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
            </div>

            <div style="padding: 12px; background: #fffbeb; border: 1px solid #fde047; border-radius: 8px;">
              <div style="display: flex; gap: 8px; align-items: start;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div style="font-size: 12px; color: #854d0e;">
                  <strong>Tolerancia:</strong> ${horarioSeguro.tolerancia} minutos. Después se marca como tardanza.
                </div>
              </div>
            </div>

            ${yaMarcoEntrada && !yaMarcoSalida && asistencia_hoy?.estado ? `
              <div style="padding: 12px; background: ${asistencia_hoy.estado === 'Puntual' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${asistencia_hoy.estado === 'Puntual' ? '#bbf7d0' : '#fecaca'}; border-radius: 8px;">
                <div style="font-size: 13px; color: ${asistencia_hoy.estado === 'Puntual' ? '#15803d' : '#dc2626'}; font-weight: 600; text-align: center;">
                  Estado: ${asistencia_hoy.estado === 'Puntual' ? ' Puntual' : ' Tardanza (' + asistencia_hoy.tardanza_minutos + ' min)'}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Resumen de la semana -->
      <div class="card">
        <h3 style="font-size: 18px; margin: 0 0 20px 0; color: #1a2332;">Mi Asistencia - Esta Semana</h3>
        
        <div class="table-container">
          <table class="op-table">
            <thead>
              <tr>
                <th>DÍA</th>
                <th>FECHA</th>
                <th>ENTRADA</th>
                <th>SALIDA</th>
                <th>HORAS</th>
                <th>T. EXTRA</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              ${semana.length > 0 ? semana.map(s => `
                <tr style="${s.es_hoy ? 'background: #f0f9ff;' : ''}">
                  <td><strong>${s.dia}</strong></td>
                  <td>${s.fecha}</td>
                  <td><strong>${s.entrada}</strong></td>
                  <td>${s.salida}</td>
                  <td>${s.horas}</td>
                  <td>${s.tiempo_extra_minutos > 0 ? `<span style="color: #2563eb; font-weight: 600;">${Math.floor(s.tiempo_extra_minutos / 60)}h ${s.tiempo_extra_minutos % 60}m</span>` : '-'}</td>
                  <td><span class="status-indicator ${s.estado === 'Puntual' ? 'success' : s.estado === 'Tardanza' ? 'warning' : s.estado === 'Falta' ? 'danger' : 'warning'}">${s.estado}</span></td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">
                    No hay registros esta semana
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- EstadÃ­sticas rÃ¡pidas -->
        ${estadisticas ? `
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #7CB342; margin-bottom: 4px;">${estadisticas.total_horas}</div>
              <div style="font-size: 12px; color: #64748b;">Horas esta semana</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #2c4a7c; margin-bottom: 4px;">${estadisticas.dias_trabajados}</div>
              <div style="font-size: 12px; color: #64748b;">DÃ­as trabajados</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #ea580c; margin-bottom: 4px;">${estadisticas.tardanzas}</div>
              <div style="font-size: 12px; color: #64748b;">Tardanzas</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #7CB342; margin-bottom: 4px;">${estadisticas.puntualidad}%</div>
              <div style="font-size: 12px; color: #64748b;">Puntualidad</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">
                ${estadisticas.tiempo_extra_minutos > 0 ? Math.floor(estadisticas.tiempo_extra_minutos / 60) + 'h ' + (estadisticas.tiempo_extra_minutos % 60) + 'm' : '0'}
              </div>
              <div style="font-size: 12px; color: #64748b;">Tiempo extra</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Iniciar reloj en vivo
    iniciarRelojVivo();

    // Si marcá entrada pero no salida, iniciar contador de horas trabajadas
    if (yaMarcoEntrada && !yaMarcoSalida && asistencia_hoy?.hora_entrada_raw) {
      iniciarContadorHoras(asistencia_hoy.hora_entrada_raw, servidor_fecha);
    }

    // Si está en almuerzo, iniciar contador de almuerzo
    if (yaMarcoEntrada && !yaMarcoSalida && yaInicioAlmuerzo && !yaFinAlmuerzo && asistencia_hoy?.hora_inicio_almuerzo_raw) {
      iniciarContadorAlmuerzo(asistencia_hoy.hora_inicio_almuerzo_raw, servidor_fecha);
    }

    // Si tiene horas extra asignadas y aún no sale, iniciar contador extra
    if (yaMarcoEntrada && !yaMarcoSalida && asistencia_hoy?.horas_extra_asignadas && asistencia_hoy?.hora_inicio_extra_raw) {
      iniciarContadorExtra(asistencia_hoy.hora_inicio_extra_raw, servidor_fecha);
    }

    // Bind event listeners
    bindMarcarAsistenciaEvents();

  } catch (error) {
    console.error('Error cargando asistencia:', error);
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <div style="color: #dc2626; margin-bottom: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <h3 style="margin: 0 0 8px;">Error al cargar</h3>
        <p style="color: #64748b;">No se pudo conectar con el servidor. Intenta de nuevo.</p>
        <button class="btn-primary" id="btnReintentarAsistencia" style="margin-top: 16px;">Reintentar</button>
      </div>
    `;
    document.getElementById('btnReintentarAsistencia')?.addEventListener('click', () => cargarMarcarAsistencia());
  }
}

function iniciarRelojVivo() {
  const relojEl = document.getElementById('reloj-actual');
  if (!relojEl) return;
  
  const actualizarReloj = () => {
    const ahora = new Date();
    relojEl.textContent = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };
  actualizarReloj();
  
  // Reusar el intervalo del contador si existe, sino crear uno nuevo para el reloj
  setInterval(actualizarReloj, 1000);
}

/**
 * Inicia el contador basado en hora_entrada_raw del servidor.
 * CLAVE: Si cierran el navegador y vuelven, hora_entrada_raw viene del backend (BD),
 * asÃ­ que el contador se recalcula correctamente.
 */
function iniciarContadorHoras(horaEntradaRaw: string, servidorFecha: string) {
  const contadorEl = document.getElementById('contador-horas');
  if (!contadorEl) return;

  const actualizar = () => {
    const t = calcularTiempoTranscurrido(horaEntradaRaw, servidorFecha);
    contadorEl.textContent = formatContador(t.horas, t.minutos, t.segundos);
  };
  actualizar(); // inmediato
  contadorInterval = setInterval(actualizar, 1000);
}

async function handleMarcarEntrada() {
  const btn = document.getElementById('btnMarcarEntrada') as HTMLButtonElement;
  if (!btn) return;
  
  btn.disabled = true;
  btn.innerHTML = '<span>Registrando...</span>';

  try {
    const resp = await rrhhService.marcarEntrada(getIdPersonalActual());
    if (resp.success) {
      // Mostrar notificaciÃ³n
      mostrarNotificacionAsistencia(resp.message, resp.data?.estado === 'Puntual' ? 'success' : 'warning');
      // Recargar todo el tab
      setTimeout(() => cargarMarcarAsistencia(), 500);
    } else {
      mostrarNotificacionAsistencia(resp.message || 'Error al registrar entrada', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Marcar Entrada';
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Error de conexiÃ³n';
    mostrarNotificacionAsistencia(msg, 'error');
    btn.disabled = false;
    btn.innerHTML = 'Marcar Entrada';
  }
}

async function handleMarcarSalida() {
  const btn = document.getElementById('btnMarcarSalida') as HTMLButtonElement;
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = '<span>Registrando...</span>';

  try {
    const resp = await rrhhService.marcarSalida(getIdPersonalActual());
    if (resp.success) {
      limpiarTimersAsistencia();
      mostrarNotificacionAsistencia(resp.message, 'success');
      setTimeout(() => cargarMarcarAsistencia(), 500);
    } else {
      mostrarNotificacionAsistencia(resp.message || 'Error al registrar salida', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Marcar Salida';
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Error de conexiÃ³n';
    mostrarNotificacionAsistencia(msg, 'error');
    btn.disabled = false;
    btn.innerHTML = 'Marcar Salida';
  }
}

function iniciarContadorAlmuerzo(horaInicioAlmuerzoRaw: string, servidorFecha: string) {
  const contadorEl = document.getElementById('contador-almuerzo');
  if (!contadorEl) return;

  const actualizar = () => {
    const ahora = new Date();
    const inicio = new Date(`${servidorFecha}T${horaInicioAlmuerzoRaw}`);
    const diffMs = Math.max(0, ahora.getTime() - inicio.getTime());
    const transcurridoSeg = Math.floor(diffMs / 1000);
    const limiteSeg = 45 * 60;
    const restanteSeg = limiteSeg - transcurridoSeg;

    if (restanteSeg >= 0) {
      const min = Math.floor(restanteSeg / 60);
      const seg = restanteSeg % 60;
      contadorEl.textContent = `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
      contadorEl.style.color = '#78350f';
    } else {
      const excesoSeg = Math.abs(restanteSeg);
      const minExceso = Math.floor(excesoSeg / 60);
      const segExceso = excesoSeg % 60;
      contadorEl.textContent = `-${String(minExceso).padStart(2, '0')}:${String(segExceso).padStart(2, '0')}`;
      contadorEl.style.color = '#dc2626';
    }
  };
  actualizar();
  almuerzoInterval = setInterval(actualizar, 1000);
}

function iniciarContadorExtra(horaInicioExtraRaw: string, servidorFecha: string) {
  const contadorEl = document.getElementById('contador-extra');
  if (!contadorEl) return;

  const actualizar = () => {
    const ahora = new Date();
    const inicio = new Date(`${servidorFecha}T${horaInicioExtraRaw}`);
    const diffMs = ahora.getTime() - inicio.getTime();
    if (diffMs < 0) {
      contadorEl.textContent = 'Pendiente';
      return;
    }
    const totalMin = Math.floor(diffMs / 60000);
    const seg = Math.floor((diffMs % 60000) / 1000);
    const hrs = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    contadorEl.textContent = hrs > 0
      ? `${String(hrs).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
      : `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
  };
  actualizar();
  extraInterval = setInterval(actualizar, 1000);
}

async function handleInicioAlmuerzo() {
  const btn = document.getElementById('btnInicioAlmuerzo') as HTMLButtonElement;
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = '<span>Registrando...</span>';

  try {
    const resp = await rrhhService.marcarInicioAlmuerzo(getIdPersonalActual());
    if (resp.success) {
      mostrarNotificacionAsistencia(resp.message, 'success');
      setTimeout(() => cargarMarcarAsistencia(), 500);
    } else {
      mostrarNotificacionAsistencia(resp.message || 'Error al registrar inicio de almuerzo', 'error');
      btn.disabled = false;
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Iniciar Almuerzo';
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Error de conexiÃ³n';
    mostrarNotificacionAsistencia(msg, 'error');
    btn.disabled = false;
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Iniciar Almuerzo';
  }
}

async function handleFinAlmuerzo() {
  const btn = document.getElementById('btnFinAlmuerzo') as HTMLButtonElement;
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = '<span>Registrando...</span>';

  try {
    const resp = await rrhhService.marcarFinAlmuerzo(getIdPersonalActual());
    if (resp.success) {
      if (almuerzoInterval) { clearInterval(almuerzoInterval); almuerzoInterval = null; }
      mostrarNotificacionAsistencia(resp.message, resp.data?.exceso_almuerzo_minutos > 0 ? 'warning' : 'success');
      setTimeout(() => cargarMarcarAsistencia(), 500);
    } else {
      mostrarNotificacionAsistencia(resp.message || 'Error al registrar fin de almuerzo', 'error');
      btn.disabled = false;
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg> Regresar de Almuerzo';
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Error de conexiÃ³n';
    mostrarNotificacionAsistencia(msg, 'error');
    btn.disabled = false;
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 6px;"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg> Regresar de Almuerzo';
  }
}

function bindMarcarAsistenciaEvents() {
  document.getElementById('btnMarcarEntrada')?.addEventListener('click', handleMarcarEntrada);
  document.getElementById('btnMarcarSalida')?.addEventListener('click', handleMarcarSalida);
  document.getElementById('btnInicioAlmuerzo')?.addEventListener('click', handleInicioAlmuerzo);
  document.getElementById('btnFinAlmuerzo')?.addEventListener('click', handleFinAlmuerzo);
}

function mostrarNotificacionAsistencia(mensaje: string, tipo: 'success' | 'warning' | 'error') {
  const colores = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
    warning: { bg: '#fffbeb', border: '#fde047', text: '#854d0e' },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  };
  const c = colores[tipo];
  
  // Remover notificaciÃ³n anterior
  document.getElementById('asistencia-notif')?.remove();
  
  const notif = document.createElement('div');
  notif.id = 'asistencia-notif';
  notif.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 10000; background: ${c.bg}; border: 2px solid ${c.border}; color: ${c.text}; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); max-width: 400px; transition: opacity 0.3s;`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// ===== TAB HORARIOS =====

export function renderHorariosTab() {
  return `
    <div id="horarios-container">
      <div style="text-align: center; padding: 40px;">
        <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="color: #64748b;">Cargando horarios...</p>
      </div>
    </div>
  `;
}

let listaEmpleadosHorarios: EmpleadoHorarioResumen[] = [];

export async function cargarHorarios() {
  const container = document.getElementById('horarios-container');
  if (!container) return;

  try {
    const resp = await rrhhService.getHorarios();
    if (!resp.success) throw new Error('Error al cargar horarios');
    listaEmpleadosHorarios = resp.data;

    const completos = listaEmpleadosHorarios.filter(e => e.estado === 'Completo').length;
    const parciales = listaEmpleadosHorarios.filter(e => e.estado === 'Parcial').length;
    const pendientes = listaEmpleadosHorarios.filter(e => e.estado === 'Pendiente').length;

    container.innerHTML = `
      <!-- Resumen -->
      <div class="stat-boxes" style="margin-bottom: 24px;">
        <div class="stat-box">
          <div class="stat-box-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Completos</div>
            <div class="stat-box-value">${completos}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Parciales</div>
            <div class="stat-box-value">${parciales}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Pendientes</div>
            <div class="stat-box-value">${pendientes}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Total</div>
            <div class="stat-box-value">${listaEmpleadosHorarios.length}</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="search-filter-bar" style="margin-bottom: 16px;">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input type="text" placeholder="Buscar empleado..." class="search-input" id="horarios-search">
        </div>
        <select class="op-filter-select" id="horarios-filter-estado">
          <option value="">Todos los estados</option>
          <option value="Completo">Completo</option>
          <option value="Parcial">Parcial</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>EMPLEADO</th>
              <th>ÁREA</th>
              <th>DÍAS LABORALES</th>
              <th>DÍAS DESCANSO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody id="horarios-tbody">
            ${renderFilasHorarios(listaEmpleadosHorarios)}
          </tbody>
        </table>
      </div>
    `;

    // Event listeners
    initHorariosEvents();

  } catch (err) {
    console.error('Error cargando horarios:', err);
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="margin-bottom: 16px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <h3 style="margin: 0 0 8px; color: #dc2626;">Error al cargar horarios</h3>
        <p style="color: #64748b;">Verifica tu conexiÃ³n e intenta nuevamente.</p>
        <button class="btn-primary" style="margin-top: 16px;" onclick="document.querySelector('[data-tab=horarios]')?.click()">Reintentar</button>
      </div>
    `;
  }
}

function renderFilasHorarios(empleados: EmpleadoHorarioResumen[]): string {
  if (empleados.length === 0) {
    return `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">No se encontraron empleados</td></tr>`;
  }
  return empleados.map(e => {
    const estadoClass = e.estado === 'Completo' ? 'success' : e.estado === 'Parcial' ? 'warning' : 'danger';
    return `
      <tr>
        <td>
          <div class="equipment-info">
            <div class="equipment-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div class="equipment-name">${e.nombre}</div>
              <div class="equipment-id">${e.correo || 'Sin correo'}</div>
            </div>
          </div>
        </td>
        <td><span class="badge">${e.area}</span></td>
        <td style="text-align: center; font-weight: 600;">${e.dias_laborales}</td>
        <td style="text-align: center; font-weight: 600;">${e.dias_descanso}</td>
        <td><span class="status-indicator ${estadoClass}">${e.estado}</span></td>
        <td>
          <div class="op-action-buttons">
            <button class="op-btn-icon btn-editar-horario" data-id="${e.id}" title="Editar horario">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
            <button class="op-btn-icon btn-copiar-horario" data-id="${e.id}" title="Copiar horario de otro empleado">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initHorariosEvents() {
  // Buscar
  const searchInput = document.getElementById('horarios-search') as HTMLInputElement;
  const filterEstado = document.getElementById('horarios-filter-estado') as HTMLSelectElement;

  const filtrar = () => {
    const texto = (searchInput?.value || '').toLowerCase();
    const estado = filterEstado?.value || '';
    const filtrados = listaEmpleadosHorarios.filter(e => {
      const matchTexto = !texto || e.nombre.toLowerCase().includes(texto) || e.area.toLowerCase().includes(texto);
      const matchEstado = !estado || e.estado === estado;
      return matchTexto && matchEstado;
    });
    const tbody = document.getElementById('horarios-tbody');
    if (tbody) tbody.innerHTML = renderFilasHorarios(filtrados);
    // Re-bind editar/copiar buttons
    bindHorariosAccionButtons();
  };

  searchInput?.addEventListener('input', filtrar);
  filterEstado?.addEventListener('change', filtrar);

  bindHorariosAccionButtons();
}

function bindHorariosAccionButtons() {
  // Editar horario
  document.querySelectorAll('.btn-editar-horario').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      if (id) await abrirModalHorario(id);
    });
  });

  // Copiar horario
  document.querySelectorAll('.btn-copiar-horario').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      if (id) abrirModalCopiarHorario(id);
    });
  });
}

async function abrirModalHorario(idPersonal: number) {
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.id = 'modal-horario-overlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;';

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 32px; width: 700px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="text-align: center; padding: 20px;">
        <div class="spinner" style="margin: 0 auto 16px; width: 36px; height: 36px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="color: #64748b;">Cargando horario...</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  try {
    const resp = await rrhhService.getHorarioPersonal(idPersonal);
    if (!resp.success) throw new Error('Error');

    const { personal, horarios } = resp.data;

    const modalContent = overlay.querySelector('div > div') || overlay.firstElementChild!;
    (modalContent as HTMLElement).innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="margin: 0 0 4px; color: #1a2332; font-size: 20px;">Horario Semanal</h2>
        </div>
        <button id="modal-horario-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;" id="horario-dias-form">
        ${horarios.map((d: DiaHorario) => `
          <div class="horario-dia-row" data-dia="${d.dia_semana}" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: ${d.es_descanso ? '#f0fdf4' : '#f8fafc'}; border-radius: 10px; border: 1px solid ${d.es_descanso ? '#bbf7d0' : '#e2e8f0'};">
            <div style="width: 100px; font-weight: 600; font-size: 14px; color: #1a2332;">${d.dia_semana}</div>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; min-width: 110px;">
              <input type="checkbox" class="horario-descanso-check" ${d.es_descanso ? 'checked' : ''} style="accent-color: #7CB342; width: 18px; height: 18px;">
              <span style="font-size: 13px; color: ${d.es_descanso ? '#15803d' : '#64748b'};">Descanso</span>
            </label>
            <div class="horario-horas" style="display: flex; align-items: center; gap: 8px; ${d.es_descanso ? 'opacity: 0.3; pointer-events: none;' : ''}">
              <label style="font-size: 12px; color: #64748b;">Entrada:</label>
              <input type="time" class="horario-entrada" value="${d.hora_entrada || '08:00'}" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
              <label style="font-size: 12px; color: #64748b;">Salida:</label>
              <input type="time" class="horario-salida" value="${d.hora_salida || '17:00'}" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
              <label style="font-size: 12px; color: #64748b;">Tolerancia:</label>
              <input type="number" class="horario-tolerancia" value="${d.tolerancia}" min="0" max="60" style="padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; width: 60px;">
              <span style="font-size: 11px; color: #94a3b8;">min</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button id="modal-horario-cancel" class="btn-secondary" style="padding: 10px 24px;">Cancelar</button>
        <button id="modal-horario-save" class="btn-primary" style="padding: 10px 24px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Guardar Horario
        </button>
      </div>
    `;

    // Toggle descanso
    overlay.querySelectorAll('.horario-dia-row').forEach(row => {
      const check = row.querySelector('.horario-descanso-check') as HTMLInputElement;
      const horasDiv = row.querySelector('.horario-horas') as HTMLElement;
      const label = check?.parentElement?.querySelector('span') as HTMLElement;

      check?.addEventListener('change', () => {
        if (check.checked) {
          horasDiv.style.opacity = '0.3';
          horasDiv.style.pointerEvents = 'none';
          (row as HTMLElement).style.background = '#f0fdf4';
          (row as HTMLElement).style.borderColor = '#bbf7d0';
          if (label) { label.style.color = '#15803d'; }
        } else {
          horasDiv.style.opacity = '1';
          horasDiv.style.pointerEvents = 'auto';
          (row as HTMLElement).style.background = '#f8fafc';
          (row as HTMLElement).style.borderColor = '#e2e8f0';
          if (label) { label.style.color = '#64748b'; }
        }
      });
    });

    // Close
    overlay.querySelector('#modal-horario-close')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#modal-horario-cancel')?.addEventListener('click', () => overlay.remove());

    // Save
    overlay.querySelector('#modal-horario-save')?.addEventListener('click', async () => {
      const rows = overlay.querySelectorAll('.horario-dia-row');
      const dias: Array<{ dia_semana: string; hora_entrada: string | null; hora_salida: string | null; tolerancia: number; es_descanso: boolean }> = [];

      rows.forEach(row => {
        const diaSemana = (row as HTMLElement).dataset.dia || '';
        const esDescanso = (row.querySelector('.horario-descanso-check') as HTMLInputElement).checked;
        const entrada = (row.querySelector('.horario-entrada') as HTMLInputElement).value;
        const salida = (row.querySelector('.horario-salida') as HTMLInputElement).value;
        const tolerancia = parseInt((row.querySelector('.horario-tolerancia') as HTMLInputElement).value) || 10;

        dias.push({
          dia_semana: diaSemana,
          hora_entrada: esDescanso ? null : entrada,
          hora_salida: esDescanso ? null : salida,
          tolerancia,
          es_descanso: esDescanso,
        });
      });

      const saveBtn = overlay.querySelector('#modal-horario-save') as HTMLButtonElement;
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Guardando...';

      try {
        const result = await rrhhService.guardarHorario(idPersonal, dias);
        if (result.success) {
          mostrarNotificacionAsistencia(result.message, 'success');
          overlay.remove();
          await cargarHorarios(); // Recargar tabla
        } else {
          mostrarNotificacionAsistencia(result.message || 'Error al guardar', 'error');
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Guardar Horario';
        }
      } catch (err: any) {
        mostrarNotificacionAsistencia(err?.data?.message || 'Error al guardar horario', 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Guardar Horario';
      }
    });

  } catch (err) {
    overlay.remove();
    mostrarNotificacionAsistencia('Error al cargar horario del empleado', 'error');
  }
}

function abrirModalCopiarHorario(idPersonalDestino: number) {
  const destino = listaEmpleadosHorarios.find(e => e.id === idPersonalDestino);
  if (!destino) return;

  // Solo mostrar empleados con horario completo como origen
  const disponibles = listaEmpleadosHorarios.filter(e => e.id !== idPersonalDestino && e.estado === 'Completo');

  const overlay = document.createElement('div');
  overlay.id = 'modal-copiar-overlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;';

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 32px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0 0 4px; color: #1a2332; font-size: 18px;">Copiar Horario</h2>
          <p style="margin: 0; color: #64748b; font-size: 13px;">Destino: ${destino.nombre}</p>
        </div>
        <button id="modal-copiar-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      ${disponibles.length === 0 ? `
        <div style="text-align: center; padding: 20px; color: #64748b;">
          <p>No hay empleados con horario completo para copiar.</p>
        </div>
      ` : `
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px;">Copiar horario de:</label>
          <select id="copiar-origen-select" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 14px;">
            ${disponibles.map(e => `<option value="${e.id}">${e.nombre} (${e.area})” ${e.dias_laborales} lab / ${e.dias_descanso} desc</option>`).join('')}
          </select>
        </div>
        <p style="font-size: 12px; color: #ea580c; margin-bottom: 20px;">Esto reemplazará el horario actual de ${destino.nombre.split(' ')[0]}.</p>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button id="modal-copiar-cancel" class="btn-secondary" style="padding: 10px 24px;">Cancelar</button>
          <button id="modal-copiar-confirm" class="btn-primary" style="padding: 10px 24px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copiar
          </button>
        </div>
      `}
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#modal-copiar-close')?.addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-copiar-cancel')?.addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-copiar-confirm')?.addEventListener('click', async () => {
    const select = document.getElementById('copiar-origen-select') as HTMLSelectElement;
    const idOrigen = parseInt(select?.value || '0');
    if (!idOrigen) return;

    const confirmBtn = overlay.querySelector('#modal-copiar-confirm') as HTMLButtonElement;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = 'Copiando...';

    try {
      const result = await rrhhService.copiarHorario(idPersonalDestino, idOrigen);
      if (result.success) {
        mostrarNotificacionAsistencia(result.message, 'success');
        overlay.remove();
        await cargarHorarios();
      } else {
        mostrarNotificacionAsistencia(result.message || 'Error al copiar', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Copiar';
      }
    } catch (err: any) {
      mostrarNotificacionAsistencia(err?.data?.message || 'Error al copiar horario', 'error');
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = 'Copiar';
    }
  });
}

export function renderRecursosHumanos() {
  const tabsPermitidos = getTabsRecursosHumanosPermitidos();
  const tabLabels: Record<string, string> = {
    asistencia: 'Asistencia',
    marcar: 'Marcar Asistencia',
    horarios: 'Horarios',
    tecnicos: 'Técnicos',
    reportes: 'Reportes',
  };

  const tabInicial = tabsPermitidos.includes('asistencia') ? 'asistencia' : tabsPermitidos[0] || 'asistencia';
  const contenidoInicial = tieneAccesoCompletoRecursosHumanos() ? renderAsistenciaTab() : renderAsistenciaPersonalTab();

  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Recursos Humanos</div>
      <div class="page-actions">
        
      </div>
    </div>

    <div class="inventory-tabs">
      ${tabsPermitidos.map((tab) => `
        <button class="tab-btn ${tab === tabInicial ? 'active' : ''}" data-tab="${tab}">${tabLabels[tab] ?? tab}</button>
      `).join('')}
    </div>

    <div id="recursos-tab-content">
      ${contenidoInicial}
    </div>
  `;
}
