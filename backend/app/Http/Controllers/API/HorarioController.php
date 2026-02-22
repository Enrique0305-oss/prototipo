<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RrhhHorario;
use App\Models\Personal;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HorarioController extends Controller
{
    /**
     * Días válidos (enum de la BD)
     */
    private const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    /**
     * GET /horarios
     * Lista empleados con estado de su horario
     */
    public function index(Request $request)
    {
        $personal = Personal::with('area')
            ->select('id', 'nombre', 'apellidos', 'correo', 'id_area')
            ->get()
            ->map(function ($p) {
                $horarios = RrhhHorario::where('id_personal', $p->id)->get();
                $diasConfigurados = $horarios->count();
                $diasLaborales = $horarios->where('es_descanso', false)->count();
                $diasDescanso = $horarios->where('es_descanso', true)->count();

                return [
                    'id' => $p->id,
                    'nombre' => $p->nombre . ' ' . $p->apellidos,
                    'correo' => $p->correo,
                    'area' => $p->area ? $p->area->nombre : 'Sin área',
                    'dias_configurados' => $diasConfigurados,
                    'dias_laborales' => $diasLaborales,
                    'dias_descanso' => $diasDescanso,
                    'estado' => $diasConfigurados === 7 ? 'Completo' : ($diasConfigurados > 0 ? 'Parcial' : 'Pendiente'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $personal,
        ]);
    }

    /**
     * GET /horarios/{idPersonal}
     * Obtener horario completo de un empleado (7 días)
     */
    public function show(int $idPersonal)
    {
        $personal = Personal::with('area')->find($idPersonal);
        if (!$personal) {
            return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);
        }

        $horarios = RrhhHorario::where('id_personal', $idPersonal)
            ->orderByRaw("FIELD(dia_semana, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo')")
            ->get()
            ->map(fn ($h) => [
                'id' => $h->id,
                'dia_semana' => $h->dia_semana,
                'hora_entrada' => $h->es_descanso ? null : Carbon::parse($h->hora_entrada_esperada)->format('H:i'),
                'hora_salida' => $h->es_descanso ? null : Carbon::parse($h->hora_salida_esperada)->format('H:i'),
                'tolerancia' => $h->tolerancia_minutos,
                'es_descanso' => $h->es_descanso,
                'activo' => $h->activo,
            ]);

        // Construir mapa de los 7 días (los que faltan van como null)
        $mapaHorarios = [];
        foreach (self::DIAS_SEMANA as $dia) {
            $existente = $horarios->firstWhere('dia_semana', $dia);
            $mapaHorarios[] = $existente ?? [
                'id' => null,
                'dia_semana' => $dia,
                'hora_entrada' => null,
                'hora_salida' => null,
                'tolerancia' => 10,
                'es_descanso' => false,
                'activo' => true,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'personal' => [
                    'id' => $personal->id,
                    'nombre' => $personal->nombre . ' ' . $personal->apellidos,
                    'area' => $personal->area ? $personal->area->nombre : 'Sin área',
                ],
                'horarios' => $mapaHorarios,
            ],
        ]);
    }

    /**
     * POST /horarios/{idPersonal}
     * Guardar horario completo de un empleado (7 días)
     * Body: { dias: [ { dia_semana, hora_entrada, hora_salida, tolerancia, es_descanso } x7 ] }
     */
    public function store(Request $request, int $idPersonal)
    {
        $personal = Personal::find($idPersonal);
        if (!$personal) {
            return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);
        }

        $request->validate([
            'dias' => 'required|array|size:7',
            'dias.*.dia_semana' => 'required|in:' . implode(',', self::DIAS_SEMANA),
            'dias.*.es_descanso' => 'required|boolean',
            'dias.*.hora_entrada' => 'nullable|date_format:H:i',
            'dias.*.hora_salida' => 'nullable|date_format:H:i',
            'dias.*.tolerancia' => 'nullable|integer|min:0|max:60',
        ]);

        // Validar que días laborales tengan hora de entrada y salida
        foreach ($request->dias as $dia) {
            if (!$dia['es_descanso']) {
                if (empty($dia['hora_entrada']) || empty($dia['hora_salida'])) {
                    return response()->json([
                        'success' => false,
                        'message' => "El día {$dia['dia_semana']} es laboral pero no tiene hora de entrada/salida"
                    ], 422);
                }
            }
        }

        // Eliminar horarios existentes del empleado y crear nuevos
        RrhhHorario::where('id_personal', $idPersonal)->delete();

        $creados = 0;
        foreach ($request->dias as $dia) {
            RrhhHorario::create([
                'id_personal' => $idPersonal,
                'dia_semana' => $dia['dia_semana'],
                'hora_entrada_esperada' => $dia['es_descanso'] ? '00:00:00' : $dia['hora_entrada'] . ':00',
                'hora_salida_esperada' => $dia['es_descanso'] ? '00:00:00' : $dia['hora_salida'] . ':00',
                'tolerancia_minutos' => $dia['tolerancia'] ?? 10,
                'es_descanso' => $dia['es_descanso'],
                'activo' => true,
            ]);
            $creados++;
        }

        return response()->json([
            'success' => true,
            'message' => "Horario guardado para {$personal->nombre} {$personal->apellidos} ({$creados} días configurados)",
        ]);
    }

    /**
     * POST /horarios/{idPersonal}/copiar-de/{idOrigen}
     * Copiar horario de un empleado a otro
     */
    public function copiarHorario(int $idPersonal, int $idOrigen)
    {
        $destino = Personal::find($idPersonal);
        $origen = Personal::find($idOrigen);

        if (!$destino || !$origen) {
            return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);
        }

        $horariosOrigen = RrhhHorario::where('id_personal', $idOrigen)->get();
        if ($horariosOrigen->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'El empleado origen no tiene horarios configurados'], 422);
        }

        // Eliminar horarios del destino
        RrhhHorario::where('id_personal', $idPersonal)->delete();

        // Copiar
        foreach ($horariosOrigen as $h) {
            RrhhHorario::create([
                'id_personal' => $idPersonal,
                'dia_semana' => $h->dia_semana,
                'hora_entrada_esperada' => $h->hora_entrada_esperada,
                'hora_salida_esperada' => $h->hora_salida_esperada,
                'tolerancia_minutos' => $h->tolerancia_minutos,
                'es_descanso' => $h->es_descanso,
                'activo' => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Horario copiado de {$origen->nombre} {$origen->apellidos} a {$destino->nombre} {$destino->apellidos}",
        ]);
    }
}
