import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import '../../../../core/database/app_database.dart';
import '../../../../core/database/database_constants.dart';
import '../../domain/service_task.dart';

/// DAO para leer/escribir servicios en el caché SQLite local.
class ServicesLocalDao {
  const ServicesLocalDao();

  // ──────────────────────────── WRITE ─────────────────────────────────────────

  /// Inserta o reemplaza una lista de servicios en el caché.
  /// Borra registros más antiguos que [DbConstants.cacheDurationDays] días.
  Future<void> upsertServices(
    List<ServiceTask> services,
    int technicianId,
  ) async {
    final db = await AppDatabase.instance.database;
    final now = DateTime.now().toIso8601String();

    await db.transaction((txn) async {
      // Limpiar caché viejo
      final cutoff = DateTime.now()
          .subtract(const Duration(days: DbConstants.cacheDurationDays))
          .toIso8601String();

      await txn.delete(
        DbConstants.tblServices,
        where:
            '${DbConstants.colSvcSyncedAt} < ? AND ${DbConstants.colSvcIdTecnico} = ?',
        whereArgs: <Object>[cutoff, technicianId],
      );

      // Insertar/reemplazar cada servicio
      for (final service in services) {
        await txn.insert(
          DbConstants.tblServices,
          <String, dynamic>{
            DbConstants.colSvcId: service.id,
            DbConstants.colSvcDataJson: jsonEncode(service.toJson()),
            DbConstants.colSvcFecha: _normalizeDateStr(service.date),
            DbConstants.colSvcIdTecnico: technicianId,
            DbConstants.colSvcSyncedAt: now,
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    });
  }

  /// Actualiza el estado de un servicio en el caché local.
  Future<void> updateServiceStatus(int serviceId, String status) async {
    final db = await AppDatabase.instance.database;

    final row = await db.query(
      DbConstants.tblServices,
      where: '${DbConstants.colSvcId} = ?',
      whereArgs: <Object>[serviceId],
      limit: 1,
    );

    if (row.isEmpty) return;

    final current = jsonDecode(row.first[DbConstants.colSvcDataJson] as String)
        as Map<String, dynamic>;
    current['estado'] = status;

    await db.update(
      DbConstants.tblServices,
      <String, dynamic>{
        DbConstants.colSvcDataJson: jsonEncode(current),
      },
      where: '${DbConstants.colSvcId} = ?',
      whereArgs: <Object>[serviceId],
    );
  }

  // ──────────────────────────── READ ──────────────────────────────────────────

  /// Retorna servicios cacheados en el rango de fechas para el técnico.
  Future<List<ServiceTask>> getServicesByDateRange(
    DateTime from,
    DateTime to,
    int technicianId,
  ) async {
    final db = await AppDatabase.instance.database;

    final fromStr = _dateStr(from);
    final toStr = _dateStr(to);

    final rows = await db.query(
      DbConstants.tblServices,
      where:
          '${DbConstants.colSvcFecha} >= ? AND ${DbConstants.colSvcFecha} <= ? AND ${DbConstants.colSvcIdTecnico} = ?',
      whereArgs: <Object>[fromStr, toStr, technicianId],
      orderBy: DbConstants.colSvcFecha,
    );

    return rows.map((row) {
      final data = jsonDecode(row[DbConstants.colSvcDataJson] as String)
          as Map<String, dynamic>;
      return ServiceTask.fromJson(data);
    }).toList();
  }

  /// Retorna un servicio cacheado por ID.
  Future<ServiceTask?> getServiceById(int id) async {
    final db = await AppDatabase.instance.database;

    final rows = await db.query(
      DbConstants.tblServices,
      where: '${DbConstants.colSvcId} = ?',
      whereArgs: <Object>[id],
      limit: 1,
    );

    if (rows.isEmpty) return null;

    final data = jsonDecode(rows.first[DbConstants.colSvcDataJson] as String)
        as Map<String, dynamic>;
    return ServiceTask.fromJson(data);
  }

  String _dateStr(DateTime dt) =>
      '${dt.year.toString().padLeft(4, '0')}-'
      '${dt.month.toString().padLeft(2, '0')}-'
      '${dt.day.toString().padLeft(2, '0')}';

  /// Extrae solo la parte de la fecha (YYYY-MM-DD) de un string.
  String _normalizeDateStr(String date) {
    if (date.length >= 10) {
      return date.substring(0, 10);
    }
    return date;
  }
}
