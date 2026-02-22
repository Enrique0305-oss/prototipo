// Recursos Humanos View
import { rrhhService, type MiEstadoResponse, type EmpleadoHorarioResumen, type DiaHorario } from '../../services/rrhhService';

// Timer global para el contador de horas trabajadas (persiste aunque cierren y abran)
let contadorInterval: ReturnType<typeof setInterval> | null = null;
// Timer para verificar si ya se puede marcar salida
let verificarSalidaInterval: ReturnType<typeof setInterval> | null = null;

function limpiarTimersAsistencia() {
  if (contadorInterval) { clearInterval(contadorInterval); contadorInterval = null; }
  if (verificarSalidaInterval) { clearInterval(verificarSalidaInterval); verificarSalidaInterval = null; }
}

/**
 * Calcula las horas/minutos/segundos desde hora_entrada_raw hasta ahora.
 * Usa la fecha actual del cliente + la hora de entrada del servidor.
 * Así, si cierran el navegador y vuelven a abrir, el contador sigue correcto.
 */
function calcularTiempoTranscurrido(horaEntradaRaw: string, servidorFecha: string): { horas: number; minutos: number; segundos: number; totalSegundos: number } {
  const entrada = new Date(`${servidorFecha}T${horaEntradaRaw}`);
  const ahora = new Date();
  const diff = Math.max(0, Math.floor((ahora.getTime() - entrada.getTime()) / 1000));
  return {
    horas: Math.floor(diff / 3600),
    minutos: Math.floor((diff % 3600) / 60),
    segundos: diff % 60,
    totalSegundos: diff,
  };
}

function formatContador(h: number, m: number, s: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Tab: Asistencia
export function renderAsistenciaTab() {
  return `
    <div class="search-filter-bar">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" placeholder="Buscar trabajador..." class="search-input">
      </div>
      <select class="op-filter-select">
        <option>Todos</option>
        <option>Administrativos</option>
        <option>Campo</option>
      </select>
      <input type="date" class="op-filter-select" value="2025-01-15">
      <button class="btn-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="op-table">
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
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
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
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
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
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
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
      <select class="op-filter-select">
        <option>Todos los Departamentos</option>
        <option>Administrativo</option>
        <option>Campo</option>
        <option>Logística</option>
        <option>Ventas</option>
      </select>
      <select class="op-filter-select">
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
      <table class="op-table">
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
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
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
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
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
            <td>
                <div class="op-action-buttons">
                  <button class="op-btn-icon" title="Ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="op-btn-icon" title="PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
            </td>
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
      <select class="op-filter-select">
        <option>Enero 2025</option>
        <option>Diciembre 2024</option>
        <option>Noviembre 2024</option>
      </select>
      <select class="op-filter-select">
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
          <table class="op-table">
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
          <table class="op-table">
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

// Tab: Marcar Asistencia (Personal Administrativo) - Conectado al backend
export function renderMarcarAsistenciaTab() {
  // Retorna un placeholder que se llena dinámicamente con datos del backend
  return `
    <div id="marcar-asistencia-container" style="max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: center; align-items: center; padding: 60px;">
        <div style="text-align: center; color: #64748b;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 12px; animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          <div>Cargando datos de asistencia...</div>
        </div>
      </div>
    </div>
    <style>
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(124, 179, 66, 0.4); }
        50% { box-shadow: 0 0 0 10px rgba(124, 179, 66, 0); }
      }
      .contador-activo { animation: pulseGlow 2s ease-in-out infinite; }
    </style>
  `;
}

/**
 * Carga datos reales del backend y renderiza el contenido del tab Marcar Asistencia
 */
export async function cargarMarcarAsistencia() {
  limpiarTimersAsistencia();
  
  const container = document.getElementById('marcar-asistencia-container');
  if (!container) return;

  try {
    const resp: MiEstadoResponse = await rrhhService.getMiEstado(1);
    if (!resp.success) throw new Error('Error al cargar estado');
    
    const { personal, horario, asistencia_hoy, puede_marcar_salida, semana, estadisticas, servidor_hora, servidor_fecha } = resp.data;
    const esDescanso = (resp.data as any).es_descanso === true;

    if (!horario && !esDescanso) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" style="margin-bottom: 16px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style="margin: 0 0 8px;">Sin Horario Asignado</h3>
          <p style="color: #64748b;">No tienes horario configurado para hoy. Contacta al administrador.</p>
        </div>
      `;
      return;
    }

    if (esDescanso) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 60px 40px;">
          <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #7CB342 0%, #558B2F 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M20 8v6"></path>
              <path d="M23 11h-6"></path>
            </svg>
          </div>
          <h2 style="margin: 0 0 12px; color: #1a2332; font-size: 24px;">¡Hoy es tu día de descanso!</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 8px;">Disfruta tu día libre, ${personal.nombre.split(' ')[0]} 🎉</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">No necesitas marcar asistencia hoy.</p>
        </div>
      `;
      return;
    }

    // Aquí horario está garantizado no-null (los casos null/descanso retornaron antes)
    const horarioSeguro = horario!;

    const fechaActual = new Date().toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const yaMarcoEntrada = asistencia_hoy && asistencia_hoy.entrada;
    const yaMarcoSalida = asistencia_hoy && asistencia_hoy.salida;

    // Construir HTML dinámico
    container.innerHTML = `
      <!-- Banner de fecha y hora -->
      <div class="card" style="background: linear-gradient(135deg, #2c4a7c 0%, #1e3a5f 100%); color: white; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">
              ${fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)}
            </div>
            <div id="reloj-actual" style="font-size: 32px; font-weight: 700;">
              ${servidor_hora}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Personal Administrativo</div>
            <div style="font-size: 18px; font-weight: 600;">${personal.nombre}</div>
            <div style="font-size: 12px; opacity: 0.8;">${personal.codigo} - ${personal.area}</div>
          </div>
        </div>
      </div>

      <!-- Grid principal -->
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

          ${yaMarcoEntrada ? `
            <!-- Ya marcó entrada -->
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #0369a1; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span style="font-weight: 600;">Entrada Registrada</span>
              </div>
              <div style="font-size: 24px; font-weight: 700; color: #0c4a6e;">${asistencia_hoy!.entrada}</div>
              ${asistencia_hoy!.tardanza_minutos > 0 ? `
                <div style="color: #ea580c; font-size: 12px; margin-top: 4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  ${asistencia_hoy!.tardanza_minutos} minutos tarde
                </div>
              ` : ''}
            </div>

            <!-- Contador de horas trabajadas -->
            ${!yaMarcoSalida ? `
              <div id="contador-container" class="contador-activo" style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <div style="font-size: 12px; color: #15803d; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                  ⏱ Horas Trabajadas
                </div>
                <div id="contador-horas" style="font-size: 36px; font-weight: 800; color: #166534; font-family: monospace; letter-spacing: 2px;">
                  00:00:00
                </div>
                <div style="font-size: 11px; color: #16a34a; margin-top: 4px;">Contando desde las ${asistencia_hoy!.entrada}...</div>
              </div>
            ` : ''}

            ${yaMarcoSalida ? `
              <!-- Ya marcó salida -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #15803d; margin-bottom: 8px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span style="font-weight: 600;">Salida Registrada</span>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: #14532d;">${asistencia_hoy!.salida}</div>
                <div style="font-size: 14px; color: #15803d; margin-top: 8px;">
                  Jornada: <strong>${asistencia_hoy!.horas_trabajadas} hrs</strong>
                  ${asistencia_hoy!.tiempo_extra_minutos > 0 ? ` | Tiempo extra: <strong style="color: #2563eb;">${Math.floor(asistencia_hoy!.tiempo_extra_minutos / 60)}h ${asistencia_hoy!.tiempo_extra_minutos % 60}m</strong>` : ''}
                </div>
              </div>
            ` : `
              <!-- Botón Marcar Salida -->
              <div id="btn-salida-wrapper">
                ${puede_marcar_salida ? `
                  <button class="btn-primary" id="btnMarcarSalida" style="width: 100%; padding: 16px; font-size: 16px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Marcar Salida
                  </button>
                ` : `
                  <button class="btn-primary" disabled style="width: 100%; padding: 16px; font-size: 16px; opacity: 0.5; cursor: not-allowed; background: #94a3b8;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Salida habilitada a las ${horarioSeguro.salida}
                  </button>
                  <div id="countdown-salida" style="font-size: 12px; color: #64748b; margin-top: 8px;"></div>
                `}
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
                <div style="font-size: 24px; font-weight: 700; color: #1a2332;">${horarioSeguro.entrada}</div>
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
                <div style="font-size: 24px; font-weight: 700; color: #1a2332;">${horarioSeguro.salida}</div>
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
                  <strong>Tolerancia:</strong> ${horarioSeguro.tolerancia} minutos. Después se marca como tardanza.
                </div>
              </div>
            </div>

            ${yaMarcoEntrada && !yaMarcoSalida && asistencia_hoy?.estado ? `
              <div style="padding: 12px; background: ${asistencia_hoy.estado === 'Puntual' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${asistencia_hoy.estado === 'Puntual' ? '#bbf7d0' : '#fecaca'}; border-radius: 8px;">
                <div style="font-size: 13px; color: ${asistencia_hoy.estado === 'Puntual' ? '#15803d' : '#dc2626'}; font-weight: 600; text-align: center;">
                  Estado: ${asistencia_hoy.estado === 'Puntual' ? ' Puntual' : ' Tardanza (' + asistencia_hoy.tardanza_minutos + ' min)'}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Resumen de la semana -->
      <div class="card">
        <h3 style="font-size: 18px; margin: 0 0 20px 0; color: #1a2332;">Mi Asistencia - Esta Semana</h3>
        
        <div class="table-container">
          <table class="op-table">
            <thead>
              <tr>
                <th>DÍA</th>
                <th>FECHA</th>
                <th>ENTRADA</th>
                <th>SALIDA</th>
                <th>HORAS</th>
                <th>T. EXTRA</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              ${semana.length > 0 ? semana.map(s => `
                <tr style="${s.es_hoy ? 'background: #f0f9ff;' : ''}">
                  <td><strong>${s.dia}</strong></td>
                  <td>${s.fecha}</td>
                  <td><strong>${s.entrada}</strong></td>
                  <td>${s.salida}</td>
                  <td>${s.horas}</td>
                  <td>${s.tiempo_extra_minutos > 0 ? `<span style="color: #2563eb; font-weight: 600;">${Math.floor(s.tiempo_extra_minutos / 60)}h ${s.tiempo_extra_minutos % 60}m</span>` : '-'}</td>
                  <td><span class="status-indicator ${s.estado === 'Puntual' ? 'success' : s.estado === 'Tardanza' ? 'warning' : s.estado === 'Falta' ? 'danger' : 'warning'}">${s.estado}</span></td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">
                    No hay registros esta semana
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Estadísticas rápidas -->
        ${estadisticas ? `
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #7CB342; margin-bottom: 4px;">${estadisticas.total_horas}</div>
              <div style="font-size: 12px; color: #64748b;">Horas esta semana</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #2c4a7c; margin-bottom: 4px;">${estadisticas.dias_trabajados}</div>
              <div style="font-size: 12px; color: #64748b;">Días trabajados</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #ea580c; margin-bottom: 4px;">${estadisticas.tardanzas}</div>
              <div style="font-size: 12px; color: #64748b;">Tardanzas</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #7CB342; margin-bottom: 4px;">${estadisticas.puntualidad}%</div>
              <div style="font-size: 12px; color: #64748b;">Puntualidad</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">
                ${estadisticas.tiempo_extra_minutos > 0 ? Math.floor(estadisticas.tiempo_extra_minutos / 60) + 'h ' + (estadisticas.tiempo_extra_minutos % 60) + 'm' : '0'}
              </div>
              <div style="font-size: 12px; color: #64748b;">Tiempo extra</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Iniciar reloj en vivo
    iniciarRelojVivo();

    // Si marcó entrada pero no salida, iniciar contador de horas trabajadas
    if (yaMarcoEntrada && !yaMarcoSalida && asistencia_hoy?.hora_entrada_raw) {
      iniciarContadorHoras(asistencia_hoy.hora_entrada_raw, servidor_fecha);
    }

    // Si aún no puede marcar salida, verificar periódicamente
    if (yaMarcoEntrada && !yaMarcoSalida && !puede_marcar_salida) {
      iniciarVerificacionSalida(horarioSeguro.salida, servidor_fecha);
    }

    // Bind event listeners
    bindMarcarAsistenciaEvents();

  } catch (error) {
    console.error('Error cargando asistencia:', error);
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <div style="color: #dc2626; margin-bottom: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
        <h3 style="margin: 0 0 8px;">Error al cargar</h3>
        <p style="color: #64748b;">No se pudo conectar con el servidor. Intenta de nuevo.</p>
        <button class="btn-primary" id="btnReintentarAsistencia" style="margin-top: 16px;">Reintentar</button>
      </div>
    `;
    document.getElementById('btnReintentarAsistencia')?.addEventListener('click', () => cargarMarcarAsistencia());
  }
}

function iniciarRelojVivo() {
  const relojEl = document.getElementById('reloj-actual');
  if (!relojEl) return;
  
  const actualizarReloj = () => {
    const ahora = new Date();
    relojEl.textContent = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };
  actualizarReloj();
  
  // Reusar el intervalo del contador si existe, sino crear uno nuevo para el reloj
  setInterval(actualizarReloj, 1000);
}

/**
 * Inicia el contador basado en hora_entrada_raw del servidor.
 * CLAVE: Si cierran el navegador y vuelven, hora_entrada_raw viene del backend (BD),
 * así que el contador se recalcula correctamente.
 */
function iniciarContadorHoras(horaEntradaRaw: string, servidorFecha: string) {
  const contadorEl = document.getElementById('contador-horas');
  if (!contadorEl) return;

  const actualizar = () => {
    const t = calcularTiempoTranscurrido(horaEntradaRaw, servidorFecha);
    contadorEl.textContent = formatContador(t.horas, t.minutos, t.segundos);
  };
  actualizar(); // inmediato
  contadorInterval = setInterval(actualizar, 1000);
}

/**
 * Verifica periódicamente si ya llegó la hora de salida para habilitar el botón.
 */
function iniciarVerificacionSalida(horaSalida: string, servidorFecha: string) {
  const wrapper = document.getElementById('btn-salida-wrapper');
  if (!wrapper) return;

  const countdown = document.getElementById('countdown-salida');

  verificarSalidaInterval = setInterval(() => {
    const ahora = new Date();
    const salidaDate = new Date(`${servidorFecha}T${horaSalida}:00`);
    
    if (ahora >= salidaDate) {
      // Ya es hora, habilitar el botón
      wrapper.innerHTML = `
        <button class="btn-primary" id="btnMarcarSalida" style="width: 100%; padding: 16px; font-size: 16px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Marcar Salida
        </button>
      `;
      // Rebind
      document.getElementById('btnMarcarSalida')?.addEventListener('click', handleMarcarSalida);
      if (verificarSalidaInterval) { clearInterval(verificarSalidaInterval); verificarSalidaInterval = null; }
    } else if (countdown) {
      const diff = Math.floor((salidaDate.getTime() - ahora.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      countdown.textContent = `Faltan ${h > 0 ? h + 'h ' : ''}${m}m ${s}s para habilitar salida`;
    }
  }, 1000);
}

async function handleMarcarEntrada() {
  const btn = document.getElementById('btnMarcarEntrada') as HTMLButtonElement;
  if (!btn) return;
  
  btn.disabled = true;
  btn.innerHTML = '<span>Registrando...</span>';

  try {
    const resp = await rrhhService.marcarEntrada(1);
    if (resp.success) {
      // Mostrar notificación
      mostrarNotificacionAsistencia(resp.message, resp.data?.estado === 'Puntual' ? 'success' : 'warning');
      // Recargar todo el tab
      setTimeout(() => cargarMarcarAsistencia(), 500);
    } else {
      mostrarNotificacionAsistencia(resp.message || 'Error al registrar entrada', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Marcar Entrada';
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Error de conexión';
    mostrarNotificacionAsistencia(msg, 'error');
    btn.disabled = false;
    btn.innerHTML = 'Marcar Entrada';
  }
}

async function handleMarcarSalida() {
  const btn = document.getElementById('btnMarcarSalida') as HTMLButtonElement;
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = '<span>Registrando...</span>';

  try {
    const resp = await rrhhService.marcarSalida(1);
    if (resp.success) {
      limpiarTimersAsistencia();
      mostrarNotificacionAsistencia(resp.message, 'success');
      setTimeout(() => cargarMarcarAsistencia(), 500);
    } else {
      mostrarNotificacionAsistencia(resp.message || 'Error al registrar salida', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Marcar Salida';
    }
  } catch (err: any) {
    const msg = err?.data?.message || 'Error de conexión';
    mostrarNotificacionAsistencia(msg, 'error');
    btn.disabled = false;
    btn.innerHTML = 'Marcar Salida';
  }
}

function bindMarcarAsistenciaEvents() {
  document.getElementById('btnMarcarEntrada')?.addEventListener('click', handleMarcarEntrada);
  document.getElementById('btnMarcarSalida')?.addEventListener('click', handleMarcarSalida);
}

function mostrarNotificacionAsistencia(mensaje: string, tipo: 'success' | 'warning' | 'error') {
  const colores = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
    warning: { bg: '#fffbeb', border: '#fde047', text: '#854d0e' },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  };
  const c = colores[tipo];
  
  // Remover notificación anterior
  document.getElementById('asistencia-notif')?.remove();
  
  const notif = document.createElement('div');
  notif.id = 'asistencia-notif';
  notif.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 10000; background: ${c.bg}; border: 2px solid ${c.border}; color: ${c.text}; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); max-width: 400px; transition: opacity 0.3s;`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// ===== TAB HORARIOS =====

export function renderHorariosTab() {
  return `
    <div id="horarios-container">
      <div style="text-align: center; padding: 40px;">
        <div class="spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="color: #64748b;">Cargando horarios...</p>
      </div>
    </div>
  `;
}

let listaEmpleadosHorarios: EmpleadoHorarioResumen[] = [];

export async function cargarHorarios() {
  const container = document.getElementById('horarios-container');
  if (!container) return;

  try {
    const resp = await rrhhService.getHorarios();
    if (!resp.success) throw new Error('Error al cargar horarios');
    listaEmpleadosHorarios = resp.data;

    const completos = listaEmpleadosHorarios.filter(e => e.estado === 'Completo').length;
    const parciales = listaEmpleadosHorarios.filter(e => e.estado === 'Parcial').length;
    const pendientes = listaEmpleadosHorarios.filter(e => e.estado === 'Pendiente').length;

    container.innerHTML = `
      <!-- Resumen -->
      <div class="stat-boxes" style="margin-bottom: 24px;">
        <div class="stat-box">
          <div class="stat-box-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Completos</div>
            <div class="stat-box-value">${completos}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Parciales</div>
            <div class="stat-box-value">${parciales}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Pendientes</div>
            <div class="stat-box-value">${pendientes}</div>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-box-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <div class="stat-box-content">
            <div class="stat-box-label">Total</div>
            <div class="stat-box-value">${listaEmpleadosHorarios.length}</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="search-filter-bar" style="margin-bottom: 16px;">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input type="text" placeholder="Buscar empleado..." class="search-input" id="horarios-search">
        </div>
        <select class="op-filter-select" id="horarios-filter-estado">
          <option value="">Todos los estados</option>
          <option value="Completo">Completo</option>
          <option value="Parcial">Parcial</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="table-container">
        <table class="op-table">
          <thead>
            <tr>
              <th>EMPLEADO</th>
              <th>ÁREA</th>
              <th>DÍAS LABORALES</th>
              <th>DÍAS DESCANSO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody id="horarios-tbody">
            ${renderFilasHorarios(listaEmpleadosHorarios)}
          </tbody>
        </table>
      </div>
    `;

    // Event listeners
    initHorariosEvents();

  } catch (err) {
    console.error('Error cargando horarios:', err);
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="margin-bottom: 16px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <h3 style="margin: 0 0 8px; color: #dc2626;">Error al cargar horarios</h3>
        <p style="color: #64748b;">Verifica tu conexión e intenta nuevamente.</p>
        <button class="btn-primary" style="margin-top: 16px;" onclick="document.querySelector('[data-tab=horarios]')?.click()">Reintentar</button>
      </div>
    `;
  }
}

function renderFilasHorarios(empleados: EmpleadoHorarioResumen[]): string {
  if (empleados.length === 0) {
    return `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">No se encontraron empleados</td></tr>`;
  }
  return empleados.map(e => {
    const estadoClass = e.estado === 'Completo' ? 'success' : e.estado === 'Parcial' ? 'warning' : 'danger';
    return `
      <tr>
        <td>
          <div class="equipment-info">
            <div class="equipment-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div class="equipment-name">${e.nombre}</div>
              <div class="equipment-id">${e.correo || 'Sin correo'}</div>
            </div>
          </div>
        </td>
        <td><span class="badge">${e.area}</span></td>
        <td style="text-align: center; font-weight: 600;">${e.dias_laborales}</td>
        <td style="text-align: center; font-weight: 600;">${e.dias_descanso}</td>
        <td><span class="status-indicator ${estadoClass}">${e.estado}</span></td>
        <td>
          <div class="op-action-buttons">
            <button class="op-btn-icon btn-editar-horario" data-id="${e.id}" title="Editar horario">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
            <button class="op-btn-icon btn-copiar-horario" data-id="${e.id}" title="Copiar horario de otro empleado">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initHorariosEvents() {
  // Buscar
  const searchInput = document.getElementById('horarios-search') as HTMLInputElement;
  const filterEstado = document.getElementById('horarios-filter-estado') as HTMLSelectElement;

  const filtrar = () => {
    const texto = (searchInput?.value || '').toLowerCase();
    const estado = filterEstado?.value || '';
    const filtrados = listaEmpleadosHorarios.filter(e => {
      const matchTexto = !texto || e.nombre.toLowerCase().includes(texto) || e.area.toLowerCase().includes(texto);
      const matchEstado = !estado || e.estado === estado;
      return matchTexto && matchEstado;
    });
    const tbody = document.getElementById('horarios-tbody');
    if (tbody) tbody.innerHTML = renderFilasHorarios(filtrados);
    // Re-bind editar/copiar buttons
    bindHorariosAccionButtons();
  };

  searchInput?.addEventListener('input', filtrar);
  filterEstado?.addEventListener('change', filtrar);

  bindHorariosAccionButtons();
}

function bindHorariosAccionButtons() {
  // Editar horario
  document.querySelectorAll('.btn-editar-horario').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      if (id) await abrirModalHorario(id);
    });
  });

  // Copiar horario
  document.querySelectorAll('.btn-copiar-horario').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt((btn as HTMLElement).dataset.id || '0');
      if (id) abrirModalCopiarHorario(id);
    });
  });
}

async function abrirModalHorario(idPersonal: number) {
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.id = 'modal-horario-overlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;';

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 32px; width: 700px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="text-align: center; padding: 20px;">
        <div class="spinner" style="margin: 0 auto 16px; width: 36px; height: 36px; border: 4px solid #e2e8f0; border-top-color: #2c4a7c; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="color: #64748b;">Cargando horario...</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  try {
    const resp = await rrhhService.getHorarioPersonal(idPersonal);
    if (!resp.success) throw new Error('Error');

    const { personal, horarios } = resp.data;

    const modalContent = overlay.querySelector('div > div') || overlay.firstElementChild!;
    (modalContent as HTMLElement).innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="margin: 0 0 4px; color: #1a2332; font-size: 20px;">Horario Semanal</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px;">${personal.nombre} — ${personal.area}</p>
        </div>
        <button id="modal-horario-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;" id="horario-dias-form">
        ${horarios.map((d: DiaHorario) => `
          <div class="horario-dia-row" data-dia="${d.dia_semana}" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: ${d.es_descanso ? '#f0fdf4' : '#f8fafc'}; border-radius: 10px; border: 1px solid ${d.es_descanso ? '#bbf7d0' : '#e2e8f0'};">
            <div style="width: 100px; font-weight: 600; font-size: 14px; color: #1a2332;">${d.dia_semana}</div>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; min-width: 110px;">
              <input type="checkbox" class="horario-descanso-check" ${d.es_descanso ? 'checked' : ''} style="accent-color: #7CB342; width: 18px; height: 18px;">
              <span style="font-size: 13px; color: ${d.es_descanso ? '#15803d' : '#64748b'};">Descanso</span>
            </label>
            <div class="horario-horas" style="display: flex; align-items: center; gap: 8px; ${d.es_descanso ? 'opacity: 0.3; pointer-events: none;' : ''}">
              <label style="font-size: 12px; color: #64748b;">Entrada:</label>
              <input type="time" class="horario-entrada" value="${d.hora_entrada || '08:00'}" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
              <label style="font-size: 12px; color: #64748b;">Salida:</label>
              <input type="time" class="horario-salida" value="${d.hora_salida || '17:00'}" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
              <label style="font-size: 12px; color: #64748b;">Tolerancia:</label>
              <input type="number" class="horario-tolerancia" value="${d.tolerancia}" min="0" max="60" style="padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; width: 60px;">
              <span style="font-size: 11px; color: #94a3b8;">min</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button id="modal-horario-cancel" class="btn-secondary" style="padding: 10px 24px;">Cancelar</button>
        <button id="modal-horario-save" class="btn-primary" style="padding: 10px 24px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Guardar Horario
        </button>
      </div>
    `;

    // Toggle descanso
    overlay.querySelectorAll('.horario-dia-row').forEach(row => {
      const check = row.querySelector('.horario-descanso-check') as HTMLInputElement;
      const horasDiv = row.querySelector('.horario-horas') as HTMLElement;
      const label = check?.parentElement?.querySelector('span') as HTMLElement;

      check?.addEventListener('change', () => {
        if (check.checked) {
          horasDiv.style.opacity = '0.3';
          horasDiv.style.pointerEvents = 'none';
          (row as HTMLElement).style.background = '#f0fdf4';
          (row as HTMLElement).style.borderColor = '#bbf7d0';
          if (label) { label.style.color = '#15803d'; }
        } else {
          horasDiv.style.opacity = '1';
          horasDiv.style.pointerEvents = 'auto';
          (row as HTMLElement).style.background = '#f8fafc';
          (row as HTMLElement).style.borderColor = '#e2e8f0';
          if (label) { label.style.color = '#64748b'; }
        }
      });
    });

    // Close
    overlay.querySelector('#modal-horario-close')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#modal-horario-cancel')?.addEventListener('click', () => overlay.remove());

    // Save
    overlay.querySelector('#modal-horario-save')?.addEventListener('click', async () => {
      const rows = overlay.querySelectorAll('.horario-dia-row');
      const dias: Array<{ dia_semana: string; hora_entrada: string | null; hora_salida: string | null; tolerancia: number; es_descanso: boolean }> = [];

      rows.forEach(row => {
        const diaSemana = (row as HTMLElement).dataset.dia || '';
        const esDescanso = (row.querySelector('.horario-descanso-check') as HTMLInputElement).checked;
        const entrada = (row.querySelector('.horario-entrada') as HTMLInputElement).value;
        const salida = (row.querySelector('.horario-salida') as HTMLInputElement).value;
        const tolerancia = parseInt((row.querySelector('.horario-tolerancia') as HTMLInputElement).value) || 10;

        dias.push({
          dia_semana: diaSemana,
          hora_entrada: esDescanso ? null : entrada,
          hora_salida: esDescanso ? null : salida,
          tolerancia,
          es_descanso: esDescanso,
        });
      });

      const saveBtn = overlay.querySelector('#modal-horario-save') as HTMLButtonElement;
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Guardando...';

      try {
        const result = await rrhhService.guardarHorario(idPersonal, dias);
        if (result.success) {
          mostrarNotificacionAsistencia(result.message, 'success');
          overlay.remove();
          await cargarHorarios(); // Recargar tabla
        } else {
          mostrarNotificacionAsistencia(result.message || 'Error al guardar', 'error');
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Guardar Horario';
        }
      } catch (err: any) {
        mostrarNotificacionAsistencia(err?.data?.message || 'Error al guardar horario', 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Guardar Horario';
      }
    });

  } catch (err) {
    overlay.remove();
    mostrarNotificacionAsistencia('Error al cargar horario del empleado', 'error');
  }
}

function abrirModalCopiarHorario(idPersonalDestino: number) {
  const destino = listaEmpleadosHorarios.find(e => e.id === idPersonalDestino);
  if (!destino) return;

  // Solo mostrar empleados con horario completo como origen
  const disponibles = listaEmpleadosHorarios.filter(e => e.id !== idPersonalDestino && e.estado === 'Completo');

  const overlay = document.createElement('div');
  overlay.id = 'modal-copiar-overlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;';

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 32px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0 0 4px; color: #1a2332; font-size: 18px;">Copiar Horario</h2>
          <p style="margin: 0; color: #64748b; font-size: 13px;">Destino: ${destino.nombre}</p>
        </div>
        <button id="modal-copiar-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      ${disponibles.length === 0 ? `
        <div style="text-align: center; padding: 20px; color: #64748b;">
          <p>No hay empleados con horario completo para copiar.</p>
        </div>
      ` : `
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px;">Copiar horario de:</label>
          <select id="copiar-origen-select" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 14px;">
            ${disponibles.map(e => `<option value="${e.id}">${e.nombre} (${e.area}) — ${e.dias_laborales} lab / ${e.dias_descanso} desc</option>`).join('')}
          </select>
        </div>
        <p style="font-size: 12px; color: #ea580c; margin-bottom: 20px;">⚠️ Esto reemplazará el horario actual de ${destino.nombre.split(' ')[0]}.</p>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button id="modal-copiar-cancel" class="btn-secondary" style="padding: 10px 24px;">Cancelar</button>
          <button id="modal-copiar-confirm" class="btn-primary" style="padding: 10px 24px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copiar
          </button>
        </div>
      `}
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#modal-copiar-close')?.addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-copiar-cancel')?.addEventListener('click', () => overlay.remove());

  overlay.querySelector('#modal-copiar-confirm')?.addEventListener('click', async () => {
    const select = document.getElementById('copiar-origen-select') as HTMLSelectElement;
    const idOrigen = parseInt(select?.value || '0');
    if (!idOrigen) return;

    const confirmBtn = overlay.querySelector('#modal-copiar-confirm') as HTMLButtonElement;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = 'Copiando...';

    try {
      const result = await rrhhService.copiarHorario(idPersonalDestino, idOrigen);
      if (result.success) {
        mostrarNotificacionAsistencia(result.message, 'success');
        overlay.remove();
        await cargarHorarios();
      } else {
        mostrarNotificacionAsistencia(result.message || 'Error al copiar', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Copiar';
      }
    } catch (err: any) {
      mostrarNotificacionAsistencia(err?.data?.message || 'Error al copiar horario', 'error');
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = 'Copiar';
    }
  });
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
      <button class="tab-btn" data-tab="horarios">Horarios</button>
      <button class="tab-btn" data-tab="empleados">Empleados</button>
      <button class="tab-btn" data-tab="reportes">Reportes</button>
    </div>

    <div id="recursos-tab-content">
      ${renderAsistenciaTab()}
    </div>
  `;
}
