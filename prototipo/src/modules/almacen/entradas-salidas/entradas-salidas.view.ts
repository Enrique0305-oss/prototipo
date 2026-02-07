// Almacén - Entradas y Salidas View

// Tab: Todos los Movimientos
export function renderMovimientosTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Entradas del Mes</div>
          <div class="stat-box-value">45</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Salidas del Mes</div>
          <div class="stat-box-value">38</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Movimientos</div>
          <div class="stat-box-value">83</div>
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
            <th>FECHA</th>
            <th>TIPO</th>
            <th>PRODUCTO</th>
            <th>CANTIDAD</th>
            <th>RESPONSABLE</th>
            <th>DESTINO/ORIGEN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>15/01/2025 09:30</td>
            <td><span class="status-indicator success">Entrada</span></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Cipermetrina 25% EC</div>
                  <div class="equipment-id">SKU: QSC-QUI-001</div>
                </div>
              </div>
            </td>
            <td>20 Litros</td>
            <td>Carlos López</td>
            <td>QuímicaPeru S.A.C.</td>
            <td><span class="badge green">Completado</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>15/01/2025 08:15</td>
            <td><span class="status-indicator warning">Salida</span></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Nebulizador X-200</div>
                  <div class="equipment-id">SKU: QSC-EQP-005</div>
                </div>
              </div>
            </td>
            <td>1 Unidad</td>
            <td>Juan Ramírez</td>
            <td>OS-2025-089</td>
            <td><span class="badge green">Completado</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>14/01/2025 14:20</td>
            <td><span class="status-indicator info">Préstamo EPP</span></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Guantes Nitrilo</div>
                  <div class="equipment-id">SKU: QSC-EPP-042</div>
                </div>
              </div>
            </td>
            <td>2 Pares</td>
            <td>María Soto</td>
            <td>Técnico: María Soto</td>
            <td><span class="badge blue">En Préstamo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>14/01/2025 11:00</td>
            <td><span class="status-indicator success">Entrada</span></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Mascarilla N95</div>
                  <div class="equipment-id">SKU: QSC-EPP-088</div>
                </div>
              </div>
            </td>
            <td>100 Unidades</td>
            <td>Admin</td>
            <td>Protección Total SAC</td>
            <td><span class="badge green">Completado</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>13/01/2025 16:45</td>
            <td><span class="status-indicator info">Préstamo EPP</span></td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Casco de Seguridad</div>
                  <div class="equipment-id">SKU: QSC-EPP-015</div>
                </div>
              </div>
            </td>
            <td>1 Unidad</td>
            <td>Pedro López</td>
            <td>Técnico: Pedro López</td>
            <td><span class="badge blue">En Préstamo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 83 movimientos</span>
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

// Tab: Préstamo de EPP
export function renderPrestamoEPPTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">EPP Prestados</div>
          <div class="stat-box-value">24 <span class="stat-box-note">activos</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Devoluciones del Mes</div>
          <div class="stat-box-value">18</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Con Retraso</div>
          <div class="stat-box-value">3</div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar préstamo..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los estados</option>
        <option>En Préstamo</option>
        <option>Devuelto</option>
        <option>Con Retraso</option>
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
            <th>FECHA PRÉSTAMO</th>
            <th>EPP</th>
            <th>CANTIDAD</th>
            <th>TÉCNICO</th>
            <th>FECHA RETORNO</th>
            <th>DÍAS</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>14/01/2025</td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Guantes Nitrilo</div>
                  <div class="equipment-id">SKU: QSC-EPP-042</div>
                </div>
              </div>
            </td>
            <td>2 Pares</td>
            <td>María Soto</td>
            <td>21/01/2025</td>
            <td>1 día</td>
            <td><span class="badge blue">En Préstamo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>13/01/2025</td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Casco de Seguridad</div>
                  <div class="equipment-id">SKU: QSC-EPP-015</div>
                </div>
              </div>
            </td>
            <td>1 Unidad</td>
            <td>Pedro López</td>
            <td>20/01/2025</td>
            <td>2 días</td>
            <td><span class="badge blue">En Préstamo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>12/01/2025</td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Botas Dieléctricas</div>
                  <div class="equipment-id">SKU: QSC-EPP-028</div>
                </div>
              </div>
            </td>
            <td>1 Par</td>
            <td>Juan Ramírez</td>
            <td>19/01/2025</td>
            <td>3 días</td>
            <td><span class="badge blue">En Préstamo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>10/01/2025</td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Respirador Media Cara</div>
                  <div class="equipment-id">SKU: QSC-EPP-051</div>
                </div>
              </div>
            </td>
            <td>1 Unidad</td>
            <td>Carlos Mendoza</td>
            <td>17/01/2025</td>
            <td>5 días</td>
            <td><span class="badge blue">En Préstamo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>08/01/2025</td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Arnés de Seguridad</div>
                  <div class="equipment-id">SKU: QSC-EPP-063</div>
                </div>
              </div>
            </td>
            <td>1 Unidad</td>
            <td>Luis Torres</td>
            <td>15/01/2025</td>
            <td>7 días</td>
            <td><span class="badge green">Devuelto</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>05/01/2025</td>
            <td>
              <div class="equipment-info">
                <div>
                  <div class="equipment-name">Lentes de Seguridad</div>
                  <div class="equipment-id">SKU: QSC-EPP-009</div>
                </div>
              </div>
            </td>
            <td>3 Unidades</td>
            <td>Ana García</td>
            <td>12/01/2025</td>
            <td><span style="color: #f97316;">10 días</span></td>
            <td><span class="badge orange">Con Retraso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 24 préstamos activos</span>
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

// Tab: Transferencias
export function renderTransferenciasTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">En Tránsito</div>
          <div class="stat-box-value">5</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Completadas del Mes</div>
          <div class="stat-box-value">28</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ubicaciones</div>
          <div class="stat-box-value">4 <span class="stat-box-note">activas</span></div>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar transferencia..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los estados</option>
        <option>En Tránsito</option>
        <option>Completada</option>
        <option>Cancelada</option>
      </select>
      <select class="filter-select">
        <option>Todas las ubicaciones</option>
        <option>Almacén Central</option>
        <option>Almacén Norte</option>
        <option>Almacén Sur</option>
        <option>Vehículos</option>
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
            <th>FECHA</th>
            <th>N° TRANSFERENCIA</th>
            <th>ORIGEN</th>
            <th>DESTINO</th>
            <th>PRODUCTOS</th>
            <th>RESPONSABLE</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>15/01/2025 10:30</td>
            <td><strong>TRF-2025-045</strong></td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Central
              </div>
            </td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon></svg>
                Vehículo U-05
              </div>
            </td>
            <td>3 productos</td>
            <td>Carlos López</td>
            <td><span class="badge blue">En Tránsito</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>15/01/2025 08:00</td>
            <td><strong>TRF-2025-044</strong></td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Norte
              </div>
            </td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Central
              </div>
            </td>
            <td>5 productos</td>
            <td>Juan Ramírez</td>
            <td><span class="badge green">Completada</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>14/01/2025 15:20</td>
            <td><strong>TRF-2025-043</strong></td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Central
              </div>
            </td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Sur
              </div>
            </td>
            <td>8 productos</td>
            <td>María Soto</td>
            <td><span class="badge blue">En Tránsito</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>14/01/2025 11:45</td>
            <td><strong>TRF-2025-042</strong></td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon></svg>
                Vehículo U-12
              </div>
            </td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Central
              </div>
            </td>
            <td>2 productos</td>
            <td>Pedro López</td>
            <td><span class="badge green">Completada</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>13/01/2025 16:30</td>
            <td><strong>TRF-2025-041</strong></td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Sur
              </div>
            </td>
            <td>
              <div class="location-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Almacén Norte
              </div>
            </td>
            <td>4 productos</td>
            <td>Luis Torres</td>
            <td><span class="badge green">Completada</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 33 transferencias</span>
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

export function renderAlmacenEntradasSalidas() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Entradas y Salidas de Almacén</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Registrar Movimiento
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="movimientos">Todos los Movimientos</button>
      <button class="tab-btn" data-tab="prestamo">Préstamo de EPP</button>
      <button class="tab-btn" data-tab="transferencias">Transferencias</button>
    </div>

    <div id="entradas-tab-content">
      ${renderMovimientosTab()}
    </div>
  `;
}
