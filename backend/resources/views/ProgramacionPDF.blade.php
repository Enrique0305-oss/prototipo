<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Programación de Servicios — {{ $titulo }}</title>
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

        <div class="main-title">PROGRAMACIÓN DE SERVICIOS</div>
        <div class="sub-title">{{ $titulo }}</div>

        {{-- RESUMEN ESTADÍSTICO --}}
        <div class="stats-bar">
            <div class="stat-item"><div class="stat-value">{{ $total }}</div><div class="stat-label">Total</div></div>
            <div class="stat-item"><div class="stat-value">{{ $contadores['Programado'] ?? 0 }}</div><div class="stat-label">Programados</div></div>
            <div class="stat-item"><div class="stat-value">{{ $contadores['Confirmado'] ?? 0 }}</div><div class="stat-label">Confirmados</div></div>
            <div class="stat-item"><div class="stat-value">{{ $contadores['En Ejecución'] ?? 0 }}</div><div class="stat-label">En Ejecución</div></div>
            <div class="stat-item"><div class="stat-value">{{ $contadores['Realizado'] ?? 0 }}</div><div class="stat-label">Realizados</div></div>
            <div class="stat-item"><div class="stat-value">{{ $contadores['Reprogramado'] ?? 0 }}</div><div class="stat-label">Reprogramados</div></div>
            <div class="stat-item"><div class="stat-value">{{ $contadores['Cancelado'] ?? 0 }}</div><div class="stat-label">Cancelados</div></div>
        </div>

        {{-- LEYENDA --}}
        <div class="legend">
            <span><span class="dot dot-programado"></span>Programado</span>
            <span><span class="dot dot-confirmado"></span>Confirmado</span>
            <span><span class="dot dot-en-camino"></span>En Camino</span>
            <span><span class="dot dot-en-ejecucion"></span>En Ejecución</span>
            <span><span class="dot dot-realizado"></span>Realizado</span>
            <span><span class="dot dot-reprogramado"></span>Reprogramado</span>
            <span><span class="dot dot-cancelado"></span>Cancelado</span>
        </div>

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
                    ({{ $servicios->count() }} servicio{{ $servicios->count() !== 1 ? 's' : '' }})
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
                                <th style="width:75px;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($servicios->sortBy('hora_inicio') as $p)
                                @php
                                    $badgeClass = 'badge-' . str_replace(' ', '-', strtolower($p->estado_ejecucion));
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
                                    <td><span class="badge {{ $badgeClass }}">{{ $p->estado_ejecucion }}</span></td>
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
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th style="width:75px;">Horario</th>
                            <th>Servicio</th>
                            <th>ODS</th>
                            <th>Cliente</th>
                            <th>Local / Sede</th>
                            <th>Dirección</th>
                            <th>Técnico(s)</th>
                            <th>Supervisor</th>
                            <th>Vehículo</th>
                            <th style="width:75px;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($programaciones->sortBy('hora_inicio') as $p)
                            @php
                                $badgeClass = 'badge-' . str_replace(' ', '-', strtolower($p->estado_ejecucion));
                                $cliente = $p->ordenServicio && $p->ordenServicio->cliente
                                    ? ($p->ordenServicio->cliente->nombre_empresa ?: $p->ordenServicio->cliente->persona_contacto)
                                    : '—';
                                $tecnicos = $p->tecnicos->count() > 0
                                    ? $p->tecnicos->map(fn($t) => $t->nombre . ' ' . $t->apellidos)->implode(', ')
                                    : ($p->tecnico ? $p->tecnico->nombre . ' ' . $p->tecnico->apellidos : '—');
                                $supervisor = $p->supervisor ? $p->supervisor->nombre . ' ' . $p->supervisor->apellidos : '—';
                                $vehiculo = $p->vehiculo ? $p->vehiculo->placa . ' - ' . $p->vehiculo->marca . ' ' . $p->vehiculo->modelo : '—';
                            @endphp
                            <tr>
                                <td>{{ \Carbon\Carbon::parse($p->hora_inicio)->format('H:i') }}{{ $p->hora_fin ? ' - ' . \Carbon\Carbon::parse($p->hora_fin)->format('H:i') : '' }}</td>
                                <td>{{ $p->servicio->nombre ?? '—' }}</td>
                                <td>{{ $p->ordenServicio->numero_orden ?? '—' }}</td>
                                <td>{{ $cliente }}</td>
                                <td>{{ $p->local_sede ?: '—' }}</td>
                                <td style="font-size:9px;">{{ $p->direccion_completa ?: '—' }}</td>
                                <td style="font-size:9px;">{{ $tecnicos }}</td>
                                <td style="font-size:9px;">{{ $supervisor }}</td>
                                <td style="font-size:9px;">{{ $vehiculo }}</td>
                                <td><span class="badge {{ $badgeClass }}">{{ $p->estado_ejecucion }}</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                {{-- INSUMOS por servicio (vista diaria muestra más detalle) --}}
                @php
                    $conInsumos = $programaciones->filter(fn($p) => $p->insumos && $p->insumos->count() > 0);
                @endphp
                @if($conInsumos->count() > 0)
                    <h3 style="font-size:13px; color:#2E4A7C; margin:15px 0 8px;">Insumos / Productos Asignados</h3>
                    @foreach($conInsumos as $p)
                        <div style="font-size:10px; font-weight:bold; margin:8px 0 3px; color:#555;">
                            {{ \Carbon\Carbon::parse($p->hora_inicio)->format('H:i') }} — {{ $p->servicio->nombre ?? 'Servicio' }}
                            ({{ $p->ordenServicio && $p->ordenServicio->cliente ? ($p->ordenServicio->cliente->nombre_empresa ?: $p->ordenServicio->cliente->persona_contacto) : '' }})
                        </div>
                        <table class="detail-table" style="margin-bottom:8px;">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th style="width:90px;">Cant. Asignada</th>
                                    <th style="width:90px;">Cant. Utilizada</th>
                                    <th style="width:80px;">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($p->insumos as $ins)
                                    <tr>
                                        <td>{{ $ins->producto->descripcion ?? '—' }}</td>
                                        <td style="text-align:center;">{{ $ins->cantidad_asignada }}</td>
                                        <td style="text-align:center;">{{ $ins->cantidad_utilizada ?? '—' }}</td>
                                        <td style="text-align:center;">{{ $ins->estado }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @endforeach
                @endif
            @else
                <div style="padding:30px; text-align:center; color:#999; font-size:14px;">
                    No hay servicios programados para este día.
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
