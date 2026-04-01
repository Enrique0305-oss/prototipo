import { vehiculoService } from '../../../services/vehiculoService';
import { mostrarToast } from '../../../shared/toast';

type VehiculoUI = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidad_carga: number;
  estado: 'Disponible' | 'En Uso' | 'Mantenimiento' | 'Fuera de Servicio';
  programaciones_count?: number;
};

let cacheVehiculos: VehiculoUI[] = [];

function esc(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badgeEstado(estado: string): string {
  if (estado === 'Disponible') return 'success';
  if (estado === 'En Uso') return 'warning';
  if (estado === 'Mantenimiento') return 'pending';
  return 'danger';
}

function abrirModalVehiculo(v?: VehiculoUI) {
  const modal = document.getElementById('veh-modal') as HTMLElement | null;
  if (!modal) return;

  (document.getElementById('veh-form-title') as HTMLElement).textContent = v ? 'Editar Vehículo' : 'Nuevo Vehículo';
  (document.getElementById('veh-form-id') as HTMLInputElement).value = v ? String(v.id) : '';
  (document.getElementById('veh-form-placa') as HTMLInputElement).value = v?.placa || '';
  (document.getElementById('veh-form-marca') as HTMLInputElement).value = v?.marca || '';
  (document.getElementById('veh-form-modelo') as HTMLInputElement).value = v?.modelo || '';
  (document.getElementById('veh-form-anio') as HTMLInputElement).value = v ? String(v.anio) : String(new Date().getFullYear());
  (document.getElementById('veh-form-capacidad') as HTMLInputElement).value = v ? String(v.capacidad_carga) : '0';

  modal.style.display = 'flex';
}

function cerrarModalVehiculo() {
  const modal = document.getElementById('veh-modal') as HTMLElement | null;
  if (modal) modal.style.display = 'none';
}

function readVehiculoForm() {
  const id = Number((document.getElementById('veh-form-id') as HTMLInputElement).value || 0);
  const placa = (document.getElementById('veh-form-placa') as HTMLInputElement).value.trim().toUpperCase();
  const marca = (document.getElementById('veh-form-marca') as HTMLInputElement).value.trim();
  const modelo = (document.getElementById('veh-form-modelo') as HTMLInputElement).value.trim();
  const anio = Number((document.getElementById('veh-form-anio') as HTMLInputElement).value || 0);
  const capacidad_carga = Number((document.getElementById('veh-form-capacidad') as HTMLInputElement).value || 0);

  return { id, payload: { placa, marca, modelo, anio, capacidad_carga } };
}

async function guardarVehiculo() {
  const { id, payload } = readVehiculoForm();

  if (!payload.placa || !payload.marca || !payload.modelo || !payload.anio) {
    mostrarToast('error', 'Validación', 'Placa, marca, modelo y año son obligatorios');
    return;
  }

  try {
    if (id > 0) {
      await vehiculoService.update(id, payload as any);
      mostrarToast('success', 'Actualizado', 'Vehículo actualizado correctamente');
    } else {
      await vehiculoService.create(payload as any);
      mostrarToast('success', 'Creado', 'Vehículo registrado correctamente');
    }
    cerrarModalVehiculo();
    await cargarVehiculos();
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'No se pudo guardar el vehículo';
    mostrarToast('error', 'Error', msg);
  }
}

async function cambiarEstado(id: number, accion: 'fuera-servicio' | 'reactivar') {
  try {
    if (accion === 'fuera-servicio') await vehiculoService.delete(id);
    if (accion === 'reactivar') await vehiculoService.reactivar(id);
    await cargarVehiculos();
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'No se pudo actualizar estado';
    mostrarToast('error', 'Error', msg);
  }
}

function rowVehiculo(v: VehiculoUI): string {
  return `
    <tr>
      <td>
        <div class="equipment-info">
          <div class="equipment-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5l3 3v5h-2m-4 0H2"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <div>
            <div class="equipment-name">${esc(v.placa)}</div>
            <div class="equipment-id">${esc(v.marca)} ${esc(v.modelo)}</div>
          </div>
        </div>
      </td>
      <td>${esc(v.marca)}</td>
      <td>${esc(v.modelo)}</td>
      <td>${v.anio}</td>
      <td>${Number(v.capacidad_carga || 0).toFixed(2)} kg</td>
      <td>${v.programaciones_count ?? 0}</td>
      <td><span class="status-indicator ${badgeEstado(v.estado)}">${v.estado}</span></td>
      <td>
        <div class="op-action-buttons">
          <button class="op-btn-icon veh-edit" data-id="${v.id}" title="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>
          </button>
          ${v.estado !== 'Fuera de Servicio' ? `
            <button class="op-btn-icon veh-delete" data-id="${v.id}" title="Poner fuera de servicio" style="color:#dc2626;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
            </button>
          ` : `
            <button class="op-btn-icon veh-reactivar" data-id="${v.id}" title="Reactivar" style="color:#16a34a;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-9"></path></svg>
            </button>
          `}
        </div>
      </td>
    </tr>
  `;
}

function bindEvents() {
  const btnNuevo = document.getElementById('veh-btn-nuevo');
  if (btnNuevo) btnNuevo.onclick = () => abrirModalVehiculo();

  const btnFiltrar = document.getElementById('veh-btn-filtrar');
  if (btnFiltrar) btnFiltrar.onclick = () => { cargarVehiculos(); };

  const btnGuardar = document.getElementById('veh-form-save');
  if (btnGuardar) btnGuardar.onclick = () => { guardarVehiculo(); };

  const btnClose = document.getElementById('veh-form-close');
  if (btnClose) btnClose.onclick = () => { cerrarModalVehiculo(); };

  const btnCancel = document.getElementById('veh-form-cancel');
  if (btnCancel) btnCancel.onclick = () => { cerrarModalVehiculo(); };

  const search = document.getElementById('veh-search') as HTMLInputElement | null;
  if (search) {
    search.oninput = () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll<HTMLTableRowElement>('#vehiculos-tbody tr').forEach((row) => {
        row.style.display = (row.textContent || '').toLowerCase().includes(q) ? '' : 'none';
      });
    };
  }

  document.querySelectorAll<HTMLButtonElement>('.veh-edit').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id || 0);
      const v = cacheVehiculos.find((x) => x.id === id);
      if (v) abrirModalVehiculo(v);
    };
  });

  document.querySelectorAll<HTMLButtonElement>('.veh-delete').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id || 0);
      if (!id) return;
      if (!confirm('¿Poner este vehículo fuera de servicio?')) return;
      await cambiarEstado(id, 'fuera-servicio');
    };
  });

  document.querySelectorAll<HTMLButtonElement>('.veh-reactivar').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id || 0);
      if (!id) return;
      await cambiarEstado(id, 'reactivar');
    };
  });
}

export function renderAlmacenVehiculos(): string {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Vehículos</div>
      <div class="page-actions">
        <button class="btn-primary" id="veh-btn-nuevo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Vehículo
        </button>
      </div>
    </div>

    <div class="search-filter-bar" style="margin-bottom: 16px;">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input id="veh-search" type="text" placeholder="Buscar por placa, marca o modelo..." class="search-input">
      </div>
      <select class="op-filter-select" id="veh-estado">
        <option value="Disponible">Disponibles</option>
        <option value="En Uso">En uso</option>
        <option value="Mantenimiento">Mantenimiento</option>
        <option value="Fuera de Servicio">Fuera de servicio</option>
        <option value="todos">Todos</option>
      </select>
      <input id="veh-marca" class="op-filter-select" placeholder="Marca" />
      <input id="veh-anio-desde" class="op-filter-select" type="number" min="1900" max="2100" placeholder="Año desde" />
      <input id="veh-anio-hasta" class="op-filter-select" type="number" min="1900" max="2100" placeholder="Año hasta" />
      <button class="btn-filter" id="veh-btn-filtrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div id="veh-stats" class="stats-row" style="margin-bottom: 16px;"></div>

    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>PLACA</th>
            <th>MARCA</th>
            <th>MODELO</th>
            <th>AÑO</th>
            <th>CAP. CARGA</th>
            <th>PROGRAMACIONES</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody id="vehiculos-tbody">
          <tr><td colspan="8" style="text-align:center; padding: 32px; color:#64748b;">Cargando vehículos...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="modal-overlay" id="veh-modal" style="display:none;">
      <div class="modal-container" style="max-width:640px;">
        <div class="modal-header">
          <h2 id="veh-form-title">Nuevo Vehículo</h2>
          <button class="modal-close" id="veh-form-close">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="veh-form-id" />
          <div class="os-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="os-field"><label>Placa</label><input id="veh-form-placa" class="os-input" maxlength="20" /></div>
            <div class="os-field"><label>Marca</label><input id="veh-form-marca" class="os-input" maxlength="50" /></div>
            <div class="os-field"><label>Modelo</label><input id="veh-form-modelo" class="os-input" maxlength="100" /></div>
            <div class="os-field"><label>Año</label><input id="veh-form-anio" class="os-input" type="number" min="1900" max="2100" /></div>
            <div class="os-field"><label>Capacidad de Carga (kg)</label><input id="veh-form-capacidad" class="os-input" type="number" min="0" step="0.01" /></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="veh-form-cancel">Cancelar</button>
          <button class="btn-primary" id="veh-form-save">Guardar</button>
        </div>
      </div>
    </div>
  `;
}

export async function initVehiculosEvents() {
  bindEvents();
  await cargarVehiculos();
}

export async function cargarVehiculos() {
  const tbody = document.getElementById('vehiculos-tbody');
  const stats = document.getElementById('veh-stats');
  if (!tbody || !stats) return;

  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 32px; color:#64748b;">Cargando vehículos...</td></tr>';

  try {
    const estado = (document.getElementById('veh-estado') as HTMLSelectElement | null)?.value || 'Disponible';
    const marca = (document.getElementById('veh-marca') as HTMLInputElement | null)?.value?.trim() || '';
    const anioDesde = Number((document.getElementById('veh-anio-desde') as HTMLInputElement | null)?.value || 0);
    const anioHasta = Number((document.getElementById('veh-anio-hasta') as HTMLInputElement | null)?.value || 0);

    const [respStats, respList] = await Promise.all([
      vehiculoService.getEstadisticas(),
      vehiculoService.getAll({
        estado,
        marca: marca || undefined,
        anio_desde: anioDesde > 0 ? anioDesde : undefined,
        anio_hasta: anioHasta > 0 ? anioHasta : undefined,
      }),
    ]);

    const rawStats = (respStats as any).data || respStats;
    const s = rawStats?.data || rawStats;

    stats.innerHTML = `
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Total</div><div class="stat-box-value">${s.total ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Disponibles</div><div class="stat-box-value">${s.disponibles ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">En Uso</div><div class="stat-box-value">${s.en_uso ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Mantenimiento</div><div class="stat-box-value">${s.mantenimiento ?? 0}</div></div></div>
      <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Fuera de Servicio</div><div class="stat-box-value">${s.fuera_servicio ?? 0}</div></div></div>
    `;

    const rawList = (respList as any).data || respList;
    const dataList = rawList?.data || rawList || [];

    cacheVehiculos = dataList.map((v: any) => ({
      id: Number(v.id || v.id_vehiculo || 0),
      placa: v.placa || '',
      marca: v.marca || '',
      modelo: v.modelo || '',
      anio: Number(v.anio || 0),
      capacidad_carga: Number(v.capacidad_carga || 0),
      estado: (v.estado || 'Disponible') as VehiculoUI['estado'],
      programaciones_count: Number(v.programaciones_count || 0),
    }));

    if (cacheVehiculos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 32px; color:#64748b;">No hay vehículos para los filtros aplicados.</td></tr>';
      bindEvents();
      return;
    }

    tbody.innerHTML = cacheVehiculos.map(rowVehiculo).join('');
    bindEvents();
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'No se pudo cargar vehículos';
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 32px; color:#ef4444;">${esc(msg)}</td></tr>`;
    mostrarToast('error', 'Error', msg);
  }
}
