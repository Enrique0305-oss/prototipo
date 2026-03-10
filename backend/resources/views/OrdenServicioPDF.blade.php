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

    {{-- ── UBICACIÓN (Planta / Área) ── --}}
    @php
        $primerDetalle = $orden->detalles->first();
        // Corregido: Variable completa y uso de operador nullsafe
        $planta = $primerDetalle?->planta;
        $area = $primerDetalle?->area;
        
        $ubicacionTexto = '';
        if ($planta) {
            $ubicacionTexto = $planta->nombre;
            if ($area) $ubicacionTexto .= ' — ' . $area->nombre;
            $direccionPlanta = implode(', ', array_filter([$planta->direccion, $planta->distrito, $planta->provincia, $planta->departamento]));
        } else {
            // Si no hay planta, usamos el campo local o un texto genérico
            $ubicacionTexto = $primerDetalle->local ?? 'UBICACIÓN GENERAL';
            $direccionPlanta = '';
        }
    @endphp
    <div class="location-title">
        {{ $ubicacionTexto }}
        @if($direccionPlanta)
            <br><span style="font-size: 9px; font-weight: normal;">{{ $direccionPlanta }}</span>
        @endif
    </div>

    {{-- ── TABLA DE SERVICIOS ── --}}
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
            @foreach($orden->detalles as $index => $detalle)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ mb_strtoupper($detalle->servicio->nombre ?? 'SERVICIO') }}</td>
                <td class="text-center">{{ mb_strtoupper($detalle->frecuencia ?? 'A SOLICITUD') }}</td>
                <td class="text-right">S/. {{ number_format($detalle->precio ?? 0, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- ── TABLA DE PRODUCTOS / MATERIALES ── --}}
    @if($orden->productos->count() > 0)
    <table style="margin-top: 8px;">
        <thead>
            <tr class="bg-blue">
                <th style="width: 8%;">N&ordm;</th>
                <th style="width: 62%;">PRODUCTOS / MATERIALES</th>
                <th style="width: 30%;">CANTIDAD</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orden->productos as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ mb_strtoupper($item->producto->descripcion ?? 'PRODUCTO NO DEFINIDO') }}</td>
                <td class="text-center">{{ $item->cantidad }} <small>{{ $item->producto->unidad ?? '' }}</small></td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    {{-- ── EQUIPOS ── --}}
    @if($orden->equipos->count() > 0)
    <table style="margin-top: 8px;">
        <thead>
            <tr class="bg-blue">
                <th style="width: 8%;">N&ordm;</th>
                <th style="width: 62%;">EQUIPOS</th>
                <th style="width: 30%;">OBSERVACI&Oacute;N</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orden->equipos as $index => $eq)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ mb_strtoupper($eq->equipo->nombre ?? 'EQUIPO') }}</td>
                <td class="text-center">{{ $eq->observacion ?? '-' }}</td>
            </tr>
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