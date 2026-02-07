// Programaciones View
import './programaciones.css';

// Datos de ejemplo 
const programacionesEjemplo = [
  {
    id: 1,
    id_servicio: 1,
    servicio_nombre: 'Fumigación Industrial',
    id_cliente: 1,
    cliente_nombre: 'Industrias ABC S.A.C.',
    id_tecnico_asignado: 1,
    tecnico_nombre: 'Juan Ramírez',
    fecha_programada: '2025-01-06',
    hora_inicio: '09:00',
    hora_fin: '13:00',
    local_sede: 'Planta Principal - Lima',
    direccion_completa: 'Av. Industrial 123, Callao',
    estado_ejecucion: 'Programado',
    requiere_movilidad: true,
    id_vehiculo: 1,
    vehiculo_placa: 'ABC-123',
    observaciones: 'Cliente requiere certificado ISO',
  },
  {
    id: 2,
    id_servicio: 2,
    servicio_nombre: 'Mantenimiento',
    id_cliente: 2,
    cliente_nombre: 'Restaurant El Sabor',
    id_tecnico_asignado: 2,
    tecnico_nombre: 'María Soto',
    fecha_programada: '2025-01-07',
    hora_inicio: '14:00',
    hora_fin: '16:00',
    local_sede: 'Local Miraflores',
    direccion_completa: 'Av. Larco 456, Miraflores',
    estado_ejecucion: 'Confirmado',
    requiere_movilidad: false,
    observaciones: '',
  },
];

const tecnicosEjemplo = [
  { id: 1, nombre: 'Juan Ramírez', estado: 'Activo', servicios_hoy: 2, autorizado_conducir: true },
  { id: 2, nombre: 'María Soto', estado: 'Activo', servicios_hoy: 3, autorizado_conducir: false },
  { id: 3, nombre: 'Pedro López', estado: 'Activo', servicios_hoy: 0, autorizado_conducir: true },
];

let vistaActual = 'mensual'; // 'diaria', 'semanal', 'mensual'
let fechaActual = new Date(2025, 0, 1); // Enero 2025

export function renderProgramaciones() {
  return `
    <div class="prog-page-header">
      <div class="prog-breadcrumb">Programación de Servicios</div>
      <div class="prog-actions">
        <select class="prog-view-selector" id="viewSelector">
          <option value="diaria" ${vistaActual === 'diaria' ? 'selected' : ''}>Vista Diaria</option>
          <option value="semanal" ${vistaActual === 'semanal' ? 'selected' : ''}>Vista Semanal</option>
          <option value="mensual" ${vistaActual === 'mensual' ? 'selected' : ''}>Vista Mensual</option>
        </select>
        <button class="prog-btn-secondary" id="btnExportarAgenda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="prog-btn-primary" id="btnNuevaProgramacion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Programación
        </button>
      </div>
    </div>

    <div class="prog-layout">
      ${renderSidebar()}
      ${renderCalendarioSegunVista()}
    </div>

    ${renderModalDetalle()}
    ${renderModalNuevaProgramacion()}
  `;
}

function renderSidebar() {
  const stats = calcularEstadisticas();
  
  return `
    <div class="prog-sidebar">
      <div class="prog-filter-section">
        <h3 class="prog-section-title">FILTROS</h3>
        
        <div class="prog-filter-group">
          <label class="prog-filter-label">Tipo de Servicio</label>
          <select class="prog-filter-select" id="filtroServicio">
            <option value="">Todos</option>
            <option value="fumigacion">Fumigación</option>
            <option value="desratizacion">Desratización</option>
            <option value="desinsectacion">Desinsectación</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="control_plagas">Control de Plagas</option>
          </select>
        </div>

        <div class="prog-filter-group">
          <label class="prog-filter-label">Estado</label>
          <div class="prog-checkbox-group">
            <label class="prog-checkbox-item">
              <input type="checkbox" value="Programado" checked> Programado
            </label>
            <label class="prog-checkbox-item">
              <input type="checkbox" value="Confirmado" checked> Confirmado
            </label>
            <label class="prog-checkbox-item">
              <input type="checkbox" value="En Camino"> En Camino
            </label>
            <label class="prog-checkbox-item">
              <input type="checkbox" value="En Ejecución"> En Ejecución
            </label>
            <label class="prog-checkbox-item">
              <input type="checkbox" value="Realizado"> Realizado
            </label>
            <label class="prog-checkbox-item">
              <input type="checkbox" value="Reprogramado"> Reprogramado
            </label>
            <label class="prog-checkbox-item">
              <input type="checkbox" value="Cancelado"> Cancelado
            </label>
          </div>
        </div>

        <div class="prog-filter-group">
          <label class="prog-filter-label">Técnico</label>
          <select class="prog-filter-select" id="filtroTecnico">
            <option value="">Todos</option>
            ${tecnicosEjemplo.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="prog-stats">
        <div class="prog-stat-item">
          <div class="prog-stat-value">${stats.programados}</div>
          <div class="prog-stat-label">Programados</div>
        </div>
        <div class="prog-stat-item">
          <div class="prog-stat-value">${stats.completados}</div>
          <div class="prog-stat-label">Completados</div>
        </div>
        <div class="prog-stat-item">
          <div class="prog-stat-value">${stats.pendientes}</div>
          <div class="prog-stat-label">Pendientes</div>
        </div>
      </div>

      <div class="prog-tech-section">
        <h3 class="prog-section-title">DISPONIBILIDAD TÉCNICOS</h3>
        ${tecnicosEjemplo.map(t => `
          <div class="prog-tech-item">
            <div class="prog-tech-avatar">${t.nombre.split(' ').map(n => n[0]).join('')}</div>
            <div class="prog-tech-info">
              <div class="prog-tech-name">${t.nombre}</div>
              <div class="prog-tech-status ${t.servicios_hoy === 0 ? 'available' : t.servicios_hoy < 3 ? 'busy' : 'full'}">
                ${t.servicios_hoy === 0 ? 'Disponible' : `${t.servicios_hoy} servicio(s) hoy`}
              </div>
              ${t.autorizado_conducir ? '<div class="prog-tech-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M5 17h14v2H5v-2zm0-6h14v2H5v-2zm14-4H5v2h14V7zM8 4h8l2 3H6l2-3z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>Autorizado conducir</div>' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCalendarioSegunVista() {
  if (vistaActual === 'diaria') return renderVistaDiaria();
  if (vistaActual === 'semanal') return renderVistaSemanal();
  return renderVistaMensual();
}

function renderVistaMensual() {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  return `
    <div class="prog-calendar-main">
      <div class="prog-calendar-header">
        <h2>${monthNames[fechaActual.getMonth()]} ${fechaActual.getFullYear()}</h2>
        <div class="prog-calendar-nav">
          <button class="prog-btn-icon" id="btnPrevMonth">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="prog-btn-secondary" id="btnHoy">Hoy</button>
          <button class="prog-btn-icon" id="btnNextMonth">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <div class="prog-calendar-grid">
        <div class="prog-calendar-weekdays">
          <div class="prog-weekday">LUN</div>
          <div class="prog-weekday">MAR</div>
          <div class="prog-weekday">MIÉ</div>
          <div class="prog-weekday">JUE</div>
          <div class="prog-weekday">VIE</div>
          <div class="prog-weekday">SÁB</div>
          <div class="prog-weekday">DOM</div>
        </div>
        <div class="prog-calendar-days">
          ${renderDiasDelMes()}
        </div>
      </div>
    </div>
  `;
}

function renderVistaSemanal() {
  return `
    <div class="prog-calendar-main">
      <div class="prog-calendar-header">
        <h2>Semana del ${fechaActual.toLocaleDateString('es-PE')}</h2>
        <div class="prog-calendar-nav">
          <button class="prog-btn-icon" id="btnPrevWeek">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="prog-btn-secondary" id="btnHoy">Hoy</button>
          <button class="prog-btn-icon" id="btnNextWeek">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
      <div class="prog-week-view">
        ${renderSemana()}
      </div>
    </div>
  `;
}

function renderVistaDiaria() {
  return `
    <div class="prog-calendar-main">
      <div class="prog-calendar-header">
        <h2>${fechaActual.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
        <div class="prog-calendar-nav">
          <button class="prog-btn-icon" id="btnPrevDay">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="prog-btn-secondary" id="btnHoy">Hoy</button>
          <button class="prog-btn-icon" id="btnNextDay">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
      <div class="prog-day-view">
        ${renderDia()}
      </div>
    </div>
  `;
}

function renderDiasDelMes() {
  // Esta función generará los días del mes con los servicios programados
  // Por ahora retorno un ejemplo simplificado
  const dias = [];
  
  // Días del mes anterior (grises)
  for (let i = 29; i <= 31; i++) {
    dias.push(`
      <div class="prog-calendar-day other-month">
        <span class="prog-day-number">${i}</span>
      </div>
    `);
  }
  
  // Días del mes actual
  for (let i = 1; i <= 31; i++) {
    const serviciosDelDia = programacionesEjemplo.filter(p => {
      const fecha = new Date(p.fecha_programada);
      return fecha.getDate() === i;
    });
    
    dias.push(`
      <div class="prog-calendar-day ${i === 31 ? 'highlighted' : ''}">
        <span class="prog-day-number">${i}</span>
        ${serviciosDelDia.map(s => `
          <div class="prog-event ${getColorByState(s.estado_ejecucion)}" data-programacion-id="${s.id}">
            <div class="prog-event-title">${s.servicio_nombre}</div>
            <div class="prog-event-time">${s.hora_inicio} - ${s.hora_fin}</div>
            ${s.requiere_movilidad ? '<div class="prog-event-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>' : ''}
          </div>
        `).join('')}
      </div>
    `);
  }
  
  // Primer día del siguiente mes
  dias.push(`
    <div class="prog-calendar-day other-month">
      <span class="prog-day-number">1</span>
    </div>
  `);
  
  return dias.join('');
}

function renderSemana() {
  // Vista semanal con timeline
  const horas = Array.from({ length: 13 }, (_, i) => i + 7); // 7am a 7pm
  
  return `
    <div class="prog-week-timeline">
      <div class="prog-week-hours">
        ${horas.map(h => `<div class="prog-hour">${h}:00</div>`).join('')}
      </div>
      <div class="prog-week-days">
        ${Array.from({ length: 7 }, (_, i) => renderDiaSemanal(i)).join('')}
      </div>
    </div>
  `;
}

function renderDiaSemanal(dayOffset: number) {
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return `
    <div class="prog-week-day-column">
      <div class="prog-week-day-header">${dias[dayOffset]}</div>
      <div class="prog-week-day-slots">
        <!-- Los servicios se renderizarán aquí según la hora -->
      </div>
    </div>
  `;
}

function renderDia() {
  const serviciosDelDia = programacionesEjemplo.filter(p => 
    new Date(p.fecha_programada).toDateString() === fechaActual.toDateString()
  );
  
  return `
    <div class="prog-day-timeline">
      <div class="prog-day-services">
        ${serviciosDelDia.length > 0 ? serviciosDelDia.map(s => `
          <div class="prog-day-service-card" data-programacion-id="${s.id}">
            <div class="prog-day-service-time">
              <div class="prog-time-badge">${s.hora_inicio}</div>
              <div class="prog-time-line"></div>
              <div class="prog-time-badge">${s.hora_fin}</div>
            </div>
            <div class="prog-day-service-content">
              <div class="prog-day-service-header">
                <h3>${s.servicio_nombre}</h3>
                <span class="prog-status-badge ${s.estado_ejecucion}">${s.estado_ejecucion}</span>
              </div>
              <div class="prog-day-service-details">
                <div><strong>Cliente:</strong> ${s.cliente_nombre}</div>
                <div><strong>Técnico:</strong> ${s.tecnico_nombre}</div>
                <div><strong>Local:</strong> ${s.local_sede}</div>
                ${s.requiere_movilidad ? `<div><strong>Vehículo:</strong> ${s.vehiculo_placa || 'No asignado'}</div>` : ''}
              </div>
            </div>
          </div>
        `).join('') : '<div class="prog-no-services">No hay servicios programados para hoy</div>'}
      </div>
    </div>
  `;
}

function renderModalDetalle() {
  return `
    <div class="prog-modal" id="modalDetalleProgramacion" style="display: none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2>Detalle de Programación</h2>
          <button class="prog-modal-close" id="closeModalDetalle">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalDetalleBody">
          <!-- Se llenará dinámicamente -->
        </div>
      </div>
    </div>
  `;
}

function renderModalNuevaProgramacion() {
  return `
    <div class="prog-modal" id="modalNuevaProgramacion" style="display: none;">
      <div class="prog-modal-overlay"></div>
      <div class="prog-modal-content prog-modal-large">
        <div class="prog-modal-header">
          <h2>Nueva Programación de Servicio</h2>
          <button class="prog-modal-close" id="closeModalNueva">&times;</button>
        </div>
        <div class="prog-modal-body">
          <form id="formNuevaProgramacion" class="prog-form">
            <div class="prog-form-grid">
              <!-- Sección: Selección de Servicio -->
              <div class="prog-form-section">
                <h3 class="prog-form-section-title">Información del Servicio</h3>
                
                <div class="prog-form-group">
                  <label class="prog-form-label">Orden de Servicio <span class="prog-required">*</span></label>
                  <select class="prog-form-control" name="id_orden_servicio" id="selectOrdenServicio">
                    <option value="">Seleccionar orden...</option>
                    <option value="1">OS-2025-001 - Industrias ABC</option>
                    <option value="2">OS-2025-002 - Restaurant El Sabor</option>
                  </select>
                </div>

                <div class="prog-form-group">
                  <label class="prog-form-label">Servicio <span class="prog-required">*</span></label>
                  <select class="prog-form-control" name="id_servicio" required>
                    <option value="">Seleccionar servicio...</option>
                    <option value="1">Fumigación Industrial</option>
                    <option value="2">Desratización</option>
                    <option value="3">Control de Plagas</option>
                    <option value="4">Mantenimiento Preventivo</option>
                  </select>
                </div>

                <div class="prog-form-row">
                  <div class="prog-form-group">
                    <label class="prog-form-label">Fecha <span class="prog-required">*</span></label>
                    <input type="date" class="prog-form-control" name="fecha_programada" required>
                  </div>
                  <div class="prog-form-group">
                    <label class="prog-form-label">Hora Inicio <span class="prog-required">*</span></label>
                    <input type="time" class="prog-form-control" name="hora_inicio" required>
                  </div>
                  <div class="prog-form-group">
                    <label class="prog-form-label">Hora Fin <span class="prog-required">*</span></label>
                    <input type="time" class="prog-form-control" name="hora_fin" required>
                  </div>
                </div>
              </div>

              <!-- Sección: Asignación de Recursos -->
              <div class="prog-form-section">
                <h3 class="prog-form-section-title">Asignación de Recursos</h3>
                
                <div class="prog-form-group">
                  <label class="prog-form-label">Técnico Asignado <span class="prog-required">*</span></label>
                  <select class="prog-form-control" name="id_tecnico_asignado" id="selectTecnico" required>
                    <option value="">Seleccionar técnico...</option>
                    ${tecnicosEjemplo.map(t => `
                      <option value="${t.id}">${t.nombre}${t.autorizado_conducir ? ' (Conductor)' : ''}</option>
                    `).join('')}
                  </select>
                  <small class="prog-form-help">Los técnicos marcados como "(Conductor)" están autorizados para conducir</small>
                </div>

                <div class="prog-form-group">
                  <label class="prog-form-label">Vehículo</label>
                  <select class="prog-form-control" name="id_vehiculo" id="selectVehiculo">
                    <option value="">Sin vehículo</option>
                    <option value="1">ABC-123 - Toyota Hilux</option>
                    <option value="2">DEF-456 - Nissan Frontier</option>
                  </select>
                  <small class="prog-form-help" id="avisoVehiculo" style="display: none; color: #f59e0b;">
                    ⚠️ Este servicio requiere movilidad. Solo Jordi puede conducir.
                  </small>
                </div>

                <div class="prog-form-group">
                  <label class="prog-form-label">Supervisor</label>
                  <select class="prog-form-control" name="id_supervisor">
                    <option value="">Sin supervisor</option>
                    <option value="1">Carlos Mendoza</option>
                    <option value="2">Ana Torres</option>
                  </select>
                </div>
              </div>

              <!-- Sección: Ubicación -->
              <div class="prog-form-section">
                <h3 class="prog-form-section-title">Ubicación del Servicio</h3>
                
                <div class="prog-form-group">
                  <label class="prog-form-label">Local/Sede <span class="prog-required">*</span></label>
                  <input type="text" class="prog-form-control" name="local_sede" placeholder="Ej: Planta Principal - Lima" required>
                </div>

                <div class="prog-form-group">
                  <label class="prog-form-label">Dirección Completa <span class="prog-required">*</span></label>
                  <textarea class="prog-form-control" name="direccion_completa" rows="2" placeholder="Dirección completa del servicio" required></textarea>
                </div>

                <div class="prog-form-group">
                  <label class="prog-form-label">Coordenadas GPS</label>
                  <input type="text" class="prog-form-control" name="coordenadas" placeholder="-12.0464, -77.0428">
                  <small class="prog-form-help">Formato: latitud, longitud</small>
                </div>
              </div>

              <!-- Sección: Observaciones -->
              <div class="prog-form-section prog-form-section-full">
                <h3 class="prog-form-section-title">Observaciones y Notas</h3>
                
                <div class="prog-form-group">
                  <label class="prog-form-label">Observaciones</label>
                  <textarea class="prog-form-control" name="observaciones" rows="3" placeholder="Instrucciones especiales, requisitos del cliente, etc."></textarea>
                </div>

                <div class="prog-form-group">
                  <label class="prog-form-label">Estado Inicial</label>
                  <select class="prog-form-control" name="estado_ejecucion">
                    <option value="Programado">Programado</option>
                    <option value="Confirmado">Confirmado</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="prog-modal-footer">
              <button type="button" class="prog-btn-secondary" id="btnCancelarNueva">Cancelar</button>
              <button type="submit" class="prog-btn-primary">Crear Programación</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function getColorByState(estado: string): string {
  const colores: Record<string, string> = {
    'Programado': 'blue',
    'Confirmado': 'green',
    'En Camino': 'cyan',
    'En Ejecución': 'orange',
    'Realizado': 'purple',
    'Reprogramado': 'yellow',
    'Cancelado': 'gray'
  };
  return colores[estado] || 'blue';
}

function calcularEstadisticas() {
  const programados = programacionesEjemplo.filter(p => 
    ['Programado', 'Confirmado'].includes(p.estado_ejecucion)
  ).length;
  
  const completados = programacionesEjemplo.filter(p => 
    p.estado_ejecucion === 'Realizado'
  ).length;
  
  const pendientes = programacionesEjemplo.filter(p => 
    p.estado_ejecucion === 'Programado'
  ).length;
  
  return { programados: 42, completados: 12, pendientes: 5 }; // Valores de ejemplo
}

export function initProgramacionesEvents() {
  // Botón Nueva Programación
  const btnNueva = document.getElementById('btnNuevaProgramacion');
  if (btnNueva) {
    btnNueva.addEventListener('click', abrirModalNuevaProgramacion);
  }

  // Botón Exportar
  const btnExportar = document.getElementById('btnExportarAgenda');
  if (btnExportar) {
    btnExportar.addEventListener('click', () => {
      alert('Exportando agenda a PDF... (Funcionalidad pendiente)');
    });
  }

  // Selector de vista
  const viewSelector = document.getElementById('viewSelector') as HTMLSelectElement;
  if (viewSelector) {
    viewSelector.addEventListener('change', (e) => {
      vistaActual = (e.target as HTMLSelectElement).value as 'diaria' | 'semanal' | 'mensual';
      actualizarVista();
    });
  }

  // Botones de navegación - Vista Mensual
  const btnPrevMonth = document.getElementById('btnPrevMonth');
  const btnNextMonth = document.getElementById('btnNextMonth');
  const btnHoy = document.getElementById('btnHoy');

  if (btnPrevMonth) {
    btnPrevMonth.addEventListener('click', () => {
      fechaActual.setMonth(fechaActual.getMonth() - 1);
      actualizarVista();
    });
  }

  if (btnNextMonth) {
    btnNextMonth.addEventListener('click', () => {
      fechaActual.setMonth(fechaActual.getMonth() + 1);
      actualizarVista();
    });
  }

  if (btnHoy) {
    btnHoy.addEventListener('click', () => {
      fechaActual = new Date();
      actualizarVista();
    });
  }

  // Botones de navegación - Vista Semanal
  const btnPrevWeek = document.getElementById('btnPrevWeek');
  const btnNextWeek = document.getElementById('btnNextWeek');

  if (btnPrevWeek) {
    btnPrevWeek.addEventListener('click', () => {
      fechaActual.setDate(fechaActual.getDate() - 7);
      actualizarVista();
    });
  }

  if (btnNextWeek) {
    btnNextWeek.addEventListener('click', () => {
      fechaActual.setDate(fechaActual.getDate() + 7);
      actualizarVista();
    });
  }

  // Botones de navegación - Vista Diaria
  const btnPrevDay = document.getElementById('btnPrevDay');
  const btnNextDay = document.getElementById('btnNextDay');

  if (btnPrevDay) {
    btnPrevDay.addEventListener('click', () => {
      fechaActual.setDate(fechaActual.getDate() - 1);
      actualizarVista();
    });
  }

  if (btnNextDay) {
    btnNextDay.addEventListener('click', () => {
      fechaActual.setDate(fechaActual.getDate() + 1);
      actualizarVista();
    });
  }

  // Click en eventos del calendario
  const eventos = document.querySelectorAll('.prog-event, .prog-day-service-card');
  eventos.forEach(evento => {
    evento.addEventListener('click', (e) => {
      e.stopPropagation();
      const programacionId = (evento as HTMLElement).dataset.programacionId;
      if (programacionId) {
        abrirModalDetalle(parseInt(programacionId));
      }
    });
  });

  // Cerrar modales
  const closeModalDetalle = document.getElementById('closeModalDetalle');
  const closeModalNueva = document.getElementById('closeModalNueva');
  const btnCancelarNueva = document.getElementById('btnCancelarNueva');

  if (closeModalDetalle) {
    closeModalDetalle.addEventListener('click', cerrarModalDetalle);
  }

  if (closeModalNueva) {
    closeModalNueva.addEventListener('click', cerrarModalNuevaProgramacion);
  }

  if (btnCancelarNueva) {
    btnCancelarNueva.addEventListener('click', cerrarModalNuevaProgramacion);
  }

  // Click en overlay para cerrar
  const modalDetalle = document.getElementById('modalDetalleProgramacion');
  const modalNueva = document.getElementById('modalNuevaProgramacion');

  if (modalDetalle) {
    modalDetalle.querySelector('.prog-modal-overlay')?.addEventListener('click', cerrarModalDetalle);
  }

  if (modalNueva) {
    modalNueva.querySelector('.prog-modal-overlay')?.addEventListener('click', cerrarModalNuevaProgramacion);
  }

  // Formulario Nueva Programación
  const formNueva = document.getElementById('formNuevaProgramacion') as HTMLFormElement;
  if (formNueva) {
    formNueva.addEventListener('submit', (e) => {
      e.preventDefault();
      guardarNuevaProgramacion(formNueva);
    });
  }

  // Detectar si servicio requiere movilidad
  const selectServicio = formNueva?.querySelector('[name="id_servicio"]') as HTMLSelectElement;
  const avisoVehiculo = document.getElementById('avisoVehiculo');
  
  if (selectServicio && avisoVehiculo) {
    selectServicio.addEventListener('change', () => {
      // Por ahora mostramos el aviso para ciertos servicios
      const serviciosConMovilidad = ['1', '3']; // Fumigación Industrial, Control de Plagas
      if (serviciosConMovilidad.includes(selectServicio.value)) {
        avisoVehiculo.style.display = 'block';
      } else {
        avisoVehiculo.style.display = 'none';
      }
    });
  }
}

function actualizarVista() {
  const mainContent = document.querySelector('.prog-calendar-main');
  if (mainContent) {
    mainContent.innerHTML = renderCalendarioSegunVista();
    // Re-inicializar eventos después de actualizar el DOM
    setTimeout(() => initProgramacionesEvents(), 100);
  }
}

function abrirModalNuevaProgramacion() {
  const modal = document.getElementById('modalNuevaProgramacion');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function cerrarModalNuevaProgramacion() {
  const modal = document.getElementById('modalNuevaProgramacion');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Limpiar formulario
    const form = document.getElementById('formNuevaProgramacion') as HTMLFormElement;
    if (form) form.reset();
  }
}

function abrirModalDetalle(programacionId: number) {
  const programacion = programacionesEjemplo.find(p => p.id === programacionId);
  if (!programacion) return;

  const modal = document.getElementById('modalDetalleProgramacion');
  const modalBody = document.getElementById('modalDetalleBody');
  
  if (modal && modalBody) {
    modalBody.innerHTML = generarContenidoModalDetalle(programacion);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Agregar eventos a los botones del modal
    const btnEditar = modalBody.querySelector('#btnEditarProgramacion');
    const btnCancelar = modalBody.querySelector('#btnCancelarProgramacion');
    const btnEliminar = modalBody.querySelector('#btnEliminarProgramacion');

    if (btnEditar) {
      btnEditar.addEventListener('click', () => habilitarEdicion(programacion));
    }

    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        if (confirm('¿Está seguro de cancelar esta programación?')) {
          alert('Programación cancelada (funcionalidad pendiente)');
          cerrarModalDetalle();
        }
      });
    }

    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => {
        if (confirm('¿Está seguro de eliminar esta programación? Esta acción no se puede deshacer.')) {
          alert('Programación eliminada (funcionalidad pendiente)');
          cerrarModalDetalle();
        }
      });
    }
  }
}

function cerrarModalDetalle() {
  const modal = document.getElementById('modalDetalleProgramacion');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function generarContenidoModalDetalle(prog: any) {
  return `
    <div class="prog-detalle-grid" id="detalleView">
      <div class="prog-detalle-section">
        <h3 class="prog-detalle-section-title">Información del Servicio</h3>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Servicio:</div>
          <div class="prog-detalle-value">${prog.servicio_nombre}</div>
        </div>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Estado:</div>
          <div class="prog-detalle-value">
            <span class="prog-status-badge ${prog.estado_ejecucion}">${prog.estado_ejecucion}</span>
          </div>
        </div>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Fecha Programada:</div>
          <div class="prog-detalle-value">${new Date(prog.fecha_programada).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Horario:</div>
          <div class="prog-detalle-value">${prog.hora_inicio} - ${prog.hora_fin}</div>
        </div>
      </div>

      <div class="prog-detalle-section">
        <h3 class="prog-detalle-section-title">Cliente</h3>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Nombre:</div>
          <div class="prog-detalle-value">${prog.cliente_nombre}</div>
        </div>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Local/Sede:</div>
          <div class="prog-detalle-value">${prog.local_sede}</div>
        </div>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Dirección:</div>
          <div class="prog-detalle-value">${prog.direccion_completa}</div>
        </div>
      </div>

      <div class="prog-detalle-section">
        <h3 class="prog-detalle-section-title">Recursos Asignados</h3>
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Técnico:</div>
          <div class="prog-detalle-value">${prog.tecnico_nombre}</div>
        </div>
        ${prog.requiere_movilidad ? `
        <div class="prog-detalle-row">
          <div class="prog-detalle-label">Vehículo:</div>
          <div class="prog-detalle-value">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
            ${prog.vehiculo_placa || 'No asignado'}
          </div>
        </div>
        ` : ''}
      </div>

      ${prog.observaciones ? `
      <div class="prog-detalle-section prog-detalle-section-full">
        <h3 class="prog-detalle-section-title">Observaciones</h3>
        <div class="prog-detalle-observaciones">${prog.observaciones}</div>
      </div>
      ` : ''}

      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-danger" id="btnEliminarProgramacion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Eliminar
        </button>
        <button type="button" class="prog-btn-warning" id="btnCancelarProgramacion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Cancelar Servicio
        </button>
        <button type="button" class="prog-btn-primary" id="btnEditarProgramacion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Editar
        </button>
      </div>
    </div>
  `;
}

function habilitarEdicion(prog: any) {
  const modalBody = document.getElementById('modalDetalleBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <form id="formEditarProgramacion" class="prog-form">
      <div class="prog-form-grid">
        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Información del Servicio</h3>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Estado</label>
            <select class="prog-form-control" name="estado_ejecucion">
              <option value="Programado" ${prog.estado_ejecucion === 'Programado' ? 'selected' : ''}>Programado</option>
              <option value="Confirmado" ${prog.estado_ejecucion === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
              <option value="En Camino" ${prog.estado_ejecucion === 'En Camino' ? 'selected' : ''}>En Camino</option>
              <option value="En Ejecución" ${prog.estado_ejecucion === 'En Ejecución' ? 'selected' : ''}>En Ejecución</option>
              <option value="Realizado" ${prog.estado_ejecucion === 'Realizado' ? 'selected' : ''}>Realizado</option>
              <option value="Reprogramado" ${prog.estado_ejecucion === 'Reprogramado' ? 'selected' : ''}>Reprogramado</option>
            </select>
          </div>

          <div class="prog-form-row">
            <div class="prog-form-group">
              <label class="prog-form-label">Fecha</label>
              <input type="date" class="prog-form-control" name="fecha_programada" value="${prog.fecha_programada}">
            </div>
            <div class="prog-form-group">
              <label class="prog-form-label">Hora Inicio</label>
              <input type="time" class="prog-form-control" name="hora_inicio" value="${prog.hora_inicio}">
            </div>
            <div class="prog-form-group">
              <label class="prog-form-label">Hora Fin</label>
              <input type="time" class="prog-form-control" name="hora_fin" value="${prog.hora_fin}">
            </div>
          </div>
        </div>

        <div class="prog-form-section">
          <h3 class="prog-form-section-title">Recursos</h3>
          
          <div class="prog-form-group">
            <label class="prog-form-label">Técnico Asignado</label>
            <select class="prog-form-control" name="id_tecnico_asignado">
              ${tecnicosEjemplo.map(t => `
                <option value="${t.id}" ${t.id === prog.id_tecnico_asignado ? 'selected' : ''}>
                  ${t.nombre}${t.autorizado_conducir ? ' (Conductor)' : ''}
                </option>
              `).join('')}
            </select>
          </div>

          ${prog.requiere_movilidad ? `
          <div class="prog-form-group">
            <label class="prog-form-label">Vehículo</label>
            <select class="prog-form-control" name="id_vehiculo">
              <option value="">Sin vehículo</option>
              <option value="1" ${prog.id_vehiculo === 1 ? 'selected' : ''}>ABC-123 - Toyota Hilux</option>
              <option value="2" ${prog.id_vehiculo === 2 ? 'selected' : ''}>DEF-456 - Nissan Frontier</option>
            </select>
          </div>
          ` : ''}
        </div>

        <div class="prog-form-section prog-form-section-full">
          <h3 class="prog-form-section-title">Observaciones</h3>
          <div class="prog-form-group">
            <textarea class="prog-form-control" name="observaciones" rows="3">${prog.observaciones || ''}</textarea>
          </div>
        </div>
      </div>

      <div class="prog-modal-footer">
        <button type="button" class="prog-btn-secondary" id="btnCancelarEdicion">Cancelar</button>
        <button type="submit" class="prog-btn-primary">Guardar Cambios</button>
      </div>
    </form>
  `;

  // Eventos del formulario de edición
  const formEditar = document.getElementById('formEditarProgramacion') as HTMLFormElement;
  const btnCancelar = document.getElementById('btnCancelarEdicion');

  if (formEditar) {
    formEditar.addEventListener('submit', (e) => {
      e.preventDefault();
      guardarEdicion(prog.id, formEditar);
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      abrirModalDetalle(prog.id); // Volver a vista de detalle
    });
  }
}

function guardarNuevaProgramacion(form: HTMLFormElement) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  console.log('Nueva programación:', data);
  alert('Programación creada exitosamente! (Los datos se mostrarían en consola. Backend pendiente)');
  
  cerrarModalNuevaProgramacion();
}

function guardarEdicion(id: number, form: HTMLFormElement) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  console.log('Editar programación ID:', id, 'Datos:', data);
  alert('Cambios guardados exitosamente! (Los datos se mostrarían en consola. Backend pendiente)');
  
  cerrarModalDetalle();
}

