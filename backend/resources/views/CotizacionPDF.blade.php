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
            text-align: right;
            margin-bottom: 15px;
            width: 100%;
        }
        
        .logo-container img {
            max-width: 80%;
            height: auto;
            display: inline-block;
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
        /* .separator {
            height: 3px;
            background-color: #2E4A7C;
            margin: 20px 0;
        } */
        
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
        
        /* ESTILO PROFESIONAL TIPO CARTA */
        /* SECCIÓN DE DATOS DEL CLIENTE (ESTILO LISTA VERTICAL) */
        .intro-section {
            padding: 10px 40px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1a1a1a;
        }

        .client-info-list {
            margin-bottom: 30px;
        }

        .info-item {
            margin-bottom: 8px; /* Espaciado entre cada línea */
        }

        .info-item .label {
            font-size: 13px;
            font-weight: bold;
            color: #000;
            display: block; /* Fuerza a que el valor vaya debajo o mantenga el bloque */
            text-transform: none;
        }

        .info-item .value {
            font-size: 14px;
            color: #2E4A7C; /* Color azul corporativo para los datos */
            font-weight: bold;
            display: block;
        }

        /* DISEÑO DE LA PROPUESTA (SE MANTIENE) */
        .proposal-text {
            margin-top: 25px;
            font-size: 14.5px;
            line-height: 1.6;
            color: #333;
            text-align: justify;
        }

        .highlight-service {
            color: #2E4A7C;
            font-weight: bold;
        }

        /* DISEÑO DE LA PROPUESTA COMERCIAL */
        .proposal-text {
            margin-top: 30px;
            font-size: 13.5px;
            line-height: 1.6;
            color: #333;
            text-align: justify;
        }

        .proposal-text p {
            margin-bottom: 15px;
        }

        .highlight-service {
            color: #2E4A7C;
            font-weight: bold;
        }

        .closing-phrase {
            margin-top: 25px;
            font-style: normal;
        }

        /* TABLA DE PRODUCTOS */
        .products-title {
            background-color: #2E4A7C;
            color: white;
            padding: 10px;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
            margin-top: 90px;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            margin-top: 20px;
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
        
        .footer .company-name {
            color: #2E4A7C;
            font-weight: bold;
            font-size: 12px;
        }
        
        .footer .tagline {
            color: #6CB52D;
            font-style: italic;
        }
        /* Estilos para la nueva tabla de pagos */
        .payment-section {
            margin-top: 25px;
            page-break-inside: avoid;
        }
        .payment-header-text {
            font-weight: bold;
            text-decoration: underline;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .payment-table {
            width: 90%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-left: 5%;
        }
        .payment-table td {
            border: 1px solid #000; 
            padding: 6px 10px;
            font-size: 11px;
        }
        .payment-table .label-cell {
            width: 45%;
            background-color: #ffffff;
        }

        /* ESTILO PARA EL EMISOR DEBAJO DE LA PROPUESTA */
        /* SECCIÓN DE FIRMA Y LOGOS */
        .issued-container {
            margin-top: 30px;
            padding: 0 10px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .issued-name {
            font-size: 15px;
            font-weight: bold;
            color: #000;
            margin-bottom: 2px;
        }

        .issued-position {
            font-size: 14px;
            color: #00b050; /* Color verde como en la imagen */
            font-weight: bold;
            margin-bottom: 15px;
        }

        .signature-logos {
            width: 100%;
            margin-top: 10px;
        }

        .signature-logos table {
            width: 100%;
            border: none;
        }

        .signature-logos td {
            border: none;
            padding: 0;
            vertical-align: middle;
            width: 50%; /* Divide el espacio en dos para las imágenes */
        }

        .img-signature {
            max-height: 70px; /* Ajusta según el tamaño de tus imágenes */
            width: auto;
        }  
        /* CLASE PARA FORZAR SALTO DE PÁGINA */
        .page-break {
            page-break-after: always;
        }
        /* Configuración para el pie de página repetitivo */

        /* 2. EL FOOTER: SE REPETIRÁ EN TODAS LAS HOJAS */
        footer {
            position: fixed; 
            bottom: 20px;       /* Cambiado de -60px a 20px para que suba a la hoja */
            left: 0px;
            right: 0px;
            height: 40px; 
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            width: 100%;
            z-index: 1000;      /* Asegura que esté por encima de otros elementos */
        }

        .footer-link {
            color: #2E4A7C;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px; /* Un poco más grande para que sea legible */
            font-family: sans-serif;
        }
        /* 1. Estilo base del encabezado (aparecerá en todas las hojas por defecto) */
        header {
            position: fixed;
            top: 20px; /* Ajusta la altura del logo en las hojas 2, 3... */
            left: 10px;
            height: 60px;
            width: 100%;
        }


        @page {

            margin: 90px 40px 80px 80px; 
        }

        @page :first {
            /* margin-top: 10px;  */
            header {
                top: -500px; /* Lo mandamos muy arriba para que no se vea */
                visibility: hidden;
            }
        }


        .logo-small {
            height: 80px; 
            width: auto;
        }
        /* Estilos para el contenido que viene del editor Quill */
        .proposal-text ul, .proposal-text ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        .proposal-text li {
            list-style-type: disc; /* Para que salgan los puntitos en las listas */
        }
        .contenido-desplazado {
            margin-left: 50px; /* Ajusta el valor a tu gusto */
            margin-right: 50px; /* Opcional: para equilibrar el ancho si es necesario */
        }

        /* IMPORTANTE: Asegúrate de que las tablas dentro de este div 
        no tengan un ancho fijo que rompa el margen */
        .contenido-desplazado .products-table {
            width: 100%; 
        }
    </style>
</head>
<body>
    @php
    // Datos de CIM
    $empresaCim = [
        'nombre' => 'CIM CONSULTORES PARA LA INDUSTRIA ALIMENTARIA SAC',
        'ruc' => '20604910090',
        'bcp' => '191-2656778-0-39',
        'cci_bcp' => '00219100265677803955',
        'banco_nacion' => '00-004-156900',
        'cci_nacion' => '1800400000415690000'
    ];

    // Datos de Multitasking
    $empresaMulti = [
        'nombre' => 'Multitasking servicios generales SAC',
        'ruc' => '20607499234',
        'bcp' => '191-9289661-0-57',
        'cci_bcp' => '00219100928966105750',
        'banco_nacion' => '00-054-127251',
        'cci_nacion' => '01805400005412725174'
    ];

    // Si es tipo 'capacitacion' usa CIM, sino usa Multi
    $tipo = strtolower($cotizacion->tipo_cotizacion ?? '');
    $datos = ($tipo == 'capacitacion' || $tipo == 'capacitación') ? $empresaCim : $empresaMulti;
    @endphp

    <header>
        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-calidad.png'))) }}" class="logo-small">
    </header>
    <footer>
        <a href="http://www.qsciconsulting.com" class="footer-link">www.qsciconsulting.com</a>
    </footer>
    <div class="container">
        
        <!-- LOGO -->
        <div class="logo-container">
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/encabezado.png'))) }}" alt="QSCI Group">
        </div>
        
        
        <div class="separator"></div>
        
        <!-- NÚMERO DE DOCUMENTO -->
        <div class="document-number">
            <strong>DOCUMENTO N°:</strong> <span>{{ $cotizacion->numero_cotizacion }}</span>
            <div class="document-date">Fecha de emisión: {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->format('d/m/Y') }}</div>
        </div>
        
        <!-- INFORMACIÓN DEL CLIENTE -->
        <div class="intro-section">
            <div class="client-info-list">
                <div class="info-item">
                    <span class="label">Ing.:</span>
                    <span class="value">{{ $cotizacion->cliente->persona_contacto }}</span>
                </div>

                <div class="info-item">
                    <span class="label">Atención:</span>
                    <span class="value">{{ $cotizacion->cliente->nombre_empresa }}</span>
                </div>

                <div class="info-item">
                    <span class="label">RUC:</span>
                    <span class="value">{{ $cotizacion->cliente->ruc }}</span>
                </div>

                <div class="info-item">
                    <span class="label">Dirección:</span>
                    <span class="value">{{ $cotizacion->cliente->direccion ?? 'No registrada' }}</span>
                </div>
            </div>

            <div class="proposal-text">
                <p>
                    Nos es grato enviarle nuestra siguiente propuesta comercial de 
                    <span class="highlight-service">Asesoría de Diagnóstico y Auditoría BRCGS START</span>.
                </p>
                <p>
                    Nuestro servicio está inspirado en vuestra empresa y queremos acompañarlos en el 
                    cumplimiento de sus objetivos y alcance de la excelencia.
                </p>
                <p style="margin-top: 20px;">
                    Quedo a su entera disposición para cualquier consulta.
                </p>
            </div>

            <div class="issued-container">
                <div class="issued-name">
                    {{ $cotizacion->creador->nombre ?? 'N/A' }} {{ $cotizacion->creador->apellido ?? '' }}
                </div>
                <div class="issued-position">
                    {{ $cotizacion->creador->cargo ?? 'Gerente Comercial' }}
                </div>
                <div class="signature-logos">
                    <table>
                        <tr>
                            <td style="text-align: left;">
                                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-calidad.png'))) }}" class="img-signature">
                            </td>
                            <td style="text-align: right;">
                                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" class="img-signature">
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="proposal-text">
                    <p>
                        E-mail: {{ $cotizacion->creador->correo  }}
                    </p>
                    <p>
                        Número: {{ $cotizacion->creador->celular  }}
                    </p>
                </div>
            </div>
        </div>
        <div class="page-break"></div>
        
        <!-- DETALLE DE PRODUCTOS/SERVICIOS -->
        <div class="contenido-desplazado">
            <div class="proposal-text" style="margin-bottom: 20px;">
                @if($cotizacion->propuesta_tecnica)
                    {{-- Las llaves con signos de admiración sirven para renderizar HTML --}}
                    {!! $cotizacion->propuesta_tecnica !!}
                @else
                    {{-- Texto por defecto si la base de datos está vacía --}}
                    <p>I. PROPUESTA TÉCNICA<br>
                    Presentamos a su consideración la oferta económica, a continuación, definiremos los componentes que hacen parte del alcance de la propuesta.</p>
                @endif
            </div>
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
                                @if($detalle->producto && $detalle->producto->imagen)
                                    <div style="margin-top: 8px; text-align: center;">
                                        <img src="{{ storage_path('app/public/' . $detalle->producto->imagen) }}" alt="{{ $detalle->producto->descripcion }}" style="max-width: 180px; max-height: 130px;">
                                    </div>
                                @endif
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

            <!-- SECCIÓN DE PAGOS -->
            <div class="payment-section">
                <p class="payment-header-text">Condiciones de pago:</p>
                <p style="font-size: 12px; margin-bottom: 5px;"> -  Información de pago: Cuenta BCP</p>
                <table class="payment-table">
                    <tr>
                        <td class="label-cell">Cuenta BCP ahorro en soles</td>
                        <td>{{ $datos['bcp'] }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Código de cuenta interbancario</td>
                        <td>{{ $datos['cci_bcp'] }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">A nombre de</td>
                        <td><strong>{{ $datos['nombre'] }}</strong></td>
                    </tr>
                    <tr>
                        <td class="label-cell">RUC</td>
                        <td>{{ $datos['ruc'] }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Banco de la Nación Cuenta de Detracción</td>
                        <td>{{ $datos['banco_nacion'] }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Código de Cuenta Interbancario</td>
                        <td>{{ $datos['cci_nacion'] }}</td>
                    </tr>
                </table>
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
        </div>
        
    </div>
</body>
</html>
