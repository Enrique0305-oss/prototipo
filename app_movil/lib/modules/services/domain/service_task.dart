class ServiceTask {
  ServiceTask({
    required this.id,
    required this.title,
    required this.client,
    required this.date,
    required this.status,
    this.address,
    this.observations,
    this.startTime,
    this.endTime,
    this.latitude,
    this.longitude,
  });

  final int id;
  final String title;
  final String client;
  final String date;
  final String status;
  final String? address;
  final String? observations;
  final String? startTime;
  final String? endTime;
  final double? latitude;
  final double? longitude;

  bool get isCompleted => status.toLowerCase().contains('realizado');

  ServiceTask copyWith({
    String? status,
    String? observations,
  }) {
    return ServiceTask(
      id: id,
      title: title,
      client: client,
      date: date,
      status: status ?? this.status,
      address: address,
      observations: observations ?? this.observations,
      startTime: startTime,
      endTime: endTime,
      latitude: latitude,
      longitude: longitude,
    );
  }

  factory ServiceTask.fromJson(Map<String, dynamic> json) {
    final service = json['servicio'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final order = json['orden_servicio'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final clientMap = order['cliente'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final planta = json['planta'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final coords = _resolveCoordinates(json, planta);

    return ServiceTask(
      id: (json['id'] ?? 0) as int,
      title: (service['nombre'] ?? 'Servicio').toString(),
      client: (clientMap['nombre_empresa'] ?? 'Cliente sin nombre').toString(),
      date: (json['fecha_programada'] ?? '').toString(),
      status: (json['estado_ejecucion'] ?? 'Programado').toString(),
      address: (json['direccion_completa'] ?? '').toString(),
      observations: (json['observaciones'] ?? '').toString(),
      startTime: (json['hora_inicio'] ?? '').toString(),
      endTime: (json['hora_fin'] ?? '').toString(),
      latitude: coords.$1,
      longitude: coords.$2,
    );
  }

  static (double?, double?) _resolveCoordinates(
    Map<String, dynamic> programacion,
    Map<String, dynamic> planta,
  ) {
    final latProgramacion = _parseCoordinateValue(programacion['latitud']);
    final lngProgramacion = _parseCoordinateValue(programacion['longitud']);
    if (latProgramacion != null && lngProgramacion != null) {
      return (latProgramacion, lngProgramacion);
    }

    final latPlanta = _parseCoordinateValue(planta['latitud']);
    final lngPlanta = _parseCoordinateValue(planta['longitud']);
    if (latPlanta != null && lngPlanta != null) {
      return (latPlanta, lngPlanta);
    }

    // Prioridad: coordenadas de programacion; fallback: coordenadas de planta.
    final rawProgramacion = (programacion['coordenadas'] ?? '').toString().trim();
    if (rawProgramacion.isNotEmpty) {
      final parsed = _parseCoordinates(rawProgramacion);
      if (parsed.$1 != null && parsed.$2 != null) {
        return parsed;
      }
    }

    final rawPlanta = (planta['coordenadas'] ?? '').toString().trim();
    if (rawPlanta.isNotEmpty) {
      final parsed = _parseCoordinates(rawPlanta);
      if (parsed.$1 != null && parsed.$2 != null) {
        return parsed;
      }
    }

    return (null, null);
  }

  static double? _parseCoordinateValue(dynamic raw) {
    if (raw == null) {
      return null;
    }

    final normalized = raw.toString().trim();
    if (normalized.isEmpty) {
      return null;
    }

    return double.tryParse(normalized);
  }

  static (double?, double?) _parseCoordinates(String raw) {
    if (raw.trim().isEmpty) {
      return (null, null);
    }

    final cleaned = raw
        .replaceAll('(', ' ')
        .replaceAll(')', ' ')
        .replaceAll(';', ',')
        .trim();

    final parts = cleaned
        .split(RegExp(r'\s*,\s*|\s+'))
        .where((value) => value.trim().isNotEmpty)
        .toList(growable: false);

    if (parts.length < 2) {
      return (null, null);
    }

    final lat = double.tryParse(parts[0].trim());
    final lng = double.tryParse(parts[1].trim());
    if (lat == null || lng == null) {
      return (null, null);
    }

    // Si detectamos orden lng,lat de forma no ambigua, lo normalizamos a lat,lng.
    if (lat.abs() > 90 && lng.abs() <= 90) {
      return (lng, lat);
    }

    return (lat, lng);
  }
}
