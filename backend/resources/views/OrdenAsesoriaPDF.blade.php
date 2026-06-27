<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Asesoria {{ $orden->numero_orden }}</title>
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

        $temasOrden = $orden->detalles
            ->map(fn($d) => trim((string) ($d->item ?? '')))
            ->filter(fn($item) => $item !== '' && mb_strtolower($item) !== 'detalle')
            ->unique()
            ->values();

        $temasCotizacion = collect(optional($orden->cotizacion)->detalles ?? [])
            ->map(function ($d) {
                if (!empty($d->catalogoCapAud?->nombre)) {
                    return trim((string) $d->catalogoCapAud->nombre);
                }
                if (!empty($d->servicio?->nombre)) {
                    return trim((string) $d->servicio->nombre);
                }
                return trim((string) ($d->descripcion_manual ?? ''));
            })
            ->filter(fn($item) => $item !== '')
            ->unique()
            ->values();

        $temasAsesoria = $temasOrden->count() > 0 ? $temasOrden : $temasCotizacion;
    @endphp

    @php
    // Accedemos a la cotización a través de la relación de la orden
    $cotizacionRelacionada = $orden->cotizacion;
    
    // Obtenemos el primer detalle de esa cotización
    $detallePlan = $cotizacionRelacionada ? $cotizacionRelacionada->detalles->first() : null;
    
    // Extraemos los meses
    $tiempoImplementacion = $detallePlan?->meses_implementacion;
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

    {{-- NÚMERO DE ORDEN --}}
    <table>
        <tr class="bg-blue">
            <td style="width: 75%;" class="text-blue">ORDEN DE SERVICIO DE ASESORIA</td>
            <td style="width: 25%; text-align: center;">
                <span class="n-orden">N&deg; {{ $orden->numero_orden }}</span>
            </td>
        </tr>
    </table>

    {{-- ESPACIADOR DE SEGURIDAD --}}
    <div style="height: 10px; width: 100%;"></div>
    
    <table>
        <tr>
            <td class="label">Cliente</td>
            <td>{{ $orden->cliente->nombre_empresa ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">RUC</td>
            <td>{{ $orden->cliente->ruc ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">Nro Cotizacion</td>
            <td>{{ $orden->cotizacion->numero_cotizacion ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">Fecha Aceptacion</td>
            <td>{{ $fechaAceptacion ? $fechaAceptacion->format('d/m/Y') : '---' }}</td>
        </tr>
        <tr>
            <td class="label">Fecha Servicio</td>
            <td>{{ $fechaServicio ? $fechaServicio->format('d/m/Y') : '---' }}</td>
        </tr>
        <tr>
            <td class="label">Meses de implementación</td>
            <td>
                {{ $tiempoImplementacion ? $tiempoImplementacion . ($tiempoImplementacion == 1 ? ' mes' : ' meses') : '---' }}
            </td>
        </tr>
        <tr>
            <td class="label">Total</td>
            <td><strong>S/ {{ number_format($orden->costo ?? 0, 2) }}</strong></td>
        </tr>
    </table>

    <table>
        <tr class="title-row">
            <td colspan="2">ASESORIA</td>
        </tr>
        <tr>
            <td class="label">Modalidad</td>
            <td>{{ $orden->modalidad ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">Exponente(s)</td>
            <td>{{ $exponentes ?: '---' }}</td>
        </tr>
        <tr>
            <td class="label">Nro Participantes</td>
            <td>{{ $orden->num_participantes ?? 0 }}</td>
        </tr>
        <tr>
            <td class="label">Temas</td>
            <td>
                @if($temasAsesoria->count() > 0)
                    {!! $temasAsesoria->map(fn($tema, $i) => ($i + 1) . '. ' . e($tema))->implode('<br>') !!}
                @else
                    ---
                @endif
            </td>
        </tr>
        <tr>
            <td class="label">Certificados</td>
            <td>{{ $orden->num_certificados ?? 0 }}</td>
        </tr>
    </table>

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
        <strong>Fecha de Impresión:</strong> {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>
