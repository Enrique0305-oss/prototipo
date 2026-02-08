<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización #{{ $cotizacion->numero_cotizacion }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* ENCABEZADO CON IMAGEN */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header-logo {
            margin-left:50px;
            width: 100%;
            height: 200px;
        }
        
        .header-logo img {
            max-width: 100%;
            height: auto;
        }
        
        .header-info {
            text-align: right;
            flex: 1;
        }
        
        .header-info h1 {
            font-size: 24px;
            margin-bottom: 5px;
            color: #2c3e50;
        }
        
        .header-info p {
            font-size: 12px;
            color: #666;
            margin: 3px 0;
        }
        
        /* TITULO Y DATOS */
        .title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0 20px;
        }
        
        /* SECCION CLIENTE */
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            background-color: #34495e;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .info-group {
            margin-bottom: 12px;
        }
        
        .info-label {
            font-weight: bold;
            color: #2c3e50;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 14px;
            color: #555;
        }
        
        /* TABLA DE DETALLES */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .table thead {
            background-color: #34495e;
            color: white;
        }
        
        .table th {
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
        }
        
        .table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            font-size: 13px;
        }
        
        .table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .table tbody tr:hover {
            background-color: #f0f0f0;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        /* TOTALES */
        .totals {
            margin-top: 30px;
            width: 100%;
        }
        
        .totals-row {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
            align-items: center;
        }
        
        .totals-content {
            text-align: right;
        }
        
        .totals-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;
            padding: 5px 0;
        }
        
        .totals-subtotal {
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        
        .totals-total {
            background-color: #2c3e50;
            color: white;
            font-weight: bold;
            font-size: 16px;
            padding: 10px;
            border-radius: 4px;
        }
        
        /* OBSERVACIONES */
        .observations {
            background-color: #ecf0f1;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin-top: 30px;
        }
        
        .observations-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .observations-text {
            font-size: 13px;
            color: #555;
            line-height: 1.5;
        }
        
        /* FOOTER */
        .footer {
            margin-top: 50px;
            border-top: 2px solid #2c3e50;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #666;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        /* VALIDEZ */
        .validity {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 12px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- ENCABEZADO CON INFO Y LOGOS -->
        <div class="header">
            <div class="header-logo">
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/encabezado.png'))) }}" alt="Logo Empresa">
        </div>
            
        <!-- <div class="header-info">
                <h1>QSC PLAGAS</h1>
                <p><strong>RUC:</strong> 20123456789</p>
                <p><strong>Teléfono:</strong> (01) 1234-5678</p>
                <p><strong>Email:</strong> cotizaciones@qscplagas.com</p>
        </div> -->
    </div>
        
        <!-- TITULO -->
        <div class="title">COTIZACIÓN</div>
        
        <!-- DATOS DE COTIZACIÓN -->
        <div class="section">
            <div class="info-grid">
                <div class="info-group">
                    <div class="info-label">Número de Cotización</div>
                    <div class="info-value">{{ $cotizacion->numero_cotizacion }}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Fecha de Emisión</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($cotizacion->fecha_emision)->format('d/m/Y') }}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Estado</div>
                    <div class="info-value">
                        <span style="background: 
                            @if($cotizacion->estado === 'Pendiente') #ffc107
                            @elseif($cotizacion->estado === 'Aceptada') #28a745
                            @else #dc3545 @endif;
                            color: white; padding: 3px 8px; border-radius: 3px;">
                            {{ $cotizacion->estado }}
                        </span>
                    </div>
                </div>
                <div class="info-group">
                    <div class="info-label">Tipo</div>
                    <div class="info-value">{{ $cotizacion->tipo_cotizacion }}</div>
                </div>
            </div>
        </div>
        
        <!-- DATOS DEL CLIENTE -->
        <div class="section">
            <div class="section-title">DATOS DEL CLIENTE</div>
            <div class="info-grid">
                <div class="info-group">
                    <div class="info-label">Empresa</div>
                    <div class="info-value">{{ $cotizacion->cliente->nombre_empresa }}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">RUC</div>
                    <div class="info-value">{{ $cotizacion->cliente->ruc }}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Rubro</div>
                    <div class="info-value">{{ $cotizacion->cliente->rubro }}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Dirección</div>
                    <div class="info-value">{{ $cotizacion->cliente->direccion ?? 'N/A' }}</div>
                </div>
            </div>
        </div>
        
        <!-- TABLA DE DETALLES -->
        <div class="section">
            <div class="section-title">DETALLE DE COTIZACIÓN</div>
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Descripción</th>
                        <th style="width: 15%;" class="text-right">Cantidad</th>
                        <th style="width: 15%;" class="text-right">Precio Unitario</th>
                        <th style="width: 20%;" class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($cotizacion->detalles as $detalle)
                    <tr>
                        <td>
                            @if($detalle->id_servicio)
                                <strong>{{ $detalle->servicio->nombre ?? 'N/A' }}</strong><br>
                                <small>{{ $detalle->descripcion_manual }}</small>
                            @else
                                {{ $detalle->descripcion_manual }}
                            @endif
                        </td>
                        <td class="text-right">{{ $detalle->cantidad }}</td>
                        <td class="text-right">S/ {{ number_format($detalle->precio_unitario, 2) }}</td>
                        <td class="text-right"><strong>S/ {{ number_format($detalle->cantidad * $detalle->precio_unitario, 2) }}</strong></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        <!-- TOTALES -->
        <div class="section">
            <div class="totals">
                <div class="totals-content">
                    <div class="totals-item totals-subtotal">
                        <span>Subtotal:</span>
                        <strong>S/ {{ number_format($cotizacion->subtotal ?? 0, 2) }}</strong>
                    </div>
                    <div class="totals-item">
                        <span>IGV (18%):</span>
                        <strong>S/ {{ number_format($cotizacion->igv ?? 0, 2) }}</strong>
                    </div>
                    <div class="totals-item totals-total">
                        <span>TOTAL:</span>
                        <span>S/ {{ number_format($cotizacion->total ?? 0, 2) }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- VALIDEZ -->
        <div class="validity">
            <strong>⚠️ Validez:</strong> Esta cotización tiene una validez de 30 días desde la fecha de emisión.
        </div>
        
        <!-- OBSERVACIONES -->
        @if($cotizacion->detalles->first()?->modalidad_sugerida || $cotizacion->detalles->first()?->frecuencia_sugerida)
        <div class="observations">
            <div class="observations-title">Observaciones y Recomendaciones:</div>
            <div class="observations-text">
                <ul style="margin-left: 20px;">
                    @foreach($cotizacion->detalles as $detalle)
                        @if($detalle->modalidad_sugerida)
                        <li><strong>Modalidad sugerida:</strong> {{ $detalle->modalidad_sugerida }}</li>
                        @endif
                        @if($detalle->frecuencia_sugerida)
                        <li><strong>Frecuencia sugerida:</strong> {{ $detalle->frecuencia_sugerida }}</li>
                        @endif
                    @endforeach
                </ul>
            </div>
        </div>
        @endif
        
        <!-- FOOTER -->
        <div class="footer">
            <p><strong>Gracias por confiar en nosotros</strong></p>
            <p>QSC PLAGAS - Soluciones Integrales en Control de Plagas</p>
            <p>Documento generado automáticamente | {{ date('d/m/Y H:i') }}</p>
        </div>
        
    </div>
</body>
</html>
