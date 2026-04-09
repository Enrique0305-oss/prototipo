// Servicio para el módulo de Almacén
import { apiClient } from '../../core/api/api.client';
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
  EstadoEquiposOperativo,
  RegistroMantenimiento
} from './almacen.types';

function unwrapArray<T>(response: any): T[] {
  if (Array.isArray(response)) return response as T[];
  if (Array.isArray(response?.data)) return response.data as T[];
  if (Array.isArray(response?.data?.data)) return response.data.data as T[];
  if (Array.isArray(response?.data?.items)) return response.data.items as T[];
  if (Array.isArray(response?.items)) return response.items as T[];
  return [];
}

function unwrapObject<T>(response: any): T {
  if (response?.data && !Array.isArray(response.data)) {
    return (response.data.data ?? response.data) as T;
  }
  return response as T;
}

function normalizeProduct(raw: any): Producto {
  const stock = Number(raw?.inventario?.cantidad_disponible ?? raw?.stock ?? 0);
  const stockSeguridad = Number(raw?.inventario?.stock_seguridad ?? raw?.stock_seguridad ?? 0);
  const precioUnitario = Number(raw?.precio_unitario ?? 0);
  const valorTotal = Number(raw?.valor_total ?? (stock * precioUnitario));

  let estado: Producto['estado'] = 'Disponible';
  if ((raw?.estado ?? 'Activo') !== 'Activo') {
    estado = 'Agotado';
  } else if (stock <= 0) {
    estado = 'Agotado';
  } else if (stock <= stockSeguridad) {
    estado = 'Bajo Stock';
  }

  return {
    id: Number(raw?.id ?? 0),
    codigo: raw?.sku ?? String(raw?.id ?? ''),
    nombre: raw?.descripcion ?? raw?.nombre ?? 'Sin nombre',
    categoria: raw?.categoria?.nombre ?? raw?.categoria ?? 'Sin categoría',
    stock,
    unidad: raw?.unidad ?? 'Unidades',
    precio_unitario: precioUnitario,
    valor_total: valorTotal,
    estado,
    fecha_vencimiento: raw?.fecha_vencim,
    lote: raw?.n_lote,
  };
}

function normalizeEquipo(raw: any): Equipo {
  const estadoActivo = (raw?.estado ?? 'Activo') === 'Activo';
  return {
    id: Number(raw?.id ?? 0),
    codigo: `EQ-${String(raw?.id ?? '').padStart(4, '0')}`,
    nombre: raw?.descripcion ?? 'Equipo',
    tipo: [raw?.marca, raw?.modelo].filter(Boolean).join(' ') || 'General',
    proveedor: raw?.responsable ?? raw?.encargado ?? 'Sin asignar',
    fecha_compra: raw?.created_at ?? '',
    estado_mantenimiento: estadoActivo ? 'Al día' : 'Vencido',
    estado_garantia: estadoActivo ? 'Vigente' : 'Expirada',
    proximo_mantenimiento: raw?.proximo_mantenimiento,
    fecha_vencimiento_garantia: raw?.fecha_vencimiento_garantia,
    imagen: raw?.imagen,
    imagen_url: raw?.imagen_url,
  };
}

function normalizeProveedor(raw: any): Proveedor {
  return {
    id: Number(raw?.id ?? 0),
    ruc: raw?.ruc ?? '',
    razon_social: raw?.razon_social ?? raw?.nombre_comercial ?? 'Proveedor',
    contacto: raw?.contacto_nombre ?? '',
    telefono: raw?.contacto_telefono ?? '',
    email: raw?.contacto_email ?? '',
    direccion: raw?.direccion ?? '',
    categoria: raw?.categoria ?? 'General',
    estado: (raw?.estado ?? 'Activo') as Proveedor['estado'],
    total_compras: Number(raw?.total_compras ?? raw?.monto_total ?? 0),
    ultima_compra: raw?.ultima_compra,
  };
}

function toSafeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

class AlmacenService {
  // === INVENTARIO ===
  
  async getProductos(filtros?: FiltroProductos): Promise<Producto[]> {
    const params: Record<string, any> = { ...(filtros as Record<string, any> | undefined) };

    // El backend de productos usa estado Activo/Inactivo, no Disponible/Bajo Stock/Agotado.
    if (params?.estado === 'Disponible' || params?.estado === 'Bajo Stock') {
      params.estado = 'Activo';
    }
    if (params?.estado === 'Agotado') {
      delete params.estado;
    }

    const response = await apiClient.get<any>('/productos', params);
    return unwrapArray<any>(response).map(normalizeProduct);
  }

  async getProducto(id: number): Promise<Producto> {
    const response = await apiClient.get<any>(`/productos/${id}`);
    return normalizeProduct(unwrapObject<any>(response));
  }

  async crearProducto(data: Partial<Producto>): Promise<Producto> {
    return apiClient.post<Producto>('/productos', data);
  }

  async actualizarProducto(id: number, data: Partial<Producto>): Promise<Producto> {
    return apiClient.patch<Producto>(`/productos/${id}`, data);
  }

  async getEstadisticasInventario(): Promise<EstadisticasInventario> {
    await apiClient.get<any>('/productos/estadisticas/resumen');
    const productos = await this.getProductos();

    const categorias = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return {
      stock_total: productos.reduce((sum, p) => sum + Number(p.stock || 0), 0),
      valor_total: productos.reduce((sum, p) => sum + Number(p.valor_total || 0), 0),
      productos_bajo_stock: productos.filter((p) => p.estado === 'Bajo Stock').length,
      categorias: categorias.size,
    };
  }

  // Kardex de movimientos
  
  async getMovimientos(filtros?: FiltroMovimientos): Promise<Movimiento[]> {
    const response = await apiClient.get<any>('/kardex', filtros as Record<string, any> | undefined);
    return unwrapArray<Movimiento>(response).map((movimiento: any) => ({
      id: Number(movimiento.id),
      fecha: movimiento.fecha_movimiento || movimiento.fecha || '',
      tipo: movimiento.tipo_movimiento || movimiento.tipo || 'Entrada',
      id_producto: Number(movimiento.id_producto || 0),
      producto_nombre: movimiento.producto?.descripcion || movimiento.producto || movimiento.producto_nombre || 'N/A',
      producto_codigo: movimiento.producto?.sku || movimiento.producto_codigo || 'N/A',
      cantidad: Number(movimiento.cantidad || 0),
      responsable: movimiento.usuario || movimiento.responsable || 'Sistema',
      destino_origen: movimiento.referencia || movimiento.destino_origen || '—',
      estado: movimiento.estado || 'Completado',
      observaciones: movimiento.observacion || movimiento.observaciones,
    }));
  }

  async getMovimiento(id: number): Promise<Movimiento> {
    const response = await apiClient.get<any>(`/kardex/${id}`);
    return unwrapObject<Movimiento>(response);
  }

  async registrarEntrada(data: Partial<Movimiento>): Promise<Movimiento> {
    return apiClient.post<Movimiento>('/kardex', {
      ...data,
      tipo_movimiento: 'Entrada',
    });
  }

  async registrarSalida(data: Partial<Movimiento>): Promise<Movimiento> {
    return apiClient.post<Movimiento>('/kardex', {
      ...data,
      tipo_movimiento: 'Salida',
    });
  }

  async getEstadisticasMovimientos(): Promise<EstadisticasMovimientos> {
    const response = await apiClient.get<any>('/kardex/estadisticas/resumen');
    return unwrapObject<EstadisticasMovimientos>(response);
  }

  // mantenimiento de equipos
  
  async getEquipos(filtros?: FiltroEquipos): Promise<Equipo[]> {
    const params: Record<string, any> = {};
    if (filtros?.busqueda) params.search = filtros.busqueda;
    const response = await apiClient.get<any>('/equipos', params);
    return unwrapArray<any>(response).map(normalizeEquipo);
  }

  async getEstadoEquiposOperativo(): Promise<EstadoEquiposOperativo> {
    const [equiposResponse, programacionesResponse] = await Promise.all([
      apiClient.get<any>('/equipos'),
      apiClient.get<any>('/programacion-mantenimiento'),
    ]);

    const equipos = unwrapArray<any>(equiposResponse);
    const programaciones = unwrapArray<any>(programacionesResponse);

    const ranking: Record<string, number> = {
      'Al día': 1,
      'Próximo': 2,
      Vencido: 3,
    };

    const statusByEquipo = new Map<number, 'Al día' | 'Próximo' | 'Vencido'>();

    // Estado base para todos los equipos activos/inactivos existentes en BD.
    equipos.forEach((equipo: any) => {
      const id = toSafeNumber(equipo?.id);
      if (id > 0) {
        statusByEquipo.set(id, 'Al día');
      }
    });

    let pendientes = 0;
    let realizados = 0;

    programaciones.forEach((prog: any) => {
      const equipoId = toSafeNumber(prog?.equipo?.id ?? prog?.id_equipo);
      if (equipoId <= 0) return;

      const vencidos = toSafeNumber(prog?.vencidos);
      pendientes += toSafeNumber(prog?.pendientes);
      realizados += toSafeNumber(prog?.realizados);

      const mantenimientos = Array.isArray(prog?.mantenimientos) ? prog.mantenimientos : [];
      const tieneProximos = mantenimientos.some((m: any) => m?.proximidad === 'proximo');

      let status: 'Al día' | 'Próximo' | 'Vencido' = 'Al día';
      if (vencidos > 0) {
        status = 'Vencido';
      } else if (tieneProximos) {
        status = 'Próximo';
      }

      const current = statusByEquipo.get(equipoId) ?? 'Al día';
      if (ranking[status] > ranking[current]) {
        statusByEquipo.set(equipoId, status);
      }
    });

    let alDia = 0;
    let proximo = 0;
    let vencido = 0;

    statusByEquipo.forEach((status) => {
      if (status === 'Vencido') vencido += 1;
      else if (status === 'Próximo') proximo += 1;
      else alDia += 1;
    });

    return {
      total_equipos: statusByEquipo.size,
      al_dia: alDia,
      proximo,
      vencido,
      pendientes,
      realizados,
    };
  }

  async getEquipo(id: number): Promise<Equipo> {
    const response = await apiClient.get<any>(`/equipos/${id}`);
    return normalizeEquipo(unwrapObject<any>(response));
  }

  async registrarMantenimiento(data: Partial<RegistroMantenimiento>): Promise<RegistroMantenimiento> {
    return apiClient.post<RegistroMantenimiento>('/mantenimientos', data);
  }

  async getHistorialMantenimiento(idEquipo: number): Promise<RegistroMantenimiento[]> {
    const response = await apiClient.get<any>(`/mantenimientos/equipo/${idEquipo}/historial`);
    return unwrapArray<RegistroMantenimiento>(response);
  }

  // proveedoress
  
  async getProveedores(filtros?: FiltroProveedores): Promise<Proveedor[]> {
    const params: Record<string, any> = {};
    if (filtros?.busqueda) params.search = filtros.busqueda;
    if (filtros?.estado) params.estado = filtros.estado;
    const response = await apiClient.get<any>('/proveedores', params);
    return unwrapArray<any>(response).map(normalizeProveedor);
  }

  async getProveedor(id: number): Promise<Proveedor> {
    const response = await apiClient.get<any>(`/proveedores/${id}`);
    return normalizeProveedor(unwrapObject<any>(response));
  }

  async crearProveedor(data: Partial<Proveedor>): Promise<Proveedor> {
    return apiClient.post<Proveedor>('/proveedores', data);
  }

  async actualizarProveedor(id: number, data: Partial<Proveedor>): Promise<Proveedor> {
    return apiClient.patch<Proveedor>(`/proveedores/${id}`, data);
  }
}

export const almacenService = new AlmacenService();
