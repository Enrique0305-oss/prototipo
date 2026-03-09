<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Multicim;

class CotizacionController extends Controller
{
    /**
     * Listar todas las cotizaciones
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cotizacion::with(['cliente', 'creador', 'empresa']);

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('tipo')) {
            $query->porTipo($request->tipo);
        }

        if ($request->has('search')) {
            $query->buscar($request->search);
        }

        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha_emision', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha_emision', '<=', $request->fecha_hasta);
        }

        // Ordenar
        $query->orderBy('fecha_emision', 'desc');

        $cotizaciones = $query->get();

        // Formatear respuesta
        $data = $cotizaciones->map(function($cot) {
            return [
                'id' => $cot->id,
                'numero' => $cot->numero_cotizacion,
                'empresa_emisora' => $cot->empresa->alias_empresa ?? 'N/A',
                'id_cliente' => $cot->id_cliente,
                'cliente_nombre' => $cot->cliente->nombre_empresa ?? 'N/A',
                'fecha_emision' => $cot->fecha_emision->format('Y-m-d'),
                'tipo' => $cot->tipo_cotizacion,
                'subtotal' => (float) $cot->subtotal,
                'igv' => (float) $cot->igv,
                'total' => (float) $cot->total,
                'incluye_igv' => (bool) $cot->incluye_igv,
                'observaciones' => $cot->observaciones,
                'estado' => $cot->estado,
                'creador' => $cot->creador->nombre_completo ?? 'N/A'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Obtener una cotización específica
     */
    public function show($id): JsonResponse
    {
        $cotizacion = Cotizacion::with(['cliente', 'creador', 'detalles.servicio', 'detalles.producto', 'detalles.catalogoCapAud', 'detalles.planta', 'detalles.area'])
                                ->find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cotizacion
        ]);
    }

    /**
     * Crear una nueva cotización
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_cliente' => 'required|exists:cliente,id',
            'id_multicim' => 'required|exists:multicim,id',
            'tipo_cotizacion' => 'required|in:Servicio,Producto,Capacitacion',
            'incluye_igv' => 'sometimes|boolean',
            'observaciones' => 'nullable|string',
            'propuesta_tecnica' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_servicio' => 'nullable|exists:servicios,id',
            'detalles.*.id_producto' => 'nullable|exists:productos,id',
            'detalles.*.id_catalogo_cap_aud' => 'nullable|exists:catalogo_capacitacion_auditoria,id',
            'detalles.*.descripcion_manual' => 'nullable|string',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.frecuencia_sugerida' => 'nullable|string',
            'detalles.*.modalidad_sugerida' => 'nullable|string',
            'detalles.*.id_cliente_planta' => 'nullable|integer|exists:cliente_planta,id',
            'detalles.*.id_cliente_planta_area' => 'nullable|integer|exists:cliente_planta_area,id',
        ]);

        DB::beginTransaction();
        try {
            // Calcular totales
            $subtotal = 0;
            foreach ($validated['detalles'] as $detalle) {
                $subtotal += $detalle['cantidad'] * $detalle['precio_unitario'];
            }

            $incluyeIgv = $validated['incluye_igv'] ?? true;
            $igv = $incluyeIgv ? round($subtotal * 0.18, 2) : 0;
            $total = $subtotal + $igv;

            // Observación automática si no incluye IGV
            $observaciones = $validated['observaciones'] ?? null;
            if (!$incluyeIgv && empty($observaciones)) {
                $observaciones = 'Esta cotización no incluye IGV.';
            } elseif (!$incluyeIgv && $observaciones) {
                $observaciones = $observaciones . ' | Nota: Esta cotización no incluye IGV.';
            }

            // Crear cotización
            $cotizacion = Cotizacion::create([
                'numero_cotizacion' => Cotizacion::generarNumero(),
                'id_cliente' => $validated['id_cliente'],
                'id_multicim' => $validated['id_multicim'],
                'fecha_emision' => now(),
                'id_personal_creador' => auth()->id() ?? 1,
                'estado' => 'Pendiente',
                'tipo_cotizacion' => $validated['tipo_cotizacion'],
                'incluye_igv' => $incluyeIgv,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'observaciones' => $observaciones,
                'propuesta_tecnica' => $validated['propuesta_tecnica'] ?? null,
            ]);

            // Crear detalles
            foreach ($validated['detalles'] as $detalle) {
                CotizacionDetalle::create([
                    'id_cotizacion' => $cotizacion->id,
                    'id_servicio' => $detalle['id_servicio'] ?? null,
                    'id_producto' => $detalle['id_producto'] ?? null,
                    'id_catalogo_cap_aud' => $detalle['id_catalogo_cap_aud'] ?? null,
                    'descripcion_manual' => $detalle['descripcion_manual'] ?? null,
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'frecuencia_sugerida' => $detalle['frecuencia_sugerida'] ?? null,
                    'modalidad_sugerida' => $detalle['modalidad_sugerida'] ?? null,
                    'id_cliente_planta' => $detalle['id_cliente_planta'] ?? null,
                    'id_cliente_planta_area' => $detalle['id_cliente_planta_area'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cotización creada exitosamente',
                'data' => $cotizacion->load('detalles', 'empresa')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la cotización: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar estado de cotización
     */
    public function updateEstado(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'estado' => 'required|in:Pendiente,Aceptada,Rechazada'
        ]);

        $cotizacion = Cotizacion::find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        $cotizacion->update(['estado' => $validated['estado']]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'data' => $cotizacion
        ]);
    }

    /**
     * Obtener estadísticas de cotizaciones
     */
    public function estadisticas(): JsonResponse
    {
        $stats = [
            'total' => Cotizacion::count(),
            'pendientes' => Cotizacion::pendientes()->count(),
            'aceptadas' => Cotizacion::aceptadas()->count(),
            'rechazadas' => Cotizacion::rechazadas()->count(),
            'valor_total' => (float) Cotizacion::sum('total'),
            'valor_pendiente' => (float) Cotizacion::pendientes()->sum('total'),
            'siguiente_numero' => Cotizacion::generarNumero(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Eliminar cotización
     */
    public function destroy($id): JsonResponse
    {
        $cotizacion = Cotizacion::find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        // Solo se pueden eliminar cotizaciones pendientes
        if ($cotizacion->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden eliminar cotizaciones en estado Pendiente'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $cotizacion->detalles()->delete();
            $cotizacion->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cotización eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la cotización'
            ], 500);
        }
    }

    /**
     * Alerta de cotizaciones aceptadas sin orden generada
     */
    public function alertaCotizacionesSinOrden(): JsonResponse
    {
        $producto = Cotizacion::where('estado', 'Aceptada')
            ->where('tipo_cotizacion', 'Producto')
            ->whereDoesntHave('ordenProducto')
            ->count();

        $servicio = Cotizacion::where('estado', 'Aceptada')
            ->where('tipo_cotizacion', 'Servicio')
            ->whereDoesntHave('ordenServicio')
            ->count();

        $capacitacion = Cotizacion::where('estado', 'Aceptada')
            ->where('tipo_cotizacion', 'Capacitacion')
            ->whereDoesntHave('ordenCapacitacionAuditoria')
            ->count();

        $total = $producto + $servicio + $capacitacion;

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'producto' => $producto,
                'servicio' => $servicio,
                'capacitacion' => $capacitacion,
            ]
        ]);
    }

    /**
     * Generar PDF de cotización
     */
    public function generarPDF($id, Request $request)
    {
        $cotizacion = Cotizacion::with(['cliente', 'empresa', 'detalles.servicio', 'detalles.producto', 'detalles.catalogoCapAud', 'creador'])
                                ->find($id);

        if (!$cotizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Cotización no encontrada'
            ], 404);
        }

        $pdf = Pdf::loadView('CotizacionPDF', compact('cotizacion'))
                  ->setPaper('a4', 'portrait');

        // Si se pasa parámetro descargar=true, descarga automáticamente
        // Si no, muestra en navegador
        if ($request->get('descargar') === 'true') {
            return $pdf->download('cotizacion-' . $cotizacion->numero_cotizacion . '.pdf');
        }

        return $pdf->stream('cotizacion-' . $cotizacion->numero_cotizacion . '.pdf');
    }
}
