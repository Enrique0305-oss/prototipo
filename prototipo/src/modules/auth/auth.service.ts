import { apiClient } from '../../core/api/api.client';
import { API_ENDPOINTS } from '../../core/api/api.config';
import type { 
  Credenciales, 
  AuthResponse, 
  Usuario, 
  SessionData,
  LoginError 
} from './auth.types';

class AuthService {
  private TOKEN_KEY = 'qsci_token';
  private REFRESH_TOKEN_KEY = 'qsci_refresh_token';
  private USER_KEY = 'qsci_user';
  private SESSION_KEY = 'qsci_session';

  async login(credenciales: Credenciales): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.login,
        credenciales
      );
      
      if (response.success) {
        this.saveSession(response, credenciales.rememberMe);
      }
      
      return response;
    } catch (error) {
      throw this.handleLoginError(error);
    }
  }

  async loginMock(credenciales: Credenciales): Promise<AuthResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));

    // Validación simple
    if (!credenciales.email || !credenciales.password) {
      throw { field: 'general', message: 'Por favor completa todos los campos' };
    }

    if (credenciales.password.length < 6) {
      throw { field: 'password', message: 'Contraseña muy corta' };
    }

    // Usuario mock
    const mockResponse: AuthResponse = {
      success: true,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600, // 1 hora
      usuario: {
        id: 1,
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: credenciales.email,
        rol: 'Admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=2c4a7c&color=fff',
        permisos: ['*'],
        departamento: 'Administración',
        telefono: '+51 999 999 999',
        fechaCreacion: '2024-01-01T00:00:00Z',
        ultimoAcceso: new Date().toISOString()
      }
    };

    this.saveSession(mockResponse, credenciales.rememberMe);
    return mockResponse;
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Notificar al servidor (ignorar errores)
      await apiClient.post(API_ENDPOINTS.logout, {}).catch(() => {});
    } finally {
      this.clearSession();
      window.location.href = '/';
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.refresh,
      { refreshToken }
    );
    
    if (response.success) {
      this.saveSession(response);
    }
    
    return response;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    const expiresAt = this.getExpiresAt();

    if (!token || !user) {
      // Si falta información, limpiar sesión inválida
      this.clearSession();
      return false;
    }
    
    // Verificar si el token ha expirado
    if (expiresAt && Date.now() > expiresAt) {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Verificar si hay una sesión activa (para redirect)
   * @deprecated Usar isAuthenticated() en su lugar
   */
  hasActiveSession(): boolean {
    return this.isAuthenticated();
  }

  private getFromStorage(key: string): string | null {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  }

  getToken(): string | null {
    return this.getFromStorage(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.getFromStorage(this.REFRESH_TOKEN_KEY);
  }

  getUser(): Usuario | null {
    const userJson = this.getFromStorage(this.USER_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  private getExpiresAt(): number | null {
    const sessionJson = this.getFromStorage(this.SESSION_KEY);
    try {
      const session = sessionJson ? JSON.parse(sessionJson) : null;
      return session?.expiresAt || null;
    } catch {
      return null;
    }
  }

  private saveSession(response: AuthResponse, remember: boolean = false): void {
    const expiresAt = Date.now() + (response.expiresIn * 1000);
    
    const sessionData: SessionData = {
      usuario: response.usuario,
      token: response.token,
      refreshToken: response.refreshToken,
      expiresAt,
      loginTime: new Date().toISOString()
    };

    // Guardar en localStorage o sessionStorage según "recordarme"
    const storage = remember ? localStorage : sessionStorage;
    
    storage.setItem(this.TOKEN_KEY, response.token);
    storage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    storage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
    storage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }

  private clearSession(): void {
    // Limpiar de ambos storages
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
      storage.removeItem(this.SESSION_KEY);
    });
  }

  private handleLoginError(error: any): LoginError {
    if (error.field && error.message) {
      return error as LoginError;
    }

    if (error.response?.status === 401) {
      return { field: 'general', message: 'Credenciales incorrectas' };
    }

    if (error.response?.status === 429) {
      return { field: 'general', message: 'Demasiados intentos. Intenta más tarde' };
    }

    return { field: 'general', message: 'Error al iniciar sesión. Intenta nuevamente' };
  }
}

export const authService = new AuthService();
