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
  // TODO: Habilitar cuando se implemente login real con backend
  // Por ahora con loginMock no hay endpoint de refresh, así que solo
  // renovamos el token mock localmente cada 30 minutos
  const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

  setInterval(() => {
    if (authService.isAuthenticated()) {
      // Renovar expiración del token mock sin llamar al backend
      authService.extendMockSession();
    }
  }, REFRESH_INTERVAL_MS);
}
