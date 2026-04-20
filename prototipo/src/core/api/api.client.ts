import { API_CONFIG } from './api.config';

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;
  public method?: string;
  public url?: string;

  constructor(
    status: number,
    statusText: string,
    data?: any,
    method?: string,
    url?: string
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.method = method;
    this.url = url;
  }
}

type RequestMeta = {
  method: string;
  url: string;
};

function stripHtmlTags(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPreview(input: string, max = 600): string {
  const trimmed = input.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
}

export function getApiErrorDebugInfo(error: unknown): Record<string, any> {
  if (!(error instanceof ApiError)) {
    return { type: 'unknown', error };
  }

  const parsed = error.data?.parsedBody || {};

  return {
    type: 'ApiError',
    status: error.status,
    statusText: error.statusText,
    method: error.method,
    url: error.url,
    message: error.data?.message || parsed?.message || error.message,
    exception: error.data?.exception || parsed?.exception,
    file: error.data?.file || parsed?.file,
    line: error.data?.line || parsed?.line,
    trace: error.data?.trace || parsed?.trace,
    responseHeaders: error.data?.headers,
    bodyPreview: error.data?.bodyPreview,
    rawBody: error.data?.rawBody,
    parsedBody: parsed,
  };
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

    return this.handleResponse<T>(response, { method: 'GET', url });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response, { method: 'POST', url });
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

    return this.handleResponse<T>(response, { method: 'POST', url });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response, { method: 'PATCH', url });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response, { method: 'PUT', url });
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildURL(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response, { method: 'DELETE', url });
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

  private async handleResponse<T>(response: Response, requestMeta: RequestMeta): Promise<T> {
    if (!response.ok) {
      const rawBody = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const headers = Object.fromEntries(response.headers.entries());
      let parsedBody: any = null;

      if (rawBody) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = null;
        }
      }

      const plainPreview = rawBody
        ? toPreview(contentType.includes('text/html') ? stripHtmlTags(rawBody) : rawBody)
        : '';

      const errorData = {
        message: parsedBody?.message || plainPreview || response.statusText || 'Error inesperado del servidor',
        headers,
        parsedBody,
        rawBody,
        bodyPreview: plainPreview,
      };
      
      throw new ApiError(
        response.status,
        response.statusText,
        errorData,
        requestMeta.method,
        requestMeta.url
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
      let errorData: any = { message: response.statusText };
      try {
        const raw = await response.text();
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            errorData = {
              message: parsed?.message || response.statusText,
              parsedBody: parsed,
              rawBody: raw,
              bodyPreview: toPreview(raw),
            };
          } catch {
            errorData = {
              message: toPreview(stripHtmlTags(raw)) || response.statusText,
              rawBody: raw,
              bodyPreview: toPreview(stripHtmlTags(raw)),
            };
          }
        }
      } catch {
        // Mantener mensaje por defecto si no se puede leer el body.
      }

      throw new ApiError(response.status, response.statusText, errorData, 'GET', url);
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
