import type { DashboardData } from './dashboard.types';
import { productoService } from '../../services/productoService';
import { mantenimientoService } from '../../services/mantenimientoService';
import { apiClient } from '../../core/api/api.client';

export function renderDashboard(data?: DashboardData) {
  // Si no hay datos, mostrar loading o usar mock
  // En producción, data vendrá de dashboardService.getDashboardData()
  
  return `
    <!-- Banner de alerta de stock bajo (se llena dinámicamente) -->
    <div id="stock-bajo-banner"></div>

    <!-- Banner de alerta de mantenimientos próximos/vencidos -->
    <div id="mantenimiento-alerta-banner"></div>

    <!-- Banner de alerta de cotizaciones aceptadas sin orden -->
    <div id="cotizaciones-sin-orden-banner"></div>

    <div class="page-header">
      <h1>Panel de Control Multidisciplinario</h1>
      <p>Resumen general de operaciones y gestión de QSCI Group.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></span>
          <span class="stat-change positive">+12%</span>
        </div>
        <div class="stat-label">Inventario Total</div>
        <div class="stat-value">1,284 <span class="stat-unit">unidades</span></div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg></span>
          <span class="stat-change urgent">1 Urgente</span>
        </div>
        <div class="stat-label">Servicios Pendientes</div>
        <div class="stat-value">42 <span class="stat-unit">hoy</span></div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>
          <span class="stat-change positive">+8.4%</span>
        </div>
        <div class="stat-label">Ingresos Mensuales</div>
        <div class="stat-value">$84,250 <span class="stat-unit">USD</span></div>
      </div>
    </div>

    <!-- Activities and System Status -->
    <div class="content-grid">
      <div class="activities-section">
        <div class="section-header">
          <h2>Actividades Recientes</h2>
          <button class="link-btn">Ver Todo</button>
        </div>
        
        <table class="activities-table">
          <thead>
            <tr>
              <th>CLIENTE / SERVICIO</th>
              <th>ESTADO</th>
              <th>FECHA</th>
              <th>TÉCNICO</th>
              <th>ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="service-info">
                  <span class="service-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5l3 3v5h-2m-4 0H2"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></span>
                  <div>
                    <div class="service-name">Logística Norte S.A.</div>
                    <div class="service-desc">Fumigación de Almacén</div>
                  </div>
                </div>
              </td>
              <td><span class="badge completed">COMPLETADO</span></td>
              <td>Hace 2 hrs</td>
              <td>Juan Pérez</td>
              <td><button class="action-btn">⋮</button></td>
            </tr>
            <tr>
              <td>
                <div class="service-info">
                  <span class="service-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>
                  <div>
                    <div class="service-name">Residencial Las Lomas</div>
                    <div class="service-desc">Control de Plagas Jardín</div>
                  </div>
                </div>
              </td>
              <td><span class="badge in-progress">EN PROCESO</span></td>
              <td>Hace 4 hrs</td>
              <td>María García</td>
              <td><button class="action-btn">⋮</button></td>
            </tr>
            <tr>
              <td>
                <div class="service-info">
                  <span class="service-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></span>
                  <div>
                    <div class="service-name">Súper Todo Express</div>
                    <div class="service-desc">Inspección Sanitaria</div>
                  </div>
                </div>
              </td>
              <td><span class="badge pending">PENDIENTE</span></td>
              <td>Hoy, 09:00 AM</td>
              <td>Carlos Ruiz</td>
              <td><button class="action-btn">⋮</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sidebar-right">
        <div class="system-status">
          <h3>Estado del Sistema</h3>
          <div class="status-item">
            <div class="status-label">Capacidad Almacén</div>
            <div class="status-bar">
              <div class="status-fill" style="width: 78%"></div>
            </div>
            <div class="status-value">78%</div>
          </div>
          <div class="status-item">
            <div class="status-label">Rendimiento Operativo</div>
            <div class="status-bar">
              <div class="status-fill green" style="width: 92%"></div>
            </div>
            <div class="status-value">92%</div>
          </div>
        </div>

        <div class="upcoming-services">
          <h3>Próximos Servicios</h3>
          <div class="service-item">
            <div class="service-date">
              <div class="date-month">NOV</div>
              <div class="date-day">24</div>
            </div>
            <div class="service-details">
              <div class="service-title">Almacén Central FedEx</div>
              <div class="service-subtitle">Mantenimiento Mensual</div>
            </div>
          </div>
          <div class="service-item">
            <div class="service-date">
              <div class="date-month">NOV</div>
              <div class="date-day">25</div>
            </div>
            <div class="service-details">
              <div class="service-title">Hotel Continental</div>
              <div class="service-subtitle">Inspección de Cocinas</div>
            </div>
          </div>
          <button class="calendar-btn">Ver Calendario Completo</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Carga las estadísticas de productos y muestra un banner de alerta
 * si hay productos con stock por debajo del stock de seguridad.
 */
export async function cargarAlertaStockBajo() {
  try {
    const res = await productoService.getEstadisticas();
    const raw = res.data || res;
    const stats = (raw as any).data || raw;
    const stockBajo = stats.stock_bajo || 0;

    const banner = document.getElementById('stock-bajo-banner');
    if (!banner) return;

    if (stockBajo > 0) {
      banner.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-left: 5px solid #d97706;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
          animation: bannerSlideIn 0.4s ease-out;
        ">
          <div style="
            flex-shrink: 0;
            width: 44px;
            height: 44px;
            background: #d97706;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 15px; color: #92400e; margin-bottom: 2px;">
              ⚠ Alerta de Stock Bajo
            </div>
            <div style="font-size: 13px; color: #78350f;">
              Tienes <strong>${stockBajo} producto${stockBajo > 1 ? 's' : ''}</strong> con stock por debajo del nivel de seguridad. Revisa el inventario para reabastecer a tiempo.
            </div>
          </div>
          <button id="btn-ir-inventario" style="
            flex-shrink: 0;
            padding: 8px 18px;
            background: #d97706;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
            white-space: nowrap;
          " onmouseover="this.style.background='#b45309'" onmouseout="this.style.background='#d97706'">
            Ir a Inventario →
          </button>
          <button id="btn-cerrar-banner-stock" style="
            flex-shrink: 0;
            background: none;
            border: none;
            cursor: pointer;
            color: #92400e;
            font-size: 20px;
            line-height: 1;
            padding: 4px;
            opacity: 0.6;
            transition: opacity 0.2s;
          " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Cerrar alerta">
            &times;
          </button>
        </div>
      `;

      // Botón cerrar banner
      document.getElementById('btn-cerrar-banner-stock')?.addEventListener('click', () => {
        if (banner) banner.innerHTML = '';
      });

      // Botón ir a inventario - dispara click en menú Almacén > Inventario
      document.getElementById('btn-ir-inventario')?.addEventListener('click', () => {
        // Buscar el botón de Almacén en el sidebar y simular navegación
        const almacenBtn = document.querySelector('[data-menu="Almacén"]') as HTMLButtonElement;
        if (almacenBtn) almacenBtn.click();
        setTimeout(() => {
          const inventarioBtn = document.querySelector('[data-submenu="Inventario"]') as HTMLButtonElement;
          if (inventarioBtn) inventarioBtn.click();
        }, 100);
      });
    }
  } catch (e) {
    console.error('Error cargando alerta de stock bajo:', e);
  }
}

/**
 * Carga alertas de mantenimientos próximos y vencidos y muestra un banner en el dashboard.
 */
export async function cargarAlertaMantenimiento() {
  try {
    const resp = await mantenimientoService.getAlertasMantenimiento();
    const data = (resp as any).data || resp;

    const totalAlertas = data.total_alertas || 0;
    const proximos = data.proximos || 0;
    const vencidos = data.vencidos || 0;
    const alertas: Array<{
      tipo: 'proximo' | 'vencido';
      equipo: string;
      fecha: string;
      tiempo_texto: string;
      es_prueba: boolean;
    }> = data.alertas || [];

    const banner = document.getElementById('mantenimiento-alerta-banner');
    if (!banner) return;

    if (totalAlertas === 0) {
      banner.innerHTML = '';
      return;
    }

    // Separar alertas
    const listaProximos = alertas.filter(a => a.tipo === 'proximo');
    const listaVencidos = alertas.filter(a => a.tipo === 'vencido');

    // Color: si hay vencidos → rojo, solo próximos → azul/naranja
    const hayVencidos = vencidos > 0;
    const colorPrimario = hayVencidos ? '#dc2626' : '#2563eb';
    const colorFondo = hayVencidos
      ? 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'
      : 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)';
    const colorBorde = hayVencidos ? '#dc2626' : '#2563eb';
    const colorTexto = hayVencidos ? '#991b1b' : '#1e40af';
    const colorTextoSub = hayVencidos ? '#b91c1c' : '#1d4ed8';

    // Generar items de detalle (máximo 5)
    const itemsHTML = alertas.slice(0, 5).map(a => {
      const iconColor = a.tipo === 'vencido' ? '#dc2626' : '#f59e0b';
      const icon = a.tipo === 'vencido'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
      const badgeColor = a.tipo === 'vencido' ? 'background:#fee2e2; color:#991b1b;' : 'background:#fef3c7; color:#92400e;';
      const pruebaBadge = a.es_prueba ? '<span style="font-size:9px; padding:1px 4px; border-radius:4px; background:#e0e7ff; color:#3730a3; margin-left:4px;">TEST</span>' : '';

      return `
        <div style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:rgba(255,255,255,0.6); border-radius:6px; font-size:12px;">
          <span style="color:${iconColor}; flex-shrink:0;">${icon}</span>
          <strong style="color:#1e293b;">${a.equipo}</strong>${pruebaBadge}
          <span style="color:#64748b;">—</span>
          <span style="padding:2px 6px; border-radius:4px; font-size:11px; ${badgeColor}">${a.tipo === 'vencido' ? 'Vencido' : 'Próximo'}</span>
          <span style="color:#64748b; font-size:11px; margin-left:auto;">${a.tiempo_texto}</span>
        </div>
      `;
    }).join('');

    const masAlertas = totalAlertas > 2 ? `<div style="font-size:11px; color:${colorTextoSub}; text-align:center; margin-top:4px; font-style:italic;">...y ${totalAlertas - alertas.length} más en Programación Anual</div>` : '';

    // Texto resumen
    const partes: string[] = [];
    if (proximos > 0) partes.push(`<strong>${proximos}</strong> próximo${proximos > 1 ? 's' : ''}`);
    if (vencidos > 0) partes.push(`<strong>${vencidos}</strong> vencido${vencidos > 1 ? 's' : ''}`);
    const resumenTexto = `Tienes ${partes.join(' y ')} mantenimiento${totalAlertas > 1 ? 's' : ''} que requieren atención.`;

    banner.innerHTML = `
      <div style="
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 20px;
        margin-bottom: 20px;
        background: ${colorFondo};
        border: 1px solid ${colorBorde};
        border-left: 5px solid ${colorPrimario};
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        animation: bannerSlideIn 0.4s ease-out;
      ">
        <div style="
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          background: ${colorPrimario};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 15px; color: ${colorTexto}; margin-bottom: 4px;">
            ${hayVencidos ? 'Mantenimientos Vencidos' : 'Mantenimientos Próximos'}
          </div>
          <div style="font-size: 13px; color: ${colorTextoSub}; margin-bottom: 8px;">
            ${resumenTexto}
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${itemsHTML}
            ${masAlertas}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
          <button id="btn-ir-mantenimiento" style="
            padding: 8px 18px;
            background: ${colorPrimario};
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
            white-space: nowrap;
          " onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
            Ir a Mantenimiento →
          </button>
          <button id="btn-cerrar-banner-mant" style="
            flex-shrink: 0;
            background: none;
            border: none;
            cursor: pointer;
            color: ${colorTexto};
            font-size: 20px;
            line-height: 1;
            padding: 4px;
            opacity: 0.6;
            transition: opacity 0.2s;
          " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Cerrar alerta">
            &times;
          </button>
        </div>
      </div>
    `;

    // Botón cerrar
    document.getElementById('btn-cerrar-banner-mant')?.addEventListener('click', () => {
      if (banner) banner.innerHTML = '';
    });

    // Botón ir a mantenimiento
    document.getElementById('btn-ir-mantenimiento')?.addEventListener('click', () => {
      const almacenBtn = document.querySelector('[data-menu="Almacén"]') as HTMLButtonElement;
      if (almacenBtn) almacenBtn.click();
      setTimeout(() => {
        const mantBtn = document.querySelector('[data-submenu="Mantenimiento"]') as HTMLButtonElement;
        if (mantBtn) mantBtn.click();
        // Auto-click en tab programación anual
        setTimeout(() => {
          const progTab = document.querySelector('[data-tab="programacion-anual"]') as HTMLButtonElement;
          if (progTab) progTab.click();
        }, 200);
      }, 100);
    });
  } catch (e) {
    console.error('Error cargando alerta de mantenimientos:', e);
  }
}

/**
 * Carga alerta de cotizaciones aceptadas que aún no tienen orden generada.
 */
export async function cargarAlertaCotizacionesSinOrden() {
  try {
    const res = await apiClient.get<{ success: boolean; data: { total: number; producto: number; servicio: number; capacitacion: number } }>('/cotizaciones/alerta-sin-orden');
    const raw = (res as any).data || res;
    const data = raw.data || raw;

    const total: number = data.total || 0;
    const producto: number = data.producto || 0;
    const servicio: number = data.servicio || 0;
    const capacitacion: number = data.capacitacion || 0;

    const banner = document.getElementById('cotizaciones-sin-orden-banner');
    if (!banner) return;

    if (total === 0) {
      banner.innerHTML = '';
      return;
    }

    // Generar detalle por tipo
    const detalles: string[] = [];
    if (producto > 0) detalles.push(`<strong>${producto}</strong> de Producto`);
    if (servicio > 0) detalles.push(`<strong>${servicio}</strong> de Servicio`);
    if (capacitacion > 0) detalles.push(`<strong>${capacitacion}</strong> de Capacitación`);
    const detalleTexto = detalles.join(', ');

    banner.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 20px;
        margin-bottom: 20px;
        background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
        border: 1px solid #10b981;
        border-left: 5px solid #059669;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
        animation: bannerSlideIn 0.4s ease-out;
      ">
        <div style="
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          background: #059669;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
            <line x1="12" y1="12" x2="12" y2="18"></line>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 15px; color: #065f46; margin-bottom: 2px;">
             Cotizaciones Aceptadas Pendientes
          </div>
          <div style="font-size: 13px; color: #047857;">
            Tienes <strong>${total}</strong> cotización${total > 1 ? 'es' : ''} aceptada${total > 1 ? 's' : ''} sin orden generada: ${detalleTexto}.
          </div>
        </div>
        <button id="btn-ir-cotizaciones" style="
          flex-shrink: 0;
          padding: 8px 18px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        " onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
          Ir a Cotizaciones →
        </button>
        <button id="btn-cerrar-banner-cotizaciones" style="
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: #065f46;
          font-size: 20px;
          line-height: 1;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Cerrar alerta">
          &times;
        </button>
      </div>
    `;

    // Botón cerrar banner
    document.getElementById('btn-cerrar-banner-cotizaciones')?.addEventListener('click', () => {
      if (banner) banner.innerHTML = '';
    });

    // Botón ir a cotizaciones
    document.getElementById('btn-ir-cotizaciones')?.addEventListener('click', () => {
      const comercialBtn = document.querySelector('[data-menu="Comercial"]') as HTMLButtonElement;
      if (comercialBtn) comercialBtn.click();
      setTimeout(() => {
        const cotBtn = document.querySelector('[data-submenu="Cotizaciones"]') as HTMLButtonElement;
        if (cotBtn) cotBtn.click();
      }, 100);
    });
  } catch (e) {
    console.error('Error cargando alerta de cotizaciones sin orden:', e);
  }
}
