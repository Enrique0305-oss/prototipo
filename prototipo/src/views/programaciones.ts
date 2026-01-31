// Programaciones View
export function renderProgramaciones() {
  return `
    <div class="page-header-with-breadcrumb">
      <div class="breadcrumb">Programación de Servicios</div>
      <div class="page-actions">
        <button class="btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Exportar
        </button>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Programación
        </button>
      </div>
    </div>

    <div class="calendar-layout">
      <div class="calendar-sidebar">
        <div class="filter-section">
          <h3>FILTROS</h3>
          <div class="filter-group">
            <label style="font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; display: block;">Tipo de Servicio</label>
            <select class="filter-select">
              <option>Todos</option>
              <option>Fumigación</option>
              <option>Desratización</option>
              <option>Desinsectación</option>
              <option>Mantenimiento</option>
            </select>
          </div>
          <div class="filter-group" style="margin-top: 16px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; display: block;">Estado</label>
            <div class="checkbox-group">
              <label class="checkbox-item"><input type="checkbox" checked> Pendiente</label>
              <label class="checkbox-item"><input type="checkbox" checked> En Proceso</label>
              <label class="checkbox-item"><input type="checkbox"> Completado</label>
              <label class="checkbox-item"><input type="checkbox"> Cancelado</label>
            </div>
          </div>
        </div>

        <div class="stats-mini">
          <div class="stat-mini-item">
            <div class="stat-mini-value">42</div>
            <div class="stat-mini-label">Programados</div>
          </div>
          <div class="stat-mini-item">
            <div class="stat-mini-value">12</div>
            <div class="stat-mini-label">Completados</div>
          </div>
          <div class="stat-mini-item">
            <div class="stat-mini-value">05</div>
            <div class="stat-mini-label">Pendientes</div>
          </div>
        </div>

        <div class="technician-availability">
          <h3>Disponibilidad Técnicos</h3>
          <div class="tech-item">
            <div class="tech-avatar">JR</div>
            <div class="tech-info">
              <div class="tech-name">Juan Ramírez</div>
              <div class="tech-status available">Disponible</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-avatar">MS</div>
            <div class="tech-info">
              <div class="tech-name">María Soto</div>
              <div class="tech-status busy">Ocupado</div>
            </div>
          </div>
          <div class="tech-item">
            <div class="tech-avatar">PL</div>
            <div class="tech-info">
              <div class="tech-name">Pedro López</div>
              <div class="tech-status available">Disponible</div>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-main">
        <div class="calendar-header">
          <h2>Enero 2025</h2>
          <div class="calendar-nav">
            <button class="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="btn-secondary">Hoy</button>
            <button class="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>

        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <div class="weekday">LUN</div>
            <div class="weekday">MAR</div>
            <div class="weekday">MIÉ</div>
            <div class="weekday">JUE</div>
            <div class="weekday">VIE</div>
            <div class="weekday">SÁB</div>
            <div class="weekday">DOM</div>
          </div>
          <div class="calendar-days">
            <div class="calendar-day other-month">
              <span class="day-number">29</span>
            </div>
            <div class="calendar-day other-month">
              <span class="day-number">30</span>
            </div>
            <div class="calendar-day other-month">
              <span class="day-number">31</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">1</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">2</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">3</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">4</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">5</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">6</span>
              <div class="event blue">
                <div class="event-title">Fumigación Industrial</div>
                <div class="event-time">09:00 - 13:00</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">7</span>
              <div class="event green">
                <div class="event-title">Mantenimiento</div>
                <div class="event-time">14:00 - 16:00</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">8</span>
              <div class="event blue">
                <div class="event-title">Fumigación Residencial</div>
                <div class="event-time">10:00 - 12:00</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">9</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">10</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">11</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">12</span>
              <div class="event blue">
                <div class="event-title">Control de Plagas</div>
                <div class="event-time">08:30 - 11:00</div>
              </div>
              <div class="event orange">
                <div class="event-title">Desratización</div>
                <div class="event-time">15:00 - 17:00</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">13</span>
              <div class="event green">
                <div class="event-title">Inspección</div>
                <div class="event-time">11:00 - 12:30</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">14</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">15</span>
              <div class="event blue">
                <div class="event-title">Fumigación Comercial</div>
                <div class="event-time">09:00 - 14:00</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">16</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">17</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">18</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">19</span>
              <div class="event orange">
                <div class="event-title">Desratización</div>
                <div class="event-time">13:00 - 15:30</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">20</span>
              <div class="event blue">
                <div class="event-title">Fumigación</div>
                <div class="event-time">10:00 - 13:00</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">21</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">22</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">23</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">24</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">25</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">26</span>
              <div class="event green">
                <div class="event-title">Mantenimiento Preventivo</div>
                <div class="event-time">08:00 - 11:00</div>
              </div>
            </div>
            <div class="calendar-day">
              <span class="day-number">27</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">28</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">29</span>
            </div>
            <div class="calendar-day">
              <span class="day-number">30</span>
            </div>
            <div class="calendar-day highlighted">
              <span class="day-number">31</span>
              <div class="event purple">
                <div class="event-title">Sanitización</div>
                <div class="event-time">09:00 - 12:00</div>
              </div>
            </div>
            <div class="calendar-day other-month">
              <span class="day-number">1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
