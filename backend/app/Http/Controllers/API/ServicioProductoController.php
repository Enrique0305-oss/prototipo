<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ServicioProducto;
use App\Models\Servicio;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServicioProductoController extends Controller
{
    /**
     * Listar productos (receta) de un servicio
     */
    public function index($idServicio): JsonResponse
    {
        $servicio = Servicio::find($idServicio);
        if (!$servicio) {
            return response()->json(['success' => false, 'message' => 'Servicio no encontrado'], 404);
        }

        $items = ServicioProducto::with('producto')
            ->where('id_servicio', $idServicio)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'id_producto' => $item->id_producto,
                    'producto' => $item->producto ? $item->producto->descripcion : 'N/A',
                    'unidad' => $item->producto ? $item->producto->unidad : '',
                    'cantidad_default' => $item->cantidad_default,
                    'observacion' => $item->observacion,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Agregar producto a la receta de un servicio
     */
    public function store(Request $request, $idServicio): JsonResponse
    {
        $servicio = Servicio::find($idServicio);
        if (!$servicio) {
            return response()->json(['success' => false, 'message' => 'Servicio no encontrado'], 404);
        }

        $validated = $request->validate([
            'id_producto' => 'required|integer|exists:productos,id',
            'cantidad_default' => 'required|numeric|min:0.01',
            'observacion' => 'nullable|string|max:255',
        ]);

        // Verificar que no exista ya
        $existe = ServicioProducto::where('id_servicio', $idServicio)
            ->where('id_producto', $validated['id_producto'])
            ->exists();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'Este producto ya está en la receta del servicio',
            ], 422);
        }

        $item = ServicioProducto::create([
            'id_servicio' => $idServicio,
            'id_producto' => $validated['id_producto'],
            'cantidad_default' => $validated['cantidad_default'],
            'observacion' => $validated['observacion'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Producto agregado a la receta',
            'data' => $item,
        ], 201);
    }

    /**
     * Actualizar cantidad/observación de un producto en la receta
     */
    public function update(Request $request, $idServicio, $id): JsonResponse
    {
        $item = ServicioProducto::where('id_servicio', $idServicio)->find($id);
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $validated = $request->validate([
            'cantidad_default' => 'sometimes|numeric|min:0.01',
            'observacion' => 'nullable|string|max:255',
        ]);

        $item->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Receta actualizada',
            'data' => $item,
        ]);
    }

    /**
     * Eliminar producto de la receta
     */
    public function destroy($idServicio, $id): JsonResponse
    {
        $item = ServicioProducto::where('id_servicio', $idServicio)->find($id);
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado de la receta',
        ]);
    }

    /**
     * Guardar toda la receta de golpe (reemplaza la existente)
     */
    public function sync(Request $request, $idServicio): JsonResponse
    {
        $servicio = Servicio::find($idServicio);
        if (!$servicio) {
            return response()->json(['success' => false, 'message' => 'Servicio no encontrado'], 404);
        }

        $validated = $request->validate([
            'productos' => 'required|array',
            'productos.*.id_producto' => 'required|integer|exists:productos,id',
            'productos.*.cantidad_default' => 'required|numeric|min:0.01',
            'productos.*.observacion' => 'nullable|string|max:255',
        ]);

        // Eliminar receta anterior
        ServicioProducto::where('id_servicio', $idServicio)->delete();

        // Crear nueva
        $items = [];
        foreach ($validated['productos'] as $prod) {
            $items[] = ServicioProducto::create([
                'id_servicio' => $idServicio,
                'id_producto' => $prod['id_producto'],
                'cantidad_default' => $prod['cantidad_default'],
                'observacion' => $prod['observacion'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Receta actualizada completamente',
            'data' => $items,
        ]);
    }
}
