import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

/// Servicio que expone el estado de conectividad de red en tiempo real.
///
/// Uso:
/// ```dart
/// final connectivity = ConnectivityService();
/// final online = await connectivity.isOnline;
/// connectivity.onlineStatusStream.listen((isOnline) { ... });
/// ```
class ConnectivityService {
  ConnectivityService() {
    _init();
  }

  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _controller =
      StreamController<bool>.broadcast();

  bool _isOnline = true;

  bool get isOnlineCached => _isOnline;

  Stream<bool> get onlineStatusStream => _controller.stream;

  StreamSubscription<List<ConnectivityResult>>? _subscription;

  void _init() {
    _subscription = _connectivity.onConnectivityChanged.listen(
      (List<ConnectivityResult> results) {
        final online = _resultsToOnline(results);
        if (online != _isOnline) {
          _isOnline = online;
          _controller.add(online);
        }
      },
    );
  }

  /// Comprueba el estado actual de la red (llamada real, no caché).
  Future<bool> get isOnline async {
    final results = await _connectivity.checkConnectivity();
    _isOnline = _resultsToOnline(results);
    return _isOnline;
  }

  bool _resultsToOnline(List<ConnectivityResult> results) {
    return results.any(
      (r) =>
          r == ConnectivityResult.mobile ||
          r == ConnectivityResult.wifi ||
          r == ConnectivityResult.ethernet,
    );
  }

  void dispose() {
    _subscription?.cancel();
    _controller.close();
  }
}
