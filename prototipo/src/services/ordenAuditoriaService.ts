import { apiClient } from '../core/api/api.client';

export const ordenAuditoriaService = {
  getEstadisticas: async () => apiClient.get('/ordenes-auditoria/estadisticas/resumen'),
  getAll: async (filters?: any) => apiClient.get('/ordenes-auditoria', filters),
  getCotizacionesDisponibles: async () => apiClient.get('/ordenes-auditoria/cotizaciones-disponibles'),
  getCotizacionById: async (id: number) => apiClient.get(`/cotizaciones/${id}`),
  getDesdeCotizacion: async (cotizacionId: number) => apiClient.get(`/ordenes-auditoria/desde-cotizacion/${cotizacionId}`),
  getExponentes: async () => apiClient.get('/exponentes', { estado: 'Activo' }),
  create: async (data: any) => apiClient.post('/ordenes-auditoria', data),
  getById: async (id: number) => apiClient.get(`/ordenes-auditoria/${id}`),
  update: async (id: number, data: any) => apiClient.post(`/ordenes-auditoria/${id}`, { ...data, _method: 'PUT' }),
  delete: async (id: number) => apiClient.delete(`/ordenes-auditoria/${id}`),
  downloadPDF: async (id: number) => apiClient.downloadFile(`/ordenes-auditoria/${id}/pdf`, `orden_auditoria_${id}.pdf`),
};