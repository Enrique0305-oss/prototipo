// Tipos compartidos para el módulo de Almacén

export type TipoMovimiento = 'Entrada' | 'Salida';
export type EstadoProducto = 'Disponible' | 'Bajo Stock' | 'Agotado';
export type EstadoMovimiento = 'Completado' | 'Pendiente' | 'Cancelado';
export type EstadoMantenimiento = 'Al día' | 'Próximo' | 'Vencido';
export type EstadoGarantia = 'Vigente' | 'Por Vencer' | 'Expirada';
export type EstadoProveedor = 'Activo' | 'Inactivo' | 'Bloqueado';

// Inventario
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidad: string;
  precio_unitario: number;
  valor_total: number;
  estado: EstadoProducto;
  fecha_vencimiento?: string;
  lote?: string;
}

export interface CategoriaProducto {
  id: number;
  nombre: string;
  total_productos: number;
}

// Entradas y Salidas
export interface Movimiento {
  id: number;
  fecha: string;
  tipo: TipoMovimiento;
  id_producto: number;
  producto_nombre: string;
  producto_codigo: string;
  cantidad: number;
  responsable: string;
  destino_origen: string;
  estado: EstadoMovimiento;
  observaciones?: string;
}

// Mantenimiento
export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  proveedor: string;
  fecha_compra: string;
  estado_mantenimiento: EstadoMantenimiento;
  estado_garantia: EstadoGarantia;
  proximo_mantenimiento?: string;
  fecha_vencimiento_garantia?: string;
  imagen?: string;
  imagen_url?: string;
}

export interface RegistroMantenimiento {
  id: number;
  id_equipo: number;
  fecha: string;
  tipo: 'Preventivo' | 'Correctivo' | 'Predictivo';
  tecnico: string;
  descripcion: string;
  costo?: number;
  proximo_mantenimiento?: string;
}

// Proveedores
export interface Proveedor {
  id: number;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria: string;
  estado: EstadoProveedor;
  total_compras?: number;
  ultima_compra?: string;
}

// Filtros
export interface FiltroProductos {
  busqueda?: string;
  categoria?: string;
  estado?: EstadoProducto;
}

export interface FiltroMovimientos {
  busqueda?: string;
  tipo?: TipoMovimiento;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: EstadoMovimiento;
}

export interface FiltroEquipos {
  busqueda?: string;
  estado_mantenimiento?: EstadoMantenimiento;
  estado_garantia?: EstadoGarantia;
}

export interface FiltroProveedores {
  busqueda?: string;
  categoria?: string;
  estado?: EstadoProveedor;
}

// Estadísticas
export interface EstadisticasInventario {
  stock_total: number;
  valor_total: number;
  productos_bajo_stock: number;
  categorias: number;
}

export interface EstadisticasMovimientos {
  entradas_mes: number;
  salidas_mes: number;
  total_movimientos: number;
  movimientos_hoy?: number;
  productos_con_movimiento_mes?: number;
}

export interface EstadoEquiposOperativo {
  total_equipos: number;
  al_dia: number;
  proximo: number;
  vencido: number;
  pendientes: number;
  realizados: number;
}
