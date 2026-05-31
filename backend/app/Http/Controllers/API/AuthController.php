<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Personal;
use App\Models\Tecnico;
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
        1 => ['dashboard', 'prospectos', 'cotizaciones', 'servicios', 'logistica', 'marcar-asistencia'],              // Comercial
        2 => ['dashboard', 'ods', 'odp', 'servicios', 'programaciones', 'marcar-asistencia'],                         // Operaciones
        3 => ['dashboard', 'productos', 'categorias', 'logistica', 'cotizaciones', 'marcar-asistencia'],               // Administración
        4 => ['dashboard', 'rrhh-asistencia', 'rrhh-empleados', 'rrhh-reportes', 'marcar-asistencia', 'usuarios'],    // RRHH
        5 => ['dashboard', 'cotizaciones', 'logistica', 'marcar-asistencia'],                                          // Finanzas
        6 => ['*'],                                                                                                     // Gerencia = TODO
        7 => ['dashboard', 'inventario', 'entradas-salidas', 'marcar-asistencia'],                                     // Almacén
    ];

    /**
     * Permisos especiales por cargo (tienen prioridad sobre área).
     */
    private function resolverPermisos(Personal $personal): array
    {
        $cargoNombre = mb_strtolower(trim((string) optional($personal->cargo)->nombre));
        $areaNombre = mb_strtolower(trim((string) optional($personal->area)->nombre));

        if (in_array($areaNombre, ['gerencia', 'it'], true)) {
            return ['*'];
        }

        if (in_array($areaNombre, ['investigacion', 'investigación'], true)) {
            return ['dashboard', 'marcar-asistencia', 'operaciones'];
        }

        // Área Programación - Cargo: Programación Servicio
        // Acceso únicamente al módulo de Programaciones (servicio + dashboard) y marcado de asistencia.
        if (in_array($cargoNombre, ['programacion servicio', 'programación servicio'], true)) {
            return ['programaciones', 'programaciones-servicio', 'marcar-asistencia'];
        }

        return self::PERMISOS_POR_AREA[$personal->id_area] ?? ['dashboard', 'marcar-asistencia'];
    }

    private function resolverTecnicoId(Personal $personal): ?int
    {
        $id = Tecnico::query()
            ->where('id_personal', $personal->id)
            ->value('id');

        $idInt = (int) ($id ?? 0);
        return $idInt > 0 ? $idInt : null;
    }

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

        if ($personal->estado === 'Inactivo') {
            return response()->json([
                'success' => false,
                'message' => 'Tu cuenta se encuentra desactivada. Contacta al administrador.',
            ], 403);
        }

        // Revocar tokens anteriores
        $personal->tokens()->delete();

        // Crear token Sanctum
        $token = $personal->createToken('auth-token')->plainTextToken;

        $personal->loadMissing(['area', 'cargo']);
        $tecnicoId = $this->resolverTecnicoId($personal);

        // Obtener permisos según área/cargo
        $permisos = $this->resolverPermisos($personal);
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
                'tecnico_id' => $tecnicoId,
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

        $personal->loadMissing(['area', 'cargo']);
        $tecnicoId = $this->resolverTecnicoId($personal);
        $permisos = $this->resolverPermisos($personal);
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
                'tecnico_id' => $tecnicoId,
            ],
        ]);
    }
}
