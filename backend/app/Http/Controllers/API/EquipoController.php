<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class EquipoController extends Controller
{
    /**
     * Listar todos los equipos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Equipo::query();

        // Filtro por búsqueda
        if ($request->has('search')) {
            $query->where('descripcion', 'like', '%' . $request->search . '%')
                  ->orWhere('marca', 'like', '%' . $request->search . '%')
                  ->orWhere('modelo', 'like', '%' . $request->search . '%')
                  ->orWhere('serie', 'like', '%' . $request->search . '%')
                  ->orWhere('encargado', 'like', '%' . $request->search . '%');
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
            $query->where('estado', 'Activo');
        }

        // Filtro por encargado
        if ($request->has('encargado')) {
            $query->where('encargado', 'like', '%' . $request->encargado . '%');
        }

        // Ordenar
        $query->orderBy('descripcion', 'asc');

        $equipos = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $equipos->items(),
            'pagination' => [
                'total' => $equipos->total(),
                'per_page' => $equipos->perPage(),
                'current_page' => $equipos->currentPage(),
                'last_page' => $equipos->lastPage()
            ]
        ]);
    }

    /**
     * Obtener un equipo específico
     */
    public function show($id): JsonResponse
    {
        $equipo = Equipo::find($id);

        if (!$equipo) {
            return response()->json([
                'success' => false,
                'message' => 'Equipo no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $equipo
        ]);
    }

    /**
     * Crear un nuevo equipo
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'descripcion' => 'required|string|max:100',
                'marca' => 'required|string|max:100',
                'modelo' => 'required|string|max:100',
                'serie' => 'required|integer|unique:equipo,serie',
                'encargado' => 'required|string|max:100',
                'responsable' => 'required|string|max:100',
                'contacto' => 'required|integer',
                'estado' => 'nullable|in:Activo,Inactivo'
            ]);

            // Asignar estado por defecto si no se envía
            $validated['estado'] = $validated['estado'] ?? 'Activo';

            $equipo = Equipo::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Equipo creado exitosamente',
                'data' => $equipo
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
                'message' => 'Error al crear el equipo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un equipo
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $equipo = Equipo::find($id);

            if (!$equipo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Equipo no encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'descripcion' => 'string|max:100',
                'marca' => 'string|max:100',
                'modelo' => 'string|max:100',
                'serie' => 'integer|unique:equipo,serie,' . $id,
                'encargado' => 'string|max:100',
                'responsable' => 'string|max:100',
                'contacto' => 'integer',
                'estado' => 'in:Activo,Inactivo'
            ]);

            $equipo->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Equipo actualizado exitosamente',
                'data' => $equipo
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
                'message' => 'Error al actualizar el equipo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desactivar un equipo (cambiar estado a Inactivo)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $equipo = Equipo::find($id);

            if (!$equipo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Equipo no encontrado'
                ], 404);
            }

            // Verificar si ya está inactivo
            if ($equipo->estado === 'Inactivo') {
                return response()->json([
                    'success' => false,
                    'message' => 'El equipo ya está desactivado'
                ], 422);
            }

            // Cambiar estado a Inactivo en lugar de eliminar
            $equipo->update(['estado' => 'Inactivo']);

            return response()->json([
                'success' => true,
                'message' => 'Equipo desactivado exitosamente',
                'data' => $equipo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar el equipo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subir o actualizar imagen de un equipo
     */
    public function subirImagen(Request $request, $id): JsonResponse
    {
        // 1. BUSCAR EQUIPO
        $equipo = Equipo::find($id);

        if (!$equipo) {
            return response()->json([
                'success' => false,
                'message' => 'Equipo no encontrado'
            ], 404);
        }

        // 2. VALIDAR IMAGEN
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

        // 3. ELIMINAR IMAGEN ANTERIOR SI EXISTE
        if ($equipo->imagen && Storage::disk('public')->exists($equipo->imagen)) {
            Storage::disk('public')->delete($equipo->imagen);
        }

        // 4. CREAR CARPETA DINÁMICAMENTE POR MARCA
        $tipoEquipo = Str::slug($equipo->marca, '-');
        $carpeta = "equipos/{$tipoEquipo}";

        // 5. GENERAR NOMBRE ÚNICO DEL ARCHIVO
        $extension = $request->file('imagen')->getClientOriginalExtension();
        $nombreArchivo = Str::slug($equipo->descripcion) . '-' . $equipo->id . '.' . $extension;

        // 6. GUARDAR EN STORAGE (public disk)
        $ruta = $request->file('imagen')->storeAs($carpeta, $nombreArchivo, 'public');

        // 7. GUARDAR RUTA EN BASE DE DATOS
        $equipo->update(['imagen' => $ruta]);

        // 8. RETORNAR RESPUESTA
        return response()->json([
            'success' => true,
            'message' => 'Imagen subida exitosamente',
            'data' => [
                'imagen' => $ruta,
                'imagen_url' => url('media/' . ltrim($ruta, '/')),
            ]
        ]);
    }

    /**
     * Eliminar imagen de un equipo
     */
    public function eliminarImagen($id): JsonResponse
    {
        $equipo = Equipo::find($id);

        if (!$equipo) {
            return response()->json([
                'success' => false,
                'message' => 'Equipo no encontrado'
            ], 404);
        }

        if ($equipo->imagen) {
            if (Storage::disk('public')->exists($equipo->imagen)) {
                Storage::disk('public')->delete($equipo->imagen);
            }
            $equipo->update(['imagen' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Imagen eliminada exitosamente'
        ]);
    }
}