<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProveedorController extends Controller
{
    /**
     * Listar proveedores
     */
    public function index(Request $request): JsonResponse
    {
        $query = Proveedor::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('razon_social', 'like', "%{$s}%")
                  ->orWhere('nombre_comercial', 'like', "%{$s}%")
                  ->orWhere('ruc', 'like', "%{$s}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $proveedores = $query->orderBy('razon_social', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $proveedores,
        ]);
    }

    /**
     * Ver detalle de un proveedor
     */
    public function show($id): JsonResponse
    {
        $proveedor = Proveedor::with(['ordenesCompra' => function ($q) {
            $q->orderBy('fecha_compra', 'desc')->limit(10);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $proveedor,
        ]);
    }

    /**
     * Crear proveedor
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'razon_social'       => 'required|string|max:200',
            'ruc'                => 'nullable|string|max:20|unique:proveedores,ruc',
            'nombre_comercial'   => 'nullable|string|max:200',
            'contacto_nombre'    => 'nullable|string|max:150',
            'contacto_telefono'  => 'nullable|string|max:30',
            'contacto_email'     => 'nullable|email|max:150',
            'direccion'          => 'nullable|string|max:300',
            'banco'              => 'nullable|string|max:100',
            'numero_cuenta'      => 'nullable|string|max:50',
            'cci'                => 'nullable|string|max:50',
            'estado'             => 'in:Activo,Inactivo',
            'observaciones'      => 'nullable|string',
        ]);

        $proveedor = Proveedor::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Proveedor creado exitosamente',
            'data' => $proveedor,
        ], 201);
    }

    /**
     * Actualizar proveedor
     */
    public function update(Request $request, $id): JsonResponse
    {
        $proveedor = Proveedor::findOrFail($id);

        $validated = $request->validate([
            'razon_social'       => 'sometimes|required|string|max:200',
            'ruc'                => 'nullable|string|max:20|unique:proveedores,ruc,' . $id,
            'nombre_comercial'   => 'nullable|string|max:200',
            'contacto_nombre'    => 'nullable|string|max:150',
            'contacto_telefono'  => 'nullable|string|max:30',
            'contacto_email'     => 'nullable|email|max:150',
            'direccion'          => 'nullable|string|max:300',
            'banco'              => 'nullable|string|max:100',
            'numero_cuenta'      => 'nullable|string|max:50',
            'cci'                => 'nullable|string|max:50',
            'estado'             => 'in:Activo,Inactivo',
            'observaciones'      => 'nullable|string',
        ]);

        $proveedor->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Proveedor actualizado',
            'data' => $proveedor,
        ]);
    }

    /**
     * Eliminar proveedor (solo si no tiene órdenes)
     */
    public function destroy($id): JsonResponse
    {
        $proveedor = Proveedor::findOrFail($id);

        if ($proveedor->ordenesCompra()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: el proveedor tiene órdenes de compra registradas.',
            ], 422);
        }

        $proveedor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Proveedor eliminado',
        ]);
    }
}
