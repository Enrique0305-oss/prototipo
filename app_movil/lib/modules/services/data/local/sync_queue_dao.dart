import 'package:sqflite/sqflite.dart';

import '../../../../core/database/app_database.dart';
import '../../../../core/database/database_constants.dart';
import '../../../../core/sync/sync_queue_entry.dart';

/// DAO para gestionar la cola de sincronización offline en SQLite.
class SyncQueueDao {
  const SyncQueueDao();

  // ──────────────────────────── WRITE ─────────────────────────────────────────

  /// Inserta una nueva operación pendiente. Usa IGNORE si ya existe el mismo
  /// [operation_id] para evitar duplicados.
  Future<void> enqueue(SyncQueueEntry entry) async {
    final db = await AppDatabase.instance.database;

    await db.insert(
      DbConstants.tblSyncQueue,
      entry.toMap(),
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
  }

  /// Marca la operación como sincronizada y la elimina de la cola.
  Future<void> markSynced(String operationId) async {
    final db = await AppDatabase.instance.database;

    await db.delete(
      DbConstants.tblSyncQueue,
      where: '${DbConstants.colSyncOperationId} = ?',
      whereArgs: <Object>[operationId],
    );
  }

  /// Incrementa el contador de intentos y guarda el mensaje de error.
  Future<void> incrementAttempt(String operationId, String error) async {
    final db = await AppDatabase.instance.database;

    await db.rawUpdate(
      '''
      UPDATE ${DbConstants.tblSyncQueue}
      SET ${DbConstants.colSyncAttemptCount} = ${DbConstants.colSyncAttemptCount} + 1,
          ${DbConstants.colSyncLastError}    = ?
      WHERE ${DbConstants.colSyncOperationId} = ?
      ''',
      <Object>[error, operationId],
    );
  }

  /// Marca la operación como fallida permanentemente.
  Future<void> markFailed(String operationId) async {
    final db = await AppDatabase.instance.database;

    await db.update(
      DbConstants.tblSyncQueue,
      <String, dynamic>{
        DbConstants.colSyncStatus: DbConstants.syncStatusFailed,
      },
      where: '${DbConstants.colSyncOperationId} = ?',
      whereArgs: <Object>[operationId],
    );
  }

  // ──────────────────────────── READ ──────────────────────────────────────────

  /// Retorna todas las operaciones con estado 'pending', ordenadas por fecha de creación.
  Future<List<SyncQueueEntry>> getPending() async {
    final db = await AppDatabase.instance.database;

    final rows = await db.query(
      DbConstants.tblSyncQueue,
      where: '${DbConstants.colSyncStatus} = ?',
      whereArgs: <Object>[DbConstants.syncStatusPending],
      orderBy: DbConstants.colSyncCreatedAt,
    );

    return rows.map(SyncQueueEntry.fromMap).toList();
  }

  /// Retorna todas las operaciones fallidas (para mostrar al usuario).
  Future<List<SyncQueueEntry>> getFailed() async {
    final db = await AppDatabase.instance.database;

    final rows = await db.query(
      DbConstants.tblSyncQueue,
      where: '${DbConstants.colSyncStatus} = ?',
      whereArgs: <Object>[DbConstants.syncStatusFailed],
      orderBy: DbConstants.colSyncCreatedAt,
    );

    return rows.map(SyncQueueEntry.fromMap).toList();
  }

  /// Cantidad de operaciones pendientes (para mostrar en el banner).
  Future<int> getPendingCount() async {
    final db = await AppDatabase.instance.database;

    final count = Sqflite.firstIntValue(
      await db.rawQuery(
        '''
        SELECT COUNT(*) FROM ${DbConstants.tblSyncQueue}
        WHERE ${DbConstants.colSyncStatus} = ?
        ''',
        <Object>[DbConstants.syncStatusPending],
      ),
    );
    return count ?? 0;
  }

  /// Elimina todas las entradas sincronizadas o fallidas (limpieza manual).
  Future<void> clearCompleted() async {
    final db = await AppDatabase.instance.database;

    await db.delete(
      DbConstants.tblSyncQueue,
      where: '${DbConstants.colSyncStatus} != ?',
      whereArgs: <Object>[DbConstants.syncStatusPending],
    );
  }
}
