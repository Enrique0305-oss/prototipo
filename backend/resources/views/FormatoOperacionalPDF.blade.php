<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Formato Operacional {{ $formato->id }}</title>
    <style>
        @page { margin: 1cm 1.2cm; size: A4 portrait; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #000; line-height: 1.3; margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: middle; }
        .label { font-weight: bold; background-color: #f2f2f2; font-size: 9px; }
        .text-center { text-align: center; }
        .section-header { background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 10px; padding: 5px 8px; }
        .bg-header { background-color: #D9E1F2; font-weight: bold; text-align: center; font-size: 9px; text-transform: uppercase; }
    </style>
</head>
<body>
    <table style="margin-bottom: 0;">
        <tr>
            <td style="width: 15%; text-align: center; padding: 8px;">
                @if(file_exists(public_path('images/logo-orden.png')))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="100">
                @endif
            </td>
            <td style="width: 55%; text-align: center; padding: 10px;">
                @php
                    $formatosSeleccionados = array_values(array_filter($formato->programacionServicio?->formatos_fichas ?? []));
                    $usaFormatoLamina = false;
                    foreach ($secciones as $seccionDetectar) {
                        foreach (($seccionDetectar['items'] ?? []) as $itemDetectar) {
                            if (!empty($itemDetectar['estado_lamina']) || !empty($itemDetectar['estado_lamina_verdadera']) || !empty($itemDetectar['estado_lamina_auditiva']) || !empty($itemDetectar['conteo_estadio']) || !empty($itemDetectar['conteo_estadio_verdadera']) || !empty($itemDetectar['conteo_estadio_falsa'])) {
                                $usaFormatoLamina = true;
                                break 2;
                            }
                        }
                    }
                    
                    $isRoedores = false;
                    foreach ($formatosSeleccionados as $f) {
                        if (str_contains(strtoupper($f), 'ROEDORES')) {
                            $isRoedores = true;
                            break;
                        }
                    }
                    $tipoPdf = $tipo_pdf ?? 'verdadera';
                    $fieldCount = ($tipoPdf === 'falsa' || $tipoPdf === 'auditiva') ? 'auditiva' : 'verdadera';
                @endphp
                <div style="font-size: 12px; font-weight: bold;">FORMATO OPERACIONAL</div>
                <div style="font-size: 10px; margin-top: 4px; font-weight: 600;">{{ implode(' + ', $formatosSeleccionados) ?: 'FORMATO OPERACIONAL' }}</div>
            </td>
            <td style="width: 30%; padding: 0;">
                <table style="margin: 0;">
                    <tr>
                        <td class="label" style="width: 40%;">Código</td>
                        <td class="text-center" style="width: 60%;">{{ $formato->correlativo ?? ($formato->codigo_documento ?? 'FO-OP-002') }}</td>
                    </tr>
                    <tr>
                        <td class="label">Fecha</td>
                        <td class="text-center">{{ $formato->fecha ? \Carbon\Carbon::parse($formato->fecha)->format('d/m/Y') : '---' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Versión</td>
                        <td class="text-center">{{ $formato->version ?? '01' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table style="margin-top: -1px;">
        <tr>
            <td class="label" style="width: 15%;">Cliente</td>
            <td style="width: 35%;">{{ $formato->cliente ?? '---' }}</td>
            <td class="label" style="width: 15%;">Dirección</td>
            <td style="width: 35%;">{{ $formato->direccion ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">Fecha</td>
            <td>{{ $formato->fecha ? \Carbon\Carbon::parse($formato->fecha)->format('d/m/Y') : '---' }}</td>
            <td class="label">Hora llegada</td>
            <td>{{ $formato->hora_llegada ? \Carbon\Carbon::parse($formato->hora_llegada)->format('H:i') : '---' }}</td>
        </tr>
        <tr>
            <td class="label">Hora inicio</td>
            <td>{{ $formato->hora_inicio ? \Carbon\Carbon::parse($formato->hora_inicio)->format('H:i') : '---' }}</td>
            <td class="label">Hora final</td>
            <td>{{ $formato->hora_final ? \Carbon\Carbon::parse($formato->hora_final)->format('H:i') : '---' }}</td>
        </tr>
    </table>

    @if($isRoedores)
        <table style="margin-top: 8px; margin-bottom: 8px; font-size: 8px; width: 45%; margin-left: 0; border: none;">
            <tr>
                <td colspan="2" class="label text-center" style="font-size: 8px; border: 1px solid #000; padding: 2px;">Especie identificada<br><span style="font-size: 6px; font-weight: normal;">(aplica solo ante captura en jaula)</span></td>
            </tr>
            <tr>
                <td style="width: 70%; border: 1px solid #000; padding: 2px 4px;">Mus musculus</td>
                <td style="width: 30%; border: 1px solid #000;"></td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 2px 4px;">Rattus rattus</td>
                <td style="border: 1px solid #000;"></td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 2px 4px;">Rattus norvegicus</td>
                <td style="border: 1px solid #000;"></td>
            </tr>
        </table>
    @endif

    @php
        $mostroLeyendaRoedores = false;
        $mostroLeyendaInsectos = false;
    @endphp

    @foreach($secciones as $seccion)
        @php
            $tipoSeccion = $seccion['tipo'] ?? '';
            // Clasificar la sección para elegir el diseño de tabla
            $esDisposicionRoedores = in_array($tipoSeccion, ['roedores_cebo', 'roedores_lamina', 'tubo_cebadero', 'jaula']);
            $esDisposicionInsectos = in_array($tipoSeccion, ['rastreros_lamina', 'trampa_luz']);
            
            if ($esDisposicionRoedores) $mostroLeyendaRoedores = true;
            if ($esDisposicionInsectos) $mostroLeyendaInsectos = true;
        @endphp

        {{-- DISEÑO 1: TABLA TIPO ROEDORES (Estado, Hallazgo, Señales) --}}
        @if($esDisposicionRoedores)
            @php
                $items = $seccion['items'] ?? [];
                $itemCount = count($items);
                $chunkSize = $itemCount > 0 ? ceil($itemCount / 2) : 1;
                $chunks = array_chunk($items, $chunkSize);
                $leftItems = $chunks[0] ?? [];
                $rightItems = $chunks[1] ?? [];
            @endphp
            
            <table style="margin-top: 8px; width: 100%; table-layout: fixed;">
                <thead>
                    <tr>
                        <th class="section-header" colspan="10">{{ strtoupper($seccion['titulo']) }} ({{ $itemCount }})</th>
                    </tr>
                    <tr>
                        <th class="bg-header" style="width: 5%; font-size: 7px;">N°</th>
                        <th class="bg-header" style="width: 21%; font-size: 7px;">UBICACIÓN</th>
                        <th class="bg-header" style="width: 8%; font-size: 6.5px; line-height: 1;">ESTADO DEL<br>DISPOSITIVO</th>
                        <th class="bg-header" style="width: 8%; font-size: 6.5px;">HALLAZGOS</th>
                        <th class="bg-header" style="width: 8%; font-size: 6.5px; line-height: 1;">SEÑALES DE<br>PRESENCIA</th>
                        
                        <th class="bg-header" style="width: 5%; font-size: 7px;">N°</th>
                        <th class="bg-header" style="width: 21%; font-size: 7px;">UBICACIÓN</th>
                        <th class="bg-header" style="width: 8%; font-size: 6.5px; line-height: 1;">ESTADO DEL<br>DISPOSITIVO</th>
                        <th class="bg-header" style="width: 8%; font-size: 6.5px;">HALLAZGOS</th>
                        <th class="bg-header" style="width: 8%; font-size: 6.5px; line-height: 1;">SEÑALES DE<br>PRESENCIA</th>
                    </tr>
                </thead>
                <tbody>
                    @for($i = 0; $i < max(count($leftItems), 1); $i++)
                        @php
                            $left = $leftItems[$i] ?? null;
                            $right = $rightItems[$i] ?? null;
                        @endphp
                        <tr>
                            {{-- Lado Izquierdo --}}
                            @if($left)
                                @php
                                    $l_estado = ($fieldCount === 'auditiva') ? ($left['estado_dispositivo_auditiva'] ?? $left['estado_dispositivo'] ?? '-') : ($left['estado_dispositivo_verdadera'] ?? $left['estado_dispositivo'] ?? '-');
                                    $l_hallazgo = ($fieldCount === 'auditiva') ? ($left['hallazgo_auditiva'] ?? $left['hallazgo'] ?? '-') : ($left['hallazgo_verdadera'] ?? $left['hallazgo'] ?? '-');
                                    $l_senales = ($fieldCount === 'auditiva') ? ($left['senales_presencia_auditiva'] ?? $left['senales_presencia'] ?? '-') : ($left['senales_presencia_verdadera'] ?? $left['senales_presencia'] ?? '-');
                                @endphp
                                <td class="text-center" style="font-size: 7px;">{{ $left['codigo_caja'] ?? '-' }}</td>
                                <td style="font-size: 7px; text-transform: uppercase;">{{ $left['ubicacion'] ?? '-' }}</td>
                                <td class="text-center" style="font-size: 7.5px; font-weight: bold;">{{ $l_estado ?: '-' }}</td>
                                <td class="text-center" style="font-size: 7.5px; font-weight: bold;">{{ $l_hallazgo ?: '-' }}</td>
                                <td class="text-center" style="font-size: 7.5px; font-weight: bold;">{{ $l_senales ?: '-' }}</td>
                            @else
                                <td colspan="5" style="border: none;"></td>
                            @endif
                            
                            {{-- Lado Derecho --}}
                            @if($right)
                                @php
                                    $r_estado = ($fieldCount === 'auditiva') ? ($right['estado_dispositivo_auditiva'] ?? $right['estado_dispositivo'] ?? '-') : ($right['estado_dispositivo_verdadera'] ?? $right['estado_dispositivo'] ?? '-');
                                    $r_hallazgo = ($fieldCount === 'auditiva') ? ($right['hallazgo_auditiva'] ?? $right['hallazgo'] ?? '-') : ($right['hallazgo_verdadera'] ?? $right['hallazgo'] ?? '-');
                                    $r_senales = ($fieldCount === 'auditiva') ? ($right['senales_presencia_auditiva'] ?? $right['senales_presencia'] ?? '-') : ($right['senales_presencia_verdadera'] ?? $right['senales_presencia'] ?? '-');
                                @endphp
                                <td class="text-center" style="font-size: 7px;">{{ $right['codigo_caja'] ?? '-' }}</td>
                                <td style="font-size: 7px; text-transform: uppercase;">{{ $right['ubicacion'] ?? '-' }}</td>
                                <td class="text-center" style="font-size: 7.5px; font-weight: bold;">{{ $r_estado ?: '-' }}</td>
                                <td class="text-center" style="font-size: 7.5px; font-weight: bold;">{{ $r_hallazgo ?: '-' }}</td>
                                <td class="text-center" style="font-size: 7.5px; font-weight: bold;">{{ $r_senales ?: '-' }}</td>
                            @else
                                <td colspan="5" style="border: none;"></td>
                            @endif
                        </tr>
                    @endfor
                </tbody>
            </table>

        {{-- DISEÑO 2: TABLA TIPO INSECTOS (Estadio, Conteo, Estado Lámina) --}}
        @elseif($esDisposicionInsectos)
            <table style="margin-top: 8px;">
                <tr>
                    <td class="section-header">{{ strtoupper($seccion['titulo']) }} ({{ count($seccion['items']) }})</td>
                </tr>
            </table>
            <table style="margin-top: -1px;">
                <thead>
                    <tr>
                        <th class="bg-header" style="width: 28%;">Ubicación</th>
                        <th class="bg-header" style="width: 10%;">N°</th>
                        <th class="bg-header" style="width: 12%;">Estadio</th>
                        <th class="bg-header" style="width: 12%;">Conteo</th>
                        <th class="bg-header" style="width: 20%;">Estado de lámina</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($seccion['items'] as $item)
                        @php
                            $conteoEstadio = is_array($item['conteo_estadio'] ?? null) ? $item['conteo_estadio'] : [];
                            $estadios = ['ADULTO', 'NINFA', 'OOTECA'];
                            $estadiosConDatos = array_values(array_filter($estadios, fn ($estadio) => array_key_exists($estadio, $conteoEstadio)));
                            $estadoLamina = ($fieldCount === 'auditiva') ? ($item['estado_lamina_auditiva'] ?? $item['estado_lamina'] ?? '---') : ($item['estado_lamina_verdadera'] ?? $item['estado_lamina'] ?? '---');
                            $conteoFallback = (int) (($fieldCount === 'auditiva') ? ($item['conteo_estadio_falsa'] ?? 0) : ($item['conteo_estadio_verdadera'] ?? 0));
                        @endphp

                        @if(count($estadiosConDatos) > 0)
                            @foreach($estadiosConDatos as $idx => $estadio)
                                <tr>
                                    @if($idx === 0)
                                        <td rowspan="{{ count($estadiosConDatos) }}">{{ $item['ubicacion'] ?? '---' }}</td>
                                        <td rowspan="{{ count($estadiosConDatos) }}" class="text-center">{{ $item['codigo_caja'] ?? '---' }}</td>
                                    @endif
                                    <td>{{ $estadio }}</td>
                                    <td class="text-center">
                                        {{ (int) ($conteoEstadio[$estadio][$fieldCount] ?? 0) }}
                                    </td>
                                    @if($idx === 0)
                                        <td rowspan="{{ count($estadiosConDatos) }}" class="text-center">{{ $estadoLamina }}</td>
                                    @endif
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td>{{ $item['ubicacion'] ?? '---' }}</td>
                                <td class="text-center">{{ $item['codigo_caja'] ?? '---' }}</td>
                                <td>{{ $item['estadio'] ?? '---' }}</td>
                                <td class="text-center">{{ $conteoFallback }}</td>
                                <td class="text-center">{{ $estadoLamina }}</td>
                            </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>

        {{-- DISEÑO 3: TABLA SIMPLE (Fallback) --}}
        @else
            <table style="margin-top: 8px;">
                <tr>
                    <td class="section-header">{{ strtoupper($seccion['titulo']) }}</td>
                </tr>
            </table>
            <table style="margin-top: -1px;">
                <tr>
                    <th class="bg-header" style="width: 11%;">N°</th>
                    <th class="bg-header" style="width: 31%;">Ubicación</th>
                    <th class="bg-header" style="width: 16%;">Estado</th>
                    <th class="bg-header" style="width: 16%;">Hallazgo</th>
                    <th class="bg-header" style="width: 16%;">Señales</th>
                </tr>
                @foreach($seccion['items'] as $item)
                    <tr>
                        <td class="text-center">{{ $item['codigo_caja'] ?? '---' }}</td>
                        <td>{{ $item['ubicacion'] ?? '---' }}</td>
                        <td class="text-center">{{ $item['estado_dispositivo'] ?? '---' }}</td>
                        <td class="text-center">{{ $item['hallazgo'] ?? '---' }}</td>
                        <td class="text-center">{{ $item['senales_presencia'] ?? '---' }}</td>
                    </tr>
                @endforeach
            </table>
        @endif
    @endforeach

    {{-- LEYENDAS CONDICIONALES --}}
    @if($mostroLeyendaRoedores)
        <table style="border: none; width: 100%; margin-top: 15px; table-layout: fixed;">
            <tr>
                <td style="width: 32%; border: none; padding: 0; vertical-align: top;">
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr><td class="bg-header" colspan="2" style="font-size: 7px; padding: 2px;">LEYENDA DE ESTADO DEL DISPOSITIVO</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">DISPOSITIVO DESANCLADO</td><td class="text-center" style="font-size: 7px; font-weight: bold; width: 15%; padding: 2px;">D</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">DISPOSITIVO AVERIADO</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">A</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">BUEN ESTADO</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">B</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">DISPOSITIVO NO ENCONTRADO</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">N</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">DISPOSITIVO OBSTRUIDO</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">OB</td></tr>
                    </table>
                </td>
                <td style="width: 2%; border: none;"></td>
                <td style="width: 24%; border: none; padding: 0; vertical-align: top;">
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr><td class="bg-header" colspan="2" style="font-size: 7px; padding: 2px; line-height: 1;">LEYENDA DE<br>SEÑALES DE PRESENCIA</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">CADAVER</td><td class="text-center" style="font-size: 7px; font-weight: bold; width: 25%; padding: 2px;">C</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">EXCRETAS</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">E</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">HUELLAS</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">H</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">ORINA</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">O</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">PELOS</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">P</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">ROEDURA</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">R</td></tr>
                    </table>
                </td>
                <td style="width: 2%; border: none;"></td>
                <td style="width: 40%; border: none; padding: 0; vertical-align: top;">
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr><td class="bg-header" colspan="2" style="font-size: 7px; padding: 2px;">LEYENDA DE HALLAZGOS</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">CAPTURA EN TRAMPA PEGANTE</td><td class="text-center" style="font-size: 7px; font-weight: bold; width: 20%; padding: 2px;">C-TP</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">CAPTURA EN JAULA</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">C-J</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px;">CONSUMO DE RODENTICIDA</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">C-R</td></tr>
                        <tr><td class="label" style="font-size: 6.5px; padding: 2px; line-height: 1;">CONSUMO DE CEBO NO TÓXICO<br>(SIN CAPTURA)</td><td class="text-center" style="font-size: 7px; font-weight: bold; padding: 2px;">CNT-SC</td></tr>
                    </table>
                </td>
            </tr>
        </table>
    @endif

    @if($mostroLeyendaInsectos)
        <table style="margin-top: 10px; max-width: 360px; margin-left: auto; margin-right: auto;">
            <tr>
                <td class="section-header" colspan="2">LEYENDA DE ESTADO DE LÁMINA</td>
            </tr>
            <tr>
                <td class="label">LÁMINA DESPRENDIDA</td>
                <td class="text-center">D</td>
            </tr>
            <tr>
                <td class="label">LÁMINA MOJADA</td>
                <td class="text-center">M</td>
            </tr>
            <tr>
                <td class="label">LÁMINA EN BUEN ESTADO</td>
                <td class="text-center">B</td>
            </tr>
        </table>
    @endif

    <div style="margin-top: 20px;">
        <div style="font-size: 9px; font-weight: bold; margin-bottom: 5px;">Comentarios:</div>
        <div style="border-bottom: 1px solid #000; margin-bottom: 15px; width: 100%; min-height: 12px;">
            @if(($formato->observaciones ?? '') !== '')
                <span style="font-size: 8px; padding-left: 5px;">{{ $formato->observaciones }}</span>
            @endif
        </div>
        <div style="border-bottom: 1px solid #000; margin-bottom: 15px; width: 100%;"></div>
        <div style="border-bottom: 1px solid #000; margin-bottom: 30px; width: 100%;"></div>

        <table style="width: 100%; border: none; margin-top: 40px; page-break-inside: avoid;">
            <tr>
                <td style="width: 45%; border: none; text-align: center; vertical-align: top;">
                    @if(!empty($formato->firma_tecnico))
                        <img src="{{ $formato->firma_tecnico }}" style="max-height: 50px; margin-bottom: -10px;">
                    @else
                        <div style="height: 50px;"></div>
                    @endif
                    <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto; padding-top: 2px; font-size: 8px; font-weight: bold;">
                        RESPONSABLE QSCI PEST CONTROL
                    </div>
                </td>
                <td style="width: 10%; border: none;"></td>
                <td style="width: 45%; border: none; text-align: center; vertical-align: top;">
                    @if(!empty($formato->firma_cliente))
                        <img src="{{ $formato->firma_cliente }}" style="max-height: 50px; margin-bottom: -10px;">
                    @else
                        <div style="height: 50px;"></div>
                    @endif
                    <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto; padding-top: 2px; font-size: 8px; font-weight: bold;">
                        RESPONSABLE CLIENTE
                    </div>
                    @if(!empty($formato->nombre_cliente))
                        <div style="font-size: 8px; margin-top: 2px;">{{ strtoupper($formato->nombre_cliente) }}</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>
</body>
</html>