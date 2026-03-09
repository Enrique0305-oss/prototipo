import { apiClient } from '../core/api/api.client';

export const personalService = {

  getUsuarios: async (filtros?: { search?: string; estado?: string; id_area?: number }) => {
    return apiClient.get<any>('/personal/usuarios', filtros);
  },

  getUsuario: async (id: number) => {
    return apiClient.get<any>(`/personal/usuarios/${id}`);
  },

  createUsuario: async (data: any) => {
    return apiClient.post<any>('/personal/usuarios', data);
  },

  updateUsuario: async (id: number, data: any) => {
    return apiClient.post<any>(`/personal/usuarios/${id}`, { ...data, _method: 'PUT' });
  },

  toggleEstado: async (id: number) => {
    return apiClient.post<any>(`/personal/usuarios/${id}/estado`, { _method: 'PATCH' });
  },

  resetPassword: async (id: number, password: string) => {
    return apiClient.post<any>(`/personal/usuarios/${id}/reset-password`, { password, _method: 'PATCH' });
  },

  getAreasLista: async () => {
    return apiClient.get<any>('/personal/areas-lista');
  },
};
