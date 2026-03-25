<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $cotizacion->numero_cotizacion }}</title>
    <style>
@include('cotizaciones.pdf.partials.styles-common')

@include('cotizaciones.pdf.partials.styles-producto')
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
        
        <!-- NÃšMERO DE DOCUMENTO -->
        <div class="document-number">
            <strong>DOCUMENTO N°:</strong> <span>{{ $cotizacion->numero_cotizacion }}</span>
            <div class="document-date">Fecha de emisión: {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->format('d/m/Y') }}</div>
        </div>
        
        <!-- INFORMACIÃ“N DEL CLIENTE -->
        <div class="intro-section">
            <div class="client-info-list">
                <div class="info-item">
                    <span class="label">Señores:</span>
                    <span class="value">{{ $cotizacion->cliente->nombre_empresa }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Contacto:</span>
                    <span class="value">{{ $cotizacion->cliente->persona_contacto }}</span>
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
        </div>
        <!-- <div class="page-break"></div> -->
    
        <!-- PÃGINA DE PROPUESTA TÃ‰CNICA -->
        <div class="contenido-desplazado">
            
            <!-- NÃšMERO DE PROPUESTA Y FECHA 
            <div class="propuesta-numero">
                NÚMERO DE PROPUESTA &ndash; {{ $cotizacion->numero_cotizacion }}
            </div>
            <div class="propuesta-fecha">
                {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->locale('es')->translatedFormat('j \\d\\e F \\d\\e Y') }}
            </div> -->

            <!-- III. PROPUESTA ECONÃ“MICA -->
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th style="width: 40%;">Descripción</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Precio Unitario</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($cotizacion->detalles as $index => $detalle)
                    <tr>
                        <td class="text-center">
                            PRD-{{ str_pad($detalle->id_producto ?? ($index + 1), 4, '0', STR_PAD_LEFT) }}
                        </td>
                        <td>
                            <strong>{{ $detalle->producto->descripcion ?? $detalle->descripcion_manual ?? 'N/A' }}</strong><br>
                            @if($detalle->descripcion_manual)
                                <small style="color: #666;">{{ $detalle->descripcion_manual }}</small>
                            @endif
                            @if($detalle->producto && $detalle->producto->imagen)
                                <div style="margin-top: 8px; text-align: center;">
                                    <img src="{{ storage_path('app/public/' . $detalle->producto->imagen) }}" alt="{{ $detalle->producto->descripcion }}" style="max-width: 180px; max-height: 130px;">
                                </div>
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
                    <tr>
                        <td class="label">TOTAL GENERAL:</td>
                        <td class="value">S/ {{ number_format($cotizacion->total ?? 0, 2) }}</td>
                    </tr>
                </table>
            </div>

            <!-- NOTA SOBRE IGV -->
            <div style="margin-top: 15px; padding: 12px 16px; border: 2px solid {{ $cotizacion->incluye_igv ? '#6CB52D' : '#dc3545' }}; border-radius: 4px; background-color: {{ $cotizacion->incluye_igv ? '#f0f9e8' : '#fff3f3' }};">
                <strong style="color: {{ $cotizacion->incluye_igv ? '#2E4A7C' : '#dc3545' }}; font-size: 12px;">
                    @if($cotizacion->incluye_igv)
                        Esta cotizaciÃ³n INCLUYE IGV (18%)
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

            <!-- SECCIÃ“N DE PAGOS -->
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
        
    </div>
</body>
</html>

