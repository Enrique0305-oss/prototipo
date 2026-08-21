<?php

namespace App\Services;

use App\Models\Exponente;
use App\Models\Personal;
use App\Models\Tecnico;
use Illuminate\Support\Facades\DB;

class ScheduleConflictService
{
    public static function validarTecnicos(array $tecnicoIds, string $fecha, ?string $horaInicio, ?string $horaFin = null, array $ignore = []): ?array
    {
        // Validaciones de conflicto de agenda desactivadas temporalmente
        return null;

        /*
        $tecnicos = self::normalizeIds($tecnicoIds);
        if (empty($tecnicos)) {
            return null;
        }

        $conflictoDirecto = self::buscarConflictoTecnicoDirecto($tecnicos, $fecha, $horaInicio, $horaFin, $ignore);
        if ($conflictoDirecto) {
            return $conflictoDirecto;
        }

        $vinculos = Tecnico::query()
            ->whereIn('id', $tecnicos)
            ->whereNotNull('id_exponente_vinculado')
            ->pluck('id_exponente_vinculado')
            ->map(fn ($id) => (int) $id)
            ->all();

        $exponentesVinculados = self::normalizeIds($vinculos);
        if (empty($exponentesVinculados)) {
            return null;
        }

        $conflictoVinculado = self::buscarConflictoExponenteDirecto($exponentesVinculados, $fecha, $horaInicio, $horaFin, $ignore);
        if (!$conflictoVinculado) {
            return null;
        }

        $tipo = (string) ($conflictoVinculado['tipo_programacion'] ?? 'Programación');
        $idProgramacion = (int) ($conflictoVinculado['id_programacion'] ?? 0);
        $nombrePersona = (string) ($conflictoVinculado['persona_nombre'] ?? 'La persona seleccionada');
        $horario = self::humanHorario(
            $conflictoVinculado['hora_inicio'] ?? null,
            $conflictoVinculado['hora_fin'] ?? null
        );
        $conflictoVinculado['mensaje'] = 'Conflicto de agenda: ' . $nombrePersona
            . ' ya tiene programación de ' . $tipo
            . ($idProgramacion > 0 ? ' #' . $idProgramacion : '')
            . ' en ese horario (' . $horario . ').';
        return $conflictoVinculado;
        */
    }

    public static function validarExponentes(array $exponenteIds, string $fecha, ?string $horaInicio, ?string $horaFin = null, array $ignore = []): ?array
    {
        // Validaciones de conflicto de agenda desactivadas temporalmente
        return null;

        /*
        $exponentes = self::normalizeIds($exponenteIds);
        if (empty($exponentes)) {
            return null;
        }

        $conflictoDirecto = self::buscarConflictoExponenteDirecto($exponentes, $fecha, $horaInicio, $horaFin, $ignore);
        if ($conflictoDirecto) {
            return $conflictoDirecto;
        }

        $vinculos = Exponente::query()
            ->whereIn('id', $exponentes)
            ->whereNotNull('id_tecnico_vinculado')
            ->pluck('id_tecnico_vinculado')
            ->map(fn ($id) => (int) $id)
            ->all();

        $tecnicosVinculados = self::normalizeIds($vinculos);
        if (empty($tecnicosVinculados)) {
            return null;
        }

        $conflictoVinculado = self::buscarConflictoTecnicoDirecto($tecnicosVinculados, $fecha, $horaInicio, $horaFin, $ignore);
        if (!$conflictoVinculado) {
            return null;
        }

        $tipo = (string) ($conflictoVinculado['tipo_programacion'] ?? 'Programación');
        $idProgramacion = (int) ($conflictoVinculado['id_programacion'] ?? 0);
        $nombrePersona = (string) ($conflictoVinculado['persona_nombre'] ?? 'La persona seleccionada');
        $horario = self::humanHorario(
            $conflictoVinculado['hora_inicio'] ?? null,
            $conflictoVinculado['hora_fin'] ?? null
        );
        $conflictoVinculado['mensaje'] = 'Conflicto de agenda: ' . $nombrePersona
            . ' ya tiene programación de ' . $tipo
            . ($idProgramacion > 0 ? ' #' . $idProgramacion : '')
            . ' en ese horario (' . $horario . ').';
        return $conflictoVinculado;
        */
    }

    public static function validarPersonal(array $personalIds, string $fecha, ?string $horaInicio, ?string $horaFin = null, array $ignore = []): ?array
    {
        // Validaciones de conflicto de agenda desactivadas temporalmente
        return null;

        /*
        $personal = self::normalizeIds($personalIds);
        if (empty($personal)) {
            return null;
        }

        return self::buscarConflictoPersonalDirecto($personal, $fecha, $horaInicio, $horaFin, $ignore);
        */
    }

    private static function buscarConflictoTecnicoDirecto(array $tecnicoIds, string $fecha, ?string $horaInicio, ?string $horaFin, array $ignore): ?array
    {
        $mapNombres = Tecnico::query()
            ->whereIn('id', $tecnicoIds)
            ->get(['id', 'nombre', 'apellidos'])
            ->mapWithKeys(fn (Tecnico $t) => [(int) $t->id => trim(($t->nombre ?? '') . ' ' . ($t->apellidos ?? ''))])
            ->all();

        $servicios = DB::table('programacion_servicio')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_tecnico_asignado', 'id_supervisor', 'id_vehiculo', 'requiere_asignacion_recursos')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->where(function ($q) {
                $q->whereNull('requiere_asignacion_recursos')
                    ->orWhere('requiere_asignacion_recursos', false);
            })
            ->when(isset($ignore['programacion_servicio']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_servicio']))
            ->get();

        if ($servicios->isNotEmpty()) {
            $pivot = DB::table('programacion_tecnicos')
                ->whereIn('id_programacion', $servicios->pluck('id')->all())
                ->get(['id_programacion', 'id_tecnico'])
                ->groupBy('id_programacion');

            foreach ($servicios as $row) {
                $asignados = [(int) ($row->id_tecnico_asignado ?? 0)];
                foreach (($pivot[(int) $row->id] ?? collect()) as $p) {
                    $asignados[] = (int) $p->id_tecnico;
                }

                if (!self::servicioBloqueaAgenda($row, $asignados, null)) {
                    continue;
                }

                $asignados = self::normalizeIds($asignados);
                $idConflicto = self::firstIntersectingId($tecnicoIds, $asignados);
                if (!$idConflicto) {
                    continue;
                }

                if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                    return self::buildConflict(
                        'Servicio',
                        'programacion_servicio',
                        (int) $row->id,
                        $fecha,
                        $row->hora_inicio,
                        $row->hora_fin,
                        $idConflicto,
                        $mapNombres[$idConflicto] ?? ('Técnico #' . $idConflicto),
                        'tecnico'
                    );
                }
            }
        }

        $visitas = DB::table('programacion_visita')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_tecnico_asignado', 'tecnicos_ids')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_visita']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_visita']))
            ->get();

        foreach ($visitas as $row) {
            $asignados = [(int) ($row->id_tecnico_asignado ?? 0)];
            $asignados = array_merge($asignados, self::normalizeIds(json_decode((string) ($row->tecnicos_ids ?? '[]'), true) ?: []));
            $asignados = self::normalizeIds($asignados);

            $idConflicto = self::firstIntersectingId($tecnicoIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Visita',
                    'programacion_visita',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Técnico #' . $idConflicto),
                    'tecnico'
                );
            }
        }

        $fabricaciones = DB::table('programacion_fabricacion')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_tecnico_asignado', 'tecnicos_ids')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_fabricacion']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_fabricacion']))
            ->get();

        foreach ($fabricaciones as $row) {
            $asignados = [(int) ($row->id_tecnico_asignado ?? 0)];
            $asignados = array_merge($asignados, self::normalizeIds(json_decode((string) ($row->tecnicos_ids ?? '[]'), true) ?: []));
            $asignados = self::normalizeIds($asignados);

            $idConflicto = self::firstIntersectingId($tecnicoIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Fabricación',
                    'programacion_fabricacion',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Técnico #' . $idConflicto),
                    'tecnico'
                );
            }
        }

        $otros = DB::table('programacion_otros')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_tecnico_asignado', 'tecnicos_ids')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_otros']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_otros']))
            ->get();

        foreach ($otros as $row) {
            $asignados = [(int) ($row->id_tecnico_asignado ?? 0)];
            $asignados = array_merge($asignados, self::extractIdsFromJsonColumn($row->tecnicos_ids ?? null));
            $asignados = self::normalizeIds($asignados);

            $idConflicto = self::firstIntersectingId($tecnicoIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Otros',
                    'programacion_otros',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Técnico #' . $idConflicto),
                    'tecnico'
                );
            }
        }

        return null;
    }

    private static function buscarConflictoPersonalDirecto(array $personalIds, string $fecha, ?string $horaInicio, ?string $horaFin, array $ignore): ?array
    {
        $mapNombres = Personal::query()
            ->whereIn('id', $personalIds)
            ->get(['id', 'nombre', 'apellidos'])
            ->mapWithKeys(fn (Personal $p) => [(int) $p->id => trim(($p->nombre ?? '') . ' ' . ($p->apellidos ?? ''))])
            ->all();

        $servicios = DB::table('programacion_servicio')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_supervisor', 'id_vehiculo', 'requiere_asignacion_recursos')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->where(function ($q) {
                $q->whereNull('requiere_asignacion_recursos')
                    ->orWhere('requiere_asignacion_recursos', false);
            })
            ->when(isset($ignore['programacion_servicio']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_servicio']))
            ->get();

        foreach ($servicios as $row) {
            if (!self::servicioBloqueaAgenda($row, null, null)) {
                continue;
            }

            $asignados = self::extractIdsFromJsonColumn($row->id_supervisor ?? null);
            $idConflicto = self::firstIntersectingId($personalIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Servicio',
                    'programacion_servicio',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Personal #' . $idConflicto),
                    'personal'
                );
            }
        }

        $visitas = DB::table('programacion_visita')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_supervisor')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_visita']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_visita']))
            ->get();

        foreach ($visitas as $row) {
            $asignados = self::extractIdsFromJsonColumn($row->id_supervisor ?? null);
            $idConflicto = self::firstIntersectingId($personalIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Visita',
                    'programacion_visita',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Personal #' . $idConflicto),
                    'personal'
                );
            }
        }

        $fabricaciones = DB::table('programacion_fabricacion')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_supervisor')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_fabricacion']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_fabricacion']))
            ->get();

        foreach ($fabricaciones as $row) {
            $asignados = self::extractIdsFromJsonColumn($row->id_supervisor ?? null);
            $idConflicto = self::firstIntersectingId($personalIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Fabricación',
                    'programacion_fabricacion',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Personal #' . $idConflicto),
                    'personal'
                );
            }
        }

        $otros = DB::table('programacion_otros')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_supervisor')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_otros']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_otros']))
            ->get();

        foreach ($otros as $row) {
            $asignados = self::extractIdsFromJsonColumn($row->id_supervisor ?? null);
            $idConflicto = self::firstIntersectingId($personalIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Otros',
                    'programacion_otros',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Personal #' . $idConflicto),
                    'personal'
                );
            }
        }

        $capacitaciones = DB::table('programacion_capacitacion')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_supervisor')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_capacitacion']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_capacitacion']))
            ->get();

        foreach ($capacitaciones as $row) {
            $asignados = self::extractIdsFromJsonColumn($row->id_supervisor ?? null);
            $idConflicto = self::firstIntersectingId($personalIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Capacitación',
                    'programacion_capacitacion',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Personal #' . $idConflicto),
                    'personal'
                );
            }
        }

        $asesorias = DB::table('programacion_asesoria')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_supervisor')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_asesoria']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_asesoria']))
            ->get();

        foreach ($asesorias as $row) {
            $asignados = self::extractIdsFromJsonColumn($row->id_supervisor ?? null);
            $idConflicto = self::firstIntersectingId($personalIds, $asignados);
            if (!$idConflicto) {
                continue;
            }

            if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                return self::buildConflict(
                    'Asesoría',
                    'programacion_asesoria',
                    (int) $row->id,
                    $fecha,
                    $row->hora_inicio,
                    $row->hora_fin,
                    $idConflicto,
                    $mapNombres[$idConflicto] ?? ('Personal #' . $idConflicto),
                    'personal'
                );
            }
        }

        return null;
    }

    private static function buscarConflictoExponenteDirecto(array $exponenteIds, string $fecha, ?string $horaInicio, ?string $horaFin, array $ignore): ?array
    {
        $mapNombres = Exponente::query()
            ->whereIn('id', $exponenteIds)
            ->get(['id', 'nombre', 'apellidos'])
            ->mapWithKeys(fn (Exponente $e) => [(int) $e->id => trim(($e->nombre ?? '') . ' ' . ($e->apellidos ?? ''))])
            ->all();

        $capacitaciones = DB::table('programacion_capacitacion')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_capacitacion']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_capacitacion']))
            ->get();

        if ($capacitaciones->isNotEmpty()) {
            $pivot = DB::table('programacion_capacitacion_exponentes')
                ->whereIn('id_programacion_capacitacion', $capacitaciones->pluck('id')->all())
                ->get(['id_programacion_capacitacion', 'id_exponente'])
                ->groupBy('id_programacion_capacitacion');

            foreach ($capacitaciones as $row) {
                $asignados = collect($pivot[(int) $row->id] ?? [])->pluck('id_exponente')->map(fn ($id) => (int) $id)->all();
                $idConflicto = self::firstIntersectingId($exponenteIds, self::normalizeIds($asignados));
                if (!$idConflicto) {
                    continue;
                }

                if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                    return self::buildConflict(
                        'Capacitación',
                        'programacion_capacitacion',
                        (int) $row->id,
                        $fecha,
                        $row->hora_inicio,
                        $row->hora_fin,
                        $idConflicto,
                        $mapNombres[$idConflicto] ?? ('Exponente #' . $idConflicto),
                        'exponente'
                    );
                }
            }
        }

        $asesorias = DB::table('programacion_asesoria')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->when(isset($ignore['programacion_asesoria']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_asesoria']))
            ->get();

        if ($asesorias->isNotEmpty()) {
            $pivot = DB::table('programacion_asesoria_exponentes')
                ->whereIn('id_programacion_asesoria', $asesorias->pluck('id')->all())
                ->get(['id_programacion_asesoria', 'id_exponente'])
                ->groupBy('id_programacion_asesoria');

            foreach ($asesorias as $row) {
                $asignados = collect($pivot[(int) $row->id] ?? [])->pluck('id_exponente')->map(fn ($id) => (int) $id)->all();
                $idConflicto = self::firstIntersectingId($exponenteIds, self::normalizeIds($asignados));
                if (!$idConflicto) {
                    continue;
                }

                if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                    return self::buildConflict(
                        'Asesoría',
                        'programacion_asesoria',
                        (int) $row->id,
                        $fecha,
                        $row->hora_inicio,
                        $row->hora_fin,
                        $idConflicto,
                        $mapNombres[$idConflicto] ?? ('Exponente #' . $idConflicto),
                        'exponente'
                    );
                }
            }
        }

        $servicios = DB::table('programacion_servicio')
            ->select('id', 'fecha_programada', 'hora_inicio', 'hora_fin', 'id_supervisor', 'id_vehiculo', 'requiere_asignacion_recursos')
            ->whereDate('fecha_programada', $fecha)
            ->where('estado_ejecucion', '!=', 'Cancelado')
            ->where(function ($q) {
                $q->whereNull('requiere_asignacion_recursos')
                    ->orWhere('requiere_asignacion_recursos', false);
            })
            ->when(isset($ignore['programacion_servicio']), fn ($q) => $q->where('id', '!=', (int) $ignore['programacion_servicio']))
            ->get();

        if ($servicios->isNotEmpty()) {
            $pivot = DB::table('programacion_exponentes')
                ->whereIn('id_programacion', $servicios->pluck('id')->all())
                ->get(['id_programacion', 'id_exponente'])
                ->groupBy('id_programacion');

            foreach ($servicios as $row) {
                $asignados = collect($pivot[(int) $row->id] ?? [])->pluck('id_exponente')->map(fn ($id) => (int) $id)->all();
                if (!self::servicioBloqueaAgenda($row, null, $asignados)) {
                    continue;
                }

                $idConflicto = self::firstIntersectingId($exponenteIds, self::normalizeIds($asignados));
                if (!$idConflicto) {
                    continue;
                }

                if (self::timeOverlaps($horaInicio, $horaFin, $row->hora_inicio, $row->hora_fin)) {
                    return self::buildConflict(
                        'Servicio',
                        'programacion_servicio',
                        (int) $row->id,
                        $fecha,
                        $row->hora_inicio,
                        $row->hora_fin,
                        $idConflicto,
                        $mapNombres[$idConflicto] ?? ('Exponente #' . $idConflicto),
                        'exponente'
                    );
                }
            }
        }

        return null;
    }

    private static function buildConflict(string $tipoProgramacion, string $origenTabla, int $referenciaId, string $fecha, ?string $horaInicio, ?string $horaFin, int $personaId, string $personaNombre, string $personaTipo): array
    {
        $horario = self::humanHorario($horaInicio, $horaFin);

        return [
            'tipo_programacion' => $tipoProgramacion,
            'origen_tabla' => $origenTabla,
            'id_programacion' => $referenciaId,
            'fecha_programada' => $fecha,
            'hora_inicio' => self::normalizeTime($horaInicio),
            'hora_fin' => self::normalizeTime($horaFin),
            'persona_tipo' => $personaTipo,
            'persona_id' => $personaId,
            'persona_nombre' => $personaNombre,
            'mensaje' => 'Conflicto de agenda: ' . $personaNombre
                . ' ya tiene programación de ' . mb_strtolower($tipoProgramacion, 'UTF-8')
                . ' en ese horario (' . $tipoProgramacion . ' #' . $referenciaId . ', ' . $horario . ').',
        ];
    }

    private static function humanHorario(?string $horaInicio, ?string $horaFin): string
    {
        $inicio = self::normalizeTime($horaInicio);
        $fin = self::normalizeTime($horaFin);

        if (!$inicio && !$fin) {
            return 'hora no especificada';
        }

        $inicioCorto = $inicio ? substr($inicio, 0, 5) : '--:--';
        $finCorto = $fin ? substr($fin, 0, 5) : $inicioCorto;

        return $inicioCorto . ' - ' . $finCorto;
    }

    private static function normalizeIds(array $ids): array
    {
        return array_values(array_unique(array_filter(array_map('intval', $ids), fn (int $id) => $id > 0)));
    }

    private static function extractIdsFromJsonColumn(mixed $value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_array($value)) {
            return self::normalizeIds($value);
        }

        if (is_int($value) || (is_string($value) && ctype_digit($value))) {
            return [(int) $value];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                if (is_array($decoded)) {
                    return self::normalizeIds($decoded);
                }
                if (is_int($decoded) || (is_string($decoded) && ctype_digit($decoded))) {
                    return [(int) $decoded];
                }
            }
        }

        return [];
    }

    private static function firstIntersectingId(array $left, array $right): ?int
    {
        $set = array_flip(self::normalizeIds($right));
        foreach (self::normalizeIds($left) as $id) {
            if (isset($set[$id])) {
                return $id;
            }
        }
        return null;
    }

    private static function servicioBloqueaAgenda(object $row, ?array $tecnicosAsignados, ?array $exponentesAsignados): bool
    {
        if (!empty($row->requiere_asignacion_recursos)) {
            return false;
        }

        $tieneHoraInicio = self::normalizeTime($row->hora_inicio ?? null) !== null;
        $tieneHoraFin = self::normalizeTime($row->hora_fin ?? null) !== null;
        if (!$tieneHoraInicio || !$tieneHoraFin) {
            return false;
        }

        if (is_array($tecnicosAsignados)) {
            return !empty(self::normalizeIds($tecnicosAsignados));
        }

        if (is_array($exponentesAsignados)) {
            return !empty(self::normalizeIds($exponentesAsignados));
        }

        $supervisores = self::extractIdsFromJsonColumn($row->id_supervisor ?? null);
        if (empty($supervisores)) {
            return false;
        }

        return true;
    }

    private static function normalizeTime(?string $time): ?string
    {
        if (!$time) {
            return null;
        }

        $value = trim($time);
        if ($value === '') {
            return null;
        }

        return substr($value, 0, 8);
    }

    private static function timeOverlaps(?string $inicioA, ?string $finA, ?string $inicioB, ?string $finB): bool
    {
        $inicioA = self::normalizeTime($inicioA);
        $finA = self::normalizeTime($finA) ?? $inicioA;
        $inicioB = self::normalizeTime($inicioB);
        $finB = self::normalizeTime($finB) ?? $inicioB;

        if (!$inicioA || !$inicioB) {
            return true;
        }

        $a1 = strtotime('1970-01-01 ' . $inicioA);
        $a2 = strtotime('1970-01-01 ' . ($finA ?: $inicioA));
        $b1 = strtotime('1970-01-01 ' . $inicioB);
        $b2 = strtotime('1970-01-01 ' . ($finB ?: $inicioB));

        if ($a1 === false || $a2 === false || $b1 === false || $b2 === false) {
            return true;
        }

        if ($a2 < $a1) {
            $a2 = $a1;
        }

        if ($b2 < $b1) {
            $b2 = $b1;
        }

        return $a1 <= $b2 && $b1 <= $a2;
    }
}
