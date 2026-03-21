// Comercial - Exponentes View (mismo patrón que Proveedores)
import './exponentes.css';
import { exponenteService, type Exponente } from '../../../services/exponenteService';
import { mostrarToast, confirmarAccion } from '../../../shared/toast';

let exponentesData: Exponente[] = [];
let filtroSearch = '';
let filtroEstado = '';

export function renderComercialExponentes(): string {
  return `
    <div class="exp-page-header">
      <div class="exp-breadcrumb">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px;">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
        Gestión de Exponentes
      </div>
      <div class="exp-actions">
        <button class="exp-btn-primary" id="btnNuevoExponente">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Exponente
        </button>
      </div>
    </div>

    <div class="exp-stats-bar" id="expStatsBar">
      <div class="exp-stat-card">
        <div class="exp-stat-value" id="expStatTotal">0</div>
        <div class="exp-stat-label">Total Exponentes</div>
      </div>
      <div class="exp-stat-card">
        <div class="exp-stat-value" id="expStatActivos" style="color:#15803d;">0</div>
        <div class="exp-stat-label">Activos</div>
      </div>
      <div class="exp-stat-card">
        <div class="exp-stat-value" id="expStatInactivos" style="color:#94a3b8;">0</div>
        <div class="exp-stat-label">Inactivos</div>
      </div>
    </div>

    <div class="exp-filters-bar">
      <div class="exp-search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="expSearchInput" placeholder="Buscar por nombre, especialidad, institución..." class="exp-search-input">
      </div>
      <select class="exp-filter-select" id="expEstadoFilter">
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>
    </div>

    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>EXPONENTE</th>
            <th>ESPECIALIDAD</th>
            <th>PROFESIÓN</th>
            <th>TELÉFONO / EMAIL</th>
            <th>INSTITUCIÓN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="exponentesTableBody">
          <tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="exp-modal" id="modalExponente" style="display:none;">
      <div class="exp-modal-overlay"></div>
      <div class="exp-modal-content">
        <div class="exp-modal-header">
          <h2 id="tituloModalExp">Nuevo Exponente</h2>
          <button class="exp-modal-close" id="closeModalExp">&times;</button>
        </div>
        <div class="exp-modal-body" id="modalExpBody"></div>
      </div>
    </div>
  `;
}

export async function initExponentesEvents(): Promise<void> {
  await cargarExponentes();
  document.getElementById('btnNuevoExponente')?.addEventListener('click', () => abrirModal(null));
  document.getElementById('expSearchInput')?.addEventListener('input', (e) => {
    filtroSearch = (e.target as HTMLInputElement).value;
    renderTabla();
  });
  document.getElementById('expEstadoFilter')?.addEventListener('change', (e) => {
    filtroEstado = (e.target as HTMLSelectElement).value;
    renderTabla();
  });
  document.getElementById('closeModalExp')?.addEventListener('click', cerrarModal);
  document.querySelector('#modalExponente .exp-modal-overlay')?.addEventListener('click', cerrarModal);
}

async function cargarExponentes() {
  try {
    const res = await exponenteService.getAll();
    const raw = res.data || res;
    exponentesData = Array.isArray(raw) ? raw : (raw as any).data || [];
    renderStats();
    renderTabla();
  } catch {
    mostrarToast('error', 'Error', 'No se pudieron cargar los exponentes');
  }
}

function renderStats() {
  const total = exponentesData.length;
  const activos = exponentesData.filter(e => e.estado === 'Activo').length;
  const inactivos = exponentesData.filter(e => e.estado === 'Inactivo').length;
  const elTotal = document.getElementById('expStatTotal');
  const elActivos = document.getElementById('expStatActivos');
  const elInactivos = document.getElementById('expStatInactivos');
  if (elTotal) elTotal.textContent = String(total);
  if (elActivos) elActivos.textContent = String(activos);
  if (elInactivos) elInactivos.textContent = String(inactivos);
}

function getExponentesFiltrados(): Exponente[] {
  let lista = [...exponentesData];
  if (filtroSearch.trim()) {
    const q = filtroSearch.toLowerCase();
    lista = lista.filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      (e.apellidos || '').toLowerCase().includes(q) ||
      (e.especialidad || '').toLowerCase().includes(q) ||
      (e.profesion || '').toLowerCase().includes(q) ||
      (e.institucion || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q)
    );
  }
  if (filtroEstado) lista = lista.filter(e => e.estado === filtroEstado);
  return lista;
}

function renderTabla() {
  const tbody = document.getElementById('exponentesTableBody');
  if (!tbody) return;
  const lista = getExponentesFiltrados();
  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">No se encontraron exponentes</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(e => `
    <tr>
      <td>
        <div style="font-weight:600;color:#1e293b;">${e.nombre} ${e.apellidos || ''}</div>
      </td>
      <td>${e.especialidad || '—'}</td>
      <td>${e.profesion || '—'}</td>
      <td>
        ${e.telefono ? `<div>${e.telefono}</div>` : ''}
        ${e.email ? `<div style="font-size:12px;color:#3b82f6;">${e.email}</div>` : (!e.telefono ? '—' : '')}
      </td>
      <td>${e.institucion || '—'}</td>
      <td><span class="exp-badge ${e.estado === 'Activo' ? 'exp-badge-activo' : 'exp-badge-inactivo'}">${e.estado}</span></td>
      <td>
        <div class="exp-actions-cell">
          <button class="exp-btn-icon-sm" title="Editar" data-edit="${e.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="exp-btn-icon-sm exp-btn-danger-sm" title="Eliminar" data-delete="${e.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.edit!);
      const exp = exponentesData.find(e => e.id === id);
      if (exp) abrirModal(exp);
    });
  });
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt((btn as HTMLElement).dataset.delete!);
      const exp = exponentesData.find(e => e.id === id);
      if (!exp) return;
      const ok = await confirmarAccion({ titulo: 'Eliminar Exponente', mensaje: `¿Eliminar a "<strong>${exp.nombre} ${exp.apellidos || ''}</strong>"? Esta acción no se puede deshacer.`, tipo: 'warning', textoConfirmar: 'Eliminar' });
      if (!ok) return;
      try {
        await exponenteService.delete(id);
        mostrarToast('success', 'Eliminado', 'Exponente eliminado correctamente');
        await cargarExponentes();
      } catch {
        mostrarToast('error', 'Error', 'No se pudo eliminar el exponente');
      }
    });
  });
}

function abrirModal(exp: Exponente | null) {
  const modal = document.getElementById('modalExponente');
  const titulo = document.getElementById('tituloModalExp');
  const body = document.getElementById('modalExpBody');
  if (!modal || !titulo || !body) return;
  titulo.textContent = exp ? 'Editar Exponente' : 'Nuevo Exponente';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  body.innerHTML = `
    <form id="formExponente" class="exp-form">
      <div class="exp-form-section-title">Datos personales</div>
      <div class="exp-form-row">
        <div class="exp-form-group">
          <label>Nombre *</label>
          <input type="text" name="nombre" class="exp-input" value="${exp?.nombre || ''}" required>
        </div>
        <div class="exp-form-group">
          <label>Apellidos *</label>
          <input type="text" name="apellidos" class="exp-input" value="${exp?.apellidos || ''}" required>
        </div>
      </div>
      <div class="exp-form-row">
        <div class="exp-form-group">
          <label>Especialidad</label>
          <input type="text" name="especialidad" class="exp-input" value="${exp?.especialidad || ''}" placeholder="Ej: Seguridad Industrial">
        </div>
        <div class="exp-form-group">
          <label>Profesión</label>
          <input type="text" name="profesion" class="exp-input" value="${exp?.profesion || ''}" placeholder="Ej: Ingeniero Ambiental">
        </div>
      </div>
      <div class="exp-form-group exp-col-2">
        <label>Presentación</label>
        <textarea name="presentacion" class="exp-input" rows="7" placeholder="Escribe una breve presentación del exponente...">${exp?.presentacion || ''}</textarea>
      </div>
      <div class="exp-form-section-title" style="margin-top:16px;">Contacto</div>
      <div class="exp-form-row">
        <div class="exp-form-group">
          <label>Teléfono</label>
          <input type="text" name="telefono" class="exp-input" value="${exp?.telefono || ''}">
        </div>
        <div class="exp-form-group">
          <label>Email</label>
          <input type="email" name="email" class="exp-input" value="${exp?.email || ''}">
        </div>
      </div>
      <div class="exp-form-row">
        <div class="exp-form-group exp-col-2">
          <label>Institución</label>
          <input type="text" name="institucion" class="exp-input" value="${exp?.institucion || ''}" placeholder="Ej: Universidad Nacional de Ingeniería">
        </div>
        <div class="exp-form-group">
          <label>Estado</label>
          <select name="estado" class="exp-input">
            <option value="Activo" ${(!exp || exp.estado === 'Activo') ? 'selected' : ''}>Activo</option>
            <option value="Inactivo" ${exp?.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      </div>
      <div class="exp-form-group">
        <label>Notas</label>
        <textarea name="notas" class="exp-input" rows="2">${exp?.notas || ''}</textarea>
      </div>
      <div class="exp-modal-footer">
        <button type="button" class="exp-btn-secondary" id="cancelarModalExp">Cancelar</button>
        <button type="submit" class="exp-btn-primary" id="submitExpBtn">${exp ? 'Guardar cambios' : 'Crear Exponente'}</button>
      </div>
    </form>
  `;

  document.getElementById('cancelarModalExp')?.addEventListener('click', cerrarModal);
  document.getElementById('formExponente')?.addEventListener('submit', (e) => guardarExponente(e, exp?.id));
}

async function guardarExponente(e: Event, id?: number) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const btn = document.getElementById('submitExpBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Guardando...';
  const data: Record<string, any> = {};
  new FormData(form).forEach((v, k) => { data[k] = v; });
  try {
    if (id) {
      await exponenteService.update(id, data);
      mostrarToast('success', 'Actualizado', 'Exponente actualizado correctamente');
    } else {
      await exponenteService.create(data);
      mostrarToast('success', 'Creado', 'Exponente creado correctamente');
    }
    cerrarModal();
    await cargarExponentes();
  } catch (err: any) {
    mostrarToast('error', 'Error', err?.message || 'Error al guardar');
    btn.disabled = false;
    btn.textContent = id ? 'Guardar cambios' : 'Crear Exponente';
  }
}

function cerrarModal() {
  const modal = document.getElementById('modalExponente');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}
