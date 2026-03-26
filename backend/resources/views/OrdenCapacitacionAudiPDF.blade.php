<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Capacitaci&oacute;n/Auditor&iacute;a {{ $orden->numero_orden }}</title>
    <style>
        @page { margin: 1.2cm; }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            color: #000;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: -1px; }
        /* Regla general con una excepción */
        th, td { border: 1px solid #000; padding: 5px 6px; vertical-align: middle; }

        /* NUEVA CLASE: Quita bordes a la tabla y a sus celdas internas */
        .no-border, .no-border tr, .no-border td { 
            border: none !important; 
        }

        .label { font-weight: bold; background-color: #f2f2f2; text-transform: uppercase; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-blue { color: #1e4ba1; font-weight: bold; }
        .bg-blue { background-color: #d9e2f3; font-weight: bold; }
        .n-orden { color: #ff0000; font-size: 13px; font-weight: bold; }
        .observation-box { background-color: #fde9d9; border: 1px solid #000; padding: 8px; margin-top: 12px; font-size: 9px; }
    </style>
</head>
<body>
    @php
        // Meses en español para evitar dependencia de locale
        $meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        $fechaServicio = $orden->fecha_servicio ? \Carbon\Carbon::parse($orden->fecha_servicio) : null;
        $fechaAceptacion = $orden->fecha_aceptacion ? \Carbon\Carbon::parse($orden->fecha_aceptacion) : null;
        $fechaLarga = $fechaServicio
            ? $fechaServicio->day . ' de ' . $meses[$fechaServicio->month - 1] . ' del ' . $fechaServicio->year
            : '---';

        // Exponentes (nombres)
        $exponentesStr = $orden->exponentes->count() > 0
            ? $orden->exponentes->map(fn($e) => $e->nombre . ' ' . ($e->apellidos ?? ''))->implode(', ')
            : ($orden->ponente ? ($orden->ponente->nombre . ' ' . ($orden->ponente->apellidos ?? '')) : '---');

        // Servicio
        $servicioNombre = $orden->servicio->nombre ?? $orden->servicio_nombre ?? '---';
    @endphp

    {{-- ENCABEZADO --}}
    <table class="no-border" style="margin-bottom: 10px;">
        <tr>
            <td style="width: 25%; text-align: left">
                @php $pathLogo = public_path('images/qsci-capa.png'); @endphp
                @if(file_exists($pathLogo))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($pathLogo)) }}" width="240">
                @else
                    <div style="font-weight: bold; color: #1e4ba1; font-size: 14px;">QSCIGROUP</div>
                @endif
            </td>
            <td style="width: 25%; text-align: right">
                @php $pathIso = public_path('images/logo-calidad.png'); @endphp
                @if(file_exists($pathIso))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($pathIso)) }}" width="120">
                @else
                    <strong>QSCI</strong>
                @endif
            </td>
        </tr>
    </table>

    {{-- NÚMERO DE ORDEN --}}
    <table>
        <tr class="bg-blue">
            <td style="width: 75%;" class="text-blue">ORDEN DE SERVICIO DE CAPACITACIONES Y AUDITOR&Iacute;AS</td>
            <td style="width: 25%; text-align: center;">
                <span class="n-orden">N&deg; {{ $orden->numero_orden }}</span>
            </td>
        </tr>
    </table>

    {{-- ESPACIADOR DE SEGURIDAD --}}
    <div style="height: 22px; width: 100%;"></div>

    {{-- DATOS DEL CLIENTE --}}
    <table>
        <tr>
            <td class="label" style="width: 25%;">CLIENTE</td>
            <td colspan="3" style="font-weight: bold; text-align: center;">{{ mb_strtoupper($orden->cliente->nombre_empresa ?? '---') }}</td>
        </tr>
        <tr>
            <td class="label">RUC</td>
            <td colspan="3" style="text-align: center;">{{ $orden->cliente->ruc ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">DIRECCI&Oacute;N</td>
            <td colspan="3" style="text-align: center;">{{ mb_strtoupper($orden->cliente->direccion ?? '---') }}</td>
        </tr>
        <tr>
            <td class="label">N° COTIZACI&Oacute;N</td>
            <td colspan="3" style="text-align: center;">{{ $orden->cotizacion->numero_cotizacion ?? '---' }}</td>
        </tr>
    </table>

    {{-- FECHAS --}}
    <table>
        <tr>
            <td class="label">FECHA ACEPTACI&Oacute;N DE COTIZACI&Oacute;N</td>
            <td class="text-center" colspan="3">{{ $fechaAceptacion ? $fechaAceptacion->format('d/m/Y') : '---' }}</td>
        </tr>
        <tr>
            <td class="label" style="width: 25%;">FECHA TENTATIVA DEL SERVICIO</td>
            <td colspan="3" class="text-center">{{ $fechaServicio ? $fechaServicio->format('d/m/Y') : '---' }}</td>
            <!-- <td class="text-center" style="width: 25%;">{{ $fechaServicio ? $fechaServicio->format('d/m/Y') : '---' }}</td> -->
            <!-- <td class="text-center" style="width: 50%; font-weight: bold;">{{ mb_strtoupper($fechaLarga) }}</td> -->
        </tr>
        <tr>
            <td class="label">HORA</td>
            <td class="text-center" colspan="3">
                @if($orden->hora_servicio)
                    {{ \Carbon\Carbon::parse($orden->hora_servicio)->format('h:i a') }}
                @else
                    ---
                @endif
            </td>
        </tr>
        <tr>
            <td class="label">TOTAL</td>
            <td class="text-center" colspan="3">S/. {{ number_format($orden->costo ?? 0, 2) }}</td>
        </tr>
    </table>

    {{-- ESPACIADOR DE SEGURIDAD --}}
    <div style="height: 22px; width: 100%;"></div>

    {{-- DETALLES DEL SERVICIO --}}
    <table>
        <tr class="bg-blue">
            <td style="width: 40%;" class="text-blue">SERVICIO</td>
            <td class="text-center">{{ mb_strtoupper($servicioNombre) }}</td>
        </tr>
        <tr>
            <td class="label">PONENTES</td>
            <td class="text-center">{{ mb_strtoupper($exponentesStr) }}</td>
        </tr>
        <tr>
            <td class="label">HORAS DE CAPACITACION</td>
            <td class="text-center">{{ $orden->horas_capacitacion ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">MODALIDAD</td>
            <td class="text-center">{{ mb_strtoupper($orden->modalidad ?? 'PRESENCIAL') }}</td>
        </tr>
        <tr>
            <td class="label">N° PARTICIPANTES</td>
            <td class="text-center">{{ $orden->num_participantes ?? 0 }} PERSONAS</td>
        </tr>
        <tr>
            <td class="label">CERTIFICADOS</td>
            <td class="text-center">{{ $orden->num_certificados ?? 0 }}</td>
        </tr>
    </table>

    {{-- TABLA DE MATERIALES --}}
    <table style="margin-top: 10px;">
        <thead>
            <tr class="bg-blue">
                <td style="width: 50%;" class="text-blue">MATERIALES</td>
                <td style="width: 20%;" class="text-center text-blue">CANTIDAD</td>
                <td style="width: 30%;" class="text-center text-blue">DISPOSICIÓN</td>
            </tr>
        </thead>
        <tbody>
            @if($orden->materiales && $orden->materiales->count() > 0)
                @foreach($orden->materiales as $item)
                    <tr>
                        <td>{{ $item->material }}</td>
                        <td align="center">{{ $item->cantidad }}</td>
                        <td align="center">{{ $item->disposicion }}</td>
                    </tr>
                @endforeach
            @else
                <tr><td colspan="3" align="center">NO SE REGISTRARON MATERIALES</td></tr>
            @endif
        </tbody>
    </table>

    {{-- TABLA DE EQUIPOS AUDIOVISUALES --}}
    <table style="margin-top: 10px;">
        <thead>
            <tr class="bg-blue">
                <td style="width: 70%;" class="text-blue">EQUIPOS AUDIOVISUALES</td>
                <td style="width: 30%;" class="text-center text-blue">DISPOSICIÓN</td>
            </tr>
        </thead>
        <tbody>
            @if($orden->equipos && $orden->equipos->count() > 0)
                @foreach($orden->equipos as $item)
                    <tr>
                        <td>{{ $item->equipo }}</td>
                        <td align="center">{{ $item->disposicion }}</td> {{-- Sin colspan --}}
                    </tr>
                @endforeach
            @else
                <tr><td colspan="2" align="center">NO SE REGISTRARON EQUIPOS</td></tr> {{-- Colspan 2 aquí --}}
            @endif
        </tbody>
    </table>

    {{-- COSTOS --}}
    <!-- <table style="margin-top: 8px;">
        <tr>
            <td style="width: 60%; border: none;"></td>
            <td class="label text-right" style="width: 20%;">SUBTOTAL</td>
            <td class="text-right" style="width: 20%;">S/. {{ number_format($orden->subtotal ?? 0, 2) }}</td>
        </tr>
        @if($orden->incluye_igv)
        <tr>
            <td style="border: none;"></td>
            <td class="label text-right">IGV (18%)</td>
            <td class="text-right">S/. {{ number_format($orden->igv ?? 0, 2) }}</td>
        </tr>
        @endif
        <tr>
            <td style="border: none;"></td>
            <td class="label text-right" style="font-size: 11px;">TOTAL</td>
            <td class="text-right" style="font-size: 11px; font-weight: bold;">S/. {{ number_format($orden->costo ?? 0, 2) }}</td>
        </tr>
    </table> -->

    {{-- OBSERVACIONES --}}
    <div class="observation-box">
        <strong>OBSERVACIONES:</strong> El precio {{ $orden->incluye_igv ? 'Sí' : 'NO' }} incluye IGV.
        @if($orden->observaciones)
            <br>{{ $orden->observaciones }}
        @endif
    </div>

    {{-- EMITIDO POR --}}
    <div style="margin-top: 15px; font-size: 10px; font-style: italic;">
        <strong>Emitido por:</strong> 
        {{ mb_strtoupper($orden->emisor->nombre ?? 'USUARIO NO ENCONTRADO') }} 
        {{ mb_strtoupper($orden->emisor->apellidos ?? '') }}
    </div>

    {{-- PIE --}}
    <div style="margin-top: 12px; font-size: 9px;">
        <strong>Fecha de Impresi&oacute;n:</strong> {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>