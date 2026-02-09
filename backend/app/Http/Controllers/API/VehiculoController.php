<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    // para ver los vehículos 
    public function index(Request $request): JsonResponse
    {
        $query = Vehiculo::query()->withCount('programaciones');

        // Filtro por estado (default: solo disponibles)
        $estado = $request->get('estado', 'Disponible');
        if ($estado !== 'todos') {
            $query->where('estado', $estado);
        }

        // Filtro por marca
        if ($request->has('marca')) {
            $query->where('marca', $request->marca);
        }

        // Búsqueda general
        if ($request->has('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('placa', 'like', "%{$buscar}%")
                  ->orWhere('modelo', 'like', "%{$buscar}%")
                  ->orWhere('marca', 'like', "%{$buscar}%");
            });
        }

        // Filtro por rango de años
        if ($request->has('anio_desde')) {
            $query->where('anio', '>=', $request->anio_desde);
        }

        if ($request->has('anio_hasta')) {
            $query->where('anio', '<=', $request->anio_hasta);
        }

        // Ordenamiento
        $orden = $request->get('orden', 'recientes');
        switch ($orden) {
            case 'antiguos':
                $query->orderBy('anio', 'asc');
                break;
            case 'placa':
                $query->orderBy('placa', 'asc');
                break;
            case 'recientes':
            default:
                $query->orderBy('anio', 'desc');
                break;
        }

        $vehiculos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $vehiculos,
            'total' => $vehiculos->count()
        ]);
    }


     // Crea un nuevo vehículo con estado default 'Disponible'
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'placa' => 'required|string|max:20|unique:vehiculos,placa',
            'modelo' => 'required|string|max:100',
            'marca' => 'required|string|max:50',
            'anio' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'capacidad_carga' => 'nullable|numeric|min:0'
        ], [
            'placa.required' => 'La placa es obligatoria',
            'placa.unique' => 'Ya existe un vehículo con esta placa',
            'modelo.required' => 'El modelo es obligatorio',
            'marca.required' => 'La marca es obligatoria',
            'anio.required' => 'El año es obligatorio',
            'anio.min' => 'El año debe ser mayor a 1900',
            'anio.max' => 'El año no puede ser mayor al año siguiente',
            'capacidad_carga.numeric' => 'La capacidad de carga debe ser un número',
            'capacidad_carga.min' => 'La capacidad de carga no puede ser negativa'
        ]);

        $vehiculo = Vehiculo::create([
            'placa' => strtoupper($request->placa),
            'modelo' => $request->modelo,
            'marca' => $request->marca,
            'anio' => $request->anio,
            'capacidad_carga' => $request->capacidad_carga ?? 0,
            'estado' => 'Disponible'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vehículo registrado exitosamente',
            'data' => $vehiculo
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $vehiculo = Vehiculo::withCount('programaciones')->find($id);

        if (!$vehiculo) {
            return response()->json([
                'success' => false,
                'message' => 'Vehículo no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $vehiculo
        ]);
    }
    public function update(Request $request, $id): JsonResponse
    {
        $vehiculo = Vehiculo::find($id);

        if (!$vehiculo) {
            return response()->json([
                'success' => false,
                'message' => 'Vehículo no encontrado'
            ], 404);
        }

        $request->validate([
            'placa' => 'sometimes|string|max:20|unique:vehiculos,placa,' . $id,
            'modelo' => 'sometimes|string|max:100',
            'marca' => 'sometimes|string|max:50',
            'anio' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'capacidad_carga' => 'sometimes|numeric|min:0'
        ], [
            'placa.unique' => 'Ya existe otro vehículo con esta placa',
            'anio.min' => 'El año debe ser mayor a 1900',
            'anio.max' => 'El año no puede ser mayor al año siguiente',
            'capacidad_carga.numeric' => 'La capacidad de carga debe ser un número',
            'capacidad_carga.min' => 'La capacidad de carga no puede ser negativa'
        ]);

        // Actualizar solo los campos enviados
        $camposActualizables = ['placa', 'modelo', 'marca', 'anio', 'capacidad_carga'];
        
        foreach ($camposActualizables as $campo) {
            if ($request->has($campo)) {
                if ($campo === 'placa') {
                    $vehiculo->$campo = strtoupper($request->$campo);
                } else {
                    $vehiculo->$campo = $request->$campo;
                }
            }
        }

        $vehiculo->save();

        return response()->json([
            'success' => true,
            'message' => 'Vehículo actualizado exitosamente',
            'data' => $vehiculo
        ]);
    }

    // Cambia el estado a 'Fuera de Servicio'
    // PROTECCIÓN: No permite desactivar si tiene programaciones activas
    public function destroy($id): JsonResponse
    {
        $vehiculo = Vehiculo::withCount('programaciones')->find($id);

        if (!$vehiculo) {
            return response()->json([
                'success' => false,
                'message' => 'Vehículo no encontrado'
            ], 404);
        }

        if ($vehiculo->estado === 'Fuera de Servicio') {
            return response()->json([
                'success' => false,
                'message' => 'El vehículo ya está fuera de servicio'
            ], 400);
        }

        // VALIDACIÓN: No permitir desactivar si tiene programaciones
        $programacionesCount = $vehiculo->programaciones()->count();
        
        if ($programacionesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede poner fuera de servicio el vehículo porque tiene {$programacionesCount} programación(es) asociada(s). Elimine o reasigne las programaciones primero.",
                'programaciones_count' => $programacionesCount
            ], 400);
        }

        $vehiculo->update(['estado' => 'Fuera de Servicio']);

        return response()->json([
            'success' => true,
            'message' => 'Vehículo puesto fuera de servicio exitosamente',
            'data' => $vehiculo
        ]);
    }

    public function reactivar($id): JsonResponse
    {
        $vehiculo = Vehiculo::find($id);

        if (!$vehiculo) {
            return response()->json([
                'success' => false,
                'message' => 'Vehículo no encontrado'
            ], 404);
        }

        if ($vehiculo->estado === 'Disponible') {
            return response()->json([
                'success' => false,
                'message' => 'El vehículo ya está disponible'
            ], 400);
        }

        $vehiculo->update(['estado' => 'Disponible']);

        return response()->json([
            'success' => true,
            'message' => 'Vehículo reactivado a estado Disponible exitosamente',
            'data' => $vehiculo
        ]);
    }

    public function estadisticas(): JsonResponse
    {
        $total = Vehiculo::count();
        $disponibles = Vehiculo::where('estado', 'Disponible')->count();
        $enUso = Vehiculo::where('estado', 'En Uso')->count();
        $mantenimiento = Vehiculo::where('estado', 'Mantenimiento')->count();
        $fueraServicio = Vehiculo::where('estado', 'Fuera de Servicio')->count();

        // Vehículos por marca (solo operativos: Disponible y En Uso)
        $porMarca = Vehiculo::selectRaw('marca, COUNT(*) as total')
            ->whereIn('estado', ['Disponible', 'En Uso'])
            ->groupBy('marca')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // Vehículos por año (últimos 5 años más comunes)
        $porAnio = Vehiculo::selectRaw('anio, COUNT(*) as total')
            ->whereIn('estado', ['Disponible', 'En Uso'])
            ->groupBy('anio')
            ->orderBy('anio', 'desc')
            ->limit(5)
            ->get();

        // Capacidad total de carga (vehículos operativos)
        $capacidadTotal = Vehiculo::whereIn('estado', ['Disponible', 'En Uso'])
            ->sum('capacidad_carga');

        // Vehículos con programaciones
        $conProgramaciones = Vehiculo::whereIn('estado', ['Disponible', 'En Uso'])
            ->has('programaciones')
            ->count();

        // Promedio de años
        $anioPromedio = Vehiculo::whereIn('estado', ['Disponible', 'En Uso'])->avg('anio');

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'disponibles' => $disponibles,
                'en_uso' => $enUso,
                'mantenimiento' => $mantenimiento,
                'fuera_servicio' => $fueraServicio,
                'por_marca' => $porMarca,
                'por_anio' => $porAnio,
                'capacidad_total_carga' => round($capacidadTotal, 2),
                'con_programaciones' => $conProgramaciones,
                'anio_promedio' => round($anioPromedio, 0)
            ]
        ]);
    }
}
