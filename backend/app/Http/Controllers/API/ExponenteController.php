<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Exponente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExponenteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Exponente::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('especialidad', 'like', "%{$search}%")
                  ->orWhere('profesion', 'like', "%{$search}%")
                  ->orWhere('institucion', 'like', "%{$search}%");
            });
        }

        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }

        $exponentes = $query->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'data' => $exponentes,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'especialidad' => 'nullable|string|max:200',
            'profesion' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'institucion' => 'nullable|string|max:200',
            'notas' => 'nullable|string',
        ]);

        $exponente = Exponente::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Exponente registrado exitosamente',
            'data' => $exponente,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $exponente = Exponente::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $exponente,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $exponente = Exponente::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'apellidos' => 'sometimes|required|string|max:100',
            'especialidad' => 'nullable|string|max:200',
            'profesion' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'institucion' => 'nullable|string|max:200',
            'notas' => 'nullable|string',
            'estado' => 'sometimes|in:Activo,Inactivo',
        ]);

        $exponente->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Exponente actualizado exitosamente',
            'data' => $exponente,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $exponente = Exponente::findOrFail($id);

        // Verificar si tiene órdenes asociadas
        if ($exponente->ordenes()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: este exponente tiene órdenes de capacitación asociadas. Puede desactivarlo.',
            ], 422);
        }

        $exponente->delete();

        return response()->json([
            'success' => true,
            'message' => 'Exponente eliminado exitosamente',
        ]);
    }
}
