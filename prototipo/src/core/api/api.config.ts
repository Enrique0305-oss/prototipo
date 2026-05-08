export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://backend.qsci-system.com/api/v1',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Dashboard
  dashboard: '/dashboard',

  // Programaciones
  programaciones: '/programaciones',
  tecnicos: '/tecnicos',

  // Recursos Humanos
  asistencias: '/asistencias',
  empleados: '/empleados',
  horarios: '/horarios',
  reportes_rrhh: '/reportes/rrhh',

  // Comercial
  cotizaciones: '/cotizaciones',
  ordenes: '/ordenes',
  prospectos: '/prospectos',
  conversiones: '/conversiones',

  // Almacén
  almacen: {
    productos: '/almacen/productos',
    movimientos: '/almacen/movimientos',
    equipos: '/almacen/equipos',
    mantenimiento: '/almacen/mantenimiento',
    proveedores: '/almacen/proveedores',
  },

  // Kardex
  kardex: '/kardex',

  // Logística
  logistica: {
    clientes: '/logistica/clientes',
    rutas: '/logistica/rutas',
    vehiculos: '/logistica/vehiculos',
    conductores: '/logistica/conductores',
  },

  // Finanzas
  finanzas: {
    movimientos: '/finanzas/movimientos',
    cajaChica: '/finanzas/caja-chica',
    cuentasCobrar: '/finanzas/cuentas-cobrar',
    cuentasPagar: '/finanzas/cuentas-pagar',
    presupuesto: '/finanzas/presupuesto',
    balance: '/finanzas/balance',
    flujoCaja: '/finanzas/flujo-caja',
  },

  // Facturación
  facturacion: '/facturas',
  cobranza: '/cobranza',

  // Operaciones
  operaciones: '/operaciones',

  // Reportes
  reportes: '/reportes',

  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
};
