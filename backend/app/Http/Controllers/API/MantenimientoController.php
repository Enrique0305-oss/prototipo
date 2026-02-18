<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mantenimiento;
use App\Models\Equipo;
use App\Models\ActividadMantenimiento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MantenimientoController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $query = Mantenimiento::with(['equipo', 'actividad']);

        // Filtro por equipo
        if ($request->has('id_equipo')) {
            $query->where('id_equipo', $request->id_equipo);
        }

        // Filtro por actividad
        if ($request->has('id_actividad')) {
            $query->where('id_actmanten', $request->id_actividad);
        }

        // Filtro por rango de fechas
        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        // Filtro por mes y año
        if ($request->has('mes')) {
            $query->whereMonth('fecha', $request->mes);
        }

        if ($request->has('anio')) {
            $query->whereYear('fecha', $request->anio);
        }

        // Ordenamiento
        $orden = $request->get('orden', 'recientes');
        if ($orden === 'antiguos') {
            $query->orderBy('fecha', 'asc');
        } else {
            $query->orderBy('fecha', 'desc');
        }

        $mantenimientos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $mantenimientos,
            'total' => $mantenimientos->count()
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'id_equipo' => 'required|integer|exists:equipo,id',
            'id_actmanten' => 'required|integer|exists:actividades_mantenieminto,id',
            'fecha' => 'required|date',
            'observaciones' => 'nullable|string|max:100'
        ], [
            'id_equipo.required' => 'El equipo es obligatorio',
            'id_equipo.exists' => 'El equipo seleccionado no existe',
            'id_actmanten.required' => 'La actividad de mantenimiento es obligatoria',
            'id_actmanten.exists' => 'La actividad seleccionada no existe',
            'fecha.required' => 'La fecha es obligatoria',
            'fecha.date' => 'La fecha debe ser válida',
            'observaciones.max' => 'Las observaciones no pueden exceder 100 caracteres'
        ]);

        $mantenimiento = Mantenimiento::create([
            'id_equipo' => $request->id_equipo,
            'id_actmanten' => $request->id_actmanten,
            'fecha' => $request->fecha,
            'observaciones' => $request->observaciones ?? ''
        ]);

        $mantenimiento->load(['equipo', 'actividad']);

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento registrado exitosamente',
            'data' => $mantenimiento
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $mantenimiento = Mantenimiento::with(['equipo', 'actividad'])->find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $mantenimiento
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        $request->validate([
            'id_equipo' => 'sometimes|integer|exists:equipo,id',
            'id_actmanten' => 'sometimes|integer|exists:actividades_mantenieminto,id',
            'fecha' => 'sometimes|date',
            'observaciones' => 'sometimes|string|max:100'
        ], [
            'id_equipo.exists' => 'El equipo seleccionado no existe',
            'id_actmanten.exists' => 'La actividad seleccionada no existe',
            'fecha.date' => 'La fecha debe ser válida',
            'observaciones.max' => 'Las observaciones no pueden exceder 100 caracteres'
        ]);

        // Actualizar solo los campos enviados
        if ($request->has('id_equipo')) {
            $mantenimiento->id_equipo = $request->id_equipo;
        }
        if ($request->has('id_actmanten')) {
            $mantenimiento->id_actmanten = $request->id_actmanten;
        }
        if ($request->has('fecha')) {
            $mantenimiento->fecha = $request->fecha;
        }
        if ($request->has('observaciones')) {
            $mantenimiento->observaciones = $request->observaciones;
        }

        $mantenimiento->save();
        $mantenimiento->load(['equipo', 'actividad']);

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento actualizado exitosamente',
            'data' => $mantenimiento
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        $mantenimiento->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento eliminado exitosamente'
        ]);
    }

    public function estadisticas(): JsonResponse
    {
        $total = Mantenimiento::count();
        
        // Mantenimientos por equipo (top 5)
        $porEquipo = Mantenimiento::selectRaw('id_equipo, COUNT(*) as total')
            ->with('equipo:id,descripcion')
            ->groupBy('id_equipo')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'equipo_id' => $item->id_equipo,
                    'equipo' => $item->equipo->descripcion ?? 'N/A',
                    'total' => $item->total
                ];
            });

        // Mantenimientos por actividad
        $porActividad = Mantenimiento::selectRaw('id_actmanten, COUNT(*) as total')
            ->with('actividad:id,categoria')
            ->groupBy('id_actmanten')
            ->orderBy('total', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'actividad_id' => $item->id_actmanten,
                    'categoria' => $item->actividad->categoria ?? 'N/A',
                    'total' => $item->total
                ];
            });

        // Mantenimientos por mes (último año)
        $porMes = Mantenimiento::selectRaw('MONTH(fecha) as mes, YEAR(fecha) as anio, COUNT(*) as total')
            ->whereYear('fecha', date('Y'))
            ->groupBy('mes', 'anio')
            ->orderBy('mes', 'asc')
            ->get();

        // Último mantenimiento
        $ultimoMantenimiento = Mantenimiento::with(['equipo', 'actividad'])
            ->orderBy('fecha', 'desc')
            ->first();

        // Próximos mantenimientos programados (asumiendo programados a futuro)
        $proximosMantenimientos = Mantenimiento::with(['equipo', 'actividad'])
            ->where('fecha', '>', now())
            ->orderBy('fecha', 'asc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'por_equipo' => $porEquipo,
                'por_actividad' => $porActividad,
                'por_mes_actual' => $porMes,
                'ultimo_mantenimiento' => $ultimoMantenimiento,
                'proximos_programados' => $proximosMantenimientos
            ]
        ]);
    }

    public function historialEquipo($id_equipo): JsonResponse
    {
        $equipo = Equipo::find($id_equipo);

        if (!$equipo) {
            return response()->json([
                'success' => false,
                'message' => 'Equipo no encontrado'
            ], 404);
        }

        $mantenimientos = Mantenimiento::with('actividad')
            ->where('id_equipo', $id_equipo)
            ->orderBy('fecha', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'equipo' => $equipo,
            'data' => $mantenimientos,
            'total' => $mantenimientos->count()
        ]);
    }
}
