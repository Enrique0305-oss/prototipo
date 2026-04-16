<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Personal;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PersonalController extends Controller
{
    private function puedeVerIt(?Personal $usuario): bool
    {
        if (!$usuario) {
            return false;
        }

        $usuario->loadMissing('area');
        $areaNombre = mb_strtolower(trim((string) ($usuario->area?->nombre ?? '')));

        return in_array($areaNombre, ['gerencia', 'it'], true);
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
        $query = Personal::with('area', 'cargo');
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
        $personal = Personal::with('area', 'cargo')->findOrFail($id);

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
        $validated = $request->validate([
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'celular'   => 'required|string|max:13',
            'correo'    => 'required|email|max:50|unique:personal,correo',
            'id_area'   => 'required|integer|exists:area,id',
            'id_cargo'  => 'nullable|integer|exists:cargo,id',
            'usuario'   => 'required|string|max:100|unique:personal,usuario',
            'password'  => 'required|string|min:6',
        ]);

        if (isset($validated['id_area'])) {
            $area = Area::find($validated['id_area']);
            if ($this->esAreaIt($area) && !$this->puedeVerIt($request->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para asignar usuarios al área IT'
                ], 403);
            }
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['estado'] = 'Activo';

        $personal = Personal::create($validated);
        $personal->load('area', 'cargo');

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

        $validated = $request->validate([
            'nombre'    => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'celular'   => 'required|string|max:13',
            'correo'    => ['required', 'email', 'max:50', Rule::unique('personal', 'correo')->ignore($id)],
            'id_area'   => 'required|integer|exists:area,id',
            'id_cargo'  => 'nullable|integer|exists:cargo,id',
            'usuario'   => ['required', 'string', 'max:100', Rule::unique('personal', 'usuario')->ignore($id)],
            'password'  => 'nullable|string|min:6',
        ]);

        if ($this->esAreaIt($personal->area) && !$this->puedeVerIt($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para modificar usuarios del área IT'
            ], 403);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $personal->update($validated);
        $personal->load('area', 'cargo');

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
