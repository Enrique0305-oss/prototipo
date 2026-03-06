<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenCompra;
use App\Models\DetalleOrdenCompra;
use App\Models\Kardex;
use App\Models\Inventario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrdenCompraController extends Controller
{
    /**
     * Generar número de orden de compra: OC-2026-0001
     */
    private function generarNumero(): string
    {
        $year = now()->year;
        $last = OrdenCompra::whereYear('created_at', $year)->max('id') ?? 0;
        return 'OC-' . $year . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Listar órdenes de compra
     */
    public function index(Request $request): JsonResponse
    {
        $query = OrdenCompra::with(['proveedor', 'usuario'])
            ->withCount('detalles');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('id_proveedor')) {
            $query->where('id_proveedor', $request->id_proveedor);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_compra', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_compra', '<=', $request->fecha_hasta);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('numero_orden_compra', 'like', "%{$s}%")
                  ->orWhere('numero_factura', 'like', "%{$s}%")
                  ->orWhere('numero_cotizacion_proveedor', 'like', "%{$s}%")
                  ->orWhereHas('proveedor', fn($p) => $p->where('razon_social', 'like', "%{$s}%"));
            });
        }

        $ordenes = $query->orderBy('fecha_compra', 'desc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $ordenes,
        ]);
    }

    /**
     * Ver detalle de una orden de compra
     */
    public function show($id): JsonResponse
    {
        $orden = OrdenCompra::with([
            'proveedor',
            'detalles.producto.categoria',
            'usuario',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $orden,
        ]);
    }

    /**
     * Crear orden de compra (estado = Pendiente)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_proveedor'                 => 'required|integer|exists:proveedores,id',
            'fecha_compra'                 => 'required|date',
            'numero_cotizacion_proveedor'  => 'nullable|string|max:60',
            'numero_factura'               => 'nullable|string|max:60',
            'tipo_moneda'                  => 'required|in:PEN,USD',
            'tipo_cambio'                  => 'nullable|numeric|min:0',
            'tiene_igv'                    => 'boolean',
            'observaciones'                => 'nullable|string',
            'detalles'                     => 'required|array|min:1',
            'detalles.*.id_producto'       => 'required|integer|exists:productos,id',
            'detalles.*.cantidad'          => 'required|integer|min:1',
            'detalles.*.precio_unitario'   => 'required|numeric|min:0',
            'detalles.*.observacion'       => 'nullable|string|max:300',
        ]);

        DB::beginTransaction();
        try {
            $subtotal = 0;
            foreach ($validated['detalles'] as $det) {
                $subtotal += $det['cantidad'] * $det['precio_unitario'];
            }
            $tieneIgv = $validated['tiene_igv'] ?? true;
            $igv      = $tieneIgv ? round($subtotal * 0.18, 4) : 0;
            $total    = round($subtotal + $igv, 4);

            $orden = OrdenCompra::create([
                'numero_orden_compra'           => $this->generarNumero(),
                'id_proveedor'                  => $validated['id_proveedor'],
                'fecha_compra'                  => $validated['fecha_compra'],
                'numero_cotizacion_proveedor'   => $validated['numero_cotizacion_proveedor'] ?? null,
                'numero_factura'                => $validated['numero_factura'] ?? null,
                'tipo_moneda'                   => $validated['tipo_moneda'],
                'tipo_cambio'                   => $validated['tipo_cambio'] ?? null,
                'tiene_igv'                     => $tieneIgv,
                'subtotal'                      => round($subtotal, 4),
                'igv'                           => $igv,
                'total'                         => $total,
                'estado'                        => 'Pendiente',
                'id_usuario'                    => $request->user()?->id,
                'observaciones'                 => $validated['observaciones'] ?? null,
            ]);

            foreach ($validated['detalles'] as $det) {
                DetalleOrdenCompra::create([
                    'id_orden_compra'  => $orden->id,
                    'id_producto'      => $det['id_producto'],
                    'cantidad'         => $det['cantidad'],
                    'precio_unitario'  => $det['precio_unitario'],
                    'subtotal'         => round($det['cantidad'] * $det['precio_unitario'], 4),
                    'observacion'      => $det['observacion'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Orden de compra creada: ' . $orden->numero_orden_compra,
                'data' => $orden->load(['proveedor', 'detalles.producto']),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar orden (solo si está Pendiente)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $orden = OrdenCompra::findOrFail($id);

        if ($orden->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden editar órdenes en estado Pendiente.',
            ], 422);
        }

        $validated = $request->validate([
            'id_proveedor'                 => 'sometimes|required|integer|exists:proveedores,id',
            'fecha_compra'                 => 'sometimes|required|date',
            'numero_cotizacion_proveedor'  => 'nullable|string|max:60',
            'numero_factura'               => 'nullable|string|max:60',
            'tipo_moneda'                  => 'sometimes|required|in:PEN,USD',
            'tipo_cambio'                  => 'nullable|numeric|min:0',
            'tiene_igv'                    => 'boolean',
            'observaciones'                => 'nullable|string',
            'detalles'                     => 'sometimes|required|array|min:1',
            'detalles.*.id_producto'       => 'required|integer|exists:productos,id',
            'detalles.*.cantidad'          => 'required|integer|min:1',
            'detalles.*.precio_unitario'   => 'required|numeric|min:0',
            'detalles.*.observacion'       => 'nullable|string|max:300',
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['detalles'])) {
                $subtotal = 0;
                foreach ($validated['detalles'] as $det) {
                    $subtotal += $det['cantidad'] * $det['precio_unitario'];
                }
                $tieneIgv = $validated['tiene_igv'] ?? $orden->tiene_igv;
                $igv      = $tieneIgv ? round($subtotal * 0.18, 4) : 0;
                $total    = round($subtotal + $igv, 4);

                $validated['subtotal'] = round($subtotal, 4);
                $validated['igv']      = $igv;
                $validated['total']    = $total;

                // Reemplazar detalles
                $orden->detalles()->delete();
                foreach ($validated['detalles'] as $det) {
                    DetalleOrdenCompra::create([
                        'id_orden_compra'  => $orden->id,
                        'id_producto'      => $det['id_producto'],
                        'cantidad'         => $det['cantidad'],
                        'precio_unitario'  => $det['precio_unitario'],
                        'subtotal'         => round($det['cantidad'] * $det['precio_unitario'], 4),
                        'observacion'      => $det['observacion'] ?? null,
                    ]);
                }
            }

            $orden->update($validated);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Orden actualizada',
                'data'    => $orden->fresh(['proveedor', 'detalles.producto']),
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Recibir orden: cambia estado a Recibido y afecta Kardex + Inventario
     */
    public function recibir(Request $request, $id): JsonResponse
    {
        $orden = OrdenCompra::with('detalles.producto')->findOrFail($id);

        if ($orden->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se puede recibir una orden en estado Pendiente.',
            ], 422);
        }

        $request->validate([
            'fecha_recepcion' => 'nullable|date',
        ]);

        DB::beginTransaction();
        try {
            foreach ($orden->detalles as $det) {
                Kardex::registrarMovimiento([
                    'id_producto'    => $det->id_producto,
                    'tipo_movimiento'=> 'Entrada',
                    'cantidad'       => $det->cantidad,
                    'motivo'         => 'Orden de Compra',
                    'referencia'     => $orden->numero_orden_compra,
                    'id_referencia'  => $orden->id,
                    'id_usuario'     => $request->user()?->id,
                    'observacion'    => 'Recepción OC: ' . ($orden->numero_factura ?? $orden->numero_orden_compra),
                ]);
            }

            $orden->update([
                'estado'           => 'Recibido',
                'fecha_recepcion'  => $request->fecha_recepcion ?? now()->toDateString(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Orden recibida. Kardex e inventario actualizados.',
                'data'    => $orden->fresh(['proveedor', 'detalles.producto']),
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al recibir: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Anular orden (solo Pendiente)
     */
    public function anular($id): JsonResponse
    {
        $orden = OrdenCompra::findOrFail($id);

        if ($orden->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden anular órdenes Pendientes.',
            ], 422);
        }

        $orden->update(['estado' => 'Anulado']);

        return response()->json([
            'success' => true,
            'message' => 'Orden anulada',
        ]);
    }

    /**
     * Estadísticas de compras
     */
    public function estadisticas(): JsonResponse
    {
        $inicioMes = now()->startOfMonth()->toDateString();

        return response()->json([
            'success' => true,
            'data' => [
                'total'        => OrdenCompra::count(),
                'pendientes'   => OrdenCompra::where('estado', 'Pendiente')->count(),
                'recibidas'    => OrdenCompra::where('estado', 'Recibido')->count(),
                'anuladas'     => OrdenCompra::where('estado', 'Anulado')->count(),
                'total_mes'    => OrdenCompra::where('estado', 'Recibido')
                                    ->whereDate('fecha_recepcion', '>=', $inicioMes)
                                    ->sum('total'),
                'ordenes_mes'  => OrdenCompra::whereDate('fecha_compra', '>=', $inicioMes)->count(),
            ],
        ]);
    }
}
