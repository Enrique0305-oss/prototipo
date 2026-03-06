// Almacén - Proveedores View (funcional)
import './proveedores.css';
import { proveedorService, type Proveedor } from './proveedores.service';
import { mostrarToast, confirmarAccion } from '../../../shared/toast';

let proveedoresData: Proveedor[] = [];
let filtroSearch = '';
let filtroEstado = '';

export function renderAlmacenProveedores(): string {
  return `
    <div class="prov-page-header">
      <div class="prov-breadcrumb">Gestión de Proveedores</div>
      <div class="prov-actions">
        <button class="prov-btn-primary" id="btnNuevoProveedor">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Proveedor
        </button>
      </div>
    </div>

    <div class="prov-filters-bar">
      <div class="prov-search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="provSearchInput" placeholder="Buscar por razón social o RUC..." class="prov-search-input">
      </div>
      <select class="prov-filter-select" id="provEstadoFilter">
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>
    </div>

    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>PROVEEDOR</th>
            <th>RUC</th>
            <th>CONTACTO</th>
            <th>TELÉFONO / EMAIL</th>
            <th>BANCO / CUENTA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="proveedoresTableBody">
          <tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="prov-modal" id="modalProveedor" style="display:none;">
      <div class="prov-modal-overlay"></div>
      <div class="prov-modal-content">
        <div class="prov-modal-header">
          <h2 id="tituloModalProv">Nuevo Proveedor</h2>
          <button class="prov-modal-close" id="closeModalProv">&times;</button>
        </div>
        <div class="prov-modal-body" id="modalProvBody"></div>
      </div>
    </div>
  `;
}

export async function initProveedoresEvents(): Promise<void> {
  await cargarProveedores();
  document.getElementById('btnNuevoProveedor')?.addEventListener('click', () => abrirModal(null));
  document.getElementById('provSearchInput')?.addEventListener('input', (e) => {
    filtroSearch = (e.target as HTMLInputElement).value;
    renderTabla();
  });
  document.getElementById('provEstadoFilter')?.addEventListener('change', (e) => {
    filtroEstado = (e.target as HTMLSelectElement).value;
    renderTabla();
  });
  document.getElementById('closeModalProv')?.addEventListener('click', cerrarModal);
  document.querySelector('#modalProveedor .prov-modal-overlay')?.addEventListener('click', cerrarModal);
}

async function cargarProveedores() {
  try {
    const res = await proveedorService.getAll();
    proveedoresData = res.data || [];
    renderTabla();
  } catch {
    mostrarToast('error', 'Error', 'No se pudieron cargar los proveedores');
  }
}

function getProveedoresFiltrados(): Proveedor[] {
  let lista = [...proveedoresData];
  if (filtroSearch.trim()) {
    const q = filtroSearch.toLowerCase();
    lista = lista.filter(p =>
      p.razon_social.toLowerCase().includes(q) ||
      (p.ruc || '').toLowerCase().includes(q) ||
      (p.nombre_comercial || '').toLowerCase().includes(q)
    );
  }
  if (filtroEstado) lista = lista.filter(p => p.estado === filtroEstado);
  return lista;
}

function renderTabla() {
  const tbody = document.getElementById('proveedoresTableBody');
  if (!tbody) return;
  const lista = getProveedoresFiltrados();
  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">No se encontraron proveedores</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(p => `
    <tr>
      <td>
        <div style="font-weight:600;color:#1e293b;">${p.razon_social}</div>
        ${p.nombre_comercial ? `<div style="font-size:12px;color:#64748b;">${p.nombre_comercial}</div>` : ''}
      </td>
      <td>${p.ruc || '—'}</td>
      <td>${p.contacto_nombre || '—'}</td>
      <td>
        ${p.contacto_telefono ? `<div>${p.contacto_telefono}</div>` : ''}
        ${p.contacto_email ? `<div style="font-size:12px;color:#3b82f6;">${p.contacto_email}</div>` : (!p.contacto_telefono ? '—' : '')}
      </td>
      <td>
        ${p.banco ? `<div style="font-size:12px;">${p.banco}</div>` : ''}
        ${p.numero_cuenta ? `<div style="font-size:11px;color:#64748b;">${p.numero_cuenta}</div>` : ''}
        ${p.cci ? `<div style="font-size:11px;color:#94a3b8;">CCI: ${p.cci}</div>` : (!p.banco ? '—' : '')}
      </td>
      <td><span class="prov-badge ${p.estado === 'Activo' ? 'prov-badge-activo' : 'prov-badge-inactivo'}">${p.estado}</span></td>
      <td>
        <div class="prov-actions-cell">
          <button class="prov-btn-icon-sm" title="Editar" data-edit="${p.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="prov-btn-icon-sm prov-btn-danger-sm" title="Eliminar" data-delete="${p.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.edit!);
      const prov = proveedoresData.find(p => p.id === id);
      if (prov) abrirModal(prov);
    });
  });
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt((btn as HTMLElement).dataset.delete!);
      const prov = proveedoresData.find(p => p.id === id);
      if (!prov) return;
      const ok = await confirmarAccion({ titulo: 'Eliminar Proveedor', mensaje: `¿Eliminar a "<strong>${prov.razon_social}</strong>"? Esta acción no se puede deshacer.`, tipo: 'warning', textoConfirmar: 'Eliminar' });
      if (!ok) return;
      try {
        await proveedorService.delete(id);
        mostrarToast('success', 'Eliminado', 'Proveedor eliminado correctamente');
        await cargarProveedores();
      } catch {
        mostrarToast('error', 'Error', 'No se pudo eliminar el proveedor');
      }
    });
  });
}

function abrirModal(prov: Proveedor | null) {
  const modal = document.getElementById('modalProveedor');
  const titulo = document.getElementById('tituloModalProv');
  const body = document.getElementById('modalProvBody');
  if (!modal || !titulo || !body) return;
  titulo.textContent = prov ? 'Editar Proveedor' : 'Nuevo Proveedor';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  body.innerHTML = `
    <form id="formProveedor" class="prov-form">
      <div class="prov-form-section-title">Datos de la empresa</div>
      <div class="prov-form-row">
        <div class="prov-form-group prov-col-2">
          <label>Razón Social *</label>
          <input type="text" name="razon_social" class="prov-input" value="${prov?.razon_social || ''}" required>
        </div>
        <div class="prov-form-group">
          <label>RUC</label>
          <input type="text" name="ruc" class="prov-input" value="${prov?.ruc || ''}" maxlength="20" placeholder="20XXXXXXXXX">
        </div>
      </div>
      <div class="prov-form-row">
        <div class="prov-form-group prov-col-2">
          <label>Nombre Comercial</label>
          <input type="text" name="nombre_comercial" class="prov-input" value="${prov?.nombre_comercial || ''}">
        </div>
        <div class="prov-form-group">
          <label>Estado</label>
          <select name="estado" class="prov-input">
            <option value="Activo" ${(!prov || prov.estado === 'Activo') ? 'selected' : ''}>Activo</option>
            <option value="Inactivo" ${prov?.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      </div>
      <div class="prov-form-group">
        <label>Dirección</label>
        <input type="text" name="direccion" class="prov-input" value="${prov?.direccion || ''}">
      </div>
      <div class="prov-form-section-title" style="margin-top:16px;">Contacto</div>
      <div class="prov-form-row">
        <div class="prov-form-group">
          <label>Nombre del Contacto</label>
          <input type="text" name="contacto_nombre" class="prov-input" value="${prov?.contacto_nombre || ''}">
        </div>
        <div class="prov-form-group">
          <label>Teléfono</label>
          <input type="text" name="contacto_telefono" class="prov-input" value="${prov?.contacto_telefono || ''}">
        </div>
        <div class="prov-form-group">
          <label>Email</label>
          <input type="email" name="contacto_email" class="prov-input" value="${prov?.contacto_email || ''}">
        </div>
      </div>
      <div class="prov-form-section-title" style="margin-top:16px;">Datos bancarios</div>
      <div class="prov-form-row">
        <div class="prov-form-group">
          <label>Banco</label>
          <input type="text" name="banco" class="prov-input" value="${prov?.banco || ''}" placeholder="BCP, Interbank...">
        </div>
        <div class="prov-form-group">
          <label>Número de Cuenta</label>
          <input type="text" name="numero_cuenta" class="prov-input" value="${prov?.numero_cuenta || ''}">
        </div>
        <div class="prov-form-group">
          <label>CCI</label>
          <input type="text" name="cci" class="prov-input" value="${prov?.cci || ''}">
        </div>
      </div>
      <div class="prov-form-group">
        <label>Observaciones</label>
        <textarea name="observaciones" class="prov-input" rows="2">${prov?.observaciones || ''}</textarea>
      </div>
      <div class="prov-modal-footer">
        <button type="button" class="prov-btn-secondary" id="cancelarModalProv">Cancelar</button>
        <button type="submit" class="prov-btn-primary" id="submitProvBtn">${prov ? 'Guardar cambios' : 'Crear Proveedor'}</button>
      </div>
    </form>
  `;

  document.getElementById('cancelarModalProv')?.addEventListener('click', cerrarModal);
  document.getElementById('formProveedor')?.addEventListener('submit', (e) => guardarProveedor(e, prov?.id));
}

async function guardarProveedor(e: Event, id?: number) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const btn = document.getElementById('submitProvBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Guardando...';
  const data: Record<string, any> = {};
  new FormData(form).forEach((v, k) => { data[k] = v; });
  try {
    if (id) {
      await proveedorService.update(id, data);
      mostrarToast('success', 'Actualizado', 'Proveedor actualizado correctamente');
    } else {
      await proveedorService.create(data);
      mostrarToast('success', 'Creado', 'Proveedor creado correctamente');
    }
    cerrarModal();
    await cargarProveedores();
  } catch (err: any) {
    mostrarToast('error', 'Error', err?.message || 'Error al guardar');
    btn.disabled = false;
    btn.textContent = id ? 'Guardar cambios' : 'Crear Proveedor';
  }
}

function cerrarModal() {
  const modal = document.getElementById('modalProveedor');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}
