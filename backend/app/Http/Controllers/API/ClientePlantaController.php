<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ClientePlanta;
use App\Models\ClientePlantaArea;
use Illuminate\Http\Request;

class ClientePlantaController extends Controller
{
    // ── PLANTAS ──────────────────────────────────

    public function index(Request $request, $idCliente)
    {
        $plantas = ClientePlanta::where('id_cliente', $idCliente)
            ->with('areasActivas')
            ->orderBy('nombre')
            ->get();

        return response()->json(['success' => true, 'data' => $plantas]);
    }

    public function store(Request $request, $idCliente)
    {
        $validated = $request->validate([
            'nombre'            => 'required|string|max:150',
            'direccion'         => 'nullable|string|max:255',
            'distrito'          => 'nullable|string|max:100',
            'provincia'         => 'nullable|string|max:100',
            'departamento'      => 'nullable|string|max:100',
            'referencia'        => 'nullable|string|max:255',
            'coordenadas'       => 'nullable|string|max:80',
            'contacto_nombre'   => 'nullable|string|max:100',
            'contacto_telefono' => 'nullable|string|max:20',
            'estado'            => 'nullable|in:Activo,Inactivo',
        ]);

        $validated['id_cliente'] = $idCliente;
        $planta = ClientePlanta::create($validated);
        $planta->load('areasActivas');

        return response()->json([
            'success' => true,
            'message' => 'Planta creada correctamente',
            'data'    => $planta,
        ], 201);
    }

    public function show($idCliente, $id)
    {
        $planta = ClientePlanta::where('id_cliente', $idCliente)
            ->with('areas')
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $planta]);
    }

    public function update(Request $request, $idCliente, $id)
    {
        $planta = ClientePlanta::where('id_cliente', $idCliente)->findOrFail($id);

        $validated = $request->validate([
            'nombre'            => 'sometimes|required|string|max:150',
            'direccion'         => 'nullable|string|max:255',
            'distrito'          => 'nullable|string|max:100',
            'provincia'         => 'nullable|string|max:100',
            'departamento'      => 'nullable|string|max:100',
            'referencia'        => 'nullable|string|max:255',
            'coordenadas'       => 'nullable|string|max:80',
            'contacto_nombre'   => 'nullable|string|max:100',
            'contacto_telefono' => 'nullable|string|max:20',
            'estado'            => 'nullable|in:Activo,Inactivo',
        ]);

        $planta->update($validated);
        $planta->load('areasActivas');

        return response()->json([
            'success' => true,
            'message' => 'Planta actualizada',
            'data'    => $planta,
        ]);
    }

    public function destroy($idCliente, $id)
    {
        $planta = ClientePlanta::where('id_cliente', $idCliente)->findOrFail($id);
        $planta->delete();

        return response()->json(['success' => true, 'message' => 'Planta eliminada']);
    }

    // ── ÁREAS ────────────────────────────────────

    public function indexAreas($idCliente, $idPlanta)
    {
        $areas = ClientePlantaArea::where('id_cliente_planta', $idPlanta)
            ->orderBy('nombre')
            ->get();

        return response()->json(['success' => true, 'data' => $areas]);
    }

    public function storeArea(Request $request, $idCliente, $idPlanta)
    {
        $validated = $request->validate([
            'nombre'      => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'estado'      => 'nullable|in:Activo,Inactivo',
        ]);

        $validated['id_cliente_planta'] = $idPlanta;
        $area = ClientePlantaArea::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Área creada correctamente',
            'data'    => $area,
        ], 201);
    }

    public function updateArea(Request $request, $idCliente, $idPlanta, $idArea)
    {
        $area = ClientePlantaArea::where('id_cliente_planta', $idPlanta)->findOrFail($idArea);

        $validated = $request->validate([
            'nombre'      => 'sometimes|required|string|max:150',
            'descripcion' => 'nullable|string',
            'estado'      => 'nullable|in:Activo,Inactivo',
        ]);

        $area->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Área actualizada',
            'data'    => $area,
        ]);
    }

    public function destroyArea($idCliente, $idPlanta, $idArea)
    {
        $area = ClientePlantaArea::where('id_cliente_planta', $idPlanta)->findOrFail($idArea);
        $area->delete();

        return response()->json(['success' => true, 'message' => 'Área eliminada']);
    }
}
