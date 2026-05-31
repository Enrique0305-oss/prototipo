import { cargoService } from '../../services/cargoService';
import { personalService } from '../../services/personalService';
import { mostrarToast } from '../../shared/toast';

let cargosData: any[] = [];
let areasData: any[] = [];
let filtroSearch = '';
let filtroEstado = '';
let filtroArea = '';

function escHtml(str: string): string {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function renderCargos(): string {
  return `
    <div class="tab-cargos">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0;">Gestión de Cargos</h1>
          <p style="color:#64748b;font-size:14px;margin:4px 0 0;">Administra los cargos por área</p>
        </div>
        <button id="btn-nuevo-cargo" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Cargo
        </button>
      </div>

      <!-- Estadísticas -->
      <div id="cargos-stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
        <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">Total Cargos</p>
          <p style="font-size:28px;font-weight:700;color:#1e293b;margin:4px 0 0;" id="stat-total-cargos">0</p>
        </div>
        <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">Activos</p>
          <p style="font-size:28px;font-weight:700;color:#16a34a;margin:4px 0 0;" id="stat-cargos-activos">0</p>
        </div>
        <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">Áreas</p>
          <p style="font-size:28px;font-weight:700;color:#2563eb;margin:4px 0 0;" id="stat-areas-cargos">0</p>
        </div>
      </div>

      <!-- Filtros -->
      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;position:relative;">
          <input type="text" id="filtro-search-cargos" placeholder="Buscar por nombre o descripción..." style="width:100%;padding:10px 12px 10px 36px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        </div>
        <select id="filtro-estado-cargos" style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;min-width:150px;">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select id="filtro-area-cargos" style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;min-width:150px;">
          <option value="">Todas las áreas</option>
        </select>
      </div>

      <!-- Tabla -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <table class="data-table" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Cargo</th>
              <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Área</th>
              <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Descripción</th>
              <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Estado</th>
              <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Acciones</th>
            </tr>
          </thead>
          <tbody id="tabla-cargos-body">
            <tr><td colspan="5" style="text-align:center;padding:40px;color:#94a3b8;">Cargando cargos...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function initCargosEvents() {
  cargarAreasSelect();
  cargarCargos();

  document.getElementById('btn-nuevo-cargo')?.addEventListener('click', () => abrirFormCargo());

  let debounceTimer: any;
  document.getElementById('filtro-search-cargos')?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filtroSearch = (e.target as HTMLInputElement).value;
      renderTablaCargos();
    }, 300);
  });

  document.getElementById('filtro-estado-cargos')?.addEventListener('change', (e) => {
    filtroEstado = (e.target as HTMLSelectElement).value;
    renderTablaCargos();
  });

  document.getElementById('filtro-area-cargos')?.addEventListener('change', (e) => {
    filtroArea = (e.target as HTMLSelectElement).value;
    renderTablaCargos();
  });
}

async function cargarAreasSelect() {
  try {
    const resp = await personalService.getAreasLista();
    areasData = resp.data || [];
    const sel = document.getElementById('filtro-area-cargos') as HTMLSelectElement;
    if (sel) {
      sel.innerHTML = '<option value="">Todas las áreas</option>' +
        areasData.map((a: any) => `<option value="${a.id}">${escHtml(a.nombre)}</option>`).join('');
    }
  } catch { areasData = []; }
}

async function cargarCargos() {
  try {
    const resp = await cargoService.getAll();
    cargosData = resp.data || [];
  } catch {
    cargosData = [];
    mostrarToast('error', 'Error', 'No se pudieron cargar los cargos');
  }
  renderTablaCargos();
}

function renderTablaCargos() {
  const tbody = document.getElementById('tabla-cargos-body');
  if (!tbody) return;

  let filtered = [...cargosData];
  
  if (filtroSearch) {
    const s = filtroSearch.toLowerCase();
    filtered = filtered.filter((c: any) =>
      c.nombre?.toLowerCase().includes(s) ||
      c.descripcion?.toLowerCase().includes(s)
    );
  }
  
  if (filtroEstado) {
    filtered = filtered.filter((c: any) => c.estado === filtroEstado);
  }
  
  if (filtroArea) {
    filtered = filtered.filter((c: any) => String(c.id_area) === filtroArea);
  }

  // Estadísticas
  const total = cargosData.length;
  const activos = cargosData.filter((c: any) => c.estado === 'activo').length;
  const areasUnicas = new Set(cargosData.map((c: any) => c.id_area).filter(Boolean)).size;
  
  const statTotal = document.getElementById('stat-total-cargos');
  const statActivos = document.getElementById('stat-cargos-activos');
  const statAreas = document.getElementById('stat-areas-cargos');
  
  if (statTotal) statTotal.textContent = String(total);
  if (statActivos) statActivos.textContent = String(activos);
  if (statAreas) statAreas.textContent = String(areasUnicas);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:#94a3b8;">No se encontraron cargos</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((c: any) => {
    const nombre = escHtml(c.nombre || '');
    const descripcion = escHtml(c.descripcion || '') || '—';
    const area = areasData.find((a: any) => a.id === c.id_area);
    const areaName = area ? escHtml(area.nombre) : '—';
    const esActivo = c.estado === 'activo';
    const badgeColor = esActivo ? 'background:#dcfce7;color:#16a34a;' : 'background:#fee2e2;color:#dc2626;';

    return `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:12px 16px;">
          <p style="margin:0;font-weight:600;font-size:14px;color:#1e293b;">${nombre}</p>
        </td>
        <td style="padding:12px 16px;"><span style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;background:#eff6ff;color:#2563eb;">${areaName}</span></td>
        <td style="padding:12px 16px;font-size:14px;color:#475569;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escHtml(c.descripcion || '')}">${descripcion}</td>
        <td style="padding:12px 16px;text-align:center;"><span style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;${badgeColor}">${c.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
        <td style="padding:12px 16px;text-align:center;">
          <div style="display:flex;gap:6px;justify-content:center;">
            <button class="btn-editar-cargo" data-id="${c.id}" title="Editar" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;cursor:pointer;color:#2563eb;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-toggle-cargo" data-id="${c.id}" title="${esActivo ? 'Desactivar' : 'Activar'}" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;cursor:pointer;color:${esActivo ? '#dc2626' : '#16a34a'};">
              ${esActivo
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>'
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
              }
            </button>
            <button class="btn-delete-cargo" data-id="${c.id}" data-nombre="${escHtml(c.nombre)}" title="Eliminar" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;cursor:pointer;color:#dc2626;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind events
  tbody.querySelectorAll('.btn-editar-cargo').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      const cargo = cargosData.find((c: any) => c.id === id);
      if (cargo) abrirFormCargo(cargo);
    });
  });

  tbody.querySelectorAll('.btn-toggle-cargo').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      if (!id) return;
      const cargo = cargosData.find((c: any) => c.id === id);
      if (!cargo) return;

      const accion = cargo.estado === 'activo' ? 'desactivar' : 'activar';
      const accionCapitalized = accion.charAt(0).toUpperCase() + accion.slice(1);
      const colorPrincipal = accion === 'activar' ? '#16a34a' : '#dc2626';
      const colorFondo = accion === 'activar' ? '#dcfce7' : '#fee2e2';
      
      const overlay = document.createElement('div');
      overlay.id = 'modal-confirm-toggle-cargo';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:12px;width:95%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">Confirmar Acción</h2>
            <button id="btn-cerrar-toggle-cargo" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:22px;line-height:1;">&times;</button>
          </div>
          <div style="padding:32px 24px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:${colorFondo};color:${colorPrincipal};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              ${accion === 'activar' 
                ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>'}
            </div>
            <p style="font-size:15px;color:#334155;margin-bottom:8px;">¿Estás seguro de ${accion} el cargo?</p>
            <p style="font-size:16px;font-weight:600;color:#1e293b;">${escHtml(cargo.nombre)}</p>
          </div>
          <div style="display:flex;justify-content:center;gap:12px;padding:20px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;border-radius:0 0 12px 12px;">
            <button id="btn-cancelar-toggle-cargo" style="padding:10px 20px;background:#fff;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
            <button id="btn-confirmar-toggle-cargo" style="padding:10px 20px;background:${colorPrincipal};color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${accionCapitalized}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById('btn-cerrar-toggle-cargo')?.addEventListener('click', () => overlay.remove());
      document.getElementById('btn-cancelar-toggle-cargo')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

      document.getElementById('btn-confirmar-toggle-cargo')?.addEventListener('click', async () => {
        const btnConfirm = document.getElementById('btn-confirmar-toggle-cargo') as HTMLButtonElement;
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Procesando...';
        
        try {
          await cargoService.update(id, { estado: accion === 'activar' ? 'activo' : 'inactivo' });
          mostrarToast('success', 'Éxito', `Cargo ${accion === 'activar' ? 'activado' : 'desactivado'}`);
          overlay.remove();
          await cargarCargos();
        } catch {
          mostrarToast('error', 'Error', `No se pudo ${accion} el cargo`);
          btnConfirm.disabled = false;
          btnConfirm.textContent = accionCapitalized;
        }
      });
    });
  });

  tbody.querySelectorAll('.btn-delete-cargo').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      const nombre = (btn as HTMLElement).dataset.nombre || '';
      
      const overlay = document.createElement('div');
      overlay.id = 'modal-confirm-delete-cargo';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:12px;width:95%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">Confirmar Eliminación</h2>
            <button id="btn-cerrar-delete-cargo" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:22px;line-height:1;">&times;</button>
          </div>
          <div style="padding:32px 24px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
            <p style="font-size:15px;color:#334155;margin-bottom:8px;">¿Estás seguro de eliminar el cargo?</p>
            <p style="font-size:16px;font-weight:600;color:#1e293b;">${escHtml(nombre)}</p>
            <p style="font-size:13px;color:#dc2626;margin-top:12px;font-weight:500;">Esta acción no se puede deshacer.</p>
          </div>
          <div style="display:flex;justify-content:center;gap:12px;padding:20px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;border-radius:0 0 12px 12px;">
            <button id="btn-cancelar-delete-cargo" style="padding:10px 20px;background:#fff;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
            <button id="btn-confirmar-delete-cargo" style="padding:10px 20px;background:#dc2626;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.1);">Eliminar</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById('btn-cerrar-delete-cargo')?.addEventListener('click', () => overlay.remove());
      document.getElementById('btn-cancelar-delete-cargo')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

      document.getElementById('btn-confirmar-delete-cargo')?.addEventListener('click', async () => {
        const btnConfirm = document.getElementById('btn-confirmar-delete-cargo') as HTMLButtonElement;
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Procesando...';
        
        try {
          await cargoService.delete(id);
          mostrarToast('success', 'Éxito', 'Cargo eliminado');
          overlay.remove();
          await cargarCargos();
        } catch {
          mostrarToast('error', 'Error', 'No se pudo eliminar el cargo');
          btnConfirm.disabled = false;
          btnConfirm.textContent = 'Eliminar';
        }
      });
    });
  });
}

function abrirFormCargo(cargo?: any) {
  const esEditar = !!cargo;
  const areasOptions = areasData.map((a: any) =>
    `<option value="${a.id}" ${cargo?.id_area === a.id ? 'selected' : ''}>${escHtml(a.nombre)}</option>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.id = 'modal-cargo-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:95%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">${esEditar ? 'Editar Cargo' : 'Nuevo Cargo'}</h2>
        <button id="btn-cerrar-form-cargo" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:22px;line-height:1;">&times;</button>
      </div>
      <form id="form-cargo" style="padding:24px;">
        <div>
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Área *</label>
          <select id="fc-area" required style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
            <option value="">Seleccione...</option>
            ${areasOptions}
          </select>
        </div>

        <div style="margin-top:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Nombre del Cargo *</label>
          <input type="text" id="fc-nombre" value="${escHtml(cargo?.nombre || '')}" required maxlength="100" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
        </div>

        <div style="margin-top:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Descripción</label>
          <textarea id="fc-descripcion" maxlength="500" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;min-height:80px;resize:vertical;">${escHtml(cargo?.descripcion || '')}</textarea>
          <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;"><span id="char-count">0</span>/500</p>
        </div>

        ${esEditar ? `
        <div style="margin-top:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Estado</label>
          <select id="fc-estado" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
            <option value="activo" ${cargo?.estado === 'activo' ? 'selected' : ''}>Activo</option>
            <option value="inactivo" ${cargo?.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
        ` : ''}

        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <button type="button" id="btn-cancelar-form-cargo" style="padding:10px 20px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
          <button type="submit" id="btn-submit-cargo" style="padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
            ${esEditar ? 'Guardar Cambios' : 'Crear Cargo'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  // Charcount
  const textarea = document.getElementById('fc-descripcion') as HTMLTextAreaElement;
  const charCount = document.getElementById('char-count') as HTMLElement;
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      charCount.textContent = String(textarea.value.length);
    });
    charCount.textContent = String(textarea.value.length);
  }

  document.getElementById('btn-cerrar-form-cargo')?.addEventListener('click', () => overlay.remove());
  document.getElementById('btn-cancelar-form-cargo')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('form-cargo')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-cargo') as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

    try {
      const data: any = {
        id_area: parseInt((document.getElementById('fc-area') as HTMLSelectElement).value) || null,
        nombre: (document.getElementById('fc-nombre') as HTMLInputElement).value.trim(),
        descripcion: (document.getElementById('fc-descripcion') as HTMLTextAreaElement).value.trim(),
      };

      if (esEditar) {
        const estadoSelect = document.getElementById('fc-estado') as HTMLSelectElement;
 if (estadoSelect) {
          data.estado = estadoSelect.value;
        }
      } else {
        data.estado = 'activo';
      }

      if (esEditar) {
        await cargoService.update(cargo.id, data);
        mostrarToast('success', 'Éxito', 'Cargo actualizado');
      } else {
        await cargoService.create(data);
        mostrarToast('success', 'Éxito', 'Cargo creado exitosamente');
      }
      overlay.remove();
      await cargarCargos();
    } catch (err: any) {
      let msg = 'Error al guardar';
      if (err.data?.errors) {
        msg = Object.values(err.data.errors).flat().join(', ');
      } else if (err.data?.message) {
        msg = err.data.message;
      }
      mostrarToast('error', 'Error', msg);
      const btn2 = document.getElementById('btn-submit-cargo') as HTMLButtonElement;
      if (btn2) { btn2.disabled = false; btn2.textContent = esEditar ? 'Guardar Cambios' : 'Crear Cargo'; }
    }
  });
}
