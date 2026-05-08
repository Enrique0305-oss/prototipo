import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/network/connectivity_service.dart';
import '../../data/local/sync_queue_dao.dart';

/// Banner animado que se muestra cuando no hay conexión a internet.
/// Muestra el número de operaciones pendientes de sincronización
/// y cambia a verde cuando se restablece la conexión.
class OfflineBanner extends StatefulWidget {
  const OfflineBanner({
    required this.connectivityService,
    super.key,
  });

  final ConnectivityService connectivityService;

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner>
    with SingleTickerProviderStateMixin {
  final SyncQueueDao _syncQueueDao = const SyncQueueDao();

  late AnimationController _controller;
  late Animation<double> _heightAnimation;

  bool _isOnline = true;
  bool _justReconnected = false;
  int _pendingCount = 0;
  StreamSubscription<bool>? _subscription;
  Timer? _hideTimer;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _heightAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    _initConnectivity();
  }

  Future<void> _initConnectivity() async {
    final isOnline = await widget.connectivityService.isOnline;
    if (!mounted) return;

    setState(() => _isOnline = isOnline);
    if (!isOnline) {
      _controller.forward();
      _refreshPendingCount();
    }

    _subscription = widget.connectivityService.onlineStatusStream.listen(
      (isOnline) async {
        if (!mounted) return;

        if (isOnline && !_isOnline) {
          // Acaba de reconectarse
          setState(() {
            _isOnline = true;
            _justReconnected = true;
          });
          _controller.forward();
          // Ocultar el banner verde después de 3 segundos
          _hideTimer?.cancel();
          _hideTimer = Timer(const Duration(seconds: 3), () {
            if (mounted) {
              _controller.reverse();
              setState(() => _justReconnected = false);
            }
          });
        } else if (!isOnline) {
          // Se perdió la conexión
          setState(() {
            _isOnline = false;
            _justReconnected = false;
          });
          _hideTimer?.cancel();
          _controller.forward();
          _refreshPendingCount();
        }
      },
    );
  }

  Future<void> _refreshPendingCount() async {
    final count = await _syncQueueDao.getPendingCount();
    if (mounted) {
      setState(() => _pendingCount = count);
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _hideTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizeTransition(
      sizeFactor: _heightAnimation,
      axisAlignment: -1,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        color: _justReconnected
            ? const Color(0xFF2E7D32) // verde oscuro
            : const Color(0xFFB71C1C), // rojo oscuro
        child: SafeArea(
          bottom: false,
          child: Row(
            children: [
              Icon(
                _justReconnected ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
                color: Colors.white,
                size: 18,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  child: _justReconnected
                      ? const Text(
                          'Conexión restaurada — Sincronizando datos...',
                          key: ValueKey('online'),
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        )
                      : Text(
                          _pendingCount > 0
                              ? 'Sin conexión  ·  $_pendingCount cambios pendientes de sync'
                              : 'Sin conexión  ·  Los cambios se sincronizarán al reconectarse',
                          key: const ValueKey('offline'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                ),
              ),
              if (!_justReconnected && _pendingCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$_pendingCount',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
