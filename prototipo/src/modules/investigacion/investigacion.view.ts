import { programacionServicioService } from '../programaciones/programacion-servicio/programacion-servicio.service';
import { formatoOperacionalAutomaticoService } from '../programaciones/programacion-servicio/formato-operacional-automatico.service';
import type { Programacion } from '../programaciones/programaciones.types';
import { abrirModalFormatoOperacionalAutomatico, abrirModalUbicacionesFormato } from '../programaciones/programacion-servicio/programacion-servicio.view';

interface ProgramacionExtendida extends Programacion {
  tipo_programacion?: string;
  tiene_formato_operacional?: boolean;
  id_correlativo?: string;
  orden_capacitacion?: any;
  orden_asesoria?: any;
  orden_servicio?: any;
  cliente?: any;
  planta?: any;
  local_sede?: string;
}

export function renderInvestigacion() {
  setTimeout(() => {
    cargarServiciosInvestigacion();
  }, 0);

  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Investigación</div>
      <div class="page-actions">
        <button class="btn-secondary" id="btn-actualizar-investigacion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Actualizar
        </button>
      </div>
    </div>

    <div class="search-filter-bar" style="margin-top: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
      <div class="search-input-wrapper" style="flex: 1; min-width: 250px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" id="investigacion-search" placeholder="Buscar por cliente..." class="search-input">
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <label style="font-size: 13px; color: #64748b; font-weight: 500;">Desde:</label>
        <input type="date" id="investigacion-date-from" class="form-control" style="width: auto; padding: 6px 12px;">
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <label style="font-size: 13px; color: #64748b; font-weight: 500;">Hasta:</label>
        <input type="date" id="investigacion-date-to" class="form-control" style="width: auto; padding: 6px 12px;">
      </div>
      <button class="btn-secondary btn-sm" id="btn-limpiar-filtro-investigacion" style="padding: 6px 12px; height: auto;">
        Limpiar filtros
      </button>
    </div>

    <div class="table-container" style="margin-top: 24px;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente / Sede</th>
            <th>Servicio</th>
            <th>Fecha Programada</th>
            <th>Estado</th>
            <th style="text-align:center;">Formato Operacional</th>
          </tr>
        </thead>
        <tbody id="investigacion-table-body">
          <tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b;">Cargando servicios...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formato Operacional -->
    <div class="prog-modal" id="modalFormatoOperacionalAutomatico" style="display:none; position: fixed; inset: 0; z-index: 9999; align-items: center; justify-content: center;">
      <div class="prog-modal-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.5);"></div>
      <div class="prog-modal-content prog-modal-large" style="position: relative; background: #fff; width: 90%; max-width: 1000px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 90vh;">
        <div class="prog-modal-header" style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">Gestionar Formato Operacional</h2>
          <button class="prog-modal-close" id="closeModalFormatoOperacionalAutomatico" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalFormatoOperacionalAutomaticoBody" style="padding: 20px; overflow-y: auto;"></div>
      </div>
    </div>

    <!-- Modal Ubicaciones Formato -->
    <div class="prog-modal" id="modalUbicacionesFormato" style="display:none; position: fixed; inset: 0; z-index: 9999; align-items: center; justify-content: center;">
      <div class="prog-modal-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.5);"></div>
      <div class="prog-modal-content" style="position: relative; background: #fff; width: 90%; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 90vh;">
        <div class="prog-modal-header" style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">Ubicaciones de Equipos</h2>
          <button class="prog-modal-close" id="closeModalUbicacionesFormato" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
        </div>
        <div class="prog-modal-body" id="modalUbicacionesFormatoBody" style="padding: 20px; overflow-y: auto;"></div>
      </div>
    </div>
  `;
}

let allProgramaciones: Programacion[] = [];

async function cargarServiciosInvestigacion() {
  const tbody = document.getElementById('investigacion-table-body');
  const btnActualizar = document.getElementById('btn-actualizar-investigacion');
  if (!tbody) return;

  if (btnActualizar) {
    btnActualizar.onclick = () => cargarServiciosInvestigacion();
  }

  // Bind modal close events
  const closeModal = () => {
    const modal = document.getElementById('modalFormatoOperacionalAutomatico');
    if (modal) modal.style.display = 'none';
    const modalUbicaciones = document.getElementById('modalUbicacionesFormato');
    if (modalUbicaciones) modalUbicaciones.style.display = 'none';
    document.body.style.overflow = 'auto';
  };
  document.getElementById('closeModalFormatoOperacionalAutomatico')?.addEventListener('click', closeModal);
  document.querySelector('#modalFormatoOperacionalAutomatico .prog-modal-overlay')?.addEventListener('click', closeModal);
  document.getElementById('closeModalUbicacionesFormato')?.addEventListener('click', closeModal);
  document.querySelector('#modalUbicacionesFormato .prog-modal-overlay')?.addEventListener('click', closeModal);

  try {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b;">Cargando servicios...</td></tr>';
    
    const response = await programacionServicioService.getAll();
    let lista = Array.isArray(response?.data) ? response.data : [];
    
    // Sort ascending by date (oldest/current to newest)
    lista.sort((a, b) => {
      const dateA = new Date(a.fecha_programada || 0).getTime();
      const dateB = new Date(b.fecha_programada || 0).getTime();
      return dateA - dateB;
    });

    allProgramaciones = lista;
    renderTablaInvestigacion();

    const searchInput = document.getElementById('investigacion-search') as HTMLInputElement;
    const dateFromInput = document.getElementById('investigacion-date-from') as HTMLInputElement;
    const dateToInput = document.getElementById('investigacion-date-to') as HTMLInputElement;
    const btnClear = document.getElementById('btn-limpiar-filtro-investigacion');
    
    if (searchInput) searchInput.addEventListener('input', () => renderTablaInvestigacion());
    if (dateFromInput) dateFromInput.addEventListener('change', () => renderTablaInvestigacion());
    if (dateToInput) dateToInput.addEventListener('change', () => renderTablaInvestigacion());
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (dateFromInput) dateFromInput.value = '';
        if (dateToInput) dateToInput.value = '';
        renderTablaInvestigacion();
      });
    }

  } catch (error) {
    console.error('Error cargando servicios para investigación:', error);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#b91c1c;">Error al cargar los servicios</td></tr>';
  }
}

function renderTablaInvestigacion() {
  const tbody = document.getElementById('investigacion-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('investigacion-search') as HTMLInputElement;
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  const dateFromInput = document.getElementById('investigacion-date-from') as HTMLInputElement;
  const dateToInput = document.getElementById('investigacion-date-to') as HTMLInputElement;
  
  const dateFrom = dateFromInput?.value ? new Date(dateFromInput.value).getTime() : 0;
  const dateTo = dateToInput?.value ? new Date(dateToInput.value).getTime() + 86400000 : Infinity; // +1 day to include the whole end day

  let filtered = allProgramaciones;
  
  if (searchTerm || dateFrom > 0 || dateTo !== Infinity) {
    filtered = filtered.filter(p => {
      const px = p as ProgramacionExtendida;
      const cliente = String(
        px.orden_servicio?.cliente?.nombre_empresa || 
        px.orden_capacitacion?.cliente?.nombre_empresa || 
        px.orden_asesoria?.cliente?.nombre_empresa || 
        px.cliente?.nombre_empresa || ''
      ).toLowerCase();
      
      const pTime = new Date(p.fecha_programada || 0).getTime();
      
      const matchesSearch = !searchTerm || cliente.includes(searchTerm);
      const matchesDate = pTime >= dateFrom && pTime <= dateTo;
      
      return matchesSearch && matchesDate;
    });
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b;">No se encontraron servicios</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const px = p as ProgramacionExtendida;
    const tipoRaw = (px.tipo_programacion || 'servicio').toLowerCase();
    const isService = tipoRaw === 'servicio';
    const hasFormato = px.tiene_formato_operacional;
    
    const cliente = px.orden_servicio?.cliente?.nombre_empresa 
      || px.orden_capacitacion?.cliente?.nombre_empresa 
      || px.orden_asesoria?.cliente?.nombre_empresa 
      || px.cliente?.nombre_empresa 
      || '---';
    
    const sede = px.planta?.nombre 
      || px.orden_servicio?.planta?.nombre 
      || px.local_sede 
      || px.orden_servicio?.sede?.direccion 
      || px.orden_capacitacion?.sede?.direccion 
      || px.orden_asesoria?.sede?.direccion 
      || '---';
      
    let servicio = '---';
    if (tipoRaw === 'capacitacion') servicio = px.orden_capacitacion?.servicio?.nombre || p.servicio?.nombre || 'Capacitación';
    else if (tipoRaw === 'asesoria') servicio = px.orden_asesoria?.servicio?.nombre || p.servicio?.nombre || 'Asesoría';
    else if (tipoRaw === 'visita') servicio = (px as any).tipo_visita || 'Visita';
    else if (tipoRaw === 'fabricacion') servicio = 'Fabricación';
    else if (tipoRaw === 'otros') servicio = (px as any).motivo || 'Otros';
    else servicio = p.servicio?.nombre || px.orden_servicio?.tipo_servicio || 'Servicio';
    
    const rawFecha = p.fecha_programada || '';
    const datePart = rawFecha.split('T')[0];
    const fechaStr = datePart ? datePart.split('-').reverse().join('/') : '---';
    const horaStr = p.hora_inicio ? p.hora_inicio.slice(0, 5) : '';
    const fecha = horaStr ? `${fechaStr} ${horaStr}` : fechaStr;
    
    let estadoClass = 'bg-slate-100 text-slate-700';
    if (p.estado_ejecucion === 'Realizado') estadoClass = 'bg-emerald-100 text-emerald-700';
    if (p.estado_ejecucion === 'Programado') estadoClass = 'bg-blue-100 text-blue-700';
    if (p.estado_ejecucion === 'Cancelado' || (p.estado_ejecucion as any) === 'Anulada') estadoClass = 'bg-red-100 text-red-700';

    let btnText = 'Crear Formato';
    let btnClass = 'btn-primary';
    let targetId = p.id;

    // Look for a previous programming in the same group that has a format
    const sameGroup = allProgramaciones.filter(pg => pg.id_orden_servicio === p.id_orden_servicio && pg.id_servicio === p.id_servicio);
    const prevProgWithFormat = sameGroup.find(pg => (pg as ProgramacionExtendida).tiene_formato_operacional && new Date(pg.fecha_programada || 0) <= new Date(p.fecha_programada || 0) && pg.id !== p.id);

    if (hasFormato) {
      btnText = 'Ver / Editar Formato';
      btnClass = 'btn-secondary';
    } else {
      if (prevProgWithFormat) {
        btnText = 'Ver Formato Heredado';
        btnClass = 'btn-secondary';
        targetId = prevProgWithFormat.id;
      }
    }
    
    // Solo mostramos botón si es tipo SERVICIO
    let btnHtml = '<span style="color:#94a3b8;font-size:12px;">No aplica</span>';
    if (isService) {
      if (hasFormato) {
        btnHtml = `
          <div style="display: flex; gap: 6px; justify-content: center;">
            <button class="${btnClass} btn-sm js-gestionar-formato" data-id="${targetId}" title="Ver / Editar Formato" style="padding: 6px 10px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-outline-primary btn-sm js-gestionar-ubicaciones" data-id="${targetId}" title="Gestionar Ubicaciones" style="padding: 6px 10px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </button>
          </div>
        `;
      } else if (prevProgWithFormat) {
        btnHtml = `
          <div style="display: flex; gap: 6px; justify-content: center;">
            <button class="${btnClass} btn-sm js-gestionar-formato" data-id="${targetId}" title="Ver Formato Heredado" style="padding: 6px 10px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </button>
            <button class="btn-outline-primary btn-sm js-gestionar-ubicaciones" data-id="${targetId}" title="Gestionar Ubicaciones" style="padding: 6px 10px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </button>
          </div>
        `;
      } else {
        btnHtml = `
          <button class="${btnClass} btn-sm js-gestionar-formato" data-id="${targetId}" title="Crear Formato" style="padding: 6px 12px; display: flex; align-items: center; gap: 6px; margin: 0 auto;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg> Crear
          </button>
        `;
      }
    }

    return `
      <tr>
        <td>
          <div style="font-weight: 500; color: #0f172a;">${cliente}</div>
          <div style="font-size: 12px; color: #64748b;">${sede}</div>
        </td>
        <td>${servicio}</td>
        <td>${fecha}</td>
        <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;" class="${estadoClass}">${p.estado_ejecucion || 'Pendiente'}</span></td>
        <td style="text-align:center;">${btnHtml}</td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.js-gestionar-formato').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idStr = (e.currentTarget as HTMLElement).dataset.id;
      if (idStr) {
        abrirModalFormatoOperacionalAutomatico(Number(idStr));
      }
    });
  });

  tbody.querySelectorAll('.js-gestionar-ubicaciones').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idStr = (e.currentTarget as HTMLElement).dataset.id;
      if (idStr) {
        abrirModalUbicacionesFormato(Number(idStr));
      }
    });
  });
}
