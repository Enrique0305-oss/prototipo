<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FichaOperacional;
use App\Models\ProgramacionServicio;
use App\Models\ProgramacionServicioGrupo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FichaOperacionalController extends Controller
{
    /**
     * Guardar o actualizar una ficha operacional (borrador)
     */
    public function store(Request $request, $id)
    {
        // $id es el id de ProgramacionServicio
        $prog = ProgramacionServicio::with(['grupoProgramacion', 'ordenServicio.cliente'])
            ->findOrFail($id);

        $idUsuario = (int) ($request->user()?->id ?? 0);

        // Validar datos básicos
        $validated = $request->validate([
            'cliente' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'fecha' => 'nullable|date',
            'hora_llegada' => 'nullable|date_format:H:i',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_final' => 'nullable|date_format:H:i',
            'giro' => 'nullable|string|max:255',
            'diagnostico' => 'nullable|string',
            'condicion_sanitaria' => 'nullable|string',
            'actividades_realizadas' => 'nullable|array',
            'equipos' => 'nullable|array',
            'insumos_utilizados' => 'nullable|array',
            'areas_tratadas' => 'nullable|array',
            'acciones_correctivas' => 'nullable|string',
            'recomendaciones' => 'nullable|string',
            'firmas' => 'nullable|array',
            'observaciones' => 'nullable|string',
        ]);

        $ficha = FichaOperacional::where('id_programacion_servicio', $prog->id)
            ->where('estado', 'borrador')
            ->first();

        if (!$ficha) {
            $ficha = new FichaOperacional();
            $ficha->id_programacion_servicio = $prog->id;
            $ficha->id_grupo_programacion = $prog->id_grupo_programacion;
            $ficha->id_usuario_creador = $idUsuario > 0 ? $idUsuario : null;
            $ficha->estado = 'borrador';
        }

        $ficha->fill($validated);
        $ficha->save();

        if ($request->boolean('finalizar_automaticamente')) {
            $this->ejecutarFinalizacion($ficha, $request);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ficha guardada como borrador',
            'data' => $ficha,
        ]);
    }

    /**
     * Obtener ficha operacional por id de programación
     */
    public function show($id)
    {
        // 1. Intentar buscar por ID de programación directo
        $ficha = FichaOperacional::where('id_programacion_servicio', $id)
            ->with(['programacionServicio', 'programacionServicioGrupo'])
            ->latest()
            ->first();

        // 2. Si no se encuentra, buscar por el grupo al que pertenece la programación
        if (!$ficha) {
            $prog = ProgramacionServicio::find($id);
            if ($prog && $prog->id_grupo_programacion) {
                $ficha = FichaOperacional::where('id_grupo_programacion', $prog->id_grupo_programacion)
                    ->with(['programacionServicio', 'programacionServicioGrupo'])
                    ->latest()
                    ->first();
            }
        }

        if (!$ficha) {
            return response()->json([
                'success' => false,
                'message' => 'Ficha no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ficha,
        ]);
    }

    /**
     * Actualizar una ficha operacional en estado borrador
     */
    public function update(Request $request, $id)
    {
        // $id es el id de FichaOperacional
        $ficha = FichaOperacional::findOrFail($id);

        $validated = $request->validate([
            'cliente' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'fecha' => 'nullable|date',
            'hora_llegada' => 'nullable|date_format:H:i',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_final' => 'nullable|date_format:H:i',
            'giro' => 'nullable|string|max:255',
            'diagnostico' => 'nullable|string',
            'condicion_sanitaria' => 'nullable|string',
            'actividades_realizadas' => 'nullable|array',
            'equipos' => 'nullable|array',
            'insumos_utilizados' => 'nullable|array',
            'areas_tratadas' => 'nullable|array',
            'acciones_correctivas' => 'nullable|string',
            'recomendaciones' => 'nullable|string',
            'firmas' => 'nullable|array',
            'observaciones' => 'nullable|string',
        ]);

        $ficha->fill($validated);
        $ficha->save();

        if ($request->boolean('finalizar_automaticamente')) {
            $this->ejecutarFinalizacion($ficha, $request);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ficha actualizada',
            'data' => $ficha,
        ]);
    }

    /**
     * Finalizar ficha operacional y marcar programación como Realizado
     */
    public function finalize(Request $request, $id)
    {
        // $id es el id de FichaOperacional
        $ficha = FichaOperacional::findOrFail($id);

        if ($ficha->estado !== 'borrador') {
            return response()->json([
                'success' => false,
                'message' => 'La ficha ya ha sido finalizada',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Ejecutar la lógica de finalización extraída
            $this->ejecutarFinalizacion($ficha, $request);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ficha finalizada exitosamente',
                'data' => [
                    'ficha' => $ficha->fresh(),
                    'programacion' => $prog->fresh()->load('ordenServicio.cliente', 'servicio'),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al finalizar ficha: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Extrae la lógica pesada de la finalización para reutilizarla
     */
    private function ejecutarFinalizacion($ficha, Request $request)
    {
        $prog = $ficha->programacionServicio;

        // Actualizar ficha a completada
        $ficha->marcarCompletada();

        // Marcar programación como Realizado
        if ($prog->estado_ejecucion !== 'Realizado') {
            $prog->update([
                'estado_ejecucion' => 'Realizado',
                'fecha_ejecucion_real' => now(),
                'observaciones' => $ficha->observaciones ?? $prog->observaciones,
                'modificado_por' => (int) ($request->user()?->id ?? 0),
            ]);

            // Actualizar insumos a "Utilizado"
            $prog->insumos()->update(['estado' => 'Utilizado']);

            // Verificar si TODAS las programaciones de la ODS están Realizadas
            $orden = $prog->ordenServicio;
            if ($orden) {
                $pendientes = ProgramacionServicio::where('id_orden_servicio', $orden->id)
                    ->whereNotIn('estado_ejecucion', ['Realizado', 'Cancelado'])
                    ->count();

                if ($pendientes === 0) {
                    $orden->estado = 'Completado';
                    $orden->save();
                }
            }
        }
    }

    /**
     * Obtener ficha por id de grupo de programación (para grupos)
     */
    public function showByGrupo($idGrupo)
    {
        $ficha = FichaOperacional::where('id_grupo_programacion', $idGrupo)
            ->latest()
            ->first();

        if (!$ficha) {
            return response()->json([
                'success' => false,
                'message' => 'Ficha del grupo no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ficha,
        ]);
    }

    /**
     * Listar fichas operacionales con filtros
     */
    public function index(Request $request)
    {
        $query = FichaOperacional::with(['programacionServicio', 'programacionServicioGrupo'])
            ->orderByDesc('created_at');

        // Filtro por estado
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        // Filtro por id_programacion_servicio
        if ($request->filled('id_programacion_servicio')) {
            $query->where('id_programacion_servicio', $request->id_programacion_servicio);
        }

        // Filtro por id_grupo_programacion
        if ($request->filled('id_grupo_programacion')) {
            $query->where('id_grupo_programacion', $request->id_grupo_programacion);
        }

        // Filtro por rango de fechas
        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
        }

        $fichas = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $fichas,
        ]);
    }

    /**
     * Generar PDF de una ficha operacional
     */
    public function generarPDF($id)
    {
        $ficha = FichaOperacional::with([
            'programacionServicio.tecnico',
            'programacionServicio.tecnicos',
        ])->findOrFail($id);

        $tecnicoPrincipalNombre = $this->resolverTecnicoPrincipalNombre($ficha);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('FichaOperacionalPDF', compact('ficha', 'tecnicoPrincipalNombre'));
        $pdf->setPaper('a4', 'portrait');

        $clienteSafe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ficha->cliente ?? 'sin_cliente');
        $fechaSafe = $ficha->fecha ? \Carbon\Carbon::parse($ficha->fecha)->format('Ymd') : 'sin_fecha';

        return $pdf->stream("Ficha_Operacional_{$clienteSafe}_{$fechaSafe}.pdf");
    }

    /**
     * Generar PDF de ficha operacional por id de programación de servicio
     */
    public function generarPDFByProgramacion($id)
    {
        // 1. Buscar por ID de programación
        $ficha = FichaOperacional::with([
                'programacionServicio.tecnico',
                'programacionServicio.tecnicos',
            ])
            ->where('id_programacion_servicio', $id)
            ->latest()
            ->first();

        // 2. Fallback por grupo
        if (!$ficha) {
            $prog = ProgramacionServicio::find($id);
            if ($prog && $prog->id_grupo_programacion) {
                $ficha = FichaOperacional::with([
                        'programacionServicio.tecnico',
                        'programacionServicio.tecnicos',
                    ])
                    ->where('id_grupo_programacion', $prog->id_grupo_programacion)
                    ->latest()
                    ->first();
            }
        }

        if (!$ficha) {
            return response()->json([
                'success' => false,
                'message' => 'Ficha no encontrada para esta programación',
            ], 404);
        }

        $tecnicoPrincipalNombre = $this->resolverTecnicoPrincipalNombre($ficha);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('FichaOperacionalPDF', compact('ficha', 'tecnicoPrincipalNombre'));
        $pdf->setPaper('a4', 'portrait');

        $clienteSafe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ficha->cliente ?? 'sin_cliente');
        $fechaSafe = $ficha->fecha ? \Carbon\Carbon::parse($ficha->fecha)->format('Ymd') : 'sin_fecha';

        return $pdf->stream("Ficha_Operacional_{$clienteSafe}_{$fechaSafe}.pdf");
    }

    /**
     * Generar PDF de ficha operacional por id de grupo de programación
     */
    public function generarPDFByGrupo($idGrupo)
    {
        $ficha = FichaOperacional::with([
                'programacionServicio.tecnico',
                'programacionServicio.tecnicos',
            ])
            ->where('id_grupo_programacion', $idGrupo)
            ->latest()
            ->first();

        if (!$ficha) {
            return response()->json([
                'success' => false,
                'message' => 'Ficha del grupo no encontrada',
            ], 404);
        }

        $tecnicoPrincipalNombre = $this->resolverTecnicoPrincipalNombre($ficha);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('FichaOperacionalPDF', compact('ficha', 'tecnicoPrincipalNombre'));
        $pdf->setPaper('a4', 'portrait');

        $clienteSafe = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ficha->cliente ?? 'sin_cliente');
        $fechaSafe = $ficha->fecha ? \Carbon\Carbon::parse($ficha->fecha)->format('Ymd') : 'sin_fecha';

        return $pdf->stream("Ficha_Operacional_{$clienteSafe}_{$fechaSafe}.pdf");
    }

    private function resolverTecnicoPrincipalNombre(FichaOperacional $ficha): string
    {
        $programacion = $ficha->programacionServicio;
        if (!$programacion) {
            return '---';
        }

        $tecnicoPivotPrincipal = $programacion->tecnicos
            ->first(function ($tecnico) {
                $rol = strtolower(trim((string) ($tecnico->pivot->rol ?? '')));
                return in_array($rol, ['principal', 'tecnico principal', 'titular'], true);
            });

        $tecnico = $tecnicoPivotPrincipal ?? $programacion->tecnico ?? $programacion->tecnicos->first();
        if (!$tecnico) {
            return '---';
        }

        $nombre = trim((string) ($tecnico->nombre ?? ''));
        $apellidos = trim((string) ($tecnico->apellidos ?? ''));
        $fullName = trim($nombre . ' ' . $apellidos);

        return $fullName !== '' ? $fullName : '---';
    }
}
