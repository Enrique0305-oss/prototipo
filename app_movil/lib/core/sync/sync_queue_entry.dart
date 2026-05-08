import 'dart:convert';

import '../database/database_constants.dart';

/// Representa una operación pendiente de sincronización con el backend.
class SyncQueueEntry {
  const SyncQueueEntry({
    required this.operationId,
    required this.entityType,
    required this.method,
    required this.endpoint,
    required this.payloadJson,
    this.entityId,
    this.photoPathsJson,
    this.attemptCount = 0,
    this.lastError,
    this.status = DbConstants.syncStatusPending,
    required this.createdAt,
  });

  final String operationId;
  final String entityType; // 'ficha' | 'formato' | 'complete_service'
  final int? entityId;
  final String method; // 'POST' | 'PATCH' | 'MULTIPART'
  final String endpoint;
  final String payloadJson;
  final String? photoPathsJson; // JSON array de rutas locales de fotos
  final int attemptCount;
  final String? lastError;
  final String status;
  final String createdAt;

  Map<String, dynamic> get payload =>
      jsonDecode(payloadJson) as Map<String, dynamic>;

  List<String> get photoPaths {
    if (photoPathsJson == null || photoPathsJson!.isEmpty) return <String>[];
    final decoded = jsonDecode(photoPathsJson!);
    if (decoded is List) return decoded.cast<String>();
    return <String>[];
  }

  bool get hasPhotos => photoPaths.isNotEmpty;

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      DbConstants.colSyncOperationId: operationId,
      DbConstants.colSyncEntityType: entityType,
      DbConstants.colSyncEntityId: entityId,
      DbConstants.colSyncMethod: method,
      DbConstants.colSyncEndpoint: endpoint,
      DbConstants.colSyncPayloadJson: payloadJson,
      DbConstants.colSyncPhotoPathsJson: photoPathsJson,
      DbConstants.colSyncAttemptCount: attemptCount,
      DbConstants.colSyncLastError: lastError,
      DbConstants.colSyncStatus: status,
      DbConstants.colSyncCreatedAt: createdAt,
    };
  }

  factory SyncQueueEntry.fromMap(Map<String, dynamic> map) {
    return SyncQueueEntry(
      operationId:
          (map[DbConstants.colSyncOperationId] as String?) ?? '',
      entityType:
          (map[DbConstants.colSyncEntityType] as String?) ?? '',
      entityId: map[DbConstants.colSyncEntityId] as int?,
      method: (map[DbConstants.colSyncMethod] as String?) ?? 'POST',
      endpoint: (map[DbConstants.colSyncEndpoint] as String?) ?? '',
      payloadJson:
          (map[DbConstants.colSyncPayloadJson] as String?) ?? '{}',
      photoPathsJson:
          map[DbConstants.colSyncPhotoPathsJson] as String?,
      attemptCount:
          (map[DbConstants.colSyncAttemptCount] as int?) ?? 0,
      lastError: map[DbConstants.colSyncLastError] as String?,
      status: (map[DbConstants.colSyncStatus] as String?) ??
          DbConstants.syncStatusPending,
      createdAt: (map[DbConstants.colSyncCreatedAt] as String?) ?? '',
    );
  }

  SyncQueueEntry copyWith({
    int? attemptCount,
    String? lastError,
    String? status,
  }) {
    return SyncQueueEntry(
      operationId: operationId,
      entityType: entityType,
      entityId: entityId,
      method: method,
      endpoint: endpoint,
      payloadJson: payloadJson,
      photoPathsJson: photoPathsJson,
      attemptCount: attemptCount ?? this.attemptCount,
      lastError: lastError ?? this.lastError,
      status: status ?? this.status,
      createdAt: createdAt,
    );
  }
}

/// Resultado de una sesión de sincronización.
class SyncResult {
  const SyncResult({
    required this.synced,
    required this.failed,
    this.errors = const <String>[],
  });

  final int synced;
  final int failed;
  final List<String> errors;

  bool get hasErrors => failed > 0;

  @override
  String toString() => 'SyncResult(synced=$synced, failed=$failed)';
}
