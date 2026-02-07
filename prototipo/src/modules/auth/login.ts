import { renderLogin, initLoginEvents } from './login.view';
import { authService } from './auth.service';

// Verificar si ya está autenticado ANTES de renderizar
if (authService.isAuthenticated()) {
  window.location.href = './dashboard.html';
} else {
  // Solo renderizar si NO está autenticado
  document.body.innerHTML = renderLogin();
  initLoginEvents();
}
