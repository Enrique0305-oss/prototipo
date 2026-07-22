<div style="page-break-after: always;">
    
    {{-- Banner --}}
    <div style="position: relative; margin-bottom: 20px;">
        <div style="background-color: #002060; color: white; text-align: center; font-weight: bold; padding: 10px; font-size: 14px; margin-right: 20px;">
            SERVICIO DE {{ strtoupper($tipo) }}
        </div>
        <div style="position: absolute; right: 0; top: 0; width: 0; height: 0; border-top: 18px solid transparent; border-bottom: 18px solid transparent; border-left: 20px solid #002060;"></div>
    </div>

    {{-- Tabla de Visitas --}}
    @if(isset($visitasGrupo) && count($visitasGrupo) > 0)
        <table class="content-table text-center" style="margin-bottom: 20px; width: 80%; margin-left: auto; margin-right: auto;">
            <tbody>
                <tr>
                    <td class="font-bold" style="background-color: #f2f2f2; width: 40%; text-align: left; padding-left: 10px;">N° DE VISITAS</td>
                    @foreach ($visitasGrupo as $index => $visita)
                        <td style="width: {{ 60 / count($visitasGrupo) }}%;">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</td>
                    @endforeach
                </tr>
                <tr>
                    <td class="font-bold" style="background-color: #f2f2f2; text-align: left; padding-left: 10px;">FECHA DE VISITAS</td>
                    @foreach ($visitasGrupo as $visita)
                        <td>{{ \Carbon\Carbon::parse($visita['fecha'] ?? '')->format('d/m/Y') }}</td>
                    @endforeach
                </tr>
                <tr>
                    <td class="font-bold" style="background-color: #f2f2f2; text-align: left; padding-left: 10px;">N° DE FICHAS</td>
                    @foreach ($visitasGrupo as $visita)
                        <td>{{ $visita['correlativo_ficha'] ?? '---' }}</td>
                    @endforeach
                </tr>
            </tbody>
        </table>
    @endif

    {{-- 1. Tabla de químicos utilizados --}}
    @php $quimicos = $limpieza['quimicos'] ?? []; @endphp
    <div style="font-weight:bold; font-size: 11px; color: #003366; margin-bottom: 10px;">1. INFORMACIÓN DE PRODUCTOS UTILIZADOS</div>
    @if(count($quimicos) > 0)
        @foreach($quimicos as $q)
            @php
                $chunksVisitas = array_chunk($q['visitas'] ?? [], 8);
            @endphp
            @foreach($chunksVisitas as $chunkIndex => $chunk)
                <table class="products-table text-center" style="margin-bottom: 10px; table-layout: fixed; width: 100%; word-wrap: break-word; font-size: 8px;">
                    <tr style="background-color: #1a3352; color: white;">
                        <td colspan="{{ count($chunk) + 1 }}">
                            DESINFECCIÓN QUÍMICA - {{ strtoupper($q['producto']) }} 
                            @if(count($chunksVisitas) > 1) (Parte {{ $chunkIndex + 1 }}) @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; width: 20%; font-size: 9px;">PRODUCTO QUIMICO</td>
                        <td colspan="{{ count($chunk) }}">{{ $q['producto'] }}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">ING. ACTIVO</td>
                        <td colspan="{{ count($chunk) }}">{{ $q['ingre_activo'] ?? '---' }}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">LOTE</td>
                        <td colspan="{{ count($chunk) }}">{{ $q['lote'] ?? '---' }}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">CONCENTRACIÓN</td>
                        <td colspan="{{ count($chunk) }}">{{ $q['concentracion'] ?? '---' }}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">CANTIDAD USADA</td>
                        @foreach($chunk as $v)
                            <td>{{ $v['cantidad'] ?? '---' }}</td>
                        @endforeach
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">MÉTODO</td>
                        <td colspan="{{ count($chunk) }}">{{ $q['metodo'] ?? '---' }}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">FECHA DE SERVICIO</td>
                        @foreach($chunk as $v)
                            <td>{{ $v['fecha'] ?? '---' }}</td>
                        @endforeach
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; font-weight: bold; font-size: 9px;">FICHA DE SERVICIO</td>
                        @foreach($chunk as $v)
                            <td>{{ $v['ficha'] ?? '---' }}</td>
                        @endforeach
                    </tr>
                </table>
            @endforeach
        @endforeach
    @else
        <div style="padding:8px;border:1px dashed #ccc;color:#666;margin-bottom:12px;">No se registraron químicos en la ficha.</div>
    @endif

    {{-- 2. Áreas aplicadas --}}
    @php $areasAplicadas = $limpieza['areas_aplicadas'] ?? []; @endphp
    <div style="font-weight:bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 8px;">2. ÁREAS DE DESARROLLO DE LA ACTIVIDAD</div>
    <div style="font-weight:bold; font-size: 11px; color: #003366; margin-left: 20px; margin-bottom: 10px;">2.1. ÁREAS DE APLICACIÓN / TRATAMIENTO</div>
    @if(count($areasAplicadas) > 0)
        <table style="width: 85%; margin: 0 auto 15px auto; border-collapse: collapse; border: 1px solid black; font-size: 11px;">
            <tr>
                <td style="background-color: #f2f2f2; font-weight: bold; text-align: center; width: 30%; border: 1px solid black; padding: 10px;">
                    ÁREAS<br>APLICADAS
                </td>
                <td style="padding: 10px; border: 1px solid black; vertical-align: middle;">
                    <ul style="margin: 0; padding-left: 20px;">
                        @foreach($areasAplicadas as $area)
                            <li style="margin-bottom: 5px;">{{ trim($area) }}</li>
                        @endforeach
                    </ul>
                </td>
            </tr>
        </table>
    @else
        <div style="padding:8px;border:1px dashed #ccc;color:#666;margin-bottom:12px;">Sin áreas registradas</div>
    @endif

    {{-- 3. Productos / Equipos utilizados (imágenes) --}}
    @php $productos = $limpieza['productos'] ?? []; @endphp
    <div style="font-weight:bold; font-size: 11px; color: #003366; margin-top: 15px; margin-bottom: 8px;">3. EQUIPOS E INSUMOS UTILIZADOS PARA LAS ACTIVIDADES</div>
    @if(count($productos) > 0)
        <table style="width:100%; border-collapse: separate; border-spacing: 10px; margin-bottom:14px;">
            @foreach(array_chunk($productos, 3) as $row)
                <tr>
                    @foreach($row as $p)
                        <td style="width:33%; text-align:center; border:1px solid #333; padding:8px;">
                            @if(!empty($p['base64']))
                                <img src="{{ $p['base64'] }}" style="max-width:140px; max-height:110px; display:block; margin:0 auto 6px;" />
                            @else
                                <div style="height:110px; display:flex; align-items:center; justify-content:center; color:#777;">Imagen no disponible</div>
                            @endif
                            <div style="font-size:9px; font-weight:bold; margin-top:6px;">{{ $p['titulo'] }}</div>
                        </td>
                    @endforeach
                    @if(count($row) < 3)
                        @for($i=0;$i<3-count($row);$i++)
                            <td style="width:33%; border:none;"></td>
                        @endfor
                    @endif
                </tr>
            @endforeach
        </table>
    @else
        <div style="padding:8px;border:1px dashed #ccc;color:#666;margin-bottom:14px;">No se encontraron imágenes de productos o equipos.</div>
    @endif

    {{-- 4. Evidencias fotográficas (fichas/evidencias del informe) --}}
    @php
        $evidencias = is_array($informe->evidencias) ? $informe->evidencias : [];
        $fotos = [];
        foreach($evidencias as $ev) {
            if (!is_array($ev)) continue;
            
            // Filtrar solo las evidencias correspondientes a este tipo de servicio
            $tipoServ = strtoupper(trim((string)($ev['tipo_servicio'] ?? '')));
            $currentTipo = strtoupper(trim((string)($tipo ?? '')));
            if ($tipoServ !== $currentTipo && !(($currentTipo === 'LIMPIEZA DE CISTERNAS' || $currentTipo === 'LIMPIEZA') && ($tipoServ === 'LIMPIEZA DE CISTERNAS' || $tipoServ === 'LIMPIEZA'))) continue;

            $url = trim((string)($ev['url'] ?? $ev['path'] ?? ''));
            if ($url === '') continue;
            $b64 = null;
            $b64 = isset($resolverHallazgoBase64) && is_callable($resolverHallazgoBase64) ? $resolverHallazgoBase64($url) : null;

            $fotos[] = ['base64' => $b64, 'descripcion' => $ev['descripcion'] ?? '', 'fecha' => $ev['fecha'] ?? ''];
        }
        $fotoChunks = array_chunk($fotos, 2);
    @endphp

    <div style="font-weight:bold; margin-top:6px; margin-bottom:8px;">4. REGISTRO FOTOGRÁFICO DE LA ACTIVIDAD</div>
    @if(count($fotos) > 0)
        <table style="width:100%; border-collapse: separate; border-spacing: 8px; margin-bottom:16px;">
            @foreach($fotoChunks as $chunk)
                <tr>
                    @foreach($chunk as $f)
                        <td style="width:49%; border:1px solid #333; vertical-align: top; padding:0;">
                            @if(!empty($f['base64']))
                                <img src="{{ $f['base64'] }}" style="width:100%; height:220px; object-fit: cover; display:block;" />
                            @else
                                <div style="height:220px; display:flex; align-items:center; justify-content:center; color:#777;">Imagen no disponible</div>
                            @endif
                            <div style="padding:8px; font-size:9px;">{!! nl2br(e($f['descripcion'] ?? '')) !!}
                                @if(!empty($f['fecha']))<div style="margin-top:6px; font-size:8px; color:#666;"><strong>FECHA:</strong> {{ $f['fecha'] }}</div>@endif
                            </div>
                        </td>
                    @endforeach
                    @if(count($chunk) === 1)
                        <td style="width:49%; border:none;"></td>
                    @endif
                </tr>
            @endforeach
        </table>
    @else
        <div style="padding:8px;border:1px dashed #ccc;color:#666;margin-bottom:16px;">No hay evidencias fotográficas registradas.</div>
    @endif

    {{-- 5. Observaciones --}}
    @php 
        $conclusionesData = is_array($informe->conclusiones) ? $informe->conclusiones : json_decode($informe->conclusiones, true); 
        $obs = trim($conclusionesData['otros'][$tipo] ?? ($conclusionesData['limpieza'] ?? ''));
    @endphp
    <div style="font-weight:bold; margin-top:6px; margin-bottom:8px;">5. OBSERVACIONES E INDICACIONES</div>
    @if($obs !== '')
        <div style="font-size:11px; padding:10px; background:#f8fafc; border-left:3px solid #003366; text-align:justify;">
            {!! nl2br(e($obs)) !!}
        </div>
    @else
        <div style="padding:8px;border:1px dashed #ccc;color:#666;">Sin observaciones registradas</div>
    @endif

</div>
