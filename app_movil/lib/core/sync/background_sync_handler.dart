import 'package:flutter/foundation.dart';
import 'package:workmanager/workmanager.dart';

import '../config/app_config.dart';
import '../network/api_client.dart';
import '../../modules/services/data/local/sync_queue_dao.dart';
import '../../modules/services/data/local/ficha_local_dao.dart';
import '../network/connectivity_service.dart';
import 'sync_worker.dart';

/// Nombre de la tarea periódica registrada con Workmanager.
const String kBackgroundSyncTaskName = 'qsci-sync-task';
const String kBackgroundSyncTaskId = 'syncPendingData';

/// Callback top-level que Workmanager llama desde un isolate separado.
///
/// IMPORTANTE: Debe ser una función de nivel superior (no un método de clase).
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((taskName, inputData) async {
    debugPrint('[BackgroundSync] Tarea activada: $taskName');

    if (taskName != kBackgroundSyncTaskId) return true;

    try {
      final queueDao = SyncQueueDao();
      final fichaDao = FichaLocalDao();
      final apiClient = ApiClient(baseUrl: AppConfig.apiBaseUrl);
      final connectivity = ConnectivityService();

      final isOnline = await connectivity.isOnline;
      if (!isOnline) {
        debugPrint('[BackgroundSync] Sin conexión, omitiendo sync.');
        connectivity.dispose();
        return true;
      }

      // Recuperar token guardado (inputData lo pasa main.dart)
      final token = inputData?['token'] as String? ?? '';

      final worker = SyncWorker(
        queueDao: queueDao,
        fichaDao: fichaDao,
        apiClient: apiClient,
        connectivity: connectivity,
      );

      final result = await worker.processPendingQueue(authToken: token);
      connectivity.dispose();

      debugPrint(
        '[BackgroundSync] Finalizado: synced=${result.synced}, failed=${result.failed}',
      );
      return true;
    } catch (e) {
      debugPrint('[BackgroundSync] Error: $e');
      return false;
    }
  });
}

/// Registra la tarea de sync en background usando Workmanager.
///
/// Llamar desde [main()] después de inicializar.
/// El [token] se pasa como inputData para que el isolate pueda autenticar.
Future<void> registerBackgroundSync({required String token}) async {
  await Workmanager().initialize(
    callbackDispatcher,
    isInDebugMode: kDebugMode,
  );

  await Workmanager().registerPeriodicTask(
    kBackgroundSyncTaskName,
    kBackgroundSyncTaskId,
    frequency: const Duration(minutes: 15),
    initialDelay: const Duration(minutes: 1),
    constraints: Constraints(
      networkType: NetworkType.connected,
    ),
    inputData: <String, dynamic>{
      'token': token,
    },
    existingWorkPolicy: ExistingPeriodicWorkPolicy.replace,
  );

  debugPrint('[BackgroundSync] Tarea periódica registrada (cada 15 min).');
}

/// Cancela la tarea periódica de background sync.
Future<void> cancelBackgroundSync() async {
  await Workmanager().cancelByUniqueName(kBackgroundSyncTaskName);
  debugPrint('[BackgroundSync] Tarea periódica cancelada.');
}
