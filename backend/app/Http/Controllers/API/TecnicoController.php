<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tecnico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TecnicoController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $query = Tecnico::query()->withCount('programaciones');

        // Filtro por estado (default: solo activos)
        $estado = $request->get('estado', 'Activo');
        if ($estado !== 'todos') {
            $query->where('estado', $estado);
        }

        // Filtro por especialidad
        if ($request->has('especialidad')) {
            $query->where('especialidad', 'like', "%{$request->especialidad}%");
        }

        // Búsqueda general
        if ($request->has('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                  ->orWhere('apellidos', 'like', "%{$buscar}%")
                  ->orWhere('dni', 'like', "%{$buscar}%");
            });
        }

        // Filtro por autorizado a conducir
        if ($request->has('autorizado_conducir')) {
            $autorizado = filter_var($request->autorizado_conducir, FILTER_VALIDATE_BOOLEAN);
            $query->where('autorizado_conducir', $autorizado);
        }

        // Ordenamiento
        $orden = $request->get('orden', 'nombre');
        switch ($orden) {
            case 'recientes':
                $query->orderBy('id', 'desc');
                break;
            case 'nombre':
            default:
                $query->orderBy('nombre', 'asc')->orderBy('apellidos', 'asc');
                break;
        }

        $tecnicos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $tecnicos,
            'total' => $tecnicos->count()
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'dni' => 'required|string|size:8|unique:tecnicos,dni',
            'celular' => 'nullable|string|max:13',
            'correo' => 'nullable|email|max:100',
            'especialidad' => 'nullable|string|max:100',
            'autorizado_conducir' => 'nullable|boolean',
            'carga_maxima_semanal' => 'nullable|integer|min:1|max:168'
        ], [
            'nombre.required' => 'El nombre es obligatorio',
            'apellidos.required' => 'Los apellidos son obligatorios',
            'dni.required' => 'El DNI es obligatorio',
            'dni.size' => 'El DNI debe tener exactamente 8 dígitos',
            'dni.unique' => 'Ya existe un técnico con este DNI',
            'correo.email' => 'El correo debe ser una dirección válida',
            'carga_maxima_semanal.min' => 'La carga semanal debe ser al menos 1 hora',
            'carga_maxima_semanal.max' => 'La carga semanal no puede exceder 168 horas'
        ]);

        $tecnico = Tecnico::create([
            'nombre' => $request->nombre,
            'apellidos' => $request->apellidos,
            'dni' => $request->dni,
            'celular' => $request->celular,
            'correo' => $request->correo,
            'especialidad' => $request->especialidad,
            'autorizado_conducir' => $request->autorizado_conducir ?? false,
            'carga_maxima_semanal' => $request->carga_maxima_semanal ?? 40,
            'estado' => 'Activo'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Técnico registrado exitosamente',
            'data' => $tecnico
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $tecnico = Tecnico::withCount('programaciones')->find($id);

        if (!$tecnico) {
            return response()->json([
                'success' => false,
                'message' => 'Técnico no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tecnico
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $tecnico = Tecnico::find($id);

        if (!$tecnico) {
            return response()->json([
                'success' => false,
                'message' => 'Técnico no encontrado'
            ], 404);
        }

        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'dni' => 'sometimes|string|size:8|unique:tecnicos,dni,' . $id,
            'celular' => 'sometimes|nullable|string|max:13',
            'correo' => 'sometimes|nullable|email|max:100',
            'especialidad' => 'sometimes|nullable|string|max:100',
            'autorizado_conducir' => 'sometimes|boolean',
            'carga_maxima_semanal' => 'sometimes|integer|min:1|max:168'
        ], [
            'dni.size' => 'El DNI debe tener exactamente 8 dígitos',
            'dni.unique' => 'Ya existe otro técnico con este DNI',
            'correo.email' => 'El correo debe ser una dirección válida',
            'carga_maxima_semanal.min' => 'La carga semanal debe ser al menos 1 hora',
            'carga_maxima_semanal.max' => 'La carga semanal no puede exceder 168 horas'
        ]);

        // Actualizar solo los campos enviados
        $camposActualizables = ['nombre', 'apellidos', 'dni', 'celular', 'correo', 
                                'especialidad', 'autorizado_conducir', 'carga_maxima_semanal'];
        
        foreach ($camposActualizables as $campo) {
            if ($request->has($campo)) {
                $tecnico->$campo = $request->$campo;
            }
        }

        $tecnico->save();

        return response()->json([
            'success' => true,
            'message' => 'Técnico actualizado exitosamente',
            'data' => $tecnico
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $tecnico = Tecnico::withCount('programaciones')->find($id);

        if (!$tecnico) {
            return response()->json([
                'success' => false,
                'message' => 'Técnico no encontrado'
            ], 404);
        }

        if ($tecnico->estado === 'Inactivo') {
            return response()->json([
                'success' => false,
                'message' => 'El técnico ya está inactivo'
            ], 400);
        }

        // VALIDACIÓN: No permitir desactivar si tiene programaciones
        $programacionesCount = $tecnico->programaciones()->count();
        
        if ($programacionesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede desactivar el técnico porque tiene {$programacionesCount} programación(es) asignada(s). Reasigne o elimine las programaciones primero.",
                'programaciones_count' => $programacionesCount
            ], 400);
        }

        $tecnico->update(['estado' => 'Inactivo']);

        return response()->json([
            'success' => true,
            'message' => 'Técnico desactivado exitosamente',
            'data' => $tecnico
        ]);
    }

    public function reactivar($id): JsonResponse
    {
        $tecnico = Tecnico::find($id);

        if (!$tecnico) {
            return response()->json([
                'success' => false,
                'message' => 'Técnico no encontrado'
            ], 404);
        }

        if ($tecnico->estado === 'Activo') {
            return response()->json([
                'success' => false,
                'message' => 'El técnico ya está activo'
            ], 400);
        }

        $tecnico->update(['estado' => 'Activo']);

        return response()->json([
            'success' => true,
            'message' => 'Técnico reactivado a estado Activo exitosamente',
            'data' => $tecnico
        ]);
    }

    public function ponerEnLicencia($id): JsonResponse
    {
        $tecnico = Tecnico::find($id);

        if (!$tecnico) {
            return response()->json([
                'success' => false,
                'message' => 'Técnico no encontrado'
            ], 404);
        }

        if ($tecnico->estado === 'Licencia') {
            return response()->json([
                'success' => false,
                'message' => 'El técnico ya está en licencia'
            ], 400);
        }

        $tecnico->update(['estado' => 'Licencia']);

        return response()->json([
            'success' => true,
            'message' => 'Técnico puesto en licencia exitosamente',
            'data' => $tecnico
        ]);
    }

    public function estadisticas(): JsonResponse
    {
        $total = Tecnico::count();
        $activos = Tecnico::where('estado', 'Activo')->count();
        $inactivos = Tecnico::where('estado', 'Inactivo')->count();
        $enLicencia = Tecnico::where('estado', 'Licencia')->count();

        // Técnicos por especialidad (solo activos)
        $porEspecialidad = Tecnico::selectRaw('especialidad, COUNT(*) as total')
            ->where('estado', 'Activo')
            ->whereNotNull('especialidad')
            ->groupBy('especialidad')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        // Técnicos autorizados a conducir
        $autorizadosConducir = Tecnico::where('estado', 'Activo')
            ->where('autorizado_conducir', true)
            ->count();

        // Técnicos con programaciones asignadas
        $conProgramaciones = Tecnico::where('estado', 'Activo')
            ->has('programaciones')
            ->count();

        // Carga semanal promedio
        $cargaPromedio = Tecnico::where('estado', 'Activo')
            ->avg('carga_maxima_semanal');

        // Top 5 técnicos con más programaciones
        $topTecnicos = Tecnico::where('estado', 'Activo')
            ->withCount('programaciones')
            ->orderBy('programaciones_count', 'desc')
            ->limit(5)
            ->get(['id', 'nombre', 'apellidos'])
            ->map(function($tecnico) {
                return [
                    'id' => $tecnico->id,
                    'nombre_completo' => $tecnico->nombre_completo,
                    'programaciones' => $tecnico->programaciones_count
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'activos' => $activos,
                'inactivos' => $inactivos,
                'en_licencia' => $enLicencia,
                'por_especialidad' => $porEspecialidad,
                'autorizados_conducir' => $autorizadosConducir,
                'con_programaciones' => $conProgramaciones,
                'carga_promedio_semanal' => round($cargaPromedio, 0),
                'top_tecnicos_mas_asignados' => $topTecnicos
            ]
        ]);
    }
}
