import './login.css';
import { authService } from './auth.service';
import type { Credenciales, LoginError } from './auth.types';

const LOGO_URL = "http://backend.qsci-system.com/images/menu.png";

export function renderLogin() {
  return `
    <div class="auth-shell">
      <!-- Panel de Marca con Carrusel de Servicios -->
      <section class="brand-panel">
        
        <!-- Diapositivas (Imágenes de Servicios QSCI) -->
        <div class="carousel-slides">
          
          <!-- Slide 1: Control de Plagas -->
          <div class="carousel-slide active" data-slide="0">
            <img src="https://qsciconsulting.com/wp-content/uploads/2025/05/qsci-pest-control-fumigacion-y-control-de-plagas-2.png" 
                 alt="Manejo Integrado de Plagas">
            <div class="carousel-overlay"></div>
          </div>

          <!-- Slide 2: Inocuidad Alimentaria -->
          <div class="carousel-slide" data-slide="1">
            <img src="https://qsciconsulting.com/wp-content/uploads/2025/05/qsci-consulting-inocuidad-alimentariapng.png" 
                 alt="Inocuidad Alimentaria">
            <div class="carousel-overlay"></div>
          </div>

          <!-- Slide 3: Gestión de Calidad & Trazabilidad -->
          <div class="carousel-slide" data-slide="2">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80" 
                 alt="Auditoría y Certificación Sanitaria">
            <div class="carousel-overlay"></div>
          </div>

        </div>

        <!-- Encabezado Superior -->
        <div class="brand-header-top">
          <div class="brand-badge-pill">
            <img src="${LOGO_URL}" 
                 alt="Logo QSCI" 
                 class="brand-logo-img"
                 onload="this.style.display='block';"
                 onerror="this.style.display='none';">
            <span style="font-weight: 800; font-size: 14px; letter-spacing: -0.3px;">QSCI GROUP</span>
          </div>

          <!-- Botones de Navegación -->
          <div class="carousel-nav-arrows">
            <button type="button" id="prevSlideBtn" class="nav-arrow-btn" aria-label="Anterior">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button type="button" id="nextSlideBtn" class="nav-arrow-btn" aria-label="Siguiente">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        <!-- Contenido dinámico del Slide -->
        <div class="brand-slide-content">
          <div id="slideTag" class="slide-tag">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span id="slideTagText">Operaciones Sanitarias</span>
          </div>

          <h1 id="slideTitle">Gestión de Órdenes e Inspecciones MIP</h1>
          <p id="slideSubtitle" class="brand-subtitle">
            Control en tiempo real de fichas técnicas, visitas de campo y certificados para clientes.
          </p>

          <!-- Indicadores de Navegación (Dots) -->
          <div class="carousel-dots">
            <button type="button" class="dot-btn active" data-dot="0" aria-label="Diapositiva 1"></button>
            <button type="button" class="dot-btn" data-dot="1" aria-label="Diapositiva 2"></button>
            <button type="button" class="dot-btn" data-dot="2" aria-label="Diapositiva 3"></button>
          </div>

          <div class="brand-meta">Versión corporativa 2026</div>
        </div>

      </section>

      <section class="mobile-attendance-notice" role="status" aria-live="polite">
        <div class="mobile-attendance-card">
          <h2>Acceso no disponible en celular</h2>
          <p>Marque su asistencia por la laptop</p>
        </div>
      </section>

      <!-- Panel de Formulario de Login -->
      <section class="form-panel">
        <div class="form-card">
          <div class="form-logo-wrap">
            <img src="${LOGO_URL}" 
              width="74"
              alt="Logo QSCI"
              class="form-logo"
              onload="this.style.display='block';"
              onerror="console.error('No se pudo cargar el logo en:', this.src); this.alt='Error al cargar logo';">
          </div>
          <h2>Iniciar Sesión</h2>
          <p class="form-subtitle">Accede a tu cuenta empresarial QSCI</p>

          <form id="loginForm">
            <div class="form-group">
              <label class="form-label" for="email">Usuario</label>
              <div class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input 
                  type="text" 
                  id="email" 
                  class="form-input" 
                  placeholder="Ingrese su usuario"
                  autocomplete="username"
                >
              </div>
              <div class="error-message" id="emailError"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Contraseña</label>
              <div class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                <button type="button" id="togglePassword" class="password-toggle" aria-label="Mostrar u ocultar contraseña">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
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

            <button type="submit" class="btn-login" id="loginBtn">INICIAR SESIÓN</button>
            <div class="error-message" id="generalError" style="margin-top: 12px; text-align: center;"></div>
          </form>

          <div class="security-note">
            <span class="security-dot"></span>
            Conexión segura y sesión auditada
          </div>

          <div class="login-footer">
            © 2026 QSCI Group. Todos los derechos reservados.
          </div>
        </div>
      </section>
    </div>
  `;
}

export function initLoginEvents() {
  const form = document.getElementById('loginForm') as HTMLFormElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const rememberMeCheckbox = document.getElementById('rememberMe') as HTMLInputElement;
  const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
  const togglePasswordBtn = document.getElementById('togglePassword') as HTMLButtonElement;

  // Lógica del Carrusel (Enfoque Sistema Interno de Gestión)
  const slideInfo = [
    {
      tag: 'Operaciones Sanitarias',
      svgIcon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>',
      title: 'Gestión de Órdenes e Inspecciones MIP',
      subtitle: 'Control en tiempo real de fichas técnicas, visitas de campo y certificados para clientes.'
    },
    {
      tag: 'Control de Almacén & Flota',
      svgIcon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>',
      title: 'Inventario de Insumos y Flota Logística',
      subtitle: 'Seguimiento de kardex de productos, vencimiento de SOAT/mantenimientos y stock de químicos.'
    },
    {
      tag: 'Gestión Administrativa',
      svgIcon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      title: 'Reportes, Certificados y Facturación',
      subtitle: 'Emisión de informes técnicos, auditorías de calidad e historial de servicios programados.'
    }
  ];

  let currentSlide = 0;
  let carouselTimer: any = null;

  const slides = document.querySelectorAll<HTMLElement>('.carousel-slide');
  const dots = document.querySelectorAll<HTMLElement>('.dot-btn');
  const slideTag = document.getElementById('slideTag');
  const slideTitle = document.getElementById('slideTitle');
  const slideSubtitle = document.getElementById('slideSubtitle');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');

  function updateSlide(index: number) {
    if (slides.length === 0) return;
    slides.forEach((s) => s.classList.remove('active'));
    dots.forEach((d) => d.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');

    const info = slideInfo[currentSlide];
    if (info) {
      if (slideTag) slideTag.innerHTML = `${info.svgIcon} <span>${info.tag}</span>`;
      if (slideTitle) slideTitle.textContent = info.title;
      if (slideSubtitle) slideSubtitle.textContent = info.subtitle;
    }
  }

  function startCarousel() {
    stopCarousel();
    carouselTimer = setInterval(() => {
      updateSlide(currentSlide + 1);
    }, 4500);
  }

  function stopCarousel() {
    if (carouselTimer) clearInterval(carouselTimer);
  }

  prevBtn?.addEventListener('click', () => {
    updateSlide(currentSlide - 1);
    startCarousel();
  });

  nextBtn?.addEventListener('click', () => {
    updateSlide(currentSlide + 1);
    startCarousel();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.dataset.dot || 0);
      updateSlide(idx);
      startCarousel();
    });
  });

  startCarousel();

  // Limpiar errores al escribir
  emailInput?.addEventListener('input', () => clearError('email'));
  passwordInput?.addEventListener('input', () => clearError('password'));

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.classList.toggle('active', isPassword);
    });
  }

  // Manejar submit del formulario
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearAllErrors();

    const credenciales: Credenciales = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      rememberMe: rememberMeCheckbox ? rememberMeCheckbox.checked : false
    };

    if (!credenciales.email) {
      showError('email', 'Por favor ingresa tu email');
      return;
    }

    if (!credenciales.password) {
      showError('password', 'Por favor ingresa tu contraseña');
      return;
    }

    loginBtn.disabled = true;
    const originalText = loginBtn.textContent || '';
    loginBtn.textContent = 'Iniciando sesión...';

    try {
      const response = await authService.login(credenciales);

      if (response.success) {
        loginBtn.textContent = '✓ Sesión iniciada';
        window.location.href = './dashboard.html';
      }
    } catch (error) {
      const loginError = error as LoginError;

      if (loginError.field) {
        showError(loginError.field, loginError.message);
      } else {
        showError('general', loginError.message || 'Error al iniciar sesión');
      }

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
