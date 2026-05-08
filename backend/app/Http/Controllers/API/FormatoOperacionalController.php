<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FormatoOperacional;
use App\Models\FormatoOperacionalDetalle;
use App\Models\ProgramacionServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FormatoOperacionalController extends Controller
{
    public function index(Request $request)
    {
        $query = FormatoOperacional::with(['programacionServicio', 'programacionServicioGrupo'])
            ->orderByDesc('created_at');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('id_programacion_servicio')) {
            $query->where('id_programacion_servicio', $request->id_programacion_servicio);
        }

        if ($request->filled('id_grupo_programacion')) {
            $query->where('id_grupo_programacion', $request->id_grupo_programacion);
        }

        $formatos = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $formatos,
        ]);
    }

    public function store(Request $request, $id)
    {
        $prog = ProgramacionServicio::with(['grupoProgramacion', 'ordenServicio.cliente'])
            ->findOrFail($id);

        $validated = $request->validate([
            'codigo_documento' => 'nullable|string|max:30',
            'version' => 'nullable|string|max:10',
            'cliente' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'fecha' => 'nullable|date',
            'hora_llegada' => 'nullable|date_format:H:i',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_final' => 'nullable|date_format:H:i',
            'observaciones' => 'nullable|string',
            'secciones' => 'nullable|array',
            'items' => 'nullable|array',
            'dispositivos' => 'nullable|array',
        ]);

        $idUsuario = (int) ($request->user()?->id ?? 0);
        Log::info('Payload received in store FormatoOperacional', $request->all());

        $payload = $this->buildPayload($request->all());

        $formato = DB::transaction(function () use ($prog, $validated, $payload, $idUsuario) {
            $formato = FormatoOperacional::where('id_programacion_servicio', $prog->id)
                ->where('estado', 'borrador')
                ->latest()
                ->first();

            if (!$formato) {
                $formato = new FormatoOperacional();
                $formato->id_programacion_servicio = $prog->id;
                $formato->id_grupo_programacion = $prog->id_grupo_programacion;
                $formato->id_usuario_creador = $idUsuario > 0 ? $idUsuario : null;
                $formato->estado = 'borrador';
            }

            $formato->fill([
                'codigo_documento' => $validated['codigo_documento'] ?? 'FO-OP-002',
                'version' => $validated['version'] ?? '01',
                'cliente' => $validated['cliente'] ?? data_get($prog, 'ordenServicio.cliente.nombre_empresa') ?? data_get($prog, 'ordenServicio.cliente.nombre') ?? data_get($prog, 'ordenServicio.cliente.razon_social'),
                'direccion' => $validated['direccion'] ?? ($prog->direccion_completa ?? data_get($prog, 'ordenServicio.cliente.direccion')),
                'fecha' => $validated['fecha'] ?? $prog->fecha_programada?->format('Y-m-d'),
                'hora_llegada' => $validated['hora_llegada'] ?? $formato->hora_llegada?->format('H:i') ?? $prog->hora_inicio?->format('H:i'),
                'hora_inicio' => $validated['hora_inicio'] ?? $formato->hora_inicio?->format('H:i') ?? $prog->hora_inicio?->format('H:i'),
                'hora_final' => $validated['hora_final'] ?? $formato->hora_final?->format('H:i') ?? $prog->hora_fin?->format('H:i'),
                'observaciones' => $validated['observaciones'] ?? null,
            ]);
            $formato->save();

            $formato->detalles()->delete();
            foreach ($payload as $detalle) {
                $formato->detalles()->create($detalle);
            }

            return $formato->load(['detalles', 'programacionServicio', 'programacionServicioGrupo']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Formato operacional guardado como borrador',
            'data' => $this->toResponseData($formato),
        ]);
    }

    public function show($id)
    {
        $formato = FormatoOperacional::with(['detalles', 'programacionServicio', 'programacionServicioGrupo'])
            ->where('id_programacion_servicio', $id)
            ->latest()
            ->first();

        if (!$formato) {
            return response()->json([
                'success' => false,
                'message' => 'Formato operacional no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->toResponseData($formato),
        ]);
    }

    public function update(Request $request, $id)
    {
        $formato = FormatoOperacional::findOrFail($id);

        if ($formato->estado !== 'borrador') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden actualizar formatos en estado borrador',
            ], 422);
        }

        return $this->store($request, (string) $formato->id_programacion_servicio);
    }

    public function finalize(Request $request, $id)
    {
        $formato = FormatoOperacional::with(['detalles'])->findOrFail($id);

        if ($formato->estado !== 'borrador') {
            return response()->json([
                'success' => false,
                'message' => 'El formato ya ha sido finalizado',
            ], 422);
        }

        $formato->marcarCompletado();

        return response()->json([
            'success' => true,
            'message' => 'Formato operacional finalizado exitosamente',
            'data' => $this->toResponseData($formato->fresh(['detalles', 'programacionServicio', 'programacionServicioGrupo'])),
        ]);
    }

    public function showByGrupo($idGrupo)
    {
        $formato = FormatoOperacional::with(['detalles', 'programacionServicio', 'programacionServicioGrupo'])
            ->where('id_grupo_programacion', $idGrupo)
            ->latest()
            ->first();

        if (!$formato) {
            return response()->json([
                'success' => false,
                'message' => 'Formato operacional del grupo no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->toResponseData($formato),
        ]);
    }

    public function generarPDF($id)
    {
        $formato = FormatoOperacional::with([
            'detalles',
            'programacionServicio.tecnico',
            'programacionServicio.tecnicos',
        ])->findOrFail($id);

        $view = $this->resolveViewName($formato);
        $tipoPdf = request('tipo_pdf', 'verdadera');
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($view, [
            'formato' => $formato,
            'secciones' => $this->groupDetalles($formato),
            'tipo_pdf' => $tipoPdf,
        ]);
        $pdf->setPaper('a4', 'portrait');

        $clienteSafe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $formato->cliente ?? 'sin_cliente');
        $fechaSafe = $formato->fecha ? \Carbon\Carbon::parse($formato->fecha)->format('Ymd') : 'sin_fecha';

        return $pdf->stream("Formato_Operacional_{$clienteSafe}_{$fechaSafe}.pdf");
    }

    public function generarPDFByProgramacion($id)
    {
        $formato = FormatoOperacional::with([
            'detalles',
            'programacionServicio.tecnico',
            'programacionServicio.tecnicos',
        ])->where('id_programacion_servicio', $id)->latest()->first();

        if (!$formato) {
            return response()->json([
                'success' => false,
                'message' => 'Formato operacional no encontrado para esta programación',
            ], 404);
        }

        $view = $this->resolveViewName($formato);
        $tipoPdf = request('tipo_pdf', 'verdadera');
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($view, [
            'formato' => $formato,
            'secciones' => $this->groupDetalles($formato),
            'tipo_pdf' => $tipoPdf,
        ]);
        $pdf->setPaper('a4', 'portrait');

        $clienteSafe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $formato->cliente ?? 'sin_cliente');
        $fechaSafe = $formato->fecha ? \Carbon\Carbon::parse($formato->fecha)->format('Ymd') : 'sin_fecha';

        return $pdf->stream("Formato_Operacional_{$clienteSafe}_{$fechaSafe}.pdf");
    }

    public function generarPDFByGrupo($idGrupo)
    {
        $formato = FormatoOperacional::with([
            'detalles',
            'programacionServicio.tecnico',
            'programacionServicio.tecnicos',
        ])->where('id_grupo_programacion', $idGrupo)->latest()->first();

        if (!$formato) {
            return response()->json([
                'success' => false,
                'message' => 'Formato operacional del grupo no encontrado',
            ], 404);
        }

        $view = $this->resolveViewName($formato);
        $tipoPdf = request('tipo_pdf', 'verdadera');
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($view, [
            'formato' => $formato,
            'secciones' => $this->groupDetalles($formato),
            'tipo_pdf' => $tipoPdf,
        ]);
        $pdf->setPaper('a4', 'portrait');

        $clienteSafe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $formato->cliente ?? 'sin_cliente');
        $fechaSafe = $formato->fecha ? \Carbon\Carbon::parse($formato->fecha)->format('Ymd') : 'sin_fecha';

        return $pdf->stream("Formato_Operacional_{$clienteSafe}_{$fechaSafe}.pdf");
    }

    private function toResponseData(FormatoOperacional $formato): array
    {
        $loaded = $formato->loadMissing(['detalles', 'programacionServicio', 'programacionServicioGrupo']);

        return [
            'id' => $loaded->id,
            'codigo_documento' => $loaded->codigo_documento,
            'version' => $loaded->version,
            'estado' => $loaded->estado,
            'cliente' => $loaded->cliente,
            'direccion' => $loaded->direccion,
            'fecha' => $loaded->fecha,
            'hora_llegada' => $loaded->hora_llegada,
            'hora_inicio' => $loaded->hora_inicio,
            'hora_final' => $loaded->hora_final,
            'observaciones' => $loaded->observaciones,
            'fecha_finalizacion' => $loaded->fecha_finalizacion,
            'id_programacion_servicio' => $loaded->id_programacion_servicio,
            'id_grupo_programacion' => $loaded->id_grupo_programacion,
            'formatos_fichas' => data_get($loaded, 'programacionServicio.formatos_fichas', []),
            'detalles' => $loaded->detalles->values()->all(),
            'secciones' => $this->groupDetalles($loaded),
            'programacion_servicio' => $loaded->programacionServicio,
            'programacion_servicio_grupo' => $loaded->programacionServicioGrupo,
        ];
    }

    private function groupDetalles(FormatoOperacional $formato): array
    {
        $grouped = $formato->detalles
            ->sortBy('orden_caja')
            ->groupBy(function (FormatoOperacionalDetalle $detalle) {
                return $this->displaySectionKey($detalle);
            });

        $orderedKeys = ['roedores_cebo', 'roedores_lamina', 'rastreros_lamina', 'trampa_luz', 'jaula', 'otros'];
        $result = [];

        foreach ($orderedKeys as $key) {
            if (!$grouped->has($key)) {
                continue;
            }

            $items = $grouped->get($key)->values()->map(function (FormatoOperacionalDetalle $detalle, int $index) use ($key) {
                $estadoVerdadera = $this->coalescedText($detalle->estado_dispositivo_verdadera, $detalle->estado_dispositivo);
                $estadoAuditiva = $this->coalescedText($detalle->estado_dispositivo_auditiva, $detalle->estado_dispositivo);
                $hallazgoVerdadera = $this->coalescedText($detalle->hallazgo_verdadera, $detalle->hallazgo, '-');
                $hallazgoAuditiva = $this->coalescedText($detalle->hallazgo_auditiva, $detalle->hallazgo, '-');
                $senalesVerdadera = $this->coalescedText($detalle->senales_presencia_verdadera, $detalle->senales_presencia, '-');
                $senalesAuditiva = $this->coalescedText($detalle->senales_presencia_auditiva, $detalle->senales_presencia, '-');

                $estadoLaminaVerdadera = $this->coalescedText($detalle->estado_lamina_verdadera, $detalle->estado_lamina);
                $estadoLaminaAuditiva = $this->coalescedText($detalle->estado_lamina_auditiva, $detalle->estado_lamina);

                return [
                    'id' => $detalle->id,
                    'codigo_caja' => $this->displayCodigoCaja($detalle, $key, $index + 1),
                    'codigo_caja_original' => $detalle->codigo_caja,
                    'orden_caja' => $detalle->orden_caja,
                    'id_producto' => $detalle->id_producto,
                    'descripcion' => $detalle->descripcion,
                    'ubicacion' => $detalle->ubicacion,
                    'estado_dispositivo' => $estadoVerdadera,
                    'estado_dispositivo_verdadera' => $estadoVerdadera,
                    'estado_dispositivo_auditiva' => $estadoAuditiva,
                    'hallazgo' => $hallazgoVerdadera,
                    'hallazgo_verdadera' => $hallazgoVerdadera,
                    'hallazgo_auditiva' => $hallazgoAuditiva,
                    'senales_presencia' => $senalesVerdadera,
                    'senales_presencia_verdadera' => $senalesVerdadera,
                    'senales_presencia_auditiva' => $senalesAuditiva,
                    'conteo_insectos' => is_array($detalle->conteo_insectos) ? $detalle->conteo_insectos : null,
                    'estado_lamina' => $detalle->estado_lamina,
                    'estado_lamina_verdadera' => $estadoLaminaVerdadera,
                    'estado_lamina_auditiva' => $estadoLaminaAuditiva,
                    'estadio' => $detalle->estadio,
                    'conteo_estadio' => is_array($detalle->conteo_estadio) ? $detalle->conteo_estadio : null,
                    'conteo_estadio_verdadera' => $detalle->conteo_estadio_verdadera,
                    'conteo_estadio_falsa' => $detalle->conteo_estadio_falsa,
                    'numero_lote' => $detalle->numero_lote,
                ];
            })->all();

            $result[] = [
                'tipo' => $key,
                'titulo' => $this->sectionTitle($key),
                'cantidad' => count($items),
                'items' => $items,
            ];
        }

        foreach ($grouped as $key => $collection) {
            if (in_array($key, $orderedKeys, true)) {
                continue;
            }

            $items = $collection->values()->map(function (FormatoOperacionalDetalle $detalle, int $index) use ($key) {
                $estadoVerdadera = $this->coalescedText($detalle->estado_dispositivo_verdadera, $detalle->estado_dispositivo);
                $estadoAuditiva = $this->coalescedText($detalle->estado_dispositivo_auditiva, $detalle->estado_dispositivo);
                $hallazgoVerdadera = $this->coalescedText($detalle->hallazgo_verdadera, $detalle->hallazgo, '-');
                $hallazgoAuditiva = $this->coalescedText($detalle->hallazgo_auditiva, $detalle->hallazgo, '-');
                $senalesVerdadera = $this->coalescedText($detalle->senales_presencia_verdadera, $detalle->senales_presencia, '-');
                $senalesAuditiva = $this->coalescedText($detalle->senales_presencia_auditiva, $detalle->senales_presencia, '-');

                $estadoLaminaVerdadera = $this->coalescedText($detalle->estado_lamina_verdadera, $detalle->estado_lamina);
                $estadoLaminaAuditiva = $this->coalescedText($detalle->estado_lamina_auditiva, $detalle->estado_lamina);

                return [
                    'id' => $detalle->id,
                    'codigo_caja' => $this->displayCodigoCaja($detalle, $key, $index + 1),
                    'codigo_caja_original' => $detalle->codigo_caja,
                    'orden_caja' => $detalle->orden_caja,
                    'id_producto' => $detalle->id_producto,
                    'descripcion' => $detalle->descripcion,
                    'ubicacion' => $detalle->ubicacion,
                    'estado_dispositivo' => $estadoVerdadera,
                    'estado_dispositivo_verdadera' => $estadoVerdadera,
                    'estado_dispositivo_auditiva' => $estadoAuditiva,
                    'hallazgo' => $hallazgoVerdadera,
                    'hallazgo_verdadera' => $hallazgoVerdadera,
                    'hallazgo_auditiva' => $hallazgoAuditiva,
                    'senales_presencia' => $senalesVerdadera,
                    'senales_presencia_verdadera' => $senalesVerdadera,
                    'senales_presencia_auditiva' => $senalesAuditiva,
                    'conteo_insectos' => is_array($detalle->conteo_insectos) ? $detalle->conteo_insectos : null,
                    'estado_lamina' => $detalle->estado_lamina,
                    'estado_lamina_verdadera' => $estadoLaminaVerdadera,
                    'estado_lamina_auditiva' => $estadoLaminaAuditiva,
                    'estadio' => $detalle->estadio,
                    'conteo_estadio' => is_array($detalle->conteo_estadio) ? $detalle->conteo_estadio : null,
                    'conteo_estadio_verdadera' => $detalle->conteo_estadio_verdadera,
                    'conteo_estadio_falsa' => $detalle->conteo_estadio_falsa,
                    'numero_lote' => $detalle->numero_lote,
                ];
            })->all();

            $result[] = [
                'tipo' => $key,
                'titulo' => $this->sectionTitle($key),
                'cantidad' => count($items),
                'items' => $items,
            ];
        }

        return $result;
    }

    private function buildPayload(array $input): array
    {
        $sections = $this->normalizeSections($input);
        $details = [];
        $sequence = 1;

        foreach ($sections as $section) {
            // Normalizar el tipo con sectionKey para garantizar que sea 'cebo' o 'lamina'
            $tipo = $this->sectionKey($section['tipo'] ?? null);
            
            foreach ($section['items'] as $item) {
                $estadoVerdadera = $this->nullableText($item['estado_dispositivo_verdadera'] ?? $item['estado_verdadera'] ?? $item['estado_dispositivo'] ?? null);
                $estadoAuditiva = $this->nullableText($item['estado_dispositivo_auditiva'] ?? $item['estado_auditiva'] ?? null);
                $hallazgoVerdadera = $this->dashText($item['hallazgo_verdadera'] ?? $item['hallazgo'] ?? null);
                $hallazgoAuditiva = $this->dashText($item['hallazgo_auditiva'] ?? null);
                $senalesVerdadera = $this->dashText($item['senales_presencia_verdadera'] ?? $item['senales_presencia'] ?? null);
                $senalesAuditiva = $this->dashText($item['senales_presencia_auditiva'] ?? null);

                $details[] = [
                    'tipo_seccion' => $tipo,
                    'codigo_caja' => $this->resolveCodigoCaja($item, $sequence),
                    'orden_caja' => $sequence,
                    'id_producto' => $this->toNullableInt($item['id_producto'] ?? null),
                    'descripcion' => $this->resolveDescripcion($item, $tipo),
                    'ubicacion' => trim((string) ($item['ubicacion'] ?? '')),
                    'estado_dispositivo' => $estadoVerdadera,
                    'estado_dispositivo_verdadera' => $estadoVerdadera,
                    'estado_dispositivo_auditiva' => $estadoAuditiva,
                    'hallazgo' => $hallazgoVerdadera,
                    'hallazgo_verdadera' => $hallazgoVerdadera,
                    'hallazgo_auditiva' => $hallazgoAuditiva,
                    'senales_presencia' => $senalesVerdadera,
                    'senales_presencia_verdadera' => $senalesVerdadera,
                    'senales_presencia_auditiva' => $senalesAuditiva,
                    'conteo_insectos' => $this->normalizeConteoInsectos($item['conteo_insectos'] ?? null),
                    'estado_lamina' => $this->nullableText($item['estado_lamina_verdadera'] ?? $item['estado_lamina'] ?? null),
                    'estado_lamina_verdadera' => $this->nullableText($item['estado_lamina_verdadera'] ?? null),
                    'estado_lamina_auditiva' => $this->nullableText($item['estado_lamina_auditiva'] ?? null),
                    'estadio' => $this->nullableText($item['estadio'] ?? null),
                    'conteo_estadio' => $this->normalizeConteoEstadio($item['conteo_estadio'] ?? null),
                    'conteo_estadio_verdadera' => $this->toNullableInt($item['conteo_estadio_verdadera'] ?? null),
                    'conteo_estadio_falsa' => $this->toNullableInt($item['conteo_estadio_falsa'] ?? null),
                    'numero_lote' => $this->nullableText($item['numero_lote'] ?? null),
                ];
                $sequence++;
            }
        }

        return $details;
    }

    private function normalizeSections(array $input): array
    {
        $sections = $input['secciones'] ?? null;
        if (is_array($sections) && !empty($sections)) {
            return array_values(array_filter(array_map(function ($section) {
                $items = $section['items'] ?? [];
                if (!is_array($items) || empty($items)) {
                    return null;
                }

                // Preservar el tipo exacto de la sección sin normalizarlo aquí
                // Se normalizará en buildPayload() para usar la secuencia global correctamente
                $tipo = $section['tipo'] ?? $section['tipo_seccion'] ?? null;

                return [
                    'tipo' => $tipo,
                    'items' => array_values(array_filter($items, fn ($item) => is_array($item))),
                ];
            }, $sections)));
        }

        $flat = $input['items'] ?? $input['dispositivos'] ?? [];
        if (!is_array($flat) || empty($flat)) {
            return [];
        }

        $grouped = [];
        foreach ($flat as $item) {
            if (!is_array($item)) {
                continue;
            }

            $tipo = $this->sectionKey($item['tipo_seccion'] ?? $item['tipo'] ?? $item['seccion'] ?? $this->inferSectionFromDescripcion((string) ($item['descripcion'] ?? '')));
            $grouped[$tipo] ??= [];
            $grouped[$tipo][] = $item;
        }

        $ordered = [];
        foreach (['cebo', 'lamina', 'trampa_luz', 'jaula', 'otros'] as $tipo) {
            if (isset($grouped[$tipo])) {
                $ordered[] = [
                    'tipo' => $tipo,
                    'items' => $grouped[$tipo],
                ];
                unset($grouped[$tipo]);
            }
        }

        foreach ($grouped as $tipo => $items) {
            $ordered[] = [
                'tipo' => $tipo,
                'items' => $items,
            ];
        }

        return $ordered;
    }

    private function sectionKey(mixed $value): string
    {
        $normalized = $this->normalizeText((string) $value);

        if (str_contains($normalized, 'cebo')) {
            return 'cebo';
        }

        if (str_contains($normalized, 'trampa') && str_contains($normalized, 'luz')) {
            return 'trampa_luz';
        }

        if (str_contains($normalized, 'lamina') || str_contains($normalized, 'pegante') || str_contains($normalized, 'adhesiva')) {
            return 'lamina';
        }

        if (str_contains($normalized, 'jaula')) {
            return 'jaula';
        }

        return 'otros';
    }

    private function displaySectionKey(FormatoOperacionalDetalle $detalle): string
    {
        $codigo = strtoupper(trim((string) $detalle->codigo_caja));
        $descripcion = $this->normalizeText((string) $detalle->descripcion);
        $tipo = $this->sectionKey($detalle->tipo_seccion);

        if (str_contains($descripcion, 'caja cebaderas con cebo') || str_contains($descripcion, 'cajas cebaderas con cebo')) {
            return 'roedores_cebo';
        }

        if (str_contains($descripcion, 'caja cebaderas con lamina pegante') || str_contains($descripcion, 'cajas cebaderas con lamina pegante')) {
            return 'roedores_lamina';
        }

        if (str_contains($descripcion, 'laminas pegantes') || str_contains($descripcion, 'lamina pegante')) {
            return 'rastreros_lamina';
        }

        if (str_starts_with($codigo, 'J-')) {
            return 'jaula';
        }

        if (str_starts_with($codigo, 'TL-') || str_starts_with($codigo, 'IV-')) {
            return 'trampa_luz';
        }

        if (str_starts_with($codigo, 'L-') || str_starts_with($codigo, 'IR-')) {
            return 'rastreros_lamina';
        }

        if ($tipo === 'trampa_luz') {
            return 'trampa_luz';
        }

        if ($tipo === 'lamina') {
            return 'rastreros_lamina';
        }

        if ($tipo === 'jaula') {
            return 'jaula';
        }

        return str_starts_with($codigo, 'C-') ? 'roedores_cebo' : $tipo;
    }

    private function displayCodigoCaja(FormatoOperacionalDetalle $detalle, string $sectionKey, int $sequence): string
    {
        $prefix = match ($sectionKey) {
            'roedores_cebo' => 'C',
            'roedores_lamina' => 'C',
            'rastreros_lamina' => 'L',
            'trampa_luz' => 'TL',
            'jaula' => 'J',
            default => 'C',
        };

        if ($prefix === 'J' && str_starts_with(strtoupper((string) $detalle->codigo_caja), 'J-')) {
            return strtoupper((string) $detalle->codigo_caja);
        }

        return sprintf('%s-%02d', $prefix, $sequence);
    }

    private function sectionTitle(string $key): string
    {
        return match ($key) {
            'roedores_cebo' => 'Cebo Final Box',
            'roedores_lamina' => 'Cajas cebaderas con lámina pegante',
            'rastreros_lamina' => 'Láminas pegantes',
            'trampa_luz' => 'Trampa de luz',
            'jaula' => 'Jaulas',
            default => 'Otros',
        };
    }

    private function inferSectionFromDescripcion(string $descripcion): string
    {
        return $this->sectionKey($descripcion);
    }

    private function resolveCodigoCaja(array $item, int $sequence): string
    {
        $code = trim((string) ($item['codigo_caja'] ?? $item['codigo'] ?? ''));
        
        // Para códigos de cajas (C-), siempre usar la secuencia global para garantizar consecutividad
        // Solo mantener códigos especiales como J- (jaulas)
        if ($code !== '' && str_starts_with($code, 'J-')) {
            return $code;
        }

        return sprintf('C-%02d', $sequence);
    }

    private function resolveDescripcion(array $item, string $tipo): string
    {
        $descripcion = trim((string) ($item['descripcion'] ?? ''));
        if ($descripcion !== '') {
            return $descripcion;
        }

        return $this->sectionTitle($tipo);
    }

    private function nullableText(mixed $value): ?string
    {
        $text = trim((string) ($value ?? ''));
        return $text === '' ? null : $text;
    }

    private function dashText(mixed $value): string
    {
        $text = $this->nullableText($value);
        return $text ?? '-';
    }

    private function coalescedText(mixed $primary, mixed $fallback, string $default = ''): string
    {
        $main = $this->nullableText($primary);
        if ($main !== null) {
            return $main;
        }

        $alt = $this->nullableText($fallback);
        if ($alt !== null) {
            return $alt;
        }

        return $default;
    }

    private function toNullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return (int) $value;
        }

        return null;
    }

    private function normalizeConteoInsectos(mixed $value): ?array
    {
        if (!is_array($value) || $value === []) {
            return null;
        }

        $result = [];
        foreach ($value as $family => $counts) {
            if (!is_array($counts)) {
                continue;
            }

            $key = trim((string) $family);
            if ($key === '') {
                continue;
            }

            $verdaderaRaw = $counts['verdadera'] ?? $counts['real'] ?? 0;
            $auditivaRaw = $counts['auditiva'] ?? $counts['falsa'] ?? $counts['audit'] ?? 0;

            $verdadera = is_numeric($verdaderaRaw) ? max(0, (int) $verdaderaRaw) : 0;
            $auditiva = is_numeric($auditivaRaw) ? max(0, (int) $auditivaRaw) : 0;

            $result[$key] = [
                'verdadera' => $verdadera,
                'auditiva' => $auditiva,
            ];
        }

        return $result === [] ? null : $result;
    }

    private function normalizeConteoEstadio(mixed $value): ?array
    {
        if (!is_array($value) || $value === []) {
            return null;
        }

        $result = [];
        foreach ($value as $stage => $counts) {
            if (!is_array($counts)) {
                continue;
            }

            $key = trim((string) $stage);
            if ($key === '') {
                continue;
            }

            $verdaderaRaw = $counts['verdadera'] ?? $counts['real'] ?? 0;
            $auditivaRaw = $counts['auditiva'] ?? $counts['falsa'] ?? $counts['audit'] ?? 0;

            $verdadera = is_numeric($verdaderaRaw) ? max(0, (int) $verdaderaRaw) : 0;
            $auditiva = is_numeric($auditivaRaw) ? max(0, (int) $auditivaRaw) : 0;

            $result[$key] = [
                'verdadera' => $verdadera,
                'auditiva' => $auditiva,
            ];
        }

        return $result === [] ? null : $result;
    }

    private function normalizeText(string $value): string
    {
        return str_replace(
            ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú'],
            ['a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u'],
            strtolower($value)
        );
    }

    private function resolveViewName(FormatoOperacional $formato): string
    {
        $formatos = data_get($formato, 'programacionServicio.formatos_fichas', []);
        if (!is_array($formatos)) {
            $formatos = [];
        }

        $nombresInsectos = [
            'CONTROL DE INSECTOS',
            'CONTROL DE INSECTOS VOLADORES',
            'CONTROL DE INSECTOS RASTREROS',
        ];

        foreach ($formatos as $f) {
            $fNormalized = strtoupper(trim($f));
            if (in_array($fNormalized, $nombresInsectos)) {
                return 'FormatoControlInsectosPDF';
            }
        }

        return 'FormatoOperacionalPDF';
    }
}