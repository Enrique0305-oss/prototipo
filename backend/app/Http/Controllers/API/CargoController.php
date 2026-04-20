<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cargo;
use App\Models\Personal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CargoController extends Controller
{
    private function puedeVerIt(?Personal $usuario): bool
    {
        if (!$usuario) {
            return false;
        }

        $usuario->loadMissing('area');
        $areaNombre = mb_strtolower(trim((string) ($usuario->area?->nombre ?? '')));

        return $areaNombre === 'it';
    }

    private function esAreaIt(?int $idArea): bool
    {
        if (!$idArea) {
            return false;
        }

        return mb_strtolower(trim((string) optional(\App\Models\Area::find($idArea))->nombre)) === 'it';
    }

    /**
     * Listar todos los cargos con paginación
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cargo::query();
        $puedeVerIt = $this->puedeVerIt($request->user());

        // Filtro por área
        if ($request->has('id_area') && $request->id_area) {
            $query->where('id_area', $request->id_area);
        }

        if (!$puedeVerIt) {
            $query->where(function ($q) {
                $q->whereNull('id_area')
                  ->orWhereHas('area', function ($areaQuery) {
                      $areaQuery->whereRaw('LOWER(nombre) <> ?', ['it']);
                  });
            });
        }

        // Filtro por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Búsqueda
        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%')
                  ->orWhere('descripcion', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->get('per_page', 15);
        $cargos = $query->with('area')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $cargos->items(),
            'pagination' => [
                'total' => $cargos->total(),
                'per_page' => $cargos->perPage(),
                'current_page' => $cargos->currentPage(),
                'last_page' => $cargos->lastPage()
            ]
        ]);
    }

    /**
     * Obtener todos los cargos por área
     */
    public function porArea($idArea): JsonResponse
    {
        if ($this->esAreaIt((int) $idArea) && !$this->puedeVerIt(request()->user())) {
            return response()->json([
                'success' => false,
                'message' => 'No encontrado'
            ], 404);
        }

        $cargos = Cargo::where('id_area', $idArea)
            ->where('estado', 'activo')
            ->select('id', 'nombre', 'descripcion')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cargos
        ]);
    }

    /**
     * Obtener un cargo específico
     */
    public function show($id): JsonResponse
    {
        $cargo = Cargo::with('area')->find($id);

        if (!$cargo) {
            return response()->json([
                'success' => false,
                'message' => 'Cargo no encontrado'
            ], 404);
        }

        if ($this->esAreaIt($cargo->id_area) && !$this->puedeVerIt(request()->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Cargo no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cargo
        ]);
    }

    /**
     * Crear un nuevo cargo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_area' => 'nullable|exists:area,id',
            'nombre' => 'required|string|max:100|unique:cargo,nombre',
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        if (!empty($validated['id_area']) && $this->esAreaIt((int) $validated['id_area']) && !$this->puedeVerIt($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para asignar cargos al área IT'
            ], 403);
        }

        try {
            $cargo = Cargo::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cargo creado exitosamente',
                'data' => $cargo->load('area')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear cargo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un cargo
     */
    public function update(Request $request, $id): JsonResponse
    {
        $cargo = Cargo::find($id);

        if (!$cargo) {
            return response()->json([
                'success' => false,
                'message' => 'Cargo no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'id_area' => 'nullable|exists:area,id',
            'nombre' => 'sometimes|string|max:100|unique:cargo,nombre,' . $id,
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        if (isset($validated['id_area']) && $this->esAreaIt((int) $validated['id_area']) && !$this->puedeVerIt($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para asignar cargos al área IT'
            ], 403);
        }

        try {
            $cargo->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cargo actualizado exitosamente',
                'data' => $cargo->load('area')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar cargo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un cargo
     */
    public function destroy($id): JsonResponse
    {
        $cargo = Cargo::find($id);

        if (!$cargo) {
            return response()->json([
                'success' => false,
                'message' => 'Cargo no encontrado'
            ], 404);
        }

        try {
            $cargo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cargo eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar cargo: ' . $e->getMessage()
            ], 500);
        }
    }
}
