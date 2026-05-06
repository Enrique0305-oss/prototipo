import { apiClient } from '../../../core/api/api.client';

export interface FormatoOperacionalDispositivoDisponible {
  id_producto: number;
  descripcion: string;
  cantidad: number;
  id_lote?: number | null;
}

export interface FormatoOperacionalAsignacionSeccion {
  clave?: string;
  formato?: string;
  titulo: string;
  tipo_seccion?: string;
  tipo_contenido?: string;
  cantidad_disponible: number;
  cantidad: number;
  cantidad_asignada?: number;
  descripcion?: string;
  nota?: string;
}

export interface FormatoOperacionalCalculoDispositivos {
  totales: {
    cajas_cebaderas: number;
    jaulas: number;
    cebos: number;
    laminas: number;
    trampas_luz: number;
    otros: number;
  };
  dispositivos: {
    cajas_cebaderas: FormatoOperacionalDispositivoDisponible[];
    jaulas: FormatoOperacionalDispositivoDisponible[];
    cebos: FormatoOperacionalDispositivoDisponible[];
    laminas: FormatoOperacionalDispositivoDisponible[];
    otros: FormatoOperacionalDispositivoDisponible[];
  };
}

export interface FormatoOperacionalCalculoRespuesta {
  formatos_aplicados: string[];
  dispositivos: FormatoOperacionalCalculoDispositivos;
  secciones: FormatoOperacionalAsignacionSeccion[];
  resumen: {
    total_secciones: number;
    total_items: number;
  };
}

export interface FormatoOperacionalCreacionPayload {
  secciones: FormatoOperacionalAsignacionSeccion[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const formatoOperacionalAutomaticoService = {
  calcular: async (idProgramacion: number, idsProgramaciones?: number[]) => {
    return apiClient.post<ApiResponse<FormatoOperacionalCalculoRespuesta>>(
      `/programacion-servicio/${idProgramacion}/calcular-formato-operacional`,
      idsProgramaciones && idsProgramaciones.length > 0
        ? { ids_programaciones: idsProgramaciones }
        : {}
    );
  },

  crear: async (idProgramacion: number, payload: FormatoOperacionalCreacionPayload) => {
    return apiClient.post<ApiResponse<any>>(
      `/programacion-servicio/${idProgramacion}/crear-formato-operacional`,
      payload
    );
  },
};
