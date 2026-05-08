import 'package:flutter/material.dart';

import '../data/services_repository.dart';
import '../domain/insumo_quimico_entregado.dart';
import '../domain/service_task.dart';
import '../domain/ficha_operacional.dart';

class ServiceOperationalSheetPage extends StatefulWidget {
  const ServiceOperationalSheetPage({
    super.key,
    required this.representativeService,
    required this.groupedServices,
    required this.servicesRepository,
    this.initialObservations,
  });

  final ServiceTask representativeService;
  final List<ServiceTask> groupedServices;
  final String? initialObservations;
  final ServicesRepository servicesRepository;

  @override
  State<ServiceOperationalSheetPage> createState() => _ServiceOperationalSheetPageState();
}

class _ServiceOperationalSheetPageState extends State<ServiceOperationalSheetPage> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _clienteController;
  late final TextEditingController _direccionController;
  late final TextEditingController _fechaController;
  late final TextEditingController _horaLlegadaController;
  late final TextEditingController _horaInicioController;
  late final TextEditingController _horaFinalController;
  late final TextEditingController _giroLugarController;
  late final TextEditingController _diagnosticoController;
  late final TextEditingController _condicionController;
  late final TextEditingController _accionesController;
  late final TextEditingController _recomendacionesController;
  late final TextEditingController _firmaTecnicoController;
  late final TextEditingController _firmaClienteController;

  final List<String> _equiposCatalogo = const <String>[
    'Aspersion manual',
    'Aspersion a motor',
    'Termonebulizacion',
    'Nebulizacion en frio ULV',
    'Trampas adhesivas',
    'Trampas de luz',
    'Estacion de cebado',
    'Jaula de captura',
  ];

  final Set<String> _equiposSeleccionados = <String>{};
  final List<_ChemicalRowDraft> _quimicos = <_ChemicalRowDraft>[];

  List<InsumoQuimicoEntregado> _quimicosDisponibles = <InsumoQuimicoEntregado>[];
  final Set<int> _quimicosSeleccionados = <int>{};
  bool _loadingQuimicos = true;

  List<String> _areasDisponibles = [];
  final Set<String> _areasSeleccionadas = <String>{};

  FichaOperacional? _fichaActual;
  bool _isSaving = false;

  List<ServiceTask> get _effectiveServices => widget.groupedServices.isEmpty
      ? <ServiceTask>[widget.representativeService]
      : widget.groupedServices;

  @override
  void initState() {
    super.initState();

    final now = DateTime.now();
    _clienteController = TextEditingController(text: widget.representativeService.client);
    _direccionController = TextEditingController(text: widget.representativeService.address ?? '');
    _fechaController = TextEditingController(text: _formatDate(now));

    _horaLlegadaController = TextEditingController(text: _effectiveServices.first.startTime?.substring(0, 5) ?? '');
    _horaInicioController = TextEditingController(text: _effectiveServices.first.startTime?.substring(0, 5) ?? '');
    _horaFinalController = TextEditingController(text: _effectiveServices.last.endTime?.substring(0, 5) ?? '');

    _giroLugarController = TextEditingController();
    _diagnosticoController = TextEditingController();
    _condicionController = TextEditingController();
    _accionesController = TextEditingController();
    _recomendacionesController = TextEditingController();
    _firmaTecnicoController = TextEditingController();
    _firmaClienteController = TextEditingController();

    _areasDisponibles = _effectiveServices
        .expand((s) => s.areaNames)
        .map((a) => a.trim())
        .where((value) => value.isNotEmpty)
        .toSet()
        .toList();
    _areasSeleccionadas.addAll(_areasDisponibles);

    if ((widget.initialObservations ?? '').trim().isNotEmpty) {
      _diagnosticoController.text = widget.initialObservations!.trim();
    }

    _loadQuimicosEntregados();
    _loadExistingFicha();
  }

  @override
  void dispose() {
    _clienteController.dispose();
    _direccionController.dispose();
    _fechaController.dispose();
    _horaLlegadaController.dispose();
    _horaInicioController.dispose();
    _horaFinalController.dispose();
    _giroLugarController.dispose();
    _diagnosticoController.dispose();
    _condicionController.dispose();
    _accionesController.dispose();
    _recomendacionesController.dispose();
    _firmaTecnicoController.dispose();
    _firmaClienteController.dispose();
    for (final quimico in _quimicos) {
      quimico.dispose();
    }
    super.dispose();
  }

  Future<void> _loadQuimicosEntregados() async {
    try {
      final quimicos = await widget.servicesRepository.getInsumosQuimicosEntregados(
        widget.representativeService.id,
      );
      if (mounted) {
        setState(() {
          _quimicosDisponibles = quimicos;
          _loadingQuimicos = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading quimicos: $e');
      if (mounted) {
        setState(() => _loadingQuimicos = false);
      }
    }
  }

  Future<void> _loadExistingFicha() async {
    try {
      final ficha = await widget.servicesRepository.getFichaByServiceId(
        widget.representativeService.id,
      );

      if (ficha != null && ficha.isBorrador) {
        setState(() {
          _fichaActual = ficha;
          _loadFichaData(ficha);
        });
      }
    } catch (e) {
      debugPrint('Error loading ficha: $e');
    }
  }

  void _loadFichaData(FichaOperacional ficha) {
    if (ficha.cliente != null) _clienteController.text = ficha.cliente!;
    if (ficha.direccion != null) _direccionController.text = ficha.direccion!;
    if (ficha.fecha != null) _fechaController.text = ficha.fecha!;
    if (ficha.horaLlegada != null) _horaLlegadaController.text = ficha.horaLlegada!;
    if (ficha.horaInicio != null) _horaInicioController.text = ficha.horaInicio!;
    if (ficha.horaFinal != null) _horaFinalController.text = ficha.horaFinal!;
    if (ficha.giro != null) _giroLugarController.text = ficha.giro!;
    if (ficha.diagnostico != null) _diagnosticoController.text = ficha.diagnostico!;
    if (ficha.condicionSanitaria != null) _condicionController.text = ficha.condicionSanitaria!;
    if (ficha.accionesCorrectivas != null) _accionesController.text = ficha.accionesCorrectivas!;
    if (ficha.recomendaciones != null) _recomendacionesController.text = ficha.recomendaciones!;
    if (ficha.areasTratadas != null && ficha.areasTratadas!.isNotEmpty) {
      final savedAreas = ficha.areasTratadas!.cast<String>();
      if (savedAreas.contains('Areas en General') || savedAreas.contains('Áreas en General') || savedAreas.contains('Areas en general') || savedAreas.contains('Áreas en general')) {
        _areasSeleccionadas.addAll(_areasDisponibles);
      } else {
        for (final area in savedAreas) {
          if (_areasDisponibles.contains(area)) {
            _areasSeleccionadas.add(area);
          }
        }
      }
    }
    if (ficha.equipos != null && ficha.equipos!.isNotEmpty) {
      _equiposSeleccionados.clear();
      _equiposSeleccionados.addAll(ficha.equipos!.cast<String>());
    }
  }

  Future<void> _saveDraft() async {
    setState(() => _isSaving = true);
    try {
      final formData = _buildFormData();
      final ficha = await widget.servicesRepository.saveFichaDraft(
        programacionId: widget.representativeService.id,
        formData: formData,
      );

      setState(() {
        _fichaActual = ficha;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ficha guardada como borrador')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _finalizeFicha() async {
    if (!_formKey.currentState!.validate()) return;

    await _saveDraft();

    if (_fichaActual == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error: No se pudo guardar la ficha')),
        );
      }
      return;
    }

    setState(() => _isSaving = true);
    try {
      await widget.servicesRepository.finalizeFicha(
        fichaId: _fichaActual!.id!,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ficha finalizada exitosamente')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Map<String, dynamic> _buildFormData() {
    final rawDate = _fechaController.text.trim();
    String? normalizedDate;
    if (rawDate.isNotEmpty) {
      final parts = rawDate.split('/');
      if (parts.length == 3) {
        final day = parts[0].padLeft(2, '0');
        final month = parts[1].padLeft(2, '0');
        final year = parts[2];
        normalizedDate = '$year-$month-$day';
      } else {
        normalizedDate = rawDate;
      }
    }

    return {
      'cliente': _clienteController.text.trim(),
      'direccion': _direccionController.text.trim(),
      'fecha': normalizedDate,
      'hora_llegada': _horaLlegadaController.text.trim().isNotEmpty ? _horaLlegadaController.text.trim() : null,
      'hora_inicio': _horaInicioController.text.trim().isNotEmpty ? _horaInicioController.text.trim() : null,
      'hora_final': _horaFinalController.text.trim().isNotEmpty ? _horaFinalController.text.trim() : null,
      'giro': _giroLugarController.text.trim().isNotEmpty ? _giroLugarController.text.trim() : null,
      'diagnostico': _diagnosticoController.text.trim().isNotEmpty ? _diagnosticoController.text.trim() : null,
      'condicion_sanitaria': _condicionController.text.trim().isNotEmpty ? _condicionController.text.trim() : null,
      'actividades_realizadas': _effectiveServices.map((s) => s.title).toList(),
      'equipos': _equiposSeleccionados.toList(),
      'insumos_utilizados': _quimicos
          .where((q) => q.productoController.text.isNotEmpty)
          .map((q) => <String, dynamic>{
                'id_producto': q.idProducto,
                'producto': q.productoController.text,
                'metodo': q.metodoController.text,
                'lote': q.loteController.text,
                'vencimiento': q.vencimientoController.text,
                'unidad': q.unidadController.text,
                'concentracion': q.concentracionController.text,
                'cantidad': q.cantidadController.text,
              })
          .toList(),
      'areas_tratadas': (_areasDisponibles.isNotEmpty && _areasSeleccionadas.length == _areasDisponibles.length)
          ? ['Areas en General']
          : _areasSeleccionadas.toList(),
      'acciones_correctivas': _accionesController.text.trim().isNotEmpty ? _accionesController.text.trim() : null,
      'recomendaciones': _recomendacionesController.text.trim().isNotEmpty ? _recomendacionesController.text.trim() : null,
    };
  }

  String _formatDate(DateTime value) {
    final dd = value.day.toString().padLeft(2, '0');
    final mm = value.month.toString().padLeft(2, '0');
    final yyyy = value.year.toString();
    return '$dd/$mm/$yyyy';
  }

  String _formatTime(TimeOfDay t) => t.format(context);

  TimeOfDay _parseTime(String raw) {
    try {
      final parts = raw.split(':');
      if (parts.length < 2) return TimeOfDay.now();
      final h = int.tryParse(parts[0]) ?? 0;
      final m = int.tryParse(parts[1]) ?? 0;
      return TimeOfDay(hour: h, minute: m);
    } catch (_) {
      return TimeOfDay.now();
    }
  }

  void _toggleQuimico(InsumoQuimicoEntregado insumo, bool selected) {
    setState(() {
      if (selected) {
        _quimicosSeleccionados.add(insumo.idProducto);
        _quimicos.add(_ChemicalRowDraft.fromInsumo(insumo));
      } else {
        _quimicosSeleccionados.remove(insumo.idProducto);
        final idx = _quimicos.indexWhere((q) => q.idProducto == insumo.idProducto);
        if (idx >= 0) {
          final item = _quimicos.removeAt(idx);
          item.dispose();
        }
      }
    });
  }

  Widget _buildInsumosSection() {
    if (_loadingQuimicos) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_quimicosDisponibles.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(8),
        child: Text(
          'No hay productos químicos entregados por almacén para esta programación.',
          style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Seleccione los productos químicos que se utilizarán:',
          style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
        ),
        const SizedBox(height: 8),
        ..._quimicosDisponibles.map((insumo) {
          final isSelected = _quimicosSeleccionados.contains(insumo.idProducto);
          return CheckboxListTile(
            value: isSelected,
            onChanged: (val) => _toggleQuimico(insumo, val == true),
            dense: true,
            controlAffinity: ListTileControlAffinity.leading,
            title: Text(insumo.producto),
            subtitle: Text('Lote: ${insumo.lote} · Entregado: ${insumo.cantidadEntregada}'),
          );
        }),
        if (_quimicos.isNotEmpty) ...[
          const Divider(height: 24),
          const Text(
            'Detalle de insumos seleccionados:',
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
          const SizedBox(height: 10),
          ..._quimicos.map((row) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFE2E8F0)),
                borderRadius: BorderRadius.circular(10),
                color: const Color(0xFFF8FAFC),
              ),
              child: Column(
                children: [
                  _buildManualField('Producto químico', row.productoController, readOnly: true),
                  const SizedBox(height: 8),
                  _buildDropdownField('Método (equipo usado)', row.metodoController, _equiposSeleccionados.toList()),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _buildManualField('Lote', row.loteController, readOnly: true)),
                      const SizedBox(width: 8),
                      Expanded(child: _buildManualField('F. vencimiento', row.vencimientoController, readOnly: true)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _buildManualField('Unidad', row.unidadController, readOnly: true)),
                      const SizedBox(width: 8),
                      Expanded(child: _buildManualField('Concentración', row.concentracionController)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildManualField('Cantidad', row.cantidadController),
                ],
              ),
            );
          }),
        ],
      ],
    );
  }

  Widget _buildSectionCard({required String title, required Widget child}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildTimeField(String label, TextEditingController controller) {
    return TextFormField(
      controller: controller,
      readOnly: true,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        suffixIcon: const Icon(Icons.access_time),
      ),
      onTap: () async {
        final initial = controller.text.isNotEmpty ? _parseTime(controller.text) : TimeOfDay.now();
        final result = await showTimePicker(context: context, initialTime: initial);
        if (result != null) {
          controller.text = _formatTime(result);
        }
      },
      validator: (value) => null,
    );
  }

  Widget _buildManualField(String label, TextEditingController controller, {int maxLines = 1, bool readOnly = false}) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        filled: readOnly,
        fillColor: readOnly ? const Color(0xFFEEEEEE) : null,
      ),
      maxLines: maxLines,
      validator: (value) => null,
    );
  }

  Widget _buildDropdownField(String label, TextEditingController controller, List<String> options) {
    final currentVal = controller.text.isNotEmpty ? controller.text : null;
    final validOptions = options.toList();
    if (currentVal != null && !validOptions.contains(currentVal)) {
      validOptions.add(currentVal);
    }

    return DropdownButtonFormField<String>(
      value: currentVal,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      items: validOptions.isEmpty 
          ? [const DropdownMenuItem(value: null, child: Text('Seleccione equipo arriba'))]
          : validOptions.map((opt) => DropdownMenuItem(value: opt, child: Text(opt))).toList(),
      onChanged: (val) {
        if (val != null) {
          controller.text = val;
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ficha Operacional'),
        elevation: 0,
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildSectionCard(
              title: 'Cliente y Dirección',
              child: Column(
                children: [
                  _buildManualField('Cliente', _clienteController),
                  const SizedBox(height: 8),
                  _buildManualField('Dirección', _direccionController),
                ],
              ),
            ),
            _buildSectionCard(
              title: 'Datos de Ejecución',
              child: Column(
                children: [
                  _buildManualField('Fecha', _fechaController),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _buildTimeField('Hora llegada', _horaLlegadaController)),
                      const SizedBox(width: 8),
                      Expanded(child: _buildTimeField('Hora inicio', _horaInicioController)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _buildTimeField('Hora final', _horaFinalController),
                  const SizedBox(height: 8),
                  _buildManualField('Giro del lugar', _giroLugarController),
                ],
              ),
            ),
            _buildSectionCard(
              title: 'Diagnóstico',
              child: _buildManualField('Descripción', _diagnosticoController, maxLines: 4),
            ),
            _buildSectionCard(
              title: 'Condición sanitaria de la zona circundante',
              child: _buildManualField('Descripción', _condicionController, maxLines: 4),
            ),
            _buildSectionCard(
              title: 'Actividad realizada',
              child: Column(
                children: _effectiveServices
                    .map(
                      (service) => CheckboxListTile(
                        value: true,
                        onChanged: null,
                        dense: true,
                        controlAffinity: ListTileControlAffinity.leading,
                        title: Text(service.title),
                        subtitle: Text(service.startTime != null && service.endTime != null
                            ? '${service.startTime} - ${service.endTime}'
                            : 'Servicio ejecutado'),
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
            _buildSectionCard(
              title: 'Tratamiento realizado',
              child: Column(
                children: _equiposCatalogo
                    .map(
                      (equipo) => CheckboxListTile(
                        value: _equiposSeleccionados.contains(equipo),
                        onChanged: (selected) {
                          setState(() {
                            if (selected == true) {
                              _equiposSeleccionados.add(equipo);
                            } else {
                              _equiposSeleccionados.remove(equipo);
                            }
                          });
                        },
                        dense: true,
                        controlAffinity: ListTileControlAffinity.leading,
                        title: Text(equipo),
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
            _buildSectionCard(
              title: 'Información de insumos utilizados',
              child: _buildInsumosSection(),
            ),
            _buildSectionCard(
              title: 'Áreas tratadas',
              child: _areasDisponibles.isEmpty 
                  ? const Text('No hay áreas registradas para este servicio.')
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: _areasDisponibles.map(
                        (area) => CheckboxListTile(
                          value: _areasSeleccionadas.contains(area),
                          onChanged: (selected) {
                            setState(() {
                              if (selected == true) {
                                _areasSeleccionadas.add(area);
                              } else {
                                _areasSeleccionadas.remove(area);
                              }
                            });
                          },
                          dense: true,
                          controlAffinity: ListTileControlAffinity.leading,
                          title: Text(area),
                        ),
                      ).toList(),
                    ),
            ),
            _buildSectionCard(
              title: 'Acciones y Recomendaciones',
              child: Column(
                children: [
                  _buildManualField('Acciones correctivas', _accionesController, maxLines: 3),
                  const SizedBox(height: 8),
                  _buildManualField('Recomendaciones', _recomendacionesController, maxLines: 3),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.only(top: 6, bottom: 14),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: const Color(0xFFF8FAFC),
                border: Border.all(color: const Color(0xFFD9E1EA)),
              ),
              child: const Text(
                'Multitasking Servicios Generales S.A.C.\n'
                'Dirección: Av. 13 de enero Mz. H-IV Lt.02 APV Inca Manco Capac - SJL\n'
                'Correo: contacto@qsciconsulting.com',
                style: TextStyle(fontSize: 12, color: Color(0xFF475569), height: 1.35),
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF1E3A8A),
                      side: const BorderSide(color: Color(0xFF1E3A8A)),
                    ),
                    child: const Text('Volver'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: FilledButton(
                    onPressed: _isSaving ? null : _finalizeFicha,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                    ),
                    child: _isSaving
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Guardar ficha y finalizar'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ChemicalRowDraft {
  _ChemicalRowDraft({this.idProducto});

  factory _ChemicalRowDraft.fromInsumo(InsumoQuimicoEntregado insumo) {
    return _ChemicalRowDraft(idProducto: insumo.idProducto)
      ..productoController.text = insumo.producto
      ..loteController.text = insumo.lote
      ..vencimientoController.text = insumo.fechaVencimiento
      ..unidadController.text = insumo.unidad;
  }

  final int? idProducto;
  final TextEditingController productoController = TextEditingController();
  final TextEditingController metodoController = TextEditingController();
  final TextEditingController loteController = TextEditingController();
  final TextEditingController vencimientoController = TextEditingController();
  final TextEditingController unidadController = TextEditingController();
  final TextEditingController concentracionController = TextEditingController();
  final TextEditingController cantidadController = TextEditingController();

  void dispose() {
    productoController.dispose();
    metodoController.dispose();
    loteController.dispose();
    vencimientoController.dispose();
    unidadController.dispose();
    concentracionController.dispose();
    cantidadController.dispose();
  }
}

class _SignatureBox extends StatelessWidget {
  const _SignatureBox({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFD9E1EA)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Align(
        alignment: Alignment.bottomCenter,
        child: Text(
          label,
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
