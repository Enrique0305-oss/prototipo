<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proyeccion;
use App\Models\OrdenServicio;
use App\Models\OrdenProducto;
use App\Models\OrdenCapacitacionAuditoria;
use App\Models\Multicim;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ProyeccionesController extends Controller
{
/**
     * PASO 1: Buscar datos para el Modal (Autocompletado Multitabla)
     * GET /api/v1/proyecciones/buscar-orden/{tipo}/{id}
     */
    public function obtenerDatosOrden($tipo, $id): JsonResponse
    {
        $orden = null;
        $dataRespuesta = [];

        switch ($tipo) {
            case 'servicio':
                // Cargamos la orden con sus detalles y la relación servicio de cada detalle
                $orden = OrdenServicio::with(['cliente', 'detalles.servicio', 'cotizacion'])->find($id);
                
                if ($orden) {
                    $montoOriginal = $orden->total_costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $totalFinal = $montoOriginal - $montoDetrax;

                    // --- SOLUCIÓN PARA MÚLTIPLES SERVICIOS ---
                    // Extraemos los nombres de todos los servicios vinculados y los unimos con una coma
                    $serviciosArray = $orden->detalles->map(function($det) {
                        return $det->servicio ? $det->servicio->nombre : 'Servicio';
                    })->unique()->toArray(); // unique() para no repetir si es el mismo servicio en varios locales

                    $servicioNombre = implode(', ', $serviciosArray);

                    // Si por alguna razón no hay servicios en detalles, intentamos con la descripción de la cotización
                    if (empty($servicioNombre)) {
                        $servicioNombre = $orden->cotizacion->detalles->first()->descripcion_manual ?? 'Servicio de Inspección';
                    }
                    // -----------------------------------------

                    $empresa = Multicim::find($orden->emitido_por);

                    $dataRespuesta = [
                        'id_referencia'   => $orden->id,
                        'numero_orden'    => $orden->numero_orden,
                        'actividad'       => "Servicio: " . $servicioNombre,
                        'alias_empresa'   => $empresa->alias_empresa ?? 'MULTI',
                        'nombre_cliente'  => $orden->cliente->nombre_empresa ?? 'S/N',
                        'servicio'        => $servicioNombre, // Esto llenará tu input de "Servicio"
                        'frecuencia'      => 'pendiente',
                        'subtotal'        => round($montoOriginal / 1.18, 2),
                        'igv'             => round($montoOriginal - ($montoOriginal / 1.18), 2),
                        'precio_total_os' => round($montoOriginal, 2),
                        'monto_detrax'    => round($montoDetrax, 2),
                        'total_final'     => round($totalFinal, 2),
                    ];
                }
                break;
            case 'producto':
                $orden = OrdenProducto::with(['cliente'])->find($id);
                if ($orden) {
                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_comercial ?? 'S/N',
                        'monto_detrax'  => 0,
                        'total_final'   => $orden->total,
                        'actividad'     => "Venta de Producto - " . ($orden->cliente->nombre_comercial ?? '')
                    ];
                }
                break;

            case 'capacitacion':
                $orden = OrdenCapacitacionAuditoria::with(['cliente'])->find($id);
                if ($orden) {
                    $montoOriginal = $orden->costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $dataRespuesta = [
                        'id_referencia' => $orden->id,
                        'numero_orden'  => $orden->numero_orden,
                        'nombre_cliente'=> $orden->cliente->nombre_comercial ?? 'S/N',
                        'monto_detrax'  => round($montoDetrax, 2),
                        'total_final'   => round($montoOriginal - $montoDetrax, 2),
                        'actividad'     => "Capacitación - " . ($orden->cliente->nombre_comercial ?? '')
                    ];
                }
                break;
        }

        if (!$orden) {
            return response()->json(['success' => false, 'message' => 'Orden no encontrada'], 404);
        }

        return response()->json(['success' => true, 'data' => $dataRespuesta]);
    }

    /**
     * PASO 2: Guardar la Proyección
     * POST /api/v1/proyecciones
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_multicim'   => 'required|exists:multicim,id',
            'tipo_orden'    => 'required|in:servicio,producto,capacitacion',
            'id_referencia' => 'required|integer',
            'actividad'     => 'required|string',
            'monto_detrax'  => 'required|numeric',
            'total_final'   => 'required|numeric',
            'n_factura'     => 'nullable|string',
            'fecha_factura' => 'nullable|date',
            'dias_credito'  => 'nullable|integer',
            'fecha_pago'    => 'nullable|date',
            'fecha_ejecucion' => 'nullable|date', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Lógica de fechas (igual que la tienes)...
        $fechaVcto = null;
        $diaVencer = null;
        if ($request->filled('fecha_factura')) {
            $fechaFactura = Carbon::parse($request->fecha_factura);
            $dias = $request->dias_credito ?? 0;
            $fechaVcto = $fechaFactura->copy()->addDays($dias);
            $diaVencer = (int) Carbon::now()->startOfDay()->diffInDays($fechaVcto, false);
        }

        // SOLO CAMPOS QUE EXISTEN EN TU IMAGEN DE BD
        $data = [
            'actividad'     => $request->actividad,
            'id_multicim'   => $request->id_multicim,
            'n_factura'     => $request->n_factura,
            'monto_detrax'  => $request->monto_detrax,
            'total_final'   => $request->total_final,
            'fecha_factura' => $request->fecha_factura,
            'dias_credito'  => $request->dias_credito,
            'fecha_pago'    => $request->fecha_pago,
            'fecha_vcto'    => $fechaVcto ? $fechaVcto->format('Y-m-d') : null,
            'dia_vencer'    => $diaVencer,
        ];

        // Asignación de ID según tipo
        if ($request->tipo_orden === 'servicio') $data['id_orden_servicio'] = $request->id_referencia;
        if ($request->tipo_orden === 'producto') $data['id_orden_producto'] = $request->id_referencia;
        if ($request->tipo_orden === 'capacitacion') $data['id_orden_capacitacion_auditoria'] = $request->id_referencia;

        $proyeccion = Proyeccion::create($data);
        return response()->json(['success' => true, 'data' => $proyeccion]);
    }

    /**
     * Listar todas las Proyecciones (Para la tabla principal)
     */
    public function index(): JsonResponse
    {
        $proyecciones = Proyeccion::with([
            'multicimEmisora', 
            'ordenServicio.cliente', 
            'ordenServicio.detalles.servicio',
            'ordenProducto.cliente', 
            'ordenCapacitacion.cliente'
        ])
        ->orderBy('fecha_vcto', 'asc')
        ->get();
        
        return response()->json(['success' => true, 'data' => $proyecciones]);
    }
}