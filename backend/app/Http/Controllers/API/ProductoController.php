<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Inventario;
use App\Models\Lote;
use App\Models\ProductoRecetaDetalle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductoController extends Controller
{
    /**
     * Listar todos los productos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Producto::with(['categoria', 'inventario']);

        // Filtro por estado (Activo/Inactivo)
        if ($request->has('estado') && $request->estado !== 'all') {
            $query->where('estado', $request->estado);
        } elseif (!$request->has('estado')) {
            // Por defecto solo mostrar productos activos
            $query->where('estado', 'Activo');
        }

        // Filtro por categoría
        if ($request->has('id_categoria')) {
            $query->where('id_categoria', $request->id_categoria);
        }

        // Búsqueda por descripción o SKU
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('descripcion', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filtro por productos con stock
        if ($request->has('con_stock') && $request->con_stock === 'true') {
            $query->whereHas('inventario', function($q) {
                $q->where('cantidad_disponible', '>', 0);
            });
        }

        // Filtro por productos con lotes próximos a vencer (30 días)
        if ($request->has('proximos_vencer') && $request->proximos_vencer === 'true') {
            $query->whereHas('lotes', function($q) {
                $q->where('estado', 'Activo')
                  ->where('cantidad_disponible', '>', 0)
                  ->whereDate('fecha_vencimiento', '<=', now()->addDays(30))
                  ->whereDate('fecha_vencimiento', '>=', now());
            });
        }

        $productos = $query->orderBy('descripcion', 'asc')->get();

        // Formatear respuesta
        $data = $productos->map(function($producto) {
            return [
                'id' => $producto->id,
                'sku' => $producto->sku,
                'descripcion' => $producto->descripcion,
                'id_categoria' => $producto->id_categoria,
                'ubicacion' => $producto->ubicacion,
                'unidad' => $producto->unidad,
                'precio_unitario' => $producto->precio_unitario,
                'estado' => $producto->estado,
                'imagen' => $producto->imagen,
                'imagen_url' => $producto->imagen ? url('media/' . ltrim($producto->imagen, '/')) : null,
                'ingre_activo' => $producto->ingre_activo,
                'plag_objetivo' => $producto->plag_objetivo,
                'presentacion' => $producto->presentacion,
                'es_fabricable' => (bool) $producto->es_fabricable,
                'categoria' => $producto->categoria ? [
                    'id' => $producto->categoria->id,
                    'nombre' => $producto->categoria->nombre,
                ] : null,
                'inventario' => $producto->inventario ? [
                    'cantidad_disponible' => $producto->inventario->cantidad_disponible,
                    'stock_seguridad' => $producto->inventario->stock_seguridad,
                    'cantidad_total' => $producto->inventario->Cantidad_total,
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Listar productos fabricables activos con su receta.
     */
    public function fabricables(): JsonResponse
    {
        $productos = Producto::with(['inventario', 'recetaDetalles.insumo.inventario'])
            ->where('estado', 'Activo')
            ->where('es_fabricable', true)
            ->orderBy('descripcion', 'asc')
            ->get();

        $data = $productos->map(function (Producto $producto) {
            return [
                'id' => $producto->id,
                'sku' => $producto->sku,
                'descripcion' => $producto->descripcion,
                'unidad' => $producto->unidad,
                'es_fabricable' => (bool) $producto->es_fabricable,
                'inventario' => $producto->inventario ? [
                    'cantidad_disponible' => $producto->inventario->cantidad_disponible,
                    'stock_seguridad' => $producto->inventario->stock_seguridad,
                    'cantidad_total' => $producto->inventario->Cantidad_total,
                ] : null,
                'receta' => $producto->recetaDetalles->map(function ($detalle) {
                    return [
                        'id' => $detalle->id,
                        'id_producto_insumo' => $detalle->id_producto_insumo,
                        'cantidad' => (float) $detalle->cantidad,
                        'unidad' => $detalle->unidad,
                        'observacion' => $detalle->observacion,
                        'insumo' => $detalle->insumo ? [
                            'id' => $detalle->insumo->id,
                            'descripcion' => $detalle->insumo->descripcion,
                            'unidad' => $detalle->insumo->unidad,
                            'inventario' => $detalle->insumo->inventario ? [
                                'cantidad_disponible' => $detalle->insumo->inventario->cantidad_disponible,
                            ] : null,
                        ] : null,
                    ];
                })->values(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Crear un nuevo producto
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'descripcion' => 'required|string|max:255',
            'id_categoria' => 'required|exists:categoria,id',
            'ubicacion' => 'nullable|string|max:100',
            'unidad' => 'nullable|string|max:20',
            'precio_unitario' => 'nullable|numeric|min:0',
            'stock_seguridad' => 'required|integer|min:0',
            'estado' => 'nullable|in:Activo,Inactivo',
            'ingre_activo' => 'nullable|string|max:500',
            'plag_objetivo' => 'nullable|string|max:500',
            'presentacion' => 'nullable|string|max:500',
            'es_fabricable' => 'sometimes|boolean',
            'receta' => 'sometimes|array',
            'receta.*.id_producto_insumo' => 'required_with:receta|integer|exists:productos,id|distinct',
            'receta.*.cantidad' => 'required_with:receta|numeric|min:0.001',
            'receta.*.unidad' => 'nullable|string|max:20',
            'receta.*.observacion' => 'nullable|string|max:255',
            'lotes' => 'sometimes|array|min:1',
            'lotes.*.numero_lote' => 'required_with:lotes|string|max:50',
            'lotes.*.fecha_vencimiento' => 'required_with:lotes|date',
            'lotes.*.cantidad' => 'required_with:lotes|integer|min:1',
            'lotes.*.observacion' => 'nullable|string|max:500',
        ], [
            'descripcion.required' => 'La descripción del producto es requerida',
            'id_categoria.required' => 'La categoría es requerida',
            'id_categoria.exists' => 'La categoría seleccionada no existe',
            'precio_unitario.numeric' => 'El precio debe ser un número válido',
            'stock_seguridad.required' => 'El stock de seguridad es requerido',
            'stock_seguridad.integer' => 'El stock de seguridad debe ser un número entero',
            'lotes.*.numero_lote.required_with' => 'El número de lote es requerido',
            'lotes.*.fecha_vencimiento.required_with' => 'La fecha de vencimiento es requerida',
            'lotes.*.cantidad.required_with' => 'La cantidad del lote es requerida',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generar SKU automático
        $categoria = Categoria::find($request->id_categoria);
        $sku = $this->generarSKU($categoria->nombre ?? 'PRD', $request->descripcion);

        // Si vienen vacíos, Laravel los convierte a null. Forzamos string vacío
        // para compatibilidad con esquemas donde estas columnas siguen como NOT NULL.
        $ubicacion = $request->input('ubicacion') ?? '';

        DB::beginTransaction();
        try {
            $producto = Producto::create([
                'sku' => $sku,
                'descripcion' => $request->descripcion,
                'id_categoria' => $request->id_categoria,
                'ubicacion' => $ubicacion,
                'unidad' => $request->unidad,
                'precio_unitario' => $request->precio_unitario,
                'estado' => $request->estado ?? 'Activo',
                'ingre_activo' => $request->ingre_activo,
                'plag_objetivo' => $request->plag_objetivo,
                'presentacion' => $request->presentacion,
                'es_fabricable' => (bool) $request->boolean('es_fabricable'),
            ]);

            // Crear lotes si se proporcionan
            $stockTotal = 0;
            $lotes = $request->input('lotes', []);
            
            if (!empty($lotes)) {
                foreach ($lotes as $loteData) {
                    Lote::create([
                        'id_producto' => $producto->id,
                        'numero_lote' => $loteData['numero_lote'],
                        'fecha_vencimiento' => $loteData['fecha_vencimiento'],
                        'cantidad' => $loteData['cantidad'],
                        'cantidad_disponible' => $loteData['cantidad'],
                        'estado' => 'Activo',
                        'observacion' => $loteData['observacion'] ?? null,
                    ]);
                    $stockTotal += $loteData['cantidad'];
                }
            }

            Inventario::create([
                'id_productos' => $producto->id,
                'cantidad_disponible' => $stockTotal,
                'stock_seguridad' => $request->stock_seguridad,
                'Tipo' => 'Entrada',
                'Cantidad_total' => $stockTotal,
            ]);

            if ($producto->es_fabricable) {
                $this->syncRecetaProducto($producto, $request->input('receta', []));
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'No se pudo crear el producto',
                'error' => $e->getMessage(),
            ], 500);
        }

        $producto->load(['categoria', 'inventario', 'recetaDetalles.insumo.inventario', 'lotes']);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'data' => $producto
        ], 201);
    }

    /**
     * Generar SKU único para el producto
     * Formato: [CAT]-[PRD]-0001
     */
    private function generarSKU(string $categoriaNombre, string $productoNombre): string
    {
        // Obtener las primeras 3 letras de la categoría
        $catPrefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $categoriaNombre), 0, 3));
        if (strlen($catPrefix) < 3) {
            $catPrefix = str_pad($catPrefix, 3, 'X');
        }

        // Obtener las primeras 3 letras del producto
        $prodPrefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $productoNombre), 0, 3));
        if (strlen($prodPrefix) < 3) {
            $prodPrefix = str_pad($prodPrefix, 3, 'X');
        }

        // Obtener el último número usado para este prefijo
        $prefix = "{$catPrefix}-{$prodPrefix}";
        $ultimoProducto = Producto::where('sku', 'LIKE', "{$prefix}-%")
            ->orderBy('sku', 'desc')
            ->first();

        if ($ultimoProducto) {
            // Extraer el número del último SKU y sumar 1
            $partes = explode('-', $ultimoProducto->sku);
            $ultimoNumero = isset($partes[2]) ? intval($partes[2]) : 0;
            $numero = str_pad($ultimoNumero + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $numero = '0001';
        }

        return "{$prefix}-{$numero}";
    }

    /**
     * Obtener detalle de un producto
     */
    public function show($id): JsonResponse
    {
        $producto = Producto::with(['categoria', 'inventario', 'recetaDetalles.insumo.inventario'])->find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $data = [
            'id' => $producto->id,
            'sku' => $producto->sku,
            'descripcion' => $producto->descripcion,
            'id_categoria' => $producto->id_categoria,
            'ubicacion' => $producto->ubicacion,
            'unidad' => $producto->unidad,
            'precio_unitario' => $producto->precio_unitario,
            'estado' => $producto->estado,
            'imagen' => $producto->imagen,
            'imagen_url' => $producto->imagen ? url('media/' . ltrim($producto->imagen, '/')) : null,
            'ingre_activo' => $producto->ingre_activo,
            'plag_objetivo' => $producto->plag_objetivo,
            'presentacion' => $producto->presentacion,
            'es_fabricable' => (bool) $producto->es_fabricable,
            'receta' => $producto->recetaDetalles->map(function ($detalle) {
                return [
                    'id' => $detalle->id,
                    'id_producto_insumo' => $detalle->id_producto_insumo,
                    'cantidad' => (float) $detalle->cantidad,
                    'unidad' => $detalle->unidad,
                    'observacion' => $detalle->observacion,
                    'insumo' => $detalle->insumo ? [
                        'id' => $detalle->insumo->id,
                        'descripcion' => $detalle->insumo->descripcion,
                        'unidad' => $detalle->insumo->unidad,
                        'inventario' => $detalle->insumo->inventario ? [
                            'cantidad_disponible' => $detalle->insumo->inventario->cantidad_disponible,
                        ] : null,
                    ] : null,
                ];
            })->values(),
            'categoria' => $producto->categoria ? [
                'id' => $producto->categoria->id,
                'nombre' => $producto->categoria->nombre,
                'descripcion' => $producto->categoria->descripcion,
            ] : null,
            'inventario' => $producto->inventario ? [
                'id' => $producto->inventario->id,
                'cantidad_disponible' => $producto->inventario->cantidad_disponible,
                'stock_seguridad' => $producto->inventario->stock_seguridad,
                'cantidad_total' => $producto->inventario->Cantidad_total,
            ] : null,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Actualizar un producto
     */
    public function update(Request $request, $id): JsonResponse
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'descripcion' => 'sometimes|required|string|max:255',
            'id_categoria' => 'sometimes|required|exists:categoria,id',
            'ubicacion' => 'nullable|string|max:100',
            'unidad' => 'nullable|string|max:20',
            'precio_unitario' => 'nullable|numeric|min:0',
            'stock_seguridad' => 'nullable|integer|min:0',
            'estado' => 'sometimes|in:Activo,Inactivo',
            'ingre_activo' => 'nullable|string|max:500',
            'plag_objetivo' => 'nullable|string|max:500',
            'presentacion' => 'nullable|string|max:500',
            'es_fabricable' => 'sometimes|boolean',
            'receta' => 'sometimes|array',
            'receta.*.id_producto_insumo' => 'required_with:receta|integer|exists:productos,id|distinct',
            'receta.*.cantidad' => 'required_with:receta|numeric|min:0.001',
            'receta.*.unidad' => 'nullable|string|max:20',
            'receta.*.observacion' => 'nullable|string|max:255',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Regenerar SKU si cambia la categoría o descripción
        if ($request->has('id_categoria') || $request->has('descripcion')) {
            $nuevaCategoria = $request->has('id_categoria') 
                ? Categoria::find($request->id_categoria)
                : $producto->categoria;
            $nuevaDescripcion = $request->has('descripcion') 
                ? $request->descripcion 
                : $producto->descripcion;
            
            $producto->sku = $this->generarSKU(
                $nuevaCategoria->nombre ?? 'PRD', 
                $nuevaDescripcion
            );
        }

        $payload = $request->only([
            'descripcion',
            'id_categoria',
            'ubicacion',
            'unidad',
            'precio_unitario',
            'estado',
            'ingre_activo',
            'plag_objetivo',
            'presentacion',
            'es_fabricable',
        ]);

        // Compatibilidad con columnas NOT NULL cuando el valor llega vacío y se convierte a null.
        if (array_key_exists('ubicacion', $payload) && $payload['ubicacion'] === null) {
            $payload['ubicacion'] = '';
        }

        DB::beginTransaction();
        try {
            $producto->update($payload);

            if ($request->has('stock_seguridad')) {
                $inventario = $producto->inventario;
                if ($inventario) {
                    $inventario->update([
                        'stock_seguridad' => $request->stock_seguridad,
                    ]);
                } else {
                    Inventario::create([
                        'id_productos' => $producto->id,
                        'cantidad_disponible' => 0,
                        'stock_seguridad' => $request->stock_seguridad,
                        'Tipo' => 'Entrada',
                        'Cantidad_total' => 0,
                    ]);
                }
            }

            $fabricableActual = (bool) ($request->has('es_fabricable') ? $request->boolean('es_fabricable') : $producto->es_fabricable);
            if ($request->has('receta')) {
                if ($fabricableActual) {
                    $this->syncRecetaProducto($producto, $request->input('receta', []));
                } else {
                    $producto->recetaDetalles()->delete();
                }
            } elseif ($request->has('es_fabricable') && !$request->boolean('es_fabricable')) {
                $producto->recetaDetalles()->delete();
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'No se pudo actualizar el producto',
                'error' => $e->getMessage(),
            ], 500);
        }

        $producto->load(['categoria', 'inventario', 'recetaDetalles.insumo.inventario']);

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'data' => $producto
        ]);
    }

    /**
     * Eliminar (desactivar) un producto
     * No se elimina físicamente, solo cambia estado a Inactivo
     */
    public function destroy($id): JsonResponse
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        // Soft delete: cambiar estado a Inactivo en lugar de eliminar
        $producto->update(['estado' => 'Inactivo']);

        return response()->json([
            'success' => true,
            'message' => 'Producto desactivado exitosamente'
        ]);
    }

    /**
     * Reactivar un producto inactivo
     */
    public function reactivar($id): JsonResponse
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        if ($producto->estado === 'Activo') {
            return response()->json([
                'success' => false,
                'message' => 'El producto ya está activo'
            ], 400);
        }

        $producto->update(['estado' => 'Activo']);

        return response()->json([
            'success' => true,
            'message' => 'Producto reactivado exitosamente',
            'data' => $producto
        ]);
    }

    /**
     * Obtener receta (insumos) de un producto fabricable
     */
    public function receta($id): JsonResponse
    {
        $producto = Producto::with(['recetaDetalles.insumo.inventario'])->find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado',
            ], 404);
        }

        $data = $producto->recetaDetalles->map(function ($detalle) {
            return [
                'id' => $detalle->id,
                'id_producto_insumo' => $detalle->id_producto_insumo,
                'cantidad' => (float) $detalle->cantidad,
                'unidad' => $detalle->unidad,
                'observacion' => $detalle->observacion,
                'insumo' => $detalle->insumo ? [
                    'id' => $detalle->insumo->id,
                    'descripcion' => $detalle->insumo->descripcion,
                    'unidad' => $detalle->insumo->unidad,
                    'inventario' => $detalle->insumo->inventario ? [
                        'cantidad_disponible' => $detalle->insumo->inventario->cantidad_disponible,
                    ] : null,
                ] : null,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'id_producto' => $producto->id,
                'es_fabricable' => (bool) $producto->es_fabricable,
                'receta' => $data,
            ],
        ]);
    }

    /**
     * Sincronizar receta de un producto
     */
    public function syncReceta(Request $request, $id): JsonResponse
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'receta' => 'required|array',
            'receta.*.id_producto_insumo' => 'required|integer|exists:productos,id|distinct',
            'receta.*.cantidad' => 'required|numeric|min:0.001',
            'receta.*.unidad' => 'nullable|string|max:20',
            'receta.*.observacion' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $producto->es_fabricable = true;
            $producto->save();

            $this->syncRecetaProducto($producto, $request->input('receta', []));

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'No se pudo guardar la receta',
                'error' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Receta actualizada correctamente',
        ]);
    }

    private function syncRecetaProducto(Producto $producto, array $receta): void
    {
        $rows = collect($receta)
            ->filter(fn ($item) => !empty($item['id_producto_insumo']) && !empty($item['cantidad']))
            ->map(function ($item) use ($producto) {
                $idInsumo = (int) $item['id_producto_insumo'];
                if ($idInsumo === (int) $producto->id) {
                    throw new \InvalidArgumentException('Un producto no puede consumirse a sí mismo en su receta');
                }

                return [
                    'id_producto_final' => $producto->id,
                    'id_producto_insumo' => $idInsumo,
                    'cantidad' => (float) $item['cantidad'],
                    'unidad' => $item['unidad'] ?? null,
                    'observacion' => $item['observacion'] ?? null,
                ];
            })
            ->values();

        $producto->recetaDetalles()->delete();

        if ($rows->isNotEmpty()) {
            ProductoRecetaDetalle::insert($rows->all());
        }
    }

    /**
     * Obtener estadísticas de productos
     */
    public function estadisticas(): JsonResponse
    {
        $total = Producto::count();
        $activos = Producto::where('estado', 'Activo')->count();
        $inactivos = Producto::where('estado', 'Inactivo')->count();
        
        $conStock = Producto::whereHas('inventario', function($q) {
            $q->where('cantidad_disponible', '>', 0);
        })->count();

        $sinStock = Producto::whereHas('inventario', function($q) {
            $q->where('cantidad_disponible', '<=', 0);
        })->count();

        $stockBajo = Producto::where('estado', 'Activo')
            ->whereHas('inventario', function($q) {
                $q->whereColumn('cantidad_disponible', '<', 'stock_seguridad')
                   ->where('cantidad_disponible', '>', 0);
            })->count();

        $proximosVencer = Producto::where('estado', 'Activo')
            ->whereHas('lotes', function($q) {
                $q->where('estado', 'Activo')
                  ->where('cantidad_disponible', '>', 0)
                  ->whereDate('fecha_vencimiento', '<=', now()->addDays(30))
                  ->whereDate('fecha_vencimiento', '>=', now());
            })
            ->count();

        $vencidos = Producto::where('estado', 'Activo')
            ->whereHas('lotes', function($q) {
                $q->where('estado', 'Activo')
                  ->where('cantidad_disponible', '>', 0)
                  ->whereDate('fecha_vencimiento', '<', now());
            })
            ->count();

        $porCategoria = Producto::with('categoria')
            ->where('estado', 'Activo')
            ->get()
            ->groupBy('id_categoria')
            ->map(function($grupo) {
                return [
                    'categoria' => $grupo->first()->categoria ? $grupo->first()->categoria->nombre : 'Sin categoría',
                    'total' => $grupo->count()
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'total_productos' => $total,
                'productos_activos' => $activos,
                'productos_inactivos' => $inactivos,
                'con_stock' => $conStock,
                'sin_stock' => $sinStock,
                'stock_bajo' => $stockBajo,
                'proximos_vencer_30dias' => $proximosVencer,
                'vencidos' => $vencidos,
                'por_categoria' => $porCategoria
            ]
        ]);
    }

    /**
     * Subir o actualizar imagen de un producto
     */
    public function subirImagen(Request $request, $id): JsonResponse
    {
        $producto = Producto::with('categoria')->find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'imagen' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
        ], [
            'imagen.required' => 'La imagen es requerida',
            'imagen.image' => 'El archivo debe ser una imagen',
            'imagen.mimes' => 'Solo se aceptan formatos: jpeg, jpg, png, webp',
            'imagen.max' => 'La imagen no debe superar los 5MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Eliminar imagen anterior si existe
        if ($producto->imagen && Storage::disk('public')->exists($producto->imagen)) {
            Storage::disk('public')->delete($producto->imagen);
        }

        // Determinar carpeta según categoría
        $categoriaNombre = $producto->categoria
            ? Str::slug($producto->categoria->nombre, '-')
            : 'sin-categoria';

        $carpeta = "productos/{$categoriaNombre}";

        // Generar nombre de archivo único
        $extension = $request->file('imagen')->getClientOriginalExtension();
        $nombreArchivo = Str::slug($producto->descripcion) . '-' . $producto->id . '.' . $extension;

        // Guardar archivo
        $ruta = $request->file('imagen')->storeAs($carpeta, $nombreArchivo, 'public');

        // Actualizar BD
        $producto->update(['imagen' => $ruta]);

        return response()->json([
            'success' => true,
            'message' => 'Imagen subida exitosamente',
            'data' => [
                'imagen' => $ruta,
                'imagen_url' => url('media/' . ltrim($ruta, '/')),
            ]
        ]);
    }

    /**
     * Eliminar imagen de un producto
     */
    public function eliminarImagen($id): JsonResponse
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        if ($producto->imagen && Storage::disk('public')->exists($producto->imagen)) {
            Storage::disk('public')->delete($producto->imagen);
        }

        $producto->update(['imagen' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Imagen eliminada exitosamente'
        ]);
    }
}
