// Almacén - Mantenimiento de Equipos View
export function renderAlmacenMantenimiento() {
  return `
    <div class="op-main-container">
      <!-- Header -->
      <div class="op-header">
        <div class="op-header-top">
          <h1 class="op-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="18" rx="2"></rect>
              <line x1="2" y1="8" x2="22" y2="8"></line>
            </svg>
            Mantenimiento de Equipos
          </h1>
          <button class="btn-primary" id="btnAgendarMantenimiento">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agendar Mantenimiento
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="op-stats-grid">
          <div class="op-stat-card">
            <div class="op-stat-icon op-stat-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="6" x2="12" y2="12"></line>
                <line x1="12" y1="12" x2="16" y2="14"></line>
              </svg>
            </div>
            <div class="op-stat-info">
              <span class="op-stat-label">Total Equipos</span>
              <span class="op-stat-value">156</span>
            </div>
          </div>

          <div class="op-stat-card">
            <div class="op-stat-icon op-stat-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1v12"></path>
                <circle cx="12" cy="16" r="1"></circle>
              </svg>
            </div>
            <div class="op-stat-info">
              <span class="op-stat-label">Mantenimientos Próximos</span>
              <span class="op-stat-value">12</span>
            </div>
          </div>

          <div class="op-stat-card">
            <div class="op-stat-icon op-stat-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="op-stat-info">
              <span class="op-stat-label">Garantías Vigentes</span>
              <span class="op-stat-value">140</span>
            </div>
          </div>

          <div class="op-stat-card">
            <div class="op-stat-icon op-stat-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="op-stat-info">
              <span class="op-stat-label">Garantías por Vencer</span>
              <span class="op-stat-value">8</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="op-filters-bar">
        <div class="op-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" placeholder="Buscar por nombre o ID..." class="op-search-input">
        </div>

        <div class="op-filter-group">
          <select class="op-filter-select">
            <option value="">Todos los estados</option>
            <option value="al-dia">Al día</option>
            <option value="proximo">Próximo</option>
            <option value="vencido">Vencido</option>
          </select>

          <select class="op-filter-select">
            <option value="">Todas las garantías</option>
            <option value="vigente">Vigente</option>
            <option value="vencer">Por Vencer</option>
            <option value="expirada">Expirada</option>
          </select>
        </div>
      </div>
    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>NOMBRE DEL EQUIPO</th>
            <th>ÚLTIMA ENTREGA</th>
            <th>PROX. MANTENIMIENTO</th>
            <th>GARANTÍA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path></svg>
                </div>
                <div>
                  <div class="equipment-name">Nebulizador Industrial X-200</div>
                  <div class="equipment-id">ID: QSCI-INV-001</div>
                </div>
              </div>
            </td>
            <td>12 Oct 2023</td>
            <td>15 May 2024</td>
            <td><span class="warranty-badge active">Vigente (24m)</span></td>
            <td><span class="status-indicator success">Al día</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <div class="equipment-name">Pulverizador de Motor B-50</div>
                  <div class="equipment-id">ID: QSCI-INV-015</div>
                </div>
              </div>
            </td>
            <td>05 Ene 2024</td>
            <td>10 Mar 2024</td>
            <td><span class="warranty-badge active">Vigente (12m)</span></td>
            <td><span class="status-indicator warning">Próximo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="10" height="10" rx="1" ry="1"></rect></svg>
                </div>
                <div>
                  <div class="equipment-name">Termonebulizadora Portátil</div>
                  <div class="equipment-id">ID: QSCI-INV-042</div>
                </div>
              </div>
            </td>
            <td>20 Nov 2023</td>
            <td>15 Abr 2024</td>
            <td><span class="warranty-badge expired">Expirada</span></td>
            <td><span class="status-indicator success">Al día</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"></path></svg>
                </div>
                <div>
                  <div class="equipment-name">Aspersora Manual 15L</div>
                  <div class="equipment-id">ID: QSCI-INV-088</div>
                </div>
              </div>
            </td>
            <td>15 Feb 2024</td>
            <td>15 Mar 2024</td>
            <td><span class="warranty-badge active">Vigente (6m)</span></td>
            <td><span class="status-indicator warning">Próximo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 42 equipos</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Equipos Totales</div>
          <div class="stat-box-value">156 <span class="stat-box-note">+4 este mes</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Mantenimientos Próximos</div>
          <div class="stat-box-value">12 <span class="stat-box-note">Siguientes 7 días</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Garantías por Vencer</div>
          <div class="stat-box-value">8 <span class="stat-box-note">Acción requerida</span></div>
        </div>
      </div>
    </div>
  `;
}
