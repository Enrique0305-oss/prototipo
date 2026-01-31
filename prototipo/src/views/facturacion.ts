// Facturación y Cobranza View

// Tab: Órdenes Proyectadas
export function renderOrdenesProyectadasTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Facturas Pendientes</div>
          <div class="stat-box-value">18 <span class="stat-box-note">$32,450</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Cobradas</div>
          <div class="stat-box-value">42 <span class="stat-box-note">$84,250</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Por Vencer</div>
          <div class="stat-box-value">8 <span class="stat-box-note">$12,800</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar factura..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los estados</option>
        <option>Pendiente</option>
        <option>Pagado</option>
        <option>Vencido</option>
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
            <th>FACTURA</th>
            <th>CLIENTE</th>
            <th>TIPO</th>
            <th>FECHA EMISIÓN</th>
            <th>VENCIMIENTO</th>
            <th>MONTO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div>
                  <div class="equipment-name">F001-00245</div>
                  <div class="equipment-id">Orden: OS-2025-089</div>
                </div>
              </div>
            </td>
            <td>Logística Transandina</td>
            <td><span class="badge">Proyectado</span></td>
            <td>10/01/2025</td>
            <td>25/01/2025</td>
            <td>$2,800.00</td>
            <td><span class="status-indicator warning">Pendiente</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div>
                  <div class="equipment-name">F001-00244</div>
                  <div class="equipment-id">Contrato: CF-2025-012</div>
                </div>
              </div>
            </td>
            <td>Farmacéutica Central</td>
            <td><span class="badge green">Fijo</span></td>
            <td>05/01/2025</td>
            <td>20/01/2025</td>
            <td>$3,200.00</td>
            <td><span class="status-indicator success">Pagado</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div>
                  <div class="equipment-name">F001-00243</div>
                  <div class="equipment-id">Orden: OS-2025-085</div>
                </div>
              </div>
            </td>
            <td>Almacenes del Norte</td>
            <td><span class="badge">Proyectado</span></td>
            <td>08/01/2025</td>
            <td>23/01/2025</td>
            <td>$1,600.00</td>
            <td><span class="status-indicator warning">Pendiente</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div>
                  <div class="equipment-name">F001-00242</div>
                  <div class="equipment-id">Contrato: CF-2024-098</div>
                </div>
              </div>
            </td>
            <td>Hotel Plaza</td>
            <td><span class="badge green">Fijo</span></td>
            <td>03/01/2025</td>
            <td>18/01/2025</td>
            <td>$2,250.00</td>
            <td><span class="status-indicator success">Pagado</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 68 facturas</span>
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

// Tab: Contratos Fijos
export function renderContratosFijosTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Contratos Activos</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ingresos Recurrentes</div>
          <div class="stat-box-value">$52,800 <span class="stat-box-note">/mes</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Por Renovar</div>
          <div class="stat-box-value">5 <span class="stat-box-note">este mes</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar contrato..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los estados</option>
        <option>Activo</option>
        <option>Por Renovar</option>
        <option>Vencido</option>
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
            <th>N° CONTRATO</th>
            <th>CLIENTE</th>
            <th>SERVICIO</th>
            <th>FRECUENCIA</th>
            <th>MONTO MENSUAL</th>
            <th>INICIO</th>
            <th>VENCIMIENTO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>CF-2025-012</strong></td>
            <td>
              <div>
                <div class="equipment-name">Farmacéutica Central</div>
                <div class="equipment-id">Roberto Díaz</div>
              </div>
            </td>
            <td>Fumigación Semanal</td>
            <td><span class="badge blue">Semanal</span></td>
            <td><strong>$3,200</strong></td>
            <td>01/01/2025</td>
            <td>31/12/2025</td>
            <td><span class="badge green">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>CF-2024-098</strong></td>
            <td>
              <div>
                <div class="equipment-name">Hotel Plaza</div>
                <div class="equipment-id">Miguel Torres</div>
              </div>
            </td>
            <td>Control de Plagas Mensual</td>
            <td><span class="badge">Mensual</span></td>
            <td><strong>$2,250</strong></td>
            <td>15/03/2024</td>
            <td>15/03/2025</td>
            <td><span class="badge orange">Por Renovar</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>CF-2024-087</strong></td>
            <td>
              <div>
                <div class="equipment-name">Logística Transandina</div>
                <div class="equipment-id">Carlos Mendoza</div>
              </div>
            </td>
            <td>Fumigación Industrial</td>
            <td><span class="badge">Mensual</span></td>
            <td><strong>$2,800</strong></td>
            <td>10/02/2024</td>
            <td>10/02/2026</td>
            <td><span class="badge green">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>CF-2024-076</strong></td>
            <td>
              <div>
                <div class="equipment-name">Almacenes del Norte</div>
                <div class="equipment-id">Ana Torres</div>
              </div>
            </td>
            <td>Desratización Quincenal</td>
            <td><span class="badge blue">Quincenal</span></td>
            <td><strong>$1,600</strong></td>
            <td>20/05/2024</td>
            <td>20/05/2025</td>
            <td><span class="badge green">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td><strong>CF-2024-065</strong></td>
            <td>
              <div>
                <div class="equipment-name">Restaurante La Marina</div>
                <div class="equipment-id">Ana Flores</div>
              </div>
            </td>
            <td>Sanitización Semanal</td>
            <td><span class="badge blue">Semanal</span></td>
            <td><strong>$1,800</strong></td>
            <td>08/04/2024</td>
            <td>08/04/2025</td>
            <td><span class="badge green">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-5 de 24 contratos</span>
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

// Tab: Estado de Cobranza
export function renderEstadoCobranzaTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Por Cobrar</div>
          <div class="stat-box-value">$45,250</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Vencidas</div>
          <div class="stat-box-value">$8,450 <span class="stat-box-note">5 facturas</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Cobradas este Mes</div>
          <div class="stat-box-value">$84,250</div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar cliente..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los estados</option>
        <option>Al Día</option>
        <option>Por Vencer</option>
        <option>Vencida</option>
        <option>En Mora</option>
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
            <th>N° FACTURA</th>
            <th>FECHA EMISIÓN</th>
            <th>VENCIMIENTO</th>
            <th>MONTO</th>
            <th>DÍAS VENCIDO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Clínica San Pablo</div>
                  <div class="equipment-id">Carmen Ríos</div>
                </div>
              </div>
            </td>
            <td><strong>F001-00238</strong></td>
            <td>20/12/2024</td>
            <td>05/01/2025</td>
            <td><strong>$4,200</strong></td>
            <td><span class="badge orange">26 días</span></td>
            <td><span class="status-indicator danger">Vencida</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contactar</button>
            </td>
          </tr>
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
            <td><strong>F001-00245</strong></td>
            <td>10/01/2025</td>
            <td>25/01/2025</td>
            <td><strong>$2,800</strong></td>
            <td><span class="badge orange">6 días</span></td>
            <td><span class="status-indicator danger">Vencida</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contactar</button>
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
            <td><strong>F001-00246</strong></td>
            <td>12/01/2025</td>
            <td>27/01/2025</td>
            <td><strong>$3,800</strong></td>
            <td><span class="badge orange">4 días</span></td>
            <td><span class="status-indicator danger">Vencida</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contactar</button>
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
            <td><strong>F001-00243</strong></td>
            <td>08/01/2025</td>
            <td>23/01/2025</td>
            <td><strong>$1,600</strong></td>
            <td><span class="badge orange">8 días</span></td>
            <td><span class="status-indicator danger">Vencida</span></td>
            <td>
              <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contactar</button>
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
            <td><strong>F001-00247</strong></td>
            <td>15/01/2025</td>
            <td>05/02/2025</td>
            <td><strong>$5,200</strong></td>
            <td><span class="badge blue">5 días</span></td>
            <td><span class="status-indicator warning">Por Vencer</span></td>
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
                  <div class="equipment-name">Farmacéutica Central</div>
                  <div class="equipment-id">Roberto Díaz</div>
                </div>
              </div>
            </td>
            <td><strong>F001-00244</strong></td>
            <td>05/01/2025</td>
            <td>20/01/2025</td>
            <td><strong>$3,200</strong></td>
            <td>-</td>
            <td><span class="status-indicator success">Pagado</span></td>
            <td>
              <button class="action-btn">⋮</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-6 de 26 facturas</span>
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

export function renderFacturacion() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Facturación y Cobranza</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Factura
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="ordenes">Órdenes Proyectadas</button>
      <button class="tab-btn" data-tab="contratos">Contratos Fijos</button>
      <button class="tab-btn" data-tab="cobranza">Estado de Cobranza</button>
    </div>

    <div id="facturacion-tab-content">
      ${renderOrdenesProyectadasTab()}
    </div>
  `;
}
