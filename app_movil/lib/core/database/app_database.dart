import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import 'database_constants.dart';

/// Singleton que gestiona la base de datos SQLite local para modo offline.
///
/// Uso:
/// ```dart
/// final db = await AppDatabase.instance.database;
/// ```
class AppDatabase {
  AppDatabase._();

  static final AppDatabase instance = AppDatabase._();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, DbConstants.dbName);

    return openDatabase(
      path,
      version: DbConstants.dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute(_createCachedServicesTable);
    await db.execute(_createCachedFichasTable);
    await db.execute(_createSyncQueueTable);
    await db.execute(_createCachedPhotosTable);
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Migraciones futuras irán aquí.
    // Por ahora recreamos las tablas si es necesario.
    if (oldVersion < 2) {
      // Placeholder para futura migración v2
    }
  }

  // ──────────────────────────── DDL ────────────────────────────────────────────

  static const String _createCachedServicesTable = '''
    CREATE TABLE IF NOT EXISTS ${DbConstants.tblServices} (
      ${DbConstants.colSvcId}          INTEGER PRIMARY KEY,
      ${DbConstants.colSvcDataJson}    TEXT    NOT NULL,
      ${DbConstants.colSvcFecha}       TEXT    NOT NULL,
      ${DbConstants.colSvcIdTecnico}   INTEGER NOT NULL DEFAULT 0,
      ${DbConstants.colSvcSyncedAt}    TEXT    NOT NULL
    )
  ''';

  static const String _createCachedFichasTable = '''
    CREATE TABLE IF NOT EXISTS ${DbConstants.tblFichas} (
      ${DbConstants.colFichaIdProgramacion}  INTEGER NOT NULL,
      ${DbConstants.colFichaTipo}            TEXT    NOT NULL,
      ${DbConstants.colFichaDataJson}        TEXT    NOT NULL,
      ${DbConstants.colFichaLocalDraftJson}  TEXT,
      ${DbConstants.colFichaIsDirty}         INTEGER NOT NULL DEFAULT 0,
      ${DbConstants.colFichaSyncedAt}        TEXT,
      PRIMARY KEY (${DbConstants.colFichaIdProgramacion}, ${DbConstants.colFichaTipo})
    )
  ''';

  static const String _createSyncQueueTable = '''
    CREATE TABLE IF NOT EXISTS ${DbConstants.tblSyncQueue} (
      ${DbConstants.colSyncId}             INTEGER PRIMARY KEY AUTOINCREMENT,
      ${DbConstants.colSyncOperationId}    TEXT    NOT NULL UNIQUE,
      ${DbConstants.colSyncEntityType}     TEXT    NOT NULL,
      ${DbConstants.colSyncEntityId}       INTEGER,
      ${DbConstants.colSyncMethod}         TEXT    NOT NULL,
      ${DbConstants.colSyncEndpoint}       TEXT    NOT NULL,
      ${DbConstants.colSyncPayloadJson}    TEXT    NOT NULL,
      ${DbConstants.colSyncPhotoPathsJson} TEXT,
      ${DbConstants.colSyncAttemptCount}   INTEGER NOT NULL DEFAULT 0,
      ${DbConstants.colSyncLastError}      TEXT,
      ${DbConstants.colSyncStatus}         TEXT    NOT NULL DEFAULT '${DbConstants.syncStatusPending}',
      ${DbConstants.colSyncCreatedAt}      TEXT    NOT NULL
    )
  ''';

  static const String _createCachedPhotosTable = '''
    CREATE TABLE IF NOT EXISTS ${DbConstants.tblPhotos} (
      ${DbConstants.colPhotoId}           INTEGER PRIMARY KEY AUTOINCREMENT,
      ${DbConstants.colPhotoOperationId}  TEXT    NOT NULL,
      ${DbConstants.colPhotoLocalPath}    TEXT    NOT NULL,
      ${DbConstants.colPhotoOriginalName} TEXT    NOT NULL,
      ${DbConstants.colPhotoServiceId}    INTEGER NOT NULL,
      ${DbConstants.colPhotoUploaded}     INTEGER NOT NULL DEFAULT 0
    )
  ''';

  /// Cierra la conexión (útil en tests).
  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }
}
