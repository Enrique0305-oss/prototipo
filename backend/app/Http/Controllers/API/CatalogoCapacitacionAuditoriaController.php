<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CatalogoCapacitacionAuditoria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CatalogoCapacitacionAuditoriaController extends Controller
{
    /**
     * Listar catálogo de capacitaciones/auditorías
     */
    public function index(Request $request): JsonResponse
    {
        $query = CatalogoCapacitacionAuditoria::query();

        // Filtro por tipo (Capacitación / Asesoría / Auditoria)
        if ($request->has('tipo') && $request->tipo) {
            $query->where('tipo', $request->tipo);
        }

        // Filtro por búsqueda (nombre o descripcion)
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', '%' . $search . '%')
                  ->orWhere('descripcion', 'like', '%' . $search . '%');
            });
        }

        // Filtro por estado
        if ($request->has('estado')) {
            if ($request->estado === 'all') {
                // Mostrar todos
            } else {
                $query->where('estado', $request->estado);
            }
        } else {
            $query->where('estado', 'activo');
        }

        $query->orderBy('tipo', 'asc')->orderBy('nombre', 'asc');

        $items = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'pagination' => [
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage()
            ]
        ]);
    }

    /**
     * Obtener uno específico
     */
    public function show($id): JsonResponse
    {
        $item = CatalogoCapacitacionAuditoria::find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Registro no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * Crear nuevo registro
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'tipo' => 'required|in:Capacitación,Asesoría,Auditoria',
                'nombre' => 'required|string|max:200',
                'descripcion' => 'nullable|string',
                'precio_referencial' => 'nullable|numeric|min:0',
                'duracion_horas' => 'nullable|integer|min:1',
                'estado' => 'nullable|in:activo,inactivo',
            ]);

            $validated['estado'] = $validated['estado'] ?? 'activo';

            $item = CatalogoCapacitacionAuditoria::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Registro creado exitosamente',
                'data' => $item
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar registro
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $item = CatalogoCapacitacionAuditoria::find($id);

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registro no encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'tipo' => 'in:Capacitación,Asesoría,Auditoria',
                'nombre' => 'string|max:200',
                'descripcion' => 'nullable|string',
                'precio_referencial' => 'nullable|numeric|min:0',
                'duracion_horas' => 'nullable|integer|min:1',
                'estado' => 'in:activo,inactivo',
            ]);

            $item->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Registro actualizado exitosamente',
                'data' => $item
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desactivar (soft delete)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $item = CatalogoCapacitacionAuditoria::find($id);

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registro no encontrado'
                ], 404);
            }

            if ($item->estado === 'inactivo') {
                return response()->json([
                    'success' => false,
                    'message' => 'El registro ya está desactivado'
                ], 422);
            }

            $item->update(['estado' => 'inactivo']);

            return response()->json([
                'success' => true,
                'message' => 'Registro desactivado exitosamente',
                'data' => $item
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reactivar
     */
    public function reactivar($id): JsonResponse
    {
        try {
            $item = CatalogoCapacitacionAuditoria::find($id);

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registro no encontrado'
                ], 404);
            }

            if ($item->estado === 'activo') {
                return response()->json([
                    'success' => false,
                    'message' => 'El registro ya está activo'
                ], 422);
            }

            $item->update(['estado' => 'activo']);

            return response()->json([
                'success' => true,
                'message' => 'Registro reactivado exitosamente',
                'data' => $item
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al reactivar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas
     */
    public function estadisticas(): JsonResponse
    {
        try {
            $total = CatalogoCapacitacionAuditoria::count();
            $activos = CatalogoCapacitacionAuditoria::where('estado', 'activo')->count();
            $inactivos = CatalogoCapacitacionAuditoria::where('estado', 'inactivo')->count();
            $capacitaciones = CatalogoCapacitacionAuditoria::where('tipo', 'Capacitación')->where('estado', 'activo')->count();
            $asesorias = CatalogoCapacitacionAuditoria::where('tipo', 'Asesoría')->where('estado', 'activo')->count();
            $auditorias = CatalogoCapacitacionAuditoria::where('tipo', 'Auditoria')->where('estado', 'activo')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'activos' => $activos,
                    'inactivos' => $inactivos,
                    'capacitaciones' => $capacitaciones,
                    'asesorias' => $asesorias,
                    'auditorias' => $auditorias,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
}
