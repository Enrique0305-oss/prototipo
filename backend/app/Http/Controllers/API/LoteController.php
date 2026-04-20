<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Lote;
use App\Models\Producto;
use Illuminate\Http\Request;

class LoteController extends Controller
{
    // GET /productos/{id}/lotes
    public function index($idProducto)
    {
        try {
            $producto = Producto::findOrFail($idProducto);
            $lotes = $producto->lotes()->orderBy('fecha_vencimiento')->get();

            return response()->json([
                'success' => true,
                'data' => $lotes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // POST /productos/{id}/lotes
    public function store(Request $request, $idProducto)
    {
        try {
            $validated = $request->validate([
                'numero_lote' => 'required|string|max:50',
                'fecha_vencimiento' => 'required|date',
                'cantidad' => 'required|integer|min:1',
                'observacion' => 'nullable|string',
            ]);

            $producto = Producto::findOrFail($idProducto);

            $lote = Lote::create([
                'id_producto' => $idProducto,
                'numero_lote' => $validated['numero_lote'],
                'fecha_vencimiento' => $validated['fecha_vencimiento'],
                'cantidad' => $validated['cantidad'],
                'cantidad_disponible' => $validated['cantidad'],
                'estado' => 'Activo',
                'observacion' => $validated['observacion'] ?? null,
            ]);

            // Actualizar inventario total
            $this->actualizarInventarioProducto($idProducto);

            return response()->json([
                'success' => true,
                'message' => 'Lote creado exitosamente',
                'data' => $lote,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // GET /lotes/{id}
    public function show($id)
    {
        try {
            $lote = Lote::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $lote,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    // PUT /lotes/{id}
    public function update(Request $request, $id)
    {
        try {
            $lote = Lote::findOrFail($id);
            
            $validated = $request->validate([
                'numero_lote' => 'sometimes|string|max:50',
                'fecha_vencimiento' => 'sometimes|date',
                'cantidad' => 'sometimes|integer|min:1',
                'cantidad_disponible' => 'sometimes|integer|min:0',
                'estado' => 'sometimes|in:Activo,Vencido,Descartado',
                'observacion' => 'nullable|string',
            ]);

            $lote->update($validated);

            // Actualizar inventario
            $this->actualizarInventarioProducto($lote->id_producto);

            return response()->json([
                'success' => true,
                'message' => 'Lote actualizado exitosamente',
                'data' => $lote,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // DELETE /lotes/{id}
    public function destroy($id)
    {
        try {
            $lote = Lote::findOrFail($id);
            $idProducto = $lote->id_producto;
            
            $lote->delete();

            // Actualizar inventario
            $this->actualizarInventarioProducto($idProducto);

            return response()->json([
                'success' => true,
                'message' => 'Lote eliminado exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Método privado para actualizar inventario total
    private function actualizarInventarioProducto($idProducto)
    {
        $stockTotal = Lote::where('id_producto', $idProducto)
            ->where('estado', 'Activo')
            ->sum('cantidad_disponible');

        $inventario = \App\Models\Inventario::where('id_productos', $idProducto)->first();
        
        if ($inventario) {
            $inventario->cantidad_disponible = $stockTotal;
            $inventario->Cantidad_total = $stockTotal;
            $inventario->save();
        }
    }
}
