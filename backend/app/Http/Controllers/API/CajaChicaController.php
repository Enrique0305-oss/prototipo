<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CajaChica;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CajaChicaController extends Controller
{
    public function index(Request $request)
    {
        // Ordenamos por ID descendente para mostrar los más recientes arriba
        $movimientos = CajaChica::with('detalles')->orderBy('id', 'desc')->get();
        
        $ultimo = CajaChica::orderBy('id', 'desc')->first();
        $saldoActual = $ultimo ? $ultimo->saldo_actual : 0;

        return response()->json([
            'success' => true,
            'data' => $movimientos,
            'saldo_actual' => $saldoActual
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'tipo_movimiento' => 'required|in:Ingreso,Egreso',
            'solicitante' => 'nullable|string',
            'area' => 'nullable|string',
            'proveedor' => 'nullable|string',
            'documento' => 'nullable|string',
            'concepto' => 'required|string',
            'tipo_dinero' => 'nullable|string',
            'numero_operacion' => 'nullable|string',
            'subtotal' => 'nullable|numeric',
            'registrado_por' => 'nullable|string',
            'detalles' => 'nullable|array',
            'detalles.*.concepto' => 'required_with:detalles|string',
            'detalles.*.monto' => 'required_with:detalles|numeric',
        ]);

        $monto = $request->input('subtotal', 0);
        $monto = (float) $monto;

        // Obtenemos el último registro insertado
        $ultimo = CajaChica::orderBy('id', 'desc')->first();
        $saldoAnterior = $ultimo ? (float) $ultimo->saldo_actual : 0.0;

        $ingreso = 0;
        $egreso = 0;

        if ($validated['tipo_movimiento'] === 'Ingreso') {
            $ingreso = $monto;
            $saldoActual = $saldoAnterior + $monto;
        } else {
            $egreso = $monto;
            $saldoActual = $saldoAnterior - $monto;
        }

        $caja = CajaChica::create(array_merge($validated, [
            'ingreso' => $ingreso,
            'egreso' => $egreso,
            'saldo_actual' => $saldoActual,
            'registrado_por' => \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::user()->nombre : ($validated['registrado_por'] ?? 'Sistema')
        ]));

        if (isset($validated['detalles']) && count($validated['detalles']) > 0) {
            foreach ($validated['detalles'] as $detalle) {
                $caja->detalles()->create([
                    'concepto' => $detalle['concepto'],
                    'monto' => $detalle['monto'],
                ]);
            }
        }
        
        $caja->load('detalles');

        return response()->json([
            'success' => true,
            'message' => 'Movimiento registrado correctamente',
            'data' => $caja
        ], 201);
    }
    
    public function update(Request $request, $id)
    {
        $caja = CajaChica::find($id);
        if (!$caja) {
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        }

        $validated = $request->validate([
            'tipo_movimiento' => 'nullable|string|in:Ingreso,Egreso',
            'fecha' => 'nullable|date',
            'solicitante' => 'nullable|string',
            'area' => 'nullable|string',
            'concepto' => 'required|string',
            'proveedor' => 'nullable|string', 
            'documento' => 'nullable|string', 
            'tipo_dinero' => 'nullable|string', 
            'numero_operacion' => 'nullable|string',
            'ingreso' => 'nullable|numeric',
            'egreso' => 'nullable|numeric',
        ]);

        $valoresAnteriores = $caja->toArray();

        $caja->tipo_movimiento = $validated['tipo_movimiento'] ?? $caja->tipo_movimiento;
        $caja->fecha = $validated['fecha'] ?? $caja->fecha;
        $caja->solicitante = $validated['solicitante'] ?? $caja->solicitante;
        $caja->area = $validated['area'] ?? $caja->area;
        $caja->concepto = $validated['concepto'] ?? $caja->concepto;
        $caja->proveedor = $validated['proveedor'] ?? $caja->proveedor;
        $caja->documento = $validated['documento'] ?? $caja->documento;
        $caja->tipo_dinero = $validated['tipo_dinero'] ?? $caja->tipo_dinero;
        $caja->numero_operacion = $validated['numero_operacion'] ?? $caja->numero_operacion;
        
        // Determinar montos en base al tipo de movimiento actualizado
        $montoRecibido = $request->input('ingreso') ?? $request->input('egreso');
        $monto = $montoRecibido !== null ? (float) $montoRecibido : ((float)$caja->ingreso > 0 ? (float)$caja->ingreso : (float)$caja->egreso);

        $nuevoIngreso = 0;
        $nuevoEgreso = 0;

        if ($caja->tipo_movimiento === 'Ingreso') {
            $nuevoIngreso = $monto;
        } else {
            $nuevoEgreso = $monto;
        }
        
        $diferencia = 0;
        
        // Si cambió el ingreso o egreso, calcular diferencia y afectar el saldo
        if ($nuevoIngreso !== (float)$caja->ingreso || $nuevoEgreso !== (float)$caja->egreso) {
            // El impacto al saldo de este registro
            $impactoViejo = (float)$caja->ingreso - (float)$caja->egreso;
            $impactoNuevo = $nuevoIngreso - $nuevoEgreso;
            $diferencia = $impactoNuevo - $impactoViejo;

            $caja->ingreso = $nuevoIngreso;
            $caja->egreso = $nuevoEgreso;
            $caja->saldo_actual = (float)$caja->saldo_actual + $diferencia;
        }

        $caja->save();

        // 1. Manejar Detalles (si se envían)
        if ($request->has('detalles')) {
            $caja->detalles()->delete();
            foreach ($request->input('detalles') as $detalle) {
                if (!empty($detalle['concepto']) && isset($detalle['monto'])) {
                    $caja->detalles()->create([
                        'concepto' => $detalle['concepto'],
                        'monto' => $detalle['monto'],
                    ]);
                }
            }
        }

        // 2. Guardar Historial de Auditoría
        $usuarioEditor = \Illuminate\Support\Facades\Auth::user();
        \App\Models\CajaChicaHistorial::create([
            'caja_chica_id' => $caja->id,
            'usuario_id' => $usuarioEditor ? $usuarioEditor->id : null,
            'valores_anteriores' => $valoresAnteriores,
            'valores_nuevos' => $caja->toArray(),
        ]);

        // 3. Recalcular saldos posteriores (Efecto dominó)
        if ($diferencia !== 0) {
            $posteriores = CajaChica::where('id', '>', $caja->id)->orderBy('id', 'asc')->get();
            foreach ($posteriores as $post) {
                $post->saldo_actual = (float)$post->saldo_actual + $diferencia;
                $post->save();
            }
        }

        // 3. Notificar a Gerencia
        $users = \App\Models\Personal::whereHas('area', function($query) {
            $query->where('nombre', 'like', '%Gerencia%');
        })->get();
        $nombreEditor = $usuarioEditor ? $usuarioEditor->nombre : 'Un usuario';
        
        $dataNotificacion = [
            'titulo' => 'Edición en Caja Chica',
            'mensaje' => "{$nombreEditor} modificó el registro #{$caja->id} (Concepto: {$caja->concepto}).",
            'caja_chica_id' => $caja->id
        ];

        foreach ($users as $user) {
            if ($usuarioEditor && $user->id === $usuarioEditor->id) continue;
            // Se asume el uso de Database Notifications genéricas o creamos una alerta directa
            DB::table('notifications')->insert([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'type' => 'App\Notifications\CajaChicaEditada',
                'notifiable_type' => 'App\Models\Personal',
                'notifiable_id' => $user->id,
                'data' => json_encode($dataNotificacion),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $caja->load('detalles');

        return response()->json([
            'success' => true,
            'message' => 'Registro modificado exitosamente. Saldos recalculados.',
            'data' => $caja
        ]);
    }
    
    public function destroy($id)
    {
        $caja = CajaChica::find($id);
        if (!$caja) {
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        }
        
        // Recalcular saldos posteriores al eliminar
        $impactoViejo = (float)$caja->ingreso - (float)$caja->egreso;
        $diferencia = -$impactoViejo;
        
        $posteriores = CajaChica::where('id', '>', $caja->id)->orderBy('id', 'asc')->get();
        
        $caja->delete();

        if ($diferencia !== 0) {
            foreach ($posteriores as $post) {
                $post->saldo_actual = (float)$post->saldo_actual + $diferencia;
                $post->save();
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Movimiento eliminado y saldos recalculados'
        ]);
    }

    public function historial($id)
    {
        $historial = \App\Models\CajaChicaHistorial::with('usuario')
            ->where('caja_chica_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $historial
        ]);
    }
}
