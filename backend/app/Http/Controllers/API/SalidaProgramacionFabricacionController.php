<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Inventario;
use App\Models\Kardex;
use App\Models\Lote;
use App\Models\Producto;
use App\Models\EntradaDevolucionFabricacion;
use App\Models\ProgramacionFabricacion;
use App\Models\SalidaProgramacionFabricacionDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalidaProgramacionFabricacionController extends Controller
{
    public function getPendientes(Request $request)
    {
        $query = ProgramacionFabricacion::with(['tecnico', 'ordenFabricacion.detalles.producto'])
            ->where('estado_ejecucion', '!=', 'Cancelado');

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_programada', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_programada', '<=', $request->fecha_hasta);
        }

        if (!$request->filled('fecha_desde') && !$request->filled('fecha_hasta')) {
            $query->whereDate('fecha_programada', '>=', now()->subDays(30));
        }

        $programaciones = $query->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        $data = $programaciones->map(function (ProgramacionFabricacion $programacion) {
            $referencia = $this->buildReferencia($programacion->id);
            $salidaKardex = Kardex::query()
                ->where('referencia', $referencia)
                ->where('tipo_movimiento', 'Salida')
                ->orderByDesc('fecha_movimiento')
                ->first();

            return [
                'id' => $programacion->id,
                'id_orden_fabricacion' => $programacion->id_orden_fabricacion,
                'codigo_orden' => $programacion->ordenFabricacion?->codigo,
                'motivo_orden' => $programacion->ordenFabricacion?->motivo,
                'fecha_programada' => $programacion->fecha_programada,
                'hora_inicio' => $programacion->hora_inicio,
                'hora_fin' => $programacion->hora_fin,
                'estado_ejecucion' => $programacion->estado_ejecucion,
                'tecnico' => $programacion->tecnico ? [
                    'id' => $programacion->tecnico->id,
                    'nombre' => $programacion->tecnico->nombre,
                    'apellido' => $programacion->tecnico->apellido,
                ] : null,
                'insumos' => $this->buildInsumosConStock($programacion),
                'salida_confirmada' => (bool) $salidaKardex,
                'fecha_salida' => $salidaKardex?->fecha_movimiento,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function getByOrdenFabricacion(int $idOrden)
    {
        $programaciones = ProgramacionFabricacion::with(['tecnico', 'ordenFabricacion.detalles.producto'])
            ->where('id_orden_fabricacion', $idOrden)
            ->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        $data = $programaciones->map(function (ProgramacionFabricacion $programacion) {
            $referencia = $this->buildReferencia($programacion->id);
            $salidaKardex = Kardex::query()
                ->where('referencia', $referencia)
                ->where('tipo_movimiento', 'Salida')
                ->orderByDesc('fecha_movimiento')
                ->first();

            return [
                'id' => $programacion->id,
                'fecha_programada' => $programacion->fecha_programada,
                'hora_inicio' => $programacion->hora_inicio,
                'hora_fin' => $programacion->hora_fin,
                'estado_ejecucion' => $programacion->estado_ejecucion,
                'tecnico' => $programacion->tecnico ? [
                    'id' => $programacion->tecnico->id,
                    'nombre' => $programacion->tecnico->nombre,
                    'apellido' => $programacion->tecnico->apellido,
                ] : null,
                'insumos' => $this->buildInsumosConStock($programacion),
                'salida_confirmada' => (bool) $salidaKardex,
                'fecha_salida' => $salidaKardex?->fecha_movimiento,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function confirmarSalida(Request $request)
    {
        $validated = $request->validate([
            'id_programacion' => 'required|integer|exists:programacion_fabricacion,id',
            'insumos' => 'required|array|min:1',
            'insumos.*.id_producto' => 'required|integer|exists:productos,id',
            'insumos.*.id_lote' => 'required|integer|exists:lotes,id',
            'insumos.*.cantidad_entregada' => 'required|integer|min:1',
            'observacion' => 'nullable|string|max:500',
        ]);

        $programacion = ProgramacionFabricacion::findOrFail((int) $validated['id_programacion']);
        $referencia = $this->buildReferencia((int) $programacion->id);

        $yaConfirmada = Kardex::query()
            ->where('referencia', $referencia)
            ->where('tipo_movimiento', 'Salida')
            ->exists();

        if ($yaConfirmada) {
            return response()->json([
                'success' => false,
                'message' => 'La salida para esta programación ya fue confirmada.',
            ], 422);
        }

        if ($programacion->estado_ejecucion === 'Cancelado') {
            return response()->json([
                'success' => false,
                'message' => 'No se puede confirmar salida para una programación cancelada.',
            ], 422);
        }

        $insumosDisponibles = collect($this->buildInsumosConStock($programacion))->keyBy('id_producto');
        if ($insumosDisponibles->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'La programación no tiene insumos requeridos para salida.',
            ], 422);
        }

        $insumosSalida = collect($validated['insumos'])->map(function (array $item) {
            return [
                'id_producto' => (int) $item['id_producto'],
                'id_lote' => (int) $item['id_lote'],
                'cantidad_entregada' => (int) $item['cantidad_entregada'],
            ];
        });

        if ($insumosSalida->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Debe proporcionar al menos un insumo con lote seleccionado.',
            ], 422);
        }

        $idUsuario = $request->user()?->id;
        $observacion = trim((string) ($validated['observacion'] ?? ''));

        DB::beginTransaction();
        try {
            foreach ($insumosSalida as $insumo) {
                $idProducto = (int) $insumo['id_producto'];
                $idLote = (int) $insumo['id_lote'];
                $cantidadEntregada = (int) $insumo['cantidad_entregada'];

                if ($cantidadEntregada <= 0) continue;

                $insumoBase = $insumosDisponibles->get($idProducto);
                if (!$insumoBase) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} no pertenece a los insumos requeridos de la programación.",
                    ], 422);
                }

                $lote = Lote::where('id', $idLote)
                    ->where('id_producto', $idProducto)
                    ->lockForUpdate()
                    ->first();

                if (!$lote) {
                    return response()->json([
                        'success' => false,
                        'message' => "El lote seleccionado no es válido para el producto #{$idProducto}",
                    ], 422);
                }

                if ((int) $lote->cantidad_disponible < (int) $cantidadEntregada) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente en lote {$lote->numero_lote} para producto #{$idProducto}",
                    ], 422);
                }

                $inventario = Inventario::query()->where('id_productos', $idProducto)->first();
                $stock = (int) ($inventario?->cantidad_disponible ?? 0);
                if ($stock < $cantidadEntregada) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente para {$insumoBase['descripcion']}.",
                    ], 422);
                }

                // Descontar del lote seleccionado
                $lote->cantidad_disponible = max(0, (int) $lote->cantidad_disponible - (int) $cantidadEntregada);
                $lote->cantidad = max(0, (int) $lote->cantidad - (int) $cantidadEntregada);
                $lote->save();

                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'id_lote' => $idLote,
                    'tipo_movimiento' => 'Salida',
                    'cantidad' => $cantidadEntregada,
                    'motivo' => 'Salida Programación Fabricación',
                    'referencia' => $referencia,
                    'id_referencia' => $programacion->id,
                    'id_usuario' => $idUsuario,
                    'observacion' => $observacion !== ''
                        ? "Salida confirmada por almacén. {$observacion}"
                        : 'Salida confirmada por almacén.',
                ]);

                // Guardar en tabla de detalles
                SalidaProgramacionFabricacionDetalle::create([
                    'id_programacion_fabricacion' => $programacion->id,
                    'id_producto' => $idProducto,
                    'cantidad_entregada' => $cantidadEntregada,
                    'id_lote' => $idLote,
                ]);
            }

            EntradaDevolucionFabricacion::firstOrCreate(
                ['id_programacion_fabricacion' => $programacion->id],
                [
                    'id_orden_fabricacion' => (int) $programacion->id_orden_fabricacion,
                    'cantidad_esperada_total' => collect($programacion->ordenFabricacion?->detalles ?? [])->sum('cantidad'),
                    'cantidad_producida_total' => 0,
                    'motivo_diferencia' => null,
                    'tiene_sobrante_materia_prima' => false,
                    'tiene_diferencia_materia_prima' => false,
                    'observaciones' => null,
                    'creado_por' => $idUsuario,
                    'estado' => 'Pendiente',
                    'fecha_realizado' => null,
                ]
            );

            if ($programacion->estado_ejecucion === 'Programado') {
                $programacion->update(['estado_ejecucion' => 'Confirmado']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salida confirmada exitosamente. Se descontó stock en Kardex.',
                'data' => [
                    'id_programacion' => $programacion->id,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al confirmar salida: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function buildInsumosConStock(ProgramacionFabricacion $programacion): array
    {
        $insumosMap = [];
        $receta = is_array($programacion->receta_fabricacion) ? $programacion->receta_fabricacion : [];

        foreach ($receta as $productoFabricar) {
            $insumos = is_array($productoFabricar['insumos_requeridos'] ?? null)
                ? $productoFabricar['insumos_requeridos']
                : [];

            foreach ($insumos as $insumo) {
                $idProducto = (int) ($insumo['id_producto_insumo'] ?? 0);
                if ($idProducto <= 0) {
                    continue;
                }

                $cantidadRequerida = (float) ($insumo['cantidad_requerida'] ?? 0);
                if ($cantidadRequerida <= 0) {
                    continue;
                }

                if (!isset($insumosMap[$idProducto])) {
                    $insumosMap[$idProducto] = [
                        'id_producto' => $idProducto,
                        'descripcion' => $insumo['descripcion'] ?? 'Insumo',
                        'unidad' => $insumo['unidad'] ?? null,
                        'cantidad_requerida' => 0,
                    ];
                }

                $insumosMap[$idProducto]['cantidad_requerida'] = round(
                    $insumosMap[$idProducto]['cantidad_requerida'] + $cantidadRequerida,
                    3
                );
            }
        }

        if (empty($insumosMap)) {
            return [];
        }

        $inventarios = Inventario::query()
            ->whereIn('id_productos', array_keys($insumosMap))
            ->get(['id_productos', 'cantidad_disponible'])
            ->keyBy('id_productos');

        foreach ($insumosMap as $idProducto => &$insumo) {
            $stock = (int) ($inventarios->get($idProducto)?->cantidad_disponible ?? 0);
            $insumo['stock_disponible'] = $stock;
            // Kardex e Inventario actualmente trabajan cantidades enteras.
            $insumo['cantidad_sugerida_salida'] = max(1, (int) ceil((float) $insumo['cantidad_requerida']));
        }
        unset($insumo);

        return array_values($insumosMap);
    }

    private function buildReferencia(int $idProgramacion): string
    {
        return 'PROGFAB-' . $idProgramacion;
    }
}
