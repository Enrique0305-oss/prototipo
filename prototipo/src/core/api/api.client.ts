import { API_CONFIG } from './api.config';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.baseURL;
    this.defaultHeaders = API_CONFIG.headers;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildURL(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = this.buildURL(endpoint);
    const headers: Record<string, string> = {};
    const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // No incluir Content-Type — el navegador lo agrega automáticamente con boundary
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    // Remover barra inicial del endpoint si existe
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Asegurar que baseURL termine con /
    const baseURL = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    
    // Construir URL completa
    const url = new URL(cleanEndpoint, baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    
    // Buscar token en ambos storages (sessionStorage primero, luego localStorage)
    const token = sessionStorage.getItem('qsci_token') || localStorage.getItem('qsci_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      throw new ApiError(
        response.status,
        response.statusText,
        errorData
      );
    }

    // Si no hay contenido, retornar vacío
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async downloadFile(endpoint: string, filename: string): Promise<void> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
