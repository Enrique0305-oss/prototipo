// Reportes e Inspección View
export function renderReportes() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Reportes e Inspección</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Reporte
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active">Todos los Reportes</button>
      <button class="tab-btn">Inspecciones</button>
      <button class="tab-btn">Análisis</button>
    </div>

    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Reportes del Mes</div>
          <div class="stat-box-value">42</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Inspecciones</div>
          <div class="stat-box-value">18</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Con Evidencias</div>
          <div class="stat-box-value">35 <span class="stat-box-note">fotos</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar reporte..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los tipos</option>
        <option>Fumigación</option>
        <option>Desratización</option>
        <option>Inspección</option>
        <option>Mantenimiento</option>
      </select>
      <input type="date" class="filter-select" value="2025-01-15">
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="reports-grid" style="margin-top: 24px;">
      <div class="report-card">
        <div class="report-header">
          <div>
            <h4>Fumigación Industrial</h4>
            <span class="report-id">RPT-2025-089</span>
          </div>
          <span class="badge">Fumigación</span>
        </div>
        <div class="report-details">
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            <span>Logística Transandina</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Juan Ramírez</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>15/01/2025 - 08:30 AM</span>
          </div>
        </div>
        <div class="report-summary">
          <p><strong>Productos:</strong> Cipermetrina 25% EC</p>
          <p><strong>Área tratada:</strong> 450 m²</p>
          <p><strong>Plagas detectadas:</strong> Cucarachas, Hormigas</p>
        </div>
        <div class="report-photos">
          <div class="photo-thumb">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div class="photo-thumb">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div class="photo-count">+5</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary" style="flex: 1;">Ver Detalles</button>
          <button class="btn-primary" style="flex: 1;">Descargar PDF</button>
        </div>
      </div>

      <div class="report-card">
        <div class="report-header">
          <div>
            <h4>Inspección Preventiva</h4>
            <span class="report-id">RPT-2025-090</span>
          </div>
          <span class="badge green">Inspección</span>
        </div>
        <div class="report-details">
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            <span>Farmacéutica Central</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>María Soto</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>14/01/2025 - 10:00 AM</span>
          </div>
        </div>
        <div class="report-summary">
          <p><strong>Tipo:</strong> Inspección sanitaria</p>
          <p><strong>Área inspeccionada:</strong> 320 m²</p>
          <p><strong>Estado:</strong> Conforme</p>
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
        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary" style="flex: 1;">Ver Detalles</button>
          <button class="btn-primary" style="flex: 1;">Descargar PDF</button>
        </div>
      </div>

      <div class="report-card">
        <div class="report-header">
          <div>
            <h4>Desratización Comercial</h4>
            <span class="report-id">RPT-2025-091</span>
          </div>
          <span class="badge blue">Desratización</span>
        </div>
        <div class="report-details">
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            <span>Almacenes del Norte</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Pedro López</span>
          </div>
          <div class="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>13/01/2025 - 02:00 PM</span>
          </div>
        </div>
        <div class="report-summary">
          <p><strong>Productos:</strong> Rodenticida Pellets</p>
          <p><strong>Estaciones:</strong> 12 puntos</p>
          <p><strong>Roedores eliminados:</strong> 5</p>
        </div>
        <div class="report-photos">
          <div class="photo-thumb">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div class="photo-thumb">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div class="photo-count">+4</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary" style="flex: 1;">Ver Detalles</button>
          <button class="btn-primary" style="flex: 1;">Descargar PDF</button>
        </div>
      </div>
    </div>

    <div class="pagination" style="margin-top: 24px;">
      <span class="pagination-info">Mostrando 1-6 de 42 reportes</span>
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
