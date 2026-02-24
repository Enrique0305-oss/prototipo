<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Orden de Servicio {{ $orden->numero_orden }}</title>
    <style>
        @page { margin: 1cm; }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            color: #000;
            line-height: 1.2;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: -1px; /* Para evitar bordes dobles entre tablas */
        }
        th, td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: middle;
        }
        .header-table td { padding: 0; }
        .logo-section { width: 25%; text-align: center; padding: 5px; }
        .title-section { width: 50%; text-align: center; font-size: 14px; font-weight: bold; }
        .info-section { width: 25%; }
        
        .label { font-weight: bold; text-transform: uppercase; background-color: #f2f2f2; }
        .bg-gray { background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .items-table thead th {
            background-color: #d9e2f3; /* Azul claro como en tu imagen */
            text-transform: uppercase;
        }
        .footer-note {
            margin-top: 10px;
            font-size: 9px;
        }
        .observation {
            background-color: #fde9d9; /* Color naranja claro de tu imagen */
            padding: 5px;
            border: 1px solid #000;
            margin-top: 5px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="logo-section">
                @if(file_exists(public_path('images/logo-orden.png')))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="150">
                @endif
            </td>
            <td class="title-section">
                ORDEN DE SERVICIO N° {{ $orden->numero_orden }}
            </td>
            <td class="info-section">
                <table>
                    <tr><td class="label">Código</td><td class="text-center">OS-AC-001</td></tr>
                    <tr><td class="label">Fecha</td><td class="text-center">{{ date('d/m/Y') }}</td></tr>
                    <tr><td class="label">Versión</td><td class="text-center">{{ $orden->version ?? '01' }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">CLIENTE</td>
            <td style="width: 75%; font-weight: bold;">{{ strtoupper($orden->cliente->nombre_empresa) }}</td>
        </tr>
        <tr>
            <td class="label">RUC</td>
            <td>{{ $orden->cliente->ruc }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">N° DE COTIZACION</td>
            <td style="width: 25%;" class="text-center">{{ $orden->cotizacion->numero_cotizacion ?? '---' }}</td>
            <td class="label" style="width: 20%;">COSTO:</td>
            <td style="width: 30%; font-weight: bold;" class="text-right">S/. {{ number_format($orden->detalles->sum('precio'), 2) }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">FECHA DE ACEPTACION</td>
            <td style="width: 25%;" class="text-center">{{ \Carbon\Carbon::parse($orden->fecha_aceptacion)->format('d/m/Y') }}</td>
            <td class="label" style="width: 20%;">FECHA DE ENVIO</td>
            <td style="width: 30%;" class="text-center">{{ $orden->fecha_tentativa ? \Carbon\Carbon::parse($orden->fecha_tentativa)->format('d/m/Y') : '---' }}</td>
        </tr>
    </table>

    <table class="items-table" style="margin-top: 10px;">
        <thead>
            <tr>
                <th style="width: 5%;">N°</th>
                <th style="width: 65%;">SERVICIO</th>
                <th style="width: 10%;">CANTIDAD</th>
                <th style="width: 20%;">PRECIO</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orden->detalles as $index => $detalle)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>
                    {{ strtoupper($detalle->servicio->nombre) }}
                    @if($detalle->local) <br><small>Local: {{ $detalle->local }}</small> @endif
                    @if($detalle->frecuencia) <br><small>Frecuencia: {{ $detalle->frecuencia }}</small> @endif
                </td>
                <td class="text-center">1</td> <td class="text-right">S/. {{ number_format($detalle->precio, 2) }}</td>
            </tr>
            @endforeach
            <tr class="bg-gray">
                <td colspan="3" class="label text-right">TOTAL</td>
                <td class="text-right" style="font-weight: bold;">S/. {{ number_format($orden->detalles->sum('precio'), 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="observation">
        <strong>Observación:</strong> El precio {{ $orden->incluye_igv ? 'SI' : 'NO' }} incluye IGV
    </div>

    <div class="footer-note" style="margin-top: 15px;">
        <strong>Emitido por:</strong> 
        {{ $orden->emisor->nombre ?? 'Sin nombre' }} {{ $orden->emisor->apellido ?? '' }}
    </div>

</body>
</html>