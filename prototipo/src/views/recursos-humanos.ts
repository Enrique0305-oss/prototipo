// Recursos Humanos View

// Tab: Asistencia
export function renderAsistenciaTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar trabajador..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos</option>
        <option>Administrativos</option>
        <option>Campo</option>
      </select>
      <input type="date" class="filter-select" value="2025-01-15">
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>TRABAJADOR</th>
            <th>ÁREA</th>
            <th>FECHA</th>
            <th>ENTRADA</th>
            <th>SALIDA</th>
            <th>HORAS</th>
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
                  <div class="equipment-name">Juan Ramírez</div>
                  <div class="equipment-id">ID: EMP-001</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>15/01/2025</td>
            <td>08:00 AM</td>
            <td>05:30 PM</td>
            <td>9.5 hrs</td>
            <td><span class="status-indicator success">Completo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">María Soto</div>
                  <div class="equipment-id">ID: EMP-002</div>
                </div>
              </div>
            </td>
            <td><span class="badge green">Administrativo</span></td>
            <td>15/01/2025</td>
            <td>08:15 AM</td>
            <td>06:00 PM</td>
            <td>9.75 hrs</td>
            <td><span class="status-indicator success">Completo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Pedro López</div>
                  <div class="equipment-id">ID: EMP-003</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>15/01/2025</td>
            <td>07:45 AM</td>
            <td>05:15 PM</td>
            <td>9.5 hrs</td>
            <td><span class="status-indicator success">Completo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Ana Torres</div>
                  <div class="equipment-id">ID: EMP-004</div>
                </div>
              </div>
            </td>
            <td><span class="badge green">Administrativo</span></td>
            <td>15/01/2025</td>
            <td>08:30 AM</td>
            <td>--:-- --</td>
            <td>-- hrs</td>
            <td><span class="status-indicator warning">En Curso</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Carlos Mendoza</div>
                  <div class="equipment-id">ID: EMP-005</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>15/01/2025</td>
            <td>09:10 AM</td>
            <td>05:45 PM</td>
            <td>8.58 hrs</td>
            <td><span class="status-indicator warning">Tardanza</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Roberto Díaz</div>
                  <div class="equipment-id">ID: EMP-006</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>15/01/2025</td>
            <td>--:-- --</td>
            <td>--:-- --</td>
            <td>-- hrs</td>
            <td><span class="status-indicator danger">Ausente</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats-row" style="margin-top: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Trabajadores</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Presentes Hoy</div>
          <div class="stat-box-value">21</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tardanzas</div>
          <div class="stat-box-value">2</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon red">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ausentes</div>
          <div class="stat-box-value">1</div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-10 de 24 registros</span>
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

// Tab: Empleados
export function renderEmpleadosTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar empleado..." class="search-input">
      </div>
      <select class="filter-select">
        <option>Todos los Departamentos</option>
        <option>Administrativo</option>
        <option>Campo</option>
        <option>Logística</option>
        <option>Ventas</option>
      </select>
      <select class="filter-select">
        <option>Todos los Estados</option>
        <option>Activo</option>
        <option>Inactivo</option>
        <option>Vacaciones</option>
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
            <th>EMPLEADO</th>
            <th>DEPARTAMENTO</th>
            <th>CARGO</th>
            <th>TELÉFONO</th>
            <th>EMAIL</th>
            <th>FECHA INGRESO</th>
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
                  <div class="equipment-name">Juan Ramírez</div>
                  <div class="equipment-id">ID: EMP-001</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>Técnico Fumigador</td>
            <td>+51 987 654 321</td>
            <td>juan.ramirez@qsci.com</td>
            <td>15/03/2023</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">María Soto</div>
                  <div class="equipment-id">ID: EMP-002</div>
                </div>
              </div>
            </td>
            <td><span class="badge green">Administrativo</span></td>
            <td>Asistente Administrativa</td>
            <td>+51 912 345 678</td>
            <td>maria.soto@qsci.com</td>
            <td>10/01/2024</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Pedro López</div>
                  <div class="equipment-id">ID: EMP-003</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>Técnico Sanitización</td>
            <td>+51 998 765 432</td>
            <td>pedro.lopez@qsci.com</td>
            <td>22/06/2023</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Ana Torres</div>
                  <div class="equipment-id">ID: EMP-004</div>
                </div>
              </div>
            </td>
            <td><span class="badge green">Administrativo</span></td>
            <td>Contadora</td>
            <td>+51 945 678 901</td>
            <td>ana.torres@qsci.com</td>
            <td>05/09/2022</td>
            <td><span class="status-indicator warning">Vacaciones</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Carlos Mendoza</div>
                  <div class="equipment-id">ID: EMP-005</div>
                </div>
              </div>
            </td>
            <td><span class="badge">Campo</span></td>
            <td>Supervisor de Campo</td>
            <td>+51 923 456 789</td>
            <td>carlos.mendoza@qsci.com</td>
            <td>18/11/2021</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Roberto Díaz</div>
                  <div class="equipment-id">ID: EMP-006</div>
                </div>
              </div>
            </td>
            <td><span class="badge blue">Logística</span></td>
            <td>Chofer</td>
            <td>+51 956 789 012</td>
            <td>roberto.diaz@qsci.com</td>
            <td>30/04/2024</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>
              <div class="equipment-info">
                <div class="equipment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="equipment-name">Carmen Ríos</div>
                  <div class="equipment-id">ID: EMP-007</div>
                </div>
              </div>
            </td>
            <td><span class="badge orange">Ventas</span></td>
            <td>Ejecutiva Comercial</td>
            <td>+51 978 123 456</td>
            <td>carmen.rios@qsci.com</td>
            <td>12/08/2023</td>
            <td><span class="status-indicator success">Activo</span></td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats-row" style="margin-top: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Total Empleados</div>
          <div class="stat-box-value">24</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Activos</div>
          <div class="stat-box-value">22</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">En Vacaciones</div>
          <div class="stat-box-value">1</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Planilla Mensual</div>
          <div class="stat-box-value">$18,450</div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-7 de 24 empleados</span>
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

// Tab: Reportes
export function renderReportesTab() {
  return `
    <div class="search-filter-bar">
      <select class="filter-select">
        <option>Enero 2025</option>
        <option>Diciembre 2024</option>
        <option>Noviembre 2024</option>
      </select>
      <select class="filter-select">
        <option>Todos los Departamentos</option>
        <option>Administrativo</option>
        <option>Campo</option>
        <option>Logística</option>
        <option>Ventas</option>
      </select>
      <button class="btn-secondary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Exportar Excel
      </button>
    </div>

    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Horas Trabajadas</div>
          <div class="stat-box-value">4,256 <span class="stat-box-note">hrs</span></div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Asistencia Promedio</div>
          <div class="stat-box-value">96.8%</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Tardanzas del Mes</div>
          <div class="stat-box-value">38</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon red">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ausencias del Mes</div>
          <div class="stat-box-value">12</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <div class="card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Asistencia por Departamento</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>DEPARTAMENTO</th>
                <th>EMPLEADOS</th>
                <th>ASISTENCIA</th>
                <th>TARDANZAS</th>
                <th>AUSENCIAS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge">Campo</span></td>
                <td>12</td>
                <td><strong>95.2%</strong></td>
                <td>18</td>
                <td>7</td>
              </tr>
              <tr>
                <td><span class="badge green">Administrativo</span></td>
                <td>6</td>
                <td><strong>98.5%</strong></td>
                <td>5</td>
                <td>2</td>
              </tr>
              <tr>
                <td><span class="badge blue">Logística</span></td>
                <td>3</td>
                <td><strong>97.1%</strong></td>
                <td>8</td>
                <td>1</td>
              </tr>
              <tr>
                <td><span class="badge orange">Ventas</span></td>
                <td>3</td>
                <td><strong>96.8%</strong></td>
                <td>7</td>
                <td>2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Top Empleados del Mes</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>EMPLEADO</th>
                <th>DEPT.</th>
                <th>ASISTENCIA</th>
                <th>PUNTUALIDAD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">María Soto</div>
                  </div>
                </td>
                <td><span class="badge green">Admin</span></td>
                <td><strong>100%</strong></td>
                <td><span class="status-indicator success">Excelente</span></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">Pedro López</div>
                  </div>
                </td>
                <td><span class="badge">Campo</span></td>
                <td><strong>100%</strong></td>
                <td><span class="status-indicator success">Excelente</span></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">Carmen Ríos</div>
                  </div>
                </td>
                <td><span class="badge orange">Ventas</span></td>
                <td><strong>98.5%</strong></td>
                <td><span class="status-indicator success">Muy Bueno</span></td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="equipment-name">Carlos Mendoza</div>
                  </div>
                </td>
                <td><span class="badge">Campo</span></td>
                <td><strong>97.8%</strong></td>
                <td><span class="status-indicator success">Muy Bueno</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a;">Histórico de Horas Trabajadas (Enero 2025)</h3>
      <div style="height: 200px; background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%); border-radius: 8px; display: flex; align-items: flex-end; justify-content: space-around; padding: 20px; gap: 8px;">
        <div style="text-align: center;">
          <div style="width: 40px; height: 160px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 12px; color: #666;">S1</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 40px; height: 145px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 12px; color: #666;">S2</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 40px; height: 170px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 12px; color: #666;">S3</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 40px; height: 155px; background: linear-gradient(to top, #2c4a7c, #4a6fa5); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="font-size: 12px; color: #666;">S4</div>
        </div>
      </div>
    </div>
  `;
}

// Tab: Marcar Asistencia (Personal Administrativo)
export function renderMarcarAsistenciaTab() {
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const fechaActual = new Date().toLocaleDateString('es-PE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Datos de ejemplo del usuario logueado
  const usuarioActual = {
    nombre: 'Admin Usuario',
    id: 'EMP-001',
    area: 'Administración',
    horario_entrada: '08:00',
    horario_salida: '17:00',
    asistencia_hoy: {
      entrada: '08:15',
      salida: null,
      tardanza: 15
    }
  };

  return `
    <div style="max-width: 1200px; margin: 0 auto;">
      <!-- Banner de fecha y hora -->
      <div class="card" style="background: linear-gradient(135deg, #2c4a7c 0%, #1e3a5f 100%); color: white; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">
              ${fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)}
            </div>
            <div style="font-size: 32px; font-weight: 700;">
              ${horaActual}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Personal Administrativo</div>
            <div style="font-size: 18px; font-weight: 600;">${usuarioActual.nombre}</div>
            <div style="font-size: 12px; opacity: 0.8;">${usuarioActual.id} - ${usuarioActual.area}</div>
          </div>
        </div>
      </div>

      <!-- Grid de tarjetas -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        <!-- Tarjeta Marcar Entrada/Salida -->
        <div class="card" style="text-align: center; padding: 40px;">
          <div style="margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #7CB342 0%, #689F38 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2v20M17 12H7"></path>
              </svg>
            </div>
            <h3 style="font-size: 20px; margin: 0 0 8px 0; color: #1a2332;">Marcar Asistencia</h3>
            <p style="color: #64748b; margin: 0;">Registra tu entrada o salida del día</p>
          </div>

          ${usuarioActual.asistencia_hoy.entrada ? `
            <!-- Ya marcó entrada -->
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #0369a1; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span style="font-weight: 600;">Entrada Registrada</span>
              </div>
              <div style="font-size: 24px; font-weight: 700; color: #0c4a6e;">${usuarioActual.asistencia_hoy.entrada}</div>
              ${usuarioActual.asistencia_hoy.tardanza > 0 ? `
                <div style="color: #ea580c; font-size: 12px; margin-top: 4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  ${usuarioActual.asistencia_hoy.tardanza} minutos tarde
                </div>
              ` : ''}
            </div>
            
            ${!usuarioActual.asistencia_hoy.salida ? `
              <button class="btn-primary" id="btnMarcarSalida" style="width: 100%; padding: 16px; font-size: 16px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Marcar Salida
              </button>
            ` : `
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #15803d; margin-bottom: 8px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span style="font-weight: 600;">Salida Registrada</span>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: #14532d;">${usuarioActual.asistencia_hoy.salida}</div>
                <div style="color: #15803d; font-size: 12px; margin-top: 8px;">Jornada completada</div>
              </div>
            `}
          ` : `
            <!-- No ha marcado entrada -->
            <button class="btn-primary" id="btnMarcarEntrada" style="width: 100%; padding: 16px; font-size: 16px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Marcar Entrada
            </button>
          `}
        </div>

        <!-- Tarjeta Horario -->
        <div class="card">
          <h3 style="font-size: 18px; margin: 0 0 20px 0; color: #1a2332; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c4a7c" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Tu Horario de Hoy
          </h3>
          
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
              <div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Entrada Esperada</div>
                <div style="font-size: 24px; font-weight: 700; color: #1a2332;">${usuarioActual.horario_entrada}</div>
              </div>
              <div style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7CB342" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8f9fa; border-radius: 8px;">
              <div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Salida Esperada</div>
                <div style="font-size: 24px; font-weight: 700; color: #1a2332;">${usuarioActual.horario_salida}</div>
              </div>
              <div style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c4a7c" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
            </div>

            <div style="padding: 12px; background: #fffbeb; border: 1px solid #fde047; border-radius: 8px;">
              <div style="display: flex; gap: 8px; align-items: start;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div style="font-size: 12px; color: #854d0e;">
                  <strong>Tolerancia:</strong> 10 minutos. Después se marca como tardanza.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen de la semana -->
      <div class="card">
        <h3 style="font-size: 18px; margin: 0 0 20px 0; color: #1a2332;">Mi Asistencia - Esta Semana</h3>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>DÍA</th>
                <th>FECHA</th>
                <th>ENTRADA</th>
                <th>SALIDA</th>
                <th>HORAS</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: #f0f9ff;">
                <td><strong>Hoy - Martes</strong></td>
                <td>04/02/2026</td>
                <td><strong>08:15</strong></td>
                <td>--:--</td>
                <td>-- hrs</td>
                <td><span class="status-indicator warning">En Curso</span></td>
              </tr>
              <tr>
                <td>Lunes</td>
                <td>03/02/2026</td>
                <td>08:00</td>
                <td>17:05</td>
                <td>9.08 hrs</td>
                <td><span class="status-indicator success">Puntual</span></td>
              </tr>
              <tr>
                <td>Viernes</td>
                <td>31/01/2026</td>
                <td>08:10</td>
                <td>17:00</td>
                <td>8.83 hrs</td>
                <td><span class="status-indicator warning">Tardanza</span></td>
              </tr>
              <tr>
                <td>Jueves</td>
                <td>30/01/2026</td>
                <td>08:00</td>
                <td>17:15</td>
                <td>9.25 hrs</td>
                <td><span class="status-indicator success">Puntual</span></td>
              </tr>
              <tr>
                <td>Miércoles</td>
                <td>29/01/2026</td>
                <td>07:55</td>
                <td>17:00</td>
                <td>9.08 hrs</td>
                <td><span class="status-indicator success">Puntual</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estadísticas rápidas -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <div style="text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #7CB342; margin-bottom: 4px;">45.5</div>
            <div style="font-size: 12px; color: #64748b;">Horas esta semana</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #2c4a7c; margin-bottom: 4px;">4</div>
            <div style="font-size: 12px; color: #64748b;">Días trabajados</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #ea580c; margin-bottom: 4px;">1</div>
            <div style="font-size: 12px; color: #64748b;">Tardanzas</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #7CB342; margin-bottom: 4px;">97%</div>
            <div style="font-size: 12px; color: #64748b;">Puntualidad</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderRecursosHumanos() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión de Recursos Humanos</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar Excel
        </button>
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Exportar PDF
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="asistencia">Asistencia</button>
      <button class="tab-btn" data-tab="marcar">Marcar Asistencia</button>
      <button class="tab-btn" data-tab="empleados">Empleados</button>
      <button class="tab-btn" data-tab="reportes">Reportes</button>
    </div>

    <div id="recursos-tab-content">
      ${renderAsistenciaTab()}
    </div>
  `;
}
