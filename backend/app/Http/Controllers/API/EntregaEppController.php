<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EntregaEpp;
use App\Models\DetalleEntregaEpp;
use App\Models\Producto;
use App\Models\Inventario;
use App\Models\Kardex;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class EntregaEppController extends Controller
{
    /**
     * Listar todas las entregas de EPP
     */
    public function index(Request $request): JsonResponse
    {
        $query = EntregaEpp::with(['tecnico', 'registrador', 'devolvedor', 'detalles.producto']);

        // Filtro por búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_entrega', 'like', "%{$search}%")
                  ->orWhereHas('tecnico', function ($q) use ($search) {
                      $q->where('nombre', 'like', "%{$search}%")
                        ->orWhere('apellidos', 'like', "%{$search}%")
                        ->orWhere('dni', 'like', "%{$search}%");
                  });
            });
        }

        // Filtro por estado
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        // Filtro por fecha
        if ($request->has('fecha_desde') && $request->fecha_desde) {
            $query->where('fecha_entrega', '>=', $request->fecha_desde);
        }
        if ($request->has('fecha_hasta') && $request->fecha_hasta) {
            $query->where('fecha_entrega', '<=', $request->fecha_hasta);
        }

        $entregas = $query->orderBy('created_at', 'desc')->get();

        $data = $entregas->map(function ($entrega) {
            return [
                'id' => $entrega->id,
                'numero_entrega' => $entrega->numero_entrega,
                'tecnico' => [
                    'id' => $entrega->tecnico->id,
                    'nombre' => $entrega->tecnico->nombre,
                    'apellidos' => $entrega->tecnico->apellidos,
                    'dni' => $entrega->tecnico->dni,
                ],
                'fecha_entrega' => $entrega->fecha_entrega->format('Y-m-d'),
                'fecha_devolucion' => $entrega->fecha_devolucion ? $entrega->fecha_devolucion->format('Y-m-d') : null,
                'estado' => $entrega->estado,
                'registrador' => $entrega->registrador ? [
                    'id' => $entrega->registrador->id,
                    'nombre' => $entrega->registrador->nombre,
                    'apellidos' => $entrega->registrador->apellidos ?? '',
                ] : null,
                'devolvedor' => $entrega->devolvedor ? [
                    'id' => $entrega->devolvedor->id,
                    'nombre' => $entrega->devolvedor->nombre,
                    'apellidos' => $entrega->devolvedor->apellidos ?? '',
                ] : null,
                'observaciones' => $entrega->observaciones,
                'motivo_entrega' => $entrega->motivo_entrega,
                'motivo_devolucion' => $entrega->motivo_devolucion,
                'detalles' => $entrega->detalles->map(fn($d) => [
                    'id' => $d->id,
                    'producto' => [
                        'id' => $d->producto->id,
                        'descripcion' => $d->producto->descripcion,
                    ],
                    'cantidad' => $d->cantidad,
                    'observacion' => $d->observacion,
                    'condicion_devolucion' => $d->condicion_devolucion,
                    'observacion_devolucion' => $d->observacion_devolucion,
                    'estado_item' => $d->estado_item ?? 'Activo',
                    'id_entrega_reemplazo' => $d->id_entrega_reemplazo,
                ]),
                'total_items' => $entrega->detalles->sum('cantidad'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Obtener productos EPP disponibles (categoría EPP, id_categoria = 4)
     */
    public function productosEpp(): JsonResponse
    {
        $productos = Producto::where('id_categoria', 4)
            ->where('estado', 'Activo')
            ->with('inventario')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'descripcion' => $p->descripcion,
                    'numero_lote' => $p->numero_lote,
                    'unidad_medida' => $p->unidad_medida,
                    'stock_disponible' => $p->inventario ? $p->inventario->cantidad_disponible : 0,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $productos,
        ]);
    }

    /**
     * Registrar una nueva entrega de EPP
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_tecnico' => 'required|exists:tecnicos,id',
            'fecha_entrega' => 'required|date',
            'observaciones' => 'nullable|string',
            'motivo_entrega' => 'nullable|in:Primera Asignación,Reemplazo por Daño,Reemplazo por Desgaste,Reemplazo por Pérdida,Reposición Periódica,Solicitud del Técnico',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto' => 'required|exists:productos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.observacion' => 'nullable|string',
        ]);

        // Validar que todos los productos sean EPP (categoría 4)
        foreach ($validated['detalles'] as $detalle) {
            $producto = Producto::find($detalle['id_producto']);
            if ($producto->id_categoria != 4) {
                return response()->json([
                    'success' => false,
                    'message' => "El producto '{$producto->descripcion}' no es EPP",
                ], 422);
            }
        }

        // Validar stock disponible
        $erroresStock = [];
        foreach ($validated['detalles'] as $detalle) {
            $inventario = Inventario::where('id_productos', $detalle['id_producto'])->first();
            $disponible = $inventario ? $inventario->cantidad_disponible : 0;
            if ($disponible < $detalle['cantidad']) {
                $producto = Producto::find($detalle['id_producto']);
                $erroresStock[] = "{$producto->descripcion}: solicitas {$detalle['cantidad']}, disponible {$disponible}";
            }
        }

        if (!empty($erroresStock)) {
            return response()->json([
                'success' => false,
                'message' => 'Stock insuficiente',
                'errors' => $erroresStock,
            ], 422);
        }

        try {
            DB::beginTransaction();

            $idUsuario = $request->user()?->id;

            $entrega = EntregaEpp::create([
                'numero_entrega' => EntregaEpp::generarNumero(),
                'id_tecnico' => $validated['id_tecnico'],
                'fecha_entrega' => $validated['fecha_entrega'],
                'estado' => 'Entregado',
                'motivo_entrega' => $validated['motivo_entrega'] ?? 'Primera Asignación',
                'registrado_por' => $idUsuario,
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            foreach ($validated['detalles'] as $detalle) {
                DetalleEntregaEpp::create([
                    'id_entrega_epp' => $entrega->id,
                    'id_producto' => $detalle['id_producto'],
                    'cantidad' => $detalle['cantidad'],
                    'observacion' => $detalle['observacion'] ?? null,
                    'estado_item' => 'Activo',
                ]);

                // Registrar salida en Kardex
                Kardex::registrarMovimiento([
                    'id_producto' => $detalle['id_producto'],
                    'tipo_movimiento' => 'Salida',
                    'cantidad' => $detalle['cantidad'],
                    'motivo' => 'Entrega EPP',
                    'referencia' => $entrega->numero_entrega,
                    'id_referencia' => $entrega->id,
                    'id_usuario' => $idUsuario,
                    'observacion' => "Entrega EPP {$entrega->numero_entrega} a técnico",
                ]);
            }

            // Auto-marcar ítems previos como Reemplazado si el motivo es de reemplazo
            $motivosReemplazo = ['Reemplazo por Daño', 'Reemplazo por Desgaste', 'Reemplazo por Pérdida', 'Reposición Periódica'];
            $motivoEntrega = $validated['motivo_entrega'] ?? 'Primera Asignación';
            if (in_array($motivoEntrega, $motivosReemplazo)) {
                foreach ($validated['detalles'] as $detalle) {
                    $previos = DetalleEntregaEpp::where('id_producto', $detalle['id_producto'])
                        ->where('estado_item', 'Activo')
                        ->whereHas('entregaEpp', function ($q) use ($validated) {
                            $q->where('id_tecnico', $validated['id_tecnico'])
                              ->where('estado', 'Entregado');
                        })
                        ->get();
                    foreach ($previos as $prev) {
                        $prev->update([
                            'estado_item' => 'Reemplazado',
                            'id_entrega_reemplazo' => $entrega->id,
                        ]);
                    }
                }
            }

            DB::commit();

            $entrega->load(['tecnico', 'registrador', 'detalles.producto']);

            return response()->json([
                'success' => true,
                'message' => 'Entrega de EPP registrada exitosamente',
                'data' => $entrega,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la entrega de EPP',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ver una entrega específica
     */
    public function show($id): JsonResponse
    {
        $entrega = EntregaEpp::with(['tecnico', 'registrador', 'devolvedor', 'detalles.producto'])->find($id);

        if (!$entrega) {
            return response()->json([
                'success' => false,
                'message' => 'Entrega no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $entrega,
        ]);
    }

    /**
     * Registrar devolución de EPP
     */
    public function devolver(Request $request, $id): JsonResponse
    {
        $entrega = EntregaEpp::with('detalles')->find($id);

        if (!$entrega) {
            return response()->json([
                'success' => false,
                'message' => 'Entrega no encontrada',
            ], 404);
        }

        if ($entrega->estado === 'Devuelto') {
            return response()->json([
                'success' => false,
                'message' => 'Esta entrega ya fue devuelta',
            ], 400);
        }

        $validated = $request->validate([
            'fecha_devolucion' => 'nullable|date',
            'motivo_devolucion' => 'nullable|string',
            'detalles' => 'nullable|array',
            'detalles.*.id' => 'required|integer',
            'detalles.*.condicion_devolucion' => 'nullable|string|in:Bueno,Regular,Malo,No devuelto',
            'detalles.*.observacion_devolucion' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $idUsuario = $request->user()?->id;

            $entrega->update([
                'estado' => 'Devuelto',
                'fecha_devolucion' => $validated['fecha_devolucion'] ?? now()->toDateString(),
                'motivo_devolucion' => $validated['motivo_devolucion'] ?? null,
                'devuelto_por' => $idUsuario,
            ]);

            // Actualizar condición, observación y estado_item
            if (!empty($validated['detalles'])) {
                foreach ($validated['detalles'] as $det) {
                    $detalle = DetalleEntregaEpp::find($det['id']);
                    if ($detalle && $detalle->id_entrega_epp === $entrega->id) {
                        $condicion = $det['condicion_devolucion'] ?? 'Bueno';
                        $detalle->update([
                            'condicion_devolucion' => $condicion,
                            'observacion_devolucion' => $det['observacion_devolucion'] ?? null,
                            // Solo marcar como Devuelto si realmente regresó físicamente
                            'estado_item' => $condicion === 'No devuelto' ? $detalle->estado_item : 'Devuelto',
                        ]);
                    }
                }
            } else {
                // Si no envían detalles, marcar todos como Bueno y Devuelto
                foreach ($entrega->detalles as $detalle) {
                    $detalle->update([
                        'condicion_devolucion' => 'Bueno',
                        'estado_item' => 'Devuelto',
                    ]);
                }
            }

            // Registrar entrada en Kardex solo de ítems que regresaron físicamente
            // (estado_item = 'Devuelto', no los que quedaron como Activo/Reemplazado por ser 'No devuelto')
            foreach ($entrega->detalles as $detalle) {
                // Refrescar el modelo para obtener el estado actualizado
                $detalle->refresh();
                
                if ($detalle->estado_item !== 'Devuelto') {
                    continue; // No devuelto físicamente, no vuelve al stock
                }
                
                Kardex::registrarMovimiento([
                    'id_producto' => $detalle->id_producto,
                    'tipo_movimiento' => 'Entrada',
                    'cantidad' => $detalle->cantidad,
                    'motivo' => 'Devolución EPP',
                    'referencia' => $entrega->numero_entrega,
                    'id_referencia' => $entrega->id,
                    'id_usuario' => $idUsuario,
                    'observacion' => "Devolución EPP {$entrega->numero_entrega}",
                ]);
            }

            DB::commit();

            $entrega->load(['tecnico', 'registrador', 'devolvedor', 'detalles.producto']);

            return response()->json([
                'success' => true,
                'message' => 'Devolución de EPP registrada exitosamente',
                'data' => $entrega,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la devolución',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Estadísticas de entregas EPP
     */
    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total_entregas' => EntregaEpp::count(),
            'entregas_activas' => EntregaEpp::where('estado', 'Entregado')->count(),
            'entregas_devueltas' => EntregaEpp::where('estado', 'Devuelto')->count(),
            'devoluciones_mes' => EntregaEpp::where('estado', 'Devuelto')
                ->whereMonth('fecha_devolucion', now()->month)
                ->whereYear('fecha_devolucion', now()->year)
                ->count(),
            'total_items_entregados' => DB::table('detalle_entrega_epp')
                ->join('entrega_epp', 'detalle_entrega_epp.id_entrega_epp', '=', 'entrega_epp.id')
                ->where('entrega_epp.estado', 'Entregado')
                ->sum('detalle_entrega_epp.cantidad'),
            'tecnicos_con_epp' => EntregaEpp::where('estado', 'Entregado')->distinct('id_tecnico')->count('id_tecnico'),
            'siguiente_numero' => EntregaEpp::generarNumero(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Estado actual de EPP por técnico (ítems activos)
     */
    public function estadoTecnicos(): JsonResponse
    {
        $detalles = DetalleEntregaEpp::with(['entregaEpp.tecnico', 'producto'])
            ->where('estado_item', 'Activo')
            ->whereHas('entregaEpp', fn($q) => $q->where('estado', 'Entregado'))
            ->get();

        // Agrupar por técnico
        $porTecnico = [];
        foreach ($detalles as $d) {
            $tecnico = $d->entregaEpp->tecnico;
            $tid = $tecnico->id;
            if (!isset($porTecnico[$tid])) {
                $porTecnico[$tid] = [
                    'tecnico' => [
                        'id' => $tecnico->id,
                        'nombre' => $tecnico->nombre,
                        'apellidos' => $tecnico->apellidos,
                        'dni' => $tecnico->dni,
                    ],
                    'items' => [],
                ];
            }
            $porTecnico[$tid]['items'][] = [
                'id_detalle' => $d->id,
                'producto' => [
                    'id' => $d->producto->id,
                    'descripcion' => $d->producto->descripcion,
                ],
                'cantidad' => $d->cantidad,
                'numero_entrega' => $d->entregaEpp->numero_entrega,
                'id_entrega' => $d->entregaEpp->id,
                'fecha_entrega' => $d->entregaEpp->fecha_entrega->format('Y-m-d'),
                'motivo_entrega' => $d->entregaEpp->motivo_entrega,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => array_values($porTecnico),
        ]);
    }

    /**
     * Generar PDF de constancia de entrega
     */
    public function generarPDF($id, Request $request)
    {
        $entrega = EntregaEpp::with(['tecnico', 'registrador', 'detalles.producto'])->findOrFail($id);

        $pdf = Pdf::loadView('EntregaEppPDF', compact('entrega'))
                  ->setPaper('a4', 'portrait');

        if ($request->query('download')) {
            return $pdf->download('constancia-epp-' . $entrega->numero_entrega . '.pdf');
        }

        return $pdf->stream('constancia-epp-' . $entrega->numero_entrega . '.pdf');
    }
}
