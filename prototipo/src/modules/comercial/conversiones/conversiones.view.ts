// Comercial - Conversiones

export function renderComercialConversiones() {
  return `
    <div class="page-header">
      <h1>Conversiones</h1>
      <div class="header-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar
        </button>
      </div>
    </div>

    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Conversiones Totales</div>
          <div class="stat-box-value">26</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Valor Total Contratos</div>
          <div class="stat-box-value">$87,400</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tasa de Conversión</div>
          <div class="stat-box-value">68%</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tiempo Promedio</div>
          <div class="stat-box-value">5.4 <span class="stat-box-note">días</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Buscar conversión..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los sectores</option>
        <option>Industrial</option>
        <option>Salud</option>
        <option>Alimenticio</option>
        <option>Educación</option>
        <option>Retail</option>
      </select>
      <input type="date" class="filter-select" value="2025-01-31">
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>CONTACTO</th>
            <th>FECHA PROSPECTO</th>
            <th>FECHA CONVERSIÓN</th>
            <th>TIEMPO</th>
            <th>VALOR CONTRATO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div class="equipment-name">Clínica San Pablo</div>
                  <div class="equipment-id">Salud</div>
                </div>
              </div>
            </td>
            <td>
              <div>Carmen Ríos</div>
              <div style="font-size: 12px; color: #64748b;">(01) 567-8901</div>
            </td>
            <td>12/01/2025</td>
            <td>15/01/2025</td>
            <td><span class="badge green">3 días</span></td>
            <td><strong>$4,200</strong></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Contrato</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div class="equipment-name">Hotel Miramar</div>
                  <div class="equipment-id">Turismo</div>
                </div>
              </div>
            </td>
            <td>
              <div>Jorge Pérez</div>
              <div style="font-size: 12px; color: #64748b;">(01) 345-6789</div>
            </td>
            <td>08/01/2025</td>
            <td>14/01/2025</td>
            <td><span class="badge orange">6 días</span></td>
            <td><strong>$3,800</strong></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Contrato</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div class="equipment-name">Supermercado Central</div>
                  <div class="equipment-id">Retail</div>
                </div>
              </div>
            </td>
            <td>
              <div>María Sánchez</div>
              <div style="font-size: 12px; color: #64748b;">(01) 678-9012</div>
            </td>
            <td>05/01/2025</td>
            <td>12/01/2025</td>
            <td><span class="badge orange">7 días</span></td>
            <td><strong>$5,200</strong></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Contrato</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div class="equipment-name">Fábrica Textil Norte</div>
                  <div class="equipment-id">Industrial</div>
                </div>
              </div>
            </td>
            <td>
              <div>Pedro Ramírez</div>
              <div style="font-size: 12px; color: #64748b;">(01) 234-5678</div>
            </td>
            <td>03/01/2025</td>
            <td>09/01/2025</td>
            <td><span class="badge orange">6 días</span></td>
            <td><strong>$6,500</strong></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Contrato</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div class="equipment-name">Colegio San Martín</div>
                  <div class="equipment-id">Educación</div>
                </div>
              </div>
            </td>
            <td>
              <div>Rosa Mendoza</div>
              <div style="font-size: 12px; color: #64748b;">(01) 890-1234</div>
            </td>
            <td>01/01/2025</td>
            <td>06/01/2025</td>
            <td><span class="badge green">5 días</span></td>
            <td><strong>$2,900</strong></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver Contrato</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-5 de 26 conversiones</span>
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
