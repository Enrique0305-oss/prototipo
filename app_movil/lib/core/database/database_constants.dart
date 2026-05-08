/// Constantes de la base de datos SQLite local (modo offline).
library;

class DbConstants {
  DbConstants._();

  static const String dbName = 'qsci_offline.db';
  static const int dbVersion = 1;

  // ────────────────────────────── cached_services ──────────────────────────────
  static const String tblServices = 'cached_services';
  static const String colSvcId = 'id';
  static const String colSvcDataJson = 'data_json';
  static const String colSvcFecha = 'fecha_servicio';
  static const String colSvcIdTecnico = 'id_tecnico';
  static const String colSvcSyncedAt = 'synced_at';

  // ────────────────────────────── cached_fichas ────────────────────────────────
  static const String tblFichas = 'cached_fichas';
  static const String colFichaIdProgramacion = 'id_programacion';
  static const String colFichaTipo = 'tipo'; // 'ficha' | 'formato'
  static const String colFichaDataJson = 'data_json';
  static const String colFichaLocalDraftJson = 'local_draft_json';
  static const String colFichaIsDirty = 'is_dirty';
  static const String colFichaSyncedAt = 'synced_at';

  // ────────────────────────────── sync_queue ───────────────────────────────────
  static const String tblSyncQueue = 'sync_queue';
  static const String colSyncId = 'id';
  static const String colSyncOperationId = 'operation_id';
  static const String colSyncEntityType = 'entity_type';
  static const String colSyncEntityId = 'entity_id';
  static const String colSyncMethod = 'method'; // POST | PATCH | MULTIPART
  static const String colSyncEndpoint = 'endpoint';
  static const String colSyncPayloadJson = 'payload_json';
  static const String colSyncPhotoPathsJson = 'photo_paths_json';
  static const String colSyncAttemptCount = 'attempt_count';
  static const String colSyncLastError = 'last_error';
  static const String colSyncStatus = 'status'; // pending | failed
  static const String colSyncCreatedAt = 'created_at';

  // Status values
  static const String syncStatusPending = 'pending';
  static const String syncStatusFailed = 'failed';
  static const String syncStatusSynced = 'synced';

  static const int maxRetryAttempts = 3;
  static const int cacheDurationDays = 7;

  // ────────────────────────────── cached_photos ────────────────────────────────
  static const String tblPhotos = 'cached_photos';
  static const String colPhotoId = 'id';
  static const String colPhotoOperationId = 'operation_id';
  static const String colPhotoLocalPath = 'local_path';
  static const String colPhotoOriginalName = 'original_name';
  static const String colPhotoServiceId = 'service_id';
  static const String colPhotoUploaded = 'uploaded';
}
