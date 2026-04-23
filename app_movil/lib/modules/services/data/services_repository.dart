import 'dart:convert';

import 'package:intl/intl.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../domain/formato_operacional_dispositivo.dart';
import '../domain/service_task.dart';
import '../domain/ficha_operacional.dart';

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

    final response = await _apiClient.get(
      '/v1/almacen/salidas-programacion/$programacionId',
      token: token,
    );

    final data = response['data'];
    if (data is! Map<String, dynamic>) {
      return <FormatoOperacionalDispositivo>[];
    }

    final insumos = data['insumos'];
    if (insumos is! List) {
      return <FormatoOperacionalDispositivo>[];
    }

    return insumos
        .whereType<Map<String, dynamic>>()
        .map(FormatoOperacionalDispositivo.fromJson)
        .toList(growable: false);
  }

  // Fichas Operacionales (Operational Sheets) Methods

  /// Obtener ficha operacional por ID de programación de servicio
  Future<FichaOperacional?> getFichaByServiceId(int programacionId) async {
    final token = await _authRepository.getToken();
    if (token == null || token.isEmpty) {
      throw ApiException('No hay sesión activa', 401, const {});
    }

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

    final response = await _apiClient.post(
      '/v1/programacion-servicio/$programacionId/ficha',
      token: token,
      body: formData,
    );

    final data = response['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw ApiException('Error al guardar ficha', 500, response);
    }

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
}
