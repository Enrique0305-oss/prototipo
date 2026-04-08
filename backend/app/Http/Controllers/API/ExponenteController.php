<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Exponente;
use App\Models\Tecnico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ExponenteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Exponente::query()->with(['tecnicoVinculado:id,nombre,apellidos']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orwhere('presentacion', 'like', "%{$search}%")
                  ->orWhere('especialidad', 'like', "%{$search}%")
                  ->orWhere('profesion', 'like', "%{$search}%")
                  ->orWhere('institucion', 'like', "%{$search}%");
            });
        }

        if ($estado = $request->query('estado')) {
            $query->where('estado', $estado);
        }

        $exponentes = $query->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'data' => $exponentes,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'presentacion' => 'nullable|string',
            'especialidad' => 'nullable|string|max:200',
            'profesion' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'institucion' => 'nullable|string|max:200',
            'notas' => 'nullable|string',
            'id_tecnico_vinculado' => 'nullable|integer|exists:tecnicos,id|unique:exponentes,id_tecnico_vinculado',
        ]);

        $exponente = DB::transaction(function () use ($validated) {
            $nuevo = Exponente::create($validated);

            if (!empty($validated['id_tecnico_vinculado'])) {
                $this->syncVinculoTecnico($nuevo, (int) $validated['id_tecnico_vinculado']);
            }

            return $nuevo;
        });

        $exponente->load(['tecnicoVinculado:id,nombre,apellidos']);

        return response()->json([
            'success' => true,
            'message' => 'Exponente registrado exitosamente',
            'data' => $exponente,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $exponente = Exponente::with(['tecnicoVinculado:id,nombre,apellidos'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $exponente,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $exponente = Exponente::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'apellidos' => 'sometimes|required|string|max:100',
            'presentacion' => 'nullable|string',
            'especialidad' => 'nullable|string|max:200',
            'profesion' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'institucion' => 'nullable|string|max:200',
            'notas' => 'nullable|string',
            'estado' => 'sometimes|in:Activo,Inactivo',
            'id_tecnico_vinculado' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:tecnicos,id',
                Rule::unique('exponentes', 'id_tecnico_vinculado')->ignore($id),
            ],
        ]);

        DB::transaction(function () use ($exponente, $validated) {
            $exponente->update($validated);

            if (array_key_exists('id_tecnico_vinculado', $validated)) {
                $nuevoId = $validated['id_tecnico_vinculado'] ? (int) $validated['id_tecnico_vinculado'] : null;
                $this->syncVinculoTecnico($exponente, $nuevoId);
            }
        });

        $exponente->load(['tecnicoVinculado:id,nombre,apellidos']);

        return response()->json([
            'success' => true,
            'message' => 'Exponente actualizado exitosamente',
            'data' => $exponente,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $exponente = Exponente::findOrFail($id);

        if (!empty($exponente->id_tecnico_vinculado)) {
            Tecnico::query()
                ->where('id', (int) $exponente->id_tecnico_vinculado)
                ->where('id_exponente_vinculado', (int) $exponente->id)
                ->update(['id_exponente_vinculado' => null]);
        }

        // Verificar si tiene órdenes asociadas
        if ($exponente->ordenes()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: este exponente tiene órdenes de capacitación asociadas. Puede desactivarlo.',
            ], 422);
        }

        $exponente->delete();

        return response()->json([
            'success' => true,
            'message' => 'Exponente eliminado exitosamente',
        ]);
    }

    private function syncVinculoTecnico(Exponente $exponente, ?int $nuevoTecnicoId): void
    {
        $exponente->refresh();
        $actualTecnicoId = $exponente->id_tecnico_vinculado ? (int) $exponente->id_tecnico_vinculado : null;

        if ($actualTecnicoId && $actualTecnicoId !== $nuevoTecnicoId) {
            Tecnico::query()
                ->where('id', $actualTecnicoId)
                ->where('id_exponente_vinculado', $exponente->id)
                ->update(['id_exponente_vinculado' => null]);

            $exponente->id_tecnico_vinculado = null;
            $exponente->save();
        }

        if (!$nuevoTecnicoId) {
            return;
        }

        $tecnico = Tecnico::findOrFail($nuevoTecnicoId);
        $exponenteLigado = $tecnico->id_exponente_vinculado ? (int) $tecnico->id_exponente_vinculado : null;

        if ($exponenteLigado && $exponenteLigado !== (int) $exponente->id) {
            throw ValidationException::withMessages([
                'id_tecnico_vinculado' => 'El técnico seleccionado ya está vinculado a otro exponente.',
            ]);
        }

        Exponente::query()
            ->where('id_tecnico_vinculado', $nuevoTecnicoId)
            ->where('id', '!=', $exponente->id)
            ->update(['id_tecnico_vinculado' => null]);

        if ((int) ($exponente->id_tecnico_vinculado ?? 0) !== $nuevoTecnicoId) {
            $exponente->id_tecnico_vinculado = $nuevoTecnicoId;
            $exponente->save();
        }

        if ((int) ($tecnico->id_exponente_vinculado ?? 0) !== (int) $exponente->id) {
            $tecnico->id_exponente_vinculado = (int) $exponente->id;
            $tecnico->save();
        }
    }
}
