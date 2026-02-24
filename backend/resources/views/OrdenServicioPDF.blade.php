<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Orden de Servicio {{ $orden->numero_orden }}</title>
    <style>
        @page { margin: 1cm; }
        body { font-family: 'Arial', sans-serif; font-size: 10px; color: #000; line-height: 1.2; background-color: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .page-container { background-color: white; width: 21cm; min-height: 29.7cm; padding: 1.5cm; box-shadow: 0 0 10px rgba(0,0,0,0.2); box-sizing: border-box; }
        
        @media print {
            body { background-color: white; padding: 0; }
            .page-container { width: 100%; box-shadow: none; padding: 0; margin: 0; }
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: -1px; }
        th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: middle; }
        
        .label { font-weight: bold; text-transform: uppercase; background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bg-blue { background-color: #d9e2f3; text-transform: uppercase; font-weight: bold; }
        
        /* Título de la ubicación (Planta Pradera) */
        .location-title {
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            padding: 8px;
            text-transform: uppercase;
        }

        .observation { background-color: #fde9d9; padding: 5px; border: 1px solid #000; margin-top: 10px; }
    </style>
</head>
<body>
<div class="page-container">
    <table>
        <tr>
            <td style="width: 25%; text-align: center;">
                @if(file_exists(public_path('images/logo-orden.png')))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="140">
                @endif
            </td>
            <td style="width: 50%; text-align: center; font-size: 14px; font-weight: bold;">
                ORDEN DE SERVICIO N° {{ $orden->numero_orden }}
            </td>
            <td style="width: 25%; padding: 0;">
                <table style="border: none;">
                    <tr><td class="label">Código</td><td class="text-center">OS-AC-001</td></tr>
                    <tr><td class="label">Fecha</td><td class="text-center">{{ date('d/m/Y') }}</td></tr>
                    <tr><td class="label">Versión</td><td class="text-center">{{ $orden->version ?? '01' }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <table>
        <tr><td class="label" style="width: 25%;">CLIENTE</td><td style="width: 75%; font-weight: bold;">{{ strtoupper($orden->cliente->nombre_empresa) }}</td></tr>
        <tr><td class="label">RUC</td><td>{{ $orden->cliente->ruc }}</td></tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">N° DE COTIZACION</td>
            <td style="width: 25%;" class="text-center">{{ $orden->cotizacion->numero_cotizacion ?? '---' }}</td>
            <td class="label" style="width: 20%;">COSTO TOTAL:</td>
            <td style="width: 30%; font-weight: bold;" class="text-right">S/. {{ number_format($orden->total_costo, 2) }}</td>
        </tr>
    </table>

    <table>
        <tr>
            <td class="label" style="width: 25%;">FECHA DE ACEPTACION</td>
            <td style="width: 25%;" class="text-center">{{ \Carbon\Carbon::parse($orden->fecha_aceptacion)->format('m/d/Y') }}</td>
            <td class="label" style="width: 25%;">FECHA TENTATIVA DE SERVICIO</td>
            <td style="width: 25%;" class="text-center">{{ $orden->fecha_tentativa ? \Carbon\Carbon::parse($orden->fecha_tentativa)->format('m/d/Y') : '---' }}</td>
        </tr>
    </table>

    <div class="location-title">
        {{ $orden->detalles->first()->local ?? 'UBICACIÓN GENERAL' }}
    </div>

    <table>
        <thead>
            <tr class="bg-blue">
                <th style="width: 10%;">Nº</th>
                <th style="width: 50%;">SERVICIO</th>
                <th style="width: 40%;">FRECUENCIA</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orden->detalles as $index => $detalle)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ strtoupper($detalle->servicio->nombre) }}</td>
                <td class="text-center">{{ strtoupper($detalle->frecuencia ?? 'A SOLICITUD DEL CLIENTE') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table>
        <thead>
            <tr class="bg-blue">
                <th style="width: 10%;">Nº</th>
                <th style="width: 50%;">PRODUCTOS / MATERIALES</th>
                <th style="width: 40%;">CANTIDAD</th>
                <!-- <th style="width: 20%;">OBSERVACIÓN</th> -->
            </tr>
        </thead>
        <tbody>
            @forelse($orden->productos as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                {{-- Accedemos a la descripción del producto --}}
                <td>{{ strtoupper($item->producto->descripcion ?? 'PRODUCTO NO DEFINIDO') }}</td>
                <td class="text-center">
                    {{ $item->cantidad }} 
                    <small>{{ $item->producto->unidad ?? '' }}</small>
                </td>
                <!-- <td class="text-center" style="font-size: 8px;">
                    {{ $item->observacion ?? '-' }}
                </td> -->
            </tr>
            @empty
            {{-- Filas vacías si no hay productos, para mantener la estética --}}
            <tr><td class="text-center">1</td><td></td><td></td><td></td></tr>
            <tr><td class="text-center">2</td><td></td><td></td><td></td></tr>
            @endforelse
        </tbody>
    </table>

    <!-- PREGUNTAR SI VAN A QUERER QUE EL COSTO TAMBIEN SE MUESTRE AHI -->
    <!-- <table>
        <tr>
            <td style="width: 60%; border: none;"></td>
            <td class="bg-blue text-center" style="width: 40%;">COSTO</td>
        </tr>
        <tr>
            <td style="border: none;"></td>
            <td class="text-center" style="font-weight: bold;">S/. {{ number_format($orden->total_costo, 2) }}</td>
        </tr>
    </table> -->

    <div class="observation">
        <strong>Observación:</strong> El precio {{ $orden->incluye_igv ? 'SI' : 'NO' }} incluye IGV
    </div>

    <div style="margin-top: 20px;">
        <strong>Emitido por:</strong> {{ $orden->emisor->nombre ?? 'N/A' }} {{ $orden->emisor->apellido ?? '' }}
    </div>
</div>
</body>
</html>