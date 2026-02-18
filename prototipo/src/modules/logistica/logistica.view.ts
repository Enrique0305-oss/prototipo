// Logística View
import { clienteService } from '../../services/clienteService';
import { servicioService } from '../../services/servicioService';
import { catalogoCapAudService } from '../../services/catalogoCapAudService';
import type { CatalogoCapAud } from '../../services/catalogoCapAudService';
import { mostrarToast } from '../../shared/toast';
import type { Cliente, Servicio } from '../../core/api/types';

let clientesLogisticaData: Cliente[] = [];
let filtroSearchLogistica = '';
let serviciosData: Servicio[] = [];
let filtroSearchServicios = '';
let filtroEstadoServicios = 'activo';
let catalogoCapAudData: CatalogoCapAud[] = [];
let filtroSearchCatalogo = '';
let filtroEstadoCatalogo = 'activo';
let filtroTipoCatalogo = '';

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
        <input type="text" id="servicios-search" placeholder="Buscar servicio..." class="search-input">
      </div>
      <select class="filter-select" id="servicios-filter-estado">
        <option value="activo">Activos</option>
        <option value="all">Todos los servicios</option>
        <option value="inactivo">Inactivos</option>
      </select>
      <button class="btn-filter" id="servicios-btn-filtrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
      <button class="btn-primary" id="servicios-btn-nuevo" style="margin-left:auto;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Nuevo Servicio
      </button>
    </div>

    <div class="services-grid" id="servicios-grid">
      <div style="text-align:center;padding:40px;color:#64748b;grid-column:1/-1;">Cargando servicios...</div>
    </div>

    <div class="pagination" id="servicios-pagination">
      <span class="pagination-info"></span>
    </div>

    <!-- Modal Crear/Editar Servicio -->
    <div class="modal-overlay" id="modal-servicio" style="display:none;">
      <div class="modal-container" style="max-width:560px;">
        <div class="modal-header">
          <h2 id="modal-servicio-titulo">Nuevo Servicio</h2>
          <button class="modal-close" id="modal-servicio-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="servicio-id">
          <div class="form-group">
            <label class="form-label">Nombre <span style="color:#ef4444">*</span></label>
            <input type="text" id="servicio-nombre" class="form-input" maxlength="100" placeholder="Ej: Fumigación Residencial">
          </div>
          <div class="form-group">
            <label class="form-label">Descripción <span style="color:#ef4444">*</span></label>
            <input type="text" id="servicio-descripcion" class="form-input" maxlength="100" placeholder="Breve descripción del servicio">
          </div>
          <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Duración Estimada (min)</label>
              <input type="number" id="servicio-duracion" class="form-input" min="1" value="60" placeholder="60">
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select id="servicio-estado" class="form-input">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="form-group" style="display:flex;align-items:center;gap:8px;padding-top:24px;">
              <input type="checkbox" id="servicio-movilidad" style="width:18px;height:18px;">
              <label for="servicio-movilidad" class="form-label" style="margin:0;">Requiere Movilidad</label>
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:8px;padding-top:24px;">
              <input type="checkbox" id="servicio-certificado" style="width:18px;height:18px;">
              <label for="servicio-certificado" class="form-label" style="margin:0;">Requiere Certificado</label>
            </div>
          </div>
          <div class="form-group" id="servicio-plantilla-group" style="display:none;">
            <label class="form-label">Plantilla Certificado</label>
            <input type="text" id="servicio-plantilla" class="form-input" maxlength="255" placeholder="Nombre de la plantilla">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-servicio-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-servicio-guardar">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminación -->
    <div class="modal-overlay" id="modal-servicio-eliminar" style="display:none;">
      <div class="modal-container" style="max-width:420px;">
        <div class="modal-header">
          <h2>Confirmar Desactivación</h2>
          <button class="modal-close" id="modal-servicio-eliminar-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas desactivar el servicio <strong id="servicio-eliminar-nombre"></strong>?</p>
          <p style="color:#64748b;font-size:0.9em;">El servicio pasará a estado inactivo y no aparecerá en los listados.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-servicio-eliminar-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-servicio-eliminar-confirmar" style="background:#ef4444;">Desactivar</button>
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- CATÁLOGO DE CAPACITACIONES Y AUDITORÍAS -->
    <!-- ============================================ -->
    <div style="margin-top:40px;padding-top:32px;border-top:2px solid #e2e8f0;">
      <h2 style="font-size:20px;font-weight:700;color:#1a2332;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        Catálogo de Capacitaciones y Auditorías
      </h2>

      <div class="search-filter-bar">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input type="text" id="catalogo-search" placeholder="Buscar capacitación o auditoría..." class="search-input">
        </div>
        <select class="filter-select" id="catalogo-filter-tipo">
          <option value="">Todos los tipos</option>
          <option value="Capacitación">Capacitaciones</option>
          <option value="Auditoría">Auditorías</option>
        </select>
        <select class="filter-select" id="catalogo-filter-estado">
          <option value="activo">Activos</option>
          <option value="all">Todos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <button class="btn-filter" id="catalogo-btn-filtrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filtrar
        </button>
        <button class="btn-primary" id="catalogo-btn-nuevo" style="margin-left:auto;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo
        </button>
      </div>

      <div class="services-grid" id="catalogo-grid">
        <div style="text-align:center;padding:40px;color:#64748b;grid-column:1/-1;">Cargando catálogo...</div>
      </div>

      <div class="pagination" id="catalogo-pagination">
        <span class="pagination-info"></span>
      </div>
    </div>

    <!-- Modal Crear/Editar Catálogo -->
    <div class="modal-overlay" id="modal-catalogo" style="display:none;">
      <div class="modal-container" style="max-width:560px;">
        <div class="modal-header">
          <h2 id="modal-catalogo-titulo">Nuevo Registro</h2>
          <button class="modal-close" id="modal-catalogo-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="catalogo-id">
          <div class="form-group">
            <label class="form-label">Tipo <span style="color:#ef4444">*</span></label>
            <select id="catalogo-tipo" class="form-input">
              <option value="Capacitación">Capacitación</option>
              <option value="Auditoría">Auditoría</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nombre <span style="color:#ef4444">*</span></label>
            <input type="text" id="catalogo-nombre" class="form-input" maxlength="200" placeholder="Ej: Manejo Integrado de Plagas">
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea id="catalogo-descripcion" class="form-input" rows="3" placeholder="Descripción detallada..."></textarea>
          </div>
          <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Precio Ref. (S/)</label>
              <input type="number" id="catalogo-precio" class="form-input" min="0" step="0.01" placeholder="0.00">
            </div>
            <div class="form-group">
              <label class="form-label">Duración (hrs)</label>
              <input type="number" id="catalogo-duracion" class="form-input" min="1" placeholder="2">
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select id="catalogo-estado" class="form-input">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-catalogo-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-catalogo-guardar">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Desactivación Catálogo -->
    <div class="modal-overlay" id="modal-catalogo-eliminar" style="display:none;">
      <div class="modal-container" style="max-width:420px;">
        <div class="modal-header">
          <h2>Confirmar Desactivación</h2>
          <button class="modal-close" id="modal-catalogo-eliminar-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Deseas desactivar <strong id="catalogo-eliminar-nombre"></strong>?</p>
          <p style="color:#64748b;font-size:0.9em;">No aparecerá en los listados de selección.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-catalogo-eliminar-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-catalogo-eliminar-confirmar" style="background:#ef4444;">Desactivar</button>
        </div>
      </div>
    </div>
  `;
}

function getServiceIcon(nombre: string): { svg: string; color: string } {
  const n = nombre.toLowerCase();
  if (n.includes('fumigación') || n.includes('fumigacion')) {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
      color: n.includes('industrial') ? 'green' : n.includes('comercial') ? 'green' : 'blue'
    };
  }
  if (n.includes('desratización') || n.includes('desratizacion')) {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      color: 'orange'
    };
  }
  if (n.includes('desinsectación') || n.includes('desinsectacion')) {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      color: 'orange'
    };
  }
  if (n.includes('capacitación') || n.includes('capacitacion')) {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
      color: 'blue'
    };
  }
  // Icono por defecto
  return {
    svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
    color: 'blue'
  };
}

function formatDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hrs`;
}

function renderServicioCard(s: Servicio): string {
  const icon = getServiceIcon(s.nombre);
  const tags: string[] = [];
  if (s.requiere_movilidad) tags.push('Movilidad');
  if (s.requiere_certificado) tags.push('Certificado');
  if (s.estado === 'inactivo') tags.push('Inactivo');

  return `
    <div class="service-card" data-id="${s.id}">
      <div class="service-icon ${icon.color}">
        ${icon.svg}
      </div>
      <h3>${s.nombre}</h3>
      <p class="service-description">${s.descripcion}</p>
      <div class="service-stats">
        <div class="service-stat">
          <span class="stat-label">DURACIÓN</span>
          <span class="stat-value">${formatDuracion(s.duracion_estimada)}</span>
        </div>
        <div class="service-stat">
          <span class="stat-label">ESTADO</span>
          <span class="stat-value"><span class="badge ${s.estado === 'activo' ? 'green' : ''}">${s.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></span>
        </div>
      </div>
      ${tags.length > 0 ? `<div class="service-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn-secondary fullwidth btn-editar-servicio" data-id="${s.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Editar
        </button>
        ${s.estado === 'activo' ? `
          <button class="btn-secondary btn-desactivar-servicio" data-id="${s.id}" data-nombre="${s.nombre}" style="color:#ef4444;border-color:#ef4444;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </button>
        ` : `
          <button class="btn-secondary btn-reactivar-servicio" data-id="${s.id}" style="color:#16a34a;border-color:#16a34a;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
        `}
      </div>
    </div>
  `;
}

async function cargarServicios() {
  const grid = document.getElementById('servicios-grid');
  if (!grid) return;

  try {
    const params: any = { per_page: 50 };
    if (filtroSearchServicios) params.search = filtroSearchServicios;
    if (filtroEstadoServicios && filtroEstadoServicios !== 'all') {
      params.estado = filtroEstadoServicios;
    } else if (filtroEstadoServicios === 'all') {
      params.estado = 'all';
    }

    const response = await servicioService.getAll(params);
    const data = response.data || response;
    serviciosData = Array.isArray(data) ? data : (data as any).data || [];

    if (serviciosData.length === 0) {
      grid.innerHTML = `
        <div style="text-align:center;padding:60px;color:#64748b;grid-column:1/-1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <p>No se encontraron servicios</p>
        </div>`;
      return;
    }

    grid.innerHTML = serviciosData.map(s => renderServicioCard(s)).join('');
    bindAccionesServicios();

    const pagination = document.getElementById('servicios-pagination');
    if (pagination) {
      pagination.innerHTML = `<span class="pagination-info">Mostrando ${serviciosData.length} servicio(s)</span>`;
    }
  } catch (error) {
    console.error('Error cargando servicios:', error);
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;grid-column:1/-1;">Error al cargar servicios</div>';
  }
}

function bindAccionesServicios() {
  // Editar
  document.querySelectorAll('.btn-editar-servicio').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarServicio(id);
    });
  });

  // Desactivar
  document.querySelectorAll('.btn-desactivar-servicio').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const nombre = (btn as HTMLElement).dataset.nombre || '';
      abrirModalEliminarServicio(id, nombre);
    });
  });

  // Reactivar
  document.querySelectorAll('.btn-reactivar-servicio').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      try {
        await servicioService.reactivar(id);
        mostrarToast('success', 'Servicio Reactivado', 'El servicio se reactivó correctamente');
        await cargarServicios();
      } catch (error) {
        mostrarToast('error', 'Error', 'No se pudo reactivar el servicio');
      }
    });
  });
}

function limpiarFormServicio() {
  (document.getElementById('servicio-id') as HTMLInputElement).value = '';
  (document.getElementById('servicio-nombre') as HTMLInputElement).value = '';
  (document.getElementById('servicio-descripcion') as HTMLInputElement).value = '';
  (document.getElementById('servicio-duracion') as HTMLInputElement).value = '60';
  (document.getElementById('servicio-estado') as HTMLSelectElement).value = 'activo';
  (document.getElementById('servicio-movilidad') as HTMLInputElement).checked = false;
  (document.getElementById('servicio-certificado') as HTMLInputElement).checked = false;
  (document.getElementById('servicio-plantilla') as HTMLInputElement).value = '';
  (document.getElementById('servicio-plantilla-group') as HTMLElement).style.display = 'none';
}

function abrirModalNuevoServicio() {
  limpiarFormServicio();
  (document.getElementById('modal-servicio-titulo') as HTMLElement).textContent = 'Nuevo Servicio';
  (document.getElementById('modal-servicio') as HTMLElement).style.display = 'flex';
}

async function abrirModalEditarServicio(id: number) {
  try {
    const response = await servicioService.getById(id);
    const data = response.data || response;
    const s: Servicio = (data as any).data || data;

    limpiarFormServicio();
    (document.getElementById('modal-servicio-titulo') as HTMLElement).textContent = 'Editar Servicio';
    (document.getElementById('servicio-id') as HTMLInputElement).value = String(s.id);
    (document.getElementById('servicio-nombre') as HTMLInputElement).value = s.nombre;
    (document.getElementById('servicio-descripcion') as HTMLInputElement).value = s.descripcion;
    (document.getElementById('servicio-duracion') as HTMLInputElement).value = String(s.duracion_estimada);
    (document.getElementById('servicio-estado') as HTMLSelectElement).value = s.estado;
    (document.getElementById('servicio-movilidad') as HTMLInputElement).checked = !!s.requiere_movilidad;
    (document.getElementById('servicio-certificado') as HTMLInputElement).checked = !!s.requiere_certificado;

    const plantillaGroup = document.getElementById('servicio-plantilla-group') as HTMLElement;
    if (s.requiere_certificado) {
      plantillaGroup.style.display = 'block';
      (document.getElementById('servicio-plantilla') as HTMLInputElement).value = s.plantilla_certificado || '';
    }

    (document.getElementById('modal-servicio') as HTMLElement).style.display = 'flex';
  } catch (error) {
    mostrarToast('error', 'Error', 'No se pudo cargar el servicio');
  }
}

let servicioEliminarId = 0;

function abrirModalEliminarServicio(id: number, nombre: string) {
  servicioEliminarId = id;
  (document.getElementById('servicio-eliminar-nombre') as HTMLElement).textContent = nombre;
  (document.getElementById('modal-servicio-eliminar') as HTMLElement).style.display = 'flex';
}

async function guardarServicio() {
  const id = (document.getElementById('servicio-id') as HTMLInputElement).value;
  const nombre = (document.getElementById('servicio-nombre') as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById('servicio-descripcion') as HTMLInputElement).value.trim();
  const duracion = Number((document.getElementById('servicio-duracion') as HTMLInputElement).value) || 60;
  const estado = (document.getElementById('servicio-estado') as HTMLSelectElement).value as 'activo' | 'inactivo';
  const requiere_movilidad = (document.getElementById('servicio-movilidad') as HTMLInputElement).checked;
  const requiere_certificado = (document.getElementById('servicio-certificado') as HTMLInputElement).checked;
  const plantilla_certificado = (document.getElementById('servicio-plantilla') as HTMLInputElement).value.trim() || null;

  if (!nombre || !descripcion) {
    mostrarToast('error', 'Campos requeridos', 'Nombre y descripción son obligatorios');
    return;
  }

  const payload: any = {
    nombre,
    descripcion,
    duracion_estimada: duracion,
    estado,
    requiere_movilidad,
    requiere_certificado,
    plantilla_certificado: requiere_certificado ? plantilla_certificado : null,
  };

  try {
    if (id) {
      await servicioService.update(Number(id), payload);
      mostrarToast('success', 'Servicio Actualizado', 'El servicio se actualizó correctamente');
    } else {
      await servicioService.create(payload);
      mostrarToast('success', 'Servicio Creado', 'El servicio se creó correctamente');
    }
    (document.getElementById('modal-servicio') as HTMLElement).style.display = 'none';
    await cargarServicios();
  } catch (error) {
    console.error('Error guardando servicio:', error);
    mostrarToast('error', 'Error', 'No se pudo guardar el servicio');
  }
}

async function eliminarServicio() {
  if (!servicioEliminarId) return;
  try {
    await servicioService.delete(servicioEliminarId);
    mostrarToast('success', 'Servicio Desactivado', 'El servicio fue desactivado correctamente');
    (document.getElementById('modal-servicio-eliminar') as HTMLElement).style.display = 'none';
    servicioEliminarId = 0;
    await cargarServicios();
  } catch (error) {
    mostrarToast('error', 'Error', 'No se pudo desactivar el servicio');
  }
}

export function initServiciosTabEvents() {
  // === SERVICIOS ===
  // Búsqueda
  const searchInput = document.getElementById('servicios-search') as HTMLInputElement;
  if (searchInput) {
    let timeout: any;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        filtroSearchServicios = searchInput.value.trim();
        cargarServicios();
      }, 400);
    });
  }

  // Filtro estado
  const filtroEstado = document.getElementById('servicios-filter-estado') as HTMLSelectElement;
  if (filtroEstado) {
    filtroEstado.value = filtroEstadoServicios;
  }

  // Botón filtrar
  const btnFiltrar = document.getElementById('servicios-btn-filtrar');
  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', () => {
      const select = document.getElementById('servicios-filter-estado') as HTMLSelectElement;
      filtroEstadoServicios = select?.value || 'activo';
      cargarServicios();
    });
  }

  // Botón nuevo
  const btnNuevo = document.getElementById('servicios-btn-nuevo');
  if (btnNuevo) btnNuevo.addEventListener('click', abrirModalNuevoServicio);

  // Modal servicio — cerrar / cancelar
  const modalCerrar = document.getElementById('modal-servicio-cerrar');
  const modalCancelar = document.getElementById('modal-servicio-cancelar');
  const modal = document.getElementById('modal-servicio') as HTMLElement;
  if (modalCerrar) modalCerrar.addEventListener('click', () => modal.style.display = 'none');
  if (modalCancelar) modalCancelar.addEventListener('click', () => modal.style.display = 'none');

  // Guardar
  const btnGuardar = document.getElementById('modal-servicio-guardar');
  if (btnGuardar) btnGuardar.addEventListener('click', guardarServicio);

  // Toggle plantilla al marcar certificado
  const checkCertificado = document.getElementById('servicio-certificado') as HTMLInputElement;
  if (checkCertificado) {
    checkCertificado.addEventListener('change', () => {
      const group = document.getElementById('servicio-plantilla-group') as HTMLElement;
      group.style.display = checkCertificado.checked ? 'block' : 'none';
    });
  }

  // Modal eliminar — cerrar / cancelar / confirmar
  const elimCerrar = document.getElementById('modal-servicio-eliminar-cerrar');
  const elimCancelar = document.getElementById('modal-servicio-eliminar-cancelar');
  const elimConfirmar = document.getElementById('modal-servicio-eliminar-confirmar');
  const modalElim = document.getElementById('modal-servicio-eliminar') as HTMLElement;
  if (elimCerrar) elimCerrar.addEventListener('click', () => modalElim.style.display = 'none');
  if (elimCancelar) elimCancelar.addEventListener('click', () => modalElim.style.display = 'none');
  if (elimConfirmar) elimConfirmar.addEventListener('click', eliminarServicio);

  // Cargar servicios
  cargarServicios();

  // === CATÁLOGO CAPACITACIONES/AUDITORÍAS ===
  initCatalogoCapAudEvents();
  cargarCatalogo();
}

// ========================================
// CATÁLOGO CAPACITACIONES / AUDITORÍAS
// ========================================

function getCatalogoIcon(tipo: string): { svg: string; color: string } {
  if (tipo === 'Capacitación') {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
      color: 'blue'
    };
  }
  return {
    svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    color: 'green'
  };
}

function renderCatalogoCard(item: CatalogoCapAud): string {
  const icon = getCatalogoIcon(item.tipo);
  const tags: string[] = [item.tipo];
  if (item.estado === 'inactivo') tags.push('Inactivo');

  return `
    <div class="service-card" data-catalogo-id="${item.id}">
      <div class="service-icon ${icon.color}">
        ${icon.svg}
      </div>
      <h3>${item.nombre}</h3>
      <p class="service-description">${item.descripcion || 'Sin descripción'}</p>
      <div class="service-stats">
        <div class="service-stat">
          <span class="stat-label">PRECIO REF.</span>
          <span class="stat-value">${item.precio_referencial ? 'S/ ' + Number(item.precio_referencial).toFixed(2) : '—'}</span>
        </div>
        <div class="service-stat">
          <span class="stat-label">DURACIÓN</span>
          <span class="stat-value">${item.duracion_horas ? item.duracion_horas + ' hrs' : '—'}</span>
        </div>
      </div>
      <div class="service-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn-secondary fullwidth btn-editar-catalogo" data-id="${item.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Editar
        </button>
        ${item.estado === 'activo' ? `
          <button class="btn-secondary btn-desactivar-catalogo" data-id="${item.id}" data-nombre="${item.nombre}" style="color:#ef4444;border-color:#ef4444;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </button>
        ` : `
          <button class="btn-secondary btn-reactivar-catalogo" data-id="${item.id}" style="color:#16a34a;border-color:#16a34a;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
        `}
      </div>
    </div>
  `;
}

async function cargarCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  if (!grid) return;

  try {
    const params: any = { per_page: 50 };
    if (filtroSearchCatalogo) params.search = filtroSearchCatalogo;
    if (filtroTipoCatalogo) params.tipo = filtroTipoCatalogo;
    if (filtroEstadoCatalogo && filtroEstadoCatalogo !== 'all') {
      params.estado = filtroEstadoCatalogo;
    } else if (filtroEstadoCatalogo === 'all') {
      params.estado = 'all';
    }

    const response = await catalogoCapAudService.getAll(params);
    const data = response.data || response;
    catalogoCapAudData = Array.isArray(data) ? data : (data as any).data || [];

    if (catalogoCapAudData.length === 0) {
      grid.innerHTML = `
        <div style="text-align:center;padding:60px;color:#64748b;grid-column:1/-1;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <p>No se encontraron capacitaciones ni auditorías</p>
        </div>`;
      return;
    }

    grid.innerHTML = catalogoCapAudData.map(item => renderCatalogoCard(item)).join('');
    bindAccionesCatalogo();

    const pagination = document.getElementById('catalogo-pagination');
    if (pagination) {
      pagination.innerHTML = `<span class="pagination-info">Mostrando ${catalogoCapAudData.length} registro(s)</span>`;
    }
  } catch (error) {
    console.error('Error cargando catálogo:', error);
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;grid-column:1/-1;">Error al cargar catálogo</div>';
  }
}

function bindAccionesCatalogo() {
  document.querySelectorAll('.btn-editar-catalogo').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      await abrirModalEditarCatalogo(id);
    });
  });

  document.querySelectorAll('.btn-desactivar-catalogo').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const nombre = (btn as HTMLElement).dataset.nombre || '';
      abrirModalEliminarCatalogo(id, nombre);
    });
  });

  document.querySelectorAll('.btn-reactivar-catalogo').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLElement).dataset.id);
      try {
        await catalogoCapAudService.reactivar(id);
        mostrarToast('success', 'Reactivado', 'Registro reactivado correctamente');
        await cargarCatalogo();
      } catch (error) {
        mostrarToast('error', 'Error', 'No se pudo reactivar');
      }
    });
  });
}

function limpiarFormCatalogo() {
  (document.getElementById('catalogo-id') as HTMLInputElement).value = '';
  (document.getElementById('catalogo-tipo') as HTMLSelectElement).value = 'Capacitación';
  (document.getElementById('catalogo-nombre') as HTMLInputElement).value = '';
  (document.getElementById('catalogo-descripcion') as HTMLTextAreaElement).value = '';
  (document.getElementById('catalogo-precio') as HTMLInputElement).value = '';
  (document.getElementById('catalogo-duracion') as HTMLInputElement).value = '';
  (document.getElementById('catalogo-estado') as HTMLSelectElement).value = 'activo';
}

function abrirModalNuevoCatalogo() {
  limpiarFormCatalogo();
  (document.getElementById('modal-catalogo-titulo') as HTMLElement).textContent = 'Nueva Capacitación / Auditoría';
  (document.getElementById('modal-catalogo') as HTMLElement).style.display = 'flex';
}

async function abrirModalEditarCatalogo(id: number) {
  try {
    const response = await catalogoCapAudService.getById(id);
    const data = response.data || response;
    const item: CatalogoCapAud = (data as any).data || data;

    limpiarFormCatalogo();
    (document.getElementById('modal-catalogo-titulo') as HTMLElement).textContent = 'Editar Registro';
    (document.getElementById('catalogo-id') as HTMLInputElement).value = String(item.id);
    (document.getElementById('catalogo-tipo') as HTMLSelectElement).value = item.tipo;
    (document.getElementById('catalogo-nombre') as HTMLInputElement).value = item.nombre;
    (document.getElementById('catalogo-descripcion') as HTMLTextAreaElement).value = item.descripcion || '';
    (document.getElementById('catalogo-precio') as HTMLInputElement).value = item.precio_referencial ? String(item.precio_referencial) : '';
    (document.getElementById('catalogo-duracion') as HTMLInputElement).value = item.duracion_horas ? String(item.duracion_horas) : '';
    (document.getElementById('catalogo-estado') as HTMLSelectElement).value = item.estado;

    (document.getElementById('modal-catalogo') as HTMLElement).style.display = 'flex';
  } catch (error) {
    mostrarToast('error', 'Error', 'No se pudo cargar el registro');
  }
}

let catalogoEliminarId = 0;

function abrirModalEliminarCatalogo(id: number, nombre: string) {
  catalogoEliminarId = id;
  (document.getElementById('catalogo-eliminar-nombre') as HTMLElement).textContent = nombre;
  (document.getElementById('modal-catalogo-eliminar') as HTMLElement).style.display = 'flex';
}

async function guardarCatalogo() {
  const id = (document.getElementById('catalogo-id') as HTMLInputElement).value;
  const tipo = (document.getElementById('catalogo-tipo') as HTMLSelectElement).value as 'Capacitación' | 'Auditoría';
  const nombre = (document.getElementById('catalogo-nombre') as HTMLInputElement).value.trim();
  const descripcion = (document.getElementById('catalogo-descripcion') as HTMLTextAreaElement).value.trim() || undefined;
  const precio = (document.getElementById('catalogo-precio') as HTMLInputElement).value;
  const duracion = (document.getElementById('catalogo-duracion') as HTMLInputElement).value;
  const estado = (document.getElementById('catalogo-estado') as HTMLSelectElement).value as 'activo' | 'inactivo';

  if (!nombre) {
    mostrarToast('error', 'Campo requerido', 'El nombre es obligatorio');
    return;
  }

  const payload: any = {
    tipo,
    nombre,
    descripcion,
    precio_referencial: precio ? Number(precio) : null,
    duracion_horas: duracion ? Number(duracion) : null,
    estado,
  };

  try {
    if (id) {
      await catalogoCapAudService.update(Number(id), payload);
      mostrarToast('success', 'Actualizado', 'Registro actualizado correctamente');
    } else {
      await catalogoCapAudService.create(payload);
      mostrarToast('success', 'Creado', 'Registro creado correctamente');
    }
    (document.getElementById('modal-catalogo') as HTMLElement).style.display = 'none';
    await cargarCatalogo();
  } catch (error) {
    console.error('Error guardando catálogo:', error);
    mostrarToast('error', 'Error', 'No se pudo guardar');
  }
}

async function eliminarCatalogo() {
  if (!catalogoEliminarId) return;
  try {
    await catalogoCapAudService.delete(catalogoEliminarId);
    mostrarToast('success', 'Desactivado', 'Registro desactivado correctamente');
    (document.getElementById('modal-catalogo-eliminar') as HTMLElement).style.display = 'none';
    catalogoEliminarId = 0;
    await cargarCatalogo();
  } catch (error) {
    mostrarToast('error', 'Error', 'No se pudo desactivar');
  }
}

function initCatalogoCapAudEvents() {
  // Búsqueda
  const searchCat = document.getElementById('catalogo-search') as HTMLInputElement;
  if (searchCat) {
    let timeout: any;
    searchCat.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        filtroSearchCatalogo = searchCat.value.trim();
        cargarCatalogo();
      }, 400);
    });
  }

  // Botón filtrar
  const btnFiltrarCat = document.getElementById('catalogo-btn-filtrar');
  if (btnFiltrarCat) {
    btnFiltrarCat.addEventListener('click', () => {
      filtroTipoCatalogo = (document.getElementById('catalogo-filter-tipo') as HTMLSelectElement)?.value || '';
      filtroEstadoCatalogo = (document.getElementById('catalogo-filter-estado') as HTMLSelectElement)?.value || 'activo';
      cargarCatalogo();
    });
  }

  // Botón nuevo
  const btnNuevoCat = document.getElementById('catalogo-btn-nuevo');
  if (btnNuevoCat) btnNuevoCat.addEventListener('click', abrirModalNuevoCatalogo);

  // Modal catálogo — cerrar / cancelar / guardar
  const modalCat = document.getElementById('modal-catalogo') as HTMLElement;
  document.getElementById('modal-catalogo-cerrar')?.addEventListener('click', () => modalCat.style.display = 'none');
  document.getElementById('modal-catalogo-cancelar')?.addEventListener('click', () => modalCat.style.display = 'none');
  document.getElementById('modal-catalogo-guardar')?.addEventListener('click', guardarCatalogo);

  // Modal eliminar catálogo
  const modalCatElim = document.getElementById('modal-catalogo-eliminar') as HTMLElement;
  document.getElementById('modal-catalogo-eliminar-cerrar')?.addEventListener('click', () => modalCatElim.style.display = 'none');
  document.getElementById('modal-catalogo-eliminar-cancelar')?.addEventListener('click', () => modalCatElim.style.display = 'none');
  document.getElementById('modal-catalogo-eliminar-confirmar')?.addEventListener('click', eliminarCatalogo);
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
