<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $cotizacion->numero_cotizacion }}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        /* ENCABEZADO CON LOGO */
        .logo-container {
            width: 100%;
            margin-bottom: 15px;
        }

        .logo-container table {
            width: 100%;
            border: none;
        }

        .logo-container td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .logo-container .logo-qsci {
            width: 20%;
        }

        .logo-container .logo-qsci img {
            height: 70px;
            width: auto;
        }

        .logo-container .logo-encabezado {
            width: 80%;
            text-align: right;
        }
        
        .logo-container .logo-encabezado img {
            max-width: 100%;
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

        /* ENCABEZADOS DE PROPUESTA (PÁGINA 2) */
        .propuesta-numero {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-top: 10px;
            margin-bottom: 5px;
            text-decoration: underline;
        }

        .propuesta-fecha {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 25px;
        }

        .seccion-titulo {
            font-size: 13px;
            font-weight: bold;
            color: #000;
            margin-top: 20px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .seccion-titulo-num {
            display: inline;
            margin-right: 15px;
        }

        .seccion-descripcion {
            font-size: 13px;
            line-height: 1.6;
            color: #333;
            text-align: justify;
            margin-bottom: 15px;
        }

        /* TABLA DE PRODUCTOS */
        .products-title {
            background-color: #2E4A7C;
            color: white;
            padding: 10px;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
            margin-top: 30px;
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

        /* 2. EL FOOTER */
        footer {
            position: fixed; 
            bottom: -30px;
            left: 0px;
            right: 0px;
            height: 30px; 
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }

        .footer-link {
            color: #2E4A7C;
            text-decoration: none;
            font-weight: bold;
            font-size: 12px;
            font-family: sans-serif;
        }
        /* 1. HEADER FIJO - aparece en el área de margen superior */
        header {
            position: fixed;
            top: -85px;
            left: 0px;
            right: 0px;
            height: 75px;
        }


        @page {
            margin: 120px 40px 60px 40px; 
        }

        @page :first {
            margin-top: 5px;
        }


        .logo-small {
            height: 70px; 
            width: auto;
            display: block;
        }
        /* Estilos para el contenido que viene del editor Quill */
        .proposal-text ul, .proposal-text ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        .proposal-text li {
            list-style-type: disc; /* Para que salgan los puntitos en las listas */
        }

        /* Mejora la visualización de tablas dentro del texto generado por Quill */
        .proposal-text table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
        }
        .proposal-text th,
        .proposal-text td {
            border: 1px solid #444;
            padding: 6px 8px;
        }
        .proposal-text td {
            vertical-align: top;
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
    <header>
        @php
            $headerLogo = ($cotizacion->id_multicim ?? 1) == 2 ? 'logo-orden.png' : 'logo-calidad.png';
        @endphp
        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/' . $headerLogo))) }}" class="logo-small">
    </header>
    <footer>
        <a href="http://www.qsciconsulting.com" class="footer-link">www.qsciconsulting.com</a>
    </footer>
    <div class="container">
        
        <!-- LOGO -->
        <div class="logo-container">
            <table>
                <tr>
                    <td class="logo-qsci">
                        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/' . $headerLogo))) }}" alt="QSCI">
                    </td>
                    <td class="logo-encabezado">
                        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/encabezado.png'))) }}" alt="QSCI Group">
                    </td>
                </tr>
            </table>
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
                    <span class="highlight-service">
                        @php
                            // 1. lista de nombres de servicios o manuales
                            $serviciosColeccion = $cotizacion->detalles
                                ->map(function($d) {
                                    return $d->id_servicio && $d->servicio ? $d->servicio->nombre : $d->descripcion_manual;
                                })
                                ->filter()
                                ->unique();

                            $cantidad = $serviciosColeccion->count();
                            
                            // 2. logica de cuando se seleccione mas servicios
                            if ($cantidad > 1) {
                                // Si hay más de 2, ponemos el nombre general
                                $textoMostrar = "servicio de Control de plagas";
                            } else {
                                // Si hay 1 o 2, los listamos separados por coma
                                $textoMostrar = $serviciosColeccion->implode(', ');
                            }
                        @endphp
                        
                        {{ $textoMostrar ?: 'Asesoría y Servicios Especializados' }}
                    </span>.
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
    
        <!-- CONDICIONAL CUANDO SEA UN SERVICIO DE LIMPIEZA RESERVORIOS -->
        @php
            $mostrarSeccionEspecial = $cotizacion->detalles->contains(function($detalle) {
                // Verifica que el servicio no sea nulo y que el nombre coincida exactamente
                return $detalle->servicio && $detalle->servicio->nombre === 'LIMPIEZA DE CISTERNAS Y RESERVORIOS';
            });
        @endphp
        <!-- PÁGINA DE PROPUESTA TÉCNICA -->
        <div class="contenido-desplazado">
            
            <!-- NÚMERO DE PROPUESTA Y FECHA -->
            <div class="propuesta-numero">
                NÚMERO DE PROPUESTA &ndash; {{ $cotizacion->numero_cotizacion }}
            </div>
            <div class="propuesta-fecha">
                {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->isoFormat('D [de] MMMM [de] YYYY') }}
            </div>

            <!-- I. PROPUESTA TÉCNICA -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">I.</span> PROPUESTA TÉCNICA
            </div>
            <div class="seccion-descripcion">
                Presentamos a su consideración la oferta económica, a continuación, definiremos los componentes que hacen parte del alcance de la propuesta.
            </div>

            <!-- II. ESPECIFICACIONES DEL SERVICIO -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">II.</span> SOBRE LOS SERVICIOS BRINDADOS
            </div>
            <div class="seccion-descripcion">
                    A continuación, se detallarán la lista de actividades incluidas en el servicio.
            </div>

            {{-- 2. SECCIÓN DINÁMICA DE IMÁGENES CUANDOS SEA SERVICIO DE LIMPIEZA --}}
            @if($mostrarSeccionEspecial)
                <div style="margin-top: 15px; text-align: center;">
                    <div style="margin-bottom: 10px; text-align: left;">
                        <strong style="font-size: 13px;">• SERVICIO PARA PRESTAR:</strong>
                        <p style="margin: 5px 0 15px 15px; font-size: 14px; color: #333;">LIMPIEZA DE RESERVORIO DE AGUA</p>
                        
                        <strong style="font-size: 13px;">• PROCEDIMIENTO DEL SERVICIO:</strong>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="width: 33%; padding: 5px;">
                                <img src="{{ public_path('images/limpieza_reservorios/limpieza_1.png') }}" style="width: 100%; border: 1px solid #ddd;">
                            </td>
                            <td style="width: 33%; padding: 5px;">
                                <img src="{{ public_path('images/limpieza_reservorios/limpieza_2.png') }}" style="width: 100%; border: 1px solid #ddd;">
                            </td>
                            <td style="width: 33%; padding: 5px;">
                                <img src="{{ public_path('images/limpieza_reservorios/limpieza_3.png') }}" style="width: 100%; border: 1px solid #ddd;">
                            </td>
                        </tr>
                    </table>

                    <div style="margin-bottom: 10px; text-align: left;">
                        <strong style="font-size: 13px;">• PERSONAL ASIGNADO:</strong>
                    </div>
                </div>
            @endif
            <div class="proposal-text" style="margin-bottom: 20px;">
                @if($cotizacion->propuesta_tecnica)
                    {!! $cotizacion->propuesta_tecnica !!}
                @else
                    <p>Presentamos a su consideración la oferta económica, a continuación, definiremos los componentes que hacen parte del alcance de la propuesta.</p>
                @endif
            </div>

            <!-- III. PROPUESTA ECONÓMICA -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">III.</span> PROPUESTA ECONÓMICA
            </div>
            <div class="seccion-descripcion">
                    El siguiente cuadro muestra la respectiva cotización por el servicio brindado:
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
                <p style="font-size: 12px; margin-bottom: 5px;"> - Información de pago: Cuenta BCP</p>
                
                <table class="payment-table">
                    <tr>
                        <td class="label-cell">Cuenta BCP ahorro en soles</td>
                        <td>{{ $cotizacion->empresa->cuenta_bcp }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Código de cuenta interbancario</td>
                        <td>{{ $cotizacion->empresa->codigo_interbancario_bcp }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">A nombre de</td>
                        <td><strong>{{ $cotizacion->empresa->nombre_empresa }}</strong></td>
                    </tr>
                    <tr>
                        <td class="label-cell">RUC</td>
                        <td>{{ $cotizacion->empresa->ruc }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Banco de la Nación Cuenta de Detracción</td>
                        <td>{{ $cotizacion->empresa->banco_nacion }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Código de Cuenta Interbancario (Detracción)</td>
                        <td>{{ $cotizacion->empresa->codigo_interbancario_nacion }}</td>
                    </tr>
                </table>
            </div>
        </div>
        
    </div>
</body>
</html>
