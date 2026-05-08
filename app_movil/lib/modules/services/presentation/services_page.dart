import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/network/connectivity_service.dart';
import '../../../core/sync/sync_worker.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/domain/user_session.dart';
import '../data/local/ficha_local_dao.dart';
import '../data/local/sync_queue_dao.dart';
import '../data/services_repository.dart';
import '../domain/service_task.dart';
import 'service_detail_page.dart';
import 'widgets/offline_banner.dart';

class ServicesPage extends StatefulWidget {
  const ServicesPage({
    super.key,
    required this.session,
    required this.authRepository,
    required this.servicesRepository,
    required this.onLogout,
  });

  final UserSession session;
  final AuthRepository authRepository;
  final ServicesRepository servicesRepository;
  final VoidCallback onLogout;

  @override
  State<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage> with WidgetsBindingObserver {
  static const Color _navy = Color(0xFF1F3C68);
  static const Color _surface = Color(0xFFF2F5FA);
  static const Color _card = Color(0xFFFFFFFF);
  static const Color _mutedText = Color(0xFF60748F);

  late Future<List<ServiceTask>> _future;
  late DateTime _fromDate;
  late DateTime _toDate;
  final DateFormat _dateFormat = DateFormat('dd/MM/yyyy');
  Timer? _autoRefreshTimer;

  final ConnectivityService _connectivityService = ConnectivityService();
  late SyncWorker _syncWorker;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    final today = DateTime.now();
    _fromDate = DateTime(today.year, today.month, today.day);
    _toDate = DateTime(today.year, today.month, today.day);
    _future = widget.servicesRepository.getServicesByDateRange(
      from: _fromDate,
      to: _toDate,
    );
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (!mounted) return;
      _reload();
    });

    // Iniciar SyncWorker para foreground sync al recuperar conexión
    _syncWorker = SyncWorker(
      queueDao: const SyncQueueDao(),
      fichaDao: const FichaLocalDao(),
      apiClient: widget.servicesRepository.apiClient,
      connectivity: _connectivityService,
    );
    widget.authRepository.getToken().then((token) {
      _syncWorker.startListening(token);
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && mounted) {
      _reload();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _autoRefreshTimer?.cancel();
    _syncWorker.dispose();
    _connectivityService.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    setState(() {
      _future = widget.servicesRepository.getServicesByDateRange(
        from: _fromDate,
        to: _toDate,
      );
    });
    await _future;
  }

  Future<void> _selectFromDate() async {
    final selected = await showDatePicker(
      context: context,
      initialDate: _fromDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (selected == null) return;

    setState(() {
      _fromDate = DateTime(selected.year, selected.month, selected.day);
      if (_toDate.isBefore(_fromDate)) {
        _toDate = _fromDate;
      }
    });
  }

  Future<void> _selectToDate() async {
    final selected = await showDatePicker(
      context: context,
      initialDate: _toDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (selected == null) return;

    setState(() {
      _toDate = DateTime(selected.year, selected.month, selected.day);
      if (_toDate.isBefore(_fromDate)) {
        _fromDate = _toDate;
      }
    });
  }

  void _setTodayFilter() {
    final today = DateTime.now();
    setState(() {
      _fromDate = DateTime(today.year, today.month, today.day);
      _toDate = DateTime(today.year, today.month, today.day);
    });
    _reload();
  }

  Future<void> _logout() async {
    await widget.authRepository.logout();
    widget.onLogout();
  }

  Future<void> _openService(ServiceTask service, {List<ServiceTask>? groupedServices}) async {
    final updated = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceDetailPage(
          service: service,
          repository: widget.servicesRepository,
          groupedServices: groupedServices,
        ),
      ),
    );

    if (updated == true) {
      await _reload();
    }
  }

  List<_ServiceVisualItem> _buildVisualItems(List<ServiceTask> services) {
    final grouped = <String, List<ServiceTask>>{};
    final singles = <ServiceTask>[];

    for (final service in services) {
      final gid = service.groupId;
      if (gid == null || gid <= 0) {
        singles.add(service);
        continue;
      }
      final key = '${service.date}|$gid';
      grouped.putIfAbsent(key, () => <ServiceTask>[]).add(service);
    }

    final items = <_ServiceVisualItem>[];

    for (final service in singles) {
      items.add(_ServiceVisualItem.single(service));
    }

    for (final servicesInGroup in grouped.values) {
      if (servicesInGroup.length < 2) {
        items.add(_ServiceVisualItem.single(servicesInGroup.first));
        continue;
      }
      items.add(_ServiceVisualItem.group(servicesInGroup));
    }

    items.sort((a, b) {
      final dateCompare = a.date.compareTo(b.date);
      if (dateCompare != 0) return dateCompare;
      return _timeToMinutes(a.startTime).compareTo(_timeToMinutes(b.startTime));
    });

    return items;
  }

  Future<void> _openGroupDetail(_ServiceVisualItem groupItem) async {
    // Para grupos se abre directamente el detalle/mapa del servicio representativo.
    // En campo todos se ejecutan en la misma trampa/ubicación.
    await _openService(groupItem.representative, groupedServices: groupItem.services);
  }

  int _timeToMinutes(String? raw) {
    final value = (raw ?? '').trim();
    if (value.isEmpty) return 0;
    final normalized = value.contains('T') ? value.split('T').last : value;
    final hhmm = normalized.length >= 5 ? normalized.substring(0, 5) : normalized;
    final parts = hhmm.split(':');
    if (parts.length < 2) return 0;
    final h = int.tryParse(parts[0]) ?? 0;
    final m = int.tryParse(parts[1]) ?? 0;
    return (h * 60) + m;
  }

  Widget _dateFilterButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 18),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: _navy,
        backgroundColor: Colors.white,
        side: const BorderSide(color: Color(0xFFD4DDE9)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }

  _StatusPalette _paletteForStatus(String status) {
    final normalized = status.toLowerCase();
    if (normalized.contains('cancel')) {
      return const _StatusPalette(
        colors: [Color(0xFFF35454), Color(0xFFE11E1E)],
        textColor: Colors.white,
        badgeBackground: Color(0x40FFFFFF),
      );
    }
    if (normalized.contains('realizado') || normalized.contains('complet')) {
      return const _StatusPalette(
        colors: [Color(0xFF18B89A), Color(0xFF12A56E)],
        textColor: Colors.white,
        badgeBackground: Color(0x40FFFFFF),
      );
    }
    if (normalized.contains('program')) {
      return const _StatusPalette(
        colors: [Color(0xFF3F7EF0), Color(0xFF2B5FDE)],
        textColor: Colors.white,
        badgeBackground: Color(0x40FFFFFF),
      );
    }
    return const _StatusPalette(
      colors: [Color(0xFF4E6283), Color(0xFF394E6D)],
      textColor: Colors.white,
      badgeBackground: Color(0x40FFFFFF),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Servicios programados'),
        backgroundColor: _navy,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _reload,
            icon: const Icon(Icons.refresh),
            tooltip: 'Recargar',
          ),
          IconButton(
            onPressed: _logout,
            icon: const Icon(Icons.logout),
            tooltip: 'Salir',
          ),
        ],
      ),
      body: Container(
        color: _surface,
        child: Column(
          children: [
            // ─── Banner offline ───────────────────────────────────────────────
            OfflineBanner(connectivityService: _connectivityService),
            // ─────────────────────────────────────────────────────────────────
            Container(
              margin: const EdgeInsets.fromLTRB(14, 14, 14, 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFDCE4EF)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE9EFF8),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.person_outline, color: _navy),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Tecnico: ${widget.session.name} | Rol: ${widget.session.role}',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1B2A3D),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.fromLTRB(14, 0, 14, 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFDCE4EF)),
              ),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _dateFilterButton(
                    onPressed: _selectFromDate,
                    icon: Icons.date_range,
                    label: 'Desde: ${_dateFormat.format(_fromDate)}',
                  ),
                  _dateFilterButton(
                    onPressed: _selectToDate,
                    icon: Icons.event,
                    label: 'Hasta: ${_dateFormat.format(_toDate)}',
                  ),
                  FilledButton.icon(
                    onPressed: _reload,
                    icon: const Icon(Icons.filter_alt_outlined),
                    label: const Text('Aplicar'),
                    style: FilledButton.styleFrom(
                      backgroundColor: _navy,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                  TextButton.icon(
                    onPressed: _setTodayFilter,
                    icon: const Icon(Icons.today_outlined),
                    label: const Text('Hoy'),
                    style: TextButton.styleFrom(
                      foregroundColor: _navy,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: FutureBuilder<List<ServiceTask>>(
                future: _future,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Text(
                          'Error al cargar servicios: ${snapshot.error}',
                          style: const TextStyle(color: Color(0xFF3A4A5E)),
                        ),
                      ),
                    );
                  }

                  final services = snapshot.data ?? <ServiceTask>[];
                  if (services.isEmpty) {
                    return Center(
                      child: Text(
                        'No hay servicios programados del ${_dateFormat.format(_fromDate)} '
                        'al ${_dateFormat.format(_toDate)}.',
                        style: const TextStyle(color: _mutedText),
                        textAlign: TextAlign.center,
                      ),
                    );
                  }

                  final visualItems = _buildVisualItems(services);

                  return RefreshIndicator(
                    onRefresh: _reload,
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
                      itemCount: visualItems.length,
                      itemBuilder: (context, index) {
                        final item = visualItems[index];
                        final representative = item.representative;
                        final palette = _paletteForStatus(item.status);
                        final hasSchedule =
                            (item.startTime != null && item.startTime!.trim().isNotEmpty) ||
                            (item.endTime != null && item.endTime!.trim().isNotEmpty);
                        final schedule = hasSchedule
                            ? '${(item.startTime ?? '').trim()} - ${(item.endTime ?? '').trim()}'
                            : null;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: palette.colors,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x120F2744),
                                blurRadius: 12,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () async {
                              if (item.isGroup) {
                                await _openGroupDetail(item);
                                return;
                              }
                              await _openService(representative);
                            },
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 46,
                                    height: 46,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.22),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Icon(
                                      item.isGroup ? Icons.layers_outlined : (representative.isCompleted ? Icons.check : Icons.work_outline),
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item.title,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 20,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          item.client,
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          (representative.address == null || representative.address!.trim().isEmpty)
                                              ? 'Direccion por confirmar'
                                              : representative.address!,
                                          style: const TextStyle(
                                            color: Color(0xE6FFFFFF),
                                            height: 1.3,
                                          ),
                                        ),
                                        if (item.isGroup) ...[
                                          const SizedBox(height: 4),
                                          Text(
                                            '${item.services.length} servicios agrupados',
                                            style: const TextStyle(
                                              color: Color(0xE6FFFFFF),
                                              fontWeight: FontWeight.w700,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
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
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: palette.badgeBackground,
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      item.status,
                                      style: TextStyle(
                                        color: palette.textColor,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ServiceVisualItem {
  const _ServiceVisualItem._({
    required this.isGroup,
    required this.services,
  });

  factory _ServiceVisualItem.single(ServiceTask service) {
    return _ServiceVisualItem._(isGroup: false, services: <ServiceTask>[service]);
  }

  factory _ServiceVisualItem.group(List<ServiceTask> services) {
    final sorted = [...services]
      ..sort((a, b) {
        final am = _parseTimeToMinutes(a.startTime);
        final bm = _parseTimeToMinutes(b.startTime);
        return am.compareTo(bm);
      });
    return _ServiceVisualItem._(isGroup: true, services: sorted);
  }

  final bool isGroup;
  final List<ServiceTask> services;

  ServiceTask get representative => services.first;
  ServiceTask? get single => isGroup ? null : services.first;

  String get title {
    if (!isGroup) return representative.title;
    final unique = services.map((e) => e.title.trim()).where((e) => e.isNotEmpty).toSet().toList(growable: false);
    if (unique.isEmpty) return 'Servicios agrupados';
    return unique.join(' + ');
  }

  String get client => representative.client;
  String get date => representative.date;
  String get status {
    final lower = services.map((e) => e.status.toLowerCase()).toList(growable: false);
    if (lower.any((s) => s.contains('en ejec'))) return 'En Ejecucion';
    if (lower.any((s) => s.contains('en camino'))) return 'En Camino';
    if (lower.any((s) => s.contains('program'))) return 'Programado';
    return representative.status;
  }

  String? get startTime => services.map((e) => e.startTime).whereType<String>().where((e) => e.trim().isNotEmpty).fold<String?>(null, (prev, cur) {
    if (prev == null) return cur;
    return _parseTimeToMinutes(cur) < _parseTimeToMinutes(prev) ? cur : prev;
  });

  String? get endTime => services.map((e) => e.endTime).whereType<String>().where((e) => e.trim().isNotEmpty).fold<String?>(null, (prev, cur) {
    if (prev == null) return cur;
    return _parseTimeToMinutes(cur) > _parseTimeToMinutes(prev) ? cur : prev;
  });

  static int _parseTimeToMinutes(String? raw) {
    final value = (raw ?? '').trim();
    if (value.isEmpty) return 0;
    final normalized = value.contains('T') ? value.split('T').last : value;
    final hhmm = normalized.length >= 5 ? normalized.substring(0, 5) : normalized;
    final parts = hhmm.split(':');
    if (parts.length < 2) return 0;
    final h = int.tryParse(parts[0]) ?? 0;
    final m = int.tryParse(parts[1]) ?? 0;
    return (h * 60) + m;
  }
}

class _StatusPalette {
  const _StatusPalette({
    required this.colors,
    required this.textColor,
    required this.badgeBackground,
  });

  final List<Color> colors;
  final Color textColor;
  final Color badgeBackground;
}
