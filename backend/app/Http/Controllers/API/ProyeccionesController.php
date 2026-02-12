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
                // Cargamos la orden con cliente, detalles y la cotización con sus detalles
                $orden = OrdenServicio::with(['cliente', 'detalles', 'cotizacion.detalles'])->find($id);
                
                if ($orden) {
                    $montoOriginal = $orden->total_costo;
                    $montoDetrax = ($montoOriginal > 700) ? ($montoOriginal * 0.12) : 0;
                    $totalFinal = $montoOriginal - $montoDetrax;

                    // 1. Obtener el primer detalle de la Orden para la FRECUENCIA
                    $primerDetalleOrden = $orden->detalles->first();
                    $frecuencia = $primerDetalleOrden->frecuencia ?? 'S/N';

                    // 2. Obtener el servicio (intentamos buscar el nombre o descripción)
                    // Si tienes una tabla 'servicios', Laravel debería jalar el nombre. 
                    // Si no, podemos intentar jalar 'descripcion_manual' de la cotización.
                    $primerDetalleCoti = $orden->cotizacion->detalles->first() ?? null;
                    $servicioNombre = $primerDetalleCoti->descripcion_manual ?? 'Servicio de Inspección'; 

                    $empresa = Multicim::find($orden->emitido_por);

                    $dataRespuesta = [
                        'id_referencia'   => $orden->id,
                        'numero_orden'    => $orden->numero_orden,
                        'actividad'       => '',
                        'alias_empresa'   => $empresa->alias_empresa ?? 'MULTI',
                        'nombre_cliente'  => $orden->cliente->nombre_empresa ?? 'S/N',
                        'servicio'        => $servicioNombre,
                        'frecuencia'      => $frecuencia,
                        'fecha_factura'   => null, 
                        'subtotal'        => round($montoOriginal / 1.18, 2),
                        'igv'             => round($montoOriginal - ($montoOriginal / 1.18), 2),
                        'precio_total_os' => round($montoOriginal, 2),
                        
                        // Campo para el Modal
                        // --- PARA COMPLETAR 
                        'n_factura'       => '', 
                        'monto_detrax'    => round($montoDetrax, 2),
                        'total_final'     => round($totalFinal, 2),
                        'dias_credito'    => null, 
                        'fecha_vcto'      => null, 
                        'fecha_pago'      => null, 
                        'dia_vencer'      => null, 
        
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
            'actividad'     => 'required|string',
            'id_multicim'   => 'required|exists:multicim,id',
            'tipo_orden'    => 'required|in:servicio,producto,capacitacion',
            'id_referencia' => 'required|integer',
            'n_factura'     => 'required|string',
            'monto_detrax'  => 'required|numeric',
            'total_final'   => 'required|numeric',
            'fecha_factura' => 'required|date',
            'dias_credito'  => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Lógica automática de fechas
        $fechaFactura = Carbon::parse($request->fecha_factura);
        $fechaVcto = $fechaFactura->copy()->addDays($request->dias_credito);
        $diaVencer = Carbon::now()->startOfDay()->diffInDays($fechaVcto, false);

        $data = $request->only(['actividad', 'id_multicim', 'n_factura', 'monto_detrax', 'total_final', 'fecha_factura', 'dias_credito']);
        $data['fecha_vcto'] = $fechaVcto->format('Y-m-d');
        $data['dia_vencer'] = (int)$diaVencer;

        // Asignar ID según el tipo
        if ($request->tipo_orden === 'servicio') $data['id_orden_servicio'] = $request->id_referencia;
        if ($request->tipo_orden === 'producto') $data['id_orden_producto'] = $request->id_referencia;
        if ($request->tipo_orden === 'capacitacion') $data['id_orden_capacitacion_auditoria'] = $request->id_referencia;

        try {
            $proyeccion = Proyeccion::create($data);
            return response()->json(['success' => true, 'message' => 'Proyección guardada', 'data' => $proyeccion], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Listar todas las Proyecciones (Para la tabla principal)
     */
    public function index(): JsonResponse
    {
        $proyecciones = Proyeccion::with(['multicimEmisora', 'ordenServicio.cliente'])
                        ->orderBy('fecha_vcto', 'asc')
                        ->get();
        return response()->json(['success' => true, 'data' => $proyecciones]);
    }
}