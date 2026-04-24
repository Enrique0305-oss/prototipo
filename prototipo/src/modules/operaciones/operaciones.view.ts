import { API_CONFIG } from '../../core/api/api.config'
import type { Programacion } from '../programaciones/programaciones.types'

// Operaciones e Informes View

type ProgramacionConEvidencias = Programacion & {
  id_grupo_programacion?: number | null;
  fotos_evidencia?: unknown;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatFecha(value?: string): string {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('es-PE');
}

function resolvePhotoUrl(raw: string): string {
  const value = (raw || '').trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const base = API_CONFIG.baseURL.replace(/\/api(?:\/v\d+)?\/?$/i, '');
  const normalized = value.startsWith('/') ? value.substring(1) : value;

  if (normalized.startsWith('storage/')) {
    return `${base}/${normalized}`;
  }

  if (normalized.startsWith('public/')) {
    return `${base}/storage/${normalized.substring('public/'.length)}`;
  }

  return `${base}/storage/${normalized}`;
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
    const photosBlock = card.previewImages.length > 0
      ? `
          <div class="report-photos">
            ${card.previewImages.map((url) => `
              <div class="photo-thumb" style="overflow:hidden;">
                <img src="${escapeHtml(url)}" alt="Evidencia" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" />
              </div>
            `).join('')}
            ${card.extraCount > 0 ? `<div class="photo-count">+${card.extraCount}</div>` : ''}
          </div>
        `
      : '<div class="report-photos"><span style="color:#64748b;font-size:14px;">Sin imágenes registradas</span></div>';

    return `
      <div class="report-card">
        <div class="report-header">
          <h4>${escapeHtml(card.titulo)}</h4>
          <span class="report-date">${escapeHtml(card.fechaLabel)}</span>
        </div>
        <div class="report-details">
          <p><strong>Técnico(s):</strong> ${escapeHtml(card.tecnicosLabel)}</p>
        </div>
        <div class="report-content-split">
          <div class="report-evidence-column">
            ${photosBlock}
          </div>
          <div class="report-docs-column">
            <button class="report-doc report-doc-primary js-open-ficha-operacional" type="button" data-card-key="${escapeHtml(card.key)}" title="Ver ficha operacional">
              <span class="report-doc-icon" aria-hidden="true">📄</span>
            </button>
            <button class="report-doc report-doc-placeholder" type="button" disabled title="Disponible próximamente">
              <span class="report-doc-icon" aria-hidden="true">📄</span>
            </button>
          </div>
        </div>
        <div class="report-actions-row">
          <button class="btn-secondary fullwidth js-open-imagenes-completas" data-card-key="${escapeHtml(card.key)}" ${card.secciones.length === 0 ? 'disabled' : ''}>Ver imágenes completas</button>
        </div>
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

function fallbackText(value: string | null | undefined, emptyLabel = 'No registrado'): string {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : emptyLabel;
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
  const base = API_CONFIG.baseURL.replace(/\/api(?:\/v\d+)?\/?$/i, '');
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
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora llegada:</strong> ${escapeHtml(fallbackText(ficha.horaLlegada))}</div>
            <div style="padding:8px 10px;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora inicio:</strong> ${escapeHtml(fallbackText(ficha.horaInicio))}</div>
            <div style="padding:8px 10px;border-bottom:1px solid #cbd5e1;font-size:14px;"><strong>Hora final:</strong> ${escapeHtml(fallbackText(ficha.horaFinal))}</div>
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

// Tab: Informes por Cliente
export function renderInformesClienteTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar cliente..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los Clientes</option>
        <option>Con Informes Pendientes</option>
        <option>Informes Entregados</option>
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
            <th>CLIENTE</th>
            <th>SERVICIOS DEL MES</th>
            <th>INFORMES ENTREGADOS</th>
            <th>PENDIENTES</th>
            <th>ÚLTIMA VISITA</th>
            <th>PRÓXIMA VISITA</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Logística Transandina</div>
                  <div class="equipment-id">Carlos Mendoza</div>
                </div>
              </div>
            </td>
            <td><strong>5</strong></td>
            <td><span class="status-indicator success">5/5</span></td>
            <td><span class="badge">0</span></td>
            <td>28/01/2025</td>
            <td>05/02/2025</td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Informes</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Farmacéutica Central</div>
                  <div class="equipment-id">Roberto Díaz</div>
                </div>
              </div>
            </td>
            <td><strong>4</strong></td>
            <td><span class="status-indicator warning">2/4</span></td>
            <td><span class="badge orange">2</span></td>
            <td>30/01/2025</td>
            <td>07/02/2025</td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Informes</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Hotel Miramar</div>
                  <div class="equipment-id">Jorge Pérez</div>
                </div>
              </div>
            </td>
            <td><strong>3</strong></td>
            <td><span class="status-indicator success">3/3</span></td>
            <td><span class="badge">0</span></td>
            <td>25/01/2025</td>
            <td>01/02/2025</td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Informes</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Almacenes del Norte</div>
                  <div class="equipment-id">Ana Torres</div>
                </div>
              </div>
            </td>
            <td><strong>6</strong></td>
            <td><span class="status-indicator success">6/6</span></td>
            <td><span class="badge">0</span></td>
            <td>29/01/2025</td>
            <td>03/02/2025</td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Informes</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Supermercado Central</div>
                  <div class="equipment-id">María Sánchez</div>
                </div>
              </div>
            </td>
            <td><strong>8</strong></td>
            <td><span class="status-indicator warning">5/8</span></td>
            <td><span class="badge orange">3</span></td>
            <td>31/01/2025</td>
            <td>06/02/2025</td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Informes</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats-row" style="margin-top: 24px; grid-template-columns: repeat(4, minmax(0, 1fr));">
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
      <button class="tab-btn" data-tab="informes">Informes por Cliente</button>
      <button class="tab-btn" data-tab="reportes">Reportes Generales</button>
    </div>

    <div id="operaciones-tab-content">
      ${renderServiciosDiaTab()}
    </div>
  `;
}
