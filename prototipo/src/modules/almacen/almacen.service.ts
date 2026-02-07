// Servicio para el módulo de Almacén
import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type {
  Producto,
  Movimiento,
  Equipo,
  Proveedor,
  FiltroProductos,
  FiltroMovimientos,
  FiltroEquipos,
  FiltroProveedores,
  EstadisticasInventario,
  EstadisticasMovimientos,
  RegistroMantenimiento
} from './almacen.types';

class AlmacenService {
  // === INVENTARIO ===
  
  async getProductos(filtros?: FiltroProductos): Promise<Producto[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockProductos();
  }

  async getProducto(id: number): Promise<Producto> {
    return apiClient.get<Producto>(`${API_ENDPOINTS.almacen.productos}/${id}`);
  }

  async crearProducto(data: Partial<Producto>): Promise<Producto> {
    return apiClient.post<Producto>(API_ENDPOINTS.almacen.productos, data);
  }

  async actualizarProducto(id: number, data: Partial<Producto>): Promise<Producto> {
    return apiClient.patch<Producto>(`${API_ENDPOINTS.almacen.productos}/${id}`, data);
  }

  async getEstadisticasInventario(): Promise<EstadisticasInventario> {
    // TODO: Reemplazar con llamada real
    return {
      stock_total: 1284,
      valor_total: 42580,
      productos_bajo_stock: 15,
      categorias: 8
    };
  }

  // Kardex de movimientos
  
  async getMovimientos(filtros?: FiltroMovimientos): Promise<Movimiento[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockMovimientos();
  }

  async getMovimiento(id: number): Promise<Movimiento> {
    return apiClient.get<Movimiento>(`${API_ENDPOINTS.almacen.movimientos}/${id}`);
  }

  async registrarEntrada(data: Partial<Movimiento>): Promise<Movimiento> {
    return apiClient.post<Movimiento>(`${API_ENDPOINTS.almacen.movimientos}/entrada`, data);
  }

  async registrarSalida(data: Partial<Movimiento>): Promise<Movimiento> {
    return apiClient.post<Movimiento>(`${API_ENDPOINTS.almacen.movimientos}/salida`, data);
  }

  async getEstadisticasMovimientos(): Promise<EstadisticasMovimientos> {
    // TODO: Reemplazar con llamada real
    return {
      entradas_mes: 45,
      salidas_mes: 38,
      total_movimientos: 83
    };
  }

  // mantenimiento de equipos
  
  async getEquipos(filtros?: FiltroEquipos): Promise<Equipo[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockEquipos();
  }

  async getEquipo(id: number): Promise<Equipo> {
    return apiClient.get<Equipo>(`${API_ENDPOINTS.almacen.equipos}/${id}`);
  }

  async registrarMantenimiento(data: Partial<RegistroMantenimiento>): Promise<RegistroMantenimiento> {
    return apiClient.post<RegistroMantenimiento>(API_ENDPOINTS.almacen.mantenimiento, data);
  }

  async getHistorialMantenimiento(idEquipo: number): Promise<RegistroMantenimiento[]> {
    return apiClient.get<RegistroMantenimiento[]>(`${API_ENDPOINTS.almacen.equipos}/${idEquipo}/mantenimiento`);
  }

  // proveedoress
  
  async getProveedores(filtros?: FiltroProveedores): Promise<Proveedor[]> {
    // TODO: Reemplazar con llamada real al backend
    return getMockProveedores();
  }

  async getProveedor(id: number): Promise<Proveedor> {
    return apiClient.get<Proveedor>(`${API_ENDPOINTS.almacen.proveedores}/${id}`);
  }

  async crearProveedor(data: Partial<Proveedor>): Promise<Proveedor> {
    return apiClient.post<Proveedor>(API_ENDPOINTS.almacen.proveedores, data);
  }

  async actualizarProveedor(id: number, data: Partial<Proveedor>): Promise<Proveedor> {
    return apiClient.patch<Proveedor>(`${API_ENDPOINTS.almacen.proveedores}/${id}`, data);
  }
}

// Mock Data (temporal hasta conectar backend)
function getMockProductos(): Producto[] {
  return [
    {
      id: 1,
      codigo: 'QSC-QUI-001',
      nombre: 'Cipermetrina 25% EC',
      categoria: 'Químicos',
      stock: 45,
      unidad: 'Litros',
      precio_unitario: 28.50,
      valor_total: 1282.50,
      estado: 'Disponible'
    }
  ];
}

function getMockMovimientos(): Movimiento[] {
  return [
    {
      id: 1,
      fecha: '2025-01-15 09:30',
      tipo: 'Entrada',
      id_producto: 1,
      producto_nombre: 'Cipermetrina 25% EC',
      producto_codigo: 'QSC-QUI-001',
      cantidad: 20,
      responsable: 'Carlos López',
      destino_origen: 'QuímicaPeru S.A.C.',
      estado: 'Completado'
    }
  ];
}

function getMockEquipos(): Equipo[] {
  return [
    {
      id: 1,
      codigo: 'EQ-FUM-001',
      nombre: 'Fumigadora Eléctrica ULV',
      tipo: 'Fumigadora',
      proveedor: 'Sodimac',
      fecha_compra: '2023-05-15',
      estado_mantenimiento: 'Al día',
      estado_garantia: 'Vigente',
      proximo_mantenimiento: '2025-03-01',
      fecha_vencimiento_garantia: '2025-05-15'
    }
  ];
}

function getMockProveedores(): Proveedor[] {
  return [
    {
      id: 1,
      ruc: '20123456789',
      razon_social: 'QuímicaPeru S.A.C.',
      contacto: 'Juan Pérez',
      telefono: '(01) 234-5678',
      email: 'ventas@quimicaperu.com',
      direccion: 'Av. Argentina 1234',
      categoria: 'Químicos',
      estado: 'Activo',
      total_compras: 15,
      ultima_compra: '2025-01-15'
    }
  ];
}

export const almacenService = new AlmacenService();
