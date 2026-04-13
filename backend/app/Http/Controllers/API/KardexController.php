<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Kardex;
use App\Models\Inventario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KardexController extends Controller
{
    /**
     * Listar movimientos de kardex con filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = Kardex::with(['producto', 'usuario']);

        // Filtro por producto
        if ($request->has('id_producto') && $request->id_producto) {
            $query->where('id_producto', $request->id_producto);
        }

        // Filtro por tipo de movimiento
        if ($request->has('tipo_movimiento') && $request->tipo_movimiento) {
            $query->where('tipo_movimiento', $request->tipo_movimiento);
        }

        // Filtro por fecha desde
        if ($request->has('fecha_desde') && $request->fecha_desde) {
            $query->whereDate('fecha_movimiento', '>=', $request->fecha_desde);
        }

        // Filtro por fecha hasta
        if ($request->has('fecha_hasta') && $request->fecha_hasta) {
            $query->whereDate('fecha_movimiento', '<=', $request->fecha_hasta);
        }

        // Filtro por motivo
        if ($request->has('motivo') && $request->motivo) {
            $query->where('motivo', 'like', '%' . $request->motivo . '%');
        }

        $movimientos = $query->orderBy('fecha_movimiento', 'desc')
                             ->orderBy('id', 'desc')
                             ->get();

        $data = $movimientos->map(function ($mov) {
            return [
                'id' => $mov->id,
                'id_producto' => $mov->id_producto,
                'producto' => $mov->producto ? $mov->producto->descripcion : 'N/A',
                'tipo_movimiento' => $mov->tipo_movimiento,
                'cantidad' => $mov->cantidad,
                'stock_anterior' => $mov->stock_anterior,
                'stock_posterior' => $mov->stock_posterior,
                'motivo' => $mov->motivo,
                'referencia' => $mov->referencia,
                'id_referencia' => $mov->id_referencia,
                'usuario' => $mov->usuario ? ($mov->usuario->nombre . ' ' . $mov->usuario->apellidos) : 'Sistema',
                'observacion' => $mov->observacion,
                'fecha_movimiento' => $mov->fecha_movimiento?->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Movimientos de un producto específico
     */
    public function porProducto($idProducto): JsonResponse
    {
        $movimientos = Kardex::with(['usuario'])
            ->where('id_producto', $idProducto)
            ->orderBy('fecha_movimiento', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $data = $movimientos->map(function ($mov) {
            return [
                'id' => $mov->id,
                'tipo_movimiento' => $mov->tipo_movimiento,
                'cantidad' => $mov->cantidad,
                'stock_anterior' => $mov->stock_anterior,
                'stock_posterior' => $mov->stock_posterior,
                'motivo' => $mov->motivo,
                'referencia' => $mov->referencia,
                'usuario' => $mov->usuario ? ($mov->usuario->nombre . ' ' . $mov->usuario->apellidos) : 'Sistema',
                'observacion' => $mov->observacion,
                'fecha_movimiento' => $mov->fecha_movimiento?->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Registrar movimiento manual (entrada/salida directa)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_producto' => 'required|integer|exists:productos,id',
            'tipo_movimiento' => 'required|in:Entrada,Salida',
            'cantidad' => 'required|numeric|min:0.01',
            'motivo' => 'required|string|max:255',
            'observacion' => 'nullable|string',
        ]);

        // Para salidas, validar stock
        if ($validated['tipo_movimiento'] === 'Salida') {
            $inventario = Inventario::where('id_productos', $validated['id_producto'])->first();
            $disponible = $inventario ? $inventario->cantidad_disponible : 0;

            if ($disponible < $validated['cantidad']) {
                return response()->json([
                    'success' => false,
                    'message' => "Stock insuficiente. Disponible: {$disponible}",
                ], 422);
            }
        }

        $movimiento = Kardex::registrarMovimiento([
            'id_producto' => $validated['id_producto'],
            'tipo_movimiento' => $validated['tipo_movimiento'],
            'cantidad' => $validated['cantidad'],
            'motivo' => $validated['motivo'],
            'referencia' => 'Manual',
            'id_referencia' => null,
            'id_usuario' => $request->user()?->id,
            'observacion' => $validated['observacion'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Movimiento registrado exitosamente',
            'data' => $movimiento,
        ], 201);
    }

    /**
     * Resumen/estadísticas de kardex
     */
    public function estadisticas(): JsonResponse
    {
        $hoy = now()->toDateString();
        $inicioMes = now()->startOfMonth()->toDateString();

        $stats = [
            'total_movimientos' => Kardex::count(),
            'entradas_mes' => Kardex::where('tipo_movimiento', 'Entrada')
                ->whereDate('fecha_movimiento', '>=', $inicioMes)
                ->count(),
            'salidas_mes' => Kardex::where('tipo_movimiento', 'Salida')
                ->whereDate('fecha_movimiento', '>=', $inicioMes)
                ->count(),
            'movimientos_hoy' => Kardex::whereDate('fecha_movimiento', $hoy)->count(),
            'productos_con_movimiento_mes' => Kardex::whereDate('fecha_movimiento', '>=', $inicioMes)
                ->distinct('id_producto')
                ->count('id_producto'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
