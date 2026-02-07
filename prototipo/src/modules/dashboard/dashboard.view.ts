import type { DashboardData } from './dashboard.types';

export function renderDashboard(data?: DashboardData) {
  // Si no hay datos, mostrar loading o usar mock
  // En producción, data vendrá de dashboardService.getDashboardData()
  
  return `
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
