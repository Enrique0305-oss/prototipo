import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:path_provider/path_provider.dart';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../data/services_repository.dart';
import '../domain/service_task.dart';
import 'service_operational_sheet_page.dart';
import 'service_formato_operacional_page.dart';

class ServiceExecutionPage extends StatefulWidget {
  const ServiceExecutionPage({
    super.key,
    required this.service,
    required this.repository,
    this.groupedServices,
  });

  final ServiceTask service;
  final ServicesRepository repository;
  final List<ServiceTask>? groupedServices;

  @override
  State<ServiceExecutionPage> createState() => _ServiceExecutionPageState();
}

class _ServiceExecutionPageState extends State<ServiceExecutionPage> {
  final _observationController = TextEditingController();
  final _picker = ImagePicker();
  final List<_EvidenceDraft> _evidence = <_EvidenceDraft>[];
  bool _saving = false;
  bool _starting = true;
  DateTime? _startedAt;
  int _elapsedSeconds = 0;
  Timer? _timer;

  List<ServiceTask> get _effectiveServices {
    final grouped = widget.groupedServices;
    if (grouped != null && grouped.isNotEmpty) {
      return grouped;
    }
    return <ServiceTask>[widget.service];
  }

  bool get _isGrouped => _effectiveServices.length > 1;

  ServiceTask get _representativeService => _effectiveServices.first;

  List<int> get _serviceIds => _effectiveServices.map((e) => e.id).toSet().toList(growable: false);

  String get _mergedTitle {
    final unique = _effectiveServices
        .map((s) => s.title.trim())
        .where((x) => x.isNotEmpty)
        .toSet()
        .toList(growable: false);
    if (unique.isEmpty) return 'Servicios agrupados';
    return unique.join(' + ');
  }

  String? get _mergedSchedule {
    int? minStart;
    int? maxEnd;
    for (final s in _effectiveServices) {
      final start = _timeToMinutes(s.startTime);
      final end = _timeToMinutes(s.endTime);
      if (start != null) {
        minStart = (minStart == null || start < minStart) ? start : minStart;
      }
      if (end != null) {
        maxEnd = (maxEnd == null || end > maxEnd) ? end : maxEnd;
      }
    }
    if (minStart == null && maxEnd == null) return null;
    final from = _minutesToHhmm(minStart ?? 0);
    final to = _minutesToHhmm(maxEnd ?? minStart ?? 0);
    return '$from - $to';
  }

  int? _timeToMinutes(String? raw) {
    final value = (raw ?? '').trim();
    if (value.isEmpty) return null;
    final normalized = value.contains('T') ? value.split('T').last : value;
    if (normalized.length < 5) return null;
    final hhmm = normalized.substring(0, 5);
    final parts = hhmm.split(':');
    if (parts.length < 2) return null;
    final h = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    if (h == null || m == null) return null;
    return (h * 60) + m;
  }

  String _minutesToHhmm(int totalMinutes) {
    final h = (totalMinutes ~/ 60).toString().padLeft(2, '0');
    final m = (totalMinutes % 60).toString().padLeft(2, '0');
    return '$h:$m';
  }

  String _formatElapsed(int totalSeconds) {
    final hours = (totalSeconds ~/ 3600).toString().padLeft(2, '0');
    final minutes = ((totalSeconds % 3600) ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  _StatusPalette _paletteForStatus(String status) {
    final normalized = status.toLowerCase();
    if (normalized.contains('cancel')) {
      return const _StatusPalette(colors: [Color(0xFFF35454), Color(0xFFE11E1E)]);
    }
    if (normalized.contains('realizado') || normalized.contains('complet')) {
      return const _StatusPalette(colors: [Color(0xFF18B89A), Color(0xFF12A56E)]);
    }
    if (normalized.contains('program')) {
      return const _StatusPalette(colors: [Color(0xFF3F7EF0), Color(0xFF2B5FDE)]);
    }
    return const _StatusPalette(colors: [Color(0xFF4E6283), Color(0xFF394E6D)]);
  }

  @override
  void initState() {
    super.initState();
    _markStart();
    _loadPersistedEvidence();
  }

  Future<void> _markStart() async {
    setState(() => _starting = true);
    try {
      final startedAt = await widget.repository.startServices(ids: _serviceIds);
      if (!mounted) return;

      _startedAt = startedAt;
      final now = DateTime.now();
      _elapsedSeconds = now.difference(startedAt).inSeconds;
      if (_elapsedSeconds < 0) _elapsedSeconds = 0;

      _timer?.cancel();
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (!mounted || _startedAt == null) return;
        setState(() {
          _elapsedSeconds = DateTime.now().difference(_startedAt!).inSeconds;
          if (_elapsedSeconds < 0) _elapsedSeconds = 0;
        });
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _observationController.dispose();
    super.dispose();
  }

  Future<ServiceTask?> _selectServiceForEvidence() async {
    if (!_isGrouped) {
      return _representativeService;
    }

    int? selectedServiceId;
    return showDialog<ServiceTask>(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            return AlertDialog(
              title: const Text('¿A qué servicio pertenece la foto?'),
              content: SizedBox(
                width: double.maxFinite,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: _effectiveServices.map((service) {
                      return RadioListTile<int>(
                        value: service.id,
                        groupValue: selectedServiceId,
                        contentPadding: EdgeInsets.zero,
                        title: Text(service.title),
                        subtitle: Text(service.address ?? service.client),
                        onChanged: (value) {
                          setLocalState(() {
                            selectedServiceId = value;
                          });
                        },
                      );
                    }).toList(growable: false),
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(),
                  child: const Text('Cancelar'),
                ),
                FilledButton(
                  onPressed: selectedServiceId == null
                      ? null
                      : () {
                          final selected = _effectiveServices.firstWhere(
                            (service) => service.id == selectedServiceId,
                          );
                          Navigator.of(dialogContext).pop(selected);
                        },
                  child: const Text('Continuar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _takePhoto() async {
    final selectedService = await _selectServiceForEvidence();
    if (selectedService == null) return;

    final photo = await _picker.pickImage(source: ImageSource.camera, imageQuality: 75);
    if (photo == null) return;
    // Pedir descripción antes de guardar
    final description = await showDialog<String>(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) {
        final controller = TextEditingController();
        return AlertDialog(
          title: const Text('Agregar descripción'),
          content: TextField(
            controller: controller,
            maxLines: 3,
            decoration: const InputDecoration(hintText: 'Descripción opcional de la foto'),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(dialogContext).pop(null), child: const Text('Omitir')),
            FilledButton(onPressed: () => Navigator.of(dialogContext).pop(controller.text.trim()), child: const Text('Guardar')),
          ],
        );
      },
    );

    try {
      final appDir = await getApplicationDocumentsDirectory();
      final destDir = Directory('${appDir.path}/evidence');
      if (!await destDir.exists()) await destDir.create(recursive: true);
      final fileName = 'svc_${selectedService.id}_${DateTime.now().millisecondsSinceEpoch}${_extensionForPath(photo.path)}';
      final destPath = '${destDir.path}/$fileName';
      await photo.saveTo(destPath);

      final saved = XFile(destPath);
      setState(() {
        _evidence.add(
          _EvidenceDraft(
            file: saved,
            serviceId: selectedService.id,
            serviceTitle: selectedService.title,
            description: description,
          ),
        );
      });

      await _persistEvidenceIndex();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('No se pudo guardar la foto: $e')));
    }
  }

  String _extensionForPath(String p) {
    final idx = p.lastIndexOf('.');
    if (idx < 0) return '.jpg';
    return p.substring(idx);
  }

  Future<File> _evidenceIndexFile() async {
    final appDir = await getApplicationDocumentsDirectory();
    return File('${appDir.path}/evidence_index.json');
  }

  Future<void> _persistEvidenceIndex() async {
    try {
      final file = await _evidenceIndexFile();
      Map<String, dynamic> index = {};
      if (await file.exists()) {
        final text = await file.readAsString();
        index = json.decode(text) as Map<String, dynamic>;
      }

      for (final item in _evidence) {
        final key = item.serviceId.toString();
        final list = (index[key] as List<dynamic>?)?.map((e) => e as Map<String, dynamic>).toList() ?? [];
        // ensure we don't duplicate entries for same path
        final exists = list.any((e) => e['path'] == item.file.path);
        if (!exists) {
          list.add({
            'path': item.file.path,
            'serviceId': item.serviceId,
            'serviceTitle': item.serviceTitle,
            'description': item.description ?? '',
          });
        }
        index[key] = list;
      }

      await file.writeAsString(json.encode(index));
    } catch (_) {}
  }

  Future<void> _loadPersistedEvidence() async {
    try {
      final file = await _evidenceIndexFile();
      if (!await file.exists()) return;
      final text = await file.readAsString();
      final Map<String, dynamic> index = json.decode(text) as Map<String, dynamic>;
      final List<_EvidenceDraft> loaded = [];
      for (final entry in index.entries) {
        final items = (entry.value as List<dynamic>?) ?? [];
        for (final e in items) {
          final map = e as Map<String, dynamic>;
          final path = map['path'] as String?;
          if (path == null) continue;
          final fileOnDisk = File(path);
          if (!await fileOnDisk.exists()) continue;
          loaded.add(
            _EvidenceDraft(
              file: XFile(path),
              serviceId: map['serviceId'] as int? ?? int.parse(entry.key),
              serviceTitle: map['serviceTitle'] as String? ?? 'Servicio',
              description: (map['description'] as String?)?.trim(),
            ),
          );
        }
      }
      if (loaded.isNotEmpty) {
        setState(() {
          _evidence.addAll(loaded);
        });
      }
    } catch (_) {}
  }

  Map<String, List<_EvidenceDraft>> _groupedEvidenceByService() {
    final grouped = <String, List<_EvidenceDraft>>{};
    for (final item in _evidence) {
      final key = item.serviceTitle.trim().isEmpty ? 'Servicio' : item.serviceTitle;
      grouped.putIfAbsent(key, () => <_EvidenceDraft>[]).add(item);
    }
    return grouped;
  }

  Future<void> _showEvidenceDialog(_EvidenceDraft item) async {
    final controller = TextEditingController(text: item.description ?? '');
    final result = await showDialog<String?>(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) {
        return AlertDialog(
          titlePadding: EdgeInsets.zero,
          title: Align(
            alignment: Alignment.topRight,
            child: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => Navigator.of(dialogContext).pop(null),
            ),
          ),
          contentPadding: const EdgeInsets.all(8),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 300, maxWidth: 300),
                child: Image.file(File(item.file.path), fit: BoxFit.contain),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: controller,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Descripción (opcional)'),
              ),
            ],
          ),
          actions: [
            IconButton(
              onPressed: () => Navigator.of(dialogContext).pop('delete'),
              icon: const Icon(Icons.delete_outline, color: Colors.red),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(controller.text.trim()),
              child: const Text('Guardar'),
            ),
          ],
        );
      },
    );

    if (result == 'delete') {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (c) => AlertDialog(
          title: const Text('Confirmar'),
          content: const Text('¿Eliminar esta foto definitivamente?'),
          actions: [
            TextButton(onPressed: () => Navigator.of(c).pop(false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.of(c).pop(true), child: const Text('Eliminar')),
          ],
        ),
      );
      if (confirmed == true) {
        try {
          final f = File(item.file.path);
          if (await f.exists()) await f.delete();
        } catch (_) {}
        setState(() {
          _evidence.removeWhere((e) => e.file.path == item.file.path);
        });
        await _persistEvidenceIndex();
      }
      return;
    }

    if (result != null) {
      // guardar descripción
      final idx = _evidence.indexWhere((e) => e.file.path == item.file.path);
      if (idx >= 0) {
        final updated = _EvidenceDraft(
          file: item.file,
          serviceId: item.serviceId,
          serviceTitle: item.serviceTitle,
          description: result.isEmpty ? null : result,
        );
        setState(() {
          _evidence[idx] = updated;
        });
        await _persistEvidenceIndex();
      }
    }
  }

  Widget _buildElapsedCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF4FF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFB6D4F7)),
      ),
      child: Row(
        children: [
          const Icon(Icons.timer_outlined, color: Color(0xFF1F3C68)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _starting
                  ? 'Registrando inicio por técnico...'
                  : 'Tiempo en curso: ${_formatElapsed(_elapsedSeconds)}',
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                color: Color(0xFF1F3C68),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _completeServiceOnServer() async {
    setState(() => _saving = true);
    try {
      await widget.repository.completeServices(
        ids: _serviceIds,
        observations: _observationController.text.trim().isEmpty
            ? null
            : _observationController.text.trim(),
        durationMinutes: _elapsedSeconds > 0 ? (_elapsedSeconds / 60).ceil() : null,
        evidencePhotos: _evidence
            .map(
              (draft) => ServiceEvidenceUpload(
                path: draft.file.path,
                name: draft.file.name,
                serviceId: draft.serviceId,
                serviceTitle: draft.serviceTitle,
              ),
            )
            .toList(growable: false),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Servicio finalizado correctamente')),
      );
      // Borrar evidencias locales asociadas a los servicios completados
      await _removePersistedEvidenceForServiceIds(_serviceIds);
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _removePersistedEvidenceForServiceIds(List<int> serviceIds) async {
    try {
      final file = await _evidenceIndexFile();
      if (!await file.exists()) return;
      final text = await file.readAsString();
      final Map<String, dynamic> index = json.decode(text) as Map<String, dynamic>;
      bool changed = false;
      for (final sid in serviceIds) {
        final key = sid.toString();
        final items = (index[key] as List<dynamic>?) ?? [];
        for (final e in items) {
          try {
            final path = (e as Map<String, dynamic>)['path'] as String?;
            if (path != null) {
              final f = File(path);
              if (await f.exists()) await f.delete();
            }
          } catch (_) {}
        }
        if (index.containsKey(key)) {
          index.remove(key);
          changed = true;
        }
        // Also remove from in-memory list
        _evidence.removeWhere((ev) => serviceIds.contains(ev.serviceId));
      }
      if (changed) {
        await file.writeAsString(json.encode(index));
      }
    } catch (_) {}
  }

  Future<void> _openOperationalSheetAndFinalize() async {
    final confirmed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceOperationalSheetPage(
          representativeService: _representativeService,
          groupedServices: _effectiveServices,
          servicesRepository: widget.repository,
          initialObservations: _observationController.text.trim(),
        ),
      ),
    );

    if (confirmed != true) {
      return;
    }

    final formatoConfirmado = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceFormatoOperacionalPage(
          representativeService: _representativeService,
          groupedServices: _effectiveServices,
          servicesRepository: widget.repository,
        ),
      ),
    );

    if (formatoConfirmado != true) {
      return;
    }

    await _completeServiceOnServer();
  }

  @override
  Widget build(BuildContext context) {
    final palette = _paletteForStatus(_representativeService.status);
    final schedule = _mergedSchedule;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Servicio en curso'),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: palette.colors,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _representativeService.client,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 24,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _mergedTitle,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 20,
                  ),
                ),
                if (_isGrouped) ...[
                  const SizedBox(height: 2),
                  Text(
                    '${_effectiveServices.length} servicios agrupados',
                    style: const TextStyle(color: Color(0xE6FFFFFF), fontWeight: FontWeight.w600),
                  ),
                ],
                if (schedule != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    schedule,
                    style: const TextStyle(
                      color: Color(0xE6FFFFFF),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  _representativeService.address ?? 'Sin direccion',
                  style: const TextStyle(color: Color(0xE6FFFFFF)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: _takePhoto,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF1E3A8A),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.camera_alt_outlined),
              label: const Text('Camara'),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Evidencias (${_evidence.length})',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          if (_evidence.isEmpty)
            const Text('Aun no hay fotos agregadas')
          else
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: _groupedEvidenceByService().entries.map((entry) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${entry.key} (${entry.value.length})',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1F3C68),
                        ),
                      ),
                      const SizedBox(height: 8),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: entry.value.length,
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemBuilder: (context, index) {
                          final item = entry.value[index];
                          return GestureDetector(
                            onTap: () => _showEvidenceDialog(item),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  Image.file(
                                    File(item.file.path),
                                    fit: BoxFit.cover,
                                  ),
                                  if ((item.description ?? '').trim().isNotEmpty)
                                    Positioned(
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                        color: Colors.black.withOpacity(0.5),
                                        child: Text(
                                          item.description!,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(color: Colors.white, fontSize: 12),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                );
              }).toList(growable: false),
            ),
          const SizedBox(height: 14),
          TextField(
            controller: _observationController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Observaciones',
              hintText: 'Detalle de lo realizado, novedades, etc.',
            ),
          ),
          const SizedBox(height: 16),
          _buildElapsedCard(),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: (_saving || _starting) ? null : _openOperationalSheetAndFinalize,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
            ),
            icon: const Icon(Icons.check_circle_outline),
            label: _saving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Finalizar servicio'),
          ),
        ],
      ),
    );
  }
}

class _EvidenceDraft {
  const _EvidenceDraft({
    required this.file,
    required this.serviceId,
    required this.serviceTitle,
    this.description,
  });

  final XFile file;
  final int serviceId;
  final String serviceTitle;
  final String? description;
}

class _StatusPalette {
  const _StatusPalette({required this.colors});

  final List<Color> colors;
}
