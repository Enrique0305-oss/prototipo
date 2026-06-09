<?php

namespace App\Services;

use App\Models\FormatoOperacional;
use App\Models\FormatoOperacionalDetalle;
use App\Models\ProgramacionServicio;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CalculoFormatoOperacionalService
{
    private const FORMATO_ROEDORES = 'CONTROL DE ROEDORES';
    private const FORMATO_RASTREROS = 'CONTROL DE INSECTOS RASTREROS';
    private const FORMATO_VOLADORES = 'CONTROL DE INSECTOS VOLADORES';

    public function calcularAsignacion(int $idProgramacion, ?int $idUsuarioCreador = null, array $idsProgramaciones = []): array
    {
        $ids = array_values(array_unique(array_filter(array_map('intval', $idsProgramaciones), fn (int $value) => $value > 0)));
        if (empty($ids)) {
            $ids = [$idProgramacion];
        } elseif (!in_array($idProgramacion, $ids, true)) {
            $ids[] = $idProgramacion;
        }

        $programaciones = ProgramacionServicio::query()
            ->with(['ordenServicio', 'planta'])
            ->whereIn('id', $ids)
            ->get();

        if ($programaciones->isEmpty()) {
            throw new \Exception('No se encontraron programaciones para calcular el Formato Operacional');
        }

        $mainProg = $programaciones->firstWhere('id', $idProgramacion) ?? $programaciones->first();

        // ─── LÓGICA DE MEMORIA TÉCNICA (HISTORIAL) ──────────────────────────
        // Buscamos el último formato operacional ya guardado para cada servicio
        // Esto permite que si antes se hicieron individuales y ahora agrupados,
        // se recupere la ubicación de todos.
        $historialDetalles = collect();
        $ultimoFormato = null;

        $serviciosUnicos = $programaciones->unique('id_servicio');

        foreach ($serviciosUnicos as $progServicio) {
            $ultimoFormatoServicio = null;

            if ($progServicio->id_orden_servicio) {
                $ultimoFormatoServicio = FormatoOperacional::query()
                    ->whereNotIn('id_programacion_servicio', $ids)
                    ->whereHas('programacionServicio', function ($q) use ($progServicio) {
                        $q->where('id_orden_servicio', $progServicio->id_orden_servicio)
                          ->where('id_servicio', $progServicio->id_servicio)
                          ->where('id_cliente_planta', $progServicio->id_cliente_planta);
                    })
                    ->whereIn('estado', ['completada', 'borrador'])
                    ->orderByRaw("FIELD(estado, 'completada', 'borrador')")
                    ->orderBy('fecha', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();
            }

            // Si no encontramos por orden de servicio, intentar por planta y nombre de servicio
            if (!$ultimoFormatoServicio && $progServicio->id_cliente_planta) {
                $nombreServicio = $progServicio->servicio?->nombre;
                $ultimoFormatoServicio = FormatoOperacional::query()
                    ->whereNotIn('id_programacion_servicio', $ids)
                    ->whereHas('programacionServicio', function ($q) use ($progServicio, $nombreServicio) {
                        $q->where('id_cliente_planta', $progServicio->id_cliente_planta)
                          ->where(function($sub) use ($progServicio, $nombreServicio) {
                              $sub->where('id_servicio', $progServicio->id_servicio);
                              if ($nombreServicio) {
                                  $sub->orWhereHas('servicio', function($s) use ($nombreServicio) {
                                      $s->where('nombre', $nombreServicio);
                                  });
                              }
                          });
                    })
                    ->whereIn('estado', ['completada', 'borrador'])
                    ->orderByRaw("FIELD(estado, 'completada', 'borrador')")
                    ->orderBy('fecha', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();
            }

            if ($ultimoFormatoServicio) {
                // Guardamos el primer formato encontrado como referencia general (para info de cabecera si se requiere)
                if (!$ultimoFormato) {
                    $ultimoFormato = $ultimoFormatoServicio;
                }
                
                $detalles = $ultimoFormatoServicio->detalles()
                    ->orderBy('orden_caja', 'asc')
                    ->get();
                $historialDetalles = $historialDetalles->merge($detalles);
            }
        }

        if ($historialDetalles->isNotEmpty()) {
            // Agrupar por tipo de sección
            $historialDetalles = $historialDetalles->groupBy('tipo_seccion');
        } else {
            $historialDetalles = collect();
        }
        // ───────────────────────────────────────────────────────────────────

        $formatos = [];
        foreach ($programaciones as $programacion) {
            $formatos = array_merge($formatos, $this->normalizarFormatosFichas($programacion->formatos_fichas ?? []));
        }

        $formatos = $this->deduplicarFormatos($formatos);

        // Si no hay formatos seleccionados, retornar respuesta vacía (Formato Operacional es opcional)
        if ($formatos === []) {
            return [
                'formatos_aplicados' => [],
                'dispositivos' => [],
                'secciones' => [],
                'ultimo_formato_id' => null,
                'resumen' => [
                    'total_secciones' => 0,
                    'total_items' => 0,
                ],
            ];
        }

        $insumos = collect();
        foreach ($programaciones as $programacion) {
            $insumos = $insumos->concat(
                $programacion->insumos()
                    ->whereIn('estado', ['Entregado', 'Devuelto', 'Utilizado'])
                    ->with('producto')
                    ->get()
            );
        }

        if ($insumos->isEmpty()) {
            throw new \Exception('No hay insumos entregados para esta programación');
        }

        $inventario = $this->clasificarInventario($insumos);
        $restante = [
            'cajas_cebaderas' => $inventario['totales']['cajas_cebaderas'],
            'tubos_cebaderos' => $inventario['totales']['tubos_cebaderos'] ?? 0,
            'jaulas' => $inventario['totales']['jaulas'],
            'cebos' => $inventario['totales']['cebos'],
            'laminas' => $inventario['totales']['laminas'],
            'trampas_luz' => $inventario['totales']['trampas_luz'],
        ];

        // ─── CONSTRUIR SECCIONES POR PRIORIDAD ──────────────────────────────
        // Forzamos un orden de prioridad para evitar que un formato se lleve 
        // insumos que otro necesita (ej: láminas para cajas cebaderas).
        $secciones = [];
        $codigosPresentes = array_column($formatos, 'codigo');

        // 1. Prioridad: Roedores (usa cajas, tubos, cebos y láminas)
        if (in_array('roedores', $codigosPresentes)) {
            $secciones = array_merge($secciones, $this->construirSeccionesRoedores($restante));
        }

        // 2. Prioridad: Rastreros (usa láminas restantes)
        if (in_array('rastreros', $codigosPresentes)) {
            $secciones = array_merge($secciones, $this->construirSeccionesRastreros($restante));
        }

        // 3. Prioridad: Voladores (usa trampas de luz)
        if (in_array('voladores', $codigosPresentes)) {
            $secciones = array_merge($secciones, $this->construirSeccionesVoladores($restante));
        }

        // ─── INTEGRAR MEMORIA TÉCNICA EN LAS SECCIONES ─────────────────────
        foreach ($secciones as &$seccion) {
            $tipoSeccion = $seccion['tipo_seccion'];
            $cantidadOriginal = $seccion['cantidad_disponible'];
            
            // Intentar obtener historial por el tipo actual (ENUM: cebo, lamina, trampa_luz, jaula)
            $historial = $historialDetalles->get($tipoSeccion);

            // COMPATIBILIDAD: Si es tipo jaula o tubo_cebadero, buscar también en 'otros' o 'cebo' por si hay registros antiguos
            if ($tipoSeccion === 'jaula' || $tipoSeccion === 'tubo_cebadero') {
                $otros = $historialDetalles->get('otros');
                $cebos = $historialDetalles->get('cebo'); // Los tubos podrían estar en 'cebo' históricamente

                if ($tipoSeccion === 'jaula' && $otros && $otros->isNotEmpty()) {
                    $jaulasAntiguas = $otros->filter(fn($d) => str_starts_with(strtoupper((string)$d->codigo_caja), 'J-'));
                    if ($jaulasAntiguas->isNotEmpty()) {
                        $historial = $historial ? $historial->merge($jaulasAntiguas) : $jaulasAntiguas;
                    }
                }

                if ($tipoSeccion === 'tubo_cebadero' && $cebos && $cebos->isNotEmpty()) {
                    $tubosAntiguos = $cebos->filter(fn($d) => str_contains($this->normalizeText((string)$d->descripcion), 'tubo'));
                    if ($tubosAntiguos->isNotEmpty()) {
                        $historial = $historial ? $historial->merge($tubosAntiguos) : $tubosAntiguos;
                    }
                }
            }

            // Si hay historial, pero el tipo es 'lamina', 'cebo' o 'tubo_cebadero', filtramos por descripción
            // para no mezclar equipos (Cajas vs Tubos vs Rastreros).
            if ($historial && $historial->isNotEmpty() && ($tipoSeccion === 'lamina' || $tipoSeccion === 'cebo' || $tipoSeccion === 'tubo_cebadero')) {
                $claveNormalizada = strtolower(trim($seccion['clave']));
                $historial = $historial->filter(function($d) use ($claveNormalizada) {
                    $descH = $this->normalizeText((string) ($d->descripcion ?? ''));
                    // 1. Caso Rastreros
                    if (str_contains($claveNormalizada, 'rastrero')) {
                        return str_contains($descH, 'rastrero') || str_contains($descH, 'lamina') || str_contains($descH, 'insecto');
                    }
                    // 2. Caso Tubos Cebaderos
                    if (str_contains($claveNormalizada, 'tubo')) {
                        return str_contains($descH, 'tubo');
                    }
                    // 3. Caso Cajas Cebaderas (Cebo o Lámina)
                    return (str_contains($descH, 'cebadera') || str_contains($descH, 'cebadora') || str_contains($descH, 'roedor') || str_contains($descH, 'cebo')) 
                           && !str_contains($descH, 'tubo');
                });
            }
            
            if ($historial && $historial->isNotEmpty()) {
                $countH = $historial->count();
                $claveLower = strtolower($seccion['clave']);

                // Heredar cantidad para Rastreros, Voladores y Jaulas basándose en el historial
                // pero SOLO si la sección no tiene una cantidad ya asignada por el cálculo (insumos actuales).
                if (str_contains($claveLower, 'rastrero') || str_contains($claveLower, 'volador') || str_contains($claveLower, 'jaula')) {
                    if ($seccion['cantidad_asignada'] <= 0) {
                        // REGLA DE ORO: Si el inventario actual es 0, no forzar asignación positiva para Jaulas
                        if ($cantidadOriginal > 0 || !str_contains($claveLower, 'jaula')) {
                            $seccion['cantidad_asignada'] = $countH;
                            $seccion['cantidad_disponible'] = $countH;
                        }
                    }
                    
                    // Para Rastreros/Voladores/Jaulas, heredamos también la ubicación a nivel de sección si es común
                    $seccion['ubicacion'] = $historial->first()->ubicacion ?? '';
                }
                
                // Para Tubos Cebaderos y Cajas Cebaderas (Roedores), NUNCA sobrescribimos la cantidad calculada
                // pero sí heredamos la ubicación si no tiene una.
                if (str_contains($claveLower, 'tubo') || str_contains($claveLower, 'roedor')) {
                    if (empty($seccion['ubicacion'])) {
                        $seccion['ubicacion'] = $historial->first()->ubicacion ?? '';
                    }
                }

                $seccion['historial_dispositivos'] = $historial->map(fn($d) => [
                    'codigo_caja' => $d->codigo_caja,
                    'ubicacion' => $d->ubicacion,
                    'orden_caja' => $d->orden_caja,
                ])->values()->all();
            } else {
                $seccion['historial_dispositivos'] = [];
            }
        }
        // ───────────────────────────────────────────────────────────────────

        return [
            'formatos_aplicados' => array_map(static fn (array $item) => $item['etiqueta'], $formatos),
            'dispositivos' => $inventario,
            'secciones' => $secciones,
            'ultimo_formato_id' => $ultimoFormato?->id,
            'resumen' => [
                'total_secciones' => count($secciones),
                'total_items' => array_sum(array_map(static fn (array $section) => (int) $section['cantidad_asignada'], $secciones)),
            ],
        ];
    }

    public function crearFormatoOperacional(int $idProgramacion, array $payload, int $idUsuarioCreador): array
    {
        $programacion = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'planta',
            'area',
            'servicio',
        ])->findOrFail($idProgramacion);

        $secciones = $this->normalizarSecciones($payload['secciones'] ?? []);
        if ($secciones === []) {
            throw new \Exception('No se recibieron secciones para crear el Formato Operacional');
        }

        DB::beginTransaction();
        try {
            $formato = FormatoOperacional::create([
                'codigo_documento' => $payload['codigo_documento'] ?? $this->generarCodigoDocumento(),
                'version' => $payload['version'] ?? '01',
                'id_programacion_servicio' => $idProgramacion,
                'id_grupo_programacion' => $programacion->id_grupo_programacion,
                'id_usuario_creador' => $idUsuarioCreador,
                'estado' => 'borrador',
                'cliente' => $payload['cliente'] ?? ($programacion->ordenServicio?->cliente?->nombre ?? 'N/A'),
                'direccion' => $payload['direccion'] ?? ($programacion->direccion_completa ?? ''),
                'fecha' => $payload['fecha'] ?? now(),
                'hora_llegada' => $payload['hora_llegada'] ?? null,
                'hora_inicio' => $payload['hora_inicio'] ?? null,
                'hora_final' => $payload['hora_final'] ?? null,
                'observaciones' => $payload['observaciones'] ?? 'Formato Operacional generado automáticamente',
            ]);

            $detalles = $this->crearDetallesDesdeSecciones($formato->id, $secciones);

            DB::commit();

            return [
                'id' => $formato->id,
                'codigo_documento' => $formato->codigo_documento,
                'version' => $formato->version,
                'estado' => $formato->estado,
                'cliente' => $formato->cliente,
                'direccion' => $formato->direccion,
                'fecha' => $formato->fecha,
                'hora_llegada' => $formato->hora_llegada,
                'hora_inicio' => $formato->hora_inicio,
                'hora_final' => $formato->hora_final,
                'observaciones' => $formato->observaciones,
                'id_programacion_servicio' => $formato->id_programacion_servicio,
                'id_grupo_programacion' => $formato->id_grupo_programacion,
                'total_secciones' => count($secciones),
                'total_items' => count($detalles),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function clasificarInventario($insumos): array
    {
        $categorias = [
            'cajas_cebaderas' => [],
            'tubos_cebaderos' => [],
            'jaulas' => [],
            'cebos' => [],
            'laminas' => [],
            'trampas_luz' => [],
            'otros' => [],
        ];

        foreach ($insumos as $insumo) {
            $descripcion = $this->normalizeText((string) ($insumo->producto->descripcion ?? ''));
            $cantidad = (int) ($insumo->cantidad_asignada ?? $insumo->cantidad_utilizada ?? 0);
            $item = [
                'id_producto' => $insumo->id_producto,
                'descripcion' => $insumo->producto->descripcion,
                'cantidad' => $cantidad,
                'id_lote' => $insumo->id_lote,
            ];

            if ($this->esTrampaDeLuz($descripcion)) {
                $categorias['trampas_luz'][] = $item;
                continue;
            }

            if ($this->esTuboCebadero($descripcion)) {
                $categorias['tubos_cebaderos'][] = $item;
                continue;
            }

            if ($this->esCajaCebadera($descripcion)) {
                $categorias['cajas_cebaderas'][] = $item;
                continue;
            }

            if ($this->esCebo($descripcion)) {
                $categorias['cebos'][] = $item;
                continue;
            }

            if ($this->esLaminaPegante($descripcion)) {
                $categorias['laminas'][] = $item;
                continue;
            }

            if ($this->esJaula($descripcion)) {
                $categorias['jaulas'][] = $item;
                continue;
            }

            $categorias['otros'][] = $item;
        }

        return [
            'totales' => [
                'cajas_cebaderas' => collect($categorias['cajas_cebaderas'])->sum('cantidad'),
                'tubos_cebaderos' => collect($categorias['tubos_cebaderos'])->sum('cantidad'),
                'jaulas' => collect($categorias['jaulas'])->sum('cantidad'),
                'cebos' => collect($categorias['cebos'])->sum('cantidad'),
                'laminas' => collect($categorias['laminas'])->sum('cantidad'),
                'trampas_luz' => collect($categorias['trampas_luz'])->sum('cantidad'),
                'otros' => collect($categorias['otros'])->sum('cantidad'),
            ],
            'detalles' => $categorias,
        ];
    }

    private function construirSeccionesRoedores(array &$restante): array
    {
        $secciones = [];

        // 1. Tubos cebaderos (Prioridad sobre Cajas)
        $tubosConCebo = min($restante['tubos_cebaderos'] ?? 0, $restante['cebos']);
        $secciones[] = $this->crearSeccion(
            clave: 'roedores_tubos_cebo',
            formato: self::FORMATO_ROEDORES,
            titulo: 'Tubos cebaderos con cebo',
            tipoSeccion: 'tubo_cebadero',
            tipoContenido: 'cebo',
            disponibles: $tubosConCebo,
            asignadas: $tubosConCebo,
            nota: 'Prioridad para Tubos Cebaderos.'
        );
        $restante['cebos'] -= $tubosConCebo;
        if (isset($restante['tubos_cebaderos'])) {
            $restante['tubos_cebaderos'] -= $tubosConCebo;
        }

        // 2. Cajas cebaderas con cebo
        $cajasConCebo = min($restante['cajas_cebaderas'], $restante['cebos']);
        $secciones[] = $this->crearSeccion(
            clave: 'roedores_cajas_cebo',
            formato: self::FORMATO_ROEDORES,
            titulo: 'Cajas cebaderas con cebo',
            tipoSeccion: 'cebo',
            tipoContenido: 'cebo',
            disponibles: $cajasConCebo,
            asignadas: $cajasConCebo,
            nota: 'Prioridad para Cebo Final BLOX.'
        );
        $restante['cajas_cebaderas'] -= $cajasConCebo;
        $restante['cebos'] -= $cajasConCebo;

        // 3. Cajas cebaderas con lámina pegante
        $cajasConLamina = min($restante['cajas_cebaderas'], $restante['laminas']);
        $secciones[] = $this->crearSeccion(
            clave: 'roedores_cajas_lamina',
            formato: self::FORMATO_ROEDORES,
            titulo: 'Cajas cebaderas con lámina pegante',
            tipoSeccion: 'lamina',
            tipoContenido: 'lamina',
            disponibles: $cajasConLamina,
            asignadas: $cajasConLamina,
            nota: 'Se usa cuando sobran cajas cebaderas sin cebo.'
        );
        $restante['cajas_cebaderas'] -= $cajasConLamina;
        $restante['laminas'] -= $cajasConLamina;

        // 4. Jaulas (Solo si hay en inventario actual)
        $totalJaulas = $restante['jaulas'];
        $secciones[] = $this->crearSeccion(
            clave: 'roedores_jaulas',
            formato: self::FORMATO_ROEDORES,
            titulo: 'Jaulas',
            tipoSeccion: 'jaula',
            tipoContenido: 'jaula',
            disponibles: $totalJaulas,
            asignadas: $totalJaulas,
            nota: 'Jaulas para captura de roedores.'
        );
        $restante['jaulas'] = 0;

        return $secciones;
    }

    private function construirSeccionesRastreros(array &$restante): array
    {
        $cantidad = $restante['laminas'];

        $secciones = [
            $this->crearSeccion(
                clave: 'rastreros_laminas',
                formato: self::FORMATO_RASTREROS,
                titulo: 'Láminas pegantes',
                tipoSeccion: 'lamina',
                tipoContenido: 'lamina',
                disponibles: $cantidad,
                asignadas: $cantidad,
                nota: 'Formato de insectos rastreros: sólo lámina pegante.'
            ),
        ];

        $restante['laminas'] -= $cantidad;

        return $secciones;
    }

    private function construirSeccionesVoladores(array &$restante): array
    {
        $cantidad = $restante['trampas_luz'];

        $secciones = [
            $this->crearSeccion(
                clave: 'voladores_trampa_luz',
                formato: self::FORMATO_VOLADORES,
                titulo: 'Trampa de luz',
                tipoSeccion: 'trampa_luz',
                tipoContenido: 'trampa_luz',
                disponibles: $cantidad,
                asignadas: $cantidad,
                nota: 'Formato de insectos voladores: utiliza trampa de luz.'
            ),
        ];

        $restante['trampas_luz'] -= $cantidad;

        return $secciones;
    }

    private function crearSeccion(string $clave, string $formato, string $titulo, string $tipoSeccion, string $tipoContenido, int $disponibles, int $asignadas, string $nota): array
    {
        return [
            'clave' => $clave,
            'formato' => $formato,
            'titulo' => $titulo,
            'tipo_seccion' => $tipoSeccion,
            'tipo_contenido' => $tipoContenido,
            'cantidad_disponible' => $disponibles,
            'cantidad_asignada' => $asignadas,
            'descripcion' => $titulo,
            'nota' => $nota,
        ];
    }

    private function crearDetallesDesdeSecciones(int $idFormato, array $secciones): array
    {
        $detalles = [];
        $contadoresGlobales = [];

        foreach ($secciones as $seccion) {
            $cantidad = max(0, (int) ($seccion['cantidad_asignada'] ?? 0));
            $titulo = (string) ($seccion['titulo'] ?? $seccion['descripcion'] ?? 'Sección');
            $tipoSeccion = (string) ($seccion['tipo_seccion'] ?? 'otros');
            $prefix = $this->prefixFromSection($seccion);
            $ubicacionSeccion = (string) ($seccion['ubicacion'] ?? '');
            
            $historial = $seccion['historial_dispositivos'] ?? [];

            if (!isset($contadoresGlobales[$prefix])) {
                $contadoresGlobales[$prefix] = 1;
            }

            for ($i = 0; $i < $cantidad; $i++) {
                $itemH = $historial[$i] ?? null;
                
                // Priorizar datos del historial (Código y Ubicación)
                $codigo = $itemH['codigo_caja'] ?? sprintf('%s-%02d', $prefix, $contadoresGlobales[$prefix]);
                $ubicacion = $itemH['ubicacion'] ?? $ubicacionSeccion;

                $detalles[] = FormatoOperacionalDetalle::create([
                    'id_formato_operacional' => $idFormato,
                    'tipo_seccion' => $tipoSeccion,
                    'codigo_caja' => $codigo,
                    'orden_caja' => $itemH['orden_caja'] ?? $contadoresGlobales[$prefix],
                    'descripcion' => $titulo,
                    'ubicacion' => $ubicacion,
                    'estado_dispositivo' => 'No visitada',
                    'estado_dispositivo_verdadera' => 'No visitada',
                    'estado_dispositivo_auditiva' => 'No visitada',
                    'hallazgo' => '-',
                    'hallazgo_verdadera' => '-',
                    'hallazgo_auditiva' => '-',
                    'senales_presencia' => '-',
                    'senales_presencia_verdadera' => '-',
                    'senales_presencia_auditiva' => '-',
                    'numero_lote' => null,
                ]);
                
                if (!$itemH) {
                    $contadoresGlobales[$prefix]++;
                }
            }
            
            // Si procesamos ítems con historial, nos aseguramos de que el contador global 
            // no choque con los siguientes si no hay historial en la siguiente sección
            if (!empty($historial)) {
                $maxOrden = collect($historial)->max('orden_caja');
                if ($maxOrden >= $contadoresGlobales[$prefix]) {
                    $contadoresGlobales[$prefix] = $maxOrden + 1;
                }
            }
        }

        return $detalles;
    }

    private function prefixFromSection(array $section): string
    {
        $key = $this->normalizeText((string) ($section['clave'] ?? $section['formato'] ?? $section['titulo'] ?? ''));

        if (str_contains($key, 'roedores')) {
            if (str_contains($key, 'tubo')) {
                return 'TB';
            }
            if (str_contains($key, 'cebo')) {
                return 'C';
            }
            if (str_contains($key, 'jaula')) {
                return 'J';
            }
            return 'C';
        }

        if (str_contains($key, 'rastreros')) {
            return 'L';
        }

        if (str_contains($key, 'voladores')) {
            return 'TL';
        }

        return 'FO';
    }

    private function generarCodigoDocumento(): string
    {
        $prefix = 'FO';
        $timestamp = Carbon::now()->format('YmdHis');
        $random = strtoupper(substr(md5(microtime()), 0, 4));

        return "{$prefix}-{$timestamp}-{$random}";
    }

    private function normalizarFormatosFichas(mixed $value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            }
        }

        if (!is_array($value)) {
            return [];
        }

        $formatos = [];
        foreach ($value as $item) {
            $texto = '';

            // Manejar arrays o estructuras comunes que puedan venir del frontend
            if (is_array($item)) {
                if (array_key_exists('label', $item)) {
                    $texto = (string) $item['label'];
                } elseif (array_key_exists('value', $item)) {
                    $texto = (string) $item['value'];
                } else {
                    // Intentar serializar si viene como arreglo simple
                    $texto = implode(', ', array_filter(array_map('strval', $item)));
                }
            } elseif (is_object($item)) {
                // Intentar convertir objetos a string si tienen __toString
                if (method_exists($item, '__toString')) {
                    $texto = (string) $item;
                } else {
                    // Serializar propiedades públicas
                    $texto = implode(', ', array_filter(get_object_vars($item)));
                }
            } elseif (is_scalar($item)) {
                $texto = (string) $item;
            }

            $texto = trim($texto);
            if ($texto === '') {
                continue;
            }

            $formatos[] = $this->mapFormatoFichas($texto);
        }

        return $this->deduplicarFormatos($formatos);
    }

    private function deduplicarFormatos(array $formatos): array
    {
        $unicos = [];
        $vistos = [];

        foreach ($formatos as $formato) {
            $clave = ($formato['codigo'] ?? '') . '|' . ($formato['etiqueta'] ?? '');
            if (isset($vistos[$clave])) {
                continue;
            }

            $vistos[$clave] = true;
            $unicos[] = $formato;
        }

        return $unicos;
    }

    private function mapFormatoFichas(string $texto): array
    {
        $normalizado = $this->normalizeText($texto);

        if (str_contains($normalizado, 'roedores')) {
            return ['codigo' => 'roedores', 'etiqueta' => self::FORMATO_ROEDORES];
        }

        if (str_contains($normalizado, 'rastreros')) {
            return ['codigo' => 'rastreros', 'etiqueta' => self::FORMATO_RASTREROS];
        }

        if (str_contains($normalizado, 'voladores')) {
            return ['codigo' => 'voladores', 'etiqueta' => self::FORMATO_VOLADORES];
        }

        return ['codigo' => 'otros', 'etiqueta' => trim($texto)];
    }

    private function normalizarSecciones(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $secciones = [];
        foreach ($value as $section) {
            if (!is_array($section)) {
                continue;
            }

            $titulo = trim((string) ($section['titulo'] ?? $section['descripcion'] ?? ''));
            $cantidad = (int) ($section['cantidad_asignada'] ?? $section['cantidad'] ?? 0);
            if ($titulo === '') {
                continue;
            }

            $tipoSeccion = trim((string) ($section['tipo_seccion'] ?? $section['tipo'] ?? 'otros'));
            $descripcion = trim((string) ($section['descripcion'] ?? $titulo));

            // RE-CLASIFICACIÓN DE SEGURIDAD: Si viene como 'otros' pero el título o descripción sugiere un equipo conocido, lo corregimos.
            if ($tipoSeccion === 'otros' || $tipoSeccion === '') {
                $normalizado = $this->normalizeText($titulo . ' ' . $descripcion);
                if (str_contains($normalizado, 'tubo')) {
                    $tipoSeccion = 'tubo_cebadero';
                    if ($descripcion === 'Otros' || $descripcion === 'otros' || $descripcion === '') {
                        $descripcion = 'Tubo cebadero con cebo';
                    }
                } elseif (str_contains($normalizado, 'jaula')) {
                    $tipoSeccion = 'jaula';
                    if ($descripcion === 'Otros' || $descripcion === 'otros' || $descripcion === '') {
                        $descripcion = 'Jaulas de captura';
                    }
                } elseif (str_contains($normalizado, 'cebadera') || str_contains($normalizado, 'cebo')) {
                    $tipoSeccion = 'cebo';
                    if ($descripcion === 'Otros' || $descripcion === 'otros' || $descripcion === '') {
                        $descripcion = 'Caja cebadera con cebo';
                    }
                } elseif (str_contains($normalizado, 'lamina') || str_contains($normalizado, 'pegante') || str_contains($normalizado, 'adhesiva')) {
                    $tipoSeccion = 'lamina';
                    if ($descripcion === 'Otros' || $descripcion === 'otros' || $descripcion === '') {
                        $descripcion = 'Caja cebadera con lámina pegante';
                    }
                }
            }

            $secciones[] = [
                'clave' => trim((string) ($section['clave'] ?? $section['formato'] ?? $titulo)),
                'formato' => trim((string) ($section['formato'] ?? '')),
                'titulo' => $titulo,
                'tipo_seccion' => $tipoSeccion,
                'tipo_contenido' => trim((string) ($section['tipo_contenido'] ?? 'otros')),
                'cantidad_disponible' => max(0, (int) ($section['cantidad_disponible'] ?? $cantidad)),
                'cantidad_asignada' => max(0, $cantidad),
                'descripcion' => $descripcion,
                'ubicacion' => trim((string) ($section['ubicacion'] ?? '')),
                'historial_dispositivos' => $section['historial_dispositivos'] ?? [],
                'nota' => trim((string) ($section['nota'] ?? '')),
            ];
        }

        return $secciones;
    }

    private function esCajaCebadera(string $desc): bool
    {
        return str_contains($desc, 'caja cebadera') || str_contains($desc, 'caja cebadora');
    }

    private function esTuboCebadero(string $desc): bool
    {
        return str_contains($desc, 'tubo');
    }

    private function esCebo(string $desc): bool
    {
        return str_contains($desc, 'cebo') || str_contains($desc, 'final blox');
    }

    private function esLaminaPegante(string $desc): bool
    {
        return str_contains($desc, 'lamina') || str_contains($desc, 'adhesiva') || str_contains($desc, 'pegante') || str_contains($desc, 'pegajosa');
    }

    private function esJaula(string $desc): bool
    {
        return str_contains($desc, 'jaula');
    }

    private function esTrampaDeLuz(string $desc): bool
    {
        return str_contains($desc, 'trampa de luz') || str_contains($desc, 'luz uv') || str_contains($desc, 'uv');
    }

    private function normalizeText(string $value): string
    {
        return str_replace(
            ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ñ', 'Ñ'],
            ['a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u', 'n', 'n'],
            strtolower($value)
        );
    }
}
