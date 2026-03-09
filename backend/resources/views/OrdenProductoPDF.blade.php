<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Producto {{ $orden->numero_orden }}</title>
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
        .observation { background-color: #fde9d9; padding: 5px; border: 1px solid #000; margin-top: 10px; font-size: 9px; }
        .no-border { border: none !important; }
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
                ORDEN DE PRODUCTO N&deg; {{ $orden->numero_orden }}
            </td>
            <td style="width: 25%; padding: 0;">
                <table style="margin: 0;">
                    <tr><td class="label" style="width: 45%;">C&oacute;digo</td><td class="text-center">{{ $orden->codigo_doc ?? 'OP-AC-001' }}</td></tr>
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
            <td style="width: 30%; font-weight: bold;" class="text-right">S/. {{ number_format($orden->total ?? 0, 2) }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">FECHA DE ACEPTACI&Oacute;N</td>
            <td style="width: 25%;" class="text-center">{{ $orden->fecha_aceptacion ? \Carbon\Carbon::parse($orden->fecha_aceptacion)->format('d/m/Y') : '---' }}</td>
            <td class="label" style="width: 25%;">FECHA DE ENV&Iacute;O</td>
            <td style="width: 25%;" class="text-center">{{ $orden->fecha_envio ? \Carbon\Carbon::parse($orden->fecha_envio)->format('d/m/Y') : '---' }}</td>
        </tr>
    </table>

    {{-- ── TABLA DE PRODUCTOS ── --}}
    <table style="margin-top: 10px;">
        <thead>
            <tr class="bg-blue">
                <th style="width: 8%;">N&ordm;</th>
                <th style="width: 47%;">PRODUCTO / DESCRIPCI&Oacute;N</th>
                <th style="width: 15%;">CANTIDAD</th>
                <th style="width: 15%;">P. UNITARIO</th>
                <th style="width: 15%;">SUBTOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orden->detalles as $index => $detalle)
            @php
                $precioUnit = $detalle->precio_unitario ?? $detalle->precio ?? 0;
                $cantidad = $detalle->cantidad ?? 1;
                $subtotalLinea = $precioUnit * $cantidad;
            @endphp
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ mb_strtoupper($detalle->producto->descripcion ?? 'PRODUCTO') }}</td>
                <td class="text-center">{{ $cantidad }}</td>
                <td class="text-right">S/. {{ number_format($precioUnit, 2) }}</td>
                <td class="text-right">S/. {{ number_format($subtotalLinea, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- ── TOTALES ── --}}
    <table>
        <tr>
            <td class="no-border" style="width: 55%;"></td>
            <td class="label text-right" style="width: 25%;">SUBTOTAL</td>
            <td class="text-right" style="width: 20%;">S/. {{ number_format($orden->subtotal ?? $orden->total ?? 0, 2) }}</td>
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
            <td class="text-right" style="font-size: 11px; font-weight: bold;">S/. {{ number_format($orden->total ?? 0, 2) }}</td>
        </tr>
    </table>

    {{-- ── OBSERVACIÓN ── --}}
    <div class="observation">
        <strong>Observaci&oacute;n:</strong> El precio {{ $orden->incluye_igv ? 'SI' : 'NO' }} incluye IGV.
    </div>

    {{-- ── EMITIDO POR ── --}}
    <div style="margin-top: 15px;">
        <strong>Emitido por:</strong> {{ $orden->emisor->nombre ?? '' }} {{ $orden->emisor->apellidos ?? '' }}
    </div>
</body>
</html>