<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ActividadMantenimiento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActividadMantenimientoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActividadMantenimiento::query()->withCount('mantenimientos');

        // Filtro por estado
        $estado = $request->get('estado', 'Activo');
        if ($estado !== 'todos') {
            $query->where('estado', $estado);
        }

        // Filtro por categoría
        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }

        $actividades = $query->get();

        return response()->json([
            'success' => true,
            'data' => $actividades,
            'total' => $actividades->count()
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'categoria' => 'required|in:Programado,Entregado,Garantia',
            'estado' => 'nullable|in:Activo,Desactivo'
        ], [
            'categoria.required' => 'La categoría es obligatoria',
            'categoria.in' => 'La categoría debe ser: Programado, Entregado o Garantia'
        ]);

        $actividad = ActividadMantenimiento::create([
            'categoria' => $request->categoria,
            'estado' => $request->estado ?? 'Activo'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Actividad de mantenimiento creada exitosamente',
            'data' => $actividad
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $actividad = ActividadMantenimiento::withCount('mantenimientos')->find($id);

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'Actividad no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $actividad
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $actividad = ActividadMantenimiento::find($id);

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'Actividad no encontrada'
            ], 404);
        }

        $request->validate([
            'categoria' => 'sometimes|in:Programado,Entregado,Garantia',
            'estado' => 'sometimes|in:Activo,Desactivo'
        ]);

        if ($request->has('categoria')) {
            $actividad->categoria = $request->categoria;
        }
        if ($request->has('estado')) {
            $actividad->estado = $request->estado;
        }

        $actividad->save();

        return response()->json([
            'success' => true,
            'message' => 'Actividad actualizada exitosamente',
            'data' => $actividad
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $actividad = ActividadMantenimiento::find($id);

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'Actividad no encontrada'
            ], 404);
        }

        // Verificar si tiene mantenimientos asociados
        $mantenimientosCount = $actividad->mantenimientos()->count();
        
        if ($mantenimientosCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede desactivar porque tiene {$mantenimientosCount} mantenimiento(s) asociado(s)",
                'mantenimientos_count' => $mantenimientosCount
            ], 400);
        }

        $actividad->update(['estado' => 'Desactivo']);

        return response()->json([
            'success' => true,
            'message' => 'Actividad desactivada exitosamente',
            'data' => $actividad
        ]);
    }

    public function reactivar($id): JsonResponse
    {
        $actividad = ActividadMantenimiento::find($id);

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'Actividad no encontrada'
            ], 404);
        }

        if ($actividad->estado === 'Activo') {
            return response()->json([
                'success' => false,
                'message' => 'La actividad ya está activa'
            ], 400);
        }

        $actividad->update(['estado' => 'Activo']);

        return response()->json([
            'success' => true,
            'message' => 'Actividad reactivada exitosamente',
            'data' => $actividad
        ]);
    }
}
