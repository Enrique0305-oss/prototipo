import 'dart:convert';

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
    this.durationMinutes,
    this.groupId,
    this.latitude,
    this.longitude,
    this.evidencePhotos = const <String>[],
    this.evidenceItems = const <ServiceEvidence>[],
    this.completedAt,
    this.areaNames = const <String>[],
    this.formatosFichas = const <String>[],
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
  final int? durationMinutes;
  final int? groupId;
  final double? latitude;
  final double? longitude;
  final List<String> evidencePhotos;
  final List<ServiceEvidence> evidenceItems;
  final String? completedAt;
  final List<String> areaNames;
  final List<String> formatosFichas;

  bool get isCompleted {
    final normalized = status.toLowerCase();
    return normalized.contains('realizado') || normalized.contains('complet');
  }

  ServiceTask copyWith({
    String? status,
    String? observations,
    List<String>? areaNames,
    List<String>? formatosFichas,
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
      durationMinutes: durationMinutes ?? this.durationMinutes,
      groupId: groupId,
      latitude: latitude,
      longitude: longitude,
      evidencePhotos: evidencePhotos,
      evidenceItems: evidenceItems,
      completedAt: completedAt ?? this.completedAt,
      areaNames: areaNames ?? this.areaNames,
      formatosFichas: formatosFichas ?? this.formatosFichas,
    );
  }

  factory ServiceTask.fromJson(Map<String, dynamic> json) {
    final service = json['servicio'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final order = json['orden_servicio'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final clientMap = order['cliente'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final planta = json['planta'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final areasList = json['areas'] as List<dynamic>? ?? [];
    final parsedAreaNames = areasList
        .map((a) {
          if (a is Map<String, dynamic>) {
            return a['nombre']?.toString().trim() ?? '';
          }
          return '';
        })
        .where((n) => n.isNotEmpty)
        .toList();
    final coords = _resolveCoordinates(json, planta);
    final formatosFichas = _parseStringList(
      json['formatos_fichas'] ?? (json['programacion_servicio'] is Map ? (json['programacion_servicio'] as Map)['formatos_fichas'] : null),
    );

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
      durationMinutes: _parseIntOrNull(json['duracion_real']),
      groupId: _parseIntOrNull(json['id_grupo_programacion']),
      latitude: coords.$1,
      longitude: coords.$2,
      evidencePhotos: _parseEvidencePhotos(json['fotos_evidencia']),
      evidenceItems: _parseEvidenceItems(json['fotos_evidencia']),
      completedAt: (json['fecha_ejecucion_real'] ?? '').toString(),
      areaNames: parsedAreaNames,
      formatosFichas: formatosFichas,
    );
  }

  static int? _parseIntOrNull(dynamic raw) {
    if (raw == null) {
      return null;
    }
    final value = int.tryParse(raw.toString());
    if (value == null || value <= 0) {
      return null;
    }
    return value;
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

  static List<String> _parseEvidencePhotos(dynamic raw) {
    if (raw == null) {
      return const <String>[];
    }

    if (raw is List) {
      return raw
          .map((item) => item.toString().trim())
          .where((item) => item.isNotEmpty)
          .toList(growable: false);
    }

    final text = raw.toString().trim();
    if (text.isEmpty) {
      return const <String>[];
    }

    try {
      final decoded = jsonDecode(text);
      if (decoded is List) {
        return decoded
            .map((item) => item.toString().trim())
            .where((item) => item.isNotEmpty)
            .toList(growable: false);
      }
    } catch (_) {
      // Fallback: soporta valores separados por coma o un solo string.
    }

    return text
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList(growable: false);
  }

  static List<ServiceEvidence> _parseEvidenceItems(dynamic raw) {
    if (raw == null) {
      return const <ServiceEvidence>[];
    }

    final List<dynamic> items;
    if (raw is List) {
      items = raw;
    } else {
      final text = raw.toString().trim();
      if (text.isEmpty) {
        return const <ServiceEvidence>[];
      }
      try {
        final decoded = jsonDecode(text);
        if (decoded is List) {
          items = decoded;
        } else {
          return const <ServiceEvidence>[];
        }
      } catch (_) {
        return const <ServiceEvidence>[];
      }
    }

    return items.map((item) {
      if (item is Map<String, dynamic>) {
        return ServiceEvidence.fromJson(item);
      }
      if (item is Map) {
        return ServiceEvidence.fromJson(Map<String, dynamic>.from(item));
      }
      return ServiceEvidence(path: item.toString().trim());
    }).where((item) => item.path.isNotEmpty).toList(growable: false);
  }

  static List<String> _parseStringList(dynamic raw) {
    if (raw == null) {
      return const <String>[];
    }

    if (raw is List) {
      return raw
          .map((item) => item.toString().trim())
          .where((item) => item.isNotEmpty)
          .toList(growable: false);
    }

    final text = raw.toString().trim();
    if (text.isEmpty) {
      return const <String>[];
    }

    try {
      final decoded = jsonDecode(text);
      if (decoded is List) {
        return decoded
            .map((item) => item.toString().trim())
            .where((item) => item.isNotEmpty)
            .toList(growable: false);
      }
    } catch (_) {
      // Fallback: soporta valores separados por coma o un solo string.
    }

    return text
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList(growable: false);
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

class ServiceEvidence {
  const ServiceEvidence({
    required this.path,
    this.serviceId,
    this.serviceTitle,
  });

  final String path;
  final int? serviceId;
  final String? serviceTitle;

  factory ServiceEvidence.fromJson(Map<String, dynamic> json) {
    return ServiceEvidence(
      path: (json['path'] ?? json['ruta'] ?? '').toString(),
      serviceId: ServiceTask._parseIntOrNull(json['service_id'] ?? json['id_servicio']),
      serviceTitle: (json['service_title'] ?? json['servicio'] ?? json['title'] ?? '').toString().trim().isEmpty
          ? null
          : (json['service_title'] ?? json['servicio'] ?? json['title']).toString(),
    );
  }
}

class ServiceEvidenceUpload {
  const ServiceEvidenceUpload({
    required this.path,
    required this.name,
    required this.serviceId,
    required this.serviceTitle,
  });

  final String path;
  final String name;
  final int serviceId;
  final String serviceTitle;
}
