function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
  return {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
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
                          <option value="servicio">Orden de Servicio</option>
                          <option value="producto">Orden de Producto</option>
                          <option value="capacitacion">Orden de Capacitación</option>
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

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:25px;">
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Actividad</label>
                    <input type="text" id="in-actividad" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; outline-color:#3b82f6;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Empresa (Emisor)</label>
                    <select id="res-alias" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:white; font-weight:bold; color:#1e293b;">
                        <option value="1">MULTI</option>
                        <option value="2">CIM</option>
                    </select>
                </div>

                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Cliente</label>
                    <input type="text" id="res-cliente" readonly style="width:100%; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; color:#64748b;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Servicio/Producto</label>
                    <input type="text" id="res-servicio" readonly style="width:100%; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; color:#64748b;">
                </div>
                <div>
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Frecuencia</label>
                    <input type="text" id="res-frecuencia" readonly style="width:100%; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; color:#64748b;">
                </div>
            </div>

                  <h4 style="margin:0 0 15px 0; color: #334155; font-size: 15px; border-bottom: 2px solid #10b981; display: inline-block; padding-bottom: 4px;">Datos de Facturación</h4>
                  
                  <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:25px; padding:15px; border: 1px solid #10b981; border-radius:8px;">
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Ejecución *</label>
                          <input type="date" id="in-fecha-ejecucion"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">N° de Factura *</label>
                          <input type="text" id="in-num-factura" placeholder="F001-000000"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px; outline-color:#10b981;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Factura   *</label>
                          <input type="date" id="in-fecha-factura"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Días Crédito</label>
                          <input type="number" id="in-dias-credito" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Vcto Factura *</label>
                          <input type="date" id="in-fecha-vcto"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Días Vencer</label>
                          <input type="number" id="in-dias-vencer" style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                      <div>
                          <label style="display:block; font-size:12px; font-weight:600; color:#065f46; margin-bottom:5px;">Fecha Pago *</label>
                          <input type="date" id="in-fecha-pago"  style="width:100%; padding:8px; border:1px solid #10b981; border-radius:6px;">
                      </div>
                  </div>

                  <div style="display:flex; justify-content: space-between; gap:20px; margin-bottom:15px; padding:10px 20px; background:#f8fafc; border-radius:8px; border: 1px dashed #cbd5e1;">
                      <div style="text-align:left;">
                          <span style="display:block; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Subtotal OS</span>
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
                            <span style="display:block; font-size:11px; color:#1e40af; font-weight:700; text-transform:uppercase;">Total OS</span> <span style="font-size:16px; font-weight:bold; color:#1e3a8a;">S/ <span id="res-subtotal">0.00</span></span> </div>
                        <div style="text-align:center;">
                            <span style="display:block; font-size:11px; color:#1e40af; font-weight:700; text-transform:uppercase;">Detracción (12%)</span>
                            <span style="font-size:16px; font-weight:bold; color:#dc2626;">- S/ <span id="res-detrax">0.00</span></span>
                        </div>
                        <div style="text-align:center; background: white; padding: 10px 20px; border-radius: 8px; border: 2px solid #1e40af;">
                            <span style="display:block; font-size:11px; color:#1e40af; font-weight:700; text-transform:uppercase;">Neto a Cobrar</span>
                            <span style="font-size:20px; font-weight:900; color:#1e40af;">S/ <span id="res-neto">0.00</span></span>
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
// --- TAB: ÓRDENES PROYECTADAS (Tabla principal) ---
export function renderOrdenesProyectadasTab(proyecciones: any[] = []) {
  if (proyecciones.length === 0) {
    return `<div style="text-align:center; padding:50px; color: #64748b;">No hay registros.</div>`;
  }

  const fDate = (d: string | null) => d ? d.split('T')[0] : '---';

  return `
    <div class="table-container" style="overflow-x: auto;">
      <table class="data-table" style="min-width: 1400px; width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px; text-align: left;">ACTIVIDAD</th>
            <th style="padding: 12px; text-align: left;">EMPRESA</th>
            <th style="padding: 12px; text-align: left;">CLIENTE</th>
            <th style="padding: 12px; text-align: left;">SERVICIO / FRECUENCIA</th>
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
          </tr>
        </thead>
        <tbody>
        ${proyecciones.map(p => {
          // Obtenemos la referencia de la orden (servicio, producto o capacitación)
          const ref = p.orden_servicio || p.orden_producto || p.orden_capacitacion || {};
          
          const clienteNombre = ref.cliente ? (ref.cliente.nombre_empresa || ref.cliente.nombre_comercial) : 'Sin cliente';
          
          // Generamos la lista de servicios con su frecuencia respectiva
          const servicioFrecuenciaHtml = ref.detalles 
            ? ref.detalles.map((d: any) => `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 4px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px;">
                    <span style="font-size: 11px; color: #2563eb; font-weight: 500;">• ${d.servicio ? d.servicio.nombre : 'Servicio'}</span>
                    <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; border: 1px solid #e2e8f0;">
                        ${d.frecuencia || '---'}
                    </span>
                </div>`).join('')
            : `<div style="font-size: 10px;">${ref.servicio || '---'}</div>`;

          return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
              <td style="padding: 10px;">${p.actividad || '---'}</td>
              <td style="padding: 10px; font-weight: bold; color: #475569;">
                  ${p.multicim_emisora ? p.multicim_emisora.alias_empresa : '---'}
              </td>
              <td style="padding: 10px; font-weight: 600;">${clienteNombre}</td>

              <td style="padding: 10px; min-width: 200px;">
                  ${servicioFrecuenciaHtml}
              </td>

              <td style="padding: 10px; text-align: center;">${fDate(p.fecha_ejecucion)}</td>

              <td style="padding: 10px; white-space: nowrap;">
                  <div style="font-size: 12px; color: #94a3b8;">Sub: ${Number(ref.subtotal || 0).toFixed(2)}</div>
                  <div style="font-size: 12px; color: #94a3b8;">Igv: ${Number(ref.igv || 0).toFixed(2)}</div>
                  <div style="font-weight: 500;">Tot: ${Number(ref.precio_total_os || ref.total_costo || 0).toFixed(2)}</div>
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
                  <span style="color: ${p.dia_vencer <= 5 ? '#ef4444' : '#1e293b'}; font-weight: bold;">
                      ${p.dia_vencer || 0}
                  </span>
              </td>
              <td style="padding: 10px; color: #6366f1; font-weight: 600;">${fDate(p.fecha_pago)}</td>
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
export function renderFacturacion(proyecciones: any[] = [], ordenesPendientes: any[] = []) {
  return `
    <div class="page-header">
      <div>
        <h1>Facturación y Cobranza</h1>
      </div>
      <button id="btn-nueva-factura" class="btn-primary"> + Nueva Proyección</button>
    </div>

    <div class="tabs-container">
      <div class="tabs-header">
        <button class="tab-btn active" data-tab="ordenes">Órdenes Proyectadas</button>
        <button class="tab-btn" data-tab="contratos">Contratos Fijos</button>
        <button class="tab-btn" data-tab="cobranza">Estado de Cobranza</button>
      </div>
      
      <div id="facturacion-tab-content" class="tab-content">
        ${renderOrdenesProyectadasTab(proyecciones)}
      </div>
    </div>

    ${renderModalFactura()}
  `;
}

// --- LÓGICA DE EVENTOS (LLAMAR DESDE MAIN.TS) ---
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
  const modalTipo = document.getElementById('modal-tipo-orden') as HTMLSelectElement;
  const selectOrden = document.getElementById('modal-select-orden') as HTMLSelectElement;
  const form = document.getElementById('form-nueva-factura') as HTMLFormElement;
  const modal = document.getElementById('modal-factura');

  // --- 1. ABRIR MODAL ---
  const btnNueva = document.getElementById('btn-nueva-factura');
  btnNueva?.addEventListener('click', () => {
    if (modal) {
      modal.style.display = 'block';
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

  const cerrarModal = () => { if (modal) modal.style.display = 'none'; };

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
      const resp = await fetch(`http://localhost:8000/api/v1/${endpoint}`, { headers: getAuthHeaders() });
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
      const resp = await fetch(`http://localhost:8000/api/v1/proyecciones/buscar-orden/${tipo}/${id}`, { headers: getAuthHeaders() });
      const result = await resp.json();

      if (result.success) {
        const d = result.data; // Esta es la data "planita" de Thunder
        if (form) form.style.display = 'block';

        // Ahora sí, los nombres coinciden 1:1 con tu Thunder Client
        (document.getElementById('res-cliente') as HTMLInputElement).value = d.nombre_cliente;
        (document.getElementById('res-servicio') as HTMLInputElement).value = d.servicio;
        (document.getElementById('res-frecuencia') as HTMLInputElement).value = d.frecuencia || '---';
        (document.getElementById('in-actividad') as HTMLInputElement).value = d.actividad || '';

        const comboEmpresa = document.getElementById('res-alias') as HTMLSelectElement;
        if (comboEmpresa && d.id_multicim) {
            comboEmpresa.value = String(d.id_multicim);
        }

        // Datos de la OS para mostrar en el modal
        document.getElementById('info-subtotal')!.innerText = Number(d.subtotal).toFixed(2);
        document.getElementById('info-igv')!.innerText      = Number(d.igv).toFixed(2);
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

 // --- 5. SUBMIT DEL FORMULARIO ---
form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idRef = Number(selectOrden.value);
    const tipo = modalTipo.value;

    // CAPTURA DE VALORES NUEVOS (Obligatorios para tu nuevo store)
    const clienteNombre = (document.getElementById('res-cliente') as HTMLInputElement).value;
    const servicioNombre = (document.getElementById('res-servicio') as HTMLInputElement).value;
    const actividadManual = (document.getElementById('in-actividad') as HTMLInputElement).value;

    // Captura de importes desglosados (limpiando posibles espacios o S/)
    const subtotal = parseFloat(document.getElementById('info-subtotal')?.innerText || '0');
    const igv = parseFloat(document.getElementById('info-igv')?.innerText || '0');
    const totalOS = parseFloat(document.getElementById('info-total-os')?.innerText || '0');

    const numFactura = (document.getElementById('in-num-factura') as HTMLInputElement).value;
    const fechaFactura = (document.getElementById('in-fecha-factura') as HTMLInputElement).value;
    const diasCredito = Number((document.getElementById('in-dias-credito') as HTMLInputElement).value);
    const diasVencer = Number((document.getElementById('in-dias-vencer') as HTMLInputElement).value);

    // Fechas adicionales
    const fechaPago = (document.getElementById('in-fecha-pago') as HTMLInputElement).value;
    const fechaEjecucion = (document.getElementById('in-fecha-ejecucion') as HTMLInputElement).value;

    const montoDetrax = parseFloat(document.getElementById('res-detrax')?.innerText || '0');
    const totalFinal = parseFloat(document.getElementById('res-neto')?.innerText || '0');

    const idMulticimReal = Number((document.getElementById('res-alias') as HTMLSelectElement).value);

    // EL PAYLOAD COMPLETO QUE ESPERA LARAVEL
    const payload = {
        id_multicim: idMulticimReal,
        tipo_orden: tipo,
        id_referencia: idRef,
        actividad: actividadManual,
        cliente: clienteNombre,      
        servicio: servicioNombre,    
        subtotal: subtotal,          
        igv: igv,                    
        precio_total_os: totalOS,    
        monto_detrax: montoDetrax,
        total_final: totalFinal,
        n_factura: numFactura,
        fecha_factura: fechaFactura || null,
        dias_credito: diasCredito,
        dia_vencer: diasVencer,
        fecha_pago: fechaPago || null,
        fecha_ejecucion: fechaEjecucion || null
    };

    console.log("Enviando al controlador:", payload);

    try {
        const resp = await fetch('http://localhost:8000/api/v1/proyecciones', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                ...getAuthHeaders() 
            },
            body: JSON.stringify(payload)
        });

        const result = await resp.json();

        if (resp.ok && result.success) {
            alert('¡Proyección registrada con éxito!');
            if (modal) modal.style.display = 'none';
            window.location.reload();
        } else {
            const msg = result.errors ? JSON.stringify(result.errors) : (result.message || 'Error desconocido');
            alert('Error de validación: ' + msg);
        }
    } catch (error) {
        console.error("Error en submit:", error);
        alert('Error de conexión con el servidor');
    }
});
}