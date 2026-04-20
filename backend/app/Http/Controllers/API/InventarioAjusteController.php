<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Inventario;
use App\Models\InventarioAjuste;
use App\Models\Kardex;
use App\Models\Lote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventarioAjusteController extends Controller
{
    /**
     * Listar historial de ajustes de inventario
     */
    public function index(Request $request): JsonResponse
    {
        $query = InventarioAjuste::with(['producto', 'lote', 'usuario'])
            ->orderBy('fecha_ajuste', 'desc')
            ->orderBy('id', 'desc');

        if ($request->has('id_producto') && $request->id_producto) {
            $query->where('id_producto', (int) $request->id_producto);
        }

        if ($request->has('id_usuario') && $request->id_usuario) {
            $query->where('id_usuario', (int) $request->id_usuario);
        }

        if ($request->has('fecha_desde') && $request->fecha_desde) {
            $query->whereDate('fecha_ajuste', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta') && $request->fecha_hasta) {
            $query->whereDate('fecha_ajuste', '<=', $request->fecha_hasta);
        }

        if ($request->has('search') && $request->search) {
            $search = trim((string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('motivo', 'like', "%{$search}%")
                    ->orWhere('observacion', 'like', "%{$search}%")
                    ->orWhereHas('producto', function ($p) use ($search) {
                        $p->where('descripcion', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        $ajustes = $query->get();

        $data = $ajustes->map(function (InventarioAjuste $ajuste) {
            $nombreUsuario = $ajuste->usuario
                ? trim(($ajuste->usuario->nombre ?? '') . ' ' . ($ajuste->usuario->apellidos ?? ''))
                : 'Sistema';

            return [
                'id' => $ajuste->id,
                'id_producto' => $ajuste->id_producto,
                'producto' => $ajuste->producto ? $ajuste->producto->descripcion : 'N/A',
                'id_lote' => $ajuste->id_lote,
                'numero_lote' => $ajuste->lote?->numero_lote,
                'tipo_ajuste' => $ajuste->tipo_ajuste,
                'stock_anterior' => $ajuste->stock_anterior,
                'stock_nuevo' => $ajuste->stock_nuevo,
                'diferencia' => $ajuste->diferencia,
                'motivo' => $ajuste->motivo,
                'referencia' => 'Ajuste de Inventario',
                'id_kardex' => $ajuste->id_kardex,
                'usuario' => $nombreUsuario !== '' ? $nombreUsuario : 'Sistema',
                'observacion' => $ajuste->observacion,
                'fecha_ajuste' => $ajuste->fecha_ajuste,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Ajustar stock actual y registrar trazabilidad
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_producto' => 'required|integer|exists:productos,id',
            'id_lote' => 'required|integer|exists:lotes,id',
            'stock_nuevo' => 'required|integer|min:0',
            'motivo' => 'required|string|max:120',
            'observacion' => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()?->id;

        try {
            $resultado = DB::transaction(function () use ($validated, $userId) {
            $lote = Lote::where('id', $validated['id_lote'])
                ->where('id_producto', $validated['id_producto'])
                ->lockForUpdate()
                ->first();

            if (!$lote) {
                throw new \InvalidArgumentException('El lote seleccionado no pertenece al producto indicado.');
            }

            $inventario = Inventario::where('id_productos', $validated['id_producto'])
                ->lockForUpdate()
                ->first();

            if (!$inventario) {
                $inventario = Inventario::create([
                    'id_productos' => $validated['id_producto'],
                    'cantidad_disponible' => 0,
                    'stock_seguridad' => 0,
                    'Tipo' => 'Entrada',
                    'Cantidad_total' => 0,
                ]);
            }

            $stockAnterior = (int) $lote->cantidad_disponible;
            $stockNuevo = (int) $validated['stock_nuevo'];
            $diferencia = $stockNuevo - $stockAnterior;

            if ($diferencia === 0) {
                throw new \InvalidArgumentException('No hay cambios en el stock para registrar un ajuste.');
            }

            $tipoAjuste = $diferencia > 0 ? 'Entrada' : 'Salida';
            $cantidadMovimiento = abs($diferencia);

            // Actualizar stock del lote seleccionado.
            $lote->cantidad_disponible = $stockNuevo;
            $lote->cantidad = max(0, (int) $lote->cantidad + $diferencia);
            $lote->save();

            // Recalcular stock total del inventario por suma de lotes activos.
            $stockTotalProducto = Lote::where('id_producto', $validated['id_producto'])
                ->where('estado', 'Activo')
                ->sum('cantidad_disponible');

            $inventario->cantidad_disponible = (int) $stockTotalProducto;
            $inventario->Cantidad_total = (int) $stockTotalProducto;
            $inventario->save();

            // Registrar en kardex como movimiento de ajuste
            $kardex = Kardex::create([
                'id_producto' => $validated['id_producto'],
                'id_lote' => $validated['id_lote'],
                'tipo_movimiento' => $tipoAjuste,
                'cantidad' => $cantidadMovimiento,
                'stock_anterior' => $stockAnterior,
                'stock_posterior' => $stockNuevo,
                'motivo' => $validated['motivo'],
                'referencia' => 'Ajuste de Inventario',
                'id_referencia' => null,
                'id_usuario' => $userId,
                'observacion' => $validated['observacion'] ?? null,
            ]);

            // Registro detallado de auditoría de ajuste
            $ajuste = InventarioAjuste::create([
                'id_producto' => $validated['id_producto'],
                'id_lote' => $validated['id_lote'],
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
                'diferencia' => $diferencia,
                'tipo_ajuste' => $tipoAjuste,
                'motivo' => $validated['motivo'],
                'observacion' => $validated['observacion'] ?? null,
                'id_usuario' => $userId,
                'id_kardex' => $kardex->id,
            ]);

            $ajuste->load(['producto', 'lote', 'usuario']);

                return [$ajuste, $kardex];
            });
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        /** @var \App\Models\InventarioAjuste $ajuste */
        $ajuste = $resultado[0];
        /** @var \App\Models\Kardex $kardex */
        $kardex = $resultado[1];

        return response()->json([
            'success' => true,
            'message' => 'Ajuste de inventario registrado exitosamente',
            'data' => [
                'id' => $ajuste->id,
                'id_producto' => $ajuste->id_producto,
                'producto' => $ajuste->producto ? $ajuste->producto->descripcion : 'N/A',
                'id_lote' => $ajuste->id_lote,
                'numero_lote' => $ajuste->lote?->numero_lote,
                'tipo_ajuste' => $ajuste->tipo_ajuste,
                'stock_anterior' => $ajuste->stock_anterior,
                'stock_nuevo' => $ajuste->stock_nuevo,
                'diferencia' => $ajuste->diferencia,
                'motivo' => $ajuste->motivo,
                'referencia' => 'Ajuste de Inventario',
                'id_kardex' => $kardex->id,
                'usuario' => $ajuste->usuario
                    ? trim(($ajuste->usuario->nombre ?? '') . ' ' . ($ajuste->usuario->apellidos ?? ''))
                    : 'Sistema',
                'observacion' => $ajuste->observacion,
                'fecha_ajuste' => $ajuste->fecha_ajuste,
            ],
        ], 201);
    }
}
