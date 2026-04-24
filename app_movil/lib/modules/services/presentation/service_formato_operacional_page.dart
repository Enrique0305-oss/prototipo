import 'package:flutter/material.dart';

import '../data/services_repository.dart';
import '../domain/formato_operacional_dispositivo.dart';
import '../domain/service_task.dart';

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
  static const List<String> _hallazgoOptions = <String>['C-TP', 'C-J', 'C-R', 'CNT-SC'];
  static const List<String> _senalOptions = <String>['C', 'E', 'H', 'O', 'P', 'R'];

  final _formKey = GlobalKey<FormState>();
  late Future<List<_DispositivoDraft>> _futureDispositivos;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _futureDispositivos = _loadDispositivos();
  }

  Future<List<_DispositivoDraft>> _loadDispositivos() async {
    final byKey = <String, FormatoOperacionalDispositivo>{};

    for (final service in _effectiveServices) {
      final dispositivos = await widget.servicesRepository.getFormatoOperacionalDispositivos(service.id);
      for (final item in dispositivos) {
        final key = '${item.idProducto}|${item.descripcion.toLowerCase()}|${item.numeroLote ?? ''}';
        byKey.putIfAbsent(key, () => item);
      }
    }

    return byKey.values.map(_DispositivoDraft.fromDomain).toList(growable: false);
  }

  List<ServiceTask> get _effectiveServices {
    if (widget.groupedServices.isNotEmpty) {
      return widget.groupedServices;
    }
    return <ServiceTask>[widget.representativeService];
  }

  Future<void> _submit() async {
    final valid = _formKey.currentState?.validate() ?? false;
    if (!valid) return;

    final dispositivos = await _futureDispositivos;
    if (dispositivos.isEmpty) {
      if (!mounted) return;
      Navigator.of(context).pop(true);
      return;
    }

    final payload = dispositivos.map((draft) => draft.toJson()).toList(growable: false);
    debugPrint('Formato operacional: $payload');

    if (!mounted) return;
    Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Formato Operacional'),
      ),
      body: FutureBuilder<List<_DispositivoDraft>>(
        future: _futureDispositivos,
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
                          _futureDispositivos = _loadDispositivos();
                        });
                      },
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
            );
          }

          final dispositivos = snapshot.data ?? const <_DispositivoDraft>[];

          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _HeaderCard(
                  serviceTitle: _effectiveServices.map((s) => s.title).join(' + '),
                  client: widget.representativeService.client,
                  address: widget.representativeService.address ?? 'Sin dirección',
                  count: dispositivos.length,
                ),
                const SizedBox(height: 16),
                _LegendCard(
                  title: 'Leyenda de Estados',
                  items: const <String>['D = Desinstalado', 'A = Averiado', 'B = Buen estado', 'N = No encontrado', 'OB = Obstruido'],
                ),
                const SizedBox(height: 12),
                _LegendCard(
                  title: 'Leyenda de Hallazgos y Presencia',
                  items: const <String>['C-TP = Captura en trampa pegante', 'C-J = Captura en jaula', 'C-R = Consumo de rodenticida', 'CNT-SC = Consumo de cebo no tóxico', 'C / E / H / O / P / R = Señales de presencia'],
                ),
                const SizedBox(height: 16),
                if (dispositivos.isEmpty)
                  const _EmptyState()
                else
                  ...dispositivos.asMap().entries.map((entry) {
                    final index = entry.key;
                    final draft = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: _DispositivoCard(
                        number: index + 1,
                        draft: draft,
                        estadoOptions: _estadoOptions,
                        hallazgoOptions: _hallazgoOptions,
                        senalOptions: _senalOptions,
                      ),
                    );
                  }),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('Volver'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        onPressed: _isSaving
                            ? null
                            : () async {
                                setState(() => _isSaving = true);
                                try {
                                  await _submit();
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
                                child: CircularProgressIndicator(strokeWidth: 2),
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

class _DispositivoDraft {
  _DispositivoDraft({
    required this.idProducto,
    required this.descripcion,
    required this.cantidadAsignada,
    required this.ubicacionController,
  });

  factory _DispositivoDraft.fromDomain(FormatoOperacionalDispositivo item) {
    return _DispositivoDraft(
      idProducto: item.idProducto,
      descripcion: item.descripcion,
      cantidadAsignada: item.cantidadAsignada,
      ubicacionController: TextEditingController(),
    );
  }

  final int idProducto;
  final String descripcion;
  final int cantidadAsignada;
  final TextEditingController ubicacionController;
  String? estadoDispositivo;
  String? hallazgo;
  String? senalesPresencia;

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id_producto': idProducto,
      'descripcion': descripcion,
      'cantidad_asignada': cantidadAsignada,
      'ubicacion': ubicacionController.text.trim(),
      'estado_dispositivo': estadoDispositivo,
      'hallazgo': hallazgo,
      'senales_presencia': senalesPresencia,
    };
  }
}

class _DispositivoCard extends StatefulWidget {
  const _DispositivoCard({
    required this.number,
    required this.draft,
    required this.estadoOptions,
    required this.hallazgoOptions,
    required this.senalOptions,
  });

  final int number;
  final _DispositivoDraft draft;
  final List<String> estadoOptions;
  final List<String> hallazgoOptions;
  final List<String> senalOptions;

  @override
  State<_DispositivoCard> createState() => _DispositivoCardState();
}

class _DispositivoCardState extends State<_DispositivoCard> {
  @override
  Widget build(BuildContext context) {
    final draft = widget.draft;

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF4FF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${widget.number}',
                    style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1F3C68)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        draft.descripcion,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Cantidad salida: ${draft.cantidadAsignada}${draft.cantidadAsignada > 1 ? ' unidades' : ' unidad'}',
                        style: const TextStyle(color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: draft.ubicacionController,
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
            const SizedBox(height: 12),
            LayoutBuilder(
              builder: (context, constraints) {
                if (constraints.maxWidth >= 720) {
                  return Row(
                    children: [
                      Expanded(child: _buildDropdown(label: 'Estado de Dispositivo', value: draft.estadoDispositivo, items: widget.estadoOptions, onChanged: (value) => setState(() => draft.estadoDispositivo = value))),
                      const SizedBox(width: 10),
                      Expanded(child: _buildDropdown(label: 'Hallazgo', value: draft.hallazgo, items: widget.hallazgoOptions, onChanged: (value) => setState(() => draft.hallazgo = value))),
                      const SizedBox(width: 10),
                      Expanded(child: _buildDropdown(label: 'Señales de Presencia', value: draft.senalesPresencia, items: widget.senalOptions, onChanged: (value) => setState(() => draft.senalesPresencia = value))),
                    ],
                  );
                }

                return Column(
                  children: [
                    _buildDropdown(label: 'Estado de Dispositivo', value: draft.estadoDispositivo, items: widget.estadoOptions, onChanged: (value) => setState(() => draft.estadoDispositivo = value)),
                    const SizedBox(height: 10),
                    _buildDropdown(label: 'Hallazgo', value: draft.hallazgo, items: widget.hallazgoOptions, onChanged: (value) => setState(() => draft.hallazgo = value)),
                    const SizedBox(height: 10),
                    _buildDropdown(label: 'Señales de Presencia', value: draft.senalesPresencia, items: widget.senalOptions, onChanged: (value) => setState(() => draft.senalesPresencia = value)),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      items: items
          .map((item) => DropdownMenuItem<String>(value: item, child: Text(item)))
          .toList(growable: false),
      validator: (selected) {
        if (selected == null || selected.trim().isEmpty) {
          return 'Selecciona una opción';
        }
        return null;
      },
      onChanged: onChanged,
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({
    required this.serviceTitle,
    required this.client,
    required this.address,
    required this.count,
  });

  final String serviceTitle;
  final String client;
  final String address;
  final int count;

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
          Text('Dispositivos cargados: $count', style: const TextStyle(color: Color(0xE6FFFFFF))),
        ],
      ),
    );
  }
}

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

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: const Text(
        'No se encontraron dispositivos salidos de almacén para esta programación.',
        textAlign: TextAlign.center,
      ),
    );
  }
}