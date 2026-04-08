// ============================================================
// COMPONENTE TOAST - Notificaciones reutilizables
// Uso: import { mostrarToast } from '../../shared/toast';
//      mostrarToast('success', 'Título', 'Mensaje descriptivo');
// ============================================================

type ToastTipo = 'success' | 'error' | 'warning';

const iconos: Record<ToastTipo, string> = {
  success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
  warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
};

function cerrarToast(toast: HTMLElement) {
  toast.classList.add('toast-exit');
  setTimeout(() => toast.remove(), 300);
}

export function mostrarToast(tipo: ToastTipo, titulo: string, mensaje: string, duracionMs: number = 4000) {
  // Crear contenedor si no existe
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `
    <div class="toast-icon">${iconos[tipo]}</div>
    <div class="toast-content">
      <div class="toast-title">${titulo}</div>
      <div class="toast-message">${mensaje}</div>
    </div>
    <button class="toast-close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  // Cerrar al hacer clic en X
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => cerrarToast(toast));
  }

  // Auto-cerrar según duración configurada
  setTimeout(() => cerrarToast(toast), duracionMs);
}

// ============================================================
// COMPONENTE CONFIRM — Diálogo de confirmación reutilizable
// Uso: const ok = await confirmarAccion({ titulo, mensaje, tipo });
// ============================================================

interface ConfirmOpciones {
  titulo: string;
  mensaje: string;
  tipo?: ToastTipo;
  textoConfirmar?: string;
  textoCancelar?: string;
}

export function confirmarAccion(opciones: ConfirmOpciones): Promise<boolean> {
  const { titulo, mensaje, tipo = 'warning', textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar' } = opciones;

  return new Promise((resolve) => {
    // Remover overlay anterior si existe
    document.getElementById('confirm-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.className = 'confirm-overlay';

    overlay.innerHTML = `
      <div class="confirm-dialog confirm-${tipo}">
        <div class="confirm-header">
          <div class="confirm-icon-wrap confirm-icon-${tipo}">${iconos[tipo]}</div>
          <div class="confirm-titulo">${titulo}</div>
        </div>
        <div class="confirm-mensaje">${mensaje}</div>
        <div class="confirm-acciones">
          <button class="confirm-btn confirm-btn-cancelar">${textoCancelar}</button>
          <button class="confirm-btn confirm-btn-aceptar confirm-btn-${tipo}">${textoConfirmar}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnAceptar = overlay.querySelector('.confirm-btn-aceptar') as HTMLButtonElement;
    const btnCancelar = overlay.querySelector('.confirm-btn-cancelar') as HTMLButtonElement;

    function cerrar(resultado: boolean) {
      overlay.classList.add('confirm-exit');
      setTimeout(() => { overlay.remove(); resolve(resultado); }, 200);
    }

    btnAceptar.addEventListener('click', () => cerrar(true));
    btnCancelar.addEventListener('click', () => cerrar(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(false); });

    // Focus en el botón confirmar
    setTimeout(() => btnAceptar.focus(), 50);
  });
}
