<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Programacion Operativa — {{ $titulo }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.4; padding: 15px; font-size: 11px; }
        .container { max-width: 100%; margin: 0 auto; }

        /* ENCABEZADO */
        .logo-container { text-align: center; margin-bottom: 10px; }
        .logo-container img { max-width: 100%; height: auto; }

        .main-title {
            background-color: #2E4A7C; color: white; text-align: center;
            padding: 10px; font-size: 18px; font-weight: bold; letter-spacing: 2px; margin-bottom: 3px;
        }
        .sub-title {
            background-color: #6CB52D; color: white; text-align: center;
            padding: 6px; font-size: 12px; font-weight: bold; margin-bottom: 15px;
        }

        /* STATS RESUMEN */
        .stats-bar {
            display: table; width: 100%; margin-bottom: 15px;
            border: 1px solid #ddd; border-radius: 4px; background: #fafafa;
        }
        .stats-bar .stat-item {
            display: table-cell; text-align: center; padding: 8px 4px;
            border-right: 1px solid #ddd;
        }
        .stats-bar .stat-item:last-child { border-right: none; }
        .stats-bar .stat-value { font-size: 16px; font-weight: bold; color: #2E4A7C; }
        .stats-bar .stat-label { font-size: 9px; color: #888; text-transform: uppercase; }

        /* MENSUAL: Grilla de calendario */
        .cal-grid { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .cal-grid th {
            background: #2E4A7C; color: #fff; padding: 6px 4px; text-align: center;
            font-size: 10px; font-weight: 600; border: 1px solid #2E4A7C;
        }
        .cal-grid td {
            border: 1px solid #ddd; vertical-align: top; padding: 3px;
            width: 14.28%; height: 80px; font-size: 9px;
        }
        .cal-grid td.other-month { background: #f5f5f5; color: #bbb; }
        .cal-grid td.today { background: #eef6ff; }
        .cal-day-num { font-weight: bold; font-size: 11px; margin-bottom: 2px; color: #555; }
        .cal-event {
            padding: 1px 3px; margin-bottom: 1px; border-radius: 2px;
            font-size: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
        }
        .cal-event.programado { background: #dbeafe; color: #1e40af; }
        .cal-event.confirmado { background: #fef3c7; color: #92400e; }
        .cal-event.en-camino { background: #e0e7ff; color: #3730a3; }
        .cal-event.en-ejecucion { background: #fce7f3; color: #be185d; }
        .cal-event.realizado { background: #dcfce7; color: #166534; }
        .cal-event.reprogramado { background: #fef2f2; color: #991b1b; }
        .cal-event.cancelado { background: #f1f5f9; color: #64748b; text-decoration: line-through; }
        .cal-more { font-size: 7px; color: #888; font-style: italic; }

        /* SEMANAL / DIARIA: Tabla detallada */
        .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .detail-table th {
            background: #2E4A7C; color: #fff; padding: 6px 8px;
            text-align: left; font-size: 10px; border: 1px solid #2E4A7C;
        }
        .detail-table td {
            padding: 5px 8px; border: 1px solid #ddd; font-size: 10px; vertical-align: top;
        }
        .detail-table tr:nth-child(even) { background: #fafafa; }

        .badge {
            display: inline-block; padding: 1px 6px; border-radius: 3px;
            font-size: 8px; font-weight: bold; text-transform: uppercase;
        }
        .badge-programado { background: #dbeafe; color: #1e40af; }
        .badge-confirmado { background: #fef3c7; color: #92400e; }
        .badge-en-camino { background: #e0e7ff; color: #3730a3; }
        .badge-en-ejecucion { background: #fce7f3; color: #be185d; }
        .badge-realizado { background: #dcfce7; color: #166534; }
        .badge-reprogramado { background: #fef2f2; color: #991b1b; }
        .badge-cancelado { background: #f1f5f9; color: #64748b; }

        /* SEMANAL: día header */
        .week-day-header {
            background: #f0f4ff; color: #2E4A7C; font-weight: bold;
            padding: 6px 8px; font-size: 12px; border: 1px solid #ddd; margin-top: 10px;
        }
        .week-day-header.today-header { background: #2E4A7C; color: #fff; }

        /* FOOTER */
        .pdf-footer {
            margin-top: 20px; padding-top: 8px; border-top: 2px solid #2E4A7C;
            text-align: center; font-size: 9px; color: #999;
        }

        .page-break { page-break-before: always; }

        /* Leyenda de estados */
        .legend { margin-bottom: 12px; }
        .legend span { display: inline-block; margin-right: 10px; font-size: 9px; }
        .legend .dot {
            display: inline-block; width: 8px; height: 8px;
            border-radius: 50%; margin-right: 3px; vertical-align: middle;
        }
        .dot-programado { background: #3b82f6; }
        .dot-confirmado { background: #f59e0b; }
        .dot-en-camino { background: #6366f1; }
        .dot-en-ejecucion { background: #ec4899; }
        .dot-realizado { background: #22c55e; }
        .dot-reprogramado { background: #ef4444; }
        .dot-cancelado { background: #94a3b8; }

        /* VISTA DIARIA OPERATIVA */
        .ops-summary {
            display: table; width: 100%; margin-bottom: 14px;
            border-collapse: separate; border-spacing: 8px 0;
        }
        .ops-summary-item {
            display: table-cell; width: 33.33%;
            background: #f4f7fb; border: 1px solid #d8e1f0; border-radius: 6px;
            padding: 10px 12px; text-align: center;
        }
        .ops-summary-value { font-size: 18px; font-weight: bold; color: #2E4A7C; }
        .ops-summary-label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.6px; }

        .tech-card {
            border: 1px solid #d8e1f0; border-radius: 8px; margin-bottom: 14px; overflow: hidden;
        }
        .tech-card-header {
            background: #2E4A7C; color: #fff; padding: 10px 12px;
        }
        .tech-card-time {
            font-size: 18px; font-weight: bold; letter-spacing: 0.8px;
        }
        .tech-card-service {
            margin-top: 2px; font-size: 13px; font-weight: bold;
        }
        .tech-card-client {
            margin-top: 2px; font-size: 10px; opacity: 0.95;
        }
        .tech-card-body {
            padding: 10px 12px 12px;
        }
        .tech-meta {
            width: 100%; border-collapse: collapse; margin-bottom: 8px;
        }
        .tech-meta td {
            padding: 5px 0; border-bottom: 1px solid #edf2f7; vertical-align: top; font-size: 10px;
        }
        .tech-meta tr:last-child td { border-bottom: none; }
        .tech-meta-label {
            width: 110px; font-weight: bold; color: #2E4A7C;
        }
        .tech-section-title {
            font-size: 11px; font-weight: bold; color: #2E4A7C; margin: 10px 0 6px;
            text-transform: uppercase; letter-spacing: 0.6px;
        }
        .insumos-table { width: 100%; border-collapse: collapse; }
        .insumos-table th {
            background: #eef3fb; color: #2E4A7C; padding: 6px 8px; text-align: left;
            font-size: 9px; border: 1px solid #d8e1f0;
        }
        .insumos-table td {
            padding: 6px 8px; border: 1px solid #e5e7eb; font-size: 10px;
        }
        .insumos-empty {
            padding: 8px 10px; background: #fafafa; border: 1px dashed #d1d5db;
            color: #6b7280; font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        {{-- ENCABEZADO --}}
        @php
            $logoPath = public_path('images/logo-qsci.png');
        @endphp
        @if(file_exists($logoPath))
            <div class="logo-container">
                <img src="{{ $logoPath }}" alt="Logo QSCI" style="max-height:70px;">
            </div>
        @endif

        <div class="main-title">{{ $vista === 'diaria' ? 'HOJA OPERATIVA DEL DIA' : 'PROGRAMACION OPERATIVA' }}</div>
        <div class="sub-title">{{ $titulo }}</div>

        {{-- RESUMEN ESTADÍSTICO --}}
        @if($vista !== 'diaria')
            <div class="stats-bar">
                <div class="stat-item"><div class="stat-value">{{ $total }}</div><div class="stat-label">Total</div></div>
                <div class="stat-item"><div class="stat-value">{{ $contadores['Programado'] ?? 0 }}</div><div class="stat-label">Programados</div></div>
                <div class="stat-item"><div class="stat-value">{{ $contadores['Confirmado'] ?? 0 }}</div><div class="stat-label">Confirmados</div></div>
                <div class="stat-item"><div class="stat-value">{{ $contadores['En Ejecución'] ?? 0 }}</div><div class="stat-label">En Ejecución</div></div>
                <div class="stat-item"><div class="stat-value">{{ $contadores['Realizado'] ?? 0 }}</div><div class="stat-label">Realizados</div></div>
                <div class="stat-item"><div class="stat-value">{{ $contadores['Reprogramado'] ?? 0 }}</div><div class="stat-label">Reprogramados</div></div>
                <div class="stat-item"><div class="stat-value">{{ $contadores['Cancelado'] ?? 0 }}</div><div class="stat-label">Cancelados</div></div>
            </div>
        @endif

        {{-- LEYENDA --}}
        @if($vista !== 'diaria')
            <div class="legend">
                <span><span class="dot dot-programado"></span>Programado</span>
                <span><span class="dot dot-confirmado"></span>Confirmado</span>
                <span><span class="dot dot-en-camino"></span>En Camino</span>
                <span><span class="dot dot-en-ejecucion"></span>En Ejecución</span>
                <span><span class="dot dot-realizado"></span>Realizado</span>
                <span><span class="dot dot-reprogramado"></span>Reprogramado</span>
                <span><span class="dot dot-cancelado"></span>Cancelado</span>
            </div>
        @endif

        {{-- ═══════════════════════════════════════════════════════════ --}}
        {{-- VISTA MENSUAL --}}
        {{-- ═══════════════════════════════════════════════════════════ --}}
        @if($vista === 'mensual')
            @php
                $mesNum = (int) $mes;
                $anioNum = (int) $anio;
                $primerDia = \Carbon\Carbon::createFromDate($anioNum, $mesNum, 1);
                $ultimoDia = $primerDia->copy()->endOfMonth();
                $diasEnMes = $ultimoDia->day;
                // Lunes = 0
                $startWeekDay = ($primerDia->dayOfWeek + 6) % 7;
                $prevMonthLast = $primerDia->copy()->subDay()->day;
                $today = now()->format('Y-m-d');

                // Agrupar por fecha (formatear a Y-m-d porque Laravel puede devolver Carbon)
                $porFecha = $programaciones->groupBy(fn($p) => \Carbon\Carbon::parse($p->fecha_programada)->format('Y-m-d'));
            @endphp

            <table class="cal-grid">
                <thead>
                    <tr>
                        <th>LUN</th><th>MAR</th><th>MIÉ</th>
                        <th>JUE</th><th>VIE</th><th>SÁB</th><th>DOM</th>
                    </tr>
                </thead>
                <tbody>
                    @php $cellIndex = 0; @endphp
                    @for($row = 0; $row < 6; $row++)
                        @php
                            $rowStart = $cellIndex;
                            // Salir si ya pasamos todos los días del mes y completamos la semana
                            if ($cellIndex >= $startWeekDay + $diasEnMes && $cellIndex % 7 === 0 && $row > 0) break;
                        @endphp
                        <tr>
                            @for($col = 0; $col < 7; $col++)
                                @php
                                    $dayNum = $cellIndex - $startWeekDay + 1;
                                    $isOtherMonth = $dayNum < 1 || $dayNum > $diasEnMes;
                                    $displayDay = $dayNum;
                                    if ($dayNum < 1) $displayDay = $prevMonthLast + $dayNum;
                                    elseif ($dayNum > $diasEnMes) $displayDay = $dayNum - $diasEnMes;

                                    $dateStr = $isOtherMonth ? '' : sprintf('%04d-%02d-%02d', $anioNum, $mesNum, $dayNum);
                                    $isToday = $dateStr === $today;
                                    $servicios = $isOtherMonth ? collect() : ($porFecha[$dateStr] ?? collect());
                                    $cellIndex++;
                                @endphp
                                <td class="{{ $isOtherMonth ? 'other-month' : '' }} {{ $isToday ? 'today' : '' }}">
                                    <div class="cal-day-num">{{ $displayDay }}</div>
                                    @foreach($servicios->take(4) as $s)
                                        @php
                                            $cssClass = str_replace(' ', '-', strtolower($s->estado_ejecucion));
                                        @endphp
                                        <div class="cal-event {{ $cssClass }}">
                                            {{ \Carbon\Carbon::parse($s->hora_inicio)->format('H:i') }} {{ $s->servicio->nombre ?? 'Servicio' }}
                                        </div>
                                    @endforeach
                                    @if($servicios->count() > 4)
                                        <div class="cal-more">+{{ $servicios->count() - 4 }} más</div>
                                    @endif
                                </td>
                            @endfor
                        </tr>
                    @endfor
                </tbody>
            </table>

            {{-- Detalle complementario del mes --}}
            @if($programaciones->count() > 0)
                <h3 style="font-size:13px; color:#2E4A7C; margin:15px 0 8px;">Detalle del Mes</h3>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Servicio</th>
                            <th>Cliente</th>
                            <th>Local / Sede</th>
                            <th>Técnico(s)</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($programaciones->sortBy(['fecha_programada', 'hora_inicio']) as $p)
                            @php
                                $badgeClass = 'badge-' . str_replace(' ', '-', strtolower($p->estado_ejecucion));
                                $cliente = $p->ordenServicio && $p->ordenServicio->cliente
                                    ? ($p->ordenServicio->cliente->nombre_empresa ?: $p->ordenServicio->cliente->persona_contacto)
                                    : '—';
                                $tecnicos = $p->tecnicos->count() > 0
                                    ? $p->tecnicos->map(fn($t) => $t->nombre . ' ' . $t->apellidos)->implode(', ')
                                    : ($p->tecnico ? $p->tecnico->nombre . ' ' . $p->tecnico->apellidos : '—');
                            @endphp
                            <tr>
                                <td>{{ \Carbon\Carbon::parse($p->fecha_programada)->format('d/m') }}</td>
                                <td>{{ \Carbon\Carbon::parse($p->hora_inicio)->format('H:i') }}{{ $p->hora_fin ? ' - ' . \Carbon\Carbon::parse($p->hora_fin)->format('H:i') : '' }}</td>
                                <td>{{ $p->servicio->nombre ?? '—' }}</td>
                                <td>{{ $cliente }}</td>
                                <td>{{ $p->local_sede ?: '—' }}</td>
                                <td style="font-size:9px;">{{ $tecnicos }}</td>
                                <td><span class="badge {{ $badgeClass }}">{{ $p->estado_ejecucion }}</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

        {{-- ═══════════════════════════════════════════════════════════ --}}
        {{-- VISTA SEMANAL --}}
        {{-- ═══════════════════════════════════════════════════════════ --}}
        @elseif($vista === 'semanal')
            @php
                $diasLabel = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                $lunes = \Carbon\Carbon::parse($fechaInicio);
                $today = now()->format('Y-m-d');
                $porFecha = $programaciones->groupBy(fn($p) => \Carbon\Carbon::parse($p->fecha_programada)->format('Y-m-d'));
            @endphp

            @for($i = 0; $i < 7; $i++)
                @php
                    $dia = $lunes->copy()->addDays($i);
                    $dateStr = $dia->format('Y-m-d');
                    $isToday = $dateStr === $today;
                    $servicios = $porFecha[$dateStr] ?? collect();
                @endphp

                <div class="week-day-header {{ $isToday ? 'today-header' : '' }}">
                    {{ $diasLabel[$i] }} {{ $dia->format('d/m/Y') }}
                    ({{ $servicios->count() }} programacion{{ $servicios->count() !== 1 ? 'es' : '' }})
                </div>

                @if($servicios->count() > 0)
                    <table class="detail-table">
                        <thead>
                            <tr>
                                <th style="width:70px;">Horario</th>
                                <th>Servicio</th>
                                <th>Cliente</th>
                                <th>Local / Sede</th>
                                <th>Técnico(s)</th>
                                <th>Vehículo</th>
                                <th style="width:180px;">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($servicios->sortBy('hora_inicio') as $p)
                                @php
                                    $cliente = $p->ordenServicio && $p->ordenServicio->cliente
                                        ? ($p->ordenServicio->cliente->nombre_empresa ?: $p->ordenServicio->cliente->persona_contacto)
                                        : '—';
                                    $tecnicos = $p->tecnicos->count() > 0
                                        ? $p->tecnicos->map(fn($t) => $t->nombre . ' ' . $t->apellidos)->implode(', ')
                                        : ($p->tecnico ? $p->tecnico->nombre . ' ' . $p->tecnico->apellidos : '—');
                                    $vehiculo = $p->vehiculo ? $p->vehiculo->placa . ' - ' . $p->vehiculo->marca . ' ' . $p->vehiculo->modelo : '—';
                                @endphp
                                <tr>
                                    <td>{{ \Carbon\Carbon::parse($p->hora_inicio)->format('H:i') }}{{ $p->hora_fin ? ' - ' . \Carbon\Carbon::parse($p->hora_fin)->format('H:i') : '' }}</td>
                                    <td>{{ $p->servicio->nombre ?? '—' }}</td>
                                    <td>{{ $cliente }}</td>
                                    <td>{{ $p->local_sede ?: '—' }}</td>
                                    <td style="font-size:9px;">{{ $tecnicos }}</td>
                                    <td style="font-size:9px;">{{ $vehiculo }}</td>
                                    <td>{{ $p->observaciones ?: '—' }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <div style="padding:8px 12px; color:#999; font-style:italic; border:1px solid #eee; border-top:none;">
                        Sin programaciones
                    </div>
                @endif
            @endfor

        {{-- ═══════════════════════════════════════════════════════════ --}}
        {{-- VISTA DIARIA --}}
        {{-- ═══════════════════════════════════════════════════════════ --}}
        @elseif($vista === 'diaria')
            @if($programaciones->count() > 0)
                @php
                    $tecnicosUnicos = $programaciones
                        ->flatMap(function ($p) {
                            if ($p->tecnicos && $p->tecnicos->count() > 0) {
                                return $p->tecnicos->pluck('id');
                            }
                            return $p->tecnico ? collect([$p->tecnico->id]) : collect();
                        })
                        ->filter()
                        ->unique()
                        ->count();
                    $vehiculosAsignados = $programaciones->pluck('id_vehiculo')->filter()->unique()->count();
                @endphp
                <div class="ops-summary">
                    <div class="ops-summary-item">
                        <div class="ops-summary-value">{{ $programaciones->count() }}</div>
                        <div class="ops-summary-label">Programaciones del dia</div>
                    </div>
                    <div class="ops-summary-item">
                        <div class="ops-summary-value">{{ $tecnicosUnicos }}</div>
                        <div class="ops-summary-label">Técnicos asignados</div>
                    </div>
                    <div class="ops-summary-item">
                        <div class="ops-summary-value">{{ $vehiculosAsignados }}</div>
                        <div class="ops-summary-label">Vehículos asignados</div>
                    </div>
                </div>

                @foreach($programaciones->sortBy('hora_inicio') as $p)
                    @php
                        $cliente = $p->ordenServicio && $p->ordenServicio->cliente
                            ? ($p->ordenServicio->cliente->nombre_empresa ?: $p->ordenServicio->cliente->persona_contacto)
                            : '—';
                        $tecnicos = $p->tecnicos->count() > 0
                            ? $p->tecnicos->map(fn($t) => $t->nombre . ' ' . $t->apellidos)->implode(', ')
                            : ($p->tecnico ? $p->tecnico->nombre . ' ' . $p->tecnico->apellidos : '—');
                        $personalAdmin = collect($p->personal_administrativo ?? [])
                            ->map(function ($item) {
                                if (is_array($item)) {
                                    return trim(($item['nombre'] ?? '') . ' ' . ($item['apellidos'] ?? ''));
                                }
                                if (is_object($item)) {
                                    return trim(($item->nombre ?? '') . ' ' . ($item->apellidos ?? ''));
                                }
                                return null;
                            })
                            ->filter()
                            ->values();
                        $supervisor = $personalAdmin->isNotEmpty()
                            ? $personalAdmin->implode(', ')
                            : ($p->supervisor ? $p->supervisor->nombre . ' ' . $p->supervisor->apellidos : 'No asignado');
                        $vehiculo = $p->vehiculo ? $p->vehiculo->placa . ' - ' . $p->vehiculo->marca . ' ' . $p->vehiculo->modelo : 'No asignado';
                    @endphp
                    <div class="tech-card">
                        <div class="tech-card-header">
                            <div class="tech-card-time">{{ \Carbon\Carbon::parse($p->hora_inicio)->format('H:i') }}{{ $p->hora_fin ? ' - ' . \Carbon\Carbon::parse($p->hora_fin)->format('H:i') : '' }}</div>
                            <div class="tech-card-service">{{ $p->servicio->nombre ?? 'Servicio' }}</div>
                            <div class="tech-card-client">{{ $cliente }}</div>
                        </div>
                        <div class="tech-card-body">
                            <table class="tech-meta">
                                <tr>
                                    <td class="tech-meta-label">Local / Sede</td>
                                    <td>{{ $p->local_sede ?: '—' }}</td>
                                </tr>
                                <tr>
                                    <td class="tech-meta-label">Dirección</td>
                                    <td>{{ $p->direccion_completa ?: '—' }}</td>
                                </tr>
                                <tr>
                                    <td class="tech-meta-label">Técnicos</td>
                                    <td>{{ $tecnicos }}</td>
                                </tr>
                                <tr>
                                    <td class="tech-meta-label">Vehículo</td>
                                    <td>{{ $vehiculo }}</td>
                                </tr>
                                <tr>
                                    <td class="tech-meta-label">Personal Administrativo</td>
                                    <td>{{ $supervisor }}</td>
                                </tr>
                                @if(!empty($p->observaciones))
                                    <tr>
                                        <td class="tech-meta-label">Indicaciones</td>
                                        <td>{{ $p->observaciones }}</td>
                                    </tr>
                                @endif
                            </table>
                        </div>
                    </div>
                @endforeach
            @else
                <div style="padding:30px; text-align:center; color:#999; font-size:14px;">
                    No hay programaciones para este dia.
                </div>
            @endif
        @endif

        {{-- FOOTER --}}
        <div class="pdf-footer">
            Generado el {{ now()->format('d/m/Y H:i') }} — QSCI Group S.A.C. — Sistema de Gestión de Servicios
        </div>
    </div>
</body>
</html>
