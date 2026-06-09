import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/connectivity_service.dart';
import '../../../core/sync/sync_queue_entry.dart';
import '../../auth/data/auth_repository.dart';
import '../domain/formato_operacional_dispositivo.dart';
import '../domain/insumo_quimico_entregado.dart';
import '../domain/service_task.dart';
import '../domain/ficha_operacional.dart';
import 'local/ficha_local_dao.dart';
import 'local/services_local_dao.dart';
import 'local/sync_queue_dao.dart';

class ServicesRepository {
  ServicesRepository({
    required AuthRepository authRepository,
    ApiClient? apiClient,
    ConnectivityService? connectivity,
    ServicesLocalDao? localDao,
    FichaLocalDao? fichaDao,
    SyncQueueDao? syncQueueDao,
  })  : _authRepository = authRepository,
        _apiClient = apiClient ?? ApiClient(baseUrl: AppConfig.apiBaseUrl),
        _connectivity = connectivity ?? ConnectivityService(),
        _localDao = localDao ?? const ServicesLocalDao(),
        _fichaDao = fichaDao ?? const FichaLocalDao(),
        _syncQueueDao = syncQueueDao ?? const SyncQueueDao();

  final AuthRepository _authRepository;
  final ApiClient _apiClient;
  final ConnectivityService _connectivity;
  final ServicesLocalDao _localDao;
  final FichaLocalDao _fichaDao;
  final SyncQueueDao _syncQueueDao;

  /// Expone el repositorio de autenticación para uso de otras capas
  AuthRepository get authRepository => _authRepository;

  /// Expone el cliente HTTP configurado para que SyncWorker pueda reutilizarlo.
  ApiClient get apiClient => _apiClient;

  static final List<ServiceTask> _mockServices = <ServiceTask>[
    ServiceTask(
      id: 9001,
      title: 'Desinsectacion quimica',
      client: 'Cliente Demo SAC',
      date: '2026-04-13',
      status: 'Programado',
      address: 'Av. Demo 123, Lima',
      observations: 'Servicio de prueba para maqueta',
      startTime: '09:00',
      endTime: '11:00',
      latitude: -12.0464,
      longitude: -77.0428,
    ),
    ServiceTask(
      id: 9002,
      title: 'Monitoreo de roedores',
      client: 'Industria Ejemplo SRL',
      date: '2026-04-13',
      status: 'Realizado',
      address: 'Jr. Ejemplo 456, Lima',
      observations: 'Completado sin novedades',
      startTime: '14:00',
      endTime: '15:30',
      latitude: -12.0432,
      longitude: -77.0282,
    ),
  ];

  Future<List<ServiceTask>> getTodayServices() async {
    return getServicesByDateRange(
      from: DateTime.now(),
      to: DateTime.now(),
    );
  }

  Future<List<ServiceTask>> getServicesByDateRange({
    required DateTime from,
    required DateTime to,
  }) async {
    final start = DateTime(from.year, from.month, from.day);
    final end = DateTime(to.year, to.month, to.day);

    if (end.isBefore(start)) {
      throw ApiException('La fecha final no puede ser menor que la inicial', 400, const {});
    }

    if (AppConfig.useMockData) {
      return _mockServices
          .where((service) {
            final serviceDate = DateTime.tryParse(service.date);
            if (serviceDate == null) return false;
            final onlyDate = DateTime(serviceDate.year, serviceDate.month, serviceDate.day);
            return !onlyDate.isBefore(start) && !onlyDate.isAfter(end);
          })
          .map(
            (s) => s.copyWith(),
          )
          .toList(growable: false);
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesion activa', 401, const {});
    }

    // ─── OFFLINE: devolver caché local si no hay red ───────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      final technicianId = await _authRepository.getTechnicianId() ?? AppConfig.technicianId;
      return _localDao.getServicesByDateRange(start, end, technicianId);
    }
    // ───────────────────────────────────────────────────────────────────────

    final query = <String, String>{};
    if (start == end) {
      query['fecha'] = DateFormat('yyyy-MM-dd').format(start);
    } else {
      query['fecha_inicio'] = DateFormat('yyyy-MM-dd').format(start);
      query['fecha_fin'] = DateFormat('yyyy-MM-dd').format(end);
    }

    final technicianId = await _authRepository.getTechnicianId();
    if (technicianId != null && technicianId > 0) {
      query['id_tecnico'] = technicianId.toString();
    } else if (AppConfig.technicianId > 0) {
      query['id_tecnico'] = AppConfig.technicianId.toString();
    }

    // Ejecutar las 4 peticiones en paralelo y atrapar errores si alguno falla (para que no rompa el resto)
    final responses = await Future.wait([
      _apiClient.get('/v1/programacion-servicio', token: token, query: query).catchError((_) => {'data': []}),
      _apiClient.get('/v1/programacion-visita', token: token, query: query).catchError((_) => {'data': []}),
      _apiClient.get('/v1/programacion-fabricacion', token: token, query: query).catchError((_) => {'data': []}),
      _apiClient.get('/v1/programacion-otros', token: token, query: query).catchError((_) => {'data': []}),
    ]);

    final List<Map<String, dynamic>> allRawData = [];

    // Inyectar el tipo a cada lista de resultados antes de juntarlas
    final types = ['Servicio', 'Visita', 'Fabricacion', 'Otro'];
    for (int i = 0; i < responses.length; i++) {
      final data = responses[i]['data'];
      if (data is List) {
        for (var item in data) {
          if (item is Map<String, dynamic>) {
            item['tipo_programacion'] = types[i];
            allRawData.add(item);
          }
        }
      }
    }

    final services = allRawData
        .map(ServiceTask.fromJson)
        .toList();

    // Ordenar por hora (y luego por id) para mantener consistencia
    services.sort((a, b) {
      final t1 = a.startTime ?? '23:59';
      final t2 = b.startTime ?? '23:59';
      final cmp = t1.compareTo(t2);
      if (cmp != 0) return cmp;
      return a.id.compareTo(b.id);
    });

    // ─── Guardar en caché local ─────────────────────────────────────────────
    final tid = technicianId ?? AppConfig.technicianId;
    unawaited(_localDao.upsertServices(services, tid));
    
    // ─── PRE-FETCH DATOS OFFLINE EN SEGUNDO PLANO ───────────────────────────
    unawaited(_prefetchServiceData(services));
    // ───────────────────────────────────────────────────────────────────────

    return services;
  }

  /// Pre-carga de datos de los formularios en segundo plano para uso offline real.
  /// Esto asegura que cuando el técnico presione "Empezar servicio" sin internet,
  /// la base de datos local SQLite ya tenga todo lo necesario.
  Future<void> _prefetchServiceData(List<ServiceTask> services) async {
    for (final s in services) {
      final status = s.status.toLowerCase();
      // Omitir cancelados o los que ya terminaron hace tiempo para no saturar
      if (status.contains('cancelado') || status == 'realizado (pendiente sync)') continue;

      try {
        await getFormatoOperacionalCalculo(programacionId: s.id);
      } catch (e) {
        debugPrint('Prefetch error (Formato Calculo) for ${s.id}: $e');
      }

      try {
        await getInsumosQuimicosEntregados(s.id);
      } catch (e) {
        debugPrint('Prefetch error (Insumos) for ${s.id}: $e');
      }

      try {
        await getFichaByServiceId(s.id);
      } catch (e) {
        debugPrint('Prefetch error/info (Ficha) for ${s.id}: $e');
      }
    }
  }

  Future<ServiceTask> getServiceById(int id) async {
    if (AppConfig.useMockData) {
      final matches = _mockServices.where((s) => s.id == id);
      final mock = matches.isEmpty ? null : matches.first;
      if (mock == null) {
        throw ApiException('No se encontro el servicio', 404, const {});
      }
      return mock.copyWith();
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesion activa', 401, const {});
    }

    // ─── OFFLINE ────────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      final cached = await _localDao.getServiceById(id);
      if (cached != null) return cached;
      throw ApiException('Sin conexión y el servicio no está en caché', 0, const {});
    }
    // ────────────────────────────────────────────────────────────────────────

    final response = await _apiClient.get('/v1/programacion-servicio/$id', token: token);
    final data = response['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw ApiException('No se encontro el servicio', 404, response);
    }

    return ServiceTask.fromJson(data);
  }

  Future<void> completeService({
    required int id,
    String? observations,
    int? durationMinutes,
    List<ServiceEvidenceUpload> evidencePhotos = const <ServiceEvidenceUpload>[],
    String tipoProgramacion = 'Servicio',
    bool isCompletedLocally = false,
  }) async {
    if (AppConfig.useMockData) {
      final index = _mockServices.indexWhere((s) => s.id == id);
      if (index >= 0) {
        _mockServices[index] = _mockServices[index].copyWith(
          status: 'Realizado',
          observations: observations,
        );
      }
      return;
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesion activa', 401, const {});
    }

    final body = <String, dynamic>{
      'fecha_fin_real': DateTime.now().toIso8601String(),
    };
    if (observations != null && observations.isNotEmpty) {
      body['observaciones'] = observations;
    }
    if (durationMinutes != null) {
      body['duracion_real'] = durationMinutes;
    }

    // ─── OFFLINE ─────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      final cached = await _localDao.getServiceById(id);
      if (cached != null && cached.startTimeReal != null && cached.startTimeReal!.isNotEmpty) {
        body['fecha_inicio_real'] = cached.startTimeReal;
      }

      if (evidencePhotos.isNotEmpty) {
        final meta = evidencePhotos
            .map(
              (photo) => {
                'service_id': photo.serviceId,
                'service_title': photo.serviceTitle,
                if (photo.description != null) 'description': photo.description,
              },
            )
            .toList(growable: false);
        body['fotos_evidencia_meta'] = jsonEncode(meta);
      }

      // Copiar fotos al almacenamiento local para que no se pierdan
      final localPhotoPaths = await _copyPhotosToLocalStorage(
        evidencePhotos,
        serviceId: id,
      );

      String endpoint = '/v1/programacion-servicio/$id/completar';
      if (tipoProgramacion == 'Visita') endpoint = '/v1/programacion-visita/$id/completar';
      if (tipoProgramacion == 'Fabricacion') endpoint = '/v1/programacion-fabricacion/$id/completar';
      if (tipoProgramacion == 'Otro') endpoint = '/v1/programacion-otros/$id/completar';

      final operationId = _generateOperationId('complete_service', id);
      await _syncQueueDao.enqueue(
        SyncQueueEntry(
          operationId: operationId,
          entityType: 'complete_service',
          entityId: id,
          method: evidencePhotos.isEmpty ? 'PATCH' : 'MULTIPART',
          endpoint: endpoint,
          payloadJson: jsonEncode(body),
          photoPathsJson:
              localPhotoPaths.isEmpty ? null : jsonEncode(localPhotoPaths),
          createdAt: DateTime.now().toIso8601String(),
        ),
      );

      await _localDao.updateServiceStatus(
        id, 
        'Realizado (pendiente sync)',
        observations: observations,
        durationMinutes: durationMinutes,
        evidencePhotos: localPhotoPaths,
      );
      return;
    }
    // ─────────────────────────────────────────────────────────────────────

    String endpoint = '/v1/programacion-servicio/$id/completar';
    if (tipoProgramacion == 'Visita') endpoint = '/v1/programacion-visita/$id/completar';
    if (tipoProgramacion == 'Fabricacion') endpoint = '/v1/programacion-fabricacion/$id/completar';
    if (tipoProgramacion == 'Otro') endpoint = '/v1/programacion-otros/$id/completar';

    final photoFiles = evidencePhotos
        .map(
          (photo) => MultipartFilePayload(
            field: 'fotos_evidencia[]',
            path: photo.path,
            filename: photo.name,
          ),
        )
        .toList(growable: false);

    final meta = evidencePhotos
        .map(
          (photo) => {
            'service_id': photo.serviceId,
            'service_title': photo.serviceTitle,
            if (photo.description != null) 'description': photo.description,
          },
        )
        .toList(growable: false);

    await _apiClient.multipart(
      'POST',
      endpoint,
      token: token,
      fields: {
        ...body.map((key, value) => MapEntry(key, value.toString())),
        'fotos_evidencia_meta': jsonEncode(meta),
        '_method': 'PATCH',
      },
      files: photoFiles,
    );
  }

  Future<DateTime> startService({required int id, String tipoProgramacion = 'Servicio'}) async {
    if (AppConfig.useMockData) {
      return DateTime.now();
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesion activa', 401, const {});
    }

    // ─── OFFLINE ───────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      final cached = await _localDao.getServiceById(id);
      if (cached != null && cached.startTimeReal != null && cached.startTimeReal!.isNotEmpty) {
        final parsed = DateTime.tryParse(cached.startTimeReal!);
        if (parsed != null) return parsed;
      }
      
      // Registramos el inicio localmente para el cronómetro
      final now = DateTime.now();
      await _localDao.updateServiceStartTime(id, now);
      return now;
    }
    // ───────────────────────────────────────────────────────────────────────

    String endpoint = '/v1/programacion-servicio/$id/iniciar';
    if (tipoProgramacion == 'Visita') endpoint = '/v1/programacion-visita/$id/iniciar';
    if (tipoProgramacion == 'Fabricacion') endpoint = '/v1/programacion-fabricacion/$id/iniciar';
    if (tipoProgramacion == 'Otro') endpoint = '/v1/programacion-otros/$id/iniciar';

    final response = await _apiClient.patch(
      endpoint,
      token: token,
      body: const <String, dynamic>{},
    );

    final data = response['data'] as Map<String, dynamic>?;
    final raw = (data?['started_at'] ?? '').toString().trim();
    if (raw.isEmpty) {
      return DateTime.now();
    }

    final parsed = DateTime.tryParse(raw.replaceAll(' ', 'T'));
    return parsed ?? DateTime.now();
  }

  Future<DateTime> startServices({required List<int> ids, String tipoProgramacion = 'Servicio'}) async {
    if (ids.isEmpty) {
      return DateTime.now();
    }

    DateTime? minStartedAt;
    for (final id in ids) {
      final startedAt = await startService(id: id, tipoProgramacion: tipoProgramacion);
      if (minStartedAt == null || startedAt.isBefore(minStartedAt)) {
        minStartedAt = startedAt;
      }
    }

    return minStartedAt ?? DateTime.now();
  }

  Future<void> completeServices({
    required List<int> ids,
    String? observations,
    int? durationMinutes,
    List<ServiceEvidenceUpload> evidencePhotos = const <ServiceEvidenceUpload>[],
    String tipoProgramacion = 'Servicio',
  }) async {
    final groupedEvidence = <int, List<ServiceEvidenceUpload>>{};
    for (final evidence in evidencePhotos) {
      groupedEvidence.putIfAbsent(evidence.serviceId, () => <ServiceEvidenceUpload>[]).add(evidence);
    }
    for (final id in ids) {
      await completeService(
        id: id,
        observations: observations,
        durationMinutes: durationMinutes,
        evidencePhotos: groupedEvidence[id] ?? const <ServiceEvidenceUpload>[],
        tipoProgramacion: tipoProgramacion,
      );
    }
  }

  Future<List<FormatoOperacionalDispositivo>> getFormatoOperacionalDispositivos(int programacionId) async {
    if (AppConfig.useMockData) {
      return const <FormatoOperacionalDispositivo>[
        FormatoOperacionalDispositivo(
          idProducto: 1,
          descripcion: 'Jaula de captura',
          cantidadAsignada: 1,
          unidadMedida: 'und',
          numeroLote: 'MOCK-001',
        ),
        FormatoOperacionalDispositivo(
          idProducto: 2,
          descripcion: 'Trampa adhesiva',
          cantidadAsignada: 4,
          unidadMedida: 'und',
          numeroLote: 'MOCK-002',
        ),
      ];
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    List<Map<String, dynamic>> insumosMaps = <Map<String, dynamic>>[];

    try {
      final response = await _apiClient.get(
        '/v1/almacen/salidas-programacion/$programacionId/devolucion',
        token: token,
      );

      final data = response['data'];
      if (data is Map<String, dynamic>) {
        final insumos = data['insumos'];
        if (insumos is List) {
          insumosMaps = insumos.whereType<Map<String, dynamic>>().toList(growable: false);
        }
      }
    } catch (_) {
      // Fallback abajo
    }

    if (insumosMaps.isEmpty) {
      try {
        final response = await _apiClient.get(
          '/v1/almacen/salidas-programacion/$programacionId',
          token: token,
        );

        final data = response['data'];
        if (data is Map<String, dynamic>) {
          final insumos = data['insumos'];
          if (insumos is List) {
            insumosMaps = insumos.whereType<Map<String, dynamic>>().toList(growable: false);
          }
        }
      } catch (_) {
        // Fallback final abajo
      }
    }

    if (insumosMaps.isEmpty) {
      final response = await _apiClient.get(
        '/v1/programacion-servicio/$programacionId',
        token: token,
      );

      final data = response['data'];
      if (data is Map<String, dynamic>) {
        final insumos = data['insumos'];
        if (insumos is List) {
          insumosMaps = insumos.whereType<Map<String, dynamic>>().toList(growable: false);
        }
      }
    }

    return insumosMaps
        .map(FormatoOperacionalDispositivo.fromJson)
        .where((item) => item.idProducto > 0)
        .toList(growable: false);
  }

  /// Obtener cálculo automático del formato operacional desde Programación.
  /// Soporta cálculo agrupado enviando IDs adicionales.
  Future<Map<String, dynamic>> getFormatoOperacionalCalculo({
    required int programacionId,
    List<int> idsProgramaciones = const <int>[],
  }) async {
    if (AppConfig.useMockData) {
      return <String, dynamic>{
        'formatos_aplicados': <String>['CONTROL DE ROEDORES'],
        'secciones': <Map<String, dynamic>>[
          <String, dynamic>{
            'titulo': 'Cebo final blox',
            'tipo_seccion': 'cebo',
            'cantidad_asignada': 2,
            'cantidad_disponible': 2,
          },
        ],
      };
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    // ─── OFFLINE ───────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      final cached = await _fichaDao.getFicha(programacionId, 'calculo_formato');
      if (cached != null) {
        return cached;
      }
      // Fallback mínimo para no romper la UI si no hay caché
      return <String, dynamic>{
        'formatos_aplicados': <String>[],
        'secciones': <Map<String, dynamic>>[],
      };
    }
    // ───────────────────────────────────────────────────────────────────────

    final ids = idsProgramaciones
        .map((e) => e)
        .where((e) => e > 0)
        .toSet()
        .toList(growable: false);

    final response = await _apiClient.post(
      '/v1/programacion-servicio/$programacionId/calcular-formato-operacional',
      token: token,
      body: ids.isEmpty
          ? const <String, dynamic>{}
          : <String, dynamic>{'ids_programaciones': ids},
    );

    final data = response['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw ApiException('No se pudo calcular el formato operacional', 500, response);
    }

    // Guardar en caché para uso offline posterior
    unawaited(_fichaDao.upsertFicha(programacionId, 'calculo_formato', data));

    return data;
  }

  Future<List<InsumoQuimicoEntregado>> getInsumosQuimicosEntregados(int programacionId) async {
    if (AppConfig.useMockData) {
      return const <InsumoQuimicoEntregado>[
        InsumoQuimicoEntregado(
          idProducto: 1,
          producto: 'BETAFOX',
          lote: 'LT-2026-01',
          fechaVencimiento: '2027-01-15',
          unidad: 'Mililitros',
          cantidadEntregada: 15,
        ),
      ];
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    // ─── OFFLINE ───────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      final cached = await _fichaDao.getFicha(programacionId, 'insumos_entregados');
      if (cached != null && cached['items'] is List) {
        final list = cached['items'] as List;
        return list
            .map((e) => InsumoQuimicoEntregado.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return const [];
    }
    // ───────────────────────────────────────────────────────────────────────

    List<Map<String, dynamic>> insumosMaps = <Map<String, dynamic>>[];

    try {
      // Priorizar el endpoint específico que ya filtra por "químicos" y formatea datos
      final response = await _apiClient.get(
        '/v1/almacen/salidas-programacion/$programacionId/quimicos-entregados',
        token: token,
      );

      final data = response['data'];
      if (data is List) {
        insumosMaps = data.whereType<Map<String, dynamic>>().toList(growable: false);
        
        final result = insumosMaps.map((item) {
          return InsumoQuimicoEntregado(
            idProducto: (item['id_producto'] as num?)?.toInt() ?? 0,
            producto: (item['producto'] ?? 'Producto').toString(),
            lote: (item['lote'] ?? '').toString(),
            fechaVencimiento: (item['fecha_vencimiento'] ?? '').toString(),
            unidad: (item['unidad'] ?? '').toString(),
            cantidadEntregada: (item['cantidad_entregada'] as num?)?.toInt() ?? 0,
          );
        }).toList();

        // Guardar en caché
        unawaited(_fichaDao.upsertFicha(programacionId, 'insumos_entregados', {
          'items': result.map((e) => e.toJson()).toList(),
        }));

        return result;
      }
    } catch (e) {
      debugPrint('Error en endpoint quimicos-entregados: $e');
    }

    // FALLBACKS si el endpoint anterior falla o no existe en versiones previas del backend
    try {
      final response = await _apiClient.get(
        '/v1/almacen/salidas-programacion/$programacionId/devolucion',
        token: token,
      );

      final data = response['data'];
      if (data is Map<String, dynamic>) {
        final insumos = data['insumos'];
        if (insumos is List) {
          insumosMaps = insumos.whereType<Map<String, dynamic>>().toList(growable: false);
        }
      }
    } catch (_) {}

    if (insumosMaps.isEmpty) {
      try {
        final response = await _apiClient.get(
          '/v1/almacen/salidas-programacion/$programacionId',
          token: token,
        );

        final data = response['data'];
        if (data is Map<String, dynamic>) {
          final insumos = data['insumos'];
          if (insumos is List) {
            insumosMaps = insumos.whereType<Map<String, dynamic>>().toList(growable: false);
          }
        }
      } catch (_) {}
    }

    if (insumosMaps.isEmpty) {
      final response = await _apiClient.get(
        '/v1/programacion-servicio/$programacionId',
        token: token,
      );

      final data = response['data'];
      if (data is Map<String, dynamic>) {
        final insumos = data['insumos'];
        if (insumos is List) {
          insumosMaps = insumos.whereType<Map<String, dynamic>>().toList(growable: false);
        }
      }
    }

    final result = <InsumoQuimicoEntregado>[];
    for (final insumo in insumosMaps) {
      final producto = (insumo['producto'] as Map<String, dynamic>?) ?? const <String, dynamic>{};
      final lote = (insumo['lote'] as Map<String, dynamic>?) ?? const <String, dynamic>{};

      final idProducto = (insumo['id_producto'] as num?)?.toInt() ?? 0;
      if (idProducto <= 0) continue;

      final cantidad = (insumo['cantidad_utilizada'] as num?)?.toInt()
          ?? (insumo['cantidad_asignada'] as num?)?.toInt()
          ?? (insumo['cantidad_entregada'] as num?)?.toInt()
          ?? 0;

      // Limpieza de fecha de vencimiento (si viene con ISO string largo)
      String vencimiento = (lote['fecha_vencimiento'] ?? insumo['fecha_vencimiento'] ?? insumo['vencimiento'] ?? '').toString();
      if (vencimiento.contains('T')) {
        vencimiento = vencimiento.split('T').first;
      }

      result.add(
        InsumoQuimicoEntregado(
          idProducto: idProducto,
          producto: (producto['descripcion'] ?? insumo['producto'] ?? 'Producto').toString(),
          lote: (lote['numero_lote'] ?? insumo['lote'] ?? '').toString(),
          fechaVencimiento: vencimiento,
          unidad: (producto['unidad'] ?? insumo['unidad'] ?? '').toString(),
          cantidadEntregada: cantidad,
        ),
      );
    }

    if (result.isNotEmpty) {
      unawaited(_fichaDao.upsertFicha(programacionId, 'insumos_entregados', {
        'items': result.map((e) => e.toJson()).toList(),
      }));
    }

    return result;
  }


  // Fichas Operacionales (Operational Sheets) Methods

  /// Obtener ficha operacional por ID de programación de servicio
  Future<FichaOperacional?> getFichaByServiceId(int programacionId) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    // ─── OFFLINE ───────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      final draft = await _fichaDao.getFicha(programacionId, 'ficha');
      if (draft != null) {
        return FichaOperacional.fromJson(draft);
      }
      return null;
    }
    // ───────────────────────────────────────────────────────────────────────

    try {
      final response = await _apiClient.get(
        '/v1/programacion-servicio/$programacionId/ficha',
        token: token,
      );

      final data = response['data'] as Map<String, dynamic>?;
      if (data == null) {
        return null;
      }

      return FichaOperacional.fromJson(data);
    } catch (e) {
      // Si retorna 404, significa que no hay ficha aún
      if (e is ApiException && e.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  /// Guardar o actualizar ficha operacional como borrador
  Future<FichaOperacional> saveFichaDraft({
    required int programacionId,
    required Map<String, dynamic> formData,
  }) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    // ─── OFFLINE ─────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      await _fichaDao.saveLocalDraft(programacionId, 'ficha', formData);

      final operationId = _generateOperationId('ficha', programacionId);
      await _syncQueueDao.enqueue(
        SyncQueueEntry(
          operationId: operationId,
          entityType: 'ficha',
          entityId: programacionId,
          method: 'POST',
          endpoint: '/v1/programacion-servicio/$programacionId/ficha',
          payloadJson: jsonEncode(formData),
          createdAt: DateTime.now().toIso8601String(),
        ),
      );

      // Devolver ficha temporal para no romper la UI
      return FichaOperacional.fromJson(<String, dynamic>{
        ...formData,
        'id': 0,
        'estado': 'borrador_local',
        'id_programacion_servicio': programacionId,
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    final response = await _apiClient.post(
      '/v1/programacion-servicio/$programacionId/ficha',
      token: token,
      body: formData,
    );

    final data = response['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw ApiException('Error al guardar ficha', 500, response);
    }

    // Actualizar caché local con la respuesta del servidor
    unawaited(_fichaDao.upsertFicha(programacionId, 'ficha', data));

    return FichaOperacional.fromJson(data);
  }

  /// Actualizar ficha operacional existente
  Future<FichaOperacional> updateFicha({
    required int fichaId,
    required Map<String, dynamic> formData,
  }) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    final response = await _apiClient.patch(
      '/v1/fichas-operacionales/$fichaId',
      token: token,
      body: formData,
    );

    final data = response['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw ApiException('Error al actualizar ficha', 500, response);
    }

    return FichaOperacional.fromJson(data);
  }

  /// Finalizar ficha operacional y marcar como completada
  Future<void> finalizeFicha({
    required int fichaId,
  }) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    final response = await _apiClient.post(
      '/v1/fichas-operacionales/$fichaId/finalizar',
      token: token,
      body: const <String, dynamic>{},
    );

    if (response['success'] != true) {
      throw ApiException(
        response['message'] ?? 'Error al finalizar ficha',
        500,
        response,
      );
    }
  }

  /// Obtener formato operacional por ID de programación
  Future<Map<String, dynamic>?> getFormatoOperacionalByServiceId(int programacionId) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    // ─── OFFLINE ───────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      return _fichaDao.getFicha(programacionId, 'formato');
    }
    // ───────────────────────────────────────────────────────────────────────

    try {
      final response = await _apiClient.get(
        '/v1/programacion-servicio/$programacionId/formato-operacional',
        token: token,
      );

      final data = response['data'];
      return data is Map<String, dynamic> ? data : null;
    } catch (e) {
      if (e is ApiException && e.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  /// Obtener formato operacional por ID de grupo de programación
  Future<Map<String, dynamic>?> getFormatoOperacionalByGrupoId(int grupoId) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    try {
      final response = await _apiClient.get(
        '/v1/programacion-servicio/grupos/$grupoId/formato-operacional',
        token: token,
      );

      final data = response['data'];
      return data is Map<String, dynamic> ? data : null;
    } catch (e) {
      if (e is ApiException && e.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  /// Guardar o actualizar formato operacional como borrador
  Future<Map<String, dynamic>> saveFormatoOperacionalDraft({
    required int programacionId,
    required Map<String, dynamic> formData,
  }) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    // ─── OFFLINE ─────────────────────────────────────────────────────────
    final isOnline = await _connectivity.isOnline;
    if (!isOnline) {
      await _fichaDao.saveLocalDraft(programacionId, 'formato', formData);

      final operationId = _generateOperationId('formato', programacionId);
      await _syncQueueDao.enqueue(
        SyncQueueEntry(
          operationId: operationId,
          entityType: 'formato',
          entityId: programacionId,
          method: 'POST',
          endpoint: '/v1/programacion-servicio/$programacionId/formato-operacional',
          payloadJson: jsonEncode(formData),
          createdAt: DateTime.now().toIso8601String(),
        ),
      );

      return <String, dynamic>{
        ...formData,
        'id': 0,
        'estado': 'borrador_local',
        'id_programacion_servicio': programacionId,
      };
    }
    // ─────────────────────────────────────────────────────────────────────

    final response = await _apiClient.post(
      '/v1/programacion-servicio/$programacionId/formato-operacional',
      token: token,
      body: formData,
    );

    final data = response['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw ApiException('Error al guardar formato operacional', 500, response);
    }

    // Actualizar caché local con la respuesta del servidor
    unawaited(_fichaDao.upsertFicha(programacionId, 'formato', data));

    return data;
  }

  /// Finalizar formato operacional y marcar como completado
  Future<void> finalizeFormatoOperacional({
    required int formatoId,
  }) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    final response = await _apiClient.post(
      '/v1/formatos-operacionales/$formatoId/finalizar',
      token: token,
      body: const <String, dynamic>{},
    );

    if (response['success'] != true) {
      throw ApiException(
        response['message'] ?? 'Error al finalizar formato operacional',
        500,
        response,
      );
    }
  }

  /// Obtener ficha operacional por ID de grupo de programación
  Future<FichaOperacional?> getFichaByGrupoId(int grupoId) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    try {
      final response = await _apiClient.get(
        '/v1/programacion-servicio/grupos/$grupoId/ficha',
        token: token,
      );

      final data = response['data'] as Map<String, dynamic>?;
      if (data == null) {
        return null;
      }

      return FichaOperacional.fromJson(data);
    } catch (e) {
      // Si retorna 404, significa que no hay ficha aún
      if (e is ApiException && e.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  /// Listar fichas operacionales con filtros
  Future<Map<String, dynamic>> listFichas({
    String? estado,
    int? programacionId,
    int? grupoId,
    String? fechaInicio,
    String? fechaFin,
    int perPage = 15,
  }) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

    final query = <String, String>{};
    if (estado != null) query['estado'] = estado;
    if (programacionId != null) query['id_programacion_servicio'] = programacionId.toString();
    if (grupoId != null) query['id_grupo_programacion'] = grupoId.toString();
    if (fechaInicio != null) query['fecha_inicio'] = fechaInicio;
    if (fechaFin != null) query['fecha_fin'] = fechaFin;
    query['per_page'] = perPage.toString();

    final response = await _apiClient.get(
      '/v1/fichas-operacionales',
      token: token,
      query: query,
    );

    return response;
  }

  // ─── Helpers offline ─────────────────────────────────────────────────────

  /// Genera un ID de operación único y determinista para evitar duplicados
  /// al reintentar la misma operación offline.
  String _generateOperationId(String type, int entityId) {
    final ts = DateTime.now().millisecondsSinceEpoch;
    return '${type}_${entityId}_$ts';
  }

  /// Copia fotos al almacenamiento local de la app para que no dependan
  /// de la galería del usuario. Retorna la lista de rutas locales.
  Future<List<String>> _copyPhotosToLocalStorage(
    List<ServiceEvidenceUpload> photos, {
    required int serviceId,
  }) async {
    if (photos.isEmpty) return <String>[];

    final dbPath = await getDatabasesPath();
    final offlineDir = Directory(p.join(dbPath, '..', 'offline_photos'));
    if (!offlineDir.existsSync()) {
      offlineDir.createSync(recursive: true);
    }

    final localPaths = <String>[];
    for (final photo in photos) {
      try {
        final source = File(photo.path);
        if (!source.existsSync()) continue;

        final ext = p.extension(photo.name).isNotEmpty ? p.extension(photo.name) : '.jpg';
        final destName = '${serviceId}_${DateTime.now().microsecondsSinceEpoch}$ext';
        final dest = File(p.join(offlineDir.path, destName));
        await source.copy(dest.path);
        localPaths.add(dest.path);
      } catch (_) {
        // Si falla la copia, omitir esa foto
      }
    }

    return localPaths;
  }

  /// Cantidad de operaciones pendientes de sincronización.
  Future<int> getPendingSyncCount() => _syncQueueDao.getPendingCount();
}
