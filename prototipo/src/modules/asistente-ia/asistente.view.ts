import { authService } from '../auth/auth.service';
import { tieneAccesoModulo } from '../auth/auth.guard';
import { getDbContextForQuery } from './asistente.context';
import { queryGeminiApi } from './asistente.api';

interface ChatMessage {
  sender: 'user' | 'bot';
  contentHtml: string;
}

const STORAGE_KEY_HISTORY = 'qsci_ia_chat_history_v1';
const STORAGE_KEY_PANEL_OPEN = 'qsci_ia_panel_open_v1';

function getStoredHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ChatMessage[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch {}
}

function isPanelOpen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY_PANEL_OPEN) === 'true';
  } catch {
    return false;
  }
}

function setPanelOpen(isOpen: boolean): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_PANEL_OPEN, isOpen ? 'true' : 'false');
  } catch {}
}

export function renderAsistenteIaWidget(): string {
  const usuario = authService.getUser();
  if (!usuario) return '';

  const nombreUsuario = usuario.nombre || 'Usuario';
  const rolUsuario = usuario.rol || 'Invitado';
  const openClass = isPanelOpen() ? '' : 'hidden';
  const history = getStoredHistory();

  let bodyHtml = '';
  if (history.length > 0) {
    bodyHtml = history.map(msg => `
      <div class="qsci-chat-msg ${msg.sender}">
        <div class="qsci-chat-bubble">${msg.contentHtml}</div>
      </div>
    `).join('');
  } else {
    bodyHtml = `
      <div class="qsci-chat-msg bot">
        <div class="qsci-chat-bubble">
          Hola <strong>${nombreUsuario}</strong>. Soy tu asistente virtual QSCI IA. Puedo consultarte datos de stock, programaciones, cotizaciones o finanzas en tiempo real según tus permisos (Rol: <em>${rolUsuario}</em>).
        </div>
      </div>
    `;
  }

  return `
    <div id="qsci-ia-container" class="qsci-ia-container">
      <!-- Botón Flotante -->
      <button id="qsci-ia-trigger" class="qsci-ia-trigger" title="Asistente Virtual QSCI IA" aria-label="Abrir Asistente Virtual">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8.01" y2="16"></line>
          <line x1="16" y1="16" x2="16.01" y2="16"></line>
        </svg>
        <span class="qsci-ia-pulse"></span>
      </button>

      <!-- Panel Flotante de Chat -->
      <div id="qsci-ia-panel" class="qsci-ia-panel ${openClass}">
        <!-- Encabezado -->
        <div class="qsci-ia-header">
          <div class="qsci-ia-header-title">
            <div class="qsci-ia-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8.01" y2="16"></line>
                <line x1="16" y1="16" x2="16.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <h4 class="qsci-ia-name">Asistente QSCI IA</h4>
              <span class="qsci-ia-status"><span class="qsci-status-dot"></span> En línea &bull; Conectado a BD</span>
            </div>
          </div>
          <div class="qsci-ia-header-actions">
            <button id="qsci-ia-expand" class="qsci-ia-icon-btn" title="Agrandar / Restaurar">
              <svg id="qsci-ia-expand-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <button id="qsci-ia-clear" class="qsci-ia-icon-btn" title="Limpiar conversación">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button id="qsci-ia-minimize" class="qsci-ia-icon-btn" title="Minimizar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Cuerpo / Registro de Chat -->
        <div id="qsci-ia-body" class="qsci-ia-body">
          ${bodyHtml}
        </div>

        <!-- Chips Dinámicos de Sugerencia -->
        <div id="qsci-ia-chips" class="qsci-ia-chips">
          ${getDynamicChips()}
        </div>

        <!-- Pie de página / Entrada -->
        <div class="qsci-ia-footer">
          <form id="qsci-ia-form" class="qsci-ia-form">
            <input type="text" id="qsci-ia-input" class="qsci-ia-input" placeholder="Haz una consulta sobre el sistema..." autocomplete="off" />
            <button type="submit" class="qsci-ia-send-btn" title="Enviar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function getDynamicChips(): string {
  const chips: string[] = [];
  
  if (tieneAccesoModulo('inventario')) {
    chips.push(`<button class="qsci-chip-btn" data-query="¿Cuál es el stock actual de reactivos?">Stock Reactivos</button>`);
  }
  if (tieneAccesoModulo('programaciones')) {
    chips.push(`<button class="qsci-chip-btn" data-query="¿Qué servicios hay programados para hoy?">Servicios Hoy</button>`);
  }
  if (tieneAccesoModulo('cotizaciones')) {
    chips.push(`<button class="qsci-chip-btn" data-query="¿Cuántas cotizaciones están pendientes?">Cotizaciones Pendientes</button>`);
  }
  if (tieneAccesoModulo('finanzas')) {
    chips.push(`<button class="qsci-chip-btn" data-query="¿Cuál es el balance financiero del mes?">Balance Finanzas</button>`);
  }
  if (tieneAccesoModulo('rrhh-asistencia')) {
    chips.push(`<button class="qsci-chip-btn" data-query="¿Cuántos colaboradores registraron asistencia?">Asistencia RRHH</button>`);
  }

  return chips.join('');
}

export function initAsistenteIaEvents(): void {
  const triggerBtn = document.getElementById('qsci-ia-trigger');
  const panel = document.getElementById('qsci-ia-panel');
  const minimizeBtn = document.getElementById('qsci-ia-minimize');
  const clearBtn = document.getElementById('qsci-ia-clear');
  const form = document.getElementById('qsci-ia-form') as HTMLFormElement | null;
  const input = document.getElementById('qsci-ia-input') as HTMLInputElement | null;
  const body = document.getElementById('qsci-ia-body');
  const chipsContainer = document.getElementById('qsci-ia-chips');

  const expandBtn = document.getElementById('qsci-ia-expand');

  if (!triggerBtn || !panel || !body) return;

  // Auto-scroll al final al montar
  body.scrollTop = body.scrollHeight;

  triggerBtn.addEventListener('click', () => {
    const isHidden = panel.classList.toggle('hidden');
    setPanelOpen(!isHidden);
    if (!isHidden && input) {
      input.focus();
      body.scrollTop = body.scrollHeight;
    }
  });

  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      panel.classList.toggle('expanded');
    });
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      panel.classList.add('hidden');
      setPanelOpen(false);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const usuario = authService.getUser();
      const nombreUsuario = usuario ? usuario.nombre : 'Usuario';
      const rolUsuario = usuario ? usuario.rol : 'Invitado';

      const initialMessage: ChatMessage = {
        sender: 'bot',
        contentHtml: `Hola <strong>${nombreUsuario}</strong>. ¿En qué puedo ayudarte?`
      };
      saveHistory([initialMessage]);
      body.innerHTML = `
        <div class="qsci-chat-msg bot">
          <div class="qsci-chat-bubble">${initialMessage.contentHtml}</div>
        </div>
      `;
    });
  }

  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('qsci-chip-btn')) {
        const query = target.getAttribute('data-query');
        if (query && input) {
          input.value = query;
          processUserQuery(query);
          input.value = '';
        }
      }
    });
  }

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      processUserQuery(query);
      input.value = '';
    });
  }

  async function processUserQuery(userQuery: string): Promise<void> {
    appendMessage(userQuery, 'user');
    const loadingId = appendLoadingMessage();

    try {
      // 1. Obtener contexto de BD y evaluar permisos RBAC
      const dbResult = await getDbContextForQuery(userQuery);

      if (!dbResult.hasAccess) {
        removeLoadingMessage(loadingId);
        appendRestrictedAccessMessage(dbResult.moduleName || 'este módulo');
        return;
      }

      // 2. Consultar a Gemini API / Motor contextual con el contexto de la BD
      const botResponseHtml = await queryGeminiApi(userQuery, dbResult.contextSummary);
      removeLoadingMessage(loadingId);
      appendMessage(botResponseHtml, 'bot');
    } catch (err) {
      removeLoadingMessage(loadingId);
      appendMessage('Lo siento, ocurrió un inconveniente al procesar tu consulta. Por favor intenta de nuevo.', 'bot');
    }
  }

  function appendMessage(contentHtml: string, sender: 'user' | 'bot'): void {
    if (!body) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `qsci-chat-msg ${sender}`;
    msgDiv.innerHTML = `<div class="qsci-chat-bubble">${contentHtml}</div>`;
    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;

    // Guardar en persistencia de sesión
    const history = getStoredHistory();
    history.push({ sender, contentHtml });
    saveHistory(history);
  }

  function appendRestrictedAccessMessage(moduloNombre: string): void {
    const accessDeniedHtml = `
      <div class="qsci-restricted-alert">
        <div class="qsci-restricted-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="qsci-icon-lock">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <strong>Acceso Restringido</strong>
        </div>
        <p>No tienes los permisos necesarios para acceder a la información del módulo de <strong>${moduloNombre}</strong>.</p>
        <p class="qsci-restricted-hint">Si requieres acceso a estos datos, solicita los permisos a tu administrador del sistema.</p>
      </div>
    `;
    appendMessage(accessDeniedHtml, 'bot');
  }

  function appendLoadingMessage(): string {
    if (!body) return '';
    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'qsci-chat-msg bot';
    loadingDiv.innerHTML = `
      <div class="qsci-chat-bubble qsci-loading-bubble">
        <span class="qsci-dot"></span>
        <span class="qsci-dot"></span>
        <span class="qsci-dot"></span>
      </div>
    `;
    body.appendChild(loadingDiv);
    body.scrollTop = body.scrollHeight;
    return id;
  }

  function removeLoadingMessage(id: string): void {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}
