import 'dart:async';

import 'package:flutter/foundation.dart';

import '../database/database_constants.dart';
import '../network/api_client.dart';
import '../network/connectivity_service.dart';
import 'sync_queue_entry.dart';
import '../../modules/services/data/local/sync_queue_dao.dart';
import '../../modules/services/data/local/ficha_local_dao.dart';

/// Procesa la cola de sincronización cuando la app está en foreground.
///
/// Se activa automáticamente cuando [ConnectivityService] detecta reconexión.
/// También se puede invocar manualmente con [processPendingQueue].
class SyncWorker {
  SyncWorker({
    required SyncQueueDao queueDao,
    required FichaLocalDao fichaDao,
    required ApiClient apiClient,
    required ConnectivityService connectivity,
    this.onSyncComplete,
  })  : _queueDao = queueDao,
        _fichaDao = fichaDao,
        _apiClient = apiClient,
        _connectivity = connectivity;

  final SyncQueueDao _queueDao;
  final FichaLocalDao _fichaDao;
  final ApiClient _apiClient;
  final ConnectivityService _connectivity;

  /// Callback llamado cuando termina una sesión de sync.
  final void Function(SyncResult result)? onSyncComplete;

  StreamSubscription<bool>? _connectivitySubscription;
  bool _isSyncing = false;

  /// Inicia la escucha de eventos de reconexión.
  void startListening(String? authToken) {
    _connectivitySubscription?.cancel();
    _connectivitySubscription =
        _connectivity.onlineStatusStream.listen((isOnline) {
      if (isOnline && !_isSyncing) {
        processPendingQueue(authToken: authToken);
      }
    });
  }

  void stopListening() {
    _connectivitySubscription?.cancel();
    _connectivitySubscription = null;
  }

  /// Procesa todas las entradas pendientes de la cola en orden de creación.
  /// Retorna un [SyncResult] con el resumen.
  Future<SyncResult> processPendingQueue({String? authToken}) async {
    if (_isSyncing) return const SyncResult(synced: 0, failed: 0);

    _isSyncing = true;
    int synced = 0;
    int failed = 0;
    final errors = <String>[];

    try {
      final pending = await _queueDao.getPending();

      for (final entry in pending) {
        final success = await _processEntry(entry, authToken: authToken);
        if (success) {
          synced++;
        } else {
          failed++;
          if (entry.lastError != null) {
            errors.add(entry.lastError!);
          }
        }
      }
    } catch (e) {
      debugPrint('[SyncWorker] Error procesando cola: $e');
    } finally {
      _isSyncing = false;
    }

    final result = SyncResult(synced: synced, failed: failed, errors: errors);
    onSyncComplete?.call(result);
    return result;
  }

  Future<bool> _processEntry(
    SyncQueueEntry entry, {
    String? authToken,
  }) async {
    // Reintento con backoff exponencial
    final delays = [Duration.zero, const Duration(seconds: 5), const Duration(seconds: 30)];
    final maxAttempts = DbConstants.maxRetryAttempts;

    // Si ya superó el máximo de intentos, marcar como failed
    if (entry.attemptCount >= maxAttempts) {
      await _queueDao.markFailed(entry.operationId);
      return false;
    }

    final delayIndex = entry.attemptCount.clamp(0, delays.length - 1);
    if (delays[delayIndex] > Duration.zero) {
      await Future<void>.delayed(delays[delayIndex]);
    }

    try {
      await _executeEntry(entry, authToken: authToken);
      await _queueDao.markSynced(entry.operationId);

      // Si era una ficha/formato, actualizar caché local como limpio
      if (entry.entityId != null &&
          (entry.entityType == 'ficha' || entry.entityType == 'formato')) {
        await _fichaDao.markAsSynced(entry.entityId!, entry.entityType);
      }

      return true;
    } catch (e) {
      final newAttempts = entry.attemptCount + 1;
      await _queueDao.incrementAttempt(entry.operationId, e.toString());

      if (newAttempts >= maxAttempts) {
        await _queueDao.markFailed(entry.operationId);
      }

      return false;
    }
  }

  Future<void> _executeEntry(
    SyncQueueEntry entry, {
    String? authToken,
  }) async {
    final token = authToken ?? '';

    if (entry.method == 'MULTIPART') {
      // Envío con fotos
      final photos = entry.photoPaths;
      final files = photos
          .map(
            (path) => MultipartFilePayload(
              field: 'fotos_evidencia[]',
              path: path,
              filename: path.split('/').last,
            ),
          )
          .toList();

      final payload = entry.payload;
      final fields = payload.map(
        (key, value) => MapEntry(key, value.toString()),
      );
      fields['_method'] = 'PATCH';

      await _apiClient.multipart(
        'POST',
        entry.endpoint,
        token: token,
        fields: fields,
        files: files,
      );
    } else if (entry.method == 'PATCH') {
      await _apiClient.patch(
        entry.endpoint,
        token: token,
        body: entry.payload,
      );
    } else {
      // POST
      await _apiClient.post(
        entry.endpoint,
        token: token,
        body: entry.payload,
      );
    }
  }

  void dispose() {
    stopListening();
  }
}
