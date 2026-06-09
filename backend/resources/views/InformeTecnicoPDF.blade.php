<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Informe Técnico {{ $informe->correlativo }}</title>
    <style>
        @page {
            margin: 1cm 1.5cm;
            size: A4 portrait;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 6px 10px;
            vertical-align: middle;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: bold;
        }

        .header-table td {
            padding: 5px;
        }

        .header-title {
            font-size: 13px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
        }

        .header-info-table {
            margin: 0;
            font-size: 10px;
        }

        .header-info-table td {
            padding: 2px 5px;
        }

        .data-table td:first-child {
            background-color: #fff;
            font-weight: bold;
            width: 35%;
            text-transform: uppercase;
        }

        .section-bar {
            background-color: #003366;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin: 15px 0;
            border-radius: 2px;
        }

        .content-table thead th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        .products-table td {
            text-align: center;
        }

        .products-table .label-row {
            font-weight: bold;
            text-transform: uppercase;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }
    </style>
</head>

<body>

    {{-- ENCABEZADO --}}
    <table class="header-table">
        <tr>
            <td style="width: 20%; text-align: center;">
                @php
                    $estilo = $informe->estilo ?? 'detallado';
                    $logoPath = public_path('images/logo-orden.png');
                    $logoBase64 = null;
                    if (file_exists($logoPath)) {
                        try {
                            $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
                        } catch(\Throwable $e) {}
                    }
                @endphp
                @if ($logoBase64)
                    <img src="{{ $logoBase64 }}" width="110">
                @else
                    <div style="border: 1px solid #ccc; padding: 10px; font-size: 8px;">LOGO</div>
                @endif
            </td>
            <td style="width: 55%;" class="header-title">
                INFORME TÉCNICO DE CONTROL DE PLAGAS Y ACTIVIDADES DE SANEAMIENTO AMBIENTAL
            </td>
            <td style="width: 25%; padding: 0;">
                <table class="header-info-table">
                    <tr>
                        <td class="text-center">Código</td>
                        <td class="text-center">{{ $informe->correlativo }}</td>
                    </tr>
                    <tr>
                        <td class="text-center">Fecha</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($informe->fecha_emision)->format('d/m/Y') }}
                        </td>
                    </tr>
                    <tr>
                        <td class="text-center">Versión</td>
                        <td class="text-center">02</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- DATOS GENERALES --}}
    <table class="data-table" style="margin-top: 20px;">
        <tr>
            <td>CÓDIGO DE INFORME</td>
            <td>{{ $informe->correlativo }}</td>
        </tr>
        <tr>
            <td>CLIENTE</td>
            <td>{{ $informe->cliente->nombre_empresa ?? '---' }}</td>
        </tr>
        <tr>
            <td>UBICACIÓN</td>
            <td>{{ $informe->ubicacion ?? '---' }}</td>
        </tr>
        <tr>
            <td>ACTIVIDAD</td>
            <td>{{ $informe->actividad ?? '---' }}</td>
        </tr>
        <tr>
            <td>MES DE LA ACTIVIDAD</td>
            <td>{{ $informe->mes_actividad ?? '---' }}</td>
        </tr>
        <tr>
            <td>FECHA DE EMISIÓN</td>
            <td>{{ \Carbon\Carbon::parse($informe->fecha_emision)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td>ELABORADO POR</td>
            <td>{{ $informe->elaborado_por ?? '---' }}</td>
        </tr>
    </table>

    @php
        $visitasRaw = is_array($informe->visitas) ? $informe->visitas : [];
        $grupos = [];
        foreach ($visitasRaw as $v) {
            $t = $v['tipo_servicio'] ?? 'OTROS';
            $grupos[$t][] = $v;
        }

        $insumosData = is_array($informe->insumos) ? $informe->insumos : [];
        $resolverHallazgoBase64 = function ($rawUrl) {
            $raw = trim((string) $rawUrl);
            if ($raw === '') {
                return null;
            }

            if (str_starts_with($raw, 'data:image/')) {
                return $raw;
            }

            $candidatePaths = [];

            if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
                $parsedPath = parse_url($raw, PHP_URL_PATH);
                $parsedPath = is_string($parsedPath) ? trim($parsedPath) : '';
                if ($parsedPath !== '') {
                    $candidatePaths[] = $parsedPath;
                }
            } else {
                $candidatePaths[] = $raw;
            }

            foreach ($candidatePaths as $path) {
                $normalized = ltrim((string) $path, '/\\');
                if ($normalized === '') {
                    continue;
                }

                $storageRelative = $normalized;
                if (str_starts_with($storageRelative, 'media/')) {
                    $storageRelative = substr($storageRelative, 6);
                }
                if (str_starts_with($storageRelative, 'storage/')) {
                    $storageRelative = substr($storageRelative, 8);
                }
                if (str_starts_with($storageRelative, 'public/')) {
                    $storageRelative = substr($storageRelative, 7);
                }

                if (
                    $storageRelative !== '' &&
                    \Illuminate\Support\Facades\Storage::disk('public')->exists($storageRelative)
                ) {
                    try {
                        $binary = \Illuminate\Support\Facades\Storage::disk('public')->get($storageRelative);
                        $extension = strtolower(pathinfo($storageRelative, PATHINFO_EXTENSION));
                        $mimeMap = [
                            'png' => 'image/png',
                            'gif' => 'image/gif',
                            'webp' => 'image/webp',
                            'bmp' => 'image/bmp',
                            'svg' => 'image/svg+xml',
                        ];
                        $mime = $mimeMap[$extension] ?? 'image/jpeg';
                        return 'data:' . $mime . ';base64,' . base64_encode($binary);
                    } catch (\Throwable $e) {
                    }
                }
            }

            if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
                try {
                    if (function_exists('curl_version')) {
                        $ch = curl_init();
                        curl_setopt($ch, CURLOPT_URL, $raw);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 6);
                        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                        $binary = curl_exec($ch);
                        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                        curl_close($ch);

                        if ($binary) {
                            $mime =
                                is_string($contentType) && str_starts_with($contentType, 'image/')
                                    ? $contentType
                                    : 'image/jpeg';
                            return 'data:' . $mime . ';base64,' . base64_encode($binary);
                        }
                    }

                    if (ini_get('allow_url_fopen')) {
                        $binary = @file_get_contents($raw);
                        if ($binary !== false) {
                            return 'data:image/jpeg;base64,' . base64_encode($binary);
                        }
                    }
                } catch (\Throwable $e) {
                    return null;
                }
            }

            return null;
        };

        $findInsumo = function ($search) use ($insumosData) {
            foreach ($insumosData as $i) {
                if (strpos(strtoupper($i['producto'] ?? ''), strtoupper($search)) !== false) {
                    return [
                        'lote' => $i['lote'] ?? '---',
                        'ingrediente' => $i['ingrediente_activo'] ?? ($i['ingre_activo'] ?? '---'),
                        'concentracion' => $i['concentracion'] ?? '---',
                    ];
                }
            }
            return ['lote' => '---', 'ingrediente' => '---', 'concentracion' => '---'];
        };
        $dataCebo = $findInsumo('FINAL');
        $dataLamina = $findInsumo('LAMINA');
    @endphp

    @foreach ($grupos as $tipo => $visitasGrupo)
        @php
            $tipoUpper = strtoupper(trim($tipo));
            $tieneFormatoOperacional = (strpos($tipoUpper, 'ROEDORES') !== false || strpos($tipoUpper, 'RASTREROS') !== false || strpos($tipoUpper, 'VOLADORES') !== false);
            $estilo = $visitasGrupo[0]['estilo'] ?? 'detallado';
        @endphp

        @if (!$tieneFormatoOperacional)
            @php
                $servicioData = $extraData['datos_servicios'][$tipoUpper] ?? [
                    'quimicos' => [],
                    'areas_aplicadas' => [],
                    'productos' => []
                ];
                // Fallback a limpieza_data si está vacío para mantener compatibilidad
                if (empty($servicioData['quimicos']) && !empty($extraData['limpieza_data'])) {
                    $servicioData = $extraData['limpieza_data'];
                }
            @endphp
            @include('informes.partials.limpieza_cisternas', [
                'informe' => $informe,
                'limpieza' => $servicioData,
                'visitasGrupo' => $visitasGrupo,
                'tipo' => $tipo
            ])
            @continue
        @endif

        <div class="section-bar">{{ strtoupper($tipo) }}</div>

        <table class="content-table text-center" style="margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="width: 25%;">N° DE VISITAS</th>
                    <th style="width: 40%;">FECHA DE VISITAS</th>
                    <th style="width: 35%;">N° FICHAS</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($visitasGrupo as $index => $visita)
                    <tr>
                        <td class="font-bold">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</td>
                        <td>{{ \Carbon\Carbon::parse($visita['fecha'] ?? '')->format('d/m/Y') }}</td>
                        <td class="font-bold">{{ $visita['correlativo_ficha'] ?? '---' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        @php
            $hasQuimicos = isset($extraData['datos_servicios'][$tipoUpper]['quimicos']) && count($extraData['datos_servicios'][$tipoUpper]['quimicos']) > 0;
            $showSection1 = (strpos(strtoupper($tipo), 'ROEDORES') !== false) || $hasQuimicos;
        @endphp

        @if ($showSection1)
        {{-- 1. PRODUCTOS --}}
        <div style="font-weight: bold; font-size: 11px; color: #003366; margin-bottom: 10px;">1. INFORMACIÓN DE PRODUCTOS UTILIZADOS</div>
        @if (strpos(strtoupper($tipo), 'ROEDORES') !== false)
            <table class="products-table" style="margin-bottom: 15px;">
                <tr class="label-row">
                    <td style="width: 25%; background-color: #f2f2f2;">DISPOSITIVO</td>
                    <td colspan="2">CAJA CEBADERA</td>
                </tr>
                <tr class="label-row">
                    <td style="background-color: #f2f2f2;">USO / TIPO</td>
                    <td style="width: 37.5%; background-color: #fafafa;">CON CEBO</td>
                    <td style="width: 37.5%; background-color: #fafafa;">CON LÁMINA PEGANTE</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">INSUMO</td>
                    <td>FINAL ALL-WEATHER BLOX</td>
                    <td>FUMITRAP (LÁMINA)</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">TIPO SUSTANCIA</td>
                    <td>CEBO TÓXICO</td>
                    <td>PEGAJOSA / NO TÓXICA</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">INGRED. ACTIVO</td>
                    <td>{{ $dataCebo['ingrediente'] !== '---' ? $dataCebo['ingrediente'] : 'BRODIFACOUM' }}</td>
                    <td>{{ $dataLamina['ingrediente'] !== '---' ? $dataLamina['ingrediente'] : 'Poliisobutileno' }}
                    </td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">LOTE</td>
                    <td>{{ $extraData['lote_cebo'] ?? ($dataCebo['lote'] ?? '---') }}</td>
                    <td>{{ $extraData['lote_lamina'] ?? ($dataLamina['lote'] ?? '---') }}</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">CONCENTRACIÓN</td>
                    <td>{{ $extraData['concentracion_cebo'] ?? '0.005%' }}</td>
                    <td>{{ $extraData['concentracion_lamina'] ?? '61.80%' }}</td>
                </tr>
            </table>
            <table class="products-table" style="margin-bottom: 20px;">
                <tr class="label-row">
                    <td style="width: 25%; background-color: #f2f2f2;">DISPOSITIVO</td>
                    <td>JAULAS DE CAPTURA</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">INSUMO</td>
                    <td>ALIMENTOS VARIOS</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">TIPO SUSTANCIA</td>
                    <td>NO APLICA</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">INGRED. ACTIVO</td>
                    <td>NO APLICA</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">LOTE</td>
                    <td>NO APLICA</td>
                </tr>
                <tr>
                    <td class="label-row" style="background-color: #f2f2f2;">CONCENTRACIÓN</td>
                    <td>Kg</td>
                </tr>
            </table>
        @elseif ($hasQuimicos)
            <div style="font-weight: bold; font-size: 10px; color: #003366; text-align: center; margin-bottom: 10px;">1.1. DESINSECTACIÓN QUÍMICA PROGRAMADA</div>
            
            @php
                $qr = array_values($extraData['datos_servicios'][$tipoUpper]['quimicos']);
                $areasAplicadasArr = $extraData['datos_servicios'][$tipoUpper]['areas_aplicadas'] ?? [];
                $areasAplicadas = count($areasAplicadasArr) > 0 ? implode(', ', $areasAplicadasArr) : 'Sin áreas registradas';
            @endphp
            @if(count($qr) > 0)
                @foreach($qr as $indexProducto => $q)
                    @php
                        $chunksVisitas = array_chunk($q['visitas'], 8);
                    @endphp
                    @foreach($chunksVisitas as $chunkIndex => $chunk)
                        <table class="products-table text-center" style="margin-bottom: 10px; table-layout: fixed; width: 100%; word-wrap: break-word; font-size: 8px;">
                            <tr style="background-color: #1a3352; color: white;">
                                <td colspan="{{ count($chunk) + 1 }}">
                                    DESINSECTACIÓN QUÍMICA - {{ strtoupper($q['producto']) }} 
                                    @if(count($chunksVisitas) > 1) (Parte {{ $chunkIndex + 1 }}) @endif
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; width: 20%; font-size: 9px;">PRODUCTO QUIMICO</td>
                                <td colspan="{{ count($chunk) }}">{{ $q['producto'] }}</td>
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">ING. ACTIVO</td>
                                <td colspan="{{ count($chunk) }}">{{ $q['ingre_activo'] }}</td>
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">LOTE</td>
                                <td colspan="{{ count($chunk) }}">{{ $q['lote'] }}</td>
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">CONCENTRACIÓN</td>
                                <td colspan="{{ count($chunk) }}">{{ $q['concentracion'] }}</td>
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">CANTIDAD USADA</td>
                                @foreach($chunk as $v)
                                    <td>{{ $v['cantidad'] }}</td>
                                @endforeach
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">MÉTODO</td>
                                <td colspan="{{ count($chunk) }}">{{ $q['metodo'] }}</td>
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">FECHA DE SERVICIO</td>
                                @foreach($chunk as $v)
                                    <td>{{ $v['fecha'] }}</td>
                                @endforeach
                            </tr>
                            <tr>
                                <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">FICHA DE SERVICIO</td>
                                @foreach($chunk as $v)
                                    <td>{{ $v['ficha'] }}</td>
                                @endforeach
                            </tr>
                        </table>
                    @endforeach
                @endforeach
                
                <table class="products-table text-center" style="margin-bottom: 20px;">
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; width: 30%;">AREAS APLICADAS</td>
                        <td>{{ $areasAplicadas }}</td>
                    </tr>
                </table>
        @endif
        @endif
        @endif

        {{-- 2. IMÁGENES DISPOSITIVOS --}}
        <div style="font-weight: bold; font-size: 11px; color: #003366; margin-bottom: 12px;">2. DISPOSITIVOS E INSUMOS
            UTILIZADOS PARA LAS ACTIVIDADES DE CONTROL</div>
        @php
            $itemsM = [];
            $tipoKey = strtoupper($tipo);
            if (isset($extraData[$tipoKey])) {
                foreach ($extraData[$tipoKey]['items'] as $it) {
                    $b64 = $it['data']['base64'] ?? ($it['data']['imagen_base64'] ?? null);
                    if ($b64) {
                        $itemsM[] = ['titulo' => $it['titulo'], 'base64' => $b64];
                    }
                }
            }
            $chunks = array_chunk($itemsM, 2);
        @endphp
        @if (count($itemsM) > 0)
            <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 20px;">
                @foreach ($chunks as $chunk)
                    <tr>
                        @foreach ($chunk as $it)
                            <td style="width: 48%; border: 1px solid #333; text-align: center; padding: 10px;">
                                <img src="{{ $it['base64'] }}" style="max-width: 150px; max-height: 90px;"><br>
                                <div style="font-weight: bold; font-size: 8px; margin-top: 5px;">{{ $it['titulo'] }}
                                </div>
                            </td>
                        @endforeach
                        @if (count($chunk) == 1)
                            <td style="width: 48%; border: none;"></td>
                        @endif
                    </tr>
                @endforeach
            </table>
        @else
            <div
                style="padding: 10px; border: 1px dashed #ccc; text-align: center; font-size: 9px; margin-bottom: 20px;">
                No se encontraron imágenes.</div>
        @endif

        {{-- 3. ANÁLISIS DE TENDENCIA (SOLO VOLADORES) --}}
        @if (strpos(strtoupper($tipo), 'VOLADORES') !== false)
            <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 10px;">3.
                ANÁLISIS DE TENDENCIA DE ACTIVIDAD DE INSECTOS VOLADORES</div>

            @if (isset($extraData['dispositivos_trampa_luz']) && count($extraData['dispositivos_trampa_luz']) > 0 && $estilo === 'detallado')
                <div style="font-weight: bold; font-size: 9px; color: #003366; text-align: center; margin-bottom: 5px;">
                    3.1. TRAMPAS DE LUZ</div>
                <table style="width: 75%; margin: 0 auto 10px auto;">
                    <thead>
                        <tr style="background-color: #1a3352; color: white;">
                            <th>N°</th>
                            <th>CÓDIGO</th>
                            <th>UBICACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($extraData['dispositivos_trampa_luz'] as $idx => $disp)
                            <tr>
                                <td class="text-center">{{ $idx + 1 }}</td>
                                <td class="text-center font-bold">{{ $disp['codigo'] }}</td>
                                <td>{{ strtoupper($disp['ubicacion']) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @if (isset($extraData['chart_voladores_trampas_por_visita']) && $estilo !== 'basico')
                <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 8px;">
                    3.2. REGISTRO DE TENDENCIA DE ACTIVIDAD DE INSECTOS – TRAMPA DE LUZ</div>
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="{{ $extraData['chart_voladores_trampas_por_visita'] }}"
                        style="width: 90%; max-width:900px; border:1px solid #e6eefc; padding:6px; background:#fff;" />
                </div>
            @endif

            @if (isset($extraData['chart_voladores_anual']) && $estilo !== 'basico')
                <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 8px;">
                    3.3. CONSOLIDADO ANUAL DE CAPTURA DE INSECTOS VOLADORES</div>
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="{{ $extraData['chart_voladores_anual'] }}"
                        style="width: 90%; max-width:900px; border:1px solid #e6eefc; padding:6px; background:#fff;" />
                </div>
            @endif

            @if (isset($extraData['chart_voladores_ubicacion']) && $estilo !== 'basico')
                <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 8px;">
                    3.4. ABUNDANCIA DE FAMILIAS TAXONOMICAS POR UBICACIÓN</div>
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="{{ $extraData['chart_voladores_ubicacion'] }}"
                        style="width: 90%; max-width:900px; border:1px solid #e6eefc; padding:6px; background:#fff;" />
                </div>
            @endif

            @if (isset($extraData['chart_voladores_familias']) && $estilo !== 'basico')
                <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 8px;">
                    3.5. ACTIVIDAD DETALLADA POR FAMILIA TAXONÓMICA</div>
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="{{ $extraData['chart_voladores_familias'] }}"
                        style="width: 90%; max-width:900px; border:1px solid #e6eefc; padding:6px; background:#fff;" />
                </div>
            @endif

            @if (isset($extraData['charts_voladores_ubicaciones']) && count($extraData['charts_voladores_ubicaciones']) > 0 && $estilo !== 'basico')
                <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 8px;">
                    3.6. ACTIVIDAD DETALLADA POR UBICACIÓN</div>
                @foreach ($extraData['charts_voladores_ubicaciones'] as $cLoc)
                    <div style="text-align: center; margin-bottom: 20px; page-break-inside: avoid;">
                        <img src="{{ $cLoc['chart'] }}"
                            style="width: 85%; max-width:800px; border:1px solid #e6eefc; padding:10px; background:#fff;" />
                        <div style="font-size: 9px; color: #666; margin-top: 5px;">{{ $cLoc['codigo'] }} -
                            {{ $cLoc['ubicacion'] }}</div>
                    </div>
                @endforeach
            @endif

            @if (isset($extraData['abundancia_familias_voladores']) && count($extraData['abundancia_familias_voladores']) > 0 && $estilo === 'detallado')
                <div class="page-break"></div>
                <div class="section-bar" style="background-color:#0a4a78; text-align: center; margin-bottom: 20px;">
                    ÍNDICE DE ABUNDANCIA EN RELACIÓN A LA ACTIVIDAD DE LAS FAMILIAS DE INSECTOS EN TRAMPAS DE LUZ UV – {{ strtoupper($informe->mes_actividad ?? '') }}
                </div>
                
                @php
                    $isYamboly = (strpos(strtoupper($informe->cliente->nombre ?? ''), 'YAMBOLY') !== false || strpos(strtoupper($informe->cliente->razon_social ?? ''), 'YAMBOLY') !== false);
                    if ($isYamboly) {
                        $headers1 = ['ÁREA', 'OTROS', 'MOSCAS<br>DOMÉSTICAS', 'MOSCA MENOR', 'ZANCUDO'];
                        $keys1 = ['OTROS', 'MOSCAS DOMÉSTICAS', 'MOSCA MENOR', 'ZANCUDO'];
                        
                        $headers2 = ['ÁREA', 'AVISPA', 'ABEJA', 'MARIPOSA', 'POLILLA', 'GORGOJO'];
                        $keys2 = ['AVISPA', 'ABEJA', 'MARIPOSA', 'POLILLA', 'GORGOJO'];
                    } else {
                        $headers1 = [
                            'ÁREA', 
                            'OTROS NO<br>IDENTIFICADOS', 
                            'MUSCIDAE<br>(MOSCA<br>DOMÉSTICA)', 
                            'DROSOPHILIDAE<br>(MOSCA DE<br>VINAGRE)', 
                            'PHORIDAE<br>(MOSCA<br>JOROBADA)', 
                            'PSYCHODIDAE<br>(MOSCA DE<br>DRENAJE)'
                        ];
                        $keys1 = ['OTROS NO IDENTIFICADOS', 'MUSCIDAE', 'DROSOPHILIDAE', 'PHORIDAE', 'PSYCHODIDAE'];
                        
                        $headers2 = [
                            'ÁREA', 
                            'CHIRONOMIDAE<br>(MOSQUITO<br>ENANO)', 
                            'CULICIDAE<br>(MOSQUITOS)', 
                            'PYRALIDAE/<br>TINEIDAE/<br>GELEICHIIDAE<br>(POLILLAS)', 
                            'SARCOPHAGIDAE/<br>CALLIPHORIDAE<br>(MOSCA DE LA CARNE/<br>MOSCA METÁLICA)'
                        ];
                        $keys2 = ['CHIRONOMIDAE', 'CULICIDAE', 'PYRALIDAE/TINEIDAE/GELECHIIDAE', 'SARCOPHAGIDAE/CALLIPHORIDAE'];
                    }

                    $getUmbralColor = function($val) {
                        $v = (float)$val;
                        if ($v == 0) return '#00b050'; 
                        if ($v > 0 && $v <= 5) return '#92d050'; 
                        if ($v > 5 && $v <= 10) return '#ffff00'; 
                        if ($v > 10 && $v <= 20) return '#f8cbad'; 
                        return '#ff0000'; 
                    };
                @endphp

                <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 15px; font-size: 8px;">
                    <thead>
                        <tr style="background-color: #d9e1f2; font-weight: bold;">
                            @foreach($headers1 as $h)
                                <th style="border: 1px solid #000; padding: 5px;">{!! $h !!}</th>
                            @endforeach
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($extraData['abundancia_familias_voladores'] as $row)
                            <tr>
                                <td style="border: 1px solid #000; padding: 5px; font-size: 7px; text-align: left;">{{ $row['ubicacion'] }}</td>
                                @foreach($keys1 as $k)
                                    @php 
                                        $val = $row['indices'][$k] ?? '0.00'; 
                                        $color = $getUmbralColor($val);
                                    @endphp
                                    <td style="border: 1px solid #000; padding: 5px; background-color: {{ $color }};">{{ $val }}</td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 15px; font-size: 8px;">
                    <thead>
                        <tr style="background-color: #d9e1f2; font-weight: bold;">
                            @foreach($headers2 as $h)
                                <th style="border: 1px solid #000; padding: 5px;">{!! $h !!}</th>
                            @endforeach
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($extraData['abundancia_familias_voladores'] as $row)
                            <tr>
                                <td style="border: 1px solid #000; padding: 5px; font-size: 7px; text-align: left;">{{ $row['ubicacion'] }}</td>
                                @foreach($keys2 as $k)
                                    @php 
                                        $val = $row['indices'][$k] ?? '0.00'; 
                                        $color = $getUmbralColor($val);
                                    @endphp
                                    <td style="border: 1px solid #000; padding: 5px; background-color: {{ $color }};">{{ $val }}</td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <table style="width: 60%; border-collapse: collapse; text-align: center; margin: 30px auto; font-size: 10px; border: 1px solid #000; page-break-inside: avoid;">
                    <thead>
                        <tr style="background-color: #002060; color: white;">
                            <th colspan="3" style="border: 1px solid #000; padding: 5px;">LEYENDA DE UMBRAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #fff;"><td style="border: 1px solid #000; padding: 3px;">NULO</td><td style="border: 1px solid #000; padding: 3px;">0</td><td style="border: 1px solid #000; background-color: #00b050; width: 30%;"></td></tr>
                        <tr style="background-color: #fff;"><td style="border: 1px solid #000; padding: 3px;">BAJO</td><td style="border: 1px solid #000; padding: 3px;">> 0 - 5</td><td style="border: 1px solid #000; background-color: #92d050;"></td></tr>
                        <tr style="background-color: #fff;"><td style="border: 1px solid #000; padding: 3px;">MEDIA</td><td style="border: 1px solid #000; padding: 3px;">> 5 - 10</td><td style="border: 1px solid #000; background-color: #ffff00;"></td></tr>
                        <tr style="background-color: #fff;"><td style="border: 1px solid #000; padding: 3px;">ALTA</td><td style="border: 1px solid #000; padding: 3px;">> 10 - 20</td><td style="border: 1px solid #000; background-color: #f8cbad;"></td></tr>
                        <tr style="background-color: #fff;"><td style="border: 1px solid #000; padding: 3px;">MUY ALTO</td><td style="border: 1px solid #000; padding: 3px;">> 20</td><td style="border: 1px solid #000; background-color: #ff0000;"></td></tr>
                    </tbody>
                </table>
            @endif

            @php
                $hallazgosVoladores = [];
                $evidenciasInforme = is_array($informe->evidencias) ? $informe->evidencias : [];

                foreach ($evidenciasInforme as $evidencia) {
                    if (is_string($evidencia)) {
                        continue;
                    }

                    if (!is_array($evidencia)) {
                        continue;
                    }

                    $tipoEvidencia = strtoupper(trim((string) ($evidencia['tipo_servicio'] ?? '')));
                    if ($tipoEvidencia !== '' && strpos($tipoEvidencia, 'VOLADORES') === false) {
                        continue;
                    }

                    $url = trim((string) ($evidencia['url'] ?? ($evidencia['path'] ?? '')));
                    if ($url === '') {
                        continue;
                    }

                    $base64 = $resolverHallazgoBase64($url);

                    $hallazgosVoladores[] = [
                        'url' => $url,
                        'image_base64' => $base64,
                        'descripcion' => trim((string) ($evidencia['descripcion'] ?? 'Sin descripción')),
                        'fecha' => trim((string) ($evidencia['fecha'] ?? '')),
                    ];
                }

                $hallazgosVoladoresChunks = array_chunk($hallazgosVoladores, 2);
            @endphp

            @if (count($hallazgosVoladores) > 0)
                <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 16px; margin-bottom: 10px;">
                    3.6. HALLAZGOS EN DISPOSITIVOS DE CONTROL (VOLADORES)</div>
                <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 20px;">
                    @foreach ($hallazgosVoladoresChunks as $chunk)
                        <tr>
                            @foreach ($chunk as $hallazgo)
                                <td style="width: 49%; border: 1px solid #333; vertical-align: top; padding: 0;">
                                    @if (!empty($hallazgo['image_base64']))
                                        <img src="{{ $hallazgo['image_base64'] }}" alt="Hallazgo"
                                            style="width: 100%; height: 220px; object-fit: cover; display: block;">
                                    @else
                                        <div
                                            style="height: 220px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #ccc; font-size: 10px; color: #666;">
                                            Imagen no disponible
                                        </div>
                                    @endif
                                    <div style="padding: 8px; font-size: 9px; line-height: 1.35;">
                                        <div><strong>Descripción:</strong>
                                            {{ $hallazgo['descripcion'] !== '' ? $hallazgo['descripcion'] : 'Sin descripción' }}
                                        </div>
                                        @if ($hallazgo['fecha'] !== '')
                                            <div style="margin-top: 4px;"><strong>Fecha:</strong>
                                                {{ $hallazgo['fecha'] }}</div>
                                        @endif
                                    </div>
                                </td>
                            @endforeach
                            @if (count($chunk) === 1)
                                <td style="width: 49%; border: none;"></td>
                            @endif
                        </tr>
                    @endforeach
                </table>
            @endif

            @php
                $conclusionesRaw = $informe->conclusiones ?? '';
                $conclusionesParsed = null;
                if (is_string($conclusionesRaw) && $conclusionesRaw !== '') {
                    $decoded = json_decode($conclusionesRaw, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $conclusionesParsed = $decoded;
                    }
                } elseif (is_array($conclusionesRaw)) {
                    $conclusionesParsed = $conclusionesRaw;
                }
            @endphp

            @if (is_array($conclusionesParsed) && !empty(trim((string) ($conclusionesParsed['voladores'] ?? ''))))
                <div class="section-bar" style="background-color:#043b74;">5.2 CONCLUSIONES Y RECOMENDACIONES -
                    VOLADORES</div>
                <div
                    style="padding:12px;border:1px solid #cfe6ff;background:#f5fbff;border-radius:6px;font-size:11px;text-align:justify;margin-bottom:14px;">
                    {!! nl2br(e($conclusionesParsed['voladores'])) !!}
                </div>
                @php $volAnexo = $conclusionesParsed['voladores_anexo'] ?? false; @endphp
                @if (!empty($volAnexo))
                    <div class="section-bar" style="background-color:#0a4a78;">ANEXO - INFORME VOLADORES</div>

                    {{-- Tabla comparativa mensual por trampa (si existe) --}}
                    @if (isset($extraData['comparativa_mensual_trampas']) && is_array($extraData['comparativa_mensual_trampas']))
                        @php $comp = $extraData['comparativa_mensual_trampas']; @endphp
                        <div style="margin:12px 0; text-align:left;">
                            <div style="font-weight:bold;margin-bottom:6px;">1. Gráfica de tendencias por trampa de luz</div>
                            <table style="width:80%; margin: 0 auto 10px auto;">
                                <thead>
                                    <tr style="background-color:#0b4980;color:#fff;">
                                        <th>DISPOSITIVO</th>
                                        <th style="text-align:center;">{{ $comp['month_prev'] ?? 'Mes A' }}</th>
                                        <th style="text-align:center;">{{ $comp['month_curr'] ?? 'Mes B' }}</th>
                                        <th style="text-align:center;">DIFERENCIA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach(($comp['rows'] ?? []) as $r)
                                        <tr>
                                            <td style="padding:6px;border:1px solid #ddd;">{{ $r['codigo'] }}</td>
                                            <td style="padding:6px;border:1px solid #ddd;text-align:center;">{{ $r['prev'] }}</td>
                                            <td style="padding:6px;border:1px solid #ddd;text-align:center;">{{ $r['curr'] }}</td>
                                            <td style="padding:6px;border:1px solid #ddd;text-align:center;color:{{ $r['diff']>=0? '#e60000' : '#009933' }};">{{ ($r['diff']>=0? '+':'') . $r['diff'] }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif

                    {{-- Gráficos del anexo: consolidado por trampa (uno por dispositivo) --}}
                    @if (isset($extraData['charts_voladores_por_trampa']) && is_array($extraData['charts_voladores_por_trampa']))
                        <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 10px; margin-bottom: 8px;">2. CONSOLIDADO DE CAPTURA POR TRAMPA DE LUZ (POR MES)</div>
                        @foreach($extraData['charts_voladores_por_trampa'] as $c)
                            <div style="text-align:center;margin-bottom:18px;page-break-inside:avoid;">
                                <div style="font-size:10px;color:#555;margin-bottom:6px;">{{ $c['codigo'] }} - {{ $c['ubicacion'] }}</div>
                                <img src="{{ $c['chart'] }}" style="width:85%;max-width:900px;border:1px solid #e6eefc;padding:6px;background:#fff;" />
                            </div>
                        @endforeach
                    @else
                        <div style="padding:8px;color:#666;font-size:10px;">No hay datos para generar gráficos por trampa.</div>
                    @endif

                    {{-- RESULTADOS escritos por el usuario --}}
                    @if (!empty(trim((string) ($conclusionesParsed['voladores_resultados'] ?? ''))))
                        <div style="font-weight:bold;margin-top:10px;margin-bottom:6px;">RESULTADOS:</div>
                        <div style="padding:12px;border:1px solid #cfe6ff;background:#f5fbff;border-radius:6px;font-size:11px;text-align:justify;margin-bottom:14px;">
                            {!! nl2br(e($conclusionesParsed['voladores_resultados'])) !!}
                        </div>
                    @endif
                @endif
            @endif
        @endif

        {{-- 3. ANÁLISIS DE TENDENCIA (SOLO ROEDORES) --}}
        @if (strpos(strtoupper($tipo), 'ROEDORES') !== false)
            <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 10px;">3.
                ANÁLISIS DE TENDENCIA DE ACTIVIDAD DE ROEDORES</div>

            @if (isset($extraData['dispositivos_cebo']) && count($extraData['dispositivos_cebo']) > 0 && $estilo === 'detallado')
                <div
                    style="font-weight: bold; font-size: 9px; color: #003366; text-align: center; margin-bottom: 5px;">
                    3.1. CAJAS CEBADERAS (CEBO TÓXICO)</div>
                <table style="width: 75%; margin: 0 auto 10px auto;">
                    <thead>
                        <tr style="background-color: #1a3352; color: white;">
                            <th>N°</th>
                            <th>CÓDIGO</th>
                            <th>UBICACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($extraData['dispositivos_cebo'] as $idx => $it)
                            <tr>
                                <td class="text-center">{{ $idx + 1 }}</td>
                                <td class="text-center">{{ $it['codigo'] }}</td>
                                <td>{{ $it['ubicacion'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @if (isset($extraData['dispositivos_tubo_cebadero']) && count($extraData['dispositivos_tubo_cebadero']) > 0 && $estilo === 'detallado')
                <div
                    style="font-weight: bold; font-size: 9px; color: #003366; text-align: center; margin-top: 15px; margin-bottom: 5px;">
                    3.2. TUBOS CEBADEROS (CEBO TÓXICO)</div>
                <table style="width: 75%; margin: 0 auto 10px auto;">
                    <thead>
                        <tr style="background-color: #1a3352; color: white;">
                            <th>N°</th>
                            <th>CÓDIGO</th>
                            <th>UBICACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($extraData['dispositivos_tubo_cebadero'] as $idx => $it)
                            <tr>
                                <td class="text-center">{{ $idx + 1 }}</td>
                                <td class="text-center">{{ $it['codigo'] }}</td>
                                <td>{{ $it['ubicacion'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @if (isset($extraData['dispositivos_lamina']) && count($extraData['dispositivos_lamina']) > 0 && $estilo === 'detallado')
                <div
                    style="font-weight: bold; font-size: 9px; color: #003366; text-align: center; margin-top: 15px; margin-bottom: 5px;">
                    3.3. LÁMINAS PEGANTES (CONTROL FÍSICO)</div>
                <table style="width: 75%; margin: 0 auto 15px auto;">
                    <thead>
                        <tr style="background-color: #1a3352; color: white;">
                            <th>N°</th>
                            <th>CÓDIGO</th>
                            <th>UBICACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($extraData['dispositivos_lamina'] as $idx => $it)
                            <tr>
                                <td class="text-center">{{ $idx + 1 }}</td>
                                <td class="text-center">{{ $it['codigo'] }}</td>
                                <td>{{ $it['ubicacion'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @if (isset($extraData['chart_url_roedores']) && $estilo !== 'basico')
                <div style="text-align: center; margin-bottom: 15px;"><img
                        src="{{ $extraData['chart_url_roedores'] }}" style="width: 70%;"></div>
            @endif
            @if (isset($extraData['chart_url_anual']) && $estilo !== 'basico')
                <div style="text-align: center; margin-bottom: 15px;"><img src="{{ $extraData['chart_url_anual'] }}"
                        style="width: 70%;"></div>
            @endif
            @if (isset($extraData['chart_url_indice']) && $estilo !== 'basico')
                <div style="text-align: center; margin-bottom: 10px;"><img src="{{ $extraData['chart_url_indice'] }}"
                        style="width: 70%;"></div>
                <table style="width: 60%; margin: 0 auto 20px auto; font-size: 8px;">
                    <tr style="background-color: #00234a; color: white;">
                        <th colspan="3">LEYENDA DE UMBRAL (CEBOS)</th>
                    </tr>
                    <tr>
                        <td>0%</td>
                        <td style="background-color: #28a745; width: 20px;"></td>
                        <td>CONFORME</td>
                    </tr>
                    <tr>
                        <td>> 0% - 5%</td>
                        <td style="background-color: #ffc107;"></td>
                        <td>PRECAUCIÓN</td>
                    </tr>
                    <tr>
                        <td>> 5%</td>
                        <td style="background-color: #dc3545;"></td>
                        <td>ALARMANTE</td>
                    </tr>
                </table>
            @endif

            @if (isset($extraData['dispositivos_jaula']) && count($extraData['dispositivos_jaula']) > 0 && $estilo === 'detallado')
                <div
                    style="font-weight: bold; font-size: 9px; color: #003366; text-align: center; margin-top: 15px; margin-bottom: 5px;">
                    3.4. JAULAS DE CAPTURA</div>
                <table style="width: 75%; margin: 0 auto 10px auto;">
                    <thead>
                        <tr style="background-color: #1a3352; color: white;">
                            <th>N°</th>
                            <th>CÓDIGO</th>
                            <th>UBICACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($extraData['dispositivos_jaula'] as $idx => $it)
                            <tr>
                                <td class="text-center">{{ $idx + 1 }}</td>
                                <td class="text-center">{{ $it['codigo'] }}</td>
                                <td>{{ $it['ubicacion'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
                @if (isset($extraData['chart_url_jaulas']) && $estilo !== 'basico')
                    <div style="text-align: center; margin-bottom: 15px;"><img
                            src="{{ $extraData['chart_url_jaulas'] }}" style="width: 70%;"></div>
                @endif
                @if (isset($extraData['chart_url_anual_jaulas']) && $estilo !== 'basico')
                    <div style="text-align: center; margin-bottom: 15px;"><img
                            src="{{ $extraData['chart_url_anual_jaulas'] }}" style="width: 70%;"></div>
                @endif
                @if (isset($extraData['chart_url_indice_jaulas']) && $estilo !== 'basico')
                    <div style="text-align: center; margin-bottom: 10px;"><img
                            src="{{ $extraData['chart_url_indice_jaulas'] }}" style="width: 70%;"></div>
                    <table style="width: 60%; margin: 0 auto 20px auto; font-size: 8px;">
                        <tr style="background-color: #00234a; color: white;">
                            <th colspan="3">LEYENDA DE UMBRAL (JAULAS)</th>
                        </tr>
                        <tr>
                            <td>0%</td>
                            <td style="background-color: #28a745; width: 20px;"></td>
                            <td>CONFORME</td>
                        </tr>
                        <tr>
                            <td>> 0% - 5%</td>
                            <td style="background-color: #ffc107;"></td>
                            <td>PRECAUCIÓN</td>
                        </tr>
                        <tr>
                            <td>> 5%</td>
                            <td style="background-color: #dc3545;"></td>
                            <td>ALARMANTE</td>
                        </tr>
                    </table>
                @endif
            @endif

            @php
                $hallazgosRoedores = [];
                $evidenciasInforme = is_array($informe->evidencias) ? $informe->evidencias : [];

                foreach ($evidenciasInforme as $evidencia) {
                    if (is_string($evidencia)) {
                        $url = trim($evidencia);
                        if ($url !== '') {
                            $base64 = $resolverHallazgoBase64($url);

                            $hallazgosRoedores[] = [
                                'url' => $url,
                                'image_base64' => $base64,
                                'descripcion' => 'Sin descripción',
                                'fecha' => '',
                            ];
                        }
                        continue;
                    }

                    if (!is_array($evidencia)) {
                        continue;
                    }

                    $tipoEvidencia = strtoupper(trim((string) ($evidencia['tipo_servicio'] ?? '')));
                    if ($tipoEvidencia !== '' && strpos($tipoEvidencia, 'ROEDORES') === false) {
                        continue;
                    }

                    $url = trim((string) ($evidencia['url'] ?? ($evidencia['path'] ?? '')));
                    if ($url === '') {
                        continue;
                    }

                    $base64 = $resolverHallazgoBase64($url);

                    $hallazgosRoedores[] = [
                        'url' => $url,
                        'image_base64' => $base64,
                        'descripcion' => trim((string) ($evidencia['descripcion'] ?? 'Sin descripción')),
                        'fecha' => trim((string) ($evidencia['fecha'] ?? '')),
                    ];
                }

                $hallazgosChunks = array_chunk($hallazgosRoedores, 2);
            @endphp

            @if (count($hallazgosRoedores) > 0)
                <div
                    style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 16px; margin-bottom: 10px;">
                    4. HALLAZGOS EN DISPOSITIVOS DE CONTROL</div>
                <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 20px;">
                    @foreach ($hallazgosChunks as $chunk)
                        <tr>
                            @foreach ($chunk as $hallazgo)
                                <td style="width: 49%; border: 1px solid #333; vertical-align: top; padding: 0;">
                                    @if (!empty($hallazgo['image_base64']))
                                        <img src="{{ $hallazgo['image_base64'] }}" alt="Hallazgo"
                                            style="width: 100%; height: 220px; object-fit: cover; display: block;">
                                    @else
                                        <div
                                            style="height: 220px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #ccc; font-size: 10px; color: #666;">
                                            Imagen no disponible
                                        </div>
                                    @endif
                                    <div style="padding: 8px; font-size: 9px; line-height: 1.35;">
                                        <div><strong>Descripción:</strong>
                                            {{ $hallazgo['descripcion'] !== '' ? $hallazgo['descripcion'] : 'Sin descripción' }}
                                        </div>
                                        @if ($hallazgo['fecha'] !== '')
                                            <div style="margin-top: 4px;"><strong>Fecha:</strong>
                                                {{ $hallazgo['fecha'] }}</div>
                                        @endif
                                    </div>
                                </td>
                            @endforeach
                            @if (count($chunk) === 1)
                                <td style="width: 49%; border: none;"></td>
                            @endif
                        </tr>
                    @endforeach
                </table>
            @endif

            @php
                $conclusionesRaw = $informe->conclusiones ?? '';
                $conclusionesParsed = null;
                if (is_string($conclusionesRaw) && $conclusionesRaw !== '') {
                    $decoded = json_decode($conclusionesRaw, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $conclusionesParsed = $decoded;
                    } else {
                        $conclusionesParsed = ['roedores' => $conclusionesRaw];
                    }
                } elseif (is_array($conclusionesRaw)) {
                    $conclusionesParsed = $conclusionesRaw;
                }
            @endphp

            @if (is_array($conclusionesParsed) && !empty(trim((string) ($conclusionesParsed['roedores'] ?? ''))))
                <div class="section-bar" style="background-color:#043b74;">5.1 CONCLUSIONES Y RECOMENDACIONES -
                    ROEDORES</div>
                <div
                    style="padding:12px;border:1px solid #cfe6ff;background:#f5fbff;border-radius:6px;font-size:11px;text-align:justify;margin-bottom:14px;">
                    {!! nl2br(e($conclusionesParsed['roedores'])) !!}
                </div>
            @elseif(!empty(trim((string) ($conclusionesRaw ?? ''))))
                <div class="section-bar" style="background-color:#043b74;">5. CONCLUSIONES Y RECOMENDACIONES</div>
                <div
                    style="padding:12px;border:1px solid #cfe6ff;background:#f5fbff;border-radius:6px;font-size:11px;text-align:justify;margin-bottom:14px;">
                    {!! nl2br(e($conclusionesRaw)) !!}
                </div>
            @endif
        @endif

        {{-- 3. ANÁLISIS DE TENDENCIA (SOLO RASTREROS) --}}
        @if (strpos(strtoupper($tipo), 'RASTREROS') !== false)
            @if (isset($extraData['dispositivos_rastreros']) && count($extraData['dispositivos_rastreros']) > 0 && $estilo === 'detallado')
                <div style="font-weight: bold; font-size: 9px; color: #003366; text-align: center; margin-top: 15px; margin-bottom: 5px;">
                    1.2. MONITOREO DE INSECTOS RASTREROS (LÁMINAS)</div>
                <table style="width: 75%; margin: 0 auto 15px auto;">
                    <thead>
                        <tr style="background-color: #1a3352; color: white;">
                            <th>N°</th>
                            <th>UBICACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($extraData['dispositivos_rastreros'] as $disp)
                            <tr>
                                <td class="text-center font-bold">{{ $disp['codigo'] }}</td>
                                <td>{{ strtoupper($disp['ubicacion']) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif

            @php
                $hallazgosRastreros = [];
                $evidenciasInforme = is_array($informe->evidencias) ? $informe->evidencias : [];

                foreach ($evidenciasInforme as $evidencia) {
                    if (is_string($evidencia) || !is_array($evidencia)) {
                        continue;
                    }

                    $tipoEvidencia = strtoupper(trim((string) ($evidencia['tipo_servicio'] ?? '')));
                    if ($tipoEvidencia !== '' && strpos($tipoEvidencia, 'RASTREROS') === false) {
                        continue;
                    }

                    $url = trim((string) ($evidencia['url'] ?? ($evidencia['path'] ?? '')));
                    if ($url === '') {
                        continue;
                    }

                    $base64 = $resolverHallazgoBase64($url);

                    $hallazgosRastreros[] = [
                        'url' => $url,
                        'image_base64' => $base64,
                        'descripcion' => trim((string) ($evidencia['descripcion'] ?? 'Sin descripción')),
                        'fecha' => trim((string) ($evidencia['fecha'] ?? '')),
                    ];
                }
                $hallazgosChunks = array_chunk($hallazgosRastreros, 2);
            @endphp

            @if (count($hallazgosRastreros) > 0)
                <div style="font-weight: bold; font-size: 11px; color: #003366; margin-top: 16px; margin-bottom: 10px;">
                    1.3. REGISTRO FOTOGRÁFICO DESINSECTACIÓN QUÍMICA</div>
                <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 20px;">
                    @foreach ($hallazgosChunks as $chunk)
                        <tr>
                            @foreach ($chunk as $hallazgo)
                                <td style="width: 49%; border: 1px solid #333; vertical-align: top; padding: 0;">
                                    @if (!empty($hallazgo['image_base64']))
                                        <img src="{{ $hallazgo['image_base64'] }}" alt="Hallazgo"
                                            style="width: 100%; height: 220px; object-fit: cover; display: block;">
                                    @else
                                        <div style="height: 220px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #ccc; font-size: 10px; color: #666;">
                                            Imagen no disponible
                                        </div>
                                    @endif
                                    <div style="padding: 8px; font-size: 9px; line-height: 1.35;">
                                        <div>{{ $hallazgo['descripcion'] !== '' ? $hallazgo['descripcion'] : 'Sin descripción' }}</div>
                                        @if ($hallazgo['fecha'] !== '')
                                            <div style="margin-top: 4px;"><strong>FECHA:</strong> {{ $hallazgo['fecha'] }}</div>
                                        @endif
                                    </div>
                                </td>
                            @endforeach
                            @if (count($chunk) === 1)
                                <td style="width: 49%; border: none;"></td>
                            @endif
                        </tr>
                    @endforeach
                </table>
            @endif

            @php
                $conclusionesRaw = $informe->conclusiones ?? '';
                $conclusionesParsed = null;
                if (is_string($conclusionesRaw) && $conclusionesRaw !== '') {
                    $decoded = json_decode($conclusionesRaw, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $conclusionesParsed = $decoded;
                    }
                } elseif (is_array($conclusionesRaw)) {
                    $conclusionesParsed = $conclusionesRaw;
                }
            @endphp

            @if (is_array($conclusionesParsed) && !empty(trim((string) ($conclusionesParsed['rastreros'] ?? ''))))
                <div class="section-bar" style="background-color:#043b74;">1.4. OBSERVACIONES E INDICACIONES</div>
                <div style="padding:12px;border:1px solid #cfe6ff;background:#f5fbff;border-radius:6px;font-size:11px;text-align:justify;margin-bottom:14px;">
                    {!! nl2br(e($conclusionesParsed['rastreros'])) !!}
                </div>
            @endif
        @endif

    @endforeach

    <div class="footer">
        Multitasking Servicios Generales S.A.C &nbsp; RUC: 20607499234 &nbsp; Av. 13 de enero MZ. H-IV LT.02 APV Inca
        Manco Cápac - SJL
    </div>

</body>

</html>
