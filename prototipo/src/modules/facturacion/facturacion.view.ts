// --- MODAL DE NUEVA FACTURA (Componente Interno) ---
function renderModalFactura() {
  return `
  <div id="modal-factura" class="modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background: rgba(0,0,0,0.5); overflow-y: auto;">
      <div class="modal-content" style="background:#fff; margin:5% auto; padding:20px; width:750px; border-radius:12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px;">
              <h3 style="margin:0; font-size: 1.25rem; color: #1e293b;">Proyectar Nueva Factura</h3>
              <button id="btn-cerrar-modal" style="background:none; border:none; font-size:24px; cursor:pointer; color: #64748b;">&times;</button>
          </div>

          <div class="modal-body" style="padding:20px 0;">
              <div style="background:#f8fafc; padding:15px; border-radius:8px; display:grid; grid-template-columns: 1fr 2fr; gap:15px; margin-bottom:20px; border: 1px solid #e2e8f0;">
                  <div>
                      <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px; color: #475569;">Tipo de Origen</label>
                      <select id="modal-tipo-ref" class="filter-select" style="width:100%; height: 38px;">
                          <option value="OS">Órdenes de Servicio</option>
                          <option value="OP">Órdenes de Producto</option>
                          <option value="OC">Órdenes de Capacitación</option>
                      </select>
                  </div>
                  <div>
                      <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px; color: #475569;">Seleccionar Orden Pendiente</label>
                      <select id="modal-select-orden" class="filter-select" style="width:100%; height: 38px;">
                          <option value="">-- Seleccione una orden --</option>
                          <option value="1">OS-2025-001 | Cliente: ABC Corp | S/ 1,500</option>
                          <option value="2">OS-2025-005 | Cliente: Inversiones SAC | S/ 3,200</option>
                      </select>
                  </div>
              </div>

              <form id="form-nueva-factura" style="display:none; border-top: 2px dashed #e2e8f0; padding-top: 20px;">
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                      <div style="background:#f1f5f9; padding:15px; border-radius:8px;">
                          <h4 style="margin:0 0 10px 0; font-size:13px; color: #64748b; text-transform: uppercase;">Resumen de la Orden</h4>
                          <div style="display:grid; gap:8px; font-size:13px;">
                              <p style="margin:0;"><strong>Cliente:</strong> <span id="res-cliente">---</span></p>
                              <p style="margin:0;"><strong>Monto Sugerido:</strong> <span id="res-monto">---</span></p>
                          </div>
                      </div>
                      <div style="display:grid; gap:12px;">
                          <div>
                              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Número de Factura Proyectada</label>
                              <input type="text" id="in-num-factura" placeholder="F001-00000" class="search-input" style="width:100%;" required>
                          </div>
                          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                              <div>
                                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Fecha Emisión</label>
                                  <input type="date" id="in-fecha-emision" class="filter-select" style="width:100%;" required>
                              </div>
                              <div>
                                  <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Días Crédito</label>
                                  <input type="number" id="in-dias-credito" value="30" class="filter-select" style="width:100%;">
                              </div>
                          </div>
                      </div>
                  </div>
                  <div style="text-align:right; margin-top:20px;">
                      <button type="submit" class="btn-primary">Registrar en Proyecciones</button>
                  </div>
              </form>
          </div>
      </div>
  </div>`;
}

// --- TAB: ÓRDENES PROYECTADAS ---
export function renderOrdenesProyectadasTab(proyecciones: any[] = []) {
  // Si no hay datos, mostrar estado vacío
  if (proyecciones.length === 0) {
    return `
      <div style="text-align: center; padding: 50px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
        <h3 style="color: #64748b;">No hay proyecciones registradas</h3>
        <p style="color: #94a3b8;">Haz clic en "Nueva Factura" para empezar a proyectar tus cobros.</p>
      </div>
    `;
  }

  // Si hay datos, renderizar la tabla con los campos correctos
  return `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>N° FACTURA</th>
            <th>ORIGEN / ORDEN</th>
            <th>CLIENTE</th>
            <th>EMISIÓN</th>
            <th>VENCIMIENTO (CRÉDITO)</th>
            <th>MONTO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          ${proyecciones.map(p => `
            <tr>
              <td><strong style="color: #2563eb;">${p.num_factura}</strong></td>
              <td>
                <div class="equipment-id">${p.tipo_orden}</div>
                <div style="font-size: 11px; font-weight: bold;">${p.codigo_orden}</div>
              </td>
              <td>${p.cliente}</td>
              <td>${p.fecha_emision}</td>
              <td>
                <div>${p.fecha_vencimiento}</div>
                <div style="font-size: 10px; color: #64748b;">${p.dias_credito} días</div>
              </td>
              <td><strong>S/ ${p.monto}</strong></td>
              <td><span class="status-indicator warning">Pendiente</span></td>
              <td>
                <button class="action-btn" title="Editar">✏️</button>
                <button class="action-btn" title="Eliminar" style="color: #ef4444;">🗑️</button>
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

export function renderFacturacion(datos: any[] = []) {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Facturación y Cobranza</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary" id="btn-nueva-factura">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Factura
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="ordenes">Órdenes Proyectadas</button>
      <button class="tab-btn" data-tab="contratos">Contratos Fijos</button>
      <button class="tab-btn" data-tab="cobranza">Estado de Cobranza</button>
    </div>

    <div id="facturacion-tab-content">
      ${renderOrdenesProyectadasTab(datos)}
    </div>

    ${renderModalFactura()}
  `;
}

// --- LÓGICA DE EVENTOS (LLAMAR DESDE MAIN.TS) ---

export function initFacturacionEvents() {
  const modal = document.getElementById('modal-factura');
  const btnAbrir = document.getElementById('btn-nueva-factura');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const selectOrden = document.getElementById('modal-select-orden') as HTMLSelectElement;
  const tipoRef = document.getElementById('modal-tipo-ref') as HTMLSelectElement;
  const form = document.getElementById('form-nueva-factura');

  if (btnAbrir) btnAbrir.onclick = () => { modal!.style.display = 'block'; };
  if (btnCerrar) btnCerrar.onclick = () => { modal!.style.display = 'none'; };

  // Al cambiar el tipo (OS, OP, OC), deberías recargar el select de órdenes
  tipoRef?.addEventListener('change', () => {
      console.log("Cargando órdenes de tipo:", tipoRef.value);
      // Aquí harías el fetch a Laravel: /api/ordenes-pendientes?tipo=${tipoRef.value}
  });

  // Al seleccionar una orden específica del listado
  selectOrden?.addEventListener('change', () => {
    if (selectOrden.value !== "") {
      form!.style.display = 'block';
      
      // Simulación: Estos datos vendrían del objeto seleccionado en el array de órdenes
      document.getElementById('res-cliente')!.innerText = "Cliente Ejemplo desde Select";
      document.getElementById('res-monto')!.innerText = "S/ 1,500.00";
    } else {
      form!.style.display = 'none';
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Aquí enviarías el ID de la orden y los datos de la factura a Laravel
    alert("Factura proyectada correctamente y vinculada a la orden.");
    modal!.style.display = 'none';
    (e.target as HTMLFormElement).reset();
    form!.style.display = 'none';
  });
}