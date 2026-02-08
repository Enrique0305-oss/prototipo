<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProductoController extends Controller
{
    /**
     * Listar todos los productos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Producto::with(['categoria', 'inventario']);

        // Filtro por estado (Activo/Inactivo)
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        } else {
            // Por defecto solo mostrar productos activos
            $query->where('estado', 'Activo');
        }

        // Filtro por categoría
        if ($request->has('id_categoria')) {
            $query->where('id_categoria', $request->id_categoria);
        }

        // Búsqueda por descripción o lote
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('descripcion', 'like', "%{$search}%")
                  ->orWhere('n_lote', 'like', "%{$search}%");
            });
        }

        // Filtro por productos con stock
        if ($request->has('con_stock') && $request->con_stock === 'true') {
            $query->whereHas('inventario', function($q) {
                $q->where('cantidad_disponible', '>', 0);
            });
        }

        // Filtro por productos próximos a vencer (30 días)
        if ($request->has('proximos_vencer') && $request->proximos_vencer === 'true') {
            $query->where('fecha_vencim', '<=', now()->addDays(30))
                  ->where('fecha_vencim', '>=', now());
        }

        $productos = $query->orderBy('descripcion', 'asc')->get();

        // Formatear respuesta
        $data = $productos->map(function($producto) {
            return [
                'id' => $producto->id,
                'descripcion' => $producto->descripcion,
                'n_lote' => $producto->n_lote,
                'fecha_vencim' => $producto->fecha_vencim ? $producto->fecha_vencim->format('Y-m-d') : null,
                'ubicacion' => $producto->ubicacion,
                'estado' => $producto->estado,
                'categoria' => $producto->categoria ? [
                    'id' => $producto->categoria->id,
                    'nombre' => $producto->categoria->nombre,
                ] : null,
                'inventario' => $producto->inventario ? [
                    'cantidad_disponible' => $producto->inventario->cantidad_disponible,
                    'cantidad_minima' => $producto->inventario->cantidad_minima,
                    'cantidad_maxima' => $producto->inventario->cantidad_maxima,
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
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
            'fecha_vencim' => 'nullable|date',
            'ubicacion' => 'nullable|string|max:100',
            'n_lote' => 'required|string|max:50',
            'estado' => 'nullable|in:Activo,Inactivo',
        ], [
            'descripcion.required' => 'La descripción del producto es requerida',
            'id_categoria.required' => 'La categoría es requerida',
            'id_categoria.exists' => 'La categoría seleccionada no existe',
            'n_lote.required' => 'El número de lote es requerido',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $producto = Producto::create([
            'descripcion' => $request->descripcion,
            'id_categoria' => $request->id_categoria,
            'fecha_vencim' => $request->fecha_vencim,
            'ubicacion' => $request->ubicacion,
            'n_lote' => $request->n_lote,
            'estado' => $request->estado ?? 'Activo', // Por defecto Activo
        ]);

        $producto->load(['categoria', 'inventario']);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'data' => $producto
        ], 201);
    }

    /**
     * Obtener detalle de un producto
     */
    public function show($id): JsonResponse
    {
        $producto = Producto::with(['categoria', 'inventario'])->find($id);

        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $data = [
            'id' => $producto->id,
            'descripcion' => $producto->descripcion,
            'n_lote' => $producto->n_lote,
            'fecha_vencim' => $producto->fecha_vencim ? $producto->fecha_vencim->format('Y-m-d') : null,
            'ubicacion' => $producto->ubicacion,
            'estado' => $producto->estado,
            'categoria' => $producto->categoria ? [
                'id' => $producto->categoria->id,
                'nombre' => $producto->categoria->nombre,
                'descripcion' => $producto->categoria->descripcion,
            ] : null,
            'inventario' => $producto->inventario ? [
                'id' => $producto->inventario->id,
                'cantidad_disponible' => $producto->inventario->cantidad_disponible,
                'cantidad_minima' => $producto->inventario->cantidad_minima,
                'cantidad_maxima' => $producto->inventario->cantidad_maxima,
                'fecha_ultimo_ingreso' => $producto->inventario->fecha_ultimo_ingreso,
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
            'fecha_vencim' => 'nullable|date',
            'ubicacion' => 'nullable|string|max:100',
            'n_lote' => 'sometimes|required|string|max:50',
            'estado' => 'sometimes|in:Activo,Inactivo',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $producto->update($request->only([
            'descripcion',
            'id_categoria',
            'fecha_vencim',
            'ubicacion',
            'n_lote',
            'estado'
        ]));

        $producto->load(['categoria', 'inventario']);

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

        $proximosVencer = Producto::where('estado', 'Activo')
            ->where('fecha_vencim', '<=', now()->addDays(30))
            ->where('fecha_vencim', '>=', now())
            ->count();

        $vencidos = Producto::where('estado', 'Activo')
            ->where('fecha_vencim', '<', now())
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
                'proximos_vencer_30dias' => $proximosVencer,
                'vencidos' => $vencidos,
                'por_categoria' => $porCategoria
            ]
        ]);
    }
}
