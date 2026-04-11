// Log├¡stica View
import { clienteService } from '../../services/clienteService';
import { servicioService } from '../../services/servicioService';
import { productoService } from '../../services/productoService';
import { equipoService } from '../../services/equipoService';
import { ordenServicioService } from '../../services/ordenServicioService';
import { ordenProductoService } from '../../services/ordenProductoService';
import { ordenCapacitacionService } from '../../services/ordenCapacitacionService';
import { ordenAsesoriaService } from '../../services/ordenAsesoriaService';
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
let productosDisponiblesReceta: any[] = [];
let equiposDisponiblesReceta: any[] = [];
let recetaRows: { id_producto: number; cantidad_default: number; observacion: string; id_equipo: number }[] = [];

type ResumenMuestreoCliente = {
  key: string;
  clienteId: number | null;
  nombre: string;
  rubro: string;
  adquisiciones: {
    servicio: number;
    producto: number;
    capacitacion: number;
    asesoria: number;
  };
  inversionTotal: number;
  ultimaAdquisicion: string | null;
};

let muestreoClientesData: ResumenMuestreoCliente[] = [];
let filtroSearchMuestreo = '';
let filtroTipoMuestreo = 'all';

const moneyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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
            <p class="client-type">${cliente.rubro || 'ÔÇö'}</p>
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
            <div class="stat-number">${cliente.ruc || 'ÔÇö'}</div>
            <div class="stat-label">RUC</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">${cliente.origen || 'ÔÇö'}</div>
            <div class="stat-label">Origen</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">${cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : 'ÔÇö'}</div>
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

  // B├║squeda con debounce
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
      <div class="modal-container" style="max-width:720px;max-height:90vh;overflow-y:auto;">
        <div class="modal-header">
          <h2 id="modal-servicio-titulo">Nuevo Servicio</h2>
          <button class="modal-close" id="modal-servicio-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="servicio-id">
          <div class="form-group">
            <label class="form-label">Nombre <span style="color:#ef4444">*</span></label>
            <input type="text" id="servicio-nombre" class="form-input" maxlength="100" placeholder="Ej: Fumigaci├│n Residencial">
          </div>
          <div class="form-group">
            <label class="form-label">Descripci├│n <span style="color:#ef4444">*</span></label>
            <input type="text" id="servicio-descripcion" class="form-input" maxlength="100" placeholder="Breve descripci├│n del servicio">
          </div>
          <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Duraci├│n Estimada (min)</label>
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

          <!-- Receta del Servicio (solo visible al editar) -->
          <div id="servicio-receta-section" style="display:none;margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <label class="form-label" style="margin:0;font-size:15px;font-weight:600;color:#1a2332;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                Receta del Servicio
              </label>
              <div style="display:flex;gap:8px;">
                <button type="button" class="btn-secondary" id="btn-agregar-equipo-receta" style="padding:4px 12px;font-size:13px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Agregar Equipo
                </button>
                <button type="button" class="btn-secondary" id="btn-agregar-receta" style="padding:4px 12px;font-size:13px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Agregar Producto (sin equipo)
                </button>
              </div>
            </div>
            <p style="font-size:12px;color:#64748b;margin-bottom:10px;">Equipos y productos que se usan por defecto al ejecutar este servicio.</p>
            <div id="receta-container"></div>
            <div id="receta-empty" style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;display:none;">
              Sin equipos ni materiales asignados.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-servicio-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-servicio-guardar">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminaci├│n -->
    <div class="modal-overlay" id="modal-servicio-eliminar" style="display:none;">
      <div class="modal-container" style="max-width:420px;">
        <div class="modal-header">
          <h2>Confirmar Desactivaci├│n</h2>
          <button class="modal-close" id="modal-servicio-eliminar-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <p>┬┐Est├ís seguro de que deseas desactivar el servicio <strong id="servicio-eliminar-nombre"></strong>?</p>
          <p style="color:#64748b;font-size:0.9em;">El servicio pasar├í a estado inactivo y no aparecer├í en los listados.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-servicio-eliminar-cancelar">Cancelar</button>
          <button class="btn-primary" id="modal-servicio-eliminar-confirmar" style="background:#ef4444;">Desactivar</button>
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- CATALOGO DE CAPACITACIONES Y Asesorias -->
    <!-- ============================================ -->
    <div style="margin-top:40px;padding-top:32px;border-top:2px solid #e2e8f0;">
      <h2 style="font-size:20px;font-weight:700;color:#1a2332;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        Catalogo de Capacitaciones y Asesorias
      </h2>

      <div class="search-filter-bar">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input type="text" id="catalogo-search" placeholder="Buscar capacitaci├│n o auditor├¡a..." class="search-input">
        </div>
        <select class="filter-select" id="catalogo-filter-tipo">
          <option value="">Todos los tipos</option>
          <option value="Capacitaci├│n">Capacitaciones</option>
          <option value="Asesor├¡a">Asesoría</option>
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
        <div style="text-align:center;padding:40px;color:#64748b;grid-column:1/-1;">Cargando catalogo...</div>
      </div>

      <div class="pagination" id="catalogo-pagination">
        <span class="pagination-info"></span>
      </div>
    </div>

    <!-- Modal Crear/Editar Cat├ílogo -->
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
              <option value="Capacitaci├│n">Capacitaci├│n</option>
              <option value="Asesor├¡a">Asesor├¡a</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nombre <span style="color:#ef4444">*</span></label>
            <input type="text" id="catalogo-nombre" class="form-input" maxlength="200" placeholder="Ej: Manejo Integrado de Plagas">
          </div>
          <div class="form-group">
            <label class="form-label">Descripci├│n</label>
            <textarea id="catalogo-descripcion" class="form-input" rows="3" placeholder="Descripci├│n detallada..."></textarea>
          </div>
          <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
            <div class="form-group">
              <label class="form-label">Precio Ref. (S/)</label>
              <input type="number" id="catalogo-precio" class="form-input" min="0" step="0.01" placeholder="0.00">
            </div>
            <div class="form-group">
              <label class="form-label">Duraci├│n (hrs)</label>
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

    <!-- Modal Confirmar Desactivaci├│n Cat├ílogo -->
    <div class="modal-overlay" id="modal-catalogo-eliminar" style="display:none;">
      <div class="modal-container" style="max-width:420px;">
        <div class="modal-header">
          <h2>Confirmar Desactivaci├│n</h2>
          <button class="modal-close" id="modal-catalogo-eliminar-cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <p>┬┐Deseas desactivar <strong id="catalogo-eliminar-nombre"></strong>?</p>
          <p style="color:#64748b;font-size:0.9em;">No aparecer├í en los listados de selecci├│n.</p>
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
  if (n.includes('fumigaci├│n') || n.includes('fumigacion')) {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
      color: n.includes('industrial') ? 'green' : n.includes('comercial') ? 'green' : 'blue'
    };
  }
  if (n.includes('desratizaci├│n') || n.includes('desratizacion')) {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      color: 'orange'
    };
  }
  if (n.includes('desinsectaci├│n') || n.includes('desinsectacion')) {
    return {
      svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      color: 'orange'
    };
  }
  if (n.includes('capacitaci├│n') || n.includes('capacitacion')) {
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
          <span class="stat-label">DURACI├ôN</span>
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
        mostrarToast('success', 'Servicio Reactivado', 'El servicio se reactiv├│ correctamente');
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
  // Limpiar receta
  recetaRows = [];
  const recetaContainer = document.getElementById('receta-container');
  if (recetaContainer) recetaContainer.innerHTML = '';
  const recetaSection = document.getElementById('servicio-receta-section');
  if (recetaSection) recetaSection.style.display = 'none';
  actualizarRecetaUI();
}

function actualizarRecetaUI() {
  const container = document.getElementById('receta-container');
  const emptyMsg = document.getElementById('receta-empty');
  if (!container) return;

  if (recetaRows.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';

  // Agrupar por id_equipo
  const equipoIds = [...new Set(recetaRows.filter(r => r.id_equipo > 0).map(r => r.id_equipo))];
  const sinEquipo = recetaRows.filter(r => !r.id_equipo || r.id_equipo === 0);

  let html = '';

  // Render cada grupo de equipo
  equipoIds.forEach(eqId => {
    const eq = equiposDisponiblesReceta.find((e: any) => e.id === eqId);
    const eqNombre = eq ? `${eq.descripcion} - ${eq.marca || ''} ${eq.modelo || ''}` : `Equipo #${eqId}`;
    const prods = recetaRows.filter(r => r.id_equipo === eqId);

    html += `
      <div class="receta-equipo-group" data-equipo-id="${eqId}" style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#1e3a5f;color:#fff;">
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            ${eqNombre}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" class="receta-add-prod-to-equipo" data-equipo-id="${eqId}" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:3px 10px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Producto
            </button>
            <button type="button" class="receta-remove-equipo" data-equipo-id="${eqId}" style="background:none;border:none;color:#fca5a5;cursor:pointer;padding:4px;" title="Quitar equipo y sus productos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <div style="padding:8px;">
          ${prods.length === 0 ? '<p style="text-align:center;color:#94a3b8;font-size:12px;padding:8px 0;margin:0;">Sin productos. Haga clic en "+ Producto".</p>' : `
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <th style="text-align:left;padding:6px 8px;width:45%;">Producto</th>
              <th style="text-align:center;padding:6px 8px;width:18%;">Cantidad</th>
              <th style="text-align:left;padding:6px 8px;width:27%;">Observaci├│n</th>
              <th style="text-align:center;padding:6px 8px;width:10%;"></th>
            </tr></thead>
            <tbody>${prods.map(r => {
              const globalIdx = recetaRows.indexOf(r);
              return renderRecetaProductRow(r, globalIdx);
            }).join('')}</tbody>
          </table>`}
        </div>
      </div>`;
  });

  // Productos sin equipo
  if (sinEquipo.length > 0) {
    html += `
      <div style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f1f5f9;">
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#475569;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            Productos sin equipo
          </div>
        </div>
        <div style="padding:8px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <th style="text-align:left;padding:6px 8px;width:45%;">Producto</th>
              <th style="text-align:center;padding:6px 8px;width:18%;">Cantidad</th>
              <th style="text-align:left;padding:6px 8px;width:27%;">Observaci├│n</th>
              <th style="text-align:center;padding:6px 8px;width:10%;"></th>
            </tr></thead>
            <tbody>${sinEquipo.map(r => {
              const globalIdx = recetaRows.indexOf(r);
              return renderRecetaProductRow(r, globalIdx);
            }).join('')}</tbody>
          </table>
        </div>
      </div>`;
  }

  container.innerHTML = html;
  bindRecetaEvents();
}

function renderRecetaProductRow(r: typeof recetaRows[0], idx: number): string {
  const prodOpts = productosDisponiblesReceta.map(p => {
    const sel = p.id === r.id_producto ? 'selected' : '';
    return `<option value="${p.id}" ${sel}>${p.descripcion}${p.unidad ? ' (' + p.unidad + ')' : ''}</option>`;
  }).join('');
  return `<tr data-receta-idx="${idx}">
    <td style="padding:6px 8px;"><select class="form-input receta-prod-select" data-idx="${idx}" style="padding:6px 8px;font-size:13px;"><option value="">Seleccione...</option>${prodOpts}</select></td>
    <td style="padding:6px 8px;text-align:center;"><input type="number" class="form-input receta-cant-input" data-idx="${idx}" value="${r.cantidad_default}" min="0.01" step="0.01" style="width:80px;text-align:center;padding:6px;font-size:13px;"></td>
    <td style="padding:6px 8px;"><input type="text" class="form-input receta-obs-input" data-idx="${idx}" value="${r.observacion || ''}" maxlength="200" style="padding:6px 8px;font-size:13px;" placeholder="Opcional"></td>
    <td style="padding:6px 8px;text-align:center;"><button type="button" class="btn-icon receta-remove-btn" data-idx="${idx}" style="color:#ef4444;" title="Eliminar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></td>
  </tr>`;
}

function bindRecetaEvents() {
  document.querySelectorAll('.receta-prod-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = Number((e.target as HTMLSelectElement).dataset.idx);
      recetaRows[idx].id_producto = Number((e.target as HTMLSelectElement).value);
    });
  });
  document.querySelectorAll('.receta-cant-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx);
      recetaRows[idx].cantidad_default = parseFloat((e.target as HTMLInputElement).value) || 0;
    });
  });
  document.querySelectorAll('.receta-obs-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number((e.target as HTMLInputElement).dataset.idx);
      recetaRows[idx].observacion = (e.target as HTMLInputElement).value;
    });
  });
  document.querySelectorAll('.receta-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.idx);
      recetaRows.splice(idx, 1);
      actualizarRecetaUI();
    });
  });
  // Agregar producto a un equipo espec├¡fico
  document.querySelectorAll('.receta-add-prod-to-equipo').forEach(btn => {
    btn.addEventListener('click', () => {
      const eqId = Number((btn as HTMLElement).dataset.equipoId);
      recetaRows.push({ id_producto: 0, cantidad_default: 1, observacion: '', id_equipo: eqId });
      actualizarRecetaUI();
    });
  });
  // Eliminar equipo y todos sus productos
  document.querySelectorAll('.receta-remove-equipo').forEach(btn => {
    btn.addEventListener('click', () => {
      const eqId = Number((btn as HTMLElement).dataset.equipoId);
      recetaRows = recetaRows.filter(r => r.id_equipo !== eqId);
      actualizarRecetaUI();
    });
  });
}

function agregarFilaReceta() {
  recetaRows.push({ id_producto: 0, cantidad_default: 1, observacion: '', id_equipo: 0 });
  actualizarRecetaUI();
}

function agregarEquipoReceta() {
  // Mostrar selector de equipo en un mini-di├ílogo
  const equipoOpts = equiposDisponiblesReceta
    .filter((eq: any) => {
      // Excluir equipos ya agregados
      const yaExiste = recetaRows.some(r => r.id_equipo === eq.id);
      return !yaExiste;
    })
    .map((eq: any) => `<option value="${eq.id}">${eq.descripcion} - ${eq.marca || ''} ${eq.modelo || ''}</option>`).join('');

  if (!equipoOpts) {
    mostrarToast('warning', 'Sin equipos', 'No hay equipos disponibles para agregar o ya est├ín todos asignados');
    return;
  }

  const container = document.getElementById('receta-container');
  if (!container) return;

  // Insertar mini formulario para seleccionar equipo
  const pickerId = 'equipo-picker-' + Date.now();
  const pickerHtml = `
    <div id="${pickerId}" style="margin-bottom:12px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;display:flex;align-items:center;gap:10px;">
      <label style="font-size:13px;font-weight:600;color:#1e40af;white-space:nowrap;">Seleccione equipo:</label>
      <select class="form-input equipo-picker-select" style="flex:1;padding:6px 8px;font-size:13px;">
        <option value="">ÔÇö</option>
        ${equipoOpts}
      </select>
      <button type="button" class="btn-primary equipo-picker-confirm" style="padding:5px 14px;font-size:12px;">Agregar</button>
      <button type="button" class="equipo-picker-cancel" style="background:none;border:none;cursor:pointer;color:#64748b;font-size:18px;">&times;</button>
    </div>`;
  container.insertAdjacentHTML('afterbegin', pickerHtml);

  const pickerEl = document.getElementById(pickerId)!;
  pickerEl.querySelector('.equipo-picker-confirm')?.addEventListener('click', () => {
    const sel = pickerEl.querySelector('.equipo-picker-select') as HTMLSelectElement;
    const eqId = Number(sel.value);
    if (!eqId) { mostrarToast('warning', 'Equipo', 'Seleccione un equipo'); return; }
    // Agregar una fila placeholder para crear el grupo
    recetaRows.push({ id_producto: 0, cantidad_default: 1, observacion: '', id_equipo: eqId });
    actualizarRecetaUI();
  });
  pickerEl.querySelector('.equipo-picker-cancel')?.addEventListener('click', () => {
    pickerEl.remove();
  });
}

async function cargarProductosParaReceta() {
  if (productosDisponiblesReceta.length === 0) {
    try {
      const res = await productoService.getAll({ estado: 'Activo', per_page: 500 });
      const raw = res.data || res;
      productosDisponiblesReceta = Array.isArray(raw) ? raw : (raw as any).data || [];
    } catch (e) {
      console.error('Error cargando productos para receta:', e);
      productosDisponiblesReceta = [];
    }
  }
  if (equiposDisponiblesReceta.length === 0) {
    try {
      const res = await equipoService.getAll({ estado: 'Activo', per_page: 500 });
      const raw = res.data || res;
      equiposDisponiblesReceta = Array.isArray(raw) ? raw : (raw as any).data || [];
    } catch (e) {
      console.error('Error cargando equipos para receta:', e);
      equiposDisponiblesReceta = [];
    }
  }
}

function abrirModalNuevoServicio() {
  limpiarFormServicio();
  (document.getElementById('modal-servicio-titulo') as HTMLElement).textContent = 'Nuevo Servicio';
  // Mostrar secci├│n receta tambi├®n al crear
  const recetaSection = document.getElementById('servicio-receta-section');
  if (recetaSection) recetaSection.style.display = 'block';
  recetaRows = [];
  actualizarRecetaUI();
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

    // Mostrar secci├│n receta y cargar datos
    const recetaSection = document.getElementById('servicio-receta-section');
    if (recetaSection) recetaSection.style.display = 'block';

    await cargarProductosParaReceta();

    // Cargar receta existente
    try {
      const recetaRes = await servicioService.getProductos(s.id);
      const recetaRaw = recetaRes.data || recetaRes;
      const recetaData: any[] = Array.isArray(recetaRaw) ? recetaRaw : (recetaRaw as any).data || [];
      recetaRows = recetaData.map((r: any) => ({
        id_producto: r.id_producto,
        cantidad_default: Number(r.cantidad_default),
        observacion: r.observacion || '',
        id_equipo: r.id_equipo || 0,
      }));
    } catch (e) {
      console.error('Error cargando receta:', e);
      recetaRows = [];
    }
    actualizarRecetaUI();

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
    mostrarToast('error', 'Campos requeridos', 'Nombre y descripci├│n son obligatorios');
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

      // Sincronizar receta de materiales
      const recetaValida = recetaRows.filter(r => r.id_producto > 0 && r.cantidad_default > 0);
      try {
        await servicioService.syncProductos(Number(id), recetaValida.map(r => ({
          id_producto: r.id_producto,
          cantidad_default: r.cantidad_default,
          observacion: r.observacion || undefined,
          id_equipo: r.id_equipo || undefined,
        })));
      } catch (recetaError) {
        console.error('Error sincronizando receta:', recetaError);
        mostrarToast('error', 'Advertencia', 'Servicio guardado pero hubo error al guardar los materiales');
      }

      mostrarToast('success', 'Servicio Actualizado', 'El servicio se actualiz├│ correctamente');
    } else {
      const createRes = await servicioService.create(payload);
      const createdRaw = createRes.data || createRes;
      const created = (createdRaw as any).data || createdRaw;

      // Si hay receta, sincronizarla con el nuevo servicio
      const recetaValida = recetaRows.filter(r => r.id_producto > 0 && r.cantidad_default > 0);
      if (created.id && recetaValida.length > 0) {
        try {
          await servicioService.syncProductos(created.id, recetaValida.map(r => ({
            id_producto: r.id_producto,
            cantidad_default: r.cantidad_default,
            observacion: r.observacion || undefined,
            id_equipo: r.id_equipo || undefined,
          })));
        } catch (recetaError) {
          console.error('Error sincronizando receta:', recetaError);
        }
      }

      mostrarToast('success', 'Servicio Creado', 'El servicio se cre├│ correctamente');
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
  // B├║squeda
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

  // Bot├│n filtrar
  const btnFiltrar = document.getElementById('servicios-btn-filtrar');
  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', () => {
      const select = document.getElementById('servicios-filter-estado') as HTMLSelectElement;
      filtroEstadoServicios = select?.value || 'activo';
      cargarServicios();
    });
  }

  // Bot├│n nuevo
  const btnNuevo = document.getElementById('servicios-btn-nuevo');
  if (btnNuevo) btnNuevo.addEventListener('click', abrirModalNuevoServicio);

  // Modal servicio ÔÇö cerrar / cancelar
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

  // Bot├│n agregar material a receta (sin equipo)
  const btnAgregarReceta = document.getElementById('btn-agregar-receta');
  if (btnAgregarReceta) {
    btnAgregarReceta.addEventListener('click', async () => {
      await cargarProductosParaReceta();
      agregarFilaReceta();
    });
  }

  // Bot├│n agregar equipo a receta
  const btnAgregarEquipo = document.getElementById('btn-agregar-equipo-receta');
  if (btnAgregarEquipo) {
    btnAgregarEquipo.addEventListener('click', async () => {
      await cargarProductosParaReceta();
      agregarEquipoReceta();
    });
  }

  // Modal eliminar ÔÇö cerrar / cancelar / confirmar
  const elimCerrar = document.getElementById('modal-servicio-eliminar-cerrar');
  const elimCancelar = document.getElementById('modal-servicio-eliminar-cancelar');
  const elimConfirmar = document.getElementById('modal-servicio-eliminar-confirmar');
  const modalElim = document.getElementById('modal-servicio-eliminar') as HTMLElement;
  if (elimCerrar) elimCerrar.addEventListener('click', () => modalElim.style.display = 'none');
  if (elimCancelar) elimCancelar.addEventListener('click', () => modalElim.style.display = 'none');
  if (elimConfirmar) elimConfirmar.addEventListener('click', eliminarServicio);

  // Cargar servicios
  cargarServicios();

  // === CAT├üLOGO CAPACITACIONES/AUDITOR├ìAS ===
  initCatalogoCapAudEvents();
  cargarCatalogo();
}

// ========================================
// CAT├üLOGO CAPACITACIONES / AUDITOR├ìAS
// ========================================

function getCatalogoIcon(tipo: string): { svg: string; color: string } {
  if (tipo === 'Capacitaci├│n') {
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
      <p class="service-description">${item.descripcion || 'Sin descripci├│n'}</p>
      <div class="service-stats">
        <div class="service-stat">
          <span class="stat-label">PRECIO REF.</span>
          <span class="stat-value">${item.precio_referencial ? 'S/ ' + Number(item.precio_referencial).toFixed(2) : 'ÔÇö'}</span>
        </div>
        <div class="service-stat">
          <span class="stat-label">DURACI├ôN</span>
          <span class="stat-value">${item.duracion_horas ? item.duracion_horas + ' hrs' : 'ÔÇö'}</span>
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
    console.error('Error cargando cat├ílogo:', error);
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;grid-column:1/-1;">Error al cargar cat├ílogo</div>';
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
  (document.getElementById('catalogo-tipo') as HTMLSelectElement).value = 'Capacitaci├│n';
  (document.getElementById('catalogo-nombre') as HTMLInputElement).value = '';
  (document.getElementById('catalogo-descripcion') as HTMLTextAreaElement).value = '';
  (document.getElementById('catalogo-precio') as HTMLInputElement).value = '';
  (document.getElementById('catalogo-duracion') as HTMLInputElement).value = '';
  (document.getElementById('catalogo-estado') as HTMLSelectElement).value = 'activo';
}

function abrirModalNuevoCatalogo() {
  limpiarFormCatalogo();
  (document.getElementById('modal-catalogo-titulo') as HTMLElement).textContent = 'Nueva Capacitaci├│n / Asesor├¡a';
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
  const tipo = (document.getElementById('catalogo-tipo') as HTMLSelectElement).value as 'Capacitaci├│n' | 'Asesor├¡a';
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
    console.error('Error guardando cat├ílogo:', error);
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
  // B├║squeda
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

  // Bot├│n filtrar
  const btnFiltrarCat = document.getElementById('catalogo-btn-filtrar');
  if (btnFiltrarCat) {
    btnFiltrarCat.addEventListener('click', () => {
      filtroTipoCatalogo = (document.getElementById('catalogo-filter-tipo') as HTMLSelectElement)?.value || '';
      filtroEstadoCatalogo = (document.getElementById('catalogo-filter-estado') as HTMLSelectElement)?.value || 'activo';
      cargarCatalogo();
    });
  }

  // Bot├│n nuevo
  const btnNuevoCat = document.getElementById('catalogo-btn-nuevo');
  if (btnNuevoCat) btnNuevoCat.addEventListener('click', abrirModalNuevoCatalogo);

  // Modal cat├ílogo ÔÇö cerrar / cancelar / guardar
  const modalCat = document.getElementById('modal-catalogo') as HTMLElement;
  document.getElementById('modal-catalogo-cerrar')?.addEventListener('click', () => modalCat.style.display = 'none');
  document.getElementById('modal-catalogo-cancelar')?.addEventListener('click', () => modalCat.style.display = 'none');
  document.getElementById('modal-catalogo-guardar')?.addEventListener('click', guardarCatalogo);

  // Modal eliminar cat├ílogo
  const modalCatElim = document.getElementById('modal-catalogo-eliminar') as HTMLElement;
  document.getElementById('modal-catalogo-eliminar-cerrar')?.addEventListener('click', () => modalCatElim.style.display = 'none');
  document.getElementById('modal-catalogo-eliminar-cancelar')?.addEventListener('click', () => modalCatElim.style.display = 'none');
  document.getElementById('modal-catalogo-eliminar-confirmar')?.addEventListener('click', eliminarCatalogo);
}

function normalizarLista<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && Array.isArray(raw.data)) return raw.data as T[];
  if (raw && raw.data && Array.isArray(raw.data.data)) return raw.data.data as T[];
  if (raw && Array.isArray(raw.items)) return raw.items as T[];
  return [];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatearFecha(valor: string | null): string {
  if (!valor) return 'Sin registro';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'Sin registro';
  return fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getFechaOrden(orden: any): string | null {
  const fecha =
    orden?.fecha_orden ||
    orden?.fecha_ejecucion ||
    orden?.fecha_envio ||
    orden?.fecha_programada ||
    orden?.created_at ||
    null;
  return typeof fecha === 'string' ? fecha : null;
}

function getNombreClienteDesdeOrden(orden: any): string {
  const nombre =
    orden?.cliente?.nombre_empresa ||
    orden?.cotizacion?.cliente?.nombre_empresa ||
    orden?.cotizacion?.cliente_nombre ||
    orden?.cliente_nombre ||
    '';
  return typeof nombre === 'string' ? nombre.trim() : '';
}

function getClienteIdDesdeOrden(orden: any): number | null {
  const id =
    orden?.cliente?.id ||
    orden?.cotizacion?.cliente?.id ||
    orden?.id_cliente ||
    orden?.cotizacion?.id_cliente ||
    null;
  const parsed = toNumber(id);
  return parsed > 0 ? parsed : null;
}

function getMontoDesdeOrden(orden: any): number {
  const totalDirecto = toNumber(orden?.total);
  if (totalDirecto > 0) return totalDirecto;

  const totalCotizacion = toNumber(orden?.cotizacion?.total);
  if (totalCotizacion > 0) return totalCotizacion;

  const subtotal = toNumber(orden?.cotizacion?.subtotal);
  const igv = toNumber(orden?.cotizacion?.igv);
  return subtotal + igv;
}

function incluyeTipo(adq: ResumenMuestreoCliente['adquisiciones'], filtro: string): boolean {
  if (filtro === 'all') return true;
  if (filtro === 'mixto') {
    const tiposActivos = [adq.servicio, adq.producto, adq.capacitacion, adq.asesoria].filter(v => v > 0).length;
    return tiposActivos > 1;
  }
  return adq[filtro as keyof ResumenMuestreoCliente['adquisiciones']] > 0;
}

function renderizarMuestreoClientesTabla() {
  const tableBody = document.getElementById('muestreo-clientes-body');
  const statsClientes = document.getElementById('muestreo-stat-clientes');
  const statsAdquisiciones = document.getElementById('muestreo-stat-adquisiciones');
  const statsInversion = document.getElementById('muestreo-stat-inversion');
  const paginationInfo = document.querySelector('#muestreo-clientes-pagination .pagination-info');

  if (!tableBody || !statsClientes || !statsAdquisiciones || !statsInversion) return;

  const texto = filtroSearchMuestreo.toLowerCase();
  const filtrados = muestreoClientesData
    .filter(item => {
      const coincideTexto = !texto || item.nombre.toLowerCase().includes(texto) || item.rubro.toLowerCase().includes(texto);
      const coincideTipo = incluyeTipo(item.adquisiciones, filtroTipoMuestreo);
      return coincideTexto && coincideTipo;
    })
    .sort((a, b) => b.inversionTotal - a.inversionTotal);

  const totalAdquisiciones = filtrados.reduce((acc, item) => {
    return acc + item.adquisiciones.servicio + item.adquisiciones.producto + item.adquisiciones.capacitacion + item.adquisiciones.asesoria;
  }, 0);
  const totalInversion = filtrados.reduce((acc, item) => acc + item.inversionTotal, 0);

  statsClientes.textContent = String(filtrados.length);
  statsAdquisiciones.textContent = String(totalAdquisiciones);
  statsInversion.textContent = moneyFormatter.format(totalInversion);

  if (filtrados.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;padding:32px;">No se encontraron clientes con adquisiciones para este filtro.</td></tr>';
    if (paginationInfo) paginationInfo.textContent = 'Mostrando 0 resultados';
    return;
  }

  tableBody.innerHTML = filtrados.map(item => {
    const totalTipos = [item.adquisiciones.servicio, item.adquisiciones.producto, item.adquisiciones.capacitacion, item.adquisiciones.asesoria]
      .filter(v => v > 0).length;
    const etiquetaPerfil = totalTipos > 1 ? 'Mixto' : 'Especializado';
    const totalCompras = item.adquisiciones.servicio + item.adquisiciones.producto + item.adquisiciones.capacitacion + item.adquisiciones.asesoria;

    return `
      <tr>
        <td>
          <div class="equipment-info">
            <div>
              <div class="equipment-name">${item.nombre}</div>
              <div class="equipment-id">${item.rubro || 'Sin rubro'}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span class="badge blue">S: ${item.adquisiciones.servicio}</span>
            <span class="badge green">P: ${item.adquisiciones.producto}</span>
            <span class="badge">C: ${item.adquisiciones.capacitacion}</span>
            <span class="badge orange">A: ${item.adquisiciones.asesoria}</span>
          </div>
        </td>
        <td>${totalCompras}</td>
        <td><strong>${moneyFormatter.format(item.inversionTotal)}</strong></td>
        <td>${formatearFecha(item.ultimaAdquisicion)}</td>
        <td><span class="badge ${totalTipos > 1 ? 'blue' : 'green'}">${etiquetaPerfil}</span></td>
      </tr>
    `;
  }).join('');

  if (paginationInfo) {
    paginationInfo.textContent = `Mostrando ${filtrados.length} de ${muestreoClientesData.length} clientes con adquisiciones`;
  }
}

async function cargarMuestreoClientes() {
  const tableBody = document.getElementById('muestreo-clientes-body');
  if (tableBody) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;padding:32px;">Cargando muestreo de clientes...</td></tr>';
  }

  try {
    const [resClientes, resServicio, resProducto, resCapacitacion, resAsesoria] = await Promise.all([
      clienteService.getAll({ estado: 'Acepta', per_page: 500 }),
      ordenServicioService.getAll({ per_page: 500 }),
      ordenProductoService.getAll({ per_page: 500 }),
      ordenCapacitacionService.getAll({ per_page: 500 }),
      ordenAsesoriaService.getAll({ per_page: 500 }),
    ]);

    const clientes = normalizarLista<Cliente>(resClientes);
    const ordenesServicio = normalizarLista<any>(resServicio);
    const ordenesProducto = normalizarLista<any>(resProducto);
    const ordenesCapacitacion = normalizarLista<any>(resCapacitacion);
    const ordenesAsesoria = normalizarLista<any>(resAsesoria);

    const clientesPorId = new Map<number, Cliente>();
    clientes.forEach((cliente) => {
      if (cliente.id) clientesPorId.set(cliente.id, cliente);
    });

    const resumen = new Map<string, ResumenMuestreoCliente>();
    const upsertResumen = (tipo: keyof ResumenMuestreoCliente['adquisiciones'], orden: any) => {
      const clienteId = getClienteIdDesdeOrden(orden);
      const clienteBase = clienteId ? clientesPorId.get(clienteId) : undefined;
      const nombre = getNombreClienteDesdeOrden(orden) || clienteBase?.nombre_empresa || `Cliente #${clienteId ?? 'N/D'}`;
      const rubro = clienteBase?.rubro || orden?.cotizacion?.cliente?.rubro || 'Sin rubro';
      const key = clienteId ? `id-${clienteId}` : `name-${nombre.toLowerCase()}`;

      if (!resumen.has(key)) {
        resumen.set(key, {
          key,
          clienteId,
          nombre,
          rubro,
          adquisiciones: {
            servicio: 0,
            producto: 0,
            capacitacion: 0,
            asesoria: 0,
          },
          inversionTotal: 0,
          ultimaAdquisicion: null,
        });
      }

      const actual = resumen.get(key);
      if (!actual) return;

      actual.adquisiciones[tipo] += 1;
      actual.inversionTotal += getMontoDesdeOrden(orden);

      const fechaOrden = getFechaOrden(orden);
      if (!fechaOrden) return;
      if (!actual.ultimaAdquisicion) {
        actual.ultimaAdquisicion = fechaOrden;
        return;
      }

      const fechaActual = new Date(actual.ultimaAdquisicion).getTime();
      const fechaNueva = new Date(fechaOrden).getTime();
      if (!Number.isNaN(fechaNueva) && fechaNueva > fechaActual) {
        actual.ultimaAdquisicion = fechaOrden;
      }
    };

    ordenesServicio.forEach((orden) => upsertResumen('servicio', orden));
    ordenesProducto.forEach((orden) => upsertResumen('producto', orden));
    ordenesCapacitacion.forEach((orden) => upsertResumen('capacitacion', orden));
    ordenesAsesoria.forEach((orden) => upsertResumen('asesoria', orden));

    muestreoClientesData = Array.from(resumen.values());
    renderizarMuestreoClientesTabla();
  } catch (error) {
    console.error('Error cargando muestreo de clientes:', error);
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:32px;">No se pudo cargar el muestreo de clientes.</td></tr>';
    }
  }
}

// Tab: Muestreo de Clientes
export function renderMuestreoClientesTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Clientes con adquisiciones</div>
          <div class="stat-box-value" id="muestreo-stat-clientes">0</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Adquisiciones registradas</div>
          <div class="stat-box-value" id="muestreo-stat-adquisiciones">0</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Inversión total acumulada</div>
          <div class="stat-box-value" id="muestreo-stat-inversion">S/ 0.00</div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" id="muestreo-search-clientes" placeholder="Buscar cliente o rubro..." class="search-input">
      </div>
      <select class="filter-select" id="muestreo-filter-tipo">
        <option value="all">Todos los tipos</option>
        <option value="servicio">Servicio</option>
        <option value="producto">Producto</option>
        <option value="capacitacion">Capacitación</option>
        <option value="asesoria">Asesoría</option>
        <option value="mixto">Perfil mixto</option>
      </select>
      <button class="btn-filter" id="muestreo-btn-filtrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>SERVICIOS ADQUIRIDOS</th>
            <th>TOTAL ADQUISICIONES</th>
            <th>INVERSIÓN TOTAL</th>
            <th>ÚLTIMA ADQUISICIÓN</th>
            <th>PERFIL</th>
          </tr>
        </thead>
        <tbody id="muestreo-clientes-body">
          <tr>
            <td colspan="6" style="text-align:center;color:#64748b;padding:32px;">Cargando muestreo de clientes...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" id="muestreo-clientes-pagination">
      <span class="pagination-info"></span>
    </div>
  `;
}

export function initMuestreoClientesEvents() {
  cargarMuestreoClientes();

  const input = document.getElementById('muestreo-search-clientes') as HTMLInputElement;
  if (input) {
    let debounce: ReturnType<typeof setTimeout>;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        filtroSearchMuestreo = input.value.trim();
        renderizarMuestreoClientesTabla();
      }, 300);
    });
  }

  const filtroTipo = document.getElementById('muestreo-filter-tipo') as HTMLSelectElement;
  if (filtroTipo) {
    filtroTipo.addEventListener('change', () => {
      filtroTipoMuestreo = filtroTipo.value;
      renderizarMuestreoClientesTabla();
    });
  }

  const btnFiltrar = document.getElementById('muestreo-btn-filtrar');
  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', () => {
      filtroSearchMuestreo = input?.value.trim() || '';
      filtroTipoMuestreo = filtroTipo?.value || 'all';
      renderizarMuestreoClientesTabla();
    });
  }
}

export function renderLogistica() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión - Datos de Clientes Actuales</div>
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
      <button class="tab-btn" data-tab="muestreo">Muestreo de Clientes</button>
    </div>

    <div id="logistica-tab-content">
      ${renderClientesTab()}
    </div>
  `;
}
