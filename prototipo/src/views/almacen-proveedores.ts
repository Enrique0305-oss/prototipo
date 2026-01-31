// Almacén - Proveedores View
export function renderAlmacenProveedores() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Proveedores</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar Proveedor
        </button>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar proveedor..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todas las categorías</option>
        <option>Químicos</option>
        <option>Equipos</option>
        <option>EPP</option>
        <option>Servicios</option>
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
            <th>PROVEEDOR</th>
            <th>RUC</th>
            <th>CONTACTO</th>
            <th>TELÉFONO</th>
            <th>CATEGORÍA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                </div>
                <div>
                  <div class="equipment-name">QuímicaPeru S.A.C.</div>
                  <div class="equipment-id">Productos Químicos</div>
                </div>
              </div>
            </td>
            <td>20501234567</td>
            <td>
              <div>Luis García</div>
              <div style="font-size: 12px; color: #64748b;">ventas@quimicaperu.com</div>
            </td>
            <td>(01) 456-7890</td>
            <td><span class="badge">Químicos</span></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                </div>
                <div>
                  <div class="equipment-name">Equipos Industriales Lima</div>
                  <div class="equipment-id">Nebulizadores y Equipos</div>
                </div>
              </div>
            </td>
            <td>20512345678</td>
            <td>
              <div>Ana Martínez</div>
              <div style="font-size: 12px; color: #64748b;">contacto@equiposlima.com</div>
            </td>
            <td>(01) 234-5678</td>
            <td><span class="badge green">Equipos</span></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                </div>
                <div>
                  <div class="equipment-name">Protección Total SAC</div>
                  <div class="equipment-id">EPP y Seguridad</div>
                </div>
              </div>
            </td>
            <td>20523456789</td>
            <td>
              <div>Roberto Silva</div>
              <div style="font-size: 12px; color: #64748b;">ventas@protecciontotal.pe</div>
            </td>
            <td>(01) 789-0123</td>
            <td><span class="badge orange">EPP</span></td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                </div>
                <div>
                  <div class="equipment-name">Distribuidora Andina</div>
                  <div class="equipment-id">Químicos y Herramientas</div>
                </div>
              </div>
            </td>
            <td>20534567890</td>
            <td>
              <div>Carmen Ríos</div>
              <div style="font-size: 12px; color: #64748b;">info@distrandina.com</div>
            </td>
            <td>(01) 567-8901</td>
            <td><span class="badge">Químicos</span></td>
            <td><span class="status-indicator">Inactivo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 15 proveedores</span>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>Anterior</button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">Siguiente</button>
      </div>
    </div>
  `;
}
