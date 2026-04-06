<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Inventario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
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

        // Búsqueda por descripción, lote o SKU
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('descripcion', 'like', "%{$search}%")
                  ->orWhere('n_lote', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
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
                'sku' => $producto->sku,
                'descripcion' => $producto->descripcion,
                'id_categoria' => $producto->id_categoria,
                'n_lote' => $producto->n_lote,
                'fecha_vencim' => $producto->fecha_vencim ? $producto->fecha_vencim->format('Y-m-d') : null,
                'ubicacion' => $producto->ubicacion,
                'unidad' => $producto->unidad,
                'precio_unitario' => $producto->precio_unitario,
                'estado' => $producto->estado,
                'imagen' => $producto->imagen,
                'imagen_url' => $producto->imagen ? asset('storage/' . $producto->imagen) : null,
                'ingre_activo' => $producto->ingre_activo,
                'plag_objetivo' => $producto->plag_objetivo,
                'presentacion' => $producto->presentacion,
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
     * Crear un nuevo producto
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'descripcion' => 'required|string|max:255',
            'id_categoria' => 'required|exists:categoria,id',
            'fecha_vencim' => 'nullable|date',
            'ubicacion' => 'nullable|string|max:100',
            'n_lote' => 'nullable|string|max:50',
            'unidad' => 'nullable|string|max:20',
            'precio_unitario' => 'nullable|numeric|min:0',
            'stock_seguridad' => 'required|integer|min:0',
            'estado' => 'nullable|in:Activo,Inactivo',
            'ingre_activo' => 'nullable|string|max:500',
            'plag_objetivo' => 'nullable|string|max:500',
            'presentacion' => 'nullable|string|max:500'
        ], [
            'descripcion.required' => 'La descripción del producto es requerida',
            'id_categoria.required' => 'La categoría es requerida',
            'id_categoria.exists' => 'La categoría seleccionada no existe',
            'precio_unitario.numeric' => 'El precio debe ser un número válido',
            'stock_seguridad.required' => 'El stock de seguridad es requerido',
            'stock_seguridad.integer' => 'El stock de seguridad debe ser un número entero',
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
        $nLote = $request->input('n_lote') ?? '';

        $producto = Producto::create([
            'sku' => $sku,
            'descripcion' => $request->descripcion,
            'id_categoria' => $request->id_categoria,
            'fecha_vencim' => $request->fecha_vencim,
            'ubicacion' => $ubicacion,
            'n_lote' => $nLote,
            'unidad' => $request->unidad,
            'precio_unitario' => $request->precio_unitario,
            'estado' => $request->estado ?? 'Activo',
            'ingre_activo' => $request->ingre_activo,
            'plag_objetivo' => $request->plag_objetivo,
            'presentacion' => $request->presentacion,
        ]);

        Inventario::create([
            'id_productos' => $producto->id,
            'cantidad_disponible' => 0,
            'stock_seguridad' => $request->stock_seguridad,
            'Tipo' => 'Entrada',
            'Cantidad_total' => 0,
        ]);

        $producto->load(['categoria', 'inventario']);

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
        $producto = Producto::with(['categoria', 'inventario'])->find($id);

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
            'n_lote' => $producto->n_lote,
            'fecha_vencim' => $producto->fecha_vencim ? $producto->fecha_vencim->format('Y-m-d') : null,
            'ubicacion' => $producto->ubicacion,
            'unidad' => $producto->unidad,
            'precio_unitario' => $producto->precio_unitario,
            'estado' => $producto->estado,
            'imagen' => $producto->imagen,
            'imagen_url' => $producto->imagen ? asset('storage/' . $producto->imagen) : null,
            'ingre_activo' => $producto->ingre_activo,
            'plag_objetivo' => $producto->plag_objetivo,
            'presentacion' => $producto->presentacion,
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
            'fecha_vencim' => 'nullable|date',
            'ubicacion' => 'nullable|string|max:100',
            'n_lote' => 'sometimes|nullable|string|max:50',
            'unidad' => 'nullable|string|max:20',
            'precio_unitario' => 'nullable|numeric|min:0',
            'stock_seguridad' => 'nullable|integer|min:0',
            'estado' => 'sometimes|in:Activo,Inactivo',
            'ingre_activo' => 'nullable|string|max:500',
            'plag_objetivo' => 'nullable|string|max:500',
            'presentacion' => 'nullable|string|max:500',

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
            'fecha_vencim',
            'ubicacion',
            'n_lote',
            'unidad',
            'precio_unitario',
            'estado',
            'ingre_activo',
            'plag_objetivo',
            'presentacion'
        ]);

        // Compatibilidad con columnas NOT NULL cuando el valor llega vacío y se convierte a null.
        if (array_key_exists('ubicacion', $payload) && $payload['ubicacion'] === null) {
            $payload['ubicacion'] = '';
        }
        if (array_key_exists('n_lote', $payload) && $payload['n_lote'] === null) {
            $payload['n_lote'] = '';
        }

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

        $stockBajo = Producto::where('estado', 'Activo')
            ->whereHas('inventario', function($q) {
                $q->whereColumn('cantidad_disponible', '<', 'stock_seguridad')
                   ->where('cantidad_disponible', '>', 0);
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
                'imagen_url' => asset('storage/' . $ruta),
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
