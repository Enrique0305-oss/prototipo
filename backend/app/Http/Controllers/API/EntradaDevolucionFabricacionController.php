<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DetalleEntradaDevolucionFabricacion;
use App\Models\EntradaDevolucionFabricacion;
use App\Models\Inventario;
use App\Models\Kardex;
use App\Models\Lote;
use App\Models\ProgramacionFabricacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EntradaDevolucionFabricacionController extends Controller
{
    public function pendientes(Request $request)
    {
        $query = EntradaDevolucionFabricacion::with([
            'ordenFabricacion.detalles.producto',
            'programacionFabricacion.tecnico',
            'detalles.producto',
            'detalles.lote',
        ]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        $registros = $query
            ->orderByRaw("CASE WHEN estado = 'Pendiente' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->get();

        $data = $registros->map(function (EntradaDevolucionFabricacion $registro) {
            $programacion = $registro->programacionFabricacion;
            $resumen = $this->buildResumenProgramacion($programacion);

            return [
                'id' => $registro->id,
                'id_entrada_devolucion_fabricacion' => $registro->id,
                'id_programacion_fabricacion' => $programacion->id,
                'id_orden_fabricacion' => $programacion->id_orden_fabricacion,
                'codigo_orden' => $programacion->ordenFabricacion?->codigo,
                'fecha_orden' => $programacion->ordenFabricacion?->fecha_orden,
                'motivo_orden' => $programacion->ordenFabricacion?->motivo,
                'fecha_programada' => $programacion->fecha_programada,
                'hora_inicio' => $programacion->hora_inicio,
                'hora_fin' => $programacion->hora_fin,
                'estado_ejecucion' => $programacion->estado_ejecucion,
                'estado' => $registro->estado,
                'fecha_realizado' => $registro->fecha_realizado,
                'observaciones' => $registro->observaciones,
                'motivo_diferencia' => $registro->motivo_diferencia,
                'tiene_diferencia_materia_prima' => (bool) $registro->tiene_diferencia_materia_prima,
                'tecnico' => $programacion->tecnico ? [
                    'id' => $programacion->tecnico->id,
                    'nombre' => $programacion->tecnico->nombre,
                    'apellido' => $programacion->tecnico->apellido,
                ] : null,
                'salida_confirmada' => true,
                'productos_esperados' => $resumen['productos_esperados'],
                'insumos_sugeridos' => $resumen['insumos_sugeridos'],
                'detalles' => $registro->detalles->map(function (DetalleEntradaDevolucionFabricacion $detalle) {
                    return [
                        'id' => $detalle->id,
                        'tipo' => $detalle->tipo,
                        'id_producto' => $detalle->id_producto,
                        'id_lote' => $detalle->id_lote,
                        'cantidad' => (float) $detalle->cantidad,
                        'observacion' => $detalle->observacion,
                        'producto' => $detalle->producto ? [
                            'id' => $detalle->producto->id,
                            'descripcion' => $detalle->producto->descripcion,
                            'unidad' => $detalle->producto->unidad,
                        ] : null,
                        'lote' => $detalle->lote ? [
                            'id' => $detalle->lote->id,
                            'numero_lote' => $detalle->lote->numero_lote,
                        ] : null,
                    ];
                })->values(),
                'cantidad_esperada_total' => (float) $registro->cantidad_esperada_total,
                'cantidad_producida_total' => (float) $registro->cantidad_producida_total,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function registrar(Request $request)
    {
        $validated = $request->validate([
            'id_entrada_devolucion_fabricacion' => 'required|integer|exists:entrada_devolucion_fabricacion,id',
            'productos' => 'required|array|min:1',
            'productos.*.id_producto_final' => 'required|integer|exists:productos,id',
            'productos.*.cantidad_producida' => 'required|numeric|min:0.001',
            'motivo_diferencia' => 'nullable|string|max:1000',
            'tiene_sobrante_materia_prima' => 'nullable|boolean',
            'tiene_diferencia_materia_prima' => 'nullable|boolean',
            'observaciones' => 'nullable|string|max:1000',
            'devoluciones' => 'nullable|array',
            'devoluciones.*.id_producto' => 'required_with:devoluciones|integer|exists:productos,id',
            'devoluciones.*.id_lote' => 'required_with:devoluciones|integer|exists:lotes,id',
            'devoluciones.*.cantidad_devuelta' => 'required_with:devoluciones|numeric|min:0.001',
            'diferencias_materia_prima' => 'nullable|array',
            'diferencias_materia_prima.*.id_producto' => 'required_with:diferencias_materia_prima|integer|exists:productos,id',
            'diferencias_materia_prima.*.id_lote' => 'required_with:diferencias_materia_prima|integer|exists:lotes,id',
            'diferencias_materia_prima.*.cantidad_adicional' => 'required_with:diferencias_materia_prima|numeric|min:0.001',
        ]);

        $registro = EntradaDevolucionFabricacion::with(['ordenFabricacion.detalles.producto', 'programacionFabricacion.tecnico', 'detalles.producto'])
            ->findOrFail((int) $validated['id_entrada_devolucion_fabricacion']);

        $programacion = $registro->programacionFabricacion;

        if (!$programacion->ordenFabricacion) {
            return response()->json([
                'success' => false,
                'message' => 'La programacion no tiene una orden de fabricacion asociada.',
            ], 422);
        }

        if ($registro->estado === 'Realizado') {
            return response()->json([
                'success' => false,
                'message' => 'Este cierre ya fue realizado.',
            ], 422);
        }

        $salidaConfirmada = Kardex::query()
            ->where('referencia', $this->buildReferenciaSalida($programacion->id))
            ->where('tipo_movimiento', 'Salida')
            ->exists();

        if (!$salidaConfirmada) {
            return response()->json([
                'success' => false,
                'message' => 'Primero debe confirmarse la salida de programacion antes de registrar la entrada.',
            ], 422);
        }

        $resumen = $this->buildResumenProgramacion($programacion);
        $productosEsperados = collect($resumen['productos_esperados'])->keyBy('id_producto_final');
        $productosIngresados = collect($validated['productos'])->keyBy('id_producto_final');

        if ($productosEsperados->keys()->sort()->values()->all() !== $productosIngresados->keys()->sort()->values()->all()) {
            return response()->json([
                'success' => false,
                'message' => 'Los productos ingresados no coinciden con los productos esperados de la orden.',
            ], 422);
        }

        $diferenciaDetectada = false;
        foreach ($productosEsperados as $idProducto => $esperado) {
            $producido = (float) ($productosIngresados->get($idProducto)['cantidad_producida'] ?? 0);
            if (round($producido, 3) !== round((float) $esperado['cantidad_esperada'], 3)) {
                $diferenciaDetectada = true;
                break;
            }
        }

        $cantidadEsperadaTotal = (float) collect($resumen['productos_esperados'])->sum('cantidad_esperada');
        $cantidadProducidaTotal = (float) collect($validated['productos'])->sum('cantidad_producida');
        $produccionMayorEsperada = round($cantidadProducidaTotal, 3) > round($cantidadEsperadaTotal, 3);

        $motivoDiferencia = trim((string) ($validated['motivo_diferencia'] ?? ''));
        if ($diferenciaDetectada && $motivoDiferencia === '') {
            return response()->json([
                'success' => false,
                'message' => 'Debe registrar un motivo cuando la cantidad producida no coincide con la orden.',
            ], 422);
        }

        $tieneSobrante = (bool) ($validated['tiene_sobrante_materia_prima'] ?? false);
        $devoluciones = collect($validated['devoluciones'] ?? []);
        $tieneDiferenciaMateriaPrima = (bool) ($validated['tiene_diferencia_materia_prima'] ?? false);
        $diferenciasMateriaPrima = collect($validated['diferencias_materia_prima'] ?? []);

        if ($tieneSobrante && $devoluciones->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Debe registrar al menos una devolucion de materia prima cuando se habilita el sobrante.',
            ], 422);
        }

        if ($produccionMayorEsperada && !$tieneDiferenciaMateriaPrima) {
            return response()->json([
                'success' => false,
                'message' => 'Si la cantidad producida supera la esperada, debe marcar la diferencia de materia prima.',
            ], 422);
        }

        if ($tieneDiferenciaMateriaPrima && $diferenciasMateriaPrima->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Debe registrar al menos un insumo con cantidad adicional usada.',
            ], 422);
        }

        if (!$produccionMayorEsperada) {
            $tieneDiferenciaMateriaPrima = false;
            $diferenciasMateriaPrima = collect();
        }

        $insumosSugeridos = collect($resumen['insumos_sugeridos'])->keyBy('id_producto');
        foreach ($diferenciasMateriaPrima as $diferencia) {
            $idProducto = (int) ($diferencia['id_producto'] ?? 0);
            $cantidadAdicional = (float) ($diferencia['cantidad_adicional'] ?? 0);

            if (!$insumosSugeridos->has($idProducto)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La diferencia de materia prima contiene un insumo no asociado a la receta de fabricacion.',
                ], 422);
            }

            if ($cantidadAdicional <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Las cantidades adicionales de materia prima deben ser mayores a 0.',
                ], 422);
            }

            $inventario = Inventario::query()->where('id_productos', $idProducto)->first();
            $stockDisponible = (float) ($inventario?->cantidad_disponible ?? 0);
            if ($stockDisponible < $cantidadAdicional) {
                $descripcion = (string) ($insumosSugeridos->get($idProducto)['descripcion'] ?? 'Insumo');
                return response()->json([
                    'success' => false,
                    'message' => "Stock insuficiente para registrar diferencia de materia prima en {$descripcion}.",
                ], 422);
            }
        }

        foreach ($devoluciones as $devolucion) {
            $idProducto = (int) ($devolucion['id_producto'] ?? 0);
            $idLote = (int) ($devolucion['id_lote'] ?? 0);

            $lote = Lote::query()->where('id', $idLote)->where('id_producto', $idProducto)->first();
            if (!$lote) {
                return response()->json([
                    'success' => false,
                    'message' => 'El lote seleccionado no pertenece al producto de devolucion.',
                ], 422);
            }
        }

        foreach ($diferenciasMateriaPrima as $diferencia) {
            $idProducto = (int) ($diferencia['id_producto'] ?? 0);
            $idLote = (int) ($diferencia['id_lote'] ?? 0);
            $cantidadAdicional = (float) ($diferencia['cantidad_adicional'] ?? 0);

            $lote = Lote::query()->where('id', $idLote)->where('id_producto', $idProducto)->first();
            if (!$lote) {
                return response()->json([
                    'success' => false,
                    'message' => 'El lote seleccionado no pertenece al insumo de diferencia.',
                ], 422);
            }

            if ((float) $lote->cantidad_disponible < $cantidadAdicional) {
                return response()->json([
                    'success' => false,
                    'message' => "Cantidad insuficiente en lote {$lote->numero_lote} para la diferencia.",
                ], 422);
            }
        }

        $idUsuario = $request->user()?->id;

        DB::beginTransaction();
        try {
            $registro->fill([
                'cantidad_esperada_total' => $cantidadEsperadaTotal,
                'cantidad_producida_total' => $cantidadProducidaTotal,
                'motivo_diferencia' => $motivoDiferencia ?: null,
                'tiene_sobrante_materia_prima' => $tieneSobrante,
                'tiene_diferencia_materia_prima' => $tieneDiferenciaMateriaPrima,
                'observaciones' => $validated['observaciones'] ?? null,
                'creado_por' => $idUsuario ?? $registro->creado_por,
            ]);
            $registro->estado = 'Realizado';
            $registro->fecha_realizado = now();
            $registro->save();

            foreach ($validated['productos'] as $productoFinal) {
                $idProductoFinal = (int) $productoFinal['id_producto_final'];
                $cantidadProducida = (float) $productoFinal['cantidad_producida'];

                $this->ensureInventarioExists($idProductoFinal);

                Kardex::registrarMovimiento([
                    'id_producto' => $idProductoFinal,
                    'tipo_movimiento' => 'Entrada',
                    'cantidad' => $cantidadProducida,
                    'motivo' => 'Entrada por fabricacion',
                    'referencia' => $this->buildReferenciaEntrada($programacion->id),
                    'id_referencia' => $registro->id,
                    'id_usuario' => $idUsuario,
                    'observacion' => 'Ingreso de producto terminado por cierre de fabricacion.',
                ]);

                DetalleEntradaDevolucionFabricacion::create([
                    'id_entrada_devolucion_fabricacion' => $registro->id,
                    'tipo' => DetalleEntradaDevolucionFabricacion::TIPO_ENTRADA_PRODUCTO,
                    'id_producto' => $idProductoFinal,
                    'cantidad' => $cantidadProducida,
                    'observacion' => 'Entrada de producto fabricado',
                ]);
            }

            foreach ($devoluciones as $devolucion) {
                $idProducto = (int) ($devolucion['id_producto'] ?? 0);
                $idLote = (int) ($devolucion['id_lote'] ?? 0);
                $cantidadDevuelta = (float) ($devolucion['cantidad_devuelta'] ?? 0);
                if ($cantidadDevuelta <= 0) {
                    continue;
                }

                $lote = Lote::query()->where('id', $idLote)->where('id_producto', $idProducto)->first();
                if (!$lote) {
                    continue;
                }

                // La devolucion regresa material al lote.
                $lote->increment('cantidad_disponible', $cantidadDevuelta);
                $lote->increment('cantidad', $cantidadDevuelta);

                $this->ensureInventarioExists($idProducto);

                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'tipo_movimiento' => 'Entrada',
                    'cantidad' => $cantidadDevuelta,
                    'motivo' => 'Devolucion por sobrante de fabricacion',
                    'referencia' => $this->buildReferenciaEntrada($programacion->id),
                    'id_referencia' => $registro->id,
                    'id_usuario' => $idUsuario,
                    'id_lote' => $idLote,
                    'observacion' => 'Devolucion de materia prima por cierre de fabricacion.',
                ]);

                DetalleEntradaDevolucionFabricacion::create([
                    'id_entrada_devolucion_fabricacion' => $registro->id,
                    'tipo' => DetalleEntradaDevolucionFabricacion::TIPO_DEVOLUCION_INSUMO,
                    'id_producto' => $idProducto,
                    'id_lote' => $idLote,
                    'cantidad' => $cantidadDevuelta,
                    'observacion' => 'Devolucion de sobrante',
                ]);
            }

            foreach ($diferenciasMateriaPrima as $diferencia) {
                $idProducto = (int) ($diferencia['id_producto'] ?? 0);
                $idLote = (int) ($diferencia['id_lote'] ?? 0);
                $cantidadAdicional = (float) ($diferencia['cantidad_adicional'] ?? 0);
                if ($cantidadAdicional <= 0) {
                    continue;
                }

                $lote = Lote::query()->where('id', $idLote)->where('id_producto', $idProducto)->first();
                if (!$lote) {
                    continue;
                }

                // El consumo adicional descuenta material del lote.
                $lote->decrement('cantidad_disponible', $cantidadAdicional);
                $lote->decrement('cantidad', $cantidadAdicional);

                $this->ensureInventarioExists($idProducto);

                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'tipo_movimiento' => 'Salida',
                    'cantidad' => $cantidadAdicional,
                    'motivo' => 'Salida por diferencia de fabricacion',
                    'referencia' => $this->buildReferenciaEntrada($programacion->id),
                    'id_referencia' => $registro->id,
                    'id_usuario' => $idUsuario,
                    'id_lote' => $idLote,
                    'observacion' => 'Consumo adicional de materia prima por fabricacion mayor a la esperada.',
                ]);

                DetalleEntradaDevolucionFabricacion::create([
                    'id_entrada_devolucion_fabricacion' => $registro->id,
                    'tipo' => DetalleEntradaDevolucionFabricacion::TIPO_CONSUMO_DIFERENCIA_INSUMO,
                    'id_producto' => $idProducto,
                    'id_lote' => $idLote,
                    'cantidad' => $cantidadAdicional,
                    'observacion' => 'Consumo adicional por diferencia de produccion',
                ]);
            }

            $programacion->update(['estado_ejecucion' => 'Realizado']);

            $pendientes = ProgramacionFabricacion::query()
                ->where('id_orden_fabricacion', $programacion->id_orden_fabricacion)
                ->whereDoesntHave('entradaDevolucionFabricacion')
                ->exists();

            if (!$pendientes) {
                $programacion->ordenFabricacion->update(['estado' => 'Fabricada']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Entrada y devolucion registradas exitosamente.',
                'data' => [
                    'id' => $registro->id,
                ],
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            if ($e instanceof ValidationException) {
                throw $e;
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar entrada/devolucion: ' . $this->sanitizeUtf8($e->getMessage()),
            ], 500);
        }
    }

    private function sanitizeUtf8(string $value): string
    {
        $sanitized = @iconv('UTF-8', 'UTF-8//IGNORE', $value);
        if ($sanitized === false || $sanitized === null || $sanitized === '') {
            return 'Error interno de codificacion en el mensaje.';
        }

        return $sanitized;
    }

    private function buildResumenProgramacion(ProgramacionFabricacion $programacion): array
    {
        if (!$programacion) {
            return [
                'productos_esperados' => [],
                'insumos_sugeridos' => [],
            ];
        }

        $productosEsperados = [];
        $insumosSugeridos = [];

        $detallesOrden = $programacion->ordenFabricacion?->detalles ?? collect();
        foreach ($detallesOrden as $detalleOrden) {
            $productosEsperados[] = [
                'id_producto_final' => (int) $detalleOrden->id_producto_final,
                'descripcion' => $detalleOrden->producto?->descripcion ?? 'Producto',
                'cantidad_esperada' => (float) $detalleOrden->cantidad,
            ];
        }

        $receta = is_array($programacion->receta_fabricacion) ? $programacion->receta_fabricacion : [];
        foreach ($receta as $productoFabricado) {
            foreach (($productoFabricado['insumos_requeridos'] ?? []) as $insumo) {
                $idProducto = (int) ($insumo['id_producto_insumo'] ?? 0);
                if ($idProducto <= 0) {
                    continue;
                }

                if (!isset($insumosSugeridos[$idProducto])) {
                    $insumosSugeridos[$idProducto] = [
                        'id_producto' => $idProducto,
                        'descripcion' => $insumo['descripcion'] ?? 'Insumo',
                        'unidad' => $insumo['unidad'] ?? null,
                        'cantidad_requerida' => 0,
                    ];
                }

                $insumosSugeridos[$idProducto]['cantidad_requerida'] = round(
                    $insumosSugeridos[$idProducto]['cantidad_requerida'] + (float) ($insumo['cantidad_requerida'] ?? 0),
                    3
                );
            }
        }

        return [
            'productos_esperados' => array_values($productosEsperados),
            'insumos_sugeridos' => array_values($insumosSugeridos),
        ];
    }

    private function ensureInventarioExists(int $idProducto): void
    {
        Inventario::firstOrCreate(
            ['id_productos' => $idProducto],
            [
                'cantidad_disponible' => 0,
                'stock_seguridad' => 0,
                'Tipo' => null,
                'Cantidad_total' => 0,
            ]
        );
    }

    private function buildReferenciaSalida(int $idProgramacion): string
    {
        return 'PROGFAB-' . $idProgramacion;
    }

    private function buildReferenciaEntrada(int $idProgramacion): string
    {
        return 'CIERRE-PROGFAB-' . $idProgramacion;
    }
}
