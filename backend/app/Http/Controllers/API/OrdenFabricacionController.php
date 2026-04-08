<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenFabricacion;
use App\Models\Producto;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrdenFabricacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OrdenFabricacion::with(['detalles.producto'])
            ->withCount('programaciones');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'like', '%' . $search . '%')
                    ->orWhere('motivo', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('fecha_desde') && $request->filled('fecha_hasta')) {
            $query->whereBetween('fecha_orden', [$request->fecha_desde, $request->fecha_hasta]);
        }

        $ordenes = $query->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'data' => $ordenes,
        ]);
    }

    public function disponibles(): JsonResponse
    {
        $ordenes = OrdenFabricacion::with(['detalles.producto'])
            ->where('estado', 'Confirmada')
            ->whereDoesntHave('programaciones', function ($q) {
                $q->whereNotIn('estado_ejecucion', ['Cancelado']);
            })
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ordenes,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $orden = OrdenFabricacion::with(['detalles.producto', 'programaciones'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $orden,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fecha_orden' => 'required|date',
            'motivo' => 'nullable|string|max:255',
            'estado' => 'nullable|in:Borrador,Confirmada,Programada,Fabricada,Anulada',
            'observaciones' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto_final' => 'required|integer|exists:productos,id',
            'detalles.*.cantidad' => 'required|numeric|min:0.001',
        ]);

        $detallesPayload = $this->buildDetallesPayload($validated['detalles']);

        $orden = DB::transaction(function () use ($request, $validated, $detallesPayload) {
            $orden = OrdenFabricacion::create([
                'codigo' => $this->generarCodigo(),
                'fecha_orden' => $validated['fecha_orden'],
                'motivo' => $validated['motivo'] ?? null,
                'estado' => $validated['estado'] ?? 'Confirmada',
                'resumen_insumos' => $detallesPayload['resumen_insumos'],
                'observaciones' => $validated['observaciones'] ?? null,
                'creado_por' => $request->user()?->id,
            ]);

            foreach ($detallesPayload['detalles'] as $detalle) {
                $orden->detalles()->create($detalle);
            }

            return $orden;
        });

        $orden->load(['detalles.producto']);

        return response()->json([
            'success' => true,
            'message' => 'Orden de fabricacion creada exitosamente',
            'data' => $orden,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orden = OrdenFabricacion::with(['programaciones'])->findOrFail($id);

        if ($orden->programaciones()->exists() && $request->has('detalles')) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede editar detalle de una orden ya vinculada a programacion.',
            ], 422);
        }

        $validated = $request->validate([
            'fecha_orden' => 'sometimes|required|date',
            'motivo' => 'nullable|string|max:255',
            'estado' => 'nullable|in:Borrador,Confirmada,Programada,Fabricada,Anulada',
            'observaciones' => 'nullable|string',
            'detalles' => 'sometimes|array|min:1',
            'detalles.*.id_producto_final' => 'required_with:detalles|integer|exists:productos,id',
            'detalles.*.cantidad' => 'required_with:detalles|numeric|min:0.001',
        ]);

        DB::transaction(function () use ($orden, $validated) {
            $dataUpdate = [
                'fecha_orden' => $validated['fecha_orden'] ?? $orden->fecha_orden,
                'motivo' => $validated['motivo'] ?? $orden->motivo,
                'estado' => $validated['estado'] ?? $orden->estado,
                'observaciones' => $validated['observaciones'] ?? $orden->observaciones,
            ];

            if (array_key_exists('detalles', $validated)) {
                $detallesPayload = $this->buildDetallesPayload($validated['detalles']);
                $dataUpdate['resumen_insumos'] = $detallesPayload['resumen_insumos'];

                $orden->detalles()->delete();
                foreach ($detallesPayload['detalles'] as $detalle) {
                    $orden->detalles()->create($detalle);
                }
            }

            $orden->update($dataUpdate);
        });

        $orden->refresh()->load(['detalles.producto', 'programaciones']);

        return response()->json([
            'success' => true,
            'message' => 'Orden de fabricacion actualizada exitosamente',
            'data' => $orden,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $orden = OrdenFabricacion::withCount('programaciones')->findOrFail($id);

        if ($orden->programaciones_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'La orden ya tiene programaciones vinculadas y no puede eliminarse.',
            ], 422);
        }

        $orden->delete();

        return response()->json([
            'success' => true,
            'message' => 'Orden de fabricacion eliminada exitosamente',
        ]);
    }

    private function buildDetallesPayload(array $detalles): array
    {
        $productoIds = array_values(array_unique(array_map(fn ($d) => (int) $d['id_producto_final'], $detalles)));

        $productos = Producto::with(['recetaDetalles.insumo.inventario'])
            ->whereIn('id', $productoIds)
            ->where('es_fabricable', true)
            ->where('estado', 'Activo')
            ->get()
            ->keyBy('id');

        if (count($productos) !== count($productoIds)) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Uno o mas productos no son fabricables o no estan activos.',
            ], 422));
        }

        $resultadoDetalles = [];
        $insumosTotales = [];

        foreach ($detalles as $detalle) {
            $producto = $productos[(int) $detalle['id_producto_final']];
            $cantidadFabricar = (float) $detalle['cantidad'];

            $recetaSnapshot = $producto->recetaDetalles->map(function ($receta) {
                return [
                    'id_producto_insumo' => (int) $receta->id_producto_insumo,
                    'cantidad' => (float) $receta->cantidad,
                    'unidad' => $receta->unidad,
                    'observacion' => $receta->observacion,
                    'insumo' => $receta->insumo ? [
                        'id' => (int) $receta->insumo->id,
                        'descripcion' => $receta->insumo->descripcion,
                        'unidad' => $receta->insumo->unidad,
                        'inventario' => $receta->insumo->inventario ? [
                            'cantidad_disponible' => (float) $receta->insumo->inventario->cantidad_disponible,
                        ] : null,
                    ] : null,
                ];
            })->values()->all();

            $insumosRequeridos = [];
            foreach ($recetaSnapshot as $insumo) {
                $cantidadRequerida = round(((float) $insumo['cantidad']) * $cantidadFabricar, 3);
                $insumosRequeridos[] = [
                    'id_producto_insumo' => (int) $insumo['id_producto_insumo'],
                    'descripcion' => $insumo['insumo']['descripcion'] ?? 'Insumo',
                    'cantidad_requerida' => $cantidadRequerida,
                    'unidad' => $insumo['unidad'] ?? ($insumo['insumo']['unidad'] ?? null),
                ];

                $key = (int) $insumo['id_producto_insumo'];
                if (!isset($insumosTotales[$key])) {
                    $insumosTotales[$key] = [
                        'id_producto_insumo' => $key,
                        'descripcion' => $insumo['insumo']['descripcion'] ?? 'Insumo',
                        'cantidad_requerida' => 0,
                        'unidad' => $insumo['unidad'] ?? ($insumo['insumo']['unidad'] ?? null),
                    ];
                }
                $insumosTotales[$key]['cantidad_requerida'] = round($insumosTotales[$key]['cantidad_requerida'] + $cantidadRequerida, 3);
            }

            $resultadoDetalles[] = [
                'id_producto_final' => (int) $producto->id,
                'cantidad' => $cantidadFabricar,
                'receta_snapshot' => $recetaSnapshot,
                'insumos_requeridos' => $insumosRequeridos,
            ];
        }

        return [
            'detalles' => $resultadoDetalles,
            'resumen_insumos' => array_values($insumosTotales),
        ];
    }

    private function generarCodigo(): string
    {
        $prefijo = 'OF-' . now()->format('Ymd');
        $ultimo = OrdenFabricacion::query()
            ->where('codigo', 'like', $prefijo . '-%')
            ->orderByDesc('id')
            ->first();

        $correlativo = 1;
        if ($ultimo && preg_match('/-(\d{3})$/', $ultimo->codigo, $m)) {
            $correlativo = ((int) $m[1]) + 1;
        }

        return sprintf('%s-%03d', $prefijo, $correlativo);
    }
}
