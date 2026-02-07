// Logística View

// Tab: Clientes
export function renderClientesTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar cliente..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los sectores</option>
        <option>Industrial</option>
        <option>Comercial</option>
        <option>Residencial</option>
        <option>Alimenticio</option>
      </select>
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="client-grid">
      <div class="client-card">
        <div class="client-header">
          <div class="client-avatar">LT</div>
          <div class="client-info">
            <h3>Logística Transandina</h3>
            <p class="client-type">Industrial</p>
          </div>
          <span class="client-status active">Activo</span>
        </div>
        <div class="client-details">
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Av. Industrial 245, Callao</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>(01) 420-8500</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Carlos Mendoza - Gerente</span>
          </div>
        </div>
        <div class="client-stats">
          <div class="client-stat">
            <div class="stat-number">12</div>
            <div class="stat-label">Servicios</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">Mensual</div>
            <div class="stat-label">Frecuencia</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">$2,800</div>
            <div class="stat-label">Facturado</div>
          </div>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="client-card">
        <div class="client-header">
          <div class="client-avatar">AN</div>
          <div class="client-info">
            <h3>Almacenes del Norte</h3>
            <p class="client-type">Comercial</p>
          </div>
          <span class="client-status active">Activo</span>
        </div>
        <div class="client-details">
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Jr. Los Pinos 890, San Juan</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>(01) 356-7421</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Ana Torres - Administradora</span>
          </div>
        </div>
        <div class="client-stats">
          <div class="client-stat">
            <div class="stat-number">8</div>
            <div class="stat-label">Servicios</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">Quincenal</div>
            <div class="stat-label">Frecuencia</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">$1,600</div>
            <div class="stat-label">Facturado</div>
          </div>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="client-card">
        <div class="client-header">
          <div class="client-avatar">FC</div>
          <div class="client-info">
            <h3>Farmacéutica Central</h3>
            <p class="client-type">Alimenticio</p>
          </div>
          <span class="client-status active">Activo</span>
        </div>
        <div class="client-details">
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Av. Salud 123, Miraflores</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>(01) 445-9800</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Roberto Díaz - Director</span>
          </div>
        </div>
        <div class="client-stats">
          <div class="client-stat">
            <div class="stat-number">15</div>
            <div class="stat-label">Servicios</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">Semanal</div>
            <div class="stat-label">Frecuencia</div>
          </div>
          <div class="client-stat">
            <div class="stat-number">$3,200</div>
            <div class="stat-label">Facturado</div>
          </div>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-6 de 24 clientes</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <button class="pagination-btn">4</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

// Tab: Servicios Disponibles
export function renderServiciosDisponiblesTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar servicio..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los servicios</option>
        <option>Fumigación</option>
        <option>Desratización</option>
        <option>Desinsectación</option>
        <option>Sanitización</option>
      </select>
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon blue">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        </div>
        <h3>Fumigación Residencial</h3>
        <p class="service-description">Control integral de plagas en viviendas y departamentos</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">2-3 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$180</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Cucarachas</span>
          <span class="tag">Hormigas</span>
          <span class="tag">Arañas</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon green">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        </div>
        <h3>Fumigación Comercial</h3>
        <p class="service-description">Protección profesional para negocios y locales comerciales</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">4-6 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$350</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Roedores</span>
          <span class="tag">Insectos</span>
          <span class="tag">Certificado</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon orange">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3>Desratización</h3>
        <p class="service-description">Eliminación y control especializado de roedores</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">3-4 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$250</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Ratas</span>
          <span class="tag">Ratones</span>
          <span class="tag">Prevención</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon blue">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
        </div>
        <h3>Sanitización COVID-19</h3>
        <p class="service-description">Desinfección profunda con productos certificados</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">2-3 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$200</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Virus</span>
          <span class="tag">Bacterias</span>
          <span class="tag">Certificado</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon green">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <h3>Fumigación Industrial</h3>
        <p class="service-description">Soluciones integrales para plantas y almacenes</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">8+ hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$800</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Gran Escala</span>
          <span class="tag">Preventivo</span>
          <span class="tag">BPM</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>

      <div class="service-card">
        <div class="service-icon orange">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        </div>
        <h3>Desinsectación</h3>
        <p class="service-description">Control especializado de insectos voladores y rastreros</p>
        <div class="service-stats">
          <div class="service-stat">
            <span class="stat-label">Duración</span>
            <span class="stat-value">2-4 hrs</span>
          </div>
          <div class="service-stat">
            <span class="stat-label">Precio Base</span>
            <span class="stat-value">$220</span>
          </div>
        </div>
        <div class="service-tags">
          <span class="tag">Moscas</span>
          <span class="tag">Mosquitos</span>
          <span class="tag">Pulgas</span>
        </div>
        <button class="btn-secondary fullwidth">Ver Detalles</button>
      </div>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-6 de 12 servicios disponibles</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

// Tab: Rutas
export function renderRutasTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Rutas Activas Hoy</div>
          <div class="stat-box-value">8</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Servicios Programados</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tiempo Promedio</div>
          <div class="stat-box-value">3.5 <span class="stat-box-note">hrs/ruta</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar ruta..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los vehículos</option>
        <option>Unidad U-05</option>
        <option>Unidad U-12</option>
        <option>Unidad U-18</option>
      </select>
      <input type="date" class="filter-select" value="2026-01-31">
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>RUTA</th>
            <th>VEHÍCULO</th>
            <th>CONDUCTOR</th>
            <th>SERVICIOS</th>
            <th>HORARIO</th>
            <th>ZONA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>RUTA-A-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-05</div>
                  <div class="equipment-id">ABC-123</div>
                </div>
              </div>
            </td>
            <td>Carlos Mendoza</td>
            <td>4 servicios</td>
            <td>08:00 - 14:30</td>
            <td>Lima Norte</td>
            <td><span class="badge blue">En Curso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-B-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-12</div>
                  <div class="equipment-id">DEF-456</div>
                </div>
              </div>
            </td>
            <td>Juan Ramírez</td>
            <td>3 servicios</td>
            <td>09:00 - 13:00</td>
            <td>Lima Sur</td>
            <td><span class="badge blue">En Curso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-C-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-18</div>
                  <div class="equipment-id">GHI-789</div>
                </div>
              </div>
            </td>
            <td>Pedro López</td>
            <td>5 servicios</td>
            <td>07:30 - 15:00</td>
            <td>Callao</td>
            <td><span class="badge green">Completada</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-D-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-22</div>
                  <div class="equipment-id">JKL-012</div>
                </div>
              </div>
            </td>
            <td>Luis Torres</td>
            <td>2 servicios</td>
            <td>10:00 - 12:30</td>
            <td>Miraflores</td>
            <td><span class="badge">Programada</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>RUTA-E-031</strong></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Unidad U-08</div>
                  <div class="equipment-id">MNO-345</div>
                </div>
              </div>
            </td>
            <td>María Soto</td>
            <td>6 servicios</td>
            <td>08:30 - 16:00</td>
            <td>San Juan</td>
            <td><span class="badge blue">En Curso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-5 de 8 rutas activas</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

export function renderLogistica() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Logística</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar Cliente
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="clientes">Clientes</button>
      <button class="tab-btn" data-tab="servicios">Servicios Disponibles</button>
      <button class="tab-btn" data-tab="rutas">Rutas</button>
    </div>

    <div id="logistica-tab-content">
      ${renderClientesTab()}
    </div>
  `;
}
