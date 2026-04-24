<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProgramacionServicio;
use App\Models\ProgramacionInsumo;
use App\Models\OrdenServicioProducto;
use App\Models\ServicioProducto;
use App\Models\Kardex;
use App\Models\Inventario;
use App\Models\Lote;
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
            'insumos.lote',
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
            'data' => $this->agruparProgramaciones($programaciones),
        ]);
    }

    /**
     * Agrupa programaciones que comparten el mismo id_grupo_programacion
     */
    private function agruparProgramaciones($programaciones)
    {
        $resultado = [];
        $grupos = [];

        foreach ($programaciones as $prog) {
            if (empty($prog->id_grupo_programacion)) {
                $progArray = $prog->toArray();
                $progArray['es_grupo'] = false;
                $progArray['ids_programacion'] = [$prog->id];
                $resultado[] = $progArray;
                continue;
            }

            $grupoId = $prog->id_grupo_programacion;
            if (!isset($grupos[$grupoId])) {
                $base = clone $prog;
                $base->id = $grupoId; // ID virtual del grupo
                $baseArray = $base->toArray();
                $baseArray['es_grupo'] = true;
                $baseArray['grupo_id'] = $grupoId;
                $baseArray['ids_programacion'] = [];
                $baseArray['servicios'] = [];
                $baseArray['insumos'] = [];
                $baseArray['_insumos_map'] = [];
                $grupos[$grupoId] = $baseArray;
            }

            $grupos[$grupoId]['ids_programacion'][] = $prog->id;
            
            if ($prog->servicio) {
                $grupos[$grupoId]['servicios'][] = $prog->servicio->nombre;
            }

            if ($prog->insumos) {
                foreach ($prog->insumos as $insumo) {
                    $pid = $insumo->id_producto;
                    if (!isset($grupos[$grupoId]['_insumos_map'][$pid])) {
                        $grupos[$grupoId]['_insumos_map'][$pid] = $insumo->toArray();
                    } else {
                        $grupos[$grupoId]['_insumos_map'][$pid]['cantidad_asignada'] += $insumo->cantidad_asignada;
                        if (isset($insumo->cantidad_utilizada)) {
                            $grupos[$grupoId]['_insumos_map'][$pid]['cantidad_utilizada'] += $insumo->cantidad_utilizada;
                        }
                    }
                }
            }
        }

        // Combinar nombres de servicios e insumos
        foreach ($grupos as &$grupo) {
            if ($grupo['servicio']) {
                $grupo['servicio']['nombre'] = implode(' + ', array_unique($grupo['servicios']));
            }
            $grupo['insumos'] = array_values($grupo['_insumos_map']);
            unset($grupo['_insumos_map']);
        }

        return array_values(array_merge($resultado, $grupos));
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
    public function getDetalle(Request $request, $id)
    {
        $esGrupo = $request->query('es_grupo') === '1';

        $query = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'insumos' => function ($q) {
                $q->where('estado', 'Asignado');
            },
            'insumos.producto.inventario',
            'insumos.lote',
        ]);

        if ($esGrupo) {
            $programaciones = $query->where('id_grupo_programacion', $id)->get();
            if ($programaciones->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Grupo de programación no encontrado'], 404);
            }
            $resultado = $this->agruparProgramaciones($programaciones);
            $data = $resultado[0];
        } else {
            $prog = $query->find($id);
            if (!$prog) {
                return response()->json(['success' => false, 'message' => 'Programación no encontrada'], 404);
            }
            $data = $prog;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Confirmar salida de materiales
     * Registra en Kardex y descuenta del stock
     */
    public function confirmarSalida(Request $request)
    {
        $validated = $request->validate([
            'ids_programacion' => 'required|array|min:1',
            'ids_programacion.*' => 'integer|exists:programacion_servicio,id',
            'insumos' => 'required|array|min:1',
            'insumos.*.id_producto' => 'required|integer|exists:productos,id',
            'insumos.*.id_lote' => 'required|integer|exists:lotes,id',
            'insumos.*.cantidad_entregada' => 'required|integer|min:1',
            'observacion' => 'nullable|string|max:500',
        ]);

        $idsProgramacion = $validated['ids_programacion'];
        $insumosEntregados = collect($validated['insumos']);
        $observacion = $validated['observacion'] ?? '';
        $idUsuario = $request->user()?->id;

        DB::beginTransaction();
        try {
            // Validar que los insumos estén asignados y pendientes en TODAS las programaciones seleccionadas
            $insumosProg = ProgramacionInsumo::whereIn('id_programacion', $idsProgramacion)
                ->where('estado', 'Asignado')
                ->get()
                ->groupBy('id_producto');

            if ($insumosProg->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay insumos pendientes de entrega',
                ], 422);
            }

            // Procesar cada insumo entregado
            foreach ($insumosEntregados as $item) {
                $idProducto = $item['id_producto'];
                $idLote = (int) $item['id_lote'];
                $cantidadEntregada = $item['cantidad_entregada'];

                if ($cantidadEntregada <= 0) continue;

                if (!isset($insumosProg[$idProducto])) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} no está asignado",
                    ], 422);
                }

                $lote = Lote::where('id', $idLote)
                    ->where('id_producto', $idProducto)
                    ->lockForUpdate()
                    ->first();

                if (!$lote) {
                    return response()->json([
                        'success' => false,
                        'message' => "El lote seleccionado no es válido para producto #{$idProducto}",
                    ], 422);
                }

                if ((int) $lote->cantidad_disponible < (int) $cantidadEntregada) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente en lote {$lote->numero_lote} para producto #{$idProducto}",
                    ], 422);
                }

                // Verificar stock disponible en inventario
                $inventario = Inventario::where('id_productos', $idProducto)->first();
                if (!$inventario || $inventario->cantidad_disponible < $cantidadEntregada) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuficiente para producto #{$idProducto}",
                    ], 422);
                }

                // Descontar del lote seleccionado
                $lote->cantidad_disponible = max(0, (int) $lote->cantidad_disponible - (int) $cantidadEntregada);
                $lote->cantidad = max(0, (int) $lote->cantidad - (int) $cantidadEntregada);
                $lote->save();

                // Registrar en Kardex (una sola vez por producto/lote para todo el grupo)
                $refIds = implode(',', $idsProgramacion);
                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'id_lote' => $idLote,
                    'tipo_movimiento' => 'Salida',
                    'cantidad' => $cantidadEntregada,
                    'motivo' => 'Salida Programación',
                    'referencia' => count($idsProgramacion) > 1 ? "GRUPO-PROGS" : "PROG-{$idsProgramacion[0]}",
                    'id_referencia' => $idsProgramacion[0],
                    'id_usuario' => $idUsuario,
                    'observacion' => "Salida confirmada por almacén. Progs: [{$refIds}]. {$observacion}",
                ]);

                // Distribuir la cantidad entregada entre los insumosProg correspondientes
                $restante = $cantidadEntregada;
                foreach ($insumosProg[$idProducto] as $insumo) {
                    if ($restante <= 0) break;
                    $deducir = min($restante, $insumo->cantidad_asignada);
                    $insumo->update([
                        'id_lote' => $idLote,
                        'estado' => 'Entregado',
                        'cantidad_utilizada' => $deducir,
                    ]);
                    $restante -= $deducir;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Salida confirmada exitosamente. Materiales entregados y registrados en Kardex.',
                'data' => [
                    'ids_programacion' => $idsProgramacion,
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
            'insumos.lote',
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
            'data' => $this->agruparProgramaciones($programaciones),
        ]);
    }

    /**
     * Ver detalle de una programación para registrar devoluciones
     * Trae insumos entregados o parcialmente devueltos
     */
    public function getDetalleDevolucion(Request $request, $id)
    {
        $esGrupo = $request->query('es_grupo') === '1';

        $query = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'insumos' => function ($q) {
                $q->whereIn('estado', ['Entregado', 'Devuelto', 'Utilizado']);
            },
            'insumos.producto',
            'insumos.lote',
        ]);

        if ($esGrupo) {
            $programaciones = $query->where('id_grupo_programacion', $id)->get();
            if ($programaciones->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Grupo de programación no encontrado'], 404);
            }
            $resultado = $this->agruparProgramaciones($programaciones);
            $data = $resultado[0];
        } else {
            $prog = $query->find($id);
            if (!$prog) {
                return response()->json(['success' => false, 'message' => 'Programación no encontrada'], 404);
            }
            $data = $prog;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Registrar devolución de materiales entregados
     * Registra entrada en Kardex y repone stock
     */
    public function registrarDevolucion(Request $request)
    {
        $validated = $request->validate([
            'ids_programacion' => 'required|array|min:1',
            'ids_programacion.*' => 'integer|exists:programacion_servicio,id',
            'insumos' => 'required|array|min:1',
            'insumos.*.id_producto' => 'required|integer|exists:productos,id',
            'insumos.*.cantidad_devuelta' => 'required|integer|min:0',
            'observacion' => 'nullable|string|max:500',
        ]);

        $idsProgramacion = $validated['ids_programacion'];
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
            $insumosProg = ProgramacionInsumo::whereIn('id_programacion', $idsProgramacion)
                ->whereIn('estado', ['Entregado', 'Devuelto'])
                ->get()
                ->groupBy('id_producto');

            if ($insumosProg->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay insumos entregados para devolver en estas programaciones',
                ], 422);
            }

            foreach ($insumosDevueltos as $item) {
                $idProducto = $item['id_producto'];
                $cantidadDevuelta = (int) $item['cantidad_devuelta'];

                if ($cantidadDevuelta <= 0) {
                    continue;
                }

                if (!isset($insumosProg[$idProducto])) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} no está entregado",
                    ], 422);
                }

                $totalPendiente = $insumosProg[$idProducto]->sum('cantidad_utilizada');
                if ($totalPendiente <= 0) {
                    return response()->json([
                        'success' => false,
                        'message' => "El producto #{$idProducto} ya no tiene saldo para devolución",
                    ], 422);
                }

                if ($cantidadDevuelta > $totalPendiente) {
                    return response()->json([
                        'success' => false,
                        'message' => "La devolución del producto #{$idProducto} excede lo entregado",
                    ], 422);
                }

                // Tomamos el primer insumo para saber el lote (todos deberían tener el mismo lote en una entrega normal)
                $primerInsumo = $insumosProg[$idProducto]->first();
                $idLote = $primerInsumo->id_lote;

                $refIds = implode(',', $idsProgramacion);
                Kardex::registrarMovimiento([
                    'id_producto' => $idProducto,
                    'id_lote' => $idLote,
                    'tipo_movimiento' => 'Entrada',
                    'cantidad' => $cantidadDevuelta,
                    'motivo' => 'Devolución Programación',
                    'referencia' => count($idsProgramacion) > 1 ? "GRUPO-PROGS" : "PROG-{$idsProgramacion[0]}",
                    'id_referencia' => $idsProgramacion[0],
                    'id_usuario' => $idUsuario,
                    'observacion' => "Devolución registrada por almacén. Progs: [{$refIds}]. {$observacion}",
                ]);

                if (!empty($idLote)) {
                    $lote = Lote::where('id', $idLote)
                        ->where('id_producto', $idProducto)
                        ->lockForUpdate()
                        ->first();

                    if ($lote) {
                        $lote->cantidad_disponible = ((int) $lote->cantidad_disponible) + $cantidadDevuelta;
                        $lote->cantidad = ((int) $lote->cantidad) + $cantidadDevuelta;
                        $lote->save();
                    }
                }

                // Distribuir devolución entre los insumos
                $restante = $cantidadDevuelta;
                foreach ($insumosProg[$idProducto] as $insumo) {
                    if ($restante <= 0) break;
                    
                    $cantidadPendienteInsumo = (int) ($insumo->cantidad_utilizada ?? 0);
                    if ($cantidadPendienteInsumo <= 0) continue;

                    $deducir = min($restante, $cantidadPendienteInsumo);
                    $saldo = $cantidadPendienteInsumo - $deducir;
                    
                    $insumo->cantidad_utilizada = $saldo;
                    $insumo->estado = $saldo === 0 ? 'Devuelto' : 'Entregado';
                    $insumo->save();
                    
                    $restante -= $deducir;
                }
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
    public function generarPdfEntrega(Request $request, $id)
    {
        $esGrupo = $request->query('es_grupo') === '1';

        $query = ProgramacionServicio::with([
            'ordenServicio.cliente',
            'servicio',
            'tecnico',
            'planta',
            'area',
            'insumos' => function ($q) {
                $q->whereIn('estado', ['Entregado', 'Utilizado', 'Devuelto']);
            },
            'insumos.producto',
            'insumos.lote',
        ]);

        if ($esGrupo) {
            $programaciones = $query->where('id_grupo_programacion', $id)->get();
            if ($programaciones->isEmpty()) {
                abort(404, 'Grupo de programación no encontrado');
            }
            $resultado = $this->agruparProgramaciones($programaciones);
            $data = $resultado[0];
            // Para el PDF necesitamos una instancia con propiedades, no un array.
            // Podemos pasar el primer ProgramacionServicio pero sobreescribir sus insumos
            $prog = clone $programaciones->first();
            $prog->servicio = (object) ['nombre' => $data['servicio']['nombre'] ?? 'Múltiples Servicios'];
            $prog->insumos = collect($data['insumos'])->map(function($insumoArray) {
                // Convert arrays back to objects for the view
                return json_decode(json_encode($insumoArray), false);
            });
            $prog->id = "GRUPO-" . $id; // Virtual ID for filename
        } else {
            $prog = $query->findOrFail($id);
        }

        $insumos = $prog->insumos->filter(function ($ins) {
            return (int)($ins->cantidad_utilizada ?? 0) > 0 || in_array($ins->estado, ['Entregado', 'Utilizado']);
        })->values();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('SalidaProgramacionPDF', [
            'prog' => $prog,
            'insumos' => $insumos,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Acta_Entrega_' . ($esGrupo ? 'Grupo_' : 'Programacion_') . $id . '.pdf');
    }

    /**
     * Obtener insumos químicos entregados para una programación.
     * Filtra productos cuya categoría contenga "quimico" (case-insensitive)
     * y cuyo estado sea "Entregado".
     */
    public function getInsumosQuimicosEntregados($id)
    {
        $prog = ProgramacionServicio::find($id);

        if (!$prog) {
            return response()->json([
                'success' => false,
                'message' => 'Programación no encontrada',
            ], 404);
        }

        if (!empty($prog->id_grupo_programacion)) {
            $ids = ProgramacionServicio::where('id_grupo_programacion', $prog->id_grupo_programacion)
                                        ->pluck('id')
                                        ->toArray();
        } else {
            $ids = [$id];
        }

        $insumos = ProgramacionInsumo::whereIn('id_programacion', $ids)
            ->where('estado', 'Entregado')
            ->with(['producto.categoria', 'lote'])
            ->get();

        $quimicos = $insumos->filter(function ($insumo) {
            $producto = $insumo->producto;
            if (!$producto || !$producto->categoria) {
                return false;
            }
            return stripos($producto->categoria->nombre, 'quimico') !== false;
        })->values();

        // Agrupar por producto y lote para sumar las cantidades de los servicios del grupo
        $groupedQuimicos = $quimicos->groupBy(function($item) {
            return $item->id_producto . '-' . ($item->id_lote ?? 'nolote');
        });

        $data = $groupedQuimicos->map(function ($items) {
            $first = $items->first();
            $producto = $first->producto;
            $lote = $first->lote;
            
            $cantidadEntregada = $items->sum(function($item) {
                return (int) ($item->cantidad_utilizada ?? $item->cantidad_asignada ?? 0);
            });

            return [
                'id_producto' => $first->id_producto,
                'producto' => $producto->descripcion ?? 'Producto',
                'lote' => $lote->numero_lote ?? '',
                'fecha_vencimiento' => $lote && $lote->fecha_vencimiento
                    ? $lote->fecha_vencimiento->format('Y-m-d')
                    : '',
                'unidad' => $producto->unidad ?? '',
                'cantidad_entregada' => $cantidadEntregada,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
