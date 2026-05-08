import { API_CONFIG } from '../../core/api/api.config'
import type { Programacion } from '../programaciones/programaciones.types'
import { programacionServicioService } from '../programaciones/programacion-servicio/programacion-servicio.service'

// Cache local para formatos cargados por programación (id -> formato)
const formatosCache = new Map<number, any>();
let informeGruposCache: ClienteMesGroup[] = [];
let informeGrupoSeleccionadoKey: string | null = null;
let informeServiciosPorId = new Map<number, ProgramacionConEvidencias>();

type FichaOperacionalApiData = any;
type FormatoOperacionalApiData = any;

// Operaciones e Informes View

type ProgramacionConEvidencias = Programacion & {
  id_grupo_programacion?: number | null;
  fotos_evidencia?: unknown;
}

// Modal: Crear Informe (visual)
export function renderCrearInformeModal(prefillCliente = ''): string {
  return `
    <div class="modal-overlay js-close-crear-informe" style="position:fixed;inset:0;background:rgba(15,23,42,0.65);display:flex;align-items:center;justify-content:center;z-index:3000;padding:20px;">
      <div class="modal-content" style="background:#fff;border-radius:14px;max-width:860px;width:min(860px,100%);max-height:90vh;overflow:auto;padding:18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <h3 style="margin:0 0 6px 0;font-size:18px;color:#0f172a;">Crear Informe Técnico</h3>
            <p style="margin:0;color:#475569;font-size:13px;">Formulario visual para registrar un informe con evidencias (simulado)</p>
          </div>
          <button class="btn-secondary js-close-crear-informe" type="button">Cerrar</button>
        </div>

        <form id="operaciones-crear-informe-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="grid-column:1 / -1;display:grid;grid-template-columns:160px 1fr;align-items:center;gap:8px;">
            <label style="font-weight:700;color:#334155;">Código de Informe</label>
            <input name="codigo_informe" type="text" placeholder="AQO-12-25" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Cliente</label>
            <input name="cliente" type="text" value="${escapeHtml(prefillCliente)}" placeholder="Nombre del cliente" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Ubicación</label>
            <input name="ubicacion" type="text" placeholder="Dirección, distrito" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Actividad</label>
            <input name="actividad" type="text" placeholder="Manejo integrado de plagas" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Mes de la Actividad</label>
            <input name="mes_actividad" type="month" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Fecha de Emisión</label>
            <input name="fecha_emision" type="date" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Elaborado por</label>
            <input name="elaborado_por" type="text" placeholder="Nombre del responsable" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Nº de visitas</label>
            <input name="n_visitas" type="number" min="0" value="1" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="grid-column:1 / -1;display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Fechas de Visitas (separadas por coma)</label>
            <input name="fechas_visitas" type="text" placeholder="10/12/2025, 23/12/2025" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="display:grid;gap:6px;">
            <label style="font-weight:600;color:#334155;">Nº de Fichas</label>
            <input name="n_fichas" type="text" placeholder="007678" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;" />
          </div>

          <div style="grid-column:1 / -1;display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
            <button type="button" class="btn-secondary js-close-crear-informe">Cancelar</button>
            <button type="submit" class="btn-primary">Crear Informe (simulado)</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function abrirModalCrearInforme(prefillCliente = '') {
  const existing = document.getElementById('operaciones-crear-informe-host');
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = 'operaciones-crear-informe-host';
  host.innerHTML = renderCrearInformeModal(prefillCliente);
  document.body.appendChild(host);

  const close = () => host.remove();

  host.querySelectorAll('.js-close-crear-informe').forEach(el => el.addEventListener('click', close));

  const form = host.querySelector('#operaciones-crear-informe-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload: Record<string, string> = {};
    data.forEach((value, key) => { payload[key] = String(value || '').trim(); });

    // Validación mínima
    if (!payload.cliente) {
      alert('Por favor complete el campo Cliente.');
      return;
    }

    // Aquí solo simulamos la creación visual del informe.
    console.log('Crear Informe (simulado):', payload);
    alert('Informe creado (simulado). Luego implementaremos el backend para persistirlo.');
    close();
  });
}

export function initInformesClienteEvents() {
  // Botones para abrir el modal de creación dentro de la tabla de Informes por Cliente
  document.querySelectorAll('.js-crear-informe').forEach((button) => {
    button.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const cliente = target.dataset.cliente || '';
      abrirModalCrearInforme(cliente);
    });
  });
}

export function initCrearInformeEvents() {
  // Esta función se llamará cuando se renderice el tab "Crear Informe"
  // y cargará los servicios realizados del "Servicio del Día"
  setTimeout(() => {
    void cargarServiciosParaCrearInforme();
  }, 100);
}

async function cargarServiciosParaCrearInforme() {
  const container = document.querySelector('#operaciones-servicios-lista') as HTMLElement | null;
  if (!container) return;

  try {
    const response = await programacionServicioService.getAll();
    const lista = Array.isArray(response?.data) ? response.data : [];

    const realizados = lista
      .filter((item): item is Programacion => Boolean(item))
      .filter((item) => item.estado_ejecucion === 'Realizado');
    
    if (realizados.length === 0) {
      container.innerHTML = '<p style="color:#64748b;font-size:13px;">No hay servicios realizados disponibles</p>';
      return;
    }

    const grupos = mapServiciosPorClienteMes(realizados);
    informeGruposCache = grupos;
    informeGrupoSeleccionadoKey = grupos[0]?.key ?? null;
    informeServiciosPorId = new Map(realizados.map((item) => [item.id, item as ProgramacionConEvidencias]));

    const form = document.querySelector('#operaciones-crear-informe-form-principal') as HTMLFormElement | null;
    const detalleContainer = document.querySelector('#operaciones-informe-detalle') as HTMLElement | null;
    const searchInput = document.querySelector('.js-servicio-search') as HTMLInputElement | null;

    const renderList = (filterText = '') => {
      const normalized = filterText.trim().toLowerCase();
      const visibleGroups = normalized.length > 0
        ? grupos.filter((group) => {
            const hayTexto = `${group.cliente} ${group.monthLabel} ${group.visitas.map((v) => v.serviceName).join(' ')}`.toLowerCase();
            return hayTexto.includes(normalized);
          })
        : grupos;

      container.innerHTML = renderListaCrearInformeGrupos(visibleGroups);

      container.querySelectorAll('.js-grupo-informe-item').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const target = e.currentTarget as HTMLButtonElement;
          const groupIdx = Number(target.dataset.groupIdx || '0');
          const group = visibleGroups[groupIdx];
          if (!group) return;

          informeGrupoSeleccionadoKey = group.key;
          renderList(searchInput?.value || '');
          await cargarDetalleGrupoInforme(group);
        });
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderList(searchInput.value);
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const payload: Record<string, string> = {};
        data.forEach((value, key) => { payload[key] = String(value || '').trim(); });

        if (!payload.cliente) {
          alert('Por favor selecciona un cliente para generar el informe.');
          return;
        }
        if (!payload.codigo_informe) {
          alert('Por favor completa el código de informe.');
          return;
        }

        console.log('Crear Informe (simulado):', payload);
        alert(`Informe ${payload.codigo_informe} creado exitosamente (simulado). Backend: siguiente paso.`);
        form.reset();
      });

      const hojaSelect = form.querySelector('.js-hoja-tipo-select') as HTMLSelectElement | null;
      if (hojaSelect) {
        hojaSelect.addEventListener('change', () => {
          const current = informeGruposCache.find((group) => group.key === informeGrupoSeleccionadoKey) || informeGruposCache[0];
          if (current) {
            void cargarDetalleGrupoInforme(current);
          }
        });
      }
    }

    renderList(searchInput?.value || '');
    const current = informeGruposCache.find((group) => group.key === informeGrupoSeleccionadoKey) || informeGruposCache[0];
    if (current) {
      await cargarDetalleGrupoInforme(current);
    } else if (detalleContainer) {
      detalleContainer.innerHTML = '<div style="color:#64748b;font-size:13px;">Selecciona un cliente para ver el detalle por visitas.</div>';
    }
  } catch (error) {
    console.error('Error cargando servicios para crear informe:', error);
    container.innerHTML = '<p style="color:#b91c1c;font-size:13px;">Error cargando servicios</p>';
  }
}

function aplicarFormatoAlFormulario(formEl: HTMLFormElement | null, formatoData: any, tipoHoja: 'verdadera' | 'falsa') {
  if (!formEl || !formatoData) return;

  // Rellenar código de informe con el código del formato si existe
  const codigo = formatoData.codigo_documento ?? formatoData.codigoDocumento ?? '';
  const codigoInput = formEl.querySelector('[name="codigo_informe"]') as HTMLInputElement | null;
  if (codigoInput && codigo) codigoInput.value = String(codigo);

  // Agregar dispositivos (codigo, ubicacion) extraídos de las secciones
  const dispositivosContainer = document.querySelector('#operaciones-dispositivos-preview') as HTMLElement | null;
  if (!dispositivosContainer) return;

  const devices: Array<{ codigo: string; ubicacion: string }> = [];
  const secciones = Array.isArray(formatoData.secciones) ? formatoData.secciones : [];
  for (const s of secciones) {
    const items = Array.isArray(s.items) ? s.items : [];
    for (const it of items) {
      const codigoCaja = String((it.codigo_caja ?? it.codigoCaja ?? it.codigo) || '').trim();
      const ubicacion = String(it.ubicacion || '').trim();
      if (codigoCaja) devices.push({ codigo: codigoCaja, ubicacion });
    }
  }

  if (devices.length === 0) {
    dispositivosContainer.innerHTML = '<div style="color:#64748b;font-size:13px;">No hay dispositivos en el Formato Operacional.</div>';
    return;
  }

  dispositivosContainer.innerHTML = `
    <div style="font-weight:700;color:#0f172a;margin-bottom:6px;">Dispositivos del Formato (${tipoHoja === 'verdadera' ? 'Hoja Verdadera' : 'Hoja Falsa'})</div>
    <div style="border:1px solid #e6eef7;border-radius:8px;padding:8px;background:#fbfdff;max-height:200px;overflow:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="text-align:left;color:#475569;font-weight:700;font-size:12px;"><th style="padding:6px;border-bottom:1px solid #e6eef7;">Código</th><th style="padding:6px;border-bottom:1px solid #e6eef7;">Ubicación</th></tr>
        </thead>
        <tbody>
          ${devices.map(d => `<tr><td style="padding:8px;border-bottom:1px dashed #eef3fb;">${escapeHtml(d.codigo)}</td><td style="padding:8px;border-bottom:1px dashed #eef3fb;">${escapeHtml(d.ubicacion)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderFormatoVisitaResumen(formato: FormatoOperacionalViewModel, tipoHoja: 'verdadera' | 'falsa'): string {
  if (!formato || !Array.isArray(formato.secciones) || formato.secciones.length === 0) {
    return '<div style="color:#64748b;font-size:13px;">Sin información de formato para esta visita.</div>';
  }

  const formatosPresentesSet = new Set<string>();
  for (const seccion of formato.secciones) {
    const normalizado = normalizeText(`${seccion.titulo} ${seccion.tipo}`);
    if (normalizado.includes('trampa') && normalizado.includes('luz')) {
      formatosPresentesSet.add('voladores');
    } else if (normalizado.includes('lamina') && (normalizado.includes('rastreros') || normalizado.includes('pegante'))) {
      formatosPresentesSet.add('rastreros');
    } else {
      formatosPresentesSet.add('roedores');
    }
  }

  const esRastreros = isRastrerosFormato(formato) && formatosPresentesSet.size === 1;
  const esVoladores = isVoladoresFormato(formato) && formatosPresentesSet.size === 1;
  const sheetTitle = tipoHoja === 'verdadera' ? 'Hoja Verdadera' : 'Hoja Falsa';

  const renderRoedores = (secciones: Array<FormatoOperacionalViewModel['secciones'][number]>) => `
    <div style="display:grid;gap:10px;">
      ${secciones.map((seccion) => `
        <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;background:#fff;">
          <div style="padding:6px 10px;border-bottom:1px solid #cbd5e1;background:#f8fafc;font-size:13px;font-weight:700;color:#334155;">${escapeHtml(seccion.titulo)} (${seccion.cantidad})</div>
          <div style="overflow:auto;">
            <table style="width:100%;border-collapse:collapse;margin:0;">
              <thead>
                <tr style="background:#eff6ff;">
                  <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Código</th>
                  <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Ubicación</th>
                  <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Estado</th>
                  <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Hallazgo</th>
                  <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Señales</th>
                </tr>
              </thead>
              <tbody>
                ${seccion.items.map((item) => {
                  const estado = tipoHoja === 'verdadera' ? item.estadoDispositivoVerdadera : item.estadoDispositivoAuditiva;
                  const hallazgo = tipoHoja === 'verdadera' ? item.hallazgoVerdadera : item.hallazgoAuditiva;
                  const senales = tipoHoja === 'verdadera' ? item.senalesPresenciaVerdadera : item.senalesPresenciaAuditiva;
                  return `
                    <tr>
                      <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(item.codigoCaja))}</td>
                      <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(item.ubicacion))}</td>
                      <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(estado))}</td>
                      <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(hallazgo, '-'))}</td>
                      <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(senales, '-'))}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const renderRastreros = (secciones: Array<FormatoOperacionalViewModel['secciones'][number]>) => {
    const estadioOrden = ['ADULTO', 'NINFA', 'OOTECA'];
    const parseConteoEstadio = (value: any) => {
      if (!value) return {};
      if (Array.isArray(value)) {
        return value.reduce((acc: any, entry: any) => {
          const nombre = String(entry?.estadio ?? entry?.label ?? entry?.nombre ?? '').trim().toUpperCase();
          if (!nombre) return acc;
          acc[nombre] = {
            verdadera: Number(entry?.verdadera ?? entry?.conteo_verdadera ?? entry?.conteo ?? entry?.cantidad ?? entry?.valor ?? 0) || 0,
            falsa: Number(entry?.falsa ?? entry?.auditiva ?? entry?.conteo_falsa ?? 0) || 0,
          };
          return acc;
        }, {});
      }
      if (typeof value === 'object') {
        return Object.entries(value as Record<string, any>).reduce((acc: any, [key, raw]) => {
          const nombre = String(key ?? '').trim().toUpperCase();
          if (!nombre) return acc;
          acc[nombre] = {
            verdadera: Number(raw?.verdadera ?? raw?.conteo_verdadera ?? raw?.conteo ?? raw?.cantidad ?? raw?.valor ?? raw?.count ?? 0) || 0,
            falsa: Number(raw?.falsa ?? raw?.auditiva ?? raw?.conteo_falsa ?? 0) || 0,
          };
          return acc;
        }, {});
      }
      return {};
    };

    return `
      <div style="display:grid;gap:10px;">
        ${secciones.map((seccion) => `
          <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;background:#fff;">
            <div style="padding:6px 10px;border-bottom:1px solid #cbd5e1;background:#f8fafc;font-size:13px;font-weight:700;color:#334155;">${escapeHtml(seccion.titulo)} (${seccion.cantidad})</div>
            <div style="overflow:auto;">
              <table style="width:100%;border-collapse:collapse;margin:0;min-width:680px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:left;">Ubicación</th>
                    <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:center;">N°</th>
                    <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:left;">Estadio</th>
                    <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:center;">Conteo</th>
                    <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:left;">Estado de lámina</th>
                  </tr>
                </thead>
                <tbody>
                  ${seccion.items.map((item) => {
                    const estadoLamina = fallbackText(item.estadoLamina, '-');
                    const estadio = fallbackText(item.estadio, '-');
                    const conteoPorEstadio = parseConteoEstadio(item.conteoEstadio);
                    const keys = Object.keys(conteoPorEstadio);
                    if (keys.length > 0) {
                      return estadioOrden
                        .filter((est) => Object.prototype.hasOwnProperty.call(conteoPorEstadio, est))
                        .map((est, idxEst) => `
                          <tr>
                            ${idxEst === 0 ? `<td rowspan="${Math.max(1, estadioOrden.filter((e) => Object.prototype.hasOwnProperty.call(conteoPorEstadio, e)).length)}" style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;vertical-align:middle;">${escapeHtml(fallbackText(item.ubicacion))}</td>` : ''}
                            ${idxEst === 0 ? `<td rowspan="${Math.max(1, estadioOrden.filter((e) => Object.prototype.hasOwnProperty.call(conteoPorEstadio, e)).length)}" style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;vertical-align:middle;font-weight:700;">${escapeHtml(fallbackText(item.codigoCaja))}</td>` : ''}
                            <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(est)}</td>
                            <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:700;">${tipoHoja === 'verdadera' ? Number(conteoPorEstadio[est]?.verdadera ?? 0) : Number(conteoPorEstadio[est]?.falsa ?? 0)}</td>
                            ${idxEst === 0 ? `<td rowspan="${Math.max(1, estadioOrden.filter((e) => Object.prototype.hasOwnProperty.call(conteoPorEstadio, e)).length)}" style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;vertical-align:middle;">${escapeHtml(estadoLamina)}</td>` : ''}
                          </tr>
                        `).join('');
                    }

                    return `
                      <tr>
                        <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(item.ubicacion))}</td>
                        <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:700;">${escapeHtml(fallbackText(item.codigoCaja))}</td>
                        <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(estadio)}</td>
                        <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:700;">${tipoHoja === 'verdadera' ? Number(item.conteoEstadioVerdadera ?? 0) : Number(item.conteoEstadioFalsa ?? 0)}</td>
                        <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(estadoLamina)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const renderVoladores = (secciones: Array<FormatoOperacionalViewModel['secciones'][number]>) => `
    <div style="display:grid;gap:10px;">
      ${secciones.map((seccion) => `
        <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;background:#fff;">
          <div style="padding:6px 10px;border-bottom:1px solid #cbd5e1;background:#f8fafc;font-size:13px;font-weight:700;color:#334155;">${escapeHtml(seccion.titulo)} (${seccion.cantidad})</div>
          <div style="display:grid;gap:12px;padding:10px;">
            ${seccion.items.map((item) => {
              const estado = tipoHoja === 'verdadera' ? item.estadoDispositivoVerdadera : item.estadoDispositivoAuditiva;
              const conteos = item.conteoInsectos ?? {};
              const getConteo = (key: string) => {
                const raw = conteos[key];
                if (!raw) return 0;
                return tipoHoja === 'verdadera' ? Number(raw.verdadera ?? 0) : Number(raw.auditiva ?? 0);
              };

              return `
                <div style="border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#fafafa;">
                  <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;background:#eff6ff;font-size:12px;font-weight:600;color:#1e40af;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;">
                    <span>Código: ${escapeHtml(fallbackText(item.codigoCaja))}</span>
                    <span>Ubicación: ${escapeHtml(fallbackText(item.ubicacion))}</span>
                    <span>Estado: ${escapeHtml(fallbackText(estado))}</span>
                  </div>
                  <div style="overflow:auto;">
                    <table style="width:100%;border-collapse:collapse;margin:0;min-width:420px;">
                      <thead>
                        <tr style="background:#f0f9ff;">
                          <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Insecto</th>
                          <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:center;">Conteo</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${INSECTOS_VOLADORES.map((insecto) => `
                          <tr>
                            <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(insecto.label)}</td>
                            <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:600;">${getConteo(insecto.key)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const hojas = Array.from(formatosPresentesSet);
  const bloque = esRastreros
    ? renderRastreros(formato.secciones)
    : esVoladores
      ? renderVoladores(formato.secciones)
      : renderRoedores(formato.secciones);

  return `
    <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;background:#fff;">
      <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;background:#e2e8f0;text-align:center;font-size:13px;font-weight:800;color:#0f172a;">
        ${sheetTitle}${hojas.length > 1 ? ` • ${hojas.join(' + ')}` : ''}
      </div>
      <div style="padding:10px;">${bloque}</div>
    </div>
  `;
}

function renderEvidenciasVisita(visita: ClienteVisitaViewModel): string {
  if (!visita.evidenceImages || visita.evidenceImages.length === 0) {
    return '<div style="color:#64748b;font-size:13px;">Sin evidencias registradas para esta visita.</div>';
  }

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">
      ${visita.evidenceImages.map((url) => `
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display:block;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#f8fafc;">
          <img src="${escapeHtml(url)}" alt="Evidencia ${escapeHtml(visita.titulo)}" style="width:100%;height:110px;object-fit:cover;display:block;" loading="lazy" />
        </a>
      `).join('')}
    </div>
  `;
}

function renderInformeVisitaCard(visita: ClienteVisitaViewModel, formato: FormatoOperacionalViewModel | null, tipoHoja: 'verdadera' | 'falsa', index: number): string {
  return `
    <section style="border:1px solid #dbe7f2;border-radius:12px;background:#fff;overflow:hidden;display:grid;gap:12px;padding:14px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-size:14px;font-weight:800;color:#0f172a;">Visita ${index + 1}</div>
          <div style="font-size:13px;color:#475569;">${escapeHtml(visita.serviceName)} • ${escapeHtml(visita.fechaLabel)}</div>
        </div>
        <div style="font-size:12px;color:#64748b;">${escapeHtml(visita.tecnicosLabel)}</div>
      </div>

      <div style="display:grid;gap:8px;">
        <h4 style="margin:0;font-size:13px;color:#0f172a;">Dispositivos del Formato (${tipoHoja === 'verdadera' ? 'Hoja Verdadera' : 'Hoja Falsa'})</h4>
        ${formato ? renderFormatoVisitaResumen(formato, tipoHoja) : '<div style="color:#64748b;font-size:13px;">No se encontró formato para esta visita.</div>'}
      </div>

      <div style="display:grid;gap:8px;">
        <h4 style="margin:0;font-size:13px;color:#0f172a;">Evidencias Fotográficas del Servicio</h4>
        ${renderEvidenciasVisita(visita)}
      </div>
    </section>
  `;
}

function rellenarFormularioDesdeGrupo(group: ClienteMesGroup, formatosPorVisita?: Array<{ visita: ClienteVisitaViewModel; formato: FormatoOperacionalViewModel | null }>) {
  const form = document.querySelector('#operaciones-crear-informe-form-principal') as HTMLFormElement | null;
  if (!form) return;

  const visitas = group.visitas || [];
  const primerVisita = visitas[0] || null;
  const nombresServicios = Array.from(new Set(visitas.map((v) => v.serviceName).filter((v) => v && v.length > 0)));

  (form.querySelector('[name="cliente"]') as HTMLInputElement)!.value = group.cliente || '';
  const primeraProgramacion = primerVisita ? informeServiciosPorId.get(primerVisita.serviceId) : null;
  (form.querySelector('[name="ubicacion"]') as HTMLInputElement)!.value = primeraProgramacion ? String(primeraProgramacion.planta?.direccion || '').trim() : '';
  (form.querySelector('[name="actividad"]') as HTMLInputElement)!.value = nombresServicios.length > 1 ? nombresServicios.join(' + ') : (nombresServicios[0] || '');
  (form.querySelector('[name="mes_actividad"]') as HTMLInputElement)!.value = group.monthKey !== 'unknown' ? group.monthKey : '';
  (form.querySelector('[name="n_visitas"]') as HTMLInputElement)!.value = String(visitas.length || 1);
  (form.querySelector('[name="fechas_visitas"]') as HTMLInputElement)!.value = visitas.map((v) => v.fechaLabel).filter((v) => v && v !== 'Sin fecha').join(', ');

  const codigoInput = form.querySelector('[name="codigo_informe"]') as HTMLInputElement | null;
  if (codigoInput && !codigoInput.value.trim()) {
    const firstFormat = formatosPorVisita?.find((entry) => entry.formato)?.formato;
    if (firstFormat?.codigoDocumento) {
      codigoInput.value = firstFormat.codigoDocumento;
    }
  }
}

function renderListaCrearInformeGrupos(groups: ClienteMesGroup[]): string {
  if (!groups || groups.length === 0) {
    return '<p style="color:#64748b;font-size:13px;">No hay servicios realizados disponibles</p>';
  }

  return groups.map((group, idx) => {
    const visitasTexto = `${group.visitas.length} visita${group.visitas.length === 1 ? '' : 's'}`;
    const serviciosTexto = Array.from(new Set(group.visitas.map((v) => v.serviceName))).join(' + ');
    const selected = informeGrupoSeleccionadoKey === group.key;
    return `
      <button class="js-grupo-informe-item" data-group-idx="${idx}" type="button" style="padding:10px;border:1px solid ${selected ? '#3b82f6' : '#cbd5e1'};border-radius:8px;background:${selected ? '#dbeafe' : '#fff'};cursor:pointer;text-align:left;font-size:12px;transition:all 0.2s;display:grid;gap:4px;">
        <div style="font-weight:700;color:#0f172a;">${escapeHtml(group.cliente)}</div>
        <div style="color:#475569;font-size:11px;">${escapeHtml(group.monthLabel)} • ${escapeHtml(visitasTexto)}</div>
        <div style="color:#64748b;font-size:11px;">${escapeHtml(serviciosTexto)}</div>
      </button>
    `;
  }).join('');
}

async function cargarDetalleGrupoInforme(group: ClienteMesGroup) {
  const detalleContainer = document.querySelector('#operaciones-informe-detalle') as HTMLElement | null;
  const form = document.querySelector('#operaciones-crear-informe-form-principal') as HTMLFormElement | null;
  if (!detalleContainer || !form) return;

  const hojaSelect = form.querySelector('.js-hoja-tipo-select') as HTMLSelectElement | null;
  const tipoHoja = hojaSelect && hojaSelect.value === 'falsa' ? 'falsa' : 'verdadera';

  detalleContainer.innerHTML = '<div style="color:#64748b;font-size:13px;">Cargando visitas del cliente seleccionado...</div>';

  const formatosPorVisita = await Promise.all(group.visitas.map(async (visita) => {
    try {
      const cached = formatosCache.get(visita.serviceId);
      if (cached) {
        return { visita, formato: cached as FormatoOperacionalViewModel };
      }

      const response = await programacionServicioService.getFormatoOperacionalByServiceId(visita.serviceId);
      const data = (response?.data ?? null) as FormatoOperacionalApiData | null;
      const formato = data ? normalizeFormato(data) : null;
      if (formato) {
        formatosCache.set(visita.serviceId, formato);
      }
      return { visita, formato };
    } catch {
      return { visita, formato: null };
    }
  }));

  rellenarFormularioDesdeGrupo(group, formatosPorVisita);

  const html = formatosPorVisita.map((entry, idx) => renderInformeVisitaCard(entry.visita, entry.formato, tipoHoja, idx)).join('');
  detalleContainer.innerHTML = html || '<div style="color:#64748b;font-size:13px;">No se encontraron detalles para este cliente.</div>';
}

function rellenarFormularioDesdeServicio(servicio: ProgramacionConEvidencias) {
  const form = document.querySelector('#operaciones-crear-informe-form-principal') as HTMLFormElement | null;
  if (!form) return;

  const cliente = servicio.orden_servicio?.cliente?.nombre_empresa || '';
  const ubicacion = `${servicio.planta?.direccion || ''}`.trim();
  const actividad = servicio.servicio?.nombre || '';
  const fecha = servicio.fecha_ejecucion_real || servicio.fecha_programada || '';

  // Llenar campos del formulario
  (form.querySelector('[name="cliente"]') as HTMLInputElement)!.value = cliente;
  (form.querySelector('[name="ubicacion"]') as HTMLInputElement)!.value = ubicacion;
  (form.querySelector('[name="actividad"]') as HTMLInputElement)!.value = actividad;
  
  // Establecer mes de la actividad basado en la fecha
  if (fecha) {
    const dateObj = new Date(fecha);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    (form.querySelector('[name="mes_actividad"]') as HTMLInputElement)!.value = `${year}-${month}`;
  }

  // Mostrar imágenes de evidencia
  const evidenciasContainer = document.querySelector('#operaciones-evidencias-preview') as HTMLElement | null;
  if (evidenciasContainer && servicio.fotos_evidencia) {
    const evidencias = parseEvidenceEntries(servicio.fotos_evidencia);
    const uniqueImages = Array.from(new Set(evidencias.map(e => resolvePhotoUrl(e.path))));
    
    if (uniqueImages.length > 0) {
      evidenciasContainer.innerHTML = uniqueImages.map(url => `
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display:block;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;">
          <img src="${escapeHtml(url)}" alt="Evidencia" style="width:100%;height:100px;object-fit:cover;display:block;" />
        </a>
      `).join('');
    }
  }
}

type ServiceEvidenceEntry = {
  path: string;
  serviceId: number | null;
  serviceTitle: string | null;
}

type ServicioRealizadoEnProgreso = {
  key: string;
  serviceId: number;
  groupId: number | null;
  servicios: Set<string>;
  cliente: string;
  fechaRaw: string;
  tecnicos: Set<string>;
  evidenciasPorServicio: Map<string, Set<string>>;
}

export type ServicioRealizadoCardViewModel = {
  key: string;
  serviceId: number;
  groupId: number | null;
  titulo: string;
  fechaLabel: string;
  tecnicosLabel: string;
  previewImages: string[];
  extraCount: number;
  secciones: Array<{ servicio: string; imagenes: string[] }>;
}

export type FichaOperacionalViewModel = {
  estado: string;
  cliente: string;
  direccion: string;
  fecha: string;
  horaLlegada: string;
  horaInicio: string;
  horaFinal: string;
  giro: string;
  diagnostico: string;
  condicionSanitaria: string;
  areasTratadas: string[];
  actividadesRealizadas: string[];
  equipos: string[];
  insumosUtilizados: any[];
  accionesCorrectivas: string;
  recomendaciones: string;
  firmas: Record<string, unknown> | null;
  observaciones: string;
}

export type FormatoOperacionalViewModel = {
  codigoDocumento: string;
  version: string;
  cliente: string;
  direccion: string;
  fecha: string;
  horaLlegada: string;
  horaInicio: string;
  horaFinal: string;
  observaciones: string;
  formatos_fichas?: string[];
  secciones: Array<{
    tipo: string;
    titulo: string;
    cantidad: number;
    items: Array<{
      codigoCaja: string;
      ubicacion: string;
      estadoDispositivoVerdadera: string;
      estadoDispositivoAuditiva: string;
      hallazgoVerdadera: string;
      hallazgoAuditiva: string;
      senalesPresenciaVerdadera: string;
      senalesPresenciaAuditiva: string;
      conteoInsectos?: Record<string, { verdadera: number; auditiva: number }> | null;
      estadoLamina?: string | null;
      estadio?: string | null;
      conteoEstadio?: Record<string, number> | Array<{ estadio?: string; conteo?: number; cantidad?: number; valor?: number }> | null;
      conteoEstadioVerdadera?: number | null;
      conteoEstadioFalsa?: number | null;
      numeroLote: string;
    }>;
  }>;
}

// Tipos para la vista agrupada por cliente/mes
export type ClienteVisitaViewModel = {
  key: string;
  serviceId: number;
  serviceName: string;
  fechaRaw: string;
  titulo: string;
  fechaLabel: string;
  tecnicosLabel: string;
  previewImages: string[];
  extraCount: number;
  secciones: Array<{ servicio: string; imagenes: string[] }>;
  evidenceImages: string[];
  devices?: Array<{ codigo: string; ubicacion: string }>;
}

export type ClienteMesGroup = {
  key: string;
  cliente: string;
  monthKey: string;
  monthLabel: string;
  visitas: ClienteVisitaViewModel[];
}

const INSECTOS_VOLADORES = [
  { key: 'muscidae', label: 'Fam. Muscidae (mosca doméstica)' },
  { key: 'drosophilidae', label: 'Fam. Drosophilidae (mosca de vinagre)' },
  { key: 'phoridae', label: 'Fam. Phoridae (mosca jorobada)' },
  { key: 'psychodidae', label: 'Fam. Psychodidae (mosca de drenaje)' },
  { key: 'chironomidae', label: 'Fam. Chironomidae (mosquito enano)' },
  { key: 'culicidae', label: 'Fam. Culicidae (mosquitos)' },
  { key: 'pyralidae_tineridae_gelechidae', label: 'Fam. Pyralidae/Tineridae/Gelechidae (polillas)' },
  { key: 'sarcophagidae_calliphoridae', label: 'Fam. Sarcophagidae/Calliphoridae (mosca de la carne/mosca metálica)' },
  { key: 'otros_no_identificados', label: 'Otros no identificados' },
] as const;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isVoladoresFormato(formato: FormatoOperacionalViewModel): boolean {
  return formato.secciones.some((seccion) => {
    const hayTitulo = normalizeText(`${seccion.titulo} ${seccion.tipo}`);
    return hayTitulo.includes('trampa de luz') || hayTitulo.includes('trampa_luz') || hayTitulo.includes('voladores');
  });
}

function isRastrerosFormato(formato: FormatoOperacionalViewModel): boolean {
  return formato.secciones.some((seccion) => {
    const hayTitulo = normalizeText(`${seccion.titulo} ${seccion.tipo}`);
    return hayTitulo.includes('lamina') || hayTitulo.includes('pegante') || hayTitulo.includes('rastreros');
  });
}

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getApiBaseWithoutVersion(): string {
  const baseUrl = String(API_CONFIG?.baseURL ?? '').trim();
  if (!baseUrl) return '';

  return baseUrl.replace(/\/api(?:\/v\d+)?\/?$/i, '');
}

function formatFecha(value?: string): string {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('es-PE');
}

function getMonthKeyFromFecha(value?: string): string {
  const raw = String(value ?? '').trim();
  if (!raw) return 'unknown';

  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) {
    return `${isoDate[1]}-${isoDate[2]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return 'unknown';
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string): string {
  if (monthKey === 'unknown') return 'Mes desconocido';

  const [year, month] = monthKey.split('-').map((part) => Number(part));
  if (!Number.isFinite(year) || !Number.isFinite(month)) return 'Mes desconocido';

  return new Intl.DateTimeFormat('es-PE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatFechaDocumento(value?: string): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toLocaleDateString('es-PE');
}

function formatHoraDocumento(value?: string): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const simpleHour = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (simpleHour) {
    const hour = simpleHour[1].padStart(2, '0');
    return `${hour}:${simpleHour[2]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return parsed.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function resolvePhotoUrl(raw: string): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const base = getApiBaseWithoutVersion();
  const normalized = value.startsWith('/') ? value.substring(1) : value;

  if (normalized.startsWith('media/')) {
    return base ? `${base}/${normalized}` : `/${normalized}`;
  }

  if (normalized.startsWith('public/')) {
    const mediaPath = normalized.substring('public/'.length);
    return base ? `${base}/media/${mediaPath}` : `/media/${mediaPath}`;
  }

  return base ? `${base}/media/${normalized}` : `/media/${normalized}`;
}

function parseEvidenceEntries(value: unknown): ServiceEvidenceEntry[] {
  if (value == null) return [];

  let entries: unknown = value;
  if (typeof entries === 'string') {
    const raw = entries.trim();
    if (!raw) return [];
    try {
      entries = JSON.parse(raw);
    } catch {
      return [{ path: raw, serviceId: null, serviceTitle: null }];
    }
  }

  if (!Array.isArray(entries)) {
    return [];
  }

  const mapped: ServiceEvidenceEntry[] = [];
  for (const item of entries) {
    if (typeof item === 'string') {
      const path = item.trim();
      if (path) mapped.push({ path, serviceId: null, serviceTitle: null });
      continue;
    }

    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const path = String(obj.path ?? '').trim();
      if (!path) continue;
      const serviceIdRaw = obj.service_id;
      const serviceId = typeof serviceIdRaw === 'number'
        ? serviceIdRaw
        : (typeof serviceIdRaw === 'string' ? Number.parseInt(serviceIdRaw, 10) : NaN);
      const serviceTitle = String(obj.service_title ?? '').trim() || null;

      mapped.push({
        path,
        serviceId: Number.isFinite(serviceId) ? serviceId : null,
        serviceTitle,
      });
    }
  }

  return mapped;
}

function normalizeFormato(data: FormatoOperacionalApiData): FormatoOperacionalViewModel {
  const secciones = Array.isArray(data?.secciones)
    ? data.secciones.map((section: any) => ({
        tipo: String(section?.tipo ?? '').trim(),
        titulo: String(section?.titulo ?? '').trim(),
        cantidad: Number(section?.cantidad ?? 0) || 0,
        items: Array.isArray(section?.items)
          ? section.items.map((item: any) => ({
              codigoCaja: String(item?.codigo_caja ?? item?.codigoCaja ?? item?.codigo ?? '').trim(),
              ubicacion: String(item?.ubicacion ?? '').trim(),
              estadoDispositivoVerdadera: String(item?.estado_dispositivo_verdadera ?? item?.estado_dispositivo ?? '').trim(),
              estadoDispositivoAuditiva: String(item?.estado_dispositivo_auditiva ?? item?.estado_dispositivo ?? '').trim(),
              hallazgoVerdadera: String(item?.hallazgo_verdadera ?? item?.hallazgo ?? '-').trim(),
              hallazgoAuditiva: String(item?.hallazgo_auditiva ?? item?.hallazgo ?? '-').trim(),
              senalesPresenciaVerdadera: String(item?.senales_presencia_verdadera ?? item?.senales_presencia ?? '-').trim(),
              senalesPresenciaAuditiva: String(item?.senales_presencia_auditiva ?? item?.senales_presencia ?? '-').trim(),
              conteoInsectos: item?.conteo_insectos && typeof item.conteo_insectos === 'object'
                ? Object.fromEntries(
                    Object.entries(item.conteo_insectos).map(([key, value]) => [
                      key,
                      {
                        verdadera: Number((value as any)?.verdadera ?? 0) || 0,
                        auditiva: Number((value as any)?.auditiva ?? 0) || 0,
                      },
                    ]),
                  )
                : null,
              estadoLamina: String(item?.estado_lamina ?? '').trim() || null,
              estadio: String(item?.estadio ?? '').trim() || null,
              conteoEstadio: item?.conteo_estadio && typeof item.conteo_estadio === 'object'
                ? item.conteo_estadio
                : null,
              conteoEstadioVerdadera: Number(item?.conteo_estadio_verdadera ?? 0) || 0,
              conteoEstadioFalsa: Number(item?.conteo_estadio_falsa ?? 0) || 0,
              numeroLote: String(item?.numero_lote ?? '').trim(),
            }))
          : [],
      }))
    : [];

  return {
    codigoDocumento: String(data?.codigo_documento ?? 'FO-OP-002').trim(),
    version: String(data?.version ?? '01').trim(),
    cliente: String(data?.cliente ?? '').trim(),
    direccion: String(data?.direccion ?? '').trim(),
    fecha: String(data?.fecha ?? '').trim(),
    horaLlegada: String(data?.hora_llegada ?? '').trim(),
    horaInicio: String(data?.hora_inicio ?? '').trim(),
    horaFinal: String(data?.hora_final ?? '').trim(),
    observaciones: String(data?.observaciones ?? '').trim(),
    formatos_fichas: (data as any)?.formatos_fichas || [],
    secciones: secciones,
  };
}

function getTecnicosList(item: Programacion): string[] {
  const names = new Set<string>();

  if (Array.isArray(item.tecnicos) && item.tecnicos.length > 0) {
    item.tecnicos
      .map((t) => `${t.nombre ?? ''} ${t.apellidos ?? ''}`.trim())
      .filter((n) => n.length > 0)
      .forEach((name) => names.add(name));
  }

  if (item.tecnico) {
    const full = `${item.tecnico.nombre ?? ''} ${item.tecnico.apellidos ?? ''}`.trim();
    if (full) names.add(full);
  }

  return Array.from(names);
}

export function mapServiciosRealizadosCards(items: Programacion[]): ServicioRealizadoCardViewModel[] {
  const agrupados = new Map<string, ServicioRealizadoEnProgreso>();

  for (const baseItem of items) {
    const item = baseItem as ProgramacionConEvidencias;
    const groupId = typeof item.id_grupo_programacion === 'number' && item.id_grupo_programacion > 0
      ? item.id_grupo_programacion
      : null;
    const key = groupId ? `group-${groupId}` : `service-${item.id}`;

    const servicio = (item.servicio?.nombre || `Servicio #${item.id_servicio}`).trim();
    const cliente = (item.orden_servicio?.cliente?.nombre_empresa || 'Cliente sin nombre').trim();
    const fechaRaw = (item.fecha_ejecucion_real || item.fecha_programada || '').trim();

    if (!agrupados.has(key)) {
      agrupados.set(key, {
        key,
        serviceId: item.id,
        groupId,
        servicios: new Set<string>(),
        cliente,
        fechaRaw,
        tecnicos: new Set<string>(),
        evidenciasPorServicio: new Map<string, Set<string>>(),
      });
    }

    const card = agrupados.get(key)!;
    if (servicio) {
      card.servicios.add(servicio);
    }
    if (!card.cliente && cliente) {
      card.cliente = cliente;
    }

    if (fechaRaw) {
      const incoming = Date.parse(fechaRaw);
      const current = Date.parse(card.fechaRaw);
      if (Number.isNaN(current) || (!Number.isNaN(incoming) && incoming > current)) {
        card.fechaRaw = fechaRaw;
      }
    }

    getTecnicosList(item).forEach((name) => card.tecnicos.add(name));

    const evidencias = parseEvidenceEntries(item.fotos_evidencia);
    for (const evidencia of evidencias) {
      const serviceLabel = (evidencia.serviceTitle || servicio || 'Servicio').trim();
      if (!card.evidenciasPorServicio.has(serviceLabel)) {
        card.evidenciasPorServicio.set(serviceLabel, new Set<string>());
      }

      const photoUrl = resolvePhotoUrl(evidencia.path);
      if (photoUrl) {
        card.evidenciasPorServicio.get(serviceLabel)!.add(photoUrl);
      }
    }
  }

  const cards = Array.from(agrupados.values()).sort((a, b) => {
    const da = Date.parse(a.fechaRaw);
    const db = Date.parse(b.fechaRaw);
    if (Number.isNaN(da) && Number.isNaN(db)) return 0;
    if (Number.isNaN(da)) return 1;
    if (Number.isNaN(db)) return -1;
    return db - da;
  });

  return cards.map((card) => {
    const sections = Array.from(card.evidenciasPorServicio.entries()).map(([servicio, imagenes]) => ({
      servicio,
      imagenes: Array.from(imagenes),
    }));

    const allImages = sections.flatMap((section) => section.imagenes);
    const uniqueImages = Array.from(new Set(allImages));

    return {
      key: card.key,
      serviceId: card.serviceId,
      groupId: card.groupId,
      titulo: `${Array.from(card.servicios).join(' + ') || 'Servicio'} - ${card.cliente || 'Cliente sin nombre'}`,
      fechaLabel: formatFecha(card.fechaRaw),
      tecnicosLabel: Array.from(card.tecnicos).join(', ') || 'Sin técnico asignado',
      previewImages: uniqueImages.slice(0, 2),
      extraCount: Math.max(0, uniqueImages.length - 2),
      secciones: sections,
    };
  });
}

export function renderServiciosRealizadosCards(cards: ServicioRealizadoCardViewModel[]): string {
  if (cards.length === 0) {
    return '<p style="color:#64748b; margin:0;">No hay servicios realizados para mostrar.</p>';
  }

  return cards.map((card) => {
    const compactPhotos = card.previewImages.length > 0
      ? `<div class="compact-photos">${card.previewImages.map((url) => `
            <div class="photo-thumb"><img src="${escapeHtml(url)}" alt="Evidencia" loading="lazy"/></div>
          `).join('')}${card.extraCount > 0 ? `<div class="photo-count">+${card.extraCount}</div>` : ''}</div>`
      : `<div class="compact-photos"><span style="color:#64748b;font-size:13px;">Sin imágenes</span></div>`;

    const expandedContent = `
      <div class="report-content-split">
        <div class="report-evidence-column">
          ${card.previewImages.length > 0 ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">
              ${card.previewImages.map((url) => `
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display:block;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#f8fafc;">
                  <img src="${escapeHtml(url)}" alt="Evidencia" style="width:100%;height:120px;object-fit:cover;display:block;" loading="lazy" />
                </a>
              `).join('')}
            </div>
          ` : '<div style="color:#64748b;font-size:14px;">Sin imágenes registradas</div>'}
        </div>
        <div class="report-docs-column">
          <button class="report-doc report-doc-primary js-open-ficha-operacional" type="button" data-card-key="${escapeHtml(card.key)}" title="Ver ficha operacional">Ficha</button>
          <button class="report-doc report-doc-placeholder js-open-formato-operacional" type="button" data-card-key="${escapeHtml(card.key)}" title="Ver formato operacional">Formato</button>
        </div>
      </div>
      <div class="report-actions-row">
        <button class="btn-secondary fullwidth js-open-imagenes-completas" data-card-key="${escapeHtml(card.key)}" ${card.secciones.length === 0 ? 'disabled' : ''}>Ver imágenes completas</button>
      </div>
    `;

    return `
      <div class="report-card" data-card-key="${escapeHtml(card.key)}">
        <div class="report-row">
          <div class="report-main">
            <div class="report-header-row">
              <div class="report-title">${escapeHtml(card.titulo)}</div>
              <div class="report-date">${escapeHtml(card.fechaLabel)}</div>
            </div>
            <div class="report-meta">${escapeHtml(card.tecnicosLabel)}</div>
          </div>
          <div class="report-right">
            ${compactPhotos}
            <div class="compact-actions">
              <button class="report-doc report-doc-primary js-open-ficha-operacional" type="button" data-card-key="${escapeHtml(card.key)}">Ficha</button>
              <button class="report-doc report-doc-placeholder js-open-formato-operacional" type="button" data-card-key="${escapeHtml(card.key)}">Formato</button>
              <button class="btn-secondary js-toggle-report-details" type="button" data-card-key="${escapeHtml(card.key)}">▼</button>
            </div>
          </div>
        </div>
        <div class="report-expanded">${expandedContent}</div>
      </div>
    `;
  }).join('');
}

export function renderServicioImagenesModal(card: ServicioRealizadoCardViewModel): string {
  return `
    <div class="modal-overlay js-close-imagenes-modal" style="position:fixed;inset:0;background:rgba(15,23,42,0.65);display:flex;align-items:center;justify-content:center;z-index:3000;padding:20px;">
      <div class="modal-content" style="background:#fff;border-radius:14px;max-width:980px;width:min(980px,100%);max-height:90vh;overflow:auto;padding:20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;">
          <div>
            <h3 style="margin:0 0 6px 0;font-size:20px;color:#0f172a;">Imágenes completas</h3>
            <p style="margin:0;color:#475569;">${escapeHtml(card.titulo)}</p>
          </div>
          <button class="btn-secondary js-close-imagenes-modal" type="button">Cerrar</button>
        </div>
        ${card.secciones.map((section) => `
          <div style="margin-top:16px;">
            <h4 style="margin:0 0 10px 0;color:#1e3a8a;font-size:16px;">${escapeHtml(section.servicio)} (${section.imagenes.length})</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;">
              ${section.imagenes.map((img) => `
                <a href="${escapeHtml(img)}" target="_blank" rel="noopener noreferrer" style="display:block;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#f8fafc;">
                  <img src="${escapeHtml(img)}" alt="Evidencia ${escapeHtml(section.servicio)}" style="width:100%;height:140px;object-fit:cover;display:block;" loading="lazy" />
                </a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Agrupar servicios por cliente y mes (YYYY-MM)
export function mapServiciosPorClienteMes(items: Programacion[]): ClienteMesGroup[] {
  const groups = new Map<string, ClienteMesGroup>();

  for (const baseItem of items) {
    const item = baseItem as ProgramacionConEvidencias;
    const cliente = (item.orden_servicio?.cliente?.nombre_empresa || 'Cliente sin nombre').trim();
    const fechaRaw = (item.fecha_ejecucion_real || item.fecha_programada || '')?.trim();
    const fecha = fechaRaw || '';
    const monthKey = getMonthKeyFromFecha(fecha);

    const groupKey = `${cliente}::${monthKey}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        cliente,
        monthKey,
        monthLabel: formatMonthLabel(monthKey),
        visitas: [],
      });
    }

    // construir visita (similar a mapServiciosRealizadosCards)
    const servicio = (item.servicio?.nombre || `Servicio #${item.id_servicio}`).trim();
    const titulo = `${servicio} - ${cliente}`;
    const fechaLabel = formatFecha(fechaRaw || '');
    const tecnicos = getTecnicosList(item).join(', ') || 'Sin técnico asignado';

    const evidencias = parseEvidenceEntries(item.fotos_evidencia);
    const images: string[] = [];
    for (const ev of evidencias) {
      const url = resolvePhotoUrl(ev.path);
      if (url) images.push(url);
    }
    const uniqueImages = Array.from(new Set(images));

    const visita: ClienteVisitaViewModel = {
      key: `${item.id}_${item.id_grupo_programacion ?? ''}`,
      serviceId: item.id,
      serviceName: servicio,
      fechaRaw: fechaRaw || '',
      titulo,
      fechaLabel,
      tecnicosLabel: tecnicos,
      previewImages: uniqueImages.slice(0, 4),
      extraCount: Math.max(0, uniqueImages.length - 4),
      secciones: [], // secciones las cargaremos a demanda usando handlers existentes
      evidenceImages: uniqueImages,
    };

    groups.get(groupKey)!.visitas.push(visita);
  }

  // ordenar groups por month desc
  const arr = Array.from(groups.values()).sort((a, b) => {
    if (a.monthKey === b.monthKey) return a.cliente.localeCompare(b.cliente);
    if (a.monthKey === 'unknown') return 1;
    if (b.monthKey === 'unknown') return -1;
    return b.monthKey.localeCompare(a.monthKey);
  });

  // ordenar visitas por fecha asc (de antigua a nueva)
  for (const g of arr) {
    g.visitas.sort((x: ClienteVisitaViewModel, y: ClienteVisitaViewModel) => (x.fechaLabel || '').localeCompare(y.fechaLabel || ''));
  }

  return arr;
}

export function renderServiciosPorClienteMes(groups: ClienteMesGroup[]): string {
  if (!groups || groups.length === 0) return '<p style="color:#64748b; margin:0;">No hay servicios realizados para mostrar.</p>';

  return groups.map((group, gi) => {
    const circles = group.visitas.map((v: ClienteVisitaViewModel, idx: number) => `
      <button class="visit-circle" data-group-idx="${gi}" data-visit-idx="${idx}" type="button" title="${escapeHtml(v.titulo)}">
        <span class="visit-circle-label">Visita ${idx + 1}</span>
        <span class="visit-circle-date">${escapeHtml(v.fechaLabel || 'Sin fecha')}</span>
      </button>
    `).join('');

    return `
      <div class="cliente-mes-group">
        <div class="group-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
          <div>
            <h4 style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(group.cliente)}</h4>
            <div style="color:#64748b;font-size:13px;">${escapeHtml(group.monthLabel)} • N° de Visitas</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="visit-circles-wrapper">
              <button class="btn-secondary group-toggle-btn" type="button" data-group-idx="${gi}" title="Mostrar visitas">▶</button>
            </div>
          </div>
        </div>
        <div class="group-body" style="display:none;">
          <div class="visit-circles">${circles}</div>
          <div class="group-visit-details"></div>
        </div>
      </div>
    `;
  }).join('');
}

function fallbackText(value: string | null | undefined, emptyLabel = 'No registrado'): string {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : emptyLabel;
}

// Render detalle completo para una visita (imágenes, botones ficha/formato)
export function renderVisitaDetail(v: ClienteVisitaViewModel): string {
  const previewCount = v.previewImages.length;
  return `
    <div class="report-card report-card-detail" data-card-key="${escapeHtml(v.key)}">
      <div class="report-header report-header-visit">
        <div>
          <div class="report-visit-title">${escapeHtml(v.titulo)}</div>
          <div class="report-visit-subtitle">${escapeHtml(v.tecnicosLabel)}</div>
        </div>
        <span class="report-date">${escapeHtml(v.fechaLabel)}</span>
      </div>
      <div class="report-content-split report-content-split-visit">
        <div class="report-evidence-column">
          ${previewCount > 0 ? `
            <div class="visit-gallery">
              ${v.previewImages.map((u: string) => `
                <a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer" class="visit-gallery-item">
                  <img src="${escapeHtml(u)}" alt="Evidencia de visita" loading="lazy" />
                </a>
              `).join('')}
              ${v.extraCount > 0 ? `<div class="visit-gallery-more">+${v.extraCount}</div>` : ''}
            </div>
          ` : '<div class="visit-empty">Sin imágenes registradas</div>'}
        </div>
        <div class="report-docs-column report-docs-column-visit">
          <button class="report-doc report-doc-primary js-open-ficha-operacional" type="button" data-card-key="${escapeHtml(v.key)}" aria-label="Abrir ficha operacional">
            <span class="report-doc-icon">F</span>
            <span class="report-doc-text">Ficha</span>
          </button>
          <button class="report-doc report-doc-placeholder js-open-formato-operacional" type="button" data-card-key="${escapeHtml(v.key)}" aria-label="Abrir formato operacional">
            <span class="report-doc-icon">O</span>
            <span class="report-doc-text">Formato</span>
          </button>
        </div>
      </div>
      ${v.devices && v.devices.length > 0 ? `
        <div style="margin-top:12px;">
          <h4 style="margin:0 0 8px 0;color:#1e293b;font-size:14px;">Dispositivos (Código • Ubicación)</h4>
          <div style="overflow:auto;border:1px solid #e6eef7;border-radius:8px;padding:8px;background:#fbfdff;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="text-align:left;color:#475569;font-weight:700;font-size:12px;"><th style="padding:6px;border-bottom:1px solid #e6eef7;">Código</th><th style="padding:6px;border-bottom:1px solid #e6eef7;">Ubicación</th></tr>
              </thead>
              <tbody>
                ${v.devices.map(d => `<tr><td style="padding:8px;border-bottom:1px dashed #eef3fb;">${escapeHtml(d.codigo)}</td><td style="padding:8px;border-bottom:1px dashed #eef3fb;">${escapeHtml(d.ubicacion)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      <div class="report-actions-row" style="margin-top:12px;">
        <button class="btn-secondary fullwidth js-open-imagenes-completas" data-card-key="${escapeHtml(v.key)}">Ver imágenes completas</button>
      </div>
    </div>
  `;
}

function renderValueList(items: string[]): string {
  if (items.length === 0) {
    return '<span style="color:#64748b;">Sin registros</span>';
  }

  return `<ul style="margin:0;padding-left:18px;display:grid;gap:4px;">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

function pickFirstNonEmptyValue(
  source: Record<string, unknown> | null,
  candidates: string[],
): string {
  if (!source) return '';

  for (const key of candidates) {
    const raw = source[key];
    if (typeof raw !== 'string') continue;
    const value = raw.trim();
    if (value.length > 0) return value;
  }

  return '';
}

function normalizeSignatureText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('data:image/') || lower.startsWith('http://') || lower.startsWith('https://')) {
    return 'Firma registrada';
  }

  return trimmed;
}

function renderInsumosTable(insumos: any[]): string {
  if (!insumos || insumos.length === 0) {
    return '<div style="padding:10px;text-align:center;color:#64748b;font-size:13px;">Sin insumos registrados</div>';
  }

  const rows = insumos.map(insumo => {
    if (typeof insumo !== 'object' || insumo === null) {
      return `<tr><td colspan="7" style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(String(insumo))}</td></tr>`;
    }
    return `
      <tr>
        <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;color:#0f172a;">${escapeHtml(fallbackText(insumo.producto))}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;color:#0f172a;">${escapeHtml(fallbackText(insumo.metodo))}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;color:#0f172a;">${escapeHtml(fallbackText(insumo.lote))}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;color:#0f172a;">${escapeHtml(fallbackText(insumo.fecha_vencimiento || insumo.fechaVencimiento || insumo.vencimiento || insumo.fechaVencim))}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;color:#0f172a;">${escapeHtml(fallbackText(insumo.unidad_medida || insumo.unidad))}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;color:#0f172a;">${escapeHtml(fallbackText(insumo.concentracion))}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;color:#0f172a;">${escapeHtml(fallbackText(insumo.cantidad_usada || insumo.cantidad))}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;margin:0;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#334155;text-align:left;">Producto</th>
            <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#334155;text-align:left;">Método</th>
            <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#334155;text-align:left;">Lote</th>
            <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#334155;text-align:left;">Fecha de Vencimiento</th>
            <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#334155;text-align:left;">Unidad de medida</th>
            <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#334155;text-align:left;">Concentración</th>
            <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;font-weight:600;color:#334155;text-align:left;">Cantidad usada</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

export function renderFichaOperacionalModal(card: ServicioRealizadoCardViewModel, ficha: FichaOperacionalViewModel): string {
  const base = getApiBaseWithoutVersion();
  const logoUrl = `${base}/images/logo-orden.png`;
  const tecnicoNombre = fallbackText(
    pickFirstNonEmptyValue(ficha.firmas, ['tecnico_nombre', 'nombre_tecnico', 'tecnico', 'responsable_tecnico']),
    card.tecnicosLabel,
  );
  const clienteNombre = fallbackText(
    pickFirstNonEmptyValue(ficha.firmas, ['cliente_nombre', 'nombre_cliente', 'representante_cliente', 'cliente']),
    ficha.cliente,
  );
  const firmaTecnico = fallbackText(
    normalizeSignatureText(
      pickFirstNonEmptyValue(ficha.firmas, ['tecnico_firma', 'firma_tecnico', 'firma_responsable_tecnico']),
    ),
    'Sin firma',
  );
  const firmaCliente = fallbackText(
    normalizeSignatureText(
      pickFirstNonEmptyValue(ficha.firmas, ['cliente_firma', 'firma_cliente', 'firma_representante_cliente']),
    ),
    'Sin firma',
  );

  return `
    <div class="modal-overlay js-close-ficha-modal" style="position:fixed;inset:0;background:rgba(15,23,42,0.65);display:flex;align-items:center;justify-content:center;z-index:3000;padding:20px;">
      <div class="modal-content" style="background:#fff;border-radius:14px;max-width:980px;width:min(980px,100%);max-height:90vh;overflow:auto;padding:20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;">
          <div>
            <h3 style="margin:0 0 6px 0;font-size:20px;color:#0f172a;">Ficha operacional</h3>
            <p style="margin:0;color:#475569;">${escapeHtml(card.titulo)}</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn-primary js-download-ficha-pdf" type="button" data-service-id="${card.serviceId}" data-group-id="${card.groupId || ''}" style="display:flex;align-items:center;gap:6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Descargar PDF
            </button>
            <button class="btn-secondary js-close-ficha-modal" type="button">Cerrar</button>
          </div>
        </div>

        <div style="margin-top:14px;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;">
          <div style="display:grid;grid-template-columns:minmax(0,1fr) 210px;min-height:110px;">
            <div style="display:grid;grid-template-columns:110px minmax(0,1fr);">
              <div style="border-right:1px solid #cbd5e1;display:flex;align-items:center;justify-content:center;padding:8px;">
                <img src="${escapeHtml(logoUrl)}" alt="Logo" style="max-width:100%;max-height:78px;object-fit:contain;display:block;" />
              </div>
              <div style="padding:10px 12px;border-right:1px solid #cbd5e1;display:flex;flex-direction:column;justify-content:center;gap:4px;">
                <div style="font-size:14px;font-weight:700;color:#0f172a;text-align:center;letter-spacing:0.3px;">FORMATO OPERACIONAL</div>
                <div style="font-size:13px;font-weight:600;color:#1e293b;text-align:center;line-height:1.35;">FICHA TÉCNICA DE EVALUACIÓN Y DESCRIPCIÓN DE ACTIVIDADES DE SANEAMIENTO AMBIENTAL</div>
              </div>
            </div>
            <div style="display:grid;grid-template-rows:repeat(3,minmax(0,1fr));">
              <div style="display:grid;grid-template-columns:80px minmax(0,1fr);border-bottom:1px solid #cbd5e1;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Código</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;font-weight:600;">FO-OP-001</div>
              </div>
              <div style="display:grid;grid-template-columns:80px minmax(0,1fr);border-bottom:1px solid #cbd5e1;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Fecha</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;">${escapeHtml(fallbackText(formatFecha(ficha.fecha), 'No registrado'))}</div>
              </div>
              <div style="display:grid;grid-template-columns:80px minmax(0,1fr);">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Versión</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;">02</div>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid #cbd5e1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));">
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Cliente:</strong> ${escapeHtml(fallbackText(ficha.cliente))}</div>
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Dirección:</strong> ${escapeHtml(fallbackText(ficha.direccion))}</div>
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Fecha:</strong> ${escapeHtml(fallbackText(formatFecha(ficha.fecha), 'No registrado'))}</div>
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora llegada:</strong> ${escapeHtml(fallbackText(formatHoraDocumento(ficha.horaLlegada)))}</div>
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora inicio:</strong> ${escapeHtml(fallbackText(formatHoraDocumento(ficha.horaInicio)))}</div>
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora final:</strong> ${escapeHtml(fallbackText(formatHoraDocumento(ficha.horaFinal)))}</div>
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:14px;"><strong>Estado:</strong> ${escapeHtml(fallbackText(ficha.estado))}</div>
            <div style="padding:8px 10px;font-size:14px;"><strong>Giro:</strong> ${escapeHtml(fallbackText(ficha.giro))}</div>
          </div>
        </div>

        <div style="margin-top:0;display:grid;gap:0;">
          <div style="border:1px solid #cbd5e1;border-top:0;border-radius:0;overflow:hidden;">
            <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Diagnóstico</div>
            <div style="min-height:98px;padding:10px 12px;line-height:1.45;color:#0f172a;white-space:pre-wrap;">${escapeHtml(fallbackText(ficha.diagnostico, 'Sin diagnóstico registrado'))}</div>
          </div>
          <div style="border:1px solid #cbd5e1;border-top:0;border-radius:0;overflow:hidden;">
            <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Condición sanitaria de la zona circundante</div>
            <div style="min-height:98px;padding:10px 12px;line-height:1.45;color:#0f172a;white-space:pre-wrap;">${escapeHtml(fallbackText(ficha.condicionSanitaria, 'Sin condición registrada'))}</div>
          </div>

          <div style="border:1px solid #cbd5e1;border-top:0;border-radius:0;overflow:hidden;">
            <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Actividad realizada</div>
            <div style="min-height:98px;padding:10px 12px;line-height:1.45;color:#0f172a;">${renderValueList(ficha.actividadesRealizadas)}</div>
          </div>
          <div style="border:1px solid #cbd5e1;border-top:0;border-radius:0;overflow:hidden;">
            <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Tratamiento realizado</div>
            <div style="padding:10px 12px;line-height:1.45;color:#0f172a;">${renderValueList(ficha.equipos)}</div>
          </div>
          <div style="border:1px solid #cbd5e1;border-top:0;border-radius:0 0 8px 8px;overflow:hidden;">
            <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;text-transform:uppercase;">Información de Insumos Utilizados</div>
            <div style="padding:0;">${renderInsumosTable(ficha.insumosUtilizados)}</div>
          </div>
        </div>

        <div style="margin-top:12px;display:grid;gap:10px;">
          <div style="border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;">
            <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Áreas tratadas</div>
            <div style="min-height:72px;padding:10px 12px;line-height:1.45;color:#0f172a;">${renderValueList(ficha.areasTratadas)}</div>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));">
            <div style="border-right:1px solid #cbd5e1;">
              <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Acciones correctivas</div>
              <div style="min-height:82px;padding:10px 12px;line-height:1.45;color:#0f172a;white-space:pre-wrap;">${escapeHtml(fallbackText(ficha.accionesCorrectivas, 'Sin acciones registradas'))}</div>
            </div>
            <div>
              <div style="padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Recomendaciones</div>
              <div style="min-height:82px;padding:10px 12px;line-height:1.45;color:#0f172a;white-space:pre-wrap;">${escapeHtml(fallbackText(ficha.recomendaciones, 'Sin recomendaciones registradas'))}</div>
            </div>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));">
            <div style="grid-column:1 / -1;padding:4px 10px;border-bottom:1px solid #cbd5e1;text-align:center;font-size:13px;font-weight:600;color:#334155;">Personal técnico</div>

            <div style="border-right:1px solid #cbd5e1;">
              <div style="display:grid;grid-template-columns:86px minmax(0,1fr);border-bottom:1px solid #cbd5e1;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Nombre:</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;">${escapeHtml(tecnicoNombre)}</div>
              </div>
              <div style="display:grid;grid-template-columns:86px minmax(0,1fr);min-height:52px;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Firma:</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;display:flex;align-items:center;">${escapeHtml(firmaTecnico)}</div>
              </div>
            </div>

            <div>
              <div style="display:grid;grid-template-columns:86px minmax(0,1fr);border-bottom:1px solid #cbd5e1;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Nombre:</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;">${escapeHtml(clienteNombre)}</div>
              </div>
              <div style="display:grid;grid-template-columns:86px minmax(0,1fr);min-height:52px;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Firma:</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;display:flex;align-items:center;">${escapeHtml(firmaCliente)}</div>
              </div>
            </div>

            <div style="padding:8px 10px;border-top:1px solid #cbd5e1;border-right:1px solid #cbd5e1;font-size:12px;text-align:center;color:#475569;font-weight:600;">Responsable de QSCI Pest Control</div>
            <div style="padding:8px 10px;border-top:1px solid #cbd5e1;font-size:12px;text-align:center;color:#475569;font-weight:600;">Representante del cliente</div>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;text-align:center;line-height:1.35;color:#334155;font-size:12px;">
            <div style="font-weight:700;color:#1e293b;">Multitasking Servicios Generales S.A.C</div>
            <div>Telf. fijo: 01-6055976 &nbsp; Celular: 947702279 - 941300937</div>
            <div>Dirección: Av. 13 de enero Mz. H-V Lt.02 APV Inca Manco Cápac - SJL &nbsp; Correo: contacto@qsciconsulting.com</div>
          </div>

          <div>
            <h4 style="margin:0 0 6px 0;color:#1e3a8a;">Observaciones</h4>
            <p style="margin:0;line-height:1.45;">${escapeHtml(fallbackText(ficha.observaciones, 'Sin observaciones registradas'))}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderFormatoOperacionalModal(card: ServicioRealizadoCardViewModel, formato: FormatoOperacionalViewModel): string {
  const base = getApiBaseWithoutVersion();
  const logoUrl = `${base}/images/logo-orden.png`;
  
  // Detectar tipos de formatos presentes en las secciones
  const formatosPresentesSet = new Set<string>();
  for (const seccion of formato.secciones) {
    const normalizado = normalizeText(seccion.titulo + ' ' + (seccion.tipo || ''));
    const tipo = seccion.tipo || '';
    
    if (tipo === 'trampa_luz' || (normalizado.includes('trampa') && normalizado.includes('luz'))) {
      formatosPresentesSet.add('voladores');
    } else if (tipo.startsWith('roedores') || normalizado.includes('cebadera')) {
      formatosPresentesSet.add('roedores');
    } else if (tipo === 'rastreros_lamina' || normalizado.includes('lamina')) {
      formatosPresentesSet.add('rastreros');
    } else {
      formatosPresentesSet.add('roedores');
    }
  }
  
  const hayMultiplesFormatos = formatosPresentesSet.size > 1;
  const formatosPresentes = Array.from(formatosPresentesSet);
  const formatoLabel = (key: string) => key === 'roedores' ? 'Control de Roedores' : key === 'rastreros' ? 'Control de Insectos Rastreros' : 'Control de Insectos Voladores';

  const soloRoedores = formatosPresentesSet.size === 1 && formatosPresentesSet.has('roedores');
  const soloRastreros = formatosPresentesSet.size === 1 && formatosPresentesSet.has('rastreros');
  const soloVoladores = formatosPresentesSet.size === 1 && formatosPresentesSet.has('voladores');

  const nombreFormatoAsignado = (formato.formatos_fichas && formato.formatos_fichas.length > 0) 
    ? formato.formatos_fichas[0] 
    : 'FORMATO OPERACIONAL';

  const tituloPrincipal = nombreFormatoAsignado.toUpperCase();

  const renderHoja = (variant: 'verdadera' | 'falsa') => {
    const sheetTitle = variant === 'verdadera' ? 'HOJA VERDADERA' : 'HOJA FALSA';

    // Helpers de renderizado (Movidos fuera para uso general)
    const renderFullRoedores = (seccion: any) => `
      <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;background:#fff;margin-bottom:16px;">
        <div style="padding:6px 10px;border-bottom:1px solid #cbd5e1;background:#eff6ff;text-align:center;font-size:13px;font-weight:700;color:#1e40af;">${escapeHtml(seccion.titulo)} (${seccion.cantidad})</div>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;margin:0;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Código</th>
                <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Ubicación</th>
                <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Estado</th>
                <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Hallazgo</th>
                <th style="padding:6px;border:1px solid #cbd5e1;font-size:11px;text-align:left;">Señales</th>
              </tr>
            </thead>
            <tbody>
            ${seccion.items.map((item: any) => {
              const estado = variant === 'verdadera' ? item.estadoDispositivoVerdadera : item.estadoDispositivoAuditiva;
              const hallazgo = variant === 'verdadera' ? item.hallazgoVerdadera : item.hallazgoAuditiva;
              const senales = variant === 'verdadera' ? item.senalesPresenciaVerdadera : item.senalesPresenciaAuditiva;
              return `
                <tr>
                  <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;font-weight:700;">${escapeHtml(fallbackText(item.codigoCaja))}</td>
                  <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(item.ubicacion))}</td>
                  <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;">${escapeHtml(fallbackText(estado))}</td>
                  <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;">${escapeHtml(fallbackText(hallazgo, '-'))}</td>
                  <td style="padding:6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;">${escapeHtml(fallbackText(senales, '-'))}</td>
                </tr>
              `;
            }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const renderFullRastreros = (seccion: any) => {
      const estadioOrden = ['ADULTO', 'NINFA', 'OOTECA'];
      const parseConteoEstadio = (value: any) => {
        if (!value) return {};
        
        // Caso 1: Es un Array (formato nuevo)
        if (Array.isArray(value)) {
          return value.reduce((acc: any, entry: any) => {
            const nombre = String(entry?.estadio ?? entry?.label ?? entry?.nombre ?? '').trim().toUpperCase();
            if (!nombre) return acc;
            const verdadera = Number(entry?.verdadera ?? entry?.conteo_verdadera ?? entry?.conteo ?? entry?.cantidad ?? entry?.valor ?? 0) || 0;
            const falsa = Number(entry?.falsa ?? entry?.auditiva ?? entry?.conteo_falsa ?? 0) || 0;
            acc[nombre] = { verdadera, falsa };
            return acc;
          }, {});
        }

        // Caso 2: Es un Objeto (formato antiguo/clásico)
        if (typeof value === 'object') {
          return Object.entries(value as Record<string, any>).reduce((acc: any, [key, raw]) => {
            const nombre = String(key ?? '').trim().toUpperCase();
            if (!nombre) return acc;
            if (typeof raw === 'number') {
              acc[nombre] = { verdadera: Number(raw) || 0, falsa: 0 };
              return acc;
            }
            acc[nombre] = {
              verdadera: Number(raw?.verdadera ?? raw?.conteo_verdadera ?? raw?.conteo ?? raw?.cantidad ?? raw?.valor ?? raw?.count ?? 0) || 0,
              falsa: Number(raw?.falsa ?? raw?.auditiva ?? raw?.conteo_falsa ?? 0) || 0,
            };
            return acc;
          }, {});
        }
        return {};
      };

      return `
        <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;background:#fff;margin-bottom:16px;">
          <div style="padding:6px 10px;border-bottom:1px solid #cbd5e1;background:#f3e8ff;text-align:center;font-size:13px;font-weight:700;color:#9333ea;">${escapeHtml(seccion.titulo)} (${seccion.cantidad})</div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;margin:0;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:left;">Ubicación</th>
                  <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:center;">N°</th>
                  <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:left;">Estadio</th>
                  <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:center;">Conteo</th>
                  <th style="padding:8px 6px;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;text-align:left;">Estado de lámina</th>
                </tr>
              </thead>
              <tbody>
              ${seccion.items.map((item: any) => {
                const estadoLamina = fallbackText(item.estadoLamina, '-');
                const conteoPorEstadio = parseConteoEstadio(item.conteoEstadio);
                const keys = Object.keys(conteoPorEstadio).filter(k => estadioOrden.includes(k));

                if (keys.length > 0) {
                  return keys.map((est, idx) => `
                    <tr>
                      ${idx === 0 ? `<td rowspan="${keys.length}" style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(item.ubicacion))}</td>` : ''}
                      ${idx === 0 ? `<td rowspan="${keys.length}" style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:700;">${escapeHtml(fallbackText(item.codigoCaja))}</td>` : ''}
                      <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(est)}</td>
                      <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:700;">${variant === 'verdadera' ? Number(conteoPorEstadio[est]?.verdadera ?? 0) : Number(conteoPorEstadio[est]?.falsa ?? 0)}</td>
                      ${idx === 0 ? `<td rowspan="${keys.length}" style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(estadoLamina)}</td>` : ''}
                    </tr>
                  `).join('');
                }

                return `
                  <tr>
                    <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(item.ubicacion))}</td>
                    <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:700;">${escapeHtml(fallbackText(item.codigoCaja))}</td>
                    <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(fallbackText(item.estadio, '-'))}</td>
                    <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;text-align:center;font-weight:700;">${variant === 'verdadera' ? Number(item.conteoEstadioVerdadera ?? 0) : Number(item.conteoEstadioFalsa ?? 0)}</td>
                    <td style="padding:8px 6px;border:1px solid #cbd5e1;font-size:12px;">${escapeHtml(estadoLamina)}</td>
                  </tr>
                `;
              }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    const renderFullVoladores = (seccion: any) => `
      <div style="border:1px solid #cbd5e1;border-radius:12px;overflow:hidden;background:#f8fafc;margin-bottom:20px;box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="padding:10px 15px;border-bottom:1px solid #cbd5e1;background:#e0f2fe;text-align:center;font-size:14px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;">
          ${escapeHtml(seccion.titulo)} (${seccion.cantidad})
        </div>
        <div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill, minmax(450px, 1fr));gap:16px;">
          ${seccion.items.map((item: any) => {
            const estado = variant === 'verdadera' ? item.estadoDispositivoVerdadera : item.estadoDispositivoAuditiva;
            const conteos = Object.entries(item.conteoInsectos || {});
            const totalCapturas = conteos.reduce((acc, [_, raw]: [string, any]) => acc + (variant === 'verdadera' ? (Number(raw.verdadera) || 0) : (Number(raw.auditiva) || 0)), 0);

            return `
              <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="padding:10px 12px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="background:#0369a1;color:#fff;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;">${escapeHtml(fallbackText(item.codigoCaja))}</span>
                    <span style="color:#475569;font-size:12px;font-weight:600;">${escapeHtml(fallbackText(item.ubicacion))}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="font-size:11px;color:#64748b;">Estado: <strong style="color:${estado === 'A' ? '#10b981' : '#f59e0b'}">${escapeHtml(fallbackText(estado))}</strong></div>
                    <div style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;">Total: ${totalCapturas}</div>
                  </div>
                </div>
                <div style="padding:12px;display:grid;grid-template-columns:1fr;gap:8px;">
                  ${conteos.length > 0 ? conteos.map(([key, raw]: [string, any]) => {
                    const valor = variant === 'verdadera' ? (Number(raw.verdadera) || 0) : (Number(raw.auditiva) || 0);
                    return `
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px dashed #f1f5f9;">
                        <span style="font-size:11.5px;color:#334155;text-transform:capitalize;">${escapeHtml(key.replace(/_/g, ' '))}</span>
                        <span style="font-size:12px;font-weight:700;color:${valor > 0 ? '#0369a1' : '#94a3b8'}">${valor}</span>
                      </div>
                    `;
                  }).join('') : '<div style="text-align:center; color:#94a3b8; font-size:12px; padding:10px;">Sin capturas registradas</div>'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Lógica Principal de Renderizado: Sección por Sección
    const bloquesHtml = formato.secciones.map((seccion: any) => {
      const tipo = seccion.tipo || '';
      const normalizado = normalizeText(seccion.titulo + ' ' + tipo);

      if (tipo === 'trampa_luz' || (normalizado.includes('trampa') && normalizado.includes('luz'))) {
        return renderFullVoladores(seccion);
      } else if (tipo.startsWith('roedores') || normalizado.includes('cebadera')) {
        return renderFullRoedores(seccion);
      } else {
        return renderFullRastreros(seccion);
      }
    }).join('');

    return `
      <div style="border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;">
        <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;background:#e2e8f0;text-align:center;font-size:13px;font-weight:800;color:#0f172a;letter-spacing:0.2px;">
          ${sheetTitle}
        </div>
        <div style="padding:16px;background:#f1f5f9;">
          ${bloquesHtml || '<div style="text-align:center;padding:20px;color:#64748b;">No hay dispositivos registrados en esta hoja</div>'}
        </div>
      </div>
    `;
  };

  return `
    <div class="modal-overlay js-close-formato-modal" style="position:fixed;inset:0;background:rgba(15,23,42,0.65);display:flex;align-items:center;justify-content:center;z-index:3000;padding:20px;">
      <div class="modal-content" style="background:#fff;border-radius:14px;max-width:980px;width:min(980px,100%);max-height:90vh;overflow:auto;padding:20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;">
          <div>
            <h3 style="margin:0 0 6px 0;font-size:20px;color:#0f172a;">Formato operacional</h3>
            <p style="margin:0;color:#475569;">${escapeHtml(card.titulo)}</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
              <select class="js-tipo-pdf-selector" style="padding:6px 10px;font-size:13px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;cursor:pointer;outline:none;">
                <option value="verdadera">Hoja Verdadera</option>
                <option value="falsa">Hoja Falsa/Auditiva</option>
              </select>
            <button class="btn-primary js-download-formato-pdf" type="button" data-service-id="${card.serviceId}" data-group-id="${card.groupId || ''}" style="display:flex;align-items:center;gap:6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Descargar PDF
            </button>
            <button class="btn-secondary js-close-formato-modal" type="button">Cerrar</button>
          </div>
        </div>

        <div style="margin-top:14px;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;">
          <div style="display:grid;grid-template-columns:minmax(0,1fr) 210px;min-height:110px;">
            <div style="display:grid;grid-template-columns:110px minmax(0,1fr);">
              <div style="border-right:1px solid #cbd5e1;display:flex;align-items:center;justify-content:center;padding:8px;">
                <img src="${escapeHtml(logoUrl)}" alt="Logo" style="max-width:100%;max-height:78px;object-fit:contain;display:block;" />
              </div>
              <div style="padding:10px 12px;border-right:1px solid #cbd5e1;display:flex;flex-direction:column;justify-content:center;gap:4px;">
                <div style="font-size:14px;font-weight:700;color:#0f172a;text-align:center;letter-spacing:0.3px;">FORMATO OPERACIONAL</div>
                <div style="font-size:13px;font-weight:600;color:#1e293b;text-align:center;line-height:1.35;">${escapeHtml(tituloPrincipal)}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-rows:repeat(3,minmax(0,1fr));">
              <div style="display:grid;grid-template-columns:80px minmax(0,1fr);border-bottom:1px solid #cbd5e1;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Código</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;font-weight:600;">${escapeHtml(formato.codigoDocumento || 'FO-OP-002')}</div>
              </div>
              <div style="display:grid;grid-template-columns:80px minmax(0,1fr);border-bottom:1px solid #cbd5e1;">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Fecha</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;">${escapeHtml(fallbackText(formatFechaDocumento(formato.fecha), 'No registrado'))}</div>
              </div>
              <div style="display:grid;grid-template-columns:80px minmax(0,1fr);">
                <div style="padding:8px 10px;border-right:1px solid #cbd5e1;font-size:13px;color:#334155;">Versión</div>
                <div style="padding:8px 10px;font-size:13px;color:#0f172a;">${escapeHtml(formato.version || '01')}</div>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid #cbd5e1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));">
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Cliente:</strong> ${escapeHtml(fallbackText(formato.cliente))}</div>
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Dirección:</strong> ${escapeHtml(fallbackText(formato.direccion))}</div>
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Fecha:</strong> ${escapeHtml(fallbackText(formatFechaDocumento(formato.fecha)))}</div>
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora llegada:</strong> ${escapeHtml(fallbackText(formatHoraDocumento(formato.horaLlegada)))}</div>
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora inicio:</strong> ${escapeHtml(fallbackText(formatHoraDocumento(formato.horaInicio)))}</div>
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora final:</strong> ${escapeHtml(fallbackText(formatHoraDocumento(formato.horaFinal)))}</div>
          </div>
        </div>

        <div style="margin-top:12px;display:grid;gap:12px;">
          ${renderHoja('verdadera')}
          ${renderHoja('falsa')}
        </div>

        <div style="margin-top:12px;border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;line-height:1.35;color:#334155;font-size:12px;white-space:pre-wrap;">
          <strong>Observaciones:</strong> ${escapeHtml(fallbackText(formato.observaciones, 'Sin observaciones registradas'))}
        </div>
      </div>
    </div>
  `;
}

// Tab: Servicios del Día
export function renderServiciosDiaTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px; grid-template-columns: repeat(4, minmax(0, 1fr));">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Servicios Programados</div>
          <div class="stat-box-value">12</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Completados</div>
          <div class="stat-box-value">8</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">En Proceso</div>
          <div class="stat-box-value">4</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Fichas Entregadas</div>
          <div class="stat-box-value">8/12</div>
        </div>
      </div>
    </div>

    <div class="recent-reports">
      <h3 style="margin-top: 32px; margin-bottom: 16px;">Informes Recientes con Evidencias</h3>
      <div class="reports-grid" id="operaciones-servicios-realizados-list">
        <p style="color:#64748b; margin:0;">Cargando servicios realizados...</p>
      </div>
    </div>
  `;
}

// Tab: Crear Informe (interfaz principal)
export function renderCrearInformeTab(): string {
  return `
    <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;">
      <!-- Panel izquierdo: Selector de Servicios -->
      <div style="display:grid;gap:12px;height:fit-content;">
        <div>
          <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#0f172a;">Servicios Disponibles</h3>
          <input type="text" placeholder="Buscar servicio..." class="js-servicio-search" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;" />
        </div>
        <div id="operaciones-servicios-lista" style="display:grid;gap:8px;max-height:600px;overflow-y:auto;">
          <p style="color:#64748b;font-size:13px;">Cargando servicios...</p>
        </div>
      </div>

      <!-- Panel derecho: Formulario de Informe -->
      <div style="display:grid;gap:16px;">
        <form id="operaciones-crear-informe-form-principal" style="display:grid;gap:14px;">
          <!-- Encabezado -->
          <div style="border-bottom:1px solid #cbd5e1;padding-bottom:12px;">
            <h2 style="margin:0 0 4px 0;font-size:16px;font-weight:700;color:#0f172a;">Crear Informe Técnico Mensual</h2>
            <p style="margin:0;color:#475569;font-size:13px;">Selecciona un servicio para pre-llenar los datos</p>
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
              <label style="font-size:13px;color:#334155;font-weight:600;margin-right:6px;">Hoja:</label>
              <select name="hoja_tipo" class="js-hoja-tipo-select" style="padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;">
                <option value="verdadera">Hoja Verdadera</option>
                <option value="falsa">Hoja Falsa</option>
              </select>
            </div>
          </div>

          <!-- Fila 1: Código y Mes -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Código de Informe</label>
              <input name="codigo_informe" type="text" placeholder="AQO-12-25" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;" />
            </div>
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Mes de la Actividad</label>
              <input name="mes_actividad" type="month" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;" />
            </div>
          </div>

          <!-- Fila 2: Cliente y Ubicación -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Cliente</label>
              <input name="cliente" type="text" readonly style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;background:#f8fafc;color:#334155;" />
            </div>
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Ubicación</label>
              <input name="ubicacion" type="text" readonly style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;background:#f8fafc;color:#334155;" />
            </div>
          </div>

          <!-- Fila 3: Actividad -->
          <div id="operaciones-dispositivos-preview" style="margin-top:6px;">
            <!-- Aquí se mostrarán los códigos y ubicaciones extraídos del Formato Operacional -->
          </div>

          <div>
            <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Actividad</label>
            <input name="actividad" type="text" readonly style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;background:#f8fafc;color:#334155;" />
          </div>

          <!-- Fila 4: Fechas de visitas y N° de fichas -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Fechas de Visitas (separadas por coma)</label>
              <input name="fechas_visitas" type="text" placeholder="10/12/2025, 23/12/2025" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;" />
            </div>
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Nº de Fichas</label>
              <input name="n_fichas" type="text" placeholder="007678" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;" />
            </div>
          </div>

          <!-- Fila 5: Elaborado por y N° visitas -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Elaborado por</label>
              <input name="elaborado_por" type="text" placeholder="Nombre del responsable" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;" />
            </div>
            <div>
              <label style="display:block;font-weight:600;color:#334155;margin-bottom:4px;font-size:13px;">Nº de visitas</label>
              <input name="n_visitas" type="number" min="0" value="1" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:100%;font-size:13px;" />
            </div>
          </div>

          <!-- Sección: Evidencias -->
          <div style="border-top:1px solid #cbd5e1;padding-top:12px;">
            <h4 style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#0f172a;">Evidencias Fotográficas del Servicio</h4>
            <div id="operaciones-evidencias-preview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">
              <p style="color:#64748b;font-size:12px;grid-column:1/-1;">Selecciona un servicio para ver evidencias</p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid #cbd5e1;padding-top:12px;">
            <button type="reset" class="btn-secondary" style="padding:8px 16px;">Limpiar</button>
            <button type="submit" class="btn-primary" style="padding:8px 16px;">Crear Informe</button>
          </div>
        </form>

        <div id="operaciones-informe-detalle" style="display:grid;gap:14px;">
          <div style="color:#64748b;font-size:13px;">Selecciona un cliente para ver el detalle por visitas.</div>
        </div>
      </div>
    </div>
  `;
}

// Tab: Historial de Informes
export function renderHistorialInformesTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar cliente..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los Informes</option>
        <option>Últimos 30 días</option>
        <option>Últimos 3 meses</option>
        <option>Este año</option>
      </select>
      <input type="date" class="filter-select" value="2025-01-31">
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>CÓDIGO INFORME</th>
            <th>CLIENTE</th>
            <th>MES ACTIVIDAD</th>
            <th>FECHA EMISIÓN</th>
            <th>ELABORADO POR</th>
            <th>Nº FICHAS</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>AQO-12-25</strong></td>
            <td>EMBOTELLADORA AGUAOASIS PERÚ S.A.C.</td>
            <td>Diciembre 2025</td>
            <td>17/01/2026</td>
            <td>BEATRIZ SULCA - ASISTENTE MIP</td>
            <td>007678</td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn-secondary" style="padding:4px 8px;font-size:11px;">Ver Detalles</button>
                <button class="btn-primary" style="padding:4px 8px;font-size:11px;">Descargar PDF</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>AQO-11-25</strong></td>
            <td>FARMACÉUTICA CENTRAL</td>
            <td>Noviembre 2025</td>
            <td>05/12/2025</td>
            <td>JUAN GARCÍA - SUPERVISOR</td>
            <td>007654</td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn-secondary" style="padding:4px 8px;font-size:11px;">Ver Detalles</button>
                <button class="btn-primary" style="padding:4px 8px;font-size:11px;">Descargar PDF</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>AQO-10-25</strong></td>
            <td>HOTEL MIRAMAR</td>
            <td>Octubre 2025</td>
            <td>31/10/2025</td>
            <td>BEATRIZ SULCA - ASISTENTE MIP</td>
            <td>007645</td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn-secondary" style="padding:4px 8px;font-size:11px;">Ver Detalles</button>
                <button class="btn-primary" style="padding:4px 8px;font-size:11px;">Descargar PDF</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats-row" style="margin-top:24px;grid-template-columns:repeat(4,minmax(0,1fr));">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Clientes</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Informes Entregados</div>
          <div class="stat-box-value">186</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Pendientes</div>
          <div class="stat-box-value">12</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tasa de Entrega</div>
          <div class="stat-box-value">93.9%</div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-5 de 24 clientes</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <button class="pagination-btn">4</button>
        <button class="pagination-btn">5</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

// Tab: Reportes Generales
export function renderReportesGeneralesTab() {
  return `
    <div class="search-filter-bar">
      <select class="filter-select">
        <option>Enero 2025</option>
        <option>Diciembre 2024</option>
        <option>Noviembre 2024</option>
        <option>Último Trimestre</option>
      </select>
      <select class="filter-select">
        <option>Todos los Servicios</option>
        <option>Fumigación</option>
        <option>Desratización</option>
        <option>Sanitización</option>
        <option>Mantenimiento</option>
      </select>
      <button class="btn-secondary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Exportar Excel
      </button>
    </div>

    <div class="stats-row" style="margin-bottom: 24px; grid-template-columns: repeat(4, minmax(0, 1fr));">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><clipboard></clipboard></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Servicios Realizados</div>
          <div class="stat-box-value">245</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tiempo Promedio</div>
          <div class="stat-box-value">3.2 <span class="stat-box-note">hrs</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Satisfacción Cliente</div>
          <div class="stat-box-value">97.5%</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Informes Generados</div>
          <div class="stat-box-value">238</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <div class="card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Servicios por Tipo</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>TIPO DE SERVICIO</th>
                <th>CANTIDAD</th>
                <th>PORCENTAJE</th>
                <th>PROMEDIO/DÍA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge">Fumigación</span></td>
                <td><strong>98</strong></td>
                <td>40.0%</td>
                <td>3.2</td>
              </tr>
              <tr>
                <td><span class="badge blue">Desratización</span></td>
                <td><strong>67</strong></td>
                <td>27.3%</td>
                <td>2.2</td>
              </tr>
              <tr>
                <td><span class="badge orange">Sanitización</span></td>
                <td><strong>52</strong></td>
                <td>21.2%</td>
                <td>1.7</td>
              </tr>
              <tr>
                <td><span class="badge green">Mantenimiento</span></td>
                <td><strong>28</strong></td>
                <td>11.4%</td>
                <td>0.9</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Técnicos más Productivos</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>TÉCNICO</th>
                <th>SERVICIOS</th>
                <th>INFORMES</th>
                <th>CALIFICACIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">Juan Ramírez</div>
                  </div>
                </td>
                <td><strong>58</strong></td>
                <td>58/58</td>
                <td><span class="status-indicator success">★ 4.9</span></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">Pedro López</div>
                  </div>
                </td>
                <td><strong>52</strong></td>
                <td>52/52</td>
                <td><span class="status-indicator success">★ 4.8</span></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">Carlos Mendoza</div>
                  </div>
                </td>
                <td><strong>48</strong></td>
                <td>45/48</td>
                <td><span class="status-indicator success">★ 4.7</span></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">María Soto</div>
                  </div>
                </td>
                <td><strong>42</strong></td>
                <td>40/42</td>
                <td><span class="status-indicator success">★ 4.8</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Evolución de Servicios - Enero 2025</h3>
      <div style="height: 240px; background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%); border-radius: 8px; display: flex; align-items: flex-end; justify-content: space-around; padding: 20px; gap: 4px;">
        <div style="text-align: center;">
          <div style="width: 24px; height: 140px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">1</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 155px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">2</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 135px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">3</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 170px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">4</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 165px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">5</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 90px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">6</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 95px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">7</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 160px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">8</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 175px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">9</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 155px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">10</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 145px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">11</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 85px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">12</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 90px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">13</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 180px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">14</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 170px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">15</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 160px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">16</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 24px; height: 150px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 11px; color: #666;">17</div>
        </div>
      </div>
    </div>
  `;
}

export function renderOperaciones() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Operaciones e Informes</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Servicio
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="servicios">Servicios del Día</button>
      <button class="tab-btn" data-tab="crear">Crear Informe</button>
      <button class="tab-btn" data-tab="historial">Historial de Informes</button>
    </div>

    <div id="operaciones-tab-content">
      ${renderServiciosDiaTab()}
    </div>
  `;
}
