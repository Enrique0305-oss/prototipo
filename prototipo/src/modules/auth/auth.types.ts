export interface Credenciales {
  email: string;   // Se usa como 'usuario' al enviar al backend
  password: string;
  rememberMe?: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  avatar?: string;
  permisos: string[];
  departamento?: string;
  telefono?: string;
  fechaCreacion: string;
  ultimoAcceso?: string;
  id_area?: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  refreshToken: string;
  usuario: Usuario;
  expiresIn: number; // segundos
}

export interface AuthState {
  isAuthenticated: boolean;
  usuario: Usuario | null;
  token: string | null;
  expiresAt: number | null;
}

export interface LoginError {
  field?: 'email' | 'password' | 'general';
  message: string;
}

export interface SessionData {
  usuario: Usuario;
  token: string;
  refreshToken: string;
  expiresAt: number;
  loginTime: string;
}
