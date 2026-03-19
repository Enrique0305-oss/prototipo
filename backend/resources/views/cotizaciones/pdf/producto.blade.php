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
            <strong>DOCUMENTO NÂ°:</strong> <span>{{ $cotizacion->numero_cotizacion }}</span>
            <div class="document-date">Fecha de emisiÃ³n: {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->format('d/m/Y') }}</div>
        </div>
        
        <!-- INFORMACIÃ“N DEL CLIENTE -->
        <div class="intro-section">
            <div class="client-info-list">
                <div class="info-item">
                    <span class="label">Ing.:</span>
                    <span class="value">{{ $cotizacion->cliente->persona_contacto }}</span>
                </div>

                <div class="info-item">
                    <span class="label">AtenciÃ³n:</span>
                    <span class="value">{{ $cotizacion->cliente->nombre_empresa }}</span>
                </div>

                <div class="info-item">
                    <span class="label">RUC:</span>
                    <span class="value">{{ $cotizacion->cliente->ruc }}</span>
                </div>

                <div class="info-item">
                    <span class="label">DirecciÃ³n:</span>
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
                                // Si hay mÃ¡s de 2, ponemos el nombre general
                                $textoMostrar = "servicio de Control de plagas";
                            } else {
                                // Si hay 1 o 2, los listamos separados por coma
                                $textoMostrar = $serviciosColeccion->implode(', ');
                            }
                        @endphp
                        
                        {{ $textoMostrar ?: 'AsesorÃ­a y Servicios Especializados' }}
                    </span>.
                </p>
                <p>
                    Nuestro servicio estÃ¡ inspirado en vuestra empresa y queremos acompaÃ±arlos en el 
                    cumplimiento de sus objetivos y alcance de la excelencia.
                </p>
                <p style="margin-top: 20px;">
                    Quedo a su entera disposiciÃ³n para cualquier consulta.
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
                        NÃºmero: {{ $cotizacion->creador->celular  }}
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
            
            <!-- NÃšMERO DE PROPUESTA Y FECHA -->
            <div class="propuesta-numero">
                NÃšMERO DE PROPUESTA &ndash; {{ $cotizacion->numero_cotizacion }}
            </div>
            <div class="propuesta-fecha">
                {{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->isoFormat('D [de] MMMM [de] YYYY') }}
            </div>

            <!-- I. PROPUESTA TÃ‰CNICA -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">I.</span> PROPUESTA TÃ‰CNICA
            </div>
            <div class="seccion-descripcion">
                Presentamos a su consideraciÃ³n la oferta econÃ³mica, a continuaciÃ³n, definiremos los componentes que hacen parte del alcance de la propuesta.
            </div>

            <!-- II. ESPECIFICACIONES DEL SERVICIO -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">II.</span> SOBRE LOS SERVICIOS BRINDADOS
            </div>
            <div class="seccion-descripcion">
                    A continuaciÃ³n, se detallarÃ¡n la lista de actividades incluidas en el servicio.
            </div>

            {{-- 2. SECCIÃ“N DINÃMICA DE IMÃGENES CUANDOS SEA SERVICIO DE LIMPIEZA --}}
            @if($mostrarSeccionEspecial)
                <div style="margin-top: 15px; text-align: center;">
                    <div style="margin-bottom: 10px; text-align: left;">
                        <strong style="font-size: 13px;">â€¢ SERVICIO PARA PRESTAR:</strong>
                        <p style="margin: 5px 0 15px 15px; font-size: 14px; color: #333;">LIMPIEZA DE RESERVORIO DE AGUA</p>
                        
                        <strong style="font-size: 13px;">â€¢ PROCEDIMIENTO DEL SERVICIO:</strong>
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
                        <strong style="font-size: 13px;">â€¢ PERSONAL ASIGNADO:</strong>
                    </div>
                </div>
            @endif
            <div class="proposal-text" style="margin-bottom: 20px;">
                @if($cotizacion->propuesta_tecnica)
                    {!! $cotizacion->propuesta_tecnica !!}
                @else
                    <p>Presentamos a su consideraciÃ³n la oferta econÃ³mica, a continuaciÃ³n, definiremos los componentes que hacen parte del alcance de la propuesta.</p>
                @endif
            </div>

            <!-- III. PROPUESTA ECONÃ“MICA -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">III.</span> PROPUESTA ECONÃ“MICA
            </div>
            <div class="seccion-descripcion">
                    El siguiente cuadro muestra la respectiva cotizaciÃ³n por el servicio brindado:
            </div>
            <div class="products-title">Detalle de Productos/Servicios</div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th>CÃ³digo</th>
                        <th style="width: 40%;">DescripciÃ³n</th>
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
                        Esta cotizaciÃ³n INCLUYE IGV (18%)
                    @else
                        Esta cotizaciÃ³n NO incluye IGV
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
                <p style="font-size: 12px; margin-bottom: 5px;"> - InformaciÃ³n de pago: Cuenta BCP</p>
                
                <table class="payment-table">
                    <tr>
                        <td class="label-cell">Cuenta BCP ahorro en soles</td>
                        <td>{{ $cotizacion->empresa->cuenta_bcp }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">CÃ³digo de cuenta interbancario</td>
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
                        <td class="label-cell">Banco de la NaciÃ³n Cuenta de DetracciÃ³n</td>
                        <td>{{ $cotizacion->empresa->banco_nacion }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">CÃ³digo de Cuenta Interbancario (DetracciÃ³n)</td>
                        <td>{{ $cotizacion->empresa->codigo_interbancario_nacion }}</td>
                    </tr>
                </table>
            </div>
        </div>
        
    </div>
</body>
</html>

