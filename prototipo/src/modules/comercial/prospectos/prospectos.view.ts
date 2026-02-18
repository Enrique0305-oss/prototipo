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
    <div class="page-header">
      <h1>Prospectos</h1>
      <div class="header-actions">
        <button class="btn-primary" id="btn-nuevo-prospecto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nuevo Prospecto
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
          <div class="stat-box-label">Prospectos Totales</div>
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
        <input type="text" placeholder="Buscar prospecto..." class="search-input" id="prospecto-search">
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
            <th>PROSPECTO</th>
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
              <span class="loading-text">Cargando prospectos...</span>
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
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #e74c3c;">Error al cargar los prospectos.</td></tr>`;
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
          <p style="font-size: 15px; margin-bottom: 8px;">No se encontraron prospectos</p>
          <p style="font-size: 13px; color: #94a3b8;">Intenta con otros filtros o agrega un nuevo prospecto</p>
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
        </td>
        <td>${cliente.rubro || '—'}</td>
        <td>${fechaRegistro}</td>
        <td>${getOrigenBadge(cliente.origen)}</td>
        <td>${getEstadoBadge(cliente.estado)}</td>
        <td>
          <div class="action-buttons">
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
          <h2>Nuevo Prospecto</h2>
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
