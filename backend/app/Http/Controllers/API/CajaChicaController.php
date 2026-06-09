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
        $movimientos = CajaChica::orderBy('id', 'desc')->get();
        
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
            'registrado_por' => \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::user()->name : ($validated['registrado_por'] ?? 'Sistema')
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Movimiento registrado correctamente',
            'data' => $caja
        ], 201);
    }
    
    public function destroy($id)
    {
        $caja = CajaChica::find($id);
        if (!$caja) {
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        }
        
        $caja->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Movimiento eliminado'
        ]);
    }
}
