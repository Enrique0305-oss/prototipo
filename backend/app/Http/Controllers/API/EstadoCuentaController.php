<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\EstadoCuenta;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\Controller;

class EstadoCuentaController extends Controller
{
    public function index(Request $request)
    {
        $cuenta = $request->query('cuenta');
        
        $query = EstadoCuenta::orderBy('fecha', 'asc')->orderBy('id', 'asc');
        
        if ($cuenta) {
            $query->where('cuenta', $cuenta);
        }
        
        $movimientos = $query->get();

        // Calculate saldos over the chronological list
        $saldoActual = 0;
        foreach ($movimientos as $mov) {
            if ($mov->tipo_movimiento === 'Ingreso' || $mov->tipo_movimiento === 'Saldo inicial') {
                $saldoActual += $mov->monto;
            } else if ($mov->tipo_movimiento === 'Egreso') {
                $saldoActual -= $mov->monto;
            }
            $mov->saldo_actual = $saldoActual;
        }

        return response()->json([
            'success' => true,
            'data' => $movimientos,
            'saldo_actual' => $saldoActual
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cuenta' => 'required|in:Multi,CIM',
            'fecha' => 'required|date',
            'tipo_movimiento' => 'required|in:Ingreso,Egreso,Saldo inicial',
            'monto' => 'required|numeric|min:0',
            'registrado_por' => 'nullable|string'
        ]);

        $movimiento = EstadoCuenta::create([
            'cuenta' => $request->cuenta,
            'fecha' => $request->fecha,
            'tipo_movimiento' => $request->tipo_movimiento,
            'descripcion' => $request->descripcion,
            'detalle' => $request->detalle,
            'factura_doc' => $request->factura_doc,
            'monto' => $request->monto,
            'registrado_por' => $request->registrado_por,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Movimiento registrado correctamente',
            'data' => $movimiento
        ]);
    }
}
