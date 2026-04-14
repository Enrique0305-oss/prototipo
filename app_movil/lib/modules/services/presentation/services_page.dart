import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/domain/user_session.dart';
import '../data/services_repository.dart';
import '../domain/service_task.dart';
import 'service_detail_page.dart';

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

class _ServicesPageState extends State<ServicesPage> {
  static const Color _navy = Color(0xFF1F3C68);
  static const Color _surface = Color(0xFFF2F5FA);
  static const Color _card = Color(0xFFFFFFFF);
  static const Color _mutedText = Color(0xFF60748F);

  late Future<List<ServiceTask>> _future;
  late DateTime _fromDate;
  late DateTime _toDate;
  final DateFormat _dateFormat = DateFormat('dd/MM/yyyy');

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    _fromDate = DateTime(today.year, today.month, today.day);
    _toDate = DateTime(today.year, today.month, today.day);
    _future = widget.servicesRepository.getServicesByDateRange(
      from: _fromDate,
      to: _toDate,
    );
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

  Future<void> _openService(ServiceTask service) async {
    final updated = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceDetailPage(service: service, repository: widget.servicesRepository),
      ),
    );

    if (updated == true) {
      await _reload();
    }
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

                  return RefreshIndicator(
                    onRefresh: _reload,
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
                      itemCount: services.length,
                      itemBuilder: (context, index) {
                        final s = services[index];
                        final palette = _paletteForStatus(s.status);
                        final hasSchedule =
                            (s.startTime != null && s.startTime!.trim().isNotEmpty) ||
                            (s.endTime != null && s.endTime!.trim().isNotEmpty);
                        final schedule = hasSchedule
                            ? '${(s.startTime ?? '').trim()} - ${(s.endTime ?? '').trim()}'
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
                            onTap: () => _openService(s),
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
                                      s.isCompleted ? Icons.check : Icons.work_outline,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          s.title,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 20,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          s.client,
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          (s.address == null || s.address!.trim().isEmpty)
                                              ? 'Direccion por confirmar'
                                              : s.address!,
                                          style: const TextStyle(
                                            color: Color(0xE6FFFFFF),
                                            height: 1.3,
                                          ),
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
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: palette.badgeBackground,
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      s.status,
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
