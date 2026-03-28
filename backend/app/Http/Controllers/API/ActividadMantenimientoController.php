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

        // Filtro por tipo de mantenimiento
        if ($request->has('tipo_mantenimiento')) {
            $query->where('tipo_mantenimiento', $request->tipo_mantenimiento);
        }

        // Filtro por tipo de equipo
        if ($request->has('tipo_equipo')) {
            $query->where(function ($q) use ($request) {
                $q->where('tipo_equipo', $request->tipo_equipo)
                    ->orWhere('tipo_equipo', 'GENERAL')
                    ->orWhereNull('tipo_equipo');
            });
        }

        // Compatibilidad hacia atras: filtro por categoria legacy
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
            'motivo' => 'required|string|max:255',
            'tipo_mantenimiento' => 'required|in:Preventivo,Correctivo',
            'tipo_equipo' => 'nullable|string|max:80',
            'frecuencia_sugerida' => 'nullable|string|max:40',
            'categoria' => 'nullable|in:Programado,Entregado,Garantia',
            'estado' => 'nullable|in:Activo,Desactivo'
        ], [
            'motivo.required' => 'El motivo es obligatorio',
            'tipo_mantenimiento.required' => 'El tipo de mantenimiento es obligatorio'
        ]);

        $actividad = ActividadMantenimiento::create([
            'categoria' => $request->categoria ?? 'Programado',
            'motivo' => $request->motivo,
            'tipo_mantenimiento' => $request->tipo_mantenimiento,
            'tipo_equipo' => $request->tipo_equipo,
            'frecuencia_sugerida' => $request->frecuencia_sugerida,
            'estado' => $request->estado ?? 'Activo'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Motivo de mantenimiento creado exitosamente',
            'data' => $actividad
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $actividad = ActividadMantenimiento::withCount('mantenimientos')->find($id);

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'Motivo no encontrado'
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
                'message' => 'Motivo no encontrado'
            ], 404);
        }

        $request->validate([
            'motivo' => 'sometimes|string|max:255',
            'tipo_mantenimiento' => 'sometimes|in:Preventivo,Correctivo',
            'tipo_equipo' => 'sometimes|nullable|string|max:80',
            'frecuencia_sugerida' => 'sometimes|nullable|string|max:40',
            'categoria' => 'sometimes|in:Programado,Entregado,Garantia',
            'estado' => 'sometimes|in:Activo,Desactivo'
        ]);

        if ($request->has('motivo')) {
            $actividad->motivo = $request->motivo;
        }
        if ($request->has('tipo_mantenimiento')) {
            $actividad->tipo_mantenimiento = $request->tipo_mantenimiento;
        }
        if ($request->has('tipo_equipo')) {
            $actividad->tipo_equipo = $request->tipo_equipo;
        }
        if ($request->has('frecuencia_sugerida')) {
            $actividad->frecuencia_sugerida = $request->frecuencia_sugerida;
        }
        if ($request->has('categoria')) {
            $actividad->categoria = $request->categoria;
        }
        if ($request->has('estado')) {
            $actividad->estado = $request->estado;
        }

        $actividad->save();

        return response()->json([
            'success' => true,
            'message' => 'Motivo actualizado exitosamente',
            'data' => $actividad
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $actividad = ActividadMantenimiento::find($id);

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'Motivo no encontrado'
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
                'message' => 'Motivo no encontrado'
            ], 404);
        }

        if ($actividad->estado === 'Activo') {
            return response()->json([
                'success' => false,
                'message' => 'El motivo ya está activo'
            ], 400);
        }

        $actividad->update(['estado' => 'Activo']);

        return response()->json([
            'success' => true,
            'message' => 'Motivo reactivado exitosamente',
            'data' => $actividad
        ]);
    }
}
