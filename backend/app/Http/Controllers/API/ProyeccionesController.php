<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proyeccion;
use App\Models\OrdenServicio;
use App\Models\OrdenProducto;
use App\Models\OrdenCapacitacionAuditoria;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ProyeccionController extends Controller
{
    /**
     * PASO 1: Buscar la orden para el Modal
     * GET /api/v1/proyecciones/buscar-orden/{tipo}/{id}
     */
    public function obtenerDatosOrden($tipo, $id): JsonResponse
    {
        $orden = null;
        $montoOriginal = 0;
        $montoDetrax = 0;
        $totalFinal = 0;
        $actividad = "";

        switch ($tipo) {
            case 'servicio':
                $orden = OrdenServicio::with('cliente')->find($id);
                if ($orden) {
                    $montoOriginal = $orden->total_costo;
                    $actividad = "Servicio: " . ($orden->cliente->nombre_comercial ?? 'S/N');
                    // Regla 700 soles (12%)
                    if ($montoOriginal > 700) {
                        $montoDetrax = $montoOriginal * 0.12;
                        $totalFinal = $montoOriginal - $montoDetrax;
                    } else {
                        $totalFinal = $montoOriginal;
                    }
                }
                break;

            case 'capacitacion':
                $orden = OrdenCapacitacionAuditoria::with('cliente')->find($id);
                if ($orden) {
                    $montoOriginal = $orden->costo;
                    $actividad = "Capacitación: " . ($orden->cliente->nombre_comercial ?? 'S/N');
                    // Regla 700 soles (12%)
                    if ($montoOriginal > 700) {
                        $montoDetrax = $montoOriginal * 0.12;
                        $totalFinal = $montoOriginal - $montoDetrax;
                    } else {
                        $totalFinal = $montoOriginal;
                    }
                }
                break;

            case 'producto':
                $orden = OrdenProducto::with('cliente')->find($id);
                if ($orden) {
                    $montoOriginal = $orden->total;
                    $actividad = "Producto: " . ($orden->cliente->nombre_comercial ?? 'S/N');
                    // Regla Producto: No hay detracción, total final es igual al original
                    $montoDetrax = 0;
                    $totalFinal = $montoOriginal;
                }
                break;
        }

        if (!$orden) {
            return response()->json(['success' => false, 'message' => 'Orden no encontrada'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'actividad' => $actividad,
                'numero_orden' => $orden->numero_orden,
                'monto_total_orden' => round($montoOriginal, 2),
                'monto_detrax' => round($montoDetrax, 2),
                'total_final' => round($totalFinal, 2),
                'id_referencia' => $orden->id
            ]
        ]);
    }

    /**
     * PASO 2: Guardar la Proyección (Facturación)
     * POST /api/v1/proyecciones
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validación
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

        // 2. Lógica de Fechas automática
        $fechaFactura = Carbon::parse($request->fecha_factura);
        $fechaVcto = $fechaFactura->copy()->addDays($request->dias_credito);
        
        // Calcular dia_vencer (Hoy vs Vencimiento)
        $hoy = Carbon::now()->startOfDay();
        $diaVencer = $hoy->diffInDays($fechaVcto, false);

        // 3. Preparar datos para el Modelo
        $data = $request->only([
            'actividad', 'id_multicim', 'n_factura', 
            'monto_detrax', 'total_final', 'fecha_factura', 'dias_credito'
        ]);
        
        $data['fecha_vcto'] = $fechaVcto->format('Y-m-d');
        $data['dia_vencer'] = (int)$diaVencer;

        // Asignar el ID a la columna correcta de la BD
        if ($request->tipo_orden === 'servicio') {
            $data['id_orden_servicio'] = $request->id_referencia;
        } elseif ($request->tipo_orden === 'producto') {
            $data['id_orden_producto'] = $request->id_referencia;
        } elseif ($request->tipo_orden === 'capacitacion') {
            $data['id_orden_capacitacion_auditoria'] = $request->id_referencia;
        }

        // 4. Ejecutar Guardado
        try {
            $proyeccion = Proyeccion::create($data);
            return response()->json([
                'success' => true,
                'message' => 'Factura proyectada con éxito',
                'data' => $proyeccion
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar todas las proyecciones (Para tu tabla principal)
     * GET /api/v1/proyecciones
     */
    public function index(): JsonResponse
    {
        $proyecciones = Proyeccion::with('multicimEmisora')->orderBy('fecha_vcto', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $proyecciones
        ]);
    }
}