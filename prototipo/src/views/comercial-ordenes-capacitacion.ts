import '../styles/ordenes-capacitacion.css';

export function renderComercialOrdenesCapacitacion() {
  const content = `
    <div class="oc-main-container">
      <div class="oc-header">
        <div class="oc-header-top">
          <h1 class="oc-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Órdenes de Capacitación y Auditoría
          </h1>
          <button class="oc-btn-primary" id="btnNuevaOrdenCapacitacion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Orden de Capacitación
          </button>
        </div>

        <div class="oc-stats-grid">
          <div class="oc-stat-card">
            <div class="oc-stat-icon oc-stat-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="oc-stat-info">
              <span class="oc-stat-label">Total Órdenes</span>
              <span class="oc-stat-value">24</span>
            </div>
          </div>

          <div class="oc-stat-card">
            <div class="oc-stat-icon oc-stat-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="oc-stat-info">
              <span class="oc-stat-label">Programadas</span>
              <span class="oc-stat-value">8</span>
            </div>
          </div>

          <div class="oc-stat-card">
            <div class="oc-stat-icon oc-stat-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="oc-stat-info">
              <span class="oc-stat-label">Completadas</span>
              <span class="oc-stat-value">16</span>
            </div>
          </div>

          <div class="oc-stat-card">
            <div class="oc-stat-icon oc-stat-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="oc-stat-info">
              <span class="oc-stat-label">Participantes Totales</span>
              <span class="oc-stat-value">486</span>
            </div>
          </div>
        </div>
      </div>

      <div class="oc-filters-bar">
        <div class="oc-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" placeholder="Buscar por número de orden, cliente, servicio..." class="oc-search-input">
        </div>
        
        <div class="oc-filter-group">
          <select class="oc-filter-select">
            <option value="">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrido">Híbrido</option>
          </select>
          
          <select class="oc-filter-select">
            <option value="">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
          </select>
        </div>
      </div>

      <div class="oc-table-container">
        <table class="oc-table">
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha/Hora</th>
              <th>Modalidad</th>
              <th>Participantes</th>
              <th>Costo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>OCA-2026-001</strong></td>
              <td>Industrias Lima SAC</td>
              <td>BPM - Buenas Prácticas</td>
              <td>
                <div>18/02/2026</div>
                <div class="oc-time">09:00 AM</div>
              </td>
              <td><span class="badge-info">Presencial</span></td>
              <td>25</td>
              <td><strong>S/ 3,500.00</strong></td>
              <td><span class="badge-warning">Programada</span></td>
              <td>
                <div class="oc-action-buttons">
                  <button class="oc-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>OCA-2026-002</strong></td>
              <td>Comercial Trujillo EIRL</td>
              <td>ISO 9001:2015</td>
              <td>
                <div>20/02/2026</div>
                <div class="oc-time">02:00 PM</div>
              </td>
              <td><span class="badge-purple">Virtual</span></td>
              <td>30</td>
              <td><strong>S/ 2,800.00</strong></td>
              <td><span class="badge-warning">Programada</span></td>
              <td>
                <div class="oc-action-buttons">
                  <button class="oc-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>OCA-2026-003</strong></td>
              <td>Distribuidora Norte SA</td>
              <td>HACCP - Auditoría</td>
              <td>
                <div>10/02/2026</div>
                <div class="oc-time">10:00 AM</div>
              </td>
              <td><span class="badge-cyan">Híbrido</span></td>
              <td>15</td>
              <td><strong>S/ 5,200.00</strong></td>
              <td><span class="badge-success">Completada</span></td>
              <td>
                <div class="oc-action-buttons">
                  <button class="oc-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="PDF">
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
      <div id="formularioOrdenCapacitacion" class="oc-form-overlay" style="display: none;">
        <div class="oc-form-card">
          <div class="oc-form-header">
            <h2 class="oc-form-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Nueva Orden de Capacitación/Auditoría
            </h2>
            <button class="oc-btn-close" id="btnCerrarFormulario">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form id="formOrdenCapacitacion" class="oc-form-content">
            <!-- Información General -->
            <div class="oc-section">
              <h3 class="oc-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Información General
              </h3>
              
              <div class="oc-grid">
                <div class="oc-field">
                  <label class="oc-label">
                    Número de Orden
                    <span class="oc-required">*</span>
                  </label>
                  <input type="text" class="oc-input" id="numero_orden" value="OCA-2026-004" readonly>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Cotización de Referencia
                    <span class="oc-optional">(Opcional)</span>
                  </label>
                  <select class="oc-input" id="id_cotizacion_ref">
                    <option value="">Sin referencia</option>
                    <option value="1">COT-2026-001 - Industrias Lima SAC</option>
                    <option value="2">COT-2026-002 - Comercial Trujillo EIRL</option>
                    <option value="3">COT-2026-003 - Distribuidora Norte SA</option>
                  </select>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Cliente
                    <span class="oc-required">*</span>
                  </label>
                  <select class="oc-input" id="id_cliente" required>
                    <option value="">Seleccionar cliente</option>
                    <option value="1">Industrias Lima SAC</option>
                    <option value="2">Comercial Trujillo EIRL</option>
                    <option value="3">Distribuidora Norte SA</option>
                    <option value="4">Productos del Sur EIRL</option>
                    <option value="5">Servicios Integrados SAC</option>
                  </select>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Servicio/Capacitación
                    <span class="oc-required">*</span>
                  </label>
                  <select class="oc-input" id="id_servicio" required>
                    <option value="">Seleccionar servicio</option>
                    <option value="1">BPM - Buenas Prácticas de Manufactura</option>
                    <option value="2">HACCP - Análisis de Peligros y Puntos Críticos</option>
                    <option value="3">ISO 9001:2015 - Sistema de Gestión de Calidad</option>
                    <option value="4">ISO 22000 - Gestión de Inocuidad Alimentaria</option>
                    <option value="5">Auditoría Interna</option>
                    <option value="6">Auditoría Externa</option>
                    <option value="7">Seguridad y Salud en el Trabajo</option>
                    <option value="8">Manipulación de Alimentos</option>
                  </select>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Ponente/Auditor
                    <span class="oc-required">*</span>
                  </label>
                  <select class="oc-input" id="id_ponente" required>
                    <option value="">Seleccionar ponente</option>
                    <option value="1">Dr. Carlos Mendoza - Ingeniero de Alimentos</option>
                    <option value="2">Lic. Ana Torres - Auditora ISO</option>
                    <option value="3">Ing. Roberto Silva - Especialista HACCP</option>
                    <option value="4">Mg. Patricia Ramos - Consultora BPM</option>
                  </select>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Modalidad
                    <span class="oc-required">*</span>
                  </label>
                  <select class="oc-input" id="modalidad" required>
                    <option value="">Seleccionar modalidad</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Programación -->
            <div class="oc-section">
              <h3 class="oc-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Programación
              </h3>
              
              <div class="oc-grid">
                <div class="oc-field">
                  <label class="oc-label">
                    Fecha del Servicio
                    <span class="oc-required">*</span>
                  </label>
                  <input type="date" class="oc-input" id="fecha_servicio" required>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Hora del Servicio
                    <span class="oc-required">*</span>
                  </label>
                  <input type="time" class="oc-input" id="hora_servicio" required>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Número de Participantes
                    <span class="oc-required">*</span>
                  </label>
                  <input type="number" class="oc-input" id="num_participantes" min="1" required>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Número de Certificados
                    <span class="oc-optional">(Opcional)</span>
                  </label>
                  <input type="number" class="oc-input" id="num_certificados" min="0">
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Costo
                    <span class="oc-required">*</span>
                  </label>
                  <input type="number" class="oc-input" id="costo" step="0.01" min="0" required>
                </div>

                <div class="oc-field">
                  <label class="oc-label">
                    Aprobación/Autorización
                    <span class="oc-optional">(Opcional)</span>
                  </label>
                  <input type="text" class="oc-input" id="aprobacion" placeholder="Ej: Gerente General">
                </div>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="oc-section">
              <h3 class="oc-section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Observaciones
              </h3>
              
              <div class="oc-field">
                <label class="oc-label">
                  Observaciones o Notas Adicionales
                  <span class="oc-optional">(Opcional)</span>
                </label>
                <textarea class="oc-textarea" id="observaciones" rows="4" 
                          placeholder="Ingrese cualquier observación, requisito especial o detalle adicional..."></textarea>
              </div>
            </div>

            <!-- Resumen de Costo -->
            <div class="oc-cost-summary">
              <div class="oc-summary-row">
                <span class="oc-summary-label">Costo Total:</span>
                <span class="oc-summary-value" id="costoTotal">S/ 0.00</span>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="oc-form-actions">
              <button type="button" class="oc-btn-cancel" id="btnCancelarFormulario">
                Cancelar
              </button>
              <button type="submit" class="oc-btn-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Guardar y Generar Orden
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Esperar a que el DOM se actualice
  setTimeout(() => {
    initOrdenesCapacitacionHandlers();
  }, 0);

  return content;
}

function initOrdenesCapacitacionHandlers() {
  const btnNueva = document.getElementById('btnNuevaOrdenCapacitacion');
  const btnCerrar = document.getElementById('btnCerrarFormulario');
  const btnCancelar = document.getElementById('btnCancelarFormulario');
  const form = document.getElementById('formOrdenCapacitacion') as HTMLFormElement;

  if (btnNueva) {
    btnNueva.addEventListener('click', mostrarFormularioOrdenCapacitacion);
  }

  if (btnCerrar) {
    btnCerrar.addEventListener('click', ocultarFormularioOrdenCapacitacion);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', ocultarFormularioOrdenCapacitacion);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmitOrdenCapacitacion();
    });
  }

  // Actualizar costo en tiempo real
  const inputCosto = document.getElementById('costo') as HTMLInputElement;
  if (inputCosto) {
    inputCosto.addEventListener('input', actualizarCostoTotal);
  }

  // Cargar datos de cotización si se selecciona una referencia
  const selectCotizacion = document.getElementById('id_cotizacion_ref') as HTMLSelectElement;
  if (selectCotizacion) {
    selectCotizacion.addEventListener('change', cargarDatosCotizacion);
  }

  // Establecer fecha/hora actual por defecto
  const fechaServicio = document.getElementById('fecha_servicio') as HTMLInputElement;
  if (fechaServicio && !fechaServicio.value) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaServicio.value = hoy;
  }
}

function mostrarFormularioOrdenCapacitacion() {
  const overlay = document.getElementById('formularioOrdenCapacitacion');
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

function ocultarFormularioOrdenCapacitacion() {
  const overlay = document.getElementById('formularioOrdenCapacitacion');
  const form = document.getElementById('formOrdenCapacitacion') as HTMLFormElement;
  
  if (overlay) {
    overlay.style.display = 'none';
  }
  
  if (form) {
    form.reset();
  }
  
  // Resetear costo total
  const costoTotal = document.getElementById('costoTotal');
  if (costoTotal) {
    costoTotal.textContent = 'S/ 0.00';
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
    
    // TODO: Cargar servicio y otros datos de la cotización automáticamente
    console.log('Cargar datos de cotización:', selectCotizacion.value);
  }
}

function actualizarCostoTotal() {
  const inputCosto = document.getElementById('costo') as HTMLInputElement;
  const costoTotal = document.getElementById('costoTotal');
  
  if (inputCosto && costoTotal) {
    const costo = parseFloat(inputCosto.value) || 0;
    costoTotal.textContent = `S/ ${costo.toFixed(2)}`;
  }
}

function handleSubmitOrdenCapacitacion() {
  const form = document.getElementById('formOrdenCapacitacion') as HTMLFormElement;
  if (!form) return;
  
  // Recopilar datos del formulario
  const formData = {
    orden_capacitacion: {
      numero_orden: (document.getElementById('numero_orden') as HTMLInputElement)?.value,
      id_cotizacion: (document.getElementById('id_cotizacion_ref') as HTMLSelectElement)?.value || null,
      id_cliente: (document.getElementById('id_cliente') as HTMLSelectElement)?.value,
      id_servicio: (document.getElementById('id_servicio') as HTMLSelectElement)?.value,
      id_ponente: (document.getElementById('id_ponente') as HTMLSelectElement)?.value,
      fecha_servicio: (document.getElementById('fecha_servicio') as HTMLInputElement)?.value,
      hora_servicio: (document.getElementById('hora_servicio') as HTMLInputElement)?.value,
      modalidad: (document.getElementById('modalidad') as HTMLSelectElement)?.value,
      num_participantes: (document.getElementById('num_participantes') as HTMLInputElement)?.value,
      num_certificados: (document.getElementById('num_certificados') as HTMLInputElement)?.value || null,
      costo: (document.getElementById('costo') as HTMLInputElement)?.value,
      aprobacion: (document.getElementById('aprobacion') as HTMLInputElement)?.value || null,
      observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement)?.value || null
    }
  };
  
  console.log('Datos de la orden de capacitación:', formData);
  
  // Aquí iría la llamada al backend para guardar
  // Por ahora, simulamos éxito
  alert('Orden de capacitación/auditoría guardada exitosamente');
  
  // Generar PDF (función placeholder)
  generarPDFOrdenCapacitacion(formData);
  
  // Cerrar formulario
  ocultarFormularioOrdenCapacitacion();
}

function generarPDFOrdenCapacitacion(data: any) {
  console.log('Generando PDF de orden de capacitación...', data);
  // TODO: iria implementar la generación de PDF
  alert('Función de generación de PDF en desarrollo');
}
