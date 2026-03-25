<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $cotizacion->numero_cotizacion }}</title>
    <style>
@include('cotizaciones.pdf.partials.styles-common')

@include('cotizaciones.pdf.partials.styles-capacitacion')
    </style>
</head>
<body>
    <header>
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-calidad.png'))) }}" class="logo-small">
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
                        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-calidad.png'))) }}" class="logo-small">
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
                            // 1. lista de nombres de capacitaciones o manuales
                            $capacitacionesColeccion = $cotizacion->detalles
                                ->map(function($d) {
                                    return $d->id_catalogo_cap_aud && $d->catalogoCapAud ? $d->catalogoCapAud->nombre : $d->descripcion_manual;
                                })
                                ->filter()
                                ->unique();

                            $cantidad = $capacitacionesColeccion->count();
                            
                            // 2. logica de cuando se seleccione mas capacitaciones
                            if ($cantidad > 3) {
                                // Si hay más de 3, ponemos el nombre general
                                $textoMostrar = "muchas capacitaciones";
                            } elseif ($cantidad > 1) {
                                // Si hay 2 o 3, ponemos el nombre general
                                $textoMostrar = "servicio de Control de plagas";
                            } else {
                                // Si hay 1, lo listamos
                                $textoMostrar = $capacitacionesColeccion->implode(', ');
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
        <!-- PÃGINA DE PROPUESTA TÃ‰CNICA -->
        <div class="contenido-desplazado">
            
            <!-- NÚMERO DE PROPUESTA Y FECHA -->
            <div class="propuesta-numero">
                NÚMERO DE PROPUESTA &ndash; {{ $cotizacion->numero_cotizacion }}
            </div>
            <div class="propuesta-fecha">
                {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->locale('es')->translatedFormat('j \\d\\e F \\d\\e Y') }}
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
                <span class="seccion-titulo-num">II.</span> ESPECIFICACIONES DEL SERVICIO
            </div>
            <div class="seccion-descripcion">
                    A continuación, se detallarán la lista de actividades incluidas en el servicio.
            </div>
            <div class="issued-name">
                &nbsp;&nbsp;&nbsp;&nbsp;2.1 Objetivos
            </div>

            <div class="proposal-text" style="margin-bottom: 20px;">
                @if($cotizacion->propuesta_tecnica)
                    {!! $cotizacion->propuesta_tecnica !!}
                @else
                    <p>Presentamos a su consideración la oferta económica, a continuación, definiremos los componentes que hacen parte del alcance de la propuesta.</p>
                @endif
            </div>

            @php
                $detalleCap = $cotizacion->detalles->firstWhere('tipo', 'Capacitacion')
                    ?? $cotizacion->detalles->firstWhere('tipo', 'Capacitación')
                    ?? $cotizacion->detalles->first();
            @endphp
            <div class="issued-name">
                &nbsp;&nbsp;&nbsp;&nbsp;2.2 Actividades <br><br>

                <div style="margin-left: 40px; font-weight: normal;">
                    <strong>2.2.1 Capacitaciones:</strong>
                    El equipo de QSCI Consulting brindará capacitaciones actualizadas al público asistente.
                    <br><br>Esta capacitación está diseñada para ser cubierta de la siguiente manera.
                </div>
            </div>
            <div style="margin-left: 40px; font-size:13px; color:#334155; margin-top:12px;">
                <p style="margin:3px 0;"><strong>Fecha Tentativa de Servicio:</strong> {{ $detalleCap?->fecha_servicio ? \Carbon\Carbon::parse($detalleCap->fecha_servicio)->format('d/m/Y') : 'N/A' }}</p>
                <p style="margin:3px 0;"><strong>Horas de Capacitación:</strong> {{ $detalleCap?->horas_capacitacion ? $detalleCap->horas_capacitacion . ' hrs' : 'N/A' }}</p>
                <p style="margin:3px 0;"><strong>Número de Participantes:</strong> {{ $detalleCap?->num_participantes ?? 'N/A' }}</p>
                <p style="margin:3px 0;"><strong>Modalidad:</strong> {{ $detalleCap?->modalidad_sugerida ?? 'N/A' }}</p>
            </div>
            <br>
            <div class="payment-header-text">
                EQUIPO DE ASESORES LÍDERES- QSCI GROUP
            </div>

            <!-- III. PROPUESTA ECONÓMICA -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">III.</span> PROPUESTA ECONÓMICA
            </div>
            <div class="seccion-descripcion">
                    El siguiente cuadro muestra la respectiva cotización por el servicio de capacitación:
            </div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th style="width: 40%;">Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($cotizacion->detalles as $index => $detalle)
                    <tr>
                        <td class="text-center">
                            CAP-{{ str_pad($detalle->id_catalogo_cap_aud ?? ($index + 1), 4, '0', STR_PAD_LEFT) }}
                        </td>
                        <td>
                            <strong>{{ $detalle->catalogoCapAud->nombre ?? $detalle->descripcion_manual ?? 'N/A' }}</strong><br>
                            @if($detalle->descripcion_manual)
                                <small style="color: #666;">{{ $detalle->descripcion_manual }}</small>
                            @endif
                            @if($detalle->modalidad_sugerida)
                                <br><small style="color: #6CB52D;"><em>Modalidad: {{ $detalle->modalidad_sugerida }}</em></small>
                            @endif
                            @if($detalle->frecuencia_sugerida)
                                <br><small style="color: #6CB52D;"><em>Frecuencia: {{ $detalle->frecuencia_sugerida }}</em></small>
                            @endif
                        </td>
                        <td class="text-center">{{ $detalle->cantidad }}</td>
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
                    <!-- para volver al fondo azul<tr class="total-row" -->
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

            <!-- SECCIÃ“N DE PAGOS -->
            <div class="payment-section">
                <p class="payment-header-text">Condiciones de pago</p>
                <ul>
                    <li style="font-size: 13px; margin-bottom: 5px;">La factura por concepto será de acuerdo a la Orden de la Compra o Servicio enviada previamente.</li>
                    <li style="font-size: 13px; margin-bottom: 5px;">Crédito 30 días, luego de haber sido realizada la Capacitación.</li>
                </ul>
                <p class="payment-header-text">Información de pago:</p>
                <p style="font-size: 13px; margin-bottom: 5px;"> - Información de pago: Cuenta BCP</p>
                
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
                        <td class="label-cell">Banco de la Nación Cuenta de Detraccián</td>
                        <td>{{ $cotizacion->empresa->banco_nacion }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Código de Cuenta Interbancario (Detraccián)</td>
                        <td>{{ $cotizacion->empresa->codigo_interbancario_nacion }}</td>
                    </tr>
                </table>

                <p class="payment-header-text">Valor Agregado</p>
                <ul>
                    <li style="font-size: 13px; margin-bottom: 5px;">Capacitaciones certificadas a nombre de QSCI COnsulting y del COlegio de Biólogos del Perú Región Lima VII</li>
                    <li style="font-size: 13px; margin-bottom: 5px;">Personal calificado con experiencia certificada en Calidad e Inocuidad Alimentaria</li>
                </ul>

                <p class="payment-header-text">Consideraciones</p>
                <ul>
                    <li style="font-size: 13px; margin-bottom: 5px;">
                        En caso exista la necesidad de reprogramar el servicio por parte del cliente, se debrá comunicar con una anticipación
                        mínima de 48 horas respecto a la fecha previamente acordada, a fin de evitar la emisión de cualquier cargo.</li>
                    <li style="font-size: 13px; margin-bottom: 5px;">
                        Es importante que el cliente nos brinde información adicional según se requiera para una adecuada capacitación.</li>
                </ul>
            </div>

            <!-- SECCIÓN DE FIRMAS -->
            <div class="issued-container">
                <div class="proporsal-text">
                    Atentamente,
                </div> <br>
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
            </div> <br><br>

            <!-- IMAGEN FINAL -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">IV.</span> METODOLOGÍA DE CAPACITACIÓN
                <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/met_capa.png'))) }}" alt="Imagen Final">

            </div>

        </div>
        
    </div>
</body>
</html>

