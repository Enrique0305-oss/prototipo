<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ficha Operacional {{ $ficha->id }}</title>
    <style>
        @page {
            margin: 1cm 1.2cm;
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
            padding: 4px 8px;
            vertical-align: middle;
        }
        .label {
            font-weight: bold;
            background-color: #f2f2f2;
            font-size: 9px;
        }
        .text-center { text-align: center; }
        .section-header {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
            padding: 4px 8px;
        }
        .bg-header {
            background-color: #D9E1F2;
            font-weight: bold;
            text-align: center;
            font-size: 9px;
            text-transform: uppercase;
        }
        .no-border td, .no-border th { border: none; }
        .footer-text {
            font-size: 7px;
            text-align: center;
            color: #999;
            margin-top: 15px;
        }
    </style>
</head>
<body>

    {{-- ENCABEZADO --}}
    <table style="margin-bottom: 0;">
        <tr>
            <td style="width: 15%; text-align: center; padding: 8px;">
                @if(file_exists(public_path('images/logo-orden.png')))
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo-orden.png'))) }}" width="100">
                @endif
            </td>
            <td style="width: 55%; text-align: center; padding: 10px;">
                <div style="font-size: 12px; font-weight: bold;">FORMATO OPERACIONAL</div>
                <div style="font-size: 10px; margin-top: 4px; font-weight: 600;">FICHA TÉCNICA DE EVALUACIÓN Y DESCRIPCIÓN DE ACTIVIDADES DE SANEAMIENTO AMBIENTAL</div>
            </td>
            <td style="width: 30%; padding: 0;">
                <table style="margin: 0;">
                    <tr>
                        <td class="label" style="width: 40%;">Código</td>
                        <td class="text-center" style="width: 60%;">FO-OP-001</td>
                    </tr>
                    <tr>
                        <td class="label">Fecha</td>
                        <td class="text-center">{{ $ficha->fecha ? \Carbon\Carbon::parse($ficha->fecha)->format('d/m/Y') : '---' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Versión</td>
                        <td class="text-center">02</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- DATOS GENERALES --}}
    <table style="margin-top: -1px;">
        <tr>
            <td class="label" style="width: 15%;">Cliente</td>
            <td style="width: 35%;">{{ $ficha->cliente ?? '---' }}</td>
            <td class="label" style="width: 15%;">Dirección</td>
            <td style="width: 35%;">{{ $ficha->direccion ?? '---' }}</td>
        </tr>
        <tr>
            <td class="label">Fecha</td>
            <td>{{ $ficha->fecha ? \Carbon\Carbon::parse($ficha->fecha)->format('d/m/Y') : '---' }}</td>
            <td class="label">Hora llegada</td>
            <td>{{ $ficha->hora_llegada ? \Carbon\Carbon::parse($ficha->hora_llegada)->format('H:i') : '---' }}</td>
        </tr>
        <tr>
            <td class="label">Hora inicio</td>
            <td>{{ $ficha->hora_inicio ? \Carbon\Carbon::parse($ficha->hora_inicio)->format('H:i') : '---' }}</td>
            <td class="label">Hora final</td>
            <td>{{ $ficha->hora_final ? \Carbon\Carbon::parse($ficha->hora_final)->format('H:i') : '---' }}</td>
        </tr>
        <tr>
            <td class="label">Giro</td>
            <td colspan="3">{{ $ficha->giro ?? '---' }}</td>
        </tr>
    </table>

    {{-- DIAGNÓSTICO --}}
    <table style="margin-top: -1px;">
        <tr>
            <td class="section-header">Diagnóstico</td>
        </tr>
        <tr>
            <td style="min-height: 50px; padding: 8px; white-space: pre-wrap;">{{ $ficha->diagnostico ?? 'Sin diagnóstico registrado' }}</td>
        </tr>
    </table>

    {{-- CONDICIÓN SANITARIA --}}
    <table style="margin-top: -1px;">
        <tr>
            <td class="section-header">Condición sanitaria de la zona circundante</td>
        </tr>
        <tr>
            <td style="min-height: 50px; padding: 8px; white-space: pre-wrap;">{{ $ficha->condicion_sanitaria ?? 'Sin condición registrada' }}</td>
        </tr>
    </table>

    {{-- ACTIVIDAD REALIZADA --}}
    <table style="margin-top: -1px;">
        <tr>
            <td class="section-header">Actividad realizada</td>
        </tr>
        <tr>
            <td style="padding: 8px;">
                @if(is_array($ficha->actividades_realizadas) && count($ficha->actividades_realizadas) > 0)
                    @php
                        $actividades = array_values($ficha->actividades_realizadas);
                        $medioActividades = (int) ceil(count($actividades) / 2);
                        $actividadesCol1 = array_slice($actividades, 0, $medioActividades);
                        $actividadesCol2 = array_slice($actividades, $medioActividades);
                    @endphp
                    <table style="border: none; width: 100%;">
                        <tr>
                            <td style="border: none; width: 50%; vertical-align: top; padding: 0 8px 0 0;">
                                <ul style="margin: 0; padding-left: 18px;">
                                    @foreach($actividadesCol1 as $actividad)
                                        <li>{{ $actividad }}</li>
                                    @endforeach
                                </ul>
                            </td>
                            <td style="border: none; width: 50%; vertical-align: top; padding: 0 0 0 8px;">
                                @if(count($actividadesCol2) > 0)
                                    <ul style="margin: 0; padding-left: 18px;">
                                        @foreach($actividadesCol2 as $actividad)
                                            <li>{{ $actividad }}</li>
                                        @endforeach
                                    </ul>
                                @endif
                            </td>
                        </tr>
                    </table>
                @else
                    Sin registros
                @endif
            </td>
        </tr>
    </table>

    {{-- TRATAMIENTO REALIZADO --}}
    <table style="margin-top: -1px;">
        <tr>
            <td class="section-header">Tratamiento realizado</td>
        </tr>
        <tr>
            <td style="padding: 8px;">
                @if(is_array($ficha->equipos) && count($ficha->equipos) > 0)
                    @php
                        $equipos = array_values($ficha->equipos);
                        $medioEquipos = (int) ceil(count($equipos) / 2);
                        $equiposCol1 = array_slice($equipos, 0, $medioEquipos);
                        $equiposCol2 = array_slice($equipos, $medioEquipos);
                    @endphp
                    <table style="border: none; width: 100%;">
                        <tr>
                            <td style="border: none; width: 50%; vertical-align: top; padding: 0 8px 0 0;">
                                <ul style="margin: 0; padding-left: 18px;">
                                    @foreach($equiposCol1 as $equipo)
                                        <li>{{ $equipo }}</li>
                                    @endforeach
                                </ul>
                            </td>
                            <td style="border: none; width: 50%; vertical-align: top; padding: 0 0 0 8px;">
                                @if(count($equiposCol2) > 0)
                                    <ul style="margin: 0; padding-left: 18px;">
                                        @foreach($equiposCol2 as $equipo)
                                            <li>{{ $equipo }}</li>
                                        @endforeach
                                    </ul>
                                @endif
                            </td>
                        </tr>
                    </table>
                @else
                    Sin registros
                @endif
            </td>
        </tr>
    </table>

    {{-- INFORMACIÓN DE INSUMOS UTILIZADOS --}}
    <table style="margin-top: -1px;">
        <tr>
            <td colspan="7" class="section-header" style="text-transform: uppercase;">Información de Insumos Utilizados</td>
        </tr>
        <tr>
            <th class="bg-header" style="width: 20%;">Producto</th>
            <th class="bg-header" style="width: 14%;">Método</th>
            <th class="bg-header" style="width: 14%;">Lote</th>
            <th class="bg-header" style="width: 14%;">Fecha Vcto.</th>
            <th class="bg-header" style="width: 12%;">Unid. Medida</th>
            <th class="bg-header" style="width: 13%;">Concentración</th>
            <th class="bg-header" style="width: 13%;">Cant. Usada</th>
        </tr>
        @if(is_array($ficha->insumos_utilizados) && count($ficha->insumos_utilizados) > 0)
            @foreach($ficha->insumos_utilizados as $insumo)
                <tr>
                    <td>{{ $insumo['producto'] ?? '---' }}</td>
                    <td>{{ $insumo['metodo'] ?? '---' }}</td>
                    <td>{{ $insumo['lote'] ?? '---' }}</td>
                    <td class="text-center">{{ $insumo['fecha_vencimiento'] ?? ($insumo['fechaVencimiento'] ?? ($insumo['vencimiento'] ?? ($insumo['fechaVencim'] ?? '---'))) }}</td>
                    <td class="text-center">{{ $insumo['unidad_medida'] ?? ($insumo['unidad'] ?? '---') }}</td>
                    <td class="text-center">{{ $insumo['concentracion'] ?? '---' }}</td>
                    <td class="text-center">{{ $insumo['cantidad_usada'] ?? ($insumo['cantidad'] ?? '---') }}</td>
                </tr>
            @endforeach
        @else
            <tr>
                <td colspan="7" class="text-center" style="color: #666;">Sin insumos registrados</td>
            </tr>
        @endif
    </table>

    {{-- ÁREAS TRATADAS --}}
    <table style="margin-top: 8px;">
        <tr>
            <td class="section-header">Áreas tratadas</td>
        </tr>
        <tr>
            <td style="padding: 8px;">
                @if(is_array($ficha->areas_tratadas) && count($ficha->areas_tratadas) > 0)
                    @php
                        $areas = array_values($ficha->areas_tratadas);
                        $medioAreas = (int) ceil(count($areas) / 2);
                        $areasCol1 = array_slice($areas, 0, $medioAreas);
                        $areasCol2 = array_slice($areas, $medioAreas);
                    @endphp
                    <table style="border: none; width: 100%;">
                        <tr>
                            <td style="border: none; width: 50%; vertical-align: top; padding: 0 8px 0 0;">
                                <ul style="margin: 0; padding-left: 18px;">
                                    @foreach($areasCol1 as $area)
                                        <li>{{ $area }}</li>
                                    @endforeach
                                </ul>
                            </td>
                            <td style="border: none; width: 50%; vertical-align: top; padding: 0 0 0 8px;">
                                @if(count($areasCol2) > 0)
                                    <ul style="margin: 0; padding-left: 18px;">
                                        @foreach($areasCol2 as $area)
                                            <li>{{ $area }}</li>
                                        @endforeach
                                    </ul>
                                @endif
                            </td>
                        </tr>
                    </table>
                @else
                    Sin registros
                @endif
            </td>
        </tr>
    </table>

    {{-- ACCIONES CORRECTIVAS Y RECOMENDACIONES --}}
    <table style="margin-top: 8px;">
        <tr>
            <td class="section-header" style="width: 50%;">Acciones correctivas</td>
            <td class="section-header" style="width: 50%;">Recomendaciones</td>
        </tr>
        <tr>
            <td style="min-height: 45px; padding: 8px; white-space: pre-wrap;">{{ $ficha->acciones_correctivas ?? 'Sin acciones registradas' }}</td>
            <td style="min-height: 45px; padding: 8px; white-space: pre-wrap;">{{ $ficha->recomendaciones ?? 'Sin recomendaciones registradas' }}</td>
        </tr>
    </table>

    {{-- PERSONAL TÉCNICO Y FIRMAS --}}
    @php
        $firmas = is_array($ficha->firmas) ? $ficha->firmas : [];
        $tecnicoNombre = $tecnicoPrincipalNombre
            ?? ($firmas['tecnico_nombre'] ?? ($firmas['nombre_tecnico'] ?? ($firmas['tecnico'] ?? ($firmas['responsable_tecnico'] ?? '---'))));
        if (is_string($tecnicoNombre) && strpos($tecnicoNombre, ',') !== false) {
            $tecnicoNombre = trim(explode(',', $tecnicoNombre)[0]);
        }
        $clienteNombre = $firmas['cliente_nombre'] ?? ($firmas['nombre_cliente'] ?? ($firmas['representante_cliente'] ?? ($firmas['cliente'] ?? ($ficha->cliente ?? '---'))));
        $firmaTecnico = $firmas['tecnico_firma'] ?? ($firmas['firma_tecnico'] ?? ($firmas['firma_responsable_tecnico'] ?? ''));
        $firmaCliente = $firmas['cliente_firma'] ?? ($firmas['firma_cliente'] ?? ($firmas['firma_representante_cliente'] ?? ''));
    @endphp
    <table style="margin-top: 8px;">
        <tr>
            <td colspan="4" class="section-header">Personal técnico</td>
        </tr>
        <tr>
            <td class="label" style="width: 12%;">Nombre:</td>
            <td style="width: 38%;">{{ $tecnicoNombre }}</td>
            <td class="label" style="width: 12%;">Nombre:</td>
            <td style="width: 38%;">{{ $clienteNombre }}</td>
        </tr>
        <tr>
            <td class="label">Firma:</td>
            <td style="height: 95px;"></td>
            <td class="label">Firma:</td>
            <td style="height: 95px;"></td>
        </tr>
        <tr>
            <td colspan="2" class="text-center" style="font-size: 9px; font-weight: bold; background: #f8f8f8;">Responsable de QSCI Pest Control</td>
            <td colspan="2" class="text-center" style="font-size: 9px; font-weight: bold; background: #f8f8f8;">Representante del cliente</td>
        </tr>
    </table>

    {{-- PIE DE PÁGINA DE EMPRESA --}}
    <table style="margin-top: 8px;">
        <tr>
            <td class="text-center" style="padding: 8px; font-size: 9px;">
                <div style="font-weight: bold;">Multitasking Servicios Generales S.A.C</div>
                <div>Telf. fijo: 01-6055976 &nbsp; Celular: 947702279 - 941300937</div>
                <div>Dirección: Av. 13 de enero Mz. H-V Lt.02 APV Inca Manco Cápac - SJL &nbsp; Correo: contacto@qsciconsulting.com</div>
            </td>
        </tr>
    </table>

    {{-- OBSERVACIONES --}}
    @if($ficha->observaciones)
    <div style="margin-top: 8px; padding: 6px 10px; border: 1px solid #ccc; border-radius: 2px; font-size: 9px;">
        <strong>Observaciones:</strong> {{ $ficha->observaciones }}
    </div>
    @endif

    <div class="footer-text">
        Documento generado el {{ date('d/m/Y H:i:s') }} — Sistema de Gestión QSCI
    </div>

</body>
</html>
