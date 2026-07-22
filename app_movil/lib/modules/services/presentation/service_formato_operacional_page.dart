import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../data/services_repository.dart';
import '../domain/service_task.dart';

String _valueOrDash(String? value) {
  final text = value?.trim() ?? '';
  return text.isEmpty ? '-' : text;
}

class _InsectFamily {
  const _InsectFamily({
    required this.key,
    required this.title,
    required this.subtitle,
  });

  final String key;
  final String title;
  final String subtitle;
}

class _DualCountDraft {
  _DualCountDraft()
      : verdaderaController = TextEditingController(text: '0'),
        auditivaController = TextEditingController(text: '0');

  final TextEditingController verdaderaController;
  final TextEditingController auditivaController;

  int get verdadera => int.tryParse(verdaderaController.text.trim()) ?? 0;
  int get auditiva => int.tryParse(auditivaController.text.trim()) ?? 0;
}

class _RastreroCountDraft {
  _RastreroCountDraft()
      : verdaderaController = TextEditingController(text: '0'),
        falsaController = TextEditingController(text: '0');

  final TextEditingController verdaderaController;
  final TextEditingController falsaController;

  int get verdadera => int.tryParse(verdaderaController.text.trim()) ?? 0;
  int get falsa => int.tryParse(falsaController.text.trim()) ?? 0;
}

class _RastreroStageCountDraft {
  _RastreroStageCountDraft()
      : verdaderaController = TextEditingController(text: '0'),
        auditivaController = TextEditingController(text: '0');

  final TextEditingController verdaderaController;
  final TextEditingController auditivaController;

  int get verdadera => int.tryParse(verdaderaController.text.trim()) ?? 0;
  int get auditiva => int.tryParse(auditivaController.text.trim()) ?? 0;
}

const List<_InsectFamily> _insectFamilies = <_InsectFamily>[
  _InsectFamily(
    key: 'muscidae',
    title: 'Fam. Muscidae',
    subtitle: '(mosca domestica)',
  ),
  _InsectFamily(
    key: 'drosophilidae',
    title: 'Fam. Drosophilidae',
    subtitle: '(mosca de vinagre)',
  ),
  _InsectFamily(
    key: 'phoridae',
    title: 'Fam. Phoridae',
    subtitle: '(mosca jorobada)',
  ),
  _InsectFamily(
    key: 'psychodidae',
    title: 'Fam. Psychodidae',
    subtitle: '(mosca de drenaje)',
  ),
  _InsectFamily(
    key: 'chironomidae',
    title: 'Fam. Chironomidae',
    subtitle: '(mosquito enano)',
  ),
  _InsectFamily(
    key: 'culicidae',
    title: 'Fam. Culicidae',
    subtitle: '(mosquitos)',
  ),
  _InsectFamily(
    key: 'pyralidae_tineridae_gelechidae',
    title: 'Fam. Pyralidae/Tineridae/Gelechidae',
    subtitle: '(polillas)',
  ),
  _InsectFamily(
    key: 'sarcophagidae_calliphoridae',
    title: 'Fam. Sarcophagidae/Calliphoridae',
    subtitle: '(mosca de la carne/mosca metalica)',
  ),
  _InsectFamily(
    key: 'otros_no_identificados',
    title: 'Otros no identificados',
    subtitle: '',
  ),
];

const List<_InsectFamily> _yambolyInsectFamilies = <_InsectFamily>[
  _InsectFamily(
    key: 'moscas_domesticas',
    title: 'Moscas Domésticas',
    subtitle: '',
  ),
  _InsectFamily(
    key: 'mosca_menor',
    title: 'Mosca Menor',
    subtitle: '',
  ),
  _InsectFamily(
    key: 'zancudo',
    title: 'Zancudo',
    subtitle: '',
  ),
  _InsectFamily(
    key: 'avispa',
    title: 'Avispa',
    subtitle: '',
  ),
  _InsectFamily(
    key: 'abeja',
    title: 'Abeja',
    subtitle: '',
  ),
  _InsectFamily(
    key: 'mariposa',
    title: 'Mariposa',
    subtitle: '',
  ),
  _InsectFamily(
    key: 'polilla',
    title: 'Polilla',
    subtitle: '',
  ),
  _InsectFamily(
    key: 'gorgojo',
    title: 'Gorgojo',
    subtitle: '',
  ),
];

const List<String> _estadoLaminaOptions = <String>['D', 'M', 'B'];
const List<String> _estadioLabels = <String>['Adulto', 'Ninfa', 'Ooteca'];

class ServiceFormatoOperacionalPage extends StatefulWidget {
  const ServiceFormatoOperacionalPage({
    super.key,
    required this.representativeService,
    required this.groupedServices,
    required this.servicesRepository,
  });

  final ServiceTask representativeService;
  final List<ServiceTask> groupedServices;
  final ServicesRepository servicesRepository;

  @override
  State<ServiceFormatoOperacionalPage> createState() => _ServiceFormatoOperacionalPageState();
}

class _ServiceFormatoOperacionalPageState extends State<ServiceFormatoOperacionalPage> {
  static const List<String> _estadoOptions = <String>['D', 'A', 'B', 'N', 'OB'];
  static const List<String> _estadoOptionsVoladores = <String>['A', 'B', 'AP', 'D', 'OB'];
  static const List<String> _hallazgoOptions = <String>['C-TP', 'C-J', 'C-R', 'CNT-SC'];
  static const List<String> _senalOptions = <String>['C', 'E', 'H', 'O', 'P', 'R'];

  final _formKey = GlobalKey<FormState>();
  late Future<List<_DispositivoGroup>> _futureGroups;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _futureGroups = _loadGroups();
  }

  bool get _isYamboly => widget.representativeService.client.toUpperCase().contains('YAMBOLY');

  List<ServiceTask> get _effectiveServices {
    if (widget.groupedServices.isNotEmpty) {
      return widget.groupedServices;
    }
    return <ServiceTask>[widget.representativeService];
  }

  List<String> get _formatosFichasDisponibles {
    final raw = _effectiveServices
        .expand((service) => service.formatosFichas)
        .map((formato) => formato.trim())
        .where((formato) => formato.isNotEmpty)
        .toSet()
        .toList(growable: false);
    if (raw.isNotEmpty) {
      return raw;
    }
    return const <String>[];
  }

  String get _formatoFichasSeleccionado {
    final formatos = _formatosFichasDisponibles;
    if (formatos.isEmpty) {
      return 'Formato Operacional';
    }
    return formatos.join(' + ');
  }

  String get _formatosFichasResumen {
    final formatos = _formatosFichasDisponibles;
    if (formatos.isEmpty) {
      return 'Sin formatos seleccionados en programación';
    }
    if (formatos.length == 1) {
      return formatos.first;
    }
    return formatos.join(' + ');
  }

  Future<List<_DispositivoGroup>> _loadGroups() async {
    final serviceIds = _effectiveServices.map((s) => s.id).toSet().toList(growable: false);
    final representativeId = widget.representativeService.id;

    final calculo = await widget.servicesRepository.getFormatoOperacionalCalculo(
      programacionId: representativeId,
      idsProgramaciones: serviceIds,
    );

    final seccionesRaw = (calculo['secciones'] as List<dynamic>? ?? const <dynamic>[])
        .whereType<Map<String, dynamic>>()
        .toList(growable: false);

    return seccionesRaw
      .map<_DispositivoGroup>((section) {
          final cantidad = (section['cantidad_asignada'] as num?)?.toInt() ??
              (section['cantidad'] as num?)?.toInt() ??
              0;
          final tipoSeccion = (section['tipo_seccion'] ?? section['tipo'] ?? 'otros').toString();
          final titulo = (section['titulo']?.toString().trim().isNotEmpty ?? false)
              ? section['titulo'].toString().trim()
              : (section['descripcion']?.toString().trim().isNotEmpty ?? false)
                  ? section['descripcion'].toString().trim()
                  : 'Sección';
          
          // ─── LÓGICA DE MEMORIA TÉCNICA ───────────────────────────────────
          final historial = (section['historial_dispositivos'] as List<dynamic>? ?? const <dynamic>[])
              .whereType<Map<String, dynamic>>()
              .toList(growable: false);
          // ─────────────────────────────────────────────────────────────────

          final isJaula = _isJaulaSection(tipoSeccion, titulo);
          final isTrampaLuz = _isTrampaLuzSection(tipoSeccion, titulo);
          final isRastreros = _isRastrerosSection(tipoSeccion, titulo);
          
          final clientUpper = widget.representativeService.client.toUpperCase();
          final isYamboly = clientUpper.contains('YAMBOLY');
          final insectFamiliesToUse = isYamboly ? _yambolyInsectFamilies : _insectFamilies;
          
          final units = List.generate(
            cantidad < 0 ? 0 : cantidad,
            (index) {
              final draft = _DispositivoUnitDraft(
                enableInsectCounts: isTrampaLuz,
                insectFamilies: insectFamiliesToUse,
              );
              
              // Si hay historial para esta posición (index), rellenar ubicación
              if (index < historial.length) {
                final h = historial[index];
                final prevUbicacion = (h['ubicacion'] ?? '').toString();
                if (prevUbicacion.isNotEmpty) {
                  draft.ubicacionController.text = prevUbicacion;
                }
              }
              
              return draft;
            },
          );

          // ─── MANEJO DE UBICACIONES PARA RASTREROS (HISTORIAL) ─────────────
          final rastreroLocations = <_RastreroLocationDraft>[];
          if (isRastreros && cantidad > 0) {
            final seenLocations = <String>{};

            // Intentar reconstruir ubicaciones desde el historial
            final locationCounts = <String, int>{};
            for (final h in historial) {
              final loc = (h['ubicacion'] ?? '').toString().trim();
              locationCounts[loc] = (locationCounts[loc] ?? 0) + 1;
            }

            for (final entry in locationCounts.entries) {
              final loc = entry.key;
              final count = entry.value;
              final draft = _RastreroLocationDraft(initialQuantity: count);
              draft.ubicacionController.text = loc;
              rastreroLocations.add(draft);
            }

            // Si no hay historial o estaba vacío, poner una ubicación vacía por defecto
            if (rastreroLocations.isEmpty) {
              rastreroLocations.add(_RastreroLocationDraft(initialQuantity: 1));
            }
          }
          // ───────────────────────────────────────────────────────────────────

          final group = _DispositivoGroup(
            idProducto: (section['id_producto'] as num?)?.toInt() ?? 0,
            descripcion: isJaula ? 'Jaulas' : titulo,
            tipoSeccion: tipoSeccion,
            codePrefix: isJaula ? 'J' : _codePrefixForType(tipoSeccion, titulo, isRastreros),
            unitLabel: isJaula ? 'jaula' : (isRastreros ? 'lámina pegante' : 'unidad'),
            cantidadTotal: cantidad,
            isVoladores: isTrampaLuz,
            isRastreros: isRastreros,
            formatoOperacional: _detectarFormatoOperacional(tipoSeccion, titulo),
            rastreroLocations: rastreroLocations,
            units: units,
          );

          return group;
        })
        .where((group) => group.cantidadTotal > 0)
        .toList(growable: false);
  }

  bool _isJaulaSection(String tipoSeccion, String titulo) {
    final normalized = _normalizeText('$tipoSeccion $titulo');
    return normalized.contains('jaula');
  }

  bool _isTrampaLuzSection(String tipoSeccion, String titulo) {
    final normalized = _normalizeText('$tipoSeccion $titulo');
    return normalized.contains('trampa') && normalized.contains('luz');
  }

  bool _isCajaCebaderaSection(String tipoSeccion, String titulo) {
    final normalized = _normalizeText('$tipoSeccion $titulo');
    return normalized.contains('caja cebadera') || normalized.contains('cajas cebaderas');
  }

  String _detectarFormatoOperacional(String tipoSeccion, String titulo) {
    final normalized = _normalizeText('$tipoSeccion $titulo');
    
    // 1. Voladores
    if (normalized.contains('trampa') && normalized.contains('luz')) {
      return 'CONTROL DE INSECTOS VOLADORES';
    }
    
    // 2. Roedores (Prioridad sobre láminas genéricas)
    if (_isCajaCebaderaSection(tipoSeccion, titulo) || normalized.contains('cebadera') || normalized.contains('cebo') || normalized.contains('tubo')) {
      return 'CONTROL DE ROEDORES';
    }
    
    // 3. Rastreros
    if (normalized.contains('lamina') && (normalized.contains('rastreros') || normalized.contains('pegante') || normalized.contains('adhesiva'))) {
      return 'CONTROL DE INSECTOS RASTREROS';
    }

    return 'CONTROL DE ROEDORES';
  }

  bool _isRastrerosSection(String tipoSeccion, String titulo) {
    if (tipoSeccion == 'rastreros_lamina') return true;
    final normalized = _normalizeText('$tipoSeccion $titulo');
    if (_isCajaCebaderaSection(tipoSeccion, titulo)) {
      return false;
    }
    return normalized.contains('lamina') && (normalized.contains('rastreros') || normalized.contains('pegante') || normalized.contains('adhesiva'));
  }

  String _codePrefixForType(String tipoSeccion, String titulo, bool isRastreros) {
    final normalized = _normalizeText('$tipoSeccion $titulo');
    if (normalized.contains('trampa') && normalized.contains('luz')) {
      return 'TL';
    }
    if (isRastreros) {
      return 'L';
    }
    if (normalized.contains('tubo')) {
      return 'TB';
    }
    if (normalized.contains('cebo') || normalized.contains('lamina')) {
      return 'C';
    }
    return 'C';
  }

  String _normalizeText(String raw) {
    return raw
        .toLowerCase()
        .replaceAll('á', 'a')
        .replaceAll('é', 'e')
        .replaceAll('í', 'i')
        .replaceAll('ó', 'o')
        .replaceAll('ú', 'u');
  }

  int _totalUnits(List<_DispositivoGroup> groups) {
    return groups.fold(0, (sum, g) => sum + g.cantidadTotal);
  }

  String _formatDisplayName(String formato) {
    final normalized = _normalizeText(formato);
    if (normalized.contains('voladores')) {
      return 'Control de Insectos Voladores';
    }
    if (normalized.contains('rastreros')) {
      return 'Control de Insectos Rastreros';
    }
    if (normalized.contains('roedores')) {
      return 'Control de Roedores';
    }
    return formato;
  }

  List<String> _formatosOrdenados(List<_DispositivoGroup> groups) {
    final formatos = <String>[];
    for (final group in groups) {
      final formato = group.formatoOperacional ?? 'CONTROL DE ROEDORES';
      if (!formatos.contains(formato)) {
        formatos.add(formato);
      }
    }
    return formatos;
  }

  List<Widget> _buildFormatoBlocks(List<_DispositivoGroup> groups) {
    final formatos = _formatosOrdenados(groups);
    final multipleFormatos = formatos.length > 1;

    return formatos.expand((formato) {
      final formatGroups = groups
          .where((group) => (group.formatoOperacional ?? 'CONTROL DE ROEDORES') == formato)
          .toList(growable: false);

      final hasVoladoresSection = formatGroups.any((g) => g.isVoladores);
      final hasRastrerosSection = formatGroups.any((g) => g.isRastreros);
      final hasRodentOrOtherSections = formatGroups.any((g) => !g.isVoladores && !g.isRastreros);

      final children = <Widget>[
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.inventory_2_outlined, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _formatDisplayName(formato).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      multipleFormatos
                          ? 'Formato operacional combinado'
                          : '${_formatDisplayName(formato)} · ${groups.fold<int>(0, (sum, g) => sum + g.cantidadTotal)} elementos',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        _LegendCard(
          title: hasVoladoresSection ? 'Leyenda de estado del dispositivo' : 'Leyenda de Estados',
          items: hasVoladoresSection
              ? const <String>[
                  'A = Dispositivo averiado',
                  'B = Buen estado',
                  'AP = Dispositivo apagado',
                  'D = Dispositivo desaparecido',
                  'OB = Dispositivo obstruido',
                ]
              : const <String>['D = Desinstalado', 'A = Averiado', 'B = Buen estado', 'N = No encontrado', 'OB = Obstruido'],
        ),
        const SizedBox(height: 12),
        if (hasRodentOrOtherSections)
          _LegendCard(
            title: 'Leyenda de Hallazgos y Presencia',
            items: const <String>['C-TP = Captura en trampa pegante', 'C-J = Captura en jaula', 'C-R = Consumo de rodenticida', 'CNT-SC = Consumo de cebo no tóxico', 'C / E / H / O / P / R = Señales de presencia'],
          ),
        if (hasVoladoresSection)
          _LegendCard(
            title: 'Insectos',
            items: <String>[
              _isYamboly
                  ? 'Registrar conteo Verdadera y Auditiva por insecto'
                  : 'Registrar conteo Verdadera y Auditiva por familia',
            ],
          ),
        if (hasRastrerosSection) ...[
          const SizedBox(height: 12),
          const _LegendCard(
            title: 'Leyenda de Estado de Lámina',
            items: <String>['D = Lámina desprendida', 'M = Lámina mojada', 'B = Lámina en buen estado'],
          ),
          const SizedBox(height: 12),
          const _LegendCard(
            title: 'Leyenda de Estadio',
            items: <String>['Adulto', 'Ninfa', 'Ooteca'],
          ),
        ],
        const SizedBox(height: 16),
        ...formatGroups.asMap().entries.expand((entry) {
          final groupIndex = entry.key;
          final group = entry.value;
          final startCode = groups
                  .take(groups.indexOf(group))
                  .where((previous) => previous.codePrefix == group.codePrefix)
                  .fold<int>(0, (sum, previous) => sum + previous.cantidadTotal) +
              1;

          return <Widget>[
            if (group.isRastreros)
              _RastreroGroupSection(
                key: ValueKey('rastrero-${formato}-${groupIndex}-${group.descripcion}'),
                group: group,
                startCode: startCode,
              )
            else
              _GroupSection(
                key: ValueKey('group-${formato}-${groupIndex}-${group.descripcion}'),
                group: group,
                startCode: startCode,
                estadoOptions: group.isVoladores ? _estadoOptionsVoladores : _estadoOptions,
                hallazgoOptions: _hallazgoOptions,
                senalOptions: _senalOptions,
              ),
          ];
        }),
        const SizedBox(height: 18),
      ];

      return children;
    }).toList(growable: false);
  }

  Future<void> _submit() async {
    final valid = _formKey.currentState?.validate() ?? false;
    if (!valid) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Por favor, completa todos los campos requeridos marcados en rojo.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    final groups = await _futureGroups;
    if (groups.isEmpty) {
      if (!mounted) return;
      Navigator.of(context).pop(true);
      return;
    }

    final payload = _buildPayload(groups);
    await widget.servicesRepository.saveFormatoOperacionalDraft(
      programacionId: widget.representativeService.id,
      formData: payload,
    );

    if (!mounted) return;
    Navigator.of(context).pop(true);
  }

  Map<String, dynamic> _buildPayload(List<_DispositivoGroup> groups) {
    final sections = <Map<String, dynamic>>[];
    // Mantener un contador global por prefijo para asegurar consecutividad (ej: C-01...C-10)
    final prefixSequences = <String, int>{};

    for (final group in groups) {
      final tipo = _sectionTypeFor(group.tipoSeccion);
      final items = <Map<String, dynamic>>[];
      final prefix = group.codePrefix;
      
      // Inicializar el contador para este prefijo si no existe
      prefixSequences[prefix] ??= 1;

      if (group.isRastreros) {
        for (final location in group.rastreroLocations) {
          final quantity = location.cantidad;
          for (final lamina in location.laminas.take(quantity)) {
            final currentSeq = prefixSequences[prefix]!;

            // Determinar si la hoja falsa (auditiva) tiene datos cargados
            final hasFilledAuditivaLamina = lamina.auditivaEstadoLamina != null && lamina.auditivaEstadoLamina!.trim().isNotEmpty;
            bool hasFilledAuditivaCounts = false;
            for (final estadio in _estadioLabels) {
              if ((lamina.estadioCounts[estadio]?.auditiva ?? 0) != 0) {
                hasFilledAuditivaCounts = true;
                break;
              }
            }

            final useVerdaderaForAuditiva = !hasFilledAuditivaLamina && !hasFilledAuditivaCounts;
            final effectiveAuditivaEstado = useVerdaderaForAuditiva
                ? lamina.verdaderaEstadoLamina
                : lamina.auditivaEstadoLamina;

            final conteoEstadio = <String, Map<String, int>>{
              for (final estadio in _estadioLabels)
                estadio: <String, int>{
                  'verdadera': lamina.estadioCounts[estadio]?.verdadera ?? 0,
                  'auditiva': useVerdaderaForAuditiva
                      ? (lamina.estadioCounts[estadio]?.verdadera ?? 0)
                      : (lamina.estadioCounts[estadio]?.auditiva ?? 0),
                },
            };

            items.add({
              'codigo_caja': '$prefix-${currentSeq.toString().padLeft(2, '0')}',
              'ubicacion': location.ubicacionController.text.trim(),
              'estado_dispositivo': _valueOrDash(lamina.verdaderaEstadoLamina),
              'estado_dispositivo_verdadera': _valueOrDash(lamina.verdaderaEstadoLamina),
              'estado_dispositivo_auditiva': _valueOrDash(effectiveAuditivaEstado),
              'estado_lamina': _valueOrDash(lamina.verdaderaEstadoLamina),
              'estado_lamina_verdadera': _valueOrDash(lamina.verdaderaEstadoLamina),
              'estado_lamina_auditiva': _valueOrDash(effectiveAuditivaEstado),
              'estadio': 'MULTIPLE',
              'conteo_estadio': conteoEstadio,
            });
            prefixSequences[prefix] = currentSeq + 1;
          }
        }
      } else {
        for (final unit in group.units) {
          final currentSeq = prefixSequences[prefix]!;

          // Determinar si la hoja falsa (auditiva) tiene datos cargados
          final hasFilledAuditivaDevice = (unit.estadoDispositivoAuditiva != null && unit.estadoDispositivoAuditiva!.trim().isNotEmpty) ||
              (unit.hallazgoAuditiva != null && unit.hallazgoAuditiva!.trim().isNotEmpty) ||
              (unit.senalesPresenciaAuditiva != null && unit.senalesPresenciaAuditiva!.trim().isNotEmpty);

          bool hasFilledAuditivaCounts = false;
          if (unit.hasInsectCounts) {
            for (final entry in unit.insectCounts.entries) {
              if (entry.value.auditiva != 0) {
                hasFilledAuditivaCounts = true;
                break;
              }
            }
          }

          final useVerdaderaForAuditiva = !hasFilledAuditivaDevice && !hasFilledAuditivaCounts;

          final effectiveEstadoAuditiva = useVerdaderaForAuditiva
              ? unit.estadoDispositivoVerdadera
              : unit.estadoDispositivoAuditiva;

          final effectiveHallazgoAuditiva = useVerdaderaForAuditiva
              ? unit.hallazgoVerdadera
              : unit.hallazgoAuditiva;

          final effectiveSenalesPresenciaAuditiva = useVerdaderaForAuditiva
              ? unit.senalesPresenciaVerdadera
              : unit.senalesPresenciaAuditiva;

          final item = <String, dynamic>{
            'codigo_caja': '$prefix-${currentSeq.toString().padLeft(2, '0')}',
            'ubicacion': unit.ubicacionController.text.trim(),
            'estado_dispositivo': unit.estadoDispositivoVerdadera,
            'estado_dispositivo_verdadera': unit.estadoDispositivoVerdadera,
            'estado_dispositivo_auditiva': effectiveEstadoAuditiva,
            'hallazgo': _valueOrDash(unit.hallazgoVerdadera),
            'hallazgo_verdadera': _valueOrDash(unit.hallazgoVerdadera),
            'hallazgo_auditiva': _valueOrDash(effectiveHallazgoAuditiva),
            'senales_presencia': _valueOrDash(unit.senalesPresenciaVerdadera),
            'senales_presencia_verdadera': _valueOrDash(unit.senalesPresenciaVerdadera),
            'senales_presencia_auditiva': _valueOrDash(effectiveSenalesPresenciaAuditiva),
          };

          if (unit.hasInsectCounts) {
            final insectCountsPayload = <String, Map<String, int>>{};
            for (final entry in unit.insectCounts.entries) {
              insectCountsPayload[entry.key] = <String, int>{
                'verdadera': entry.value.verdadera,
                'auditiva': useVerdaderaForAuditiva ? entry.value.verdadera : entry.value.auditiva,
              };
            }
            item['conteo_insectos'] = insectCountsPayload;
          }

          items.add(item);
          prefixSequences[prefix] = currentSeq + 1;
        }
      }

      final formatoOperacional = group.formatoOperacional ?? _detectarFormatoOperacional(group.tipoSeccion, group.descripcion);
      
      sections.add({
        'tipo': tipo,
        'tipo_seccion': tipo,
        'formato': formatoOperacional,
        'descripcion': group.descripcion,
        'items': items,
      });
    }

    return {
      'codigo_documento': 'FO-OP-002',
      'version': '01',
      'cliente': widget.representativeService.client,
      'direccion': widget.representativeService.address,
      'fecha': widget.representativeService.date,
      'hora_inicio': widget.representativeService.startTime,
      'hora_final': widget.representativeService.endTime,
      'observaciones': widget.representativeService.observations,
      'secciones': sections,
    };
  }

  String _sectionTypeFor(String descripcion) {
    final normalized = _normalizeText(descripcion);
    if (normalized.contains('tubo')) {
      return 'tubo_cebadero';
    }
    if (normalized.contains('cebo')) {
      return 'cebo';
    }
    if (normalized.contains('lamina')) {
      return 'lamina';
    }
    if (normalized.contains('trampa') && normalized.contains('luz')) {
      return 'trampa_luz';
    }
    return 'otros';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
        title: Text(_formatosFichasResumen.isEmpty ? 'Formato Operacional' : _formatosFichasResumen),
      ),
      body: FutureBuilder<List<_DispositivoGroup>>(
        future: _futureGroups,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, size: 42, color: Colors.red),
                    const SizedBox(height: 12),
                    Text(
                      'No se pudo cargar la lista de dispositivos.',
                      style: Theme.of(context).textTheme.titleMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      snapshot.error.toString(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () {
                        setState(() {
                          _futureGroups = _loadGroups();
                        });
                      },
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
            );
          }

          final groups = snapshot.data ?? const <_DispositivoGroup>[];
          final totalCount = _totalUnits(groups);
          final hasVoladoresSection = groups.any((g) => g.isVoladores);
          final hasRastrerosSection = groups.any((g) => g.isRastreros);
          final hasRodentOrOtherSections = groups.any((g) => !g.isVoladores && !g.isRastreros);
          final formatosDisponibles = _formatosFichasDisponibles;

          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _HeaderCard(
                  serviceTitle: _formatosFichasResumen.isEmpty ? 'Formato Operacional' : _formatosFichasResumen,
                  client: widget.representativeService.client,
                  address: widget.representativeService.address ?? 'Sin dirección',
                  count: totalCount,
                  groupCount: groups.length,
                  countLabel: hasRastrerosSection ? 'Total de láminas pegantes' : 'Dispositivos',
                ),
                if (groups.isEmpty)
                  _EmptyState(hasFormatos: formatosDisponibles.isNotEmpty)
                else if (_formatosOrdenados(groups).length > 1)
                  ..._buildFormatoBlocks(groups)
                else ...[
                  const SizedBox(height: 16),
                  _LegendCard(
                    title: hasVoladoresSection ? 'Leyenda de estado del dispositivo' : 'Leyenda de Estados',
                    items: hasVoladoresSection
                        ? const <String>[
                            'A = Dispositivo averiado',
                            'B = Buen estado',
                            'AP = Dispositivo apagado',
                            'D = Dispositivo desaparecido',
                            'OB = Dispositivo obstruido',
                          ]
                        : const <String>['D = Desinstalado', 'A = Averiado', 'B = Buen estado', 'N = No encontrado', 'OB = Obstruido'],
                  ),
                  const SizedBox(height: 12),
                  if (hasRodentOrOtherSections)
                    _LegendCard(
                      title: 'Leyenda de Hallazgos y Presencia',
                      items: const <String>['C-TP = Captura en trampa pegante', 'C-J = Captura en jaula', 'C-R = Consumo de rodenticida', 'CNT-SC = Consumo de cebo no tóxico', 'C / E / H / O / P / R = Señales de presencia'],
                    ),
                  if (hasVoladoresSection)
                    _LegendCard(
                      title: 'Insectos',
                      items: <String>[
                        _isYamboly
                            ? 'Registrar conteo Verdadera y Auditiva por insecto'
                            : 'Registrar conteo Verdadera y Auditiva por familia',
                      ],
                    ),
                  if (hasRastrerosSection) ...[
                    const SizedBox(height: 12),
                    const _LegendCard(
                      title: 'Leyenda de Estado de Lámina',
                      items: <String>['D = Lámina desprendida', 'M = Lámina mojada', 'B = Lámina en buen estado'],
                    ),
                    const SizedBox(height: 12),
                    const _LegendCard(
                      title: 'Leyenda de Estadio',
                      items: <String>['Adulto', 'Ninfa', 'Ooteca'],
                    ),
                  ],
                  const SizedBox(height: 16),
                  ...groups.asMap().entries.expand((entry) {
                    final groupIndex = entry.key;
                    final group = entry.value;
                    final startCode = groups
                            .take(groupIndex)
                            .where((previous) => previous.codePrefix == group.codePrefix)
                            .fold<int>(0, (sum, previous) => sum + previous.cantidadTotal) +
                        1;

                    return <Widget>[
                      if (group.isRastreros)
                        _RastreroGroupSection(
                          group: group,
                          startCode: startCode,
                        )
                      else
                        _GroupSection(
                          group: group,
                          startCode: startCode,
                          estadoOptions: group.isVoladores ? _estadoOptionsVoladores : _estadoOptions,
                          hallazgoOptions: _hallazgoOptions,
                          senalOptions: _senalOptions,
                        ),
                    ];
                  }),
                ],
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF1D4ED8),
                          side: const BorderSide(color: Color(0xFF1D4ED8)),
                        ),
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('Volver'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                        ),
                        onPressed: _isSaving
                            ? null
                            : () async {
                                setState(() => _isSaving = true);
                                try {
                                  await _submit();
                                } catch (e) {
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Error: ${e.toString()}'),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                } finally {
                                  if (mounted) {
                                    setState(() => _isSaving = false);
                                  }
                                }
                              },
                        child: _isSaving
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Guardar formato y continuar'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Data classes
// ---------------------------------------------------------------------------

class _DispositivoUnitDraft {
  _DispositivoUnitDraft({
    this.enableInsectCounts = false,
    this.insectFamilies = const <_InsectFamily>[],
  }) : insectCounts = enableInsectCounts
            ? {
                for (final family in insectFamilies) family.key: _DualCountDraft(),
              }
            : const <String, _DualCountDraft>{};

  final bool enableInsectCounts;
  final List<_InsectFamily> insectFamilies;
  final TextEditingController ubicacionController = TextEditingController();
  String? estadoDispositivoVerdadera;
  String? estadoDispositivoAuditiva;
  String? hallazgoVerdadera;
  String? hallazgoAuditiva;
  String? senalesPresenciaVerdadera;
  String? senalesPresenciaAuditiva;
  String? estadoLamina;
  String? estadio;
  final _RastreroCountDraft rastreroCounts = _RastreroCountDraft();
  final Map<String, _DualCountDraft> insectCounts;

  bool get hasInsectCounts => insectCounts.isNotEmpty;

  Map<String, Map<String, int>> insectCountsToJson() {
    final result = <String, Map<String, int>>{};
    for (final entry in insectCounts.entries) {
      result[entry.key] = <String, int>{
        'verdadera': entry.value.verdadera,
        'auditiva': entry.value.auditiva,
      };
    }
    return result;
  }

  Map<String, dynamic> toJson(int idProducto, String descripcion) {
    return <String, dynamic>{
      'id_producto': idProducto,
      'descripcion': descripcion,
      'ubicacion': ubicacionController.text.trim(),
      'estado_dispositivo': estadoDispositivoVerdadera,
      'estado_dispositivo_verdadera': estadoDispositivoVerdadera,
      'estado_dispositivo_auditiva': estadoDispositivoAuditiva,
      'hallazgo': _valueOrDash(hallazgoVerdadera),
      'hallazgo_verdadera': _valueOrDash(hallazgoVerdadera),
      'hallazgo_auditiva': _valueOrDash(hallazgoAuditiva),
      'senales_presencia': _valueOrDash(senalesPresenciaVerdadera),
      'senales_presencia_verdadera': _valueOrDash(senalesPresenciaVerdadera),
      'senales_presencia_auditiva': _valueOrDash(senalesPresenciaAuditiva),
      'estado_lamina': estadoLamina,
      'estadio': estadio,
      'conteo_estadio_verdadera': rastreroCounts.verdadera,
      'conteo_estadio_falsa': rastreroCounts.falsa,
    };
  }
}

class _DispositivoGroup {
  _DispositivoGroup({
    required this.idProducto,
    required this.descripcion,
    required this.tipoSeccion,
    required this.codePrefix,
    required this.unitLabel,
    required this.cantidadTotal,
    required this.isVoladores,
    required this.isRastreros,
    required this.rastreroLocations,
    required this.units,
    this.formatoOperacional,
  });

  final int idProducto;
  final String descripcion;
  final String tipoSeccion;
  final String codePrefix;
  final String unitLabel;
  final int cantidadTotal;
  final bool isVoladores;
  final bool isRastreros;
  final List<_RastreroLocationDraft> rastreroLocations;
  final List<_DispositivoUnitDraft> units;
  final String? formatoOperacional;

  List<Map<String, dynamic>> toJsonList() {
    return units.map((u) => u.toJson(idProducto, descripcion)).toList(growable: false);
  }
}

// ---------------------------------------------------------------------------
// Group section — header + individual unit cards
// ---------------------------------------------------------------------------

class _GroupSection extends StatelessWidget {
  const _GroupSection({
    super.key,
    required this.group,
    required this.startCode,
    required this.estadoOptions,
    required this.hallazgoOptions,
    required this.senalOptions,
  });

  final _DispositivoGroup group;
  final int startCode;
  final List<String> estadoOptions;
  final List<String> hallazgoOptions;
  final List<String> senalOptions;

  @override
  Widget build(BuildContext context) {
    String buildCode(int number) {
      if (group.codePrefix == 'T') {
        return 'T-${number.toString().padLeft(2, '0')}';
      }
      return '${group.codePrefix}-$number';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.inventory_2_outlined, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      group.descripcion.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      group.isRastreros
                          ? '${group.cantidadTotal} ${group.cantidadTotal > 1 ? 'láminas pegantes' : 'lámina pegante'}'
                          : '${group.cantidadTotal} ${group.unitLabel}${group.cantidadTotal > 1 ? 's' : ''}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Individual unit cards
        ...group.units.asMap().entries.map((entry) {
          final index = entry.key;
          final unit = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _UnitCard(
              code: buildCode(startCode + index),
              unit: unit,
              isVoladores: group.isVoladores,
              isRastreros: group.isRastreros,
              estadoOptions: estadoOptions,
              hallazgoOptions: hallazgoOptions,
              senalOptions: senalOptions,
            ),
          );
        }),

        const SizedBox(height: 8),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Rastreros section — multiple locations + lamina rows
// ---------------------------------------------------------------------------

class _RastreroLocationDraft {
  _RastreroLocationDraft({int initialQuantity = 1})
      : cantidadController = TextEditingController(text: initialQuantity.toString()) {
    syncLaminas();
  }

  final TextEditingController ubicacionController = TextEditingController();
  final TextEditingController cantidadController;
  final List<_RastreroLaminaDraft> laminas = <_RastreroLaminaDraft>[];

  int get cantidad => int.tryParse(cantidadController.text.trim()) ?? 1;

  void syncLaminas() {
    final target = cantidad <= 0 ? 1 : cantidad;
    while (laminas.length < target) {
      laminas.add(_RastreroLaminaDraft());
    }
    while (laminas.length > target) {
      laminas.removeLast();
    }
  }
}

class _RastreroLaminaDraft {
  _RastreroLaminaDraft()
      : verdaderaController = TextEditingController(text: '0'),
        auditivaController = TextEditingController(text: '0');

  String? verdaderaEstadoLamina;
  String? auditivaEstadoLamina;
  final TextEditingController verdaderaController;
  final TextEditingController auditivaController;
  final Map<String, _RastreroStageCountDraft> estadioCounts = <String, _RastreroStageCountDraft>{
    for (final estadio in _estadioLabels) estadio: _RastreroStageCountDraft(),
  };

  int get verdadera => int.tryParse(verdaderaController.text.trim()) ?? 0;
  int get auditiva => int.tryParse(auditivaController.text.trim()) ?? 0;
  int get falsa => auditiva;
}

class _RastreroGroupSection extends StatefulWidget {
  const _RastreroGroupSection({
    super.key,
    required this.group,
    required this.startCode,
  });

  final _DispositivoGroup group;
  final int startCode;

  @override
  State<_RastreroGroupSection> createState() => _RastreroGroupSectionState();
}

class _RastreroGroupSectionState extends State<_RastreroGroupSection> {
  List<_RastreroLocationDraft> get _locations => widget.group.rastreroLocations;

  int get _assignedTotal => _locations.fold<int>(0, (sum, location) => sum + location.cantidad);

  int get _remainingTotal => widget.group.cantidadTotal - _assignedTotal;

  void _addLocation() {
    if (_remainingTotal <= 0) {
      return;
    }

    setState(() {
      _locations.add(_RastreroLocationDraft(initialQuantity: 1));
    });
  }

  void _removeLocation(int index) {
    if (_locations.length <= 1) return;
    setState(() {
      _locations.removeAt(index);
    });
  }

  void _refreshLocation(_RastreroLocationDraft location, int maxAllowed) {
    final parsed = int.tryParse(location.cantidadController.text.trim()) ?? 1;
    final normalized = parsed.clamp(1, maxAllowed <= 0 ? 1 : maxAllowed);
    final normalizedText = normalized.toString();
    if (location.cantidadController.text != normalizedText) {
      location.cantidadController.value = TextEditingValue(
        text: normalizedText,
        selection: TextSelection.collapsed(offset: normalizedText.length),
      );
    }
    location.syncLaminas();
  }

  @override
  Widget build(BuildContext context) {
    if (_locations.isEmpty) {
      _locations.add(_RastreroLocationDraft(initialQuantity: 1));
    }

    final remainingText = _remainingTotal < 0 ? 0 : _remainingTotal;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.layers_outlined, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.group.descripcion.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Total de láminas pegantes: ${widget.group.cantidadTotal} · Asignadas: $_assignedTotal · Restantes: $remainingText',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        ..._locations.asMap().entries.map((entry) {
          final index = entry.key;
          final location = entry.value;
          final maxAllowed = widget.group.cantidadTotal - (_assignedTotal - location.cantidad);
          _refreshLocation(location, maxAllowed);

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _RastreroLocationCard(
              index: index,
              location: location,
              maxAllowed: maxAllowed,
              canAddLocation: _remainingTotal > 0,
              onChanged: () => setState(() {}),
              onAddLocation: _addLocation,
              onRemoveLocation: () => _removeLocation(index),
            ),
          );
        }),
        const SizedBox(height: 8),
      ],
    );
  }
}

class _RastreroLocationCard extends StatelessWidget {
  const _RastreroLocationCard({
    required this.index,
    required this.location,
    required this.maxAllowed,
    required this.canAddLocation,
    required this.onChanged,
    required this.onAddLocation,
    required this.onRemoveLocation,
  });

  final int index;
  final _RastreroLocationDraft location;
  final int maxAllowed;
  final bool canAddLocation;
  final VoidCallback onChanged;
  final VoidCallback onAddLocation;
  final VoidCallback onRemoveLocation;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  constraints: const BoxConstraints(minWidth: 92, minHeight: 32),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF2FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '+Ubicación ${index + 1}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1D4ED8),
                      fontSize: 12,
                    ),
                  ),
                ),
                const Spacer(),
                if (index > 0)
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                    onPressed: onRemoveLocation,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: location.ubicacionController,
              decoration: InputDecoration(
                labelText: 'Ubicación',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              validator: (value) {
                if ((value ?? '').trim().isEmpty) {
                  return 'Ingresa la ubicación';
                }
                return null;
              },
              onChanged: (_) => onChanged(),
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: location.cantidadController,
              keyboardType: TextInputType.number,
              inputFormatters: <TextInputFormatter>[FilteringTextInputFormatter.digitsOnly],
              decoration: InputDecoration(
                labelText: 'Cantidad de láminas',
                helperText: 'Máximo permitido: $maxAllowed',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onTap: () {
                if (location.cantidadController.text.isNotEmpty) {
                  location.cantidadController.selection = TextSelection(
                    baseOffset: 0,
                    extentOffset: location.cantidadController.text.length,
                  );
                }
              },
              validator: (value) {
                final parsed = int.tryParse(value ?? '') ?? 0;
                if (parsed <= 0) {
                  return 'Ingresa una cantidad válida';
                }
                if (parsed > maxAllowed) {
                  return 'No puede superar el total disponible';
                }
                return null;
              },
              onChanged: (_) => onChanged(),
            ),
            const SizedBox(height: 12),
            ...location.laminas.asMap().entries.map((entry) {
              final laminaIndex = entry.key;
              final lamina = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Lámina ${laminaIndex + 1}',
                        style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                      ),
                      const SizedBox(height: 10),
                      _buildDualDropdownFieldRow(
                        label: 'Estado de lámina',
                        leftValue: lamina.verdaderaEstadoLamina,
                        rightValue: lamina.auditivaEstadoLamina,
                        items: _estadoLaminaOptions,
                        requiredField: true,
                        leftHeaderLabel: 'V',
                        rightHeaderLabel: 'F',
                        onLeftChanged: (value) {
                          lamina.verdaderaEstadoLamina = value;
                          onChanged();
                        },
                        onRightChanged: (value) {
                          lamina.auditivaEstadoLamina = value;
                          onChanged();
                        },
                      ),
                      const SizedBox(height: 10),
                      _buildStageCountTable(lamina, onChanged),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 4),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF1D4ED8),
                ),
                onPressed: canAddLocation ? onAddLocation : null,
                icon: const Icon(Icons.add),
                label: const Text('Ubicación'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDualDropdownFieldRow({
    required String label,
    required String? leftValue,
    required String? rightValue,
    required List<String> items,
    required ValueChanged<String?> onLeftChanged,
    required ValueChanged<String?> onRightChanged,
    bool requiredField = false,
    String leftHeaderLabel = 'Verdadera',
    String rightHeaderLabel = 'Auditiva',
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            const Expanded(flex: 5, child: SizedBox()),
            Expanded(
              flex: 3,
              child: Text(
                leftHeaderLabel,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              flex: 3,
              child: Text(
                rightHeaderLabel,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            const Expanded(flex: 5, child: SizedBox()),
            Expanded(
              flex: 3,
              child: _buildDropdownField(
                label: '',
                value: leftValue ?? '',
                items: items,
                requiredField: requiredField,
                onChanged: onLeftChanged,
                compact: true,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 3,
              child: _buildDropdownField(
                label: '',
                value: rightValue ?? '',
                items: items,
                requiredField: requiredField,
                onChanged: onRightChanged,
                compact: true,
              ),
            ),
          ],
        ),
      ],
    );
  }


  Widget _buildStageCountTable(_RastreroLaminaDraft lamina, VoidCallback onChanged) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Estadio',
            style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 8),
          const Row(
            children: [
              Expanded(flex: 5, child: SizedBox()),
              Expanded(
                flex: 3,
                child: Text('V', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Color(0xFF334155))),
              ),
              SizedBox(width: 8),
              Expanded(
                flex: 3,
                child: Text('F', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Color(0xFF334155))),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ..._estadioLabels.map((estadio) {
            final draft = lamina.estadioCounts[estadio]!;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    flex: 5,
                    child: Text(
                      estadio,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 3,
                    child: _buildCountField(draft.verdaderaController, onChanged),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 3,
                    child: _buildCountField(draft.auditivaController, onChanged),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCountField(TextEditingController controller, VoidCallback onChanged) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      inputFormatters: <TextInputFormatter>[FilteringTextInputFormatter.digitsOnly],
      decoration: InputDecoration(
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      ),
      onTap: () {
        if (controller.text.isNotEmpty) {
          controller.selection = TextSelection(baseOffset: 0, extentOffset: controller.text.length);
        }
      },
      onChanged: (value) {
        onChanged();
      },
    );
  }

  Widget _buildDropdownField({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    bool requiredField = false,
    bool compact = false,
  }) {
    return DropdownButtonFormField<String>(
      key: ValueKey(value),
      value: value.isEmpty ? null : value,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: compact ? null : label,
        isDense: compact,
        contentPadding: compact ? const EdgeInsets.symmetric(horizontal: 10, vertical: 12) : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(compact ? 10 : 12)),
      ),
      items: items
          .map((item) => DropdownMenuItem<String>(
                value: item,
                child: Text(item, style: const TextStyle(fontSize: 14)),
              ))
          .toList(growable: false),
      validator: (selected) {
        if (requiredField && (selected == null || selected.trim().isEmpty)) {
          return 'Selecciona una opción';
        }
        return null;
      },
      hint: requiredField ? null : const Text('-', style: TextStyle(fontSize: 14)),
      onChanged: onChanged,
    );
  }
}

// ---------------------------------------------------------------------------
// Individual unit card
// ---------------------------------------------------------------------------

class _UnitCard extends StatefulWidget {
  const _UnitCard({
    required this.code,
    required this.unit,
    required this.isVoladores,
    required this.isRastreros,
    required this.estadoOptions,
    required this.hallazgoOptions,
    required this.senalOptions,
  });

  final String code;
  final _DispositivoUnitDraft unit;
  final bool isVoladores;
  final bool isRastreros;
  final List<String> estadoOptions;
  final List<String> hallazgoOptions;
  final List<String> senalOptions;

  @override
  State<_UnitCard> createState() => _UnitCardState();
}

class _UnitCardState extends State<_UnitCard> {
  @override
  Widget build(BuildContext context) {
    final unit = widget.unit;

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Number badge
            Row(
              children: [
                Container(
                  width: 44,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF2FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    widget.code,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1D4ED8),
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Ubicación
            TextFormField(
              controller: unit.ubicacionController,
              decoration: InputDecoration(
                labelText: 'Ubicación',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              validator: (value) {
                if ((value ?? '').trim().isEmpty) {
                  return 'Ingresa la ubicación';
                }
                return null;
              },
            ),
            const SizedBox(height: 10),

            _buildDualDropdownRow(
              title: 'Estado de dispositivo',
              leftLabel: 'V',
              rightLabel: 'F',
              leftValue: unit.estadoDispositivoVerdadera,
              rightValue: unit.estadoDispositivoAuditiva,
              items: widget.estadoOptions,
              requiredField: true,
              onLeftChanged: (value) => setState(() => unit.estadoDispositivoVerdadera = value),
              onRightChanged: (value) => setState(() => unit.estadoDispositivoAuditiva = value),
            ),
            const SizedBox(height: 10),
            if (!widget.isRastreros && !widget.isVoladores) ...[
              _buildDualDropdownRow(
                title: 'Hallazgo',
                leftLabel: 'Verdadera',
                rightLabel: 'Auditiva',
                leftValue: unit.hallazgoVerdadera,
                rightValue: unit.hallazgoAuditiva,
                items: widget.hallazgoOptions,
                onLeftChanged: (value) => setState(() => unit.hallazgoVerdadera = value),
                onRightChanged: (value) => setState(() => unit.hallazgoAuditiva = value),
              ),
            ],
            if (widget.isRastreros) ...[
              const SizedBox(height: 10),
              _buildDropdown(
                label: 'Estado de lámina',
                value: unit.estadoLamina,
                items: _estadoLaminaOptions,
                requiredField: true,
                onChanged: (value) => setState(() => unit.estadoLamina = value),
              ),
              const SizedBox(height: 10),
              _buildDropdown(
                label: 'Estadio',
                value: unit.estadio,
                items: _estadioLabels,
                requiredField: true,
                onChanged: (value) => setState(() => unit.estadio = value),
              ),
              const SizedBox(height: 10),
              _buildDualCountRow(
                title: 'Conteo por estadio',
                leftLabel: 'V',
                rightLabel: 'F',
                leftController: unit.rastreroCounts.verdaderaController,
                rightController: unit.rastreroCounts.falsaController,
              ),
            ] else if (widget.isVoladores) ...[
              const SizedBox(height: 10),
              _buildInsectosTable(unit),
            ] else ...[
              const SizedBox(height: 10),
              _buildDualDropdownRow(
                title: 'Señales de presencia',
                leftLabel: 'Verdadera',
                rightLabel: 'Auditiva',
                leftValue: unit.senalesPresenciaVerdadera,
                rightValue: unit.senalesPresenciaAuditiva,
                items: widget.senalOptions,
                onLeftChanged: (value) => setState(() => unit.senalesPresenciaVerdadera = value),
                onRightChanged: (value) => setState(() => unit.senalesPresenciaAuditiva = value),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInsectosTable(_DispositivoUnitDraft unit) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'INSECTOS',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 8),
          const Row(
            children: [
              Expanded(
                flex: 7,
                child: SizedBox(),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'V',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Color(0xFF334155)),
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: Text(
                  'F',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Color(0xFF334155)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...unit.insectFamilies.map((family) {
            final draft = unit.insectCounts[family.key];
            if (draft == null) {
              return const SizedBox.shrink();
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    flex: 7,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          family.title,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        if (family.subtitle.isNotEmpty)
                          Text(
                            family.subtitle,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF64748B),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: _buildCountField(draft.verdaderaController),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: _buildCountField(draft.auditivaController),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildDualCountRow({
    required String title,
    required String leftLabel,
    required String rightLabel,
    required TextEditingController leftController,
    required TextEditingController rightController,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: Text(
                leftLabel,
                style: const TextStyle(fontSize: 14, color: Color(0xFF334155)),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                rightLabel,
                style: const TextStyle(fontSize: 14, color: Color(0xFF334155)),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(child: _buildCountField(leftController)),
            const SizedBox(width: 10),
            Expanded(child: _buildCountField(rightController)),
          ],
        ),
      ],
    );
  }

  Widget _buildCountField(TextEditingController controller) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      inputFormatters: <TextInputFormatter>[FilteringTextInputFormatter.digitsOnly],
      decoration: InputDecoration(
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      ),
      onTap: () {
        if (controller.text.isNotEmpty) {
          controller.selection = TextSelection(baseOffset: 0, extentOffset: controller.text.length);
        }
      },
      onChanged: (value) {
        if (value.trim().isEmpty) {
          controller.clear();
        }
      },
    );
  }

  Widget _buildDualDropdownRow({
    required String title,
    required String leftLabel,
    required String rightLabel,
    required String? leftValue,
    required String? rightValue,
    required List<String> items,
    required ValueChanged<String?> onLeftChanged,
    required ValueChanged<String?> onRightChanged,
    bool requiredField = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: Text(
                leftLabel,
                style: const TextStyle(fontSize: 14, color: Color(0xFF334155)),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                rightLabel,
                style: const TextStyle(fontSize: 14, color: Color(0xFF334155)),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: _buildDropdown(
                label: '',
                value: leftValue,
                items: items,
                requiredField: requiredField,
                onChanged: onLeftChanged,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildDropdown(
                label: '',
                value: rightValue,
                items: items,
                requiredField: requiredField,
                onChanged: onRightChanged,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    bool requiredField = false,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        labelText: label.isEmpty ? null : label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      items: items
          .map((item) => DropdownMenuItem<String>(value: item, child: Text(item)))
          .toList(growable: false),
      validator: (selected) {
        if (requiredField && (selected == null || selected.trim().isEmpty)) {
          return 'Selecciona una opción';
        }
        return null;
      },
      hint: requiredField ? null : const Text('-'),
      onChanged: onChanged,
    );
  }
}

// ---------------------------------------------------------------------------
// Header card
// ---------------------------------------------------------------------------

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({
    required this.serviceTitle,
    required this.client,
    required this.address,
    required this.count,
    required this.groupCount,
    required this.countLabel,
  });

  final String serviceTitle;
  final String client;
  final String address;
  final int count;
  final int groupCount;
  final String countLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1F3C68), Color(0xFF2F5EA5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Formato Operacional',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(serviceTitle, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Text('Cliente: $client', style: const TextStyle(color: Color(0xE6FFFFFF))),
          const SizedBox(height: 4),
          Text('Dirección: $address', style: const TextStyle(color: Color(0xE6FFFFFF))),
          const SizedBox(height: 4),
          Text(
            '$countLabel: $count · Secciones: $groupCount',
            style: const TextStyle(color: Color(0xE6FFFFFF)),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Legend card
// ---------------------------------------------------------------------------

class _LegendCard extends StatelessWidget {
  const _LegendCard({required this.title, required this.items});

  final String title;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: items
                .map(
                  (item) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Text(item, style: const TextStyle(fontSize: 12)),
                  ),
                )
                .toList(growable: false),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    this.hasFormatos = false,
  });

  final bool hasFormatos;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(
            hasFormatos ? Icons.storage_outlined : Icons.info_outline,
            size: 48,
            color: hasFormatos ? const Color(0xFFA0AEC0) : const Color(0xFF3B82F6),
          ),
          const SizedBox(height: 12),
          Text(
            hasFormatos
                ? 'No se encontraron dispositivos'
                : 'Sin Formato Operacional',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            hasFormatos
                ? 'Salidos de almacén para esta programación.'
                : 'Esta programación no tiene formatos de fichas seleccionados. Puede cerrar el servicio directamente completando solo la Ficha Operacional.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
          if (!hasFormatos) ...[
            const SizedBox(height: 16),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
              ),
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Cerrar servicio sin dispositivos'),
            ),
          ],
        ],
      ),
    );
  }
}