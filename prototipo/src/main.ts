import './style.css'
import './additional-styles.css'
import { initAuthGuard, tieneAccesoModulo } from './modules/auth/auth.guard'
import { authService } from './modules/auth/auth.service'
const LOGO_URL = "https://backend.qsci-system.com/images/menu.png";

// Inicializar guard de autenticación
initAuthGuard();
import { renderDashboard, initDashboardEvents } from './modules/dashboard/dashboard.view'
import { renderDashboardProgramacionServicio, initDashboardProgramacionServicioEvents } from './modules/programaciones/programacion-servicio/dashboard-programacion-servicio.view'
import { renderProgramacionServicio, initProgramacionServicioEvents } from './modules/programaciones/programacion-servicio/programacion-servicio.view'
import { renderProgramacionCapacitacionAsesoria, initProgramacionCapacitacionAsesoriaEvents } from './modules/programaciones/programacion-capacitacion-asesoria/programacion-capacitacion-asesoria.view'
import { renderRecursosHumanos, renderAsistenciaTab, renderAsistenciaPersonalTab, renderMarcarAsistenciaTab, cargarMarcarAsistencia, cargarAsistenciaAdmin, cargarAsistenciaPersonal, renderReportesTab, renderHorariosTab, cargarHorarios, getTabsRecursosHumanosPermitidos, tieneAccesoCompletoRecursosHumanos, cargarReportesRRHH, renderServiciosTecnicosTab, cargarReporteServiciosTecnicos } from './modules/recursos-humanos/recursos-humanos.view'
import { renderTecnicosTab, cargarTecnicos } from './modules/recursos-humanos/tecnicos.view'
// Almacén
import { renderAlmacenMantenimiento, initMantenimientoEvents } from './modules/almacen/mantenimiento/mantenimiento.view'
import { renderAlmacenInventario, renderProductosTab, renderKardexTab, renderAjustesInventarioTab, renderCategoriasTab, initProductosEvents, initCategoriasEvents, initKardexEvents, initAjustesInventarioEvents } from './modules/almacen/inventario/inventario.view'
import { renderAlmacenProveedores, initProveedoresEvents } from './modules/almacen/proveedores/proveedores.view'
import { renderAlmacenCompras, initComprasEvents } from './modules/almacen/compras/compras.view'
import { renderAlmacenDashboard, initAlmacenDashboardEvents } from './modules/almacen/dashboard-almacen.view'
import { renderEntregaEpp, initEntregaEppEvents } from './modules/almacen/entrega-epp/entrega-epp.view'
import { renderSalidasProgramacion, initSalidasProgramacion } from './modules/almacen/salidas-programacion/salidas-programacion.view'
import { renderSalidasProductos, initSalidasProductos } from './modules/almacen/salidas-productos/salidas-productos.view'
import { renderOrdenesFabricacion, initOrdenesFabricacion } from './modules/almacen/ordenes-fabricacion/ordenes-fabricacion.view'
import { renderAlmacenVehiculos, initVehiculosEvents } from './modules/almacen/vehiculos/vehiculos.view'
// Servicios - Clientes
import { renderLogistica, renderClientesTab, renderServiciosDisponiblesTab, renderMuestreoClientesTab, initClientesLogisticaEvents, initServiciosTabEvents, initMuestreoClientesEvents } from './modules/logistica/logistica.view'
// Comercial
import { renderComercialProspectos, initProspectosEvents } from './modules/comercial/prospectos/prospectos.view'
import { renderComercialCotizaciones, initCotizacionesEvents } from './modules/comercial/cotizaciones/cotizaciones.view'
import { renderComercialOrdenesServicio, initOrdenesServicioEvents } from './modules/comercial/ordenes-servicio/ordenes-servicio.view'
import { renderComercialOrdenesProducto, initOrdenesProductoEvents } from './modules/comercial/ordenes-producto/ordenes-producto.view'
import { renderComercialOrdenesCapacitacion, initOrdenesCapacitacionEvents } from './modules/comercial/ordenes-capacitacion/ordenes-capacitacion.view'
import { renderComercialOrdenesAsesoria, initOrdenesAsesoriaEvents } from './modules/comercial/ordenes-asesoria/ordenes-asesoria.view'
import { renderComercialOrdenesAuditoria, initOrdenesAuditoriaEvents } from './modules/comercial/ordenes-auditoria/ordenes-auditoria.view'
import { renderAprobacionCotizaciones, initAprobacionCotizacionesEvents } from './modules/comercial/aprobacion-cotizaciones/aprobacion-cotizaciones.view'
import './modules/comercial/aprobacion-cotizaciones/aprobacion-cotizaciones.css'
import { renderComercialExponentes, initExponentesEvents } from './modules/comercial/exponentes/exponentes.view'
import { renderComercialDashboard, initComercialDashboardEvents } from './modules/comercial/dashboard-comercial.view'
// Finanzas
import { renderFinanzas, renderDashboardFinancieroTab, renderReportesFinancierosTab } from './modules/finanzas/finanzas.view'
import { renderCajaChica, initCajaChicaEvents } from './modules/finanzas/caja-chica.view'
import { renderEstadoCuenta, initEstadoCuentaEvents } from './modules/finanzas/estado-cuenta.view'
// Facturación
import { renderFacturacion, renderOrdenesProyectadasTab, renderContratosFijosTab, renderEstadoCobranzaTab, initFacturacionEvents } from './modules/facturacion/facturacion.view'
// Operaciones
import {
  renderOperaciones,
  renderServiciosDiaTab,
  renderCrearInformeTab,
  renderHistorialInformesTab,
  mapServiciosRealizadosCards,
  renderServiciosRealizadosCards,
  mapServiciosPorClienteMes,
  renderServiciosPorClienteMes,
  renderVisitaDetail,
  renderServicioImagenesModal,
  renderFichaOperacionalModal,
  renderFormatoOperacionalModal,
  initInformesClienteEvents,
  initCrearInformeEvents,
  initHistorialInformesEvents,
  abrirModalCrearInforme,
  type ClienteMesGroup,
  type FichaOperacionalViewModel,
  type FormatoOperacionalViewModel,
  type ServicioRealizadoCardViewModel,
} from './modules/operaciones/operaciones.view'
import { programacionServicioService } from './modules/programaciones/programacion-servicio/programacion-servicio.service'
import type { Programacion } from './modules/programaciones/programaciones.types'
// Investigación
import { renderInvestigacion } from './modules/investigacion/investigacion.view'
// Usuarios
import { renderUsuarios, initUsuariosEvents } from './modules/usuarios/usuarios.view'

let activeMenu = 'Dashboard';
let activeSubMenu = '';
let expandedMenu = ''; // Controla qué menú con submenús está expandido (sin navegar)
let activeInventoryTab = 'productos'; // Estado para el tab de inventario
let activeLogisticaTab = 'clientes'; // Estado para el tab de Servicios - Clientes
let activeFinanzasTab = 'caja'; // Estado para el tab de finanzas
let activeFacturacionTab = 'ordenes'; // Estado para el tab de facturación
let mesActual = new Date().getMonth() + 1; // 1-12 (mayo = 5)
let anioActual = new Date().getFullYear(); // 2026
let activeRecursosTab = 'asistencia'; // Estado para el tab de recursos humanos
let activeOperacionesTab = 'servicios'; // Estado para el tab de operaciones
let misProyecciones: any[] = []; // Lista de proyecciones para facturación
let misEmpresas: any[] = []; // Lista de empresas para facturación
let misOrdenesPendientes: any[] = []; // Órdenes pendientes para facturación

// Exponer variables globales para acceso desde otros módulos
(window as any).mesActual = mesActual;
(window as any).anioActual = anioActual;
(window as any).misProyecciones = [];
(window as any).misEmpresas = [];
(window as any).misOrdenesPendientes = [];
let sidebarForceCollapsed = false;
let operacionesRealizadosCardsCache = new Map<string, ServicioRealizadoCardViewModel>();
let operacionesGroupsCache: any[] = [];

type FichaOperacionalApiData = {
  id?: number | null;
  estado?: string | null;
  cliente?: string | null;
  direccion?: string | null;
  fecha?: string | null;
  hora_llegada?: string | null;
  hora_inicio?: string | null;
  hora_final?: string | null;
  giro?: string | null;
  diagnostico?: string | null;
  condicion_sanitaria?: string | null;
  areas_tratadas?: unknown;
  actividades_realizadas?: unknown;
  equipos?: unknown;
  acciones_correctivas?: string | null;
  recomendaciones?: string | null;
  firmas?: unknown;
  observaciones?: string | null;
  insumos_utilizados?: unknown;
  correlativo?: string | null;
};

type FormatoOperacionalApiData = {
  codigo_documento?: string | null;
  version?: string | null;
  cliente?: string | null;
  direccion?: string | null;
  fecha?: string | null;
  hora_llegada?: string | null;
  hora_inicio?: string | null;
  hora_final?: string | null;
  observaciones?: string | null;
  secciones?: Array<{
    tipo?: string | null;
    titulo?: string | null;
    cantidad?: number | null;
    items?: Array<{
      codigo_caja?: string | null;
      ubicacion?: string | null;
      estado_dispositivo?: string | null;
      estado_dispositivo_verdadera?: string | null;
      estado_dispositivo_auditiva?: string | null;
      hallazgo?: string | null;
      hallazgo_verdadera?: string | null;
      hallazgo_auditiva?: string | null;
      senales_presencia?: string | null;
      senales_presencia_verdadera?: string | null;
      senales_presencia_auditiva?: string | null;
      conteo_insectos?: Record<string, { verdadera?: number | null; auditiva?: number | null }> | null;
      estado_lamina?: string | null;
      estadio?: string | null;
      conteo_estadio_verdadera?: number | null;
      conteo_estadio_falsa?: number | null;
      numero_lote?: string | null;
    }>;
  }>;
  correlativo?: string | null;
  correlativo_documento?: string | null;
  numero_documento?: string | null;
};

declare global {
  interface Window {
    navigateToModule?: (menuName: string, submenuName?: string, options?: { collapseSidebar?: boolean }) => void;
  }
}

/**
 * Mapa: nombre de menú → permiso(s) requeridos.
 * Si al menos uno de los permisos del array coincide, se muestra el menú.
 * 'dashboard' y 'marcar-asistencia' son accesibles para todos.
 */
const MENU_PERMISOS: Record<string, string[]> = {
  'Dashboard': ['dashboard'],
  'Almacén': ['inventario', 'entradas-salidas'],
  'Servicios - Clientes': ['logistica'],
  'Programaciones': ['programaciones'],
  'Comercial': ['prospectos', 'cotizaciones', 'ods', 'odp', 'servicios'],
  'Finanzas': ['finanzas'],
  'Facturación': ['finanzas'],
  'Recursos Humanos': ['rrhh-asistencia', 'rrhh-tecnicos', 'rrhh-reportes', 'marcar-asistencia'],
  'Operaciones': ['ods', 'odp', 'servicios', 'operaciones'],
  'Investigación': ['reportes', 'investigacion', 'dashboard'], // Todos con reporte o investigacion o dashboard lo ven (temporalmente para no romper)
  'Usuarios': ['usuarios'],
};

const SUBMENU_PERMISOS: Record<string, string[]> = {
  'Programaciones::Dashboard Servicio': ['programaciones-servicio', 'programaciones'],
  'Programaciones::Programación Servicio': ['programaciones-servicio', 'programaciones'],
  'Programaciones::Programación Capacitación/Asesoría': ['programaciones-capacitacion-asesoria', 'programaciones'],
};

function esUsuarioGerencia(): boolean {
  const user = authService.getUser();
  const rol = (user?.rol || '').toLowerCase();
  const permisos = Array.isArray(user?.permisos) ? user.permisos : [];

  return rol.includes('geren') || permisos.includes('*') || tieneAccesoModulo('*');
}

function getRutaInicialPorPerfil(): { menu: string; subMenu: string } {
  if (esUsuarioGerencia()) {
    return { menu: 'Dashboard', subMenu: '' };
  }

  function navigateToModule(menuName: string, submenuName = '', options?: { collapseSidebar?: boolean }): void {
    activeMenu = menuName;
    activeSubMenu = submenuName;
    sidebarForceCollapsed = Boolean(options?.collapseSidebar);
    expandedMenu = sidebarForceCollapsed ? '' : (submenuName ? menuName : '');

    if (menuName === 'Dashboard' && !esUsuarioGerencia()) {
      const ruta = getRutaInicialPorPerfil();
      activeMenu = ruta.menu;
      activeSubMenu = ruta.subMenu;
      sidebarForceCollapsed = false;
      expandedMenu = '';
    }

    renderApp();
  }

  window.navigateToModule = navigateToModule;

  const tieneAccesoComercial = [
    'prospectos',
    'cotizaciones',
    'ods',
    'odp',
    'servicios',
  ].some((permiso) => tieneAccesoModulo(permiso));

  if (tieneAccesoComercial) {
    return { menu: 'Comercial', subMenu: 'Dashboard' };
  }

  const tieneAccesoAlmacen = ['inventario', 'entradas-salidas'].some((permiso) => tieneAccesoModulo(permiso));
  if (tieneAccesoAlmacen) {
    return { menu: 'Almacén', subMenu: 'Dashboard' };
  }

  if (tieneAccesoModulo('logistica')) {
    return { menu: 'Servicios - Clientes', subMenu: '' };
  }

  if (tieneAccesoModulo('programaciones')) {
    return { menu: 'Programaciones', subMenu: 'Dashboard Servicio' };
  }

  if (tieneAccesoModulo('rrhh-asistencia') || tieneAccesoModulo('marcar-asistencia')) {
    return { menu: 'Recursos Humanos', subMenu: '' };
  }

  if (tieneAccesoModulo('finanzas')) {
    return { menu: 'Finanzas', subMenu: '' };
  }

  const visible = filtrarMenuPorPermisos(menuItems);
  const firstVisible = visible[0]?.name || 'Dashboard';
  return { menu: firstVisible, subMenu: '' };
}

function filtrarMenuPorPermisos(items: typeof menuItems): typeof menuItems {
  return items.filter(item => {
    if (item.name === 'Dashboard' && !esUsuarioGerencia()) {
      return false;
    }

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
  { name: 'Almacén', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>', submenu: ['Dashboard', 'Mantenimiento', 'Inventario', 'Ajuste de Inventario', 'Proveedores', 'Órdenes de Compra', 'Entrega EPP', 'Gestión de Vehículos', 'Salidas Programación', 'Salidas de Productos', 'Órdenes de Fabricación'] },
  { name: 'Servicios - Clientes', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h5l3 3v5h-2m-4 0H2"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>', submenu: [] },
  { name: 'Programaciones', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', submenu: ['Dashboard Servicio', 'Programación Servicio', 'Programación Capacitación/Asesoría'] },
  { name: 'Comercial', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>', submenu: ['Dashboard', 'Clientes Potenciales', 'Cotizaciones', 'Aprobación Cotizaciones', 'Órdenes de Servicio', 'Órdenes de Producto', 'Órdenes de Capacitación', 'Órdenes de Asesoría', 'Órdenes de Auditoría', 'Exponentes'] },
  { name: 'Finanzas', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>', submenu: [] },
  { name: 'Facturación', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>', submenu: [] },
  { name: 'Recursos Humanos', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', submenu: [] },
  { name: 'Operaciones', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path></svg>', submenu: [] },
  { name: 'Investigación', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>', submenu: [] },
  { name: 'Usuarios', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>', submenu: [] }
];

function getMainContent() {
  if (activeMenu === 'Dashboard') {
    if (!esUsuarioGerencia()) {
      const ruta = getRutaInicialPorPerfil();
      activeMenu = ruta.menu;
      activeSubMenu = ruta.subMenu;
      return getMainContent();
    }

    setTimeout(() => { initDashboardEvents(); }, 0);
    return renderDashboard();
  } else if (activeMenu === 'Almacén') {
    if (activeSubMenu === 'Mantenimiento') {
      return renderAlmacenMantenimiento();
    }
    if (activeSubMenu === 'Inventario') return renderAlmacenInventario();
    if (activeSubMenu === 'Ajuste de Inventario') return renderAjustesInventarioTab();
    if (activeSubMenu === 'Proveedores') return renderAlmacenProveedores();
    if (activeSubMenu === 'Órdenes de Compra') return renderAlmacenCompras();
    if (activeSubMenu === 'Dashboard') {
      const html = renderAlmacenDashboard();
      setTimeout(() => initAlmacenDashboardEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Entrega EPP') return renderEntregaEpp();
    if (activeSubMenu === 'Gestión de Vehículos') return renderAlmacenVehiculos();
    if (activeSubMenu === 'Salidas Programación') {
      const html = renderSalidasProgramacion();
      setTimeout(() => initSalidasProgramacion(), 0);
      return html;
    }
    if (activeSubMenu === 'Salidas de Productos') {
      const html = renderSalidasProductos();
      setTimeout(() => initSalidasProductos(), 0);
      return html;
    }
    if (activeSubMenu === 'Órdenes de Fabricación') {
      const html = renderOrdenesFabricacion();
      setTimeout(() => initOrdenesFabricacion(), 0);
      return html;
    }
    const html = renderAlmacenDashboard();
    setTimeout(() => initAlmacenDashboardEvents(), 0);
    return html;
  } else if (activeMenu === 'Servicios - Clientes') {
    const html = renderLogistica();
    setTimeout(() => initClientesLogisticaEvents(), 0);
    return html;
  } else if (activeMenu === 'Programaciones') {
    if (activeSubMenu === 'Dashboard Servicio' || !activeSubMenu) {
      return renderDashboardProgramacionServicio();
    }

    if (activeSubMenu === 'Programación Capacitación/Asesoría') {
      return renderProgramacionCapacitacionAsesoria();
    }
    return renderProgramacionServicio();
  } else if (activeMenu === 'Comercial') {
    if (activeSubMenu === 'Dashboard' || !activeSubMenu) {
      const html = renderComercialDashboard();
      setTimeout(() => initComercialDashboardEvents(), 0);
      return html;
    }
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
    if (activeSubMenu === 'Órdenes de Auditoría') {
      const html = renderComercialOrdenesAuditoria();
      setTimeout(() => initOrdenesAuditoriaEvents(), 0);
      return html;
    }
    if (activeSubMenu === 'Exponentes') {
      const html = renderComercialExponentes();
      setTimeout(() => initExponentesEvents(), 0);
      return html;
    }
    const html = renderComercialDashboard();
    setTimeout(() => initComercialDashboardEvents(), 0);
    return html;
  } else if (activeMenu === 'Finanzas') {
    const html = renderFinanzas();
    setTimeout(() => updateFinanzasTabContent(), 0);
    return html;
  } else if (activeMenu === 'Facturación') {
    // Lógica de submenús de Facturación integrada aquí para evitar "Unreachable code"
    if (activeSubMenu === 'Contratos') return renderContratosFijosTab();
    if (activeSubMenu === 'Cobranza') return renderEstadoCobranzaTab();
    // Por defecto muestra la tabla con los datos
    return renderFacturacion(misProyecciones, misOrdenesPendientes, misEmpresas);
  } else if (activeMenu === 'Recursos Humanos') {
    return renderRecursosHumanos();
  } else if (activeMenu === 'Operaciones') {
    return renderOperaciones();
  } else if (activeMenu === 'Investigación') {
    return renderInvestigacion();
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

  if (activeMenu === 'Recursos Humanos') {
    const tabsPermitidos = getTabsRecursosHumanosPermitidos();
    if (!tabsPermitidos.includes(activeRecursosTab)) {
      activeRecursosTab = tabsPermitidos.includes('asistencia') ? 'asistencia' : (tabsPermitidos[0] || 'asistencia');
    }
  }

  if (activeMenu === 'Dashboard' && !esUsuarioGerencia()) {
    const ruta = getRutaInicialPorPerfil();
    activeMenu = ruta.menu;
    activeSubMenu = ruta.subMenu;
  }

  const visibleMenuItems = filtrarMenuPorPermisos(menuItems).map((item) => ({
    ...item,
    submenu: filtrarSubmenuPorPermisos(item.name, item.submenu),
  }));

  if (!visibleMenuItems.some((item) => item.name === activeMenu)) {
    const ruta = getRutaInicialPorPerfil();
    activeMenu = ruta.menu;
    activeSubMenu = ruta.subMenu;
  }
  app.innerHTML = `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar${expandedMenu ? ' sidebar-expanded' : ''}${sidebarForceCollapsed ? ' sidebar-force-collapsed' : ''}">
       <div class="sidebar-header" style="padding: 10px; display: flex; justify-content: center; align-items: center; min-height: 100px;">
        
        <img src="${LOGO_URL}" 
             width="100" 
             alt="Logo QSCI"
             style="display: block; max-width: 120%; height: auto; object-fit: contain;"
             onload="this.style.display='block';"
             onerror="console.error('No se pudo cargar el logo en:', this.src); this.alt='Error al cargar logo';">

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
          <button class="logout-btn" onclick="logout()" style="width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
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
      <main class="main-content${expandedMenu ? ' sidebar-expanded' : ''}${sidebarForceCollapsed ? ' sidebar-force-collapsed' : ''}">
        <header class="top-bar">
          <div class="user-section" style="display:flex; align-items:center; gap: 16px;">
            <!-- Notification Bell -->
            <div class="notification-wrapper" style="position:relative; cursor:pointer;" onclick="if(window.toggleNotifications) window.toggleNotifications(event)">
              <div style="padding:6px; border-radius:50%; transition:background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <span id="notification-badge" style="display:none; position:absolute; top:2px; right:4px; background:#ef4444; color:#fff; font-size:10px; font-weight:bold; border-radius:50%; width:16px; height:16px; text-align:center; line-height:16px;">0</span>
              
              <div id="notification-dropdown" style="display:none; position:absolute; top:40px; right:0; width:320px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:1000; overflow:hidden; text-align:left; cursor:default;" onclick="event.stopPropagation()">
                <div style="padding:14px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                  <span style="font-weight:600; color:#0f172a;">Notificaciones</span>
                  <button onclick="if(window.markAllNotificationsRead) window.markAllNotificationsRead()" style="background:none; border:none; color:#3b82f6; font-size:12px; cursor:pointer; font-weight:500;">Marcar leídas</button>
                </div>
                <div id="notification-list" style="max-height:300px; overflow-y:auto; padding:0;">
                  <div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px;">Cargando...</div>
                </div>
              </div>
            </div>

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
      if (sidebarForceCollapsed) {
        sidebarForceCollapsed = false;
        renderApp();
        return;
      }

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
        sidebarForceCollapsed = false;
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
      sidebarForceCollapsed = false;

      if (menuName === 'Dashboard' && !esUsuarioGerencia()) {
        const ruta = getRutaInicialPorPerfil();
        activeMenu = ruta.menu;
        activeSubMenu = ruta.subMenu;
      }

      // SOLO si es Facturación, traemos la data
      if (menuName === 'Facturación') {
        try {
          const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
          const headers = {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          };

          // Cargar proyecciones
          const resProy = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones?mes=${mesActual}&anio=${anioActual}`, { headers });
          const resultProy = await resProy.json();
          const rawDataProy = resultProy.data || resultProy;
          misProyecciones = Array.isArray(rawDataProy) ? rawDataProy : [];

          // Cargar empresas
          const resEmp = await fetch(`http://backend.qsci-system.com/api/v1/empresas`, { headers });
          const resultEmp = await resEmp.json();
          misEmpresas = resultEmp.data || [];

          // Cargar órdenes pendientes
          const resPend = await fetch(`http://backend.qsci-system.com/api/v1/proyecciones/pendientes`, { headers });
          const resultPend = await resPend.json();
          misOrdenesPendientes = resultPend.data || [];

          console.log("Datos de facturación cargados:", { misProyecciones, misEmpresas, misOrdenesPendientes });
        } catch (error) {
          console.error("Error cargando datos de facturación:", error);
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
      sidebarForceCollapsed = false;
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
    if (tieneAccesoCompletoRecursosHumanos()) {
      setTimeout(() => cargarAsistenciaAdmin(), 0);
    } else {
      setTimeout(() => cargarAsistenciaPersonal(), 0);
    }
  }

  // Inicializar eventos del módulo de Programaciones
  if (activeMenu === 'Programaciones') {
    if (activeSubMenu === 'Dashboard Servicio' || !activeSubMenu) {
      initDashboardProgramacionServicioEvents();
    } else if (activeSubMenu === 'Programación Capacitación/Asesoría') {
      initProgramacionCapacitacionAsesoriaEvents();
    } else {
      initProgramacionServicioEvents();
    }
  }

  // Cargar servicios realizados al entrar a Operaciones en la pestaña principal.
  if (activeMenu === 'Operaciones' && activeOperacionesTab === 'servicios') {
    setTimeout(() => {
      void cargarServiciosRealizadosOperaciones();
    }, 0);
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
  if (activeMenu === 'Almacén' && activeSubMenu === 'Mantenimiento') {
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
    case 'muestreo':
      tabContent.innerHTML = renderMuestreoClientesTab();
      setTimeout(() => initMuestreoClientesEvents(), 0);
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
    case 'estado-cuenta':
      tabContent.innerHTML = renderEstadoCuenta();
      setTimeout(() => initEstadoCuentaEvents(), 0);
      break;
    default:
      tabContent.innerHTML = renderCajaChica();
      setTimeout(() => initCajaChicaEvents(), 0);
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
  const tabsPermitidos = getTabsRecursosHumanosPermitidos();

  if (!tabContent) return;

  if (!tabsPermitidos.includes(activeRecursosTab)) {
    activeRecursosTab = tabsPermitidos.includes('asistencia') ? 'asistencia' : (tabsPermitidos[0] || 'asistencia');
  }


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
    case 'tecnicos':
      tabContent.innerHTML = renderTecnicosTab();
      break;
    case 'reportes':
      tabContent.innerHTML = renderReportesTab();
      break;
    case 'servicios-tecnicos':
      tabContent.innerHTML = renderServiciosTecnicosTab();
      break;
    default:
      tabContent.innerHTML = tieneAccesoCompletoRecursosHumanos() ? renderAsistenciaTab() : renderAsistenciaPersonalTab();
  }

  // Inicializar event listeners para Marcar Asistencia
  if (activeRecursosTab === 'marcar') {
    cargarMarcarAsistencia();
  }

  // Cargar asistencia admin
  if (activeRecursosTab === 'asistencia') {
    if (tieneAccesoCompletoRecursosHumanos()) {
      cargarAsistenciaAdmin();
    } else {
      cargarAsistenciaPersonal();
    }
  }

  // Cargar datos de horarios
  if (activeRecursosTab === 'horarios') {
    cargarHorarios();
  }

  if (activeRecursosTab === 'reportes') {
    cargarReportesRRHH();
  }

  if (activeRecursosTab === 'servicios-tecnicos') {
    cargarReporteServiciosTecnicos();
  }

  if (activeRecursosTab === 'tecnicos') {
    cargarTecnicos();
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
    case 'crear':
      tabContent.innerHTML = renderCrearInformeTab();
      setTimeout(() => initCrearInformeEvents(), 0);
      break;
    case 'historial':
      tabContent.innerHTML = renderHistorialInformesTab();
      setTimeout(() => initHistorialInformesEvents(), 0);
      break;
    default:
      tabContent.innerHTML = renderServiciosDiaTab();
      void cargarServiciosRealizadosOperaciones();
  }
}

async function cargarServiciosRealizadosOperaciones() {
  const container = document.querySelector('#operaciones-servicios-realizados-list') as HTMLElement | null;
  if (!container) return;

  try {
    const response = await programacionServicioService.getAll();
    const lista = Array.isArray(response?.data) ? response.data : [];

    const realizados = lista
      .filter((item): item is Programacion => Boolean(item))
      .filter((item) => item.estado_ejecucion === 'Realizado');
    // Agrupar por cliente y mes y renderizar
    const groups = mapServiciosPorClienteMes(realizados);

    // Construir cache de visitas para handlers con datos completos de cada visita
    operacionesRealizadosCardsCache = new Map();
    groups.forEach((group) => {
      group.visitas.forEach((visita) => {
        operacionesRealizadosCardsCache.set(visita.key, {
          key: visita.key,
          serviceId: visita.serviceId,
          groupId: null, // las visitas individuales no tienen groupId por defecto
          titulo: visita.titulo,
          fechaLabel: visita.fechaLabel,
          tecnicosLabel: visita.tecnicosLabel,
          previewImages: visita.previewImages,
          extraCount: visita.extraCount,
          secciones: visita.secciones,
        } as any);
      });
    });

    const renderAndBindGroups = (groupsToRender: ClienteMesGroup[]) => {
      container.innerHTML = renderServiciosPorClienteMes(groupsToRender);
      operacionesGroupsCache = groupsToRender;
      initOperacionesImagenesHandlers(container);

      // Toggle para mostrar/ocultar el cuerpo del grupo (círculos + detalle)
      container.querySelectorAll('.group-toggle-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const b = e.currentTarget as HTMLButtonElement;
          const gi = Number(b.dataset.groupIdx || '0');
          const groupEl = b.closest('.cliente-mes-group') as HTMLElement | null;
          if (!groupEl) return;
          const body = groupEl.querySelector('.group-body') as HTMLElement | null;
          if (!body) return;
          const isOpen = body.style.display && body.style.display !== 'none';
          body.style.display = isOpen ? 'none' : 'block';
          b.textContent = isOpen ? '▶' : '▼';

          // si se abre, intentar cargar formato del grupo y propagar dispositivos a las visitas
          if (!isOpen) {
            const group = operacionesGroupsCache[gi];
            try {
              if (group && (group.visitas || []).length > 0 && group.visitas[0].serviceId && (group as any).groupId) {
                const groupId = (group as any).groupId;
                if (groupId && groupId > 0) {
                  // crear un card mínimo para pasar a la función de carga
                  const tempCard = { serviceId: group.visitas[0].serviceId, groupId } as any;
                  try {
                    const formato = await cargarFormatoOperacional(tempCard);
                    // extraer dispositivos (codigo, ubicacion) desde el formato
                    const devices: Array<{ codigo: string; ubicacion: string }> = [];
                    if (Array.isArray((formato as any).secciones)) {
                      for (const s of (formato as any).secciones) {
                        if (Array.isArray(s.items)) {
                          for (const it of s.items) {
                            const codigo = String((it as any).codigoCaja ?? (it as any).codigo_caja ?? (it as any).codigo ?? '').trim();
                            const ubicacion = String((it as any).ubicacion ?? '').trim();
                            if (codigo) devices.push({ codigo, ubicacion });
                          }
                        }
                      }
                    }

                    // asignar devices a cada visita del grupo
                    if (devices.length > 0) {
                      group.visitas.forEach((v: any) => {
                        v.devices = devices;
                      });
                    }
                  } catch (err) {
                    // si no existe formato del grupo o falla, no hacer nada
                  }
                }
              }
            } catch (err) {
              console.warn('No se pudo cargar formato del grupo al abrirlo', err);
            }

            const firstCircle = body.querySelector('.visit-circle') as HTMLButtonElement | null;
            if (firstCircle) firstCircle.click();
          }
        });
      });

      // inicializar listeners de círculos de visitas: al hacer click renderiza solo la visita seleccionada
      container.querySelectorAll('.visit-circle').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const b = e.currentTarget as HTMLButtonElement;
          const gi = Number(b.dataset.groupIdx || '0');
          const vi = Number(b.dataset.visitIdx || '0');
          const group = operacionesGroupsCache[gi];
          if (!group) return;
          const visita = group.visitas && group.visitas[vi];
          if (!visita) return;

          const groupEl = b.closest('.cliente-mes-group') as HTMLElement | null;
          if (!groupEl) return;
          const details = groupEl.querySelector('.group-visit-details') as HTMLElement | null;
          if (!details) return;

          // Renderizar solo el detalle de la visita seleccionada
          details.innerHTML = renderVisitaDetail(visita);

          // enganchar handlers dentro del detalle (ficha, formato, imagenes)
          initOperacionesImagenesHandlers(details);

          // marcar circulo activo visualmente
          const parent = b.closest('.visit-circles');
          if (parent) {
            parent.querySelectorAll('.visit-circle').forEach((c) => c.classList.remove('active'));
            b.classList.add('active');
          }
        });
      });
    };

    let currentPage = 1;
    const itemsPerPage = 10;
    let currentSearchTerm = '';
    let currentMonthFilter = '';

    const renderPagination = (totalItems: number) => {
      const paginationContainer = document.getElementById('operaciones-servicios-realizados-pagination');
      if (!paginationContainer) return;
      
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      let html = '';
      
      html += `<button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>`;
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      html += `<button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>`;
      
      paginationContainer.innerHTML = html;

      paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLButtonElement;
          if (target.disabled) return;
          const page = Number(target.dataset.page);
          if (page >= 1 && page <= totalPages) {
            currentPage = page;
            applyFiltersAndRender();
          }
        });
      });
    };

    const applyFiltersAndRender = () => {
      let filtered = groups.filter(g => 
        g.cliente.toLowerCase().includes(currentSearchTerm)
      );
      
      if (currentMonthFilter !== 'todos') {
        filtered = filtered.filter(g => g.monthKey === currentMonthFilter);
      }

      const totalItems = filtered.length;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedGroups = filtered.slice(startIndex, startIndex + itemsPerPage);

      renderAndBindGroups(paginatedGroups);
      renderPagination(totalItems);
    };

    const monthSelect = document.getElementById('operaciones-servicios-realizados-month-filter') as HTMLSelectElement | null;
    const searchInput = document.getElementById('operaciones-servicios-realizados-search') as HTMLInputElement | null;

    if (monthSelect) {
      const uniqueMonths = Array.from(new Set(groups.map(g => g.monthKey))).sort((a, b) => b.localeCompare(a));
      let optionsHtml = '<option value="todos">Todos los meses</option>';
      uniqueMonths.forEach(m => {
        const label = groups.find(g => g.monthKey === m)?.monthLabel || m;
        optionsHtml += `<option value="${m}">${label}</option>`;
      });
      monthSelect.innerHTML = optionsHtml;
      
      if (uniqueMonths.length > 0) {
        monthSelect.value = uniqueMonths[0];
        currentMonthFilter = uniqueMonths[0];
      } else {
        currentMonthFilter = 'todos';
      }

      monthSelect.addEventListener('change', (e) => {
        currentMonthFilter = (e.target as HTMLSelectElement).value;
        currentPage = 1;
        applyFiltersAndRender();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        currentPage = 1;
        applyFiltersAndRender();
      });
    }

    // Initial render
    applyFiltersAndRender();
  } catch (error) {
    console.error('No se pudieron cargar servicios realizados en Operaciones:', error);
    container.innerHTML = '<p style="color:#b91c1c; margin:0;">No se pudieron cargar los servicios realizados.</p>';
  }
}

function initOperacionesImagenesHandlers(container: HTMLElement) {
  container.querySelectorAll('.js-open-imagenes-completas').forEach((button) => {
    button.addEventListener('click', (event) => {
      const target = event.currentTarget as HTMLButtonElement;
      const key = target.dataset.cardKey || '';
      if (!key) return;

      const card = operacionesRealizadosCardsCache.get(key);
      if (!card) return;
      abrirModalImagenesOperaciones(card);
    });
  });

  container.querySelectorAll('.js-open-ficha-operacional').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const target = event.currentTarget as HTMLButtonElement;
      const key = target.dataset.cardKey || '';
      if (!key) return;

      const card = operacionesRealizadosCardsCache.get(key);
      if (!card) return;

      const originalHTML = target.innerHTML;
      target.disabled = true;
      target.innerHTML = '<span class="report-doc-text">Cargando...</span>';

      try {
        const ficha = await cargarFichaOperacional(card);
        abrirModalFichaOperacional(card, ficha);
      } catch (error) {
        console.error('No se pudo abrir la ficha operacional:', error);
        alert('No se pudo cargar la ficha operacional para este servicio.');
      } finally {
        target.disabled = false;
        target.innerHTML = originalHTML;
      }
    });
  });

  container.querySelectorAll('.js-open-formato-operacional').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const target = event.currentTarget as HTMLButtonElement;
      const key = target.dataset.cardKey || '';
      if (!key) return;

      const card = operacionesRealizadosCardsCache.get(key);
      if (!card) return;

      const originalHTML = target.innerHTML;
      target.disabled = true;
      target.innerHTML = '<span class="report-doc-text">Cargando...</span>';

      try {
        const formato = await cargarFormatoOperacional(card);
        abrirModalFormatoOperacional(card, formato);
      } catch (error) {
        console.error('No se pudo abrir el formato operacional:', error);
        alert('No se pudo cargar el formato operacional para este servicio.');
      } finally {
        target.disabled = false;
        target.innerHTML = originalHTML;
      }
    });
  });

  // Toggle detalles expandibles por servicio (mostrar/ocultar imágenes y acciones)
  container.querySelectorAll('.js-toggle-report-details').forEach((button) => {
    button.addEventListener('click', (event) => {
      const target = event.currentTarget as HTMLButtonElement;
      const cardEl = target.closest('.report-card') as HTMLElement | null;
      if (!cardEl) return;

      const expanded = cardEl.querySelector('.report-expanded') as HTMLElement | null;
      if (!expanded) return;

      const isOpen = expanded.style.display && expanded.style.display !== 'none';
      expanded.style.display = isOpen ? 'none' : 'block';
      target.textContent = isOpen ? '▼' : '▲';
    });
  });
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item ?? '').trim())
          .filter((item) => item.length > 0);
      }
    } catch {
      // Si no es JSON válido, se toma como texto simple separado por comas.
    }

    return text
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  return [];
}

function normalizeFicha(data: FichaOperacionalApiData): FichaOperacionalViewModel {
  const firmas = data.firmas && typeof data.firmas === 'object' && !Array.isArray(data.firmas)
    ? data.firmas as Record<string, unknown>
    : null;

  return {
    id: data.id ?? null,
    estado: String(data.estado ?? '').trim(),
    cliente: String(data.cliente ?? '').trim(),
    direccion: String(data.direccion ?? '').trim(),
    fecha: (data.fecha ? String(data.fecha).substring(0, 10) : ''),
    horaLlegada: String(data.hora_llegada ?? '').trim(),
    horaInicio: String(data.hora_inicio ?? '').trim(),
    horaFinal: String(data.hora_final ?? '').trim(),
    giro: String(data.giro ?? '').trim(),
    diagnostico: String(data.diagnostico ?? '').trim(),
    condicionSanitaria: String(data.condicion_sanitaria ?? '').trim(),
    areasTratadas: normalizeList(data.areas_tratadas),
    actividadesRealizadas: normalizeList(data.actividades_realizadas),
    equipos: normalizeList(data.equipos),
    insumosUtilizados: Array.isArray(data.insumos_utilizados) ? data.insumos_utilizados : [],
    accionesCorrectivas: String(data.acciones_correctivas ?? '').trim(),
    recomendaciones: String(data.recomendaciones ?? '').trim(),
    firmas,
    observaciones: String(data.observaciones ?? '').trim(),
    correlativo: String(data.correlativo ?? '').trim(),
  };
}

async function cargarFichaOperacional(card: ServicioRealizadoCardViewModel): Promise<FichaOperacionalViewModel> {
  const response = card.groupId && card.groupId > 0
    ? await programacionServicioService.getFichaByGrupoId(card.groupId)
    : await programacionServicioService.getFichaByServiceId(card.serviceId);

  const data = (response?.data ?? null) as FichaOperacionalApiData | null;
  if (!data) {
    throw new Error('No se encontró ficha operacional');
  }

  return normalizeFicha(data);
}

function normalizeFormato(data: FormatoOperacionalApiData): FormatoOperacionalViewModel {
  const secciones = Array.isArray(data.secciones)
    ? data.secciones.map((section) => ({
      tipo: String(section.tipo ?? '').trim(),
      titulo: String(section.titulo ?? '').trim(),
      cantidad: Number(section.cantidad ?? 0) || 0,
      items: Array.isArray(section.items)
        ? section.items.map((item) => {
          const itemAny = item as any;
          return {
            id: Number(itemAny.id ?? 0) || null,
            ocultoEnFalsa: Boolean(itemAny.oculto_en_falsa),
            codigoCaja: String(itemAny.codigo_caja ?? '').trim(),
            ubicacion: String(itemAny.ubicacion ?? '').trim(),
            estadoDispositivoVerdadera: String(itemAny.estado_dispositivo_verdadera ?? itemAny.estado_dispositivo ?? '').trim(),
            estadoDispositivoAuditiva: String(itemAny.estado_dispositivo_auditiva ?? itemAny.estado_dispositivo ?? '').trim(),
            hallazgoVerdadera: String(itemAny.hallazgo_verdadera ?? itemAny.hallazgo ?? '-').trim(),
            hallazgoAuditiva: String(itemAny.hallazgo_auditiva ?? itemAny.hallazgo ?? '-').trim(),
            senalesPresenciaVerdadera: String(itemAny.senales_presencia_verdadera ?? itemAny.senales_presencia ?? '-').trim(),
            senalesPresenciaAuditiva: String(itemAny.senales_presencia_auditiva ?? itemAny.senales_presencia ?? '-').trim(),
            conteoInsectos: itemAny.conteo_insectos && typeof itemAny.conteo_insectos === 'object'
              ? Object.fromEntries(
                Object.entries(itemAny.conteo_insectos).map(([key, value]) => [
                  key,
                  {
                    verdadera: Number((value as any)?.verdadera ?? 0) || 0,
                    auditiva: Number((value as any)?.auditiva ?? 0) || 0,
                  },
                ]),
              )
              : null,
            estadoLamina: String(itemAny.estado_lamina ?? '').trim() || null,
            estadio: String(itemAny.estadio ?? '').trim() || null,
            conteoEstadio: itemAny.conteo_estadio && typeof itemAny.conteo_estadio === 'object'
              ? itemAny.conteo_estadio
              : null,
            conteoEstadioVerdadera: Number(itemAny.conteo_estadio_verdadera ?? 0) || 0,
            conteoEstadioFalsa: Number(itemAny.conteo_estadio_falsa ?? 0) || 0,
            numeroLote: String(itemAny.numero_lote ?? '').trim(),
          };
        })
        : [],
    }))
    : [];

  return {
    codigoDocumento: String(data.correlativo || data.codigo_documento || 'FO-OP-002').trim(),
    version: String(data.version ?? '01').trim(),
    cliente: String(data.cliente ?? '').trim(),
    direccion: String(data.direccion ?? '').trim(),
    fecha: String(data.fecha ?? '').trim(),
    horaLlegada: String(data.hora_llegada ?? '').trim(),
    horaInicio: String(data.hora_inicio ?? '').trim(),
    horaFinal: String(data.hora_final ?? '').trim(),
    observaciones: String(data.observaciones ?? '').trim(),
    correlativo: String(data.correlativo ?? '').trim(),
    correlativo_documento: String(data.correlativo_documento ?? '').trim(),
    numero_documento: String(data.numero_documento ?? '').trim(),
    formatos_fichas: (data as any).formatos_fichas || [],
    secciones: secciones,
  };
}

async function cargarFormatoOperacional(card: ServicioRealizadoCardViewModel): Promise<FormatoOperacionalViewModel> {
  const response = card.groupId && card.groupId > 0
    ? await programacionServicioService.getFormatoOperacionalByGrupoId(card.groupId)
    : await programacionServicioService.getFormatoOperacionalByServiceId(card.serviceId);

  const data = (response?.data ?? null) as FormatoOperacionalApiData | null;
  if (!data) {
    throw new Error('No se encontró formato operacional');
  }

  return normalizeFormato(data);
}

function abrirModalFichaOperacional(card: ServicioRealizadoCardViewModel, ficha: FichaOperacionalViewModel) {
  const existing = document.getElementById('operaciones-ficha-modal-host');
  if (existing) {
    existing.remove();
  }

  const host = document.createElement('div');
  host.id = 'operaciones-ficha-modal-host';
  host.innerHTML = renderFichaOperacionalModal(card, ficha);
  document.body.appendChild(host);

  const close = () => {
    host.remove();
  };

  host.querySelectorAll('.js-close-ficha-modal').forEach((element) => {
    element.addEventListener('click', (event) => {
      const clicked = event.target as HTMLElement;
      if (clicked.classList.contains('js-close-ficha-modal')) {
        close();
      }
    });
  });

  // Botón Descargar PDF
  host.querySelectorAll('.js-download-ficha-pdf').forEach((button) => {
    button.addEventListener('click', async () => {
      const btn = button as HTMLButtonElement;
      const groupId = btn.dataset.groupId ? parseInt(btn.dataset.groupId, 10) : null;
      const serviceId = parseInt(btn.dataset.serviceId || '0', 10);

      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>Generando PDF...</span>';

      try {
        const { apiClient } = await import('./core/api/api.client');
        const clienteSafe = (ficha.cliente || 'ficha').replace(/[^a-zA-Z0-9_\- ]/g, '_').substring(0, 30);
        const filename = `Ficha_Operacional_${clienteSafe}.pdf`;

        if (groupId && groupId > 0) {
          await apiClient.downloadFile(`/programacion-servicio/grupos/${groupId}/ficha/pdf`, filename);
        } else {
          await apiClient.downloadFile(`/programacion-servicio/${serviceId}/ficha/pdf`, filename);
        }
      } catch (error) {
        console.error('Error descargando PDF de ficha operacional:', error);
        const { mostrarToast } = await import('./shared/toast');
        mostrarToast('error', 'Error', 'No se pudo descargar el PDF de la ficha');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  });

  // Botón Editar
  host.querySelectorAll('.js-edit-ficha-btn').forEach((button) => {
    button.addEventListener('click', () => {
      host.querySelectorAll('.ficha-view-mode').forEach(el => (el as HTMLElement).style.display = 'none');
      host.querySelectorAll('.ficha-edit-mode').forEach(el => (el as HTMLElement).style.display = 'block');
      (button as HTMLElement).style.display = 'none';
      host.querySelector('.js-save-ficha-btn')?.setAttribute('style', 'display:flex;align-items:center;gap:6px;background:#10b981;color:#fff;border:none;padding:0 12px;font-weight:600;border-radius:6px;cursor:pointer;');
    });
  });

  // Botón Guardar
  host.querySelectorAll('.js-save-ficha-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const btn = button as HTMLButtonElement;
      const fichaId = btn.dataset.fichaId;
      if (!fichaId || fichaId === 'null') {
        alert('No se puede guardar porque esta ficha no tiene un ID válido asignado en el sistema.');
        return;
      }

      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>Guardando...</span>';

      const giro = (host.querySelector('#edit-ficha-giro') as HTMLInputElement)?.value;
      const fecha = (host.querySelector('#edit-ficha-fecha') as HTMLInputElement)?.value;
      const diagnostico = (host.querySelector('#edit-ficha-diagnostico') as HTMLTextAreaElement)?.value;
      const condicionSanitaria = (host.querySelector('#edit-ficha-condicion') as HTMLTextAreaElement)?.value;

      try {
        const { apiClient } = await import('./core/api/api.client');
        await apiClient.put(`/fichas-operacionales/${fichaId}`, {
          giro,
          fecha,
          diagnostico,
          condicion_sanitaria: condicionSanitaria
        });

        const { mostrarToast } = await import('./shared/toast');
        mostrarToast('success', 'Guardado', 'La Ficha Operacional se actualizó correctamente');

        // Actualizar UI
        const viewGiro = host.querySelector('#edit-ficha-giro')?.previousElementSibling;
        if (viewGiro) viewGiro.textContent = giro || 'No registrado';
        
        const viewFecha = host.querySelector('#edit-ficha-fecha')?.previousElementSibling;
        if (viewFecha) viewFecha.textContent = fecha || 'No registrado';
        
        const viewDiag = host.querySelector('#edit-ficha-diagnostico')?.previousElementSibling;
        if (viewDiag) viewDiag.textContent = diagnostico || 'Sin diagnóstico registrado';
        
        const viewCond = host.querySelector('#edit-ficha-condicion')?.previousElementSibling;
        if (viewCond) viewCond.textContent = condicionSanitaria || 'Sin condición registrada';

        // Volver a modo lectura
        host.querySelectorAll('.ficha-view-mode').forEach(el => (el as HTMLElement).style.display = ''); 
        host.querySelectorAll('.ficha-edit-mode').forEach(el => (el as HTMLElement).style.display = 'none');
        btn.style.display = 'none';
        
        const editBtn = host.querySelector('.js-edit-ficha-btn') as HTMLElement;
        if (editBtn) {
           editBtn.style.display = 'flex';
        }
      } catch (error) {
        console.error('Error guardando ficha:', error);
        const { mostrarToast } = await import('./shared/toast');
        mostrarToast('error', 'Error', 'Ocurrió un error al guardar los cambios.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  });

  document.addEventListener('keydown', function onEsc(event) {
    if (event.key !== 'Escape') return;
    close();
    document.removeEventListener('keydown', onEsc);
  });
}

function abrirModalFormatoOperacional(card: ServicioRealizadoCardViewModel, formato: FormatoOperacionalViewModel) {
  const existing = document.getElementById('operaciones-formato-modal-host');
  if (existing) {
    existing.remove();
  }

  const host = document.createElement('div');
  host.id = 'operaciones-formato-modal-host';
  host.innerHTML = renderFormatoOperacionalModal(card, formato);
  document.body.appendChild(host);

  const close = () => {
    host.remove();
  };

  host.querySelectorAll('.js-close-formato-modal').forEach((element) => {
    element.addEventListener('click', (event) => {
      const clicked = event.target as HTMLElement;
      if (clicked.classList.contains('js-close-formato-modal')) {
        close();
      }
    });
  });

  host.querySelectorAll('.js-download-formato-pdf').forEach((button) => {
    button.addEventListener('click', async () => {
      const btn = button as HTMLButtonElement;
      const serviceId = parseInt(btn.dataset.serviceId || '0', 10);

      // Obtener el tipo seleccionado del selector (Verdadera/Falsa)
      const selector = host.querySelector('.js-tipo-pdf-selector') as HTMLSelectElement | null;
      const tipoPdf = selector ? selector.value : 'verdadera';

      const queryParams = `?tipo_pdf=${tipoPdf}`;

      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>Generando PDF...</span>';

      try {
        const { apiClient } = await import('./core/api/api.client');
        const clienteSafe = (formato.cliente || 'formato').replace(/[^a-zA-Z0-9_\- ]/g, '_').substring(0, 30);
        const labelTipo = tipoPdf === 'falsa' ? '_Falsa' : '_Verdadera';
        const filename = `Formato_Operacional_${clienteSafe}${labelTipo}.pdf`;

        // SIEMPRE usar el endpoint de serviceId para aprovechar el "Filtrado Inteligente" del backend
        // que detecta si debe filtrar por Roedores, Rastreros o Voladores según el servicio.
        await apiClient.downloadFile(`/programacion-servicio/${serviceId}/formato-operacional/pdf${queryParams}`, filename);

      } catch (error) {
        console.error('Error descargando PDF del formato operacional:', error);
        alert('No se pudo descargar el PDF. Verifique que el formato esté guardado.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  });

  // Logic for toggling views between Verdadera and Falsa
  const selector = host.querySelector('.js-tipo-pdf-selector') as HTMLSelectElement | null;
  const btnEditFalsa = host.querySelector('.js-edit-formato-falsa-btn') as HTMLButtonElement | null;
  const btnSaveFalsa = host.querySelector('.js-save-formato-falsa-btn') as HTMLButtonElement | null;
  const btnDownload = host.querySelector('.js-download-formato-pdf') as HTMLButtonElement | null;
  
  const containerVerdadera = host.querySelector('#operaciones-hoja-verdadera-container') as HTMLElement | null;
  const containerFalsa = host.querySelector('#operaciones-hoja-falsa-container') as HTMLElement | null;
  const containerFalsaEdit = host.querySelector('#operaciones-hoja-falsa-edit-container') as HTMLElement | null;

  // Initial state for Falsa container
  if (containerFalsa) containerFalsa.style.display = 'none';

  if (selector && containerVerdadera && containerFalsa && btnEditFalsa) {
    selector.addEventListener('change', () => {
      const isFalsa = selector.value === 'falsa';
      if (isFalsa) {
        containerVerdadera.style.display = 'none';
        containerFalsa.style.display = 'block';
        btnEditFalsa.style.display = 'flex';
      } else {
        containerVerdadera.style.display = 'block';
        containerFalsa.style.display = 'none';
        btnEditFalsa.style.display = 'none';
      }
      if (containerFalsaEdit) containerFalsaEdit.style.display = 'none';
      if (btnSaveFalsa) btnSaveFalsa.style.display = 'none';
      if (btnDownload) btnDownload.style.display = 'flex';
    });

    btnEditFalsa.addEventListener('click', () => {
      containerVerdadera.style.display = 'none';
      containerFalsa.style.display = 'none';
      if (containerFalsaEdit) containerFalsaEdit.style.display = 'block';
      
      btnEditFalsa.style.display = 'none';
      if (btnDownload) btnDownload.style.display = 'none';
      if (btnSaveFalsa) btnSaveFalsa.style.display = 'flex';
      selector.style.display = 'none';
    });

    if (btnSaveFalsa) {
      btnSaveFalsa.addEventListener('click', async () => {
        btnSaveFalsa.disabled = true;
        btnSaveFalsa.innerHTML = 'Recargando...';
        try {
          const { apiClient } = await import('./core/api/api.client');
          const groupUrl = card.groupId 
            ? `/programacion-servicio/grupos/${card.groupId}/formato-operacional` 
            : `/programacion-servicio/${card.serviceId}/formato-operacional`;
          const rawData = await apiClient.get<any>(groupUrl);
          
          if (rawData.data) {
            const updatedFormato = normalizeFormato(rawData.data);
            host.remove();
            abrirModalFormatoOperacional(card, updatedFormato);
            
            // Open it in "falsa" mode immediately
            setTimeout(() => {
              const newHost = document.getElementById('operaciones-formato-modal-host');
              if (newHost) {
                 const newSelector = newHost.querySelector('.js-tipo-pdf-selector') as HTMLSelectElement | null;
                 if (newSelector) {
                   newSelector.value = 'falsa';
                   newSelector.dispatchEvent(new Event('change'));
                 }
              }
            }, 50);
          }
        } catch (error) {
          console.error('Error reloading formato:', error);
          alert('Error recargando la hoja');
        }
      });
    }

    host.querySelectorAll('.js-toggle-visibilidad').forEach((checkbox) => {
      checkbox.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        const id = target.dataset.detalleId;
        const isVisible = target.checked;
        
        target.disabled = true;
        try {
          const { apiClient } = await import('./core/api/api.client');
          await apiClient.patch(`/formato-operacional-detalles/${id}/toggle-visibilidad`, {});
          
          const row = target.closest('tr') || target.closest('div[style*="box-shadow"]');
          if (row) {
            if (!isVisible) {
              row.style.opacity = '0.5';
              row.style.background = '#f8fafc';
            } else {
              row.style.opacity = '1';
              row.style.background = '#fff';
            }
          }
        } catch (error) {
          console.error('Error toggle visibilidad:', error);
          target.checked = !isVisible; // Revert
        } finally {
          target.disabled = false;
        }
      });
    });
  }

  document.addEventListener('keydown', function onEsc(event) {
    if (event.key !== 'Escape') return;
    close();
    document.removeEventListener('keydown', onEsc);
  });
}

function abrirModalImagenesOperaciones(card: ServicioRealizadoCardViewModel) {
  const existing = document.getElementById('operaciones-imagenes-modal-host');
  if (existing) {
    existing.remove();
  }

  const host = document.createElement('div');
  host.id = 'operaciones-imagenes-modal-host';
  host.innerHTML = renderServicioImagenesModal(card);
  document.body.appendChild(host);

  const close = () => {
    host.remove();
  };

  host.querySelectorAll('.js-close-imagenes-modal').forEach((element) => {
    element.addEventListener('click', (event) => {
      const clicked = event.target as HTMLElement;
      if (clicked.classList.contains('js-close-imagenes-modal')) {
        close();
      }
    });
  });

  document.addEventListener('keydown', function onEsc(event) {
    if (event.key !== 'Escape') return;
    close();
    document.removeEventListener('keydown', onEsc);
  });
}

function logout() {
  const existing = document.getElementById('logout-modal-host');
  if (existing) {
    existing.remove();
  }

  const host = document.createElement('div');
  host.id = 'logout-modal-host';
  host.innerHTML = `
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;">
      <div style="background:white;padding:24px;border-radius:12px;width:100%;max-width:380px;box-shadow:0 10px 25px rgba(0,0,0,0.2);text-align:center;">
        <div style="width:48px;height:48px;background:#fee2e2;color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <h3 style="margin:0 0 8px;font-size:18px;color:#1e293b;font-weight:600;">¿Cerrar sesión?</h3>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.5;">Estás a punto de salir del sistema. Tendrás que volver a ingresar tus credenciales para acceder de nuevo.</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="btn-cancel-logout" style="flex:1;padding:10px;background:#f1f5f9;color:#475569;border:none;border-radius:6px;font-weight:500;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Cancelar</button>
          <button id="btn-confirm-logout" style="flex:1;padding:10px;background:#ef4444;color:white;border:none;border-radius:6px;font-weight:500;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Salir del sistema</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(host);

  const close = () => {
    host.remove();
  };

  document.getElementById('btn-cancel-logout')?.addEventListener('click', close);
  
  document.getElementById('btn-confirm-logout')?.addEventListener('click', () => {
    close();
    authService.logout();
  });

  // Cerrar al hacer clic fuera del modal
  host.firstElementChild?.addEventListener('click', (e) => {
    if (e.target === host.firstElementChild) {
      close();
    }
  });

  document.addEventListener('keydown', function onEsc(event) {
    if (event.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onEsc);
    }
  });
}

(window as any).logout = logout;

// ==========================================
// NOTIFICATIONS LOGIC
// ==========================================
(window as any).toggleNotifications = (event: Event) => {
  event.stopPropagation();
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) {
    if (dropdown.style.display === 'none') {
      dropdown.style.display = 'block';
      if ((window as any).loadNotifications) (window as any).loadNotifications();
    } else {
      dropdown.style.display = 'none';
    }
  }
};

(window as any).closeNotifications = () => {
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) dropdown.style.display = 'none';
};

document.addEventListener('click', () => {
  if ((window as any).closeNotifications) (window as any).closeNotifications();
});

(window as any).loadNotifications = async () => {
  const token = authService.getToken();
  if (!token) return;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notificaciones`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (result.success) {
      renderNotificationsList(result.data);
    }
  } catch (error) {
    console.error('Error cargando notificaciones:', error);
  }
};

function renderNotificationsList(notifs: any[]) {
  const listEl = document.getElementById('notification-list');
  const badgeEl = document.getElementById('notification-badge');
  if (!listEl) return;
  
  const unreadCount = notifs.filter(n => !n.read_at).length;
  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.style.display = 'block';
      badgeEl.textContent = String(unreadCount);
    } else {
      badgeEl.style.display = 'none';
    }
  }
  
  if (notifs.length === 0) {
    listEl.innerHTML = `<div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px;">No tienes notificaciones nuevas</div>`;
    return;
  }
  
  listEl.innerHTML = notifs.map(n => {
    const isUnread = !n.read_at;
    const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
    
    return `
      <div style="padding:12px 14px; border-bottom:1px solid #f1f5f9; display:flex; gap:12px; cursor:pointer; background:${isUnread ? '#f0f9ff' : '#fff'}" onclick="if(window.handleNotificationClick) window.handleNotificationClick('${n.id}', ${data.caja_chica_id})">
        <div style="margin-top:2px; color:${isUnread ? '#3b82f6' : '#94a3b8'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isUnread ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div style="flex:1;">
          <div style="font-size:13px; font-weight:${isUnread ? '600' : '400'}; color:#0f172a; margin-bottom:4px;">${data.titulo || 'Notificación'}</div>
          <div style="font-size:12px; color:#64748b; line-height:1.4;">${data.mensaje || ''}</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:6px;">${new Date(n.created_at).toLocaleString()}</div>
        </div>
      </div>
    `;
  }).join('');
}

(window as any).handleNotificationClick = async (notifId: string, cajaId: number) => {
  if ((window as any).markNotificationRead) {
    (window as any).markNotificationRead(notifId);
  }
  
  if ((window as any).closeNotifications) {
    (window as any).closeNotifications();
  }
  
  // Navegar a Finanzas si no estamos ahí
  if (window.navigateToModule) {
    window.navigateToModule('Finanzas');
  } else {
    const menuFinanzas = document.querySelector('.menu-item[data-menu="Finanzas"]') as HTMLElement;
    if (menuFinanzas) menuFinanzas.click();
  }
  
  // Buscar la fila y hacerle highlight
  setTimeout(() => {
    const row = document.getElementById(`caja-row-${cajaId}`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.style.backgroundColor = '#fef08a'; // yellow highlight
      setTimeout(() => {
        row.style.backgroundColor = '';
      }, 2000);
    } else {
       // Si la fila no está, puede que esté en otro mes. Cambiamos el filtro a 'todos'
       const monthFilter = document.getElementById('cc-month-filter') as HTMLSelectElement;
       if (monthFilter && monthFilter.value !== 'todos') {
          monthFilter.value = 'todos';
          monthFilter.dispatchEvent(new Event('change'));
          // Esperamos a que recargue la tabla
          setTimeout(() => {
             const row2 = document.getElementById(`caja-row-${cajaId}`);
             if (row2) {
                row2.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row2.style.backgroundColor = '#fef08a';
                setTimeout(() => row2.style.backgroundColor = '', 2000);
             }
          }, 800);
       }
    }
  }, 300);
};

(window as any).markNotificationRead = async (id: string) => {
  const token = authService.getToken();
  if (!token) return;
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/notificaciones/${id}/read`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if ((window as any).loadNotifications) (window as any).loadNotifications();
  } catch (error) {
    console.error('Error al marcar leída:', error);
  }
};

(window as any).markAllNotificationsRead = async () => {
  const listEl = document.getElementById('notification-list');
  if (listEl) listEl.innerHTML = `<div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px;">Marcando...</div>`;
  
  const token = authService.getToken();
  if (!token) return;
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/notificaciones/read-all`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if ((window as any).loadNotifications) (window as any).loadNotifications();
  } catch (error) {
    console.error('Error al marcar leídas:', error);
  }
};

if (authService.isAuthenticated()) {
  setTimeout(() => {
    if ((window as any).loadNotifications) (window as any).loadNotifications();
    setInterval(() => {
      if ((window as any).loadNotifications) (window as any).loadNotifications();
    }, 60000);
  }, 1000);
}

renderApp();
