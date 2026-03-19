<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $cotizacion->numero_cotizacion }}</title>
    <style>
@include('cotizaciones.pdf.partials.styles-common')

@include('cotizaciones.pdf.partials.styles-servicio')
    </style>
</head>
<body>
    <header>
        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" class="logo-small">
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
                        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" alt="QSCI">
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
        
        <!-- INFORMACIóN DEL CLIENTE -->
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
            $totalServicios = $cotizacion->detalles->count();
            $esSoloLimpieza = ($mostrarSeccionEspecial && $totalServicios === 1);
        @endphp
        <!-- PÃGINA DE PROPUESTA TÃ‰CNICA -->
        <div class="contenido-desplazado">
            
            <!-- NÃšMERO DE PROPUESTA Y FECHA -->
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
                <ul>
                    <li>INFORMACIÓN: La organización cumple con lso parámetros establecidos conforme DS 022 - 2001 SA del MInisterio de Salud que regula las actividades de Saneamiento Ambiental</li>
                    <li>Las actividades se realizarán en las siguiente dirección: {{ $cotizacion->cliente->direccion ?? 'No registrada' }}</li>
                </ul>
            </div>

            <!-- II. ESPECIFICACIONES DEL SERVICIO -->
            <div class="seccion-titulo">
                <span class="seccion-titulo-num">II.</span> SOBRE LOS SERVICIOS BRINDADOS
            </div>
            <div class="seccion-descripcion">
                    A continuación, se detallarán la lista de actividades incluidas en el servicio.
            </div>

            {{-- 2. SECCIÃ“N DINÃMICA DE IMÃGENES CUANDOS SEA SERVICIO DE LIMPIEZA --}}
            @if($mostrarSeccionEspecial)
                <div style="margin-top: 15px; text-align: center;">
                    <div style="margin-bottom: 10px; text-align: left;">
                        <strong style="font-size: 13px;">- SERVICIO PARA PRESTAR:</strong>
                        <p style="margin: 5px 0 15px 15px; font-size: 14px; color: #333;">LIMPIEZA DE RESERVORIO DE AGUA</p>
                        
                        <strong style="font-size: 13px;">- PROCEDIMIENTO DEL SERVICIO:</strong>
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
                        <strong style="font-size: 13px;">- PERSONAL ASIGNADO:</strong>
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

            <!-- II.1 CONTROL INTEGRADO DE PLAGAS -->
            <div class="proposal-text">
                <span class="seccion-titulo-num">2.1</span> Control Integrado de Plagas
                <p>2.1.1. El siguiente cuadro detalla actividades encaminadas de los servicios </p>
            </div>
            <table class="products-table" style="margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th>ACTIVIDAD</th>
                        <th>TRATAMIENTO</th>
                        <th>ÁREA</th>
                        <th>FRECUENCIA</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($cotizacion->detalles as $detalle)
                        @php
                            $servicio = $detalle->servicio;
                            $planta = $cotizacion->cliente->plantas()->find($detalle->id_cliente_planta);
                            $area = null;
                            if ($planta) {
                                $area = $planta->areasActivas()->find($detalle->id_cliente_planta_area) ?? $planta->areas()->find($detalle->id_cliente_planta_area);
                            }
                            $frecuencia = $detalle->frecuencia_sugerida ?? '';
                            
                            // Obtener productos asociados a este detalle
                            $productosDetalle = [];
                            if ($cotizacion->receta_servicio) {
                                foreach ($cotizacion->receta_servicio as $receta) {
                                    if (($receta['id_servicio'] ?? null) == $detalle->id_servicio) {
                                        $productosDetalle[] = $receta;
                                    }
                                }
                            }
                        @endphp
                        <tr>
                            <td style="font-weight: 600;">
                                {{ $servicio?->nombre ?? $detalle->descripcion_manual ?? 'N/A' }}
                            </td>
                            <td>
                                @if(count($productosDetalle) > 0)
                                    @foreach($productosDetalle as $prod)
                                        @php
                                            $producto = \App\Models\Producto::find($prod['id_producto'] ?? null);
                                            $equipo = $prod['equipo_descripcion'] ?? 'Sin equipo';
                                        @endphp
                                        <small>{{ $equipo }}: {{ $producto?->descripcion ?? 'Producto no encontrado' }}</small><br>
                                    @endforeach
                                @else
                                    Sin productos especificados
                                @endif
                            </td>
                            <td>
                                @if($planta)
                                    <strong>{{ $planta->nombre }}</strong>
                                    @if($area)
                                        <br><small>({{ $area->nombre }})</small>
                                    @endif
                                @else
                                    Por especificar
                                @endif
                            </td>
                            <td style="text-align: center;">
                                {{ $frecuencia ?: 'A solicitud' }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <!-- II.2 PRODUCTOS QUIMICOS DISPONIBLES -->
            @php
                $productosQuimicos = [];
                $recetaItems = $cotizacion->receta_servicio ?? [];
                
                if (count($recetaItems) > 0) {
                    foreach ($recetaItems as $item) {
                        if (isset($item['id_producto'])) {
                            $prod = \App\Models\Producto::with('categoria')->find($item['id_producto']);
                            // Solo incluir si la categoría es "Químicos"
                            if ($prod && $prod->categoria && stripos($prod->categoria->nombre, 'quimico') !== false) {
                                $productosQuimicos[$item['id_producto']] = $item['id_producto'];
                            }
                        }
                    }
                } else {
                    foreach ($cotizacion->detalles as $detalle) {
                        if ($detalle->id_producto) {
                            $prod = \App\Models\Producto::with('categoria')->find($detalle->id_producto);
                            // Solo incluir si la categoría es "Químicos"
                            if ($prod && $prod->categoria && stripos($prod->categoria->nombre, 'quimico') !== false) {
                                $productosQuimicos[$detalle->id_producto] = $detalle->id_producto;
                            }
                        }
                    }
                }
            @endphp
            
            @if(count($productosQuimicos) > 0)
                <div class="proporsal-text">
                    <span class="seccion-titulo-num">2.1.2</span> Productos disponibles para actividades de control
                </div>
                <table class="products-table" style="margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th>PRODUCTO</th>
                            <th>INGREDIENTE ACTIVO</th>
                            <th>PLAGA OBJETIVO</th>
                            <th>PRESENTACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($productosQuimicos as $prodId)
                            @php
                                $producto = \App\Models\Producto::find($prodId);
                            @endphp
                            @if($producto)
                                <tr>
                                    <td><strong>{{ $producto->descripcion }}</strong></td>
                                    <td>{{ $producto->ingre_activo ?? 'N/A' }}</td>
                                    <td>{{ $producto->plag_objetivo ?? 'N/A' }}</td>
                                    <td>{{ $producto->presentacion ?? 'N/A' }}</td>
                                </tr>
                            @endif
                        @endforeach
                    </tbody>
                </table>
            @endif

            <div class="proporsal-text">
                <span class="seccion-titulo-num">2.1.3</span> Documentación 
                @if($esSoloLimpieza)
                    <p>Relizamos nuestras actividades bajo estándares de BRC Foods Ver.9, 
                        AIB y FSSC 22000 por tanto, contamos con la siguiente documentación 
                        que es entregada al cliente:</p>
                        <ul>
                            <li>Ficha de Servicio</li>
                            <li>Certificado de Saneamiento Ambiental</li>
                            <li>Informe técnico de las actividades</li>
                        </ul>
                @else
                    <p>Relizamos nuestras actividades bajo estándares de BRC Foods Ver.9, 
                        AIB y FSSC 22000 por tanto, contamos con la siguiente documentación 
                        que es entregada al cliente:</p>
                        <ul>
                            <li>Ficha de Servicio</li>
                            <li>Certificado de Saneamiento Ambiental</li>
                            <li>Informe técnico de las actividades</li>
                            <li>Fichas técnicas de los productos</li>
                            <li>Soporte Programa Manejo Integrado de Plagas</li>
                            <li>Evaluación de riesgo de los establicimientos dentro del programa MIP 
                                con soporte bibliográfico</li>
                            <li>Procedimiento General MIP y procedimiento de actividades específicas</li>
                            <li>Registros de monitoreo por plaga objetivo</li>
                            <li>Sabana de planes de acción bajo el estándar de inspecciones DIGESA y auditorias 
                                Internacionales</li>
                            <li>Informe detallado con indicadores</li>
                        </ul>
                @endif
            </div>
            <div class="proporsal-text">
                <span class="seccion-titulo-num">2.1.4</span> Salud Ocupacional 
                @if($esSoloLimpieza)
                    <p>Nuestro personal se presenta en sus instalaciones con la copia del SCTR vigente, 
                        además de contar con:</p>
                    <ul>
                        <li>Exámenes Médicos Ocupacionales</li>
                        <li>Programa de Seguridad y Salud en el trabajo</li>
                        <li>Capacitación en Manejo Integrado de Plagas</li>
                        <li>Capacitación en BPM</li>
                    </ul>
                @else
                    <p>Nuestro personal se presenta en sus instalaciones con la copia del SCTR vigente, 
                        además de contar con:</p>
                    <ul>
                        <li>Programa de Seguridad y Salud en el trabajo</li>
                        <li>Exámenes de ETAS</li>
                        <li>Capacitación en Manejo Integrado de Plagas</li>
                        <li>Capacitación en Auditorías Internos en BRC Foods Ver.9</li>
                        <li>Capacitación en Manipulación de Productos Químicos</li>
                        <li>Capacitación en BPM</li>
                    </ul>
                @endif
            </div>

             <!-- III. PROPUESTA ECONÓMICA -->

            <div class="seccion-titulo">
                <span class="seccion-titulo-num">III.</span> PROPUESTA ECONÓMICA
            </div>
            <div class="seccion-descripcion">
                    El siguiente cuadro muestra la respectiva cotización por el servicio brindado:
            </div>
            <div class="products-title">Detalle de Servicios</div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">SERVICIO</th>
                        <th style="width: 25%;">FRECUENCIA</th>
                        <th style="width: 25%;">PRECIO</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($cotizacion->detalles as $detalle)
                    <tr>
                        <td>
                            <strong>{{ $detalle->servicio->nombre ?? $detalle->descripcion_manual ?? 'N/A' }}</strong>
                        </td>
                        <td style="text-align: center;">
                            {{ $detalle->frecuencia_sugerida ?? 'A solicitud' }}
                        </td>
                        <td style="text-align: right;">
                            <strong>S/ {{ number_format($detalle->precio_unitario, 2) }}</strong>
                        </td>
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

                <p class="payment-header-text" style="font-size: 14px; margin-bottom: 5px;">IV CONSIDERACIONES</p>
                <ul>
                    @if($esSoloLimpieza)
                        <li>El cliente debe garantizar el acceso a las áreas que serán objeto del control para el día que se programe
                        la actividad</li>
                        <li>El cliente debe garantizar el acceso a las áreas que serán objeto del control para el día que se programe
                        la actividad</li>
                        <li>El presupuesto se basa en la metodología actualmente vigente. Sin embargo, si se determina que es 
                        necesario evaluar otras opciones de eliminación mediante an+alisis de tendencia, se aplcar+a un recargo adicional correspondiente</li>
                        <li>Vigencia de la oferta: 15 días</li>
                    @else
                        <li>Mensualmente se evalúan los comportamientos de las plagas objeto del control con el propósito
                        de determinar la efectividad de las actividades y realizar las mejoras que correspondan para garantizar 
                        mantener nuveles mínimos de presencia de plagas.</li>
                        <li>El cliente es responsale se seguir las recomendaciones y sugerencias que resulten de las actividades 
                        de inspección y control con el propósito de disminuir las condiciones que puedan favorecer el sustento y 
                        desarrollo de plagas.</li>
                        <li>El cliente debe garantizar el acceso a las áreas que serán objeto del control para el día que se programe
                        la actividad</li>
                        <li>Cualquier daño o deterioro de los dispositivos serán responsabilidad del cliente.</li>
                        <li>Los productos a usar pueden variar de acuerdo a la observación del especialista.</li>
                        <li>Los químicos son referenciales, ya que el especialista recomendará los cambios según la evaluación. que realice</li>
                        <li>El presupuesto se basa en la metodología actualmente vigente. Sin embargo, si se determina que es 
                        necesario evaluar otras opciones de eliminación mediante an+alisis de tendencia, se aplcar+a un recargo adicional correspondiente</li>
                        <li>Vigencia de la oferta: 15 días</li>
                    @endif
                </ul>
            </div>
            
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
            </div>
        </div>
        
    </div>
</body>
</html>

