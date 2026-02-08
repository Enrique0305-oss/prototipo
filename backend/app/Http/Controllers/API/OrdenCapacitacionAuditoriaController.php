<?php 

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenCapacitacionAuditoria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrdenCapacitacionAuditoriaController extends Controller
{
    /**
     * Listar todas las órdenes de capacitación/auditoría
     * GET /api/ordenes-capacitacion-auditoria
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = OrdenCapacitacionAuditoria::with(['cliente', 'cotizacion', 'servicio', 'ponente']);

            // Filtros opcionales
            if ($request->has('id_cliente')) {
                $query->where('id_cliente', $request->id_cliente);
            }

            if ($request->has('numero_orden')) {
                $query->where('numero_orden', 'like', '%' . $request->numero_orden . '%');
            }

            // Paginación
            $perPage = $request->input('per_page', 15);
            $ordenes = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Órdenes de capacitación/auditoría obtenidas',
                'data' => $ordenes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al listar órdenes de capacitación/auditoría: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una orden de capacitación/auditoría específica
     * GET /api/ordenes-capacitacion-auditoria/{id}
     */
    public function show($id): JsonResponse
    {
        try {
            $orden = OrdenCapacitacionAuditoria::with(['cliente', 'cotizacion', 'servicio', 'ponente'])
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de capacitación/auditoría obtenida',
                'data' => $orden
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Orden de capacitación/auditoría no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva orden de capacitación/auditoría
     * POST /api/ordenes-capacitacion-auditoria
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validar datos
            $validated = $request->validate([
                'numero_orden' => 'required|string|max:20|unique:orden_capacitacion_auditoria',
                'id_cotizacion' => 'nullable|integer|exists:cotizacion,id',
                'id_cliente' => 'required|integer|exists:cliente,id',
                'id_servicio' => 'nullable|integer|exists:servicios,id',
                'fecha_capacitacion' => 'nullable|date',
                'fecha_limite' => 'nullable|date',
                'id_ponente' => 'nullable|integer|exists:personal,id',
                'observaciones' => 'nullable|string'
            ]);

            $orden = OrdenCapacitacionAuditoria::create($validated);
            $orden->load(['cliente', 'cotizacion', 'servicio', 'ponente']);

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de capacitación/auditoría creada correctamente',
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
     * Actualizar una orden de capacitación/auditoría
     * PUT /api/ordenes-capacitacion-auditoria/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $orden = OrdenCapacitacionAuditoria::findOrFail($id);

            $validated = $request->validate([
                'numero_orden' => 'sometimes|string|max:20|unique:orden_capacitacion_auditoria,numero_orden,' . $id,
                'id_cotizacion' => 'nullable|integer|exists:cotizacion,id',
                'id_cliente' => 'sometimes|integer|exists:cliente,id',
                'id_servicio' => 'nullable|integer|exists:servicios,id',
                'fecha_capacitacion' => 'nullable|date',
                'fecha_limite' => 'nullable|date',
                'id_ponente' => 'nullable|integer|exists:personal,id',
                'observaciones' => 'nullable|string'
            ]);

            $orden->update($validated);
            $orden->load(['cliente', 'cotizacion', 'servicio', 'ponente']);

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de capacitación/auditoría actualizada correctamente',
                'data' => $orden
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Orden de capacitación/auditoría no encontrada'
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
     * Eliminar una orden de capacitación/auditoría
     * DELETE /api/ordenes-capacitacion-auditoria/{id}
     */
    public function destroy($id): JsonResponse
    {
        try {
            $orden = OrdenCapacitacionAuditoria::findOrFail($id);
            $orden->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Orden de capacitación/auditoría eliminada correctamente'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Orden de capacitación/auditoría no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar la orden: ' . $e->getMessage()
            ], 500);
        }
    }
}