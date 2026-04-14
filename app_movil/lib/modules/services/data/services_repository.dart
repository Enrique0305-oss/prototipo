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

    if (AppConfig.technicianId > 0) {
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

    await _apiClient.patch(
      '/v1/programacion-servicio/$id/completar',
      token: token,
      body: body,
    );
  }
}
