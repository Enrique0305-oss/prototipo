<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenServicio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrdenServicioController extends Controller
{
    /**
     * Listar todas las órdenes de servicio
     * GET /api/ordenes-servicio
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = OrdenServicio::with(['cliente', 'cotizacion', 'emisor', 'detalles']);

            // Filtros opcionales
            if ($request->has('id_cliente')) {
                $query->where('id_cliente', $request->id_cliente);
            }

            if ($request->has('numero_orden')) {
                $query->where('numero_orden', 'like', '%' . $request->numero_orden . '%');
            }

            // Nota: la tabla `orden_servicio` no tiene campo `estado`, por eso se omite el filtro

            // Paginación
            $perPage = $request->input('per_page', 15);
            $ordenes = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Órdenes de servicio obtenidas',
                'data' => $ordenes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al listar órdenes de servicio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una orden de servicio específica
     * GET /api/ordenes-servicio/{id}
     */
    public function show($id): JsonResponse
    {
        try {
            $orden = OrdenServicio::with(['cliente', 'cotizacion', 'emisor', 'detalles'])
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de servicio obtenida',
                'data' => $orden
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Orden de servicio no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva orden de servicio
     * POST /api/ordenes-servicio
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validar datos
            $validated = $request->validate([
                'numero_orden' => 'required|string|max:20|unique:orden_servicio',
                'codigo_doc' => 'nullable|string|max:20',
                'version' => 'nullable|string|max:10',
                'id_cotizacion' => 'nullable|integer|exists:cotizacion,id',
                'id_cliente' => 'required|integer|exists:cliente,id',
                'fecha_aceptacion' => 'nullable|date',
                'fecha_tentativa' => 'nullable|date',
                'total_costo' => 'nullable|numeric|min:0',
                'emitido_por' => 'nullable|integer|exists:personal,id'
            ]);

            $orden = OrdenServicio::create($validated);
            $orden->load(['cliente', 'cotizacion', 'emisor', 'detalles']);

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de servicio creada correctamente',
                'data' => $orden
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una orden de servicio
     * PUT /api/ordenes-servicio/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $orden = OrdenServicio::findOrFail($id);

            $validated = $request->validate([
                'numero_orden' => 'sometimes|string|max:20|unique:orden_servicio,numero_orden,' . $id,
                'codigo_doc' => 'nullable|string|max:20',
                'version' => 'nullable|string|max:10',
                'id_cotizacion' => 'nullable|integer|exists:cotizacion,id',
                'id_cliente' => 'sometimes|integer|exists:cliente,id',
                'fecha_aceptacion' => 'nullable|date',
                'fecha_tentativa' => 'nullable|date',
                'total_costo' => 'nullable|numeric|min:0',
                'emitido_por' => 'nullable|integer|exists:personal,id'
            ]);

            $orden->update($validated);
            $orden->load(['cliente', 'cotizacion', 'emisor', 'detalles']);

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de servicio actualizada correctamente',
                'data' => $orden
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Orden de servicio no encontrada'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una orden de servicio
     * DELETE /api/ordenes-servicio/{id}
     */
    public function destroy($id): JsonResponse
    {
        try {
            $orden = OrdenServicio::findOrFail($id);
            $orden->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de servicio eliminada correctamente'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Orden de servicio no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar la orden: ' . $e->getMessage()
            ], 500);
        }
    }
}