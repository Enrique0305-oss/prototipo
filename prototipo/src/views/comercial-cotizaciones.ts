// Comercial - Cotizaciones

// Declarar funciones globales
declare function mostrarFormularioCotizacion(): void;
declare function ocultarFormularioCotizacion(): void;
declare function agregarLineaDetalle(): void;

export function renderComercialCotizaciones() {
  return `
    <div class="page-header">
      <h1>Órdenes de Cotización</h1>
      <div class="header-actions">
        <button class="btn-primary" onclick="mostrarFormularioCotizacion()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Cotización
        </button>
      </div>
    </div>

    <!-- Lista de cotizaciones existentes -->
    <div id="lista-cotizaciones">
      <div class="stats-row" style="margin-bottom: 24px;">
        <div class="stat-box">
          <div class="stat-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Total Cotizaciones</div>
            <div class="stat-box-value">45</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Pendientes</div>
            <div class="stat-box-value">12</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Aceptadas</div>
            <div class="stat-box-value">28</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Rechazadas</div>
            <div class="stat-box-value">5</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="op-filters-bar">
        <div class="op-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" placeholder="Buscar por nombre o ID..." class="op-search-input">
        </div>

        <div class="op-filter-group">
          <select class="op-filter-select">
            <option value="">Todos los estados</option>
            <option value="al-dia">Al día</option>
            <option value="proximo">Próximo</option>
            <option value="vencido">Vencido</option>
          </select>

          <select class="op-filter-select">
            <option value="">Todas las garantías</option>
            <option value="vigente">Vigente</option>
            <option value="vencer">Por Vencer</option>
            <option value="expirada">Expirada</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>N° Cotización</th>
              <th>Cliente</th>
              <th>Fecha Emisión</th>
              <th>Tipo</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>COT-2024-001</strong></td>
              <td>Empresa ABC S.A.C.</td>
              <td>15/01/2024</td>
              <td><span class="badge badge-blue">Servicio</span></td>
              <td>S/ 4,500.00</td>
              <td><span class="badge badge-warning">Pendiente</span></td>
              <td>
                <button class="btn-icon" title="Ver">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button class="btn-icon" title="Editar" onclick="editarCotizacion('COT-2024-001')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formulario de Nueva/Editar Cotización (Inicialmente oculto) -->
    <div id="formulario-cotizacion" style="display: none;">
      <div class="page-header">
        <h1>
          <button class="btn-back" onclick="ocultarFormularioCotizacion()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          Nueva Orden de Cotización
        </h1>
      </div>

      <div class="form-card">
        <form id="form-cotizacion">
          <!-- Información General -->
          <div class="form-section">
            <h3 class="form-section-title">Información General</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="numero_cotizacion">N° Cotización</label>
                <input type="text" id="numero_cotizacion" class="form-control" value="COT-2024-AUTO" readonly>
              </div>
              
              <div class="form-group">
                <label for="fecha_emision">Fecha de Emisión</label>
                <input type="date" id="fecha_emision" class="form-control" required>
              </div>

              <div class="form-group">
                <label for="id_cliente">Cliente</label>
                <select id="id_cliente" class="form-control" required>
                  <option value="">Seleccione un cliente...</option>
                  <option value="1">Empresa ABC S.A.C.</option>
                  <option value="2">Corporación XYZ E.I.R.L.</option>
                  <option value="3">Servicios Generales S.A.</option>
                  <option value="4">Industrias del Norte S.A.C.</option>
                  <option value="5">Comercial Sur E.I.R.L.</option>
                </select>
              </div>

              <div class="form-group">
                <label for="tipo_cotizacion">Tipo de Cotización</label>
                <select id="tipo_cotizacion" class="form-control" required onchange="actualizarTipoCotizacion()">
                  <option value="">Seleccione tipo...</option>
                  <option value="Servicio">Servicio</option>
                  <option value="Producto">Producto</option>
                  <option value="Capacitacion">Capacitación</option>
                </select>
              </div>

              <div class="form-group">
                <label for="estado">Estado</label>
                <select id="estado" class="form-control">
                  <option value="Pendiente" selected>Pendiente</option>
                  <option value="Aceptada">Aceptada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>

              <div class="form-group">
                <label for="id_personal_creador">Creado por</label>
                <select id="id_personal_creador" class="form-control" required>
                  <option value="">Seleccione personal...</option>
                  <option value="1" selected>Juan Pérez - Comercial</option>
                  <option value="2">María González - Ventas</option>
                  <option value="3">Carlos Ruiz - Gerente</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Detalle de Cotización -->
          <div class="form-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 class="form-section-title" style="margin: 0;">Detalle de Cotización</h3>
              <button type="button" class="btn-secondary" onclick="agregarLineaDetalle()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Línea
              </button>
            </div>

            <div class="table-container">
              <table class="data-table" id="tabla-detalle-cotizacion">
                <thead>
                  <tr>
                    <th style="width: 20%;">Servicio/Producto</th>
                    <th style="width: 20%;">Descripción Manual</th>
                    <th style="width: 10%;">Cantidad</th>
                    <th style="width: 12%;">Precio Unit.</th>
                    <th style="width: 13%;">Frecuencia</th>
                    <th style="width: 13%;">Modalidad</th>
                    <th style="width: 12%;">Subtotal</th>
                    <th style="width: 5%;"></th>
                  </tr>
                </thead>
                <tbody id="detalle-cotizacion-body">
                  <!-- Las filas se agregarán dinámicamente -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totales -->
          <div class="form-section">
            <div class="totales-container">
              <div class="totales-row">
                <span class="totales-label">Subtotal:</span>
                <span class="totales-value" id="subtotal-value">S/ 0.00</span>
              </div>
              <div class="totales-row">
                <span class="totales-label">IGV (18%):</span>
                <span class="totales-value" id="igv-value">S/ 0.00</span>
              </div>
              <div class="totales-row totales-total">
                <span class="totales-label">Total:</span>
                <span class="totales-value" id="total-value">S/ 0.00</span>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="ocultarFormularioCotizacion()">Cancelar</button>
            <button type="submit" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Guardar y Descargar PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Funciones para manejar el formulario
(window as any).mostrarFormularioCotizacion = function() {
  const lista = document.getElementById('lista-cotizaciones');
  const formulario = document.getElementById('formulario-cotizacion');
  if (lista) lista.style.display = 'none';
  if (formulario) {
    formulario.style.display = 'block';
    // Establecer fecha actual
    const fechaInput = document.getElementById('fecha_emision') as HTMLInputElement;
    if (fechaInput) {
      const hoy = new Date().toISOString().split('T')[0];
      fechaInput.value = hoy;
    }
    // Agregar primera línea
    agregarLineaDetalle();
  }
};

(window as any).ocultarFormularioCotizacion = function() {
  const lista = document.getElementById('lista-cotizaciones');
  const formulario = document.getElementById('formulario-cotizacion');
  if (lista) lista.style.display = 'block';
  if (formulario) {
    formulario.style.display = 'none';
    // Limpiar formulario
    const form = document.getElementById('form-cotizacion') as HTMLFormElement;
    if (form) form.reset();
    const tbody = document.getElementById('detalle-cotizacion-body');
    if (tbody) tbody.innerHTML = '';
    calcularTotales();
  }
};

(window as any).editarCotizacion = function(numeroCotizacion: string) {
  mostrarFormularioCotizacion();
  // Aquí cargarías los datos de la cotización desde el backend
  console.log('Editando cotización:', numeroCotizacion);
};

let contadorLineas = 0;

(window as any).agregarLineaDetalle = function() {
  const tbody = document.getElementById('detalle-cotizacion-body');
  const tipoCotizacion = (document.getElementById('tipo_cotizacion') as HTMLSelectElement)?.value;
  
  if (!tipoCotizacion) {
    alert('Por favor seleccione el tipo de cotización primero');
    return;
  }

  contadorLineas++;
  const lineaId = `linea-${contadorLineas}`;

  let opcionesItem = '';
  if (tipoCotizacion === 'Servicio') {
    opcionesItem = `
      <option value="">Seleccione servicio...</option>
      <option value="1">Fumigación Residencial</option>
      <option value="2">Fumigación Industrial</option>
      <option value="3">Control de Plagas</option>
      <option value="4">Desinfección de Ambientes</option>
      <option value="5">Limpieza Profunda</option>
    `;
  } else if (tipoCotizacion === 'Producto') {
    opcionesItem = `
      <option value="">Seleccione producto...</option>
      <option value="1">Insecticida Profesional 1L</option>
      <option value="2">Raticida en Gel</option>
      <option value="3">Trampas para Roedores</option>
      <option value="4">Desinfectante Industrial 5L</option>
      <option value="5">Kit de Fumigación</option>
    `;
  } else if (tipoCotizacion === 'Capacitacion') {
    opcionesItem = `
      <option value="">Seleccione capacitación...</option>
      <option value="1">Manejo de Productos Químicos</option>
      <option value="2">Seguridad en Fumigación</option>
      <option value="3">Control de Plagas Urbanas</option>
      <option value="4">Primeros Auxilios</option>
    `;
  }

  const nuevaLinea = `
    <tr id="${lineaId}">
      <td>
        <select class="form-control form-control-sm item-select" onchange="calcularSubtotalLinea('${lineaId}')" required>
          ${opcionesItem}
        </select>
      </td>
      <td>
        <input type="text" class="form-control form-control-sm descripcion-input" placeholder="Descripción adicional...">
      </td>
      <td>
        <input type="number" class="form-control form-control-sm cantidad-input" value="1" min="1" onchange="calcularSubtotalLinea('${lineaId}')" required>
      </td>
      <td>
        <input type="number" class="form-control form-control-sm precio-input" value="0.00" min="0" step="0.01" onchange="calcularSubtotalLinea('${lineaId}')" required>
      </td>
      <td>
        <select class="form-control form-control-sm frecuencia-input">
          <option value="">Sin frecuencia</option>
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
          <option value="Trimestral">Trimestral</option>
          <option value="Semestral">Semestral</option>
          <option value="Anual">Anual</option>
        </select>
      </td>
      <td>
        <select class="form-control form-control-sm modalidad-input">
          <option value="">Sin modalidad</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
          <option value="Hibrido">Híbrido</option>
        </select>
      </td>
      <td>
        <strong class="subtotal-linea">S/ 0.00</strong>
      </td>
      <td>
        <button type="button" class="btn-icon btn-danger" onclick="eliminarLineaDetalle('${lineaId}')" title="Eliminar">
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

(window as any).eliminarLineaDetalle = function(lineaId: string) {
  const linea = document.getElementById(lineaId);
  if (linea) {
    linea.remove();
    calcularTotales();
  }
};

(window as any).calcularSubtotalLinea = function(lineaId: string) {
  const linea = document.getElementById(lineaId);
  if (!linea) return;

  const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
  const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
  const subtotal = cantidad * precio;

  const subtotalElement = linea.querySelector('.subtotal-linea');
  if (subtotalElement) {
    subtotalElement.textContent = `S/ ${subtotal.toFixed(2)}`;
  }

  calcularTotales();
};

function calcularTotales() {
  const lineas = document.querySelectorAll('#detalle-cotizacion-body tr');
  let subtotalGeneral = 0;

  lineas.forEach(linea => {
    const cantidad = parseFloat((linea.querySelector('.cantidad-input') as HTMLInputElement)?.value || '0');
    const precio = parseFloat((linea.querySelector('.precio-input') as HTMLInputElement)?.value || '0');
    subtotalGeneral += cantidad * precio;
  });

  const igv = subtotalGeneral * 0.18;
  const total = subtotalGeneral + igv;

  const subtotalElement = document.getElementById('subtotal-value');
  const igvElement = document.getElementById('igv-value');
  const totalElement = document.getElementById('total-value');

  if (subtotalElement) subtotalElement.textContent = `S/ ${subtotalGeneral.toFixed(2)}`;
  if (igvElement) igvElement.textContent = `S/ ${igv.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `S/ ${total.toFixed(2)}`;
}

(window as any).actualizarTipoCotizacion = function() {
  // Limpiar tabla de detalles cuando cambia el tipo
  const tbody = document.getElementById('detalle-cotizacion-body');
  if (tbody) tbody.innerHTML = '';
  contadorLineas = 0;
  calcularTotales();
};

// Manejar submit del formulario
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const form = document.getElementById('form-cotizacion');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const lineas = document.querySelectorAll('#detalle-cotizacion-body tr');
        if (lineas.length === 0) {
          alert('Debe agregar al menos una línea de detalle');
          return;
        }

        // Recopilar datos del formulario
        const numeroCotizacion = (document.getElementById('numero_cotizacion') as HTMLInputElement).value;
        const idCliente = (document.getElementById('id_cliente') as HTMLSelectElement).value;
        const fechaEmision = (document.getElementById('fecha_emision') as HTMLInputElement).value;
        const idPersonalCreador = (document.getElementById('id_personal_creador') as HTMLSelectElement).value;
        const estado = (document.getElementById('estado') as HTMLSelectElement).value;
        const tipoCotizacion = (document.getElementById('tipo_cotizacion') as HTMLSelectElement).value;

        const subtotal = parseFloat(document.getElementById('subtotal-value')?.textContent?.replace('S/ ', '') || '0');
        const igv = parseFloat(document.getElementById('igv-value')?.textContent?.replace('S/ ', '') || '0');
        const total = parseFloat(document.getElementById('total-value')?.textContent?.replace('S/ ', '') || '0');

        // Recopilar detalles
        const detalles: any[] = [];
        lineas.forEach(linea => {
          const itemSelect = linea.querySelector('.item-select') as HTMLSelectElement;
          const descripcion = (linea.querySelector('.descripcion-input') as HTMLInputElement).value;
          const cantidad = (linea.querySelector('.cantidad-input') as HTMLInputElement).value;
          const precio = (linea.querySelector('.precio-input') as HTMLInputElement).value;
          const frecuencia = (linea.querySelector('.frecuencia-input') as HTMLSelectElement).value;
          const modalidad = (linea.querySelector('.modalidad-input') as HTMLSelectElement).value;

          detalles.push({
            id_servicio: tipoCotizacion === 'Servicio' ? itemSelect.value : null,
            id_producto: tipoCotizacion === 'Producto' ? itemSelect.value : null,
            descripcion_manual: descripcion,
            cantidad: parseInt(cantidad),
            precio_unitario: parseFloat(precio),
            frecuencia_sugerida: frecuencia || null,
            modalidad_sugerida: modalidad || null
          });
        });

        const datosCompletos = {
          cotizacion: {
            numero_cotizacion: numeroCotizacion,
            id_cliente: parseInt(idCliente),
            fecha_emision: fechaEmision,
            id_personal_creador: parseInt(idPersonalCreador),
            estado,
            tipo_cotizacion: tipoCotizacion,
            subtotal,
            igv,
            total
          },
          detalles
        };

        console.log('Datos a guardar:', datosCompletos);

        // Aquí iría la llamada al backend
        // await fetch('/api/cotizaciones', { method: 'POST', body: JSON.stringify(datosCompletos) });

        // Generar PDF
        generarPDFCotizacion(datosCompletos);

        alert('Cotización guardada y PDF descargado exitosamente');
        ocultarFormularioCotizacion();
      });
    }
  }, 500);
}

function generarPDFCotizacion(datos: any) {
  console.log('Generando PDF con datos:', datos);
  // Aquí iria la lógica para generar y descargar el PDF
  alert('Funcionalidad de PDF en desarrollo. Los datos se han guardado correctamente.');
}
