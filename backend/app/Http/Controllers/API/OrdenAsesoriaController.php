<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\Exponente;
use App\Models\OrdenAsesoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrdenAsesoriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OrdenAsesoria::with(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes']);

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('numero_orden', 'like', '%' . $request->search . '%')
                    ->orWhereHas('cliente', function ($q2) use ($request) {
                        $q2->where('nombre_empresa', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('modalidad')) {
            $query->where('modalidad', $request->modalidad);
        }

        if ($request->has('fecha_desde')) {
            $query->where('fecha_servicio', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->where('fecha_servicio', '<=', $request->fecha_hasta);
        }

        $ordenes = $query->orderBy('fecha_servicio', 'desc')->get();

        $data = $ordenes->map(function ($orden) {
            return [
                'id' => $orden->id,
                'numero_orden' => $orden->numero_orden,
                'id_cotizacion' => $orden->id_cotizacion,
                'id_servicio' => $orden->id_servicio,
                'fecha_servicio' => optional($orden->fecha_servicio)->format('Y-m-d'),
                'fecha_aceptacion' => optional($orden->fecha_aceptacion)->format('Y-m-d'),
                'hora_servicio' => $orden->hora_servicio ? $orden->hora_servicio->format('H:i') : null,
                'modalidad' => $orden->modalidad,
                'num_participantes' => $orden->num_participantes,
                'num_certificados' => $orden->num_certificados,
                'subtotal' => $orden->subtotal,
                'igv' => $orden->igv,
                'incluye_igv' => (bool) $orden->incluye_igv,
                'costo' => $orden->costo,
                'estado' => $orden->estado,
                'observaciones' => $orden->observaciones,
                'cliente' => $orden->cliente ? [
                    'id' => $orden->cliente->id,
                    'nombre_empresa' => $orden->cliente->nombre_empresa,
                    'ruc' => $orden->cliente->ruc,
                ] : null,
                'servicio' => $orden->servicio ? [
                    'id' => $orden->servicio->id,
                    'nombre' => $orden->servicio->nombre,
                ] : null,
                'cotizacion' => $orden->cotizacion ? [
                    'id' => $orden->cotizacion->id,
                    'numero_cotizacion' => $orden->cotizacion->numero_cotizacion,
                ] : null,
                'exponentes' => $orden->exponentes->map(fn($e) => [
                    'id' => $e->id,
                    'nombre' => trim(($e->nombre ?? '') . ' ' . ($e->apellidos ?? '')),
                    'apellidos' => $e->apellidos,
                    'especialidad' => $e->especialidad,
                ])->values(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function cotizacionesDisponibles(): JsonResponse
    {
        $cotizaciones = Cotizacion::with(['cliente'])
            ->where('tipo_cotizacion', 'Asesoria')
            ->where('estado', 'Aceptada')
            ->whereDoesntHave('ordenAsesoria')
            ->orderBy('fecha_emision', 'desc')
            ->get();

        $data = $cotizaciones->map(function ($cot) {
            return [
                'id' => $cot->id,
                'numero_cotizacion' => $cot->numero_cotizacion,
                'fecha_emision' => optional($cot->fecha_emision)->format('Y-m-d'),
                'cliente' => $cot->cliente ? [
                    'id' => $cot->cliente->id,
                    'nombre_empresa' => $cot->cliente->nombre_empresa,
                    'ruc' => $cot->cliente->ruc,
                    'direccion' => $cot->cliente->direccion,
                ] : null,
                'subtotal' => $cot->subtotal,
                'igv' => $cot->igv,
                'total' => $cot->total,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function desdeCotizacion($cotizacionId): JsonResponse
    {
        $cotizacion = Cotizacion::with(['cliente', 'detalles.servicio', 'detalles.catalogoCapAud', 'detalles.planta.areas'])
            ->find($cotizacionId);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotizacion no encontrada',
            ], 404);
        }

        if ($cotizacion->tipo_cotizacion !== 'Asesoria') {
            return response()->json([
                'success' => false,
                'message' => 'La cotizacion no es de tipo Asesoria',
            ], 400);
        }

        if ($cotizacion->estado !== 'Aceptada') {
            return response()->json([
                'success' => false,
                'message' => 'La cotizacion debe estar Aceptada',
            ], 400);
        }

        if ($cotizacion->ordenAsesoria) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotizacion ya tiene una orden de asesoria creada',
                'orden_existente' => $cotizacion->ordenAsesoria->numero_orden,
            ], 400);
        }

        $detalles = $cotizacion->detalles->map(function ($d) {
            $planta = $d->planta;
            $areaIds = $d->id_cliente_planta_area ?? [];

            if (!is_array($areaIds)) {
                $areaIds = empty($areaIds) ? [] : [$areaIds];
            }

            $areasNombres = collect($areaIds)
                ->map(function ($areaId) use ($planta) {
                    if (!$planta || !$planta->areas) {
                        return null;
                    }
                    $area = $planta->areas->firstWhere('id', $areaId);
                    return $area ? $area->nombre : null;
                })
                ->filter()
                ->values();

            $nombre = $d->catalogoCapAud
                ? $d->catalogoCapAud->nombre
                : ($d->servicio ? $d->servicio->nombre : ($d->descripcion_manual ?: 'Sin nombre'));
            return [
                'id_servicio' => $d->id_servicio,
                'id_catalogo_cap_aud' => $d->id_catalogo_cap_aud,
                'id_cliente_planta' => $d->id_cliente_planta,
                'id_cliente_planta_area' => $areaIds,
                'planta_nombre' => $planta->nombre ?? null,
                'areas_nombres' => $areasNombres,
                'nombre' => $nombre,
                'descripcion' => $d->descripcion_manual,
                'cantidad' => $d->cantidad,
                'precio_unitario' => $d->precio_unitario,
                'modalidad_sugerida' => $d->modalidad_sugerida,
                'num_participantes' => $d->num_participantes,
                'fecha_servicio' => optional($d->fecha_servicio)->format('Y-m-d'),
                'meses_implementacion' => $d->meses_implementacion,
                'frecuencia_visita' => $d->frecuencia_visita,
            ];
        });

        $primerDetalle = $cotizacion->detalles->first();
        $areaIdsPrimerDetalle = $primerDetalle?->id_cliente_planta_area ?? [];
        if (!is_array($areaIdsPrimerDetalle)) {
            $areaIdsPrimerDetalle = empty($areaIdsPrimerDetalle) ? [] : [$areaIdsPrimerDetalle];
        }
        $idClientePlanta = $primerDetalle?->id_cliente_planta ?? null;
        $idClientePlantaArea = !empty($areaIdsPrimerDetalle) ? (int) $areaIdsPrimerDetalle[0] : null;
        $exponentesIds = array_values(array_filter((array) ($cotizacion->exponentes_ids ?? []), fn($id) => !empty($id)));
        $exponentes = empty($exponentesIds)
            ? collect([])
            : Exponente::whereIn('id', $exponentesIds)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'cotizacion' => [
                    'id' => $cotizacion->id,
                    'numero_cotizacion' => $cotizacion->numero_cotizacion,
                    'fecha_emision' => optional($cotizacion->fecha_emision)->format('Y-m-d'),
                    'fecha_aceptacion' => $cotizacion->fecha_estado_cotizacion
                        ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d')
                        : null,
                    'incluye_igv' => (bool) $cotizacion->incluye_igv,
                    'subtotal' => (float) $cotizacion->subtotal,
                    'igv' => (float) $cotizacion->igv,
                    'total' => (float) $cotizacion->total,
                    'exponentes_ids' => $exponentesIds,
                    'objetivos_asesoria' => $cotizacion->objetivos_asesoria,
                ],
                'cliente' => [
                    'id' => $cotizacion->cliente->id,
                    'nombre_empresa' => $cotizacion->cliente->nombre_empresa,
                    'ruc' => $cotizacion->cliente->ruc,
                    'direccion' => $cotizacion->cliente->direccion,
                ],
                'costo_total' => (float) $cotizacion->total,
                'detalles' => $detalles,
                'exponentes' => $exponentes->map(fn($e) => [
                    'id' => $e->id,
                    'nombre' => $e->nombre,
                    'apellidos' => $e->apellidos,
                    'especialidad' => $e->especialidad,
                    'profesion' => $e->profesion,
                ])->values(),
                'servicio' => $primerDetalle ? [
                    'id' => $primerDetalle->id_servicio,
                    'id_servicio' => $primerDetalle->id_servicio,
                    'id_catalogo_cap_aud' => $primerDetalle->id_catalogo_cap_aud,
                    'nombre' => $primerDetalle->catalogoCapAud
                        ? $primerDetalle->catalogoCapAud->nombre
                        : ($primerDetalle->servicio ? $primerDetalle->servicio->nombre : ($primerDetalle->descripcion_manual ?: null)),
                    'modalidad_sugerida' => $primerDetalle->modalidad_sugerida,
                    'meses_implementacion' => $primerDetalle->meses_implementacion,
                    'frecuencia_visita' => $primerDetalle->frecuencia_visita,
                ] : null,
                'id_cliente_planta' => $idClientePlanta,
                'id_cliente_planta_area' => $idClientePlantaArea,
                'planta_nombre' => $primerDetalle?->planta?->nombre,
                'areas_nombres' => $primerDetalle?->areas_nombres ?? [],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cotizacion' => 'required|exists:cotizacion,id',
            'id_servicio' => 'nullable|exists:servicios,id',
            'exponentes' => 'nullable|array',
            'exponentes.*' => 'exists:exponentes,id',
            'fecha_servicio' => 'required|date',
            'fecha_aceptacion' => 'nullable|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'modalidad' => 'required|in:Presencial,Virtual,Híbrido,Hibrido,Asíncrona,Asincrona',
            'num_participantes' => 'required|integer|min:1',
            'num_certificados' => 'nullable|integer|min:0',
            'costo' => 'required|numeric|min:0',
            'incluye_igv' => 'nullable|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
        ]);

        if (!empty($validated['modalidad'])) {
            $validated['modalidad'] = match ($validated['modalidad']) {
                'Hibrido' => 'Híbrido',
                'Asincrona' => 'Asíncrona',
                default => $validated['modalidad'],
            };
        }

        $cotizacion = Cotizacion::with('detalles.servicio')->find($validated['id_cotizacion']);

        if ($cotizacion->tipo_cotizacion !== 'Asesoria') {
            return response()->json([
                'success' => false,
                'message' => 'La cotizacion debe ser de tipo Asesoria',
            ], 400);
        }

        if ($cotizacion->ordenAsesoria) {
            return response()->json([
                'success' => false,
                'message' => 'Esta cotizacion ya tiene una orden',
            ], 400);
        }

        $incluyeIgv = $validated['incluye_igv'] ?? true;
        $subtotal = $validated['costo'];
        $igv = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
        $total = $subtotal + $igv;

        $validated['fecha_aceptacion'] = $cotizacion->fecha_estado_cotizacion
            ? $cotizacion->fecha_estado_cotizacion->format('Y-m-d')
            : ($validated['fecha_aceptacion'] ?? optional($cotizacion->fecha_emision)->format('Y-m-d'));

        $exponenteIds = $validated['exponentes'] ?? [];
        $primerDetalle = $cotizacion->detalles->first();
        $areaIdsPrimerDetalle = $primerDetalle?->id_cliente_planta_area ?? [];
        if (!is_array($areaIdsPrimerDetalle)) {
            $areaIdsPrimerDetalle = empty($areaIdsPrimerDetalle) ? [] : [$areaIdsPrimerDetalle];
        }
        $idClientePlanta = $primerDetalle?->id_cliente_planta ?? null;
        $idClientePlantaArea = !empty($areaIdsPrimerDetalle) ? (int) $areaIdsPrimerDetalle[0] : null;

        try {
            DB::beginTransaction();

            $orden = OrdenAsesoria::create([
                'numero_orden' => OrdenAsesoria::generarNumero(),
                'id_cotizacion' => $validated['id_cotizacion'],
                'id_cliente' => $cotizacion->id_cliente,
                'id_cliente_planta' => $idClientePlanta,
                'id_cliente_planta_area' => $idClientePlantaArea,
                'id_servicio' => $validated['id_servicio'] ?? null,
                'id_exponente' => !empty($exponenteIds) ? $exponenteIds[0] : null,
                'fecha_servicio' => $validated['fecha_servicio'],
                'fecha_aceptacion' => $validated['fecha_aceptacion'] ?? null,
                'hora_servicio' => $validated['hora_servicio'] ?? null,
                'modalidad' => $validated['modalidad'],
                'num_participantes' => $validated['num_participantes'],
                'num_certificados' => $validated['num_certificados'] ?? 0,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'incluye_igv' => $incluyeIgv,
                'costo' => $total,
                'emitido_por' => $request->user()?->id,
                'estado' => $validated['estado'] ?? 'Aprobado',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            if (!empty($exponenteIds)) {
                $orden->exponentes()->sync($exponenteIds);
            }

            foreach ($cotizacion->detalles as $detalle) {
                $nombre = $detalle->servicio ? $detalle->servicio->nombre : ($detalle->descripcion_manual ?: 'Detalle');
                $descripcion = $detalle->descripcion_manual;
                if (!$descripcion) {
                    $descripcion = 'Cantidad: ' . ($detalle->cantidad ?? 1) . ' | Precio Unitario: S/ ' . number_format((float) ($detalle->precio_unitario ?? 0), 2);
                }
                $orden->detalles()->create([
                    'item' => $nombre,
                    'descripcion' => $descripcion,
                ]);
            }

            DB::commit();

            $orden->load(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'detalles']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de asesoria creada exitosamente',
                'data' => $orden,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $orden = OrdenAsesoria::with(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'detalles'])
            ->find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de asesoria no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $orden,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $orden = OrdenAsesoria::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de asesoria no encontrada',
            ], 404);
        }

        $validated = $request->validate([
            'id_servicio' => 'nullable|exists:servicios,id',
            'exponentes' => 'sometimes|array',
            'exponentes.*' => 'exists:exponentes,id',
            'fecha_servicio' => 'sometimes|date',
            'fecha_aceptacion' => 'nullable|date',
            'hora_servicio' => 'nullable|date_format:H:i',
            'modalidad' => 'sometimes|in:Presencial,Virtual,Híbrido,Hibrido,Asíncrona,Asincrona',
            'num_participantes' => 'sometimes|integer|min:1',
            'num_certificados' => 'nullable|integer|min:0',
            'costo' => 'sometimes|numeric|min:0',
            'incluye_igv' => 'nullable|boolean',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
            'observaciones' => 'nullable|string',
        ]);

        if (!empty($validated['modalidad'])) {
            $validated['modalidad'] = match ($validated['modalidad']) {
                'Hibrido' => 'Híbrido',
                'Asincrona' => 'Asíncrona',
                default => $validated['modalidad'],
            };
        }

        if (isset($validated['costo']) || isset($validated['incluye_igv'])) {
            $subtotal = $validated['costo'] ?? (float) $orden->subtotal;
            $incluyeIgv = $validated['incluye_igv'] ?? (bool) $orden->incluye_igv;
            $validated['subtotal'] = $subtotal;
            $validated['igv'] = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
            $validated['costo'] = $subtotal + $validated['igv'];
            $validated['incluye_igv'] = $incluyeIgv;
        }

        try {
            DB::beginTransaction();

            if (isset($validated['exponentes'])) {
                $exponenteIds = $validated['exponentes'];
                $orden->exponentes()->sync($exponenteIds);
                $validated['id_exponente'] = !empty($exponenteIds) ? $exponenteIds[0] : null;
                unset($validated['exponentes']);
            }

            $orden->update($validated);

            DB::commit();

            $orden->load(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'detalles']);

            return response()->json([
                'success' => true,
                'message' => 'Orden de asesoria actualizada exitosamente',
                'data' => $orden,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la orden',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        $orden = OrdenAsesoria::find($id);

        if (!$orden) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de asesoria no encontrada',
            ], 404);
        }

        try {
            $orden->delete();

            return response()->json([
                'success' => true,
                'message' => 'Orden de asesoria eliminada exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la orden de asesoria',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total_ordenes' => OrdenAsesoria::count(),
            'total_valor' => OrdenAsesoria::sum('costo'),
            'total_participantes' => OrdenAsesoria::sum('num_participantes'),
            'ordenes_mes_actual' => OrdenAsesoria::whereMonth('fecha_servicio', date('m'))
                ->whereYear('fecha_servicio', date('Y'))
                ->count(),
            'valor_mes_actual' => OrdenAsesoria::whereMonth('fecha_servicio', date('m'))
                ->whereYear('fecha_servicio', date('Y'))
                ->sum('costo'),
            'siguiente_numero' => OrdenAsesoria::generarNumero(),
            'por_modalidad' => OrdenAsesoria::select('modalidad', DB::raw('count(*) as total'))
                ->groupBy('modalidad')
                ->get(),
            'por_estado' => OrdenAsesoria::select('estado', DB::raw('count(*) as total'))
                ->groupBy('estado')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function descargarPdf($id)
    {
        $orden = OrdenAsesoria::with(['cliente', 'cotizacion', 'servicio', 'exponente', 'exponentes', 'detalles', 'emisor'])
            ->findOrFail($id);

        $pdf = Pdf::loadView('OrdenAsesoriaPDF', compact('orden'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Orden_Asesoria_' . $orden->numero_orden . '.pdf');
    }
}
