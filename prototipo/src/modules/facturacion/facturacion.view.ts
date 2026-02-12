// --- MODAL DE NUEVA FACTURA (Componente Interno) ---
// --- MODAL DE NUEVA FACTURA ---
function renderModalFactura(ordenesPendientes: any[] = []) {
  return `
  <div id="modal-factura" class="modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background: rgba(0,0,0,0.5); overflow-y: auto;">
      <div class="modal-content" style="background:#fff; margin:5% auto; padding:20px; width:800px; border-radius:12px;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:15px;">
              <h3 style="margin:0;">Proyectar Factura desde Orden</h3>
              <button id="btn-cerrar-modal" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
          </div>

          <div class="modal-body" style="padding:20px 0;">
              <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:20px; border: 1px solid #e2e8f0;">
                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">Seleccionar Orden de Servicio</label>
                  <select id="modal-select-orden" class="filter-select" style="width:100%;">
                      <option value="">-- Seleccione una orden --</option>
                      ${ordenesPendientes.map(o => `
                        <option value="${o.id_referencia}">
                            ${o.numero_orden} | ${o.nombre_cliente} | S/ ${o.precio_total_os}
                        </option>
                      `).join('')}
                  </select>
              </div>

              <form id="form-nueva-factura" style="display:none; border-top: 2px dashed #e2e8f0; padding-top: 20px;">
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                      <div style="background:#f1f5f9; padding:15px; border-radius:8px; font-size: 13px;">
                          <h4 style="margin-top:0;">Detalle Económico</h4>
                          <p><strong>Cliente:</strong> <span id="res-cliente"></span></p>
                          <p><strong>Subtotal:</strong> S/ <span id="res-subtotal"></span></p>
                          <p><strong>IGV:</strong> S/ <span id="res-igv"></span></p>
                          <hr>
                          <p><strong>Total OS:</strong> S/ <span id="res-total"></span></p>
                          <p style="color: #dc2626;"><strong>Detracción (12%):</strong> S/ <span id="res-detrax"></span></p>
                          <p style="color: #16a34a; font-size: 1.1em;"><strong>Neto a Cobrar:</strong> S/ <span id="res-neto"></span></p>
                      </div>

                      <div style="display:grid; gap:12px;">
                          <div>
                              <label style="display:block; font-size:12px; font-weight:600;">Número de Factura</label>
                              <input type="text" id="in-num-factura" placeholder="F001-..." class="search-input" style="width:100%;" required>
                          </div>
                          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                              <div>
                                  <label style="display:block; font-size:12px; font-weight:600;">Emisión</label>
                                  <input type="date" id="in-fecha-emision" class="filter-select" style="width:100%;" required>
                              </div>
                              <div>
                                  <label style="display:block; font-size:12px; font-weight:600;">Días Crédito</label>
                                  <input type="number" id="in-dias-credito" value="30" class="filter-select" style="width:100%;">
                              </div>
                          </div>
                      </div>
                  </div>
                  <div style="text-align:right; margin-top:20px;">
                      <button type="submit" class="btn-primary">Registrar Proyección</button>
                  </div>
              </form>
          </div>
      </div>
  </div>`;
}

// --- TAB: ÓRDENES PROYECTADAS (Tabla principal) ---
export function renderOrdenesProyectadasTab(proyecciones: any[] = []) {
  if (proyecciones.length === 0) {
    return `<div style="text-align:center; padding:50px;">No hay registros de proyecciones.</div>`;
  }

  return `
    <div class="table-container" style="overflow-x: auto;">
      <table class="data-table" style="min-width: 1200px;">
        <thead>
          <tr>
            <th>N° ORDEN / CLIENTE</th>
            <th>SERVICIO / ACTIVIDAD</th>
            <th>SUBTOTAL</th>
            <th>IGV</th>
            <th>TOTAL OS</th>
            <th>DETRACCIÓN (12%)</th>
            <th>NETO A PAGAR</th>
            <th>N° FACTURA</th>
            <th>VENCIMIENTO</th>
            <th>ESTADO</th>
          </tr>
        </thead>
              <tbody>
        ${proyecciones.map(p => `
          <tr>
            <td>
              <div style="font-weight: bold; color: #2563eb;">${p.numero_orden || 'S/N'}</div>
              <div style="font-size: 11px; color: #64748b;">${p.nombre_cliente || 'Sin cliente'} (${p.alias_empresa || '---'})</div>
            </td>
            <td>
              <div style="font-size: 13px;">${p.servicio || 'Servicio General'}</div>
              <div style="font-size: 11px; color: #94a3b8;">${p.actividad || 'Sin actividad'}</div>
            </td>
            <td>S/ ${p.subtotal ? Number(p.subtotal).toFixed(2) : '0.00'}</td>
            <td>S/ ${p.igv ? Number(p.igv).toFixed(2) : '0.00'}</td>
            <td><strong style="color: #1e293b;">S/ ${p.precio_total_os ? Number(p.precio_total_os).toFixed(2) : '0.00'}</strong></td>
            <td style="color: #dc2626;">S/ ${p.monto_detrax ? Number(p.monto_detrax).toFixed(2) : '0.00'}</td>
            <td><strong style="color: #16a34a;">S/ ${p.total_final ? Number(p.total_final).toFixed(2) : '0.00'}</strong></td>
            <td>
              <span style="font-family: monospace; font-weight: 600;">${p.n_factura || '---'}</span>
            </td>
            <td>
              <div style="font-size: 12px;">${p.fecha_vcto || '---'}</div>
              <div style="font-size: 10px; color: #ef4444;">${p.dia_vencer ? p.dia_vencer + ' días' : ''}</div>
            </td>
            <td>
              <span class="status-indicator ${p.n_factura ? 'success' : 'warning'}">
                ${p.n_factura ? 'Facturado' : 'Por Facturar'}
              </span>
            </td>
          </tr>
        `).join('')}
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

    ${renderModalFactura(ordenesPendientes)}
  `;
}

// --- LÓGICA DE EVENTOS (LLAMAR DESDE MAIN.TS) ---
export function initFacturacionEvents(datosReales: any[] = []) {
  const selectOrden = document.getElementById('modal-select-orden') as HTMLSelectElement;
  const form = document.getElementById('form-nueva-factura');

  selectOrden?.addEventListener('change', () => {
    const encontrada = datosReales.find(o => String(o.id_referencia) === selectOrden.value);

    if (encontrada) {
      form!.style.display = 'block';
      document.getElementById('res-cliente')!.innerText = encontrada.nombre_cliente;
      document.getElementById('res-subtotal')!.innerText = encontrada.subtotal.toFixed(2);
      document.getElementById('res-igv')!.innerText = encontrada.igv.toFixed(2);
      document.getElementById('res-total')!.innerText = encontrada.precio_total_os.toFixed(2);
      document.getElementById('res-detrax')!.innerText = encontrada.monto_detrax.toFixed(2);
      document.getElementById('res-neto')!.innerText = encontrada.total_final.toFixed(2);
    } else {
      form!.style.display = 'none';
    }
  });
  
  // Agrega aquí los manejadores de abrir/cerrar modal...
}