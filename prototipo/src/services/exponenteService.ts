import { apiClient } from '../core/api/api.client';

export interface Exponente {
  id: number;
  nombre: string;
  apellidos: string;
  especialidad: string | null;
  profesion: string | null;
  telefono: string | null;
  email: string | null;
  institucion: string | null;
  notas: string | null;
  estado: 'Activo' | 'Inactivo';
  presentacion: string | null;
}

export const exponenteService = {
  getAll: async (filters?: { search?: string; estado?: string }) => {
    return apiClient.get<{ success: boolean; data: Exponente[] }>('/exponentes', filters);
  },

  getById: async (id: number) => {
    return apiClient.get<{ success: boolean; data: Exponente }>(`/exponentes/${id}`);
  },

  create: async (data: Partial<Exponente>) => {
    return apiClient.post<{ success: boolean; message: string; data: Exponente }>('/exponentes', data);
  },

  update: async (id: number, data: Partial<Exponente>) => {
    return apiClient.put<{ success: boolean; message: string; data: Exponente }>(`/exponentes/${id}`, data);
  },

  delete: async (id: number) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/exponentes/${id}`);
  },
};
