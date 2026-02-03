import '../styles/ordenes-producto.css';

export function renderComercialOrdenesProducto() {
  const content = `
    <div class="op-main-container">
      <div class="op-header">
        <div class="op-header-top">
          <h1 class="op-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <path d="M16 8h5l3 3v5h-2m-4 0H2"></path>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Órdenes de Producto
          </h1>
          <button class="op-btn-primary" id="btnNuevaOrdenProducto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Orden de Producto
          </button>
        </div>

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
              <span class="op-stat-value">48</span>
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
              <span class="op-stat-label">Pendientes</span>
              <span class="op-stat-value">12</span>
            </div>
          </div>

          <div class="op-stat-card">
            <div class="op-stat-icon op-stat-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="op-stat-info">
              <span class="op-stat-label">Entregadas</span>
              <span class="op-stat-value">36</span>
            </div>
          </div>

          <div class="op-stat-card">
            <div class="op-stat-icon op-stat-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="op-stat-info">
              <span class="op-stat-label">Valor Total</span>
              <span class="op-stat-value">S/ 285,750</span>
            </div>
          </div>
        </div>
      </div>

      <div class="op-filters-bar">
        <div class="op-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" placeholder="Buscar por número de orden, cliente..." class="op-search-input">
        </div>
        
        <div class="op-filter-group">
          <select class="op-filter-select">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="proceso">En Proceso</option>
            <option value="entregada">Entregada</option>
          </select>
          
          <select class="op-filter-select">
            <option value="">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
          </select>
        </div>
      </div>

      <div class="op-table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Cliente</th>
              <th>Fecha Envío</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Cotización Ref.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>OP-2026-001</strong></td>
              <td>Industrias Lima SAC</td>
              <td>15/02/2026</td>
              <td>5 productos</td>
              <td><strong>S/ 8,450.00</strong></td>
              <td>COT-2026-012</td>
              <td><span class="badge-warning">Pendiente</span></td>
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
              <td><strong>OP-2026-002</strong></td>
              <td>Comercial Trujillo EIRL</td>
              <td>12/02/2026</td>
              <td>8 productos</td>
              <td><strong>S/ 12,300.00</strong></td>
              <td>-</td>
              <td><span class="badge-info">En Proceso</span></td>
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
              <td><strong>OP-2026-003</strong></td>
              <td>Distribuidora Norte SA</td>
              <td>08/02/2026</td>
              <td>12 productos</td>
              <td><strong>S/ 18,900.00</strong></td>
              <td>COT-2026-008</td>
              <td><span class="badge-success">Entregada</span></td>
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
          </tbody>
        </table>
      </div>

      <!-- Formulario de Nueva Orden (oculto por defecto) -->
      <div id="formularioOrdenProducto" class="op-form-overlay" style="display: none;">
        <div class="op-form-card">
          <div class="op-form-header">
            <h2 class="op-form-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <path d="M16 8h5l3 3v5h-2m-4 0H2"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Nueva Orden de Producto
            </h2>
            <button class="op-btn-close" id="btnCerrarFormulario">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form id="formOrdenProducto" class="op-form-content">
            <!-- Información General -->
            <div class="op-section">
              <h3 class="op-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Información General
              </h3>
              
              <div class="op-grid">
                <div class="op-field">
                  <label class="op-label">
                    Número de Orden
                    <span class="op-required">*</span>
                  </label>
                  <input type="text" class="op-input" id="numero_orden" value="OP-2026-004" readonly>
                </div>

                <div class="op-field">
                  <label class="op-label">
                    Cotización de Referencia
                    <span class="op-optional">(Opcional)</span>
                  </label>
                  <select class="op-input" id="id_cotizacion_ref">
                    <option value="">Sin referencia</option>
                    <option value="1">COT-2026-001 - Industrias Lima SAC</option>
                    <option value="2">COT-2026-002 - Comercial Trujillo EIRL</option>
                    <option value="3">COT-2026-003 - Distribuidora Norte SA</option>
                  </select>
                </div>

                <div class="op-field">
                  <label class="op-label">
                    Cliente
                    <span class="op-required">*</span>
                  </label>
                  <select class="op-input" id="id_cliente" required>
                    <option value="">Seleccionar cliente</option>
                    <option value="1">Industrias Lima SAC</option>
                    <option value="2">Comercial Trujillo EIRL</option>
                    <option value="3">Distribuidora Norte SA</option>
                    <option value="4">Productos del Sur EIRL</option>
                    <option value="5">Servicios Integrados SAC</option>
                  </select>
                </div>

                <div class="op-field">
                  <label class="op-label">
                    Fecha de Envío
                    <span class="op-required">*</span>
                  </label>
                  <input type="date" class="op-input" id="fecha_envio" required>
                </div>

                <div class="op-field">
                  <label class="op-label">
                    Emitido Por
                    <span class="op-required">*</span>
                  </label>
                  <select class="op-input" id="emitido_por" required>
                    <option value="">Seleccionar personal</option>
                    <option value="1">Juan Pérez - Comercial</option>
                    <option value="2">María García - Ventas</option>
                    <option value="3">Carlos López - Logística</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Detalle de Productos -->
            <div class="op-section">
              <div class="op-section-header">
                <h3 class="op-section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  Detalle de Productos
                </h3>
                <button type="button" class="op-btn-secondary" id="btnAgregarProducto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Agregar Producto
                </button>
              </div>

              <div class="op-table-wrapper">
                <table class="op-table" id="tablaDetalleProductos">
                  <thead>
                    <tr>
                      <th style="width: 35%">Producto</th>
                      <th style="width: 15%">Cantidad</th>
                      <th style="width: 20%">Precio Unit.</th>
                      <th style="width: 20%">Subtotal</th>
                      <th style="width: 10%">Acción</th>
                    </tr>
                  </thead>
                  <tbody id="detalleProductosBody">
                    <!-- Las filas se agregarán dinámicamente -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Total -->
            <div class="op-total-container">
              <div class="op-total-row">
                <span class="op-total-label">Total:</span>
                <span class="op-total-value" id="totalOrden">S/ 0.00</span>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="op-form-actions">
              <button type="button" class="op-btn-cancel" id="btnCancelarFormulario">
                Cancelar
              </button>
              <button type="submit" class="op-btn-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Guardar y Generar PDF
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Esperar a que el DOM se actualice
  setTimeout(() => {
    initOrdenesProductoHandlers();
  }, 0);

  return content;
}

function initOrdenesProductoHandlers() {
  const btnNueva = document.getElementById('btnNuevaOrdenProducto');
  const btnCerrar = document.getElementById('btnCerrarFormulario');
  const btnCancelar = document.getElementById('btnCancelarFormulario');
  const btnAgregar = document.getElementById('btnAgregarProducto');
  const form = document.getElementById('formOrdenProducto') as HTMLFormElement;

  if (btnNueva) {
    btnNueva.addEventListener('click', mostrarFormularioOrdenProducto);
  }

  if (btnCerrar) {
    btnCerrar.addEventListener('click', ocultarFormularioOrdenProducto);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', ocultarFormularioOrdenProducto);
  }

  if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarLineaProducto);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmitOrdenProducto();
    });
  }

  // Cargar datos de cotización si se selecciona una referencia
  const selectCotizacion = document.getElementById('id_cotizacion_ref') as HTMLSelectElement;
  if (selectCotizacion) {
    selectCotizacion.addEventListener('change', cargarDatosCotizacion);
  }

  // Establecer fecha actual por defecto
  const fechaEnvio = document.getElementById('fecha_envio') as HTMLInputElement;
  if (fechaEnvio && !fechaEnvio.value) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaEnvio.value = hoy;
  }
}

function mostrarFormularioOrdenProducto() {
  const overlay = document.getElementById('formularioOrdenProducto');
  if (overlay) {
    overlay.style.display = 'flex';
    // Agregar una línea inicial
    setTimeout(() => {
      agregarLineaProducto();
    }, 100);
  }
}

function ocultarFormularioOrdenProducto() {
  const overlay = document.getElementById('formularioOrdenProducto');
  const form = document.getElementById('formOrdenProducto') as HTMLFormElement;
  
  if (overlay) {
    overlay.style.display = 'none';
  }
  
  if (form) {
    form.reset();
  }
  
  // Limpiar tabla de detalles
  const tbody = document.getElementById('detalleProductosBody');
  if (tbody) {
    tbody.innerHTML = '';
  }
  
  // Resetear total
  const totalOrden = document.getElementById('totalOrden');
  if (totalOrden) {
    totalOrden.textContent = 'S/ 0.00';
  }
}

function cargarDatosCotizacion() {
  const selectCotizacion = document.getElementById('id_cotizacion_ref') as HTMLSelectElement;
  const selectCliente = document.getElementById('id_cliente') as HTMLSelectElement;
  
  if (selectCotizacion && selectCotizacion.value) {
    // Aquí iría la lógica para cargar los datos de la cotización desde el backend
    // Por ahora, solo auto-completamos el cliente basado en la selección
    const texto = selectCotizacion.options[selectCotizacion.selectedIndex].text;
    
    if (texto.includes('Industrias Lima SAC')) {
      selectCliente.value = '1';
    } else if (texto.includes('Comercial Trujillo EIRL')) {
      selectCliente.value = '2';
    } else if (texto.includes('Distribuidora Norte SA')) {
      selectCliente.value = '3';
    }
    
    // TODO: Cargar productos de la cotización automáticamente
    console.log('Cargar productos de cotización:', selectCotizacion.value);
  }
}

let contadorLineas = 0;

function agregarLineaProducto() {
  contadorLineas++;
  const tbody = document.getElementById('detalleProductosBody');
  
  if (!tbody) return;
  
  const fila = document.createElement('tr');
  fila.id = `linea-${contadorLineas}`;
  fila.innerHTML = `
    <td>
      <select class="op-input op-input-sm" name="producto_${contadorLineas}" required>
        <option value="">Seleccionar producto</option>
        <option value="1" data-precio="45.00">Insecticida Profesional 1L</option>
        <option value="2" data-precio="38.50">Rodenticida en Pellets 500g</option>
        <option value="3" data-precio="120.00">Fumigadora Manual 5L</option>
        <option value="4" data-precio="85.00">Desinfectante Industrial 5L</option>
        <option value="5" data-precio="25.00">Guantes Nitrilo (Caja 100)</option>
        <option value="6" data-precio="32.00">Mascarilla Respirador</option>
        <option value="7" data-precio="95.00">Trampas para Roedores (Pack 10)</option>
        <option value="8" data-precio="150.00">Nebulizadora Eléctrica</option>
        <option value="9" data-precio="18.50">Cebo Gel Anti Cucarachas</option>
        <option value="10" data-precio="65.00">Atomizador Profesional 2L</option>
      </select>
    </td>
    <td>
      <input type="number" class="op-input op-input-sm" name="cantidad_${contadorLineas}" 
             min="1" value="1" required>
    </td>
    <td>
      <input type="number" class="op-input op-input-sm" name="precio_${contadorLineas}" 
             step="0.01" min="0" value="0.00" required>
    </td>
    <td>
      <strong class="op-subtotal" id="subtotal_${contadorLineas}">S/ 0.00</strong>
    </td>
    <td>
      <button type="button" class="op-btn-remove" onclick="eliminarLineaProducto(${contadorLineas})" title="Eliminar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </td>
  `;
  
  tbody.appendChild(fila);
  
  // Agregar listeners para cálculo automático
  const selectProducto = fila.querySelector(`select[name="producto_${contadorLineas}"]`) as HTMLSelectElement;
  const inputCantidad = fila.querySelector(`input[name="cantidad_${contadorLineas}"]`) as HTMLInputElement;
  const inputPrecio = fila.querySelector(`input[name="precio_${contadorLineas}"]`) as HTMLInputElement;
  
  if (selectProducto) {
    selectProducto.addEventListener('change', function() {
      const option = this.options[this.selectedIndex];
      const precio = option.getAttribute('data-precio');
      if (precio && inputPrecio) {
        inputPrecio.value = precio;
        calcularSubtotalLinea(contadorLineas);
      }
    });
  }
  
  if (inputCantidad) {
    inputCantidad.addEventListener('input', () => calcularSubtotalLinea(contadorLineas));
  }
  
  if (inputPrecio) {
    inputPrecio.addEventListener('input', () => calcularSubtotalLinea(contadorLineas));
  }
}

// Función global para eliminar línea (llamada desde HTML)
(window as any).eliminarLineaProducto = function(id: number) {
  const fila = document.getElementById(`linea-${id}`);
  if (fila) {
    fila.remove();
    calcularTotal();
  }
};

function calcularSubtotalLinea(id: number) {
  const cantidad = (document.querySelector(`input[name="cantidad_${id}"]`) as HTMLInputElement)?.value || '0';
  const precio = (document.querySelector(`input[name="precio_${id}"]`) as HTMLInputElement)?.value || '0';
  
  const subtotal = parseFloat(cantidad) * parseFloat(precio);
  
  const subtotalElement = document.getElementById(`subtotal_${id}`);
  if (subtotalElement) {
    subtotalElement.textContent = `S/ ${subtotal.toFixed(2)}`;
  }
  
  calcularTotal();
}

function calcularTotal() {
  const tbody = document.getElementById('detalleProductosBody');
  if (!tbody) return;
  
  let total = 0;
  const filas = tbody.querySelectorAll('tr');
  
  filas.forEach((fila) => {
    const subtotalText = fila.querySelector('.op-subtotal')?.textContent || 'S/ 0.00';
    const subtotal = parseFloat(subtotalText.replace('S/ ', '').replace(',', ''));
    if (!isNaN(subtotal)) {
      total += subtotal;
    }
  });
  
  const totalElement = document.getElementById('totalOrden');
  if (totalElement) {
    totalElement.textContent = `S/ ${total.toFixed(2)}`;
  }
}

function handleSubmitOrdenProducto() {
  const form = document.getElementById('formOrdenProducto') as HTMLFormElement;
  if (!form) return;
  
  // Validar que haya al menos un producto
  const tbody = document.getElementById('detalleProductosBody');
  if (!tbody || tbody.children.length === 0) {
    alert('Debe agregar al menos un producto a la orden');
    return;
  }
  
  // Recopilar datos del formulario
  const formData = {
    orden_producto: {
      numero_orden: (document.getElementById('numero_orden') as HTMLInputElement)?.value,
      id_cotizacion: (document.getElementById('id_cotizacion_ref') as HTMLSelectElement)?.value || null,
      id_cliente: (document.getElementById('id_cliente') as HTMLSelectElement)?.value,
      fecha_envio: (document.getElementById('fecha_envio') as HTMLInputElement)?.value,
      emitido_por: (document.getElementById('emitido_por') as HTMLSelectElement)?.value,
      total: document.getElementById('totalOrden')?.textContent?.replace('S/ ', '') || '0'
    },
    detalles: [] as any[]
  };
  
  // Recopilar detalles de productos
  const filas = tbody.querySelectorAll('tr');
  filas.forEach((fila) => {
    const id = fila.id.replace('linea-', '');
    const producto = (fila.querySelector(`select[name="producto_${id}"]`) as HTMLSelectElement)?.value;
    const cantidad = (fila.querySelector(`input[name="cantidad_${id}"]`) as HTMLInputElement)?.value;
    const precio = (fila.querySelector(`input[name="precio_${id}"]`) as HTMLInputElement)?.value;
    const subtotalText = fila.querySelector('.op-subtotal')?.textContent || 'S/ 0.00';
    const subtotal = subtotalText.replace('S/ ', '');
    
    if (producto && cantidad && precio) {
      formData.detalles.push({
        id_producto: producto,
        cantidad: parseInt(cantidad),
        precio_unitario: parseFloat(precio),
        subtotal: parseFloat(subtotal)
      });
    }
  });
  
  console.log('Datos de la orden de producto:', formData);
  
  // Aquí iría la llamada al backend para guardar
  // Por ahora, simulamos éxito y generamos PDF
  alert('Orden de producto guardada exitosamente');
  
  // Generar PDF (función placeholder)
  generarPDFOrdenProducto(formData);
  
  // Cerrar formulario
  ocultarFormularioOrdenProducto();
}

function generarPDFOrdenProducto(data: any) {
  console.log('Generando PDF de orden de producto...', data);
  // TODO: aqui implementar la generación de PDF
  alert('Función de generación de PDF en desarrollo');
}
