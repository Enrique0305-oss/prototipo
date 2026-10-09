import { ASISTENTE_IA_CONFIG } from './asistente.config';

/**
 * Consulta a la API oficial de Google Gemini utilizando la clave VITE_GEMINI_API_KEY.
 * Envía el contexto extraído de la BD y solicita diagnóstico + sugerencias ejecutivas.
 * Si la API Key no está configurada o hay un error de red/servidor, retorna un mensaje
 * claro de servicio no disponible sin usar plantillas locales estáticas.
 */
export async function queryGeminiApi(userQuery: string, dbContext: string): Promise<string> {
  const apiKey = ASISTENTE_IA_CONFIG.getApiKey().trim();

  // Si no hay API key de Gemini cargada en el entorno, retornar aviso de servicio fuera de línea
  if (!apiKey || apiKey === '' || apiKey.includes('YOUR_API_KEY')) {
    return `
      <p><strong>Asistente Virtual QSCI IA - Servicio no disponible:</strong></p>
      <p>No se ha detectado una clave API válida de Google Gemini configurada en el sistema (<code>VITE_GEMINI_API_KEY</code>).</p>
      <p class="qsci-restricted-hint">Por favor, contacte con el administrador del sistema para verificar la configuración del servicio.</p>
    `;
  }

  const payload = {
    systemInstruction: {
      parts: [
        { text: ASISTENTE_IA_CONFIG.systemInstruction }
      ]
    },
    contents: [
      {
        role: 'user',
        parts: [
          { 
            text: `Eres el Asistente Virtual Consultor QSCI. Responde la pregunta del usuario con precisión usando los datos reales de la base de datos.

DATOS EXTRAÍDOS DE LA BASE DE DATOS:
${dbContext}

PREGUNTA DEL USUARIO:
${userQuery}

Estructura de respuesta requerida:
1. Responde de forma directa, conversacional y ejecutiva la consulta puntual. DEBES ENUMERAR LOS ELEMENTOS EN LISTAS (<ul> y <li>) EN LUGAR DE TABLAS HTML. Omite columnas o datos innecesarios como IDs internos. Para cada elemento menciona: Cliente, Servicio, Planta, Horario y Técnico de forma limpia y legible.
2. Si detectas cualquier anomalía, punto crítico o dato de interés (stock bajo el mínimo, servicios sin técnico asignado, cotizaciones pendientes acumuladas), menciónalo claramente como Diagnóstico / Alerta.
3. Proporciona de 1 a 2 Sugerencias o Consejos Proactivos (ejemplo: realizar pedido de repuesto/reactivo, dar seguimiento a un cliente, o asignar técnico a un servicio pendiente).
4. Formatea la respuesta usando HTML limpio exclusivamente con párrafos (<p>), negritas (<strong>) y listas (<ul> y <li>). QUEDA ESTRICTAMENTE PROHIBIDO EL USO DE TABLAS HTML (<table>) Y EMOJIS.` 
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048
    }
  };

  const candidateEndpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`
  ];

  for (const url of candidateEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidate) {
          let cleaned = candidate
            .replace(/```html/gi, '')
            .replace(/```markdown/gi, '')
            .replace(/```/g, '')
            .trim();
          return cleaned;
        }
      } else {
        const errorData = await response.json().catch(() => null);
        const errMsg = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        
        // Log técnico completo para el desarrollador en la Consola del Navegador (F12)
        console.error(`[QSCI IA - Developer Log] Error en endpoint ${url}:`, {
          status: response.status,
          statusText: response.statusText,
          detalleErrorGoogle: errorData || errMsg
        });

        if (url === candidateEndpoints[candidateEndpoints.length - 1]) {
          return `
            <div class="qsci-chat-error-card">
              <p><strong>El Asistente QSCI IA se encuentra ocupado en este momento.</strong></p>
              <p>Los servidores de procesamiento están recibiendo un alto volumen de consultas. Por favor, intenta realizar tu pregunta nuevamente en unos segundos.</p>
            </div>
          `;
        }
      }
    } catch (err: any) {
      console.error(`[QSCI IA - Developer Network Error] Fallo al intentar conectar con ${url}:`, err);
    }
  }

  // Mensaje amigable al usuario final si falla la conexión de red
  return `
    <div class="qsci-chat-error-card">
      <p><strong>Asistente Virtual QSCI IA - Servicio no disponible</strong></p>
      <p>No se pudo establecer comunicación con el servidor de inteligencia artificial. Revisa tu conexión a internet o intenta nuevamente en unos momentos.</p>
    </div>
  `;
}
