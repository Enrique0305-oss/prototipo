<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Orden de Capacitación/Auditoría {{ $orden->numero_orden }}</title>
    <style>
        @page { margin: 1cm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; color: #000; line-height: 1.4; }
        
        /* Contenedor principal para simular la hoja */
        .page-container { width: 100%; }

        /* Estilos de Tabla */
        table { width: 100%; border-collapse: collapse; margin-bottom: -1px; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 6px; vertical-align: middle; word-wrap: break-word; }
        
        /* Formato de Textos */
        .label { font-weight: bold; background-color: #f2f2f2; text-transform: uppercase; width: 120px; }
        .text-center { text-align: center; }
        .text-blue { color: #1e4ba1; font-weight: bold; }
        .header-main-title { font-size: 14px; font-weight: bold; color: #1e4ba1; text-align: center; }
        .bg-blue-light { background-color: #d9e2f3; }
        .n-orden { color: #ff0000; font-size: 14px; font-weight: bold; }

        /* Espaciado para la sección de firmas o notas */
        .observation-box { background-color: #fde9d9; border: 1px solid #000; padding: 10px; margin-top: 15px; }
    </style>
</head>
<body>
<div class="page-container">
    
    <table>
        <tr>
            <td style="width: 30%; text-align: center;">
                @php $pathLogo = public_path('images/logo.png'); @endphp
                @if(file_exists($pathLogo))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($pathLogo)) }}" width="150">
                @else
                    <div style="font-weight: bold; color: #1e4ba1; font-size: 14px;">QSCIGROUP</div>
                @endif
            </td>
            <td style="width: 45%;" class="header-main-title">
                ORDEN DE SERVICIO DE<br>CAPACITACIONES Y AUDITORÍAS
            </td>
            <td style="width: 25%; text-align: center;">
                @php $pathIso = public_path('images/logo-orden.png'); @endphp
                @if(file_exists($pathIso))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents($pathIso)) }}" width="100">
                @else
                    <span style="font-size: 8px; color: #ccc;">LOGO ISO</span>
                @endif
            </td>
        </tr>
    </table>

    <table>
        <tr class="bg-blue-light">
            <td style="width: 75%;" class="text-blue">ORDEN DE SERVICIO DE CAPACITACIONES Y AUDITORÍAS</td>
            <td style="width: 25%; text-align: center;">
                <span class="n-orden">N° {{ $orden->numero_orden }}</span>
            </td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label">RUC</td>
            <td>{{ $orden->cliente->ruc }}</td>
            <td class="label">SEDE</td>
            <td>{{ strtoupper($orden->sede ?? 'Principal') }}</td>
        </tr>
        <tr>
            <td class="label">DIRECCIÓN</td>
            <td colspan="3">{{ strtoupper($orden->cliente->direccion) }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label">FECHA</td>
            <td class="text-center" style="width: 20%;">{{ \Carbon\Carbon::parse($orden->fecha_aceptacion)->format('d/m/Y') }}</td>
            <td class="text-center" style="font-weight: bold;">
                {{ \Carbon\Carbon::parse($orden->fecha_aceptacion)->isoFormat('DD [DE] MMMM [DEL] YYYY') }}
            </td>
        </tr>
        <tr>
            <td class="label">HORA</td>
            <td colspan="2" class="text-center">
                {{ $orden->hora_inicio ?? '9:00 a.m.' }} - {{ $orden->hora_fin ?? '11:00 a.m.' }}
            </td>
        </tr>
    </table>

    <table>
        <tr class="bg-blue-light">
            <td style="width: 40%;" class="text-blue">SERVICIO</td>
            <td style="width: 60%;" class="text-blue text-center">DISPOSICIÓN</td>
        </tr>
        <tr>
            <td class="label">PONENTE / AUDITOR</td>
            <td class="text-center">{{ strtoupper($orden->ponente_nombre ?? '---') }}</td>
        </tr>
        <tr>
            <td class="label">MODALIDAD</td>
            <td class="text-center">{{ strtoupper($orden->modalidad ?? 'PRESENCIAL') }}</td>
        </tr>
        <tr>
            <td class="label">PARTICIPANTES</td>
            <td class="text-center">{{ $orden->numero_participantes ?? '---' }} PERSONAS</td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label" style="text-align: center;">TOTAL EMITIDOS</td>
            <td class="text-center">{{ strtoupper($orden->capacitacion_nombre ?? 'CURSO/AUDITORÍA NO ESPECIFICADA') }}</td>
        </tr>
        <tr>
            <td class="label" style="text-align: center;">RESPONSABLE</td>
            <td class="text-center">{{ strtoupper($orden->emisor->nombre ?? '') }} {{ strtoupper($orden->emisor->apellido ?? '') }}</td>
        </tr>
    </table>

    <div class="observation-box">
        <strong>OBSERVACIONES:</strong> El precio {{ $orden->incluye_igv ? 'SÍ' : 'NO' }} incluye IGV. <br>
        {{ $orden->observaciones_generales }}
    </div>

    <div style="margin-top: 10px; font-size: 9px;">
        <strong>Emitido por:</strong> {{ $orden->emisor->nombre ?? 'N/A' }} {{ $orden->emisor->apellido ?? '' }} <br>
        <strong>Fecha de Impresión:</strong> {{ date('d/m/Y H:i:s') }}
    </div>

</div>
</body>
</html>