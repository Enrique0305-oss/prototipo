<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Personal;
use App\Models\Area;
use App\Models\Tecnico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PersonalController extends Controller
{
    private function parseBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value === 1;
        }

        $normalized = mb_strtolower(trim((string) $value));
        return in_array($normalized, ['1', 'true', 'si', 'sí', 'on'], true);
    }

    private function syncTecnicoDesdePersonal(Personal $personal, ?int $nuevoTecnicoId): void
    {
        $tecnicoActual = Tecnico::query()->where('id_personal', $personal->id)->first();
        $actualTecnicoId = $tecnicoActual ? (int) $tecnicoActual->id : null;

        if ($actualTecnicoId && $actualTecnicoId !== $nuevoTecnicoId) {
            Tecnico::query()
                ->where('id', $actualTecnicoId)
                ->where('id_personal', $personal->id)
                ->update(['id_personal' => null]);
        }

        if (!$nuevoTecnicoId) {
            return;
        }

        $tecnico = Tecnico::findOrFail($nuevoTecnicoId);
        $personalLigado = $tecnico->id_personal ? (int) $tecnico->id_personal : null;

        if ($personalLigado && $personalLigado !== (int) $personal->id) {
            throw ValidationException::withMessages([
                'id_tecnico_vinculado' => 'El técnico seleccionado ya está vinculado a otro usuario.',
            ]);
        }

        if ((int) ($tecnico->id_personal ?? 0) !== (int) $personal->id) {
            $tecnico->id_personal = (int) $personal->id;
            $tecnico->save();
        }
    }

    private function puedeVerIt(?Personal $usuario): bool
    {
        if (!$usuario) {
            return false;
        }

        $usuario->loadMissing('area');
        $areaNombre = mb_strtolower(trim((string) ($usuario->area?->nombre ?? '')));

        return $areaNombre === 'it';
    }

    private function esAreaIt(?Area $area): bool
    {
        $nombre = mb_strtolower(trim((string) ($area?->nombre ?? '')));

        return $nombre === 'it';
    }

    /**
     * GET /personal/usuarios - Listar todos los usuarios con su área
     */
    public function index(Request $request)
    {
        $query = Personal::with('area', 'cargo', 'tecnico');
        $usuarioAutenticado = $request->user();
        $puedeVerIt = $this->puedeVerIt($usuarioAutenticado);

        if (!$puedeVerIt) {
            $query->whereHas('area', function ($q) {
                $q->whereRaw('LOWER(nombre) <> ?', ['it']);
            });
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nombre', 'like', "%{$s}%")
                  ->orWhere('apellidos', 'like', "%{$s}%")
                  ->orWhere('usuario', 'like', "%{$s}%")
                  ->orWhere('correo', 'like', "%{$s}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('id_area')) {
            $query->where('id_area', $request->id_area);
        }

        $personal = $query->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'data' => $personal,
        ]);
    }

    /**
     * GET /personal/usuarios/{id} - Ver un usuario
     */
    public function show($id)
    {
        $personal = Personal::with('area', 'cargo', 'tecnico')->findOrFail($id);

        if ($this->esAreaIt($personal->area) && !$this->puedeVerIt(request()->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $personal,
        ]);
    }

    /**
     * POST /personal/usuarios - Crear usuario
     */
    public function store(Request $request)
    {
        $esTecnico = $this->parseBoolean($request->input('es_tecnico'));

        $rules = [
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'celular'   => 'required|string|max:13',
            'correo'    => 'required|email|max:50|unique:personal,correo',
            'id_area'   => 'required|integer|exists:area,id',
            'id_cargo'  => 'nullable|integer|exists:cargo,id',
            'usuario'   => 'required|string|max:100|unique:personal,usuario',
            'password'  => 'required|string|min:6',
            'es_tecnico' => 'nullable|boolean',
            'id_tecnico_vinculado' => 'nullable|integer|exists:tecnicos,id',
        ];

        if ($esTecnico) {
            $rules['id_tecnico_vinculado'] = 'required|integer|exists:tecnicos,id';
        }

        $validated = $request->validate($rules);

        if (isset($validated['id_area'])) {
            $area = Area::find($validated['id_area']);
            if ($this->esAreaIt($area) && !$this->puedeVerIt($request->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para asignar usuarios al área IT'
                ], 403);
            }
        }

        $personal = DB::transaction(function () use ($validated, $esTecnico) {
            $personalData = [
                'nombre' => $validated['nombre'],
                'apellidos' => $validated['apellidos'],
                'celular' => $validated['celular'],
                'correo' => $validated['correo'],
                'id_area' => $validated['id_area'],
                'id_cargo' => $validated['id_cargo'] ?? null,
                'usuario' => $validated['usuario'],
                'password' => Hash::make($validated['password']),
                'estado' => 'Activo',
            ];

            $personal = Personal::create($personalData);
            $tecnicoId = $esTecnico ? (int) ($validated['id_tecnico_vinculado'] ?? 0) : null;
            $this->syncTecnicoDesdePersonal($personal, $tecnicoId ?: null);

            return $personal;
        });

        $personal->load('area', 'cargo', 'tecnico');

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'data' => $personal,
        ], 201);
    }

    /**
     * PUT /personal/usuarios/{id} - Actualizar usuario
     */
    public function update(Request $request, $id)
    {
        $personal = Personal::findOrFail($id);
        $esTecnico = $this->parseBoolean($request->input('es_tecnico'));

        $rules = [
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'celular'   => 'required|string|max:13',
            'correo'    => ['required', 'email', 'max:50', Rule::unique('personal', 'correo')->ignore($id)],
            'id_area'   => 'required|integer|exists:area,id',
            'id_cargo'  => 'nullable|integer|exists:cargo,id',
            'usuario'   => ['required', 'string', 'max:100', Rule::unique('personal', 'usuario')->ignore($id)],
            'password'  => 'nullable|string|min:6',
            'es_tecnico' => 'nullable|boolean',
            'id_tecnico_vinculado' => 'nullable|integer|exists:tecnicos,id',
        ];

        if ($esTecnico) {
            $rules['id_tecnico_vinculado'] = 'required|integer|exists:tecnicos,id';
        }

        $validated = $request->validate($rules);

        if ($this->esAreaIt($personal->area) && !$this->puedeVerIt($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para modificar usuarios del área IT'
            ], 403);
        }

        DB::transaction(function () use ($personal, $validated, $esTecnico) {
            $payloadPersonal = [
                'nombre' => $validated['nombre'],
                'apellidos' => $validated['apellidos'],
                'celular' => $validated['celular'],
                'correo' => $validated['correo'],
                'id_area' => $validated['id_area'],
                'id_cargo' => $validated['id_cargo'] ?? null,
                'usuario' => $validated['usuario'],
            ];

            if (!empty($validated['password'])) {
                $payloadPersonal['password'] = Hash::make($validated['password']);
            }

            $personal->update($payloadPersonal);
            $tecnicoId = $esTecnico ? (int) ($validated['id_tecnico_vinculado'] ?? 0) : null;
            $this->syncTecnicoDesdePersonal($personal, $tecnicoId ?: null);
        });

        $personal->load('area', 'cargo', 'tecnico');

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente',
            'data' => $personal,
        ]);
    }

    /**
     * PATCH /personal/usuarios/{id}/estado - Activar/Inactivar
     */
    public function toggleEstado($id)
    {
        $personal = Personal::findOrFail($id);

        if ($this->esAreaIt($personal->area) && !$this->puedeVerIt(request()->user())) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para modificar usuarios del área IT'
            ], 403);
        }

        $personal->estado = $personal->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $personal->save();

        // Si se inactiva, revocar tokens
        if ($personal->estado === 'Inactivo') {
            $personal->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $personal->estado === 'Activo' ? 'Usuario activado' : 'Usuario desactivado',
            'data' => $personal,
        ]);
    }

    /**
     * PATCH /personal/usuarios/{id}/reset-password - Resetear contraseña
     */
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $personal = Personal::findOrFail($id);

        if ($this->esAreaIt($personal->area) && !$this->puedeVerIt($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para modificar usuarios del área IT'
            ], 403);
        }

        $personal->password = Hash::make($request->password);
        $personal->save();

        // Revocar tokens para forzar re-login
        $personal->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contraseña restablecida exitosamente',
        ]);
    }

    /**
     * GET /personal/areas-lista - Listar áreas para select
     */
    public function areasLista()
    {
        $usuarioAutenticado = request()->user();
        $puedeVerIt = $this->puedeVerIt($usuarioAutenticado);

        $areas = Area::where('estado', 'Activo')
            ->when(!$puedeVerIt, function ($query) {
                $query->whereRaw('LOWER(nombre) <> ?', ['it']);
            })
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }
}
