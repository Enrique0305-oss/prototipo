import * as ExcelJS from 'exceljs';
import { mostrarToast } from '../../shared/toast';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function getAuthHeaders(): Record<string, string> {
    const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
    return {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
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

function formatearFechaExcel(fecha: string | null | undefined): string {
    if (!fecha) return '---';

    const texto = String(fecha).trim();
    if (!texto) return '---';

    const base = texto.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(base)) {
        const [anio, mes, dia] = base.split('-');
        return `${dia}/${mes}/${anio}`;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(base)) {
        return base;
    }

    return base;
}

function formatearMontoExcel(valor: any): string {
    return `S/ ${Number(valor || 0).toFixed(2)}`;
}

function obtenerServiciosExportacion(proyeccion: any): Array<{ nombre: string; frecuencia: string }> {
    const servicios = Array.isArray(proyeccion?.servicios_detallados) ? proyeccion.servicios_detallados : [];

    if (servicios.length > 0) {
        return servicios.map((servicio: any) => ({
            nombre: servicio?.nombre || '---',
            frecuencia: servicio?.frecuencia || '---',
        }));
    }

    const referencia = proyeccion?.orden_servicio || proyeccion?.orden_producto || proyeccion?.orden_capacitacion || proyeccion?.orden_auditoria || proyeccion?.orden_asesoria || {};
    const nombreServicio = referencia?.servicio?.nombre || referencia?.servicio || '---';
    const frecuencia = referencia?.frecuencia || referencia?.modalidad || '---';

    return [{ nombre: nombreServicio, frecuencia }];
}

function crearNombreArchivoExcelProyecciones(mes: string, anio: string, empresa: string): string {
    const empresaLimpia = (empresa || 'todas').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    return `proyecciones_${anio}_${String(mes).padStart(2, '0')}_${empresaLimpia}.xlsx`;
}

function aplicarEstiloEncabezadoExcel(row: ExcelJS.Row): void {
    row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2C4A7C' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: 'CBD5E1' } },
            left: { style: 'thin', color: { argb: 'CBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
            right: { style: 'thin', color: { argb: 'CBD5E1' } },
        };
    });
}

async function exportarProyeccionesExcel(proyecciones: any[] = []): Promise<void> {
    if (!Array.isArray(proyecciones) || proyecciones.length === 0) {
        mostrarToast('warning', 'Atención', 'No hay proyecciones para exportar');
        return;
    }

    const mesSeleccionado = (document.getElementById('selector-mes') as HTMLSelectElement | null)?.value || String((window as any).mesActual || new Date().getMonth() + 1);
    const empresaSeleccionada = (document.getElementById('selector-empresa') as HTMLSelectElement | null)?.selectedOptions?.[0]?.text || 'todas';

    const filas = proyecciones.flatMap((proyeccion) => {
        const referencia = proyeccion?.orden_servicio || proyeccion?.orden_producto || proyeccion?.orden_capacitacion || proyeccion?.orden_auditoria || proyeccion?.orden_asesoria || {};
        const servicios = obtenerServiciosExportacion(proyeccion);

        return servicios.map((servicio) => ({
            actividad: proyeccion?.actividad || '---',
            empresa: proyeccion?.multicim_emisora?.alias_empresa || '---',
            cliente: referencia?.cliente?.nombre_empresa || referencia?.cliente?.nombre_comercial || '---',
            servicio: servicio.nombre,
            frecuencia: servicio.frecuencia,
            fechaEjecucion: formatearFechaExcel(proyeccion?.fecha_ejecucion),
            subtotal: formatearMontoExcel(referencia?.subtotal),
            igv: formatearMontoExcel(referencia?.igv),
            totalOs: formatearMontoExcel(referencia?.precio_total_os || referencia?.total_costo || referencia?.total),
            nFactura: proyeccion?.n_factura || '---',
            detraccion: formatearMontoExcel(proyeccion?.monto_detrax),
            totalNeto: formatearMontoExcel(proyeccion?.total_final),
            fechaFactura: formatearFechaExcel(proyeccion?.fecha_factura),
            diasCredito: proyeccion?.dias_credito ?? 0,
            fechaVcto: formatearFechaExcel(proyeccion?.fecha_vcto),
            diasVencer: proyeccion?.dia_vencer ?? 0,
            fechaPago: formatearFechaExcel(proyeccion?.fecha_pago),
        }));
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QSCI Group';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Proyecciones');
    sheet.addRow(['REPORTE DE PROYECCIONES']);
    sheet.mergeCells(1, 1, 1, 17);
    const titulo = sheet.getRow(1);
    titulo.height = 24;
    titulo.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
    titulo.alignment = { horizontal: 'center', vertical: 'middle' };
    titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };

    sheet.addRow(['Periodo', mesSeleccionado]);
    sheet.addRow(['Empresa', empresaSeleccionada]);
    sheet.addRow(['Total de registros', filas.length]);
    sheet.addRow([]);

    const encabezado = sheet.addRow([
        'ACTIVIDAD',
        'EMPRESA',
        'CLIENTE',
        'SERVICIO',
        'FRECUENCIA',
        'FECHA EJECUCION',
        'SUBTOTAL',
        'IGV',
        'TOTAL OS',
        'N° FACTURA',
        'DETRACCION',
        'TOTAL NETO',
        'FECHA FACTURA',
        'DIAS CREDITO',
        'FECHA VCTO FACTURA',
        'DIAS VENCER',
        'FECHA PAGO',
    ]);
    aplicarEstiloEncabezadoExcel(encabezado);

    filas.forEach((fila) => {
        const row = sheet.addRow([
            fila.actividad,
            fila.empresa,
            fila.cliente,
            fila.servicio,
            fila.frecuencia,
            fila.fechaEjecucion,
            fila.subtotal,
            fila.igv,
            fila.totalOs,
            fila.nFactura,
            fila.detraccion,
            fila.totalNeto,
            fila.fechaFactura,
            fila.diasCredito,
            fila.fechaVcto,
            fila.diasVencer,
            fila.fechaPago,
        ]);

        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'D1D5DB' } },
                left: { style: 'thin', color: { argb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
                right: { style: 'thin', color: { argb: 'D1D5DB' } },
            };
            cell.alignment = { vertical: 'middle', wrapText: true };
        });
    });

    sheet.getColumn(1).width = 20;
    sheet.getColumn(2).width = 18;
    sheet.getColumn(3).width = 28;
    sheet.getColumn(4).width = 28;
    sheet.getColumn(5).width = 18;
    sheet.getColumn(6).width = 16;
    sheet.getColumn(7).width = 12;
    sheet.getColumn(8).width = 12;
    sheet.getColumn(9).width = 14;
    sheet.getColumn(10).width = 16;
    sheet.getColumn(11).width = 14;
    sheet.getColumn(12).width = 14;
    sheet.getColumn(13).width = 16;
    sheet.getColumn(14).width = 12;
    sheet.getColumn(15).width = 18;
    sheet.getColumn(16).width = 12;
    sheet.getColumn(17).width = 14;
    sheet.views = [{ state: 'frozen', ySplit: 5 }];

    const buffer = await workbook.xlsx.writeBuffer();
    descargarExcelBuffer(buffer as ArrayBuffer, crearNombreArchivoExcelProyecciones(mesSeleccionado, String((window as any).anioActual || new Date().getFullYear()), empresaSeleccionada));
}

// --- ALERTA DE ÓRDENES PENDIENTES ---
function renderAlertaOrdenesPendientes(ordenesPendientes: any = {}) {
    const total = ordenesPendientes.total || 0;

    if (total === 0) {
        return '';
    }

    const cantidadProducto = (ordenesPendientes.productos || []).length;
    const cantidadCapacitacion = (ordenesPendientes.capacitaciones || []).length;
    const cantidadAuditoria = (ordenesPendientes.auditorias || []).length;
    const cantidadAsesoria = (ordenesPendientes.asesorias || []).length;

    let textoDetalle = [];
    if (cantidadProducto > 0) textoDetalle.push(`${cantidadProducto} Orden(es) de Producto`);
    if (cantidadCapacitacion > 0) textoDetalle.push(`${cantidadCapacitacion} Orden(es) de Capacitación`);
    if (cantidadAuditoria > 0) textoDetalle.push(`${cantidadAuditoria} Orden(es) de Auditoría`);
    if (cantidadAsesoria > 0) textoDetalle.push(`${cantidadAsesoria} Orden(es) de Asesoría`);

    return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 16px 20px; 
                border-radius: 8px; 
                margin-bottom: 24px; 
                border-left: 5px solid #f093fb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="font-size: 32px;">📋</div>
        <div>
          <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">Órdenes Pendientes de Registrar</div>
          <div style="font-size: 13px; opacity: 0.95;">${textoDetalle.join(' • ')}</div>
        </div>
      </div>
      <button id="btn-ver-pendientes" style="background: rgba(255,255,255,0.2); 
                                              color: white; 
                                              border: 1px solid rgba(255,255,255,0.5); 
                                              padding: 10px 20px; 
                                              border-radius: 6px; 
                                              cursor: pointer; 
                                              font-weight: 600;
                                              font-size: 13px;
                                              transition: all 0.3s ease;">
        Ver Pendientes →
      </button>
    </div>
  `;
}

// --- MODAL DE NUEVA FACTURA ---
function renderModalFactura() {
    return `
  <div id="modal-factura" class="modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); overflow-y: auto;">
      <div class="modal-content" style="background:#fff; margin:3% auto; width:900px; border-radius:12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; background: #f8fafc; padding:15px 25px; border-bottom:1px solid #e2e8f0;">
              <h3 style="margin:0; color: #1e293b; font-size: 1.25rem; font-weight: 700;">Nueva Proyección de Factura</h3>
              <button id="btn-cerrar-modal" style="background:none; border:none; font-size:28px; cursor:pointer; color: #94a3b8; line-height:1;">&times;</button>
          </div>

          <div class="modal-body" style="padding:25px;">
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:25px; padding:20px; background:#f1f5f9; border-radius:8px; border: 1px solid #e2e8f0;">
                  <div>
                      <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:8px;">1. Tipo de Orden</label>
                      <select id="modal-tipo-orden" style="width:100%; padding:10px; border-radius:6px; border:1px solid #cbd5e1; outline:none; focus:border-blue-500;">
                          <option value="">-- Seleccione Tipo --</option>
                          <option value="producto">Orden de Producto</option>
                          <option value="capacitacion">Orden de Capacitación</option>
                          <option value="auditoria">Orden de Auditoría</option>
                          <option value="asesoria">Orden de Asesoría</option>
                      </select>
                  </div>
                  <div>
                      <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:8px;">2. Seleccionar Número de Orden</label>
                      <select id="modal-select-orden" style="width:100%; padding:10px; border-radius:6px; border:1px solid #cbd5e1; background:white;" disabled>
                          <option value="">-- Primero elija tipo --</option>
                      </select>
                  </div>
              </div>

              <form id="form-nueva-factura" style="display:none;">
                  <h4 style="margin:0 0 15px 0; color: #334155; font-size: 15px; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 4px;">Información General</h4>

            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:25px;">
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Actividad</label>
                    <input type="text" id="in-actividad" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; outline-color:#3b82f6;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Empresa (Emisor)</label>
                    <select id="res-alias" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:white; font-weight:bold; color:#1e293b;">
                        <option value="2">MULTI</option>
                        <option value="1">CIM</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Estado</label>
                    <select id="in-estado" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:white; font-weight:bold; color:#1e293b;">
                        <option value="Sin Factura">Sin Factura</option>
                        <option value="Pendiente de pago">Pendiente de pago</option>
                        <option value="Pagado">Pagado</option>
                        <option value="Anulado">Anulado</option>
                    </select>
                </div>

                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Cliente</label>
                    <input type="text" id="res-cliente" readonly style="width:100%; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; color:#64748b;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Cotización / OC</label>
                    <input type="text" id="in-cotizacion-oc" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                </div>
                <div style="grid-column: 1 / -1;">
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:8px;">Servicios/Productos y Frecuencias</label>
                    <div style="border:1px solid #bae6fd; border-radius:8px; overflow:hidden; background:#ffffff;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f0f9ff; border-bottom:2px solid #bae6fd;">
                                    <th style="padding:10px 12px; text-align:left; font-size:12px; font-weight:600; color:#0c4a6e;">Servicio/Producto</th>
                                    <th style="padding:10px 12px; text-align:center; font-size:12px; font-weight:600; color:#0c4a6e; width:200px;">Frecuencia</th>
                                </tr>
                            </thead>
                            <tbody id="res-servicios-tabla">
                                <tr>
                                    <td colspan="2" style="padding:20px; text-align:center; color:#94a3b8;">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

                  <h4 style="margin:0 0 15px 0; color: #334155; font-size: 15px; border-bottom: 2px solid #10b981; display: inline-block; padding-bottom: 4px;">Datos de Facturación</h4>
                  
                  <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:25px; padding:15px; border: 1px solid #10b981; border-radius:8px;">
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Ejecución</label>
                          <input type="date" id="in-fecha-ejecucion"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">N° de Factura</label>
                          <input type="text" id="in-num-factura" placeholder="F001-000000"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px; outline-color:#10b981;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Factura</label>
                          <input type="date" id="in-fecha-factura"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Días Crédito</label>
                          <input type="number" id="in-dias-credito" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Vcto Factura</label>
                          <input type="date" id="in-fecha-vcto"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Días Vencer</label>
                          <input type="number" id="in-dias-vencer" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Pago</label>
                          <input type="date" id="in-fecha-pago"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                  </div>

                  <div style="display:flex; justify-content: space-between; gap:20px; margin-bottom:15px; padding:10px 20px; background:#f8fafc; border-radius:8px; border: 1px dashed #cbd5e1;">
                      <div style="text-align:left;">
                          <span style="display:block; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Base Imponible OS</span>
                          <span style="font-size:14px; font-weight:600; color:#334155;">S/ <span id="info-subtotal">0.00</span></span>
                      </div>
                      <div style="text-align:left;">
                          <span style="display:block; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">IGV (18%)</span>
                          <span style="font-size:14px; font-weight:600; color:#334155;">S/ <span id="info-igv">0.00</span></span>
                      </div>
                      <div style="text-align:left;">
                          <span style="display:block; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Total OS</span>
                          <span style="font-size:14px; font-weight:700; color:#1e293b;">S/ <span id="info-total-os">0.00</span></span>
                      </div>
                  </div>

                  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; display: flex; justify-content: space-around; align-items: center;">
                        <div style="text-align:center;">
                            <span style="display:block; font-size:11px; color:#1e40af; font-weight:700; text-transform:uppercase;">Base Imponible</span>
                            <input type="number" step="0.01" id="in-base-imponible" style="width:100%; max-width:120px; margin-top:5px; padding:8px; border:1px solid #bfdbfe; border-radius:6px; font-weight:bold; color:#1e3a8a; text-align:center;">
                        </div>
                        <div style="text-align:center;">
                            <span style="display:block; font-size:11px; color:#1e40af; font-weight:700; text-transform:uppercase;">Detracción (12%)</span>
                            <span style="font-size:16px; font-weight:bold; color:#dc2626;">- S/ <span id="res-detrax">0.00</span></span>
                        </div>
                        <div style="text-align:center; background: white; padding: 10px 20px; border-radius: 8px; border: 2px solid #1e40af;">
                            <span style="display:block; font-size:11px; color:#1e40af; font-weight:700; text-transform:uppercase;">Neto a Cobrar</span>
                            <span style="font-size:20px; font-weight:900; color:#1e40af;">S/ <span id="res-neto">0.00</span></span>
                        </div>
                  </div>
                  
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Pago Detracción</label>
                          <input type="date" id="in-fecha-pago-detraccion" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div style="grid-column: 1 / -1;">
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Observaciones</label>
                          <textarea id="in-observaciones" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px; min-height:60px;"></textarea>
                      </div>
                  </div>

                  <div style="text-align:right; margin-top:30px; padding-top:20px; border-top: 1px solid #e2e8f0;">
                      <button type="button" id="btn-cancelar" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:10px 25px; border-radius:6px; margin-right:12px; cursor:pointer; font-weight:600;">Cancelar</button>
                      <button type="submit" style="background:#10b981; color:white; border:none; padding:10px 30px; border-radius:6px; cursor:pointer; font-weight:700; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:5px;"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                          Guardar Proyección
                      </button>
                  </div>
              </form>
          </div>
      </div>
  </div>`;
}

// --- MODAL DE VISTA PREVIA ---
function renderModalVista() {
    return `
  <div id="modal-vista" class="modal" style="display:none; position:fixed; z-index:1001; left:0; top:0; width:100%; height:100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); overflow-y: auto;">
      <div class="modal-content" style="background:#fff; margin:3% auto; width:900px; border-radius:12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; background: #f8fafc; padding:15px 25px; border-bottom:1px solid #e2e8f0;">
              <h3 style="margin:0; color: #1e293b; font-size: 1.25rem; font-weight: 700;">Detalles de la Proyección</h3>
              <button id="btn-cerrar-vista" style="background:none; border:none; font-size:28px; cursor:pointer; color: #94a3b8; line-height:1;">&times;</button>
          </div>
          <div class="modal-body" style="padding:25px;">
              <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                  <div>
                      <label style="display:block; font-size:11px; font-weight:600; color:#64748b; margin-bottom:5px;">ACTIVIDAD</label>
                      <p id="vista-actividad" style="margin:0; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;">-</p>
                  </div>
                  <div>
                      <label style="display:block; font-size:11px; font-weight:600; color:#64748b; margin-bottom:5px;">EMPRESA</label>
                      <p id="vista-empresa" style="margin:0; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;">-</p>
                  </div>
                  <div>
                      <label style="display:block; font-size:11px; font-weight:600; color:#64748b; margin-bottom:5px;">CLIENTE</label>
                      <p id="vista-cliente" style="margin:0; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;">-</p>
                  </div>
                  <div style="grid-column: 1 / -1;">
                      <label style="display:block; font-size:11px; font-weight:600; color:#64748b; margin-bottom:8px;">SERVICIOS/PRODUCTOS Y FRECUENCIAS</label>
                      <div style="border:1px solid #bae6fd; border-radius:8px; overflow:hidden; background:#ffffff;">
                          <table style="width:100%; border-collapse:collapse;">
                              <thead>
                                  <tr style="background:#f0f9ff; border-bottom:2px solid #bae6fd;">
                                      <th style="padding:10px 12px; text-align:left; font-size:11px; font-weight:600; color:#0c4a6e;">Servicio/Producto</th>
                                      <th style="padding:10px 12px; text-align:center; font-size:11px; font-weight:600; color:#0c4a6e; width:180px;">Frecuencia</th>
                                  </tr>
                              </thead>
                              <tbody id="vista-servicios-tabla">
                                  <tr>
                                      <td colspan="2" style="padding:20px; text-align:center; color:#94a3b8;">-</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>

              <div style="background:#faf5ff; padding:15px; border-radius:8px; margin-bottom:20px; border:1px solid #e9d5ff;">
                  <h4 style="margin:0 0 15px 0; color:#6b21a8; font-size:13px; font-weight:700;">IMPORTES Y TOTALES</h4>
                  <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap:15px;">
                      <div style="text-align:center;">
                          <span style="display:block; font-size:10px; font-weight:600; color:#6b21a8;">Subtotal</span>
                          <p id="vista-subtotal" style="margin:0; font-size:13px; font-weight:bold; color:#6b21a8;">-</p>
                      </div>
                      <div style="text-align:center;">
                          <span style="display:block; font-size:10px; font-weight:600; color:#6b21a8;">IGV (18%)</span>
                          <p id="vista-igv" style="margin:0; font-size:13px; font-weight:bold; color:#6b21a8;">-</p>
                      </div>
                      <div style="text-align:center;">
                          <span style="display:block; font-size:10px; font-weight:600; color:#6b21a8;">Total Orden</span>
                          <p id="vista-total-os" style="margin:0; font-size:13px; font-weight:bold; color:#6b21a8;">-</p>
                      </div>
                      <div style="text-align:center;">
                          <span style="display:block; font-size:10px; font-weight:600; color:#dc2626;">Detracción (12%)</span>
                          <p id="vista-detrax" style="margin:0; font-size:13px; font-weight:bold; color:#dc2626;">-</p>
                      </div>
                      <div style="text-align:center; background:white; padding:8px 12px; border-radius:6px; border:2px solid #10b981;">
                          <span style="display:block; font-size:10px; font-weight:600; color:#10b981;">Neto</span>
                          <p id="vista-neto" style="margin:0; font-size:14px; font-weight:900; color:#10b981;">-</p>
                      </div>
                  </div>
              </div>

              <div style="background:#f0f4f8; padding:15px; border-radius:8px; margin-bottom:20px; border:1px solid #bfdbfe;">
                  <h4 style="margin:0 0 15px 0; color:#1e3a8a; font-size:13px; font-weight:700;">DATOS DE FACTURACIÓN</h4>
                  <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
                      <div>
                          <span style="display:block; font-size:10px; font-weight:600; color:#475569;">Fecha Ejecución</span>
                          <p id="vista-fecha-ejecucion" style="margin:0; font-weight:600; color:#1e293b;">-</p>
                      </div>
                      <div>
                          <span style="display:block; font-size:10px; font-weight:600; color:#475569;">N° Factura</span>
                          <p id="vista-num-factura" style="margin:0; font-weight:600; color:#1e293b; font-family:monospace;">-</p>
                      </div>
                      <div>
                          <span style="display:block; font-size:10px; font-weight:600; color:#475569;">Fecha Factura</span>
                          <p id="vista-fecha-factura" style="margin:0; font-weight:600; color:#1e293b;">-</p>
                      </div>
                      <div>
                          <span style="display:block; font-size:10px; font-weight:600; color:#475569;">Días Crédito</span>
                          <p id="vista-dias-credito" style="margin:0; font-weight:600; color:#1e293b;">-</p>
                      </div>
                      <div>
                          <span style="display:block; font-size:10px; font-weight:600; color:#475569;">Fecha Vcto</span>
                          <p id="vista-fecha-vcto" style="margin:0; font-weight:600; color:#1e293b;">-</p>
                      </div>
                      <div>
                          <span style="display:block; font-size:10px; font-weight:600; color:#475569;">Días Vencer</span>
                          <p id="vista-dias-vencer" style="margin:0; font-weight:600; color:#1e293b;">-</p>
                      </div>
                      <div>
                          <span style="display:block; font-size:10px; font-weight:600; color:#475569;">Fecha Pago</span>
                          <p id="vista-fecha-pago" style="margin:0; font-weight:600; color:#1e293b;">-</p>
                      </div>
                  </div>
              </div>

              <div style="text-align:right;">
                  <button type="button" id="btn-cerrar-vista-btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:10px 25px; border-radius:6px; cursor:pointer; font-weight:600;">Cerrar</button>
              </div>
          </div>
      </div>
  </div>`;
}

// --- MODAL DE EDICIÓN ---
function renderModalEdicion() {
    return `
  <div id="modal-edicion" class="modal" style="display:none; position:fixed; z-index:1001; left:0; top:0; width:100%; height:100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); overflow-y: auto;">
      <div class="modal-content" style="background:#fff; margin:3% auto; width:900px; border-radius:12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; background: #f8fafc; padding:15px 25px; border-bottom:1px solid #e2e8f0;">
              <h3 style="margin:0; color: #1e293b; font-size: 1.25rem; font-weight: 700;">Editar Proyección de Factura</h3>
              <button id="btn-cerrar-edicion" style="background:none; border:none; font-size:28px; cursor:pointer; color: #94a3b8; line-height:1;">&times;</button>
          </div>
          <div class="modal-body" style="padding:25px;">
              <form id="form-editar-factura">
                  <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:25px; padding:15px; background:#f1f5f9; border-radius:8px; border:1px solid #e2e8f0;">
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Actividad</label>
                          <input type="text" id="edit-actividad" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Estado</label>
                          <select id="edit-estado" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:white; font-weight:bold; color:#1e293b;">
                              <option value="Sin Factura">Sin Factura</option>
                              <option value="Pendiente de pago">Pendiente de pago</option>
                              <option value="Pagado">Pagado</option>
                              <option value="Anulado">Anulado</option>
                          </select>
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Empresa (Emisor)</label>
                          <select id="edit-alias" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:white; font-weight:bold; color:#1e293b;">
                              <option value="2">MULTI</option>
                              <option value="1">CIM</option>
                          </select>
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Cliente</label>
                          <input type="text" id="edit-cliente" readonly style="width:100%; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Cotización / OC</label>
                          <input type="text" id="edit-cotizacion-oc" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
                      </div>
                      <div style="grid-column: 1 / -1;">
                          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:8px;">Servicios/Productos y Frecuencias</label>
                          <div style="border:1px solid #bae6fd; border-radius:8px; overflow:hidden; background:#ffffff;">
                              <table style="width:100%; border-collapse:collapse;">
                                  <thead>
                                      <tr style="background:#f0f9ff; border-bottom:2px solid #bae6fd;">
                                          <th style="padding:10px 12px; text-align:left; font-size:12px; font-weight:600; color:#0c4a6e;">Servicio/Producto</th>
                                          <th style="padding:10px 12px; text-align:center; font-size:12px; font-weight:600; color:#0c4a6e; width:200px;">Frecuencia</th>
                                      </tr>
                                  </thead>
                                  <tbody id="edit-servicios-tabla">
                                      <tr>
                                          <td colspan="2" style="padding:20px; text-align:center; color:#94a3b8;">Cargando...</td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>

                  <h4 style="margin:0 0 15px 0; color: #334155; font-size: 15px; border-bottom: 2px solid #8b5cf6; display: inline-block; padding-bottom: 4px;">Importes y Totales</h4>
                  
                  <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:25px; padding:15px; border: 1px solid #8b5cf6; border-radius:8px; background:#faf5ff;">
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#6b21a8; margin-bottom:5px;">Base Imponible</label>
                          <input type="number" step="0.01" id="edit-base-imponible" style="width:100%; padding:8px; border:1px solid #e9d5ff; border-radius:6px; font-weight:600; font-size:14px; text-align:right;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#6b21a8; margin-bottom:5px;">IGV (18%)</label>
                          <p id="edit-igv" style="margin:0; padding:8px; background:#ffffff; border:1px solid #e9d5ff; border-radius:6px; color:#1f2937; font-weight:600; text-align:right;">S/ 0.00</p>
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#6b21a8; margin-bottom:5px;">Total Orden</label>
                          <p id="edit-total-os" style="margin:0; padding:8px; background:#ffffff; border:1px solid #e9d5ff; border-radius:6px; color:#1f2937; font-weight:600; text-align:right;">S/ 0.00</p>
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#dc2626; margin-bottom:5px;">Detracción (12%)</label>
                          <p id="edit-detrax" style="margin:0; padding:8px; background:#fff5f5; border:1px solid #fecaca; border-radius:6px; color:#991b1b; font-weight:600; text-align:right;">S/ 0.00</p>
                      </div>
                      <div style="grid-column: 2 / -1;">
                          <label style="display:block; font-size:12px; font-weight:600; color:#10b981; margin-bottom:5px;">Total Neto</label>
                          <p id="edit-neto" style="margin:0; padding:8px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; color:#16a34a; font-weight:700; font-size:16px; text-align:right;">S/ 0.00</p>
                      </div>
                  </div>

                  <h4 style="margin:0 0 15px 0; color: #334155; font-size: 15px; border-bottom: 2px solid #10b981; display: inline-block; padding-bottom: 4px;">Datos de Facturación</h4>
                  
                  <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:25px; padding:15px; border: 1px solid #10b981; border-radius:8px;">
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Ejecución</label>
                          <input type="date" id="edit-fecha-ejecucion" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">N° de Factura</label>
                          <input type="text" id="edit-num-factura" placeholder="F001-000000" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Factura</label>
                          <input type="date" id="edit-fecha-factura" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Días Crédito</label>
                          <input type="number" id="edit-dias-credito" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Vcto Factura</label>
                          <input type="date" id="edit-fecha-vcto" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Días Vencer</label>
                          <input type="number" id="edit-dias-vencer" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Pago</label>
                          <input type="date" id="edit-fecha-pago" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Pago Detracción</label>
                          <input type="date" id="edit-fecha-pago-detraccion" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div style="grid-column: 1 / -1;">
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Observaciones</label>
                          <textarea id="edit-observaciones" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px; min-height:60px;"></textarea>
                      </div>
                  </div>

                  <div style="text-align:right; margin-top:30px; padding-top:20px; border-top: 1px solid #e2e8f0;">
                      <button type="button" id="btn-cancelar-edicion" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:10px 25px; border-radius:6px; margin-right:12px; cursor:pointer; font-weight:600;">Cancelar</button>
                      <button type="submit" style="background:#10b981; color:white; border:none; padding:10px 30px; border-radius:6px; cursor:pointer; font-weight:700; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:5px;"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                          Guardar Cambios
                      </button>
                  </div>
              </form>
          </div>
      </div>
  </div>`;
}
// --- TAB: ÓRDENES PROYECTADAS (Tabla principal) ---
export function renderOrdenesProyectadasTab(proyecciones: any[] = []) {
    if (proyecciones.length === 0) {
        return `<div style="text-align:center; padding:50px; color: #64748b;">No hay registros.</div>`;
    }

    const fDate = (d: string | null) => {
        if (!d) return '---';
        try {
            const [year, month, day] = d.split('T')[0].split('-');
            return `${day}/${month}/${year}`;
        } catch {
            return '---';
        }
    };

    return `
    <div class="table-container">
      <table class="data-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th class="col-chk" style="padding: 12px; text-align: center; display: none;"><input type="checkbox" id="chk-all-proyecciones"></th>
            <th style="padding: 12px; text-align: left;">ACTIVIDAD</th>
            <th style="padding: 12px; text-align: left;">EMPRESA</th>
            <th style="padding: 12px; text-align: left;">ESTADO</th>
            <th style="padding: 12px; text-align: left;">CLIENTE / ORIGEN</th>
            <th style="padding: 12px; text-align: left;">FECHA EJECUCION</th>
            <th style="padding: 12px; text-align: left;">IMPORTES (S/)</th>
            <th style="padding: 12px; text-align: left;">N° FACTURA</th>
            <th style="padding: 12px; text-align: left;">DETRACCION</th>
            <th style="padding: 12px; text-align: left;">MONTO TOTAL</th>
            <th style="padding: 12px; text-align: left;">FECHA FACTURA</th>
            <th style="padding: 12px; text-align: left;">DIAS CREDITO</th>
            <th style="padding: 12px; text-align: left;">FECHA VCTO FACTURA</th>
            <th style="padding: 12px; text-align: left;">DIAS VENCER</th>
            <th style="padding: 12px; text-align: left;">FECHA PAGO</th>
            <th style="padding: 12px; text-align: center;">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
        ${proyecciones.map(p => {
        // Obtenemos la referencia de la orden (servicio, producto o capacitación)
        const ref = p.orden_servicio || p.orden_producto || p.orden_capacitacion || p.orden_auditoria || p.orden_asesoria || {};

        const clienteNombre = ref.cliente ? (ref.cliente.nombre_empresa || ref.cliente.nombre_comercial) : 'Sin cliente';
        
        let colorEstado = '#64748b'; // Sin Factura (gris)
        let bgEstado = '#f1f5f9';
        if (p.estado === 'Pendiente de pago') {
            colorEstado = '#d97706'; // naranja
            bgEstado = '#fef3c7';
        } else if (p.estado === 'Pagado') {
            colorEstado = '#16a34a'; // verde
            bgEstado = '#dcfce3';
        } else if (p.estado === 'Anulado') {
            colorEstado = '#dc2626'; // rojo
            bgEstado = '#fee2e2';
        }

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
              <td class="col-chk" style="padding: 10px; text-align: center; display: none;"><input type="checkbox" class="chk-proyeccion" value="${p.id}"></td>
              <td style="padding: 10px;">${p.actividad || '---'}</td>
              <td style="padding: 10px; font-weight: bold; color: #475569;">
                  ${p.multicim_emisora ? p.multicim_emisora.alias_empresa : '---'}
              </td>
              <td style="padding: 10px;">
                  <span style="display:inline-block; padding:4px 8px; border-radius:4px; background:${bgEstado}; color:${colorEstado}; font-weight:700; font-size:10px; white-space:nowrap; text-align:center;">
                      ${p.estado || 'Sin Factura'}
                  </span>
                  ${p.registrado_por ? `<div style="font-size:9px; color:#94a3b8; margin-top:3px; text-align:center;">Por: ${p.registrado_por}</div>` : ''}
              </td>
              <td style="padding: 10px; font-weight: 600;">
                  ${clienteNombre}
                  <div style="font-size:10px; color:#64748b; margin-top:4px; font-weight:normal;">
                      ${ref.numero_orden ? `<span style="background:#e2e8f0; padding:2px 4px; border-radius:3px;">${ref.numero_orden}</span>` : ''}
                      ${p.servicios_detallados && p.servicios_detallados.length > 0 ? `<div style="margin-top:2px; font-style:italic; max-width:150px; white-space:normal;">${p.servicios_detallados[0].nombre}</div>` : ''}
                  </div>
              </td>

              <td style="padding: 10px; text-align: center;">${fDate(p.fecha_ejecucion)}</td>

              <td style="padding: 10px; white-space: nowrap;">
                  <div style="font-size: 12px; color: #94a3b8;">Sub: ${Number(p.base_imponible || ref.subtotal || 0).toFixed(2)}</div>
                  <div style="font-size: 12px; color: #94a3b8;">Igv: ${Number(p.igv || ref.igv || 0).toFixed(2)}</div>
                  <div style="font-weight: 500;">Tot: ${(Number(p.base_imponible || ref.subtotal || 0) + Number(p.igv || ref.igv || 0)).toFixed(2)}</div>
              </td>

              <td style="padding: 10px; font-family: monospace; font-weight: bold;">${p.n_factura || '---'}</td>
              <td style="padding: 10px; color: #dc2626; font-weight: bold;">S/ ${Number(p.monto_detrax || 0).toFixed(2)}</td>
              <td style="padding: 10px;">
                  <div style="background: #f0fdf4; color: #16a34a; font-weight: 800; padding: 4px 8px; border-radius: 4px; border: 1px solid #bbf7d0; text-align: center;">
                      S/ ${Number(p.total_final || 0).toFixed(2)}
                  </div>
              </td>
              <td style="padding: 10px;">${fDate(p.fecha_factura)}</td>
              <td style="padding: 10px; text-align: center;">${p.dias_credito || 0}</td>
              <td style="padding: 10px; font-weight: 600;">${fDate(p.fecha_vcto)}</td>
              <td style="padding: 10px; text-align: center;">
                  ${(() => {
                      if (!p.fecha_vcto) return '<span style="color:#94a3b8; font-weight:bold;">-</span>';
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const [year, month, day] = p.fecha_vcto.split('T')[0].split('-');
                      const vcto = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      vcto.setHours(0, 0, 0, 0);
                      const diffDays = Math.ceil((vcto.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const color = diffDays <= 5 ? '#ef4444' : '#1e293b';
                      return `<span style="color: ${color}; font-weight: bold;">${diffDays}</span>`;
                  })()}
              </td>
              <td style="padding: 10px; color: #6366f1; font-weight: 600;">${fDate(p.fecha_pago)}</td>
              <td style="padding: 10px; text-align: center;">
                  <div style="display: flex; gap: 6px; justify-content: center;">
                      <button class="btn-icon btn-accion-ver" data-id="${p.id}" title="Ver" style="display: inline-flex; align-items: center; justify-content: center; color: #1e293b;">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button class="btn-icon btn-accion-editar" data-id="${p.id}" title="Editar" style="display: inline-flex; align-items: center; justify-content: center; color: #0284c7;">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="btn-icon btn-accion-eliminar" data-id="${p.id}" title="Eliminar" style="display: inline-flex; align-items: center; justify-content: center; color: #ef4444;">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                      <button class="btn-icon btn-accion-duplicar" data-id="${p.id}" title="Duplicar Próximo Mes" style="display: inline-flex; align-items: center; justify-content: center; color: #8b5cf6;">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                  </div>
              </td>
          </tr>`;
    }).join('')}
        </tbody>
      </table>
    </div>
  `;
}
// --- TABS INTACTOS (SOLO LECTURA/REPRESENTACIÓN) ---

export function renderContratosFijosTab() {
    return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Contratos Activos</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ingresos Recurrentes</div>
          <div class="stat-box-value">$52,800 <span class="stat-box-note">/mes</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Por Renovar</div>
          <div class="stat-box-value">5 <span class="stat-box-note">este mes</span></div>
        </div>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>N° CONTRATO</th>
            <th>CLIENTE</th>
            <th>SERVICIO</th>
            <th>FRECUENCIA</th>
            <th>MONTO MENSUAL</th>
            <th>INICIO</th>
            <th>VENCIMIENTO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>CF-2025-012</strong></td>
            <td>
              <div>
                <div class="equipment-name">Farmacéutica Central</div>
                <div class="equipment-id">Roberto Díaz</div>
              </div>
            </td>
            <td>Fumigación Semanal</td>
            <td><span class="badge blue">Semanal</span></td>
            <td><strong>$3,200</strong></td>
            <td>01/01/2025</td>
            <td>31/12/2025</td>
            <td><span class="badge green">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export function renderEstadoCobranzaTab() {
    return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Por Cobrar</div>
          <div class="stat-box-value">$45,250</div>
        </div>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>N° FACTURA</th>
            <th>MONTO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Clínica San Pablo</td>
            <td><strong>F001-00238</strong></td>
            <td><strong>$4,200</strong></td>
            <td><span class="status-indicator danger">Vencida</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// --- VISTA PRINCIPAL ---
export function renderFacturacion(proyecciones: any[] = [], ordenesPendientes: any[] = [], empresas: any[] = []) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    return `
    <div class="page-header" style="flex-wrap: wrap; gap: 16px; align-items: flex-start;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h1 style="margin: 0; line-height: 1;">Facturación y Cobranza</h1>
        <div style="display:flex;align-items:center;background:#f1f5f9;border-radius:8px;padding:4px;border:1px solid #e2e8f0;height:40px;box-sizing:border-box; max-width: max-content;">
          <button id="tab-fact-datos" style="height:100%;padding:0 16px;background:#fff;color:#0f172a;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;align-items:center;gap:6px;transition:all 0.2s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Ver Datos
          </button>
          <button id="tab-fact-estadistica" style="height:100%;padding:0 16px;background:transparent;color:#64748b;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.2s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Ver Estadística
          </button>
        </div>
      </div>
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <select id="selector-mes" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; font-weight: 600; color: #1e293b;">
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `
            <option value="${i + 1}" ${i === mesActual ? 'selected' : ''}>${meses[i]} ${anioActual}</option>
          `).join('')}
        </select>
        <select id="selector-empresa" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; font-weight: 600; color: #1e293b;">
          <option value="">Todas las Empresas</option>
          ${empresas.map((e: any) => `<option value="${e.id}">${e.alias_empresa}</option>`).join('')}
        </select>
        <button id="btn-exportar-proyecciones" class="btn-secondary" type="button">Exportar Excel</button>
        <button id="btn-toggle-duplicar" class="btn-primary" type="button" style="background: #8b5cf6;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Duplicar Mes
        </button>
      </div>
    </div>

    ${renderAlertaOrdenesPendientes(ordenesPendientes)}

    <div id="facturacion-tab-content" style="max-width: 100%; min-width: 0; width: 100%;">
        ${renderOrdenesProyectadasTab(proyecciones)}
    </div>

    <div id="facturacion-estadistica-content" style="display:none; max-width: 100%; min-width: 0; width: 100%; flex-direction: column; gap: 24px;">
        <!-- KPIs -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:13px;color:#64748b;font-weight:600;margin-bottom:8px;">TOTAL PROYECTADO</div>
            <div id="fact-kpi-proyectado" style="font-size:24px;font-weight:800;color:#0f172a;">S/ 0.00</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Ingreso teórico con IGV</div>
          </div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:13px;color:#64748b;font-weight:600;margin-bottom:8px;">VERDADERAMENTE FACTURADO</div>
            <div id="fact-kpi-pagado" style="font-size:24px;font-weight:800;color:#10b981;">S/ 0.00</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Órdenes en estado Pagado</div>
          </div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-size:13px;color:#64748b;font-weight:600;margin-bottom:8px;">POR COBRAR</div>
            <div id="fact-kpi-por-cobrar" style="font-size:24px;font-weight:800;color:#f59e0b;">S/ 0.00</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Diferencia (Proyectado - Pagado)</div>
          </div>
        </div>

        <!-- Gráfico Principal -->
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <h3 style="margin:0 0 16px 0;font-size:16px;color:#0f172a;">Comparativa General</h3>
          <div style="height:350px; display:flex; justify-content:center; align-items:center;">
            <canvas id="fact-chart-comparativa" style="max-height: 100%; max-width: 100%;"></canvas>
          </div>
        </div>
    </div>

    ${renderModalFactura()}
    ${renderModalVista()}
    ${renderModalEdicion()}
  `;
}

// --- LÓGICA DE EVENTOS (LLAMAR DESDE MAIN.TS) ---
// --- UTILIDADES ---
function toggleBodyScroll(lock: boolean) {
    if (lock) {
        document.body.style.overflow = 'hidden';
        // Opcional: compensar el ancho del scrollbar para evitar saltos
        document.body.style.paddingRight = '8px';
    } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
}

// 1. Definimos la forma de la Orden (el JSON que me pasaste)
interface OrdenReferencia {
    id_referencia: number;
    id_multicim: number;
    numero_orden: string;
    actividad: string;
    alias_empresa: string;
    nombre_cliente: string;
    servicio: string;
    subtotal: number;
    igv: number;
    precio_total_os: number;
    monto_detrax: number;
    total_final: number;
}

export function initFacturacionEvents(proyecciones: any[] = []) {
    const btnExportar = document.getElementById('btn-exportar-proyecciones') as HTMLButtonElement | null;
    btnExportar?.addEventListener('click', async () => {
        const proyeccionesActuales = Array.isArray((window as any).misProyecciones) && (window as any).misProyecciones.length > 0
            ? (window as any).misProyecciones
            : proyecciones;

        try {
            await exportarProyeccionesExcel(proyeccionesActuales);
        } catch (error) {
            console.error('Error exportando proyecciones:', error);
            mostrarToast('error', 'Error', 'No se pudo exportar el Excel de proyecciones');
        }
    });

    // --- TABS (DATOS VS ESTADISTICAS) ---
    const tabDatos = document.getElementById('tab-fact-datos');
    const tabEstadistica = document.getElementById('tab-fact-estadistica');
    const viewDatos = document.getElementById('facturacion-tab-content');
    const viewEstadistica = document.getElementById('facturacion-estadistica-content');

    let factChart: any = null;

    function actualizarEstadisticasFacturacion(lista: any[]) {
        let totalProyectado = 0;
        let totalPagado = 0;

        lista.forEach(p => {
            // El usuario confirmó usar el total con IGV
            const total = Number(p.total_final || p.precio_total_os || 0);
            
            // Excluir las órdenes anuladas del total esperado (Proyectado)
            if (p.estado !== 'Anulado') {
                totalProyectado += total;
            }
            
            // El usuario confirmó considerar "Verdaderamente Facturado" SOLO a los estado "Pagado"
            if (p.estado === 'Pagado') {
                totalPagado += total;
            }
        });

        const porCobrar = totalProyectado > totalPagado ? totalProyectado - totalPagado : 0;

        const kpiProy = document.getElementById('fact-kpi-proyectado');
        const kpiPagado = document.getElementById('fact-kpi-pagado');
        const kpiCobrar = document.getElementById('fact-kpi-por-cobrar');

        if (kpiProy) kpiProy.textContent = 'S/ ' + totalProyectado.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        if (kpiPagado) kpiPagado.textContent = 'S/ ' + totalPagado.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        if (kpiCobrar) kpiCobrar.textContent = 'S/ ' + porCobrar.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2});

        // Actualizar gráfico
        const canvas = document.getElementById('fact-chart-comparativa') as HTMLCanvasElement;
        if (!canvas) return;

        if (factChart) {
            factChart.destroy();
        }

        if (viewEstadistica?.style.display === 'flex') {
            factChart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Facturado (Pagado)', 'Por Cobrar'],
                    datasets: [{
                        data: [totalPagado, porCobrar],
                        backgroundColor: ['#10b981', '#f59e0b'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'right' },
                        tooltip: {
                            callbacks: {
                                label: function(context: any) {
                                    let label = context.label || '';
                                    if (label) label += ': ';
                                    if (context.parsed !== null) {
                                        label += 'S/ ' + context.parsed.toLocaleString('es-PE', {minimumFractionDigits: 2});
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    const updateTabs = (isEstadistica: boolean) => {
        if (isEstadistica) {
            if (tabDatos) {
                tabDatos.style.background = 'transparent';
                tabDatos.style.color = '#64748b';
                tabDatos.style.boxShadow = 'none';
            }
            if (tabEstadistica) {
                tabEstadistica.style.background = '#fff';
                tabEstadistica.style.color = '#0f172a';
                tabEstadistica.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }
            if (viewDatos) viewDatos.style.display = 'none';
            if (viewEstadistica) {
                viewEstadistica.style.display = 'flex';
                // Trigger chart render after making it visible
                const proys = (window as any).misProyecciones || proyecciones;
                actualizarEstadisticasFacturacion(proys);
            }
        } else {
            if (tabEstadistica) {
                tabEstadistica.style.background = 'transparent';
                tabEstadistica.style.color = '#64748b';
                tabEstadistica.style.boxShadow = 'none';
            }
            if (tabDatos) {
                tabDatos.style.background = '#fff';
                tabDatos.style.color = '#0f172a';
                tabDatos.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }
            if (viewEstadistica) viewEstadistica.style.display = 'none';
            if (viewDatos) viewDatos.style.display = 'block';
        }
    };

    tabDatos?.addEventListener('click', () => updateTabs(false));
    tabEstadistica?.addEventListener('click', () => updateTabs(true));

    // --- FUNCIÓN AUXILIAR: Cargar proyecciones con filtros ---
    const cargarProyecciones = async () => {
        const mesSeleccionado = (document.getElementById('selector-mes') as HTMLSelectElement)?.value || (window as any).mesActual;
        const empresaSeleccionada = (document.getElementById('selector-empresa') as HTMLSelectElement)?.value;

        try {
            const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
            let url = `http://backend.qsci-system.com/api/v1/proyecciones?mes=${mesSeleccionado}&anio=${(window as any).anioActual}`;

            // Agregar filtro de empresa si está seleccionada
            if (empresaSeleccionada) {
                url += `&id_multicim=${empresaSeleccionada}`;
            }

            const respuesta = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            const result = await respuesta.json();
            const rawData = result.data || result;
            const nuevasProyecciones = Array.isArray(rawData) ? rawData : [];

            // Actualizar variable global de proyecciones
            (window as any).misProyecciones = nuevasProyecciones;

            // Actualizar la tabla sin recargar la página
            const tabContent = document.getElementById('facturacion-tab-content');
            if (tabContent) {
                tabContent.innerHTML = renderOrdenesProyectadasTab(nuevasProyecciones);
                initFacturacionTableEvents(nuevasProyecciones);
            }
            
            // Actualizar el dashboard si estamos en la pestaña
            if (viewEstadistica && viewEstadistica.style.display !== 'none') {
                actualizarEstadisticasFacturacion(nuevasProyecciones);
            }

            console.log(`Proyecciones filtradas cargadas (mes=${mesSeleccionado}, empresa=${empresaSeleccionada || 'todas'}):`, nuevasProyecciones);
        } catch (error) {
            console.error("Error cargando proyecciones:", error);
            mostrarToast('error', 'Error', 'Error al cargar proyecciones');
        }
    };

    // --- SELECTOR DE MES ---
    const selectorMes = document.getElementById('selector-mes') as HTMLSelectElement;
    selectorMes?.addEventListener('change', async (e) => {
        const mesSeleccionado = parseInt((e.target as HTMLSelectElement).value);
        (window as any).mesActual = mesSeleccionado;
        await cargarProyecciones();
    });

    // --- SELECTOR DE EMPRESA ---
    const selectorEmpresa = document.getElementById('selector-empresa') as HTMLSelectElement;
    selectorEmpresa?.addEventListener('change', async (e) => {
        await cargarProyecciones();
    });

    const modalTipo = document.getElementById('modal-tipo-orden') as HTMLSelectElement;
    const selectOrden = document.getElementById('modal-select-orden') as HTMLSelectElement;
    const form = document.getElementById('form-nueva-factura') as HTMLFormElement;
    const modal = document.getElementById('modal-factura');

    // --- 0. VER ÓRDENES PENDIENTES ---
    const btnVerPendientes = document.getElementById('btn-ver-pendientes');
    btnVerPendientes?.addEventListener('click', () => {
        // Cambiar a tipo servicio por defecto y cargar órdenes pendientes
        if (modalTipo) modalTipo.value = '';
        if (selectOrden) {
            selectOrden.innerHTML = '<option value="">-- Seleccione Orden Pendiente --</option>';
            selectOrden.disabled = true;
        }
        if (modal) {
            modal.style.display = 'block';
            toggleBodyScroll(true);
        }
    });

    // --- 1. ABRIR MODAL ---
    const btnNueva = document.getElementById('btn-nueva-factura');
    btnNueva?.addEventListener('click', () => {
        if (modal) {
            modal.style.display = 'block';
            toggleBodyScroll(true);
            // Resetear el estado del modal al abrir
            if (modalTipo) modalTipo.value = '';
            if (selectOrden) {
                selectOrden.innerHTML = '<option value="">-- Primero elija tipo --</option>';
                selectOrden.disabled = true;
            }
            if (form) {
                form.reset();
                form.style.display = 'none';
            }
        }
    });

    // --- 2. CERRAR MODAL ---
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar');

    const cerrarModal = () => {
        if (modal) {
            modal.style.display = 'none';
            toggleBodyScroll(false);
        }
    };

    btnCerrar?.addEventListener('click', cerrarModal);
    btnCancelar?.addEventListener('click', cerrarModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });

    // --- 3. CAMBIO DE TIPO (SERVICIO/PRODUCTO/CAPACITACION) ---
    // --- 3. CAMBIO DE TIPO ---
    modalTipo?.addEventListener('change', async () => {
        const tipo = modalTipo.value;
        if (!tipo) return;

        try {
            let endpoint = '';

            if (tipo === 'servicio') {
                endpoint = 'ordenes-servicio';
            }
            else if (tipo === 'producto') {
                endpoint = 'ordenes-producto';
            }
            else if (tipo === 'capacitacion') {
                endpoint = 'ordenes-capacitacion-auditoria';
            }
            else if (tipo === 'auditoria') {
                endpoint = 'ordenes-auditoria';
            }
            else if (tipo === 'asesoria') {
                endpoint = 'ordenes-asesoria';
            }
            const resp = await fetch(`http://backend.qsci-system.com/api/v1/${endpoint}`, { headers: getAuthHeaders() });
            const result = await resp.json();

            selectOrden.disabled = false;
            selectOrden.innerHTML = '<option value="">-- Seleccione Número de Orden --</option>';

            result.data.forEach((o: any) => {
                const opt = document.createElement('option');
                opt.value = String(o.id); // Guardamos el ID real
                opt.text = `${o.numero_orden}`;
                selectOrden.appendChild(opt);
            });
        } catch (error) { console.error("Error:", error); }
    });

    // --- 4. SELECCIÓN DE ORDEN ESPECÍFICA ---
    selectOrden?.addEventListener('change', async () => {
        const id = selectOrden.value;
        const tipo = modalTipo.value;

        if (!id || !tipo) return;

        try {
            // LLAMAMOS A LA RUTA QUE PROBASTE EN THUNDER CLIENT
            const resp = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones/buscar-orden/${tipo}/${id}`, { headers: getAuthHeaders() });
            const result = await resp.json();

            if (result.success) {
                const d = result.data; // Esta es la data "planita" de Thunder
                if (form) form.style.display = 'block';

                // Ahora sí, los nombres coinciden 1:1 con tu Thunder Client
                (document.getElementById('res-cliente') as HTMLInputElement).value = d.nombre_cliente;
                (document.getElementById('in-actividad') as HTMLInputElement).value = d.actividad || '';

                // Llenar tabla de servicios
                const serviciosTabla = document.getElementById('res-servicios-tabla') as HTMLTableSectionElement;
                if (serviciosTabla) {
                    const servicios = d.servicios_detallados || [];
                    if (servicios.length > 0) {
                        serviciosTabla.innerHTML = servicios.map((s: any, idx: number) => `
                    <tr style="${idx % 2 === 0 ? 'background:#ffffff' : 'background:#f9fafb;'} border-bottom:1px solid #e5e7eb;">
                        <td style="padding:12px; font-size:13px; color:#1f2937;">${s.nombre || '---'}</td>
                        <td style="padding:12px; text-align:center;">
                            <span style="display:inline-block; padding:6px 12px; background:#06b6d4; color:white; border-radius:20px; font-weight:600; font-size:12px; white-space:nowrap;">
                                ${s.frecuencia || '---'}
                            </span>
                        </td>
                    </tr>
                `).join('');
                    } else {
                        serviciosTabla.innerHTML = '<tr><td colspan="2" style="padding:20px; text-align:center; color:#94a3b8;">Sin servicios</td></tr>';
                    }
                }

                const comboEmpresa = document.getElementById('res-alias') as HTMLSelectElement;
                if (comboEmpresa && d.id_multicim) {
                    comboEmpresa.value = String(d.id_multicim);
                }

                // Datos de la OS para mostrar en el modal
                document.getElementById('info-subtotal')!.innerText = Number(d.subtotal).toFixed(2);
                document.getElementById('info-igv')!.innerText = Number(d.igv).toFixed(2);
                document.getElementById('info-total-os')!.innerText = Number(d.precio_total_os).toFixed(2);

                // Operacion Detraccion
                document.getElementById('res-subtotal')!.innerText = Number(d.precio_total_os).toFixed(2);
                document.getElementById('res-detrax')!.innerText = Number(d.monto_detrax).toFixed(2);
                document.getElementById('res-neto')!.innerText = Number(d.total_final).toFixed(2);

                // Guardamos el ID de referencia para el POST final
                form.dataset.idRef = String(d.id_referencia);
                form.dataset.idMulticim = "1"; // O el ID que corresponda a 'alias_empresa'
            }
        } catch (error) {
            console.error("Error al jalar datos:", error);
        }
    });

    // --- CÁLCULOS DINÁMICOS ---
    const inBaseImponible = document.getElementById('in-base-imponible') as HTMLInputElement;
    inBaseImponible?.addEventListener('input', () => {
        const base = parseFloat(inBaseImponible.value || '0');
        const igv = base * 0.18;
        const total = base + igv;
        const detrax = total > 700 ? total * 0.12 : 0;
        const neto = total - detrax;

        document.getElementById('info-igv')!.innerText = igv.toFixed(2);
        document.getElementById('info-total-os')!.innerText = total.toFixed(2);
        document.getElementById('res-subtotal')!.innerText = total.toFixed(2);
        document.getElementById('res-detrax')!.innerText = detrax.toFixed(2);
        document.getElementById('res-neto')!.innerText = neto.toFixed(2);
    });

    // --- 5. CÁLCULO DE FECHAS (FACTURACIÓN) ---
    const calcFechas = (prefix: string) => {
        const fechaFacturaInput = document.getElementById(`${prefix}-fecha-factura`) as HTMLInputElement;
        const diasCreditoInput = document.getElementById(`${prefix}-dias-credito`) as HTMLInputElement;
        const fechaVctoInput = document.getElementById(`${prefix}-fecha-vcto`) as HTMLInputElement;
        const diasVencerInput = document.getElementById(`${prefix}-dias-vencer`) as HTMLInputElement;

        const updateVcto = () => {
            if (fechaFacturaInput?.value && diasCreditoInput?.value) {
                // Asumimos UTC para evitar desfases por zona horaria
                const [year, month, day] = fechaFacturaInput.value.split('-');
                const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
                date.setUTCDate(date.getUTCDate() + parseInt(diasCreditoInput.value));
                fechaVctoInput.value = date.toISOString().split('T')[0];
                updateDiasVencer();
            }
        };

        const updateDiasVencer = () => {
            if (fechaVctoInput?.value && diasVencerInput) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const [year, month, day] = fechaVctoInput.value.split('-');
                const vcto = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                vcto.setHours(0, 0, 0, 0);
                
                const diffTime = vcto.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                diasVencerInput.value = String(diffDays);
                
                // Hacerlo visualmente de solo lectura (opcional, pero útil para UX)
                diasVencerInput.readOnly = true;
                diasVencerInput.style.backgroundColor = '#f1f5f9';
            }
        };

        fechaFacturaInput?.addEventListener('input', updateVcto);
        diasCreditoInput?.addEventListener('input', updateVcto);
        fechaVctoInput?.addEventListener('input', updateDiasVencer);
    };

    calcFechas('in');
    calcFechas('edit');

    // --- 6. SUBMIT DEL FORMULARIO ---
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const idRef = Number(selectOrden.value);
        const tipo = modalTipo.value;

        const clienteNombre = (document.getElementById('res-cliente') as HTMLInputElement).value;
        const actividadManual = (document.getElementById('in-actividad') as HTMLInputElement).value;

        const subtotal = parseFloat(document.getElementById('info-subtotal')?.innerText || '0');
        const igv = parseFloat(document.getElementById('info-igv')?.innerText || '0');
        const totalOS = parseFloat(document.getElementById('info-total-os')?.innerText || '0');

        const numFactura = (document.getElementById('in-num-factura') as HTMLInputElement).value || null;
        const fechaFactura = (document.getElementById('in-fecha-factura') as HTMLInputElement).value || null;
        const diasCredito = (document.getElementById('in-dias-credito') as HTMLInputElement).value ? Number((document.getElementById('in-dias-credito') as HTMLInputElement).value) : null;
        const diasVencer = (document.getElementById('in-dias-vencer') as HTMLInputElement).value ? Number((document.getElementById('in-dias-vencer') as HTMLInputElement).value) : null;

        const fechaPago = (document.getElementById('in-fecha-pago') as HTMLInputElement).value || null;
        const fechaEjecucion = (document.getElementById('in-fecha-ejecucion') as HTMLInputElement).value || null;
        const fechaVcto = (document.getElementById('in-fecha-vcto') as HTMLInputElement).value || null;

        const montoDetrax = parseFloat(document.getElementById('res-detrax')?.innerText || '0');
        const totalFinal = parseFloat(document.getElementById('res-neto')?.innerText || '0');

        const idMulticimReal = Number((document.getElementById('res-alias') as HTMLSelectElement).value);

        const estado = (document.getElementById('in-estado') as HTMLSelectElement).value;
        const baseImponible = parseFloat((document.getElementById('in-base-imponible') as HTMLInputElement)?.value || '0');
        const cotizacionOc = (document.getElementById('in-cotizacion-oc') as HTMLInputElement).value || null;
        const fechaPagoDetraccion = (document.getElementById('in-fecha-pago-detraccion') as HTMLInputElement).value || null;
        const observaciones = (document.getElementById('in-observaciones') as HTMLInputElement).value || null;

        const payload = {
            id_multicim: idMulticimReal,
            tipo_orden: tipo,
            id_referencia: idRef,
            actividad: actividadManual || null,
            base_imponible: baseImponible,
            igv: igv,
            porcentaje_detraccion: 12,
            monto_detrax: montoDetrax,
            total_final: totalFinal,
            estado: estado,
            cotizacion_oc: cotizacionOc,
            observaciones: observaciones,
            fecha_pago_detraccion: fechaPagoDetraccion,
            n_factura: numFactura,
            fecha_factura: fechaFactura,
            dias_credito: diasCredito,
            dia_vencer: diasVencer,
            fecha_pago: fechaPago,
            fecha_ejecucion: fechaEjecucion,
            fecha_vcto: fechaVcto
        };

        console.log("Enviando al controlador:", payload);

        try {
            const resp = await fetch('http://backend.qsci-system.com/api/v1/proyecciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });

            const result = await resp.json();

            if (resp.ok && result.success) {
                mostrarToast('success', 'Éxito', '¡Proyección registrada con éxito!');
                if (modal) modal.style.display = 'none';
                window.location.reload();
            } else {
                const msg = result.errors ? JSON.stringify(result.errors) : (result.message || 'Error desconocido');
                mostrarToast('error', 'Error de validación', msg);
            }
        } catch (error) {
            console.error("Error en submit:", error);
            mostrarToast('error', 'Error', 'Error de conexión con el servidor');
        }
    });

    // Llamar a attachModalHandlers para los modales
    attachModalHandlers();

    // Inicializar acciones de la tabla desde la primera carga
    initFacturacionTableEvents(proyecciones);
}

// --- FUNCIÓN PARA INICIALIZAR EVENTOS DE TABLA (LLAMADO CUANDO CAMBIA MES) ---
export function initFacturacionTableEvents(proyecciones: any[] = []) {
    const container = document.querySelector('.table-container') || document.getElementById('facturacion-tab-content');

    if (!container) return;

    const containerEl = container as HTMLElement;
    if (containerEl.dataset.facturacionActionsBound === '1') {
        return;
    }
    containerEl.dataset.facturacionActionsBound = '1';

    // Checkbox master (Seleccionar todos)
    const chkAll = document.getElementById('chk-all-proyecciones') as HTMLInputElement;
    if (chkAll) {
        chkAll.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            const checkboxes = container.querySelectorAll('.chk-proyeccion') as NodeListOf<HTMLInputElement>;
            checkboxes.forEach(chk => {
                chk.checked = isChecked;
            });
        });
    }

    // Botón de Toggle Duplicar (Header)
    const btnToggleDuplicar = document.getElementById('btn-toggle-duplicar');
    if (btnToggleDuplicar && btnToggleDuplicar.dataset.bound !== '1') {
        btnToggleDuplicar.dataset.bound = '1';
        let modoDuplicar = false;

        btnToggleDuplicar.addEventListener('click', async () => {
            const chkCols = document.querySelectorAll('.col-chk') as NodeListOf<HTMLElement>;
            
            if (!modoDuplicar) {
                // Activar modo duplicar: mostrar checkboxes
                modoDuplicar = true;
                chkCols.forEach(col => col.style.display = 'table-cell');
                btnToggleDuplicar.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Confirmar Duplicación
                `;
                btnToggleDuplicar.style.background = '#10b981'; // verde
            } else {
                // Confirmar
                const checkboxes = container.querySelectorAll('.chk-proyeccion:checked') as NodeListOf<HTMLInputElement>;
                const ids = Array.from(checkboxes).map(chk => chk.value);

                if (ids.length === 0) {
                    // Si no seleccionó nada, simplemente cancelar
                    cancelarModo();
                    return;
                }

                btnToggleDuplicar.setAttribute('disabled', 'true');
                btnToggleDuplicar.innerHTML = 'Procesando...';

                await ejecutarDuplicacion(ids);

                btnToggleDuplicar.removeAttribute('disabled');
                cancelarModo();
            }
        });

        function cancelarModo() {
            modoDuplicar = false;
            const chkCols = document.querySelectorAll('.col-chk') as NodeListOf<HTMLElement>;
            chkCols.forEach(col => col.style.display = 'none');
            
            // Desmarcar todo
            const allChks = document.querySelectorAll('.chk-proyeccion') as NodeListOf<HTMLInputElement>;
            allChks.forEach(c => c.checked = false);
            if (chkAll) chkAll.checked = false;

            btnToggleDuplicar!.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Duplicar Mes
            `;
            btnToggleDuplicar!.style.background = '#8b5cf6'; // morado original
        }
    }

    // Función auxiliar para llamar al backend
    async function ejecutarDuplicacion(ids: string[]) {
        try {
            const resp = await fetch('http://backend.qsci-system.com/api/v1/proyecciones/duplicar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ ids })
            });
            const result = await resp.json();

            if (resp.ok && result.success) {
                mostrarToast('success', 'Éxito', result.message || 'Duplicación completada');
                // Recargar proyecciones
                setTimeout(() => window.location.reload(), 1500);
            } else {
                mostrarToast('error', 'Error', result.message || 'Error al duplicar');
            }
        } catch (error) {
            console.error("Error al duplicar:", error);
            mostrarToast('error', 'Error', 'Error de conexión');
        }
    }

    // Delegación de eventos - captura clics en botones de acción
    container.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const actionButton = target.closest('.btn-accion-ver, .btn-accion-editar, .btn-accion-eliminar, .btn-accion-duplicar') as HTMLElement | null;
        if (!actionButton) return;

        // BOTÓN VER
        if (actionButton.classList.contains('btn-accion-ver')) {
            const id = actionButton.getAttribute('data-id');
            if (!id) return;

            try {
                const resp = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones/${id}`, {
                    headers: getAuthHeaders()
                });
                const result = await resp.json();

                if (result.success) {
                    const p = result.data;
                    const ref = p.orden_servicio || p.orden_producto || p.orden_capacitacion || p.orden_auditoria || p.orden_asesoria || {};
                    const empresaNombre = p.multicim_emisora ? p.multicim_emisora.alias_empresa : '---';
                    const clienteNombre = ref.cliente ? (ref.cliente.nombre_empresa || ref.cliente.nombre_comercial) : '---';

                    (document.getElementById('vista-actividad') as HTMLElement).innerText = p.actividad || '---';
                    (document.getElementById('vista-empresa') as HTMLElement).innerText = empresaNombre;
                    (document.getElementById('vista-cliente') as HTMLElement).innerText = clienteNombre;

                    const serviciosTabla = document.getElementById('vista-servicios-tabla') as HTMLTableSectionElement;
                    if (serviciosTabla) {
                        const servicios = p.servicios_detallados || [];
                        serviciosTabla.innerHTML = servicios.length > 0 ? servicios.map((s: any, idx: number) => `
                            <tr style="${idx % 2 === 0 ? 'background:#ffffff' : 'background:#f9fafb;'} border-bottom:1px solid #e5e7eb;">
                                <td style="padding:10px 12px; font-size:12px; color:#1f2937;">${s.nombre || '---'}</td>
                                <td style="padding:10px 12px; text-align:center;">
                                    <span style="display:inline-block; padding:4px 10px; background:#06b6d4; color:white; border-radius:20px; font-weight:600; font-size:11px; white-space:nowrap;">
                                        ${s.frecuencia || '---'}
                                    </span>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="2" style="padding:20px; text-align:center; color:#94a3b8;">Sin servicios</td></tr>';
                    }

                    (document.getElementById('vista-subtotal') as HTMLElement).innerText = `S/ ${Number(ref.subtotal || 0).toFixed(2)}`;
                    (document.getElementById('vista-igv') as HTMLElement).innerText = `S/ ${Number(ref.igv || 0).toFixed(2)}`;
                    (document.getElementById('vista-total-os') as HTMLElement).innerText = `S/ ${Number(ref.precio_total_os || ref.total_costo || 0).toFixed(2)}`;
                    (document.getElementById('vista-detrax') as HTMLElement).innerText = `S/ ${Number(p.monto_detrax || 0).toFixed(2)}`;
                    (document.getElementById('vista-neto') as HTMLElement).innerText = `S/ ${Number(p.total_final || 0).toFixed(2)}`;

                    (document.getElementById('vista-fecha-ejecucion') as HTMLElement).innerText = p.fecha_ejecucion ? p.fecha_ejecucion.split('T')[0] : '---';
                    (document.getElementById('vista-num-factura') as HTMLElement).innerText = p.n_factura || '---';
                    (document.getElementById('vista-fecha-factura') as HTMLElement).innerText = p.fecha_factura ? p.fecha_factura.split('T')[0] : '---';
                    (document.getElementById('vista-dias-credito') as HTMLElement).innerText = p.dias_credito || '0';
                    (document.getElementById('vista-fecha-vcto') as HTMLElement).innerText = p.fecha_vcto ? p.fecha_vcto.split('T')[0] : '---';
                    (document.getElementById('vista-dias-vencer') as HTMLElement).innerText = p.dia_vencer || '0';
                    (document.getElementById('vista-fecha-pago') as HTMLElement).innerText = p.fecha_pago ? p.fecha_pago.split('T')[0] : '---';

                    const modalVista = document.getElementById('modal-vista');
                    if (modalVista) {
                        modalVista.style.display = 'block';
                        toggleBodyScroll(true);
                    }
                }
            } catch (error) {
                console.error("Error al obtener detalles:", error);
            }
        }

        // BOTÓN DUPLICAR (INDIVIDUAL)
        if (actionButton.classList.contains('btn-accion-duplicar')) {
            const id = actionButton.getAttribute('data-id');
            if (!id) return;
            
            // Reutilizar la lógica de duplicación pasándole solo este ID
            await ejecutarDuplicacion([id]);
        }

        // BOTÓN EDITAR
        if (actionButton.classList.contains('btn-accion-editar')) {
            const id = actionButton.getAttribute('data-id');
            if (!id) return;

            try {
                const resp = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones/${id}`, {
                    headers: getAuthHeaders()
                });
                const result = await resp.json();

                if (result.success) {
                    const p = result.data;
                    const ref = p.orden_servicio || p.orden_producto || p.orden_capacitacion || p.orden_auditoria || p.orden_asesoria || {};

                    (document.getElementById('edit-actividad') as HTMLInputElement).value = p.actividad || '';
                    (document.getElementById('edit-alias') as HTMLSelectElement).value = String(p.id_multicim || 1);
                    (document.getElementById('edit-cliente') as HTMLInputElement).value = ref.cliente ? (ref.cliente.nombre_empresa || ref.cliente.nombre_comercial) : '---';

                    const serviciosTablaEdit = document.getElementById('edit-servicios-tabla') as HTMLTableSectionElement;
                    if (serviciosTablaEdit) {
                        const servicios = p.servicios_detallados || [];
                        serviciosTablaEdit.innerHTML = servicios.length > 0 ? servicios.map((s: any, idx: number) => `
                            <tr style="${idx % 2 === 0 ? 'background:#ffffff' : 'background:#f9fafb;'} border-bottom:1px solid #e5e7eb;">
                                <td style="padding:10px 12px; font-size:12px; color:#1f2937;">${s.nombre || '---'}</td>
                                <td style="padding:10px 12px; text-align:center;">
                                    <span style="display:inline-block; padding:6px 12px; background:#06b6d4; color:white; border-radius:20px; font-weight:600; font-size:12px; white-space:nowrap;">
                                        ${s.frecuencia || '---'}
                                    </span>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="2" style="padding:20px; text-align:center; color:#94a3b8;">Sin servicios</td></tr>';
                    }

                    (document.getElementById('edit-estado') as HTMLSelectElement).value = p.estado || 'Sin Factura';
                    (document.getElementById('edit-base-imponible') as HTMLInputElement).value = p.base_imponible || ref.subtotal || '';
                    (document.getElementById('edit-cotizacion-oc') as HTMLInputElement).value = p.cotizacion_oc || '';
                    (document.getElementById('edit-observaciones') as HTMLTextAreaElement).value = p.observaciones || '';
                    (document.getElementById('edit-fecha-pago-detraccion') as HTMLInputElement).value = p.fecha_pago_detraccion ? p.fecha_pago_detraccion.split('T')[0] : '';

                    (document.getElementById('edit-igv') as HTMLElement).innerText = `S/ ${Number(p.igv || ref.igv || 0).toFixed(2)}`;
                    (document.getElementById('edit-total-os') as HTMLElement).innerText = `S/ ${(Number(p.base_imponible || ref.subtotal || 0) + Number(p.igv || ref.igv || 0)).toFixed(2)}`;
                    (document.getElementById('edit-detrax') as HTMLElement).innerText = `S/ ${Number(p.monto_detrax || 0).toFixed(2)}`;
                    (document.getElementById('edit-neto') as HTMLElement).innerText = `S/ ${Number(p.total_final || 0).toFixed(2)}`;

                    (document.getElementById('edit-fecha-ejecucion') as HTMLInputElement).value = p.fecha_ejecucion ? p.fecha_ejecucion.split('T')[0] : '';
                    (document.getElementById('edit-num-factura') as HTMLInputElement).value = p.n_factura || '';
                    (document.getElementById('edit-fecha-factura') as HTMLInputElement).value = p.fecha_factura ? p.fecha_factura.split('T')[0] : '';
                    (document.getElementById('edit-dias-credito') as HTMLInputElement).value = p.dias_credito ? String(p.dias_credito) : '';
                    (document.getElementById('edit-fecha-vcto') as HTMLInputElement).value = p.fecha_vcto ? p.fecha_vcto.split('T')[0] : '';
                    (document.getElementById('edit-dias-vencer') as HTMLInputElement).value = p.dia_vencer ? String(p.dia_vencer) : '';
                    (document.getElementById('edit-fecha-pago') as HTMLInputElement).value = p.fecha_pago ? p.fecha_pago.split('T')[0] : '';

                    const formEditar = document.getElementById('form-editar-factura') as HTMLFormElement;
                    if (formEditar) formEditar.dataset.idProyeccion = String(id);

                    const modalEdicion = document.getElementById('modal-edicion');
                    if (modalEdicion) {
                        modalEdicion.style.display = 'block';
                        toggleBodyScroll(true);
                    }
                }
            } catch (error) {
                console.error("Error al cargar datos para edición:", error);
            }
        }

        // BOTÓN ELIMINAR
        if (actionButton.classList.contains('btn-accion-eliminar')) {
            const id = actionButton.getAttribute('data-id');
            if (!id) return;

            const overlay = document.createElement('div');
            overlay.id = 'modal-confirm-delete-proyeccion';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
            overlay.innerHTML = `
                <div style="background:#fff;border-radius:12px;width:95%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
                    <h2 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">Confirmar Eliminación</h2>
                    <button id="btn-cerrar-delete-proy" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:22px;line-height:1;">&times;</button>
                </div>
                <div style="padding:32px 24px;text-align:center;">
                    <div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                    <p style="font-size:15px;color:#334155;margin-bottom:8px;">¿Está seguro de que desea eliminar esta proyección?</p>
                    <p style="font-size:13px;color:#dc2626;margin-top:12px;font-weight:500;">Esta acción no se puede deshacer.</p>
                </div>
                <div style="display:flex;justify-content:center;gap:12px;padding:20px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;border-radius:0 0 12px 12px;">
                    <button id="btn-cancelar-delete-proy" style="padding:10px 20px;background:#fff;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
                    <button id="btn-confirmar-delete-proy" style="padding:10px 20px;background:#dc2626;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.1);">Eliminar</button>
                </div>
                </div>
            `;

            document.body.appendChild(overlay);

            document.getElementById('btn-cerrar-delete-proy')?.addEventListener('click', () => overlay.remove());
            document.getElementById('btn-cancelar-delete-proy')?.addEventListener('click', () => overlay.remove());
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

            document.getElementById('btn-confirmar-delete-proy')?.addEventListener('click', async () => {
                const btnConfirm = document.getElementById('btn-confirmar-delete-proy') as HTMLButtonElement;
                btnConfirm.disabled = true;
                btnConfirm.textContent = 'Procesando...';
                
                try {
                    const resp = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones/${id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });

                    const result = await resp.json();

                    if (resp.ok && result.success) {
                        mostrarToast('success', 'Éxito', 'Proyección eliminada con éxito');
                        overlay.remove();
                        // Recargar proyecciones del mes actual
                        const mesActual = (window as any).mesActual || new Date().getMonth() + 1;
                        const anioActual = (window as any).anioActual || new Date().getFullYear();
                        const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
                        const respuesta = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones?mes=${mesActual}&anio=${anioActual}`, {
                            headers: {
                                'Accept': 'application/json',
                                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                            },
                        });
                        const resultData = await respuesta.json();
                        const rawData = resultData.data || resultData;
                        const nuevasProyecciones = Array.isArray(rawData) ? rawData : [];

                        const tabContent = document.getElementById('facturacion-tab-content');
                        if (tabContent) {
                            tabContent.innerHTML = renderOrdenesProyectadasTab(nuevasProyecciones);
                            initFacturacionTableEvents(nuevasProyecciones);
                        }
                    } else {
                        mostrarToast('error', 'Error al eliminar', result.message || 'Error desconocido');
                        btnConfirm.disabled = false;
                        btnConfirm.textContent = 'Eliminar';
                    }
                } catch (error) {
                    console.error("Error al eliminar:", error);
                    mostrarToast('error', 'Error', 'Error de conexión');
                    btnConfirm.disabled = false;
                    btnConfirm.textContent = 'Eliminar';
                }
            });
        }
    }, { once: false });
}

// --- 6. MANEJADORES DE MODALES DE VISTA Y EDICIÓN ---
export function attachModalHandlers() {
    const modalVista = document.getElementById('modal-vista');
    const btnCerrarVista = document.getElementById('btn-cerrar-vista');
    const btnCerrarVistaBtn = document.getElementById('btn-cerrar-vista-btn');

    const cerrarVista = () => {
        if (modalVista) {
            modalVista.style.display = 'none';
            toggleBodyScroll(false);
        }
    };

    btnCerrarVista?.addEventListener('click', cerrarVista);
    btnCerrarVistaBtn?.addEventListener('click', cerrarVista);
    modalVista?.addEventListener('click', (e) => { if (e.target === modalVista) cerrarVista(); });

    const modalEdicion = document.getElementById('modal-edicion');
    const btnCerrarEdicion = document.getElementById('btn-cerrar-edicion');
    const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
    const formEditar = document.getElementById('form-editar-factura') as HTMLFormElement;

    const cerrarEdicion = () => {
        if (modalEdicion) {
            modalEdicion.style.display = 'none';
            toggleBodyScroll(false);
        }
    };

    btnCerrarEdicion?.addEventListener('click', cerrarEdicion);
    btnCancelarEdicion?.addEventListener('click', cerrarEdicion);
    modalEdicion?.addEventListener('click', (e) => { if (e.target === modalEdicion) cerrarEdicion(); });

    // --- CÁLCULOS DINÁMICOS EDICIÓN ---
    const editBaseImponible = document.getElementById('edit-base-imponible') as HTMLInputElement;
    editBaseImponible?.addEventListener('input', () => {
        const base = parseFloat(editBaseImponible.value || '0');
        const igv = base * 0.18;
        const total = base + igv;
        const detrax = total > 700 ? total * 0.12 : 0;
        const neto = total - detrax;

        document.getElementById('edit-igv')!.innerText = `S/ ${igv.toFixed(2)}`;
        document.getElementById('edit-total-os')!.innerText = `S/ ${total.toFixed(2)}`;
        document.getElementById('edit-detrax')!.innerText = `S/ ${detrax.toFixed(2)}`;
        document.getElementById('edit-neto')!.innerText = `S/ ${neto.toFixed(2)}`;
    });

    // --- SUBMIT DEL FORMULARIO DE EDICIÓN ---
    formEditar?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const idProyeccion = formEditar.dataset.idProyeccion;
        if (!idProyeccion) {
            mostrarToast('error', 'Error', 'ID no identificado');
            return;
        }

        const numFactura = (document.getElementById('edit-num-factura') as HTMLInputElement).value || null;
        const fechaFactura = (document.getElementById('edit-fecha-factura') as HTMLInputElement).value || null;
        const diasCredito = (document.getElementById('edit-dias-credito') as HTMLInputElement).value ? Number((document.getElementById('edit-dias-credito') as HTMLInputElement).value) : null;
        const diasVencer = (document.getElementById('edit-dias-vencer') as HTMLInputElement).value ? Number((document.getElementById('edit-dias-vencer') as HTMLInputElement).value) : null;
        const fechaPago = (document.getElementById('edit-fecha-pago') as HTMLInputElement).value || null;
        const fechaEjecucion = (document.getElementById('edit-fecha-ejecucion') as HTMLInputElement).value || null;
        const fechaVcto = (document.getElementById('edit-fecha-vcto') as HTMLInputElement).value || null;
        const actividad = (document.getElementById('edit-actividad') as HTMLInputElement).value || null;
        const idMulticim = (document.getElementById('edit-alias') as HTMLSelectElement).value ? Number((document.getElementById('edit-alias') as HTMLSelectElement).value) : null;

        console.log('DEBUG - Enviando idMulticim:', idMulticim, 'select value:', (document.getElementById('edit-alias') as HTMLSelectElement).value);

        const estado = (document.getElementById('edit-estado') as HTMLSelectElement).value;
        const baseImponible = parseFloat((document.getElementById('edit-base-imponible') as HTMLInputElement).value || '0');
        const cotizacionOc = (document.getElementById('edit-cotizacion-oc') as HTMLInputElement).value || null;
        const fechaPagoDetraccion = (document.getElementById('edit-fecha-pago-detraccion') as HTMLInputElement).value || null;
        const observaciones = (document.getElementById('edit-observaciones') as HTMLTextAreaElement).value || null;

        const base = baseImponible;
        const igv = base * 0.18;
        const totalOS = base + igv;
        const montoDetrax = totalOS > 700 ? totalOS * 0.12 : 0;
        const totalFinal = totalOS - montoDetrax;

        const payload = {
            id_multicim: idMulticim,
            actividad: actividad,
            estado: estado,
            base_imponible: baseImponible,
            igv: igv,
            porcentaje_detraccion: 12,
            monto_detrax: montoDetrax,
            total_final: totalFinal,
            cotizacion_oc: cotizacionOc,
            observaciones: observaciones,
            fecha_pago_detraccion: fechaPagoDetraccion,
            n_factura: numFactura,
            fecha_factura: fechaFactura,
            dias_credito: diasCredito,
            dia_vencer: diasVencer,
            fecha_pago: fechaPago,
            fecha_ejecucion: fechaEjecucion,
            fecha_vcto: fechaVcto
        };

        try {
            const resp = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones/${idProyeccion}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });

            const result = await resp.json();

            if (resp.ok && result.success) {
                mostrarToast('success', 'Éxito', '¡Cambios guardados con éxito!');
                if (modalEdicion) modalEdicion.style.display = 'none';

                // Recargar proyecciones del mes actual sin hacer reload de página
                const mesActual = (window as any).mesActual || new Date().getMonth() + 1;
                const anioActual = (window as any).anioActual || new Date().getFullYear();
                const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
                const respuesta = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones?mes=${mesActual}&anio=${anioActual}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                });
                const resultData = await respuesta.json();
                const rawData = resultData.data || resultData;
                const nuevasProyecciones = Array.isArray(rawData) ? rawData : [];

                const tabContent = document.getElementById('facturacion-tab-content');
                if (tabContent) {
                    tabContent.innerHTML = renderOrdenesProyectadasTab(nuevasProyecciones);
                    initFacturacionTableEvents(nuevasProyecciones);
                }
            } else {
                const msg = result.errors ? JSON.stringify(result.errors) : (result.message || 'Error desconocido');
                mostrarToast('error', 'Error al guardar', msg);
            }
        } catch (error) {
            console.error("Error en actualización:", error);
            mostrarToast('error', 'Error', 'Error de conexión con el servidor');
        }
    });
}