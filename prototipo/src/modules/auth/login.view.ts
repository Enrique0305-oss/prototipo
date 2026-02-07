import './login.css';
import { authService } from './auth.service';
import type { Credenciales, LoginError } from './auth.types';

export function renderLogin() {
  return `
    <div class="login-container">
      <div class="login-header">
        <div class="logo-container">
          <div class="logo-text">QG</div>
        </div>
        <h1>QSCI Group</h1>
        <p>Panel de Administración</p>
      </div>

      <div class="login-body">
        <form id="loginForm">
          <div class="form-group">
            <label class="form-label" for="email">Usuario o Correo Electrónico</label>
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                type="text" 
                id="email" 
                class="form-input" 
                placeholder="admin@qscigroup.com"
                autocomplete="username"
              >
            </div>
            <div class="error-message" id="emailError"></div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <div class="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                type="password" 
                id="password" 
                class="form-input" 
                placeholder="••••••••"
                autocomplete="current-password"
              >
            </div>
            <div class="error-message" id="passwordError"></div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" id="rememberMe">
              Recordarme
            </label>
            <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" class="btn-login" id="loginBtn">Iniciar Sesión</button>
          <div class="error-message" id="generalError" style="margin-top: 12px; text-align: center;"></div>
        </form>
      </div>

      <div class="login-footer">
        ¿No tienes una cuenta? <a href="#">Solicitar acceso</a>
      </div>
    </div>
  `;
}

export function initLoginEvents() {
  const form = document.getElementById('loginForm') as HTMLFormElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const rememberMeCheckbox = document.getElementById('rememberMe') as HTMLInputElement;
  const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;

  // Limpiar errores al escribir
  emailInput.addEventListener('input', () => clearError('email'));
  passwordInput.addEventListener('input', () => clearError('password'));

  // Manejar submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    clearAllErrors();

    const credenciales: Credenciales = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      rememberMe: rememberMeCheckbox.checked
    };

    // Validación básica
    if (!credenciales.email) {
      showError('email', 'Por favor ingresa tu email');
      return;
    }

    if (!credenciales.password) {
      showError('password', 'Por favor ingresa tu contraseña');
      return;
    }

    // Deshabilitar botón y mostrar loading
    loginBtn.disabled = true;
    const originalText = loginBtn.textContent || '';
    loginBtn.textContent = 'Iniciando sesión...';

    try {
      // Usar loginMock mientras no haya backend
      const response = await authService.loginMock(credenciales);

      if (response.success) {
        // Login exitoso - redirigir al dashboard
        loginBtn.textContent = '✓ Sesión iniciada';
        // Navegar inmediatamente sin delay
        window.location.href = './dashboard.html';
      }
    } catch (error) {
      // Manejar error de login
      const loginError = error as LoginError;
      
      if (loginError.field) {
        showError(loginError.field, loginError.message);
      } else {
        showError('general', loginError.message || 'Error al iniciar sesión');
      }

      // Restaurar botón
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;
    }
  });
}

function showError(field: 'email' | 'password' | 'general', message: string) {
  const errorElement = document.getElementById(`${field}Error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  if (field !== 'general') {
    const inputElement = document.getElementById(field) as HTMLInputElement;
    if (inputElement) {
      inputElement.classList.add('error');
    }
  }
}

function clearError(field: string) {
  const errorElement = document.getElementById(`${field}Error`);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }

  const inputElement = document.getElementById(field) as HTMLInputElement;
  if (inputElement) {
    inputElement.classList.remove('error');
  }
}

function clearAllErrors() {
  ['email', 'password', 'general'].forEach(field => clearError(field));
}
