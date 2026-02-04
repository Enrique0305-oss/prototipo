import './style.css'
import './additional-styles.css'
import { renderDashboard } from './views/dashboard'
import { renderAlmacenMantenimiento } from './views/almacen-mantenimiento'
import { renderAlmacenInventario, renderProductosTab, renderKardexTab, renderCategoriasTab } from './views/almacen-inventario'
import { renderAlmacenProveedores } from './views/almacen-proveedores'
import { renderAlmacenEntradasSalidas, renderMovimientosTab, renderPrestamoEPPTab, renderTransferenciasTab } from './views/almacen-entradas-salidas'
import { renderLogistica, renderClientesTab, renderServiciosDisponiblesTab, renderRutasTab } from './views/logistica'
import { renderProgramaciones, initProgramacionesEvents } from './views/programaciones'
import { renderComercialProspectos } from './views/comercial-prospectos'
import { renderComercialCotizaciones } from './views/comercial-cotizaciones'
import { renderComercialOrdenesServicio } from './views/comercial-ordenes-servicio'
import { renderComercialOrdenesProducto } from './views/comercial-ordenes-producto'
import { renderComercialOrdenesCapacitacion } from './views/comercial-ordenes-capacitacion'
import { renderComercialConversiones } from './views/comercial-conversiones'
import { renderFinanzas, renderDashboardFinancieroTab, renderCajaChicaTab, renderReportesFinancierosTab } from './views/finanzas'
import { renderFacturacion, renderOrdenesProyectadasTab, renderContratosFijosTab, renderEstadoCobranzaTab } from './views/facturacion';
import { renderRecursosHumanos, renderAsistenciaTab, renderEmpleadosTab, renderReportesTab } from './views/recursos-humanos'
import { renderOperaciones, renderServiciosDiaTab, renderInformesClienteTab, renderReportesGeneralesTab } from './views/operaciones'
import { renderReportes } from './views/reportes'

let activeMenu = 'Dashboard';
let activeSubMenu = '';
let activeInventoryTab = 'productos'; // Estado para el tab de inventario
let activeEntradasTab = 'movimientos'; // Estado para el tab de entradas y salidas
let activeLogisticaTab = 'clientes'; // Estado para el tab de logística
let activeFinanzasTab = 'dashboard'; // Estado para el tab de finanzas
let activeFacturacionTab = 'ordenes'; // Estado para el tab de facturación
let activeRecursosTab = 'asistencia'; // Estado para el tab de recursos humanos
let activeOperacionesTab = 'servicios'; // Estado para el tab de operaciones

const menuItems = [
  { name: 'Dashboard', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>', submenu: [] },
  { name: 'Almacén', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>', submenu: ['Mantenimiento', 'Inventario', 'Proveedores', 'Entradas y Salidas'] },
  { name: 'Logística', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5l3 3v5h-2m-4 0H2"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>', submenu: [] },
  { name: 'Programaciones', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', submenu: [] },
  { name: 'Comercial', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>', submenu: ['Prospectos', 'Cotizaciones', 'Órdenes de Servicio', 'Órdenes de Producto', 'Órdenes de Capacitación', 'Conversiones'] },
  { name: 'Finanzas', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>', submenu: [] },
  { name: 'Facturación', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>', submenu: [] },
  { name: 'Recursos Humanos', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', submenu: [] },
  { name: 'Operaciones', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path></svg>', submenu: [] },
  { name: 'Reportes', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>', submenu: [] }
];

function getMainContent() {
  if (activeMenu === 'Dashboard') {
    return renderDashboard();
  } else if (activeMenu === 'Almacén') {
    if (activeSubMenu === 'Inventario') return renderAlmacenInventario();
    if (activeSubMenu === 'Proveedores') return renderAlmacenProveedores();
    if (activeSubMenu === 'Entradas y Salidas') return renderAlmacenEntradasSalidas();
    return renderAlmacenMantenimiento(); // Mantenimiento por defecto
  } else if (activeMenu === 'Logística') {
    return renderLogistica();
  } else if (activeMenu === 'Programaciones') {
    return renderProgramaciones();
  } else if (activeMenu === 'Comercial') {
    if (activeSubMenu === 'Prospectos') return renderComercialProspectos();
    if (activeSubMenu === 'Cotizaciones') return renderComercialCotizaciones();
    if (activeSubMenu === 'Órdenes de Servicio') return renderComercialOrdenesServicio();
    if (activeSubMenu === 'Órdenes de Producto') return renderComercialOrdenesProducto();
    if (activeSubMenu === 'Órdenes de Capacitación') return renderComercialOrdenesCapacitacion();
    if (activeSubMenu === 'Conversiones') return renderComercialConversiones();
    return renderComercialProspectos(); // Prospectos por defecto
  } else if (activeMenu === 'Finanzas') {
    return renderFinanzas();
  } else if (activeMenu === 'Facturación') {
    return renderFacturacion();
  } else if (activeMenu === 'Recursos Humanos') {
    return renderRecursosHumanos();
  } else if (activeMenu === 'Operaciones') {
    return renderOperaciones();
  } else if (activeMenu === 'Reportes') {
    return renderReportes();
  } else {
    return `<div class="page-header"><h1>${activeMenu}</h1><p>Vista en desarrollo...</p></div>`;
  }
}

function renderApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;

  app.innerHTML = `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">QSCI Group</div>
          <div class="logo-subtitle">ADMIN PANEL</div>
        </div>
        
        <nav class="sidebar-nav">
          ${menuItems.map(item => `
            <div>
              <button class="nav-item ${activeMenu === item.name ? 'active' : ''}" data-menu="${item.name}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-text">${item.name}</span>
                ${item.submenu.length > 0 ? '<span class="nav-arrow">›</span>' : ''}
              </button>
              ${item.submenu.length > 0 && activeMenu === item.name ? `
                <div class="submenu">
                  ${item.submenu.map(sub => `
                    <button class="submenu-item ${activeSubMenu === sub ? 'active' : ''}" data-submenu="${sub}">
                      ${sub}
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <div class="support-section">
            <p class="support-title">Soporte Técnico</p>
            <p class="support-text">¿Necesitas ayuda con el sistema?</p>
            <button class="contact-btn">Contactar</button>
          </div>
          <button class="logout-btn" onclick="logout()" style="margin-top: 16px; width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span class="logout-text">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <div class="search-bar">
            <input type="text" placeholder="⌕ Buscar servicios, facturas o personal..." />
          </div>
          <div class="user-section">
            <button class="icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></button>
            <button class="icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button>
            <div class="user-profile" style="cursor: pointer;" onclick="logout()">
              <span>Admin Usuario</span>
              <div class="avatar">AU</div>
            </div>
          </div>
        </header>

        <div class="dashboard-content">
          ${getMainContent()}
        </div>
      </main>
    </div>
  `;


  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const menuName = target.dataset.menu || 'Dashboard';

      // Si haces clic en el mismo menú que ya está activo, lo cierra
      if (activeMenu === menuName) {
        activeMenu = 'Dashboard';
        activeSubMenu = '';
        renderApp();
        return;
      }

      activeMenu = menuName;
      activeSubMenu = '';
      renderApp();
    });
  });


  document.querySelectorAll('.submenu-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      activeSubMenu = target.dataset.submenu || '';
      activeInventoryTab = 'productos';
      renderApp();
    });
  });


  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const tabName = target.dataset.tab;

      if (tabName && activeMenu === 'Almacén' && activeSubMenu === 'Inventario') {
        activeInventoryTab = tabName;
        updateInventoryTabContent();
      }

      if (tabName && activeMenu === 'Almacén' && activeSubMenu === 'Entradas y Salidas') {
        activeEntradasTab = tabName;
        updateEntradasTabContent();
      }

      if (tabName && activeMenu === 'Logística') {
        activeLogisticaTab = tabName;
        updateLogisticaTabContent();
      }

      if (tabName && activeMenu === 'Finanzas') {
        activeFinanzasTab = tabName;
        updateFinanzasTabContent();
      }

      if (tabName && activeMenu === 'Facturación') {
        activeFacturacionTab = tabName;
        updateFacturacionTabContent();
      }

      if (tabName && activeMenu === 'Recursos Humanos') {
        activeRecursosTab = tabName;
        updateRecursosTabContent();
      }

      if (tabName && activeMenu === 'Operaciones') {
        activeOperacionesTab = tabName;
        updateOperacionesTabContent();
      }
    });
  });

  // Sidebar hover para empujar el contenido
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');

  if (sidebar && mainContent) {
    sidebar.addEventListener('mouseenter', () => {
      mainContent.classList.add('sidebar-expanded');
    });

    sidebar.addEventListener('mouseleave', () => {
      mainContent.classList.remove('sidebar-expanded');
    });
  }

  // Inicializar eventos del módulo de Programaciones
  if (activeMenu === 'Programaciones') {
    initProgramacionesEvents();
  }
}


function updateInventoryTabContent() {
  const tabContent = document.querySelector('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!tabContent) return;

  tabButtons.forEach(btn => {
    const target = btn as HTMLButtonElement;
    if (target.dataset.tab === activeInventoryTab) {
      target.classList.add('active');
    } else {
      target.classList.remove('active');
    }
  });


  switch (activeInventoryTab) {
    case 'kardex':
      tabContent.innerHTML = renderKardexTab();
      break;
    case 'categorias':
      tabContent.innerHTML = renderCategoriasTab();
      break;
    default:
      tabContent.innerHTML = renderProductosTab();
  }
}


function updateEntradasTabContent() {
  const tabContent = document.querySelector('#entradas-tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!tabContent) return;


  tabButtons.forEach(btn => {
    const target = btn as HTMLButtonElement;
    if (target.dataset.tab === activeEntradasTab) {
      target.classList.add('active');
    } else {
      target.classList.remove('active');
    }
  });

  switch (activeEntradasTab) {
    case 'prestamo':
      tabContent.innerHTML = renderPrestamoEPPTab();
      break;
    case 'transferencias':
      tabContent.innerHTML = renderTransferenciasTab();
      break;
    default:
      tabContent.innerHTML = renderMovimientosTab();
  }
}


function updateLogisticaTabContent() {
  const tabContent = document.querySelector('#logistica-tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!tabContent) return;


  tabButtons.forEach(btn => {
    const target = btn as HTMLButtonElement;
    if (target.dataset.tab === activeLogisticaTab) {
      target.classList.add('active');
    } else {
      target.classList.remove('active');
    }
  });


  switch (activeLogisticaTab) {
    case 'servicios':
      tabContent.innerHTML = renderServiciosDisponiblesTab();
      break;
    case 'rutas':
      tabContent.innerHTML = renderRutasTab();
      break;
    default:
      tabContent.innerHTML = renderClientesTab();
  }
}


function updateFinanzasTabContent() {
  const tabContent = document.querySelector('#finanzas-tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!tabContent) return;


  tabButtons.forEach(btn => {
    const target = btn as HTMLButtonElement;
    if (target.dataset.tab === activeFinanzasTab) {
      target.classList.add('active');
    } else {
      target.classList.remove('active');
    }
  });


  switch (activeFinanzasTab) {
    case 'caja':
      tabContent.innerHTML = renderCajaChicaTab();
      break;
    case 'reportes':
      tabContent.innerHTML = renderReportesFinancierosTab();
      break;
    default:
      tabContent.innerHTML = renderDashboardFinancieroTab();
  }
}


function updateFacturacionTabContent() {
  const tabContent = document.querySelector('#facturacion-tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!tabContent) return;


  tabButtons.forEach(btn => {
    const target = btn as HTMLButtonElement;
    if (target.dataset.tab === activeFacturacionTab) {
      target.classList.add('active');
    } else {
      target.classList.remove('active');
    }
  });

  // Actualizar contenido según el tab activo
  switch (activeFacturacionTab) {
    case 'contratos':
      tabContent.innerHTML = renderContratosFijosTab();
      break;
    case 'cobranza':
      tabContent.innerHTML = renderEstadoCobranzaTab();
      break;
    default:
      tabContent.innerHTML = renderOrdenesProyectadasTab();
  }
}


function updateRecursosTabContent() {
  const tabContent = document.querySelector('#recursos-tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!tabContent) return;


  tabButtons.forEach(btn => {
    const target = btn as HTMLButtonElement;
    if (target.dataset.tab === activeRecursosTab) {
      target.classList.add('active');
    } else {
      target.classList.remove('active');
    }
  });


  switch (activeRecursosTab) {
    case 'empleados':
      tabContent.innerHTML = renderEmpleadosTab();
      break;
    case 'reportes':
      tabContent.innerHTML = renderReportesTab();
      break;
    default:
      tabContent.innerHTML = renderAsistenciaTab();
  }
}


function updateOperacionesTabContent() {
  const tabContent = document.querySelector('#operaciones-tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!tabContent) return;


  tabButtons.forEach(btn => {
    const target = btn as HTMLButtonElement;
    if (target.dataset.tab === activeOperacionesTab) {
      target.classList.add('active');
    } else {
      target.classList.remove('active');
    }
  });


  switch (activeOperacionesTab) {
    case 'informes':
      tabContent.innerHTML = renderInformesClienteTab();
      break;
    case 'reportes':
      tabContent.innerHTML = renderReportesGeneralesTab();
      break;
    default:
      tabContent.innerHTML = renderServiciosDiaTab();
  }
}

renderApp();
