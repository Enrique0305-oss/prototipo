<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Servicio {{ $orden->numero_orden }}</title>
    <style>
        @page { margin: 1.2cm; }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            color: #000;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: -1px; }
        th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: middle; }
        
        .label { font-weight: bold; text-transform: uppercase; background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bg-blue { background-color: #d9e2f3; text-transform: uppercase; font-weight: bold; }
        
        .location-title {
            text-align: center;
            font-weight: bold;
            font-size: 11px;
            padding: 6px;
            text-transform: uppercase;
            border: 1px solid #000;
            border-top: none;
            background-color: #f9f9f9;
        }

        .observation { background-color: #fde9d9; padding: 5px; border: 1px solid #000; margin-top: 10px; font-size: 9px; }
        .no-border { border: none !important; }

        .nota-informativa {
            background-color: #ffff00; /* Amarillo brillante */
            border: 1px solid #000;
            padding: 8px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 9px;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    {{-- ── ENCABEZADO ── --}}
    <table>
        <tr>
            <td style="width: 20%; text-align: center; padding: 8px;">
                @if(file_exists(public_path('images/logo-orden.png')))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="120">
                @else
                    <strong>QSCI</strong>
                @endif
            </td>
            <td style="width: 55%; text-align: center; font-size: 13px; font-weight: bold; padding: 8px;">
                ORDEN DE SERVICIO N&deg; {{ $orden->numero_orden }}
            </td>
            <td style="width: 25%; padding: 0;">
                <table style="margin: 0;">
                    <tr><td class="label" style="width: 45%;">C&oacute;digo</td><td class="text-center">{{ $orden->codigo_doc ?: 'OS-AC-001' }}</td></tr>
                    <tr><td class="label">Fecha</td><td class="text-center">{{ date('d/m/Y') }}</td></tr>
                    <tr><td class="label">Versi&oacute;n</td><td class="text-center">{{ $orden->version ?? '01' }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ── DATOS DEL CLIENTE ── --}}
    <table>
        <tr><td class="label" style="width: 25%;">CLIENTE</td><td style="width: 75%; font-weight: bold;">{{ mb_strtoupper($orden->cliente->nombre_empresa ?? '---') }}</td></tr>
        <tr><td class="label">RUC</td><td>{{ $orden->cliente->ruc ?? '---' }}</td></tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">N&deg; DE COTIZACI&Oacute;N</td>
            <td style="width: 25%;" class="text-center">{{ $orden->cotizacion->numero_cotizacion ?? '---' }}</td>
            <td class="label" style="width: 20%;">COSTO TOTAL:</td>
            <td style="width: 30%; font-weight: bold;" class="text-right">S/. {{ number_format($orden->total_costo ?? 0, 2) }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">FECHA DE ACEPTACI&Oacute;N</td>
            <td style="width: 25%;" class="text-center">{{ $orden->fecha_aceptacion ? \Carbon\Carbon::parse($orden->fecha_aceptacion)->format('d/m/Y') : '---' }}</td>
            <td class="label" style="width: 25%;">FECHA TENTATIVA</td>
            <td style="width: 25%;" class="text-center">{{ $orden->fecha_tentativa ? \Carbon\Carbon::parse($orden->fecha_tentativa)->format('d/m/Y') : '---' }}</td>
        </tr>
    </table>

    {{-- ── DATOS AGRUPADOS POR PLANTA ── --}}
    @php
        // Agrupar detalles (servicios) por id_cliente_planta
        $detallesPorPlanta = $orden->detalles->groupBy(function($d) {
            return $d->id_cliente_planta ?? 0;
        });

        // Agrupar productos por id_cliente_planta
        $productosPorPlanta = $orden->productos->groupBy(function($p) {
            return $p->id_cliente_planta ?? 0;
        });

        // Agrupar equipos por id_cliente_planta
        $equiposPorPlanta = $orden->equipos->groupBy(function($e) {
            return $e->id_cliente_planta ?? 0;
        });

        // Obtener todas las plantas únicas (de detalles, productos y equipos)
        $todasPlantaIds = collect()
            ->merge($detallesPorPlanta->keys())
            ->merge($productosPorPlanta->keys())
            ->merge($equiposPorPlanta->keys())
            ->unique()
            ->filter(fn($id) => $id > 0)
            ->values();

        // Equipos generales (sin planta asignada)
        $equiposGenerales = $equiposPorPlanta->get(0, collect());
        $productosGenerales = $productosPorPlanta->get(0, collect());
    @endphp

    @foreach($todasPlantaIds as $plantaId)
        @php
            $detallesPlanta = $detallesPorPlanta->get($plantaId, collect());
            $productosPlanta = $productosPorPlanta->get($plantaId, collect());
            $equiposPlanta = $equiposPorPlanta->get($plantaId, collect());

            // Obtener info de planta desde cualquier registro que la tenga
            $plantaObj = $detallesPlanta->first()?->planta 
                ?? $productosPlanta->first()?->planta 
                ?? $equiposPlanta->first()?->planta;
            $plantaNombre = $plantaObj->nombre ?? "Planta #$plantaId";
            $direccionPlanta = $plantaObj 
                ? implode(', ', array_filter([$plantaObj->direccion, $plantaObj->distrito, $plantaObj->provincia, $plantaObj->departamento])) 
                : '';
        @endphp

        {{-- Header de Planta --}}
        <div class="location-title" style="margin-top: 10px;">
            {{ $plantaNombre }}
            @if($direccionPlanta)
                <br><span style="font-size: 9px; font-weight: normal;">{{ $direccionPlanta }}</span>
            @endif
        </div>

        {{-- Tabla 1: Servicios de esta planta --}}
        @if($detallesPlanta->count() > 0)
        <table>
            <thead>
                <tr class="bg-blue">
                    <th style="width: 8%;">N&ordm;</th>
                    <th style="width: 52%;">SERVICIO</th>
                    <th style="width: 20%;">FRECUENCIA</th>
                    <th style="width: 20%;">PRECIO</th>
                </tr>
            </thead>
            <tbody>
                @foreach($detallesPlanta->values() as $index => $detalle)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ mb_strtoupper($detalle->servicio->nombre ?? 'SERVICIO') }}</td>
                    <td class="text-center">{{ mb_strtoupper($detalle->frecuencia ?? 'A SOLICITUD') }}</td>
                    <td class="text-right">S/. {{ number_format($detalle->precio ?? 0, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        {{-- Tabla 2: Materiales agrupados por Área y Equipo --}}
        @php
            // Agrupar productos de esta planta por área
            $prodsPorArea = $productosPlanta->groupBy(function($p) {
                return $p->id_cliente_planta_area ?? 0;
            });
            // Agrupar equipos de esta planta por área
            $eqsPorArea = $equiposPlanta->groupBy(function($e) {
                return $e->id_cliente_planta_area ?? 0;
            });
            // Todas las áreas de esta planta
            $areaIds = collect()
                ->merge($prodsPorArea->keys())
                ->merge($eqsPorArea->keys())
                ->unique()
                ->values();

            $hayCombinados = $productosPlanta->count() > 0 || $equiposPlanta->count() > 0;
        @endphp

        @if($hayCombinados)
        <table style="margin-top: 8px;">
            <thead>
                <tr class="bg-blue">
                    <th style="width: 8%;">N&ordm;</th>
                    <th style="width: 17%;">&Aacute;REA</th>
                    <th style="width: 25%;">EQUIPO</th>
                    <th style="width: 35%;">PRODUCTOS / MATERIALES</th>
                    <th style="width: 15%;">CANTIDAD</th>
                </tr>
            </thead>
            <tbody>
                @php $numArea = 0; @endphp
                @foreach($areaIds as $areaId)
                    @php
                        $numArea++;
                        $prodsArea = $prodsPorArea->get($areaId, collect())->values();
                        $eqsArea = $eqsPorArea->get($areaId, collect())->values();
                        $equipoIds = collect()
                            ->merge($prodsArea->pluck('id_equipo')->map(fn($id) => $id ?? 0))
                            ->merge($eqsArea->pluck('id_equipo')->map(fn($id) => $id ?? 0))
                            ->unique()
                            ->values();
                        if ($equipoIds->count() === 0) {
                            $equipoIds = collect([0]);
                        }

                        // Obtener nombre del área
                        $areaObj = $prodsArea->first()?->area ?? $eqsArea->first()?->area;
                        $areaNombre = $areaObj->nombre ?? ($areaId > 0 ? "Área #$areaId" : 'GENERAL');

                        $filasPorEquipo = $equipoIds->map(function($equipoId) use ($prodsArea) {
                            $cantidad = $prodsArea->filter(fn($p) => (($p->id_equipo ?? 0) == $equipoId))->count();
                            return max($cantidad, 1);
                        });
                        $totalFilasArea = max($filasPorEquipo->sum(), 1);
                        $renderizoCabeceraArea = false;
                    @endphp
                    @foreach($equipoIds as $equipoId)
                        @php
                            $prodsEquipo = $prodsArea->filter(fn($p) => (($p->id_equipo ?? 0) == $equipoId))->values();
                            $filasEquipo = max($prodsEquipo->count(), 1);
                            $eqObj = $eqsArea->first(fn($e) => (($e->id_equipo ?? 0) == $equipoId));
                            $equipoNombre = $eqObj?->equipo?->descripcion
                                ?? $prodsEquipo->first()?->equipo?->descripcion
                                ?? ($equipoId > 0 ? "Equipo #$equipoId" : 'SIN EQUIPO');
                        @endphp
                        @for($i = 0; $i < $filasEquipo; $i++)
                            @php $prod = $prodsEquipo[$i] ?? null; @endphp
                            <tr>
                                @if(!$renderizoCabeceraArea)
                                    <td class="text-center" style="vertical-align: middle;" @if($totalFilasArea > 1) rowspan="{{ $totalFilasArea }}" @endif>{{ $numArea }}</td>
                                    <td style="vertical-align: middle; font-weight: 600;" @if($totalFilasArea > 1) rowspan="{{ $totalFilasArea }}" @endif>{{ mb_strtoupper($areaNombre) }}</td>
                                    @php $renderizoCabeceraArea = true; @endphp
                                @endif

                                @if($i === 0)
                                    <td style="vertical-align: middle;" @if($filasEquipo > 1) rowspan="{{ $filasEquipo }}" @endif>{{ mb_strtoupper($equipoNombre) }}</td>
                                @endif

                                <td>{{ $prod ? mb_strtoupper($prod->producto->descripcion ?? '') : '' }}</td>
                                <td class="text-center">
                                    @if($prod)
                                        {{ number_format((float) $prod->cantidad, 2) }}{{ !empty($prod->producto->unidad) ? ' ' . mb_strtoupper($prod->producto->unidad) : '' }}
                                    @endif
                                </td>
                            </tr>
                        @endfor
                    @endforeach
                @endforeach
            </tbody>
        </table>
        @endif

    @endforeach

    {{-- ── EQUIPOS GENERALES (sin planta/área - agregados manualmente) ── --}}
    @if($equiposGenerales->count() > 0 || $productosGenerales->count() > 0)
        @php
            // Si hay detalles sin planta, mostrar servicios generales
            $detallesGenerales = $detallesPorPlanta->get(0, collect());
        @endphp

        @if($todasPlantaIds->count() > 0)
        <div class="location-title" style="margin-top: 10px;">
            GENERAL
        </div>
        @endif

        @if($detallesGenerales->count() > 0)
        <table>
            <thead>
                <tr class="bg-blue">
                    <th style="width: 8%;">N&ordm;</th>
                    <th style="width: 52%;">SERVICIO</th>
                    <th style="width: 20%;">FRECUENCIA</th>
                    <th style="width: 20%;">PRECIO</th>
                </tr>
            </thead>
            <tbody>
                @foreach($detallesGenerales->values() as $index => $detalle)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ mb_strtoupper($detalle->servicio->nombre ?? 'SERVICIO') }}</td>
                    <td class="text-center">{{ mb_strtoupper($detalle->frecuencia ?? 'A SOLICITUD') }}</td>
                    <td class="text-right">S/. {{ number_format($detalle->precio ?? 0, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @php
            $prodsGen = $productosGenerales->values();
            $eqsGen = $equiposGenerales->values();
            $equipoIdsGen = collect()
                ->merge($prodsGen->pluck('id_equipo')->map(fn($id) => $id ?? 0))
                ->merge($eqsGen->pluck('id_equipo')->map(fn($id) => $id ?? 0))
                ->unique()
                ->values();
            if ($equipoIdsGen->count() === 0) {
                $equipoIdsGen = collect([0]);
            }
            $filasTotalGen = $equipoIdsGen->map(function($equipoId) use ($prodsGen) {
                $cantidad = $prodsGen->filter(fn($p) => (($p->id_equipo ?? 0) == $equipoId))->count();
                return max($cantidad, 1);
            })->sum();
            $renderizoCabeceraGeneral = false;
        @endphp
        <table style="margin-top: 8px;">
            <thead>
                <tr class="bg-blue">
                    <th style="width: 8%;">N&ordm;</th>
                    <th style="width: 17%;">&Aacute;REA</th>
                    <th style="width: 35%;">EQUIPO</th>
                    <th style="width: 25%;">PRODUCTOS / MATERIALES</th>
                    <th style="width: 15%;">CANTIDAD</th>
                </tr>
            </thead>
            <tbody>
                @foreach($equipoIdsGen as $equipoId)
                    @php
                        $prodsEquipoGen = $prodsGen->filter(fn($p) => (($p->id_equipo ?? 0) == $equipoId))->values();
                        $filasEquipoGen = max($prodsEquipoGen->count(), 1);
                        $eqObjGen = $eqsGen->first(fn($e) => (($e->id_equipo ?? 0) == $equipoId));
                        $equipoNombreGen = $eqObjGen?->equipo?->descripcion
                            ?? $prodsEquipoGen->first()?->equipo?->descripcion
                            ?? ($equipoId > 0 ? "Equipo #$equipoId" : 'SIN EQUIPO');
                    @endphp
                    @for($i = 0; $i < $filasEquipoGen; $i++)
                        @php $prod = $prodsEquipoGen[$i] ?? null; @endphp
                        <tr>
                            @if(!$renderizoCabeceraGeneral)
                                <td class="text-center" style="vertical-align: middle;" @if($filasTotalGen > 1) rowspan="{{ $filasTotalGen }}" @endif>1</td>
                                <td style="vertical-align: middle; font-weight: 600;" @if($filasTotalGen > 1) rowspan="{{ $filasTotalGen }}" @endif>GENERAL</td>
                                @php $renderizoCabeceraGeneral = true; @endphp
                            @endif

                            @if($i === 0)
                                <td style="vertical-align: middle;" @if($filasEquipoGen > 1) rowspan="{{ $filasEquipoGen }}" @endif>{{ mb_strtoupper($equipoNombreGen) }}</td>
                            @endif

                            <td>{{ $prod ? mb_strtoupper($prod->producto->descripcion ?? '') : '' }}</td>
                            <td class="text-center">
                                @if($prod)
                                    {{ number_format((float) $prod->cantidad, 2) }}{{ !empty($prod->producto->unidad) ? ' ' . mb_strtoupper($prod->producto->unidad) : '' }}
                                @endif
                            </td>
                        </tr>
                    @endfor
                @endforeach
            </tbody>
        </table>
    @endif

    {{-- ── TOTALES ── --}}
    <table style="margin-top: 8px;">
        <tr>
            <td class="no-border" style="width: 60%;"></td>
            <td class="label text-right" style="width: 20%;">SUBTOTAL</td>
            <td class="text-right" style="width: 20%;">S/. {{ number_format($orden->subtotal ?? 0, 2) }}</td>
        </tr>
        @if($orden->incluye_igv)
        <tr>
            <td class="no-border"></td>
            <td class="label text-right">IGV (18%)</td>
            <td class="text-right">S/. {{ number_format($orden->igv ?? 0, 2) }}</td>
        </tr>
        @endif
        <tr>
            <td class="no-border"></td>
            <td class="label text-right" style="font-size: 11px;">TOTAL</td>
            <td class="text-right" style="font-size: 11px; font-weight: bold;">S/. {{ number_format($orden->total_costo ?? 0, 2) }}</td>
        </tr>
    </table>

    {{-- ── OBSERVACIÓN ── --}}
    <div class="observation">
        <strong>Observaci&oacute;n:</strong> El precio {{ $orden->incluye_igv ? 'SI' : 'NO' }} incluye IGV
    </div>

    {{-- ── EMITIDO POR ── --}}
    <div style="margin-top: 15px;">
        <strong>Emitido por:</strong> 
        {{ mb_strtoupper($orden->emisor->nombre ?? 'USUARIO NO ENCONTRADO') }} 
        {{ mb_strtoupper($orden->emisor->apellidos ?? '') }}
    </div>

    {{-- ── NOTA AMARILLA FIJA ── --}}
    <div class="nota-informativa">
        Esta orden de servicio se basa en la cotización que aceptó el cliente, si hay alguna modificación sobre esta orden de servicio por parte del área de operaciones se tiene que avisar al área comercial por un documento.
    </div>
</body>
</html>