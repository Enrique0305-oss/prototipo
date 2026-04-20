import { personalService } from '../../services/personalService';
import { cargoService } from '../../services/cargoService';
import { tecnicoService } from '../../services/tecnicoService';
import { mostrarToast } from '../../shared/toast';
import { renderCargos, initCargosEvents } from './cargos.view';

let usuariosData: any[] = [];
let areasData: any[] = [];
let filtroSearch = '';
let filtroEstado = '';
let filtroArea = '';
let tecnicosData: any[] = [];

function escHtml(str: string): string {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function renderUsuarios(): string {
  return `
    <!-- Tabs Navigation -->
    <div style="display:flex;gap:0;margin-bottom:24px;border-bottom:2px solid #e2e8f0;background:#fff;border-radius:12px 12px 0 0;padding:0 16px;">
      <button id="tab-usuarios" class="tab-button active" style="flex:0 0 auto;padding:16px 20px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:600;color:#64748b;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.3s ease;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;margin-right:8px;vertical-align:middle;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Usuarios
      </button>
      <button id="tab-cargos" class="tab-button" style="flex:0 0 auto;padding:16px 20px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:600;color:#64748b;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.3s ease;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;margin-right:8px;vertical-align:middle;"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><path d="M8 9h8m-8 4h5"></path></svg>
        Cargos
      </button>
    </div>

    <!-- Tab Usuarios Content -->
    <div id="content-usuarios" class="tab-content active" style="display:block;">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0;">Gestión de Usuarios</h1>
          <p style="color:#64748b;font-size:14px;margin:4px 0 0;">Administra los usuarios del sistema</p>
        </div>
        <button id="btn-nuevo-usuario" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Estadísticas -->
      <div id="usuarios-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
        <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">Total Usuarios</p>
          <p style="font-size:28px;font-weight:700;color:#1e293b;margin:4px 0 0;" id="stat-total">0</p>
        </div>
        <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">Activos</p>
          <p style="font-size:28px;font-weight:700;color:#16a34a;margin:4px 0 0;" id="stat-activos">0</p>
        </div>
        <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">Inactivos</p>
          <p style="font-size:28px;font-weight:700;color:#dc2626;margin:4px 0 0;" id="stat-inactivos">0</p>
        </div>
        <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">Áreas</p>
          <p style="font-size:28px;font-weight:700;color:#2563eb;margin:4px 0 0;" id="stat-areas">0</p>
        </div>
      </div>

      <!-- Filtros -->
      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;position:relative;">
          <input type="text" id="filtro-search-usuarios" placeholder="Buscar por nombre, usuario o correo..." style="width:100%;padding:10px 12px 10px 36px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        </div>
        <select id="filtro-estado-usuarios" style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;min-width:150px;">
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <select id="filtro-area-usuarios" style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;min-width:150px;">
          <option value="">Todas las áreas</option>
        </select>
      </div>

      <!-- Tabla -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <table class="data-table" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Usuario</th>
              <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Correo</th>
              <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Celular</th>
              <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Área</th>
              <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Estado</th>
              <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;">Acciones</th>
            </tr>
          </thead>
          <tbody id="tabla-usuarios-body">
            <tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">Cargando usuarios...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab Cargos Content (will be injected via initUsuariosEvents) -->
    <div id="content-cargos" class="tab-content" style="display:none;"></div>
  `;
}

export function initUsuariosEvents() {
  cargarAreas();
  cargarUsuarios();

  document.getElementById('btn-nuevo-usuario')?.addEventListener('click', () => abrirFormUsuario());

  // ===== TAB SWITCHING =====
  const tabUsuariosBtn = document.getElementById('tab-usuarios') as HTMLButtonElement;
  const tabCargosBtn = document.getElementById('tab-cargos') as HTMLButtonElement;
  const contentUsuarios = document.getElementById('content-usuarios') as HTMLElement;
  const contentCargos = document.getElementById('content-cargos') as HTMLElement;

  if (tabUsuariosBtn && tabCargosBtn && contentUsuarios && contentCargos) {
    const tabButtons = [tabUsuariosBtn, tabCargosBtn];

    tabUsuariosBtn.addEventListener('click', () => {
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = '#64748b';
        btn.style.borderBottomColor = 'transparent';
      });
      tabUsuariosBtn.classList.add('active');
      tabUsuariosBtn.style.color = '#2563eb';
      tabUsuariosBtn.style.borderBottomColor = '#2563eb';
      contentUsuarios.style.display = 'block';
      contentCargos.style.display = 'none';
    });

    tabCargosBtn.addEventListener('click', () => {
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = '#64748b';
        btn.style.borderBottomColor = 'transparent';
      });
      tabCargosBtn.classList.add('active');
      tabCargosBtn.style.color = '#2563eb';
      tabCargosBtn.style.borderBottomColor = '#2563eb';
      contentUsuarios.style.display = 'none';
      contentCargos.style.display = 'block';
      
      // Inyectar contenido de cargos si no existe
      if (!contentCargos.innerHTML.trim()) {
        contentCargos.innerHTML = renderCargos();
        setTimeout(() => initCargosEvents(), 0);
      }
    });

    // Aplicar estilos iniciales al tab activo
    tabUsuariosBtn.style.color = '#2563eb';
    tabUsuariosBtn.style.borderBottomColor = '#2563eb';
  }

  let debounceTimer: any;
  document.getElementById('filtro-search-usuarios')?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filtroSearch = (e.target as HTMLInputElement).value;
      renderTabla();
    }, 300);
  });

  document.getElementById('filtro-estado-usuarios')?.addEventListener('change', (e) => {
    filtroEstado = (e.target as HTMLSelectElement).value;
    renderTabla();
  });

  document.getElementById('filtro-area-usuarios')?.addEventListener('change', (e) => {
    filtroArea = (e.target as HTMLSelectElement).value;
    renderTabla();
  });
}

async function cargarAreas() {
  try {
    const resp = await personalService.getAreasLista();
    areasData = resp.data || [];
    const sel = document.getElementById('filtro-area-usuarios') as HTMLSelectElement;
    if (sel) {
      sel.innerHTML = '<option value="">Todas las áreas</option>' +
        areasData.map((a: any) => `<option value="${a.id}">${escHtml(a.nombre)}</option>`).join('');
    }
  } catch { areasData = []; }
}

async function cargarUsuarios() {
  try {
    const resp = await personalService.getUsuarios();
    usuariosData = resp.data || [];
  } catch {
    usuariosData = [];
    mostrarToast('error', 'Error', 'No se pudieron cargar los usuarios');
  }
  renderTabla();
}

async function cargarTecnicos() {
  try {
    const resp = await tecnicoService.getAll({ estado: 'todos' } as any);
    tecnicosData = resp.data || [];
  } catch {
    tecnicosData = [];
  }
}

function renderTabla() {
  const tbody = document.getElementById('tabla-usuarios-body');
  if (!tbody) return;

  let filtered = [...usuariosData];
  if (filtroSearch) {
    const s = filtroSearch.toLowerCase();
    filtered = filtered.filter((u: any) =>
      (u.nombre + ' ' + u.apellidos).toLowerCase().includes(s) ||
      u.usuario?.toLowerCase().includes(s) ||
      u.correo?.toLowerCase().includes(s)
    );
  }
  if (filtroEstado) {
    filtered = filtered.filter((u: any) => u.estado === filtroEstado);
  }
  if (filtroArea) {
    filtered = filtered.filter((u: any) => String(u.id_area) === filtroArea);
  }

  // Stats
  const total = usuariosData.length;
  const activos = usuariosData.filter((u: any) => u.estado === 'Activo').length;
  const inactivos = total - activos;
  const areasUnicas = new Set(usuariosData.map((u: any) => u.id_area).filter(Boolean)).size;
  const statTotal = document.getElementById('stat-total');
  const statActivos = document.getElementById('stat-activos');
  const statInactivos = document.getElementById('stat-inactivos');
  const statAreas = document.getElementById('stat-areas');
  if (statTotal) statTotal.textContent = String(total);
  if (statActivos) statActivos.textContent = String(activos);
  if (statInactivos) statInactivos.textContent = String(inactivos);
  if (statAreas) statAreas.textContent = String(areasUnicas);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">No se encontraron usuarios</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((u: any) => {
    const nombre = escHtml(u.nombre + ' ' + u.apellidos);
    const usuario = escHtml(u.usuario || '');
    const correo = escHtml(u.correo || '');
    const celular = escHtml(u.celular || '');
    const area = u.area ? escHtml(u.area.nombre) : '—';
    const esActivo = u.estado === 'Activo';
    const badgeColor = esActivo ? 'background:#dcfce7;color:#16a34a;' : 'background:#fee2e2;color:#dc2626;';

    return `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:12px 16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;">
              ${escHtml((u.nombre || '')[0] + (u.apellidos || '')[0])}
            </div>
            <div>
              <p style="margin:0;font-weight:600;font-size:14px;color:#1e293b;">${nombre}</p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">@${usuario}</p>
            </div>
          </div>
        </td>
        <td style="padding:12px 16px;font-size:14px;color:#475569;">${correo}</td>
        <td style="padding:12px 16px;font-size:14px;color:#475569;">${celular}</td>
        <td style="padding:12px 16px;"><span style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;background:#eff6ff;color:#2563eb;">${area}</span></td>
        <td style="padding:12px 16px;text-align:center;"><span style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;${badgeColor}">${u.estado}</span></td>
        <td style="padding:12px 16px;text-align:center;">
          <div style="display:flex;gap:6px;justify-content:center;">
            <button class="btn-editar-usuario" data-id="${u.id}" title="Editar" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;cursor:pointer;color:#2563eb;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-toggle-usuario" data-id="${u.id}" title="${esActivo ? 'Desactivar' : 'Activar'}" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;cursor:pointer;color:${esActivo ? '#dc2626' : '#16a34a'};">
              ${esActivo
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>'
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
              }
            </button>
            <button class="btn-reset-password" data-id="${u.id}" data-nombre="${escHtml(u.nombre)}" title="Restablecer contraseña" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;cursor:pointer;color:#f59e0b;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind events
  tbody.querySelectorAll('.btn-editar-usuario').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      const user = usuariosData.find((u: any) => u.id === id);
      if (user) abrirFormUsuario(user);
    });
  });

  tbody.querySelectorAll('.btn-toggle-usuario').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      if (!id) return;
      const user = usuariosData.find((u: any) => u.id === id);
      const accion = user?.estado === 'Activo' ? 'desactivar' : 'activar';
      if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${user?.nombre} ${user?.apellidos}?`)) return;
      try {
        await personalService.toggleEstado(id);
        mostrarToast('success', 'Éxito', `Usuario ${accion === 'activar' ? 'activado' : 'desactivado'}`);
        await cargarUsuarios();
      } catch {
        mostrarToast('error', 'Error', `No se pudo ${accion} el usuario`);
      }
    });
  });

  tbody.querySelectorAll('.btn-reset-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      const nombre = (btn as HTMLElement).dataset.nombre || '';
      if (id) abrirResetPassword(id, nombre);
    });
  });
}

function abrirFormUsuario(usuario?: any) {
  const esEditar = !!usuario;
  const tecnico = usuario?.tecnico || null;
  const esTecnicoInicial = !!tecnico;
  const areasOptions = areasData.map((a: any) =>
    `<option value="${a.id}" ${usuario?.id_area === a.id ? 'selected' : ''}>${escHtml(a.nombre)}</option>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.id = 'modal-usuario-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:95%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">${esEditar ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        <button id="btn-cerrar-form-usuario" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:22px;line-height:1;">&times;</button>
      </div>
      <form id="form-usuario" style="padding:24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Nombre *</label>
            <input type="text" id="fu-nombre" value="${escHtml(usuario?.nombre || '')}" required style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Apellidos *</label>
            <input type="text" id="fu-apellidos" value="${escHtml(usuario?.apellidos || '')}" required style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Usuario *</label>
            <input type="text" id="fu-usuario" value="${escHtml(usuario?.usuario || '')}" required style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Correo *</label>
            <input type="email" id="fu-correo" value="${escHtml(usuario?.correo || '')}" required style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Celular *</label>
            <input type="text" id="fu-celular" value="${escHtml(usuario?.celular || '')}" required maxlength="13" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
          </div>
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Área *</label>
            <select id="fu-area" required style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
              <option value="">Seleccione...</option>
              ${areasOptions}
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Cargo</label>
            <select id="fu-cargo" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
              <option value="">Seleccione área primero...</option>
            </select>
          </div>
        </div>

        <div style="margin-top:16px;padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#334155;cursor:pointer;">
            <input type="checkbox" id="fu-es-tecnico" ${esTecnicoInicial ? 'checked' : ''}>
            Es técnico
          </label>
          <p style="margin:6px 0 0;font-size:12px;color:#64748b;">Si se activa, vincula este usuario con un técnico existente.</p>
        </div>

        <div id="fu-tecnico-fields" style="margin-top:12px;display:${esTecnicoInicial ? 'block' : 'none'};padding:12px;border:1px solid #cbd5e1;border-radius:8px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Técnico vinculado *</label>
          <select id="fu-id-tecnico" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;">
            <option value="">Cargando técnicos...</option>
          </select>
          <p style="margin:6px 0 0;font-size:12px;color:#64748b;">Solo se listan técnicos disponibles o el actualmente vinculado.</p>
        </div>

        ${!esEditar ? `
        <div style="margin-top:16px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Contraseña *</label>
          <input type="password" id="fu-password" required minlength="6" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="Mínimo 6 caracteres">
        </div>
        ` : ''}

        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <button type="button" id="btn-cancelar-form-usuario" style="padding:10px 20px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
          <button type="submit" id="btn-submit-usuario" style="padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
            ${esEditar ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btn-cerrar-form-usuario')?.addEventListener('click', () => overlay.remove());
  document.getElementById('btn-cancelar-form-usuario')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const checkEsTecnico = document.getElementById('fu-es-tecnico') as HTMLInputElement | null;
  const tecnicoFields = document.getElementById('fu-tecnico-fields') as HTMLDivElement | null;
  const tecnicoSelect = document.getElementById('fu-id-tecnico') as HTMLSelectElement | null;

  const renderTecnicosSelect = () => {
    if (!tecnicoSelect) return;
    const tecnicoActualId = Number(tecnico?.id || 0);
    const disponibles = tecnicosData.filter((t: any) => {
      const ligado = Number(t.id_personal || 0);
      return !ligado || ligado === Number(usuario?.id || 0) || Number(t.id || 0) === tecnicoActualId;
    });

    if (disponibles.length === 0) {
      tecnicoSelect.innerHTML = '<option value="">No hay técnicos disponibles</option>';
      return;
    }

    tecnicoSelect.innerHTML = '<option value="">Seleccione técnico...</option>' +
      disponibles.map((t: any) => {
        const nombre = `${t.nombre || ''} ${t.apellidos || ''}`.trim();
        const extra = t.dni ? ` - DNI ${t.dni}` : '';
        const selected = Number(t.id || 0) === tecnicoActualId ? 'selected' : '';
        return `<option value="${t.id}" ${selected}>${escHtml(nombre + extra)}</option>`;
      }).join('');
  };

  const refrescarCamposTecnico = () => {
    const activo = !!checkEsTecnico?.checked;
    if (tecnicoFields) tecnicoFields.style.display = activo ? 'block' : 'none';
    if (tecnicoSelect) {
      tecnicoSelect.required = activo;
      if (!activo) tecnicoSelect.value = '';
    }
  };

  checkEsTecnico?.addEventListener('change', refrescarCamposTecnico);
  refrescarCamposTecnico();

  cargarTecnicos().then(() => {
    renderTecnicosSelect();
    refrescarCamposTecnico();
  });

  document.getElementById('form-usuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const esTecnico = !!(document.getElementById('fu-es-tecnico') as HTMLInputElement | null)?.checked;
    const tecnicoVinculadoId = parseInt((document.getElementById('fu-id-tecnico') as HTMLSelectElement | null)?.value || '0') || null;

    if (esTecnico && !tecnicoVinculadoId) {
      mostrarToast('warning', 'Campo requerido', 'Seleccione el técnico a vincular');
      return;
    }

    const data: any = {
      nombre: (document.getElementById('fu-nombre') as HTMLInputElement).value.trim(),
      apellidos: (document.getElementById('fu-apellidos') as HTMLInputElement).value.trim(),
      usuario: (document.getElementById('fu-usuario') as HTMLInputElement).value.trim(),
      correo: (document.getElementById('fu-correo') as HTMLInputElement).value.trim(),
      celular: (document.getElementById('fu-celular') as HTMLInputElement).value.trim(),
      id_area: parseInt((document.getElementById('fu-area') as HTMLSelectElement).value) || null,
      id_cargo: parseInt((document.getElementById('fu-cargo') as HTMLSelectElement).value) || null,
      es_tecnico: esTecnico,
      id_tecnico_vinculado: esTecnico ? tecnicoVinculadoId : null,
    };

    if (!esEditar) {
      data.password = (document.getElementById('fu-password') as HTMLInputElement).value;
    }

    const btn = document.getElementById('btn-submit-usuario') as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

    try {
      if (esEditar) {
        await personalService.updateUsuario(usuario.id, data);
        mostrarToast('success', 'Éxito', 'Usuario actualizado');
      } else {
        await personalService.createUsuario(data);
        mostrarToast('success', 'Éxito', 'Usuario creado exitosamente');
      }
      overlay.remove();
      await cargarUsuarios();
    } catch (err: any) {
      let msg = 'Error al guardar';
      if (err.data?.errors) {
        msg = Object.values(err.data.errors).flat().join(', ');
      } else if (err.data?.message) {
        msg = err.data.message;
      }
      mostrarToast('error', 'Error', msg);
      if (btn) { btn.disabled = false; btn.textContent = esEditar ? 'Guardar Cambios' : 'Crear Usuario'; }
    }
  });

  // Event listener para cambios en el área - cargar cargos disponibles
  const areaSelect = document.getElementById('fu-area') as HTMLSelectElement;
  const cargoSelect = document.getElementById('fu-cargo') as HTMLSelectElement;
  
  areaSelect?.addEventListener('change', async (e) => {
    const idArea = parseInt((e.target as HTMLSelectElement).value);
    
    if (!idArea) {
      cargoSelect!.innerHTML = '<option value="">Seleccione área primero...</option>';
      return;
    }

    try {
      const res = await cargoService.getByArea(idArea);
      const cargos = res.data || [];
      
      if (cargos.length === 0) {
        cargoSelect!.innerHTML = '<option value="">No hay cargos disponibles</option>';
      } else {
        let html = '<option value="">Seleccione cargo...</option>';
        cargos.forEach((cargo: any) => {
          html += `<option value="${cargo.id}" ${usuario?.id_cargo === cargo.id ? 'selected' : ''}>${escHtml(cargo.nombre)}</option>`;
        });
        cargoSelect!.innerHTML = html;
      }
    } catch (err) {
      console.error('Error cargando cargos:', err);
      cargoSelect!.innerHTML = '<option value="">Error al cargar cargos</option>';
    }
  });

  // Si hay usuario editándose, triggerear el cargue de cargos
  if (usuario && usuario.id_area) {
    const event = new Event('change');
    areaSelect?.dispatchEvent(event);
  }
}

function abrirResetPassword(id: number, nombre: string) {
  const overlay = document.createElement('div');
  overlay.id = 'modal-reset-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:95%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
        <h2 style="margin:0;font-size:16px;font-weight:700;color:#1e293b;">Restablecer Contraseña</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Usuario: <strong>${escHtml(nombre)}</strong></p>
      </div>
      <form id="form-reset-password" style="padding:24px;">
        <div>
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Nueva Contraseña *</label>
          <input type="password" id="rp-password" required minlength="6" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="Mínimo 6 caracteres">
        </div>
        <div style="margin-top:12px;">
          <label style="display:block;font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;">Confirmar Contraseña *</label>
          <input type="password" id="rp-confirm" required minlength="6" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;" placeholder="Repita la contraseña">
        </div>
        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <button type="button" id="btn-cancelar-reset" style="padding:10px 20px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;color:#475569;">Cancelar</button>
          <button type="submit" id="btn-submit-reset" style="padding:10px 20px;background:#f59e0b;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">Restablecer</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btn-cancelar-reset')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('form-reset-password')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = (document.getElementById('rp-password') as HTMLInputElement).value;
    const confirm = (document.getElementById('rp-confirm') as HTMLInputElement).value;

    if (pass !== confirm) {
      mostrarToast('warning', 'Atención', 'Las contraseñas no coinciden');
      return;
    }

    const btn = document.getElementById('btn-submit-reset') as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

    try {
      await personalService.resetPassword(id, pass);
      mostrarToast('success', 'Éxito', 'Contraseña restablecida. El usuario deberá iniciar sesión nuevamente.');
      overlay.remove();
    } catch {
      mostrarToast('error', 'Error', 'No se pudo restablecer la contraseña');
      if (btn) { btn.disabled = false; btn.textContent = 'Restablecer'; }
    }
  });
}
