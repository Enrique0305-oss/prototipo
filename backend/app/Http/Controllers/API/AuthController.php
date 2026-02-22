<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Personal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Mapa de accesos por id_area.
     * Gerencia (6) = acceso total ('*')
     */
    private const PERMISOS_POR_AREA = [
        // id_area => módulos permitidos
        1 => ['dashboard', 'prospectos', 'cotizaciones', 'servicios', 'marcar-asistencia'],                           // Comercial
        2 => ['dashboard', 'ods', 'odp', 'servicios', 'programaciones', 'marcar-asistencia'],                         // Operaciones
        3 => ['dashboard', 'productos', 'categorias', 'logistica', 'cotizaciones', 'marcar-asistencia'],               // Administración
        4 => ['dashboard', 'rrhh-asistencia', 'rrhh-empleados', 'rrhh-reportes', 'marcar-asistencia'],                // RRHH
        5 => ['dashboard', 'cotizaciones', 'logistica', 'marcar-asistencia'],                                          // Finanzas
        6 => ['*'],                                                                                                     // Gerencia = TODO
        7 => ['dashboard', 'inventario', 'entradas-salidas', 'marcar-asistencia'],                                     // Almacén
    ];

    /**
     * POST /auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'password' => 'required|string',
        ]);

        // Buscar por campo 'usuario' o por 'correo'
        $personal = Personal::where('usuario', $request->usuario)
            ->orWhere('correo', $request->usuario)
            ->first();

        if (!$personal || !Hash::check($request->password, $personal->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        // Revocar tokens anteriores
        $personal->tokens()->delete();

        // Crear token Sanctum
        $token = $personal->createToken('auth-token')->plainTextToken;

        // Obtener permisos según área
        $permisos = self::PERMISOS_POR_AREA[$personal->id_area] ?? ['dashboard', 'marcar-asistencia'];
        $areaNombre = $personal->area ? $personal->area->nombre : 'Sin área';

        return response()->json([
            'success' => true,
            'token' => $token,
            'refreshToken' => 'refresh_' . bin2hex(random_bytes(20)),
            'expiresIn' => 86400, // 24 horas
            'usuario' => [
                'id' => $personal->id,
                'nombre' => $personal->nombre . ' ' . $personal->apellidos,
                'apellido' => $personal->apellidos,
                'email' => $personal->correo,
                'rol' => $areaNombre,
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($personal->nombre) . '&background=2c4a7c&color=fff',
                'permisos' => $permisos,
                'departamento' => $areaNombre,
                'telefono' => $personal->celular,
                'fechaCreacion' => now()->toISOString(),
                'ultimoAcceso' => now()->toISOString(),
                'id_area' => $personal->id_area,
            ],
        ]);
    }

    /**
     * POST /auth/logout
     */
    public function logout(Request $request)
    {
        // Revocar el token actual
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    /**
     * GET /auth/me — Retorna datos del usuario autenticado
     */
    public function me(Request $request)
    {
        $personal = $request->user();
        
        if (!$personal) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        $personal->load('area');
        $permisos = self::PERMISOS_POR_AREA[$personal->id_area] ?? ['dashboard', 'marcar-asistencia'];
        $areaNombre = $personal->area ? $personal->area->nombre : 'Sin área';

        return response()->json([
            'success' => true,
            'usuario' => [
                'id' => $personal->id,
                'nombre' => $personal->nombre . ' ' . $personal->apellidos,
                'apellido' => $personal->apellidos,
                'email' => $personal->correo,
                'rol' => $areaNombre,
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($personal->nombre) . '&background=2c4a7c&color=fff',
                'permisos' => $permisos,
                'departamento' => $areaNombre,
                'telefono' => $personal->celular,
                'fechaCreacion' => now()->toISOString(),
                'ultimoAcceso' => now()->toISOString(),
                'id_area' => $personal->id_area,
            ],
        ]);
    }
}
