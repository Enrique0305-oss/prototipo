// Almacén - Mantenimiento de Equipos View
export function renderAlmacenMantenimiento() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Mantenimiento de Equipos <span class="breadcrumb-sub">Almacén Central</span></div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agendar Mantenimiento
        </button>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar equipo..." class="search-input">
      </div>
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
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
