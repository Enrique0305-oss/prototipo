<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServicioController extends Controller
{
    /**
     * Listar todos los servicios
     */
    public function index(Request $request): JsonResponse
    {
        $query = Servicio::query();

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
                // Mostrar todos sin filtro
            } else {
                $query->where('estado', $request->estado);
            }
        } else {
            // Por defecto, mostrar solo activos
            $query->where('estado', 'activo');
        }

        // Filtro por requiere_movilidad
        if ($request->has('requiere_movilidad')) {
            $query->where('requiere_movilidad', $request->requiere_movilidad);
        }

        // Filtro por requiere_certificado
        if ($request->has('requiere_certificado')) {
            $query->where('requiere_certificado', $request->requiere_certificado);
        }

        // Ordenar
        $query->orderBy('nombre', 'asc');

        $servicios = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $servicios->items(),
            'pagination' => [
                'total' => $servicios->total(),
                'per_page' => $servicios->perPage(),
                'current_page' => $servicios->currentPage(),
                'last_page' => $servicios->lastPage()
            ]
        ]);
    }

    /**
     * Obtener un servicio específico
     */
    public function show($id): JsonResponse
    {
        $servicio = Servicio::find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $servicio
        ]);
    }

    /**
     * Crear un nuevo servicio
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:100',
                'descripcion' => 'required|string|max:100',
                'estado' => 'nullable|in:activo,inactivo',
                'duracion_estimada' => 'nullable|integer|min:1',
                'requiere_movilidad' => 'nullable|boolean',
                'requiere_certificado' => 'nullable|boolean',
                'plantilla_certificado' => 'nullable|string|max:255',
            ]);

            $validated['estado'] = $validated['estado'] ?? 'activo';
            $validated['duracion_estimada'] = $validated['duracion_estimada'] ?? 60;
            $validated['requiere_movilidad'] = $validated['requiere_movilidad'] ?? false;
            $validated['requiere_certificado'] = $validated['requiere_certificado'] ?? false;

            $servicio = Servicio::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Servicio creado exitosamente',
                'data' => $servicio
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
                'message' => 'Error al crear el servicio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un servicio
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $servicio = Servicio::find($id);

            if (!$servicio) {
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio no encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'nombre' => 'string|max:100',
                'descripcion' => 'string|max:100',
                'estado' => 'in:activo,inactivo',
                'duracion_estimada' => 'integer|min:1',
                'requiere_movilidad' => 'boolean',
                'requiere_certificado' => 'boolean',
                'plantilla_certificado' => 'nullable|string|max:255',
            ]);

            $servicio->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Servicio actualizado exitosamente',
                'data' => $servicio
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
                'message' => 'Error al actualizar el servicio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desactivar un servicio (soft delete → estado = 'inactivo')
     */
    public function destroy($id): JsonResponse
    {
        try {
            $servicio = Servicio::find($id);

            if (!$servicio) {
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio no encontrado'
                ], 404);
            }

            if ($servicio->estado === 'inactivo') {
                return response()->json([
                    'success' => false,
                    'message' => 'El servicio ya está desactivado'
                ], 422);
            }

            $servicio->update(['estado' => 'inactivo']);

            return response()->json([
                'success' => true,
                'message' => 'Servicio desactivado exitosamente',
                'data' => $servicio
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar el servicio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reactivar un servicio (estado = 'activo')
     */
    public function reactivar($id): JsonResponse
    {
        try {
            $servicio = Servicio::find($id);

            if (!$servicio) {
                return response()->json([
                    'success' => false,
                    'message' => 'Servicio no encontrado'
                ], 404);
            }

            if ($servicio->estado === 'activo') {
                return response()->json([
                    'success' => false,
                    'message' => 'El servicio ya está activo'
                ], 422);
            }

            $servicio->update(['estado' => 'activo']);

            return response()->json([
                'success' => true,
                'message' => 'Servicio reactivado exitosamente',
                'data' => $servicio
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al reactivar el servicio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas de servicios
     */
    public function estadisticas(): JsonResponse
    {
        try {
            $total = Servicio::count();
            $activos = Servicio::where('estado', 'activo')->count();
            $inactivos = Servicio::where('estado', 'inactivo')->count();
            $con_movilidad = Servicio::where('requiere_movilidad', true)->where('estado', 'activo')->count();
            $con_certificado = Servicio::where('requiere_certificado', true)->where('estado', 'activo')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'activos' => $activos,
                    'inactivos' => $inactivos,
                    'con_movilidad' => $con_movilidad,
                    'con_certificado' => $con_certificado,
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
