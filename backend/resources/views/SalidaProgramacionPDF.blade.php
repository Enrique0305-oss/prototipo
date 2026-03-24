<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Acta de Entrega - Programación #{{ $prog->id }}</title>
    <style>
        @page { margin: 1.2cm; }
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #111827;
            margin: 0;
        }
        .card {
            border: 1px solid #111827;
            margin-bottom: 8px;
        }
        .header {
            background: #e5e7eb;
            border-bottom: 1px solid #111827;
            padding: 8px;
            text-align: center;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .meta {
            width: 100%;
            border-collapse: collapse;
        }
        .meta td {
            border: 1px solid #111827;
            padding: 6px;
            vertical-align: top;
        }
        .lbl { font-weight: 700; text-transform: uppercase; color: #374151; }
        table.grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table.grid th,
        table.grid td {
            border: 1px solid #111827;
            padding: 6px;
        }
        table.grid th {
            background: #dbeafe;
            text-transform: uppercase;
            font-size: 10px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .signs {
            width: 100%;
            margin-top: 30px;
        }
        .sign-col {
            width: 48%;
            display: inline-block;
            vertical-align: top;
            text-align: center;
        }
        .line {
            border-top: 1px solid #111827;
            margin: 42px 20px 6px;
        }
        .note {
            margin-top: 14px;
            border: 1px solid #111827;
            padding: 8px;
            font-size: 10px;
            background: #f9fafb;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">Acta de Entrega de Materiales</div>
        <table class="meta">
            <tr>
                <td style="width:50%;">
                    <div><span class="lbl">Programación:</span> #{{ $prog->id }}</div>
                    <div><span class="lbl">Cliente:</span> {{ $prog->ordenServicio->cliente->nombre_empresa ?? $prog->ordenServicio->cliente->persona_contacto ?? '---' }}</div>
                    <div><span class="lbl">Servicio:</span> {{ $prog->servicio->nombre ?? '---' }}</div>
                    <div><span class="lbl">Técnico:</span> {{ $prog->tecnico ? ($prog->tecnico->nombre . ' ' . $prog->tecnico->apellidos) : '---' }}</div>
                </td>
                <td style="width:50%;">
                    <div><span class="lbl">Fecha Programada:</span> {{ $prog->fecha_programada ? \Carbon\Carbon::parse($prog->fecha_programada)->format('d/m/Y') : '---' }}</div>
                    <div><span class="lbl">Hora:</span> {{ $prog->hora_inicio ? \Carbon\Carbon::parse($prog->hora_inicio)->format('H:i') : '--:--' }}</div>
                    <div><span class="lbl">Planta:</span> {{ $prog->planta->nombre ?? 'GENERAL' }}</div>
                    <div><span class="lbl">Área:</span> {{ $prog->area->nombre ?? 'GENERAL' }}</div>
                    <div><span class="lbl">Emitido:</span> {{ now()->format('d/m/Y H:i') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="grid">
        <thead>
            <tr>
                <th style="width:8%;">N°</th>
                <th style="width:52%;">Producto</th>
                <th style="width:20%;">Cantidad Entregada</th>
                <th style="width:20%;">Unidad</th>
            </tr>
        </thead>
        <tbody>
            @forelse($insumos as $i => $ins)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td>{{ mb_strtoupper($ins->producto->descripcion ?? 'PRODUCTO') }}</td>
                    <td class="text-right">{{ number_format((float) ($ins->cantidad_utilizada ?? 0), 2) }}</td>
                    <td class="text-center">{{ mb_strtoupper($ins->producto->unidad_medida ?? '-') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center">No se registraron materiales entregados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="signs">
        <div class="sign-col">
            <div class="line"></div>
            <div><strong>ALMACÉN</strong></div>
            <div>Responsable de Entrega</div>
        </div>
        <div class="sign-col" style="float:right;">
            <div class="line"></div>
            <div><strong>TÉCNICO RECEPTOR</strong></div>
            <div>{{ $prog->tecnico ? ($prog->tecnico->nombre . ' ' . $prog->tecnico->apellidos) : '' }}</div>
        </div>
    </div>

    <div class="note">
        Documento generado automáticamente al confirmar la salida de materiales de la programación.
    </div>
</body>
</html>
