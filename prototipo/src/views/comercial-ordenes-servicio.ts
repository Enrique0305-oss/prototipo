// Comercial - Órdenes de Servicio
import '../styles/ordenes-servicio.css';

// Declarar funciones globales
declare function mostrarFormularioOrdenServicio(): void;
declare function ocultarFormularioOrdenServicio(): void;
declare function agregarLineaServicio(): void;
declare function cargarCotizacion(): void;

// export function renderComercialOrdenesServicio() {
//   return `
//     <div class="page-header">
//       <h1>Órdenes de Servicio</h1>
//       <div class="header-actions">
//         <button class="btn-primary" onclick="mostrarFormularioOrdenServicio()">
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//             <line x1="12" y1="5" x2="12" y2="19"></line>
//             <line x1="5" y1="12" x2="19" y2="12"></line>
//           </svg>
//           Nueva Orden de Servicio
//         </button>
//       </div>
//     </div>

//     <!-- Lista de órdenes existentes -->
//     <div id="lista-ordenes-servicio">
//       <div class="stats-row" style="margin-bottom: 24px;">
//         <div class="stat-box">
//           <div class="stat-box-icon">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//               <polyline points="14 2 14 8 20 8"></polyline>
//               <line x1="16" y1="13" x2="8" y2="13"></line>
//               <line x1="16" y1="17" x2="8" y2="17"></line>
//             </svg>
//           </div>
//           <div class="stat-box-content">
//             <div class="stat-box-label">Total Órdenes</div>
//             <div class="stat-box-value">32</div>
//           </div>
//         </div>
//         <div class="stat-box">
//           <div class="stat-box-icon blue">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//               <circle cx="12" cy="12" r="10"></circle>
//               <polyline points="12 6 12 12 16 14"></polyline>
//             </svg>
//           </div>
//           <div class="stat-box-content">
//             <div class="stat-box-label">En Proceso</div>
//             <div class="stat-box-value">18</div>
//           </div>
//         </div>
//         <div class="stat-box">
//           <div class="stat-box-icon green">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//               <polyline points="22 4 12 14.01 9 11.01"></polyline>
//             </svg>
//           </div>
//           <div class="stat-box-content">
//             <div class="stat-box-label">Completadas</div>
//             <div class="stat-box-value">14</div>
//           </div>
//         </div>
//         <div class="stat-box">
//           <div class="stat-box-icon">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//               <line x1="12" y1="1" x2="12" y2="23"></line>
//               <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
//             </svg>
//           </div>
//           <div class="stat-box-content">
//             <div class="stat-box-label">Valor Total</div>
//             <div class="stat-box-value">S/ 142,500</div>
//           </div>
//         </div>
//       </div>

//       <div class="search-filter-bar">
//         <div class="search-input-wrapper">
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//             <circle cx="11" cy="11" r="8"></circle>
//             <path d="m21 21-4.35-4.35"></path>
//           </svg>
//           <input type="text" placeholder="Buscar orden de servicio..." class="search-input">
//         </div>
//         <select class="filter-select">
//           <option>Todos los estados</option>
//           <option>Pendiente</option>
//           <option>En Proceso</option>
//           <option>Completada</option>
//         </select>
//         <input type="date" class="filter-select">
//       </div>

//       <div class="table-container">
//         <table class="data-table">
//           <thead>
//             <tr>
//               <th>N° Orden</th>
//               <th>Cliente</th>
//               <th>Fecha Aceptación</th>
//               <th>Fecha Tentativa</th>
//               <th>Total Costo</th>
//               <th>Estado</th>
//               <th>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>
//                 <strong>OS-2024-001</strong>
//                 <div style="font-size: 11px; color: #64748b;">OS-AC-001 v01</div>
//               </td>
//               <td>Empresa ABC S.A.C.</td>
//               <td>10/01/2024</td>
//               <td>15/01/2024</td>
//               <td><strong>S/ 4,500.00</strong></td>
//               <td><span class="badge badge-success">Completada</span></td>
//               <td>
//                 <button class="btn-icon" title="Ver">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
//                     <circle cx="12" cy="12" r="3"></circle>
//                   </svg>
//                 </button>
//                 <button class="btn-icon" title="Editar">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//                     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//                   </svg>
//                 </button>
//               </td>
//             </tr>
//             <tr>
//               <td>
//                 <strong>OS-2024-002</strong>
//                 <div style="font-size: 11px; color: #64748b;">OS-AC-001 v01</div>
//               </td>
//               <td>Corporación XYZ E.I.R.L.</td>
//               <td>12/01/2024</td>
//               <td>18/01/2024</td>
//               <td><strong>S/ 6,200.00</strong></td>
//               <td><span class="badge badge-warning">En Proceso</span></td>
//               <td>
//                 <button class="btn-icon" title="Ver">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
//                     <circle cx="12" cy="12" r="3"></circle>
//                   </svg>
//                 </button>
//                 <button class="btn-icon" title="Editar">
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//                     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//                   </svg>
//                 </button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>

//     <!-- Formulario de Nueva/Editar Orden de Servicio (Inicialmente oculto) -->
//     <div id="formulario-orden-servicio" class="os-form-container" style="display: none;">
//       <div class="page-header">
//         <h1>
//           <button class="btn-back" onclick="ocultarFormularioOrdenServicio()">
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//               <path d="M19 12H5M12 19l-7-7 7-7"/>
//             </svg>
//           </button>
//           Nueva Orden de Servicio
//         </h1>
//       </div>

//       <div class="os-form-card">
//         <form id="form-orden-servicio">
//           <!-- Información General -->
//           <div class="os-section">
//             <h3 class="os-section-title">Información General</h3>
//             <div class="os-grid">
//               <div class="os-field">
//                 <label for="numero_orden">N° Orden de Servicio</label>
//                 <input type="text" id="numero_orden" class="os-input" value="OS-2024-AUTO" readonly>
//               </div>

//               <div class="os-field">
//                 <label for="codigo_doc">Código Documento</label>
//                 <input type="text" id="codigo_doc" class="os-input" value="OS-AC-001" required>
//               </div>

//               <div class="os-field">
//                 <label for="version">Versión</label>
//                 <input type="text" id="version" class="os-input" value="01" required>
//               </div>

//               <div class="os-field">
//                 <label for="id_cotizacion_ref">Cotización Referencia</label>
//                 <select id="id_cotizacion_ref" class="os-input" onchange="cargarCotizacion()">
//                   <option value="">Sin cotización...</option>
//                   <option value="1">COT-2024-001 - Empresa ABC S.A.C.</option>
//                   <option value="2">COT-2024-002 - Corporación XYZ E.I.R.L.</option>
//                   <option value="3">COT-2024-003 - Servicios Generales S.A.</option>
//                 </select>
//               </div>

//               <div class="os-field">
//                 <label for="id_cliente">Cliente</label>
//                 <select id="id_cliente" class="os-input" required>
//                   <option value="">Seleccione un cliente...</option>
//                   <option value="1">Empresa ABC S.A.C.</option>
//                   <option value="2">Corporación XYZ E.I.R.L.</option>
//                   <option value="3">Servicios Generales S.A.</option>
//                   <option value="4">Industrias del Norte S.A.C.</option>
//                   <option value="5">Comercial Sur E.I.R.L.</option>
//                 </select>
//               </div>

//               <div class="os-field">
//                 <label for="fecha_aceptacion">Fecha de Aceptación</label>
//                 <input type="date" id="fecha_aceptacion" class="os-input" required>
//               </div>

//               <div class="os-field">
//                 <label for="fecha_tentativa">Fecha Tentativa de Servicio</label>
//                 <input type="date" id="fecha_tentativa" class="os-input" required>
//               </div>

//               <div class="os-field">
//                 <label for="emitido_por">Emitido por</label>
//                 <select id="emitido_por" class="os-input" required>
//                   <option value="">Seleccione personal...</option>
//                   <option value="1" selected>Juan Pérez - Operaciones</option>
//                   <option value="2">María González - Coordinadora</option>
//                   <option value="3">Carlos Ruiz - Gerente</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <!-- Detalle de Servicios -->
//           <div class="os-section">
//             <div class="os-section-header">
//               <h3 class="os-section-title">Detalle de Servicios</h3>
//               <button type="button" class="btn-secondary" onclick="agregarLineaServicio()">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                   <line x1="12" y1="5" x2="12" y2="19"></line>
//                   <line x1="5" y1="12" x2="19" y2="12"></line>
//                 </svg>
//                 Agregar Servicio
//               </button>
//             </div>

//             <div class="os-table-wrapper">
//               <table class="os-table" id="tabla-detalle-servicio">
//                 <thead>
//                   <tr>
//                     <th style="width: 30%;">Servicio</th>
//                     <th style="width: 25%;">Local / Ubicación</th>
//                     <th style="width: 20%;">Frecuencia</th>
//                     <th style="width: 15%;">Precio</th>
//                     <th style="width: 10%;"></th>
//                   </tr>
//                 </thead>
//                 <tbody id="detalle-servicio-body">
//                   <!-- Las filas se agregarán dinámicamente -->
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <!-- Total -->
//           <div class="os-section">
//             <div class="os-total-container">
//               <div class="os-total-row os-total-final">
//                 <span class="os-total-label">Total Costo:</span>
//                 <span class="os-total-value" id="total-costo-value">S/ 0.00</span>
//               </div>
//             </div>
//           </div>

//           <!-- Botones de Acción -->
//           <div class="os-form-actions">
//             <button type="button" class="btn-secondary" onclick="ocultarFormularioOrdenServicio()">Cancelar</button>
//             <button type="submit" class="btn-primary">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                 <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
//                 <polyline points="17 21 17 13 7 13 7 21"></polyline>
//                 <polyline points="7 3 7 8 15 8"></polyline>
//               </svg>
//               Guardar y Generar PDF
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   `;
// }
export function renderComercialOrdenesServicio() {
  return `
  <div class="op-main-container">

    <!-- HEADER -->
    <div class="op-header">
      <div class="op-header-top">
        <h1 class="op-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3z"></path>
            <path d="M7 7h10"></path>
            <path d="M7 11h10"></path>
            <path d="M7 15h10"></path>
          </svg>
          Órdenes de Servicio
        </h1>

        <button class="btn-primary" onclick="mostrarFormularioOrdenServicio()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Orden de Servicio
        </button>
      </div>

      <!-- STATS -->
      <div class="op-stats-grid">
        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
          </div>      
          <div class="op-stat-info">
            <span class="op-stat-label">Total Órdenes</span>
            <span class="op-stat-value">32</span>
          </div>
        </div>

        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
          </div>
          <div class="op-stat-info">
            <span class="op-stat-label">En Proceso</span>
            <span class="op-stat-value">18</span>
          </div>
        </div>

        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-success">✔</div>
          <div class="op-stat-info">
            <span class="op-stat-label">Completadas</span>
            <span class="op-stat-value">14</span>
          </div>
        </div>

        <div class="op-stat-card">
          <div class="op-stat-icon op-stat-green">💰</div>
          <div class="op-stat-info">
            <span class="op-stat-label">Valor Total</span>
            <span class="op-stat-value">S/ 142,500</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LISTA -->
    <div id="lista-ordenes-servicio">

      <!-- FILTROS -->
      <div class="op-filters-bar">
        <div class="op-search-box">
          🔍
          <input type="text" class="op-search-input" placeholder="Buscar orden de servicio...">
        </div>

        <div class="op-filter-group">
          <select class="op-filter-select">
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>En Proceso</option>
            <option>Completada</option>
          </select>

          <input type="date" class="op-filter-select">
        </div>
      </div>

      <!-- TABLA -->
      <div class="op-table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Cliente</th>
              <th>Fecha Aceptación</th>
              <th>Fecha Tentativa</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>OS-2024-001</strong></td>
              <td>Empresa ABC S.A.C.</td>
              <td>10/01/2024</td>
              <td>15/01/2024</td>
              <td><strong>S/ 4,500.00</strong></td>
              <td><span class="badge-success">Completada</span></td>
              <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon">👁</button>
                  <button class="op-btn-icon">✏</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FORMULARIO (OVERLAY) -->
    <div id="formulario-orden-servicio" class="op-form-overlay" style="display:none">
      <div class="op-form-card">

        <div class="op-form-header">
          <h2 class="op-form-title">Nueva Orden de Servicio</h2>
          <button class="op-btn-close" onclick="ocultarFormularioOrdenServicio()">✖</button>
        </div>

        <form id="form-orden-servicio" class="op-form-content">

          <div class="op-section">
            <h3 class="op-section-title">Información General</h3>
            <div class="op-grid">
              <input id="numero_orden" class="op-input" readonly>
              <input id="codigo_doc" class="op-input">
              <input id="version" class="op-input">
              <select id="id_cotizacion_ref" class="op-input" onchange="cargarCotizacion()"></select>
              <select id="id_cliente" class="op-input"></select>
              <input type="date" id="fecha_aceptacion" class="op-input">
              <input type="date" id="fecha_tentativa" class="op-input">
              <select id="emitido_por" class="op-input"></select>
            </div>
          </div>

          <div class="op-section">
            <div class="op-section-header">
              <h3 class="op-section-title">Detalle de Servicios</h3>
              <button type="button" class="op-btn-secondary" onclick="agregarLineaServicio()">
                + Agregar Servicio
              </button>
            </div>

            <div class="op-table-wrapper">
              <table class="op-table">
                <tbody id="detalle-servicio-body"></tbody>
              </table>
            </div>
          </div>

          <div class="op-total-container">
            <div class="op-total-row">
              <span>Total:</span>
              <strong id="total-costo-value">S/ 0.00</strong>
            </div>
          </div>

          <div class="op-form-actions">
            <button type="button" class="op-btn-cancel" onclick="ocultarFormularioOrdenServicio()">Cancelar</button>
            <button type="submit" class="op-btn-submit">Guardar y PDF</button>
          </div>

        </form>
      </div>
    </div>

  </div>
  `;
}

// Funciones para manejar el formulario
(window as any).mostrarFormularioOrdenServicio = function () {
  const lista = document.getElementById('lista-ordenes-servicio');
  const formulario = document.getElementById('formulario-orden-servicio');
  if (lista) lista.style.display = 'none';
  if (formulario) {
    formulario.style.display = 'block';
    // Establecer fecha actual
    const fechaAceptacion = document.getElementById('fecha_aceptacion') as HTMLInputElement;
    if (fechaAceptacion) {
      const hoy = new Date().toISOString().split('T')[0];
      fechaAceptacion.value = hoy;
    }
    // Agregar primera línea
    agregarLineaServicio();
  }
};

(window as any).ocultarFormularioOrdenServicio = function () {
  const lista = document.getElementById('lista-ordenes-servicio');
  const formulario = document.getElementById('formulario-orden-servicio');
  if (lista) lista.style.display = 'block';
  if (formulario) {
    formulario.style.display = 'none';
    // Limpiar formulario
    const form = document.getElementById('form-orden-servicio') as HTMLFormElement;
    if (form) form.reset();
    const tbody = document.getElementById('detalle-servicio-body');
    if (tbody) tbody.innerHTML = '';
    calcularTotalCosto();
  }
};

(window as any).cargarCotizacion = function () {
  const cotizacionSelect = document.getElementById('id_cotizacion_ref') as HTMLSelectElement;
  if (!cotizacionSelect || !cotizacionSelect.value) return;

  // Aquí cargarías los datos de la cotización desde el backend
  console.log('Cargando datos de cotización:', cotizacionSelect.value);

  // Ejemplo: autocompletar cliente si la cotización está seleccionada
  const clienteSelect = document.getElementById('id_cliente') as HTMLSelectElement;
  if (clienteSelect && cotizacionSelect.value === '1') {
    clienteSelect.value = '1';
  }
};

let contadorLineasServicio = 0;

(window as any).agregarLineaServicio = function () {
  const tbody = document.getElementById('detalle-servicio-body');

  contadorLineasServicio++;
  const lineaId = `linea-servicio-${contadorLineasServicio}`;

  const nuevaLinea = `
    <tr id="${lineaId}">
      <td>
        <select class="os-input os-input-sm servicio-select" onchange="calcularTotalCosto()" required>
          <option value="">Seleccione servicio...</option>
          <option value="1">Fumigación Residencial</option>
          <option value="2">Fumigación Industrial</option>
          <option value="3">Control de Plagas</option>
          <option value="4">Desinfección de Ambientes</option>
          <option value="5">Limpieza Profunda</option>
          <option value="6">Sanitización Completa</option>
          <option value="7">Desratización</option>
          <option value="8">Mantenimiento Preventivo</option>
        </select>
      </td>
      <td>
        <input type="text" class="os-input os-input-sm local-input" placeholder="Ej: Oficina Central, Planta Industrial..." required>
      </td>
      <td>
        <select class="os-input os-input-sm frecuencia-select">
          <option value="">Sin frecuencia</option>
          <option value="Unica">Única vez</option>
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
          <option value="Bimestral">Bimestral</option>
          <option value="Trimestral">Trimestral</option>
          <option value="Semestral">Semestral</option>
          <option value="Anual">Anual</option>
        </select>
      </td>
      <td>
        <input type="number" class="os-input os-input-sm precio-servicio-input" value="0.00" min="0" step="0.01" onchange="calcularTotalCosto()" required>
      </td>
      <td>
        <button type="button" class="btn-icon btn-danger" onclick="eliminarLineaServicio('${lineaId}')" title="Eliminar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    </tr>
  `;

  if (tbody) {
    tbody.insertAdjacentHTML('beforeend', nuevaLinea);
  }
};

(window as any).eliminarLineaServicio = function (lineaId: string) {
  const linea = document.getElementById(lineaId);
  if (linea) {
    linea.remove();
    calcularTotalCosto();
  }
};

function calcularTotalCosto() {
  const lineas = document.querySelectorAll('#detalle-servicio-body tr');
  let totalCosto = 0;

  lineas.forEach(linea => {
    const precio = parseFloat((linea.querySelector('.precio-servicio-input') as HTMLInputElement)?.value || '0');
    totalCosto += precio;
  });

  const totalElement = document.getElementById('total-costo-value');
  if (totalElement) totalElement.textContent = `S/ ${totalCosto.toFixed(2)}`;
}

// Manejar submit del formulario
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const form = document.getElementById('form-orden-servicio');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const lineas = document.querySelectorAll('#detalle-servicio-body tr');
        if (lineas.length === 0) {
          alert('Debe agregar al menos un servicio');
          return;
        }

        // Recopilar datos del formulario
        const numeroOrden = (document.getElementById('numero_orden') as HTMLInputElement).value;
        const codigoDoc = (document.getElementById('codigo_doc') as HTMLInputElement).value;
        const version = (document.getElementById('version') as HTMLInputElement).value;
        const idCotizacion = (document.getElementById('id_cotizacion_ref') as HTMLSelectElement).value || null;
        const idCliente = (document.getElementById('id_cliente') as HTMLSelectElement).value;
        const fechaAceptacion = (document.getElementById('fecha_aceptacion') as HTMLInputElement).value;
        const fechaTentativa = (document.getElementById('fecha_tentativa') as HTMLInputElement).value;
        const emitidoPor = (document.getElementById('emitido_por') as HTMLSelectElement).value;
        const totalCosto = parseFloat(document.getElementById('total-costo-value')?.textContent?.replace('S/ ', '') || '0');

        // Recopilar detalles
        const detalles: any[] = [];
        lineas.forEach(linea => {
          const servicio = (linea.querySelector('.servicio-select') as HTMLSelectElement).value;
          const local = (linea.querySelector('.local-input') as HTMLInputElement).value;
          const frecuencia = (linea.querySelector('.frecuencia-select') as HTMLSelectElement).value;
          const precio = (linea.querySelector('.precio-servicio-input') as HTMLInputElement).value;

          detalles.push({
            id_servicio: parseInt(servicio),
            local,
            frecuencia: frecuencia || null,
            precio: parseFloat(precio)
          });
        });

        const datosCompletos = {
          orden_servicio: {
            numero_orden: numeroOrden,
            codigo_doc: codigoDoc,
            version,
            id_cotizacion: idCotizacion ? parseInt(idCotizacion) : null,
            id_cliente: parseInt(idCliente),
            fecha_aceptacion: fechaAceptacion,
            fecha_tentativa: fechaTentativa,
            total_costo: totalCosto,
            emitido_por: parseInt(emitidoPor)
          },
          detalles
        };

        console.log('Datos a guardar:', datosCompletos);

        // Aquí iría la llamada al backend
        // await fetch('/api/ordenes-servicio', { method: 'POST', body: JSON.stringify(datosCompletos) });

        // Generar PDF
        generarPDFOrdenServicio(datosCompletos);

        alert('Orden de Servicio guardada y PDF generado exitosamente');
        ocultarFormularioOrdenServicio();
      });
    }
  }, 500);
}

function generarPDFOrdenServicio(datos: any) {
  console.log('Generando PDF de Orden de Servicio:', datos);
  // Aquí iria la lógica para generar y descargar el PDF
  alert('Funcionalidad de PDF en desarrollo. Los datos se han guardado correctamente.');
}
