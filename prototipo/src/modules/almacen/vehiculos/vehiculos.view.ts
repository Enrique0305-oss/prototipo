import { vehiculoService } from '../../../services/vehiculoService';
import { mantenimientoVehiculoService } from '../../../services/mantenimientoVehiculoService';
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
let activeVehiculosTab: 'vehiculos' | 'mantenimiento' | 'historial' = 'vehiculos';

type VehiculoMantenimientoEstado = 'Programado' | 'Realizado' | 'Vencido' | 'Cancelado';

type VehiculoMantenimientoUI = {
  id: number;
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  motivo: string;
  tipo: 'Preventivo' | 'Correctivo' | 'Limpieza';
  frecuencia_meses?: number;
  fecha_programada: string;
  fecha_realizado?: string;
  kilometraje?: number;
  observaciones?: string;
  estado: VehiculoMantenimientoEstado;
  created_at: string;
  updated_at: string;
};

let cacheMantenimientosVehiculo: VehiculoMantenimientoUI[] = [];
type VehiculoMantenimientoCalendarioDia = {
  dia: number;
  fecha: string;
  total: number;
  programados: number;
  realizados: number;
  vencidos: number;
  cancelados: number;
  items: VehiculoMantenimientoUI[];
};

let cacheCalendarioMantenimientoVehiculo: VehiculoMantenimientoCalendarioDia[] = [];
let cacheCalendarioResumen = { total: 0, programados: 0, realizados: 0, vencidos: 0, cancelados: 0 };
let vehMantVista: 'lista' | 'calendario' = 'lista';
let vehMantMes = new Date().getMonth() + 1;
let vehMantAnio = new Date().getFullYear();
let vehMantBusqueda = '';
let vehMantEstado: 'Todos' | VehiculoMantenimientoEstado = 'Todos';
let vehMantVehiculo = '';
let vehMantHistoryBusqueda = '';
let vehMantDetailDia: number | null = null;
let vehMantRecordsDia: VehiculoMantenimientoUI[] = [];

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

function estadoMantenimientoBadge(estado: VehiculoMantenimientoEstado): string {
  if (estado === 'Realizado') return 'success';
  if (estado === 'Vencido') return 'danger';
  if (estado === 'Cancelado') return 'warning';
  return 'pending';
}

function formatFecha(fecha: string): string {
  if (!fecha) return '--';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFechaHora(fecha: string): string {
  if (!fecha) return '--';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '--';
  return `${d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
}

function monthLabel(mes: number): string {
  const labels = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return labels[mes - 1] || 'Mes';
}

function normalizeText(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function inicioDia(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function esVencido(fecha: string): boolean {
  if (!fecha) return false;
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  return d < inicioDia(new Date());
}

function getVehiculoById(id: number): VehiculoUI | undefined {
  return cacheVehiculos.find((vehiculo) => vehiculo.id === id);
}

function normalizeMantenimientoVehiculo(item: Partial<VehiculoMantenimientoUI>): VehiculoMantenimientoUI {
  const fechaProgramada = item.fecha_programada || hoyIso();
  const estadoOriginal = item.estado || 'Programado';
  const tipoOriginal = item.tipo || 'Preventivo';
  const tipo: VehiculoMantenimientoUI['tipo'] =
    tipoOriginal === 'Correctivo' || tipoOriginal === 'Limpieza' ? tipoOriginal : 'Preventivo';
  const frecuenciaMeses = item.frecuencia_meses !== undefined && item.frecuencia_meses !== null && !Number.isNaN(Number(item.frecuencia_meses))
    ? Number(item.frecuencia_meses)
    : undefined;
  const estado: VehiculoMantenimientoEstado = estadoOriginal === 'Realizado' || estadoOriginal === 'Cancelado'
    ? estadoOriginal
    : esVencido(fechaProgramada) ? 'Vencido' : 'Programado';

  return {
    id: Number(item.id || 0),
    id_vehiculo: Number(item.id_vehiculo || 0),
    placa: item.placa || '',
    marca: item.marca || '',
    modelo: item.modelo || '',
    motivo: item.motivo || '',
    tipo,
    frecuencia_meses: frecuenciaMeses,
    fecha_programada: fechaProgramada,
    fecha_realizado: item.fecha_realizado || '',
    kilometraje: item.kilometraje !== undefined && item.kilometraje !== null && !Number.isNaN(Number(item.kilometraje))
      ? Number(item.kilometraje)
      : undefined,
    observaciones: item.observaciones || '',
    estado,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
  };
}

function leerMantenimientosVehiculo(): VehiculoMantenimientoUI[] {
  return cacheMantenimientosVehiculo;
}

function asegurarSemillasMantenimiento() {
  return;
}

async function cargarMantenimientosVehiculoDesdeAPI() {
  try {
    const resp = await mantenimientoVehiculoService.getAll({ orden: 'recientes' });
    const raw = (resp as any).data || resp;
    const dataList = raw?.data || raw || [];

    cacheMantenimientosVehiculo = dataList.map((item: any) => normalizeMantenimientoVehiculo({
      id: Number(item.id || 0),
      id_vehiculo: Number(item.id_vehiculo || item.vehiculo?.id_vehiculo || 0),
      placa: item.vehiculo?.placa || '',
      marca: item.vehiculo?.marca || '',
      modelo: item.vehiculo?.modelo || '',
      motivo: item.motivo || '',
      tipo: item.tipo_mantenimiento || 'Preventivo',
      frecuencia_meses: item.programacion?.frecuencia_meses ?? undefined,
      fecha_programada: item.fecha_programada || '',
      fecha_realizado: item.fecha_realizado || '',
      kilometraje: item.kilometraje ?? undefined,
      observaciones: item.observaciones || '',
      estado: (item.estado || 'Programado') as VehiculoMantenimientoEstado,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error cargando mantenimientos de vehículo:', error);
    cacheMantenimientosVehiculo = [];
  }
}

async function cargarCalendarioMantenimientoVehiculoDesdeAPI() {
  try {
    const resp = await mantenimientoVehiculoService.getCalendario({
      mes: vehMantMes,
      anio: vehMantAnio,
      id_vehiculo: vehMantVehiculo ? Number(vehMantVehiculo) : undefined,
      estado: vehMantEstado === 'Todos' ? undefined : vehMantEstado,
      buscar: vehMantBusqueda || undefined,
    });

    const raw = (resp as any).data || resp;
    const data = raw?.data || raw;
    const dias = Array.isArray(data?.dias) ? data.dias : [];

    vehMantAnio = Number(data?.anio || vehMantAnio);

    cacheCalendarioResumen = {
      total: Number(data?.resumen?.total || 0),
      programados: Number(data?.resumen?.programados || 0),
      realizados: Number(data?.resumen?.realizados || 0),
      vencidos: Number(data?.resumen?.vencidos || 0),
      cancelados: Number(data?.resumen?.cancelados || 0),
    };

    cacheCalendarioMantenimientoVehiculo = dias.map((dia: any) => ({
      dia: Number(dia.dia || 0),
      fecha: dia.fecha || '',
      total: Number(dia.total || 0),
      programados: Number(dia.programados || 0),
      realizados: Number(dia.realizados || 0),
      vencidos: Number(dia.vencidos || 0),
      cancelados: Number(dia.cancelados || 0),
      items: Array.isArray(dia.items)
        ? dia.items.map((item: any) => normalizeMantenimientoVehiculo({
            id: Number(item.id || 0),
            id_vehiculo: Number(item.id_vehiculo || item.vehiculo?.id_vehiculo || 0),
            placa: item.vehiculo?.placa || '',
            marca: item.vehiculo?.marca || '',
            modelo: item.vehiculo?.modelo || '',
            motivo: item.motivo || '',
            tipo: item.tipo_mantenimiento || 'Preventivo',
            frecuencia_meses: item.programacion?.frecuencia_meses ?? undefined,
            fecha_programada: item.fecha_programada || '',
            fecha_realizado: item.fecha_realizado || '',
            kilometraje: item.kilometraje ?? undefined,
            observaciones: item.observaciones || '',
            estado: (item.estado || 'Programado') as VehiculoMantenimientoEstado,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
          }))
        : [],
    }));

    if (activeVehiculosTab === 'mantenimiento' && vehMantVista === 'calendario') {
      const container = document.getElementById('veh-mant-contenido');
      if (container) container.innerHTML = renderContenidoVehiculosMantenimiento();
      actualizarResumenMantenimientoUI();
      bindVehiculosMaintenanceEvents();
    }
  } catch (error) {
    console.error('Error cargando calendario de mantenimiento de vehículo:', error);
    cacheCalendarioMantenimientoVehiculo = [];
    cacheCalendarioResumen = { total: 0, programados: 0, realizados: 0, vencidos: 0, cancelados: 0 };
  }
}

function obtenerMantenimientosFiltrados(): VehiculoMantenimientoUI[] {
  return cacheMantenimientosVehiculo.filter((item) => {
    if (vehMantEstado !== 'Todos' && item.estado !== vehMantEstado) return false;
    if (vehMantVehiculo && String(item.id_vehiculo) !== vehMantVehiculo) return false;

    const busqueda = normalizeText(vehMantBusqueda);
    if (!busqueda) return true;

    const texto = normalizeText([
      item.placa,
      item.marca,
      item.modelo,
      item.motivo,
      item.tipo,
      item.observaciones || '',
      item.estado,
    ].join(' '));

    return texto.includes(busqueda);
  });
}

function obtenerHistorialFiltrado(): VehiculoMantenimientoUI[] {
  return cacheMantenimientosVehiculo
    .filter((item) => item.estado === 'Realizado')
    .filter((item) => {
      if (!vehMantHistoryBusqueda) return true;
      const busqueda = normalizeText(vehMantHistoryBusqueda);
      const texto = normalizeText([
        item.placa,
        item.marca,
        item.modelo,
        item.motivo,
        item.tipo,
        item.observaciones || '',
        item.fecha_realizado || item.updated_at,
      ].join(' '));
      return texto.includes(busqueda);
    });
}

function resumenMantenimiento() {
  if (vehMantVista === 'calendario') {
    return cacheCalendarioResumen;
  }

  const total = cacheMantenimientosVehiculo.length;
  const programados = cacheMantenimientosVehiculo.filter((item) => item.estado === 'Programado').length;
  const realizados = cacheMantenimientosVehiculo.filter((item) => item.estado === 'Realizado').length;
  const vencidos = cacheMantenimientosVehiculo.filter((item) => item.estado === 'Vencido').length;
  const cancelados = cacheMantenimientosVehiculo.filter((item) => item.estado === 'Cancelado').length;
  return { total, programados, realizados, vencidos, cancelados };
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

  function renderVehiculosHeaderActions(): string {
    if (activeVehiculosTab === 'mantenimiento') {
      return `
        <button class="btn-secondary" id="veh-btn-refrescar-mant">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15A9 9 0 1 1 23 10"></path></svg>
          Actualizar
        </button>
        <button class="btn-primary" id="veh-btn-nuevo-mant">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Programar mantenimiento
        </button>
      `;
    }

    if (activeVehiculosTab === 'historial') {
      return `
        <button class="btn-secondary" id="veh-btn-refrescar-hist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15A9 9 0 1 1 23 10"></path></svg>
          Actualizar
        </button>
      `;
    }

    return `
      <button class="btn-primary" id="veh-btn-nuevo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Nuevo Vehículo
      </button>
    `;
  }

  function renderVehiculosListTab(): string {
    return `
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

  function renderVehiculosMantenimientoTab(): string {
    const baseStyles = `display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:12px;`;

    return `
      <style>
        .veh-mant-calendar {
          display:grid;
          grid-template-columns:repeat(7, minmax(0, 1fr));
          background:#fff;
          border:1px solid #dbe4f0;
          border-radius:14px;
          overflow:hidden;
        }
        .veh-mant-day {
          min-height:118px;
          padding:10px;
          border-right:1px solid #e2e8f0;
          border-bottom:1px solid #e2e8f0;
          background:#fff;
          transition:background .18s ease;
          cursor:pointer;
        }
        .veh-mant-day:hover { background:#f8fafc; }
        .veh-mant-day-head {
          padding:10px;
          text-align:center;
          font-size:12px;
          font-weight:700;
          color:#334155;
          background:#eff6ff;
          border-bottom:1px solid #dbe4f0;
        }
        .veh-mant-detail {
          margin-top:16px;
          border:1px solid #dbe4f0;
          background:#fff;
          border-radius:14px;
          padding:18px;
        }
      </style>

      <div class="stats-row" style="${baseStyles} margin-bottom:16px;">
        <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Total</div><div class="stat-box-value" id="veh-mant-stat-total">--</div></div></div>
        <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Programados</div><div class="stat-box-value" id="veh-mant-stat-programados">--</div></div></div>
        <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Realizados</div><div class="stat-box-value" id="veh-mant-stat-realizados">--</div></div></div>
        <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Vencidos</div><div class="stat-box-value" id="veh-mant-stat-vencidos">--</div></div></div>
      </div>

      <div class="search-filter-bar" style="margin-bottom:16px; align-items:center;">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input id="veh-mant-busqueda" type="text" class="search-input" placeholder="Buscar por placa, tipo u observación...">
        </div>
        <select id="veh-mant-estado" class="op-filter-select">
          <option value="Todos">Todos</option>
          <option value="Programado">Programado</option>
          <option value="Realizado">Realizado</option>
          <option value="Vencido">Vencido</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        <select id="veh-mant-vehiculo" class="op-filter-select">
          <option value="">Todos los vehículos</option>
        </select>
        <select id="veh-mant-mes" class="op-filter-select" style="min-width:150px; ${vehMantVista === 'calendario' ? '' : 'display:none;'}">
          ${Array.from({ length: 12 }, (_, index) => index + 1).map((mes) => `<option value="${mes}" ${mes === vehMantMes ? 'selected' : ''}>${monthLabel(mes)}</option>`).join('')}
        </select>
        <div style="margin-left:auto; display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="op-filter-select" id="veh-mant-vista-lista" style="cursor:pointer; min-width:88px; ${vehMantVista === 'lista' ? 'background:#2563eb; color:#fff; border-color:#2563eb;' : ''}">Lista</button>
          <button type="button" class="op-filter-select" id="veh-mant-vista-calendario" style="cursor:pointer; min-width:100px; ${vehMantVista === 'calendario' ? 'background:#2563eb; color:#fff; border-color:#2563eb;' : ''}">Calendario</button>
        </div>
      </div>

      <div id="veh-mant-contenido">
        <div style="text-align:center; padding:32px; color:#64748b;">Cargando mantenimientos...</div>
      </div>

      <div class="modal-overlay" id="veh-mant-modal" style="display:none;">
        <div class="modal-container" style="max-width:640px;">
          <div class="modal-header">
            <h2 id="veh-mant-modal-title">Programar mantenimiento</h2>
            <button class="modal-close" id="veh-mant-modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="veh-mant-form-id" />
            <div class="os-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="os-field" style="grid-column:1/-1;">
                <label>Vehículo</label>
                <select id="veh-mant-form-vehiculo" class="os-input"></select>
              </div>
              <div class="os-field" style="grid-column:1/-1;">
                <label>Motivo</label>
                <input id="veh-mant-form-motivo" class="os-input" type="text" placeholder="Escriba el motivo del mantenimiento" maxlength="255" />
              </div>
              <div class="os-field">
                <label>Tipo</label>
                <select id="veh-mant-form-tipo" class="os-input">
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Limpieza">Limpieza</option>
                </select>
              </div>
              <div class="os-field">
                <label>Fecha programada</label>
                <input id="veh-mant-form-fecha" class="os-input" type="date" />
              </div>
              <div class="os-field">
                <label>Kilometraje</label>
                <input id="veh-mant-form-km" class="os-input" type="number" min="0" step="1" />
                <small style="display:block;margin-top:6px;color:#a16207;font-size:12px;">Aviso: se recomienda mantenimiento básico cada 5000 km.</small>
              </div>
              <div class="os-field" id="veh-mant-form-frecuencia-wrap" style="display:none;">
                <label>Frecuencia (meses)</label>
                <input id="veh-mant-form-frecuencia" class="os-input" type="number" min="1" step="1" value="6" />
                <small style="display:block;margin-top:6px;color:#475569;font-size:12px;">Para Limpieza la frecuencia sugerida es cada 6 meses, puedes editarla.</small>
              </div>
              <div class="os-field" style="grid-column:1/-1;">
                <label>Observaciones</label>
                <textarea id="veh-mant-form-obs" class="os-input" style="min-height:96px; resize:vertical;"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" id="veh-mant-form-cancel">Cancelar</button>
            <button class="btn-primary" id="veh-mant-form-save">Guardar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderVehiculosHistorialTab(): string {
    return `
      <div class="stats-row" style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Realizados</div><div class="stat-box-value" id="veh-hist-stat-realizados">--</div></div></div>
        <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Últimos 30 días</div><div class="stat-box-value" id="veh-hist-stat-30dias">--</div></div></div>
        <div class="stat-box"><div class="stat-box-content"><div class="stat-box-label">Vehículos con historial</div><div class="stat-box-value" id="veh-hist-stat-vehiculos">--</div></div></div>
      </div>

      <div class="search-filter-bar" style="margin-bottom:16px;">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input id="veh-hist-busqueda" type="text" class="search-input" placeholder="Buscar en historial...">
        </div>
      </div>

      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>FECHA REALIZADO</th>
              <th>VEHÍCULO</th>
              <th>MOTIVO</th>
              <th>TIPO</th>
              <th>KILOMETRAJE</th>
              <th>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody id="veh-hist-tbody">
            <tr><td colspan="5" style="text-align:center; padding:32px; color:#64748b;">Cargando historial...</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function renderVehiculosTabContent(): string {
    if (activeVehiculosTab === 'mantenimiento') return renderVehiculosMantenimientoTab();
    if (activeVehiculosTab === 'historial') return renderVehiculosHistorialTab();
    return renderVehiculosListTab();
  }

  function renderMantenimientoVehiculoRow(item: VehiculoMantenimientoUI): string {
    const kilometraje = item.kilometraje ? `${Number(item.kilometraje).toLocaleString('es-PE')} km` : '--';

    return `
      <tr>
        <td>
          <div style="font-weight:600; color:#0f172a;">${esc(item.placa)}</div>
          <div style="font-size:12px; color:#64748b;">${esc(item.marca)} ${esc(item.modelo)}</div>
        </td>
        <td>${esc(item.motivo || '--')}</td>
        <td>${esc(item.tipo)}</td>
        <td>${formatFecha(item.fecha_programada)}</td>
        <td>${kilometraje}</td>
        <td><span class="status-indicator ${estadoMantenimientoBadge(item.estado)}">${item.estado}</span></td>
        <td><div style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${esc(item.observaciones || '')}">${esc(item.observaciones || '--')}</div></td>
        <td>
          <div class="op-action-buttons">
            <button class="op-btn-icon veh-mant-edit" data-id="${item.id}" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>
            </button>
            ${item.estado !== 'Realizado' ? `
              <button class="op-btn-icon veh-mant-done" data-id="${item.id}" title="Marcar realizado" style="color:#16a34a;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
              </button>
            ` : `
              <button class="op-btn-icon veh-mant-done" data-id="${item.id}" title="Ya realizado" style="color:#64748b; opacity:.6;" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>
              </button>
            `}
            ${item.estado !== 'Cancelado' && item.estado !== 'Realizado' ? `
              <button class="op-btn-icon veh-mant-cancel" data-id="${item.id}" title="Cancelar mantenimiento" style="color:#ea580c;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </button>
            ` : `
              <button class="op-btn-icon veh-mant-cancel" data-id="${item.id}" title="Ya cancelado" style="color:#64748b; opacity:.6;" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </button>
            `}
            <button class="op-btn-icon veh-mant-delete" data-id="${item.id}" title="Eliminar" style="color:#dc2626;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderHistorialVehiculoRow(item: VehiculoMantenimientoUI): string {
    return `
      <tr>
        <td>${formatFechaHora(item.fecha_realizado || item.updated_at)}</td>
        <td>
          <div style="font-weight:600; color:#0f172a;">${esc(item.placa)}</div>
          <div style="font-size:12px; color:#64748b;">${esc(item.marca)} ${esc(item.modelo)}</div>
        </td>
        <td>${esc(item.motivo || '--')}</td>
        <td>${esc(item.tipo)}</td>
        <td>${item.kilometraje ? `${Number(item.kilometraje).toLocaleString('es-PE')} km` : '--'}</td>
        <td><div style="max-width:360px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${esc(item.observaciones || '')}">${esc(item.observaciones || '--')}</div></td>
      </tr>
    `;
  }

  function renderCalendarioMantenimientos(): string {
    const primerDia = new Date(vehMantAnio, vehMantMes - 1, 1);
    const ultimoDia = new Date(vehMantAnio, vehMantMes, 0);
    const totalDias = ultimoDia.getDate();
    const offset = (primerDia.getDay() + 6) % 7;
    const porDia: Record<number, VehiculoMantenimientoCalendarioDia> = {};
    cacheCalendarioMantenimientoVehiculo.forEach((dia) => {
      porDia[dia.dia] = dia;
    });

    const diasEncabezado = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      .map((dia) => `<div class="veh-mant-day-head">${dia}</div>`)
      .join('');

    const celdas: string[] = [];
    for (let i = 0; i < offset; i += 1) {
      celdas.push('<div style="min-height:118px; background:#f8fafc; border-right:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0;"></div>');
    }

    for (let dia = 1; dia <= totalDias; dia += 1) {
      const delDia = porDia[dia];
      const itemsDia = delDia?.items || [];
      const badges = {
        programados: delDia?.programados || 0,
        vencidos: delDia?.vencidos || 0,
        realizados: delDia?.realizados || 0,
        cancelados: delDia?.cancelados || 0,
      };

      const resumen = [];
      if (badges.programados > 0) resumen.push(`<span style="padding:2px 6px; border-radius:999px; background:#fef3c7; color:#92400e; font-size:10px;">${badges.programados} prog</span>`);
      if (badges.vencidos > 0) resumen.push(`<span style="padding:2px 6px; border-radius:999px; background:#fee2e2; color:#991b1b; font-size:10px;">${badges.vencidos} venc</span>`);
      if (badges.realizados > 0) resumen.push(`<span style="padding:2px 6px; border-radius:999px; background:#dcfce7; color:#166534; font-size:10px;">${badges.realizados} ok</span>`);
      if (badges.cancelados > 0) resumen.push(`<span style="padding:2px 6px; border-radius:999px; background:#f3f4f6; color:#4b5563; font-size:10px;">${badges.cancelados} can</span>`);

      const preview = itemsDia.slice(0, 2).map((item) => `<div style="font-size:11px; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(item.placa)} · ${esc(item.tipo)}</div>`).join('');
      const extra = itemsDia.length > 2 ? `<div style="font-size:11px; color:#6366f1;">+${itemsDia.length - 2} más</div>` : '';

      celdas.push(`
        <div class="veh-mant-day" data-dia="${dia}">
          <div style="font-size:13px; font-weight:700; color:#0f172a; margin-bottom:6px;">${dia}</div>
          <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:6px;">${resumen.join('')}</div>
          <div style="display:flex; flex-direction:column; gap:2px;">${preview}${extra}</div>
        </div>
      `);
    }

    return `
      <div class="veh-mant-calendar">
        ${diasEncabezado}
        ${celdas.join('')}
      </div>

      <div id="veh-mant-detalle-dia" class="veh-mant-detail" style="display:${vehMantDetailDia ? 'block' : 'none'};"></div>
    `;
  }

  function renderListaMantenimientosVehiculo(): string {
    const items = obtenerMantenimientosFiltrados();

    if (items.length === 0) {
      return '<div style="text-align:center; padding:40px; color:#64748b;">No hay mantenimientos para los filtros aplicados.</div>';
    }

    return `
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>VEHÍCULO</th>
              <th>MOTIVO</th>
              <th>TIPO</th>
              <th>FECHA</th>
              <th>KILOMETRAJE</th>
              <th>ESTADO</th>
              <th>OBSERVACIONES</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody id="veh-mant-tbody">
            ${items.map((item) => renderMantenimientoVehiculoRow(item)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderDetalleDiaMantenimiento(dia: number): string {
    const titulo = `${monthLabel(vehMantMes)} ${dia}`;
    if (vehMantRecordsDia.length === 0) {
      return `
        <div class="veh-mant-detail">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0; font-size:16px; color:#0f172a;">${titulo}</h3>
            <button class="btn-secondary" id="veh-mant-cerrar-dia">Cerrar</button>
          </div>
          <div style="color:#64748b;">No hay mantenimientos programados para este día.</div>
        </div>
      `;
    }

    return `
      <div class="veh-mant-detail">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:12px; flex-wrap:wrap;">
          <h3 style="margin:0; font-size:16px; color:#0f172a;">${titulo}</h3>
          <button class="btn-secondary" id="veh-mant-cerrar-dia">Cerrar</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${vehMantRecordsDia.map((item) => `
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; padding:12px; border:1px solid #e2e8f0; border-radius:10px; background:#fff;">
              <div style="min-width:0;">
                <div style="font-weight:600; color:#0f172a;">${esc(item.placa)} - ${esc(item.marca)} ${esc(item.modelo)}</div>
                <div style="font-size:12px; color:#64748b;">${esc(item.motivo || 'Sin motivo')} · ${esc(item.tipo)} · ${esc(item.observaciones || 'Sin observaciones')}</div>
              </div>
              <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
                <span class="status-indicator ${estadoMantenimientoBadge(item.estado)}">${item.estado}</span>
                ${item.estado !== 'Realizado' ? `<button class="op-btn-icon veh-mant-done" data-id="${item.id}" title="Marcar realizado" style="color:#16a34a;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg></button>` : ''}
                ${item.estado !== 'Cancelado' && item.estado !== 'Realizado' ? `<button class="op-btn-icon veh-mant-cancel" data-id="${item.id}" title="Cancelar mantenimiento" style="color:#ea580c;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderContenidoVehiculosMantenimiento(): string {
    if (vehMantVista === 'calendario') {
      return renderCalendarioMantenimientos();
    }
    return renderListaMantenimientosVehiculo();
  }

  function actualizarResumenMantenimientoUI() {
    const resumen = resumenMantenimiento();
    const total = document.getElementById('veh-mant-stat-total');
    const programados = document.getElementById('veh-mant-stat-programados');
    const realizados = document.getElementById('veh-mant-stat-realizados');
    const vencidos = document.getElementById('veh-mant-stat-vencidos');

    if (total) total.textContent = String(resumen.total);
    if (programados) programados.textContent = String(resumen.programados);
    if (realizados) realizados.textContent = String(resumen.realizados);
    if (vencidos) vencidos.textContent = String(resumen.vencidos);
  }

  function actualizarResumenHistorialUI() {
    const items = obtenerHistorialFiltrado();
    const total = document.getElementById('veh-hist-stat-realizados');
    const ultimos30 = document.getElementById('veh-hist-stat-30dias');
    const vehiculos = document.getElementById('veh-hist-stat-vehiculos');

    if (total) total.textContent = String(items.length);
    if (ultimos30) {
      const corte = new Date();
      corte.setDate(corte.getDate() - 30);
      const cantidad = items.filter((item) => {
        const fecha = new Date(item.fecha_realizado || item.updated_at);
        return !Number.isNaN(fecha.getTime()) && fecha >= corte;
      }).length;
      ultimos30.textContent = String(cantidad);
    }
    if (vehiculos) {
      const unicos = new Set(items.map((item) => item.id_vehiculo));
      vehiculos.textContent = String(unicos.size);
    }
  }

  function renderDetalleDiaVehiculos(dia: number) {
    const panel = document.getElementById('veh-mant-detalle-dia');
    if (!panel) return;

    vehMantDetailDia = dia;
    vehMantRecordsDia = cacheCalendarioMantenimientoVehiculo.find((item) => item.dia === dia)?.items || [];

    panel.outerHTML = renderDetalleDiaMantenimiento(dia);

    document.getElementById('veh-mant-cerrar-dia')?.addEventListener('click', () => {
      vehMantDetailDia = null;
      vehMantRecordsDia = [];
      actualizarTabVehiculosContenido();
    });

    document.querySelectorAll<HTMLButtonElement>('.veh-mant-done').forEach((btn) => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id || 0);
        if (!id) return;
        marcarMantenimientoVehiculoComoRealizado(id);
      };
    });

    document.querySelectorAll<HTMLButtonElement>('.veh-mant-cancel').forEach((btn) => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id || 0);
        if (!id) return;
        marcarMantenimientoVehiculoComoCancelado(id);
      };
    });
  }

  function abrirModalMantenimientoVehiculo(item?: VehiculoMantenimientoUI) {
    const modal = document.getElementById('veh-mant-modal') as HTMLElement | null;
    if (!modal) return;

    const selectVehiculo = document.getElementById('veh-mant-form-vehiculo') as HTMLSelectElement | null;
    if (selectVehiculo) {
      selectVehiculo.innerHTML = '<option value="">Seleccione un vehículo...</option>' + cacheVehiculos
        .map((vehiculo) => `<option value="${vehiculo.id}">${esc(vehiculo.placa)} - ${esc(vehiculo.marca)} ${esc(vehiculo.modelo)}</option>`)
        .join('');
    }

    (document.getElementById('veh-mant-modal-title') as HTMLElement).textContent = item ? 'Editar mantenimiento' : 'Programar mantenimiento';
    (document.getElementById('veh-mant-form-id') as HTMLInputElement).value = item ? String(item.id) : '';
    (document.getElementById('veh-mant-form-vehiculo') as HTMLSelectElement).value = item ? String(item.id_vehiculo) : '';
    (document.getElementById('veh-mant-form-motivo') as HTMLInputElement).value = item?.motivo || '';
    (document.getElementById('veh-mant-form-tipo') as HTMLSelectElement).value = item?.tipo || 'Preventivo';
    (document.getElementById('veh-mant-form-fecha') as HTMLInputElement).value = item?.fecha_programada || hoyIso();
    (document.getElementById('veh-mant-form-km') as HTMLInputElement).value = item?.kilometraje ? String(item.kilometraje) : '';
    (document.getElementById('veh-mant-form-frecuencia') as HTMLInputElement).value = item?.frecuencia_meses ? String(item.frecuencia_meses) : '6';
    (document.getElementById('veh-mant-form-obs') as HTMLTextAreaElement).value = item?.observaciones || '';

    actualizarCamposTipoMantenimiento();

    modal.style.display = 'flex';
  }

  function cerrarModalMantenimientoVehiculo() {
    const modal = document.getElementById('veh-mant-modal') as HTMLElement | null;
    if (modal) modal.style.display = 'none';
  }

  function leerFormMantenimientoVehiculo() {
    const id = Number((document.getElementById('veh-mant-form-id') as HTMLInputElement).value || 0);
    const idVehiculo = Number((document.getElementById('veh-mant-form-vehiculo') as HTMLSelectElement).value || 0);
    const motivo = (document.getElementById('veh-mant-form-motivo') as HTMLInputElement).value.trim();
    const tipo = (document.getElementById('veh-mant-form-tipo') as HTMLSelectElement).value as 'Preventivo' | 'Correctivo' | 'Limpieza';
    const fechaProgramada = (document.getElementById('veh-mant-form-fecha') as HTMLInputElement).value;
    const kilometrajeValor = (document.getElementById('veh-mant-form-km') as HTMLInputElement).value;
    const frecuenciaValor = (document.getElementById('veh-mant-form-frecuencia') as HTMLInputElement)?.value || '';
    const frecuenciaMeses = tipo === 'Limpieza' && frecuenciaValor ? Number(frecuenciaValor) : undefined;
    const observaciones = (document.getElementById('veh-mant-form-obs') as HTMLTextAreaElement).value.trim();

    const vehiculo = getVehiculoById(idVehiculo);

    return {
      id,
      payload: normalizeMantenimientoVehiculo({
        id,
        id_vehiculo: idVehiculo,
        placa: vehiculo?.placa || '',
        marca: vehiculo?.marca || '',
        modelo: vehiculo?.modelo || '',
        motivo,
        tipo,
        frecuencia_meses: frecuenciaMeses,
        fecha_programada: fechaProgramada,
        kilometraje: kilometrajeValor ? Number(kilometrajeValor) : undefined,
        observaciones,
        estado: 'Programado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    };
  }

  async function guardarMantenimientoVehiculo() {
    const { id, payload } = leerFormMantenimientoVehiculo();

    if (!payload.id_vehiculo || !payload.fecha_programada || !payload.motivo) {
      mostrarToast('error', 'Validación', 'Seleccione un vehículo, escriba el motivo y defina la fecha programada');
      return;
    }

    const vehiculo = getVehiculoById(payload.id_vehiculo);
    if (!vehiculo) {
      mostrarToast('error', 'Validación', 'El vehículo seleccionado no está disponible');
      return;
    }

    if (payload.tipo === 'Limpieza' && (!payload.frecuencia_meses || payload.frecuencia_meses < 1)) {
      mostrarToast('error', 'Validación', 'Para tipo Limpieza debe ingresar una frecuencia válida en meses');
      return;
    }

    if (id > 0) {
      await mantenimientoVehiculoService.update(id, {
        id_vehiculo: payload.id_vehiculo,
        motivo: payload.motivo,
        tipo_mantenimiento: payload.tipo,
        fecha_programada: payload.fecha_programada,
        frecuencia_meses: payload.tipo === 'Limpieza' ? payload.frecuencia_meses : 0,
        kilometraje: payload.kilometraje,
        observaciones: payload.observaciones,
      } as any);
      mostrarToast('success', 'Actualizado', 'Mantenimiento actualizado correctamente');
    } else {
      await mantenimientoVehiculoService.create({
        id_vehiculo: payload.id_vehiculo,
        motivo: payload.motivo,
        tipo_mantenimiento: payload.tipo,
        fecha_programada: payload.fecha_programada,
        frecuencia_meses: payload.tipo === 'Limpieza' ? payload.frecuencia_meses : 0,
        kilometraje: payload.kilometraje,
        observaciones: payload.observaciones,
      });
      mostrarToast('success', 'Programado', 'Mantenimiento registrado correctamente');
    }

    cerrarModalMantenimientoVehiculo();
    await cargarMantenimientosVehiculoDesdeAPI();
    actualizarTabVehiculosContenido();
  }

  async function marcarMantenimientoVehiculoComoRealizado(id: number) {
    await mantenimientoVehiculoService.marcarRealizado(id);
    mostrarToast('success', 'Actualizado', 'Mantenimiento marcado como realizado');
    await cargarMantenimientosVehiculoDesdeAPI();
    actualizarTabVehiculosContenido();
  }

  async function marcarMantenimientoVehiculoComoCancelado(id: number) {
    if (!confirm('¿Cambiar el estado de este mantenimiento a Cancelado?')) return;

    await mantenimientoVehiculoService.update(id, {
      estado: 'Cancelado',
    } as any);

    mostrarToast('success', 'Actualizado', 'Mantenimiento marcado como cancelado');
    await cargarMantenimientosVehiculoDesdeAPI();
    actualizarTabVehiculosContenido();
  }

  async function eliminarMantenimientoVehiculo(id: number) {
    if (!confirm('¿Eliminar este mantenimiento?')) return;
    await mantenimientoVehiculoService.destroy(id);
    mostrarToast('success', 'Eliminado', 'Mantenimiento eliminado correctamente');
    await cargarMantenimientosVehiculoDesdeAPI();
    actualizarTabVehiculosContenido();
  }

  function bindVehiculosListEvents() {
    bindEvents();
  }

  function bindVehiculosMaintenanceEvents() {
    const busqueda = document.getElementById('veh-mant-busqueda') as HTMLInputElement | null;
    if (busqueda) {
      busqueda.value = vehMantBusqueda;
      busqueda.oninput = () => {
        vehMantBusqueda = busqueda.value.trim();
        if (vehMantVista === 'calendario') {
          void cargarCalendarioMantenimientoVehiculoDesdeAPI();
          return;
        }
        actualizarTabVehiculosContenido();
      };
    }

    const estado = document.getElementById('veh-mant-estado') as HTMLSelectElement | null;
    if (estado) {
      estado.value = vehMantEstado;
      estado.onchange = () => {
        vehMantEstado = estado.value as 'Todos' | VehiculoMantenimientoEstado;
        if (vehMantVista === 'calendario') {
          void cargarCalendarioMantenimientoVehiculoDesdeAPI();
          return;
        }
        actualizarTabVehiculosContenido();
      };
    }

    const vehiculo = document.getElementById('veh-mant-vehiculo') as HTMLSelectElement | null;
    if (vehiculo) {
      vehiculo.innerHTML = '<option value="">Todos los vehículos</option>' + cacheVehiculos.map((item) => `<option value="${item.id}" ${String(item.id) === vehMantVehiculo ? 'selected' : ''}>${esc(item.placa)} - ${esc(item.marca)} ${esc(item.modelo)}</option>`).join('');
      vehiculo.onchange = () => {
        vehMantVehiculo = vehiculo.value;
        if (vehMantVista === 'calendario') {
          void cargarCalendarioMantenimientoVehiculoDesdeAPI();
          return;
        }
        actualizarTabVehiculosContenido();
      };
    }

    const mes = document.getElementById('veh-mant-mes') as HTMLSelectElement | null;
    if (mes) {
      mes.value = String(vehMantMes);
      mes.onchange = () => {
        vehMantMes = Number(mes.value || new Date().getMonth() + 1);
        if (vehMantVista === 'calendario') {
          void cargarCalendarioMantenimientoVehiculoDesdeAPI();
          return;
        }
        actualizarTabVehiculosContenido();
      };
    }

    document.getElementById('veh-mant-vista-lista')?.addEventListener('click', () => {
      vehMantVista = 'lista';
      actualizarTabVehiculosContenido();
    });

    document.getElementById('veh-mant-vista-calendario')?.addEventListener('click', () => {
      vehMantVista = 'calendario';
      actualizarTabVehiculosContenido();
    });

    document.getElementById('veh-btn-nuevo-mant')?.addEventListener('click', () => abrirModalMantenimientoVehiculo());
    document.getElementById('veh-btn-refrescar-mant')?.addEventListener('click', async () => {
      await cargarMantenimientosVehiculoDesdeAPI();
      if (vehMantVista === 'calendario') {
        await cargarCalendarioMantenimientoVehiculoDesdeAPI();
      }
      actualizarTabVehiculosContenido();
    });

    const modal = document.getElementById('veh-mant-modal') as HTMLElement | null;
    document.getElementById('veh-mant-modal-close')?.addEventListener('click', cerrarModalMantenimientoVehiculo);
    document.getElementById('veh-mant-form-cancel')?.addEventListener('click', cerrarModalMantenimientoVehiculo);
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) cerrarModalMantenimientoVehiculo();
    });

    document.getElementById('veh-mant-form-save')?.addEventListener('click', guardarMantenimientoVehiculo);
    document.getElementById('veh-mant-form-tipo')?.addEventListener('change', actualizarCamposTipoMantenimiento);

    document.querySelectorAll<HTMLButtonElement>('.veh-mant-edit').forEach((btn) => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id || 0);
        const item = cacheMantenimientosVehiculo.find((entry) => entry.id === id);
        if (item) abrirModalMantenimientoVehiculo(item);
      };
    });

    document.querySelectorAll<HTMLButtonElement>('.veh-mant-done').forEach((btn) => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id || 0);
        if (!id) return;
        marcarMantenimientoVehiculoComoRealizado(id);
      };
    });

    document.querySelectorAll<HTMLButtonElement>('.veh-mant-delete').forEach((btn) => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id || 0);
        if (!id) return;
        eliminarMantenimientoVehiculo(id);
      };
    });

    document.querySelectorAll<HTMLButtonElement>('.veh-mant-cancel').forEach((btn) => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id || 0);
        if (!id) return;
        marcarMantenimientoVehiculoComoCancelado(id);
      };
    });

    document.querySelectorAll<HTMLElement>('.veh-mant-day').forEach((day) => {
      day.onclick = () => {
        const dia = Number(day.dataset.dia || 0);
        if (!dia) return;
        renderDetalleDiaVehiculos(dia);
      };
    });
  }

  function actualizarCamposTipoMantenimiento() {
    const tipoSelect = document.getElementById('veh-mant-form-tipo') as HTMLSelectElement | null;
    const frecuenciaWrap = document.getElementById('veh-mant-form-frecuencia-wrap') as HTMLElement | null;
    const frecuenciaInput = document.getElementById('veh-mant-form-frecuencia') as HTMLInputElement | null;
    if (!tipoSelect || !frecuenciaWrap || !frecuenciaInput) return;

    if (tipoSelect.value === 'Limpieza') {
      frecuenciaWrap.style.display = 'block';
      if (!frecuenciaInput.value) frecuenciaInput.value = '6';
      return;
    }

    frecuenciaWrap.style.display = 'none';
    frecuenciaInput.value = '6';
  }

  function bindVehiculosHistorialEvents() {
    const busqueda = document.getElementById('veh-hist-busqueda') as HTMLInputElement | null;
    if (busqueda) {
      busqueda.value = vehMantHistoryBusqueda;
      busqueda.oninput = () => {
        vehMantHistoryBusqueda = busqueda.value.trim();
        actualizarTabVehiculosContenido();
      };
    }

    document.getElementById('veh-btn-refrescar-hist')?.addEventListener('click', async () => {
      await cargarMantenimientosVehiculoDesdeAPI();
      actualizarTabVehiculosContenido();
    });
  }

  function actualizarBotonesTabs() {
    document.querySelectorAll<HTMLButtonElement>('.veh-tab-btn').forEach((btn) => {
      if (btn.dataset.tab === activeVehiculosTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function actualizarAccionesHeader() {
    const actions = document.getElementById('veh-page-actions');
    if (actions) actions.innerHTML = renderVehiculosHeaderActions();
  }

  function actualizarTabVehiculosContenido() {
    const content = document.getElementById('veh-tab-content');
    if (!content) return;

    cacheMantenimientosVehiculo = leerMantenimientosVehiculo();

    actualizarBotonesTabs();
    actualizarAccionesHeader();

    if (activeVehiculosTab === 'vehiculos') {
      content.innerHTML = renderVehiculosListTab();
      bindVehiculosListEvents();
      cargarVehiculos();
      return;
    }

    if (activeVehiculosTab === 'mantenimiento') {
      vehMantDetailDia = null;
      vehMantRecordsDia = [];
      content.innerHTML = renderVehiculosMantenimientoTab();
      asegurarSemillasMantenimiento();
      actualizarResumenMantenimientoUI();
      const container = document.getElementById('veh-mant-contenido');
      if (container) {
        if (vehMantVista === 'calendario') {
          container.innerHTML = '<div style="text-align:center; padding:32px; color:#64748b;">Cargando calendario...</div>';
        } else {
          container.innerHTML = renderContenidoVehiculosMantenimiento();
        }
      }
      bindVehiculosMaintenanceEvents();
      if (vehMantVista === 'calendario') {
        const mes = document.getElementById('veh-mant-mes') as HTMLSelectElement | null;
        if (mes) mes.style.display = 'block';
        void cargarCalendarioMantenimientoVehiculoDesdeAPI();
      }
      return;
    }

    content.innerHTML = renderVehiculosHistorialTab();
    actualizarResumenHistorialUI();
    const tbody = document.getElementById('veh-hist-tbody');
    if (tbody) {
      const items = obtenerHistorialFiltrado();
      tbody.innerHTML = items.length > 0
        ? items.map((item) => renderHistorialVehiculoRow(item)).join('')
        : '<tr><td colspan="5" style="text-align:center; padding:32px; color:#64748b;">No hay mantenimientos realizados aún.</td></tr>';
    }
    bindVehiculosHistorialEvents();
  }

  function bindVehiculosTabs() {
    document.querySelectorAll<HTMLButtonElement>('.veh-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        const tab = btn.dataset.tab as 'vehiculos' | 'mantenimiento' | 'historial' | undefined;
        if (!tab) return;
        activeVehiculosTab = tab;
        actualizarTabVehiculosContenido();
      };
    });
  }

  function bindVehiculosCurrentTabEvents() {
    if (activeVehiculosTab === 'mantenimiento') {
      bindVehiculosMaintenanceEvents();
      return;
    }

    if (activeVehiculosTab === 'historial') {
      bindVehiculosHistorialEvents();
      return;
    }

    bindVehiculosListEvents();
  }

export function renderAlmacenVehiculos(): string {
  return `
    <div class="page-header-with-breadcrumb">
      <div>
        <div class="breadcrumb">Gestión de Vehículos</div>
        <div class="breadcrumb-sub">Vehículos, programación de mantenimiento e historial</div>
      </div>
      <div class="page-actions" id="veh-page-actions"></div>
    </div>

    <div class="inventory-tabs" style="margin-bottom:20px;">
      <button class="tab-btn veh-tab-btn active" data-tab="vehiculos" type="button">Vehículos</button>
      <button class="tab-btn veh-tab-btn" data-tab="mantenimiento" type="button">Mantenimiento de vehículos</button>
      <button class="tab-btn veh-tab-btn" data-tab="historial" type="button">Historial de mantenimientos</button>
    </div>

    <div id="veh-tab-content">
      ${renderVehiculosTabContent()}
    </div>
  `;
}

export async function initVehiculosEvents() {
  await cargarMantenimientosVehiculoDesdeAPI();
  bindVehiculosTabs();
  actualizarAccionesHeader();
  bindVehiculosCurrentTabEvents();
  actualizarTabVehiculosContenido();
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

    asegurarSemillasMantenimiento();

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
