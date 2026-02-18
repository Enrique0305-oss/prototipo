<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Orden de Producto {{ $orden->numero_orden }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.4;
            padding: 15px 20px;
            font-size: 11px;
        }

        .container { max-width: 100%; margin: 0 auto; }

        /* ENCABEZADO CON LOGO */
        .logo-container {
            text-align: center;
            margin-bottom: 10px;
        }
        .logo-container img {
            max-width: 100%;
            height: auto;
        }

        /* INFO DOCUMENTO */
        .doc-info {
            width: 100%;
            margin-bottom: 12px;
        }
        .doc-info td {
            font-size: 11px;
        }
        .doc-info .left { text-align: left; }
        .doc-info .right { text-align: right; }
        .doc-info strong { color: #333; }

        /* INFO CLIENTE */
        .client-info {
            width: 100%;
            margin-bottom: 10px;
            font-size: 11px;
            line-height: 1.6;
        }
        .client-info td {
            vertical-align: top;
        }
        .client-label {
            font-weight: bold;
            color: #333;
        }

        /* TIPO DE PRODUCTO */
        .product-type-row {
            width: 100%;
            margin-bottom: 8px;
        }
        .product-type-label {
            color: #0066cc;
            font-weight: bold;
            font-size: 11px;
        }
        .product-type-unit {
            text-align: right;
            font-weight: bold;
            color: #0066cc;
            font-size: 11px;
        }

        /* TABLA DE PRODUCTOS */
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .products-table thead {
            background-color: #2E4A7C;
            color: white;
        }
        .products-table th {
            padding: 8px 10px;
            text-align: center;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid #2E4A7C;
        }
        .products-table td {
            padding: 10px;
            border: 1px solid #ccc;
            font-size: 11px;
            vertical-align: top;
        }
        .products-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .product-name {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 4px;
        }
        .product-notes {
            font-size: 10px;
            color: #333;
            list-style: disc;
            margin-left: 18px;
            line-height: 1.5;
        }

        /* NOTA DE IGV */
        .igv-note {
            margin: 15px 0;
            font-size: 11px;
            text-align: center;
        }
        .igv-note .bullet {
            color: #0066cc;
            font-weight: bold;
            font-size: 14px;
        }
        .igv-note strong {
            color: #d9534f;
            font-weight: bold;
        }

        /* SEPARADOR */
        .separator {
            height: 2px;
            background-color: #2E4A7C;
            margin: 12px 0;
        }

        /* INFORMACION DE PAGO */
        .payment-title {
            font-weight: bold;
            font-size: 11px;
            color: #333;
            margin-bottom: 6px;
            background-color: #e8e8e8;
            padding: 4px 8px;
            border: 1px solid #ccc;
        }
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .payment-table td {
            padding: 4px 8px;
            font-size: 10px;
            border: 1px solid #ccc;
        }
        .payment-table td:first-child {
            font-weight: bold;
            width: 220px;
            background-color: #f5f5f5;
        }

        /* AGRADECIMIENTO */
        .thanks {
            font-size: 10px;
            font-style: italic;
            color: #555;
            text-align: center;
            margin-top: 10px;
        }

        /* TOTALES - dentro de la tabla */
        .total-row td {
            font-weight: bold;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="container">

        {{-- ENCABEZADO / LOGO --}}
        <div class="logo-container">
            @if(file_exists(public_path('images/encabezado.png')))
                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/encabezado.png'))) }}" alt="Encabezado">
            @endif
        </div>

        <div class="separator"></div>

        {{-- INFO DEL DOCUMENTO --}}
        <table class="doc-info">
            <tr>
                <td class="left">
                    <strong>FECHA:</strong> &nbsp; {{ \Carbon\Carbon::parse($orden->fecha_envio)->format('d/m/y') }}
                </td>
                <td class="right">
                    <strong>Orden de Producto:</strong> &nbsp; 
                    <strong style="color: #2E4A7C;">{{ $orden->numero_orden }}</strong>
                </td>
            </tr>
        </table>

        <br>

        {{-- INFO DEL CLIENTE --}}
        <table class="client-info">
            <tr>
                <td>
                    <span class="client-label">Señores:</span> {{ $orden->cliente->nombre_empresa ?? 'N/A' }}
                </td>
            </tr>
            <tr>
                <td>
                    <span class="client-label">RUC:</span> {{ $orden->cliente->ruc ?? 'N/A' }}
                </td>
            </tr>
            <tr>
                <td>
                    <span class="client-label">Contacto:</span> {{ $orden->cliente->contacto ?? '' }}
                </td>
            </tr>
            <tr>
                <td><strong>Presente:</strong></td>
            </tr>
            <tr>
                <td>
                    <span class="client-label">Asunto de Referencia:</span>
                    @if($orden->cotizacion)
                        Cotización {{ $orden->cotizacion->numero_cotizacion }}
                    @endif
                </td>
                <td style="text-align: right;">
                    <strong>Presentación/Cantidad</strong>
                </td>
            </tr>
        </table>

        <br>

        {{-- TIPO DE PRODUCTO --}}
        <table class="product-type-row">
            <tr>
                <td class="product-type-label">
                    Producto : 
                    @php
                        // Obtener nombres de productos únicos
                        $nombres = $orden->detalles->map(function($d) {
                            return strtoupper($d->producto->descripcion ?? 'PRODUCTO');
                        })->unique()->implode(', ');
                    @endphp
                    {{ $nombres }}
                </td>
                <td class="product-type-unit">UND</td>
            </tr>
        </table>

        {{-- TABLA DE PRODUCTOS --}}
        <table class="products-table">
            <thead>
                <tr>
                    <th style="width: 8%;">ITEM</th>
                    <th style="width: 42%;">DESCRIPCIÓN</th>
                    <th style="width: 15%;">PRECIO S/.</th>
                    <th style="width: 15%;">CANTIDAD</th>
                    <th style="width: 20%;">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                @foreach($orden->detalles as $index => $detalle)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <div class="product-name">
                            {{ strtoupper($detalle->producto->descripcion ?? 'Producto') }}
                        </div>
                        @if($detalle->producto && $detalle->producto->observaciones)
                            <ul class="product-notes">
                                <li>{{ $detalle->producto->observaciones }}</li>
                            </ul>
                        @endif
                    </td>
                    <td class="text-right">S/. {{ number_format($detalle->precio_unitario, 2) }}</td>
                    <td class="text-center">{{ $detalle->cantidad }}</td>
                    <td class="text-right">S/. {{ number_format($detalle->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        {{-- NOTA IGV --}}
        <div class="igv-note">
            <span class="bullet">●</span> &nbsp;
            <strong>
                El precio está expresado en soles 
                @if($orden->incluye_igv)
                    e incluye IGV
                @else
                    y no incluye IGV
                @endif
            </strong>
        </div>

        {{-- INFORMACION DE PAGO --}}
        <div class="payment-title">Información de Pago:</div>
        <table class="payment-table">
            <tr>
                <td>A nombre de:</td>
                <td>{{ $multicim->nombre_empresa }}</td>
            </tr>
            <tr>
                <td>RUC:</td>
                <td>{{ $multicim->ruc }}</td>
            </tr>
            <tr>
                <td>Cuenta BCP Ahorros en soles:</td>
                <td>{{ $multicim->cuenta_bcp }}</td>
            </tr>
            <tr>
                <td>Código de Cuenta Interbancaria:</td>
                <td>{{ $multicim->codigo_interbancario_bcp }}</td>
            </tr>
        </table>

        {{-- AGRADECIMIENTO --}}
        <div class="thanks">
            Agradeciendo la atención prestada, quedamos a la espera de su gentil respuesta
        </div>

    </div>
</body>
</html>
