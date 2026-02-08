<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CategoriaController extends Controller
{
    /**
     * Listar todas las categorías
     */
    public function index(Request $request): JsonResponse
    {
        $query = Categoria::withCount('productos');

        // Filtro por estado (Activo/Inactivo)
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        } else {
            // Por defecto solo mostrar categorías activas
            $query->where('estado', 'Activo');
        }

        // Búsqueda por nombre
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%");
        }

        $categorias = $query->orderBy('nombre', 'asc')->get();

        // Formatear respuesta
        $data = $categorias->map(function($categoria) {
            return [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
                'descripcion' => $categoria->descripcion,
                'estado' => $categoria->estado,
                'total_productos' => $categoria->productos_count,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Crear una nueva categoría
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100|unique:categoria,nombre',
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'nullable|in:Activo,Inactivo',
        ], [
            'nombre.required' => 'El nombre de la categoría es requerido',
            'nombre.unique' => 'Ya existe una categoría con este nombre',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $categoria = Categoria::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'estado' => $request->estado ?? 'Activo', // Por defecto Activo
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Categoría creada exitosamente',
            'data' => $categoria
        ], 201);
    }

    /**
     * Obtener detalle de una categoría
     */
    public function show($id): JsonResponse
    {
        $categoria = Categoria::withCount('productos')->find($id);

        if (!$categoria) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $data = [
            'id' => $categoria->id,
            'nombre' => $categoria->nombre,
            'descripcion' => $categoria->descripcion,
            'estado' => $categoria->estado,
            'total_productos' => $categoria->productos_count,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Actualizar una categoría
     */
    public function update(Request $request, $id): JsonResponse
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:100|unique:categoria,nombre,' . $id,
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'sometimes|in:Activo,Inactivo',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $categoria->update($request->only([
            'nombre',
            'descripcion',
            'estado'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada exitosamente',
            'data' => $categoria
        ]);
    }

    /**
     * Eliminar (desactivar) una categoría
     * No se elimina físicamente, solo cambia estado a Inactivo
     */
    public function destroy($id): JsonResponse
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        // Verificar si tiene productos asociados
        $productosCount = $categoria->productos()->count();
        
        if ($productosCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede desactivar la categoría porque tiene {$productosCount} producto(s) asociado(s)"
            ], 400);
        }

        // Soft delete: cambiar estado a Inactivo
        $categoria->update(['estado' => 'Inactivo']);

        return response()->json([
            'success' => true,
            'message' => 'Categoría desactivada exitosamente'
        ]);
    }

    /**
     * Reactivar una categoría inactiva
     */
    public function reactivar($id): JsonResponse
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json([
                'success' => false,
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        if ($categoria->estado === 'Activo') {
            return response()->json([
                'success' => false,
                'message' => 'La categoría ya está activa'
            ], 400);
        }

        $categoria->update(['estado' => 'Activo']);

        return response()->json([
            'success' => true,
            'message' => 'Categoría reactivada exitosamente',
            'data' => $categoria
        ]);
    }

    /**
     * Obtener estadísticas de categorías
     */
    public function estadisticas(): JsonResponse
    {
        $total = Categoria::count();
        $activas = Categoria::where('estado', 'Activo')->count();
        $inactivas = Categoria::where('estado', 'Inactivo')->count();
        
        $conProductos = Categoria::has('productos')->count();
        $sinProductos = Categoria::doesntHave('productos')->count();

        $topCategorias = Categoria::withCount('productos')
            ->where('estado', 'Activo')
            ->orderBy('productos_count', 'desc')
            ->take(5)
            ->get()
            ->map(function($cat) {
                return [
                    'nombre' => $cat->nombre,
                    'total_productos' => $cat->productos_count
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'total_categorias' => $total,
                'categorias_activas' => $activas,
                'categorias_inactivas' => $inactivas,
                'con_productos' => $conProductos,
                'sin_productos' => $sinProductos,
                'top_5_categorias' => $topCategorias
            ]
        ]);
    }
}
