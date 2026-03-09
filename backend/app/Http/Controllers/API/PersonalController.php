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
    /**
     * GET /personal/usuarios - Listar todos los usuarios con su área
     */
    public function index(Request $request)
    {
        $query = Personal::with('area');

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
        $personal = Personal::with('area')->findOrFail($id);

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
            'usuario'   => 'required|string|max:100|unique:personal,usuario',
            'password'  => 'required|string|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['estado'] = 'Activo';

        $personal = Personal::create($validated);
        $personal->load('area');

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
            'usuario'   => ['required', 'string', 'max:100', Rule::unique('personal', 'usuario')->ignore($id)],
            'password'  => 'nullable|string|min:6',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $personal->update($validated);
        $personal->load('area');

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
        $areas = Area::where('estado', 'Activo')->orderBy('nombre')->get(['id', 'nombre']);

        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }
}
