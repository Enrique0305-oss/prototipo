import { apiClient } from '../core/api/api.client';
import type { ApiResponse } from '../core/api/types';

export interface InformeTecnico {
  id?: number;
  correlativo?: string;
  id_cliente: number;
  id_usuario_creador?: number;
  mes_actividad: string;
  fecha_emision: string;
  elaborado_por?: string;
  actividad?: string;
  ubicacion?: string;
  hoja_tipo: 'verdadera' | 'falsa';
  visitas?: any[];
  evidencias?: any[];
  conclusiones?: string | {
    roedores?: string;
    voladores?: string;
  };
  insumos?: any[];
  estado?: string;
  created_at?: string;
  cliente?: {
    id: number;
    nombre_empresa: string;
  };
}

export const informeTecnicoService = {
  getAll: async () => {
    return apiClient.get<ApiResponse<InformeTecnico[]>>('/informes-tecnicos');
  },

  getById: async (id: number) => {
    return apiClient.get<ApiResponse<InformeTecnico>>(`/informes-tecnicos/${id}`);
  },

  create: async (data: InformeTecnico) => {
    return apiClient.post<ApiResponse<InformeTecnico>>('/informes-tecnicos', data);
  },

  update: async (id: number, data: Partial<InformeTecnico>) => {
    return apiClient.post<ApiResponse<InformeTecnico>>(`/informes-tecnicos/${id}`, {
      ...data,
      _method: 'PUT',
    });
  },

  delete: async (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/informes-tecnicos/${id}`);
  },

  getProximoCorrelativo: async () => {
    return apiClient.get<{ success: boolean; correlativo: string }>('/informes-tecnicos/proximo-correlativo');
  },

  downloadPDF: async (id: number, filename: string) => {
    return apiClient.downloadFile(`/informes-tecnicos/${id}/pdf`, filename);
  }
};
