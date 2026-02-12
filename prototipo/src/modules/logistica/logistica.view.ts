// Logística View
import { clienteService } from '../../services/clienteService';
import type { Cliente } from '../../core/api/types';

let clientesLogisticaData: Cliente[] = [];
let filtroSearchLogistica = '';

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ['#1e3a5f', '#2d5a27', '#7c3aed', '#dc2626', '#ea580c', '#0891b2', '#4f46e5', '#be185d'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Tab: Clientes
export function renderClientesTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" id="logistica-search-clientes" placeholder="Buscar cliente..." class="search-input">
      </div>
      <select class="filter-select" id="logistica-filter-rubro">
        <option value="">Todos los sectores</option>
      </select>
      <button class="btn-filter" id="logistica-btn-filtrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="client-grid" id="logistica-clientes-grid">
      <div style="text-align: center; padding: 40px; color: #64748b;">Cargando clientes...</div>
    </div>

    <div class="pagination" id="logistica-clientes-pagination">
      <span class="pagination-info"></span>
    </div>
  `;
}

async function cargarClientesLogistica() {
  try {
    const params: any = { estado: 'Acepta' };
    if (filtroSearchLogistica) params.search = filtroSearchLogistica;

    const rubroSelect = document.getElementById('logistica-filter-rubro') as HTMLSelectElement;
    if (rubroSelect && rubroSelect.value) params.rubro = rubroSelect.value;

    const response = await clienteService.getAll(params);
    const data = response.data || response;

    clientesLogisticaData = Array.isArray(data) ? data : (data as any).data || [];
    renderizarGridClientes();
    actualizarRubrosFilter();
  } catch (error) {
    console.error('Error cargando clientes:', error);
    const grid = document.getElementById('logistica-clientes-grid');
    if (grid) grid.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Error al cargar clientes</div>';
  }
}

function actualizarRubrosFilter() {
  const select = document.getElementById('logistica-filter-rubro') as HTMLSelectElement;
  if (!select) return;
  const currentVal = select.value;
  const rubros = [...new Set(clientesLogisticaData.map(c => c.rubro).filter(Boolean))];
  select.innerHTML = '<option value="">Todos los sectores</option>' +
    rubros.map(r => `<option value="${r}" ${r === currentVal ? 'selected' : ''}>${r}</option>`).join('');
}

function renderizarGridClientes() {
  const grid = document.getElementById('logistica-clientes-grid');
  if (!grid) return;

  let filtered = clientesLogisticaData;
  const rubroSelect = document.getElementById('logistica-filter-rubro') as HTMLSelectElement;
  if (rubroSelect && rubroSelect.value) {
    filtered = filtered.filter(c => c.rubro === rubroSelect.value);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 60px; color: #64748b; grid-column: 1 / -1;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px;">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p>No se encontraron clientes</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(cliente => {
    const initials = getInitials(cliente.nombre_empresa);
    const color = getAvatarColor(cliente.nombre_empresa);

    return `
      <div class="client-card">
        <div class="client-header">
          <div class="client-avatar" style="background: ${color};">${initials}</div>
          <div class="client-info">
            <h3>${cliente.nombre_empresa}</h3>
            <p class="client-type">${cliente.rubro || '—'}</p>
          </div>
          <span class="client-status active">Activo</span>
        </div>
        <div class="client-details">
          ${cliente.direccion ? `
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${cliente.direccion}</span>
          </div>` : ''}
          ${cliente.telefono_contacto ? `
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>${cliente.telefono_contacto}</span>
          </div>` : ''}
          ${cliente.persona_contacto ? `
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>${cliente.persona_contacto}</span>
          </div>` : ''}
        </div>
        <div class="client-stats">
          <div class="client-stat">
            <div class="stat-number">${cliente.ruc || '—'}</div>
            <div class="stat-label">RUC</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">${cliente.origen || '—'}</div>
            <div class="stat-label">Origen</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">${cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '—'}</div>
            <div class="stat-label">Registro</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Pagination info
  const pagination = document.querySelector('#logistica-clientes-pagination .pagination-info');
  if (pagination) {
    pagination.textContent = `Mostrando ${filtered.length} de ${clientesLogisticaData.length} clientes`;
  }
}

export function initClientesLogisticaEvents() {
  // Cargar datos
  cargarClientesLogistica();

  // Búsqueda con debounce
  let debounce: ReturnType<typeof setTimeout>;
  const searchInput = document.getElementById('logistica-search-clientes') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        filtroSearchLogistica = searchInput.value.trim();
        cargarClientesLogistica();
      }, 400);
    });
  }

  // Filtrar por rubro
  const btnFiltrar = document.getElementById('logistica-btn-filtrar');
  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', () => renderizarGridClientes());
  }

  const rubroSelect = document.getElementById('logistica-filter-rubro');
  if (rubroSelect) {
    rubroSelect.addEventListener('change', () => renderizarGridClientes());
  }
}

// Tab: Servicios Disponibles
export function renderServiciosDisponiblesTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar servicio..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los servicios</option>
        <option>Fumigación</option>
        <option>Desratización</option>
        <option>Desinsectación</option>
        <option>Sanitización</option>
      </select>
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon blue">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        </div>
        <h3>Fumigación Residencial</h3>
        <p class="service-description">Control integral de plagas en viviendas y departamentos</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">2-3 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$180</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Cucarachas</span>
          <span class="tag">Hormigas</span>
          <span class="tag">Arañas</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon green">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        </div>
        <h3>Fumigación Comercial</h3>
        <p class="service-description">Protección profesional para negocios y locales comerciales</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">4-6 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$350</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Roedores</span>
          <span class="tag">Insectos</span>
          <span class="tag">Certificado</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon orange">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3>Desratización</h3>
        <p class="service-description">Eliminación y control especializado de roedores</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">3-4 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$250</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Ratas</span>
          <span class="tag">Ratones</span>
          <span class="tag">Prevención</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon blue">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
        </div>
        <h3>Sanitización COVID-19</h3>
        <p class="service-description">Desinfección profunda con productos certificados</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">2-3 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$200</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Virus</span>
          <span class="tag">Bacterias</span>
          <span class="tag">Certificado</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon green">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <h3>Fumigación Industrial</h3>
        <p class="service-description">Soluciones integrales para plantas y almacenes</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">8+ hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$800</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Gran Escala</span>
          <span class="tag">Preventivo</span>
          <span class="tag">BPM</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon orange">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        </div>
        <h3>Desinsectación</h3>
        <p class="service-description">Control especializado de insectos voladores y rastreros</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">2-4 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$220</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Moscas</span>
          <span class="tag">Mosquitos</span>
          <span class="tag">Pulgas</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-6 de 12 servicios disponibles</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

// Tab: Rutas
export function renderRutasTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Rutas Activas Hoy</div>
          <div class="stat-box-value">8</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Servicios Programados</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tiempo Promedio</div>
          <div class="stat-box-value">3.5 <span class="stat-box-note">hrs/ruta</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar ruta..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los vehículos</option>
        <option>Unidad U-05</option>
        <option>Unidad U-12</option>
        <option>Unidad U-18</option>
      </select>
      <input type="date" class="filter-select" value="2026-01-31">
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>RUTA</th>
            <th>VEHÍCULO</th>
            <th>CONDUCTOR</th>
            <th>SERVICIOS</th>
            <th>HORARIO</th>
            <th>ZONA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>RUTA-A-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-05</div>
                  <div class="equipment-id">ABC-123</div>
                </div>
              </div>
            </td>
            <td>Carlos Mendoza</td>
            <td>4 servicios</td>
            <td>08:00 - 14:30</td>
            <td>Lima Norte</td>
            <td><span class="badge blue">En Curso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-B-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-12</div>
                  <div class="equipment-id">DEF-456</div>
                </div>
              </div>
            </td>
            <td>Juan Ramírez</td>
            <td>3 servicios</td>
            <td>09:00 - 13:00</td>
            <td>Lima Sur</td>
            <td><span class="badge blue">En Curso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-C-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-18</div>
                  <div class="equipment-id">GHI-789</div>
                </div>
              </div>
            </td>
            <td>Pedro López</td>
            <td>5 servicios</td>
            <td>07:30 - 15:00</td>
            <td>Callao</td>
            <td><span class="badge green">Completada</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-D-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-22</div>
                  <div class="equipment-id">JKL-012</div>
                </div>
              </div>
            </td>
            <td>Luis Torres</td>
            <td>2 servicios</td>
            <td>10:00 - 12:30</td>
            <td>Miraflores</td>
            <td><span class="badge">Programada</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-E-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-08</div>
                  <div class="equipment-id">MNO-345</div>
                </div>
              </div>
            </td>
            <td>María Soto</td>
            <td>6 servicios</td>
            <td>08:30 - 16:00</td>
            <td>San Juan</td>
            <td><span class="badge blue">En Curso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-5 de 8 rutas activas</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

export function renderLogistica() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Logística</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="clientes">Clientes</button>
      <button class="tab-btn" data-tab="servicios">Servicios Disponibles</button>
      <button class="tab-btn" data-tab="rutas">Rutas</button>
    </div>

    <div id="logistica-tab-content">
      ${renderClientesTab()}
    </div>
  `;
}
