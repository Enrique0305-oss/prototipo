// Comercial - Prospectos 
import { clienteService } from '../../../services/clienteService';
import { mostrarToast } from '../../../shared/toast';
import type { Cliente } from '../../../core/api/types';

// Estado del módulo
let clientesData: Cliente[] = [];
let estadisticasData: any = null;
let filtros = {
  search: '',
  estado: '',
};

export function renderComercialProspectos() {
  return `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:26px;font-weight:700;color:#1a2332;">Clientes Potenciales</h1>
      <div class="header-actions">
        <button class="btn-dark-blue" id="btn-nuevo-prospecto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nuevo Cliente Potencial
        </button>
      </div>
    </div>

    <div class="stats-row" id="prospectos-stats" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Clientes Potenciales Totales</div>
          <div class="stat-box-value"><span class="loading-text">Cargando...</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon" style="background: #f0fdf4; color: #16a34a;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Aceptados</div>
          <div class="stat-box-value"><span class="loading-text">Cargando...</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Contactados</div>
          <div class="stat-box-value"><span class="loading-text">Cargando...</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">No Aceptan</div>
          <div class="stat-box-value"><span class="loading-text">Cargando...</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Buscar cliente potencial..." class="search-input" id="prospecto-search">
      </div>
      <select class="filter-select" id="prospecto-estado-filter">
        <option value="">Todos los estados</option>
        <option value="Contactado">Contactado</option>
        <option value="Acepta">Acepta</option>
        <option value="No acepta">No Acepta</option>
      </select>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>CLIENTE POTENCIAL</th>
            <th>CONTACTO</th>
            <th>SECTOR</th>
            <th>FECHA</th>
            <th>ORIGEN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="prospectos-table-body">
          <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
              <span class="loading-text">Cargando clientes potenciales...</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" id="prospectos-pagination">
      <span class="pagination-info">Cargando...</span>
    </div>
  `;
}

// Cargar estadísticas
async function cargarEstadisticasProspectos() {
  try {
    const response = await clienteService.getEstadisticas();
    if (response.success && response.data) {
      estadisticasData = response.data;
      actualizarEstadisticasProspectos();
    }
  } catch (error) {
    console.error('Error cargando estadísticas de prospectos:', error);
  }
}

function actualizarEstadisticasProspectos() {
  if (!estadisticasData) return;
  const stats = document.getElementById('prospectos-stats');
  if (!stats) return;

  const boxes = stats.querySelectorAll('.stat-box-value');
  if (boxes[0]) boxes[0].textContent = String(estadisticasData.total || 0);
  if (boxes[1]) boxes[1].textContent = String(estadisticasData.activos || 0);
  if (boxes[2]) boxes[2].textContent = String(estadisticasData.contactados || 0);
  if (boxes[3]) boxes[3].textContent = String(estadisticasData.rechazados || 0);
}

// Cargar clientes/prospectos
async function cargarProspectos() {
  try {
    const params: any = {};
    if (filtros.search) params.search = filtros.search;
    if (filtros.estado) params.estado = filtros.estado;

    const response = await clienteService.getAll(params);
    if (response.success && response.data) {
      clientesData = response.data;
      renderizarTablaProspectos();
    }
  } catch (error) {
    console.error('Error cargando prospectos:', error);
    const tbody = document.getElementById('prospectos-table-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #e74c3c;">Error al cargar los clientes potenciales.</td></tr>`;
    }
  }
}

function getEstadoBadge(estado: string): string {
  switch (estado) {
    case 'Acepta':
      return '<span class="status-indicator success">ACEPTA</span>';
    case 'Contactado':
      return '<span class="status-indicator" style="background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd;">CONTACTADO</span>';
    case 'No acepta':
      return '<span class="status-indicator danger">NO ACEPTA</span>';
    default:
      return `<span class="status-indicator">${estado}</span>`;
  }
}

function getOrigenBadge(origen: string | undefined): string {
  if (!origen) return '<span style="color: #94a3b8;">—</span>';
  return `<span class="badge">${origen.toUpperCase()}</span>`;
}

function getAccionBtn(cliente: Cliente): string {
  if (cliente.estado === 'Acepta') {
    return `
      <button class="btn-secondary btn-cotizar" data-id="${cliente.id}" style="padding: 6px 12px; font-size: 12px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        Cotizar
      </button>`;
  } else if (cliente.estado === 'Contactado') {
    return `<button class="btn-secondary btn-seguimiento" data-id="${cliente.id}" style="padding: 6px 12px; font-size: 12px;">Seguimiento</button>`;
  }
  return '';
}

function renderizarTablaProspectos() {
  const tbody = document.getElementById('prospectos-table-body');
  if (!tbody) return;

  if (clientesData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 60px 20px; color: #64748b;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom: 16px;">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          <p style="font-size: 15px; margin-bottom: 8px;">No se encontraron clientes potenciales</p>
          <p style="font-size: 13px; color: #94a3b8;">Intenta con otros filtros o agrega un nuevo cliente potencial</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = clientesData.map(cliente => {
    const fechaRegistro = cliente.fecha_registro
      ? new Date(cliente.fecha_registro).toLocaleDateString('es-PE')
      : '—';

    return `
      <tr>
        <td>
          <div class="equipment-info">
            <div class="equipment-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div class="equipment-name">${cliente.nombre_empresa}</div>
              <div class="equipment-id">${cliente.rubro || ''}</div>
            </div>
          </div>
        </td>
        <td>
          <div>${cliente.persona_contacto || '—'}</div>
          <div style="font-size: 12px; color: #64748b;">${cliente.telefono_contacto || ''}</div>
          ${cliente.correo ? `<div style="font-size: 12px; color: #0d9488;">${cliente.correo}</div>` : ''}
        </td>
        <td>${cliente.rubro || '—'}</td>
        <td>${fechaRegistro}</td>
        <td>${getOrigenBadge(cliente.origen)}</td>
        <td>${getEstadoBadge(cliente.estado)}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-icon" data-action="plantas-prospecto" data-id="${cliente.id}" title="Plantas / Sedes" style="color: #0d9488;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </button>
            <button class="action-btn-icon edit" data-action="edit-prospecto" data-id="${cliente.id}" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn-icon delete" data-action="delete-prospecto" data-id="${cliente.id}" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Pagination info
  const paginationInfo = document.querySelector('#prospectos-pagination .pagination-info');
  if (paginationInfo) {
    paginationInfo.textContent = `Mostrando ${clientesData.length} prospecto${clientesData.length !== 1 ? 's' : ''}`;
  }

  // Event listeners para plantas
  document.querySelectorAll('[data-action="plantas-prospecto"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
      abrirModalPlantas(id);
    });
  });

  // Event listeners para editar
  document.querySelectorAll('[data-action="edit-prospecto"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
      abrirModalEditarProspecto(id);
    });
  });

  // Event listeners para eliminar
  document.querySelectorAll('[data-action="delete-prospecto"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
      confirmarEliminarProspecto(id);
    });
  });
}

// Toast: usa componente compartido importado arriba

// ===== MODAL NUEVO PROSPECTO =====

function abrirModalNuevoProspecto() {
  const modalAnterior = document.getElementById('modal-nuevo-prospecto');
  if (modalAnterior) modalAnterior.remove();

  const html = `
    <div id="modal-nuevo-prospecto" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Nuevo Cliente Potencial</h2>
          <button class="modal-close" id="btn-cerrar-nuevo-prosp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="form-nuevo-prospecto" class="modal-body">
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="new-p-empresa">Empresa / Razón Social *</label>
              <input type="text" id="new-p-empresa" name="nombre_empresa" required maxlength="100" class="form-input" placeholder="Ej: Grupo Textil Lima S.A.C.">
            </div>
            <div class="form-group">
              <label for="new-p-ruc">RUC *</label>
              <input type="text" id="new-p-ruc" name="ruc" required maxlength="11" minlength="11" class="form-input" placeholder="20XXXXXXXXX">
            </div>
            <div class="form-group">
              <label for="new-p-rubro">Rubro / Sector *</label>
              <input type="text" id="new-p-rubro" name="rubro" required maxlength="150" class="form-input" placeholder="Ej: Industria Textil">
            </div>
            <div class="form-group">
              <label for="new-p-contacto">Persona de Contacto</label>
              <input type="text" id="new-p-contacto" name="persona_contacto" maxlength="100" class="form-input" placeholder="Ej: Luis Martínez">
            </div>
            <div class="form-group">
              <label for="new-p-telefono">Teléfono</label>
              <input type="text" id="new-p-telefono" name="telefono_contacto" maxlength="20" class="form-input" placeholder="Ej: (01) 456-7890">
            </div>
            <div class="form-group">
              <label for="new-p-correo">Correo Electrónico</label>
              <input type="email" id="new-p-correo" name="correo" maxlength="100" class="form-input" placeholder="Ej: contacto@empresa.com">
            </div>
            <div class="form-group">
              <label for="new-p-direccion">Dirección</label>
              <input type="text" id="new-p-direccion" name="direccion" maxlength="255" class="form-input" placeholder="Dirección del cliente">
            </div>
            <div class="form-group">
              <label for="new-p-origen">Origen</label>
              <select id="new-p-origen" name="origen" class="form-input">
                <option value="">Seleccionar origen</option>
                <option value="Referido">Referido</option>
                <option value="Web">Web</option>
                <option value="Llamada">Llamada</option>
                <option value="Visita">Visita</option>
                <option value="Redes sociales">Redes sociales</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label for="new-p-fecha">Fecha de Registro</label>
              <input type="date" id="new-p-fecha" name="fecha_registro" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label for="new-p-estado">Estado</label>
              <select id="new-p-estado" name="estado" class="form-input">
                <option value="Contactado">Contactado</option>
                <option value="Acepta">Acepta</option>
                <option value="No acepta">No acepta</option>
              </select>
            </div>
          </div>
          <div class="modal-footer" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" id="btn-cancelar-nuevo-prosp">Cancelar</button>
            <button type="submit" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Crear Prospecto
            </button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal-nuevo-prospecto')!;
  const form = document.getElementById('form-nuevo-prospecto') as HTMLFormElement;

  document.getElementById('btn-cerrar-nuevo-prosp')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-nuevo-prosp')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const data: any = {
      nombre_empresa: (formData.get('nombre_empresa') as string).trim(),
      ruc: (formData.get('ruc') as string).trim(),
      rubro: (formData.get('rubro') as string).trim(),
    };

    const direccion = (formData.get('direccion') as string)?.trim();
    if (direccion) data.direccion = direccion;
    const contacto = (formData.get('persona_contacto') as string)?.trim();
    if (contacto) data.persona_contacto = contacto;
    const telefono = (formData.get('telefono_contacto') as string)?.trim();
    if (telefono) data.telefono_contacto = telefono;
    const correo = (formData.get('correo') as string)?.trim();
    if (correo) data.correo = correo;
    const origen = formData.get('origen') as string;
    if (origen) data.origen = origen;
    const fechaReg = (formData.get('fecha_registro') as string)?.trim();
    if (fechaReg) data.fecha_registro = fechaReg;
    const estado = formData.get('estado') as string;
    if (estado) data.estado = estado;

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creando...'; }

    try {
      const response = await clienteService.create(data);
      if (response.success) {
        modal.remove();
        mostrarToast('success', 'Prospecto creado', `"${data.nombre_empresa}" fue registrado exitosamente`);
        await cargarProspectos();
        await cargarEstadisticasProspectos();
      }
    } catch (error: any) {
      let msg = 'Error al crear el prospecto';
      if (error.data?.errors) {
        msg = Object.entries(error.data.errors).map(([f, m]: [string, any]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n');
      } else if (error.data?.message) {
        msg = error.data.message;
      }
      mostrarToast('error', 'Error', msg);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Crear Prospecto'; }
    }
  });

  setTimeout(() => document.getElementById('new-p-empresa')?.focus(), 100);
}

// ===== MODAL EDITAR PROSPECTO =====

async function abrirModalEditarProspecto(id: number) {
  const cliente = clientesData.find(c => c.id === id);
  if (!cliente) {
    mostrarToast('error', 'Error', 'Prospecto no encontrado');
    return;
  }

  const modalAnterior = document.getElementById('modal-editar-prospecto');
  if (modalAnterior) modalAnterior.remove();

  const origenes = ['Referido', 'Web', 'Llamada', 'Visita', 'Redes sociales', 'Otro'];
  const origenOptions = origenes.map(o => `<option value="${o}" ${cliente.origen === o ? 'selected' : ''}>${o}</option>`).join('');

  const html = `
    <div id="modal-editar-prospecto" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <h2>Editar Prospecto</h2>
          <button class="modal-close" id="btn-cerrar-editar-prosp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="form-editar-prospecto" class="modal-body" data-id="${id}">
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="edit-p-empresa">Empresa / Razón Social *</label>
              <input type="text" id="edit-p-empresa" name="nombre_empresa" required maxlength="100" class="form-input" value="${cliente.nombre_empresa}">
            </div>
            <div class="form-group">
              <label for="edit-p-ruc">RUC *</label>
              <input type="text" id="edit-p-ruc" name="ruc" required maxlength="11" minlength="11" class="form-input" value="${cliente.ruc}">
            </div>
            <div class="form-group">
              <label for="edit-p-rubro">Rubro / Sector *</label>
              <input type="text" id="edit-p-rubro" name="rubro" required maxlength="150" class="form-input" value="${cliente.rubro}">
            </div>
            <div class="form-group">
              <label for="edit-p-contacto">Persona de Contacto</label>
              <input type="text" id="edit-p-contacto" name="persona_contacto" maxlength="100" class="form-input" value="${cliente.persona_contacto || ''}">
            </div>
            <div class="form-group">
              <label for="edit-p-telefono">Teléfono</label>
              <input type="text" id="edit-p-telefono" name="telefono_contacto" maxlength="20" class="form-input" value="${cliente.telefono_contacto || ''}">
            </div>
            <div class="form-group">
              <label for="edit-p-correo">Correo Electrónico</label>
              <input type="email" id="edit-p-correo" name="correo" maxlength="100" class="form-input" value="${cliente.correo || ''}">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="edit-p-direccion">Dirección</label>
              <input type="text" id="edit-p-direccion" name="direccion" maxlength="255" class="form-input" value="${cliente.direccion || ''}">
            </div>
            <div class="form-group">
              <label for="edit-p-origen">Origen</label>
              <select id="edit-p-origen" name="origen" class="form-input">
                <option value="">Seleccionar origen</option>
                ${origenOptions}
              </select>
            </div>
            <div class="form-group">
              <label for="edit-p-fecha">Fecha de Registro</label>
              <input type="date" id="edit-p-fecha" name="fecha_registro" class="form-input" value="${cliente.fecha_registro ? new Date(cliente.fecha_registro).toISOString().split('T')[0] : ''}">
            </div>
            <div class="form-group">
              <label for="edit-p-estado">Estado</label>
              <select id="edit-p-estado" name="estado" class="form-input">
                <option value="Contactado" ${cliente.estado === 'Contactado' ? 'selected' : ''}>Contactado</option>
                <option value="Acepta" ${cliente.estado === 'Acepta' ? 'selected' : ''}>Acepta</option>
                <option value="No acepta" ${cliente.estado === 'No acepta' ? 'selected' : ''}>No acepta</option>
              </select>
            </div>
          </div>
          <div class="modal-footer" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" id="btn-cancelar-editar-prosp">Cancelar</button>
            <button type="submit" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal-editar-prospecto')!;
  const form = document.getElementById('form-editar-prospecto') as HTMLFormElement;

  document.getElementById('btn-cerrar-editar-prosp')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-editar-prosp')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const clienteId = parseInt(form.dataset.id || '0');

    const data: any = {
      nombre_empresa: (formData.get('nombre_empresa') as string).trim(),
      ruc: (formData.get('ruc') as string).trim(),
      rubro: (formData.get('rubro') as string).trim(),
      direccion: (formData.get('direccion') as string)?.trim() || null,
      persona_contacto: (formData.get('persona_contacto') as string)?.trim() || null,
      telefono_contacto: (formData.get('telefono_contacto') as string)?.trim() || null,
      correo: (formData.get('correo') as string)?.trim() || null,
      origen: formData.get('origen') as string || null,
      fecha_registro: (formData.get('fecha_registro') as string)?.trim() || null,
      estado: formData.get('estado') as string,
    };

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Guardando...'; }

    try {
      const response = await clienteService.update(clienteId, data);
      if (response.success) {
        modal.remove();
        mostrarToast('success', 'Prospecto actualizado', `"${data.nombre_empresa}" fue actualizado correctamente`);
        await cargarProspectos();
        await cargarEstadisticasProspectos();
      }
    } catch (error: any) {
      let msg = 'Error al actualizar el prospecto';
      if (error.data?.errors) {
        msg = Object.entries(error.data.errors).map(([f, m]: [string, any]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('\n');
      } else if (error.data?.message) {
        msg = error.data.message;
      }
      mostrarToast('error', 'Error', msg);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Guardar Cambios'; }
    }
  });
}

// ===== ELIMINAR PROSPECTO =====

function confirmarEliminarProspecto(id: number) {
  const cliente = clientesData.find(c => c.id === id);
  if (!cliente) return;

  const modalAnterior = document.getElementById('modal-confirmar-eliminar-prosp');
  if (modalAnterior) modalAnterior.remove();

  const html = `
    <div id="modal-confirmar-eliminar-prosp" class="modal-overlay" style="display: flex;">
      <div class="modal-container" style="max-width: 440px;">
        <div class="modal-header">
          <h2>Eliminar Prospecto</h2>
          <button class="modal-close" id="btn-cerrar-eliminar-prosp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 32px 24px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <p style="font-size: 15px; color: #334155; margin-bottom: 8px;">¿Estás seguro de eliminar este prospecto?</p>
          <p style="font-size: 14px; font-weight: 600; color: #1e293b;">${cliente.nombre_empresa}</p>
          <p style="font-size: 13px; color: #64748b;">RUC: ${cliente.ruc}</p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 12px;">Esta acción no se puede deshacer si no tiene cotizaciones u órdenes asociadas.</p>
        </div>
        <div class="modal-footer" style="display: flex; gap: 12px; justify-content: center; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
          <button class="btn-secondary" id="btn-cancelar-eliminar-prosp">Cancelar</button>
          <button class="btn-primary" id="btn-confirmar-eliminar-prosp" style="background: #dc2626; border-color: #dc2626;">Eliminar</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal = document.getElementById('modal-confirmar-eliminar-prosp')!;
  document.getElementById('btn-cerrar-eliminar-prosp')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-eliminar-prosp')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  document.getElementById('btn-confirmar-eliminar-prosp')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-confirmar-eliminar-prosp') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Eliminando...';

    try {
      const response = await clienteService.delete(id);
      if (response.success) {
        modal.remove();
        mostrarToast('success', 'Prospecto eliminado', `"${cliente.nombre_empresa}" fue eliminado correctamente`);
        await cargarProspectos();
        await cargarEstadisticasProspectos();
      }
    } catch (error: any) {
      const msg = error.data?.message || 'Error al eliminar el prospecto';
      mostrarToast('error', 'Error', msg);
      btn.disabled = false;
      btn.textContent = 'Eliminar';
    }
  });
}

// ===== MODAL PLANTAS / SEDES =====

async function abrirModalPlantas(idCliente: number) {
  const cliente = clientesData.find(c => c.id === idCliente);
  if (!cliente) { mostrarToast('error', 'Error', 'Cliente no encontrado'); return; }

  const prev = document.getElementById('modal-plantas-cliente');
  if (prev) prev.remove();

  const html = `
    <div id="modal-plantas-cliente" class="modal-overlay" style="display:flex; z-index:10000;">
      <div class="modal-container" style="max-width:800px; max-height:90vh; display:flex; flex-direction:column;">
        <div class="modal-header">
          <h2>Plantas / Sedes — ${escHtml(cliente.nombre_empresa)}</h2>
          <button class="modal-close" id="btn-cerrar-plantas">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" style="overflow-y:auto; flex:1; padding:20px 24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <p style="color:#64748b; font-size:13px;">Administra las plantas/sedes y sus áreas</p>
            <button class="btn-primary" id="btn-nueva-planta" style="padding:6px 14px; font-size:13px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nueva Planta
            </button>
          </div>
          <div id="plantas-list" style="display:flex; flex-direction:column; gap:12px;">
            <p style="text-align:center; color:#94a3b8; padding:40px 0;">Cargando plantas...</p>
          </div>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  const modal = document.getElementById('modal-plantas-cliente')!;
  document.getElementById('btn-cerrar-plantas')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  document.getElementById('btn-nueva-planta')?.addEventListener('click', () => abrirFormPlanta(idCliente));

  await cargarListaPlantas(idCliente);
}

async function cargarListaPlantas(idCliente: number) {
  const container = document.getElementById('plantas-list');
  if (!container) return;

  try {
    const resp = await clienteService.getPlantas(idCliente);
    const plantas: any[] = resp.success ? (resp.data || []) : [];

    if (plantas.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 0; color:#94a3b8;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom:12px;">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <p style="font-size:14px;">No hay plantas registradas</p>
          <p style="font-size:12px; margin-top:4px;">Agrega la primera planta o sede del cliente</p>
        </div>`;
      return;
    }

    container.innerHTML = plantas.map((p: any) => {
      const areas: any[] = p.areas_activas || p.areas || [];
      const areasHtml = areas.length > 0
        ? areas.map((a: any) => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 12px; background:#f8fafc; border-radius:6px; font-size:13px;">
            <span>
              <strong>${escHtml(a.nombre)}</strong>
              ${a.descripcion ? `<span style="color:#94a3b8; margin-left:8px;">${escHtml(a.descripcion)}</span>` : ''}
              <span class="status-indicator ${a.estado === 'Activo' ? 'success' : 'danger'}" style="font-size:10px; padding:2px 6px; margin-left:6px;">${a.estado}</span>
            </span>
            <span style="display:flex; gap:4px;">
              <button class="action-btn-icon edit btn-edit-area" data-planta="${p.id}" data-area="${a.id}" title="Editar área" style="padding:4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="action-btn-icon delete btn-del-area" data-planta="${p.id}" data-area="${a.id}" title="Eliminar área" style="padding:4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </span>
          </div>`).join('')
        : '<p style="color:#94a3b8; font-size:12px; padding:4px 12px;">Sin áreas registradas</p>';

      return `
        <div class="planta-card" style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:#f0fdfa; border-bottom:1px solid #e2e8f0;">
            <div>
              <div style="font-weight:600; font-size:14px; color:#0f172a;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" style="vertical-align:-3px; margin-right:6px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                ${escHtml(p.nombre)}
                <span class="status-indicator ${p.estado === 'Activo' ? 'success' : 'danger'}" style="font-size:10px; padding:2px 6px; margin-left:8px;">${p.estado}</span>
              </div>
              <div style="font-size:12px; color:#64748b; margin-top:2px;">${escHtml(p.direccion || '')} ${p.distrito ? '· ' + escHtml(p.distrito) : ''} ${p.provincia ? '· ' + escHtml(p.provincia) : ''}</div>
              ${p.contacto_nombre ? `<div style="font-size:12px; color:#94a3b8; margin-top:2px;">Contacto: ${escHtml(p.contacto_nombre)} ${p.contacto_telefono ? '· ' + escHtml(p.contacto_telefono) : ''}</div>` : ''}
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn-secondary btn-add-area" data-planta="${p.id}" style="padding:4px 10px; font-size:12px;">+ Área</button>
              <button class="action-btn-icon edit btn-edit-planta" data-id="${p.id}" title="Editar planta" style="padding:6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="action-btn-icon delete btn-del-planta" data-id="${p.id}" title="Eliminar planta" style="padding:6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <div style="padding:10px 16px; display:flex; flex-direction:column; gap:6px;">
            <div style="font-size:12px; font-weight:600; color:#64748b; margin-bottom:2px;">ÁREAS</div>
            ${areasHtml}
          </div>
        </div>`;
    }).join('');

    // Bind planta events
    container.querySelectorAll('.btn-edit-planta').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = parseInt((btn as HTMLElement).dataset.id || '0');
        const planta = plantas.find((p: any) => p.id === pid);
        if (planta) abrirFormPlanta(idCliente, planta);
      });
    });
    container.querySelectorAll('.btn-del-planta').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pid = parseInt((btn as HTMLElement).dataset.id || '0');
        if (!confirm('¿Eliminar esta planta y todas sus áreas?')) return;
        try {
          await clienteService.deletePlanta(idCliente, pid);
          mostrarToast('success', 'Planta eliminada', '');
          await cargarListaPlantas(idCliente);
        } catch { mostrarToast('error', 'Error', 'No se pudo eliminar la planta'); }
      });
    });
    // Bind area events
    container.querySelectorAll('.btn-add-area').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = parseInt((btn as HTMLElement).dataset.planta || '0');
        abrirFormArea(idCliente, pid);
      });
    });
    container.querySelectorAll('.btn-edit-area').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = parseInt((btn as HTMLElement).dataset.planta || '0');
        const aid = parseInt((btn as HTMLElement).dataset.area || '0');
        const planta = plantas.find((p: any) => p.id === pid);
        const area = planta?.areas?.find((a: any) => a.id === aid);
        if (area) abrirFormArea(idCliente, pid, area);
      });
    });
    container.querySelectorAll('.btn-del-area').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pid = parseInt((btn as HTMLElement).dataset.planta || '0');
        const aid = parseInt((btn as HTMLElement).dataset.area || '0');
        if (!confirm('¿Eliminar esta área?')) return;
        try {
          await clienteService.deleteArea(idCliente, pid, aid);
          mostrarToast('success', 'Área eliminada', '');
          await cargarListaPlantas(idCliente);
        } catch { mostrarToast('error', 'Error', 'No se pudo eliminar el área'); }
      });
    });
  } catch (err) {
    container.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:20px;">Error al cargar plantas</p>';
  }
}

function escHtml(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function abrirFormPlanta(idCliente: number, planta?: any) {
  const isEdit = !!planta;
  const coordenadasRaw = isEdit ? (planta.coordenadas || '').toString() : '';
  const coordenadasPartes = coordenadasRaw.split(',').map((v: string) => v.trim());
  const latitudInicial = isEdit ? (planta.latitud ?? coordenadasPartes[0] ?? '') : '';
  const longitudInicial = isEdit ? (planta.longitud ?? coordenadasPartes[1] ?? '') : '';
  const prev = document.getElementById('modal-form-planta');
  if (prev) prev.remove();

  const html = `
    <div id="modal-form-planta" class="modal-overlay" style="display:flex; z-index:10001;">
      <div class="modal-container" style="max-width:550px;">
        <div class="modal-header">
          <h2>${isEdit ? 'Editar' : 'Nueva'} Planta</h2>
          <button class="modal-close" id="btn-cerrar-form-planta">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="form-planta" class="modal-body">
          <div class="form-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div class="form-group" style="grid-column:1/-1;">
              <label>Nombre de la Planta / Sede *</label>
              <input type="text" name="nombre" required maxlength="150" class="form-input" value="${isEdit ? escHtml(planta.nombre) : ''}" placeholder="Ej: Planta Lima Norte">
            </div>
            <div class="form-group" style="grid-column:1/-1;">
              <label>Dirección</label>
              <input type="text" name="direccion" maxlength="255" class="form-input" value="${isEdit ? escHtml(planta.direccion || '') : ''}" placeholder="Dirección completa">
            </div>
            <div class="form-group">
              <label>Distrito</label>
              <input type="text" name="distrito" maxlength="100" class="form-input" value="${isEdit ? escHtml(planta.distrito || '') : ''}">
            </div>
            <div class="form-group">
              <label>Provincia</label>
              <input type="text" name="provincia" maxlength="100" class="form-input" value="${isEdit ? escHtml(planta.provincia || '') : ''}">
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <input type="text" name="departamento" maxlength="100" class="form-input" value="${isEdit ? escHtml(planta.departamento || '') : ''}">
            </div>
            <div class="form-group">
              <label>Referencia</label>
              <input type="text" name="referencia" maxlength="255" class="form-input" value="${isEdit ? escHtml(planta.referencia || '') : ''}">
            </div>
            <div class="form-group">
              <label>Latitud</label>
              <input type="number" name="latitud" step="any" min="-90" max="90" class="form-input" value="${escHtml(String(latitudInicial || ''))}" placeholder="-12.04000000">
            </div>
            <div class="form-group">
              <label>Longitud</label>
              <input type="number" name="longitud" step="any" min="-180" max="180" class="form-input" value="${escHtml(String(longitudInicial || ''))}" placeholder="-77.02000000">
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select name="estado" class="form-input">
                <option value="Activo" ${isEdit && planta.estado === 'Inactivo' ? '' : 'selected'}>Activo</option>
                <option value="Inactivo" ${isEdit && planta.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
            <div class="form-group">
              <label>Contacto Nombre</label>
              <input type="text" name="contacto_nombre" maxlength="100" class="form-input" value="${isEdit ? escHtml(planta.contacto_nombre || '') : ''}">
            </div>
            <div class="form-group">
              <label>Contacto Teléfono</label>
              <input type="text" name="contacto_telefono" maxlength="20" class="form-input" value="${isEdit ? escHtml(planta.contacto_telefono || '') : ''}">
            </div>
          </div>
          <div class="modal-footer" style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" class="btn-secondary" id="btn-cancelar-form-planta">Cancelar</button>
            <button type="submit" class="btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Planta'}</button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  const modal = document.getElementById('modal-form-planta')!;
  const form = document.getElementById('form-planta') as HTMLFormElement;

  document.getElementById('btn-cerrar-form-planta')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-form-planta')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data: any = {};
    fd.forEach((v, k) => { const val = (v as string).trim(); if (val) data[k] = val; });

    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    btn.disabled = true; btn.textContent = 'Guardando...';

    try {
      if (isEdit) {
        await clienteService.updatePlanta(idCliente, planta.id, data);
      } else {
        await clienteService.createPlanta(idCliente, data);
      }
      modal.remove();
      mostrarToast('success', isEdit ? 'Planta actualizada' : 'Planta creada', '');
      await cargarListaPlantas(idCliente);
    } catch (err: any) {
      const msg = err.data?.message || 'Error al guardar la planta';
      mostrarToast('error', 'Error', msg);
      btn.disabled = false; btn.textContent = isEdit ? 'Guardar Cambios' : 'Crear Planta';
    }
  });
}

function abrirFormArea(idCliente: number, idPlanta: number, area?: any) {
  const isEdit = !!area;
  const prev = document.getElementById('modal-form-area');
  if (prev) prev.remove();

  const html = `
    <div id="modal-form-area" class="modal-overlay" style="display:flex; z-index:10002;">
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h2>${isEdit ? 'Editar' : 'Nueva'} Área</h2>
          <button class="modal-close" id="btn-cerrar-form-area">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="form-area" class="modal-body">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-group">
              <label>Nombre del Área *</label>
              <input type="text" name="nombre" required maxlength="150" class="form-input" value="${isEdit ? escHtml(area.nombre) : ''}" placeholder="Ej: Cocina, Almacén, Oficinas">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" rows="2" class="form-input" placeholder="Descripción opcional">${isEdit ? escHtml(area.descripcion || '') : ''}</textarea>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select name="estado" class="form-input">
                <option value="Activo" ${isEdit && area.estado === 'Inactivo' ? '' : 'selected'}>Activo</option>
                <option value="Inactivo" ${isEdit && area.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
          </div>
          <div class="modal-footer" style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" class="btn-secondary" id="btn-cancelar-form-area">Cancelar</button>
            <button type="submit" class="btn-primary">${isEdit ? 'Guardar' : 'Crear Área'}</button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  const modal = document.getElementById('modal-form-area')!;
  const form = document.getElementById('form-area') as HTMLFormElement;

  document.getElementById('btn-cerrar-form-area')?.addEventListener('click', () => modal.remove());
  document.getElementById('btn-cancelar-form-area')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data: any = {};
    fd.forEach((v, k) => { const val = (v as string).trim(); if (val) data[k] = val; });

    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    btn.disabled = true; btn.textContent = 'Guardando...';

    try {
      if (isEdit) {
        await clienteService.updateArea(idCliente, idPlanta, area.id, data);
      } else {
        await clienteService.createArea(idCliente, idPlanta, data);
      }
      modal.remove();
      mostrarToast('success', isEdit ? 'Área actualizada' : 'Área creada', '');
      await cargarListaPlantas(idCliente);
    } catch (err: any) {
      const msg = err.data?.message || 'Error al guardar el área';
      mostrarToast('error', 'Error', msg);
      btn.disabled = false; btn.textContent = isEdit ? 'Guardar' : 'Crear Área';
    }
  });
}

// ===== INICIALIZAR EVENTOS =====

export function initProspectosEvents() {
  cargarEstadisticasProspectos();
  cargarProspectos();

  // Búsqueda con debounce
  const searchInput = document.getElementById('prospecto-search') as HTMLInputElement;
  if (searchInput) {
    let searchTimeout: number;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        filtros.search = (e.target as HTMLInputElement).value;
        cargarProspectos();
      }, 500);
    });
  }

  // Filtro de estado
  const estadoFilter = document.getElementById('prospecto-estado-filter') as HTMLSelectElement;
  if (estadoFilter) {
    estadoFilter.addEventListener('change', (e) => {
      filtros.estado = (e.target as HTMLSelectElement).value;
      cargarProspectos();
    });
  }

  // Botón nuevo prospecto
  const btnNuevo = document.getElementById('btn-nuevo-prospecto');
  if (btnNuevo) {
    btnNuevo.addEventListener('click', abrirModalNuevoProspecto);
  }
}
