// Finanzas View

// Tab: Dashboard Financiero
export function renderDashboardFinancieroTab() {
  return `
    <div class="finance-dashboard">
      <div class="finance-cards">
        <div class="finance-card income">
          <div class="finance-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="finance-card-content">
            <div class="finance-card-label">Ingresos del Mes</div>
            <div class="finance-card-value">$84,250</div>
            <div class="finance-card-trend positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              +12% vs mes anterior
            </div>
          </div>
        </div>

        <div class="finance-card expense">
          <div class="finance-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="finance-card-content">
            <div class="finance-card-label">Egresos del Mes</div>
            <div class="finance-card-value">$52,180</div>
            <div class="finance-card-trend negative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
              +8% vs mes anterior
            </div>
          </div>
        </div>

        <div class="finance-card balance">
          <div class="finance-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </div>
          <div class="finance-card-content">
            <div class="finance-card-label">Saldo Neto</div>
            <div class="finance-card-value">$32,070</div>
            <div class="finance-card-trend positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              +15% vs mes anterior
            </div>
          </div>
        </div>
      </div>

      <div class="finance-chart">
        <h3>Flujo de Caja Mensual</h3>
        <div class="chart-container">
          <div class="chart-bars">
            <div class="chart-bar-group">
              <div class="chart-bar income" style="height: 75%"></div>
              <div class="chart-bar expense" style="height: 60%"></div>
              <div class="chart-label">Ene</div>
            </div>
            <div class="chart-bar-group">
              <div class="chart-bar income" style="height: 82%"></div>
              <div class="chart-bar expense" style="height: 58%"></div>
              <div class="chart-label">Feb</div>
            </div>
            <div class="chart-bar-group">
              <div class="chart-bar income" style="height: 68%"></div>
              <div class="chart-bar expense" style="height: 52%"></div>
              <div class="chart-label">Mar</div>
            </div>
            <div class="chart-bar-group">
              <div class="chart-bar income" style="height: 90%"></div>
              <div class="chart-bar expense" style="height: 65%"></div>
              <div class="chart-label">Abr</div>
            </div>
            <div class="chart-bar-group">
              <div class="chart-bar income" style="height: 78%"></div>
              <div class="chart-bar expense" style="height: 55%"></div>
              <div class="chart-label">May</div>
            </div>
            <div class="chart-bar-group">
              <div class="chart-bar income" style="height: 88%"></div>
              <div class="chart-bar expense" style="height: 62%"></div>
              <div class="chart-label">Jun</div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color income"></div>
              <span>Ingresos</span>
            </div>
            <div class="legend-item">
              <div class="legend-color expense"></div>
              <span>Egresos</span>
            </div>
          </div>
        </div>
      </div>

      <div class="finance-recent">
        <h3>Movimientos Recientes de Caja Chica</h3>
        <div class="table-container">
          <table class="op-table">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>CONCEPTO</th>
                <th>CATEGORÍA</th>
                <th>MONTO</th>
                <th>EVIDENCIA</th>
                <th>RESPONSABLE</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15/01/2025</td>
                <td>Combustible vehículo Nº3</td>
                <td><span class="badge">Transporte</span></td>
                <td class="amount-negative">-$45.00</td>
                <td>
                  <span class="evidence-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Foto
                  </span>
                </td>
                <td>Juan Pérez</td>
              </tr>
              <tr>
                <td>14/01/2025</td>
                <td>Peaje y estacionamiento</td>
                <td><span class="badge">Transporte</span></td>
                <td class="amount-negative">-$12.50</td>
                <td>
                    <span class="evidence-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Foto
                  </span>
                </td>
                <td>María Soto</td>
              </tr>
              <tr>
                <td>13/01/2025</td>
                <td>Materiales de oficina</td>
                <td><span class="badge">Suministros</span></td>
                <td class="amount-negative">-$28.00</td>
                <td>
                  <span class="evidence-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    PDF
                  </span>
                </td>
                <td>Carlos López</td>
              </tr>
              <tr>
                <td>12/01/2025</td>
                <td>Reposición caja chica</td>
                <td><span class="badge green">Ingreso</span></td>
                <td class="amount-positive">+$500.00</td>
                <td>
                  <span class="evidence-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    PDF
                  </span>
                </td>
                <td>Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Tab: Caja Chica
export function renderCajaChicaTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Saldo Disponible</div>
          <div class="stat-box-value">$428.50</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ingresos del Mes</div>
          <div class="stat-box-value">$1,500</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Egresos del Mes</div>
          <div class="stat-box-value">$1,071.50</div>
        </div>
      </div>
    </div>

    <div class="oc-filters-bar">
        <div class="oc-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" placeholder="Buscar por número de orden, cliente, servicio..." class="oc-search-input">
        </div>
        
        <div class="oc-filter-group">
          <select class="oc-filter-select">
            <option value="">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrido">Híbrido</option>
          </select>
          
          <select class="oc-filter-select">
            <option value="">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
          </select>
        </div>
      </div>

    <div class="table-container">
      <table class="op-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>SOLICITANTE</th>
            <th>ÁREA</th>
            <th>PROVEEDOR</th>
            <th>N° DOCUMENTO</th>
            <th>CONCEPTO</th>
            <th>SUBTOTAL</th>
            <th>EGRESO</th>
            <th>INGRESO</th>
            <th>SALDO</th>
            <th>COLUMNA 1</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>15/01/2025 14:30</td>
            <td>Combustible vehículo Nº3</td>
            <td><span class="badge">Transporte</span></td>
            <td class="amount-negative">-$45.00</td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Foto
              </span>
            </td>
            <td>Juan Pérez</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
                <div class="oc-action-buttons">
                  <button class="oc-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="oc-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
          </tr>
          <tr>
            <td>14/01/2025 11:20</td>
            <td>Peaje y estacionamiento</td>
            <td><span class="badge">Transporte</span></td>
            <td class="amount-negative">-$12.50</td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Foto
              </span>
            </td>
            <td>María Soto</td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>13/01/2025 16:45</td>
            <td>Almuerzo equipo técnico</td>
            <td><span class="badge">Alimentación</span></td>
            <td class="amount-negative">-$65.00</td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                PDF
              </span>
            </td>
            <td>Pedro López</td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>13/01/2025 09:15</td>
            <td>Materiales de oficina</td>
            <td><span class="badge">Suministros</span></td>
            <td class="amount-negative">-$28.00</td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                PDF
              </span>
            </td>
            <td>Carlos López</td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>12/01/2025 08:00</td>
            <td>Reposición caja chica</td>
            <td><span class="badge green">Ingreso</span></td>
            <td class="amount-positive">+$500.00</td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                PDF
              </span>
            </td>
            <td>Admin</td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>11/01/2025 15:30</td>
            <td>Reparación menor equipo</td>
            <td><span class="badge">Mantenimiento</span></td>
            <td class="amount-negative">-$85.00</td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Foto
              </span>
            </td>
            <td>Luis Torres</td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
          <tr>
            <td>10/01/2025 10:00</td>
            <td>Artículos de limpieza</td>
            <td><span class="badge">Suministros</span></td>
            <td class="amount-negative">-$42.00</td>
            <td>
              <span class="evidence-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                PDF
              </span>
            </td>
            <td>Ana García</td>
            <td><button class="action-btn">⋮</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">Mostrando 1-7 de 28 movimientos</span>
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
export function renderReportesFinancierosTab() {
  return `
    <div class="stats-row" style="margin-bottom: 24px;">
      <div class="stat-box">
        <div class="stat-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Ingresos Totales</div>
          <div class="stat-box-value">$84,250</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Egresos Totales</div>
          <div class="stat-box-value">$52,180</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-box-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
        </div>
        <div class="stat-box-content">
          <div class="stat-box-label">Margen Neto</div>
          <div class="stat-box-value">38%</div>
        </div>
      </div>
    </div>

    <div class="report-filters" style="background: white; padding: 20px; border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px;">Tipo de Reporte</label>
          <select class="filter-select">
            <option>Estado de Resultados</option>
            <option>Flujo de Caja</option>
            <option>Gastos por Categoría</option>
            <option>Cuentas por Cobrar</option>
            <option>Cuentas por Pagar</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px;">Período</label>
          <select class="filter-select">
            <option>Este Mes</option>
            <option>Último Trimestre</option>
            <option>Este Año</option>
            <option>Año Anterior</option>
            <option>Personalizado</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px;">Desde</label>
          <input type="date" class="filter-select" value="2025-01-01">
        </div>
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px;">Hasta</label>
          <input type="date" class="filter-select" value="2025-01-31">
        </div>
      </div>
      <div style="margin-top: 16px; display: flex; gap: 12px;">
        <button class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          Generar Reporte
        </button>
        <button class="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar Excel
        </button>
        <button class="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Exportar PDF
        </button>
      </div>
    </div>

    <div class="table-container">
      <h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 600; color: var(--text-dark);">Estado de Resultados - Enero 2025</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>CATEGORÍA</th>
            <th>ENERO</th>
            <th>DICIEMBRE</th>
            <th>VARIACIÓN</th>
            <th>% CAMBIO</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #f8fafc;">
            <td><strong>INGRESOS</strong></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Servicios de Fumigación</td>
            <td><strong>$52,400</strong></td>
            <td>$48,200</td>
            <td class="amount-positive">+$4,200</td>
            <td><span class="badge green">+8.7%</span></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Servicios de Desratización</td>
            <td><strong>$18,600</strong></td>
            <td>$16,800</td>
            <td class="amount-positive">+$1,800</td>
            <td><span class="badge green">+10.7%</span></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Sanitización COVID-19</td>
            <td><strong>$13,250</strong></td>
            <td>$15,100</td>
            <td class="amount-negative">-$1,850</td>
            <td><span class="badge orange">-12.3%</span></td>
          </tr>
          <tr style="background: #f8fafc; font-weight: 600;">
            <td><strong>TOTAL INGRESOS</strong></td>
            <td><strong>$84,250</strong></td>
            <td>$80,100</td>
            <td class="amount-positive">+$4,150</td>
            <td><span class="badge green">+5.2%</span></td>
          </tr>
          <tr style="background: #f8fafc;">
            <td><strong>EGRESOS</strong></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Químicos y Suministros</td>
            <td><strong>$22,100</strong></td>
            <td>$20,500</td>
            <td class="amount-negative">-$1,600</td>
            <td><span class="badge orange">+7.8%</span></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Salarios y Beneficios</td>
            <td><strong>$18,500</strong></td>
            <td>$18,500</td>
            <td>$0</td>
            <td><span class="badge">0%</span></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Transporte y Combustible</td>
            <td><strong>$6,200</strong></td>
            <td>$5,800</td>
            <td class="amount-negative">-$400</td>
            <td><span class="badge orange">+6.9%</span></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Mantenimiento de Equipos</td>
            <td><strong>$3,180</strong></td>
            <td>$2,900</td>
            <td class="amount-negative">-$280</td>
            <td><span class="badge orange">+9.7%</span></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Otros Gastos Operativos</td>
            <td><strong>$2,200</strong></td>
            <td>$2,100</td>
            <td class="amount-negative">-$100</td>
            <td><span class="badge orange">+4.8%</span></td>
          </tr>
          <tr style="background: #f8fafc; font-weight: 600;">
            <td><strong>TOTAL EGRESOS</strong></td>
            <td><strong>$52,180</strong></td>
            <td>$49,800</td>
            <td class="amount-negative">-$2,380</td>
            <td><span class="badge orange">+4.8%</span></td>
          </tr>
          <tr style="background: #dbeafe; font-weight: 700; font-size: 16px;">
            <td><strong>UTILIDAD NETA</strong></td>
            <td><strong style="color: var(--accent-green);">$32,070</strong></td>
            <td>$30,300</td>
            <td class="amount-positive">+$1,770</td>
            <td><span class="badge green">+5.8%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export function renderFinanzas() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Gestión Financiera</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar Excel
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Movimiento
        </button>
      </div>
    </div>

    <div class="inventory-tabs">
      <button class="tab-btn active" data-tab="dashboard">Dashboard Financiero</button>
      <button class="tab-btn" data-tab="caja">Caja Chica</button>
      <button class="tab-btn" data-tab="reportes">Reportes</button>
    </div>

    <div id="finanzas-tab-content">
      ${renderDashboardFinancieroTab()}
    </div>
  `;
}
