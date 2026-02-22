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
  
  // Auto-refresh de la sesión: extender expiración periódicamente
  setupTokenRefresh();
}

function setupTokenRefresh(): void {
  // Renovar la sesión mock localmente cada 30 minutos
  // (El token Sanctum no expira por sí solo a menos que se configure)
  const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

  setInterval(() => {
    if (authService.isAuthenticated()) {
      authService.extendMockSession();
    }
  }, REFRESH_INTERVAL_MS);
}

/**
 * Verifica si el usuario tiene permiso para acceder a un módulo específico.
 * Gerencia (permisos: ['*']) tiene acceso a todo.
 */
export function tieneAccesoModulo(modulo: string): boolean {
  const user = authService.getUser();
  if (!user) return false;
  
  // '*' = acceso total (Gerencia)
  if (user.permisos.includes('*')) return true;
  
  return user.permisos.includes(modulo);
}

/**
 * Retorna la lista de permisos del usuario logueado.
 */
export function getPermisos(): string[] {
  const user = authService.getUser();
  return user?.permisos || [];
}
