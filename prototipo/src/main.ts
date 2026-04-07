import './style.css'
import './additional-styles.css'
import { initAuthGuard, tieneAccesoModulo } from './modules/auth/auth.guard'
import { authService } from './modules/auth/auth.service'

// Inicializar guard de autenticación
initAuthGuard();
import { renderDashboard, cargarAlertaStockBajo, cargarAlertaMantenimiento, cargarAlertaCotizacionesSinOrden } from './modules/dashboard/dashboard.view'
import { renderProgramacionServicio, initProgramacionServicioEvents } from './modules/programaciones/programacion-servicio/programacion-servicio.view'
import { renderProgramacionCapacitacionAsesoria, initProgramacionCapacitacionAsesoriaEvents } from './modules/programaciones/programacion-capacitacion-asesoria/programacion-capacitacion-asesoria.view'
import { renderRecursosHumanos, renderAsistenciaTab, renderMarcarAsistenciaTab, cargarMarcarAsistencia, cargarAsistenciaAdmin, renderEmpleadosTab, renderReportesTab, renderHorariosTab, cargarHorarios } from './modules/recursos-humanos/recursos-humanos.view'
import { renderTecnicosTab, cargarTecnicos } from './modules/recursos-humanos/tecnicos.view'
// Almacén
import { renderAlmacenMantenimiento, initMantenimientoEvents } from './modules/almacen/mantenimiento/mantenimiento.view'
import { renderAlmacenInventario, renderProductosTab, renderKardexTab, renderAjustesInventarioTab, renderCategoriasTab, initProductosEvents, initCategoriasEvents, initKardexEvents, initAjustesInventarioEvents } from './modules/almacen/inventario/inventario.view'
import { renderAlmacenProveedores, initProveedoresEvents } from './modules/almacen/proveedores/proveedores.view'
import { renderAlmacenCompras, initComprasEvents } from './modules/almacen/compras/compras.view'
import { renderAlmacenEntradasSalidas, renderMovimientosTab, renderPrestamoEPPTab, renderTransferenciasTab } from './modules/almacen/entradas-salidas/entradas-salidas.view'
import { renderEntregaEpp, initEntregaEppEvents } from './modules/almacen/entrega-epp/entrega-epp.view'
import { renderSalidasProgramacion, initSalidasProgramacion } from './modules/almacen/salidas-programacion/salidas-programacion.view'
import { renderAlmacenVehiculos, initVehiculosEvents } from './modules/almacen/vehiculos/vehiculos.view'
// Servicios - Clientes
import { renderLogistica, renderClientesTab, renderServiciosDisponiblesTab, renderRutasTab, initClientesLogisticaEvents, initServiciosTabEvents } from './modules/logistica/logistica.view'
// Comercial
import { renderComercialProspectos, initProspectosEvents } from './modules/comercial/prospectos/prospectos.view'
import { renderComercialCotizaciones, initCotizacionesEvents } from './modules/comercial/cotizaciones/cotizaciones.view'
import { renderComercialOrdenesServicio, initOrdenesServicioEvents } from './modules/comercial/ordenes-servicio/ordenes-servicio.view'
import { renderComercialOrdenesProducto, initOrdenesProductoEvents } from './modules/comercial/ordenes-producto/ordenes-producto.view'
import { renderComercialOrdenesCapacitacion, initOrdenesCapacitacionEvents } from './modules/comercial/ordenes-capacitacion/ordenes-capacitacion.view'
import { renderComercialOrdenesAsesoria, initOrdenesAsesoriaEvents } from './modules/comercial/ordenes-asesoria/ordenes-asesoria.view'
import { renderComercialConversiones } from './modules/comercial/conversiones/conversiones.view'
import { renderAprobacionCotizaciones, initAprobacionCotizacionesEvents } from './modules/comercial/aprobacion-cotizaciones/aprobacion-cotizaciones.view'
import './modules/comercial/aprobacion-cotizaciones/aprobacion-cotizaciones.css'
import { renderComercialExponentes, initExponentesEvents } from './modules/comercial/exponentes/exponentes.view'
// Finanzas
import { renderFinanzas, renderDashboardFinancieroTab, renderCajaChicaTab, renderReportesFinancierosTab } from './modules/finanzas/finanzas.view'
// Facturación
import { renderFacturacion, renderOrdenesProyectadasTab, renderContratosFijosTab, renderEstadoCobranzaTab, initFacturacionEvents } from './modules/facturacion/facturacion.view'
// Operaciones
import { renderOperaciones, renderServiciosDiaTab, renderInformesClienteTab, renderReportesGeneralesTab } from './modules/operaciones/operaciones.view'
// Reportes
import { renderReportes } from './modules/reportes/reportes.view'
// Usuarios
import { renderUsuarios, initUsuariosEvents } from './modules/usuarios/usuarios.view'

let activeMenu = 'Dashboard';
let activeSubMenu = '';
let expandedMenu = ''; // Controla qué menú con submenús está expandido (sin navegar)
let activeInventoryTab = 'productos'; // Estado para el tab de inventario
let activeEntradasTab = 'movimientos'; // Estado para el tab de entradas y salidas
let activeLogisticaTab = 'clientes'; // Estado para el tab de Servicios - Clientes
let activeFinanzasTab = 'dashboard'; // Estado para el tab de finanzas
let activeFacturacionTab = 'ordenes'; // Estado para el tab de facturación
let activeRecursosTab = 'asistencia'; // Estado para el tab de recursos humanos
let activeOperacionesTab = 'servicios'; // Estado para el tab de operaciones
let misProyecciones: any[] = []; // Lista de proyecciones para facturación

/**
 * Mapa: nombre de menú → permiso(s) requeridos.
 * Si al menos uno de los permisos del array coincide, se muestra el menú.
 * 'dashboard' y 'marcar-asistencia' son accesibles para todos.
 */
const MENU_PERMISOS: Record<string, string[]> = {
  'Dashboard':         ['dashboard'],
  'Almacén':           ['inventario', 'entradas-salidas'],
  'Servicios - Clientes':         ['logistica'],
  'Programaciones':    ['programaciones'],
  'Comercial':         ['prospectos', 'cotizaciones', 'ods', 'odp', 'servicios'],
  'Finanzas':          ['cotizaciones'],  // Finanzas ve cotizaciones
  'Facturación':       ['cotizaciones'],
  'Recursos Humanos':  ['rrhh-asistencia', 'rrhh-empleados', 'rrhh-tecnicos', 'rrhh-reportes', 'marcar-asistencia'],
  'Operaciones':       ['ods', 'odp', 'servicios'],
  'Reportes':          ['dashboard'],  // Todos con dashboard ven reportes
  'Usuarios':          ['usuarios'],
};

const SUBMENU_PERMISOS: Record<string, string[]> = {
  'Programaciones::Programación Servicio': ['programaciones-servicio', 'programaciones'],
  'Programaciones::Programación Capacitación/Asesoría': ['programaciones-capacitacion-asesoria', 'programaciones'],
};

function filtrarMenuPorPermisos(items: typeof menuItems): typeof menuItems {
  return items.filter(item => {
    const permisosRequeridos = MENU_PERMISOS[item.name];
    if (!permisosRequeridos) return true; // Si no está en el mapa, mostrar
    return permisosRequeridos.some(p => tieneAccesoModulo(p));
  });
}

function filtrarSubmenuPorPermisos(menuName: string, submenuItems: string[]): string[] {
  return submenuItems.filter((sub) => {
    const key = `${menuName}::${sub}`;
    const permisosRequeridos = SUBMENU_PERMISOS[key];
    if (!permisosRequeridos) return true;
    return permisosRequeridos.some((p) => tieneAccesoModulo(p));
  });
}

const menuItems = [
  { name: 'Dashboard', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>', submenu: [] },
  { name: 'Almacén', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>', submenu: ['Mantenimiento', 'Inventario', 'Ajuste de Inventario', 'Proveedores', 'Órdenes de Compra', 'Entradas y Salidas', 'Entrega EPP', 'Gestión de Vehículos', 'Salidas Programación'] },
  { name: 'Servicios - Clientes', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5l3 3v5h-2m-4 0H2"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>', submenu: [] },
  { name: 'Programaciones', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', submenu: ['Programación Servicio', 'Programación Capacitación/Asesoría'] },
  { name: 'Comercial', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>', submenu: ['Clientes Potenciales', 'Cotizaciones', 'Aprobación Cotizaciones', 'Órdenes de Servicio', 'Órdenes de Producto', 'Órdenes de Capacitación', 'Órdenes de Asesoría', 'Exponentes', 'Conversiones'] },
  { name: 'Finanzas', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>', submenu: [] },
  { name: 'Facturación', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>', submenu: [] },
  { name: 'Recursos Humanos', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', submenu: [] },
  { name: 'Operaciones', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path></svg>', submenu: [] },
  { name: 'Reportes', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>', submenu: [] },
  { name: 'Usuarios', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>', submenu: [] }
];

function getMainContent() {
  if (activeMenu === 'Dashboard') {
    // Cargar alerta de stock bajo después de que el DOM se renderice
    setTimeout(() => { cargarAlertaStockBajo(); cargarAlertaMantenimiento(); cargarAlertaCotizacionesSinOrden(); }, 0);
    return renderDashboard();
  } else if (activeMenu === 'Almacén') {
    if (activeSubMenu === 'Inventario') return renderAlmacenInventario();
    if (activeSubMenu === 'Ajuste de Inventario') return renderAjustesInventarioTab();
    if (activeSubMenu === 'Proveedores') return renderAlmacenProveedores();
    if (activeSubMenu === 'Órdenes de Compra') return renderAlmacenCompras();
    if (activeSubMenu === 'Entradas y Salidas') return renderAlmacenEntradasSalidas();
    if (activeSubMenu === 'Entrega EPP') return renderEntregaEpp();
    if (activeSubMenu === 'Gestión de Vehículos') return renderAlmacenVehiculos();
    if (activeSubMenu === 'Salidas Programación') {
      const html = renderSalidasProgramacion();
      setTimeout(() => initSalidasProgramacion(), 0);
      return html;
    }
    return renderAlmacenMantenimiento(); // Mantenimiento por defecto (con tabs)
  } else if (activeMenu === 'Servicios - Clientes') {
    const html = renderLogistica();
    setTimeout(() => initClientesLogisticaEvents(), 0);
    return html;
  } else if (activeMenu === 'Programaciones') {
    if (activeSubMenu === 'Programación Capacitación/Asesoría') {
      return renderProgramacionCapacitacionAsesoria();
    }
    return renderProgramacionServicio();
  } else if (activeMenu === 'Comercial') {
    if (activeSubMenu === 'Clientes Potenciales') {
      const html = renderComercialProspectos();
      setTimeout(() => initProspectosEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Cotizaciones') {
      const html = renderComercialCotizaciones();
      setTimeout(() => initCotizacionesEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Aprobación Cotizaciones') {
      const html = renderAprobacionCotizaciones();
      setTimeout(() => initAprobacionCotizacionesEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Órdenes de Servicio') {
      const html = renderComercialOrdenesServicio();
      setTimeout(() => initOrdenesServicioEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Órdenes de Producto') {
      const html = renderComercialOrdenesProducto();
      setTimeout(() => initOrdenesProductoEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Órdenes de Capacitación') {
      const html = renderComercialOrdenesCapacitacion();
      setTimeout(() => initOrdenesCapacitacionEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Órdenes de Asesoría') {
      const html = renderComercialOrdenesAsesoria();
      setTimeout(() => initOrdenesAsesoriaEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Exponentes') {
      const html = renderComercialExponentes();
      setTimeout(() => initExponentesEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Conversiones') return renderComercialConversiones();
    const html = renderComercialProspectos(); // Prospectos por defecto
    setTimeout(() => initProspectosEvents(), 0);
    return html;
  } else if (activeMenu === 'Finanzas') {
    return renderFinanzas();
  } else if (activeMenu === 'Facturación') {
    // Lógica de submenús de Facturación integrada aquí para evitar "Unreachable code"
    if (activeSubMenu === 'Contratos') return renderContratosFijosTab();
    if (activeSubMenu === 'Cobranza') return renderEstadoCobranzaTab();
    // Por defecto muestra la tabla con los datos
    return renderFacturacion(misProyecciones);
  } else if (activeMenu === 'Recursos Humanos') {
    return renderRecursosHumanos();
  } else if (activeMenu === 'Operaciones') {
    return renderOperaciones();
  } else if (activeMenu === 'Reportes') {
    return renderReportes();
  } else if (activeMenu === 'Usuarios') {
    const html = renderUsuarios();
    setTimeout(() => initUsuariosEvents(), 0);
    return html;
  } else {
    return `<div class="page-header"><h1>${activeMenu}</h1><p>Vista en desarrollo...</p></div>`;
  }
}

function renderApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const currentUser = authService.getUser();
  const userName = currentUser?.nombre || 'Usuario';
  const userRole = currentUser?.rol || 'Sin rol';
  const userInitials = userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const visibleMenuItems = filtrarMenuPorPermisos(menuItems).map((item) => ({
    ...item,
    submenu: filtrarSubmenuPorPermisos(item.name, item.submenu),
  }));

  app.innerHTML = `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar${expandedMenu ? ' sidebar-expanded' : ''}">
        <div class="sidebar-header">
          <div class="logo">QSCI Group</div>
          <div class="logo-subtitle">ADMIN PANEL</div>
        </div>
        
        <nav class="sidebar-nav">
          ${visibleMenuItems.map(item => `
            <div>
              <button class="nav-item ${activeMenu === item.name || expandedMenu === item.name ? 'active' : ''}" data-menu="${item.name}" data-has-submenu="${item.submenu.length > 0}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-text">${item.name}</span>
                ${item.submenu.length > 0 ? `<span class="nav-arrow" style="transition:transform 0.3s;${expandedMenu === item.name ? 'transform:rotate(90deg);' : ''}">›</span>` : ''}
              </button>
              ${item.submenu.length > 0 && expandedMenu === item.name ? `
                <div class="submenu" style="overflow:hidden;animation:submenuSlideDown 0.25s ease-out;">
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
            <p class="support-title" style="font-weight: 600;">${userName}</p>
            <p class="support-text" style="font-size: 11px; opacity: 0.8;">${userRole}</p>
            <button class="contact-btn">Soporte</button>
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
          <div class="user-section">
            <div class="user-profile" style="cursor: pointer;" onclick="logout()">
              <span>${userName}</span>
              <div class="avatar">${userInitials}</div>
            </div>
          </div>
        </header>

        <div class="dashboard-content">
          ${getMainContent()}
        </div>
      </main>
    </div>
  `;
  // Al final de tu función renderApp() o donde inicializas otros eventos:
if (activeMenu === 'Facturación') {
  initFacturacionEvents(misProyecciones);
}

  // Sidebar: colapsar submenús al retirar el cursor
  const sidebarEl = document.querySelector('.sidebar');
  if (sidebarEl) {
    sidebarEl.addEventListener('mouseleave', () => {
      if (expandedMenu) {
        expandedMenu = '';
        renderApp();
      }
    });
  }


  document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const target = e.currentTarget as HTMLButtonElement;
    const menuName = target.dataset.menu || 'Dashboard';
    const hasSubmenu = target.dataset.hasSubmenu === 'true';

    // Si tiene submenú, solo expandir/colapsar sin navegar
    if (hasSubmenu) {
      if (expandedMenu === menuName) {
        // Ya está expandido → colapsar
        expandedMenu = '';
      } else {
        // Expandir este menú
        expandedMenu = menuName;
      }
      renderApp();
      return;
    }

    // Menús sin submenú → navegar directamente
    activeMenu = menuName;
    activeSubMenu = '';
    expandedMenu = '';

    // SOLO si es Facturación, traemos la data real
    if (menuName === 'Facturación') {
      try {
        const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
        const respuesta = await fetch('http://localhost:8000/api/v1/proyecciones', {
          headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        }); 
        const result = await respuesta.json();
        
        const rawData = result.data || result; 
        misProyecciones = Array.isArray(rawData) ? rawData : [];
        
        console.log("Proyecciones reales cargadas:", misProyecciones);
      } catch (error) {
        console.error("Error cargando proyecciones:", error);
        misProyecciones = [];
      }
    }

    renderApp();
  });
});


  document.querySelectorAll('.submenu-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const submenuName = target.dataset.submenu || '';

      // Determinar a qué menú padre pertenece este submenú
      activeMenu = expandedMenu;
      activeSubMenu = submenuName;
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

      if (tabName && activeMenu === 'Servicios - Clientes') {
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

  // Inicializar eventos del módulo de Asistencia Admin (RRHH)
  if (activeMenu === 'Recursos Humanos' && activeRecursosTab === 'asistencia') {
    setTimeout(() => cargarAsistenciaAdmin(), 0);
  }

  // Inicializar eventos del módulo de Programaciones
  if (activeMenu === 'Programaciones') {
    if (activeSubMenu === 'Programación Capacitación/Asesoría') {
      initProgramacionCapacitacionAsesoriaEvents();
    } else {
      initProgramacionServicioEvents();
    }
  }

  // Inicializar eventos del módulo de Inventario - Productos
  if (activeMenu === 'Almacén' && activeSubMenu === 'Inventario' && activeInventoryTab === 'productos') {
    setTimeout(() => initProductosEvents(), 0);
  }

  // Inicializar eventos del módulo Ajuste de Inventario (submódulo propio)
  if (activeMenu === 'Almacén' && activeSubMenu === 'Ajuste de Inventario') {
    setTimeout(() => initAjustesInventarioEvents(), 0);
  }

  // Inicializar eventos del módulo de Mantenimiento (tabs)
  if (activeMenu === 'Almacén' && (!activeSubMenu || activeSubMenu === 'Mantenimiento')) {
    setTimeout(() => initMantenimientoEvents(), 0);
  }

  // Inicializar eventos del módulo de Entrega EPP
  if (activeMenu === 'Almacén' && activeSubMenu === 'Entrega EPP') {
    setTimeout(() => initEntregaEppEvents(), 0);
  }

  // Inicializar eventos de Proveedores
  if (activeMenu === 'Almacén' && activeSubMenu === 'Proveedores') {
    setTimeout(() => initProveedoresEvents(), 0);
  }

  // Inicializar eventos de Órdenes de Compra
  if (activeMenu === 'Almacén' && activeSubMenu === 'Órdenes de Compra') {
    setTimeout(() => initComprasEvents(), 0);
  }

  // Inicializar eventos de Gestión de Vehículos
  if (activeMenu === 'Almacén' && activeSubMenu === 'Gestión de Vehículos') {
    setTimeout(() => initVehiculosEvents(), 0);
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
      setTimeout(() => initKardexEvents(), 0);
      break;
    case 'categorias':
      tabContent.innerHTML = renderCategoriasTab();
      setTimeout(() => initCategoriasEvents(), 0);
      break;
    default:
      tabContent.innerHTML = renderProductosTab();
      // Inicializar eventos para cargar datos dinámicos
      setTimeout(() => initProductosEvents(), 0);
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
      setTimeout(() => initServiciosTabEvents(), 0);
      break;
    case 'rutas':
      tabContent.innerHTML = renderRutasTab();
      break;
    default:
      tabContent.innerHTML = renderClientesTab();
      setTimeout(() => initClientesLogisticaEvents(), 0);
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
      // facturación por defecto
      tabContent.innerHTML = renderOrdenesProyectadasTab(misProyecciones);
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
    case 'marcar':
      tabContent.innerHTML = renderMarcarAsistenciaTab();
      break;
    case 'horarios':
      tabContent.innerHTML = renderHorariosTab();
      break;
    case 'empleados':
      tabContent.innerHTML = renderEmpleadosTab();
      break;
    case 'tecnicos':
      tabContent.innerHTML = renderTecnicosTab();
      break;
    case 'reportes':
      tabContent.innerHTML = renderReportesTab();
      break;
    default:
      tabContent.innerHTML = renderAsistenciaTab();
  }
  
  // Inicializar event listeners para Marcar Asistencia
  if (activeRecursosTab === 'marcar') {
    cargarMarcarAsistencia();
  }

  // Cargar asistencia admin
  if (activeRecursosTab === 'asistencia') {
    cargarAsistenciaAdmin();
  }

  // Cargar datos de horarios
  if (activeRecursosTab === 'horarios') {
    cargarHorarios();
  }

  if (activeRecursosTab === 'tecnicos') {
    cargarTecnicos();
  }
}

function initMarcarAsistenciaEvents() {
  // Los eventos ahora se manejan dentro de cargarMarcarAsistencia()
  // Esta función queda vacía por compatibilidad
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

function logout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    authService.logout();
  }
}

(window as any).logout = logout;

renderApp();
