<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Auditoría {{ $orden->numero_orden }}</title>
    <style>
        @page { margin: 1.2cm; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th, td { border: 1px solid #000; padding: 6px; vertical-align: top; }
        .no-border, .no-border tr, .no-border td { border: none !important; }
        .label { font-weight: bold; background: #f2f2f2; width: 30%; }
        .title-row { background: #d9e2f3; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bg-blue { background-color: #d9e2f3; font-weight: bold; }
        .n-orden { color: #ff0000; font-size: 13px; font-weight: bold; }
        .observation-box { background-color: #fde9d9; border: 1px solid #000; padding: 8px; margin-top: 12px; font-size: 9px; }
    </style>
</head>
<body>
    @php
        $fechaServicio = $orden->fecha_servicio ? \Carbon\Carbon::parse($orden->fecha_servicio) : null;
        $fechaAceptacion = $orden->fecha_aceptacion ? \Carbon\Carbon::parse($orden->fecha_aceptacion) : null;
        $exponentes = $orden->exponentes && $orden->exponentes->count() > 0
            ? $orden->exponentes->map(fn($e) => trim(($e->nombre ?? '') . ' ' . ($e->apellidos ?? '')))->implode(', ')
            : ($orden->exponente ? trim(($orden->exponente->nombre ?? '') . ' ' . ($orden->exponente->apellidos ?? '')) : '---');
    @endphp

    <table class="no-border">
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

    <table>
        <tr class="bg-blue">
            <td style="width: 75%;" class="text-blue">ORDEN DE AUDITOR&Iacute;A</td>
            <td style="width: 25%; text-align: center;">
                <span class="n-orden">N&deg; {{ $orden->numero_orden }}</span>
            </td>
        </tr>
    </table>

    <div style="height: 22px; width: 100%;"></div>

    <table>
        <tr>
            <td class="label">CLIENTE</td>
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

    <table>
        <tr>
            <td class="label">FECHA ACEPTACI&Oacute;N DE COTIZACI&Oacute;N</td>
            <td class="text-center" colspan="3">{{ $fechaAceptacion ? $fechaAceptacion->format('d/m/Y') : '---' }}</td>
        </tr>
        <tr>
            <td class="label" style="width: 25%;">FECHA DE AUDITOR&Iacute;A</td>
            <td colspan="3" class="text-center">{{ $fechaServicio ? $fechaServicio->format('d/m/Y') : 'POR DEFINIR' }}</td>
        </tr>
        <tr>
            <td class="label">HORA INICIO</td>
            <td class="text-center" colspan="3">{{ $orden->hora_servicio ? \Carbon\Carbon::parse($orden->hora_servicio)->format('H:i') : 'POR DEFINIR' }}</td>
        </tr>
        <tr>
            <td class="label">HORA FIN</td>
            <td class="text-center" colspan="3">{{ $orden->hora_fin_auditoria ? \Carbon\Carbon::parse($orden->hora_fin_auditoria)->format('H:i') : 'POR DEFINIR' }}</td>
        </tr>
        <tr>
            <td class="label">MODALIDAD</td>
            <td class="text-center" colspan="3">{{ mb_strtoupper($orden->modalidad ?? 'PRESENCIAL') }}</td>
        </tr>
        <tr>
            <td class="label">DURACI&Oacute;N (D&Iacute;AS)</td>
            <td class="text-center" colspan="3">{{ $orden->duracion_dias ?? 1 }}</td>
        </tr>
        <tr>
            <td class="label">TOTAL</td>
            <td class="text-center" colspan="3">S/. {{ number_format($orden->costo ?? 0, 2) }}</td>
        </tr>
    </table>

    <table>
        <tr class="title-row">
            <td colspan="2">AUDITOR&Iacute;A</td>
        </tr>
        <tr>
            <td class="label">TEMA / SERVICIO</td>
            <td>
                @php
                    $detalle = $orden->cotizacion ? $orden->cotizacion->detalles->first() : null;
                    $nombreServicio = $detalle ? 
                        ($detalle->catalogoCapAud ? $detalle->catalogoCapAud->nombre : 
                        ($detalle->servicio ? $detalle->servicio->nombre : 
                        ($detalle->descripcion_manual ?? '---'))) 
                        : ($orden->servicio->nombre ?? '---');
                @endphp
                {{ mb_strtoupper($nombreServicio) }}
            </td>
        </tr>
        <tr>
            <td class="label">EXPERTO(S)</td>
            <td>{{ $exponentes ?: '---' }}</td>
        </tr>
    </table>

    <div class="observation-box">
        <strong>OBSERVACIONES:</strong> El precio {{ $orden->incluye_igv ? 'Sí' : 'NO' }} incluye IGV.
        @if($orden->observaciones)
            <br>{{ $orden->observaciones }}
        @endif
    </div>

    <div style="margin-top: 15px; font-size: 10px; font-style: italic;">
        <strong>Emitido por:</strong>
        {{ mb_strtoupper($orden->emisor->nombre ?? 'USUARIO NO ENCONTRADO') }}
        {{ mb_strtoupper($orden->emisor->apellidos ?? '') }}
    </div>

    <div style="margin-top: 12px; font-size: 9px;">
        <strong>Fecha de Impresi&oacute;n:</strong> {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>