// Comercial y Marketing View

// Tab: Prospectos
export function renderProspectosTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Prospectos Totales</div>
          <div class="stat-box-value">38</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Cotizaciones</div>
          <div class="stat-box-value">12 <span class="stat-box-note">pendientes</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tasa de Conversión</div>
          <div class="stat-box-value">68%</div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar prospecto..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los estados</option>
        <option>Nuevo</option>
        <option>Contactado</option>
        <option>Acepta</option>
        <option>No Acepta</option>
      </select>
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>PROSPECTO</th>
            <th>CONTACTO</th>
            <th>SECTOR</th>
            <th>FECHA</th>
            <th>ORIGEN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Grupo Textil Lima</div>
                  <div class="equipment-id">Industria Textil</div>
                </div>
              </div>
            </td>
            <td>
              <div>Luis Martínez</div>
              <div style="font-size: 12px; color: #64748b;">(01) 456-7890</div>
            </td>
            <td>Industrial</td>
            <td>15/01/2025</td>
            <td><span class="badge">Referido</span></td>
            <td><span class="status-indicator success">Acepta</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Cotizar
              </button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Restaurante La Marina</div>
                  <div class="equipment-id">Alimentos y Bebidas</div>
                </div>
              </div>
            </td>
            <td>
              <div>Ana Flores</div>
              <div style="font-size: 12px; color: #64748b;">(01) 234-5678</div>
            </td>
            <td>Alimenticio</td>
            <td>14/01/2025</td>
            <td><span class="badge">Web</span></td>
            <td><span class="status-indicator">Contactado</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Seguimiento</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Condominios Arequipa</div>
                  <div class="equipment-id">Inmobiliaria</div>
                </div>
              </div>
            </td>
            <td>
              <div>Roberto Silva</div>
              <div style="font-size: 12px; color: #64748b;">(01) 789-0123</div>
            </td>
            <td>Residencial</td>
            <td>13/01/2025</td>
            <td><span class="badge">Llamada</span></td>
            <td><span class="status-indicator danger">No Acepta</span></td>
            <td>
              <button class="action-btn">⋮</button>
            </td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
            <td>Salud</td>
            <td>12/01/2025</td>
            <td><span class="badge">Referido</span></td>
            <td><span class="status-indicator success">Acepta</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Cotizar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 38 prospectos</span>
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

// Tab: Cotizaciones
export function renderCotizacionesTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Cotizaciones</div>
          <div class="stat-box-value">12 <span class="stat-box-note">pendientes</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Valor Total</div>
          <div class="stat-box-value">$45,600</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Promedio Respuesta</div>
          <div class="stat-box-value">2.5 <span class="stat-box-note">días</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar cotización..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los estados</option>
        <option>Pendiente</option>
        <option>Enviada</option>
        <option>Aceptada</option>
        <option>Rechazada</option>
      </select>
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>N° COTIZACIÓN</th>
            <th>CLIENTE</th>
            <th>SERVICIO</th>
            <th>MONTO</th>
            <th>FECHA EMISIÓN</th>
            <th>VIGENCIA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>COT-2025-045</strong></td>
            <td>
              <div>
                <div class="equipment-name">Grupo Textil Lima</div>
                <div class="equipment-id">Luis Martínez</div>
              </div>
            </td>
            <td>Fumigación Industrial</td>
            <td><strong>$2,800</strong></td>
            <td>15/01/2025</td>
            <td>30/01/2025</td>
            <td><span class="badge blue">Enviada</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver PDF</button>
            </td>
          </tr>
          <tr>
            <td><strong>COT-2025-044</strong></td>
            <td>
              <div>
                <div class="equipment-name">Clínica San Pablo</div>
                <div class="equipment-id">Carmen Ríos</div>
              </div>
            </td>
            <td>Sanitización + Desinsectación</td>
            <td><strong>$4,200</strong></td>
            <td>14/01/2025</td>
            <td>29/01/2025</td>
            <td><span class="badge green">Aceptada</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Convertir</button>
            </td>
          </tr>
          <tr>
            <td><strong>COT-2025-043</strong></td>
            <td>
              <div>
                <div class="equipment-name">Restaurante La Marina</div>
                <div class="equipment-id">Ana Flores</div>
              </div>
            </td>
            <td>Control de Plagas Mensual</td>
            <td><strong>$1,800</strong></td>
            <td>13/01/2025</td>
            <td>28/01/2025</td>
            <td><span class="badge">Pendiente</span></td>
            <td>
              <button class="action-btn">⋮</button>
            </td>
          </tr>
          <tr>
            <td><strong>COT-2025-042</strong></td>
            <td>
              <div>
                <div class="equipment-name">Hotel Costa Verde</div>
                <div class="equipment-id">Miguel Torres</div>
              </div>
            </td>
            <td>Desratización + Fumigación</td>
            <td><strong>$3,600</strong></td>
            <td>12/01/2025</td>
            <td>27/01/2025</td>
            <td><span class="badge blue">Enviada</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Ver PDF</button>
            </td>
          </tr>
          <tr>
            <td><strong>COT-2025-041</strong></td>
            <td>
              <div>
                <div class="equipment-name">Almacenes del Norte</div>
                <div class="equipment-id">Ana Torres</div>
              </div>
            </td>
            <td>Fumigación Comercial</td>
            <td><strong>$2,200</strong></td>
            <td>11/01/2025</td>
            <td>26/01/2025</td>
            <td><span class="badge orange">Rechazada</span></td>
            <td>
              <button class="action-btn">⋮</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-5 de 12 cotizaciones</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}

// Tab: Conversiones
export function renderConversionesTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tasa de Conversión</div>
          <div class="stat-box-value">68%</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Clientes Convertidos</div>
          <div class="stat-box-value">26 <span class="stat-box-note">este mes</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tiempo Promedio</div>
          <div class="stat-box-value">5.2 <span class="stat-box-note">días</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar conversión..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los períodos</option>
        <option>Última semana</option>
        <option>Último mes</option>
        <option>Último trimestre</option>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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

export function renderComercial() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión Comercial</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Prospecto
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="prospectos">Prospectos</button>
      <button class="tab-btn" data-tab="cotizaciones">Cotizaciones</button>
      <button class="tab-btn" data-tab="conversiones">Conversiones</button>
    </div>

    <div id="comercial-tab-content">
      ${renderProspectosTab()}
    </div>
  `;
}
