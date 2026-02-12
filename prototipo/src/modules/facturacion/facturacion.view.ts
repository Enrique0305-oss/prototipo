// --- MODAL DE NUEVA FACTURA (Componente Interno) ---
// --- MODAL DE NUEVA FACTURA ---
function renderModalFactura() {
  return `
  <div id="modal-factura" class="modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background: rgba(0,0,0,0.5); overflow-y: auto;">
      <div class="modal-content" style="background:#fff; margin:5% auto; padding:20px; width:850px; border-radius:12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:15px;">
              <h3 style="margin:0; color: #1e293b;">Proyectar Factura</h3>
              <button id="btn-cerrar-modal" style="background:none; border:none; font-size:24px; cursor:pointer; color: #64748b;">&times;</button>
          </div>

          <div class="modal-body" style="padding:20px 0;">
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:20px; border: 1px solid #e2e8f0;">
                  <div>
                      <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">1. Tipo de Orden</label>
                      <select id="modal-tipo-orden" class="filter-select" style="width:100%;">
                          <option value="">-- Seleccione Tipo --</option>
                          <option value="servicio">Orden de Servicio</option>
                          <option value="producto">Orden de Producto</option>
                          <option value="capacitacion">Orden de Capacitación</option>
                      </select>
                  </div>
                  <div>
                      <label style="display:block; font-size:12px; font-weight:600; margin-bottom:5px;">2. Seleccionar Número de Orden</label>
                      <select id="modal-select-orden" class="filter-select" style="width:100%;" disabled>
                          <option value="">-- Primero elija tipo --</option>
                      </select>
                  </div>
              </div>

              <form id="form-nueva-factura" style="display:none; border-top: 2px dashed #e2e8f0; padding-top: 20px;">
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                      <div style="background:#f1f5f9; padding:20px; border-radius:8px; font-size: 13px;">
                          <h4 style="margin:0 0 15px 0; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Detalles de la Orden</h4>
                          <div style="display:grid; gap:8px;">
                            <p><strong>Cliente:</strong> <span id="res-cliente"></span></p>
                            <p><strong>Actividad:</strong> <span id="res-actividad"></span></p>
                            <p><strong>Servicio:</strong> <span id="res-servicio"></span></p>
                            <hr style="border: 0; border-top: 1px solid #cbd5e1;">
                            <p style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <span>S/ <span id="res-subtotal">0.00</span></span></p>
                            <p style="display:flex; justify-content:space-between;"><span>IGV (18%):</span> <span>S/ <span id="res-igv">0.00</span></span></p>
                            <p style="display:flex; justify-content:space-between; font-weight:bold; font-size: 1.1em;"><span>Total OS:</span> <span>S/ <span id="res-total">0.00</span></span></p>
                            <p style="display:flex; justify-content:space-between; color: #dc2626;"><span>Detracción (12%):</span> <span>- S/ <span id="res-detrax">0.00</span></span></p>
                            <p style="display:flex; justify-content:space-between; color: #16a34a; font-size: 1.2em; font-weight: bold; background: #fff; padding: 5px; border-radius: 4px;">
                                <span>Neto a Cobrar:</span> <span>S/ <span id="res-neto">0.00</span></span>
                            </p>
                          </div>
                      </div>

                      <div style="display:grid; gap:15px; align-content: start;">
                          <h4 style="margin:0; color: #334155;">Datos de Proyección</h4>
                          <div>
                              <label style="display:block; font-size:12px; font-weight:600;">Número de Factura</label>
                              <input type="text" id="in-num-factura" placeholder="F001-000000" class="search-input" style="width:100%; border: 1px solid #cbd5e1;" required>
                          </div>
                          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                              <div>
                                  <label style="display:block; font-size:12px; font-weight:600;">Fecha Emisión</label>
                                  <input type="date" id="in-fecha-emision" class="filter-select" style="width:100%;" required>
                              </div>
                              <div>
                                  <label style="display:block; font-size:12px; font-weight:600;">Días Crédito</label>
                                  <input type="number" id="in-dias-credito" value="30" class="filter-select" style="width:100%;">
                              </div>
                          </div>
                      </div>
                  </div>
                  <div style="text-align:right; margin-top:25px; border-top: 1px solid #eee; padding-top: 15px;">
                      <button type="button" id="btn-cancelar" style="background:#e2e8f0; color:#475569; border:none; padding:10px 20px; border-radius:6px; margin-right:10px; cursor:pointer;">Cancelar</button>
                      <button type="submit" class="btn-primary" style="padding:10px 30px;">Registrar en Proyecciones</button>
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

    ${renderModalFactura()}
  `;
}

// --- LÓGICA DE EVENTOS (LLAMAR DESDE MAIN.TS) ---
// 1. Definimos la forma de la Orden (el JSON que me pasaste)
interface OrdenReferencia {
  id_referencia: number;
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
  modalTipo?.addEventListener('change', async () => {
    const tipo = modalTipo.value;
    if (!tipo) {
      selectOrden.disabled = true;
      selectOrden.innerHTML = '<option value="">-- Primero elija tipo --</option>';
      return;
    }

    try {
      const endpoint = tipo === 'servicio' ? 'ordenes-servicio' : `ordenes-${tipo}`;
      const resp = await fetch(`http://localhost:8000/api/v1/${endpoint}`);
      const result = await resp.json();
      console.log("2. Datos que llegaron del servidor:", result);
      
      const ordenes: OrdenReferencia[] = Array.isArray(result.data) ? result.data : [result.data];
      const IDsProyectados = proyecciones.map((p: any) => p.id_referencia);
      const disponibles = ordenes.filter((o: OrdenReferencia) => !IDsProyectados.includes(o.id_referencia));

      selectOrden.disabled = false;
      selectOrden.innerHTML = '<option value="">-- Seleccione Número de Orden --</option>';
      
      disponibles.forEach((o: OrdenReferencia) => {
        const opt = document.createElement('option');
        opt.value = String(o.id_referencia);
        opt.text = `${o.numero_orden} | ${o.nombre_cliente}`;
        opt.dataset.info = JSON.stringify(o);
        selectOrden.appendChild(opt);
      });
    } catch (error) {
      console.error("Error cargando órdenes:", error);
    }
  });

  // --- 4. SELECCIÓN DE ORDEN ESPECÍFICA ---
  selectOrden?.addEventListener('change', () => {
    const selectedOption = selectOrden.options[selectOrden.selectedIndex];
    if (selectedOption.value && selectedOption.dataset.info) {
      const data: OrdenReferencia = JSON.parse(selectedOption.dataset.info);
      if (form) form.style.display = 'block';

      // Llenado de etiquetas de resumen
      const fields = {
        'res-cliente': data.nombre_cliente,
        'res-actividad': data.actividad || 'Sin actividad',
        'res-servicio': data.servicio,
        'res-subtotal': data.subtotal.toFixed(2),
        'res-igv': data.igv.toFixed(2),
        'res-total': data.precio_total_os.toFixed(2),
        'res-detrax': data.monto_detrax.toFixed(2),
        'res-neto': data.total_final.toFixed(2)
      };

      Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.innerText = String(val || '---');
      });
    } else {
      if (form) form.style.display = 'none';
    }
  });

  // --- 5. SUBMIT DEL FORMULARIO ---
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Obtener valores de los inputs
    const idRef = Number(selectOrden.value);
    const tipo = modalTipo.value; // servicio, producto o capacitacion
    const numFactura = (document.getElementById('in-num-factura') as HTMLInputElement).value;
    const fechaEmi = (document.getElementById('in-fecha-emision') as HTMLInputElement).value;
    const diasCred = Number((document.getElementById('in-dias-credito') as HTMLInputElement).value);

    // 2. Obtener datos que ya calculamos y mostramos en los labels (para que coincidan con tu JSON)
    const actividad = document.getElementById('res-actividad')?.innerText || "";
    const montoDetrax = Number(document.getElementById('res-detrax')?.innerText || 0);
    const totalFinal = Number(document.getElementById('res-neto')?.innerText || 0);

    // 3. Construir el objeto siguiendo tu estructura SQL
    const payload: any = {
      actividad: actividad,
      id_multicim: 1, // Ajustar según tu lógica de empresa/usuario
      n_factura: numFactura,
      monto_detrax: montoDetrax,
      total_final: totalFinal,
      fecha_factura: fechaEmi,
      dias_credito: diasCred,
      // Los campos de ID según el tipo (como tu tabla SQL)
      id_orden_servicio: tipo === 'servicio' ? idRef : null,
      id_orden_producto: tipo === 'producto' ? idRef : null,
      id_orden_capacitacion_auditoria: tipo === 'capacitacion' ? idRef : null
    };

    try {
      const resp = await fetch('http://localhost:8000/api/v1/proyecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        alert('Proyección registrada con éxito');
        cerrarModal();
        window.location.reload(); 
      } else {
        const errorData = await resp.json();
        alert('Error del servidor: ' + (errorData.message || 'No se pudo registrar'));
      }
    } catch (error) {
      console.error("Error en submit:", error);
      alert('Error al conectar con el servidor');
    }
  });
}