import { authService } from './auth.service';

export function requireAuth(): void {
  if (!authService.isAuthenticated()) {
    // No hay sesión válida - redirigir a login
    window.location.href = '/';
  }
}

export function requireRole(...roles: string[]): boolean {
  const user = authService.getUser();
  if (!user) return false;
  
  return roles.includes(user.rol);
}

export function hasPermission(permission: string): boolean {
  const user = authService.getUser();
  if (!user) return false;
  
  // Admin tiene todos los permisos
  if (user.permisos.includes('*')) return true;
  
  return user.permisos.includes(permission);
}

export function initAuthGuard(): void {
  requireAuth();
  
  // Auto-refresh del token antes de que expire
  setupTokenRefresh();
}

function setupTokenRefresh(): void {
  // Intentar refrescar el token 5 minutos antes de que expire
  const REFRESH_BEFORE_MS = 5 * 60 * 1000; // 5 minutos
  
  setInterval(async () => {
    try {
      if (authService.isAuthenticated()) {
        await authService.refreshToken();
      }
    } catch (error) {
      console.error('Error al refrescar token:', error);
      // Si falla el refresh, hacer logout
      authService.logout();
    }
  }, REFRESH_BEFORE_MS);
}
