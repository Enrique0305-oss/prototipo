// Tipos genéricos de respuesta
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Estados comunes
export type EstadoGeneral = 'Activo' | 'Inactivo';

// Tipos de badge/estados visuales
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

// Tabla genérica
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => string;
}

//Filtros genéricos
export interface BaseFilter {
  search?: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  estado?: string;
  page?: number;
  pageSize?: number;
}
