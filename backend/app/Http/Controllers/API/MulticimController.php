<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Multicim;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class MulticimController extends Controller
{
    /**
     * Listar todas las empresas (Multicim)
     */
    public function index(): JsonResponse
    {
        $empresas = Multicim::all();
        return response()->json([
            'success' => true,
            'data' => $empresas
        ], 200);
    }

    /**
     * Registrar una nueva empresa emisora
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nombre_empresa' => 'required|string|max:100',
            'alias_empresa'  => 'required|string|max:100',
            'ruc'            => 'required|string|size:11|unique:multicim,ruc',
            'cuenta_bcp'     => 'required|string',
            'codigo_interbancario_bcp' => 'required|string',
            'banco_nacion'   => 'required|string',
            'codigo_interbancario_nacion' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $empresa = Multicim::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Empresa registrada correctamente',
            'data' => $empresa
        ], 201);
    }

    /**
     * Mostrar una empresa específica con sus proyecciones
     */
    public function show($id): JsonResponse
    {
        // Aquí usamos la relación que definimos en el modelo
        $empresa = Multicim::find($id);

        if (!$empresa) {
            return response()->json(['message' => 'Empresa no encontrada'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $empresa
        ], 200);
    }

    /**
     * Actualizar datos de la empresa
     */
    public function update(Request $request, $id): JsonResponse
    {
        $empresa = Multicim::find($id);

        if (!$empresa) {
            return response()->json(['message' => 'Empresa no encontrada'], 404);
        }

        $empresa->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Datos actualizados correctamente',
            'data' => $empresa
        ], 200);
    }

    /**
     * Eliminar una empresa (Solo si no tiene proyecciones amarradas)
     */
    public function destroy($id): JsonResponse
    {
        $empresa = Multicim::find($id);

        if (!$empresa) {
            return response()->json(['message' => 'Empresa no encontrada'], 404);
        }

        // Validación de seguridad por integridad referencial
        if ($empresa->proyecciones()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la empresa porque tiene proyecciones asociadas'
            ], 400);
        }

        $empresa->delete();

        return response()->json(['message' => 'Empresa eliminada'], 200);
    }
}