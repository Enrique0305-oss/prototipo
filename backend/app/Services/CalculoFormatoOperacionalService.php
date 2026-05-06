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
            ->whereIn('id', $ids)
            ->get();

        if ($programaciones->isEmpty()) {
            throw new \Exception('No se encontraron programaciones para calcular el Formato Operacional');
        }

        $formatos = [];
        foreach ($programaciones as $programacion) {
            $formatos = array_merge($formatos, $this->normalizarFormatosFichas($programacion->formatos_fichas ?? []));
        }

        $formatos = $this->deduplicarFormatos($formatos);

        if ($formatos === []) {
            throw new \Exception('La programación no tiene formatos de fichas seleccionados');
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
            'jaulas' => $inventario['totales']['jaulas'],
            'cebos' => $inventario['totales']['cebos'],
            'laminas' => $inventario['totales']['laminas'],
            'trampas_luz' => $inventario['totales']['trampas_luz'],
        ];

        $secciones = [];
        foreach ($formatos as $formato) {
            $codigoFormato = $formato['codigo'];
            if ($codigoFormato === 'roedores') {
                $secciones = array_merge($secciones, $this->construirSeccionesRoedores($restante));
                continue;
            }

            if ($codigoFormato === 'rastreros') {
                $secciones = array_merge($secciones, $this->construirSeccionesRastreros($restante));
                continue;
            }

            if ($codigoFormato === 'voladores') {
                $secciones = array_merge($secciones, $this->construirSeccionesVoladores($restante));
            }
        }

        return [
            'formatos_aplicados' => array_map(static fn (array $item) => $item['etiqueta'], $formatos),
            'dispositivos' => $inventario,
            'secciones' => $secciones,
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

        // Mostrar todas las jaulas disponibles (sin filtrar por láminas)
        $totalJaulas = $restante['jaulas'];
        $secciones[] = $this->crearSeccion(
            clave: 'roedores_jaulas',
            formato: self::FORMATO_ROEDORES,
            titulo: 'Jaulas',
            tipoSeccion: 'otros',
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
        $ordenCaja = 1;

        foreach ($secciones as $seccion) {
            $cantidad = max(0, (int) ($seccion['cantidad_asignada'] ?? 0));
            $titulo = (string) ($seccion['titulo'] ?? $seccion['descripcion'] ?? 'Sección');
            $tipoSeccion = (string) ($seccion['tipo_seccion'] ?? 'otros');
            $prefix = $this->prefixFromSection($seccion);

            for ($i = 0; $i < $cantidad; $i++) {
                $detalles[] = FormatoOperacionalDetalle::create([
                    'id_formato_operacional' => $idFormato,
                    'tipo_seccion' => $tipoSeccion,
                    'codigo_caja' => sprintf('%s-%02d', $prefix, $ordenCaja),
                    'orden_caja' => $ordenCaja,
                    'descripcion' => $titulo,
                    'ubicacion' => '',
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
                $ordenCaja++;
            }
        }

        return $detalles;
    }

    private function prefixFromSection(array $section): string
    {
        $key = $this->normalizeText((string) ($section['clave'] ?? $section['formato'] ?? $section['titulo'] ?? ''));

        if (str_contains($key, 'roedores')) {
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

            $secciones[] = [
                'clave' => trim((string) ($section['clave'] ?? $section['formato'] ?? $titulo)),
                'formato' => trim((string) ($section['formato'] ?? '')),
                'titulo' => $titulo,
                'tipo_seccion' => trim((string) ($section['tipo_seccion'] ?? 'otros')),
                'tipo_contenido' => trim((string) ($section['tipo_contenido'] ?? 'otros')),
                'cantidad_disponible' => max(0, (int) ($section['cantidad_disponible'] ?? $cantidad)),
                'cantidad_asignada' => max(0, $cantidad),
                'descripcion' => trim((string) ($section['descripcion'] ?? $titulo)),
                'nota' => trim((string) ($section['nota'] ?? '')),
            ];
        }

        return $secciones;
    }

    private function esCajaCebadera(string $desc): bool
    {
        return str_contains($desc, 'caja cebadera') || str_contains($desc, 'caja cebadora');
    }

    private function esCebo(string $desc): bool
    {
        return str_contains($desc, 'cebo') || str_contains($desc, 'final blox');
    }

    private function esLaminaPegante(string $desc): bool
    {
        return str_contains($desc, 'lamina') || str_contains($desc, 'adhesiva') || str_contains($desc, 'pegante');
    }

    private function esJaula(string $desc): bool
    {
        return str_contains($desc, 'jaula') || str_contains($desc, 'trampa');
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
