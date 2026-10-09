import { apiClient } from '../../core/api/api.client';
import { tieneAccesoModulo } from '../auth/auth.guard';
import { clasificarIntencionSemantica, type IntencionModulo } from './asistente.embeddings';

export interface DbContextResult {
  hasAccess: boolean;
  moduleName?: string;
  contextSummary: string;
}

/**
 * Normaliza cualquier texto removiendo tildes/acentos y convirtiéndolo a minúsculas.
 * Permite que el usuario escriba sin tildes ("agricola", "sabado", "tecnico", "cotizacion")
 * y coincida perfectamente con la BD ("AGRÍCOLA", "SÁBADO", "TÉCNICO", "COTIZACIÓN").
 */
export function normalizarTexto(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Calcula la distancia Levenshtein entre dos cadenas para tolerar errores ortográficos/tipeos.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Determina si dos textos son similares considerando errores tipográficos (ej. "fresden" -> "dresden").
 */
export function esSimilarTexto(targetStr: string, queryStr: string): boolean {
  const s1 = normalizarTexto(targetStr);
  const s2 = normalizarTexto(queryStr);
  if (!s1 || !s2) return false;
  if (s1.includes(s2) || s2.includes(s1)) return true;

  const words1 = s1.split(/\s+/).filter(w => w.length >= 3);
  const words2 = s2.split(/\s+/).filter(w => w.length >= 3);

  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1.includes(w2) || w2.includes(w1)) return true;
      const maxDiff = w1.length >= 6 ? 2 : 1;
      if (Math.abs(w1.length - w2.length) <= maxDiff) {
        if (levenshteinDistance(w1, w2) <= maxDiff) return true;
      }
    }
  }
  return false;
}

/**
 * Extrae dinámicamente la intención de fecha de la pregunta del usuario.
 * Retorna una fecha ISO completa (YYYY-MM-DD) para comparación exacta.
 */
function parseConsultaFecha(query: string): { fechaISO: string | null; label: string } {
  const qNorm = normalizarTexto(query);
  const hoy = new Date();

  const toISO = (d: Date): string => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (qNorm.includes('manana')) {
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    return { fechaISO: toISO(manana), label: `mañana (${manana.getDate().toString().padStart(2, '0')}/${(manana.getMonth() + 1).toString().padStart(2, '0')}/${manana.getFullYear()})` };
  }

  if (qNorm.includes('hoy')) {
    return { fechaISO: toISO(hoy), label: `hoy (${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()})` };
  }

  // 1. Detectar fecha completa tipo "14/09/2026" o "14/09" o "14-09-2026"
  const matchFullDate = qNorm.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/);
  if (matchFullDate) {
    const d = parseInt(matchFullDate[1], 10);
    const m = parseInt(matchFullDate[2], 10);
    const y = matchFullDate[3] ? parseInt(matchFullDate[3], 10) : hoy.getFullYear();
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      const target = new Date(y, m - 1, d);
      return { 
        fechaISO: toISO(target), 
        label: `el ${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}` 
      };
    }
  }

  // 2. Detectar día del mes suelto (ej. "sabado 19", "dia 15", "el 15", "19")
  const matchNum = qNorm.match(/(?:dia|sabado|domingo|lunes|martes|miercoles|jueves|viernes|el)?\s*(\d{1,2})/i);
  if (matchNum && matchNum[1]) {
    const num = parseInt(matchNum[1], 10);
    if (num >= 1 && num <= 31) {
      const target = new Date(hoy.getFullYear(), hoy.getMonth(), num);
      return { fechaISO: toISO(target), label: `el día ${num.toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}` };
    }
  }

  return { fechaISO: null, label: 'la fecha consultada' };
}

/**
 * Extrae y sintetiza el contexto dinámicamente desde la Base de Datos REST API y el estado activo.
 * Consulta en paralelo los módulos con acceso y busca entidades reales (productos, servicios, clientes, cotizaciones).
 */
export async function getDbContextForQuery(query: string): Promise<DbContextResult> {
  const qNorm = normalizarTexto(query);
  const fechaActual = new Date();
  const queryWords = qNorm.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length >= 3);

  // 1. Consultar en paralelo los módulos a los que el usuario tiene acceso
  const canInventario = tieneAccesoModulo('inventario');
  const canProgramaciones = tieneAccesoModulo('programaciones');
  const canCotizaciones = tieneAccesoModulo('cotizaciones');
  const canFinanzas = tieneAccesoModulo('finanzas');
  const canLogistica = tieneAccesoModulo('logistica-vehiculos') || tieneAccesoModulo('logistica-rutas');

  const [resAlmacen, resProgramaciones, resCotizaciones, resFinanzas] = await Promise.all([
    // Almacén
    canInventario ? Promise.all([
      apiClient.get<any>('/productos').catch(() => null),
      apiClient.get<any>('/productos/estadisticas/resumen').catch(() => null)
    ]).catch(() => [null, null]) : Promise.resolve([null, null]),

    // Programaciones
    canProgramaciones ? (async () => {
      let data: any[] = (window as any).__PROGRAMACIONES_DATA__ || [];
      if (data.length === 0) {
        const filtrosBase = { mes: fechaActual.getMonth() + 1, anio: fechaActual.getFullYear() };
        const response = await apiClient.get<any>('/programacion-servicio', filtrosBase as any).catch(() => 
          apiClient.get<any>('/programaciones').catch(() => null)
        );
        data = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
      }
      return data;
    })().catch(() => []) : Promise.resolve([]),

    // Cotizaciones
    canCotizaciones ? Promise.all([
      apiClient.get<any>('/cotizaciones').catch(() => null),
      apiClient.get<any>('/cotizaciones/alerta-sin-orden').catch(() => null),
      apiClient.get<any>('/cotizaciones/estadisticas/resumen').catch(() => null)
    ]).catch(() => [null, null, null]) : Promise.resolve([null, null, null]),

    // Finanzas
    canFinanzas ? apiClient.get<any>('/finanzas/balance').catch(() => null) : Promise.resolve(null)
  ]);

  // Procesar Almacén / Productos
  let productosBD: any[] = [];
  let estadisticasAlmacen: any = {};
  if (canInventario && resAlmacen) {
    const rawProductos: any[] = Array.isArray(resAlmacen[0]) 
      ? resAlmacen[0] 
      : (resAlmacen[0]?.data && Array.isArray(resAlmacen[0].data) ? resAlmacen[0].data : []);
    estadisticasAlmacen = resAlmacen[1]?.data || resAlmacen[1] || {};

    productosBD = rawProductos.map((p: any) => {
      const disponible = p.inventario?.cantidad_disponible ?? p.stock ?? p.cantidad ?? 0;
      const seguridad = p.inventario?.stock_seguridad ?? p.stock_seguridad ?? 5;
      const esBajo = disponible < seguridad || (p.inventario?.cantidad_disponible !== undefined && p.inventario.cantidad_disponible <= seguridad);
      return {
        id: p.id,
        item: p.descripcion || p.nombre || 'Sin descripción',
        stock: disponible,
        unidad: p.unidad || p.presentacion || 'und',
        seguridad: seguridad,
        estado: esBajo ? 'BAJO' : 'OK'
      };
    });
  }

  // Buscar productos coincidentes con las palabras de la consulta (con tolerancia a tipeos ej. "cebadra" -> "cebadera")
  const productosCoincidentes = productosBD.filter(p => {
    return queryWords.some(w => esSimilarTexto(p.item, w));
  });

  // Procesar Programaciones
  let serviciosBD: any[] = [];
  const normalizarFecha = (f: string): string => {
    if (!f) return '';
    return f.substring(0, 10);
  };

  if (canProgramaciones && Array.isArray(resProgramaciones)) {
    serviciosBD = resProgramaciones.map((p: any) => {
      const clienteObj = p.orden_servicio?.cliente || p.orden_capacitacion?.cliente || p.orden_asesoria?.cliente || p.cliente;
      let clienteNom = '—';
      if (clienteObj) {
        if (typeof clienteObj === 'string') {
          clienteNom = clienteObj;
        } else {
          clienteNom = clienteObj.nombre_empresa || clienteObj.persona_contacto || clienteObj.razon_social || '—';
        }
      }
      if (p.tipo_programacion === 'fabricacion') clienteNom = 'PRODUCTOS';
      if (p.tipo_programacion === 'otros') clienteNom = 'OTROS';

      const servicioNom = p.servicio?.nombre || p.observaciones || 'Servicio Programado';
      const plantaNom = p.planta?.nombre || p.local_sede || '—';
      const fechaStr = normalizarFecha(p.fecha_programada || p.fecha || '');
      const horaStr = p.hora_inicio ? `${p.hora_inicio}${p.hora_fin ? ' - ' + p.hora_fin : ''}` : '—';
      const tecnicoNom = p.tecnico ? `${p.tecnico.nombre} ${p.tecnico.apellidos || ''}`.trim() : (p.tecnicos?.length ? p.tecnicos.map((t: any) => `${t.nombre} ${t.apellidos || ''}`.trim()).join(', ') : '—');
      const odsNumero = p.orden_servicio?.numero_orden || '—';

      return {
        cliente: clienteNom,
        servicio: servicioNom,
        planta: plantaNom,
        fecha: fechaStr,
        hora: horaStr,
        tecnico: tecnicoNom,
        ods: odsNumero,
        estado: p.estado_ejecucion || p.estado || 'Programado'
      };
    });
  }

  // Deduplicar servicios
  const unicosServiciosBD = Array.from(new Map(serviciosBD.map((item: any) => [`${item.cliente}-${item.fecha}-${item.servicio}`, item])).values());

  const { fechaISO, label: fechaLabel } = parseConsultaFecha(query);
  let serviciosFecha = unicosServiciosBD;
  if (fechaISO) {
    serviciosFecha = unicosServiciosBD.filter((p: any) => p.fecha === fechaISO);
  }

  // Buscar coincidencia de entidades (cliente, servicio, planta, técnico) en el catálogo de servicios
  let serviciosCoincidentes: any[] = [];
  if (queryWords.length > 0) {
    serviciosCoincidentes = serviciosFecha.filter((p: any) => {
      return queryWords.some(w => 
        esSimilarTexto(p.cliente, w) || 
        esSimilarTexto(p.servicio, w) || 
        esSimilarTexto(p.planta, w) || 
        esSimilarTexto(p.tecnico, w)
      );
    });

    if (serviciosCoincidentes.length === 0) {
      serviciosCoincidentes = unicosServiciosBD.filter((p: any) => {
        return queryWords.some(w => 
          esSimilarTexto(p.cliente, w) || 
          esSimilarTexto(p.servicio, w) || 
          esSimilarTexto(p.planta, w) || 
          esSimilarTexto(p.tecnico, w)
        );
      });
    }
  }

  // Procesar Cotizaciones
  let cotizacionesBD: any[] = [];
  let sinOrdenTotal = 0;
  let estadisticasCotizaciones: any = {};
  if (canCotizaciones && resCotizaciones) {
    cotizacionesBD = Array.isArray(resCotizaciones[0]) 
      ? resCotizaciones[0] 
      : (resCotizaciones[0]?.data && Array.isArray(resCotizaciones[0].data) ? resCotizaciones[0].data : []);
    sinOrdenTotal = resCotizaciones[1]?.data?.total ?? resCotizaciones[1]?.total ?? 0;
    estadisticasCotizaciones = resCotizaciones[2]?.data || resCotizaciones[2] || {};
  }

  // Clasificación Semántica por Embeddings / Vector Search
  const { intencion, score } = await clasificarIntencionSemantica(query);

  const esPreguntaCotizacion = intencion === 'comercial' || qNorm.includes('cotiza') || qNorm.includes('prospecto');
  const esPreguntaProgramacion = intencion === 'operaciones' || (fechaISO !== null && !qNorm.includes('stock') && !qNorm.includes('inventario')) || qNorm.includes('ods') || qNorm.includes('visita');
  const esPreguntaFinanzas = intencion === 'finanzas' || qNorm.includes('finanza') || qNorm.includes('caja chica');
  const esPreguntaStock = intencion === 'almacen' || qNorm.includes('stock') || qNorm.includes('inventario') || qNorm.includes('reactivo') || qNorm.includes('bodega');
  const esPreguntaInformes = intencion === 'informes' || qNorm.includes('informe') || qNorm.includes('hallazgo') || qNorm.includes('observacion') || qNorm.includes('indicacion');
  const esPreguntaRrhh = intencion === 'rrhh' || qNorm.includes('personal') || qNorm.includes('asistencia') || qNorm.includes('rrhh') || qNorm.includes('colaborador');

  // Evaluar RBAC estricto si el usuario pregunta intencionalmente por un módulo sin permiso
  if (esPreguntaCotizacion && !canCotizaciones) {
    return { hasAccess: false, moduleName: 'Comercial / Cotizaciones', contextSummary: '' };
  }
  if (esPreguntaProgramacion && !canProgramaciones) {
    return { hasAccess: false, moduleName: 'Operaciones / Programaciones', contextSummary: '' };
  }
  if (esPreguntaFinanzas && !canFinanzas) {
    return { hasAccess: false, moduleName: 'Finanzas', contextSummary: '' };
  }
  if (esPreguntaStock && !canInventario) {
    return { hasAccess: false, moduleName: 'Almacén / Inventario', contextSummary: '' };
  }

  // Construir Contexto Rico Consolidado
  const contextoRico: any = {
    pregunta_usuario: query,
    fecha_consulta: fechaLabel,
    fecha_iso: fechaISO
  };

  // Filtrar el payload para enviar ÚNICAMENTE el módulo consultado, reduciendo masivamente el consumo de tokens
  if (esPreguntaStock && canInventario) {
    contextoRico.almacen = {
      total_productos_en_bd: productosBD.length,
      total_bajo_stock: estadisticasAlmacen.stock_bajo ?? productosBD.filter(p => p.estado === 'BAJO').length,
      productos_coincidentes: productosCoincidentes.length > 0 ? productosCoincidentes : productosBD.slice(0, 30),
      productos_bajo_stock: productosBD.filter(p => p.estado === 'BAJO')
    };
  } else if (esPreguntaProgramacion && canProgramaciones) {
    contextoRico.operaciones = {
      total_servicios_en_bd_global: unicosServiciosBD.length,
      total_servicios_fecha: serviciosFecha.length,
      servicios_fecha: serviciosFecha,
      servicios_coincidentes: serviciosCoincidentes.length > 0 ? serviciosCoincidentes : serviciosFecha
    };
  } else if (esPreguntaCotizacion && canCotizaciones) {
    contextoRico.comercial = {
      cotizaciones_pendientes_aprobacion: estadisticasCotizaciones.pendientes ?? cotizacionesBD.filter(c => c.estado === 'Pendiente').length,
      cotizaciones_aceptadas_sin_orden: sinOrdenTotal,
      monto_pendiente: estadisticasCotizaciones.valor_pendiente ? `S/ ${estadisticasCotizaciones.valor_pendiente}` : 'S/ 0.00',
      total_cotizaciones: cotizacionesBD.length
    };
  } else if (esPreguntaInformes) {
    contextoRico.informes_formato_operacional = {
      tipo: 'Redacción de Observaciones e Indicaciones Técnicas',
      servicios_recientes: serviciosFecha.slice(0, 5),
      instruccion_especifica: 'Si el usuario solicita redactar observaciones o indicaciones para un informe u hoja operacional, genera un borrador técnico formal y profesional en párrafos claros.'
    };
  } else if (esPreguntaRrhh) {
    contextoRico.recursos_humanos = {
      tipo: 'Gestión de Personal y Técnicos',
      total_servicios_programados_hoy: serviciosFecha.length,
      tecnicos_en_campo: serviciosFecha.map(s => s.tecnico).filter(t => t && t !== '—')
    };
  } else if (esPreguntaFinanzas && canFinanzas) {
    contextoRico.finanzas = {
      balance: resFinanzas?.data || resFinanzas || 'Sin datos'
    };
  } else {
    // Si no se identificó intención puntual, enviar resumen compacto
    if (canInventario) contextoRico.almacen_resumen = { total: productosBD.length, bajo_stock: productosBD.filter(p => p.estado === 'BAJO').length };
    if (canProgramaciones) contextoRico.operaciones_resumen = { total_fecha: serviciosFecha.length };
    if (canCotizaciones) contextoRico.comercial_resumen = { pendientes: cotizacionesBD.filter(c => c.estado === 'Pendiente').length };
  }

  return {
    hasAccess: true,
    contextSummary: `RESULTADO REAL DE LA BASE DE DATOS QSCI:\n${JSON.stringify(contextoRico)}`
  };
}
