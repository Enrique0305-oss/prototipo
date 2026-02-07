// Vista de Productos (Tab 1)
export function renderProductosTab() {
  return `

    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Stock Disponible</div>
          <div class="stat-box-value">1,284 <span class="stat-box-note">unidades</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Inventario Total</div>
          <div class="stat-box-value">$42,580 <span class="stat-box-note">valorizado</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Stock Bajo</div>
          <div class="stat-box-value">15 <span class="stat-box-note">productos</span></div>
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
            <th>PRODUCTO</th>
            <th>CATEGORÍA</th>
            <th>STOCK</th>
            <th>UNIDAD</th>
            <th>PRECIO UNIT.</th>
            <th>VALOR TOTAL</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Cipermetrina 25% EC</div>
                  <div class="equipment-id">SKU: QSC-QUI-001</div>
                </div>
              </div>
            </td>
            <td>Químicos</td>
            <td>45</td>
            <td>Litros</td>
            <td>$28.50</td>
            <td>$1,282.50</td>
            <td><span class="status-indicator success">Disponible</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Deltametrina Gel 2%</div>
                  <div class="equipment-id">SKU: QSC-QUI-015</div>
                </div>
              </div>
            </td>
            <td>Químicos</td>
            <td>8</td>
            <td>Unidades</td>
            <td>$42.00</td>
            <td>$336.00</td>
            <td><span class="status-indicator warning">Stock Bajo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Guantes Nitrilo (Caja x100)</div>
                  <div class="equipment-id">SKU: QSC-EPP-042</div>
                </div>
              </div>
            </td>
            <td>EPP</td>
            <td>25</td>
            <td>Cajas</td>
            <td>$15.00</td>
            <td>$375.00</td>
            <td><span class="status-indicator success">Disponible</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Mascarilla Respirador N95</div>
                  <div class="equipment-id">SKU: QSC-EPP-088</div>
                </div>
              </div>
            </td>
            <td>EPP</td>
            <td>120</td>
            <td>Unidades</td>
            <td>$3.50</td>
            <td>$420.00</td>
            <td><span class="status-indicator success">Disponible</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 86 productos</span>
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

// Vista de Kardex (Tab 2)
export function renderKardexTab() {
  return `
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

    <div class="kardex-header">
      <h3>Kardex: Cipermetrina 25% EC</h3>
      <div class="kardex-summary">
        <div class="kardex-stat">
          <span class="kardex-label">Stock Inicial:</span>
          <span class="kardex-value">50 Litros</span>
        </div>
        <div class="kardex-stat">
          <span class="kardex-label">Total Entradas:</span>
          <span class="kardex-value positive">+20 Litros</span>
        </div>
        <div class="kardex-stat">
          <span class="kardex-label">Total Salidas:</span>
          <span class="kardex-value negative">-25 Litros</span>
        </div>
        <div class="kardex-stat">
          <span class="kardex-label">Stock Actual:</span>
          <span class="kardex-value current">45 Litros</span>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="op-table kardex-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>DETALLE</th>
            <th>TIPO</th>
            <th>ENTRADAS</th>
            <th>SALIDAS</th>
            <th>SALDO</th>
            <th>RESPONSABLE</th>
            <th>DOCUMENTO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>01/01/2025</td>
            <td>Stock inicial del período</td>
            <td><span class="badge">Inicial</span></td>
            <td>-</td>
            <td>-</td>
            <td class="saldo">50</td>
            <td>Sistema</td>
            <td>-</td>
          </tr>
          <tr>
            <td>15/01/2025</td>
            <td>Compra QuímicaPeru S.A.C.</td>
            <td><span class="badge green">Entrada</span></td>
            <td class="entrada">+20</td>
            <td>-</td>
            <td class="saldo">70</td>
            <td>Carlos López</td>
            <td>FC-001-245</td>
          </tr>
          <tr>
            <td>18/01/2025</td>
            <td>OS-2025-089 - Logística Transandina</td>
            <td><span class="badge orange">Salida</span></td>
            <td>-</td>
            <td class="salida">-8</td>
            <td class="saldo">62</td>
            <td>Juan Ramírez</td>
            <td>OS-2025-089</td>
          </tr>
          <tr>
            <td>22/01/2025</td>
            <td>OS-2025-095 - Farmacéutica Central</td>
            <td><span class="badge orange">Salida</span></td>
            <td>-</td>
            <td class="salida">-12</td>
            <td class="saldo">50</td>
            <td>María Soto</td>
            <td>OS-2025-095</td>
          </tr>
          <tr>
            <td>28/01/2025</td>
            <td>OS-2025-112 - Hotel Plaza</td>
            <td><span class="badge orange">Salida</span></td>
            <td>-</td>
            <td class="salida">-5</td>
            <td class="saldo">45</td>
            <td>Pedro López</td>
            <td>OS-2025-112</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 28 movimientos</span>
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

// Vista de Categorías (Tab 3)
export function renderCategoriasTab() {
  return `
    <div class="page-actions" style="margin-bottom: 24px;">
      <button class="btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Agregar Categoría
      </button>
    </div>

    <div class="categories-grid">
      <div class="category-card">
        <div class="category-header">
          <div class="category-icon quimicos">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path></svg>
          </div>
          <div class="category-info">
            <h3>Químicos</h3>
            <p>Productos químicos para fumigación</p>
          </div>
        </div>
        <div class="category-stats">
          <div class="category-stat">
            <div class="stat-number">28</div>
            <div class="stat-label">Productos</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">$28,450</div>
            <div class="stat-label">Valor Total</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">5</div>
            <div class="stat-label">Stock Bajo</div>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn-secondary fullwidth">Ver Productos</button>
        </div>
      </div>

      <div class="category-card">
        <div class="category-header">
          <div class="category-icon epp">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 0 1 9 9v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 9-9z"></path><path d="M8 12h.01M16 12h.01M15 16H9"></path></svg>
          </div>
          <div class="category-info">
            <h3>EPP</h3>
            <p>Equipos de protección personal</p>
          </div>
        </div>
        <div class="category-stats">
          <div class="category-stat">
            <div class="stat-number">35</div>
            <div class="stat-label">Productos</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">$8,920</div>
            <div class="stat-label">Valor Total</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">8</div>
            <div class="stat-label">Stock Bajo</div>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn-secondary fullwidth">Ver Productos</button>
        </div>
      </div>

      <div class="category-card">
        <div class="category-header">
          <div class="category-icon equipos">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <div class="category-info">
            <h3>Equipos</h3>
            <p>Equipos de fumigación y herramientas</p>
          </div>
        </div>
        <div class="category-stats">
          <div class="category-stat">
            <div class="stat-number">18</div>
            <div class="stat-label">Productos</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">$4,250</div>
            <div class="stat-label">Valor Total</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">2</div>
            <div class="stat-label">Stock Bajo</div>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn-secondary fullwidth">Ver Productos</button>
        </div>
      </div>

      <div class="category-card">
        <div class="category-header">
          <div class="category-icon herramientas">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          </div>
          <div class="category-info">
            <h3>Herramientas</h3>
            <p>Herramientas y accesorios</p>
          </div>
        </div>
        <div class="category-stats">
          <div class="category-stat">
            <div class="stat-number">12</div>
            <div class="stat-label">Productos</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">$960</div>
            <div class="stat-label">Valor Total</div>
          </div>
          <div class="category-stat">
            <div class="stat-number">0</div>
            <div class="stat-label">Stock Bajo</div>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn-secondary fullwidth">Ver Productos</button>
        </div>
      </div>
    </div>
  `;
}

// Función principal que maneja los tabs
export function renderAlmacenInventario() {
  const activeTab = 'productos'; 
  
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Inventario</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar Excel
        </button>
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Exportar PDF
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar Producto
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="productos">Productos</button>
      <button class="tab-btn" data-tab="kardex">Kardex</button>
      <button class="tab-btn" data-tab="categorias">Categorías</button>
    </div>

    <div class="tab-content">
      ${renderProductosTab()}
    </div>
  `;
}
