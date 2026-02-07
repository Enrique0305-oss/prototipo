// Operaciones e Informes View

// Tab: Servicios del Día
export function renderServiciosDiaTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
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

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>SERVICIO</th>
            <th>CLIENTE</th>
            <th>TÉCNICO</th>
            <th>HORA</th>
            <th>TIPO</th>
            <th>ESTADO</th>
            <th>FICHA</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><clipboard></clipboard></svg>
                </div>
                <div>
                  <div class="equipment-name">OS-2025-089</div>
                  <div class="equipment-id">Fumigación Industrial</div>
                </div>
              </div>
            </td>
            <td>Logística Transandina</td>
            <td>Juan Ramírez</td>
            <td>08:30 AM</td>
            <td><span class="badge">Fumigación</span></td>
            <td><span class="status-indicator success">Completado</span></td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Entregada
              </span>
            </td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Informe</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><clipboard></clipboard></svg>
                </div>
                <div>
                  <div class="equipment-name">OS-2025-090</div>
                  <div class="equipment-id">Desratización</div>
                </div>
              </div>
            </td>
            <td>Farmacéutica Central</td>
            <td>María Soto</td>
            <td>10:00 AM</td>
            <td><span class="badge blue">Desratización</span></td>
            <td><span class="status-indicator warning">En Proceso</span></td>
            <td>
              <span class="evidence-badge pending">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Pendiente
              </span>
            </td>
            <td>
              <button class="action-btn">⋮</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><clipboard></clipboard></svg>
                </div>
                <div>
                  <div class="equipment-name">OS-2025-091</div>
                  <div class="equipment-id">Mantenimiento Preventivo</div>
                </div>
              </div>
            </td>
            <td>Almacenes del Norte</td>
            <td>Pedro López</td>
            <td>02:00 PM</td>
            <td><span class="badge green">Mantenimiento</span></td>
            <td><span class="status-indicator success">Completado</span></td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Entregada
              </span>
            </td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Informe</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><clipboard></clipboard></svg>
                </div>
                <div>
                  <div class="equipment-name">OS-2025-092</div>
                  <div class="equipment-id">Fumigación Residencial</div>
                </div>
              </div>
            </td>
            <td>Condominio Las Flores</td>
            <td>Carlos Mendoza</td>
            <td>04:00 PM</td>
            <td><span class="badge">Fumigación</span></td>
            <td><span class="status-indicator">Programado</span></td>
            <td>
              <span class="evidence-badge pending">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Pendiente
              </span>
            </td>
            <td>
              <button class="action-btn">⋮</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="recent-reports">
      <h3 style="margin-top: 32px; margin-bottom: 16px;">Informes Recientes con Evidencias</h3>
      <div class="reports-grid">
        <div class="report-card">
          <div class="report-header">
            <h4>Fumigación - Logística Transandina</h4>
            <span class="report-date">15/01/2025</span>
          </div>
          <div class="report-details">
            <p><strong>Técnico:</strong> Juan Ramírez</p>
            <p><strong>Tipo:</strong> Control de Plagas</p>
            <p><strong>Productos:</strong> Cipermetrina 25% EC</p>
          </div>
          <div class="report-photos">
            <div class="photo-thumb">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="photo-thumb">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="photo-count">+3</div>
          </div>
          <button class="btn-secondary fullwidth">Ver Informe Completo</button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h4>Mantenimiento - Almacenes del Norte</h4>
            <span class="report-date">15/01/2025</span>
          </div>
          <div class="report-details">
            <p><strong>Técnico:</strong> Pedro López</p>
            <p><strong>Tipo:</strong> Preventivo</p>
            <p><strong>Equipos:</strong> Nebulizador X-200</p>
          </div>
          <div class="report-photos">
            <div class="photo-thumb">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="photo-thumb">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="photo-count">+2</div>
          </div>
          <button class="btn-secondary fullwidth">Ver Informe Completo</button>
        </div>
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

    <div class="stats-row" style="margin-top: 24px;">
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

    <div class="stats-row" style="margin-bottom: 24px;">
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
