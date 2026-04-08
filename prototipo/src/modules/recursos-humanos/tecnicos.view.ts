import { tecnicoService } from '../../services/tecnicoService';
import { exponenteService } from '../../services/exponenteService';
import { mostrarToast } from '../../shared/toast';

type TecnicoUI = {
  id: number;
  nombre: string;
  apellidos: string;
  dni: string;
  celular?: string | null;
  correo?: string | null;
  especialidad?: string | null;
  autorizado_conducir: boolean;
  carga_maxima_semanal: number;
  estado: 'Activo' | 'Inactivo' | 'Licencia';
  programaciones_count?: number;
  id_exponente_vinculado?: number | null;
};

type ExponenteMini = {
  id: number;
  nombre: string;
  apellidos?: string | null;
  estado?: string;
};

let exponentesCatalogo: ExponenteMini[] = [];

function esc(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badgeEstado(estado: string): string {
  if (estado === 'Activo') return 'success';
  if (estado === 'Licencia') return 'warning';
  return 'danger';
}

function getFormDataTecnico(): any {
  const id = Number((document.getElementById('tec-form-id') as HTMLInputElement).value || 0);
  const nombre = (document.getElementById('tec-form-nombre') as HTMLInputElement).value.trim();
  const apellidos = (document.getElementById('tec-form-apellidos') as HTMLInputElement).value.trim();
  const dni = (document.getElementById('tec-form-dni') as HTMLInputElement).value.trim();
  const celular = (document.getElementById('tec-form-celular') as HTMLInputElement).value.trim();
  const correo = (document.getElementById('tec-form-correo') as HTMLInputElement).value.trim();
  const especialidad = (document.getElementById('tec-form-especialidad') as HTMLInputElement).value.trim();
  const autorizado_conducir = (document.getElementById('tec-form-conduce') as HTMLInputElement).checked;
  const carga_maxima_semanal = Number((document.getElementById('tec-form-carga') as HTMLInputElement).value || 40);
  const esExponente = (document.getElementById('tec-form-es-exponente') as HTMLInputElement).checked;
  const idExponenteRaw = Number((document.getElementById('tec-form-exponente-id') as HTMLSelectElement).value || 0);
  const id_exponente_vinculado = esExponente && idExponenteRaw > 0 ? idExponenteRaw : null;

  return {
    id,
    payload: {
      nombre,
      apellidos,
      dni,
      celular: celular || null,
      correo: correo || null,
      especialidad: especialidad || null,
      autorizado_conducir,
      carga_maxima_semanal,
      id_exponente_vinculado,
    },
  };
}

function renderOpcionesExponentes(selectedId?: number | null): string {
  const opciones = exponentesCatalogo
    .filter((e) => e.estado !== 'Inactivo' || (selectedId && e.id === selectedId))
    .map((e) => `<option value="${e.id}" ${selectedId === e.id ? 'selected' : ''}>${esc(`${e.nombre} ${e.apellidos || ''}`.trim())}</option>`)
    .join('');

  return `<option value="">Seleccione...</option>${opciones}`;
}

async function abrirModalTecnico(t?: TecnicoUI) {
  const modal = document.getElementById('tecnicos-modal') as HTMLElement | null;
  if (!modal) return;

  if (exponentesCatalogo.length === 0) {
    await cargarCatalogoExponentes();
  }

  (document.getElementById('tec-form-title') as HTMLElement).textContent = t ? 'Editar Técnico' : 'Nuevo Técnico';
  (document.getElementById('tec-form-id') as HTMLInputElement).value = t ? String(t.id) : '';
  (document.getElementById('tec-form-nombre') as HTMLInputElement).value = t?.nombre || '';
  (document.getElementById('tec-form-apellidos') as HTMLInputElement).value = t?.apellidos || '';
  (document.getElementById('tec-form-dni') as HTMLInputElement).value = t?.dni || '';
  (document.getElementById('tec-form-celular') as HTMLInputElement).value = t?.celular || '';
  (document.getElementById('tec-form-correo') as HTMLInputElement).value = t?.correo || '';
  (document.getElementById('tec-form-especialidad') as HTMLInputElement).value = t?.especialidad || '';
  (document.getElementById('tec-form-conduce') as HTMLInputElement).checked = !!t?.autorizado_conducir;
  (document.getElementById('tec-form-carga') as HTMLInputElement).value = String(t?.carga_maxima_semanal ?? 40);

  const chkExponente = document.getElementById('tec-form-es-exponente') as HTMLInputElement;
  const selExponente = document.getElementById('tec-form-exponente-id') as HTMLSelectElement;
  const selectedId = t?.id_exponente_vinculado ?? null;

  chkExponente.checked = !!selectedId;
  selExponente.innerHTML = renderOpcionesExponentes(selectedId);
  selExponente.disabled = !chkExponente.checked;

  chkExponente.onchange = () => {
    selExponente.disabled = !chkExponente.checked;
    if (!chkExponente.checked) {
      selExponente.value = '';
    }
  };

  modal.style.display = 'flex';
}

function cerrarModalTecnico() {
  const modal = document.getElementById('tecnicos-modal') as HTMLElement | null;
  if (modal) modal.style.display = 'none';
}

async function guardarTecnico() {
  const { id, payload } = getFormDataTecnico();

  if (!payload.nombre || !payload.apellidos || !payload.dni) {
    mostrarToast('error', 'Validación', 'Nombre, apellidos y DNI son obligatorios');
    return;
  }

  try {
    if (id > 0) {
      await tecnicoService.update(id, payload);
      mostrarToast('success', 'Actualizado', 'Técnico actualizado correctamente');
    } else {
      await tecnicoService.create(payload);
      mostrarToast('success', 'Creado', 'Técnico creado correctamente');
    }
    cerrarModalTecnico();
    await cargarTecnicos();
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'No se pudo guardar el técnico';
    mostrarToast('error', 'Error', msg);
  }
}

async function cargarCatalogoExponentes() {
  try {
    const resp = await exponenteService.getAll({ estado: 'Activo' });
    const raw = (resp as any).data || resp;
    exponentesCatalogo = ((raw?.data || raw || []) as any[]).map((e: any) => ({
      id: Number(e.id || 0),
      nombre: e.nombre || '',
      apellidos: e.apellidos || '',
      estado: e.estado || 'Activo',
    })).filter((e) => e.id > 0);
  } catch {
    exponentesCatalogo = [];
  }
}

async function cambiarEstadoTecnico(id: number, accion: 'desactivar' | 'reactivar' | 'licencia') {
  try {
    if (accion === 'desactivar') await tecnicoService.delete(id);
    if (accion === 'reactivar') await tecnicoService.reactivar(id);
    if (accion === 'licencia') await tecnicoService.ponerEnLicencia(id);
    await cargarTecnicos();
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'No se pudo cambiar el estado';
    mostrarToast('error', 'Error', msg);
  }
}

function renderFilaTecnico(t: TecnicoUI): string {
  return `
    <tr>
      <td>
        <div class="equipment-info">
          <div class="equipment-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="equipment-name">${esc(`${t.nombre} ${t.apellidos}`)}</div>
            <div class="equipment-id">DNI: ${esc(t.dni)}</div>
          </div>
        </div>
      </td>
      <td>${esc(t.especialidad || '—')}</td>
      <td>${esc(t.celular || '—')}</td>
      <td>${esc(t.correo || '—')}</td>
      <td>${t.autorizado_conducir ? '<span class="status-indicator success">Sí</span>' : '<span class="status-indicator danger">No</span>'}</td>
      <td>${t.carga_maxima_semanal} h</td>
      <td>${t.programaciones_count ?? 0}</td>
      <td><span class="status-indicator ${badgeEstado(t.estado)}">${t.estado}</span></td>
      <td>
        <div class="op-action-buttons">
          <button class="op-btn-icon tec-edit" data-id="${t.id}" title="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>
          </button>
          ${t.estado !== 'Inactivo' ? `
            <button class="op-btn-icon tec-delete" data-id="${t.id}" title="Desactivar" style="color:#dc2626;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : `
            <button class="op-btn-icon tec-reactivate" data-id="${t.id}" title="Reactivar" style="color:#16a34a;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-9"></path></svg>
            </button>
          `}
          ${t.estado === 'Activo' ? `
            <button class="op-btn-icon tec-licencia" data-id="${t.id}" title="Poner en licencia" style="color:#d97706;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}

function bindTecnicosEvents(tecnicos: TecnicoUI[]) {
  const btnNuevo = document.getElementById('tecnicos-btn-nuevo');
  if (btnNuevo) btnNuevo.onclick = () => { abrirModalTecnico(); };

  const btnFiltrar = document.getElementById('tecnicos-btn-filtrar');
  if (btnFiltrar) btnFiltrar.onclick = () => { cargarTecnicos(); };

  const btnGuardar = document.getElementById('tec-form-save');
  if (btnGuardar) btnGuardar.onclick = () => { guardarTecnico(); };

  const btnClose = document.getElementById('tec-form-close');
  if (btnClose) btnClose.onclick = () => { cerrarModalTecnico(); };

  const btnCancel = document.getElementById('tec-form-cancel');
  if (btnCancel) btnCancel.onclick = () => { cerrarModalTecnico(); };

  const search = document.getElementById('tecnicos-search') as HTMLInputElement | null;
  if (search) {
    search.oninput = () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll<HTMLTableRowElement>('#tecnicos-tbody tr').forEach((row) => {
        row.style.display = (row.textContent || '').toLowerCase().includes(q) ? '' : 'none';
      });
    };
  }

  document.querySelectorAll<HTMLButtonElement>('.tec-edit').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id || 0);
      const t = tecnicos.find((x) => x.id === id);
      if (t) {
        abrirModalTecnico(t);
      }
    };
  });

  document.querySelectorAll<HTMLButtonElement>('.tec-delete').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id || 0);
      if (!id) return;
      if (!confirm('¿Desactivar este técnico?')) return;
      await cambiarEstadoTecnico(id, 'desactivar');
    };
  });

  document.querySelectorAll<HTMLButtonElement>('.tec-reactivate').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id || 0);
      if (!id) return;
      await cambiarEstadoTecnico(id, 'reactivar');
    };
  });

  document.querySelectorAll<HTMLButtonElement>('.tec-licencia').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id || 0);
      if (!id) return;
      await cambiarEstadoTecnico(id, 'licencia');
    };
  });
}

export function renderTecnicosTab(): string {
  return `
    <div class="search-filter-bar" style="margin-bottom: 16px;">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input id="tecnicos-search" type="text" placeholder="Buscar técnico..." class="search-input">
      </div>
      <select class="op-filter-select" id="tecnicos-estado">
        <option value="Activo">Activos</option>
        <option value="Licencia">Licencia</option>
        <option value="Inactivo">Inactivos</option>
        <option value="todos">Todos</option>
      </select>
      <input id="tecnicos-especialidad" class="op-filter-select" placeholder="Especialidad" />
      <select class="op-filter-select" id="tecnicos-conduce">
        <option value="">Conduce: Todos</option>
        <option value="1">Conduce: Sí</option>
        <option value="0">Conduce: No</option>
      </select>
      <button class="btn-filter" id="tecnicos-btn-filtrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
      <button class="btn-primary" id="tecnicos-btn-nuevo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Nuevo Técnico
      </button>
    </div>

    <div id="tecnicos-stats" class="stats-row" style="margin-bottom: 16px;"></div>

    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>TÉCNICO</th>
            <th>ESPECIALIDAD</th>
            <th>CELULAR</th>
            <th>CORREO</th>
            <th>CONDUCE</th>
            <th>CARGA</th>
            <th>PROGRAMACIONES</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="tecnicos-tbody">
          <tr><td colspan="9" style="text-align:center; padding: 32px; color:#64748b;">Cargando técnicos...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="modal-overlay" id="tecnicos-modal" style="display:none;">
      <div class="modal-container" style="max-width:640px;">
        <div class="modal-header">
          <h2 id="tec-form-title">Nuevo Técnico</h2>
          <button class="modal-close" id="tec-form-close">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="tec-form-id" />
          <div class="os-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="os-field"><label>Nombre</label><input id="tec-form-nombre" class="os-input" maxlength="100" /></div>
            <div class="os-field"><label>Apellidos</label><input id="tec-form-apellidos" class="os-input" maxlength="100" /></div>
            <div class="os-field"><label>DNI</label><input id="tec-form-dni" class="os-input" maxlength="8" /></div>
            <div class="os-field"><label>Celular</label><input id="tec-form-celular" class="os-input" maxlength="13" /></div>
            <div class="os-field"><label>Correo</label><input id="tec-form-correo" class="os-input" maxlength="100" /></div>
            <div class="os-field"><label>Especialidad</label><input id="tec-form-especialidad" class="os-input" maxlength="100" /></div>
            <div class="os-field"><label>Carga Máxima Semanal</label><input id="tec-form-carga" class="os-input" type="number" min="1" max="168" value="40" /></div>
            <div class="os-field" style="display:flex;align-items:flex-end;">
              <label style="display:flex; gap:8px; align-items:center;">
                <input id="tec-form-conduce" type="checkbox" /> Autorizado a conducir
              </label>
            </div>
            <div class="os-field" style="grid-column:1 / span 2;">
              <label style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                <input id="tec-form-es-exponente" type="checkbox" /> También es exponente
              </label>
              <select id="tec-form-exponente-id" class="os-input" disabled></select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="tec-form-cancel">Cancelar</button>
          <button class="btn-primary" id="tec-form-save">Guardar</button>
        </div>
      </div>
    </div>
  `;
}

export async function cargarTecnicos() {
  const tbody = document.getElementById('tecnicos-tbody');
  const stats = document.getElementById('tecnicos-stats');
  if (!tbody || !stats) return;

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 32px; color:#64748b;">Cargando técnicos...</td></tr>';

  try {
    const estado = (document.getElementById('tecnicos-estado') as HTMLSelectElement | null)?.value || 'Activo';
    const especialidad = (document.getElementById('tecnicos-especialidad') as HTMLInputElement | null)?.value?.trim() || '';
    const conduce = (document.getElementById('tecnicos-conduce') as HTMLSelectElement | null)?.value || '';

    const [respStats, respList] = await Promise.all([
      tecnicoService.getEstadisticas(),
      tecnicoService.getAll({
        estado,
        especialidad: especialidad || undefined,
        autorizado_conducir: conduce === '' ? undefined : conduce === '1',
      }),
      exponentesCatalogo.length === 0 ? cargarCatalogoExponentes() : Promise.resolve(),
    ]);

    const rawStats = (respStats as any).data || respStats;
    const s = rawStats?.data || rawStats;

    stats.innerHTML = `
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Total</div><div class="stat-box-value">${s.total ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Activos</div><div class="stat-box-value">${s.activos ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Inactivos</div><div class="stat-box-value">${s.inactivos ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Licencia</div><div class="stat-box-value">${s.en_licencia ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Autorizados a Conducir</div><div class="stat-box-value">${s.autorizados_conducir ?? 0}</div></div></div>
    `;

    const rawList = (respList as any).data || respList;
    const list: TecnicoUI[] = (rawList?.data || rawList || []).map((t: any) => ({
      id: Number(t.id || 0),
      nombre: t.nombre || '',
      apellidos: t.apellidos || '',
      dni: t.dni || '',
      celular: t.celular,
      correo: t.correo,
      especialidad: t.especialidad,
      autorizado_conducir: !!t.autorizado_conducir,
      carga_maxima_semanal: Number(t.carga_maxima_semanal || 0),
      estado: t.estado || 'Activo',
      programaciones_count: Number(t.programaciones_count || 0),
      id_exponente_vinculado: t.id_exponente_vinculado ? Number(t.id_exponente_vinculado) : null,
    }));

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 32px; color:#64748b;">No hay técnicos para los filtros aplicados.</td></tr>';
    } else {
      tbody.innerHTML = list.map(renderFilaTecnico).join('');
    }

    bindTecnicosEvents(list);
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'No se pudo cargar técnicos';
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 32px; color:#ef4444;">${esc(msg)}</td></tr>`;
    mostrarToast('error', 'Error', msg);
  }
}
