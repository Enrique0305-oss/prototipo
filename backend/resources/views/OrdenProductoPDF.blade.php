<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Orden de Producto {{ $orden->numero_orden }}</title>
    <style>
        /* Reutilizamos tus mismos estilos para que sean idénticos */
        @page { margin: 1cm; }
        body { font-family: 'Arial', sans-serif; font-size: 10px; color: #000; line-height: 1.2; background-color: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .page-container { background-color: white; width: 21cm; min-height: 29.7cm; padding: 1.5cm; box-shadow: 0 0 10px rgba(0,0,0,0.2); box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; margin-bottom: -1px; }
        th, td { border: 1px solid #000; padding: 4px 6px; }
        .label { font-weight: bold; background-color: #f2f2f2; text-transform: uppercase; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bg-blue { background-color: #D9E1F2; } /* Azul del Excel */
        .observation { background-color: #fde9d9; padding: 5px; border: 1px solid #000; margin-top: 5px; }
        @media print { body { background-color: white; padding: 0; } .page-container { width: 100%; box-shadow: none; padding: 0; } }
    </style>
</head>
<body>
    <div class="page-container">
        <table>
            <tr>
                <td style="width: 25%; text-align: center;">
                    @if(file_exists(public_path('images/logo-orden.png')))
                        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="140">
                    @endif
                </td>
                <td style="width: 50%; text-align: center; font-size: 14px; font-weight: bold;">
                    ORDEN DE PRODUCTO N° {{ $orden->numero_orden }}
                </td>
                <td style="width: 25%;">
                    <table style="width: 100%; border: none;">
                        <tr><td class="label">Código</td><td class="text-center">OP-AC-001</td></tr>
                        <tr><td class="label">Fecha</td><td class="text-center">{{ date('d/m/Y') }}</td></tr>
                        <tr><td class="label">Versión</td><td class="text-center">01</td></tr>
                    </table>
                </td>
            </tr>
        </table>

        <table>
            <tr><td class="label" style="width: 20%;">CLIENTE</td><td style="font-weight: bold;">{{ strtoupper($orden->cliente->nombre_empresa) }}</td></tr>
            <tr><td class="label">RUC</td><td>{{ $orden->cliente->ruc }}</td></tr>
        </table>

        <table>
            <tr>
                <td class="label" style="width: 20%;">N° COTIZACIÓN</td>
                <td class="text-center" style="width: 30%;">{{ $orden->cotizacion->numero_cotizacion ?? '---' }}</td>
                <td class="label" style="width: 20%;">COSTO:</td>
                <td class="text-right" style="width: 30%; font-weight: bold;">S/. {{ number_format($orden->total, 2) }}</td>
            </tr>
        </table>

        <table>
            <tr>
                <td class="label" style="width: 20%;">FECHA ACEPTACIÓN</td>
                <td class="text-center" style="width: 30%;">
                    {{ isset($orden->fecha_aceptacion) && $orden->fecha_aceptacion ? \Carbon\Carbon::parse($orden->fecha_aceptacion)->format('d/m/Y') : '---' }}
                </td>
                <td class="label" style="width: 20%;">FECHA ENVÍO</td>
                <td class="text-center">{{ $orden->fecha_envio ? \Carbon\Carbon::parse($orden->fecha_envio)->format('d/m/Y') : '---' }}</td>
            </tr>
        </table>

        <table style="margin-top: 10px;">
            <thead>
                <tr class="bg-blue">
                    <th style="width: 5%;">N°</th>
                    <th style="width: 55%;">PRODUCTO / DESCRIPCIÓN</th>
                    <th style="width: 15%;">CANTIDAD</th>
                    <th style="width: 25%;">PRECIO</th>
                </tr>
            </thead>
            <tbody>
                @foreach($orden->detalles as $index => $detalle)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ strtoupper($detalle->producto->descripcion ?? 'PRODUCTO') }}</td>
                    <td class="text-center">{{ $detalle->cantidad ?? '1' }}</td>
                    <td class="text-right">S/. {{ number_format($detalle->precio_unitario ?? $detalle->precio, 2) }}</td>
                </tr>
                @endforeach
                <tr>
                    <td colspan="3" class="label text-right">TOTAL</td>
                    <td class="text-right" style="font-weight: bold;">S/. {{ number_format($orden->total, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="observation">
            <strong>Observación:</strong> El precio {{ $orden->incluye_igv ? 'SI' : 'NO' }} incluye IGV.
        </div>

        <div style="margin-top: 15px;">
            <strong>Emitido por:</strong> {{ $orden->emisor->nombre ?? 'N/A' }} {{ $orden->emisor->apellido ?? '' }}
        </div>
    </div>
</body>
</html>