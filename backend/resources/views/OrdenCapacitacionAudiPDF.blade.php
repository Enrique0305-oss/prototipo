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
        th, td { border: 1px solid #000; padding: 5px 6px; vertical-align: middle; }

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
    <table>
        <tr>
            <td style="width: 25%; text-align: center; padding: 8px;">
                @php $pathLogo = public_path('images/logo.png'); @endphp
                @if(file_exists($pathLogo))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($pathLogo)) }}" width="140">
                @else
                    <div style="font-weight: bold; color: #1e4ba1; font-size: 14px;">QSCIGROUP</div>
                @endif
            </td>
            <td style="width: 50%; text-align: center; font-size: 13px; font-weight: bold; color: #1e4ba1; padding: 8px;">
                ORDEN DE SERVICIO DE<br>CAPACITACIONES Y AUDITOR&Iacute;AS
            </td>
            <td style="width: 25%; text-align: center; padding: 8px;">
                @php $pathIso = public_path('images/logo-orden.png'); @endphp
                @if(file_exists($pathIso))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($pathIso)) }}" width="100">
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

    {{-- DATOS DEL CLIENTE --}}
    <table>
        <tr>
            <td class="label" style="width: 15%;">CLIENTE</td>
            <td colspan="3" style="font-weight: bold;">{{ mb_strtoupper($orden->cliente->nombre_empresa ?? '---') }}</td>
        </tr>
        <tr>
            <td class="label">RUC</td>
            <td>{{ $orden->cliente->ruc ?? '---' }}</td>
            <td class="label" style="width: 15%;">COTIZACI&Oacute;N</td>
            <td>{{ $orden->cotizacion->numero_cotizacion ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">DIRECCI&Oacute;N</td>
            <td colspan="3">{{ mb_strtoupper($orden->cliente->direccion ?? '---') }}</td>
        </tr>
    </table>

    {{-- FECHAS --}}
    <table>
        <tr>
            <td class="label" style="width: 25%;">FECHA DEL SERVICIO</td>
            <td class="text-center" style="width: 25%;">{{ $fechaServicio ? $fechaServicio->format('d/m/Y') : '---' }}</td>
            <td class="text-center" style="width: 50%; font-weight: bold;">{{ mb_strtoupper($fechaLarga) }}</td>
        </tr>
        <tr>
            <td class="label">FECHA ACEPTACI&Oacute;N</td>
            <td class="text-center" colspan="2">{{ $fechaAceptacion ? $fechaAceptacion->format('d/m/Y') : '---' }}</td>
        </tr>
        <tr>
            <td class="label">HORA</td>
            <td class="text-center" colspan="2">
                @if($orden->hora_servicio)
                    {{ \Carbon\Carbon::parse($orden->hora_servicio)->format('h:i a') }}
                @else
                    ---
                @endif
            </td>
        </tr>
    </table>

    {{-- DETALLES DEL SERVICIO --}}
    <table>
        <tr class="bg-blue">
            <td style="width: 40%;" class="text-blue">SERVICIO</td>
            <td style="width: 60%;" class="text-blue text-center">DETALLE</td>
        </tr>
        <tr>
            <td class="label">CAPACITACI&Oacute;N / AUDITOR&Iacute;A</td>
            <td class="text-center">{{ mb_strtoupper($servicioNombre) }}</td>
        </tr>
        <tr>
            <td class="label">EXPONENTE / AUDITOR</td>
            <td class="text-center">{{ mb_strtoupper($exponentesStr) }}</td>
        </tr>
        <tr>
            <td class="label">MODALIDAD</td>
            <td class="text-center">{{ mb_strtoupper($orden->modalidad ?? 'PRESENCIAL') }}</td>
        </tr>
        <tr>
            <td class="label">PARTICIPANTES</td>
            <td class="text-center">{{ $orden->num_participantes ?? 0 }} PERSONAS</td>
        </tr>
        <tr>
            <td class="label">CERTIFICADOS</td>
            <td class="text-center">{{ $orden->num_certificados ?? 0 }}</td>
        </tr>
    </table>

    {{-- COSTOS --}}
    <table style="margin-top: 8px;">
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
    </table>

    {{-- OBSERVACIONES --}}
    <div class="observation-box">
        <strong>OBSERVACIONES:</strong> El precio {{ $orden->incluye_igv ? 'Sí' : 'NO' }} incluye IGV.
        @if($orden->observaciones)
            <br>{{ $orden->observaciones }}
        @endif
    </div>

    {{-- PIE --}}
    <div style="margin-top: 12px; font-size: 9px;">
        <strong>Fecha de Impresi&oacute;n:</strong> {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>