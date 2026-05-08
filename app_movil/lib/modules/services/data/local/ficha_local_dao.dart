import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import '../../../../core/database/app_database.dart';
import '../../../../core/database/database_constants.dart';

/// DAO para leer/escribir fichas y formatos operacionales en SQLite local.
class FichaLocalDao {
  const FichaLocalDao();

  // ──────────────────────────── WRITE ─────────────────────────────────────────

  /// Guarda o reemplaza la ficha/formato descargado del servidor.
  Future<void> upsertFicha(
    int programacionId,
    String tipo,
    Map<String, dynamic> data,
  ) async {
    final db = await AppDatabase.instance.database;

    await db.insert(
      DbConstants.tblFichas,
      <String, dynamic>{
        DbConstants.colFichaIdProgramacion: programacionId,
        DbConstants.colFichaTipo: tipo,
        DbConstants.colFichaDataJson: jsonEncode(data),
        DbConstants.colFichaIsDirty: 0,
        DbConstants.colFichaSyncedAt: DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Guarda un borrador local (no enviado al servidor aún).
  /// Marca la fila como dirty (pendiente de sync).
  Future<void> saveLocalDraft(
    int programacionId,
    String tipo,
    Map<String, dynamic> draft,
  ) async {
    final db = await AppDatabase.instance.database;

    // Si ya existe una fila, actualiza solo el draft
    final existing = await db.query(
      DbConstants.tblFichas,
      where:
          '${DbConstants.colFichaIdProgramacion} = ? AND ${DbConstants.colFichaTipo} = ?',
      whereArgs: <Object>[programacionId, tipo],
      limit: 1,
    );

    if (existing.isNotEmpty) {
      await db.update(
        DbConstants.tblFichas,
        <String, dynamic>{
          DbConstants.colFichaLocalDraftJson: jsonEncode(draft),
          DbConstants.colFichaIsDirty: 1,
        },
        where:
            '${DbConstants.colFichaIdProgramacion} = ? AND ${DbConstants.colFichaTipo} = ?',
        whereArgs: <Object>[programacionId, tipo],
      );
    } else {
      // Primera vez: crear fila con data_json vacío y draft lleno
      await db.insert(
        DbConstants.tblFichas,
        <String, dynamic>{
          DbConstants.colFichaIdProgramacion: programacionId,
          DbConstants.colFichaTipo: tipo,
          DbConstants.colFichaDataJson: jsonEncode(draft),
          DbConstants.colFichaLocalDraftJson: jsonEncode(draft),
          DbConstants.colFichaIsDirty: 1,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }

  /// Marca como sincronizado: limpia el draft y pone is_dirty = 0.
  Future<void> markAsSynced(int programacionId, String tipo) async {
    final db = await AppDatabase.instance.database;

    await db.update(
      DbConstants.tblFichas,
      <String, dynamic>{
        DbConstants.colFichaLocalDraftJson: null,
        DbConstants.colFichaIsDirty: 0,
        DbConstants.colFichaSyncedAt: DateTime.now().toIso8601String(),
      },
      where:
          '${DbConstants.colFichaIdProgramacion} = ? AND ${DbConstants.colFichaTipo} = ?',
      whereArgs: <Object>[programacionId, tipo],
    );
  }

  // ──────────────────────────── READ ──────────────────────────────────────────

  /// Retorna la ficha/formato cacheado. Prioriza el draft local si existe.
  Future<Map<String, dynamic>?> getFicha(
    int programacionId,
    String tipo,
  ) async {
    final db = await AppDatabase.instance.database;

    final rows = await db.query(
      DbConstants.tblFichas,
      where:
          '${DbConstants.colFichaIdProgramacion} = ? AND ${DbConstants.colFichaTipo} = ?',
      whereArgs: <Object>[programacionId, tipo],
      limit: 1,
    );

    if (rows.isEmpty) return null;

    final row = rows.first;
    final isDirty = (row[DbConstants.colFichaIsDirty] as int?) == 1;

    // Si hay draft local pendiente, devolverlo
    if (isDirty) {
      final draftJson = row[DbConstants.colFichaLocalDraftJson] as String?;
      if (draftJson != null && draftJson.isNotEmpty) {
        return jsonDecode(draftJson) as Map<String, dynamic>;
      }
    }

    // Si no, devolver el caché del servidor
    final dataJson = row[DbConstants.colFichaDataJson] as String?;
    if (dataJson == null || dataJson.isEmpty) return null;
    return jsonDecode(dataJson) as Map<String, dynamic>;
  }

  /// Retorna true si hay borradores locales sin sincronizar para el técnico.
  Future<bool> hasPendingDrafts() async {
    final db = await AppDatabase.instance.database;
    final count = Sqflite.firstIntValue(
      await db.rawQuery(
        'SELECT COUNT(*) FROM ${DbConstants.tblFichas} WHERE ${DbConstants.colFichaIsDirty} = 1',
      ),
    );
    return (count ?? 0) > 0;
  }
}
