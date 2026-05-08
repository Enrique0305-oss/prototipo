import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../core/config/app_config.dart';
import '../../../core/utils/distance_utils.dart';
import '../domain/ficha_operacional.dart';
import '../domain/service_task.dart';
import 'service_operational_sheet_page.dart';
import 'service_execution_page.dart';
import '../data/services_repository.dart';

class ServiceDetailPage extends StatefulWidget {
  const ServiceDetailPage({
    super.key,
    required this.service,
    required this.repository,
    this.groupedServices,
  });

  final ServiceTask service;
  final ServicesRepository repository;
  final List<ServiceTask>? groupedServices;

  @override
  State<ServiceDetailPage> createState() => _ServiceDetailPageState();
}

class _ServiceDetailPageState extends State<ServiceDetailPage> {
  static const Color _navy = Color(0xFF1F3C68);

  Position? _position;
  String? _locationError;
  bool _loading = true;
  bool _loadingFicha = true;
  FichaOperacional? _fichaOperacional;
  String? _fichaError;

  List<ServiceTask> get _effectiveServices {
    final grouped = widget.groupedServices;
    if (grouped != null && grouped.isNotEmpty) {
      return grouped;
    }
    return <ServiceTask>[widget.service];
  }

  bool get _isGrouped => _effectiveServices.length > 1;

  ServiceTask get _representativeService => _effectiveServices.first;

  bool get _isCompleted => _representativeService.isCompleted;

  bool get _hasFicha => _fichaOperacional != null;

  bool get _isFichaBorrador => _fichaOperacional?.isBorrador ?? false;

  String get _mergedTitle {
    final uniqueTitles = _effectiveServices
        .map((s) => s.title.trim())
        .where((t) => t.isNotEmpty)
        .toSet()
        .toList(growable: false);
    if (uniqueTitles.isEmpty) {
      return 'Servicios agrupados';
    }
    return uniqueTitles.join(' + ');
  }

  String? get _mergedSchedule {
    int? minStart;
    int? maxEnd;

    for (final s in _effectiveServices) {
      final start = _timeToMinutes(s.startTime);
      if (start != null) {
        minStart = (minStart == null || start < minStart) ? start : minStart;
      }

      final end = _timeToMinutes(s.endTime);
      if (end != null) {
        maxEnd = (maxEnd == null || end > maxEnd) ? end : maxEnd;
      }
    }

    if (minStart == null && maxEnd == null) {
      return null;
    }

    final startLabel = _minutesToHhmm(minStart ?? 0);
    final endLabel = _minutesToHhmm(maxEnd ?? minStart ?? 0);
    return '$startLabel - $endLabel';
  }

  String? get _totalTimeLabel {
    final minutes = _representativeService.durationMinutes;
    if (minutes == null || minutes <= 0) {
      return null;
    }

    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return '$hours h $mins min';
    }
    if (hours > 0) {
      return '$hours h';
    }
    return '$mins min';
  }

  String _resolvePhotoUrl(String raw) {
    final value = raw.trim();
    if (value.isEmpty) {
      return value;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    final base = AppConfig.apiBaseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    final normalized = value.startsWith('/') ? value.substring(1) : value;

    // Compatibilidad:
    // - nuevo formato: /media/...
    // - rutas de disco public: programacion-servicio/...
    // - formato legado con "public/..."
    if (normalized.startsWith('media/')) {
      return '$base/$normalized';
    }

    if (normalized.startsWith('public/')) {
      return '$base/media/${normalized.substring('public/'.length)}';
    }

    return '$base/media/$normalized';
  }

  Map<String, List<ServiceEvidence>> _groupEvidenceItems() {
    final items = _effectiveServices
        .expand((service) => service.evidenceItems)
        .toList(growable: false);
    if (items.isNotEmpty) {
      final grouped = <String, List<ServiceEvidence>>{};
      for (final item in items) {
        final key = (item.serviceTitle ?? '').trim().isNotEmpty
            ? item.serviceTitle!.trim()
            : (item.serviceId != null ? _serviceTitleById(item.serviceId!) : 'Servicio');
        grouped.putIfAbsent(key, () => <ServiceEvidence>[]).add(item);
      }
      return grouped;
    }

    final fallback = _representativeService.evidencePhotos;
    if (fallback.isEmpty) {
      return const <String, List<ServiceEvidence>>{};
    }

    return {
      _representativeService.title: fallback
          .map((path) => ServiceEvidence(path: path, serviceTitle: _representativeService.title, serviceId: _representativeService.id))
          .toList(growable: false),
    };
  }

  String _serviceTitleById(int serviceId) {
    for (final service in _effectiveServices) {
      if (service.id == serviceId) {
        return service.title;
      }
    }
    return 'Servicio #$serviceId';
  }

  String _formatCompletedAt(String? raw) {
    final value = (raw ?? '').trim();
    if (value.isEmpty) {
      return 'No registrado';
    }

    final parsed = DateTime.tryParse(value);
    if (parsed == null) {
      return value.replaceFirst('T', ' ');
    }

    final local = parsed.toLocal();
    final dd = local.day.toString().padLeft(2, '0');
    final mm = local.month.toString().padLeft(2, '0');
    final yyyy = local.year.toString();
    final hh = local.hour.toString().padLeft(2, '0');
    final min = local.minute.toString().padLeft(2, '0');
    return '$dd/$mm/$yyyy $hh:$min';
  }

  Future<void> _openCompletedDetails() async {
    final groupedEvidence = _groupEvidenceItems();
    final totalEvidences = groupedEvidence.values.fold<int>(0, (sum, list) => sum + list.length);
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return DraggableScrollableSheet(
          initialChildSize: 0.82,
          minChildSize: 0.55,
          maxChildSize: 0.95,
          builder: (context, controller) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Detalle de cierre',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  _detailRow('Servicio', _mergedTitle),
                  _detailRow('Cliente', _representativeService.client),
                  _detailRow('Estado', _representativeService.status),
                  _detailRow('Tiempo total', _totalTimeLabel ?? (_representativeService.durationMinutes != null ? '${_representativeService.durationMinutes} min' : 'No registrado')),
                  if (_mergedSchedule != null) _detailRow('Horario programado', _mergedSchedule!),
                  if ((_representativeService.completedAt ?? '').trim().isNotEmpty)
                    _detailRow('Fecha de cierre', _formatCompletedAt(_representativeService.completedAt)),
                  const SizedBox(height: 12),
                  Text(
                    'Observaciones',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    (_representativeService.observations ?? '').trim().isEmpty
                        ? 'Sin observaciones registradas.'
                        : _representativeService.observations!,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Evidencias ($totalEvidences)',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  if (groupedEvidence.isEmpty)
                    const Text('No hay imágenes registradas para este servicio.')
                  else
                    Column(
                      children: groupedEvidence.entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                entry.key,
                                style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1F3C68)),
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
                                  final evidence = entry.value[index];
                                  final url = _resolvePhotoUrl(evidence.path);
                                  return ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.network(
                                      url,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        color: const Color(0xFFF1F5F9),
                                        alignment: Alignment.center,
                                        child: const Icon(Icons.broken_image_outlined, color: Color(0xFF94A3B8)),
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
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF334155)),
            ),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(color: Color(0xFF334155))),
          ),
        ],
      ),
    );
  }

  double? get _targetLatitude {
    for (final s in _effectiveServices) {
      if (s.latitude != null) return s.latitude;
    }
    return null;
  }

  double? get _targetLongitude {
    for (final s in _effectiveServices) {
      if (s.longitude != null) return s.longitude;
    }
    return null;
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

  double? get _distanceMeters {
    if (_position == null || _targetLatitude == null || _targetLongitude == null) {
      return null;
    }

    return DistanceUtils.distanceMeters(
      fromLat: _position!.latitude,
      fromLng: _position!.longitude,
      toLat: _targetLatitude!,
      toLng: _targetLongitude!,
    );
  }

  bool get _canStart {
    final distance = _distanceMeters;
    return distance != null && distance <= AppConfig.serviceGeofenceMeters;
  }

  _StatusPalette _paletteForStatus(String status) {
    final normalized = status.toLowerCase();
    if (normalized.contains('cancel')) {
      return const _StatusPalette(
        colors: [Color(0xFFF35454), Color(0xFFE11E1E)],
        badgeBackground: Color(0x40FFFFFF),
      );
    }
    if (normalized.contains('realizado') || normalized.contains('complet')) {
      return const _StatusPalette(
        colors: [Color(0xFF18B89A), Color(0xFF12A56E)],
        badgeBackground: Color(0x40FFFFFF),
      );
    }
    if (normalized.contains('program')) {
      return const _StatusPalette(
        colors: [Color(0xFF3F7EF0), Color(0xFF2B5FDE)],
        badgeBackground: Color(0x40FFFFFF),
      );
    }
    return const _StatusPalette(
      colors: [Color(0xFF4E6283), Color(0xFF394E6D)],
      badgeBackground: Color(0x40FFFFFF),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadPosition();
    _loadFichaOperacional();
    _preFetchFormatoCalculo();
  }

  Future<void> _preFetchFormatoCalculo() async {
    // Intentar descargar el cálculo del formato para que esté en caché si se quedan sin internet luego
    try {
      final serviceIds = _effectiveServices.map((s) => s.id).toSet().toList(growable: false);
      await widget.repository.getFormatoOperacionalCalculo(
        programacionId: _representativeService.id,
        idsProgramaciones: serviceIds,
      );
    } catch (_) {
      // Fallo silencioso, es solo para caché
    }
  }

  Future<void> _loadFichaOperacional() async {
    setState(() {
      _loadingFicha = true;
      _fichaError = null;
    });

    try {
      final ficha = _isGrouped && _representativeService.groupId != null
          ? await widget.repository.getFichaByGrupoId(_representativeService.groupId!)
          : await widget.repository.getFichaByServiceId(_representativeService.id);

      if (!mounted) return;
      setState(() {
        _fichaOperacional = ficha;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _fichaError = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loadingFicha = false;
        });
      }
    }
  }

  String _formatFichaDate(String? raw) {
    final value = (raw ?? '').trim();
    if (value.isEmpty) {
      return 'No registrada';
    }

    final parsed = DateTime.tryParse(value);
    if (parsed == null) {
      return value.replaceFirst('T', ' ');
    }

    final local = parsed.toLocal();
    final dd = local.day.toString().padLeft(2, '0');
    final mm = local.month.toString().padLeft(2, '0');
    final yyyy = local.year.toString();
    return '$dd/$mm/$yyyy';
  }

  List<String> _splitValues(String? raw) {
    final value = (raw ?? '').trim();
    if (value.isEmpty) {
      return const <String>[];
    }
    return value
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList(growable: false);
  }

  Future<void> _openFichaEditor() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceOperationalSheetPage(
          representativeService: _representativeService,
          groupedServices: _effectiveServices,
          servicesRepository: widget.repository,
          initialObservations: _representativeService.observations,
        ),
      ),
    );

    if (result == true && mounted) {
      await _loadFichaOperacional();
    }
  }

  Future<void> _openFichaViewer() async {
    final ficha = _fichaOperacional;
    if (ficha == null) {
      return;
    }

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.82,
          minChildSize: 0.55,
          maxChildSize: 0.95,
          builder: (context, controller) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Ficha operacional',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 12),
                  _detailRow('Estado', ficha.estado),
                  _detailRow('Cliente', ficha.cliente ?? _representativeService.client),
                  _detailRow('Dirección', ficha.direccion ?? (_representativeService.address ?? 'No registrada')),
                  _detailRow('Fecha', _formatFichaDate(ficha.fecha)),
                  _detailRow('Hora llegada', ficha.horaLlegada ?? 'No registrada'),
                  _detailRow('Hora inicio', ficha.horaInicio ?? 'No registrada'),
                  _detailRow('Hora final', ficha.horaFinal ?? 'No registrada'),
                  _detailRow('Giro', ficha.giro ?? 'No registrado'),
                  const SizedBox(height: 12),
                  Text(
                    'Diagnóstico',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(ficha.diagnostico?.trim().isNotEmpty == true ? ficha.diagnostico! : 'Sin diagnóstico registrado.'),
                  const SizedBox(height: 12),
                  Text(
                    'Áreas tratadas',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    ficha.areasTratadas == null || ficha.areasTratadas!.isEmpty
                        ? 'Sin áreas registradas.'
                        : ficha.areasTratadas!.join(', '),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Insumos utilizados',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    ficha.insumosUtilizados == null || ficha.insumosUtilizados!.isEmpty
                        ? 'Sin insumos registrados.'
                        : '${ficha.insumosUtilizados!.length} insumo(s) cargado(s).',
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Observaciones',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(ficha.observaciones?.trim().isNotEmpty == true ? ficha.observaciones! : 'Sin observaciones.'),
                  const SizedBox(height: 16),
                  if (_isFichaBorrador)
                    FilledButton.icon(
                      onPressed: () {
                        Navigator.of(context).pop();
                        _openFichaEditor();
                      },
                      icon: const Icon(Icons.edit_outlined),
                      label: const Text('Editar borrador'),
                    )
                  else
                    const Text(
                      'La ficha ya fue completada. Solo se muestra en modo lectura.',
                      style: TextStyle(color: Color(0xFF475569)),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildFichaCard() {
    final ficha = _fichaOperacional;

    if (_loadingFicha) {
      return Container(
        margin: const EdgeInsets.only(top: 14),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: const Row(
          children: [
            SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
            SizedBox(width: 12),
            Expanded(child: Text('Buscando ficha operacional...')),
          ],
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.only(top: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.description_outlined, color: _navy),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Ficha operacional',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              if (ficha != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: _isFichaBorrador ? const Color(0xFFE0F2FE) : const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    ficha.estado,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _isFichaBorrador ? const Color(0xFF2563EB) : const Color(0xFF1E3A8A),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          if (_fichaError != null)
            Text(
              'No se pudo cargar la ficha: $_fichaError',
              style: const TextStyle(color: Colors.red),
            )
          else if (ficha == null)
            const Text('Todavía no hay una ficha guardada para este servicio.')
          else ...[
            _detailRow('Cliente', ficha.cliente ?? _representativeService.client),
            _detailRow('Fecha', _formatFichaDate(ficha.fecha)),
            _detailRow('Áreas', ficha.areasTratadas != null && ficha.areasTratadas!.isNotEmpty ? ficha.areasTratadas!.join(', ') : 'Sin áreas registradas'),
            _detailRow('Insumos', ficha.insumosUtilizados != null && ficha.insumosUtilizados!.isNotEmpty ? '${ficha.insumosUtilizados!.length} registro(s)' : 'Sin insumos registrados'),
            const SizedBox(height: 6),
            Text(
              ficha.observaciones?.trim().isNotEmpty == true
                  ? ficha.observaciones!
                  : 'Sin observaciones registradas.',
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Color(0xFF475569)),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: ficha == null ? null : _openFichaViewer,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1E3A8A),
                    side: const BorderSide(color: Color(0xFF1E3A8A)),
                  ),
                  icon: const Icon(Icons.visibility_outlined),
                  label: const Text('Ver ficha'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton.icon(
                  onPressed: ficha != null && _isFichaBorrador ? _openFichaEditor : (ficha == null ? _startService : null),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    foregroundColor: Colors.white,
                  ),
                  icon: Icon(ficha != null && _isFichaBorrador ? Icons.edit_outlined : Icons.play_arrow),
                  label: Text(
                    ficha == null
                        ? 'Crear ficha'
                        : (_isFichaBorrador ? 'Editar borrador' : 'Solo lectura'),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _loadPosition() async {
    setState(() {
      _loading = true;
      _locationError = null;
    });

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Activa el GPS para validar la ubicacion.');
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        throw Exception('Permiso de ubicacion denegado.');
      }

      final position = await Geolocator.getCurrentPosition();
      setState(() => _position = position);
    } catch (e) {
      setState(() => _locationError = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _startService() async {
    if (_isCompleted) {
      await _openCompletedDetails();
      return;
    }

    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceExecutionPage(
          service: _representativeService,
          repository: widget.repository,
          groupedServices: _isGrouped ? _effectiveServices : null,
        ),
      ),
    );

    if (result == true && mounted) {
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = _paletteForStatus(_representativeService.status);
    final schedule = _mergedSchedule;

    final servicePoint = _targetLatitude != null && _targetLongitude != null
        ? LatLng(_targetLatitude!, _targetLongitude!)
        : null;

    final techPoint = _position != null
        ? LatLng(_position!.latitude, _position!.longitude)
        : null;

    final mapCenter = techPoint ?? servicePoint;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle del servicio'),
        backgroundColor: _navy,
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
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        _mergedTitle,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: palette.badgeBackground,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        _representativeService.status,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  _representativeService.client,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
                if (_isGrouped) ...[
                  const SizedBox(height: 4),
                  Text(
                    '${_effectiveServices.length} servicios agrupados',
                    style: const TextStyle(color: Color(0xE6FFFFFF), fontWeight: FontWeight.w700),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  _representativeService.address ?? 'Sin direccion',
                  style: const TextStyle(color: Color(0xE6FFFFFF)),
                ),
                if (schedule != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    schedule,
                    style: const TextStyle(
                      color: Color(0xE6FFFFFF),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
          _buildFichaCard(),
          const SizedBox(height: 12),
          Text('Validacion por ubicacion', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (servicePoint == null)
            Text(
              'Este servicio no tiene coordenadas de destino en backend. '
              'Lat: ${_targetLatitude?.toStringAsFixed(6) ?? '-'} | '
              'Lng: ${_targetLongitude?.toStringAsFixed(6) ?? '-'}',
              style: const TextStyle(color: Colors.orange),
            )
          else
            const Text(
              'Se muestra destino y tu ubicacion actual para validar el rango de 100m.',
            ),
          const SizedBox(height: 8),
          if (mapCenter == null)
            const Text('No se pudo obtener una ubicacion valida para mostrar el mapa.')
          else
            SizedBox(
              height: 300,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: mapCenter,
                    zoom: 16,
                  ),
                  gestureRecognizers: <Factory<OneSequenceGestureRecognizer>>{
                    Factory<OneSequenceGestureRecognizer>(
                      () => EagerGestureRecognizer(),
                    ),
                  },
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  zoomControlsEnabled: true,
                  zoomGesturesEnabled: true,
                  scrollGesturesEnabled: true,
                  rotateGesturesEnabled: true,
                  tiltGesturesEnabled: false,
                  compassEnabled: true,
                  mapToolbarEnabled: false,
                  markers: {
                    if (servicePoint != null)
                      Marker(
                        markerId: const MarkerId('service-point'),
                        position: servicePoint,
                        infoWindow: const InfoWindow(title: 'Destino del servicio'),
                        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
                      ),
                    if (techPoint != null)
                      Marker(
                        markerId: const MarkerId('tech-point'),
                        position: techPoint,
                        infoWindow: const InfoWindow(title: 'Tu ubicacion actual'),
                        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
                      ),
                  },
                  circles: {
                    if (servicePoint != null)
                      Circle(
                        circleId: const CircleId('service-radius'),
                        center: servicePoint,
                        radius: AppConfig.serviceGeofenceMeters.toDouble(),
                        fillColor: Colors.green.withValues(alpha: 0.18),
                        strokeColor: Colors.green,
                        strokeWidth: 2,
                      ),
                  },
                ),
              ),
            ),
          const SizedBox(height: 10),
          if (_loading)
            const LinearProgressIndicator()
          else if (_locationError != null)
            Text(_locationError!, style: const TextStyle(color: Colors.red))
          else if (_distanceMeters != null)
            Text(
              'Distancia al punto: ${_distanceMeters!.toStringAsFixed(1)} m '
              '(limite ${AppConfig.serviceGeofenceMeters} m)',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: _canStart ? Colors.green.shade700 : Colors.orange.shade800,
              ),
            ),
          const SizedBox(height: 4),
          if (servicePoint == null)
            const Text(
              'No se puede validar el rango sin coordenadas de destino.',
              style: TextStyle(
                color: Colors.orange,
                fontWeight: FontWeight.w600,
              ),
            )
          else
            Text(
              _canStart
                  ? 'Estas dentro del rango permitido para iniciar.'
                  : 'Debes estar a 100 metros o menos del punto del servicio para iniciar.',
              style: TextStyle(
                color: _canStart ? Colors.green.shade700 : Colors.orange.shade800,
                fontWeight: FontWeight.w600,
              ),
            ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loadPosition,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1E3A8A),
                    side: const BorderSide(color: Color(0xFF1E3A8A)),
                  ),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Actualizar ubicacion'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton.icon(
                  onPressed: _isCompleted ? _openCompletedDetails : (_canStart ? _startService : null),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    foregroundColor: Colors.white,
                  ),
                  icon: Icon(_isCompleted ? Icons.visibility_outlined : Icons.play_arrow),
                  label: Text(_isCompleted ? 'Ver detalles' : 'Empezar servicio'),
                ),
              ),
            ],
          ),
          if (_isCompleted) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Servicio completado',
                    style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF166534)),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Tiempo total: ${_totalTimeLabel ?? 'No registrado'}',
                    style: const TextStyle(color: Color(0xFF166534)),
                  ),
                  if ((_representativeService.observations ?? '').trim().isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Observaciones: ${_representativeService.observations}',
                      style: const TextStyle(color: Color(0xFF166534)),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusPalette {
  const _StatusPalette({required this.colors, required this.badgeBackground});

  final List<Color> colors;
  final Color badgeBackground;
}
