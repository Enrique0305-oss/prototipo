<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionServicio;
use App\Models\ProgramacionInsumo;
use App\Models\OrdenServicioProducto;
use App\Models\ServicioProducto;
use App\Models\Kardex;
use App\Models\Inventario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalidaProgramacionController extends Controller
{
    /**
     * Listar programaciones pendientes de entrega de materiales
     * Muestra programaciones con insumos en estado 'Asignado' (no entregados aún)
     */
    public function getPendientes(Request $request)
    {
        $this->asegurarInsumosAsignadosParaPendientes($request);

        $query = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'insumos.producto.inventario',
        ])
        ->whereHas('insumos', function ($q) {
            $q->where('estado', 'Asignado');
        })
        ->where('estado_ejecucion', '!=', 'Cancelado');

        // Filtro por rango de fechas
        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_programada', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_programada', '<=', $request->fecha_hasta);
        }

        // Sin filtro: mostrar desde hoy hacia adelante (todas las pendientes futuras)
        if (!$request->filled('fecha_desde') && !$request->filled('fecha_hasta')) {
            $query->whereDate('fecha_programada', '>=', now());
        }

        $programaciones = $query->orderBy('fecha_programada', 'asc')
                                ->orderBy('hora_inicio', 'asc')
                                ->get();

        return response()->json([
            'success' => true,
            'data' => $programaciones,
        ]);
    }

    /**
     * Para programaciones antiguas sin insumos, reconstruye insumos "Asignado"
     * desde orden_servicio_producto y, si no existe, desde servicio_producto.
     */
    private function asegurarInsumosAsignadosParaPendientes(Request $request): void
    {
        $base = ProgramacionServicio::query()
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->doesntHave('insumos');

        if ($request->filled('fecha_desde')) {
            $base->whereDate('fecha_programada', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $base->whereDate('fecha_programada', '<=', $request->fecha_hasta);
        }
        if (!$request->filled('fecha_desde') && !$request->filled('fecha_hasta')) {
            $base->whereDate('fecha_programada', '>=', now());
        }

        $programaciones = $base->get(['id', 'id_orden_servicio', 'id_servicio']);

        foreach ($programaciones as $prog) {
            $insumos = collect();

            if (!empty($prog->id_orden_servicio)) {
                $insumos = OrdenServicioProducto::query()
                    ->where('id_orden_servicio', $prog->id_orden_servicio)
                    ->where('id_servicio', $prog->id_servicio)
                    ->get()
                    ->groupBy('id_producto')
                    ->map(fn ($rows, $idProducto) => [
                        'id_producto' => (int) $idProducto,
                        'cantidad' => (int) round((float) $rows->sum('cantidad')),
                    ])
                    ->values()
                    ->filter(fn ($item) => $item['cantidad'] > 0)
                    ->values();
            }

            if ($insumos->isEmpty()) {
                $insumos = ServicioProducto::query()
                    ->where('id_servicio', $prog->id_servicio)
                    ->get()
                    ->map(fn ($item) => [
                        'id_producto' => (int) $item->id_producto,
                        'cantidad' => (int) round((float) $item->cantidad_default),
                    ])
                    ->filter(fn ($item) => $item['cantidad'] > 0)
                    ->values();
            }

            if ($insumos->isEmpty()) {
                continue;
            }

            foreach ($insumos as $item) {
                ProgramacionInsumo::create([
                    'id_programacion' => $prog->id,
                    'id_producto' => $item['id_producto'],
                    'cantidad_asignada' => $item['cantidad'],
                    'estado' => 'Asignado',
                ]);
            }
        }
    }

    /**
     * Ver detalle de una programación con sus insumos pendientes
     */
    public function getDetalle($id)
    {
        $prog = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'insumos' => function ($q) {
                $q->where('estado', 'Asignado');
            },
            'insumos.producto.inventario',
        ])->find($id);

        if (!$prog) {
            return response()->json([
                'success' => false,
                'message' => 'Programación no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $prog,
        ]);
    }

    /**
     * Confirmar salida de materiales
     * Registra en Kardex y descuenta del stock
     */
    public function confirmarSalida(Request $request)
    {
        $validated = $request->validate([
            'id_programacion' => 'required|integer|exists:programacion_servicio,id',
            'insumos' => 'required|array|min:1',
            'insumos.*.id_producto' => 'required|integer|exists:productos,id',
            'insumos.*.cantidad_entregada' => 'required|integer|min:1',
            'observacion' => 'nullable|string|max:500',
        ]);

        $idProgramacion = $validated['id_programacion'];
        $insumosEntregados = $validated['insumos'];
        $observacion = $validated['observacion'] ?? '';
        $idUsuario = $request->user()?->id;

        DB::beginTransaction();
        try {
            $prog = ProgramacionServicio::findOrFail($idProgramacion);

            // Validar que los insumos estén asignados y pendientes
            $insumosProg = ProgramacionInsumo::where('id_programacion', $idProgramacion)
                ->where('estado', 'Asignado')
                ->get()
                ->keyBy('id_producto');

            if ($insumosProg->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta programación no tiene insumos pendientes de entrega',
                ], 422);
            }

            // Procesar cada insumo
            foreach ($insumosEntregados as $item) {
                $idProducto = $item['id_producto'];
                $cantidadEntregada = $item['cantidad_entregada'];

                if ($cantidadEntregada <= 0) continue;

                $insumo = $insumosProg->get($idProducto);
                if (!$insumo) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} no está asignado a esta programación",
                    ], 422);
                }

                // Verificar stock disponible
                $inventario = Inventario::where('id_productos', $idProducto)->first();
                if (!$inventario || $inventario->cantidad_disponible < $cantidadEntregada) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente para producto #{$idProducto}",
                    ], 422);
                }

                // Registrar en Kardex (esto descuenta el stock automáticamente)
                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'tipo_movimiento' => 'Salida',
                    'cantidad' => $cantidadEntregada,
                    'motivo' => 'Salida Programación',
                    'referencia' => "PROG-{$idProgramacion}",
                    'id_referencia' => $idProgramacion,
                    'id_usuario' => $idUsuario,
                    'observacion' => "Salida confirmada por almacén. {$observacion}",
                ]);

                // Actualizar estado del insumo
                $insumo->update([
                    'estado' => 'Entregado',
                    'cantidad_utilizada' => $cantidadEntregada,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salida confirmada exitosamente. Materiales entregados y registrados en Kardex.',
                'data' => [
                    'id_programacion' => $idProgramacion,
                    'pdf_entrega_url' => url("/api/v1/almacen/salidas-programacion/{$idProgramacion}/pdf-entrega"),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al confirmar salida: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Historial de salidas confirmadas
     */
    public function getHistorial(Request $request)
    {
        $query = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'insumos' => function ($q) {
                $q->whereIn('estado', ['Entregado', 'Devuelto']);
            },
            'insumos.producto',
        ])
        ->whereHas('insumos', function ($q) {
            $q->whereIn('estado', ['Entregado', 'Devuelto']);
        });

        // Filtro por rango de fechas (opcional)
        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_programada', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_programada', '<=', $request->fecha_hasta);
        }

        $programaciones = $query->orderBy('fecha_programada', 'desc')
                                ->get();

        return response()->json([
            'success' => true,
            'data' => $programaciones,
        ]);
    }

    /**
     * Ver detalle de una programación para registrar devoluciones
     * Trae insumos entregados o parcialmente devueltos
     */
    public function getDetalleDevolucion($id)
    {
        $prog = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'insumos' => function ($q) {
                $q->whereIn('estado', ['Entregado', 'Devuelto']);
            },
            'insumos.producto',
        ])->find($id);

        if (!$prog) {
            return response()->json([
                'success' => false,
                'message' => 'Programación no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $prog,
        ]);
    }

    /**
     * Registrar devolución de materiales entregados
     * Registra entrada en Kardex y repone stock
     */
    public function registrarDevolucion(Request $request)
    {
        $validated = $request->validate([
            'id_programacion' => 'required|integer|exists:programacion_servicio,id',
            'insumos' => 'required|array|min:1',
            'insumos.*.id_producto' => 'required|integer|exists:productos,id',
            'insumos.*.cantidad_devuelta' => 'required|integer|min:0',
            'observacion' => 'nullable|string|max:500',
        ]);

        $idProgramacion = $validated['id_programacion'];
        $insumosDevueltos = $validated['insumos'];
        $observacion = $validated['observacion'] ?? '';
        $idUsuario = $request->user()?->id;

        if (collect($insumosDevueltos)->every(fn($i) => (int)($i['cantidad_devuelta'] ?? 0) === 0)) {
            return response()->json([
                'success' => false,
                'message' => 'Debe devolver al menos un producto',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $insumosProg = ProgramacionInsumo::where('id_programacion', $idProgramacion)
                ->whereIn('estado', ['Entregado', 'Devuelto'])
                ->get()
                ->keyBy('id_producto');

            if ($insumosProg->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta programación no tiene insumos entregados para devolver',
                ], 422);
            }

            foreach ($insumosDevueltos as $item) {
                $idProducto = $item['id_producto'];
                $cantidadDevuelta = (int) $item['cantidad_devuelta'];

                if ($cantidadDevuelta <= 0) {
                    continue;
                }

                $insumo = $insumosProg->get($idProducto);
                if (!$insumo) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} no está entregado en esta programación",
                    ], 422);
                }

                $cantidadPendienteDevolver = (int) ($insumo->cantidad_utilizada ?? 0);
                if ($cantidadPendienteDevolver <= 0) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} ya no tiene saldo para devolución",
                    ], 422);
                }

                if ($cantidadDevuelta > $cantidadPendienteDevolver) {
                    return response()->json([
                        'success' => false,
                        'message' => "La devolución del producto #{$idProducto} excede lo entregado",
                    ], 422);
                }

                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'tipo_movimiento' => 'Entrada',
                    'cantidad' => $cantidadDevuelta,
                    'motivo' => 'Devolución Programación',
                    'referencia' => "PROG-{$idProgramacion}",
                    'id_referencia' => $idProgramacion,
                    'id_usuario' => $idUsuario,
                    'observacion' => "Devolución registrada por almacén. {$observacion}",
                ]);

                $saldo = $cantidadPendienteDevolver - $cantidadDevuelta;
                $insumo->cantidad_utilizada = $saldo;
                $insumo->estado = $saldo === 0 ? 'Devuelto' : 'Entregado';
                $insumo->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Devolución registrada exitosamente. Stock actualizado en Kardex.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar devolución: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generar PDF de acta de entrega de materiales por programación
     */
    public function generarPdfEntrega($id)
    {
        $prog = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'planta',
            'area',
            'insumos' => function ($q) {
                $q->whereIn('estado', ['Entregado', 'Utilizado', 'Devuelto']);
            },
            'insumos.producto',
        ])->findOrFail($id);

        $insumos = $prog->insumos->filter(function ($ins) {
            return (int)($ins->cantidad_utilizada ?? 0) > 0 || in_array($ins->estado, ['Entregado', 'Utilizado']);
        })->values();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('SalidaProgramacionPDF', [
            'prog' => $prog,
            'insumos' => $insumos,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Acta_Entrega_Programacion_' . $prog->id . '.pdf');
    }
}
