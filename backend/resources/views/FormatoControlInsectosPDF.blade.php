<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Formato de Control de Insectos {{ $formato->id }}</title>
    <style>
        @page { margin: 0.8cm 1cm; size: A4 portrait; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #000; line-height: 1.3; margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: middle; }
        .label { font-weight: bold; background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .bg-header { background-color: #f2f2f2; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 9px; }
        .no-border { border: none; }
        .header-title { font-size: 14px; font-weight: bold; }
        .header-subtitle { font-size: 11px; font-weight: bold; margin-top: 3px; }
    </style>
</head>
<body>
    @php
        $formatosList = is_array($formato->programacionServicio->formatos_fichas ?? null) 
            ? $formato->programacionServicio->formatos_fichas 
            : [];
        $isVoladores = false;
        foreach($formatosList as $f) {
            if (str_contains(strtoupper($f), 'VOLADORES')) {
                $isVoladores = true;
                break;
            }
        }

        $subRows = $isVoladores ? [
            'Fam. Muscidae (mosca doméstica)',
            'Fam. Drosophilidae (mosca de vinagre)',
            'Fam. Phoridae (mosca jorobada)',
            'Fam. Psychodidae (mosca del drenaje)',
            'Fam. Chironomidae (mosquito enano)',
            'Fam. Culicidae (mosquitos)',
            'Fam. Pyralidae/Tineidae/Gelechiidae (polillas)',
            'Fam. Sarcophagidae/Calliphoridae (mosca de la carne/mosca metálica)',
            'Otros no identificados'
        ] : ['ADULTO', 'NINFA', 'OOTECA'];

        $labelSub = $isVoladores ? 'INSECTO' : 'ESTADIO';
        $jsonField = $isVoladores ? 'conteo_insectos' : 'conteo_estadio';
        $titleSub = $isVoladores ? 'CONTROL DE INSECTOS VOLADORES' : 'CONTROL DE INSECTOS';
        $numSubRows = count($subRows);
    @endphp

    {{-- ENCABEZADO --}}
    <table>
        <tr>
            <td style="width: 15%; text-align: center; padding: 8px;">
                @if(file_exists(public_path('images/logo-orden.png')))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="90">
                @endif
            </td>
            <td style="width: 60%; text-align: center;">
                <div class="header-title">FORMATO OPERACIONAL</div>
                <div class="header-subtitle">{{ $titleSub }}</div>
            </td>
            <td style="width: 25%; padding: 0;">
                <table style="margin: 0; border: none;">
                    <tr>
                        <td class="label" style="width: 40%; border-top: none; border-left: none;">Código</td>
                        <td class="text-center" style="width: 60%; border-top: none; border-right: none;">{{ $formato->codigo_documento ?? 'FO-OP-002' }}</td>
                    </tr>
                    <tr>
                        <td class="label" style="border-left: none;">Fecha</td>
                        <td class="text-center" style="border-right: none;">{{ $formato->fecha ? \Carbon\Carbon::parse($formato->fecha)->format('d/m/Y') : '---' }}</td>
                    </tr>
                    <tr>
                        <td class="label" style="border-bottom: none; border-left: none;">Versión</td>
                        <td class="text-center" style="border-bottom: none; border-right: none;">{{ $formato->version ?? '02' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- PROVEEDOR Y DATOS GENERALES --}}
    <table style="margin-top: -1px;">
        <tr>
            <td colspan="4" style="font-size: 9px; padding: 5px 8px;">
                <span class="label">PROVEEDOR:</span> Multitasking Servicios Generales S.A.C &nbsp;&nbsp;
                <span class="label">RUC:</span> 20607499234 &nbsp;&nbsp;
                <span class="label">DIRECCIÓN:</span> Av. 13 de enero Mz. H-V Lt.02 APV Inca Manco Cápac - SJL
            </td>
        </tr>
        <tr>
            <td class="label" style="width: 15%;">CLIENTE :</td>
            <td style="width: 50%;">{{ $formato->cliente ?? '---' }}</td>
            <td colspan="2" style="width: 35%;">{{ $formato->direccion ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">TIPO DE DISPOSITIVO :</td>
            <td>{{ $isVoladores ? 'Trampa de Luz' : 'Lámina Pegante' }}</td>
            <td class="label" style="width: 15%;">FICHA N°:</td>
            <td style="width: 20%;">{{ $formato->id }}</td>
        </tr>
        <tr>
            <td class="label">FECHA :</td>
            <td colspan="3">{{ $formato->fecha ? \Carbon\Carbon::parse($formato->fecha)->format('d/m/Y') : '---' }}</td>
        </tr>
    </table>

    {{-- ESPECIE IDENTIFICADA --}}
    @if(!$isVoladores)
        <div style="margin-bottom: 8px; font-size: 10px;">
            <span class="label">Especie identificada:</span><br>
            1 _________________________________________________<br>
            2 _________________________________________________<br>
            3 _________________________________________________
        </div>
    @endif

    @php
        $allItems = [];
        foreach ($secciones as $seccion) {
            if (in_array($seccion['tipo'], ['lamina', 'rastreros_lamina', 'roedores_lamina', 'trampa_luz', 'trampa-luz'])) {
                $allItems = array_merge($allItems, $seccion['items']);
            }
        }
        
        $tipoPdf = $tipo_pdf ?? 'verdadera';
        $fieldCount = ($tipoPdf === 'falsa' || $tipoPdf === 'auditiva') ? 'auditiva' : 'verdadera';

        $itemsByLocation = [];
        foreach ($allItems as $item) {
            $loc = $item['ubicacion'] ?? '---';
            $itemsByLocation[$loc][] = $item;
        }
        $flatDevices = [];
        foreach ($itemsByLocation as $loc => $devices) {
            foreach ($devices as $d) {
                $d['_loc_name'] = $loc;
                $flatDevices[] = $d;
            }
        }
        
        // Chunk by 6 (3 left, 3 right) for Voladores, or maybe 10 (5/5) for General
        $chunkSize = $isVoladores ? 6 : 10;
        $chunks = array_chunk($flatDevices, $chunkSize);
    @endphp

    @foreach($chunks as $chunkIdx => $chunk)
        @php
            $half = ceil(count($chunk) / 2);
            $leftItems = array_slice($chunk, 0, $half);
            $rightItems = array_slice($chunk, $half);
        @endphp

        <table style="border: none; margin-bottom: 10px; table-layout: fixed; width: 100%; @if(!$loop->last) page-break-after: auto; @endif">
            <tr>
                {{-- COLUMNA IZQUIERDA --}}
                <td style="width: 49%; vertical-align: top; border: none; padding: 0;">
                    <table style="table-layout: fixed; width: 100%;">
                        <thead>
                            <tr>
                                <th class="bg-header" style="width: 25%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">UBICACIÓN</th>
                                <th class="bg-header" style="width: 10%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">N°</th>
                                <th class="bg-header" style="width: 40%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">{{ $labelSub }}</th>
                                <th class="bg-header" style="width: 10%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">CONT.</th>
                                <th class="bg-header" style="width: 15%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">EST.</th>
                            </tr>
                        </thead>
                        <tbody>
                            @php
                                // Group by location within this chunk column to handle rowspan
                                $leftGroups = [];
                                foreach($leftItems as $item) {
                                    $leftGroups[$item['_loc_name']][] = $item;
                                }
                            @endphp
                            @foreach($leftGroups as $locName => $grpDevices)
                                @foreach($grpDevices as $dIdx => $item)
                                    @php
                                        $dataArray = is_array($item[$jsonField] ?? null) ? $item[$jsonField] : [];
                                        $estadoVerdadera = $item['estado_dispositivo_verdadera'] ?? $item['estado_dispositivo'] ?? 'B';
                                        $estadoAuditiva = $item['estado_dispositivo_auditiva'] ?? $item['estado_dispositivo'] ?? 'B';
                                        $estadoDisp = ($fieldCount === 'auditiva') ? $estadoAuditiva : $estadoVerdadera;
                                    @endphp
                                    @foreach($subRows as $sIdx => $subLabel)
                                        @php
                                            $conteo = 0;
                                            $matchKey = null;
                                            $normSubLabel = strtoupper(trim($subLabel));
                                            
                                            // Extract a potential short key from the label (e.g. "Muscidae" from "Fam. Muscidae...")
                                            $shortKey = '';
                                            if (preg_match('/Fam\. (\w+)/', $subLabel, $matches)) {
                                                $shortKey = strtoupper($matches[1]);
                                            } elseif (str_contains($normSubLabel, 'OTROS')) {
                                                $shortKey = 'OTROS';
                                            }

                                            foreach (array_keys($dataArray) as $k) {
                                                $normK = strtoupper(trim($k));
                                                // Try exact match, partial match, or short key match
                                                if ($normK === $normSubLabel || 
                                                    ($shortKey && str_contains($normK, $shortKey)) ||
                                                    ($normK && strlen($normK) > 3 && str_contains($normSubLabel, $normK))) {
                                                    $matchKey = $k;
                                                    break;
                                                }
                                            }
                                            
                                            if ($matchKey && isset($dataArray[$matchKey])) {
                                                $entry = $dataArray[$matchKey];
                                                if (is_numeric($entry)) {
                                                    $conteo = ($fieldCount === 'auditiva') ? 0 : (int)$entry;
                                                } else {
                                                    $conteo = ($fieldCount === 'auditiva') 
                                                        ? ($entry['auditiva'] ?? $entry['falsa'] ?? $entry['audit'] ?? 0) 
                                                        : ($entry['verdadera'] ?? $entry['real'] ?? 0);
                                                }
                                            }
                                        @endphp
                                        <tr>
                                            @if($dIdx === 0 && $sIdx === 0)
                                                <td rowspan="{{ count($grpDevices) * $numSubRows }}" style="font-size: {{ $isVoladores ? '8.5px' : '7.5px' }}; padding: 3px;">{{ $locName }}</td>
                                            @endif
                                            @if($sIdx === 0)
                                                <td rowspan="{{ $numSubRows }}" class="text-center" style="font-size: {{ $isVoladores ? '8.5px' : '7.5px' }}; padding: 3px;">{{ $item['codigo_caja'] ?? '---' }}</td>
                                            @endif
                                            <td style="font-size: {{ $isVoladores ? '8px' : '7px' }}; padding: 2px 3px; line-height: 1.1;">{{ $subLabel }}</td>
                                            <td class="text-center" style="font-size: {{ $isVoladores ? '8.5px' : '7.5px' }}; padding: 2px;">{{ (int) $conteo }}</td>
                                            @if($sIdx === 0)
                                                <td rowspan="{{ $numSubRows }}" class="text-center" style="font-weight: bold; font-size: {{ $isVoladores ? '10px' : '8.5px' }}; padding: 3px;">{{ $estadoDisp }}</td>
                                            @endif
                                        </tr>
                                    @endforeach
                                @endforeach
                            @endforeach
                        </tbody>
                    </table>
                </td>

                <td style="width: 2%; border: none;"></td>

                {{-- COLUMNA DERECHA --}}
                <td style="width: 49%; vertical-align: top; border: none; padding: 0;">
                    @if(count($rightItems) > 0)
                        <table style="table-layout: fixed; width: 100%;">
                            <thead>
                                <tr>
                                    <th class="bg-header" style="width: 25%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">UBICACIÓN</th>
                                    <th class="bg-header" style="width: 10%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">N°</th>
                                    <th class="bg-header" style="width: 40%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">{{ $labelSub }}</th>
                                    <th class="bg-header" style="width: 10%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">CONT.</th>
                                    <th class="bg-header" style="width: 15%; font-size: {{ $isVoladores ? '8.5px' : '7.5px' }};">EST.</th>
                                </tr>
                            </thead>
                            <tbody>
                                @php
                                    $rightGroups = [];
                                    foreach($rightItems as $item) {
                                        $rightGroups[$item['_loc_name']][] = $item;
                                    }
                                @endphp
                                @foreach($rightGroups as $locName => $grpDevices)
                                    @foreach($grpDevices as $dIdx => $item)
                                        @php
                                            $dataArray = is_array($item[$jsonField] ?? null) ? $item[$jsonField] : [];
                                            $estadoVerdadera = $item['estado_dispositivo_verdadera'] ?? $item['estado_dispositivo'] ?? 'B';
                                            $estadoAuditiva = $item['estado_dispositivo_auditiva'] ?? $item['estado_dispositivo'] ?? 'B';
                                            $estadoDisp = ($fieldCount === 'auditiva') ? $estadoAuditiva : $estadoVerdadera;
                                        @endphp
                                        @foreach($subRows as $sIdx => $subLabel)
                                            @php
                                                $conteo = 0;
                                                $matchKey = null;
                                                $normSubLabel = strtoupper(trim($subLabel));
                                                
                                                // Extract a potential short key from the label (e.g. "Muscidae" from "Fam. Muscidae...")
                                                $shortKey = '';
                                                if (preg_match('/Fam\. (\w+)/', $subLabel, $matches)) {
                                                    $shortKey = strtoupper($matches[1]);
                                                } elseif (str_contains($normSubLabel, 'OTROS')) {
                                                    $shortKey = 'OTROS';
                                                }

                                                foreach (array_keys($dataArray) as $k) {
                                                    $normK = strtoupper(trim($k));
                                                    // Try exact match, partial match, or short key match
                                                    if ($normK === $normSubLabel || 
                                                        ($shortKey && str_contains($normK, $shortKey)) ||
                                                        ($normK && strlen($normK) > 3 && str_contains($normSubLabel, $normK))) {
                                                        $matchKey = $k;
                                                        break;
                                                    }
                                                }
                                                
                                                if ($matchKey && isset($dataArray[$matchKey])) {
                                                    $entry = $dataArray[$matchKey];
                                                    if (is_numeric($entry)) {
                                                        $conteo = ($fieldCount === 'auditiva') ? 0 : (int)$entry;
                                                    } else {
                                                        $conteo = ($fieldCount === 'auditiva') 
                                                            ? ($entry['auditiva'] ?? $entry['falsa'] ?? $entry['audit'] ?? 0) 
                                                            : ($entry['verdadera'] ?? $entry['real'] ?? 0);
                                                    }
                                                }
                                            @endphp
                                            <tr>
                                                @if($dIdx === 0 && $sIdx === 0)
                                                    <td rowspan="{{ count($grpDevices) * $numSubRows }}" style="font-size: {{ $isVoladores ? '8.5px' : '7.5px' }}; padding: 3px;">{{ $locName }}</td>
                                                @endif
                                                @if($sIdx === 0)
                                                    <td rowspan="{{ $numSubRows }}" class="text-center" style="font-size: {{ $isVoladores ? '8.5px' : '7.5px' }}; padding: 3px;">{{ $item['codigo_caja'] ?? '---' }}</td>
                                                @endif
                                                <td style="font-size: {{ $isVoladores ? '8px' : '7px' }}; padding: 2px 3px; line-height: 1.1;">{{ $subLabel }}</td>
                                                <td class="text-center" style="font-size: {{ $isVoladores ? '8.5px' : '7.5px' }}; padding: 2px;">{{ (int) $conteo }}</td>
                                                @if($sIdx === 0)
                                                    <td rowspan="{{ $numSubRows }}" class="text-center" style="font-weight: bold; font-size: {{ $isVoladores ? '10px' : '8.5px' }}; padding: 3px;">{{ $estadoDisp }}</td>
                                                @endif
                                            </tr>
                                        @endforeach
                                    @endforeach
                                @endforeach
                            </tbody>
                        </table>
                    @endif
                </td>
            </tr>
        </table>
    @endforeach

    {{-- LEYENDA --}}
    @if($isVoladores)
        <table style="margin-top: 10px; width: 40%; margin-left: 0;">
            <tr><td class="bg-header" colspan="2" style="font-size: 8px;">LEYENDA DE ESTADO DEL DISPOSITIVO</td></tr>
            <tr><td class="label" style="font-size: 8px;">DISPOSITIVO AVERIADO</td><td class="text-center" style="font-size: 8px; width: 20%;">A</td></tr>
            <tr><td class="label" style="font-size: 8px;">BUEN ESTADO</td><td class="text-center" style="font-size: 8px;">B</td></tr>
            <tr><td class="label" style="font-size: 8px;">DISPOSITIVO APAGADO</td><td class="text-center" style="font-size: 8px;">AP</td></tr>
            <tr><td class="label" style="font-size: 8px;">DISPOSITIVO DESAPARECIDO</td><td class="text-center" style="font-size: 8px;">D</td></tr>
            <tr><td class="label" style="font-size: 8px;">DISPOSITIVO OBSTRUIDO</td><td class="text-center" style="font-size: 8px;">OB</td></tr>
        </table>
    @else
        <table style="margin-top: 10px; width: 40%; margin-left: 0;">
            <tr><td class="bg-header" colspan="2" style="font-size: 8px;">LEYENDA DE ESTADO DE LÁMINA</td></tr>
            <tr><td class="label" style="font-size: 8px;">LÁMINA DESPRENDIDA</td><td class="text-center" style="font-size: 8px; width: 20%;">D</td></tr>
            <tr><td class="label" style="font-size: 8px;">LÁMINA MOJADA</td><td class="text-center" style="font-size: 8px;">M</td></tr>
            <tr><td class="label" style="font-size: 8px;">LÁMINA EN BUEN ESTADO</td><td class="text-center" style="font-size: 8px;">B</td></tr>
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
