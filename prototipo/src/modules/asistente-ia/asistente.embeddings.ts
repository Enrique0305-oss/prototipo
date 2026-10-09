import { ASISTENTE_IA_CONFIG } from './asistente.config';

export type IntencionModulo = 'almacen' | 'operaciones' | 'comercial' | 'finanzas' | 'informes' | 'rrhh' | 'desconocido';

export interface IntencionResultado {
  intencion: IntencionModulo;
  score: number;
}

// Vectores / textos canónicos de referencia para cada módulo del ERP
const CANONICAL_TEXTS: Record<IntencionModulo, string> = {
  almacen: 'inventario stock reactivos productos insumos liquidos existencias bodega almacen reactivo producto estado de stock bajo reorden minima cantidad que queda consumo',
  operaciones: 'programacion servicios visitas tecnicos ods desratizacion fumigacion agenda ordenes de servicio hoy semana fecha hora cliente planta asignado asignacion',
  comercial: 'cotizaciones prospectos ventas aprobaciones presupuestos clientes comerciales sin orden rechazada monto estado cotizacion comercial asesoria',
  finanzas: 'finanzas caja chica ingresos egresos balance cuentas por cobrar saldo pagos estado de cuenta dinero montos facturas flujo',
  informes: 'informe informes observaciones indicaciones hallazgos formato operacional trampas luz cebaderas insectos moscas mosquiteros dispositivos inspeccion recomendaciones tecnicas',
  rrhh: 'recursos humanos rrhh personal tecnicos colaboradores asistencia epp planilla contratos cargos vacantes capacitacion asistencia hoy',
  desconocido: ''
};

// Cache en memoria de los embeddings de los textos canónicos
const canonicalEmbeddingsCache: Partial<Record<IntencionModulo, number[]>> = {};

/**
 * Calcula la similitud de coseno entre dos vectores numéricos
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Obtiene el embedding vectorial de un texto usando Gemini Embeddings API (text-embedding-004)
 */
export async function fetchGeminiEmbedding(text: string): Promise<number[] | null> {
  const apiKey = ASISTENTE_IA_CONFIG.getApiKey().trim();
  if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
    return null;
  }

  const candidateModels = [
    'gemini-embedding-001'
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${model}`,
          content: {
            parts: [{ text }]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const values = data.embedding?.values;
        if (Array.isArray(values) && values.length > 0) {
          return values;
        }
      }
    } catch {
      // Intentar modelo de reserva
    }
  }

  return null;
}

/**
 * Fallback semántico en cliente (Jaccard / N-Gram) si no hay conexión o API Key de Gemini
 */
function calcularSimilitudJaccardLocal(query: string, canonicalText: string): number {
  const normalize = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\W+/).filter(w => w.length > 2);
  const wordsQuery = new Set(normalize(query));
  const wordsCanonical = new Set(normalize(canonicalText));

  if (wordsQuery.size === 0 || wordsCanonical.size === 0) return 0;

  let intersection = 0;
  wordsQuery.forEach(w => {
    if (wordsCanonical.has(w)) intersection++;
  });

  const union = new Set([...wordsQuery, ...wordsCanonical]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Clasifica la intención del usuario comparando la pregunta contra los módulos canónicos.
 * Retorna el módulo identificado con su puntaje de confianza.
 */
export async function clasificarIntencionSemantica(userQuery: string): Promise<IntencionResultado> {
  const queryEmbed = await fetchGeminiEmbedding(userQuery);

  const modulos: IntencionModulo[] = ['almacen', 'operaciones', 'comercial', 'finanzas', 'informes', 'rrhh'];
  let mejorModulo: IntencionModulo = 'desconocido';
  let mayorScore = -1;

  if (queryEmbed) {
    // Clasificación Vectorial por Embeddings
    for (const mod of modulos) {
      if (!canonicalEmbeddingsCache[mod]) {
        const embed = await fetchGeminiEmbedding(CANONICAL_TEXTS[mod]);
        if (embed) canonicalEmbeddingsCache[mod] = embed;
      }

      const canonicalEmbed = canonicalEmbeddingsCache[mod];
      if (canonicalEmbed) {
        const sim = cosineSimilarity(queryEmbed, canonicalEmbed);
        if (sim > mayorScore) {
          mayorScore = sim;
          mejorModulo = mod;
        }
      }
    }

    if (mayorScore > 0.45) {
      return { intencion: mejorModulo, score: mayorScore };
    }
  }

  // Fallback a similitud léxico-semántica local si Embeddings no está disponible o el score fue bajo
  for (const mod of modulos) {
    const scoreLocal = calcularSimilitudJaccardLocal(userQuery, CANONICAL_TEXTS[mod]);
    if (scoreLocal > mayorScore) {
      mayorScore = scoreLocal;
      mejorModulo = mod;
    }
  }

  return {
    intencion: mayorScore > 0.05 ? mejorModulo : 'desconocido',
    score: mayorScore
  };
}
