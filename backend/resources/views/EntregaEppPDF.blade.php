<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Constancia EPP {{ $entrega->numero_entrega }}</title>
    <style>
        @page {
            margin: 1.2cm 1.5cm;
            size: A4 portrait;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            color: #000;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #000;
            padding: 5px 8px;
            vertical-align: middle;
        }
        .label {
            font-weight: bold;
            background-color: #f2f2f2;
            text-transform: uppercase;
            font-size: 9px;
        }
        .text-center { text-align: center; }
        .bg-header { background-color: #D9E1F2; font-weight: bold; text-align: center; font-size: 9px; text-transform: uppercase; }
        .estado-entregado { color: #c27800; font-weight: bold; }
        .estado-devuelto { color: #006100; font-weight: bold; }
        .observation {
            padding: 8px 10px;
            border: 1px solid #ccc;
            margin-top: 8px;
            font-size: 9px;
            border-radius: 2px;
        }
        .no-border td, .no-border th { border: none; }
    </style>
</head>
<body>

    {{-- ENCABEZADO --}}
    <table style="margin-bottom: 0;">
        <tr>
            <td style="width: 22%; text-align: center; padding: 8px;">
                @if(file_exists(public_path('images/logo-orden.png')))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="130">
                @endif
            </td>
            <td style="width: 50%; text-align: center; padding: 10px;">
                <div style="font-size: 13px; font-weight: bold;">CONSTANCIA DE ENTREGA DE EPP</div>
                <div style="font-size: 11px; margin-top: 4px;">N° {{ $entrega->numero_entrega }}</div>
            </td>
            <td style="width: 28%; padding: 0;">
                <table style="margin: 0;">
                    <tr>
                        <td class="label" style="width: 45%;">Código</td>
                        <td class="text-center" style="width: 55%;">EPP-AC-001</td>
                    </tr>
                    <tr>
                        <td class="label">Fecha</td>
                        <td class="text-center">{{ date('d/m/Y') }}</td>
                    </tr>
                    <tr>
                        <td class="label">Versión</td>
                        <td class="text-center">01</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- DATOS DEL TÉCNICO --}}
    <table style="margin-top: -1px;">
        <tr>
            <td class="label" style="width: 18%;">Técnico</td>
            <td colspan="3" style="font-weight: bold;">{{ strtoupper($entrega->tecnico->nombre . ' ' . $entrega->tecnico->apellidos) }}</td>
        </tr>
        <tr>
            <td class="label">DNI</td>
            <td style="width: 32%;">{{ $entrega->tecnico->dni ?? '---' }}</td>
            <td class="label" style="width: 18%;">Especialidad</td>
            <td style="width: 32%;">{{ $entrega->tecnico->especialidad ?? '---' }}</td>
        </tr>
    </table>

    {{-- DATOS DE ENTREGA --}}
    <table style="margin-top: -1px;">
        <tr>
            <td class="label" style="width: 18%;">Fecha Entrega</td>
            <td class="text-center" style="width: 32%;">{{ \Carbon\Carbon::parse($entrega->fecha_entrega)->format('d/m/Y') }}</td>
            <td class="label" style="width: 18%;">Estado</td>
            <td class="text-center" style="width: 32%;">
                <span class="{{ $entrega->estado === 'Entregado' ? 'estado-entregado' : 'estado-devuelto' }}">
                    {{ strtoupper($entrega->estado) }}
                </span>
            </td>
        </tr>
        <tr>
            <td class="label">Motivo de Entrega</td>
            <td colspan="3">{{ $entrega->motivo_entrega ?? 'Primera Asignación' }}</td>
        </tr>
        @if($entrega->estado === 'Devuelto' && $entrega->fecha_devolucion)
        <tr>
            <td class="label">Fecha Devolución</td>
            <td class="text-center">{{ \Carbon\Carbon::parse($entrega->fecha_devolucion)->format('d/m/Y') }}</td>
            <td class="label">Recibido por</td>
            <td class="text-center">{{ $entrega->devolvedor ? $entrega->devolvedor->nombre . ' ' . ($entrega->devolvedor->apellidos ?? '') : '---' }}</td>
        </tr>
        @endif
    </table>

    {{-- TABLA DE EQUIPOS EPP --}}
    <table style="margin-top: 12px;">
        <thead>
            <tr>
                <th class="bg-header" style="width: 5%;">N°</th>
                <th class="bg-header" style="width: {{ $entrega->estado === 'Devuelto' ? '32%' : '52%' }};">Equipo / Descripción</th>
                <th class="bg-header" style="width: 10%;">Cantidad</th>
                <th class="bg-header" style="width: {{ $entrega->estado === 'Devuelto' ? '18%' : '33%' }};">Observación</th>
                @if($entrega->estado === 'Devuelto')
                <th class="bg-header" style="width: 13%;">Condición</th>
                <th class="bg-header" style="width: 22%;">Obs. Devolución</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @foreach($entrega->detalles as $index => $detalle)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ strtoupper($detalle->producto->descripcion ?? 'PRODUCTO') }}</td>
                <td class="text-center">{{ $detalle->cantidad }}</td>
                <td style="font-size: 9px;">{{ $detalle->observacion ?? '---' }}</td>
                @if($entrega->estado === 'Devuelto')
                <td class="text-center" style="font-size: 9px; font-weight: bold; {{ $detalle->condicion_devolucion === 'Malo' ? 'color:#dc2626;' : ($detalle->condicion_devolucion === 'Regular' ? 'color:#d97706;' : 'color:#16a34a;') }}">
                    {{ $detalle->condicion_devolucion ?? '---' }}
                </td>
                <td style="font-size: 9px;">{{ $detalle->observacion_devolucion ?? '---' }}</td>
                @endif
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- OBSERVACIONES --}}
    @if($entrega->observaciones)
    <div class="observation" style="background-color: #fef3cd;">
        <strong>Observaciones:</strong> {{ $entrega->observaciones }}
    </div>
    @endif

    @if($entrega->estado === 'Devuelto' && $entrega->motivo_devolucion)
    <div class="observation" style="background-color: #d4edda;">
        <strong>Motivo de Devolución:</strong> {{ $entrega->motivo_devolucion }}
    </div>
    @endif

    {{-- REGISTRADO POR --}}
    <div style="margin-top: 10px; font-size: 9px;">
        <strong>Registrado por:</strong> {{ $entrega->registrador->nombre ?? 'N/A' }} {{ $entrega->registrador->apellidos ?? '' }}
    </div>

    {{-- FIRMAS --}}
    <table class="no-border" style="margin-top: 70px;">
        <tr>
            <td style="width: 42%; text-align: center; padding-top: 0;">
                <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 15px;">
                    <strong>RESPONSABLE DE ALMACÉN</strong><br>
                    {{ $entrega->registrador->nombre ?? '' }} {{ $entrega->registrador->apellidos ?? '' }}
                </div>
            </td>
            <td style="width: 16%;">&nbsp;</td>
            <td style="width: 42%; text-align: center; padding-top: 0;">
                <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 15px;">
                    <strong>TÉCNICO RECEPTOR</strong><br>
                    {{ $entrega->tecnico->nombre ?? '' }} {{ $entrega->tecnico->apellidos ?? '' }}
                </div>
            </td>
        </tr>
    </table>

    <div style="margin-top: 25px; font-size: 7px; text-align: center; color: #999;">
        Documento generado el {{ date('d/m/Y H:i:s') }} — Sistema de Gestión
    </div>

</body>
</html>
