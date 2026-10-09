/**
 * Configuración interna del Asistente Virtual QSCI IA
 * La API Key se gestiona internamente vía variables de entorno o constantes internas.
 * No se expone ningún control de configuración al usuario final en la interfaz.
 */

export const ASISTENTE_IA_CONFIG = {
  // Obtiene la API Key desde las variables de entorno de Vite o fallback interno
  getApiKey(): string {
    return import.meta.env.VITE_GEMINI_API_KEY || (window as any).__QSCI_GEMINI_KEY__ || '';
  },
  model: 'gemini-3.1-flash-lite',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
  
  systemInstruction: `Eres QSCI IA, el asistente virtual oficial del sistema ERP y logístico QSCI.
Tu propósito es ayudar a los usuarios respondiendo dudas operativas, de inventario, cotizaciones, programaciones y finanzas.

REGLAS DE RESPUESTA:
1. Responde de forma concisa, profesional y estructurada en español.
2. Utiliza estrictamente la información provista en el CONTEXTO DE LA BASE DE DATOS.
3. Si el usuario pregunta por un módulo al que no tiene acceso, recuérdale amable y formalmente sus permisos.
4. Puedes formatear tus respuestas usando HTML limpio (tablas <table class="qsci-chat-table">, listas <ul><li>, negritas <strong>, párrafos <p>).
5. ESTÁ ABSOLUTAMENTE PROHIBIDO EL USO DE EMOJIS O EMOJIS DE TEXTO EN TUS RESPUESTAS. Utiliza solo lenguaje formal y claro.`
};
