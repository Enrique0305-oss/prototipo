import 'dart:convert';

import 'package:intl/intl.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../domain/service_task.dart';

class ServicesRepository {
  ServicesRepository({
    required AuthRepository authRepository,
    ApiClient? apiClient,
  })  : _authRepository = authRepository,
        _apiClient = apiClient ?? ApiClient(baseUrl: AppConfig.apiBaseUrl);

  final AuthRepository _authRepository;
  final ApiClient _apiClient;
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

    final response = await _apiClient.get('/v1/programacion-servicio', token: token, query: query);

    final data = response['data'];
    if (data is! List) {
      return <ServiceTask>[];
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map(ServiceTask.fromJson)
        .toList(growable: false);
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

    final body = <String, dynamic>{};
    if (observations != null && observations.isNotEmpty) {
      body['observaciones'] = observations;
    }
    if (durationMinutes != null) {
      body['duracion_real'] = durationMinutes;
    }

    if (evidencePhotos.isEmpty) {
      await _apiClient.patch(
        '/v1/programacion-servicio/$id/completar',
        token: token,
        body: body,
      );
      return;
    }

    final files = evidencePhotos
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
          },
        )
        .toList(growable: false);

    await _apiClient.multipart(
      'POST',
      '/v1/programacion-servicio/$id/completar',
      token: token,
      fields: {
        ...body.map((key, value) => MapEntry(key, value.toString())),
        'fotos_evidencia_meta': jsonEncode(meta),
        '_method': 'PATCH',
      },
      files: files,
    );
  }

  Future<DateTime> startService({required int id}) async {
    if (AppConfig.useMockData) {
      return DateTime.now();
    }

    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesion activa', 401, const {});
    }

    final response = await _apiClient.patch(
      '/v1/programacion-servicio/$id/iniciar',
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

  Future<DateTime> startServices({required List<int> ids}) async {
    if (ids.isEmpty) {
      return DateTime.now();
    }

    DateTime? minStartedAt;
    for (final id in ids) {
      final startedAt = await startService(id: id);
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
      );
    }
  }
}
