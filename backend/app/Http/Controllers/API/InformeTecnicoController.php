<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\InformeTecnico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class InformeTecnicoController extends Controller
{
    /**
     * Generar PDF del informe técnico
     */
    public function generarPDF($id)
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(300);
        
        Log::info("Iniciando generación de PDF para informe ID: $id");

        try {
            $storageRoot = Storage::disk('public')->path('');
            $informe = InformeTecnico::with(['cliente', 'usuarioCreador'])->findOrFail($id);
            Log::info("Informe cargado: " . $informe->correlativo);
            $isYamboly = $informe->cliente && strpos(strtoupper($informe->cliente->nombre_empresa), 'YAMBOLY') !== false;

            $extraData = []; // Inicializar para evitar que sea indefinida

            // Obtener datos del informe
            $visitas = is_array($informe->visitas) ? $informe->visitas : [];
            $insumosDelInfome = is_array($informe->insumos) ? $informe->insumos : [];
            $idProgramaciones = array_filter(array_column($visitas, 'id_programacion'));

            // Traer insumos entregados
            $insumosEntregados = \App\Models\ProgramacionInsumo::with(['producto', 'lote'])
                ->whereIn('id_programacion', $idProgramaciones)
                ->get()
                ->sortBy(function($item) {
                    return $item->estado !== 'Entregado' ? 1 : 0;
                });

            // Helpers (Se mantienen iguales pero con validaciones mínimas)
            $convertirImagenBase64 = function($rutaImagen) {
                if (!$rutaImagen) return null;
                $rutaLimpia = ltrim($rutaImagen, '/\\');
                if (Storage::disk('public')->exists($rutaLimpia)) {
                    try {
                        $contenido = Storage::disk('public')->get($rutaLimpia);
                        $extension = strtolower(pathinfo($rutaLimpia, PATHINFO_EXTENSION));
                        $mimeType = 'image/' . ($extension === 'png' ? 'png' : 'jpeg');
                        return 'data:' . $mimeType . ';base64,' . base64_encode($contenido);
                    } catch (\Exception $e) { return null; }
                }
                return null;
            };

            $buscarInsumoEntregado = function($keywords) use ($insumosEntregados) {
                $kwArr = array_map('trim', array_filter(explode(',', $keywords)));
                return $insumosEntregados->first(function($insumo) use ($kwArr) {
                    if (!$insumo->producto) return false;
                    $desc = strtoupper($insumo->producto->descripcion ?? '');
                    foreach ($kwArr as $kw) {
                        if (trim($kw) && strpos($desc, strtoupper($kw)) !== false) return true;
                    }
                    return false;
                });
            };

            $obtenerDatosDelEntregado = function($keywords) use ($buscarInsumoEntregado, $convertirImagenBase64) {
                $insumo = $buscarInsumoEntregado($keywords);
                if (!$insumo || !$insumo->producto) return null;
                $base64 = $convertirImagenBase64($insumo->producto->image ?? $insumo->producto->imagen ?? null);
                return $base64 ? [
                    'base64' => $base64,
                    'producto' => $insumo->producto->descripcion ?? '---',
                    'lote' => $insumo->lote?->numero_lote ?? '---',
                    'ingrediente_activo' => $insumo->producto->ingre_activo ?? '---',
                ] : null;
            };

            $obtenerLoteDelEntregado = function($keywords) use ($buscarInsumoEntregado) {
                $insumo = $buscarInsumoEntregado($keywords);
                return $insumo?->lote?->numero_lote ?? '---';
            };

            $obtenerImagenGenerica = function($keywords) use ($convertirImagenBase64) {
                $kwArr = array_map('trim', array_filter(explode(',', $keywords)));
                foreach ($kwArr as $kw) {
                    if (!trim($kw)) continue;
                    $producto = \App\Models\Producto::whereRaw('UPPER(descripcion) LIKE ?', ["%".strtoupper($kw)."%"])->whereNotNull('imagen')->first();
                    if ($producto) {
                        $base64 = $convertirImagenBase64($producto->imagen);
                        if ($base64) return ['base64' => $base64];
                    }
                }
                return null;
            };

            // Inicializar dispositivos
            $dispositivosCebo = []; $dispositivosLamina = []; $dispositivosJaula = [];
            $dispositivosTrampaLuz = []; $dispositivosRastreros = [];
            $dispositivosTuboCebadero = [];

            // Traer Formatos Operacionales para las tablas
            Log::info("Buscando formatos operacionales para las tablas...");
            if (!empty($idProgramaciones)) {
                $formatos = \App\Models\FormatoOperacional::with(['detalles', 'programacionServicio'])
                    ->whereIn('id_programacion_servicio', $idProgramaciones)
                    ->orderBy('fecha', 'desc')->get();
                Log::info("Formatos encontrados: " . $formatos->count());

                $fichasOps = \App\Models\FichaOperacional::whereIn('id_programacion_servicio', $idProgramaciones)->get();

                // Actualizar el correlativo_ficha en $visitas basado en la base de datos real
                foreach ($visitas as &$vRef) {
                    if (!empty($vRef['id_programacion'])) {
                        $fichaEncontrada = $fichasOps->firstWhere('id_programacion_servicio', $vRef['id_programacion']);
                        if ($fichaEncontrada && !empty($fichaEncontrada->correlativo)) {
                            $vRef['correlativo_ficha'] = $fichaEncontrada->correlativo;
                        } else {
                            // Intento con Formato Operacional (por si acaso el usuario llama a formato 'ficha')
                            $fEncontrado = $formatos->firstWhere('id_programacion_servicio', $vRef['id_programacion']);
                            if ($fEncontrado && !empty($fEncontrado->correlativo)) {
                                $vRef['correlativo_ficha'] = $fEncontrado->correlativo;
                            }
                        }
                    }
                }
                unset($vRef);
                $informe->visitas = $visitas;

                foreach ($formatos as $formato) {
                    if (!$formato->detalles) continue;
                    foreach ($formato->detalles as $det) {
                        $codigo = (string)($det->codigo_caja ?? '---');
                        $ubicacion = (string)($det->ubicacion ?? '---');
                        $tipoSec = strtoupper((string)($det->tipo_seccion ?? ''));
                        $descDet = strtoupper((string)($det->descripcion ?? ''));
                        
                        if (strpos($tipoSec, 'CEBO') !== false || strpos($descDet, 'CEBO') !== false) {
                            $dispositivosCebo[$codigo] = ['codigo' => $codigo, 'ubicacion' => $ubicacion];
                        } elseif (strpos($tipoSec, 'JAULA') !== false || strpos($descDet, 'JAULA') !== false) {
                            $dispositivosJaula[$codigo] = ['codigo' => $codigo, 'ubicacion' => $ubicacion];
                        } elseif (strpos($tipoSec, 'TRAMPA') !== false || strpos($descDet, 'TRAMPA') !== false || strpos($tipoSec, 'LUZ') !== false) {
                            $dispositivosTrampaLuz[$codigo] = ['codigo' => $codigo, 'ubicacion' => $ubicacion];
                        } elseif (strpos($tipoSec, 'LAMINA') !== false || strpos($descDet, 'LAMINA') !== false) {
                            if (strncmp($codigo, 'L-', 2) === 0 || strpos($tipoSec, 'RASTREROS') !== false) {
                                $dispositivosRastreros[$codigo] = ['codigo' => $codigo, 'ubicacion' => $ubicacion];
                            } else {
                                $dispositivosLamina[$codigo] = ['codigo' => $codigo, 'ubicacion' => $ubicacion];
                            }
                        } elseif (strpos($tipoSec, 'TUBO_CEBADERO') !== false || strpos($descDet, 'TUBO CEBADERO') !== false) {
                            $dispositivosTuboCebadero[$codigo] = ['codigo' => $codigo, 'ubicacion' => $ubicacion];
                        }
                    }
                }
            }
            $dispositivosCebo = collect($dispositivosCebo)->sortBy('codigo')->values()->all();
            $dispositivosLamina = collect($dispositivosLamina)->sortBy('codigo')->values()->all();
            $dispositivosJaula = collect($dispositivosJaula)->sortBy('codigo')->values()->all();
            $dispositivosTrampaLuz = collect($dispositivosTrampaLuz)->sortBy('codigo')->values()->all();
            $dispositivosRastreros = collect($dispositivosRastreros)->sortBy('codigo')->values()->all();
            $dispositivosTuboCebadero = collect($dispositivosTuboCebadero)->sortBy('codigo')->values()->all();

            // --- LÓGICA DE GRÁFICOS ---
            Log::info("Iniciando lógica de gráficos QuickChart...");
            $chartUrl = null; $chartUrlAnual = null; $chartUrlIndice = null;
            $chartUrlJaulas = null; $chartUrlAnualJaulas = null; $chartUrlIndiceJaulas = null;
            $chartVoladoresTrampas = null;
            $chartVoladoresAnual = null;
            $chartVoladoresUbicacion = null;
            $chartVoladoresFamilias = null;
            
            $colores = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#fd7e14', '#6f42c1', '#20c997', '#dc3545', '#ffc107', '#17a2b8', '#6c757d'];
            $mesesLabels = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
            
            $fetchChart = function($config) {
                try {
                    $url = "https://quickchart.io/chart?c=" . urlencode(json_encode($config));
                    Log::info("URL del gráfico generada: " . strlen($url) . " bytes.");
                    if (function_exists('curl_version')) {
                        $ch = curl_init();
                        curl_setopt($ch, CURLOPT_URL, $url);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
                        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                        $content = curl_exec($ch);
                        curl_close($ch);
                        if ($content) return 'data:image/png;base64,' . base64_encode($content);
                    }
                    if (ini_get('allow_url_fopen')) {
                        $content = @file_get_contents($url);
                        if ($content) return 'data:image/png;base64,' . base64_encode($content);
                    }
                } catch (\Exception $e) { Log::error("Error fetchChart: " . $e->getMessage()); }
                return null;
            };

            $id_cliente = $informe->id_cliente ?? null;
            if ($id_cliente) {
                $carbonBase = \Carbon\Carbon::parse($informe->fecha_emision ?? now());
                $anioActual = $carbonBase->year;
                $mesAnio = $mesesLabels[$carbonBase->month - 1] . " " . $anioActual;

                $historicoFormatos = \App\Models\FormatoOperacional::with('detalles')
                    ->whereHas('programacionServicio.ordenServicio', function($q) use ($id_cliente) {
                        $q->where('id_cliente', $id_cliente);
                    })
                    ->orderBy('fecha', 'desc')->limit(6)->get()->reverse();

                $formatosAnio = \App\Models\FormatoOperacional::with('detalles')
                    ->whereHas('programacionServicio.ordenServicio', function($q) use ($id_cliente) {
                        $q->where('id_cliente', $id_cliente);
                    })
                    ->whereYear('fecha', $anioActual)->limit(50)->get();

                $grupos = [];
                foreach ($visitas as $v) {
                    $t = $v['tipo_servicio'] ?? 'OTROS';
                    $grupos[$t][] = $v;
                }

                foreach ($grupos as $tipo => $visitasGrupo) {
                    // 1. CEBOS
                $labels_cajas = [];
                foreach ($historicoFormatos as $f) {
                    foreach ($f->detalles as $d) {
                        $c = strtoupper((string)($d->codigo_caja ?? ''));
                        if ($c && strpos($c, 'C-') === 0 && !in_array($c, $labels_cajas)) $labels_cajas[] = $c;
                    }
                }
                sort($labels_cajas);

                if (!empty($labels_cajas)) {
                    $datasets = []; $vNum = 1;
                    foreach ($historicoFormatos as $f) {
                        $dataV = []; $fF = date('d/m', strtotime($f->fecha));
                        foreach ($labels_cajas as $l) {
                            $det = $f->detalles->where('codigo_caja', $l)->first();
                            $h = strtoupper((string)($det->hallazgo ?? ''));
                            $dataV[] = (strpos($h, 'C-R') !== false) ? 1 : 0;
                        }
                        $datasets[] = ['label' => "V$vNum ($fF)", 'backgroundColor' => $colores[$vNum-1] ?? '#ccc', 'data' => $dataV];
                        $vNum++;
                    }
                    $chartUrl = $fetchChart([
                        'type' => 'bar',
                        'data' => [
                            'labels' => $labels_cajas,
                            'datasets' => $datasets
                        ],
                        'options' => [
                            'title' => ['display' => true, 'text' => "CONSUMO RODENTICIDA $mesAnio", 'fontSize' => 14],
                            'legend' => ['position' => 'bottom', 'labels' => ['fontSize' => 10]],
                            'scales' => [
                                'yAxes' => [['ticks' => ['beginAtZero' => true, 'stepSize' => 1, 'fontSize' => 9]]],
                                'xAxes' => [['ticks' => ['fontSize' => 9]]]
                            ],
                            'plugins' => [
                                'datalabels' => ['display' => false]
                            ]
                        ]
                    ]);
                }

                    // --- GRÁFICO: Conteo por trampa de luz por visita (Voladores) ---
                    $labels_trampas = [];
                    foreach ($historicoFormatos as $f) {
                        foreach ($f->detalles as $d) {
                            $c = strtoupper((string)($d->codigo_caja ?? ''));
                            $tipoDet = strtoupper((string)($d->tipo_seccion ?? ''));
                            $descDet = strtoupper((string)($d->descripcion ?? ''));
                            if (strpos($tipoDet, 'TRAMPA') !== false || strpos($tipoDet, 'LUZ') !== false || strpos($descDet, 'TRAMPA') !== false || strpos($descDet, 'LUZ') !== false || strncmp($c, 'TL-', 3) === 0) {
                                if ($c && !in_array($c, $labels_trampas)) $labels_trampas[] = $c;
                            }
                        }
                    }

                    if (!empty($labels_trampas)) {
                        sort($labels_trampas);
                        $datasets = [];
                        $vNum = 1;
                        foreach ($historicoFormatos as $f) {
                            $dataV = [];
                            $fF = date('d/m', strtotime($f->fecha));
                            foreach ($labels_trampas as $l) {
                                $det = null;
                                foreach ($f->detalles as $d) {
                                    if (strcasecmp((string)($d->codigo_caja ?? ''), (string)$l) === 0) {
                                        $det = $d;
                                        break;
                                    }
                                }

                                $count = 0;
                                if ($det) {
                                    $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                    $colBusq = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                    
                                    $data = $det->conteo_insectos;
                                    if (is_string($data)) $data = json_decode($data, true);
                                    
                                    if (is_array($data)) {
                                        foreach ($data as $fam) {
                                            if (is_array($fam) && isset($fam[$colBusq])) {
                                                $count += (int)$fam[$colBusq];
                                            } elseif (is_numeric($fam)) {
                                                $count += (int)$fam;
                                            }
                                        }
                                    }
                                    
                                    if ($count === 0) {
                                        $count = (int)($det->conteo_total ?? $det->conteo ?? 0);
                                    }
                                }

                                $dataV[] = $count;
                            }

                            $datasets[] = ['label' => "VISITA $vNum ($fF)", 'backgroundColor' => $colores[$vNum-1] ?? '#4e73df', 'data' => $dataV];
                            $vNum++;
                        }

                        try {
                            $chartVoladoresTrampas = $fetchChart([
                                'type' => 'bar',
                                'data' => [
                                    'labels' => $labels_trampas,
                                    'datasets' => $datasets
                                ],
                                'options' => [
                                    'title' => ['display' => true, 'text' => "CONTEO DE CAPTURA DE INSECTOS VOLADORES EN TRAMPAS DE LUZ - POR VISITA", 'fontSize' => 14],
                                    'legend' => ['position' => 'bottom', 'labels' => ['fontSize' => 10]],
                                    'scales' => [
                                        'yAxes' => [['ticks' => ['beginAtZero' => true, 'fontSize' => 9]]],
                                        'xAxes' => [['ticks' => ['fontSize' => 9]]]
                                    ]
                                ]
                            ]);

                                if ($chartVoladoresTrampas) {
                                            $extraData['chart_voladores_trampas_por_visita'] = $chartVoladoresTrampas;
                                        }

                                // Generar comparativa mensual por trampa (Mes Anterior vs Mes Actual)
                                try {
                                    $comp = ['rows' => [], 'month_prev' => null, 'month_curr' => null];
                                    
                                    $currDate = $carbonBase->copy();
                                    $prevDate = $carbonBase->copy()->subMonth();
                                    
                                    $mesesEs = [1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril', 5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto', 9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'];
                                    
                                    $comp['month_prev'] = $mesesEs[$prevDate->month] . ' (' . $prevDate->year . ')';
                                    $comp['month_curr'] = $mesesEs[$currDate->month] . ' (' . $currDate->year . ')';
                                    
                                    $formatosPrev = [];
                                    $formatosCurr = [];
                                    
                                    $hf = is_array($historicoFormatos) || $historicoFormatos instanceof \Illuminate\Support\Collection ? $historicoFormatos : collect($historicoFormatos);
                                    foreach ($hf as $f) {
                                        $fD = \Carbon\Carbon::parse($f->fecha);
                                        if ($fD->month === $prevDate->month && $fD->year === $prevDate->year) {
                                            $formatosPrev[] = $f;
                                        } elseif ($fD->month === $currDate->month && $fD->year === $currDate->year) {
                                            $formatosCurr[] = $f;
                                        }
                                    }

                                    foreach ($labels_trampas as $label) {
                                        $countPrev = 0; $countCurr = 0;
                                        
                                        // Sumar mes anterior
                                        foreach ($formatosPrev as $pF) {
                                            foreach ($pF->detalles as $d) {
                                                if (strcasecmp((string)$d->codigo_caja ?? '', (string)$label) === 0) {
                                                    $raw = $d->conteo_insectos;
                                                    if (is_string($raw)) $raw = json_decode($raw, true);
                                                    if (is_array($raw)) {
                                                        foreach ($raw as $fam) {
                                                            if (is_array($fam)) {
                                                                $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                                                $colBusq = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                                                if (isset($fam[$colBusq])) $countPrev += (int)$fam[$colBusq];
                                                            } elseif (is_numeric($fam)) {
                                                                $countPrev += (int)$fam;
                                                            }
                                                        }
                                                    } else {
                                                        $countPrev += (int)($d->conteo_total ?? $d->conteo ?? 0);
                                                    }
                                                }
                                            }
                                        }
                                        
                                        // Sumar mes actual
                                        foreach ($formatosCurr as $cF) {
                                            foreach ($cF->detalles as $d) {
                                                if (strcasecmp((string)$d->codigo_caja ?? '', (string)$label) === 0) {
                                                    $raw = $d->conteo_insectos;
                                                    if (is_string($raw)) $raw = json_decode($raw, true);
                                                    if (is_array($raw)) {
                                                        foreach ($raw as $fam) {
                                                            if (is_array($fam)) {
                                                                $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                                                $colBusq = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                                                if (isset($fam[$colBusq])) $countCurr += (int)$fam[$colBusq];
                                                            } elseif (is_numeric($fam)) {
                                                                $countCurr += (int)$fam;
                                                            }
                                                        }
                                                    } else {
                                                        $countCurr += (int)($d->conteo_total ?? $d->conteo ?? 0);
                                                    }
                                                }
                                            }
                                        }
                                        
                                        $comp['rows'][] = ['codigo' => $label, 'prev' => $countPrev, 'curr' => $countCurr, 'diff' => $countCurr - $countPrev];
                                    }
                                    
                                    $extraData['comparativa_mensual_trampas'] = $comp;
                                } catch (\Throwable $e) { Log::error('Error generando comparativa_mensual_trampas: '.$e->getMessage()); }
                            } catch (\Throwable $e) { Log::error('Error generando chart_voladores_trampas: '.$e->getMessage()); }

                            // --- NUEVO: CONSOLIDADO ANUAL DE INSECTOS VOLADORES ---
                            try {
                                $dataM_Vol = array_fill(0, 12, 0);
                                foreach ($formatosAnio as $f) {
                                    $mIdx = \Carbon\Carbon::parse($f->fecha)->month - 1;
                                    foreach ($f->detalles as $det) {
                                        $c = strtoupper((string)($det->codigo_caja ?? ''));
                                        $tipoDet = strtoupper((string)($det->tipo_seccion ?? ''));
                                        $descDet = strtoupper((string)($det->descripcion ?? ''));
                                        if (strpos($tipoDet, 'TRAMPA') !== false || strpos($tipoDet, 'LUZ') !== false || strpos($descDet, 'TRAMPA') !== false || strpos($descDet, 'LUZ') !== false || strncmp($c, 'TL-', 3) === 0) {
                                            $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                            $colBusq = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                            $dataI = $det->conteo_insectos;
                                            if (is_string($dataI)) $dataI = json_decode($dataI, true);
                                            $countI = 0;
                                            if (is_array($dataI)) {
                                                foreach ($dataI as $fam) {
                                                    if (is_array($fam) && isset($fam[$colBusq])) {
                                                        $countI += (int)$fam[$colBusq];
                                                    } elseif (is_numeric($fam)) {
                                                        $countI += (int)$fam;
                                                    }
                                                }
                                            }
                                            if ($countI === 0) $countI = (int)($det->conteo_total ?? $det->conteo ?? 0);
                                            $dataM_Vol[$mIdx] += $countI;
                                        }
                                    }
                                }

                                $chartVoladoresAnual = $fetchChart([
                                    'type' => 'line',
                                    'data' => [
                                        'labels' => $mesesLabels,
                                        'datasets' => [[
                                            'label' => 'Total Capturas',
                                            'data' => $dataM_Vol,
                                            'borderColor' => '#4e73df',
                                            'backgroundColor' => 'rgba(78, 115, 223, 0.1)',
                                            'borderWidth' => 3,
                                            'fill' => true,
                                            'pointRadius' => 5,
                                            'pointBackgroundColor' => '#4e73df'
                                        ]]
                                    ],
                                    'options' => [
                                        'title' => ['display' => true, 'text' => "CONSOLIDADO DE CAPTURA DE INSECTOS VOLADORES EN TRAMPAS DE LUZ - UV $anioActual", 'fontSize' => 14],
                                        'legend' => ['display' => false],
                                        'scales' => [
                                            'yAxes' => [['ticks' => ['beginAtZero' => true, 'fontSize' => 9]]],
                                            'xAxes' => [['ticks' => ['fontSize' => 8]]]
                                        ],
                                        'plugins' => [
                                            'datalabels' => ['display' => true, 'anchor' => 'end', 'align' => 'top', 'font' => ['size' => 9, 'weight' => 'bold']]
                                        ]
                                    ]
                                ]);
                                if ($chartVoladoresAnual) {
                                    $extraData['chart_voladores_anual'] = $chartVoladoresAnual;
                                }
                            
                                // --- NUEVO: GRÁFICOS CONSOLIDADOS POR TRAMPA (POR MES) ---
                                try {
                                    $chartsPorTrampa = [];
                                    foreach ($dispositivosTrampaLuz as $disp) {
                                        $codigo = $disp['codigo'];
                                        $ubicacionStr = strtoupper($disp['ubicacion']);
                                        $dataM = array_fill(0, 12, 0);

                                        foreach ($formatosAnio as $f) {
                                            $mIdx = \Carbon\Carbon::parse($f->fecha)->month - 1;
                                            foreach ($f->detalles as $det) {
                                                $cDet = strtoupper((string)($det->codigo_caja ?? ''));
                                                if ($cDet !== '' && strpos($cDet, trim(strtoupper((string)$codigo))) !== false) {
                                                    $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                                    $colB = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                                    $rawI = $det->conteo_insectos;
                                                    if (is_string($rawI)) $rawI = json_decode($rawI, true);
                                                    $cI = 0;
                                                    if (is_array($rawI)) {
                                                        foreach ($rawI as $fam) {
                                                            if (is_array($fam) && isset($fam[$colB])) $cI += (int)$fam[$colB];
                                                            elseif (is_numeric($fam)) $cI += (int)$fam;
                                                        }
                                                    }
                                                    if ($cI === 0) $cI = (int)($det->conteo_total ?? $det->conteo ?? 0);
                                                    $dataM[$mIdx] += $cI;
                                                }
                                            }
                                        }

                                        // Si hay al menos un valor positivo, generamos el gráfico
                                        if (array_sum($dataM) > 0) {
                                            $chart = $fetchChart([
                                                'type' => 'line',
                                                'data' => [
                                                    'labels' => $mesesLabels,
                                                    'datasets' => [[
                                                        'label' => 'Total Capturas',
                                                        'data' => $dataM,
                                                        'borderColor' => '#4e73df',
                                                        'backgroundColor' => 'rgba(78, 115, 223, 0.1)',
                                                        'borderWidth' => 3,
                                                        'fill' => true,
                                                        'pointRadius' => 4,
                                                        'pointBackgroundColor' => '#4e73df'
                                                    ]]
                                                ],
                                                'options' => [
                                                    'title' => ['display' => true, 'text' => "CONSOLIDADO DE CAPTURA DE INSECTOS VOLADORES EN $codigo", 'fontSize' => 14],
                                                    'legend' => ['display' => false],
                                                    'scales' => [
                                                        'yAxes' => [['ticks' => ['beginAtZero' => true, 'fontSize' => 9]]],
                                                        'xAxes' => [['ticks' => ['fontSize' => 8]]]
                                                    ],
                                                    'plugins' => [
                                                        'datalabels' => ['display' => true, 'anchor' => 'end', 'align' => 'top', 'font' => ['size' => 9, 'weight' => 'bold']]
                                                    ]
                                                ]
                                            ]);

                                            if ($chart) {
                                                $chartsPorTrampa[] = ['codigo' => $codigo, 'ubicacion' => $ubicacionStr, 'chart' => $chart];
                                            }
                                        }
                                    }
                                    if (!empty($chartsPorTrampa)) $extraData['charts_voladores_por_trampa'] = $chartsPorTrampa;
                                } catch (\Throwable $e) { Log::error('Error generando charts_voladores_por_trampa: '.$e->getMessage()); }
                            } catch (\Throwable $e) { Log::error('Error generando chart_voladores_anual: '.$e->getMessage()); }

                            // --- NUEVO: ABUNDANCIA DE FAMILIAS TAXONOMICAS POR UBICACIÓN ---
                            try {
                                $dataUbicacion = [];
                                foreach ($dispositivosTrampaLuz as $disp) {
                                    $codigo = $disp['codigo'];
                                    $ubicacion = strtoupper($disp['ubicacion']);
                                    $totalLoc = 0;
                                    
                                    foreach (($formatos ?? []) as $fObj) {
                                        foreach ($fObj->detalles as $det) {
                                            $cDet = trim(strtoupper((string)($det->codigo_caja ?? '')));
                                            if ($cDet !== '' && strpos($cDet, trim(strtoupper((string)$codigo))) !== false) {
                                                $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                                $colB = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                                $rawI = $det->conteo_insectos;
                                                if (is_string($rawI)) $rawI = json_decode($rawI, true);
                                                $cI = 0;
                                                if (is_array($rawI)) {
                                                    foreach ($rawI as $fam) {
                                                        if (is_array($fam) && isset($fam[$colB])) $cI += (int)$fam[$colB];
                                                        elseif (is_numeric($fam)) $cI += (int)$fam;
                                                    }
                                                }
                                                if ($cI === 0) $cI = (int)($det->conteo_total ?? $det->conteo ?? 0);
                                                $totalLoc += $cI;
                                            }
                                        }
                                    }
                                    $dataUbicacion[$ubicacion] = ($dataUbicacion[$ubicacion] ?? 0) + $totalLoc;
                                }

                                if (!empty($dataUbicacion)) {
                                    $chartVoladoresUbicacion = $fetchChart([
                                        'type' => 'bar',
                                        'data' => [
                                            'labels' => array_keys($dataUbicacion),
                                            'datasets' => [[
                                                'label' => 'Total Capturas',
                                                'backgroundColor' => '#4e73df',
                                                'data' => array_values($dataUbicacion)
                                            ]]
                                        ],
                                        'options' => [
                                            'title' => ['display' => true, 'text' => ($isYamboly ? "ABUNDANCIA DE INSECTOS POR UBICACIÓN - $mesAnio" : ($isYamboly ? "ABUNDANCIA DE INSECTOS POR UBICACIÓN - $mesAnio" : "ABUNDANCIA DE FAMILIAS TAXONOMICAS POR UBICACIÓN - $mesAnio")), 'fontSize' => 14],
                                            'legend' => ['display' => false],
                                            'scales' => [
                                                'yAxes' => [['ticks' => ['beginAtZero' => true, 'fontSize' => 9], 'scaleLabel' => ['display' => true, 'labelString' => 'N° DE INSECTOS VOLADORES', 'fontSize' => 9]]],
                                                'xAxes' => [['ticks' => ['fontSize' => 7, 'autoSkip' => false, 'maxRotation' => 45, 'minRotation' => 45]]]
                                            ],
                                            'plugins' => [
                                                'datalabels' => ['display' => true, 'anchor' => 'end', 'align' => 'top', 'font' => ['size' => 9, 'weight' => 'bold']]
                                            ]
                                        ]
                                    ]);
                                    if ($chartVoladoresUbicacion) {
                                        $extraData['chart_voladores_ubicacion'] = $chartVoladoresUbicacion;
                                    }
                                }
                            } catch (\Throwable $e) { Log::error('Error generando chart_voladores_ubicacion: '.$e->getMessage()); }

                            // --- NUEVO: ACTIVIDAD DETALLADA POR FAMILIA TAXONÓMICA ---
                            try {
                                                                if ($isYamboly) {
                                    $familiasRes = [
                                        'MOSCAS DOMÉSTICAS' => 0, 'MOSCA MENOR' => 0, 'ZANCUDO' => 0, 'AVISPA' => 0,
                                        'ABEJA' => 0, 'MARIPOSA' => 0, 'POLILLA' => 0, 'GORGOJO' => 0
                                    ];
                                } else {
                                    $familiasRes = [
                                        'MUSCIDAE' => 0, 'DROSOPHILIDAE' => 0, 'PHORIDAE' => 0, 'PSYCHODIDAE' => 0,
                                        'CHIRONOMIDAE' => 0, 'CULICIDAE' => 0, 'PYRALIDAE/TINEIDAE/GELECHIIDAE' => 0,
                                        'SARCOPHAGIDAE/CALLIPHORIDAE' => 0, 'OTROS NO IDENTIFICADOS' => 0
                                    ];
                                }
                                
                                foreach (($formatos ?? []) as $fObj) {
                                    foreach ($fObj->detalles as $det) {
                                        $tipoDet = strtoupper((string)($det->tipo_seccion ?? ''));
                                        $descDet = strtoupper((string)($det->descripcion ?? ''));
                                        $cDet = strtoupper((string)($det->codigo_caja ?? ''));
                                        
                                        if (strpos($tipoDet, 'TRAMPA') !== false || strpos($tipoDet, 'LUZ') !== false || strncmp($cDet, 'TL-', 3) === 0) {
                                            $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                            $colB = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                            $rawI = $det->conteo_insectos;
                                            if (is_string($rawI)) $rawI = json_decode($rawI, true);
                                            
                                            if (is_array($rawI)) {
                                                foreach ($rawI as $fKey => $famData) {
                                                    $fkU = strtoupper(str_replace('_', ' ', $fKey));
                                                    $targetKey = null;
                                                                                                        if ($isYamboly) {
                                                        if (strpos($fkU, 'MOSCAS DOMESTICAS') !== false || strpos($fkU, 'MOSCAS DOMÉSTICAS') !== false) $targetKey = 'MOSCAS DOMÉSTICAS';
                                                        elseif (strpos($fkU, 'MOSCA MENOR') !== false) $targetKey = 'MOSCA MENOR';
                                                        elseif (strpos($fkU, 'ZANCUDO') !== false) $targetKey = 'ZANCUDO';
                                                        elseif (strpos($fkU, 'AVISPA') !== false) $targetKey = 'AVISPA';
                                                        elseif (strpos($fkU, 'ABEJA') !== false) $targetKey = 'ABEJA';
                                                        elseif (strpos($fkU, 'MARIPOSA') !== false) $targetKey = 'MARIPOSA';
                                                        elseif (strpos($fkU, 'POLILLA') !== false) $targetKey = 'POLILLA';
                                                        elseif (strpos($fkU, 'GORGOJO') !== false) $targetKey = 'GORGOJO';
                                                    } else {
                                                                                                            if ($isYamboly) {
                                                        if (strpos($fkU, 'MOSCAS DOMESTICAS') !== false || strpos($fkU, 'MOSCAS DOMÉSTICAS') !== false) $targetKey = 'MOSCAS DOMÉSTICAS';
                                                        elseif (strpos($fkU, 'MOSCA MENOR') !== false) $targetKey = 'MOSCA MENOR';
                                                        elseif (strpos($fkU, 'ZANCUDO') !== false) $targetKey = 'ZANCUDO';
                                                        elseif (strpos($fkU, 'AVISPA') !== false) $targetKey = 'AVISPA';
                                                        elseif (strpos($fkU, 'ABEJA') !== false) $targetKey = 'ABEJA';
                                                        elseif (strpos($fkU, 'MARIPOSA') !== false) $targetKey = 'MARIPOSA';
                                                        elseif (strpos($fkU, 'POLILLA') !== false) $targetKey = 'POLILLA';
                                                        elseif (strpos($fkU, 'GORGOJO') !== false) $targetKey = 'GORGOJO';
                                                    } else {
                                                        if (strpos($fkU, 'MUSCIDAE') !== false) $targetKey = 'MUSCIDAE';
                                                        elseif (strpos($fkU, 'DROSOPHILIDAE') !== false) $targetKey = 'DROSOPHILIDAE';
                                                        elseif (strpos($fkU, 'PHORIDAE') !== false) $targetKey = 'PHORIDAE';
                                                        elseif (strpos($fkU, 'PSYCHODIDAE') !== false) $targetKey = 'PSYCHODIDAE';
                                                        elseif (strpos($fkU, 'CHIRONOMIDAE') !== false) $targetKey = 'CHIRONOMIDAE';
                                                        elseif (strpos($fkU, 'CULICIDAE') !== false) $targetKey = 'CULICIDAE';
                                                        elseif (strpos($fkU, 'PYRALIDAE') !== false || strpos($fkU, 'TINERIDAE') !== false) $targetKey = 'PYRALIDAE/TINEIDAE/GELECHIIDAE';
                                                        elseif (strpos($fkU, 'SARCOPHAGIDAE') !== false) $targetKey = 'SARCOPHAGIDAE/CALLIPHORIDAE';
                                                        elseif (strpos($fkU, 'OTROS') !== false) $targetKey = 'OTROS';
                                                    }
                                                    }
                                                    
                                                    if ($targetKey) {
                                                        if (is_array($famData) && isset($famData[$colB])) $familiasRes[$targetKey] += (int)$famData[$colB];
                                                        elseif (is_numeric($famData)) $familiasRes[$targetKey] += (int)$famData;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                arsort($familiasRes);
                                if (array_sum($familiasRes) > 0) {
                                    $chartVoladoresFamilias = $fetchChart([
                                        'type' => 'horizontalBar',
                                        'data' => [
                                            'labels' => array_keys($familiasRes),
                                            'datasets' => [[
                                                'label' => 'Cantidad',
                                                'backgroundColor' => '#4e73df',
                                                'data' => array_values($familiasRes)
                                            ]]
                                        ],
                                        'options' => [
                                            'title' => ['display' => true, 'text' => ($isYamboly ? "ACTIVIDAD DETALLADA POR INSECTO - $mesAnio" : "ACTIVIDAD DETALLADA POR FAMILIA TAXONÓMICA - $mesAnio"), 'fontSize' => 14],
                                            'legend' => ['display' => false],
                                            'scales' => [
                                                'xAxes' => [['ticks' => ['beginAtZero' => true, 'fontSize' => 10]]]
                                            ],
                                            'plugins' => [
                                                'datalabels' => ['display' => true, 'anchor' => 'end', 'align' => 'right', 'font' => ['size' => 10, 'weight' => 'bold']]
                                            ]
                                        ]
                                    ]);
                                    if ($chartVoladoresFamilias) {
                                        $extraData['chart_voladores_familias'] = $chartVoladoresFamilias;
                                    }
                                }
                            } catch (\Throwable $e) { Log::error('Error generando chart_voladores_familias: '.$e->getMessage()); }

                            // --- NUEVO: GRÁFICOS DE TORTA POR UBICACIÓN ---
                            try {
                                $chartsUbicaciones = [];
                                foreach ($dispositivosTrampaLuz as $disp) {
                                    $codigo = $disp['codigo'];
                                    $ubicacionStr = strtoupper($disp['ubicacion']);
                                    
                                                                        if ($isYamboly) {
                                        $familiasUbic = [
                                            'MOSCAS DOMÉSTICAS' => 0, 'MOSCA MENOR' => 0, 'ZANCUDO' => 0, 'AVISPA' => 0,
                                            'ABEJA' => 0, 'MARIPOSA' => 0, 'POLILLA' => 0, 'GORGOJO' => 0
                                        ];
                                    } else {
                                        $familiasUbic = [
                                            'MUSCIDAE' => 0, 'DROSOPHILIDAE' => 0, 'PHORIDAE' => 0, 'PSYCHODIDAE' => 0,
                                            'CHIRONOMIDAE' => 0, 'CULICIDAE' => 0, 'PYRALIDAE/TINEIDAE/GELECHIIDAE' => 0,
                                            'SARCOPHAGIDAE/CALLIPHORIDAE' => 0, 'OTROS' => 0
                                        ];
                                    }
                                    
                                    foreach (($formatos ?? []) as $fObj) {
                                        foreach ($fObj->detalles as $det) {
                                            $cDet = trim(strtoupper((string)($det->codigo_caja ?? '')));
                                            if ($cDet !== '' && strpos($cDet, trim(strtoupper((string)$codigo))) !== false) {
                                                $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                                $colB = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                                $rawI = $det->conteo_insectos;
                                                if (is_string($rawI)) $rawI = json_decode($rawI, true);
                                                
                                                if (is_array($rawI)) {
                                                    foreach ($rawI as $fKey => $famData) {
                                                        $fkU = strtoupper(str_replace('_', ' ', $fKey));
                                                        $targetKey = null;
                                                        if ($isYamboly) {
                                                            if (strpos($fkU, 'MOSCAS DOMESTICAS') !== false || strpos($fkU, 'MOSCAS DOMÉSTICAS') !== false) $targetKey = 'MOSCAS DOMÉSTICAS';
                                                            elseif (strpos($fkU, 'MOSCA MENOR') !== false) $targetKey = 'MOSCA MENOR';
                                                            elseif (strpos($fkU, 'ZANCUDO') !== false) $targetKey = 'ZANCUDO';
                                                            elseif (strpos($fkU, 'AVISPA') !== false) $targetKey = 'AVISPA';
                                                            elseif (strpos($fkU, 'ABEJA') !== false) $targetKey = 'ABEJA';
                                                            elseif (strpos($fkU, 'MARIPOSA') !== false) $targetKey = 'MARIPOSA';
                                                            elseif (strpos($fkU, 'POLILLA') !== false) $targetKey = 'POLILLA';
                                                            elseif (strpos($fkU, 'GORGOJO') !== false) $targetKey = 'GORGOJO';
                                                        } else {
                                                            if (strpos($fkU, 'MUSCIDAE') !== false) $targetKey = 'MUSCIDAE';
                                                            elseif (strpos($fkU, 'DROSOPHILIDAE') !== false) $targetKey = 'DROSOPHILIDAE';
                                                            elseif (strpos($fkU, 'PHORIDAE') !== false) $targetKey = 'PHORIDAE';
                                                            elseif (strpos($fkU, 'PSYCHODIDAE') !== false) $targetKey = 'PSYCHODIDAE';
                                                            elseif (strpos($fkU, 'CHIRONOMIDAE') !== false) $targetKey = 'CHIRONOMIDAE';
                                                            elseif (strpos($fkU, 'CULICIDAE') !== false) $targetKey = 'CULICIDAE';
                                                            elseif (strpos($fkU, 'PYRALIDAE') !== false || strpos($fkU, 'TINERIDAE') !== false) $targetKey = 'PYRALIDAE/TINEIDAE/GELECHIIDAE';
                                                            elseif (strpos($fkU, 'SARCOPHAGIDAE') !== false) $targetKey = 'SARCOPHAGIDAE/CALLIPHORIDAE';
                                                            elseif (strpos($fkU, 'OTROS') !== false) $targetKey = 'OTROS';
                                                        }
                                                        
                                                        if ($targetKey) {
                                                            if (is_array($famData) && isset($famData[$colB])) $familiasUbic[$targetKey] += (int)$famData[$colB];
                                                            elseif (is_numeric($famData)) $familiasUbic[$targetKey] += (int)$famData;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
                                    if (array_sum($familiasUbic) > 0) {
                                        $labelsU = []; $valuesU = [];
                                        foreach ($familiasUbic as $lbl => $val) {
                                            if ($val > 0) { $labelsU[] = $lbl; $valuesU[] = $val; }
                                        }
                                        
                                        $chartU = $fetchChart([
                                            'type' => 'pie',
                                            'data' => [
                                                'labels' => $labelsU,
                                                'datasets' => [[
                                                    'data' => $valuesU,
                                                    'backgroundColor' => ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#fd7e14', '#6f42c1', '#20c997', '#dc3545']
                                                ]]
                                            ],
                                            'options' => [
                                                'title' => ['display' => true, 'text' => ($isYamboly ? "TOTAL POR INSECTO - $ubicacionStr" : "TOTAL POR FAMILIA TAXONÓMICA - $ubicacionStr"), 'fontSize' => 14],
                                                'legend' => ['position' => 'right', 'labels' => ['fontSize' => 9]],
                                                'plugins' => [
                                                    'datalabels' => ['display' => true, 'color' => '#fff', 'font' => ['weight' => 'bold', 'size' => 10]]
                                                ]
                                            ]
                                        ]);
                                        if ($chartU) {
                                            $chartsUbicaciones[] = [
                                                'codigo' => $codigo,
                                                'ubicacion' => $ubicacionStr,
                                                'chart' => $chartU
                                            ];
                                        }
                                    }
                                }
                                $extraData['charts_voladores_ubicaciones'] = $chartsUbicaciones;
                            } catch (\Throwable $e) { Log::error('Error generando charts_voladores_ubicaciones: '.$e->getMessage()); }

                            // --- NUEVO: ÍNDICE DE ABUNDANCIA POR FAMILIA (VOLADORES) ---
                            try {
                                $abundanciaFamilias = [];
                                
                                $formatosMes = [];
                                foreach (($formatos ?? []) as $f) {
                                    $fDate = \Carbon\Carbon::parse($f->fecha);
                                    if ($fDate->month == $carbonBase->month && $fDate->year == $carbonBase->year) {
                                        $formatosMes[] = $f;
                                    }
                                }
                                
                                foreach ($dispositivosTrampaLuz as $disp) {
                                    $codigo = $disp['codigo'];
                                    $ubicacionStr = strtoupper($disp['ubicacion']);
                                    
                                    if ($isYamboly) {
                                        $familiasDisp = [
                                            'OTROS' => 0, 'MOSCAS DOMÉSTICAS' => 0, 'MOSCA MENOR' => 0, 'ZANCUDO' => 0,
                                            'AVISPA' => 0, 'ABEJA' => 0, 'MARIPOSA' => 0, 'POLILLA' => 0, 'GORGOJO' => 0
                                        ];
                                    } else {
                                        $familiasDisp = [
                                            'OTROS NO IDENTIFICADOS' => 0, 'MUSCIDAE' => 0, 'DROSOPHILIDAE' => 0,
                                            'PHORIDAE' => 0, 'PSYCHODIDAE' => 0, 'CHIRONOMIDAE' => 0, 'CULICIDAE' => 0,
                                            'PYRALIDAE/TINEIDAE/GELECHIIDAE' => 0, 'SARCOPHAGIDAE/CALLIPHORIDAE' => 0
                                        ];
                                    }
                                    
                                    $esfuerzoTotal = 0;
                                    
                                    foreach ($formatosMes as $fObj) {
                                        $prevFormat = \App\Models\FormatoOperacional::whereHas('programacionServicio.ordenServicio', function($q) use ($id_cliente) {
                                                $q->where('id_cliente', $id_cliente);
                                            })
                                            ->where('fecha', '<', $fObj->fecha)
                                            ->orderBy('fecha', 'desc')
                                            ->first();
                                        $pt = $prevFormat ? \Carbon\Carbon::parse($fObj->fecha)->diffInDays(\Carbon\Carbon::parse($prevFormat->fecha)) : 30;
                                        if ($pt <= 0) $pt = 30;

                                        $encontrado = false;
                                        $estado = 1;
                                        $hallazgosVisita = [];
                                        
                                        foreach ($fObj->detalles as $det) {
                                            $cDet = trim(strtoupper((string)($det->codigo_caja ?? '')));
                                            if ($cDet !== '' && strpos($cDet, trim(strtoupper((string)$codigo))) !== false) {
                                                $encontrado = true;
                                                $estadoText = strtoupper(trim((string)($det->estado_dispositivo ?? '')));
                                                $estado = (strpos($estadoText, 'D') !== false || $estadoText === 'DISPOSITIVO DESAPARECIDO') ? 0 : 1;
                                                
                                                $tipoRep = strtolower($informe->hoja_tipo ?? 'verdadera');
                                                $colB = ($tipoRep === 'falsa' || $tipoRep === 'auditiva') ? 'auditiva' : 'verdadera';
                                                
                                                $rawI = $det->conteo_insectos;
                                                if (is_string($rawI)) $rawI = json_decode($rawI, true);
                                                
                                                if (is_array($rawI)) {
                                                    foreach ($rawI as $fKey => $famData) {
                                                        $fkU = strtoupper(str_replace('_', ' ', $fKey));
                                                        $targetKey = null;
                                                        if ($isYamboly) {
                                                            if (strpos($fkU, 'MOSCAS DOMESTICAS') !== false || strpos($fkU, 'MOSCAS DOMÉSTICAS') !== false) $targetKey = 'MOSCAS DOMÉSTICAS';
                                                            elseif (strpos($fkU, 'MOSCA MENOR') !== false) $targetKey = 'MOSCA MENOR';
                                                            elseif (strpos($fkU, 'ZANCUDO') !== false) $targetKey = 'ZANCUDO';
                                                            elseif (strpos($fkU, 'AVISPA') !== false) $targetKey = 'AVISPA';
                                                            elseif (strpos($fkU, 'ABEJA') !== false) $targetKey = 'ABEJA';
                                                            elseif (strpos($fkU, 'MARIPOSA') !== false) $targetKey = 'MARIPOSA';
                                                            elseif (strpos($fkU, 'POLILLA') !== false) $targetKey = 'POLILLA';
                                                            elseif (strpos($fkU, 'GORGOJO') !== false) $targetKey = 'GORGOJO';
                                                            elseif (strpos($fkU, 'OTROS') !== false) $targetKey = 'OTROS';
                                                        } else {
                                                            if (strpos($fkU, 'MUSCIDAE') !== false) $targetKey = 'MUSCIDAE';
                                                            elseif (strpos($fkU, 'DROSOPHILIDAE') !== false) $targetKey = 'DROSOPHILIDAE';
                                                            elseif (strpos($fkU, 'PHORIDAE') !== false) $targetKey = 'PHORIDAE';
                                                            elseif (strpos($fkU, 'PSYCHODIDAE') !== false) $targetKey = 'PSYCHODIDAE';
                                                            elseif (strpos($fkU, 'CHIRONOMIDAE') !== false) $targetKey = 'CHIRONOMIDAE';
                                                            elseif (strpos($fkU, 'CULICIDAE') !== false) $targetKey = 'CULICIDAE';
                                                            elseif (strpos($fkU, 'PYRALIDAE') !== false || strpos($fkU, 'TINERIDAE') !== false) $targetKey = 'PYRALIDAE/TINEIDAE/GELECHIIDAE';
                                                            elseif (strpos($fkU, 'SARCOPHAGIDAE') !== false) $targetKey = 'SARCOPHAGIDAE/CALLIPHORIDAE';
                                                            elseif (strpos($fkU, 'OTROS') !== false) $targetKey = 'OTROS NO IDENTIFICADOS';
                                                        }
                                                        if ($targetKey) {
                                                            if (is_array($famData) && isset($famData[$colB])) $hallazgosVisita[$targetKey] = ($hallazgosVisita[$targetKey] ?? 0) + (int)$famData[$colB];
                                                            elseif (is_numeric($famData)) $hallazgosVisita[$targetKey] = ($hallazgosVisita[$targetKey] ?? 0) + (int)$famData;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        
                                        if ($encontrado) {
                                            $esfuerzoTotal += ($estado * $pt);
                                            foreach ($hallazgosVisita as $fk => $fv) {
                                                if (isset($familiasDisp[$fk])) {
                                                    $familiasDisp[$fk] += $fv;
                                                }
                                            }
                                        }
                                    }
                                    
                                    $indicesDisp = [];
                                    foreach ($familiasDisp as $fk => $totH) {
                                        if ($esfuerzoTotal > 0) {
                                            $indicesDisp[$fk] = number_format($totH / $esfuerzoTotal, 2);
                                        } else {
                                            $indicesDisp[$fk] = "0.00";
                                        }
                                    }
                                    
                                    $abundanciaFamilias[] = [
                                        'codigo' => $codigo,
                                        'ubicacion' => $ubicacionStr,
                                        'indices' => $indicesDisp
                                    ];
                                }
                                
                                $extraData['abundancia_familias_voladores'] = $abundanciaFamilias;
                            } catch (\Throwable $e) { Log::error('Error generando abundancia_familias_voladores: '.$e->getMessage()); }
                        }

                    $dataM = array_fill(0, 12, 0); // Consolidado (Consumos puros)
                    $esfuerzoM = array_fill(0, 12, 0); // Denominador: Estado * PT
                    $hallazgosM = array_fill(0, 12, 0); // Numerador: Hallazgos

                    $periodosTiempo = [];

                    foreach ($formatosAnio as $f) {
                        $mIdx = \Carbon\Carbon::parse($f->fecha)->month - 1;
                        
                        // Calcular periodo de tiempo (días desde la visita anterior)
                        if (!isset($periodosTiempo[$f->id])) {
                            $prevFormat = \App\Models\FormatoOperacional::whereHas('programacionServicio.ordenServicio', function($q) use ($id_cliente) {
                                    $q->where('id_cliente', $id_cliente);
                                })
                                ->where('fecha', '<', $f->fecha)
                                ->orderBy('fecha', 'desc')
                                ->first();
                            $pt = $prevFormat ? \Carbon\Carbon::parse($f->fecha)->diffInDays(\Carbon\Carbon::parse($prevFormat->fecha)) : 30;
                            if ($pt <= 0) $pt = 30;
                            $periodosTiempo[$f->id] = $pt;
                        }
                        $periodoTiempo = $periodosTiempo[$f->id];

                        foreach ($f->detalles as $d) {
                            $hallazgoText = strtoupper(trim((string)($d->hallazgo ?? '')));
                            $codigoText = strtoupper(trim((string)($d->codigo_caja ?? '')));
                            $estadoText = strtoupper(trim((string)($d->estado_dispositivo ?? '')));
                            
                            $isCebo = false;
                            if (strpos($hallazgoText, 'C-R') !== false) {
                                $dataM[$mIdx]++;
                                $isCebo = true;
                            } elseif (strpos($codigoText, 'C-') === 0 || strpos($codigoText, 'E-') === 0 || strpos($codigoText, 'P-') === 0) {
                                $isCebo = true;
                            }

                            if ($isCebo) {
                                $estado = (strpos($estadoText, 'N') !== false || $estadoText === 'NO ENCONTRADO') ? 0 : 1;
                                $hallazgo = (strpos($hallazgoText, 'C-R') !== false) ? 1 : 0;
                                
                                $hallazgosM[$mIdx] += $hallazgo;
                                $esfuerzoM[$mIdx] += ($estado * $periodoTiempo);
                            }
                        }
                    }

                    $dataI = []; $colsI = [];
                    for ($i = 0; $i < 12; $i++) {
                        $idx = $esfuerzoM[$i] > 0 ? round(($hallazgosM[$i] / $esfuerzoM[$i]) * 100, 2) : 0;
                        $dataI[] = $idx;
                        if ($idx == 0) $colsI[] = '#28a745';
                        elseif ($idx <= 5) $colsI[] = '#ffc107';
                        else $colsI[] = '#dc3545';
                    }
                    $chartUrlAnual = $fetchChart([
                        'type' => 'line',
                        'data' => [
                            'labels' => $mesesLabels,
                            'datasets' => [[
                                'label' => 'Consumo',
                                'data' => $dataM,
                                'borderColor' => '#1a3352',
                                'backgroundColor' => 'rgba(78, 115, 223, 0.1)',
                                'borderWidth' => 2,
                                'fill' => true,
                                'pointRadius' => 3
                            ]]
                        ],
                        'options' => [
                            'title' => ['display' => true, 'text' => "CONSOLIDADO ANUAL $anioActual", 'fontSize' => 14],
                            'legend' => ['display' => false],
                            'scales' => [
                                'yAxes' => [['ticks' => ['beginAtZero' => true, 'stepSize' => 1, 'fontSize' => 9]]],
                                'xAxes' => [['ticks' => ['fontSize' => 9]]]
                            ]
                        ]
                    ]);

                    $chartUrlIndice = $fetchChart([
                        'type' => 'bar',
                        'data' => [
                            'labels' => $mesesLabels,
                            'datasets' => [[
                                'label' => '% Abundancia',
                                'backgroundColor' => $colsI,
                                'borderColor' => '#333',
                                'borderWidth' => 1,
                                'data' => $dataI
                            ]]
                        ],
                        'options' => [
                            'title' => ['display' => true, 'text' => "ÍNDICE DE ABUNDANCIA $anioActual", 'fontSize' => 14],
                            'legend' => ['display' => false],
                            'scales' => [
                                'yAxes' => [['ticks' => ['beginAtZero' => true, 'suggestedMax' => 10, 'fontSize' => 9]]],
                                'xAxes' => [['ticks' => ['fontSize' => 9]]]
                            ],
                            'plugins' => [
                                'datalabels' => ['display' => true, 'anchor' => 'end', 'align' => 'top', 'font' => ['size' => 8, 'weight' => 'bold']]
                            ]
                        ]
                    ]);
                }

                // 2. JAULAS
                $labels_jaulas = [];
                foreach ($historicoFormatos as $f) {
                    foreach ($f->detalles as $d) {
                        $c = strtoupper((string)($d->codigo_caja ?? ''));
                        if ($c && strpos($c, 'J-') === 0 && !in_array($c, $labels_jaulas)) $labels_jaulas[] = $c;
                    }
                }
                sort($labels_jaulas);

                if (!empty($labels_jaulas)) {
                    $datasetsJ = []; $vNumJ = 1;
                    foreach ($historicoFormatos as $f) {
                        $dataVJ = []; $fF = date('d/m', strtotime($f->fecha));
                        foreach ($labels_jaulas as $l) {
                            $det = $f->detalles->where('codigo_caja', $l)->first();
                            $h = strtoupper((string)($det->hallazgo ?? ''));
                            $dataVJ[] = ($h !== '' && $h !== 'L' && $h !== 'B' && $h !== 'S/A') ? 1 : 0;
                        }
                        $datasetsJ[] = ['label' => "V$vNumJ ($fF)", 'backgroundColor' => $colores[$vNumJ-1] ?? '#ccc', 'data' => $dataVJ];
                        $vNumJ++;
                    }
                    $chartUrlJaulas = $fetchChart([
                        'type' => 'bar',
                        'data' => [
                            'labels' => $labels_jaulas,
                            'datasets' => $datasetsJ
                        ],
                        'options' => [
                            'title' => ['display' => true, 'text' => "ACTIVIDAD EN JAULAS $mesAnio", 'fontSize' => 14],
                            'legend' => ['position' => 'bottom', 'labels' => ['fontSize' => 10]],
                            'scales' => [
                                'yAxes' => [['ticks' => ['beginAtZero' => true, 'stepSize' => 1, 'fontSize' => 9]]],
                                'xAxes' => [['ticks' => ['fontSize' => 9]]]
                            ]
                        ]
                    ]);

                    $dataMJ = array_fill(0, 12, 0); // Consolidado (Capturas puros)
                    $esfuerzoMJ = array_fill(0, 12, 0); // Denominador: Estado * PT
                    $hallazgosMJ = array_fill(0, 12, 0); // Numerador: Hallazgos

                    $periodosTiempoJ = [];

                    foreach ($formatosAnio as $f) {
                        $mIdx = \Carbon\Carbon::parse($f->fecha)->month - 1;
                        
                        // Calcular periodo de tiempo (días desde la visita anterior)
                        if (!isset($periodosTiempoJ[$f->id])) {
                            $prevFormat = \App\Models\FormatoOperacional::whereHas('programacionServicio.ordenServicio', function($q) use ($id_cliente) {
                                    $q->where('id_cliente', $id_cliente);
                                })
                                ->where('fecha', '<', $f->fecha)
                                ->orderBy('fecha', 'desc')
                                ->first();
                            $pt = $prevFormat ? \Carbon\Carbon::parse($f->fecha)->diffInDays(\Carbon\Carbon::parse($prevFormat->fecha)) : 30;
                            if ($pt <= 0) $pt = 30;
                            $periodosTiempoJ[$f->id] = $pt;
                        }
                        $periodoTiempo = $periodosTiempoJ[$f->id];

                        foreach ($f->detalles as $d) {
                            $codigoText = strtoupper(trim((string)($d->codigo_caja ?? '')));
                            if (strpos($codigoText, 'J-') === 0) {
                                $hallazgoText = strtoupper(trim((string)($d->hallazgo ?? '')));
                                $estadoText = strtoupper(trim((string)($d->estado_dispositivo ?? '')));
                                
                                if (strpos($hallazgoText, 'C-J') !== false) {
                                    $dataMJ[$mIdx]++;
                                }

                                $estado = (strpos($estadoText, 'N') !== false || $estadoText === 'NO ENCONTRADO') ? 0 : 1;
                                $hallazgo = (strpos($hallazgoText, 'C-J') !== false) ? 1 : 0;
                                
                                $hallazgosMJ[$mIdx] += $hallazgo;
                                $esfuerzoMJ[$mIdx] += ($estado * $periodoTiempo);
                            }
                        }
                    }

                    $dataIJ = []; $colsIJ = [];
                    for ($i = 0; $i < 12; $i++) {
                        $idx = $esfuerzoMJ[$i] > 0 ? round(($hallazgosMJ[$i] / $esfuerzoMJ[$i]) * 100, 2) : 0;
                        $dataIJ[] = $idx;
                        if ($idx == 0) $colsIJ[] = '#28a745';
                        elseif ($idx <= 5) $colsIJ[] = '#ffc107';
                        else $colsIJ[] = '#dc3545';
                    }
                    $chartUrlAnualJaulas = $fetchChart([
                        'type' => 'line',
                        'data' => [
                            'labels' => $mesesLabels,
                            'datasets' => [[
                                'label' => 'Capturas',
                                'data' => $dataMJ,
                                'borderColor' => '#1cc88a',
                                'backgroundColor' => 'rgba(28, 200, 138, 0.1)',
                                'borderWidth' => 2,
                                'fill' => true,
                                'pointRadius' => 3
                            ]]
                        ],
                        'options' => [
                            'title' => ['display' => true, 'text' => "CONSOLIDADO CAPTURAS $anioActual", 'fontSize' => 14],
                            'legend' => ['display' => false],
                            'scales' => [
                                'yAxes' => [['ticks' => ['beginAtZero' => true, 'stepSize' => 1, 'fontSize' => 9]]],
                                'xAxes' => [['ticks' => ['fontSize' => 9]]]
                            ]
                        ]
                    ]);

                    $chartUrlIndiceJaulas = $fetchChart([
                        'type' => 'bar',
                        'data' => [
                            'labels' => $mesesLabels,
                            'datasets' => [[
                                'label' => '% Abundancia',
                                'backgroundColor' => $colsIJ,
                                'borderColor' => '#333',
                                'borderWidth' => 1,
                                'data' => $dataIJ
                            ]]
                        ],
                        'options' => [
                            'title' => ['display' => true, 'text' => "ÍNDICE DE ABUNDANCIA JAULAS $anioActual", 'fontSize' => 14],
                            'legend' => ['display' => false],
                            'scales' => [
                                'yAxes' => [['ticks' => ['beginAtZero' => true, 'suggestedMax' => 10, 'fontSize' => 9]]],
                                'xAxes' => [['ticks' => ['fontSize' => 9]]]
                            ],
                            'plugins' => [
                                'datalabels' => ['display' => true, 'anchor' => 'end', 'align' => 'top', 'font' => ['size' => 8, 'weight' => 'bold']]
                            ]
                        ]
                    ]);
                }
            }

            // --- NUEVO: PREPARAR TABLA DE QUÍMICOS Y AREAS (RASTREROS) ---
            $quimicosRastreros = [];
            $areasAplicadas = [];
            if (!empty($idProgramaciones)) {
                $fichasQuimicas = \App\Models\FichaOperacional::with(['programacionServicio'])
                    ->whereIn('id_programacion_servicio', $idProgramaciones)
                    ->orderBy('fecha', 'asc')->get();
                foreach ($fichasQuimicas as $fQ) {
                    // Recopilar áreas
                    if (is_array($fQ->areas_tratadas)) {
                        foreach ($fQ->areas_tratadas as $area) {
                            $a = trim($area);
                            if ($a && !in_array($a, $areasAplicadas)) {
                                $areasAplicadas[] = $a;
                            }
                        }
                    }
                    
                    if (is_array($fQ->insumos_utilizados)) {
                        foreach ($fQ->insumos_utilizados as $ins) {
                            $prod = strtoupper(trim($ins['producto'] ?? ''));
                            if (!$prod) continue;
                            
                            $ingActivo = '---';
                            // Intentar buscar ingrediente activo del catálogo
                            $productoDB = \App\Models\Producto::whereRaw('UPPER(descripcion) LIKE ?', ["%$prod%"])->first();
                            if ($productoDB && $productoDB->ingre_activo) {
                                $ingActivo = $productoDB->ingre_activo;
                            }
                            
                            $fechaServicio = $fQ->fecha ? \Carbon\Carbon::parse($fQ->fecha)->format('d/m/Y') : '---';
                            $numFicha = $fQ->correlativo ?? '---';
                            $cantidad = trim((string)($ins['cantidad'] ?? $ins['cantidad_usada'] ?? '---'));
                            if ($cantidad !== '---') {
                                $unidad = trim((string)($ins['unidad'] ?? $ins['unidad_medida'] ?? ''));
                                
                                // Abreviar unidades comunes para ahorrar espacio en el PDF
                                $unidadLower = strtolower($unidad);
                                if ($unidadLower === 'mililitros') $unidad = 'ml';
                                elseif ($unidadLower === 'litros') $unidad = 'L';
                                elseif ($unidadLower === 'kilogramos') $unidad = 'kg';
                                elseif ($unidadLower === 'gramos') $unidad = 'g';

                                // Agregar unidad a la cantidad si no la tiene ya
                                if ($unidad && stripos($cantidad, $unidad) === false) {
                                    $cantidad .= ' ' . $unidad;
                                }
                            }
                            
                            $key = $prod; 
                            
                            if (!isset($quimicosRastreros[$key])) {
                                $quimicosRastreros[$key] = [
                                    'producto' => $prod,
                                    'ingre_activo' => $ingActivo,
                                    'lote' => $ins['lote'] ?? '---',
                                    'concentracion' => $ins['concentracion'] ?? '---',
                                    'metodo' => $ins['metodo'] ?? '---',
                                    'visitas' => []
                                ];
                            }
                            
                            $quimicosRastreros[$key]['visitas'][] = [
                                'fecha' => $fechaServicio,
                                'ficha' => $numFicha,
                                'cantidad' => $cantidad
                            ];
                        }
                    }
                }
            }

            // --- NUEVO: PREPARAR TABLA DE QUÍMICOS Y AREAS PARA CADA TIPO DE SERVICIO ---
            $datosServicios = [];
            if (!empty($idProgramaciones)) {
                $fichasQuimicas = \App\Models\FichaOperacional::with(['programacionServicio'])
                    ->whereIn('id_programacion_servicio', $idProgramaciones)
                    ->orderBy('fecha', 'asc')->get();
                foreach ($fichasQuimicas as $fQ) {
                    $tipoServicio = 'Otros';
                    $visitasRaw = is_array($informe->visitas) ? $informe->visitas : [];
                    foreach ($visitasRaw as $v) {
                        if (($v['id_programacion'] ?? null) == $fQ->id_programacion_servicio) {
                            $tipoServicio = $v['tipo_servicio'] ?? 'Otros';
                            break;
                        }
                    }
                    
                    $tipoServicioUpper = strtoupper(trim($tipoServicio));
                    
                    if (!isset($datosServicios[$tipoServicioUpper])) {
                        $datosServicios[$tipoServicioUpper] = [
                            'quimicos' => [],
                            'areas_aplicadas' => [],
                            'productos' => []
                        ];
                    }
                    
                    if (is_array($fQ->areas_tratadas)) {
                        foreach ($fQ->areas_tratadas as $area) {
                            $a = trim($area);
                            if ($a && !in_array($a, $datosServicios[$tipoServicioUpper]['areas_aplicadas'])) {
                                $datosServicios[$tipoServicioUpper]['areas_aplicadas'][] = $a;
                            }
                        }
                    }
                    
                    if (is_array($fQ->insumos_utilizados)) {
                        foreach ($fQ->insumos_utilizados as $ins) {
                            $prod = strtoupper(trim($ins['producto'] ?? ''));
                            if (!$prod) continue;
                            
                            $ingActivo = '---';
                            $productoDB = \App\Models\Producto::whereRaw('UPPER(descripcion) LIKE ?', ["%$prod%"])->first();
                            if ($productoDB && $productoDB->ingre_activo) {
                                $ingActivo = $productoDB->ingre_activo;
                            }
                            
                            $fechaServicio = $fQ->fecha ? \Carbon\Carbon::parse($fQ->fecha)->format('d/m/Y') : '---';
                            $numFicha = $fQ->correlativo ?? '---';
                            $cantidad = trim((string)($ins['cantidad'] ?? $ins['cantidad_usada'] ?? '---'));
                            if ($cantidad !== '---') {
                                $unidad = trim((string)($ins['unidad'] ?? $ins['unidad_medida'] ?? ''));
                                $unidadLower = strtolower($unidad);
                                if ($unidadLower === 'mililitros') $unidad = 'ml';
                                elseif ($unidadLower === 'litros') $unidad = 'L';
                                elseif ($unidadLower === 'kilogramos') $unidad = 'kg';
                                elseif ($unidadLower === 'gramos') $unidad = 'g';
                                
                                if ($unidad && stripos($cantidad, $unidad) === false) {
                                    $cantidad .= ' ' . $unidad;
                                }
                            }
                            
                            $key = $prod;
                            if (!isset($datosServicios[$tipoServicioUpper]['quimicos'][$key])) {
                                    $datosServicios[$tipoServicioUpper]['quimicos'][$key] = [
                                        'producto' => $prod,
                                        'ingre_activo' => $ingActivo,
                                        'lote' => $ins['lote'] ?? '---',
                                        'concentracion' => $ins['concentracion'] ?? '---',
                                        'metodo' => $ins['metodo'] ?? '---',
                                        'visitas' => []
                                    ];
                            }
                            
                            $datosServicios[$tipoServicioUpper]['quimicos'][$key]['visitas'][] = [
                                'fecha' => $fechaServicio,
                                'ficha' => $numFicha,
                                'cantidad' => $cantidad
                            ];
                        }
                    }
                }
            }

            // Procesar imágenes y equipos para cada tipo de servicio
            foreach ($datosServicios as $tipoServ => &$ds) {
                $seen = [];
                $insumosAprocesar = [];
                foreach ($ds['quimicos'] as $q) {
                    $insumosAprocesar[] = ['producto' => $q['producto']];
                }
                
                if (str_contains($tipoServ, 'LIMPIEZA')) {
                    $insumosAprocesar = array_merge($insumosAprocesar, [
                        ['producto' => 'ESCOBA'], 
                        ['producto' => 'BALDE'], 
                        ['producto' => 'RECOGEDOR'], 
                        ['producto' => 'ESCOBILLON'],
                        ['producto' => 'FRANELA']
                    ]);
                }
                
                foreach ($insumosAprocesar as $ins) {
                    $prodName = $ins['producto'] ?? '';
                    if (!$prodName || isset($seen[$prodName])) continue;
                    $seen[$prodName] = true;
                    
                    $imgData = $obtenerImagenGenerica($prodName);
                    $b64 = $imgData['base64'] ?? ($imgData['imagen_base64'] ?? null);
                    if ($b64) {
                        $ds['productos'][] = ['titulo' => $prodName, 'base64' => $b64];
                    }
                }
                
                $ds['quimicos'] = array_values($ds['quimicos']);
            }
            unset($ds);

            Log::info("Preparando datos para la vista PDF...");
            $finalData = [
                'chart_url_roedores' => $chartUrl, 
                'chart_url_anual' => $chartUrlAnual, 
                'chart_url_indice' => $chartUrlIndice,
                'chart_url_jaulas' => $chartUrlJaulas, 
                'chart_url_anual_jaulas' => $chartUrlAnualJaulas, 
                'chart_url_indice_jaulas' => $chartUrlIndiceJaulas,
                'dispositivos_cebo' => $dispositivosCebo, 
                'dispositivos_lamina' => $dispositivosLamina,
                'dispositivos_jaula' => $dispositivosJaula, 
                'dispositivos_trampa_luz' => $dispositivosTrampaLuz,
                'dispositivos_rastreros' => $dispositivosRastreros,
                'dispositivos_tubo_cebadero' => $dispositivosTuboCebadero,
                'lote_cebo' => $obtenerLoteDelEntregado('FINAL,BLOX,CEBO'),
                'lote_lamina' => $obtenerLoteDelEntregado('LAMINA,PEGANTE,FUMITRAP'),
                'concentracion_cebo' => '0.005%',
                'concentracion_lamina' => '61.80%',
                'quimicos_rastreros' => $quimicosRastreros,
                'areas_aplicadas' => count($areasAplicadas) > 0 ? implode(', ', $areasAplicadas) : 'Sin áreas registradas',
                'CONTROL DE ROEDORES' => [
                    'items' => [
                        ['titulo' => 'CAJA CEBADERA', 'data' => $obtenerImagenGenerica('CAJA CEBADERA,CAJA') ?? null],
                        ['titulo' => 'JAULA DE CAPTURA', 'data' => $obtenerImagenGenerica('JAULA,CAPTURA') ?? null],
                        ['titulo' => 'FINAL ALLWEATHER BLOX', 'data' => $obtenerDatosDelEntregado('FINAL,BLOX,CEBO') ?? $obtenerImagenGenerica('FINAL,BLOX,CEBO') ?? null],
                        ['titulo' => 'LAMINA PEGANTE', 'data' => $obtenerDatosDelEntregado('LAMINA,PEGANTE,FUMITRAP') ?? $obtenerImagenGenerica('LAMINA,PEGANTE') ?? null],
                    ]
                ],
                'CONTROL DE INSECTOS VOLADORES' => [
                    'items' => [
                        ['titulo' => 'TRAMPA DE LUZ', 'data' => $obtenerImagenGenerica('TRAMPA,LUZ') ?? null],
                        ['titulo' => 'LAMINA PEGANTE', 'data' => $obtenerDatosDelEntregado('LAMINA,PEGANTE,FUMITRAP') ?? $obtenerImagenGenerica('LAMINA,PEGANTE') ?? null],
                    ]
                ],
                'CONTROL DE INSECTOS RASTREROS' => [
                    'items' => array_merge(
                        [['titulo' => 'ASPERSOR MANUAL (JACTO)', 'data' => $obtenerImagenGenerica('ASPERSOR,JACTO') ?? null]],
                        array_values(array_map(function($q) use ($obtenerDatosDelEntregado, $obtenerImagenGenerica) {
                            return [
                                'titulo' => $q['producto'],
                                'data' => $obtenerDatosDelEntregado($q['producto']) ?? $obtenerImagenGenerica($q['producto']) ?? null
                            ];
                        }, $quimicosRastreros))
                    )
                ],
                'datos_servicios' => $datosServicios,
            ];
            
            // Mezclar preservando lo que ya esté en extraData (como los gráficos de voladores)
            $extraData = array_merge($finalData, $extraData);

            // Detectar si la actividad corresponde a limpieza de cisternas/reservorios
            $actividadUpper = strtoupper(trim((string)($informe->actividad ?? '')));
            if (str_contains($actividadUpper, 'CISTERN') || str_contains($actividadUpper, 'RESERVOR') || str_contains($actividadUpper, 'LIMPIEZA')) {
                // Preparar datos específicos para el partial de limpieza de cisternas
                $limpiezaProductos = [];
                
                // Productos químicos usados + equipos comunes
                $insumosAprocesar = array_merge(
                    array_values($quimicosRastreros ?? []),
                    [
                        ['producto' => 'ESCOBA'], 
                        ['producto' => 'BALDE'], 
                        ['producto' => 'RECOGEDOR'], 
                        ['producto' => 'ESCOBILLON'],
                        ['producto' => 'FRANELA']
                    ]
                );
                
                $seen = [];
                foreach ($insumosAprocesar as $ins) {
                    $prodName = $ins['producto'] ?? '';
                    if (!$prodName || isset($seen[$prodName])) continue;
                    $seen[$prodName] = true;
                    
                    $imgData = $obtenerImagenGenerica($prodName);
                    $b64 = $imgData['base64'] ?? ($imgData['imagen_base64'] ?? null);
                    if ($b64) {
                        $limpiezaProductos[] = ['titulo' => $prodName, 'base64' => $b64];
                    }
                }

                $areasLimpiezaStr = $informe->conclusiones['areas_limpieza'] ?? '';
                $areasAplicadasLimpieza = [];
                if (!empty(trim($areasLimpiezaStr))) {
                    $areasAplicadasLimpieza = array_filter(array_map('trim', preg_split('/[;\n]+/', $areasLimpiezaStr)));
                } else {
                    $medidas = [];
                    foreach ($idProgramaciones as $vId) {
                        $prog = \App\Models\ProgramacionServicio::find($vId);
                        if ($prog && $prog->id_orden_servicio && $prog->id_servicio) {
                            $ods = \App\Models\OrdenServicio::find($prog->id_orden_servicio);
                            if ($ods && $ods->id_cotizacion) {
                                $cDetalles = \App\Models\CotizacionDetalle::where('id_cotizacion', $ods->id_cotizacion)
                                    ->where('id_servicio', $prog->id_servicio)
                                    ->get();
                                foreach ($cDetalles as $cd) {
                                    if (!empty($cd->medida_tanque)) {
                                        $arr = is_string($cd->medida_tanque) ? json_decode($cd->medida_tanque, true) : $cd->medida_tanque;
                                        if (is_array($arr)) {
                                            foreach ($arr as $m) {
                                                $medidas[] = "Cisterna o reservorio de $m m3";
                                            }
                                        } else {
                                            $medidas[] = "Cisterna o reservorio de {$cd->medida_tanque} m3";
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (count($medidas) > 0) {
                        $areasAplicadasLimpieza = array_unique($medidas);
                    } else {
                        $areasAplicadasLimpieza = $areasAplicadas;
                    }
                }

                $extraData['limpieza_cisterna'] = true;
                $extraData['limpieza_data'] = [
                    'quimicos' => array_values($quimicosRastreros ?? []),
                    'areas_aplicadas' => $areasAplicadasLimpieza,
                    'productos' => $limpiezaProductos,
                ];
            }

            // Asignar limpieza_data por compatibilidad si no está definido pero existe en datos_servicios
            if (empty($extraData['limpieza_data'])) {
                if (isset($datosServicios['LIMPIEZA DE CISTERNAS'])) {
                    $extraData['limpieza_data'] = $datosServicios['LIMPIEZA DE CISTERNAS'];
                } elseif (isset($datosServicios['LIMPIEZA'])) {
                    $extraData['limpieza_data'] = $datosServicios['LIMPIEZA'];
                }
            }

            Log::info("Preparativos listos. Renderizando vista con DomPDF...");
            $pdf = Pdf::loadView('InformeTecnicoPDF', compact('informe', 'extraData'));
            $pdf->setPaper('a4', 'portrait');
            Log::info("PDF renderizado correctamente.");

            return $pdf->stream("Informe_Tecnico_{$id}.pdf");

        } catch (\Throwable $e) {
            Log::error("ERROR CRÍTICO GENERAR PDF: " . $e->getMessage(), [
                'file' => $e->getFile(), 'line' => $e->getLine(), 'trace' => $e->getTraceAsString()
            ]);
            return response()->make("<h2>Error al generar el PDF</h2><p><b>Mensaje:</b> {$e->getMessage()}</p><p><b>Archivo:</b> {$e->getFile()}</p><p><b>Línea:</b> {$e->getLine()}</p>", 500);
        }
    }

    /**
     * Obtener el próximo correlativo disponible
     */
    public function proximoCorrelativo()
    {
        try {
            $ultimo = InformeTecnico::latest('id')->first();
            $numero = 1;

            if ($ultimo && preg_match('/IT-OP-(\d+)/', $ultimo->correlativo, $matches)) {
                $numero = (int)$matches[1] + 1;
            }

            return response()->json([
                'success' => true,
                'correlativo' => 'IT-OP-' . str_pad($numero, 4, '0', STR_PAD_LEFT)
            ]);
        } catch (\Throwable $e) {
            Log::error("Error en proximoCorrelativo: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar todos los informes técnicos
     */
    public function index()
    {
        $informes = InformeTecnico::with(['cliente'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $informes
        ]);
    }

    /**
     * Crear un nuevo informe técnico
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_cliente' => 'required|integer',
            'mes_actividad' => 'required|string|max:20',
            'fecha_emision' => 'required|date',
            'elaborado_por' => 'nullable|string|max:255',
            'actividad' => 'nullable|string',
            'ubicacion' => 'nullable|string|max:255',
            'hoja_tipo' => 'nullable|in:verdadera,falsa',
            'visitas' => 'nullable|array',
            'evidencias' => 'nullable|array',
            'conclusiones' => 'nullable',
            'insumos' => 'nullable|array',
            'estado' => 'nullable|string|max:50',
            'estilo' => 'nullable|string|max:50',
        ]);

        $validated['conclusiones'] = $this->normalizarConclusiones($validated['conclusiones'] ?? null);

        // En este proyecto se usa la tabla 'personal' para usuarios/empleados
        $idUsuario = (int) ($request->user()?->id ?? 10); 

        $informe = new InformeTecnico();
        $informe->fill($validated);
        $informe->id_usuario_creador = $idUsuario;
        $informe->save();

        return response()->json([
            'success' => true,
            'message' => 'Informe técnico creado correctamente',
            'data' => $informe
        ]);
    }

    /**
     * Mostrar un informe técnico específico
     */
    public function show($id)
    {
        $informe = InformeTecnico::with(['cliente', 'usuarioCreador'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $informe
        ]);
    }

    /**
     * Actualizar un informe técnico
     */
    public function update(Request $request, $id)
    {
        $informe = InformeTecnico::findOrFail($id);

        $validated = $request->validate([
            'id_cliente' => 'nullable|integer',
            'mes_actividad' => 'nullable|string|max:20',
            'fecha_emision' => 'nullable|date',
            'elaborado_por' => 'nullable|string|max:255',
            'actividad' => 'nullable|string',
            'ubicacion' => 'nullable|string|max:255',
            'hoja_tipo' => 'nullable|in:verdadera,falsa',
            'visitas' => 'nullable|array',
            'evidencias' => 'nullable|array',
            'conclusiones' => 'nullable',
            'insumos' => 'nullable|array',
            'estado' => 'nullable|string|max:50',
            'estilo' => 'nullable|string|max:50',
        ]);

        $validated['conclusiones'] = $this->normalizarConclusiones($validated['conclusiones'] ?? null);

        $informe->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Informe técnico actualizado correctamente',
            'data' => $informe
        ]);
    }

    /**
     * Eliminar un informe técnico (borrado lógico)
     */
    public function destroy($id)
    {
        $informe = InformeTecnico::findOrFail($id);
        $informe->delete();

        return response()->json([
            'success' => true,
            'message' => 'Informe técnico eliminado correctamente'
        ]);
    }

    private function normalizarConclusiones(mixed $value): ?string
    {
        if (is_array($value)) {
            $roedores = trim((string) ($value['roedores'] ?? ''));
            $voladores = trim((string) ($value['voladores'] ?? ''));
            $rastreros = trim((string) ($value['rastreros'] ?? ''));
            $limpieza = trim((string) ($value['limpieza'] ?? ''));
            $voladoresAnexo = !empty($value['voladores_anexo']) ? true : false;
            $voladoresResultados = trim((string) ($value['voladores_resultados'] ?? ''));

            if ($roedores === '' && $voladores === '' && $rastreros === '' && $limpieza === '' && !$voladoresAnexo && $voladoresResultados === '') {
                return null;
            }

            return json_encode([
                'roedores' => $roedores,
                'voladores' => $voladores,
                'rastreros' => $rastreros,
                'limpieza' => $limpieza,
                'voladores_anexo' => $voladoresAnexo,
                'voladores_resultados' => $voladoresResultados,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        if (is_string($value)) {
            $value = trim($value);
            return $value === '' ? null : $value;
        }

        return null;
    }
}
