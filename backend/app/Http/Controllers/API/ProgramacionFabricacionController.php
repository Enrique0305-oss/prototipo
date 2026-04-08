<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\OrdenFabricacion;
use App\Models\ProgramacionFabricacion;
use App\Services\ScheduleConflictService;
use Illuminate\Http\Request;

class ProgramacionFabricacionController extends Controller
{
    private function buildRecetaFromOrden(OrdenFabricacion $orden): array
    {
        return $orden->detalles->map(function ($detalle) {
            return [
                'id' => $detalle->id_producto_final,
                'descripcion' => $detalle->producto?->descripcion,
                'cantidad_a_fabricar' => (float) $detalle->cantidad,
                'receta' => $detalle->receta_snapshot ?? [],
                'insumos_requeridos' => $detalle->insumos_requeridos ?? [],
            ];
        })->values()->all();
    }

    private function extractProductosFromOrden(OrdenFabricacion $orden): array
    {
        return $orden->detalles
            ->pluck('id_producto_final')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    public function index(Request $request)
    {
        $query = ProgramacionFabricacion::with(['tecnico', 'ordenFabricacion.detalles.producto']);

        if ($request->filled('fecha')) {
            $query->whereDate('fecha_programada', $request->fecha);
        }

        if ($request->filled('mes') && $request->filled('anio')) {
            $query->whereMonth('fecha_programada', $request->mes)
                ->whereYear('fecha_programada', $request->anio);
        } elseif ($request->filled('anio')) {
            $query->whereYear('fecha_programada', $request->anio);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha_programada', [$request->fecha_inicio, $request->fecha_fin]);
        }

        if ($request->filled('id_tecnico')) {
            $query->where('id_tecnico_asignado', $request->id_tecnico);
        }

        if ($request->filled('estado')) {
            $query->where('estado_ejecucion', $request->estado);
        }

        $programaciones = $query->orderBy('fecha_programada', 'asc')
            ->orderBy('hora_inicio', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $programaciones,
        ]);
    }

    public function show($id)
    {
        $programacion = ProgramacionFabricacion::with(['tecnico', 'ordenFabricacion.detalles.producto'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $programacion,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_orden_fabricacion' => 'required|integer|exists:orden_fabricacion,id',
            'id_tecnico_asignado' => 'nullable|integer|exists:tecnicos,id',
            'tecnicos_ids' => 'nullable|array',
            'tecnicos_ids.*' => 'integer|exists:tecnicos,id',
            'id_supervisor' => 'nullable|array',
            'id_supervisor.*' => 'integer|exists:personal,id',
            'fecha_programada' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fin' => 'nullable',
            'observaciones' => 'nullable|string',
        ]);

        $orden = OrdenFabricacion::with(['detalles.producto'])
            ->findOrFail((int) $validated['id_orden_fabricacion']);

        if (in_array($orden->estado, ['Anulada', 'Fabricada'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'La orden de fabricacion seleccionada no puede programarse por su estado actual.',
            ], 422);
        }

        $productoIds = $this->extractProductosFromOrden($orden);

        $tecnicosAsignados = $this->normalizeIds(array_merge(
            [$validated['id_tecnico_asignado'] ?? null],
            $validated['tecnicos_ids'] ?? []
        ));

        if (!empty($tecnicosAsignados)) {
            $conflicto = ScheduleConflictService::validarTecnicos(
                $tecnicosAsignados,
                $validated['fecha_programada'],
                $validated['hora_inicio'] ?? null,
                $validated['hora_fin'] ?? null
            );

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => $conflicto['mensaje'],
                    'conflicto' => $conflicto,
                ], 422);
            }
        }

        $programacion = ProgramacionFabricacion::create([
            'id_orden_fabricacion' => $orden->id,
            'motivo_fabricacion' => $orden->motivo ?: ('Orden ' . $orden->codigo),
            'productos_fabricacion' => $productoIds,
            'receta_fabricacion' => $this->buildRecetaFromOrden($orden),
            'id_tecnico_asignado' => $validated['id_tecnico_asignado'] ?? null,
            'tecnicos_ids' => !empty($validated['tecnicos_ids']) ? array_values(array_unique(array_map('intval', $validated['tecnicos_ids']))) : null,
            'id_supervisor' => !empty($validated['id_supervisor']) ? array_values(array_unique(array_map('intval', $validated['id_supervisor']))) : null,
            'fecha_programada' => $validated['fecha_programada'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin' => $validated['hora_fin'] ?? null,
            'estado_ejecucion' => 'Programado',
            'observaciones' => $validated['observaciones'] ?? null,
            'creado_por' => $request->user()?->id,
        ]);

        if ($orden->estado === 'Confirmada') {
            $orden->update(['estado' => 'Programada']);
        }

        $programacion->load(['tecnico', 'ordenFabricacion.detalles.producto']);

        return response()->json([
            'success' => true,
            'message' => 'Programación de fabricación creada exitosamente',
            'data' => $programacion,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $programacion = ProgramacionFabricacion::findOrFail($id);

        $validated = $request->validate([
            'id_orden_fabricacion' => 'sometimes|required|integer|exists:orden_fabricacion,id',
            'motivo_fabricacion' => 'sometimes|required|string|max:255',
            'productos_fabricacion' => 'sometimes|array|min:1',
            'productos_fabricacion.*' => 'integer|exists:productos,id',
            'id_tecnico_asignado' => 'sometimes|nullable|integer|exists:tecnicos,id',
            'tecnicos_ids' => 'nullable|array',
            'tecnicos_ids.*' => 'integer|exists:tecnicos,id',
            'id_supervisor' => 'nullable|array',
            'id_supervisor.*' => 'integer|exists:personal,id',
            'fecha_programada' => 'sometimes|required|date',
            'hora_inicio' => 'sometimes|required',
            'hora_fin' => 'nullable',
            'estado_ejecucion' => 'nullable|in:Programado,Confirmado,En Camino,En Ejecución,Realizado,Reprogramado,Cancelado',
            'observaciones' => 'nullable|string',
        ]);

        if (array_key_exists('id_orden_fabricacion', $validated)) {
            $orden = OrdenFabricacion::with(['detalles.producto'])
                ->findOrFail((int) $validated['id_orden_fabricacion']);

            if (in_array($orden->estado, ['Anulada', 'Fabricada'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La orden de fabricacion seleccionada no puede usarse en programacion.',
                ], 422);
            }

            $validated['productos_fabricacion'] = $this->extractProductosFromOrden($orden);
            $validated['receta_fabricacion'] = $this->buildRecetaFromOrden($orden);
            $validated['motivo_fabricacion'] = $orden->motivo ?: ('Orden ' . $orden->codigo);
        }

        if (array_key_exists('tecnicos_ids', $validated)) {
            $validated['tecnicos_ids'] = !empty($validated['tecnicos_ids'])
                ? array_values(array_unique(array_map('intval', $validated['tecnicos_ids'])))
                : null;
        }

        if (array_key_exists('id_supervisor', $validated)) {
            $validated['id_supervisor'] = !empty($validated['id_supervisor'])
                ? array_values(array_unique(array_map('intval', $validated['id_supervisor'])))
                : null;
        }

        if (array_key_exists('productos_fabricacion', $validated) && !array_key_exists('id_orden_fabricacion', $validated)) {
            $validated['productos_fabricacion'] = array_values(array_unique(array_map('intval', $validated['productos_fabricacion'] ?? [])));
        }

        $tecnicosFinales = $this->normalizeIds(array_merge(
            [array_key_exists('id_tecnico_asignado', $validated) ? ($validated['id_tecnico_asignado'] ?? null) : $programacion->id_tecnico_asignado],
            array_key_exists('tecnicos_ids', $validated) ? ($validated['tecnicos_ids'] ?? []) : ((array) ($programacion->tecnicos_ids ?? []))
        ));

        if (!empty($tecnicosFinales)) {
            $conflicto = ScheduleConflictService::validarTecnicos(
                $tecnicosFinales,
                (string) ($validated['fecha_programada'] ?? $programacion->fecha_programada),
                $validated['hora_inicio'] ?? $programacion->hora_inicio,
                array_key_exists('hora_fin', $validated) ? ($validated['hora_fin'] ?? null) : $programacion->hora_fin,
                ['programacion_fabricacion' => (int) $programacion->id]
            );

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => $conflicto['mensaje'],
                    'conflicto' => $conflicto,
                ], 422);
            }
        }

        $programacion->update($validated);
        $programacion->load(['tecnico', 'ordenFabricacion.detalles.producto']);

        return response()->json([
            'success' => true,
            'message' => 'Programación de fabricación actualizada exitosamente',
            'data' => $programacion,
        ]);
    }

    public function destroy($id)
    {
        $programacion = ProgramacionFabricacion::findOrFail($id);
        $idOrden = $programacion->id_orden_fabricacion;
        $programacion->delete();

        if ($idOrden) {
            $orden = OrdenFabricacion::find($idOrden);
            if ($orden && $orden->estado === 'Programada') {
                $tieneProgramacionesActivas = ProgramacionFabricacion::query()
                    ->where('id_orden_fabricacion', $idOrden)
                    ->where('estado_ejecucion', '!=', 'Cancelado')
                    ->exists();
                if (!$tieneProgramacionesActivas) {
                    $orden->update(['estado' => 'Confirmada']);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Programación de fabricación eliminada exitosamente',
        ]);
    }

    private function normalizeIds(array $ids): array
    {
        return array_values(array_unique(array_filter(array_map('intval', $ids), fn (int $id) => $id > 0)));
    }
}
