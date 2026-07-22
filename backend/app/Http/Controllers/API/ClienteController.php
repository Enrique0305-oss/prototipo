<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClienteController extends Controller
{
    /**
     * Listar todos los clientes
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cliente::query();

        // Filtro por búsqueda
        if ($request->has('search')) {
            $query->buscar($request->search);
        }

        // Filtro por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Ordenar
        $query->orderBy('nombre_empresa', 'asc');

        $clientes = $query->get();

        return response()->json([
            'success' => true,
            'data' => $clientes
        ]);
    }

    /**
     * Obtener un cliente específico
     */
    public function show($id): JsonResponse
    {
        $cliente = Cliente::with(['cotizaciones', 'ordenesServicio'])
                         ->find($id);

        if (!$cliente) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cliente
        ]);
    }

    /**
     * Crear un nuevo cliente
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre_empresa' => 'required|string|max:100',
            'ruc' => 'required|string|size:11|unique:cliente,ruc',
            'rubro' => 'required|string|max:150',
            'direccion' => 'nullable|string|max:255',
            'persona_contacto' => 'nullable|string|max:100',
            'telefono_contacto' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:100',
            'origen' => 'nullable|string|in:Referido,Web,Llamada,Visita,Redes sociales,Otro',
            'fecha_registro' => 'nullable|date',
            'estado' => 'nullable|in:Acepta,No acepta,Contactado'
        ]);

        $cliente = Cliente::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cliente creado exitosamente',
            'data' => $cliente
        ], 201);
    }

    /**
     * Actualizar un cliente
     */
    public function update(Request $request, $id): JsonResponse
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre_empresa' => 'sometimes|string|max:100',
            'ruc' => 'sometimes|string|size:11|unique:cliente,ruc,' . $id,
            'rubro' => 'sometimes|string|max:150',
            'direccion' => 'nullable|string|max:255',
            'persona_contacto' => 'nullable|string|max:100',
            'telefono_contacto' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:100',
            'origen' => 'nullable|string|in:Referido,Web,Llamada,Visita,Redes sociales,Otro',
            'fecha_registro' => 'nullable|date',
            'estado' => 'sometimes|in:Acepta,No acepta,Contactado'
        ]);

        $cliente->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cliente actualizado exitosamente',
            'data' => $cliente
        ]);
    }

    /**
     * Eliminar un cliente
     */
    public function destroy($id): JsonResponse
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        // Verificar si tiene cotizaciones u órdenes
        if ($cliente->cotizaciones()->count() > 0 || $cliente->ordenesServicio()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el cliente porque tiene cotizaciones u órdenes asociadas'
            ], 400);
        }

        $cliente->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cliente eliminado exitosamente'
        ]);
    }

    /**
     * Obtener estadísticas de clientes
     */
    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total' => Cliente::count(),
            'activos' => Cliente::where('estado', 'Acepta')->count(),
            'contactados' => Cliente::where('estado', 'Contactado')->count(),
            'rechazados' => Cliente::where('estado', 'No acepta')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
