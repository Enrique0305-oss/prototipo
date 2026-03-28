// Almacén - Mantenimiento de Equipos View (con Tabs: Mantenimiento + Gestión de Equipos)
import { equipoService } from '../../../services/equipoService';
import { mantenimientoService } from '../../../services/mantenimientoService';
import { actividadMantenimientoService } from '../../../services/actividadMantenimientoService';
import { mostrarToast } from '../../../shared/toast';
import type { Equipo, Mantenimiento, ActividadMantenimiento, ProgramacionMantenimiento, PreviewFecha } from '../../../core/api/types';

// ============================================================
// ESTADO GLOBAL TAB MANTENIMIENTO
// ============================================================
let mantenimientos: Mantenimiento[] = [];
let equiposLista: Equipo[] = [];
let actividadesLista: ActividadMantenimiento[] = [];
let mntFiltroEquipo = '';
let mntFiltroActividad = '';
let mntFiltroDesde = '';
let mntFiltroHasta = '';
let mntEditId: number | null = null;

// ============================================================
// ESTADO GLOBAL TAB PROGRAMACIÓN ANUAL
// ============================================================
let programaciones: ProgramacionMantenimiento[] = [];
let progFiltroAnio = new Date().getFullYear();
let progFiltroEquipo = '';
let progTipoMantenimiento: 'Preventivo' | 'Correctivo' = 'Preventivo';
let progVista: 'lista' | 'calendario' = 'lista';
let progMesCalendario = new Date().getMonth() + 1;
let previewFechas: PreviewFecha[] = [];
let expandedProgramacion: number | null = null;

let progDiaSeleccionado: number | null = null;
let progMantenimientosDelDia: Array<{ id: number; equipo: string; motivo: string; estado: string; mntId: number }> = [];

// ============================================================
// TAB: MANTENIMIENTO (dinámico, conectado al backend)
// ============================================================
function renderMantenimientoTab() {
  return `
    <!-- Stats Cards -->
    <div class="op-stats-grid">
      <div class="op-stat-card">
        <div class="op-stat-icon op-stat-blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
          </svg>
        </div>
        <div class="op-stat-info">
          <span class="op-stat-label">Total Mantenimientos</span>
          <span class="op-stat-value" id="stat-total-mant">--</span>
        </div>
      </div>
      <div class="op-stat-card">
        <div class="op-stat-icon op-stat-warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="op-stat-info">
          <span class="op-stat-label">Próximos Programados</span>
          <span class="op-stat-value" id="stat-proximos-mant">--</span>
        </div>
      </div>
      <div class="op-stat-card">
        <div class="op-stat-icon op-stat-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="op-stat-info">
          <span class="op-stat-label">Último Mantenimiento</span>
          <span class="op-stat-value" id="stat-ultimo-mant" style="font-size:14px;">--</span>
        </div>
      </div>
      <div class="op-stat-card">
        <div class="op-stat-icon op-stat-green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        </div>
        <div class="op-stat-info">
          <span class="op-stat-label">Top Equipo</span>
          <span class="op-stat-value" id="stat-top-equipo" style="font-size:13px;">--</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="op-filters-bar">
      <div class="op-filter-group" style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; width:100%;">
        <select id="mnt-filter-equipo" class="op-filter-select" style="min-width:200px;">
          <option value="">Todos los equipos</option>
        </select>
        <select id="mnt-filter-actividad" class="op-filter-select" style="min-width:180px;">
          <option value="">Todos los motivos</option>
        </select>
        <input type="date" id="mnt-filter-desde" class="op-filter-select" style="min-width:150px;" title="Desde">
        <input type="date" id="mnt-filter-hasta" class="op-filter-select" style="min-width:150px;" title="Hasta">
      </div>
    </div>

    <!-- Tabla de mantenimientos -->
    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>EQUIPO</th>
            <th>MOTIVO</th>
            <th>FECHA</th>
            <th>OBSERVACIONES</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="mantenimientos-tbody">
          <tr><td colspan="6" style="text-align:center; padding:40px; color:#94a3b8;">Cargando mantenimientos...</td></tr>
        </tbody>
      </table>
    </div>

    <div id="mant-total-info" style="margin-top:12px; font-size:13px; color:#64748b;"></div>

    <!-- Modal Crear/Editar Mantenimiento -->
    <div id="modal-mantenimiento" class="modal-overlay" style="display:none;">
      <div class="modal-container" style="max-width:560px;">
        <div class="modal-header">
          <h2 id="modal-mant-titulo">Agendar Mantenimiento</h2>
          <button class="modal-close" id="btn-cerrar-modal-mant">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="form-mantenimiento" class="modal-body">
          <input type="hidden" id="mant-edit-id" value="">
          <div class="form-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Equipo *</label>
              <select id="mant-equipo" class="search-input" style="width:100%; padding:10px;" required>
                <option value="">Seleccione equipo...</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Motivo *</label>
              <select id="mant-actividad" class="search-input" style="width:100%; padding:10px;" required>
                <option value="">Seleccione motivo...</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Fecha *</label>
              <input type="date" id="mant-fecha" class="search-input" style="width:100%;" required>
            </div>
            <div style="grid-column:1/-1;">
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Observaciones <span id="mant-obs-count" style="color:#94a3b8; font-weight:400;">(0/100)</span></label>
              <textarea id="mant-observaciones" class="search-input" style="width:100%; min-height:80px; resize:vertical;" maxlength="100" placeholder="Descripción del mantenimiento (opcional)..."></textarea>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
            <button type="button" id="btn-cancelar-mant" style="padding:10px 20px; border:1px solid #d1d5db; border-radius:8px; background:#fff; cursor:pointer; font-size:14px;">Cancelar</button>
            <button type="submit" class="btn-primary" style="padding:10px 24px;">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar Eliminar Mantenimiento -->
    <div id="modal-eliminar-mant" class="modal-overlay" style="display:none;">
      <div class="modal-container" style="max-width:420px; text-align:center; padding:32px;">
        <div style="width:48px; height:48px; border-radius:50%; background:#fef2f2; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3 style="margin:0 0 8px;">¿Eliminar mantenimiento?</h3>
        <p id="eliminar-mant-desc" style="color:#64748b; font-size:14px; margin-bottom:24px;">Esta acción no se puede deshacer.</p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="btn-cancelar-eliminar-mant" style="padding:10px 20px; border:1px solid #d1d5db; border-radius:8px; background:#fff; cursor:pointer;">Cancelar</button>
          <button id="btn-confirmar-eliminar-mant" style="padding:10px 20px; border:none; border-radius:8px; background:#dc2626; color:#fff; cursor:pointer; font-weight:600;">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// LÓGICA TAB MANTENIMIENTO
// ============================================================

function formatFecha(fecha: string): string {
  if (!fecha) return '--';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMotivoLabel(act?: ActividadMantenimiento | null): string {
  if (!act) return 'N/A';
  return (act.motivo || act.categoria || 'N/A') as string;
}

function getTipoMantenimiento(act?: ActividadMantenimiento | null): 'Preventivo' | 'Correctivo' | 'N/A' {
  if (!act?.tipo_mantenimiento) return 'N/A';
  return act.tipo_mantenimiento;
}

function categoriaBadge(cat: string): string {
  const colorMap: Record<string, string> = {
    'Preventivo': 'background:#dbeafe; color:#1e40af;',
    'Correctivo': 'background:#fee2e2; color:#991b1b;',
    'Programado': 'background:#fef3c7; color:#92400e;',
    'Entregado': 'background:#dcfce7; color:#166534;',
    'Garantia': 'background:#ede9fe; color:#5b21b6;',
    'N/A': 'background:#f1f5f9; color:#475569;'
  };
  return `<span style="padding:4px 10px; border-radius:20px; font-size:12px; font-weight:500; ${colorMap[cat] || colorMap['N/A']}">${cat}</span>`;
}

function normalizarTexto(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function detectarTipoEquipo(descripcion: string): string {
  const t = normalizarTexto(descripcion);
  if (t.includes('MOTOASPERSOR')) return 'MOTOASPERSORA';
  if (t.includes('TERMO') && t.includes('NEBULIZ')) return 'TERMO NEBULIZADOR';
  if (t.includes('ASPERSOR') && t.includes('MANUAL')) return 'ASPERSORA MANUAL';
  if (t.includes('ULV')) return 'ULV';
  return 'GENERAL';
}

function filtrarMotivos(tipo: 'Preventivo' | 'Correctivo', equipoId?: number): ActividadMantenimiento[] {
  const equipo = equiposLista.find(e => e.id === equipoId);
  const tipoEquipo = equipo ? detectarTipoEquipo(equipo.descripcion) : '';

  return actividadesLista.filter(a => {
    if (a.estado !== 'Activo') return false;
    if ((a.tipo_mantenimiento || 'Preventivo') !== tipo) return false;

    if (tipo === 'Correctivo') return true;
    if (!tipoEquipo) return true;

    const motivoEquipo = (a.tipo_equipo || 'GENERAL').toUpperCase();
    return motivoEquipo === 'GENERAL' || motivoEquipo === tipoEquipo;
  });
}

async function cargarEstadisticasMant() {
  try {
    const resp = await mantenimientoService.getEstadisticas();
    const stats = resp.data;
    if (!stats) return;

    const elTotal = document.getElementById('stat-total-mant');
    const elProximos = document.getElementById('stat-proximos-mant');
    const elUltimo = document.getElementById('stat-ultimo-mant');
    const elTop = document.getElementById('stat-top-equipo');

    if (elTotal) elTotal.textContent = String(stats.total ?? 0);
    if (elProximos) elProximos.textContent = String(stats.proximos_programados?.length ?? 0);

    if (elUltimo && stats.ultimo_mantenimiento) {
      const ult = stats.ultimo_mantenimiento as any;
      elUltimo.textContent = ult.equipo?.descripcion
        ? `${ult.equipo.descripcion} - ${formatFecha(ult.fecha)}`
        : formatFecha(ult.fecha);
    }

    if (elTop && stats.por_equipo?.length > 0) {
      const top = stats.por_equipo[0] as any;
      elTop.textContent = `${top.equipo} (${top.total})`;
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

async function cargarDropdownsMant() {
  try {
    const [eqResp, actResp] = await Promise.all([
      equipoService.getAll({ per_page: 200 } as any),
      actividadMantenimientoService.getAll()
    ]);
    equiposLista = eqResp.data || [];
    actividadesLista = actResp.data || [];

    // Dropdown filtro equipo
    const filterEq = document.getElementById('mnt-filter-equipo') as HTMLSelectElement;
    if (filterEq) {
      filterEq.innerHTML = '<option value="">Todos los equipos</option>' +
        equiposLista.map(e => `<option value="${e.id}">${e.descripcion} - ${e.marca} ${e.modelo}</option>`).join('');
    }

    // Dropdown filtro actividad
    const filterAct = document.getElementById('mnt-filter-actividad') as HTMLSelectElement;
    if (filterAct) {
      filterAct.innerHTML = '<option value="">Todos los motivos</option>' +
        actividadesLista.map(a => `<option value="${a.id}">${getMotivoLabel(a)} (${getTipoMantenimiento(a)})</option>`).join('');
    }

    // Dropdown modal equipo
    const modalEq = document.getElementById('mant-equipo') as HTMLSelectElement;
    if (modalEq) {
      modalEq.innerHTML = '<option value="">Seleccione equipo...</option>' +
        equiposLista.map(e => `<option value="${e.id}">${e.descripcion} - ${e.marca} ${e.modelo}</option>`).join('');
    }

    // Dropdown modal actividad
    const modalAct = document.getElementById('mant-actividad') as HTMLSelectElement;
    if (modalAct) {
      modalAct.innerHTML = '<option value="">Seleccione motivo...</option>' +
        actividadesLista.map(a => `<option value="${a.id}">${getMotivoLabel(a)} (${getTipoMantenimiento(a)})</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando dropdowns:', error);
  }
}

async function cargarMantenimientos() {
  const tbody = document.getElementById('mantenimientos-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#94a3b8;">Cargando...</td></tr>';

  try {
    const filters: any = {};
    if (mntFiltroEquipo) filters.id_equipo = Number(mntFiltroEquipo);
    if (mntFiltroActividad) filters.id_actividad = Number(mntFiltroActividad);
    if (mntFiltroDesde) filters.fecha_desde = mntFiltroDesde;
    if (mntFiltroHasta) filters.fecha_hasta = mntFiltroHasta;

    const resp = await mantenimientoService.getAll(filters);
    mantenimientos = resp.data || [];

    const totalInfo = document.getElementById('mant-total-info');
    if (totalInfo) totalInfo.textContent = `Total: ${mantenimientos.length} mantenimiento(s)`;

    if (mantenimientos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#94a3b8;">No se encontraron mantenimientos.</td></tr>';
      return;
    }

    tbody.innerHTML = mantenimientos.map(m => `
      <tr>
        <td><strong style="color:#2563eb;">${m.id}</strong></td>
        <td>
          <div style="font-weight:600;">${(m.equipo as any)?.descripcion || 'Equipo #' + m.id_equipo}</div>
          <div style="font-size:12px; color:#94a3b8;">${(m.equipo as any)?.marca || ''} ${(m.equipo as any)?.modelo || ''}</div>
        </td>
        <td>
          <div style="font-weight:600;">${getMotivoLabel(m.actividad as any)}</div>
          <div style="margin-top:4px;">${categoriaBadge(getTipoMantenimiento(m.actividad as any))}</div>
        </td>
        <td>${formatFecha(m.fecha)}</td>
        <td><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.observaciones || ''}">${m.observaciones || '--'}</div></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-icon edit btn-editar-mant" data-id="${m.id}" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn-icon delete btn-eliminar-mant" data-id="${m.id}" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    bindAccionesMant();
  } catch (error) {
    console.error('Error cargando mantenimientos:', error);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#dc2626;">Error al cargar mantenimientos.</td></tr>';
  }
}

let mantIdToDelete: number | null = null;

function bindAccionesMant() {
  // Editar
  document.querySelectorAll('.btn-editar-mant').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLButtonElement).dataset.id);
      try {
        const resp = await mantenimientoService.getById(id);
        const m = resp.data;
        if (!m) return;

        mntEditId = m.id;
        (document.getElementById('mant-edit-id') as HTMLInputElement).value = String(m.id);
        (document.getElementById('mant-equipo') as HTMLSelectElement).value = String(m.id_equipo);
        (document.getElementById('mant-actividad') as HTMLSelectElement).value = String(m.id_actmanten);
        (document.getElementById('mant-fecha') as HTMLInputElement).value = m.fecha ? m.fecha.split('T')[0] : '';
        (document.getElementById('mant-observaciones') as HTMLTextAreaElement).value = m.observaciones || '';

        const countEl = document.getElementById('mant-obs-count');
        if (countEl) countEl.textContent = `(${(m.observaciones || '').length}/100)`;

        document.getElementById('modal-mant-titulo')!.textContent = 'Editar Mantenimiento';
        document.getElementById('modal-mantenimiento')!.style.display = 'flex';
      } catch (error) {
        mostrarToast('error', 'Error', 'No se pudo cargar el mantenimiento');
      }
    });
  });

  // Eliminar
  document.querySelectorAll('.btn-eliminar-mant').forEach(btn => {
    btn.addEventListener('click', () => {
      mantIdToDelete = Number((btn as HTMLButtonElement).dataset.id);
      document.getElementById('modal-eliminar-mant')!.style.display = 'flex';
    });
  });
}

function limpiarFormMant() {
  mntEditId = null;
  (document.getElementById('mant-edit-id') as HTMLInputElement).value = '';
  (document.getElementById('mant-equipo') as HTMLSelectElement).value = '';
  (document.getElementById('mant-actividad') as HTMLSelectElement).value = '';
  (document.getElementById('mant-fecha') as HTMLInputElement).value = '';
  (document.getElementById('mant-observaciones') as HTMLTextAreaElement).value = '';
  const countEl = document.getElementById('mant-obs-count');
  if (countEl) countEl.textContent = '(0/100)';
}

function initMantenimientoTabEvents() {
  const modal = document.getElementById('modal-mantenimiento');
  const modalEliminar = document.getElementById('modal-eliminar-mant');

  // Filtros
  document.getElementById('mnt-filter-equipo')?.addEventListener('change', (e) => {
    mntFiltroEquipo = (e.target as HTMLSelectElement).value;
    cargarMantenimientos();
  });
  document.getElementById('mnt-filter-actividad')?.addEventListener('change', (e) => {
    mntFiltroActividad = (e.target as HTMLSelectElement).value;
    cargarMantenimientos();
  });
  document.getElementById('mnt-filter-desde')?.addEventListener('change', (e) => {
    mntFiltroDesde = (e.target as HTMLInputElement).value;
    cargarMantenimientos();
  });
  document.getElementById('mnt-filter-hasta')?.addEventListener('change', (e) => {
    mntFiltroHasta = (e.target as HTMLInputElement).value;
    cargarMantenimientos();
  });

  // Abrir modal desde botón del header
  document.getElementById('btnAgendarMantenimiento')?.addEventListener('click', () => {
    limpiarFormMant();
    document.getElementById('modal-mant-titulo')!.textContent = 'Agendar Mantenimiento';
    if (modal) modal.style.display = 'flex';
  });

  // Cerrar modales
  document.getElementById('btn-cerrar-modal-mant')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
  document.getElementById('btn-cancelar-mant')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  document.getElementById('btn-cancelar-eliminar-mant')?.addEventListener('click', () => {
    if (modalEliminar) modalEliminar.style.display = 'none';
  });
  modalEliminar?.addEventListener('click', (e) => {
    if (e.target === modalEliminar) modalEliminar.style.display = 'none';
  });

  // Contador de caracteres observaciones
  document.getElementById('mant-observaciones')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLTextAreaElement).value;
    const countEl = document.getElementById('mant-obs-count');
    if (countEl) countEl.textContent = `(${val.length}/100)`;
  });

  // Submit form crear/editar
  document.getElementById('form-mantenimiento')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = (document.getElementById('mant-edit-id') as HTMLInputElement).value;
    const id_equipo = Number((document.getElementById('mant-equipo') as HTMLSelectElement).value);
    const id_actmanten = Number((document.getElementById('mant-actividad') as HTMLSelectElement).value);
    const fecha = (document.getElementById('mant-fecha') as HTMLInputElement).value;
    const observaciones = (document.getElementById('mant-observaciones') as HTMLTextAreaElement).value.trim();

    if (!id_equipo || !id_actmanten || !fecha) {
      mostrarToast('error', 'Atención', 'Complete todos los campos requeridos');
      return;
    }

    const data: any = { id_equipo, id_actmanten, fecha };
    if (observaciones) data.observaciones = observaciones;

    try {
      if (editId) {
        await mantenimientoService.update(Number(editId), data);
        mostrarToast('success', 'Mantenimiento actualizado', 'Los datos fueron guardados correctamente');
      } else {
        await mantenimientoService.create(data);
        mostrarToast('success', 'Mantenimiento agendado', 'El mantenimiento fue registrado correctamente');
      }

      if (modal) modal.style.display = 'none';
      cargarMantenimientos();
      cargarEstadisticasMant();
    } catch (error: any) {
      const msg = error?.errors ? Object.values(error.errors).flat().join(', ') : 'Error al guardar mantenimiento';
      mostrarToast('error', 'Error', String(msg));
    }
  });

  // Confirmar eliminar
  document.getElementById('btn-confirmar-eliminar-mant')?.addEventListener('click', async () => {
    if (!mantIdToDelete) return;

    try {
      await mantenimientoService.delete(mantIdToDelete);
      mostrarToast('success', 'Mantenimiento eliminado', 'El registro fue eliminado correctamente');
      if (modalEliminar) modalEliminar.style.display = 'none';
      mantIdToDelete = null;
      cargarMantenimientos();
      cargarEstadisticasMant();
    } catch (error) {
      mostrarToast('error', 'Error', 'Error al eliminar mantenimiento');
    }
  });

  // Cargar datos iniciales
  cargarDropdownsMant();
  cargarEstadisticasMant();
  cargarMantenimientos();
}

// ============================================================
// TAB: GESTIÓN DE EQUIPOS (dinámico, conectado al backend)
// ============================================================
function renderGestionEquiposTab() {
  return `
    <!-- Barra de acciones -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div style="display:flex; gap:12px; align-items:center; flex:1;">
        <div class="op-search-box" style="flex:1; max-width:400px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" id="equipo-search" placeholder="Buscar por descripción, marca, modelo, serie..." class="op-search-input">
        </div>
        <select id="equipo-filter-estado" class="op-filter-select">
          <option value="">Activos</option>
          <option value="all">Todos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>
      <button class="btn-primary" id="btn-nuevo-equipo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nuevo Equipo
      </button>
    </div>

    <!-- Tabla de equipos -->
    <div class="table-container">
      <table class="op-table" id="tabla-equipos">
        <thead>
          <tr>
            <th>ID</th>
            <th>DESCRIPCIÓN</th>
            <th>MARCA</th>
            <th>MODELO</th>
            <th>SERIE</th>
            <th>ENCARGADO</th>
            <th>RESPONSABLE</th>
            <th>CONTACTO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="equipos-tbody">
          <tr><td colspan="10" style="text-align:center; padding:40px; color:#94a3b8;">Cargando equipos...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div id="equipos-pagination" style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;"></div>

    <!-- Modal Crear/Editar Equipo -->
    <div id="modal-equipo" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5); overflow-y:auto;">
      <div style="background:#fff; margin:5% auto; padding:0; width:600px; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #e2e8f0;">
          <h3 id="modal-equipo-titulo" style="margin:0; font-size:18px;">Nuevo Equipo</h3>
          <button id="btn-cerrar-modal-equipo" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b;">&times;</button>
        </div>
        <form id="form-equipo" style="padding:24px;">
          <input type="hidden" id="equipo-edit-id" value="">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div style="grid-column:1/-1;">
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Descripción *</label>
              <input type="text" id="equipo-descripcion" class="search-input" style="width:100%;" required placeholder="Ej: Nebulizador Industrial X-200">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Marca *</label>
              <input type="text" id="equipo-marca" class="search-input" style="width:100%;" required placeholder="Ej: Stihl">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Modelo *</label>
              <input type="text" id="equipo-modelo" class="search-input" style="width:100%;" required placeholder="Ej: SR 450">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">N° Serie *</label>
              <input type="number" id="equipo-serie" class="search-input" style="width:100%;" required placeholder="Ej: 100234">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Encargado *</label>
              <input type="text" id="equipo-encargado" class="search-input" style="width:100%;" required placeholder="Nombre del encargado">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Responsable *</label>
              <input type="text" id="equipo-responsable" class="search-input" style="width:100%;" required placeholder="Nombre del responsable">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Contacto *</label>
              <input type="number" id="equipo-contacto" class="search-input" style="width:100%;" required placeholder="Ej: 987654321">
            </div>

            <!-- Sección de imagen mejorada -->
            <div style="grid-column:1/-1; margin-top:8px;">
              <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:12px;">Imagen del Equipo (Opcional)</label>
              <div style="padding:16px; border:2px dashed #cbd5e1; border-radius:8px; text-align:center; cursor:pointer; transition:border-color 0.2s; background:#fafafa; position:relative;" id="zona-imagen-equipo">
                <input type="file" id="equipo-imagen-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display:none;">
                <div id="preview-imagen-equipo-zona">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom:8px; margin-left:auto; margin-right:auto; display:block;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <div style="font-size:13px; color:#64748b; font-weight:500;">Haz clic para subir imagen del equipo</div>
                  <div style="font-size:11px; color:#94a3b8; margin-top:4px;">JPG, PNG o WEBP • Máx. 5MB</div>
                </div>
                <div id="equipo-imagen-preview" style="display:none; margin-top:12px;"></div>
              </div>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
            <button type="button" id="btn-cancelar-equipo" style="padding:10px 20px; border:1px solid #d1d5db; border-radius:8px; background:#fff; cursor:pointer; font-size:14px;">Cancelar</button>
            <button type="submit" class="btn-primary" style="padding:10px 24px;">Guardar Equipo</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar Desactivar -->
    <div id="modal-desactivar-equipo" style="display:none; position:fixed; z-index:1001; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5);">
      <div style="background:#fff; margin:15% auto; padding:24px; width:420px; border-radius:12px; text-align:center;">
        <div style="width:48px; height:48px; border-radius:50%; background:#fef2f2; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3 style="margin:0 0 8px;">¿Desactivar equipo?</h3>
        <p id="desactivar-equipo-desc" style="color:#64748b; font-size:14px; margin-bottom:24px;">El equipo será marcado como Inactivo.</p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="btn-cancelar-desactivar" style="padding:10px 20px; border:1px solid #d1d5db; border-radius:8px; background:#fff; cursor:pointer;">Cancelar</button>
          <button id="btn-confirmar-desactivar" style="padding:10px 20px; border:none; border-radius:8px; background:#dc2626; color:#fff; cursor:pointer; font-weight:600;">Desactivar</button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// TAB: PROGRAMACIÓN ANUAL DE MANTENIMIENTOS
// ============================================================

function estadoBadge(estado: string): string {
  const map: Record<string, string> = {
    'Pendiente': 'background:#fef3c7; color:#92400e;',
    'Realizado': 'background:#dcfce7; color:#166534;',
    'Vencido': 'background:#fee2e2; color:#991b1b;',
  };
  return `<span style="padding:3px 10px; border-radius:20px; font-size:12px; font-weight:500; ${map[estado] || 'background:#f1f5f9; color:#475569;'}">${estado}</span>`;
}

function formatFechaHora(fecha: string): string {
  if (!fecha) return '--';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function frecuenciaLabel(meses: number): string {
  const labels: Record<number, string> = {
    0: 'Unica',
    1: 'Mensual',
    2: 'Bimestral',
    3: 'Trimestral',
    4: 'Cuatrimestral',
    6: 'Semestral',
    12: 'Anual',
  };
  return labels[meses] || `Cada ${meses} meses`;
}

function rowHighlightStyle(proximidad: string, estado: string): string {
  if (estado === 'Realizado') return 'background:#f0fdf4;'; // verde suave
  if (estado === 'Vencido' || proximidad === 'vencido') return 'background:#fef2f2;'; // rojo suave
  if (proximidad === 'proximo') return 'background:#fffbeb; animation: pulseRow 2s ease-in-out infinite;'; // amarillo pulsante
  return '';
}

function renderProgramacionAnualTab(): string {
  const anioActual = new Date().getFullYear();
  return `
    <!-- CSS para animación de filas próximas -->
    <style>
      @keyframes pulseRow {
        0%, 100% { background-color: #fffbeb; }
        50% { background-color: #fef08a; }
      }
      .prog-row-proximo { animation: pulseRow 2s ease-in-out infinite; }
      .prog-row-vencido { background: #fef2f2 !important; }
      .prog-row-realizado { background: #f0fdf4 !important; }
    </style>

    <!-- Formulario de Programación -->
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; font-size:16px; font-weight:600; color:#1e293b; display:flex; align-items:center; gap:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Nueva Programación Anual
        </h3>

      </div>
      <form id="form-programacion-anual">
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Equipo *</label>
            <select id="prog-equipo" class="search-input" style="width:100%; padding:10px;" required>
              <option value="">Seleccione equipo...</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Tipo *</label>
            <select id="prog-tipo" class="search-input" style="width:100%; padding:10px;" required>
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Modo *</label>
            <select id="prog-modo" class="search-input" style="width:100%; padding:10px;" required>
              <option value="Anual">Programar en el año</option>
              <option value="Unica">Mantenimiento unico</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Motivo *</label>
            <select id="prog-actividad" class="search-input" style="width:100%; padding:10px;" required>
              <option value="">Seleccione motivo...</option>
            </select>
          </div>
          <div id="frecuencia-container">
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;" id="lbl-frecuencia">Frecuencia *</label>
            <select id="prog-frecuencia" class="search-input" style="width:100%; padding:10px;" required>
              <option value="">Seleccione frecuencia...</option>
              <option value="0">Unica</option>
              <option value="1">Mensual (cada 1 mes)</option>
              <option value="2">Bimestral (cada 2 meses)</option>
              <option value="3">Trimestral (cada 3 meses)</option>
              <option value="4">Cuatrimestral (cada 4 meses)</option>
              <option value="6">Semestral (cada 6 meses)</option>
              <option value="12">Anual (cada 12 meses)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Año *</label>
            <input type="number" id="prog-anio" class="search-input" style="width:100%; padding:10px;" required min="2024" max="2050" value="${anioActual}">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;" id="lbl-fecha-inicio">Fecha de Inicio *</label>
            <input type="date" id="prog-fecha-inicio" class="search-input" style="width:100%; padding:10px;" required>
          </div>
          <div id="observaciones-container">
            <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px;">Observaciones</label>
            <input type="text" id="prog-observaciones" class="search-input" style="width:100%; padding:10px;" placeholder="Opcional..." maxlength="255">
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-top:20px; align-items:center;">
          <button type="button" id="btn-preview-programacion" class="btn-primary" style="padding:10px 20px; background:#6366f1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
            </svg>
            Previsualizar
          </button>
          <button type="submit" class="btn-primary" style="padding:10px 20px;" id="btn-confirmar-programacion" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Confirmar y Programar
          </button>
          <span id="auto-refresh-indicator" style="display:none; font-size:12px; color:#6366f1; margin-left:auto; display:flex; align-items:center; gap:4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" style="animation: spin 2s linear infinite;">
              <polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
            Auto-refresh cada 15s
          </span>
        </div>
      </form>

      <!-- Preview de fechas -->
      <div id="preview-fechas-container" style="display:none; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:16px;">
        <h4 style="margin:0 0 12px; font-size:14px; font-weight:600; color:#475569;">Vista previa de mantenimientos a programar:</h4>
        <div id="preview-fechas-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:8px;"></div>
      </div>
    </div>

    <!-- Filtros de programaciones existentes -->
    <div class="op-filters-bar" style="margin-bottom:16px;">
      <div class="op-filter-group" style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; width:100%;">
        <div style="font-weight:600; color:#1e293b; font-size:15px;">Programaciones Existentes</div>
        <select id="prog-filter-anio" class="op-filter-select" style="min-width:120px;">
          ${[anioActual - 1, anioActual, anioActual + 1].map(a =>
            `<option value="${a}" ${a === anioActual ? 'selected' : ''}>${a}</option>`
          ).join('')}
        </select>
        <select id="prog-filter-equipo" class="op-filter-select" style="min-width:200px;">
          <option value="">Todos los equipos</option>
        </select>
        <div style="margin-left:auto; display:flex; gap:8px; align-items:center;">
          <button id="btn-vista-lista" type="button" class="op-filter-select" style="cursor:pointer; min-width:90px;">Lista</button>
          <button id="btn-vista-calendario" type="button" class="op-filter-select" style="cursor:pointer; min-width:100px;">Calendario</button>
          <select id="prog-filter-mes" class="op-filter-select" style="min-width:150px; display:none;">
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de programaciones -->
    <div id="programaciones-lista" style="display:flex; flex-direction:column; gap:12px;">
      <div style="text-align:center; padding:40px; color:#94a3b8;">Cargando programaciones...</div>
    </div>

    <!-- Modal Confirmar Eliminar Programación -->
    <div id="modal-eliminar-prog" class="modal-overlay" style="display:none;">
      <div class="modal-container" style="max-width:420px; text-align:center; padding:32px;">
        <div style="width:48px; height:48px; border-radius:50%; background:#fef2f2; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3 style="margin:0 0 8px;">¿Eliminar programación?</h3>
        <p id="eliminar-prog-desc" style="color:#64748b; font-size:14px; margin-bottom:24px;">Se eliminarán todos los mantenimientos asociados. Esta acción no se puede deshacer.</p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="btn-cancelar-eliminar-prog" style="padding:10px 20px; border:1px solid #d1d5db; border-radius:8px; background:#fff; cursor:pointer;">Cancelar</button>
          <button id="btn-confirmar-eliminar-prog" style="padding:10px 20px; border:none; border-radius:8px; background:#dc2626; color:#fff; cursor:pointer; font-weight:600;">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

function renderProgramacionCard(prog: ProgramacionMantenimiento): string {
  const total = prog.total_programados;
  const realizados = prog.realizados;
  const porcentaje = total > 0 ? Math.round((realizados / total) * 100) : 0;
  const isExpanded = expandedProgramacion === prog.id;

  let progressColor = '#2563eb';
  if (porcentaje === 100) progressColor = '#16a34a';
  else if (prog.vencidos > 0) progressColor = '#dc2626';

  const mantenimientosHTML = isExpanded ? `
    <div style="margin-top:16px; border-top:1px solid #e2e8f0; padding-top:12px;">
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 12px; text-align:left; font-weight:600; color:#475569;">#</th>
            <th style="padding:8px 12px; text-align:left; font-weight:600; color:#475569;">Fecha</th>
            <th style="padding:8px 12px; text-align:left; font-weight:600; color:#475569;">Estado</th>
            <th style="padding:8px 12px; text-align:left; font-weight:600; color:#475569;">Observaciones</th>
            <th style="padding:8px 12px; text-align:center; font-weight:600; color:#475569;">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${prog.mantenimientos.map((m, i) => {
            const rowClass = m.estado === 'Realizado' ? 'prog-row-realizado'
              : m.proximidad === 'proximo' ? 'prog-row-proximo'
              : (m.estado === 'Vencido' || m.proximidad === 'vencido') ? 'prog-row-vencido'
              : '';
            const fechaDisplay = formatFecha(m.fecha);
            return `
            <tr class="${rowClass}" style="border-bottom:1px solid #f1f5f9; ${rowHighlightStyle(m.proximidad, m.estado)}">
              <td style="padding:8px 12px; color:#94a3b8;">${i + 1}</td>
              <td style="padding:8px 12px; font-weight:500;">${fechaDisplay}</td>
              <td style="padding:8px 12px;">${estadoBadge(m.estado)}</td>
              <td style="padding:8px 12px; color:#64748b; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.observaciones || '--'}</td>
              <td style="padding:8px 12px; text-align:center;">
                ${m.estado === 'Pendiente' || m.estado === 'Vencido' ? `
                  <button class="btn-marcar-realizado" data-id="${m.id}" style="padding:4px 12px; border:none; border-radius:6px; background:#dcfce7; color:#166534; cursor:pointer; font-size:12px; font-weight:500;" title="Marcar como realizado">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Realizado
                  </button>
                ` : `<span style="color:#16a34a; font-size:12px;">Completado</span>`}
              </td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  const motivo = prog.actividad?.motivo || prog.actividad?.categoria || 'N/A';
  const tipo = prog.actividad?.tipo_mantenimiento || 'N/A';

  return `
    <div class="programacion-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; transition:box-shadow 0.2s;" data-prog-id="${prog.id}">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
        <!-- Info principal -->
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <strong style="font-size:15px; color:#1e293b;">${prog.equipo?.descripcion || 'Equipo'}</strong>
            <span style="font-size:12px; color:#94a3b8;">${prog.equipo?.marca || ''} ${prog.equipo?.modelo || ''}</span>
            ${categoriaBadge(tipo)}
          </div>
          <div style="font-size:13px; color:#0f172a; margin-bottom:8px;"><strong>Motivo:</strong> ${motivo}</div>
          <div style="display:flex; gap:16px; font-size:13px; color:#64748b; flex-wrap:wrap;">
            <span title="Frecuencia">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${frecuenciaLabel(prog.frecuencia_meses)}
            </span>
            <span title="Año">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
              ${prog.anio}
            </span>
            <span title="Modo">${prog.modo_programacion || 'Anual'}</span>
            <span title="Inicio">${formatFecha(prog.fecha_inicio)}</span>
            ${prog.observaciones ? `<span style="font-style:italic;" title="Observaciones">${prog.observaciones}</span>` : ''}
          </div>
        </div>

        <!-- Progreso + acciones -->
        <div style="display:flex; align-items:center; gap:16px; flex-shrink:0;">
          <div style="text-align:center; min-width:80px;">
            <div style="font-size:22px; font-weight:700; color:${progressColor};">${porcentaje}%</div>
            <div style="font-size:11px; color:#94a3b8;">${realizados}/${total} realizados</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <span style="font-size:11px; padding:2px 8px; border-radius:10px; background:#dcfce7; color:#166534; text-align:center;">${prog.realizados} ok</span>
            <span style="font-size:11px; padding:2px 8px; border-radius:10px; background:#fef3c7; color:#92400e; text-align:center;">${prog.pendientes} pend</span>
            ${prog.vencidos > 0 ? `<span style="font-size:11px; padding:2px 8px; border-radius:10px; background:#fee2e2; color:#991b1b; text-align:center;">${prog.vencidos} venc</span>` : ''}
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-toggle-prog" data-id="${prog.id}" style="padding:8px; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc; cursor:pointer;" title="${isExpanded ? 'Contraer' : 'Ver detalle'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" style="transform:rotate(${isExpanded ? '180' : '0'}deg); transition:transform 0.2s;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <button class="btn-eliminar-prog" data-id="${prog.id}" style="padding:8px; border:1px solid #fecaca; border-radius:8px; background:#fef2f2; cursor:pointer;" title="Eliminar programación">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div style="margin-top:12px; background:#f1f5f9; border-radius:99px; height:6px; overflow:hidden;">
        <div style="height:100%; width:${porcentaje}%; background:${progressColor}; border-radius:99px; transition:width 0.3s;"></div>
      </div>

      ${mantenimientosHTML}
    </div>
  `;
}

function renderProgramacionesCalendario(anio: number, mes: number): string {
  const primerDia = new Date(anio, mes - 1, 1);
  const ultimoDia = new Date(anio, mes, 0);
  const totalDias = ultimoDia.getDate();
  const offset = (primerDia.getDay() + 6) % 7; // Lunes=0

  const eventosPorDia: Record<number, Array<{ equipo: string; motivo: string; estado: string; mntId: number }>> = {};

  programaciones.forEach((prog) => {
    const equipo = prog.equipo?.descripcion || 'Equipo';
    const motivo = prog.actividad?.motivo || prog.actividad?.categoria || 'Motivo';

    prog.mantenimientos.forEach((m) => {
      const d = new Date(m.fecha);
      if (d.getFullYear() !== anio || d.getMonth() !== mes - 1) return;

      const dia = d.getDate();
      if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
      eventosPorDia[dia].push({ equipo, motivo, estado: m.estado, mntId: m.id });
    });
  });

  const encabezado = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
    .map((d) => `<div style="padding:10px; text-align:center; font-size:12px; font-weight:700; color:#334155; background:#f8fafc; border:1px solid #e2e8f0;">${d}</div>`)
    .join('');

  const celdas: string[] = [];
  for (let i = 0; i < offset; i++) {
    celdas.push('<div style="min-height:120px; border:1px solid #e2e8f0; background:#f8fafc;"></div>');
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const eventos = eventosPorDia[dia] || [];
    const pendientes = eventos.filter((e) => e.estado === 'Pendiente').length;
    const vencidos = eventos.filter((e) => e.estado === 'Vencido').length;
    const realizados = eventos.filter((e) => e.estado === 'Realizado').length;
    const resumen = [];
    if (pendientes) resumen.push(`<span style="padding:2px 6px; border-radius:999px; background:#fef3c7; color:#92400e; font-size:10px;">${pendientes} pend</span>`);
    if (vencidos) resumen.push(`<span style="padding:2px 6px; border-radius:999px; background:#fee2e2; color:#991b1b; font-size:10px;">${vencidos} venc</span>`);
    if (realizados) resumen.push(`<span style="padding:2px 6px; border-radius:999px; background:#dcfce7; color:#166534; font-size:10px;">${realizados} ok</span>`);

    const preview = eventos.slice(0, 2).map((e) => `<div style="font-size:11px; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.equipo}: ${e.motivo}</div>`).join('');
    const extra = eventos.length > 2 ? `<div style="font-size:11px; color:#6366f1;">+${eventos.length - 2} mas</div>` : '';

    const cursorStyle = eventos.length > 0 ? 'cursor:pointer;' : '';
    celdas.push(`
      <div class="prog-calendar-day" data-dia="${dia}" style="min-height:120px; border:1px solid #e2e8f0; background:#fff; padding:8px; display:flex; flex-direction:column; gap:6px; ${cursorStyle} transition:background 0.2s;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='#fff';">
        <div style="font-size:13px; font-weight:700; color:#0f172a;">${dia}</div>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">${resumen.join('')}</div>
        <div style="display:flex; flex-direction:column; gap:2px;">${preview}${extra}</div>
      </div>
    `);
  }

  return `
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
      <div style="display:grid; grid-template-columns:repeat(7, minmax(0, 1fr));">${encabezado}${celdas.join('')}</div>
    </div>
    <!-- Panel detallado del día -->
    <div id="prog-panel-dia-detalle" style="display:none; margin-top:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;"></div>
  `;
}

function renderPanelDetailDia(dia: number): string {
  if (progMantenimientosDelDia.length === 0) return '';
  
  const detalles = progMantenimientosDelDia.map(m => {
    const color = m.estado === 'Vencido' ? '#ef4444' : m.estado === 'Realizado' ? '#22c55e' : '#f59e0b';
    const bgColor = m.estado === 'Vencido' ? '#fee2e2' : m.estado === 'Realizado' ? '#dcfce7' : '#fef3c7';
    const btnDisabled = m.estado === 'Realizado' ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
    
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:8px;">
        <div style="flex:1;">
          <div style="font-size:14px; font-weight:600; color:#0f172a;">${m.equipo}</div>
          <div style="font-size:12px; color:#64748b;">${m.motivo}</div>
          <div style="font-size:11px; padding:4px 8px; border-radius:99px; background:${bgColor}; color:${color}; display:inline-block; margin-top:6px;">${m.estado}</div>
        </div>
        <button class="btn-marcar-realizado-panel" data-mnt-id="${m.mntId}" ${btnDisabled} style="padding:8px 16px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap;">
          Marcar realizado
        </button>
      </div>
    `;
  }).join('');
  
  return `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a;">Mantenimientos para ${progMesCalendario}/${progDiaSeleccionado}</h3>
        <button id="btn-cerrar-panel-dia" style="background:#fff; border:1px solid #cbd5e1; padding:6px 12px; border-radius:6px; cursor:pointer; color:#475569; font-size:12px;">Cerrar</button>
      </div>
      ${detalles}
    </div>
  `;
}

function actualizarControlesVistaProgramacion() {
  const btnLista = document.getElementById('btn-vista-lista') as HTMLButtonElement | null;
  const btnCalendario = document.getElementById('btn-vista-calendario') as HTMLButtonElement | null;
  const selMes = document.getElementById('prog-filter-mes') as HTMLSelectElement | null;
  if (!btnLista || !btnCalendario || !selMes) return;

  const aplicarEstado = (btn: HTMLButtonElement, activo: boolean) => {
    btn.style.background = activo ? '#2563eb' : '#fff';
    btn.style.color = activo ? '#fff' : '#475569';
    btn.style.borderColor = activo ? '#2563eb' : '#cbd5e1';
  };

  aplicarEstado(btnLista, progVista === 'lista');
  aplicarEstado(btnCalendario, progVista === 'calendario');
  selMes.style.display = progVista === 'calendario' ? 'block' : 'none';
  selMes.value = String(progMesCalendario);
}

async function cargarDropdownsProg() {
  try {
    if (equiposLista.length === 0 || actividadesLista.length === 0) {
      const [eqResp, actResp] = await Promise.all([
        equipoService.getAll({ per_page: 200 } as any),
        actividadMantenimientoService.getAll()
      ]);
      equiposLista = eqResp.data || [];
      actividadesLista = actResp.data || [];
    }

    const progEq = document.getElementById('prog-equipo') as HTMLSelectElement;
    if (progEq) {
      progEq.innerHTML = '<option value="">Seleccione equipo...</option>' +
        equiposLista.map(e => `<option value="${e.id}">${e.descripcion} - ${e.marca} ${e.modelo}</option>`).join('');
    }

    actualizarOpcionesMotivoProgramacion();

    const filterEq = document.getElementById('prog-filter-equipo') as HTMLSelectElement;
    if (filterEq) {
      filterEq.innerHTML = '<option value="">Todos los equipos</option>' +
        equiposLista.map(e => `<option value="${e.id}">${e.descripcion} - ${e.marca} ${e.modelo}</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando dropdowns programación:', error);
  }
}

function actualizarOpcionesMotivoProgramacion() {
  const progAct = document.getElementById('prog-actividad') as HTMLSelectElement;
  if (!progAct) return;

  const equipoId = Number((document.getElementById('prog-equipo') as HTMLSelectElement | null)?.value || 0) || undefined;
  const motivos = filtrarMotivos(progTipoMantenimiento, equipoId);

  progAct.innerHTML = '<option value="">Seleccione motivo...</option>' +
    motivos.map(a => {
      const sufijo = a.frecuencia_sugerida ? ` - ${a.frecuencia_sugerida}` : '';
      return `<option value="${a.id}">${getMotivoLabel(a)}${sufijo}</option>`;
    }).join('');
}

function actualizarReglasProgramacion() {
  const selModo = document.getElementById('prog-modo') as HTMLSelectElement | null;
  const selFrecuencia = document.getElementById('prog-frecuencia') as HTMLSelectElement | null;
  if (!selModo || !selFrecuencia) return;

  const esCorrectivo = progTipoMantenimiento === 'Correctivo';

  if (esCorrectivo) {
    selModo.value = 'Unica';
    selModo.disabled = true;
    selFrecuencia.value = '0';
    selFrecuencia.disabled = true;
  } else {
    selModo.disabled = false;
    selFrecuencia.disabled = false;
    if (selModo.value === 'Unica') {
      selFrecuencia.value = '0';
      selFrecuencia.disabled = true;
    } else if (selFrecuencia.value === '0') {
      selFrecuencia.value = '';
    }
  }
}

async function cargarProgramaciones() {
  const container = document.getElementById('programaciones-lista');
  if (!container) return;

  actualizarControlesVistaProgramacion();

  container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">Cargando programaciones...</div>';

  try {
    const filters: any = {};
    if (progFiltroAnio) filters.anio = progFiltroAnio;
    if (progFiltroEquipo) filters.id_equipo = Number(progFiltroEquipo);

    const resp = await mantenimientoService.getProgramaciones(filters);
    programaciones = resp.data || [];

    if (programaciones.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:60px; color:#94a3b8;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px; display:block; opacity:0.5;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          No hay programaciones para el año ${progFiltroAnio}.<br>
          <span style="font-size:13px;">Use el formulario de arriba para crear una nueva programación.</span>
        </div>
      `;
      actualizarControlesVistaProgramacion();
      return;
    }

    if (progVista === 'calendario') {
      container.innerHTML = renderProgramacionesCalendario(progFiltroAnio, progMesCalendario);
      bindAccionesCalendario();
    } else {
      container.innerHTML = programaciones.map(p => renderProgramacionCard(p)).join('');
      bindAccionesProgramaciones();
    }
    actualizarControlesVistaProgramacion();


  } catch (error) {
    console.error('Error cargando programaciones:', error);
    container.innerHTML = '<div style="text-align:center; padding:40px; color:#dc2626;">Error al cargar programaciones.</div>';
  }
}

let progIdToDelete: number | null = null;

function bindAccionesCalendario() {
  // Click en celdas del calendario para ver detalles
  document.querySelectorAll('.prog-calendar-day').forEach(celda => {
    celda.addEventListener('click', () => {
      const dia = Number((celda as HTMLElement).dataset.dia);
      if (dia && dia > 0) {
        abrirPanelDetailDia(dia);
      }
    });
  });
}

function abrirPanelDetailDia(dia: number) {
  progDiaSeleccionado = dia;
  progMantenimientosDelDia = [];

  // Buscar todos los mantenimientos para este día
  programaciones.forEach((prog) => {
    const equipo = prog.equipo?.descripcion || 'Equipo';
    const motivo = prog.actividad?.motivo || prog.actividad?.categoria || 'Motivo';

    prog.mantenimientos.forEach((m) => {
      const d = new Date(m.fecha);
      if (d.getFullYear() !== progFiltroAnio || d.getMonth() !== progMesCalendario - 1 || d.getDate() !== dia) return;
      
      progMantenimientosDelDia.push({
        id: prog.id,
        equipo,
        motivo,
        estado: m.estado,
        mntId: m.id
      });
    });
  });

  // Mostrar el panel
  const panelContainer = document.getElementById('prog-panel-dia-detalle');
  if (panelContainer) {
    panelContainer.innerHTML = renderPanelDetailDia(dia);
    panelContainer.style.display = 'block';

    // Scroll al panel
    setTimeout(() => panelContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);

    // Cerrar panel
    document.getElementById('btn-cerrar-panel-dia')?.addEventListener('click', () => {
      progDiaSeleccionado = null;
      progMantenimientosDelDia = [];
      if (panelContainer) panelContainer.style.display = 'none';
    });

    // Marcar como realizado desde panel
    document.querySelectorAll('.btn-marcar-realizado-panel').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mntId = Number((btn as HTMLButtonElement).dataset.mntId);
        if (!mntId) return;
        
        (btn as HTMLButtonElement).disabled = true;
        (btn as HTMLButtonElement).style.opacity = '0.5';
        
        try {
          await mantenimientoService.marcarRealizado(mntId);
          mostrarToast('success', 'Actualizado', 'Mantenimiento marcado como realizado');
          cargarProgramaciones();
        } catch (error) {
          mostrarToast('error', 'Error', 'No se pudo actualizar el mantenimiento');
          (btn as HTMLButtonElement).disabled = false;
          (btn as HTMLButtonElement).style.opacity = '1';
        }
      });
    });
  }
}

function bindAccionesProgramaciones() {
  // Toggle expandir/contraer
  document.querySelectorAll('.btn-toggle-prog').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLButtonElement).dataset.id);
      expandedProgramacion = expandedProgramacion === id ? null : id;
      cargarProgramaciones();
    });
  });

  // Eliminar programación
  document.querySelectorAll('.btn-eliminar-prog').forEach(btn => {
    btn.addEventListener('click', () => {
      progIdToDelete = Number((btn as HTMLButtonElement).dataset.id);
      const modal = document.getElementById('modal-eliminar-prog');
      if (modal) modal.style.display = 'flex';
    });
  });

  // Marcar como realizado
  document.querySelectorAll('.btn-marcar-realizado').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLButtonElement).dataset.id);
      try {
        await mantenimientoService.marcarRealizado(id);
        mostrarToast('success', 'Actualizado', 'Mantenimiento marcado como realizado');
        cargarProgramaciones();
      } catch (error) {
        mostrarToast('error', 'Error', 'No se pudo actualizar el mantenimiento');
      }
    });
  });
}

function initProgramacionAnualEvents() {
  const modalEliminar = document.getElementById('modal-eliminar-prog');
  const selMes = document.getElementById('prog-filter-mes') as HTMLSelectElement | null;
  if (selMes) selMes.value = String(progMesCalendario);

  // Cargar dropdowns y programaciones
  cargarDropdownsProg();
  cargarProgramaciones();

  document.getElementById('prog-tipo')?.addEventListener('change', (e) => {
    progTipoMantenimiento = ((e.target as HTMLSelectElement).value || 'Preventivo') as 'Preventivo' | 'Correctivo';
    actualizarOpcionesMotivoProgramacion();
    actualizarReglasProgramacion();
  });

  document.getElementById('prog-equipo')?.addEventListener('change', () => {
    actualizarOpcionesMotivoProgramacion();
  });

  document.getElementById('prog-modo')?.addEventListener('change', () => {
    actualizarReglasProgramacion();
  });

  document.getElementById('btn-vista-lista')?.addEventListener('click', () => {
    progVista = 'lista';
    cargarProgramaciones();
  });

  document.getElementById('btn-vista-calendario')?.addEventListener('click', () => {
    progVista = 'calendario';
    cargarProgramaciones();
  });

  document.getElementById('prog-filter-mes')?.addEventListener('change', (e) => {
    progMesCalendario = Number((e.target as HTMLSelectElement).value);
    if (progVista === 'calendario') {
      cargarProgramaciones();
    }
  });

  actualizarReglasProgramacion();



  // ── Filtros ──────────────────────────────────────────────
  document.getElementById('prog-filter-anio')?.addEventListener('change', (e) => {
    progFiltroAnio = Number((e.target as HTMLSelectElement).value);
    expandedProgramacion = null;
    cargarProgramaciones();
  });
  document.getElementById('prog-filter-equipo')?.addEventListener('change', (e) => {
    progFiltroEquipo = (e.target as HTMLSelectElement).value;
    expandedProgramacion = null;
    cargarProgramaciones();
  });

  // ── Preview ──────────────────────────────────────────────
  document.getElementById('btn-preview-programacion')?.addEventListener('click', async () => {
    const anio = Number((document.getElementById('prog-anio') as HTMLInputElement).value);
    const frecuenciaRaw = (document.getElementById('prog-frecuencia') as HTMLSelectElement).value;
    const frecuencia = Number(frecuenciaRaw);
    const modoProgramacion = ((document.getElementById('prog-modo') as HTMLSelectElement | null)?.value || 'Anual') as 'Anual' | 'Unica';
    const fechaInicio = (document.getElementById('prog-fecha-inicio') as HTMLInputElement).value;

    if (!anio || frecuenciaRaw === '' || !fechaInicio) {
      mostrarToast('error', 'Atención', 'Complete año, frecuencia y fecha de inicio para previsualizar');
      return;
    }

    try {
      const resp = await mantenimientoService.previewFechas({
        anio, frecuencia_meses: frecuencia, fecha_inicio: fechaInicio,
        modo_programacion: modoProgramacion,
      });
      previewFechas = resp.data || [];

      const container = document.getElementById('preview-fechas-container');
      const grid = document.getElementById('preview-fechas-grid');
      const btnConfirmar = document.getElementById('btn-confirmar-programacion') as HTMLButtonElement;

      if (container && grid) {
        if (previewFechas.length === 0) {
          grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:16px;">No se generaron fechas con estos parámetros.</div>';
          if (btnConfirmar) btnConfirmar.disabled = true;
        } else {
          grid.innerHTML = previewFechas.map((f, i) => `
            <div style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:${f.estado === 'Vencido' ? '#fef2f2' : '#f0fdf4'}; border-radius:8px; border:1px solid ${f.estado === 'Vencido' ? '#fecaca' : '#bbf7d0'};">
              <span style="font-weight:600; color:#475569; min-width:24px;">${i + 1}.</span>
              <span style="font-weight:500; color:#1e293b;">${formatFecha(f.fecha)}</span>
              <span style="font-size:11px; color:#94a3b8;">${f.mes}</span>
              ${estadoBadge(f.estado)}
            </div>
          `).join('');
          if (btnConfirmar) btnConfirmar.disabled = false;
        }
        container.style.display = 'block';
      }
    } catch (error) {
      mostrarToast('error', 'Error', 'No se pudo generar la previsualización');
    }
  });

  // ── Submit programación ──────────────────────────────────
  document.getElementById('form-programacion-anual')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id_equipo = Number((document.getElementById('prog-equipo') as HTMLSelectElement).value);
    const id_actmanten = Number((document.getElementById('prog-actividad') as HTMLSelectElement).value);
    const anio = Number((document.getElementById('prog-anio') as HTMLInputElement).value);
    const frecuenciaRaw = (document.getElementById('prog-frecuencia') as HTMLSelectElement).value;
    const frecuencia_meses = Number(frecuenciaRaw);
    const modo_programacion = ((document.getElementById('prog-modo') as HTMLSelectElement | null)?.value || 'Anual') as 'Anual' | 'Unica';
    const fecha_inicio = (document.getElementById('prog-fecha-inicio') as HTMLInputElement).value;
    const observaciones = (document.getElementById('prog-observaciones') as HTMLInputElement).value.trim();

    if (!id_equipo || !id_actmanten || !anio || frecuenciaRaw === '' || !fecha_inicio) {
      mostrarToast('error', 'Atención', 'Complete todos los campos requeridos');
      return;
    }

    try {
      const resp = await mantenimientoService.programarAnual({
        id_equipo, id_actmanten, anio, frecuencia_meses, fecha_inicio,
        modo_programacion,
        observaciones: observaciones || undefined,
      });

      mostrarToast('success', 'Programación creada', resp.message || 'Los mantenimientos fueron programados correctamente');

      // Limpiar formulario
      (document.getElementById('prog-equipo') as HTMLSelectElement).value = '';
      (document.getElementById('prog-tipo') as HTMLSelectElement).value = 'Preventivo';
      (document.getElementById('prog-modo') as HTMLSelectElement).value = 'Anual';
      progTipoMantenimiento = 'Preventivo';
      actualizarOpcionesMotivoProgramacion();
      actualizarReglasProgramacion();
      (document.getElementById('prog-actividad') as HTMLSelectElement).value = '';
      (document.getElementById('prog-frecuencia') as HTMLSelectElement).value = '';
      (document.getElementById('prog-observaciones') as HTMLInputElement).value = '';
      const previewContainer = document.getElementById('preview-fechas-container');
      if (previewContainer) previewContainer.style.display = 'none';
      const btnConfirmar = document.getElementById('btn-confirmar-programacion') as HTMLButtonElement;
      if (btnConfirmar) btnConfirmar.disabled = true;
      previewFechas = [];

      // Actualizar filtro al año creado y recargar
      progFiltroAnio = anio;
      const filterAnio = document.getElementById('prog-filter-anio') as HTMLSelectElement;
      if (filterAnio) filterAnio.value = String(anio);

      cargarProgramaciones();
    } catch (error: any) {
      const msg = error?.message || (error?.errors ? Object.values(error.errors).flat().join(', ') : 'Error al crear la programación');
      mostrarToast('error', 'Error', String(msg));
    }
  });

  // ── Cerrar modal eliminar ────────────────────────────────
  document.getElementById('btn-cancelar-eliminar-prog')?.addEventListener('click', () => {
    if (modalEliminar) modalEliminar.style.display = 'none';
  });
  modalEliminar?.addEventListener('click', (e) => {
    if (e.target === modalEliminar) modalEliminar.style.display = 'none';
  });

  // ── Confirmar eliminar ───────────────────────────────────
  document.getElementById('btn-confirmar-eliminar-prog')?.addEventListener('click', async () => {
    if (!progIdToDelete) return;

    try {
      await mantenimientoService.eliminarProgramacion(progIdToDelete);
      mostrarToast('success', 'Programación eliminada', 'La programación y sus mantenimientos fueron eliminados');
      if (modalEliminar) modalEliminar.style.display = 'none';
      progIdToDelete = null;
      cargarProgramaciones();
    } catch (error) {
      mostrarToast('error', 'Error', 'Error al eliminar la programación');
    }
  });
}

/** Inicia o detiene el auto-refresh cada 15s si hay programaciones de prueba activas */
// ============================================================
// VISTA PRINCIPAL CON TABS
// ============================================================
export function renderAlmacenMantenimiento() {
  return `
    <div class="op-main-container">
      <!-- Header -->
      <div class="op-header">
        <div class="op-header-top">
          <h1 class="op-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="18" rx="2"></rect>
              <line x1="2" y1="8" x2="22" y2="8"></line>
            </svg>
            Mantenimiento de Equipos
          </h1>
          <button class="btn-primary" id="btnAgendarMantenimiento">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agendar Mantenimiento
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container" style="margin-bottom:24px;">
        <div class="tab-buttons" style="display:flex; gap:0; border-bottom:2px solid #e2e8f0;">
          <button class="tab-btn active" data-tab="mantenimiento" style="padding:12px 24px; border:none; background:none; cursor:pointer; font-size:14px; font-weight:600; color:#2563eb; border-bottom:2px solid #2563eb; margin-bottom:-2px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;">
              <circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>
            Mantenimiento
          </button>
          <button class="tab-btn" data-tab="gestion-equipos" style="padding:12px 24px; border:none; background:none; cursor:pointer; font-size:14px; font-weight:500; color:#64748b; border-bottom:2px solid transparent; margin-bottom:-2px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Gestión de Equipos
          </button>
          <button class="tab-btn" data-tab="programacion-anual" style="padding:12px 24px; border:none; background:none; cursor:pointer; font-size:14px; font-weight:500; color:#64748b; border-bottom:2px solid transparent; margin-bottom:-2px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Programación Anual
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div id="mantenimiento-tab-content">
        ${renderMantenimientoTab()}
      </div>
    </div>
  `;
}

// ============================================================
// LÓGICA DE EVENTOS
// ============================================================
let currentPage = 1;
let currentSearch = '';
let currentEstadoFilter = '';
let equipoIdToDelete: number | null = null;

async function cargarEquipos() {
  const tbody = document.getElementById('equipos-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:40px; color:#94a3b8;">Cargando equipos...</td></tr>';

  try {
    const filters: any = { page: currentPage, per_page: 15 };
    if (currentSearch) filters.search = currentSearch;
    if (currentEstadoFilter === 'all') {
      filters.estado = 'all';
    } else if (currentEstadoFilter === 'Inactivo') {
      filters.estado = 'Inactivo';
    }

    const response = await equipoService.getAll(filters);
    const equipos: Equipo[] = response.data || [];
    const pagination = (response as any).pagination;

    if (equipos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:40px; color:#94a3b8;">No se encontraron equipos.</td></tr>';
      renderPagination(null);
      return;
    }

    tbody.innerHTML = equipos.map(eq => `
      <tr>
        <td><strong style="color:#2563eb;">${eq.id}</strong></td>
        <td><div style="font-weight:600;">${eq.descripcion}</div></td>
        <td>${eq.marca}</td>
        <td>${eq.modelo}</td>
        <td><span style="font-family:monospace; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${eq.serie}</span></td>
        <td>${eq.encargado}</td>
        <td>${eq.responsable}</td>
        <td>${eq.contacto}</td>
        <td>
          <span class="status-indicator ${eq.estado === 'Activo' ? 'success' : 'danger'}">
            ${eq.estado}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-icon edit btn-editar-equipo" data-id="${eq.id}" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            ${eq.estado === 'Activo' ? `
              <button class="action-btn-icon delete btn-desactivar-equipo" data-id="${eq.id}" data-desc="${eq.descripcion}" title="Desactivar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            ` : `
              <span style="padding:6px 10px; font-size:11px; color:#94a3b8;">Inactivo</span>
            `}
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination(pagination);
    bindAccionesEquipos();

  } catch (error) {
    console.error('Error cargando equipos:', error);
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:40px; color:#dc2626;">Error al cargar equipos.</td></tr>';
  }
}

function renderPagination(pagination: any) {
  const container = document.getElementById('equipos-pagination');
  if (!container) return;

  if (!pagination || pagination.last_page <= 1) {
    container.innerHTML = pagination ? `<span style="font-size:13px; color:#64748b;">Total: ${pagination.total} equipos</span>` : '';
    return;
  }

  const pages: string[] = [];
  for (let i = 1; i <= pagination.last_page; i++) {
    pages.push(`<button class="pagination-btn ${i === pagination.current_page ? 'active' : ''}" data-page="${i}" style="padding:6px 12px; border:1px solid ${i === pagination.current_page ? '#2563eb' : '#d1d5db'}; border-radius:6px; background:${i === pagination.current_page ? '#2563eb' : '#fff'}; color:${i === pagination.current_page ? '#fff' : '#374151'}; cursor:pointer;">${i}</button>`);
  }

  container.innerHTML = `
    <span style="font-size:13px; color:#64748b;">Mostrando página ${pagination.current_page} de ${pagination.last_page} (${pagination.total} equipos)</span>
    <div style="display:flex; gap:4px;">
      ${pagination.current_page > 1 ? `<button class="pagination-btn" data-page="${pagination.current_page - 1}" style="padding:6px 12px; border:1px solid #d1d5db; border-radius:6px; background:#fff; cursor:pointer;">Anterior</button>` : ''}
      ${pages.join('')}
      ${pagination.current_page < pagination.last_page ? `<button class="pagination-btn" data-page="${pagination.current_page + 1}" style="padding:6px 12px; border:1px solid #d1d5db; border-radius:6px; background:#fff; cursor:pointer;">Siguiente</button>` : ''}
    </div>
  `;

  container.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = Number((btn as HTMLButtonElement).dataset.page);
      cargarEquipos();
    });
  });
}

function bindAccionesEquipos() {
  document.querySelectorAll('.btn-editar-equipo').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number((btn as HTMLButtonElement).dataset.id);
      try {
        const resp = await equipoService.getById(id);
        const eq = resp.data;
        if (!eq) return;

        (document.getElementById('equipo-edit-id') as HTMLInputElement).value = String(eq.id);
        (document.getElementById('equipo-descripcion') as HTMLInputElement).value = eq.descripcion;
        (document.getElementById('equipo-marca') as HTMLInputElement).value = eq.marca;
        (document.getElementById('equipo-modelo') as HTMLInputElement).value = eq.modelo;
        (document.getElementById('equipo-serie') as HTMLInputElement).value = String(eq.serie);
        (document.getElementById('equipo-encargado') as HTMLInputElement).value = eq.encargado;
        (document.getElementById('equipo-responsable') as HTMLInputElement).value = eq.responsable;
        (document.getElementById('equipo-contacto') as HTMLInputElement).value = String(eq.contacto);

        // Mostrar imagen si existe
        const preview = document.getElementById('preview-imagen-equipo-zona');
        const btnEliminar = document.getElementById('btn-eliminar-imagen-equipo') as HTMLButtonElement;
        
        if (eq.imagen_url && preview) {
          preview.innerHTML = `
            <div style="position:relative; display:inline-block;">
              <img src="${eq.imagen_url}" alt="Equipo" style="max-width:200px; max-height:150px; border-radius:6px; object-fit:cover; border:2px solid #d1d5db;">
              <button type="button" id="btn-quitar-imagen-equipo" style="position:absolute; top:-8px; right:-8px; background:#ef4444; color:#fff; border:none; border-radius:50%; width:24px; height:24px; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;" title="Quitar imagen">&times;</button>
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-top:8px;">Haz clic para cambiar la imagen</div>
          `;
          if (btnEliminar) btnEliminar.style.display = 'block';
          
          // Agregar evento al botón quitar
          document.getElementById('btn-quitar-imagen-equipo')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const imagenInput = document.getElementById('equipo-imagen-input') as HTMLInputElement;
            if (imagenInput) imagenInput.value = '';
            if (preview) {
              preview.innerHTML = `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom:8px; margin-left:auto; margin-right:auto; display:block;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <div style="font-size:13px; color:#64748b; font-weight:500;">Haz clic para subir imagen del equipo</div>
                <div style="font-size:11px; color:#94a3b8; margin-top:4px;">JPG, PNG o WEBP • Máx. 5MB</div>
              `;
            }
          });
        } else if (preview) {
          preview.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom:8px; margin-left:auto; margin-right:auto; display:block;">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <div style="font-size:13px; color:#64748b; font-weight:500;">Haz clic para subir imagen del equipo</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">JPG, PNG o WEBP • Máx. 5MB</div>
          `;
          if (btnEliminar) btnEliminar.style.display = 'none';
        }

        document.getElementById('modal-equipo-titulo')!.textContent = 'Editar Equipo';
        document.getElementById('modal-equipo')!.style.display = 'block';
      } catch (error) {
        mostrarToast('error', 'Error', 'Error al cargar equipo');
      }
    });
  });

  document.querySelectorAll('.btn-desactivar-equipo').forEach(btn => {
    btn.addEventListener('click', () => {
      equipoIdToDelete = Number((btn as HTMLButtonElement).dataset.id);
      const desc = (btn as HTMLButtonElement).dataset.desc || '';
      document.getElementById('desactivar-equipo-desc')!.textContent = `Se desactivará "${desc}". Podrá reactivarse posteriormente.`;
      document.getElementById('modal-desactivar-equipo')!.style.display = 'block';
    });
  });
}

function limpiarFormEquipo() {
  (document.getElementById('equipo-edit-id') as HTMLInputElement).value = '';
  (document.getElementById('equipo-descripcion') as HTMLInputElement).value = '';
  (document.getElementById('equipo-marca') as HTMLInputElement).value = '';
  (document.getElementById('equipo-modelo') as HTMLInputElement).value = '';
  (document.getElementById('equipo-serie') as HTMLInputElement).value = '';
  (document.getElementById('equipo-encargado') as HTMLInputElement).value = '';
  (document.getElementById('equipo-responsable') as HTMLInputElement).value = '';
  (document.getElementById('equipo-contacto') as HTMLInputElement).value = '';
  (document.getElementById('equipo-imagen-input') as HTMLInputElement).value = '';
  
  const preview = document.getElementById('preview-imagen-equipo-zona');
  if (preview) {
    preview.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom:8px; margin-left:auto; margin-right:auto; display:block;">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <div style="font-size:13px; color:#64748b; font-weight:500;">Haz clic para subir imagen del equipo</div>
      <div style="font-size:11px; color:#94a3b8; margin-top:4px;">JPG, PNG o WEBP • Máx. 5MB</div>
    `;
  }
  
  const btnEliminar = document.getElementById('btn-eliminar-imagen-equipo') as HTMLButtonElement;
  if (btnEliminar) btnEliminar.style.display = 'none';
}

export function initMantenimientoEvents() {
  const tabContent = document.getElementById('mantenimiento-tab-content');
  const tabBtns = document.querySelectorAll('.tabs-container .tab-btn');

  // Inicializar tab Mantenimiento por defecto
  initMantenimientoTabEvents();

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLButtonElement).dataset.tab;

      tabBtns.forEach(b => {
        const el = b as HTMLElement;
        if (el.dataset.tab === tab) {
          el.style.color = '#2563eb';
          el.style.fontWeight = '600';
          el.style.borderBottom = '2px solid #2563eb';
        } else {
          el.style.color = '#64748b';
          el.style.fontWeight = '500';
          el.style.borderBottom = '2px solid transparent';
        }
      });

      if (!tabContent) return;

      if (tab === 'gestion-equipos') {
        tabContent.innerHTML = renderGestionEquiposTab();
        initGestionEquiposEvents();
        cargarEquipos();
      } else if (tab === 'programacion-anual') {
        tabContent.innerHTML = renderProgramacionAnualTab();
        initProgramacionAnualEvents();
      } else {
        tabContent.innerHTML = renderMantenimientoTab();
        initMantenimientoTabEvents();
      }
    });
  });
}

function initGestionEquiposEvents() {
  const modal = document.getElementById('modal-equipo');
  const modalDesactivar = document.getElementById('modal-desactivar-equipo');

  // Búsqueda con debounce
  let searchTimeout: any;
  document.getElementById('equipo-search')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = (e.target as HTMLInputElement).value;
      currentPage = 1;
      cargarEquipos();
    }, 400);
  });

  // Filtro estado
  document.getElementById('equipo-filter-estado')?.addEventListener('change', (e) => {
    currentEstadoFilter = (e.target as HTMLSelectElement).value;
    currentPage = 1;
    cargarEquipos();
  });

  // Nuevo Equipo
  document.getElementById('btn-nuevo-equipo')?.addEventListener('click', () => {
    limpiarFormEquipo();
    document.getElementById('modal-equipo-titulo')!.textContent = 'Nuevo Equipo';
    if (modal) modal.style.display = 'block';
  });

  // Cerrar modales
  document.getElementById('btn-cerrar-modal-equipo')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
  document.getElementById('btn-cancelar-equipo')?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  document.getElementById('btn-cancelar-desactivar')?.addEventListener('click', () => {
    if (modalDesactivar) modalDesactivar.style.display = 'none';
  });
  modalDesactivar?.addEventListener('click', (e) => {
    if (e.target === modalDesactivar) modalDesactivar.style.display = 'none';
  });

  // Submit form crear/editar
  document.getElementById('form-equipo')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = (document.getElementById('equipo-edit-id') as HTMLInputElement).value;
    const data = {
      descripcion: (document.getElementById('equipo-descripcion') as HTMLInputElement).value.trim(),
      marca: (document.getElementById('equipo-marca') as HTMLInputElement).value.trim(),
      modelo: (document.getElementById('equipo-modelo') as HTMLInputElement).value.trim(),
      serie: Number((document.getElementById('equipo-serie') as HTMLInputElement).value),
      encargado: (document.getElementById('equipo-encargado') as HTMLInputElement).value.trim(),
      responsable: (document.getElementById('equipo-responsable') as HTMLInputElement).value.trim(),
      contacto: Number((document.getElementById('equipo-contacto') as HTMLInputElement).value),
    };

    if (!data.descripcion || !data.marca || !data.modelo || !data.serie || !data.encargado || !data.responsable || !data.contacto) {
      mostrarToast('error', 'Atención', 'Complete todos los campos requeridos');
      return;
    }

    try {
      let equipoId: number;
      
      if (editId) {
        await equipoService.update(Number(editId), data);
        equipoId = Number(editId);
        mostrarToast('success', 'Equipo actualizado', 'Los datos fueron guardados correctamente');
      } else {
        const resp = await equipoService.create(data);
        equipoId = resp.data.id;
        mostrarToast('success', 'Equipo creado', 'El equipo fue registrado correctamente');
      }

      // Subir imagen si existe archivo seleccionado
      const imagenInput = document.getElementById('equipo-imagen-input') as HTMLInputElement;
      if (imagenInput?.files?.length) {
        const file = imagenInput.files[0];
        try {
          await equipoService.subirImagen(equipoId, file);
          mostrarToast('success', 'Imagen subida', 'La imagen fue guardada correctamente');
        } catch (imgError) {
          mostrarToast('warning', 'Imagen no subida', 'El equipo se guardó pero hubo error al subir la imagen');
        }
      }

      if (modal) modal.style.display = 'none';
      cargarEquipos();
    } catch (error: any) {
      const msg = error?.errors ? Object.values(error.errors).flat().join(', ') : 'Error al guardar equipo';
      mostrarToast('error', 'Error', String(msg));
    }
  });

  // ── Manejo de carga de imagen ────────────────────────
  const zonaImagen = document.getElementById('zona-imagen-equipo');
  const inputImagen = document.getElementById('equipo-imagen-input') as HTMLInputElement;
  
  if (zonaImagen && inputImagen) {
    // Hacer la zona clickeable
    zonaImagen.addEventListener('click', (ev) => {
      if ((ev.target as HTMLElement).id === 'btn-quitar-imagen-equipo') return;
      inputImagen.click();
    });

    // Evento de cambio de archivo
    inputImagen.addEventListener('change', () => {
      const file = inputImagen.files?.[0];
      const preview = document.getElementById('preview-imagen-equipo-zona');
      const previewContainer = document.getElementById('equipo-imagen-preview');

      if (!file || !preview) return;

      // Validar tamaño
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        mostrarToast('error', 'Archivo muy grande', 'La imagen no debe superar 5MB');
        inputImagen.value = '';
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        mostrarToast('error', 'Formato no válido', 'Solo se aceptan JPG, PNG o WebP');
        inputImagen.value = '';
        return;
      }

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.innerHTML = `
          <div style="position:relative; display:inline-block;">
            <img src="${ev.target?.result}" alt="Preview" style="max-width:200px; max-height:150px; border-radius:6px; object-fit:cover; border:2px solid #2563eb;">
            <button type="button" id="btn-quitar-imagen-equipo" style="position:absolute; top:-8px; right:-8px; background:#ef4444; color:#fff; border:none; border-radius:50%; width:24px; height:24px; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold;" title="Quitar imagen">&times;</button>
          </div>
          <div style="font-size:11px; color:#94a3b8; margin-top:8px;">Haz clic para cambiar la imagen</div>
        `;

        // Evento de botón quitar
        document.getElementById('btn-quitar-imagen-equipo')?.addEventListener('click', (e) => {
          e.stopPropagation();
          inputImagen.value = '';
          preview.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom:8px; margin-left:auto; margin-right:auto; display:block;">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <div style="font-size:13px; color:#64748b; font-weight:500;">Haz clic para subir imagen del equipo</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">JPG, PNG o WEBP • Máx. 5MB</div>
          `;
        });
      };
      reader.readAsDataURL(file);
    });
  }


  // Confirmar desactivar
  document.getElementById('btn-confirmar-desactivar')?.addEventListener('click', async () => {
    if (!equipoIdToDelete) return;

    try {
      await equipoService.delete(equipoIdToDelete);
      mostrarToast('success', 'Equipo desactivado', 'El equipo fue marcado como inactivo');
      if (modalDesactivar) modalDesactivar.style.display = 'none';
      equipoIdToDelete = null;
      cargarEquipos();
    } catch (error) {
      mostrarToast('error', 'Error', 'Error al desactivar equipo');
    }
  });
}

// Se elimina la función estática anterior, ahora todo está integrado en los tabs
