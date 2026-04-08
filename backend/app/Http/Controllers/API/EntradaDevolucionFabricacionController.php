<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DetalleEntradaDevolucionFabricacion;
use App\Models\EntradaDevolucionFabricacion;
use App\Models\Inventario;
use App\Models\Kardex;
use App\Models\ProgramacionFabricacion;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntradaDevolucionFabricacionController extends Controller
{
    public function pendientes(Request $request)
    {
        $query = ProgramacionFabricacion::with(['tecnico', 'ordenFabricacion.detalles.producto'])
            ->whereHas('ordenFabricacion', function ($ordenQuery) {
                $ordenQuery->whereIn('estado', ['Confirmada', 'Programada']);
            })
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->whereDoesntHave('entradaDevolucionFabricacion')
            ->whereHas('ordenFabricacion');

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

        $programaciones = $programaciones->filter(function (ProgramacionFabricacion $programacion) {
            return Kardex::query()
                ->where('referencia', $this->buildReferenciaSalida($programacion->id))
                ->where('tipo_movimiento', 'Salida')
                ->exists();
        })->values();

        $data = $programaciones->map(function (ProgramacionFabricacion $programacion) {
            $salidaConfirmada = Kardex::query()
                ->where('referencia', $this->buildReferenciaSalida($programacion->id))
                ->where('tipo_movimiento', 'Salida')
                ->exists();

            $resumen = $this->buildResumenProgramacion($programacion);

            return [
                'id' => $programacion->id,
                'id_orden_fabricacion' => $programacion->id_orden_fabricacion,
                'codigo_orden' => $programacion->ordenFabricacion?->codigo,
                'fecha_orden' => $programacion->ordenFabricacion?->fecha_orden,
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
                'salida_confirmada' => $salidaConfirmada,
                'productos_esperados' => $resumen['productos_esperados'],
                'insumos_sugeridos' => $resumen['insumos_sugeridos'],
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
            'id_programacion_fabricacion' => 'required|integer|exists:programacion_fabricacion,id',
            'productos' => 'required|array|min:1',
            'productos.*.id_producto_final' => 'required|integer|exists:productos,id',
            'productos.*.cantidad_producida' => 'required|numeric|min:0.001',
            'motivo_diferencia' => 'nullable|string|max:1000',
            'tiene_sobrante_materia_prima' => 'nullable|boolean',
            'observaciones' => 'nullable|string|max:1000',
            'devoluciones' => 'nullable|array',
            'devoluciones.*.id_producto' => 'required_with:devoluciones|integer|exists:productos,id',
            'devoluciones.*.cantidad_devuelta' => 'required_with:devoluciones|numeric|min:0.001',
        ]);

        $programacion = ProgramacionFabricacion::with(['ordenFabricacion.detalles.producto', 'entradaDevolucionFabricacion'])
            ->findOrFail((int) $validated['id_programacion_fabricacion']);

        if (!$programacion->ordenFabricacion) {
            return response()->json([
                'success' => false,
                'message' => 'La programacion no tiene una orden de fabricacion asociada.',
            ], 422);
        }

        if ($programacion->entradaDevolucionFabricacion) {
            return response()->json([
                'success' => false,
                'message' => 'Esta programacion ya fue cerrada con entrada/devolucion.',
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

        $motivoDiferencia = trim((string) ($validated['motivo_diferencia'] ?? ''));
        if ($diferenciaDetectada && $motivoDiferencia === '') {
            return response()->json([
                'success' => false,
                'message' => 'Debe registrar un motivo cuando la cantidad producida no coincide con la orden.',
            ], 422);
        }

        $tieneSobrante = (bool) ($validated['tiene_sobrante_materia_prima'] ?? false);
        $devoluciones = collect($validated['devoluciones'] ?? []);

        if ($tieneSobrante && $devoluciones->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Debe registrar al menos una devolución de materia prima cuando se habilita el sobrante.',
            ], 422);
        }

        $idUsuario = $request->user()?->id;

        DB::beginTransaction();
        try {
            $entrada = EntradaDevolucionFabricacion::create([
                'id_orden_fabricacion' => $programacion->id_orden_fabricacion,
                'id_programacion_fabricacion' => $programacion->id,
                'cantidad_esperada_total' => collect($resumen['productos_esperados'])->sum('cantidad_esperada'),
                'cantidad_producida_total' => collect($validated['productos'])->sum('cantidad_producida'),
                'motivo_diferencia' => $motivoDiferencia ?: null,
                'tiene_sobrante_materia_prima' => $tieneSobrante,
                'observaciones' => $validated['observaciones'] ?? null,
                'creado_por' => $idUsuario,
            ]);

            foreach ($validated['productos'] as $productoFinal) {
                $idProductoFinal = (int) $productoFinal['id_producto_final'];
                $cantidadProducida = (float) $productoFinal['cantidad_producida'];

                $this->ensureInventarioExists($idProductoFinal);

                Kardex::registrarMovimiento([
                    'id_producto' => $idProductoFinal,
                    'tipo_movimiento' => 'Entrada',
                    'cantidad' => $cantidadProducida,
                    'motivo' => 'Entrada por fabricación',
                    'referencia' => $this->buildReferenciaEntrada($programacion->id),
                    'id_referencia' => $entrada->id,
                    'id_usuario' => $idUsuario,
                    'observacion' => 'Ingreso de producto terminado por cierre de fabricación.',
                ]);

                DetalleEntradaDevolucionFabricacion::create([
                    'id_entrada_devolucion_fabricacion' => $entrada->id,
                    'tipo' => 'EntradaProducto',
                    'id_producto' => $idProductoFinal,
                    'cantidad' => $cantidadProducida,
                    'observacion' => 'Entrada de producto fabricado',
                ]);
            }

            foreach ($devoluciones as $devolucion) {
                $idProducto = (int) $devolucion['id_producto'];
                $cantidadDevuelta = (float) $devolucion['cantidad_devuelta'];
                if ($cantidadDevuelta <= 0) {
                    continue;
                }

                $this->ensureInventarioExists($idProducto);

                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'tipo_movimiento' => 'Entrada',
                    'cantidad' => $cantidadDevuelta,
                    'motivo' => 'Devolución por sobrante de fabricación',
                    'referencia' => $this->buildReferenciaEntrada($programacion->id),
                    'id_referencia' => $entrada->id,
                    'id_usuario' => $idUsuario,
                    'observacion' => 'Devolución de materia prima por cierre de fabricación.',
                ]);

                DetalleEntradaDevolucionFabricacion::create([
                    'id_entrada_devolucion_fabricacion' => $entrada->id,
                    'tipo' => 'DevolucionInsumo',
                    'id_producto' => $idProducto,
                    'cantidad' => $cantidadDevuelta,
                    'observacion' => 'Devolución de sobrante',
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
                    'id' => $entrada->id,
                ],
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar entrada/devolucion: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function buildResumenProgramacion(ProgramacionFabricacion $programacion): array
    {
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
