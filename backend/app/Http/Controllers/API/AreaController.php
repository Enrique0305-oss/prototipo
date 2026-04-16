<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AreaController extends Controller
{
    private function puedeVerIt(?\App\Models\Personal $usuario): bool
    {
        if (!$usuario) {
            return false;
        }

        $usuario->loadMissing('area');
        $areaNombre = mb_strtolower(trim((string) ($usuario->area?->nombre ?? '')));

        return in_array($areaNombre, ['gerencia', 'it'], true);
    }

    /**
     * Listar todas las áreas
     */
    public function index(Request $request): JsonResponse
    {
        $query = Area::query();
        $puedeVerIt = $this->puedeVerIt($request->user());

        // Filtro por búsqueda
        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        // Filtro por estado
        if ($request->has('estado')) {
            if ($request->estado !== 'all') {
                $query->where('estado', $request->estado);
            }
        } else {
            // Por defecto solo activos
            $query->where('estado', 'Activo');
        }

        if (!$puedeVerIt) {
            $query->whereRaw('LOWER(nombre) <> ?', ['it']);
        }

        // Ordenar
        $query->orderBy('nombre', 'asc');

        $areas = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $areas->items(),
            'pagination' => [
                'total' => $areas->total(),
                'per_page' => $areas->perPage(),
                'current_page' => $areas->currentPage(),
                'last_page' => $areas->lastPage()
            ]
        ]);
    }

    /**
     * Obtener un área específica
     */
    public function show($id): JsonResponse
    {
        $area = Area::find($id);

        if (!$area) {
            return response()->json([
                'success' => false,
                'message' => 'Área no encontrada'
            ], 404);
        }

        if (mb_strtolower(trim((string) $area->nombre)) === 'it' && !$this->puedeVerIt(request()->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Área no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $area
        ]);
    }

    /**
     * Crear un área
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:100|unique:area,nombre',
                'estado' => 'required|in:Activo,Inactivo'
            ]);

            $area = Area::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Área creada exitosamente',
                'data' => $area
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
                'message' => 'Error al crear el área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un área
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $area = Area::find($id);

            if (!$area) {
                return response()->json([
                    'success' => false,
                    'message' => 'Área no encontrada'
                ], 404);
            }

            $validated = $request->validate([
                'nombre' => 'string|max:100|unique:area,nombre,' . $id,
                'estado' => 'in:Activo,Inactivo'
            ]);

            $area->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Área actualizada exitosamente',
                'data' => $area
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
                'message' => 'Error al actualizar el área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desactivar un área (estado Inactivo)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $area = Area::find($id);

            if (!$area) {
                return response()->json([
                    'success' => false,
                    'message' => 'Área no encontrada'
                ], 404);
            }

            if ($area->estado === 'Inactivo') {
                return response()->json([
                    'success' => false,
                    'message' => 'El área ya está inactiva'
                ], 422);
            }

            $area->update(['estado' => 'Inactivo']);

            return response()->json([
                'success' => true,
                'message' => 'Área desactivada exitosamente',
                'data' => $area
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar el área: ' . $e->getMessage()
            ], 500);
        }
    }
}
