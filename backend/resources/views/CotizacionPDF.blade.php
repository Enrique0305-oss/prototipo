<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $cotizacion->numero_cotizacion }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.4;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        /* ENCABEZADO CON LOGO */
        .logo-container {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .logo-container img {
            max-width: 100%;
            height: auto;
        }
        
        /* TÍTULO PRINCIPAL */
        .main-title {
            background-color: #2E4A7C;
            color: white;
            text-align: center;
            padding: 15px;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 5px;
        }
        
        .sub-title {
            background-color: #6CB52D;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 30px;
        }
        
        /* LÍNEA SEPARADORA */
        .separator {
            height: 3px;
            background-color: #2E4A7C;
            margin: 20px 0;
        }
        
        /* NÚMERO DE DOCUMENTO */
        .document-number {
            border: 2px solid #2E4A7C;
            padding: 12px;
            text-align: center;
            margin-bottom: 20px;
            background-color: #f8f9fa;
        }
        
        .document-number strong {
            color: #2E4A7C;
            font-size: 16px;
        }
        
        .document-number span {
            color: #6CB52D;
            font-size: 16px;
            font-weight: bold;
        }
        
        .document-date {
            color: #666;
            font-size: 11px;
            margin-top: 5px;
        }
        
        /* TABLA DE INFORMACIÓN */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            border: 1px solid #ddd;
        }
        
        .info-table td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 12px;
        }
        
        .info-table td:first-child {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #2E4A7C;
            width: 150px;
        }
        
        /* TABLA DE PRODUCTOS */
        .products-title {
            background-color: #2E4A7C;
            color: white;
            padding: 10px;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
            margin-top: 20px;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .products-table thead {
            background-color: #2E4A7C;
            color: white;
        }
        
        .products-table th {
            padding: 10px;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            border: 1px solid white;
        }
        
        .products-table td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 12px;
        }
        
        .products-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        /* TOTALES */
        .totals-container {
            margin-top: 20px;
        }
        
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals-table td {
            padding: 8px;
            font-size: 13px;
        }
        
        .totals-table .label {
            text-align: right;
            font-weight: bold;
            width: 70%;
            border-top: 1px solid #ddd;
            padding-right: 20px;
        }
        
        .totals-table .value {
            text-align: right;
            border: 1px solid #ddd;
            background-color: #f5f5f5;
            font-weight: bold;
            width: 30%;
        }
        
        .totals-table .total-row .label {
            background-color: #2E4A7C;
            color: white;
            border: 2px solid #2E4A7C;
            font-size: 15px;
        }
        
        .totals-table .total-row .value {
            background-color: #2E4A7C;
            color: white;
            border: 2px solid #2E4A7C;
            font-size: 15px;
        }
        
        /* CONDICIONES */
        .conditions {
            margin-top: 30px;
            border: 2px solid #2E4A7C;
            padding: 15px;
        }
        
        .conditions-title {
            background-color: #2E4A7C;
            color: white;
            padding: 8px;
            margin: -15px -15px 15px -15px;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
        }
        
        .conditions-list {
            font-size: 11px;
            line-height: 1.8;
            margin-left: 20px;
        }
        
        .conditions-list li {
            margin-bottom: 8px;
            color: #555;
        }
        
        /* FOOTER */
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        
        .footer .company-name {
            color: #2E4A7C;
            font-weight: bold;
            font-size: 12px;
        }
        
        .footer .tagline {
            color: #6CB52D;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- LOGO -->
        <div class="logo-container">
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/encabezado.png'))) }}" alt="QSCI Group">
        </div>
        
        <!-- TÍTULO PRINCIPAL -->
        <div class="main-title">COTIZACIÓN</div>
        <div class="sub-title">Servicios Multidisciplinarios</div>
        
        <div class="separator"></div>
        
        <!-- NÚMERO DE DOCUMENTO -->
        <div class="document-number">
            <strong>DOCUMENTO N°:</strong> <span>{{ $cotizacion->numero_cotizacion }}</span>
            <div class="document-date">Fecha de emisión: {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->format('d/m/Y') }}</div>
        </div>
        
        <!-- INFORMACIÓN DEL CLIENTE -->
        <table class="info-table">
            <tr>
                <td>Empresa:</td>
                <td>{{ $cotizacion->cliente->nombre_empresa }}</td>
            </tr>
            <tr>
                <td>Fecha:</td>
                <td>{{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Proveedor:</td>
                <td>QSCI Group - Servicios Multidisciplinarios</td>
            </tr>
            <tr>
                <td>RUC:</td>
                <td>{{ $cotizacion->cliente->ruc }}</td>
            </tr>
            <tr>
                <td>Dirección:</td>
                <td>{{ $cotizacion->cliente->direccion ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Tipo:</td>
                <td>{{ $cotizacion->tipo_cotizacion }}</td>
            </tr>
            <tr>
                <td>Estado:</td>
                <td style="font-weight: bold; color: 
                    @if($cotizacion->estado === 'Pendiente') #856404
                    @elseif($cotizacion->estado === 'Aceptada') #155724
                    @else #721C24 @endif;">
                    {{ $cotizacion->estado }}
                </td>
            </tr>
        </table>
        
        <!-- DETALLE DE PRODUCTOS/SERVICIOS -->
        <div class="products-title">Detalle de Productos/Servicios</div>
        
        <table class="products-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th style="width: 40%;">Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($cotizacion->detalles as $index => $detalle)
                <tr>
                    <td class="text-center">
                        @if($detalle->id_servicio)
                            SRV-{{ str_pad($detalle->id_servicio, 4, '0', STR_PAD_LEFT) }}
                        @elseif($detalle->id_producto)
                            PRD-{{ str_pad($detalle->id_producto, 4, '0', STR_PAD_LEFT) }}
                        @else
                            ITEM-{{ str_pad($index + 1, 4, '0', STR_PAD_LEFT) }}
                        @endif
                    </td>
                    <td>
                        @if($detalle->id_servicio)
                            <strong>{{ $detalle->servicio->nombre ?? 'N/A' }}</strong><br>
                            <small style="color: #666;">{{ $detalle->descripcion_manual }}</small>
                        @elseif($detalle->id_producto)
                            <strong>{{ $detalle->producto->descripcion ?? 'N/A' }}</strong><br>
                            <small style="color: #666;">{{ $detalle->descripcion_manual }}</small>
                        @else
                            {{ $detalle->descripcion_manual }}
                        @endif
                        @if($detalle->modalidad_sugerida)
                            <br><small style="color: #6CB52D;"><em>Modalidad: {{ $detalle->modalidad_sugerida }}</em></small>
                        @endif
                        @if($detalle->frecuencia_sugerida)
                            <br><small style="color: #6CB52D;"><em>Frecuencia: {{ $detalle->frecuencia_sugerida }}</em></small>
                        @endif
                    </td>
                    <td class="text-center">{{ $detalle->cantidad }}</td>
                    <td class="text-center">UND</td>
                    <td class="text-right">S/ {{ number_format($detalle->precio_unitario, 2) }}</td>
                    <td class="text-right"><strong>S/ {{ number_format($detalle->cantidad * $detalle->precio_unitario, 2) }}</strong></td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        <!-- TOTALES -->
        <div class="totals-container">
            <table class="totals-table">
                <tr>
                    <td class="label">Subtotal:</td>
                    <td class="value">S/ {{ number_format($cotizacion->subtotal ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td class="label">IGV (18%):</td>
                    <td class="value">S/ {{ number_format($cotizacion->igv ?? 0, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td class="label">TOTAL GENERAL:</td>
                    <td class="value">S/ {{ number_format($cotizacion->total ?? 0, 2) }}</td>
                </tr>
            </table>
        </div>

        <!-- NOTA SOBRE IGV -->
        <div style="margin-top: 15px; padding: 12px 16px; border: 2px solid {{ $cotizacion->incluye_igv ? '#6CB52D' : '#dc3545' }}; border-radius: 4px; background-color: {{ $cotizacion->incluye_igv ? '#f0f9e8' : '#fff3f3' }};">
            <strong style="color: {{ $cotizacion->incluye_igv ? '#2E4A7C' : '#dc3545' }}; font-size: 12px;">
                @if($cotizacion->incluye_igv)
                     Esta cotización INCLUYE IGV (18%)
                @else
                     Esta cotización NO incluye IGV
                @endif
            </strong>
            @if($cotizacion->observaciones)
                <p style="margin-top: 6px; font-size: 11px; color: #555;">
                    <strong>Observaciones:</strong> {{ $cotizacion->observaciones }}
                </p>
            @endif
        </div>
        
        <!-- CONDICIONES COMERCIALES -->
        <div class="conditions">
            <div class="conditions-title">Condiciones Comerciales</div>
            <ol class="conditions-list">
                <li>Esta cotización será válida una vez aceptada formalmente por el cliente.</li>
                <li>El cliente se compromete a entregar los datos necesarios en la fecha y lugar pactado.</li>
                <li>Los servicios se realizarán según la orden de prioridad establecida por el cliente.</li>
                <li>En el evento que la empresa cliente modifique la cantidad de servicios/productos, la empresa se reserva el derecho de rechazar la entrega o iniciar el proceso sancionador correspondiente.</li>
                <li>Los productos/servicios deberán ser entregados conforme a los requisitos establecidos en la orden, acompañados de la documentación necesaria.</li>
                <li>El pago se efectuará contra la presentación de la factura y los documentos requeridos conforme a las condiciones pactadas.</li>
                <li>Los precios incluyen impuestos y cualquier otro cargo adicional, salvo acuerdo distinto por escrito.</li>
                <li>Esta cotización tiene una validez de 30 días desde la fecha de emisión.</li>
            </ol>
        </div>
        
        <!-- FOOTER -->
        <div class="footer">
            <p class="company-name">QSCI Group</p>
            <p class="tagline">Servicios Multidisciplinarios - Soluciones Integrales</p>
            <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
        </div>
        
    </div>
</body>
</html>
