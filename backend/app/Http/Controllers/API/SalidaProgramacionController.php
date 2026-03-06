<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionServicio;
use App\Models\ProgramacionInsumo;
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
                $q->where('estado', 'Entregado');
            },
            'insumos.producto',
        ])
        ->whereHas('insumos', function ($q) {
            $q->where('estado', 'Entregado');
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
}
